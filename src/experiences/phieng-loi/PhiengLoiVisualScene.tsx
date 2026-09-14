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
  FEAST_TABLE_LOCATIONS,
  VIEW_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  type GameState,
} from './gameEngine';
import {
  actorMotionForGame,
  advanceMotion,
  createMotionController,
  frameForTrack,
  karaokeOverrideFor,
  sampleMotionPose,
  type MotionPose,
  type MotionTrack,
} from './motionController';
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
  player: 108,
  playerAction: 82,
  playerPhaOi: 58,
  chief: 58,
  heesun: 112,
  hanu: 108,
  feast: 106,
  feastCrowd: 102,
  streamGroup: 88,
  streamAction: 92,
  vuongMe: 62,
  heesunWife: 43,
  chicken: 18,
  dog: 34,
  buffalo: 64,
} as const;

const CHICKEN_REST = Array.from({ length: CHICKEN_COUNT }, (_, index) => ({
  x: PHIENG_LOI_LANDMARKS.chickenYard.x - 58 + (index % 5) * 18,
  y: PHIENG_LOI_LANDMARKS.chickenYard.y + (index % 2) * 12,
}));

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
  const value = `${width}px`;
  if (node && node.style.width !== value) node.style.width = value;
};

const setData = (node: HTMLDivElement | null, key: string, value: string) => {
  if (node && node.dataset[key] !== value) node.dataset[key] = value;
};

// Resolve on the lower-elbow pose: both palms stay skyward while the silhouette
// moves closer to idle before control returns.
const PLAYER_PHA_OI_HOLD_FRAMES = [4, 5, 4, 5, 4] as const;

const playerPhaOiFrame = (localTime: number, reducedMotion: boolean) => {
  if (reducedMotion) return 4;
  if (localTime < .1) return 0;
  if (localTime < .2) return 1;
  if (localTime < .3) return 2;
  if (localTime < .4) return 3;
  const holdIndex = Math.min(
    PLAYER_PHA_OI_HOLD_FRAMES.length - 1,
    Math.floor((localTime - .4) / .13),
  );
  return PLAYER_PHA_OI_HOLD_FRAMES[holdIndex];
};

const applyMotionPose = (node: HTMLDivElement | null, pose: MotionPose, multiplier = 1) => {
  if (!node) return;
  node.style.setProperty('--motion-x', `${(pose.x * multiplier).toFixed(2)}px`);
  node.style.setProperty('--motion-y', `${(pose.y * multiplier).toFixed(2)}px`);
  node.style.setProperty('--motion-rotation', `${(pose.rotation * multiplier).toFixed(2)}deg`);
  node.style.setProperty('--motion-scale-x', pose.scaleX.toFixed(3));
  node.style.setProperty('--motion-scale-y', pose.scaleY.toFixed(3));
};

const depthScale = (y: number) => .88 + (y / WORLD_HEIGHT) * .2;

const updateTrack = (
  track: MotionTrack,
  game: GameState,
  motion: ReturnType<typeof actorMotionForGame>,
  vx: number,
  vy: number,
  facingHint: number,
  visualOverride: ReturnType<typeof karaokeOverrideFor>,
  allowLocomotionTransitions = false,
  directionalView = false,
  worldPoint?: { x: number; y: number },
) => advanceMotion(track, {
  motion,
  now: game.elapsed,
  vx,
  vy,
  facingHint,
  visualOverride,
  allowLocomotionTransitions,
  directionalView,
  worldX: worldPoint?.x,
  worldY: worldPoint?.y,
});

