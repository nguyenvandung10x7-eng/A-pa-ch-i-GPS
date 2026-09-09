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
      '/guild',
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

const matchesPath = (pathname: string, prefix: string): boolean => {
  const normalizedPathname = pathname.toLowerCase();
  const normalizedPrefix = prefix.toLowerCase();
  return normalizedPathname === normalizedPrefix || normalizedPathname.startsWith(`${normalizedPrefix}/`);
};

export const resolveProductSurface = (pathname: string): ProductSurface | null => {
  if (BOOK_PATH_PREFIXES.some((prefix) => matchesPath(pathname, prefix))) return 'book';
  if (CHALLENGE_PATH_PREFIXES.some((prefix) => matchesPath(pathname, prefix))) return 'challenge';
  return null;
};

/**
 * Until the edited challenge workbook is imported, preserve Book experiences as
 * editorial objects and classify only explicit side quests as Challenge-owned.
 *
 * A legacyTaskId is a bridge to a Challenge action, not ownership of the whole
 * Book experience. That lets walk/audio/location/external experiences remain in
 * Book even when they can launch or reflect a legacy challenge task.
 */
export const getBookExperienceSurface = (experience: BookExperience): ProductSurface =>
  experience.type === 'sideQuest' ? 'challenge' : 'book';

export const isBookOwnedExperience = (experience: BookExperience): boolean =>
  getBookExperienceSurface(experience) === 'book';

export const isChallengeOwnedExperience = (experience: BookExperience): boolean =>
  getBookExperienceSurface(experience) === 'challenge';
