import type { LanguageCode, LocalizedText } from '../types/task';

export type FeaturedExperienceId = '1954' | 'phieng-loi' | 'book';

export type FeaturedExperience = {
  id: FeaturedExperienceId;
  route: string;
  eyebrow: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  action: LocalizedText;
  image: string;
  tone: 'cinematic' | 'playful' | 'editorial';
};

export const FEATURED_EXPERIENCES: FeaturedExperience[] = [
  {
    id: '1954',
    route: '/1954',
    eyebrow: { vi: 'LỊCH SỬ · ÂM THANH 3D · GPS', en: 'HISTORY · 3D SOUND · GPS' },
    title: { vi: '1954', en: '1954' },
    description: {
      vi: 'Một vết nứt thời gian tại Đồi A1, nơi năm 1954 xuyên qua Điện Biên hôm nay.',
      en: 'A time rift at A1 Hill, where 1954 breaks into present-day Dien Bien.',
    },
    action: { vi: 'Bước vào vùng giao thoa', en: 'Enter the overlap' },
    image: '/images/tasks/doi-a1-khoanh-khac-tuong-niem.webp',
    tone: 'cinematic',
  },
  {
    id: 'phieng-loi',
    route: '/phieng-loi',
    eyebrow: { vi: 'VĂN HOÁ · TRÒ CHƠI 2D · GPS', en: 'CULTURE · 2D GAME · GPS' },
    title: { vi: 'Nhịp bản Phiêng Lơi', en: 'Phiêng Lơi Village Rhythm' },
    description: {
      vi: 'Một chuyến chạy nhảy vui trong bản, gặp cảnh sống và sản vật của Điện Biên.',
      en: 'A playful run through village life, landscapes and produce from Dien Bien.',
    },
    action: { vi: 'Chơi một màn ngắn', en: 'Play a short level' },
    image: '/images/tasks/ban-phieng-loi-mthen.webp',
    tone: 'playful',
  },
  {
    id: 'book',
    route: '/book',
    eyebrow: { vi: 'KÝ ỨC · ĐỊA ĐIỂM · TẢN VĂN', en: 'MEMORY · PLACE · STORIES' },
    title: { vi: 'Book of Dien Bien', en: 'Book of Dien Bien' },
    description: {
      vi: 'Đọc Điện Biên chậm lại qua con người, ký ức, âm thanh và những nơi chốn.',
      en: 'Read Dien Bien slowly through people, memories, sound and places.',
    },
    action: { vi: 'Mở cuốn sách', en: 'Open the book' },
    image: '/images/book-v3/nhung-ngon-doi.webp',
    tone: 'editorial',
  },
];

export const getExperienceCopy = (experience: FeaturedExperience, language: LanguageCode) => ({
  eyebrow: experience.eyebrow[language],
  title: experience.title[language],
  description: experience.description[language],
  action: experience.action[language],
});
