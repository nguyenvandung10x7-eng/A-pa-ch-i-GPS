# Player `alien_shorts` side walk v1

This study contains the final eight-phase, right-facing side-walk cycle for Player's `alien_shorts` variant. The runtime mirrors the same atlas for left-facing movement.

## Phase order

| Cell | Phase | Source frame |
|---:|---|---|
| 0 | Contact A | `frames/f0-contact-a.png` |
| 1 | Down A | `frames/f1-down-a.png` |
| 2 | Passing A→B | `frames/f2-passing-a-to-b.png` |
| 3 | Up A→B | `frames/f3-up-a-to-b.png` |
| 4 | Contact B | `frames/f4-contact-b.png` |
| 5 | Down B | `frames/f5-down-b.png` |
| 6 | Passing B→A | `frames/f6-passing-b-to-a.png` |
| 7 | Up B→A | `frames/f7-up-b-to-a.png` |

The production asset is the exact-transparent lossless RGBA WebP atlas at `public/images/phieng-loi/player-alien-shorts-walk-side-v1.webp`. It is a row-major 4×2 grid of 384×341 cells (1536×682 total), encoded with lossless and exact-transparent-RGB flags. Its SHA-256 is `f31bf1849228fdb19b0342b5985827522821ba589609b4da833e4ac5bbee060d`.

## Locked inputs

- Identity source: `player-idle-isometric-study-v3-side.png`, 574×1197 RGBA, SHA-256 `7e3cc883dd96a6a6574f47fc8d00fe1faa0557ad575b7fe44ce6a63b3b88c62b`.
- Geometry bundle: `alien-shorts-walk-side-geometry-v3-bundle.zip`, SHA-256 `555caf5a36cb8df985eec2dfe4a93af1cddb9f74c0e6e659a1f50c42d6b30287`.
- Calibration retained here: `geometry-calibration-v3.json`, SHA-256 `019fcd448d62f1dbc18b1d1559f056e4b939ae45583651d319635f7236feb540` (the external source path was reduced to its basename before commit).
- Repository base: `a5696d6f423e1dd9313b44b2dc2477ce04944227`.

The generated frames preserve the supplied character identity, light-blue shirt, multicolor alien shorts with drawstring, black sandals, and the existing 2D isometric rendering style. Transparent RGB is zeroed and retained exactly through WebP decoding; the runtime contact shadow remains the existing independent 24×6 CSS layer.

## Runtime contract

- QA selector: `/phieng-loi?playerMode=alien_shorts`.
- Scope: the dedicated atlas replaces only `walk + side` for this variant. Default Player rendering and all non-side-walk states keep their existing assets.
- Sprite anchor and transform origin: 50% / 92%.
- Render width: 108 world pixels; depth scale remains `0.88 + y / 1350 × 0.2`.
- Distance cadence: 54-world-pixel walk stride, 6.75 world pixels per phase. At the diagnostic analog speed of 43 px/s, a phase holds 0.15698 s and the cycle lasts 1.25581 s.
- Frame selection stays distance-driven through the existing `framePhase`, including F7→F0 wrap and reduced-motion fallback to F0.

## QA evidence

- `qa/static-contact-sheet.png`: all normalized frames at asset scale.
- `qa/geometry-overlay.png`: retained v3 skeleton, foot geometry, ground line, and anchor overlay.
- `qa/gameplay-scale-samples.png`: all phases at the real 108 px render width and sampled depth.
- `alien-shorts-walk-side-gameplay-preview.mp4`: 640×360, H.264/yuv420p, 60 fps, three right-facing and three mirrored left-facing cycles on the production world crop.
- `qa/qa-report.json`: exact hashes, measurements, thresholds, and loop-closure result.

Run `node scripts/render-phieng-loi-alien-shorts-geometry.mjs` to regenerate the vector overlay source from the retained frames and geometry. Run `npm run verify:phieng-loi:player` to verify runtime selection, cell mapping, mirroring, wraparound, dimensions, alpha-capable lossless WebP encoding, atlas hash, and unchanged default behavior.

The atlas remains `UNVERIFIED` for public release until the supplied portrait source and depicted person's likeness consent are confirmed; see `docs/asset-provenance.md`.
