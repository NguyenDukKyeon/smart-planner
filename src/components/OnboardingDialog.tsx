import { BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onStartEmpty: () => void;
  onUseDemo: () => void;
  onCancel?: () => void;
  canRestoreFactoryReset?: boolean;
  canRestoreFactoryResetRollback?: boolean;
  onRestoreFactoryReset?: () => void;
  affectedCounts?: { lessons: number; sessions: number; habits: number; completions: number };
};

export function OnboardingDialog({
  open,
  onStartEmpty,
  onUseDemo,
  onCancel,
  canRestoreFactoryReset,
  canRestoreFactoryResetRollback,
  onRestoreFactoryReset,
  affectedCounts,
}: Props) {
  const canRestore = canRestoreFactoryReset ?? canRestoreFactoryResetRollback ?? false;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel?.()}>
      <DialogContent
        className={`max-w-xl rounded-3xl p-6 ${!onCancel ? "[&>button]:hidden" : ""}`}
        onEscapeKeyDown={(event) => {
          if (!onCancel) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (!onCancel) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Bắt đầu lộ trình của riêng bạn</DialogTitle>
          <DialogDescription>
            Chọn một cách bắt đầu: tự tạo không gian trống hoặc nạp lộ trình mẫu lớp 11. Lộ trình
            mẫu gồm chương trình Toán, Vật lý và Hóa học lớp 11 KNTT; bạn có thể chỉnh sửa sau.
          </DialogDescription>
        </DialogHeader>
        {affectedCounts && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
            Thay thế sẽ ảnh hưởng {affectedCounts.lessons} bài, {affectedCounts.sessions} phiên tập
            trung, {affectedCounts.habits} thói quen và {affectedCounts.completions} lượt hoàn
            thành. Một bản khôi phục sẽ được tạo trước khi ghi.
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={onStartEmpty}
            className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-5 text-left transition hover:border-emerald-400 hover:bg-emerald-50"
          >
            <BookOpen className="mb-3 h-7 w-7 text-emerald-600" />
            <div className="font-semibold text-emerald-950">Tạo không gian trống</div>
            <p className="mt-1 text-xs leading-relaxed text-emerald-800">
              Không có môn, bài hay tiến độ mẫu. Bạn tự thêm nội dung phù hợp với mình.
            </p>
          </button>
          <button
            onClick={onUseDemo}
            className="rounded-2xl border-2 border-sky-200 bg-sky-50/70 p-5 text-left transition hover:border-sky-400 hover:bg-sky-50"
          >
            <Sparkles className="mb-3 h-7 w-7 text-sky-600" />
            <div className="font-semibold text-sky-950">Dùng lộ trình mẫu lớp 11</div>
            <p className="mt-1 text-xs leading-relaxed text-sky-800">
              Nạp lộ trình Toán, Vật lý và Hóa học lớp 11 KNTT; bạn vẫn có thể sửa hoặc xóa tùy ý.
            </p>
          </button>
        </div>
        {onCancel && (
          <Button onClick={onCancel} variant="outline" className="rounded-xl text-xs">
            Hủy, không thay đổi dữ liệu
          </Button>
        )}
        {canRestore && onRestoreFactoryReset && (
          <Button onClick={onRestoreFactoryReset} variant="outline" className="rounded-xl text-xs">
            Khôi phục lần xóa gần nhất
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
