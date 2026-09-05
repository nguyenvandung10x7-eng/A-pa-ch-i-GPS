# Milestone 3 database foundation

Run these migrations manually in the Supabase SQL Editor in order:

1. Open your Supabase project dashboard and go to SQL Editor.
2. Run [supabase/migrations/20260726120000_create_milestone3_foundation.sql](../supabase/migrations/20260726120000_create_milestone3_foundation.sql).
3. Run [supabase/migrations/20260726130000_milestone3_followup.sql](../supabase/migrations/20260726130000_milestone3_followup.sql).
4. Run [supabase/migrations/20260726140000_milestone3_insert_hardening.sql](../supabase/migrations/20260726140000_milestone3_insert_hardening.sql).
5. Run [supabase/migrations/20260727120000_milestone3_voting.sql](../supabase/migrations/20260727120000_milestone3_voting.sql).
6. Run [supabase/migrations/20260728130000_milestone3_moderation.sql](../supabase/migrations/20260728130000_milestone3_moderation.sql).
7. Verify that the tables, indexes, RLS policies, triggers, and helper functions were created successfully.
8. Confirm the backfill populated `profiles` for any existing `auth.users` rows by checking the `profiles` table.
9. Note that the follow-up migration adds a unique partial index for non-null TikTok video IDs and tightens the insert and vote policies.
10. Note that client submissions must omit protected/default columns such as `id`, `star_value`, `status`, `created_at`, and `updated_at`; those values should rely on database defaults or trusted operations.
11. Note that `tiktok_video_id` is expected to be supplied during insert and is not updated through the client-facing update policy.
12. Note that submitted TikTok URLs are immutable after submission; if a URL is incorrect, the user must create a new submission.
13. After the moderation migration, run [supabase/migrations/20260905120000_add_guilds_mvp.sql](../supabase/migrations/20260905120000_add_guilds_mvp.sql) to create the four Guilds, memberships, server-catalogued contribution events, Guild notes, RLS policies, and Guild moderation RPCs.
14. Verify that the seeded Guild rows are exactly `history`, `nature`, `walk`, and `rebellion), then test the public Guild leaderboard before enabling the feature for players.
15. Note that Guild score events are idempotent by authenticated user and client run ID, but the existing GPS check remains browser-side in this MVP and is not a server-side anti-cheat proof.

These migrations are intentionally not applied automatically by the app.

Final note: the voting migration updates the vote-count helper to include every approved submission in vote counts, including approved submissions with zero votes.

Manual administrator assignment note: assign the first administrator only in the Supabase SQL Editor. Never expose administrator assignment through the client app.

Safe SQL example (replace the placeholder UUID before running):

```sql
insert into public.admin_users (user_id, created_by)
values ('00000000-0000-0000-0000-000000000000', null)
on conflict (user_id) do nothing;
```
