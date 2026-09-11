# Tháo PR #148 theo từng phần nhỏ

## Mốc nguồn và giới hạn

- Nguồn: PR #148, `remake/phieng-loi-closed-world`.
- Commit nguồn đã đối chiếu: `f40cb84df9ff778869958acc0fe5401974991e14`.
- Snapshot: `snapshot/phieng-loi-pr148-f40cb84-20260911`.
- Nền của lần tách đầu: `main` tại `2e14bdbd789ac8bd96c9bb2ec8bb091606d42917`.
- Không merge, đóng, xóa hoặc force-push PR #148; không thay đổi `main`.
- Snapshot không dừng tác vụ ở khung chat khác. Commit mới sau mốc nguồn phải được đối chiếu riêng, không tự kéo vào.
- Không chép toàn bộ nhánh hoặc cherry-pick toàn bộ chuỗi commit sang PR mới.
- Đây là kế hoạch tách implementation, không phải đặc tả gameplay mới.

## Nguồn yêu cầu

Ưu tiên chỉ dẫn mới nhất của người dùng hơn mô tả PR hoặc implementation cũ.
Lần rà soát này đã đọc metadata PR, các phần code liên quan và truy xuất được
một phần những khung chat gần nhất; KHÔNG khẳng định đã đọc đầy đủ cả năm khung.
Các mục chưa có đủ nguyên văn được đánh dấu cần đối chiếu, không suy đoán.
Việc tách nền độc lập dưới đây không phụ thuộc vào các quyết định còn thiếu.

### Những quyết định phải giữ khi đưa gameplay sang

- Core MOVE + PHÀ ƠI; không tự thêm cơ chế, thoại, hiệu ứng, thông số hoặc biến thể.
- PHÀ ƠI: normal 5 giây; khoảng 20% TRUE NOTHING với cooldown tổng 60 giây.
  TRUE NOTHING không sinh hậu quả mới; thế giới đang hoạt động vẫn tiếp tục.
- HeeSun manga: dừng simulation, khóa input, preload, mỗi encounter một lần;
  không có bubble/thoại runtime trùng lời trong ảnh; đóng manga rồi bắt đầu chase.
  Thứ tự ảnh: `ChatGPT Image 10_20_02 11 thg 9, 2026.png`,
  `ChatGPT Image 10_54_09 11 thg 9, 2026.png`,
  `ChatGPT Image 11_00_04 11 thg 9, 2026.png`.
- Yêu cầu capture mới nhất đã truy xuất: chỉ hiện
  `BẠN ĐÃ BỊ HEESUN BẮT ĐI NHẬU`, rồi reset về điểm bắt đầu.
  KHÔNG đưa lại chuỗi `3 GIỜ SAU`, cảnh ngồi nhậu, `Làm chén cuối.`, `5 GIỜ SAU`.
  Đây là thay thế riêng capture HeeSun, không phải lệnh xóa mọi mâm nhậu trong game.
- HANU: giữ nguyên ảnh manga đầy đủ, không cắt khung hoặc thêm thoại runtime;
  khóa input/dừng simulation, preload, mỗi encounter một lần.
  Tên asset HANU chưa truy xuất đầy đủ: không đoán tên hoặc tự vẽ thay.
- HANU giao cơm: khoảng cách ban đầu xa hơn nhưng vẫn bắt được; bộ đếm nội bộ
  5 giây chỉ bắt đầu sau khi đóng manga. Giữ kết quả thành công đã chốt.
  Hết thời gian: chỉ `BẠN ĐÃ TỤT HUYẾT ÁP`, rồi reset.
  Không tự áp lại khoảng cách 220–260 hoặc timing của đề xuất cũ.
- Dọn bubble/thông báo chồng nhau; không dùng thông báo thay cho diễn xuất đã duyệt.
- Hoàn thiện NPC/animation đã xác định trước, sau đó mới làm đẹp map.
- Asset hiện có được lưu lại; chưa xác minh nguồn/quyền sử dụng thì không coi là đã được phép phát hành.

## Các bước tách, theo dependency

Mã bước dưới đây KHÔNG phải số PR GitHub. Chỉ mở phần có thể kiểm tra độc lập;
không mở hàng loạt PR chưa chạy được. Mỗi phần phải có mục tiêu, whitelist file,
điều kiện đạt và phần cố ý chưa đưa sang. Không merge tự động.

