import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, MapPin } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookChapterMenu } from '../components/BookChapterMenu';
import { getBookPageIllustration } from '../data/bookIllustrations';
import { useBookState } from '../hooks/useBookState';
import { getChapter, getChapterPages, getPublishedChapters } from '../services/bookContent';
import { bookLocationMapUrl } from '../services/bookNearMe';
import { markBookPageRead, toggleSavedBookPage } from '../services/bookState';
import type { BookLocalizedText, BookPage, ContentBlock } from '../types/book';
import type { LanguageCode } from '../types/task';
import './book-rebuild.css';

type BookPageProps = { language: LanguageCode };

const localized = (value: BookLocalizedText | undefined, language: LanguageCode): string =>
  value?.[language] ?? value?.vi ?? value?.en ?? '';

const copy = {
  vi: {
    chapter: 'Chương',
    back: 'Mục lục',
    noPages: 'Chương này đang được biên tập thêm.',
    place: 'Địa điểm trong câu chuyện',
    map: 'Xem trên bản đồ',
    save: 'Lưu đoạn này',
    saved: 'Đã lưu',
    next: 'Chương tiếp theo',
    progress: 'đoạn',
  },
  en: {
    chapter: 'Chapter',
    back: 'Contents',
    noPages: 'This chapter is still being edited.',
    place: 'Place in this story',
    map: 'View on map',
    save: 'Save this story',
    saved: 'Saved',
    next: 'Next chapter',
    progress: 'stories',
  },
} as const;

const renderNarrativeBlock = (block: ContentBlock, language: LanguageCode, key: string) => {
  if (block.type === 'text') return <p key={key}>{localized(block.body, language)}</p>;
  if (block.type === 'quote') {
    return (
      <blockquote key={key}>
        <p>{localized(block.body, language)}</p>
        {block.attribution ? <cite>{localized(block.attribution, language)}</cite> : null}
      </blockquote>
    );
  }
  if (block.type === 'note') return <aside key={key}>{localized(block.body, language)}</aside>;
  if (block.type === 'divider') return <hr key={key} />;
  return null;
};

const StorySection = ({
  page,
  index,
  total,
  language,
  saved,
}: {
  page: BookPage;
  index: number;
  total: number;
  language: LanguageCode;
  saved: boolean;
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const c = copy[language];
  const illustration = getBookPageIllustration(page.id);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        markBookPageRead(page.id);
        observer.disconnect();
      }
    }, { threshold: 0.38 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [page.id]);

  return (
    <article ref={ref} id={`story-${page.id}`} className="book-longform-story">
      <div className="book-longform-story__meta">
        <span>{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        <button
          type="button"
          onClick={() => toggleSavedBookPage(page.id)}
          aria-pressed={saved}
          aria-label={saved ? c.saved : c.save}
          title={saved ? c.saved : c.save}
        >
          {saved ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
          <span>{saved ? c.saved : c.save}</span>
        </button>
      </div>

      <header className="book-longform-story__head">
        <h2>{localized(page.title, language)}</h2>
        {page.intro ? <p>{localized(page.intro, language)}</p> : null}
      </header>

      {illustration && index > 0 ? (
        <figure className="book-longform-story__art">
          <img src={illustration} alt={localized(page.title, language)} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
        </figure>
      ) : null}

      <div className="book-longform-story__body">
        {page.blocks.map((block, blockIndex) => renderNarrativeBlock(block, language, `${page.id}-${blockIndex}`))}
      </div>

      {page.location ? (
        <a className="book-longform-story__place" href={bookLocationMapUrl(page.location)} target="_blank" rel="noreferrer">
          <span><MapPin aria-hidden="true" /></span>
          <div>
            <small>{c.place}</small>
            <strong>{localized(page.location.label, language) || localized(page.title, language)}</strong>
          </div>
          <em>{c.map}<ArrowRight aria-hidden="true" /></em>
        </a>
      ) : null}
    </article>
  );
};

export const NewBookPage = ({ language }: BookPageProps) => {
  const { chapterId } = useParams<{ chapterId?: string }>();
  const { savedState } = useBookState();
  const c = copy[language];

  if (!chapterId) {
    return (
      <main className="game-book-home">
        <div className="game-book-home__map" aria-hidden="true" />
        <BookChapterMenu language={language} />
      </main>
    );
  }

  const chapter = getChapter(chapterId);
  if (!chapter) return <div className="book-v2-empty">{c.noPages}</div>;

  const pages = getChapterPages(chapter.id);
  const chapters = getPublishedChapters();
  const chapterIndex = chapters.findIndex((candidate) => candidate.id === chapter.id);
  const nextChapter = chapterIndex >= 0 ? chapters[chapterIndex + 1] : undefined;
  const firstIllustration = pages[0] ? getBookPageIllustration(pages[0].id) : undefined;

  return (
    <main className="book-longform">
      <div className="book-longform__nav">
        <Link to="/book"><ArrowLeft aria-hidden="true" /><span>{c.back}</span></Link>
        <span>{c.chapter} {chapter.number}</span>
      </div>

      <header className="book-longform__hero">
        {firstIllustration ? <img src={firstIllustration} alt="" aria-hidden="true" /> : null}
        <div className="book-longform__hero-veil" />
        <div className="book-longform__hero-copy">
          <p>{String(chapter.number).padStart(2, '0')} / {chapters.length}</p>
          <h1>{localized(chapter.title, language)}</h1>
          {chapter.intro ? <div>{localized(chapter.intro, language)}</div> : null}
          <small>{pages.length} {c.progress}</small>
        </div>
      </header>

      <section className="book-longform__stories">
        {pages.length ? pages.map((page, index) => (
          <StorySection
            key={page.id}
            page={page}
            index={index}
            total={pages.length}
            language={language}
            saved={savedState.pageIds.includes(page.id)}
          />
        )) : <p className="book-v2-muted">{c.noPages}</p>}
      </section>

      {nextChapter ? (
        <Link className="book-longform__next" to={`/book/chapter/${nextChapter.id}`}>
          <span>{c.next}</span>
          <strong>{String(nextChapter.number).padStart(2, '0')} · {localized(nextChapter.title, language)}</strong>
          <ArrowRight aria-hidden="true" />
        </Link>
      ) : null}
    </main>
  );
};
