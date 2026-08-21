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
    usage: { vi: 'Ảnh Công viên Vừ A Dính', en: 'Vu A Dinh Park image' },
    author: 'Adam Jones',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Landscape_on_Edge_of_Dien_Bien_Phu_-_Vietnam_(48168741986).jpg',
    ...cc('2.0'),
    status: 'source-recorded',
    note: sourceRecordedNote,
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
    usage: { vi: 'Ảnh Bản Phiêng Lơi / artwork chương', en: 'Phieng Loi village / chapter artwork' },
    author: 'Adam Jones',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Traditional_Thai_Dam_House_-_Muong_Thanh_Valley_-_Dien_Bien_Phu_-_Vietnam_-_02_(48178530927).jpg',
    ...cc('2.0'),
    status: 'source-recorded',
    note: sourceRecordedNote,
  },
  {
    id: 'ca-phe-ke-nenh-cat-banh',
    usage: { vi: 'Ảnh Cà phê Kê Nênh', en: 'Ke Nenh cafe image' },
    author: 'Adam Jones',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Panorama_of_Ricefields_in_Muong_Thanh_Valley_-_Dien_Bien_Phu_-_Vietnam_-_01_(48178533987).jpg',
    ...cc('2.0'),
    status: 'source-recorded',
    note: sourceRecordedNote,
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
