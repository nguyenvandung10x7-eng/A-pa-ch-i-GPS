import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { ArrowRight, Eye, Headphones, Languages, Move, Smartphone, Volume2, VolumeX } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { TIME_TRAIN_CHALLENGE_PATH } from '../services/featuredExperiences';
import { createTemporalAudio } from '../services/temporalAudio';
import type { LanguageCode } from '../types/task';
import { createTemporalWorld, type TemporalFocus, type TemporalView, type TemporalWorld } from './temporal3d/createTemporalWorld';

type TemporalSceneProps = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
};

type DeviceOrientationPermissionConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

const focusCopy = {
  vi: {
    a1: ['Đồi A1 · 1954', 'Đất đỏ, đường hào và những dấu tích lúc hiện, lúc chìm vào sương.'],
    overlap: ['Vùng giao thoa', 'Cùng một địa hình, hai thời điểm không hoàn toàn khớp nhau.'],
    cemetery: ['Nghĩa trang phía xa', 'Chuyển động lắng xuống; ký ức chỉ còn lại như một lớp sáng mỏng.'],
    present: ['Đường Hoàng Văn Thái · hiện tại', 'Con đường, dãy nhà và đời sống vẫn tiếp tục ở bên kia ngọn đồi.'],
  },
  en: {
    a1: ['A1 Hill · 1954', 'Red earth, trenches and traces that surface, then sink back into mist.'],
    overlap: ['The overlap', 'The same terrain holds two moments that never align completely.'],
    cemetery: ['The distant cemetery', 'Movement quietens; memory remains as a thin band of light.'],
    present: ['Hoang Van Thai Road · now', 'The road, houses and daily life continue beyond the hill.'],
  },
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const focusForYaw = (yaw: number): TemporalFocus => {
  if (yaw < -0.3) return 'a1';
  if (yaw < 0.12) return 'overlap';
  if (yaw < 0.45) return 'cemetery';
  return 'present';
};

const TemporalFallback = ({
  yaw,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  label,
}: {
  yaw: number;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  label: string;
}) => (
  <div
    className="temporal-fallback"
    style={{ '--temporal-parallax': `${yaw * -9}vw` } as CSSProperties}
    role="img"
    aria-label={label}
    tabIndex={0}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
    onPointerCancel={onPointerUp}
  >
    <div className="temporal-fallback__aurora"><i /><i /><i /></div>
    <div className="temporal-fallback__a1"><i /><i /><i /></div>
    <div className="temporal-fallback__trenches"><i /><i /><i /></div>
    <div className="temporal-fallback__cemetery">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
    <div className="temporal-fallback__boundary"><i /><i /><i /></div>
    <div className="temporal-fallback__mist" />
  </div>
);

export const TemporalScene = ({ language, setLanguage }: TemporalSceneProps) => {
  const navigate = useNavigate();
  const vi = language === 'vi';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef<TemporalWorld | null>(null);
  const audioRef = useRef<ReturnType<typeof createTemporalAudio> | null>(null);
  const latestView = useRef<TemporalView>({ yaw: -0.04, pitch: -0.18, focus: 'overlap' });
  const startRequested = useRef(false);
  const orientationActive = useRef(false);
  const fallbackPointer = useRef<{ id: number; x: number } | null>(null);
  const fallbackOrientationOrigin = useRef<number | null>(null);
  const departureTimer = useRef<number | null>(null);
  const [mode, setMode] = useState<'loading' | 'webgl' | 'fallback'>('loading');
  const [started, setStarted] = useState(false);
  const [onwardReady, setOnwardReady] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [soundError, setSoundError] = useState(false);
  const [sensorState, setSensorState] = useState<'idle' | 'active' | 'denied' | 'unavailable'>('idle');
  const [focus, setFocus] = useState<TemporalFocus>('overlap');
  const [fallbackYaw, setFallbackYaw] = useState(-0.04);
  const [viewYaw, setViewYaw] = useState(-0.04);
  const [departing, setDeparting] = useState(false);
  const copy = focusCopy[language][focus];

  const disposeAudio = useCallback(() => {
    audioRef.current?.dispose();
    audioRef.current = null;
    setSoundOn(false);
  }, []);

  const reportView = useCallback((view: TemporalView) => {
    latestView.current = view;
    setFocus((current) => current === view.focus ? current : view.focus);
    setViewYaw((current) => Math.abs(current - view.yaw) < 0.008 ? current : view.yaw);
    audioRef.current?.updateView(view.yaw, view.pitch);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let alive = true;
    try {
      const world = createTemporalWorld(canvas, {
        onReady: () => { if (alive) setMode('webgl'); },
        onViewChange: reportView,
        onUnavailable: () => {
          if (!alive) return;
          worldRef.current?.destroy();
          worldRef.current = null;
          setMode('fallback');
        },
      });
      worldRef.current = world;
      if (startRequested.current) world.start();
    } catch {
      queueMicrotask(() => { if (alive) setMode('fallback'); });
    }
    return () => {
      alive = false;
      worldRef.current?.destroy();
      worldRef.current = null;
    };
  }, [reportView]);

  useEffect(() => {
    const pauseForVisibility = () => {
      if (document.hidden) disposeAudio();
    };
    const yieldToMedia = () => disposeAudio();
    document.addEventListener('visibilitychange', pauseForVisibility);
    document.addEventListener('play', yieldToMedia, true);
    return () => {
      document.removeEventListener('visibilitychange', pauseForVisibility);
      document.removeEventListener('play', yieldToMedia, true);
      disposeAudio();
      if (departureTimer.current !== null) window.clearTimeout(departureTimer.current);
    };
  }, [disposeAudio]);

  useEffect(() => {
    if (!started) return;
    const timer = window.setTimeout(() => setOnwardReady(true), 5000);
    return () => window.clearTimeout(timer);
  }, [started]);

  const enableSound = async () => {
    if (audioRef.current) return;
    setSoundError(false);
    try {
      document.querySelectorAll<HTMLAudioElement>('audio').forEach((element) => element.pause());
      const engine = createTemporalAudio({ enableSpatialStudy: true });
      audioRef.current = engine;
      engine.updateView(latestView.current.yaw, latestView.current.pitch);
      await engine.start();
      if (audioRef.current === engine) setSoundOn(true);
    } catch {
      disposeAudio();
      setSoundError(true);
    }
  };

  const begin = (withSound: boolean) => {
    startRequested.current = true;
    setStarted(true);
    worldRef.current?.start();
    if (withSound) void enableSound();
  };

  const toggleSound = () => {
    if (audioRef.current) disposeAudio();
    else void enableSound();
  };

  const orientationHandler = useCallback((event: DeviceOrientationEvent) => {
    if (event.alpha === null || event.beta === null) return;
    if (worldRef.current) {
      worldRef.current.applyDeviceOrientation(event.alpha, event.beta);
      return;
    }
    if (fallbackOrientationOrigin.current === null) fallbackOrientationOrigin.current = event.alpha;
    let delta = event.alpha - fallbackOrientationOrigin.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const yaw = clamp(-delta * Math.PI / 180 * 0.55, -0.78, 0.78);
    setFallbackYaw(yaw);
    reportView({ yaw, pitch: -0.18, focus: focusForYaw(yaw) });
  }, [reportView]);

  useEffect(() => () => {
    if (orientationActive.current) window.removeEventListener('deviceorientation', orientationHandler);
  }, [orientationHandler]);

  const enableOrientation = async () => {
    if (!('DeviceOrientationEvent' in window)) {
      setSensorState('unavailable');
      return;
    }
    try {
      const constructor = window.DeviceOrientationEvent as DeviceOrientationPermissionConstructor;
      const permission = constructor.requestPermission ? await constructor.requestPermission() : 'granted';
      if (permission !== 'granted') {
        setSensorState('denied');
        return;
      }
      if (!orientationActive.current) {
        worldRef.current?.resetDeviceOrientation();
        fallbackOrientationOrigin.current = null;
        window.addEventListener('deviceorientation', orientationHandler, { passive: true });
        orientationActive.current = true;
      }
      setSensorState('active');
    } catch {
      setSensorState('denied');
    }
  };

  const useFallback = () => {
    worldRef.current?.destroy();
    worldRef.current = null;
    setMode('fallback');
    reportView({ yaw: fallbackYaw, pitch: -0.18, focus: focusForYaw(fallbackYaw) });
  };

  const fallbackDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    fallbackPointer.current = { id: event.pointerId, x: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const fallbackMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pointer = fallbackPointer.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    const yaw = clamp(fallbackYaw - (event.clientX - pointer.x) * 0.0037, -0.78, 0.78);
    fallbackPointer.current = { id: pointer.id, x: event.clientX };
    setFallbackYaw(yaw);
    reportView({ yaw, pitch: -0.18, focus: focusForYaw(yaw) });
  };
  const fallbackUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (fallbackPointer.current?.id !== event.pointerId) return;
    fallbackPointer.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const sceneLabel = vi
    ? 'Cảnh ghép bán hiện thực: ảnh Điện Biên hiện tại có chiều sâu, Đồi A1 năm 1954 xuyên qua lớp sương giao thoa và nghĩa trang phía xa.'
    : 'A semi-realistic hybrid scene: depth-layered present-day Dien Bien imagery, A1 Hill in 1954 breaking through a hazy temporal overlap, and the distant cemetery.';

  const continueJourney = () => {
    if (departing || !onwardReady) return;
    setDeparting(true);
    worldRef.current?.enterRift();
    departureTimer.current = window.setTimeout(() => {
      void navigate(TIME_TRAIN_CHALLENGE_PATH);
    }, 1250);
  };

  const sceneStyle = {
    '--temporal-present-shift': `${viewYaw * -2.6}vw`,
    '--temporal-mid-shift': `${viewYaw * -1.45}vw`,
    '--temporal-near-shift': `${viewYaw * -4.2}vw`,
  } as CSSProperties;

  return (
    <section
      className={`temporal-experience is-${mode} ${started ? 'is-started' : ''} ${departing ? 'is-departing' : ''} focus-${focus}`}
      style={sceneStyle}
      aria-labelledby="temporal-experience-title"
    >
      <div className="temporal-experience__world">
        <div className="temporal-present-world" aria-hidden="true">
          <div className="temporal-present-world__valley" />
          <div className="temporal-present-world__city" />
          <div className="temporal-present-world__depth" />
        </div>
        {mode !== 'fallback' ? (
          <canvas
            ref={canvasRef}
            className="temporal-experience__canvas"
            tabIndex={0}
            aria-label={sceneLabel}
          />
        ) : (
          <TemporalFallback
            yaw={fallbackYaw}
            label={`${sceneLabel} ${vi ? 'Phiên bản nhẹ 2.5D.' : 'Lightweight 2.5D version.'}`}
            onPointerDown={fallbackDown}
            onPointerMove={fallbackMove}
            onPointerUp={fallbackUp}
          />
        )}
        <div className="temporal-boundary" aria-hidden="true"><i /><i /><i /><b /></div>
        <div className="temporal-experience__atmosphere" aria-hidden="true" />
        <div className="temporal-experience__grain" aria-hidden="true" />
      </div>

      <header className="temporal-experience__topline">
        <Link to="/" aria-label={vi ? 'Quay lại ba trải nghiệm' : 'Back to all experiences'}>
          <span>BOOK OF DIEN BIEN</span>
          <small>EXPERIENCES</small>
        </Link>
        <button
          type="button"
          onClick={() => setLanguage(vi ? 'en' : 'vi')}
          aria-label={vi ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
        >
          <Languages aria-hidden="true" /><strong>{language.toUpperCase()}</strong>
        </button>
      </header>

      {!started ? (
        <div className="temporal-entry">
          <p>{vi ? 'VÙNG THỜI GIAN GIAO THOA' : 'WHERE TIMES OVERLAP'}</p>
          <h1 id="temporal-experience-title">1954</h1>
          <div>{vi ? 'Đứng giữa một thành phố đang sống và địa hình vẫn giữ ký ức.' : 'Stand between a living city and terrain that still carries memory.'}</div>
          <button type="button" onClick={() => begin(true)} disabled={mode === 'loading'}>
            <Headphones aria-hidden="true" />
            <span>{mode === 'loading' ? (vi ? 'Đang dựng địa hình…' : 'Building the terrain…') : (vi ? 'Bước vào và lắng nghe' : 'Enter and listen')}</span>
            <ArrowRight aria-hidden="true" />
          </button>
          <button type="button" className="temporal-entry__quiet" onClick={() => begin(false)} disabled={mode === 'loading'}>
            {vi ? 'Tiếp tục không âm thanh' : 'Continue without sound'}
          </button>
        </div>
      ) : null}

      {started ? (
        <>
          <div className="temporal-guide" aria-live="polite">
            <span><Move aria-hidden="true" />{vi ? 'Kéo để nhìn quanh' : 'Drag to look around'}</span>
            <small>{mode === 'fallback' ? '2.5D' : 'WEBGL'} · {vi ? 'TÁI HIỆN NGHỆ THUẬT' : 'ARTISTIC RECONSTRUCTION'}</small>
          </div>

          <div className="temporal-focus-copy" aria-live="polite">
            <p>{copy[0]}</p>
            <div>{copy[1]}</div>
          </div>

          <div className="temporal-controls" aria-label={vi ? 'Điều khiển trải nghiệm' : 'Experience controls'}>
            <button type="button" onClick={toggleSound} aria-pressed={soundOn} title={soundOn ? (vi ? 'Tắt âm thanh' : 'Mute sound') : (vi ? 'Bật âm thanh' : 'Enable sound')}>
              {soundOn ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
              <span>{soundOn ? (vi ? 'Âm thanh' : 'Sound') : (vi ? 'Bật âm' : 'Sound')}</span>
            </button>
            <button type="button" onClick={() => void enableOrientation()} aria-pressed={sensorState === 'active'} title={vi ? 'Dùng cảm biến xoay điện thoại' : 'Use phone orientation'}>
              <Smartphone aria-hidden="true" />
              <span>{sensorState === 'active' ? (vi ? 'Cảm biến' : 'Sensor') : (vi ? 'Cho phép xoay' : 'Enable motion')}</span>
            </button>
            {mode === 'webgl' ? (
              <button type="button" onClick={useFallback} title={vi ? 'Chuyển sang phiên bản nhẹ' : 'Use the lightweight version'}>
                <Eye aria-hidden="true" /><span>{vi ? 'Bản nhẹ' : 'Light mode'}</span>
              </button>
            ) : null}
          </div>

          <div className={`temporal-exit temporal-threshold ${onwardReady ? 'is-ready' : ''}`}>
            <p>{vi ? 'Câu chuyện tiếp tục tại Đồi A1. GPS chỉ được xác nhận khi bạn thực sự có mặt.' : 'The story continues at A1 Hill. GPS is confirmed only when you are physically there.'}</p>
            <button type="button" onClick={continueJourney} disabled={departing}>
              <span className="temporal-threshold__rail" aria-hidden="true"><i /><i /></span>
              <span className="temporal-threshold__copy">
                <small>{vi ? 'BƯỚC QUA VÙNG GIAO THOA' : 'CROSS THE OVERLAP'}</small>
                <strong>{vi ? 'Chuyến tàu thời gian' : 'The Time Train'}</strong>
              </span>
              <ArrowRight aria-hidden="true" />
            </button>
          </div>

          {(soundError || sensorState === 'denied' || sensorState === 'unavailable') ? (
            <p className="temporal-status" role="status">
              {soundError
                ? (vi ? 'Âm thanh chưa khởi động được; phần hình ảnh vẫn hoạt động.' : 'Sound could not start; the visual scene remains available.')
                : sensorState === 'denied'
                  ? (vi ? 'Chưa được cấp quyền cảm biến. Bạn vẫn có thể kéo để nhìn.' : 'Motion permission was not granted. Dragging still works.')
                  : (vi ? 'Thiết bị không có cảm biến phù hợp. Bạn vẫn có thể kéo để nhìn.' : 'No suitable motion sensor is available. Dragging still works.')}
            </p>
          ) : null}
        </>
      ) : null}

      <p className="temporal-disclaimer">
        {vi
          ? 'Tái hiện nghệ thuật bán hiện thực; ảnh Điện Biên hiện tại mang tính đại diện, không phải đúng một góc nhìn duy nhất tại A1. Các lớp âm hiện tại chỉ là tín hiệu tổng hợp để thử hướng nghe.'
          : 'A semi-realistic artistic interpretation; present-day Dien Bien imagery is representative, not one exact viewpoint at A1. Current audio uses synthetic calibration tones only.'}
      </p>
    </section>
  );
};
