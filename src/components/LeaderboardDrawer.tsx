import { useEffect, useRef } from 'react';
import { Trophy, X } from 'lucide-react';
import { LeaderboardPage } from '../pages/LeaderboardPage';
import { translate } from '../services/i18n';
import type { LanguageCode } from '../types/task';

type LeaderboardDrawerProps = {
  language: LanguageCode;
  onClose: () => void;
};

export const LeaderboardDrawer = ({ language, onClose }: LeaderboardDrawerProps) => {
  const dialogRef = useRef<HTMLElement | null>(null);
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
      )].filter((element) => element.offsetParent !== null && element.getAttribute('aria-hidden') !== 'true');

      if (!focusable.length) {
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

  const title = language === 'vi' ? 'Bảng xếp hạng' : 'Leaderboard';
  const subtitle = language === 'vi'
    ? 'Thứ hạng của cộng đồng người chơi'
    : 'Community player ranking';

  return (
    <div className="explore-leaderboard-layer" role="presentation" onMouseDown={onClose}>
      <aside
        ref={dialogRef}
        className="explore-leaderboard-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="explore-leaderboard-sheet__handle" aria-hidden="true" />
        <header className="explore-leaderboard-sheet__head">
          <span><Trophy aria-hidden="true" /></span>
          <div><strong>{title}</strong><small>{subtitle}</small></div>
          <button type="button" onClick={onClose} aria-label={language === 'vi' ? 'Đóng bảng xếp hạng' : 'Close leaderboard'}><X aria-hidden="true" /></button>
        </header>
        <div className="explore-leaderboard-sheet__content">
          <LeaderboardPage language={language} t={(key) => translate(language, key)} />
        </div>
      </aside>
    </div>
  );
};
