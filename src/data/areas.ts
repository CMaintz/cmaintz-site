// The five "What I do" areas. Projects, posts and services reference these ids,
// which ties content to the focus areas and to the /what-i-do/<area> pages.
// Each area's principles live in principles/<id>.ts.
import type { Lang } from '../i18n/ui';
import type { Principle } from './principles/principle';
import { ai } from './principles/ai';
import { backend } from './principles/backend';
import { devops } from './principles/devops';
import { dx } from './principles/dx';
import { platform } from './principles/platform';

export const AREA_IDS = ['dx', 'devops', 'backend', 'platform', 'ai'] as const;
export type AreaId = (typeof AREA_IDS)[number];

type L = Record<Lang, string>;
export interface Area {
  glyph: string;
  label: L;
  intro: L;
  principles: Principle[];
}

export const areas: Record<AreaId, Area> = {
  dx: {
    glyph: '⌘',
    label: { en: 'Developer Experience', da: 'Developer Experience' },
    intro: {
      en: 'Developers are fastest when the right thing is also the easy thing. I look for the friction that quietly eats a team’s week (slow feedback, flaky setup, manual steps) and remove it with tooling, not more documentation.',
      da: 'Udviklere er hurtigst, når det rigtige også er det nemme. Jeg leder efter den friktion, der stille æder et teams uge (langsom feedback, ustabilt setup, manuelle trin), og fjerner den med værktøjer frem for mere dokumentation.',
    },
    principles: dx,
  },
  devops: {
    glyph: '⟳',
    label: { en: 'DevOps & CI/CD', da: 'DevOps & CI/CD' },
    intro: {
      en: 'A pipeline is a promise about quality that runs on every change. I build ones that are deterministic, fast, cheap to run and hard to quietly weaken, including by AI agents.',
      da: 'En pipeline er et løfte om kvalitet, der kører på hver ændring. Jeg bygger pipelines, der er deterministiske, hurtige, billige at køre og svære at svække i det stille, også for AI-agenter.',
    },
    principles: devops,
  },
  backend: {
    glyph: '▤',
    label: { en: 'Backend', da: 'Backend' },
    intro: {
      en: 'Most of a product lives in its backend: the APIs, the data and the services behind them. I build those around the domain, so the business rules are easy to find, the data can be trusted and a slow dependency never takes the product down.',
      da: 'Det meste af et produkt bor i backenden: API’erne, data og de services, der ligger bag. Jeg bygger dem omkring domænet, så forretningsreglerne er nemme at finde, data er til at stole på, og en langsom afhængighed aldrig vælter produktet.',
    },
    principles: backend,
  },
  platform: {
    glyph: '▦',
    label: { en: 'Platform & Infrastructure', da: 'Platform & infrastruktur' },
    intro: {
      en: 'Good platforms are paved roads: the safe, observable, repeatable way is also the quickest way to ship. I build the plumbing that makes that true, from pinned toolchains and scaffolding to config and policy as code.',
      da: 'Gode platforme er asfalterede veje: den sikre, observerbare og gentagelige vej er også den hurtigste vej til produktion. Jeg bygger det VVS, der gør det muligt, fra fastlåste toolchains og scaffolding til config og policy som kode.',
    },
    principles: platform,
  },
  ai: {
    glyph: '◈',
    label: { en: 'AI enablement', da: 'AI-enablement' },
    intro: {
      en: 'AI earns its place when it removes real, repetitive work and you can trust what it does. I build AI features and agent workflows with structure, measurement and humans on the uncertain cases.',
      da: 'AI gør sig fortjent til sin plads, når den fjerner reelt, gentaget arbejde, og man kan stole på det, den gør. Jeg bygger AI-funktioner og agent-workflows med struktur, måling og mennesker på de usikre sager.',
    },
    principles: ai,
  },
};

/** Kept for existing imports: just the labels. */
export const areaLabels = Object.fromEntries(AREA_IDS.map((id) => [id, areas[id].label])) as Record<AreaId, L>;
