import { Check, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimerMode } from "@/lib/focus-timer-store";

export type CompletionSummary = {
  minutes: number;
  lessonTitle: string;
  nextMode: TimerMode;
  nextMinutes: number;
};

export function SaveTimeInfoDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Giải thích lưu thời gian"
      className="pointer-events-auto fixed inset-0 z-[10050] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="flex items-center gap-2 text-base font-bold text-rose-600">
            <HelpCircle className="h-5 w-5" /> Nút “Lưu thời gian” dùng để làm gì?
          </h4>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            onClick={onClose}
            aria-label="Đóng giải thích lưu thời gian"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3 py-4 text-sm leading-relaxed text-slate-600">
          <p>
            Nút <strong>“Lưu thời gian”</strong> ghi nhận chính xác số phút thực tế đã trôi qua, kể
            cả khi bạn dừng trước lúc đồng hồ kết thúc.
          </p>
          <div className="space-y-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs text-rose-900">
            <p className="font-semibold text-rose-800">Dữ liệu được cập nhật:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Thời gian thực tế của bài học.</li>
              <li>Biểu đồ và tổng kết thời gian học.</li>
              <li>Chuỗi ngày học khi phiên có thời lượng hợp lệ.</li>
            </ul>
          </div>
          <p className="text-xs text-slate-500">
            Ví dụ: đặt 50 phút nhưng dừng ở phút 25 thì hệ thống lưu đúng 25 phút.
          </p>
        </div>
        <Button
          type="button"
          className="w-full rounded-xl bg-rose-600 font-semibold text-white hover:bg-rose-700"
          onClick={onClose}
        >
          Đã hiểu
        </Button>
      </div>
    </div>
  );
}

export function TimerRecoveryDialogs({
  expiredPrompt,
  lessonTitle,
  durationMinutes,
  completionSummary,
  canCompleteLesson,
  onExpiredDecision,
  onCompleteLesson,
  onStartMode,
  onReturnToday,
  lastFocusDuration,
}: {
  expiredPrompt: boolean;
  lessonTitle: string;
  durationMinutes: number;
  completionSummary: CompletionSummary | null;
  canCompleteLesson: boolean;
  onExpiredDecision: (save: boolean) => void;
  onCompleteLesson: () => void;
  onStartMode: (mode: TimerMode, minutes: number) => void;
  onReturnToday: () => void;
  lastFocusDuration: number;
}) {
  return (
    <>
      {expiredPrompt && (
        <div
          data-timer-overlay="true"
          role="dialog"
          aria-modal="true"
          aria-label="Quyết định phiên đã hết hạn"
          className="pointer-events-auto fixed inset-0 z-[10050] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-semibold">Phiên đã kết thúc khi app đóng</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Phiên “{lessonTitle}” đã hết khi ứng dụng không mở. Chọn lưu hoặc bỏ qua; ứng dụng
              không tự ghi dữ liệu khi chưa có xác nhận.
            </p>
            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                className="flex-1"
                onClick={() => onExpiredDecision(true)}
              >
                Lưu {durationMinutes} phút
              </Button>
              <Button
                type="button"
                className="flex-1"
                variant="outline"
                onClick={() => onExpiredDecision(false)}
              >
                Bỏ qua
              </Button>
            </div>
          </div>
        </div>
      )}

      {completionSummary && !expiredPrompt && (
        <div
          data-timer-overlay="true"
          role="dialog"
          aria-modal="true"
          aria-label="Tóm tắt phiên tập trung"
          className="pointer-events-auto fixed inset-0 z-[10050] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="text-3xl">🎉</div>
            <h3 className="mt-2 font-serif text-xl font-semibold">Đã hoàn thành phiên tập trung</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {completionSummary.minutes} phút · {completionSummary.lessonTitle}
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {canCompleteLesson && (
                <Button type="button" variant="outline" onClick={onCompleteLesson}>
                  <Check className="h-4 w-4" /> Hoàn thành bài
                </Button>
              )}
              <Button
                type="button"
                onClick={() =>
                  onStartMode(completionSummary.nextMode, completionSummary.nextMinutes)
                }
              >
                Bắt đầu nghỉ
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onStartMode("pomodoro", lastFocusDuration || 50)}
              >
                Học tiếp
              </Button>
              <Button type="button" variant="ghost" onClick={onReturnToday}>
                Về màn hình Hôm nay
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function MicroStartDialog({
  open,
  onContinue,
  onFinish,
}: {
  open: boolean;
  onContinue: (minutes: number) => void;
  onFinish: () => void;
}) {
  if (!open) return null;
  return (
    <div
      data-timer-overlay="true"
      role="dialog"
      aria-modal="true"
      aria-label="Quyết định tiếp tục phiên tập trung"
      className="pointer-events-auto fixed inset-0 z-[10050] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-amber-300 bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl shadow-lg">
          ⚡
        </div>
        <div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            Hoàn thành khởi động
          </span>
          <h3 className="mt-2 font-serif text-xl font-bold text-slate-900">
            Bạn đã bắt đầu được rồi
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Tiếp tục khi động lực đang còn.
          </p>
        </div>
        <div className="space-y-2 pt-2">
          <Button
            type="button"
            onClick={() => onContinue(25)}
            className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-700"
          >
            🍅 Học tiếp 25 phút
          </Button>
          <Button
            type="button"
            onClick={() => onContinue(50)}
            variant="outline"
            className="w-full rounded-2xl border-indigo-200 bg-indigo-50 py-3 text-sm font-bold text-indigo-800 hover:bg-indigo-100"
          >
            🧠 Deep Work 50 phút
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onFinish}
            className="w-full rounded-2xl text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            ✋ Dừng tại đây
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RecommitmentDialog({
  open,
  lessonTitle,
  onContinueNext,
  onExtendBreak,
  onFinishSession,
}: {
  open: boolean;
  lessonTitle: string;
  onContinueNext: () => void;
  onExtendBreak: () => void;
  onFinishSession: () => void;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tái cam kết phiên học"
      className="pointer-events-auto fixed inset-0 z-[10050] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-indigo-200 bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-600 text-3xl shadow-lg">
          ☕
        </div>
        <div>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-800">
            Hết giờ nghỉ ngơi
          </span>
          <h3 className="mt-2 font-serif text-xl font-bold text-slate-900">
            Sẵn sàng cho phiên học tiếp theo?
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 break-words">
            Bài học: <strong className="text-slate-800">{lessonTitle}</strong>
          </p>
        </div>
        <div className="space-y-2 pt-2">
          <Button
            type="button"
            onClick={onContinueNext}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-bold text-white shadow-lg hover:brightness-110"
          >
            ▷ Bắt đầu phiên tiếp
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onExtendBreak}
            className="w-full rounded-2xl border-indigo-200 bg-indigo-50/50 text-xs font-bold text-indigo-800 hover:bg-indigo-100"
          >
            ☕ Nghỉ thêm 5 phút
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onFinishSession}
            className="w-full rounded-2xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
          >
            🏁 Hoàn thành buổi học hôm nay
          </Button>
        </div>
      </div>
    </div>
  );
}