| Bước | Phạm vi | Phụ thuộc | Điều kiện đạt |
| --- | --- | --- | --- |
| S01 | Nền tọa độ, đường đi, vùng đi được; test; tài liệu này | main | Khớp nguyên bản nguồn; test độc lập; không đổi giao diện |
| S02 | Route `/phieng-loi`, game loop, input, pause/cleanup tối thiểu | S01 | Vào/ra không rò loop; mất focus không giữ phím; không đổi trang chủ |
| S03 | Player, atlas đã duyệt, walk/run/turn/stop, camera nền | S02 | Di chuyển nhìn thấy được; đúng foot anchor; không kéo NPC/event vào |
| S04 | PHÀ ƠI pose và hợp đồng cooldown | S03 | Test 5/60 giây, TRUE NOTHING; không thêm phản ứng giả để lấp chỗ trống |
| S05 | Lớp trình chiếu manga và kiểm soát bubble/thông báo | S02–S04 | Input/simulation khóa và trả đúng; không chồng lớp; không sáng tác nội dung |
| S06 | HeeSun appearance, manga, chase, capture theo yêu cầu mới | S03–S05 | Không lặp manga; capture chỉ thông báo và reset; asset phải được xác định |
| S07 | HANU appearance, phone-walk và animation đã duyệt | S03 | Giữ style; không tự kích hoạt delivery hoặc event khác |
| S08 | HANU manga và delivery/chase theo yêu cầu mới | S05, S07 | 5 giây bắt đầu sau manga; success giữ nguyên; timeout đúng thông báo |
| S09 | Tương tác HeeSun–HANU đã được duyệt | S06, S08 | Đối chiếu yêu cầu đầy đủ trước khi port; không khôi phục event đã bỏ |
| S10 | Save/Continue và Book overlay | S06–S09 | Không ghi đè save cũ bằng snapshot thiếu dữ liệu; pause/restore đúng |
| S11 | NPC/event còn lại: tách riêng từng event được xác nhận | S05, S09 | Mỗi event có chỉ dẫn nguồn; thiếu nguyên văn thì chưa port |
| S12 | Audio và VUONGME theo quyết định đã duyệt, chia việc riêng | S11 | Xác định đúng track/duration/trigger trước khi nối; không bê cả manifest |
| S13 | Tích hợp menu chính khi lát cắt đã dùng được | S10 và phần cần thiết | Book/Challenge/Admin hiện có không regression; không nhập 1954 kèm theo |
| S14 | Map art và ambient, sau NPC/animation | S06–S09 | Chia theo khu vực/lớp; không thay gameplay cùng lúc |
| S15 | Mobile, hiệu năng và regression trước khi thay thế PR cũ | Các phần đã nhận | Kết quả gắn đúng HEAD; kiểm thử thiết bị thật riêng; chưa đạt thì chưa đóng #148 |

## Bản đồ GIỮ / TÁCH / CHƯA ĐƯA SANG

| Nhóm file nguồn | Xử lý |
| --- | --- |
| `src/experiences/phieng-loi/worldLayout.ts` | S01: tái sử dụng nguyên blob; không remake map |
| `src/pages/PhiengLoiGamePage.tsx` | Tách loop/input/lifecycle ở S02; Book/save/HUD theo phần riêng; không copy nguyên page |
| `src/experiences/phieng-loi/gameEngine.ts` | Tách theo Player, PHÀ ƠI, HeeSun, HANU, save; không bê engine 1.558 dòng vào PR nền |
| `motionController.ts`, `PhiengLoiVisualScene.tsx`, `visualAssets.ts` trong thư mục game | Tái sử dụng logic/asset theo actor; cô lập type contract; không kéo mọi actor qua một lần |
| `src/phieng-loi.css` | Chỉ đưa selector cho phần đang tách; không nhập cả stylesheet 1.871 dòng |
| `public/images/phieng-loi/player-*.webp`, `heesun-*.webp`, `hanu-*.webp` | Giữ ở snapshot; lấy đúng atlas đang dùng ở S03/S06/S07; giữ trạng thái provenance |
| Các atlas chief/feast/stream/support/vuongme/wife và landmark | Giữ ở snapshot; chưa bật tự động trong PR nền |
| `village-world-v1.webp`, `village-world-v2.webp` | Không đổi hình/map trong S01; chỉ lấy plate phù hợp khi có compositor |
| `absurdityDirector.ts` | Đối chiếu từng event ở S11; loại trừ ID đã retire; không lấy cả registry |
| `audioDirector.ts`, `audioManifest.ts`, `public/audio/phieng-loi/` | Giữ tài nguyên; chỉ nối cue cần thiết và đủ provenance; không thêm thoại |
| `scripts/verify-phieng-loi-engine.mjs`, `qaScenarios.ts` | Trích test cho lát cắt tương ứng; không dùng pass ở HEAD cũ chứng minh PR mới |
| `src/services/phiengLoiSession.ts` | S10; bảo vệ khóa lưu và migration trước khi bật Continue |
| `src/App.tsx`, `ApplicationEntry.tsx`, `ApplicationShell.tsx`, `src/main.tsx` | Chỉ thay tối thiểu khi cần route; giữ kiến trúc main trong S01 |
| `ExperiencesHubPage.tsx`, `src/experiences-hub.css`, `experienceRegistry.ts`, `featuredExperiences.ts` | Menu/integration riêng; không thay trang chủ theo PR lớn một cách máy móc |
| `Layout.tsx`, `MobileAppShell.tsx`, `ChallengePage.tsx`, `TaskMap.tsx`, `productSurfaces.ts`, `src/index.css`, `src/mobile-shell.css`, `src/task-map.css` | Không đưa diff liên quan app cũ sang cùng game foundation |
| `TemporalScene.tsx`, `src/components/temporal3d/`, `JourneyPage.tsx`, `src/journey.css`, `temporalAudio.ts`, `docs/temporal-1954-assets.md` | Lưu riêng ở snapshot; 1954 ngoài phạm vi lần tháo game này |
| `package.json`, `package-lock.json`, `tsconfig.json`, `src/i18n/reactI18next.ts`, `index.html` | Không lấy thay đổi từ #148 trừ dependency thật cần thiết; S01 chỉ nối test vào scripts |
| README và tài liệu architecture/open-world/closed-world/visual/audio | Tài liệu tham chiếu, không mặc nhiên là đặc tả mới nhất; chỉ đưa phần liên quan |
| `docs/asset-provenance.md`, README asset | Giữ bằng chứng hiện có; không đổi UNVERIFIED thành CLEARED khi thiếu chứng cứ |

