# Book of Dien Bien

Book of Dien Bien is a bilingual React/Vite narrative journey about Điện Biên:

- **1954** opens the book with the independent “Where Times Overlap” 3D/audio scene. An on-site GPS stamp at A1 is awarded only after the visitor opens and confirms the separate Time Train experience.
- **Life Beneath the Hills** is the next cultural chapter. Its on-site Phiêng Lơi GPS stamp opens the complete Book and atlas.
- **BOOK** then becomes non-linear: all remaining literary chapters, saved/read state, nearby places, and four curated field invitations are available.

Guilds and the public leaderboard are absent from the new journey. Their old URLs remain compatibility redirects.

## Product structure

- `/`, `/journey/1954` — 1954 and Where Times Overlap.
- `/journey/culture` — Life Beneath the Hills and the Phiêng Lơi checkpoint.
- `/book` — unlocked Book contents.
- `/book/chapter/:chapterId` — chapter entry.
- `/book/page/:pageId` — full literary page.
- `/recent` — compatibility redirect to the Book.
- `/saved` — saved Book pages.
- `/nearby` — nearby Book locations.
- `/challenge` — public Challenge experience.
- `/privacy`, `/legal` — legal/safety pages.
- `/admin`, `/moderation` — staff surfaces.

The public shell presents one sequence: Journey → Book → Explore. The map is a switch inside Explore. Book reading/saved state, legacy Challenge progress, and the new journey stamps use separate storage namespaces.

## Book content

The canonical Book catalog lives in `src/data/bookCatalog.ts`. Literary copy is layered separately so editorial work does not mutate structural IDs, GPS, media, or Challenge links:

- `src/data/bookLiteraryCopy.ts`
- `src/data/bookLiteraryPageCopy.ts`
- `src/data/bookLiteraryMemoryForms.ts`
- `src/data/bookLiteraryMiddleForms.ts`

The published catalog contains 13 existing chapters. The 1954 catalog entry is rendered as the opening journey chapter; after Phiêng Lơi, the other chapters open together. Chapter 13 intentionally breaks the quieter cadence with a short, present-tense, rebellious night-city form.

## Challenge content and persistence

Challenge defaults live in `src/data/tasks.json`. Browser-local task edits and progress use LocalStorage. Catalog migrations preserve existing user/admin customizations while filling canonical fields only where required.

Journey state uses `book-of-dien-bien-journey-v1`. It stores timestamps and completion source, never coordinates or a route. Existing GPS-verified completions of the exact A1 and Phiêng Lơi task IDs are recognized without rewriting legacy Challenge history. Unrelated points, pages, tasks, or an old Level 1 unlock never bypass the journey.

## Audio and media

Book chapter audio is mapped independently from the procedural spatial-audio study in Where Times Overlap. The study is original synthesized ambience and is explicitly labelled as a prototype; rights-cleared historical/radio/user stems must pass the existing provenance audit before being added.

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

For review without spoofing GPS, only localhost and Netlify deploy-preview hosts accept `?journeyPreview=culture` or `?journeyPreview=book`. The preview state is visibly labelled, lasts only for that browser tab, writes no journey completion, and is ignored by production hosts. Use `?journeyPreview=off` to clear it.

## Packaging

```bash
npm run package
```

The packaging script creates a source archive while excluding generated dependencies, build output, and Git metadata.

## Privacy

Location is requested only after the visitor explicitly confirms an on-site checkpoint. Coordinates and routes are not stored. Reading state, saved pages, journey stamps, Challenge overrides, and local progress stay in the browser unless a specific connected service explicitly handles a feature.
