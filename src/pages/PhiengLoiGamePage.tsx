import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Compass,
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

type GameStatus = 'intro' | 'playing' | 'paused' | 'completed';
type LocalizedCopy = Record<LanguageCode, string>;

const POWER_COPY: Record<PowerKind, { name: LocalizedCopy; tagline: LocalizedCopy; effect: LocalizedCopy }> = {
  squash: {
    name: { vi: 'BÍ XANH TÌA DÌNH', en: 'TIA DINH SQUASH' },
    tagline: { vi: 'Không giải thích. Bạn bỗng lớn hơn.', en: 'No explanation. You are suddenly larger.' },
    effect: { vi: 'Thân hình lớn · bước chân nặng', en: 'Larger body · heavier steps' },
  },
  coffee: {
    name: { vi: 'CÀ PHÊ MƯỜNG ẢNG', en: 'MUONG ANG COFFEE' },
    tagline: { vi: 'Một ngụm, tỉnh cả lòng chảo.', en: 'One sip wakes the whole basin.' },
    effect: { vi: 'Di chuyển nhanh hơn', en: 'Move faster' },
  },
  macadamia: {
    name: { vi: 'MẮC CA ĐIỆN BIÊN', en: 'DIEN BIEN MACADAMIA' },
    tagline: { vi: 'Vỏ cứng. Đường tắt mềm lòng.', en: 'Hard shell. Soft shortcuts.' },
    effect: { vi: 'Lướt hồi nhanh hơn', en: 'Dash recharges faster' },
  },
  tea: {
    name: { vi: 'CHÈ SHAN TUYẾT TỦA CHÙA', en: 'TUA CHUA SHAN TUYET TEA' },
    tagline: { vi: 'Đi chậm lại, thấy được nhiều hơn.', en: 'Slow down and notice more.' },
    effect: { vi: 'Tăng khoảng cách tương tác', en: 'Wider interaction range' },
  },
  buffalo: {
    name: { vi: 'THỊT TRÂU GÁC BẾP', en: 'SMOKED BUFFALO' },
    tagline: { vi: 'Nặng mùi khói, nhẹ chuyện đường xa.', en: 'Smoky, sturdy and ready for the road.' },
    effect: { vi: 'Bước khoẻ hơn', en: 'Stronger movement' },
  },
};

const ZONE_COPY: Record<ZoneKind, LocalizedCopy> = {
  0: { vi: 'Bản', en: 'Village' },
  1: { vi: 'Nương', en: 'Uplands' },
  2: { vi: 'Suối', en: 'Stream' },
  3: { vi: 'Phố ký ức', en: 'Memory town' },
};

