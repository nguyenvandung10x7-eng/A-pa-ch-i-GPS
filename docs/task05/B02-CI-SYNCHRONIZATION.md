# Task05 B02 — browser test synchronization

Owner authorization: 30 September 2026. Change only B02 setup/synchronization;
keep gameplay, A01, 24 AC and the 44 + 28 baseline unchanged. The Task05 suite
remains 46 tests (24 browser + 22 model); the evidence reporter is unchanged.

## Preserved failure

Verify [36663939688, attempt 1](https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/actions/runs/36663939688)
at `40d04936fc9d292d46f60bd6e5999cf4f3238b78` failed B02 (45 passed, 1 failed).
Artifact `11076236816` and independent QA's extracted trace/state remain the
record of that failure. They are not rerun, replaced or relabelled.

The distance poll observed 95.2208 WU in CHASE. Contact captured at
491.666667 active ms; the trusted click arrived at 518.31 active ms and was
correctly rejected in CAPTURE_HOLD. The test had no synchronization between
the sample and input delivery. No runtime capture-priority defect was shown.

## Test-only correction

B02 installs Playwright's browser clock before navigation. Reveal and manga
still run through their real UI. After the last manga image is ready, while
the manga owns the engine pause and before handoff, B02 holds the browser clock.
It completes manga through its real button, then advances the existing Phaser
update loop in 16 ms browser-clock steps until the original actors enter the
approved 96 WU calling range. This is controlled browser time, not a claim of
uncontrolled wall-clock scheduling during setup.

The original RNG 0.8, entry positions (240,150)/(500,150), balance 10, speed,
colliders, line-of-sight rules and runtime are unchanged. The test asserts
CHASE, no pause, no capture, equal y=150 on the open lane, and distance >24 and
<=96 WU. Holding browser time prevents actionability/IPC delays from advancing
the pursuit while the real Playwright locator click is delivered. No DOM
dispatch, forced click, synthetic advance, injected handoff/capture, private
runtime mutation or changed expected cause is used.

A deliberate 250 ms wall-time wait before clicking exceeds the at-most 150 ms
contact window on this horizontal lane (96 minus 24 WU, divided by 480 WU/s).
The unchanged-position/active-time assertions prove this delay cannot spend
the calling opportunity while the browser clock is held.

Before releasing the clock, B02 records the ready and accepted snapshots and
requires one normal `call_accepted`, `trusted=true`, CHASE, unchanged actor
positions/active time and zero capture. After releasing it, native updates
consume the queued call and continue the full capture/audio/wake/stand/drunk/
recovery path. The real AudioContext/ended callback is never mocked or timed
out to success.

Original final assertions, including `cause=phao_heesun`, remain. Added checks
require accepted-call sequence before the single capture, a native unblocked
trajectory in range without t=0 contact, and exactly one native audio end,
wake commit, recovery and completion. There must be no rejected call.

## Other gates and evidence

M08 (simultaneous sources/contact priority and a later rejected call after
capture), M09 (earlier call before future contact), the other 44 Task05 tests,
all 72 baseline tests, assets, runtime, workflow and report assertions are
unchanged. The late-call CI trace is retained separately and is not counted
as evidence for a successful call E2E.

This change creates a new descendant SHA; the original four commits remain.
Final local results, GitHub Verify/artifact identity and recovery hashes belong
in the handoff for that SHA. Local runs do not constitute CI or independent QA.
H01 remains CLOSED / FIX VERIFIED. F12 remains ACCEPTED_WITH_OWNER_WAIVER.
No PR, merge, release or downstream change is authorized by this fix.
