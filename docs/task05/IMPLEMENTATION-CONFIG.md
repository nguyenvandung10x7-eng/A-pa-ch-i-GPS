# Task05 DEV implementation choices — A01 / technical revision 1

Owner authorization: 29 September 2026, continue v0.5 including §13, finish technical mapping and implement a DEV playtest. Baseline `ce02cf3a21ab088a80e13417f3ff3d3b7c8545ac`, tree `3592324ac66b9eaf3c74e1238e0cc942fa272e48`. Task04 is closed; F12 = `ACCEPTED_WITH_OWNER_WAIVER`.

This records implementation choices within the delegated technical scope. It does not relabel earlier proposals as separate owner approvals or change the 24 AC / 18 Task04 AC.

| Choice | Implementation |
|---|---|
| Entry | `/phieng-loi?dev=hs01-play`, DEV dynamic import; production foundation unchanged |
| Yard / input | Exact Task04 APPROVED geometry, camera, footprint and joystick; original validator/collision unchanged |
| Spawn | Player(240,300), HeeSun(1000,300), wake(240,300). Wake relocation only behind black after capture, never as collision rescue |
| NPC body | 24×16 WU; static gap2; 480 WU/s. Player240, same Task04 analog/no acceleration/full-vector stop |
| Path | Shortest visibility path through four expanded obstacle corners, replan toward Player's position at native update boundary. Per-segment duration retained; static collision clips before dynamic contact |
| Contact | Continuous relative AABB over piecewise paths, closed edge/corner contact, earliest time. Tangency to static obstacle interior remains legal |
| Call | CHASE only; footpoint Euclidean distance ≤96 WU; open interior of physical obstacle blocks the line between footpoints. Tangency at obstacle edge is clear; no collider inflation |
| Event timing | Pointer call queued at active simulation boundary, evaluated at t=0 of next native update; existing t=0 body contact wins tie; future contact loses to an effective t=0 call. Trace preserves input/outcome and contact TOI |
| Call outcomes | RNG [0,.2) TRUE NOTHING, [.2,1) normal; one RNG draw per accepted call; no reward/response for TRUE NOTHING; 60000 active ms lock from accepted call, no spam extension |
| Clock | One WorldController native update driver; no extra RAF/physics. 0–1000ms inclusive; invalid delta/position ERROR. Each phase consumes its own slice; source-animation frame completion excluded from drunk timer |
| Presentation | A01 hold500→fade500→actual 3s audio ended + wake ready→fade-in500→stand animation complete/control-ready→drunk5000→normal MOVE |
| Audio | Isolated Web Audio owner, created/unlocked by Start user gesture; decode delivered WAV; BufferSource native ended; suspend on pause/hidden, retry on failure, source/context cleanup. Phaser foundation noAudio remains true. No new voice asset or synthesized voice added |
| Asset frames | Original PNG unchanged; 25 individual alpha-component rectangles in `assets/frames.json`. Source1395×2048; no equal-cell split or resampling. Left-to-right within five visually separated rows |
| Animation |15fps, repeat0, skipMissedFrames=false. Constant scale .30; each rect's origin(.5,1), local footpoint(width/2,height) mapped to the same world footpoint. Final `stand-24` retained for idle and MOVE, same origin/scale/position; no second overlay for scarf/pumpkin |
| DEV pre-capture visuals | Reuse Task04 Player marker and add a labeled HeeSun body marker. New stand-up art appears only at wake, so scarf/pumpkin are not revealed early. No walk animation/art-final claim; this is the minimal DEV representation |
| Wallet | Entry-local fixture10→0 (plus test0→0); commit once in BLACK_PREPARE before fade-in; no inventory/backend/economy module |
| Lifecycle | Cancel disposes downstream; unmount/route exit disposes all owners; re-entry/reload is new DEV session with10 and no lock. No save/refund claim |
| QA fixtures | DEV API supports deterministic RNG/entry config, delta boundaries and stale delivery; traces label synthetic. Successful browser E2Es traverse real upstream and trusted input; no capture/jump-phase API |

Source asset hashes and waveform duration remain the ones in v0.5 §13. Runtime evidence, counts and SHA are produced by `scripts/report-task05-evidence.mjs`; local tests are never labeled CI or QA PASS.

The only extension to the existing verifier is a scoped allowance for `world/hs01/**`, exactly the PNG and WAV asset paths, and entry-local AudioContext. Boundary/strict/no legacy/no RAF/no physics and existing entry defaults remain enforced. No source changes under reveal/manga/flow/foundation; their hashes and all baseline test hashes are recorded in `baseline-sha256.json`.

No chase re-entry after capture. No table escape branch. No Book, save, economy/OCOP or downstream implementation. QA independent verdict remains PENDING.
