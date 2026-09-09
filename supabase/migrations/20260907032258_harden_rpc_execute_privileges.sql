-- Keep the public API surface explicit. Supabase's postgres role grants
-- EXECUTE on new public functions to API roles by default, so revoking from
-- PUBLIC alone does not remove the direct anon/authenticated grants.

alter default privileges for role postgres in schema public
  revoke execute on functions from public;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon;
alter default privileges for role postgres in schema public
  revoke execute on functions from authenticated;

revoke execute on function public.get_my_guild_membership() from public, anon;
grant execute on function public.get_my_guild_membership() to authenticated;

revoke execute on function public.join_guild(text, text) from public, anon;
grant execute on function public.join_guild(text, text) to authenticated;

revoke execute on function public.record_guild_challenge_event(text, text) from public, anon;
grant execute on function public.record_guild_challenge_event(text, text) to authenticated;

revoke execute on function public.submit_guild_post(text, text, text) from public, anon;
grant execute on function public.submit_guild_post(text, text, text) to authenticated;

revoke execute on function public.moderate_guild_post(uuid, text, text) from public, anon;
grant execute on function public.moderate_guild_post(uuid, text, text) to authenticated;

-- Existing admin-only RPCs should not be callable by the anonymous API role.
revoke execute on function public.is_current_user_admin() from public, anon;
grant execute on function public.is_current_user_admin() to authenticated;

revoke execute on function public.moderate_video_submission(uuid, text, text) from public, anon;
grant execute on function public.moderate_video_submission(uuid, text, text) to authenticated;

-- This function is invoked by an auth.users trigger, not directly by clients.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Index the foreign keys and the per-user pending-post lookup used by the MVP.
create index if not exists idx_guild_posts_user_status
  on public.guild_posts (user_id, status);
create index if not exists idx_guild_posts_reviewed_by
  on public.guild_posts (reviewed_by)
  where reviewed_by is not null;
create index if not exists idx_guild_post_moderation_audit_actor_user_id
  on public.guild_post_moderation_audit (actor_user_id);
create index if not exists idx_guild_score_events_challenge_id
  on public.guild_score_events (challenge_id);
