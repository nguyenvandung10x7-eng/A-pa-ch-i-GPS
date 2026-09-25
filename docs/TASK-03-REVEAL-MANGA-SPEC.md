# PL-HS-01 — Đặc tả nối flow và acceptance criteria

**Phiên bản:** 0.2 · **Ngày:** 25/09/2026  
**Trạng thái:** D01 APPROVED — Task 03 nối reveal → manga độc lập trong dev được phép triển khai; toàn HS-01 vẫn chưa READY.  
**Baseline:** `remake/phieng-loi-v2` tại `c7cfe2f796c7f6f15af8915e5b858eecaca92647`.  
**Task 02:** PASS / INTEGRATED. **Flow HS-01 tổng thể:** chưa được triển khai/kiểm thử, chưa READY.  
**F12:** `ACCEPTED_WITH_OWNER_WAIVER`, không ghi PASS.

## 0. Cập nhật được chủ dự án duyệt — Task 03

Phần này ghi nhận yêu cầu mới nhất ngày 25/09/2026 và có ưu tiên đối với phạm vi Task 03. Các mục 1–10 bên dưới giữ hồ sơ thiết kế toàn HS-01; những dòng “chưa cho phép code”, D01 còn mở hoặc D10 retry còn chờ không còn áp dụng cho đúng phạm vi được khóa tại đây. Các quyết định downstream khác vẫn mở; không mở rộng phạm vi dựa trên AC toàn block.

**Baseline:** `c7cfe2f796c7f6f15af8915e5b858eecaca92647`. **Nhánh task:** `task/pl-hs-03-reveal-manga`. **Dev entry:** `/phieng-loi?dev=hs-flow`.

### 0.1. Scope đã khóa trước khi code

- Tái sử dụng nguyên reveal Task 01 và MangaViewer Task 02; chỉ thêm coordinator, dev harness và test tích hợp cần thiết.
- State trong phạm vi: `IDLE → REVEAL → MANGA → HANDOFF`. `CANCELLED`, `ERROR`, `DISPOSED` là trạng thái gián đoạn, không phải thành công.
- `reveal_complete` phải đúng flow session và reveal run đang chờ, cleanup reveal đã xong. Chỉ sau đó mở manga trang 1.
- Manga: ba trang gốc, tự bấm trước/sau, không autoplay/ép thời gian đọc. Chỉ trang cuối tải thành công, không pause và chủ động hoàn tất mới phát completion.
- `manga_complete` phải đúng flow session và manga run đang chờ, DOM viewer đã dọn. Phát đúng một `chase_requested`, rồi giữ state HANDOFF. Không tạo NPC chase, không ghi HS-01 COMPLETE, không unlock Book.
- Global manual/hidden pause dừng presentation và chặn chuyển phase. Giữ nguyên frame/trang/alpha; resume không bù wall time. Completion hợp lệ đến ở ranh giới pause được giữ tối đa một lần và chỉ chuyển phase sau resume; cancel bỏ completion đang chờ.
- Dừng engine khi ở manga/HANDOFF là quyền giữ presentation của harness, không được biến thành `paused=true` khóa nút manga. Không có world thật trong harness này.
- Hủy toàn phiên dọn reveal/viewer, vô hiệu callback và không phát handoff. Re-entry tạo flow session mới, chạy reveal mới.
- **Retry ảnh đã chốt:** trong MANGA tạo manga run mới, từ trang 1, cùng flow session; không chạy lại reveal. Callback từ run trước phải bị bỏ. Không cần persistence/reload recovery trong task này.
- Voice giữ unbound và audio disabled. Không làm world/MOVE, trigger thật, chase/capture/recovery, save, Book replay hoặc nội dung mới. F12 giữ `ACCEPTED_WITH_OWNER_WAIVER`.
- Giữ production exclusion và nguyên 28 test baseline; test tích hợp thêm riêng. `SKIP ALL` không phải tính năng được triển khai.

### 0.2. Sự kiện và quyền sở hữu

Một phiên coordinator sở hữu event ledger và manual/hidden pause. Danh tính flow khác với run ID nội bộ của reveal/manga. Không chấp nhận callback chỉ vì run ID trùng khi đã thay phiên.

Ledger tối thiểu: flow start; reveal start; reveal cleanup/completion accepted; manga open với run/page; manga cleanup/completion accepted; chase_requested; pause/resume; retry; cancel/dispose; callback rejected và lý do. Event order phải quan sát được trong evidence. Chỉ instrumentation DEV được phép cung cấp thao tác bơm callback phục vụ QA; production không được chứa harness hoặc API debug này.

`HANDOFF` là điểm bàn giao kỹ thuật chưa có consumer gameplay. Không gọi nó là CHASE, HS-01 COMPLETE hay full-flow PASS. Đóng route/reload chỉ teardown runtime dev và tạo phiên mới khi mở lại, không mô phỏng save/recovery.

### 0.3. Acceptance criteria riêng Task 03

Trạng thái ban đầu của tất cả tiêu chí: **NOT RUN**. Kết quả thực thi báo trong gói QA theo SHA; không sửa những yêu cầu này để phù hợp kết quả test.

