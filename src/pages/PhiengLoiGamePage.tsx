import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Languages, MapPin, RotateCcw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PHIENG_LOI_CHALLENGE_PATH } from '../services/featuredExperiences';
import type { LanguageCode } from '../types/task';
import '../phieng-loi.css';

type PhiengLoiGamePageProps = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
};

type GameStatus = 'intro' | 'playing' | 'completed' | 'failed';
type PowerKind = 'squash' | 'coffee' | 'macadamia' | 'tea';
type InputState = { left: boolean; right: boolean; jumpQueued: boolean };

type PlayerState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  grounded: boolean;
};

type Collectible = {
  id: string;
  x: number;
  y: number;
  kind: PowerKind | 'flower';
};

type Hazard = {
  x: number;
  width: number;
  kind: 'stream' | 'basket' | 'goat';
};

type GameState = {
  player: PlayerState;
  collected: Set<string>;
  lives: number;
  checkpoint: number;
  elapsed: number;
  invulnerableUntil: number;
  squashUntil: number;
  coffeeUntil: number;
  teaUntil: number;
  shield: boolean;
};

type UiSnapshot = {
  lives: number;
  collected: number;
  progress: number;
  powers: PowerKind[];
  shield: boolean;
};

const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 540;
const GROUND_Y = 435;
const LEVEL_END = 10_900;
const PLAYER_START_X = 110;

const hazards: Hazard[] = [
  { x: 1_180, width: 125, kind: 'stream' },
  { x: 2_120, width: 64, kind: 'basket' },
  { x: 2_890, width: 78, kind: 'goat' },
  { x: 3_720, width: 145, kind: 'stream' },
  { x: 4_760, width: 66, kind: 'basket' },
  { x: 5_650, width: 82, kind: 'goat' },
  { x: 6_610, width: 138, kind: 'stream' },
  { x: 7_520, width: 66, kind: 'basket' },
  { x: 8_330, width: 86, kind: 'goat' },
  { x: 9_320, width: 148, kind: 'stream' },
];

const collectibles: Collectible[] = [
  { id: 'flower-1', x: 520, y: 374, kind: 'flower' },
  { id: 'squash', x: 1_020, y: 368, kind: 'squash' },
  { id: 'flower-2', x: 1_590, y: 340, kind: 'flower' },
  { id: 'flower-3', x: 1_880, y: 374, kind: 'flower' },
  { id: 'coffee', x: 2_520, y: 368, kind: 'coffee' },
  { id: 'flower-4', x: 3_260, y: 342, kind: 'flower' },
  { id: 'macadamia', x: 4_230, y: 368, kind: 'macadamia' },
  { id: 'flower-5', x: 5_140, y: 374, kind: 'flower' },
  { id: 'tea', x: 6_170, y: 368, kind: 'tea' },
  { id: 'flower-6', x: 7_080, y: 342, kind: 'flower' },
  { id: 'coffee-2', x: 7_900, y: 368, kind: 'coffee' },
  { id: 'flower-7', x: 8_760, y: 374, kind: 'flower' },
  { id: 'macadamia-2', x: 9_820, y: 368, kind: 'macadamia' },
  { id: 'flower-8', x: 10_360, y: 340, kind: 'flower' },
];

const createGame = (): GameState => ({
  player: { x: PLAYER_START_X, y: GROUND_Y - 52, vx: 0, vy: 0, width: 34, height: 52, grounded: true },
  collected: new Set(),
  lives: 3,
  checkpoint: PLAYER_START_X,
  elapsed: 0,
  invulnerableUntil: 0,
  squashUntil: 0,
  coffeeUntil: 0,
  teaUntil: 0,
  shield: false,
});

const initialSnapshot: UiSnapshot = { lives: 3, collected: 0, progress: 0, powers: [], shield: false };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const overlaps = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

const powerLabels: Record<PowerKind, Record<LanguageCode, string>> = {
  squash: { vi: 'Bí xanh · bật cao', en: 'Squash · high jump' },
  coffee: { vi: 'Cà phê · tăng tốc', en: 'Coffee · speed' },
  macadamia: { vi: 'Mắc ca · lá chắn', en: 'Macadamia · shield' },
  tea: { vi: 'Shan Tuyết · chậm thời gian', en: 'Shan Tuyet · slow time' },
};

