// Runs supabase/migrations/0003_tracked_links.sql against PGlite and checks that
// the public (anon) key can only resolve codes and log events for known codes.
import { as, fails, freshDb, report } from './lib/pglite.mjs';

const SEED = "insert into public.tracked_links (code, label, target) values ('k7q2mx', 'Acme - platform role', '/what-i-do/platform');";

async function setup() {
  const db = await freshDb(['0003_tracked_links.sql']);
  await db.exec(SEED);
  return db;
}

const anon = (db, sql, params) => as(db, 'anon', null, sql, params);
const resolve = (db, code, bot = false) => anon(db, 'select public.resolve_link($1, $2, $3) as t', [code, bot, 'DK']);
const events = async (db, kind) => (await db.query('select * from public.tracked_link_events where kind = $1', [kind])).rows;

async function resolveChecks(db) {
  const known = (await resolve(db, 'K7Q2MX')).rows[0].t;
  const unknown = (await resolve(db, 'zzzzzz')).rows[0].t;
  const hits = await events(db, 'hit');
  return {
    'known code resolves (case-insensitive)': known === '/what-i-do/platform',
    'unknown code resolves to null': unknown === null,
    'only known codes log a hit': hits.length === 1 && hits[0].country === 'DK',
  };
}

async function seenChecks(db) {
  await anon(db, 'select public.link_seen($1)', ['k7q2mx']);
  await anon(db, 'select public.link_seen($1)', ['nope22']);
  await resolve(db, 'k7q2mx', true);
  return {
    'link_seen logs only for known codes': (await events(db, 'seen')).length === 1,
    'bot hits are flagged': (await events(db, 'hit')).some((e) => e.bot),
  };
}

async function accessChecks(db) {
  return {
    'anon cannot read links': await fails(anon(db, 'select * from public.tracked_links')),
    'anon cannot read events': await fails(anon(db, 'select * from public.tracked_link_events')),
    'anon cannot insert events': await fails(anon(db, "insert into public.tracked_link_events (code, kind) values ('k7q2mx', 'seen')")),
    'anon cannot call the logger directly': await fails(anon(db, "select public.tracked_links_log('k7q2mx', 'seen', false, null)")),
    'bad codes and targets rejected': await fails(db.exec("insert into public.tracked_links (code, label, target) values ('O0l1ab', 'x', 'https://evil.example')")),
  };
}

async function capped(db) {
  for (let i = 0; i < 60; i++) await anon(db, 'select public.link_seen($1)', ['k7q2mx']);
  const n = (await db.query("select count(*)::int as n from public.tracked_link_events where code = 'k7q2mx'")).rows[0].n;
  return { 'at most 50 events per code per hour': n === 50 };
}

const db = await setup();
report({ ...(await resolveChecks(db)), ...(await seenChecks(db)), ...(await accessChecks(db)), ...(await capped(db)) });
