import { expect, it } from 'vitest';
import { matchScore } from './palette-match';

it('ranks a leading prefix over a later word prefix over a substring over fuzzy', () => {
  const lead = matchScore('tech', 'Tech Atlas');
  const word = matchScore('atl', 'Tech Atlas');
  const sub = matchScore('las', 'Tech Atlas');
  const fuzzy = matchScore('tatl', 'Tech Atlas');
  expect(lead).toBeGreaterThan(word);
  expect(word).toBeGreaterThan(sub);
  expect(sub).toBeGreaterThan(fuzzy);
  expect(fuzzy).toBeGreaterThan(0);
});

it('treats slug separators as word boundaries', () => {
  expect(matchScore('dot', 'jev-dotnet')).toBeGreaterThanOrEqual(20);
  expect(matchScore('jd', 'jev-dotnet')).toBeGreaterThan(0);
});

it('rejects letters scattered mid-word', () => {
  expect(matchScore('doo', 'Hello, world - booting up')).toBe(-1);
  expect(matchScore('om', 'Conference Administration')).toBe(-1);
  expect(matchScore('dm', 'DevInsight')).toBe(-1);
});

it('needs three letters before a mid-word substring counts', () => {
  expect(matchScore('dm', 'Administration')).toBe(-1);
  expect(matchScore('dmi', 'Administration')).toBeGreaterThan(0);
});

it('never fuzzy-matches prose', () => {
  expect(matchScore('tatl', 'Tech Atlas', false)).toBe(-1);
  expect(matchScore('atlas', 'A map of the Tech Atlas', false)).toBeGreaterThan(0);
});

it('returns -1 for empty input', () => {
  expect(matchScore('', 'anything')).toBe(-1);
  expect(matchScore('a', '')).toBe(-1);
});
