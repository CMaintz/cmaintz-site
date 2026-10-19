import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIR = 'src/content/blog';

const field = (fm: string, key: string) => fm.match(new RegExp(`^${key}:\\s*['"]?([^'"\\s]+)`, 'm'))?.[1];

const posts = new Map(
  readdirSync(DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => {
      const fm = readFileSync(join(DIR, f), 'utf8').split('---')[1] ?? '';
      return [f.replace(/\.mdx?$/, ''), { lang: field(fm, 'lang') ?? 'en', translation: field(fm, 'translation') }];
    }),
);
const paired = [...posts].filter(([, p]) => p.translation);

describe('post translations', () => {
  it.each(paired)('%s links to an existing post in the other language that links back', (id, p) => {
    const other = posts.get(p.translation!);
    expect(other, `${p.translation} does not exist`).toBeDefined();
    expect(other!.lang).not.toBe(p.lang);
    expect(other!.translation).toBe(id);
  });
});
