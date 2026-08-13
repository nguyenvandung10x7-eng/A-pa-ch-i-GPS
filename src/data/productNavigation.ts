import type { ProductSurface } from './productSurfaces';

export type ProductNavigationItem = {
  id: string;
  path: string;
  labelKey: string;
  surface: ProductSurface;
  kind: 'primary' | 'utility' | 'staff';
};

/**
 * Product navigation is deliberately split into two equal entry points.
 *
 * BOOK is the editorial/memory half of the app. CHALLENGE is the playful GPS/action
 * half. Utility routes remain associated with one surface without becoming equal
 * top-level products themselves.
 */
export const PRODUCT_ENTRY_POINTS: ReadonlyArray<ProductNavigationItem> = [
  {
    id: 'book',
    path: '/book',
    labelKey: 'nav.book',
    surface: 'book',
    kind: 'primary',
  },
  {
    id: 'challenge',
    path: '/challenge',
    labelKey: 'nav.challenge',
    surface: 'challenge',
    kind: 'primary',
  },
];

export const BOOK_NAVIGATION_ITEMS: ReadonlyArray<ProductNavigationItem> = [
  {
    id: 'near-me',
    path: '/near-me',
    labelKey: 'nav.nearMe',
    surface: 'book',
    kind: 'utility',
  },
  {
    id: 'saved',
    path: '/saved',
    labelKey: 'nav.saved',
    surface: 'book',
    kind: 'utility',
  },
  {
    id: 'experiences',
    path: '/experiences',
    labelKey: 'nav.experiences',
    surface: 'book',
    kind: 'utility',
  },
];

export const CHALLENGE_NAVIGATION_ITEMS: ReadonlyArray<ProductNavigationItem> = [
  {
    id: 'discover',
    path: '/discover',
    labelKey: 'nav.discover',
    surface: 'challenge',
    kind: 'utility',
  },
  {
    id: 'leaderboard',
    path: '/leaderboard',
    labelKey: 'nav.leaderboard',
    surface: 'challenge',
    kind: 'utility',
  },
  {
    id: 'history',
    path: '/history',
    labelKey: 'nav.history',
    surface: 'challenge',
    kind: 'utility',
  },
];

export const CHALLENGE_STAFF_NAVIGATION_ITEMS: ReadonlyArray<ProductNavigationItem> = [
  {
    id: 'moderation',
    path: '/moderation',
    labelKey: 'nav.moderation',
    surface: 'challenge',
    kind: 'staff',
  },
  {
    id: 'admin',
    path: '/admin',
    labelKey: 'nav.admin',
    surface: 'challenge',
    kind: 'staff',
  },
];

export const getNavigationItemsForSurface = (
  surface: ProductSurface,
  options: { includeStaff?: boolean } = {},
): ReadonlyArray<ProductNavigationItem> => {
  if (surface === 'book') return BOOK_NAVIGATION_ITEMS;

  return options.includeStaff
    ? [...CHALLENGE_NAVIGATION_ITEMS, ...CHALLENGE_STAFF_NAVIGATION_ITEMS]
    : CHALLENGE_NAVIGATION_ITEMS;
};
