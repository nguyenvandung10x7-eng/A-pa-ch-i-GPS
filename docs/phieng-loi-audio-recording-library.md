# Phiêng Lơi audio recording library

This is the recording contract for the closed-world comedy runtime. The source of
truth for filenames and runtime status is
`src/experiences/phieng-loi/audioManifest.ts`. A recording is not shippable until
its cue is marked `ready` **and** its creator, consent, licence/commission terms,
public-use permission, redistribution basis, edits, and binary hash are recorded
in `docs/audio-provenance.md`.

## Recording and handoff

1. Record mono WAV at 48 kHz / 24 bit when possible. Low-fi performance is fine;
   clipping, aggressive noise reduction, and baked-in reverb are not.
2. Leave roughly 100 ms of room before and after a short take. Keep deliberate
   comedy silences inside dialogue takes.
3. Name files exactly as listed below and place them in
   `public/audio/phieng-loi/recordings/`. The compatibility default call remains
   `public/audio/phieng-loi/pha-oi-human.mp3`.
4. Add the rights/provenance entry, then change the cue's `shipping` field from
   `pending` to `ready`. The director preloads only ready cues, chooses takes in a
   stable round-robin order, applies gain/pan/distance/pitch/reverb, caps concurrent
   playback, and releases every source on teardown.
5. Listen on an iPhone speaker and headphones. Dialogue must remain readable over
   stream/chase ambience without turning the master bus up.

`runtime-probe` is reserved for the legacy-compatible PHÀ ƠI slot. Missing voice
media stays silent; there is intentionally no TTS, oscillator, or beep substitute
for a human line. Non-verbal and non-signature cues may use the existing
procedural sound as a development fallback.

## Cue sheet

