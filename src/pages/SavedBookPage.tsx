import { Bookmark, BookmarkX, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBookState } from '../hooks/useBookState';
import { getChapter, getPage } from '../services/bookContent';
import { toggleSavedBookPage } from '../services/bookState';
import type { BookLocalizedText } from '../types/book';
import type { LanguageCode } from '../types/task';

const localized = (value: BookLocalizedText | undefined, language: LanguageCode): string =>
  value?.[language] ?? value?.vi ?? value?.en ?? '';

const copy = {
  vi: {
    back: 'Về Book',
    eyebrow: 'BOOK OF DIEN BIEN · SAVED',
    title: 'Đã lưu',
    description: 'Những trang bạn muốn quay lại được lưu riêng cho Book trên thiết bị này.',
    empty: 'Chưa có trang nào được lưu. Khi đang đọc, bấm “Lưu trang” để giữ lại một trang.',
    remove: 'Bỏ lưu',
    open: 'Mở trang',
  },
  en: {
    back: 'Back to Book',
    eyebrow: 'BOOK OF DIEN BIEN · SAVED',
    title: 'Saved',
    description: 'Pages you want to return to are stored separately for Book on this device.',
    empty: 'No saved pages yet. While reading, use “Save page” to keep one here.',
    remove: 'Remove',
    open: 'Open page',
  },
} as const;

export const SavedBookPage = ({ language }: { language: LanguageCode }) => {
  const { savedState } = useBookState();
  const c = copy[language];
  const pages = savedState.pageIds
    .map((pageId) => getPage(pageId))
    .filter((page): page is NonNullable<typeof page> => Boolean(page));

  return (
    <div className="mx-auto max-w-4xl py-8 sm:py-14">
      <Link to="/book" className="text-sm font-bold text-[var(--forest-700)] hover:text-[var(--forest-950)]">
        ← {c.back}
      </Link>

      <header className="mt-8 rounded-[2rem] bg-[rgba(247,242,231,0.76)] px-5 py-9 shadow-[0_24px_60px_rgba(50,45,32,0.08)] ring-1 ring-[rgba(91,67,38,0.1)] sm:px-10 sm:py-12">
        <div className="flex items-center gap-3 text-[var(--earth-700)]">
          <Bookmark className="h-5 w-5" />
          <p className="text-xs font-black uppercase tracking-[0.24em]">{c.eyebrow}</p>
        </div>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-[var(--forest-950)] sm:text-6xl">{c.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--forest-700)]">{c.description}</p>
      </header>

      {pages.length === 0 ? (
        <p className="mt-6 rounded-[1.5rem] bg-[rgba(230,220,196,0.58)] px-5 py-5 text-sm leading-7 text-[var(--forest-700)] ring-1 ring-[rgba(91,67,38,0.1)]">
          {c.empty}
        </p>
      ) : (
        <div className="mt-6 grid gap-3">
          {pages.map((page) => {
            const chapter = getChapter(page.chapterId);
            return (
              <article key={page.id} className="rounded-[1.6rem] bg-[rgba(247,242,231,0.76)] p-5 ring-1 ring-[rgba(91,67,38,0.1)]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--forest-600)]">
                  {chapter?.number} · {chapter ? localized(chapter.title, language) : ''}
                </p>
                <h2 className="mt-2 text-xl font-black text-[var(--forest-950)]">{localized(page.title, language)}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to={`/book/page/${page.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--earth-800)] px-4 py-2 text-sm font-black text-white">
                    {c.open}<ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleSavedBookPage(page.id)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[rgba(255,255,255,0.72)] px-4 py-2 text-sm font-black text-[var(--forest-900)] ring-1 ring-[rgba(61,84,52,0.13)]"
                  >
                    <BookmarkX className="h-4 w-4" />{c.remove}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
