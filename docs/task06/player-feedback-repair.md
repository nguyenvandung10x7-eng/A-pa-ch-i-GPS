# Task06 — phản hồi chơi thử trên mobile

Trạng thái giữ BLOCKED_BY_PLAYER_PLAYTEST_FEEDBACK. Không tự chốt QA PASS.
Baseline 4c711bbc7909add7f7d34a7062f12df7bdc7a3ac, tree 8b2ebc76c1e9b298388f2db7919957c413b64029. Verify 36985784221 attempt 1, 44 + 28 + 46 + 12 là bằng chứng baseline, không dùng làm kết quả candidate sửa. Task05 giữ INTEGRATED / POST_MERGE_QA_PASS (DEV). F12 ACCEPTED_WITH_OWNER_WAIVER.

## Thông tin người chơi và giới hạn tái hiện

Người chơi chọn iPhone/iPad Safari, hướng ngang, không thấy nút. Chưa có model, phiên bản iOS/Safari và video của chính thiết bị. WebKit Linux với viewport/touch mobile không phải Safari trên máy iPhone thật. Không coi test mô phỏng là thay thế nghiệm thu lại của người chơi.

## Đo bản baseline trước sửa

Build sạch từ 4c711bb. Playwright WebKit Linux, input tap thật của browser, không đổi RNG, clock, spawn hoặc tốc độ. Đọc DOM phase bằng RAF và quay video liên tục từ manga đến recovery; ba lượt không thao tác trong CHASE:

|Viewport ngang|CHASE thấy trên DOM (wall ms)|CAPTURE_HOLD (wall ms)|Thời gian nút hiện|Hit test tâm PHÀ ƠI|
|---|---:|---:|---:|---|
|667×375|4111|5737|1626 ms|t05-call, trong viewport|
|844×390|3531|5169|1638 ms|t05-call, trong viewport|
|1024×768|3687|5298|1611 ms|t05-call, trong viewport|

Đây là thời điểm DOM/frame quan sát, có sai số refresh; không phải timestamp event capture trong model. Video/JSON gốc lưu riêng, không đổi nhãn thành bằng chứng bản sửa. Chưa tái hiện được nút nằm ngoài màn hình trên các viewport này. Đã tái hiện cửa sổ nhìn/thao tác rất ngắn: nút chỉ tồn tại trong CHASE rồi bị tháo khi capture; chưa có hướng dẫn ngay trước handoff. HUD cũ đặt ở bottom18% chồng vùng nút trên màn hình ngắn, joystick không có nhãn MOVE và Player chỉ là chấm nhỏ. Đây là vấn đề nhận biết; chưa chứng minh runtime bỏ chạm trên iPhone của chủ dự án.

Phép đo độc lập bằng model A01 gốc, Player đứng yên, update 60 Hz: vào phạm vi 96 WU tại 1466.667 ms; contact capture tại 1601.489588 ms active. Khoảng quan sát từ vào phạm vi đến contact ~134.823 ms (lượng tử update 16.667 ms). Không dùng mô phỏng này thay video/browser test.

## Phần sửa được phép trong đợt này

- Cảnh báo trong manga: đóng trang cuối bắt đầu đuổi ngay; chỉ vị trí MOVE/PHÀ ƠI và giới hạn lời gọi. Không thêm gate, countdown, auto-pause hoặc ép thời gian đọc.
- PHÀ ƠI vàng tương phản; HUD chuyển khỏi vùng nút. Hiện xác nhận đã nhận chạm và thời gian khóa, disable nút trong cooldown vốn đã có ở model. Không đổi hit box, handler, xác suất, cooldown hoặc near range.
- Nhãn MOVE/Player bám canvas FIT/letterbox và resize/visual viewport, pointer-events:none. Không tạo joystick khác, không đổi C01–C07 hoặc A01. Capture hiện thông báo nút đã đóng; không giả nút còn dùng được sau capture.
- Thuộc tính DOM chỉ đọc mô tả phase, vị trí, input, active ms, call/capture phục vụ đối chiếu video. Không có global force API, không sửa state từ route người chơi.
- 12 ca mobile mới tách khỏi 44+28+46+12 cũ: M01/P05 chạm PHÀ ƠI trusted và MOVE trong CHASE, M02/P07 đảo/normal MOVE, M03/P08/P11 resize/cancel gesture/pause nhiều owner. Bốn project: WebKit 667, 844, iPad1024; Chromium915. Không đổi assertion baseline.

WebKit Playwright hỗ trợ trusted tap nhưng không cung cấp native touch-drag nhiều bước: kiểm MOVE liên tục bằng native mouse hold, ghi rõ trong evidence. Chromium dùng native CDP touch hold. hidden/visible được mô phỏng bằng event/flag, là bằng chứng bổ sung; background app iOS thật vẫn OPEN. Ca M01 dùng RNG thật, không bảo đảm lần gọi sẽ gây capture; ca B02 Task05 tiếp tục chứng minh valid nearby call cause riêng bằng setup clock đã được QA duyệt, không giả đó là thành công tự chơi mobile.

M03 local đầu tiên thất bại vì setup trộn WebKit mouse hold và touchscreen.tap rồi mouse-up gây compatibility click thứ hai vào Pause/Resume. Giữ report/video cũ. Sửa setup bằng kích hoạt Pause qua Enter trong lúc đang giữ pointer, xác nhận data-paused=true; không sửa runtime hoặc nới kiểm active clock. Touch pause vẫn kiểm riêng ở M01.

## Quyết định về thời gian phản ứng — OPEN, chưa triển khai

Bản sửa chỉ giúp nhận biết; không hứa rằng cửa sổ gọi gần ~0.14 giây đã phù hợp thao tác người mới. Đề nghị chủ dự án chơi lại trước khi QA chốt gate. Nếu vẫn bị bắt trước khi định hướng, chọn riêng:

1. Giữ A01, thêm màn hướng dẫn/sẵn sàng trước CHASE: người chơi xác nhận mới bắt đầu. Không đổi tốc độ/range, nhưng thay handoff/timing flow nên cần phê duyệt và AC riêng; chưa code.
2. Điều chỉnh cấu hình preview riêng sau duyệt: ví dụ near 96 → 192 WU, giữ tốc độ, ước lượng cửa sổ gọi trước contact khoảng 0.34 giây trên đường tiến cuối; không kéo dài thời gian đứng yên bị bắt ~1.60 giây. Hoặc npcSpeed 480 → 320 WU/s, Player giữ240: ước lượng contact đứng yên ~2.40 giây; near96 vẫn chỉ khoảng0.2 giây. Đây là phương án tính thử, không phải cấu hình đã duyệt và cần đo lại sau quyết định.

Khuyến nghị xem xét phương án 1 nếu vấn đề là chưa nhận ra sân/nút khi đóng manga. Nếu mục tiêu là dễ gọi đúng lúc gần, cần quyết định range/tốc độ riêng; màn sẵn sàng không giải quyết cửa sổ near→contact ngắn.

## Ranh giới hình ảnh

Xem visual-preview-proposal.md và visual-assets-inventory.json. Marker DEV không bị ghi thành lỗi AC Task06. Chưa tạo/thay art hoặc nhập runtime legacy. Không thêm kinh tế/quán phở/OCOP/map làng/save/Book; không merge/main/phát hành.
