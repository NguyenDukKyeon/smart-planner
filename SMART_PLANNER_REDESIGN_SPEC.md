# ĐẶC TẢ THIẾT KẾ LẠI SMART PLANNER

## 1. Phạm vi thay đổi

Thiết kế lại các khu vực:

1. Lộ trình & Import/File mẫu.
2. Nhắc học.
3. Cài đặt.
4. Pomodoro Studio.
5. Cách bắt đầu phiên học từ thẻ bài học.

Giữ nguyên cấu trúc và phong cách chính của:

- Tab Hôm nay.
- Tab Tổng kết tuần.
- Tab Kế hoạch.

Chỉ điều chỉnh các thành phần trong ba tab này khi cần để tích hợp luồng Pomodoro mới. Không tái thiết kế toàn bộ dashboard.

---

# 2. Nguyên tắc tổng thể

- Một màn hình chỉ phục vụ một mục tiêu chính.
- Không trộn cài đặt kỹ thuật với thao tác dành cho người học.
- Không dùng dấu ba chấm `...` để chọn thời lượng học.
- Dấu ba chấm chỉ dành cho thao tác quản lý bài học.
- Mỗi thẻ bài học chỉ có một CTA chính.
- Thời lượng học được chọn bằng một control có biểu tượng đồng hồ hoặc nhãn thời lượng.
- Lộ trình mẫu lớp 11 và file mẫu import là hai khái niệm khác nhau.
- Không tự xin quyền thông báo.
- Không tự khởi động phiên mới sau giờ nghỉ nếu người dùng chưa bật tùy chọn đó.
- Mọi cài đặt thay đổi phải được lưu ngay, không cần nút “Lưu cài đặt” chung.

---

# 3. Thiết kế lại “Import / File mẫu”

## 3.1. Đổi tên khu vực

Không dùng tên:

`Import / File mẫu`

Đổi thành:

`Lộ trình & dữ liệu`

Nút này có thể đặt trong Cài đặt hoặc menu tài khoản, không cần chiếm vị trí nổi bật trên thanh điều hướng chính.

## 3.2. Cấu trúc màn hình

Màn hình gồm ba khu vực:

1. Lộ trình có sẵn.
2. Nhập lộ trình.
3. Sao lưu & xuất dữ liệu.

Trên desktop có thể dùng tab hoặc sidebar.

Trên mobile ưu tiên danh sách section hoặc accordion, không ép nhiều tab nhỏ vào một hàng.

---

## 3.3. Lộ trình có sẵn

Hiển thị một card nổi bật:

### Lộ trình mẫu lớp 11

Nội dung:

- Toán 11.
- Vật lý 11.
- Hóa học 11.
- Có đầy đủ môn, chương/chủ đề và bài học.
- Có thể chỉnh sửa sau khi áp dụng.

CTA chính:

`Dùng lộ trình mẫu lớp 11`

CTA phụ:

`Xem trước lộ trình`

Có thể thêm khu vực tải toàn bộ lộ trình:

`Tải lộ trình: Excel | CSV | JSON`

Ba file này chứa toàn bộ dữ liệu lớp 11 KNTT và phải tương đương về nội dung.

Khi người dùng bấm “Dùng lộ trình mẫu lớp 11”:

1. Kiểm tra dữ liệu hiện tại.
2. Tạo snapshot rollback.
3. Cho người dùng chọn:
   - Gộp với lộ trình hiện tại.
   - Thay thế lộ trình hiện tại.
4. Hiển thị rõ số môn và số bài bị ảnh hưởng.
5. Chỉ áp dụng sau khi xác nhận.

Nếu người dùng đang ở onboarding lần đầu và chưa có dữ liệu, có thể áp dụng trực tiếp mà không cần bước chọn Gộp/Thay thế.

---

## 3.4. Nhập lộ trình

Hiển thị vùng upload rõ ràng:

### Nhập lộ trình của bạn

`Kéo file vào đây hoặc chọn file từ máy`

Hỗ trợ:

- `.xlsx`
- `.csv`
- `.json`

Bên dưới:

### Chưa có file?

`Tải file mẫu đơn giản: Excel | CSV | JSON`

## 3.5. Yêu cầu đối với file mẫu import

File mẫu import Excel phải đơn giản giống file CSV và JSON.

Không sử dụng file Excel đầy đủ lớp 11 KNTT làm file mẫu import.

Ba file mẫu import phải:

- Có cùng schema.
- Có cùng dữ liệu minh họa.
- Chỉ chứa khoảng 3–5 bài học ví dụ.
- Không chứa toàn bộ chương trình lớp 11.
- Không sử dụng merged cell.
- Không có nhiều bảng phụ.
- Không yêu cầu định dạng trang trí phức tạp.

Schema đề xuất:

- `subject_id`
- `subject_name`
- `topic`
- `lesson_id`
- `lesson_name`
- `target_minutes`
- `planned_date`
- `xp_reward`

Trong Excel:

- Sheet `Du_lieu`: chứa bảng import.
- Sheet `Huong_dan`: chỉ giải thích ngắn ý nghĩa từng cột.

CSV và JSON phải dùng cùng tên trường và cùng các dòng ví dụ.

---

## 3.6. Preview trước khi import

