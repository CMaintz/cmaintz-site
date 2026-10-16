import type { Principle } from './principle';

export const platform: Principle[] = [
  {
    title: { en: 'Paved roads over gatekeeping', da: 'Asfalterede veje frem for gatekeeping' },
    body: {
      en: 'Make the right way the default with templates and shared workflows, instead of reviewing every team into compliance.',
      da: 'Gør den rigtige vej til standarden med skabeloner og fælles workflows i stedet for at reviewe hvert team på plads.',
    },
    proof: ['foundry'],
  },
  {
    title: { en: 'Everything as code', da: 'Alt som kode' },
    body: {
      en: 'Pipelines, configuration and policy live in the repo, reviewed and versioned like any other change.',
      da: 'Pipelines, konfiguration og politikker ligger i repoet og bliver reviewet og versioneret som enhver anden ændring.',
    },
    proof: ['foundry'],
  },
  {
    title: { en: 'A golden path with an escape hatch', da: 'En gylden sti med en nødudgang' },
    body: {
      en: 'The default is opinionated, and there is a documented, reviewed way off it. Teams that can’t leave the road route around it instead.',
      da: 'Standarden træffer valgene for dig, og der er en dokumenteret, reviewet vej væk fra den. Teams, der ikke kan forlade vejen, finder i stedet en vej udenom.',
    },
    proof: ['foundry'],
  },
  {
    title: { en: 'Adopt it one small PR at a time', da: 'Indfør det én lille PR ad gangen' },
    body: {
      en: 'An existing codebase comes up to standard in small, reviewable steps alongside normal work, not in a big-bang migration that stalls everything else.',
      da: 'En eksisterende kodebase kommer op på standarden i små trin, der kan reviewes, ved siden af det normale arbejde, ikke i én stor migrering, der sætter alt andet i stå.',
    },
  },
  {
    title: { en: 'Observable by default', da: 'Observerbar som standard' },
    body: {
      en: 'Logs, run summaries and cost figures come with the template, so the first question about a running system has an answer before anyone asks it.',
      da: 'Logs, kørselsoversigter og omkostningstal følger med skabelonen, så det første spørgsmål om et kørende system har et svar, før nogen stiller det.',
    },
  },
  {
    title: { en: 'Pin the tool, not just the action', da: 'Fastlås værktøjet, ikke kun action’en' },
    body: {
      en: 'Shared workflows are versioned, and every tool they install has an exact version. Nothing resolves to "latest" and breaks on a Tuesday.',
      da: 'Fælles workflows er versionerede, og hvert værktøj, de installerer, har en præcis version. Intet peger på "latest" og går i stykker en tirsdag.',
    },
    proof: ['foundry'],
  },
];
