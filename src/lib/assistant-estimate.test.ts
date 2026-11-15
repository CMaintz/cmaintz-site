import { expect, it } from 'vitest';
import { estimate } from './assistant-estimate';
import { estimateRubric } from '../data/assistant';
import { services, FOLLOW_UP_HOURS, HOURLY_RATE_DKK } from '../data/services';

it('estimate: adds no follow-up to an end of the range under four hours', () => {
  const [lo] = estimateRubric['seo-geo'].hours.small;
  expect(lo).toBeLessThan(4);
  expect(estimate({ service: 'seo-geo', size: 'small' })).toMatchObject({ hours: { low: lo } });
});

it('estimate: prices the hour range plus follow-up at the hourly rate, ex. VAT and non-binding', () => {
  const [lo, hi] = estimateRubric['quality-gate'].hours.medium;
  const [fLo, fHi] = FOLLOW_UP_HOURS;
  expect(estimate({ service: 'quality-gate', size: 'medium' })).toMatchObject({
    hours: { low: lo + fLo, high: hi + fHi },
    dkk: { low: (lo + fLo) * HOURLY_RATE_DKK, high: (hi + fHi) * HOURLY_RATE_DKK },
    vatIncluded: false,
    binding: false,
  });
});

it('estimate: rejects a service id the site does not offer', () => {
  expect(estimate({ service: 'blockchain', size: 'small' })).toEqual({
    error: expect.stringContaining('blockchain'),
  });
});

it('estimate: rejects an unknown size instead of pricing it as something else', () => {
  expect(estimate({ service: 'webshop', size: 'huge' })).toEqual({ error: expect.stringContaining('huge') });
});

it('estimate: has a rubric for every service on the site', () => {
  const missing = services.map((s) => s.id).filter((id) => !estimateRubric[id]);
  expect(missing).toEqual([]);
});

it('estimate: keeps every range ordered and growing with size', () => {
  for (const { hours } of Object.values(estimateRubric)) {
    expect(hours.small[0]).toBeLessThanOrEqual(hours.small[1]);
    expect(hours.small[1]).toBeLessThanOrEqual(hours.medium[1]);
    expect(hours.medium[1]).toBeLessThanOrEqual(hours.large[1]);
  }
});
