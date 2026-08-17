import {
  BOOK_CHAPTERS as BASE_BOOK_CHAPTERS,
  BOOK_EXPERIENCES as BASE_BOOK_EXPERIENCES,
  BOOK_PAGES as BASE_BOOK_PAGES,
} from './bookContent';
import type { BookChapter, BookExperience, BookPage } from '../types/book';

export const CHAPTER_13_ID = 'chapter-13-su-noi-loan-va-thanh-pho-ban-dem';
export const CHAPTER_13_CHALLENGE_ID = 'de-xe-may-ngoai-troi-qua-dem';

const chapter13: BookChapter = {
  id: CHAPTER_13_ID,
  number: '13',
  title: { vi: 'Sự nổi loạn và thành phố ban đêm', en: 'Rebellion and the City at Night' },
  intro: {
    vi: 'Sau khi trời tối, những trật tự ban ngày lỏng ra: đường, đèn, xe máy và những khoảng vắng làm thành phố quen thuộc hiện lên theo một cách khác.',
    en: 'After dark, daytime order loosens: roads, lights, motorbikes, and empty stretches make the familiar city appear differently.',
  },
  music: { mood: 'piano', trackId: 'hmong-ballad-2' },
  order: 13,
  status: 'published',
};

const chapter13Page: BookPage = {
  id: 'thanh-pho-ban-dem-va-mot-phep-thu-nho',
  chapterId: CHAPTER_13_ID,
  type: 'place',
  title: { vi: 'Thành phố ban đêm và một phép thử nhỏ', en: 'The City at Night and a Small Test' },
  intro: {
    vi: 'Một đêm Điện Biên không cần biến thành cuộc chơi lớn. Đôi khi chỉ cần đi thêm một đoạn, nhìn ánh đèn khác đi và thử đặt một chút niềm tin vào thành phố.',
    en: 'A night in Dien Bien does not need to become a grand adventure. Sometimes it is enough to keep moving, see the lights differently, and place a small amount of trust in the city.',
  },
  blocks: [{
    type: 'text',
    body: {
      vi: 'Sự nổi loạn ở đây không phải một khẩu hiệu. Nó nằm trong cảm giác muốn lệch khỏi thói quen một chút: đi trong gió đêm, qua những đoạn phố đang thưa người, rồi để chiếc xe máy lại ngoài trời ở một chỗ đỗ hợp pháp. Khóa xe như bình thường, không để tài sản giá trị, chụp một tấm ảnh và đi tiếp. Sáng hôm sau quay lại. Phần còn lại thuộc về đêm và thành phố, không cần bịa thêm.',
      en: 'Rebellion here is not a slogan. It lives in the urge to step slightly outside routine: ride through the night air and quieter streets, then leave the motorbike outdoors in a legal parking place. Lock it normally, leave no valuables, take one photo, and walk away. Return the next morning. The rest belongs to the night and the city; nothing more needs to be invented.',
    },
  }],
  location: {
    lat: 21.394221,
    lng: 103.020336,
    radius: 100,
    label: { vi: 'Điểm thử thách thành phố ban đêm', en: 'Night-city challenge point' },
  },
  tags: ['night', 'city', 'youth', 'rebellion'],
  order: 1,
  status: 'published',
  legacyTaskIds: [CHAPTER_13_CHALLENGE_ID],
};

const chapter13Experience: BookExperience = {
  id: 'experience-chapter-13-overnight-motorbike',
  chapterId: CHAPTER_13_ID,
  type: 'location',
  title: { vi: 'Để xe máy ngoài trời qua đêm', en: 'Leave a Motorbike Outside Overnight' },
  description: {
    vi: 'Challenge BOTH của chương. Tọa độ và ý tưởng đã chốt; phần gameplay đang được hoàn thiện để xác minh đúng hai bước qua đêm trước khi cho nhận điểm.',
    en: 'The chapter’s BOTH challenge. The location and concept are fixed; gameplay is still being completed so the overnight two-step requirement can be verified before points are awarded.',
  },
  instruction: {
    vi: 'Hiện chỉ mở vị trí để đọc và xem trước. Chưa thể hoàn thành Challenge hoặc nhận điểm cho đến khi có xác minh ảnh lúc để xe và ảnh sáng hôm sau.',
    en: 'For now this only exposes the place for reading and preview. The Challenge cannot be completed or award points until parking-time and next-morning photo verification exists.',
  },
  location: {
    lat: 21.394221,
    lng: 103.020336,
    radius: 100,
    label: { vi: 'Điểm thử thách thành phố ban đêm', en: 'Night-city challenge point' },
  },
  musicMode: 'inherit-chapter',
  order: 1,
  status: 'published',
};

export const BOOK_CHAPTERS: BookChapter[] = [...BASE_BOOK_CHAPTERS, chapter13];
export const BOOK_PAGES: BookPage[] = [...BASE_BOOK_PAGES, chapter13Page];
export const BOOK_EXPERIENCES: BookExperience[] = [...BASE_BOOK_EXPERIENCES, chapter13Experience];
