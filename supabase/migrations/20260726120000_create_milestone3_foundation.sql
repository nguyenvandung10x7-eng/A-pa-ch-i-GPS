create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  tiktok_username text,
  total_stars integer not null default 0 check (total_stars >= 0),
  total_play_seconds bigint not null default 0 check (total_play_seconds >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.video_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id text not null,
  challenge_title_snapshot text not null,
  gps_verified boolean not null default false,
  gps_verified_at timestamptz,
  submitted_url text not null,
  canonical_url text,
  tiktok_video_id text,
  star_value integer not null default 0 check (star_value >= 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  submission_id uuid not null references public.video_submissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, submission_id)
);

create index if not exists idx_profiles_total_stars on public.profiles (total_stars desc);
create index if not exists idx_profiles_created_at on public.profiles (created_at desc);
create index if not exists idx_video_submissions_user_id on public.video_submissions (user_id);
create index if not exists idx_video_submissions_challenge_id on public.video_submissions (challenge_id);
create index if not exists idx_video_submissions_status_created_at on public.video_submissions (status, created_at desc);
create index if not exists idx_votes_submission_id on public.votes (submission_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'name'
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture',
      new.raw_user_meta_data ->> 'avatar'
    )
  )
  on conflict (id) do update
    set display_name = coalesce(excluded.display_name, public.profiles.display_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
end;
$$;

create or replace function public.get_submission_vote_counts()
returns table (submission_id uuid, vote_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select v.submission_id,
         count(*)::bigint as vote_count
  from public.votes as v
  join public.video_submissions as vs
    on vs.id = v.submission_id
  where vs.status = 'approved'
  group by v.submission_id;
$$;

revoke all on function public.get_submission_vote_counts() from public;
grant execute on function public.get_submission_vote_counts() to anon, authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before insert or update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists video_submissions_set_updated_at on public.video_submissions;
create trigger video_submissions_set_updated_at
before insert or update on public.video_submissions
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, display_name, avatar_url)
select
  au.id,
  coalesce(
    au.raw_user_meta_data ->> 'full_name',
    au.raw_user_meta_data ->> 'display_name',
    au.raw_user_meta_data ->> 'name'
  ),
  coalesce(
    au.raw_user_meta_data ->> 'avatar_url',
    au.raw_user_meta_data ->> 'picture',
    au.raw_user_meta_data ->> 'avatar'
  )
from auth.users as au
left join public.profiles as p on p.id = au.id
where p.id is null;

alter table public.profiles enable row level security;
alter table public.video_submissions enable row level security;
alter table public.votes enable row level security;

revoke insert on public.profiles from authenticated;
revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url, tiktok_username) on public.profiles to authenticated;

revoke update on public.video_submissions from authenticated;
-- tiktok_video_id is expected to be supplied during insert and is not exposed to client-side updates.
grant update (submitted_url, canonical_url) on public.video_submissions to authenticated;

drop policy if exists "Authenticated users can read profiles" on public.profiles;
create policy "Authenticated users can read profiles"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Anyone can read approved video submissions" on public.video_submissions;
create policy "Anyone can read approved video submissions"
  on public.video_submissions for select
  to anon, authenticated
  using (status = 'approved');

drop policy if exists "Authenticated users can read their own submissions" on public.video_submissions;
create policy "Authenticated users can read their own submissions"
  on public.video_submissions for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own pending submissions" on public.video_submissions;
create policy "Users can insert own pending submissions"
  on public.video_submissions for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'pending'
    and star_value = 0
    and gps_verified = false
    and gps_verified_at is null
  );

drop policy if exists "Users can update own pending submissions" on public.video_submissions;
create policy "Users can update own pending submissions"
  on public.video_submissions for update
  to authenticated
  using ((select auth.uid()) = user_id and status = 'pending')
  with check (
    (select auth.uid()) = user_id
    and status = 'pending'
  );

drop policy if exists "Authenticated users can create own votes" on public.votes;
create policy "Authenticated users can create own votes"
  on public.votes for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.video_submissions as vs
      where vs.id = submission_id
        and vs.status = 'approved'
        and vs.user_id <> (select auth.uid())
    )
  );

drop policy if exists "Authenticated users can read own votes" on public.votes;
create policy "Authenticated users can read own votes"
  on public.votes for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Authenticated users can delete own votes" on public.votes;
create policy "Authenticated users can delete own votes"
  on public.votes for delete
  to authenticated
  using ((select auth.uid()) = user_id);
