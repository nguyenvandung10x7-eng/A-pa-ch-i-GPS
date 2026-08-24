import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Check, ChevronRight, Footprints, MapPin, Medal, Navigation, Route, Sparkles, X } from 'lucide-react';
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
  completedTaskIds: string[];
  language: LanguageCode;
  detailsOpen: boolean;
  isMutating: boolean;
  onOpenDetails: () => void;
  onCloseDetails: () => void;
  onStart: (taskIds?: string[]) => void;
  children: ReactNode;
};

type AtlasPlaceGroup = {
  id: string;
  tasks: ChallengeTask[];
  anchorTask: ChallengeTask;
};

const copy = {
  vi: {
    oneJourney: 'một hành trình',
    points: 'điểm',
    discoveries: 'khám phá',
    active: 'Điểm đến hiện tại',
    available: 'Khám phá đang mở',
    newJourney: 'Chuyến đi mới',
    radius: 'Bán kính',
    view: 'Xem địa điểm',
    openMap: 'Xem trên bản đồ',
    close: 'Đóng chi tiết địa điểm',
    details: 'Chi tiết địa điểm',
    westRoute: 'Hành trình phía Tây',
    atThisStop: 'khám phá tại đây',
    completed: 'Đã hoàn thành',
    startHere: 'Bắt đầu tại đây',
    replay: 'Chơi lại tại đây',
  },
  en: {
    oneJourney: 'one journey',
    points: 'points',
    discoveries: 'discoveries',
    active: 'Current destination',
    available: 'Open discovery',
    newJourney: 'New journey',
    radius: 'Radius',
    view: 'View place',
    openMap: 'View on map',
    close: 'Close place details',
    details: 'Place details',
    westRoute: 'Journey west',
    atThisStop: 'discoveries here',
    completed: 'Completed',
    startHere: 'Start here',
    replay: 'Play here again',
  },
} as const;

const PIN_COLORS = ['#f25643', '#f3aa20', '#6b70e8', '#10a997', '#a653ef'];

const CITY_ATLAS_BOUNDS = {
  north: 21.432,
  south: 21.374,
  west: 103.005,
  east: 103.071,
} as const;

const PLACE_NAMES: Partial<Record<string, Record<LanguageCode, string>>> = {
  'ban-phieng-loi-mthen': { vi: 'Bản Phiêng Lơi', en: 'Phiêng Lơi Village' },
  'quan-com-hung-ha-thuoc-lao-free': { vi: 'Quán cơm Hưng Hà', en: 'Hưng Hà Eatery' },
  'de-xe-may-ngoai-troi-qua-dem': { vi: 'Điểm hẹn ban đêm', en: 'Night rendezvous' },
  'nhin-xuong-long-chao-cua-chung-ta': { vi: 'Điểm ngắm lòng chảo', en: 'Valley viewpoint' },
  'tim-cay-xoai-co-thu': { vi: 'Cây xoài cổ thụ', en: 'Old mango tree' },
  'cho-muong-nhe-tang-banh-trung-thu': { vi: 'Chợ Mường Nhé', en: 'Mường Nhé Market' },
  'cau-ta-ko-khu-tang-banh-trung-thu': { vi: 'Cầu Tả Kó Khừ', en: 'Tả Kó Khừ Bridge' },
  'ban-a-pa-chai-tang-banh-trung-thu': { vi: 'A Pa Chải', en: 'A Pa Chải' },
  'cot-co-a-pa-chai-mthen': { vi: 'A Pa Chải', en: 'A Pa Chải' },
  'cot-co-a-pa-chai-trai-ban-lanh-lung': { vi: 'A Pa Chải', en: 'A Pa Chải' },
};

type PinLabelPlacement = 'left' | 'right' | 'top' | 'bottom';

const CITY_PIN_LABEL_PLACEMENTS: Partial<Record<string, PinLabelPlacement>> = {
  'ban-phieng-loi-mthen': 'right',
  'quan-com-hung-ha-thuoc-lao-free': 'left',
  'de-xe-may-ngoai-troi-qua-dem': 'top',
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
    x: 11 + Math.max(0, Math.min(1, longitudeRatio)) * 78,
    y: 35 + Math.max(0, Math.min(1, latitudeRatio)) * 32,
  };
};

const getPlaceGroups = (tasks: ChallengeTask[]) => {
  const groups = new Map<string, AtlasPlaceGroup>();
  tasks.forEach((task) => {
    const id = `${task.gps.lat.toFixed(6)},${task.gps.lng.toFixed(6)}`;
    const existing = groups.get(id);
    if (existing) {
      existing.tasks.push(task);
      return;
    }
    groups.set(id, { id, tasks: [task], anchorTask: task });
  });
  return [...groups.values()];
};

