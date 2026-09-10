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
  type LandmarkKind,
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

const LANDMARK_COPY: Record<LandmarkKind, { eyebrow: LocalizedCopy; title: LocalizedCopy; detail: LocalizedCopy }> = {
  cornfield: {
    eyebrow: { vi: 'CẢNH SẮC ĐIỆN BIÊN', en: 'A DIEN BIEN LANDSCAPE' },
    title: { vi: 'Đồng ngô cuối bản', en: 'Cornfield at the village edge' },
    detail: { vi: 'Gió chạy thành từng hàng qua lá ngô.', en: 'Wind moves through the corn in long green rows.' },
  },
  terraces: {
    eyebrow: { vi: 'CẢNH SẮC ĐIỆN BIÊN', en: 'A DIEN BIEN LANDSCAPE' },
    title: { vi: 'Ruộng bậc thang', en: 'Terraced rice fields' },
    detail: { vi: 'Mặt núi được xếp lại thành từng mùa lúa.', en: 'The mountainside is shaped into seasons of rice.' },
  },
  waterwheel: {
    eyebrow: { vi: 'CÔNG TRÌNH BẢN THÁI', en: 'THAI VILLAGE CRAFT' },
    title: { vi: 'Cọn nước bên suối', en: 'Waterwheel by the stream' },
    detail: { vi: 'Tre, dòng chảy và một cách đưa nước lên nương.', en: 'Bamboo and current lift water toward the fields.' },
  },
  'stream-girl': {
    eyebrow: { vi: 'CUỘC GẶP BÊN SUỐI', en: 'A MEETING BY THE STREAM' },
    title: { vi: 'Cô gái Thái bên dòng nước', en: 'A Thai woman by the water' },
    detail: { vi: 'Cô xuống suối tắm; đàn cá lấp lánh tìm về.', en: 'She bathes in the stream as silver fish gather nearby.' },
  },
  museum: {
    eyebrow: { vi: 'DẤU ẤN THÀNH PHỐ', en: 'CITY LANDMARK' },
    title: { vi: 'Bảo tàng Chiến thắng Điện Biên Phủ', en: 'Dien Bien Phu Victory Museum' },
    detail: { vi: 'Mái nón nan và lớp lưới quả trám hiện lên giữa lòng chảo.', en: 'A woven-helmet form and diamond lattice rise in the basin.' },
  },
  monument: {
    eyebrow: { vi: 'DẤU ẤN THÀNH PHỐ', en: 'CITY LANDMARK' },
    title: { vi: 'Tượng đài Chiến thắng', en: 'Victory Monument' },
    detail: { vi: 'Ba người lính nâng lá cờ lên khỏi lòng chảo.', en: 'Three soldiers raise the flag above the valley.' },
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

const createInputState = (): InputState => ({
  left: false,
  right: false,
  moveAxis: 0,
  jumpQueued: false,
  dashQueued: false,
  cheerQueued: false,
});

export function PhiengLoiGamePage({ language, setLanguage }: PhiengLoiGamePageProps) {
  const vi = language === 'vi';
  const [profile] = useState(getDeviceProfile);
  const [initialGame] = useState(() => createGame(profile.quality, profile.reducedMotion));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<GameState>(initialGame);
  const inputRef = useRef<InputState>(createInputState());
  const audioRef = useRef<PhiengLoiAudioDirector | null>(null);
  const animationRef = useRef<number | null>(null);
  const uiSyncAtRef = useRef(0);

  const [status, setStatus] = useState<GameStatus>('intro');
  const [ui, setUi] = useState<UiSnapshot>(() => createUiSnapshot(initialGame));
  const [muted, setMuted] = useState(false);
  const [needsLandscape, setNeedsLandscape] = useState(false);
  const [joystick, setJoystick] = useState({ x: 0, y: 0 });

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
    inputRef.current = createInputState();
    setJoystick({ x: 0, y: 0 });
    uiSyncAtRef.current = 0;
    setUi(createUiSnapshot(game));
    setStatus('playing');
  }, [ensureAudio, profile.quality, profile.reducedMotion]);

  const togglePause = useCallback(() => {
    if (status === 'playing') {
      inputRef.current = createInputState();
      setJoystick({ x: 0, y: 0 });
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
    context.imageSmoothingEnabled = false;

    if (status !== 'playing') {
      renderGame(context, game);
      return;
    }

    let previousTime = performance.now();
    let active = true;
    const clearInput = () => {
      inputRef.current = createInputState();
      setJoystick({ x: 0, y: 0 });
    };
    const keyDown = (event: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'a', 'd', 'w', 'A', 'D', 'W', 'Shift', 'e', 'E'].includes(event.key)) event.preventDefault();
      if (event.key === 'Escape') {
        clearInput();
        void audioRef.current?.suspend();
        setStatus('paused');
        return;
      }
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') inputRef.current.left = true;
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') inputRef.current.right = true;
      if ((event.key === 'ArrowUp' || event.key === ' ' || event.key.toLowerCase() === 'w') && !event.repeat) inputRef.current.jumpQueued = true;
      if (event.key === 'Shift' && !event.repeat) inputRef.current.dashQueued = true;
      if (event.key.toLowerCase() === 'e' && !event.repeat) inputRef.current.cheerQueued = true;
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
    const axis = Math.abs(x) < 0.12 ? 0 : x;
    inputRef.current.moveAxis = axis;
    setJoystick({ x, y });
  };

  const startJoystick = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    updateJoystick(event);
  };

  const moveJoystick = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    updateJoystick(event);
  };

  const releaseJoystick = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    inputRef.current.moveAxis = 0;
    setJoystick({ x: 0, y: 0 });
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const queueJump = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    inputRef.current.jumpQueued = true;
  };

  const queueDash = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    inputRef.current.dashQueued = true;
  };

  const queueCheer = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    inputRef.current.cheerQueued = true;
  };

  const activeCallout = ui.callout ? POWER_COPY[ui.callout] : null;
  const activeLandmark = ui.landmark ? LANDMARK_COPY[ui.landmark] : null;
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
        <p>{vi ? 'Một hành trình pixel qua đồng ngô, ruộng bậc thang, cọn nước, bến suối và những dấu ấn của Điện Biên. Sản vật — cùng một cuộc gặp ven đường — sẽ làm bạn biến đổi theo những cách khó đoán.' : 'A pixel journey through cornfields, terraces, waterwheels, the stream and Dien Bien landmarks. Local produce — and one roadside encounter — change you in unexpected ways.'}</p>
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

          {activeLandmark && ui.landmark && status === 'playing' ? (
            <div className={`phieng-game__landmark is-${ui.landmark}`} role="status">
              <span>{activeLandmark.eyebrow[language]}</span>
              <strong>{activeLandmark.title[language]}</strong>
              <small>{activeLandmark.detail[language]}</small>
            </div>
          ) : null}

          {activeCallout && ui.callout ? (
            <div className={`phieng-game__power-callout is-${ui.callout}`} role="status">
              <span>{activeCallout.effect[language]}</span>
              <strong>{activeCallout.name[language]}</strong>
              <small>{activeCallout.tagline[language]}</small>
            </div>
          ) : null}

          {ui.feastPhase && status === 'playing' ? (
            <div className={`phieng-game__feast-callout is-${ui.feastPhase}`} role="status">
              <p>{ui.feastPhase === 'meeting'
                ? (vi ? 'GẶP MỘT MÂM NHẬU VEN ĐƯỜNG' : 'A ROADSIDE GATHERING')
                : (vi ? 'KỸ NĂNG VÔ LÝ ĐÃ MỞ' : 'ABSURD SKILL UNLOCKED')}</p>
              <strong>{ui.feastPhase === 'meeting'
                ? (vi ? 'Ngồi lại một lát.' : 'Sit for a moment.')
                : 'DZÔ!'}</strong>
              <span>{ui.feastPhase === 'meeting'
                ? (vi ? 'Không ai hỏi bạn đang đi đâu.' : 'Nobody asks where you are going.')
                : (vi ? 'Hô một tiếng, cả con đường tự né.' : 'One shout, and the whole road moves aside.')}</span>
            </div>
          ) : null}

          {ui.flash ? <div className={`phieng-game__flash is-${ui.flash}`} aria-hidden="true" /> : null}

          {status === 'intro' ? (
            <div className="phieng-game__overlay is-intro">
              <p>{vi ? 'MỘT CHUYẾN ĐI 2D QUA BẢN' : 'A 2D JOURNEY THROUGH THE VILLAGE'}</p>
              <h2>{vi ? 'Đi qua Phiêng Lơi trước khi trời tối.' : 'Cross Phiêng Lơi before nightfall.'}</h2>
              <div>{vi ? 'Bạn sẽ gặp mâm nhậu ngay đầu bản, rồi đi qua đồng ngô, ruộng bậc thang, cọn nước, bến suối, bảo tàng và tượng đài.' : 'Meet a roadside gathering near the village entrance, then cross cornfields, terraces, a waterwheel, the stream, museum and monument.'}</div>
              <div className="phieng-game__intro-controls">
                <span>← → / A D</span><span>{vi ? 'Space · Nhảy' : 'Space · Jump'}</span><span>Shift · {vi ? 'Lướt' : 'Dash'}</span><span>E · DZÔ!</span><span>♬ Piano · Ính lả ơi</span>
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
                <li>{vi ? 'Đồng ngô' : 'Cornfields'}</li>
                <li>{vi ? 'Ruộng bậc thang' : 'Rice terraces'}</li>
                <li>{vi ? 'Cọn nước' : 'Waterwheel'}</li>
                <li>{vi ? 'Bến suối' : 'Stream'}</li>
                <li>{vi ? 'Mâm nhậu ven đường' : 'Roadside gathering'}</li>
                <li>{vi ? 'Bảo tàng' : 'Museum'}</li>
                <li>{vi ? 'Tượng đài' : 'Monument'}</li>
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
            <div className={`phieng-game__mobile-controls${showTouchGuide ? ' is-guiding' : ''}`} aria-label={vi ? 'Điều khiển kiểu MOBA' : 'MOBA-style controls'}>
              <div
                className="phieng-game__joystick"
                role="group"
                aria-label={vi ? 'Joystick di chuyển' : 'Movement joystick'}
                onPointerDown={startJoystick}
                onPointerMove={moveJoystick}
                onPointerUp={releaseJoystick}
                onPointerCancel={releaseJoystick}
                onLostPointerCapture={releaseJoystick}
              >
                <span className="phieng-game__joystick-ring" aria-hidden="true">
                  <i style={{ transform: `translate(${joystick.x * 1.25}rem, ${joystick.y * 1.25}rem)` }} />
                </span>
                <small>{vi ? 'DI CHUYỂN' : 'MOVE'}</small>
              </div>
              <div className="phieng-game__actions">
                <button
                  type="button"
                  className="is-dash"
                  aria-label={vi ? 'Lướt nhanh' : 'Dash'}
                  disabled={ui.dashCooldown > 0}
                  onPointerDown={queueDash}
                >
                  <i style={{ transform: `scaleY(${ui.dashCooldown})` }} aria-hidden="true" />
                  <strong>{vi ? 'LƯỚT' : 'DASH'}</strong>
                  <small>{ui.dashCooldown > 0 ? Math.ceil(ui.dashCooldown * 3.2) : '↗'}</small>
                </button>
                <button type="button" className="is-jump" aria-label={vi ? 'Nhảy' : 'Jump'} onPointerDown={queueJump}>
                  <strong>{vi ? 'NHẢY' : 'JUMP'}</strong><small>↑</small>
                </button>
                <button
                  type="button"
                  className={`is-cheer${ui.cheerActive ? ' is-active' : ''}`}
                  aria-label={ui.cheerUnlocked ? 'DZÔ!' : (vi ? 'Kỹ năng DZÔ! chưa mở' : 'DZÔ! skill locked')}
                  disabled={!ui.cheerUnlocked || ui.cheerCooldown > 0}
                  onPointerDown={queueCheer}
                >
                  <i style={{ transform: `scaleY(${ui.cheerCooldown})` }} aria-hidden="true" />
                  <strong>{ui.cheerUnlocked ? 'DZÔ!' : '🔒'}</strong>
                  <small>{ui.cheerUnlocked
                    ? (ui.cheerCooldown > 0 ? Math.ceil(ui.cheerCooldown * 10) : (vi ? 'NÉ!' : 'MOVE!'))
                    : (vi ? 'CHƯA MỞ' : 'LOCKED')}</small>
                </button>
              </div>
              {showTouchGuide ? <p>{vi ? 'Ngón trái điều hướng · Ngón phải nhảy và dùng kỹ năng' : 'Left thumb moves · Right thumb jumps and uses skills'}</p> : null}
            </div>
          ) : null}
        </div>
      </section>

      <footer className="phieng-game__footer">
        <span>{vi ? `Pixel Canvas 2D · Piano Ính lả ơi · ${profile.quality === 'low' ? 'chất lượng thích ứng' : 'chi tiết cao'}` : `Pixel Canvas 2D · Ính lả ơi piano · ${profile.quality === 'low' ? 'adaptive quality' : 'high detail'}`}</span>
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
