import type { Principle } from './principle';

export const backend: Principle[] = [
  {
    title: { en: 'The domain model comes first', da: 'Domænemodellen kommer først' },
    body: {
      en: 'Real business rules live in a model that names them, behind an API with clear contracts and validation at the edge. Frameworks and databases plug in around it.',
      da: 'Rigtige forretningsregler bor i en model, der navngiver dem, bag et API med klare kontrakter og validering ved kanten. Frameworks og databaser kobles på udenom.',
    },
    proof: ['sall-whisky', 'dev-insight'],
  },
  {
    title: { en: 'Know what the database is doing', da: 'Vid, hvad databasen laver' },
    body: {
      en: 'An ORM is a tool, not a hiding place. I design the schema, write SQL where it matters and use what Postgres already does, from full-text to vector search, before adding another service.',
      da: 'En ORM er et værktøj, ikke et skjulested. Jeg designer skemaet, skriver SQL, hvor det betyder noget, og bruger det, Postgres allerede kan, fra fuldtekst- til vektorsøgning, før jeg tilføjer endnu en service.',
    },
    proof: ['jobbuddy'],
  },
  {
    title: { en: 'Resilient by default', da: 'Robust som standard' },
    body: {
      en: 'Slow or unreliable work goes on a queue, with retries and backoff, idempotency and an audit trail, so a flaky dependency never takes the product down.',
      da: 'Langsomt eller ustabilt arbejde kommer i kø med retries og backoff, idempotens og audit trail, så en ustabil afhængighed aldrig vælter produktet.',
    },
    proof: ['illux-product-ai'],
  },
  {
    title: { en: 'Swappable edges', da: 'Udskiftelige kanter' },
    body: {
      en: 'Providers, databases and AI models sit behind ports and adapters, so changing vendor is a new adapter, not a rewrite.',
      da: 'Udbydere, databaser og AI-modeller ligger bag porte og adaptere, så et leverandørskift er en ny adapter og ikke en omskrivning.',
    },
    proof: ['jobbuddy', 'dev-insight'],
  },
  {
    title: { en: 'Tests earn their place', da: 'Tests skal gøre sig fortjent til deres plads' },
    body: {
      en: 'Every test must be able to go red on a realistic bug. I test the business rules and the security boundaries against a real database, not the framework or a stub returning what it was told to.',
      da: 'Hver test skal kunne blive rød på en realistisk fejl. Jeg tester forretningsreglerne og sikkerhedsgrænserne mod en rigtig database, ikke frameworket eller en stub, der returnerer det, den fik besked på.',
    },
    proof: ['dev-insight'],
  },
  {
    title: { en: 'Make invalid states unrepresentable', da: 'Gør ugyldige tilstande umulige' },
    body: {
      en: 'The types carry the rules. If a value can’t be wrong, no code path has to remember to check it.',
      da: 'Typerne bærer reglerne. Hvis en værdi ikke kan være forkert, skal ingen kodesti huske at tjekke den.',
    },
  },
];
