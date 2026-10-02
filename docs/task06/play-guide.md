# Chơi thử Task06 (PREVIEW, chưa phải bản phát hành)

Mở URL branch deploy được đối chiếu với preview-version.json, thêm /phieng-loi. Không dùng ?dev hoặc console. Xoay ngang điện thoại.

1. Bấm **Bắt đầu** để mở âm thanh và reveal. Nút không bắt đầu thêm phiên khi bấm lặp.
2. Manga có ba trang: **Khung tiếp**, **Khung trước**. Đọc bao lâu tùy ý; chỉ trang cuối có nút hoàn tất. Nếu ảnh lỗi, **Tải lại manga từ trang 1** giữ phiên và không chạy reveal lại.
3. Kéo joystick MOVE ở góc trái dưới. Khi HeeSun đến gần, có thể bấm **PHÀ ƠI**; A01 vẫn có TRUE NOTHING 20% và cooldown60 giây active. Contact vẫn có thể bắt.
4. Bị bắt: hold/fade → clip blackout phát hết → tỉnh dậy, fixture tiền về0, khăn piêu/bí có trong sprite → đứng dậy → MOVE đảo hướng5 giây active → hồi phục, MOVE bình thường. HeeSun không đuổi lại trong lượt này.
5. **Tạm dừng/Tiếp tục** hoặc ẩn tab dừng clock/audio. **Chơi lại** chỉ sau hồi phục tạo phiên mới. **Thoát** hoặc reload hủy phiên; không lưu tiến trình, không hoàn tiền gameplay.

Các giới hạn hiển thị: sân thử/HeeSun/Player trước khi tỉnh dậy là marker DEV. Không có map làng hoặc ảnh mâm nhậu toàn màn hình. Blackout/fade/audio giữ đúng Task05/A01; fixture10→0 không phải hệ xu–đói. Chưa có Book/save/downstream.

## Kiểm thử deploy
- Kiểm metadata /preview-version.json khớp SHA/tree candidate, dirty=false.
- Kiểm route trực tiếp/refresh, ảnh và WAV trên HTTPS, Start bật audio.
- Chơi đầy đủ một lượt bằng nút, chụp intro/manga/chase/blackout/recovery, giữ log lỗi console và URL deploy bất biến.
- Đối chiếu CI44 baseline +28 Task04 +46 Task05 +12 Task06; không thay CI bằng kết quả local, không tự chấm QA PASS.
- Build thông thường `npm run build` luôn loại preview. Chỉ `npm run build:player-preview` dùng mode hs01-preview/outDir riêng; trên Netlify chỉ context branch-deploy và branch task/pl-hs-06-player-preview được phép.
