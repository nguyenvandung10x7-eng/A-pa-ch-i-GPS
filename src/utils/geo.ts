import type { GpsPoint } from '../types/task';

export class GeolocationRequestError extends Error {
  constructor(public code: number, message = 'geolocation-unavailable') {
    super(message);
    this.name = 'GeolocationRequestError';
  }
}

export const distanceMeters = (a: Pick<GpsPoint, 'lat' | 'lng'>, b: Pick<GpsPoint, 'lat' | 'lng'>) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
};

export const getCurrentPosition = () => new Promise<GeolocationPosition>((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new GeolocationRequestError(3, 'geolocation-unavailable'));
    return;
  }

  navigator.geolocation.getCurrentPosition(resolve, (error) => {
    reject(new GeolocationRequestError(error.code, error.message));
  }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 });
});
