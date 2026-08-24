import { Fragment } from 'react';
import { icon } from 'leaflet';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { localize } from '../services/i18n';
import type { ChallengeTask, LanguageCode } from '../types/task';

const placeMarkerIcon = icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type TaskPlace = {
  key: string;
  lat: number;
  lng: number;
  radius: number;
  tasks: ChallengeTask[];
};

export const getDistinctTaskPlaces = (tasks: ChallengeTask[]): TaskPlace[] => {
  const places = new Map<string, TaskPlace>();

  tasks.forEach((task) => {
    const key = `${task.gps.lat.toFixed(6)},${task.gps.lng.toFixed(6)}`;
    const place = places.get(key);
    if (place) {
      place.tasks.push(task);
      place.radius = Math.max(place.radius, task.gps.radius);
      return;
    }
    places.set(key, {
      key,
      lat: task.gps.lat,
      lng: task.gps.lng,
      radius: task.gps.radius,
      tasks: [task],
    });
  });

  return [...places.values()];
};

export const TaskMap = ({
  tasks,
  language,
  t,
  groupByLocation = false,
}: {
  tasks: ChallengeTask[];
  language: LanguageCode;
  t: (key: string) => string;
  groupByLocation?: boolean;
}) => {
  const places = groupByLocation
    ? getDistinctTaskPlaces(tasks)
    : tasks.map((task) => ({
        key: task.id,
        lat: task.gps.lat,
        lng: task.gps.lng,
        radius: task.gps.radius,
        tasks: [task],
      }));
  const first = places[0];
  const mapTitle = groupByLocation
    ? (language === 'vi' ? 'Các địa điểm' : 'Places')
    : tasks.length > 1 ? t('challenge.title') : localize(tasks[0].title, language);
  return (
  <section className="wood-panel textile-border relative z-10 rounded-[2rem] p-3 shadow-[0_22px_48px_rgba(39,52,31,0.14)] sm:p-4">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-[1.35rem] bg-[rgba(230,222,204,0.66)] px-4 py-3 ring-1 ring-[rgba(92,67,40,0.12)]">
    <div>
      <p className="section-kicker">{t('challenge.gpsStatus')}</p>
      <p className="text-lg font-black text-[var(--forest-950)] sm:text-[1.35rem]">{mapTitle}</p>
    </div>
    <p className="rounded-full bg-[rgba(246,241,230,0.75)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--earth-800)] ring-1 ring-[rgba(92,67,40,0.1)]">
      {places.length}
    </p>
    </div>
    <div className="relative z-0 min-h-[360px] rounded-[1.7rem]">
    <MapContainer center={[first?.lat ?? 10.7756, first?.lng ?? 106.7039]} zoom={13} scrollWheelZoom className="h-[420px] sm:h-[540px] lg:h-[680px]">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {places.map((place) => (
          <Fragment key={place.key}>
            <Marker position={[place.lat, place.lng]} icon={placeMarkerIcon}>
              <Popup>
                <div className="task-map-place-popup">
                  {place.tasks.map((task) => (
                    <div key={task.id}>
                      <strong>{localize(task.title, language)}</strong>
                      <p>{localize(task.description, language)}</p>
                    </div>
                  ))}
                </div>
              </Popup>
            </Marker>
            <Circle center={[place.lat, place.lng]} radius={place.radius} pathOptions={{ color: '#2f8f58' }} />
          </Fragment>
        ))}
    </MapContainer>
    </div>
    </section>
  );
};
