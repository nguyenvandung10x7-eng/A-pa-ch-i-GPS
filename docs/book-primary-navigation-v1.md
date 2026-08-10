# Book primary navigation v1

Implement Phase 3B only.

## Goal
Make the product read first as **BOOK OF DIEN BIEN**, not as a GPS challenge app.

## Primary navigation
- BOOK -> `/book`
- NEAR ME -> `/near-me`
- SAVED -> `/saved`

Use these three as the primary navigation on desktop and mobile.

## Legacy navigation
Keep all legacy routes accessible during migration. Move the existing challenge-oriented entries into the secondary/menu area rather than deleting routes or functionality:
- `/experiences`
- `/challenge`
- `/discover`
- `/leaderboard`
- `/history`
- `/moderation` and `/admin` when applicable

## Brand treatment
Update the visible header identity so it presents **BOOK OF DIEN BIEN** as the product. Do not keep `GPS Challenge` as the prominent header title. Avoid a tourism-app tone. A restrained editorial/book identity is preferred.

## Route behavior
- Existing `/near-me` and `/saved` route shells remain route-safe.
- Book detail routes `/book/chapter/:chapterId` and `/book/page/:pageId` should keep BOOK active in primary nav. Use NavLink matching logic as needed rather than requiring an exact `/book` match.
- No dead links.

## Mobile
The bottom mobile navigation should be BOOK / NEAR ME / SAVED / MENU.
Legacy routes remain in MENU.

## Constraints
- Do not implement Saved state yet.
- Do not request GPS or implement distance sorting yet.
- Do not change Book state/localStorage.
- Do not change legacy challenge storage/gameplay.
- Do not remove existing routes.
- Do not mix literary/content changes into this PR.
- Preserve music, language and account controls.
- Preserve admin-only navigation behavior.
- Keep accessibility semantics valid.

## Cleanup
Delete this implementation-plan file before the PR is considered complete; it is only scaffolding for the implementation task.
