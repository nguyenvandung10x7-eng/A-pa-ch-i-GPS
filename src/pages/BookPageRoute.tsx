import { Bookmark, BookmarkCheck, MapPin, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBookState } from '../hooks/useBookState';
import { getChapterPages, getPage } from '../services/bookContent';
import { bookLocationMapUrl } from '../services/bookNearMe';
import { markBookPageRead, toggleSavedBookPage } from '../services/bookState';
import type { BookLocalizedText } from '../types/book';
import type { LanguageCode } from '../types/task';
import { BookPage } from './BookPage';
import './book-reading-v2.css';

type BookPageRouteProps = {
  language: LanguageCode;
};

const localized = (value: BookLocalizedText | undefined, language: LanguageCode): string =>
  value?.[language] ?? value?.vi ?? value?.en ?? '';

const copy = {
  vi: {
    save: 'Lưu trang',
    saved: 'Đã lưu',
    places: 'Những nơi trong chương này',
    placeIntro: 'Câu chuyện kết thúc ở đây. Những nơi dưới đây thì vẫn còn ngoài đời.',
    challenge: 'Có thử thách',
    open: 'Đi tới đó',
  },
  en: {
    save: 'Save page',
    saved: 'Saved',
    places: 'Places in this chapter',
    placeIntro: 'The story ends here. These places still exist outside the book.',
    challenge: 'Challenge available',
    open: 'Go there',
  },
} as const;

export const BookPageRoute = ({ language }: BookPageRouteProps) => {
  const { pageId } = useParams<{ pageId?: string }>();
  const page = pageId ? getPage(pageId) : undefined;
  const currentPageId = page?.id;
  const { savedState } = useBookState();
  const c = copy[language];

  useEffect(() => {
    if (currentPageId) markBookPageRead(currentPageId);
  }, [currentPageId]);

  if (!page) return <BookPage language={language} />;

  const saved = savedState.pageIds.includes(page.id);
  const chapterPages = getChapterPages(page.chapterId);
  const isLastPage = chapterPages[chapterPages.length - 1]?.id === page.id;
  const chapterPlaces = isLastPage ? chapterPages.filter((candidate) => candidate.location) : [];

  return (
    <div className="book-reading-v2">
      <div className="book-reading-v2__utility">
        <button
          type="button"
          onClick={() => toggleSavedBookPage(page.id)}
          aria-pressed={saved}
          aria-label={saved ? c.saved : c.save}
          title={saved ? c.saved : c.save}
        >
          {saved ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
        </button>
      </div>

      <div className="book-reading-v2__content">
        <BookPage language={language} />
      </div>

      {chapterPlaces.length > 0 ? (
        <section className="book-reading-v2__places">
          <header>
            <p>{c.places}</p>
            <div>{c.placeIntro}</div>
          </header>

          <div className="book-reading-v2__place-list">
            {chapterPlaces.map((placePage) => {
              const location = placePage.location;
              if (!location) return null;

              return (
                <a
                  key={placePage.id}
                  href={bookLocationMapUrl(location)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin aria-hidden="true" />
                  <div>
                    <strong>{localized(location.label, language) || localized(placePage.title, language)}</strong>
                    <small>
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      {placePage.legacyTaskIds?.length ? <em>{c.challenge}</em> : null}
                    </small>
                  </div>
                  <span>{c.open}<ArrowRight aria-hidden="true" /></span>
                </a>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
};
