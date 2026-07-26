# Milestone 3 Design: Supabase foundation for TikTok submissions and voting

## 1. Overall architecture

### Product goal
This milestone is designed as a fun tourism-promotion feature for the existing GPS challenge app. The priority is to increase participation and encourage more tourism-related TikTok content, not to build a high-security anti-cheat system.

The app will keep the existing browser-side GPS verification from Milestone 2 as a lightweight participation gate. Players can complete a challenge, publish a TikTok video, submit the TikTok URL inside the app, and let other authenticated users vote. The app stores only the TikTok URL and related metadata; it does not store video files.

### High-level architecture
- Frontend: React + TypeScript + Vite (existing app)
- Styling: Tailwind CSS (existing app)
- Backend/data: Supabase Postgres
- Authentication: Google OAuth via Supabase Auth
- File handling: none for video content; the app stores only URLs and metadata

### Proposed system boundaries
- The current gameplay flow remains intact.
- GPS verification remains browser-side and lightweight.
- Milestone 3 adds a social submission and voting layer on top of the existing challenge experience.
- TikTok remains an external content source. The app links to it and stores metadata only.
- No complex server-side GPS verification, fake-location detection, device attestation, or precise location storage is planned for MVP.

### Recommended stack
- Frontend: React, TypeScript, React Router, Tailwind
- Data access: Supabase JS client
- Auth: Google OAuth through Supabase Auth
- Database: Supabase Postgres
- Media rendering: TikTok embed when possible; otherwise open the TikTok URL externally

### Design principles
- Mobile-first experience
- Minimal friction for submissions and voting
- Keep gameplay changes small and non-disruptive
- Treat GPS verification as a lightweight participation check, not a fraud-proof proof of location
- Keep scoring based only on app-stored votes
- Favor participation and content volume over strict anti-cheat controls

---

## 2. User flow

### A. Player completes a challenge
1. Player completes the existing GPS verification flow in the app.
2. The app marks the challenge as locally verified for participation purposes.
3. Player records and publishes a TikTok video externally.
4. Player opens the app, pastes the TikTok URL, and submits it.

### B. Submission flow
1. User signs in with Supabase Auth.
2. User selects a completed challenge or a challenge they want to submit for.
3. User enters the TikTok URL.
4. The app validates the URL format and normalizes it where possible.
5. The app stores the submission in Supabase with a lightweight status.
6. The submission becomes visible to others only after approval.

### C. Voting flow
1. Authenticated user browses approved submissions.
2. User taps a submission card.
3. User presses Vote.
4. The app checks whether the current user already voted on that submission.
5. If allowed, a vote is stored once.
6. The leaderboard refreshes immediately.

### D. Leaderboard flow
1. The leaderboard reads approved submissions only.
2. Each submission is ranked by vote count.
3. Results are shown globally or filtered by challenge.

### E. Error states
- Invalid or unsupported TikTok URL
- Duplicate submission by the same user for the same challenge
- Duplicate vote by the same user on the same submission
- Self-voting blocked
- Anonymous voting blocked

---

## 3. Supabase database schema

### Overview
The implemented MVP uses three core tables: profiles, video_submissions, and votes.

### Tables

