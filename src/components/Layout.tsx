import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, Compass, Loader2, Menu, Music2, Pause, Play, Volume2, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { LanguageSwitch } from './LanguageSwitch';
import type { LanguageCode } from '../types/task';

type LayoutProps = { children: ReactNode; language: LanguageCode; setLanguage: (language: LanguageCode) => void; t: (key: string) => string };

type MusicTrack = { id: string; fileName: string; labelKey: string };
type MusicSettings = { enabled: boolean; volume: number; trackId: string };
type MusicPreparationSnapshot = { trackId: string | null; currentTime: number; wasPlaying: boolean; wasMuted: boolean; previousVolume: number };
type PlayMusicOptions = { restart?: boolean; muted?: boolean; preserveShuffleQueue?: boolean; context: string };

const MUSIC_STORAGE_KEY = 'gps-music-settings-v1';
const GAMEPLAY_MUSIC_ACTION_EVENT = 'gps:challenge-music-action';
const GAMEPLAY_MUSIC_PREPARE_EVENT = 'gps:challenge-music-prepare';
const GAMEPLAY_MUSIC_ADVANCE_EVENT = 'gps:challenge-task-received';
const GAMEPLAY_MUSIC_CANCEL_EVENT = 'gps:challenge-music-cancel';
const MUSIC_TRACKS: MusicTrack[] = [
  { id: 'hmong-ballad-1', fileName: 'hmong-ballad-1.mp3', labelKey: 'music.track.hmongBallad1' },
  { id: 'hmong-ballad-2', fileName: 'hmong-ballad-2.mp3', labelKey: 'music.track.hmongBallad2' },
  { id: 'thai-epic-1', fileName: 'thai-epic-1.mp3', labelKey: 'music.track.thaiEpic1' },
  { id: 'thai-epic-2', fileName: 'thai-epic-2.mp3', labelKey: 'music.track.thaiEpic2' },
  { id: 'thai-street-1', fileName: 'thai-street-1.mp3', labelKey: 'music.track.thaiStreet1' },
  { id: 'thai-street-2', fileName: 'thai-street-2.mp3', labelKey: 'music.track.thaiStreet2' },
  { id: 'hmongdisco', fileName: 'HMONGdisco.mp3', labelKey: 'music.track.hmongdisco' },
  { id: 'hmongdisco2', fileName: 'HMONGdisco2.mp3', labelKey: 'music.track.hmongdisco2' },
  { id: 'hatthai', fileName: 'HATTHAI.mp3', labelKey: 'music.track.hatthai' },
  { id: 'hmong', fileName: 'HMONG.mp3', labelKey: 'music.track.hmong' },
  { id: 'hmongrock2', fileName: 'HMONGrock2.mp3', labelKey: 'music.track.hmongrock2' },
];

const DEFAULT_TRACK_ID = MUSIC_TRACKS[0].id;
const DEFAULT_VOLUME = 0.25;

const isKnownTrack = (trackId: string) => MUSIC_TRACKS.some((track) => track.id === trackId);

const readMusicSettings = (): MusicSettings => {
  if (typeof window === 'undefined') {
    return { enabled: false, volume: DEFAULT_VOLUME, trackId: DEFAULT_TRACK_ID };
  }

  try {
    const rawValue = window.localStorage.getItem(MUSIC_STORAGE_KEY);
    if (!rawValue) {
      return { enabled: false, volume: DEFAULT_VOLUME, trackId: DEFAULT_TRACK_ID };
    }

    const parsed = JSON.parse(rawValue) as Partial<MusicSettings>;
    const nextVolume = Number.isFinite(parsed.volume) ? Math.max(0, Math.min(1, Number(parsed.volume))) : DEFAULT_VOLUME;
    const nextTrackId = typeof parsed.trackId === 'string' && isKnownTrack(parsed.trackId) ? parsed.trackId : DEFAULT_TRACK_ID;
    return { enabled: Boolean(parsed.enabled), volume: nextVolume, trackId: nextTrackId };
  } catch {
    return { enabled: false, volume: DEFAULT_VOLUME, trackId: DEFAULT_TRACK_ID };
  }
};

const shuffleTracks = <T,>(items: T[]): T[] => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
};

const createShuffleQueue = (tracks: MusicTrack[], excludeTrackId: string | null): string[] => {
  const trackIds = tracks.map((track) => track.id);
  if (trackIds.length <= 1) {
    return [];
  }

  return shuffleTracks(trackIds.filter((trackId) => trackId !== excludeTrackId));
};

const logMusicPlaybackWarning = (context: string, error: unknown) => {
  if (!import.meta.env.DEV) {
    return;
  }

  const errorName = error instanceof DOMException
    ? error.name
    : error instanceof Error
      ? error.name
      : 'UnknownError';

  console.warn(`[music] ${context} failed (${errorName}).`, error);
};

