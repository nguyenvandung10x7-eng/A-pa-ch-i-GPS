# Public asset provenance ledger

This ledger is the release source of truth for visual assets used by the public BOOK / FIELD experience.

## Status rules

- `CLEARED` — ownership, permission, or a compatible licence is documented for the exact binary/work being shipped.
- `UNVERIFIED` — the file exists and is used, but the repository does not yet contain enough reconciled provenance evidence to approve public release.
- `BLOCKED` — do not ship the asset publicly until it is replaced or rights/required attribution are cleared.
- A watermark is not a licence. Never remove a publisher/creator watermark as a substitute for permission.
- Reformatting, cropping, converting to WebP, colour grading, or adding an overlay does not change the underlying rights status.
- `CLEARED` is a rights/provenance status, not a claim that a representative image depicts the named challenge location exactly. Where source discovery labels an image representative, that distinction must remain visible in the evidence and public credit.

### Runtime completeness rules

These rules are the completeness mechanism; the tables below are only human-readable indexes.

**FIELD:** every non-empty visual path reachable from any **enabled task in the final runtime task catalog** is in scope, regardless of whether the task came from `src/data/tasks.json`, workbook/import additions, migrations, restored defaults, or another catalog overlay. This includes both the singular `image` property and every non-empty entry of `images[]`. Each such asset is **UNVERIFIED by default** unless an explicit record moves that exact asset to `CLEARED` or `BLOCKED`. The release reviewer must evaluate the catalog after all normal import/migration layers used by production have been applied; adding an enabled imported task or gallery visual cannot silently bypass the rights gate.

**BOOK:** every non-empty visual path reachable from the final published Book experience is also in scope and **UNVERIFIED by default** unless explicitly `CLEARED` or `BLOCKED`. This includes chapter `coverImage`, page `coverImage`, page-level `gallery` media, `image` content-block `image.src`, every media item in `gallery` content blocks, and any separate chapter/page artwork map used by the public renderer such as `NewBookPage.tsx` `chapterArtwork`. The rule applies after the normal Book catalog/content overlays are applied, so a newly imported/published Book visual cannot become public merely because it was omitted from a hand-written table.

For either surface, an asset being present in `public/`, referenced by source code, or visible in a preview does not establish clearance.

`public/images/tasks/SOURCES.md` is candidate source-discovery evidence only. It is **not** a clearance record. The earlier machine-selected `_selected_sources.json` candidate file was removed because it contained stale and materially incorrect matches for several identifiers and was not used at runtime. A task asset must not move to `CLEARED` merely because `SOURCES.md` names a source URL or author.

Before using `SOURCES.md` as provenance evidence, reconcile the shipped binary to one exact original work. At minimum, compare the downloaded/shipped image to the claimed original (visual identity plus available file metadata/hash history), then record the original, creator, licence/version or permission basis, and required attribution. If the exact original cannot be established, the asset remains `UNVERIFIED`.

## Explicit cleared asset records