const groupContainsTask = (group: AtlasPlaceGroup, taskId?: string) => (
  Boolean(taskId && group.tasks.some((task) => task.id === taskId))
);

const shortPlaceName = (task: ChallengeTask, language: LanguageCode) => {
  const atlasPlaceName = PLACE_NAMES[task.id]?.[language];
  if (atlasPlaceName) return atlasPlaceName;
  const title = localize(task.title, language);
  return title.split(/\s+[–-]\s+/)[0]?.trim() || title;
};

const groupPlaceName = (group: AtlasPlaceGroup, language: LanguageCode) => {
  const aPaChaiTask = group.tasks.find((task) => task.id.includes('a-pa-chai'));
  return shortPlaceName(aPaChaiTask ?? group.anchorTask, language);
};

export const ExploreAtlas = ({
  tasks,
  progressTotal,
  activeTask,
  score,
  completedCount,
  completedTaskIds,
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
  const placeGroups = useMemo(() => getPlaceGroups(tasks), [tasks]);
  const cityGroups = useMemo(() => placeGroups.filter((group) => isWithinCityAtlas(group.anchorTask)), [placeGroups]);
  const westGroups = useMemo(() => placeGroups.filter((group) => !isWithinCityAtlas(group.anchorTask)), [placeGroups]);
  const westTaskCount = useMemo(() => westGroups.reduce((total, group) => total + group.tasks.length, 0), [westGroups]);
  const activeTaskId = activeTask?.id ?? '';
  const activeGroup = placeGroups.find((group) => groupContainsTask(group, activeTaskId));
  const completedTaskIdSet = useMemo(() => new Set(completedTaskIds), [completedTaskIds]);
  const [manualSelection, setManualSelection] = useState<{ activeTaskId: string; groupId: string } | null>(null);
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
      const focused = document.activeElement;
      if (event.shiftKey && (focused === first || !sheet.contains(focused))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (focused === last || !sheet.contains(focused))) {
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

  const selectedGroupId = manualSelection?.activeTaskId === activeTaskId
    && placeGroups.some((group) => group.id === manualSelection.groupId)
    ? manualSelection.groupId
    : activeGroup?.id ?? cityGroups[0]?.id ?? westGroups[0]?.id ?? '';
  const selectedGroup = placeGroups.find((group) => group.id === selectedGroupId) ?? activeGroup ?? placeGroups[0];
  const selectedIsActive = Boolean(selectedGroup && groupContainsTask(selectedGroup, activeTaskId));
  const selectedTask = selectedIsActive ? activeTask : selectedGroup?.anchorTask;
  const selectedIsWest = Boolean(selectedGroup && !isWithinCityAtlas(selectedGroup.anchorTask));
  const selectedGroupCount = selectedGroup?.tasks.length ?? 0;
  const selectedGroupCompletedCount = selectedGroup?.tasks.filter((task) => completedTaskIdSet.has(task.id)).length ?? 0;
  const selectedGroupIsComplete = selectedGroupCount > 0 && selectedGroupCompletedCount === selectedGroupCount;
  let actionLabel: string = c.openMap;
  if (!activeTask) actionLabel = selectedGroupIsComplete ? c.replay : c.startHere;
  else if (selectedIsActive) actionLabel = c.view;

  const selectGroup = (groupId: string) => {
    setManualSelection({ activeTaskId, groupId });
  };

  const handlePrimaryAction = () => {
    if (!activeTask) {
      onStart(selectedGroup?.tasks.map((task) => task.id));
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
            <small>{tasks.length} {c.discoveries}, {c.oneJourney}</small>
          </div>

          <div className="explore-atlas__stats" aria-label={`${score} ${c.points}, ${tasks.length} ${c.discoveries}`}>
            <span><Medal aria-hidden="true" /><b>{score.toLocaleString('vi-VN')}</b> {c.points}</span>
            <span><MapPin aria-hidden="true" /><b>{tasks.length}</b> {c.discoveries}</span>
          </div>
        </header>

        {westGroups.length ? (
          <section className="explore-atlas__west-route" aria-label={c.westRoute}>
            <header>
              <span><Route aria-hidden="true" /></span>
              <div><strong>{c.westRoute}</strong><small>{westTaskCount} {c.discoveries} · {westGroups.length} {language === 'vi' ? 'điểm dừng' : 'stops'}</small></div>
            </header>
            <div className="explore-atlas__west-stops">
              {westGroups.map((group, index) => {
                const selected = selectedGroup?.id === group.id;
                const isActive = groupContainsTask(group, activeTaskId);
                const imageTask = isActive ? activeTask ?? group.anchorTask : group.anchorTask;
                const groupCompletedCount = group.tasks.filter((task) => completedTaskIdSet.has(task.id)).length;
                const groupIsComplete = groupCompletedCount === group.tasks.length;
                return (
                  <button
                    key={group.id}
                    type="button"
                    className={`${selected ? 'is-selected' : ''} ${isActive ? 'is-active' : ''} ${groupIsComplete ? 'is-complete' : ''}`}
                    onClick={() => selectGroup(group.id)}
                    aria-pressed={selected}
                    style={{ '--route-color': PIN_COLORS[index % PIN_COLORS.length] } as CSSProperties}
                  >
                    <span className="explore-atlas__west-thumb">
                      {imageTask.image && !failedImageIds.has(imageTask.id)
                        ? <img src={imageTask.image} alt="" onError={() => markImageFailed(imageTask.id)} />
                        : <MapPin aria-hidden="true" />}
                    </span>
                    <span className="explore-atlas__west-copy">
                      <strong>{groupPlaceName(group, language)}</strong>
                      <small>{groupIsComplete ? c.completed : groupCompletedCount > 0 ? `${groupCompletedCount}/${group.tasks.length} ${c.completed.toLowerCase()}` : `${group.tasks.length} ${c.discoveries}`}</small>
                    </span>
                    {groupIsComplete
                      ? <b className="is-complete" aria-label={c.completed}><Check aria-hidden="true" /></b>
                      : group.tasks.length > 1 ? <b aria-label={`${group.tasks.length} ${c.atThisStop}`}>{groupCompletedCount > 0 ? `${groupCompletedCount}/${group.tasks.length}` : group.tasks.length}</b> : null}
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="explore-atlas__pins" aria-label={language === 'vi' ? 'Các khám phá trong thành phố' : 'City discoveries'}>
          {cityGroups.map((group, index) => {
            const selected = selectedGroup?.id === group.id;
            const isActive = groupContainsTask(group, activeTaskId);
            const imageTask = isActive ? activeTask ?? group.anchorTask : group.anchorTask;
            const groupCompletedCount = group.tasks.filter((task) => completedTaskIdSet.has(task.id)).length;
            const groupIsComplete = groupCompletedCount === group.tasks.length;
            const atlasPoint = projectTaskToAtlas(group.anchorTask);
            const labelPlacement = CITY_PIN_LABEL_PLACEMENTS[group.anchorTask.id] ?? (atlasPoint.x > 64 ? 'left' : 'right');
            return (
              <button
                key={group.id}
                type="button"
                className={`explore-atlas__pin is-label-${labelPlacement} ${selected ? 'is-selected' : ''} ${isActive ? 'is-active' : ''} ${groupIsComplete ? 'is-complete' : ''}`}
                style={{ left: `${atlasPoint.x}%`, top: `${atlasPoint.y}%`, '--pin-color': PIN_COLORS[index % PIN_COLORS.length] } as CSSProperties}
                onClick={() => selectGroup(group.id)}
                aria-pressed={selected}
                aria-label={groupPlaceName(group, language)}
              >
                <span className="explore-atlas__pin-drop">
                  <span className="explore-atlas__pin-photo">
                    {imageTask.image && !failedImageIds.has(imageTask.id)
                      ? <img src={imageTask.image} alt="" onError={() => markImageFailed(imageTask.id)} />
                      : <MapPin aria-hidden="true" />}
                  </span>
                </span>
                <strong>{groupPlaceName(group, language)}</strong>
                {groupIsComplete
                  ? <b className="explore-atlas__pin-status" aria-label={c.completed}><Check aria-hidden="true" /></b>
                  : group.tasks.length > 1 ? <b className="explore-atlas__pin-count">{groupCompletedCount > 0 ? `${groupCompletedCount}/${group.tasks.length}` : group.tasks.length}</b> : null}
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
            <span><MapPin aria-hidden="true" />{selectedIsActive ? c.active : selectedGroupIsComplete ? c.completed : !activeTask ? c.newJourney : selectedIsWest ? c.westRoute : c.available}</span>
            <h1>{selectedGroup ? groupPlaceName(selectedGroup, language) : (language === 'vi' ? 'Điện Biên đang chờ bạn' : 'Dien Bien awaits')}</h1>
            {selectedTask ? (
              <p>
                <Footprints aria-hidden="true" />
                {selectedGroupCount > 1 ? `${selectedGroupCount} ${c.discoveries} · ` : ''}{c.radius} {selectedTask.gps.radius} m
              </p>
            ) : <p>{language === 'vi' ? 'Nhận một địa điểm ngẫu nhiên để bắt đầu.' : 'Pick a random place to begin.'}</p>}
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
