export type FlowPhase = 'IDLE' | 'REVEAL' | 'MANGA' | 'HANDOFF' | 'CANCELLED' | 'ERROR' | 'DISPOSED';
export type PauseReason = 'manual' | 'hidden';
export type CompletionKind = 'reveal_complete' | 'manga_complete';
export interface ChaseRequest {
  type: 'chase_requested';
  flowSessionId: number;
  mangaRunId: number;
}
export interface Completion {
  type: CompletionKind;
  flowSessionId: number;
  runId: number;
  clean: boolean;
  injected?: boolean;
}
export interface FlowEvent {
  seq: number;
  kind: string;
  phase: FlowPhase;
  flowSessionId: number;
  runId?: number;
  page?: number;
  reason?: string;
  clean?: boolean;
  injected?: boolean;
}

/** Presentation handoff only: no world, story flags, persistence or consumer. */
export class PresentationFlow {
  private phase: FlowPhase = 'IDLE';
  private reasons = new Set<PauseReason>();
  private revealRun = 0;
  private mangaRun = 0;
  private requests = 0;
  private pending: Completion | null = null;
  private events: FlowEvent[] = [];

  constructor(readonly sessionId: number, private readonly changed: () => void,
    private readonly onChaseRequested: (request: ChaseRequest) => void) {}

  private log(kind: string, extra: Partial<FlowEvent> = {}): void {
    this.events.push({ ...extra, seq: this.events.length + 1, kind, phase: this.phase, flowSessionId: this.sessionId });
  }

  start(revealRun: number): boolean {
    if (this.phase !== 'IDLE' || this.reasons.size) return false;
    this.revealRun = revealRun;
    this.phase = 'REVEAL';
    this.log('flow_started');
    this.log('reveal_started', { runId: revealRun });
    this.changed();
    return true;
  }

  receive(event: Completion): void {
    const expectedPhase = event.type === 'reveal_complete' ? 'REVEAL' : 'MANGA';
    const expectedRun = event.type === 'reveal_complete' ? this.revealRun : this.mangaRun;
    const reason = event.flowSessionId !== this.sessionId ? 'session'
      : this.phase !== expectedPhase ? 'phase'
      : event.runId !== expectedRun ? 'run'
      : this.pending ? 'duplicate_pending'
      : !event.clean ? 'cleanup' : null;
    if (reason) {
      this.log('callback_rejected', { reason, runId: event.runId, injected: event.injected ?? false });
      this.changed();
      return;
    }
    this.log(event.type === 'reveal_complete' ? 'reveal_cleanup' : 'manga_cleanup',
      { runId: event.runId, clean: true, injected: event.injected ?? false });
    this.log(event.type + '_accepted', { runId: event.runId, injected: event.injected ?? false });
    this.pending = event;
    this.drain();
    this.changed();
  }

  private drain(): void {
    if (this.reasons.size || !this.pending) return;
    const event = this.pending;
    this.pending = null;
    if (event.type === 'reveal_complete') {
      this.phase = 'MANGA';
      this.mangaRun += 1;
      this.log('manga_opened', { runId: this.mangaRun, page: 1 });
    } else {
      this.phase = 'HANDOFF';
      this.requests += 1;
      this.log('chase_requested', { runId: this.mangaRun });
      this.onChaseRequested({ type: 'chase_requested', flowSessionId: this.sessionId, mangaRunId: this.mangaRun });
    }
  }

  setPaused(reason: PauseReason, paused: boolean): void {
    if (this.phase === 'DISPOSED' || this.reasons.has(reason) === paused) return;
    if (paused) this.reasons.add(reason);
    else this.reasons.delete(reason);
    this.log(paused ? 'pause_added' : 'pause_removed', { reason });
    this.drain();
    this.changed();
  }

  retryManga(): boolean {
    if (this.phase !== 'MANGA' || this.reasons.size || this.pending) return false;
    this.log('manga_retry', { runId: this.mangaRun });
    this.mangaRun += 1;
    this.log('manga_opened', { runId: this.mangaRun, page: 1 });
    this.changed();
    return true;
  }

  cancel(): void {
    if (this.phase === 'CANCELLED' || this.phase === 'DISPOSED') return;
    this.pending = null;
    this.phase = 'CANCELLED';
    this.log('flow_cancelled');
    this.changed();
  }

  fail(message: string): void {
    if (this.phase === 'DISPOSED' || this.phase === 'CANCELLED') return;
    this.pending = null;
    this.phase = 'ERROR';
    this.log('flow_error', { reason: message });
    this.changed();
  }

  dispose(): void {
    if (this.phase === 'DISPOSED') return;
    this.pending = null;
    this.phase = 'DISPOSED';
    this.log('flow_disposed');
    this.changed();
  }

  inspect() {
    return { sessionId: this.sessionId, phase: this.phase, paused: this.reasons.size > 0,
      reasons: [...this.reasons], revealRun: this.revealRun, mangaRun: this.mangaRun,
      chaseRequests: this.requests, pending: this.pending ? { ...this.pending } : null,
      events: this.events.map(event => ({ ...event })) };
  }
}

export type FlowSnapshot = ReturnType<PresentationFlow['inspect']>;
