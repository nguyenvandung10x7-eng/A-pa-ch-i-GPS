# Book of Dien Bien

Book of Dien Bien is a bilingual React/Vite web experience about Điện Biên with three equal, independently accessible entry experiences:

- **1954** — a cinematic time-overlap at A1 Hill that can continue into the existing Time Train GPS task.
- **NHỊP BẢN PHIÊNG LƠI** — a dependency-free 2D culture game that can continue into the existing Phiêng Lơi GPS task.
- **BOOK** — a literary, memory-led book experience with chapters, pages, audio, saved/read state, nearby places, and optional real-world continuations.

The existing **CHALLENGE** system remains the shared GPS/action service behind these experiences, with its progress, levels, points, history, moderation/admin tooling and location verification unchanged. There is no top-level unlock sequence between 1954, Phiêng Lơi and Book.

## Product structure

- `/` — lightweight Experiences Hub with all three entry cards visible at once.
- `/1954` — “Where Times Overlap · 1954”.
- `/phieng-loi` — “Nhịp bản Phiêng Lơi” 2D prototype.
- `/book` — Book contents, directly accessible with no top-level gate.
- `/journey/1954` — compatibility redirect to `/1954`.
- `/experiences` — compatibility redirect to `/`.
- `/book/chapter/:chapterId` — chapter entry.
- `/book/page/:pageId` — full literary page.
- `/recent` — recent Challenge/history activity.
- `/saved` — saved Book pages.
- `/nearby` — nearby Book locations.
- `/challenge` — public Challenge experience.
- `/privacy`, `/legal` — legal/safety pages.
- `/admin`, `/moderation` — staff surfaces.

The Experience Hub and the two interactive scenes are route-level lazy chunks. The existing application shell loads only for Book, Challenge and staff routes, so Supabase/Auth and the internal navigation do not block the opening hub. Book reading/saved state remains separate from Challenge progress.

## Where Times Overlap · 1954

The opening is a lazy-loaded hybrid scene. Two already-cleared present-day Điện Biên photographs provide the realistic valley and urban layers with restrained depth/parallax; the dependency-free WebGL layer renders only the 1954 A1 terrain, trenches, fortifications, cemetery horizon and an irregular temporal-overlap treatment. The camera begins at an approximately 20-metre artistic viewpoint with a short automatic drift and tightly limited pointer/touch or permission-gated device orientation. A 2.5D fallback preserves the same composition when WebGL is unavailable or the visitor selects the lighter mode.

Five seconds after the visitor starts the scene, the temporal boundary reveals the **Chuyến tàu thời gian** threshold. It always leads to the existing exact task `doi-a1-chuyen-tau-thoi-gian-1954`; the scene itself never requests GPS, writes Challenge history, awards points, or treats viewing/listening as task completion. Completing that route can hand the visitor into Book as a narrative continuation, but it is not an access gate. The original task coordinates, radius, external URL and persistence remain authoritative.

Audio uses separate HRTF `PannerNode` sources. Empty asset slots fail silently; the current audible layer is an explicitly labelled oscillator-based spatial calibration study rather than historical audio. See `docs/temporal-1954-assets.md` before adding any stem.

## Nhịp bản Phiêng Lơi

`/phieng-loi` is a self-contained, mobile-first Canvas 2D game with four visual zones, landscape touch controls, checkpoints, environmental hazards, impact feedback and five staged power-ups based on Điện Biên produce: Tìa Dình squash, Mường Ảng coffee, Điện Biên macadamia, Tủa Chùa Shan Tuyết tea and smoked buffalo. Each product has a distinct transformation, gameplay use, callout and synthesized sound motif. The route uses no game-engine or audio-file dependency, adapts particles/detail for constrained devices, and releases its animation/audio/input resources on unmount.

The optional GPS continuation links to the exact existing `ban-phieng-loi-mthen` task. It bypasses only the generic level menu when launched from this featured experience; GPS verification, task data and Challenge persistence remain authoritative.

## Book content

The canonical Book catalog lives in `src/data/bookCatalog.ts`. Literary copy is layered separately so editorial work does not mutate structural IDs, GPS, media, or Challenge links:

- `src/data/bookLiteraryCopy.ts`
- `src/data/bookLiteraryPageCopy.ts`
- `src/data/bookLiteraryMemoryForms.ts`
- `src/data/bookLiteraryMiddleForms.ts`

The published book currently contains 13 chapters. Chapter 13 intentionally breaks the quieter cadence of the preceding chapters with a short, present-tense, rebellious night-city form.

## Challenge content and persistence

Challenge defaults live in `src/data/tasks.json`. Browser-local task edits and progress use LocalStorage. Catalog migrations are designed to preserve existing user/admin customizations while filling canonical fields only where required.

Book state uses its own storage keys for read pages and saved pages. Challenge migrations and Book state are intentionally separate.

## Audio and media

Book chapter audio is mapped independently from Challenge/global gameplay audio. Book playback coordinates with other audio elements so starting one track pauses competing playback.

Static assets are served from `public/`. Images used in production should have confirmed permission/license/source before release; do not remove third-party watermarks to bypass rights requirements.

## Development

```bash
npm install
npm run dev
```

## Production verification

```bash
npm run verify
```

`npm run verify` audits public audio provenance, runs strict TypeScript checking, then creates the Vite production build. Netlify uses the same command so a deploy cannot pass while those checks fail.

Other useful commands:

```bash
npm run typecheck
npm run build
npm run lint
npm run preview
```

## Netlify

`netlify.toml` publishes `dist/` and redirects all SPA routes to `index.html` for React Router deep links.

Deploy previews are expected to pass on the exact pull-request head before merge.

## Packaging

```bash
npm run package
```

The packaging script creates a source archive while excluding generated dependencies, build output, and Git metadata.

## Privacy

Location is requested only for location-based Challenge/Book interactions that need it. Reading state, saved pages, Challenge overrides, and local progress are stored in the browser unless a specific connected service explicitly handles a feature.
