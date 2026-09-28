// Renders social share images (1200x630) in the site's retro style:
//   public/og.png                          site default
//   public/og/{projects,blog,areas}/<id>.png one per page, from the built HTML
// Usage: npm run build && npm run og && npm run build (the second build picks them up).
import { launchBrowser } from './lib/browser.mjs';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist/client';
const KINDS = [
  { dir: 'projects', out: 'projects', label: 'PROJECT' },
  { dir: 'blog', out: 'blog', label: 'BLOG', skip: ['tags'] },
  { dir: 'what-i-do', out: 'areas', label: 'WHAT I DO' },
];

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function template({ label, title, text }) {
  return `<!doctype html><html><head><style>
  body { margin: 0; width: 1200px; height: 630px; background: #121212; color: #f2f0ea; font-family: 'Segoe UI', system-ui, sans-serif; position: relative; overflow: hidden; }
  .scan { position: absolute; inset: 0; background: repeating-linear-gradient(to bottom, rgba(0,0,0,.25) 0 2px, transparent 2px 5px); }
  .dots { position: absolute; right: 0; top: 0; width: 460px; height: 630px; background-image: radial-gradient(#f386a1 2.5px, transparent 3px); background-size: 18px 18px; opacity: .3; mask-image: linear-gradient(to left, #000, transparent); }
  .box { position: absolute; left: 80px; top: 90px; right: 200px; }
  .logo { display: inline-block; background: #f386a1; color: #1e1e1e; font: 700 28px Consolas, monospace; padding: 8px 14px; box-shadow: 7px 7px 0 #000; }
  .label { display: inline-block; margin-left: 20px; font: 24px Consolas, monospace; color: #2cc9bb; letter-spacing: 4px; vertical-align: 6px; }
  h1 { font-size: ${title.length > 34 ? 62 : 80}px; line-height: 1.05; margin: 44px 0 20px; letter-spacing: -2px; text-shadow: 0 0 24px rgba(243,134,161,.35); }
  p { font: 26px/1.4 Consolas, monospace; color: #a9a79f; margin: 0; max-height: 150px; overflow: hidden; }
  .url { position: absolute; left: 80px; bottom: 54px; font: 24px Consolas, monospace; color: #f386a1; }
</style></head><body><div class="dots"></div>
  <div class="box"><span class="logo">CM</span><span class="label">${esc(label)}</span><h1>${esc(title)}</h1><p>${esc(text)}</p></div>
  <div class="url">&gt; maintz.dev</div><div class="scan"></div></body></html>`;
}

function readMeta(file) {
  const html = readFileSync(file, 'utf8');
  const title = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1] ?? '';
  const text = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  const decode = (s) =>
    s
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
  return { title: decode(title.replace(/ · Christoffer Maintz$/, '')), text: decode(text) };
}

function pagesOf(kind) {
  const root = join(DIST, kind.dir);
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !(kind.skip ?? []).includes(d.name))
    .map((d) => ({ id: d.name, kind, ...readMeta(join(root, d.name, 'index.html')) }));
}

async function render(page, html, path) {
  await page.setContent(html);
  await page.screenshot({ path });
}

const DEFAULT_CARD = { label: 'DEVELOPER · AARHUS', title: 'Christoffer Maintz', text: 'DevOps · Developer Experience · Platform · AI' };

async function renderPages(page) {
  const pages = KINDS.flatMap(pagesOf);
  for (const p of pages) {
    mkdirSync(`public/og/${p.kind.out}`, { recursive: true });
    await render(page, template({ label: p.kind.label, title: p.title, text: p.text }), `public/og/${p.kind.out}/${p.id}.png`);
  }
  return pages.length;
}

async function main() {
  const browser = await launchBrowser();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await render(page, template(DEFAULT_CARD), 'public/og.png');
  const count = await renderPages(page);
  await browser.close();
  console.log(`wrote public/og.png + ${count} page images - rebuild so pages pick them up`);
}

await main();
