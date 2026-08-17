import { BOOK_CHAPTERS, BOOK_EXPERIENCES, BOOK_PAGES } from '../data/bookContentChapter13';
import { MUSIC_TRACKS } from '../data/music';
import type { BookChapter, BookExperience, BookPage } from '../types/book';

export type BookContentValidationIssue = {
  code:
    | 'duplicate-chapter-id'
    | 'duplicate-page-id'
    | 'duplicate-experience-id'
    | 'missing-page-chapter'
    | 'missing-experience-chapter'
    | 'published-page-empty'
    | 'missing-chapter-track';
  id: string;
  message: string;
};

const sortByOrder = <T extends { order?: number }>(items: T[]): T[] =>
  [...items].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));

const findDuplicateIds = <T extends { id: string }>(items: T[]): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) {
      duplicates.add(item.id);
    }
    seen.add(item.id);
  }

  return [...duplicates];
};

const isPublishedChapter = (chapterId: BookChapter['id']): boolean =>
  BOOK_CHAPTERS.some((chapter) => chapter.id === chapterId && chapter.status === 'published');

export const getPublishedChapters = (): BookChapter[] =>
  sortByOrder(BOOK_CHAPTERS.filter((chapter) => chapter.status === 'published'));

export const getChapter = (chapterId: BookChapter['id']): BookChapter | undefined =>
  BOOK_CHAPTERS.find((chapter) => chapter.id === chapterId && chapter.status === 'published');

export const getChapterPages = (chapterId: BookChapter['id']): BookPage[] => {
  if (!isPublishedChapter(chapterId)) {
    return [];
  }

  return sortByOrder(
    BOOK_PAGES.filter((page) => page.chapterId === chapterId && page.status === 'published')
  );
};

export const getPage = (pageId: BookPage['id']): BookPage | undefined => {
  const page = BOOK_PAGES.find((candidate) => candidate.id === pageId && candidate.status === 'published');
  if (!page || !isPublishedChapter(page.chapterId)) {
    return undefined;
  }

  return page;
};

export const getChapterExperiences = (chapterId: BookChapter['id']): BookExperience[] => {
  if (!isPublishedChapter(chapterId)) {
    return [];
  }

  return sortByOrder(
    BOOK_EXPERIENCES.filter(
      (experience) => experience.chapterId === chapterId && experience.status === 'published'
    )
  );
};

export const validateBookContent = (): BookContentValidationIssue[] => {
  const issues: BookContentValidationIssue[] = [];
  const chapterIds = new Set(BOOK_CHAPTERS.map((chapter) => chapter.id));
  const musicTrackIds = new Set(MUSIC_TRACKS.map((track) => track.id));

  for (const id of findDuplicateIds(BOOK_CHAPTERS)) {
    issues.push({
      code: 'duplicate-chapter-id',
      id,
      message: `Duplicate chapter id: ${id}`,
    });
  }

  for (const id of findDuplicateIds(BOOK_PAGES)) {
    issues.push({
      code: 'duplicate-page-id',
      id,
      message: `Duplicate page id: ${id}`,
    });
  }

  for (const id of findDuplicateIds(BOOK_EXPERIENCES)) {
    issues.push({
      code: 'duplicate-experience-id',
      id,
      message: `Duplicate experience id: ${id}`,
    });
  }

  for (const chapter of BOOK_CHAPTERS) {
    if (!musicTrackIds.has(chapter.music.trackId)) {
      issues.push({
        code: 'missing-chapter-track',
        id: chapter.id,
        message: `Chapter ${chapter.id} references unknown music track ${chapter.music.trackId}`,
      });
    }
  }

  for (const page of BOOK_PAGES) {
    if (!chapterIds.has(page.chapterId)) {
      issues.push({
        code: 'missing-page-chapter',
        id: page.id,
        message: `Page ${page.id} references unknown chapter ${page.chapterId}`,
      });
    }

    if (page.status === 'published' && page.blocks.length === 0) {
      issues.push({
        code: 'published-page-empty',
        id: page.id,
        message: `Published page ${page.id} must contain at least one content block`,
      });
    }
  }

  for (const experience of BOOK_EXPERIENCES) {
    if (!chapterIds.has(experience.chapterId)) {
      issues.push({
        code: 'missing-experience-chapter',
        id: experience.id,
        message: `Experience ${experience.id} references unknown chapter ${experience.chapterId}`,
      });
    }
  }

  return issues;
};
