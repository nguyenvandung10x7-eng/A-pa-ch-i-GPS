# Phiêng Lơi — compact absurd-comedy game

## Product contract

Phiêng Lơi is the primary Book of Dien Bien game: a compact, closed-world,
mobile-first landscape comedy. It is not a POI tour or RPG. There is no combat,
jump, dash, inventory, currency, XP, crafting, dialogue tree, minimap, or quest
log.

The complete gameplay vocabulary is:

> MOVE + PHÀ ƠI!

The player always understands the controls. The village is deliberately less
predictable: ordinary actor routines collide, interrupt one another, seed delayed
consequences, and sometimes return to complete normality.

The fictional compressed map is not a geographic or travel-time claim. Route,
menu, Book overlay, 1954, GPS Challenge, Auth/Admin and Supabase boundaries remain
unchanged by the game-logic pass.

## Event Director

`absurdityDirector.ts` owns a typed, data-driven registry. Definitions declare an
ID, tier, trigger signals, weight, minimum hidden absurdity, context requirements,
cooldown, anti-repeat group, priority, interruption policy, duration, optional
follow-ups, actor/world changes, animation/audio cues and short dialogue bubbles.
`gameEngine.ts` applies the finite state changes; the director does not run a
continuous simulation or a scripted cutscene graph.

Director evaluation happens only on meaningful signals:

- a normal PHÀ ƠI call;
- entry into an authored location;
- HANU reaching a waypoint;
- an event ending;
- a debounced important collision;
- a delayed event becoming due;
- a sparse 3.5–5.7 second world tick.

Runtime limits are fixed at one major chain, two micro-events, six delayed items,
five follow-up steps and fourteen recent-history entries. Persistent collisions
are edge/debounce driven rather than reevaluated every animation frame.

## PHÀ ƠI contract

Every accepted press first selects a weighted voice family without repeating the
previous family, then rolls the null outcome.

- Exactly 20% of rolls are **TRUE NOTHING**. The player still calls, but the call
  creates no NPC response, object change, dialogue, particles, secondary event,
  chain or delayed compensation. Existing routines and chases continue.
- Every accepted press disables PHÀ ƠI for 5 seconds. The short, non-numeric
  recharge gives the player time to read the outcome; save/restore retains the
  remaining lock. Movement and all already-running routines continue.
- The other 80% resolves against local context. It uses the same 5-second
  observation window and can start local, chained, delayed or rare outcomes.

The runtime reserves normal, long, panicked, whisper and rare silly recording
families. Missing signature recordings fail silent; no TTS or synthetic voice is
substituted.

## Actor routines and collisions

### HeeSun

The first meeting remains the fixed invitation → player “Thôi.” → “Bạn ơi…”
sequence. HeeSun then becomes the recurring hunter with finite states for idle,
wander, notice, intro, chase, distraction, interruption, drinking, ambush,
capture, reset and rare flight.

Variations include a delayed arrival, an implausibly small hiding corner, a long
stare, stopping for a sandal, stopping at the drinking table, following chickens,
switching target to HANU's food and running through the scene for unexplained
reasons. Every chase has loss distance, timeout, interruption and reset paths.

Capture is not Game Over: **3 GIỜ SAU**, the player sits dead-eyed at the table,
HeeSun says “Làm chén cuối.”, then **5 GIỜ SAU** returns the player to the village
entrance without erasing completed persistent state.

### HANU

HANU walks a lightweight authored road loop while looking at his phone. Early in
the session he says exactly:

- “Alo, 30' nữa tôi ship cơm cho bạn.”
- later, “30' nữa tôi ship.”
- player: “30' trước bạn cũng nói thế mà.”
- HANU: “Ừ.”

Later he carries a visible food box. The player catches him by proximity—there is
no extra catch button. Delivery variations can pause for the phone, choose the
wrong route, stop just before capture, offer the box to the wrong person, pass the
feast or chief, attract chickens, or very rarely work perfectly. Variations time
out and cannot permanently prevent delivery.

HANU delivery and HeeSun chase are explicitly compatible. The signature ordering
HANU → player → HeeSun can coexist with a chasing feast and crossing chickens.

### Mâm nhậu, chickens, chief and stream

