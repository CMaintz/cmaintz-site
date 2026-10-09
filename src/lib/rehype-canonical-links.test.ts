import { describe, expect, it } from 'vitest';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { rehypeCanonicalLinks } from './rehype-canonical-links';

const run = async (html: string) =>
  String(await unified().use(rehypeParse, { fragment: true }).use(rehypeCanonicalLinks).use(rehypeStringify).process(html));

describe('rehypeCanonicalLinks', () => {
  it('adds the trailing slash to internal page links', async () => {
    expect(await run('<p><a href="/projects/foundry">F</a> <a href="/about#x">A</a></p>')).toBe(
      '<p><a href="/projects/foundry/">F</a> <a href="/about/#x">A</a></p>',
    );
  });

  it('leaves external links, files and protocol-relative URLs alone', async () => {
    const html = '<a href="https://github.com/x">g</a><a href="/cv.pdf">c</a><a href="//cdn.example/x">p</a><a href="#top">t</a>';
    expect(await run(html)).toBe(html);
  });
});
