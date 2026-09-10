export const TRUE_NOTHING_PROBABILITY = 0.2;
export const PHA_OI_COOLDOWN_SECONDS = 60;

export const DIRECTOR_LIMITS = {
  activeMajor: 1,
  activeMicro: 2,
  delayedQueue: 6,
  chainDepth: 5,
  recentEvents: 14,
} as const;

export type AbsurdityLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type DirectorSignal = 'pha-oi' | 'zone' | 'waypoint' | 'event-end' | 'collision' | 'delayed' | 'world-tick';
export type EventTier = 'micro' | 'medium' | 'major' | 'rare' | 'macro';
export type EventPriority = 'low' | 'medium' | 'high';
export type DialogueAnchor = 'player' | 'heesun' | 'hanu' | 'feast' | 'chief' | 'stream' | 'world';
export type DialogueTone = 'plain' | 'heesun' | 'hanu' | 'chief' | 'stream' | 'ocop' | 'world';

export type DirectorContextKey =
  | 'near-house'
  | 'near-chickens'
  | 'near-feast'
  | 'near-hanu'
  | 'near-heesun'
  | 'near-stream'
  | 'near-chief'
  | 'heesun-idle'
  | 'heesun-chasing'
  | 'hanu-delivering'
  | 'feast-idle'
  | 'feast-chasing'
  | 'chickens-calm'
  | 'chickens-running'
  | 'chief-speaking'
  | 'multiple-chase'
  | 'major-quiet'
  | 'world-quiet';

export type EventDialogue = {
  speakerVi: string;
  speakerEn: string;
  textVi: string;
  textEn: string;
  delay: number;
  duration: number;
  priority: EventPriority;
  interruptible: boolean;
  styleVariant: DialogueTone;
  anchor: DialogueAnchor;
  optionalVoiceCue?: string;
};

export type EventFollowUp = {
  id: string;
  chance: number;
  delayRange: readonly [number, number];
};

export type EventDefinition = {
  id: string;
  tier: EventTier;
  signals: readonly DirectorSignal[];
  weight: number;
  minimumAbsurdity: AbsurdityLevel;
  contextRequirements?: {
    all?: readonly DirectorContextKey[];
    any?: readonly DirectorContextKey[];
    none?: readonly DirectorContextKey[];
  };
  cooldown: number;
  antiRepeatGroup: string;
  priority: EventPriority;
  canInterrupt: boolean;
  canBeInterrupted: boolean;
  duration: number;
  delayRange?: readonly [number, number];
  possibleFollowUps?: readonly EventFollowUp[];
  actorStateChanges: readonly string[];
  worldStateChanges: readonly string[];
  animationCue?: string;
  soundCue?: string;
  dialogueBubbles: readonly EventDialogue[];
};

const bubble = (
  anchor: DialogueAnchor,
  speakerVi: string,
  speakerEn: string,
  textVi: string,
  textEn: string,
  styleVariant: DialogueTone,
  duration = 1.8,
  delay = 0,
  priority: EventPriority = 'low',
  interruptible = true,
): EventDialogue => ({
  anchor,
  speakerVi,
  speakerEn,
  textVi,
  textEn,
  delay,
  duration,
  priority,
  interruptible,
  styleVariant,
});

/**
 * The registry decides eligibility, pacing, interruption and chaining. The game
 * engine owns the small, finite effects for each id, so no event scans or
 * scripted cutscene graphs run from requestAnimationFrame.
 */
