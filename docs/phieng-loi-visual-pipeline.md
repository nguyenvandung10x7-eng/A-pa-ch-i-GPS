# Phiêng Lơi visual pipeline

## Direction lock

**BEAUTIFUL PLACE. STUPID PEOPLE.**

Phiêng Lơi uses a polished 2D stylized-cartoon direction: a detailed, warm and
recognizable Điện Biên village behind deliberately awkward adult characters.
The camera stays 3/4 and slightly top-down. The scene must remain readable in a
16:9 phone crop without looking like a web dashboard or a Canvas prototype.

The reference language is limited to high-level comedy readability and compact
staging. No commercial-game asset, pose, interface, typography, map, or layout is
copied.

## Runtime contract

- Gameplay state, saves, audio events and encounter logic stay in `gameEngine.ts`.
- `worldLayout.ts` is the spatial contract for the painted road, courtyard,
  garden route, bridge, terrain type, landmarks, chase navigation and depth
  occluders.
- `PhiengLoiVisualScene.tsx` is the only mounted world presentation.
- The 480×270 values are logical camera units, not a bitmap render resolution.
- The compositor uses one scalable world plate, transparent semantic-pose atlases
  and dedicated eight-frame movement atlases.
- Actor and camera transforms are written directly on every animation frame;
  React only refreshes lightweight HUD state at a lower cadence. This keeps input,
  camera and feet locked to the same frame without rerendering the page tree.
- CSS provides contact shadows, idle motion and presentation effects; movement is
  an actual frame sequence rather than a static cutout being bobbed up and down.
- Background crops at authored depths let the bridge rail, lower foliage and
  foreground rocks pass in front of characters without duplicating gameplay
  state. House silhouettes stay in the base plate until true-alpha foreground
  exports exist; rectangular house crops are not accepted because they can erase
  actors standing in open ground.
- Canvas primitive drawing is not a runtime fallback.
- Missing art must receive a named asset slot; it must not silently fall back to a
  rectangle, ellipse, stick figure or icon.

## Asset slots

All runtime URLs live in `visualAssets.ts`.

| Asset | Grid | Use |
| --- | ---: | --- |
| `village-world-v1.webp` | full plate | Mountains, stilt houses, fields, road, stream, fences, waterwheel and environmental depth. |
| `heesun-atlas-v1.webp` | 3×2 | Idle, smile, point, bựa, chase and triumphant poses. |
| `hanu-atlas-v1.webp` | 3×2 | Phone idle, phone walk, call, confused, distracted and accidental-chaos poses. |
| `support-atlas-v1.webp` | 4×2 | Player idle, chicken, dog and buffalo placeholders. |
| `heesun-run-v2.webp` | 4×2 | Eight-frame HeeSun chase cycle. |
| `hanu-walk-v2.webp` | 4×2 | Eight-frame HANU phone-walk cycle. |
| `player-run-v2.webp` | 4×2 | Eight-frame player run cycle. |
| `chief-talk-v2.webp` | 4×2 | Trưởng bản idle, talk and reaction cycle. |
| `feast-loop-v2.webp` | 4×2 | Five-man roadside-table toast and laugh cycle. |
| `stream-loop-v2.webp` | 4×2 | Four-adult stream-community idle and reaction cycle. |
| `vuongme-dance-v1.webp` | 4×2 | VươngMe karaoke/dance cycle, staged as a rare visual response to PHÀ ƠI. |
| `heesun-menu-v1.webp` | cutout | Waiting-menu left character. |
| `hanu-menu-v1.webp` | cutout | Waiting-menu right character. |

Atlases use regular cells and transparent alpha. Keep every pose inside its cell.
When replacing an atlas, preserve its grid and filename or version the filename and
update the centralized slot.

The current background is a painted plate, so `worldLayout.ts` must be updated in
the same change whenever a road, bridge, stream or major prop moves. Old saves are
projected onto the nearest valid route instead of placing the player over scenery.

## Character locks

- HeeSun: recognizable adult face, tight short curls against the scalp, about 30%
  slimmer than the earlier chubby board, gentle but suspicious smile, never cute.
- HANU: recognizable adult face, about 30% heavier than the earlier board, white
  tank top, black shorts, sandals, smartphone visible in every pose, permanently
  distracted.
- Player: smaller, quieter palette and simpler face than both named characters.

Owner-supplied reference boards guide likeness only. Raw photographs are not
bundled. Future replacements must remain original, fictionalized game art and
must not introduce commercial IP.

## UI composition

- Top left: compact wooden location badge.
- Top center: one short paper objective.
- Top right: Book and pause.
- Center: uninterrupted world and character staging.
- Bottom left: one large joystick.
- Bottom right: one dominant PHÀ ƠI! action.

Messages use a single comic-paper bubble. Temporary encounter/status data is kept
small and disappears when inactive.

## Supporting cast checkpoint

Trưởng bản, the roadside-table group and the adult stream group no longer reuse
single support-atlas poses. Each has a dedicated eight-frame transparent cutout
cycle. VươngMe is a dedicated animated visual guest: every fifth existing PHÀ ƠI
call can stage his short karaoke entrance without adding a new quest, save field or
event state machine. This keeps the current gameplay harness intact while testing
the shared animation/compositing language.

## Next art tasks

The current world is a single plate with conservative cropped depth occluders. A later art-only
pass may replace those crops with authored transparent far-mountain,
village-ground and foreground-foliage layers for stronger parallax without
changing simulation coordinates. OCOP props, gate/domino reactions, animals and
capture tableaux are still semantic poses, world-plate art, presentation effects
or text and are the next asset slots to illustrate.
