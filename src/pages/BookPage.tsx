import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {
  getChapter,
  getChapterExperiences,
  getChapterPages,
  getPage,
  getPublishedChapters,
} from '../services/bookContent';
import { createExactTaskExperienceMode } from '../services/experienceFilters';
import type { BookExperience, BookLocalizedText, ContentBlock } from '../types/book';
import type { LanguageCode } from '../types/task';

type BookPageProps = {
  language: LanguageCode;
};

const localized = (value: BookLocalizedText | undefined, language: LanguageCode): string =>
  value?.[language] ?? value?.vi ?? value?.en ?? '';

const copy = {
  vi: {
    eyebrow: 'BOOK OF DIEN BIEN',
    intro: 'Một cuốn sách số về Điện Biên — đọc trước, rồi mới bước ra ngoài khi một câu chuyện khiến bạn muốn đến đó.',
    contents: 'Mục lục',
    openChapter: 'Mở chương',
    pages: 'trang',
    backToBook: 'Về mục lục',
    backToChapter: 'Về chương',
    previous: 'Trang trước',
    next: 'Trang tiếp',
    stepOutside: 'Bước ra ngoài',
    experiences: 'Trải nghiệm chương này',
    experienceIntro: 'Phần đọc đã kết thúc. Nếu muốn, đây là những cách để tiếp tục chương này ngoài đời.',
    experienceAfterReading: 'Trải nghiệm ngoài đời sẽ xuất hiện sau trang cuối của chương.',
    openExperience: 'Mở trải nghiệm',
    openLegacy: 'Mở khu thử thách',
    notFound: 'Nội dung này chưa được xuất bản hoặc không tồn tại.',
  },
  en: {
    eyebrow: 'BOOK OF DIEN BIEN',
    intro: 'A digital book about Dien Bien — read first, then step outside when a story makes you want to see the place for yourself.',
    contents: 'Contents',
    openChapter: 'Open chapter',
    pages: 'pages',
    backToBook: 'Back to contents',
    backToChapter: 'Back to chapter',
    previous: 'Previous page',
    next: 'Next page',
    stepOutside: 'Step outside',
    experiences: 'Experiences from this chapter',
    experienceIntro: 'The reading is finished. If you want to continue the chapter in the real world, start here.',
    experienceAfterReading: 'Real-world experiences appear after the final page of the chapter.',
    openExperience: 'Open experience',
    openLegacy: 'Open challenge area',
    notFound: 'This content is unpublished or does not exist.',
  },
} as const;