Sau khi chọn file, chưa áp dụng ngay.

Hiển thị:

- Số môn tìm thấy.
- Số bài hợp lệ.
- Số dòng lỗi.
- Số ID bị trùng.
- Preview tối đa 10 bài đầu tiên.
- Danh sách lỗi kèm số dòng.

Cho chọn:

- `Gộp với lộ trình hiện tại`
- `Thay thế lộ trình hiện tại`

Mặc định chọn `Gộp`.

CTA phải mô tả đúng hành động:

- `Gộp 18 bài vào lộ trình`
- `Thay thế bằng 42 bài mới`

Không dùng CTA mơ hồ như “Áp dụng ngay”.

---

## 3.7. Sao lưu và xuất dữ liệu

Khu vực này chỉ chứa:

- Xuất lộ trình hiện tại.
- Sao lưu toàn bộ dữ liệu ứng dụng.
- Khôi phục từ file sao lưu.
- Hoàn tác lần khôi phục gần nhất.
- Đặt lại toàn bộ ứng dụng.

Không đặt nút “Dùng lộ trình mẫu lớp 11” trong khu vực xuất hoặc sao lưu.

---

# 4. Thiết kế lại “Nhắc học”

## 4.1. Mục tiêu

“Nhắc học” chỉ dùng để cấu hình:

- Khi nào nhắc.
- Nhắc về nội dung gì.
- Nhận thông báo bằng cách nào.

Không dùng màn hình này để hiển thị lại danh sách bài học hoặc thống kê đã có trong tab Hôm nay.

## 4.2. Tiêu đề

### Nhắc học

Mô tả:

`Chọn thời điểm ứng dụng nhắc bạn bắt đầu hoặc quay lại học.`

---

## 4.3. Trạng thái quyền thông báo

Nếu chưa được cấp quyền:

### Thông báo trình duyệt đang tắt

`Bật thông báo để nhận lời nhắc khi ứng dụng không mở.`

CTA:

`Bật thông báo trình duyệt`

Chỉ gọi `Notification.requestPermission()` sau khi người dùng bấm nút này.

Nếu đã bật:

`✓ Thiết bị này đang nhận thông báo`

Nếu bị từ chối:

`Thông báo đã bị chặn trong trình duyệt`

CTA:

`Xem hướng dẫn bật lại`

Không tự xin lại quyền.

---

## 4.4. Lịch nhắc

Hiển thị từng reminder dưới dạng một hàng:

### Kế hoạch buổi sáng

`Nhắc xem kế hoạch học trong ngày`

- Giờ: `07:00`
- Switch bật/tắt.

### Bắt đầu học buổi tối

`Nhắc bắt đầu bài học nếu hôm nay chưa có phiên học`

- Giờ: `19:30`
- Switch bật/tắt.

### Kiểm tra cuối ngày

`Nhắc xem lại tiến độ còn thiếu`

- Giờ: `22:00`
- Switch bật/tắt.

Thay đổi giờ và switch được lưu ngay.

---

## 4.5. Nhắc học thông minh

Có thể bổ sung các tùy chọn hữu ích:

- `Chỉ nhắc khi hôm nay chưa học`
- `Không nhắc khi đã hoàn thành mục tiêu ngày`
- `Nhắc lại sau 15 phút nếu bỏ qua`
- `Không làm phiền trong khoảng 22:30–06:30`

Các tùy chọn nâng cao đặt trong section thu gọn, không hiển thị toàn bộ mặc định.

---

## 4.6. Nhắc theo thói quen

Đặt trong section:

`Nhắc theo từng thói quen`

Mỗi hàng gồm:

- Tên thói quen.
- Giờ.
- Switch.

Không hiển thị trạng thái “đã làm/chưa làm hôm nay” trong màn hình cài đặt này.

---

## 4.7. Chẩn đoán kỹ thuật

Các thông tin:

- HTTPS.
- Service worker.
- VAPID.
- Subscription.
- Scheduler.
- QStash.

Không hiển thị mặc định cho người dùng.

Đặt trong khu vực thu gọn:

`Chẩn đoán thông báo`

Chỉ dùng khi cần kiểm tra lỗi.

---

# 5. Thiết kế lại Cài đặt

## 5.1. Cấu trúc điều hướng

Đổi tên màn hình thành:

`Cài đặt`

Không dùng tên lặp như “Cài đặt & Thiết lập”.

Cấu trúc đề xuất:

1. Pomodoro Studio.
2. Nhắc học.
3. Mục tiêu học tập.
4. Giao diện.
5. Lộ trình & dữ liệu.
6. Khu vực nguy hiểm.

Trên desktop:

- Sidebar bên trái.
- Nội dung bên phải.

Trên mobile:

- Danh sách menu.
- Bấm từng mục mở trang con hoặc bottom sheet.

Không dùng quá nhiều tab ngang nhỏ trên mobile.

---

## 5.2. Mục tiêu học tập

Giữ các thiết lập hiện tại nếu đã ổn:

- Mục tiêu thời gian mỗi ngày.
- Mục tiêu số ngày học trong tuần.
- Mục tiêu hoàn thành bài.
- Quỹ giờ mặc định.

Không trộn cài đặt Timer hoặc thông báo vào đây.

