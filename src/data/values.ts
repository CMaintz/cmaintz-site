import type { Lang } from '../i18n/ui';

type L = Record<Lang, string>;

export const values: { title: L; body: L }[] = [
  {
    title: { en: 'Understand before building', da: 'Forstå før du bygger' },
    body: {
      en: 'I start with how people actually work and where the time goes. The most valuable fix is often not the one first asked for.',
      da: 'Jeg starter med, hvordan folk reelt arbejder, og hvor tiden går hen. Den mest værdifulde løsning er ofte ikke den, man først bad om.',
    },
  },
  {
    title: { en: 'Let evidence decide', da: 'Lad evidensen afgøre det' },
    body: {
      en: 'Tests and measurements over "it seems fine", and honest numbers over impressive ones.',
      da: 'Tests og målinger frem for "det ser fint ud", og ærlige tal frem for imponerende tal.',
    },
  },
  {
    title: { en: 'Leave it ownable', da: 'Efterlad noget, der kan ejes' },
    body: {
      en: 'Code, docs and a hand-over the team can run without me. If it only works while I’m around, it isn’t finished.',
      da: 'Kode, dokumentation og en overdragelse, teamet kan køre videre uden mig. Hvis det kun virker, mens jeg er der, er det ikke færdigt.',
    },
  },
  {
    title: { en: 'Automate the boring, keep humans on the judgement', da: 'Automatisér det kedelige, lad mennesker tage stilling' },
    body: {
      en: 'AI and tooling should take repetitive work off people’s plates, with a person reviewing wherever the system isn’t sure.',
      da: 'AI og værktøjer skal fjerne gentaget arbejde fra folks bord, med et menneske, der tager stilling, hvor systemet er usikkert.',
    },
  },
];
