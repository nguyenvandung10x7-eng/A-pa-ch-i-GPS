import type { BookChapter, BookExperience, BookPage } from '../types/book';

// These seeds validate the Book domain without replacing the legacy challenge data.
// Existing music catalog IDs are reused until chapter-specific tracks are authored.
export const BOOK_CHAPTERS: BookChapter[] = [
  {
    id: 'chapter-03-mot-dien-bien-rat-nho',
    number: '03',
    title: { vi: 'Một Điện Biên rất nhỏ', en: 'A Very Small Dien Bien' },
    intro: {
      vi: 'Những không gian gia đình và những chi tiết nhỏ có thể giữ lại một Điện Biên rất riêng.',
      en: 'Family spaces and small details can preserve a very personal Dien Bien.',
    },
    music: { mood: 'piano', trackId: 'hmong-ballad-1' },
    order: 3,
    status: 'published',
  },
  {
    id: 'chapter-05-long-chao',
    number: '05',
    title: { vi: 'Lòng chảo', en: 'The Basin' },
    intro: {
      vi: 'Những khoảng rộng của lòng chảo Mường Thanh được đọc như một phần của đời sống, không chỉ như một điểm đến.',
      en: 'The open spaces of the Muong Thanh basin are read as part of everyday life, not only as destinations.',
    },
    music: { mood: 'piano', trackId: 'hmong-ballad-1' },
    order: 5,
    status: 'published',
  },
  {
    id: 'chapter-06-1954',
    number: '06',
    title: { vi: '1954', en: '1954' },
    intro: {
      vi: 'Lịch sử hiện diện bên dưới một thành phố vẫn đang tiếp tục sống.',
      en: 'History remains present beneath a city that continues to live.',
    },
    music: { mood: 'epic-slow', trackId: 'thai-epic-1' },
    order: 6,
    status: 'published',
  },
];

