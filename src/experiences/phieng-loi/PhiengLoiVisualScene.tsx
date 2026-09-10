import type { CSSProperties } from 'react';
import {
  VIEW_HEIGHT,
  VIEW_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  type HeeSunMode,
  type UiSnapshot,
} from './gameEngine';
import { atlasFrameStyle, PHIENG_LOI_VISUAL_ASSETS, type AtlasName } from './visualAssets';

type VisualSceneProps = {
  ui: UiSnapshot;
};

type SpriteProps = {
  atlas: AtlasName;
  frame: number;
  x: number;
  y: number;
  width: number;
  scale?: number;
  facingX?: number;
  className?: string;
};

const actorFrame = (mode: HeeSunMode, worldTime: number): number => {
  if (mode === 'chasing' || mode === 'distracted') return 4;
  if (mode === 'ambush') return 3;
  if (mode === 'intro') return worldTime % 2.4 < 1.2 ? 1 : 2;
  if (mode === 'drinking') return 5;
  return worldTime % 5.4 < 2.8 ? 0 : 1;
};

const Sprite = ({ atlas, frame, x, y, width, scale = 1, facingX = 1, className = '' }: SpriteProps) => {
  const style = {
    ...atlasFrameStyle(atlas, frame),
    left: `${(x / WORLD_WIDTH) * 100}%`,
    top: `${(y / WORLD_HEIGHT) * 100}%`,
    width: `${(width / WORLD_WIDTH) * 100}%`,
    zIndex: Math.round(y),
    '--sprite-scale': scale,
    '--sprite-flip': facingX < 0 ? -1 : 1,
  } as CSSProperties;
  return <div className={`phieng-visual__sprite ${className}`} style={style} aria-hidden="true" />;
};

export const PhiengLoiVisualScene = ({ ui }: VisualSceneProps) => {
  const visual = ui.visual;
  const worldStyle = {
    width: `${(WORLD_WIDTH / VIEW_WIDTH) * 100}%`,
    height: `${(WORLD_HEIGHT / VIEW_HEIGHT) * 100}%`,
    transform: `translate3d(${(-visual.cameraX / WORLD_WIDTH) * 100}%, ${(-visual.cameraY / WORLD_HEIGHT) * 100}%, 0)`,
    backgroundImage: `url(${PHIENG_LOI_VISUAL_ASSETS.world})`,
  };
  const playerFrame = visual.player.moving ? 1 : 0;
  const hanuFrame = visual.dominoActive
    ? 5
    : ui.message?.tone === 'hanu'
      ? 2
      : visual.hanu.moving
        ? 1
        : 0;
  const chickens = visual.chickenPanic ? 10 : 4;

  return (
    <div
      className={`phieng-visual is-absurd-${visual.absurdityLevel}${ui.scene === 'capture' ? ' is-capture' : ''}`}
      aria-label="Bản Phiêng Lơi với đường đất, nhà sàn, ruộng, suối và núi Điện Biên"
    >
      <div className="phieng-visual__distant" aria-hidden="true" />
      <div className="phieng-visual__world" style={worldStyle} aria-hidden="true">
        <Sprite atlas="support" frame={5} x={700} y={270} width={72} className="is-chief" />
        <Sprite atlas="support" frame={6} x={visual.feast.x} y={visual.feast.y + 26} width={128} className="is-feast" />
        <Sprite atlas="support" frame={7} x={1_212} y={726} width={152} className="is-stream-group" />
        <Sprite atlas="support" frame={3} x={850} y={536} width={53} className="is-dog" />
        <Sprite atlas="support" frame={4} x={976} y={592} width={92} className="is-buffalo" />
        {Array.from({ length: chickens }, (_, index) => {
          const row = index % 4;
          const x = visual.chickenPanic
            ? 748 + visual.chickenProgress * 520 + (index % 5) * 25
            : 752 + index * 23;
          const y = visual.chickenPanic
            ? 462 + row * 17 + Math.sin(visual.worldTime * 8 + index) * 6
            : 470 + (index % 2) * 16;
          return <Sprite key={index} atlas="support" frame={2} x={x} y={y} width={30} facingX={index % 2 ? -1 : 1} className="is-chicken" />;
        })}
        <Sprite
          atlas="hanu"
          frame={hanuFrame}
          x={visual.hanu.x}
          y={visual.hanu.y}
          width={78}
          facingX={visual.hanu.facingX}
          className="is-hanu"
        />
        <Sprite
          atlas="heesun"
          frame={actorFrame(visual.heesun.mode, visual.worldTime)}
          x={visual.heesun.x}
          y={visual.heesun.y}
          width={82}
          scale={visual.heesun.scale}
          facingX={visual.heesun.facingX}
          className={`is-heesun is-${visual.heesun.mode}`}
        />
        <Sprite
          atlas="support"
          frame={playerFrame}
          x={visual.player.x}
          y={visual.player.y}
          width={58}
          scale={visual.player.scale}
          facingX={visual.player.facingX}
          className={`is-player${visual.player.moving ? ' is-moving' : ''}`}
        />
        {ui.callActive ? (
          <div
            className="phieng-visual__call-ring"
            style={{
              left: `${(visual.player.x / WORLD_WIDTH) * 100}%`,
              top: `${(visual.player.y / WORLD_HEIGHT) * 100}%`,
              zIndex: Math.round(visual.player.y - 1),
            }}
          />
        ) : null}
      </div>
      <div className="phieng-visual__sunwash" aria-hidden="true" />
      <div className="phieng-visual__foreground" aria-hidden="true" />
    </div>
  );
};

