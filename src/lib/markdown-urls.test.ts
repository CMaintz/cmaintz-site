import { describe, expect, it } from 'vitest';
import { markdownAsset, markdownUrl } from './markdown-urls';

describe('markdownUrl', () => {
  it.each([
    ['/services', '/services.md'],
    ['/services/', '/services.md'],
    ['/da/projects/foundry/', '/da/projects/foundry.md'],
    ['/', '/index.md'],
  ])('%s -> %s', (page, md) => expect(markdownUrl(page)).toBe(md));

  it('leaves files alone', () => expect(markdownUrl('/cv.pdf')).toBe('/cv.pdf'));
});

describe('markdownAsset', () => {
  it.each([
    ['/services.md', '/services/index.md'],
    ['/services/.md', '/services/index.md'],
    ['/da/projects/foundry.md', '/da/projects/foundry/index.md'],
  ])('%s -> %s', (url, asset) => expect(markdownAsset(url)).toBe(asset));

  it('ignores HTML pages and twins requested by their own path', () => {
    expect(markdownAsset('/services/')).toBeNull();
    expect(markdownAsset('/services/index.md')).toBeNull();
  });

  // The home twin, "/index.md", is served as a static file, so it never reaches markdownAsset.
  it('resolves the .md URL llms.txt links for every other page', () => {
    for (const page of ['/services/', '/da/', '/projects/foundry/'])
      expect(markdownAsset(markdownUrl(page))).toBe(`${page}index.md`);
  });
});
