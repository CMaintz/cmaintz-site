import { site } from '../data/site';
import { areas } from '../data/areas';
import { faq } from '../data/faq';
import { packages, type Package } from '../data/packages';
import { HOURLY_RATE_DKK, services, type Service } from '../data/services';
import { type Lang, locales, localize, withSlash } from '../i18n/ui';

/** Search results show ~155-160 characters; cut at a word boundary. */
export function clipDescription(text: string, max = 158) {
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(' ', max - 1)).replace(/[,.;:\s-]+$/, '') + '…';
}

// Known at build time by Vite, so it works in any runtime (the Workers
// prerender can't read the disk). Only the keys (file paths) are used.
const OG_FILES = new Set(
  Object.keys(import.meta.glob('/public/og/**/*.png', { query: '?url' })).map((k) => k.replace('/public', '')),
);

/** Per-page share image if `npm run og` generated one, else the site default. */
export function ogImageFor(kind: 'projects' | 'blog' | 'areas', id: string) {
  const path = `/og/${kind}/${id}.png`;
  return OG_FILES.has(path) ? path : '/og.png';
}

const denmark = { '@type': 'Country', name: 'Denmark' };

/** Who to contact, shared by the Person and the business it runs. */
function contactLd(base: URL | undefined) {
  return {
    name: site.name,
    url: base?.toString(),
    image: new URL('/img/christoffer.jpg', base).toString(),
    email: `mailto:${site.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Aarhus', addressCountry: 'DK' },
    sameAs: [site.socials.github, site.socials.linkedin].filter(Boolean),
  };
}

const catalogId = (base: URL | undefined, lang: Lang) => `${new URL(localize('/services', lang), base)}#catalog`;

/** Both languages' catalogs: the Person and business nodes appear on pages of either language. */
const catalogRefs = (base: URL | undefined) => locales.map((lang) => ({ '@id': catalogId(base, lang) }));

export function personLd(base: URL | undefined) {
  return {
    '@type': 'Person',
    '@id': `${base}#person`,
    ...contactLd(base),
    jobTitle: site.role.en,
    knowsAbout: ['AI automation', 'LLM integration', ...Object.values(areas).map((a) => a.label.en)],
    knowsLanguage: ['en', 'da'],
    hasOfferCatalog: catalogRefs(base),
  };
}

/**
 * The freelance business behind the Person. Organization rather than
 * ProfessionalService: schema.org deprecated that type, and as a LocalBusiness
 * it would ask for a street address and opening hours a remote freelancer lacks.
 */
export function businessLd(base: URL | undefined, lang: Lang) {
  return {
    '@type': 'Organization',
    '@id': `${base}#business`,
    ...contactLd(base),
    description: site.description[lang],
    areaServed: denmark,
    founder: { '@id': `${base}#person` },
    hasOfferCatalog: catalogRefs(base),
  };
}

const hourly = {
  '@type': 'UnitPriceSpecification',
  price: HOURLY_RATE_DKK,
  priceCurrency: 'DKK',
  unitCode: 'HUR',
  valueAddedTaxIncluded: false,
};

/** One service as an Offer; only hourly work has a fixed price to state. */
function offerLd(base: URL | undefined, s: Service, lang: Lang) {
  return {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name: s.title[lang],
      description: s.body[lang],
      provider: { '@id': `${base}#person` },
      areaServed: denmark,
      availableLanguage: ['en', 'da'],
    },
    ...(s.pricing !== 'quote' && { priceSpecification: hourly }),
  };
}

/** A starter package as an Offer. `price` alone can't say ex. VAT; the spec carries that. */
function packageOfferLd(base: URL | undefined, p: Package, lang: Lang) {
  const price = { price: p.priceDkk, priceCurrency: 'DKK' };
  return {
    '@type': 'Offer',
    ...price,
    priceSpecification: { '@type': 'PriceSpecification', ...price, valueAddedTaxIncluded: false },
    itemOffered: {
      '@type': 'Service',
      name: p.title[lang],
      description: p.body[lang],
      provider: { '@id': `${base}#person` },
      areaServed: denmark,
    },
  };
}

/** Freelance services and starter packages from /services, linked from the Person node. */
export function offerCatalogLd(base: URL | undefined, lang: Lang) {
  return {
    '@type': 'OfferCatalog',
    '@id': catalogId(base, lang),
    name: lang === 'da' ? 'Freelanceydelser' : 'Freelance services',
    url: new URL(localize('/services', lang), base).toString(),
    itemListElement: [
      ...services.map((s) => offerLd(base, s, lang)),
      ...packages.map((p) => packageOfferLd(base, p, lang)),
    ],
  };
}

export function faqLd(lang: Lang) {
  return {
    '@type': 'FAQPage',
    mainEntity: faq[lang].map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function websiteLd(base: URL | undefined) {
  return {
    '@type': 'WebSite',
    '@id': `${base}#website`,
    url: base?.toString(),
    name: site.name,
    inLanguage: ['en', 'da'],
    publisher: { '@id': `${base}#person` },
  };
}

/** Crumbs are [name, absolute-or-relative path] pairs, starting after "Home". */
export function breadcrumbLd(base: URL | undefined, crumbs: [string, string][]) {
  const items = [['Home', '/'], ...crumbs].map(([name, path], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: new URL(withSlash(path), base).toString(),
  }));
  return { '@type': 'BreadcrumbList', itemListElement: items };
}

export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes });
