-- Privacy: store and show only the commenter's initials (e.g. "C.M."), never their
-- full name or avatar. The public API can't expose what isn't stored.

create or replace function public.site_comments_initials(full_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when coalesce(btrim(full_name), '') = '' then 'Anon.'
    else (
      select upper(left(p[1], 1)) || '.' ||
             case when array_length(p, 1) > 1 then upper(left(p[array_length(p, 1)], 1)) || '.' else '' end
      from regexp_split_to_array(btrim(full_name), '\s+') as p
    )
  end;
$$;

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
  new.author_name := public.site_comments_initials(
    coalesce(meta ->> 'full_name', meta ->> 'name', meta ->> 'user_name', meta ->> 'preferred_username')
  );
  new.author_avatar := null;

  select count(*) into recent
  from public.site_comments
  where user_id = auth.uid() and created_at > now() - interval '10 minutes';
  if recent >= 5 then
    raise exception 'too many comments, try again in a few minutes' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

-- Existing comments: reduce stored names to initials and drop avatars.
update public.site_comments
set author_name = public.site_comments_initials(author_name), author_avatar = null
where author_name !~ '^([A-Z]\.){1,2}$|^Anon\.$';
