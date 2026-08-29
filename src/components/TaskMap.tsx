import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { icon } from 'leaflet';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
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

type MapRegion = 'city' | 'west';

const mapTileProviders = [
  {
    id: 'osm-fr',
    url: 'https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    id: 'open-topo-map',
    url: 'https://tile.openmaps.fr/opentopomap/{z}/{x}/{y}.png',
    attribution: '<a href="https://github.com/sletuffe/OpenTopoMap">&copy; OpenTopoMap-R</a> <a href="https://openmaps.fr/donate">&#10084;&#65039; Donation</a> <a href="https://www.openstreetmap.org/copyright">&copy; OpenStreetMap</a>',
  },
] as const;

const ResilientTileLayer = () => {
  const [providerIndex, setProviderIndex] = useState(0);
  const hasLoadedTileSet = useRef(false);
  const tileErrorCount = useRef(0);
  const provider = mapTileProviders[providerIndex];

  const tryNextProvider = useCallback(() => {
    hasLoadedTileSet.current = false;
    tileErrorCount.current = 0;
    setProviderIndex((current) => Math.min(current + 1, mapTileProviders.length - 1));
  }, []);

  useEffect(() => {
    const fallbackTimer = window.setTimeout(() => {
      if (!hasLoadedTileSet.current) tryNextProvider();
    }, 6000);

    return () => window.clearTimeout(fallbackTimer);
  }, [providerIndex, tryNextProvider]);

  return (
    <TileLayer
      key={provider.id}
      attribution={provider.attribution}
      url={provider.url}
      eventHandlers={{
        load: () => {
          hasLoadedTileSet.current = true;
        },
        tileerror: () => {
          tileErrorCount.current += 1;
          if (tileErrorCount.current >= 2) tryNextProvider();
        },
      }}
    />
  );
};

const isDienBienCityPlace = (place: TaskPlace): boolean => (
  place.lat >= 21.35
  && place.lat <= 21.46
  && place.lng >= 102.98
  && place.lng <= 103.11
);

const MapViewport = ({ places }: { places: TaskPlace[] }) => {
  const map = useMap();
  const placeSignature = places.map((place) => place.key).join('|');

  useEffect(() => {
    if (places.length === 0) return;
    if (places.length === 1) {
      map.setView([places[0].lat, places[0].lng], 13);
      return;
    }
    map.fitBounds(places.map((place) => [place.lat, place.lng]), {
      padding: [36, 36],
      maxZoom: 13,
    });
  }, [map, placeSignature, places]);

  return null;
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
  const [mapRegion, setMapRegion] = useState<MapRegion>('city');
  const places = useMemo(
    () => groupByLocation
      ? getDistinctTaskPlaces(tasks)
      : tasks.map((task) => ({
          key: task.id,
          lat: task.gps.lat,
          lng: task.gps.lng,
          radius: task.gps.radius,
          tasks: [task],
        })),
    [groupByLocation, tasks],
  );
  const cityPlaces = useMemo(() => places.filter(isDienBienCityPlace), [places]);
  const westPlaces = useMemo(() => places.filter((place) => !isDienBienCityPlace(place)), [places]);
  const hasRegionalTabs = groupByLocation && cityPlaces.length > 0 && westPlaces.length > 0;
  const resolvedRegion: MapRegion = mapRegion === 'west' && westPlaces.length > 0
    ? 'west'
    : cityPlaces.length > 0
      ? 'city'
      : 'west';
  const visiblePlaces = hasRegionalTabs
    ? resolvedRegion === 'city' ? cityPlaces : westPlaces
    : places;
  const first = visiblePlaces[0];
  const firstTask = tasks[0];
  const mapTitle = groupByLocation
    ? (language === 'vi' ? 'Các địa điểm' : 'Places')
    : tasks.length > 1
      ? t('challenge.title')
      : firstTask
        ? localize(firstTask.title, language)
        : (language === 'vi' ? 'Chưa có địa điểm' : 'No places yet');

  if (!first) {
    return (
      <section className="wood-panel textile-border relative z-10 rounded-[2rem] p-3 shadow-[0_22px_48px_rgba(39,52,31,0.14)] sm:p-4">
        <p className="rounded-[1.35rem] bg-[rgba(230,222,204,0.66)] px-4 py-6 text-center text-sm font-semibold text-[var(--forest-800)] ring-1 ring-[rgba(92,67,40,0.12)]">
          {language === 'vi' ? 'Chưa có địa điểm nào để hiển thị trên bản đồ.' : 'There are no places to show on the map yet.'}
        </p>
      </section>
    );
  }

  return (
    <section className="wood-panel textile-border relative z-10 rounded-[2rem] p-3 shadow-[0_22px_48px_rgba(39,52,31,0.14)] sm:p-4">
      {!groupByLocation ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-[1.35rem] bg-[rgba(230,222,204,0.66)] px-4 py-3 ring-1 ring-[rgba(92,67,40,0.12)]">
          <div>
            <p className="section-kicker">{t('challenge.gpsStatus')}</p>
            <p className="text-lg font-black text-[var(--forest-950)] sm:text-[1.35rem]">{mapTitle}</p>
          </div>
          <p className="rounded-full bg-[rgba(246,241,230,0.75)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--earth-800)] ring-1 ring-[rgba(92,67,40,0.1)]">
            {places.length}
          </p>
        </div>
      ) : null}
      {hasRegionalTabs ? (
        <div
          className="task-map-region-tabs"
          role="group"
          aria-label={language === 'vi' ? 'Chọn vùng bản đồ' : 'Choose a map region'}
        >
          <button
            type="button"
            className={resolvedRegion === 'city' ? 'is-active' : ''}
            aria-pressed={resolvedRegion === 'city'}
            onClick={() => setMapRegion('city')}
          >
            <span>{language === 'vi' ? 'Thành phố' : 'City'}</span>
            <strong>{cityPlaces.length}</strong>
          </button>
          <button
            type="button"
            className={resolvedRegion === 'west' ? 'is-active' : ''}
            aria-pressed={resolvedRegion === 'west'}
            onClick={() => setMapRegion('west')}
          >
            <span>{language === 'vi' ? 'Phía Tây' : 'West'}</span>
            <strong>{westPlaces.length}</strong>
          </button>
        </div>
      ) : null}
      <div className="relative z-0 min-h-[360px] rounded-[1.7rem]">
        <MapContainer center={[first.lat, first.lng]} zoom={13} scrollWheelZoom={false} className="h-[420px] sm:h-[540px] lg:h-[680px]">
          <MapViewport places={visiblePlaces} />
          <ResilientTileLayer />
          {visiblePlaces.map((place) => {
            const placeFirstTask = place.tasks[0];
            const placeLabel = place.tasks.length > 1
              ? `${localize(placeFirstTask.title, language)} · ${place.tasks.length}`
              : localize(placeFirstTask.title, language);

            return (
              <Fragment key={`${place.key}-${language}`}>
                <Marker position={[place.lat, place.lng]} icon={placeMarkerIcon} alt={placeLabel} title={placeLabel}>
                  <Popup>
                    <div className="task-map-place-popup">
                      {place.tasks.map((task) => (
                        <div key={task.id}>
                          <strong>{localize(task.title, language)}</strong>
                        </div>
                      ))}
                    </div>
                  </Popup>
                </Marker>
                <Circle center={[place.lat, place.lng]} radius={place.radius} pathOptions={{ color: '#2f8f58' }} />
              </Fragment>
            );
          })}
        </MapContainer>
      </div>
    </section>
  );
};
