create table if not exists public.guilds (
  slug text primary key check (slug in ('history', 'nature', 'walk', 'rebellion')),
  name_vi text not null,
  name_en text not null,
  description_vi text not null,
  description_en text not null,
  created_at timestamptz not null default now()
);

insert into public.guilds (slug, name_vi, name_en, description_vi, description_en)
values
  ('history', 'Team Lịch sử', 'History Team', 'Giữ lại những gì Điện Biên không muốn bị quên.', 'Keep what Dien Bien does not want to be forgotten.'),
  ('nature', 'Team Thiên nhiên', 'Nature Team', 'Đi chậm để nghe đất, cây và gió kể chuyện.', 'Walk slowly enough to hear the land, trees, and wind.'),
  ('walk', 'Team Đi dạo', 'Walking Team', 'Không cần mục tiêu lớn; chỉ cần chú ý đến điều nhỏ.', 'No grand goal is needed; notice what is small.'),
  ('rebellion', 'Team Nổi loạn', 'Rebellion Team', 'Bước lệch khỏi thói quen, nhưng không vô trách nhiệm.', 'Step away from habit, without becoming careless.')
on conflict (slug) do nothing;

create table if not exists public.guild_memberships (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  guild_slug text not null references public.guilds(slug),
  nickname text not null,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guild_memberships_nickname_length check (char_length(btrim(nickname)) between 2 and 24),
  constraint guild_memberships_nickname_trimmed check (nickname = btrim(nickname)),
  constraint guild_memberships_nickname_no_line_breaks check (
    position(chr(13) in nickname) = 0
    and position(chr(10) in nickname) = 0
    and position(chr(9) in nickname) = 0
  )
);

create table if not exists public.guild_score_catalog (
  challenge_id text primary key,
  points integer not null check (points > 0 and points <= 1000),
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.guild_score_catalog (challenge_id, points)
values
  ('quang-truong-7-5-mthen', 120),
  ('cong-vien-vu-a-dinh-trai-ban', 120),
  ('phadin-coffee-cat-banh', 100),
  ('cong-vien-noong-bua-mthen', 120),
  ('cho-noong-bua-trai-ban', 140),
  ('ho-huoi-pha-mthen', 140),
  ('khu-du-lich-him-lam-trai-ban', 140),
  ('canh-dong-muong-thanh-cat-banh', 150),
  ('cong-vien-hoa-ban-mthen', 120),
  ('ho-pa-khoang-trai-ban', 180),
  ('cho-muong-nhe-tang-banh-trung-thu', 200),
  ('cau-ta-ko-khu-tang-banh-trung-thu', 240),
  ('ban-a-pa-chai-tang-banh-trung-thu', 260),
  ('cot-co-a-pa-chai-mthen', 480),
  ('cot-co-a-pa-chai-trai-ban-lanh-lung', 480),
  ('doi-a1-chuyen-tau-thoi-gian-1954', 400),
  ('bao-tang-chien-thang-dien-bien-phu-trai-nghiem', 300),
  ('ban-phieng-loi-mthen', 180),
  ('ca-phe-ke-nenh-cat-banh', 180),
  ('ruong-bac-thang-ta-leng-mthen', 240),
  ('thac-ke-nenh-mthen', 240)
on conflict (challenge_id) do nothing;

create table if not exists public.guild_score_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  guild_slug text not null references public.guilds(slug),
  challenge_id text not null references public.guild_score_catalog(challenge_id),
  client_event_id text not null,
  points integer not null check (points > 0 and points <= 1000),
  created_at timestamptz not null default now(),
  unique (user_id, client_event_id)
);

