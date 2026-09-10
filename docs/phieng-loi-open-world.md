# Phiêng Lơi — compact open-world remake

## Product decision

Phiêng Lơi is a compact 2D open world presented as a memory map, not a literal
geographic map. This keeps free exploration legible on mobile without implying
that distant places in Điện Biên sit next to one another in the real world.

The remake is isolated to the lazy-loaded Phiêng Lơi route. The Experiences Hub,
1954, GPS challenges, Book, authentication, admin surfaces and Supabase contracts
remain unchanged.

## Core loop

1. Choose any direction with a 360-degree movement stick.
2. Notice an environmental marker or use the “ƠI!” call for a hint.
3. Approach and actively interact with the place.
4. Receive a short bilingual story, sound response or temporary everyday power.
5. Continue in any order until all twelve memories have been encountered.

There is no combat, inventory grind, required route or app-level unlock.

## World regions and encounters

| Region | Encounters |
| --- | --- |
| Bản | Nhà sàn, mâm bên đường, bếp thịt trâu gác bếp |
| Nương | Bí xanh Tìa Dình, ruộng bậc thang, mắc ca Điện Biên, chè Shan tuyết Tủa Chùa |
| Suối | Cọn nước, cuộc gặp bên suối |
| Phố ký ức | Cà phê Mường Ảng, Bảo tàng Chiến thắng Điện Biên Phủ, Tượng đài Chiến thắng |

The woman at the stream is explicitly an adult NPC, framed at a distance behind
water, rock and foliage. The scene describes ordinary life and avoids voyeuristic
camera language. The roadside gathering lets the player choose tea; alcohol is
not a reward or the source of a power.

## Controls

- Mobile: left 360-degree joystick; right-side interact, dash and “ƠI!” buttons.
- Keyboard: WASD/arrows, E/Space, Shift and Q.
- “ƠI!” is earned through social connection at the roadside table. It points to
  the nearest unseen memory and makes nearby villagers and animals respond.

## Rendering and performance

- Custom Canvas 2D remains the renderer; no game-engine dependency is added.
- The internal render target is 480×270 and is integer-scaled with smoothing off.
- Scenery outside the camera margin is culled.
- A low-detail profile reduces particles and respects reduced-motion.
- The route keeps its existing lazy-loading boundary.
- Leaving the route cancels animation frames, removes input listeners and closes
  the AudioContext.

## Originality and licensing

No commercial game code, art, map, interface, character, audio or level layout is
copied. Side-view or open-world games may be used only as high-level genre
references. All current visuals in this remake are drawn by project-owned Canvas
code and no third-party visual asset is added.

Any later imported code or asset must have a verified license per file. Prefer
MIT/BSD/Apache for code and CC0 for placeholder art. Record the source, author,
license, URL and modifications in the existing provenance documentation before
shipping.

## Acceptance criteria

- All twelve places are reachable from a new game in any order.
- Every place requires a deliberate interaction and has unique bilingual copy.
- The mâm interaction visibly seats the player and unlocks “ƠI!”.
- All five local-produce powers give immediate visual or movement feedback.
- The museum, monument, waterwheel, stream scene and stilt houses are identifiable
  at the native 480×270 render size.
- Book and GPS remain available without completing Phiêng Lơi.
- Typecheck, lint, audio provenance and production build pass.
