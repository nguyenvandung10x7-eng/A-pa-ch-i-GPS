# Task 05 — HS-01: HeeSun bắt đi nhậu, tỉnh dậy hết tiền, khăn piêu và quả bí — v0.5

**Ngày:** 29/09/2026 · **Trạng thái:** CONFIG PACKAGE APPROVED / ASSETS CONFIRMED BY OWNER / NOT IMPLEMENTED / NOT RUN. Chủ dự án đã duyệt gói cấu hình tại §7 và xác nhận có bốn nhóm asset. Source mapping và các chi tiết kỹ thuật chưa nằm trong gói được theo dõi riêng; đây không phải verdict PASS gameplay.

**Baseline đã QA:** `ce02cf3a21ab088a80e13417f3ff3d3b7c8545ac` trên `remake/phieng-loi-v2`; tree `3592324ac66b9eaf3c74e1238e0cc942fa272e48`. Lượt này đối chiếu bản v0.4 hiện hành và xác nhận duyệt gói cấu hình của chủ dự án; không kiểm lại runtime/repo. Bổ sung tiếp nhận asset cùng ngày tại §13: đã đọc PNG/MP3 đính kèm, kiểm metadata/hash và cắt clip blackout 3 giây theo yêu cầu.

**Task 04 giữ đóng**, QA-04-001 CLOSED; nguyên 44 + 28 test baseline và 18 AC Task 04. **F12: ACCEPTED_WITH_OWNER_WAIVER.** Lượt bổ sung này chỉ cập nhật hồ sơ và tạo clip blackout 3 giây từ âm thanh người dùng gửi. Không sửa spritesheet gốc, code gameplay, test, commit/PR, merge hoặc phát hành.

## 0. Quyết định nội dung từ v0.4 và phê duyệt cấu hình v0.5

**Chủ dự án yêu cầu:** “phà ơi gần heesun sẽ bị bắt đi nhậu, sau đó hết tiền. Bỏ phần Phà ơi gần mâm nhậu thì heesun không chase nữa. Điều đó làm mất cốt truyện game là sau lần heesun bắt lần đầu tiên, nhân vật tỉnh dậy và thấy khăn piêu, quả bí cầm tay”.

1. **Bỏ hẳn nhánh PHÀ ƠI tại mâm để HeeSun vào bàn/ngừng chase.** Không còn lối thoát trước first capture, interaction-zone mâm hoặc substate đi/ngồi vào bàn phục vụ nhánh đó trong Task 05.
2. **PHÀ ƠI gần HeeSun dẫn tới bị bắt đi nhậu**, cùng tuyến hậu quả với bị HeeSun bắt trong chase. Không tạo ending riêng bỏ qua lần tỉnh dậy đầu tiên.
3. **Sau đi nhậu Player hết tiền.** Contract đầu ra: số dư tiền hiện có về **0**, không âm; không tự sáng tác nợ hoặc khoản phạt cố định. Phạm vi mở thêm chỉ là hậu quả tiền của sự kiện này, không phải hệ kiếm xu/đói/quán phở/OCOP.
4. **Lần tỉnh dậy đầu tiên phải cho thấy khăn piêu và quả bí đang cầm tay.** Không đủ nếu chỉ có cờ trong snapshot, icon đồ vật rời hoặc một quả bí đặt ở nền. Không kể nguồn gốc đồ vật hoặc tự hoàn tất Clue1–4.
5. Giữ các quyết định trước: hold/fade ngắn → đen chỉ audio; animation nằm→đứng→idle; say **5000ms active từ khi đứng dậy xong và điều khiển được**, không chờ joystick; HeeSun không đuổi/bắt lại trong lượt sau capture.
6. Giữ luật PHÀ ƠI **TRUE NOTHING 20% / khóa 60 giây** đã chốt, áp dụng cho lời gọi gần HeeSun; yêu cầu mới chưa nêu miễn luật này. Nhánh có hiệu lực gây bắt; TRUE NOTHING không gây bắt *do lời gọi*. Va chạm chase độc lập vẫn có thể bắt, kể cả khi vừa TRUE NOTHING hoặc đang cooldown. Không coi cooldown là bất tử hay làm HeeSun ngừng đuổi.

**Không còn OPEN:** có giữ lối thoát qua mâm nhậu hay không — đã bỏ. Không triển khai một lựa chọn runtime để bật lại nhánh cũ. Gói thông số tại §7, clock khóa và modifier đã được chủ dự án duyệt trong v0.5; không tiếp tục ghi chúng là PROPOSED. Các đề xuất khác không có trong gói không tự được phê duyệt theo.

**Xác nhận mới của chủ dự án:** “Tôi đồng ý với gói đề xuất, clip blackout, animation Player đứng dậy, khăn piêu và bí cầm tay đã có”.

Ghi nhận bốn nhóm asset là **AVAILABLE_BY_OWNER**. Sau lần đính kèm bổ sung, đã đọc/hash PNG chứa animation, khăn và bí cầm tay; đã đọc/hash MP3 và cắt clip blackout **3 giây**. Chi tiết tại §13: **SOURCE_FILES_VERIFIED / RUNTIME_MAPPING_PENDING / NOT RUN**. Việc nhận diện tệp không thay kiểm tra animation/attachment trong runtime hoặc QA gameplay; không hỏi lại sự tồn tại của asset.

## 1. Phạm vi và đường chơi

Mục tiêu: một lượt DEV liền mạch dùng reveal/manga thật, handoff `chase_requested`, MOVE và HeeSun truy đuổi; kết thúc sau đoạn bị bắt đi nhậu, tỉnh dậy đúng cốt truyện, say 5 giây và MOVE bình thường.

Trong phần encounter Task 05, hai nguồn hợp lệ hội tụ vào **cùng một capture transaction**:

- `body_contact`: HeeSun bắt được Player trên quỹ đạo/collider đã duyệt.
- `phao_heesun`: một lời PHÀ ƠI được nhận, có hiệu lực, khi Player gần HeeSun trong phase được phép. Đây là nguyên nhân tương tác, không bịa một contact hình học để làm test qua.

Cả hai đều đi qua hold → fade → black/audio → Player tỉnh dậy hết tiền, thấy khăn piêu và quả bí cầm tay → animation đứng lên → say 5000ms active → recovery/normal MOVE → một `hs01_playtest_complete`.

**Không được** cho PHÀ ƠI ngừng chase mà chưa capture, gửi HeeSun vào mâm để tránh sự kiện, hoặc ghi COMPLETE trước hậu quả lần tỉnh dậy. Hành động gọi không phát âm/kết quả khi TRUE NOTHING; không phát sinh một nhánh được cứu dựa trên xác suất.

