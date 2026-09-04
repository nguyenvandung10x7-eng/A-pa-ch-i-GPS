import { Check, ChevronRight, Lock, Sparkles } from 'lucide-react';
import { localize } from '../services/i18n';
import type { ChallengeTask, LanguageCode } from '../types/task';
import { ChallengeLeaderboardPreview } from './ChallengeLeaderboardPreview';

type ChallengeLevelOneMenuProps = {
  accepted: boolean;
  tasks: ChallengeTask[];
  lockedTasks: ChallengeTask[];
  completedTaskIds: string[];
  activeTaskId?: string;
  isMutating: boolean;
  language: LanguageCode;
  onAccept: () => void;
  onChoose: (taskId: string) => void;
};

const copy = {
  vi: {
    eyebrow: 'KHÁM PHÁ · CHALLENGE',
    level: 'LEVEL 1',
    title: 'Đây là trò chơi. Bạn có muốn chơi không?',
    prompt: 'Xác nhận bạn hơi hâm và muốn tham gia. Hoàn thành 1 thử thách để mở khóa tất cả.',
    accept: 'Tôi hơi hâm. Chơi',
    choose: 'Chọn một chuyện hơi hâm',
    chooseHint: 'Không cần làm hết. Một chuyện là đủ để Book mở phần còn lại.',
    open: 'Xem lời mời',
    continue: 'Tiếp tục',
    completed: 'Đã xong',
    locked: 'Challenge đang khóa',
    moreLocked: '+ còn nhiều chuyện hơi hâm đang bị khóa',
  },
  en: {
    eyebrow: 'EXPLORE · CHALLENGE',
    level: 'LEVEL 1',
    title: 'This is a game. Do you want to play?',
    prompt: 'Confirm that you are a little strange and want in. Finish one challenge to unlock everything.',
    accept: 'I am a little strange. Play',
    choose: 'Choose one slightly strange thing',
    chooseHint: 'There is no need to do them all. One is enough for the Book to open the rest.',
    open: 'Read invitation',
    continue: 'Continue',
    completed: 'Done',
    locked: 'Locked challenges',
    moreLocked: '+ more slightly strange things are still locked',
  },
} as const;

const splitTitle = (task: ChallengeTask, language: LanguageCode) => {
  const fullTitle = localize(task.title, language);
  const [place, ...rest] = fullTitle.split(/\s+[–-]\s+/);
  return { place: place || fullTitle, invitation: rest.join(' – ') || fullTitle };
};

export const ChallengeLevelOneMenu = ({
  accepted,
  tasks,
  lockedTasks,
  completedTaskIds,
  activeTaskId,
  isMutating,
  language,
  onAccept,
  onChoose,
}: ChallengeLevelOneMenuProps) => {
  const c = copy[language];
  const completedTaskIdSet = new Set(completedTaskIds);

  return (
    <div className="challenge-level-one">
      <header className="challenge-level-one__intro">
        <div className="challenge-level-one__eyebrow"><Sparkles aria-hidden="true" />{c.eyebrow}</div>
        <span className="challenge-level-one__badge">{c.level}</span>
        <h1>{c.title}</h1>
        <p>{c.prompt}</p>
        {!accepted ? (
          <button type="button" className="challenge-level-one__accept" onClick={onAccept}>
            {c.accept}<ChevronRight aria-hidden="true" />
          </button>
        ) : null}
      </header>

      {accepted ? (
        <section className="challenge-level-one__choices" aria-labelledby="challenge-level-one-title">
          <header>
            <h2 id="challenge-level-one-title">{c.choose}</h2>
            <p>{c.chooseHint}</p>
          </header>
          <div className="challenge-level-one__grid">
            {tasks.map((task) => {
              const title = splitTitle(task, language);
              const completed = completedTaskIdSet.has(task.id);
              const active = activeTaskId === task.id;
              return (
                <button
                  key={task.id}
                  type="button"
                  className={`challenge-level-one__choice ${completed ? 'is-complete' : ''} ${active ? 'is-active' : ''}`}
                  onClick={() => onChoose(task.id)}
                  disabled={isMutating || completed}
                >
                  <span className="challenge-level-one__choice-image">
                    {task.image ? <img src={task.image} alt="" /> : <Sparkles aria-hidden="true" />}
                    {completed ? <i aria-label={c.completed}><Check aria-hidden="true" /></i> : null}
                  </span>
                  <span className="challenge-level-one__choice-copy">
                    <small>{title.place}</small>
                    <strong>{title.invitation}</strong>
                    <span>{active ? c.continue : completed ? c.completed : c.open}<ChevronRight aria-hidden="true" /></span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="challenge-level-one__locked" aria-labelledby="challenge-locked-title">
        <header>
          <span><Lock aria-hidden="true" /></span>
          <div><small>{c.locked}</small><h2 id="challenge-locked-title">{c.moreLocked}</h2></div>
        </header>
        <div className="challenge-level-one__locked-row" aria-hidden="true">
          {lockedTasks.slice(0, 3).map((task) => (
            <article key={task.id}>
              {task.image ? <img src={task.image} alt="" /> : null}
              <span><Lock />{splitTitle(task, language).place}</span>
            </article>
          ))}
        </div>
      </section>

      <ChallengeLeaderboardPreview language={language} />
    </div>
  );
};