export const ABSURD_EVENT_REGISTRY = [
  {
    id: 'house-reply', tier: 'micro', signals: ['pha-oi'], weight: 9, minimumAbsurdity: 0,
    contextRequirements: { all: ['near-house'] }, cooldown: 8, antiRepeatGroup: 'local-reply',
    priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 1.8,
    actorStateChanges: [], worldStateChanges: ['house-reply-pulse'], animationCue: 'house-open', soundCue: 'village_far_reply',
    dialogueBubbles: [bubble('world', 'TRONG NHÀ', 'INSIDE THE HOUSE', 'Ơi.', 'Yes?', 'world', 1.55)],
  },
  {
    id: 'chicken-glance', tier: 'micro', signals: ['pha-oi'], weight: 8, minimumAbsurdity: 0,
    contextRequirements: { all: ['near-chickens', 'chickens-calm'] }, cooldown: 5, antiRepeatGroup: 'chicken-call',
    priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 1.5,
    actorStateChanges: ['chicken:look'], worldStateChanges: [], animationCue: 'chicken-look', soundCue: 'chicken_soft', dialogueBubbles: [],
  },
  {
    id: 'chicken-triple-stare', tier: 'micro', signals: ['pha-oi'], weight: 5.5, minimumAbsurdity: 1,
    contextRequirements: { all: ['near-chickens', 'chickens-calm'] }, cooldown: 10, antiRepeatGroup: 'chicken-call',
    priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 1.9,
    actorStateChanges: ['chicken:triple-look'], worldStateChanges: [], animationCue: 'chicken-look', dialogueBubbles: [],
  },
  {
    id: 'chicken-run-away', tier: 'medium', signals: ['pha-oi'], weight: 4.5, minimumAbsurdity: 1,
    contextRequirements: { all: ['near-chickens'] }, cooldown: 14, antiRepeatGroup: 'chicken-run',
    priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 4.2,
    possibleFollowUps: [{ id: 'chair-fall', chance: 0.42, delayRange: [0.8, 1.5] }],
    actorStateChanges: ['chicken:panic-away'], worldStateChanges: [], animationCue: 'chicken-run', soundCue: 'chicken_panic', dialogueBubbles: [],
  },
  {
    id: 'chicken-run-toward-player', tier: 'medium', signals: ['pha-oi'], weight: 2.2, minimumAbsurdity: 2,
    contextRequirements: { all: ['near-chickens'] }, cooldown: 22, antiRepeatGroup: 'chicken-run',
    priority: 'medium', canInterrupt: false, canBeInterrupted: true, duration: 4.4,
    actorStateChanges: ['chicken:panic-toward-player'], worldStateChanges: [], animationCue: 'chicken-run', soundCue: 'chicken_panic', dialogueBubbles: [],
  },
  {
    id: 'feast-stare', tier: 'micro', signals: ['pha-oi'], weight: 8, minimumAbsurdity: 0,
    contextRequirements: { all: ['near-feast', 'feast-idle'] }, cooldown: 10, antiRepeatGroup: 'feast-call',
    priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 2.2,
    actorStateChanges: ['feast:stare'], worldStateChanges: [], animationCue: 'feast-stare', dialogueBubbles: [],
  },
  {
    id: 'feast-what', tier: 'micro', signals: ['pha-oi'], weight: 6, minimumAbsurdity: 0,
    contextRequirements: { all: ['near-feast', 'feast-idle'] }, cooldown: 12, antiRepeatGroup: 'feast-call',
    priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 2.1,
    actorStateChanges: ['feast:react'], worldStateChanges: [], animationCue: 'feast-react',
    dialogueBubbles: [bubble('feast', 'MỘT NGƯỜI TRONG MÂM', 'SOMEONE AT THE TABLE', 'Gọi gì?', 'What?', 'world', 1.05)],
  },
  {
    id: 'feast-chase', tier: 'major', signals: ['pha-oi', 'delayed', 'collision'], weight: 2.4, minimumAbsurdity: 2,
    contextRequirements: { all: ['near-feast', 'feast-idle'] }, cooldown: 34, antiRepeatGroup: 'feast-major',
    priority: 'medium', canInterrupt: false, canBeInterrupted: true, duration: 8,
    actorStateChanges: ['feast:chasing'], worldStateChanges: ['major-chain'], animationCue: 'feast-chase', soundCue: 'feast_chase',
    dialogueBubbles: [bubble('feast', 'MÂM NHẬU', 'THE DRINKING TABLE', 'Nó làm đổ ghế!', 'They knocked over the chair!', 'world', 1.65, 0, 'medium')],
  },
  {
    id: 'hanu-head-only', tier: 'micro', signals: ['pha-oi'], weight: 8, minimumAbsurdity: 0,
    contextRequirements: { all: ['near-hanu'] }, cooldown: 7, antiRepeatGroup: 'hanu-call',
    priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 1.5,
    actorStateChanges: ['hanu:head-turn'], worldStateChanges: [], animationCue: 'hanu-head-only',
    dialogueBubbles: [bubble('hanu', 'HANU', 'HANU', 'Ừ.', 'Yeah.', 'hanu', 1)],
  },
  {
    id: 'hanu-go-faster', tier: 'medium', signals: ['pha-oi'], weight: 10, minimumAbsurdity: 0,
    contextRequirements: { all: ['near-hanu', 'hanu-delivering'] }, cooldown: 9, antiRepeatGroup: 'hanu-call',
    priority: 'medium', canInterrupt: false, canBeInterrupted: true, duration: 4.5,
    actorStateChanges: ['hanu:speed-up'], worldStateChanges: [], animationCue: 'hanu-run', soundCue: 'hanu_u',
    dialogueBubbles: [bubble('hanu', 'HANU', 'HANU', 'Biết rồi.', 'I know.', 'hanu', 1.2)],
  },
  {
    id: 'heesun-stare', tier: 'micro', signals: ['pha-oi', 'world-tick'], weight: 4.4, minimumAbsurdity: 1,
    contextRequirements: { all: ['heesun-idle'] }, cooldown: 18, antiRepeatGroup: 'heesun-appearance',
    priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 3.4,
    actorStateChanges: ['heesun:stare'], worldStateChanges: [], animationCue: 'heesun-stare', dialogueBubbles: [],
  },
  {
    id: 'heesun-delayed-call', tier: 'medium', signals: ['pha-oi', 'world-tick'], weight: 2.2, minimumAbsurdity: 2,
    contextRequirements: { all: ['heesun-idle'], none: ['near-heesun'] }, cooldown: 32, antiRepeatGroup: 'heesun-appearance',
    priority: 'medium', canInterrupt: false, canBeInterrupted: true, duration: 2.2,
    possibleFollowUps: [{ id: 'heesun-delayed-arrival', chance: 0.72, delayRange: [2.8, 5.4] }],
    actorStateChanges: [], worldStateChanges: ['heesun-delayed'], animationCue: 'heesun-offscreen', soundCue: 'heesun_ban_oi_far',
    dialogueBubbles: [bubble('world', 'Ở ĐÂU ĐÓ', 'SOMEWHERE', 'Bạn ơi…', 'My friend…', 'heesun', 1.8)],
  },
  {
    id: 'heesun-delayed-arrival', tier: 'major', signals: ['delayed'], weight: 1, minimumAbsurdity: 2,
    contextRequirements: { all: ['heesun-idle'] }, cooldown: 0, antiRepeatGroup: 'heesun-major',
    priority: 'medium', canInterrupt: false, canBeInterrupted: true, duration: 12,
    actorStateChanges: ['heesun:ambush'], worldStateChanges: ['major-chain'], animationCue: 'heesun-ambush', soundCue: 'heesun_ban_oi_chase', dialogueBubbles: [],
  },
  {
    id: 'stream-more-fish', tier: 'micro', signals: ['pha-oi'], weight: 9, minimumAbsurdity: 0,
    contextRequirements: { all: ['near-stream'] }, cooldown: 6, antiRepeatGroup: 'stream-call',
    priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 1.8,
    actorStateChanges: ['fish:add'], worldStateChanges: [], animationCue: 'fish-escalate', soundCue: 'stream_splash',
    dialogueBubbles: [bubble('stream', 'BÊN SUỐI', 'BY THE STREAM', 'Hôm nay cá hơi đông.', 'The fish are a little crowded today.', 'stream', 1.8)],
  },
  {
    id: 'dog-wakes', tier: 'micro', signals: ['pha-oi'], weight: 4.3, minimumAbsurdity: 0,
    cooldown: 13, antiRepeatGroup: 'animal-call', priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 1.7,
    actorStateChanges: ['dog:wake'], worldStateChanges: [], animationCue: 'dog-wake', soundCue: 'dog_reply', dialogueBubbles: [],
  },
  {
    id: 'distant-reply', tier: 'micro', signals: ['pha-oi'], weight: 4, minimumAbsurdity: 0,
    cooldown: 5, antiRepeatGroup: 'local-reply', priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 1.8,
    actorStateChanges: [], worldStateChanges: ['far-reply'], animationCue: 'reply-ring', soundCue: 'village_far_reply',
    dialogueBubbles: [bubble('world', 'AI ĐÓ RẤT XA', 'SOMEONE VERY FAR AWAY', 'Ơi…', 'Yeees…', 'world', 1.65)],
  },
  {
    id: 'delayed-chicken-crossing', tier: 'micro', signals: ['pha-oi'], weight: 2.2, minimumAbsurdity: 1,
    cooldown: 20, antiRepeatGroup: 'delayed-seed', priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 0.1,
    possibleFollowUps: [{ id: 'chicken-crossing', chance: 1, delayRange: [6.5, 10.5] }],
    actorStateChanges: [], worldStateChanges: ['delayed-seed'], dialogueBubbles: [],
  },
  {
    id: 'delayed-feast-memory', tier: 'micro', signals: ['pha-oi'], weight: 1.2, minimumAbsurdity: 2,
    cooldown: 30, antiRepeatGroup: 'delayed-seed', priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 0.1,
    possibleFollowUps: [{ id: 'feast-remembers-call', chance: 1, delayRange: [14, 22] }],
    actorStateChanges: [], worldStateChanges: ['delayed-seed'], dialogueBubbles: [],
  },
  {
    id: 'delayed-far-oi', tier: 'micro', signals: ['pha-oi'], weight: 1.8, minimumAbsurdity: 1,
    cooldown: 22, antiRepeatGroup: 'delayed-seed', priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 0.1,
    possibleFollowUps: [{ id: 'far-oi-returns', chance: 1, delayRange: [8, 14] }],
    actorStateChanges: [], worldStateChanges: ['delayed-seed'], dialogueBubbles: [],
  },
  {
    id: 'chicken-crossing', tier: 'medium', signals: ['delayed'], weight: 1, minimumAbsurdity: 1,
    cooldown: 0, antiRepeatGroup: 'chicken-run', priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 4.2,
    actorStateChanges: ['chicken:cross-screen'], worldStateChanges: [], animationCue: 'chicken-run', soundCue: 'chicken_panic', dialogueBubbles: [],
  },
  {
    id: 'feast-remembers-call', tier: 'major', signals: ['delayed'], weight: 1, minimumAbsurdity: 2,
    contextRequirements: { all: ['feast-idle'] }, cooldown: 0, antiRepeatGroup: 'feast-major', priority: 'medium',
    canInterrupt: false, canBeInterrupted: true, duration: 8,
    actorStateChanges: ['feast:chasing'], worldStateChanges: ['major-chain'], animationCue: 'feast-chase', soundCue: 'feast_chase',
    dialogueBubbles: [bubble('feast', 'MÂM NHẬU', 'THE DRINKING TABLE', 'À, lúc nãy ông gọi à?', 'Were you calling us earlier?', 'world', 1.8, 0, 'medium')],
  },
  {
    id: 'far-oi-returns', tier: 'micro', signals: ['delayed'], weight: 1, minimumAbsurdity: 1,
    cooldown: 0, antiRepeatGroup: 'local-reply', priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 2.2,
    actorStateChanges: [], worldStateChanges: ['far-reply'], soundCue: 'village_far_reply',
    dialogueBubbles: [bubble('world', 'RẤT XA', 'VERY FAR AWAY', 'ƠIIIIIIII!', 'YEEEEES!', 'world', 2)],
  },
  {
    id: 'chair-fall', tier: 'micro', signals: ['delayed', 'world-tick'], weight: 5, minimumAbsurdity: 0,
    contextRequirements: { all: ['world-quiet'] }, cooldown: 16, antiRepeatGroup: 'ambient-prop', priority: 'low',
    canInterrupt: false, canBeInterrupted: true, duration: 1.7,
    possibleFollowUps: [
      { id: 'chicken-invade-feast', chance: 0.38, delayRange: [0.25, 0.65] },
      { id: 'feast-chase', chance: 0.28, delayRange: [0.45, 1.1] },
    ],
    actorStateChanges: [], worldStateChanges: ['chair:fallen'], animationCue: 'chair-fall', soundCue: 'comic_domino', dialogueBubbles: [],
  },
  {
    id: 'shoe-from-house', tier: 'micro', signals: ['world-tick'], weight: 3.4, minimumAbsurdity: 1,
    contextRequirements: { all: ['world-quiet'] }, cooldown: 25, antiRepeatGroup: 'ambient-prop', priority: 'low',
    canInterrupt: false, canBeInterrupted: true, duration: 1.6,
    actorStateChanges: [], worldStateChanges: ['shoe:airborne'], animationCue: 'shoe-throw', soundCue: 'comic_domino', dialogueBubbles: [],
  },
  {
    id: 'someone-says-oi', tier: 'micro', signals: ['world-tick'], weight: 3.2, minimumAbsurdity: 1,
    contextRequirements: { all: ['world-quiet'] }, cooldown: 22, antiRepeatGroup: 'ambient-voice', priority: 'low',
    canInterrupt: false, canBeInterrupted: true, duration: 1.5,
    actorStateChanges: [], worldStateChanges: [], soundCue: 'village_far_reply',
    dialogueBubbles: [bubble('world', 'AI ĐÓ', 'SOMEONE', 'Ơi.', 'Yes.', 'world', 1.2)],
  },
  {
    id: 'heesun-shoe', tier: 'micro', signals: ['world-tick', 'waypoint'], weight: 6, minimumAbsurdity: 1,
    contextRequirements: { all: ['heesun-chasing'] }, cooldown: 24, antiRepeatGroup: 'heesun-chase-break', priority: 'medium',
    canInterrupt: false, canBeInterrupted: true, duration: 1.7,
    actorStateChanges: ['heesun:shoe-stop'], worldStateChanges: [], animationCue: 'heesun-shoe', dialogueBubbles: [],
  },
  {
    id: 'heesun-wrong-corner', tier: 'medium', signals: ['world-tick'], weight: 2.2, minimumAbsurdity: 2,
    contextRequirements: { all: ['heesun-idle', 'world-quiet'], none: ['near-heesun'] }, cooldown: 42,
    antiRepeatGroup: 'heesun-appearance', priority: 'medium', canInterrupt: false, canBeInterrupted: true, duration: 2.8,
    actorStateChanges: ['heesun:impossible-corner'], worldStateChanges: [], animationCue: 'heesun-stare', soundCue: 'heesun_ban_oi_far',
    dialogueBubbles: [bubble('heesun', 'HEESUN', 'HEESUN', 'Bạn ơi…', 'My friend…', 'heesun', 1.5, .65, 'medium')],
  },
  {
    id: 'heesun-feast-interrupt', tier: 'micro', signals: ['collision'], weight: 10, minimumAbsurdity: 0,
    contextRequirements: { all: ['heesun-chasing', 'near-feast'] }, cooldown: 22, antiRepeatGroup: 'heesun-chase-break', priority: 'medium',
    canInterrupt: false, canBeInterrupted: true, duration: 2.4,
    actorStateChanges: ['heesun:drink-stop'], worldStateChanges: [], animationCue: 'heesun-drink', soundCue: 'feast_vao_lam_chen',
    dialogueBubbles: [bubble('feast', 'MÂM NHẬU', 'THE DRINKING TABLE', 'Làm chén đã.', 'One cup first.', 'world', 1.4, 0, 'medium')],
  },
  {
    id: 'heesun-chicken-detour', tier: 'micro', signals: ['collision'], weight: 9, minimumAbsurdity: 0,
    contextRequirements: { all: ['heesun-chasing', 'chickens-running'] }, cooldown: 18, antiRepeatGroup: 'heesun-chase-break', priority: 'medium',
    canInterrupt: false, canBeInterrupted: true, duration: 2.6,
    actorStateChanges: ['heesun:follow-chickens'], worldStateChanges: [], animationCue: 'heesun-detour', soundCue: 'chicken_panic', dialogueBubbles: [],
  },
  {
    id: 'heesun-smells-food', tier: 'medium', signals: ['collision'], weight: 7, minimumAbsurdity: 1,
    contextRequirements: { all: ['heesun-chasing', 'hanu-delivering', 'near-hanu'] }, cooldown: 25, antiRepeatGroup: 'heesun-target',
    priority: 'medium', canInterrupt: false, canBeInterrupted: true, duration: 5.5,
    actorStateChanges: ['heesun:target-hanu'], worldStateChanges: ['shared-hanu-chase'], animationCue: 'heesun-chase', soundCue: 'heesun_ban_oi_chase',
    dialogueBubbles: [bubble('heesun', 'HEESUN', 'HEESUN', 'Cơm à?', 'Is that food?', 'heesun', 1.1, 0, 'medium')],
  },
  {
    id: 'hanu-blocks-heesun', tier: 'micro', signals: ['collision'], weight: 6, minimumAbsurdity: 0,
    contextRequirements: { all: ['heesun-chasing', 'near-hanu'] }, cooldown: 18, antiRepeatGroup: 'heesun-target',
    priority: 'medium', canInterrupt: false, canBeInterrupted: true, duration: 2.2,
    actorStateChanges: ['heesun:interrupted'], worldStateChanges: [], animationCue: 'comic-bump', soundCue: 'comic_domino',
    dialogueBubbles: [bubble('hanu', 'HANU', 'HANU', 'Ừ.', 'Yeah.', 'hanu', 1, 0.2, 'medium')],
  },
  {
    id: 'hanu-almost-caught', tier: 'micro', signals: ['collision'], weight: 5.8, minimumAbsurdity: 1,
    contextRequirements: { all: ['near-hanu', 'hanu-delivering'] }, cooldown: 18, antiRepeatGroup: 'hanu-delivery-near',
    priority: 'medium', canInterrupt: false, canBeInterrupted: true, duration: 1.1,
    actorStateChanges: ['hanu:pause-then-go'], worldStateChanges: [], animationCue: 'hanu-phone-pause',
    dialogueBubbles: [bubble('hanu', 'HANU', 'HANU', 'Ừ.', 'Yeah.', 'hanu', .75, 0, 'medium')],
  },
  {
    id: 'hanu-phone-first', tier: 'micro', signals: ['collision'], weight: 4.8, minimumAbsurdity: 1,
    contextRequirements: { all: ['near-hanu', 'hanu-delivering'] }, cooldown: 21, antiRepeatGroup: 'hanu-delivery-near',
    priority: 'medium', canInterrupt: false, canBeInterrupted: true, duration: 1.8,
    actorStateChanges: ['hanu:answer-phone'], worldStateChanges: [], animationCue: 'hanu-phone-call', soundCue: 'hanu_u',
    dialogueBubbles: [bubble('hanu', 'HANU · ĐIỆN THOẠI', 'HANU · ON THE PHONE', 'Alo? Ừ.', 'Hello? Yeah.', 'hanu', 1.35, 0, 'medium')],
  },
  {
    id: 'hanu-wrong-route', tier: 'micro', signals: ['waypoint'], weight: 4.6, minimumAbsurdity: 1,
    contextRequirements: { all: ['hanu-delivering'] }, cooldown: 20, antiRepeatGroup: 'hanu-delivery-route',
    priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 1,
    actorStateChanges: ['hanu:skip-route'], worldStateChanges: [], animationCue: 'hanu-wrong-turn', dialogueBubbles: [],
  },
  {
    id: 'hanu-feast-delivery', tier: 'micro', signals: ['waypoint'], weight: 5.2, minimumAbsurdity: 1,
    contextRequirements: { all: ['hanu-delivering', 'near-feast'] }, cooldown: 25, antiRepeatGroup: 'hanu-delivery-variation',
    priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 2.4,
    actorStateChanges: ['hanu:guard-food'], worldStateChanges: [], animationCue: 'hanu-pull-box',
    dialogueBubbles: [bubble('feast', 'MỘT NGƯỜI TRONG MÂM', 'SOMEONE AT THE TABLE', 'Cơm à?', 'Food?', 'world', 1.1)],
  },
  {
    id: 'hanu-perfect-delivery', tier: 'rare', signals: ['collision', 'waypoint'], weight: .35, minimumAbsurdity: 2,
    contextRequirements: { all: ['near-hanu', 'hanu-delivering'] }, cooldown: 90, antiRepeatGroup: 'hanu-delivery-near',
    priority: 'medium', canInterrupt: false, canBeInterrupted: true, duration: 2.4,
    actorStateChanges: ['hanu:perfect-handoff'], worldStateChanges: ['delivery:complete'], animationCue: 'hanu-handoff',
    dialogueBubbles: [bubble('hanu', 'HANU', 'HANU', 'Cơm.', 'Food.', 'hanu', 1.1, 0, 'medium')],
  },
  {
    id: 'hanu-wrong-person', tier: 'micro', signals: ['waypoint'], weight: 5.5, minimumAbsurdity: 1,
    contextRequirements: { all: ['hanu-delivering', 'near-feast'] }, cooldown: 24, antiRepeatGroup: 'hanu-delivery-variation',
    priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 2.8,
    actorStateChanges: ['hanu:pause'], worldStateChanges: [], animationCue: 'hanu-handoff',
    dialogueBubbles: [
      bubble('feast', 'MỘT NGƯỜI TRONG MÂM', 'SOMEONE AT THE TABLE', 'Cơm à?', 'Food?', 'world', 1.05),
      bubble('hanu', 'HANU', 'HANU', 'Nhầm.', 'Wrong person.', 'hanu', 1.15, 1.15),
    ],
  },
  {
    id: 'hanu-chief-delivery', tier: 'micro', signals: ['waypoint'], weight: 4.5, minimumAbsurdity: 2,
    contextRequirements: { all: ['hanu-delivering', 'near-chief', 'chief-speaking'] }, cooldown: 30, antiRepeatGroup: 'hanu-delivery-variation',
    priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 3,
    actorStateChanges: ['hanu:pause'], worldStateChanges: ['chief:eats-delivery'], animationCue: 'hanu-handoff',
    dialogueBubbles: [bubble('chief', 'TRƯỞNG BẢN', 'VILLAGE CHIEF', 'Thứ hai…', 'Secondly…', 'chief', 1.4)],
  },
  {
    id: 'hanu-chicken-procession', tier: 'medium', signals: ['waypoint', 'world-tick'], weight: 4.4, minimumAbsurdity: 2,
    contextRequirements: { all: ['hanu-delivering', 'chickens-calm'] }, cooldown: 30, antiRepeatGroup: 'hanu-delivery-variation',
    priority: 'medium', canInterrupt: false, canBeInterrupted: true, duration: 7,
    actorStateChanges: ['chicken:follow-hanu'], worldStateChanges: ['hanu-procession'], animationCue: 'chicken-follow', soundCue: 'chicken_panic', dialogueBubbles: [],
  },
  {
    id: 'chicken-follow-heesun', tier: 'micro', signals: ['collision'], weight: 5.6, minimumAbsurdity: 1,
    contextRequirements: { all: ['heesun-chasing', 'near-chickens', 'chickens-calm'] }, cooldown: 24,
    antiRepeatGroup: 'chicken-follow', priority: 'low', canInterrupt: false, canBeInterrupted: true, duration: 5.5,
    actorStateChanges: ['chicken:follow-heesun'], worldStateChanges: [], animationCue: 'chicken-follow', soundCue: 'chicken_panic', dialogueBubbles: [],
  },
  {
    id: 'chicken-invade-feast', tier: 'micro', signals: ['delayed', 'collision'], weight: 4.8, minimumAbsurdity: 1,
    contextRequirements: { all: ['feast-idle'] }, cooldown: 24, antiRepeatGroup: 'chicken-follow', priority: 'low',
    canInterrupt: false, canBeInterrupted: true, duration: 5.2,
    possibleFollowUps: [{ id: 'feast-chase', chance: .48, delayRange: [.7, 1.4] }],
    actorStateChanges: ['chicken:invade-feast'], worldStateChanges: ['chair:disturbed'], animationCue: 'chicken-follow', soundCue: 'chicken_panic', dialogueBubbles: [],
  },
  {
    id: 'feast-switch-hanu', tier: 'medium', signals: ['collision'], weight: 6.2, minimumAbsurdity: 2,
    contextRequirements: { all: ['feast-chasing', 'hanu-delivering', 'near-hanu'] }, cooldown: 32,
    antiRepeatGroup: 'feast-target', priority: 'medium', canInterrupt: false, canBeInterrupted: true, duration: 6,
    actorStateChanges: ['feast:target-hanu'], worldStateChanges: ['shared-hanu-chase'], animationCue: 'feast-chase',
    dialogueBubbles: [bubble('feast', 'MÂM NHẬU', 'THE DRINKING TABLE', 'Cơm à?', 'Food?', 'world', 1.1, 0, 'medium')],
  },
  {
    id: 'heesun-wife', tier: 'rare', signals: ['collision', 'world-tick'], weight: .55, minimumAbsurdity: 4,
    contextRequirements: { any: ['feast-chasing', 'heesun-chasing'] }, cooldown: 150, antiRepeatGroup: 'heesun-rare',
    priority: 'high', canInterrupt: true, canBeInterrupted: false, duration: 4.8,
    actorStateChanges: ['heesun:flee', 'feast:disperse'], worldStateChanges: ['wife:offscreen-arrival'], animationCue: 'heesun-flee',
    dialogueBubbles: [bubble('world', 'VỢ HEESUN', 'HEESUN’S WIFE', 'Về.', 'Home.', 'plain', 1.4, 0, 'high', false)],
  },
  {
    id: 'heesun-flee', tier: 'rare', signals: ['world-tick'], weight: 1, minimumAbsurdity: 3,
    contextRequirements: { all: ['heesun-idle', 'major-quiet'] }, cooldown: 70, antiRepeatGroup: 'heesun-rare',
    priority: 'medium', canInterrupt: false, canBeInterrupted: true, duration: 5.5,
    actorStateChanges: ['heesun:rare-flee'], worldStateChanges: [], animationCue: 'heesun-flee', soundCue: 'heesun_ban_oi_far', dialogueBubbles: [],
  },
  {
    id: 'macro-growth', tier: 'macro', signals: ['world-tick'], weight: 0.45, minimumAbsurdity: 4,
    contextRequirements: { all: ['major-quiet'] }, cooldown: 120, antiRepeatGroup: 'macro', priority: 'medium',
    canInterrupt: false, canBeInterrupted: true, duration: 5.5,
    actorStateChanges: [], worldStateChanges: ['macro:growth'], animationCue: 'confetti', soundCue: 'comic_domino',
    dialogueBubbles: [bubble('chief', 'TRƯỞNG BẢN', 'VILLAGE CHIEF', 'Đạt hai con số.', 'Double digits.', 'chief', 1.7, 2.4, 'medium')],
  },
  {
    id: 'macro-world-news', tier: 'rare', signals: ['world-tick'], weight: 0.8, minimumAbsurdity: 3,
    contextRequirements: { all: ['multiple-chase'] }, cooldown: 85, antiRepeatGroup: 'macro', priority: 'medium',
    canInterrupt: false, canBeInterrupted: true, duration: 4.5,
    actorStateChanges: [], worldStateChanges: ['macro:world-news'], animationCue: 'news-subtitle', dialogueBubbles: [],
  },
  {
    id: 'macro-physics', tier: 'macro', signals: ['world-tick'], weight: 0.3, minimumAbsurdity: 5,
    contextRequirements: { all: ['heesun-idle', 'major-quiet'] }, cooldown: 150, antiRepeatGroup: 'macro', priority: 'medium',
    canInterrupt: false, canBeInterrupted: true, duration: 5,
    actorStateChanges: ['heesun:duplicate'], worldStateChanges: ['macro:physics'], animationCue: 'heesun-twin', dialogueBubbles: [],
  },
  {
    id: 'macro-philosophy', tier: 'macro', signals: ['world-tick'], weight: .28, minimumAbsurdity: 5,
    contextRequirements: { all: ['heesun-idle', 'major-quiet'], none: ['near-heesun'] }, cooldown: 160,
    antiRepeatGroup: 'macro', priority: 'medium', canInterrupt: false, canBeInterrupted: true, duration: 5.2,
    actorStateChanges: ['heesun:behind-player'], worldStateChanges: ['macro:philosophy'], animationCue: 'heesun-stare', dialogueBubbles: [],
  },
] as const satisfies readonly EventDefinition[];

