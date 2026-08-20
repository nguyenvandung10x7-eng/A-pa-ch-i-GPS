import { ArrowDown, ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useBookState } from '../hooks/useBookState';
import { getChapter, getChapterPages, getPage, getPublishedChapters } from '../services/bookContent';
import type { BookLocalizedText } from '../types/book';
import type { LanguageCode } from '../types/task';
import './book-rebuild.css';
import './chapter13-night.css';

type BookPageProps = { language: LanguageCode };

const localized = (value: BookLocalizedText | undefined, language: LanguageCode): string =>
  value?.[language] ?? value?.vi ?? value?.en ?? '';

const chapterArtwork: Record<string, string | undefined> = {
  'chapter-01-dong-song': '/images/book/chapter-01-dong-song/chapter-01-dong-song-hero-01.webp',
  'chapter-02-mua-he': '/images/tasks/cong-vien-hoa-ban-mthen.webp',
  'chapter-03-mot-dien-bien-rat-nho': '/images/tasks/ban-phieng-loi-mthen.webp',
  'chapter-04-pho-cu': '/images/tasks/quang-truong-7-5-mthen.webp',
  'chapter-05-thi-xa': '/images/tasks/cho-noong-bua-trai-ban.webp',
  'chapter-06-nhung-nam-2000': '/images/tasks/quang-truong-7-5-mthen.webp',
  'chapter-05-long-chao': '/images/tasks/canh-dong-muong-thanh-cat-banh.webp',
  'chapter-08-nhung-ngon-doi': '/images/tasks/doi-a1-khoanh-khac-tuong-niem.webp',
  'chapter-06-1954': '/images/tasks/bao-tang-chien-thang-dien-bien-phu-trai-nghiem.webp',
  'chapter-09-nhung-thu-kho-quen': '/images/tasks/thac-ke-nenh-mthen.webp',
  'chapter-11-di-ve-phia-tay': '/images/tasks/cot-co-a-pa-chai.webp',
  'chapter-13-su-noi-loan-va-thanh-pho-ban-dem': '/images/book/chapter-13-su-noi-loan-va-thanh-pho-ban-dem/chapter-13-thanh-pho-ban-dem-hero-01.webp',
};

const copy = {
  vi: {
    subtitle: 'những điều tôi còn nhớ.',
    proposition: 'Một cuốn sách để đọc, nghe và bước ra ngoài. Điện Biên hiện ra qua ký ức, những nơi vẫn còn, và những việc chỉ có thể hiểu khi tự mình đi đến.',
    contents: 'Mục lục',
    chapter: 'Chương',
    back: 'Mục lục',
    noPages: 'Chương này đang được biên tập thêm.',
    continue: 'Tiếp tục đọc',
    begin: 'Bắt đầu đọc',
    places: 'Những nơi trong chương',
    pageCount: 'trang',
  },
  en: {
    subtitle: 'the things I still remember.',
    proposition: 'A book to read, listen to, and step outside from. Dien Bien appears through memory, places that remain, and things that only make sense when you go there yourself.',
    contents: 'Contents',
    chapter: 'Chapter',
    back: 'Contents',
    noPages: 'This chapter is still being edited.',
    continue: 'Continue reading',
    begin: 'Begin reading',
    places: 'Places in this chapter',
    pageCount: 'pages',
  },
} as const;

