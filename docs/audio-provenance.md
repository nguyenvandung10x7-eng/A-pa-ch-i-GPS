# Public audio provenance ledger

This ledger tracks rights/provenance for audio files reachable from the public BOOK / FIELD product. It is separate from `docs/asset-provenance.md`, which currently governs visual assets.

## Status rules

- `CLEARED` — ownership, permission, or a compatible licence is documented for the exact audio work/file being shipped.
- `UNVERIFIED` — the exact file is publicly reachable/used, but the repository does not contain enough evidence to approve public release.
- `BLOCKED` — do not ship publicly until the work is removed/replaced or the rights basis is documented.
- A Git commit, repository upload, or file being supplied by the repository owner proves repository history only; it does **not** by itself prove authorship, copyright ownership, commercial-use rights, or redistribution rights.
- File names, genre labels, chapter assignment, transcoding, compression, or other technical handling do not establish a licence.

## Audit basis

Repository history was reviewed on 2026-08-23 and exact shipped binary identities were reconciled against `main` commit `40090f97598b8c4ea34a8707b830a129df006fad` on 2026-08-24.

- PR #11 (`feat: add gameplay background music`) documents adding background tracks and playback behavior, but its description/review history does not record creator, source, licence, commission, or AI-service rights terms for the exact works.
- PR #55 (`Map uploaded Book chapter audio`) documents uploaded MP3s, binary moves into `public/audio`, chapter mapping, and playback behavior. Its description/review history likewise does not record creator, source, licence, commission, or AI-service rights terms for the exact works.
- Prior project discussions and asset-mapping records were also checked; they identify runtime paths/mapping but do not establish creator/rightsholder, source URL, generation service, commission, ownership, or licence for these exact files.
- Commit authorship/upload by `nguyenvandung10x7-eng` is therefore treated as custody/history evidence only, not as rights clearance.
- Git blob SHA and byte size below identify the exact tracked binary at the audited `main` commit. They are identity evidence only and do not establish copyright ownership or licence.
- No self-hosted font binaries (`.woff`, `.woff2`, `.ttf`, `.otf`) or `@font-face` declarations were found in the repository during this audit; the current font issue remains a rendering-choice item rather than a shipped-font-rights blocker.

Until a rights basis is documented, every public audio file below remains `UNVERIFIED`.

## FIELD / global background music

| Exact public path | Runtime ID | Git blob SHA | Bytes | Status | Evidence needed to clear |
| --- | --- | --- | ---: | --- | --- |
| `public/audio/hmong-ballad-1.mp3` | `hmong-ballad-1` | `c94612336c4ec523ea8f851397fab6e83f615c20` | 9,086,733 | UNVERIFIED | Identify exact work/creator and document ownership, permission, licence, commission, or applicable generation-service terms permitting public use and redistribution. |
| `public/audio/hmong-ballad-2.mp3` | `hmong-ballad-2` | `1b832947d55a8a0a2ad587340eb41aca01ef7534` | 7,226,013 | UNVERIFIED | Same requirement. |
| `public/audio/thai-epic-1.mp3` | `thai-epic-1` | `6f7e0bba86b50b220e260eec46ca1e6bcbecc0e2` | 5,295,453 | UNVERIFIED | Same requirement. |
| `public/audio/thai-epic-2.mp3` | `thai-epic-2` | `2a68762ae031a69774abc3197f8784ddbe74257e` | 5,065,629 | UNVERIFIED | Same requirement. |
| `public/audio/thai-street-1.mp3` | `thai-street-1` | `2152da473cc81d65c138fa6af0f3db52e811cbd6` | 11,132,877 | UNVERIFIED | Same requirement. |
| `public/audio/thai-street-2.mp3` | `thai-street-2` | `4c2a2676e6f4bd39c234457c77f7a5d2b1cdb63d` | 11,350,221 | UNVERIFIED | Same requirement. |
| `public/audio/HMONGdisco.mp3` | `hmongdisco` | `823e130be9b601620f41f2e46db1e86fdce51b3f` | 8,884,605 | UNVERIFIED | Same requirement. |
| `public/audio/HMONGdisco2.mp3` | `hmongdisco2` | `c9225ed4edecbcd9877b374dc7a3e4a16a5638d3` | 8,708,013 | UNVERIFIED | Same requirement. |
| `public/audio/HATTHAI.mp3` | `hatthai` | `1a5df3a347b326cca7edaebfd5a43949c8a8e6ef` | 2,153,832 | UNVERIFIED | Same requirement. |
| `public/audio/HMONG.mp3` | `hmong` | `1e3f420d8f801b4ab6cb7339aeca460c57ad4ab1` | 2,280,204 | UNVERIFIED | Same requirement. |
| `public/audio/HMONGrock2.mp3` | `hmongrock2` | `2a32e2ca82219357fab322697095ddd21a5ac71f` | 4,047,717 | UNVERIFIED | Same requirement. |

