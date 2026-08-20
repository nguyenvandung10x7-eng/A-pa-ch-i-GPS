export type AssetCreditStatus = 'verified' | 'pending';

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
    id: 'quang-truong-7-5-mthen',
    usage: { vi: 'Ảnh Quảng trường 7-5 / artwork chương', en: '7 May Square / chapter artwork' },
    author: 'Ioe2015',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:A_route_in_Dien_Bien_Phu.jpg',
    ...cc('4.0'),
    status: 'verified',
    note: { vi: 'Bản trong app có thể đã đổi kích thước, cắt khung hoặc chuyển định dạng.', en: 'The in-app rendition may be resized, cropped, or format-converted.' },
  },
  {
    id: 'cong-vien-vu-a-dinh-trai-ban',
    usage: { vi: 'Ảnh Công viên Vừ A Dính', en: 'Vu A Dinh Park image' },
    author: 'Adam Jones',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Landscape_on_Edge_of_Dien_Bien_Phu_-_Vietnam_(48168741986).jpg',
    ...cc('2.0'),
    status: 'verified',
  },
  {
    id: 'cong-vien-noong-bua-mthen',
    usage: { vi: 'Ảnh Công viên Noong Bua', en: 'Noong Bua Park image' },
    author: 'Adam Jones',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Countryside_on_Edge_of_Town_-_Dien_Bien_Phu_-_Vietnam_(48159158386).jpg',
    ...cc('2.0'),
    status: 'verified',
  },
  {
    id: 'cho-noong-bua-trai-ban',
    usage: { vi: 'Ảnh Chợ Noong Bua / artwork chương', en: 'Noong Bua Market / chapter artwork' },
    author: 'Adam Jones',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Woman_Market_Vendor_-_Dien_Bien_Phu_-_Vietnam_-_01_(48178458016).jpg',
    ...cc('2.0'),
    status: 'verified',
  },
  {
    id: 'canh-dong-muong-thanh-cat-banh',
    usage: { vi: 'Ảnh Cánh đồng Mường Thanh / artwork chương', en: 'Muong Thanh Field / chapter artwork' },
    author: 'Adam Jones',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Panorama_of_Ricefields_in_Muong_Thanh_Valley_-_Dien_Bien_Phu_-_Vietnam_-_02_(48178461326).jpg',
    ...cc('2.0'),
    status: 'verified',
  },
  {
    id: 'cong-vien-hoa-ban-mthen',
    usage: { vi: 'Ảnh Công viên Hoa Ban / artwork chương', en: 'Ban Flower Park / chapter artwork' },
    author: 'Adam Jones',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Traditional_Thai_Dam_House_-_Muong_Thanh_Valley_-_Dien_Bien_Phu_-_Vietnam_-_01_(48178539312).jpg',
    ...cc('2.0'),
    status: 'verified',
  },
  {
    id: 'ho-pa-khoang-trai-ban',
    usage: { vi: 'Ảnh Hồ Pá Khoang', en: 'Pa Khoang Lake image' },
    author: '[Tycho]',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:M%C6%B0%E1%BB%9Dng_Thanh_Valley.jpg',
    ...cc('3.0'),
    status: 'verified',
  },
  {
    id: 'cho-muong-nhe-tang-banh-trung-thu',
    usage: { vi: 'Ảnh Chợ Mường Nhé', en: 'Muong Nhe Market image' },
    author: 'Dratharr',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:2002.muong_nhe_1.jpg',
    ...cc('4.0'),
    status: 'verified',
  },
  {
    id: 'doi-a1-khoanh-khac-tuong-niem',
    usage: { vi: 'Ảnh Đồi A1 / artwork chương', en: 'Hill A1 / chapter artwork' },
    author: 'Adam Jones',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:French_Barbed-Wire_Emplacement_at_Hill_A1_(Eliane_2)_-_Dien_Bien_Phu_-_Vietnam_(48168745081).jpg',
    ...cc('2.0'),
    status: 'verified',
  },
  {
    id: 'ban-phieng-loi-mthen',
    usage: { vi: 'Ảnh Bản Phiêng Lơi / artwork chương', en: 'Phieng Loi village / chapter artwork' },
    author: 'Adam Jones',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Traditional_Thai_Dam_House_-_Muong_Thanh_Valley_-_Dien_Bien_Phu_-_Vietnam_-_02_(48178530927).jpg',
    ...cc('2.0'),
    status: 'verified',
  },
  {
    id: 'ca-phe-ke-nenh-cat-banh',
    usage: { vi: 'Ảnh Cà phê Kê Nênh', en: 'Ke Nenh cafe image' },
    author: 'Adam Jones',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Panorama_of_Ricefields_in_Muong_Thanh_Valley_-_Dien_Bien_Phu_-_Vietnam_-_01_(48178533987).jpg',
    ...cc('2.0'),
    status: 'verified',
  },
  {
    id: 'bao-tang-chien-thang-dien-bien-phu-trai-nghiem',
    usage: { vi: 'Ảnh Bảo tàng Chiến thắng Điện Biên Phủ / artwork chương', en: 'Dien Bien Phu Victory Museum / chapter artwork' },
    author: 'Trung tâm Thông tin Xúc tiến Du lịch tỉnh Điện Biên (portal operator)',
    sourceUrl: 'https://dulichdienbien.vietnaminfo.net/vi/place/details/bao-tang-chien-thang-dien-bien-phu-6',
    status: 'pending',
    note: { vi: 'Đã có nguồn, nhưng repository chưa có căn cứ licence/permission đủ để clearance.', en: 'A source is recorded, but the repository does not yet document sufficient licence/permission for clearance.' },
  },
  {
    id: 'phadin-coffee-cat-banh',
    usage: { vi: 'Ảnh PhaDin Coffee', en: 'PhaDin Coffee image' },
    author: 'Đang xác minh',
    status: 'pending',
    note: { vi: 'Source ledger hiện chưa có record chính thức khớp asset đã ship.', en: 'The current source ledger does not yet have an authoritative record matching the shipped asset.' },
  },
  {
    id: 'book-native-and-chapter-13',
    usage: { vi: 'Ảnh Book-native, gồm Chapter 01 và Chapter 13', en: 'Book-native images, including Chapter 01 and Chapter 13' },
    author: 'Đang xác minh',
    status: 'pending',
    note: { vi: 'Chapter 13 vẫn là blocker phát hành cho tới khi có quyền sử dụng hoặc ảnh thay thế đã clearance.', en: 'Chapter 13 remains a release blocker until permission is documented or a cleared replacement is used.' },
  },
];
