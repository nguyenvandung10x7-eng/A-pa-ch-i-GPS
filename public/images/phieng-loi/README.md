# Phiêng Lơi visual assets

These WebP files are project art generated for the Phiêng Lơi visual-direction
pass. HeeSun and HANU were derived from character reference boards supplied by the
project owner; the raw references are intentionally not committed.

- `village-world-v1.webp`: 1672×941 legacy visual-pass world plate.
- `village-world-v2.webp`: 1672×941 active, more spacious world plate mapped to
  a 2400×1350 logical world (over twice the previous playable area).
- `heesun-atlas-v1.webp`: 1536×1024 transparent 3×2 pose atlas.
- `hanu-atlas-v1.webp`: 1536×1024 transparent 3×2 pose atlas.
- `support-atlas-v1.webp`: 1776×888 transparent 4×2 pose atlas.
- `heesun-run-v2.webp`: 1536×1024 transparent 4×2 running cycle.
- `hanu-walk-v2.webp`: 1536×1024 transparent 4×2 phone-walk cycle.
- `player-run-v2.webp`: 1776×888 transparent 4×2 running cycle.
- `chief-talk-v2.webp`: 1776×888 transparent 4×2 Trưởng bản talk/reaction cycle.
- `feast-loop-v2.webp`: 1776×888 transparent 4×2 roadside-table toast/laugh cycle.
- `stream-loop-v2.webp`: 1776×888 transparent 4×2 adult stream-community cycle.
- `vuongme-dance-v1.webp`: 1776×888 transparent 4×2 VươngMe karaoke/dance cycle.
- `heesun-menu-v1.webp`, `hanu-menu-v1.webp`: transparent menu cutouts.

Runtime mapping and preload behavior live in
`src/experiences/phieng-loi/visualAssets.ts`. Do not replace a pose atlas with a
different grid without updating that manifest and the visual regression checks.
Animation sheets must contain true alpha: checkerboards, matte colors, guide lines,
and cell backgrounds must never be baked into the exported image.
