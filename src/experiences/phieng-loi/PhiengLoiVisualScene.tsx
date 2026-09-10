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
import {
  HANU_ROUTE,
  PHIENG_LOI_LANDMARKS,
  WORLD_OCCLUDERS,
  terrainAt,
} from './worldLayout';

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
const ACTOR_WIDTH = {
  player: 46,
  chief: 53,
  heesunPose: 49,
  heesunRun: 38,
  hanuPose: 47,
  hanuWalk: 36,
  feast: 82,
  streamGroup: 54,
  vuongMe: 52,
  heesunWife: 39,
  chicken: 18,
  dog: 32,
  buffalo: 62,
} as const;
const CHICKEN_REST = Array.from({ length: CHICKEN_COUNT }, (_, index) => ({
  x: PHIENG_LOI_LANDMARKS.chickenYard.x - 58 + (index % 5) * 18,
  y: PHIENG_LOI_LANDMARKS.chickenYard.y + (index % 2) * 12,
}));

const semanticHeeSunFrame = (mode: HeeSunMode, worldTime: number): number => {
  if (mode === 'ambush') return 3;
  if (mode === 'intro') return worldTime % 2.4 < 1.2 ? 1 : 2;
  if (mode === 'drinking' || mode === 'interrupted') return 5;
  if (mode === 'notice') return 2;
  if (mode === 'rare-flee') return 4;
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

const setSpriteWidth = (node: HTMLDivElement | null, width: number) => {
  if (node && node.style.width !== `${width}px`) node.style.width = `${width}px`;
};

const setData = (node: HTMLDivElement | null, key: string, value: string) => {
  if (node && node.dataset[key] !== value) node.dataset[key] = value;
};

const cycleFrame = (time: number, framesPerSecond: number, reducedMotion: boolean) => (
  reducedMotion ? 0 : Math.floor(time * framesPerSecond) % 8
);

const VisualScene = forwardRef<PhiengLoiVisualHandle, VisualSceneProps>(({ initialGame }, ref) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const chiefRef = useRef<HTMLDivElement | null>(null);
  const chiefSpriteRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const playerSpriteRef = useRef<HTMLDivElement | null>(null);
  const heesunRef = useRef<HTMLDivElement | null>(null);
  const heesunSpriteRef = useRef<HTMLDivElement | null>(null);
  const heesunTwinRef = useRef<HTMLDivElement | null>(null);
  const heesunTwinSpriteRef = useRef<HTMLDivElement | null>(null);
  const hanuRef = useRef<HTMLDivElement | null>(null);
  const hanuSpriteRef = useRef<HTMLDivElement | null>(null);
  const hanuFoodRef = useRef<HTMLImageElement | null>(null);
  const feastRef = useRef<HTMLDivElement | null>(null);
  const feastSpriteRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<HTMLDivElement | null>(null);
  const streamSpriteRef = useRef<HTMLDivElement | null>(null);
  const dogRef = useRef<HTMLDivElement | null>(null);
  const dogSpriteRef = useRef<HTMLDivElement | null>(null);
  const vuongMeRef = useRef<HTMLDivElement | null>(null);
  const vuongMeSpriteRef = useRef<HTMLDivElement | null>(null);
  const wifeRef = useRef<HTMLDivElement | null>(null);
  const wifeSpriteRef = useRef<HTMLDivElement | null>(null);
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

    if (game.callSerial !== renderedCallRef.current) {
      renderedCallRef.current = game.callSerial;
      if (callRef.current) {
        placeActor(callRef.current, game.player.x, game.player.y - 22);
        callRef.current.classList.remove('is-active');
        void callRef.current.offsetWidth;
        callRef.current.classList.add('is-active');
      }
    }

    const karaokeActive = game.karaoke.active;

    const chiefSpeaking = game.chief.startedAt > 0 && game.chief.pausedUntil <= game.elapsed;
    const chiefAge = chiefSpeaking ? Math.max(0, game.elapsed - game.chief.startedAt) : game.worldTime;
    const chiefFrame = chiefSpeaking || karaokeActive
      ? cycleFrame(chiefAge, karaokeActive ? 7.2 : 5.4, game.reducedMotion)
      : game.reducedMotion || game.worldTime % 4.8 < 4.64 ? 0 : 5;
    setSpriteFrame(chiefSpriteRef.current, 'chiefTalk', chiefFrame);
    setSpriteWidth(chiefSpriteRef.current, ACTOR_WIDTH.chief);
    setData(chiefRef.current, 'motion', karaokeActive ? 'karaoke' : chiefSpeaking ? 'talk' : 'idle');

    const playerMoving = Math.hypot(game.player.vx, game.player.vy) > 5;
    const playerFrame = game.reducedMotion ? 0 : Math.floor(game.player.walk * 1.28) % 8;
    const playerDepthScale = 0.88 + (game.player.y / WORLD_HEIGHT) * 0.2;
    const playerPowerScale = game.powerUntil.squash > game.elapsed ? 1.3 : 1;
    placeActor(playerRef.current, game.player.x, game.player.y);
    setSpriteFrame(playerSpriteRef.current, playerMoving ? 'playerRun' : 'support', playerMoving ? playerFrame : 0);
    setSpriteWidth(playerSpriteRef.current, ACTOR_WIDTH.player);
    setSpriteTransform(playerSpriteRef.current, game.player.facingX, playerDepthScale * playerPowerScale);
    setData(playerRef.current, 'motion', karaokeActive ? 'karaoke' : playerMoving ? 'run' : 'idle');
    setData(playerRef.current, 'terrain', terrainAt(game.player.x, game.player.y));

    const heesunMoving = game.heesun.mode === 'chasing' || game.heesun.mode === 'distracted' || game.heesun.mode === 'rare-flee' || game.heesun.mode === 'wander';
    const heesunFrame = cycleFrame(game.worldTime, 11.5, game.reducedMotion);
    const heesunDepthScale = 0.88 + (game.heesun.y / WORLD_HEIGHT) * 0.2;
    placeActor(heesunRef.current, game.heesun.x, game.heesun.y);
    setSpriteFrame(
      heesunSpriteRef.current,
      heesunMoving ? 'heesunRun' : 'heesun',
      heesunMoving ? heesunFrame : semanticHeeSunFrame(game.heesun.mode, game.worldTime),
    );
    setSpriteWidth(heesunSpriteRef.current, heesunMoving ? ACTOR_WIDTH.heesunRun : ACTOR_WIDTH.heesunPose);
    setSpriteTransform(
      heesunSpriteRef.current,
      Math.abs(game.heesun.vx) > 1 ? game.heesun.vx : 1,
      game.heesun.scale * heesunDepthScale,
    );
    setData(heesunRef.current, 'motion', karaokeActive ? 'karaoke' : heesunMoving ? 'chase' : game.heesun.mode);

    if (heesunTwinRef.current) {
      const twinActive = game.worldGag.heesunTwinUntil > game.elapsed;
      heesunTwinRef.current.hidden = !twinActive;
      if (twinActive) {
        placeActor(heesunTwinRef.current, game.heesun.x + 42, game.heesun.y + 5);
        setSpriteFrame(heesunTwinSpriteRef.current, 'heesun', semanticHeeSunFrame('notice', game.worldTime));
        setSpriteWidth(heesunTwinSpriteRef.current, ACTOR_WIDTH.heesunPose);
        setSpriteTransform(heesunTwinSpriteRef.current, -1, heesunDepthScale);
      }
    }

    const hanuTarget = HANU_ROUTE[game.hanu.waypoint % HANU_ROUTE.length];
    const routeFacing = hanuTarget.x >= game.hanu.x ? 1 : -1;
    const hanuFacing = game.hanu.headTurnUntil > game.elapsed
      ? (game.player.x >= game.hanu.x ? 1 : -1)
      : routeFacing;
    const dominoActive = game.dominoStartedAt !== 0 && game.elapsed - game.dominoStartedAt < 3.4;
    const hanuTalking = game.message?.tone === 'hanu';
    const hanuFrame = cycleFrame(game.worldTime, 8.2, game.reducedMotion);
    const hanuDepthScale = 0.88 + (game.hanu.y / WORLD_HEIGHT) * 0.2;
    placeActor(hanuRef.current, game.hanu.x, game.hanu.y);
    setSpriteFrame(
      hanuSpriteRef.current,
      dominoActive || hanuTalking ? 'hanu' : 'hanuWalk',
      dominoActive ? 5 : hanuTalking ? 2 : hanuFrame,
    );
    setSpriteWidth(hanuSpriteRef.current, dominoActive || hanuTalking ? ACTOR_WIDTH.hanuPose : ACTOR_WIDTH.hanuWalk);
    setSpriteTransform(hanuSpriteRef.current, hanuFacing, hanuDepthScale);
    setData(hanuRef.current, 'motion', karaokeActive ? 'karaoke' : game.hanu.mode === 'delivery-paused' ? 'phone-pause' : dominoActive ? 'chaos' : hanuTalking ? 'talk' : game.hanu.carryingFood ? 'delivery' : 'walk');
    if (hanuFoodRef.current) hanuFoodRef.current.hidden = !game.hanu.carryingFood;

    placeActor(feastRef.current, game.feast.x, game.feast.y);
    const feastReacting = game.feast.mode === 'invite' || game.feast.mode === 'stare' || game.feast.mode === 'react';
    const feastRate = karaokeActive ? 7.4 : game.feast.mode === 'chasing' ? 9 : feastReacting ? 4.8 : 1.35 + game.feast.routineIndex * 0.16;
    setSpriteFrame(feastSpriteRef.current, 'feastLoop', cycleFrame(game.worldTime, feastRate, game.reducedMotion));
    setSpriteWidth(feastSpriteRef.current, ACTOR_WIDTH.feast);
    const chairFalling = game.worldGag.chairFallenUntil > game.elapsed;
    setData(feastRef.current, 'motion', karaokeActive ? 'karaoke' : game.feast.mode === 'chasing' ? 'chase' : chairFalling ? 'chair-fall' : feastReacting ? game.feast.mode : 'idle');

    const streamActive = game.streamStartedAt > 0 && game.elapsed - game.streamStartedAt < 5.2;
    const streamRate = karaokeActive ? 6.8 : streamActive ? 4.6 : 1.8 + Math.min(3.2, game.fishBoost / 24);
    setSpriteFrame(streamSpriteRef.current, 'streamLoop', cycleFrame(game.worldTime, streamRate, game.reducedMotion));
    setSpriteWidth(streamSpriteRef.current, ACTOR_WIDTH.streamGroup);
    if (karaokeActive) {
      const gathering = Math.min(1, Math.max(0, (game.elapsed - game.karaoke.startedAt - .35) / 1.65));
      const eased = 1 - (1 - gathering) ** 3;
      placeActor(
        streamRef.current,
        PHIENG_LOI_LANDMARKS.streamGroup.x + (game.karaoke.x - 70 - PHIENG_LOI_LANDMARKS.streamGroup.x) * eased,
        PHIENG_LOI_LANDMARKS.streamGroup.y + (game.karaoke.y + 15 - PHIENG_LOI_LANDMARKS.streamGroup.y) * eased,
      );
    } else {
      placeActor(streamRef.current, PHIENG_LOI_LANDMARKS.streamGroup.x, PHIENG_LOI_LANDMARKS.streamGroup.y);
    }
    setData(streamRef.current, 'motion', karaokeActive ? 'karaoke' : streamActive ? 'react' : 'idle');

    const dogAwake = game.worldGag.dogAwakeUntil > game.elapsed;
    placeActor(dogRef.current, PHIENG_LOI_LANDMARKS.dog.x, PHIENG_LOI_LANDMARKS.dog.y);
    setSpriteFrame(dogSpriteRef.current, 'support', 3);
    setSpriteWidth(dogSpriteRef.current, ACTOR_WIDTH.dog);
    setSpriteTransform(dogSpriteRef.current, dogAwake ? game.player.x - PHIENG_LOI_LANDMARKS.dog.x : 1, 1);
    setData(dogRef.current, 'motion', karaokeActive ? 'karaoke' : dogAwake ? 'awake' : 'idle');

    if (vuongMeRef.current) {
      const shouldHideVuongMe = !karaokeActive;
      if (vuongMeRef.current.hidden !== shouldHideVuongMe) {
        vuongMeRef.current.hidden = shouldHideVuongMe;
      }
      if (karaokeActive) {
        placeActor(vuongMeRef.current, game.karaoke.x, game.karaoke.y);
        setSpriteFrame(
          vuongMeSpriteRef.current,
          'vuongMeDance',
          cycleFrame(game.worldTime, 7.6, game.reducedMotion),
        );
        setSpriteWidth(vuongMeSpriteRef.current, ACTOR_WIDTH.vuongMe);
        setSpriteTransform(vuongMeSpriteRef.current, game.player.x < game.karaoke.x ? -1 : 1, 1);
        setData(vuongMeRef.current, 'motion', 'karaoke');
      }
    }

    if (wifeRef.current) {
      const wifeVisible = game.wife.visibleUntil > game.elapsed;
      wifeRef.current.hidden = !wifeVisible;
      if (wifeVisible) {
        placeActor(wifeRef.current, game.wife.x, game.wife.y);
        const wifeAge = Math.max(0, 4.8 - (game.wife.visibleUntil - game.elapsed));
        setSpriteFrame(wifeSpriteRef.current, 'heesunWife', wifeAge < .65 ? cycleFrame(wifeAge, 7, game.reducedMotion) % 2 : game.wife.commandUntil > game.elapsed ? 3 : 1);
        setSpriteWidth(wifeSpriteRef.current, ACTOR_WIDTH.heesunWife);
        setSpriteTransform(wifeSpriteRef.current, game.heesun.x >= game.wife.x ? 1 : -1, 1);
        setData(wifeRef.current, 'motion', game.wife.commandUntil > game.elapsed ? 'command' : 'idle');
      }
    }

    const chickenActive = game.chicken.mode !== 'peck' && game.chicken.modeUntil > game.elapsed;
    const chickenProgress = chickenActive
      ? Math.max(0, Math.min(1, (game.elapsed - game.chicken.modeStartedAt) / Math.max(.1, game.chicken.modeUntil - game.chicken.modeStartedAt)))
      : 0;
    chickenRefs.current.forEach((node, index) => {
      if (!node) return;
      const hidden = index >= game.chicken.visibleCount;
      if (node.hidden !== hidden) node.hidden = hidden;
      if (node.hidden) return;
      const rest = CHICKEN_REST[index];
      let x = rest.x;
      let y = rest.y;
      if (karaokeActive) {
        const angle = game.worldTime * 2.2 + index * (Math.PI * 2 / CHICKEN_COUNT);
        x = game.player.x + Math.cos(angle) * (38 + (index % 3) * 7);
        y = game.player.y + 20 + Math.sin(angle) * (18 + (index % 2) * 5);
      } else if (game.chicken.mode === 'panic-away' || game.chicken.mode === 'cross-screen') {
        x += chickenProgress * 520 + (index % 3) * 13;
        y += Math.sin(game.worldTime * 9 + index) * 8;
      } else if (game.chicken.mode === 'panic-toward-player') {
        x += (game.player.x - rest.x) * chickenProgress * .78 + (index % 3) * 8;
        y += (game.player.y - rest.y) * chickenProgress * .78 + Math.sin(game.worldTime * 10 + index) * 7;
      } else if (game.chicken.mode === 'follow-hanu') {
        x = game.hanu.x - 20 - index * 8;
        y = game.hanu.y + 7 + (index % 3) * 6;
      } else if (game.chicken.mode === 'follow-heesun') {
        x = game.heesun.x - 20 - index * 8;
        y = game.heesun.y + 7 + (index % 3) * 6;
      } else if (game.chicken.mode === 'invade-feast') {
        x = game.feast.x - 28 + (index % 5) * 12;
        y = game.feast.y + 5 + Math.floor(index / 5) * 9;
      }
      placeActor(node, x, y);
      setData(node, 'motion', karaokeActive ? 'karaoke' : game.chicken.mode);
    });

    setData(scene, 'terrain', terrainAt(game.player.x, game.player.y));
    setData(scene, 'absurdity', String(game.absurdityLevel));
    setData(scene, 'macro', game.worldGag.macro);
    scene.classList.toggle('is-capture', game.scene.kind === 'capture');
    scene.classList.toggle('is-karaoke', karaokeActive);
  }, []);

  useImperativeHandle(ref, () => ({ render }), [render]);
  useLayoutEffect(() => render(initialGame), [initialGame, render]);

  return (
    <div ref={sceneRef} className="phieng-visual" aria-label="Bản Phiêng Lơi với đường đất, nhà sàn, ruộng, suối, núi, Bảo tàng Chiến thắng và Tượng đài Chiến thắng Điện Biên Phủ ở xa">
      <div className="phieng-visual__distant" aria-hidden="true" />
      <div
        ref={worldRef}
        className="phieng-visual__world"
        style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT, backgroundImage: `url(${PHIENG_LOI_VISUAL_ASSETS.world})` }}
        aria-hidden="true"
      >
        <div className="phieng-visual__landmark is-monument">
          <img src={PHIENG_LOI_VISUAL_ASSETS.victoryMonument} alt="" />
        </div>
        <div className="phieng-visual__landmark is-museum">
          <img src={PHIENG_LOI_VISUAL_ASSETS.victoryMuseum} alt="" />
        </div>
        <div ref={chiefRef} className="phieng-visual__actor is-chief" style={actorStyle(PHIENG_LOI_LANDMARKS.chief.x, PHIENG_LOI_LANDMARKS.chief.y)}>
          <div ref={chiefSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('chiefTalk', 0), width: ACTOR_WIDTH.chief }} />
        </div>
        <div ref={feastRef} className="phieng-visual__actor is-feast" style={actorStyle(initialGame.feast.x, initialGame.feast.y)}>
          <div ref={feastSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('feastLoop', 0), width: ACTOR_WIDTH.feast }} />
        </div>
        <div ref={streamRef} className="phieng-visual__actor is-stream-group" style={actorStyle(PHIENG_LOI_LANDMARKS.streamGroup.x, PHIENG_LOI_LANDMARKS.streamGroup.y)}>
          <div ref={streamSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('streamLoop', 0), width: ACTOR_WIDTH.streamGroup }} />
        </div>
        <div ref={dogRef} className="phieng-visual__actor is-dog" style={actorStyle(PHIENG_LOI_LANDMARKS.dog.x, PHIENG_LOI_LANDMARKS.dog.y)}>
          <div ref={dogSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('support', 3), width: ACTOR_WIDTH.dog }} />
        </div>
        <StaticActor atlas="support" frame={4} {...PHIENG_LOI_LANDMARKS.buffalo} width={ACTOR_WIDTH.buffalo} className="is-buffalo" />

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
              style={{ ...atlasFrameStyle('support', 2), width: ACTOR_WIDTH.chicken, '--sprite-flip': index % 2 ? -1 : 1 } as CSSProperties}
            />
          </div>
        ))}

        <div ref={hanuRef} className="phieng-visual__actor is-hanu" style={actorStyle(initialGame.hanu.x, initialGame.hanu.y)}>
          <div ref={hanuSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('hanuWalk', 0), width: ACTOR_WIDTH.hanuWalk }} />
          <img ref={hanuFoodRef} className="phieng-visual__hanu-food" src={PHIENG_LOI_VISUAL_ASSETS.hanuFood} alt="" hidden />
        </div>
        <div ref={heesunRef} className="phieng-visual__actor is-heesun" style={actorStyle(initialGame.heesun.x, initialGame.heesun.y)}>
          <div ref={heesunSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('heesun', 0), width: ACTOR_WIDTH.heesunPose }} />
        </div>
        <div ref={heesunTwinRef} className="phieng-visual__actor is-heesun is-heesun-twin" style={actorStyle(initialGame.heesun.x + 42, initialGame.heesun.y + 5)} hidden>
          <div ref={heesunTwinSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('heesun', 2), width: ACTOR_WIDTH.heesunPose }} />
        </div>
        <div ref={wifeRef} className="phieng-visual__actor is-heesun-wife" style={actorStyle(initialGame.wife.x, initialGame.wife.y)} hidden>
          <div ref={wifeSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('heesunWife', 0), width: ACTOR_WIDTH.heesunWife }} />
          <strong className="phieng-visual__wife-command">VỀ.</strong>
        </div>
        <div
          ref={vuongMeRef}
          className="phieng-visual__actor is-vuongme"
          style={actorStyle(PHIENG_LOI_LANDMARKS.vuongMeStage.x, PHIENG_LOI_LANDMARKS.vuongMeStage.y)}
          hidden
        >
          <div ref={vuongMeSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('vuongMeDance', 0), width: ACTOR_WIDTH.vuongMe }} />
        </div>
        <div ref={playerRef} className="phieng-visual__actor is-player" style={actorStyle(initialGame.player.x, initialGame.player.y)}>
          <div ref={playerSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('support', 0), width: ACTOR_WIDTH.player }} />
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
      <div className="phieng-visual__karaoke-lights" aria-hidden="true">
        <i className="is-ball" />
        <i className="is-beam-a" />
        <i className="is-beam-b" />
        <i className="is-beam-c" />
        {Array.from({ length: 14 }, (_, index) => (
          <b
            key={index}
            style={{
              '--dot': index,
              '--dot-x': `${5 + ((index * 37) % 91)}%`,
              '--dot-y': `${15 + ((index * 23) % 71)}%`,
              '--dot-size': `${4 + (index % 3) * 2}px`,
            } as CSSProperties}
          />
        ))}
      </div>
      <div className="phieng-visual__terrain-cue" aria-hidden="true" />
      <div className="phieng-visual__foreground" aria-hidden="true" />
    </div>
  );
});

VisualScene.displayName = 'PhiengLoiVisualScene';

export const PhiengLoiVisualScene = memo(VisualScene);