Phần tiền tối thiểu gồm balance đầu vào hợp lệ và hậu quả balance=0 gắn với capture transaction. Task 05 dùng fixture DEV đã duyệt: khởi đầu **10 xu**, sau đi nhậu **0 xu**, thêm case khởi đầu 0. Không âm thầm nối backend hoặc quảng cáo đã có kinh tế production. Production ghi state/port và cách quan sát before/after trong cấu hình triển khai; 10 xu không phải số dư khởi đầu production được duyệt.

Ngoài phạm vi: kinh tế xu–đói, kiếm tiền/tiêu tiền tổng quát, quán phở, OCOP, EventDirector, Book UI, save/backend, map làng/trigger thật, clue/alien, lảo đảo/ngất do va chạm; lặp lại đi nhậu sau khi first encounter đã complete. Tương tác HeeSun trong free-roam về sau cần đặc tả riêng, không bị quy tắc “không chase lại trong lượt Task 05” tự động quyết định.

## 2. Narrative và thay đổi nguồn

| Nội dung | Contract hiện hành |
|---|---|
| First encounter | Reveal/manga thật → chase; bị bắt bằng contact hoặc gọi gần HeeSun đều giữ cùng đoạn kể chuyện |
| Chuyển cảnh | Hold/fade → màn đen + clip audio; không ảnh bàn full-screen/nút Tiếp tục |
| Khi tỉnh dậy | Hết tiền, khăn piêu hiện rõ, quả bí cầm tay; animation nằm→đứng→idle |
| Say | 5000ms active từ `stand_up_complete && control_ready && !paused`; không trừ thời gian audio/load/fade/animation/pause |
| HeeSun sau capture | Không chase/bắt lại trong lượt; không cần mời tại mâm |
| Clue | Chỉ hé lộ hậu quả đã duyệt; không giải thích ai đưa khăn/bí hoặc auto-complete clue |
| Khăn/bí | Bắt buộc về trình bày lần tỉnh dậy; bí vẫn inert, không thêm inventory, công dụng hoặc quest logic |
| Tiền | Số dư về0 vì đi nhậu; retry/callback cũ không trừ lần nữa hoặc đụng ví của phiên khác |
| Nhánh mâm v0.2–v0.3 | BỊ LOẠI BỎ; không còn gate/chỗ ngồi/đường vào bàn hoặc ending tránh capture |

Production cập nhật phụ lục nguồn HS-01/Bible/flow trước code để ghi design delta PHÀ ƠI gần HeeSun và mất tiền. Không sửa ngược hồ sơ hoặc AC Task 01–04 đã PASS. Asset/scarf placement phải đối chiếu mẫu đã có; chưa tự quyết khăn đeo ở đâu. Vị trí tay cầm bí, anchor/layer và pose được duyệt phải cho người chơi thấy rõ.

## 3. Runtime thực có và khả năng tái sử dụng

| Thành phần tại baseline | Thực có | Dùng cho Task 05 / phần thiếu |
|---|---|---|
| `mountPhaser.ts`, `createGame.ts`, `FoundationScene.ts` | Một Game theo route; hàng đợi teardown; session/isCurrent; manual/hidden pause; FIT 1280×720; AUTO/Canvas; noAudio; không physics plugin | Tái sử dụng nguyên foundation. Scene/gameplay mới gắn qua DEV attachScene; không thêm RAF, clock hoặc Game thứ hai. Audio mới cần đường tích hợp riêng được duyệt vì foundation hiện noAudio; không tự đổi mặc định PL-00 hoặc bật audio toàn cục |
| `WorldController.ts` | Actor Phaser dạng footprint; pointer owner; analog; lock/pause sets; native update; clear gesture; counters/cleanup | Dùng semantics và controller nền. Hiện trộn input, mô phỏng và hình marker; actor/step/position private, chưa có API cho modifier, phối hợp hai actor hoặc recovery placement |
| `world/config.ts` | Sân B=(80,80)–(1200,520), O=(600,220)–(760,380), spawn=(240,300); footprint 24×16, gap2; Vmax 240; joystick (160,632), R64/d8/H80 | Đây là config **đã duyệt cho Task 04**, không tự thành cấu hình map làng. D02 đề nghị tái dùng nguyên cho sân Task 05. `validate()` cố ý chỉ nhận đúng APPROVED, không nới validator để nhét NPC/sân mới |
| `world/collision.ts`, `geometry()`, `legal()` | Swept point với bounds và một obstacle được co/nở; một fraction cho toàn vector; ổn định contact; `legal` strict | Có thể dùng cho va chạm tĩnh của cả hai actor sau khi cấu hình NPC được duyệt. Không xử lý contact động giữa hai actor hoặc tìm đường |
| Camera/input | Camera identity cố định, FIT; client→logic; resize clear gesture | Đủ cho sân một màn hình. Chưa có follow/depth/isometric projection/map lớn; không đưa các hệ này vào Task 05 mặc định |
| `HeeSunReveal`, `MangaViewer`, `PresentationFlow` | Reveal/aura cleanup; manga ba trang; session/run guard; một request; retry manga | Tái sử dụng nguyên nội dung/contract. PresentationFlow terminal vẫn HANDOFF; không sửa nó thành coordinator toàn game |
| `FlowHarness.tsx` | Receiver chỉ ghi handoff; engine pause khi phase khác REVEAL | Không dùng nguyên harness này làm gameplay. Harness mới phải chuyển quyền engine sang downstream sau HANDOFF; nếu giữ điều kiện pause cũ thì chase không chạy |
| `WorldHarness.tsx` | Sân thử độc lập, instrumentation synthetic, pause/re-entry; một world_ready/run | Giữ nguyên entry và 28 tests; API synthetic không phải API gameplay hoặc đường thành công Task 05 |
| Pursuit/contact/capture | Chưa có trong module Phaser mới đã đọc | Cần actor HeeSun, hướng/path, collision động, vùng gần HeeSun cho PHÀ ƠI và transaction capture chung hai nguồn. Tối đa một capture trong lượt; không đuổi/bắt lại sau đó |
| Hold/fade/table/drunk/recovery | Chưa có controller trong runtime mới | Cần owner blackout/audio/animation, timer active, modifier, hậu quả tiền/khăn/bí và recovery gate; không còn substate mâm nhậu |
| Story/Book/save | PresentationFlow không ghi state/persistence; không có Book replay tại module mới | Mốc capture/unlock eligibility, hậu quả tiền và completion cần owner; chưa chứng minh có wallet runtime. Không suy rằng Book/save/kinh tế đã có |
| Assets | Repo có 25 reveal frame, ba aura và ba manga; pack v0.7 chứa reveal/aura/config/notes | Kiểm kê v0.1 là lịch sử của pack đó. Chủ dự án xác nhận có clip blackout, animation đứng dậy, khăn piêu và bí cầm tay. Tệp bổ sung đã được đọc/hash ở §13: một PNG chứa cả animation/khăn/bí và một MP3 nguồn, đã tạo WAV blackout 3 giây. Runtime frame/fps/anchor còn cần map; không tự tạo lại asset. Bộ walk Player/HeeSun không nằm trong xác nhận mới. Task 05 không cần art nhánh mâm đã bỏ |
| Legacy | Có `src/experiences/phieng-loi/worldLayout.ts` với tọa độ cũ; entry mới không dùng | Không nhập lại map, runtime, tọa độ hoặc save legacy; không dùng sự tồn tại của file cũ để gọi là dependency đã sẵn sàng |

