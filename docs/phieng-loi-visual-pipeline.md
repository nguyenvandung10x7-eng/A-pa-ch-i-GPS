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

- Gameplay state, collision, saves, audio events and encounter logic stay in
  `gameEngine.ts`.
- `PhiengLoiVisualScene.tsx` is the only mounted world presentation.
- The 480×270 values are logical camera units, not a bitmap render resolution.
- The compositor uses one scalable world plate plus transparent pose atlases.
- CSS transforms provide depth ordering, camera movement, flip, squash/stretch,
  bob, anticipation and reaction motion.
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
| `support-atlas-v1.webp` | 4×2 | Player idle/run, chicken, dog, buffalo, chief, feast group and stream group. |
| `heesun-menu-v1.webp` | cutout | Waiting-menu left character. |
| `hanu-menu-v1.webp` | cutout | Waiting-menu right character. |

Atlases use regular cells and transparent alpha. Keep every pose inside its cell.
When replacing an atlas, preserve its grid and filename or version the filename and
update the centralized slot.

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

## Next art tasks

The current world is a single plate. A later art-only pass may split it into
far-mountain, village-ground and foreground-foliage layers for stronger parallax
without changing simulation coordinates. OCOP props, gate/domino reactions and
capture tableaux are still represented by the world plate, support atlas, CSS
effects or text and are the next asset slots to illustrate.

