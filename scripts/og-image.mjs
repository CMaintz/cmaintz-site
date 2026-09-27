// Renders the default social-share image (public/og.png, 1200x630) from an
// inline HTML template in the site's retro style. Re-run after branding changes.
import { chromium } from 'playwright';

const HTML = `<!doctype html><html><head><style>
  body { margin: 0; width: 1200px; height: 630px; background: #121212; color: #f2f0ea; font-family: 'Segoe UI', system-ui, sans-serif; position: relative; overflow: hidden; }
  .scan { position: absolute; inset: 0; background: repeating-linear-gradient(to bottom, rgba(0,0,0,.25) 0 2px, transparent 2px 5px); }
  .grid { position: absolute; right: 0; top: 0; width: 520px; height: 630px; background-image: radial-gradient(#f386a1 2.5px, transparent 3px); background-size: 18px 18px; opacity: .35; mask-image: linear-gradient(to left, #000, transparent); }
  .box { position: absolute; left: 80px; top: 120px; }
  .logo { display: inline-block; background: #f386a1; color: #1e1e1e; font: 700 34px Consolas, monospace; padding: 10px 16px; box-shadow: 8px 8px 0 #000; }
  h1 { font-size: 86px; margin: 44px 0 12px; letter-spacing: -2px; text-shadow: 0 0 24px rgba(243,134,161,.35); }
  p { font: 28px Consolas, monospace; color: #a9a79f; margin: 0; }
  .url { position: absolute; left: 80px; bottom: 60px; font: 24px Consolas, monospace; color: #2cc9bb; }
</style></head><body><div class="grid"></div>
  <div class="box"><span class="logo">CM</span><h1>Christoffer Maintz</h1><p>DevOps · Developer Experience · Platform · AI</p></div>
  <div class="url">&gt; cmaintz · Aarhus, DK_</div><div class="scan"></div></body></html>`;

async function main() {
  const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(HTML);
  await page.screenshot({ path: 'public/og.png' });
  await browser.close();
  console.log('wrote public/og.png');
}

await main();