#### profiles
Stores app-level user identity and public profile metadata.

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  tiktok_username text,
  total_stars integer not null default 0 check (total_stars >= 0),
  total_play_seconds bigint not null default 0 check (total_play_seconds >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

#### video_submissions
Stores each TikTok submission linked to a challenge and a user.

```sql
create table public.video_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id text not null,
  challenge_title_snapshot text not null,
  gps_verified boolean not null default false,
  gps_verified_at timestamptz,
  submitted_url text not null,
  canonical_url text,
  tiktok_video_id text,
  star_value integer not null default 0 check (star_value >= 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

#### votes
Stores one vote per authenticated user per submission.

```sql
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  submission_id uuid not null references public.video_submissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, submission_id)
);
```

### Implemented indexes
- `idx_profiles_total_stars`
- `idx_profiles_created_at`
- `idx_video_submissions_user_id`
- `idx_video_submissions_challenge_id`
- `idx_video_submissions_status_created_at`
- `idx_votes_submission_id`

### Notes on the schema
- The app does not store video files.
- `submitted_url` is the original URL entered by the user.
- `canonical_url` is the normalized URL used for display and deduplication.
- `tiktok_video_id` is stored where available and used to reduce duplicate submissions.
- `gps_verified` is based on the app’s local gameplay flow and is not fraud-proof.
- `gps_verified_at` stores when the local verification occurred, but it is not treated as a strong authenticity guarantee.

---

## 4. Authentication design

### Authentication provider
The implemented flow uses Google OAuth through Supabase Auth.

### User identity model
- Each authenticated user gets a Supabase auth user.
- A matching row is created in `profiles` through a trigger on `auth.users`.
- The trigger backfills `display_name` and `avatar_url` from `raw_user_meta_data` for new and existing auth users.

### Implemented flow
1. User taps Sign in.
2. User authenticates with Google OAuth through Supabase Auth.
3. The app loads the user profile.
4. The user can submit and vote.

### Why this fits the app
- Supabase Auth is simple to integrate and fits the MVP timeline.
- RLS can tie `video_submissions` and `votes` to the authenticated user ID.
- This supports the product goal of encouraging participation rather than hardening against every possible abuse case.

### Account rules
- Authenticated users only for submissions and votes
- One account may vote once per submission
- Self-voting is blocked
- Duplicate video IDs are prevented where possible

---

## 5. Submission workflow

### Submission creation requirements
A submission should be allowed when:
- the user is authenticated
- the local gameplay flow has marked the challenge as verified for participation purposes
- the TikTok URL is valid and not empty
- the user has not already submitted the same TikTok video ID where it can be detected
- the user has not already submitted for that same challenge if the team wants to keep the MVP simple

### Lightweight participation gate
The app should treat GPS verification as a lightweight participation gate only. It is enough to confirm that the user completed the local challenge flow and is attempting to share content. It is not a strict anti-cheat mechanism and should not be presented as fraud-proof.

### Submission status model
- `pending`: newly created and awaiting review or approval
- `approved`: visible in the public feed and leaderboard
- `rejected`: explicitly declined
- `hidden`: removed from public visibility but retained in the database

### Submission validation rules
- URL must be a TikTok URL, such as `https://www.tiktok.com/@user/video/123`
- URL is normalized to a canonical form where possible
- Only the URL and metadata are stored; no upload or video file handling

### Metadata captured on submission
- `challenge_id`
- `challenge_title_snapshot`
- `gps_verified`
- `gps_verified_at`
- `submitted_url`
- `canonical_url`
- `tiktok_video_id`
- `status`
- `created_at`

### Submission UI behavior
- Show a simple “Submit TikTok” CTA after the player completes the challenge in the current flow.
- Provide a short form with:
  - challenge context
  - TikTok URL input
  - optional short note
  - submit button
- Keep the flow short and mobile-friendly.
- After a successful submit, show a confirmation screen and a clear path to view submissions.

### Recommended MVP constraints
- One submission per user per challenge is recommended for simplicity.
- Only approved submissions appear in the public feed and leaderboard.
- Moderation is lightweight and manual, not overly complex.

---

## 6. Voting workflow

### Voting rules
- Only authenticated users may vote.
- One authenticated account can vote once per submission.
- A vote cannot be changed once created.
- Self-voting is not allowed.
- Voting only affects the app’s internal leaderboard.
- TikTok likes, comments, views, and followers do not influence scoring.

### Voting UX
- The submission card shows a Vote button.
- Once a vote is accepted, the button changes to Voted.
- The UI should keep the action fast and simple.

### Server-side enforcement
- Use the unique constraint on `(user_id, submission_id)` in `votes`.
- Enforce the approved-submission and no-self-voting rules with RLS.
- Do not allow clients to directly edit vote totals.

### Vote payload
```json
{
  "submission_id": "uuid"
}
```

### Vote count handling
- Vote totals are derived from an aggregate helper function, `public.get_submission_vote_counts()`.
- The helper returns `submission_id` and `vote_count` for approved submissions.
- The leaderboard reads totals from this helper instead of a denormalized column.

---

## 7. Leaderboard algorithm

