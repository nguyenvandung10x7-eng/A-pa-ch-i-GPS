import { ArrowUpRight, Check, Crosshair, LockKeyhole, MapPin, MapPinned, Navigation } from 'lucide-react';
import { localize } from '../services/i18n';
import type { ChallengeTask, LanguageCode } from '../types/task';
import { ChallengeLeaderboardPreview } from './ChallengeLeaderboardPreview';

type ChallengeLevelOneMenuProps = {
  tasks: ChallengeTask[];
  lockedTasks: ChallengeTask[];
  completedTaskIds: string[];
  activeTaskId?: string;
  isMutating: boolean;
  language: LanguageCode;
  onChoose: (taskId: string) => void;
  onOpenMap?: () => void;
};

const copy = {
  vi: {
    eyebrow: 'BOOK OF DIEN BIEN · PLAY MODE',
    level: 'LEVEL 01',
    title: 'Đủ ngầu thì vào cuộc.',
    prompt: 'Bật chế độ chơi. Hoàn thành thử thách mở màn để mở toàn bộ hành trình.',
    choose: 'Thử thách mở màn',
    chooseHint: 'Hoàn thành thử thách này để mở Level 2.',
    open: 'Nhận thử thách',
    continue: 'Tiếp tục',
    completed: 'Đã xong',
    mapKicker: 'RADAR GPS',
    mapTitle: 'Bản đồ nằm riêng, nhìn sẽ sạch hơn.',
    mapHint: 'Điểm mở màn: {{place}}. Bật vị trí trong Bản đồ để xem chúng ta đang cách đó bao xa.',
    mapAction: 'Mở bản đồ',
    locked: 'LEVEL 02 · ĐANG KHÓA',
    moreLocked: 'Qua màn mở đầu để mở toàn bộ hành trình',
  },
  en: {
    eyebrow: 'BOOK OF DIEN BIEN · PLAY MODE',
    level: 'LEVEL 01',
    title: 'Cool enough? Step in.',
    prompt: 'Switch on play mode. Clear the opening challenge to unlock the full journey.',
    choose: 'Opening challenge',
    chooseHint: 'Complete this challenge to unlock Level 2.',
    open: 'Take challenge',
    continue: 'Continue',
    completed: 'Done',
    mapKicker: 'GPS RADAR',
    mapTitle: 'The map lives separately, so the menu stays clean.',
    mapHint: 'Opening point: {{place}}. Turn on location in Map to see how far away we are.',
    mapAction: 'Open map',
    locked: 'LEVEL 02 · LOCKED',
    moreLocked: 'Clear the opening move to unlock the full journey',
  },
} as const;

const splitTitle = (task: ChallengeTask, language: LanguageCode) => {
  const fullTitle = localize(task.title, language);
  const [place, ...rest] = fullTitle.split(/\s+[–-]\s+/);
  return { place: place || fullTitle, invitation: rest.join(' – ') || fullTitle };
};

export const ChallengeLevelOneMenu = ({
  tasks,
  lockedTasks,
  completedTaskIds,
  activeTaskId,
  isMutating,
  language,
  onChoose,
  onOpenMap,
}: ChallengeLevelOneMenuProps) => {
  const c = copy[language];
  const completedTaskIdSet = new Set(completedTaskIds);
  const previewTask = tasks.find((candidate) => candidate.id === activeTaskId) ?? tasks[0];
  const previewTitle = previewTask ? splitTitle(previewTask, language) : null;

  return (
    <div className="challenge-level-one">
      <header className="challenge-level-one__intro">
        <div className="challenge-level-one__topline">
          <div className="challenge-level-one__eyebrow"><Crosshair aria-hidden="true" />{c.eyebrow}</div>
          <span className="challenge-level-one__badge">{c.level}</span>
        </div>
        <span className="challenge-level-one__level-mark" aria-hidden="true">01</span>
        <h1>{c.title}</h1>
        <p>{c.prompt}</p>
      </header>

      {previewTask && previewTitle ? (
        <section className="challenge-level-one__map-peek" aria-labelledby="challenge-level-one-map-title">
          <div className="challenge-level-one__map-peek-visual" aria-hidden="true">
            <span className="challenge-level-one__map-peek-route" />
            <span className="challenge-level-one__map-peek-user"><Crosshair /></span>
            <span className="challenge-level-one__map-peek-pin">
              {previewTask.image ? <img src={previewTask.image} alt="" /> : <MapPin />}
            </span>
          </div>
          <div className="challenge-level-one__map-peek-copy">
            <small><MapPinned aria-hidden="true" />{c.mapKicker}</small>
            <h2 id="challenge-level-one-map-title">{c.mapTitle}</h2>
            <p>{c.mapHint.replace('{{place}}', previewTitle.place)}</p>
          </div>
          <button type="button" onClick={onOpenMap} disabled={!onOpenMap}>
            <span>{c.mapAction}</span>
            <Navigation aria-hidden="true" />
          </button>
        </section>
      ) : null}

      <section className="challenge-level-one__choices" aria-labelledby="challenge-level-one-title">
        <header>
          <h2 id="challenge-level-one-title">{c.choose}</h2>
          <p>{c.chooseHint}</p>
        </header>
        <div className={`challenge-level-one__grid ${tasks.length === 1 ? 'is-single' : ''}`}>
          {tasks.map((task, index) => {
            const title = splitTitle(task, language);
            const completed = completedTaskIdSet.has(task.id);
            const active = activeTaskId === task.id;
            const actionLabel = active ? c.continue : completed ? c.completed : c.open;
            return (
              <button
                key={task.id}
                type="button"
                className={`challenge-level-one__choice ${completed ? 'is-complete' : ''} ${active ? 'is-active' : ''}`}
                onClick={() => onChoose(task.id)}
                disabled={isMutating || completed}
                aria-label={`${title.invitation}. ${title.place}. ${actionLabel}`}
              >
                <span className="challenge-level-one__choice-image">
                  <b aria-hidden="true">{String(index + 1).padStart(2, '0')}</b>
                  {task.image ? <img src={task.image} alt="" /> : <Crosshair aria-hidden="true" />}
                  {completed ? <i aria-label={c.completed}><Check aria-hidden="true" /></i> : null}
                </span>
                <span className="challenge-level-one__choice-copy">
                  <strong>{title.invitation}</strong>
                  <small><MapPin aria-hidden="true" />{title.place}</small>
                  <span>{actionLabel}<ArrowUpRight aria-hidden="true" /></span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="challenge-level-one__locked" aria-labelledby="challenge-locked-title">
        <header>
          <span><LockKeyhole aria-hidden="true" /></span>
          <div><small>{c.locked}</small><h2 id="challenge-locked-title">{c.moreLocked}</h2></div>
        </header>
        <div className="challenge-level-one__locked-row" aria-hidden="true">
          {lockedTasks.slice(0, 3).map((task) => (
            <article key={task.id}>
              {task.image ? <img src={task.image} alt="" /> : null}
              <span><LockKeyhole />{splitTitle(task, language).place}</span>
            </article>
          ))}
        </div>
      </section>

      <ChallengeLeaderboardPreview language={language} />
    </div>
  );
};
