import { expect, it } from 'vitest';
import { presetText } from './contact-prefill';

const offers = { package: { 'mini-audit': 'Free mini-audit' }, service: { website: 'Websites' } };
const label = 'I’m interested in:';
const text = (query: string) => presetText(new URLSearchParams(query), offers, label);

it('names the package the visitor came from', () => {
  expect(text('package=mini-audit')).toBe('I’m interested in: Free mini-audit\n\n');
});

it('names the service the visitor came from', () => {
  expect(text('service=website')).toBe('I’m interested in: Websites\n\n');
});

it('prefers the wizard brief, which already names the package', () => {
  expect(text('message=Hi&package=mini-audit')).toBe('Hi');
});

it('ignores ids the site does not offer', () => {
  expect(text('service=toString')).toBe('');
});
