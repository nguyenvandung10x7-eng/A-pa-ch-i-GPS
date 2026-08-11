import { BOOK_CHAPTERS, BOOK_EXPERIENCES, BOOK_PAGES } from '../data/bookContent';
import type { BookExperience, BookPage, Location } from '../types/book';
import { distanceMeters } from '../utils/geo';

export type NearMeBookItem = {
  id: string;
  kind: 'page' | 'experience';
  chapterId: string;
  chapterNumber: string;
  title: BookPage['title'] | BookExperience['title'];
  description?: BookPage['intro'] | BookExperience['description'];
  location: Location;
  distanceMeters: number;
  pageId?: BookPage['id'];
  experienceType?: BookExperience['type'];
  externalUrl?: string;
  legacyTaskId?: string;
};

type Coordinate = Pick<Location, 'lat' | 'lng'>;

const publishedChapterIds = new Set(
  BOOK_CHAPTERS.filter((chapter) => chapter.status === 'published').map((chapter) => chapter.id)
);

const chapterNumberById = new Map(BOOK_CHAPTERS.map((chapter) => [chapter.id, chapter.number]));

export const getLocatedBookItems = (position: Coordinate): NearMeBookItem[] => {
  const pages: NearMeBookItem[] = BOOK_PAGES.filter(
    (page) => page.status === 'published' && publishedChapterIds.has(page.chapterId) && page.location
  ).map((page) => ({
    id: `page:${page.id}`,
    kind: 'page',
    chapterId: page.chapterId,
    chapterNumber: chapterNumberById.get(page.chapterId) ?? '',
    title: page.title,
    description: page.intro,
    location: page.location!,
    distanceMeters: distanceMeters(position, page.location!),
    pageId: page.id,
  }));

  // Location-only experiences remain draft in the chapter reader until they have a
  // chapter-level action. Near Me is the first UI that intentionally consumes them.
  const experiences: NearMeBookItem[] = BOOK_EXPERIENCES.filter(
    (experience) => experience.status !== 'hidden' && publishedChapterIds.has(experience.chapterId) && experience.location
  ).map((experience) => ({
    id: `experience:${experience.id}`,
    kind: 'experience',
    chapterId: experience.chapterId,
    chapterNumber: chapterNumberById.get(experience.chapterId) ?? '',
    title: experience.title,
    description: experience.description,
    location: experience.location!,
    distanceMeters: distanceMeters(position, experience.location!),
    experienceType: experience.type,
    externalUrl: experience.externalUrl,
    legacyTaskId: experience.legacyTaskId,
  }));

  return [...pages, ...experiences].sort((a, b) => a.distanceMeters - b.distanceMeters);
};

export const bookLocationMapUrl = (location: Coordinate): string =>
  `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
