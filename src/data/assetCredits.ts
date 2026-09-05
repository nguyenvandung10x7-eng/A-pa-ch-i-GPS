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

export const ASSET_CREDITS: AssetCredit[] = [
  {
    id: 'dien-bien-city-atlas-v4',
    usage: {
      vi: 'Ảnh nền atlas thành phố trên màn hình Khám phá',
      en: 'City atlas background on the Explore screen',
    },
    author: 'Generated for Book of Dien Bien',
    status: 'cleared',
    note: {
      vi: 'Vẽ mới hoàn toàn theo phong cách diorama game, dùng ảnh toàn cảnh có chú thích do chủ dự án cung cấp để giữ tương quan giữa Tượng đài Chiến thắng trên Đồi D1, Đồi A1, nghĩa trang A1, Bảo tàng Chiến thắng, sân vận động, các cầu và sông Nậm Rốm. Ảnh nền chỉ định hướng thị giác; vị trí pin thử thách được tính riêng từ GPS thật trong ứng dụng.',
      en: 'Redrawn from scratch as a game diorama, using an annotated aerial overview supplied by the project owner to preserve the relationship between the D1 Victory Monument, A1 Hill, A1 cemetery, the Victory Museum, the stadium, bridges, and the Nam Rom river. The background is a visual orientation layer; challenge pins are positioned separately from real GPS data in the app.',
    },
  },
  {
    id: 'challenge-generated-illustrations',
    usage: {
      vi: 'Tranh minh họa cho thử thách để xe qua đêm, ngắm lòng chảo và tìm cây xoài cổ thụ',
      en: 'Illustrations for the overnight motorbike, valley viewpoint, and old mango tree challenges',
    },
    author: 'Generated for Book of Dien Bien',
    status: 'cleared',
    note: {
      vi: 'Hai tranh được tái sử dụng từ bộ Book v3 và một tranh cây xoài được tạo mới theo cùng phong cách 3D phiêu lưu. Đây là minh họa cảm xúc, không phải ảnh tư liệu hay xác nhận chính xác địa điểm.',
      en: 'Two artworks are reused from the Book v3 set and one mango-tree artwork was newly generated in the same 3D adventure style. These are mood illustrations, not documentary or exact-location evidence.',
    },
  },
  {
    id: 'challenge-level-one-character-illustrations',
    usage: {
      vi: 'Hai tranh nhân vật cho thử thách hát Quốc ca và “Cô gái đẹp Mường Then” tại Quảng trường 7-5',
      en: 'Two character illustrations for the anthem and “Beautiful Mường Then Girl” challenges at 7 May Square',
    },
    author: 'Generated for Book of Dien Bien',
    status: 'cleared',
    note: {
      vi: 'Tranh được tạo riêng bằng OpenAI built-in image generation. Bối cảnh quảng trường được hư cấu theo không khí một đô thị vùng cao; nhân vật không đại diện cho người thật. Đây là minh họa hài hước, không phải ảnh tư liệu, ảnh xác minh địa điểm hay ghi nhận một sự kiện có thật.',
      en: 'Created specifically with OpenAI built-in image generation. The square is a fictional highland-city setting and the people do not represent real individuals. These are humorous illustrations, not documentary photography, location verification, or records of real events.',
    },
  },
  {
    id: 'quan-com-hung-ha-thuoc-lao-free',
    usage: {
      vi: 'Ảnh thử thách tại Quán cơm Hưng Hà',
      en: 'Challenge image for Hưng Hà Eatery',
    },
    author: 'Ảnh do chủ dự án cung cấp',
    status: 'source-recorded',
    note: {
      vi: 'Ảnh được chủ dự án tải lên và chỉ định trực tiếp cho nhiệm vụ này. Ảnh đã được dàn lại trên khung 4:3 bằng nền mờ lấy từ chính ảnh gốc; tác giả và điều khoản phân phối công khai chưa được xác minh độc lập.',
      en: 'The project owner uploaded and directly assigned this photograph to the challenge. It was fitted to a 4:3 frame using a blurred background derived from the same source; authorship and public redistribution terms were not independently verified.',
    },
  },
  {
    id: 'book-v3-generated-illustrations',
    usage: {
      vi: 'Bộ 16 tranh minh họa mới cho 13 chương của Book',
      en: 'Set of 16 new illustrations for the Book’s 13 chapters',
    },
    author: 'Generated for Book of Dien Bien',
    status: 'cleared',
    note: {
      vi: 'Tranh được tạo riêng như một bộ minh họa văn chương; từng trang có thể dùng xử lý 3D mềm, vintage hoặc tái dựng lịch sử tùy ký ức được kể. Đây không phải ảnh tư liệu hay ảnh chụp xác nhận chính xác địa điểm hoặc thời kỳ.',
      en: 'Created specifically as a literary illustration set, with soft 3D, vintage, or historical-reconstruction treatments selected for each memory. These are not documentary photographs or exact evidence of a location or period.',
    },
  },
  {
    id: 'quang-truong-7-5-mthen',
    usage: { vi: 'Ảnh đường phố Điện Biên Phủ đại diện dùng cho thẻ “Trong thành phố” và artwork chương', en: 'Representative Dien Bien Phu streetscape used for the “In the City” card and chapter artwork' },
    author: 'Ioe2015',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:A_route_in_Dien_Bien_Phu.jpg',
    ...cc('4.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship được tái tạo trong PR #80 từ canonical Commons original do MediaWiki API trả về, có hash nguồn/derivative và recipe trong release ledger. Nguồn được ghi nhận là ảnh đường phố Điện Biên Phủ mang tính đại diện, không phải ảnh đã xác minh chính xác thẻ trải nghiệm hoặc bối cảnh chương. CLEARED chỉ xác nhận quyền/provenance của binary. Ảnh đã được resize và re-encode sang WebP; CC BY-SA 4.0 và yêu cầu attribution/share-alike vẫn áp dụng.',
      en: 'The exact shipped binary was regenerated in PR #80 from the canonical Commons original returned by the MediaWiki API, with source/derivative hashes and the transform recipe recorded in the release ledger. The source is representative Dien Bien Phu streetscape imagery, not an exact verified photograph of the experience card or chapter setting. CLEARED covers rights/provenance for the binary only. The image was resized and re-encoded to WebP; CC BY-SA 4.0 attribution/share-alike terms still apply.',
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
    usage: { vi: 'Tranh minh họa riêng cho thử thách Cầu Tả Kó Khừ', en: 'Purpose-built illustration for the Ta Ko Khu bridge challenge' },
    author: 'Generated for Book of Dien Bien',
    status: 'cleared',
    note: {
      vi: 'Tranh AI được tạo riêng sau khi đối chiếu điểm GPS hiện có bằng ảnh vệ tinh và ảnh 360°: cầu bê tông có lan can đỏ-trắng, lòng suối đá hẹp, bản nhỏ và sườn núi rừng bao quanh. Đây là diễn giải thị giác, không phải ảnh chụp tư liệu hoặc bằng chứng nhận dạng chính xác hiện trạng.',
      en: 'Purpose-built AI artwork created after checking the existing GPS point against satellite and 360° imagery: a concrete bridge with red-and-white parapets, a narrow rocky stream, a sparse village, and enclosing forested slopes. It is a visual interpretation, not documentary photography or evidence of exact present-day conditions.',
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
    usage: { vi: 'Ảnh di tích lịch sử Điện Biên Phủ đại diện dùng cho Bảo tàng Chiến thắng Điện Biên Phủ / artwork chương 09', en: 'Representative Dien Bien Phu historical-site imagery used for the Victory Museum / Chapter 09 artwork' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:French_Barbed-Wire_Emplacement_at_Hill_A1_(Eliane_2)_-_Dien_Bien_Phu_-_Vietnam_(48168745081).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Exact binary đang ship dùng lại chính derivative đã CLEARED của doi-a1-khoanh-khac-tuong-niem, giữ nguyên derivative SHA-256 7343a06c68b0f0b7b18b06e3c6fa76bebc1bd0c127d9ad265b5b7537e85f1efc và source SHA-256 02a10ea62b66087b1c7fb2884d975ff217b780485197b7e476dbc8328a80edfc. Derivative đã được resize theo tỷ lệ xuống chiều rộng 1920 px bằng Lanczos và re-encode thành lossy WebP. Đây là ảnh di tích lịch sử Điện Biên Phủ mang tính đại diện, không phải ảnh đã xác minh chính xác Bảo tàng Chiến thắng Điện Biên Phủ. CLEARED chỉ xác nhận quyền/provenance của exact shipped binary. CC BY-SA 2.0 yêu cầu ghi công, liên kết giấy phép, nêu thay đổi và tuân thủ share-alike.',
      en: 'The shipped binary reuses the exact already-CLEARED derivative from doi-a1-khoanh-khac-tuong-niem, preserving derivative SHA-256 7343a06c68b0f0b7b18b06e3c6fa76bebc1bd0c127d9ad265b5b7537e85f1efc and source SHA-256 02a10ea62b66087b1c7fb2884d975ff217b780485197b7e476dbc8328a80edfc. This derivative was proportionally resized to 1920 px width with Lanczos filtering and re-encoded as lossy WebP. It is representative Dien Bien Phu historical-site imagery, not an exact verified photograph of the Dien Bien Phu Victory Museum. CLEARED covers rights/provenance for the exact shipped binary only. CC BY-SA 2.0 requires attribution, a licence link, change notice, and share-alike.',
    },
  },
  {
    id: 'chapter-01-river-hero',
    usage: { vi: 'Ảnh sông Điện Biên Phủ đại diện dùng cho Chapter 01 / Nậm Rốm', en: 'Representative Dien Bien Phu river imagery used for Chapter 01 / Nam Rom' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ron_River_View_-_Dien_Bien_Phu_-_Vietnam_(48159135931).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Chapter 01 dùng lại exact binary đã CLEARED của ho-huoi-pha-mthen, giữ nguyên derivative SHA-256 77ca90a38d4b1632a777e1d605eab6f6a81c05dd309358ead55e357d6c579989 và source SHA-256 a229af8197b17851420e8ff3b02119083e0619b28ae711f2b2a1c84a2d109f6f. Derivative đã được resize theo tỷ lệ xuống chiều rộng 1920 px bằng Lanczos và re-encode thành lossy WebP. Đây là ảnh sông Điện Biên Phủ mang tính đại diện, không phải ảnh đã xác minh chính xác sông Nậm Rốm. CLEARED chỉ xác nhận quyền/provenance của exact shipped binary. CC BY-SA 2.0 yêu cầu ghi công, liên kết giấy phép, nêu thay đổi và tuân thủ share-alike.',
      en: 'Chapter 01 reuses the exact already-CLEARED ho-huoi-pha-mthen binary, preserving derivative SHA-256 77ca90a38d4b1632a777e1d605eab6f6a81c05dd309358ead55e357d6c579989 and source SHA-256 a229af8197b17851420e8ff3b02119083e0619b28ae711f2b2a1c84a2d109f6f. The derivative was proportionally resized to 1920 px width with Lanczos filtering and re-encoded as lossy WebP. It is representative Dien Bien Phu river scenery, not an exact verified photograph of the Nam Rom River. CLEARED covers rights/provenance for the exact shipped binary only. CC BY-SA 2.0 requires attribution, a licence link, change notice, and share-alike.',
    },
  },
  {
    id: 'chapter-01-riverside-inline',
    usage: { vi: 'Ảnh đồng quê Điện Biên Phủ đại diện dùng cho ảnh inline Chapter 01', en: 'Representative Dien Bien Phu countryside used for the Chapter 01 inline image' },
    author: 'Adam Jones from Kelowna, BC, Canada',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Countryside_on_Edge_of_Town_-_Dien_Bien_Phu_-_Vietnam_(48159158386).jpg',
    ...cc('2.0'),
    status: 'cleared',
    note: {
      vi: 'Chapter 01 dùng lại exact binary đã CLEARED của cong-vien-noong-bua-mthen, giữ nguyên derivative SHA-256 f4de30aefc77c8bd931d23535bdf23d58edb687121bf723e37e314d687995ba9 và source SHA-256 7d4da0163722a473ce7b104cae0dcfd4d055557c2164b746c8ca8ac961cdf4d2. Derivative đã được resize theo tỷ lệ xuống chiều rộng 1920 px bằng Lanczos và re-encode thành lossy WebP. Đây là ảnh đồng quê Điện Biên Phủ mang tính đại diện cho không gian ven sông, không phải ảnh đã xác minh chính xác sông Nậm Rốm. CLEARED chỉ xác nhận quyền/provenance của exact shipped binary. CC BY-SA 2.0 yêu cầu ghi công, liên kết giấy phép, nêu thay đổi và tuân thủ share-alike.',
      en: 'Chapter 01 reuses the exact already-CLEARED cong-vien-noong-bua-mthen binary, preserving derivative SHA-256 f4de30aefc77c8bd931d23535bdf23d58edb687121bf723e37e314d687995ba9 and source SHA-256 7d4da0163722a473ce7b104cae0dcfd4d055557c2164b746c8ca8ac961cdf4d2. The derivative was proportionally resized to 1920 px width with Lanczos filtering and re-encoded as lossy WebP. It is representative Dien Bien Phu countryside imagery for the riverside setting, not an exact verified photograph of the Nam Rom River. CLEARED covers rights/provenance for the exact shipped binary only. CC BY-SA 2.0 requires attribution, a licence link, change notice, and share-alike.',
    },
  },
  {
    id: 'book-chapter-13-urban-artwork',
    usage: {
      vi: 'Ảnh đường phố Điện Biên Phủ đại diện dùng cho Chương 13 và fallback Challenge để xe ngoài trời',
      en: 'Representative Dien Bien Phu streetscape used for Chapter 13 and the overnight-motorbike Challenge fallback',
    },
    author: 'Ioe2015',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:A_route_in_Dien_Bien_Phu.jpg',
    ...cc('4.0'),
    status: 'cleared',
    note: {
      vi: 'Chapter 13 và fallback Challenge dùng lại exact binary đã CLEARED của quang-truong-7-5-mthen, giữ nguyên derivative SHA-256 4741c2e12aead3b1dde462c1c7b6eb6fae81cf4e6fc1b87bc128211eb1ebb34a và source SHA-256 21da7ab103380468d0a5bbff542eacadd5493a9356b23a270f6fb6ed84c1a51a. Derivative đã được resize theo tỷ lệ xuống chiều rộng 1920 px bằng Lanczos và re-encode thành lossy WebP; không crop, thêm overlay, xóa watermark hay chỉnh sửa nội dung. Đây là ảnh đường phố Điện Biên Phủ mang tính đại diện, không phải ảnh đã xác minh chính xác thành phố về đêm hay điểm Challenge. CLEARED chỉ xác nhận quyền/provenance của exact reused binary. CC BY-SA 4.0 yêu cầu ghi công, liên kết giấy phép, nêu thay đổi và tuân thủ share-alike.',
      en: 'Chapter 13 and the Challenge fallback reuse the exact already-CLEARED quang-truong-7-5-mthen binary, preserving derivative SHA-256 4741c2e12aead3b1dde462c1c7b6eb6fae81cf4e6fc1b87bc128211eb1ebb34a and source SHA-256 21da7ab103380468d0a5bbff542eacadd5493a9356b23a270f6fb6ed84c1a51a. The derivative was proportionally resized to 1920 px width with Lanczos filtering and re-encoded as lossy WebP; no crop, overlay, watermark removal, or content edit was applied. It is representative Dien Bien Phu urban streetscape imagery, not an exact verified night photograph or image of the Challenge point. CLEARED covers rights/provenance for the exact reused binary only. CC BY-SA 4.0 requires attribution, a licence link, change notice, and share-alike.',
    },
  },
];
