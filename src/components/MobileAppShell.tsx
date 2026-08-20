import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Bookmark, ChevronRight, LogIn, LogOut, Music2, Pause, Play, UserRound, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BOOK_MUSIC_TRACKS } from '../data/music';
import { getChapter, getPage } from '../services/bookContent';
import type { LanguageCode } from '../types/task';
import '../mobile-shell.css';

const BOOK_SOUND_STORAGE_KEY = 'book-of-dien-bien-sound-enabled-v1';

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
    sound: 'Âm thanh',
    soundOn: 'Đang bật',
    soundOff: 'Bật âm thanh',
    soundBlocked: 'Chạm để phát',
    nowPlaying: 'Đang phát',
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
    sound: 'Sound',
    soundOn: 'On',
    soundOff: 'Enable sound',
    soundBlocked: 'Tap to play',
    nowPlaying: 'Now playing',
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

const readBookSoundEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(BOOK_SOUND_STORAGE_KEY) === '1';
};

const getChapterIdFromPath = (pathname: string): string | null => {
  const chapterMatch = pathname.match(/^\/book\/chapter\/([^/]+)/i);
  if (chapterMatch?.[1]) return decodeURIComponent(chapterMatch[1]);

  const pageMatch = pathname.match(/^\/book\/page\/([^/]+)/i);
  if (!pageMatch?.[1]) return null;
  const page = getPage(decodeURIComponent(pageMatch[1]));
  return page?.chapterId ?? null;
};

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
  const [bookSoundEnabled, setBookSoundEnabled] = useState(readBookSoundEnabled);
  const [bookSoundPlaying, setBookSoundPlaying] = useState(false);
  const [bookSoundBlocked, setBookSoundBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const copy = labels[language];
  const normalizedPathname = pathname.toLowerCase();
  const readingMode = normalizedPathname.startsWith('/book/page/');
  const userLabel = useMemo(() => getUserLabel(user), [user]);
  const activeChapterId = useMemo(() => getChapterIdFromPath(pathname), [pathname]);
  const activeChapter = useMemo(() => activeChapterId ? getChapter(activeChapterId) : undefined, [activeChapterId]);
  const activeBookTrack = useMemo(() => {
    if (!activeChapter?.music?.trackId) return undefined;
    return BOOK_MUSIC_TRACKS.find((track) => track.id === activeChapter.music.trackId);
  }, [activeChapter]);

  useLayoutEffect(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    document.body.classList.add('public-shell-active');

    return () => {
      document.body.classList.remove('public-shell-active');
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(BOOK_SOUND_STORAGE_KEY, bookSoundEnabled ? '1' : '0');
  }, [bookSoundEnabled]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setBookSoundPlaying(true);
    const handlePause = () => setBookSoundPlaying(false);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!activeBookTrack || !isBookSurface(normalizedPathname)) {
      audio.pause();
      setBookSoundBlocked(false);
      return;
    }

    const source = `/audio/${activeBookTrack.fileName}`;
    if (audio.dataset.trackId !== activeBookTrack.id) {
      audio.pause();
      audio.src = source;
      audio.dataset.trackId = activeBookTrack.id;
      audio.load();
    }

    if (!bookSoundEnabled) {
      audio.pause();
      setBookSoundBlocked(false);
      return;
    }

    void audio.play()
      .then(() => setBookSoundBlocked(false))
      .catch(() => {
        setBookSoundPlaying(false);
        setBookSoundBlocked(true);
      });
  }, [activeBookTrack, bookSoundEnabled, normalizedPathname]);

  const toggleBookSound = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (bookSoundEnabled && !bookSoundBlocked) {
      audio.pause();
      setBookSoundEnabled(false);
      setBookSoundBlocked(false);
      return;
    }

    setBookSoundEnabled(true);
    if (!activeBookTrack) return;

    if (audio.dataset.trackId !== activeBookTrack.id) {
      audio.src = `/audio/${activeBookTrack.fileName}`;
      audio.dataset.trackId = activeBookTrack.id;
      audio.load();
    }

    void audio.play()
      .then(() => setBookSoundBlocked(false))
      .catch(() => setBookSoundBlocked(true));
  };

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
          <div className="editorial-shell__header-actions">
            <button
              type="button"
              onClick={toggleBookSound}
              className={`editorial-shell__sound ${bookSoundEnabled ? 'is-enabled' : ''}`}
              aria-pressed={bookSoundEnabled}
              title={bookSoundBlocked ? copy.soundBlocked : bookSoundEnabled ? copy.soundOn : copy.soundOff}
            >
              {bookSoundPlaying ? <Pause aria-hidden="true" /> : bookSoundEnabled ? <Music2 aria-hidden="true" /> : <Play aria-hidden="true" />}
              <span>{bookSoundBlocked ? copy.soundBlocked : copy.sound}</span>
            </button>
            <button type="button" onClick={handleAccountAction} className="editorial-shell__account">
              {user ? <UserRound aria-hidden="true" /> : <LogIn aria-hidden="true" />}
              <span>{loading ? '…' : userLabel ?? copy.signIn}</span>
            </button>
          </div>
        </header>

        {readingMode && activeBookTrack && bookSoundEnabled && (
          <div className={`editorial-soundtrack-pop ${bookSoundBlocked ? 'is-blocked' : ''}`}>
            <Music2 aria-hidden="true" />
            <div>
              <small>{bookSoundBlocked ? copy.soundBlocked : copy.nowPlaying}</small>
              <strong>{activeBookTrack.label[language]}</strong>
            </div>
            <button type="button" onClick={toggleBookSound} aria-label={bookSoundPlaying ? 'Pause' : 'Play'}>
              {bookSoundPlaying ? <Pause /> : <Play />}
            </button>
          </div>
        )}

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
              <button type="button" onClick={toggleBookSound}>
                <Music2 /><span>{copy.sound}</span><strong>{bookSoundEnabled ? copy.soundOn : copy.soundOff}</strong>
              </button>
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

      <audio ref={audioRef} preload="metadata" className="editorial-book-audio" />
    </div>
  );
};
