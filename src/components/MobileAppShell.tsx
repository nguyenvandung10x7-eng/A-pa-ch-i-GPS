import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BookOpen, Bookmark, ChevronRight, ChevronUp, Languages, LogIn, LogOut, MapPin, Music2, Pause, Play, UserRound, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookChapterDrawer } from './BookChapterDrawer';
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
    nearby: 'Gần tôi',
    language: 'Ngôn ngữ',
    privacy: 'Quyền riêng tư',
    legal: 'Pháp lý',
    credits: 'Nguồn ảnh',
    signOut: 'Đăng xuất',
    account: 'Tài khoản',
    close: 'Đóng',
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
    nearby: 'Near me',
    language: 'Language',
    privacy: 'Privacy',
    legal: 'Legal',
    credits: 'Credits',
    signOut: 'Sign out',
    account: 'Account',
    close: 'Close',
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

const normalizePublicPathname = (pathname: string): string =>
  pathname.toLowerCase().replace(/\/+$/, '') || '/';

const isBookSurface = (pathname: string) => (
  pathname === '/book'
  || pathname.startsWith('/book/')
  || pathname === '/saved'
  || pathname === '/nearby'
  || pathname === '/credits'
);

const isFieldSurface = (pathname: string) => (
  pathname === '/challenge'
  || pathname.startsWith('/challenge/')
  || pathname === '/map'
  || pathname === '/discover'
  || pathname === '/leaderboard'
  || pathname === '/submit-tiktok'
);

const readBookSoundEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(BOOK_SOUND_STORAGE_KEY) === '1';
};

const coordinateAudioPlayback = (activeAudio: HTMLAudioElement) => {
  document.querySelectorAll<HTMLAudioElement>('audio').forEach((audio) => {
    if (audio !== activeAudio && !audio.paused) audio.pause();
  });
};

const getGlobalAppAudio = (): HTMLAudioElement | null =>
  document.querySelector<HTMLAudioElement>('.app-shell > audio');

const safeDecodeRouteSegment = (segment: string): string | null => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
};

