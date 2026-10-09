import { describe, expect, it } from 'vitest';
import { stackLanguages, techId, techIds } from './tech';

describe('stackLanguages', () => {
  it('reads versioned names', () => {
    expect(stackLanguages(['Java 21', 'PHP 8.1+', 'Python 3.10+'])).toEqual(['Java', 'PHP', 'Python']);
  });

  it("doesn't take JavaScript for Java or a framework for a language", () => {
    expect(stackLanguages(['JavaScript', 'JavaFX', 'React 19'])).toEqual(['JavaScript']);
  });
});

describe('techIds', () => {
  it('makes hash-safe ids and puts the flags first', () => {
    expect(techId('C#')).toBe('csharp');
    expect(techIds({ stack: ['C#', 'TypeScript'], aiPowered: true, frontend: true })).toEqual([
      'frontend',
      'ai-powered',
      'typescript',
      'csharp',
    ]);
  });
});
