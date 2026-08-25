import editorial from './bookRebellionEditorial.json';
import type { BookChapter, BookLocalizedText, BookPage, ContentBlock } from '../types/book';

const chapterIntro = editorial.chapterIntro as BookLocalizedText;
const pageTitle = editorial.pageTitle as BookLocalizedText;
const pageIntro = editorial.pageIntro as BookLocalizedText;
const narrativeBlocks: ContentBlock[] = editorial.body.map((body) => ({
  type: 'text',
  body: body as BookLocalizedText,
}));

export const withRebellionEditorialChapterCopy = (chapter: BookChapter): BookChapter =>
  chapter.id === editorial.chapterId ? { ...chapter, intro: chapterIntro } : chapter;

export const withRebellionEditorialPageCopy = (page: BookPage): BookPage =>
  page.id === editorial.pageId
    ? { ...page, title: pageTitle, intro: pageIntro, blocks: narrativeBlocks }
    : page;
