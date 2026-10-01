// Manage tracked application links. Labels (which company got which code) live
// only in Supabase, never in this public repo. Needs PUBLIC_SUPABASE_URL and
// SUPABASE_SECRET_KEY (the service/secret key, never PUBLIC_) in .env.
//   npm run links -- add "Acme - platform engineer" /what-i-do/platform
//   npm run links -- list
//   npm run links -- remove k7q2mx
import { randomInt } from 'node:crypto';
import { existsSync } from 'node:fs';

if (existsSync('.env')) process.loadEnvFile('.env');
const URL_BASE = `${process.env.PUBLIC_SUPABASE_URL}/rest/v1`;
const KEY = process.env.SUPABASE_SECRET_KEY ?? '';
const SITE = process.env.SITE_URL || 'https://maintz.dev';
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

const newCode = () => Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');

function headers() {
  if (!process.env.PUBLIC_SUPABASE_URL || !KEY) throw new Error('set PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env');
  const auth = KEY.startsWith('sb_') ? {} : { Authorization: `Bearer ${KEY}` };
  return { apikey: KEY, ...auth, 'Content-Type': 'application/json', Prefer: 'return=representation' };
}

async function api(path, init = {}) {
  const res = await fetch(`${URL_BASE}/${path}`, { ...init, headers: headers() });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

async function add(label, target = '/') {
  if (!label) throw new Error('usage: links add "<label>" [/target/path]');
  if (!/^\/[a-z0-9/_-]*$/.test(target)) throw new Error(`target must be a site path like /what-i-do/devops, got ${target}`);
  const [row] = await api('tracked_links', { method: 'POST', body: JSON.stringify({ code: newCode(), label, target }) });
  console.log(`${SITE}/r/${row.code}  ->  ${row.target}  (${row.label})`);
}

const day = (iso) => (iso ? iso.slice(0, 16).replace('T', ' ') : '-');

/** Opens by humans vs scanners, and landings confirmed by the page script. */
function summarize(events) {
  const hits = events.filter((e) => e.kind === 'hit');
  const seen = events.filter((e) => e.kind === 'seen').map((e) => e.at).sort();
  return { opens: hits.filter((e) => !e.bot).length, bots: hits.filter((e) => e.bot).length, seen: seen.length, last: day(seen.at(-1)) };
}

async function list() {
  const rows = await api('tracked_links?select=code,label,target,created_at,tracked_link_events(kind,bot,at)&order=created_at.desc');
  console.table(
    rows.map((r) => ({ code: r.code, label: r.label, target: r.target, sent: day(r.created_at), ...summarize(r.tracked_link_events) })),
  );
  console.log('opens = link hits from browsers, bots = scanner/preview hits, seen = page actually loaded in a browser');
}

async function remove(code) {
  await api(`tracked_links?code=eq.${encodeURIComponent(code ?? '')}`, { method: 'DELETE' });
  console.log(`removed ${code} and its events`);
}

const [cmd, ...args] = process.argv.slice(2);
const commands = { add, list, remove };
if (!commands[cmd]) throw new Error('usage: links add "<label>" [/target] | list | remove <code>');
await commands[cmd](...args);
