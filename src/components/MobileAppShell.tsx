import { useLayoutEffect, type ReactNode } from 'react';
import { Bookmark, BookOpen, Clock3, Flag, MapPinned } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import type { LanguageCode } from '../types/task';
import '../mobile-shell.css';

const labels = {
  vi: {
    book: 'Đọc sách',
    recent: 'Gần đây',
    saved: 'Đã lưu',
    nearby: 'Tìm quanh',
    challenge: 'Thử thách',
    privacy: 'Quyền riêng tư',
    legal: 'Pháp lý',
    language: 'Ngôn ngữ',
  },
  en: {
    book: 'Book',
    recent: 'Recent',
    saved: 'Saved',
    nearby: 'Nearby',
    challenge: 'Challenge',
    privacy: 'Privacy',
    legal: 'Legal',
    language: 'Language',
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
  setLanguage: (language: LanguageCode) => void;
  children: ReactNode;
};

const isTabActive = (pathname: string, path: string) => {
  if (path === '/book') return pathname === '/book' || pathname.startsWith('/book/');
  if (path === '/challenge') return pathname === '/challenge' || pathname.startsWith('/challenge/');
  return pathname === path || pathname.startsWith(`${path}/`);
};

export const MobileAppShell = ({ language, setLanguage, children }: MobileAppShellProps) => {
  const { pathname } = useLocation();
  const copy = labels[language];
  const normalizedPathname = pathname.toLowerCase();

  useLayoutEffect(() => {
    // Layout remains mounted across staff/public route transitions. If its legacy
    // mobile menu was left open, Escape closes it before the public shell paints.
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    document.body.classList.add('public-shell-active');

    return () => {
      document.body.classList.remove('public-shell-active');
    };
  }, []);

  return (
    <div className="new-public-shell min-h-dvh bg-[#f4efe3] text-[#183321]">
      <div className="mx-auto min-h-dvh w-full max-w-[54rem] pb-[calc(5.7rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-end gap-2 px-3 pt-2 text-[0.7rem] font-semibold text-[#6f6a5d] sm:px-4">
          <span className="sr-only">{copy.language}</span>
          <button
            type="button"
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            className="rounded-full border border-[#d8cfbd] bg-[rgba(255,250,240,0.88)] px-3 py-1.5 text-[#35513b]"
            aria-label={language === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
          >
            {language === 'vi' ? 'EN' : 'VI'}
          </button>
        </div>

        {children}

        <footer className="mx-3 mt-4 flex items-center justify-center gap-4 border-t border-[#d8cfbd] px-3 py-5 text-[0.72rem] font-semibold text-[#6f6a5d] sm:mx-4">
          <Link to="/privacy" className="hover:text-[#35513b]">{copy.privacy}</Link>
          <Link to="/legal" className="hover:text-[#35513b]">{copy.legal}</Link>
        </footer>
      </div>

      <nav
        aria-label={language === 'vi' ? 'Điều hướng chính' : 'Primary navigation'}
        className="fixed inset-x-0 bottom-0 z-[90] border-t border-[#d8cfbd] bg-[rgba(248,244,235,0.96)] px-2 pb-[calc(.45rem+env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl"
      >
        <div className="mx-auto grid max-w-[54rem] grid-cols-5 gap-1">
          {tabs.map(({ id, path, icon: Icon }) => {
            const active = isTabActive(normalizedPathname, path);
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
