// Cross-posts live blog posts after a deploy (ci.yml `crosspost` job). A post opts in
// per platform with `crosspost: [devto, linkedin]` in its front matter, set in Keystatic.
//   dev.to:   creates the article (canonical_url -> maintz.dev) or updates it when the post
//             changed in this push. Matching is by canonical URL, so re-runs are safe.
//   LinkedIn: opens one issue per post with a drafted post to paste by hand.
// Usage: node --experimental-strip-types scripts/crosspost.mjs [--dry-run]
// Env: SITE_URL, DEVTO_API_KEY, GITHUB_TOKEN, GITHUB_REPOSITORY, BEFORE_SHA (push base).
import { readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { basename, extname, join } from 'node:path';
import { parse } from 'yaml';
import {
  devtoArticle,
  isLive,
  linkedinDraft,
  linkedinMarker,
  planDevto,
  postUrl,
  splitPost,
  toMeta,
  wants,
} from '../src/lib/crosspost.ts';

const DIR = 'src/content/blog';
const SITE = process.env.SITE_URL || 'https://maintz.dev';
const DRY = process.argv.includes('--dry-run');
const NOW = new Date();
const UA = { 'user-agent': 'maintz.dev-crosspost' };

function readPosts() {
  return readdirSync(DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => {
      const { data, body } = splitPost(readFileSync(join(DIR, f), 'utf8'), parse);
      return { meta: toMeta(basename(f, extname(f)), data), body };
    });
}

/** Slugs of posts touched by this push; empty when there's no usable base (only creates then). */
function changedSlugs() {
  const before = process.env.BEFORE_SHA;
  if (!before || /^0+$/.test(before)) return new Set();
  try {
    const out = execFileSync('git', ['diff', '--name-only', before, 'HEAD', '--', DIR], { encoding: 'utf8' });
    return new Set(out.split('\n').filter(Boolean).map((f) => basename(f, extname(f))));
  } catch {
    return new Set();
  }
}

async function call(url, init = {}) {
  const res = await fetch(url, { ...init, headers: { ...UA, ...init.headers } });
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${url} -> ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

// ---------- dev.to ----------
const devto = (path, init = {}) =>
  call(`https://dev.to/api${path}`, {
    ...init,
    headers: { 'api-key': process.env.DEVTO_API_KEY, 'content-type': 'application/json', ...init.headers },
  });

async function devtoExisting() {
  const mine = await devto('/articles/me/all?per_page=1000');
  return new Map(mine.filter((a) => a.canonical_url).map((a) => [a.canonical_url.replace(/\/$/, ''), a.id]));
}

async function ogImage(slug) {
  const own = `${SITE}/og/blog/${slug}.png`;
  const res = await fetch(own, { method: 'HEAD', headers: UA }).catch(() => null);
  return res?.ok ? own : `${SITE}/og.png`;
}

async function runDevto(posts) {
  if (!process.env.DEVTO_API_KEY) return console.log('dev.to: DEVTO_API_KEY not set, skipping');
  const actions = planDevto(posts, await devtoExisting(), changedSlugs(), SITE, NOW);
  if (!actions.length) console.log('dev.to: nothing to do');
  for (const a of actions) {
    console.log(`dev.to: ${a.kind} ${a.post.meta.slug}${DRY ? ' (dry run)' : ''}`);
    if (DRY) continue;
    const body = JSON.stringify(devtoArticle(a.post, SITE, await ogImage(a.post.meta.slug)));
    const res = await devto(a.kind === 'create' ? '/articles' : `/articles/${a.id}`, {
      method: a.kind === 'create' ? 'POST' : 'PUT',
      body,
    });
    console.log(`dev.to: ${a.kind}d ${res.url}`);
  }
}

// ---------- LinkedIn (drafted as a GitHub issue) ----------
const gh = (path, init = {}) =>
  call(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${process.env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json', ...init.headers },
  });

async function ensureLabel() {
  await gh('/labels', { method: 'POST', body: JSON.stringify({ name: 'crosspost', color: '0a66c2' }) }).catch((e) => {
    if (!String(e.message).includes('422')) throw e; // 422 = label already exists
  });
}

function issueBody(meta) {
  return [
    `**${meta.title}** is live: ${postUrl(SITE, meta)}`,
    '',
    'Draft for LinkedIn. Edit it, post it, then close this issue.',
    '',
    '```text',
    linkedinDraft(meta, SITE),
    '```',
    '',
    linkedinMarker(meta.slug),
  ].join('\n');
}

async function runLinkedin(posts) {
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPOSITORY) return console.log('LinkedIn: no GitHub token, skipping');
  const due = posts.filter((p) => wants(p.meta, 'linkedin') && isLive(p.meta, NOW));
  if (!due.length) return console.log('LinkedIn: nothing to do');
  const issues = await gh('/issues?state=all&labels=crosspost&per_page=100');
  const done = (slug) => issues.some((i) => i.body?.includes(linkedinMarker(slug)));
  for (const { meta } of due.filter((p) => !done(p.meta.slug))) {
    console.log(`LinkedIn: draft issue for ${meta.slug}${DRY ? ' (dry run)' : ''}`);
    if (DRY) continue;
    await ensureLabel();
    const title = `LinkedIn post ready: ${meta.title}`;
    await gh('/issues', { method: 'POST', body: JSON.stringify({ title, body: issueBody(meta), labels: ['crosspost'] }) });
  }
}

const posts = readPosts();
await runDevto(posts);
await runLinkedin(posts);
