revoke insert on public.video_submissions from authenticated;
grant insert (user_id, challenge_id, challenge_title_snapshot, gps_verified, gps_verified_at, submitted_url, canonical_url, tiktok_video_id) on public.video_submissions to authenticated;