| Filename(s) | Character / event | Line / sound | Delivery | Duration | Takes | Loop | Processing | Trigger |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- |
| `pha-oi-human.mp3` | Player · default call | “PHÀ ƠI!” | Clear, friendly outdoor call; not an announcer | 0.65–1.35 s | 1 | No | Dry lead + short village echo | Default PHÀ ƠI press |
| `pha_oi_long_01..03.wav` | Player · distant call | “Phà ơơơơơi!” | Long breath that falls away naturally | 1.4–2.5 s | 3 | No | Light stereo echo + one distant reflection | Long-distance/repeated-call beat |
| `pha_oi_panicked_01..03.wav` | Player · chase | “PHÀ ƠI!” | Breathless and alarmed, still comic | 0.45–0.95 s | 3 | No | Minimal reverb, stronger transient | Call during HeeSun chase |
| `pha_oi_whisper_01..02.wav` | Player · hiding | “Phà ơi…” | Absurdly cautious close whisper | 0.7–1.2 s | 2 | No | Dry, low-rumble roll-off | Quiet hiding/escape gag |
| `pha_oi_silly_01..02.wav` | Player · rare bad take | “PHÀ… ơi?” | Confidence collapses halfway through; awkward, not cute | 0.75–1.5 s | 2 | No | Mostly dry with one late reflection | Rare weighted family; never repeat the preceding family |
| `heesun_ban_oi_far_01..03.wav` | HeeSun · far | “Bạn ơiiii…” | Warm, persistent, too enthusiastic | 1.2–2.2 s | 3 | No | Distance roll-off, medium echo, random pan | Lost-player/high-chaos call |
| `heesun_ban_oi_near_01..03.wav` | HeeSun · near | “Bạn ơi…” | Friendly and uncomfortably close | 0.7–1.25 s | 3 | No | Mostly dry, position pan | Final first-meeting line |
| `heesun_ban_oi_chase_01..04.wav` | HeeSun · chase | “BẠN ƠI!” | Full-bodied happy shout, never angry | 0.55–1.05 s | 4 | No | Short slap echo, random pitch ±2% | Chase start/re-entry |
| `heesun_lam_chen_cuoi_01..03.wav` | HeeSun · caught | “Làm chén cuối.” | Calm certainty, almost tender | 0.9–1.5 s | 3 | No | Dry foreground + room tail | Caught time-card sequence |
| `hanu_u_01..04.wav` | HANU · phone | “Ừ.” | Automatic distracted acknowledgement | 0.2–0.5 s | 4 | No | Phone band-limit + world pan | Recurring phone walk |
| `hanu_the_a_01..03.wav` | HANU · phone | “Thế à?” | Mild surprise; no change in pace | 0.45–0.85 s | 3 | No | Phone band-limit + world pan | Every third/fourth phone response |
| `chief_thu_nhat_01..03.wav` | Trưởng bản | “Thứ nhất…” | Formal, slow, nowhere near the point | 0.8–1.4 s | 3 | No | Natural outdoor distance; preserve pause | Speech escalation/far continuation |
| `feast_vao_lam_chen_01..04.wav` | Mâm nhậu | “Vào làm chén.” | Friendly adult group, slight overlap | 0.7–1.35 s | 4 | No | Small group stereo spread | Every relocated table encounter |
| `village_reply_01..04.wav` | Nearby house / ambient villager | “Ơi.” | Short, ordinary acknowledgement; vary adult voices | 0.35–0.9 s | 4 | No | Light outdoor ambience; no long echo | Immediate nearby-house reply or independent ambient call; never a PHÀ ƠI fallback/delayed consequence |
| `chicken_panic_01..05.wav` | Chicken flock · vocal Foley | Clucks, wings, needless alarm | Fast distinct mouth-Foley takes | 0.25–0.9 s | 5 | No | Random pan/pitch, max 4 concurrent | Whole-village flock panic |
| `dog_reply_01..03.wav` | Village dog · vocal Foley | Two barks / confused huff | Playful, not aggressive | 0.2–0.7 s | 3 | No | Distance pan, subtle low shelf | Ambient or nearby call response |
| `macadamia_crunch_01..05.wav` | Macadamia gag | Impossibly loud dry crunch | Layered mouth crunch/click | 0.12–0.45 s | 5 | No | Random pitch ±5%, max 3 concurrent | Every powered footstep |
| `stream_splash_01..04.wav` | Stream group · vocal Foley | Splash, cloth wring, soft laughter | Gentle community ambience | 0.45–1.5 s | 4 | No | Wide low-gain bed, stream reflection | Stream reveal/fish escalation |
| `comic_capture_01..03.wav` | HeeSun capture | Body bump, cup clink, comic sting | Three-part hit ending dead | 0.45–1.1 s | 3 | No | Strong transient, short reverb | Capture freeze frame |
| `comic_domino_01..04.wav` | HANU prop domino | Five resigned object knocks | Clean separated mouth/wood taps | 0.6–1.4 s | 4 | No | Alternating pan, descending pitch | HANU starts domino |
| `village_step_01..05.wav` | Player movement | Dirt/grass footstep vocal Foley | Short, unvoiced, unobtrusive | 0.08–0.3 s | 5 | No | Random pitch ±3%, low gain | Movement cadence |

## Performance direction

- HeeSun is never a villain: even the loudest take must sound delighted to find
  the player.
- HANU never performs for the player; every line is addressed to the phone.
- Village voices are adult community voices. Do not imitate a named actor or a
  protected character.
- Capture, drinking, and stream recordings should communicate timing and social
  absurdity without glamorising alcohol or sexualising the stream scene.
- Do not normalize every file to the same perceived loudness. Preserve the
  difference between whisper, nearby speech, and a call from across the valley;
  the runtime adds final attenuation and bus gain.

## Runtime fallbacks and QA

The sample player is additive to the existing AudioContext lifecycle and buses.
When a ready non-signature sample cannot decode, the matching procedural cue
continues so the vertical slice remains testable. The human PHÀ ƠI line is the
exception and fails silent by design.

Before setting a cue to `ready`, verify:

- every declared take loads with no 404 or decode warning;
- random/round-robin takes do not exceed the cue concurrency cap;
- pause and Book-open suspend the AudioContext and voice element;
- closing Book resumes only when the game had been playing;
- mute affects procedural, sample, reverb, and voice playback;
- route teardown aborts preload, stops active sources, clears the voice source,
  and closes AudioContext;
- the rights/provenance record matches the exact shipped binary.
