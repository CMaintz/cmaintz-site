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
  await page.click('[data-crt-toggle]');
  const crt = await page.evaluate(() => document.documentElement.dataset.crt);
  return (await theme()) !== before && crt === 'off';
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

/** Clicking load embeds the project's demo URL (read from the page, so moving a demo doesn't break this). */
async function demoLoads(page) {
  await page.goto(`${BASE}/projects/movie-db`);
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

const CHECKS = {
  terminalTabs,
  paletteNavigates,
  paletteKeyboard,
  togglesFlip,
  filterHides,
  demoLoads,
  langSwitches,
  postLangSwitchLandsOnIndex,
};

async function run(page, [name, check]) {
  const ok = await check(page).catch((e) => (console.error(e.message), false));
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}`);
  return ok;
}

async function main() {
  const results = await withSiteBrowser(PORT, async (browser) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const out = [];
    for (const entry of Object.entries(CHECKS)) out.push(await run(page, entry));
    return out;
  });
  process.exit(results.every(Boolean) ? 0 : 1);
}

await main();
