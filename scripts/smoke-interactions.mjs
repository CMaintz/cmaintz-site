// Interaction smoke test against the built site: command palette, theme and
// CRT toggles, project filters, click-to-load demo, language switch.
// Usage: npm run build && node scripts/smoke-interactions.mjs
import { withSiteBrowser } from './lib/browser.mjs';

const PORT = 4325;
const BASE = `http://localhost:${PORT}`;

async function paletteNavigates(page) {
  await page.goto(`${BASE}/`);
  await page.keyboard.press('Control+k');
  await page.keyboard.type('foundry');
  await page.keyboard.press('Enter');
  await page.waitForURL('**/projects/foundry**');
  return true;
}

async function togglesFlip(page) {
  await page.goto(`${BASE}/`);
  const theme = () => page.evaluate(() => document.documentElement.dataset.theme);
  const before = await theme();
  await page.click('[data-theme-toggle]');
  await page.click('details.fx summary');
  await page.click('[data-fx="scan"]');
  const fx = await page.evaluate(() => ({ ...document.documentElement.dataset }));
  return (await theme()) !== before && fx.scan === 'off' && fx.motion === 'on';
}

/** Cards a filter leaves on screen, read from rendered visibility (a card's own display rule can override hidden). */
async function shownAfter(page, filter, attr) {
  await page.click(`[data-filter="${filter}"]`);
  return page.$$eval(
    '[data-projects] > [data-category]',
    (cards, a) => cards.filter((c) => getComputedStyle(c).display !== 'none').map((c) => c.dataset[a]),
    attr,
  );
}

async function filterHides(page) {
  await page.goto(`${BASE}/projects`);
  const byCat = await shownAfter(page, 'academic', 'category');
  const byArea = await shownAfter(page, 'ai', 'areas');
  const catOk = byCat.length > 0 && byCat.every((c) => c === 'academic');
  return catOk && byArea.length > 0 && byArea.every((a) => a.split(' ').includes('ai'));
}

/** The 404 log's floppy swap reads the next disk, then settles on Abort/Retry/Fail. */
async function floppySwaps(page) {
  await page.goto(`${BASE}/no-such-page`);
  const line = () => page.textContent('[data-floppy]');
  await page.click('[data-floppy-swap]');
  const first = (await line()).includes('Insert disk 3');
  for (let i = 0; i < 5; i++) await page.click('[data-floppy-swap]');
  return first && (await line()).startsWith('Abort, Retry, Fail?');
}

/** Clicking load embeds the project's demo URL (read from the page, so moving a demo doesn't break this). */
async function demoLoads(page) {
  await page.goto(`${BASE}/projects/movie-explorer`);
  const expected = await page.getAttribute('[data-demo]', 'data-demo');
  await page.click('[data-demo] .load');
  const src = await page.getAttribute('[data-demo] iframe', 'src');
  return Boolean(expected?.startsWith('https://')) && src === expected;
}

async function langSwitches(page) {
  await page.goto(`${BASE}/about`);
  await page.click('a.lang');
  await page.waitForURL('**/da/about**');
  return (await page.getAttribute('html', 'lang')) === 'da';
}

/** Posts are English-only, so the switch must land on the Danish blog index, not a 404. */
async function postLangSwitchLandsOnIndex(page) {
  await page.goto(`${BASE}/blog/hello-world`);
  await page.click('a.lang');
  await page.waitForURL('**/da/blog**');
  return (await page.title()).startsWith('Blog');
}

/** Arrow keys move the highlight, Tab completes, Enter runs. */
async function paletteKeyboard(page) {
  await page.goto(`${BASE}/`);
  await page.keyboard.press('Control+k');
  await page.keyboard.type('jev');
  await page.keyboard.press('ArrowDown');
  const highlighted = await page.textContent('#cmdk-list [aria-selected="true"] .l');
  await page.keyboard.press('Tab');
  const completed = await page.inputValue('dialog.cmdk input');
  await page.keyboard.press('Enter');
  await page.waitForURL(/\/(projects|CMaintz)\/jev-/, { waitUntil: 'commit' });
  return completed === highlighted && highlighted.startsWith('jev-');
}

/** The homepage terminal switches to the git log tab and its entries link out. */
async function terminalTabs(page) {
  await page.goto(`${BASE}/`);
  await page.click('#tab-log');
  const visible = await page.isVisible('#panel-log');
  const links = await page.$$eval('#panel-log .log a', (as) => as.length);
  return visible && links > 0 && (await page.isHidden('#panel-whoami'));
}

// An extra ↑ up front, and Caps Lock on for the b and a.
const KONAMI_KEYS = [
  'ArrowUp',
  ...'Up Up Down Down Left Right Left Right'.split(' ').map((k) => `Arrow${k}`),
  'Shift+B',
  'Shift+A',
];

/** The Konami code opens DOOM even with a stray extra ↑ and Caps Lock on,
 *  and claims the b/a so Firefox's find bar can't. */
async function konamiOpensDoom(page) {
  await page.goto(`${BASE}/about`);
  await page.evaluate(() =>
    addEventListener('keydown', (e) => (window.__claimed = e.key === 'A' && e.defaultPrevented)),
  );
  for (const k of KONAMI_KEYS) await page.keyboard.press(k);
  const opened = await page.evaluate(() => document.querySelector('dialog.doom').open);
  await page.click('dialog.doom .close');
  return opened && (await page.evaluate(() => window.__claimed));
}

// Console messages from every check, scanned at the end for CSP blocks.
const cspBlocks = [];
const isCspBlock = (text) =>
  /Content Security Policy|Refused to (load|execute|frame|connect|compile|evaluate)/i.test(text);

/** Visits the pages the other checks don't (diagrams, search, DOOM), then reports any CSP block seen. */
async function noCspBlocks(page) {
  await page.goto(`${BASE}/blog/hello-world`, { waitUntil: 'networkidle' });
  await page.goto(`${BASE}/search`);
  await page.fill('.pagefind-ui input', 'astro');
  await page.waitForSelector('.pagefind-ui__result', { timeout: 10000 });
  await page.goto(BASE);
  await page.evaluate(() => dispatchEvent(new Event('doom:open')));
  await page.waitForTimeout(3000);
  cspBlocks.forEach((t) => console.error(`  CSP: ${t}`));
  return cspBlocks.length === 0;
}

const CHECKS = {
  terminalTabs,
  paletteNavigates,
  paletteKeyboard,
  togglesFlip,
  filterHides,
  floppySwaps,
  demoLoads,
  langSwitches,
  postLangSwitchLandsOnIndex,
  konamiOpensDoom,
  noCspBlocks,
};

async function run(page, [name, check]) {
  const ok = await check(page).catch((e) => (console.error(e.message), false));
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}`);
  return ok;
}

async function main() {
  const results = await withSiteBrowser(PORT, async (browser) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    page.on('console', (m) => isCspBlock(m.text()) && cspBlocks.push(m.text()));
    const out = [];
    for (const entry of Object.entries(CHECKS)) out.push(await run(page, entry));
    return out;
  });
  process.exit(results.every(Boolean) ? 0 : 1);
}

await main();
