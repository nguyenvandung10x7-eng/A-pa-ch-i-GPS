import { ArrowUpRight, Check, Crosshair, LockKeyhole, MapPin } from 'lucide-react';
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
};

const copy = {
  vi: {
    eyebrow: 'BOOK OF DIEN BIEN · PLAY MODE',
    level: 'LEVEL 01',
    title: 'Đủ ngầu thì vào cuộc.',
    prompt: 'Bật chế độ chơi. Hoàn thành 1 thử thách mở màn để mở toàn bộ hành trình.',
    choose: 'Chọn màn mở đầu',
    chooseHint: 'Không cần làm hết. Một thử thách là đủ để mở Level 2.',
    open: 'Nhận thử thách',
    continue: 'Tiếp tục',
    completed: 'Đã xong',
    locked: 'LEVEL 02 · ĐANG KHÓA',
    moreLocked: 'Qua màn mở đầu để mở toàn bộ hành trình',
  },
  en: {
    eyebrow: 'BOOK OF DIEN BIEN · PLAY MODE',
    level: 'LEVEL 01',
    title: 'Cool enough? Step in.',
    prompt: 'Switch on play mode. Clear 1 opening challenge to unlock the full journey.',
    choose: 'Choose your opening move',
    chooseHint: 'There is no need to clear them all. One challenge unlocks Level 2.',
    open: 'Take challenge',
    continue: 'Continue',
    completed: 'Done',
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
}: ChallengeLevelOneMenuProps) => {
  const c = copy[language];
  const completedTaskIdSet = new Set(completedTaskIds);

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

      <section className="challenge-level-one__choices" aria-labelledby="challenge-level-one-title">
        <header>
          <h2 id="challenge-level-one-title">{c.choose}</h2>
          <p>{c.chooseHint}</p>
        </header>
        <div className="challenge-level-one__grid">
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