const drawMountainLayer = (
  context: CanvasRenderingContext2D,
  camera: number,
  parallax: number,
  baseline: number,
  color: string,
  step: number,
) => {
  const offset = -((camera * parallax) % step);
  context.beginPath();
  context.moveTo(0, VIEW_HEIGHT);
  context.lineTo(0, baseline);
  for (let x = offset - step; x <= VIEW_WIDTH + step; x += step) {
    context.lineTo(x, baseline);
    context.lineTo(x + step * 0.46, baseline - step * 0.48);
    context.lineTo(x + step, baseline);
  }
  context.lineTo(VIEW_WIDTH, VIEW_HEIGHT);
  context.closePath();
  context.fillStyle = color;
  context.fill();
};

const drawStiltHouse = (context: CanvasRenderingContext2D, x: number, y: number, accent: string) => {
  context.fillStyle = '#553925';
  context.fillRect(x + 10, y + 35, 5, 38);
  context.fillRect(x + 68, y + 35, 5, 38);
  context.fillStyle = '#b78a54';
  context.fillRect(x + 4, y + 18, 76, 38);
  context.fillStyle = accent;
  context.fillRect(x + 13, y + 29, 17, 18);
  context.fillStyle = '#2d241c';
  context.fillRect(x + 53, y + 31, 15, 25);
  context.fillStyle = '#6e3e2d';
  context.beginPath();
  context.moveTo(x - 6, y + 20);
  context.lineTo(x + 42, y - 10);
  context.lineTo(x + 90, y + 20);
  context.closePath();
  context.fill();
};

const drawBuffalo = (context: CanvasRenderingContext2D, x: number, y: number) => {
  context.fillStyle = '#3a3029';
  context.fillRect(x, y, 39, 18);
  context.fillRect(x + 31, y - 7, 18, 16);
  context.fillRect(x + 6, y + 16, 5, 15);
  context.fillRect(x + 30, y + 16, 5, 15);
  context.strokeStyle = '#d8c49a';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(x + 47, y - 4, 9, 2.8, 4.7);
  context.stroke();
};

const collectibleColor: Record<Collectible['kind'], string> = {
  squash: '#9dcb58',
  coffee: '#8a4c31',
  macadamia: '#d6bd75',
  tea: '#5eaa72',
  flower: '#f2b6c1',
};

const drawCollectible = (context: CanvasRenderingContext2D, item: Collectible, screenX: number, elapsed: number) => {
  const bob = Math.sin(elapsed * 4 + item.x * 0.02) * 5;
  const y = item.y + bob;
  context.fillStyle = 'rgba(16, 35, 28, 0.18)';
  context.fillRect(screenX - 4, y + 25, 34, 6);
  context.fillStyle = collectibleColor[item.kind];
  if (item.kind === 'flower') {
    context.fillRect(screenX + 10, y + 10, 5, 18);
    context.fillRect(screenX + 3, y + 3, 10, 10);
    context.fillRect(screenX + 14, y, 10, 10);
    context.fillRect(screenX + 13, y + 11, 10, 10);
    return;
  }
  context.fillRect(screenX, y, 27, 24);
  context.fillStyle = 'rgba(255,255,255,.55)';
  context.fillRect(screenX + 5, y + 4, 7, 5);
  context.fillStyle = '#24372c';
  context.font = '800 10px sans-serif';
  context.fillText(item.kind === 'squash' ? 'BÍ' : item.kind === 'coffee' ? 'CF' : item.kind === 'tea' ? 'CHÈ' : 'MC', screenX + 3, y + 40);
};

