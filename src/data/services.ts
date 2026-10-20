import type { Lang } from '../i18n/ui';
import type { AreaId } from './areas';
import { businessServices } from './offers/business';
import { techServices } from './offers/tech';

type L = Record<Lang, string>;

/** Single source for the hourly rate: shown on /services, interpolated into the UI copy. */
export const HOURLY_RATE_DKK = 650;

/**
 * How a service is priced. No fixed amounts: a fixed price depends on the
 * complexity, so it's quoted after scoping. Labels live in the i18n files.
 */
type Pricing = 'quote' | 'hourly' | 'either';

/** Who a service is written for: business owners and managers, or dev teams. */
export type Audience = 'business' | 'tech';

export interface Service {
  id: string;
  glyph: string;
  title: L;
  body: L;
  deliverables: Record<Lang, string[]>;
  pricing: Pricing;
  areas: AreaId[];
  audience: Audience | 'both';
}

export const services: Service[] = [
  ...businessServices,
  ...techServices,
  {
    id: 'anything',
    audience: 'both',
    areas: [],
    glyph: '▢',
    title: { en: 'Everything else', da: 'Alt det andet' },
    body: {
      en: 'Desktop apps, data migrations, code review, a second opinion on a plan or a vendor. If it compiles, I’m interested - ask.',
      da: 'Desktop-apps, datamigreringer, code review, en second opinion på en plan eller en leverandør. Hvis det kan kompilere, er jeg interesseret - spørg.',
    },
    deliverables: { en: [], da: [] },
    pricing: 'hourly',
  },
];

export const workLanguages = [
  'TypeScript',
  'JavaScript',
  'Java',
  'Kotlin',
  'C#',
  'PHP',
  'Swift',
  'Python',
  'Go',
  'Rust',
  'SQL',
  'Shell',
];

export const process: Record<Lang, { step: string; body: string }[]> = {
  en: [
    { step: 'Call', body: 'Free 30 minutes to hear what you need and whether I’m the right fit.' },
    {
      step: 'Understand',
      body: 'Before anything is built, I get to know your processes, your team and where the time and risk actually go. Sometimes the most valuable fix isn’t the one you came in with, and I’ll tell you if so.',
    },
    { step: 'Scope', body: 'A written proposal: deliverables, timeline, fixed price or hourly estimate.' },
    { step: 'Build', body: 'Short iterations, visible progress, everything in your repo from day one.' },
    { step: 'Hand over', body: 'Docs, a walkthrough, and code your team can own without me.' },
  ],
  da: [
    { step: 'Opkald', body: 'Gratis 30 minutter til at høre, hvad I har brug for, og om jeg er det rette match.' },
    {
      step: 'Forstå',
      body: 'Før noget bygges, sætter jeg mig ind i jeres processer, jeres team og hvor tiden og risikoen reelt går hen. Nogle gange er den mest værdifulde løsning ikke den, I kom med, og så siger jeg det.',
    },
    { step: 'Afgrænsning', body: 'Et skriftligt oplæg: leverancer, tidsplan, fast pris eller timeestimat.' },
    { step: 'Byg', body: 'Korte iterationer, synlige fremskridt, alt i jeres repo fra dag ét.' },
    { step: 'Overdragelse', body: 'Dokumentation, en gennemgang og kode, jeres team kan eje uden mig.' },
  ],
};
