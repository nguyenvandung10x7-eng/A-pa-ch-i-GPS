export type PhiengLoiAudioCueId =
  | 'pha_oi_normal'
  | 'pha_oi_long'
  | 'pha_oi_panicked'
  | 'pha_oi_whisper'
  | 'pha_oi_silly'
  | 'heesun_ban_oi_far'
  | 'heesun_ban_oi_near'
  | 'heesun_ban_oi_chase'
  | 'heesun_lam_chen_cuoi'
  | 'hanu_u'
  | 'hanu_the_a'
  | 'chief_thu_nhat'
  | 'feast_vao_lam_chen'
  | 'village_reply'
  | 'chicken_panic'
  | 'dog_reply'
  | 'macadamia_crunch'
  | 'stream_splash'
  | 'comic_capture'
  | 'comic_domino'
  | 'village_step';

export type PhiengLoiAudioCue = {
  id: PhiengLoiAudioCueId;
  files: string[];
  characterOrEvent: string;
  lineOrSound: string;
  delivery: string;
  durationSeconds: readonly [number, number];
  takes: number;
  loop: boolean;
  processing: string;
  trigger: string;
  fallback: 'none' | 'procedural';
  shipping: 'pending' | 'runtime-probe' | 'ready';
  maxConcurrency: number;
};

const RECORDING_ROOT = '/audio/phieng-loi/recordings';
const takeFiles = (stem: string, takes: number, extension: 'wav' | 'mp3' = 'wav') => (
  Array.from({ length: takes }, (_, index) => `${RECORDING_ROOT}/${stem}_${String(index + 1).padStart(2, '0')}.${extension}`)
);

/**
 * Change a cue to `ready` only after every listed binary is present and its
 * creator/consent/licence record has been added to docs/audio-provenance.md.
 * Pending cues never make network requests, so an unfinished recording pack
 * cannot create a wall of 404s in a preview.
 */
