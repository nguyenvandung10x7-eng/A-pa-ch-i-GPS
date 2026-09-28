# Task 04 — Đề xuất nền world / Player / MOVE trong dev

Phiên bản 0.1 · 25/09/2026 · **DRAFT — chờ chủ dự án duyệt phạm vi và cấu hình.**

Baseline: **c45f3b2d860db1f92efc038d0a94532f818f0f69**, nhánh **remake/phieng-loi-v2**. Task 03: **PASS / INTEGRATED** theo xác nhận của chủ dự án. Tree đã đọc: **5e457427110d700b0f1a8db54bbccc04442609b7**.

Đây là kết quả rà soát và phụ lục đề xuất, không phải lệnh triển khai hoặc verdict QA Task 04. Không sửa code, tạo nhánh/commit/PR, merge hay phát hành trong lượt này. **F12: ACCEPTED_WITH_OWNER_WAIVER; không ghi PASS.**

## 1. Kết luận và phạm vi nhỏ nhất được đề xuất

**Đề xuất Task 04 chỉ xây nền world / Player / MOVE có biên và vật cản tĩnh trong một sân thử DEV độc lập. Chưa nối consumer cho chase_requested.**

Dependency còn thiếu là hệ thống di chuyển thật trên không gian có giới hạn: runtime mới chưa có map gameplay, Player actor, MOVE, walkable geometry/collider, HeeSun pursuit hoặc contact/capture. Nối sự kiện bàn giao ngay bây giờ sẽ đồng thời mở nhiều hệ thống chưa có cấu hình được duyệt.

Sân thử đề xuất gồm một vùng chữ nhật, một vật cản chữ nhật và một actor kỹ thuật đại diện điểm chân Player. Cấu hình, hình học, biểu diễn actor và input đều **chưa được duyệt**; §6 liệt kê chính xác điều cần chốt. Sân thử không phải map Phiêng Lơi, không chứng minh art Player hoặc isometric world đã PASS. Nếu chủ dự án yêu cầu map/Player thật ngay, cần phê duyệt asset và placement trước, rồi sửa scope này; không tự chọn ảnh để lấp chỗ trống.

Sau Task 04, kết quả có thể QA độc lập là: actor di chuyển theo MOVE, dừng đúng biên/vật cản, pause/khóa input/cleanup đúng và giữ production exclusion. Chưa có tiêu chí chase/capture nào được nghiệm thu bằng kết quả đó.

## 2. Nguồn, thứ tự ưu tiên và quyết định đã khóa

Đã đọc toàn bộ ba tài liệu dưới đây, rồi đối chiếu checkout đúng baseline; không dùng tài liệu lịch sử để suy rằng hệ thống đã chạy.

| Nguồn | Phiên bản/phần đối chiếu | Cách áp dụng |
|---|---|---|
| PL-HS-01_v0.7(2).md | v0.7, 22/09/2026; dependency, trigger, agency, flow, repeat/save và asset | Chi tiết HS-01; đặc biệt MOVE phải có trước chase, chase bằng contact |
| Phieng_Loi_Gameplay_Bible_v0.5(2).md | v0.5; §1, §7, §9–11, §15, §20 | Game 2D isometric, mobile landscape, MOVE/PHÀ ƠI, authored block; không xây simulation toàn map |
| PL-HS-01_Flow_Integration_Spec_AC_v0.2.md | v0.2; §0 Task 03 đã duyệt, §2–6, §7–10 | Phân biệt hợp đồng trình diễn hiện có với thiết kế downstream; D02–D09 và phần D10 còn mở |
| [Bản flow trong repo][flow-spec] | docs/TASK-03-REVEAL-MANGA-SPEC.md tại baseline | Căn cứ code-review; §0 giữ baseline c7cfe… và 28 test lịch sử của lúc chuẩn bị Task 03 |
| Yêu cầu mới nhất của chủ dự án | Task 03 PASS / INTEGRATED tại c45f3b2d…; lượt này chỉ rà soát | Ưu tiên cao nhất; baseline hồi quy hiện hành là **44**, không phải 28 |

Thứ tự áp dụng: yêu cầu mới nhất của chủ dự án → PL-HS-01 v0.7 cho block → Gameplay Bible v0.5 cho quy tắc chung. Phụ lục flow giải thích các hợp đồng và quyết định đã được duyệt; các ô “đề xuất” không tự trở thành yêu cầu đã chốt.

Các ràng buộc giữ nguyên:

- Task 03: reveal hợp lệ → cleanup → manga ba trang tự chuyển, được quay lại → trang cuối đã tải thành công, không pause, chủ động hoàn tất → cleanup → đúng một **chase_requested** → HANDOFF.
- Hủy không hoàn tất. Retry ảnh tạo manga run mới từ trang 1 trong cùng flow, không replay reveal. Re-entry sau hủy toàn phiên tạo phiên mới.
- Chase tương lai: MOVE ON, PHÀ ƠI OFF; HeeSun target **2× tốc độ Player**, capture bằng contact. Tỷ lệ này đã chốt; tốc độ tuyệt đối, đơn vị, collider và đường đi chưa chốt.
- Trigger thật là enter_zone cho first encounter; mục tiêu bán kính khoảng 3× chiều cao hiển thị Player đã có trong v0.7. Map/version, tâm trigger và cách quy đổi sang world-space còn mở.
- Manga chỉ unlock Book sau first capture hợp lệ. Capture chưa phải HS-01 COMPLETE; completion block phải đợi recovery hợp lệ. Book replay được đóng bất kỳ trang nào và không đổi gameplay.
- Voice unbound; audio runtime vẫn disabled. Không bổ sung SKIP ALL hoặc ghi nó là tính năng đã triển khai.
- Không đưa hidden-night content, mâm nhậu/trưởng bản hay clue vào HS-01. Recovery/save/Book và các quyết định downstream chưa duyệt vẫn ngoài scope.

## 3. Kiểm kê runtime và asset tại baseline

“Có native API của Phaser”, “có asset được tài liệu ghi AVAILABLE” và “có hệ thống gameplay đã chạy” là ba mức khác nhau.

| Hạng mục | Bằng chứng code/asset | Hiện trạng trong runtime mới | Còn thiếu |
|---|---|---|---|
| Runtime và scene | [createGame][create], [BootScene][boot], [FoundationScene][scene], [adapter][adapter] | Phaser 4.2.1; Boot → Foundation; một Game theo route owner; loader, scale, pause, teardown | Không tự suy thành game world |
| Map/world | [manifest][assets] là danh sách rỗng; Foundation chỉ đặt màu nền và attach DEV controller | Chưa có map plate/tilemap, world data hoặc world-space gameplay | Map được duyệt, bounds, đơn vị, spawn, projection/depth |
| Player | Không có actor/controller Player trong src/game/phieng-loi | Chưa có Player điều khiển được | Entity, điểm chân, pose/asset binding, MOVE |
| MOVE | createGame tắt keyboard/gamepad; [FoundationProbe][probe] chỉ có rectangle/tween/timer và điểm pointer | Pointer probe không điều khiển Player; tween rectangle không phải MOVE | Input di chuyển, tích phân theo active delta, chặn input và reset trạng thái giữ |
| Camera | FIT/CENTER_BOTH, viewport logic 1280×720; Foundation dùng main camera đổi màu nền | Có camera native và scale, chưa có follow/bounds/zoom gameplay | Quyết định camera world; mapping input khi resize; không coi FIT là camera-follow |
| Vùng đi được/collider | Không physics config; không geometry, body hoặc collider gameplay trong nhánh mới | Chưa có walkable region/static collision | Dữ liệu geometry và footprint được duyệt, luật va chạm |
| HeeSun reveal | [HeeSunReveal][reveal], [config][reveal-config]; 25 PNG + 3 aura PNG | Task 01 trình diễn độc lập, được Task 03 tái sử dụng; không phải actor chase | Chase asset/pose, movement controller; không dùng aura làm collider |
| Manga | [MangaViewer][manga]; 3 PNG có provenance | Task 02 trình diễn; Task 03 điều phối sau reveal cleanup | Không thiếu viewer cho scope đã duyệt; Book adapter chưa có |
| Chase request | [PresentationFlow][flow] phát type + flowSessionId + mangaRunId; [FlowHarness][harness] chỉ ghi diagnostics | Một yêu cầu tại HANDOFF; không có consumer gameplay | Consumer, quyền input/world, spawn HeeSun, pursuit |
| Pause tại điểm bàn giao | FlowHarness.syncEnginePause giữ engine pause khi phase khác REVEAL | HANDOFF không tự resume để di chuyển | Task nối chase sau này phải thiết kế quyền pause/khóa world; không chỉ gắn callback rồi gọi resume |
| Contact/capture | Không có sensor/body/contact resolver/capture controller mới | Chưa triển khai; không có bằng chứng chase/capture chạy | Contact gate, exactly-once/session guard, capture consequence |
| Story/save/Book | PresentationFlow không ghi progression/persistence | Không có capture checkpoint, unlock store hoặc Book replay của HS-01 mới | D07–D09 và adapter downstream |
| Production | [route][route] lazy DEV; adapter ép manifest rỗng ngoài DEV; [tests][test-flow] kiểm tra loại coordinator/debug khỏi bundle | Entry production vẫn foundation | Task 04 phải giữ giới hạn này |

Lưu ý phạm vi production gate hiện có: test reveal kiểm tra không bật harness, không request ảnh reveal và không có controller trong JS; PNG reveal nằm trong public. Không suy từ gate đó rằng mọi file tĩnh reveal đã bị xóa khỏi output build. Manga/flow còn có kiểm tra module và ảnh bundle. Task 04 đề xuất dùng hình học procedural, không thêm art tĩnh.

### 3.1. Asset nào đã được xác minh

