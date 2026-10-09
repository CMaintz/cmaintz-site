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
      en: ['Businesses: your top 3 automation candidates', 'Dev teams: a 1-page CI & code-health check', 'An honest "not worth it" if that’s the answer'],
      da: ['Virksomheder: jeres 3 bedste kandidater til automatisering', 'Udviklingsteams: et 1-sides tjek af CI og kodekvalitet', 'Et ærligt "det kan ikke betale sig", hvis det er svaret'],
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
      en: ['Workshop on-site in Aarhus or online', 'Map of manual tasks and hours spent', 'Prioritised plan with rough prices'],
      da: ['Workshop i Aarhus eller online', 'Overblik over manuelle opgaver og timeforbrug', 'Prioriteret plan med vejledende priser'],
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
      da: ['Fungerende prototype på jeres data', 'Målt kvalitet, ikke bare en demo', 'Go / no-go-rapport med driftsomkostninger'],
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
];
