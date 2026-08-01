import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Compass, Loader2, Music2, Pause, Play, Volume2 } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { LanguageSwitch } from './LanguageSwitch';
import type { LanguageCode } from '../types/task';

type LayoutProps = { children: ReactNode; language: LanguageCode; setLanguage: (language: LanguageCode) => void; t: (key: string) => string };

type MusicTrack = { id: string; fileName: string; labelKey: string };
type MusicSettings = { enabled: boolean; volume: number; trackId: string };

const MUSIC_STORAGE_KEY = 'gps-music-settings-v1';
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

export const Layout = ({ children, language, setLanguage, t }: LayoutProps) => {
  const { user, loading, signIn, signOutUser } = useAuth();
  const { isAdmin, checkingAdmin } = useAdminStatus();
  const [authBusy, setAuthBusy] = useState(false);
  const [musicPickerOpen, setMusicPickerOpen] = useState(false);
  const [musicEnabledPreference, setMusicEnabledPreference] = useState(() => readMusicSettings().enabled);
  const [musicVolume, setMusicVolume] = useState(() => readMusicSettings().volume);
  const [musicTrackId, setMusicTrackId] = useState(() => readMusicSettings().trackId);
  const [musicIsPlaying, setMusicIsPlaying] = useState(false);
  const [musicPlaybackError, setMusicPlaybackError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicPrepareSessionRef = useRef(0);
  const musicPrepareActiveRef = useRef(false);
  const selectedTrack = useMemo(() => MUSIC_TRACKS.find((track) => track.id === musicTrackId) ?? MUSIC_TRACKS[0], [musicTrackId]);
  const navItems: Array<[string, string]> = [
    ['/challenge', 'nav.challenge'],
    ['/history', 'nav.history'],
    ['/discover', 'nav.discover'],
    ['/leaderboard', 'nav.leaderboard'],
  ];

  if (user && !checkingAdmin && isAdmin) {
    navItems.push(['/moderation', 'nav.moderation']);
    navItems.push(['/admin', 'nav.admin']);
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

  const prepareGameplayMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.paused) {
      return;
    }

    const preparedTrack = MUSIC_TRACKS.find((track) => track.id === musicTrackId) ?? MUSIC_TRACKS[0];
    if (audio.dataset.trackId !== preparedTrack.id) {
      audio.src = `/audio/${preparedTrack.fileName}`;
      audio.dataset.trackId = preparedTrack.id;
      audio.load();
    }

    musicPrepareSessionRef.current += 1;
    const sessionId = musicPrepareSessionRef.current;
    musicPrepareActiveRef.current = true;

    audio.loop = true;
    audio.currentTime = 0;
    audio.volume = musicVolume;
    audio.muted = true;

    void audio.play().catch(() => {
      if (musicPrepareActiveRef.current && musicPrepareSessionRef.current === sessionId) {
        setMusicPlaybackError(true);
      }
    });
  }, [musicTrackId, musicVolume]);

  const cancelGameplayMusicPreparation = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !musicPrepareActiveRef.current) {
      return;
    }

    musicPrepareActiveRef.current = false;
    musicPrepareSessionRef.current += 1;
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
    setMusicPlaybackError(false);
  }, []);

  const advanceGameplayMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    musicPrepareActiveRef.current = false;
    musicPrepareSessionRef.current += 1;

    const currentIndex = MUSIC_TRACKS.findIndex((track) => track.id === musicTrackId);
    const normalizedIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (normalizedIndex + 1) % MUSIC_TRACKS.length;
    const nextTrack = MUSIC_TRACKS[nextIndex];

    setMusicTrackId(nextTrack.id);
    setMusicEnabledPreference(true);

    audio.pause();
    if (audio.dataset.trackId !== nextTrack.id) {
      audio.src = `/audio/${nextTrack.fileName}`;
      audio.dataset.trackId = nextTrack.id;
      audio.load();
    }

    audio.loop = true;
    audio.currentTime = 0;
    audio.volume = musicVolume;
    audio.muted = false;

    void audio.play()
      .then(() => {
        setMusicPlaybackError(false);
      })
      .catch(() => {
        setMusicIsPlaying(false);
        setMusicPlaybackError(true);
      });
  }, [musicTrackId, musicVolume]);

  const playSelectedMusicTrack = useCallback((trackId?: string, restart = false) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    musicPrepareActiveRef.current = false;
    musicPrepareSessionRef.current += 1;

    const selectedTrackId = trackId ?? musicTrackId;
    const selected = MUSIC_TRACKS.find((track) => track.id === selectedTrackId) ?? MUSIC_TRACKS[0];
    if (audio.dataset.trackId !== selected.id) {
      audio.src = `/audio/${selected.fileName}`;
      audio.dataset.trackId = selected.id;
      audio.load();
    }

    audio.loop = true;
    audio.volume = musicVolume;
    audio.muted = false;

    if (restart) {
      audio.currentTime = 0;
    }

    void audio.play()
      .then(() => {
        setMusicPlaybackError(false);
      })
      .catch(() => {
        setMusicPlaybackError(true);
      });
  }, [musicTrackId, musicVolume]);

  useEffect(() => {
    window.addEventListener(GAMEPLAY_MUSIC_PREPARE_EVENT, prepareGameplayMusic);
    window.addEventListener(GAMEPLAY_MUSIC_ADVANCE_EVENT, advanceGameplayMusic);
    window.addEventListener(GAMEPLAY_MUSIC_CANCEL_EVENT, cancelGameplayMusicPreparation);
    return () => {
      window.removeEventListener(GAMEPLAY_MUSIC_PREPARE_EVENT, prepareGameplayMusic);
      window.removeEventListener(GAMEPLAY_MUSIC_ADVANCE_EVENT, advanceGameplayMusic);
      window.removeEventListener(GAMEPLAY_MUSIC_CANCEL_EVENT, cancelGameplayMusicPreparation);
    };
  }, [advanceGameplayMusic, cancelGameplayMusicPreparation, prepareGameplayMusic]);

  const handleToggleMusicEnabled = async () => {
    if (!audioRef.current) {
      return;
    }

    if (musicIsPlaying) {
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#1f7aff55,transparent_32rem),linear-gradient(135deg,#06111f,#10223d_50%,#09101c)] text-white">
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="flex items-center gap-3 text-xl font-black tracking-tight">
          <span className="rounded-2xl bg-cyan-400 p-2 text-slate-950"><Compass /></span>{t('app.name')}
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-200">
          {navItems.map(([to, key]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `rounded-full px-4 py-2 transition ${isActive ? 'bg-cyan-300 text-slate-950' : 'glass hover:bg-white/20'}`}>
              {t(key)}
            </NavLink>
          ))}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMusicPickerOpen((value) => !value)}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/20"
              aria-expanded={musicPickerOpen}
              aria-label={t('music.button')}
            >
              <Music2 className="h-4 w-4" />
              {t('music.button')}
            </button>
            {musicPickerOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-white/20 bg-slate-950/95 p-3 shadow-xl backdrop-blur">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-cyan-200">{t('music.panelTitle')}</span>
                  <button
                    type="button"
                    onClick={handleToggleMusicEnabled}
                    className="flex items-center gap-1 rounded-full bg-cyan-400 px-3 py-1 text-xs font-black text-slate-950 transition hover:bg-cyan-300"
                  >
                    {musicIsPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {musicIsPlaying ? t('music.off') : t('music.on')}
                  </button>
                </div>
                <div className="mb-3 flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-cyan-100" />
                  <label className="text-xs text-slate-200" htmlFor="music-volume-slider">{t('music.volume')}</label>
                  <input
                    id="music-volume-slider"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={musicVolume}
                    onChange={(event) => setMusicVolume(Number(event.target.value))}
                    className="w-full accent-cyan-300"
                  />
                </div>
                <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
                  {MUSIC_TRACKS.map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => void handleSelectTrack(track.id)}
                      className={`rounded-lg px-2 py-1.5 text-left text-xs font-semibold transition ${track.id === selectedTrack.id ? 'bg-cyan-300 text-slate-950' : 'bg-white/5 text-slate-100 hover:bg-white/15'}`}
                    >
                      {t(track.labelKey)}
                    </button>
                  ))}
                </div>
                {musicPlaybackError ? <p className="mt-2 text-xs text-amber-200">{t('music.playBlocked')}</p> : null}
              </div>
            ) : null}
          </div>
          <LanguageSwitch language={language} label={t('language.switch')} onChange={setLanguage} />
          {loading ? (
            <span className="rounded-full border border-white/20 px-3 py-2 text-slate-200">
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              {t('app.loading')}
            </span>
          ) : user ? (
            <div className="flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-2">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url as string} alt={user.user_metadata?.full_name ?? user.email ?? 'User'} className="h-8 w-8 rounded-full border border-white/20" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-300 text-sm font-black text-slate-950">
                  {user.email?.charAt(0).toUpperCase() ?? 'U'}
                </span>
              )}
              <span className="max-w-[8rem] truncate text-sm text-cyan-50">{user.user_metadata?.full_name ?? user.email ?? 'User'}</span>
              <button type="button" onClick={handleSignOut} disabled={authBusy} className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-60">
                {authBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Logout'}
              </button>
            </div>
          ) : (
            <button type="button" onClick={handleSignIn} disabled={authBusy} className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60">
              {authBusy ? <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> : null}
              Login with Google
            </button>
          )}
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 pb-8">{children}</main>
      <footer className="mx-auto mt-4 w-full max-w-7xl border-t border-white/10 px-4 pb-8 pt-5 text-sm text-slate-300">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>{t('legal.footer.operator')}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/legal" className="font-semibold text-cyan-200 transition hover:text-cyan-100">
              {t('legal.footer.link')}
            </Link>
            <a href="mailto:apachaigps@gmail.com" className="font-semibold text-cyan-200 transition hover:text-cyan-100">
              {t('legal.footer.contact')}
            </a>
          </div>
        </div>
      </footer>
      <audio ref={audioRef} preload="none" loop />
    </div>
  );
};
