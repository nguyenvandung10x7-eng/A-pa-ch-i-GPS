import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Check, ChevronRight, Footprints, MapPin, Medal, Navigation, Sparkles, Trophy, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LeaderboardDrawer } from './LeaderboardDrawer';
import { localize } from '../services/i18n';
import type { ChallengeTask, LanguageCode } from '../types/task';
import '../pages/explore-atlas.css';
import '../pages/leaderboard-drawer.css';

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
    places: 'địa danh',
    active: 'Điểm đến hiện tại',
    available: 'Khám phá đang mở',
    newJourney: 'Chuyến đi mới',
    radius: 'Bán kính',
    view: 'Xem địa điểm',
    openMap: 'Xem trên bản đồ',
    close: 'Đóng chi tiết địa điểm',
    details: 'Chi tiết địa điểm',
    westRoute: 'Hành trình phía Tây',
    westPlaces: 'địa danh phía Tây',
    leaderboard: 'Bảng xếp hạng',
    atThisStop: 'khám phá tại đây',
    completed: 'Đã hoàn thành',
    startHere: 'Bắt đầu tại đây',
    replay: 'Chơi lại tại đây',
  },
  en: {
    oneJourney: 'one journey',
    points: 'points',
    discoveries: 'discoveries',
    places: 'places',
    active: 'Current destination',
    available: 'Open discovery',
    newJourney: 'New journey',
    radius: 'Radius',
    view: 'View place',
    openMap: 'View on map',
    close: 'Close place details',
    details: 'Place details',
    westRoute: 'Journey west',
    westPlaces: 'places in the west',
    leaderboard: 'Leaderboard',
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
  west: 103.008,
  east: 103.071,
} as const;

// Keep the GPS layer inside the part of the illustrated atlas that remains
// readable above the destination card. The artwork is intentionally a
// diorama; these values, rather than painted landmarks, place task pins.
const CITY_ATLAS_FRAME = {
  left: 10,
  right: 90,
  top: 26,
  bottom: 60,
} as const;

const PLACE_NAMES: Partial<Record<string, Record<LanguageCode, string>>> = {
  'doi-a1-chuyen-tau-thoi-gian-1954': { vi: 'Đồi A1', en: 'A1 Hill' },
  'ban-phieng-loi-mthen': { vi: 'Bản Phiêng Lơi', en: 'Phiêng Lơi Village' },
  'thac-ke-nenh-mthen': { vi: 'Thác Kê Nênh', en: 'Kê Nênh Waterfall' },
  'quan-com-hung-ha-thuoc-lao-free': { vi: 'Quán cơm Hưng Hà', en: 'Hưng Hà Eatery' },
  'de-xe-may-ngoai-troi-qua-dem': { vi: 'Cứ Để Nó Ở Đó', en: 'Just Leave It There' },
  'nhin-xuong-long-chao-cua-chung-ta': { vi: 'Điểm ngắm lòng chảo', en: 'Valley viewpoint' },
  'tim-cay-xoai-co-thu': { vi: 'Cây xoài cổ thụ', en: 'Old mango tree' },
  'cho-muong-nhe-tang-banh-trung-thu': { vi: 'Chợ Mường Nhé', en: 'Mường Nhé Market' },
  'cau-ta-ko-khu-tang-banh-trung-thu': { vi: 'Cầu Tả Kó Khừ', en: 'Tả Kó Khừ Bridge' },
  'ban-a-pa-chai-tang-banh-trung-thu': { vi: 'A Pa Chải', en: 'A Pa Chải' },
  'cot-co-a-pa-chai-mthen': { vi: 'A Pa Chải', en: 'A Pa Chải' },
  'cot-co-a-pa-chai-trai-ban-lanh-lung': { vi: 'A Pa Chải', en: 'A Pa Chải' },
};

type PinLabelPlacement = 'left' | 'right' | 'top' | 'bottom';
type AtlasPinDepth = 'foreground' | 'midground' | 'background';

type AtlasPinPlacement = {
  x: number;
  y: number;
  depth: AtlasPinDepth;
  labelPlacement?: PinLabelPlacement;
};

