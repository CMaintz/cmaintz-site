// Interaction smoke test against the built site: command palette, theme and
// CRT toggles, project filters, click-to-load demo, language switch.
// Usage: npm run build && node scripts/smoke-interactions.mjs
import { chromium } from 'playwright';
import { serve } from './serve-static.mjs';

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

async function filterHides(page) {
  await page.goto(`${BASE}/projects`);
  await page.click('[data-filter="academic"]');
  const visible = await page.$$eval('[data-projects] > [data-category]', (cards) =>
    cards.filter((c) => !c.hidden).map((c) => c.dataset.category),
  );
  return visible.length > 0 && visible.every((c) => c === 'academic');
}

async function demoLoads(page) {
  await page.goto(`${BASE}/projects/reel-scout`);
  await page.click('[data-demo] .load');
  const src = await page.getAttribute('[data-demo] iframe', 'src');
  return src === 'https://cmaintz.github.io/reel-scout/';
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
  await page.waitForURL('**/projects/jev-**');
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

const CHECKS = { terminalTabs, paletteNavigates, paletteKeyboard, togglesFlip, filterHides, demoLoads, langSwitches, postLangSwitchLandsOnIndex };

async function run(page, [name, check]) {
  const ok = await check(page).catch((e) => (console.error(e.message), false));
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}`);
  return ok;
}

async function main() {
  const server = await serve(PORT);
  const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const results = [];
  for (const entry of Object.entries(CHECKS)) results.push(await run(page, entry));
  await browser.close();
  server.close();
  process.exit(results.every(Boolean) ? 0 : 1);
}

await main();
