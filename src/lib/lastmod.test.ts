import { describe, expect, it } from 'vitest';
import { lastmodFor } from './lastmod';

const dates = { '/services/': '2026-10-07T12:00:00.000Z', '/': '2026-10-01T00:00:00.000Z' };

describe('lastmodFor', () => {
  it('matches both locales and either slash form', () => {
    expect(lastmodFor(dates, 'https://maintz.dev/services/')).toBe(dates['/services/']);
    expect(lastmodFor(dates, 'https://maintz.dev/da/services')).toBe(dates['/services/']);
    expect(lastmodFor(dates, 'https://maintz.dev/da/')).toBe(dates['/']);
  });

  it('returns undefined for pages without a known date', () => {
    expect(lastmodFor(dates, 'https://maintz.dev/search/')).toBeUndefined();
  });
});