| Asset | Status | Evidence | Required attribution / restrictions |
| --- | --- | --- | --- |
| `public/images/tasks/canh-dong-muong-thanh-cat-banh.webp` | CLEARED | `public/images/tasks/provenance/canh-dong-muong-thanh-cat-banh.json`; exact derivative SHA-256 `eaa40cf565c0b36be96a17651f74370169aa6030bc059840ce4f12c080e74bcb` regenerated from exact Commons original SHA-256 `557b13cbe82e630b041802a70cb372c01b06f8f72992e41298c974ba6a54a575`. | Adam Jones; CC BY-SA 2.0; link the licence and indicate that the image was resized/re-encoded. Share-alike applies to this derivative. |
| `public/images/tasks/cho-noong-bua-trai-ban.webp` | CLEARED | `public/images/tasks/provenance/cho-noong-bua-trai-ban.json`; exact derivative SHA-256 `896a08a76d799fbec62eadcf6499ad23e17f75fce21a448de16009664a363afa` regenerated from the Commons API-resolved canonical original SHA-256 `de13be5adf356660524c06f8b063d852bd1bf2d019a0d61dddd92d6319dee05c`. | Adam Jones from Kelowna, BC, Canada; CC BY-SA 2.0; link the licence and indicate that the image was resized/re-encoded. Attribution and share-alike requirements apply to this derivative. |
| `public/images/tasks/doi-a1-khoanh-khac-tuong-niem.webp` | CLEARED | `public/images/tasks/provenance/doi-a1-khoanh-khac-tuong-niem.json`; exact derivative SHA-256 `7343a06c68b0f0b7b18b06e3c6fa76bebc1bd0c127d9ad265b5b7537e85f1efc` regenerated from the Commons API-resolved canonical original SHA-256 `02a10ea62b66087b1c7fb2884d975ff217b780485197b7e476dbc8328a80edfc`. | Adam Jones from Kelowna, BC, Canada; CC BY-SA 2.0; link the licence and indicate that the image was resized/re-encoded. Attribution and share-alike requirements apply to this derivative. |
| `public/images/tasks/quang-truong-7-5-mthen.webp` | CLEARED | `public/images/tasks/provenance/quang-truong-7-5-mthen.json`; exact derivative SHA-256 `4741c2e12aead3b1dde462c1c7b6eb6fae81cf4e6fc1b87bc128211eb1ebb34a` regenerated from the Commons API-resolved canonical original SHA-256 `21da7ab103380468d0a5bbff542eacadd5493a9356b23a270f6fb6ed84c1a51a`. The source-discovery ledger identifies this as a representative Dien Bien Phu streetscape, not an exact verified photograph of Quảng trường 7-5. | Ioe2015; CC BY-SA 4.0; link the licence and indicate that the image was resized/re-encoded. Attribution and share-alike requirements apply to this derivative. Rights clearance does not assert exact-location identity. |
| `public/images/tasks/cong-vien-hoa-ban-mthen.webp` | CLEARED | `public/images/tasks/provenance/cong-vien-hoa-ban-mthen.json`; exact derivative SHA-256 `f7f1eebf009fd21212e8564fde5dfb75094a710cda700a577ddb71ae55209369` regenerated from the Commons API-resolved canonical original SHA-256 `8c63b74ef81b1b6c02192c7d365cccff4b501e9833c3e2dcf354a951a85232c3`. The source-discovery ledger identifies this as representative rather than an exact verified photograph of Công viên Hoa Ban. | Adam Jones from Kelowna, BC, Canada; CC BY-SA 2.0; link the licence and indicate that the image was resized/re-encoded. Attribution/share-alike requirements apply. Rights clearance does not assert exact-location identity. |
| `public/images/tasks/ban-phieng-loi-mthen.webp` | CLEARED | `public/images/tasks/provenance/ban-phieng-loi-mthen.json`; exact derivative SHA-256 `3e26ad89f336d3ef775c47340f1c2e3716331ea66df1889d6ca5353a1eabf440` regenerated from the Commons API-resolved canonical original SHA-256 `bd012e6907f077b4cb5f6126b34f7b963c6fbeb602377eb6b2b79de1b5767e40`. The source-discovery ledger identifies this as representative rather than an exact verified photograph of Bản Phiêng Lơi. | Adam Jones from Kelowna, BC, Canada; CC BY-SA 2.0; link the licence and indicate that the image was resized/re-encoded. Attribution/share-alike requirements apply. Rights clearance does not assert exact-location identity. |

## BOOK-native assets

The following rows are current known BOOK-native assets. They do not limit the BOOK runtime completeness rule above.

| Asset | Public use | Status | Release action |
| --- | --- | --- | --- |
| `public/images/book/chapter-01-dong-song/chapter-01-dong-song-hero-01.webp` | Book cover / Chapter 01 hero / page image | UNVERIFIED | Record creator/source, permission or licence, and attribution requirement for the exact shipped work. |
| `public/images/book/chapter-01-dong-song/nam-rom-buoi-chieu-inline-01.jpg` | Chapter 01 inline image | UNVERIFIED | Record creator/source, permission or licence, and attribution requirement for the exact shipped work. |
| `public/images/book/chapter-13-su-noi-loan-va-thanh-pho-ban-dem/chapter-13-thanh-pho-ban-dem-hero-01.webp` | Chapter 13 hero / page image | BLOCKED | Asset review flagged a visible publisher watermark. Keep the watermark intact while reviewing; before public release, either obtain permission with the required credit or replace the image with a cleared asset. |

## FIELD task catalog

