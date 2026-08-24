import { ArrowRight, BookmarkX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBookPageIllustration } from '../data/bookIllustrations';
import { useBookState } from '../hooks/useBookState';
import { getChapter, getPage } from '../services/bookContent';
import { toggleSavedBookPage } from '../services/bookState';
import type { BookLocalizedText } from '../types/book';
import type { LanguageCode } from '../types/task';
import './book-utility-v2.css';

const localized = (value: BookLocalizedText | undefined, language: LanguageCode): string =>
  value?.[language] ?? value?.vi ?? value?.en ?? '';

const copy = {
  vi: {
    back: 'Về Book',
    eyebrow: 'BOOK OF DIEN BIEN · DẤU TRANG',
    title: 'Dấu trang',
    description: 'Những trang bạn muốn quay lại. Chúng được lưu riêng cho Book trên thiết bị này.',
    empty: 'Chưa có trang nào được đánh dấu.',
    remove: 'Bỏ dấu',
    open: 'Đọc lại',
  },
  en: {
    back: 'Back to Book',
    eyebrow: 'BOOK OF DIEN BIEN · BOOKMARKS',
    title: 'Bookmarks',
    description: 'Pages you want to return to. They are stored separately for the Book on this device.',
    empty: 'No bookmarked pages yet.',
    remove: 'Remove',
    open: 'Read again',
  },
} as const;

export const SavedBookPage = ({ language }: { language: LanguageCode }) => {
  const { savedState } = useBookState();
  const c = copy[language];
  const pages = savedState.pageIds
    .map((pageId) => getPage(pageId))
    .filter((page): page is NonNullable<typeof page> => Boolean(page));

  return (
    <div className="book-utility-v2">
      <Link to="/book" className="book-utility-v2__back">← {c.back}</Link>

      <header className="book-utility-v2__header">
        <p className="book-utility-v2__eyebrow">{c.eyebrow}</p>
        <h1>{c.title}</h1>
        <p>{c.description}</p>
      </header>

      {pages.length === 0 ? (
        <p className="book-utility-v2__empty">{c.empty}</p>
      ) : (
        <section className="book-utility-v2__section">
          <div className="book-utility-v2__section-head">
            <div>
              <p>BOOK OF DIEN BIEN</p>
              <h2>{c.title}</h2>
            </div>
            <span>{pages.length}</span>
          </div>

          <div className="book-utility-v2__list">
            {pages.map((page) => {
              const chapter = getChapter(page.chapterId);
              const illustration = getBookPageIllustration(page.id);
              return (
                <article key={page.id} className="book-utility-v2__row book-utility-v2__row--illustrated">
                  {illustration ? (
                    <img
                      className="book-utility-v2__thumb"
                      src={illustration}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                  <div>
                    <p className="book-utility-v2__meta">{chapter?.number} · {chapter ? localized(chapter.title, language) : ''}</p>
                    <h3>{localized(page.title, language)}</h3>
                    <div className="book-utility-v2__row-actions">
                      <Link to={`/book/chapter/${page.chapterId}#story-${page.id}`}>{c.open}<ArrowRight /></Link>
                      <button type="button" onClick={() => toggleSavedBookPage(page.id)}><BookmarkX />{c.remove}</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
