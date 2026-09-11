# Phiêng Lơi visual pipeline

## Direction lock

**BEAUTIFUL PLACE. STUPID PEOPLE.**

Phiêng Lơi uses a polished 2D stylized-cartoon direction: a detailed, warm and
recognizable Điện Biên village behind deliberately awkward adult characters.
The camera stays 3/4 and slightly top-down. The scene must remain readable in a
16:9 phone crop without looking like a web dashboard or a Canvas prototype.

The new event-presentation direction is colored manga inspired by GTO/Shonan,
with original Phiêng Lơi characters and settings. See the design sections below;
this is a documented direction, not a claim that the runtime is already updated.

The reference language is limited to high-level comedy readability and compact
staging. No commercial-game asset, pose, interface, typography, map, or layout is
copied.

## Runtime contract

- Gameplay state, saves, audio events and encounter logic stay in `gameEngine.ts`.
- `worldLayout.ts` is the spatial contract for the painted road, courtyard,
  garden route, bridge, terrain type, landmarks, chase navigation and depth
  occluders.
- `PhiengLoiVisualScene.tsx` is the only mounted world presentation.
- The 640×360 values are logical camera units, not a bitmap render resolution.
- The compositor uses one scalable world plate, transparent semantic-pose atlases,
  directional atlases for NPCs and a lightweight articulated cutout rig for
  Player locomotion.
- Actor and camera transforms are written directly on every animation frame;
  React only refreshes lightweight HUD state at a lower cadence. This keeps input,
  camera and feet locked to the same frame without rerendering the page tree.
- Player walk/run uses project-owned head, torso and limb cutouts with a fixed
  ground anchor. Stride phase is integrated from actual world distance, while
  joint transforms interpolate at render cadence; a blocked player therefore
  stops stepping instead of sliding through a time-driven cycle. Dedicated
  action art remains responsible for PHÀ ƠI, capture, seated and dance poses.
- Background crops at authored depths let the bridge rail, lower foliage and
  foreground rocks pass in front of characters without duplicating gameplay
  state. House silhouettes stay in the base plate until true-alpha foreground
  exports exist; rectangular house crops are not accepted because they can erase
  actors standing in open ground.
- Canvas primitive drawing is not a runtime fallback.
- Missing art must receive a named asset slot; it must not silently fall back to a
  rectangle, ellipse, stick figure or icon.

## Asset slots

All runtime URLs live in `visualAssets.ts`.

| Asset | Grid | Use |
| --- | ---: | --- |
| `village-world-v2.webp` | full plate | Active spacious village: mountains, stilt houses, fields, broad road network, stream, fences, waterwheel and contextual NPC pockets. |
| `heesun-actions-v2.webp` | 4×4 | Directional idle plus notice, invitation, beckon, brake, recoil, victory, ambush, seated/drinking and rare-flee acting. |
| `heesun-side-v2.webp` | 4×4 | Side-view eight-frame wander and eight-frame chase cycles. |
| `heesun-down-v2.webp` | 4×4 | Down/forward-view eight-frame wander and chase cycles. |
| `heesun-up-v2.webp` | 4×4 | Up/away-view eight-frame wander and chase cycles. |
| `hanu-actions-v2.webp` | 4×4 | Directional phone idle plus call, puzzled/shrug/glance-back, brake, handoff, pull-back, recoil, dance and delivered acting. |
| `hanu-side-v2.webp` | 4×4 | Side-view eight-frame phone-walk and food-delivery run cycles. |
| `hanu-down-v2.webp` | 4×4 | Down/forward-view eight-frame phone-walk and food-delivery run cycles. |
| `hanu-up-v2.webp` | 4×4 | Up/away-view eight-frame phone-walk and food-delivery run cycles. |
| `support-atlas-v1.webp` | 4×2 | Player idle, chicken, dog and buffalo placeholders. |
| `player-rig-{side,down,up}-v1.webp` | 4×3 each | Composition-B Player cutout parts for continuous idle/walk/run/turn/stop articulation; adult proportions, light-blue shirt, black jeans and sneakers. |
| `player-pha-oi-v1.webp` | 4×2 | Dedicated helpless “trời ơi / gọi Bụt” acting sequence: feet shoulder-width, elbows open, forearms raised and both palms up. |
| `player-actions-v2.webp` | 4×3 | Retained Player caught, seated and dance poses; the old generic shout cell is retired from runtime selection. |
| `chief-talk-v2.webp` | 4×2 | Trưởng bản idle, talk and reaction cycle. |
| `feast-loop-v2.webp` | 4×2 | Five-man roadside-table toast and laugh cycle. |
| `stream-loop-v2.webp` | 4×2 | Four-adult stream-community idle and reaction cycle. |
| `vuongme-dance-v1.webp` | 4×2 | VươngMe karaoke/dance cycle, staged as a rare visual response to PHÀ ƠI. |
| `heesun-wife-atlas-v1.webp` | 4×2 | Original HeeSun-wife entrance, stern command and exit poses. |
| `dien-bien-victory-monument-v1.webp` | cutout | Hazy static Victory Monument silhouette in the distant city ridge. |
| `dien-bien-victory-museum-v1.webp` | cutout | Hazy static Victory Museum silhouette in the distant city ridge. |
| `heesun-menu-v1.webp` | cutout | Waiting-menu left character. |
| `hanu-menu-v1.webp` | cutout | Waiting-menu right character. |

