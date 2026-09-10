# Where Times Overlap · 1954 — asset contract

The opening scene is an artistic blockout, not a claim of exact historic reconstruction. Its current geometry establishes composition, interaction and performance boundaries so reviewed GLB terrain, compressed textures or photogrammetry can replace individual modules later.

## Replaceable scene modules

`src/components/temporal3d/sceneGeometry.ts` exports these independent builders:

- `TerrainA11954`
- `CurrentRoad`
- `CurrentHouses`
- `CemeteryHorizon`
- `TemporalAurora`
- `TemporalMist`

The present-day road blockout uses the user-supplied Google Street View link only as visual reference for slope, concrete, low wall, dark railing, vegetation and roadside structures. No Google imagery is downloaded, hotlinked or shipped as a runtime texture.

## Historical review boundary

Before replacing blockout details, record whether each feature is:

1. supported by a cited map, photograph, archive or site survey;
2. a plausible but non-specific scenic detail; or
3. an artistic metaphor.

Do not add named graves, identifiable faces, biographies or specific structures without reviewable evidence. Aurora is always an artistic memory metaphor, never a claimed 1954 phenomenon.

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
- cap device pixel ratio and use a lower frame target on coarse-pointer devices;
- prefer compressed GLB/textures, LOD and baked lighting;
- do not load optional stems before a user gesture;
- preserve the 2.5D fallback and reduced-motion behavior;
- verify the Netlify deploy preview on representative mobile widths and a real device before merge.
