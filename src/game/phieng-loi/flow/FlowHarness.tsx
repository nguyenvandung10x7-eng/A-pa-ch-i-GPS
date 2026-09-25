import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type Phaser from 'phaser';
import { PhaserHost } from '../PhaserHost';
import type { FoundationHandle, FoundationStatus, SceneContext } from '../contracts';
import { createDiagnostics } from '../dev/FoundationProbe';
import { HeeSunReveal } from '../reveal/HeeSunReveal';
import { REVEAL_ASSETS, REVEAL_CONFIG } from '../reveal/config';
import { MangaViewer } from '../manga/MangaViewer';
import first from '../manga/assets/heesun-01.png';
import second from '../manga/assets/heesun-02.png';
import third from '../manga/assets/heesun-03.png';
import { PresentationFlow, type ChaseRequest, type Completion, type FlowSnapshot } from './PresentationFlow';
import './flow-harness.css';

const pages = [first, second, third] as const;
interface Binding {
  flow: PresentationFlow;
  reveal: HeeSunReveal;
  context: SceneContext;
  held: Completion[];
  hold: boolean;
  handoffs: { request: ChaseRequest; mangaCount: number; revealClean: boolean; paused: boolean }[];
}
interface DevApi {
  snapshot: () => unknown;
  inject: (event: Completion) => void;
  holdCompletions: (hold: boolean) => void;
  delivery: () => () => void;
}
declare global { interface Window { __HS_FLOW_DEV__?: DevApi } }

