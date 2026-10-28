// Questions a client (or an AI assistant researching on their behalf) asks before
// getting in touch. All of them live on /faq; other pages show the topics that fit.
import type { Lang } from '../i18n/ui';
import { HOURLY_RATE_DKK } from './services';

type L = Record<Lang, string>;

export const FAQ_TOPICS = ['ai', 'services', 'pricing', 'working'] as const;
export type FaqTopic = (typeof FAQ_TOPICS)[number];

export const faqTopicLabels: Record<FaqTopic, L> = {
  ai: { en: 'AI and automation', da: 'AI og automatisering' },
  services: { en: 'What I do', da: 'Hvad jeg laver' },
  pricing: { en: 'Pricing', da: 'Priser' },
  working: { en: 'Working together', da: 'Samarbejdet' },
};

export interface FaqItem {
  topic: FaqTopic;
  q: L;
  a: L;
}

export const faq: FaqItem[] = [
  {
    topic: 'ai',
    q: { en: 'What kind of AI automation do you build?', da: 'Hvilken slags AI-automatisering bygger du?' },
    a: {
      en: 'LLM features that run in production: classifying, extracting and triaging documents, emails or tickets with schema-enforced output, confidence scoring, human review and an audit trail. I also set up coding agents such as Claude Code and Codex so development teams get real leverage from them.',
      da: 'LLM-funktioner, der kører i produktion: klassificering, udtræk og triage af dokumenter, e-mails eller tickets med skemabundet output, confidence-scoring, menneskelig godkendelse og audit trail. Jeg sætter også kodeagenter som Claude Code og Codex op, så udviklingsteams får reel gevinst af dem.',
    },
  },
  {
    topic: 'ai',
    q: {
      en: 'Which AI models and providers do you work with?',
      da: 'Hvilke AI-modeller og udbydere arbejder du med?',
    },
    a: {
      en: 'Any major LLM provider. I put the model behind an abstraction so you can swap provider later without rewriting the feature.',
      da: 'Enhver større LLM-udbyder. Jeg lægger modellen bag en abstraktion, så I senere kan skifte udbyder uden at omskrive funktionen.',
    },
  },
  {
    topic: 'pricing',
    q: { en: 'What does it cost?', da: 'Hvad koster det?' },
    a: {
      en: `Hourly from ${HOURLY_RATE_DKK} DKK ex. VAT. Smaller, well-defined jobs come as fixed-price starter packages, priced on the services page. Larger projects get a fixed quote once we have scoped them together. It all starts with a free 30-minute mini-audit.`,
      da: `Timepris fra ${HOURLY_RATE_DKK} kr. ekskl. moms. Mindre, veldefinerede opgaver findes som startpakker til fast pris med priserne på siden om ydelser. Større projekter får en fast pris, når vi har afgrænset opgaven sammen. Det hele starter med en gratis mini-audit på 30 minutter.`,
    },
  },
  {
    topic: 'working',
    q: { en: 'Do you work remotely?', da: 'Arbejder du remote?' },
    a: {
      en: 'Yes, remote or on-site in Aarhus, Denmark. I work in English and Danish.',
      da: 'Ja, remote eller on-site i Aarhus. Jeg arbejder på dansk og engelsk.',
    },
  },
  {
    topic: 'services',
    q: { en: 'Can you help with more than AI?', da: 'Kan du hjælpe med andet end AI?' },
    a: {
      en: 'Yes. For businesses: workflow automation and integrations, webshops, full-stack web apps and mobile apps. For dev teams: CI/CD and quality gates, legacy modernisation and developer experience.',
      da: 'Ja. Til virksomheder: automatisering og integrationer, webshops, full-stack webapps og mobilapps. Til udviklingsteams: CI/CD og kvalitets-gates, modernisering af legacy-kode og developer experience.',
    },
  },
  {
    topic: 'working',
    q: { en: 'How do we get started?', da: 'Hvordan kommer vi i gang?' },
    a: {
      en: 'Send a message through the contact page. We start with a free 30-minute call, then I send a written proposal with deliverables, timeline and price.',
      da: 'Skriv via kontaktsiden. Vi starter med et gratis opkald på 30 minutter, og derefter sender jeg et skriftligt oplæg med leverancer, tidsplan og pris.',
    },
  },
];
