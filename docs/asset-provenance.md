# Public asset provenance ledger

This ledger is the release source of truth for visual assets used by the public BOOK / FIELD experience.

## Status rules

- `CLEARED` — ownership, permission, or a compatible licence is documented for the exact binary/work being shipped.
- `UNVERIFIED` — the file exists and is used, but the repository does not yet contain enough reconciled provenance evidence to approve public release.
- `BLOCKED` — do not ship the asset publicly until it is replaced or rights/required attribution are cleared.
- A watermark is not a licence. Never remove a publisher/creator watermark as a substitute for permission.
- Reformatting, cropping, converting to WebP, colour grading, or adding an overlay does not change the underlying rights status.

### FIELD catalog completeness rule

Every non-empty visual path referenced by an **enabled** task in `src/data/tasks.json` is in scope for this ledger: both the singular `image` property and every non-empty entry of the `images` array. Each such asset has status **UNVERIFIED by default** unless an explicit row in this document moves that exact asset to `CLEARED` or `BLOCKED`. This rule is intentionally fail-closed: adding a new enabled FIELD cover or gallery image cannot silently bypass the release-rights gate.

`public/images/tasks/SOURCES.md` and `public/images/tasks/_selected_sources.json` are only candidate source-discovery evidence. They are **not** clearance records, and they currently contain conflicting source/original claims for some identifiers. A task asset must not move to `CLEARED` merely because one of these files names a source URL or author.

Before using either source file as provenance evidence, reconcile the shipped binary to one exact original work. At minimum, compare the downloaded/shipped image to the claimed original (visual identity plus available file metadata/hash history), resolve any conflict between `SOURCES.md` and `_selected_sources.json`, then record the winning original, creator, licence/version or permission basis, and required attribution. If the exact original cannot be established, the asset remains `UNVERIFIED`.

## BOOK-native assets

| Asset | Public use | Status | Release action |
| --- | --- | --- | --- |
| `public/images/book/chapter-01-dong-song/chapter-01-dong-song-hero-01.webp` | Book cover / Chapter 01 hero / page image | UNVERIFIED | Record creator/source, permission or licence, and attribution requirement for the exact shipped work. |
| `public/images/book/chapter-01-dong-song/nam-rom-buoi-chieu-inline-01.jpg` | Chapter 01 inline image | UNVERIFIED | Record creator/source, permission or licence, and attribution requirement for the exact shipped work. |
| `public/images/book/chapter-13-su-noi-loan-va-thanh-pho-ban-dem/chapter-13-thanh-pho-ban-dem-hero-01.webp` | Chapter 13 hero / page image | BLOCKED | Asset review flagged a visible publisher watermark. Keep the watermark intact while reviewing; before public release, either obtain permission with the required credit or replace the image with a cleared asset. |

## FIELD task catalog

The enabled FIELD catalog renders task cover and gallery images in Challenge surfaces. The following human-readable task identifiers have source-discovery records in `public/images/tasks/SOURCES.md`; all remain **UNVERIFIED** until the exact shipped binary is reconciled against all existing source evidence and its licence/permission plus attribution requirements are recorded for the intended use.

