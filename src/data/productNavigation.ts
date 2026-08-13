import type { ProductSurface } from './productSurfaces';

export type ProductNavigationItem = {
  path: string;
  labelKey: string;
  surface: ProductSurface;
  role: 'entry' | 'utility';
};

/**
 * Navigation model for the app's two equal product halves.
 *
 * BOOK and CHALLENGE are the only top-level entry points. Supporting routes are
 * intentionally secondary so utilities do not compete with the product model.
 */
export const PRODUCT_NAVIGATION_ITEMS: ProductNavigationItem[] = [
  { path: '/book', labelKey: 'nav.book', surface: 'book', role: 'entry' },
  { path: '/challenge', labelKey: 'nav.challenge', surface: 'challenge', role: 'entry' },

  { path: '/near-me', labelKey: 'nav.nearMe', surface: 'book', role: 'utility' },
  { path: '/saved', labelKey: 'nav.saved', surface: 'book', role: 'utility' },
  { path: '/experiences', labelKey: 'nav.experiences', surface: 'book', role: 'utility' },

  { path: '/discover', labelKey: 'nav.discover', surface: 'challenge', role: 'utility' },
  { path: '/leaderboard', labelKey: 'nav.leaderboard', surface: 'challenge', role: 'utility' },
  { path: '/history', labelKey: 'nav.history', surface: 'challenge', role: 'utility' },
];

export const PRODUCT_ENTRY_NAVIGATION = PRODUCT_NAVIGATION_ITEMS.filter(
  (item) => item.role === 'entry',
);

export const BOOK_UTILITY_NAVIGATION = PRODUCT_NAVIGATION_ITEMS.filter(
  (item) => item.surface === 'book' && item.role === 'utility',
);

export const CHALLENGE_UTILITY_NAVIGATION = PRODUCT_NAVIGATION_ITEMS.filter(
  (item) => item.surface === 'challenge' && item.role === 'utility',
);

export const getProductNavigationForSurface = (surface: ProductSurface) =>
  PRODUCT_NAVIGATION_ITEMS.filter((item) => item.surface === surface);