| ID | Given / When | Then — gate của Task 03 |
|---|---|---|
| T03-01 | Bắt đầu một phiên dev hợp lệ | Một reveal controller/root; chưa có manga hoặc handoff. 25 frame 12/15 fps theo contract Task 01 |
| T03-02 | Reveal đang chơi/finishing; sau đó hoàn tất thật | Không mở manga sớm. Ledger chứng minh reveal cleanup trước manga mount; đúng một lần mở trang 1 |
| T03-03 | Tự chuyển trước/sau qua ba trang; chờ không thao tác | Đúng thứ tự ảnh gốc; không autoplay hoặc timer đọc tối thiểu; không handoff ở trang 1/2 |
| T03-04 | Trang cuối đang loading/failed/paused, sau đó ready và bấm hoàn tất | Chỉ trường hợp ready + chủ động + không pause hoàn tất; cleanup DOM trước handoff |
| T03-05 | Double-click hoàn tất và phát lại callback | Một manga completion được nhận, một chase_requested, state HANDOFF; không chase/full COMPLETE/unlock |
| T03-06 | Global manual/hidden pause ở reveal, finishing hoặc manga; bỏ từng lý do theo hai thứ tự | Frame/alpha/trang được giữ; chỉ resume khi hết lý do; không nhân controller/viewer hoặc bù thời gian pause |
| T03-07 | Engine bị giữ trong manga nhưng global pause hết | Viewer vẫn điều hướng được; không deadlock do dùng sai pause owner |
| T03-08 | Callback hợp lệ đến ở ranh giới pause; resume hoặc cancel | Resume tiêu thụ tối đa một lần; cancel xóa pending, không tạo manga/handoff muộn |
| T03-09 | Callback trùng, sai run, sai session hoặc sai phase; callback sau cancel/dispose | Bị từ chối, có lý do trong ledger; không đổi phase/số handoff |
| T03-10 | Reveal callback đến nhưng cleanup chưa xong, hoặc manga DOM chưa dọn | Không chuyển phase; cleanup là gate thực chứ không chỉ dựa tên sự kiện |
| T03-11 | Ảnh trang 2 hoặc 3 lỗi; chọn retry | Cùng flow session, manga run mới, từ trang 1, reveal start count không tăng; run cũ không complete/handoff được |
| T03-12 | Hủy toàn phiên tại reveal/finishing/manga; re-entry | Hủy không complete; dọn root/UI/listener; re-entry tạo phiên mới và reveal mới |
| T03-13 | Unmount, route exit, unmount khi paused và immediate re-entry | Không callback muộn thay phiên mới, không Game/root/DOM mồ côi; dispose idempotent |
| T03-14 | Lặp mở/hủy/re-entry và replay hợp lệ nhiều lần | Mỗi phiên chỉ một handoff; live engine tối đa một; tài nguyên owned quay về baseline sau teardown |
| T03-15 | Touch, resize/orientation trong manga rồi hoàn tất | Giữ trang, contain cả ảnh, nút dùng được, một handoff; không coi emulation là F12 PASS |
| T03-16 | Production build và truy cập `?dev=hs-flow` | Không harness/debug API/flow coordinator/reveal/manga asset mới trong production; route vẫn là foundation |
| T03-17 | Chạy verify/typecheck/build + toàn suite | Nguyên 28 baseline test PASS và test tích hợp được báo riêng; không nới assertion, không thay kết quả CI bằng local |
| T03-18 | Kiểm tra source, ledger và thay đổi sau HANDOFF | Voice vẫn unbound; không world/trigger/MOVE/chase/capture/recovery/save/Book writes; F12 giữ waiver; các D khác chưa tự chốt |

### 0.4. Gate bàn giao

SHA mới, diff từ baseline, AC matrix T03-01…T03-18, kết quả từng test, evidence event order/cleanup/pause, link CI trên đúng SHA và artifact phải được chuyển QA độc lập. Không tự merge, phát hành hoặc làm downstream. Các test có callback injection phải được phân biệt với lượt reveal/manga chạy thật; không dùng injection để thay kiểm thử đường thành công.

## 1. Phạm vi và nguồn đối chiếu

Tài liệu mô tả hợp đồng nối trigger, reveal, manga, chase, capture, blackout và recovery; chuyển quy tắc manga đã chốt thành tiêu chí kiểm thử. Đây là phụ lục thiết kế mới, không ghi đè âm thầm các file nguồn và không cho phép bắt đầu code, merge hoặc phát hành.

Thứ tự áp dụng: yêu cầu mới nhất của chủ dự án → PL-HS-01 v0.7 cho chi tiết block → Gameplay Bible v0.5 cho quy tắc chung. Những đề xuất gắn mã `Dxx` dưới đây **chưa được chủ dự án chốt**. Acceptance criteria tương ứng chỉ trở thành gate thực thi sau khi quyết định đó được duyệt.

| Nguồn | Phần đã đọc/đối chiếu | Vai trò |
|---|---|---|
| `PL-HS-01_v0.7(2).md`, bản 22/09/2026 | Toàn bộ; trọng tâm §3–§15 | Flow, precondition, input, unlock, recovery và câu hỏi còn mở |
| `Phieng_Loi_Gameplay_Bible_v0.5(2).md` | §7.6–§11, §20 | Không mở clue sớm; HS-01 kết thúc blackout/recovery; replay read-only |
| Yêu cầu chủ dự án ngày 25/09/2026 và PR #158 | Manga lần đầu, Book, phạm vi tích hợp, F12 | Các quyết định mới nhất |
| Code tại baseline nêu trên | Reveal, manga, route, adapter, foundation scene, config và test manga | Phân biệt khả năng hiện có với yêu cầu phải xây |

GitHub đã được đối chiếu: nhánh tích hợp vẫn đúng baseline. Tree của baseline là `ee746fe1ee4db6a20b091278e95a797c3c279e4d`, trùng tree của source QA `718cb4f275f267c747aba8a8a3554fc2e44a7b23`. Các file đọc từ checkout source vì vậy có cùng nội dung với baseline tích hợp; các file foundation/config cũng được đọc trực tiếp theo SHA tích hợp.

**Không phục hồi canon cũ:** không có mâm nhậu, trưởng bản tại bàn nhậu, text xác nhận “đi nhậu”, drink ambience, ảnh nhậu hoặc drunk gameplay 5 giây trong HS-01. Recovery có khăn piêu + CURRENT_PUMPKIN, nhưng không giải thích nguồn gốc, không mọc tay/chân hoặc phát memory echo, không set `MEMORY_CLUE_01 = COMPLETE`.

## 2. Đã có gì và còn thiếu gì