export type DirectedEventId = (typeof ABSURD_EVENT_REGISTRY)[number]['id'];

export type ActiveDirectedEvent = {
  id: DirectedEventId;
  tier: EventTier;
  priority: EventPriority;
  endsAt: number;
  chainDepth: number;
  canBeInterrupted: boolean;
};

export type DelayedDirectedEvent = {
  id: DirectedEventId;
  dueAt: number;
  chainDepth: number;
  sourceId: DirectedEventId;
};

export type DirectorState = {
  activeMajor: ActiveDirectedEvent | null;
  activeMicro: ActiveDirectedEvent[];
  delayedQueue: DelayedDirectedEvent[];
  recentEvents: Array<{ id: DirectedEventId; at: number; antiRepeatGroup: string }>;
  cooldownUntil: Partial<Record<DirectedEventId, number>>;
  lastMajorAt: number;
  nextWorldTickAt: number;
  evaluations: number;
};

export type DirectorResolution = {
  definition: EventDefinition & { id: DirectedEventId };
  chainDepth: number;
};

const EVENT_BY_ID = new Map(ABSURD_EVENT_REGISTRY.map((event) => [event.id, event] as const));
const PRIORITY_VALUE: Record<EventPriority, number> = { low: 0, medium: 1, high: 2 };
const MAJOR_TIERS: readonly EventTier[] = ['major', 'macro'];

