import { useMemo } from "react";
import { SUBJECTS, type Subject } from "@/lib/mock-data";
import { allRemainingLessonIds, forecast } from "@/lib/planner";
import type { ProgressState } from "@/lib/progress-store";
import { displayDate } from "@/lib/date-utils";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { sortSubjects } from "@/lib/subject-order";

type Props = {
  state: ProgressState;
  subjects?: Subject[];
  onSetDefaultDailyHours?: (hours: number) => void;
  shiftedDates?: Record<string, string>;
};

export function ForecastCard({
  state,
  subjects = SUBJECTS,
  onSetDefaultDailyHours,
  shiftedDates,
}: Props) {
  const hours = Number.isFinite(state.plannerSettings.defaultDailyHours)
    ? Math.max(0, state.plannerSettings.defaultDailyHours)
    : 2;

  const handleHoursChange = (h: number) => {
    if (onSetDefaultDailyHours) {
      onSetDefaultDailyHours(h);
    }
  };

  const remainingIds = useMemo(
    () => allRemainingLessonIds(subjects, state.completedLessons),
    [subjects, state.completedLessons],
  );

  const latestShiftedDate = useMemo(() => {
    if (!shiftedDates) return null;
    const dates = Object.values(shiftedDates);
    if (dates.length === 0) return null;
    dates.sort();
    return dates[dates.length - 1];
  }, [shiftedDates]);

  const fc = useMemo(
    () =>
      forecast({
        remainingLessonIds: remainingIds,
        meta: state.studyMeta,
        subjects,
        hoursPerDay: hours,
      }),
    [remainingIds, state.studyMeta, subjects, hours],
  );

  const remainingBySubject = useMemo(() => {
    const sorted = sortSubjects(subjects);
    return sorted.map((s) => {
      const lessons = s.milestones.flatMap((m) => m.lessons);
      const total = lessons.length;
      const done = lessons.filter((l) => state.completedLessons[l.id]).length;
      const remaining = total - done;
      return { subject: s, total, done, remaining };
    });
  }, [subjects, state.completedLessons]);

  const confidenceLabel = {
    insufficient: "Chưa đủ dữ liệu thực tế",
    low: "Độ tin cậy thấp",
    medium: "Độ tin cậy vừa",
    high: "Độ tin cậy cao",
  }[fc.confidence];

  const basisLabel = {
    planned: "thời lượng kế hoạch",
    mixed: "kế hoạch và phiên học thực tế",
    actual: "các phiên học thực tế",
  }[fc.basis];

  const planCompletionText =
    fc.remaining === 0
      ? "Đã hoàn thành tất cả! 🎉"
      : hours <= 0
        ? "Chưa có quỹ giờ để dự báo"
        : latestShiftedDate
          ? displayDate(latestShiftedDate)
          : fc.earliestEndDateISO === fc.latestEndDateISO
            ? displayDate(fc.endDateISO)
            : `${displayDate(fc.earliestEndDateISO)} – ${displayDate(fc.latestEndDateISO)}`;

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-4.5 shadow-xs space-y-3">
      {/* Top Header: Title & Slider Control */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>Dự báo hoàn thành theo kế hoạch</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Tính toán theo vận tốc học đều {hours} giờ/ngày (6 ngày/tuần, nghỉ CN).
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-1.5 shrink-0 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-700">Học đều</span>
          <Slider
            className="w-24 sm:w-32"
            value={[hours]}
            min={0}
            max={12}
            step={0.5}
            onValueChange={(v) => handleHoursChange(v[0])}
          />
          <Input
            type="number"
            min={0}
            max={12}
            step={0.5}
            value={hours}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) handleHoursChange(Math.min(12, Math.max(0, n)));
            }}
            className="w-20 min-w-[80px] h-7 px-3 text-center text-xs font-bold rounded-lg border-slate-300 bg-white"
          />
          <span className="text-xs text-slate-500 font-medium">h/ngày</span>
        </div>
      </div>

      {/* KPI Stats in 1 Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 rounded-xl border border-slate-200/60 bg-slate-50/60 p-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">🎯</span>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-500">Dự kiến hoàn thành</div>
            <div className="text-xs sm:text-sm font-bold text-emerald-700 truncate">{planCompletionText}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">📚</span>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-500">Bài còn lại</div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 truncate">{fc.remaining} bài</div>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">⏱️</span>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-500">Tổng khối lượng</div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 truncate">
              {fc.totalNewHours + fc.totalReviewHours}h <span className="text-[10px] font-normal text-slate-500 hidden sm:inline">({fc.totalNewHours}h mới + {fc.totalReviewHours}h ôn)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">🟢</span>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-500">Mức tin cậy</div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 truncate">{confidenceLabel}</div>
          </div>
        </div>
      </div>

      {/* Mini Progress Bars for Subjects */}
      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 shrink-0 text-[11px] font-medium">
          <span>Tiến độ còn lại:</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 shrink-0 w-full sm:w-auto sm:min-w-[380px] max-w-xl">
          {remainingBySubject.map((item) => {
            const pct = item.total > 0 ? Math.round((item.done / item.total) * 100) : 0;
            return (
              <div key={item.subject.id} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="truncate font-semibold text-slate-700 flex items-center gap-1">
                    <span>{item.subject.emoji}</span>
                    <span className="hidden sm:inline">{item.subject.name}</span>
                  </span>
                  <span className="font-bold text-sky-700 text-[10px] sm:text-[11px] shrink-0">{pct}% ({item.done}/{item.total})</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-[10px] italic text-slate-400 text-right pt-0.5">
        Ước tính dựa trên {basisLabel} (~{fc.meanMinutes}p/bài).
      </div>
    </section>
  );
}
