import { useEffect, useRef } from 'react';
import type { LanguageCode } from '../types/task';
import { BookChapterMenu } from './BookChapterMenu';

type BookChapterDrawerProps = {
  language: LanguageCode;
  onClose: () => void;
};

export const BookChapterDrawer = ({ language, onClose }: BookChapterDrawerProps) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )].filter((element) => element.getAttribute('aria-hidden') !== 'true' && element.offsetParent !== null);

      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div className="game-book-drawer" role="presentation" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        id="game-book-chapter-drawer"
        className="game-book-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label={language === 'vi' ? 'Mục lục các chương' : 'Book chapters'}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="game-book-drawer__handle" aria-hidden="true" />
        <BookChapterMenu language={language} onClose={onClose} onNavigate={onClose} compact />
      </div>
    </div>
  );
};
