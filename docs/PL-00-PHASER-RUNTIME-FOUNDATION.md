# PL-00 — PHASER_RUNTIME_FOUNDATION

Production implementation of the approved architecture. This document is not an
independent QA verdict. Task 01 stays BLOCKED until independent PL-00 QA passes.

## Base and scope

- Repository: nguyenvandung10x7-eng/A-pa-ch-i-GPS.
- Locked base: 30470c33c6b12224ab75eef1f9dc1ceda69c8d2f.
- Integration branch: remake/phieng-loi-v2.
- Task branch: task/pl-00-runtime-foundation. Do not merge before independent QA.
- Phaser 4.2.1; @playwright/test 1.63.0; existing dependency versions preserved.
- CI and Netlify use Node 22 (Vite requires at least 22.12 in that major).
- No gameplay, artwork, audio, physics, map, actors, or event-chain controller.

## Ownership and modules

React Router selects PhiengLoiV2Page. PhaserHost owns a DOM container and its
mount effect. mountPhaser owns one route session and its asynchronous disposal.
createGame owns Phaser configuration. BootScene and FoundationScene are native
Phaser scenes. React does not render game objects or update positions per frame.

The application retains its existing providers/hooks. The foundation does not
import or depend on them, does not require login, and has no backend integration.

The adapter imports the engine factory only after mount. Normal application
routes do not statically import Phaser. The dev harness and probe are excluded
from the production module graph through import.meta.env.DEV.

## Scene and asset contract

BootScene performs native preload, records errors, then starts FoundationScene.
There is no separate PreloadScene. The production manifest is empty. A required
file error prevents successful readiness. The foundation has no downstream scene.

Future artwork belongs under public/assets/phieng-loi-v2/. Asset paths are relative
to Vite BASE_URL, not the current route. Keys follow pl:v2:<block>:<name>.
Manifest order is explicit; neither loading completion order nor a filename sort
defines an animation. Native Phaser Loader and Texture Manager own loaded data.