const getChapterIdFromPath = (pathname: string): string | null => {
  const chapterMatch = pathname.match(/^\/book\/chapter\/([^/]+)/i);
  if (chapterMatch?.[1]) {
    const chapterId = safeDecodeRouteSegment(chapterMatch[1]);
    return chapterId && getChapter(chapterId) ? chapterId : null;
  }

  const pageMatch = pathname.match(/^\/book\/page\/([^/]+)/i);
  if (!pageMatch?.[1]) return null;
  const pageId = safeDecodeRouteSegment(pageMatch[1]);
  if (!pageId) return null;
  const page = getPage(pageId);
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
  const [bookMenuOpen, setBookMenuOpen] = useState(false);
  const [bookSoundEnabled, setBookSoundEnabled] = useState(readBookSoundEnabled);
  const [bookSoundPlaying, setBookSoundPlaying] = useState(false);
  const [bookSoundBlocked, setBookSoundBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pausedAppAudioRef = useRef<HTMLAudioElement | null>(null);
  const accountButtonRef = useRef<HTMLButtonElement | null>(null);
  const accountDialogRef = useRef<HTMLElement | null>(null);
  const restoreAccountFocusRef = useRef(true);
  const copy = labels[language];
  const normalizedPathname = normalizePublicPathname(pathname);
  const onBookSurface = isBookSurface(normalizedPathname);
  const onExploreSurface = normalizedPathname === '/challenge';
  const readingMode = normalizedPathname.startsWith('/book/chapter/')
    || normalizedPathname.startsWith('/book/page/');
  const userLabel = useMemo(() => getUserLabel(user), [user]);
  const activeChapterId = useMemo(() => getChapterIdFromPath(pathname), [pathname]);
  const activeChapter = useMemo(() => activeChapterId ? getChapter(activeChapterId) : undefined, [activeChapterId]);
  const activeBookTrack = useMemo(() => {
    if (!activeChapter?.music?.trackId) return undefined;
    return BOOK_MUSIC_TRACKS.find((track) => track.id === activeChapter.music.trackId);
  }, [activeChapter]);

  const rememberPlayingAppAudio = () => {
    const appAudio = getGlobalAppAudio();
    if (appAudio && !appAudio.paused) pausedAppAudioRef.current = appAudio;
  };

  const restorePausedAppAudio = () => {
    const appAudio = pausedAppAudioRef.current;
    pausedAppAudioRef.current = null;
    if (!appAudio || !appAudio.isConnected || !appAudio.paused) return;
    void appAudio.play().catch(() => {
      // Challenge owns its own playback preference/error state. Restoration here
      // only yields control back to that existing engine after Book audio paused it.
    });
  };

  useLayoutEffect(() => {
    const bookAudio = audioRef.current;
    const rememberBeforeAnyBookAudio = (event: Event) => {
      if (!(event.target instanceof HTMLAudioElement)) return;
      if (!isBookSurface(normalizePublicPathname(window.location.pathname))) return;
      const appAudio = getGlobalAppAudio();
      if (!appAudio || event.target === appAudio || appAudio.paused) return;
      pausedAppAudioRef.current = appAudio;
    };

    document.addEventListener('play', rememberBeforeAnyBookAudio, true);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    document.body.classList.add('public-shell-active');

    return () => {
      document.removeEventListener('play', rememberBeforeAnyBookAudio, true);
      if (bookAudio) bookAudio.pause();
      restorePausedAppAudio();
      document.body.classList.remove('public-shell-active');
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(BOOK_SOUND_STORAGE_KEY, bookSoundEnabled ? '1' : '0');
  }, [bookSoundEnabled]);

  useEffect(() => {
    if (!accountOpen) return;
    const dialog = accountDialogRef.current;
    if (!dialog) return;

    const previouslyFocused = document.activeElement;
    const accountButton = accountButtonRef.current;
    const getFocusableElements = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ));

    const initialFocusable = getFocusableElements();
    (initialFocusable[0] ?? dialog).focus();

    const handleDialogKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setAccountOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (!(activeElement instanceof Node) || !dialog.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleDialogKeyDown);
    return () => {
      document.removeEventListener('keydown', handleDialogKeyDown);
      if (restoreAccountFocusRef.current) {
        if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
          previouslyFocused.focus();
        } else {
          accountButton?.focus();
        }
      }
      restoreAccountFocusRef.current = true;
    };
  }, [accountOpen]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      coordinateAudioPlayback(audio);
      setBookSoundPlaying(true);
    };
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
    let cancelled = false;
    const clearBlockedState = () => {
      queueMicrotask(() => {
        if (!cancelled) setBookSoundBlocked(false);
      });
    };

    if (!activeBookTrack || !onBookSurface) {
      audio.pause();
      clearBlockedState();
      if (!onBookSurface) restorePausedAppAudio();
      return () => { cancelled = true; };
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
      clearBlockedState();
      return () => { cancelled = true; };
    }

    rememberPlayingAppAudio();
    void audio.play()
      .then(() => {
        if (!cancelled) setBookSoundBlocked(false);
      })
      .catch(() => {
        if (cancelled) return;
        setBookSoundPlaying(false);
        setBookSoundBlocked(true);
      });
    return () => { cancelled = true; };
  }, [activeBookTrack, bookSoundEnabled, onBookSurface]);

  const toggleBookSound = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!activeBookTrack) {
      setBookSoundEnabled((current) => !current);
      setBookSoundBlocked(false);
      return;
    }

    if (bookSoundPlaying) {
      audio.pause();
      setBookSoundEnabled(false);
      setBookSoundBlocked(false);
      return;
    }

    setBookSoundEnabled(true);

    if (audio.dataset.trackId !== activeBookTrack.id) {
      audio.src = `/audio/${activeBookTrack.fileName}`;
      audio.dataset.trackId = activeBookTrack.id;
      audio.load();
    }

    rememberPlayingAppAudio();
    void audio.play()
      .then(() => setBookSoundBlocked(false))
      .catch(() => setBookSoundBlocked(true));
  };

  const closeAccountDialog = (restoreFocus = true) => {
    restoreAccountFocusRef.current = restoreFocus;
    setAccountOpen(false);
  };

  const handleAccountAction = () => {
    if (loading) return;
    restoreAccountFocusRef.current = true;
    setAccountOpen(true);
  };

  const handleSignIn = () => {
    closeAccountDialog(false);
    const { origin, pathname: currentPathname, search, hash } = window.location;
    void signIn(`${origin}${currentPathname}${search}${hash}`);
  };

  return (
    <div className={`editorial-shell min-h-dvh ${isFieldSurface(normalizedPathname) ? 'editorial-shell--field' : 'editorial-shell--book'} ${onExploreSurface ? 'editorial-shell--explore' : ''}`}>
      <div className="editorial-shell__frame mx-auto min-h-dvh w-full max-w-[72rem] pb-[calc(5.6rem+env(safe-area-inset-bottom))]">
        <header className="editorial-shell__header">
          <Link to="/book" className="editorial-shell__brand" aria-label="Book of Dien Bien">
            BOOK OF DIEN BIEN
          </Link>
          <div className="editorial-shell__header-actions">
            {onBookSurface ? (
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
            ) : null}
            <button
              ref={onExploreSurface ? undefined : accountButtonRef}
              type="button"
              onClick={handleAccountAction}
              className="editorial-shell__account"
              aria-haspopup="dialog"
              aria-expanded={accountOpen}
              aria-controls={accountOpen ? 'editorial-account-dialog' : undefined}
            >
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

        {onExploreSurface ? (
          <div className="editorial-shell__explore-tools" aria-label={language === 'vi' ? 'Tài khoản và ngôn ngữ' : 'Account and language'}>
            <button
              ref={accountButtonRef}
              type="button"
              className="editorial-shell__explore-account"
              onClick={handleAccountAction}
              aria-haspopup="dialog"
              aria-expanded={accountOpen}
              aria-controls={accountOpen ? 'editorial-account-dialog' : undefined}
            >
              {user ? <UserRound aria-hidden="true" /> : <LogIn aria-hidden="true" />}
              <span>{loading ? '…' : userLabel ?? copy.signIn}</span>
            </button>
            <button
              type="button"
              className="editorial-shell__explore-language"
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              aria-label={language === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
            >
              <Languages aria-hidden="true" />
              <strong>{language.toUpperCase()}</strong>
            </button>
          </div>
        ) : null}

        {children}
      </div>

      <nav aria-label={language === 'vi' ? 'Điều hướng chính' : 'Primary navigation'} className="editorial-shell__surface-nav">
        <div className="editorial-shell__surface-nav-inner">
          <NavLink to="/challenge" className={({ isActive }) => isActive ? 'is-active' : ''}>
            <span className="editorial-shell__nav-emoji" aria-hidden="true">🔭</span><span>{language === 'vi' ? 'Khám phá' : 'Explore'}</span>
          </NavLink>
          <NavLink to="/map" className={({ isActive }) => isActive ? 'is-active' : ''}>
            <span className="editorial-shell__nav-emoji" aria-hidden="true">🗺️</span><span>{language === 'vi' ? 'Bản đồ' : 'Map'}</span>
          </NavLink>
          <button
            type="button"
            className={onBookSurface || bookMenuOpen ? 'is-active' : ''}
            onClick={() => setBookMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={bookMenuOpen}
          >
            <BookOpen className="editorial-shell__nav-book" aria-hidden="true" /><span>{language === 'vi' ? 'Cuốn sách' : 'Book'}</span><ChevronUp className="editorial-shell__nav-chevron" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {bookMenuOpen ? <BookChapterDrawer language={language} onClose={() => setBookMenuOpen(false)} /> : null}

      {accountOpen ? (
        <div className="editorial-account-layer" role="presentation" onMouseDown={() => closeAccountDialog()}>
          <aside
            ref={accountDialogRef}
            id="editorial-account-dialog"
            className="editorial-account-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={copy.account}
            tabIndex={-1}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="editorial-account-sheet__head">
              <div>
                <p>{copy.account}</p>
                <strong>{user ? userLabel ?? user.email ?? copy.account : copy.signIn}</strong>
                {user?.email && userLabel ? <small>{user.email}</small> : null}
              </div>
              <button type="button" onClick={() => closeAccountDialog()} aria-label={copy.close}><X aria-hidden="true" /></button>
            </div>

            <div className="editorial-account-sheet__links">
              <Link to="/saved" onClick={() => closeAccountDialog(false)}><Bookmark /><span>{copy.saved}</span><ChevronRight /></Link>
              <Link to="/nearby" onClick={() => closeAccountDialog(false)}><MapPin /><span>{copy.nearby}</span><ChevronRight /></Link>
              {onBookSurface ? (
                <button type="button" onClick={toggleBookSound}>
                  <Music2 /><span>{copy.sound}</span><strong>{bookSoundEnabled ? copy.soundOn : copy.soundOff}</strong>
                </button>
              ) : null}
              <button type="button" onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}>
                <span className="editorial-account-sheet__text-icon">Aa</span><span>{copy.language}</span><strong>{language === 'vi' ? 'Tiếng Việt' : 'English'}</strong>
              </button>
              <Link to="/privacy" onClick={() => closeAccountDialog(false)}><span className="editorial-account-sheet__text-icon">§</span><span>{copy.privacy}</span><ChevronRight /></Link>
              <Link to="/legal" onClick={() => closeAccountDialog(false)}><span className="editorial-account-sheet__text-icon">i</span><span>{copy.legal}</span><ChevronRight /></Link>
              <Link to="/credits" onClick={() => closeAccountDialog(false)}><span className="editorial-account-sheet__text-icon">©</span><span>{copy.credits}</span><ChevronRight /></Link>
            </div>

            {user ? (
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
            ) : (
              <button type="button" className="editorial-account-sheet__login" onClick={handleSignIn}>
                <LogIn /> {copy.signIn}
              </button>
            )}
          </aside>
        </div>
      ) : null}

      <audio ref={audioRef} preload="metadata" className="editorial-book-audio" />
    </div>
  );
};
