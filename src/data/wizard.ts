import type { Lang } from '../i18n/ui';
import type { Audience } from './services';

type L = Record<Lang, string>;

/**
 * The /start scoping wizard: questions, their options, and what each "pain"
 * recommends. Ids are what the result and the contact-form brief are built from.
 */
interface WizardOption {
  id: string;
  label: L;
  /** Only shown to visitors who picked this audience in the first step. */
  audience?: Audience;
}

export interface WizardStep {
  id: 'who' | 'pain' | 'size' | 'when' | 'budget';
  question: L;
  options: WizardOption[];
}

/** What a pain point leads to: a starter package, a service and a case to show. */
export interface Recommendation {
  pkg: string;
  service: string;
  case?: string;
}

export const steps: WizardStep[] = [
  {
    id: 'who',
    question: { en: 'Which describes you best?', da: 'Hvad passer bedst på dig?' },
    options: [
      {
        id: 'business',
        label: { en: 'I run or manage a business', da: 'Jeg driver eller leder en virksomhed' },
      },
      {
        id: 'tech',
        label: { en: 'I’m a developer or tech lead', da: 'Jeg er udvikler eller tech lead' },
      },
    ],
  },
  {
    id: 'pain',
    question: { en: 'What would help most right now?', da: 'Hvad ville hjælpe mest lige nu?' },
    options: [
      {
        id: 'manual-work',
        audience: 'business',
        label: {
          en: 'We copy data between systems by hand',
          da: 'Vi flytter data mellem systemer i hånden',
        },
      },
      {
        id: 'ai-content',
        audience: 'business',
        label: {
          en: 'We want AI to write, sort or answer something for us',
          da: 'Vi vil have AI til at skrive, sortere eller svare for os',
        },
      },
      {
        id: 'webshop',
        audience: 'business',
        label: {
          en: 'Our webshop needs a feature or a fix',
          da: 'Vores webshop mangler en funktion eller en rettelse',
        },
      },
      {
        id: 'new-system',
        audience: 'business',
        label: { en: 'We need a new system or app', da: 'Vi har brug for et nyt system eller en app' },
      },
      {
        id: 'unsure',
        audience: 'business',
        label: {
          en: 'Not sure yet - something just takes too much time',
          da: 'Ved ikke endnu - noget tager bare for lang tid',
        },
      },
      {
        id: 'ci',
        audience: 'tech',
        label: { en: 'Builds are slow, flaky or not trusted', da: 'Builds er langsomme, ustabile eller utroværdige' },
      },
      {
        id: 'legacy',
        audience: 'tech',
        label: { en: 'Legacy code nobody dares touch', da: 'Legacy-kode, ingen tør røre' },
      },
      {
        id: 'ai-agents',
        audience: 'tech',
        label: {
          en: 'Coding agents create more review work than they save',
          da: 'Kodeagenter skaber mere review, end de sparer',
        },
      },
      {
        id: 'ai-feature',
        audience: 'tech',
        label: { en: 'We want to ship an LLM feature that holds up', da: 'Vi vil lancere en LLM-funktion, der holder' },
      },
      {
        id: 'build',
        audience: 'tech',
        label: { en: 'We need extra hands to build something', da: 'Vi mangler hænder til at bygge noget' },
      },
    ],
  },
  {
    id: 'size',
    question: { en: 'How many people work there?', da: 'Hvor mange arbejder der?' },
    options: [
      { id: '1-5', label: { en: '1-5', da: '1-5' } },
      { id: '6-20', label: { en: '6-20', da: '6-20' } },
      { id: '21-100', label: { en: '21-100', da: '21-100' } },
      { id: '100+', label: { en: 'More than 100', da: 'Over 100' } },
    ],
  },
  {
    id: 'when',
    question: { en: 'When should something be in place?', da: 'Hvornår skal noget være på plads?' },
    options: [
      { id: 'asap', label: { en: 'As soon as possible', da: 'Hurtigst muligt' } },
      { id: 'quarter', label: { en: 'Within a few months', da: 'Inden for et par måneder' } },
      { id: 'exploring', label: { en: 'Just exploring', da: 'Vi undersøger bare' } },
    ],
  },
  {
    id: 'budget',
    question: { en: 'Roughly what budget do you have in mind?', da: 'Cirka hvilket budget har I i tankerne?' },
    options: [
      { id: 'small', label: { en: 'Under 5,000 DKK', da: 'Under 5.000 kr.' } },
      { id: 'medium', label: { en: '5,000-25,000 DKK', da: '5.000-25.000 kr.' } },
      { id: 'large', label: { en: 'More than 25,000 DKK', da: 'Over 25.000 kr.' } },
      { id: 'unknown', label: { en: 'No idea yet', da: 'Ingen idé endnu' } },
    ],
  },
];

export const recommendations: Record<string, Recommendation> = {
  'manual-work': { pkg: 'automation-check', service: 'automation', case: 'email-preview' },
  'ai-content': { pkg: 'ai-sprint', service: 'ai-integration', case: 'illux' },
  webshop: { pkg: 'mini-audit', service: 'shopware', case: 'illux' },
  'new-system': { pkg: 'mini-audit', service: 'fullstack', case: 'stablehand' },
  unsure: { pkg: 'mini-audit', service: 'automation' },
  ci: { pkg: 'gate-starter', service: 'quality-gate', case: 'foundry' },
  legacy: { pkg: 'gate-starter', service: 'quality-gate', case: 'foundry' },
  'ai-agents': { pkg: 'mini-audit', service: 'ai-dev', case: 'foundry' },
  'ai-feature': { pkg: 'ai-sprint', service: 'ai-integration', case: 'illux' },
  build: { pkg: 'mini-audit', service: 'fullstack' },
};
