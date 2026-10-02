# Đề xuất riêng: nhân vật 2D isometric cho bản chơi thử hình ảnh

Trạng thái: PROPOSED, chưa duyệt sản xuất hoặc thay asset. Không phải lỗi AC của Task06. Task05 giữ INTEGRATED / POST_MERGE_QA_PASS (DEV); F12 ACCEPTED_WITH_OWNER_WAIVER.

## Kiểm kê tại baseline 4c711bbc7909add7f7d34a7062f12df7bdc7a3ac

|Có trong repository/runtime mới|Sử dụng hiện tại|Giới hạn|
|---|---|---|
|25 PNG reveal HeeSun và ba lớp aura, có import-manifest SHA-256|Reveal Task01|Không phải bộ idle/chạy theo hướng; không suy diễn thành chase sprites.|
|Ba PNG manga có provenance|Manga tự bấm Task02|Không phải sprite actor.|
|player-stand.png 1395×2048; frames.json ánh xạ 25 frame không chia lưới đều; SHA-256 9be0bcdd0c76741bd60e674e2473b57b034269003488457c25365c162d07c089|Đứng dậy non-loop 15 fps, scale 0.3; khăn piêu và bí có sẵn trong hình; giữ frame cuối khi MOVE|Chưa có animation đi bộ/say theo hướng; không thêm overlay khăn/bí.|
|blackout.wav và fade Task05|Blackout/audio native-ended|Không có ảnh mâm nhậu toàn màn hình.|
|Player footprint và HeeSun circle/label|Actor DEV trong chase|Marker là scope đã công bố, không ghi thành defect AC.|

Rà file và tham chiếu trong repository này chưa tìm thấy bộ Player/HeeSun idle/walk đa hướng sẵn dùng trong runtime mới. Asset ở hồ sơ ngoài repository, nếu có, cần nhận diện file/hash/quyền sử dụng và duyệt riêng; không nhập runtime legacy.

## Phạm vi hình ảnh tối thiểu đề nghị duyệt

- Player trước capture: một pose idle và loop MOVE theo các hướng được chủ dự án chọn; nhận diện nhất quán với manga.
- HeeSun: idle và chase loop theo cùng hệ hướng, khớp nhận diện reveal. Contact có thể dùng pose dừng đã duyệt, không tự thêm timing capture.
- Player sau tỉnh dậy: idle/MOVE có khăn piêu và bí cầm tay, nối chân/frame cuối stand hiện có; hình ảnh say cần duyệt riêng, không đổi đảo MOVE 5 giây active.
- Không bao gồm map làng, mâm nhậu, kinh tế, OCOP, save/Book hoặc thay A01/collider.

OPEN cần chốt trước làm asset: mẫu nhân vật; số hướng (đề nghị bốn hướng chéo isometric cho đợt nhỏ); có được lật trái/phải khi cầm bí hay phải vẽ riêng; kích thước hiển thị; số frame/fps của từng loop; pose capture; dùng animation say riêng hay loop MOVE hiện có. Các giá trị trong đề xuất này chưa là cấu hình được duyệt.

## Điểm tích hợp và kiểm thử về sau

Chỉ thay lớp hiển thị actor của EncounterScene: vị trí từ model, footpoint giữ theo collider hiện có; chọn hướng từ chuyển động thực tế, không dùng sprite để tính collision. Phải tách sprite/animation với đồng hồ và transaction capture. Không thay WorldController/MOVE đã nghiệm thu chỉ để vừa art.

Asset package cần PNG/atlas, ánh xạ frame, thứ tự, origin/footpoint, fps, hướng, hash/provenance. Kiểm chân không nhảy tại idle/MOVE/stand, khăn/bí không biến mất, không overlay trùng, depth/occlusion, pause/resize/cleanup, production exclusion. QA hình ảnh riêng sau khi chủ dự án duyệt mẫu, không dùng 44+28+46 test cũ làm PASS art mới.

## Mâm nhậu

Bible v0.5 §§8/11/18 được đối chiếu ở scope.md: bỏ ảnh mâm nhậu HS01 để tránh lộ Clue1. Preview hiện giữ blackout/audio/fade theo Task05 v0.5/A01. Ý định ảnh mâm nhậu toàn màn hình + fade vẫn là khoảng cách hình ảnh cần quyết định riêng; không giải quyết bằng art tự chọn trong đợt sửa điều khiển.
