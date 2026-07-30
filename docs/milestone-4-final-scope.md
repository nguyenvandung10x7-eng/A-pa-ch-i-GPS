# Milestone 4: Phạm vi chính thức

Tài liệu này ghi nhận phạm vi đã chốt cho Milestone 4.

- Hiện trạng dự án: những gì đã có trong mã nguồn.
- Thiết kế tương lai đã phê duyệt: hướng triển khai tiếp theo.
- Chưa triển khai: các hạng mục chưa có trong Milestone 4A.

## 1. Hiện trạng dự án

Hiện trạng dự án:

- Milestone 3 đã triển khai xác thực Supabase, gửi TikTok, bình chọn và kiểm duyệt an toàn.
- Điểm gameplay GPS, lịch sử và cấu hình nhiệm vụ hiện là dữ liệu của bản thử nghiệm cục bộ lưu trên trình duyệt.
- Điểm trong localStorage không bao giờ được dùng làm nguồn cấp cho nền kinh tế ảo tương lai.
- Nền kinh tế ảo chưa được triển khai.

## 2. Phạm vi bản thử nghiệm miễn phí

Thiết kế đã phê duyệt cho bản thử nghiệm miễn phí:

- Đơn vị vận hành hiển thị: Dự án A Pa Chải GPS.
- Email liên hệ: apachaigps@gmail.com.
- Tham gia là miễn phí và không yêu cầu mua sản phẩm.
- Điểm, Sao Lan Tỏa, vật liệu ngô và vật phẩm ảo không có giá trị tiền tệ hay giá trị thực tế ngoài đời.
- Không thể quy đổi thành tiền, sản phẩm, dịch vụ hoặc giải thưởng thật.
- Không giao dịch, chuyển nhượng, mua bán lại, đấu giá, NFT, blockchain hoặc phần thưởng phân bổ ngẫu nhiên trả phí.
- Nếu tương lai có cơ chế tham gia cần mua hàng hoặc thưởng hiện vật thì phải có vòng rà soát pháp lý mới.

Chưa triển khai trong Milestone 4A:

- Bất kỳ cơ chế mua hàng hoặc thưởng ngoài đời.

## 3. Độ tuổi, quyền riêng tư và an toàn

Thiết kế đã phê duyệt:

- Người dùng phải từ 16 tuổi trở lên để đăng nhập, gửi TikTok, bình chọn hoặc tham gia bảng xếp hạng công khai.
- Người dưới 16 tuổi chỉ được dùng tính năng thử thách cục bộ khi có cha mẹ hoặc người giám hộ giám sát và không được đăng nội dung.
- Cơ chế chấp thuận điều khoản theo phiên bản, báo cáo nội dung, yêu cầu xóa dữ liệu và rút khỏi xếp hạng công khai sẽ triển khai ở milestone quyền riêng tư riêng.
- Việc xử lý GPS phải tối giản.
- Thử thách chính thức không được khuyến khích đi vào khu vực cấm hoặc nguy hiểm, gây hại môi trường, hoặc làm ảnh hưởng cư dân và lực lượng biên giới.

Chưa triển khai trong Milestone 4A:

- Chấp thuận điều khoản theo phiên bản, báo cáo nội dung, yêu cầu xóa dữ liệu, rút xếp hạng công khai.

## 4. Thử thách GPS

Thiết kế đã phê duyệt:

- Bản phát hành chính thức đầu tiên dự kiến khoảng 10 thử thách A Pa Chải đã được rà soát.
- Mỗi thử thách có một mức điểm cố định.
- Không triển khai 3 mức điểm trong một thử thách.
- Tên thử thách cụ thể và giá trị thưởng cố định chưa chốt.
- Gán ngẫu nhiên có cơ chế tránh lặp trong một vòng chơi.
- Hoàn thành có thưởng chính thức trong tương lai phải được xác minh phía máy chủ.
- Gameplay localStorage hiện tại vẫn là bản thử nghiệm cục bộ, không có tính thẩm quyền.

Hiện trạng dự án:

- Hệ thống gán ngẫu nhiên và tránh lặp trong vòng chơi đã có ở mức cục bộ.

## 5. Điểm Thưởng và TikTok

Thiết kế đã phê duyệt:

- Điểm Thưởng trong tương lai phải dùng sổ cái giao dịch Supabase do máy chủ quản lý.
- Điểm gameplay cục bộ hiện có không được chuyển đổi trực tiếp thành Điểm Thưởng.
- Bài TikTok được duyệt dự kiến nhận 1 Sao Lan Tỏa và 100 Điểm Thưởng.
- Chỉ thưởng 1 lần cho mỗi người dùng, thử thách và mùa.
- Không thưởng cho việc chỉ gửi bài, bài bị từ chối hoặc lượt bình chọn.
- Sao Lan Tỏa không tiêu dùng được và không tính vào Top Phú Nông.

Chưa triển khai trong Milestone 4A:

- Toàn bộ cơ chế thưởng nêu trên.

## 6. Thu hoạch hạt ngô

Thiết kế đã phê duyệt:

- Một lần thu hoạch hạt ngô trong tương lai tốn 100 Điểm Thưởng.
- Một lần thu hoạch hạt ngô trong tương lai nhận 100 hạt ngô ảo với chất lượng do máy chủ phân bổ ngẫu nhiên.
- Tỷ lệ đề xuất: 75% thường, 20% trung cấp, 5% cao cấp.
- Tên “Organic” chỉ là tên tạm, phải thay trước khi phát hành công khai.
- Cơ chế bảo đảm may mắn:
  - Nếu 10 lần thu hoạch liên tiếp không có hạt ngô trung cấp hoặc cao cấp, lần thu hoạch kế tiếp bảo đảm ít nhất có hạt ngô trung cấp.
  - Nếu 40 lần thu hoạch liên tiếp không có hạt ngô cao cấp, lần thu hoạch kế tiếp bảo đảm có hạt ngô cao cấp.
- Tính ngẫu nhiên phải ở phía máy chủ, công bố rõ, thực hiện trong một giao dịch nguyên tử và có cơ chế chống thực hiện hoặc ghi nhận trùng.

Chưa triển khai trong Milestone 4A:

- Toàn bộ tính năng thu hoạch hạt ngô.

## 7. Bộ sưu tập ảo H’Mông Điện Biên

Thiết kế đã phê duyệt:

| Vật phẩm ảo | Số hạt cần | Giá trị tài sản cấp Mộc |
|---|---:|---:|
| Bánh Mèn Mén | 100 | 100 |
| Cuộn Sợi Lanh | 200 | 200 |
| Dao Đi Nương Rèn Thủ Công | 400 | 400 |
| Lu Cở Đan Tre | 800 | 800 |
| Tấm Vải Lanh Vẽ Sáp Ong | 1.500 | 1.500 |
| Khung Dệt Lanh | 2.500 | 2.500 |
| Khèn Mông Thủ Công | 3.500 | 3.500 |
| Bộ Trang Phục Mông Đỏ Điện Biên | 5.000 | 5.000 |

Ghi nhận bắt buộc:

- Cấp vật phẩm: Mộc, Tinh Xảo, Trân Quý.
- Nhãn dùng là Bộ sưu tập H’Mông Điện Biên, không gắn là vật phẩm truyền thống A Pa Chải.
- A Pa Chải và Sín Thầu gắn chủ yếu với cộng đồng Hà Nhì.
- Bộ sưu tập Hà Nhì A Pa Chải cần có ý kiến văn hóa bản địa riêng.
- Không dùng vật phẩm thiêng, nghi lễ hoặc nhạy cảm văn hóa nếu chưa rà soát phù hợp.

Chưa triển khai trong Milestone 4A:

- Bộ sưu tập ảo và cơ chế tài sản vật phẩm.

## 8. Chế tạo và gộp vật phẩm

Thiết kế đã phê duyệt:

- Chế tạo trong tương lai có thể phối trộn chất lượng hạt ngô.
- Chất lượng và tỷ lệ nguyên liệu ảnh hưởng xác suất cấp vật phẩm.
- Xác suất gốc đề xuất:

| Nguyên liệu | Mộc | Tinh Xảo | Trân Quý |
|---|---:|---:|---:|
| Hạt ngô thường | 80% | 18% | 2% |
| Hạt ngô cấp trung | 0% | 80% | 20% |
| Hạt ngô cao cấp | 0% | 0% | 100% |

