import { Compass, MapPinned, Sparkles } from 'lucide-react';
import { TaskMap } from '../components/TaskMap';
import type { ChallengeTask, LanguageCode } from '../types/task';

type GameMapPageProps = {
  tasks: ChallengeTask[];
  language: LanguageCode;
  t: (key: string) => string;
};

const copy = {
  vi: {
    kicker: 'BẢN ĐỒ ĐIỆN BIÊN',
    title: 'Mỗi dấu ghim là một nơi có thật.',
    body: 'Chọn một địa danh để xem câu chuyện và hoạt động gần đó. Các điểm trên bản đồ là địa điểm — không phải nhiệm vụ.',
    places: 'địa danh',
  },
  en: {
    kicker: 'THE DIEN BIEN MAP',
    title: 'Every pin is a real place.',
    body: 'Choose a place to see its story and nearby activities. Map pins are places, not quests.',
    places: 'places',
  },
} as const;

export const GameMapPage = ({ tasks, language, t }: GameMapPageProps) => {
  const c = copy[language];

  return (
    <main className="game-map-page">
      <header className="game-map-page__hero">
        <div className="game-map-page__compass"><Compass aria-hidden="true" /></div>
        <div>
          <p><Sparkles aria-hidden="true" />{c.kicker}</p>
          <h1>{c.title}</h1>
          <div>{c.body}</div>
        </div>
        <span><MapPinned aria-hidden="true" />{tasks.length} {c.places}</span>
      </header>
      {tasks.length > 0 ? (
        <TaskMap tasks={tasks} language={language} t={t} />
      ) : (
        <p className="game-map-page__empty">
          {language === 'vi' ? 'Chưa có địa danh nào đang mở.' : 'No places are open yet.'}
        </p>
      )}
    </main>
  );
};
