// Records the Tech Atlas explorer (2D force graph -> by depth -> 3D) and hands
// the capture to encode-clip.mjs. Tech Atlas refuses to render inside iframes
// (anti-clickjacking), so a clip + live link replaces an embedded demo.
import { launchBrowser } from './lib/browser.mjs';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import ffmpeg from 'ffmpeg-static';

const URL = 'https://cmaintz.github.io/tech-atlas/en/explorer/';
const RAW = '.recording';
const VIEWPORT = { width: 1280, height: 800 };

async function startScreencast(page, frames) {
  const cdp = await page.context().newCDPSession(page);
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    frames.push({ data, t: metadata.timestamp });
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 85, maxWidth: VIEWPORT.width, maxHeight: VIEWPORT.height });
  return cdp;
}

async function tour(page) {
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: 'By depth' }).click();
  await page.waitForTimeout(3500);
  await page.getByRole('button', { name: 'Force' }).click();
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: '3D', exact: true }).click();
  await page.waitForTimeout(6000);
}

/** Writes frames plus an ffmpeg concat list that keeps their real timing. */
function writeFrames(frames) {
  rmSync(RAW, { recursive: true, force: true });
  mkdirSync(RAW, { recursive: true });
  const lines = frames.flatMap((f, i) => {
    const name = `f${String(i).padStart(5, '0')}.jpg`;
    writeFileSync(`${RAW}/${name}`, Buffer.from(f.data, 'base64'));
    return [`file '${name}'`, `duration ${((frames[i + 1]?.t ?? f.t + 1) - f.t).toFixed(3)}`];
  });
  writeFileSync(`${RAW}/frames.txt`, lines.join('\n') + '\n');
}

const CONCAT_TO_MP4 = [
  '-y',
  '-loglevel',
  'error',
  '-f',
  'concat',
  '-safe',
  '0',
  '-i',
  `${RAW}/frames.txt`,
  '-vf',
  'fps=24',
  `${RAW}/raw.mp4`,
];

async function record() {
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  await ctx.addInitScript(() => localStorage.setItem('atlas.tour.done', '1'));
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  const frames = [];
  const cdp = await startScreencast(page, frames);
  await tour(page);
  await cdp.send('Page.stopScreencast');
  await browser.close();
  return frames;
}

const frames = await record();
writeFrames(frames);
execFileSync(ffmpeg, CONCAT_TO_MP4);
execFileSync('node', ['scripts/encode-clip.mjs', `${RAW}/raw.mp4`, 'tech-atlas-explorer'], { stdio: 'inherit' });
rmSync(RAW, { recursive: true, force: true });
