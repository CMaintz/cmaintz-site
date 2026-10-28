import { expect, it } from 'vitest';
import { floatTarget } from './buddy-sprite';

it('glides the last idle frame back to the first frame, so the loop never jumps', () => {
  expect(floatTarget({ bob: [0, 1.5, 3, 1.5] }, 3)).toBe(0);
});

it('glides each idle frame towards the next one', () => {
  expect(floatTarget({ bob: [0, 1.5, 3, 1.5] }, 1)).toBe(3);
});

it('holds clips without a float level with the start of the idle', () => {
  expect(floatTarget({}, 2)).toBe(0);
});
