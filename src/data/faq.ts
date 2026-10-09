// Questions a client (or an AI assistant researching on their behalf) asks before
// getting in touch. Shown on /services and published as FAQPage JSON-LD.
import type { Lang } from '../i18n/ui';
import { HOURLY_RATE_DKK } from './services';

export const faq: Record<Lang, { q: string; a: string }[]> = {
  en: [
    {
      q: 'What kind of AI automation do you build?',
      a: 'LLM features that run in production: classifying, extracting and triaging documents, emails or tickets with schema-enforced output, confidence scoring, human review and an audit trail. I also set up coding agents such as Claude Code and Codex so development teams get real leverage from them.',
    },
    {
      q: 'Which AI models and providers do you work with?',
      a: 'Any major LLM provider. I put the model behind an abstraction so you can swap provider later without rewriting the feature.',
    },
    {
      q: 'What does it cost?',
      a: `Hourly from ${HOURLY_RATE_DKK} DKK ex. VAT. Fixed-price work is quoted after scoping, because the price depends on the complexity. The first 30-minute call is free.`,
    },
    {
      q: 'Do you work remotely?',
      a: 'Yes, remote or on-site in Aarhus, Denmark. I work in English and Danish.',
    },
    {
      q: 'Can you help with more than AI?',
      a: 'Yes. Developer experience, CI/CD and quality gates, DevOps, Shopware 6 plugins and full-stack web apps are all part of what I do.',
    },
    {
      q: 'How do we get started?',
      a: 'Send a message through the contact page. We start with a free 30-minute call, then I send a written proposal with deliverables, timeline and price.',
    },
  ],
  da: [
    {
      q: 'Hvilken slags AI-automatisering bygger du?',
      a: 'LLM-funktioner, der kører i produktion: klassificering, udtræk og triage af dokumenter, e-mails eller tickets med skemabundet output, confidence-scoring, menneskelig godkendelse og audit trail. Jeg sætter også kodeagenter som Claude Code og Codex op, så udviklingsteams får reel gevinst af dem.',
    },
    {
      q: 'Hvilke AI-modeller og udbydere arbejder du med?',
      a: 'Enhver større LLM-udbyder. Jeg lægger modellen bag en abstraktion, så I senere kan skifte udbyder uden at omskrive funktionen.',
    },
    {
      q: 'Hvad koster det?',
      a: `Timepris fra ${HOURLY_RATE_DKK} kr. ekskl. moms. Opgaver til fast pris får et tilbud efter afgrænsning, fordi prisen afhænger af kompleksiteten. Det første 30-minutters opkald er gratis.`,
    },
    {
      q: 'Arbejder du remote?',
      a: 'Ja, remote eller on-site i Aarhus. Jeg arbejder på dansk og engelsk.',
    },
    {
      q: 'Kan du hjælpe med andet end AI?',
      a: 'Ja. Developer experience, CI/CD og kvalitets-gates, DevOps, Shopware 6-plugins og full-stack webapps er alt sammen en del af det, jeg laver.',
    },
    {
      q: 'Hvordan kommer vi i gang?',
      a: 'Skriv via kontaktsiden. Vi starter med et gratis opkald på 30 minutter, og derefter sender jeg et skriftligt oplæg med leverancer, tidsplan og pris.',
    },
  ],
};
