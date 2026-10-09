import { describe, expect, it } from 'vitest';
import { htmlToMarkdown } from './markdown-pages';

const page = `<!doctype html><html><head><title>Services · CM</title><script>evil()</script></head><body>
<header><nav><a href="/">Home</a></nav></header>
<main><h1>Services</h1><p>Hourly from <strong>650 DKK</strong>.</p>
<span aria-hidden="true">◈</span><svg><text>icon</text></svg><form><button>Send</button></form>
<ul><li>One</li><li>Two</li></ul><script>alert(1)</script></main>
<footer>Footer text</footer></body></html>`;

describe('htmlToMarkdown', () => {
  it('keeps only <main>, with the title and URL as front matter', async () => {
    const md = await htmlToMarkdown(page, 'https://maintz.dev/services/');
    expect(md).toMatch(/^---\ntitle: "Services · CM"\nurl: https:\/\/maintz.dev\/services\/\n---/);
    expect(md).toContain('# Services');
    expect(md).toContain('Hourly from **650 DKK**.');
    expect(md).toMatch(/\* One\n\* Two/);
    expect(md).not.toMatch(/Home|Footer text/);
  });

  it('drops scripts, forms and decorative markup', async () => {
    const md = await htmlToMarkdown(page, 'https://maintz.dev/');
    expect(md).not.toMatch(/evil|alert|◈|icon|Send/);
  });
});
