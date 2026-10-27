// The one place that knows which company's model Buddy talks to. Everything
// else speaks the AI SDK's provider-neutral LanguageModel, so swapping
// providers is configuration (ASSISTANT_PROVIDER, ASSISTANT_MODEL), not code.
import { APICallError, type LanguageModel } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { ASSISTANT_DEFAULT_PROVIDER, ASSISTANT_PROVIDERS, type AssistantProvider } from '../data/assistant';
import { bindingFetch, type AiBinding } from './workers-ai';

export interface ModelConfig {
  provider?: string;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  ai?: AiBinding;
}

const providerOf = (c: ModelConfig): AssistantProvider =>
  c.provider && c.provider in ASSISTANT_PROVIDERS ? (c.provider as AssistantProvider) : ASSISTANT_DEFAULT_PROVIDER;

/** Why this config can't reach a model, or null when it can. */
export function configProblem(c: ModelConfig): string | null {
  const provider = providerOf(c);
  if (provider === 'workers-ai' && !c.ai) return 'no AI binding';
  if (ASSISTANT_PROVIDERS[provider].needsKey && !c.apiKey) return 'no ASSISTANT_API_KEY';
  if (provider === 'openai-compatible' && !(c.baseUrl && c.model)) return 'no ASSISTANT_BASE_URL or ASSISTANT_MODEL';
  return null;
}

/** The error code the visitor sees: worth waiting a minute, back tomorrow, or anything else. */
export function failureCode(err: unknown) {
  // Workers AI error 4006: the free daily neurons are used up until midnight UTC.
  if (/\b4006\b|daily free allocation/i.test(String((err as Error)?.message))) return 'resting';
  return APICallError.isInstance(err) && err.statusCode === 429 ? 'busy' : 'upstream';
}

export function chatModel(c: ModelConfig): LanguageModel {
  const provider = providerOf(c);
  const model = c.model || ASSISTANT_PROVIDERS[provider].model;
  if (provider === 'anthropic') return createAnthropic({ apiKey: c.apiKey, baseURL: c.baseUrl || undefined })(model);
  const settings =
    provider === 'workers-ai'
      ? { name: 'workers-ai', baseURL: 'https://workers-ai.binding/v1', fetch: bindingFetch(c.ai!) }
      : { name: 'openai-compatible', baseURL: c.baseUrl!, apiKey: c.apiKey };
  return createOpenAICompatible({ ...settings, includeUsage: true }).chatModel(model);
}
