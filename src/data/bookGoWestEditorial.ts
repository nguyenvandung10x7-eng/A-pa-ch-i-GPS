import editorial from './bookGoWestEditorial.json';
import type { BookChapter, BookLocalizedText, BookPage, ContentBlock } from '../types/book';

const chapterIntro = editorial.chapterIntro as BookLocalizedText;
const pageIntro = editorial.pageIntro as BookLocalizedText;
const narrativeBlocks: ContentBlock[] = editorial.body.map((body) => ({
  type: 'text',
  body: body as BookLocalizedText,
}));

export const withGoWestEditorialChapterCopy = (chapter: BookChapter): BookChapter =>
  chapter.id === editorial.chapterId ? { ...chapter, intro: chapterIntro } : chapter;

export const withGoWestEditorialPageCopy = (page: BookPage): BookPage =>
  page.id === editorial.pageId ? { ...page, intro: pageIntro, blocks: narrativeBlocks } : page;
