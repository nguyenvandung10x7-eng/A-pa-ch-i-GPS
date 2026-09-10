import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type CSSProperties,
} from 'react';
import {
  VIEW_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  type GameState,
  type HeeSunMode,
} from './gameEngine';
import { atlasFrameStyle, PHIENG_LOI_VISUAL_ASSETS, type AtlasName } from './visualAssets';
import { HANU_ROUTE, PHIENG_LOI_LANDMARKS, WORLD_OCCLUDERS, terrainAt } from './worldLayout';

type VisualSceneProps = { initialGame: GameState };

type StaticActorProps = {
  atlas: AtlasName;
  frame: number;
  x: number;
  y: number;
  width: number;
  className?: string;
};

export type PhiengLoiVisualHandle = { render: (game: GameState) => void };

const CHICKEN_COUNT = 10;
const CHICKEN_REST = Array.from({ length: CHICKEN_COUNT }, (_, index) => ({
  x: PHIENG_LOI_LANDMARKS.chickenYard.x - 104 + (index % 5) * 28,
  y: PHIENG_LOI_LANDMARKS.chickenYard.y + (index % 2) * 18,
}));

const semanticHeeSunFrame = (mode: HeeSunMode, worldTime: number): number => {
  if (mode === 'ambush') return 3;
  if (mode === 'intro') return worldTime % 2.4 < 1.2 ? 1 : 2;
  if (mode === 'drinking') return 5;
  return worldTime % 5.4 < 2.8 ? 0 : 1;
};

const actorStyle = (x: number, y: number): CSSProperties => ({
  transform: `translate3d(${x}px, ${y}px, 0)`,
  zIndex: Math.round(y),
});

const StaticActor = ({ atlas, frame, x, y, width, className = '' }: StaticActorProps) => (
  <div className={`phieng-visual__actor ${className}`} style={actorStyle(x, y)} aria-hidden="true">
    <div className="phieng-visual__sprite" style={{ ...atlasFrameStyle(atlas, frame), width }} />
  </div>
);

const placeActor = (node: HTMLDivElement | null, x: number, y: number) => {
  if (!node) return;
  node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
  const depth = Math.round(y / 3) * 3;
  if (node.style.zIndex !== String(depth)) node.style.zIndex = String(depth);
};

const setSpriteFrame = (node: HTMLDivElement | null, atlas: AtlasName, frame: number) => {
  if (!node) return;
  const signature = `${atlas}-${frame}`;
  if (node.dataset.frame === signature) return;
  const style = atlasFrameStyle(atlas, frame);
  node.style.backgroundImage = String(style.backgroundImage);
  node.style.backgroundPosition = String(style.backgroundPosition);
  node.style.backgroundRepeat = 'no-repeat';
  node.style.backgroundSize = String(style.backgroundSize);
  node.style.aspectRatio = String(style.aspectRatio);
  node.dataset.frame = signature;
};

const setSpriteTransform = (node: HTMLDivElement | null, facingX: number, scale: number) => {
  if (!node) return;
  node.style.setProperty('--sprite-flip', facingX < 0 ? '-1' : '1');
  node.style.setProperty('--sprite-scale', scale.toFixed(3));
};

const setData = (node: HTMLDivElement | null, key: string, value: string) => {
  if (node && node.dataset[key] !== value) node.dataset[key] = value;
};

