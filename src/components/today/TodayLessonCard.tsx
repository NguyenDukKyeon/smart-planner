import { CheckCircle2, Circle, RefreshCw } from "lucide-react";
import type { Lesson } from "@/lib/mock-data";
import type { LessonPlacementReason as PlacementReason } from "@/lib/lesson-placement";
import { cn } from "@/lib/utils";
import { LessonActionMenu } from "./LessonActionMenu";
import { LessonPlacementReason } from "./LessonPlacementReason";

type Props = {
  lesson: Lesson;
  done: boolean;
  estimatedMinutes: number;
  completedMinutes?: number;
  plannedMinutes?: number;
  subjectLabel: string;
  topicLabel?: string;
  reviewAgeDays?: number;
  placementReason: PlacementReason;
  onToggle: () => void;
  onStart: (minutes?: number) => void;
  onManualEntry: () => void;
};

export function TodayLessonCard({
  lesson,
  done,
  estimatedMinutes,
  completedMinutes = 0,
  plannedMinutes,
  subjectLabel,
  topicLabel,
  reviewAgeDays,
  placementReason,
  onToggle,
  onStart,
  onManualEntry,
}: Props) {
  const review = typeof reviewAgeDays === "number";
  const totalDuration = plannedMinutes ?? lesson.plannedDurationMinutes ?? 120;
  const completedDuration = completedMinutes;
  const percent = Math.min(100, Math.round((completedDuration / totalDuration) * 100));
  const remainingMinutes = Math.max(0, totalDuration - completedDuration);

  return (
    <li
      className={cn(
        "min-w-0 rounded-2xl border p-3.5 shadow-xs transition",
        done ? "border-emerald-200 bg-emerald-50/70" : "border-slate-200 bg-white/90",
        review && !done && "border-amber-200 bg-amber-50/60",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <button
            type="button"
            aria-label={
              review
                ? done
                  ? "Bỏ đánh dấu lượt ôn hôm nay"
                  : "Đánh dấu đã ôn hôm nay"
                : done
                  ? "Bỏ đánh dấu hoàn thành bài học"
                  : "Đánh dấu hoàn thành bài học"
            }
            onClick={onToggle}
            className="mt-0.5 shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {done ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            ) : review ? (
              <RefreshCw className="h-5 w-5 text-amber-600" />
            ) : (
              <Circle className="h-6 w-6 text-sky-500" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "break-words text-sm font-semibold leading-snug text-slate-900",
                done && "text-muted-foreground line-through",
              )}
            >
              {lesson.title}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">
                {subjectLabel}
              </span>
              {topicLabel && (
                <span className="rounded-md bg-purple-100 px-1.5 py-0.5 font-medium text-purple-800">
                  {topicLabel}
                </span>
              )}
              {review && <span>ôn sau {reviewAgeDays} ngày</span>}
              <span className="inline-flex items-center rounded-md bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 font-semibold text-amber-700">
                {review ? "Lượt ôn hôm nay" : `+${lesson.xp} XP`}
              </span>
            </div>

            <LessonPlacementReason reason={placementReason} />

            {/* Atomic Habits Progress Bar (50 / 120 phút (41%)) */}
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                <span>Tiến độ bài học:</span>
                <span
                  className={cn(
                    "font-bold",
                    done || percent >= 100 ? "text-emerald-700" : "text-sky-800",
                  )}
                >
                  {completedDuration} / {totalDuration} phút ({percent}%)
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/60">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    done || percent >= 100
                      ? "bg-emerald-500"
                      : percent > 0
                        ? "bg-gradient-to-r from-sky-500 to-teal-500"
                        : "bg-slate-200",
                  )}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        <LessonActionMenu
          onStart={onStart}
          onManualEntry={onManualEntry}
          disabled={done}
          tone={review ? "amber" : "sky"}
          completedMinutes={completedDuration}
          remainingMinutes={remainingMinutes}
        />
      </div>
    </li>
  );
}
