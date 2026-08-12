import { useState } from 'react';
import { Bookmark, Loader2, Map, MapPin, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { bookLocationMapUrl, getLocatedBookItems, type NearMeBookItem } from '../services/bookNearMe';
import { GeolocationRequestError, getCurrentPosition } from '../utils/geo';
import type { LanguageCode } from '../types/task';

type BookUtilityPageProps = {
  language: LanguageCode;
  mode: 'near-me' | 'saved';
};

type NearMeState = 'idle' | 'loading' | 'ready' | 'error';

const copy = {
  vi: {
    back: 'Về Book',
    nearMe: {
      eyebrow: 'BOOK OF DIEN BIEN · NEAR ME',
      title: 'Gần tôi',
      description: 'Dùng vị trí hiện tại để tìm những trang ký ức và trải nghiệm ở gần bạn. Book vẫn đọc đầy đủ nếu bạn không bật GPS.',
      privacy: 'Vị trí chỉ được lấy khi bạn bấm nút bên dưới. Trang này không ghi vị trí vào localStorage và không thay đổi dữ liệu thử thách cũ.',
      useLocation: 'Dùng vị trí của tôi',
      refresh: 'Cập nhật vị trí',
      locating: 'Đang xác định vị trí…',
      results: 'Gần bạn lúc này',
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
      eyebrow: 'BOOK OF DIEN BIEN · SAVED',
      title: 'Đã lưu',
      description: 'Những trang bạn muốn quay lại sẽ xuất hiện ở đây khi lớp trạng thái Book được bổ sung.',
      note: 'Hiện tại đây chỉ là route shell. Chưa có dữ liệu Saved mới được ghi vào localStorage.',
    },
  },
  en: {
    back: 'Back to Book',
    nearMe: {
      eyebrow: 'BOOK OF DIEN BIEN · NEAR ME',
      title: 'Near me',
      description: 'Use your current location to find nearby memory pages and experiences. The Book remains fully readable without GPS.',
      privacy: 'Your location is requested only after you tap the button below. This page does not store your position in localStorage or change legacy challenge data.',
      useLocation: 'Use my location',
      refresh: 'Refresh location',
      locating: 'Finding your location…',
      results: 'Near you now',
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
      eyebrow: 'BOOK OF DIEN BIEN · SAVED',
      title: 'Saved',
      description: 'Pages you want to return to will appear here once Book state is added.',
      note: 'This is currently only a route shell. No new Saved data is written to localStorage yet.',
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

const NearMeResultCard = ({ item, language }: { item: NearMeBookItem; language: LanguageCode }) => {
  const c = copy[language].nearMe;
  const title = item.title[language] ?? item.title.vi;
  const description = item.description?.[language] ?? item.description?.vi;
  const locationLabel = item.location.label?.[language] ?? item.location.label?.vi;
  const isPage = item.kind === 'page';
  const actionLabel = isPage ? c.read : item.externalUrl ? c.openExperience : c.openMap;
  const href = isPage ? `/book/page/${item.pageId}` : item.externalUrl ?? bookLocationMapUrl(item.location);
  const external = !isPage;

  return (
    <article className="rounded-[1.55rem] bg-[rgba(252,249,241,0.88)] p-5 ring-1 ring-[rgba(91,67,38,0.1)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-[var(--earth-700)]">
            {isPage ? c.page : c.experience} · {item.chapterNumber}
          </p>
          <h2 className="mt-2 text-xl font-black leading-tight text-[var(--forest-950)]">{title}</h2>
        </div>
        <div className="shrink-0 rounded-full bg-[rgba(230,220,196,0.72)] px-3 py-1.5 text-sm font-black text-[var(--forest-800)]">
          {formatDistance(item.distanceMeters, language)}
        </div>
      </div>

      {description && <p className="mt-3 text-sm leading-6 text-[var(--forest-700)]">{description}</p>}
      {locationLabel && (
        <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[var(--earth-700)]">
          <MapPin className="h-4 w-4" />
          {locationLabel}
        </p>
      )}

      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--forest-900)] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[var(--forest-700)]"
        >
          {item.externalUrl ? <Navigation className="h-4 w-4" /> : <Map className="h-4 w-4" />}
          {actionLabel}
        </a>
      ) : (
        <Link
          to={href}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--forest-900)] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[var(--forest-700)]"
        >
          {actionLabel}
        </Link>
      )}
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
      <div className="mx-auto max-w-4xl py-8 sm:py-14">
        <Link to="/book" className="text-sm font-bold text-[var(--forest-700)] hover:text-[var(--forest-950)]">← {c.back}</Link>
        <section className="mt-8 rounded-[2rem] bg-[rgba(247,242,231,0.76)] px-5 py-9 shadow-[0_24px_60px_rgba(50,45,32,0.08)] ring-1 ring-[rgba(91,67,38,0.1)] sm:px-10 sm:py-12">
          <div className="flex items-center gap-3 text-[var(--earth-700)]"><Bookmark className="h-5 w-5" /><p className="text-xs font-black uppercase tracking-[0.24em]">{content.eyebrow}</p></div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-[var(--forest-950)] sm:text-6xl">{content.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--forest-700)]">{content.description}</p>
          <p className="mt-8 rounded-[1.4rem] bg-[rgba(230,220,196,0.58)] px-5 py-4 text-sm leading-7 text-[var(--forest-700)] ring-1 ring-[rgba(91,67,38,0.1)]">{content.note}</p>
        </section>
      </div>
    );
  }

  const content = c.nearMe;

  return (
    <div className="mx-auto max-w-4xl py-8 sm:py-14">
      <Link to="/book" className="text-sm font-bold text-[var(--forest-700)] hover:text-[var(--forest-950)]">← {c.back}</Link>

      <section className="mt-8 rounded-[2rem] bg-[rgba(247,242,231,0.76)] px-5 py-9 shadow-[0_24px_60px_rgba(50,45,32,0.08)] ring-1 ring-[rgba(91,67,38,0.1)] sm:px-10 sm:py-12">
        <div className="flex items-center gap-3 text-[var(--earth-700)]"><MapPin className="h-5 w-5" /><p className="text-xs font-black uppercase tracking-[0.24em]">{content.eyebrow}</p></div>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-[var(--forest-950)] sm:text-6xl">{content.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--forest-700)]">{content.description}</p>
        <p className="mt-7 max-w-2xl text-sm leading-7 text-[var(--forest-600)]">{content.privacy}</p>

        <button
          type="button"
          onClick={() => { void locate(); }}
          disabled={nearMeState === 'loading'}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--forest-900)] px-5 py-3 text-sm font-black text-white transition hover:bg-[var(--forest-700)] disabled:cursor-wait disabled:opacity-70"
        >
          {nearMeState === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          {nearMeState === 'loading' ? content.locating : nearMeState === 'ready' ? content.refresh : content.useLocation}
        </button>

        {nearMeState === 'error' && (
          <p className="mt-6 rounded-[1.4rem] bg-[rgba(230,220,196,0.58)] px-5 py-4 text-sm leading-7 text-[var(--forest-700)] ring-1 ring-[rgba(91,67,38,0.1)]">{nearMeError}</p>
        )}
      </section>

      {nearMeState === 'ready' && (
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4 px-1">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--earth-700)]">BOOK OF DIEN BIEN</p>
              <h2 className="mt-1 text-2xl font-black text-[var(--forest-950)]">{content.results}</h2>
            </div>
            <p className="text-sm font-bold text-[var(--forest-600)]">{nearMeItems.length}</p>
          </div>

          {nearMeItems.length === 0 ? (
            <p className="rounded-[1.4rem] bg-[rgba(247,242,231,0.76)] px-5 py-5 text-sm leading-7 text-[var(--forest-700)] ring-1 ring-[rgba(91,67,38,0.1)]">{content.noResults}</p>
          ) : (
            <div className="space-y-4">
              {nearMeItems.map((item) => <NearMeResultCard key={item.id} item={item} language={language} />)}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