---

## 5.3. Giao diện

Có thể gồm:

- Sáng.
- Tối.
- Theo hệ thống.
- Mật độ giao diện: thoải mái/gọn.
- Hiển thị animation.
- Hiển thị Confetti.

Đây là phần tùy chọn, không phải ưu tiên triển khai đầu tiên.

---

## 5.4. Khu vực nguy hiểm

Đặt cuối màn hình:

### Khu vực nguy hiểm

- Đặt lại lộ trình.
- Xóa toàn bộ tiến độ.
- Đặt lại ứng dụng.
- Mở lại onboarding.

Mỗi thao tác phải:

- Giải thích dữ liệu bị ảnh hưởng.
- Tạo snapshot rollback.
- Có dialog xác nhận riêng.
- Không dùng `localStorage.clear()`.

---

# 6. Thiết kế Pomodoro Studio

## 6.1. Mục tiêu

Pomodoro Studio là nơi cấu hình cách phiên học:

- Bắt đầu.
- Chạy nền.
- Nghỉ.
- Kết thúc.
- Phát âm thanh.

Không dùng Pomodoro Studio như một màn hình Timer thứ hai.

## 6.2. Tiêu đề

### Pomodoro Studio

Mô tả:

`Thiết lập thời lượng, giờ nghỉ và cách Timer hoạt động.`

---

## 6.3. Các chế độ mặc định

Hiển thị bốn preset:

### Khởi động

`2 phút`

Không có giờ nghỉ tự động.

### Pomodoro

`25 phút học · 5 phút nghỉ`

### Deep Work

`50 phút học · 10 phút nghỉ`

### Siêu tập trung

`90 phút học · 15 phút nghỉ`

Đảm bảo toàn ứng dụng sử dụng thống nhất:

- 2
- 25/5
- 50/10
- 90/15

Không để Settings hiển thị 90/20 trong khi Timer chạy 90/15.

---

## 6.4. Phiên mặc định

Cho phép chọn:

### Thời lượng mặc định khi bấm “Học tiếp”

- 25 phút.
- 50 phút.
- 90 phút.

Mặc định: 25 phút.

Không nên cho chọn 2 phút làm thời lượng “Học tiếp”, vì 2 phút là luồng khởi động riêng.

---

## 6.5. Hành vi tự động

Các switch:

- `Tự bắt đầu khi chọn một thời lượng` — mặc định bật.
- `Tự bắt đầu giờ nghỉ sau phiên học` — mặc định tùy định hướng sản phẩm, khuyến nghị tắt.
- `Tự bắt đầu phiên mới sau giờ nghỉ` — mặc định tắt.
- `Hiện xác nhận trước khi dừng phiên` — mặc định bật.
- `Giữ Timer chạy khi chuyển tab` — mặc định bật.
- `Hiện mini Timer trên toàn ứng dụng` — mặc định bật.

Phân biệt rõ:

- Chuyển tab.
- Thu nhỏ Timer.
- Đóng giao diện Timer.
- Dừng phiên.

---

## 6.6. Âm thanh

Đặt toàn bộ âm thanh Timer tại Pomodoro Studio:

- Âm báo hết giờ học.
- Âm báo hết giờ nghỉ.
- Âm lượng.
- Nút thử âm học.
- Nút thử âm nghỉ.

Âm thanh nhắc học và âm thanh Timer là hai cài đặt khác nhau.

---

## 6.7. Chạy nền

Section:

### Timer chạy nền

Các tùy chọn:

- Hiện mini Timer khi đóng modal.
- Thông báo khi phiên kết thúc.
- Giữ Timer chính xác khi thiết bị sleep/chuyển tab.
- Hiển thị trạng thái đang học trong header.

Không tự xin quyền Notification khi bật setting. Nếu chưa có quyền, hiển thị liên kết đến màn hình Nhắc học.

---

## 6.8. Storage

Tách cài đặt Pomodoro khỏi trạng thái phiên đang chạy.

Dùng hai nhóm dữ liệu riêng:

### Active timer state

Chỉ chứa:

- Session ID.
- Lesson ID.
- Duration.
- Start time.
- End time.
- Pause state.
- Timer phase.

### Pomodoro preferences

Chứa:

- Default duration.
- Auto-start focus.
- Auto-start break.
- Auto-start after break.
- Sound settings.
- Mini Timer setting.
- Confirmation setting.

Không tạo Timer giả chỉ để lưu preferences.

---

# 7. Thiết kế lại thao tác trên thẻ bài học

Đây là phần cần thay đổi dù giữ nguyên tab Hôm nay.

## 7.1. Không dùng dấu ba chấm để chọn thời gian

Dấu ba chấm `...` chỉ chứa:

- Chỉnh sửa bài học.
- Đổi ngày.
- Lưu trữ.
- Xóa bài học.

Không chứa:

- 2 phút.
- 25 phút.
- 50 phút.
- 90 phút.

Lý do: dấu ba chấm biểu thị hành động quản lý, không phải hành động học chính.

---

## 7.2. Cấu trúc footer của thẻ bài

### Bài chưa từng bắt đầu

CTA chính:

`⚡ Khởi động 2 phút`

Bên cạnh là control thời lượng:

`🕒 Chọn phiên`

Khi bấm “Chọn phiên”, mở bottom sheet:

### Chọn phiên học

- Khởi động — 2 phút.
- Pomodoro — 25 phút.
- Deep Work — 50 phút.
- Siêu tập trung — 90 phút.
- Thời lượng tùy chỉnh.

Bấm một lựa chọn là bắt đầu ngay.

### Bài đã có tiến độ

CTA chính:

`▷ Học tiếp 25 phút`

Số `25 phút` lấy từ thời lượng mặc định trong Pomodoro Studio.

Bên cạnh:

`25 phút ▾`

Bấm vào nhãn thời lượng để chọn 50, 90 hoặc tùy chỉnh.

Ví dụ:

```text
[ ▷ Học tiếp ] [ 25 phút ▾ ] [...]
```

Hoặc trên mobile:

```text
[ ▷ Học tiếp 25 phút              ]
[ Chọn thời lượng ]          [...]
```

---

## 7.3. Luồng khởi động 2 phút

Khi bấm:

`⚡ Khởi động 2 phút`

Ứng dụng:

1. Mở Timer.
2. Tự chạy 2 phút.
3. Giữ nguyên bài học đang chọn.
4. Hết giờ ghi chính xác 2 phút.
5. Cộng thưởng đúng một lần.
6. Không bắt đầu giờ nghỉ.
7. Chuyển sang màn hình `WARMUP_COMPLETED`.

Màn hình chỉ hiển thị:

### Bạn đã bắt đầu được rồi

`Tiếp tục khi động lực đang còn.`

CTA:

- `🍅 Học tiếp 25 phút` — primary.
- `🧠 Deep Work 50 phút` — secondary.
- `✋ Dừng tại đây` — tertiary/link.

Không hiển thị thêm:

- Hộp tổng kết phiên chung.
- Giờ nghỉ.
- Nút đóng trùng lặp.
- Modal khác nằm phía sau.

---

## 7.4. Hành vi ba lựa chọn

### Học tiếp 25 phút

- Tạo session mới 25 phút.
- Giữ nguyên bài học.
- Tự chạy ngay.
- Không đóng Timer.
- Không quay lại Hôm nay.

### Deep Work 50 phút

- Tạo session mới 50 phút.
- Giữ nguyên bài học.
- Tự chạy ngay.
- Không bị hard-code về 25 phút.

### Dừng tại đây

- Giữ nguyên 2 phút vừa ghi.
- Giữ XP và Coin đã nhận.
- Kết thúc luồng.
- Đóng Timer.
- Quay về tab Hôm nay.
- Không tạo giờ nghỉ.

---

## 7.5. Quick Start trong Pomodoro Studio

Trong Pomodoro Studio có thể thêm:

### Khởi động nhanh

`Luôn đề xuất phiên 2 phút cho bài chưa bắt đầu`

Mặc định bật.

Nếu tắt:

- Bài chưa học dùng CTA theo thời lượng mặc định, ví dụ `Bắt đầu 25 phút`.
- Tùy chọn 2 phút vẫn tồn tại trong “Chọn phiên”.

Khuyến nghị giữ mặc định bật vì đây là điểm khác biệt chính của sản phẩm.

---

# 8. Những phần không nên thay đổi lớn

## Tab Hôm nay

Giữ:

- Cấu trúc tổng thể.
- Danh sách bài học.
- Quỹ giờ.
- Tiến độ ngày.
- Gamification compact.

Chỉ thay:

- CTA trên card.
- Control chọn thời lượng.
- Menu ba chấm.
- Luồng Timer sau khi bấm học.

## Tổng kết tuần

Giữ cấu trúc và biểu đồ hiện tại.

Chỉ đảm bảo dữ liệu Timer mới được ghi chính xác và không trùng session.

## Kế hoạch

Giữ layout hiện tại nếu đã đáp ứng nhu cầu.

Chỉ đảm bảo:

- Bài học và chủ đề được đồng bộ.
- Import mới không phá lịch.
- Gộp/Thay thế lộ trình cập nhật đúng dữ liệu.
- Lộ trình mẫu lớp 11 nạp đúng vào Kế hoạch.

---

# 9. Thứ tự triển khai

## Giai đoạn 1 — Logic nền

1. Tách Pomodoro preferences khỏi active Timer.
2. Chuẩn hóa preset 2, 25/5, 50/10 và 90/15.
3. Đảm bảo một Timer controller duy nhất.
4. Hoàn thiện state `WARMUP_COMPLETED`.

## Giai đoạn 2 — Thẻ bài và Timer UX

1. Tách chọn thời lượng khỏi menu ba chấm.
2. Thiết kế CTA theo trạng thái bài học.
3. Thêm bottom sheet chọn phiên.
4. Hoàn thiện luồng 2 → 25/50/dừng.

## Giai đoạn 3 — Settings

1. Thiết kế lại cấu trúc Cài đặt.
2. Tạo Pomodoro Studio.
3. Chuyển âm thanh Timer sang Pomodoro Studio.
4. Tách Nhắc học khỏi cài đặt Timer.

## Giai đoạn 4 — Import và dữ liệu

