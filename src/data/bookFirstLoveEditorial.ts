import firstLoveEditorialJson from './bookFirstLoveEditorial.json';
import type { BookChapter, BookLocalizedText, BookPage, ContentBlock } from '../types/book';

type FirstLoveEditorialCopy = {
  chapterId: string;
  pageId: string;
  chapterIntro: BookLocalizedText;
  pageIntro: BookLocalizedText;
  body: BookLocalizedText[];
};

const editorial = firstLoveEditorialJson as FirstLoveEditorialCopy;

const narrativeBlocks: ContentBlock[] = editorial.body.map((body) => ({
  type: 'text',
  body,
}));

export const withFirstLoveEditorialChapterCopy = (chapter: BookChapter): BookChapter =>
  chapter.id === editorial.chapterId ? { ...chapter, intro: editorial.chapterIntro } : chapter;

export const withFirstLoveEditorialPageCopy = (page: BookPage): BookPage =>
  page.id === editorial.pageId ? { ...page, intro: editorial.pageIntro, blocks: narrativeBlocks } : page;