| Hạng mục | Hiện trạng được xác minh ở baseline | Yêu cầu khi nối flow |
|---|---|---|
| Foundation | Phaser 1280×720; adapter quản lý mount/destroy, manual/hidden pause; production là foundation rỗng | Cần world/gameplay thật và chủ sở hữu flow; không coi canvas hiện hữu là map đã hoàn tất |
| Task 01 reveal | `HeeSunReveal`; 25 frame, non-loop, 12–15 fps, mặc định 15; ba lớp aura; `RibbonFront` tắt | Tái sử dụng hợp đồng, đặt đúng vị trí world/camera; không dựng lại animation |
| Kết thúc reveal | Animation complete → fade aura 0,2 s → cleanup → đúng một `{type:'reveal_complete', runId}` | Coordinator nhận callback sau cleanup; không thêm fade aura lần hai hoặc timer đo tổng thời lượng để mở manga |
| Hủy reveal | `cancel()` dọn hình/tween; `dispose()` giải phóng controller; không phát completion | Hủy không được mở manga; callback của phiên cũ phải bị loại |
| Voice reveal | `approvedAsset=null`, cue chưa duyệt, `status='unbound'`; runtime `noAudio:true`; 0,45 s chỉ là đề xuất trong source | Cần quyết định/asset và chủ sở hữu audio riêng; hiện chưa có voice chạy |
| Task 02 manga | React viewer, ba ảnh gốc 01→02→03; trước/sau; chỉ đóng hoàn tất ở ảnh cuối đã tải; mỗi lần mount bắt đầu trang 1 | Tái sử dụng presentation, nối vào coordinator; không coi mọi thao tác đóng là completion |
| Kết thúc manga | DOM viewer được gỡ rồi mới phát `{type:'manga_complete', runId}`; chống completion lặp | Chỉ completion hợp lệ của lần đọc trong encounter mới mở chase |
| Hủy/mở lại manga hiện tại | Unmount không complete; mở lại là run mới, từ trang 1; pause/hidden được quản lý trong dev harness | Cần chuyển quyền pause/visibility và điều khiển vòng đời sang caller tích hợp |
| Book replay | Chưa có mode Book, nút đóng ở mọi trang, unlock store hoặc liên kết Book trong module mới | Cần làm adapter/chế độ replay riêng; không dùng callback completion gameplay cho nút Đóng của Book |
| Trigger/MOVE/chase/contact | FoundationScene chưa có các hệ thống này; bảng asset AVAILABLE trong spec không chứng minh runtime mới đã có | Là dependency thật, cần scope và kiểm thử riêng; không tự nhập lại runtime legacy |
| Hold/fade/recovery/save | Chưa có controller hoặc store cho HS-01 | Cần hợp đồng checkpoint, vị trí, thời lượng và asset recovery |
| Production entry | Reveal/manga chỉ có dev harness, bị loại khỏi production build | Cần quyết định phạm vi bước nối và cách mở entry; không lấy hai harness ghép lại làm bằng chứng production |

Các gate cũ trong `docs/TASK-01-HS-REVEAL.md`, `docs/TASK-02-HS-MANGA.md` và source JSON là ghi chép lịch sử; không được dùng để hạ Task 02 từ PASS / INTEGRATED hoặc đổi F12 thành PASS. Trường flow trong pack/source JSON chỉ là tham chiếu; runtime Task 01 không diễn giải chúng.

## 3. Quy tắc manga đã chốt

| Mã | Quy tắc bắt buộc cho thiết kế |
|---|---|
| M01 | Lần đầu đọc theo thứ tự ba trang gốc, người chơi tự bấm chuyển trang; được quay lại trang trước. Không tự lật trang và không ép thời gian đọc tối thiểu. |
| M02 | Chỉ hoàn tất khi đang ở trang 3, ảnh đã tải thành công, viewer không pause và người chơi chủ động chọn hoàn tất. Chỉ nhìn thấy trang cuối chưa đủ. |
| M03 | Lần đầu không có đường bỏ qua toàn bộ manga. Đây là quy tắc thiết kế; **không báo `SKIP ALL` là tính năng đã triển khai**. Dòng “CẦN CHỐT” trong dev harness chưa được sửa trong lượt này. |
| M04 | Hủy, unmount, đóng tab, rời route hoặc lỗi ảnh không phải `manga_complete`; không làm bắt đầu chase hoặc mở khóa Book. |
| M05 | `MANGA_HEESUN_UNLOCKED` chỉ thành TRUE sau first capture hợp lệ; hoàn tất manga/reveal không mở khóa Book. |
| M06 | Khi replay trong Book, người chơi được đóng ở bất kỳ trang nào, kể cả đang tải hoặc lỗi ảnh. Đọc/đóng/hoàn tất replay không đổi gameplay/story state và không gọi chase. |
| M07 | Unlock không tự đồng nghĩa block đã COMPLETE. Capture → transition → recovery vẫn phải được xử lý; completion block chỉ xảy ra sau recovery hợp lệ. |

Vì M02–M04, mọi dòng “Manga đóng → chase” trong v0.7 phải được hiểu chính xác là **“manga_complete hợp lệ sau cleanup → chase”**. Không dùng biến `viewerVisible=false`, sự kiện Escape, unmount hay nút đóng Book để thay thế điều kiện này.

## 4. Chủ sở hữu và hợp đồng chuyển trạng thái

Một coordinator HS-01 sở hữu phase, khóa điều khiển, slot major event và ghi story state. Reveal và manga vẫn chỉ trình bày; chúng không tự unlock Book, spawn chase hoặc ghi save.

Mỗi phiên flow phải có danh tính riêng. `runId` hiện tại của reveal và manga chỉ có phạm vi controller/viewer, không phải ID toàn cục. Coordinator phải đối chiếu **phiên flow + phase đang chờ + run của component**, chỉ nhận callback một lần. Thay scene/route/controller phải vô hiệu hóa phiên cũ trước khi dọn tài nguyên.

Các tên state phía dưới là hợp đồng thiết kế. `MANGA_COMPLETE` là cách viết sự kiện ở mức flow, được ánh xạ từ callback `manga_complete`; không phải API mới đã có.

### 4.1. State và điều kiện vào/ra

