import type { GameEvent, PowerKind } from './gameEngine';

type AudioContextConstructor = typeof AudioContext;

type AudioUpdate = {
  elapsed: number;
  chasing: boolean;
  power: PowerKind | null;
  nearStream: boolean;
};

export type VoiceAssetStatus = 'checking' | 'ready' | 'missing';

// Deliberately no oscillator/TTS fallback: the identity call must be a licensed
// human recording. The project owner can drop that exact file into this slot.
export const PHA_OI_VOICE_ASSET = '/audio/phieng-loi/pha-oi-human.mp3';

export class PhiengLoiAudioDirector {
  private context: AudioContext;
  private master: GainNode;
  private ambienceBus: GainNode;
  private sfxBus: GainNode;
  private noiseBuffer: AudioBuffer;
  private voice: HTMLAudioElement;
  private voiceStatus: VoiceAssetStatus = 'checking';
  private muted = false;
  private disposed = false;
  private nextAmbientAt = 0;
  private nextStreamAt = 0;
  private nextDogAt = 10;
  private nextChaseBeatAt = 0;
  private chaseBeat = 0;

  constructor(Context: AudioContextConstructor) {
    this.context = new Context();
    this.master = this.context.createGain();
    this.ambienceBus = this.context.createGain();
    this.sfxBus = this.context.createGain();
    this.master.gain.value = 0.78;
    this.ambienceBus.gain.value = 0.16;
    this.sfxBus.gain.value = 0.46;
    this.ambienceBus.connect(this.master);
    this.sfxBus.connect(this.master);
    this.master.connect(this.context.destination);

    this.noiseBuffer = this.context.createBuffer(1, Math.ceil(this.context.sampleRate * 0.8), this.context.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;

    this.voice = new Audio(PHA_OI_VOICE_ASSET);
    this.voice.preload = 'auto';
    this.voice.addEventListener('canplaythrough', this.markVoiceReady, { once: true });
    this.voice.addEventListener('error', this.markVoiceMissing, { once: true });
    this.voice.load();
  }

  private markVoiceReady = () => { this.voiceStatus = 'ready'; };
  private markVoiceMissing = () => { this.voiceStatus = 'missing'; };

  getVoiceAssetStatus() {
    return this.voiceStatus;
  }

  async resume() {
    if (!this.disposed && this.context.state === 'suspended') await this.context.resume();
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

  private playHumanCall() {
    if (this.disposed || this.muted || this.voiceStatus === 'missing') return;
    this.voice.currentTime = 0;
    void this.voice.play()
      .then(() => { this.voiceStatus = 'ready'; })
      .catch(() => { this.voiceStatus = 'missing'; });
  }

  handle(event: GameEvent) {
    if (this.disposed) return;
    if (event.type === 'pha-oi') {
      this.playHumanCall();
      return;
    }
    if (event.type === 'footstep') {
      this.noise(0.045, 0.012, 520);
      return;
    }
    if (event.type === 'crunch') {
      this.noise(0.08, 0.085, 2_200);
      this.tone(155, 0.055, 'square', 0.025, 0, 95);
      return;
    }
    if (event.type === 'chicken-panic') {
      for (let index = 0; index < 7; index += 1) {
        this.tone(720 + (index % 3) * 160, 0.08, 'square', 0.025, index * 0.07, 1_120 + index * 40);
      }
      this.noise(0.4, 0.08, 2_800);
      return;
    }
    if (event.type === 'chase-start') {
      this.tone(92, 0.25, 'sawtooth', 0.09, 0, 155);
      this.tone(185, 0.18, 'square', 0.045, 0.09, 120);
      return;
    }
    if (event.type === 'capture') {
      this.noise(0.32, 0.16, 950);
      this.tone(155, 0.5, 'sawtooth', 0.085, 0, 48);
      return;
    }
    if (event.type === 'reset') {
      this.tone(220, 0.4, 'triangle', 0.045, 0, 440);
      return;
    }
    if (event.type === 'phone') {
      this.tone(820, 0.09, 'sine', 0.035);
      this.tone(1_080, 0.08, 'sine', 0.025, 0.12);
      return;
    }
    if (event.type === 'domino') {
      for (let index = 0; index < 5; index += 1) this.tone(210 - index * 22, 0.1, 'triangle', 0.055, index * 0.12, 90);
      return;
    }
    if (event.type === 'stream') {
      this.noise(0.55, 0.05, 2_600);
      [520, 660, 790].forEach((note, index) => this.tone(note, 0.34, 'sine', 0.035, index * 0.09));
      return;
    }
    if (event.type === 'feast') {
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

  update({ elapsed, chasing, power, nearStream }: AudioUpdate) {
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
    if (elapsed >= this.nextDogAt) {
      this.noise(0.09, 0.032, 1_050, 0, this.ambienceBus);
      this.tone(245, 0.1, 'square', 0.018, 0, 195, this.ambienceBus);
      this.tone(280, 0.08, 'square', 0.014, 0.16, 220, this.ambienceBus);
      this.nextDogAt = elapsed + 14 + Math.random() * 13;
    }
    if (chasing && elapsed >= this.nextChaseBeatAt) {
      const notes = [82, 98, 82, 123];
      const note = notes[this.chaseBeat % notes.length];
      this.tone(note, 0.16, 'square', 0.035, 0, note * 0.75, this.ambienceBus);
      if (this.chaseBeat % 2 === 0) this.noise(0.06, 0.026, 480, 0, this.ambienceBus);
      this.chaseBeat += 1;
      this.nextChaseBeatAt = elapsed + 0.24;
    } else if (!chasing) {
      this.nextChaseBeatAt = elapsed;
      this.chaseBeat = 0;
    }
    const now = this.context.currentTime;
    this.ambienceBus.gain.setTargetAtTime(chasing ? 0.24 : power === 'coffee' ? 0.08 : 0.16, now, 0.12);
  }

  async dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.voice.removeEventListener('canplaythrough', this.markVoiceReady);
    this.voice.removeEventListener('error', this.markVoiceMissing);
    this.voice.pause();
    this.voice.removeAttribute('src');
    this.voice.load();
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
