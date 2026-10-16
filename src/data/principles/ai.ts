import type { Principle } from './principle';

export const ai: Principle[] = [
  {
    title: { en: 'Structured output, never prose parsing', da: 'Struktureret output, aldrig tekst-parsing' },
    body: {
      en: 'Models answer in schema-enforced JSON, so the rest of the system gets typed data instead of guesswork.',
      da: 'Modeller svarer i skemabundet JSON, så resten af systemet får typede data i stedet for gætværk.',
    },
    proof: ['illux-product-ai', 'jev-tools'],
  },
  {
    title: { en: 'Confidence decides who reviews', da: 'Confidence afgør, hvem der reviewer' },
    body: {
      en: 'Confident results flow through; uncertain ones go to a person. Automation where it’s safe, judgement where it matters.',
      da: 'Sikre resultater går direkte igennem; usikre går til et menneske. Automatisering hvor det er sikkert, dømmekraft hvor det betyder noget.',
    },
    proof: ['jev-tools', 'illux-product-ai'],
  },
  {
    title: { en: 'Cheapest model that’s good enough', da: 'Den billigste model, der er god nok' },
    body: {
      en: 'Fast, cheap models handle the bulk; stronger ones are reserved for what they can’t decide.',
      da: 'Hurtige, billige modeller tager størstedelen; stærkere modeller gemmes til det, de ikke kan afgøre.',
    },
    proof: ['jev-rerank', 'jev-tools'],
  },
  {
    title: { en: 'Measure before trusting', da: 'Mål før du stoler på det' },
    body: {
      en: 'Evaluation harnesses compare models and prompts against real labels, and audit trails record exactly what ran.',
      da: 'Evalueringsværktøjer sammenligner modeller og prompts med rigtige labels, og audit trails registrerer præcis, hvad der kørte.',
    },
    proof: ['jev-eval', 'illux-product-ai'],
  },
  {
    title: { en: 'Guardrails, not trust', da: 'Guardrails, ikke tillid' },
    body: {
      en: 'An agent’s risky actions are checked before they run, and when the check is unsure it fails safe: the call is held for a person instead of going through.',
      da: 'En agents risikable handlinger bliver tjekket, før de kører, og når tjekket er usikkert, vælges den sikre side: kaldet holdes tilbage til et menneske i stedet for at gå igennem.',
    },
    proof: ['jev-tools'],
  },
  {
    title: { en: 'Know when not to use AI', da: 'Vid, hvornår AI ikke skal bruges' },
    body: {
      en: 'Counting, dates, routing and any rule that can be written down stay in plain code. A model only gets the questions that actually need judgement.',
      da: 'Optælling, datoer, routing og enhver regel, der kan skrives ned, bliver i almindelig kode. En model får kun de spørgsmål, der reelt kræver dømmekraft.',
    },
    proof: ['jev-tools'],
  },
];
