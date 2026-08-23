export type AssetCreditStatus = 'cleared' | 'source-recorded' | 'pending';

export type AssetCredit = {
  id: string;
  usage: { vi: string; en: string };
  author: string;
  sourceUrl?: string;
  licenseName?: string;
  licenseUrl?: string;
  status: AssetCreditStatus;
  note?: { vi: string; en: string };
};

const cc = (version: '2.0' | '3.0' | '4.0') => ({
  licenseName: `CC BY-SA ${version}`,
  licenseUrl: `https://creativecommons.org/licenses/by-sa/${version}/`,
});

const sourceRecordedNote = {
  vi: 'Nguồn/licence candidate đã được ghi nhận; trạng thái này không đồng nghĩa asset đã CLEARED. Binary đang ship vẫn phải được đối chiếu với original theo release ledger.',
  en: 'A candidate source/licence is recorded; this does not mean the asset is CLEARED. The shipped binary still has to be reconciled to the original under the release ledger.',
};

export const ASSET_CREDITS: AssetCredit[] = [
  {
    id: 'quang-truong-7-5-mthen',
    usage: { vi: 'Ảnh đường phố Điện Biên Phủ đại diện dùng cho Quảng trường 7-5 / artwork chương', en: 'Representative Dien Bien Phu streetscape used for 7 May Square / chapter artwork' },
    author: 'Ioe2015',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:A_route_in_Dien_Bien_Phu.jpg',
    ...cc('4.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship được tái tạo trong PR #80 từ canonical Commons original do MediaWiki API trả về, có hash nguồn/derivative và recipe trong release ledger. Nguồn được ghi nhận là ảnh đại diện, không phải ảnh đã xác minh chính xác Quảng trường 7-5. CLEARED chỉ xác nhận quyền/provenance của binary. Ảnh đã được resize và re-encode sang WebP; CC BY-SA 4.0 và yêu cầu attribution/share-alike vẫn áp dụng.',
      en: 'The exact shipped binary was regenerated in PR #80 from the canonical Commons original returned by the MediaWiki API, with source/derivative hashes and the transform recipe recorded in the release ledger. The source is recorded as representative, not an exact verified photograph of 7 May Square. CLEARED covers rights/provenance for the binary only. The image was resized and re-encoded to WebP; CC BY-SA 4.0 attribution/share-alike terms still apply.',
    },
  },
  {
    id: 'cong-vien-vu-a-dinh-trai-ban',
    usage: { vi: 'Ảnh phong cảnh Điện Biên Phủ đại diện dùng cho Công viên Vừ A Dính', en: 'Representative Dien Bien Phu landscape used for Vu A Dinh Park' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Landscape_on_Edge_of_Dien_Bien_Phu_-_Vietnam_(48168741986).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship được tái tạo trong PR #86 từ canonical Commons original, có hash nguồn/derivative và recipe trong release ledger. Nguồn là ảnh phong cảnh Điện Biên Phủ mang tính đại diện, không phải ảnh đã xác minh chính xác Công viên Vừ A Dính. CLEARED chỉ xác nhận quyền/provenance của binary. Ảnh đã được resize và re-encode sang WebP; CC BY-SA 2.0 và yêu cầu attribution/share-alike vẫn áp dụng.',
      en: 'The exact shipped binary was regenerated in PR #86 from the canonical Commons original, with source/derivative hashes and the transform recipe recorded in the release ledger. The source is representative Dien Bien Phu landscape imagery, not an exact verified photograph of Vu A Dinh Park. CLEARED covers rights/provenance for the binary only. The image was resized and re-encoded to WebP; CC BY-SA 2.0 attribution/share-alike terms still apply.',
    },
  },
  {
    id: 'khu-du-lich-him-lam-trai-ban',
    usage: { vi: 'Ảnh phong cảnh Điện Biên Phủ đại diện dùng cho Khu du lịch Him Lam', en: 'Representative Dien Bien Phu landscape used for Him Lam tourism area' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Landscape_on_Edge_of_Dien_Bien_Phu_-_Vietnam_(48168741986).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship dùng lại chính derivative đã CLEARED của cong-vien-vu-a-dinh-trai-ban, giữ nguyên derivative SHA-256 bd98e37bb6ce763233a5cac4c6a83d6e652d34fe23722e3665c6f23e5d890a5d và source SHA-256 f5867f638f929b329ac04fef1a680d4861e1daa305a2f2aeabab74a263e4b35d. Nguồn Commons là ảnh phong cảnh Điện Biên Phủ mang tính đại diện, không phải ảnh đã xác minh chính xác Khu du lịch Him Lam. CLEARED chỉ xác nhận quyền/provenance của binary. CC BY-SA 2.0 và yêu cầu attribution/share-alike vẫn áp dụng.',
      en: 'The shipped binary reuses the exact already-CLEARED derivative from cong-vien-vu-a-dinh-trai-ban, preserving derivative SHA-256 bd98e37bb6ce763233a5cac4c6a83d6e652d34fe23722e3665c6f23e5d890a5d and source SHA-256 f5867f638f929b329ac04fef1a680d4861e1daa305a2f2aeabab74a263e4b35d. The Commons source is representative Dien Bien Phu landscape imagery, not an exact verified photograph of Him Lam tourism area. CLEARED covers rights/provenance for the binary only. CC BY-SA 2.0 attribution/share-alike terms still apply.',
    },
  },
  {
    id: 'cong-vien-noong-bua-mthen',
    usage: { vi: 'Ảnh đồng quê Điện Biên Phủ đại diện dùng cho Công viên Noong Bua', en: 'Representative Dien Bien Phu countryside used for Noong Bua Park' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Countryside_on_Edge_of_Town_-_Dien_Bien_Phu_-_Vietnam_(48159158386).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship được tái tạo trong PR #87 từ canonical Commons original do MediaWiki API trả về, có hash nguồn/derivative và recipe trong release ledger. Nguồn là ảnh đồng quê Điện Biên Phủ mang tính đại diện, không phải ảnh đã xác minh chính xác Công viên Noong Bua. CLEARED chỉ xác nhận quyền/provenance của binary. Ảnh đã được resize và re-encode sang WebP; CC BY-SA 2.0 và yêu cầu attribution/share-alike vẫn áp dụng.',
      en: 'The exact shipped binary was regenerated in PR #87 from the canonical Commons original returned by the MediaWiki API, with source/derivative hashes and the transform recipe recorded in the release ledger. The source is representative Dien Bien Phu countryside imagery, not an exact verified photograph of Noong Bua Park. CLEARED covers rights/provenance for the binary only. The image was resized and re-encoded to WebP; CC BY-SA 2.0 attribution/share-alike terms still apply.',
    },
  },
  {
    id: 'ho-huoi-pha-mthen',
    usage: { vi: 'Ảnh sông Điện Biên Phủ đại diện dùng cho Hồ Huổi Phạ', en: 'Representative Dien Bien Phu river scenery used for Ho Huoi Pha' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ron_River_View_-_Dien_Bien_Phu_-_Vietnam_(48159135931).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship được tái tạo từ canonical Commons original do MediaWiki API trả về, có hash nguồn/derivative và recipe trong release ledger. Nguồn là ảnh sông ở Điện Biên Phủ mang tính đại diện, không phải ảnh đã xác minh chính xác Hồ Huổi Phạ. CLEARED chỉ xác nhận quyền/provenance của binary. Ảnh đã được resize và re-encode sang WebP; CC BY-SA 2.0 và yêu cầu attribution/share-alike vẫn áp dụng.',
      en: 'The exact shipped binary was regenerated from the canonical Commons original returned by the MediaWiki API, with source/derivative hashes and the transform recipe recorded in the release ledger. The source is representative Dien Bien Phu river scenery, not an exact verified photograph of Ho Huoi Pha. CLEARED covers rights/provenance for the binary only. The image was resized and re-encoded to WebP; CC BY-SA 2.0 attribution/share-alike terms still apply.',
    },
  },
  {
    id: 'cho-noong-bua-trai-ban',
    usage: { vi: 'Ảnh Chợ Noong Bua / artwork chương', en: 'Noong Bua Market / chapter artwork' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Woman_Market_Vendor_-_Dien_Bien_Phu_-_Vietnam_-_01_(48178458016).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship được tái tạo trong PR #78 từ canonical Commons original do MediaWiki API trả về, có hash nguồn/derivative và recipe trong release ledger. Ảnh đã được resize và re-encode sang WebP; CC BY-SA 2.0 và yêu cầu attribution/share-alike vẫn áp dụng.',
      en: 'The exact shipped binary was regenerated in PR #78 from the canonical Commons original returned by the MediaWiki API, with source/derivative hashes and the transform recipe recorded in the release ledger. The image was resized and re-encoded to WebP; CC BY-SA 2.0 attribution/share-alike terms still apply.',
    },
  },
  {
    id: 'cho-muong-nhe-tang-banh-trung-thu',
    usage: { vi: 'Ảnh chợ Điện Biên Phủ đại diện dùng cho Chợ Mường Nhé', en: 'Representative Dien Bien Phu market imagery used for Muong Nhe Market' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Woman_Market_Vendor_-_Dien_Bien_Phu_-_Vietnam_-_01_(48178458016).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship dùng lại chính derivative đã CLEARED của cho-noong-bua-trai-ban, giữ nguyên derivative SHA-256 896a08a76d799fbec62eadcf6499ad23e17f75fce21a448de16009664a363afa và source SHA-256 de13be5adf356660524c06f8b063d852bd1bf2d019a0d61dddd92d6319dee05c. Derivative này đã được resize theo tỷ lệ xuống chiều rộng 1920 px bằng Lanczos và re-encode thành lossy WebP trong PR #78. Đây là ảnh chợ Điện Biên Phủ mang tính đại diện, không phải ảnh đã xác minh chính xác Chợ Mường Nhé. CLEARED chỉ xác nhận quyền/provenance của exact shipped binary. CC BY-SA 2.0 yêu cầu ghi công, liên kết giấy phép, nêu thay đổi và tuân thủ share-alike.',
      en: 'The shipped binary reuses the exact already-CLEARED derivative from cho-noong-bua-trai-ban, preserving derivative SHA-256 896a08a76d799fbec62eadcf6499ad23e17f75fce21a448de16009664a363afa and source SHA-256 de13be5adf356660524c06f8b063d852bd1bf2d019a0d61dddd92d6319dee05c. This derivative was proportionally resized to 1920 px width with Lanczos filtering and re-encoded as lossy WebP in PR #78. It is representative Dien Bien Phu market imagery, not an exact verified photograph of Muong Nhe Market. CLEARED covers rights/provenance for the exact shipped binary only. CC BY-SA 2.0 requires attribution, a licence link, change notice, and share-alike.',
    },
  },
  {
    id: 'cau-ta-ko-khu-tang-banh-trung-thu',
    usage: { vi: 'Ảnh sông Điện Biên Phủ đại diện dùng cho Cầu Tả Kó Khừ', en: 'Representative Dien Bien Phu river scenery used for Ta Ko Khu bridge' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ron_River_View_-_Dien_Bien_Phu_-_Vietnam_(48159135931).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship dùng lại chính derivative đã CLEARED của ho-huoi-pha-mthen, giữ nguyên derivative SHA-256 77ca90a38d4b1632a777e1d605eab6f6a81c05dd309358ead55e357d6c579989 và source SHA-256 a229af8197b17851420e8ff3b02119083e0619b28ae711f2b2a1c84a2d109f6f. Derivative này đã được resize theo tỷ lệ xuống chiều rộng 1920 px bằng Lanczos và re-encode thành lossy WebP. Đây là ảnh sông Điện Biên Phủ mang tính đại diện, không phải ảnh đã xác minh chính xác Cầu Tả Kó Khừ. CLEARED chỉ xác nhận quyền/provenance của exact shipped binary. CC BY-SA 2.0 yêu cầu ghi công, liên kết giấy phép, nêu thay đổi và tuân thủ share-alike.',
      en: 'The shipped binary reuses the exact already-CLEARED derivative from ho-huoi-pha-mthen, preserving derivative SHA-256 77ca90a38d4b1632a777e1d605eab6f6a81c05dd309358ead55e357d6c579989 and source SHA-256 a229af8197b17851420e8ff3b02119083e0619b28ae711f2b2a1c84a2d109f6f. This derivative was proportionally resized to 1920 px width with Lanczos filtering and re-encoded as lossy WebP. It is representative Dien Bien Phu river scenery, not an exact verified photograph of Ta Ko Khu bridge. CLEARED covers rights/provenance for the exact shipped binary only. CC BY-SA 2.0 requires attribution, a licence link, change notice, and share-alike.',
    },
  },
  {
    id: 'canh-dong-muong-thanh-cat-banh',
    usage: { vi: 'Ảnh Cánh đồng Mường Thanh / artwork chương', en: 'Muong Thanh Field / chapter artwork' },
    author: 'Adam Jones',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Panorama_of_Ricefields_in_Muong_Thanh_Valley_-_Dien_Bien_Phu_-_Vietnam_-_02_(48178461326).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship được tái tạo trong PR #77 từ Commons original đã xác minh, có hash nguồn/derivative và recipe trong release ledger. Ảnh đã được resize và re-encode sang WebP; CC BY-SA 2.0 và yêu cầu attribution/share-alike vẫn áp dụng.',
      en: 'The exact shipped binary was regenerated in PR #77 from the verified Commons original, with source/derivative hashes and the transform recipe recorded in the release ledger. The image was resized and re-encoded to WebP; CC BY-SA 2.0 attribution/share-alike terms still apply.',
    },
  },
  {
    id: 'cong-vien-hoa-ban-mthen',
    usage: { vi: 'Ảnh đại diện dùng cho Công viên Hoa Ban / artwork chương', en: 'Representative image used for Ban Flower Park / chapter artwork' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Traditional_Thai_Dam_House_-_Muong_Thanh_Valley_-_Dien_Bien_Phu_-_Vietnam_-_01_(48178539312).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship được tái tạo trong PR #81 từ canonical Commons original do MediaWiki API trả về, có hash nguồn/derivative và recipe trong release ledger. Nguồn được ghi nhận là ảnh đại diện, không phải ảnh đã xác minh chính xác Công viên Hoa Ban. CLEARED chỉ xác nhận quyền/provenance của binary. Ảnh đã được resize và re-encode sang WebP; CC BY-SA 2.0 và yêu cầu attribution/share-alike vẫn áp dụng.',
      en: 'The exact shipped binary was regenerated in PR #81 from the canonical Commons original returned by the MediaWiki API, with source/derivative hashes and the transform recipe recorded in the release ledger. The source is recorded as representative, not an exact verified photograph of Ban Flower Park. CLEARED covers rights/provenance for the binary only. The image was resized and re-encoded to WebP; CC BY-SA 2.0 attribution/share-alike terms still apply.',
    },
  },
  {
    id: 'doi-a1-khoanh-khac-tuong-niem',
    usage: { vi: 'Ảnh Đồi A1 / artwork chương', en: 'Hill A1 / chapter artwork' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:French_Barbed-Wire_Emplacement_at_Hill_A1_(Eliane_2)_-_Dien_Bien_Phu_-_Vietnam_(48168745081).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship được tái tạo trong PR #79 từ canonical Commons original do MediaWiki API trả về, có hash nguồn/derivative và recipe trong release ledger. Ảnh đã được resize và re-encode sang WebP; CC BY-SA 2.0 và yêu cầu attribution/share-alike vẫn áp dụng.',
      en: 'The exact shipped binary was regenerated in PR #79 from the canonical Commons original returned by the MediaWiki API, with source/derivative hashes and the transform recipe recorded in the release ledger. The image was resized and re-encoded to WebP; CC BY-SA 2.0 attribution/share-alike terms still apply.',
    },
  },
  {
    id: 'ban-phieng-loi-mthen',
    usage: { vi: 'Ảnh đại diện dùng cho Bản Phiêng Lơi / artwork chương', en: 'Representative image used for Phieng Loi village / chapter artwork' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Traditional_Thai_Dam_House_-_Muong_Thanh_Valley_-_Dien_Bien_Phu_-_Vietnam_-_02_(48178530927).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship được tái tạo trong PR #82 từ canonical Commons original do MediaWiki API trả về, có hash nguồn/derivative và recipe trong release ledger. Nguồn được ghi nhận là ảnh đại diện, không phải ảnh đã xác minh chính xác Bản Phiêng Lơi. CLEARED chỉ xác nhận quyền/provenance của binary. Ảnh đã được resize và re-encode sang WebP; CC BY-SA 2.0 và yêu cầu attribution/share-alike vẫn áp dụng.',
      en: 'The exact shipped binary was regenerated in PR #82 from the canonical Commons original returned by the MediaWiki API, with source/derivative hashes and the transform recipe recorded in the release ledger. The source is recorded as representative, not an exact verified photograph of Phieng Loi village. CLEARED covers rights/provenance for the binary only. The image was resized and re-encoded to WebP; CC BY-SA 2.0 attribution/share-alike terms still apply.',
    },
  },
  {
    id: 'ca-phe-ke-nenh-cat-banh',
    usage: { vi: 'Ảnh Mường Thanh đại diện dùng cho Cà phê Kê Nênh', en: 'Representative Muong Thanh scenery used for Ke Nenh cafe' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Panorama_of_Ricefields_in_Muong_Thanh_Valley_-_Dien_Bien_Phu_-_Vietnam_-_01_(48178533987).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship dùng lại chính derivative đã CLEARED của thac-ke-nenh-mthen, nên giữ nguyên derivative SHA-256 ed3bae64bd8875b84d9aaabd1f744f72b87d0e9dfaf3ac4d29ab2fd2a468b7e8 và source SHA-256 4f75305fd3c43da3b5522b728b8420f141a27472331d155562a32975476dee6b. Nguồn Commons là ảnh panorama Mường Thanh mang tính đại diện, không phải ảnh đã xác minh chính xác Cà phê Kê Nênh. CLEARED chỉ xác nhận quyền/provenance của binary. CC BY-SA 2.0 và yêu cầu attribution/share-alike vẫn áp dụng.',
      en: 'The shipped binary reuses the exact already-CLEARED derivative from thac-ke-nenh-mthen, preserving derivative SHA-256 ed3bae64bd8875b84d9aaabd1f744f72b87d0e9dfaf3ac4d29ab2fd2a468b7e8 and source SHA-256 4f75305fd3c43da3b5522b728b8420f141a27472331d155562a32975476dee6b. The Commons source is representative Muong Thanh panorama imagery, not an exact verified photograph of Ke Nenh cafe. CLEARED covers rights/provenance for the binary only. CC BY-SA 2.0 attribution/share-alike terms still apply.',
    },
  },
  {
    id: 'phadin-coffee-cat-banh',
    usage: { vi: 'Ảnh Mường Thanh đại diện dùng cho PhaDin Coffee', en: 'Representative Muong Thanh scenery used for PhaDin Coffee' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Panorama_of_Ricefields_in_Muong_Thanh_Valley_-_Dien_Bien_Phu_-_Vietnam_-_01_(48178533987).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship dùng lại chính derivative đã CLEARED của ca-phe-ke-nenh-cat-banh, giữ nguyên derivative SHA-256 ed3bae64bd8875b84d9aaabd1f744f72b87d0e9dfaf3ac4d29ab2fd2a468b7e8 và source SHA-256 4f75305fd3c43da3b5522b728b8420f141a27472331d155562a32975476dee6b. Derivative này đã được resize theo tỷ lệ xuống chiều rộng 2560 px bằng Lanczos và re-encode thành lossy WebP. Đây là ảnh panorama Mường Thanh mang tính đại diện, không phải ảnh đã xác minh chính xác PhaDin Coffee. CLEARED chỉ xác nhận quyền/provenance của exact shipped binary. CC BY-SA 2.0 yêu cầu ghi công, liên kết giấy phép, nêu thay đổi và tuân thủ share-alike.',
      en: 'The shipped binary reuses the exact already-CLEARED derivative from ca-phe-ke-nenh-cat-banh, preserving derivative SHA-256 ed3bae64bd8875b84d9aaabd1f744f72b87d0e9dfaf3ac4d29ab2fd2a468b7e8 and source SHA-256 4f75305fd3c43da3b5522b728b8420f141a27472331d155562a32975476dee6b. This derivative was proportionally resized to 2560 px width with Lanczos filtering and re-encoded as lossy WebP. It is representative Muong Thanh Valley scenery, not an exact verified photograph of PhaDin Coffee. CLEARED covers rights/provenance for the exact shipped binary only. CC BY-SA 2.0 requires attribution, a licence link, change notice, and share-alike.',
    },
  },
  {
    id: 'ruong-bac-thang-ta-leng-mthen',
    usage: { vi: 'Ảnh Mường Thanh đại diện dùng cho Ruộng bậc thang Tả Lèng', en: 'Representative Muong Thanh scenery used for Ta Leng terraced fields' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Panorama_of_Ricefields_in_Muong_Thanh_Valley_-_Dien_Bien_Phu_-_Vietnam_-_01_(48178533987).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship dùng lại chính derivative đã CLEARED của thac-ke-nenh-mthen, giữ nguyên derivative SHA-256 ed3bae64bd8875b84d9aaabd1f744f72b87d0e9dfaf3ac4d29ab2fd2a468b7e8 và source SHA-256 4f75305fd3c43da3b5522b728b8420f141a27472331d155562a32975476dee6b. SOURCES.md có portal page URL không khớp với direct Commons work; portal đó không được dùng làm bằng chứng licence. Nguồn Commons là ảnh panorama Mường Thanh mang tính đại diện, không phải ảnh đã xác minh chính xác Ruộng bậc thang Tả Lèng. CLEARED chỉ xác nhận quyền/provenance của binary. CC BY-SA 2.0 và yêu cầu attribution/share-alike vẫn áp dụng.',
      en: 'The shipped binary reuses the exact already-CLEARED derivative from thac-ke-nenh-mthen, preserving derivative SHA-256 ed3bae64bd8875b84d9aaabd1f744f72b87d0e9dfaf3ac4d29ab2fd2a468b7e8 and source SHA-256 4f75305fd3c43da3b5522b728b8420f141a27472331d155562a32975476dee6b. SOURCES.md has a portal page URL that does not identify the direct Commons work; that portal is not used as licence evidence. The Commons source is representative Muong Thanh panorama imagery, not an exact verified photograph of Ta Leng terraced fields. CLEARED covers rights/provenance for the binary only. CC BY-SA 2.0 attribution/share-alike terms still apply.',
    },
  },
  {
    id: 'ho-pa-khoang-trai-ban',
    usage: { vi: 'Ảnh Mường Thanh đại diện dùng cho Hồ Pá Khoang', en: 'Representative Muong Thanh scenery used for Ho Pa Khoang' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Panorama_of_Ricefields_in_Muong_Thanh_Valley_-_Dien_Bien_Phu_-_Vietnam_-_01_(48178533987).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship dùng lại chính derivative đã CLEARED của thac-ke-nenh-mthen, giữ nguyên derivative SHA-256 ed3bae64bd8875b84d9aaabd1f744f72b87d0e9dfaf3ac4d29ab2fd2a468b7e8 và source SHA-256 4f75305fd3c43da3b5522b728b8420f141a27472331d155562a32975476dee6b. Derivative này đã được resize theo tỷ lệ xuống chiều rộng 2560 px và re-encode thành lossy WebP. SOURCES.md ghi một candidate khác; release này cố ý thay candidate chưa được reconcile đó bằng exact cleared derivative. Nguồn Commons là ảnh panorama Mường Thanh mang tính đại diện, không phải ảnh đã xác minh chính xác Hồ Pá Khoang. CLEARED chỉ xác nhận quyền/provenance của exact shipped binary. CC BY-SA 2.0 và yêu cầu attribution/share-alike vẫn áp dụng.',
      en: 'The shipped binary reuses the exact already-CLEARED derivative from thac-ke-nenh-mthen, preserving derivative SHA-256 ed3bae64bd8875b84d9aaabd1f744f72b87d0e9dfaf3ac4d29ab2fd2a468b7e8 and source SHA-256 4f75305fd3c43da3b5522b728b8420f141a27472331d155562a32975476dee6b. This derivative was proportionally resized to 2560 px width and re-encoded as lossy WebP. SOURCES.md records a different candidate; this release intentionally replaces that unreconciled candidate with the exact cleared derivative. The Commons source is representative Muong Thanh Valley panorama imagery, not an exact verified photograph of Ho Pa Khoang. CLEARED covers rights/provenance for the exact shipped binary only. CC BY-SA 2.0 attribution/share-alike terms still apply.',
    },
  },
  {
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
  {
    id: 'cot-co-a-pa-chai',
    usage: { vi: 'Ảnh đại diện dùng cho ba thử thách A Pa Chải / artwork chương 12', en: 'Representative image used for three A Pa Chai challenges / Chapter 12 artwork' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Facade_of_Traditional_Wooden_House_-_Dien_Bien_Phu_-_Vietnam_(48178462826).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship được tái tạo trong PR #85 từ canonical Commons original do MediaWiki API trả về, có hash nguồn/derivative và recipe trong release ledger. Đây là ảnh đại diện về nhà truyền thống / Điện Biên Phủ, không phải ảnh đã xác minh chính xác Cột cờ hoặc Bản A Pa Chải. CLEARED chỉ xác nhận quyền/provenance của binary. Ảnh đã được resize và re-encode sang WebP; CC BY-SA 2.0 và yêu cầu attribution/share-alike vẫn áp dụng.',
      en: 'The exact shipped binary was regenerated in PR #85 from the canonical Commons original returned by the MediaWiki API, with source/derivative hashes and the transform recipe recorded in the release ledger. This is representative traditional-house / Dien Bien Phu imagery, not an exact verified photograph of A Pa Chai Flag Tower or Village. CLEARED covers rights/provenance for the binary only. The image was resized and re-encoded to WebP; CC BY-SA 2.0 attribution/share-alike terms still apply.',
    },
  },
  {
    id: 'bao-tang-chien-thang-dien-bien-phu-trai-nghiem',
    usage: { vi: 'Ảnh Bảo tàng Chiến thắng Điện Biên Phủ / artwork chương', en: 'Dien Bien Phu Victory Museum / chapter artwork' },
    author: 'Trung tâm Thông tin Xúc tiến Du lịch tỉnh Điện Biên (portal operator)',
    sourceUrl: 'https://dulichdienbien.vietnaminfo.net/vi/place/details/bao-tang-chien-thang-dien-bien-phu-6',
    status: 'pending',
    note: { vi: 'Đã có nguồn candidate nhưng chưa có căn cứ reuse licence/permission đủ để clearance.', en: 'A candidate source is recorded, but sufficient reuse licence/permission is not yet documented for clearance.' },
  },
  {
    id: 'book-native-chapter-01',
    usage: { vi: 'Ảnh Book-native Chapter 01', en: 'Chapter 01 Book-native images' },
    author: 'Đang xác minh',
    status: 'pending',
    note: { vi: 'Chưa có record creator/source/permission cho exact shipped work.', en: 'Creator/source/permission is not yet recorded for the exact shipped work.' },
  },
  {
    id: 'chapter-13-night-hero',
    usage: { vi: 'Ảnh hero Chapter 13', en: 'Chapter 13 hero image' },
    author: 'Đang xác minh',
    status: 'pending',
    note: { vi: 'Asset có watermark baodienbienphu.com.vn và vẫn BLOCKED trong release ledger cho tới khi có permission phù hợp hoặc ảnh thay thế đã clearance.', en: 'The asset carries a baodienbienphu.com.vn watermark and remains BLOCKED in the release ledger until suitable permission is documented or a cleared replacement is used.' },
  },
  {
    id: 'chapter-13-challenge-cover',
    usage: { vi: 'Cover Challenge Chapter 13', en: 'Chapter 13 Challenge cover' },
    author: 'Đang xác minh',
    status: 'pending',
    note: { vi: 'Chưa có record creator/source/licence cho exact shipped cover.', en: 'Creator/source/licence is not yet recorded for the exact shipped cover.' },
  },
];