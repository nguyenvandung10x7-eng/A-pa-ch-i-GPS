import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { localize } from '../services/i18n';
import type { ChallengeTask, LanguageCode } from '../types/task';

export const TaskMap = ({ tasks, language }: { tasks: ChallengeTask[]; language: LanguageCode }) => {
  const first = tasks[0]?.gps;
  return (
    <section className="glass rounded-[2rem] p-4">
      <MapContainer center={[first?.lat ?? 10.7756, first?.lng ?? 106.7039]} zoom={13} scrollWheelZoom className="h-[620px]">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {tasks.map((task) => (
          <Marker key={task.id} position={[task.gps.lat, task.gps.lng]}>
            <Popup><strong>{localize(task.title, language)}</strong><br />{localize(task.description, language)}</Popup>
            <Circle center={[task.gps.lat, task.gps.lng]} radius={task.gps.radius} pathOptions={{ color: '#22d3ee' }} />
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
};
