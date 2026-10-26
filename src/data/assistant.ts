// The site assistant ("Buddy"): model settings, conversation limits and the
// sizing rubric its price estimates come from. Estimates are hours times
// HOURLY_RATE_DKK, so the rate keeps one home in services.ts.

export const ASSISTANT_MODEL = 'claude-haiku-5-5';

export const ASSISTANT_LIMITS = {
  /** Visitor messages per conversation; after that, the contact form. */
  maxTurns: 12,
  maxMessageChars: 2000,
  maxConversationChars: 24000,
  /** Model calls per visitor message, counting the ones that only use tools. */
  maxSteps: 6,
  maxReplyTokens: 1500,
  /** A page read through get_page is cut here, so one long post can't fill the context. */
  maxPageChars: 14000,
  /**
   * Tool calls per model call, and tool output per visitor message. Every step resends
   * what earlier tools returned, so this is what keeps one question from costing dollars.
   */
  maxToolCallsPerStep: 4,
  maxToolChars: 40000,
  /** Request bodies above this are refused before parsing. */
  maxBodyBytes: 64 * 1024,
};

export const ESTIMATE_SIZES = ['small', 'medium', 'large'] as const;
export type EstimateSize = (typeof ESTIMATE_SIZES)[number];

/** Hour ranges per size; what makes a job small or large goes into the prompt as `drivers`. */
interface Rubric {
  hours: Record<EstimateSize, [number, number]>;
  drivers: string;
}

/**
 * One rubric per service id in services.ts (a test keeps them in step).
 * The hours are first guesses, to be calibrated against real jobs.
 */
export const estimateRubric: Record<string, Rubric> = {
  automation: {
    hours: { small: [6, 15], medium: [15, 40], large: [40, 100] },
    drivers: 'number of systems involved, whether they have APIs, error handling and volume',
  },
  'ai-tasks': {
    hours: { small: [10, 25], medium: [25, 60], large: [60, 140] },
    drivers: 'how many task types, data quality, how much human review the output needs',
  },
  'ai-assistant': {
    hours: { small: [15, 30], medium: [30, 70], large: [70, 160] },
    drivers: 'size and messiness of the knowledge base, integrations, languages, hand-off to people',
  },
  'ai-training': {
    hours: { small: [4, 8], medium: [8, 20], large: [20, 45] },
    drivers: 'number of sessions and participants, tailored material',
  },
  webshop: {
    hours: { small: [4, 12], medium: [12, 40], large: [40, 120] },
    drivers: 'platform and version, custom plugins, upgrade debt, integrations',
  },
  fullstack: {
    hours: { small: [20, 50], medium: [50, 150], large: [150, 400] },
    drivers: 'number of screens and roles, integrations, hosting, existing code',
  },
  mobile: {
    hours: { small: [30, 60], medium: [60, 160], large: [160, 400] },
    drivers: 'platforms, offline use, backend needs, app store publishing',
  },
  'quality-gate': {
    hours: { small: [8, 20], medium: [20, 50], large: [50, 120] },
    drivers: 'number of repos and languages, legacy volume, CI provider, team hand-over',
  },
  'ai-dev': {
    hours: { small: [6, 15], medium: [15, 40], large: [40, 90] },
    drivers: 'team size, repos to prepare, guardrails and review flow',
  },
  'ai-integration': {
    hours: { small: [15, 35], medium: [35, 90], large: [90, 220] },
    drivers: 'schema and validation needs, volume, review queues, audit requirements',
  },
  'ai-platform': {
    hours: { small: [20, 50], medium: [50, 120], large: [120, 300] },
    drivers: 'providers, routing and cost controls, evals, observability',
  },
  'agent-ready': {
    hours: { small: [6, 15], medium: [15, 35], large: [35, 80] },
    drivers: 'number of repos, existing docs and checks',
  },
  modernisation: {
    hours: { small: [15, 40], medium: [40, 120], large: [120, 350] },
    drivers: 'code size, test coverage, framework distance, deployment',
  },
  anything: {
    hours: { small: [4, 12], medium: [12, 40], large: [40, 120] },
    drivers: 'depends entirely on the task; ask what is needed',
  },
};
