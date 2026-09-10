import type { GameEvent, PowerKind, ZoneKind } from './gameEngine';

type AudioContextConstructor = typeof AudioContext;

type AudioUpdate = {
  elapsed: number;
  zone: ZoneKind;
  powers: PowerKind[];
};

const zoneNotes: Record<ZoneKind, number[]> = {
  0: [293.66, 349.23, 440, 523.25, 440, 349.23, 329.63, 293.66],
  1: [261.63, 329.63, 392, 493.88, 392, 329.63, 293.66, 329.63],
  2: [293.66, 392, 440, 587.33, 440, 392, 329.63, 392],
  3: [329.63, 392, 493.88, 587.33, 659.25, 587.33, 493.88, 392],
};

const zoneTempo: Record<ZoneKind, number> = { 0: 98, 1: 106, 2: 92, 3: 112 };

export class PhiengLoiAudioDirector {
  private context: AudioContext;
  private master: GainNode;
  private musicBus: GainNode;
  private sfxBus: GainNode;
  private musicFilter: BiquadFilterNode;
  private noiseBuffer: AudioBuffer;
  private nextBeatAt = 0;
  private nextAmbientAt = 0;
  private beatIndex = 0;
  private muted = false;
  private disposed = false;

  constructor(Context: AudioContextConstructor) {
    this.context = new Context();
    this.master = this.context.createGain();
    this.musicBus = this.context.createGain();
    this.sfxBus = this.context.createGain();
    this.musicFilter = this.context.createBiquadFilter();
    this.master.gain.value = 0.72;
    this.musicBus.gain.value = 0.16;
    this.sfxBus.gain.value = 0.48;
    this.musicFilter.type = 'lowpass';
    this.musicFilter.frequency.value = 6_500;
    this.musicBus.connect(this.musicFilter);
    this.musicFilter.connect(this.master);
    this.sfxBus.connect(this.master);
    this.master.connect(this.context.destination);

    this.noiseBuffer = this.context.createBuffer(1, Math.ceil(this.context.sampleRate * 0.6), this.context.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
  }

  async resume() {
    if (!this.disposed && this.context.state === 'suspended') await this.context.resume();
  }

  async suspend() {
    if (!this.disposed && this.context.state === 'running') await this.context.suspend();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.disposed) return;
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(muted ? 0 : 0.72, now, 0.025);
  }

  isMuted() {
    return this.muted;
  }

