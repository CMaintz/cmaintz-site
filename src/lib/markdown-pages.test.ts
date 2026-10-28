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

const linked = `<html><head><title>T</title></head><body><main>
<p data-agent-directive>For AI agents: see /llms.txt</p>
<h1>T</h1><p><a href="/projects/foundry/">Foundry</a> <a href="#mcp">MCP</a> <a href="https://github.com/x">GH</a></p>
<img src="/img/a.png" alt="A"></main></body></html>`;

describe('htmlToMarkdown for agents', () => {
  it('opens with its own llms.txt blockquote instead of the page directive', async () => {
    const md = await htmlToMarkdown(linked, 'https://maintz.dev/developers/');
    expect(md).toMatch(
      /^---[\s\S]*?---\n\n> For the complete documentation index, see \[llms\.txt\]\(https:\/\/maintz\.dev\/llms\.txt\)/,
    );
    expect(md).not.toContain('For AI agents');
  });

  it('makes links and images absolute', async () => {
    const md = await htmlToMarkdown(linked, 'https://maintz.dev/developers/');
    expect(md).toContain('[Foundry](https://maintz.dev/projects/foundry/)');
    expect(md).toContain('[MCP](https://maintz.dev/developers/#mcp)');
    expect(md).toContain('![A](https://maintz.dev/img/a.png)');
  });
});

it('keeps a malformed link as written instead of failing the build', async () => {
  const md = await htmlToMarkdown('<main><a href="http://">x</a></main>', 'https://maintz.dev/');
  expect(md).toContain('[x](http://)');
});
