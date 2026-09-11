import type { GameEvent, PhaOiVoiceKind, PowerKind } from './gameEngine';
import {
  PHIENG_LOI_AUDIO_BY_ID,
  PHIENG_LOI_AUDIO_CUES,
  type PhiengLoiAudioCueId,
} from './audioManifest';

type AudioContextConstructor = typeof AudioContext;

type AudioUpdate = {
  elapsed: number;
  chasing: boolean;
  karaoke: boolean;
  power: PowerKind | null;
  nearStream: boolean;
};

export type VoiceAssetStatus = 'checking' | 'ready' | 'missing';

type SampleOptions = {
  pan?: number;
  distance?: number;
  pitchVariance?: number;
  reverb?: number;
  gain?: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Deliberately no oscillator/TTS fallback: the identity call must be a licensed
// human recording. The project owner can drop that exact file into this slot.
export const PHA_OI_VOICE_ASSET = PHIENG_LOI_AUDIO_BY_ID.get('pha_oi_normal')?.files[0]
  ?? '/audio/phieng-loi/pha-oi-human.mp3';

export class PhiengLoiAudioDirector {
  private context: AudioContext;
  private master: GainNode;
  private ambienceBus: GainNode;
  private sfxBus: GainNode;
  private sampleBus: GainNode;
  private reverbBus: GainNode;
  private convolver: ConvolverNode;
  private noiseBuffer: AudioBuffer;
  private voice: HTMLAudioElement;
  private voiceSource: MediaElementAudioSourceNode;
  private voiceGain: GainNode;
  private voicePan: StereoPannerNode;
  private voiceWet: GainNode;
  private voiceStatus: VoiceAssetStatus = 'checking';
  private muted = false;
  private disposed = false;
  private nextAmbientAt = 0;
  private nextStreamAt = 0;
  private nextDogAt = 10;
  private nextChaseBeatAt = 0;
  private chaseBeat = 0;
  private nextKaraokeBeatAt = 0;
  private karaokeBeat = 0;
  private phoneSerial = 0;
  private sampleSerial = 0;
  private sampleBuffers = new Map<PhiengLoiAudioCueId, AudioBuffer[]>();
  private activeSamples = new Map<PhiengLoiAudioCueId, AudioBufferSourceNode[]>();
  private preloadController = new AbortController();
  private preloadPromise: Promise<void> | null = null;

  constructor(Context: AudioContextConstructor) {
    this.context = new Context();
    this.master = this.context.createGain();
    this.ambienceBus = this.context.createGain();
    this.sfxBus = this.context.createGain();
    this.sampleBus = this.context.createGain();
    this.reverbBus = this.context.createGain();
    this.convolver = this.context.createConvolver();
    this.master.gain.value = 0.78;
    this.ambienceBus.gain.value = 0.16;
    this.sfxBus.gain.value = 0.46;
    this.sampleBus.gain.value = 0.68;
    this.reverbBus.gain.value = 0.18;
    this.ambienceBus.connect(this.master);
    this.sfxBus.connect(this.master);
    this.sampleBus.connect(this.master);
    this.convolver.connect(this.reverbBus);
    this.reverbBus.connect(this.master);
    this.master.connect(this.context.destination);

    this.noiseBuffer = this.context.createBuffer(1, Math.ceil(this.context.sampleRate * 0.8), this.context.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;

    const impulse = this.context.createBuffer(2, Math.ceil(this.context.sampleRate * 0.72), this.context.sampleRate);
    for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
      const impulseData = impulse.getChannelData(channel);
      for (let index = 0; index < impulseData.length; index += 1) {
        const decay = (1 - index / impulseData.length) ** 2.4;
        impulseData[index] = (Math.random() * 2 - 1) * decay;
      }
    }
    this.convolver.buffer = impulse;

    this.voice = new Audio(PHA_OI_VOICE_ASSET);
    this.voice.preload = 'auto';
    this.voiceSource = this.context.createMediaElementSource(this.voice);
    this.voiceGain = this.context.createGain();
    this.voicePan = this.context.createStereoPanner();
    this.voiceWet = this.context.createGain();
    this.voiceGain.gain.value = 0.82;
    this.voiceWet.gain.value = 0.2;
    this.voiceSource.connect(this.voiceGain);
    this.voiceGain.connect(this.voicePan);
    this.voicePan.connect(this.sampleBus);
    this.voicePan.connect(this.voiceWet);
    this.voiceWet.connect(this.convolver);
    this.voice.addEventListener('canplaythrough', this.markVoiceReady, { once: true });
    this.voice.addEventListener('error', this.markVoiceMissing, { once: true });
    this.voice.load();
    this.preloadPromise = this.preloadReadySamples();
  }

  private markVoiceReady = () => { this.voiceStatus = 'ready'; };
  private markVoiceMissing = () => { this.voiceStatus = 'missing'; };

  getVoiceAssetStatus() {
    return this.voiceStatus;
  }

  private async preloadReadySamples() {
    const readyCues = PHIENG_LOI_AUDIO_CUES.filter((cue) => cue.shipping === 'ready');
    await Promise.all(readyCues.map(async (cue) => {
      const buffers = await Promise.all(cue.files.map(async (file) => {
        try {
          const response = await fetch(file, { signal: this.preloadController.signal, cache: 'force-cache' });
          if (!response.ok) return null;
          return await this.context.decodeAudioData(await response.arrayBuffer());
        } catch {
          return null;
        }
      }));
      const decoded = buffers.filter((buffer): buffer is AudioBuffer => buffer !== null);
      if (decoded.length > 0) this.sampleBuffers.set(cue.id, decoded);
    }));
  }

  private playSample(cueId: PhiengLoiAudioCueId, options: SampleOptions = {}) {
    if (this.disposed || this.context.state !== 'running') return false;
    const cue = PHIENG_LOI_AUDIO_BY_ID.get(cueId);
    const buffers = this.sampleBuffers.get(cueId);
    if (!cue || !buffers?.length) return false;

    const current = this.activeSamples.get(cueId) ?? [];
    while (current.length >= cue.maxConcurrency) {
      const oldest = current.shift();
      try {
        oldest?.stop();
      } catch {
        // The take may have ended between the queue check and stop().
      }
    }

    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    const pan = this.context.createStereoPanner();
    const wet = this.context.createGain();
    const take = buffers[this.sampleSerial % buffers.length];
    this.sampleSerial += 1;
    source.buffer = take;
    const pitchVariance = options.pitchVariance ?? 0;
    source.playbackRate.value = 1 + (Math.random() * 2 - 1) * pitchVariance;
    const distanceGain = 1 - clamp(options.distance ?? 0, 0, 1) * 0.78;
    gain.gain.value = clamp((options.gain ?? 1) * distanceGain, 0, 1.2);
    pan.pan.value = clamp(options.pan ?? 0, -1, 1);
    wet.gain.value = clamp(options.reverb ?? 0.08, 0, 0.5);
    source.connect(gain);
    gain.connect(pan);
    pan.connect(this.sampleBus);
    pan.connect(wet);
    wet.connect(this.convolver);
    current.push(source);
    this.activeSamples.set(cueId, current);
    source.onended = () => {
      const remaining = this.activeSamples.get(cueId)?.filter((candidate) => candidate !== source) ?? [];
      if (remaining.length > 0) this.activeSamples.set(cueId, remaining);
      else this.activeSamples.delete(cueId);
      source.disconnect();
      gain.disconnect();
      pan.disconnect();
      wet.disconnect();
    };
    source.start();
    return true;
  }

  async resume() {
    if (!this.disposed && this.context.state === 'suspended') await this.context.resume();
    void this.preloadPromise;
  }

  async suspend() {
    if (!this.disposed && this.context.state === 'running') await this.context.suspend();
    this.voice.pause();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.voice.muted = muted;
    if (this.disposed) return;
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(muted ? 0 : 0.78, now, 0.025);
  }

  private tone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay = 0,
    endFrequency?: number,
    destination: AudioNode = this.sfxBus,
  ) {
    if (this.disposed || this.context.state !== 'running') return;
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(20, frequency), start);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + Math.min(0.018, duration * 0.18));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  private noise(duration: number, volume: number, cutoff: number, delay = 0, destination: AudioNode = this.sfxBus) {
    if (this.disposed || this.context.state !== 'running') return;
    const start = this.context.currentTime + delay;
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    source.buffer = this.noiseBuffer;
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    source.start(start);
    source.stop(start + duration + 0.02);
  }

  private playHumanCall(variant: PhaOiVoiceKind) {
    if (this.disposed || this.muted || this.voiceStatus === 'missing') return;
    const cueByVariant: Partial<Record<PhaOiVoiceKind, PhiengLoiAudioCueId>> = {
      long: 'pha_oi_long',
      panicked: 'pha_oi_panicked',
      whisper: 'pha_oi_whisper',
      silly: 'pha_oi_silly',
    };
    const cue = cueByVariant[variant];
    if (cue && this.playSample(cue, { gain: variant === 'whisper' ? 0.55 : 0.92, reverb: variant === 'long' ? 0.22 : 0.12 })) return;
    this.voice.currentTime = 0;
    this.voicePan.pan.value = (Math.random() * 2 - 1) * 0.08;
    void this.voice.play()
      .then(() => { this.voiceStatus = 'ready'; })
      .catch(() => { this.voiceStatus = 'missing'; });
  }

  handle(event: GameEvent) {
    if (this.disposed) return;
    if (event.type === 'pha-oi') {
      this.playHumanCall(event.voice);
      return;
    }
    if (event.type === 'director-event') {
      const cue = event.soundCue as PhiengLoiAudioCueId | undefined;
      if (cue && PHIENG_LOI_AUDIO_BY_ID.has(cue)) this.playSample(cue, { gain: 0.66, pitchVariance: 0.025, reverb: 0.12 });
      return;
    }
    if (event.type === 'footstep') {
      if (this.playSample('village_step', { gain: 0.24, pitchVariance: 0.03 })) return;
      this.noise(0.045, 0.012, 520);
      return;
    }
    if (event.type === 'crunch') {
      if (this.playSample('macadamia_crunch', { gain: 0.88, pitchVariance: 0.05 })) return;
      this.noise(0.08, 0.085, 2_200);
      this.tone(155, 0.055, 'square', 0.025, 0, 95);
      return;
    }
    if (event.type === 'chicken-panic') {
      if (this.playSample('chicken_panic', { gain: 0.78, pan: 0.34, pitchVariance: 0.06, reverb: 0.12 })) return;
      for (let index = 0; index < 7; index += 1) {
        this.tone(720 + (index % 3) * 160, 0.08, 'square', 0.025, index * 0.07, 1_120 + index * 40);
      }
      this.noise(0.4, 0.08, 2_800);
      return;
    }
    if (event.type === 'chase-start') {
      if (this.playSample('heesun_ban_oi_chase', { gain: 0.96, pan: 0.18, pitchVariance: 0.02, reverb: 0.16 })) return;
      this.tone(92, 0.25, 'sawtooth', 0.09, 0, 155);
      this.tone(185, 0.18, 'square', 0.045, 0.09, 120);
      return;
    }
    if (event.type === 'capture') {
      if (this.playSample('comic_capture', { gain: 1.05, reverb: 0.1 })) return;
      this.noise(0.32, 0.16, 950);
      this.tone(155, 0.5, 'sawtooth', 0.085, 0, 48);
      return;
    }
    if (event.type === 'reset') {
      this.tone(220, 0.4, 'triangle', 0.045, 0, 440);
      return;
    }
    if (event.type === 'call-ready') {
      this.tone(330, 0.09, 'triangle', 0.024);
      this.tone(440, 0.13, 'triangle', 0.02, 0.07);
      return;
    }
    if (event.type === 'karaoke-start') {
      [196, 294, 392, 587].forEach((note, index) => this.tone(note, .22, index % 2 ? 'square' : 'sawtooth', .038, index * .055, note * 1.16));
      this.noise(.18, .045, 3_800, .12);
      return;
    }
    if (event.type === 'karaoke-stop') {
      this.tone(196, .11, 'square', .038, 0, 58);
      this.nextKaraokeBeatAt = 0;
      this.karaokeBeat = 0;
      return;
    }
    if (event.type === 'delivery-start') {
      this.tone(620, 0.08, 'sine', 0.024);
      this.tone(820, 0.1, 'sine', 0.02, 0.09);
      return;
    }
    if (event.type === 'delivery-complete') {
      [392, 523, 659].forEach((note, index) => this.tone(note, 0.2, 'triangle', 0.035, index * 0.07));
      return;
    }
    if (event.type === 'feast-chase') {
      this.noise(0.12, 0.045, 1_100);
      this.tone(145, 0.22, 'square', 0.04, 0, 92);
      return;
    }
    if (event.type === 'phone') {
      this.phoneSerial += 1;
      const phoneCue: PhiengLoiAudioCueId = this.phoneSerial % 4 === 0 ? 'hanu_the_a' : 'hanu_u';
      if (this.playSample(phoneCue, { gain: 0.7, pan: 0.28, distance: 0.25, reverb: 0.04 })) return;
      this.tone(820, 0.09, 'sine', 0.035);
      this.tone(1_080, 0.08, 'sine', 0.025, 0.12);
      return;
    }
    if (event.type === 'domino') {
      if (this.playSample('comic_domino', { gain: 0.85, pan: 0.4, pitchVariance: 0.03, reverb: 0.08 })) return;
      for (let index = 0; index < 5; index += 1) this.tone(210 - index * 22, 0.1, 'triangle', 0.055, index * 0.12, 90);
      return;
    }
    if (event.type === 'stream') {
      if (this.playSample('stream_splash', { gain: 0.52, pan: 0.35, distance: 0.2, reverb: 0.22 })) return;
      this.noise(0.55, 0.05, 2_600);
      [520, 660, 790].forEach((note, index) => this.tone(note, 0.34, 'sine', 0.035, index * 0.09));
      return;
    }
    if (event.type === 'feast') {
      if (this.playSample('feast_vao_lam_chen', { gain: 0.72, pan: -0.2, distance: 0.12, reverb: 0.12 })) return;
      this.tone(196, 0.16, 'triangle', 0.055);
      this.tone(294, 0.18, 'triangle', 0.045, 0.12);
      this.tone(392, 0.2, 'triangle', 0.04, 0.24);
      return;
    }
    if (event.type === 'exit') {
      [392, 494, 587, 784].forEach((note, index) => this.tone(note, 0.58, 'triangle', 0.055, index * 0.1));
      return;
    }
    if (event.type === 'power-end') {
      this.tone(event.power === 'coffee' ? 310 : 220, 0.28, 'sine', 0.05, 0, 105);
      return;
    }
    if (event.type !== 'power-start') return;
    if (event.power === 'squash') {
      this.noise(0.12, 0.07, 900);
      this.tone(130, 0.25, 'square', 0.085, 0, 390);
      this.tone(520, 0.3, 'triangle', 0.055, 0.16);
    } else if (event.power === 'coffee') {
      this.noise(0.08, 0.04, 3_200);
      [330, 440, 660, 880].forEach((note, index) => this.tone(note, 0.13, 'square', 0.035, index * 0.05));
    } else {
      this.noise(0.14, 0.1, 2_400);
      this.tone(390, 0.11, 'triangle', 0.07);
      this.tone(780, 0.42, 'sine', 0.08, 0.08);
    }
  }

  update({ elapsed, chasing, karaoke, power, nearStream }: AudioUpdate) {
    if (this.disposed || this.context.state !== 'running') return;
    if (elapsed >= this.nextAmbientAt) {
      this.noise(0.7, 0.009, 1_400, 0, this.ambienceBus);
      this.tone(1_050 + Math.random() * 420, 0.06, 'sine', 0.012, 0.1, undefined, this.ambienceBus);
      this.nextAmbientAt = elapsed + 2.4 + Math.random() * 2.2;
    }
    if (nearStream && elapsed >= this.nextStreamAt) {
      this.noise(0.62, 0.018, 3_100, 0, this.ambienceBus);
      this.nextStreamAt = elapsed + 0.48;
    } else if (!nearStream) {
      this.nextStreamAt = elapsed;
    }
    if (!karaoke && elapsed >= this.nextDogAt) {
      if (!this.playSample('dog_reply', { gain: 0.3, pan: -0.45, distance: 0.58, pitchVariance: 0.03, reverb: 0.18 })) {
        this.noise(0.09, 0.032, 1_050, 0, this.ambienceBus);
        this.tone(245, 0.1, 'square', 0.018, 0, 195, this.ambienceBus);
        this.tone(280, 0.08, 'square', 0.014, 0.16, 220, this.ambienceBus);
      }
      this.nextDogAt = elapsed + 14 + Math.random() * 13;
    }
    if (karaoke && elapsed >= this.nextKaraokeBeatAt) {
      const bass = [98, 98, 123, 110][this.karaokeBeat % 4] ?? 98;
      const sparkle = [392, 494, 587, 784][this.karaokeBeat % 4] ?? 392;
      this.tone(bass, .18, 'sawtooth', .042, 0, bass * .72, this.ambienceBus);
      this.tone(sparkle, .12, 'square', .018, .025, sparkle * 1.04, this.ambienceBus);
      if (this.karaokeBeat % 2 === 1) this.noise(.055, .034, 4_200, 0, this.ambienceBus);
      this.karaokeBeat += 1;
      this.nextKaraokeBeatAt = elapsed + .23;
      this.nextChaseBeatAt = elapsed;
      this.chaseBeat = 0;
    } else if (!karaoke) {
      this.nextKaraokeBeatAt = elapsed;
      this.karaokeBeat = 0;
    }
    if (!karaoke && chasing && elapsed >= this.nextChaseBeatAt) {
      const notes = [82, 98, 82, 123];
      const note = notes[this.chaseBeat % notes.length];
      this.tone(note, 0.16, 'square', 0.035, 0, note * 0.75, this.ambienceBus);
      if (this.chaseBeat % 2 === 0) this.noise(0.06, 0.026, 480, 0, this.ambienceBus);
      this.chaseBeat += 1;
      this.nextChaseBeatAt = elapsed + 0.24;
    } else if (!karaoke && !chasing) {
      this.nextChaseBeatAt = elapsed;
      this.chaseBeat = 0;
    }
    const now = this.context.currentTime;
    this.ambienceBus.gain.setTargetAtTime(karaoke ? 0.27 : chasing ? 0.24 : power === 'coffee' ? 0.08 : 0.16, now, 0.12);
  }

  async dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.preloadController.abort();
    this.activeSamples.forEach((sources) => {
      sources.forEach((source) => {
        try {
          source.stop();
        } catch {
          // Already-ended sources are safe to ignore during route teardown.
        }
      });
    });
    this.activeSamples.clear();
    this.sampleBuffers.clear();
    this.voice.removeEventListener('canplaythrough', this.markVoiceReady);
    this.voice.removeEventListener('error', this.markVoiceMissing);
    this.voice.pause();
    this.voice.removeAttribute('src');
    this.voice.load();
    this.voiceSource.disconnect();
    this.voiceGain.disconnect();
    this.voicePan.disconnect();
    this.voiceWet.disconnect();
    try {
      await this.context.close();
    } catch {
      // Browsers may close the context during page teardown first.
    }
  }
}

export const createPhiengLoiAudio = () => {
  const browserWindow = window as typeof window & { webkitAudioContext?: AudioContextConstructor };
  const Context = window.AudioContext ?? browserWindow.webkitAudioContext;
  if (!Context) return null;
  try {
    return new PhiengLoiAudioDirector(Context);
  } catch {
    return null;
  }
};
