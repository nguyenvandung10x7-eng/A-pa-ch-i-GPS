# Three-experience architecture

The product has three peer entry experiences. None is a prerequisite for another:

| Route | Role | Runtime boundary |
| --- | --- | --- |
| `/` | Experiences Hub | Static React/CSS and three existing WebP card images. |
| `/1954` | Cinematic history opening | Lazy 1954 route, then lazy WebGL scene; user-gesture audio only. |
| `/phieng-loi` | Playful culture chapter | Lazy mobile-first Canvas 2D route with four zones, five staged produce power-ups and procedural Web Audio. No game engine. |
| `/book` | Literary Book | Lazy existing application shell, Auth/Supabase and Book module. |

`/journey/1954` redirects to `/1954`; `/experiences` redirects to `/`. Existing Book, Challenge, map, legal and staff URLs stay valid.

## Shared rules

- `src/data/experienceRegistry.ts` is the single source for Hub order, route, bilingual copy, image and visual tone.
- Every immersive route links back to the Hub and provides explicit cross-links where the narrative benefits.
- The top-level experiences are never locked. Challenge Level 1/2 remains internal to the Challenge catalog.
- Featured 1954 and Phiêng Lơi continuations may select their exact existing task directly; they do not alter coordinates, verification, scoring or stored history.
- The legacy `Hội` concept is not part of the navigation or route registry.

## Loading and cleanup

- `App.tsx` contains only route classification and lazy entry points.
- `ApplicationEntry.tsx` mounts Auth/Supabase only for Book, Challenge and staff routes.
- Journey CSS belongs to `JourneyPage`; Phiêng Lơi and Hub CSS belong to their own route chunks.
- Leaving 1954 destroys WebGL resources and audio. Leaving Phiêng Lơi cancels its animation frame, closes its Web Audio context and removes keyboard, visibility, orientation and pointer listeners.
- Netlify's SPA redirect already supports every deep link. No Supabase schema, RLS policy, Edge Function or paid service is required for this architecture.
