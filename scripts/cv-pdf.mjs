// Prints /cv and /da/cv from the built site to PDF, so the downloadable CV is
// generated from the same data as the web pages. Run after `npm run build`;
// writes to public/ (committed, picked up by the next build) and dist/client/.
import { chromium } from 'playwright';
import { copyFileSync } from 'node:fs';
import { serve } from './serve-static.mjs';

const PORT = 4324;
const TARGETS = [
  { path: '/cv', file: 'cv.pdf' },
  { path: '/da/cv', file: 'cv-da.pdf' },
];

async function printPage(page, { path, file }) {
  await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print', colorScheme: 'light' });
  await page.pdf({ path: `public/${file}`, format: 'A4', printBackground: true, preferCSSPageSize: true });
  console.log(`wrote public/${file}`);
}

/** Also drop the PDF into the current build so it's live without rebuilding. */
const publishToDist = ({ file }) => copyFileSync(`public/${file}`, `dist/client/${file}`);

async function main() {
  const server = await serve(PORT);
  const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? 'msedge' });
  const page = await browser.newPage();
  for (const target of TARGETS) await printPage(page, target);
  TARGETS.forEach(publishToDist);
  await browser.close();
  server.close();
}

await main();
