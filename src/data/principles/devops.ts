import type { Principle } from './principle';

export const devops: Principle[] = [
  {
    title: { en: 'One rule set, three placements', da: 'Ét regelsæt, tre steder' },
    body: {
      en: 'In-loop, pre-push and CI enforce the same rules. Different rules in different places is how you get "green locally, red in CI".',
      da: 'Editor, pre-push og CI håndhæver de samme regler. Forskellige regler forskellige steder er opskriften på "grøn lokalt, rød i CI".',
    },
    proof: ['foundry'],
  },
  {
    title: { en: 'Ratchet, don’t gate', da: 'Ratchet i stedet for at blokere' },
    body: {
      en: 'Existing issues become a baseline that may only shrink. Only new violations fail, so a legacy codebase can adopt strict rules on day one.',
      da: 'Eksisterende fejl bliver en baseline, der kun må skrumpe. Kun nye overtrædelser fejler, så en legacy-kodebase kan tage strenge regler i brug fra dag ét.',
    },
    proof: ['foundry', 'leash'],
  },
  {
    title: { en: 'The exit code decides', da: 'Exit-koden bestemmer' },
    body: {
      en: 'Linters, types, tests and scanners own pass/fail. AI may propose a fix, but it only lands when the deterministic gate passes.',
      da: 'Linters, typer, tests og scannere afgør bestået/fejlet. AI må foreslå en rettelse, men den lander kun, når den deterministiske gate består.',
    },
    proof: ['foundry'],
  },
  {
    title: { en: 'Secure the supply chain by default', da: 'Sikr forsyningskæden som standard' },
    body: {
      en: 'SHA-pinned actions, least-privilege tokens, secret and dependency scanning, and no long-lived keys in CI.',
      da: 'SHA-fastlåste actions, tokens med mindst mulige rettigheder, secret- og dependency-scanning og ingen langlivede nøgler i CI.',
    },
    proof: ['foundry', 'jev-tools'],
  },
  {
    title: { en: 'Nobody quietly weakens the gate', da: 'Ingen svækker gaten i det stille' },
    body: {
      en: 'Loosening a rule is its own pull request with a label a human sets. A change that relaxes the gate next to the code that needed it is refused, whether a person or an agent wrote it.',
      da: 'At løsne en regel er sin egen pull request med en label, som et menneske sætter. En ændring, der slækker på gaten i samme PR som den kode, der krævede det, bliver afvist, uanset om et menneske eller en agent skrev den.',
    },
    proof: ['foundry'],
  },
  {
    title: { en: 'Red CI is a task, not a report', da: 'Rød CI er en opgave, ikke en rapport' },
    body: {
      en: 'Every push is watched until it is green. A failure gets its cause fixed and pushed again, not a retry button or a note saying it’s probably unrelated.',
      da: 'Hvert push bliver fulgt, til det er grønt. Når noget fejler, bliver årsagen rettet og pushet igen; ingen retry-knap og ingen note om, at det nok er urelateret.',
    },
  },
  {
    title: { en: 'Small, single-purpose changes', da: 'Små ændringer med ét formål' },
    body: {
      en: 'Every commit builds and does one thing. Refactors and formatting ship apart from behaviour changes, so a review reads the change, not the noise.',
      da: 'Hvert commit bygger og gør én ting. Refaktoreringer og formatering sendes adskilt fra adfærdsændringer, så et review læser ændringen og ikke støjen.',
    },
  },
  {
    title: { en: 'Measure the pipeline', da: 'Mål pipelinen' },
    body: {
      en: 'Know where the gate spends its time and whether a change is converging or thrashing, so the slow step gets fixed instead of tolerated.',
      da: 'Vid, hvor gaten bruger sin tid, og om en ændring nærmer sig grønt eller kører i ring, så det langsomme trin bliver rettet i stedet for at blive tolereret.',
    },
  },
];
