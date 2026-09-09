import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { divIcon } from 'leaflet';
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { Crosshair, LocateFixed, Navigation } from 'lucide-react';
import { localize } from '../services/i18n';
import type { ChallengeTask, LanguageCode } from '../types/task';
import { distanceMeters, GeolocationRequestError, getCurrentPosition } from '../utils/geo';

const userMarkerIcon = divIcon({
  className: 'task-map-user-marker-icon',
  html: '<span class="task-map-user-marker"><span></span><b></b></span>',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

const taskMapCopy = {
  vi: {
    locate: 'Vị trí của tôi',
    locating: 'Đang định vị',
    denied: 'Trình duyệt chưa cho phép lấy vị trí.',
    unavailable: 'Chưa lấy được vị trí lúc này.',
    selected: 'Điểm đang chọn',
    locationHint: 'Bật vị trí để thấy bạn đang ở đâu và còn cách điểm GPS bao xa.',
    distance: 'Cách bạn {{distance}}',
    accuracy: 'Sai số {{distance}}',
    outside: 'Ngoài bán kính',
    inside: 'Trong bán kính',
    route: 'Đường thẳng tới điểm GPS',
  },
  en: {
    locate: 'My location',
    locating: 'Locating',
    denied: 'Location permission is not enabled for this browser.',
    unavailable: 'Your location could not be found right now.',
    selected: 'Selected point',
    locationHint: 'Turn on location to see where you are and how far this GPS point is.',
    distance: '{{distance}} away',
    accuracy: 'Accuracy {{distance}}',
    outside: 'Outside radius',
    inside: 'Within radius',
    route: 'Straight line to GPS point',
  },
} as const;

type TaskPlace = {
  key: string;
  lat: number;
  lng: number;
  radius: number;
  tasks: ChallengeTask[];
};

type MapRegion = 'city' | 'west';

const formatDistance = (meters: number, language: LanguageCode) => {
  if (meters < 1000) return `${Math.max(1, Math.round(meters))} m`;
  return `${(meters / 1000).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
    minimumFractionDigits: meters < 10000 ? 1 : 0,
    maximumFractionDigits: meters < 10000 ? 1 : 0,
  })} km`;
};

const placeTitle = (place: TaskPlace, language: LanguageCode) => {
  const firstTask = place.tasks[0];
  if (!firstTask) return language === 'vi' ? 'Một điểm GPS' : 'A GPS point';
  return place.tasks.length > 1
    ? `${localize(firstTask.title, language)} · ${place.tasks.length}`
    : localize(firstTask.title, language);
};

const createPlaceIcon = (place: TaskPlace, selected: boolean) => {
  const countBadge = place.tasks.length > 1
    ? `<span class="task-map-place-marker__count">${place.tasks.length}</span>`
    : '';

  return divIcon({
    className: `task-map-place-marker-icon ${selected ? 'is-selected' : ''}`,
    html: [
      '<span class="task-map-place-marker">',
      '<span class="task-map-place-marker__pin" aria-hidden="true">',
      '<svg viewBox="0 0 24 24" focusable="false">',
      '<path d="M12 21s7-6.24 7-11a7 7 0 0 0-14 0c0 4.76 7 11 7 11Z" />',
      '<circle cx="12" cy="10" r="2.55" />',
      '</svg>',
      '</span>',
      countBadge,
      '</span>',
    ].join(''),
    iconSize: selected ? [40, 46] : [34, 40],
    iconAnchor: selected ? [20, 42] : [17, 36],
    popupAnchor: [0, selected ? -40 : -34],
  });
};

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

const UserRouteLayer = ({
  language,
  selectedPlace,
  userLocation,
  outsideRadius,
}: {
  language: LanguageCode;
  selectedPlace?: TaskPlace;
  userLocation: { lat: number; lng: number; accuracy?: number } | null;
  outsideRadius: boolean;
}) => {
  const map = useMap();
  const selectedPlaceKey = selectedPlace?.key ?? '';

  useEffect(() => {
    if (!userLocation || !selectedPlace) return;
    map.fitBounds([
      [userLocation.lat, userLocation.lng],
      [selectedPlace.lat, selectedPlace.lng],
    ], {
      padding: [52, 52],
      maxZoom: 15,
    });
  }, [map, selectedPlace, selectedPlaceKey, userLocation]);

  if (!userLocation) return null;

  return (
    <>
      {selectedPlace ? (
        <Polyline
          positions={[
            [userLocation.lat, userLocation.lng],
            [selectedPlace.lat, selectedPlace.lng],
          ]}
          pathOptions={{
            className: 'task-map-route-line',
            color: outsideRadius ? '#d82727' : '#1c9d53',
            dashArray: '8 10',
            lineCap: 'round',
            opacity: 0.9,
            weight: 4,
          }}
        />
      ) : null}
      <Marker
        position={[userLocation.lat, userLocation.lng]}
        icon={userMarkerIcon}
        alt={language === 'vi' ? 'Vị trí của tôi' : 'My location'}
        title={language === 'vi' ? 'Vị trí của tôi' : 'My location'}
        zIndexOffset={1000}
      />
    </>
  );
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
  const c = taskMapCopy[language];
  const [mapRegion, setMapRegion] = useState<MapRegion>('city');
  const [selectedPlaceKey, setSelectedPlaceKey] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const locatingRef = useRef(false);
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
  const selectedPlace = visiblePlaces.find((place) => place.key === selectedPlaceKey) ?? first;
  const firstTask = tasks[0];
  const mapTitle = groupByLocation
    ? (language === 'vi' ? 'Các địa điểm' : 'Places')
    : tasks.length > 1
      ? t('challenge.title')
      : firstTask
        ? localize(firstTask.title, language)
        : (language === 'vi' ? 'Chưa có địa điểm' : 'No places yet');
  const selectedDistance = userLocation && selectedPlace
    ? Math.round(distanceMeters(userLocation, selectedPlace))
    : null;
  const outsideRadius = Boolean(selectedDistance !== null && selectedPlace && selectedDistance > selectedPlace.radius);
  const selectedPlaceLabel = selectedPlace ? placeTitle(selectedPlace, language) : mapTitle;

  const applyUserPosition = useCallback((position: GeolocationPosition) => {
    setUserLocation({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
    });
    setLocationMessage(null);
  }, []);

  const getLocationErrorMessage = useCallback((error: unknown) => {
    const denied = error instanceof GeolocationRequestError && error.code === 1;
    return denied ? c.denied : c.unavailable;
  }, [c.denied, c.unavailable]);

  const handleLocate = useCallback(async () => {
    if (locatingRef.current) return;
    locatingRef.current = true;
    setLocating(true);
    setLocationMessage(null);
    try {
      const position = await getCurrentPosition();
      applyUserPosition(position);
    } catch (error) {
      setLocationMessage(getLocationErrorMessage(error));
    } finally {
      locatingRef.current = false;
      setLocating(false);
    }
  }, [applyUserPosition, getLocationErrorMessage]);

  useEffect(() => {
    if (!navigator.geolocation) {
      return undefined;
    }

    let hasReceivedPosition = false;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        hasReceivedPosition = true;
        applyUserPosition(position);
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        if (!hasReceivedPosition) {
          setLocationMessage(getLocationErrorMessage(new GeolocationRequestError(error.code, error.message)));
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [applyUserPosition, getLocationErrorMessage]);

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
      <div className="task-map-location-panel" aria-live="polite">
        <button type="button" onClick={() => { void handleLocate(); }} disabled={locating}>
          <LocateFixed aria-hidden="true" />
          <span>{locating ? c.locating : c.locate}</span>
        </button>
        <div className="task-map-location-panel__readout">
          <span><Crosshair aria-hidden="true" />{c.selected}</span>
          <strong>{selectedPlaceLabel}</strong>
        </div>
        {selectedDistance !== null ? (
          <div className={`task-map-location-panel__distance ${outsideRadius ? 'is-outside-radius' : 'is-within-radius'}`}>
            <Navigation aria-hidden="true" />
            <span>{c.distance.replace('{{distance}}', formatDistance(selectedDistance, language))}</span>
            <b>{outsideRadius ? c.outside : c.inside}</b>
          </div>
        ) : null}
        {userLocation?.accuracy ? (
          <small>{c.accuracy.replace('{{distance}}', formatDistance(userLocation.accuracy, language))}</small>
        ) : null}
        {selectedDistance === null && !locationMessage ? <small>{c.locationHint}</small> : null}
        {locationMessage ? <small role="status">{locationMessage}</small> : null}
      </div>
      <div className="relative z-0 min-h-[360px] rounded-[1.7rem]">
        <MapContainer center={[first.lat, first.lng]} zoom={13} scrollWheelZoom={false} className="h-[420px] sm:h-[540px] lg:h-[680px]">
          <MapViewport places={visiblePlaces} />
          <ResilientTileLayer />
          {visiblePlaces.map((place) => {
            const selected = selectedPlace?.key === place.key;
            const placeLabel = placeTitle(place, language);

            return (
              <Fragment key={`${place.key}-${language}-${selected ? 'selected' : 'idle'}`}>
                <Marker
                  position={[place.lat, place.lng]}
                  icon={createPlaceIcon(place, selected)}
                  alt={placeLabel}
                  title={placeLabel}
                  zIndexOffset={selected ? 500 : 0}
                  eventHandlers={{
                    click: () => setSelectedPlaceKey(place.key),
                  }}
                >
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
                <Circle
                  center={[place.lat, place.lng]}
                  radius={place.radius}
                  pathOptions={{ color: selected ? '#d99b2b' : '#2f8f58', fillOpacity: selected ? 0.12 : 0.08 }}
                />
              </Fragment>
            );
          })}
          <UserRouteLayer
            language={language}
            selectedPlace={selectedPlace}
            userLocation={userLocation}
            outsideRadius={outsideRadius}
          />
        </MapContainer>
      </div>
    </section>
  );
};
