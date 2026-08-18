# Public content audit — 2026-08-18

This audit follows the first successful production smoke test of `a-pa-ch-i-gps.netlify.app`.

## Product model

The public product has two primary surfaces only:

1. **BOOK** — editorial, memory, reading, places and chapter context.
2. **CHALLENGE** — GPS/action tasks, including what older code called `Side Quest` or `Experiences`.

`Side Quest` is not a third product surface. The legacy `/experiences` URL is retained only as a compatibility redirect to `/challenge`.

## Findings

### 1. Duplicate public navigation

Before this stabilization pass, BOOK navigation exposed `/experiences`, the landing CTA opened `/experiences`, while CHALLENGE also existed as a primary surface. This made the same action system appear to be two separate products.

**Stabilization:** remove Experiences from BOOK utility navigation, route the landing CTA to `/challenge`, and redirect `/experiences` to `/challenge`.

### 2. Draft Book experiences could leak into the standalone Experiences page

`ExperiencesPage` treated every experience except `hidden` as public, so `draft` records could appear incomplete. Because the standalone surface is now retired from public navigation and redirects to Challenge, draft Book experiences remain accessible only through code/editorial work until explicitly published through the canonical Book service.

### 3. Four enabled Challenge records had no image

The current editorial migration intentionally created these tasks with `image: ''`:

- `quan-com-hung-ha-thuoc-lao-free`
- `de-xe-may-ngoai-troi-qua-dem`
- `nhin-xuong-long-chao-cua-chung-ta`
- `tim-cay-xoai-co-thu`

That is valid data but produced a large image-unavailable hero that looked like a broken/blank screen.

**Stabilization:** provide neutral SVG cover illustrations for those four IDs. The polish layer only fills an empty image field and never overwrites an existing user/admin image.

### 4. Challenge catalog mixes legacy campaign/event content with the new Book-era catalog

`tasks.json` still contains old MThen, village-boy and mooncake-era tasks. The current workbook migration disables many of them and keeps a smaller active catalog. This is functional but editorially hard to reason about because the source-of-truth is split between defaults, migrations and localStorage preservation.

**Next catalog task:** create one canonical public Challenge catalog manifest and make legacy task migration an explicit compatibility layer rather than an editorial source.

### 5. BOOK is structurally valid but editorially thin

All 13 chapters have a chapter shell and the published pages contain text, but many chapters currently contain only one short page or a small number of text blocks. Audio is now mapped for Chapters 01–13, yet BOOK has almost no real image assets in its own image folders.

This is not a runtime blank-page bug. It is an editorial completeness issue.

**Next editorial task:** expand each chapter from memory/source material already supplied by the editor; do not invent autobiographical facts. Each published chapter should have a deliberate minimum reading experience before adding more GPS actions.

### 6. BOOK image folders are placeholders

At audit time these production folders contain only `.gitkeep`:

- `public/images/book/chapter-01-dong-song/`
- `public/images/book/chapter-13-su-noi-loan-va-thanh-pho-ban-dem/`
- `public/images/challenges/de-xe-may-ngoai-troi-qua-dem/`

Previously mapped editorial images therefore are not yet production assets. Web-sourced images also require source/license/credit review before publication.

## Public-release checklist

A surface should not be considered editorially ready merely because Netlify builds. Before publishing a new Book page or Challenge, verify:

- title and body/instruction are non-empty in VI and EN;
- status is intentionally `published`/enabled;
- GPS coordinates and radius are intentional when required;
- image is either a real approved asset or an intentional neutral fallback, never an accidental empty hero;
- any external URL resolves;
- no draft experience is shown through a public catalog;
- Book-to-Challenge linkage uses the canonical Challenge ID rather than duplicating the task;
- mobile rendering is smoke-tested on the production/deploy-preview URL.

## Follow-up phases

### Phase A — public surface stabilization

- unify Experiences/Side Quest into Challenge;
- remove duplicate navigation;
- fill intentionally imageless Challenge covers non-destructively;
- run Netlify + Codex review.

### Phase B — Book editorial completion

Audit Chapters 01–13 one by one and classify each page as `ready`, `needs-copy`, `needs-image`, `needs-GPS`, or `draft`. Expand only from approved/user-provided material.

### Phase C — canonical Challenge catalog

Consolidate default tasks + workbook patches + migration rules into a single readable public catalog, while preserving existing-user customization through compatibility migration.

### Phase D — asset rights and final mobile QA

Attach approved images, credits and sources; test BOOK, Challenge GPS, audio arbitration, direct routes, auth and submission flows on production mobile.
