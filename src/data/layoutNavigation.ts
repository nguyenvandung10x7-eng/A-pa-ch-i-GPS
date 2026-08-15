export type ShellNavigationItem = {
  id: string;
  path: string;
  labelKey: string;
};

export const SHELL_PEER_NAV_ITEMS: ShellNavigationItem[] = [
  { id: 'book', path: '/book', labelKey: 'nav.book' },
  { id: 'challenge', path: '/challenge', labelKey: 'nav.challenge' },
];

export const SHELL_STAFF_NAV_ITEMS: ShellNavigationItem[] = [
  { id: 'moderation', path: '/moderation', labelKey: 'nav.moderation' },
  { id: 'admin', path: '/admin', labelKey: 'nav.admin' },
];
