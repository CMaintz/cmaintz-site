// Browser-side Supabase comments. Loaded lazily by SupabaseComments.astro, so
// supabase-js only ships on post pages and only once the section is in view.
// All user content is rendered with textContent (never innerHTML).
import type { SupabaseClient, User } from '@supabase/supabase-js';

interface Config {
  url: string;
  key: string;
  slug: string;
  providers: string[];
  text: Record<string, string>;
}

interface Comment {
  id: string;
  user_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

const PROVIDER_LABELS: Record<string, string> = {
  github: 'GitHub',
  google: 'Google',
  linkedin_oidc: 'LinkedIn',
  facebook: 'Facebook',
  discord: 'Discord',
};

let clientPromise: Promise<SupabaseClient> | null = null;

function getClient(cfg: Config) {
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) => createClient(cfg.url, cfg.key));
  return clientPromise;
}

function readConfig(root: HTMLElement): Config {
  const d = root.dataset;
  return {
    url: d.url!,
    key: d.key!,
    slug: d.slug!,
    providers: (d.providers ?? 'github')
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean),
    text: JSON.parse(d.text ?? '{}'),
  };
}

function h(tag: string, cls = '', text = '') {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text) el.textContent = text;
  return el;
}

/** Mirrors public.site_comments_initials(): "Christoffer Maintz" -> "C.M.". */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'Anon.';
  const first = parts[0][0].toUpperCase() + '.';
  return parts.length > 1 ? first + parts[parts.length - 1][0].toUpperCase() + '.' : first;
}

async function fetchComments(client: SupabaseClient, slug: string) {
  const { data, error } = await client
    .from('site_comments')
    .select('id, user_id, author_name, body, created_at')
    .eq('post_slug', slug)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Comment[];
}

function renderComment(c: Comment, userId: string | null, cfg: Config, onDelete: (id: string) => void) {
  const li = h('li', 'comment');
  const meta = h('p', 'comment__meta');
  const time = h(
    'time',
    '',
    new Date(c.created_at).toLocaleDateString(document.documentElement.lang === 'da' ? 'da-DK' : 'en-GB'),
  );
  time.setAttribute('datetime', c.created_at);
  meta.append(h('span', 'badge-initials', c.author_name), time);
  if (c.user_id === userId) meta.append(deleteButton(c.id, cfg, onDelete));
  li.append(meta, h('p', 'comment__body', c.body));
  return li;
}

function deleteButton(id: string, cfg: Config, onDelete: (id: string) => void) {
  const btn = h('button', 'comment__delete', cfg.text.delete) as HTMLButtonElement;
  btn.type = 'button';
  btn.addEventListener('click', () => onDelete(id));
  return btn;
}

function renderList(
  list: HTMLElement,
  comments: Comment[],
  userId: string | null,
  cfg: Config,
  onDelete: (id: string) => void,
) {
  if (!comments.length) return list.replaceChildren(h('li', 'comment comment--empty', cfg.text.empty));
  list.replaceChildren(...comments.map((c) => renderComment(c, userId, cfg, onDelete)));
}

function providerButton(client: SupabaseClient, provider: string) {
  const btn = h('button', 'btn btn--sm', PROVIDER_LABELS[provider] ?? provider) as HTMLButtonElement;
  btn.type = 'button';
  const redirectTo = `${location.origin}${location.pathname}#comments`;
  btn.addEventListener('click', () =>
    client.auth.signInWithOAuth({ provider: provider as 'github', options: { redirectTo } }),
  );
  return btn;
}

function signedOutView(client: SupabaseClient, cfg: Config) {
  const row = h('div', 'providers');
  row.append(...cfg.providers.map((p) => providerButton(client, p)));
  return [h('p', 'dim', cfg.text.signin), row];
}

function displayName(user: User) {
  const m = user.user_metadata ?? {};
  return m.full_name ?? m.name ?? m.user_name ?? user.email ?? '';
}

function signOutButton(client: SupabaseClient, cfg: Config) {
  const out = h('button', 'linkish', cfg.text.signout) as HTMLButtonElement;
  out.type = 'button';
  out.addEventListener('click', () => client.auth.signOut());
  return out;
}

function signedInView(client: SupabaseClient, cfg: Config, user: User) {
  const p = h('p', 'dim', `${cfg.text.as} `);
  p.append(h('strong', '', initials(displayName(user))), ' · ', signOutButton(client, cfg));
  return [p];
}

interface Ui {
  root: HTMLElement;
  list: HTMLElement;
  auth: HTMLElement;
  form: HTMLFormElement;
  status: HTMLElement;
}

function queryUi(root: HTMLElement): Ui {
  const q = <T extends Element>(s: string) => root.querySelector(s) as unknown as T;
  return { root, list: q('[data-list]'), auth: q('[data-auth]'), form: q('form'), status: q('[data-status]') };
}

/** Shows the sign-in state; the form only exists for signed-in users. */
function renderAuth(ui: Ui, client: SupabaseClient, cfg: Config, user: User | null) {
  ui.form.hidden = !user;
  ui.auth.replaceChildren(...(user ? signedInView(client, cfg, user) : signedOutView(client, cfg)));
}

async function renderComments(ui: Ui, client: SupabaseClient, cfg: Config, userId: string | null) {
  const onDelete = (id: string) => remove(ui, client, cfg, id);
  renderList(ui.list, await fetchComments(client, cfg.slug), userId, cfg, onDelete);
}

async function refresh(ui: Ui, client: SupabaseClient, cfg: Config) {
  const { data } = await client.auth.getUser();
  renderAuth(ui, client, cfg, data.user);
  await renderComments(ui, client, cfg, data.user?.id ?? null);
}

async function remove(ui: Ui, client: SupabaseClient, cfg: Config, id: string) {
  const { error } = await client.from('site_comments').delete().eq('id', id);
  ui.status.textContent = error ? cfg.text.error : '';
  await refresh(ui, client, cfg);
}

const insertComment = (client: SupabaseClient, cfg: Config, body: string) =>
  client.from('site_comments').insert({ post_slug: cfg.slug, body: body.trim() });

async function submit(ui: Ui, client: SupabaseClient, cfg: Config) {
  const field = ui.form.querySelector('textarea')!;
  const { error } = await insertComment(client, cfg, field.value);
  ui.status.textContent = error ? `${cfg.text.error} (${error.message})` : '';
  if (!error) field.value = '';
  await refresh(ui, client, cfg);
}

function bindForm(ui: Ui, client: SupabaseClient, cfg: Config) {
  ui.form.addEventListener('submit', (e) => {
    e.preventDefault();
    submit(ui, client, cfg);
  });
}

function bindAuthChanges(ui: Ui, client: SupabaseClient, cfg: Config) {
  client.auth.onAuthStateChange(() => {
    setTimeout(() => refresh(ui, client, cfg), 0);
  });
}

export async function mountComments(root: HTMLElement) {
  const cfg = readConfig(root);
  const ui = queryUi(root);
  try {
    const client = await getClient(cfg);
    bindForm(ui, client, cfg);
    bindAuthChanges(ui, client, cfg);
    await refresh(ui, client, cfg);
  } catch {
    ui.status.textContent = cfg.text.error;
  }
}
