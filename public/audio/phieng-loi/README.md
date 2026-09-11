# Phiêng Lơi voice asset slot

Supply the project-cleared human recording at exactly:

`public/audio/phieng-loi/pha-oi-human.mp3`

The recording should be a decisive Vietnamese “PHÀ ƠI!” call with a clean start,
minimal room noise, and enough headroom to avoid clipping. Runtime intentionally
provides no synthetic, oscillator, beep, or TTS substitute.

Before adding the binary, record the performer/creator, consent, source, licence
or commission terms, allowed public use, redistribution basis, and any edits in
`docs/audio-provenance.md`. Only use a recording the project has the right to ship.

The complete take list lives in
`docs/phieng-loi-audio-recording-library.md`. Additional takes go in the
`recordings/` directory with the exact manifest filenames. Mark a cue `ready` in
`src/experiences/phieng-loi/audioManifest.ts` only after all declared takes and
their provenance records are present; pending cues are not requested at runtime.
