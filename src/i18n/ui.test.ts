import { describe, expect, it } from 'vitest';
import { localize, withSlash } from './ui';

describe('withSlash', () => {
  it('adds a trailing slash to page paths, before any query or fragment', () => {
    expect(withSlash('/about')).toBe('/about/');
    expect(withSlash('/about#values-h')).toBe('/about/#values-h');
    expect(withSlash('/contact?topic=freelance')).toBe('/contact/?topic=freelance');
  });

  it('leaves slashed paths, the root and files alone', () => {
    for (const p of ['/', '/#focus-h', '/blog/', '/cv.pdf', '/rss.xml', '/og/blog/x.png']) expect(withSlash(p)).toBe(p);
  });
});

describe('localize', () => {
  it('returns the canonical form for each locale', () => {
    expect(localize('/services', 'en')).toBe('/services/');
    expect(localize('/services', 'da')).toBe('/da/services/');
    expect(localize('/', 'da')).toBe('/da/');
    expect(localize('/contact?topic=freelance', 'da')).toBe('/da/contact/?topic=freelance');
  });
});