const renderBlock = (block: ContentBlock, language: LanguageCode, key: string) => {
  switch (block.type) {
    case 'text':
      return <p key={key} className="text-[1.06rem] leading-8 text-[var(--forest-950)] sm:text-[1.12rem]">{localized(block.body, language)}</p>;
    case 'note':
      return <aside key={key} className="rounded-[1.5rem] bg-[rgba(230,220,196,0.62)] px-5 py-4 text-sm leading-7 text-[var(--forest-800)] ring-1 ring-[rgba(91,67,38,0.12)]">{localized(block.body, language)}</aside>;
    case 'quote':
      return (
        <blockquote key={key} className="border-l-2 border-[var(--amber-500)] pl-5 text-xl italic leading-8 text-[var(--earth-900)]">
          <p>{localized(block.body, language)}</p>
          {block.attribution ? <footer className="mt-3 text-sm not-italic text-[var(--forest-700)]">{localized(block.attribution, language)}</footer> : null}
        </blockquote>
      );
    case 'image':
      return (
        <figure key={key} className="space-y-2">
          <img src={block.image.src} alt={localized(block.image.alt, language)} className="w-full rounded-[1.75rem] object-cover" loading="lazy" />
          {block.image.caption ? <figcaption className="px-1 text-sm leading-6 text-[var(--forest-700)]">{localized(block.image.caption, language)}</figcaption> : null}
        </figure>
      );
    case 'gallery':
      return (
        <div key={key} className="flex snap-x gap-3 overflow-x-auto pb-2">
          {block.images.map((image, index) => (
            <img key={`${image.src}-${index}`} src={image.src} alt={localized(image.alt, language)} className="h-64 min-w-[82%] snap-center rounded-[1.5rem] object-cover sm:min-w-[58%]" loading="lazy" />
          ))}
        </div>
      );
    case 'audio':
      return (
        <div key={key} className="rounded-[1.5rem] bg-[rgba(255,255,255,0.58)] p-4 ring-1 ring-[rgba(61,84,52,0.12)]">
          {block.audio.title ? <p className="mb-3 font-bold text-[var(--forest-900)]">{localized(block.audio.title, language)}</p> : null}
          {block.audio.src ? <audio controls preload="none" src={block.audio.src} className="w-full" /> : null}
          {block.audio.externalUrl ? <a href={block.audio.externalUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-w-0 items-center gap-2 break-all text-sm font-bold text-[var(--earth-900)]"><ExternalLink className="h-4 w-4 shrink-0" />{block.audio.externalUrl}</a> : null}
        </div>
      );
    case 'divider':
      return <div key={key} className="mx-auto h-px w-24 bg-[rgba(91,67,38,0.28)]" />;
    default:
      return null;
  }
};

const ExperienceCard = ({ experience, language }: { experience: BookExperience; language: LanguageCode }) => {
  const c = copy[language];
  const href = experience.externalUrl;
  const challengePath = experience.legacyTaskId
    ? `/challenge?experience=${encodeURIComponent(createExactTaskExperienceMode(experience.legacyTaskId))}`
    : null;

  return (
    <article className="rounded-[1.6rem] bg-[rgba(255,255,255,0.62)] p-5 ring-1 ring-[rgba(61,84,52,0.13)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--forest-600)]">{experience.type === 'sideQuest' ? 'Side quest' : experience.type}</p>
          <h3 className="mt-2 text-xl font-black text-[var(--forest-950)]">{localized(experience.title, language)}</h3>
        </div>
        {experience.location ? <MapPin className="mt-1 h-5 w-5 shrink-0 text-[var(--earth-700)]" /> : null}
      </div>
      {experience.description ? <p className="mt-3 text-sm leading-7 text-[var(--forest-800)]">{localized(experience.description, language)}</p> : null}
      {href || challengePath ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {href ? (
            <a href={href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--earth-800)] px-4 py-2 text-sm font-black text-white">
              {c.openExperience}<ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
          {challengePath ? (
            <Link to={challengePath} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--earth-800)] px-4 py-2 text-sm font-black text-white">
              {c.openLegacy}<ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      ) : null}
    </article>
  );
};

export const BookPage = ({ language }: BookPageProps) => {
  const { chapterId, pageId } = useParams<{ chapterId?: string; pageId?: string }>();
  const c = copy[language];

  if (pageId) {
    const page = getPage(pageId);
    if (!page) {
      return <div className="mx-auto max-w-3xl py-16 text-center text-[var(--forest-800)]">{c.notFound}</div>;
    }

    const chapter = getChapter(page.chapterId);
    const pages = getChapterPages(page.chapterId);
    const pageIndex = pages.findIndex((candidate) => candidate.id === page.id);
    const previousPage = pageIndex > 0 ? pages[pageIndex - 1] : undefined;
    const nextPage = pageIndex >= 0 && pageIndex < pages.length - 1 ? pages[pageIndex + 1] : undefined;
    const isLastPage = pageIndex === pages.length - 1;
    const experiences = isLastPage ? getChapterExperiences(page.chapterId) : [];

    return (
      <div className="mx-auto max-w-3xl py-5 sm:py-10">
        <Link to={`/book/chapter/${page.chapterId}`} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--forest-700)]"><ArrowLeft className="h-4 w-4" />{c.backToChapter}</Link>
        <article className="mt-8 rounded-[2rem] bg-[rgba(247,242,231,0.76)] px-5 py-8 shadow-[0_24px_60px_rgba(50,45,32,0.08)] ring-1 ring-[rgba(91,67,38,0.1)] sm:px-10 sm:py-12">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--forest-600)]">{chapter?.number} · {chapter ? localized(chapter.title, language) : ''}</p>
          <h1 className="mt-4 text-3xl font-black leading-tight text-[var(--forest-950)] sm:text-5xl">{localized(page.title, language)}</h1>
          {page.intro ? <p className="mt-5 text-lg leading-8 text-[var(--forest-700)]">{localized(page.intro, language)}</p> : null}
          <div className="mt-9 space-y-7">{page.blocks.map((block, index) => renderBlock(block, language, `${page.id}-${index}`))}</div>
        </article>

        <nav className="mt-6 flex items-center justify-between gap-3">
          {previousPage ? <Link to={`/book/page/${previousPage.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[rgba(255,255,255,0.7)] px-4 py-2 text-sm font-black text-[var(--forest-900)] ring-1 ring-[rgba(61,84,52,0.13)]"><ArrowLeft className="h-4 w-4" />{c.previous}</Link> : <span />}
          {nextPage ? <Link to={`/book/page/${nextPage.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--earth-800)] px-4 py-2 text-sm font-black text-white">{c.next}<ArrowRight className="h-4 w-4" /></Link> : null}
        </nav>

        {isLastPage && experiences.length > 0 ? (
          <section className="mt-12 rounded-[2rem] bg-[rgba(220,212,194,0.72)] p-5 ring-1 ring-[rgba(91,67,38,0.14)] sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--earth-700)]">{c.stepOutside}</p>
            <h2 className="mt-2 text-3xl font-black text-[var(--forest-950)]">{c.experiences}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--forest-700)]">{c.experienceIntro}</p>
            <div className="mt-6 grid gap-4">{experiences.map((experience) => <ExperienceCard key={experience.id} experience={experience} language={language} />)}</div>
          </section>
        ) : null}
      </div>
    );
  }

  if (chapterId) {
    const chapter = getChapter(chapterId);
    if (!chapter) {
      return <div className="mx-auto max-w-3xl py-16 text-center text-[var(--forest-800)]">{c.notFound}</div>;
    }

    const pages = getChapterPages(chapter.id);

    return (
      <div className="mx-auto max-w-4xl py-5 sm:py-10">
        <Link to="/book" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--forest-700)]"><ArrowLeft className="h-4 w-4" />{c.backToBook}</Link>
        <header className="mt-8 border-b border-[rgba(91,67,38,0.16)] pb-8">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--earth-700)]">{c.eyebrow} · {chapter.number}</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-[var(--forest-950)] sm:text-6xl">{localized(chapter.title, language)}</h1>
          {chapter.intro ? <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--forest-700)]">{localized(chapter.intro, language)}</p> : null}
        </header>
        <div className="mt-7 grid gap-3">
          {pages.map((page, index) => (
            <Link key={page.id} to={`/book/page/${page.id}`} className="group flex items-center justify-between gap-4 rounded-[1.5rem] bg-[rgba(247,242,231,0.72)] px-5 py-5 ring-1 ring-[rgba(91,67,38,0.1)] transition hover:-translate-y-0.5">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--forest-600)]">{String(index + 1).padStart(2, '0')}</p>
                <h2 className="mt-1 text-xl font-black text-[var(--forest-950)]">{localized(page.title, language)}</h2>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-[var(--earth-700)] transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
        {getChapterExperiences(chapter.id).length > 0 ? <p className="mt-6 text-sm italic text-[var(--forest-600)]">{c.experienceAfterReading}</p> : null}
      </div>
    );
  }

  const chapters = getPublishedChapters();

  return (
    <div className="mx-auto max-w-5xl py-5 sm:py-10">
      <header className="max-w-3xl py-8 sm:py-14">
        <div className="flex items-center gap-3 text-[var(--earth-700)]"><BookOpen className="h-5 w-5" /><p className="text-xs font-black uppercase tracking-[0.3em]">{c.eyebrow}</p></div>
        <h1 className="mt-5 text-5xl font-black tracking-tight text-[var(--forest-950)] sm:text-7xl">Điện Biên</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--forest-700)]">{c.intro}</p>
      </header>

      <section>
        <p className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-[var(--forest-600)]">{c.contents}</p>
        <div className="grid gap-4">
          {chapters.map((chapter) => {
            const pages = getChapterPages(chapter.id);
            return (
              <Link key={chapter.id} to={`/book/chapter/${chapter.id}`} className="group grid gap-4 rounded-[1.8rem] bg-[rgba(247,242,231,0.74)] p-5 ring-1 ring-[rgba(91,67,38,0.11)] transition hover:-translate-y-0.5 sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:p-7">
                <span className="text-3xl font-black text-[var(--earth-700)]">{chapter.number}</span>
                <span>
                  <span className="block text-2xl font-black text-[var(--forest-950)]">{localized(chapter.title, language)}</span>
                  {chapter.intro ? <span className="mt-2 block max-w-2xl text-sm leading-6 text-[var(--forest-700)]">{localized(chapter.intro, language)}</span> : null}
                  <span className="mt-3 block text-xs font-bold uppercase tracking-[0.16em] text-[var(--forest-600)]">{pages.length} {c.pages}</span>
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-black text-[var(--earth-800)]">{c.openChapter}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};