const drawWorld = (context: CanvasRenderingContext2D, game: GameState) => {
  const camera = clamp(game.player.x - 250, 0, LEVEL_END - VIEW_WIDTH + 140);
  const sky = context.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
  sky.addColorStop(0, '#a8d7d4');
  sky.addColorStop(0.58, '#e8d99e');
  sky.addColorStop(1, '#779c61');
  context.fillStyle = sky;
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  context.fillStyle = 'rgba(255, 247, 206, .65)';
  context.fillRect(744, 74, 45, 45);
  drawMountainLayer(context, camera, 0.08, 275, '#769a86', 230);
  drawMountainLayer(context, camera, 0.16, 334, '#527760', 190);

  const fieldOffset = -((camera * 0.34) % 180);
  for (let x = fieldOffset - 180; x < VIEW_WIDTH + 180; x += 180) {
    context.fillStyle = '#a6b85d';
    context.fillRect(x, 334, 120, 102);
    context.fillStyle = '#d2b85b';
    context.fillRect(x + 120, 334, 60, 102);
    context.strokeStyle = 'rgba(63, 87, 45, .22)';
    context.beginPath();
    context.moveTo(x, 348);
    context.lineTo(x + 180, 400);
    context.stroke();
  }

  const firstHouse = Math.floor((camera - 300) / 880);
  for (let index = firstHouse; index <= firstHouse + 3; index += 1) {
    const worldX = index * 880 + 370;
    const screenX = worldX - camera * 0.72;
    drawStiltHouse(context, screenX, 300 + (Math.abs(index) % 2) * 10, index % 2 === 0 ? '#d7b96a' : '#85a78a');
    if (index % 2 === 0) drawBuffalo(context, screenX + 126, 387);
  }

  context.fillStyle = '#4d794b';
  context.fillRect(0, GROUND_Y, VIEW_WIDTH, VIEW_HEIGHT - GROUND_Y);
  context.fillStyle = '#315d3e';
  context.fillRect(0, GROUND_Y, VIEW_WIDTH, 10);
  context.fillStyle = '#80583b';
  for (let x = -((camera * 0.9) % 72); x < VIEW_WIDTH; x += 72) context.fillRect(x, GROUND_Y + 36, 45, 5);

  hazards.forEach((hazard) => {
    let worldX = hazard.x;
    if (hazard.kind === 'goat') {
      const timeScale = game.teaUntil > game.elapsed ? 0.35 : 1;
      worldX += Math.sin(game.elapsed * 2.2 * timeScale + hazard.x) * 34;
    }
    const x = worldX - camera;
    if (x < -180 || x > VIEW_WIDTH + 180) return;
    if (hazard.kind === 'stream') {
      context.fillStyle = '#5aa5aa';
      context.fillRect(x, GROUND_Y - 2, hazard.width, VIEW_HEIGHT - GROUND_Y + 2);
      context.fillStyle = 'rgba(231, 248, 226, .55)';
      for (let wave = 8; wave < hazard.width; wave += 28) context.fillRect(x + wave, GROUND_Y + 12 + (wave % 3), 14, 3);
    } else if (hazard.kind === 'basket') {
      context.fillStyle = '#9c6b38';
      context.fillRect(x, GROUND_Y - 38, hazard.width, 38);
      context.fillStyle = '#d2a65a';
      for (let stripe = 7; stripe < hazard.width; stripe += 13) context.fillRect(x + stripe, GROUND_Y - 36, 4, 34);
    } else {
      context.fillStyle = '#eee5cf';
      context.fillRect(x, GROUND_Y - 29, 54, 29);
      context.fillRect(x + 41, GROUND_Y - 39, 26, 25);
      context.fillStyle = '#624c3d';
      context.fillRect(x + 8, GROUND_Y - 3, 6, 18);
      context.fillRect(x + 41, GROUND_Y - 3, 6, 18);
    }
  });

  collectibles.forEach((item) => {
    if (game.collected.has(item.id)) return;
    const x = item.x - camera;
    if (x > -60 && x < VIEW_WIDTH + 60) drawCollectible(context, item, x, game.elapsed);
  });

  const finishX = LEVEL_END - camera;
  if (finishX > -80 && finishX < VIEW_WIDTH + 100) {
    context.fillStyle = '#553925';
    context.fillRect(finishX, GROUND_Y - 150, 9, 150);
    context.fillStyle = '#e8cf76';
    context.fillRect(finishX + 9, GROUND_Y - 145, 92, 44);
    context.fillStyle = '#334f39';
    context.font = '900 14px sans-serif';
    context.fillText('PHIÊNG LƠI', finishX + 17, GROUND_Y - 118);
  }

  const player = game.player;
  const playerX = player.x - camera;
  const growth = game.squashUntil > game.elapsed ? 1.18 : 1;
  const blink = game.invulnerableUntil > game.elapsed && Math.floor(game.elapsed * 12) % 2 === 0;
  if (!blink) {
    context.save();
    context.translate(playerX + player.width / 2, player.y + player.height);
    context.scale(growth, growth);
    context.translate(-(playerX + player.width / 2), -(player.y + player.height));
    if (game.shield) {
      context.strokeStyle = '#f4d985';
      context.lineWidth = 4;
      context.strokeRect(playerX - 9, player.y - 8, player.width + 18, player.height + 14);
    }
    context.fillStyle = '#253e36';
    context.fillRect(playerX + 5, player.y + 18, 25, 31);
    context.fillStyle = '#d8a469';
    context.fillRect(playerX + 9, player.y + 3, 17, 17);
    context.fillStyle = '#b94e35';
    context.fillRect(playerX + 5, player.y, 26, 7);
    context.fillStyle = '#e7d17b';
    context.fillRect(playerX + 1, player.y + 21, 8, 21);
    context.fillStyle = '#17251f';
    context.fillRect(playerX + 5, player.y + 46, 9, 8);
    context.fillRect(playerX + 21, player.y + 46, 9, 8);
    context.restore();
  }
};