| Asset/nguồn | Đã xác minh gì | Không được suy ra |
|---|---|---|
| public/assets/phieng-loi-v2/hs-reveal | 25 frame reveal, 3 layer aura; manifest import trong runtime mới | Có walk cycle, pursuit pose hoặc collider HeeSun |
| src/game/phieng-loi/manga/assets | 3 ảnh gốc và provenance.json; viewer đang dùng | Book đã unlock hoặc replay gameplay đã có |
| AST-PLAYER-BASE / AST-HEESUN-BASE trong v0.7 §12 | Tài liệu ghi AVAILABLE cho movement | Chưa tìm thấy binding/manifest/actor tương ứng trong runtime mới; chưa có đường dẫn + checksum + scale/anchor được duyệt cho Task 04 |
| village-world-v2.webp | Tên xuất hiện trong chú thích legacy worldLayout và tài liệu extraction; không có file plate đó trong checkout baseline | Có map mới đã import hoặc layout được phép dùng lại |
| Ảnh ban-phieng-loi-mthen.webp | Ảnh task/card hiện hữu, được src/data/tasks.json tham chiếu | Đây là map isometric hoặc collision map |
| Recovery visual, sit-up, voice | v0.7/flow còn mục chuẩn bị/map/quyết định; reveal config voice unbound | Có thể bật ngay hoặc lấy asset gần giống thay thế |

Đây là kiểm kê checkout và ba nguồn đã đọc. Không kết luận asset Player/HeeSun không tồn tại ở mọi kho bên ngoài; kết luận là **chưa được map và chứng minh hoạt động trong runtime Phaser mới**. Nếu chọn art thật, phải cung cấp bản cụ thể và binding được duyệt trước code.

### 3.2. Ranh giới legacy

Các file src/experiences/phieng-loi/worldLayout.ts, runtime.ts, src/pages/PhiengLoiGamePage.tsx và src/phieng-loi.css còn trong repo, nhưng route hiện hành đi vào PhiengLoiV2Page. Trang legacy ở baseline tạo loop với onStep rỗng; worldLayout chứa các tọa độ/route/navigation cũ. Không lấy sự tồn tại của chúng làm bằng chứng hệ thống mới có MOVE/chase.

[Quy tắc PL-00][pl00] cấm import, copy, adaptation và tái sử dụng kiến trúc legacy, kể cả PR #148/nhánh extraction/preview cũ. Task 04 phải viết module mới trong boundary remake, dùng vòng đời/update native Phaser; không mang lại custom RAF, tọa độ, route graph, save migration hoặc collider legacy.

[verify:pl00][guard] hiện kiểm tra import graph, manifest production rỗng, no physics/plugins/audio và whitelist asset. Không bỏ hoặc nới toàn bộ guard để làm test xanh. Với đề xuất procedural/no-physics, giữ các bất biến này; nếu chọn asset/physics khác thì phải duyệt scope thay đổi gate trước.

## 4. Hợp đồng Task 04 được đề xuất

Mọi hành vi ở mục này là đề xuất chờ §6; chưa có API/module mới được triển khai.

### 4.1. Đầu vào

1. Dev entry riêng, tên đề xuất **/phieng-loi?dev=world-move**; không thay entry hs-flow hoặc route production.
2. Cấu hình fixture được chủ dự án duyệt và được version hóa: configId, geometry/bounds, spawn, footprint, speed, camera/input mapping và tolerance kiểm thử (§6).
3. Session do adapter tạo, quyền pause manual/hidden hiện hành; một tập lý do khóa MOVE riêng của world controller.
4. Pointer input từ một vùng MOVE được duyệt. Đề xuất pointer joystick dùng touch/mouse; chưa thêm keyboard/gamepad.
5. Nếu chọn art thật thay procedural: asset ID/version/checksum, manifest, pose, anchor/scale đã duyệt; đây là thay đổi phương án cần cập nhật AC lỗi tải.

**Không nhận chase_requested làm lệnh start.** Nút mở sân thử là thao tác dev, không phải enter_zone, resume HS-01 hoặc capture trigger.

### 4.2. Đầu ra và dữ liệu quan sát

- Một actor kỹ thuật có vị trí world và footprint, chạy MOVE trong geometry đã duyệt.
- Snapshot DEV: worldSessionId, worldRunId, configId, lifecycle, pauseReasons, moveLockReasons, inputVector, position/footprint, camera transform và số tài nguyên owned.
- Event ledger DEV có seq/session/run: world_ready, input_cleared, pause/lock thay đổi, collision_blocked, world_cancelled, world_disposed; tên là hợp đồng đề xuất, không phải event bus chung.
- Tách input định hướng, displacement thực và collision result để QA chứng minh va chạm qua quãng đường, không chỉ kiểm tra ảnh chụp điểm cuối.
- Không phát chase_started/capture/HS01_COMPLETE, không unlock Book, không ghi save. world_ready chỉ chứng minh fixture sẵn sàng; không phải world Phiêng Lơi hay HS-01 READY.

### 4.3. Vòng đời, input và pause

