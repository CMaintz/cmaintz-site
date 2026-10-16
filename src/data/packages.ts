import type { Lang } from '../i18n/ui';
import type { Audience } from './services';

type L = Record<Lang, string>;

/**
 * Fixed-scope, fixed-price starter packages: an easy first "yes" before a
 * bigger project. Prices are DKK ex. VAT; 0 means free.
 */
export interface Package {
  id: string;
  audience: Audience | 'both';
  priceDkk: number;
  duration: L;
  title: L;
  body: L;
  includes: Record<Lang, string[]>;
  /** Preselected contact-form topic. */
  topic: 'audit' | 'freelance';
}

export const packages: Package[] = [
  {
    id: 'mini-audit',
    audience: 'both',
    priceDkk: 0,
    topic: 'audit',
    duration: { en: '30 min + a short write-up', da: '30 min + en kort opsummering' },
    title: { en: 'Free mini-audit', da: 'Gratis mini-audit' },
    body: {
      en: 'Tell me where the time goes - or point me at a repo - and get the three things I would fix first, in writing. No strings attached.',
      da: 'Fortæl mig, hvor tiden går hen - eller giv mig adgang til et repo - og få de tre ting, jeg ville løse først, på skrift. Helt uforpligtende.',
    },
    includes: {
      en: [
        'Businesses: your top 3 automation candidates',
        'Dev teams: a 1-page CI & code-health check',
        'An honest "not worth it" if that’s the answer',
      ],
      da: [
        'Virksomheder: jeres 3 bedste kandidater til automatisering',
        'Udviklingsteams: et 1-sides tjek af CI og kodekvalitet',
        'Et ærligt "det kan ikke betale sig", hvis det er svaret',
      ],
    },
  },
  {
    id: 'automation-check',
    audience: 'business',
    priceDkk: 3900,
    topic: 'freelance',
    duration: { en: 'Half-day workshop', da: 'Halv dags workshop' },
    title: { en: 'Automation check', da: 'Automatiseringstjek' },
    body: {
      en: 'We walk through how work actually flows through your business, and you get a prioritised plan: what to automate, what it saves and what it costs.',
      da: 'Vi gennemgår, hvordan arbejdet reelt flyder gennem virksomheden, og I får en prioriteret plan: hvad der skal automatiseres, hvad det sparer, og hvad det koster.',
    },
    includes: {
      en: [
        'Workshop on-site in Aarhus or online',
        'Map of manual tasks and hours spent',
        'Prioritised plan with rough prices',
      ],
      da: [
        'Workshop i Aarhus eller online',
        'Overblik over manuelle opgaver og timeforbrug',
        'Prioriteret plan med vejledende priser',
      ],
    },
  },
  {
    id: 'ai-sprint',
    audience: 'business',
    priceDkk: 14500,
    topic: 'freelance',
    duration: { en: '3 days', da: '3 dage' },
    title: { en: 'AI feasibility sprint', da: 'AI-afklaringssprint' },
    body: {
      en: 'Find out whether AI can really take over a task - on your own data - before you invest in building it properly.',
      da: 'Find ud af, om AI reelt kan overtage en opgave - på jeres egne data - før I investerer i at bygge det ordentligt.',
    },
    includes: {
      en: ['Working prototype on your data', 'Measured quality, not a demo', 'Go / no-go report with running costs'],
      da: [
        'Fungerende prototype på jeres data',
        'Målt kvalitet, ikke bare en demo',
        'Go / no-go-rapport med driftsomkostninger',
      ],
    },
  },
  {
    id: 'product-texts',
    audience: 'business',
    priceDkk: 7500,
    topic: 'freelance',
    duration: { en: '2 days', da: '2 dage' },
    title: { en: 'AI product-text pilot', da: 'AI-produkttekster, pilot' },
    body: {
      en: '50 of your products get AI-written descriptions, SEO texts and categories in two languages, reviewed by a person, so you see the quality and the cost per product before doing the whole catalogue.',
      da: '50 af jeres produkter får AI-skrevne beskrivelser, SEO-tekster og kategorier på to sprog, gennemgået af et menneske, så I ser kvaliteten og prisen pr. produkt, før hele kataloget skal laves.',
    },
    includes: {
      en: ['50 products in 2 languages', 'Measured quality and cost per product', 'A price for the full catalogue'],
      da: ['50 produkter på 2 sprog', 'Målt kvalitet og pris pr. produkt', 'En pris for hele kataloget'],
    },
  },
  {
    id: 'auto-triage',
    audience: 'business',
    priceDkk: 9500,
    topic: 'freelance',
    duration: { en: '2 days', da: '2 dage' },
    title: { en: 'Auto-triage pilot', da: 'Automatisk sortering, pilot' },
    body: {
      en: 'Find out how much of your inbox or ticket queue AI can sort on its own, measured on your own past mail, and where a person still has to look.',
      da: 'Find ud af, hvor meget af jeres indbakke eller ticketkø AI kan sortere selv, målt på jeres egne tidligere mails, og hvor et menneske stadig skal kigge.',
    },
    includes: {
      en: ['Tested on your own history', 'How much sorts itself, and how reliably', 'A plan for running it day to day'],
      da: [
        'Testet på jeres egen historik',
        'Hvor meget der sorteres selv, og hvor sikkert',
        'En plan for at køre det i hverdagen',
      ],
    },
  },
  {
    id: 'agent-ready',
    audience: 'both',
    priceDkk: 9500,
    topic: 'freelance',
    duration: { en: '2 days', da: '2 dage' },
    title: { en: 'Agent-ready website', da: 'Agent-klar hjemmeside' },
    body: {
      en: 'AI assistants increasingly read your site for your customers. Your site gets what they look for, so they find your offers and quote the right answers.',
      da: 'AI-assistenter læser i stigende grad jeres side for jeres kunder. Siden får det, de leder efter, så de finder jeres ydelser og citerer de rigtige svar.',
    },
    includes: {
      en: ['Structured data and llms.txt', 'Markdown versions of key pages', 'An MCP server for your offers or docs'],
      da: [
        'Strukturerede data og llms.txt',
        'Markdown-udgaver af de vigtigste sider',
        'En MCP-server til jeres ydelser eller dokumentation',
      ],
    },
  },
  {
    id: 'gate-starter',
    audience: 'tech',
    priceDkk: 14500,
    topic: 'freelance',
    duration: { en: '3 days', da: '3 dage' },
    title: { en: 'CI quality-gate starter', da: 'CI-kvalitets-gate, startpakke' },
    body: {
      en: 'One repository gets a deterministic gate - format, lint, types, tests, secret scanning - running the same locally and in CI, ratcheted so nothing has to be fixed up front.',
      da: 'Ét repo får en deterministisk gate - formatering, lint, typer, tests, secret-scanning - der kører ens lokalt og i CI, med ratchet, så intet skal rettes på forhånd.',
    },
    includes: {
      en: ['GitHub Actions pipeline', 'Pre-push hooks & pinned toolchain', 'Hand-over session for the team'],
      da: ['GitHub Actions-pipeline', 'Pre-push-hooks & fastlåst toolchain', 'Overdragelse til teamet'],
    },
  },
  {
    id: 'coding-agents',
    audience: 'tech',
    priceDkk: 9500,
    topic: 'freelance',
    duration: { en: '2 days', da: '2 dage' },
    title: { en: 'Coding-agent setup', da: 'Opsætning af kodeagenter' },
    body: {
      en: 'One repository is set up for Claude Code or Codex, with the project rules, skills, hooks and permissions that keep agent output reviewable, and your team learns how to work with it.',
      da: 'Ét repo sættes op til Claude Code eller Codex med projektregler, skills, hooks og rettigheder, så agenternes output stadig kan reviewes, og teamet lærer at arbejde med det.',
    },
    includes: {
      en: ['Project rules and skills', 'Hooks and permission guardrails', '2-hour session with the team'],
      da: ['Projektregler og skills', 'Hooks og rettigheder som rækværk', '2 timers session med teamet'],
    },
  },
];