export const createDirectorState = (now = 0): DirectorState => ({
  activeMajor: null,
  activeMicro: [],
  delayedQueue: [],
  recentEvents: [],
  cooldownUntil: {},
  lastMajorAt: -60,
  nextWorldTickAt: now + 3.5,
  evaluations: 0,
});

export const isTrueNothingRoll = (roll: number) => roll >= 0 && roll < TRUE_NOTHING_PROBABILITY;

const requirementsMatch = (definition: EventDefinition, context: ReadonlySet<DirectorContextKey>) => {
  const requirements = definition.contextRequirements;
  if (!requirements) return true;
  if (requirements.all?.some((key) => !context.has(key))) return false;
  if (requirements.any?.length && !requirements.any.some((key) => context.has(key))) return false;
  if (requirements.none?.some((key) => context.has(key))) return false;
  return true;
};

export const finishExpiredEvents = (director: DirectorState, now: number): DirectedEventId[] => {
  const finished: DirectedEventId[] = [];
  if (director.activeMajor && director.activeMajor.endsAt <= now) {
    finished.push(director.activeMajor.id);
    director.activeMajor = null;
  }
  director.activeMicro = director.activeMicro.filter((event) => {
    if (event.endsAt > now) return true;
    finished.push(event.id);
    return false;
  });
  return finished;
};

