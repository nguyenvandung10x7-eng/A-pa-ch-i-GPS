import { Bookmark, BookmarkCheck, MapPin, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBookState } from '../hooks/useBookState';
import { getChapterPages, getPage } from '../services/bookContent';
import { bookLocationMapUrl } from '../services/bookNearMe';
import { getBookPageArtwork, getChapterPlaces } from '../services/bookPresentation';
import { markBookPageRead, toggleSavedBookPage } from '../services/bookState';
import type { BookLocalizedText } from '../types/book';
import type { LanguageCode } from '../types/task';
import { BookPage } from './BookPage';
import './book-reading-v2.css';
import './book-place-cards.css';
import './chapter13-night.css';
import './chapter13-night-legacy-tokens.css';

type BookPageRouteProps = {
  language: LanguageCode;
};

const localized = (value: BookLocalizedText | undefined, language: LanguageCode): string =>
  value?.[language] ?? value?.vi ?? value?.en ?? '';

const copy = {
  vi: {
    save: 'Lưu câu chuyện',
    saved: 'Đã lưu',
    places: 'Địa điểm trong chương này',
    placeIntro: 'Phần đọc dừng ở đây. Nếu muốn bước ra ngoài, những địa điểm dưới đây là nơi để bắt đầu.',
    challenge: 'Có thử thách thú vị',
    open: 'Mở bản đồ',
  },
  en: {
    save: 'Save story',
    saved: 'Saved',
    places: 'Places in this chapter',
    placeIntro: 'The reading stops here. If you want to step outside, these places are where to begin.',
    challenge: 'Fun challenge available',
    open: 'Open map',
  },
} as const;

const REBELLION_CHAPTER_ID = 'chapter-13-su-noi-loan-va-thanh-pho-ban-dem';

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
  const chapterPlaces = isLastPage ? getChapterPlaces(chapterPages) : [];
  const isRebellion = page.chapterId === REBELLION_CHAPTER_ID;

  return (
    <div className={`book-reading-v2 ${isRebellion ? 'book-reading-v2--rebellion' : ''}`}>
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

          <div className="book-reading-v2__place-list book-reading-v2__place-list--visual">
            {chapterPlaces.map((placePage) => {
              const location = placePage.location;
              if (!location) return null;
              const artwork = getBookPageArtwork(placePage);

              return (
                <a
                  key={placePage.id}
                  href={bookLocationMapUrl(location)}
                  target="_blank"
                  rel="noreferrer"
                  className="book-reading-v2__visual-place"
                >
                  <div className="book-reading-v2__visual-place-media">
                    {artwork ? <img src={artwork} alt="" loading="lazy" decoding="async" /> : <MapPin aria-hidden="true" />}
                  </div>
                  <div className="book-reading-v2__visual-place-copy">
                    <strong>{localized(location.label, language) || localized(placePage.title, language)}</strong>
                    <small>
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      {placePage.legacyTaskIds?.length ? <em>{c.challenge}</em> : null}
                    </small>
                    <span>{c.open}<ArrowRight aria-hidden="true" /></span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
};
