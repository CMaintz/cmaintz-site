import type { Lang } from '../i18n/ui';

type L = Record<Lang, string>;

/** Single source for pricing: shown on /services, interpolated into the UI copy. */
export const HOURLY_RATE_DKK = 400;

const fixed = (dkk: number): L => ({
  en: `${dkk.toLocaleString('en-GB')} DKK fixed`,
  da: `${dkk.toLocaleString('da-DK')} kr. fast pris`,
});
export interface Service {
  id: string;
  glyph: string;
  title: L;
  body: L;
  deliverables: Record<Lang, string[]>;
  /** Indicative starting price, DKK ex. VAT. Placeholder - see DECISIONS.md. */
  from: L;
}

export const services: Service[] = [
  {
    id: 'quality-gate',
    glyph: '▣',
    title: { en: 'CI/CD & quality-gate setup', da: 'CI/CD & kvalitets-gates' },
    body: {
      en: 'One deterministic rule set - format, lint, types, tests, coverage, security - that runs identically in the editor, before push and in CI. Ratcheted so legacy code can adopt it on day one.',
      da: 'Ét deterministisk regelsæt - formatering, lint, typer, tests, coverage, sikkerhed - der kører ens i editoren, før push og i CI. Med ratcheting, så legacy-kode kan tage det i brug fra dag ét.',
    },
    deliverables: {
      en: [
        'GitHub Actions pipelines',
        'Pinned toolchains via mise',
        'Secret scanning & SAST',
        'Baseline + ratchet strategy',
        'Team hand-over docs',
      ],
      da: [
        'GitHub Actions-pipelines',
        'Fastlåste toolchains via mise',
        'Secret-scanning & SAST',
        'Baseline- og ratchet-strategi',
        'Overdragelsesdokumentation',
      ],
    },
    from: fixed(7000),
  },
  {
    id: 'ai-integration',
    glyph: '◈',
    title: { en: 'AI integrations', da: 'AI-integrationer' },
    body: {
      en: 'LLM features that survive production: schema-enforced output, retries and idempotency, confidence scoring, human-in-the-loop review and an audit trail. Any major LLM provider, behind an abstraction you can swap.',
      da: 'LLM-funktioner, der holder i produktion: skemabundet output, retries og idempotens, confidence-scoring, menneskelig godkendelse og audit trail. Enhver større LLM-udbyder bag en abstraktion, der kan udskiftes.',
    },
    deliverables: {
      en: [
        'Feasibility spike',
        'Prompt + model evaluation harness',
        'Async processing pipeline',
        'Guardrails & fallbacks',
        'Cost estimate',
      ],
      da: ['Feasibility-spike', 'Evaluering af prompts og modeller', 'Asynkron pipeline', 'Guardrails & fallbacks', 'Omkostningsestimat'],
    },
    from: fixed(9000),
  },
  {
    id: 'ai-dev',
    glyph: '◎',
    title: { en: 'AI-assisted development enablement', da: 'AI-assisteret udvikling' },
    body: {
      en: 'Get real leverage from coding agents without the chaos: skills, hooks and a gate the agent can’t quietly weaken, plus workflows from ticket to reviewable PR.',
      da: 'Få reel gevinst af kodeagenter uden kaos: skills, hooks og en gate agenten ikke kan svække i det stille, plus flows fra ticket til PR klar til review.',
    },
    deliverables: {
      en: ['Claude Code / Codex setup', 'Custom skills & hooks', 'AGENTS.md conventions', 'Team workshop'],
      da: ['Opsætning af Claude Code / Codex', 'Skræddersyede skills & hooks', 'AGENTS.md-konventioner', 'Workshop for teamet'],
    },
    from: fixed(4500),
  },
  {
    id: 'shopware',
    glyph: '▤',
    title: { en: 'Shopware 6 & PHP plugins', da: 'Shopware 6- & PHP-plugins' },
    body: {
      en: 'Custom Shopware 6 plugins - admin modules, storefront plugins, DAL entities, migrations, scheduled tasks and Messenger/RabbitMQ workers - built the way I built a business-critical one for WEXO.',
      da: 'Skræddersyede Shopware 6-plugins - admin-moduler, storefront-plugins, DAL-entiteter, migrationer, scheduled tasks og Messenger/RabbitMQ-workers - bygget som det forretningskritiske plugin, jeg lavede hos WEXO.',
    },
    deliverables: {
      en: ['Plugin architecture', 'Admin (Vue) & storefront (TS)', 'Tests', 'Deployment guide'],
      da: ['Plugin-arkitektur', 'Admin (Vue) & storefront (TS)', 'Tests', 'Deployment-guide'],
    },
    from: { en: 'hourly', da: 'timebasis' },
  },
  {
    id: 'fullstack',
    glyph: '▦',
    title: { en: 'Full-stack web apps', da: 'Full-stack webapps' },
    body: {
      en: 'From MVP to maintainable product: Spring Boot, .NET or Node backends with clean architecture; Angular, React, Vue or Astro frontends; Postgres with full-text and vector search.',
      da: 'Fra MVP til vedligeholdbart produkt: Spring Boot-, .NET- eller Node-backends med ren arkitektur; Angular-, React-, Vue- eller Astro-frontends; Postgres med fuldtekst- og vektorsøgning.',
    },
    deliverables: {
      en: ['Architecture & data model', 'API + frontend', 'CI/CD from day one', 'Docker-based deploy'],
      da: ['Arkitektur & datamodel', 'API + frontend', 'CI/CD fra dag ét', 'Docker-baseret deploy'],
    },
    from: { en: 'hourly or fixed', da: 'timebasis eller fast pris' },
  },
  {
    id: 'anything',
    glyph: '▢',
    title: { en: 'Everything else', da: 'Alt det andet' },
    body: {
      en: 'Mobile (Swift, Kotlin), desktop, integrations, migrations, code review, legacy rescue. If it compiles, I’m interested - ask.',
      da: 'Mobil (Swift, Kotlin), desktop, integrationer, migreringer, code review, redning af legacy. Hvis det kan kompilere, er jeg interesseret - spørg.',
    },
    deliverables: { en: [], da: [] },
    from: { en: 'hourly', da: 'timebasis' },
  },
];

export const workLanguages = ['TypeScript', 'JavaScript', 'Java', 'Kotlin', 'C#', 'PHP', 'Swift', 'Python', 'Go', 'Rust', 'SQL', 'Shell'];

export const process: Record<Lang, { step: string; body: string }[]> = {
  en: [
    { step: 'Call', body: 'Free 30 minutes to understand the problem and whether I’m the right fit.' },
    { step: 'Scope', body: 'A written proposal: deliverables, timeline, fixed price or hourly estimate.' },
    { step: 'Build', body: 'Short iterations, visible progress, everything in your repo from day one.' },
    { step: 'Hand over', body: 'Docs, a walkthrough, and code your team can own without me.' },
  ],
  da: [
    { step: 'Opkald', body: 'Gratis 30 minutter til at forstå problemet, og om jeg er det rette match.' },
    { step: 'Afgrænsning', body: 'Et skriftligt oplæg: leverancer, tidsplan, fast pris eller timeestimat.' },
    { step: 'Byg', body: 'Korte iterationer, synlige fremskridt, alt i jeres repo fra dag ét.' },
    { step: 'Overdragelse', body: 'Dokumentation, en gennemgang og kode, jeres team kan eje uden mig.' },
  ],
};