QA-04-001 giữ CLOSED / FIX VERIFIED. Cách sửa hiện hành chuẩn hóa mặt tiếp xúc tính được, không mở rộng miền legal. Task 05 phải giữ đặc tính đó và kiểm chuyển động/contact mới riêng, không mở lại defect đã đóng.



## 4. Điểm nối kỹ thuật

1. Một consumer đúng flowSession/run; handoff thật đã cleanup; duplicate/stale/cancel bị loại. PresentationFlow cũ giữ HANDOFF, không sửa thành coordinator toàn game.
2. Một owner simulation, tái sử dụng MOVE/collision qua port opt-in tối thiểu; không vừa native listener vừa external-step. Không dùng synthetic/private state làm command gameplay.
3. Contact vẫn earliest body contact trên quỹ đạo sau static collision/waypoint, không aura/endpoint-only. Source PHÀ ƠI có guard riêng về khoảng cách, phase, pause, cooldown và outcome; không nới collider để biến “gần” thành contact.
4. Cả hai nguồn dùng transaction chống trùng. Capture accepted → dừng pursuit/contact, clear gesture, khóa MOVE; giữ một nguyên nhân/ID truy vết. Contact và lời gọi có hiệu lực cùng update không tạo2lần capture,2clip,2lần hậu quả tiền hoặc2completion. Nguồn có thời điểm sớm nhất thắng; cùng thời điểm thì ưu tiên body_contact. Ghi timestamp/cause đủ để kiểm độc lập, không lấy thứ tự callback tình cờ làm policy.
5. TRUE NOTHING hoặc input bị khóa không tạo capture từ lời gọi, không phát tiếng/phản hồi story, không trừ tiền/cấp đồ. Contact thật vẫn độc lập và phải được ghi đúng nguyên nhân; không triệt contact để giả TRUE NOTHING bảo vệ Player.
6. Audio DEV có owner cho unlock/load/play/error/end/pause/resume/cleanup; lỗi/play-denied không tự kết thúc. Không tự bật audio toàn cục của foundation noAudio hoặc bỏ guard72baseline.
7. Chuẩn bị recovery gồm actor nằm, khăn piêu, bí cầm tay và hậu quả tiền. Mọi commit/callback gắn session/run/captureId; retry an toàn, không trừ số dư một lần nữa, không cấp thêm bí/khăn. Khuyến nghị commit hậu quả trước khi lộ cảnh tỉnh dậy để visual/state đồng nhất; đây là lựa chọn triển khai cần khóa trong config.
8. Hình ảnh phải quan sát được trên actor thật. Snapshot wallet/item flags không thay bằng chứng khăn/bí xuất hiện; movement/timer dùng active delta, không clock nền. Giữ cleanup upstream và harness Task03/04 nguyên semantics.

## 5. State đề nghị

| State | Hành động và gate ra | MOVE |
|---|---|---|
| `IDLE/PREPARING` | Validate config/asset/balance fixture; Start chạy reveal/manga thật, chờ handoff sạch | OFF |
| `CHASE` | MOVE/pursuit; contact hoặc PHÀ ƠI có hiệu lực gần HeeSun → cùng CAPTURE_HOLD. TRUE NOTHING giữ chase, không có nhánh tới mâm để thoát | Normal |
| `CAPTURE_HOLD` | Commit một capture, ghi cause/ID, dừng pursuit/contact cho cả lượt; clear input; chưa giả hoàn tất câu chuyện | OFF |
| `FADE_OUT` | Hold active xong mới fade về đen | OFF |
| `BLACK_AUDIO` | Chỉ clip được duyệt; playback thật kết thúc đúng phiên mới qua gate; error/retry rõ | OFF |
| `BLACK_PREPARE` | Chuẩn bị recovery: Player nằm, khăn/bí đúng asset/attachment; bảo đảm tiền sau đi nhậu=0 theo transaction; ready mới lộ cảnh | OFF |
| `FADE_IN` | Fade-in 500ms active hiện lần tỉnh dậy với hậu quả truyện; hoàn tất fade rồi mới chạy animation đứng dậy | OFF |
| `STAND_UP` | Nằm→đứng→idle, non-loop; khăn hiện và bí cầm tay đúng staging. Sau capture+đứng dậy mới ghi đã bị bắt đi nhậu; chưa hết say | OFF đến control-ready |
| `DRUNK` | Đứng dậy xong và điều khiển được, hết pause → bắt đầu5000ms active, không chờ input; không chase/bắt lại | Đảo vector MOVE |
| `RECOVERY` | Gỡ modifier/input cũ, normal MOVE/readiness; khăn/bí còn đúng trạng thái, tiền=0; không cần PHÀ ƠI thêm | Normal khi hết khóa |
| `COMPLETE` | Mọi hậu quả kể chuyện/ready/cleanup thỏa, phát một playtest_complete; không mở kinh tế hoặc flow downstream | Normal |
| `ERROR` | Retry đúng phase; không silent skip audio/animation/khăn/bí/tiền; không fallback vị trí tùy tiện | Theo owner |
| `CANCELLED/DISPOSED` | Invalidate trước cleanup; không callback phiên cũ tạo capture, thay tiền/items hoặc complete | OFF |

Tối đa một capture/lượt Task 05. Không có `CHASE_RESUMED`, `HS_TABLE_APPROACH`, `HS_TABLE_SEATED` hoặc ending tránh first capture. Task 05 bắt đầu sau handoff nên đề nghị nhận PHÀ ƠI trong CHASE; việc gọi HeeSun trước reveal hoặc sau encounter chưa thuộc lượt này, không tự sửa upstream.

## 6. Pause, thời gian, lỗi và reload

