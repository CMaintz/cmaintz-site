import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import keystatic from '../keystatic.config';

const DIR = 'src/content/blog';
const content = keystatic.collections!.blog.schema.content;

// The lines a save must keep verbatim: code fence openers and component tags. List
// markers and table padding are Keystatic's own formatting, so those are normalised away.
const kept = (md: string) =>
  md
    .split('\n')
    .filter((l) => /^```\S|<[A-Za-z]/.test(l))
    .map((l) => l.replace(/^\s*(?:[-*+]|\d+\.)\s+/, '').trim());

function roundTrip(file: string) {
  const body = readFileSync(`${DIR}/${file}`, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  const ctx = { content: new TextEncoder().encode(body), other: new Map(), external: new Map(), slug: file };
  const value = content.parse(undefined, ctx);
  return { body, saved: new TextDecoder().decode(content.serialize(value, { slug: file }).content) };
}

// A post the editor can't parse fails on open, and one it serialises lossily is
// corrupted on the next save, so every post must survive a load and save.
describe.each(readdirSync(DIR).filter((f) => f.endsWith('.mdx')))('%s in the Keystatic editor', (file) => {
  it('opens and saves with its code fences and components intact', () => {
    const { body, saved } = roundTrip(file);
    expect(kept(saved)).toEqual(kept(body));
  });
});