| State | Điều kiện bắt đầu và việc phải làm | Điều kiện kết thúc / state kế tiếp |
|---|---|---|
| `WAITING` | Thế giới sẵn sàng; `WORLD_PHASE=PHIENG_LOI_OPENING`, `HEESUN_STAGE=UNMET`, `HEESUN_CHASE=AVAILABLE`, `PL_HS_01=NOT_STARTED`; không có major event khác | `enter_zone` hợp lệ, dependency đã sẵn sàng và giành được major slot → `REVEAL`. Nếu điều kiện sai, không ghi ACTIVE hoặc khóa input |
| `REVEAL` | Set ACTIVE, FIRST_ENCOUNTER_ACTIVE và slot PL_HS_01; khóa MOVE/PHÀ ƠI; dừng mô phỏng world; chỉ một reveal controller/root | 25 frame kết thúc → bước `finishing` nội bộ của Task 01; đây chưa phải lúc mở manga |
| `REVEAL` / `finishing` | Giữ khóa; để Task 01 fade aura 0,2 s và cleanup | Nhận đúng một `reveal_complete` của phiên hiện tại sau cleanup → `MANGA_FIRST_VIEW` |
| `MANGA_FIRST_VIEW` | Mở trang 1; world đứng yên; chỉ input của viewer/pause menu có hiệu lực | M02 thỏa mãn, viewer cleanup và callback hợp lệ → `CHASE`. Hủy/lỗi không chuyển sang CHASE |
| `CHASE` | Bật MOVE; PHÀ ƠI vẫn OFF; chỉ một HeeSun đuổi Player trên map hiện hành; speed target 2× Player | Contact hợp lệ giữa HeeSun/Player của phiên hiện tại → xử lý capture đúng một lần; không kết thúc chase bằng timer hết hạn |
| `CAPTURE_TRANSITION` / capture commit | Vô hiệu hóa pursuit/contact/input ngay; ghi trạng thái captured/resolving và unlock Book một lần. Chi tiết ghi bền vững theo D07 | Capture đã được ghi nhận hợp lệ → `HOLD`. Ghi save lỗi phải vào trạng thái xử lý lỗi, không giả vờ capture đã được lưu |
| `CAPTURE_TRANSITION` / `HOLD` | Giữ gameplay ở tư thế capture, MOVE/PHÀ ƠI OFF, đồng hồ active khoảng 0,5 s | Hết hold khi không pause → `FADE_TO_BLACK` |
| `CAPTURE_TRANSITION` / `FADE_TO_BLACK` | Fade hình về đen; không hiện hidden-night content | Fade complete theo timing D05 → `BLACK` |
| `CAPTURE_TRANSITION` / `BLACK` | Màn hình đen; chuẩn bị map/vị trí/visual recovery; không trả input | Recovery assets/world placement đã sẵn sàng và hết khoảng black tối thiểu D05 → `RECOVERY` |
| `RECOVERY` | Đặt Player tại marker được duyệt, gắn khăn piêu + CURRENT_PUMPKIN inert; kết thúc staging/fade-in theo D05–D06 | World/visual/input target sẵn sàng, ghi completion hợp lệ → `COMPLETE`; lỗi tải/ghi không được báo complete |
| `COMPLETE` | Set FIRST_ENCOUNTER_COMPLETE, RETIRED, PL_HS_01=COMPLETE; giữ unlock; release slot đúng một lần; bỏ khóa riêng HS-01 | Normal control có hiệu lực nếu không còn khóa/pause khác. Quay lại vùng không chạy lại HS-01 |

`HOLD`, `FADE_TO_BLACK`, `BLACK` là các bước con của `CAPTURE_TRANSITION`, không bắt buộc thêm ba story flag persistent. `SUSPENDED` và `ERROR` là trạng thái điều phối ngoài đường thành công; không được dùng chúng để bỏ qua phase.

### 4.2. Điều khiển và hai loại dừng khác nhau

| Phase/ngữ cảnh | MOVE | PHÀ ƠI | World | Presentation/UI |
|---|---|---|---|---|
| WAITING bình thường | ON | ON | Chạy | UI bình thường |
| REVEAL | OFF | OFF | Đứng yên | Reveal/tween vẫn chạy |
| MANGA_FIRST_VIEW | OFF | OFF | Đứng yên | Chuyển trang vẫn hoạt động |
| CHASE | ON | OFF | Chạy | Không để input manga rơi xuống điều khiển Player |
| CAPTURE_TRANSITION / RECOVERY | OFF | OFF | Directed, không điều khiển tự do | Hold/fade/staging chạy theo active time |
| Manual pause hoặc app hidden | OFF | OFF | Đứng yên | Animation/timer/fade dừng; manga không điều hướng/complete |
| COMPLETE | Theo khóa chung | Theo khóa chung | Theo pause chung | Không còn tài nguyên presentation HS-01 |
| Book replay | Theo shell Book, D09 | Theo shell Book, D09 | Chính sách D09 | Đóng luôn được phép; không ghi progression |

**Không dùng global pause để khóa world trong REVEAL:** nếu dừng cùng Phaser Game đang chạy reveal, animation sẽ không thể hoàn tất. Khóa MOVE/world và global manual/hidden pause phải có trách nhiệm tách biệt. Tương tự, world pause do manga đang mở không được truyền thẳng thành `paused=true` cho viewer: như vậy người chơi không thể bấm chuyển trang.

### 4.3. Pause, resume, đóng và mở lại

| Tình huống | Hành vi yêu cầu / đề xuất cần chốt |
|---|---|
| Manual pause | Giữ phase, frame/trang/vị trí/alpha và thời gian active đã chạy; không complete, capture hoặc ghi progression vì thao tác pause |
| App hidden, pagehide | Thêm lý do hidden độc lập. Bấm Resume khi vẫn hidden không được chạy; quay lại app vẫn giữ manual pause nếu chưa bỏ nó |
| Resume | Chỉ chạy khi mọi lý do global pause hết. Không bù toàn bộ thời gian tab đã ẩn; không tự tạo controller/viewer mới; không phát lại voice đã phát |
| Callback trùng ranh giới pause | Callback đã hợp lệ được xử lý một lần khi flow được phép chạy; không mất completion gây kẹt và không khởi động phase tiếp trong lúc pause |
| Đóng ở trang cuối lần đầu | Là hành động hoàn tất M02; gỡ viewer trước rồi mới cho coordinator chuyển CHASE |
| Đóng sớm/Escape/backdrop ở lần đầu | Không coi là hoàn tất. Đề xuất D10: không có nút đóng sớm; Escape mở pause menu, backdrop không làm gì; rời game dùng lối thoát chung |
| Hủy/unmount viewer trước hoàn tất | Gỡ listener/DOM, bỏ callback cũ; chase không chạy. Caller phải giữ/giải quyết phiên bị gián đoạn, không để world bị khóa mà không có UI |
| Mở lại manga trong cùng phiên sau lỗi | Đề xuất D10: tạo run mới, bắt đầu trang 1, giữ HS01_PHASE=MANGA và world pause; không chạy lại reveal; nếu vẫn lỗi, giữ đường thử lại/thoát rõ ràng |
| Rời route, reload, process bị đóng | Không tương đương resume tại chỗ. Hủy runtime/phiên cũ; phục hồi từ checkpoint theo D07–D08. Không lưu “ACTIVE” rồi bỏ mặc khi load |
| Sau capture rồi reload | Quy tắc đã khóa: không chạy lại first chase. Đề xuất D08: vào recovery từ màn đen bằng checkpoint capture, không phát lại reveal/manga/capture |
| Đóng Book ở trang bất kỳ | Chỉ đóng phiên đọc và dọn UI; không phát completion gameplay, không unlock thêm, không hồi sinh chase |
| Mở lại Book | Đề xuất D10: mở từ trang 1, run đọc mới; không giữ trang lần trước. Tách run đọc Book khỏi run HS-01 |

