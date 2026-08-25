import {
  BOOK_CHAPTERS as BASE_BOOK_CHAPTERS,
  BOOK_EXPERIENCES as BASE_BOOK_EXPERIENCES,
  BOOK_PAGES as BASE_BOOK_PAGES,
} from './bookContent';
import { BOOK_MUSIC_TRACKS } from './music';
import { withLiteraryChapterCopy } from './bookLiteraryCopy';
import { withLiteraryPageCopy } from './bookLiteraryPageCopy';
import { withLongformEditorialPageCopy } from './bookLongformEditorial';
import { withNatureEditorialChapterCopy, withNatureEditorialPageCopy } from './bookNatureEditorial';
import type { BookChapter, BookExperience, BookPage } from '../types/book';

export const CHAPTER_13_ID = 'chapter-13-su-noi-loan-va-thanh-pho-ban-dem';
export const CHAPTER_13_CHALLENGE_ID = 'de-xe-may-ngoai-troi-qua-dem';

const CHAPTER_TRACK_IDS_BY_NUMBER: Record<string, string[]> = {
  '01': ['chapter-01-dong-song-track-01'],
  '02': ['chapter-02-mua-he-track-01'],
  '03': ['chapter-03-nha-ba-noi-track-01'],
  '04': ['chapter-04-pho-cu-track-01'],
  '05': ['chapter-05-thi-xa-track-01'],
  '06': ['chapter-06-nhung-nam-2000-track-01'],
  '07': ['chapter-07-long-chao-track-01'],
  '08': ['chapter-08-nhung-ngon-doi-track-01'],
  '09': ['chapter-09-1954-track-01', 'chapter-09-1954-track-02'],
  '10': ['chapter-10-con-vat-track-01'],
  '11': ['chapter-11-nguoi-song-nguoi-chet-track-01'],
  '12': ['chapter-12-di-ve-phia-tay-track-01'],
};

const withUploadedChapterAssets = (chapter: BookChapter): BookChapter => {
  const trackIds = CHAPTER_TRACK_IDS_BY_NUMBER[chapter.number];

  return {
    ...chapter,
    ...(trackIds?.length
      ? {
          music: {
            ...chapter.music,
            trackId: trackIds[0],
            trackIds,
          },
        }
      : {}),
  };
};

const chapter13TrackIds = [
  'chapter-13-su-noi-loan-va-thanh-pho-ban-dem-track-01',
  'chapter-13-su-noi-loan-va-thanh-pho-ban-dem-track-02',
];

const chapter13: BookChapter = {
  id: CHAPTER_13_ID,
  number: '13',
  title: { vi: 'Sự nổi loạn và thành phố ban đêm', en: 'Rebellion and the City at Night' },
  intro: {
    vi: 'Sau khi trời tối, những trật tự ban ngày lỏng ra: đường, đèn, xe máy và những khoảng vắng làm thành phố quen thuộc hiện lên theo một cách khác.',
    en: 'After dark, daytime order loosens: roads, lights, motorbikes, and empty stretches make the familiar city appear differently.',
  },
  music: { mood: 'piano', trackId: chapter13TrackIds[0], trackIds: chapter13TrackIds },
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
      vi: 'Sự nổi loạn ở đây không phải một khẩu hiệu. Nó nằm trong cảm giác muốn lệch khỏi thói quen một chút: đi trong gió đêm, qua những đoạn phố đang thưa người, rồi để chiếc xe máy lại ngoài trời ở một chỗ đỗ hợp pháp. Khóa xe như bình thường, không để tài sản giá trị, rồi đi tiếp. Sáng hôm sau quay lại. App không cần chứng minh phần đó; nó chỉ đưa bạn đến nơi câu chuyện bắt đầu.',
      en: 'Rebellion here is not a slogan. It lives in the urge to step slightly outside routine: ride through the night air and quieter streets, then leave the motorbike outdoors in a legal parking place. Lock it normally, leave no valuables, and walk away. Return the next morning. The app does not need to prove that part; it only takes you to where the story begins.',
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
    vi: 'Challenge BOTH của chương. Chỉ cần đến điểm đã chốt; GPS xác nhận bạn đã bước vào nơi trải nghiệm bắt đầu.',
    en: 'The chapter’s BOTH challenge. Simply reach the fixed location; GPS confirms that you have arrived where the experience begins.',
  },
  instruction: {
    vi: 'Đến trong bán kính 100 m để hoàn thành Challenge. Việc có để xe qua đêm hay không thuộc về trải nghiệm của bạn, không phải thứ app cố xác minh.',
    en: 'Reach the 100 m radius to complete the Challenge. Whether you actually leave the motorbike overnight belongs to your experience rather than something the app tries to verify.',
  },
  location: {
    lat: 21.394221,
    lng: 103.020336,
    radius: 100,
    label: { vi: 'Điểm thử thách thành phố ban đêm', en: 'Night-city challenge point' },
  },
  legacyTaskId: CHAPTER_13_CHALLENGE_ID,
  musicMode: 'inherit-chapter',
  order: 1,
  status: 'published',
};

const chapterNumberById = new Map<string, string>([
  ...BASE_BOOK_CHAPTERS.map((chapter) => [chapter.id, chapter.number] as const),
  [CHAPTER_13_ID, '13'],
]);

const bookMusicTrackById = new Map(BOOK_MUSIC_TRACKS.map((track) => [track.id, track]));

const withUploadedChapterAudioBlocks = (page: BookPage): BookPage => {
  if (page.order !== 1) return page;

  const chapterNumber = chapterNumberById.get(page.chapterId);
  if (!chapterNumber) return page;

  const trackIds = chapterNumber === '13' ? chapter13TrackIds : CHAPTER_TRACK_IDS_BY_NUMBER[chapterNumber];
  if (!trackIds?.length) return page;

  const audioBlocks: BookPage['blocks'] = trackIds.flatMap((trackId) => {
    const track = bookMusicTrackById.get(trackId);
    if (!track) return [];

    return [{
      type: 'audio' as const,
      audio: {
        src: `/audio/${track.fileName}`,
        title: track.label,
      },
    }];
  });

  if (!audioBlocks.length) return page;

  return {
    ...page,
    blocks: [...audioBlocks, ...page.blocks],
  };
};

const withUploadedPageAssets = (page: BookPage): BookPage =>
  withUploadedChapterAudioBlocks(page);

export const BOOK_CHAPTERS: BookChapter[] = [
  ...BASE_BOOK_CHAPTERS
    .map(withUploadedChapterAssets)
    .map(withLiteraryChapterCopy)
    .map(withNatureEditorialChapterCopy),
  withNatureEditorialChapterCopy(withLiteraryChapterCopy(chapter13)),
];
export const BOOK_PAGES: BookPage[] = [
  ...BASE_BOOK_PAGES
    .map(withLiteraryPageCopy)
    .map(withLongformEditorialPageCopy)
    .map(withNatureEditorialPageCopy)
    .map(withUploadedPageAssets),
  withUploadedPageAssets(withNatureEditorialPageCopy(withLongformEditorialPageCopy(withLiteraryPageCopy(chapter13Page)))),
];
export const BOOK_EXPERIENCES: BookExperience[] = [...BASE_BOOK_EXPERIENCES, chapter13Experience];