## BOOK chapter audio

| Exact public path | Runtime ID | Git blob SHA | Bytes | Status | Evidence needed to clear |
| --- | --- | --- | ---: | --- | --- |
| `public/audio/chapter-01-dong-song-track-01.mp3` | `chapter-01-dong-song-track-01` | `5748036536b32c9f7dcc97dba4b4328b43feb4d2` | 8,464,424 | UNVERIFIED | Identify exact work/creator and document ownership, permission, licence, commission, or applicable generation-service terms permitting public use and redistribution. |
| `public/audio/chapter-02-mua-he-track-01.mp3` | `chapter-02-mua-he-track-01` | `e67e81186fa7f9291f968205b74adeb45e90447f` | 5,204,736 | UNVERIFIED | Same requirement. |
| `public/audio/chapter-03-nha-ba-noi-track-01.mp3` | `chapter-03-nha-ba-noi-track-01` | `27f6166d5184a1b4712112a387fbe5636b7579dd` | 4,673,619 | UNVERIFIED | Same requirement. |
| `public/audio/chapter-04-pho-cu-track-01.mp3` | `chapter-04-pho-cu-track-01` | `59674a085b46f63d6399d6b51f67d908d51c2661` | 4,891,794 | UNVERIFIED | Same requirement. |
| `public/audio/chapter-05-thi-xa-track-01.mp3` | `chapter-05-thi-xa-track-01` | `0b1e8fea50cea207a47bcffe5f2e0cb90c2903f4` | 4,570,801 | UNVERIFIED | Same requirement. |
| `public/audio/chapter-06-nhung-nam-2000-track-01.mp3` | `chapter-06-nhung-nam-2000-track-01` | `2e288999f624c689a7b905f93cd2d0144ee0ab98` | 5,412,571 | UNVERIFIED | Same requirement. |
| `public/audio/chapter-07-long-chao-track-01.mp3` | `chapter-07-long-chao-track-01` | `d0a5fbfb89f83a769e0f1e3c6b2679adb544fc1a` | 3,430,656 | UNVERIFIED | Same requirement. |
| `public/audio/chapter-08-nhung-ngon-doi-track-01.mp3` | `chapter-08-nhung-ngon-doi-track-01` | `5b5e4eb891c5194a1a3f1bfc8e618871c021a8b1` | 2,034,625 | UNVERIFIED | Same requirement. |
| `public/audio/chapter-09-1954-track-01.mp3` | `chapter-09-1954-track-01` | `4521c58c62dee3277dd2b0832d9510a4dbfd4846` | 4,182,935 | UNVERIFIED | Same requirement. |
| `public/audio/chapter-09-1954-track-02.mp3` | `chapter-09-1954-track-02` | `b22553453e00f4f4d5874d9abf25e93604bbef96` | 4,225,567 | UNVERIFIED | Same requirement. |
| `public/audio/chapter-10-con-vat-track-01.mp3` | `chapter-10-con-vat-track-01` | `7eb15214067f3e5785f7a087b554d2813bc864f4` | 7,237,111 | UNVERIFIED | Same requirement. |
| `public/audio/chapter-11-nguoi-song-nguoi-chet-track-01.mp3` | `chapter-11-nguoi-song-nguoi-chet-track-01` | `b23e3e84c03f84d21cfc8451b73b7a31ceabdb89` | 1,367,808 | UNVERIFIED | Same requirement. |
| `public/audio/chapter-12-di-ve-phia-tay-track-01.mp3` | `chapter-12-di-ve-phia-tay-track-01` | `be4c0faecebd0069197660f111a69899cdebf8bc` | 2,865,528 | UNVERIFIED | Same requirement. |
| `public/audio/book/chapter-13-su-noi-loan-va-thanh-pho-ban-dem/chapter-13-su-noi-loan-va-thanh-pho-ban-dem-track-01.mp3` | `chapter-13-su-noi-loan-va-thanh-pho-ban-dem-track-01` | `adecfc52438c3b57340bc9f3729b00b796e1327f` | 2,587,461 | UNVERIFIED | Same requirement. |
| `public/audio/book/chapter-13-su-noi-loan-va-thanh-pho-ban-dem/chapter-13-su-noi-loan-va-thanh-pho-ban-dem-track-02.mp3` | `chapter-13-su-noi-loan-va-thanh-pho-ban-dem-track-02` | `05272f847ab84ac4c4821e028763c2b6754f3e43` | 2,323,461 | UNVERIFIED | Same requirement. |

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