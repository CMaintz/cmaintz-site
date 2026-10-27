// The site assistant (Buddy): POST a conversation, get the reply as
// server-sent events. Logic in src/lib/assistant-chat.ts.
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { ASSISTANT_API_KEY, ASSISTANT_BASE_URL, ASSISTANT_MODEL, ASSISTANT_PROVIDER } from 'astro:env/server';
import { parseChatRequest, runChat, sseEvent, type ChatEvent, type ChatSetup } from '../../lib/assistant-chat';
import { experienceFacts } from '../../lib/assistant-experience';
import { systemPrompt, visitContext } from '../../lib/assistant-prompt';
import type { PageFetcher } from '../../lib/assistant-pages';
import { chatModel, configProblem, failureCode, type ModelConfig } from '../../lib/assistant-model';
import type { AiBinding } from '../../lib/workers-ai';
import { loadCatalog } from '../../lib/content';
import { overLimit, type RateLimiter } from '../../lib/rate-limit';
import { ASSISTANT_LIMITS } from '../../data/assistant';
import type { Lang } from '../../i18n/ui';

export const prerender = false;

interface Assets {
  fetch(input: URL | Request): Promise<Response>;
}
const bindings = env as {
  ASSISTANT_LIMITER?: RateLimiter;
  ASSISTANT_GLOBAL_LIMITER?: RateLimiter;
  ASSETS?: Assets;
  AI?: AiBinding;
};

const modelConfig = (): ModelConfig => ({
  provider: ASSISTANT_PROVIDER,
  model: ASSISTANT_MODEL,
  apiKey: ASSISTANT_API_KEY,
  baseUrl: ASSISTANT_BASE_URL,
  ai: bindings.AI,
});

/** Per visitor, and a site-wide ceiling so a botnet can't run up the bill. */
const rateLimited = async (ip: string | null) =>
  (await overLimit(bindings.ASSISTANT_LIMITER, ip)) || overLimit(bindings.ASSISTANT_GLOBAL_LIMITER, 'all');

const fail = (status: number, code: string) => Response.json({ error: code }, { status });

/**
 * Markdown twins live in the static assets. Without that binding (astro dev) this
 * fetches the HTML page instead, which readPage turns down.
 */
const pageFetcher =
  (origin: URL): PageFetcher =>
  (path) =>
    bindings.ASSETS
      ? bindings.ASSETS.fetch(new URL(path, origin))
      : fetch(new URL(path.replace(/index\.md$/, ''), origin));

async function setup(origin: URL, lang: Lang, page: string, signal: AbortSignal): Promise<ChatSetup> {
  const cat = await loadCatalog(origin);
  return {
    model: chatModel(modelConfig()),
    system: systemPrompt(cat),
    visit: visitContext(lang, page),
    ctx: { catalog: cat, facts: experienceFacts(cat), fetchPage: pageFetcher(origin) },
    signal,
  };
}

type Run = (emit: (e: ChatEvent) => void, signal: AbortSignal) => Promise<void>;

const encoder = new TextEncoder();

/** Runs the chat into the stream; once the visitor has gone, nothing more is written or logged. */
async function pump(controller: ReadableStreamDefaultController<Uint8Array>, run: Run, signal: AbortSignal) {
  const emit = (e: ChatEvent) => {
    if (!signal.aborted) controller.enqueue(encoder.encode(sseEvent(e)));
  };
  try {
    await run(emit, signal);
  } catch (err) {
    if (signal.aborted) return;
    console.error('assistant:', err);
    emit({ type: 'error', code: failureCode(err) });
  }
  if (!signal.aborted) controller.close();
}

/** The reply as a byte stream. The visitor leaving cancels it, which aborts the model calls. */
function eventStream(run: Run) {
  const gone = new AbortController();
  return new ReadableStream<Uint8Array>({
    // Not awaited: start() must return so the Response can begin streaming.
    start: (controller) => void pump(controller, run, gone.signal),
    cancel: () => gone.abort(),
  });
}

/** The body as text, or null when it is larger than any real conversation. */
async function boundedBody(request: Request) {
  if (Number(request.headers.get('content-length') ?? 0) > ASSISTANT_LIMITS.maxBodyBytes) return null;
  const text = await request.text();
  return text.length > ASSISTANT_LIMITS.maxBodyBytes ? null : text;
}

const parseJson = (text: string) => {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
};

export const POST: APIRoute = async ({ request, clientAddress, url }) => {
  if (configProblem(modelConfig())) return fail(503, 'not_configured');
  if (await rateLimited(request.headers.get('cf-connecting-ip') ?? clientAddress ?? null))
    return fail(429, 'rate_limited');
  const body = await boundedBody(request);
  if (body === null) return fail(413, 'too_long');
  const chat = parseChatRequest(parseJson(body));
  if ('error' in chat) return fail(400, chat.error);
  const headers = { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store' };
  const run: Run = async (emit, signal) =>
    runChat(await setup(new URL(url.origin), chat.lang, chat.page, signal), chat.messages, emit);
  return new Response(eventStream(run), { headers });
};