`Resume` chỉ bỏ lý do pause của chính caller. Đóng viewer/Book không được xóa manual pause, hidden pause hoặc khóa của hệ thống khác. Reset input đang giữ khi chuyển phase để tap hoàn tất hoặc joystick cũ không biến thành MOVE ngoài ý muốn.

## 5. Capture, checkpoint và Book

Hai mốc phải tách biệt:

| Mốc | Trạng thái đúng | Không được làm |
|---|---|---|
| First capture hợp lệ | MANGA_HEESUN_UNLOCKED=TRUE; HEESUN_CHASE=CAPTURED_OR_RESOLVING; HS-01 vẫn ACTIVE; có checkpoint đủ phục hồi recovery | Chưa set PL_HS_01=COMPLETE; không coi manga_complete là capture |
| Recovery hoàn tất | PLAYER_HAS_PIEU=TRUE; CURRENT_PUMPKIN_PRESENT=TRUE; MEMORY_ECHO=LATENT; HEESUN_STAGE=FIRST_ENCOUNTER_COMPLETE; CHASE=RETIRED; HS-01 COMPLETE | Không hoàn tất Clue 1, không summon alien, không hiện nguồn gốc khăn/bí |

Thiết kế save cần ghi các trường liên quan thành một snapshot nhất quán theo save slot; không để unlock đã lưu nhưng thông tin captured bị mất làm load lại chase. `MAJOR_EVENT_ACTIVE` và controller/runId là trạng thái runtime, không phải dữ liệu để khôi phục nguyên xi qua reload. D07–D08 quyết định nơi lưu, snapshot và chính sách phục hồi.

Book phải kiểm tra unlock bằng dữ liệu progression đã ghi nhận; không dựa vào số lần mở viewer hoặc completion counter. Khi replay, snapshot progression trước/sau phải bằng nhau. Tạm dừng/khôi phục hoạt động world do shell Book là quản lý UI, không được thay world position, event phase hoặc story flags.

## 6. Điểm còn thiếu quyết định — đề xuất để chủ dự án chốt

Các giá trị trong cột đề xuất **chưa phải cấu hình đã duyệt hoặc đã code**. Những yêu cầu đã khóa như 25 frame, speed 2×, capture bằng contact, unlock sau capture không được mở lại để chọn khác.

| Mã | Còn thiếu gì / vì sao ảnh hưởng flow | Đề xuất cụ thể | Gate bị ảnh hưởng |
|---|---|---|---|
| D01 | Scope bước nối tiếp theo; baseline chưa có world/MOVE/chase | Làm bước nối reveal→manga trong dev trước, dừng ở yêu cầu vào CHASE; sau đó task riêng cho world/MOVE/chase/capture/recovery/save. Stub chỉ kiểm tra hợp đồng, không tính PASS toàn HS-01. Nếu muốn làm toàn flow ngay, phải mở scope các dependency này rõ ràng | Phạm vi task và production entry |
| D02 | Map/version, tâm trigger, vị trí Player/HeeSun; đơn vị radius | Chọn marker `HS01_TRIGGER` trên map mới đã duyệt; trigger theo foot point trong world-space, radius=3× chiều cao chuẩn Player ở cùng depth, không theo frame reveal hoặc CSS resize. Cần bản map và marker thật; không đặt tọa độ giả trong đặc tả | Enter-zone, placement, kiểm thử resize/depth |
| D03 | Luật đường đi/vật cản/contact và xử lý khi kẹt | Pursuit liên tục trên vùng đi được của map, tốc độ 2× Player trong cùng đơn vị; contact theo collider chân/body được hiệu chỉnh từ asset, không theo aura. Không timer bắt ép, không teleport. Map phải có đường tiếp cận; nếu cần pathfinding hoặc fallback kẹt, duyệt trong task movement. Bán kính collider cần chốt qua placement thật | Chase/contact, tính khả thi của capture |
| D04 | Voice asset và cue; hiện audio tắt | Chủ dự án cung cấp/xác nhận clip “Ôi bạn ôi…”. Đề xuất cue tại 0,45 s active time từ reveal start, một lần/run; pause không phát lại. Giữ dev harness im lặng khi chưa có asset; chưa tuyên bố toàn block đạt tiêu chí voice hoặc tự bật audio runtime | Audio, asset readiness; không cản soạn spec |
| D05 | Timing sau capture; có sit-up không | Hold 500 ms; fade-out 500 ms; black tối thiểu 250 ms và chờ recovery ready; fade-in 500 ms. Lần nối đầu dùng pose recovery tĩnh, không sit-up; animation ngồi dậy chỉ thêm qua task asset riêng nếu được duyệt. Tất cả tính active time, không tính pause | Capture/blackout/recovery |
| D06 | Recovery marker, hướng đứng, world asset và visual scarf/pumpkin | Chọn một marker `HS01_RECOVERY` cố định, đi được, ngoài trigger và không chồng collider NPC; direction đặt trong marker theo góc nhìn được chủ dự án duyệt. Gắn khăn piêu + bí inert trước khi fade-in; không dùng placeholder để chấm art PASS | Recovery placement/visual |
| D07 | Save slot, nơi lưu, cơ chế ghi và báo lỗi | Dùng snapshot riêng theo save slot của game, lưu bền cục bộ ở giai đoạn đầu qua một persistence adapter; chưa thêm đồng bộ tài khoản/backend. Ghi checkpoint capture nhất quán trước khi đi tiếp, snapshot COMPLETE sau recovery. Nếu ghi lỗi: giữ trạng thái resolving, có Thử lại/Thoát, không chạy lại contact để tạo capture thứ hai. Cần duyệt lựa chọn lưu cục bộ và API save trước code | Unlock, crash/reload, completion |
| D08 | Reload/thoát trước capture, giữa fade hoặc recovery | Trước capture: trở về checkpoint an toàn trước encounter, reset phần HS-01 chưa commit; lần vào vùng sau chạy lại từ reveal. Sau capture: bỏ qua reveal/manga/chase, dựng recovery từ màn đen tại D06. Sau COMPLETE: chỉ khôi phục world/visual bình thường, không diễn lại recovery. Không quay lùi tiến trình không liên quan trong save | Reload, tránh nhân đôi, input lock |
| D09 | Mở Book khi major event đang ACTIVE; pause world khi đọc | Unlock ghi ngay ở capture, nhưng hoãn mở màn Book cho đến khi hết HS-01 staging/major slot. Khi mở Book từ gameplay bình thường, dừng simulation, đóng Book trả đúng trạng thái pause trước đó; không cho Book chen vào CHASE/RECOVERY | Book shell và quyền điều khiển |
| D10 | Hủy lần đọc đầu, retry lỗi ảnh, trang khi mở lại | Không có close sớm/skip; Escape→pause menu. Retry ảnh tạo manga run mới từ trang 1 trong cùng phase; không replay reveal. Thoát route theo D08. Book có nút Đóng ở mọi trang, mở lại từ trang 1 | Cancel/reopen/error UX |

