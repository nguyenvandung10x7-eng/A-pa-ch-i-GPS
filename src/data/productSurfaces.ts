import type { BookExperience } from '../types/book';

export type ProductSurface = 'book' | 'challenge';

/**
 * Product-level boundary for the two intentionally different halves of the app.
 *
 * BOOK is the slow editorial/memory surface. CHALLENGE is the playful GPS/action
 * surface. Utilities may live beside either surface, but task progress and Book
 * reading state stay separate.
 */
export const PRODUCT_SURFACES = {
  book: {
    id: 'book' as const,
    rootPath: '/book',
    utilityPaths: ['/near-me', '/saved', '/experiences'] as const,
  },
  challenge: {
    id: 'challenge' as const,
    rootPath: '/challenge',
    utilityPaths: [
      '/discover',
      '/history',
      '/leaderboard',
      '/submit-tiktok',
      '/moderation',
      '/admin',
    ] as const,
  },
} as const;

const BOOK_PATH_PREFIXES = [
  PRODUCT_SURFACES.book.rootPath,
  ...PRODUCT_SURFACES.book.utilityPaths,
] as const;

const CHALLENGE_PATH_PREFIXES = [
  PRODUCT_SURFACES.challenge.rootPath,
  ...PRODUCT_SURFACES.challenge.utilityPaths,
] as const;

const matchesPath = (pathname: string, prefix: string): boolean =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export const resolveProductSurface = (pathname: string): ProductSurface | null => {
  if (BOOK_PATH_PREFIXES.some((prefix) => matchesPath(pathname, prefix))) return 'book';
  if (CHALLENGE_PATH_PREFIXES.some((prefix) => matchesPath(pathname, prefix))) return 'challenge';
  return null;
};

/**
 * Until the edited challenge workbook is imported, keep existing Book data intact
 * and classify only the obvious ownership boundary:
 * - pure side quests belong to CHALLENGE
 * - legacy-backed non-external actions belong to CHALLENGE
 * - editorial external experiences stay BOOK-owned even when they expose a legacy
 *   challenge action as one of their available actions
 * - walk/audio/location experiences remain BOOK experiences
 */
export const getBookExperienceSurface = (experience: BookExperience): ProductSurface => {
  if (experience.type === 'external') return 'book';
  if (experience.type === 'sideQuest' || experience.legacyTaskId) return 'challenge';
  return 'book';
};

export const isBookOwnedExperience = (experience: BookExperience): boolean =>
  getBookExperienceSurface(experience) === 'book';

export const isChallengeOwnedExperience = (experience: BookExperience): boolean =>
  getBookExperienceSurface(experience) === 'challenge';
