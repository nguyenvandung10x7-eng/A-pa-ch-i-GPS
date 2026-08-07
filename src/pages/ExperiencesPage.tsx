import { Building2, History, ListChecks, MapPinned, Mountain, Sparkles, Trophy, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { Card } from '../components/Card';
import { experienceCards, type ExperienceCardConfig } from '../data/experiences';
import { GAMEPLAY_MUSIC_ACTION_EVENT } from '../services/gameplayMusicEvents';

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
  const dispatchStartMusic = () => {
    window.dispatchEvent(new CustomEvent<'start'>(GAMEPLAY_MUSIC_ACTION_EVENT, { detail: 'start' }));
  };

  const handleActivateCard = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented) return;
    if (event.detail === 0) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    dispatchStartMusic();
  };

  const handleKeyboardActivateCard = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented) return;
    if (event.key !== 'Enter') return;
    if (event.repeat) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    dispatchStartMusic();
  };

  return (
    <Link
      to={card.route}
      onClick={handleActivateCard}
      onKeyDown={handleKeyboardActivateCard}
      className="group relative isolate block min-h-[17rem] overflow-hidden rounded-[1.75rem] bg-[rgba(255,247,230,0.72)] shadow-[0_14px_28px_rgba(42,58,35,0.16)] ring-1 ring-[rgba(239,224,191,0.3)] motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(226,184,92,0.45)]"
      aria-label={`${t(card.titleKey)}. ${t(card.actionKey)}`}
    >
      {hasImage ? (
        <img
          src={card.image}
          alt={t(card.imageAltKey)}
          className="absolute inset-0 h-full w-full object-cover object-center motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-[1.03]"
          onError={onImageError}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: fallbackBackground }}
          aria-hidden="true"
        />
      )}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,12,0)_40%,rgba(10,20,13,0.24)_66%,rgba(10,18,12,0.74)_100%)]" />

      <div className="relative z-10 flex h-full min-h-[17rem] flex-col justify-between px-3.5 py-3.5 sm:px-4 sm:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex min-h-[1.9rem] min-w-[1.9rem] items-center justify-center rounded-full bg-[rgba(255,243,208,0.84)] px-2 text-xs font-black text-[var(--earth-900)] ring-1 ring-[rgba(112,79,39,0.22)]">
            {String(card.order).padStart(2, '0')}
          </div>
          <span className="inline-flex min-h-[2rem] min-w-[2rem] items-center justify-center rounded-full bg-[rgba(255,255,255,0.8)] text-[var(--forest-900)] ring-1 ring-[rgba(61,84,52,0.24)]">
            <Icon className="h-4 w-4" />
          </span>
        </div>

        <div className="min-w-0">
          <h2 className="text-[1.22rem] font-black leading-tight text-[rgba(255,252,244,0.98)] [text-shadow:0_3px_14px_rgba(0,0,0,0.5)] sm:text-[1.45rem]">
            {t(card.titleKey)}
          </h2>
          <p className="mt-1.5 line-clamp-2 text-[0.82rem] leading-5 text-[rgba(248,239,220,0.96)] sm:text-sm sm:leading-5">
            {t(card.descriptionKey)}
          </p>
          <p className="mt-3 inline-flex min-h-[2.6rem] items-center rounded-full border border-[rgba(255,232,180,0.42)] bg-[rgba(250,241,221,0.9)] px-3.5 text-[0.78rem] font-black uppercase tracking-[0.04em] text-[var(--earth-900)] shadow-[0_6px_16px_rgba(0,0,0,0.16)] motion-safe:transition-colors group-hover:bg-[rgba(255,246,226,0.98)] group-active:bg-[rgba(252,236,204,0.96)] sm:text-xs">
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
        <section className="relative overflow-hidden rounded-[1.9rem] px-5 py-6 sm:px-7 sm:py-8 lg:px-9">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(245,235,214,0.78),rgba(231,224,203,0.58),rgba(228,237,218,0.52))]" aria-hidden="true" />
          <div className="relative z-10">
            <p className="section-kicker">{t('nav.experiences')}</p>
            <h1 className="mt-2 text-[1.85rem] font-black leading-tight text-[var(--forest-950)] sm:text-[2.35rem]">
              {t('experiences.heading')}
            </h1>
            <p className="mt-3 max-w-3xl text-[0.98rem] leading-7 text-[var(--forest-800)] sm:text-[1.05rem]">
              {t('experiences.subheading')}
            </p>
          </div>
        </section>
      </Card>

      <section className="grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-4">
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
