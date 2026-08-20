# Book of Dien Bien

Book of Dien Bien is a bilingual React/Vite web experience about Điện Biên built around two public surfaces:

- **BOOK** — a literary, memory-led digital book with chapters, pages, audio, saved/read state, nearby places, and optional real-world continuations.
- **CHALLENGE** — GPS-based discovery tasks with progress, points, history, moderation/admin tooling, and location verification.

The former standalone Experiences surface is retired; `/experiences` remains only as a compatibility redirect to `/challenge`.

## Product structure

- `/book` — Book contents.
- `/book/chapter/:chapterId` — chapter entry.
- `/book/page/:pageId` — full literary page.
- `/recent` — recent Challenge/history activity.
- `/saved` — saved Book pages.
- `/nearby` — nearby Book locations.
- `/challenge` — public Challenge experience.
- `/privacy`, `/legal` — legal/safety pages.
- `/admin`, `/moderation` — staff surfaces.

The public mobile shell keeps BOOK and CHALLENGE distinct. Book reading/saved state is stored separately from Challenge progress.

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

`npm run verify` runs strict TypeScript checking first, then the Vite production build. Netlify uses the same command so a deploy cannot pass while TypeScript errors remain.

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
