# Task05 — explicit asset mapping

Source bytes and hashes are fixed by v0.5 §13. The original 1395×2048 PNG is not edited. Rectangles below bound the 25 isolated painted poses (alpha components), visually ordered left→right, then top→bottom. This is **not** a uniform 5×5 grid.

Coordinates are pixels in the original image; rectangle right/bottom are exclusive. Each local contact anchor is the bottom centre of its own rectangle, mapped to the actor world footpoint. Origin=(0.5,1), constant scale=0.30, 15 fps, repeat=0, skipMissedFrames=false. The 25th frame remains the exact same Sprite/frame/origin through idle, inverted MOVE and normal MOVE. No separate scarf or pumpkin sprites exist; both remain painted in every pose. The wake art relocates only behind black at the configured recovery position.

| Frame | x | y | Width | Height | Local anchor x,y |
|---|---:|---:|---:|---:|---|
| 0 · stand-00 | 47 | 153 | 232 | 236 | 116.0, 236 |
| 1 · stand-01 | 325 | 152 | 229 | 233 | 114.5, 233 |
| 2 · stand-02 | 604 | 150 | 227 | 233 | 113.5, 233 |
| 3 · stand-03 | 882 | 147 | 223 | 232 | 111.5, 232 |
| 4 · stand-04 | 1161 | 143 | 220 | 233 | 110.0, 233 |
| 5 · stand-05 | 46 | 548 | 218 | 235 | 109.0, 235 |
| 6 · stand-06 | 327 | 543 | 214 | 238 | 107.0, 238 |
| 7 · stand-07 | 607 | 540 | 212 | 239 | 106.0, 239 |
| 8 · stand-08 | 887 | 535 | 209 | 241 | 104.5, 241 |
| 9 · stand-09 | 1166 | 533 | 207 | 241 | 103.5, 241 |
| 10 · stand-10 | 49 | 941 | 203 | 240 | 101.5, 240 |
| 11 · stand-11 | 326 | 941 | 197 | 241 | 98.5, 241 |
| 12 · stand-12 | 604 | 941 | 183 | 243 | 91.5, 243 |
| 13 · stand-13 | 883 | 941 | 182 | 252 | 91.0, 252 |
| 14 · stand-14 | 1164 | 943 | 178 | 254 | 89.0, 254 |
| 15 · stand-15 | 54 | 1359 | 168 | 252 | 84.0, 252 |
| 16 · stand-16 | 339 | 1362 | 158 | 255 | 79.0, 255 |
| 17 · stand-17 | 627 | 1342 | 156 | 278 | 78.0, 278 |
| 18 · stand-18 | 910 | 1299 | 160 | 322 | 80.0, 322 |
| 19 · stand-19 | 1189 | 1276 | 159 | 345 | 79.5, 345 |
| 20 · stand-20 | 72 | 1666 | 153 | 365 | 76.5, 365 |
| 21 · stand-21 | 347 | 1652 | 150 | 379 | 75.0, 379 |
| 22 · stand-22 | 623 | 1643 | 147 | 401 | 73.5, 401 |
| 23 · stand-23 | 900 | 1640 | 146 | 407 | 73.0, 407 |
| 24 · stand-24 | 1176 | 1639 | 143 | 407 | 71.5, 407 |

The contact anchor is a runtime registration point, not a claim that the centre of every changing pose is an anatomical foot pixel. The lying-to-standing body motion belongs to the supplied artwork. QA should inspect the full runtime animation/video and the final animation→idle→MOVE transition, not infer visual approval from frame counters.

Audio: `blackout.wav` is the delivered `Task05_Blackout_3s.wav` byte-for-byte, PCM16 stereo24kHz,72000 samples,3s. Unity gain, no added fade/normalization. A real AudioBufferSourceNode `ended` event gates wake preparation; active timers never impersonate audio completion. `AudioContext.suspend()` freezes playback on manual/hidden pause. Per-source tokens change on stop/retry; the encounter/capture ID is retained.

Preload asset errors prevent Start. Re-enter creates a new clean session after correcting the source failure. A downstream error pauses the current transaction; retry never restarts reveal/chase or commits wallet twice. The DEV toolbar remains available outside the black game canvas for pause/retry/cancel; it is not narrative content or a Continue gate.

Asset existence/hash is not independent QA approval of runtime mapping. QA status: PENDING. F12: ACCEPTED_WITH_OWNER_WAIVER.
