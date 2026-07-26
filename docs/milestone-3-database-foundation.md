# Milestone 3 database foundation

Run these migrations manually in the Supabase SQL Editor in order:

1. Open your Supabase project dashboard and go to SQL Editor.
2. Run [supabase/migrations/20260726120000_create_milestone3_foundation.sql](../supabase/migrations/20260726120000_create_milestone3_foundation.sql).
3. Run [supabase/migrations/20260726130000_milestone3_followup.sql](../supabase/migrations/20260726130000_milestone3_followup.sql).
4. Run [supabase/migrations/20260726140000_milestone3_insert_hardening.sql](../supabase/migrations/20260726140000_milestone3_insert_hardening.sql).
5. Verify that the tables, indexes, RLS policies, triggers, and the vote-count helper were created successfully.
6. Confirm the backfill populated profiles for any existing auth.users rows by checking the profiles table.
7. Note that the follow-up migration adds a unique partial index for non-null TikTok video IDs and tightens the insert and vote policies.
8. Note that client submissions must omit protected/default columns such as `id`, `star_value`, `status`, `created_at`, and `updated_at`; those values should rely on database defaults or trusted operations.
9. Note that tiktok_video_id is expected to be supplied during insert and is not updated through the client-facing update policy.

These migrations are intentionally not applied automatically by the app.