export const NewBookPage = ({ language }: BookPageProps) => {
  const { chapterId } = useParams<{ chapterId?: string }>();
  const { bookState } = useBookState();
  const c = copy[language];

  if (chapterId) {
    const chapter = getChapter(chapterId);
    if (!chapter) return <div className="book-v2-empty">{c.noPages}</div>;

    const pages = getChapterPages(chapter.id);
    const hero = chapterArtwork[chapter.id];
    const chapterPlaces = pages.filter((page) => page.location);
    const isRebellion = chapter.number === '13';

    return (
      <main className={`book-v2-chapter ${isRebellion ? 'book-v2-chapter--rebellion' : ''}`}>
        <div className="book-v2-chapter__nav">
          <Link to="/book#contents" aria-label={c.back}><ArrowLeft /></Link>
          <span>{c.chapter} {chapter.number}</span>
        </div>

        <header className="book-v2-chapter__header">
          <p>{String(chapter.number).padStart(2, '0')} / 13</p>
          <h1>{localized(chapter.title, language)}</h1>
          {chapter.intro ? <div className="book-v2-chapter__intro">{localized(chapter.intro, language)}</div> : null}
        </header>

        {hero ? (
          <figure className="book-v2-chapter__hero">
            <img src={hero} alt="" loading="eager" decoding="async" />
          </figure>
        ) : null}

        <section className="book-v2-chapter__pages" aria-label={c.contents}>
          {pages.length ? pages.map((page, index) => (
            <Link key={page.id} to={`/book/page/${page.id}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{localized(page.title, language)}</strong>
                {page.intro ? <small>{localized(page.intro, language)}</small> : null}
              </div>
              <ArrowRight aria-hidden="true" />
            </Link>
          )) : <p className="book-v2-muted">{c.noPages}</p>}
        </section>

        {chapterPlaces.length > 0 ? (
          <section className="book-v2-chapter__places">
            <p>{c.places}</p>
            {chapterPlaces.map((page) => (
              <Link key={page.id} to={`/book/page/${page.id}`}>
                <MapPin aria-hidden="true" />
                <span>{localized(page.location?.label, language) || localized(page.title, language)}</span>
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
          </section>
        ) : null}
      </main>
    );
  }

  const chapters = getPublishedChapters();
  const firstChapter = chapters[0];
  const firstPage = firstChapter ? getChapterPages(firstChapter.id)[0] : undefined;
  const latestReadId = bookState.readPageIds[bookState.readPageIds.length - 1];
  const latestReadPage = latestReadId ? getPage(latestReadId) : undefined;
  const continuePage = latestReadPage ?? firstPage;
  const continueChapter = continuePage ? getChapter(continuePage.chapterId) : firstChapter;
  const coverImage = firstChapter ? chapterArtwork[firstChapter.id] : undefined;

  return (
    <main className="book-v2-home">
      <section className="book-v2-cover">
        <div className="book-v2-cover__image">
          {coverImage ? <img src={coverImage} alt="" loading="eager" decoding="async" /> : null}
          <div className="book-v2-cover__veil" />
          <div className="book-v2-cover__title">
            <span>BOOK OF</span>
            <h1>DIEN BIEN</h1>
            <em>{c.subtitle}</em>
          </div>

          {continuePage && continueChapter ? (
            <Link to={`/book/page/${continuePage.id}`} className="book-v2-cover__continue">
              <small>{latestReadPage ? c.continue : c.begin}</small>
              <div>
                <span>{continueChapter.number}</span>
                <strong>{localized(continueChapter.title, language)}</strong>
              </div>
              <p>{localized(continuePage.title, language)}</p>
              <ArrowRight aria-hidden="true" />
            </Link>
          ) : null}

          <a href="#contents" className="book-v2-cover__contents-link">
            {c.contents}<ArrowDown aria-hidden="true" />
          </a>
        </div>
      </section>

      <section id="contents" className="book-v2-contents">
        <header>
          <p>BOOK OF DIEN BIEN</p>
          <h2>{c.contents}</h2>
          <div>{c.proposition}</div>
        </header>

        <div className="book-v2-contents__list">
          {chapters.map((chapter) => {
            const pages = getChapterPages(chapter.id);
            const isRebellion = chapter.number === '13';
            return (
              <Link key={chapter.id} to={`/book/chapter/${chapter.id}`} className={isRebellion ? 'is-rebellion' : ''}>
                <span>{String(chapter.number).padStart(2, '0')}</span>
                <div>
                  <strong>{localized(chapter.title, language)}</strong>
                  {chapter.intro ? <p>{localized(chapter.intro, language)}</p> : null}
                  <small>{pages.length} {c.pageCount}</small>
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