Atlases use regular cells and transparent alpha. Keep every pose inside its cell.
When replacing an atlas, preserve its grid and filename or version the filename and
update the centralized slot.

The current background is a painted plate, so `worldLayout.ts` must be updated in
the same change whenever a road, bridge, stream or major prop moves. Old saves are
projected onto the nearest valid route instead of placing the player over scenery.

The v2 plate maps to a 2400×1350 logical world: about 2.1× the previous world
area. The camera moved to 640×360, retaining the 16:9 composition while showing
actors at a smaller, more natural scale. Version-1 Continue coordinates are scaled
and then projected to the closest authored route.

## NPC staging and scale

- Single adult actors share one perceived-height band even though their source
  atlases use different cell proportions. Run and idle sheets therefore have
  separate display widths; a shared raw CSS width is not a valid size contract.
- Trưởng bản stays beside the stairs/veranda of the central stilt house.
- Each mâm nhậu relocation uses a pre-authored table or clearing, never an
  arbitrary point beside the player.
- The stream group stays on the social bank pocket; the water and bridge remain
  traversal boundaries.
- HANU follows the connected dirt road and wooden crossing. HeeSun starts at the
  edge of the entry road and chases through the same navigation graph.
- VươngMe enters near the player only when the Event Director selects the rare
  karaoke outcome; the dog and buffalo sit beside a house and in the terraces.
- HeeSun's wife appears beside the active HeeSun/feast commotion, never as a
  permanently wandering or quest NPC.

This follows compact comedy-game staging practice: anchor social NPCs to props,
keep the critical movement lane readable, cluster reactions locally and use
silhouette/pose—not oversized sprites—to establish importance.

## Character locks

- HeeSun: recognizable adult face, tight short curls against the scalp, about 30%
  slimmer than the earlier chubby board, gentle but suspicious smile, never cute.
- HANU: recognizable adult face, about 30% heavier than the earlier board, white
  tank top, black shorts, sandals, smartphone visible in every pose, permanently
  distracted.
- Player: smaller, quieter palette and simpler face than both named characters.
- HeeSun's wife: fictional adult village character with a sturdy angular
  silhouette, high bun, indigo-black jacket, restrained woven trim and a
  competent, unimpressed expression. She is not based on a supplied likeness.

Owner-supplied reference boards guide likeness only. Raw photographs are not
bundled. Future replacements must remain original, fictionalized game art and
must not introduce commercial IP.

## UI composition

- Top left: compact wooden location badge.
- Top center: one short paper objective.
- Top right: Book and pause.
- Center: uninterrupted world and character staging.
- Bottom left: one large joystick.
- Bottom right: one dominant PHÀ ƠI! action.

Messages use a single comic-paper bubble, allowlisted only for the player,
HeeSun, HANU and VuongMe. Other actors communicate through pose, motion, audio,
the small chief card or cinematic copy. Temporary status data stays compact.

## Supporting cast checkpoint

Trưởng bản, the roadside-table group and the adult stream group no longer reuse
single support-atlas poses. Each has a dedicated eight-frame transparent cutout
cycle. VươngMe is a dedicated animated rare-event guest selected by the Director,
never by a visual-layer call counter and never by TRUE NOTHING. During the short
event, bounded CSS lights turn the current village into cheap karaoke, personality
specific dance loops replace routine poses, and the stream group gathers without
crowd AI. Static original cutouts of the Điện Biên Phủ Victory Monument and
Victory Museum add recognizable city memory to the far background.

## Ngôn ngữ manga có màu cho biến cố — thiết kế mới