const eventCapacityAllows = (director: DirectorState, definition: EventDefinition) => {
  if (MAJOR_TIERS.includes(definition.tier)) {
    if (!director.activeMajor) return true;
    return definition.canInterrupt && PRIORITY_VALUE[definition.priority] > PRIORITY_VALUE[director.activeMajor.priority];
  }
  if (director.activeMicro.length < DIRECTOR_LIMITS.activeMicro) return true;
  return definition.canInterrupt && director.activeMicro.some((event) => (
    event.canBeInterrupted && PRIORITY_VALUE[definition.priority] > PRIORITY_VALUE[event.priority]
  ));
};

const effectiveWeight = (director: DirectorState, definition: EventDefinition, now: number) => {
  const lastSame = [...director.recentEvents].reverse().find((event) => event.id === definition.id);
  if (lastSame && now - lastSame.at < Math.max(4, definition.cooldown * 1.5)) return definition.weight * 0.08;
  const lastGroup = [...director.recentEvents].reverse().find((event) => event.antiRepeatGroup === definition.antiRepeatGroup);
  if (lastGroup && now - lastGroup.at < 18) return definition.weight * 0.28;
  return definition.weight;
};

const activate = (
  director: DirectorState,
  definition: EventDefinition & { id: DirectedEventId },
  now: number,
  chainDepth: number,
  random: () => number,
): DirectorResolution | null => {
  if (chainDepth > DIRECTOR_LIMITS.chainDepth || !eventCapacityAllows(director, definition)) return null;
  const active: ActiveDirectedEvent = {
    id: definition.id,
    tier: definition.tier,
    priority: definition.priority,
    endsAt: now + Math.max(0.05, definition.duration),
    chainDepth,
    canBeInterrupted: definition.canBeInterrupted,
  };
  if (MAJOR_TIERS.includes(definition.tier)) {
    if (director.activeMajor?.canBeInterrupted) director.activeMajor = null;
    director.activeMajor = active;
    director.lastMajorAt = now;
  } else {
    if (director.activeMicro.length >= DIRECTOR_LIMITS.activeMicro && definition.canInterrupt) {
      const candidate = director.activeMicro
        .map((event, index) => ({ event, index }))
        .filter(({ event }) => event.canBeInterrupted && PRIORITY_VALUE[definition.priority] > PRIORITY_VALUE[event.priority])
        .sort((first, second) => PRIORITY_VALUE[first.event.priority] - PRIORITY_VALUE[second.event.priority])[0];
      if (candidate) director.activeMicro.splice(candidate.index, 1);
    }
    director.activeMicro.push(active);
  }
  director.cooldownUntil[definition.id] = now + definition.cooldown;
  director.recentEvents.push({ id: definition.id, at: now, antiRepeatGroup: definition.antiRepeatGroup });
  director.recentEvents = director.recentEvents.slice(-DIRECTOR_LIMITS.recentEvents);

  definition.possibleFollowUps?.forEach((followUp) => {
    if (chainDepth >= DIRECTOR_LIMITS.chainDepth || random() >= followUp.chance) return;
    const next = EVENT_BY_ID.get(followUp.id as DirectedEventId);
    if (!next || director.delayedQueue.length >= DIRECTOR_LIMITS.delayedQueue) return;
    const [minDelay, maxDelay] = followUp.delayRange;
    const dueAt = now + minDelay + random() * Math.max(0, maxDelay - minDelay);
    director.delayedQueue.push({
      id: next.id,
      dueAt,
      chainDepth: chainDepth + 1,
      sourceId: definition.id,
    });
    director.delayedQueue.sort((first, second) => first.dueAt - second.dueAt);
  });
  return { definition, chainDepth };
};