- Manual/hidden/pagehide có owner độc lập. Pursuit/actor/hold/fade/audio/animation/say dừng khi global pause; resume không catch-up hoặc replay từ đầu. Audio không resume được phải hiện trạng thái cần thao tác.
- Timer say bắt đầu một lần ở `stand_up_complete && control_ready && !paused`; actor idle vẫn tính. Không tính audio/load/fade/animation/pause hoặc cộng trọn frame vào cả hai phase. Đúng4999/5000ms phải kiểm riêng.
- PHÀ ƠI giữ 20% TRUE NOTHING/khóa **60 giây active — APPROVED**. Khóa bắt đầu khi lời gọi hợp lệ được nhận, kể cả outcome TRUE NOTHING. Manual pause/hidden dừng clock; resume không bù thời gian. Đổi phase không reset khóa; input bị từ chối không gia hạn hoặc quay RNG. Reload/reset DEV xóa khóa theo D06; đây không phải quyết định persistence production.
- Pause/resize/blur/phase change/đổi modifier clear gesture. PHÀ ƠI/retry audio không truyền thành joystick; input trùng không thêm capture hoặc hậu quả tiền.
- Audio/animation/asset lỗi chỉ retry phase hiện tại với run token mới; giữ transaction capture, không replay reveal/chase hoặc phát sinh trừ tiền lặp. Không bỏ qua khăn/bí vì asset lỗi để báo ready.
- Hậu quả tiền phải idempotent và gắn phiên; snapshot before/after được giữ cho QA. Hủy sau khi hậu quả đã commit không phải lý do callback cũ sửa một ví khác; chính sách persistence ngoài DEV chưa được nghiệm thu.
- **D06 APPROVED:** reload DEV → IDLE, reset fixture về 10 xu và cooldown về trạng thái chưa khóa; phải bấm Start mới chạy lượt mới. Rời route phải cleanup; re-entry là phiên DEV mới. Reset fixture không phải “hoàn tiền” trong gameplay production. Không save/Book/account hoặc tự phục hồi một capture đang dở.

## 7. Gói cấu hình đã duyệt và phần cần đối chiếu khi tích hợp

**Approval record:** `T05-DEV-HS01-CFG-A01`, revision thiết kế **v0.5**. Các hàng trong bảng sau là gói chủ dự án đã đồng ý, không còn PROPOSED. Bảng không mặc nhiên phê duyệt mọi đề xuất kỹ thuật từng xuất hiện trong v0.4.

| Nội dung | Giá trị / hành vi APPROVED |
|---|---|
| Gần HeeSun | Ngưỡng **96 WU**, đo khoảng cách giữa điểm chân Player và HeeSun; vật cản nằm giữa chặn tác động của lời gọi lên HeeSun |
| Hai nguồn bắt | Sự kiện sớm nhất thắng; nếu cùng thời điểm ưu tiên **body_contact**; đúng một capture transaction |
| Khóa PHÀ ƠI | **60 giây active**, tính từ lời gọi hợp lệ được nhận; pause/hidden dừng clock; đổi phase không reset; lời gọi bị từ chối không gia hạn |
| Tốc độ | Player Vmax **240 WU/giây active**; HeeSun **480 WU/giây active**, không phụ thuộc độ kéo joystick của Player |
| Blackout | Hold **500ms active** → fade-out **500ms active** → màn đen phát trọn clip **3 giây** cắt từ MP3 người dùng gửi (§13) → recovery ready → fade-in **500ms active** |
| Đứng dậy / say | Fade-in kết thúc rồi chạy animation nằm→đứng→idle; sau animation và control-ready, **đảo vector MOVE đủ 5000ms active**, không chờ kéo joystick, rồi về normal MOVE |
| Tiền DEV | Fixture mặc định **10 xu → 0 xu** sau đi nhậu; kiểm thêm **0 → 0**. Không phê duyệt số dư khởi đầu production |
| Reload DEV | Trở về **IDLE**, reset fixture và cooldown; bấm **Start** để chạy lượt mới; **không save** |

Không thêm timer đen tối thiểu 250ms riêng từ đề xuất cũ: gói được chọn dùng gate clip kết thúc và recovery ready trước fade-in. Pause/hidden vẫn dừng playback/timer theo §6. Không coi thời gian tải hoặc thời gian app ẩn là thời gian say.

| ID | Phần đã chốt | Phần Production cần đối chiếu hoặc ghi rõ |
|---|---|---|
| D01 — Narrative/hậu quả | Cùng một tuyến bị bắt đi nhậu, tiền về 0, tỉnh dậy có khăn piêu và bí cầm tay; không mâm bypass hoặc auto-complete clue | Dùng clip/mẫu có sẵn, kiểm nội dung không tiết lộ ngoài phạm vi; ghi cách thể hiện số dư và scarf placement theo mẫu |
| D02 — Sân/entry | Task 05 vẫn là encounter DEV, không map làng/trigger thật | Đề xuất cũ `?dev=hs01-play`, sân Task 04, Player(240,300), HeeSun(1000,300), recovery(240,300) chưa nằm trong gói số vừa duyệt; ghi rõ trong cấu hình triển khai, không tự gắn nhãn owner-approved |
| D03 — Chase/contact | Player 240 / HeeSun 480; contact và lời gọi dùng cùng transaction, ưu tiên theo thời điểm như bảng trên | Body NPC 24×16/gap2 còn là đề xuất; cần khóa body/path và chứng minh đi vòng vật cản, contact liên tục. Khoảng gọi 96 WU không làm nở collider |
| D04 — Blackout/audio | Hold 500 / fade-out 500 / clip3giây / ready / fade-in 500; chỉ đen và audio | Clip đã cắt/hash, giữ gain nguồn, xem §13; còn map asset key/gain runtime và owner audio DEV, unlock/retry/cleanup. Không dùng time-out3giây giả để thay playback ended |
| D05 — Đứng dậy/say | Fade-in xong mới đứng dậy; đảo MOVE 5000ms active sau animation/control-ready | Map animation đã có: thứ tự frame, fps, anchor và sự kiện kết thúc; không thay bằng pose tĩnh hoặc tự thêm lảo đảo/ngất |
| D06 — Tiền/state/reload | Fixture 10→0, case 0→0; reload IDLE/reset fixture+khóa, Start, không save | State/port DEV, thời điểm commit hậu quả trước khi lộ wake và snapshot before/after; giữ idempotence, không nối economy/backend |
| D07 — Visual/asset | Chủ dự án xác nhận có đủ; PNG đính kèm cho thấy animation, khăn và bí cầm tay; WAV3giây đã cắt | Tên/hash/kích thước đã ghi §13; runtime mapping frame/fps/anchor/hand attachment qua nằm–đứng–idle–MOVE còn pending. Không dùng icon/flag hoặc bí dưới đất thay bí cầm tay |
| D08 — PHÀ ƠI gần HeeSun | 96 WU theo điểm chân, bị chặn bởi vật cản; TRUE NOTHING 20%; 60s active; precedence theo bảng | Ghi quy ước biên khoảng cách/che khuất và cách lấy thời điểm event cho oracle; encounter hiện đề nghị nhận call ở CHASE. Không tự mở call trước reveal hoặc sau encounter |

