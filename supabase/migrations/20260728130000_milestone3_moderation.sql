create table if not exists public.admin_users (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid null references public.profiles(id)
);

alter table public.admin_users enable row level security;

revoke all on public.admin_users from anon, authenticated;

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users as au
    where au.user_id = auth.uid()
  );
$$;

revoke all on function public.is_current_user_admin() from public;
grant execute on function public.is_current_user_admin() to authenticated;

alter table public.video_submissions
  add column if not exists reviewed_by uuid null references public.profiles(id),
  add column if not exists reviewed_at timestamptz null,
  add column if not exists rejection_reason text null;

alter table public.video_submissions
  drop constraint if exists video_submissions_moderation_review_consistency;

-- NOT VALID keeps migration compatible with legacy approved/rejected rows that predate review metadata.
alter table public.video_submissions
  add constraint video_submissions_moderation_review_consistency
  check (
    (
      status = 'pending'
      and reviewed_by is null
      and reviewed_at is null
      and rejection_reason is null
    )
    or (
      status = 'approved'
      and reviewed_by is not null
      and reviewed_at is not null
      and rejection_reason is null
    )
    or (
      status = 'rejected'
      and reviewed_by is not null
      and reviewed_at is not null
      and rejection_reason is not null
      and btrim(rejection_reason) <> ''
      and char_length(rejection_reason) <= 1000
    )
    or status = 'hidden'
  ) not valid;

create table if not exists public.video_submission_moderation_audit (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.video_submissions(id),
  action text not null check (action in ('approve', 'reject')),
  actor_user_id uuid not null references public.profiles(id),
  previous_status text not null,
  new_status text not null,
  rejection_reason text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_video_submission_moderation_audit_submission_id
  on public.video_submission_moderation_audit (submission_id, created_at desc);

create index if not exists idx_video_submission_moderation_audit_actor_user_id
  on public.video_submission_moderation_audit (actor_user_id, created_at desc);

alter table public.video_submission_moderation_audit enable row level security;

revoke all on public.video_submission_moderation_audit from anon, authenticated;
grant select on public.video_submission_moderation_audit to authenticated;

drop policy if exists "Admins can read moderation audit rows" on public.video_submission_moderation_audit;
create policy "Admins can read moderation audit rows"
  on public.video_submission_moderation_audit for select
  to authenticated
  using (public.is_current_user_admin());

drop policy if exists "Admins can read non-public submissions for moderation" on public.video_submissions;
create policy "Admins can read non-public submissions for moderation"
  on public.video_submissions for select
  to authenticated
  using (
    public.is_current_user_admin()
    and status in ('pending', 'rejected', 'hidden')
  );

revoke update on public.video_submissions from authenticated;
revoke update (
  id,
  user_id,
  challenge_id,
  challenge_title_snapshot,
  gps_verified,
  gps_verified_at,
  submitted_url,
  canonical_url,
  tiktok_video_id,
  star_value,
  status,
  created_at,
  updated_at,
  reviewed_by,
  reviewed_at,
  rejection_reason
) on public.video_submissions from authenticated;
grant update (submitted_url, canonical_url) on public.video_submissions to authenticated;

create or replace function public.moderate_video_submission(
  p_submission_id uuid,
  p_action text,
  p_rejection_reason text default null
)
returns table (
  submission_id uuid,
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
  v_trimmed_reason text;
  v_submission public.video_submissions%rowtype;
  v_new_status text;
begin
  v_actor_user_id := auth.uid();

  if v_actor_user_id is null then
    raise exception 'MODERATION_AUTH_REQUIRED';
  end if;

  if not exists (
    select 1
    from public.admin_users as au
    where au.user_id = v_actor_user_id
  ) then
    raise exception 'MODERATION_FORBIDDEN';
  end if;

  select *
  into v_submission
  from public.video_submissions as vs
  where vs.id = p_submission_id
  for update;

  if not found then
    raise exception 'MODERATION_NOT_FOUND';
  end if;

  if v_submission.status <> 'pending' then
    raise exception 'MODERATION_STALE_STATUS';
  end if;

  if p_action = 'approve' then
    if p_rejection_reason is not null and btrim(p_rejection_reason) <> '' then
      raise exception 'MODERATION_REASON_NOT_ALLOWED';
    end if;

    v_new_status := 'approved';
    v_trimmed_reason := null;
  elsif p_action = 'reject' then
    v_trimmed_reason := nullif(btrim(coalesce(p_rejection_reason, '')), '');
    if v_trimmed_reason is null then
      raise exception 'MODERATION_INVALID_REASON';
    end if;
    if char_length(v_trimmed_reason) > 1000 then
      raise exception 'MODERATION_REASON_TOO_LONG';
    end if;

    v_new_status := 'rejected';
  else
    raise exception 'MODERATION_INVALID_ACTION';
  end if;

  update public.video_submissions as vs
  set
    status = v_new_status,
    reviewed_by = v_actor_user_id,
    reviewed_at = now(),
    rejection_reason = v_trimmed_reason
  where vs.id = v_submission.id
  returning
    vs.id,
    vs.status,
    vs.reviewed_by,
    vs.reviewed_at,
    vs.rejection_reason
  into
    submission_id,
    status,
    reviewed_by,
    reviewed_at,
    rejection_reason;

  insert into public.video_submission_moderation_audit (
    submission_id,
    action,
    actor_user_id,
    previous_status,
    new_status,
    rejection_reason
  )
  values (
    v_submission.id,
    p_action,
    v_actor_user_id,
    v_submission.status,
    v_new_status,
    v_trimmed_reason
  );

  return next;
end;
$$;

revoke all on function public.moderate_video_submission(uuid, text, text) from public;
grant execute on function public.moderate_video_submission(uuid, text, text) to authenticated;