const signalChance = (signal: DirectorSignal) => {
  if (signal === 'world-tick') return 0.28;
  if (signal === 'zone') return 0.46;
  if (signal === 'waypoint') return 0.34;
  if (signal === 'event-end') return 0.24;
  return 1;
};

export const evaluateDirector = (
  director: DirectorState,
  signal: DirectorSignal,
  context: ReadonlySet<DirectorContextKey>,
  absurdityLevel: AbsurdityLevel,
  now: number,
  random: () => number = Math.random,
): DirectorResolution | null => {
  director.evaluations += 1;
  finishExpiredEvents(director, now);
  if (random() > signalChance(signal)) return null;

  const candidates = ABSURD_EVENT_REGISTRY
    .filter((definition) => (definition.signals as readonly DirectorSignal[]).includes(signal))
    .filter((definition) => definition.minimumAbsurdity <= absurdityLevel)
    .filter((definition) => (director.cooldownUntil[definition.id] ?? 0) <= now)
    .filter((definition) => requirementsMatch(definition, context))
    .filter((definition) => eventCapacityAllows(director, definition))
    .map((definition) => ({ definition, weight: effectiveWeight(director, definition, now) }))
    .filter((candidate) => candidate.weight > 0);

  if (candidates.length === 0) return null;
  const total = candidates.reduce((sum, candidate) => sum + candidate.weight, 0);
  let roll = random() * total;
  const selected = candidates.find((candidate) => {
    roll -= candidate.weight;
    return roll <= 0;
  }) ?? candidates[candidates.length - 1];
  return activate(director, selected.definition, now, 0, random);
};

