-- Tracked links for job applications: each application gets its own short link
-- (maintz.dev/r/<code>) so I can see whether it was opened. Apply in the SQL
-- editor or with `supabase db push`.
--
-- Privacy model:
--   * No cookies, no browser storage, no IP addresses, no user agents.
--   * An event stores only the code, what happened, a bot flag, the country
--     Cloudflare reports and the time.
--   * Labels (which company a code went to) live only here, never in the repo.
--
-- Security model:
--   * anon and authenticated have no table access at all.
--   * The site's Worker calls two SECURITY DEFINER functions with the anon key:
--     resolve_link (the redirect) and link_seen (the landing-page beacon).
--     Both only ever log events for codes that exist.
--   * Codes and labels are managed with the service key (scripts/links.mjs).
--   * Each code logs at most 50 events per hour, so a recipient can't flood it.

create table if not exists public.tracked_links (
  code text primary key check (code ~ '^[a-hjkmnp-z2-9]{6}$'),
  label text not null check (char_length(label) between 1 and 200),
  target text not null default '/' check (target ~ '^/[a-z0-9/_-]*$'),
  created_at timestamptz not null default now()
);

create table if not exists public.tracked_link_events (
  id bigint generated always as identity primary key,
  code text not null references public.tracked_links (code) on delete cascade,
  kind text not null check (kind in ('hit', 'seen')),
  bot boolean not null default false,
  country text check (country ~ '^[A-Z0-9]{2}$'),
  at timestamptz not null default now()
);

create index if not exists tracked_link_events_code_idx on public.tracked_link_events (code, at);

alter table public.tracked_links enable row level security;
alter table public.tracked_link_events enable row level security;
revoke all on public.tracked_links, public.tracked_link_events from anon, authenticated;

create or replace function public.tracked_links_log(p_code text, p_kind text, p_bot boolean, p_country text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.tracked_link_events where code = p_code and at > now() - interval '1 hour') >= 50 then
    return;
  end if;
  insert into public.tracked_link_events (code, kind, bot, country)
  values (p_code, p_kind, p_bot, case when p_country ~ '^[A-Z0-9]{2}$' then p_country end);
end;
$$;

-- The redirect: returns the target path for a known code (and logs a hit), or null.
create or replace function public.resolve_link(p_code text, p_bot boolean default false, p_country text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  t text;
begin
  select target into t from public.tracked_links where code = lower(p_code);
  if t is not null then
    perform public.tracked_links_log(lower(p_code), 'hit', coalesce(p_bot, false), p_country);
  end if;
  return t;
end;
$$;

-- The landing-page beacon: a real browser ran the page's script.
create or replace function public.link_seen(p_code text, p_country text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.tracked_links where code = lower(p_code)) then
    perform public.tracked_links_log(lower(p_code), 'seen', false, p_country);
  end if;
end;
$$;

revoke all on function public.tracked_links_log(text, text, boolean, text) from public, anon, authenticated;
revoke all on function public.resolve_link(text, boolean, text) from public;
revoke all on function public.link_seen(text, text) from public;
grant execute on function public.resolve_link(text, boolean, text) to anon;
grant execute on function public.link_seen(text, text) to anon;
