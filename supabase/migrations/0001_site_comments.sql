-- Blog comments for cmaintz-site. Namespaced (site_comments) so it can live in
-- any Supabase project. Apply in the SQL editor or with `supabase db push`.
--
-- Security model:
--   * Anyone can read visible comments.
--   * Only signed-in users can insert, and only post_slug + body; the trigger
--     fills author fields from auth.users so they can't be forged.
--   * Authors can delete their own comments. Nobody can update via the API.
--   * Moderation: set status = 'hidden' in the Table Editor (service role).
--   * Rate limit: 5 comments per user per 10 minutes.

create table if not exists public.site_comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null check (post_slug ~ '^[a-z0-9][a-z0-9-]{0,120}$'),
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null default '',
  author_avatar text,
  body text not null check (char_length(btrim(body)) between 2 and 4000),
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now()
);

create index if not exists site_comments_post_idx on public.site_comments (post_slug, created_at);

alter table public.site_comments enable row level security;

drop policy if exists "site_comments read visible" on public.site_comments;
create policy "site_comments read visible" on public.site_comments
  for select to anon, authenticated using (status = 'visible');

drop policy if exists "site_comments insert own" on public.site_comments;
create policy "site_comments insert own" on public.site_comments
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "site_comments delete own" on public.site_comments;
create policy "site_comments delete own" on public.site_comments
  for delete to authenticated using (user_id = auth.uid());

-- Column-level grants: clients may only ever write post_slug and body.
revoke all on public.site_comments from anon, authenticated;
grant select on public.site_comments to anon, authenticated;
grant insert (post_slug, body) on public.site_comments to authenticated;
grant delete on public.site_comments to authenticated;

create or replace function public.site_comments_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb;
  recent int;
begin
  if auth.uid() is null then
    raise exception 'sign in to comment' using errcode = '42501';
  end if;

  select raw_user_meta_data into meta from auth.users where id = auth.uid();
  new.user_id := auth.uid();
  new.status := 'visible';
  new.created_at := now();
  new.author_name := left(coalesce(meta ->> 'full_name', meta ->> 'name', meta ->> 'user_name', meta ->> 'preferred_username', 'Anonymous'), 80);
  new.author_avatar := nullif(left(coalesce(meta ->> 'avatar_url', meta ->> 'picture', ''), 500), '');

  select count(*) into recent
  from public.site_comments
  where user_id = auth.uid() and created_at > now() - interval '10 minutes';
  if recent >= 5 then
    raise exception 'too many comments, try again in a few minutes' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists site_comments_before_insert on public.site_comments;
create trigger site_comments_before_insert
  before insert on public.site_comments
  for each row execute function public.site_comments_before_insert();