const CITY_PIN_LABEL_PLACEMENTS: Partial<Record<string, PinLabelPlacement>> = {
  'doi-a1-chuyen-tau-thoi-gian-1954': 'bottom',
  'ban-phieng-loi-mthen': 'right',
  'thac-ke-nenh-mthen': 'top',
  'quan-com-hung-ha-thuoc-lao-free': 'bottom',
  'de-xe-may-ngoai-troi-qua-dem': 'top',
  'nhin-xuong-long-chao-cua-chung-ta': 'left',
  'tim-cay-xoai-co-thu': 'left',
};

const GROUP_LABEL_PRIORITY = [
  'thac-ke-nenh-mthen',
  'ban-a-pa-chai-tang-banh-trung-thu',
  'cot-co-a-pa-chai-mthen',
  'cot-co-a-pa-chai-trai-ban-lanh-lung',
] as const;

const CITY_VISUAL_PLACEMENTS: Partial<Record<string, AtlasPinPlacement>> = {
  'ca-phe-ke-nenh-cat-banh': { x: 87.8, y: 33.8, depth: 'midground', labelPlacement: 'left' },
  'ruong-bac-thang-ta-leng-mthen': { x: 87.8, y: 33.8, depth: 'midground', labelPlacement: 'left' },
  'thac-ke-nenh-mthen': { x: 87.8, y: 33.8, depth: 'midground', labelPlacement: 'left' },
  'nhin-xuong-long-chao-cua-chung-ta': { x: 74.4, y: 31.2, depth: 'midground', labelPlacement: 'left' },
  'tim-cay-xoai-co-thu': { x: 80.8, y: 42.2, depth: 'midground', labelPlacement: 'left' },
};