export const BOOK_PAGES: BookPage[] = [
  {
    id: 'vuon-nha-ba-noi',
    chapterId: 'chapter-03-mot-dien-bien-rat-nho',
    type: 'story',
    title: { vi: 'Vườn nhà bà nội', en: "Grandmother's Garden" },
    intro: {
      vi: 'Một trang về ký ức gia đình, được giữ ở quy mô nhỏ và gần thay vì biến thành một câu chuyện du lịch.',
      en: 'A page about family memory, kept intimate and small rather than turned into a tourism story.',
    },
    blocks: [
      {
        type: 'text',
        body: {
          vi: 'Nội dung văn chương của trang này sẽ được biên tập riêng. Bản seed chỉ giữ cấu trúc và nhịp đọc để không tự ý bổ sung chi tiết ký ức chưa được xác nhận.',
          en: 'The literary text for this page will be edited separately. This seed keeps only the reading structure so it does not invent unconfirmed personal memories.',
        },
      },
    ],
    tags: ['family', 'memory'],
    order: 1,
    status: 'published',
  },
  {
    id: 'mui-cam-lon',
    chapterId: 'chapter-03-mot-dien-bien-rat-nho',
    type: 'story',
    title: { vi: 'Mùi cám lợn', en: 'The Smell of Pig Feed' },
    intro: {
      vi: 'Một mảnh ký ức ngắn, nơi cảm giác và chi tiết đời thường quan trọng hơn việc giải thích.',
      en: 'A short memory fragment where sensation and ordinary detail matter more than explanation.',
    },
    blocks: [
      {
        type: 'text',
        body: {
          vi: 'Bản seed chưa viết thay phần ký ức. Trang được giữ như một ví dụ cho dạng fragment ngắn trong Book.',
          en: 'The seed does not write the memory on the author’s behalf. The page remains as an example of a short fragment format in the Book.',
        },
      },
    ],
    tags: ['memory', 'fragment'],
    order: 2,
    status: 'published',
  },
  {
    id: 'canh-dong-muong-thanh-sau-mua-gat',
    chapterId: 'chapter-05-long-chao',
    type: 'place',
    title: { vi: 'Cánh đồng Mường Thanh sau mùa gặt', en: 'Muong Thanh Field After the Harvest' },
    intro: {
      vi: 'Một trang địa điểm được đọc trước như câu chuyện về không gian, rồi mới dẫn sang trải nghiệm ngoài đời ở cuối chương.',
      en: 'A place page read first as a story about space, with the real-world experience deferred until the end of the chapter.',
    },
    blocks: [
      {
        type: 'text',
        body: {
          vi: 'Bản seed cố ý tách phần đọc khỏi hành động ngoài đời. Người đọc có thể hoàn thành trang mà không cần GPS; vị trí chỉ hỗ trợ khi muốn bước ra ngoài.',
          en: 'This seed deliberately separates reading from real-world action. The page can be completed without GPS; location only assists when the reader chooses to step outside.',
        },
      },
    ],
    location: {
      lat: 21.37668,
      lng: 103.02135,
      radius: 250,
      label: { vi: 'Cánh đồng Mường Thanh', en: 'Muong Thanh Field' },
    },
    legacyTaskIds: ['canh-dong-muong-thanh-cat-banh'],
    tags: ['landscape', 'field'],
    order: 1,
    status: 'published',
  },
  {
    id: '1954-duoi-mot-thanh-pho-dang-song',
    chapterId: 'chapter-06-1954',
    type: 'story',
    title: { vi: '1954 nằm dưới một thành phố đang sống', en: '1954 Beneath a Living City' },
    intro: {
      vi: 'Một trang lịch sử đặt quá khứ cạnh nhịp sống hiện tại, trước khi người đọc chọn đi đến một di tích cụ thể.',
      en: 'A history page placing the past beside present-day life before the reader chooses to visit a specific historical site.',
    },
    blocks: [
      {
        type: 'text',
        body: {
          vi: 'Bản seed chỉ xác lập cấu trúc biên tập: lịch sử được đọc trước, trải nghiệm tại Đồi A1 xuất hiện sau khi kết thúc chương thay vì chen vào giữa trang.',
          en: 'This seed establishes only the editorial structure: history is read first, and the A1 Hill experience appears after the chapter rather than interrupting the page.',
        },
      },
    ],
    tags: ['history', '1954'],
    order: 1,
    status: 'published',
  },
];

export const BOOK_EXPERIENCES: BookExperience[] = [
  {
    id: 'experience-muong-thanh-mooncake-sidequest',
    chapterId: 'chapter-05-long-chao',
    type: 'sideQuest',
    title: { vi: 'Cắt bánh bên Cánh đồng Mường Thanh', en: 'Cut a Mooncake by Muong Thanh Field' },
    description: {
      vi: 'Một side quest vui được giữ lại từ hệ thống nhiệm vụ cũ và chỉ xuất hiện sau phần đọc của chương.',
      en: 'A playful side quest retained from the legacy challenge system and shown only after the chapter reading.',
    },
    location: {
      lat: 21.37668,
      lng: 103.02135,
      radius: 250,
      label: { vi: 'Cánh đồng Mường Thanh', en: 'Muong Thanh Field' },
    },
    musicMode: 'fun',
    legacyTaskId: 'canh-dong-muong-thanh-cat-banh',
    order: 1,
    status: 'published',
  },
  {
    id: 'experience-a1-1954-time-train',
    chapterId: 'chapter-06-1954',
    type: 'external',
    title: { vi: '1954 – Chuyến tàu thời gian', en: '1954 – The Time Train' },
    description: {
      vi: 'Trải nghiệm lịch sử nghiêm túc tại Đồi A1, mở sau phần đọc của chương và tiếp tục dùng trải nghiệm web hiện có.',
      en: 'A serious historical experience at A1 Hill, surfaced after the chapter reading and continuing to use the existing web experience.',
    },
    externalUrl: 'https://1954-chuyentauthoigian.netlify.app/',
    musicMode: 'inherit-chapter',
    legacyTaskId: 'doi-a1-chuyen-tau-thoi-gian-1954',
    order: 1,
    status: 'published',
  },
];