| Task / asset identifier | Candidate source record | Status | Release action |
| --- | --- | --- | --- |
| `quang-truong-7-5-mthen` | Present, but conflicting repository evidence must be reconciled | UNVERIFIED | Identify the exact original for the shipped binary before checking its licence/version and attribution. |
| `cong-vien-vu-a-dinh-trai-ban` | Present, but conflicting repository evidence must be reconciled | UNVERIFIED | Identify the exact original for the shipped binary before checking its licence/version and attribution. |
| `phadin-coffee-cat-banh` | No matching row found in `SOURCES.md` | UNVERIFIED | Add exact source, creator and licence/permission evidence before release. |
| `cong-vien-noong-bua-mthen` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `cho-noong-bua-trai-ban` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `ho-huoi-pha-mthen` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `khu-du-lich-him-lam-trai-ban` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `canh-dong-muong-thanh-cat-banh` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `cong-vien-hoa-ban-mthen` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `ho-pa-khoang-trai-ban` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `deo-pha-din-cat-banh` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `cho-muong-nhe-tang-banh-trung-thu` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify the specific source licence/permission and attribution. |
| `cau-ta-ko-khu-tang-banh-trung-thu` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `cot-co-a-pa-chai-mthen` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `cot-co-a-pa-chai-trai-ban-lanh-lung` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `ban-a-pa-chai-tang-banh-trung-thu` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `bao-tang-chien-thang-dien-bien-phu-trai-nghiem` | Present | UNVERIFIED | An official portal source is not itself a reuse licence; reconcile the binary and obtain/record the reuse basis. |
| `doi-a1-khoanh-khac-tuong-niem` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `ban-phieng-loi-mthen` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `ca-phe-ke-nenh-cat-banh` | Present | UNVERIFIED | Reconcile the shipped binary to the exact original, then verify licence/version and attribution. |
| `ruong-bac-thang-ta-leng-mthen` | Present | UNVERIFIED | Resolve the mismatched source-page/direct-image evidence and identify the exact original before clearance. |
| `thac-ke-nenh-mthen` | Present | UNVERIFIED | Resolve the mismatched source-page/direct-image evidence and identify the exact original before clearance. |

The table above is a convenience index, not the completeness mechanism. If `src/data/tasks.json` contains another enabled task `image` or any `images[]` entry now or in the future, the fail-closed FIELD catalog rule above still assigns every referenced visual `UNVERIFIED` until explicitly cleared.

## Task images reused as BOOK chapter artwork

`src/pages/NewBookPage.tsx` currently reuses these task assets as editorial chapter heroes. Their rights must therefore cover both the original Challenge use and the BOOK/editorial use.

| Asset | BOOK chapters | Status | Release action |
| --- | --- | --- | --- |
| `public/images/tasks/cong-vien-hoa-ban-mthen.webp` | 02 | UNVERIFIED | Reconcile the exact binary/source, then clear editorial reuse and required attribution. |
| `public/images/tasks/ban-phieng-loi-mthen.webp` | 03 | UNVERIFIED | Reconcile the exact binary/source, then clear editorial reuse and required attribution. |
| `public/images/tasks/quang-truong-7-5-mthen.webp` | 04, 06 | UNVERIFIED | Reconcile the conflicting source evidence for the exact binary, then clear editorial reuse and attribution. |
| `public/images/tasks/cho-noong-bua-trai-ban.webp` | 05 | UNVERIFIED | Reconcile the exact binary/source, then clear editorial reuse and required attribution. |
| `public/images/tasks/canh-dong-muong-thanh-cat-banh.webp` | 07 | UNVERIFIED | Reconcile the exact binary/source, then clear editorial reuse and required attribution. |
| `public/images/tasks/doi-a1-khoanh-khac-tuong-niem.webp` | 08 | UNVERIFIED | Reconcile the exact binary/source, then clear editorial reuse and required attribution. |
| `public/images/tasks/bao-tang-chien-thang-dien-bien-phu-trai-nghiem.webp` | 09 | UNVERIFIED | Reconcile the exact binary and obtain/record the reuse basis from the source rights holder. |
| `public/images/tasks/thac-ke-nenh-mthen.webp` | 10 | UNVERIFIED | Reconcile the exact binary/source, then clear editorial reuse and required attribution. |
| `public/images/tasks/cot-co-a-pa-chai.webp` | 12 | UNVERIFIED | Add and reconcile the exact source/licence record for this path before editorial reuse. |

Chapters without a mapped hero are not implicitly cleared; they simply do not add a chapter-artwork asset through the current `chapterArtwork` map.

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
7. date checked and person who checked it;
8. restrictions on derivatives, editorial use, commercial use, or redistribution;
9. note explaining how conflicting candidate-source records, if any, were resolved.

Do not store private licence agreements in the public repository. A short clearance record may point to the controlled internal location of the evidence.
