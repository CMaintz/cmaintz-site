import { describe, expect, it } from 'vitest';
import { completions, ShellHistory } from './shell-history';

const withLines = (...lines: string[]) => {
  const h = new ShellHistory();
  lines.forEach((l) => h.remember(l));
  return h;
};

describe('ShellHistory: walking', () => {
  it('walks back from newest to oldest and stops there', () => {
    const h = withLines('ls', 'help');
    expect(h.recall(-1, '')).toBe('help');
    expect(h.recall(-1, '')).toBe('ls');
    expect(h.recall(-1, '')).toBeUndefined();
    expect(h.recall(1, 'ls')).toBe('help');
  });

  it('restores the half-typed line when walking back down past the newest entry', () => {
    const h = withLines('ls');
    expect(h.recall(-1, 'who')).toBe('ls');
    expect(h.recall(1, 'ls')).toBe('who');
    expect(h.recall(1, 'who')).toBeUndefined();
  });
});

describe('ShellHistory: remembering', () => {
  it('skips blank lines and immediate repeats, like bash with ignoreboth', () => {
    const h = withLines('help', '  ', 'help', 'ls', 'help');
    const walked = [h.recall(-1, ''), h.recall(-1, ''), h.recall(-1, ''), h.recall(-1, '')];
    expect(walked).toEqual(['help', 'ls', 'help', undefined]);
  });

  it('starts recall from the newest entry again after each submitted line', () => {
    const h = withLines('ls', 'help');
    h.recall(-1, '');
    h.recall(-1, '');
    h.remember('contact');
    expect(h.recall(-1, '')).toBe('contact');
  });
});

describe('completions', () => {
  it('matches on prefix, ignoring case and surrounding spaces', () => {
    const commands = ['whoami', 'ls', 'contact', 'clear'];
    expect(completions(' WHO ', commands)).toEqual(['whoami']);
    expect(completions('c', commands)).toEqual(['contact', 'clear']);
    expect(completions('x', commands)).toEqual([]);
  });
});
