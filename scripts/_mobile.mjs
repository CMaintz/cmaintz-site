import { chromium, devices } from 'playwright';
import { serve } from './serve-static.mjs';
const OUT = process.env.OUT;
const s = await serve(4331);
const b = await chromium.launch({ channel: 'msedge' });
const ctx = await b.newContext({ ...devices['iPhone 13'], reducedMotion: 'reduce' });
const p = await ctx.newPage();
const shot = (n) => p.screenshot({ path: `${OUT}/m-${n}.png` });
await p.goto('http://localhost:4331/'); await p.waitForTimeout(800); await shot('home');
await p.click('summary.tool'); await p.waitForTimeout(300); await shot('menu');
await p.click('summary.tool');
await p.click('.cmdk[data-cmdk-open]'); await p.waitForTimeout(300); await shot('palette');
await p.keyboard.press('Escape');
await p.locator('.term').scrollIntoViewIfNeeded(); await p.fill('[data-shell]', 'doom'); await p.press('[data-shell]', 'Enter'); await p.waitForTimeout(500); await shot('doom');
await p.click('dialog.doom .close');
for (const path of ['/projects/illux-product-ai', '/what-i-do/ai', '/blog/one-rule-set-three-placements', '/contact', '/projects']) {
  await p.goto('http://localhost:4331' + path); await p.waitForTimeout(500);
  const o = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(path, 'overflow', o);
  await shot(path.replace(/\//g, '_'));
}
console.log('header kbd label:', await (await ctx.newPage()).goto('http://localhost:4331/').then(() => 'ok'));
await b.close(); s.close();