### Core rule
The leaderboard uses only votes stored in this app.

### MVP ranking formula
- Rank by `vote_count` descending
- Tie-break by `created_at` ascending for older submissions in ties

### Example logic
```text
score = vote_count
sort by score desc, created_at asc
```

### Scope
- Global leaderboard across approved submissions
- Optional challenge-specific leaderboard filtered by `challenge_id`

### Display fields
- Rank
- Player name
- Challenge title snapshot
- Vote count
- Submission date
- TikTok link button or embed preview

### Important product decision
External TikTok metrics are not used for scoring. Likes, comments, views, and followers do not affect the leaderboard.

---

## 8. Required pages

### 1. Landing / Discover page
- Shows recent approved submissions
- Allows unauthenticated users to browse public content
- Encourages sign-in for voting and submission

### 2. Challenge detail page
- Shows the challenge information and the approved submissions for that challenge
- Supports voting and submission actions

### 3. Submit TikTok page
- Simple form for creating a submission
- Input for the TikTok URL
- Minimal friction and clear validation messaging

### 4. My submissions page
- Shows the current user’s submissions and their status
- Supports simple follow-up if needed

### 5. Explore / Feed page
- Shows approved public submissions
- Supports filtering by challenge and sorting by votes

### 6. Leaderboard page
- Shows ranked submissions based on app votes
- Supports global and challenge-specific views

### 7. Profile page
- Shows the user’s public profile and their submissions

### 8. Auth page
- Sign in / sign out flow

---

## 9. Component hierarchy

### App shell
- App
  - Router
  - AuthProvider
  - Layout
    - Header
    - MobileNav
    - MainContent

### Shared components
- Button
- Card
- EmptyState
- Modal
- FormField
- ValidationMessage
- LoadingState

### Submission-related components
- SubmissionForm
- SubmissionCard
- SubmissionList
- TikTokPreview
- TikTokLinkButton

### Voting-related components
- VoteButton
- VoteCountBadge
- VoteStatusMessage

### Leaderboard-related components
- LeaderboardTable
- LeaderboardFilterBar
- LeaderboardRow

### Page-level components
- LandingPage
- ChallengeDetailPage
- SubmitSubmissionPage
- MySubmissionsPage
- ExplorePage
- LeaderboardPage
- ProfilePage
- AuthPage

---

## 10. Security and Row Level Security rules

### Security goals
- Keep the experience simple and friendly
- Restrict writes to authenticated users
- Prevent duplicate votes and self-voting
- Keep vote totals controlled by the backend rather than the client
- Avoid exposing content that is not approved for public viewing

### Applied RLS overview

#### profiles
- Authenticated users can read profiles.
- Authenticated users can update only their own profile fields: `display_name`, `avatar_url`, and `tiktok_username`.
- Client-side updates cannot modify totals such as `total_stars` or `total_play_seconds`.

#### video_submissions
- Anyone can read submissions that are `approved`.
- Authenticated users can read their own submissions.
- Authenticated users can insert only their own pending submissions.
- Authenticated users can update only their own pending submissions for editable fields such as `submitted_url` and `canonical_url`.
- Administrative fields remain protected from normal client updates.

#### votes
- Authenticated users can create votes only for approved submissions owned by another user.
- Authenticated users can read their own votes.
- Authenticated users can delete their own votes.
- One vote per user/submission is enforced by the unique constraint.

### Additional hardening
- Status values are constrained to `pending`, `approved`, `rejected`, or `hidden`.
- Numeric totals are guarded by non-negative checks.
- Security-definer functions use `set search_path = ''` for safer execution.

---

## 11. API structure

### Preferred API pattern
Use the Supabase client for straightforward CRUD operations and simple Edge Functions for enforcement.

### Client-side operations
- `signIn()`
- `signOut()`
- `createSubmission(payload)`
- `getSubmissions(filters)`
- `createVote(submissionId)`
- `getLeaderboard(filters)`
- `getMySubmissions(userId)`

### Simple Edge Functions
- `validate-tiktok-url`: validates and normalizes the URL
- `create-submission`: checks simple business rules before insert
- `create-vote`: checks duplicate-vote and self-vote rules

