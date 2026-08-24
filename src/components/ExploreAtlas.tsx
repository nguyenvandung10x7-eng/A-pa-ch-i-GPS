import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ChevronRight, Footprints, MapPin, Medal, Navigation, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { localize } from '../services/i18n';
import type { ChallengeTask, LanguageCode } from '../types/task';
import '../pages/explore-atlas.css';

type ExploreAtlasProps = {
  tasks: ChallengeTask[];
  progressTotal: number;
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
    outsideAtlas: 'Ngoài khung thành phố',
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
    outsideAtlas: 'Outside the city atlas',
  },
} as const;

const PIN_COLORS = ['#f25643', '#f3aa20', '#6b70e8', '#10a997', '#a653ef', '#ef3e32', '#2f8dd9', '#e56b22', '#45a049', '#d84f92'];

const CITY_ATLAS_BOUNDS = {
  north: 21.432,
  south: 21.374,
  west: 103.005,
  east: 103.071,
} as const;

const CITY_PIN_TASK_IDS = [
  'ban-phieng-loi-mthen',
  'ho-huoi-pha-mthen',
  'cong-vien-noong-bua-mthen',
  'ca-phe-ke-nenh-cat-banh',
  'quang-truong-7-5-mthen',
  'doi-a1-chuyen-tau-thoi-gian-1954',
  'canh-dong-muong-thanh-cat-banh',
  'quan-com-hung-ha-thuoc-lao-free',
  'nhin-xuong-long-chao-cua-chung-ta',
  'tim-cay-xoai-co-thu',
] as const;

const CITY_PLACE_NAMES: Partial<Record<string, Record<LanguageCode, string>>> = {
  'ban-phieng-loi-mthen': { vi: 'Bản Phiêng Lơi', en: 'Phiêng Lơi Village' },
  'ho-huoi-pha-mthen': { vi: 'Hồ Huổi Phạ', en: 'Huổi Phạ Lake' },
  'cong-vien-noong-bua-mthen': { vi: 'Công viên Noong Bua', en: 'Noong Bua Park' },
  'ca-phe-ke-nenh-cat-banh': { vi: 'Cà phê Kê Nênh', en: 'Kê Nênh Café' },
  'quang-truong-7-5-mthen': { vi: 'Quảng trường 7-5', en: '7 May Square' },
  'doi-a1-chuyen-tau-thoi-gian-1954': { vi: 'Đồi A1', en: 'A1 Hill' },
  'canh-dong-muong-thanh-cat-banh': { vi: 'Cánh đồng Mường Thanh', en: 'Mường Thanh Field' },
  'quan-com-hung-ha-thuoc-lao-free': { vi: 'Quán cơm Hưng Hà', en: 'Hưng Hà Eatery' },
  'nhin-xuong-long-chao-cua-chung-ta': { vi: 'Điểm ngắm lòng chảo', en: 'Valley Viewpoint' },
  'tim-cay-xoai-co-thu': { vi: 'Cây xoài cổ thụ', en: 'Old Mango Tree' },
};

type PinLabelPlacement = 'left' | 'left-low' | 'right' | 'top' | 'bottom';

const CITY_PIN_LABEL_PLACEMENTS: Partial<Record<string, PinLabelPlacement>> = {
  'ban-phieng-loi-mthen': 'right',
  'ho-huoi-pha-mthen': 'right',
  'cong-vien-noong-bua-mthen': 'left',
  'ca-phe-ke-nenh-cat-banh': 'top',
  'quang-truong-7-5-mthen': 'left-low',
  'doi-a1-chuyen-tau-thoi-gian-1954': 'right',
  'canh-dong-muong-thanh-cat-banh': 'bottom',
  'quan-com-hung-ha-thuoc-lao-free': 'top',
  'nhin-xuong-long-chao-cua-chung-ta': 'left',
  'tim-cay-xoai-co-thu': 'left',
};

const isWithinCityAtlas = (task: ChallengeTask) => (
  task.gps.lat <= CITY_ATLAS_BOUNDS.north
  && task.gps.lat >= CITY_ATLAS_BOUNDS.south
  && task.gps.lng >= CITY_ATLAS_BOUNDS.west
  && task.gps.lng <= CITY_ATLAS_BOUNDS.east
);

const projectTaskToAtlas = (task: ChallengeTask) => {
  const longitudeRatio = (task.gps.lng - CITY_ATLAS_BOUNDS.west) / (CITY_ATLAS_BOUNDS.east - CITY_ATLAS_BOUNDS.west);
  const latitudeRatio = (CITY_ATLAS_BOUNDS.north - task.gps.lat) / (CITY_ATLAS_BOUNDS.north - CITY_ATLAS_BOUNDS.south);
  return {
    x: 10 + Math.max(0, Math.min(1, longitudeRatio)) * 80,
    y: 23 + Math.max(0, Math.min(1, latitudeRatio)) * 43,
  };
};

const getDistinctTasks = (tasks: ChallengeTask[]) => {
  const byLocation = new Map<string, ChallengeTask>();
  tasks.forEach((task) => {
    const key = `${task.gps.lat.toFixed(6)},${task.gps.lng.toFixed(6)}`;
    if (!byLocation.has(key)) byLocation.set(key, task);
  });
  return [...byLocation.values()];
};

const shortPlaceName = (task: ChallengeTask, language: LanguageCode) => {
  const atlasPlaceName = CITY_PLACE_NAMES[task.id]?.[language];
  if (atlasPlaceName) return atlasPlaceName;
  const title = localize(task.title, language);
  return title.split(/\s+[–-]\s+/)[0]?.trim() || title;
};

