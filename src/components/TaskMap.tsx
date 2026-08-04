import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { localize } from '../services/i18n';
import type { ChallengeTask, LanguageCode } from '../types/task';

export const TaskMap = ({ tasks, language, t }: { tasks: ChallengeTask[]; language: LanguageCode; t: (key: string) => string }) => {
  const first = tasks[0]?.gps;
  return (
  <section className="wood-panel textile-border relative z-10 rounded-[2rem] p-3 shadow-[0_22px_48px_rgba(39,52,31,0.14)] sm:p-4">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-[1.35rem] bg-[rgba(255,248,236,0.55)] px-4 py-3 ring-1 ring-[rgba(92,67,40,0.08)]">
    <div>
      <p className="section-kicker">{t('challenge.gpsStatus')}</p>
      <p className="text-base font-black text-[var(--forest-950)]">{tasks.length > 1 ? t('challenge.title') : localize(tasks[0].title, language)}</p>
    </div>
    <p className="rounded-full bg-[rgba(255,255,255,0.65)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--earth-800)] ring-1 ring-[rgba(92,67,40,0.08)]">
      {tasks.length}
    </p>
    </div>
    <div className="relative z-0 min-h-[360px] rounded-[1.7rem]">
    <MapContainer center={[first?.lat ?? 10.7756, first?.lng ?? 106.7039]} zoom={13} scrollWheelZoom className="h-[420px] sm:h-[540px] lg:h-[680px]">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {tasks.map((task) => (
          <Marker key={task.id} position={[task.gps.lat, task.gps.lng]}>
            <Popup><strong>{localize(task.title, language)}</strong><br />{localize(task.description, language)}</Popup>
            <Circle center={[task.gps.lat, task.gps.lng]} radius={task.gps.radius} pathOptions={{ color: '#2f8f58' }} />
          </Marker>
        ))}
    </MapContainer>
    </div>
    </section>
  );
};
