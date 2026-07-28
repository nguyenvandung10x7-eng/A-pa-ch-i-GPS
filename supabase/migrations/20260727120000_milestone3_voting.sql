drop function if exists public.get_submission_vote_counts();

create or replace function public.get_submission_vote_counts(p_cursor uuid default null, p_limit bigint default 1000)
returns table (submission_id uuid, vote_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    vs.id as submission_id,
    count(v.id)::bigint as vote_count
  from public.video_submissions as vs
  left join public.votes as v on v.submission_id = vs.id
  where vs.status = 'approved'
    and (p_cursor is null or vs.id > p_cursor)
  group by vs.id
  order by vs.id asc
  limit greatest(1, least(coalesce(p_limit, 1000), 1000));
$$;

revoke all on function public.get_submission_vote_counts(uuid, bigint) from public;
grant execute on function public.get_submission_vote_counts(uuid, bigint) to anon, authenticated;
