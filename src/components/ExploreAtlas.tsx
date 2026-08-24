import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ChevronRight, Footprints, MapPin, Medal, Navigation, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { localize } from '../services/i18n';
import type { ChallengeTask, LanguageCode } from '../types/task';
import '../pages/explore-atlas.css';

type ExploreAtlasProps = {
  tasks: ChallengeTask[];
  activeTask?: ChallengeTask;
  score: number;
  completedCount: number;
  language: LanguageCode;
  detailsOpen: boolean;
  isMutating: boolean;
  onOpenDetails: () => void;
  onCloseDetails: () => void;
  onStart: () => void;
  children: ReactNode;
};

const copy = {
  vi: {
    tagline: 'Chạm một dấu ghim để khám phá',
    points: 'điểm',
    places: 'địa danh',
    active: 'Điểm đến hiện tại',
    available: 'Địa danh đang mở',
    newJourney: 'Chuyến đi mới',
    radius: 'Bán kính',
    view: 'Xem địa điểm',
    openMap: 'Xem trên bản đồ',
    start: 'Bắt đầu khám phá',
    close: 'Đóng chi tiết địa điểm',
    details: 'Chi tiết địa điểm',
  },
  en: {
    tagline: 'Tap a pin to explore',
    points: 'points',
    places: 'places',
    active: 'Current destination',
    available: 'Open place',
    newJourney: 'New journey',
    radius: 'Radius',
    view: 'View place',
    openMap: 'View on map',
    start: 'Start exploring',
    close: 'Close place details',
    details: 'Place details',
  },
} as const;

const PIN_POSITIONS: CSSProperties[] = [
  { top: '22%', left: '7%' },
  { top: '28%', right: '7%' },
  { top: '39%', left: '13%' },
  { top: '43%', right: '9%' },
  { top: '54%', left: '19%' },
  { top: '57%', right: '17%' },
];

const PIN_COLORS = ['#f25643', '#f3aa20', '#6b70e8', '#10a997', '#a653ef', '#ef3e32'];

const getDistinctTasks = (tasks: ChallengeTask[]) => {
  const byLocation = new Map<string, ChallengeTask>();
  tasks.forEach((task) => {
    const key = `${task.gps.lat.toFixed(6)},${task.gps.lng.toFixed(6)}`;
    if (!byLocation.has(key)) byLocation.set(key, task);
  });
  return [...byLocation.values()];
};

const shortPlaceName = (task: ChallengeTask, language: LanguageCode) => {
  const title = localize(task.title, language);
  return title.split(/\s+[–-]\s+/)[0]?.trim() || title;
};

