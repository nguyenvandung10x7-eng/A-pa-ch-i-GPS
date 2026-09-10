# Book of Dien Bien

Book of Dien Bien is a bilingual React/Vite web experience about Điện Biên built around two public surfaces:

- **BOOK** — a literary, memory-led book experience with chapters, pages, audio, saved/read state, nearby places, and optional real-world continuations.
- **CHALLENGE** — GPS-based discovery tasks with progress, points, history, moderation/admin tooling, and location verification.

The former standalone Experiences surface is retired; `/experiences` remains only as a compatibility redirect to `/challenge`.

## Product structure

- `/` — the single “Where Times Overlap · 1954” opening experience.
- `/journey/1954` — compatibility redirect to the same opening; it is not a second scene.
- `/book` — Book contents, unlocked only after the verified A1 Time Train GPS challenge.
- `/book/chapter/:chapterId` — chapter entry.
- `/book/page/:pageId` — full literary page.
- `/recent` — recent Challenge/history activity.
- `/saved` — saved Book pages.
- `/nearby` — nearby Book locations.
- `/challenge` — public Challenge experience.
- `/privacy`, `/legal` — legal/safety pages.
- `/admin`, `/moderation` — staff surfaces.

The public mobile shell keeps BOOK and CHALLENGE distinct. Book reading/saved state is stored separately from Challenge progress.

## Where Times Overlap · 1954

The opening is a lazy-loaded hybrid scene. Two already-cleared present-day Điện Biên photographs provide the realistic valley and urban layers with restrained depth/parallax; the dependency-free WebGL layer renders only the 1954 A1 terrain, trenches, fortifications, cemetery horizon and an irregular temporal-overlap treatment. The camera begins at an approximately 20-metre artistic viewpoint with a short automatic drift and tightly limited pointer/touch or permission-gated device orientation. A 2.5D fallback preserves the same composition when WebGL is unavailable or the visitor selects the lighter mode.

Five seconds after the visitor starts the scene, the temporal boundary reveals the **Chuyến tàu thời gian** threshold. It leads to the existing exact task `doi-a1-chuyen-tau-thoi-gian-1954`; the scene itself never requests GPS, writes Challenge history, awards points, or treats viewing/listening as task completion. The Book routes remain locked until the existing Challenge history contains a completed, GPS-verified run for that exact task. The original task coordinates, radius, external URL and persistence remain authoritative.

Audio uses separate HRTF `PannerNode` sources. Empty asset slots fail silently; the current audible layer is an explicitly labelled oscillator-based spatial calibration study rather than historical audio. See `docs/temporal-1954-assets.md` before adding any stem.

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
