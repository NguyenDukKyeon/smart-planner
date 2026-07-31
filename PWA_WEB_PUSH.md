# PWA và Web Push

## Thành phần đã triển khai

- `public/manifest.webmanifest`: metadata cài ứng dụng, icon và shortcut.
- `public/sw.js`: cache app shell, trang offline, nhận push và mở đúng bài học.
- `src/lib/pwa-client.ts`: đăng ký service worker và xử lý lời mời cài PWA.
- `src/lib/web-push-client.ts`: đăng ký/hủy Push API, gửi thử và đồng bộ lịch.
- `src/lib/web-push-schedule.ts`: tạo các lời nhắc trong 7 ngày từ kế hoạch linh hoạt và thói quen.
- `src/routes/api.push.*.ts`: API cấu hình, gửi thử, lên lịch và nhận callback.
- `src/lib/server/web-push-server.ts`: ký VAPID và gửi notification bằng `web-push`.
- `src/lib/server/qstash-push-scheduler.ts`: tạo và hủy lịch nền QStash.

## Luồng hoạt động

1. Người dùng bấm bật Web Push; trình duyệt đăng ký service worker và tạo Push Subscription.
2. Client gửi subscription cùng danh sách lời nhắc 7 ngày tới cho API cùng origin.
3. API hủy các message cũ rồi gửi từng job tới QStash với thời điểm `Upstash-Not-Before`.
4. Đúng giờ, QStash gọi `/api/push/deliver` kèm secret chỉ có trên máy chủ.
5. Server dùng VAPID private key và `web-push` để gửi tới push service của trình duyệt.
6. Service worker hiển thị notification kể cả khi tab ứng dụng không mở.

## Cấu hình Vercel

Khai báo toàn bộ biến trong `.env.example` cho Production, Preview và Development theo nhu cầu. Không dùng cùng `PUSH_DELIVERY_SECRET` với bất kỳ hệ thống nào khác.

Build preset đang là:

```ts
nitro: {
  preset: "vercel";
}
```

Ứng dụng cần server runtime; không thể deploy dưới dạng static export thuần túy nếu muốn Web Push theo lịch.

## Bảo mật hiện tại

- VAPID private key và QStash token không được trả về client.
- Điểm `/api/push/deliver` yêu cầu bearer secret được QStash chuyển tiếp.
- Điểm gửi thử và lên lịch kiểm tra same-origin và có rate limit best-effort theo IP.
- Origin callback được suy ra từ chính request; client không được chỉ định URL đích tùy ý.
- Service worker bỏ qua `/api/*`, tránh cache cấu hình hoặc phản hồi API nhạy cảm.
- Payload, số job, thời gian gửi và message ID đều được kiểm tra, giới hạn.

Rate limit trong bộ nhớ chỉ là lớp giảm thiểu cơ bản trên serverless. Khi ứng dụng có nhiều người dùng, nên bổ sung rate limiting dùng Redis/KV và xác thực tài khoản.

## Quyền riêng tư và giới hạn

Ứng dụng chưa có cơ sở dữ liệu người dùng. Subscription nằm trong trình duyệt và được đưa vào message đã lên lịch tại QStash để giao đúng thiết bị. Đây là dữ liệu kỹ thuật nhạy cảm; không ghi log subscription và nên đặt thời gian lưu message ngắn nhất phù hợp.

Mỗi trình duyệt là một thiết bị độc lập. Xóa site data hoặc hủy quyền thông báo sẽ làm subscription không còn hợp lệ; người dùng cần bật lại và đồng bộ lịch.

## Checklist kiểm tra sau deploy

1. Trang mở bằng HTTPS và manifest tải thành công.
2. DevTools → Application hiển thị service worker đang active.
3. API `/api/push/config` báo `configured: true` và `schedulerConfigured: true`.
4. Nút **Bật Web Push** tạo subscription sau thao tác người dùng.
5. **Gửi thử thật** hiển thị notification từ service worker.
6. Đồng bộ lịch trả về message ID và số job hợp lý.
7. Đóng toàn bộ tab, chờ một job thử được đặt trong tương lai và xác nhận notification vẫn tới.
8. Bấm notification mở `/?view=today` hoặc đúng `focusLesson`.
9. Tắt Web Push hủy message cũ và unsubscribe thiết bị.
10. Kiểm tra offline: tắt mạng, tải lại một route đã cache và thấy trang dự phòng thay vì lỗi trắng.