export const ExploreAtlas = ({
  tasks,
  activeTask,
  score,
  completedCount,
  language,
  detailsOpen,
  isMutating,
  onOpenDetails,
  onCloseDetails,
  onStart,
  children,
}: ExploreAtlasProps) => {
  const c = copy[language];
  const navigate = useNavigate();
  const sheetRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onCloseDetails);
  const distinctTasks = useMemo(() => getDistinctTasks(tasks), [tasks]);
  const displayTasks = useMemo(() => {
    if (!activeTask) return distinctTasks.slice(0, PIN_POSITIONS.length);
    return [activeTask, ...distinctTasks.filter((task) => task.id !== activeTask.id)].slice(0, PIN_POSITIONS.length);
  }, [activeTask, distinctTasks]);
  const [selectedTaskId, setSelectedTaskId] = useState(() => activeTask?.id ?? displayTasks[0]?.id ?? '');

  useEffect(() => {
    if (activeTask) setSelectedTaskId(activeTask.id);
    else if (!displayTasks.some((task) => task.id === selectedTaskId)) setSelectedTaskId(displayTasks[0]?.id ?? '');
  }, [activeTask, displayTasks, selectedTaskId]);

  useEffect(() => {
    closeRef.current = onCloseDetails;
  }, [onCloseDetails]);

  useEffect(() => {
    if (!detailsOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const sheet = sheetRef.current;
    document.body.style.overflow = 'hidden';
    sheet?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab' || !sheet) return;
      const focusable = [...sheet.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )].filter((element) => element.offsetParent !== null && element.getAttribute('aria-hidden') !== 'true');
      if (!focusable.length) {
        event.preventDefault();
        sheet.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !sheet.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !sheet.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [detailsOpen]);

  const selectedTask = displayTasks.find((task) => task.id === selectedTaskId) ?? activeTask ?? displayTasks[0];
  const selectedIsActive = Boolean(selectedTask && activeTask?.id === selectedTask.id);
  const actionLabel = !activeTask ? c.start : selectedIsActive ? c.view : c.openMap;

  const handlePrimaryAction = () => {
    if (!activeTask) {
      onStart();
      return;
    }
    if (selectedIsActive) {
      onOpenDetails();
      return;
    }
    void navigate('/map');
  };

  return (
    <>
      <main className="explore-atlas">
        <div className="explore-atlas__world" aria-hidden="true" />

        <header className="explore-atlas__hud">
          <button type="button" className="explore-atlas__avatar" onClick={() => { void navigate('/leaderboard'); }} aria-label={language === 'vi' ? 'Mở hành trình của bạn' : 'Open your journey'}>
            <img src="/images/game-ui/explorer-avatar-v1.webp" alt="" />
          </button>

          <div className="explore-atlas__banner">
            <span aria-hidden="true">🇻🇳</span>
            <strong>BOOK OF DIEN BIEN</strong>
            <small>{c.tagline}</small>
          </div>

          <div className="explore-atlas__stats" aria-label={`${score} ${c.points}, ${distinctTasks.length} ${c.places}`}>
            <span><Medal aria-hidden="true" /><b>{score.toLocaleString('vi-VN')}</b> {c.points}</span>
            <span><MapPin aria-hidden="true" /><b>{distinctTasks.length}</b> {c.places}</span>
          </div>
        </header>

        <section className="explore-atlas__pins" aria-label={language === 'vi' ? 'Các địa danh đang mở' : 'Open places'}>
          {displayTasks.map((task, index) => {
            const selected = selectedTask?.id === task.id;
            const isActive = activeTask?.id === task.id;
            return (
              <button
                key={task.id}
                type="button"
                className={`explore-atlas__pin ${selected ? 'is-selected' : ''} ${isActive ? 'is-active' : ''}`}
                style={{ ...PIN_POSITIONS[index], '--pin-color': PIN_COLORS[index] } as CSSProperties}
                onClick={() => setSelectedTaskId(task.id)}
                aria-pressed={selected}
              >
                <span className="explore-atlas__pin-drop">
                  <span className="explore-atlas__pin-photo"><img src={task.image} alt="" /></span>
                </span>
                <strong>{shortPlaceName(task, language)}</strong>
                {isActive ? <small><Sparkles aria-hidden="true" />{language === 'vi' ? 'Hiện tại' : 'Current'}</small> : null}
              </button>
            );
          })}
        </section>

        <div className="explore-atlas__compass" aria-hidden="true">
          <i>N</i><i>E</i><i>S</i><i>W</i><Navigation />
        </div>

        <section className="explore-atlas__nearby" aria-live="polite">
          <div className="explore-atlas__nearby-image">
            {selectedTask?.image ? <img src={selectedTask.image} alt="" /> : <Sparkles aria-hidden="true" />}
          </div>
          <div className="explore-atlas__nearby-copy">
            <span><MapPin aria-hidden="true" />{!activeTask ? c.newJourney : selectedIsActive ? c.active : c.available}</span>
            <h1>{selectedTask ? shortPlaceName(selectedTask, language) : (language === 'vi' ? 'Điện Biên đang chờ bạn' : 'Dien Bien awaits')}</h1>
            {selectedTask ? <p><Footprints aria-hidden="true" />{c.radius} {selectedTask.gps.radius} m</p> : <p>{language === 'vi' ? 'Nhận một địa điểm ngẫu nhiên để bắt đầu.' : 'Pick a random place to begin.'}</p>}
          </div>
          <button type="button" onClick={handlePrimaryAction} disabled={isMutating}>
            <span>{actionLabel}</span><ChevronRight aria-hidden="true" />
          </button>
          <div className="explore-atlas__progress" aria-label={`${completedCount} / ${tasks.length}`}>
            <i style={{ width: `${tasks.length ? Math.min(100, Math.round((completedCount / tasks.length) * 100)) : 0}%` }} />
          </div>
        </section>
      </main>

      {detailsOpen ? (
        <div className="explore-task-layer" role="presentation" onMouseDown={onCloseDetails}>
          <aside
            ref={sheetRef}
            className="explore-task-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={c.details}
            tabIndex={-1}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="explore-task-sheet__topbar">
              <span aria-hidden="true" />
              <strong>{c.details}</strong>
              <button type="button" onClick={onCloseDetails} aria-label={c.close}><X aria-hidden="true" /></button>
            </div>
            <div className="explore-task-sheet__content">{children}</div>
          </aside>
        </div>
      ) : null}
    </>
  );
};