const getHazardRect = (hazard: Hazard, game: GameState) => {
  let x = hazard.x;
  if (hazard.kind === 'goat') {
    const timeScale = game.teaUntil > game.elapsed ? 0.35 : 1;
    x += Math.sin(game.elapsed * 2.2 * timeScale + hazard.x) * 34;
  }
  return hazard.kind === 'stream'
    ? { x, y: GROUND_Y - 5, width: hazard.width, height: 80 }
    : hazard.kind === 'basket'
      ? { x, y: GROUND_Y - 38, width: hazard.width, height: 38 }
      : { x, y: GROUND_Y - 42, width: 67, height: 42 };
};

export const PhiengLoiGamePage = ({ language, setLanguage }: PhiengLoiGamePageProps) => {
  const vi = language === 'vi';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<GameState>(createGame());
  const inputRef = useRef<InputState>({ left: false, right: false, jumpQueued: false });
  const animationRef = useRef<number | null>(null);
  const uiSyncAtRef = useRef(0);
  const [status, setStatus] = useState<GameStatus>('intro');
  const [ui, setUi] = useState<UiSnapshot>(initialSnapshot);

  const syncUi = useCallback((game: GameState, force = false) => {
    if (!force && game.elapsed - uiSyncAtRef.current < 0.18) return;
    uiSyncAtRef.current = game.elapsed;
    const powers: PowerKind[] = [];
    if (game.squashUntil > game.elapsed) powers.push('squash');
    if (game.coffeeUntil > game.elapsed) powers.push('coffee');
    if (game.teaUntil > game.elapsed) powers.push('tea');
    setUi({
      lives: game.lives,
      collected: game.collected.size,
      progress: clamp(game.player.x / LEVEL_END, 0, 1),
      powers,
      shield: game.shield,
    });
  }, []);

  const resetGame = useCallback(() => {
    gameRef.current = createGame();
    inputRef.current = { left: false, right: false, jumpQueued: false };
    uiSyncAtRef.current = 0;
    setUi(initialSnapshot);
    setStatus('playing');
  }, []);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    context.imageSmoothingEnabled = false;

    if (status !== 'playing') {
      drawWorld(context, gameRef.current);
      return;
    }

    let previousTime = performance.now();
    let active = true;
    const keyDown = (event: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'a', 'd', 'w'].includes(event.key)) event.preventDefault();
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') inputRef.current.left = true;
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') inputRef.current.right = true;
      if ((event.key === 'ArrowUp' || event.key === ' ' || event.key.toLowerCase() === 'w') && !event.repeat) inputRef.current.jumpQueued = true;
    };
    const keyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') inputRef.current.left = false;
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') inputRef.current.right = false;
    };
    const clearInput = () => { inputRef.current = { left: false, right: false, jumpQueued: false }; };

    window.addEventListener('keydown', keyDown, { passive: false });
    window.addEventListener('keyup', keyUp);
    window.addEventListener('blur', clearInput);

    const frame = (time: number) => {
      if (!active) return;
      const dt = Math.min(0.032, Math.max(0.001, (time - previousTime) / 1000));
      previousTime = time;
      const game = gameRef.current;
      const player = game.player;
      const input = inputRef.current;
      game.elapsed += dt;

      const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      const targetSpeed = direction * (game.coffeeUntil > game.elapsed ? 340 : 225);
      player.vx += (targetSpeed - player.vx) * Math.min(1, dt * 9);
      if (input.jumpQueued && player.grounded) {
        player.vy = game.squashUntil > game.elapsed ? -665 : -565;
        player.grounded = false;
      }
      input.jumpQueued = false;
      player.vy += 1_420 * dt;
      player.x = clamp(player.x + player.vx * dt, 0, LEVEL_END + 40);
      player.y += player.vy * dt;
      if (player.y + player.height >= GROUND_Y) {
        player.y = GROUND_Y - player.height;
        player.vy = 0;
        player.grounded = true;
      }

      const checkpoint = Math.floor(player.x / 2_200) * 2_200 + PLAYER_START_X;
      if (checkpoint > game.checkpoint && checkpoint < LEVEL_END - 600) game.checkpoint = checkpoint;

      const playerRect = { x: player.x, y: player.y, width: player.width, height: player.height };
      collectibles.forEach((item) => {
        if (game.collected.has(item.id)) return;
        if (!overlaps(playerRect, { x: item.x, y: item.y - 8, width: 30, height: 46 })) return;
        game.collected.add(item.id);
        if (item.kind === 'squash') game.squashUntil = game.elapsed + 8;
        if (item.kind === 'coffee') game.coffeeUntil = game.elapsed + 8;
        if (item.kind === 'tea') game.teaUntil = game.elapsed + 8;
        if (item.kind === 'macadamia') game.shield = true;
        syncUi(game, true);
      });

      if (game.invulnerableUntil <= game.elapsed) {
        const hitHazard = hazards.some((hazard) => overlaps(playerRect, getHazardRect(hazard, game)));
        if (hitHazard) {
          if (game.shield) {
            game.shield = false;
            game.invulnerableUntil = game.elapsed + 1.4;
            player.vy = -360;
            player.vx = -150;
          } else {
            game.lives -= 1;
            game.invulnerableUntil = game.elapsed + 1.5;
            player.x = game.checkpoint;
            player.y = GROUND_Y - player.height;
            player.vx = 0;
            player.vy = 0;
            if (game.lives <= 0) {
              syncUi(game, true);
              setStatus('failed');
              drawWorld(context, game);
              return;
            }
          }
          syncUi(game, true);
        }
      }

      if (player.x >= LEVEL_END) {
        player.x = LEVEL_END;
        syncUi(game, true);
        setStatus('completed');
        drawWorld(context, game);
        return;
      }

      drawWorld(context, game);
      syncUi(game);
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
      clearInput();
    };
  }, [status, syncUi]);

  const getTouchDirection = (event: ReactPointerEvent<HTMLButtonElement>): 'left' | 'right' => (
    event.currentTarget.dataset.direction === 'left' ? 'left' : 'right'
  );

  const releaseTouch = (event: ReactPointerEvent<HTMLButtonElement>) => {
    inputRef.current[getTouchDirection(event)] = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const pressTouch = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    inputRef.current[getTouchDirection(event)] = true;
  };

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
          <p>{vi ? 'CHƯƠNG VĂN HOÁ · MỘT MÀN 2D NHẸ' : 'CULTURE CHAPTER · A LIGHT 2D LEVEL'}</p>
          <h1 id="phieng-game-title">{vi ? 'Nhịp bản Phiêng Lơi' : 'Phiêng Lơi Village Rhythm'}</h1>
        </div>
        <p>{vi ? 'Chạy qua nương, suối và nếp nhà. Nhặt sản vật để thay đổi cách bạn di chuyển.' : 'Run past fields, streams and stilt houses. Collect local produce to change how you move.'}</p>
      </section>

      <section className="phieng-game__console" aria-label={vi ? 'Trò chơi Phiêng Lơi' : 'Phiêng Lơi game'}>
        <div className="phieng-game__hud">
          <span aria-label={vi ? `${ui.lives} lượt còn lại` : `${ui.lives} lives left`}>{'♥'.repeat(Math.max(0, ui.lives))}</span>
          <div className="phieng-game__progress" aria-label={vi ? `Tiến độ ${Math.round(ui.progress * 100)}%` : `${Math.round(ui.progress * 100)}% progress`}>
            <i style={{ width: `${ui.progress * 100}%` }} />
          </div>
          <span>{ui.collected}/{collectibles.length}</span>
        </div>

        <div className="phieng-game__stage">
          <canvas ref={canvasRef} width={VIEW_WIDTH} height={VIEW_HEIGHT} aria-label={vi ? 'Màn chơi cuộn ngang qua bản Phiêng Lơi' : 'Side-scrolling level through Phiêng Lơi village'} />

          {status === 'intro' ? (
            <div className="phieng-game__overlay">
              <p>{vi ? 'MỘT CHUYẾN ĐI NHỎ' : 'A SMALL JOURNEY'}</p>
              <h2>{vi ? 'Từ đầu bản đến cổng Phiêng Lơi' : 'From the first house to the Phiêng Lơi gate'}</h2>
              <div>{vi ? '← → để di chuyển · ↑ hoặc Space để nhảy' : '← → to move · ↑ or Space to jump'}</div>
              <button type="button" onClick={resetGame}>{vi ? 'Bắt đầu' : 'Start'}<ArrowRight aria-hidden="true" /></button>
            </div>
          ) : null}

          {status === 'completed' ? (
            <div className="phieng-game__overlay is-result">
              <Sparkles aria-hidden="true" />
              <p>{vi ? 'ĐÃ ĐẾN PHIÊNG LƠI' : 'WELCOME TO PHIÊNG LƠI'}</p>
              <h2>{vi ? 'Bạn đã đi hết nhịp bản.' : 'You reached the end of the village rhythm.'}</h2>
              <div>{vi ? 'Bây giờ bạn có thể ghé điểm thật bằng thử thách GPS, hoặc đi thẳng tới cuốn sách.' : 'Visit the real place through its GPS challenge, or continue directly to the book.'}</div>
              <nav>
                <Link to={PHIENG_LOI_CHALLENGE_PATH}><MapPin aria-hidden="true" />GPS Phiêng Lơi</Link>
                <Link to="/book"><BookOpen aria-hidden="true" />{vi ? 'Mở Book' : 'Open Book'}</Link>
                <button type="button" onClick={resetGame}><RotateCcw aria-hidden="true" />{vi ? 'Chơi lại' : 'Play again'}</button>
              </nav>
            </div>
          ) : null}

          {status === 'failed' ? (
            <div className="phieng-game__overlay is-result">
              <p>{vi ? 'TẠM DỪNG BÊN ĐƯỜNG' : 'A PAUSE ON THE ROAD'}</p>
              <h2>{vi ? 'Thử lại từ đầu bản nhé.' : 'Try the path once more.'}</h2>
              <button type="button" onClick={resetGame}><RotateCcw aria-hidden="true" />{vi ? 'Thử lại' : 'Try again'}</button>
            </div>
          ) : null}
        </div>

        <div className="phieng-game__powers" aria-live="polite">
          {ui.powers.map((power) => <span key={power} className={`is-${power}`}>{powerLabels[power][language]}</span>)}
          {ui.shield ? <span className="is-macadamia">{powerLabels.macadamia[language]}</span> : null}
          {ui.powers.length === 0 && !ui.shield ? <span>{vi ? 'Nhặt sản vật trên đường để nhận sức mạnh' : 'Collect produce along the way for power-ups'}</span> : null}
        </div>

        <div className="phieng-game__touch" aria-label={vi ? 'Điều khiển cảm ứng' : 'Touch controls'}>
          <button type="button" data-direction="left" aria-label={vi ? 'Đi sang trái' : 'Move left'} onPointerDown={pressTouch} onPointerUp={releaseTouch} onPointerCancel={releaseTouch}>
            <ArrowLeft aria-hidden="true" />
          </button>
          <button type="button" data-direction="right" aria-label={vi ? 'Đi sang phải' : 'Move right'} onPointerDown={pressTouch} onPointerUp={releaseTouch} onPointerCancel={releaseTouch}>
            <ArrowRight aria-hidden="true" />
          </button>
          <button type="button" className="is-jump" aria-label={vi ? 'Nhảy' : 'Jump'} onPointerDown={() => { inputRef.current.jumpQueued = true; }}>
            {vi ? 'NHẢY' : 'JUMP'}
          </button>
        </div>
      </section>

      <footer className="phieng-game__footer">
        <span>{vi ? 'Prototype một màn · không tải game engine' : 'One-level prototype · no game engine loaded'}</span>
        <nav><Link to="/1954">1954</Link><Link to="/book">BOOK</Link></nav>
      </footer>
    </main>
  );
};