const VisualScene = forwardRef<PhiengLoiVisualHandle, VisualSceneProps>(({ initialGame }, ref) => {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const viewportScaleRef = useRef(1);
  const motionRef = useRef(createMotionController(initialGame.elapsed));
  const chickenMotionRefs = useRef(Array.from({ length: CHICKEN_COUNT }, (_, index) => {
    const track = createMotionController(initialGame.elapsed).chicken;
    track.phaseOffset += index * .83;
    return track;
  }));

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
  const feastRef = useRef<HTMLDivElement | null>(null);
  const feastSpriteRef = useRef<HTMLDivElement | null>(null);
  const feastCrowdRef = useRef<HTMLDivElement | null>(null);
  const feastCrowdSpriteRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<HTMLDivElement | null>(null);
  const streamSpriteRef = useRef<HTMLDivElement | null>(null);
  const dogRef = useRef<HTMLDivElement | null>(null);
  const dogSpriteRef = useRef<HTMLDivElement | null>(null);
  const vuongMeRef = useRef<HTMLDivElement | null>(null);
  const vuongMeSpriteRef = useRef<HTMLDivElement | null>(null);
  const wifeRef = useRef<HTMLDivElement | null>(null);
  const wifeSpriteRef = useRef<HTMLDivElement | null>(null);
  const chickenRefs = useRef<Array<HTMLDivElement | null>>([]);
  const chickenSpriteRefs = useRef<Array<HTMLDivElement | null>>([]);
  const callRef = useRef<HTMLDivElement | null>(null);
  const callRingRef = useRef<HTMLDivElement | null>(null);
  const renderedCallRef = useRef(initialGame.callSerial);

  const render = useCallback((game: GameState) => {
    const scene = sceneRef.current;
    const world = worldRef.current;
    if (!scene || !world) return;
    if (game.elapsed < motionRef.current.player.lastUpdatedAt) {
      motionRef.current = createMotionController(game.elapsed);
      chickenMotionRefs.current = Array.from({ length: CHICKEN_COUNT }, (_, index) => {
        const track = createMotionController(game.elapsed).chicken;
        track.phaseOffset += index * .83;
        return track;
      });
    }

    const viewportScale = viewportScaleRef.current;
    const impulse = game.cameraImpulse;
    let impulseX = 0;
    let impulseY = 0;
    if (!game.reducedMotion && impulse.until > game.elapsed && impulse.until > impulse.startedAt) {
      const progress = Math.max(0, Math.min(1, (game.elapsed - impulse.startedAt) / (impulse.until - impulse.startedAt)));
      const envelope = Math.sin(progress * Math.PI) * (1 - progress * .22);
      impulseX = impulse.x * envelope;
      impulseY = impulse.y * envelope;
    }
    world.style.transform = `translate3d(${(-game.cameraX * viewportScale + impulseX).toFixed(2)}px, ${(-game.cameraY * viewportScale + impulseY).toFixed(2)}px, 0) scale(${viewportScale.toFixed(5)})`;

    if (game.callSerial !== renderedCallRef.current) {
      renderedCallRef.current = game.callSerial;
      placeActor(callRef.current, game.player.x, game.player.y - 22);
      const ring = callRingRef.current;
      ring?.getAnimations().forEach((animation) => animation.cancel());
      if (ring && game.lastCallOutcome === 'normal' && !game.reducedMotion) {
        ring.animate([
          { opacity: .92, transform: 'translate(-50%, -50%) scale(.25)' },
          { opacity: 0, transform: 'translate(-50%, -50%) scale(4.8)' },
        ], { duration: 620, easing: 'ease-out', fill: 'none' });
      }
    }

    const motions = motionRef.current;
    const karaokeActive = game.karaoke.active;
    const karaokeDuration = Math.max(.001, game.karaoke.endsAt - game.karaoke.startedAt);
    const karaokeProgress = karaokeActive ? Math.max(0, Math.min(1, (game.elapsed - game.karaoke.startedAt) / karaokeDuration)) : 0;
    const climax = karaokeProgress > .72 ? 1 + ((karaokeProgress - .72) / .28) * .32 : 1;

    const chiefMotion = actorMotionForGame(game, 'chief');
    const chiefTrack = updateTrack(motions.chief, game, chiefMotion, 0, 0, game.player.x - PHIENG_LOI_LANDMARKS.chief.x, karaokeOverrideFor(game, 'chief'));
    const chiefFrame = chiefTrack.currentMotion === 'observe-hold'
      ? 7
      : frameForTrack(chiefTrack, 8, game.reducedMotion);
    setSpriteFrame(chiefSpriteRef.current, 'chiefTalk', chiefFrame);
    setSpriteWidth(chiefSpriteRef.current, ACTOR_WIDTH.chief);
    setSpriteTransform(chiefSpriteRef.current, chiefTrack.facing, 1);
    applyMotionPose(chiefSpriteRef.current, sampleMotionPose(chiefTrack), climax);
    setData(chiefRef.current, 'motion', chiefTrack.currentMotion);

    const playerMotion = actorMotionForGame(game, 'player');
    const playerTrack = updateTrack(
      motions.player,
      game,
      playerMotion,
      game.player.vx,
      game.player.vy,
      game.player.facingX,
      karaokeOverrideFor(game, 'player'),
      true,
      true,
      game.player,
    );
    const playerShouting = playerTrack.currentMotion === 'shout';
    const playerLocomoting = ['walk', 'run', 'move'].includes(playerTrack.currentMotion);
    const playerAtlas: AtlasName = playerShouting
      ? 'playerPhaOi'
      : playerLocomoting
        ? playerTrack.view === 'down'
          ? 'playerLocomotionDown'
          : playerTrack.view === 'up'
            ? 'playerLocomotionUp'
            : 'playerLocomotionSide'
        : 'playerActions';
    const playerFrame = playerShouting
      ? playerPhaOiFrame(playerTrack.localMotionTime, game.reducedMotion)
      : playerTrack.currentMotion === 'walk'
        ? frameForTrack(playerTrack, 8, game.reducedMotion)
        : ['run', 'move'].includes(playerTrack.currentMotion)
          ? 8 + frameForTrack(playerTrack, 8, game.reducedMotion)
      : playerTrack.currentMotion === 'idle'
          ? playerTrack.view === 'down' ? 0 : playerTrack.view === 'up' ? 2 : 1
          : playerTrack.currentMotion === 'start'
            ? 4
            : playerTrack.currentMotion === 'turn'
              ? 5
              : playerTrack.currentMotion === 'stop'
                ? 6
                : playerTrack.currentMotion === 'caught'
                    ? 8
                    : playerTrack.currentMotion === 'seated-tired'
                      ? 9
                      : playerTrack.currentMotion === 'dance-player'
                        ? 11
                        : 0;
    placeActor(playerRef.current, game.player.x, game.player.y);
    setSpriteFrame(playerSpriteRef.current, playerAtlas, playerFrame);
    setSpriteWidth(playerSpriteRef.current, playerShouting ? ACTOR_WIDTH.playerPhaOi : playerLocomoting ? ACTOR_WIDTH.player : ACTOR_WIDTH.playerAction);
    const playerPowerScale = game.powerUntil.squash > game.elapsed ? 1.3 : 1;
    const playerScale = depthScale(game.player.y) * playerPowerScale;
    setSpriteTransform(playerSpriteRef.current, playerTrack.facing, playerScale);
    applyMotionPose(playerSpriteRef.current, sampleMotionPose(playerTrack), climax);
    setData(playerRef.current, 'motion', playerTrack.currentMotion);
    setData(playerRef.current, 'view', playerTrack.view);
    setData(playerRef.current, 'terrain', terrainAt(game.player.x, game.player.y));

    const heesunMotion = actorMotionForGame(game, 'heesun');
    const heesunFacingHint = Math.abs(game.heesun.vx) > 2 ? game.heesun.vx : game.player.x - game.heesun.x;
    const heesunTrack = updateTrack(
      motions.heesun,
      game,
      heesunMotion,
      game.heesun.vx,
      game.heesun.vy,
      heesunFacingHint,
      karaokeOverrideFor(game, 'heesun'),
      true,
      true,
      game.heesun,
    );
    const heesunCue = game.animationCues.heesun;
    const feastHome = FEAST_TABLE_LOCATIONS[game.feast.locationIndex];
    const drinkJoinActive = heesunCue?.cue === 'heesun-drink' && heesunCue.until > game.elapsed;
    const drinkJoinAge = drinkJoinActive ? Math.max(0, game.elapsed - heesunCue.enteredAt) : 99;
    const drinkJoinProgress = drinkJoinActive ? Math.max(0, Math.min(1, (drinkJoinAge - .16) / .44)) : 1;
    const drinkJoinEase = drinkJoinProgress * drinkJoinProgress * (3 - 2 * drinkJoinProgress);
    const heesunRenderX = drinkJoinActive
      ? game.heesun.actionFromX + (game.heesun.x - game.heesun.actionFromX) * drinkJoinEase
      : game.heesun.x;
    const heesunRenderY = drinkJoinActive
      ? game.heesun.actionFromY + (game.heesun.y - game.heesun.actionFromY) * drinkJoinEase
      : game.heesun.y;
    const heesunStrideMotion = ['start', 'turn'].includes(heesunTrack.currentMotion)
      ? heesunTrack.settleMotion
      : heesunTrack.currentMotion;
    const heesunMoving = ['start', 'turn', 'wander', 'chase', 'chase-distracted', 'flee'].includes(heesunTrack.currentMotion)
      || (drinkJoinActive && drinkJoinAge >= .18 && drinkJoinAge < .56);
    let heesunAtlas: AtlasName = heesunTrack.view === 'down'
      ? 'heesunLocomotionDown'
      : heesunTrack.view === 'up'
        ? 'heesunLocomotionUp'
        : 'heesunLocomotionSide';
    let heesunFrame: number;
    if (heesunMoving) {
      const chasing = heesunStrideMotion !== null && ['chase', 'chase-distracted', 'flee'].includes(heesunStrideMotion);
      heesunFrame = drinkJoinActive
        ? Math.min(7, Math.floor(drinkJoinProgress * 8))
        : (chasing ? 8 : 0) + frameForTrack(heesunTrack, 8, game.reducedMotion);
    } else if (heesunTrack.currentMotion === 'intro') {
      heesunAtlas = 'heesunActions';
      heesunFrame = heesunTrack.localMotionTime < 1.1 ? 4 : heesunTrack.localMotionTime < 2.5 ? 5 : 6;
    } else {
      heesunAtlas = 'heesunActions';
      if (heesunTrack.currentMotion === 'notice') heesunFrame = 3;
      else if (heesunTrack.currentMotion === 'recoil') heesunFrame = 9;
      else if (heesunTrack.currentMotion === 'victory') heesunFrame = 10;
      else if (heesunTrack.currentMotion === 'ambush') heesunFrame = 11;
      else if (heesunTrack.currentMotion === 'seated-toast') heesunFrame = heesunTrack.localMotionTime < .72 ? 12 : 13;
      else if (heesunTrack.currentMotion === 'drinking') heesunFrame = heesunTrack.localMotionTime % 1.5 < .78 ? 13 : 14;
      else if (heesunTrack.currentMotion === 'dance-heesun') heesunFrame = 10;
      else heesunFrame = heesunTrack.view === 'down' ? 0 : heesunTrack.view === 'up' ? 2 : 1;
    }
    placeActor(heesunRef.current, heesunRenderX, heesunRenderY);
    setSpriteFrame(heesunSpriteRef.current, heesunAtlas, heesunFrame);
    setSpriteWidth(heesunSpriteRef.current, ACTOR_WIDTH.heesun);
    setSpriteTransform(heesunSpriteRef.current, heesunTrack.facing, game.heesun.scale * depthScale(game.heesun.y));
    applyMotionPose(heesunSpriteRef.current, sampleMotionPose(heesunTrack), climax);
    setData(heesunRef.current, 'motion', heesunTrack.currentMotion);
    setData(heesunRef.current, 'view', heesunTrack.view);

    const twinActive = game.worldGag.heesunTwinUntil > game.elapsed;
    if (heesunTwinRef.current) {
      heesunTwinRef.current.hidden = !twinActive;
      if (twinActive) {
        placeActor(heesunTwinRef.current, game.heesun.x + 42, game.heesun.y + 5);
        setSpriteFrame(heesunTwinSpriteRef.current, 'heesunActions', 3);
        setSpriteWidth(heesunTwinSpriteRef.current, ACTOR_WIDTH.heesun);
        setSpriteTransform(heesunTwinSpriteRef.current, -heesunTrack.facing, depthScale(game.heesun.y));
        applyMotionPose(heesunTwinSpriteRef.current, sampleMotionPose(heesunTrack));
      }
    }

    const hanuTarget = HANU_ROUTE[game.hanu.waypoint % HANU_ROUTE.length];
    const routeFacing = hanuTarget.x >= game.hanu.x ? 1 : -1;
    const hanuMotion = actorMotionForGame(game, 'hanu');
    const hanuTrack = updateTrack(
      motions.hanu,
      game,
      hanuMotion,
      game.hanu.vx,
      game.hanu.vy,
      routeFacing,
      karaokeOverrideFor(game, 'hanu'),
      true,
      true,
      game.hanu,
    );
    const dominoActive = game.dominoStartedAt !== 0 && game.elapsed - game.dominoStartedAt < 3.4;
    const hanuActiveCue = game.animationCues.hanu;
    const hanuCue = hanuActiveCue && hanuActiveCue.until > game.elapsed ? hanuActiveCue.cue : null;
    const hanuStrideMotion = ['start', 'turn'].includes(hanuTrack.currentMotion)
      ? hanuTrack.settleMotion
      : hanuTrack.currentMotion;
    const hanuMoving = ['start', 'turn', 'phone-walk', 'delivery', 'delivery-fast'].includes(hanuTrack.currentMotion);
    let hanuAtlas: AtlasName = hanuTrack.view === 'down'
      ? 'hanuLocomotionDown'
      : hanuTrack.view === 'up'
        ? 'hanuLocomotionUp'
        : 'hanuLocomotionSide';
    let hanuFrame: number;
    if (hanuMoving) {
      const carryingDelivery = game.hanu.carryingFood
        || (hanuStrideMotion !== null && ['delivery', 'delivery-fast'].includes(hanuStrideMotion));
      hanuFrame = (carryingDelivery ? 8 : 0) + frameForTrack(hanuTrack, 8, game.reducedMotion);
    } else {
      hanuAtlas = 'hanuActions';
      if (dominoActive) hanuFrame = 12;
      else if (hanuTrack.currentMotion === 'dance-hanu') hanuFrame = 14;
      else if (hanuTrack.currentMotion === 'handoff') {
        hanuFrame = hanuCue === 'hanu-pull-box' ? 10 : hanuTrack.localMotionTime < .42 ? 8 : 11;
      } else if (hanuTrack.currentMotion === 'phone-pause') {
        if (hanuCue === 'hanu-phone-call') hanuFrame = 3;
        else if (game.hanu.mode === 'delivery-paused') hanuFrame = 7;
        else hanuFrame = hanuTrack.view === 'down' ? 0 : hanuTrack.view === 'up' ? 2 : 1;
      } else if (hanuTrack.currentMotion === 'delivered') hanuFrame = 15;
      else hanuFrame = hanuTrack.view === 'down' ? 0 : hanuTrack.view === 'up' ? 2 : 1;
    }
    placeActor(hanuRef.current, game.hanu.x, game.hanu.y);
    setSpriteFrame(hanuSpriteRef.current, hanuAtlas, hanuFrame);
    setSpriteWidth(hanuSpriteRef.current, ACTOR_WIDTH.hanu);
    setSpriteTransform(hanuSpriteRef.current, hanuTrack.facing, depthScale(game.hanu.y));
    applyMotionPose(hanuSpriteRef.current, sampleMotionPose(hanuTrack), climax);
    setData(hanuRef.current, 'motion', hanuTrack.currentMotion);
    setData(hanuRef.current, 'view', hanuTrack.view);

    const feastMotion = actorMotionForGame(game, 'feast');
    const feastTrack = updateTrack(
      motions.feast,
      game,
      feastMotion,
      game.feast.vx,
      game.feast.vy,
      Math.abs(game.feast.vx) > 2 ? game.feast.vx : game.player.x - game.feast.x,
      karaokeOverrideFor(game, 'feast'),
      false,
      false,
      game.feast,
    );
    const feastLaunching = game.feast.mode === 'chasing' && game.elapsed - game.feast.chaseStartedAt < .46;
    const feastCrowdVisible = karaokeActive || (game.feast.mode === 'chasing' && !feastLaunching) || game.feast.mode === 'resetting';
    placeActor(feastRef.current, feastHome.x, feastHome.y);
    if (karaokeActive || feastCrowdVisible) {
      setSpriteFrame(feastSpriteRef.current, 'feastAction', 0);
    } else if (feastTrack.currentMotion === 'feast-stare') {
      setSpriteFrame(feastSpriteRef.current, 'feastAction', 1);
    } else if (feastTrack.currentMotion === 'feast-rise' || feastLaunching) {
      setSpriteFrame(feastSpriteRef.current, 'feastAction', feastTrack.localMotionTime > .25 ? 3 : 2);
    } else {
      setSpriteFrame(feastSpriteRef.current, 'feastLoop', frameForTrack(feastTrack, 8, game.reducedMotion));
    }
    setSpriteWidth(feastSpriteRef.current, ACTOR_WIDTH.feast);
    setSpriteTransform(feastSpriteRef.current, 1, depthScale(feastHome.y));
    applyMotionPose(feastSpriteRef.current, feastLaunching ? sampleMotionPose(feastTrack) : { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }, climax);
    setData(feastRef.current, 'motion', feastLaunching ? 'feast-rise' : feastTrack.currentMotion);
    if (feastCrowdRef.current) {
      feastCrowdRef.current.hidden = !feastCrowdVisible;
      if (feastCrowdVisible) {
        placeActor(feastCrowdRef.current, game.feast.x, game.feast.y);
        const crowdFrame = karaokeActive
          ? 4 + frameForTrack(feastTrack, 4, game.reducedMotion)
          : game.feast.mode === 'resetting'
            ? 7
            : 4 + frameForTrack(feastTrack, 4, game.reducedMotion);
        setSpriteFrame(feastCrowdSpriteRef.current, 'feastAction', crowdFrame);
        setSpriteWidth(feastCrowdSpriteRef.current, ACTOR_WIDTH.feastCrowd);
        setSpriteTransform(feastCrowdSpriteRef.current, feastTrack.facing, depthScale(game.feast.y));
        applyMotionPose(feastCrowdSpriteRef.current, sampleMotionPose(feastTrack), climax);
        setData(feastCrowdRef.current, 'motion', feastTrack.currentMotion);
      }
    }

    const gathering = karaokeActive
      ? Math.max(0, Math.min(1, (game.elapsed - game.karaoke.startedAt - .3) / 1.7))
      : 0;
    const streamMotion = karaokeActive && gathering < 1 ? 'stream-arrive' : actorMotionForGame(game, 'stream');
    const streamTrack = updateTrack(
      motions.stream,
      game,
      streamMotion,
      karaokeActive && gathering < 1 ? 48 : 0,
      0,
      1,
      karaokeActive && gathering >= 1 ? 'dance-stream' : null,
      true,
    );
    if (karaokeActive) {
      const eased = 1 - (1 - gathering) ** 3;
      placeActor(
        streamRef.current,
        PHIENG_LOI_LANDMARKS.streamGroup.x + (game.karaoke.x - 74 - PHIENG_LOI_LANDMARKS.streamGroup.x) * eased,
        PHIENG_LOI_LANDMARKS.streamGroup.y + (game.karaoke.y + 17 - PHIENG_LOI_LANDMARKS.streamGroup.y) * eased,
      );
      setSpriteFrame(streamSpriteRef.current, 'streamAction', gathering < 1
        ? frameForTrack(streamTrack, 4, game.reducedMotion)
        : 4 + frameForTrack(streamTrack, 4, game.reducedMotion));
      setSpriteWidth(streamSpriteRef.current, ACTOR_WIDTH.streamAction);
    } else {
      placeActor(streamRef.current, PHIENG_LOI_LANDMARKS.streamGroup.x, PHIENG_LOI_LANDMARKS.streamGroup.y);
      setSpriteFrame(streamSpriteRef.current, 'streamLoop', frameForTrack(streamTrack, 8, game.reducedMotion));
      setSpriteWidth(streamSpriteRef.current, ACTOR_WIDTH.streamGroup);
    }
    setSpriteTransform(streamSpriteRef.current, streamTrack.facing, depthScale(karaokeActive ? game.karaoke.y : PHIENG_LOI_LANDMARKS.streamGroup.y));
    applyMotionPose(streamSpriteRef.current, sampleMotionPose(streamTrack), climax);
    setData(streamRef.current, 'motion', streamTrack.currentMotion);

    const dogMotion = actorMotionForGame(game, 'dog');
    const dogTrack = updateTrack(motions.dog, game, dogMotion, 0, 0, game.player.x - PHIENG_LOI_LANDMARKS.dog.x, karaokeOverrideFor(game, 'dog'));
    placeActor(dogRef.current, PHIENG_LOI_LANDMARKS.dog.x, PHIENG_LOI_LANDMARKS.dog.y);
    setSpriteFrame(dogSpriteRef.current, 'support', 3);
    setSpriteWidth(dogSpriteRef.current, ACTOR_WIDTH.dog);
    setSpriteTransform(dogSpriteRef.current, dogTrack.facing, 1);
    applyMotionPose(dogSpriteRef.current, sampleMotionPose(dogTrack), climax);
    setData(dogRef.current, 'motion', dogTrack.currentMotion);

    if (vuongMeRef.current) {
      vuongMeRef.current.hidden = !karaokeActive;
      if (karaokeActive) {
        const vuongMotion = actorMotionForGame(game, 'vuongme');
        const vuongTrack = updateTrack(motions.vuongme, game, vuongMotion, 0, 0, game.player.x - game.karaoke.x, karaokeOverrideFor(game, 'vuongme'));
        placeActor(vuongMeRef.current, game.karaoke.x, game.karaoke.y);
        setSpriteFrame(vuongMeSpriteRef.current, 'vuongMeDance', frameForTrack(vuongTrack, 8, game.reducedMotion));
        setSpriteWidth(vuongMeSpriteRef.current, ACTOR_WIDTH.vuongMe);
        const appear = Math.max(.1, Math.min(1, (game.elapsed - game.karaoke.startedAt) / .28));
        setSpriteTransform(vuongMeSpriteRef.current, vuongTrack.facing, appear);
        applyMotionPose(vuongMeSpriteRef.current, sampleMotionPose(vuongTrack), climax);
        setData(vuongMeRef.current, 'motion', vuongTrack.currentMotion);
      }
    }

    if (wifeRef.current) {
      const wifeVisible = game.wife.visibleUntil > game.elapsed;
      wifeRef.current.hidden = !wifeVisible;
      if (wifeVisible) {
        const wifeMotion = actorMotionForGame(game, 'wife');
        const wifeTrack = updateTrack(motions.wife, game, wifeMotion, 0, 0, game.heesun.x - game.wife.x, null);
        placeActor(wifeRef.current, game.wife.x, game.wife.y);
        const wifeAge = Math.max(0, 4.8 - (game.wife.visibleUntil - game.elapsed));
        setSpriteFrame(wifeSpriteRef.current, 'heesunWife', wifeAge < .65 ? frameForTrack(wifeTrack, 2, game.reducedMotion) : wifeTrack.currentMotion === 'command' ? 3 : 1);
        setSpriteWidth(wifeSpriteRef.current, ACTOR_WIDTH.heesunWife);
        setSpriteTransform(wifeSpriteRef.current, wifeTrack.facing, depthScale(game.wife.y));
        applyMotionPose(wifeSpriteRef.current, sampleMotionPose(wifeTrack));
        setData(wifeRef.current, 'motion', wifeTrack.currentMotion);
      }
    }

    const chickenActive = game.chicken.mode !== 'peck' && game.chicken.modeUntil > game.elapsed;
    const chickenProgress = chickenActive
      ? Math.max(0, Math.min(1, (game.elapsed - game.chicken.modeStartedAt) / Math.max(.1, game.chicken.modeUntil - game.chicken.modeStartedAt)))
      : 0;
    chickenRefs.current.forEach((node, index) => {
      if (!node) return;
      const hidden = index >= game.chicken.visibleCount;
      node.hidden = hidden;
      if (hidden) return;
      const rest = CHICKEN_REST[index];
      let x = rest.x;
      let y = rest.y;
      let vx = 0;
      if (karaokeActive) {
        const angle = (game.elapsed - game.karaoke.startedAt) * (1.8 + (index % 3) * .17) + index * (Math.PI * 2 / CHICKEN_COUNT);
        x = game.player.x + Math.cos(angle) * (38 + (index % 3) * 7);
        y = game.player.y + 20 + Math.sin(angle) * (18 + (index % 2) * 5);
        vx = -Math.sin(angle);
      } else if (game.chicken.mode === 'panic-away' || game.chicken.mode === 'cross-screen') {
        x += chickenProgress * 520 + (index % 3) * 13;
        y += Math.sin((game.elapsed - game.chicken.modeStartedAt) * 9 + index) * 8;
        vx = 1;
      } else if (game.chicken.mode === 'panic-toward-player') {
        x += (game.player.x - rest.x) * chickenProgress * .78 + (index % 3) * 8;
        y += (game.player.y - rest.y) * chickenProgress * .78 + Math.sin((game.elapsed - game.chicken.modeStartedAt) * 10 + index) * 7;
        vx = game.player.x - rest.x;
      } else if (game.chicken.mode === 'follow-hanu') {
        x = game.hanu.x - 20 - index * 8;
        y = game.hanu.y + 7 + (index % 3) * 6;
        vx = game.hanu.vx;
      } else if (game.chicken.mode === 'follow-heesun') {
        x = game.heesun.x - 20 - index * 8;
        y = game.heesun.y + 7 + (index % 3) * 6;
        vx = game.heesun.vx;
      } else if (game.chicken.mode === 'invade-feast') {
        x = feastHome.x - 28 + (index % 5) * 12;
        y = feastHome.y + 5 + Math.floor(index / 5) * 9;
        vx = index % 2 ? -1 : 1;
      }
      const chickenTrack = chickenMotionRefs.current[index];
      updateTrack(
        chickenTrack,
        game,
        actorMotionForGame(game, 'chicken'),
        vx,
        0,
        vx || (index % 2 ? -1 : 1),
        karaokeOverrideFor(game, 'chicken'),
        false,
        false,
        { x, y },
      );
      placeActor(node, x, y);
      const sprite = chickenSpriteRefs.current[index];
      setSpriteTransform(sprite, chickenTrack.facing, 1);
      applyMotionPose(sprite, sampleMotionPose(chickenTrack), climax * (.9 + (index % 3) * .08));
      setData(node, 'motion', chickenTrack.currentMotion);
    });

    setData(scene, 'terrain', terrainAt(game.player.x, game.player.y));
    setData(scene, 'absurdity', String(game.absurdityLevel));
    setData(scene, 'macro', game.worldGag.macro);
    scene.classList.toggle('is-capture', game.scene.kind === 'capture');
    scene.classList.toggle('is-capture-seated', game.scene.kind === 'capture' && game.scene.stage === 1);
    scene.classList.toggle('is-capture-impact', game.scene.kind === 'capture' && game.elapsed - game.scene.startedAt < .14);
    scene.classList.toggle('is-karaoke', karaokeActive);
  }, []);

  useImperativeHandle(ref, () => ({ render }), [render]);
  useLayoutEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return undefined;
    const updateScale = () => {
      viewportScaleRef.current = Math.max(.01, scene.getBoundingClientRect().width / VIEW_WIDTH);
    };
    updateScale();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateScale);
    observer?.observe(scene);
    render(initialGame);
    return () => observer?.disconnect();
  }, [initialGame, render]);

  return (
    <div ref={sceneRef} className="phieng-visual" aria-label="Bản Phiêng Lơi với đường đất, nhà sàn, ruộng, suối, núi, Bảo tàng Chiến thắng và Tượng đài Chiến thắng Điện Biên Phủ ở xa">
      <div className="phieng-visual__distant" aria-hidden="true" />
      <div
        ref={worldRef}
        className="phieng-visual__world"
        style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT, backgroundImage: `url(${PHIENG_LOI_VISUAL_ASSETS.world})` }}
        aria-hidden="true"
      >
        <div className="phieng-visual__landmark is-monument"><img src={PHIENG_LOI_VISUAL_ASSETS.victoryMonument} alt="" /></div>
        <div className="phieng-visual__landmark is-museum"><img src={PHIENG_LOI_VISUAL_ASSETS.victoryMuseum} alt="" /></div>

        <div ref={chiefRef} className="phieng-visual__actor is-chief" style={actorStyle(PHIENG_LOI_LANDMARKS.chief.x, PHIENG_LOI_LANDMARKS.chief.y)}>
          <div ref={chiefSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('chiefTalk', 0), width: ACTOR_WIDTH.chief }} />
        </div>
        <div ref={feastRef} className="phieng-visual__actor is-feast" style={actorStyle(initialGame.feast.x, initialGame.feast.y)}>
          <div ref={feastSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('feastLoop', 0), width: ACTOR_WIDTH.feast }} />
        </div>
        <div ref={feastCrowdRef} className="phieng-visual__actor is-feast-crowd" style={actorStyle(initialGame.feast.x, initialGame.feast.y)} hidden>
          <div ref={feastCrowdSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('feastAction', 4), width: ACTOR_WIDTH.feastCrowd }} />
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
              ref={(node) => { chickenSpriteRefs.current[index] = node; }}
              className="phieng-visual__sprite"
              style={{ ...atlasFrameStyle('support', 2), width: ACTOR_WIDTH.chicken, '--sprite-flip': index % 2 ? -1 : 1 } as CSSProperties}
            />
          </div>
        ))}

        <div ref={hanuRef} className="phieng-visual__actor is-hanu" style={actorStyle(initialGame.hanu.x, initialGame.hanu.y)}>
          <strong className="phieng-visual__nameplate is-hanu-name" aria-hidden="true">HANU</strong>
          <div ref={hanuSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('hanuActions', 0), width: ACTOR_WIDTH.hanu }} />
        </div>
        <div ref={heesunRef} className="phieng-visual__actor is-heesun" style={actorStyle(initialGame.heesun.x, initialGame.heesun.y)}>
          <strong className="phieng-visual__nameplate is-heesun-name" aria-hidden="true">HEESUN</strong>
          <div ref={heesunSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('heesunActions', 0), width: ACTOR_WIDTH.heesun }} />
        </div>
        <div ref={heesunTwinRef} className="phieng-visual__actor is-heesun is-heesun-twin" style={actorStyle(initialGame.heesun.x + 42, initialGame.heesun.y + 5)} hidden>
          <strong className="phieng-visual__nameplate is-heesun-name" aria-hidden="true">HEESUN</strong>
          <div ref={heesunTwinSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('heesunActions', 3), width: ACTOR_WIDTH.heesun }} />
        </div>
        <div ref={wifeRef} className="phieng-visual__actor is-heesun-wife" style={actorStyle(initialGame.wife.x, initialGame.wife.y)} hidden>
          <div ref={wifeSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('heesunWife', 0), width: ACTOR_WIDTH.heesunWife }} />
          <strong className="phieng-visual__wife-command">VỀ.</strong>
        </div>
        <div ref={vuongMeRef} className="phieng-visual__actor is-vuongme" style={actorStyle(PHIENG_LOI_LANDMARKS.vuongMeStage.x, PHIENG_LOI_LANDMARKS.vuongMeStage.y)} hidden>
          <div ref={vuongMeSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('vuongMeDance', 0), width: ACTOR_WIDTH.vuongMe }} />
        </div>
        <div ref={playerRef} className="phieng-visual__actor is-player" style={actorStyle(initialGame.player.x, initialGame.player.y)}>
          <div ref={playerSpriteRef} className="phieng-visual__sprite" style={{ ...atlasFrameStyle('playerActions', 0), width: ACTOR_WIDTH.playerAction }} />
        </div>

        <div ref={callRef} className="phieng-visual__actor phieng-visual__call-anchor" style={actorStyle(initialGame.player.x, initialGame.player.y - 22)}>
          <div ref={callRingRef} className="phieng-visual__call-ring" />
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
