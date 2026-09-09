// Original procedural sound study, not historical recordings. Replace/extend
// with rights-cleared user stems only after they have been supplied and audited.
export const createTemporalAudio = () => {
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);
  const buffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const sources: AudioBufferSourceNode[] = [];
  const nodes: AudioNode[] = [master];
  const layers = [-3, 3].map((x, i) => {
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = i === 0 ? 850 : 160;
    filter.Q.value = .6;
    const gain = context.createGain();
    gain.gain.value = .1;
    const pan = context.createPanner();
    pan.panningModel = 'HRTF';
    pan.distanceModel = 'inverse';
    pan.positionX.value = x;
    pan.positionZ.value = -2;
    source.connect(filter).connect(gain).connect(pan).connect(master);
    source.start();
    sources.push(source);
    nodes.push(source, filter, gain, pan);
    return { gain, pan };
  });
  let disposed = false;
  return {
    async start() {
      await context.resume();
      if (disposed) return;
      master.gain.setTargetAtTime(.35, context.currentTime, .3);
    },
    move(time: number, angle: number) {
      if (disposed) return;
      layers[0].gain.gain.setTargetAtTime(.06 + time * .22, context.currentTime, .1);
      layers[1].gain.gain.setTargetAtTime(.22 - time * .15, context.currentTime, .1);
      layers[0].pan.positionX.setTargetAtTime(-3 + angle * 3, context.currentTime, .1);
      layers[1].pan.positionX.setTargetAtTime(3 + angle * 3, context.currentTime, .1);
    },
    dispose() {
      disposed = true;
      sources.forEach((source) => source.stop());
      nodes.forEach((node) => node.disconnect());
      void context.close();
    },
  };
};
