import type { ReactNode } from 'react';
import { Bookmark, BookOpen, Clock3, Flag, MapPinned } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import type { LanguageCode } from '../types/task';

const labels = {
  vi: {
    book: 'Đọc sách',
    recent: 'Gần đây',
    saved: 'Đã lưu',
    nearby: 'Tìm quanh',
    challenge: 'Thử thách',
  },
  en: {
    book: 'Book',
    recent: 'Recent',
    saved: 'Saved',
    nearby: 'Nearby',
    challenge: 'Challenge',
  },
} as const;

const tabs = [
  { id: 'book', path: '/book', icon: BookOpen },
  { id: 'recent', path: '/recent', icon: Clock3 },
  { id: 'saved', path: '/saved', icon: Bookmark },
  { id: 'nearby', path: '/nearby', icon: MapPinned },
  { id: 'challenge', path: '/challenge', icon: Flag },
] as const;

type MobileAppShellProps = {
  language: LanguageCode;
  children: ReactNode;
};

const isTabActive = (pathname: string, path: string) => {
  if (path === '/book') return pathname === '/book' || pathname.startsWith('/book/');
  if (path === '/challenge') return pathname === '/challenge' || pathname.startsWith('/challenge/');
  return pathname === path || pathname.startsWith(`${path}/`);
};

export const MobileAppShell = ({ language, children }: MobileAppShellProps) => {
  const { pathname } = useLocation();
  const copy = labels[language];

  return (
    <div className="new-public-shell min-h-dvh bg-[#f4efe3] text-[#183321]">
      <main className="mx-auto min-h-dvh w-full max-w-[54rem] pb-[calc(5.7rem+env(safe-area-inset-bottom))]">
        {children}
      </main>

      <nav
        aria-label={language === 'vi' ? 'Điều hướng chính' : 'Primary navigation'}
        className="fixed inset-x-0 bottom-0 z-[90] border-t border-[#d8cfbd] bg-[rgba(248,244,235,0.96)] px-2 pb-[calc(.45rem+env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl"
      >
        <div className="mx-auto grid max-w-[54rem] grid-cols-5 gap-1">
          {tabs.map(({ id, path, icon: Icon }) => {
            const active = isTabActive(pathname, path);
            return (
              <NavLink
                key={id}
                to={path}
                className={`flex min-h-[3.9rem] flex-col items-center justify-center gap-1 rounded-xl px-1 text-[0.66rem] font-semibold transition ${active ? 'text-[#173e26]' : 'text-[#6f6a5d]'}`}
              >
                <span className={`flex h-7 w-8 items-center justify-center rounded-full ${active ? 'bg-[#e5eadc]' : ''}`}>
                  <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={active ? 2.1 : 1.7} />
                </span>
                <span>{copy[id]}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
