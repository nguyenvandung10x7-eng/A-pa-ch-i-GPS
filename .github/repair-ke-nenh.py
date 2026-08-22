from pathlib import Path

ledger = Path('docs/asset-provenance.md')
text = ledger.read_text()

explicit_anchor = '| `public/images/tasks/ban-phieng-loi-mthen.webp` | CLEARED | `public/images/tasks/provenance/ban-phieng-loi-mthen.json`; exact derivative SHA-256 `3e26ad89f336d3ef775c47340f1c2e3716331ea66df1889d6ca5353a1eabf440` regenerated from the Commons API-resolved canonical original SHA-256 `bd012e6907f077b4cb5f6126b34f7b963c6fbeb602377eb6b2b79de1b5767e40`. The source-discovery ledger identifies this as representative rather than an exact verified photograph of Bản Phiêng Lơi. | Adam Jones from Kelowna, BC, Canada; CC BY-SA 2.0; link the licence and indicate that the image was resized/re-encoded. Attribution/share-alike requirements apply. Rights clearance does not assert exact-location identity. |'
explicit_row = '| `public/images/tasks/thac-ke-nenh-mthen.webp` | CLEARED | `public/images/tasks/provenance/thac-ke-nenh-mthen.json`; exact derivative SHA-256 `ed3bae64bd8875b84d9aaabd1f744f72b87d0e9dfaf3ac4d29ab2fd2a468b7e8` regenerated from the Commons API-resolved canonical original SHA-256 `4f75305fd3c43da3b5522b728b8420f141a27472331d155562a32975476dee6b`. `SOURCES.md` contains a mismatched portal page URL; provenance is resolved directly to the Commons original and the source is representative rather than an exact verified photograph of Thác Kê Nênh. | Adam Jones from Kelowna, BC, Canada; CC BY-SA 2.0; link the licence and indicate that the image was resized/re-encoded. Attribution/share-alike requirements apply. Rights clearance does not assert exact-location identity. |'
if text.count(explicit_anchor) != 1:
    raise SystemExit(f'explicit anchor count={text.count(explicit_anchor)}')
if explicit_row in text:
    raise SystemExit('Ke Nenh explicit cleared row already present unexpectedly')
text = text.replace(explicit_anchor, explicit_anchor + '\n' + explicit_row)

old = '| `thac-ke-nenh-mthen` | Present, but source-page/direct-image evidence must be reconciled | UNVERIFIED | Identify the exact original before clearance. |'
new = '| `thac-ke-nenh-mthen` | Present; direct Commons source resolved via MediaWiki API, regenerated and hashed in dedicated provenance record; recorded portal page URL is not used as licence evidence | CLEARED | Keep `public/images/tasks/provenance/thac-ke-nenh-mthen.json` with the shipped binary; preserve Adam Jones / CC BY-SA 2.0 attribution, licence link, modification notice and share-alike terms. Public credit must disclose that this is a representative Mường Thanh panorama rather than an exact verified photograph of Thác Kê Nênh. |'
if text.count(old) != 1:
    raise SystemExit(f'FIELD row count={text.count(old)}')
text = text.replace(old, new)

old = '| `public/images/tasks/thac-ke-nenh-mthen.webp` | 10 | UNVERIFIED | Reconcile the exact binary/source, then clear editorial reuse and required attribution. |'
new = '| `public/images/tasks/thac-ke-nenh-mthen.webp` | 10 | CLEARED | Exact shipped derivative is covered by the dedicated provenance record and CC BY-SA 2.0 for FIELD plus BOOK/editorial reuse; retain attribution, licence link, modification notice and share-alike terms. This is a representative Mường Thanh panorama, not an exact verified photograph of Thác Kê Nênh, and public credit must retain that distinction. |'
if text.count(old) != 1:
    raise SystemExit(f'BOOK row count={text.count(old)}')
text = text.replace(old, new)
ledger.write_text(text)

credits = Path('src/data/assetCredits.ts')
text = credits.read_text()
credits_anchor = "  {\n    id: 'bao-tang-chien-thang-dien-bien-phu-trai-nghiem',"
credits_entry = """  {
    id: 'thac-ke-nenh-mthen',
    usage: { vi: 'Ảnh đại diện dùng cho Thác Kê Nênh / artwork chương', en: 'Representative image used for Ke Nenh waterfall / chapter artwork' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Panorama_of_Ricefields_in_Muong_Thanh_Valley_-_Dien_Bien_Phu_-_Vietnam_-_01_(48178533987).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship được tái tạo trong PR #83 từ canonical Commons original do MediaWiki API trả về, có hash nguồn/derivative và recipe trong release ledger. SOURCES.md có portal page URL không khớp; portal đó không được dùng làm bằng chứng licence. Nguồn Commons là ảnh đại diện Mường Thanh, không phải ảnh đã xác minh chính xác Thác Kê Nênh. CLEARED chỉ xác nhận quyền/provenance của binary. Ảnh đã được resize và re-encode sang WebP; CC BY-SA 2.0 và yêu cầu attribution/share-alike vẫn áp dụng.',
      en: 'The exact shipped binary was regenerated in PR #83 from the canonical Commons original returned by the MediaWiki API, with source/derivative hashes and the transform recipe recorded in the release ledger. SOURCES.md contains a mismatched portal page URL; that portal is not used as licence evidence. The Commons source is a representative Muong Thanh image, not an exact verified photograph of Ke Nenh waterfall. CLEARED covers rights/provenance for the binary only. The image was resized and re-encoded to WebP; CC BY-SA 2.0 attribution/share-alike terms still apply.',
    },
  },
"""
if "id: 'thac-ke-nenh-mthen'" in text:
    raise SystemExit('Ke Nenh Credits entry already present unexpectedly')
if text.count(credits_anchor) != 1:
    raise SystemExit(f'Credits anchor count={text.count(credits_anchor)}')
text = text.replace(credits_anchor, credits_entry + credits_anchor)
credits.write_text(text)
