import { BookOpen, Flag, MapPin, Trophy } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BOOK_NAVIGATION_ITEMS,
  CHALLENGE_NAVIGATION_ITEMS,
  PRODUCT_ENTRY_POINTS,
  type ProductNavigationItem,
} from '../data/productNavigation';
import { resolveProductSurface, type ProductSurface } from '../data/productSurfaces';

type ProductNavigationRailProps = {
  t: (key: string) => string;
  compact?: boolean;
};

const surfaceIcon = (surface: ProductSurface) =>
  surface === 'book' ? BookOpen : Flag;

const utilityIcon = (item: ProductNavigationItem) => {
  if (item.id === 'near-me') return MapPin;
  if (item.id === 'leaderboard') return Trophy;
  return item.surface === 'book' ? BookOpen : Flag;
};

export const ProductNavigationRail = ({ t, compact = false }: ProductNavigationRailProps) => {
  const location = useLocation();
  const activeSurface = resolveProductSurface(location.pathname);
  const utilityItems = activeSurface === 'book'
    ? BOOK_NAVIGATION_ITEMS
    : activeSurface === 'challenge'
      ? CHALLENGE_NAVIGATION_ITEMS
      : [];

  return (
    <nav aria-label={t('nav.menu')} className="space-y-2">
      <div className={`grid grid-cols-2 ${compact ? 'gap-2' : 'gap-3'}`}>
        {PRODUCT_ENTRY_POINTS.map((item) => {
          const Icon = surfaceIcon(item.surface);
          const isSurfaceActive = activeSurface === item.surface;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={`flex min-h-[3rem] items-center justify-center gap-2 rounded-[1.2rem] px-3 py-2.5 text-sm font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(220,179,85,0.32)] ${
                isSurfaceActive
                  ? item.surface === 'book'
                    ? 'wood-panel text-[var(--earth-900)] shadow-[0_10px_20px_rgba(101,75,40,0.16)]'
                    : 'bg-[rgba(176,96,48,0.92)] text-white shadow-[0_10px_20px_rgba(100,54,28,0.2)]'
                  : 'bg-[rgba(255,255,255,0.72)] text-[var(--forest-900)] ring-1 ring-[rgba(61,84,52,0.14)] hover:bg-[rgba(255,255,255,0.9)]'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
      </div>

      {activeSurface ? (
        <div className={`flex flex-wrap ${compact ? 'gap-1.5' : 'gap-2'}`}>
          {utilityItems.map((item) => {
            const Icon = utilityIcon(item);
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `inline-flex min-h-[2.6rem] items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition ${
                  isActive
                    ? activeSurface === 'book'
                      ? 'bg-[rgba(219,185,102,0.34)] text-[var(--earth-900)]'
                      : 'bg-[rgba(176,96,48,0.16)] text-[var(--earth-900)] ring-1 ring-[rgba(176,96,48,0.18)]'
                    : 'bg-[rgba(231,225,212,0.7)] text-[var(--forest-800)] ring-1 ring-[rgba(61,84,52,0.1)] hover:bg-[rgba(238,233,222,0.9)]'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{t(item.labelKey)}</span>
              </NavLink>
            );
          })}
        </div>
      ) : null}
    </nav>
  );
};
