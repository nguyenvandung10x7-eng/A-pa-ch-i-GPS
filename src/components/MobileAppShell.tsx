import { useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { Bookmark, ChevronRight, LogIn, LogOut, UserRound, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { LanguageCode } from '../types/task';
import '../mobile-shell.css';

const labels = {
  vi: {
    book: 'BOOK',
    field: 'FIELD',
    signIn: 'Đăng nhập',
    saved: 'Dấu trang',
    language: 'Ngôn ngữ',
    privacy: 'Quyền riêng tư',
    legal: 'Pháp lý',
    signOut: 'Đăng xuất',
    account: 'Tài khoản',
  },
  en: {
    book: 'BOOK',
    field: 'FIELD',
    signIn: 'Sign in',
    saved: 'Bookmarks',
    language: 'Language',
    privacy: 'Privacy',
    legal: 'Legal',
    signOut: 'Sign out',
    account: 'Account',
  },
} as const;

type MobileAppShellProps = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  children: ReactNode;
};

const isBookSurface = (pathname: string) => (
  pathname === '/book'
  || pathname.startsWith('/book/')
  || pathname === '/saved'
  || pathname === '/nearby'
);

const isFieldSurface = (pathname: string) => (
  pathname === '/challenge'
  || pathname.startsWith('/challenge/')
  || pathname === '/discover'
  || pathname === '/leaderboard'
  || pathname === '/submit-tiktok'
);

const getUserLabel = (user: ReturnType<typeof useAuth>['user']): string | null => {
  if (!user) return null;
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const name = metadata?.full_name ?? metadata?.name;
  if (typeof name === 'string' && name.trim()) return name.trim().split(/\s+/).slice(-2).join(' ');
  if (typeof user.email === 'string' && user.email) return user.email.split('@')[0];
  return null;
};

export const MobileAppShell = ({ language, setLanguage, children }: MobileAppShellProps) => {
  const { pathname } = useLocation();
  const { user, loading, signIn, signOutUser } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const copy = labels[language];
  const normalizedPathname = pathname.toLowerCase();
  const readingMode = normalizedPathname.startsWith('/book/page/');
  const userLabel = useMemo(() => getUserLabel(user), [user]);

  useLayoutEffect(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    document.body.classList.add('public-shell-active');

    return () => {
      document.body.classList.remove('public-shell-active');
    };
  }, []);

  const handleAccountAction = () => {
    if (loading) return;
    if (!user) {
      void signIn(`${window.location.origin}${window.location.pathname}`);
      return;
    }
    setAccountOpen(true);
  };

  return (
    <div className={`editorial-shell min-h-dvh ${isFieldSurface(normalizedPathname) ? 'editorial-shell--field' : 'editorial-shell--book'}`}>
      <div className={`editorial-shell__frame mx-auto min-h-dvh w-full max-w-[60rem] ${readingMode ? 'pb-0' : 'pb-[calc(4.5rem+env(safe-area-inset-bottom))]'}`}>
        <header className="editorial-shell__header">
          <Link to="/book" className="editorial-shell__brand" aria-label="Book of Dien Bien">
            BOOK OF DIEN BIEN
          </Link>
          <button type="button" onClick={handleAccountAction} className="editorial-shell__account">
            {user ? <UserRound aria-hidden="true" /> : <LogIn aria-hidden="true" />}
            <span>{loading ? '…' : userLabel ?? copy.signIn}</span>
          </button>
        </header>

        {children}
      </div>

      {!readingMode && (
        <nav aria-label={language === 'vi' ? 'Hai không gian chính' : 'Primary surfaces'} className="editorial-shell__surface-nav">
          <div className="editorial-shell__surface-nav-inner">
            <NavLink to="/book" className={() => isBookSurface(normalizedPathname) ? 'is-active' : ''}>{copy.book}</NavLink>
            <span aria-hidden="true" />
            <NavLink to="/challenge" className={() => isFieldSurface(normalizedPathname) ? 'is-active' : ''}>{copy.field}</NavLink>
          </div>
        </nav>
      )}

      {accountOpen && user && (
        <div className="editorial-account-layer" role="presentation" onMouseDown={() => setAccountOpen(false)}>
          <aside className="editorial-account-sheet" role="dialog" aria-modal="true" aria-label={copy.account} onMouseDown={(event) => event.stopPropagation()}>
            <div className="editorial-account-sheet__head">
              <div>
                <p>{copy.account}</p>
                <strong>{userLabel ?? user.email ?? copy.account}</strong>
                {user.email && userLabel && <small>{user.email}</small>}
              </div>
              <button type="button" onClick={() => setAccountOpen(false)} aria-label="Close"><X /></button>
            </div>

            <div className="editorial-account-sheet__links">
              <Link to="/saved" onClick={() => setAccountOpen(false)}><Bookmark /><span>{copy.saved}</span><ChevronRight /></Link>
              <button type="button" onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}>
                <span className="editorial-account-sheet__text-icon">Aa</span><span>{copy.language}</span><strong>{language === 'vi' ? 'Tiếng Việt' : 'English'}</strong>
              </button>
              <Link to="/privacy" onClick={() => setAccountOpen(false)}><span className="editorial-account-sheet__text-icon">§</span><span>{copy.privacy}</span><ChevronRight /></Link>
              <Link to="/legal" onClick={() => setAccountOpen(false)}><span className="editorial-account-sheet__text-icon">i</span><span>{copy.legal}</span><ChevronRight /></Link>
            </div>

            <button
              type="button"
              className="editorial-account-sheet__logout"
              onClick={() => {
                setAccountOpen(false);
                void signOutUser();
              }}
            >
              <LogOut /> {copy.signOut}
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};
