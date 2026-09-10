import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Languages,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPhiengLoiAudio, type PhiengLoiAudioDirector } from '../experiences/phieng-loi/audioDirector';
import {
  createGame,
  createUiSnapshot,
  renderGame,
  stepGame,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type GameQuality,
  type GameState,
  type InputState,
  type PowerKind,
  type UiSnapshot,
  type ZoneKind,
} from '../experiences/phieng-loi/gameEngine';
import { PHIENG_LOI_CHALLENGE_PATH } from '../services/featuredExperiences';
import type { LanguageCode } from '../types/task';
import '../phieng-loi.css';

type PhiengLoiGamePageProps = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
};

type GameStatus = 'intro' | 'playing' | 'paused' | 'completed' | 'failed';
type LocalizedCopy = Record<LanguageCode, string>;

const POWER_COPY: Record<PowerKind, { name: LocalizedCopy; tagline: LocalizedCopy; effect: LocalizedCopy }> = {
  squash: {
    name: { vi: 'BÍ XANH TÌA DÌNH', en: 'TIA DINH SQUASH' },
    tagline: { vi: 'Không rõ tại sao. Nhưng bạn to lên.', en: 'No clear reason. But now you are bigger.' },
    effect: { vi: 'To lên · bật cao · phá bó rơm', en: 'Grow · jump high · smash hay' },
  },
  coffee: {
    name: { vi: 'CÀ PHÊ MƯỜNG ẢNG', en: 'MUONG ANG COFFEE' },
    tagline: { vi: 'Hơi nhiều năng lượng.', en: 'Possibly too much energy.' },
    effect: { vi: 'Tăng tốc · nhảy xa', en: 'Sprint · jump farther' },
  },
  macadamia: {
    name: { vi: 'MẮC CA ĐIỆN BIÊN', en: 'DIEN BIEN MACADAMIA' },
    tagline: { vi: 'Vỏ cứng, tâm an.', en: 'Hard shell, calm mind.' },
    effect: { vi: 'Chặn một cú va chạm', en: 'Blocks one collision' },
  },
  tea: {
    name: { vi: 'CHÈ SHAN TUYẾT TỦA CHÙA', en: 'TUA CHUA SHAN TUYET TEA' },
    tagline: { vi: 'Bình tĩnh nào.', en: 'Take it easy.' },
    effect: { vi: 'Làm chậm cả thế giới', en: 'Slows the whole world' },
  },
  buffalo: {
    name: { vi: 'THỊT TRÂU GÁC BẾP', en: 'SMOKED BUFFALO' },
    tagline: { vi: 'Khỏe lên thấy rõ.', en: 'Now that is real strength.' },
    effect: { vi: 'Nạp lực · phá vật cản', en: 'Power up · break obstacles' },
  },
};

const ZONE_COPY: Record<ZoneKind, LocalizedCopy> = {
  0: { vi: 'Bản', en: 'Village' },
  1: { vi: 'Ruộng', en: 'Fields' },
  2: { vi: 'Suối', en: 'Stream' },
  3: { vi: 'Sân cuối', en: 'Courtyard' },
};

const HERO_COPY: Record<ZoneKind, { title: LocalizedCopy; detail: LocalizedCopy }> = {
  0: {
    title: { vi: 'Đầu bản', en: 'Village entrance' },
    detail: { vi: 'Nhà sàn thức dậy trong khói bếp.', en: 'Stilt houses wake beneath cooking smoke.' },
  },
  1: {
    title: { vi: 'Lòng chảo mở ra', en: 'The valley opens' },
    detail: { vi: 'Ruộng, núi và một khoảng trời rộng.', en: 'Fields, mountains and a wider sky.' },
  },
  2: {
    title: { vi: 'Dòng suối Phiêng Lơi', en: 'Phiêng Lơi stream' },
    detail: { vi: 'Nước, đá và nhịp sống bên bờ.', en: 'Water, stones and life along the bank.' },
  },
  3: {
    title: { vi: 'Sân bản cuối chiều', en: 'Village courtyard at dusk' },
    detail: { vi: 'Ánh đèn, tiếng nhạc và mọi người trở về.', en: 'Lanterns, music and people coming home.' },
  },
};

