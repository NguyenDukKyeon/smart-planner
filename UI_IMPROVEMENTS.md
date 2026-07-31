# Cải thiện UI/UX đã triển khai

## Màn hình Hôm nay

- Sắp xếp lại theo luồng hành động: bài ưu tiên → bài mới → bài ôn → thói quen.
- Mỗi bài chỉ có một CTA chính **Học 25p**; các lựa chọn 2/25/50/90 phút và ghi thủ công nằm trong menu phụ.
- Giữ thông tin môn, chủ đề, thời lượng và XP ở cấp độ phụ để tên bài dễ quét hơn.
- Bỏ cảnh báo hạn chót, Habit Stacking và khối gợi ý bắt đầu khỏi màn hình Hôm nay.
- Timer chỉ khôi phục khi đang chạy và đã được người dùng thu nhỏ; chuyển tab không tự bật Pomodoro.

## Kế hoạch

- Tách rõ **Lịch đã điều chỉnh** và **Lộ trình ban đầu**.
- Kế hoạch linh hoạt có bộ lọc môn học, chủ đề, tìm theo tên và nút xóa lọc.
- Từng tuần có thể thu gọn; từng ngày dùng bố cục card responsive thay cho bảng rộng.
- Chủ đề được hiển thị cho cả bài mới và bài ôn.

## Tổng kết tuần

- Chuyển thời gian học hôm nay sang Tổng kết tuần.
- Tách các chỉ số: hôm nay, cả tuần, bài học và thói quen để tránh trộn dữ liệu khác đơn vị.

## Mobile 360–430 px

- Thêm thanh điều hướng cố định gồm Hôm nay, Tổng kết, Kế hoạch và Nhắc học.
- Tăng vùng chạm tối thiểu, tránh bảng cuộn ngang và dành khoảng trống đáy cho thanh điều hướng.
- Card bài học chuyển sang cột trên màn hình nhỏ; CTA không ép tên bài bị co hẹp.

## Tái cấu trúc

- `TodayPanel` được chia thành `TodayLessonCard`, `LessonActionMenu`, `ManualStudyDialog` và types riêng.
- `FocusTimerModal` tách selector, auto-start, âm thanh và toàn bộ dialog phụ thành module riêng.
- `progress-store` tách model dữ liệu sang `progress-types.ts` và phép tính sang `progress-analytics.ts`.
- Logic chuyển trạng thái timer dùng `focus-timer-transitions.ts` để kiểm thử độc lập.

## PWA/Web Push

- Có manifest, icon, service worker, offline fallback và luồng cài PWA.
- Web Push dùng Push API, VAPID, API server và QStash; không còn banner giả lập trong dashboard.
- Trung tâm Nhắc học hiển thị trạng thái HTTPS/VAPID/QStash, gửi thử thật, đồng bộ và hủy lịch theo thiết bị.
