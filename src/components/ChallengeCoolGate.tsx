import { useEffect, useRef } from 'react';
import { ArrowRight, ShieldAlert, X } from 'lucide-react';
import type { LanguageCode } from '../types/task';

type ChallengeCoolGateProps = {
  language: LanguageCode;
  onAccept: () => void;
  onDecline: () => void;
};

const copy = {
  vi: {
    eyebrow: 'BOOK OF DIEN BIEN · KIỂM TRA TRUY CẬP',
    stamp: 'NGẦU+',
    warning: 'KHU VỰC CÓ ĐỘ NGẦU CAO',
    title: 'Xác nhận trước khi vào.',
    description: 'Phía sau cánh cửa này có GPS, vài nhiệm vụ hơi liều và một bảng xếp hạng. Bạn tự chịu trách nhiệm về độ ngầu của mình.',
    note: 'Không cần giấy tờ. Chúng tôi tin lời bạn.',
    accept: 'OK, tôi ngầu',
    decline: 'Xin lỗi, tôi không ngầu',
  },
  en: {
    eyebrow: 'BOOK OF DIEN BIEN · ACCESS CHECK',
    stamp: 'COOL+',
    warning: 'HIGH-COOLNESS AREA',
    title: 'Confirm before entering.',
    description: 'Behind this door: GPS, a few questionable missions and a leaderboard. You are responsible for your own coolness.',
    note: 'No ID required. We trust you.',
    accept: 'OK, I am cool',
    decline: 'Sorry, I am not cool',
  },
} as const;

export const ChallengeCoolGate = ({ language, onAccept, onDecline }: ChallengeCoolGateProps) => {
  const acceptButtonRef = useRef<HTMLButtonElement | null>(null);
  const c = copy[language];

  useEffect(() => {
    acceptButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDecline();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDecline]);

  return (
    <div className="challenge-cool-gate" role="dialog" aria-modal="true" aria-labelledby="challenge-cool-gate-title" aria-describedby="challenge-cool-gate-description">
      <div className="challenge-cool-gate__noise" aria-hidden="true" />
      <section className="challenge-cool-gate__panel">
        <header className="challenge-cool-gate__header">
          <span>{c.eyebrow}</span>
          <ShieldAlert aria-hidden="true" />
        </header>

        <div className="challenge-cool-gate__body">
          <div className="challenge-cool-gate__stamp" aria-hidden="true">
            <span>{c.stamp}</span>
          </div>
          <p className="challenge-cool-gate__warning">{c.warning}</p>
          <h1 id="challenge-cool-gate-title">{c.title}</h1>
          <p id="challenge-cool-gate-description" className="challenge-cool-gate__description">{c.description}</p>
          <small>{c.note}</small>
        </div>

        <div className="challenge-cool-gate__actions">
          <button ref={acceptButtonRef} type="button" className="challenge-cool-gate__accept" onClick={onAccept}>
            <span>{c.accept}</span><ArrowRight aria-hidden="true" />
          </button>
          <button type="button" className="challenge-cool-gate__decline" onClick={onDecline}>
            <X aria-hidden="true" /><span>{c.decline}</span>
          </button>
        </div>

        <footer aria-hidden="true">
          <span>BOOK / FIELD / 01</span>
          <span>DIEN BIEN</span>
        </footer>
      </section>
    </div>
  );
};