export const PHIENG_LOI_AUDIO_CUES: readonly PhiengLoiAudioCue[] = [
  {
    id: 'pha_oi_normal',
    files: ['/audio/phieng-loi/pha-oi-human.mp3'],
    characterOrEvent: 'Player · PHÀ ƠI!',
    lineOrSound: 'PHÀ ƠI!',
    delivery: 'Clear outdoor call; decisive, friendly, never theatrical announcer voice.',
    durationSeconds: [0.65, 1.35],
    takes: 1,
    loop: false,
    processing: 'Dry lead plus short village echo; no pitch shift.',
    trigger: 'Default press of the PHÀ ƠI! action.',
    fallback: 'none',
    shipping: 'runtime-probe',
    maxConcurrency: 1,
  },
  {
    id: 'pha_oi_long',
    files: takeFiles('pha_oi_long', 3),
    characterOrEvent: 'Player · PHÀ ƠI!',
    lineOrSound: 'Phà ơơơơơi!',
    delivery: 'Long call across the village; breath naturally falls away.',
    durationSeconds: [1.4, 2.5],
    takes: 3,
    loop: false,
    processing: 'Light stereo echo, one distant reflection.',
    trigger: 'A contextual long-distance call or repeated-call escalation.',
    fallback: 'none',
    shipping: 'pending',
    maxConcurrency: 1,
  },
  {
    id: 'pha_oi_panicked',
    files: takeFiles('pha_oi_panicked', 3),
    characterOrEvent: 'Player · chase',
    lineOrSound: 'PHÀ ƠI!',
    delivery: 'Breathless, short and genuinely alarmed but still comic.',
    durationSeconds: [0.45, 0.95],
    takes: 3,
    loop: false,
    processing: 'Minimal reverb, slightly louder transient.',
    trigger: 'PHÀ ƠI! while HeeSun is chasing.',
    fallback: 'none',
    shipping: 'pending',
    maxConcurrency: 1,
  },
  {
    id: 'pha_oi_whisper',
    files: takeFiles('pha_oi_whisper', 2),
    characterOrEvent: 'Player · hiding beat',
    lineOrSound: 'Phà ơi…',
    delivery: 'Absurdly cautious whisper, close microphone, no ASMR styling.',
    durationSeconds: [0.7, 1.2],
    takes: 2,
    loop: false,
    processing: 'Dry and close; roll off low rumble.',
    trigger: 'Quiet contextual gag while hidden or immediately after escape.',
    fallback: 'none',
    shipping: 'pending',
    maxConcurrency: 1,
  },
  {
    id: 'pha_oi_silly',
    files: takeFiles('pha_oi_silly', 2),
    characterOrEvent: 'Player · PHÀ ƠI! rare take',
    lineOrSound: 'PHÀ… ơi?',
    delivery: 'One deliberately ill-judged, breathy take; funny because the confidence collapses halfway through.',
    durationSeconds: [0.75, 1.5],
    takes: 2,
    loop: false,
    processing: 'Mostly dry with one late outdoor reflection; preserve the awkward pause.',
    trigger: 'Rare weighted PHÀ ƠI! voice selection; never repeat the previous take family.',
    fallback: 'none',
    shipping: 'pending',
    maxConcurrency: 1,
  },
  {
    id: 'heesun_ban_oi_far',
    files: takeFiles('heesun_ban_oi_far', 3),
    characterOrEvent: 'HeeSun',
    lineOrSound: 'Bạn ơiiii…',
    delivery: 'Warm, persistent call from far away; too enthusiastic.',
    durationSeconds: [1.2, 2.2],
    takes: 3,
    loop: false,
    processing: 'Distance roll-off, medium outdoor echo, random pan.',
    trigger: 'HeeSun calls after losing the player or at high absurdity.',
    fallback: 'procedural',
    shipping: 'pending',
    maxConcurrency: 2,
  },
  {
    id: 'heesun_ban_oi_near',
    files: takeFiles('heesun_ban_oi_near', 3),
    characterOrEvent: 'HeeSun',
    lineOrSound: 'Bạn ơi…',
    delivery: 'Friendly and uncomfortably close, followed by a clean silence.',
    durationSeconds: [0.7, 1.25],
    takes: 3,
    loop: false,
    processing: 'Mostly dry, centered on HeeSun world position.',
    trigger: 'Final line in the first HeeSun meeting.',
    fallback: 'procedural',
    shipping: 'pending',
    maxConcurrency: 1,
  },
  {
    id: 'heesun_ban_oi_chase',
    files: takeFiles('heesun_ban_oi_chase', 4),
    characterOrEvent: 'HeeSun · chase',
    lineOrSound: 'BẠN ƠI!',
    delivery: 'Full-bodied happy shout, not angry or villainous.',
    durationSeconds: [0.55, 1.05],
    takes: 4,
    loop: false,
    processing: 'Short slap echo; slight random pitch within ±2%.',
    trigger: 'Chase start and selected chase re-entry beats.',
    fallback: 'procedural',
    shipping: 'pending',
    maxConcurrency: 2,
  },
  {
    id: 'heesun_lam_chen_cuoi',
    files: takeFiles('heesun_lam_chen_cuoi', 3),
    characterOrEvent: 'HeeSun · caught cutscene',
    lineOrSound: 'Làm chén cuối.',
    delivery: 'Calm certainty after the time card; almost tender.',
    durationSeconds: [0.9, 1.5],
    takes: 3,
    loop: false,
    processing: 'Dry foreground voice with room tone tail.',
    trigger: 'Middle beat of the caught sequence.',
    fallback: 'procedural',
    shipping: 'pending',
    maxConcurrency: 1,
  },
  {
    id: 'hanu_u',
    files: takeFiles('hanu_u', 4),
    characterOrEvent: 'HANU · phone',
    lineOrSound: 'Ừ.',
    delivery: 'Distracted, automatic acknowledgement without looking up.',
    durationSeconds: [0.2, 0.5],
    takes: 4,
    loop: false,
    processing: 'Phone-side band limit plus world pan from HANU position.',
    trigger: 'Recurring HANU phone-walk line.',
    fallback: 'procedural',
    shipping: 'pending',
    maxConcurrency: 2,
  },
  {
    id: 'hanu_the_a',
    files: takeFiles('hanu_the_a', 3),
    characterOrEvent: 'HANU · phone',
    lineOrSound: 'Thế à?',
    delivery: 'Mild surprise that changes absolutely nothing.',
    durationSeconds: [0.45, 0.85],
    takes: 3,
    loop: false,
    processing: 'Phone-side band limit plus world pan from HANU position.',
    trigger: 'Every third HANU phone response.',
    fallback: 'procedural',
    shipping: 'pending',
    maxConcurrency: 2,
  },
  {
    id: 'chief_thu_nhat',
    files: takeFiles('chief_thu_nhat', 3),
    characterOrEvent: 'Village Chief',
    lineOrSound: 'Thứ nhất…',
    delivery: 'Formal, slow and confidently nowhere near the point.',
    durationSeconds: [0.8, 1.4],
    takes: 3,
    loop: false,
    processing: 'Natural outdoor distance; long pauses are preserved.',
    trigger: 'Chief speech escalation and rare far-background continuation.',
    fallback: 'procedural',
    shipping: 'pending',
    maxConcurrency: 1,
  },
  {
    id: 'feast_vao_lam_chen',
    files: takeFiles('feast_vao_lam_chen', 4),
    characterOrEvent: 'Drinking mat group',
    lineOrSound: 'Vào làm chén.',
    delivery: 'Several friendly adults speaking slightly over one another.',
    durationSeconds: [0.7, 1.35],
    takes: 4,
    loop: false,
    processing: 'Small group spread, close-mid distance.',
    trigger: 'Each relocated drinking-mat encounter.',
    fallback: 'procedural',
    shipping: 'pending',
    maxConcurrency: 2,
  },
  {
    id: 'village_reply',
    files: takeFiles('village_reply', 4),
    characterOrEvent: 'Nearby house / ambient villager',
    lineOrSound: 'Ơi.',
    delivery: 'Short, ordinary acknowledgement; different adult voices are welcome.',
    durationSeconds: [0.35, 0.9],
    takes: 4,
    loop: false,
    processing: 'Light outdoor ambience and modest spatial placement; no long echo.',
    trigger: 'Immediate nearby-house reply or an independent ambient call; never a PHÀ ƠI fallback or delayed consequence.',
    fallback: 'procedural',
    shipping: 'pending',
    maxConcurrency: 2,
  },
  {
    id: 'chicken_panic',
    files: takeFiles('chicken_panic', 5),
    characterOrEvent: 'Chicken flock · vocal Foley',
    lineOrSound: 'Clucks, wing flaps and one unnecessary alarm call.',
    delivery: 'Fast mouth Foley with distinct short takes.',
    durationSeconds: [0.25, 0.9],
    takes: 5,
    loop: false,
    processing: 'Random pan/pitch; cap concurrent takes at four.',
    trigger: 'Village-wide chicken panic.',
    fallback: 'procedural',
    shipping: 'pending',
    maxConcurrency: 4,
  },
  {
    id: 'dog_reply',
    files: takeFiles('dog_reply', 3),
    characterOrEvent: 'Village dog · vocal Foley',
    lineOrSound: 'Two short barks and one confused huff.',
    delivery: 'Dry mouth Foley; playful, not aggressive.',
    durationSeconds: [0.2, 0.7],
    takes: 3,
    loop: false,
    processing: 'Distance pan, subtle low shelf.',
    trigger: 'Ambient dog response and nearby PHÀ ƠI!.',
    fallback: 'procedural',
    shipping: 'pending',
    maxConcurrency: 2,
  },
  {
    id: 'macadamia_crunch',
    files: takeFiles('macadamia_crunch', 5),
    characterOrEvent: 'Macadamia footstep gag',
    lineOrSound: 'An impossibly loud dry crunch.',
    delivery: 'Layered mouth crunch/click; each take noticeably different.',
    durationSeconds: [0.12, 0.45],
    takes: 5,
    loop: false,
    processing: 'Random pitch ±5%, hard concurrency cap.',
    trigger: 'Each moving step during the macadamia gag.',
    fallback: 'procedural',
    shipping: 'pending',
    maxConcurrency: 3,
  },
  {
    id: 'stream_splash',
    files: takeFiles('stream_splash', 4),
    characterOrEvent: 'Stream · vocal Foley',
    lineOrSound: 'Small splashes, cloth wring and soft laughter bed.',
    delivery: 'Gentle community ambience, never suggestive.',
    durationSeconds: [0.45, 1.5],
    takes: 4,
    loop: false,
    processing: 'Wide low-gain bed with stream-side reflections.',
    trigger: 'Stream reveal and fish escalation.',
    fallback: 'procedural',
    shipping: 'pending',
    maxConcurrency: 3,
  },
  {
    id: 'comic_capture',
    files: takeFiles('comic_capture', 3),
    characterOrEvent: 'HeeSun capture',
    lineOrSound: 'Body bump, cup clink, abrupt comic sting.',
    delivery: 'Three-part vocal Foley hit with a short dead stop.',
    durationSeconds: [0.45, 1.1],
    takes: 3,
    loop: false,
    processing: 'Strong transient, short reverb, no bass-heavy impact.',
    trigger: 'Freeze frame when HeeSun reaches the player.',
    fallback: 'procedural',
    shipping: 'pending',
    maxConcurrency: 1,
  },
  {
    id: 'comic_domino',
    files: takeFiles('comic_domino', 4),
    characterOrEvent: 'HANU object domino',
    lineOrSound: 'Five increasingly resigned object knocks.',
    delivery: 'Mouth clicks/wood taps with clean separation.',
    durationSeconds: [0.6, 1.4],
    takes: 4,
    loop: false,
    processing: 'Alternating pan, descending pitch.',
    trigger: 'HANU starts the prop domino without noticing.',
    fallback: 'procedural',
    shipping: 'pending',
    maxConcurrency: 1,
  },
  {
    id: 'village_step',
    files: takeFiles('village_step', 5),
    characterOrEvent: 'Player movement',
    lineOrSound: 'Soft dirt/grass footstep vocal Foley.',
    delivery: 'Short, unvoiced and unobtrusive.',
    durationSeconds: [0.08, 0.3],
    takes: 5,
    loop: false,
    processing: 'Random pitch ±3%, distance-neutral, low gain.',
    trigger: 'Player movement cadence.',
    fallback: 'procedural',
    shipping: 'pending',
    maxConcurrency: 3,
  },
] as const;

export const PHIENG_LOI_AUDIO_BY_ID = new Map(
  PHIENG_LOI_AUDIO_CUES.map((cue) => [cue.id, cue] as const),
);
