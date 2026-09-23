# Task 01 — HS_REVEAL_BEER_SAINT

Standalone Phaser reveal, stacked on foundation commit
`a1076beffeeac5b7d4d75568dd79fdfdfc3eddc2`, branch
`task/pl-hs-01-reveal`. This is a production handoff, not independent QA approval.

## Gate

QA/user explicitly authorized conditional Task 01 development on 23 September
2026. This supersedes the older “do not start Task 01” wording in the PL-00
handoff, but does not close its device gate:

- F12: NOT PROVEN — real Android Chrome evidence missing.
- PL-00: BLOCKED_BY_EVIDENCE.
- Task 01: STACKED / CONDITIONAL / NOT MERGEABLE.
- No merge of PL-00 or Task 01 and no release until real-device QA is complete.
- If Android reveals a foundation defect, fix and QA PL-00 first, then update
  Task 01 to the new verified foundation commit.
- No changes to preview PR #156 or the integration branch.

## Source reconciliation (before code changes)

All four supplied files were read without modifying them:

| Source | Relevant location | Decision |
| --- | --- | --- |
| PL-HS-01_v0.7(2).md | §9, §13, §16 | 25 frames, row-major, 12–15 fps/default 15, separate aura, completion and cleanup; only standalone reveal now. |
| Phieng_Loi_Gameplay_Bible_v0.5(2).md | §11, §18–20 | Same layer order; voice-only; no downstream Task 01 implementation. |
| HS01_Codex_Pack_v0.7(2).zip | README, implementation notes, state JSON task_01_boundary | Assets/config only; single reveal_complete after cleanup; conditional foundation gate. |
| Phieng_Loi_Block_Master_v0.1(3).xlsx | BLOCK_MASTER row 3, especially K3/O3/S3; ASSET_STATUS row 8 | Tracks updated HS-01, explicitly limits Task 01 to reveal and leaves downstream for later. |

No unresolved conflict affects Task 01. Block Spec governs HS-01, Bible governs
game-wide rules, Pack supplies assets/config; Block Master is tracking only.
The Block Spec inside the ZIP is byte-identical to the supplied standalone file.
All 35 entries in the pack's SHA-256 manifest were verified before importing.

The attachments were rechecked on 23 September against the existing local
implementation commit `4cf471a0230fd7b3ac8943030f35f61c3a80f7ed` (direct parent:
`a1076beffeeac5b7d4d75568dd79fdfdfc3eddc2`). All 28 imported PNGs and both source
configuration JSON files are byte-identical to this supplied Pack. The existing
implementation was preserved in an isolated checkout, not overwritten.

| Supplied attachment | SHA-256 |
| --- | --- |
| Block Spec | `c5ef5696ff58bb9c8f7da3cb9ad2a5f34bdb20f77a1d95b60ea7c0cc025dfcf8` |
| Bible | `36496b40b2509d183cd16e8564c4b31961a250709f2049ddd0918170c18ca30b` |
| Pack ZIP | `ae1258e4b1020140326be77036e4896333e99149cac42571860e5976f1410162` |
| Block Master | `c3f77d3eccbecb9b8a02b80197311e5b24dc8ee8460a48b43f1404979dee9d11` |

This is agreement for **Task 01**, not certification that every downstream row
of the tracking workbook matches Bible v0.5. Known out-of-scope drift:

- `BLOCK_MASTER!B14/L14` still place the scarf beat in the older house/promise
  context. Bible §4.2 Clue 3/§12 place its origin at the stream.
- `BLOCK_MASTER!D21:O22` retain the older late-game pumpkin sacrifice/new-pumpkin
  ending. Bible §4.2–4.5 places the old pumpkin's sacrifice in hidden night,
  revealed at Clue 4, and retains the village-sign ending direction.
- `STORY_GRAPH!B13:D17` still track the earlier scarf/pumpkin/cosmic reveal
  edges rather than the four sequential clue dependencies in Bible §14.

Bible v0.5 governs those downstream decisions. No downstream content, workbook
rows, or attached source files are changed by this reveal task.

The source frame JSON still says next_phase=MANGA, and state JSON retains the
whole block flow. Pack README/notes and task_01_boundary explicitly mark those
fields as future reference. The runtime never consumes them. The separate
35-entry pack includes four aura files; this task imports the three required
layers and leaves optional RibbonFront off.

Voice timing is not approved: voice_cue_time_sec=null, proposal=0.45 seconds.
No mapped/verified intro voice exists in the supplied pack or current asset
catalog. The asset ID and unbound cue remain exposed in config/inspection;
no voice timer, replacement recording, music, or audio subsystem is enabled.

## Independent entry and ownership

Run `npm ci`, then `npm run dev`, and open:

`/phieng-loi?dev=hs-reveal`

The application shell still needs its normal environment configuration. Automated
tests use the existing non-secret `.invalid` test environment, without login.

Click **Play**, then **Snapshot** to inspect. **Pause/Resume** use the existing
foundation policy. **Cancel**, **Restart scene**, **Unmount/Mount**, and
**Re-enter now** exercise interruption/cleanup. The FPS selector takes effect on
the next mount. Default is 15; 12 is available for acceptance testing.