| Tình huống | Hành vi đề xuất |
|---|---|
| Mount | BOOTING; MOVE chưa nhận input. Validate config trước khi tạo actor |
| Config hợp lệ, scene sẵn sàng | READY; spawn đúng config, input zero; ACTIVE chỉ khi hết global pause và hết khóa MOVE |
| Manual pause / hidden / pagehide | Giữ vị trí, thêm đúng lý do pause; clear pointer/input đang giữ; không chạy movement delta |
| Resume | Chỉ gỡ lý do của caller; phải hết manual và hidden mới chạy. Không bù thời gian ẩn; cần thao tác MOVE mới |
| Khóa MOVE riêng | Không thay global pause; actor đứng yên và input zero. Bỏ một khóa không xóa khóa khác; không tự resume Game |
| Pointer up/cancel/lost capture/blur | Clear input; không giữ hướng từ lần chạm cũ. Touch phụ không cướp pointer đang điều khiển |
| Resize/rotation | Giữ world position/geometry; tính lại screen-to-world/input transform. Nếu gesture bị vô hiệu, clear input và yêu cầu chạm mới |
| Hủy/thoát route/unmount | Vô hiệu run/session trước teardown; clear input, hủy listener/update/game objects của Task 04; không completion |
| Restart scene | Dọn run cũ; run mới trong adapter session nếu adapter vẫn còn. Callback run cũ không sửa run mới |
| Re-entry sau hủy toàn phiên | Game/session mới qua teardown barrier; actor về spawn được duyệt, không lưu vị trí trước đó |
| Config lỗi/spawn không hợp lệ | ERROR, không world_ready/MOVE. Không tự clamp spawn, teleport hoặc dùng cấu hình mặc định để che lỗi |
| Retry fixture | Đề xuất một phiên world mới với config hợp lệ, không sửa flow HS-01. Không liên quan retry ảnh manga |

Global pause được adapter sở hữu. World controller sở hữu move locks và input. Không dùng snapshot status “ready lần cuối” thay trạng thái paused hiện tại. Không thay semantics Task 03; việc bàn giao quyền engine ở HANDOFF để chase chạy thuộc task nối sau.

### 4.4. Di chuyển/collider/camera tối thiểu

Phương án khuyến nghị, chưa được duyệt:

- World kỹ thuật 2D Cartesian tách khỏi CSS pixels; camera cố định chứa fixture, giữ FIT hiện hành. Chưa có camera-follow, zoom, depth sorting hoặc phép chiếu isometric cho map thật.
- Vector MOVE có độ dài tối đa 1; tốc độ là vP × độ lớn input, không có diagonal boost. Dead zone và kích thước/vị trí vùng MOVE phải có trong config được duyệt.
- Dùng delta active từ native Phaser update; không React setState mỗi frame, không custom RAF, không đồng hồ gameplay thứ hai.
- Footprint AABB quanh điểm chân và geometry chữ nhật; không dùng toàn bounding box ảnh/aura. Kích thước/offset/vị trí đều TBD.
- Khi đường di chuyển sắp xuyên biên/vật cản: dừng tại điểm hợp lệ trước tiếp xúc; đề xuất không slide, bounce, teleport hoặc tự tìm đường. Kiểm tra cả đoạn chuyển động để không xuyên vật cản mỏng khi frame dài.
- Không mở Arcade/Matter/plugin trong scope này. Đây là movement/collision kỹ thuật viết mới dưới vòng đời Phaser, chưa là hệ thống vật lý hoặc contact Player–HeeSun.

Không có tốc độ, tọa độ, kích thước collider, dead zone hoặc ngưỡng timing mới nào được chốt bằng tài liệu này. Việc duyệt phương án định tính chưa thay cho duyệt cấu hình số.

## 5. Ngoài phạm vi và đường tới chase/capture

Task 04 chưa làm map làng thật, art/animation Player, HeeSun actor/chase, pathfinding, contact/capture, trigger thật, world-state/major-event slot, PHÀ ƠI, camera-follow/depth/occlusion, voice/music, recovery, save/load, Book replay/unlock, SKIP ALL hoặc nối hs-flow. Không thay reveal/manga và không sửa main.

| Bước | Dependency/đầu ra phải có | Ranh giới nghiệm thu |
|---|---|---|
| Task 04 đề xuất | MOVE + geometry/collision + pause/lifecycle trong fixture được duyệt | Chỉ nền dev world/MOVE; chưa có chase |
| Task nối chase sau này, chưa được cho phép | Map/placement và Player/HeeSun binding; consumer đúng session/run; quyền pause/input sau HANDOFF; đường tiếp cận/contact D02–D03 | Phải chứng minh một chase thật, HeeSun 2× Player cùng đơn vị và contact thật; nút “bắt”/timer/sự kiện giả không thay thế |
| Capture và downstream, scope còn mở | Capture commit một lần, checkpoint/unlock nhất quán D07–D08; timing/recovery D05–D06; Book D09 | Contact kỹ thuật chưa phải capture commit; capture chưa phải full HS-01 COMPLETE |