export const activateDirectedEvent = (
  director: DirectorState,
  id: DirectedEventId,
  now: number,
  chainDepth: number,
  random: () => number = Math.random,
): DirectorResolution | null => {
  const definition = EVENT_BY_ID.get(id);
  if (!definition) return null;
  finishExpiredEvents(director, now);
  return activate(director, definition, now, chainDepth, random);
};

export const takeDueEvents = (
  director: DirectorState,
  now: number,
  context: ReadonlySet<DirectorContextKey>,
  absurdityLevel: AbsurdityLevel,
  random: () => number = Math.random,
): DirectorResolution[] => {
  finishExpiredEvents(director, now);
  const due = director.delayedQueue.filter((event) => event.dueAt <= now);
  director.delayedQueue = director.delayedQueue.filter((event) => event.dueAt > now);
  const resolutions: DirectorResolution[] = [];
  due.forEach((event) => {
    const definition = EVENT_BY_ID.get(event.id);
    if (!definition || definition.minimumAbsurdity > absurdityLevel || !requirementsMatch(definition, context)) return;
    const resolution = activate(director, definition, now, event.chainDepth, random);
    if (resolution) resolutions.push(resolution);
  });
  return resolutions;
};

export const restoreDirectorHistory = (
  director: DirectorState,
  now: number,
  recent: readonly { id: string; age: number }[] = [],
  cooldownRemaining: Readonly<Record<string, number>> = {},
) => {
  director.recentEvents = recent
    .map(({ id, age }) => {
      const definition = EVENT_BY_ID.get(id as DirectedEventId);
      return definition ? { id: definition.id, at: now - Math.max(0, age), antiRepeatGroup: definition.antiRepeatGroup } : null;
    })
    .filter((event): event is NonNullable<typeof event> => event !== null)
    .slice(-DIRECTOR_LIMITS.recentEvents);
  Object.entries(cooldownRemaining).forEach(([id, remaining]) => {
    if (EVENT_BY_ID.has(id as DirectedEventId) && remaining > 0) {
      director.cooldownUntil[id as DirectedEventId] = now + remaining;
    }
  });
};

export const getEventDefinition = (id: DirectedEventId) => EVENT_BY_ID.get(id) ?? null;