1. Tách lộ trình lớp 11 khỏi file mẫu import.
2. Tạo file mẫu Excel đơn giản giống CSV/JSON.
3. Thêm preview import.
4. Thêm Gộp/Thay thế.
5. Bảo đảm snapshot rollback.

## Giai đoạn 5 — Kiểm tra hồi quy

Kiểm tra:

- Desktop.
- Mobile 360, 390 và 430 px.
- Chuyển tab khi Timer chạy.
- Reload khi Timer chạy.
- Hoàn thành 2 phút.
- Chọn 25/50/90 phút.
- Import Excel/CSV/JSON.
- Gộp dữ liệu.
- Thay thế dữ liệu.
- Notification permission.
- Sao lưu và rollback.

---

# 10. Tiêu chí hoàn thành

Thiết kế được xem là hoàn thành khi:

- Người dùng hiểu rõ sự khác nhau giữa lộ trình lớp 11 và file mẫu import.
- File mẫu Excel đơn giản và tương đương CSV/JSON.
- Dấu ba chấm không còn dùng để chọn thời lượng học.
- Bài chưa bắt đầu có CTA “Khởi động 2 phút”.
- Bài đã bắt đầu có CTA “Học tiếp” theo thời lượng mặc định.
- Hết 2 phút chỉ hiện đúng ba lựa chọn 25/50/dừng.
- Pomodoro Studio quản lý toàn bộ hành vi Timer.
- Nhắc học không hiển thị thông tin kỹ thuật mặc định.
- Settings có cấu trúc rõ ràng, không trộn Timer, reset và thông báo.
- Ba tab Hôm nay, Tổng kết tuần và Kế hoạch không bị tái thiết kế ngoài phạm vi cần thiết.

---

# PHỤ LỤC: THIẾT KẾ LẠI “QUẢN LÝ MÔN & BÀI HỌC”

## 1. Vai trò của khu vực

“Quản lý môn & bài học” là nơi người dùng:

- Thêm, sửa, sắp xếp và lưu trữ môn học.
- Quản lý chương/chủ đề.
- Thêm, sửa, sắp xếp, lưu trữ hoặc xóa bài học.
- Kiểm tra nhanh tiến độ và thời lượng của từng môn.
- Điều chỉnh nội dung học sau khi dùng lộ trình mẫu hoặc import file.

Không sử dụng khu vực này để:

- Cài đặt Pomodoro.
- Import hoặc sao lưu toàn bộ dữ liệu.
- Xem thống kê tuần.
- Bắt đầu phiên học như một CTA chính.
- Chỉnh các thiết lập chung của ứng dụng.

---

## 2. Tên và vị trí truy cập

Tên hiển thị:

`Môn & bài học`

Tiêu đề màn hình:

### Quản lý môn & bài học

Mô tả:

`Tổ chức môn học, chủ đề và các bài trong lộ trình của bạn.`

Điểm truy cập chính:

- Nút `Quản lý môn & bài` trong header của tab Kế hoạch.
- Một mục trong menu ứng dụng trên mobile.
- Có thể thêm liên kết trong “Lộ trình & dữ liệu”, nhưng không gộp hai màn hình thành một.

Không đặt thành tab chính thứ tư bên cạnh:

- Hôm nay.
- Tổng kết tuần.
- Kế hoạch.

Ba tab chính hiện tại được giữ nguyên.

---

## 3. Không dùng modal nhỏ cho toàn bộ chức năng

Nếu số lượng môn và bài lớn, không nhét toàn bộ giao diện vào một modal hẹp.

Ưu tiên:

- Desktop: trang hoặc panel toàn màn hình.
- Tablet: trang toàn màn hình.
- Mobile: màn hình riêng với luồng đi sâu từ môn vào danh sách bài.

Dialog chỉ dùng cho:

- Thêm hoặc sửa một môn.
- Thêm hoặc sửa một bài.
- Xác nhận lưu trữ hoặc xóa.
- Chọn môn/chủ đề khi di chuyển bài.

---

## 4. Layout desktop

Sử dụng bố cục hai cột:

### Cột trái — Danh sách môn

Chiều rộng khoảng 260–300 px.

Bao gồm:

- Ô tìm kiếm môn.
- Nút `+ Thêm môn học`.
- Danh sách các môn.
- Bộ lọc `Đang học | Đã lưu trữ`.

### Cột phải — Chi tiết môn đang chọn

Bao gồm:

1. Header môn học.
2. Các chỉ số tổng quan.
3. Thanh tìm kiếm và bộ lọc bài học.
4. Danh sách chương/chủ đề và bài học.
5. CTA thêm bài.

Không reload hoặc đóng màn hình khi chuyển giữa các môn.

---

## 5. Layout mobile

Màn hình đầu tiên hiển thị danh sách môn.

Khi chọn môn:

- Mở màn hình chi tiết môn.
- Header có nút quay lại.
- Danh sách bài dùng card dọc.
- Bộ lọc đặt trong bottom sheet.
- Nút thêm bài có thể là floating action button hoặc CTA cố định cuối màn hình.

Không dùng bảng nhiều cột hoặc yêu cầu cuộn ngang.

---

## 6. Thẻ môn học

Mỗi môn hiển thị:

- Icon.
- Màu nhận diện.
- Tên môn.
- Số bài đang hoạt động.
- Số bài đã hoàn thành.
- Tổng thời lượng còn lại.
- Thanh tiến độ nhỏ.

Ví dụ:

```text
📐 Toán 11
12 / 34 bài hoàn thành
18 giờ 30 phút còn lại
[████████░░░░░░] 35%
```

Menu dấu ba chấm của môn chỉ chứa thao tác quản lý:

- Chỉnh sửa môn.
- Đổi icon và màu.
- Sắp xếp lại.
- Lưu trữ môn.
- Xóa môn.

Dấu ba chấm tại đây là phù hợp vì các hành động đều là thao tác quản lý.

---

## 7. Header chi tiết môn

Hiển thị:

- Icon và tên môn.
- Số chủ đề.
- Tổng số bài.
- Số bài hoàn thành.
- Tổng thời gian đã học.
- Tổng thời gian còn lại.
- Thanh tiến độ.

CTA:

- `+ Thêm bài học`
- `+ Thêm chủ đề`

Menu phụ:

- Sửa môn.
- Xuất riêng môn này.
- Lưu trữ môn.
- Xóa môn.

Không đặt nút bắt đầu Timer trong header môn.

---

## 8. Cấu trúc chủ đề và bài học

Nhóm bài theo:

`Môn học → Chủ đề/Chương → Bài học`

Ví dụ:

```text
Toán 11

▾ Chương 1: Hàm số lượng giác
   Bài 1. Góc lượng giác
   Bài 2. Giá trị lượng giác
   Bài 3. Công thức lượng giác

▸ Chương 2: Dãy số
```

Mỗi nhóm chủ đề có thể thu gọn hoặc mở rộng.

Header chủ đề hiển thị:

- Tên chủ đề.
- Số bài hoàn thành / tổng số bài.
- Tổng thời lượng còn lại.
- Menu quản lý chủ đề.

Menu chủ đề:

- Đổi tên.
- Thêm bài vào chủ đề.
- Di chuyển lên hoặc xuống.
- Lưu trữ.
- Xóa chủ đề.

Nếu xóa chủ đề đang chứa bài, phải yêu cầu người dùng chọn:

- Chuyển bài sang chủ đề khác.
- Chuyển bài sang “Chưa phân loại”.
- Xóa cả chủ đề và các bài bên trong.

Mặc định ưu tiên chuyển sang “Chưa phân loại”, không xóa hàng loạt.

---

## 9. Hiển thị một bài học

Trên desktop, mỗi hàng bài gồm:

- Tay nắm sắp xếp.
- Tên bài.
- Chủ đề.
- Tiến độ.
- Thời lượng mục tiêu.
- Ngày dự kiến.
- Trạng thái.
- Menu dấu ba chấm.

Ví dụ:

```text
☷  Bài 1. Góc lượng giác
   45 / 120 phút · 38%
   Dự kiến: 02/08
   Đang học                                      [...]
```

Trên mobile, hiển thị dạng card:

```text
Bài 1. Góc lượng giác

45 / 120 phút · 38%
Dự kiến: 02/08

[Chỉnh sửa]                                  [...]
```

Không đặt nhiều CTA học 2/25/50/90 phút trong màn hình quản lý này.

Bắt đầu học vẫn là hành động chính tại tab Hôm nay.

---

## 10. Menu dấu ba chấm của bài học

Menu chỉ chứa thao tác quản lý:

- Chỉnh sửa bài học.
- Đổi chủ đề.
- Chuyển sang môn khác.
- Đổi ngày dự kiến.
- Nhân bản bài học.
- Lưu trữ.
- Xóa bài học.

Không chứa:

- Khởi động 2 phút.
- Học 25 phút.
- Deep Work 50 phút.
- Học 90 phút.

Các lựa chọn thời lượng chỉ xuất hiện trên thẻ bài ở tab Hôm nay hoặc trong giao diện Timer.

---

## 11. Tìm kiếm, lọc và sắp xếp

### Tìm kiếm

Cho phép tìm theo:

- Tên môn.
- Tên chủ đề.
- Tên bài học.

Không phân biệt chữ hoa và chữ thường.

### Bộ lọc bài học

- Tất cả.
- Chưa bắt đầu.
- Đang học.
- Đã hoàn thành.
- Chưa lên lịch.
- Đã lưu trữ.

### Sắp xếp

- Thứ tự lộ trình.
- Ngày dự kiến.
- Tiến độ.
- Tên bài.
- Thời lượng còn lại.

Mặc định dùng `Thứ tự lộ trình`.

---

## 12. Thêm môn học

Form thêm môn gồm:

### Bắt buộc

- Tên môn.

### Tùy chọn

- Icon.
- Màu nhận diện.
- Mô tả ngắn.
- Mục tiêu tổng quát.

CTA:

`Tạo môn học`

Không yêu cầu người dùng nhập ID.

Hệ thống tự tạo ID ổn định.

Tên môn có thể trùng với dữ liệu cũ khi import, nhưng UI phải cảnh báo và gợi ý sử dụng môn hiện có.

---

## 13. Thêm hoặc chỉnh sửa bài học

Form bài học gồm:

### Bắt buộc

- Môn học.
- Tên bài học.
- Thời lượng mục tiêu.