**C01–C07 Task 04 giữ nguyên.** Các tọa độ sân/NPC body, sai số hình học ≤10⁻⁶ WU, pointer/native/cross-renderer ≤0.05 WU và delta DEV 0–1000ms/invalid→ERROR vẫn là các đề xuất kỹ thuật kế thừa nếu chưa có bản duyệt riêng. Production gom chúng cùng mapping asset vào cấu hình triển khai; chỉ đưa lại chủ dự án những lựa chọn còn cần chốt hoặc xung đột làm đổi hành vi đã duyệt. Không yêu cầu duyệt lại gói A01 hay xác nhận lại bốn nhóm asset đã có. Không lấy layout legacy.

## 8. Acceptance criteria Task 05 — 24 ID, NOT RUN

Giữ 24 ID AC; cập nhật giá trị theo gói A01 đã duyệt. Source mapping và các lựa chọn kỹ thuật còn lại phải được ghi rõ trước runtime. Không dùng72baseline để chứng nhận các AC mới.

| ID | Given / When | Then — bằng chứng bắt buộc | D |
|---|---|---|---|
| T05-AC01 | Start entry mới, reveal/manga thật đến handoff | Một engine/flow; cleanup upstream trước consumer; không inject request cho đường thành công; entry cũ giữ semantics | 02 |
| T05-AC02 | Request đúng/lặp/sai phiên/sai run/pause/cancel | Tối đa một chase/encounter; stale/duplicate bị loại; pending không spawn khi pause và bị hủy đúng | 02 |
| T05-AC03 | Config/spawn/asset/balance đầu vào sai, retry | Không ready/capture/complete giả; error rõ, không clamp/fallback; retry không đưa state phiên lỗi sang phiên mới | 02,03,06,07 |
| T05-AC04 | MOVE pointer mouse/touch trong chase | Actor thật đi đúng analog, không diagonal boost; up/cancel/blur/resize/phase mất quyền clear; PHÀ ƠI không trở thành MOVE | 02 |
| T05-AC05 | Player idle/slow/full trên đường thoáng | Player Vmax 240, HeeSun 480 WU/giây active; vận tốc HeeSun không nhân theo magnitude joystick của Player, không scale sprite để giả vận tốc | 03 |
| T05-AC06 | Player/NPC đi quanh obstacle, cạnh/góc sân | Hai footprint/path legal; không kẹt các đường duyệt, xuyên/tự slide/teleport hoặc auto-capture theo thời gian | 03 |
| T05-AC07 | Body contact trên hai quỹ đạo, gồm delta1000ms/endpoint tách | Source body_contact nhận earliest contact thật sau static clipping/waypoint; không bắt do aura hoặc gần đơn thuần. Source PHÀ ƠI kiểm AC15 riêng, không giả contact | 03,08 |
| T05-AC08 | Contact và PHÀ ƠI có hiệu lực cùng update; callback trùng/sai phase; tiếp xúc sau first capture | Một captureId, một hold/audio/hậu quả tiền; clear MOVE và dừng pursuit/contact ngay; không capture/chase lần2; cause trace theo thời điểm sớm nhất, cùng thời điểm ưu tiên body_contact | 03,06,08 |
| T05-AC09 | Capture theo mỗi nguồn; tỉnh dậy; retry; kết thúc | Cả hai qua cùng hậu quả đi nhậu. Sau đứng dậy ghi đã bị bắt đi nhậu đúng một lần; balance sau đi nhậu=0, khăn hiện và bí cầm tay; đủ say/normal MOVE/cleanup mới complete một lần; không mâm bypass/Book/save/clue tự bật | 01,05,06,07,08 |
| T05-AC10 | Capture và input giữ xuyên hold/fade | Hold 500ms rồi fade-out 500ms active; fade-in 500ms sau clip và recovery ready, hoàn tất trước stand-up; actor không trôi, input cũ không hoạt động sau chuyển quyền; không kết thúc theo wall time | 04 |
| T05-AC11 | Audio load/play/end/error/denied/pause/retry | Nền đen chỉ clip3giây tại §13; không ảnh bàn/nútTiếp tục; playback đúng phiên hoàn tất mới đi tiếp, không chồng/skip giả; retry không capture hoặc trừ tiền lần nữa | 01,04,06 |
| T05-AC12 | Recovery/khăn/bí/animation ready chậm/lỗi; đứng dậy xong nhưng control chưa ready | Không lộ cảnh sai/ready giả; nằm→đứng→idle đủ asset/config; khăn/bí quan sát được đúng vị trí/hand attachment; đủ cả gate/hếtpause mới vào say, callback trùng không reset | 02,04,05,07 |
| T05-AC13 | Hai gate ready, không kéo joystick;4999ms rồi1ms, pause dài | Timer1lần, idle vẫn tính; đủ 5000ms active; loại toàn bộ audio/load/fade/animation/pause; không lấy delta trước gate | 05 |
| T05-AC14 | Modifier duyệt, hướng/chéo/analog/collision; hết say | Đảo vector MOVE, giữ magnitude analog/collision; không lảo đảo/ngất ngoài scope; hết5000ms gỡ/reset input, normal MOVE thật. Khăn/bí vẫn đúng khi MOVE, không drift/chase lại | 03,05,07 |
| T05-AC15 | PHÀ ƠI quanh ngưỡng 96 WU theo điểm chân, có/không vật cản giữa hai actor, valid/paused/stale/locked và hai outcome | Có hiệu lực + gần theo ngưỡng 96 WU + không bị vật cản che + phase hợp lệ → capture chung, không gửi HeeSun vào mâm/retire để thoát. TRUE NOTHING 20% không tiếng/phản hồi/capture do lời gọi hoặc tiền/items, vẫn khóa 60s. Cooldown không chặn body_contact hợp lệ; sau capture không thêm transaction | 06,08 |
| T05-AC16 | Manual/hidden/pagehide ở chase, hold/fade, audio, animation, say và recovery | Các owner độc lập; actor/alpha/audio/animation/timer dừng, không catch-up; khóa 60s dùng active time từ call hợp lệ, đổi phase không reset, rejected call không gia hạn; không gỡ khóa của owner khác | 04,05,08 |
| T05-AC17 | Resize/portrait/letterbox ở chase, blackout, wake, say và paused | Geometry/time không đổi vì CSS; mapping MOVE/PHÀ ƠI đúng, clear gesture; blackout kín, khăn/bí và hand attachment không lệch; không claim F12 PASS | 02,07,08 |
| T05-AC18 | Delta 0/1000/invalid; ranh giới contact–call, clip, animation, control, timer và cooldown | Đúng policy, không đếm hai lần hoặc bỏ readiness; cause capture đúng; không tính say trước gate; không bỏ qua khóa | 02,04,05,08 |
| T05-AC19 | Cancel/unmount/route exit từng phase, kể cả paused; callback muộn và re-entry | Invalidate trước cleanup; dọn audio/actor/item/animation/listener/timer; callback cũ không capture/complete hoặc sửa tiền/items phiên mới | 04,05,06,07,08 |
| T05-AC20 | Reload trước/sau capture, lúc hậu quả tiền, animation, say và COMPLETE | Về IDLE, reset fixture 10 xu và cooldown, chờ Start; không được gọi là save/hoàn tiền production. Không nhân hậu quả hoặc audio mồ côi; retirement/khóa theo lifetime đã chốt | 06,08 |
| T05-AC21 | 20 vòng complete/cancel/re-entry; WebGL/Canvas/AUTO fallback | Max live Game ≤1; resources gồm audio/scarf/pumpkin về 0 sau teardown; không orphan/error; geometry/timer thống nhất | 02,03,04,07 |
| T05-AC22 | Xem/nghe hai nguồn bị bắt và lần tỉnh dậy đầu tiên; fixture mặc định 10 xu / case 0 xu | Cùng mạch truyện: hết tiền, khăn piêu, bí cầm tay; không giải thích nguồn gốc hoặc tự hoàn tất clue. Kiểm số dư dương→0 và 0→0; không chỉ khởi đầu 0 rồi claim mất tiền. Không còn nhánh mâm giúp thoát, không mở toàn hệ kinh tế | 01,06,07,08 |
| T05-AC23 | Production build/query/guard và các entry cũ | Không lọt code/debug/asset/audio Task 05; không legacy; exception DEV cụ thể không đổi audio/semantics entry đã QA hoặc nới guard toàn cục | 02,04,07 |
| T05-AC24 | Bàn giao candidate | Đúng base/SHA/diff/config v0.5 và approval record A01; nguyên 44+28 baseline; suite Task 05 và count riêng; build/typecheck/CI/artifact/hash/manifest/24 AC mapping; QA PENDING, F12 waiver | tất cả |

## 9. Ma trận test đề nghị — 30 nhóm, NOT RUN

Giữ N01–N30 để truy vết nhưng thay coverage nhánh mâm bằng lời gọi gần HeeSun, tiền và đồ vật. Đây không phải 30 test đã code; số thực thi/parameterization phải khóa riêng. Không cộng vào 72 để báo PASS.

| ID | Kịch bản | AC |
|---|---|---|
| T05-N01 | E2E UI thật hai nguồn: reveal/manga → MOVE/contact hoặc PHÀ ƠI gần HeeSun → capture → audio → tỉnh dậy hết tiền, có khăn và bí cầm tay → đứng → say 5s → normal MOVE; không inject capture | 01,04–15,22 |
| T05-N02 | Handoff duplicate/stale/paused/cancelled; pending resume/cancel | 02,08,19 |
| T05-N03 | Config/spawn/body/balance/asset sai; retry không fallback | 03,12 |
| T05-N04 | Pointer analog 25/50/75/100%, trục/chéo/secondary/cancel; PHÀ ƠI không lẫn MOVE | 04 |
| T05-N05 | Tốc độ HeeSun khi Player idle/slow/full; expected lấy từ input/config/delta | 05 |
| T05-N06 | Pursuit đi vòng obstacle; Player đổi phía; path hợp lệ | 06 |
| T05-N07 | Góc/cạnh bounds và obstacle; contact→tangent→away; ổn định số học | 06,14 |
| T05-N08 | Hai actor ngược chiều/cắt nhau, endpoints tách; delta 1000ms | 07,18 |
| T05-N09 | Body contact vừa đủ, near-miss, aura overlap, khác phía obstacle; không gọi thì chỉ gần không tự capture | 07,15 |
| T05-N10 | Static clipping/waypoint trước contact động; không dùng vector chưa clip | 06–08,18 |
| T05-N11 | Contact và PHÀ ƠI có hiệu lực cùng frame; callback lặp; tối đa một capture/cause/audio/hậu quả, không bắt lại | 08,09,15,18 |
| T05-N12 | Fixture 10→0 và 0→0; snapshot trước/sau; commit/retry lặp không trừ thêm hoặc âm; cờ đã bị bắt đi nhậu đúng mốc sau đứng; cả hai nguồn cùng hậu quả | 08,09,22 |
| T05-N13 | Hold/fade quanh mốc; pause alpha/active time | 10,16,18 |
| T05-N14 | Black audio3giây, hash/decoded duration đúng §13; load/play/end/denied; không ảnh bàn hoặc nút Tiếp tục; double-tap | 11,17 |
| T05-N15 | Audio retry/late ended/pause-resume/cancel; không phát chồng hoặc trừ tiền lặp | 11,16,19 |
| T05-N16 | Wake assets/marker lỗi hoặc chậm; khăn hiện, bí cầm tay; anchor/layer qua đứng, idle và MOVE; đủ animation non-loop, không chỉ snapshot | 09,12,14,22 |
| T05-N17 | Timer 4999/5000ms; control-ready muộn, pause tại gate, actor idle, animation/audio dài; không đếm hai lần | 12–14,18 |
| T05-N18 | Đảo vector MOVE với raw pointer, trục/chéo/collision; hết say trả normal MOVE | 14 |
| T05-N19 | PHÀ ƠI ngay trong/tại/ngoài ngưỡng 96 WU theo điểm chân, có/không vật cản giữa hai actor; phase/paused/stale/locked; có hiệu lực → capture chung; không có mâm giúp thoát hoặc complete khi chưa tỉnh dậy | 07–09,15,22 |
| T05-N20 | Manual/hidden/pagehide mọi phase và hai thứ tự gỡ; audio resume bị chặn | 16 |
| T05-N21 | Resize/letterbox/portrait; actor/camera/near-range/hand attachment/blackout | 17 |
| T05-N22 | Delta 0/1000/âm/non-finite/>1000 và sai số; không nới geometry | 18 |
| T05-N23 | Cancel/route exit từng phase; late audio/animation/contact/call/tiền/items; không sửa phiên mới | 19 |
| T05-N24 | Immediate re-entry/restart; stale input/run/session; không cấp đồ trùng | 19 |
| T05-N25 | Reload quanh capture/commit tiền/wake/COMPLETE/cooldown → IDLE, fixture 10 xu, reset khóa, chờ Start; không claim persistence production | 20 |
| T05-N26 | 20 vòng mixed finish/cancel/route exit; owned resources kể cả item/audio về 0 | 21 |
| T05-N27 | WebGL/Canvas/AUTO fallback; E2E cả hai nguồn cùng logic; console errors | 21 |
| T05-N28 | Production exclusion, không legacy hoặc mở toàn hệ kinh tế; baseline hashes/config/counts/artifact mapping | 22–24 |
| T05-N29 | RNG fixture TRUE NOTHING/chuỗi toàn TRUE NOTHING: không capture/tiền/items do CALL; chase tiếp tục, body contact vẫn bắt; capture thật vẫn tỉnh dậy/say/recovery, không đợi RNG thành công | 08,09,13–15,22 |
| T05-N30 | Khóa 60s active trước/đúng/sau mốc; từ accepted call kể cả TRUE NOTHING; spam/hold/đổi phase/resize không reset/gia hạn; pause/hidden dừng, reload DEV reset; input bị từ chối không quay RNG; cooldown không miễn body capture | 15–20 |

### Oracle và evidence

- Đường thành công dùng UI pointer/call thật, native Phaser update và actor rendered; synthetic chỉ cho case biên có nhãn, không thay E2E bằng nút capture hoặc jump phase.
- Contact oracle độc lập solver, dựng quỹ đạo sau clipping/waypoint và kiểm cả no-contact. Lời gọi có oracle khoảng cách/RNG đầu vào riêng; không dùng capture flag làm expected hoặc nới geometry.
- TRUE NOTHING không bảo vệ Player: tách test không body contact để chứng minh call không gây bắt, và test có body contact để chứng minh bắt độc lập; ghi đúng cause.
- Timer oracle dùng delta riêng và native trace; ghi stand_up_complete/control_ready/drunk_started. Không lấy wall-clock sleep làm expected active time. Cooldown dùng clock policy riêng đã duyệt.
- Evidence gồm seq/session/run/captureId/cause, raw input/outcome/cooldown, hai quỹ đạo/contact TOI/near-distance, alpha/audio/frame/active elapsed, balanceBefore/After/commitCount, khăn/bí và hand attachment quan sát được, callback/resource counters, ảnh/trace/video E2E. Fixture/proxy không chứng minh wallet production hoặc art cuối.
- Retry/double callback/stale/cancel phải kiểm cả tiền và items, không nhân đôi hậu quả. Giữ snapshot disposed đủ lâu để kiểm cleanup sau route-exit, không chỉ kiểm URL.

## 10. Giữ 44 + 28 và cấu trúc triển khai/CI

| Bộ kiểm | Số baseline giữ nguyên | Cách dùng |
|---|---:|---|
| Foundation / Reveal / Manga / Flow | 16 /7 /5 /16 = **44** | Giữ file/assertion và cách chạy `test:pl00`; hồi quy upstream, không dùng để PASS chase |
| World MOVE Task 04 | **28** =25 browser +3 controller | Giữ `test:world`, nguyên test/AC/config; có đủ regression QA-04-001/N18; không đổi count thành Task 05 |
| Task 05 | Chưa khóa số test thực thi; **30 nhóm đề nghị** | Suite/config/report riêng; failed/skipped/retry/flaky riêng. Không cộng nhóm đề nghị vào72 để báo PASS |

Các điểm đã đọc trong code cần xử lý đúng, không nới assertion:

1. `world-move.spec.mjs` N01 kiểm diff source từ c45 chỉ cho `src/game/phieng-loi/world/**` và entry page. Đề nghị đặt downstream world/encounter Task 05 tại `world/hs01/**`, đúng trách nhiệm world; giữ nguyên 28test. Nếu thiết kế cần sửa `flow/`, `reveal/`, foundation hoặc miền khác, phải báo xung đột này để duyệt trước, không né kiểm bằng đổi tên/chuyển code sai trách nhiệm, sửa test hoặc chạy test trên checkout cũ rồi gọi là candidate PASS.
2. `scripts/verify-pl00-foundation.mjs` chỉ cho các extension cũ có HeeSun và chỉ PNG manga. Task 05 cần một extension guard **cụ thể** cho module/asset DEV được duyệt; giữ rule no legacy, strict types, no extra RAF, no physics và production exclusion. Audio chỉ được mở qua exception cụ thể cho DEV Task 05, không bật toàn cục. Không xóa hoặc nới blanket regex/boundary để cho mọi code qua. Đây là cập nhật guard phạm vi mới, không sửa72test.
3. `playwright.config.mjs` hiện quét `tests/phieng-loi` trừ hai fileworld. Đặt test Task 05 ở thư mục riêng (ví dụ `tests/phieng-loi-hs01`) với config/testDir mới để 44/28 không vô tình ăn thêm test; không bỏ count-check trong report Task 04.
4. Workflow Verify hiện chỉ có `test:pl00` + `test:world`, timeout job15phút; run baseline mất khoảng12phút. Đề nghị **jobTask 05 riêng** và artifact riêng, giữ hai suite cũ nguyên job; cả hai job bắt buộc success. Thêm nhánh task mới vào push whitelist sau khi được phép code; không để tưởng push đã chạy suite mới khi workflow chưa gọi nó.
5. Manifest Task 05 phải có base=ce02cf3…, head/tree/GITHUB_SHA/runId, configId/revision, SHA25672test baseline, số test Task 05 thực tế và từng result, 24AC mapping theo revision v0.5, approval record A01 và D01–D08, asset paths/hash/frame/anchor và trạng thái đã đối chiếu, mode wallet/fixture và hậu quả tiền/khăn/bí, retries/skips/flaky/errors, browser/renderer, proxy/real-asset mode và F12. Ghi QA_PENDING đến khi QA độc lập kết luận; không tái dùng artifact candidate cũ.

**Phạm vi file đề nghị:** thêm `world/hs01/**`, test/config/report Task 05/docs mới; thêm entry DEV ở `PhiengLoiV2Page.tsx`; bổ sung port opt-in tối thiểu trong `WorldController.ts` nếu cần, giữ defaultbehavior; package scripts và CI/extension guard tương ứng. `world/config.ts` APPROVED/validator, `collision.ts` contactfix, reveal/manga/PresentationFlow,72test và18AC Task 04 không sửa. Không dùng `public/` để phát tán asset thử nghiệm trong production; asset mới cần cùng gate DEV/bundling rõ ràng.

**Gate audio mới:** nếu clip không thể tích hợp qua owner DEV riêng mà cần sửa foundation vốn noAudio, phải nêu thay đổi tối thiểu và xin chốt scope exception trước code. Không coi yêu cầu audio là quyền tự bật audio các entry cũ, sửa72test hoặc bỏ verifier. Vẫn giữ Task 04 đã đóng.



## 11. Điều kiện triển khai và handoff

1. Production cập nhật revision nguồn: bỏ nhánh mâm giúp thoát; PHÀ ƠI gần HeeSun vào cùng tuyến bị bắt đi nhậu; thêm balance=0 và visual khăn/bí cầm tay. Không mở lại Task 04 hoặc tự sửa upstream đã QA.
2. Áp dụng nguyên gói A01 đã APPROVED ở §7. Lập mapping bốn nhóm asset đã có (tệp/hash/clip/frame/fps/anchor/layer) và hoàn tất những chi tiết kỹ thuật còn lại của sân/body/oracle/owner audio DEV. Chỉ trình lựa chọn chưa được duyệt hoặc xung đột thực tế; không hỏi lại tốc độ, 96 WU, clock 60s, timing, đảo MOVE, fixture/reload hoặc sự tồn tại của asset.
3. Khi cấu hình triển khai và asset mapping đủ cụ thể, Production triển khai theo quyền đã được cấp trong phiên Project; nếu chưa có quyền code thì bàn giao cấu hình để nhận chỉ thị. Nhánh riêng từ ce02cf3…; làm hai nguồn bắt vào cùng tuyến đầu-cuối. Không tự thêm economy/Book/save/downstream.
4. Giữ 72 baseline và 18 AC Task 04; test Task 05 riêng, oracle độc lập, CI đúng SHA, manifest/hash/AC mapping/trace/video. Không báo PASS từ tài liệu hoặc 72 test cũ.
5. QA độc lập sau triển khai; merge và phát hành vẫn là bước riêng chưa được yêu cầu.

**Tình trạng thiết kế v0.5:** gói A01 APPROVED; nội dung v0.4 giữ nguyên; bốn nhóm asset AVAILABLE_BY_OWNER; tệp nguồn và WAV3giây đã được xác minh kỹ thuật ở §13, runtime mapping chưa hoàn tất. Chỉ những phần ngoài gói còn chưa chốt giữ trạng thái đề xuất theo §7. Runtime NOT RUN; chưa QA hoặc PASS gameplay.

## 12. Nguồn và giới hạn lượt sửa

- Đầu vào v0.5: bản hiện hành `Task05_HS01_Chase_Capture_Recovery_Scope_AC_v0.4(1).md`, gói cấu hình đề xuất trong cuộc trao đổi và xác nhận đồng ý/có asset của chủ dự án ngày 29/09/2026. Nguồn nội dung v0.4 kế thừa yêu cầu sửa v0.3 được trích tại §0.
- Các quyết định v0.3 còn hiệu lực: sau capture không chase lại; 5000ms active sau đứng dậy/control-ready; TRUE NOTHING 20% / khóa 60s. Phần “tại mâm để HeeSun vào bàn” bị yêu cầu mới thay thế.
- Baseline và kiểm kê runtime §3/CI §10 kế thừa hồ sơ v0.1–v0.3, không phải tuyên bố đọc lại repo trong lượt này. Task 04 có verdict INTEGRATED / POST_MERGE_QA_PASS tại ce02cf3…; F12 waiver.
- PL-HS-01v0.7, Biblev0.5 và flow Task03 là các nguồn narrative cần Production đồng bộ bằng design delta trước code, không sửa ngược hồ sơ nghiệm thu. Sự tồn tại của bốn nhóm asset đã được chủ dự án xác nhận; xác minh tệp/clip được bổ sung ở §13. Mapping và kiểm chứng runtime là bước khác, chưa thực hiện.

V0.5 ghi nhận phê duyệt cấu hình và asset do chủ dự án xác nhận; chưa tạo runtime hoặc chạy gameplay. **24 AC và 30 nhóm test đều NOT RUN.**


## 13. Tiếp nhận asset và clip blackout 3 giây — 29/09/2026

**Chỉ thị bổ sung:** “Đã có animation Player đứng dậy, khăn piêu và bí cầm tay, clip blackout cắt từ file âm thanh ra 3s.” Giữ nguyên gói cấu hình `T05-DEV-HS01-CFG-A01`, 24 AC và 30 nhóm test; đây là mapping nguồn và chuẩn bị asset, không phải QA runtime.

| Asset | Tệp / thông tin đã kiểm | Trạng thái |
|---|---|---|
| Âm thanh gốc | `freesound_community-bar-chatter-5979.mp3`; 7.451.040 bytes; MP3 stereo 24.000 Hz; duration metadata 372,552 giây | Đọc/giải mã được; giữ nguyên tệp gốc |
| Blackout | `Task05_Blackout_3s.wav`; đoạn nguồn **00:00.000–00:03.000**, PCM16 stereo24.000 Hz; **72.000 sample frames = 3,000 giây** | Đã tạo và kiểm duration/sample count; không normalize, đổi gain, thêm fade hoặc loop |
| Player đứng dậy | `sprite-max-px-frames-25-rows-5-cols-5 stand.png`; 1.790.341 bytes; **1395×2048 px RGBA**; quan sát 25 hình bố trí5hàng×5cột, từ ngả/ngồi đến đứng | Đã đọc ảnh và kiểm hash; không chỉnh lại hình |
| Khăn piêu / bí cầm tay | Có trong cùng PNG: khăn trên vai/quanh cổ, quả bí được giữ bằng tay xuyên chuỗi hình quan sát | Đã nhận diện trực quan trong sheet; không yêu cầu thêm tệp riêng cho hai vật này |

**SHA-256:**

- MP3 nguồn: `71935f01b1fed1c9378065879194a944c88e7ccebad65d1f5c7ffff792c17f87`.
- WAV3giây: `09209c63a4d9cf16adb5bd8f3cde50d635c4a27530210dc5fabe96c9f72080b4`.
- PNG: `9be0bcdd0c76741bd60e674e2473b57b034269003488457c25365c162d07c089`.

**Các điểm còn phải map khi tích hợp:**

- Thứ tự frame dự kiến đọc trái→phải, trên→dưới; fps, frame rectangles, origin và điểm chân phải được ghi cụ thể và kiểm chạy. Chiều cao2048 không chia hết cho5: không lấy tên tệp làm bằng chứng đã có lưới ô nguyên bằng nhau, cũng không tự resize/chỉnh hình để vừa lưới. Cần mapping rect/atlas từ ảnh thực.
- Khăn/bí đã nằm trong hình Player; không tự thêm overlay trùng. Chưa kiểm attachment/origin qua animation, idle và MOVE trong Phaser. Không coi việc nhìn thấy25 hình là animation đã PASS.
- Lấy **0–3giây đầu** là lựa chọn cắt cho lần bàn giao này; yêu cầu chủ dự án đã khóa độ dài3giây, không chỉ định timecode. Chưa kiểm cảm nhận âm lượng/nội dung qua playback hoặc mix runtime. Việc giữ gain nguồn không tự phê duyệt mức gain của game.
- BLACK_AUDIO phát hết clip3giây đúng phiên rồi mới xét recovery-ready; pause/hidden dừng playback. Không dùng một timer3giây để giả audio-ended. Thời gian tải/chờ ready/pause có thể khiến màn đen dài hơn3giây; không được trừ vào5000ms say sau đứng dậy/control-ready.
- Kiểm tiếp AC11/N14–N15 bằng playback/load/error/pause/resume thật và AC12/14/17/N16/N21 bằng actor rendered. Chưa có kết quả runtime hoặc CI trong lượt chuẩn bị asset này.

**Không đổi:** baseline `ce02cf3a21ab088a80e13417f3ff3d3b7c8545ac`, Task04 đã đóng, 44+28test nền, F12 `ACCEPTED_WITH_OWNER_WAIVER`; không mở rộng kinh tế/Book/save hoặc triển khai gameplay trong lượt này.
