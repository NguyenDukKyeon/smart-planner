## Vấn đề

Ở tab **Hôm nay**, khi bạn tick hoàn thành một bài, `pickTodayQueue` lọc bài đó ra khỏi danh sách (vì đã có trong `completedLessons`), và phần quỹ giờ trống lại được lấp bằng một bài kế tiếp. Cảm giác là bài vừa xong "biến mất" và bị thay bằng bài khác.

## Mong muốn

Bài đã tick hoàn thành trong ngày hôm nay phải **ở nguyên tại chỗ** trong danh sách "Bài học mới", hiển thị trạng thái đã xong (checkmark + gạch ngang), và **không kéo thêm bài mới** vào thế chỗ. Sang ngày hôm sau (todayISO đổi), các bài này mới rời khỏi danh sách như bình thường.

## Thay đổi

### 1. `src/lib/planner.ts` — `pickDayQueue` / `pickTodayQueue`

- Thêm tham số tuỳ chọn `pinnedCompleted: Lesson[]` (các bài đã hoàn thành trong đúng `dateISO`).
- Các bài trong `pinnedCompleted`:
  - Được **thêm vào đầu `newLessons`** theo thứ tự đã hoàn thành.
  - **Trừ trước quỹ giờ**: `newMinutes` khởi tạo bằng tổng `estimateLessonMinutes` của các bài này, để phần budget còn lại không kéo thêm bài mới thay thế.
  - Được đánh dấu là `consumed` để không bị xét lại trong pool subject.
- `pickTodayQueue`: tự tính `pinnedCompleted` từ `completed` bằng cách lọc các entry có ISO trùng `dateISO` (mặc định = hôm nay), map sang `Lesson` qua `subjects`. Giữ nguyên chữ ký cũ cho phần còn lại.
- `buildFlexiblePlan`: chỉ áp dụng pin cho ngày `i === 0` (hôm nay), các ngày sau không đổi.

### 2. `src/components/TodayPanel.tsx`

- Không cần đổi logic render (đã dùng `!!state.completedLessons[l.id]` để hiển thị check + gạch ngang). Chỉ cần queue trả về bài đã xong trong danh sách newLessons là UI tự đúng.
- KPI "Cần học" đổi công thức: đếm số bài trong `newLessons` **chưa** completed hôm nay (thay vì `queue.newLessons.length`) để không tăng ảo khi có pinned. "Đã xong HN" giữ nguyên.

### 3. Không đụng

- `LearningRoadmap`, `FlexiblePlanner`, `ForecastCard`, forecast, buildShiftedSchedule — logic bên ngoài tab Hôm nay không thay đổi.
- Migration/localStorage schema giữ nguyên.

## Kết quả kỳ vọng

- Tick xong 1 bài trong Hôm nay → bài đó ở nguyên vị trí, có dấu tick xanh + gạch ngang, không có bài mới nào "nhảy vào".
- Bỏ tick trong ngày → quay lại trạng thái chưa xong, quỹ giờ trở lại như cũ.
- Qua ngày mới, bài đã xong hôm qua tự rời khỏi danh sách Hôm nay.
