import { site } from '../data/site';

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

export function personLd(base: URL | undefined) {
  return {
    '@type': 'Person',
    '@id': `${base}#person`,
    name: site.name,
    jobTitle: site.role.en,
    email: `mailto:${site.email}`,
    url: base?.toString(),
    image: new URL('/img/christoffer.jpg', base).toString(),
    address: { '@type': 'PostalAddress', addressLocality: 'Aarhus', addressCountry: 'DK' },
    sameAs: [site.socials.github, site.socials.linkedin].filter(Boolean),
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
    item: new URL(path, base).toString(),
  }));
  return { '@type': 'BreadcrumbList', itemListElement: items };
}

export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes });
