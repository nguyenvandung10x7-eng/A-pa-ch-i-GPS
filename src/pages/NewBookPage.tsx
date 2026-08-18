import { ArrowLeft, ArrowRight, BookOpen, Headphones, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getChapter, getChapterPages, getPublishedChapters } from '../services/bookContent';
import type { BookLocalizedText } from '../types/book';
import type { LanguageCode } from '../types/task';
import './book-rebuild.css';

type BookPageProps = { language: LanguageCode };

const localized = (value: BookLocalizedText | undefined, language: LanguageCode): string =>
  value?.[language] ?? value?.vi ?? value?.en ?? '';

const chapterArtwork: Record<string, string | undefined> = {
  'chapter-01-dong-song': '/images/tasks/canh-dong-muong-thanh-cat-banh.webp',
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
};

const copy = {
  vi: {
    kicker: 'BOOK OF DIEN BIEN',
    subtitle: 'Những trang viết về một vùng đất — đọc chậm, nghe một chút, rồi bước ra ngoài khi bạn muốn.',
    contents: 'Mục lục', chapter: 'Chương', pages: 'trang', back: 'Mục lục',
    explore: 'Khám phá nơi này', noPages: 'Chương này đang được biên tập thêm.',
  },
  en: {
    kicker: 'BOOK OF DIEN BIEN',
    subtitle: 'Pages about a place — read slowly, listen for a while, then step outside when you want to.',
    contents: 'Contents', chapter: 'Chapter', pages: 'pages', back: 'Contents',
    explore: 'Explore this place', noPages: 'This chapter is still being edited.',
  },
} as const;

export const NewBookPage = ({ language }: BookPageProps) => {
  const { chapterId } = useParams<{ chapterId?: string }>();
  const c = copy[language];

  if (chapterId) {
    const chapter = getChapter(chapterId);
    if (!chapter) return <div className="new-book-empty">{c.noPages}</div>;

    const pages = getChapterPages(chapter.id);
    const hero = chapterArtwork[chapter.id];
    const firstPage = pages[0];

    return (
      <div className="new-book-reader">
        <header className="new-book-topbar">
          <Link to="/book" className="new-book-icon" aria-label={c.back}><ArrowLeft /></Link>
          <div><small>{chapter.number}</small><strong>{localized(chapter.title, language)}</strong></div>
          <Headphones aria-hidden="true" />
        </header>

        {hero ? <div className="new-book-hero"><img src={hero} alt="" /><span>{c.chapter} {chapter.number}</span></div> : null}

        <article className="new-book-paper">
          <p className="new-book-overline">{c.kicker} · {chapter.number}</p>
          <h1>{localized(chapter.title, language)}</h1>
          {chapter.intro ? <p className="new-book-deck">{localized(chapter.intro, language)}</p> : null}

          <div className="new-book-page-list">
            {pages.length ? pages.map((page, index) => (
              <Link key={page.id} to={`/book/page/${page.id}`} className="new-book-page-link">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><strong>{localized(page.title, language)}</strong>{page.intro ? <small>{localized(page.intro, language)}</small> : null}</div>
                <ArrowRight />
              </Link>
            )) : <p className="new-book-muted">{c.noPages}</p>}
          </div>

          {firstPage?.location ? <Link to="/nearby" className="new-book-action"><MapPin />{c.explore}</Link> : null}
        </article>
      </div>
    );
  }

  const chapters = getPublishedChapters();
  const featured = chapters[0];
  const featuredImage = featured ? chapterArtwork[featured.id] : undefined;

  return (
    <div className="new-book-home">
      <section className="new-book-cover">
        {featuredImage ? <img src={featuredImage} alt="" /> : null}
        <div className="new-book-cover-copy">
          <p>{c.kicker}</p>
          <h1>BOOK OF<br />DIEN BIEN</h1>
          <span>{c.subtitle}</span>
        </div>
      </section>

      <section className="new-book-contents">
        <div className="new-book-heading"><BookOpen /><div><p>{c.kicker}</p><h2>{c.contents}</h2></div></div>
        <div>
          {chapters.map((chapter) => {
            const image = chapterArtwork[chapter.id];
            const pages = getChapterPages(chapter.id);
            return (
              <Link key={chapter.id} to={`/book/chapter/${chapter.id}`} className="new-book-chapter">
                <div className="new-book-thumb">{image ? <img src={image} alt="" /> : <span>{chapter.number}</span>}</div>
                <div className="new-book-chapter-copy">
                  <div><span>{chapter.number}</span><strong>{localized(chapter.title, language)}</strong></div>
                  <p>{localized(chapter.intro, language)}</p>
                  <small>{pages.length} {c.pages}</small>
                </div>
                <ArrowRight />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};
