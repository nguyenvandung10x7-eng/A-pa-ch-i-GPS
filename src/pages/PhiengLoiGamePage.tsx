import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Languages,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  createPhiengLoiAudio,
  PHA_OI_VOICE_ASSET,
  type PhiengLoiAudioDirector,
  type VoiceAssetStatus,
} from '../experiences/phieng-loi/audioDirector';
import {
  createGame,
  createSave,
  createUiSnapshot,
  GAME_SAVE_VERSION,
  stepGame,
  type GameEvent,
  type GameQuality,
  type GameSave,
  type GameState,
  type InputState,
  type PowerKind,
  type UiSnapshot,
} from '../experiences/phieng-loi/gameEngine';
import {
  PhiengLoiVisualScene,
  type PhiengLoiVisualHandle,
} from '../experiences/phieng-loi/PhiengLoiVisualScene';
import { preloadPhiengLoiVisualAssets } from '../experiences/phieng-loi/visualAssets';
import {
  applyPhiengLoiQaScenario,
  drivePhiengLoiQaScenario,
  parsePhiengLoiQaScenario,
  randomForPhiengLoiQaScenario,
} from '../experiences/phieng-loi/qaScenarios';
import { PHIENG_LOI_LANDMARKS } from '../experiences/phieng-loi/worldLayout';
import type { LanguageCode } from '../types/task';
import {
  clearPhiengLoiSave,
  PHIENG_LOI_SAVE_KEY,
  persistPhiengLoiMuted,
  readPhiengLoiMuted,
} from '../services/phiengLoiSession';
import '../phieng-loi.css';

type PhiengLoiGamePageProps = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
};

type GameStatus = 'intro' | 'playing' | 'paused' | 'completed';

const MAX_SIMULATION_STEP_SECONDS = 0.032;
const MAX_VISIBLE_FRAME_CATCH_UP_SECONDS = 1;

const POWER_COPY: Record<PowerKind, Record<LanguageCode, string>> = {
  squash: { vi: 'BÍ XANH TÌA DÌNH · PHÌNH TO', en: 'TIA DINH SQUASH · SWELL UP' },
  coffee: { vi: 'CÀ PHÊ MƯỜNG ẢNG · THẾ GIỚI CHẬM', en: 'MUONG ANG COFFEE · SLOW WORLD' },
  macadamia: { vi: 'MẮC CA ĐIỆN BIÊN · BƯỚC CHÂN GIÒN', en: 'DIEN BIEN MACADAMIA · CRUNCHY STEPS' },
};

const readSave = (): GameSave | null => {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(PHIENG_LOI_SAVE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as GameSave;
    return [1, 2, 3, GAME_SAVE_VERSION].includes(parsed?.version) ? parsed : null;
  } catch {
    return null;
  }
};

const getDeviceProfile = (): { quality: GameQuality; reducedMotion: boolean } => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return { quality: 'high', reducedMotion: false };
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const constrained = (memory !== undefined && memory <= 4) || navigator.hardwareConcurrency <= 4;
  return { quality: constrained || reducedMotion ? 'low' : 'high', reducedMotion };
};

const requestLandscape = () => {
  const orientation = screen.orientation as ScreenOrientation & { lock?: (orientation: 'landscape') => Promise<void> };
  if (typeof orientation?.lock === 'function') void orientation.lock('landscape').catch(() => undefined);
};

const createInputState = (): InputState => ({
  left: false,
  right: false,
  up: false,
  down: false,
  moveX: 0,
  moveY: 0,
  callQueued: false,
});