**Quyết định bổ sung của chủ dự án:** manga **có màu**, lấy cảm hứng từ
**GTO/Shonan**, là phong cách thể hiện thống nhất mỗi khi biến cố xuất hiện
trong toàn game. Phạm vi này bao gồm mọi biến cố, không chỉ HeeSun phục kích.
Phần dưới là định hướng cho lượt triển khai tương lai; runtime hiện tại chưa
được chuyển đổi trong lần cập nhật tài liệu này.

### Ngôn ngữ hình ảnh chung

- Nét vẽ mạnh, khuôn mặt trưởng thành, biểu cảm được phóng đại rõ: cười gượng,
  ngại ngùng, hoảng hốt, chết lặng và sự thân thiện quá mức.
- Dùng màu sắc trong các khung manga; không mặc định là truyện tranh đen trắng.
  Màu, độ tương phản và nền nhấn cảm xúc phục vụ từng cảnh.
- Cận mặt, bàn tay, khung chéo, đường tốc độ và khoảng giữ hình tạo nhịp hài.
  Trọng tâm vẫn là biểu cảm đọc được và tình huống đời thường của bản làng.
- Nhận diện Player theo phương án B, HeeSun và các nhân vật khác phải nhất quán
  giữa màn chơi và tranh sự kiện. Phóng đại biểu cảm không biến nhân vật thành
  chibi hoặc đổi sang đồ họa pixel.
- GTO/Shonan là tham chiếu về ngôn ngữ hình ảnh và diễn xuất. Nhân vật, trang
  phục, bối cảnh Điện Biên và các khung tranh được thiết kế riêng cho Phiêng Lơi.

### Một phong cách, nhịp trình bày theo từng biến cố

Mỗi biến cố có phần thể hiện manga phù hợp với nội dung của nó. Tái sử dụng bộ
phát và hiệu ứng chung; tranh đặc trưng của nhân vật/cảnh được quản lý như asset.
Không buộc mọi biến cố phải dùng cùng ba bức tranh hoặc cùng thời lượng 1,9 giây.

| Loại trình bày dự kiến | Cách dùng manga |
| --- | --- |
| Biến cố nhỏ, phản ứng ngắn | Một khung cut-in gọn với biểu cảm và chữ/âm thanh ngắn; có thể hiện trên gameplay đang chạy. |
| Biến cố chính cần nhấn cảm xúc | Một chuỗi khung có mở đầu, phản ứng và kết thúc; có thể tạm dừng mô phỏng trong lúc trình chiếu như mẫu phục kích bên dưới. |

Thời lượng, bố cục, tranh, thoại, âm thanh, hiệu ứng và việc tạm dừng gameplay
thuộc cấu hình của từng cảnh. Trạng thái đi/chạy thông thường không tự tạo thêm
biến cố; TRUE NOTHING cũng không sinh khung manga mới. Phong cách chung này
không thay điều kiện phát sinh, tần suất hoặc kết quả gameplay của các biến cố.

HeeSun phục kích là **mẫu đầu tiên** để kiểm tra biểu cảm, màu sắc, nhịp cắt và
khả năng dùng lại bộ phát. Các cảnh khác sẽ dùng cùng ngôn ngữ khi được triển
khai, với nội dung tranh phù hợp từng tình huống.

## HeeSun phục kích — manga cut-in tái sử dụng

**Trạng thái: quyết định thiết kế, chưa triển khai gameplay hoặc tạo asset.**
Phương án này thay đặc tả diễn xuất bằng animation liên tục của **riêng cảnh
HeeSun phục kích** đã bàn trước đó. Cảnh dùng ba khung tranh manga có màu theo
định hướng GTO/Shonan ở trên phủ lên màn chơi, tái sử dụng mỗi lần phục kích.
Đây là cách thể hiện một cảnh hài được dàn dựng trong game 2D hiện tại; không
chuyển game sang 2,5D.

Mục tiêu là thể hiện rõ Player bối rối, ngại ngùng khi bị rủ/ép nhậu và muốn bỏ
chạy. Công sức tập trung vào biểu cảm, bố cục và nhịp của vài bức tranh thay vì
vẽ chuyển động liên tục cho cả cảnh.

### Ba khung tranh

Thời lượng bản thử: **khoảng 1,9 giây theo thời gian thực**. Các mốc dưới đây là
thông số để thử cảm giác, có thể chỉnh trong cấu hình cảnh.

