# Public audio provenance ledger

This ledger tracks rights/provenance for audio files reachable from the public BOOK / FIELD product. It is separate from `docs/asset-provenance.md`, which currently governs visual assets.

## Status rules

- `CLEARED` — ownership, permission, or a compatible licence is documented for the exact audio work/file being shipped.
- `UNVERIFIED` — the exact file is publicly reachable/used, but the repository does not contain enough evidence to approve public release.
- `BLOCKED` — do not ship publicly until the work is removed/replaced or the rights basis is documented.
- A Git commit, repository upload, or file being supplied by the repository owner proves repository history only; it does **not** by itself prove authorship, copyright ownership, commercial-use rights, or redistribution rights.
- File names, genre labels, chapter assignment, transcoding, compression, or other technical handling do not establish a licence.

## Audit basis

Repository history was reviewed on 2026-08-23.

- PR #11 (`feat: add gameplay background music`) documents adding background tracks and playback behavior, but its description/review history does not record creator, source, licence, commission, or AI-service rights terms for the exact works.
- PR #55 (`Map uploaded Book chapter audio`) documents uploaded MP3s, binary moves into `public/audio`, chapter mapping, and playback behavior. Its description/review history likewise does not record creator, source, licence, commission, or AI-service rights terms for the exact works.
- Commit authorship/upload by `nguyenvandung10x7-eng` is therefore treated as custody/history evidence only, not as rights clearance.
- No self-hosted font binaries (`.woff`, `.woff2`, `.ttf`, `.otf`) or `@font-face` declarations were found in the repository during this audit; the current font issue remains a rendering-choice item rather than a shipped-font-rights blocker.

Until a rights basis is documented, every public audio file below remains `UNVERIFIED`.

## FIELD / global background music

| Exact public path | Runtime ID | Status | Evidence needed to clear |
| --- | --- | --- | --- |
| `public/audio/hmong-ballad-1.mp3` | `hmong-ballad-1` | UNVERIFIED | Identify exact work/creator and document ownership, permission, licence, commission, or applicable generation-service terms permitting public use and redistribution. |
| `public/audio/hmong-ballad-2.mp3` | `hmong-ballad-2` | UNVERIFIED | Same requirement. |
| `public/audio/thai-epic-1.mp3` | `thai-epic-1` | UNVERIFIED | Same requirement. |
| `public/audio/thai-epic-2.mp3` | `thai-epic-2` | UNVERIFIED | Same requirement. |
| `public/audio/thai-street-1.mp3` | `thai-street-1` | UNVERIFIED | Same requirement. |
| `public/audio/thai-street-2.mp3` | `thai-street-2` | UNVERIFIED | Same requirement. |
| `public/audio/HMONGdisco.mp3` | `hmongdisco` | UNVERIFIED | Same requirement. |
| `public/audio/HMONGdisco2.mp3` | `hmongdisco2` | UNVERIFIED | Same requirement. |
| `public/audio/HATTHAI.mp3` | `hatthai` | UNVERIFIED | Same requirement. |
| `public/audio/HMONG.mp3` | `hmong` | UNVERIFIED | Same requirement. |
| `public/audio/HMONGrock2.mp3` | `hmongrock2` | UNVERIFIED | Same requirement. |

## BOOK chapter audio

| Exact public path | Runtime ID | Status | Evidence needed to clear |
| --- | --- | --- | --- |
| `public/audio/chapter-01-dong-song-track-01.mp3` | `chapter-01-dong-song-track-01` | UNVERIFIED | Identify exact work/creator and document ownership, permission, licence, commission, or applicable generation-service terms permitting public use and redistribution. |
| `public/audio/chapter-02-mua-he-track-01.mp3` | `chapter-02-mua-he-track-01` | UNVERIFIED | Same requirement. |
| `public/audio/chapter-03-nha-ba-noi-track-01.mp3` | `chapter-03-nha-ba-noi-track-01` | UNVERIFIED | Same requirement. |
| `public/audio/chapter-04-pho-cu-track-01.mp3` | `chapter-04-pho-cu-track-01` | UNVERIFIED | Same requirement. |
| `public/audio/chapter-05-thi-xa-track-01.mp3` | `chapter-05-thi-xa-track-01` | UNVERIFIED | Same requirement. |
| `public/audio/chapter-06-nhung-nam-2000-track-01.mp3` | `chapter-06-nhung-nam-2000-track-01` | UNVERIFIED | Same requirement. |
| `public/audio/chapter-07-long-chao-track-01.mp3` | `chapter-07-long-chao-track-01` | UNVERIFIED | Same requirement. |
| `public/audio/chapter-08-nhung-ngon-doi-track-01.mp3` | `chapter-08-nhung-ngon-doi-track-01` | UNVERIFIED | Same requirement. |
| `public/audio/chapter-09-1954-track-01.mp3` | `chapter-09-1954-track-01` | UNVERIFIED | Same requirement. |
| `public/audio/chapter-09-1954-track-02.mp3` | `chapter-09-1954-track-02` | UNVERIFIED | Same requirement. |
| `public/audio/chapter-10-con-vat-track-01.mp3` | `chapter-10-con-vat-track-01` | UNVERIFIED | Same requirement. |
| `public/audio/chapter-11-nguoi-song-nguoi-chet-track-01.mp3` | `chapter-11-nguoi-song-nguoi-chet-track-01` | UNVERIFIED | Same requirement. |
| `public/audio/chapter-12-di-ve-phia-tay-track-01.mp3` | `chapter-12-di-ve-phia-tay-track-01` | UNVERIFIED | Same requirement. |
| `public/audio/book/chapter-13-su-noi-loan-va-thanh-pho-ban-dem/chapter-13-su-noi-loan-va-thanh-pho-ban-dem-track-01.mp3` | `chapter-13-su-noi-loan-va-thanh-pho-ban-dem-track-01` | UNVERIFIED | Same requirement. |
| `public/audio/book/chapter-13-su-noi-loan-va-thanh-pho-ban-dem/chapter-13-su-noi-loan-va-thanh-pho-ban-dem-track-02.mp3` | `chapter-13-su-noi-loan-va-thanh-pho-ban-dem-track-02` | UNVERIFIED | Same requirement. |

## Minimum clearance record

For an audio file to move to `CLEARED`, record at least:

1. exact shipped path and runtime ID;
2. identity/title of the exact underlying work;
3. creator/rightsholder or generation source;
4. source URL, project/export reference, or controlled internal evidence reference where applicable;
5. rights basis: ownership, written permission, commission/assignment, licence name/version, or generation-service terms in force when the work was created;
6. whether public web playback, commercial use (if relevant), derivatives/editing, and redistribution of the shipped file are permitted;
7. required attribution or notice, if any;
8. date checked and review actor;
9. exact-file hash or other stable binary identity where practical;
10. resolution of any conflicting or uncertain source history.

Do not put private contracts, account credentials, or sensitive licence documents in the public repository. Public records may point to a controlled evidence location instead.

## Release status

**Audio rights remain an active public-release blocker.** The visual provenance audit may be complete independently, but the public release should not be called rights-cleared while any runtime audio file above remains `UNVERIFIED`.