const WEST_VISUAL_PLACEMENTS: Partial<Record<string, AtlasPinPlacement>> = {
  'ban-a-pa-chai-tang-banh-trung-thu': { x: 35.8, y: 14.7, depth: 'background', labelPlacement: 'right' },
  'cot-co-a-pa-chai-mthen': { x: 35.8, y: 14.7, depth: 'background', labelPlacement: 'right' },
  'cot-co-a-pa-chai-trai-ban-lanh-lung': { x: 35.8, y: 14.7, depth: 'background', labelPlacement: 'right' },
  'cau-ta-ko-khu-tang-banh-trung-thu': { x: 49.2, y: 17.1, depth: 'background', labelPlacement: 'bottom' },
  'cho-muong-nhe-tang-banh-trung-thu': { x: 63.4, y: 19.5, depth: 'background', labelPlacement: 'left' },
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
    x: CITY_ATLAS_FRAME.left
      + Math.max(0, Math.min(1, longitudeRatio)) * (CITY_ATLAS_FRAME.right - CITY_ATLAS_FRAME.left),
    y: CITY_ATLAS_FRAME.top
      + Math.max(0, Math.min(1, latitudeRatio)) * (CITY_ATLAS_FRAME.bottom - CITY_ATLAS_FRAME.top),
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

const groupRepresentativeTask = (group: AtlasPlaceGroup) => {
  const aPaChaiTask = group.tasks.find((task) => task.id.includes('a-pa-chai'));
  const priorityTask = GROUP_LABEL_PRIORITY
    .map((taskId) => group.tasks.find((task) => task.id === taskId))
    .find((task): task is ChallengeTask => Boolean(task));
  return aPaChaiTask ?? priorityTask ?? group.anchorTask;
};

const groupPlaceName = (group: AtlasPlaceGroup, language: LanguageCode) => (
  shortPlaceName(groupRepresentativeTask(group), language)
);

const findPlacementOverride = (
  group: AtlasPlaceGroup,
  placements: Partial<Record<string, AtlasPinPlacement>>,
) => group.tasks
  .map((task) => placements[task.id])
  .find((placement): placement is AtlasPinPlacement => Boolean(placement));

const inferCityDepth = (y: number): AtlasPinDepth => (y < 44 ? 'midground' : 'foreground');

const getGroupAtlasPlacement = (group: AtlasPlaceGroup): AtlasPinPlacement => {
  if (!isWithinCityAtlas(group.anchorTask)) {
    return findPlacementOverride(group, WEST_VISUAL_PLACEMENTS) ?? { x: 56, y: 23, depth: 'background', labelPlacement: 'top' };
  }

  const base = projectTaskToAtlas(group.anchorTask);
  const override = findPlacementOverride(group, CITY_VISUAL_PLACEMENTS);
  return override ?? { ...base, depth: inferCityDepth(base.y) };
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
  const atlasGroups = useMemo(
    () => [...westGroups, ...cityGroups].sort((a, b) => getGroupAtlasPlacement(a).y - getGroupAtlasPlacement(b).y),
    [cityGroups, westGroups],
  );
  const activeTaskId = activeTask?.id ?? '';
  const activeGroup = placeGroups.find((group) => groupContainsTask(group, activeTaskId));
  const completedTaskIdSet = useMemo(() => new Set(completedTaskIds), [completedTaskIds]);
  const [manualSelection, setManualSelection] = useState<{ activeTaskId: string; groupId: string } | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(() => new Set());
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

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
    : activeGroup?.id
      ?? cityGroups.find((group) => groupContainsTask(group, 'ban-phieng-loi-mthen'))?.id
      ?? cityGroups[0]?.id
      ?? westGroups[0]?.id
      ?? '';
  const selectedGroup = placeGroups.find((group) => group.id === selectedGroupId) ?? activeGroup ?? placeGroups[0];
  const selectedIsActive = Boolean(selectedGroup && groupContainsTask(selectedGroup, activeTaskId));
  const selectedTask = selectedIsActive ? activeTask : selectedGroup ? groupRepresentativeTask(selectedGroup) : undefined;
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
          <button type="button" className="explore-atlas__avatar" onClick={() => setLeaderboardOpen(true)} aria-label={language === 'vi' ? 'Mở bảng xếp hạng' : 'Open leaderboard'}>
            <img src="/images/game-ui/explorer-avatar-v1.webp" alt="" />
            <span className="explore-atlas__avatar-rank" aria-hidden="true"><Trophy /><b>{c.leaderboard}</b></span>
          </button>

          <div className="explore-atlas__banner">
            <span aria-hidden="true">🇻🇳</span>
            <strong>BOOK OF DIEN BIEN</strong>
            <small>{placeGroups.length} {c.places} · {tasks.length} {c.discoveries}, {c.oneJourney}</small>
          </div>

          <div className="explore-atlas__stats" aria-label={`${score} ${c.points}, ${placeGroups.length} ${c.places}`}>
            <span><Medal aria-hidden="true" /><b>{score.toLocaleString('vi-VN')}</b> {c.points}</span>
            <span><MapPin aria-hidden="true" /><b>{placeGroups.length}</b> {c.places}</span>
          </div>
        </header>

        <section className="explore-atlas__pins" aria-label={language === 'vi' ? 'Các khám phá trên bản đồ' : 'Atlas discoveries'}>
          {atlasGroups.map((group, index) => {
            const selected = selectedGroup?.id === group.id;
            const isActive = groupContainsTask(group, activeTaskId);
            const imageTask = isActive ? activeTask ?? groupRepresentativeTask(group) : groupRepresentativeTask(group);
            const groupCompletedCount = group.tasks.filter((task) => completedTaskIdSet.has(task.id)).length;
            const groupIsComplete = groupCompletedCount === group.tasks.length;
            const atlasPoint = getGroupAtlasPlacement(group);
            const labelPlacement = atlasPoint.labelPlacement ?? CITY_PIN_LABEL_PLACEMENTS[group.anchorTask.id] ?? (atlasPoint.x > 64 ? 'left' : 'right');
            return (
              <button
                key={group.id}
                type="button"
                className={`explore-atlas__pin is-depth-${atlasPoint.depth} is-label-${labelPlacement} ${selected ? 'is-selected' : ''} ${isActive ? 'is-active' : ''} ${groupIsComplete ? 'is-complete' : ''}`}
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
              <div className="explore-atlas__nearby-meta">
                <span><Footprints aria-hidden="true" />{selectedGroupCount > 1 ? `${selectedGroupCount} ${c.discoveries} · ` : ''}{c.radius} {selectedTask.gps.radius} m</span>
                <span><Medal aria-hidden="true" />{selectedTask.points} {c.points}</span>
              </div>
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

      {leaderboardOpen ? <LeaderboardDrawer language={language} onClose={() => setLeaderboardOpen(false)} /> : null}
    </>
  );
};
