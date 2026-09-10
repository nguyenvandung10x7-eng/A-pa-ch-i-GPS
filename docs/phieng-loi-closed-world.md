# Phiêng Lơi — closed-world comedy vertical slice

## Product decision

Phiêng Lơi is the main Book of Dien Bien experience: a compact, dense, mobile-first
landscape comedy game. It is not an open-world POI tour and has no RPG, quest log,
XP, skill tree, crafting, combat, or inventory. Book is a secondary overlay and
waiting-menu entry. The 1954 and Explore implementations are hidden from primary
flow but retained on their direct routes and in source.

The map is a deliberately compressed fictional play space, not a geographic or
travel-time claim. Its visual vocabulary—stilt houses, mountain layers, village
road, fields and corn, stream, waterwheel, cooking smoke, chickens, a dog, a
buffalo, produce, and everyday objects—is rendered by project-owned Canvas code.

## Core loop and controls

> ĐI → GẶP CHUYỆN NGỚ NGẨN → PHÀ ƠI / CHẠY / ĐỨNG NHÌN → HẬU QUẢ → ĐI TIẾP

The only gameplay inputs are 360° movement and one contextual **PHÀ ƠI!** action.
Mobile uses a left joystick and one large right action button. Keyboard uses
WASD/arrows plus Space, E, or Q. Book, mute, pause, settings, and menu buttons are
utility UI and do not create extra player abilities.

The player is only told that they want to cross the village. There are no mission
markers, checklists, minimap POIs, or required explanation of world systems.

## Implemented comedy systems

### HeeSun

- Distinct, larger red/yellow silhouette and comic chase motif.
- Required meeting sequence: invitation, player “Thôi.”, the short silence,
  “Bạn ôi…”, then “BẠN ƠI!” and chase.
- No combat and no Game Over.
- Capture cuts to **3 GIỜ SAU**, the dead-eyed player at the drinking table,
  “Làm chén cuối.”, fade, **5 GIỜ SAU**, then a reset at the village entrance.
- Chickens, HaNu collisions, and level-three absurd entrances can interrupt or
  restart the chase.

### HaNu

- Smaller blue silhouette; the phone is always visible.
- Walks an independent loop while cycling “Ừ.” / “Thế à?” calls.
- Opens HeeSun's gate, physically blocks a route, startles chickens, reveals the
  nearby player with “Nó ở đây này!”, starts an object domino, and can collide with
  HeeSun to rescue the player accidentally.
- Says “Ừ, tôi đang ở nhà.” while walking through the stream.

### Required absurd events

| Event | Implemented behavior |
| --- | --- |
| Mâm nhậu | Calls “Vào làm chén.”, relocates after the player leaves, appears ahead on the alternate route, then occupies the upper field on its third encounter. |
| Trưởng bản | “Tôi xin nói ngắn gọn.” starts a persistent speech; the clock jumps 00:01 → 02:17 → 07:42 → 19:36, sunset advances, and “Thứ nhất…” continues after the player walks away. |
| Nhóm bên suối | Fully clothed adult figures, distant non-voyeuristic framing, required cinematic line, rapidly multiplying fish, then “Hôm nay cá hơi đông.” |
| Con gà | One PHÀ ƠI! near the road triggers a village-wide flock. A chasing HeeSun follows it briefly, then resumes the chase. |
| Nhà sàn | Nearby calls answer “Ơi.” then “Ơiiii.”; the third call gets silence followed by “ƠIIII!” from a distant house. |
| Repeated call | Rapid calls raise chaos, panic animals, and produce increasingly unreasonable distant replies. |

### OCOP as short jokes

There is no shop, brochure, description screen, or inventory. Pressing PHÀ ƠI!
near an item consumes it immediately:

| Item | Short effect |
| --- | --- |
| Bí xanh Tìa Dình | Player swells; HeeSun comments, copies the player, grows much larger, and remains dangerous. |
| Cà phê Mường Ảng | World animation, chickens, waterwheel, and HaNu slow down; the player and HeeSun do not. |
| Mắc ca Điện Biên | Every moving step produces an exaggerated crunch, particles, and sound; nearby waiting HeeSun can hear and start chasing. |

### Hidden escalation

`absurdityLevel` is derived internally from time, calls, and encounters and is
never displayed. Level 0 is mostly ordinary; level 1 adds villagers in wrong
places; level 2 enables table/chicken/domino escalation; level 3 adds impossible
HeeSun entrances, persistent distant replies, packed fish, and background events.

## Book contract

Book opens in a same-origin overlay while the Canvas state remains mounted. The
game pauses and persists before opening. Closing Book restores the exact position
and prior status; Book does not inspect or mutate game events. Direct `/book`
access remains available from the waiting menu.

## Audio contract

The signature call must be a real, consented human recording. Runtime reserves:

`public/audio/phieng-loi/pha-oi-human.mp3`

There is deliberately no beep, oscillator, synthesized voice, or TTS fallback for
that call. Missing media is visible in Settings and does not block the Canvas/NPC
response. Do not mark the audio complete until the supplied recording is added to
the provenance ledger and the project has explicit usage and redistribution
rights.

Current non-voice motifs—village ambience, stream, dog, steps, chickens, chase, phone,
domino, table, OCOP, capture, and exit—are lightweight procedural Web Audio owned
by this implementation. A later audio pass can replace them only with documented,
project-cleared assets.

## Performance and lifecycle

- Fixed 480×270 render target, smoothing disabled, camera-space scenery culling,
  capped particles, and a low-quality profile for constrained devices.
- Landscape/coarse-pointer rotation guard and entirely touch-playable controls.
- Visibility and blur clear sticky movement; pause/Book suspend audio.
- Unmount cancels animation, removes listeners, stops the voice element, and closes
  AudioContext.
- Versioned local Continue save covers player position, absurdity, calls, HeeSun,
  HaNu, table relocation, chief/stream/gate/domino events, and consumed OCOP items.

## Release gates

- `npm run lint`
- `npm run verify` (audio-provenance check, strict TypeScript, production build)
- Engine simulation for HeeSun intro/chase/capture/reset, contextual calls, every
  required event, all three OCOP effects, escalation, save/restore, and exit.
- Real-device QA still required on at least one recent iPhone in landscape for
  safe areas, two-thumb input, orientation, resumed audio, iframe Book scrolling,
  thermal behavior, and Safari AudioContext lifecycle.
- Real human `PHÀ ƠI!` recording and documented rights still required before
  production audio can be considered complete.
