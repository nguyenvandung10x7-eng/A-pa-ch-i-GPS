import { Building2, History, ListChecks, MapPinned, Mountain, Sparkles, Trophy, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { experienceCards, type ExperienceCardConfig } from '../data/experiences';

const iconByCardId: Record<string, typeof Sparkles> = {
  'terraced-fields': ListChecks,
  waterfalls: Sparkles,
  'time-train': History,
  'apa-chai': Mountain,
  'historical-sites': Building2,
  'dien-bien-plain': Waves,
  'in-the-city': MapPinned,
  'surprise-missions': Trophy,
};

const fallbackGradientByTheme: Record<string, string> = {
  terrace: 'linear-gradient(180deg, rgba(101, 127, 90, 0.85), rgba(37, 58, 34, 0.92))',
  waterfall: 'linear-gradient(180deg, rgba(63, 111, 117, 0.82), rgba(22, 49, 54, 0.9))',
  timeTrain: 'linear-gradient(180deg, rgba(126, 92, 58, 0.85), rgba(56, 37, 24, 0.92))',
  apaChai: 'linear-gradient(180deg, rgba(77, 101, 72, 0.86), rgba(26, 45, 30, 0.92))',
  historical: 'linear-gradient(180deg, rgba(114, 93, 64, 0.85), rgba(53, 39, 25, 0.9))',
  plain: 'linear-gradient(180deg, rgba(104, 118, 82, 0.84), rgba(43, 58, 34, 0.92))',
  city: 'linear-gradient(180deg, rgba(74, 97, 91, 0.85), rgba(32, 50, 47, 0.9))',
  surprise: 'linear-gradient(180deg, rgba(87, 80, 51, 0.84), rgba(33, 43, 28, 0.94))',
};

const ExperienceCard = ({
  card,
  t,
  imageFailed,
  onImageError,
}: {
  card: ExperienceCardConfig;
  t: (key: string) => string;
  imageFailed: boolean;
  onImageError: () => void;
}) => {
  const Icon = iconByCardId[card.id] ?? Sparkles;
  const hasImage = !imageFailed;
  const fallbackBackground = fallbackGradientByTheme[card.theme ?? 'surprise'];

  return (
    <Link
      to={card.route}
      className="group relative isolate block min-h-[20rem] overflow-hidden rounded-[1.9rem] bg-[rgba(38,53,35,0.92)] shadow-[0_22px_42px_rgba(20,27,17,0.24)] ring-1 ring-[rgba(239,224,191,0.18)] motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(226,184,92,0.45)]"
      aria-label={`${t(card.titleKey)}. ${t(card.actionKey)}`}
    >
      {hasImage ? (
        <img
          src={card.image}
          alt={t(card.imageAltKey)}
          className="absolute inset-0 h-full w-full object-cover object-center motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-[1.02]"
          onError={onImageError}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: fallbackBackground }}
          aria-hidden="true"
        />
      )}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,22,15,0.08)_18%,rgba(13,22,17,0.42)_50%,rgba(12,19,14,0.9)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(255,248,229,0.22),transparent_70%)]" aria-hidden="true" />
      <div className="absolute right-4 top-4 h-20 w-20 rounded-full border border-[rgba(223,183,95,0.3)] bg-[radial-gradient(circle,rgba(255,245,218,0.18),transparent_68%)]" aria-hidden="true" />

      <div className="relative z-10 flex h-full min-h-[20rem] flex-col justify-between px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex min-h-[2.1rem] min-w-[2.1rem] items-center justify-center rounded-full bg-[rgba(240,214,156,0.24)] px-2 text-sm font-black text-[rgba(253,243,224,0.98)] ring-1 ring-[rgba(240,214,156,0.36)]">
            {String(card.order).padStart(2, '0')}
          </div>
          <span className="inline-flex min-h-[2.2rem] min-w-[2.2rem] items-center justify-center rounded-full bg-[rgba(15,28,16,0.42)] text-[rgba(247,233,205,0.98)] ring-1 ring-[rgba(240,214,156,0.25)]">
            <Icon className="h-4 w-4" />
          </span>
        </div>

        <div className="min-w-0">
          <h2 className="text-[1.85rem] font-black leading-tight text-[rgba(255,248,233,0.98)] drop-shadow-[0_8px_22px_rgba(0,0,0,0.45)] sm:text-[2.1rem]">
            {t(card.titleKey)}
          </h2>
          <p className="mt-2 max-w-[34rem] text-sm leading-6 text-[rgba(243,230,203,0.95)] sm:text-base">
            {t(card.descriptionKey)}
          </p>
          <p className="mt-4 inline-flex min-h-[2.75rem] items-center rounded-full border border-[rgba(245,217,158,0.34)] bg-[rgba(20,34,21,0.5)] px-4 text-sm font-black text-[rgba(252,241,220,0.98)] motion-safe:transition-colors group-hover:bg-[rgba(31,48,31,0.64)] group-active:bg-[rgba(24,39,25,0.7)]">
            {t(card.actionKey)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export const ExperiencesPage = ({ t }: { t: (key: string) => string }) => {
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});

  const cards = useMemo(() => experienceCards, []);

  return (
    <div className="grid gap-6">
      <Card className="overflow-hidden p-0">
        <section className="relative overflow-hidden rounded-[1.9rem] px-5 py-7 sm:px-7 sm:py-9 lg:px-9">
          <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(234,220,193,0.72),rgba(212,200,176,0.58),rgba(207,219,194,0.62))]" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-[repeating-linear-gradient(90deg,rgba(111,76,46,0.2)_0_18px,rgba(198,153,77,0.18)_18px_36px,rgba(35,55,36,0.2)_36px_54px)]" aria-hidden="true" />
          <div className="relative z-10">
            <p className="section-kicker">{t('nav.experiences')}</p>
            <h1 className="mt-2 text-[2rem] font-black leading-tight text-[var(--forest-950)] sm:text-[2.6rem]">
              {t('experiences.heading')}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--forest-800)] sm:text-lg">
              {t('experiences.subheading')}
            </p>
          </div>
        </section>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-4">
        {cards.map((card) => (
          <ExperienceCard
            key={card.id}
            card={card}
            t={t}
            imageFailed={Boolean(failedImageIds[card.id])}
            onImageError={() => setFailedImageIds((current) => ({ ...current, [card.id]: true }))}
          />
        ))}
      </section>
    </div>
  );
};
