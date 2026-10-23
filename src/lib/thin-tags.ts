// Build step (Node, from astro.config.mjs): the tag pages too thin to index, so the
// sitemap can leave out the same pages BlogIndexView marks `noindex`. Reads the posts'
// front matter, since the content collections aren't loaded yet when the config runs.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { splitPost, toMeta } from './crosspost';
import { isThinTag } from '../data/tags';
import { localize } from '../i18n/ui';

/** Canonical paths ("/da/blog/tags/astro/") of tag pages listing too few published posts. */
export function thinTagPaths(dir: string) {
  const counts = new Map<string, number>();
  for (const file of readdirSync(dir).filter((f) => /\.mdx?$/.test(f))) {
    const meta = toMeta(file, splitPost(readFileSync(join(dir, file), 'utf8'), parse).data);
    if (meta.draft) continue;
    for (const tag of meta.tags) {
      const path = localize(`/blog/tags/${tag}`, meta.lang);
      counts.set(path, (counts.get(path) ?? 0) + 1);
    }
  }
  return new Set([...counts].filter(([, n]) => isThinTag(n)).map(([path]) => path));
}