/** DEV only. The terminal handoff is a diagnostic request, never gameplay. */
export default function FlowHarness() {
  const [diagnostics] = useState(createDiagnostics);
  const [mounted, setMounted] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [fps, setFps] = useState(15);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<FlowSnapshot | null>(null);
  const [error, setError] = useState('');
  const handle = useRef<FoundationHandle | null>(null);
  const previousHandle = useRef<FoundationHandle | null>(null);
  const active = useRef<Binding | null>(null);
  const history = useRef(new Map<number, FlowSnapshot>());
  const reasons = useRef({ manual: false, hidden: document.hidden });

  const syncEnginePause = (): void => {
    const state = active.current?.flow.inspect();
    if (!state || !handle.current) return;
    // Engine hold in MANGA is not global UI pause. Viewer remains interactive.
    if (state.paused || state.phase !== 'REVEAL') handle.current.pause();
    else handle.current.resume();
  };
  const publish = (binding: Binding): void => {
    const state = binding.flow.inspect();
    history.current.set(state.sessionId, state);
    if (active.current === binding && binding.context.isCurrent()) {
      setView(state);
      syncEnginePause();
    }
  };
  const deliver = (binding: Binding, event: Completion): void => {
    if (binding.hold) binding.held.push(event);
    else binding.flow.receive(event);
  };
  const attachScene = (scene: Phaser.Scene, context: SceneContext): void => {
    if (!context.isCurrent()) return;
    const binding = {} as Binding;
    binding.context = context;
    binding.held = [];
    binding.hold = false;
    binding.handoffs = [];
    binding.flow = new PresentationFlow(context.sessionId, () => publish(binding), request => {
      // Diagnostic receiver only. There is deliberately no chase implementation.
      const reveal = binding.reveal.inspect();
      binding.handoffs.push({ request, mangaCount: document.querySelectorAll('.hs-manga-viewer').length,
        revealClean: reveal.rootCount === 0 && reveal.auraCount === 0 && reveal.sceneObjects === 0 && reveal.sceneTweens === 0,
        paused: binding.flow.inspect().paused });
    });
    binding.reveal = new HeeSunReveal(scene, { fps, x: 820, y: 630,
      onComplete: event => {
        const state = binding.reveal.inspect();
        deliver(binding, { ...event, flowSessionId: context.sessionId,
          clean: state.rootCount === 0 && state.auraCount === 0 && state.sceneObjects === 0 && state.sceneTweens === 0 });
      },
    });
    const stop = (): void => {
      scene.events.off('shutdown', stop);
      scene.events.off('destroy', stop);
      binding.held = [];
      binding.flow.dispose();
    };
    scene.events.once('shutdown', stop);
    scene.events.once('destroy', stop);
    active.current = binding;
    binding.flow.setPaused('manual', reasons.current.manual);
    binding.flow.setPaused('hidden', reasons.current.hidden);
    publish(binding);
  };
  const setPause = (reason: 'manual' | 'hidden', paused: boolean): void => {
    reasons.current[reason] = paused;
    active.current?.flow.setPaused(reason, paused);
  };

  useEffect(() => {
    const hidden = (): void => setPause('hidden', document.hidden);
    const pageHide = (): void => setPause('hidden', true);
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('pagehide', pageHide);
    window.addEventListener('pageshow', hidden);
    const api: DevApi = {
      snapshot: () => ({ flow: active.current?.flow.inspect() ?? null,
        reveal: active.current?.reveal.inspect() ?? null,
        runtime: (handle.current ?? previousHandle.current)?.inspect() ?? null,
        foundation: diagnostics, history: [...history.current.values()],
        mangaCount: document.querySelectorAll('.hs-manga-viewer').length,
        held: active.current?.held.length ?? 0, voice: REVEAL_CONFIG.voice,
        handoffs: active.current?.handoffs ?? [],
      }),
      inject: event => active.current?.flow.receive({ ...event, injected: true }),
      holdCompletions: hold => { if (active.current) active.current.hold = hold; },
      delivery: () => {
        const binding = active.current;
        // Capture a real completion now; QA may deliver it after cancel/re-entry.
        const held = binding?.held.splice(0) ?? [];
        if (binding) binding.hold = false;
        return () => {
          if (!binding) return;
          for (const event of held) binding.flow.receive(event);
        };
      },
    };
    window.__HS_FLOW_DEV__ = api;
    return () => {
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('pagehide', pageHide);
      window.removeEventListener('pageshow', hidden);
      if (window.__HS_FLOW_DEV__ === api) delete window.__HS_FLOW_DEV__;
      active.current?.flow.dispose();
      active.current?.reveal.dispose();
    };
    // This harness has one lifetime; active refs select its current engine/session.
  }, []);

  const start = (): void => {
    const binding = active.current;
    if (!ready || !binding || binding.flow.inspect().phase !== 'IDLE' || binding.flow.inspect().paused) return;
    handle.current?.resume();
    try {
      if (binding.reveal.play()) binding.flow.start(binding.reveal.inspect().runId);
    } catch (cause) {
      binding.flow.fail(cause instanceof Error ? cause.message : 'Reveal failed');
    }
  };
  const cancel = (): void => {
    active.current?.flow.cancel();
    active.current?.reveal.cancel();
    if (active.current) active.current.held = [];
  };
  const unmount = (): void => {
    cancel(); setReady(false); setMounted(false); void handle.current?.dispose();
  };
  const reenter = (): void => {
    cancel(); void handle.current?.dispose(); setReady(false); setView(null); setError('');
    setGeneration(value => value + 1); setMounted(true);
  };
  const onStatus = (status: FoundationStatus): void => {
    if (status.state === 'ready') { setReady(true); syncEnginePause(); }
    if (status.state === 'error') { setError(status.message ?? 'Engine failed'); setReady(false); }
  };
  const binding = active.current;
  return <>
    {mounted && <PhaserHost key={generation}
      options={{ manifest: REVEAL_ASSETS, dev: { diagnostics, renderer: 'auto', attachScene } }}
      onHandle={next => { handle.current = next; if (next) previousHandle.current = next; }} onStatus={onStatus} />}
    <div className="hs-flow-shell">
    <aside className="hs-flow-panel" data-testid="flow-harness">
      <strong>Task 03 · Reveal → Manga · DEV</strong>
      <p>F12: ACCEPTED_WITH_OWNER_WAIVER · Voice: unbound</p>
      <div className="hs-flow-controls">
        <button disabled={!ready || view?.phase !== 'IDLE' || view.paused} onClick={start}>Start flow</button>
        <button onClick={() => setPause('manual', true)}>Pause flow</button>
        <button onClick={() => setPause('manual', false)}>Resume flow</button>
        <button onClick={cancel}>Cancel flow</button>
        <button onClick={unmount}>Unmount flow</button>
        <button onClick={reenter}>Re-enter flow</button>
        <button disabled={view?.phase !== 'MANGA' || view.paused || Boolean(view.pending)}
          onClick={() => active.current?.flow.retryManga()}>Retry manga from page 1</button>
        <label>FPS next entry <select aria-label="Flow FPS" value={fps} onChange={event => setFps(Number(event.target.value))}>
          <option value={15}>15</option><option value={12}>12</option>
        </select></label>
        <Link to="/">Exit flow route</Link>
      </div>
      <p data-testid="flow-phase">{view?.phase ?? 'BOOTING'}</p>
      {view?.phase === 'HANDOFF' && <p data-testid="flow-handoff">chase_requested · handoff only · no chase consumer</p>}
      {error && <p role="alert">{error}</p>}
      <output data-testid="flow-state">{JSON.stringify(view)}</output>
    </aside>
    {view?.phase === 'MANGA' && binding && <MangaViewer key={`${view.sessionId}:${view.mangaRun}`}
      pages={pages} runId={view.mangaRun} paused={view.paused}
      onComplete={event => deliver(binding, { ...event, flowSessionId: binding.context.sessionId,
        clean: !document.querySelector('.hs-manga-viewer') })} />}
    </div>
  </>;
}
