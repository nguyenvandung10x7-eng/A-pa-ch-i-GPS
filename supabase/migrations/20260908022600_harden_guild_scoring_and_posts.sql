-- Keep Guild competition bounded to the challenges that are active in the
-- runtime catalog. Retired challenges remain in the catalog for referential
-- integrity, but cannot receive new score events.
insert into public.guild_score_catalog (challenge_id, points, enabled)
values
  ('quang-truong-7-5-mthen', 120, true),
  ('cho-muong-nhe-tang-banh-trung-thu', 200, true),
  ('cau-ta-ko-khu-tang-banh-trung-thu', 240, true),
  ('ban-a-pa-chai-tang-banh-trung-thu', 260, true),
  ('cot-co-a-pa-chai-mthen', 480, true),
  ('cot-co-a-pa-chai-trai-ban-lanh-lung', 480, true),
  ('doi-a1-chuyen-tau-thoi-gian-1954', 400, true),
  ('ban-phieng-loi-mthen', 180, true),
  ('thac-ke-nenh-mthen', 240, true),
  ('quang-truong-7-5-hat-quoc-ca', 120, true),
  ('quan-com-hung-ha-thuoc-lao-free', 100, true),
  ('de-xe-may-ngoai-troi-qua-dem', 180, true),
  ('nhin-xuong-long-chao-cua-chung-ta', 140, true),
  ('tim-cay-xoai-co-thu', 220, true)
on conflict (challenge_id) do update
set points = excluded.points,
    enabled = excluded.enabled,
    updated_at = now();

update public.guild_score_catalog
set enabled = false,
    updated_at = now()
where challenge_id not in (
  'quang-truong-7-5-mthen',
  'cho-muong-nhe-tang-banh-trung-thu',
  'cau-ta-ko-khu-tang-banh-trung-thu',
  'ban-a-pa-chai-tang-banh-trung-thu',
  'cot-co-a-pa-chai-mthen',
  'cot-co-a-pa-chai-trai-ban-lanh-lung',
  'doi-a1-chuyen-tau-thoi-gian-1954',
  'ban-phieng-loi-mthen',
  'thac-ke-nenh-mthen',
  'quang-truong-7-5-hat-quoc-ca',
  'quan-com-hung-ha-thuoc-lao-free',
  'de-xe-may-ngoai-troi-qua-dem',
  'nhin-xuong-long-chao-cua-chung-ta',
  'tim-cay-xoai-co-thu'
)
and enabled is distinct from false;

-- Preserve the first accepted completion if an environment already contains
-- duplicate rows, then make one score award per player/challenge enforceable
-- under concurrent requests.
with duplicate_events as (
  select id,
         row_number() over (
           partition by user_id, challenge_id
           order by created_at asc, id asc
         ) as duplicate_rank
  from public.guild_score_events
)
delete from public.guild_score_events as event
using duplicate_events
where event.id = duplicate_events.id
  and duplicate_events.duplicate_rank > 1;

create unique index if not exists idx_guild_score_events_user_challenge_unique
  on public.guild_score_events (user_id, challenge_id);

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
  v_challenge_id text;
  v_client_event_id text;
  v_points integer;
  v_existing_points integer;
  v_existing_guild_slug text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'GUILD_AUTH_REQUIRED';
  end if;

  v_client_event_id := btrim(coalesce(p_client_event_id, ''));
  v_challenge_id := btrim(coalesce(p_challenge_id, ''));

  if char_length(v_client_event_id) < 8 or char_length(v_client_event_id) > 120 then
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
  where c.challenge_id = v_challenge_id
    and c.enabled = true;

  if v_points is null then
    raise exception 'GUILD_CHALLENGE_NOT_SCORABLE';
  end if;

  insert into public.guild_score_events (user_id, guild_slug, challenge_id, client_event_id, points)
  values (v_user_id, v_guild_slug, v_challenge_id, v_client_event_id, v_points)
  on conflict do nothing
  returning guild_score_events.points, guild_score_events.guild_slug
  into v_points, v_guild_slug;

  if found then
    return query select true, false, v_points, v_guild_slug;
    return;
  end if;

  select event.points, event.guild_slug
  into v_existing_points, v_existing_guild_slug
  from public.guild_score_events as event
  where event.user_id = v_user_id
    and event.challenge_id = v_challenge_id;

  if found then
    return query select false, true, v_existing_points, v_existing_guild_slug;
    return;
  end if;

  raise exception 'GUILD_EVENT_ID_REUSED';
end;
$$;

revoke all on function public.record_guild_challenge_event(text, text) from public, anon, authenticated;
grant execute on function public.record_guild_challenge_event(text, text) to authenticated;

-- Lock the caller's membership row before counting pending posts. Requests
-- from the same player are then serialized and cannot race past the cap.
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
  where gm.user_id = v_user_id
  for update;

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

revoke all on function public.submit_guild_post(text, text, text) from public, anon, authenticated;
grant execute on function public.submit_guild_post(text, text, text) to authenticated;