### Tùy chọn

- Chủ đề/chương.
- Ngày dự kiến.
- Mức ưu tiên.
- Ghi chú.
- Loại bài:
  - Bài mới.
  - Ôn tập.
  - Bài luyện tập.

Thời lượng mục tiêu:

- Có preset 30, 60, 90 và 120 phút.
- Có thể nhập số khác.
- Phải lớn hơn 0.
- Không được nhầm với thời lượng của một phiên Pomodoro.

Không yêu cầu người dùng nhập thủ công:

- Lesson ID.
- XP thưởng.
- Coin thưởng.

XP và Coin nên được tính từ quy tắc gamification chung, tránh mỗi bài có một công thức khác nhau.

CTA:

- Khi thêm mới: `Thêm bài học`.
- Khi chỉnh sửa: `Lưu thay đổi`.

---

## 14. Tạo nhanh nhiều bài

Trong một chủ đề, có thể bổ sung:

`Thêm nhiều bài`

Người dùng nhập mỗi bài trên một dòng:

```text
Bài 1. Góc lượng giác
Bài 2. Giá trị lượng giác
Bài 3. Công thức lượng giác
```

Sau đó hệ thống:

- Tạo các bài trong cùng môn và chủ đề.
- Áp dụng cùng thời lượng mặc định.
- Cho phép chỉnh từng bài sau.

Không bắt buộc triển khai ngay nếu làm tăng đáng kể độ phức tạp. Đây là tính năng ưu tiên sau khi luồng thêm một bài đã ổn định.

---

## 15. Sắp xếp lại

Cho phép thay đổi thứ tự:

- Môn học.
- Chủ đề.
- Bài học trong chủ đề.

Desktop:

- Có thể dùng drag handle.

Mobile và bàn phím:

- Có nút `Di chuyển lên`.
- Có nút `Di chuyển xuống`.
- Có lựa chọn `Chuyển đến vị trí`.

Không dựa duy nhất vào drag-and-drop vì sẽ khó dùng trên mobile và thiếu khả năng truy cập.

Lưu một trường `order` ổn định trong dữ liệu.

Không dùng vị trí mảng làm React key.

---

## 16. Chỉnh sửa hàng loạt

Khi bật chế độ chọn nhiều bài, cho phép:

- Chuyển sang chủ đề khác.
- Chuyển sang môn khác.
- Đổi ngày dự kiến.
- Lưu trữ.
- Xóa.
- Đặt lại thời lượng mục tiêu.

Không hiển thị chế độ chọn hàng loạt mặc định. Chỉ bật sau khi người dùng chọn `Chọn nhiều`.

Trước thao tác ảnh hưởng nhiều bài, hiển thị số lượng rõ ràng:

`Lưu trữ 8 bài học`

---

## 17. Phân biệt Lưu trữ và Xóa

### Lưu trữ

Lưu trữ bài hoặc môn phải:

- Ẩn khỏi danh sách đang học.
- Loại khỏi lịch tương lai.
- Không xóa tiến độ đã học.
- Không xóa lịch sử session.
- Có thể khôi phục sau.

CTA ưu tiên trong menu:

`Lưu trữ`

### Xóa

Xóa là thao tác phá hủy dữ liệu cấu trúc.

Khi xóa một bài:

- Xóa khỏi danh mục.
- Xóa khỏi lịch phân bổ tương lai.
- Hủy liên kết với Timer chưa bắt đầu.
- Không tự xóa lịch sử học đã diễn ra.
- Session lịch sử giữ snapshot tên môn và tên bài để Tổng kết tuần không bị mất dữ liệu.

Dialog phải ghi rõ:

```text
Xóa “Bài 1. Góc lượng giác”?

Bài sẽ bị xóa khỏi lộ trình và lịch tương lai.
45 phút đã học trước đây vẫn được giữ trong lịch sử.
```

CTA:

- `Hủy`
- `Xóa bài học`

Nút xóa dùng màu nguy hiểm nhưng không chiếm vị trí nổi bật mặc định.

---

## 18. Xóa môn học

Nếu môn còn chứa bài, không xóa ngay.

Hiển thị ảnh hưởng:

- Số chủ đề.
- Số bài.
- Số bài đang có lịch.
- Số phiên học lịch sử.

Đưa ra hai lựa chọn:

### Khuyến nghị

`Lưu trữ môn học`

Giữ toàn bộ dữ liệu và có thể khôi phục.

### Nguy hiểm

`Xóa môn và các bài`

Trước khi xóa:

1. Tạo snapshot rollback.
2. Loại các bài khỏi lịch tương lai.
3. Giữ session lịch sử dưới dạng snapshot.
4. Xóa transactionally, không để state cập nhật một nửa.

---

## 19. Tiến độ và trạng thái

Trạng thái bài học phải được suy ra nhất quán:

### Chưa bắt đầu

`completedMinutes = 0`

### Đang học

`0 < completedMinutes < targetMinutes`

### Hoàn thành

`completedMinutes >= targetMinutes`

Không cho phép checkbox giao diện tự cộng tiến độ hoặc tự phát thưởng.

Nếu vẫn cần thao tác đánh dấu hoàn thành thủ công:

- Phải hiển thị rõ đây là chỉnh sửa tiến độ.
- Không tự tạo StudySession giả.
- Không phát lại phần thưởng hoàn thành nếu đã từng nhận.

---

## 20. Tích hợp với tab Hôm nay

Khi chỉnh sửa một bài:

- Tên bài mới phải cập nhật ở tab Hôm nay.
- Chủ đề mới phải cập nhật ở Kế hoạch.
- Thời lượng mục tiêu mới phải cập nhật progress bar.
- Ngày dự kiến mới quyết định bài có xuất hiện hôm nay hay không.

Menu dấu ba chấm trên thẻ bài Hôm nay có thể mở cùng form chỉnh sửa bài dùng trong màn hình quản lý.

Không tạo hai form chỉnh sửa có logic khác nhau.

---

## 21. Tích hợp với tab Kế hoạch

Tab Kế hoạch hiển thị dữ liệu được quản lý tại đây.

Khi:

- Thêm bài.
- Đổi chủ đề.
- Đổi thứ tự.
- Đổi ngày.
- Lưu trữ.
- Xóa.

Kế hoạch phải cập nhật ngay, không yêu cầu reload.

Nút `Quản lý môn & bài` trong Kế hoạch mở đúng môn hoặc bài đang được xem nếu có context.

---

## 22. Tích hợp với Import

Dữ liệu import Excel, CSV hoặc JSON phải đi qua cùng schema và validation với form tạo môn/bài thủ công.

Import không được tạo một kiểu dữ liệu song song.

Sau khi import:

- Môn xuất hiện trong màn hình quản lý.
- Chủ đề và bài có thể chỉnh sửa bình thường.
- ID phải ổn định.
- Không có duplicate do cùng một file được import hai lần.
- Có báo cáo record được thêm, cập nhật, bỏ qua hoặc lỗi.

---

## 23. Tích hợp với Pomodoro

Timer chỉ tham chiếu bài học bằng ID ổn định.

Khi một bài đang có phiên chạy:

- Không cho xóa ngay mà không cảnh báo.
- Có thể sửa tên, chủ đề hoặc thời lượng mục tiêu mà không làm mất session.
- Session đang chạy giữ nguyên thời lượng phiên đã chọn.

Khi lưu trữ bài đang có Timer:

- Hỏi người dùng có muốn tiếp tục phiên hiện tại hay dừng.
- Không tự dừng hoặc xóa session âm thầm.

---

## 24. Empty states

### Chưa có môn học

```text
Bạn chưa có môn học nào

Tạo môn đầu tiên hoặc sử dụng lộ trình mẫu lớp 11.

[+ Tạo môn học]
[Dùng lộ trình mẫu lớp 11]
```

### Môn chưa có bài

```text
Môn này chưa có bài học

Thêm bài đầu tiên hoặc nhập danh sách bài từ file.

[+ Thêm bài học]
[Nhập từ file]
```

### Không có kết quả tìm kiếm

```text
Không tìm thấy bài học phù hợp

Hãy thử từ khóa hoặc bộ lọc khác.
```

Không hiển thị màn hình trắng.

---

## 25. Yêu cầu kỹ thuật và toàn vẹn dữ liệu

- Mỗi môn, chủ đề và bài có ID ổn định.
- Không dùng tên làm ID.
- Không dùng `index` làm React key.
- Không dùng ``key={`${lesson.id}-${index}`}`` để che ID trùng.
- Save bài cũ phải cập nhật record hiện có, không append bản sao.
- Archive và delete phải cập nhật đồng bộ catalog, lịch và các reference.
- Các thao tác nhiều bước phải có transaction hoặc rollback.
- Dữ liệu legacy có ID trùng phải được migration một lần.
- Lịch sử session không phụ thuộc hoàn toàn vào việc bài hiện còn tồn tại.
- Không ghi trực tiếp nhiều LocalStorage key từ component UI.
- Tái sử dụng abstraction storage hiện có.

---

## 26. Tiêu chí hoàn thành

Khu vực “Quản lý môn & bài học” được xem là hoàn thành khi:

- Người dùng có thể tìm, thêm, sửa và tổ chức môn, chủ đề, bài học.
- Desktop không bị quá nhiều modal chồng nhau.
- Mobile không cần cuộn ngang.
- Dấu ba chấm chỉ chứa thao tác quản lý.
- Lưu trữ không làm mất lịch sử.
- Xóa không làm sai Tổng kết tuần.
- Chỉnh sửa cập nhật ngay Hôm nay và Kế hoạch.
- Import và tạo thủ công dùng chung một schema.
- Không tạo lesson ID trùng.
- Không làm Timer mất bài hoặc ghi sai session.
- Thao tác nguy hiểm có cảnh báo và snapshot rollback.

---

# PHÂN ĐỊNH TRÁCH NHIỆM CÁC KHU VỰC

- **Môn & bài học:** Chỉnh nội dung lộ trình hằng ngày.
- **Lộ trình & dữ liệu:** Nhập, xuất, lộ trình mẫu và backup.
- **Kế hoạch:** Phân bổ môn và bài theo ngày.
- **Hôm nay:** Chọn bài và bắt đầu học.
- **Pomodoro Studio:** Cấu hình cách phiên học vận hành.
