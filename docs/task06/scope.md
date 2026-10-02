# Task 06 — HS-01 Player Preview

Owner authorization: 2026-10-02. Base b59d50578e1268a0d6c9c8569e596fafae88229b; tree 66d24bd73cccc4ff76672b51a42627b91cc028cc. Task05 INTEGRATED / POST_MERGE_QA_PASS, DEV only, closed. Task06 independent QA PENDING. F12 ACCEPTED_WITH_OWNER_WAIVER.

Reuse A01, yard, assets, runtime. Preview-only build mode hs01-preview, route /phieng-loi, player controls only. No QA globals or injected outcomes. Ordinary builds remain excluded. No economy/OCOP/pho/village/save/Book/main/release. New player-facing owner uses existing modules unchanged, independently of QA harness.

## Approved P01–P12
|AC|Acceptance|
|---|---|
|P01|HTTPS /phieng-loi direct load and refresh; exact build SHA available.|
|P02|Ordinary build exclusion and query resistance; preview has no force APIs/QA UI.|
|P03|One Start creates one session; double tap cannot duplicate reveal/audio.|
|P04|25 rendered reveal frames, cleanup then three manual manga pages/back; complete only loaded final page, cleanup then chase.|
|P05|A01 MOVE, contact and valid nearby call capture, one transaction, TRUE NOTHING and cooldown unchanged.|
|P06|Capture hold/fade, native audio ended plus readiness, wake balance0/scarf/pumpkin, stand.|
|P07|After standing and control ready, inverted MOVE 5000ms active, normal MOVE; no rechase.|
|P08|Manual/hidden pause freezes movement, audio and clocks without catch-up.|
|P09|Exit/reload/replay teardown invalidates stale callbacks; fresh fixture session, no save/refund.|
|P10|Image/audio errors show retry; no fake completion or audio-ended bypass.|
|P11|Touch/orientation/resize preserves input and state; F12 waiver unchanged.|
|P12|44+28+46 regression tests kept separate from preview tests; deploy smoke exact SHA; no fail/skip/retry/flaky in acceptance evidence.|

## Visual reconciliation
Gameplay Bible v0.5 (Library Phieng_Loi_Gameplay_Bible_v0.5(2).md, §§8/11/18) explicitly removes table imagery from HS01 to preserve Clue1. Earlier full-screen table image + fade intent is not implemented. Later owner-approved Task05 v0.5/A01 and current Task06 instructions retain native 3s blackout audio, fade, visible scarf/pumpkin stand animation and 5s inverted MOVE. Preserve this approved behavior; do not silently resolve Bible divergence by adding table imagery or removing drunkenness. Preview labels this gap. Before wake, Player/HeeSun and yard remain DEV markers; after wake existing sprite contains scarf/pumpkin, no overlay.

## Test strategy
Keep baseline44, world28 and Task05 46 with original gameplay assertions. Narrow N01 extension pins only mountPhaser/contracts changed bytes against this base; original reveal exception stays. Test unauthorized upstream mutation rejection. New built-preview browser tests use visible controls only, no QA globals. Existing detailed frame/collision/cause/pause tests support reused runtime; do not label those as new preview coverage. Deploy smoke and CI remain separate gates. Screenshots/video and results bind to candidate SHA. No QA PASS self-awarded.
