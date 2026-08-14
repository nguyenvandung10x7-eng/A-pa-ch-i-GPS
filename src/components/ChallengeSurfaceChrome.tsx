import { Flag, MapPin, Sparkles } from 'lucide-react';

export const ChallengeSurfaceChrome = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-x-3 top-3 z-0 flex items-center justify-between sm:inset-x-4 sm:top-4">
    <div className="flex items-center gap-2 rounded-full bg-[rgba(123,61,29,0.92)] px-3 py-1.5 text-[rgba(255,246,229,0.96)] shadow-[0_8px_24px_rgba(91,44,20,0.2)]">
      <Flag className="h-3.5 w-3.5" />
      <span className="h-1.5 w-1.5 rounded-full bg-[rgba(255,198,94,0.95)] motion-safe:animate-pulse" />
      <MapPin className="h-3.5 w-3.5" />
    </div>
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(255,239,204,0.9)] text-[rgba(133,65,31,0.95)] shadow-[0_8px_24px_rgba(91,44,20,0.16)] ring-1 ring-[rgba(176,96,48,0.18)] transition-transform duration-300 motion-safe:animate-pulse">
      <Sparkles className="h-4 w-4" />
    </div>
  </div>
);