### Example payloads

#### Create submission
```json
{
  "challenge_id": "challenge-001",
  "challenge_title_snapshot": "Riverside Landmark",
  "gps_verified": true,
  "gps_verified_at": "2026-07-25T12:00:00Z",
  "submitted_url": "https://www.tiktok.com/@user/video/1234567890",
  "canonical_url": "https://www.tiktok.com/@user/video/1234567890",
  "tiktok_video_id": "1234567890"
}
```

#### Create vote
```json
{
  "submission_id": "uuid"
}
```

---

## 12. Risks and limitations of TikTok integration

### TikTok URL limitations
- TikTok URLs can change or become invalid over time
- Some URLs may not be publicly accessible depending on account privacy settings
- TikTok embeds may not work consistently in every environment or browser

### Product constraints
- The app cannot upload or host the video itself
- The app depends on TikTok being publicly reachable
- The app should not assume embed support will always work

### Mitigation plan
- Store only the URL and metadata; do not depend on video file storage
- Use a simple external link fallback when embed fails
- Keep the submission flow short and forgiving
- Do not use TikTok metrics such as likes, comments, views, or followers for scoring

### Important product note
GPS verification is a lightweight participation gate. It should be presented as part of the game flow, not as a strong authenticity guarantee.

---

## 13. Implementation roadmap split into multiple small pull requests

### PR 1 — Foundation and database setup
- Add Supabase client configuration and environment variables
- Create `profiles`, `video_submissions`, and `votes` tables
- Add initial RLS policies
- Add a simple auth shell

### PR 2 — Authentication and profile setup
- Add Supabase Auth sign-in/sign-out flow
- Create a profile row for new users
- Add basic loading and account state UI

### PR 3 — Submission form and validation
- Add a simple “Submit TikTok” page and form
- Validate TikTok URL format
- Save submissions with the MVP fields and a simple `pending` status
- Keep the flow short and mobile-friendly

### PR 4 — Submission discovery and preview
- Add submission cards and list views
- Render TikTok links with a fallback to external opening
- Add challenge-specific filtering
- Add empty states and loading states

### PR 5 — Voting and leaderboard
- Add one-vote-per-user-and-submission logic
- Aggregate vote counts through `public.get_submission_vote_counts()`
- Add a simple leaderboard by vote count only
- Add public and challenge-specific leaderboard views

### PR 6 — Moderation and polish
- Add lightweight moderation handling for `pending`, `approved`, `rejected`, and `hidden`
- Improve mobile layout and accessibility
- Add clear empty/error states and polished copy

---

## Recommended MVP scope
The simplest version of this milestone should include:
- Supabase Auth
- Simple submission creation with a TikTok URL
- One vote per submission per authenticated account
- A public leaderboard based on vote count only
- Mobile-first layout
- No video uploads
- No complex GPS anti-cheat system

## Expected outcome
This milestone adds a lightweight social layer to the existing GPS challenge app. Players can complete the game, share a TikTok submission, and let the community vote, while the product remains focused on participation, tourism promotion, and simple mobile-first engagement.

---

## Summary of changes made to the design document
- Reframed the milestone as a tourism-promotion feature focused on participation and content volume rather than anti-cheat rigor.
- Kept the existing browser-side GPS verification from Milestone 2 as a lightweight participation gate.
- Removed any requirement for complex server-side GPS verification, fake-location detection, device attestation, or precise location storage.
- Removed the proposed challenge_completions table from the MVP schema.
- Updated the submission schema to the requested fields: challenge_id, challenge_title_snapshot, gps_verified, gps_verified_at, submitted_url, canonical_url, tiktok_video_id, status, and created_at.
- Clarified that gps_verified is based on the app’s local gameplay flow and is not fraud-proof.
- Simplified moderation statuses to pending, approved, rejected, and hidden.
- Clarified that only approved submissions appear in the public feed and leaderboard.
- Kept the core database protections: authenticated users only, one vote per user per submission, no self-voting, duplicate TikTok video IDs prevented where possible, and client-side vote totals not directly editable.
- Adjusted the roadmap to emphasize a simple, low-friction, mobile-first submission flow.