  private tone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    destination: AudioNode = this.sfxBus,
    delay = 0,
    endFrequency?: number,
  ) {
    if (this.disposed || this.context.state !== 'running') return;
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(20, frequency), start);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + Math.min(0.02, duration * 0.18));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  private noise(duration: number, volume: number, cutoff: number, delay = 0) {
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
    gain.connect(this.sfxBus);
    source.start(start);
    source.stop(start + duration + 0.02);
  }

  private chord(notes: number[], duration = 0.34, type: OscillatorType = 'triangle', volume = 0.055) {
    notes.forEach((note, index) => this.tone(note, duration, type, volume / notes.length, this.sfxBus, index * 0.028));
  }

  handle(event: GameEvent) {
    if (this.disposed) return;
    if (event.type === 'jump') {
      this.tone(260, 0.13, 'square', 0.07, this.sfxBus, 0, 440);
      this.noise(0.06, 0.035, 1_500);
      return;
    }
    if (event.type === 'land') {
      this.tone(95, 0.09, 'sine', 0.08, this.sfxBus, 0, 58);
      this.noise(0.08, 0.04, 720);
      return;
    }
    if (event.type === 'token') {
      this.tone(660, 0.13, 'sine', 0.09);
      this.tone(880, 0.18, 'sine', 0.075, this.sfxBus, 0.07);
      return;
    }
    if (event.type === 'hit') {
      this.noise(0.18, 0.15, 1_100);
      this.tone(170, 0.24, 'sawtooth', 0.08, this.sfxBus, 0, 62);
      return;
    }
    if (event.type === 'shield-break') {
      this.chord([740, 930, 1_180], 0.28, 'sine', 0.14);
      this.noise(0.18, 0.08, 4_200, 0.04);
      return;
    }
    if (event.type === 'break') {
      this.noise(0.2, 0.13, 1_650);
      this.tone(105, 0.18, 'triangle', 0.11, this.sfxBus, 0, 54);
      return;
    }
    if (event.type === 'zone-change') {
      const roots: Record<ZoneKind, number[]> = {
        0: [293.66, 440],
        1: [329.63, 493.88, 659.25],
        2: [293.66, 440, 587.33],
        3: [392, 493.88, 659.25],
      };
      this.chord(roots[event.zone], 0.65, 'triangle', 0.11);
      return;
    }
    if (event.type === 'complete') {
      [392, 493.88, 587.33, 783.99].forEach((note, index) => this.tone(note, 0.58, 'triangle', 0.07, this.sfxBus, index * 0.12));
      return;
    }
    if (event.type === 'power-end') {
      if (event.power === 'squash') {
        this.tone(310, 0.24, 'sine', 0.08, this.sfxBus, 0, 105);
      } else if (event.power === 'coffee') {
        this.tone(360, 0.23, 'square', 0.045, this.sfxBus, 0, 150);
      } else if (event.power === 'macadamia') {
        this.tone(690, 0.24, 'sine', 0.06, this.sfxBus, 0, 410);
      } else if (event.power === 'tea') {
        this.tone(430, 0.42, 'sine', 0.055, this.sfxBus, 0, 760);
      } else {
        this.tone(180, 0.26, 'triangle', 0.07, this.sfxBus, 0, 95);
      }
      return;
    }
    if (event.type !== 'power-start') return;
    if (event.power === 'squash') {
      this.noise(0.1, 0.06, 900);
      this.tone(145, 0.22, 'square', 0.09, this.sfxBus, 0, 390);
      this.tone(523.25, 0.3, 'triangle', 0.07, this.sfxBus, 0.14);
    } else if (event.power === 'coffee') {
      this.noise(0.08, 0.045, 3_200);
      [330, 440, 660, 880].forEach((note, index) => this.tone(note, 0.14, 'square', 0.045, this.sfxBus, index * 0.045));
    } else if (event.power === 'macadamia') {
      this.tone(390, 0.12, 'triangle', 0.08);
      this.tone(780, 0.55, 'sine', 0.11, this.sfxBus, 0.08);
    } else if (event.power === 'tea') {
      [880, 740, 587.33].forEach((note, index) => this.tone(note, 0.52, 'sine', 0.045, this.sfxBus, index * 0.09));
      this.noise(0.34, 0.025, 5_600);
    } else {
      this.noise(0.14, 0.07, 1_200);
      this.chord([110, 164.81, 220], 0.48, 'triangle', 0.16);
    }
  }

  private playMusicBeat(zone: ZoneKind, coffee: boolean, tea: boolean, buffalo: boolean) {
    const sequence = zoneNotes[zone];
    const note = sequence[this.beatIndex % sequence.length];
    const strongBeat = this.beatIndex % 4 === 0;
    const destination = this.musicBus;
    this.tone(note, tea ? 0.52 : 0.26, zone === 2 ? 'sine' : 'triangle', strongBeat ? 0.13 : 0.085, destination);
    if (strongBeat) this.tone(note / 2, 0.34, 'sine', buffalo ? 0.11 : 0.07, destination);
    if (coffee && this.beatIndex % 2 === 1) {
      this.noise(0.035, 0.022, 4_800);
      this.tone(note * 2, 0.07, 'square', 0.018, destination);
    }
    this.beatIndex += 1;
  }

  private playAmbient(zone: ZoneKind) {
    if (zone === 0) {
      this.tone(1_050, 0.06, 'square', 0.025, this.musicBus);
      this.tone(1_480, 0.08, 'square', 0.02, this.musicBus, 0.08);
    } else if (zone === 1) {
      this.tone(1_250, 0.08, 'sine', 0.025, this.musicBus);
      this.tone(1_620, 0.11, 'sine', 0.018, this.musicBus, 0.1);
    } else if (zone === 2) {
      this.noise(0.42, 0.018, 2_100);
      this.tone(540, 0.18, 'sine', 0.02, this.musicBus, 0.08, 720);
    } else {
      this.tone(196, 0.12, 'triangle', 0.035, this.musicBus);
      this.tone(293.66, 0.18, 'triangle', 0.028, this.musicBus, 0.12);
    }
  }

  update({ elapsed, zone, powers }: AudioUpdate) {
    if (this.disposed || this.context.state !== 'running') return;
    const coffee = powers.includes('coffee');
    const tea = powers.includes('tea');
    const buffalo = powers.includes('buffalo');
    const tempo = zoneTempo[zone] * (coffee ? 1.28 : tea ? 0.82 : 1);
    const beatDuration = 60 / tempo;
    if (elapsed < this.nextBeatAt - 1) this.nextBeatAt = elapsed;
    if (elapsed >= this.nextBeatAt) {
      this.playMusicBeat(zone, coffee, tea, buffalo);
      this.nextBeatAt = elapsed + beatDuration;
    }
    if (elapsed >= this.nextAmbientAt) {
      this.playAmbient(zone);
      this.nextAmbientAt = elapsed + (zone === 2 ? 1.7 : 2.8 + Math.random() * 1.4);
    }
    const now = this.context.currentTime;
    this.musicFilter.frequency.setTargetAtTime(tea ? 1_300 : 6_500, now, 0.15);
    this.musicBus.gain.setTargetAtTime(coffee ? 0.21 : zone === 3 ? 0.19 : 0.16, now, 0.1);
  }

  async dispose() {
    if (this.disposed) return;
    this.disposed = true;
    try {
      await this.context.close();
    } catch {
      // The browser may have already closed the context while unloading.
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