- The feast has independent idle routines, invitation, stare, reaction, chase,
  reset and authored relocation states. It may switch from the player to HANU's
  food. After release it calmly returns to “Vào làm chén.”
- Chickens can peck, stare singly or together, panic away or toward the player,
  cross the screen, follow HANU or HeeSun, and invade the feast. They are cheap
  chain participants rather than decoration.
- The chief begins with “Tôi xin nói ngắn gọn.” and continues “Thứ nhất…”,
  “Thứ hai…” after the player leaves. Nearby chaos pauses him briefly; it does not
  reset the speech.
- The stream keeps its distant, fully clothed community framing. Normal calls can
  increase fish activity; TRUE NOTHING cannot.

A rare arrival by HeeSun's wife disperses the feast and sends HeeSun away. She
has a dedicated original pose atlas and a brief visual “VỀ.” placard rather than
another gameplay speech bubble. Rare macro
beats include growth figures, a dry world-news subtitle, two simultaneous HeeSuns
and the theoretical right to leave. They are deliberately low-weight and share an
anti-repeat group, keeping the dominant tone everyday and slapstick.

## Dialogue and audio

Dialogue is event data, not an RPG conversation system. Anchored speech bubbles
are allowlisted to the player, HeeSun, HANU and VuongMe. Reactions from the feast,
chief, stream and ambient world stay in animation, audio, the compact chief HUD or
cinematic copy, so simultaneous routines do not cover the playfield.

## Rare VuongMe karaoke event

`vuongme-karaoke-disco` is a low-weight, long-cooldown major event eligible only
from the 80% normal PHÀ ƠI branch and never from TRUE NOTHING. It keeps the current
map and player position, pauses bounded NPC routine clocks for 10.5 seconds, moves
the stream group into the gathering with a simple visual interpolation, and uses
CSS light beams/dots plus procedural original disco audio. The player remains
controllable. The hard cut restores HeeSun chase, HANU delivery, feast, chickens
and chief speech without duplicating actors or delivery state. The shipped lyric
is project-original rather than the uncleared reference lyric.

Only cleared project recordings may be marked `ready` in `audioManifest.ts`.
Generic effects can use the existing procedural development fallback. Signature
human lines never do. The exact recording slots and licence gate live in
`phieng-loi-audio-recording-library.md` and `audio-provenance.md`.

## Save and lifecycle

Save version 3 preserves checkpoint, hidden absurdity, PHÀ ƠI remaining cooldown,
recent director history/cooldowns, recurring one-shot flags, HeeSun major state,
HANU delivery state, feast state, chief progress, OCOP consumption and exit state.
Ephemeral particles, active micro-events and delayed queues are intentionally not
serialized, preventing duplicate delivery/capture chains after restore. Version 1
and 2 saves still migrate to a valid authored route.

Book opens in a same-origin overlay while the scene stays mounted. Opening Book or
pause saves state and suspends audio; closing restores the prior play state. Blur,
visibility changes and teardown clear held movement, cancel animation and release
audio resources.

## Performance and test gates

- Painted WebP/SVG presentation and the existing DOM/CSS compositor are unchanged
  by this logic pass; no Canvas primitive renderer was reintroduced.
- Named actors use bounded finite-state machines, authored waypoints and simple
  steering. HeeSun navigation is sampled rather than recomputed every frame.
- A visible dropped frame is recovered with bounded 32 ms simulation substeps
  (at most one second per browser frame). Cooldowns stay tied to real elapsed
  time while movement and collision checks avoid a single large tunnelling step.
- Actor count, dialogue, particles, active events and delayed queues are bounded.
- `npm run verify:phieng-loi` directly tests TRUE NOTHING probability and purity,
  the 5-second cooldown on both branches, bubble allowlisting, VuongMe state
  pause/resume, cooldown continuity, anti-repeat, director bounds, HeeSun,
  HANU delivery/variations, feast, chickens, chains, sparse evaluation, saves,
  legacy migration and exit.
- Release gates remain `npm run lint`, `npm run typecheck`, `npm run build` and
  `npm run verify`; real-device iPhone landscape QA remains required.

The intended pacing is normality → micro weirdness → quiet → surprise → escalation
→ release → normality. A high internal absurdity level unlocks possibilities; it
does not force the village to be loud all the time.
