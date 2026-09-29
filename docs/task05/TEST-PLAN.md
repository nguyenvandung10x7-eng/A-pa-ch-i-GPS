# Task05 — separate test inventory and oracle notes

The 30 proposed N-groups are coverage groups, not an approved count of executable tests. This candidate defines **46 tests: 24 browser + 22 model**. No baseline assertions/counts are changed: 44 PL00/Tasks01–03 plus28Task04 remain separate and byte-identical. `report-task05-evidence.mjs` enforces46/46, zero failures/skips/flaky/retry,24AC IDs and every mapped check; it requires a clean committed SHA.

| Spec group | Checks |
|---|---|
| N01 | B01,B02 |
| N02 | M01,B16 |
| N03 | M02,M17,B08,B23,B24 |
| N04 | M03,B03,B15,B20 |
| N05 | M03,B03 |
| N06 | M04,M21,B01 |
| N07 | M05,M22 |
| N08 | M06 |
| N09 | M07,M10,M11 |
| N10 | M21 |
| N11 | M08,M09,B01,B02 |
| N12 | M13,B01,B02,B18 |
| N13 | M14,M19,B21 |
| N14 | B01,B08,B14,B23 |
| N15 | B04,B08,B09,B23 |
| N16 | B01,B05,B06,B24 |
| N17 | M15,M19,B01 |
| N18 | M16,M22,B01 |
| N19 | M09,M10,M11,B02,B07 |
| N20 | M19,B04,B05,B21,B23 |
| N21 | B06,B20,B21 |
| N22 | M17,M22 |
| N23 | M20,B09,B22 |
| N24 | M18,B10,B13 |
| N25 | B11,B22 |
| N26 | B13,B22 |
| N27 | B01,B02,B12,B19 |
| N28 | B14,report script + separate baseline results |
| N29 | M11,B07 |
| N30 | M12,M19,B22 |

Tests were expanded from the initial development inventory to cover all active phases for pause/teardown/reload, static contact faces, independent path samples, denied audio unlock and missing asset preload. These are Task05 additions, not changes to the accepted Task04 tests. B22 is one table-driven browser test spanning24 phase/action combinations; these iterations are not counted as24 separate tests.

Oracles: M06 solves closing speed720WU/s and contact distance24 directly; M21 samples paths against authored coordinates and derives post-clipping contact time independently. M03/B03 derive displacement from input/config/delta, not from MOVE output. M22 checks authored face coordinates and the following update. Model tests explicitly label synthetic deltas; they do not substitute for rendered browser E2Es. M12 sets an isolated active-clock fixture to59999/60000 because mandatory capture in this small yard prevents a legitimate60-second chase; it does not claim a60-second native pursuit. Pause/cooldown ownership is additionally checked across native phases.

B01/B02 run upstream through real UI and native actors, with trusted mouse/call events. B20 delivers trusted touch via browser protocol. B01 records all25 animation updates and all25 rendered frames. B04 checks native AudioContext currentTime across pause, and the real ended callback. The supplied WAV is unchanged; no fake-ended timer is used. B12 explicitly selects Canvas; B19 disables WebGL to exercise actual AUTO fallback. Pointer/render/timer assertions retain their stated tolerances.

Evidence limits: browser here is Chromium on Linux, not a physical phone. Portrait and hidden/pagehide are browser-driven tests. Visual/art quality and subjective audio/content review remain independent QA work. Pre-capture Player/HeeSun are labeled DEV proxies; final stand frame moves as an idle pose, not newly invented walk art. No assertion awards Book/clue/economy or whole production HS01 acceptance. F12 remains ACCEPTED_WITH_OWNER_WAIVER.

Development runs are separate from the final candidate run. One early manga wrapper intercepted clicks and was corrected without changing MangaViewer. The first full preflight had a duplicate Playwright trace-owner error in the fallback test, followed by a corrupted trace write; tracing remains enabled after removing the duplicate start/stop. A parallel preflight build collided in dist; final evidence suites run sequentially. No failed/skipped/flaky/retry from development is relabeled as final candidate success.

CI workflow includes a separate Task05 job/artifact, while preserving the existing44+28 job. A prepared workflow is not a CI result. No Task05 branch is pushed or PR created by this handoff. Independent QA verdict: PENDING.

The missing-asset test initially selected two identical error messages (engine and DEV toolbar). Its locator is now scoped to the PhaserHost error; the visible-error, disabled-Start and no-encounter assertions remain intact. This is a test locator correction, not a relaxed runtime/error requirement. Candidate verification is rerun after committing it.

M15 also guards shared active-clock continuity: the native delta before the animation/control gate advances cooldown but does not enter the drunk duration; an update crossing5000ms counts its remainder as normal active time with cleared input. This prevents phase boundaries from silently extending cooldown while keeping the drunk interval exactly5000ms. The correction is confined to the new Encounter; foundation and Task04 clocks remain unchanged.