export const ExploreAtlas = ({
  tasks,
  progressTotal,
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
  const cityTasks = useMemo(() => {
    const cityById = new Map(distinctTasks.filter(isWithinCityAtlas).map((task) => [task.id, task]));
    const prioritized = CITY_PIN_TASK_IDS.flatMap((taskId) => {
      const task = cityById.get(taskId);
      return task ? [task] : [];
    });
    const remaining = [...cityById.values()].filter(
      (task) => !CITY_PIN_TASK_IDS.includes(task.id as typeof CITY_PIN_TASK_IDS[number]),
    );
    return [...prioritized, ...remaining].slice(0, PIN_COLORS.length);
  }, [distinctTasks]);
  const displayTasks = useMemo(() => {
    if (!activeTask || !isWithinCityAtlas(activeTask) || cityTasks.some((task) => task.id === activeTask.id)) return cityTasks;
    return [activeTask, ...cityTasks].slice(0, PIN_COLORS.length);
  }, [activeTask, cityTasks]);
  const [manualSelection, setManualSelection] = useState<{ activeTaskId: string; taskId: string } | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(() => new Set());

  const markImageFailed = (taskId: string) => {
    setFailedImageIds((current) => {
      if (current.has(taskId)) return current;
      const next = new Set(current);
      next.add(taskId);
      return next;
    });
  };

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

  const activeTaskId = activeTask?.id ?? '';
  const selectedTaskId = manualSelection?.activeTaskId === activeTaskId
    && displayTasks.some((task) => task.id === manualSelection.taskId)
    ? manualSelection.taskId
    : activeTaskId || displayTasks[0]?.id || '';
  const selectedTask = displayTasks.find((task) => task.id === selectedTaskId) ?? activeTask ?? displayTasks[0];
  const selectedIsActive = Boolean(selectedTask && activeTask?.id === selectedTask.id);
  const selectedOutsideAtlas = Boolean(selectedTask && !isWithinCityAtlas(selectedTask));
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
          <button type="button" className="explore-atlas__avatar" onClick={() => { void navigate('/leaderboard'); }} aria-label={language === 'vi' ? 'Mở bảng xếp hạng' : 'Open leaderboard'}>
            <img src="/images/game-ui/explorer-avatar-v1.webp" alt="" />
          </button>

          <div className="explore-atlas__banner">
            <span aria-hidden="true">🇻🇳</span>
            <strong>BOOK OF DIEN BIEN</strong>
            <small>{c.tagline}</small>
          </div>

          <div className="explore-atlas__stats" aria-label={`${score} ${c.points}, ${displayTasks.length} ${c.places}`}>
            <span><Medal aria-hidden="true" /><b>{score.toLocaleString('vi-VN')}</b> {c.points}</span>
            <span><MapPin aria-hidden="true" /><b>{displayTasks.length}</b> {c.places}</span>
          </div>
        </header>

        <section className="explore-atlas__pins" aria-label={language === 'vi' ? 'Các địa danh đang mở' : 'Open places'}>
          {displayTasks.map((task, index) => {
            const selected = selectedTask?.id === task.id;
            const isActive = activeTask?.id === task.id;
            const atlasPoint = projectTaskToAtlas(task);
            const labelPlacement = CITY_PIN_LABEL_PLACEMENTS[task.id] ?? (atlasPoint.x > 64 ? 'left' : 'right');
            return (
              <button
                key={task.id}
                type="button"
                className={`explore-atlas__pin is-label-${labelPlacement} ${selected ? 'is-selected' : ''} ${isActive ? 'is-active' : ''}`}
                style={{ left: `${atlasPoint.x}%`, top: `${atlasPoint.y}%`, '--pin-color': PIN_COLORS[index] } as CSSProperties}
                onClick={() => setManualSelection({ activeTaskId, taskId: task.id })}
                aria-pressed={selected}
                aria-label={shortPlaceName(task, language)}
              >
                <span className="explore-atlas__pin-drop">
                  <span className="explore-atlas__pin-photo">
                    {task.image && !failedImageIds.has(task.id)
                      ? <img src={task.image} alt="" onError={() => markImageFailed(task.id)} />
                      : <MapPin aria-hidden="true" />}
                  </span>
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
            {selectedTask?.image && !failedImageIds.has(selectedTask.id)
              ? <img src={selectedTask.image} alt="" onError={() => markImageFailed(selectedTask.id)} />
              : <Sparkles aria-hidden="true" />}
          </div>
          <div className="explore-atlas__nearby-copy">
            <span><MapPin aria-hidden="true" />{selectedOutsideAtlas ? c.outsideAtlas : !activeTask ? c.newJourney : selectedIsActive ? c.active : c.available}</span>
            <h1>{selectedTask ? shortPlaceName(selectedTask, language) : (language === 'vi' ? 'Điện Biên đang chờ bạn' : 'Dien Bien awaits')}</h1>
            {selectedTask ? <p><Footprints aria-hidden="true" />{c.radius} {selectedTask.gps.radius} m</p> : <p>{language === 'vi' ? 'Nhận một địa điểm ngẫu nhiên để bắt đầu.' : 'Pick a random place to begin.'}</p>}
          </div>
          <button type="button" onClick={handlePrimaryAction} disabled={isMutating}>
            <span>{actionLabel}</span><ChevronRight aria-hidden="true" />
          </button>
          <div className="explore-atlas__progress" aria-label={`${completedCount} / ${progressTotal}`}>
            <i style={{ width: `${progressTotal ? Math.min(100, Math.round((completedCount / progressTotal) * 100)) : 0}%` }} />
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
