import { Bookmark, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LanguageCode } from '../types/task';

type BookUtilityPageProps = {
  language: LanguageCode;
  mode: 'near-me' | 'saved';
};

const copy = {
  vi: {
    back: 'Về Book',
    nearMe: {
      eyebrow: 'BOOK OF DIEN BIEN · NEAR ME',
      title: 'Gần tôi',
      description: 'Các trang và trải nghiệm có vị trí sẽ được sắp theo khoảng cách khi tính năng vị trí được kết nối ở bước tiếp theo.',
      note: 'Hiện tại đây chỉ là route shell. Trang chưa yêu cầu quyền GPS và chưa thay đổi bất kỳ dữ liệu thử thách nào.',
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
      description: 'Located pages and experiences will be ordered by distance once location support is connected in the next phase.',
      note: 'This is currently only a route shell. It does not request GPS permission or change any legacy challenge data.',
    },
    saved: {
      eyebrow: 'BOOK OF DIEN BIEN · SAVED',
      title: 'Saved',
      description: 'Pages you want to return to will appear here once Book state is added.',
      note: 'This is currently only a route shell. No new Saved data is written to localStorage yet.',
    },
  },
} as const;

export const BookUtilityPage = ({ language, mode }: BookUtilityPageProps) => {
  const c = copy[language];
  const content = mode === 'near-me' ? c.nearMe : c.saved;
  const Icon = mode === 'near-me' ? MapPin : Bookmark;

  return (
    <div className="mx-auto max-w-4xl py-8 sm:py-14">
      <Link to="/book" className="text-sm font-bold text-[var(--forest-700)] hover:text-[var(--forest-950)]">
        ← {c.back}
      </Link>

      <section className="mt-8 rounded-[2rem] bg-[rgba(247,242,231,0.76)] px-5 py-9 shadow-[0_24px_60px_rgba(50,45,32,0.08)] ring-1 ring-[rgba(91,67,38,0.1)] sm:px-10 sm:py-12">
        <div className="flex items-center gap-3 text-[var(--earth-700)]">
          <Icon className="h-5 w-5" />
          <p className="text-xs font-black uppercase tracking-[0.24em]">{content.eyebrow}</p>
        </div>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-[var(--forest-950)] sm:text-6xl">{content.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--forest-700)]">{content.description}</p>
        <p className="mt-8 rounded-[1.4rem] bg-[rgba(230,220,196,0.58)] px-5 py-4 text-sm leading-7 text-[var(--forest-700)] ring-1 ring-[rgba(91,67,38,0.1)]">
          {content.note}
        </p>
      </section>
    </div>
  );
};