### Dependency cần có bằng chứng, không chỉ quyết định bằng lời

Map + MOVE + HeeSun movement/collider, marker D02/D06, asset recovery và clip voice chưa được chứng minh là runtime/asset đã map trong foundation mới. Duyệt một đề xuất không tự làm các dependency này thành AVAILABLE/PASS.

Reveal độc lập đã có QA; còn phải kiểm tra placement/anchor/aura trong world thật. Đề xuất giữ 15 fps, ba aura hiện tại và RibbonFront OFF; không tái hiệu chỉnh ảnh hoặc bật RibbonFront trong task nối nếu không có yêu cầu và QA riêng. Music vẫn LATER, không tự thêm cue hay asset.

## 7. Acceptance criteria có thể kiểm thử

**Trạng thái của toàn bộ AC bên dưới: NOT RUN cho flow mới.** 28 test cũ là baseline regression, không chứng minh những AC tích hợp đã PASS. Cột “Điều kiện” ghi `Khóa` cho yêu cầu đã chốt; `Dxx` nghĩa là tiêu chí theo phương án đề xuất, chờ duyệt trước khi thực thi/chấm PASS.

### 7.1. Khởi động và thứ tự

| ID | Điều kiện | Given / When | Then — bằng chứng cần quan sát |
|---|---|---|---|
| AC-F01 | Khóa; D02 cho marker | Mọi precondition hợp lệ; Player đi từ ngoài vào vùng | Một flow session ACTIVE, một major slot, một reveal; không cần PHÀ ƠI |
| AC-F02 | Khóa | Lần lượt đặt sai từng precondition, hoặc major slot đã có chủ; đi vào vùng | Không reveal/manga/chase, không ghi ACTIVE/unlock, không khóa input của event khác |
| AC-F03 | Khóa; D02 | Phát enter-zone lặp trong ACTIVE và sau COMPLETE; ra/vào vùng nhiều lần | Tổng start của encounter chỉ một; sau COMPLETE không tạo first chase/recovery mới |
| AC-F04 | Khóa | Chạy một lượt thành công | Nhật ký thứ tự: reveal cleanup → manga mount → manga cleanup → chase → capture → hold → black → recovery → complete; không có phase đi tắt |
| AC-F05 | Khóa | Gửi lại callback reveal/manga/contact; gửi callback từ run/flow cũ sau remount | Không thêm phase transition, viewer, NPC, capture commit, unlock write hoặc completion |

### 7.2. Reveal và ranh giới với manga

| ID | Điều kiện | Given / When | Then — bằng chứng cần quan sát |
|---|---|---|---|
| AC-R01 | Khóa | Chạy reveal ở 12 và 15 fps | Đủ 25 frame được render đúng thứ tự, non-loop; tại animation-end/fade chưa cleanup thì manga chưa mở; sau callback sạch mở một viewer |
| AC-R02 | Khóa | Cancel/dispose reveal khi đang playing hoặc finishing | Root/aura/tween/listener do reveal sở hữu được dọn; không reveal_complete, không manga/chase |
| AC-R03 | Khóa | Pause reveal và pause trong fade aura; resize rồi resume | Giữ frame/alpha/layout; resume tiếp đúng lượt, không replay từ đầu, không hoàn tất sớm do thời gian pause |
| AC-R04 | Khóa | World bị khóa vì REVEAL nhưng global pause=false | Player/NPC world đứng yên, reveal vẫn tiến tới completion; không deadlock do pause cả engine |
| AC-R05 | D04 | Voice đã map; pause trước/sau cue và resume | Voice-only, tối đa một lần/run, không replay khi resume; cancel dọn âm thanh; không hiện thoại mới hoặc âm thanh nhậu |

### 7.3. Manga lần đầu

