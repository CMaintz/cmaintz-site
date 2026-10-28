// One visitor message in, a streamed reply out. The browser keeps the
// conversation (text only) and sends it whole each turn, so the Worker holds
// no state. Within a turn, the model may call tools up to maxSteps times.
import {
  jsonSchema,
  stepCountIs,
  streamText,
  tool,
  type FinishReason,
  type LanguageModel,
  type SystemModelMessage,
  type ToolSet,
} from 'ai';
import { ASSISTANT_LIMITS } from '../data/assistant';
import { runTool, toolDefinitions, type ToolContext } from './assistant-tools';
import type { Inquiry } from './contact';
import { isSitePath } from './assistant-pages';
import type { Lang } from '../i18n/ui';

export interface ChatRequest {
  messages: Turn[];
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
  model: LanguageModel;
  system: string;
  visit: string;
  ctx: ToolContext;
  /** Aborted when the visitor goes away, so nobody pays for a reply no one reads. */
  signal?: AbortSignal;
}

/**
 * Provider-specific tuning, keyed by provider so the others ignore it. Chat
 * answers don't gain from deep thinking; low effort keeps replies quick and cheap.
 */
const PROVIDER_OPTIONS = { anthropic: { effort: 'low' } };

/** The stable prompt is cached where the provider supports it; the per-visit block after it is not. */
const instructions = (s: ChatSetup): SystemModelMessage[] => [
  { role: 'system', content: s.system, providerOptions: { anthropic: { cacheControl: { type: 'ephemeral' } } } },
  { role: 'system', content: s.visit },
];

/**
 * Tool output still allowed this visitor message, in characters, and calls in
 * the current step. Every step resends earlier tool output, so these keep one
 * question from costing dollars.
 */
interface Budget {
  chars: number;
  calls: number;
}

const refusal = (error: string) => ({ error });

async function runBudgeted(s: ChatSetup, name: string, args: unknown, emit: Emit, budget: Budget) {
  const max = ASSISTANT_LIMITS.maxToolCallsPerStep;
  if (++budget.calls > max) return refusal(`At most ${max} tool calls at once.`);
  emit({ type: 'status', tool: name });
  const out = await runTool(name, args, s.ctx);
  const size = JSON.stringify(out.result).length;
  if (size > budget.chars) return refusal('Tool budget for this message is used up; answer now.');
  budget.chars -= size;
  // Only after the budget check: a refused draft must not show a card the model thinks failed.
  if (out.lead) emit({ type: 'lead', draft: out.lead });
  return out.result;
}

function siteTools(s: ChatSetup, emit: Emit, budget: Budget): ToolSet {
  const entries = toolDefinitions.map((d) => [
    d.name,
    tool({
      description: d.description,
      inputSchema: jsonSchema(d.inputSchema),
      execute: (args: unknown) => runBudgeted(s, d.name, args, emit, budget),
    }),
  ]);
  return Object.fromEntries(entries) as ToolSet;
}

function startStream(s: ChatSetup, history: Turn[], emit: Emit) {
  const budget: Budget = { chars: ASSISTANT_LIMITS.maxToolChars, calls: 0 };
  return streamText({
    model: s.model,
    instructions: instructions(s),
    messages: history,
    tools: siteTools(s, emit, budget),
    stopWhen: stepCountIs(ASSISTANT_LIMITS.maxSteps),
    prepareStep: () => {
      budget.calls = 0;
      return undefined;
    },
    maxOutputTokens: ASSISTANT_LIMITS.maxReplyTokens,
    maxRetries: 1,
    abortSignal: s.signal,
    providerOptions: PROVIDER_OPTIONS,
  });
}

/** A last step that still wanted tools means the step limit cut it off. */
const endEvent = (finish?: FinishReason): ChatEvent =>
  finish === 'content-filter'
    ? { type: 'error', code: 'refused' }
    : finish === 'tool-calls'
      ? { type: 'error', code: 'too_many_steps' }
      : { type: 'done' };

/**
 * Models write en and em dashes (and non-breaking hyphens) despite the rule
 * against them; the site's voice uses plain hyphens, so they are swapped here.
 */
// An unspaced em dash joins two words ("it—just"); a bare hyphen would read as
// one word, so it gets spaces. An en dash is usually a range ("2–7"), kept tight.
const plainDashes = (text: string) =>
  text
    .replace(/(?<!\s)—(?!\s)/g, ' - ')
    .replace(/[–—]/g, '-')
    .replace(/‑/g, '-');

/** Runs the tool loop for the latest visitor message, streaming everything through emit. */
export async function runChat(s: ChatSetup, history: Turn[], emit: Emit) {
  if (s.signal?.aborted) return;
  let finish: FinishReason | undefined;
  // Reasoning and tool parts stay on the server: the visitor sees the answer only.
  for await (const part of startStream(s, history, emit).fullStream) {
    if (part.type === 'text-delta') emit({ type: 'text', delta: plainDashes(part.text) });
    else if (part.type === 'error') throw part.error;
    else if (part.type === 'finish') finish = part.finishReason;
  }
  emit(endEvent(finish));
}
