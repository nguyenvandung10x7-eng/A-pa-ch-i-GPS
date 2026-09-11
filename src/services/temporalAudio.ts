export type TemporalAudioSlotId = 'intro' | 'a1' | 'radio' | 'present' | 'memorial';

// Asset slots deliberately remain empty until exact files and public-use rights
// are supplied. Missing slots fail silently; the scene never fabricates a
// historical recording. The separate oscillator study below is an explicitly
// labelled spatial calibration aid and contains no sampled material.
export const TEMPORAL_AUDIO_SLOTS: Readonly<Record<TemporalAudioSlotId, string | null>> = Object.freeze({
  intro: null,
  a1: null,
  radio: null,
  present: null,
  memorial: null,
});

type TemporalAudioOptions = {
  slots?: Readonly<Record<TemporalAudioSlotId, string | null>>;
  enableSpatialStudy?: boolean;
};

type SpatialSource = {
  input: GainNode;
  attention: GainNode;
  panner: PannerNode;
  angle: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const sourcePosition = (angle: number, radius = 8) => ({
  x: Math.sin(angle) * radius,
  z: -Math.cos(angle) * radius,
});

const createSpatialSource = (context: AudioContext, output: AudioNode, angle: number): SpatialSource => {
  const input = context.createGain();
  const attention = context.createGain();
  const panner = context.createPanner();
  const position = sourcePosition(angle);
  input.gain.value = 1;
  attention.gain.value = 0;
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'inverse';
  panner.refDistance = 1;
  panner.maxDistance = 40;
  panner.rolloffFactor = 0.55;
  panner.positionX.value = position.x;
  panner.positionY.value = 0;
  panner.positionZ.value = position.z;
  input.connect(attention).connect(panner).connect(output);
  return { input, attention, panner, angle };
};

const createTone = (
  context: AudioContext,
  destination: AudioNode,
  frequency: number,
  type: OscillatorType,
  level: number,
) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = level;
  oscillator.connect(gain).connect(destination);
  oscillator.start();
  return { oscillator, gain };
};

const decodeStem = async (context: AudioContext, url: string) => {
  const response = await fetch(url, { credentials: 'same-origin' });
  if (!response.ok) throw new Error(`temporal-audio-${response.status}`);
  return context.decodeAudioData(await response.arrayBuffer());
};

export const createTemporalAudio = (options: TemporalAudioOptions = {}) => {
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) throw new Error('temporal-audio-unavailable');
  const context = new AudioContextClass({ latencyHint: 'playback' });
  const master = context.createGain();
  const compressor = context.createDynamicsCompressor();
  const slots = options.slots ?? TEMPORAL_AUDIO_SLOTS;
  const enableSpatialStudy = options.enableSpatialStudy ?? true;
  const nodes: AudioNode[] = [master, compressor];
  const oscillators: OscillatorNode[] = [];
  const buffers: AudioBufferSourceNode[] = [];
  let disposed = false;
  let muted = false;

  master.gain.value = 0;
  compressor.threshold.value = -24;
  compressor.knee.value = 18;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.08;
  compressor.release.value = 0.6;
  master.connect(compressor).connect(context.destination);

  const sources: Record<Exclude<TemporalAudioSlotId, 'intro'>, SpatialSource> = {
    a1: createSpatialSource(context, master, -0.62),
    radio: createSpatialSource(context, master, -0.12),
    memorial: createSpatialSource(context, master, 0.28),
    present: createSpatialSource(context, master, 0.72),
  };
  Object.values(sources).forEach(({ input, attention, panner }) => nodes.push(input, attention, panner));

  if (enableSpatialStudy) {
    [
      createTone(context, sources.a1.input, 73.42, 'triangle', 0.024),
      createTone(context, sources.radio.input, 174.61, 'sine', 0.012),
      createTone(context, sources.memorial.input, 146.83, 'sine', 0.018),
      createTone(context, sources.present.input, 220, 'sine', 0.012),
    ].forEach(({ oscillator, gain }) => {
      oscillators.push(oscillator);
      nodes.push(oscillator, gain);
    });
  }

  const introGain = context.createGain();
  introGain.gain.value = 0;
  introGain.connect(master);
  nodes.push(introGain);

  const connectBuffer = (buffer: AudioBuffer, destination: AudioNode, loop: boolean) => {
    if (disposed) return;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    source.connect(destination);
    source.start();
    buffers.push(source);
    nodes.push(source);
  };

  const loadConfiguredStems = async () => {
    const entries = Object.entries(slots) as [TemporalAudioSlotId, string | null][];
    await Promise.all(entries.map(async ([slot, url]) => {
      if (!url || disposed) return;
      try {
        const buffer = await decodeStem(context, url);
        if (slot === 'intro') connectBuffer(buffer, introGain, false);
        else connectBuffer(buffer, sources[slot].input, true);
      } catch {
        // A missing or undecodable optional stem is a safe silent slot. The
        // visual experience must remain usable and no fallback recording is substituted.
      }
    }));
  };

  const setListener = (yaw: number, pitch: number) => {
    const cosPitch = Math.cos(pitch);
    const forwardX = Math.sin(yaw) * cosPitch;
    const forwardY = Math.sin(pitch);
    const forwardZ = -Math.cos(yaw) * cosPitch;
    const listener = context.listener;
    const legacyListener = listener as unknown as {
      setOrientation?: (x: number, y: number, z: number, upX: number, upY: number, upZ: number) => void;
    };
    if ('forwardX' in listener) {
      listener.forwardX.setTargetAtTime(forwardX, context.currentTime, 0.035);
      listener.forwardY.setTargetAtTime(forwardY, context.currentTime, 0.035);
      listener.forwardZ.setTargetAtTime(forwardZ, context.currentTime, 0.035);
      listener.upX.setTargetAtTime(0, context.currentTime, 0.035);
      listener.upY.setTargetAtTime(1, context.currentTime, 0.035);
      listener.upZ.setTargetAtTime(0, context.currentTime, 0.035);
    } else {
      legacyListener.setOrientation?.(forwardX, forwardY, forwardZ, 0, 1, 0);
    }
  };

  const attentionFor = (yaw: number, sourceAngle: number) => {
    const delta = Math.atan2(Math.sin(yaw - sourceAngle), Math.cos(yaw - sourceAngle));
    return 0.1 + 0.9 * (1 - clamp(Math.abs(delta) / 1.15, 0, 1));
  };

  return {
    async start() {
      if (disposed) return;
      await context.resume();
      if (disposed) return;
      const now = context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(muted ? 0 : 0.34, now + 1.4);
      introGain.gain.setValueAtTime(0, now);
      introGain.gain.linearRampToValueAtTime(0.72, now + 1.2);
      introGain.gain.linearRampToValueAtTime(0, now + 12);
      void loadConfiguredStems();
    },
    updateView(yaw: number, pitch: number) {
      if (disposed) return;
      setListener(yaw, pitch);
      Object.values(sources).forEach((source) => {
        source.attention.gain.setTargetAtTime(attentionFor(yaw, source.angle), context.currentTime, 0.12);
      });
    },
    setMuted(nextMuted: boolean) {
      if (disposed) return;
      muted = nextMuted;
      master.gain.setTargetAtTime(nextMuted ? 0 : 0.34, context.currentTime, 0.12);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      oscillators.forEach((oscillator) => {
        try { oscillator.stop(); } catch { /* already stopped */ }
      });
      buffers.forEach((source) => {
        try { source.stop(); } catch { /* already stopped */ }
      });
      nodes.forEach((node) => {
        try { node.disconnect(); } catch { /* already disconnected */ }
      });
      void context.close();
    },
  };
};
