import { useEffect, useState } from 'react';
import { BookOpen, Languages, Play, Settings, Volume2, VolumeX, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  hasPhiengLoiSave,
  persistPhiengLoiMuted,
  readPhiengLoiMuted,
} from '../services/phiengLoiSession';
import type { LanguageCode } from '../types/task';
import '../experiences-hub.css';

type ExperiencesHubPageProps = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
};

export const ExperiencesHubPage = ({ language, setLanguage }: ExperiencesHubPageProps) => {
  const vi = language === 'vi';
  const [hasSave, setHasSave] = useState(hasPhiengLoiSave);
  const [muted, setMuted] = useState(readPhiengLoiMuted);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setHasSave(hasPhiengLoiSave());
    window.addEventListener('focus', refresh);
    window.addEventListener('pageshow', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('pageshow', refresh);
    };
  }, []);

  const toggleSound = () => {
    setMuted((current) => {
      const next = !current;
      persistPhiengLoiMuted(next);
      return next;
    });
  };

  return (
    <main className="phieng-wait" aria-labelledby="phieng-wait-title">
      <div className="phieng-wait__scene" aria-hidden="true" />
      <div className="phieng-wait__pixels" aria-hidden="true" />
      <header className="phieng-wait__header">
        <strong>BOOK OF DIEN BIEN</strong>
        <button type="button" onClick={() => setLanguage(vi ? 'en' : 'vi')} aria-label={vi ? 'Switch to English' : 'Chuyển sang tiếng Việt'}>
          <Languages aria-hidden="true" />{language.toUpperCase()}
        </button>
      </header>

      <section className="phieng-wait__menu">
        <p>{vi ? 'MỘT BẢN NHỎ · CHUYỆN KHÔNG NHỎ' : 'ONE SMALL VILLAGE · TOO MUCH TROUBLE'}</p>
        <h1 id="phieng-wait-title">PHIÊNG LƠI</h1>
        <span>{vi ? 'Bạn chỉ muốn đi qua bản. Phiêng Lơi có ý kiến khác.' : 'You only want to cross the village. Phiêng Lơi has other ideas.'}</span>
        <nav aria-label={vi ? 'Menu chờ' : 'Waiting menu'}>
          <Link className="is-play" to={hasSave ? '/phieng-loi?resume=1' : '/phieng-loi?new=1'}>
            <Play aria-hidden="true" />
            <span>{hasSave ? (vi ? 'TIẾP TỤC' : 'CONTINUE') : (vi ? 'CHƠI' : 'PLAY')}</span>
          </Link>
          <Link to="/book"><BookOpen aria-hidden="true" /><span>BOOK</span></Link>
          <button type="button" onClick={() => setSettingsOpen(true)}><Settings aria-hidden="true" /><span>{vi ? 'CÀI ĐẶT' : 'SETTINGS'}</span></button>
        </nav>
        <small>{vi ? 'Di chuyển · PHÀ ƠI! · tự chịu hậu quả' : 'Move · PHÀ ƠI! · live with the consequences'}</small>
      </section>

      <footer className="phieng-wait__footer"><span>ĐIỆN BIÊN · VIỆT NAM</span><span>PHÀ ƠI! · ĐI QUA BẢN</span></footer>

      {settingsOpen ? (
        <div className="phieng-wait__settings-layer" role="presentation">
          <section className="phieng-wait__settings" role="dialog" aria-modal="true" aria-labelledby="phieng-settings-title">
            <button type="button" className="is-close" onClick={() => setSettingsOpen(false)} aria-label={vi ? 'Đóng' : 'Close'}><X aria-hidden="true" /></button>
            <p id="phieng-settings-title">{vi ? 'CÀI ĐẶT' : 'SETTINGS'}</p>
            <button type="button" onClick={toggleSound}>
              {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
              <span>{muted ? (vi ? 'Âm thanh đang tắt' : 'Sound is off') : (vi ? 'Âm thanh đang bật' : 'Sound is on')}</span>
            </button>
            <button type="button" onClick={() => setLanguage(vi ? 'en' : 'vi')}>
              <Languages aria-hidden="true" />
              <span>{vi ? 'Switch to English' : 'Chuyển sang tiếng Việt'}</span>
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
};