const getDeviceProfile = (): { quality: GameQuality; reducedMotion: boolean } => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return { quality: 'high', reducedMotion: false };
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const constrained = (memory !== undefined && memory <= 4) || navigator.hardwareConcurrency <= 4;
  return { quality: constrained || reducedMotion ? 'low' : 'high', reducedMotion };
};

const requestLandscape = () => {
  const orientation = screen.orientation as ScreenOrientation & {
    lock?: (orientation: 'landscape') => Promise<void>;
  };
  if (typeof orientation?.lock === 'function') void orientation.lock('landscape').catch(() => undefined);
};

export function PhiengLoiGamePage({ language, setLanguage }: PhiengLoiGamePageProps) {
  const vi = language === 'vi';
  const [profile] = useState(getDeviceProfile);
  const [initialGame] = useState(() => createGame(profile.quality, profile.reducedMotion));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<GameState>(initialGame);
  const inputRef = useRef<InputState>({ left: false, right: false, jumpQueued: false });
  const audioRef = useRef<PhiengLoiAudioDirector | null>(null);
  const animationRef = useRef<number | null>(null);
  const uiSyncAtRef = useRef(0);

  const [status, setStatus] = useState<GameStatus>('intro');
  const [ui, setUi] = useState<UiSnapshot>(() => createUiSnapshot(initialGame));
  const [muted, setMuted] = useState(false);
  const [needsLandscape, setNeedsLandscape] = useState(false);

  const syncUi = useCallback((game: GameState, force = false) => {
    if (!force && game.elapsed - uiSyncAtRef.current < 0.08) return;
    uiSyncAtRef.current = game.elapsed;
    setUi(createUiSnapshot(game));
  }, []);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) audioRef.current = createPhiengLoiAudio();
    audioRef.current?.setMuted(muted);
    void audioRef.current?.resume();
    return audioRef.current;
  }, [muted]);

  const startGame = useCallback(() => {
    requestLandscape();
    ensureAudio();
    const game = createGame(profile.quality, profile.reducedMotion);
    gameRef.current = game;
    inputRef.current = { left: false, right: false, jumpQueued: false };
    uiSyncAtRef.current = 0;
    setUi(createUiSnapshot(game));
    setStatus('playing');
  }, [ensureAudio, profile.quality, profile.reducedMotion]);

  const togglePause = useCallback(() => {
    if (status === 'playing') {
      inputRef.current = { left: false, right: false, jumpQueued: false };
      void audioRef.current?.suspend();
      setStatus('paused');
      return;
    }
    ensureAudio();
    setStatus('playing');
  }, [ensureAudio, status]);

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      audioRef.current?.setMuted(next);
      return next;
    });
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

  useEffect(() => () => {
    if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
    void audioRef.current?.dispose();
    audioRef.current = null;
  }, []);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d', { alpha: false });
    const game = gameRef.current;
    if (!context || !game) return;
    context.imageSmoothingEnabled = true;

    if (status !== 'playing') {
      renderGame(context, game);
      return;
    }

    let previousTime = performance.now();
    let active = true;
    const clearInput = () => { inputRef.current = { left: false, right: false, jumpQueued: false }; };
    const keyDown = (event: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'a', 'd', 'w', 'A', 'D', 'W'].includes(event.key)) event.preventDefault();
      if (event.key === 'Escape') {
        clearInput();
        void audioRef.current?.suspend();
        setStatus('paused');
        return;
      }
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') inputRef.current.left = true;
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') inputRef.current.right = true;
      if ((event.key === 'ArrowUp' || event.key === ' ' || event.key.toLowerCase() === 'w') && !event.repeat) inputRef.current.jumpQueued = true;
    };
    const keyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') inputRef.current.left = false;
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') inputRef.current.right = false;
    };
    const visibilityChange = () => {
      if (!document.hidden) return;
      clearInput();
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
      if (!current) return;
      const dt = Math.min(0.032, Math.max(0.001, (time - previousTime) / 1_000));
      previousTime = time;
      const events = stepGame(current, inputRef.current, dt);
      events.forEach((event) => audioRef.current?.handle(event));
      const snapshot = createUiSnapshot(current);
      audioRef.current?.update({
        elapsed: current.elapsed,
        zone: current.zone,
        powers: snapshot.powers.map((power) => power.kind),
      });
      renderGame(context, current);
      syncUi(current, events.length > 0);

      if (current.failed) {
        setStatus('failed');
        return;
      }
      if (current.complete) {
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
  }, [status, syncUi]);

  const moveDirection = (event: ReactPointerEvent<HTMLButtonElement>): 'left' | 'right' => (
    event.currentTarget.dataset.direction === 'left' ? 'left' : 'right'
  );

  const pressMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    inputRef.current[moveDirection(event)] = true;
  };

  const releaseMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    inputRef.current[moveDirection(event)] = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const queueJump = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    inputRef.current.jumpQueued = true;
  };

  const activeCallout = ui.callout ? POWER_COPY[ui.callout] : null;
  const isPlaying = status === 'playing';
  const showArrival = isPlaying && ui.elapsed > 0.45 && ui.elapsed < 3.8;
  const showTouchGuide = isPlaying && ui.elapsed < 5.2;

  return (
    <main className="phieng-game" aria-labelledby="phieng-game-title">
      <header className="phieng-game__header">
        <Link to="/" className="phieng-game__back"><ArrowLeft aria-hidden="true" />{vi ? 'Ba trải nghiệm' : 'All experiences'}</Link>
        <div className="phieng-game__brand"><strong>BOOK OF DIEN BIEN</strong><span>PHIÊNG LƠI</span></div>
        <button type="button" onClick={() => setLanguage(vi ? 'en' : 'vi')} aria-label={vi ? 'Switch to English' : 'Chuyển sang tiếng Việt'}>
          <Languages aria-hidden="true" /><strong>{language.toUpperCase()}</strong>
        </button>
      </header>

      <section className="phieng-game__title">
        <div>
          <p>{vi ? 'CHƯƠNG VĂN HOÁ · MOBILE GAME 2D' : 'CULTURE CHAPTER · 2D MOBILE GAME'}</p>
          <h1 id="phieng-game-title">{vi ? 'Nhịp bản Phiêng Lơi' : 'Phiêng Lơi Village Rhythm'}</h1>
        </div>
        <p>{vi ? 'Một hành trình ngắn qua nhà sàn, ruộng, suối và sân bản. Mỗi sản vật Điện Biên làm bạn biến đổi theo một cách riêng.' : 'A short journey through stilt houses, fields, water and the village courtyard. Each Dien Bien product changes you in a different way.'}</p>
      </section>

      <section className="phieng-game__console" aria-label={vi ? 'Trò chơi Phiêng Lơi' : 'Phiêng Lơi game'}>
        <div className="phieng-game__stage">
          <canvas ref={canvasRef} width={VIEW_WIDTH} height={VIEW_HEIGHT} aria-label={vi ? 'Màn chơi cuộn ngang qua bản Phiêng Lơi' : 'Side-scrolling journey through Phiêng Lơi village'} />

          <div className="phieng-game__hud">
            <span className="phieng-game__hearts" aria-label={vi ? `${ui.lives} lượt còn lại` : `${ui.lives} lives left`}>{'♥'.repeat(Math.max(0, ui.lives))}</span>
            <ol className="phieng-game__zones" aria-label={vi ? 'Các chặng của hành trình' : 'Journey zones'}>
              {([0, 1, 2, 3] as ZoneKind[]).map((zone) => (
                <li key={zone} className={zone === ui.zone ? 'is-current' : zone < ui.zone ? 'is-done' : undefined}>
                  <i aria-hidden="true" /><span>{ZONE_COPY[zone][language]}</span>
                </li>
              ))}
            </ol>
            <div className="phieng-game__hud-actions">
              <button type="button" onClick={toggleMute} aria-label={muted ? (vi ? 'Bật âm thanh' : 'Turn sound on') : (vi ? 'Tắt âm thanh' : 'Mute sound')}>
                {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
              </button>
              {(status === 'playing' || status === 'paused') ? (
                <button type="button" onClick={togglePause} aria-label={status === 'playing' ? (vi ? 'Tạm dừng' : 'Pause') : (vi ? 'Tiếp tục' : 'Resume')}>
                  {status === 'playing' ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
                </button>
              ) : null}
            </div>
            <div className="phieng-game__progress" aria-label={vi ? `Tiến độ ${Math.round(ui.progress * 100)}%` : `${Math.round(ui.progress * 100)}% progress`}>
              <i style={{ width: `${ui.progress * 100}%` }} />
            </div>
          </div>

          {ui.powers.length > 0 ? (
            <div className="phieng-game__power-hud" aria-live="polite">
              {ui.powers.map((power) => (
                <div key={power.kind} className={`is-${power.kind}`}>
                  <span>{POWER_COPY[power.kind].name[language]}</span>
                  <i><b style={{ width: `${power.remaining * 100}%` }} /></i>
                </div>
              ))}
            </div>
          ) : null}

          {showArrival ? (
            <div className="phieng-game__arrival" aria-live="polite">
              <p>{vi ? 'RƠI XUỐNG TỪ CHUYẾN TÀU THỜI GIAN' : 'DROPPED FROM THE TIME TRAIN'}</p>
              <strong>PHIÊNG LƠI</strong>
              <span>{vi ? 'Đi qua bản trước khi trời tối' : 'Cross the village before nightfall'}</span>
            </div>
          ) : null}

          {ui.heroZone !== null && status === 'playing' ? (
            <div className="phieng-game__hero" aria-live="polite">
              <span>0{ui.heroZone + 1}</span>
              <div><strong>{HERO_COPY[ui.heroZone].title[language]}</strong><small>{HERO_COPY[ui.heroZone].detail[language]}</small></div>
            </div>
          ) : null}

          {activeCallout && ui.callout ? (
            <div className={`phieng-game__power-callout is-${ui.callout}`} role="status">
              <span>{activeCallout.effect[language]}</span>
              <strong>{activeCallout.name[language]}</strong>
              <small>{activeCallout.tagline[language]}</small>
            </div>
          ) : null}

          {ui.flash ? <div className={`phieng-game__flash is-${ui.flash}`} aria-hidden="true" /> : null}

          {status === 'intro' ? (
            <div className="phieng-game__overlay is-intro">
              <p>{vi ? 'MỘT CHUYẾN ĐI 2D QUA BẢN' : 'A 2D JOURNEY THROUGH THE VILLAGE'}</p>
              <h2>{vi ? 'Đi qua Phiêng Lơi trước khi trời tối.' : 'Cross Phiêng Lơi before nightfall.'}</h2>
              <div>{vi ? 'Bạn sẽ rơi xuống từ Chuyến tàu thời gian, gặp năm sản vật và đi qua bốn không gian có thật.' : 'Drop in from the Time Train, meet five local products and cross four living landscapes.'}</div>
              <div className="phieng-game__intro-controls">
                <span>← → / A D</span><span>{vi ? 'Space để nhảy' : 'Space to jump'}</span>
              </div>
              <button type="button" onClick={startGame}>{vi ? 'Bắt đầu hành trình' : 'Start the journey'}<ArrowLeft className="is-forward" aria-hidden="true" /></button>
            </div>
          ) : null}

          {status === 'paused' ? (
            <div className="phieng-game__overlay is-pause">
              <p>{vi ? 'ĐANG TẠM DỪNG' : 'PAUSED'}</p>
              <h2>{ZONE_COPY[ui.zone][language]}</h2>
              <button type="button" onClick={togglePause}><Play aria-hidden="true" />{vi ? 'Đi tiếp' : 'Continue'}</button>
            </div>
          ) : null}

          {status === 'completed' ? (
            <div className="phieng-game__overlay is-result">
              <Sparkles aria-hidden="true" />
              <p>{vi ? 'ĐÃ ĐI QUA BẢN' : 'JOURNEY COMPLETE'}</p>
              <h2>PHIÊNG LƠI</h2>
              <div>{vi ? 'Một bản của người Thái bên lòng chảo Điện Biên.' : 'A Thai village beside the Dien Bien basin.'}</div>
              <ul className="phieng-game__memory-list">
                <li>{vi ? 'Nhà sàn' : 'Stilt houses'}</li>
                <li>{vi ? 'Ruộng' : 'Fields'}</li>
                <li>{vi ? 'Suối' : 'Stream'}</li>
                <li>{vi ? 'Sản vật Điện Biên' : 'Dien Bien produce'}</li>
                <li>{vi ? 'Đời sống bản' : 'Village life'}</li>
              </ul>
              <nav>
                <Link to="/book"><BookOpen aria-hidden="true" />{vi ? 'Đi tiếp vào Book' : 'Continue to Book'}</Link>
                <button type="button" onClick={startGame}><RotateCcw aria-hidden="true" />{vi ? 'Chơi lại' : 'Play again'}</button>
                <Link to={PHIENG_LOI_CHALLENGE_PATH} className="is-tertiary"><MapPin aria-hidden="true" />{vi ? 'Ghé điểm thật' : 'Visit the real place'}</Link>
              </nav>
            </div>
          ) : null}

          {status === 'failed' ? (
            <div className="phieng-game__overlay is-result">
              <p>{vi ? 'DỪNG CHÂN MỘT CHÚT' : 'TAKE A BREATH'}</p>
              <h2>{vi ? 'Con đường vẫn ở đây.' : 'The path is still here.'}</h2>
              <div>{vi ? 'Thử lại từ đầu bản — những sản vật bạn gặp sẽ vẫn theo đúng thứ tự.' : 'Try again from the village entrance — each power-up will return in the same order.'}</div>
              <button type="button" onClick={startGame}><RotateCcw aria-hidden="true" />{vi ? 'Thử lại' : 'Try again'}</button>
            </div>
          ) : null}

          {status === 'playing' ? (
            <div className={`phieng-game__touch-surface${showTouchGuide ? ' is-guiding' : ''}`} aria-label={vi ? 'Điều khiển cảm ứng' : 'Touch controls'}>
              <button
                type="button"
                data-direction="left"
                aria-label={vi ? 'Đi sang trái' : 'Move left'}
                onPointerDown={pressMove}
                onPointerUp={releaseMove}
                onPointerCancel={releaseMove}
                onLostPointerCapture={releaseMove}
              ><span>←</span></button>
              <button
                type="button"
                data-direction="right"
                aria-label={vi ? 'Đi sang phải' : 'Move right'}
                onPointerDown={pressMove}
                onPointerUp={releaseMove}
                onPointerCancel={releaseMove}
                onLostPointerCapture={releaseMove}
              ><span>→</span></button>
              <button type="button" className="is-jump" aria-label={vi ? 'Nhảy' : 'Jump'} onPointerDown={queueJump}>
                <span>{vi ? 'CHẠM ĐỂ NHẢY' : 'TAP TO JUMP'}</span>
              </button>
              {showTouchGuide ? <p>{vi ? 'Chạm bên trái để di chuyển · Chạm bên phải để nhảy' : 'Touch left to move · Touch right to jump'}</p> : null}
            </div>
          ) : null}
        </div>
      </section>

      <footer className="phieng-game__footer">
        <span>{vi ? `Canvas 2D nhẹ · ${profile.quality === 'low' ? 'chất lượng thích ứng' : 'chi tiết cao'}` : `Lightweight 2D canvas · ${profile.quality === 'low' ? 'adaptive quality' : 'high detail'}`}</span>
        <nav><Link to="/1954">1954</Link><Link to="/book">BOOK</Link></nav>
      </footer>

      {needsLandscape ? (
        <div className="phieng-game__rotate" role="dialog" aria-modal="true" aria-label={vi ? 'Xoay điện thoại' : 'Rotate your phone'}>
          <RotateCw aria-hidden="true" />
          <strong>{vi ? 'Xoay điện thoại sang ngang' : 'Rotate your phone'}</strong>
          <span>{vi ? 'Phiêng Lơi được thiết kế để chơi ở chế độ landscape.' : 'Phiêng Lơi is designed for landscape play.'}</span>
        </div>
      ) : null}
    </main>
  );
}
