# Where Times Overlap · 1954 — hybrid scene contract

The opening is a cinematic hybrid, not a full reconstruction of Điện Biên in 1954. Present-day Điện Biên stays photographic; only A1 Hill is rendered as historical WebGL geometry. The visible mismatch is intentional: a fragment of 1954 appears to break through the present.

The two photographs are representative Điện Biên material, not a claim that they form one exact panorama captured from the scene camera at A1. Their exact shipped derivatives and licences remain governed by `docs/asset-provenance.md`.

## Runtime image layers

| Layer | Runtime asset | Size | Use |
| --- | --- | ---: | --- |
| Present valley | `public/images/tasks/canh-dong-muong-thanh-cat-banh.webp` | 174,576 bytes | Wide valley/mountain base with the slowest parallax. |
| Present city | `public/images/tasks/quang-truong-7-5-mthen.webp` | 119,514 bytes | Masked urban layer with slightly stronger parallax. |

The combined present-day image payload is 294,090 bytes before transfer compression. Both binaries already ship elsewhere in the app, so this change adds no new media files or licensing dependency.

## Replaceable scene modules

`src/components/temporal3d/sceneGeometry.ts` exports these independent builders:

- `TerrainA11954`
- `CemeteryHorizon`
- `buildTemporalStaticGeometry`
- `buildTemporalEffectGeometry`

`TerrainA11954` concentrates geometry in the camera-visible near and middle zones: terrain, crater rims, trenches, sandbags, timber/metal silhouettes and a restrained tree set. The far zone is intentionally resolved with haze, fog, atmospheric perspective and irregular overlap sheets rather than detailed geometry. There are no polygonal present-day roads, houses or city blocks.

The overlap is not a circular portal. Multiple uneven vertical sheets, soft mist, sparse interference lines and slight photographic double exposure form an irregular boundary between the two periods.

## Historical review boundary

Before replacing blockout details, record whether each feature is:

1. supported by a cited map, photograph, archive or site survey;
2. a plausible but non-specific scenic detail; or
3. an artistic metaphor.

Do not add named graves, identifiable faces, biographies or specific structures without reviewable evidence. The overlap light is always an artistic memory metaphor, never a claimed 1954 phenomenon.

## Narrative and routing contract

1. `/` is the lightweight three-card Experiences Hub; `/1954` lazy-loads this module and waits for the visitor to enter.
2. The camera drifts gently for five seconds; looking around is deliberately limited.
3. The in-scene **Chuyến tàu thời gian** threshold routes to the existing exact Challenge task.
4. Book is independently available from the Hub; completing the exact Time Train task offers Book as a narrative handoff, never as an access unlock.
5. The scene never creates a completion record, changes GPS coordinates/radius, or replaces the existing external Time Train URL.

## Spatial audio slots

`src/services/temporalAudio.ts` exposes five slots:

| Slot | Intended direction | Default |
| --- | --- | --- |
| `intro` | non-looping entrance narration/sound | silent |
| `a1` | A1 terrain | silent |
| `radio` | overlap/railing edge | silent |
| `present` | road and houses | silent |
| `memorial` | cemetery horizon | silent |

The current oscillator layer is a low-volume calibration study with no samples or random noise. It exists only to verify HRTF direction changes. Disable it with `enableSpatialStudy: false` when reviewed stems are ready.

Every supplied public audio file must be checked for format, duration, loudness and rights, placed under `public/audio`, mapped by an auditable literal path, added to `docs/audio-provenance.md`, and accepted by `scripts/check-audio-provenance.mjs`. Do not ship radio, testimony, music or battlefield recordings until their public-use and redistribution basis is documented.

## Performance budget

- keep the renderer lazy-loaded;
- keep the photographic opening payload below 350 KB unless a reviewed replacement is approved;
- cap device pixel ratio and use a lower frame target on coarse-pointer/low-memory devices;
- render only camera-visible A1 detail; resolve distance with fog rather than geometry;
- prefer compressed GLB/textures, LOD and baked lighting;
- do not load optional stems before a user gesture;
- preserve the 2.5D fallback and reduced-motion behavior;
- delete WebGL buffers/programs and detach listeners when the module unmounts;
- verify the Netlify deploy preview on representative mobile widths and a real device before merge.
