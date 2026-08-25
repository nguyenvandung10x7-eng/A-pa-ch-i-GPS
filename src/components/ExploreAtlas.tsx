import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Backpack, BookOpen, Check, ChevronRight, Compass, Images, Map as MapIcon, MapPin, Medal, Navigation, Sparkles, Trophy, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { localize } from '../services/i18n';
import type { ChallengeTask, LanguageCode } from '../types/task';
import '../pages/explore-atlas.css';
import '../pages/explore-atlas-game-menu.css';

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
    points: 'điểm',
    discoveries: 'khám phá',
    active: 'Điểm đến hiện tại',
    newJourney: 'Chuyến đi mới',
    radius: 'Bán kính',
    view: 'Xem địa điểm',
    openMap: 'Mở bản đồ',
    close: 'Đóng chi tiết địa điểm',
    details: 'Chi tiết địa điểm',
    westRoute: 'Hành trình phía Tây',
    atThisStop: 'khám phá tại đây',
    completed: 'Đã hoàn thành',
    startHere: 'Bắt đầu',
    replay: 'Chơi lại',
    tagline: 'HÀNH TRÌNH · KÝ ỨC · TỰ HÀO',
    exploreTitle: 'KHÁM PHÁ',
    exploreBody: 'Câu chuyện, địa danh và trải nghiệm Điện Biên',
    mapTitle: 'BẢN ĐỒ',
    mapBody: 'Khám phá Điện Biên trên bản đồ tương tác',
    bookTitle: 'CUỐN SÁCH',
    bookBody: 'Đọc, lưu giữ và tiếp tục những câu chuyện',
    collection: 'BỘ SƯU TẬP CỦA BẠN',
    chapters: 'ĐÃ ĐI',
    places: 'ĐỊA DANH',
    discoveryPoints: 'ĐIỂM KHÁM PHÁ',
    missions: 'NHIỆM VỤ',
    achievements: 'THÀNH TÍCH',
    treasure: 'KHO BÁU',
    stories: 'CUỐN SÁCH',
    begin: 'BẮT ĐẦU HÀNH TRÌNH',
  },
  en: {
    points: 'points',
    discoveries: 'discoveries',
    active: 'Current destination',
    newJourney: 'New journey',
    radius: 'Radius',
    view: 'View place',
    openMap: 'Open map',
    close: 'Close place details',
    details: 'Place details',
    westRoute: 'Journey west',
    atThisStop: 'discoveries here',
    completed: 'Completed',
    startHere: 'Start',
    replay: 'Replay',
    tagline: 'JOURNEY · MEMORY · PRIDE',
    exploreTitle: 'EXPLORE',
    exploreBody: 'Stories, places and experiences across Dien Bien',
    mapTitle: 'MAP',
    mapBody: 'Explore Dien Bien on the interactive map',
    bookTitle: 'THE BOOK',
    bookBody: 'Read, keep and continue the stories',
    collection: 'YOUR COLLECTION',
    chapters: 'DONE',
    places: 'PLACES',
    discoveryPoints: 'DISCOVERY POINTS',
    missions: 'MISSIONS',
    achievements: 'ACHIEVEMENTS',
    treasure: 'TREASURE',
    stories: 'THE BOOK',
    begin: 'START THE JOURNEY',
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
  'doi-a1-chuyen-tau-thoi-gian-1954': { vi: 'Đồi A1', en: 'A1 Hill' },
  'ban-phieng-loi-mthen': { vi: 'Bản Phiêng Lơi', en: 'Phiêng Lơi Village' },
  'thac-ke-nenh-mthen': { vi: 'Thác Kê Nênh', en: 'Kê Nênh Waterfall' },
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
  'doi-a1-chuyen-tau-thoi-gian-1954': 'bottom',
  'ban-phieng-loi-mthen': 'right',
  'thac-ke-nenh-mthen': 'top',
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
    y: 27 + Math.max(0, Math.min(1, latitudeRatio)) * 27,
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
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
  const selectedTask = selectedIsActive ? activeTask : selectedGroup?.anchorTask;
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

  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const selectedPlaceName = selectedGroup ? groupPlaceName(selectedGroup, language) : c.newJourney;
  const selectedMeta = selectedTask
    ? `${selectedPlaceName} · ${c.radius} ${selectedTask.gps.radius} m`
    : c.exploreBody;

  return (
    <>
      <main className="explore-atlas explore-atlas--game-menu">
        <div className="explore-atlas__world" aria-hidden="true" />

        <header className="explore-game-hero">
          <button
            type="button"
            className="explore-game-hero__compass"
            onClick={() => { void navigate('/leaderboard'); }}
            aria-label={language === 'vi' ? 'Mở thành tích' : 'Open achievements'}
          >
            <Compass aria-hidden="true" />
          </button>
          <div className="explore-game-title" aria-label="Book of Dien Bien">
            <span>BOOK OF</span>
            <h1>DIEN BIEN</h1>
            <small>{c.tagline}</small>
          </div>
        </header>

        <section className="explore-atlas__pins explore-game-map" aria-label={language === 'vi' ? 'Các địa điểm trên atlas' : 'Places on the atlas'}>
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

        {westGroups.length ? (
          <div className="explore-game-west" aria-label={c.westRoute}>
            {westGroups.map((group) => {
              const selected = selectedGroup?.id === group.id;
              const complete = group.tasks.every((task) => completedTaskIdSet.has(task.id));
              return (
                <button
                  key={group.id}
                  type="button"
                  className={`${selected ? 'is-selected' : ''} ${complete ? 'is-complete' : ''}`}
                  onClick={() => selectGroup(group.id)}
                  aria-pressed={selected}
                >
                  <MapPin aria-hidden="true" />
                  <span>{groupPlaceName(group, language)}</span>
                  {group.tasks.length > 1 ? <b>{group.tasks.length}</b> : null}
                </button>
              );
            })}
          </div>
        ) : null}

        <section className="explore-game-menu" aria-label={language === 'vi' ? 'Menu chính' : 'Main menu'}>
          <button type="button" className="explore-game-card explore-game-card--explore" onClick={handlePrimaryAction} disabled={isMutating}>
            <span className="explore-game-card__badge">{tasks.length}</span>
            <span className="explore-game-card__icon"><Compass aria-hidden="true" /></span>
            <span className="explore-game-card__copy">
              <strong>{c.exploreTitle}</strong>
              <small>{selectedMeta}</small>
            </span>
            <span className="explore-game-card__cta">{actionLabel}<ChevronRight aria-hidden="true" /></span>
          </button>

          <button type="button" className="explore-game-card explore-game-card--map" onClick={() => { void navigate('/map'); }}>
            <span className="explore-game-card__icon"><MapIcon aria-hidden="true" /></span>
            <span className="explore-game-card__copy">
              <strong>{c.mapTitle}</strong>
              <small>{c.mapBody}</small>
            </span>
            <span className="explore-game-card__cta">{c.openMap}<ChevronRight aria-hidden="true" /></span>
          </button>

          <button type="button" className="explore-game-card explore-game-card--book" onClick={() => { void navigate('/book'); }}>
            <span className="explore-game-card__badge">13</span>
            <span className="explore-game-card__icon"><BookOpen aria-hidden="true" /></span>
            <span className="explore-game-card__copy">
              <strong>{c.bookTitle}</strong>
              <small>{c.bookBody}</small>
            </span>
            <span className="explore-game-card__cta">{language === 'vi' ? 'Mở sách' : 'Open book'}<ChevronRight aria-hidden="true" /></span>
          </button>
        </section>

        <section className="explore-game-collection" aria-label={c.collection}>
          <strong>{c.collection}</strong>
          <div>
            <span><Trophy aria-hidden="true" /><small>{c.chapters}</small><b>{completedCount}/{progressTotal}</b></span>
            <span><Images aria-hidden="true" /><small>{c.places}</small><b>{placeGroups.length}</b></span>
            <span><Medal aria-hidden="true" /><small>{c.discoveryPoints}</small><b>{score.toLocaleString(locale)}</b></span>
          </div>
        </section>

        <nav className="explore-game-dock" aria-label={language === 'vi' ? 'Điều hướng hành trình' : 'Journey navigation'}>
          <button type="button" className="is-active" onClick={() => { void navigate('/challenge'); }}>
            <Backpack aria-hidden="true" /><span>{c.missions}</span>
          </button>
          <button type="button" onClick={() => { void navigate('/leaderboard'); }}>
            <Trophy aria-hidden="true" /><span>{c.achievements}</span>
          </button>
          <button type="button" className="explore-game-dock__primary" onClick={handlePrimaryAction} disabled={isMutating}>
            <Navigation aria-hidden="true" /><span>{c.begin}</span>
          </button>
          <button type="button" onClick={() => { void navigate('/saved'); }}>
            <Images aria-hidden="true" /><span>{c.treasure}</span>
          </button>
          <button type="button" onClick={() => { void navigate('/book'); }}>
            <BookOpen aria-hidden="true" /><span>{c.stories}</span>
          </button>
        </nav>
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