// Shared browser launcher for the scripts. Uses the system Edge by default, so
// no Playwright browser download is needed; override with PW_CHANNEL.
import { chromium } from 'playwright';

export function launchBrowser() {
  return chromium.launch({ channel: process.env.PW_CHANNEL ?? 'msedge' });
}

/** Runs `fn` with a browser plus the built site served locally, then cleans up both. */
export async function withSiteBrowser(port, fn) {
  const { serve } = await import('./serve-static.mjs');
  const server = await serve(port);
  const browser = await launchBrowser();
  try {
    return await fn(browser, `http://localhost:${port}`);
  } finally {
    await browser.close();
    server.close();
  }
}
