import { stepGame, triggerDirectedEvent, type GameState } from './gameEngine';
import { PHIENG_LOI_LANDMARKS } from './worldLayout';

export const PHIENG_LOI_QA_SCENARIOS = [
  'locomotion',
  'pha-normal',
  'pha-nothing',
  'heesun-intro',
  'heesun-feast',
  'capture',
  'hanu-delivery',
  'signature-chase',
  'feast',
  'chicken',
  'hanu-blocks-heesun',
  'disco',
  'wife',
] as const;

export type PhiengLoiQaScenario = typeof PHIENG_LOI_QA_SCENARIOS[number];

const LETTER_SCENARIOS: Record<string, PhiengLoiQaScenario> = {
  A: 'locomotion',
  B: 'pha-normal',
  C: 'pha-nothing',
  D: 'heesun-intro',
  E: 'heesun-feast',
  F: 'capture',
  G: 'hanu-delivery',
  H: 'signature-chase',
  I: 'feast',
  J: 'chicken',
  K: 'hanu-blocks-heesun',
  L: 'disco',
  M: 'wife',
};

export const parsePhiengLoiQaScenario = (value: string | null): PhiengLoiQaScenario | null => {
  if (!value) return null;
  const letter = LETTER_SCENARIOS[value.toUpperCase()];
  if (letter) return letter;
  return PHIENG_LOI_QA_SCENARIOS.includes(value as PhiengLoiQaScenario) ? value as PhiengLoiQaScenario : null;
};

const deterministicRandom = (values: number[], fallback = .72) => {
  let index = 0;
  return () => values[index++] ?? fallback;
};

export const randomForPhiengLoiQaScenario = (scenario: PhiengLoiQaScenario | null) => {
  if (scenario === 'pha-nothing') return deterministicRandom([.1, .42]);
  if (scenario === 'pha-normal') return deterministicRandom([.8, .18, .31, .47, .63]);
  return deterministicRandom([.72, .41, .64, .28, .83, .52]);
};

/** Hidden `?qa=A..M` harness for deterministic engine and visual review. */
export const applyPhiengLoiQaScenario = (game: GameState, scenario: PhiengLoiQaScenario | null) => {
  if (!scenario) return game;
  game.director.nextWorldTickAt = 99_999;
  game.hanu.nextPromiseAt = 99_999;
  game.hanu.nextLineAt = 99_999;

  const road = { x: 1_005, y: 822 };
  Object.assign(game.player, road, { facingX: 1, facingY: 0 });
  game.cameraX = road.x - 320;
  game.cameraY = road.y - 252;

  switch (scenario) {
    case 'locomotion':
      break;
    case 'pha-normal':
    case 'pha-nothing':
      stepGame(game, { left: false, right: false, up: false, down: false, moveX: 0, moveY: 0, callQueued: true }, .02);
      break;
    case 'heesun-intro':
      Object.assign(game.heesun, { x: road.x + 68, y: road.y, met: false, mode: 'idle' });
      break;
    case 'heesun-feast':
      Object.assign(game.player, { x: game.feast.x + 130, y: game.feast.y + 8 });
      Object.assign(game.heesun, { x: game.feast.x + 44, y: game.feast.y, met: true, mode: 'chasing', target: 'player', chaseTimeoutAt: 99_999 });
      triggerDirectedEvent(game, 'heesun-feast-interrupt');
      break;
    case 'capture':
      Object.assign(game.heesun, { x: road.x + 2, y: road.y, met: true, mode: 'chasing', target: 'player', chaseTimeoutAt: 99_999 });
      break;
    case 'hanu-delivery':
      Object.assign(game.hanu, { x: road.x + 105, y: road.y, mode: 'delivering', carryingFood: true, promiseStage: 2, deliveryTimeoutAt: 99_999 });
      break;
    case 'signature-chase':
      Object.assign(game.hanu, { x: road.x + 112, y: road.y, mode: 'delivering', carryingFood: true, promiseStage: 2, deliveryTimeoutAt: 99_999 });
      Object.assign(game.heesun, { x: road.x - 108, y: road.y, met: true, mode: 'chasing', target: 'player', chaseStartedAt: .001, chaseTimeoutAt: 99_999 });
      game.feast.x = road.x - 175;
      game.feast.y = road.y + 8;
      triggerDirectedEvent(game, 'feast-chase');
      break;
    case 'feast':
      Object.assign(game.player, { x: game.feast.x + 96, y: game.feast.y });
      triggerDirectedEvent(game, 'feast-stare');
      break;
    case 'chicken':
      Object.assign(game.player, { x: PHIENG_LOI_LANDMARKS.chickenYard.x + 74, y: PHIENG_LOI_LANDMARKS.chickenYard.y });
      triggerDirectedEvent(game, 'chicken-triple-stare');
      break;
    case 'hanu-blocks-heesun':
      Object.assign(game.hanu, { x: road.x + 18, y: road.y, mode: 'delivering', carryingFood: true, deliveryTimeoutAt: 99_999 });
      Object.assign(game.heesun, { x: road.x, y: road.y, met: true, mode: 'chasing', target: 'player', chaseTimeoutAt: 99_999, vx: 68 });
      triggerDirectedEvent(game, 'hanu-blocks-heesun');
      break;
    case 'disco':
      Object.assign(game.heesun, { x: road.x - 95, y: road.y, met: true, mode: 'chasing', target: 'player', chaseTimeoutAt: 99_999 });
      Object.assign(game.hanu, { x: road.x + 96, y: road.y, mode: 'delivering', carryingFood: true, deliveryTimeoutAt: 99_999 });
      triggerDirectedEvent(game, 'vuongme-karaoke-disco');
      break;
    case 'wife':
      Object.assign(game.heesun, { x: game.feast.x + 42, y: game.feast.y, met: true, mode: 'chasing', target: 'player', chaseTimeoutAt: 99_999 });
      triggerDirectedEvent(game, 'heesun-wife');
      break;
    default:
      break;
  }
  return game;
};
