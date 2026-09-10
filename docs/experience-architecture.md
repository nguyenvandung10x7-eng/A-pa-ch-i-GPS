# Phiêng Lơi-first architecture

Phiêng Lơi is the main product. Book is a secondary surface available both from
the waiting menu and inside the running game. The earlier three-peer-experience
architecture is preserved in PR #147 and in direct-route source, but it no longer
defines primary runtime navigation.

| Route | Current role | Runtime boundary |
| --- | --- | --- |
| `/` | Phiêng Lơi waiting menu | Static React/CSS; no Auth/Supabase startup cost. |
| `/phieng-loi` | Primary game | Lazy mobile-first asset-based 2D cutout game with a responsive 16:9 DOM/CSS compositor and sample-capable/procedural audio. |
| `/book` | Secondary Book | Existing application shell, Auth/Supabase, Book content and audio. It can also run in a same-origin iframe overlay with its duplicate shell chrome hidden. |
| `/1954` | Archived direct experience | Existing lazy 1954/WebGL implementation remains callable by URL but is absent from the waiting menu and primary navigation. |
| `/challenge`, `/map`, `/discover`, `/leaderboard` | Archived direct Explore surfaces | Existing GPS/social implementations remain callable by URL but are absent from primary navigation. |

`/journey/1954` still redirects to `/1954`; `/experiences` redirects to `/`.
Legal, privacy, Auth, admin, and moderation routes remain unchanged.

## Product boundaries

- Phiêng Lơi does not write Challenge progress, points, task completion, GPS data,
  or Book read/saved state.
- Book is an overlay/journal, never a quest log. Opening it pauses the game; closing
  it restores the exact in-memory world and prior play/pause status.
- `src/data/experienceRegistry.ts`, the 1954 modules, and the legacy Explore modules
  are intentionally retained as archived source. They are not imported by the new
  waiting menu.
- Supabase schema, RLS, Edge Functions, Auth, GPS verification, admin, and
  moderation contracts are unchanged.

## Loading, cleanup, and save

- `App.tsx` keeps the opening menu and immersive routes behind route-level lazy
  boundaries. `ApplicationEntry.tsx` mounts Auth/Supabase only for Book, archived
  Explore, and staff routes.
- Phiêng Lơi owns one requestAnimationFrame loop. Page visibility, browser blur,
  pause, Book-open, pagehide, and unmount all stop or neutralize input correctly.
- Unmount aborts sample preload, stops active decoded takes, closes Web Audio and
  the human-voice `HTMLAudioElement`, and removes every input/visibility/orientation
  listener.
- The versioned local save keeps player/world state required for Continue; capture
  scenes are never persisted mid-cutscene.
- Netlify's SPA redirect continues to support direct-route refreshes. No database
  migration or paid runtime service is needed for this remake.
