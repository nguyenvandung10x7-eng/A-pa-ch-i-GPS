# Task 02 — standalone HeeSun manga

Status: IMPLEMENTED / BLOCKED_BY_BROWSER_EVIDENCE. Not a QA PASS.
Base: cd2d09e3ad083eaee9e18edb44df49b58b2c9768.
Branch: task/pl-hs-02-manga. No merge or deployment authorized here.

## Source reconciliation before implementation
- PL-HS-01 v0.7 sections 9/12/13/15: manga after reveal, before chase; AST-MANGA-HS AVAILABLE; no duplicate request on pause; first-view SKIP ALL unresolved.
- Gameplay Bible v0.5 sections 11/17 K11/18: presentation only, no invented dialogue, no premature clue reveal.
- Pack v0.7 has 36 entries and 29 PNGs (25 reveal + 4 aura), no manga. Included block spec matches supplied spec byte-for-byte.
- Block Master BLOCK_MASTER row 3 is updated to v0.7. ASSET_STATUS row 8 marks AST-MANGA-HS READY but provides no path/order. Legacy F12 blockers in this row/pack are superseded by owner waiver and completed integration; this task does not reclassify device tests PASS.
- Repo docs/pr148-extraction.md explicitly records the three manga filenames in order. This historical asset mapping fills the path/order gap only; obsolete capture narrative in that same document is NOT adopted.
- Retrieved the three exact named original images and visually inspected them. No crop, rewrite, new dialogue or generated replacement. Raw bytes and SHA256 are recorded in manga/assets/provenance.json.

## Asset order
1. ChatGPT Image 10_20_02 11 thg 9, 2026.png
2. ChatGPT Image 10_54_09 11 thg 9, 2026.png
3. ChatGPT Image 11_00_04 11 thg 9, 2026.png

## Scope and implementation
- DEV entry: /phieng-loi?dev=hs-manga.
- React presentation viewer, independent of simulation and Phaser scene. No running game behind this isolated harness. Future simulation-pause ownership remains a separate integration task.
- Previous/next, close at loaded final frame, reopen at first frame. Loaded-page guard and synchronous navigation lock prevent rapid double-click from skipping a page.
- Manual and document-hidden pause reasons combine; resume cannot override hidden-document pause.
- Per-run completion is manga_complete. Render removes viewer before useEffect emits; ref guards StrictMode duplicate effects. Cancel/unmount does not complete.
- Visibility listener removed on unmount. No timers, tweens, audio, story flags or persistence.
- Only development entry imports source PNGs. Vite production tree-shakes viewer, harness and images.
- No SKIP ALL control in this test harness is a final first-view policy decision.
- No reveal_complete link, trigger, chase, capture, Book unlock/replay or clue block.
- PL-00/Task 01 runtime unchanged. Existing transitive verifier extended narrowly for manga module and its PNG imports. CI push branch added to run existing full suite including new tests.

## Validation and limits
- npm run verify: PASS (audio provenance, foundation boundary, reveal byte hashes, TypeScript, production build).
- git diff --check: PASS.
- Browser tests authored: ordering/back/reopen/one completion, pause/visibility/cancel/route cleanup, emulated touch/resize, failed image recovery, production exclusion.
- Local browser execution BLOCKED: no Chromium executable; both normal and headless Playwright downloads returned invalid ZIPs. Test runner reports two launch failures, three not run. These are NOT application assertions passing or failing.
- No Task 02 runtime screenshots/video available. Do not reuse Task 01 imagery as evidence.
- Git push preflight failed: local HTTPS Git credentials unavailable. Commit is local; no remote CI result is claimed.
- QA must run npm ci, npx playwright install --with-deps chromium, npm run verify, npm run test:pl00. New tests save frame-01/02/03 and cleanup screenshots. Inspect actual layout and runtime before approving.
- PL-00/Task 01 F12 remains ACCEPTED_WITH_OWNER_WAIVER; real Android and untested iPhone items WAIVED_BY_OWNER / NOT TESTED. No fresh device evidence here.
