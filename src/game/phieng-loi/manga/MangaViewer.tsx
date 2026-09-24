import { useEffect, useRef, useState } from 'react';
import './manga.css';

export type MangaCompletion = { type: 'manga_complete'; runId: number };
/** Presentation only. No story state, reveal subscription, simulation or Book writes. */
export function MangaViewer({ pages, runId, paused, onComplete }: {
  pages: readonly string[]; runId: number; paused: boolean;
  onComplete: (event: MangaCompletion) => void;
}) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [closed, setClosed] = useState(false);
  const completed = useRef(false);
  const changing = useRef(true);
  const callback = useRef(onComplete);
  callback.current = onComplete;
  const closeButton = useRef<HTMLButtonElement>(null);
  const previousButton = useRef<HTMLButtonElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const ready = !paused && !failed && loaded === pages[index];
  const final = index === pages.length - 1;

  // Completion follows DOM cleanup; the ref also guards React StrictMode replay.
  useEffect(() => {
    if (closed && !completed.current) {
      completed.current = true;
      callback.current({ type: 'manga_complete', runId });
    }
  }, [closed, runId]);
  useEffect(() => {
    if (ready) (final ? closeButton : nextButton).current?.focus();
  }, [ready, final]);
  if (closed) return null;
  return <section className="hs-manga-viewer" role="dialog" aria-modal="true" aria-label="Manga HeeSun"
    onKeyDown={(event) => {
      if (event.key !== 'Tab') return;
      const controls = [previousButton.current, nextButton.current, closeButton.current].filter(
        (button): button is HTMLButtonElement => Boolean(button && !button.disabled));
      if (!controls.length) return;
      event.preventDefault();
      const position = controls.indexOf(document.activeElement as HTMLButtonElement);
      controls[(position + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
    }}>
    <div className="hs-manga-art">
      <img key={pages[index]} src={pages[index]} alt={`Manga HeeSun — khung ${index + 1}`}
        onLoad={() => { changing.current = false; setLoaded(pages[index]); }} onError={() => setFailed(true)} />
    </div>
    <nav aria-label="Điều khiển manga">
      <button ref={previousButton} disabled={!ready || index === 0} onClick={() => {
        if (!ready || changing.current || index === 0) return;
        changing.current = true;
        setLoaded(null); setIndex((value) => Math.max(0, value - 1));
      }}>Khung trước</button>
      <span aria-live="polite">{index + 1} / {pages.length}</span>
      {!final ? <button ref={nextButton} disabled={!ready} onClick={() => {
        if (!ready || changing.current || final) return;
        changing.current = true;
        setLoaded(null); setIndex((value) => Math.min(pages.length - 1, value + 1));
      }}>Khung tiếp</button> : <button ref={closeButton} disabled={!ready} onClick={() => {
        if (ready && !completed.current) setClosed(true);
      }}>Đóng sau khi xem xong</button>}
      <span role="status">{failed ? 'Không tải được ảnh. Hãy mở lại màn xem.' : paused ? 'Đã tạm dừng' : loaded !== pages[index] ? 'Đang tải ảnh…' : ''}</span>
    </nav>
  </section>;
}