const VisualScene = forwardRef<PhiengLoiVisualHandle, VisualSceneProps>(({ initialGame }, ref) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const playerSpriteRef = useRef<HTMLDivElement | null>(null);
  const heesunRef = useRef<HTMLDivElement | null>(null);
  const heesunSpriteRef = useRef<HTMLDivElement | null>(null);
  const hanuRef = useRef<HTMLDivElement | null>(null);
  const hanuSpriteRef = useRef<HTMLDivElement | null>(null);
  const feastRef = useRef<HTMLDivElement | null>(null);
  const chickenRefs = useRef<Array<HTMLDivElement | null>>([]);
  const callRef = useRef<HTMLDivElement | null>(null);
  const renderedCallRef = useRef(initialGame.callSerial);

  const render = useCallback((game: GameState) => {
    const scene = sceneRef.current;
    const world = worldRef.current;
    if (!scene || !world) return;

    const viewportScale = scene.clientWidth / VIEW_WIDTH;
    const shaking = !game.reducedMotion && game.shakeUntil > game.elapsed;
    const shakeX = shaking ? Math.sin(game.worldTime * 91) * 1.3 : 0;
    const shakeY = shaking ? Math.cos(game.worldTime * 77) * 0.85 : 0;
    world.style.transform = `translate3d(${(-game.cameraX * viewportScale + shakeX).toFixed(2)}px, ${(-game.cameraY * viewportScale + shakeY).toFixed(2)}px, 0) scale(${viewportScale.toFixed(5)})`;

    const playerMoving = Math.hypot(game.player.vx, game.player.vy) > 5;
    const playerFrame = Math.floor(game.player.walk * 1.28) % 8;
    const playerDepthScale = 0.88 + (game.player.y / WORLD_HEIGHT) * 0.2;
    const playerPowerScale = game.powerUntil.squash > game.elapsed ? 1.3 : 1;
    placeActor(playerRef.current, game.player.x, game.player.y);
    setSpriteFrame(playerSpriteRef.current, playerMoving ? 'playerRun' : 'support', playerMoving ? playerFrame : 0);
    setSpriteTransform(playerSpriteRef.current, game.player.facingX, playerDepthScale * playerPowerScale);
    setData(playerRef.current, 'motion', playerMoving ? 'run' : 'idle');
    setData(playerRef.current, 'terrain', terrainAt(game.player.x, game.player.y));

    const heesunMoving = game.heesun.mode === 'chasing' || game.heesun.mode === 'distracted';
    const heesunFrame = Math.floor(game.worldTime * 11.5) % 8;
    const heesunDepthScale = 0.88 + (game.heesun.y / WORLD_HEIGHT) * 0.2;
    placeActor(heesunRef.current, game.heesun.x, game.heesun.y);
    setSpriteFrame(
      heesunSpriteRef.current,
      heesunMoving ? 'heesunRun' : 'heesun',
      heesunMoving ? heesunFrame : semanticHeeSunFrame(game.heesun.mode, game.worldTime),
    );
    setSpriteTransform(
      heesunSpriteRef.current,
      Math.abs(game.heesun.vx) > 1 ? game.heesun.vx : 1,
      game.heesun.scale * heesunDepthScale,
    );
    setData(heesunRef.current, 'motion', heesunMoving ? 'chase' : game.heesun.mode);

    const hanuTarget = HANU_ROUTE[game.hanu.waypoint % HANU_ROUTE.length];
    const hanuFacing = hanuTarget.x >= game.hanu.x ? 1 : -1;
    const dominoActive = game.dominoStartedAt !== 0 && game.elapsed - game.dominoStartedAt < 3.4;
    const hanuTalking = game.message?.tone === 'hanu';
    const hanuFrame = Math.floor(game.worldTime * 8.2) % 8;
    const hanuDepthScale = 0.88 + (game.hanu.y / WORLD_HEIGHT) * 0.2;
    placeActor(hanuRef.current, game.hanu.x, game.hanu.y);
    setSpriteFrame(
      hanuSpriteRef.current,
      dominoActive || hanuTalking ? 'hanu' : 'hanuWalk',
      dominoActive ? 5 : hanuTalking ? 2 : hanuFrame,
    );
    setSpriteTransform(hanuSpriteRef.current, hanuFacing, hanuDepthScale);
    setData(hanuRef.current, 'motion', dominoActive ? 'chaos' : hanuTalking ? 'talk' : 'walk');

    placeActor(feastRef.current, game.feast.x, game.feast.y + 20);

    const panic = game.chicken.panicUntil > game.elapsed;
    const panicProgress = panic
      ? Math.max(0, Math.min(1, (game.elapsed - game.chicken.panicStartedAt) / 4.3))
      : 0;
    chickenRefs.current.forEach((node, index) => {
      if (!node) return;
      const hidden = !panic && index >= 4;
      if (node.hidden !== hidden) node.hidden = hidden;
      if (node.hidden) return;
      const rest = CHICKEN_REST[index];
      const x = panic ? rest.x + panicProgress * 520 + (index % 3) * 13 : rest.x;
      const y = panic ? rest.y + Math.sin(game.worldTime * 9 + index) * 8 : rest.y;
      placeActor(node, x, y);
    });

    if (game.callSerial !== renderedCallRef.current && callRef.current) {
      renderedCallRef.current = game.callSerial;
      placeActor(callRef.current, game.player.x, game.player.y - 22);
      callRef.current.classList.remove('is-active');
      void callRef.current.offsetWidth;
      callRef.current.classList.add('is-active');
    }

    setData(scene, 'terrain', terrainAt(game.player.x, game.player.y));
    setData(scene, 'absurdity', String(game.absurdityLevel));
    scene.classList.toggle('is-capture', game.scene.kind === 'capture');
  }, []);

  useImperativeHandle(ref, () => ({ render }), [render]);
  useLayoutEffect(() => render(initialGame), [initialGame, render]);

  return (
    <div ref={sceneRef} className="phieng-visual" aria-label="Bản Phiêng Lơi với đường đất, nhà sàn, ruộng, suối và núi Điện Biên">
      <div className="phieng-visual__distant" aria-hidden="true" />
      <div
        ref={worldRef}
        className="phieng-visual__world"
        style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT, backgroundImage: `url(${PHIENG_LOI_VISUAL_ASSETS.world})` }}
        aria-hidden="true"
      >
        <StaticActor atlas="support" frame={5} {...PHIENG_LOI_LANDMARKS.chief} width={72} className="is-chief" />
        <div ref={feastRef} className="phieng-visual__actor is-feast" style={actorStyle(initialGame.feast.x, initialGame.feast.y + 20)}>
          <div className="phieng-visual__sprite" style={{ ...atlasFrameStyle('support', 6), width: 128 }} />
        </div>
        <StaticActor atlas="support" frame={7} {...PHIENG_LOI_LANDMARKS.streamGroup} width={146} className="is-stream-group" />
        <StaticActor atlas="support" frame={3} x={926} y={526} width={50} className="is-dog" />
        <StaticActor atlas="support" frame={4} x={1_552} y={506} width={88} className="is-buffalo" />

        {CHICKEN_REST.map((position, index) => (
          <div
            key={index}
            ref={(node) => { chickenRefs.current[index] = node; }}
            className="phieng-visual__actor is-chicken"
            style={actorStyle(position.x, position.y)}
            hidden={index >= 4}
          >
            <div
              className="phieng-visual__sprite"
              style={{ ...atlasFrameStyle('support', 2), width: 29, '--sprite-flip': index % 2 ? -1 : 1 } as CSSProperties}
            />
          </div>
        ))}

        <div ref={hanuRef} className="phieng-visual__actor is-hanu" style={actorStyle(initialGame.hanu.x, initialGame.hanu.y)}>
          <div ref={hanuSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('hanuWalk', 0), width: 78 }} />
        </div>
        <div ref={heesunRef} className="phieng-visual__actor is-heesun" style={actorStyle(initialGame.heesun.x, initialGame.heesun.y)}>
          <div ref={heesunSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('heesun', 0), width: 82 }} />
        </div>
        <div ref={playerRef} className="phieng-visual__actor is-player" style={actorStyle(initialGame.player.x, initialGame.player.y)}>
          <div ref={playerSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('support', 0), width: 58 }} />
        </div>

        <div ref={callRef} className="phieng-visual__actor phieng-visual__call-anchor" style={actorStyle(initialGame.player.x, initialGame.player.y - 22)}>
          <div className="phieng-visual__call-ring" />
        </div>

        {WORLD_OCCLUDERS.map((occluder) => (
          <div
            key={occluder.id}
            className={`phieng-visual__occluder is-${occluder.id}`}
            style={{
              left: occluder.x,
              top: occluder.y,
              width: occluder.width,
              height: occluder.height,
              zIndex: occluder.depthY,
              backgroundImage: `url(${PHIENG_LOI_VISUAL_ASSETS.world})`,
              backgroundPosition: `-${occluder.x}px -${occluder.y}px`,
              backgroundSize: `${WORLD_WIDTH}px ${WORLD_HEIGHT}px`,
            }}
          />
        ))}
      </div>
      <div className="phieng-visual__sunwash" aria-hidden="true" />
      <div className="phieng-visual__terrain-cue" aria-hidden="true" />
      <div className="phieng-visual__foreground" aria-hidden="true" />
    </div>
  );
});

VisualScene.displayName = 'PhiengLoiVisualScene';

export const PhiengLoiVisualScene = memo(VisualScene);