React owns only dev controls. The existing host/adapter owns the Game and its
StrictMode/destroy barrier. A small dev-only attachScene hook replaces the
technical foundation probe for this harness; the default probe is unchanged.
Production `/phieng-loi` keeps its empty foundation and cannot enable this
harness by query. No production trigger or route to a downstream phase exists.

For a later caller, preload `REVEAL_ASSETS` with the existing Loader convention,
construct `HeeSunReveal(scene, { onComplete, x?, y?, fps? })`, and call `play()`.
Do not instantiate a second controller for the same scene. Repeated play calls
while playing/finishing/paused are rejected; replay after completion/cancel is
explicit. Call `dispose()` to release ownership before replacing the controller.
Scene SHUTDOWN/DESTROY also disposes it.

## Playback and cleanup contract

- Original 25 PNGs remain RGBA 210×312, unmodified; sequence 01 through 25 follows
  source row-major order. No redraw, resampling, frame warp or baked aura.
- Sprite-local Phaser animation: frameRate from pack, repeat=0,
  skipMissedFrames=false. No independent reveal-duration timer.
- Constant bottom-center cell anchor; character scale 1.12 from pack. First-pass
  aura placement is in config, distinct from the authored frame sequence.
- HeeSunRevealRoot children: BeerTowerBack, HaloGlow, RibbonBack,
  HeeSunSprite25F. RibbonFront is not imported/displayed.
- Native tweens: 0.2 s fade-in/out, 3 px bob with 1.1 s period, 1.00–1.03 scale
  pulse with 0.9 s period, offsets between layers. Rotation stays 0 per config.
- Animation completion starts aura fade. After destroying root/children and
  removing owned tweens/listeners, exactly one callback carries
  `{ type: 'reveal_complete', runId }` per completed run.
- Cancel, shutdown or unmount never report successful completion. Loaded
  textures are Game-owned for replay and released by Game destruction.
- Native POST_RENDER observations record the actual frame sequence separately
  from animation-update observations for QA. No replacement RAF or clock.

The source silhouette's alpha≥64 lower bound varies from y=307 to y=310
(exclusive pixel bounds). This source-authored three-pixel variation is retained;
the cell anchor does not move. No normalization of character frames is performed.

## Verification

```
npm run verify:pl00
npm run verify:hs01
npm run typecheck
npm run build
npx playwright install --with-deps chromium
npm run test:hs01
npm run test:pl00
```

`test:pl00` runs the full directory: the original 16 foundation tests plus the
Task 01 tests. CI on the Task 01 branch runs `npm run verify` and that full suite.
No new dependency is introduced. The PL-00 verifier retains its legacy import,
strictness and empty production manifest checks, allowing only the explicit
reveal module/asset extension; `verify:hs01` additionally audits source hashes.

Task tests cover 12/15 fps and replay, all 25 frames observed after rendering,
no duplicate root/event, pause during playback and fade, cancellation/restart,
immediate re-entry and paused unmount, landscape/portrait resize, a long browser
frame, missing asset failure, and production exclusion. JSON attachments record
snapshots and console; screenshots record reveal composition and clean exit.
The injected missing-asset test expects one HTTP 404; normal runs require zero
application console errors/exceptions.

DevTools/browser resizing and synthetic stalls are not physical Android/iOS QA.
Independent QA should check both the visual animation and this lifecycle evidence.

### Local revalidation limits

Revalidation results: **23/23 PASS** (16 foundation + 7 reveal browser tests),
zero skipped, zero unexpected failures, zero flaky retries. PL-00 static checks,
HS01 source/import checks and TypeScript pass. The browser suite's Vite build
passes. Both 12 and 15 fps runs rendered frames 1–25 in order; replay produces
one clean completion for each run. Playback/fade pause, cancellation, scene
restart, re-entry, unmount, resize and a simulated long frame all pass. The
deliberate missing-asset case generates its expected 404; normal reveal runs
have no console errors or exceptions.

The revalidation checkout is sparse and intentionally lacks the unrelated
`public/audio` and old image directories. Consequently the aggregate `npm run
verify` stops in the existing audio-provenance check with `ENOENT public/audio`;
this is not reported as a passing full-repository verification. Run that full
gate in a complete checkout before merge. The isolated PL-00/HS01 checks,
TypeScript and browser-test build remain separately reportable.

The default Playwright browser cache was absent in this environment. The local
test runner uses the same committed Playwright tests/config, with only the
executable path overridden to the available Linux Chromium 153.0.8010.0 and
output paths directed to this session's evidence. No browser test assertions
are weakened. This is not Android Chrome or iPhone Safari evidence.

## Scope exclusions

No enter-zone trigger, manga, chase, capture, blackout, recovery, drunk state,
player/map/NPC systems, save/load, PHÀ ƠI, other block, or new narrative content.
No import, copy, adaptation or architecture reference from legacy Phiêng Lơi
runtime, worldLayout, PR #148, extract branches, old remake branches or previews.
Gameplay Bible, Block Spec, Block Master, chase animation and app audio are unchanged.
