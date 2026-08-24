import { ArrowDown, ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useBookState } from '../hooks/useBookState';
import { getChapter, getChapterPages, getPage, getPublishedChapters } from '../services/bookContent';
import { bookLocationMapUrl } from '../services/bookNearMe';
import { getBookPageArtwork, getChapterPlaces, getChapterStories } from '../services/bookPresentation';
import type { BookLocalizedText, BookPage } from '../types/book';
import type { LanguageCode } from '../types/task';
import './book-rebuild.css';
import './chapter13-night.css';

type BookPageProps = { language: LanguageCode };

const localized = (value: BookLocalizedText | undefined, language: LanguageCode): string =>
  value?.[language] ?? value?.vi ?? value?.en ?? '';

const copy = {
  vi: {
    subtitle: 'những điều tôi còn nhớ.',
    proposition: 'Mười ba chương, những câu chuyện ngắn và những nơi vẫn còn ngoài đời. Đọc trước. Khi một nơi khiến bạn tò mò, bước ra ngoài sau.',
    contents: 'Mục lục',
    chapter: 'Chương',
    back: 'Mục lục',
    noStories: 'Chương này đang được biên tập thêm.',
    continue: 'Đọc tiếp',
    begin: 'Bắt đầu',
    stories: 'Câu chuyện',
    places: 'Địa điểm trong chương',
    placeNote: 'Địa điểm là phần để nhìn và đi tới — không phải một cấp nội dung mới của cuốn sách.',
    storyCount: 'câu chuyện',
    openPlace: 'Mở bản đồ',
    chapters: '13 chương',
  },
  en: {
    subtitle: 'the things I still remember.',
    proposition: 'Thirteen chapters, short stories, and places that still exist outside the book. Read first. Step outside when a place makes you curious.',
    contents: 'Contents',
    chapter: 'Chapter',
    back: 'Contents',
    noStories: 'This chapter is still being edited.',
    continue: 'Continue',
    begin: 'Begin',
    stories: 'Stories',
    places: 'Places in this chapter',
    placeNote: 'Places are for seeing and visiting — not another content level inside the book.',
    storyCount: 'stories',
    openPlace: 'Open map',
    chapters: '13 chapters',
  },
} as const;

const latestStoryFromState = (readPageIds: string[]): BookPage | undefined => {
  for (let index = readPageIds.length - 1; index >= 0; index -= 1) {
    const page = getPage(readPageIds[index]);
    if (page) return page;
  }
  return undefined;
};

export const NewBookPage = ({ language }: BookPageProps) => {
  const { chapterId } = useParams<{ chapterId?: string }>();
  const { bookState } = useBookState();
  const c = copy[language];

  if (chapterId) {
    const chapter = getChapter(chapterId);
    if (!chapter) return <div className="book-v3-empty">{c.noStories}</div>;

    const pages = getChapterPages(chapter.id);
    const stories = getChapterStories(pages);
    const places = getChapterPlaces(pages);
    const isRebellion = chapter.number === '13';

    return (
      <main className={`book-v3-chapter ${isRebellion ? 'book-v3-chapter--rebellion' : ''}`}>
        <div className="book-v3-chapter__nav">
          <Link to="/book#contents" aria-label={c.back}><ArrowLeft /></Link>
          <span>{c.chapter} {chapter.number}</span>
        </div>

        <header className="book-v3-chapter__header">
          <p>{String(chapter.number).padStart(2, '0')} / 13</p>
          <h1>{localized(chapter.title, language)}</h1>
          {chapter.intro ? <div>{localized(chapter.intro, language)}</div> : null}
        </header>

        <section className="book-v3-stories" aria-label={c.stories}>
          <div className="book-v3-section-label">
            <span>{c.stories}</span>
            <small>{stories.length} {c.storyCount}</small>
          </div>

          {stories.length ? stories.map((story, index) => (
            <Link key={story.id} to={`/book/page/${story.id}`} className="book-v3-story-row">
              <span className="book-v3-story-row__number">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{localized(story.title, language)}</strong>
                {story.intro ? <p>{localized(story.intro, language)}</p> : null}
              </div>
              <ArrowRight aria-hidden="true" />
            </Link>
          )) : <p className="book-v3-muted">{c.noStories}</p>}
        </section>

        {places.length > 0 ? (
          <section className="book-v3-places" aria-label={c.places}>
            <header>
              <p>{c.places}</p>
              <div>{c.placeNote}</div>
            </header>
            <div className="book-v3-place-grid">
              {places.map((placePage) => {
                const location = placePage.location;
                if (!location) return null;
                const artwork = getBookPageArtwork(placePage);
                return (
                  <a
                    key={placePage.id}
                    href={bookLocationMapUrl(location)}
                    target="_blank"
                    rel="noreferrer"
                    className="book-v3-place-card"
                  >
                    <div className="book-v3-place-card__media">
                      {artwork ? <img src={artwork} alt="" loading="lazy" decoding="async" /> : <span aria-hidden="true"><MapPin /></span>}
                    </div>
                    <div className="book-v3-place-card__body">
                      <small><MapPin aria-hidden="true" />{c.openPlace}</small>
                      <strong>{localized(location.label, language) || localized(placePage.title, language)}</strong>
                      <p>{localized(placePage.title, language)}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        ) : null}
      </main>
    );
  }

  const chapters = getPublishedChapters();
  const firstChapter = chapters[0];
  const firstPage = firstChapter ? getChapterPages(firstChapter.id)[0] : undefined;
  const latestReadPage = latestStoryFromState(bookState.readPageIds);
  const continuePage = latestReadPage ?? firstPage;
  const continueChapter = continuePage ? getChapter(continuePage.chapterId) : firstChapter;

  return (
    <main className="book-v3-home">
      <section className="book-v3-cover">
        <div className="book-v3-cover__edition">BOOK OF DIEN BIEN · {c.chapters}</div>
        <div className="book-v3-cover__title">
          <span>BOOK OF</span>
          <h1>DIEN<br />BIEN</h1>
          <em>{c.subtitle}</em>
        </div>
        <p className="book-v3-cover__statement">{c.proposition}</p>

        {continuePage && continueChapter ? (
          <Link to={`/book/page/${continuePage.id}`} className="book-v3-cover__continue">
            <small>{latestReadPage ? c.continue : c.begin}</small>
            <span>{String(continueChapter.number).padStart(2, '0')}</span>
            <div>
              <strong>{localized(continueChapter.title, language)}</strong>
              <p>{localized(continuePage.title, language)}</p>
            </div>
            <ArrowRight aria-hidden="true" />
          </Link>
        ) : null}

        <a href="#contents" className="book-v3-cover__contents-link">
          {c.contents}<ArrowDown aria-hidden="true" />
        </a>
      </section>

      <section id="contents" className="book-v3-contents">
        <header>
          <p>BOOK OF DIEN BIEN</p>
          <h2>{c.contents}</h2>
        </header>

        <div className="book-v3-contents__list">
          {chapters.map((chapter) => {
            const stories = getChapterStories(getChapterPages(chapter.id));
            const isRebellion = chapter.number === '13';
            return (
              <Link key={chapter.id} to={`/book/chapter/${chapter.id}`} className={isRebellion ? 'is-rebellion' : ''}>
                <span>{String(chapter.number).padStart(2, '0')}</span>
                <div>
                  <strong>{localized(chapter.title, language)}</strong>
                  {chapter.intro ? <p>{localized(chapter.intro, language)}</p> : null}
                  <small>{stories.length} {c.storyCount}</small>
                </div>
                <ArrowRight aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
};
