# Task 04 — QA-04-001 correction / independent QA PENDING

27/09/2026. Parent candidate: 1c9c039f081b13fc9dd482b87fd35f55547536a0 (independent QA FAIL / NEEDS_FIX). Integration base: c45f3b2d860db1f92efc038d0a94532f818f0f69. Branch: task/pl-world-04-move-rebuild. F12 ACCEPTED_WITH_OWNER_WAIVER.

C01–C07 / T04-DEV-WM-CFG-P01 are APPROVED by the opening record dated 27/09 in APPROVED-CONFIG. PROPOSED labels in the historical snapshot do not reopen approval. Original 18 AC and all 44 baseline test sources remain unchanged.

## Defect and numerical contract

The independent QA input uses valid delta 1000 ms, start (181.6552741508931,177.56106850225478), joystick (117.73380093449262,680.0579693344913). Old sweep evaluates the contact as x=93.99999999999999 at the exact left plane x=94. Old controller accepts this result, then strict legal() rejects its own output on the next update.

The correction recovers the exact coordinate of a crossed geometry plane ONLY when its segment parameter agrees with the selected common fraction to floating-point precision (8 machine epsilons, relative to the parameter scale), and the coordinate correction is at most the approved 1e-6 WU. Entry, exit and endpoint planes are considered so corner grazing and endpoint contacts share the same rule. No global coordinate rounding, widened legal region, geometry change, residual motion, axis slide or arbitrary clamp of invalid positions is introduced. Both displacement components still use one earliest fraction; corrections only represent the same mathematical contact.

legal() remains strict for config, starting position, and runtime. WorldController also validates the resolved result before publishing it to the actor. Genuine invalid positions still enter ERROR, without teleporting the actor to a valid point. The C07 tolerance bounds numerical contact representation; it is not a gameplay corridor expansion or a permission to accept invalid spawn/config.

## New regression and evidence

- N23: exact independent-QA input through controller, next native-style Scene update; 100 held diagonal updates without sliding/drift; tangent and away. The new ACTIVE assertion fails on the old source and passes after correction.
- N24: 16 cases covering all four bounds faces, four obstacle faces, four bounds corners and four obstacle corners. Each runs contact → next update → 25 held updates → tangent → away. Independent oracle splits at geometry crossings and classifies open intervals; it never imports sweep or uses its fraction/end as expected.
- N25: nine invalid/non-finite positions, including penetration beyond 1e-6 WU on every face. Public injection rejects them, and a separate explicit white-box state fault checks next-update runtime rejection. No production bypass added.
- N26: browser on real Phaser actor/Scene, exact synthetic QA precondition followed by native updates and trusted pointer gestures; separate pointer-only approach to a bound. Synthetic preconditions are identified as such and do not replace native input evidence.

N23–N25 use controlled Scene/DOM stubs from the independent QA technique, not a native-browser or physical-device claim. They run as three distinct Playwright test objects, with JSON evidence attachments. N26 is a fourth new browser test. Total: 26 scenario IDs / 28 Task04 tests. Baseline stays 44 (foundation16/reveal7/manga5/integration16). Exact count, one-result/pass/no-retry gates remain in report-task04-evidence.mjs, with top-level report errors checked too.

## N18 / AC13 evidence gap

Route exit now uses the same disposed() assertions via a retained read-only snapshot closure: all foundation counters zero; all historical controllers DISPOSED with zero owned objects/DOM listeners/Scene bindings and null actor; created=destroyed, maxLive<=1, no completion/chase/capture, invalidation preceding disposal, and no canvas. BOOTING gets the same resource checks and still waits for the delayed real import and disposed runtime. ACTIVE/PAUSED also deliver a captured old callback and resize/pageshow/pointer events after route teardown; position/update/event ledger must not change, and stale delivery must be rejected. API removal remains asserted. This closes a coverage gap, not a claim that QA found a second runtime defect. Existing nine state/mode combinations, assertions and 90s timeout remain.

## Handoff constraints

Run verify (including typecheck/build), baseline44 and the full Task04 suite again at the new commit. Preserve old-candidate failure evidence separately. Report exact counts/failed/skipped/flaky/retries, execution environment, SHA/tree and CI separately. CI must run both test:pl00 and test:world on the new SHA; when authenticated Git push is unavailable, state BLOCKED_BY_CI and provide a verified recovery bundle instead. No QA PASS is self-assigned.

No HS-01 changes, art, chase consumer, PHÀ ƠI, economy, OCOP, save or Book; no PR, merge or release.
