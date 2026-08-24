import { useEffect, useRef } from 'react';
import type { LanguageCode } from '../types/task';
import { BookChapterMenu } from './BookChapterMenu';

type BookChapterDrawerProps = {
  language: LanguageCode;
  onClose: () => void;
};

export const BookChapterDrawer = ({ language, onClose }: BookChapterDrawerProps) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="game-book-drawer" role="presentation" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className="game-book-drawer__panel"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="game-book-drawer__handle" aria-hidden="true" />
        <BookChapterMenu language={language} onClose={onClose} onNavigate={onClose} compact />
      </div>
    </div>
  );
};
