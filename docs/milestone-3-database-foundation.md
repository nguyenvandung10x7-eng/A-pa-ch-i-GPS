# Milestone 3 database foundation

Run this migration manually in the Supabase SQL Editor:

1. Open your Supabase project dashboard and go to SQL Editor.
2. Open the migration file at [supabase/migrations/20260726120000_create_milestone3_foundation.sql](../supabase/migrations/20260726120000_create_milestone3_foundation.sql).
3. Paste the SQL into the editor and click Run.
4. Verify that the tables, indexes, RLS policies, triggers, and the vote-count helper were created successfully.
5. Confirm the backfill populated profiles for any existing auth.users rows by checking the profiles table.
6. Note that the follow-up migration adds a unique partial index for non-null TikTok video IDs and tightens the insert and vote policies.
7. Note that tiktok_video_id is expected to be supplied during insert and is not updated through the client-facing update policy.

This migration is intentionally not applied automatically by the app.