export function PhiengLoiGamePage({ language, setLanguage }: PhiengLoiGamePageProps) {
  const vi = language === 'vi';
  const [profile] = useState(getDeviceProfile);
  const [qaScenario] = useState(() => (
    typeof window === 'undefined'
      ? null
      : parsePhiengLoiQaScenario(new URLSearchParams(window.location.search).get('qa'))
  ));
  const [initialSave] = useState(() => {
    if (qaScenario) return null;
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('new')) {
      clearPhiengLoiSave();
      return null;
    }
    return readSave();
  });
  const [initialGame] = useState(() => applyPhiengLoiQaScenario(
    createGame(profile.quality, profile.reducedMotion, initialSave, { random: randomForPhiengLoiQaScenario(qaScenario) }),
    qaScenario,
  ));
  const gameRef = useRef<GameState>(initialGame);
  const inputRef = useRef<InputState>(createInputState());
  const audioRef = useRef<PhiengLoiAudioDirector | null>(null);
  const visualRef = useRef<PhiengLoiVisualHandle | null>(null);
  const animationRef = useRef<number | null>(null);
  const uiSyncAtRef = useRef(0);
  const saveAtRef = useRef(initialGame.elapsed);
  const beforeBookStatusRef = useRef<GameStatus>('playing');

  const [status, setStatus] = useState<GameStatus>(() => qaScenario ? 'playing' : 'intro');
  const [ui, setUi] = useState<UiSnapshot>(() => createUiSnapshot(initialGame));
  const [muted, setMuted] = useState(readPhiengLoiMuted);
  const [needsLandscape, setNeedsLandscape] = useState(false);
  const [joystick, setJoystick] = useState({ x: 0, y: 0 });
  const [bookOpen, setBookOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceAssetStatus>('checking');

  const syncUi = useCallback((game: GameState, force = false, snapshot?: UiSnapshot) => {
    if (!force && game.elapsed - uiSyncAtRef.current < 0.1) return;
    uiSyncAtRef.current = game.elapsed;
    setUi(snapshot ?? createUiSnapshot(game));
  }, []);

  const saveGame = useCallback((game: GameState) => {
    if (qaScenario || typeof window === 'undefined' || game.complete || game.scene.kind === 'capture') return;
    try {
      window.localStorage.setItem(PHIENG_LOI_SAVE_KEY, JSON.stringify(createSave(game)));
    } catch {
      // Continue is optional; gameplay remains live if storage is unavailable.
    }
  }, [qaScenario]);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) audioRef.current = createPhiengLoiAudio();
    audioRef.current?.setMuted(muted);
    void audioRef.current?.resume();
    if (audioRef.current) setVoiceStatus(audioRef.current.getVoiceAssetStatus());
    return audioRef.current;
  }, [muted]);

  const clearInput = useCallback(() => {
    inputRef.current = createInputState();
    setJoystick({ x: 0, y: 0 });
  }, []);

  const startGame = useCallback(() => {
    requestLandscape();
    ensureAudio();
    setStatus('playing');
  }, [ensureAudio]);

  const startFresh = useCallback(() => {
    if (!qaScenario) clearPhiengLoiSave();
    const game = applyPhiengLoiQaScenario(
      createGame(profile.quality, profile.reducedMotion, null, { random: randomForPhiengLoiQaScenario(qaScenario) }),
      qaScenario,
    );
    gameRef.current = game;
    inputRef.current = createInputState();
    saveAtRef.current = 0;
    uiSyncAtRef.current = 0;
    setJoystick({ x: 0, y: 0 });
    setUi(createUiSnapshot(game));
    visualRef.current?.render(game);
    requestLandscape();
    ensureAudio();
    setStatus('playing');
  }, [ensureAudio, profile.quality, profile.reducedMotion, qaScenario]);

  const togglePause = useCallback(() => {
    if (status === 'playing') {
      clearInput();
      saveGame(gameRef.current);
      void audioRef.current?.suspend();
      setStatus('paused');
      return;
    }
    ensureAudio();
    setStatus('playing');
  }, [clearInput, ensureAudio, saveGame, status]);

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      persistPhiengLoiMuted(next);
      audioRef.current?.setMuted(next);
      return next;
    });
  }, []);

  const openBook = useCallback(() => {
    beforeBookStatusRef.current = status;
    clearInput();
    saveGame(gameRef.current);
    void audioRef.current?.suspend();
    if (status === 'playing') setStatus('paused');
    setBookOpen(true);
  }, [clearInput, saveGame, status]);

  const closeBook = useCallback(() => {
    setBookOpen(false);
    if (beforeBookStatusRef.current === 'playing') {
      ensureAudio();
      setStatus('playing');
    }
  }, [ensureAudio]);

  useEffect(() => {
    void preloadPhiengLoiVisualAssets();
  }, []);

  useEffect(() => {
    const portrait = window.matchMedia('(orientation: portrait)');
    const coarse = window.matchMedia('(pointer: coarse)');
    const update = () => setNeedsLandscape(portrait.matches && coarse.matches);
    update();
    portrait.addEventListener('change', update);
    coarse.addEventListener('change', update);
    return () => {
      portrait.removeEventListener('change', update);
      coarse.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    const persist = () => saveGame(gameRef.current);
    window.addEventListener('pagehide', persist);
    return () => {
      window.removeEventListener('pagehide', persist);
      persist();
      if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
      void audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, [saveGame]);

  useEffect(() => {
    const game = gameRef.current;
    if (status !== 'playing' || bookOpen) {
      visualRef.current?.render(game);
      syncUi(game, true);
      return;
    }

    let previousTime = performance.now();
    let active = true;
    const keyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'a', 'd', 'w', 's', 'e', 'q'].includes(key)) event.preventDefault();
      if (key === 'escape') {
        clearInput();
        saveGame(gameRef.current);
        void audioRef.current?.suspend();
        setStatus('paused');
        return;
      }
      if (key === 'arrowleft' || key === 'a') inputRef.current.left = true;
      if (key === 'arrowright' || key === 'd') inputRef.current.right = true;
      if (key === 'arrowup' || key === 'w') inputRef.current.up = true;
      if (key === 'arrowdown' || key === 's') inputRef.current.down = true;
      if ((key === ' ' || key === 'e' || key === 'q') && !event.repeat) inputRef.current.callQueued = true;
    };
    const keyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') inputRef.current.left = false;
      if (key === 'arrowright' || key === 'd') inputRef.current.right = false;
      if (key === 'arrowup' || key === 'w') inputRef.current.up = false;
      if (key === 'arrowdown' || key === 's') inputRef.current.down = false;
    };
    const visibilityChange = () => {
      if (!document.hidden) return;
      clearInput();
      saveGame(gameRef.current);
      void audioRef.current?.suspend();
      setStatus('paused');
    };

    window.addEventListener('keydown', keyDown, { passive: false });
    window.addEventListener('keyup', keyUp);
    window.addEventListener('blur', clearInput);
    document.addEventListener('visibilitychange', visibilityChange);

    const frame = (time: number) => {
      if (!active) return;
      const current = gameRef.current;
      drivePhiengLoiQaScenario(current, qaScenario, inputRef.current);
      const frameDelta = Math.min(MAX_VISIBLE_FRAME_CATCH_UP_SECONDS, Math.max(0.001, (time - previousTime) / 1_000));
      previousTime = time;
      const events: GameEvent[] = [];
      let remaining = frameDelta;
      while (remaining > 0.0001) {
        const simulationStep = Math.min(MAX_SIMULATION_STEP_SECONDS, remaining);
        events.push(...stepGame(current, inputRef.current, simulationStep));
        remaining -= simulationStep;
      }
      visualRef.current?.render(current);
      const audio = audioRef.current;
      events.forEach((event) => audio?.handle(event));
      const snapshot = createUiSnapshot(current);
      audio?.update({
        elapsed: current.elapsed,
        chasing: snapshot.chasing,
        power: snapshot.power,
        karaoke: snapshot.karaokeActive,
        nearStream: Math.hypot(
          current.player.x - PHIENG_LOI_LANDMARKS.stream.x,
          current.player.y - PHIENG_LOI_LANDMARKS.stream.y,
        ) < 105,
      });
      if (events.some((event) => event.type === 'pha-oi')) setVoiceStatus(audio?.getVoiceAssetStatus() ?? 'missing');
      syncUi(current, events.length > 0, snapshot);
      if (current.elapsed - saveAtRef.current >= 1.2) {
        saveAtRef.current = current.elapsed;
        saveGame(current);
      }
      if (current.complete) {
        clearPhiengLoiSave();
        setStatus('completed');
        return;
      }
      animationRef.current = window.requestAnimationFrame(frame);
    };

    animationRef.current = window.requestAnimationFrame(frame);
    return () => {
      active = false;
      if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', clearInput);
      document.removeEventListener('visibilitychange', visibilityChange);
      clearInput();
    };
  }, [bookOpen, clearInput, qaScenario, saveGame, status, syncUi]);

  const updateJoystick = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const radius = Math.max(1, bounds.width * 0.34);
    let x = (event.clientX - (bounds.left + bounds.width / 2)) / radius;
    let y = (event.clientY - (bounds.top + bounds.height / 2)) / radius;
    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    inputRef.current.moveX = Math.abs(x) < 0.1 ? 0 : x;
    inputRef.current.moveY = Math.abs(y) < 0.1 ? 0 : y;
    setJoystick({ x, y });
  };

  const startJoystick = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    updateJoystick(event);
  };
  const moveJoystick = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) updateJoystick(event);
  };
  const releaseJoystick = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    inputRef.current.moveX = 0;
    inputRef.current.moveY = 0;
    setJoystick({ x: 0, y: 0 });
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const queueCall = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (gameRef.current.phaOiCooldownUntil > gameRef.current.elapsed || gameRef.current.scene.kind === 'capture') return;
    inputRef.current.callQueued = true;
    navigator.vibrate?.(18);
  };

  const message = ui.message;
  const showCinematic = Boolean(ui.cinematicVi || ui.cinematicEn);

  return (
    <main className={`phieng-game${ui.chasing && !ui.karaokeActive ? ' is-chasing' : ''}${ui.karaokeActive ? ' is-karaoke' : ''}`} aria-labelledby="phieng-game-title">
      <section className="phieng-game__frame" aria-label={vi ? 'Trò chơi Phiêng Lơi' : 'Phiêng Lơi game'}>
        <PhiengLoiVisualScene ref={visualRef} initialGame={initialGame} />

        <header className="phieng-game__hud">
          <Link className="phieng-game__location" to="/" aria-label={vi ? 'Về menu' : 'Back to menu'}>
            <ArrowLeft aria-hidden="true" />
            <span><strong id="phieng-game-title">PHIÊNG LƠI</strong><small>ĐIỆN BIÊN</small></span>
          </Link>
          <div className="phieng-game__objective">{vi ? 'Cứ đi qua bản thôi…' : 'Just cross the village…'}</div>
          <nav>
            <button type="button" onClick={openBook} aria-label={vi ? 'Mở Book' : 'Open Book'}><BookOpen aria-hidden="true" /></button>
            {(status === 'playing' || status === 'paused') ? (
              <button type="button" onClick={togglePause} aria-label={status === 'playing' ? (vi ? 'Tạm dừng' : 'Pause') : (vi ? 'Tiếp tục' : 'Resume')}>
                {status === 'playing' ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              </button>
            ) : null}
          </nav>
        </header>

        {(ui.chasing || ui.feastChasing || ui.hanuDeliveryActive) && status === 'playing' && !ui.karaokeActive ? (
          <div className="phieng-game__chase" role="status">
            <span>
              {ui.hanuDeliveryActive && ui.chasing
                ? (vi ? 'CƠM PHÍA TRƯỚC · HEESUN PHÍA SAU' : 'FOOD AHEAD · HEESUN BEHIND')
                : ui.hanuDeliveryActive
                  ? (vi ? 'HANU ĐANG CẦM CƠM' : 'HANU HAS YOUR FOOD')
                  : ui.feastChasing
                    ? (vi ? 'CẢ MÂM ĐANG TỚI' : 'THE WHOLE TABLE IS COMING')
                    : (vi ? 'HEESUN ĐANG TỚI' : 'HEESUN IS COMING')}
            </span>
            <strong>{ui.hanuDeliveryActive ? (vi ? 'ĐUỔI.' : 'CHASE.') : (vi ? 'CHẠY.' : 'RUN.')}</strong>
          </div>
        ) : null}

        {ui.chiefSpeaking && ui.leaderClock && !ui.karaokeActive ? (
          <div className="phieng-game__chief" aria-live="polite">
            <span>{vi ? 'TRƯỞNG BẢN · “TÔI XIN NÓI NGẮN GỌN”' : 'VILLAGE CHIEF · “I WILL BE BRIEF”'}</span>
            <strong>{ui.leaderClock}</strong>
            <small>{vi ? ui.leaderLineVi : ui.leaderLineEn}</small>
          </div>
        ) : null}

        {ui.power && !ui.karaokeActive ? (
          <div className={`phieng-game__power is-${ui.power}`} role="status">
            <strong>{POWER_COPY[ui.power][language]}</strong>
            <i><b style={{ width: `${ui.powerRemaining * 100}%` }} /></i>
          </div>
        ) : null}

        {message && status === 'playing' ? (
          <article
            key={message.id}
            className={`phieng-game__message is-${message.tone}${ui.messageAnchored ? ' is-anchored' : ''}`}
            style={{ '--bubble-x': `${ui.messageX}%`, '--bubble-y': `${ui.messageY}%` } as CSSProperties}
            aria-live="assertive"
          >
            <span>{vi ? message.speakerVi : message.speakerEn}</span>
            <p>{vi ? message.textVi : message.textEn}</p>
          </article>
        ) : null}

        {ui.callActive && status === 'playing' ? (
          <div key={ui.callSerial} className="phieng-game__call-text" aria-hidden="true">PHÀ ƠI!</div>
        ) : null}

        {ui.karaokeActive && status === 'playing' ? (
          <div
            className="phieng-game__karaoke-lyrics"
            style={{ '--karaoke-progress': `${ui.karaokeProgress * 100}%` } as CSSProperties}
            aria-label={vi ? 'Phiêng Lơi đang hát karaoke' : 'Phiêng Lơi is singing karaoke'}
          >
            <span>{vi ? 'Phiêng Lơi ơi, đèn xoay qua mái nhà' : 'Phiêng Lơi, lights sweep across the roofs'}</span>
            <strong>{vi ? 'Ai đang đi cũng tự nhiên nhảy ba vòng' : 'Everybody walking suddenly dances three rounds'}</strong>
          </div>
        ) : null}

        {showCinematic ? (
          <div className={`phieng-game__cinematic is-${ui.scene}`} role="status">
            <strong>{vi ? ui.cinematicVi : ui.cinematicEn}</strong>
          </div>
        ) : null}

        {status === 'playing' ? (
          <div className="phieng-game__controls" aria-label={vi ? 'Điều khiển trò chơi' : 'Game controls'}>
            <div
              className="phieng-game__joystick"
              role="group"
              aria-label={vi ? 'Joystick di chuyển 360 độ' : '360-degree movement joystick'}
              onPointerDown={startJoystick}
              onPointerMove={moveJoystick}
              onPointerUp={releaseJoystick}
              onPointerCancel={releaseJoystick}
              onLostPointerCapture={releaseJoystick}
            >
              <span aria-hidden="true"><i style={{ transform: `translate(${joystick.x * 1.4}rem, ${joystick.y * 1.4}rem)` }} /></span>
            </div>
            <button
              type="button"
              className={`phieng-game__pha-oi${ui.callReady ? '' : ' is-cooldown'}${ui.callRechargeActive ? ' is-recharged' : ''}`}
              onPointerDown={queueCall}
              disabled={!ui.callReady || ui.scene === 'capture'}
              style={{ '--recharge': `${ui.callCooldownProgress * 360}deg` } as CSSProperties}
              aria-label={ui.callReady ? (vi ? 'Gọi Phà ơi' : 'Call out Pha oi') : (vi ? 'Phà ơi đang hồi' : 'Pha oi is recharging')}
            >
              <strong>PHÀ ƠI!</strong>
            </button>
          </div>
        ) : null}

        {status === 'intro' ? (
          <div className="phieng-game__overlay is-intro">
            <p>{vi ? 'MỘT BẢN NHỎ · MỘT VIỆC ĐƠN GIẢN' : 'ONE SMALL VILLAGE · ONE SIMPLE JOB'}</p>
            <h1>{vi ? 'Bạn chỉ muốn đi xuyên qua Phiêng Lơi.' : 'You only want to cross Phiêng Lơi.'}</h1>
            <div className="phieng-game__how"><span>{vi ? 'Đi bằng joystick trái.' : 'Move with the left stick.'}</span><strong>{vi ? 'Mọi việc khác: PHÀ ƠI!' : 'Everything else: PHÀ ƠI!'}</strong></div>
            <button type="button" onClick={startGame}>{initialSave ? (vi ? 'TIẾP TỤC ĐI' : 'CONTINUE') : (vi ? 'ĐI THÔI' : 'LET’S GO')}</button>
          </div>
        ) : null}

        {status === 'paused' && !bookOpen ? (
          <div className="phieng-game__overlay is-pause">
            <p>{vi ? 'TẠM DỪNG' : 'PAUSED'}</p>
            <h2>PHIÊNG LƠI</h2>
            <nav>
              <button type="button" onClick={togglePause}><Play aria-hidden="true" />{vi ? 'TIẾP TỤC' : 'CONTINUE'}</button>
              <button type="button" onClick={openBook}><BookOpen aria-hidden="true" />BOOK</button>
              <button type="button" onClick={() => setSettingsOpen(true)}><Settings aria-hidden="true" />{vi ? 'CÀI ĐẶT' : 'SETTINGS'}</button>
              <Link to="/"><ArrowLeft aria-hidden="true" />{vi ? 'MENU CHỜ' : 'WAITING MENU'}</Link>
            </nav>
          </div>
        ) : null}

        {status === 'completed' ? (
          <div className="phieng-game__overlay is-result">
            <p>{vi ? 'RA KHỎI BẢN' : 'OUT OF THE VILLAGE'}</p>
            <h2>{vi ? 'Bạn đã đi qua Phiêng Lơi. Bằng cách nào đó.' : 'You crossed Phiêng Lơi. Somehow.'}</h2>
            <span>{vi ? 'Phía sau vẫn có người gọi “Bạn ơi…”.' : 'Someone behind you is still calling “My friend…”'}</span>
            <nav>
              <button type="button" onClick={startFresh}><RotateCcw aria-hidden="true" />{vi ? 'ĐI LẠI' : 'AGAIN'}</button>
              <button type="button" onClick={openBook}><BookOpen aria-hidden="true" />BOOK</button>
              <Link to="/"><ArrowLeft aria-hidden="true" />MENU</Link>
            </nav>
          </div>
        ) : null}

        {settingsOpen ? (
          <div className="phieng-game__settings" role="dialog" aria-modal="true" aria-label={vi ? 'Cài đặt' : 'Settings'}>
            <button type="button" className="is-close" onClick={() => setSettingsOpen(false)} aria-label={vi ? 'Đóng' : 'Close'}><X aria-hidden="true" /></button>
            <p>{vi ? 'CÀI ĐẶT' : 'SETTINGS'}</p>
            <button type="button" onClick={toggleMute}>{muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}<span>{muted ? (vi ? 'Âm thanh đang tắt' : 'Sound is off') : (vi ? 'Âm thanh đang bật' : 'Sound is on')}</span></button>
            <button type="button" onClick={() => setLanguage(vi ? 'en' : 'vi')}><Languages aria-hidden="true" /><span>{vi ? 'Switch to English' : 'Chuyển sang tiếng Việt'}</span></button>
            <small className={`is-voice-${voiceStatus}`}>
              {voiceStatus === 'ready'
                ? (vi ? 'Giọng PHÀ ƠI! thật đã sẵn sàng.' : 'The real PHÀ ƠI! voice is ready.')
                : (vi ? `Đang chờ bản thu giọng thật: ${PHA_OI_VOICE_ASSET}` : `Waiting for the real voice recording: ${PHA_OI_VOICE_ASSET}`)}
            </small>
          </div>
        ) : null}
      </section>

      {bookOpen ? (
        <aside className="phieng-game__book" role="dialog" aria-modal="true" aria-label="Book of Dien Bien">
          <header><strong>BOOK OF DIEN BIEN</strong><button type="button" onClick={closeBook}><X aria-hidden="true" /><span>{vi ? 'Đóng Book' : 'Close Book'}</span></button></header>
          <iframe src="/book" title="Book of Dien Bien" />
        </aside>
      ) : null}

      {needsLandscape ? (
        <div className="phieng-game__rotate" role="dialog" aria-modal="true" aria-label={vi ? 'Xoay điện thoại' : 'Rotate your phone'}>
          <RotateCw aria-hidden="true" />
          <strong>{vi ? 'Xoay điện thoại sang ngang' : 'Rotate your phone'}</strong>
          <span>{vi ? 'Phiêng Lơi được làm để chơi bằng hai ngón cái.' : 'Phiêng Lơi is made for two thumbs.'}</span>
        </div>
      ) : null}
    </main>
  );
}
