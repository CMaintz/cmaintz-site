import { describe, expect, it } from 'vitest';
import { locales } from '../i18n/ui';
import { businessLd, offerCatalogLd, personLd } from './seo';

const base = new URL('https://maintz.dev/');

/** Every `{ '@id': ... }` reference object anywhere under `node`. */
function refs(node: unknown): string[] {
  if (Array.isArray(node)) return node.flatMap(refs);
  if (!node || typeof node !== 'object') return [];
  const entries = Object.entries(node);
  if (entries.length === 1 && entries[0][0] === '@id') return [entries[0][1] as string];
  return entries.flatMap(([, v]) => refs(v));
}

const catalogs = locales.map((lang) => offerCatalogLd(base, lang));

describe('services structured data', () => {
  it('gives each language its own catalog, so crawlers do not merge them', () => {
    expect(new Set(catalogs.map((c) => c['@id'])).size).toBe(locales.length);
  });

  it.each(locales)('links the %s catalog from the Person and the business', (lang) => {
    const id = offerCatalogLd(base, lang)['@id'];
    expect(refs(personLd(base))).toContain(id);
    expect(refs(businessLd(base, lang))).toContain(id);
  });

  it('resolves every @id reference to a node published on the site', () => {
    const nodes = [personLd(base), ...locales.map((lang) => businessLd(base, lang)), ...catalogs];
    const ids = new Set(nodes.map((n) => n['@id']));
    for (const ref of refs(nodes)) expect(ids).toContain(ref);
  });
});