Không khôi phục các ID đã retire: `feast-chase`, `hanu-head-only`,
`hanu-go-faster`, `distant-reply`, `delayed-feast-memory`,
`feast-remembers-call`, `delayed-far-oi`, `far-oi-returns`.
Không dùng mã animation/FSM chung còn tồn tại để suy ra event cũ được phép bật lại.

## S01: nội dung thực tế của PR đầu

Chỉ bốn file: tài liệu này, `worldLayout.ts`,
`scripts/verify-phieng-loi-foundation.mjs` và `package.json`.
Blob `worldLayout.ts` phải là `2feefc3727216e55e7fc86699826984d1eb35489`,
đúng 283 dòng từ commit nguồn; không thay tọa độ, route hay dữ liệu OCOP.
Các export về NPC/OCOP ở đây chỉ là dữ liệu nền chưa được dùng trong runtime,
KHÔNG phải quyết định bật các event hoặc chốt catalog sản phẩm.

Chạy `npm run verify:phieng-loi:foundation` để kiểm tra 8 nhóm invariant:
viewport, điểm tương tác, tuyến HANU, cầu/vùng chặn, chiếu về đường đi,
navigation target, tọa độ legacy, và bản ghi foreground.
Lệnh `npm run verify` bao gồm test này cùng kiểm tra provenance, typecheck và build cũ.
Không thêm dependency; không sửa lockfile; không sửa route hoặc giao diện.

Đã chạy test nền và strict TypeScript riêng trong môi trường làm việc.
Chưa chạy được toàn bộ ứng dụng trong môi trường này; không suy ra build/lint,
Netlify preview hoặc iPhone đã đạt từ test nền. Kiểm tra CI đúng HEAD PR mới.

Bước triển khai kế tiếp: S02, chỉ route/game loop/input/pause.
Không ghép tiếp các S03–S15 vào PR S01 để tránh tạo lại một PR khổng lồ.

## S02: route và vòng đời runtime

S02 chỉ nối trực tiếp route `/phieng-loi`, RAF loop có bước thời gian giới hạn,
input di chuyển bằng bàn phím/joystick trái và pause/resume. Khi mất focus,
ẩn tab/app hoặc rời trang, input được xóa, RAF và listener được dọn đúng vòng đời.

Không đưa Player, HeeSun, HANU, map art, manga, PHÀ ƠI, audio, save, Book overlay,
HUD gameplay hoặc event vào lát cắt này. Trang chủ, menu trải nghiệm và các route
hiện có giữ nguyên; không copy nguyên `PhiengLoiGamePage.tsx` hoặc engine từ #148.

## S03: Player, chuyển động và camera nền

S03 chỉ đưa Player vào runtime S02 bằng đúng `village-world-v2.webp`, ba atlas
`player-locomotion-{side,down,up}-v2.webp` và `player-actions-v2.webp` từ snapshot
`f40cb84`. Walk/run lấy frame theo quãng đường thật; start/turn/stop, hysteresis
đổi hướng, foot anchor 92% và camera đi thường giữ nguyên mapping/thông số đang
chạy trong nguồn. Không lấy camera chase hoặc camera impulse.

Năm asset được giữ nguyên binary và hash; trạng thái provenance vẫn là
`UNVERIFIED`, chỉ dùng preview cho đến khi đủ bằng chứng nguồn/quyền hình ảnh.
Không đưa HeeSun, HANU, NPC khác, event, PHÀ ƠI, audio, save, HUD gameplay,
foreground/ambient hoặc thay đổi map vào S03. Chưa có nguyên văn khác về tốc độ,
mapping frame, foot anchor, camera hoặc atlas cuối cùng; lát cắt này không suy đoán
ngoài các giá trị đã tồn tại ở snapshot.
