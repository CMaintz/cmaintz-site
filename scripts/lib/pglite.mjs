// Shared harness for the SQL tests: an in-process Postgres (PGlite) with a
// minimal stand-in for Supabase's roles and auth schema.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

const SUPABASE_STUB = `
  create role anon nologin; create role authenticated nologin;
  create schema auth;
  grant usage on schema auth, public to anon, authenticated;
  create table auth.users (id uuid primary key, raw_user_meta_data jsonb);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;`;

/** A fresh database with the Supabase stub, extra seed SQL and the given migrations applied. */
export async function freshDb(migrations, seed = '') {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB + seed);
  for (const f of migrations) await db.exec(readFileSync(`supabase/migrations/${f}`, 'utf8'));
  return db;
}

/** Runs sql as a role (and optional user), always resetting afterwards. */
export async function as(db, role, user, sql, params) {
  await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub', '${user ?? ''}', false);`);
  try {
    return await db.query(sql, params);
  } finally {
    await db.exec('reset role;');
  }
}

export const fails = (p) =>
  p.then(
    () => false,
    () => true,
  );

/** Prints each check and exits non-zero if any failed. */
export function report(results) {
  for (const [name, ok] of Object.entries(results)) console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}`);
  process.exit(Object.values(results).every(Boolean) ? 0 : 1);
}
