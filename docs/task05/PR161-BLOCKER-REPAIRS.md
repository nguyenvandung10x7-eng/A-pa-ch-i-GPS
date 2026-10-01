# PR #161 — reveal replay / CI manifest repairs

Scope: two owner-requested blockers only. Gameplay, A01 configuration, assets,
24 Task05 AC and existing 44 + 28 + 46 counts are unchanged. Baseline 44 and
Task05 46 test sources/assertions are unchanged. Task04 N01's boundary guard
is adapted narrowly as described below; MOVE tests and 18 Task04 AC stay intact.
F12 remains `ACCEPTED_WITH_OWNER_WAIVER`. Independent QA is pending.

## Reveal first render

At `e0c096a56c18b159a51692c65aa2bb16e7efd910`, `play()` starts the
sprite animation between browser frames. Native `Sprite.preUpdate` adds the
next smoothed delta before native render. With delta 100 ms (above the 15/12
fps frame interval), it advances frame 1 to frame 2. `skipMissedFrames: false`
limits advances per update, but cannot ensure frame 1 was drawn before the
first update. The POST_RENDER probe records the actual frame and is correct;
adding a synthetic frame 1 to the probe would conceal a runtime defect.

Start the animation at native scene POST_UPDATE, after sprite updates and
before render. Frame 1 is then drawn before any animation update. Elapsed
animation time begins only when animation is playing. Cleanup removes the
deferred start callback on cancel/dispose. Assets, FPS, non-loop playback,
all-25-frame render assertion, aura fade and cleanup-before-complete remain.

Two separate browser regressions (`playwright.pr161.config.mjs`) cover 15/12
fps, replay with browser-native 100 ms updates, all 25 rendered frames,
single completion per run, cancel before first update, pause and unmount.
Browser clock control changes scheduling only; it never calls Phaser.step,
injects callbacks or changes the probe. Both fail on the old runtime with
visited `[1,2]`, rendered `[2]` at first draw, and pass after the fix.

Original baseline SHA-256 pins are retained. `pr161-reveal-repair.json`
records the exact old/new hash of the one authorized upstream runtime repair.
Reporter verifies that exception, its dependent N01 guard and every other pin. Manifest states
`baselineUnchanged: false`, `baselineIntegrityPassed: true`; it does not
describe the repaired upstream file as unchanged.

### Dependent N01 guard

Candidate 7143caa passed 44 baseline but failed Task04 N01 (27/28) because
its historical Task04-only scope guard rejects any non-world source change,
including the now-requested reveal repair. This is a scope-guard conflict,
not a MOVE runtime regression. Preserve that failed local evidence.

N01 still requires the four original baseline test files to equal c45f3b2d,
and still rejects every other upstream/legacy path. Its only new exception
is exactly `HeeSunReveal.ts`, with both original and repaired SHA-256 hard
pinned. No directory exclusion, collider/input/timing tolerance change, test
skip, count relaxation or legacy code import is introduced. Reporter retains
the original world test source hash and verifies the exact dependent test
repair hash separately. All acceptance evidence must be rerun on the final
candidate after this adjustment; 7143caa results are not reused as green evidence.

## Reporter identity and publication

- Local: record the clean checkout SHA/tree; do not claim CI.
- Push: checkout HEAD, event.after and GITHUB_SHA must agree; verify its tree.
- PR: checkout HEAD must equal event.pull_request.head.sha. GITHUB_SHA is the
  temporary merge commit. Fetch that exact object without changing checkout.
  Verify exactly two parents (event base/head), the locked base, head tree,
  merge tree and equality with the tested checkout tree. A different merge
  tree is untested and rejects publication.
- Record checkout and merge identity separately, plus run ID/attempt.
- Remove stale manifest before validation. Preserve all count, AC, integrity,
  clean-tree, zero fail/skip/retry/flaky and test error gates. Atomically
  publish manifest only after every assertion passes. Failure emits a clearly
  marked diagnostic `failure.json`, never an acceptance manifest.

Eight separate synthetic CLI reporter regressions exercise local/push/PR,
wrong push SHA, wrong PR HEAD, wrong parents, untested merge tree, and a
45/46 failure with a stale manifest. They are reporter checks, not gameplay
test evidence; they never replace the real 44 + 28 + 46 runs.

## Evidence paths and preserved failure

Verify PR run #36809825962 attempt 1 remains unchanged: baseline 43 pass /
1 replay fail; Task04 was not run after baseline failure; Task05 46 tests
passed but reporter failed SHA validation. Its pre-assertion manifest is not
acceptance evidence. No rerun is used to replace that history.

New workflow keeps three artifacts. `pl00-browser-evidence` additionally
contains `pr161-report/results.json` and `pr161-results` for two new reveal
regressions, separate from `pl00-report/results.json` (44). Task05 artifact
additionally contains `task05-reporter-regression.json` (8 synthetic checks),
separate from `task05-report/results.json` (46) and its accepted manifest.
Task04 results remain 28. No assertion/count/timeout is relaxed.

Run validation on the committed candidate, then independent QA at that SHA.
Do not merge or release on the basis of local results alone.
