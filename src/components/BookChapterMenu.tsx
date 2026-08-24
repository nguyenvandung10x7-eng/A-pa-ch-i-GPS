import { Bookmark, BookOpen, Check, ChevronRight, MapPin, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBookPageIllustration } from '../data/bookIllustrations';
import { useBookState } from '../hooks/useBookState';
import { getChapterPages, getPublishedChapters } from '../services/bookContent';
import type { BookLocalizedText } from '../types/book';
import type { LanguageCode } from '../types/task';

type BookChapterMenuProps = {
  language: LanguageCode;
  onNavigate?: () => void;
  onClose?: () => void;
  compact?: boolean;
};

const localized = (value: BookLocalizedText | undefined, language: LanguageCode): string =>
  value?.[language] ?? value?.vi ?? value?.en ?? '';

const copy = {
  vi: {
    title: 'CUỐN SÁCH ĐIỆN BIÊN',
    subtitle: '13 chương · những điều tôi còn nhớ',
    chapters: 'Chương',
    saved: 'Đã lưu',
    nearby: 'Gần tôi',
    reading: 'Đang đọc',
    pages: 'trang',
    close: 'Đóng cuốn sách',
  },
  en: {
    title: 'THE DIEN BIEN BOOK',
    subtitle: '13 chapters · the things I still remember',
    chapters: 'Chapters',
    saved: 'Saved',
    nearby: 'Near me',
    reading: 'Reading',
    pages: 'pages',
    close: 'Close book',
  },
} as const;

export const BookChapterMenu = ({ language, onNavigate, onClose, compact = false }: BookChapterMenuProps) => {
  const chapters = getPublishedChapters();
  const { bookState } = useBookState();
  const c = copy[language];

  return (
    <section className={`game-book-menu ${compact ? 'game-book-menu--compact' : ''}`} aria-label={c.title}>
      <header className="game-book-menu__head">
        <div className="game-book-menu__title-mark"><BookOpen aria-hidden="true" /></div>
        <div>
          <h2>{c.title}</h2>
          <p>{c.subtitle}</p>
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} aria-label={c.close} className="game-book-menu__close">
            <X aria-hidden="true" />
          </button>
        ) : null}
      </header>

      <nav className="game-book-menu__tabs" aria-label={c.title}>
        <Link to="/book" className="is-active" onClick={onNavigate}><BookOpen /><span>{c.chapters}</span></Link>
        <Link to="/saved" onClick={onNavigate}><Bookmark /><span>{c.saved}</span></Link>
        <Link to="/nearby" onClick={onNavigate}><MapPin /><span>{c.nearby}</span></Link>
      </nav>

      <div className="game-book-menu__list">
        {chapters.map((chapter) => {
          const pages = getChapterPages(chapter.id);
          const readCount = pages.filter((page) => bookState.readPageIds.includes(page.id)).length;
          const complete = pages.length > 0 && readCount === pages.length;
          const illustration = pages[0] ? getBookPageIllustration(pages[0].id) : undefined;
          const progress = pages.length > 0 ? Math.round((readCount / pages.length) * 100) : 0;

          return (
            <Link
              key={chapter.id}
              to={`/book/chapter/${chapter.id}`}
              className="game-book-menu__chapter"
              onClick={onNavigate}
            >
              <div className="game-book-menu__thumb">
                {illustration ? <img src={illustration} alt="" loading="lazy" decoding="async" /> : <BookOpen />}
              </div>
              <div className="game-book-menu__chapter-copy">
                <strong><span>{String(chapter.number).padStart(2, '0')}</span>{localized(chapter.title, language)}</strong>
                <div className="game-book-menu__progress" aria-label={`${readCount}/${pages.length} ${c.pages}`}>
                  <i style={{ width: `${progress}%` }} />
                </div>
                <small>{readCount > 0 && !complete ? `${c.reading} · ` : ''}{readCount}/{pages.length} {c.pages}</small>
              </div>
              <div className={`game-book-menu__chapter-state ${complete ? 'is-complete' : ''}`}>
                {complete ? <Check aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
