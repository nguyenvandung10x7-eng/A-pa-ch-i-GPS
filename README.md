# Book of Dien Bien

Book of Dien Bien now opens as **Phiêng Lơi**, a compact, mobile-first, landscape
asset-based 2D comedy game. The player is only trying to cross a small village. Movement
and one contextual `PHÀ ƠI!` button are the entire control vocabulary; the village
supplies the consequences.

Book remains available from the waiting menu and as an in-game overlay. The 1954
and legacy Explore/Challenge surfaces are no longer part of primary navigation,
but their source and direct routes remain intact as archived product work.

## Primary product flow

- `/` — Phiêng Lơi waiting menu: **CHƠI / TIẾP TỤC**, **BOOK**, **CÀI ĐẶT**.
- `/phieng-loi` — closed-world comedy game.
- `/book` — Book of Dien Bien, directly accessible or embedded over the paused
  game without resetting the player position.

Archived direct routes such as `/1954`, `/challenge`, `/map`, `/discover`, and
`/leaderboard` still resolve. `/journey/1954` and `/experiences` remain compatibility
redirects. Admin, moderation, legal, authentication, Book, GPS, and Supabase
contracts are unchanged.

## Phiêng Lơi

The game uses a DOM/CSS cutout compositor and a small dense village:
road, layered stilt houses, fields, produce, animated stream, waterwheel, village
chief, drinking table, animals, everyday props, and shortcuts. The presentation is
project-owned WebP atlases and a hand-painted 3/4 world plate—not pixel or Canvas
primitives. It has
no RPG progression, quest log, XP, combat, crafting, or inventory system.

The loop is deliberately short:

> ĐI → GẶP CHUYỆN NGỚ NGẨN → PHÀ ƠI / CHẠY / ĐỨNG NHÌN → HẬU QUẢ → ĐI TIẾP

HeeSun is the comic threat and capture/reset mechanic. HaNu is an independent
walking chaos generator. An internal, invisible four-step absurdity state makes
the village progressively less reasonable. The implementation contract and full
event inventory live in [`docs/phieng-loi-closed-world.md`](docs/phieng-loi-closed-world.md).

### Controls

- Mobile: left 360° joystick and one right-side **PHÀ ƠI!** action button.
- Keyboard: WASD/arrows to move; Space, E, or Q for **PHÀ ƠI!**.
- Escape pauses. Utility controls for Book, sound, pause, and menu are not gameplay
  actions.

### Required real voice recording

`PHÀ ƠI!` intentionally has no oscillator or TTS substitute. Production requires
a project-cleared human recording at:

`public/audio/phieng-loi/pha-oi-human.mp3`

Until that file and its rights record are supplied, the visual/camera/NPC response
still runs and Settings reports the recording as missing. See
[`public/audio/phieng-loi/README.md`](public/audio/phieng-loi/README.md) and the
complete [`recording library`](docs/phieng-loi-audio-recording-library.md).

## Book and existing systems

The canonical Book catalog remains in `src/data/bookCatalog.ts`, with literary
copy in the existing `src/data/bookLiterary*.ts` layers. Book audio, read/saved
state, nearby places, Auth/Supabase, GPS verification, Challenge persistence, and
staff tools are preserved. Book is not a quest log and does not mutate game state.

## Rendering, lifecycle, and persistence

- The game route stays lazy-loaded; no game-engine dependency is added.
- A 480×270 logical camera drives a responsive 16:9 DOM/CSS world compositor.
- Character and support poses come from transparent WebP atlases; the environment
  comes from one versioned world plate. Asset slots are centralized in
  `visualAssets.ts`.
- CSS transform animation honors reduced motion.
- Page hide, blur, and visibility changes clear input and pause safely.
- Leaving the route cancels animation frames, removes listeners, stops the voice
  element, and closes the AudioContext.
- Local save data preserves the player position, encounter state, absurdity,
  HeeSun/HaNu state, moved table, and necessary world events.

## Development

```bash
npm install
npm run dev
```

## Production verification

```bash
npm run verify
npm run lint
```

`npm run verify` audits public audio provenance, runs strict TypeScript checking,
and creates the Vite production build. Netlify runs the production-environment
check plus the same verification before publishing `dist/`; SPA deep links are
handled by `netlify.toml`.

## Privacy and media

The game itself does not request location. Location is requested only by existing
Book/Challenge interactions that need it. Game saves, Book state, and Challenge
progress remain browser-local unless an existing connected service explicitly
handles a feature.

Only media with confirmed project permission may be shipped. Do not add the human
voice recording—or any replacement audio—without documenting creator, source,
licence/consent, and redistribution rights.
