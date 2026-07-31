import { useEffect, useState } from "react";
import { Sparkles, Target, Trophy } from "lucide-react";
import { ConfettiBurst } from "./ConfettiBurst";
import { cn } from "@/lib/utils";

type Props = {
  completedCount: number;
  totalCount: number;
  onAllCompleted?: () => void;
};

export function DailyProgressBar({ completedCount, totalCount, onAllCompleted }: Props) {
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [prevCompleted, setPrevCompleted] = useState(completedCount);

  const percentage =
    totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;
  const isAllDone = totalCount > 0 && completedCount >= totalCount;

  useEffect(() => {
    // Detect transition to 100% completion or when user marks final task
    if (totalCount > 0 && completedCount >= totalCount && prevCompleted < totalCount) {
      setConfettiTrigger((t) => t + 1);
      if (onAllCompleted) {
        onAllCompleted();
      }
    }
    setPrevCompleted(completedCount);
  }, [completedCount, totalCount, prevCompleted, onAllCompleted]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50/90 via-indigo-50/40 to-emerald-50/90 p-4 shadow-sm transition-all">
      <ConfettiBurst trigger={confettiTrigger} />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "grid h-9 w-9 place-items-center rounded-xl font-bold transition-all shadow-xs",
              isAllDone
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-200 animate-bounce"
                : "bg-sky-600 text-white",
            )}
          >
            {isAllDone ? <Trophy className="h-5 w-5" /> : <Target className="h-5 w-5" />}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tiến độ nhiệm vụ học tập hôm nay
            </div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>
                Đã xong: <strong className="text-sky-700">{completedCount}</strong> / {totalCount}{" "}
                bài học
              </span>
              {isAllDone && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 border border-emerald-300 shadow-xs">
                  <Sparkles className="h-3 w-3 text-emerald-600" /> Hoàn thành 100%!
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span
            className={cn(
              "text-2xl font-black tracking-tight",
              isAllDone ? "text-emerald-600" : "text-sky-700",
            )}
          >
            {percentage}%
          </span>
        </div>
      </div>

      {/* Modern Animated Gradient Progress Bar Container */}
      <div
        className="relative h-4 w-full overflow-hidden rounded-full bg-slate-200/80 p-0.5 shadow-inner"
        role="progressbar"
        aria-label="Tiến độ bài học hôm nay"
        aria-valuemin={0}
        aria-valuemax={totalCount}
        aria-valuenow={completedCount}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out relative",
            isAllDone
              ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500 shadow-md shadow-emerald-300"
              : percentage >= 50
                ? "bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400"
                : "bg-gradient-to-r from-sky-500 to-indigo-600",
          )}
          style={{ width: `${percentage}%` }}
        >
          {percentage > 0 && (
            <div className="absolute inset-0 bg-white/25 animate-pulse rounded-full" />
          )}
        </div>
      </div>

      {/* Motivational micro-copy */}
      <div className="mt-2 text-xs font-medium text-slate-600 flex items-center justify-between flex-wrap gap-1">
        <span>
          {isAllDone ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              🎉 Tuyệt vời! Bạn đã hoàn thành toàn bộ bài học được xếp hôm nay!
            </span>
          ) : percentage === 0 ? (
            "🎯 Bắt đầu bài học đầu tiên để kích hoạt tiến độ!"
          ) : percentage < 50 ? (
            "🚀 Khởi đầu tốt! Hãy tiếp tục để chinh phục 100%!"
          ) : (
            "🔥 Sắp về đích! Chỉ còn ít bài nữa thôi!"
          )}
        </span>
        <span className="text-[11px] font-bold text-slate-500">
          {totalCount - completedCount > 0
            ? `Còn ${totalCount - completedCount} bài nữa`
            : "Hoàn tất!"}
        </span>
      </div>
    </div>
  );
}