The enabled FIELD catalog renders task cover and gallery images in Challenge surfaces. The following human-readable task identifiers have source-discovery records in `public/images/tasks/SOURCES.md`; they remain **UNVERIFIED by default** unless an explicit exact-binary record below moves that asset to `CLEARED` or `BLOCKED`.

| Task / asset identifier | Candidate source record | Status | Release action |
| --- | --- | --- | --- |
| `quang-truong-7-5-mthen` | Present; representative source resolved via MediaWiki API, regenerated and hashed in dedicated provenance record | CLEARED | Keep `public/images/tasks/provenance/quang-truong-7-5-mthen.json` with the shipped binary; preserve Ioe2015 / CC BY-SA 4.0 attribution, licence link, modification notice and share-alike terms. Public credit must continue to disclose that the source is representative rather than an exact verified photograph of the named square. |
| `cong-vien-vu-a-dinh-trai-ban` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `phadin-coffee-cat-banh` | No matching row found in `SOURCES.md` | UNVERIFIED | Add exact source, creator and licence/permission evidence before release. |
| `cong-vien-noong-bua-mthen` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `cho-noong-bua-trai-ban` | Present; canonical Commons source resolved via MediaWiki API, regenerated and hashed in dedicated provenance record | CLEARED | Keep `public/images/tasks/provenance/cho-noong-bua-trai-ban.json` with the shipped binary; preserve Adam Jones / CC BY-SA 2.0 attribution, licence link, modification notice and share-alike terms. |
| `ho-huoi-pha-mthen` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `khu-du-lich-him-lam-trai-ban` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `canh-dong-muong-thanh-cat-banh` | Present; exact source regenerated and hashed in dedicated provenance record | CLEARED | Keep `public/images/tasks/provenance/canh-dong-muong-thanh-cat-banh.json` with the shipped binary; preserve Adam Jones / CC BY-SA 2.0 attribution, licence link, modification notice and share-alike terms. |
| `cong-vien-hoa-ban-mthen` | Present; representative source resolved via MediaWiki API, regenerated and hashed in dedicated provenance record | CLEARED | Keep `public/images/tasks/provenance/cong-vien-hoa-ban-mthen.json` with the shipped binary; preserve Adam Jones / CC BY-SA 2.0 attribution, licence link, modification notice and share-alike terms. Public credit must disclose that the source is representative rather than an exact verified photograph of Công viên Hoa Ban. |
| `ho-pa-khoang-trai-ban` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `deo-pha-din-cat-banh` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `cho-muong-nhe-tang-banh-trung-thu` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify the specific source licence/permission and attribution. |
| `cau-ta-ko-khu-tang-banh-trung-thu` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `cot-co-a-pa-chai-mthen` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `cot-co-a-pa-chai-trai-ban-lanh-lung` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `ban-a-pa-chai-tang-banh-trung-thu` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `bao-tang-chien-thang-dien-bien-phu-trai-nghiem` | Present | UNVERIFIED | An official portal source is not itself a reuse licence; reconcile the binary and obtain/record the reuse basis. |
| `doi-a1-khoanh-khac-tuong-niem` | Present; canonical Commons source resolved via MediaWiki API, regenerated and hashed in dedicated provenance record | CLEARED | Keep `public/images/tasks/provenance/doi-a1-khoanh-khac-tuong-niem.json` with the shipped binary; preserve Adam Jones / CC BY-SA 2.0 attribution, licence link, modification notice and share-alike terms. |
| `ban-phieng-loi-mthen` | Present; representative source resolved via MediaWiki API, regenerated and hashed in dedicated provenance record | CLEARED | Keep `public/images/tasks/provenance/ban-phieng-loi-mthen.json` with the shipped binary; preserve Adam Jones / CC BY-SA 2.0 attribution, licence link, modification notice and share-alike terms. Public credit must disclose that the source is representative rather than an exact verified photograph of Bản Phiêng Lơi. |
| `ca-phe-ke-nenh-cat-banh` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `ruong-bac-thang-ta-leng-mthen` | Present, but source-page/direct-image evidence must be reconciled | UNVERIFIED | Identify the exact original before clearance. |
| `thac-ke-nenh-mthen` | Present, but source-page/direct-image evidence must be reconciled | UNVERIFIED | Identify the exact original before clearance. |

The table above is a convenience index, not the completeness mechanism. Any visual on an enabled task in the final runtime catalog—including imported additions and any `images[]` gallery item not named here—remains `UNVERIFIED` until explicitly cleared.

