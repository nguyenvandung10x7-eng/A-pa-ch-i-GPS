import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PhaserHost } from '../PhaserHost';
import type { FoundationHandle, FoundationStatus, SceneContext } from '../contracts';
import { createDiagnostics } from '../dev/FoundationProbe';
import { HeeSunReveal, type RevealCompletion } from './HeeSunReveal';
import { REVEAL_ASSETS, REVEAL_CONFIG } from './config';
import type Phaser from 'phaser';
import './reveal-harness.css';

/** Dev-only entry. React owns controls; Phaser owns all playback and effects. */
export default function RevealHarness() {
  const [diagnostics] = useState(createDiagnostics);
  const [mounted, setMounted] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [fps, setFps] = useState(REVEAL_CONFIG.fps.default_playtest);
  const [snapshot, setSnapshot] = useState('{}');
  const handle = useRef<FoundationHandle | null>(null);
  const previousHandle = useRef<FoundationHandle | null>(null);
  const reveal = useRef<HeeSunReveal | null>(null);
  const status = useRef<FoundationStatus | null>(null);
  const events = useRef<(RevealCompletion & { sessionId: number; clean: boolean })[]>([]);

  const attachScene = (scene: Phaser.Scene, context: SceneContext): void => {
    if (!context.isCurrent()) return;
    const controller = new HeeSunReveal(scene, {
      fps, x: 820, y: 630,
      onComplete: (event) => {
        if (!context.isCurrent()) return;
        const value = controller.inspect();
        events.current.push({ ...event, sessionId: context.sessionId,
          clean: value.rootCount === 0 && value.auraCount === 0 && value.sceneObjects === 0 && value.sceneTweens === 0 });
      },
    });
    reveal.current = controller;
  };
  const refresh = (): void => setSnapshot(JSON.stringify({
    foundation: diagnostics,
    runtime: (handle.current ?? previousHandle.current)?.inspect() ?? null,
    status: status.current,
    reveal: reveal.current?.inspect() ?? null,
    events: events.current,
  }));
  const reenter = (): void => {
    void handle.current?.dispose();
    setGeneration((value) => value + 1);
    setMounted(true);
  };

  return <>
    {mounted && <PhaserHost key={generation}
      options={{ manifest: REVEAL_ASSETS, dev: { diagnostics, renderer: 'auto', attachScene } }}
      onHandle={(next) => { handle.current = next; if (next) previousHandle.current = next; }}
      onStatus={(next) => { status.current = next; }} />}
    <aside className="pl-v2-dev-panel hs-reveal-panel" data-testid="reveal-harness">
      <strong>Task 01 · HeeSun reveal</strong>
      <p>Standalone · conditional · F12 Android pending</p>
      <div>
        <button onClick={() => reveal.current?.play()}>Play</button>
        <button onClick={() => handle.current?.pause()}>Pause</button>
        <button onClick={() => handle.current?.resume()}>Resume</button>
        <button onClick={() => reveal.current?.cancel()}>Cancel</button>
        <button onClick={refresh}>Snapshot</button>
        <button onClick={() => setMounted(false)}>Unmount</button>
        <button onClick={() => setMounted(true)}>Mount</button>
        <button onClick={reenter}>Re-enter now</button>
        <button onClick={() => handle.current?.restartScene()}>Restart scene</button>
      </div>
      <label>FPS (next mount) <select aria-label="FPS" value={fps} onChange={(event) => setFps(Number(event.target.value))}>
        <option value={15}>15 — pack default</option><option value={12}>12</option>
      </select></label>
      <p>Voice: unbound · RibbonFront: off · <Link to="/">Exit route</Link></p>
      <output data-testid="reveal-snapshot">{snapshot}</output>
    </aside>
  </>;
}
