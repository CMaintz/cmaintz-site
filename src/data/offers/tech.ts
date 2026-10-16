import type { Service } from '../services';

/** Services for dev teams and tech leads. */
export const techServices: Service[] = [
  {
    id: 'quality-gate',
    audience: 'tech',
    areas: ['devops', 'dx', 'platform'],
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
    pricing: 'quote',
  },
  {
    id: 'ai-dev',
    audience: 'tech',
    areas: ['ai', 'dx'],
    glyph: '◎',
    title: { en: 'AI-assisted development enablement', da: 'AI-assisteret udvikling' },
    body: {
      en: 'Get real leverage from coding agents without the chaos: skills, hooks and a gate the agent can’t quietly weaken, plus workflows from ticket to reviewable PR.',
      da: 'Få reel gevinst af kodeagenter uden kaos: skills, hooks og en gate agenten ikke kan svække i det stille, plus flows fra ticket til PR klar til review.',
    },
    deliverables: {
      en: ['Claude Code / Codex setup', 'Custom skills & hooks', 'AGENTS.md conventions', 'Team workshop'],
      da: [
        'Opsætning af Claude Code / Codex',
        'Skræddersyede skills & hooks',
        'AGENTS.md-konventioner',
        'Workshop for teamet',
      ],
    },
    pricing: 'quote',
  },
  {
    id: 'ai-integration',
    audience: 'tech',
    areas: ['ai', 'backend'],
    glyph: '◇',
    title: { en: 'LLM features that hold up in production', da: 'LLM-funktioner, der holder i produktion' },
    body: {
      en: 'Schema-enforced output, retries and idempotency, confidence scoring, human-in-the-loop review and an audit trail. Any major LLM provider, behind an abstraction you can swap.',
      da: 'Skemabundet output, retries og idempotens, confidence-scoring, menneskelig godkendelse og audit trail. Enhver større LLM-udbyder bag en abstraktion, der kan udskiftes.',
    },
    deliverables: {
      en: [
        'Feasibility spike',
        'Prompt + model evaluation harness',
        'Async processing pipeline',
        'Guardrails & fallbacks',
        'Cost estimate',
      ],
      da: [
        'Feasibility-spike',
        'Evaluering af prompts og modeller',
        'Asynkron pipeline',
        'Guardrails & fallbacks',
        'Omkostningsestimat',
      ],
    },
    pricing: 'quote',
  },
  {
    id: 'ai-platform',
    audience: 'tech',
    areas: ['ai', 'platform'],
    glyph: '◫',
    title: { en: 'AI platform engineering', da: 'AI-platform' },
    body: {
      en: 'One shared way for every team to use LLMs: a provider-agnostic gateway with cost-aware model routing, usage and spend per team, guardrails, caching and evals, so each new AI feature starts on a paved road.',
      da: 'Én fælles vej for alle teams til at bruge LLM’er: en udbyder-agnostisk gateway med cost-aware model routing, forbrug og udgifter pr. team, guardrails, caching og evals, så hver ny AI-funktion starter på en asfalteret vej.',
    },
    deliverables: {
      en: [
        'LLM gateway & model routing',
        'Cost & usage per team',
        'Shared guardrails & evals',
        'Docs & templates for teams',
      ],
      da: [
        'LLM-gateway & model routing',
        'Omkostninger & forbrug pr. team',
        'Fælles guardrails & evals',
        'Dokumentation & skabeloner til teams',
      ],
    },
    pricing: 'quote',
  },
  {
    id: 'agent-ready',
    audience: 'tech',
    areas: ['ai', 'backend'],
    glyph: '◬',
    title: { en: 'Make your product agent-ready', da: 'Klar til AI-agenter' },
    body: {
      en: 'Let ChatGPT, Claude and other AI agents find and use your product: an MCP server, llms.txt, Markdown versions of your pages, API catalogue and structured data - the same setup this site runs.',
      da: 'Lad ChatGPT, Claude og andre AI-agenter finde og bruge jeres produkt: en MCP-server, llms.txt, Markdown-versioner af siderne, API-katalog og strukturerede data - det samme setup, som dette site kører.',
    },
    deliverables: {
      en: ['MCP server', 'llms.txt & Markdown pages', 'API catalogue & docs', 'Structured data'],
      da: ['MCP-server', 'llms.txt & Markdown-sider', 'API-katalog & dokumentation', 'Strukturerede data'],
    },
    pricing: 'quote',
  },
  {
    id: 'modernisation',
    audience: 'tech',
    areas: ['backend', 'devops'],
    glyph: '▥',
    title: { en: 'Legacy modernisation', da: 'Modernisering af legacy' },
    body: {
      en: 'Framework and stack upgrades, deprecated code removed and duplicated logic consolidated, with tests and a quality gate in place first, so the upgrade doesn’t break what already works.',
      da: 'Framework- og stack-opgraderinger, deprecated kode fjernet og gentaget logik samlet, med tests og en kvalitets-gate på plads først, så opgraderingen ikke ødelægger det, der virker.',
    },
    deliverables: {
      en: ['Code health check', 'Upgrade plan', 'Tests before changes', 'Step-by-step migration'],
      da: ['Tjek af kodens sundhed', 'Opgraderingsplan', 'Tests før ændringer', 'Migrering trin for trin'],
    },
    pricing: 'either',
  },
];
