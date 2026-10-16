import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { AREA_IDS, areas } from './areas';

const projectIds = new Set(readdirSync('src/content/projects').map((f) => f.replace(/\.mdx?$/, '')));

describe('area principles', () => {
  // The view links every proof slug as-is, so a typo or a renamed project would
  // ship a broken "undefined" link instead of failing the build.
  it('only cite projects that exist', () => {
    const missing = AREA_IDS.flatMap((id) =>
      areas[id].principles.flatMap((p) => (p.proof ?? []).filter((slug) => !projectIds.has(slug))),
    );
    expect(missing).toEqual([]);
  });
});
