# Release readiness

This checklist defines when the public BOOK / FIELD product can be called release-ready. A successful build alone is not sufficient.

## 1. Product structure

- [x] Public information architecture is reduced to the two primary surfaces: BOOK and FIELD.
- [x] Recent / History is retired from public navigation and old routes redirect safely.
- [x] Sign-in/account remains visible; anonymous users retain access to language, Bookmarks, Near me, Privacy and Legal.
- [x] BOOK reading state and Challenge progress remain separate.
- [x] `/experiences` is not a third public product surface.

## 2. BOOK experience

- [x] Cover and Contents use the editorial presentation.
- [x] Reading mode removes legacy card/shadow chrome while preserving content semantics.
- [x] Continue Reading follows the most recently opened Book page.
- [x] Chapter soundtrack selection follows the current chapter when Book sound is enabled.
- [x] Browser autoplay failure has an explicit user-play fallback.
- [x] Book audio and Challenge/Layout audio yield to each other without permanently losing the previous playback state.
- [x] Chapter places appear at the end of the final page and open the real map location.
- [x] Chapter 13 has its own night art direction without changing its GPS-only Challenge completion semantics.
- [x] BOOK / FIELD typography roles are centralized in `src/typography-v2.css`.
- [ ] If exact Source Serif 4 / IBM Plex Sans rendering is required for the locked visual design, add approved self-hosted font assets and document their licences. Until then the app intentionally uses the centralized fallback stacks.

## 3. FIELD / Challenge

- [x] FIELD is action-first and visually distinct from BOOK.
- [x] Challenge GPS/state-machine/persistence logic is not coupled to the BOOK redesign.
- [x] Discover, Leaderboard and Submission stay inside the FIELD visual frame.
- [x] Chapter 13 Challenge remains arrival-only at the configured GPS radius; narrative overnight behaviour is not treated as verification.
- [ ] Run a final real-device GPS smoke test on the production origin before launch.
- [ ] Run a signed-in submission/leaderboard smoke test against the production backend before launch.

## 4. Build and deployment gates

- [x] `npm run verify` exists and runs TypeScript checking before the production build.
- [x] Pull requests run the GitHub Verify workflow.
- [x] Pull requests and `main` run the production dependency security audit workflow.
- [ ] Confirm Verify succeeds on the exact final release commit on `main`.
- [ ] Confirm Production Security Audit succeeds on that same final release commit.
- [ ] Confirm the production Netlify deploy succeeds on that same final release commit.
- [ ] Smoke-test direct navigation/refresh for `/book`, a Book page, `/challenge`, `/discover`, `/leaderboard`, `/privacy` and `/legal` on the production origin.

## 5. Authentication and production configuration

- [x] Public reading does not require authentication.
- [x] OAuth return paths preserve pathname, query and hash where the public shell initiates sign-in.
- [ ] Confirm production OAuth redirect URLs are registered with the identity provider.
- [ ] Confirm production Supabase/Netlify environment variables are set and do not contain development-only values.
- [ ] Confirm sign-in, sign-out and a fresh anonymous session on the production origin.

## 6. Content and asset rights

Visual rights/provenance were re-audited against the final runtime catalog on 2026-08-23. Active BOOK/FIELD visual paths are now either exact `CLEARED` binaries or have been removed/retired from the deployable runtime. Audio is tracked separately in `docs/audio-provenance.md` and remains an active release blocker.

- [x] Resolve every `BLOCKED` item in `docs/asset-provenance.md` before public launch.
- [x] Move every public launch image from `UNVERIFIED` to `CLEARED`, or remove/replace it.
- [x] Evaluate the **final runtime FIELD catalog after normal imports/migrations**; cover every enabled task `image` and every non-empty `images[]` entry, including imported additions.
- [x] Evaluate the **final published BOOK runtime**; cover chapter/page `coverImage`, page-level galleries, image/gallery content blocks, and renderer artwork maps such as `chapterArtwork`.
- [x] Reconcile conflicting candidate-source records to the exact shipped binary before marking any affected asset `CLEARED`.
- [x] Confirm required visual credits are actually visible through the public Credits surface, including author, source/licence links and change/representation notes required by the recorded licences.
- [x] Keep original watermarks intact during rights review; never remove a watermark as a substitute for clearance. The former watermarked Chapter 13 binary was removed from deployable `public/` rather than altered.
- [ ] Move every runtime audio file in `docs/audio-provenance.md` from `UNVERIFIED` to `CLEARED`, or remove/replace it, before public launch. Repository upload/commit history alone is not treated as proof of authorship or redistribution rights.
- [x] Confirm the repository currently ships no self-hosted font binaries requiring a separate font licence record; if such fonts are introduced later, document their licences before launch.

## 7. Security and dependency review

- [x] A permanent CI gate runs `npm audit --omit=dev --audit-level=high` against the exact lockfile.
- [x] The runtime high-severity findings discovered during release audit were patched without weakening the audit threshold; the production audit passed before merge of the security PR.
- [x] Pull requests and `main` run a tracked-secret gate that rejects committed `.env` files and runs pinned Gitleaks scans, including an explicit full-history scan.
- [x] The full-history Gitleaks scan passed before merge of the tracked-secret gate and found no blocked secret in the checked-out repository history.
- [ ] Confirm the exact final release commit on `main` still passes the Production Security Audit.
- [ ] Confirm that same exact final release commit passes the Tracked Secret Scan.
- [ ] Confirm no private licence agreement or other sensitive non-credential material is committed to the repository.

## 8. Accessibility and device smoke tests

- [ ] Keyboard-test BOOK/FIELD navigation, account sheet, bookmark control and key FIELD actions.
- [ ] Screen-reader-check the public shell landmarks and interactive labels on at least one representative Book page and Challenge page.
- [ ] Check text contrast in BOOK, FIELD and Chapter 13 night surfaces after the final asset/font choices.
- [ ] Check 320–390 px mobile widths for horizontal overflow and safe-area behaviour.
- [ ] Check one current iOS Safari and one current Android Chrome device.
- [ ] Verify audio enable/play/pause/route transition behaviour on both mobile browsers.

## Release decision

The project is code-complete only when its functional gates are green. It is public-release-ready only when the remaining unchecked production configuration, rights, security and real-device checks above are also closed.