Trước khi triển khai chase cần đánh giá obstacle/pathfinding trên map thật. Task 04 có một vật cản không chứng minh HeeSun có thể tìm đường hoặc chắc chắn bắt được Player. Nếu sau này chỉ test contact sensor mà chưa có consequence/save, phải ghi “contact kỹ thuật”, không ghi PASS first capture hoặc unlock giả.

## 6. Bảng quyết định cần chủ dự án chốt

Tất cả **T04-Dxx đang OPEN**. Khuyến nghị không phải mặc định đã được ủy quyền. Không điền giá trị gameplay bằng số từ legacy hoặc tọa độ staging reveal (820,630).

| ID | Quyết định cụ thể | Khuyến nghị để scope nhỏ | Chủ dự án cần xác nhận/cung cấp |
|---|---|---|---|
| T04-D01 | Task 04 là foundation riêng hay nối chase ngay? | Chỉ foundation DEV; giữ hs-flow dừng ở HANDOFF | Duyệt phạm vi §4–5; nếu chọn nối chase phải lập scope mới |
| T04-D02 | Fixture kỹ thuật hay map/Player art thật? | Procedural, một vùng chữ nhật + một vật cản + actor marker chân; không claim art/isometric PASS | Cho phép biểu diễn kỹ thuật. Nếu art thật: ID/version/checksum và pose/anchor/scale được duyệt |
| T04-D03 | World-space, geometry và spawn | Fixture Cartesian, camera cố định; không lấy vị trí trong làng thật | Config được duyệt cho bounds, obstacle, spawn, footprint. Có thể duyệt một bản vẽ overlay/config ở lượt đặc tả tiếp theo trước code |
| T04-D04 | UI MOVE và hành vi joystick | Một pointer joystick touch/mouse; analog magnitude; chưa keyboard/gamepad, không inertia | Loại input, vùng hiển thị/hit area, dead zone; chấp thuận fresh input sau pause/lock/resize/cancel |
| T04-D05 | Tốc độ và thời gian di chuyển | Một vP theo world units/active second, không tăng chéo; chưa acceleration | Giá trị vP, đơn vị và sai số QA được duyệt. 2× dành cho HeeSun tương lai, không sinh HeeSun trong Task 04 |
| T04-D06 | Collider và response | Footpoint AABB + blocked rectangle; stop trước contact, không slide/bounce/pathfinding, không physics plugin | Duyệt shape, width/height/offset, khoảng hở/sai số; luật dừng. Nếu cần slide/shape khác, cập nhật AC trước code |
| T04-D07 | Camera/projection và resize | Fixed camera cho fixture; giữ viewport/FIT hiện hữu; không follow/isometric art | Duyệt phương án camera và mapping; không tự coi sân thử là thiết kế camera game cuối |
| T04-D08 | Reset/lock/re-entry của fixture | Theo §4.3: manual/hidden độc lập; lock có owner; restart run mới; re-entry session mới về spawn; không save | Chấp thuận lifecycle và retry fixture. Không đóng quyết định reload HS-01 D08 bằng quy tắc dev này |

### Cấu hình còn trống cần được duyệt trước triển khai

| Nhóm | Trường cần chốt | Trạng thái |
|---|---|---|
| Nhận dạng | configId/version, phạm vi “technical fixture” | OPEN |
| World | đơn vị, bounds, obstacle bounds, spawn x/y | OPEN; không lấy tọa độ legacy |
| Actor | marker/asset được phép, điểm chân; footprint width/height/offset | OPEN; collider fixture không phải contact radius HeeSun |
| MOVE | vP, dead zone, vùng input, magnitude mapping | OPEN |
| Camera | fixed-view transform/fit, mapping khi resize | OPEN; giữ 1280×720 runtime không tự quy thành kích thước map |
| QA | sai số vị trí/tốc độ/collision, khoảng delta active được hỗ trợ | OPEN; là tiêu chuẩn đo, không phải duration chase/capture |

Có thể duyệt phương án fixture trước và yêu cầu một phụ lục cấu hình/overlay cụ thể để duyệt tiếp. Chừng nào các trường cần thiết còn trống, **Task 04 chưa READY_FOR_IMPLEMENTATION**. Không dùng giá trị tạm rồi báo đó là cấu hình đã duyệt.

### Quyết định downstream tiếp tục mở

| Mã flow hiện hành | Giữ mở phần nào | Đề xuất để chốt ở đúng task sau |
|---|---|---|
| D02 | Map/version thật, Player/HeeSun spawn, trigger center và units | Duyệt một map + overlay marker/geometry riêng; fixture Task 04 không khóa chúng |
| D03 | Chase navigation, stuck policy, contact shape/tolerance | Dùng cùng world-space/speed units; duyệt đường tiếp cận và footprint thật; không contact bằng aura/timer |
| D04 | Voice asset/cue | Giữ unbound tới khi clip/cue được duyệt; cue 0,45 s trong hồ sơ chỉ là đề xuất |
| D05–D06 | Hold/fade/black/recovery timings, pose/sit-up và recovery marker/assets | Duyệt bảng timing và visual recovery riêng; không tự áp dụng bộ 500/500/250/500 ms của phụ lục cũ |
| D07–D08 | Capture checkpoint, save slot/storage, lỗi ghi, reload trước/sau capture | Chốt trước khi xây capture commit/unlock; không dùng in-memory stub để nghiệm thu save |
| D09 | Book shell/pause và được mở lúc nào | Giữ quy tắc unlock sau capture/replay không đổi gameplay; lịch mở Book trong major event vẫn cần chốt |
| D10 còn lại | Escape/pause menu, rời full flow, Book mở lại ở trang nào | Retry ảnh và re-entry dev đã chốt ở Task 03; không mở lại. Chính sách full-flow/Book vẫn OPEN |

