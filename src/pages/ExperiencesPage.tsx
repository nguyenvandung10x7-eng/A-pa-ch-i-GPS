import { ArrowRight, ExternalLink, MapPin, Route, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BOOK_CHAPTERS, BOOK_EXPERIENCES } from '../data/bookContent';
import type { BookExperience, BookLocalizedText } from '../types/book';
import type { LanguageCode } from '../types/task';

const localized = (value: BookLocalizedText | undefined, language: LanguageCode): string =>
  value?.[language] ?? value?.vi ?? value?.en ?? '';

const copy = {
  vi: {
    eyebrow: 'BOOK OF DIEN BIEN · EXPERIENCES',
    title: 'Bước ra ngoài',
    intro: 'Các trải nghiệm nối phần đọc với những nơi có thật. Không cần hoàn thành tất cả; chỉ mở một trải nghiệm khi một chương khiến bạn muốn đi tiếp.',
    chapter: 'Chương',
    location: 'Vị trí',
    sideQuest: 'Side quest',
    external: 'Trải nghiệm ngoài',
    walk: 'Đi bộ',
    audio: 'Âm thanh',
    openMap: 'Mở bản đồ',
    openExternal: 'Mở trải nghiệm',
    openChallenge: 'Mở thử thách',
    noAction: 'Nội dung trải nghiệm đang được hoàn thiện.',
    backToBook: 'Về Book',
  },
  en: {
    eyebrow: 'BOOK OF DIEN BIEN · EXPERIENCES',
    title: 'Step outside',
    intro: 'Experiences connect the reading with real places. You do not need to complete everything; open one only when a chapter makes you want to continue outside.',
    chapter: 'Chapter',
    location: 'Location',
    sideQuest: 'Side quest',
    external: 'External experience',
    walk: 'Walk',
    audio: 'Audio',
    openMap: 'Open map',
    openExternal: 'Open experience',
    openChallenge: 'Open challenge',
    noAction: 'This experience is still being prepared.',
    backToBook: 'Back to Book',
  },
} as const;

const typeLabel = (experience: BookExperience, language: LanguageCode) => {
  const c = copy[language];
  if (experience.type === 'sideQuest') return c.sideQuest;
  if (experience.type === 'external') return c.external;
  if (experience.type === 'walk') return c.walk;
  if (experience.type === 'audio') return c.audio;
  return c.location;
};

const actionClassName = 'inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--earth-800)] px-4 py-2 text-sm font-black text-white';

const ExperienceActions = ({ experience, language }: { experience: BookExperience; language: LanguageCode }) => {
  const c = copy[language];
  const actions = [];

  if (experience.externalUrl) {
    actions.push(
      <a key="external" href={experience.externalUrl} target="_blank" rel="noreferrer" className={actionClassName}>
        {c.openExternal}<ExternalLink className="h-4 w-4" />
      </a>
    );
  }

  if (experience.legacyTaskId) {
    actions.push(
      <Link key="legacy" to="/challenge" className={actionClassName}>
        {c.openChallenge}<ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  if (experience.location) {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${experience.location.lat},${experience.location.lng}`;
    actions.push(
      <a key="map" href={mapUrl} target="_blank" rel="noreferrer" className={actionClassName}>
        {c.openMap}<MapPin className="h-4 w-4" />
      </a>
    );
  }

  if (actions.length === 0) {
    return <p className="text-sm italic text-[var(--forest-600)]">{c.noAction}</p>;
  }

  return <div className="flex flex-wrap gap-2">{actions}</div>;
};

export const ExperiencesPage = ({
  language,
  t,
}: {
  language: LanguageCode;
  t: (key: string) => string;
}) => {
  const c = copy[language];
  const experiences = BOOK_EXPERIENCES.filter((experience) => experience.status !== 'hidden')
    .slice()
    .sort((a, b) => {
      const chapterA = BOOK_CHAPTERS.find((chapter) => chapter.id === a.chapterId)?.order ?? Number.MAX_SAFE_INTEGER;
      const chapterB = BOOK_CHAPTERS.find((chapter) => chapter.id === b.chapterId)?.order ?? Number.MAX_SAFE_INTEGER;
      if (chapterA !== chapterB) return chapterA - chapterB;
      return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
    });

  return (
    <div className="mx-auto max-w-5xl py-5 sm:py-10">
      <Link to="/book" className="text-sm font-bold text-[var(--forest-700)] hover:text-[var(--forest-950)]">← {c.backToBook}</Link>

      <header className="mt-8 max-w-3xl border-b border-[rgba(91,67,38,0.16)] pb-8">
        <div className="flex items-center gap-3 text-[var(--earth-700)]">
          <Sparkles className="h-5 w-5" />
          <p className="text-xs font-black uppercase tracking-[0.26em]">{c.eyebrow}</p>
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-[var(--forest-950)] sm:text-6xl">{c.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--forest-700)]">{c.intro}</p>
        <span className="sr-only">{t('nav.experiences')}</span>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {experiences.map((experience) => {
          const chapter = BOOK_CHAPTERS.find((candidate) => candidate.id === experience.chapterId);
          const locationLabel = experience.location?.label ? localized(experience.location.label, language) : '';

          return (
            <article
              key={experience.id}
              className="flex min-h-[15rem] flex-col justify-between rounded-[1.8rem] bg-[rgba(247,242,231,0.76)] p-5 shadow-[0_18px_42px_rgba(50,45,32,0.07)] ring-1 ring-[rgba(91,67,38,0.11)] sm:p-6"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--forest-600)]">
                      {chapter ? `${c.chapter} ${chapter.number} · ${localized(chapter.title, language)}` : c.eyebrow}
                    </p>
                    <h2 className="mt-2 text-2xl font-black leading-tight text-[var(--forest-950)]">
                      {localized(experience.title, language)}
                    </h2>
                  </div>
                  {experience.location ? <MapPin className="mt-1 h-5 w-5 shrink-0 text-[var(--earth-700)]" /> : <Route className="mt-1 h-5 w-5 shrink-0 text-[var(--earth-700)]" />}
                </div>

                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--earth-700)]">{typeLabel(experience, language)}</p>
                {experience.description ? <p className="mt-4 text-sm leading-7 text-[var(--forest-800)]">{localized(experience.description, language)}</p> : null}
                {experience.instruction ? <p className="mt-3 rounded-[1.2rem] bg-[rgba(230,220,196,0.56)] px-4 py-3 text-sm leading-6 text-[var(--forest-800)]">{localized(experience.instruction, language)}</p> : null}
                {locationLabel ? <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[var(--forest-700)]"><MapPin className="h-4 w-4" />{locationLabel}</p> : null}
              </div>

              <div className="mt-6"><ExperienceActions experience={experience} language={language} /></div>
            </article>
          );
        })}
      </section>
    </div>
  );
};
