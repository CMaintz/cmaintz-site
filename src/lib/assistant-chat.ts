// One visitor message in, a streamed reply out. The browser keeps the
// conversation (text only) and sends it whole each turn, so the Worker holds
// no state. Within a turn, the model may call tools up to maxSteps times.
import type Anthropic from '@anthropic-ai/sdk';
import { ASSISTANT_LIMITS, ASSISTANT_MODEL } from '../data/assistant';
import { runTool, toolDefinitions, type ToolContext } from './assistant-tools';
import type { Inquiry } from './contact';
import { isSitePath } from './assistant-pages';
import type { Lang } from '../i18n/ui';

export interface ChatRequest {
  messages: Anthropic.MessageParam[];
  lang: Lang;
  page: string;
}

/** What the browser receives, one server-sent event each. */
export type ChatEvent =
  | { type: 'text'; delta: string }
  | { type: 'status'; tool: string }
  | { type: 'lead'; draft: Inquiry }
  | { type: 'done' }
  | { type: 'error'; code: string };

type Emit = (e: ChatEvent) => void;

export interface Turn {
  role: 'user' | 'assistant';
  content: string;
}

const isTurn = (m: unknown): m is Turn =>
  typeof m === 'object' &&
  m !== null &&
  ((m as Turn).role === 'user' || (m as Turn).role === 'assistant') &&
  typeof (m as Turn).content === 'string';

/** The problem with a conversation, or null if it can go to the model. */
function conversationError(turns: Turn[]) {
  const { maxTurns, maxMessageChars, maxConversationChars } = ASSISTANT_LIMITS;
  if (turns.length === 0 || turns[0].role !== 'user' || turns.at(-1)!.role !== 'user') return 'bad_request';
  if (turns.filter((t) => t.role === 'user').length > maxTurns) return 'too_many_turns';
  if (turns.some((t) => t.content.length > maxMessageChars || !t.content.trim())) return 'message_too_long';
  if (turns.reduce((n, t) => n + t.content.length, 0) > maxConversationChars) return 'too_long';
  return null;
}

export function parseChatRequest(body: unknown): ChatRequest | { error: string } {
  const b = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
  const turns = Array.isArray(b.messages) ? b.messages : [];
  if (!turns.every(isTurn)) return { error: 'bad_request' };
  const error = conversationError(turns);
  if (error) return { error };
  return {
    messages: turns.map((t) => ({ role: t.role, content: t.content })),
    lang: b.lang === 'da' ? 'da' : 'en',
    page: typeof b.page === 'string' && isSitePath(b.page) ? b.page : '/',
  };
}

/** One server-sent event. */
export const sseEvent = (e: ChatEvent) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`;

export interface ChatSetup {
  client: Anthropic;
  system: string;
  visit: string;
  ctx: ToolContext;
  /** Aborted when the visitor goes away, so nobody pays for a reply no one reads. */
  signal?: AbortSignal;
}

/** The stable prompt is cached; the per-visit block after it is not. */
const systemBlocks = (s: ChatSetup): Anthropic.TextBlockParam[] => [
  { type: 'text', text: s.system, cache_control: { type: 'ephemeral' } },
  { type: 'text', text: s.visit },
];

async function modelStep(s: ChatSetup, messages: Anthropic.MessageParam[], emit: Emit) {
  const params = {
    model: ASSISTANT_MODEL,
    max_tokens: ASSISTANT_LIMITS.maxReplyTokens,
    // Chat answers don't gain from deep thinking; low effort keeps replies quick and cheap.
    output_config: { effort: 'low' as const },
    system: systemBlocks(s),
    tools: toolDefinitions,
    messages,
  };
  const stream = s.client.messages.stream(params, { signal: s.signal });
  stream.on('text', (delta) => emit({ type: 'text', delta }));
  return stream.finalMessage();
}

/** Tool output still allowed this visitor message, in characters. */
interface Budget {
  chars: number;
}

const refused = (call: Anthropic.ToolUseBlock, error: string): Anthropic.ToolResultBlockParam => ({
  type: 'tool_result',
  tool_use_id: call.id,
  content: JSON.stringify({ error }),
  is_error: true,
});

async function runCall(s: ChatSetup, call: Anthropic.ToolUseBlock, emit: Emit) {
  emit({ type: 'status', tool: call.name });
  const out = await runTool(call.name, call.input, s.ctx);
  if (out.lead) emit({ type: 'lead', draft: out.lead });
  return { call, content: JSON.stringify(out.result), isError: out.isError };
}

/** Charges a result to the budget; over budget, the model gets a short error instead. */
function charge(r: Awaited<ReturnType<typeof runCall>>, budget: Budget): Anthropic.ToolResultBlockParam {
  if (r.content.length > budget.chars) return refused(r.call, 'Tool budget for this message is used up; answer now.');
  budget.chars -= r.content.length;
  return { type: 'tool_result', tool_use_id: r.call.id, content: r.content, is_error: r.isError };
}

async function toolResults(s: ChatSetup, content: Anthropic.ContentBlock[], emit: Emit, budget: Budget) {
  const calls = content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
  const max = ASSISTANT_LIMITS.maxToolCallsPerStep;
  const ran = await Promise.all(calls.slice(0, max).map((call) => runCall(s, call, emit)));
  const skipped = calls.slice(max).map((call) => refused(call, `At most ${max} tool calls at once.`));
  return [...ran.map((r) => charge(r, budget)), ...skipped];
}

/** Runs the tool loop for the latest visitor message, streaming everything through emit. */
export async function runChat(s: ChatSetup, history: Anthropic.MessageParam[], emit: Emit) {
  const messages = [...history];
  const budget: Budget = { chars: ASSISTANT_LIMITS.maxToolChars };
  for (let step = 0; step < ASSISTANT_LIMITS.maxSteps && !s.signal?.aborted; step++) {
    const reply = await modelStep(s, messages, emit);
    // The whole reply goes back, thinking blocks included, or the next step loses them.
    messages.push({ role: 'assistant', content: reply.content });
    if (reply.stop_reason === 'refusal') return emit({ type: 'error', code: 'refused' });
    if (reply.stop_reason !== 'tool_use') return emit({ type: 'done' });
    messages.push({ role: 'user', content: await toolResults(s, reply.content, emit, budget) });
  }
  emit({ type: 'error', code: 'too_many_steps' });
}
