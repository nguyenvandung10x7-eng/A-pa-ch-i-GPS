import { Compass, MapPinned, Sparkles } from 'lucide-react';
import { getDistinctTaskPlaces, TaskMap } from '../components/TaskMap';
import type { ChallengeTask, LanguageCode } from '../types/task';

type GameMapPageProps = {
  tasks: ChallengeTask[];
  language: LanguageCode;
  t: (key: string) => string;
};

const copy = {
  vi: {
    kicker: 'BẢN ĐỒ ĐIỆN BIÊN',
    title: 'Bản đồ các khám phá đang mở.',
    body: 'Mỗi dấu ghim là một địa điểm. Những khám phá trùng tọa độ được gom chung để bản đồ không tạo ra các điểm giả hoặc chồng ghim.',
    places: 'địa danh',
    discoveries: 'khám phá',
  },
  en: {
    kicker: 'THE DIEN BIEN MAP',
    title: 'The map of open discoveries.',
    body: 'Each pin is a place. Discoveries sharing the same coordinates are grouped so the map never invents or stacks locations.',
    places: 'places',
    discoveries: 'discoveries',
  },
} as const;

export const GameMapPage = ({ tasks, language, t }: GameMapPageProps) => {
  const c = copy[language];
  const activeTasks = tasks.filter((task) => task.enabled);
  const placeCount = getDistinctTaskPlaces(activeTasks).length;

  return (
    <main className="game-map-page">
      <header className="game-map-page__hero">
        <div className="game-map-page__compass"><Compass aria-hidden="true" /></div>
        <div>
          <p><Sparkles aria-hidden="true" />{c.kicker}</p>
          <h1>{c.title}</h1>
          <div>{c.body}</div>
        </div>
        <span><MapPinned aria-hidden="true" />{placeCount} {c.places} · {activeTasks.length} {c.discoveries}</span>
      </header>
      {activeTasks.length > 0 ? (
        <TaskMap tasks={activeTasks} language={language} t={t} groupByLocation />
      ) : (
        <p className="game-map-page__empty">
          {language === 'vi' ? 'Chưa có địa danh nào đang mở.' : 'No places are open yet.'}
        </p>
      )}
    </main>
  );
};