| Khung | Nội dung | Thời lượng thử |
| --- | --- | ---: |
| 1. “Bạn ơi…” | Cận mặt HeeSun đột ngột chiếm khung hình, nụ cười quá thân thiện. Nền có đường nét manga hướng vào khuôn mặt. | 0,7 giây |
| 2. “fukkk…” | Cận Player: miệng còn cười xã giao nhưng mắt đã tuyệt vọng, một giọt mồ hôi, chữ **“fukkk…”** nhỏ cạnh miệng. Giữ khung lâu hơn để người xem đọc được sự khó xử. | 0,8 giây |
| 3. Chạy! | Khung chéo: bàn tay HeeSun vươn tới, Player quay phắt nhìn lối thoát. Một tiếng động ngắn rồi cắt về gameplay, trả điều khiển để người chơi chạy. | 0,4 giây |

### Hình ảnh và nhịp diễn

- Dùng tranh tĩnh kết hợp xuất hiện đột ngột, zoom nhẹ, rung ngắn và âm thanh.
  Không yêu cầu một chuỗi frame chuyển động liên tục trong các khung.
- Giữ lâu khung mặt Player tạo cảm giác thời gian chậm lại. Bản thử này không
  cần thêm một hệ thống slow motion cho toàn bộ thế giới để đạt hiệu quả đó.
- Giữ đúng nhận diện Player theo mẫu phương án B và HeeSun của dự án, đồng thời
  phóng đại biểu cảm theo ngôn ngữ manga.
- Tách chữ và thoại khỏi ảnh để dễ chỉnh nội dung và hỗ trợ VI/EN. Giữ nguyên
  cách viết “fukkk…” cho câu lẩm bẩm của Player.
- Ảnh cần được tải sẵn để khung đầu xuất hiện ngay khi phục kích bắt đầu.

### Cấu trúc kỹ thuật dự kiến

1. Một bộ phát cảnh truyện tranh dùng chung, phủ lên màn chơi hiện có.
2. Một tệp cấu hình cảnh chứa ảnh, thoại, thời lượng, âm thanh và hiệu ứng.
   Những lần chỉnh nội dung sau chủ yếu sửa cấu hình hoặc thay ảnh; đường dẫn
   asset tuân theo cơ chế tập trung của visual pipeline.
3. Một điểm kích hoạt khi bắt đầu một lần phục kích thực sự. Mỗi lần phục kích
   chỉ phát một lần, không kích hoạt lại theo từng frame hoặc do nhân vật vẫn
   đứng gần nhau.

Trong lúc tranh hiện, tạm dừng mô phỏng và thao tác gameplay. Bộ phát tranh dùng
thời gian trình chiếu riêng để vẫn chạy khi mô phỏng dừng. Kết thúc thì tiếp tục
từ đúng trạng thái và trả điều khiển cho người chơi; kết quả chạy thoát hay bị
bắt vẫn do gameplay quyết định.

Ban đầu cần một lượt sửa code để nối bộ phát này vào game. Cấu trúc dùng chung
phục vụ phong cách manga của mọi biến cố; chuỗi ba khung ở đây là mẫu cụ thể cho
cảnh phục kích. Việc thay đặc tả animation liên tục chỉ áp dụng cho cảnh phục
kích. Thay đổi tài liệu này không triển khai animation di chuyển, luật đuổi/bắt,
cảnh ngồi mâm sau khi bị bắt, nội dung lần gặp đầu hay các sự kiện khác.

### Tiêu chí cho bản thử sau này

- Ba khung đọc được ở kích thước màn chơi trên điện thoại; biểu cảm thể hiện sự
  ngại ngùng và muốn chạy của Player.
- Phát được ở mỗi lần phục kích mới, không phát lặp trong cùng một lần.
- Tranh xuất hiện ngay, tổng nhịp thử khoảng 1,9 giây; thời lượng và hiệu ứng có
  thể chỉnh bằng cấu hình.
- Trong lúc trình chiếu không xảy ra đuổi/bắt ngoài ý muốn phía sau tranh; khi
  cắt về gameplay, vị trí và trạng thái được tiếp tục đúng, người chơi tự chạy.
- Đây là tiêu chí cho lượt triển khai tương lai, không phải kết quả đã kiểm thử
  trong lần cập nhật tài liệu này.

## Next art tasks

The current world is a single plate with conservative cropped depth occluders. A later art-only
pass may replace those crops with authored transparent far-mountain,
village-ground and foreground-foliage layers for stronger parallax without
changing simulation coordinates. OCOP props, gate/domino reactions, animals and
capture tableaux are still semantic poses, world-plate art, presentation effects
or text and are the next asset slots to illustrate.
