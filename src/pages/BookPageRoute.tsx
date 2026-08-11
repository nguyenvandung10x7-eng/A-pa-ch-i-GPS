import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBookState } from '../hooks/useBookState';
import { getPage } from '../services/bookContent';
import { markBookPageRead, toggleSavedBookPage } from '../services/bookState';
import type { LanguageCode } from '../types/task';
import { BookPage } from './BookPage';

type BookPageRouteProps = {
  language: LanguageCode;
};

const copy = {
  vi: { save: 'Lưu trang', saved: 'Đã lưu', read: 'Đã đọc' },
  en: { save: 'Save page', saved: 'Saved', read: 'Read' },
} as const;

export const BookPageRoute = ({ language }: BookPageRouteProps) => {
  const { pageId } = useParams<{ pageId?: string }>();
  const page = pageId ? getPage(pageId) : undefined;
  const { bookState, savedState } = useBookState();
  const c = copy[language];

  useEffect(() => {
    if (page) markBookPageRead(page.id);
  }, [page?.id]);

  if (!page) return <BookPage language={language} />;

  const saved = savedState.pageIds.includes(page.id);
  const read = bookState.readPageIds.includes(page.id);

  return (
    <div>
      <div className="mx-auto flex max-w-3xl items-center justify-end gap-2 px-1 pt-4 sm:pt-6">
        {read ? (
          <span className="rounded-full bg-[rgba(231,225,212,0.8)] px-3 py-2 text-xs font-bold text-[var(--forest-700)] ring-1 ring-[rgba(61,84,52,0.12)]">
            {c.read}
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => toggleSavedBookPage(page.id)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[rgba(247,242,231,0.88)] px-4 py-2 text-sm font-black text-[var(--forest-900)] ring-1 ring-[rgba(91,67,38,0.14)] transition hover:-translate-y-px"
          aria-pressed={saved}
        >
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {saved ? c.saved : c.save}
        </button>
      </div>
      <BookPage language={language} />
    </div>
  );
};