create table if not exists public.guild_posts (
  id uuid primary key default gen_random_uuid(),
  guild_slug text not null references public.guilds(slug),
  user_id uuid not null references public.profiles(id) on delete cascade,
  nickname_snapshot text not null,
  body text not null,
  chapter_id text null,
  challenge_id text null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'hidden')),
  reviewed_by uuid null references public.profiles(id),
  reviewed_at timestamptz null,
  rejection_reason text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guild_posts_body_length check (char_length(btrim(body)) between 10 and 800),
  constraint guild_posts_review_consistency check (
    (status = 'pending' and reviewed_by is null and reviewed_at is null and rejection_reason is null)
    or (status = 'approved' and reviewed_by is not null and reviewed_at is not null and rejection_reason is null)
    or (status = 'rejected' and reviewed_by is not null and reviewed_at is not null and rejection_reason is not null and char_length(btrim(rejection_reason)) between 1 and 1000)
    or status = 'hidden'
  ) not valid
);

create table if not exists public.guild_post_moderation_audit (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.guild_posts(id),
  action text not null check (action in ('approve', 'reject')),
  actor_user_id uuid not null references public.profiles(id),
  previous_status text not null,
  new_status text not null,
  rejection_reason text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_guild_score_events_guild_created_at
  on public.guild_score_events (guild_slug, created_at desc);
create index if not exists idx_guild_score_events_user_id
  on public.guild_score_events (user_id, created_at desc);
create index if not exists idx_guild_memberships_guild_slug
  on public.guild_memberships (guild_slug, joined_at asc);
create index if not exists idx_guild_posts_status_created_at
  on public.guild_posts (status, created_at asc);
create index if not exists idx_guild_posts_guild_status_created_at
  on public.guild_posts (guild_slug, status, created_at desc);
create index if not exists idx_guild_post_moderation_audit_post_id
  on public.guild_post_moderation_audit (post_id, created_at desc);

drop trigger if exists guild_memberships_set_updated_at on public.guild_memberships;
create trigger guild_memberships_set_updated_at
before insert or update on public.guild_memberships
for each row execute function public.set_updated_at();

drop trigger if exists guild_score_catalog_set_updated_at on public.guild_score_catalog;
create trigger guild_score_catalog_set_updated_at
before insert or update on public.guild_score_catalog
for each row execute function public.set_updated_at();

drop trigger if exists guild_posts_set_updated_at on public.guild_posts;
create trigger guild_posts_set_updated_at
before insert or update on public.guild_posts
for each row execute function public.set_updated_at();

alter table public.guilds enable row level security;
alter table public.guild_memberships enable row level security;
alter table public.guild_score_catalog enable row level security;
alter table public.guild_score_events enable row level security;
alter table public.guild_posts enable row level security;
alter table public.guild_post_moderation_audit enable row level security;

revoke all on public.guilds from anon, authenticated;
grant select on public.guilds to anon, authenticated;
drop policy if exists "Anyone can read guild definitions" on public.guilds;
create policy "Anyone can read guild definitions"
  on public.guilds for select
  to anon, authenticated
  using (true);

revoke all on public.guild_memberships from anon, authenticated;
revoke all on public.guild_score_catalog from anon, authenticated;
revoke all on public.guild_score_events from anon, authenticated;

revoke all on public.guild_posts from anon, authenticated;
grant select on public.guild_posts to anon, authenticated;
drop policy if exists "Anyone can read approved guild posts" on public.guild_posts;
create policy "Anyone can read approved guild posts"
  on public.guild_posts for select
  to anon, authenticated
  using (status = 'approved');
drop policy if exists "Authors can read their own guild posts" on public.guild_posts;
create policy "Authors can read their own guild posts"
  on public.guild_posts for select
  to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "Admins can read pending guild posts" on public.guild_posts;
create policy "Admins can read pending guild posts"
  on public.guild_posts for select
  to authenticated
  using (public.is_current_user_admin() and status in ('pending', 'rejected', 'hidden'));

revoke all on public.guild_post_moderation_audit from anon, authenticated;
grant select on public.guild_post_moderation_audit to authenticated;
drop policy if exists "Admins can read guild post audit rows" on public.guild_post_moderation_audit;
create policy "Admins can read guild post audit rows"
  on public.guild_post_moderation_audit for select
  to authenticated
  using (public.is_current_user_admin());

create or replace function public.get_guild_leaderboard()
returns table (
  rank integer,
  guild_slug text,
  name_vi text,
  name_en text,
  description_vi text,
  description_en text,
  total_points integer,
  member_count integer,
  contributor_count integer
)
language sql
stable
security definer
set search_path = ''
as $$
  with scores as (
    select e.guild_slug,
           sum(e.points)::integer as total_points,
           count(distinct e.user_id)::integer as contributor_count
    from public.guild_score_events as e
    group by e.guild_slug
  ),
  members as (
    select gm.guild_slug,
           count(*)::integer as member_count
    from public.guild_memberships as gm
    group by gm.guild_slug
  ),
  rows as (
    select
      g.slug as guild_slug,
      g.name_vi,
      g.name_en,
      g.description_vi,
      g.description_en,
      coalesce(s.total_points, 0)::integer as total_points,
      coalesce(m.member_count, 0)::integer as member_count,
      coalesce(s.contributor_count, 0)::integer as contributor_count
    from public.guilds as g
    left join scores as s on s.guild_slug = g.slug
    left join members as m on m.guild_slug = g.slug
  )
  select
    row_number() over (order by r.total_points desc, r.member_count desc, r.guild_slug)::integer,
    r.guild_slug,
    r.name_vi,
    r.name_en,
    r.description_vi,
    r.description_en,
    r.total_points,
    r.member_count,
    r.contributor_count
  from rows as r
  order by r.total_points desc, r.member_count desc, r.guild_slug;
$$;

revoke all on function public.get_guild_leaderboard() from public;
grant execute on function public.get_guild_leaderboard() to anon, authenticated;

create or replace function public.get_my_guild_membership()
returns table (
  guild_slug text,
  nickname text,
  joined_at timestamptz,
  total_points integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    gm.guild_slug,
    gm.nickname,
    gm.joined_at,
    coalesce(sum(e.points), 0)::integer as total_points
  from public.guild_memberships as gm
  left join public.guild_score_events as e
    on e.user_id = gm.user_id
   and e.guild_slug = gm.guild_slug
  where gm.user_id = auth.uid()
  group by gm.guild_slug, gm.nickname, gm.joined_at;
$$;

revoke all on function public.get_my_guild_membership() from public;
grant execute on function public.get_my_guild_membership() to authenticated;

create or replace function public.get_guild_roster(p_guild_slug text)
returns table (
  rank integer,
  nickname text,
  total_points integer,
  joined_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with rows as (
    select
      gm.nickname,
      gm.joined_at,
      coalesce(sum(e.points), 0)::integer as total_points
    from public.guild_memberships as gm
    left join public.guild_score_events as e
      on e.user_id = gm.user_id
     and e.guild_slug = gm.guild_slug
    where gm.guild_slug = lower(btrim(p_guild_slug))
    group by gm.user_id, gm.nickname, gm.joined_at
  )
  select
    row_number() over (order by r.total_points desc, r.joined_at asc, r.nickname asc)::integer,
    r.nickname,
    r.total_points,
    r.joined_at
  from rows as r
  order by r.total_points desc, r.joined_at asc, r.nickname asc;
$$;

revoke all on function public.get_guild_roster(text) from public;
grant execute on function public.get_guild_roster(text) to anon, authenticated;

create or replace function public.join_guild(
  p_guild_slug text,
  p_nickname text
)
returns table (
  guild_slug text,
  nickname text,
  joined_at timestamptz,
  total_points integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_slug text;
  v_nickname text;
  v_existing public.guild_memberships%rowtype;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'GUILD_AUTH_REQUIRED';
  end if;

  v_slug := lower(btrim(coalesce(p_guild_slug, '')));
  v_nickname := btrim(coalesce(p_nickname, ''));

  if not exists (select 1 from public.guilds where slug = v_slug) then
    raise exception 'GUILD_NOT_FOUND';
  end if;

  if char_length(v_nickname) < 2
    or char_length(v_nickname) > 24
    or position(chr(13) in v_nickname) > 0
    or position(chr(10) in v_nickname) > 0
    or position(chr(9) in v_nickname) > 0 then
    raise exception 'GUILD_INVALID_NICKNAME';
  end if;

  select *
  into v_existing
  from public.guild_memberships
  where user_id = v_user_id
  for update;

  if found and v_existing.guild_slug <> v_slug then
    raise exception 'GUILD_MEMBERSHIP_EXISTS';
  end if;

  insert into public.guild_memberships (user_id, guild_slug, nickname)
  values (v_user_id, v_slug, v_nickname)
  on conflict (user_id) do update
    set nickname = excluded.nickname,
        updated_at = now();

  return query
  select gm.guild_slug,
         gm.nickname,
         gm.joined_at,
         coalesce(sum(e.points), 0)::integer
  from public.guild_memberships as gm
  left join public.guild_score_events as e
    on e.user_id = gm.user_id
   and e.guild_slug = gm.guild_slug
  where gm.user_id = v_user_id
  group by gm.guild_slug, gm.nickname, gm.joined_at;
end;
$$;

revoke all on function public.join_guild(text, text) from public;
grant execute on function public.join_guild(text, text) to authenticated;

create or replace function public.record_guild_challenge_event(
  p_client_event_id text,
  p_challenge_id text
)
returns table (
  accepted boolean,
  duplicate boolean,
  points integer,
  guild_slug text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_guild_slug text;
  v_points integer;
  v_existing_points integer;
  v_existing_guild_slug text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'GUILD_AUTH_REQUIRED';
  end if;

  if p_client_event_id is null or char_length(btrim(p_client_event_id)) < 8 or char_length(btrim(p_client_event_id)) > 120 then
    raise exception 'GUILD_INVALID_EVENT';
  end if;

  select gm.guild_slug
  into v_guild_slug
  from public.guild_memberships as gm
  where gm.user_id = v_user_id;

  if v_guild_slug is null then
    raise exception 'GUILD_MEMBERSHIP_REQUIRED';
  end if;

  select c.points
  into v_points
  from public.guild_score_catalog as c
  where c.challenge_id = btrim(coalesce(p_challenge_id, ''))
    and c.enabled = true;

  if v_points is null then
    raise exception 'GUILD_CHALLENGE_NOT_SCORABLE';
  end if;

  insert into public.guild_score_events (user_id, guild_slug, challenge_id, client_event_id, points)
  values (v_user_id, v_guild_slug, btrim(p_challenge_id), btrim(p_client_event_id), v_points)
  on conflict (user_id, client_event_id) do nothing
  returning guild_score_events.points, guild_score_events.guild_slug
  into v_points, v_guild_slug;

  if found then
    return query select true, false, v_points, v_guild_slug;
    return;
  end if;

  select e.points, e.guild_slug
  into v_existing_points, v_existing_guild_slug
  from public.guild_score_events as e
  where e.user_id = v_user_id
    and e.client_event_id = btrim(p_client_event_id);

  return query select false, true, v_existing_points, v_existing_guild_slug;
end;
$$;

revoke all on function public.record_guild_challenge_event(text, text) from public;
grant execute on function public.record_guild_challenge_event(text, text) to authenticated;

create or replace function public.submit_guild_post(
  p_body text,
  p_chapter_id text default null,
  p_challenge_id text default null
)
returns table (
  id uuid,
  guild_slug text,
  nickname_snapshot text,
  body text,
  chapter_id text,
  challenge_id text,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_guild_slug text;
  v_nickname text;
  v_body text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'GUILD_AUTH_REQUIRED';
  end if;

  v_body := btrim(coalesce(p_body, ''));
  if char_length(v_body) < 10 or char_length(v_body) > 800 then
    raise exception 'GUILD_INVALID_POST';
  end if;

  select gm.guild_slug, gm.nickname
  into v_guild_slug, v_nickname
  from public.guild_memberships as gm
  where gm.user_id = v_user_id;

  if v_guild_slug is null then
    raise exception 'GUILD_MEMBERSHIP_REQUIRED';
  end if;

  if (
    select count(*)
    from public.guild_posts as gp
    where gp.user_id = v_user_id
      and gp.status = 'pending'
  ) >= 5 then
    raise exception 'GUILD_POST_LIMIT';
  end if;

  return query
  insert into public.guild_posts (
    guild_slug,
    user_id,
    nickname_snapshot,
    body,
    chapter_id,
    challenge_id,
    status
  )
  values (
    v_guild_slug,
    v_user_id,
    v_nickname,
    v_body,
    nullif(btrim(p_chapter_id), ''),
    nullif(btrim(p_challenge_id), ''),
    'pending'
  )
  returning
    guild_posts.id,
    guild_posts.guild_slug,
    guild_posts.nickname_snapshot,
    guild_posts.body,
    guild_posts.chapter_id,
    guild_posts.challenge_id,
    guild_posts.status,
    guild_posts.created_at;
end;
$$;

revoke all on function public.submit_guild_post(text, text, text) from public;
grant execute on function public.submit_guild_post(text, text, text) to authenticated;

create or replace function public.moderate_guild_post(
  p_post_id uuid,
  p_action text,
  p_rejection_reason text default null
)
returns table (
  post_id uuid,
  status text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  rejection_reason text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_user_id uuid;
  v_post public.guild_posts%rowtype;
  v_new_status text;
  v_reason text;
begin
  v_actor_user_id := auth.uid();
  if v_actor_user_id is null then
    raise exception 'GUILD_MODERATION_AUTH_REQUIRED';
  end if;

  if not exists (
    select 1
    from public.admin_users as au
    where au.user_id = v_actor_user_id
  ) then
    raise exception 'GUILD_MODERATION_FORBIDDEN';
  end if;

  select *
  into v_post
  from public.guild_posts as gp
  where gp.id = p_post_id
  for update;

  if not found then
    raise exception 'GUILD_MODERATION_NOT_FOUND';
  end if;

  if v_post.status <> 'pending' then
    raise exception 'GUILD_MODERATION_STALE_STATUS';
  end if;

  if p_action = 'approve' then
    if p_rejection_reason is not null and btrim(p_rejection_reason) <> '' then
      raise exception 'GUILD_MODERATION_REASON_NOT_ALLOWED';
    end if;
    v_new_status := 'approved';
    v_reason := null;
  elsif p_action = 'reject' then
    v_reason := nullif(btrim(coalesce(p_rejection_reason, '')), '');
    if v_reason is null then
      raise exception 'GUILD_MODERATION_INVALID_REASON';
    end if;
    if char_length(v_reason) > 1000 then
      raise exception 'GUILD_MODERATION_REASON_TOO_LONG';
    end if;
    v_new_status := 'rejected';
  else
    raise exception 'GUILD_MODERATION_INVALID_ACTION';
  end if;

  update public.guild_posts as gp
  set status = v_new_status,
      reviewed_by = v_actor_user_id,
      reviewed_at = now(),
      rejection_reason = v_reason
  where gp.id = v_post.id
  returning gp.id, gp.status, gp.reviewed_by, gp.reviewed_at, gp.rejection_reason
  into post_id, status, reviewed_by, reviewed_at, rejection_reason;

  insert into public.guild_post_moderation_audit (
    post_id,
    action,
    actor_user_id,
    previous_status,
    new_status,
    rejection_reason
  )
  values (
    v_post.id,
    p_action,
    v_actor_user_id,
    v_post.status,
    v_new_status,
    v_reason
  );

  return next;
end;
$$;

revoke all on function public.moderate_guild_post(uuid, text, text) from public;
grant execute on function public.moderate_guild_post(uuid, text, text) to authenticated;