| ID | Điều kiện | Given / When | Then — bằng chứng cần quan sát |
|---|---|---|---|
| AC-M01 | Khóa | Mở lần đầu; bấm Next, Previous rồi Next | Trang 1→2→1→2 đúng ảnh gốc; Previous ở trang 1 vô hiệu; không có đường nhảy thẳng trang 3 |
| AC-M02 | Khóa | Ảnh đã tải; không bấm trong 30 s active, rồi bấm Next | Không tự chuyển trang; Next có hiệu lực ngay khi ảnh sẵn sàng, không chờ timer đọc |
| AC-M03 | Khóa | Đang ở trang 1/2; thử mọi đường close/skip/keyboard có thể dẫn hoàn tất | Không completion/chase/unlock; không nút SKIP ALL có chức năng bỏ qua lần đầu |
| AC-M04 | Khóa | Vào trang 3; lần lượt giữ loading, failed, paused và ready | Chỉ trạng thái ready cho hoàn tất; vào trang 3 tự nó chưa complete; chủ động hoàn tất tạo đúng một manga_complete |
| AC-M05 | Khóa | Double-click/tap nhanh Next/hoàn tất, gồm pointer lặp cùng lượt input | Một hành động không vượt hai trang; completion một lần, một chase; tap cuối không truyền xuống MOVE |
| AC-M06 | Khóa | World đang dừng vì manga, global pause=false | Next/Previous hoạt động; world position/timer gameplay không tiến; không nhầm world pause với viewer paused |
| AC-M07 | Khóa | Manual pause + hidden; bỏ từng lý do theo hai thứ tự | Viewer chỉ tiếp tục khi hết cả hai; trang giữ nguyên; không complete hoặc tự chạy CHASE trong pause |
| AC-M08 | Khóa | Unmount/route exit trước complete, kể cả ở trang cuối chưa bấm | Không manga_complete/chase/unlock; không còn DOM/listener cũ; callback cũ sau remount bị bỏ |
| AC-M09 | Khóa; D10 cho retry | Làm hỏng tải ảnh 2; chọn retry/mở lại | Báo lỗi rõ; không complete/chase. Theo D10: trang 1, run mới, vẫn ở MANGA, không replay reveal; tải lại thành công mới tiếp tục |
| AC-M10 | Khóa | Đọc bằng touch, đổi landscape/portrait tại từng trang rồi hoàn tất | Giữ đúng trang, toàn ảnh dùng contain, controls sử dụng được; một completion. Đây là emulation nếu chưa chạy thiết bị thật |

### 7.4. Chase, capture và recovery

| ID | Điều kiện | Given / When | Then — bằng chứng cần quan sát |
|---|---|---|---|
| AC-C01 | Khóa; D03 | Manga complete hợp lệ; đo displacement mỗi active update trên đường thẳng không vật cản | MOVE ON/PHÀ ƠI OFF; vận tốc cấu hình HeeSun=2× Player, kết quả trong sai số mô phỏng đã khai báo; không lấy CSS/sprite scale làm vận tốc |
| AC-C02 | Khóa; D03 | Chưa contact rồi tạo nhiều contact hợp lệ cùng frame | Trước contact không capture do timer; contact đầu tạo một capture, dừng pursuit/input; các contact sau không ghi lại |
| AC-C03 | Khóa; D03 | Aura chạm Player nhưng collider không chạm; sau đó collider thực sự chạm | Chỉ contact collider hợp lệ bắt được; không dùng hình tháp bia/aura làm hitbox |
| AC-C04 | Khóa; D07 | Hoàn tất reveal/manga nhưng chưa bị bắt; sau đó capture hợp lệ | Trước capture unlock=false; sau capture unlock=true đúng một lần, HS-01 vẫn resolving/ACTIVE, chưa COMPLETE |
| AC-C05 | Khóa; D05 | Capture; pause tại hold, fade-out và fade-in, sau đó resume | Trình tự giữ nguyên; theo D05: 500/500/min250/500 ms active, phần black có thể dài hơn khi chờ ready; sai số tối đa một bước mô phỏng/hiển thị được ghi trong evidence |
| AC-C06 | Khóa; D06 | Recovery world/visual chưa ready, rồi sẵn sàng | Chưa ready không hiện Player sai asset/vị trí và không trả control; ready có khăn piêu + bí inert tại marker đã duyệt |
| AC-C07 | Khóa | Kết thúc recovery một lần; gửi completion lặp; quay lại trigger | HS-01 COMPLETE, chase RETIRED, stage COMPLETE, slot release một lần; MOVE/PHÀ ƠI chỉ mở khi không còn khóa khác |
| AC-C08 | Khóa | Quan sát toàn flow và story snapshot trước/sau | Không hidden-night image/text/audio; không drunk 5s; không limb/echo/alien; MEMORY_CLUE_01 không bị hoàn tất |
| AC-C09 | D03 | Chạy QA trên đường đi và biên/vật cản thực tế của map được duyệt | Không kẹt vô hạn, xuyên vùng cấm hoặc teleport để giả capture; nếu chưa có cách xử lý đường đi đã duyệt, báo BLOCKED dependency |

### 7.5. Book replay

| ID | Điều kiện | Given / When | Then — bằng chứng cần quan sát |
|---|---|---|---|
| AC-B01 | Khóa | Save chưa capture; thử mở từ UI và direct replay entry; sau đó dùng save đã capture | Trước capture không đọc được qua bypass entry; sau capture đủ điều kiện unlock, không đòi completion manga mới hoặc tự set unlock |
| AC-B02 | Khóa | Book đã unlock; mở và đóng ở từng trang 1, 2, 3, khi loading/failed và khi manual pause | Đóng được, DOM được dọn; không manga_complete gameplay/chase/capture; không cần đi đến trang cuối |
| AC-B03 | Khóa | Chụp progression/phase/actor snapshot; đọc hết, đóng sớm, retry và mở lại Book | Story flags và phase/gameplay position không đổi; chỉ UI/session đọc và pause lease thay đổi |
| AC-B04 | D09–D10 | Đóng Book khi manual pause vẫn còn; mở lại; thử mở Book trong HS-01 ACTIVE | Không resume world khi vẫn manual pause; mở lại trang 1; Book bị hoãn trong ACTIVE nhưng unlock không bị thu hồi |

### 7.6. Gián đoạn, dữ liệu và dọn tài nguyên

| ID | Điều kiện | Given / When | Then — bằng chứng cần quan sát |
|---|---|---|---|
| AC-L01 | Khóa | Pause 10 s ở từng phase; resume | Không cộng 10 s vào hold/fade/chase/reveal; không đổi page/position do wall-clock catch-up, không phát lại callback/voice |
| AC-L02 | Khóa | Callback complete đến đúng lúc pause; resume, rồi gọi lại callback đó | Một transition sau resume, không mất event gây kẹt và không duplicate phase |
| AC-L03 | Khóa | 20 vòng mở/hủy/re-entry; route exit trong mỗi phase; remount ngay | Tài nguyên do flow sở hữu trở về baseline; tối đa một Game sống; không listener/root/timer/NPC/UI mồ côi; không callback muộn sửa phiên mới |
| AC-L04 | D07–D08 | Reload trước capture tại REVEAL, MANGA, CHASE | Phục hồi pre-encounter checkpoint an toàn; chưa unlock/captured/complete; có thể tái kích hoạt từ đầu; không mất tiến trình ngoài HS-01 |
| AC-L05 | Khóa; D07–D08 cho cách phục hồi | Reload sau capture commit tại hold, fade, black và recovery | Giữ unlock/captured; không first chase/capture lần hai. Theo D08: chỉ recovery từ màn đen, cuối cùng COMPLETE và control hợp lệ |
| AC-L06 | Khóa; D07 | Save COMPLETE rồi reload và vào lại vùng | Không replay reveal/manga/chase/recovery; giữ khăn piêu/bí và Book unlock; không giữ major slot ảo |
| AC-L07 | D07 | Mô phỏng lỗi ghi trước/sau capture và trước COMPLETE, rồi retry | Không snapshot nửa vời, không unlock sai, không complete giả; retry cùng capture không tạo capture thứ hai; UI có đường thử lại/thoát |
| AC-L08 | Khóa | Trong ACTIVE thử kích major event khác; sau cleanup/complete thử lại | Không tranh major slot trong ACTIVE; chỉ release slot thuộc HS-01, không xóa chủ khác |

