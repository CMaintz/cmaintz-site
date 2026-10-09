import type { Lang } from '../i18n/ui';
import type { Audience } from './services';

type L = Record<Lang, string>;

/**
 * Outcome-first case studies for /services. Every claim here must be backed by
 * the linked project page - no invented numbers. `context` says plainly what
 * kind of work it was (client, internship, open source, student).
 */
export interface CaseStudy {
  id: string;
  /** Slug of the project page with the full technical write-up. */
  project: string;
  audience: Audience;
  context: L;
  title: L;
  problem: L;
  solution: L;
  outcomes: Record<Lang, string[]>;
}

export const cases: CaseStudy[] = [
  {
    id: 'illux',
    project: 'illux-product-ai',
    audience: 'business',
    context: { en: 'Webshop · Illux, via WEXO A/S', da: 'Webshop · Illux, via WEXO A/S' },
    title: {
      en: 'Product texts in four languages, written by AI and checked by people',
      da: 'Produkttekster på fire sprog, skrevet af AI og kontrolleret af mennesker',
    },
    problem: {
      en: 'Every artwork in the catalogue needed a description, SEO data, categories and tags in Danish, English, Norwegian and Swedish - all written by hand, and the catalogue kept growing.',
      da: 'Hvert kunstværk i kataloget skulle have beskrivelse, SEO-data, kategorier og tags på dansk, engelsk, norsk og svensk - alt skrevet i hånden, og kataloget voksede hele tiden.',
    },
    solution: {
      en: 'A plugin for their webshop that reads the product image and data, writes all four languages in one go, scores its own confidence and sends anything uncertain to a person for approval. Plus a "see it on your own wall" feature for shoppers.',
      da: 'Et plugin til webshoppen, der læser produktbillede og data, skriver alle fire sprog på én gang, vurderer sin egen sikkerhed og sender alt usikkert til godkendelse hos et menneske. Plus en "se det på din egen væg"-funktion til kunderne.',
    },
    outcomes: {
      en: ['3,000+ products enriched', 'Hundreds of hours of manual work saved', 'Business-critical and still in daily use'],
      da: ['3.000+ produkter beriget', 'Hundredvis af timers manuelt arbejde sparet', 'Forretningskritisk og stadig i daglig brug'],
    },
  },
  {
    id: 'email-preview',
    project: 'email-template-preview',
    audience: 'business',
    context: { en: 'E-commerce platform · WEXO A/S', da: 'E-handelsplatform · WEXO A/S' },
    title: {
      en: 'Check order emails before customers see them - without fake orders',
      da: 'Tjek ordremails, før kunderne ser dem - uden testordrer',
    },
    problem: {
      en: 'The only way to see what an order confirmation really looked like was to place a test order in the shop. Slow, easy to skip, and errors reached customers.',
      da: 'Den eneste måde at se, hvordan en ordrebekræftelse reelt så ud, var at lægge en testordre i shoppen. Langsomt, nemt at springe over, og fejl nåede ud til kunderne.',
    },
    solution: {
      en: 'A preview inside the admin that renders any email template with real order and customer data, shows it the way Gmail and different devices would, and sends a test mail with one click.',
      da: 'En forhåndsvisning i admin, der viser enhver mailskabelon med rigtige ordre- og kundedata, som Gmail og forskellige enheder ville vise den, og sender en testmail med ét klik.',
    },
    outcomes: {
      en: ['No more storefront test orders', 'Fewer broken emails in production', 'Faster, safer template releases'],
      da: ['Ingen testordrer i shoppen', 'Færre fejl i mails i produktion', 'Hurtigere og sikrere udgivelse af skabeloner'],
    },
  },
  {
    id: 'foundry',
    project: 'foundry',
    audience: 'tech',
    context: { en: 'Open source · my own tooling', da: 'Open source · mit eget værktøj' },
    title: {
      en: 'One quality gate for humans, AI agents and CI',
      da: 'Én kvalitets-gate for udviklere, AI-agenter og CI',
    },
    problem: {
      en: 'Code that passes on the laptop fails in CI, and AI coding agents fix one check while breaking another - or quietly weaken the rule that blocked them.',
      da: 'Kode, der består på laptoppen, fejler i CI, og AI-kodeagenter retter ét tjek og ødelægger et andet - eller svækker i det stille den regel, der stod i vejen.',
    },
    solution: {
      en: 'One deterministic rule set - format, lint, types, tests, coverage, security - run identically while the agent edits, before push and in CI, with a ratchet so legacy code can adopt it on day one.',
      da: 'Ét deterministisk regelsæt - formatering, lint, typer, tests, coverage, sikkerhed - der kører ens, mens agenten redigerer, før push og i CI, med en ratchet, så legacy-kode kan tage det i brug fra dag ét.',
    },
    outcomes: {
      en: ['Same verdict in editor, pre-push and CI', 'Templates for 6 stacks', 'Gates this site and my open-source repos'],
      da: ['Samme resultat i editor, pre-push og CI', 'Skabeloner til 6 stacks', 'Håndhæver kvaliteten på dette site og mine open source-repos'],
    },
  },
  {
    id: 'stablehand',
    project: 'stablehand',
    audience: 'business',
    context: { en: 'Riding school · student group project', da: 'Rideskole · studieprojekt i gruppe' },
    title: {
      en: 'Online booking for a local riding school',
      da: 'Online booking til en lokal rideskole',
    },
    problem: {
      en: 'Hørning Rideskole juggles lessons, horses, riders and a mucking-out rota, each with its own rules about who can book what and when.',
      da: 'Hørning Rideskole jonglerer lektioner, heste, ryttere og en mugningsordning, hver med egne regler for, hvem der kan booke hvad og hvornår.',
    },
    solution: {
      en: 'A booking system with logins per role that knows the school’s rules: a sick horse can’t be booked, cancellations notify riders by email, and mucking-out shifts earn a free lesson.',
      da: 'Et bookingsystem med login pr. rolle, der kender skolens regler: en syg hest kan ikke bookes, aflysninger sendes til rytterne på mail, og mugningsvagter giver en gratis lektion.',
    },
    outcomes: {
      en: ['Rules enforced by the system, not by memory', 'Automatic cancellation emails', 'Covered by automated acceptance tests'],
      da: ['Reglerne håndhæves af systemet, ikke af hukommelsen', 'Automatiske mails ved aflysning', 'Dækket af automatiske accepttests'],
    },
  },
];