D01 của phụ lục flow đã đóng cho Task 03. T04-D01 là quyết định phạm vi mới, không đổi quyết định cũ.

## 7. Acceptance criteria riêng Task 04

**Trạng thái hiện tại của toàn bộ AC: DRAFT / NOT RUN.** Gate thực thi bị chặn bởi các T04-Dxx liên quan chưa duyệt. PASS chỉ được QA ghi trên SHA triển khai cụ thể và evidence mới. Không dùng 44 test cũ để chấm các AC chức năng mới.

Cột phụ thuộc dưới đây dùng D01…D08 làm số rút gọn của **T04-D01…T04-D08**, không phải mã Dxx của flow downstream.

| AC | Given / When | Then — kết quả có thể kiểm thử | Quyết định phụ thuộc |
|---|---|---|---|
| T04-AC01 | Dev entry được chọn; kiểm tra import graph và production preview với cùng query | World module chỉ chạy DEV; production không có harness/debug API/module Task 04; không request asset mới; graph không tới/copy legacy | D01–D02 |
| T04-AC02 | Mount với config hợp lệ trong StrictMode | Một actor, một bộ điều khiển MOVE, một world_ready/run sau validation; ghi configId/session/run; input zero trước ready | D02–D03,D08 |
| T04-AC03 | Config thiếu/sai, spawn ngoài bounds hoặc footprint chồng vật cản; retry bằng config hợp lệ | ERROR không ready/MOVE; không clamp/teleport/fallback âm thầm; retry tạo phiên mới, không hồi callback phiên lỗi | D03,D06,D08 |
| T04-AC04 | Người dùng tác động pointer MOVE trên actor đang ACTIVE; sau đó thả | Actor thật đổi vị trí đúng hướng/magnitude được duyệt; thả thì đứng yên; không chỉ thay diagnostics hoặc tween trang trí | D04–D05 |
| T04-AC05 | Input cùng độ lớn trên trục/chéo; cùng tổng active time với các phân đoạn delta khác nhau, không vật cản | Quãng đường theo vP × magnitude × active time trong sai số được duyệt; không diagonal boost hoặc phụ thuộc số frame | D04–D05 |
| T04-AC06 | Pointer up/cancel/lost capture, blur, thao tác ngoài vùng MOVE, pointer phụ hoặc chạm UI pause | Input về zero khi mất quyền; không tự trôi/nhận tap UI thành MOVE; pointer phụ không cướp active pointer | D04,D08 |
| T04-AC07 | Di chuyển tới mọi cạnh/góc bounds từ nhiều hướng | Toàn footprint ở vùng hợp lệ; không chỉ tâm actor nằm trong bounds; theo response đã duyệt, không teleport | D03,D06 |
| T04-AC08 | Di chuyển cắt vật cản, sát mép/góc; một frame dài có thể vượt bề dày vật cản | Không xuyên đoạn bị chặn; stop/clearance đúng config; không bounce/slide ngoài quyết định; đường thoáng vẫn đi được | D03,D05–D06 |
| T04-AC09 | Resize, letterbox, portrait↔landscape khi đứng yên/đang giữ input | World position/geometry không đổi do CSS; camera/input mapping đúng; gesture mất hiệu lực được clear; không claim F12 PASS | D03–D04,D07–D08 |
| T04-AC10 | Manual pause khi đang MOVE; chờ rồi resume | Position, displacement/active movement time đứng yên khi pause; không catch-up; resume không tự dùng input cũ | D05,D08 |
| T04-AC11 | Hidden/pagehide; manual+hidden cùng bật, gỡ theo cả hai thứ tự | Không MOVE khi còn bất kỳ global pause nào; bỏ manual không xóa hidden và ngược lại; trở lại cần input mới | D08 |
| T04-AC12 | Hai chủ sở hữu giữ khóa MOVE; gỡ từng khóa, xen manual pause | Không MOVE đến khi hết khóa và global pause; unlock không resume engine/xóa khóa khác; không cần giả phase HS-01 | D08 |
| T04-AC13 | Cancel/unmount/route exit trong BOOTING, ACTIVE và PAUSED | Vô hiệu session/run trước cleanup; actor/input/listener/update owned được dọn; hủy không emit completion/chase/capture | D08 |
| T04-AC14 | Restart scene hoặc re-entry ngay; giao lại input/callback từ run/session cũ | Run/session mới không bị sửa vị trí/trạng thái; restart thay run; re-entry thay session và về spawn; không save/resume vị trí cũ | D03,D08 |
| T04-AC15 | 20 vòng mount/move/pause/cancel/re-entry và scene restart | Max live Game ≤1; không nhân actor/controller/listener; tài nguyên Task 04 về zero sau teardown, không callback mồ côi | D08 |
| T04-AC16 | Thực hiện toàn bộ hành động world; quay lại hs-flow chạy đến HANDOFF | Không consumer chase mới, không HeeSun/capture/progression/save/unlock; hs-flow vẫn một request sau cleanup và dừng; voice unbound, không SKIP ALL | D01 |
| T04-AC17 | Chạy MOVE/bounds/obstacle trên AUTO/WebGL, Canvas và AUTO fallback hiện có | Cùng geometry/input semantics, actor nhìn thấy đúng camera; không lỗi console/runtime; kiểm thử browser không thay QA thiết bị thật | D02–D07 |
| T04-AC18 | Bàn giao candidate SHA cho QA | Nguyên 44 test baseline PASS và kết quả test mới báo riêng; AC matrix, đúng SHA/run/artifact; không báo chase/full-flow PASS; F12 vẫn waiver | Tất cả |