## 8. Kế hoạch kiểm thử và điều kiện nhận bàn giao bước triển khai

Tất cả case phải chạy trên SHA triển khai mới, ghi rõ `head_sha`, SHA thực checkout nếu CI dùng commit kết hợp tạm, môi trường và phạm vi thật/stub. Dùng quan sát frame/phase/callback từ runtime hoặc điểm instrumentation được giới hạn cho QA; không thêm timer ngủ tùy ý để khiến test PASS.

Evidence tối thiểu: nhật ký thứ tự phase và nguyên nhân chuyển, flow/session/component run ID, số callback/commit/unlock, số tài nguyên trước/sau, thời gian active, snapshot save trước/sau, ảnh hoặc video các ranh giới reveal→manga→chase và capture→recovery. Không thu token/thông tin tài khoản vào evidence.

| Nhóm bằng chứng | Điều kiện nhận |
|---|---|
| Baseline regression | Giữ 16 foundation + 7 reveal + 5 manga test và các assertion còn đúng; không nới ngưỡng để hợp thức hóa nối flow |
| Production exclusion hiện tại | Nếu chỉ nối trong dev, giữ nguyên. Nếu D01 duyệt mở production entry, phải sửa các test “production loại manga/reveal” theo mục tiêu mới và QA lại SHA mới; test dev-harness exclusion vẫn phải giữ |
| AC mới | Báo riêng PASS/FAIL/BLOCKED/NOT RUN theo ID; case phụ thuộc Dxx chưa duyệt không được ghi PASS hoặc bỏ khỏi report âm thầm |
| Typecheck/build/static checks | PASS trên SHA mới; nếu cần đổi manifest/ranh giới production, đưa vào scope trước khi sửa, không mượn `dev.attachScene` làm API production |
| CI | Link Verify đúng SHA và artifact chứa kết quả mới; 28/28 cũ không thay thế suite mới, không ấn định tổng test mới bằng 28 |
| Thiết bị | F12 vẫn `ACCEPTED_WITH_OWNER_WAIVER`; touch emulation không chuyển thành Android/iPhone thật PASS |
| Full HS-01 | Cần gameplay/map/asset/persistence thật và AC liên quan PASS; completion giả bằng nút test chỉ chứng minh hợp đồng coordinator |

Không chạy lại suite cũ trong lượt soạn đặc tả này vì không đổi code. Không có acceptance criterion mới nào được chấm PASS trong tài liệu này.

## 9. Đề xuất thứ tự công việc sau khi được duyệt

1. Chốt D01; nếu chọn nối phần trình bày trước, khóa scope reveal→manga và các AC liên quan, cùng API yêu cầu CHASE. Chưa tạo chase giả rồi báo block hoàn tất.
2. Chốt D02–D03/D06 và xác minh dependency world/MOVE/HeeSun/visual. Chốt D04 cho voice hoặc giữ trạng thái chưa đủ audio cho full block.
3. Chốt D05/D07–D10; cập nhật canonical spec và acceptance criteria theo lựa chọn chủ dự án trước task tương ứng.
4. Triển khai từng task được giao, QA riêng trên SHA mới; chỉ nối toàn block khi dependency đã được chấp nhận.

Lượt hiện tại chỉ tạo tài liệu này. Không sửa repo, tạo branch/commit/PR, nối flow, thay asset, merge vào main hoặc phát hành. Không sửa các nguồn v0.7/v0.5 trước khi chủ dự án chọn những phương án còn mở.

## 10. Liên kết bằng chứng và code tham chiếu

- [PR #158 — Task 02 đã tích hợp](https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/pull/158)
- [Baseline commit c7cfe2f](https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/commit/c7cfe2f796c7f6f15af8915e5b858eecaca92647)
- [Verify baseline #36093483228](https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/actions/runs/36093483228): bằng chứng cũ 28/28, không phải kiểm thử flow mới.
- [HeeSunReveal.ts](https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c7cfe2f796c7f6f15af8915e5b858eecaca92647/src/game/phieng-loi/reveal/HeeSunReveal.ts)
- [Reveal config](https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c7cfe2f796c7f6f15af8915e5b858eecaca92647/src/game/phieng-loi/reveal/config.ts)
- [MangaViewer.tsx](https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c7cfe2f796c7f6f15af8915e5b858eecaca92647/src/game/phieng-loi/manga/MangaViewer.tsx)
- [MangaHarness.tsx](https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c7cfe2f796c7f6f15af8915e5b858eecaca92647/src/game/phieng-loi/manga/MangaHarness.tsx)
- [mountPhaser.ts](https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c7cfe2f796c7f6f15af8915e5b858eecaca92647/src/game/phieng-loi/mountPhaser.ts)
- [FoundationScene.ts](https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c7cfe2f796c7f6f15af8915e5b858eecaca92647/src/game/phieng-loi/scenes/FoundationScene.ts)
- [PhiengLoiV2Page.tsx](https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c7cfe2f796c7f6f15af8915e5b858eecaca92647/src/pages/PhiengLoiV2Page.tsx)
- [Manga regression tests](https://github.com/nguyenvandung10x7-eng/A-pa-ch-i-GPS/blob/c7cfe2f796c7f6f15af8915e5b858eecaca92647/tests/phieng-loi/manga.spec.mjs)
