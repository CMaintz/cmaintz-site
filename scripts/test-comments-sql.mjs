// Runs supabase/migrations/0001_site_comments.sql against an in-process Postgres
// (PGlite) with a minimal stand-in for Supabase's auth schema and roles, then
// checks the security rules as anon / authenticated users.
import { as, fails, freshDb, report } from './lib/pglite.mjs';

const ALICE = '00000000-0000-0000-0000-00000000000a';
const BOB = '00000000-0000-0000-0000-00000000000b';

const USERS = `
  insert into auth.users values
    ('${ALICE}', '{"full_name":"Alice A","avatar_url":"https://example.com/a.png"}'),
    ('${BOB}', '{"user_name":"bob"}');`;

const insert = (db, role, user, slug, body, extra = '') =>
  as(
    db,
    role,
    user,
    `insert into public.site_comments (post_slug, body${extra ? ', author_name' : ''}) values ($1, $2${extra ? ', $3' : ''})`,
    extra ? [slug, body, extra] : [slug, body],
  );

const setup = () => freshDb(['0001_site_comments.sql', '0002_site_comments_initials.sql'], USERS);

// Order matters: later checks rely on the comment the signed-in insert creates.
async function checks(db) {
  return {
    ...(await authorChecks(db)),
    ...(await inputChecks(db)),
    ...(await permissionChecks(db)),
    ...(await moderationChecks(db)),
    'rate limit after 5 in 10 min': await rateLimited(db),
  };
}

async function authorChecks(db) {
  return {
    'anon cannot insert': await fails(insert(db, 'anon', null, 'hello-world', 'hi there')),
    'author fields cannot be forged': await fails(
      insert(db, 'authenticated', ALICE, 'hello-world', 'hi there', 'Mallory'),
    ),
    'signed-in insert works': !(await fails(insert(db, 'authenticated', ALICE, 'hello-world', 'Great post!'))),
    'only initials are stored, no avatar': (
      await as(db, 'anon', null, 'select author_name, author_avatar from public.site_comments')
    ).rows.every((r) => r.author_name === 'A.A.' && r.author_avatar === null),
    'single-word names give one initial':
      (await db.query("select public.site_comments_initials('bob') as i")).rows[0].i === 'B.',
  };
}

async function inputChecks(db) {
  return {
    'bad slug rejected': await fails(insert(db, 'authenticated', BOB, '../etc', 'hello')),
    'too-short body rejected': await fails(insert(db, 'authenticated', BOB, 'hello-world', ' x ')),
  };
}

async function permissionChecks(db) {
  return {
    'cannot delete others':
      (await as(db, 'authenticated', BOB, 'delete from public.site_comments returning id')).rows.length === 0,
    'cannot update via API': await fails(
      as(db, 'authenticated', ALICE, "update public.site_comments set body = 'edited'"),
    ),
  };
}

async function hiddenAreInvisible(db) {
  await db.exec("update public.site_comments set status = 'hidden'");
  const invisible = (await as(db, 'anon', null, 'select * from public.site_comments')).rows.length === 0;
  await db.exec("update public.site_comments set status = 'visible'");
  return invisible;
}

async function authorsCanDeleteOwn(db) {
  return (await as(db, 'authenticated', ALICE, 'delete from public.site_comments returning id')).rows.length === 1;
}

async function moderationChecks(db) {
  return {
    'hidden comments are invisible': await hiddenAreInvisible(db),
    'authors can delete own': await authorsCanDeleteOwn(db),
  };
}

async function rateLimited(db) {
  for (let i = 0; i < 5; i++) await insert(db, 'authenticated', BOB, 'hello-world', `comment ${i}`);
  return fails(insert(db, 'authenticated', BOB, 'hello-world', 'one too many'));
}

report(await checks(await setup()));
