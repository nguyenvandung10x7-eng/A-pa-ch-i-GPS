import {
  type CSSProperties,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import {
  getPhiengLoiPlayerVisual,
  type PhiengLoiPlayerState,
} from './playerMotion';
import {
  PHIENG_LOI_PLAYER_ASSETS,
  playerAtlasFrameStyle,
  preloadPhiengLoiPlayerAssets,
} from './visualAssets';
import { PHIENG_LOI_WORLD, terrainAt } from './worldLayout';

type PhiengLoiPlayerSceneProps = { initialState: PhiengLoiPlayerState };
export type PhiengLoiPlayerSceneHandle = { render: (state: PhiengLoiPlayerState) => void };

const setSpriteFrame = (
  node: HTMLDivElement | null,
  atlas: ReturnType<typeof getPhiengLoiPlayerVisual>['atlas'],
  frame: number,
) => {
  if (!node) return;
  const signature = `${atlas}-${frame}`;
  if (node.dataset.frame === signature) return;
  const style = playerAtlasFrameStyle(atlas, frame);
  node.style.backgroundImage = String(style.backgroundImage);
  node.style.backgroundPosition = String(style.backgroundPosition);
  node.style.backgroundRepeat = 'no-repeat';
  node.style.backgroundSize = String(style.backgroundSize);
  node.style.aspectRatio = String(style.aspectRatio);
  node.dataset.frame = signature;
};

export const PhiengLoiPlayerScene = forwardRef<
  PhiengLoiPlayerSceneHandle,
  PhiengLoiPlayerSceneProps
>(({ initialState }, ref) => {
  const initialVisual = useRef(getPhiengLoiPlayerVisual(initialState)).current;
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const spriteRef = useRef<HTMLDivElement | null>(null);
  const viewportScaleRef = useRef(1);

  const render = useCallback((state: PhiengLoiPlayerState) => {
    const scene = sceneRef.current;
    const world = worldRef.current;
    const player = playerRef.current;
    const sprite = spriteRef.current;
    if (!scene || !world || !player || !sprite) return;

    const visual = getPhiengLoiPlayerVisual(state);
    const viewportScale = viewportScaleRef.current;
    world.style.transform = `translate3d(${(-visual.cameraX * viewportScale).toFixed(2)}px, ${(-visual.cameraY * viewportScale).toFixed(2)}px, 0) scale(${viewportScale.toFixed(5)})`;
    player.style.transform = `translate3d(${visual.x.toFixed(2)}px, ${visual.y.toFixed(2)}px, 0)`;
    player.style.zIndex = String(Math.round(visual.y / 3) * 3);
    player.dataset.motion = visual.motion;
    player.dataset.view = visual.view;
    player.dataset.sideWalkVariant = visual.sideWalkVariant;
    player.dataset.terrain = terrainAt(visual.x, visual.y);
    setSpriteFrame(sprite, visual.atlas, visual.frame);
    sprite.style.width = `${visual.width}px`;
    sprite.style.setProperty('--sprite-flip', visual.facing < 0 ? '-1' : '1');
    sprite.style.setProperty('--sprite-scale', visual.scale.toFixed(3));
  }, []);

  useImperativeHandle(ref, () => ({ render }), [render]);
  useLayoutEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return undefined;
    const updateScale = () => {
      viewportScaleRef.current = Math.max(
        0.01,
        scene.getBoundingClientRect().width / PHIENG_LOI_WORLD.viewWidth,
      );
      render(initialState);
    };
    updateScale();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateScale);
    observer?.observe(scene);
    void preloadPhiengLoiPlayerAssets(initialState.player.sideWalkVariant);
    return () => observer?.disconnect();
  }, [initialState, render]);

  return (
    <div ref={sceneRef} className="phieng-visual" aria-label="Bản Phiêng Lơi">
      <div
        ref={worldRef}
        className="phieng-visual__world"
        style={{
          width: PHIENG_LOI_WORLD.width,
          height: PHIENG_LOI_WORLD.height,
          backgroundImage: `url(${PHIENG_LOI_PLAYER_ASSETS.world})`,
        }}
        aria-hidden="true"
      >
        <div
          ref={playerRef}
          className="phieng-visual__actor is-player"
          style={{
            transform: `translate3d(${initialVisual.x}px, ${initialVisual.y}px, 0)`,
            zIndex: Math.round(initialVisual.y / 3) * 3,
          }}
          data-motion={initialVisual.motion}
          data-view={initialVisual.view}
          data-side-walk-variant={initialVisual.sideWalkVariant}
          data-terrain={terrainAt(initialVisual.x, initialVisual.y)}
        >
          <div
            ref={spriteRef}
            className="phieng-visual__sprite"
            data-frame={`${initialVisual.atlas}-${initialVisual.frame}`}
            style={{
              ...playerAtlasFrameStyle(initialVisual.atlas, initialVisual.frame),
              width: initialVisual.width,
              '--sprite-scale': initialVisual.scale.toFixed(3),
              '--sprite-flip': initialVisual.facing < 0 ? '-1' : '1',
            } as CSSProperties}
          />
        </div>
      </div>
    </div>
  );
});

PhiengLoiPlayerScene.displayName = 'PhiengLoiPlayerScene';
