# GPS Challenge

GPS Challenge is a configurable React, Vite, TypeScript, TailwindCSS, React Router, Leaflet, Geolocation API, i18n, and LocalStorage web application for location-based scavenger hunts.

## Features

- Challenges are loaded from `src/data/tasks.json` instead of React components.
- Vietnamese and English UI translations live in `src/i18n/vi.json` and `src/i18n/en.json`.
- Language switcher supports VI / EN and can be extended with new language resources.
- Admin page can add, edit, delete, enable, disable, score, GPS, and image URL fields using the same task JSON structure.
- GPS verification uses the browser Geolocation API and a Haversine distance calculation.
- QR check-in, score history, and admin overrides are stored in LocalStorage.
- Leaflet renders task checkpoints with OpenStreetMap tiles.
- Netlify configuration supports production SPA routing.

## Project structure

```text
src/
  assets/       Static assets for future images/icons
  components/   Reusable layout, card, button, language, and map components
  data/         Configurable challenge JSON (`tasks.json`)
  hooks/        State hooks for tasks and translations
  i18n/         Translation JSON and react-i18next setup
  pages/        Route-level pages
  services/     LocalStorage, task, history, and i18n services
  types/        Strong TypeScript domain types
  utils/        Shared utilities such as GPS distance helpers
```

## Add a challenge

Edit `src/data/tasks.json` and add an object with this shape:

```json
{
  "id": "unique-task-id",
  "title": { "vi": "Tiêu đề", "en": "Title" },
  "description": { "vi": "Mô tả", "en": "Description" },
  "category": "landmark",
  "difficulty": "easy",
  "points": 100,
  "gps": { "lat": 10.7756, "lng": 106.7039, "radius": 50 },
  "image": "https://example.com/image.jpg",
  "enabled": true
}
```

No React code changes are required. The random challenge generator automatically uses every enabled task in this file.

## Edit a challenge

- For source-controlled defaults, edit `src/data/tasks.json`.
- For browser-local changes, open the Admin page and update title, description, category, difficulty, points, GPS latitude, GPS longitude, radius, image URL, or enabled state.
- Admin changes are stored in LocalStorage using the same structure as `tasks.json`.
- Use **Reset JSON defaults** in Admin to discard local overrides and reload `src/data/tasks.json` defaults.

## Add a new language

1. Create a new translation file in `src/i18n/`, for example `fr.json`.
2. Add the language code and resource to `src/i18n/index.ts`.
3. Add the same language key to each task's `title` and `description` in `src/data/tasks.json`.
4. The language switcher is generated from configured resources, so no route or page logic needs to change.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Netlify deployment

This project includes `netlify.toml`.

- Build command: `npm run build`
- Publish directory: `dist`

The redirect rule sends all routes to `index.html` so React Router deep links work in production.

## Privacy

GPS Challenge runs entirely in the browser. Task overrides and history are stored in LocalStorage on the user's device. Location is requested only when a participant presses the GPS verification button.
