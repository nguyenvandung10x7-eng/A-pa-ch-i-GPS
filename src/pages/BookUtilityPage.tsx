import { useState } from 'react';
import { ArrowRight, Loader2, MapPin, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { bookLocationMapUrl, getLocatedBookItems, type NearMeBookItem } from '../services/bookNearMe';
import { GeolocationRequestError, getCurrentPosition } from '../utils/geo';
import type { LanguageCode } from '../types/task';
import './book-utility-v2.css';

type BookUtilityPageProps = {
  language: LanguageCode;
  mode: 'near-me' | 'saved';
};

type NearMeState = 'idle' | 'loading' | 'ready' | 'error';

const copy = {
  vi: {
    back: 'Về Book',
    nearMe: {
      eyebrow: 'BOOK OF DIEN BIEN · GẦN TÔI',
      title: 'Gần tôi',
      description: 'Dùng vị trí hiện tại để tìm những nơi trong cuốn sách đang ở quanh bạn.',
      privacy: 'Vị trí chỉ được lấy sau khi bạn bấm nút. Book không lưu tọa độ hiện tại vào localStorage.',
      useLocation: 'Dùng vị trí của tôi',
      refresh: 'Cập nhật vị trí',
      locating: 'Đang xác định vị trí…',
      results: 'Những nơi quanh bạn',
      page: 'Trang',
      experience: 'Trải nghiệm',
      read: 'Đọc trang',
      openMap: 'Mở vị trí',
      openExperience: 'Mở trải nghiệm',
      noResults: 'Chưa có trang hoặc trải nghiệm nào được gắn vị trí.',
      denied: 'Bạn chưa cho phép truy cập vị trí. Có thể bật quyền vị trí cho trình duyệt rồi thử lại.',
      unavailable: 'Thiết bị hiện không cung cấp được vị trí.',
      timeout: 'Việc xác định vị trí mất quá lâu. Hãy thử lại ở nơi tín hiệu tốt hơn.',
      genericError: 'Không thể lấy vị trí lúc này. Hãy thử lại.',
    },
    saved: {
      eyebrow: 'BOOK OF DIEN BIEN · DẤU TRANG',
      title: 'Dấu trang',
      description: 'Dấu trang hiện được mở từ mục Tài khoản.',
      note: 'Hãy quay lại Book và mở Dấu trang từ utility sheet.',
    },
  },
  en: {
    back: 'Back to Book',
    nearMe: {
      eyebrow: 'BOOK OF DIEN BIEN · NEAR ME',
      title: 'Near me',
      description: 'Use your current location to find places from the Book around you.',
      privacy: 'Location is requested only after you tap the button. The Book does not store your current coordinates in localStorage.',
      useLocation: 'Use my location',
      refresh: 'Refresh location',
      locating: 'Finding your location…',
      results: 'Places around you',
      page: 'Page',
      experience: 'Experience',
      read: 'Read page',
      openMap: 'Open location',
      openExperience: 'Open experience',
      noResults: 'No located pages or experiences are available yet.',
      denied: 'Location access was not allowed. Enable location permission for the browser and try again.',
      unavailable: 'Your device cannot provide a location right now.',
      timeout: 'Location took too long. Try again where the signal is better.',
      genericError: 'Your location could not be retrieved. Please try again.',
    },
    saved: {
      eyebrow: 'BOOK OF DIEN BIEN · BOOKMARKS',
      title: 'Bookmarks',
      description: 'Bookmarks are available from the Account utility sheet.',
      note: 'Return to the Book and open Bookmarks from the utility sheet.',
    },
  },
} as const;

const formatDistance = (meters: number, language: LanguageCode) => {
  if (meters < 1000) return `${Math.max(1, Math.round(meters))} m`;
  return `${(meters / 1000).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
    minimumFractionDigits: meters < 10000 ? 1 : 0,
    maximumFractionDigits: meters < 10000 ? 1 : 0,
  })} km`;
};

const errorMessageFor = (error: unknown, language: LanguageCode): string => {
  const c = copy[language].nearMe;
  if (!(error instanceof GeolocationRequestError)) return c.genericError;
  if (error.code === 1) return c.denied;
  if (error.code === 2) return c.unavailable;
  if (error.code === 3) return c.timeout;
  return c.genericError;
};

const NearMeResultRow = ({ item, language }: { item: NearMeBookItem; language: LanguageCode }) => {
  const c = copy[language].nearMe;
  const title = item.title[language] ?? item.title.vi;
  const description = item.description?.[language] ?? item.description?.vi;
  const locationLabel = item.location.label?.[language] ?? item.location.label?.vi;
  const isPage = item.kind === 'page';
  const actionLabel = isPage ? c.read : item.externalUrl ? c.openExperience : c.openMap;
  const href = isPage ? `/book/page/${item.pageId}` : item.externalUrl ?? bookLocationMapUrl(item.location);
  const external = !isPage;

  return (
    <article className="book-utility-v2__row">
      <div>
        <p className="book-utility-v2__meta">{isPage ? c.page : c.experience} · {item.chapterNumber}</p>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
        {locationLabel ? <div className="book-utility-v2__place"><MapPin />{locationLabel}</div> : null}
        <div className="book-utility-v2__row-actions">
          {external ? (
            <a href={href} target="_blank" rel="noreferrer">{actionLabel}<ArrowRight /></a>
          ) : (
            <Link to={href}>{actionLabel}<ArrowRight /></Link>
          )}
        </div>
      </div>
      <span className="book-utility-v2__distance">{formatDistance(item.distanceMeters, language)}</span>
    </article>
  );
};

export const BookUtilityPage = ({ language, mode }: BookUtilityPageProps) => {
  const c = copy[language];
  const [nearMeState, setNearMeState] = useState<NearMeState>('idle');
  const [nearMeItems, setNearMeItems] = useState<NearMeBookItem[]>([]);
  const [nearMeError, setNearMeError] = useState('');

  const locate = async () => {
    setNearMeState('loading');
    setNearMeError('');
    try {
      const position = await getCurrentPosition();
      setNearMeItems(getLocatedBookItems({ lat: position.coords.latitude, lng: position.coords.longitude }));
      setNearMeState('ready');
    } catch (error) {
      setNearMeItems([]);
      setNearMeError(errorMessageFor(error, language));
      setNearMeState('error');
    }
  };

  if (mode === 'saved') {
    const content = c.saved;
    return (
      <div className="book-utility-v2">
        <Link to="/book" className="book-utility-v2__back">← {c.back}</Link>
        <header className="book-utility-v2__header">
          <p className="book-utility-v2__eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p>{content.description}</p>
        </header>
        <p className="book-utility-v2__empty">{content.note}</p>
      </div>
    );
  }

  const content = c.nearMe;

  return (
    <div className="book-utility-v2">
      <Link to="/book" className="book-utility-v2__back">← {c.back}</Link>

      <header className="book-utility-v2__header">
        <p className="book-utility-v2__eyebrow">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        <div className="book-utility-v2__privacy">{content.privacy}</div>
        <button
          type="button"
          onClick={() => { void locate(); }}
          disabled={nearMeState === 'loading'}
          className="book-utility-v2__action"
        >
          {nearMeState === 'loading' ? <Loader2 className="animate-spin" /> : <Navigation />}
          {nearMeState === 'loading' ? content.locating : nearMeState === 'ready' ? content.refresh : content.useLocation}
        </button>
      </header>

      {nearMeState === 'error' ? <p className="book-utility-v2__error">{nearMeError}</p> : null}

      {nearMeState === 'ready' ? (
        <section className="book-utility-v2__section">
          <div className="book-utility-v2__section-head">
            <div>
              <p>BOOK OF DIEN BIEN</p>
              <h2>{content.results}</h2>
            </div>
            <span>{nearMeItems.length}</span>
          </div>

          {nearMeItems.length === 0 ? (
            <p className="book-utility-v2__empty">{content.noResults}</p>
          ) : (
            <div className="book-utility-v2__list">
              {nearMeItems.map((item) => <NearMeResultRow key={item.id} item={item} language={language} />)}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
};
