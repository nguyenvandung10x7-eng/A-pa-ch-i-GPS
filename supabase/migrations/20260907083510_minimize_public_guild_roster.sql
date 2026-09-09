-- Keep exact membership timestamps private. Public roster consumers only need
-- rank, nickname, and contribution points; joined_at remains an internal
-- deterministic tie-breaker.
drop function if exists public.get_guild_roster(text);

create function public.get_guild_roster(p_guild_slug text)
returns table (
  rank integer,
  nickname text,
  total_points integer
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
    r.total_points
  from rows as r
  order by r.total_points desc, r.joined_at asc, r.nickname asc;
$$;

revoke all on function public.get_guild_roster(text) from public, anon, authenticated;
grant execute on function public.get_guild_roster(text) to anon, authenticated;
