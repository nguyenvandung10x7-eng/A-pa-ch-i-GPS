import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowLeft, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  clearPhiengLoiInput,
  createPhiengLoiFrameLoop,
  createPhiengLoiInputState,
  updatePhiengLoiKey,
  type PhiengLoiFrameLoop,
} from '../experiences/phieng-loi/runtime';
import {
  createPhiengLoiPlayerState,
  stepPhiengLoiPlayer,
  type PhiengLoiPlayerState,
} from '../experiences/phieng-loi/playerMotion';
import {
  PhiengLoiPlayerScene,
  type PhiengLoiPlayerSceneHandle,
} from '../experiences/phieng-loi/PhiengLoiPlayerScene';
import type { LanguageCode } from '../types/task';
import '../phieng-loi.css';

type PhiengLoiGamePageProps = {
  language: LanguageCode;
};

type RuntimeStatus = 'playing' | 'paused';

export function PhiengLoiGamePage({ language }: PhiengLoiGamePageProps) {
  const vi = language === 'vi';
  const inputRef = useRef(createPhiengLoiInputState());
  const runtimeRef = useRef<PhiengLoiFrameLoop | null>(null);
  const [initialPlayerState] = useState(() => createPhiengLoiPlayerState(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  ));
  const playerStateRef = useRef<PhiengLoiPlayerState>(initialPlayerState);
  const sceneRef = useRef<PhiengLoiPlayerSceneHandle | null>(null);
  const [status, setStatus] = useState<RuntimeStatus>('playing');
  const [joystick, setJoystick] = useState({ x: 0, y: 0 });

  const clearInput = useCallback(() => {
    clearPhiengLoiInput(inputRef.current);
    setJoystick({ x: 0, y: 0 });
  }, []);

  const pauseRuntime = useCallback(() => {
    clearInput();
    runtimeRef.current?.pause();
    setStatus('paused');
  }, [clearInput]);

  const resumeRuntime = useCallback(() => {
    runtimeRef.current?.resume();
    setStatus('playing');
  }, []);

  useEffect(() => {
    const input = inputRef.current;
    const runtime = createPhiengLoiFrameLoop({
      onStep: (deltaSeconds) => {
        stepPhiengLoiPlayer(playerStateRef.current, input, deltaSeconds);
        sceneRef.current?.render(playerStateRef.current);
      },
    });
    runtimeRef.current = runtime;
    runtime.start();

    return () => {
      clearPhiengLoiInput(input);
      runtime.dispose();
      runtimeRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;
    const input = inputRef.current;

    const keyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        pauseRuntime();
        return;
      }
      if (updatePhiengLoiKey(input, event.key, true)) event.preventDefault();
    };
    const keyUp = (event: KeyboardEvent) => {
      if (updatePhiengLoiKey(input, event.key, false)) event.preventDefault();
    };
    const visibilityChange = () => {
      if (document.hidden) pauseRuntime();
    };

    window.addEventListener('keydown', keyDown, { passive: false });
    window.addEventListener('keyup', keyUp, { passive: false });
    window.addEventListener('blur', clearInput);
    window.addEventListener('pagehide', pauseRuntime);
    document.addEventListener('visibilitychange', visibilityChange);

    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', clearInput);
      window.removeEventListener('pagehide', pauseRuntime);
      document.removeEventListener('visibilitychange', visibilityChange);
      clearPhiengLoiInput(input);
    };
  }, [clearInput, pauseRuntime, status]);

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
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <main className="phieng-game" aria-labelledby="phieng-game-title">
      <section className="phieng-game__frame" aria-label={vi ? 'Trò chơi Phiêng Lơi' : 'Phiêng Lơi game'}>
        <PhiengLoiPlayerScene ref={sceneRef} initialState={initialPlayerState} />

        <header className="phieng-game__hud">
          <Link className="phieng-game__location" to="/" aria-label={vi ? 'Về menu' : 'Back to menu'}>
            <ArrowLeft aria-hidden="true" />
            <span><strong id="phieng-game-title">PHIÊNG LƠI</strong><small>ĐIỆN BIÊN</small></span>
          </Link>
          <nav>
            {status === 'playing' ? (
              <button type="button" onClick={pauseRuntime} aria-label={vi ? 'Tạm dừng' : 'Pause'}>
                <Pause aria-hidden="true" />
              </button>
            ) : null}
          </nav>
        </header>

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
              <span aria-hidden="true">
                <i style={{ transform: `translate(${joystick.x * 1.4}rem, ${joystick.y * 1.4}rem)` }} />
              </span>
            </div>
          </div>
        ) : null}

        {status === 'paused' ? (
          <div className="phieng-game__overlay is-pause">
            <p>{vi ? 'TẠM DỪNG' : 'PAUSED'}</p>
            <h2>PHIÊNG LƠI</h2>
            <button type="button" onClick={resumeRuntime}>
              <Play aria-hidden="true" />
              {vi ? 'TIẾP TỤC' : 'CONTINUE'}
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
