// The five "What I do" areas. Projects, posts and services reference these ids,
// which ties content to the focus areas and to the /what-i-do/<area> pages.
// Principles are drafts grounded in real work; `proof` names a project slug.
import type { Lang } from '../i18n/ui';

export const AREA_IDS = ['dx', 'devops', 'backend', 'platform', 'ai'] as const;
export type AreaId = (typeof AREA_IDS)[number];

type L = Record<Lang, string>;
interface Principle {
  title: L;
  body: L;
  proof?: string;
}
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
    principles: [
      {
        title: { en: 'Feedback in seconds, not in CI', da: 'Feedback på sekunder, ikke i CI' },
        body: {
          en: 'The same checks run in the editor, before push and in CI, so problems surface while the code is still in your head, not twenty minutes later.',
          da: 'De samme tjek kører i editoren, før push og i CI, så problemer dukker op, mens koden stadig er frisk, og ikke tyve minutter senere.',
        },
        proof: 'foundry',
      },
      {
        title: { en: 'One command to a working setup', da: 'Én kommando til et fungerende setup' },
        body: {
          en: 'Pinned toolchains and reproducible environments end "works on my machine". A new developer should be productive on day one.',
          da: 'Fastlåste toolchains og reproducerbare miljøer gør en ende på "det virker på min maskine". En ny udvikler skal være produktiv fra dag ét.',
        },
      },
      {
        title: { en: 'Remove steps instead of documenting them', da: 'Fjern trin i stedet for at dokumentere dem' },
        body: {
          en: 'Scaffolding, CLI tools and previews beat a wiki page listing twelve manual steps nobody reads.',
          da: 'Scaffolding, CLI-værktøjer og previews slår en wiki-side med tolv manuelle trin, som ingen læser.',
        },
        proof: 'email-template-preview',
      },
      {
        title: { en: 'Ask where the time goes first', da: 'Spørg først, hvor tiden går hen' },
        body: {
          en: 'Before picking tools I watch how the team actually works. The biggest win is often not the one anyone asked for.',
          da: 'Før jeg vælger værktøjer, ser jeg på, hvordan teamet reelt arbejder. Den største gevinst er ofte ikke den, nogen bad om.',
        },
      },
    ],
  },
  devops: {
    glyph: '⟳',
    label: { en: 'DevOps & CI/CD', da: 'DevOps & CI/CD' },
    intro: {
      en: 'A pipeline is a promise about quality that runs on every change. I build ones that are deterministic, fast, cheap to run and hard to quietly weaken, including by AI agents.',
      da: 'En pipeline er et løfte om kvalitet, der kører på hver ændring. Jeg bygger pipelines, der er deterministiske, hurtige, billige at køre og svære at svække i det stille, også for AI-agenter.',
    },
    principles: [
      {
        title: { en: 'One rule set, three placements', da: 'Ét regelsæt, tre steder' },
        body: {
          en: 'In-loop, pre-push and CI enforce the same rules. Different rules in different places is how you get "green locally, red in CI".',
          da: 'Editor, pre-push og CI håndhæver de samme regler. Forskellige regler forskellige steder er opskriften på "grøn lokalt, rød i CI".',
        },
        proof: 'foundry',
      },
      {
        title: { en: 'Ratchet, don’t gate', da: 'Ratchet i stedet for at blokere' },
        body: {
          en: 'Existing issues become a baseline that may only shrink. Only new violations fail, so a legacy codebase can adopt strict rules on day one.',
          da: 'Eksisterende fejl bliver en baseline, der kun må skrumpe. Kun nye overtrædelser fejler, så en legacy-kodebase kan tage strenge regler i brug fra dag ét.',
        },
      },
      {
        title: { en: 'The exit code decides', da: 'Exit-koden bestemmer' },
        body: {
          en: 'Linters, types, tests and scanners own pass/fail. AI may propose a fix, but it only lands when the deterministic gate passes.',
          da: 'Linters, typer, tests og scannere afgør bestået/fejlet. AI må foreslå en rettelse, men den lander kun, når den deterministiske gate består.',
        },
        proof: 'foundry',
      },
      {
        title: { en: 'Secure the supply chain by default', da: 'Sikr forsyningskæden som standard' },
        body: {
          en: 'SHA-pinned actions, least-privilege tokens, secret and dependency scanning, and no long-lived keys in CI.',
          da: 'SHA-fastlåste actions, tokens med mindst mulige rettigheder, secret- og dependency-scanning og ingen langlivede nøgler i CI.',
        },
      },
    ],
  },
  backend: {
    glyph: '▤',
    label: { en: 'Backend', da: 'Backend' },
    intro: {
      en: 'Most of a product lives in its backend: the APIs, the data and the services behind them. I build those around the domain, so the business rules are easy to find, the data can be trusted and a slow dependency never takes the product down.',
      da: 'Det meste af et produkt bor i backenden: API’erne, data og de services, der ligger bag. Jeg bygger dem omkring domænet, så forretningsreglerne er nemme at finde, data er til at stole på, og en langsom afhængighed aldrig vælter produktet.',
    },
    principles: [
      {
        title: { en: 'The domain model comes first', da: 'Domænemodellen kommer først' },
        body: {
          en: 'Real business rules live in a model that names them, behind an API with clear contracts and validation at the edge. Frameworks and databases plug in around it.',
          da: 'Rigtige forretningsregler bor i en model, der navngiver dem, bag et API med klare kontrakter og validering ved kanten. Frameworks og databaser kobles på udenom.',
        },
        proof: 'sall-whisky',
      },
      {
        title: { en: 'Know what the database is doing', da: 'Vid, hvad databasen laver' },
        body: {
          en: 'An ORM is a tool, not a hiding place. I design the schema, write SQL where it matters and use what Postgres already does, from full-text to vector search, before adding another service.',
          da: 'En ORM er et værktøj, ikke et skjulested. Jeg designer skemaet, skriver SQL, hvor det betyder noget, og bruger det, Postgres allerede kan, fra fuldtekst- til vektorsøgning, før jeg tilføjer endnu en service.',
        },
        proof: 'jobbuddy',
      },
      {
        title: { en: 'Resilient by default', da: 'Robust som standard' },
        body: {
          en: 'Slow or unreliable work goes on a queue, with retries and backoff, idempotency and an audit trail, so a flaky dependency never takes the product down.',
          da: 'Langsomt eller ustabilt arbejde kommer i kø med retries og backoff, idempotens og audit trail, så en ustabil afhængighed aldrig vælter produktet.',
        },
        proof: 'illux-product-ai',
      },
      {
        title: { en: 'Swappable edges', da: 'Udskiftelige kanter' },
        body: {
          en: 'Providers, databases and AI models sit behind ports and adapters, so changing vendor is a new adapter, not a rewrite.',
          da: 'Udbydere, databaser og AI-modeller ligger bag porte og adaptere, så et leverandørskift er en ny adapter og ikke en omskrivning.',
        },
        proof: 'jobbuddy',
      },
    ],
  },
  platform: {
    glyph: '▦',
    label: { en: 'Platform & Infrastructure', da: 'Platform & infrastruktur' },
    intro: {
      en: 'Good platforms are paved roads: the safe, observable, repeatable way is also the quickest way to ship. I build the plumbing that makes that true, from pinned toolchains and scaffolding to config and policy as code.',
      da: 'Gode platforme er asfalterede veje: den sikre, observerbare og gentagelige vej er også den hurtigste vej til produktion. Jeg bygger det VVS, der gør det muligt, fra fastlåste toolchains og scaffolding til config og policy som kode.',
    },
    principles: [
      {
        title: { en: 'Paved roads over gatekeeping', da: 'Asfalterede veje frem for gatekeeping' },
        body: {
          en: 'Make the right way the default with templates and shared workflows, instead of reviewing every team into compliance.',
          da: 'Gør den rigtige vej til standarden med skabeloner og fælles workflows i stedet for at reviewe hvert team på plads.',
        },
      },
      {
        title: { en: 'Everything as code', da: 'Alt som kode' },
        body: {
          en: 'Pipelines, configuration and policy live in the repo, reviewed and versioned like any other change.',
          da: 'Pipelines, konfiguration og politikker ligger i repoet og bliver reviewet og versioneret som enhver anden ændring.',
        },
        proof: 'foundry',
      },
    ],
  },
  ai: {
    glyph: '◈',
    label: { en: 'AI enablement', da: 'AI-enablement' },
    intro: {
      en: 'AI earns its place when it removes real, repetitive work and you can trust what it does. I build AI features and agent workflows with structure, measurement and humans on the uncertain cases.',
      da: 'AI gør sig fortjent til sin plads, når den fjerner reelt, gentaget arbejde, og man kan stole på det, den gør. Jeg bygger AI-funktioner og agent-workflows med struktur, måling og mennesker på de usikre sager.',
    },
    principles: [
      {
        title: { en: 'Structured output, never prose parsing', da: 'Struktureret output, aldrig tekst-parsing' },
        body: {
          en: 'Models answer in schema-enforced JSON, so the rest of the system gets typed data instead of guesswork.',
          da: 'Modeller svarer i skemabundet JSON, så resten af systemet får typede data i stedet for gætværk.',
        },
        proof: 'illux-product-ai',
      },
      {
        title: { en: 'Confidence decides who reviews', da: 'Confidence afgør, hvem der reviewer' },
        body: {
          en: 'Confident results flow through; uncertain ones go to a person. Automation where it’s safe, judgement where it matters.',
          da: 'Sikre resultater går direkte igennem; usikre går til et menneske. Automatisering hvor det er sikkert, dømmekraft hvor det betyder noget.',
        },
        proof: 'jev-tools',
      },
      {
        title: { en: 'Cheapest model that’s good enough', da: 'Den billigste model, der er god nok' },
        body: {
          en: 'Fast, cheap models handle the bulk; stronger ones are reserved for what they can’t decide.',
          da: 'Hurtige, billige modeller tager størstedelen; stærkere modeller gemmes til det, de ikke kan afgøre.',
        },
        proof: 'jev-rerank',
      },
      {
        title: { en: 'Measure before trusting', da: 'Mål før du stoler på det' },
        body: {
          en: 'Evaluation harnesses compare models and prompts, audit trails record exactly what ran, and guardrails stop agents before risky actions.',
          da: 'Evalueringsværktøjer sammenligner modeller og prompts, audit trails registrerer præcis hvad der kørte, og guardrails stopper agenter før risikable handlinger.',
        },
        proof: 'jev-eval',
      },
    ],
  },
};

/** Kept for existing imports: just the labels. */
export const areaLabels = Object.fromEntries(AREA_IDS.map((id) => [id, areas[id].label])) as Record<AreaId, L>;
