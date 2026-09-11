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
- `hanu-food-box-v1.svg`: transparent project-authored cutout shown only while
  HANU's delivery state carries the player's food.
- `player-motion-atlas-v1.webp`: 1324×1188 transparent 4×4 Player sample
  approved from composition B. Rows are idle, grounded walk, run, then dedicated
  start/turn/stop/PHÀ ƠI poses. All cells share a 331×297 foot-anchored frame;
  the source checker matte was converted to true alpha before WebP export.
- `chief-talk-v2.webp`: 1776×888 transparent 4×2 Trưởng bản talk/reaction cycle.
- `feast-loop-v2.webp`: 1776×888 transparent 4×2 roadside-table toast/laugh cycle.
- `stream-loop-v2.webp`: 1776×888 transparent 4×2 adult stream-community cycle.
- `actor-action-atlas-v1.webp`: 888×444 transparent 4×2 action atlas with
  dedicated Player/HeeSun seated feast poses, HeeSun brake/recoil and Player
  shout/brake poses. Generated for this project from its existing approved
  character atlases; chroma was removed into true alpha during export.
- `feast-action-atlas-v1.webp`: 888×444 transparent 4×2 choreography atlas:
  abandoned table, collective stare/rise, and a separated four-person chase
  cycle. Generated for this project from the approved feast atlas.
- `stream-action-atlas-v1.webp`: 888×444 transparent 4×2 run/dance atlas for
  the same four adult stream characters, used to leave the stream visibly and
  join VuongMe's disco without moving the painted water/rocks.
- `vuongme-dance-v1.webp`: 1776×888 transparent 4×2 VươngMe karaoke/dance cycle.
- `heesun-wife-atlas-v1.webp`: 1536×1024 transparent 4×2 original fictional
  HeeSun-wife entrance/command/exit pose atlas.
- `dien-bien-victory-monument-v1.webp`: 640×430 transparent, original stylized
  distant silhouette inspired by the recognizable Victory Monument form.
- `dien-bien-victory-museum-v1.webp`: 720×337 transparent, original stylized
  distant silhouette inspired by the recognizable circular Victory Museum form.
- `heesun-menu-v1.webp`, `hanu-menu-v1.webp`: transparent menu cutouts.

Runtime mapping and preload behavior live in
`src/experiences/phieng-loi/visualAssets.ts`. Do not replace a pose atlas with a
different grid without updating that manifest and the visual regression checks.
Animation sheets must contain true alpha: checkerboards, matte colors, guide lines,
and cell backgrounds must never be baked into the exported image.