The technical fixture URLs /__pl00_tests__/*.png are supplied by Playwright route
interception. They are not deployed assets. A manual harness without those test
responses can exercise the empty manifest and expected missing-file errors;
run the browser suite for controlled success and slow-response scenarios.

## Game configuration

- AUTO renderer, opaque background, 1280 x 720 logical viewport.
- FIT and CENTER_BOTH, antialias on, pixelArt false, target engine rate 60 fps.
- Parent DOM element is passed by ref; no global DOM ID.
- Native BootScene and FoundationScene only.
- No physics config or external plugins. noAudio true.
- No movement mapping; keyboard/gamepad disabled.
- Scoped viewport CSS: 100vh fallback, 100dvh, safe-area, letterbox and overflow.
- Fullscreen and orientation lock are not prerequisites.

Canvas can be forced only by the dev harness. Browser tests also exercise AUTO
with WebGL context creation unavailable; this is distinct from forcing CANVAS.

## Mount, pause and teardown

Each effect setup receives a session ID. An invalidated session cannot create
an engine after its dynamic import returns or send React a late notification.
Ordinary renders/callback identity changes do not remount. Keep StrictMode enabled.

New mounts wait for the previous disposal promise. destroy(true, false) is the
public teardown entry. Its DESTROY event fires before all native cleanup finishes,
so the barrier resolves in a microtask after that engine step. No private Phaser
method, extra RAF, clock or persistent Game singleton is used.

When a browser suspends frame delivery in the background, destruction can remain
pending until it delivers another frame. The host is already removed and the
session invalidated; a replacement cannot bypass the barrier.

Scene-owned cleanup listens to both SHUTDOWN and DESTROY. Game destruction does
not necessarily emit scene SHUTDOWN first. Cleanup removes its paired listener,
so scene restart does not accumulate DESTROY handlers. Shared textures are not
removed on scene restart. The entire Game owns its final global cache disposal.

Manual and hidden pause reasons are independent. Intent before ready is latched;
preload can still complete. The adapter uses Game.pause/resume. Phaser 4.2.1
TweenManager samples wall time: on resume the adapter temporarily preserves all
individual tween pause flags, calls the public TweenManager.tick while tweens are
paused, and restores their flags. It does not calculate elapsed time or run a loop.
Timer/tween continuity still requires the short/long-pause browser tests to pass.

Notifications are booting, ready, paused and error, with session ID and reasons.
The ready notification is emitted once per Game session, including across scene
restarts and resume. The handle's inspect().paused is the current pause state;
the harness shows the last notification separately, not as the live pause state.
React owns pause/resume commands. No global event bus or Scene in React state.

Only the teardown promise survives module replacement. No scene/game state is
restored through HMR. The adapter removes its own visibility/page listeners and
ResizeObserver, and never clears a shared emitter indiscriminately.

## Dev entry and instrumentation

- /phieng-loi: empty foundation.
- /phieng-loi?dev=foundation: dev-only harness.
- Controls: Mount, Unmount, Re-enter now, Restart scene, Pause, Resume, Rerender,
  Snapshot, fixture choice and renderer choice.
- Fixture/renderer selections apply to the next mount.
- Snapshot is explicit: no polling loop or React per-frame state update.
- Diagnostics belong to the harness instance; they are not a gameplay store.
- Counts cover resources registered by PL-00, not every internal Phaser/browser
  allocation. The probe additionally reads native scene object/tween counts.
- Re-entry invokes disposal and remounts without awaiting it, testing the barrier.
- Game disposal is also exercised while paused and loading.

## Verification

Run from the repository root:

1. npm ci
2. npm run verify:pl00
3. npm run typecheck
4. npm run build
5. npx playwright install --with-deps chromium
6. npm run test:pl00
7. npm run verify
8. git diff --check

The browser suite needs dist from step 4. It starts dedicated loopback Vite dev
and preview servers at ports 5173 and 4173; stop existing servers on those ports.
Server commands do not call verify or install browsers recursively.

verify:pl00 audits pins, strictness, route, CI wiring, empty production assets,
config and the transitive import graph from the new page. It never imports legacy
runtime modules. Old verifier files remain untouched but are not called by verify.

Browser reports: node_modules/.cache/pl00-report/results.json and
node_modules/.cache/pl00-report/html/. Screenshots/traces are under
node_modules/.cache/pl00-results/. CI uploads these as pl00-browser-evidence.
These generated files are ignored through the existing node_modules rule.

Browser tests cover empty/success/error/slow preload, cancelled factory import,
StrictMode, rerender, immediate re-entry, pause intent, short/long pause,
manual/hidden policy, 20 mount/unmount/restart cycles, ownership cleanup,
resize and pointer mapping, both renderer paths, production exclusion and routes.
Visibility dispatch and viewport resizing in Chromium are simulated tests, not
evidence of Android Chrome or iOS Safari on physical devices.

## Acceptance evidence checklist

Mark every item PASS, FAIL or NOT PROVEN against the exact submitted commit.

| ID | Evidence required |
| --- | --- |
| F01 | Exact pins, reproducible npm ci, no unrelated dependency version changes. |
| F02 | TypeScript strict and production build exits 0. |
| F03 | Cold-open/refresh in dev, production preview AND Netlify preview. |
| F04 | No login/gameplay data prerequisite; unrelated routes render. |
| F05 | StrictMode remains enabled and observed max live Game count is one. |
| F06 | Cancelled import/preload creates no late Game/ready/error callback. |
| F07 | One boot-to-foundation and ready notification per Game session. |
| F08 | Native fixture success/error/slow cases behave correctly. |
| F09 | Pause/resume, short/long timing and independent manual/hidden reasons. |
| F10 | At least 20 mount/unmount and scene restarts without accumulation. |
| F11 | Destroy barrier leaves no owned resources/callbacks from old sessions. |
| F12 | Layout/coordinates plus physical Android Chrome AND iOS Safari QA. |
| F13 | WebGL, explicit Canvas and AUTO fallback render correctly. |
| F14 | No physics world, audio context/asset or external plugin. |
| F15 | Production query cannot enable harness; dev modules absent from build. |
| F16 | Transitive remake import graph does not reach any legacy module. |
| F17 | New verification gate and browser tests execute successfully in CI. |
| F18 | Diff only contains allowed foundation/infrastructure files. |

Do not infer missing runtime/device/Netlify evidence from a passing static script.
Do not merge or start Task 01 until independent QA passes all required gates.

## Legacy boundary

No import, copy, adaptation or architecture reuse from the old Phiêng Lơi page,
src/experiences/phieng-loi/runtime.ts, worldLayout.ts, src/phieng-loi.css,
PR #148, extract/phieng-loi-*, the old open-world/closed-world branches or previews.
Existing legacy files and the Gameplay Bible/PL-HS-01 documents remain unchanged.