- Giao diện phải hiển thị rõ tiêu hao nguyên liệu và xác suất kết quả trước khi xác nhận.
- Trừ nguyên liệu và tạo vật phẩm phải thực hiện trong một giao dịch nguyên tử.
- Gộp 3 vật phẩm Mộc cùng loại thành 1 vật phẩm Tinh Xảo.
- Gộp 3 vật phẩm Tinh Xảo cùng loại thành 1 vật phẩm Trân Quý.
- Nâng cấp cấp vật phẩm là bảo đảm; chỉ biến thể mỹ thuật mới được phân bổ ngẫu nhiên.

Chưa triển khai trong Milestone 4A:

- Toàn bộ chế tạo và gộp vật phẩm.

## 9. Top Phú Nông

Thiết kế đã phê duyệt:

- Đây là bảng xếp hạng hư cấu tùy chọn, không phản ánh tài sản hay vị thế xã hội thật.
- Chỉ tính giá trị tài sản hiện tại của kho đồ.
- Không tính Sao Lan Tỏa, lượt bình chọn, Điểm Thưởng chưa dùng và điểm gameplay cục bộ.
- Tách biệt hoàn toàn với bảng xếp hạng TikTok.
- Tham gia công khai theo cơ chế tham gia tự nguyện, cho phép dùng bí danh và cho phép rút khỏi bảng xếp hạng mà không mất kho đồ.

Chưa triển khai trong Milestone 4A:

- Top Phú Nông.

## 10. Trình tự triển khai

Thứ tự triển khai đã chốt:

1. Hoàn tất Milestone 4A về nội dung pháp lý và xóa dữ liệu cục bộ.
2. Triển khai chấp thuận điều khoản theo phiên bản, tự khai báo độ tuổi, tối giản hồ sơ công khai, báo cáo nội dung và yêu cầu xóa dữ liệu trong một milestone quyền riêng tư riêng.
3. Thay nhiệm vụ mẫu bằng bộ nhiệm vụ A Pa Chải đã được rà soát.
4. Thiết lập kiểm thử tự động cơ sở và CI trước khi triển khai hệ thống điểm hoặc giao dịch vật phẩm.
5. Triển khai kết quả hoàn thành thử thách do máy chủ quản lý, kèm kiểm thử.
6. Triển khai sổ cái Điểm Thưởng, kèm kiểm thử giao dịch, chống ghi nhận trùng và kiểm soát quyền.
7. Tích hợp thưởng cho bài TikTok đã được duyệt, kèm kiểm thử chống cấp thưởng trùng.
8. Triển khai thu hoạch hạt ngô, kèm kiểm thử tỷ lệ, cơ chế bảo đảm may mắn và giao dịch nguyên tử.
9. Triển khai kho đồ, chế tạo và gộp vật phẩm, kèm kiểm thử tính toàn vẹn dữ liệu.
10. Triển khai Top Phú Nông tự nguyện và tách biệt với bảng xếp hạng TikTok.
11. Hoàn thiện kiểm thử tổng thể, tối ưu bản dựng, cập nhật README và chuẩn bị phát hành bản thử nghiệm.

Mỗi milestone chức năng từ bước 5 trở đi phải bổ sung kiểm thử tương ứng; không để toàn bộ hoạt động kiểm thử đến cuối dự án.

## 11. Quyết định còn mở

Các quyết định còn mở:

- Tên cụ thể và giá trị thưởng cố định của các thử thách A Pa Chải chính thức.
- Tên cuối cùng thay cho “Organic”.
- Nội dung bộ sưu tập Hà Nhì A Pa Chải.
- Hình ảnh thiết kế chính thức và biến thể mỹ thuật của vật phẩm.
- Số lượt hoàn thành thử thách cần thiết để đạt Bộ Trang Phục.

## 12. Nội dung loại trừ

Các hạng mục loại trừ rõ ràng:

- 3 mức điểm trong một thử thách.
- Mua điểm.
- Quy đổi tài sản ảo thành tiền hoặc thưởng thật.
- Chuyển nhượng, mua bán lại hoặc đấu giá vật phẩm.
- NFT hoặc blockchain.
- Hộp phân bổ ngẫu nhiên trả phí.
- Thưởng điểm cho lượt bình chọn.
