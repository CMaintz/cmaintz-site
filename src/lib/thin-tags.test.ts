import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { thinTagPaths } from './thin-tags';
import { MIN_TAG_POSTS } from '../data/tags';

const post = (dir: string, name: string, fm: string) => writeFileSync(join(dir, name), `---\n${fm}\n---\nBody\n`);

describe('thinTagPaths', () => {
  it('lists tags below the threshold per language, skipping drafts', () => {
    const dir = mkdtempSync(join(tmpdir(), 'tags-'));
    for (let i = 0; i < MIN_TAG_POSTS; i++) post(dir, `en-${i}.mdx`, 'tags: [ai, meta]\npubDate: 2026-10-01');
    post(dir, 'da-0.mdx', 'lang: da\ntags:\n  - ai\npubDate: 2026-10-01');
    post(dir, 'draft.mdx', 'tags: [astro]\ndraft: true\npubDate: 2026-10-01');
    const thin = thinTagPaths(dir);
    expect(thin.has('/blog/tags/ai/')).toBe(false);
    expect(thin.has('/da/blog/tags/ai/')).toBe(true);
    expect(thin.has('/blog/tags/astro/')).toBe(false);
  });
});
