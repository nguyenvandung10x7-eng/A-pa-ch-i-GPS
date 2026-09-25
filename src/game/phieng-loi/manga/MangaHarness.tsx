import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MangaViewer, type MangaCompletion } from './MangaViewer';
import first from './assets/heesun-01.png';
import second from './assets/heesun-02.png';
import third from './assets/heesun-03.png';

const pages = [first, second, third] as const;
/** DEV only. Manual pause and document visibility are independent pause reasons. */
export default function MangaHarness() {
  const [run, setRun] = useState(0);
  const [open, setOpen] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [events, setEvents] = useState<(MangaCompletion & { clean: boolean })[]>([]);
  const openButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!open) openButton.current?.focus(); }, [open]);
  useEffect(() => {
    const change = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  return <main className="hs-manga-harness" data-testid="manga-harness">
    <header>
      <strong>Task 02 · Manga HeeSun · DEV</strong>
      <span>SKIP ALL: CẦN CHỐT · thử độc lập</span>
      <button ref={openButton} disabled={open} onClick={() => { setRun((value) => value + 1); setManualPause(false); setOpen(true); }}>Mở manga</button>
      <button onClick={() => setManualPause(true)}>Pause</button>
      <button onClick={() => setManualPause(false)}>Resume</button>
      <button onClick={() => { setOpen(false); openButton.current?.focus(); }}>Unmount (cancel)</button>
      <Link to="/">Exit route</Link>
      <output data-testid="manga-events">{JSON.stringify(events)}</output>
    </header>
    {open && <MangaViewer key={run} pages={pages} runId={run} paused={manualPause || hidden}
      onComplete={(event) => {
        setEvents((value) => [...value, { ...event, clean: !document.querySelector('.hs-manga-viewer') }]);
        setOpen(false);
      }} />}
  </main>;
}
