# Phiêng Lơi visual assets

These WebP files are project art generated for the Phiêng Lơi visual-direction
pass. HeeSun and HANU were derived from character reference boards supplied by the
project owner; the raw references are intentionally not committed.

- `village-world-v1.webp`: 1672×941 opaque world plate.
- `heesun-atlas-v1.webp`: 1536×1024 transparent 3×2 pose atlas.
- `hanu-atlas-v1.webp`: 1536×1024 transparent 3×2 pose atlas.
- `support-atlas-v1.webp`: 1776×888 transparent 4×2 pose atlas.
- `heesun-menu-v1.webp`, `hanu-menu-v1.webp`: transparent menu cutouts.

Runtime mapping and preload behavior live in
`src/experiences/phieng-loi/visualAssets.ts`. Do not replace a pose atlas with a
different grid without updating that manifest and the visual regression checks.
