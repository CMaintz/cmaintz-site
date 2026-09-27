// Visual smoke test: screenshots key pages at desktop + mobile widths and
// fails on console errors or horizontal overflow. Uses system Edge (no
// browser download needed). Usage: npm run build && npm run shots [-- /path ...]
// Env: THEME=dark|light, SHOT_DIR, FULL=0 (viewport only), REDUCED=1, PW_CHANNEL.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { serve } from './serve-static.mjs';

const PORT = 4322;
const OUT = process.env.SHOT_DIR ?? 'screenshots';
const THEME = process.env.THEME ?? 'dark';
const DEFAULT_PAGES = [
  '/',
  '/da/',
  '/about',
  '/da/about',
  '/projects',
  '/projects/illux-product-ai',
  '/projects/atlas',
  '/blog',
  '/blog/one-rule-set-three-placements',
  '/blog/hello-world',
  '/services',
  '/contact',
  '/now',
  '/uses',
  '/cv',
  '/search',
  '/editorial',
  '/technical',
  '/bold',
  '/alien',
  '/bladerunner',
  '/nope',
];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

async function newPage(browser, viewport) {
  const ctx = await browser.newContext({
    viewport,
    reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference',
  });
  await ctx.addInitScript((th) => {
    try {
      localStorage.setItem('theme', th);
    } catch {}
  }, THEME);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  return { ctx, page, errors };
}

function shotName(vp, path) {
  return `${OUT}/${vp.name}-${THEME}-${path.replace(/\//g, '_') || 'root'}.png`;
}

// The 404 page is expected to log its own 404 fetch.
const relevantErrors = (errors, path) => errors.filter((e) => !(path === '/nope' && /404/.test(e)));

/** Returns a description of the widest offending elements, or '' if none. */
function findOverflow(page) {
  return page.evaluate(() => {
    if (document.documentElement.scrollWidth <= innerWidth + 1) return '';
    const wide = [...document.querySelectorAll('main *, header *, footer *')].filter(
      (e) => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest('.marquee'),
    );
    return (
      wide
        .slice(-3)
        .map((e) => `${e.tagName}.${e.className}`)
        .join(', ') || 'unknown'
    );
  });
}

async function load(page, path) {
  await page.goto(`http://localhost:${PORT}${path}`, {
    waitUntil: 'networkidle',
  });
  // Full-page captures don't advance scroll-driven timelines; show reveals statically.
  await page.addStyleTag({ content: '.reveal{animation:none!important}' });
  await page.waitForTimeout(2500);
}

function logResult(vp, path, overflow, bad) {
  const status = `${overflow ? `H-OVERFLOW(${overflow}) ` : ''}${bad.length ? 'ERRORS: ' + bad.join(' | ') : 'ok'}`;
  console.log(`${vp.name.padEnd(8)} ${path.padEnd(42)} ${status}`);
}

/** Loads, captures and verifies one page; returns true when it passes. */
async function inspectPage({ page, errors }, vp, path) {
  errors.length = 0;
  await load(page, path);
  const overflow = await findOverflow(page);
  await page.screenshot({
    path: shotName(vp, path),
    fullPage: process.env.FULL !== '0',
  });
  const bad = relevantErrors(errors, path);
  logResult(vp, path, overflow, bad);
  return !overflow && !bad.length;
}

async function checkViewport(browser, vp, pages) {
  const session = await newPage(browser, vp);
  let failures = 0;
  for (const path of pages) if (!(await inspectPage(session, vp, path))) failures++;
  await session.ctx.close();
  return failures;
}

async function main() {
  const pages = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_PAGES;
  mkdirSync(OUT, { recursive: true });
  const server = await serve(PORT);
  const browser = await chromium.launch({
    channel: process.env.PW_CHANNEL ?? 'msedge',
  });
  let failures = 0;
  for (const vp of VIEWPORTS) failures += await checkViewport(browser, vp, pages);
  await browser.close();
  server.close();
  process.exit(failures ? 1 : 0);
}

await main();