export const Layout = ({ children, language, setLanguage, t }: LayoutProps) => {
  const { user, loading, signIn, signOutUser } = useAuth();
  const { isAdmin, checkingAdmin } = useAdminStatus();
  const [authBusy, setAuthBusy] = useState(false);
  const [musicPickerOpen, setMusicPickerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileOpenSection, setMobileOpenSection] = useState<'music' | 'language' | 'account' | null>(null);
  const [musicEnabledPreference, setMusicEnabledPreference] = useState(() => readMusicSettings().enabled);
  const [musicVolume, setMusicVolume] = useState(() => readMusicSettings().volume);
  const [musicTrackId, setMusicTrackId] = useState(() => readMusicSettings().trackId);
  const [musicIsPlaying, setMusicIsPlaying] = useState(false);
  const [musicPlaybackError, setMusicPlaybackError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicEnabledPreferenceRef = useRef(musicEnabledPreference);
  const musicTrackIdRef = useRef(musicTrackId);
  const musicVolumeRef = useRef(musicVolume);
  const musicMenuRef = useRef<HTMLDivElement | null>(null);
  const musicPrepareSessionRef = useRef(0);
  const musicPrepareActiveRef = useRef(false);
  const musicAutoStartAllowedRef = useRef(false);
  const musicPreparedTrackIdRef = useRef<string | null>(null);
  const musicPreparationSnapshotRef = useRef<MusicPreparationSnapshot | null>(null);
  const musicShuffleQueueRef = useRef<string[]>(createShuffleQueue(MUSIC_TRACKS, musicTrackId));
  const selectedTrack = useMemo(() => MUSIC_TRACKS.find((track) => track.id === musicTrackId) ?? MUSIC_TRACKS[0], [musicTrackId]);
  const navItems: Array<[string, string]> = [
    ['/challenge', 'nav.challenge'],
    ['/history', 'nav.history'],
    ['/discover', 'nav.discover'],
    ['/leaderboard', 'nav.leaderboard'],
  ];
  const mobilePrimaryNavItems: Array<[string, string]> = [
    ['/challenge', 'nav.challenge'],
    ['/discover', 'nav.discover'],
    ['/leaderboard', 'nav.leaderboard'],
  ];
  const mobileSecondaryNavItems: Array<[string, string]> = [['/history', 'nav.history']];

  if (user && !checkingAdmin && isAdmin) {
    navItems.push(['/moderation', 'nav.moderation']);
    navItems.push(['/admin', 'nav.admin']);
    mobileSecondaryNavItems.push(['/moderation', 'nav.moderation']);
    mobileSecondaryNavItems.push(['/admin', 'nav.admin']);
  }

  const handleSignIn = async () => {
    try {
      setAuthBusy(true);
      await signIn();
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setAuthBusy(true);
      await signOutUser();
    } finally {
      setAuthBusy(false);
    }
  };

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
    setMobileOpenSection(null);
  }, []);

  useEffect(() => {
    musicEnabledPreferenceRef.current = musicEnabledPreference;
  }, [musicEnabledPreference]);

  useEffect(() => {
    musicTrackIdRef.current = musicTrackId;
  }, [musicTrackId]);

  useEffect(() => {
    musicVolumeRef.current = musicVolume;
  }, [musicVolume]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      MUSIC_STORAGE_KEY,
      JSON.stringify({ enabled: musicEnabledPreference, volume: musicVolume, trackId: musicTrackId })
    );
  }, [musicEnabledPreference, musicTrackId, musicVolume]);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.volume = musicVolume;
  }, [musicVolume]);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    const audio = audioRef.current;
    const handlePlay = () => setMusicIsPlaying(true);
    const handlePause = () => setMusicIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const resetShuffleQueue = useCallback((currentTrackId: string | null) => {
    musicShuffleQueueRef.current = createShuffleQueue(MUSIC_TRACKS, currentTrackId);
  }, []);

  const takeNextShuffledTrackId = useCallback((currentTrackId: string | null) => {
    if (MUSIC_TRACKS.length === 0) {
      return null;
    }

    if (MUSIC_TRACKS.length === 1) {
      return MUSIC_TRACKS[0].id;
    }

    if (musicShuffleQueueRef.current.length === 0) {
      resetShuffleQueue(currentTrackId);
    }

    return musicShuffleQueueRef.current.shift() ?? null;
  }, [resetShuffleQueue]);

  const syncAudioTrackSource = useCallback((trackId: string) => {
    const audio = audioRef.current;
    if (!audio) {
      return null;
    }

    const track = MUSIC_TRACKS.find((entry) => entry.id === trackId) ?? MUSIC_TRACKS[0];
    if (audio.dataset.trackId !== track.id) {
      audio.src = `/audio/${track.fileName}`;
      audio.dataset.trackId = track.id;
      audio.load();
    }

    return track;
  }, []);

  const playMusicTrack = useCallback(async (trackId: string, options: PlayMusicOptions) => {
    const audio = audioRef.current;
    if (!audio) {
      return false;
    }

    const track = syncAudioTrackSource(trackId);
    if (!track) {
      return false;
    }

    audio.loop = false;
    audio.volume = musicVolumeRef.current;
    audio.muted = Boolean(options.muted);

    if (options.restart) {
      audio.currentTime = 0;
    }

    try {
      await audio.play();
      setMusicTrackId(track.id);
      setMusicPlaybackError(false);

      if (!options.preserveShuffleQueue) {
        resetShuffleQueue(track.id);
      }

      return true;
    } catch (error) {
      setMusicIsPlaying(false);
      setMusicPlaybackError(true);
      logMusicPlaybackWarning(options.context, error);
      return false;
    }
  }, [resetShuffleQueue, syncAudioTrackSource]);

  const startMusicFromUserGesture = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (!audio.paused) {
      if (!musicEnabledPreferenceRef.current) {
        setMusicEnabledPreference(true);
      }
      return;
    }

    const currentTrackId = audio.dataset.trackId ?? null;
    const startTrackId = takeNextShuffledTrackId(currentTrackId) ?? musicTrackIdRef.current;
    if (!startTrackId) {
      return;
    }

    void playMusicTrack(startTrackId, {
      restart: true,
      muted: false,
      preserveShuffleQueue: true,
      context: 'startMusicFromUserGesture',
    }).then((started) => {
      if (started) {
        setMusicEnabledPreference(true);
      }
    });
  }, [playMusicTrack, takeNextShuffledTrackId]);

  const advanceMusicFromUserGesture = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const currentTrackId = audio.dataset.trackId ?? musicTrackIdRef.current;
    const nextTrackId = takeNextShuffledTrackId(currentTrackId);
    if (!nextTrackId) {
      return;
    }

    void playMusicTrack(nextTrackId, {
      restart: true,
      muted: false,
      preserveShuffleQueue: true,
      context: 'advanceMusicFromUserGesture',
    }).then((started) => {
      if (started) {
        setMusicEnabledPreference(true);
      }
    });
  }, [playMusicTrack, takeNextShuffledTrackId]);

  const prepareGameplayMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      musicPrepareActiveRef.current = false;
      musicAutoStartAllowedRef.current = false;
      musicPreparedTrackIdRef.current = null;
      musicPreparationSnapshotRef.current = null;
      return;
    }

    if (!audio.paused) {
      musicPrepareActiveRef.current = false;
      musicAutoStartAllowedRef.current = false;
      musicPreparedTrackIdRef.current = null;
      musicPreparationSnapshotRef.current = null;
      return;
    }

    const previousTrackId = audio.dataset.trackId ?? null;
    const previousCurrentTime = audio.currentTime;
    const previousWasPlaying = !audio.paused;
    const previousWasMuted = audio.muted;
    const previousVolume = audio.volume;

    musicPreparationSnapshotRef.current = {
      trackId: previousTrackId,
      currentTime: previousCurrentTime,
      wasPlaying: previousWasPlaying,
      wasMuted: previousWasMuted,
      previousVolume,
    };

    const preparedTrackId = audio.dataset.trackId ?? musicTrackIdRef.current;
    musicPreparedTrackIdRef.current = preparedTrackId;

    musicPrepareSessionRef.current += 1;
    musicPrepareActiveRef.current = true;
    musicAutoStartAllowedRef.current = true;

    void playMusicTrack(preparedTrackId, {
      restart: !previousTrackId,
      muted: false,
      preserveShuffleQueue: false,
      context: 'prepareGameplayMusic',
    });
  }, [playMusicTrack]);

  const cancelGameplayMusicPreparation = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !musicPrepareActiveRef.current) {
      return;
    }

    const snapshot = musicPreparationSnapshotRef.current;

    musicPrepareActiveRef.current = false;
    musicPrepareSessionRef.current += 1;
    musicAutoStartAllowedRef.current = false;
    musicPreparedTrackIdRef.current = null;

    audio.pause();

    if (snapshot?.trackId) {
      const previousTrack = MUSIC_TRACKS.find((track) => track.id === snapshot.trackId);
      if (previousTrack && audio.dataset.trackId !== previousTrack.id) {
        audio.src = `/audio/${previousTrack.fileName}`;
        audio.dataset.trackId = previousTrack.id;
        audio.load();
      }
    }

    if (snapshot && !snapshot.trackId) {
      audio.removeAttribute('src');
      audio.removeAttribute('data-track-id');
      audio.load();
    }

    if (snapshot) {
      const restoreSnapshotState = () => {
        audio.muted = snapshot.wasMuted;
        audio.volume = snapshot.previousVolume;

        try {
          audio.currentTime = snapshot.currentTime;
        } catch {
          audio.currentTime = 0;
        }

        if (snapshot.wasPlaying) {
          void audio.play().catch((error) => {
            setMusicPlaybackError(true);
            logMusicPlaybackWarning('cancelGameplayMusicPreparation.restore', error);
          });
        }
      };

      if (audio.readyState >= 1) {
        restoreSnapshotState();
      } else {
        audio.addEventListener('loadedmetadata', restoreSnapshotState, { once: true });
      }
    }
    musicPreparationSnapshotRef.current = null;
    setMusicPlaybackError(false);
  }, []);

  const advanceGameplayMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (!musicPrepareActiveRef.current) {
      return;
    }

    if (!musicAutoStartAllowedRef.current) {
      musicPrepareActiveRef.current = false;
      musicPrepareSessionRef.current += 1;
      musicAutoStartAllowedRef.current = false;
      musicPreparedTrackIdRef.current = null;
      musicPreparationSnapshotRef.current = null;
      return;
    }

    musicPrepareActiveRef.current = false;
    musicPrepareSessionRef.current += 1;
    musicAutoStartAllowedRef.current = false;
    musicPreparationSnapshotRef.current = null;

    const preparedTrackId = musicPreparedTrackIdRef.current;
    musicPreparedTrackIdRef.current = null;

    if (preparedTrackId && audio.dataset.trackId === preparedTrackId && !audio.paused) {
      if (!musicEnabledPreferenceRef.current) {
        setMusicEnabledPreference(true);
      }
      audio.muted = false;
      audio.volume = musicVolumeRef.current;
      setMusicPlaybackError(false);
      return;
    }

    if (preparedTrackId) {
      void playMusicTrack(preparedTrackId, {
        restart: false,
        muted: false,
        preserveShuffleQueue: true,
        context: 'advanceGameplayMusic',
      }).then((started) => {
        if (started && !musicEnabledPreferenceRef.current) {
          setMusicEnabledPreference(true);
        }
      });
    }
  }, [playMusicTrack]);

  const playSelectedMusicTrack = useCallback((trackId?: string, restart = false) => {
    const selectedTrackId = trackId ?? musicTrackIdRef.current;

    musicPrepareActiveRef.current = false;
    musicPrepareSessionRef.current += 1;
    musicAutoStartAllowedRef.current = false;
    musicPreparedTrackIdRef.current = null;
    musicPreparationSnapshotRef.current = null;

    void playMusicTrack(selectedTrackId, {
      restart,
      muted: false,
      preserveShuffleQueue: false,
      context: 'playSelectedMusicTrack',
    });
  }, [playMusicTrack]);

  const advanceToNextShuffleTrack = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const currentTrackId = audio.dataset.trackId ?? musicTrackIdRef.current;
    const nextTrackId = takeNextShuffledTrackId(currentTrackId);
    if (!nextTrackId) {
      return;
    }

    void playMusicTrack(nextTrackId, {
      restart: true,
      muted: false,
      preserveShuffleQueue: true,
      context: 'advanceToNextShuffleTrack',
    });
  }, [playMusicTrack, takeNextShuffledTrackId]);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    const audio = audioRef.current;
    const handleEnded = () => {
      if (!musicEnabledPreferenceRef.current) {
        return;
      }

      advanceToNextShuffleTrack();
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [advanceToNextShuffleTrack]);

  useEffect(() => {
    const handleMusicAction = (event: Event) => {
      const action = (event as CustomEvent<'start' | 'next'>).detail;
      if (action === 'start') {
        startMusicFromUserGesture();
        return;
      }

      if (action === 'next') {
        advanceMusicFromUserGesture();
      }
    };

    window.addEventListener(GAMEPLAY_MUSIC_ACTION_EVENT, handleMusicAction);
    window.addEventListener(GAMEPLAY_MUSIC_PREPARE_EVENT, prepareGameplayMusic);
    window.addEventListener(GAMEPLAY_MUSIC_ADVANCE_EVENT, advanceGameplayMusic);
    window.addEventListener(GAMEPLAY_MUSIC_CANCEL_EVENT, cancelGameplayMusicPreparation);
    return () => {
      window.removeEventListener(GAMEPLAY_MUSIC_ACTION_EVENT, handleMusicAction);
      window.removeEventListener(GAMEPLAY_MUSIC_PREPARE_EVENT, prepareGameplayMusic);
      window.removeEventListener(GAMEPLAY_MUSIC_ADVANCE_EVENT, advanceGameplayMusic);
      window.removeEventListener(GAMEPLAY_MUSIC_CANCEL_EVENT, cancelGameplayMusicPreparation);
    };
  }, [advanceGameplayMusic, advanceMusicFromUserGesture, cancelGameplayMusicPreparation, prepareGameplayMusic, startMusicFromUserGesture]);

  useEffect(() => {
    if (!musicPickerOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!musicMenuRef.current) {
        return;
      }

      if (musicMenuRef.current.contains(event.target as Node)) {
        return;
      }

      setMusicPickerOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMusicPickerOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [musicPickerOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMobileMenu, mobileMenuOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const desktopMediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        closeMobileMenu();
      }
    };

    desktopMediaQuery.addEventListener('change', handleDesktopChange);

    return () => {
      desktopMediaQuery.removeEventListener('change', handleDesktopChange);
    };
  }, [closeMobileMenu]);

  const handleToggleMusicEnabled = async () => {
    if (!audioRef.current) {
      return;
    }

    if (musicIsPlaying) {
      musicAutoStartAllowedRef.current = false;
      audioRef.current.pause();
      setMusicEnabledPreference(false);
      return;
    }

    setMusicEnabledPreference(true);
    playSelectedMusicTrack();
  };

  const handleSelectTrack = async (trackId: string) => {
    setMusicTrackId(trackId);

    if (musicIsPlaying) {
      playSelectedMusicTrack(trackId, true);
    }
  };

  const toggleMobileSection = (section: 'music' | 'language' | 'account') => {
    setMobileOpenSection((current) => current === section ? null : section);
  };

  const renderMusicControls = (mobile = false) => (
    <div className={`${mobile ? 'rounded-[1.4rem] bg-[rgba(246,241,230,0.78)] p-4 ring-1 ring-[rgba(87,68,45,0.1)]' : ''}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--forest-700)]">{t('music.panelTitle')}</span>
        <button
          type="button"
          onClick={() => { void handleToggleMusicEnabled(); }}
          className="inline-flex min-h-[2.75rem] items-center gap-1 rounded-full bg-[rgba(219,185,102,0.35)] px-3 py-1.5 text-xs font-black text-[var(--earth-900)] transition hover:bg-[rgba(219,185,102,0.48)]"
        >
          {musicIsPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {musicIsPlaying ? t('music.off') : t('music.on')}
        </button>
      </div>
      <div className="mb-4 rounded-[1.25rem] bg-[rgba(255,255,255,0.6)] p-3 ring-1 ring-[rgba(87,68,45,0.1)]">
        <div className="mb-2 flex items-center gap-2 text-[var(--forest-800)]">
          <Volume2 className="h-4 w-4" />
          <label className="text-xs font-semibold" htmlFor={mobile ? 'mobile-music-volume-slider' : 'music-volume-slider'}>{t('music.volume')}</label>
        </div>
        <input
          id={mobile ? 'mobile-music-volume-slider' : 'music-volume-slider'}
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={musicVolume}
          onChange={(event) => setMusicVolume(Number(event.target.value))}
          className="w-full accent-[var(--amber-500)]"
        />
      </div>
      <div className={`mobile-scroll-panel flex ${mobile ? 'max-h-56' : 'max-h-56'} flex-col gap-1 overflow-y-auto pr-1`}>
        {MUSIC_TRACKS.map((track) => (
          <button
            key={`${mobile ? 'mobile' : 'desktop'}-${track.id}`}
            type="button"
            onClick={() => void handleSelectTrack(track.id)}
            className={`rounded-[1rem] px-3 py-2 text-left text-xs font-semibold transition ${track.id === selectedTrack.id ? 'wood-panel text-[var(--earth-900)]' : 'bg-[rgba(246,241,230,0.68)] text-[var(--forest-900)] hover:bg-[rgba(250,246,237,0.84)]'}`}
          >
            {t(track.labelKey)}
          </button>
        ))}
      </div>
      {musicPlaybackError ? <p className="mt-3 text-xs text-[var(--brocade-red)]">{t('music.playBlocked')}</p> : null}
    </div>
  );

  const renderAccountControls = (mobile = false) => {
    if (loading) {
      return (
        <span className={`inline-flex min-h-[2.75rem] items-center rounded-full bg-[rgba(231,225,212,0.88)] px-4 py-2 text-[0.99rem] font-semibold text-[var(--forest-900)] ring-1 ring-[rgba(61,84,52,0.16)] ${mobile ? 'w-full justify-center' : ''}`}>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('app.loading')}
        </span>
      );
    }

    if (user) {
      return (
        <div className={`${mobile ? 'space-y-3 rounded-[1.4rem] bg-[rgba(246,241,230,0.78)] p-4 ring-1 ring-[rgba(87,68,45,0.1)]' : 'flex min-w-0 max-w-full items-center gap-2 rounded-full bg-[rgba(231,225,212,0.9)] px-3 py-2 ring-1 ring-[rgba(91,67,38,0.16)]'}`}>
          <div className={`flex min-w-0 items-center gap-2 ${mobile ? '' : ''}`}>
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url as string} alt={user.user_metadata?.full_name ?? user.email ?? 'User'} className="h-9 w-9 shrink-0 rounded-full border border-[rgba(91,67,38,0.14)] object-cover" />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(219,185,102,0.35)] text-sm font-black text-[var(--earth-900)]">
                {user.email?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            )}
            <span className={`${mobile ? 'break-words text-sm font-semibold text-[var(--forest-900)]' : 'min-w-0 max-w-[8.5rem] truncate text-[0.96rem] text-[var(--forest-900)]'}`}>{user.user_metadata?.full_name ?? user.email ?? 'User'}</span>
          </div>
          <button type="button" onClick={() => { void handleSignOut(); if (mobile) { closeMobileMenu(); } }} disabled={authBusy} className={`${mobile ? 'w-full justify-center' : ''} inline-flex min-h-[2.75rem] items-center rounded-full bg-[rgba(247,242,231,0.78)] px-3 py-1.5 text-[0.96rem] font-semibold text-[var(--forest-900)] transition hover:bg-[rgba(252,249,242,0.94)] disabled:opacity-60`}>
            {authBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : t('auth.signOut')}
          </button>
        </div>
      );
    }

    return (
      <button type="button" onClick={() => { void handleSignIn(); if (mobile) { closeMobileMenu(); } }} disabled={authBusy} className={`wood-panel inline-flex min-h-[2.75rem] items-center rounded-full px-4 py-2 text-[1.01rem] font-black text-[var(--earth-900)] shadow-[0_12px_24px_rgba(101,75,40,0.16)] transition hover:-translate-y-px disabled:opacity-60 ${mobile ? 'w-full justify-center' : ''}`}>
        {authBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {t('tiktok.signIn')}
      </button>
    );
  };

  return (
  <div className="app-shell text-[var(--forest-950)]">
    <div className="mountain-scene" aria-hidden="true">
    <div className="mountain-haze" />
    <div className="mountain-layer mountain-layer-far" />
    <div className="mountain-fog mountain-fog-top" />
    <div className="mountain-layer mountain-layer-mid" />
    <div className="mountain-fog mountain-fog-bottom" />
    <div className="mountain-layer mountain-layer-front" />
    <div className="trail-line" />
    <div className="firefly left-[8%] top-[21%]" />
    <div className="firefly left-[24%] top-[58%] [animation-delay:0.8s]" />
    <div className="firefly left-[76%] top-[36%] [animation-delay:1.4s]" />
    <div className="firefly left-[88%] top-[65%] [animation-delay:2.1s]" />
    </div>

    <div className="relative z-10 mobile-safe-bottom lg:pb-0">
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-4">
      <div className="mx-auto max-w-7xl rounded-[2.25rem] bg-[rgba(205,197,179,0.4)] pb-3 backdrop-blur-[2px]">
      <div className="wood-panel relative overflow-visible rounded-[2rem] px-4 py-4 sm:px-5">
        <div className="textile-divider absolute inset-x-6 bottom-0 h-2" />
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3 rounded-[1.5rem] pr-2 transition hover:opacity-90">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] bg-[rgba(255,248,233,0.72)] text-[var(--earth-800)] shadow-[0_12px_24px_rgba(103,76,44,0.16)] ring-1 ring-[rgba(91,67,38,0.12)]">
            <Compass className="h-6 w-6" />
          </span>
          <span className="min-w-0">
            <span className="block text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[var(--forest-700)]">A Pa Chai Route</span>
            <span className="block truncate text-xl font-black tracking-tight text-[var(--forest-950)] sm:text-2xl">{t('app.name')}</span>
          </span>
          </Link>
          <p className="hidden max-w-sm text-sm leading-6 text-[var(--forest-700)] lg:block">
          {t('landing.description')}
          </p>
        </div>

        <div className="hidden min-w-0 flex-1 flex-col gap-3 lg:flex xl:items-end">
          <div className="flex flex-wrap items-center gap-2 text-[0.99rem] font-semibold text-[var(--forest-900)] xl:justify-end">
          {navItems.map(([to, key]) => (
            <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `rounded-full px-4 py-2.5 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.32)] ${isActive ? 'wood-panel text-[var(--earth-900)] shadow-[0_10px_20px_rgba(101,75,40,0.16)]' : 'bg-[rgba(231,225,212,0.82)] ring-1 ring-[rgba(61,84,52,0.16)] hover:bg-[rgba(238,233,222,0.94)]'}`}
            >
            {t(key)}
            </NavLink>
          ))}
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 xl:justify-end">
          <div ref={musicMenuRef} className="relative z-50">
            <button
            type="button"
            onClick={() => setMusicPickerOpen((value) => !value)}
            className="flex min-h-[2.75rem] items-center gap-2 rounded-full bg-[rgba(231,225,212,0.88)] px-4 py-2 text-[0.99rem] font-semibold text-[var(--forest-900)] ring-1 ring-[rgba(61,84,52,0.16)] transition hover:bg-[rgba(238,233,222,0.95)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.32)]"
            aria-expanded={musicPickerOpen}
            aria-label={t('music.button')}
            >
            <Music2 className="h-4 w-4" />
            <span className="max-w-[10rem] truncate">{t('music.button')}</span>
            </button>
            {musicPickerOpen ? <div className="absolute left-0 top-full z-50 mt-3 w-[min(18rem,calc(100vw-1.5rem))] rounded-[1.75rem] bg-[rgba(227,218,196,0.96)] p-4 shadow-[0_26px_48px_rgba(30,37,23,0.26)] ring-1 ring-[rgba(77,57,37,0.15)] backdrop-blur">{renderMusicControls()}</div> : null}
          </div>

          <LanguageSwitch language={language} label={t('language.switch')} onChange={setLanguage} />

          {renderAccountControls()}
          </div>
        </div>
        </div>
      </div>
      </div>
    </header>

    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[rgba(91,67,38,0.14)] bg-[rgba(239,232,218,0.96)] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-16px_34px_rgba(29,40,24,0.14)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-4 gap-2">
        {mobilePrimaryNavItems.map(([to, key]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `flex min-h-[3rem] min-w-0 items-center justify-center rounded-[1.2rem] px-2 py-2 text-center text-xs font-black leading-4 transition ${isActive ? 'wood-panel text-[var(--earth-900)] shadow-[0_10px_20px_rgba(101,75,40,0.14)]' : 'bg-[rgba(255,255,255,0.72)] text-[var(--forest-900)] ring-1 ring-[rgba(61,84,52,0.14)]'}`}
            onClick={closeMobileMenu}
          >
            <span className="break-words">{t(key)}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((value) => !value)}
          className={`flex min-h-[3rem] min-w-0 items-center justify-center gap-2 rounded-[1.2rem] px-2 py-2 text-center text-xs font-black leading-4 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.32)] ${mobileMenuOpen ? 'wood-panel text-[var(--earth-900)] shadow-[0_10px_20px_rgba(101,75,40,0.14)]' : 'bg-[rgba(255,255,255,0.72)] text-[var(--forest-900)] ring-1 ring-[rgba(61,84,52,0.14)]'}`}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-sheet"
        >
          {mobileMenuOpen ? <X className="h-4 w-4 shrink-0" /> : <Menu className="h-4 w-4 shrink-0" />}
          <span className="break-words">{t('nav.menu')}</span>
        </button>
      </div>
    </nav>

    {mobileMenuOpen ? (
      <div className="lg:hidden">
        <button
          type="button"
          aria-label={t('nav.menu')}
          className="fixed inset-x-0 top-0 z-40 bg-[rgba(18,28,18,0.28)]"
          style={{ bottom: 'calc(5.4rem + env(safe-area-inset-bottom))' }}
          onClick={closeMobileMenu}
        />
        <section
          id="mobile-nav-sheet"
          className="mobile-scroll-panel fixed inset-x-3 z-50 rounded-[1.8rem] bg-[rgba(240,234,221,0.98)] p-4 shadow-[0_30px_60px_rgba(22,31,18,0.24)] ring-1 ring-[rgba(91,67,38,0.16)] backdrop-blur"
          style={{
            top: 'calc(env(safe-area-inset-top) + 0.75rem)',
            bottom: 'calc(5.4rem + env(safe-area-inset-bottom))',
            maxHeight: 'calc(100dvh - 6.5rem - env(safe-area-inset-bottom) - env(safe-area-inset-top))',
            overflowY: 'auto',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="section-kicker">{t('nav.menu')}</p>
              <p className="mt-1 break-words text-lg font-black text-[var(--forest-950)]">{t('app.name')}</p>
            </div>
            <button type="button" onClick={closeMobileMenu} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.72)] text-[var(--forest-900)] ring-1 ring-[rgba(61,84,52,0.14)]">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            {mobileSecondaryNavItems.map(([to, key]) => (
              <NavLink
                key={`mobile-${to}`}
                to={to}
                className={({ isActive }) => `flex min-h-[3rem] min-w-0 items-center justify-between gap-3 rounded-[1.25rem] px-4 py-3 text-left text-sm font-black transition ${isActive ? 'wood-panel text-[var(--earth-900)] shadow-[0_12px_24px_rgba(101,75,40,0.14)]' : 'bg-[rgba(255,255,255,0.72)] text-[var(--forest-900)] ring-1 ring-[rgba(61,84,52,0.14)]'}`}
                onClick={closeMobileMenu}
              >
                <span className="min-w-0 break-words">{t(key)}</span>
              </NavLink>
            ))}

            <a
              href="https://www.facebook.com/db1954tour"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-[1.35rem] bg-[rgba(255,247,229,0.82)] px-4 py-4 text-[var(--earth-900)] ring-1 ring-[rgba(112,79,39,0.12)]"
            >
              <p className="text-sm font-black">{t('landing.facebook.title')}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--earth-800)]">{t('landing.facebook.description')}</p>
            </a>

            <div className="rounded-[1.35rem] bg-[rgba(255,255,255,0.62)] p-2 ring-1 ring-[rgba(61,84,52,0.12)]">
              <button type="button" onClick={() => toggleMobileSection('music')} className="flex min-h-[2.75rem] w-full items-center justify-between gap-3 rounded-[1rem] px-3 py-2 text-left text-sm font-black text-[var(--forest-900)]">
                <span className="min-w-0 break-words">{t('music.button')}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition ${mobileOpenSection === 'music' ? 'rotate-180' : ''}`} />
              </button>
              {mobileOpenSection === 'music' ? <div className="pt-2">{renderMusicControls(true)}</div> : null}
            </div>

            <div className="rounded-[1.35rem] bg-[rgba(255,255,255,0.62)] p-2 ring-1 ring-[rgba(61,84,52,0.12)]">
              <button type="button" onClick={() => toggleMobileSection('language')} className="flex min-h-[2.75rem] w-full items-center justify-between gap-3 rounded-[1rem] px-3 py-2 text-left text-sm font-black text-[var(--forest-900)]">
                <span className="min-w-0 break-words">{t('language.switch')}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition ${mobileOpenSection === 'language' ? 'rotate-180' : ''}`} />
              </button>
              {mobileOpenSection === 'language' ? <div className="pt-2"><div className="rounded-[1.4rem] bg-[rgba(246,241,230,0.78)] p-4 ring-1 ring-[rgba(87,68,45,0.1)]"><LanguageSwitch language={language} label={t('language.switch')} onChange={setLanguage} /></div></div> : null}
            </div>

            <div className="rounded-[1.35rem] bg-[rgba(255,255,255,0.62)] p-2 ring-1 ring-[rgba(61,84,52,0.12)]">
              <button type="button" onClick={() => toggleMobileSection('account')} className="flex min-h-[2.75rem] w-full items-center justify-between gap-3 rounded-[1rem] px-3 py-2 text-left text-sm font-black text-[var(--forest-900)]">
                <span className="min-w-0 break-words">{t('nav.account')}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition ${mobileOpenSection === 'account' ? 'rotate-180' : ''}`} />
              </button>
              {mobileOpenSection === 'account' ? <div className="pt-2">{renderAccountControls(true)}</div> : null}
            </div>
          </div>
        </section>
      </div>
    ) : null}

    <main className="relative z-10 mx-auto max-w-7xl px-3 pb-10 pt-3 sm:px-4 sm:pb-14 sm:pt-5">{children}</main>

    <footer className="relative z-10 px-3 pb-8 sm:px-4">
      <div className="mx-auto max-w-7xl rounded-[1.75rem] bg-[rgba(220,212,194,0.74)] px-5 py-5 text-sm text-[var(--forest-900)] ring-1 ring-[rgba(61,84,52,0.14)] backdrop-blur-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>{t('legal.footer.operator')}</p>
        <div className="flex flex-wrap items-center gap-3">
        <Link to="/privacy" className="font-semibold text-[var(--forest-800)] transition hover:text-[var(--forest-950)]">
          Privacy Policy
        </Link>
        <Link to="/legal" className="font-semibold text-[var(--forest-800)] transition hover:text-[var(--forest-950)]">
          {t('legal.footer.link')}
        </Link>
        <a href="mailto:apachaigps@gmail.com" className="font-semibold text-[var(--forest-800)] transition hover:text-[var(--forest-950)]">
          {t('legal.footer.contact')}
        </a>
        </div>
      </div>
      </div>
    </footer>
    </div>

    <audio ref={audioRef} preload="none" />
  </div>
  );
};
