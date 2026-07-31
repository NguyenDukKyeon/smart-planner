import {
  Brain,
  Sparkles,
  Zap,
  Target,
  Flame,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  HeartHandshake,
  Lightbulb,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BehavioralPsychologyModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
            <Brain size={18} className="text-indigo-500" />
            <span>Khoa học hành vi & Atomic Habits</span>
          </div>
          <DialogTitle className="font-serif text-2xl font-bold text-slate-800 flex items-center gap-2">
            5 Nguyên Lý Cốt Lõi Tạo Động Lực Học Tập
          </DialogTitle>
          <DialogDescription className="text-slate-600 text-sm mt-1">
            Ứng dụng được thiết kế dựa trên tâm lý học hành vi (Behavioral Psychology) và cuốn sách
            kinh điển Atomic Habits nhằm giúp bạn duy trì kỷ luật tự học nhẹ nhàng & bền vững.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Rule 1 */}
          <div className="rounded-2xl border border-sky-150 bg-gradient-to-r from-sky-50/80 to-blue-50/40 p-4 transition-all hover:shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white font-bold shadow-2xs">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sky-950 text-base flex items-center gap-1.5">
                    <Target size={16} className="text-sky-600" />
                    Tín Hiệu Rõ Ràng (Make It Obvious)
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-sky-300 text-sky-700 bg-white/80 text-[10px]"
                  >
                    Nguyên lý 1
                  </Badge>
                </div>
                <p className="mt-1 text-slate-600 text-xs sm:text-sm">
                  Não bộ cần tín hiệu cụ thể để bắt đầu. Ứng dụng tự động chọn ra danh sách bài học
                  cần hoàn thành hôm nay (<strong>"Nhiệm vụ hôm nay"</strong>) và gửi thông báo nhắc
                  nhở chuẩn khung giờ để loại bỏ sự phân vân.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] font-medium text-sky-800">
                  <span className="rounded-md bg-white/90 px-2 py-0.5 border border-sky-100">
                    ✔ Danh sách học hôm nay
                  </span>
                  <span className="rounded-md bg-white/90 px-2 py-0.5 border border-sky-100">
                    ✔ Thông báo đẩy Push Center
                  </span>
                  <span className="rounded-md bg-white/90 px-2 py-0.5 border border-sky-100">
                    ✔ Cảnh báo Deadline sắp tới
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="rounded-2xl border border-purple-150 bg-gradient-to-r from-purple-50/80 to-pink-50/40 p-4 transition-all hover:shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500 text-white font-bold shadow-2xs">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-purple-950 text-base flex items-center gap-1.5">
                    <Sparkles size={16} className="text-purple-600" />
                    Tạo Sự Hấp Dẫn (Make It Attractive)
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-purple-300 text-purple-700 bg-white/80 text-[10px]"
                  >
                    Nguyên lý 2
                  </Badge>
                </div>
                <p className="mt-1 text-slate-600 text-xs sm:text-sm">
                  Gắn việc học với niềm vui tiến bộ. Hệ thống{" "}
                  <strong>Level & Cấp bậc danh hiệu</strong> ("Tân Binh Tự Học" ➔ "Sĩ Tử Kỷ Luật" ➔
                  "Chân Nhân Học Thuật") cùng xu thưởng giúp biến mỗi giờ học thành một hành trình
                  chinh phục thú vị.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] font-medium text-purple-800">
                  <span className="rounded-md bg-white/90 px-2 py-0.5 border border-purple-100">
                    ✔ Cấp độ & XP
                  </span>
                  <span className="rounded-md bg-white/90 px-2 py-0.5 border border-purple-100">
                    ✔ Chuỗi ngày Streak 🔥
                  </span>
                  <span className="rounded-md bg-white/90 px-2 py-0.5 border border-purple-100">
                    ✔ Đổi Xu nhận thưởng
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="rounded-2xl border border-emerald-150 bg-gradient-to-r from-emerald-50/80 to-teal-50/40 p-4 transition-all hover:shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold shadow-2xs">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-emerald-950 text-base flex items-center gap-1.5">
                    <Clock size={16} className="text-emerald-600" />
                    Tạo Sự Dễ Dàng (Make It Easy - Giảm Ma Sát)
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 bg-white/80 text-[10px]"
                  >
                    Nguyên lý 3
                  </Badge>
                </div>
                <p className="mt-1 text-slate-600 text-xs sm:text-sm">
                  <strong>Quy tắc 2 phút:</strong> Khi cảm thấy lười biếng, hãy bật đồng hồ 5 phút
                  khởi động nhanh. Khi có việc bận lỡ dở, thuật toán{" "}
                  <strong>Đẩy lịch linh hoạt</strong> tự động sắp xếp lại bài học vào ngày tiếp theo
                  mà không phạt hay gây áp lực tội lỗi.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] font-medium text-emerald-800">
                  <span className="rounded-md bg-white/90 px-2 py-0.5 border border-emerald-100">
                    ⚡ Chế độ 5p (Quy tắc 2 phút)
                  </span>
                  <span className="rounded-md bg-white/90 px-2 py-0.5 border border-emerald-100">
                    🌱 Tự động dời lịch không tội lỗi
                  </span>
                  <span className="rounded-md bg-white/90 px-2 py-0.5 border border-emerald-100">
                    🧩 Chia nhỏ bài học thành từng bước
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="rounded-2xl border border-amber-150 bg-gradient-to-r from-amber-50/80 to-orange-50/40 p-4 transition-all hover:shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white font-bold shadow-2xs">
                4
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-amber-950 text-base flex items-center gap-1.5">
                    <Award size={16} className="text-amber-600" />
                    Thỏa Mãn Tức Thì (Make It Satisfying)
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-amber-300 text-amber-700 bg-white/80 text-[10px]"
                  >
                    Nguyên lý 4
                  </Badge>
                </div>
                <p className="mt-1 text-slate-600 text-xs sm:text-sm">
                  Bộ não muốn thấy phần thưởng ngay lập tức. Mỗi khi đánh dấu hoàn thành, hiệu ứng
                  pháo hoa Confetti, âm thanh Pomodoro mừng hoàn thành, và điểm XP tăng vọt mang lại
                  cảm giác chinh phục cực kỳ thỏa mãn.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] font-medium text-amber-800">
                  <span className="rounded-md bg-white/90 px-2 py-0.5 border border-amber-100">
                    🎉 Pháo hoa Confetti
                  </span>
                  <span className="rounded-md bg-white/90 px-2 py-0.5 border border-amber-100">
                    🔊 Âm thanh chúc mừng
                  </span>
                  <span className="rounded-md bg-white/90 px-2 py-0.5 border border-amber-100">
                    📊 Biểu đồ tiến độ tuần
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rule 5 */}
          <div className="rounded-2xl border border-indigo-150 bg-gradient-to-r from-indigo-50/80 to-slate-50/40 p-4 transition-all hover:shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-2xs">
                5
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-indigo-950 text-base flex items-center gap-1.5">
                    <HeartHandshake size={16} className="text-indigo-600" />
                    Thói Quen Dựa Trên Bản Sắc (Identity-Based Habits)
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-indigo-300 text-indigo-700 bg-white/80 text-[10px]"
                  >
                    Nguyên lý 5
                  </Badge>
                </div>
                <p className="mt-1 text-slate-600 text-xs sm:text-sm">
                  Thay vì tập trung vào mục tiêu ngắn hạn, bạn tự xây dựng niềm tin:{" "}
                  <em>"Tôi là một người tự học kỷ luật"</em>. Việc tích lũy thói quen nhỏ hàng ngày
                  liên tục củng cố bản sắc học thuật cá nhân của bạn.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px] font-medium text-indigo-800">
                  <span className="rounded-md bg-white/90 px-2 py-0.5 border border-indigo-100">
                    👑 Danh hiệu bản sắc
                  </span>
                  <span className="rounded-md bg-white/90 px-2 py-0.5 border border-indigo-100">
                    🔗 Habit Stacking (Xâu chuỗi thói quen)
                  </span>
                  <span className="rounded-md bg-white/90 px-2 py-0.5 border border-indigo-100">
                    🌱 Lộ trình tự chủ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-center text-xs text-slate-600">
          💡 <strong>Mẹo Atomic Habits:</strong> "Mỗi hành động bạn thực hiện là một phiếu bầu cho
          con người mà bạn muốn trở thành."
        </div>
      </DialogContent>
    </Dialog>
  );
}