Không đổi expected/assertion của baseline để nhận thêm scope. Nếu một phương án đã duyệt thực sự đòi thay hợp đồng foundation, dừng và trình thay đổi đó trước; không che bằng cập nhật snapshot.

## 8. Test bổ sung và bằng chứng phải bàn giao

### 8.1. Baseline cố định

| Nhóm hiện có | Số test | Vai trò |
|---|---:|---|
| Foundation | 16 | Hồi quy runtime/route/lifecycle |
| Reveal | 7 | Hồi quy Task 01 |
| Manga | 5 | Hồi quy Task 02 |
| Integration | 16 | Hồi quy Task 03 đến một chase_requested |
| **Tổng** | **44** | Giữ nguyên; không được ghi thành 44 test world/MOVE/chase |

Bằng chứng baseline được dẫn lại: [Verify #36116753550](https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/actions/runs/36116753550), [artifact pl00-browser-evidence](https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/actions/runs/36116753550/artifacts/10855821204). Đây là run tích hợp Task 03, không phải run Task 04 mới. Lượt rà soát này không chạy lại CI hoặc browser suite.

### 8.2. Nhóm test mới

Đề xuất file mới tests/phieng-loi/world-move.spec.mjs cùng fixture/config QA được duyệt. Đây là kế hoạch, chưa tạo file hoặc đăng ký test. Tối thiểu 17 kịch bản mới, tương ứng AC01–AC17; số test thực tế có thể tăng khi parameterize, phải báo theo artifact, không cộng số dự kiến vào số PASS.

| Nhóm mới | AC được kiểm | Bằng chứng bắt buộc |
|---|---|---|
| DEV entry, config, ready/error | 01–03 | Import/bundle check; configId/hash; session/run; error và ready counts; screenshot fixture/overlay |
| MOVE thật và input ownership | 04–06 | Pointer thật từ browser → vị trí actor thật; raw/normalized vector, active delta, displacement; input-cleared reasons |
| Bounds/static collision | 07–08 | Geometry/footprint overlay, trajectory trước/sau, đoạn va chạm, clearance; ca góc và vật cản mỏng |
| Camera/input transform | 09 | Cùng world position qua viewport thay đổi, transform và hit mapping; phân biệt touch emulation/thiết bị thật |
| Pause và khóa MOVE | 10–12 | Ledger thứ tự pause/hidden/lock; snapshot đứng yên; resume với input mới; không catch-up |
| Cancel/re-entry/ownership | 13–15 | Resource counters của module mới và native scene; stale session/run rejection; 20 vòng cleanup |
| Scope/downstream isolation | 16 | Không story/save/unlock writes; không chase consumer; Task 03 giữ điểm bàn giao đúng nghĩa |
| Renderer paths | 17 | Trạng thái renderer, trajectory/collision nhất quán và console exceptions |

Đường thành công phải chạy input thật và native Phaser update; test thuần hình học hoặc setPosition/injection chỉ bổ sung ca biên, không thay browser MOVE. Bơm delta/callback cũ phải gắn nhãn synthetic trong evidence. Long-frame collision test không được làm thành timeout capture.

### 8.3. CI và báo cáo cho QA ở lượt triển khai sau

- Candidate dự kiến tách nhánh task riêng từ baseline được xác nhận lại; tên đề xuất task/pl-world-04-move. Chưa tạo nhánh trong lượt này.
- Verify push hiện whitelist tới Task 03. Khi triển khai Task 04 cần thêm đúng nhánh mới vào workflow hoặc dùng PR CI đã được cho phép; không giả định push branch mới tự có Verify.
- Chạy verify/typecheck/build, toàn 44 baseline và suite mới; giữ các kiểm tra Production Security Audit/Tracked Secret Scan theo workflow hiện hành. Lượt này không thay workflow.
- Artifact giữ baseline report và thêm world-move evidence riêng: results JSON/HTML, AC mapping, config được duyệt, ledger, trajectory/geometry overlay, cleanup/pause snapshots, console và trace khi fail.
- Báo rõ baseline 44/44 và số mới passed/failed/skipped; không dùng retry che lỗi. CI xanh nhưng AC/bằng chứng mới thiếu thì chưa READY_FOR_QA/PASS chức năng.
- Gói QA gồm HEAD SHA, base SHA, diff, link run đúng SHA, artifact, bảng T04-AC01…18. Chỉ QA độc lập được kết luận Task 04; không tự merge hoặc đi tiếp downstream.

## 9. Phạm vi thay đổi dự kiến nếu được duyệt

Cho phép đề xuất: module DEV mới dưới src/game/phieng-loi/world/ hoặc thư mục tương đương trong boundary hiện có; world harness riêng; nhánh lazy DEV trong PhiengLoiV2Page; test/evidence mới; tài liệu Task 04 và workflow/gate chính xác cần thiết.

Tái sử dụng PhaserHost/mountPhaser và ownership native. Nếu cần thay adapter/contracts chung để quan sát pause, phải giải thích lý do và giữ 44 test; không thêm quyền gameplay production. Không sửa PresentationFlow, HeeSunReveal, MangaViewer, ảnh gốc hoặc các giá trị đã QA chỉ để làm thuận tiện cho sân thử.

Cấm import/copy/adapt legacy; sửa main; deploy/release; bật audio/physics/plugin; thay app/backend/save/Book; thêm chase consumer, capture, real trigger hoặc nhiệm vụ tiếp theo mà chưa được duyệt.

## 10. Trạng thái bàn giao của lượt này

- Đã xác minh HEAD checkout và nhánh tích hợp đúng baseline c45f3b2d…; working tree code sạch.
- Đã đối chiếu ba nguồn với module, asset manifest, route, guard và test hiện hành.
- Chỉ có tài liệu đề xuất này. **Task 04: SPEC DRAFT / NOT IMPLEMENTED / NOT TESTED.**
- **Task 03 vẫn PASS / INTEGRATED. F12 vẫn ACCEPTED_WITH_OWNER_WAIVER.**
- Chờ chủ dự án chốt T04-D01…D08 và cấu hình cần thiết; không suy sự im lặng thành phê duyệt.

## Tham chiếu code cố định tại baseline

Các liên kết code trong tài liệu đều ghim tại SHA c45f3b2d860db1f92efc038d0a94532f818f0f69; không trỏ tới HEAD có thể thay đổi.

[create]: https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c45f3b2d860db1f92efc038d0a94532f818f0f69/src/game/phieng-loi/createGame.ts
[boot]: https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c45f3b2d860db1f92efc038d0a94532f818f0f69/src/game/phieng-loi/scenes/BootScene.ts
[scene]: https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c45f3b2d860db1f92efc038d0a94532f818f0f69/src/game/phieng-loi/scenes/FoundationScene.ts
[adapter]: https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c45f3b2d860db1f92efc038d0a94532f818f0f69/src/game/phieng-loi/mountPhaser.ts
[assets]: https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c45f3b2d860db1f92efc038d0a94532f818f0f69/src/game/phieng-loi/assets.ts
[probe]: https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c45f3b2d860db1f92efc038d0a94532f818f0f69/src/game/phieng-loi/dev/FoundationProbe.ts
[route]: https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c45f3b2d860db1f92efc038d0a94532f818f0f69/src/pages/PhiengLoiV2Page.tsx
[reveal]: https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c45f3b2d860db1f92efc038d0a94532f818f0f69/src/game/phieng-loi/reveal/HeeSunReveal.ts
[reveal-config]: https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c45f3b2d860db1f92efc038d0a94532f818f0f69/src/game/phieng-loi/reveal/config.ts
[manga]: https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c45f3b2d860db1f92efc038d0a94532f818f0f69/src/game/phieng-loi/manga/MangaViewer.tsx
[flow]: https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c45f3b2d860db1f92efc038d0a94532f818f0f69/src/game/phieng-loi/flow/PresentationFlow.ts
[harness]: https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c45f3b2d860db1f92efc038d0a94532f818f0f69/src/game/phieng-loi/flow/FlowHarness.tsx
[test-flow]: https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c45f3b2d860db1f92efc038d0a94532f818f0f69/tests/phieng-loi/flow.spec.mjs
[guard]: https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c45f3b2d860db1f92efc038d0a94532f818f0f69/scripts/verify-pl00-foundation.mjs
[pl00]: https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c45f3b2d860db1f92efc038d0a94532f818f0f69/docs/PL-00-PHASER-RUNTIME-FOUNDATION.md
[flow-spec]: https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c45f3b2d860db1f92efc038d0a94532f818f0f69/docs/TASK-03-REVEAL-MANGA-SPEC.md
