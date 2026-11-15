import { expect, it } from 'vitest';
import { formatDkk, fromPriceDkk } from './price';
import { estimate } from './assistant-estimate';

it('fromPriceDkk: is the low end of the smallest estimate, so it matches what Buddy quotes', () => {
  const small = estimate({ service: 'website', size: 'small' });
  const low = 'dkk' in small ? small.dkk.low : undefined;
  expect(low).toBeGreaterThan(0);
  expect(fromPriceDkk('website')).toBe(low);
});

it('fromPriceDkk: gives no price for a service without a rubric', () => {
  expect(fromPriceDkk('blockchain')).toBeUndefined();
});

it('formatDkk: groups thousands the way each language reads them', () => {
  expect(formatDkk(14500, 'da')).toBe('14.500 DKK');
  expect(formatDkk(14500, 'en')).toBe('14,500 DKK');
});
