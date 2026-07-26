create unique index if not exists idx_video_submissions_tiktok_video_id_unique
  on public.video_submissions (tiktok_video_id)
  where tiktok_video_id is not null;

revoke delete on public.votes from authenticated;
drop policy if exists "Authenticated users can delete own votes"
  on public.votes;

drop policy if exists "Users can insert own pending submissions" on public.video_submissions;
create policy "Users can insert own pending submissions"
  on public.video_submissions for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'pending'
    and star_value = 0
    and gps_verified = true
    and gps_verified_at is not null
  );

drop policy if exists "Authenticated users can read profiles" on public.profiles;
create policy "Authenticated users can read profiles"
  on public.profiles for select
  to anon, authenticated
  using (true);