## Task images reused as BOOK chapter artwork

`src/pages/NewBookPage.tsx` currently reuses these task assets as editorial chapter heroes. Their rights must therefore cover both the original Challenge use and the BOOK/editorial use.

| Asset | BOOK chapters | Status | Release action |
| --- | --- | --- | --- |
| `public/images/tasks/cong-vien-hoa-ban-mthen.webp` | 02 | CLEARED | Exact shipped derivative is covered by the dedicated provenance record and CC BY-SA 2.0 for FIELD plus BOOK/editorial reuse; retain attribution, licence link, modification notice and share-alike terms. This is a representative source, not an exact verified photograph of Công viên Hoa Ban, and public credit must retain that distinction. |
| `public/images/tasks/ban-phieng-loi-mthen.webp` | 03 | CLEARED | Exact shipped derivative is covered by the dedicated provenance record and CC BY-SA 2.0 for FIELD plus BOOK/editorial reuse; retain attribution, licence link, modification notice and share-alike terms. This is a representative source, not an exact verified photograph of Bản Phiêng Lơi, and public credit must retain that distinction. |
| `public/images/tasks/quang-truong-7-5-mthen.webp` | 04, 06 | CLEARED | Exact shipped derivative is covered by the dedicated provenance record and CC BY-SA 4.0 for FIELD plus BOOK/editorial reuse; retain attribution, licence link, modification notice and share-alike terms. This is a representative Dien Bien Phu streetscape, not an exact verified image of Quảng trường 7-5, and public credit must retain that distinction. |
| `public/images/tasks/cho-noong-bua-trai-ban.webp` | 05 | CLEARED | Exact shipped derivative is covered by the dedicated provenance record and CC BY-SA 2.0 for FIELD plus BOOK/editorial reuse; retain attribution, licence link, modification notice and share-alike terms. |
| `public/images/tasks/canh-dong-muong-thanh-cat-banh.webp` | 07 | CLEARED | Exact shipped derivative is covered by the dedicated provenance record and CC BY-SA 2.0 for FIELD plus BOOK/editorial reuse; retain attribution, licence link, modification notice and share-alike terms. |
| `public/images/tasks/doi-a1-khoanh-khac-tuong-niem.webp` | 08 | CLEARED | Exact shipped derivative is covered by the dedicated provenance record and CC BY-SA 2.0 for FIELD plus BOOK/editorial reuse; retain attribution, licence link, modification notice and share-alike terms. |
| `public/images/tasks/bao-tang-chien-thang-dien-bien-phu-trai-nghiem.webp` | 09 | UNVERIFIED | Reconcile the exact binary and obtain/record the reuse basis from the source rights holder. |
| `public/images/tasks/thac-ke-nenh-mthen.webp` | 10 | UNVERIFIED | Reconcile the exact binary/source, then clear editorial reuse and required attribution. |
| `public/images/tasks/cot-co-a-pa-chai.webp` | 12 | UNVERIFIED | Add and reconcile the exact source/licence record for this path before editorial reuse. |

Chapters without a mapped hero are not implicitly cleared; they simply do not add a chapter-artwork asset through the current `chapterArtwork` map. Any future artwork entry is still caught by the BOOK runtime completeness rule even if this table is not yet updated.

## Challenge-specific asset requiring a record

| Asset | Public use | Status | Release action |
| --- | --- | --- | --- |
| `public/images/challenges/de-xe-may-ngoai-troi-qua-dem/cover-01.jpg` | Chapter 13 linked Challenge cover | UNVERIFIED | Record and reconcile creator/source and permission/licence before release. |

## Evidence format

For every asset moved to `CLEARED`, add or link a record containing:

1. exact file path and stable asset identifier;
2. identity of the exact original work matched to the shipped binary;
3. creator / rights holder;
4. original source URL or original-file reference, where applicable;
5. permission basis or licence name/version;
6. required attribution text;
7. date checked and person or review actor who checked it;
8. restrictions on derivatives, editorial use, commercial use, or redistribution;
9. note explaining how stale or conflicting candidate-source records, if any, were resolved;
10. when the asset is representative rather than exact-location verified, a representation note that prevents rights clearance from being mistaken for location verification.

Do not store private licence agreements in the public repository. A short clearance record may point to the controlled internal location of the evidence.
