export const BOOK_PAGE_ILLUSTRATIONS: Readonly<Record<string, string>> = Object.freeze({
  'nam-rom-buoi-chieu': '/images/book-v3/nam-rom-buoi-chieu.webp',
  'mua-hoa-nhan-hoa-vai': '/images/book-v3/mua-hoa-nhan-hoa-vai.webp',
  'vuon-nha-ba-noi': '/images/book-v3/vuon-nha-ba-noi.webp',
  'pho-cu': '/images/book-v3/pho-cu-con-duong-da-bien-mat.webp',
  'thcs-so-1-dien-bien': '/images/book-v3/thcs-so-1-dien-bien.webp',
  'goc-pho-hoa-qua-rung': '/images/book-v3/goc-pho-hoa-qua-rung.webp',
  'nhung-quan-che': '/images/book-v3/nhung-quan-che-phim-chuong.webp',
  'am-thanh-nhung-nam-2000': '/images/book-v3/am-thanh-nhung-nam-2000.webp',
  'canh-dong-muong-thanh-sau-mua-gat': '/images/book-v3/canh-dong-muong-thanh-sau-mua-gat.webp',
  'su-hung-vi': '/images/book-v3/su-hung-vi.webp',
  'nhung-ngon-doi': '/images/book-v3/nhung-ngon-doi.webp',
  '1954-duoi-mot-thanh-pho-dang-song': '/images/book-v3/1954-duoi-thanh-pho-dang-song.webp',
  'con-vat': '/images/book-v3/con-vat.webp',
  'chuyen-xe-dua-nguoi-chet-di-hoa-tang': '/images/book-v3/chuyen-xe-hoa-tang.webp',
  'di-ve-phia-tay-cho-den-gan-het-duong': '/images/book-v3/di-ve-phia-tay.webp',
  'thanh-pho-ban-dem-va-mot-phep-thu-nho': '/images/book-v3/thanh-pho-ban-dem.webp',
});

export const getBookPageIllustration = (pageId: string): string | undefined =>
  BOOK_PAGE_ILLUSTRATIONS[pageId];