const LANDMARK_COPY: Record<LandmarkKind, {
  eyebrow: LocalizedCopy;
  title: LocalizedCopy;
  detail: LocalizedCopy;
}> = {
  'stilt-house': {
    eyebrow: { vi: 'NẾP BẢN', en: 'VILLAGE LIFE' },
    title: { vi: 'Nhà sàn bên khói bếp', en: 'Stilt house in cooking smoke' },
    detail: {
      vi: 'Sàn gỗ, cầu thang và bếp lửa tạo nên một ngôi nhà biết kể chuyện bằng tiếng bước chân.',
      en: 'Timber floors, stairs and a warm hearth turn footsteps into a story.',
    },
  },
  feast: {
    eyebrow: { vi: 'CUỘC GẶP ĐỜI THƯỜNG', en: 'AN EVERYDAY ENCOUNTER' },
    title: { vi: 'Ngồi chung một mâm', en: 'Sit at the roadside table' },
    detail: {
      vi: 'Bạn có thể chọn chén trà và ngồi lại. Sau câu chào, kỹ năng “ƠI!” khiến cả bản đáp lời và chỉ hướng.',
      en: 'Choose tea and stay a moment. Your new “HEY!” call makes the village answer and point the way.',
    },
  },
  'buffalo-kitchen': {
    eyebrow: { vi: 'BẾP BẢN', en: 'VILLAGE KITCHEN' },
    title: { vi: 'Thịt trâu gác bếp', en: 'Smoked buffalo kitchen' },
    detail: {
      vi: 'Khói bếp bám lên từng thớ thịt; mang theo một chút sức bền cho quãng đường sau.',
      en: 'Hearth smoke settles into every strip and lends strength to the road ahead.',
    },
  },
  'squash-field': {
    eyebrow: { vi: 'SẢN VẬT ĐỊA PHƯƠNG', en: 'LOCAL PRODUCE' },
    title: { vi: 'Bí xanh Tìa Dình', en: 'Tia Dinh squash field' },
    detail: {
      vi: 'Những quả bí nằm dưới tán lá. Chạm vào một quả và nhân vật lớn lên theo cách rất vô lý.',
      en: 'Squash hides beneath the leaves. Touch one and grow for no sensible reason.',
    },
  },
  terraces: {
    eyebrow: { vi: 'ĐỊA HÌNH ĐIỆN BIÊN', en: 'DIEN BIEN TERRAIN' },
    title: { vi: 'Ruộng bậc thang', en: 'Terraced fields' },
    detail: {
      vi: 'Các đường đồng mức ôm lấy sườn núi, vừa là cảnh quan vừa là đường đi.',
      en: 'Contour lines wrap the slope, becoming both landscape and route.',
    },
  },
  'macadamia-grove': {
    eyebrow: { vi: 'SẢN VẬT ĐỊA PHƯƠNG', en: 'LOCAL PRODUCE' },
    title: { vi: 'Vườn mắc ca Điện Biên', en: 'Dien Bien macadamia grove' },
    detail: {
      vi: 'Một hạt nhỏ, một nhịp lướt nhanh hơn. Luật vật lý của bản đôi khi rất dễ tính.',
      en: 'One small nut, one faster dash. Village physics can be surprisingly generous.',
    },
  },
  'tea-hut': {
    eyebrow: { vi: 'HƯƠNG NÚI', en: 'MOUNTAIN AROMA' },
    title: { vi: 'Chè Shan tuyết Tủa Chùa', en: 'Tua Chua Shan Tuyet tea' },
    detail: {
      vi: 'Chén trà khiến bước chân chậm hơn một nhịp nhưng bạn nhận ra những tương tác từ xa hơn.',
      en: 'Tea slows your pace, but lets you notice interactions from farther away.',
    },
  },
  waterwheel: {
    eyebrow: { vi: 'KỸ NGHỆ BẢN THÁI', en: 'THAI VILLAGE CRAFT' },
    title: { vi: 'Cọn nước bên suối', en: 'Waterwheel by the stream' },
    detail: {
      vi: 'Tre, dòng chảy và trọng lực làm việc cùng nhau để đưa nước lên nương.',
      en: 'Bamboo, current and gravity work together to lift water toward the fields.',
    },
  },
  'stream-girl': {
    eyebrow: { vi: 'CUỘC GẶP BÊN NƯỚC', en: 'A MEETING BY THE WATER' },
    title: { vi: 'Người phụ nữ Thái bên suối', en: 'A Thai woman by the stream' },
    detail: {
      vi: 'Một người phụ nữ trưởng thành đang tắm suối sau màn cây. Góc nhìn giữ khoảng cách; câu chuyện thuộc về nhịp sống, không phải sự ngắm nhìn.',
      en: 'An adult woman bathes beyond the foliage. The camera keeps its distance; this is daily life, not spectacle.',
    },
  },
  'coffee-hill': {
    eyebrow: { vi: 'HƯƠNG VỊ MƯỜNG ẢNG', en: 'A TASTE OF MUONG ANG' },
    title: { vi: 'Cà phê Mường Ảng', en: 'Muong Ang coffee hill' },
    detail: {
      vi: 'Quả cà phê đỏ trên sườn đồi. Một ngụm nhỏ khiến mọi con đường ngắn lại.',
      en: 'Red coffee cherries cover the hill. One sip makes every road feel shorter.',
    },
  },
  museum: {
    eyebrow: { vi: 'KIẾN TRÚC KÝ ỨC', en: 'ARCHITECTURE OF MEMORY' },
    title: { vi: 'Bảo tàng Chiến thắng Điện Biên Phủ', en: 'Dien Bien Phu Victory Museum' },
    detail: {
      vi: 'Mái công trình gợi chiếc mũ nan phủ lưới ngụy trang; lịch sử hiện lên bằng hình khối.',
      en: 'Its roof recalls a woven helmet under camouflage netting; history becomes form.',
    },
  },
  monument: {
    eyebrow: { vi: 'ĐIỂM NHÌN LÒNG CHẢO', en: 'BASIN OVERLOOK' },
    title: { vi: 'Tượng đài Chiến thắng', en: 'Victory Monument' },
    detail: {
      vi: 'Từ đỉnh đồi, thành phố, cánh đồng và những đường đã đi cùng nằm trong một khung hình.',
      en: 'From the hilltop, city, fields and every travelled path share one frame.',
    },
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
  up: false,
  down: false,
  moveX: 0,
  moveY: 0,
  interactQueued: false,
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

  const clearInput = useCallback(() => {
    inputRef.current = createInputState();
    setJoystick({ x: 0, y: 0 });
  }, []);

  const togglePause = useCallback(() => {
    if (status === 'playing') {
      clearInput();
      void audioRef.current?.suspend();
      setStatus('paused');
      return;
    }
    ensureAudio();
    setStatus('playing');
  }, [clearInput, ensureAudio, status]);

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
    const keyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'a', 'd', 'w', 's', 'shift', 'e', 'q'].includes(key)) {
        event.preventDefault();
      }
      if (key === 'escape') {
        clearInput();
        void audioRef.current?.suspend();
        setStatus('paused');
        return;
      }
      if (key === 'arrowleft' || key === 'a') inputRef.current.left = true;
      if (key === 'arrowright' || key === 'd') inputRef.current.right = true;
      if (key === 'arrowup' || key === 'w') inputRef.current.up = true;
      if (key === 'arrowdown' || key === 's') inputRef.current.down = true;
      if ((key === 'e' || key === ' ') && !event.repeat) inputRef.current.interactQueued = true;
      if (key === 'shift' && !event.repeat) inputRef.current.dashQueued = true;
      if (key === 'q' && !event.repeat) inputRef.current.cheerQueued = true;
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
      const currentContext = canvasRef.current?.getContext('2d', { alpha: false });
      if (!current || !currentContext) return;
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
      renderGame(currentContext, current);
      syncUi(current, events.length > 0);

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
  }, [clearInput, status, syncUi]);

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

  const queueInteract = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    inputRef.current.interactQueued = true;
  };

  const queueDash = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    inputRef.current.dashQueued = true;
  };

  const queueCheer = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    inputRef.current.cheerQueued = true;
  };

  const activeLandmark = ui.callout ? LANDMARK_COPY[ui.callout] : null;
  const nearbyLandmark = ui.nearby ? LANDMARK_COPY[ui.nearby] : null;
  const powerPopKind = ui.flash && ui.flash !== 'cheer' ? ui.flash : null;
  const activePowerCopy = powerPopKind ? POWER_COPY[powerPopKind] : null;
  const showArrival = status === 'playing' && ui.elapsed > 0.35 && ui.elapsed < 3.6;
  const showGuide = status === 'playing' && ui.elapsed < 7;

  return (
    <main className="phieng-world" aria-labelledby="phieng-world-title">
      <header className="phieng-world__header">
        <Link to="/" className="phieng-world__back"><ArrowLeft aria-hidden="true" />{vi ? 'Ba trải nghiệm' : 'All experiences'}</Link>
        <div className="phieng-world__brand"><strong>BOOK OF DIEN BIEN</strong><span>PHIÊNG LƠI</span></div>
        <button type="button" onClick={() => setLanguage(vi ? 'en' : 'vi')} aria-label={vi ? 'Switch to English' : 'Chuyển sang tiếng Việt'}>
          <Languages aria-hidden="true" /><strong>{language.toUpperCase()}</strong>
        </button>
      </header>

      <section className="phieng-world__title">
        <div>
          <p>{vi ? 'CHƯƠNG VĂN HOÁ · THẾ GIỚI MỞ THU NHỎ' : 'CULTURE CHAPTER · COMPACT OPEN WORLD'}</p>
          <h1 id="phieng-world-title">{vi ? 'Phiêng Lơi: Bản đồ ký ức' : 'Phiêng Lơi: A Memory Map'}</h1>
        </div>
        <p>
          {vi
            ? 'Một thế giới pixel 2D góc nhìn 3/4. Không có đường đi bắt buộc: hãy tự chọn lối qua bản, nương, suối và thành phố.'
            : 'A 3/4-view 2D pixel world. There is no required route: choose your own way through village, uplands, stream and town.'}
        </p>
      </section>

      <section className="phieng-world__console" aria-label={vi ? 'Trò chơi thế giới mở Phiêng Lơi' : 'Phiêng Lơi open-world game'}>
        <div className="phieng-world__stage">
          <canvas
            ref={canvasRef}
            width={VIEW_WIDTH}
            height={VIEW_HEIGHT}
            aria-label={vi ? 'Bản đồ ký ức 2D có thể khám phá tự do' : 'Freely explorable 2D memory map'}
          />

          <div className="phieng-world__hud">
            <div className="phieng-world__counter">
              <span>{vi ? 'MẢNH KÝ ỨC' : 'MEMORIES'}</span>
              <strong>{ui.memories}<i>/</i>{ui.totalMemories}</strong>
            </div>
            <div className="phieng-world__location">
              <span>{vi ? 'ĐANG Ở' : 'CURRENT AREA'}</span>
              <strong>{ZONE_COPY[ui.zone][language]}</strong>
            </div>
            <div className="phieng-world__hud-actions">
              <button type="button" onClick={toggleMute} aria-label={muted ? (vi ? 'Bật âm thanh' : 'Turn sound on') : (vi ? 'Tắt âm thanh' : 'Mute sound')}>
                {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
              </button>
              {(status === 'playing' || status === 'paused') ? (
                <button type="button" onClick={togglePause} aria-label={status === 'playing' ? (vi ? 'Tạm dừng' : 'Pause') : (vi ? 'Tiếp tục' : 'Resume')}>
                  {status === 'playing' ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
                </button>
              ) : null}
            </div>
            <div className="phieng-world__progress" aria-label={vi ? 'Tiến độ ký ức' : 'Memory progress'}>
              <i style={{ width: String(ui.progress * 100) + '%' }} />
            </div>
          </div>

          <aside className="phieng-world__minimap" aria-label={vi ? 'Bản đồ ký ức không theo tỉ lệ' : 'Memory map, not to scale'}>
            <div className="phieng-world__minimap-head">
              <Compass aria-hidden="true" />
              <span>{vi ? 'BẢN ĐỒ KÝ ỨC' : 'MEMORY MAP'}</span>
            </div>
            <div className="phieng-world__map-field">
              <i className="is-river" aria-hidden="true" />
              {ui.mapPoints.map((point) => (
                <span
                  key={point.kind}
                  className={point.discovered ? 'is-found' : undefined}
                  style={{ left: String(point.x * 100) + '%', top: String(point.y * 100) + '%' }}
                  title={LANDMARK_COPY[point.kind].title[language]}
                />
              ))}
              <b style={{ left: String(ui.playerMapX * 100) + '%', top: String(ui.playerMapY * 100) + '%' }} aria-label={vi ? 'Vị trí của bạn' : 'Your position'} />
            </div>
            <small>{vi ? 'Không theo tỉ lệ thật' : 'Not to geographic scale'}</small>
          </aside>

          {ui.powers.length > 0 ? (
            <div className="phieng-world__powers" aria-live="polite">
              {ui.powers.map((power) => (
                <div key={power.kind} className={'is-' + power.kind}>
                  <span>{POWER_COPY[power.kind].name[language]}</span>
                  <i><b style={{ width: String(power.remaining * 100) + '%' }} /></i>
                </div>
              ))}
            </div>
          ) : null}

          {showArrival ? (
            <div className="phieng-world__arrival" aria-live="polite">
              <p>{vi ? 'MỘT BẢN ĐỒ KHÔNG THEO TỈ LỆ' : 'A MAP THAT IS NOT TO SCALE'}</p>
              <strong>PHIÊNG LƠI</strong>
              <span>{vi ? 'Chọn một hướng và bắt đầu đi' : 'Choose a direction and begin'}</span>
            </div>
          ) : null}

          {activeLandmark && ui.callout && status === 'playing' ? (
            <article className={'phieng-world__story is-' + ui.callout} aria-live="polite">
              <span>{activeLandmark.eyebrow[language]}</span>
              <strong>{activeLandmark.title[language]}</strong>
              <p>{activeLandmark.detail[language]}</p>
              {ui.callout === 'feast' && ui.busy ? <small>{vi ? 'Bạn đang ngồi lại một lát…' : 'You stay for a moment…'}</small> : null}
            </article>
          ) : null}

          {activePowerCopy && powerPopKind ? (
            <div className={'phieng-world__power-pop is-' + powerPopKind} role="status">
              <span>{activePowerCopy.effect[language]}</span>
              <strong>{activePowerCopy.name[language]}</strong>
              <small>{activePowerCopy.tagline[language]}</small>
            </div>
          ) : null}

          {ui.guideTarget && status === 'playing' ? (
            <div className="phieng-world__guide-target" role="status">
              <Compass aria-hidden="true" />
              <span>{vi ? 'Cả bản đang chỉ về' : 'The village points toward'}</span>
              <strong>{LANDMARK_COPY[ui.guideTarget].title[language]}</strong>
            </div>
          ) : null}

          {nearbyLandmark && ui.nearby && status === 'playing' && !ui.busy && !ui.callout ? (
            <button type="button" className="phieng-world__prompt" onPointerDown={queueInteract}>
              <span>{ui.nearbyVisited ? (vi ? 'XEM LẠI' : 'REVISIT') : (vi ? 'KHÁM PHÁ' : 'DISCOVER')}</span>
              <strong>{nearbyLandmark.title[language]}</strong>
              <kbd>E</kbd>
            </button>
          ) : null}

          {ui.flash ? <div className={'phieng-world__flash is-' + ui.flash} aria-hidden="true" /> : null}

          {status === 'intro' ? (
            <div className="phieng-world__overlay is-intro">
              <p>{vi ? 'THẾ GIỚI MỞ THU NHỎ · 2D PIXEL' : 'COMPACT OPEN WORLD · 2D PIXEL'}</p>
              <h2>{vi ? 'Không chạy qua Điện Biên. Hãy ở lại và khám phá.' : 'Do not race through Dien Bien. Stay and explore.'}</h2>
              <div>
                {vi
                  ? 'Mười hai địa điểm đều mở ngay từ đầu: nhà sàn, mâm bên đường, bí xanh Tìa Dình, ruộng bậc thang, cọn nước, bến suối, cà phê Mường Ảng, bảo tàng, tượng đài và nhiều hơn nữa.'
                  : 'All twelve places are open from the start: stilt houses, a roadside table, Tia Dinh squash, terraces, waterwheel, stream, Muong Ang coffee, museum, monument and more.'}
              </div>
              <ul className="phieng-world__intro-grid">
                <li><strong>{vi ? 'Tự do chọn hướng' : 'Choose any direction'}</strong><span>{vi ? 'Không có đường chạy cố định' : 'No fixed running lane'}</span></li>
                <li><strong>{vi ? 'Tới gần rồi chạm' : 'Approach and interact'}</strong><span>{vi ? 'Mỗi nơi có một phản ứng riêng' : 'Every place responds differently'}</span></li>
                <li><strong>{vi ? 'Một tay vẫn chơi được' : 'Playable with one hand'}</strong><span>{vi ? 'Joystick trái, hành động phải' : 'Left stick, right actions'}</span></li>
                <li><strong>{vi ? 'Piano Ính lả ơi' : 'Ính lả ơi piano'}</strong><span>{vi ? 'Âm nhạc đổi theo khu vực' : 'Music changes by area'}</span></li>
              </ul>
              <div className="phieng-world__intro-controls">
                <span>WASD / ↑↓←→</span><span>E / Space · {vi ? 'Tương tác' : 'Interact'}</span><span>Shift · {vi ? 'Lướt' : 'Dash'}</span><span>Q · ƠI!</span>
              </div>
              <button type="button" onClick={startGame}>{vi ? 'Bước vào bản đồ' : 'Enter the map'}<ArrowLeft className="is-forward" aria-hidden="true" /></button>
            </div>
          ) : null}

          {status === 'paused' ? (
            <div className="phieng-world__overlay is-pause">
              <p>{vi ? 'ĐANG TẠM DỪNG' : 'PAUSED'}</p>
              <h2>{ZONE_COPY[ui.zone][language]}</h2>
              <div>{vi ? 'Mọi địa điểm vẫn mở. Đi tiếp theo hướng bạn muốn.' : 'Every place remains open. Continue in any direction.'}</div>
              <button type="button" onClick={togglePause}><Play aria-hidden="true" />{vi ? 'Đi tiếp' : 'Continue'}</button>
            </div>
          ) : null}

          {status === 'completed' ? (
            <div className="phieng-world__overlay is-result">
              <Sparkles aria-hidden="true" />
              <p>{vi ? 'BẢN ĐỒ ĐÃ CÓ TIẾNG NÓI' : 'THE MAP HAS FOUND ITS VOICE'}</p>
              <h2>{vi ? 'Bạn đã gặp đủ một Điện Biên rất đời thường.' : 'You found an everyday Dien Bien.'}</h2>
              <div>
                {vi
                  ? 'Đây là kết thúc của lượt khám phá, không phải một khoá. Book và GPS vẫn luôn có thể mở trực tiếp từ màn chính.'
                  : 'This ends the journey, not a lock. Book and GPS always remain directly available from the main screen.'}
              </div>
              <nav>
                <Link to="/book"><BookOpen aria-hidden="true" />{vi ? 'Mở Book' : 'Open Book'}</Link>
                <button type="button" onClick={startGame}><RotateCcw aria-hidden="true" />{vi ? 'Đi lại một vòng' : 'Explore again'}</button>
                <Link to={PHIENG_LOI_CHALLENGE_PATH} className="is-tertiary"><MapPin aria-hidden="true" />{vi ? 'Ghé điểm thật' : 'Visit the real place'}</Link>
              </nav>
            </div>
          ) : null}

          {status === 'playing' ? (
            <div className={'phieng-world__controls' + (showGuide ? ' is-guiding' : '')} aria-label={vi ? 'Điều khiển kiểu MOBA' : 'MOBA-style controls'}>
              <div
                className="phieng-world__joystick"
                role="group"
                aria-label={vi ? 'Joystick di chuyển tự do' : 'Free movement joystick'}
                onPointerDown={startJoystick}
                onPointerMove={moveJoystick}
                onPointerUp={releaseJoystick}
                onPointerCancel={releaseJoystick}
                onLostPointerCapture={releaseJoystick}
              >
                <span className="phieng-world__joystick-ring" aria-hidden="true">
                  <i style={{ transform: 'translate(' + String(joystick.x * 1.2) + 'rem, ' + String(joystick.y * 1.2) + 'rem)' }} />
                </span>
                <small>{vi ? 'ĐI BẤT KỲ HƯỚNG NÀO' : 'MOVE ANY DIRECTION'}</small>
              </div>
              <div className="phieng-world__actions">
                <button
                  type="button"
                  className={'is-call' + (ui.cheerActive ? ' is-active' : '')}
                  aria-label={ui.cheerUnlocked ? (vi ? 'Gọi cả bản chỉ hướng' : 'Ask the village for directions') : (vi ? 'Kỹ năng ƠI! chưa mở' : 'HEY! skill locked')}
                  disabled={!ui.cheerUnlocked || ui.cheerCooldown > 0}
                  onPointerDown={queueCheer}
                >
                  <i style={{ transform: 'scaleY(' + String(ui.cheerCooldown) + ')' }} aria-hidden="true" />
                  <strong>{ui.cheerUnlocked ? 'ƠI!' : '🔒'}</strong>
                  <small>{ui.cheerUnlocked ? (vi ? 'CHỈ LỐI' : 'GUIDE') : (vi ? 'NGỒI MÂM' : 'SIT FIRST')}</small>
                </button>
                <button
                  type="button"
                  className={'is-interact' + (ui.nearby ? ' is-ready' : '')}
                  aria-label={nearbyLandmark ? nearbyLandmark.title[language] : (vi ? 'Tương tác' : 'Interact')}
                  disabled={!ui.nearby || ui.busy}
                  onPointerDown={queueInteract}
                >
                  <strong>{vi ? 'CHẠM' : 'ACT'}</strong>
                  <small>{ui.nearby ? '!' : '…'}</small>
                </button>
                <button
                  type="button"
                  className="is-dash"
                  aria-label={vi ? 'Lướt nhanh' : 'Dash'}
                  disabled={ui.dashCooldown > 0 || ui.busy}
                  onPointerDown={queueDash}
                >
                  <i style={{ transform: 'scaleY(' + String(ui.dashCooldown) + ')' }} aria-hidden="true" />
                  <strong>{vi ? 'LƯỚT' : 'DASH'}</strong>
                  <small>{ui.dashCooldown > 0 ? String(Math.ceil(ui.dashCooldown * 3)) : '↗'}</small>
                </button>
              </div>
              {showGuide ? <p>{vi ? 'Ngón trái đi 360° · Ngón phải chạm, lướt và gọi bản' : 'Left thumb moves 360° · Right thumb acts, dashes and calls'}</p> : null}
            </div>
          ) : null}
        </div>
      </section>

      <footer className="phieng-world__footer">
        <span>{vi ? 'Pixel Canvas 480×270 · Không tải engine ngoài · Bản đồ ký ức không theo tỉ lệ' : 'Pixel Canvas 480×270 · No external engine · Memory map not to scale'}</span>
        <nav><Link to="/1954">1954</Link><Link to="/book">BOOK</Link></nav>
      </footer>

      {needsLandscape ? (
        <div className="phieng-world__rotate" role="dialog" aria-modal="true" aria-label={vi ? 'Xoay điện thoại' : 'Rotate your phone'}>
          <RotateCw aria-hidden="true" />
          <strong>{vi ? 'Xoay điện thoại sang ngang' : 'Rotate your phone'}</strong>
          <span>{vi ? 'Bản đồ Phiêng Lơi được thiết kế để chơi ở chế độ landscape.' : 'The Phiêng Lơi map is designed for landscape play.'}</span>
        </div>
      ) : null}
    </main>
  );
}
