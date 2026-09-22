import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PhaserHost } from '../PhaserHost';
import type { AssetManifest } from '../assets';
import type { FoundationHandle, FoundationStatus } from '../contracts';
import { createDiagnostics } from './FoundationProbe';

type Fixture = 'empty' | 'success' | 'error' | 'slow';

export default function FoundationHarness() {
  const [diagnostics] = useState(createDiagnostics);
  const [mounted, setMounted] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [renderCount, setRenderCount] = useState(0);
  const [fixture, setFixture] = useState<Fixture>('empty');
  const [renderer, setRenderer] = useState<'auto' | 'canvas'>('auto');
  const [snapshot, setSnapshot] = useState('{}');
  const [cycleState, setCycleState] = useState('idle');
  const handle = useRef<FoundationHandle | null>(null);
  const previousHandle = useRef<FoundationHandle | null>(null);
  const notifications = useRef<FoundationStatus[]>([]);
  const lastStatus = useRef<FoundationStatus | null>(null);
  const manifest: AssetManifest = fixture === 'empty' ? [] : [{
    key: 'pl:v2:fixture:probe', path: '__pl00_tests__/' + fixture + '.png',
  }];

  const refresh = (): void => {
    const current = handle.current ?? previousHandle.current;
    setSnapshot(JSON.stringify({
      ...diagnostics,
      sample: undefined,
      runtime: current?.inspect() ?? null,
      lastStatus: lastStatus.current,
      notifications: notifications.current,
      renderCount,
    }));
  };
  const observeStatus = (status: FoundationStatus): void => {
    lastStatus.current = status;
    notifications.current.push(status);
  };

  const disposeAndReenter = (): void => {
    setCycleState('destroy pending');
    const destruction = handle.current?.dispose() ?? Promise.resolve();
    // Remount immediately, without awaiting destruction, to exercise the barrier.
    setGeneration((value) => value + 1);
    setMounted(true);
    void destruction.then(() => setCycleState('destroy completed'));
  };

  return (
    <>
      {mounted && <PhaserHost
        key={generation}
        options={{ manifest, dev: { renderer, diagnostics } }}
        onHandle={(next) => {
          handle.current = next;
          if (next) previousHandle.current = next;
        }}
        onStatus={observeStatus}
      />}
      <aside className="pl-v2-dev-panel" data-testid="foundation-harness">
        <strong>PL-00 · Foundation harness</strong>
        <div>
          <button onClick={() => setMounted(true)}>Mount</button>
          <button onClick={() => setMounted(false)}>Unmount</button>
          <button onClick={disposeAndReenter}>Re-enter now</button>
          <button onClick={() => handle.current?.restartScene()}>Restart scene</button>
          <button onClick={() => handle.current?.pause()}>Pause</button>
          <button onClick={() => handle.current?.resume()}>Resume</button>
          <button onClick={() => setRenderCount((value) => value + 1)}>Rerender</button>
          <button onClick={refresh}>Snapshot</button>
        </div>
        <label>Fixture <select aria-label="Fixture" value={fixture}
          onChange={(event) => setFixture(event.target.value as Fixture)}>
          <option value="empty">empty</option><option value="success">success</option>
          <option value="error">error</option><option value="slow">slow</option>
        </select></label>
        <label>Renderer <select aria-label="Renderer" value={renderer}
          onChange={(event) => setRenderer(event.target.value as 'auto' | 'canvas')}>
          <option value="auto">AUTO</option><option value="canvas">Canvas probe</option>
        </select></label>
        <p>Selection applies on the next mount. Fixture URLs are supplied by browser tests.</p>
        <p>Lifecycle: {cycleState} · <Link to="/">Exit route</Link></p>
        <output data-testid="foundation-snapshot">{snapshot}</output>
      </aside>
    </>
  );
}
