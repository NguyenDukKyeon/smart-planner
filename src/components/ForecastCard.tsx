import { useMemo, useState } from "react";
import { SUBJECTS, type Subject } from "@/lib/mock-data";
import type { ProgressState } from "@/lib/progress-store";
import { displayDate } from "@/lib/date-utils";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { sortSubjects } from "@/lib/subject-order";
import {
  DAILY_STUDY_HOURS_STEP,
  MAX_DAILY_STUDY_HOURS,
  MIN_DAILY_STUDY_HOURS,
  normalizeDailyStudyHours,
} from "@/lib/study-hours";
import { HighStudyHoursNote } from "@/components/HighStudyHoursNote";
import {
  selectForecastViewModel,
  type ForecastHorizonWeeks,
} from "@/lib/forecast-view-model";

type Props = {
  state: ProgressState;
  subjects?: Subject[];
  onSetDefaultDailyHours?: (hours: number) => void;
  shiftedDates?: Record<string, string>;
};

const HOUR_FORMATTER = new Intl.NumberFormat("vi-VN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

function formatHours(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return HOUR_FORMATTER.format(Math.round(Math.max(0, value) * 10) / 10);
}

export function ForecastCard({ state, subjects = SUBJECTS, onSetDefaultDailyHours }: Props) {
  const [horizonWeeks, setHorizonWeeks] = useState<ForecastHorizonWeeks>(2);
  const vm = useMemo(
    () => selectForecastViewModel({ subjects, state, horizonWeeks }),
    [subjects, state, horizonWeeks],
  );
  const hours = vm.hoursPerDay;

  const handleHoursChange = (h: number) => {
    if (onSetDefaultDailyHours) {
      onSetDefaultDailyHours(normalizeDailyStudyHours(h));
    }
  };

  const remainingBySubject = useMemo(() => {
    const sorted = sortSubjects(subjects);
    return sorted.map((subject) => {
      const lessons = subject.milestones.flatMap((milestone) => milestone.lessons);
      const total = lessons.length;
      const done = lessons.filter((lesson) => state.completedLessons[lesson.id]).length;
      const remaining = Math.max(0, total - done);
      return { subject, total, done, remaining };
    });
  }, [subjects, state.completedLessons]);

  const confidenceLabel = {
    insufficient: "Chưa đủ dữ liệu thực tế",
    low: "Độ tin cậy thấp",
    medium: "Độ tin cậy vừa",
    high: "Độ tin cậy cao",
  }[vm.confidence];

  const basisLabel = {
    planned: "thời lượng kế hoạch",
    mixed: "kế hoạch và phiên học thực tế",
    actual: "các phiên học thực tế",
  }[vm.basis];

  const planCompletionText =
    vm.completion.kind === "complete"
      ? "Đã hoàn thành tất cả! 🎉"
      : vm.completion.kind === "no-capacity"
        ? "Chưa có quỹ giờ để dự báo"
        : vm.completion.kind === "date"
          ? displayDate(vm.completion.startISO)
          : `${displayDate(vm.completion.startISO)} – ${displayDate(vm.completion.endISO)}`;

  const outsideHorizonText =
    vm.outsideHorizonLessons > 0
      ? `Có ${vm.outsideHorizonLessons} bài chưa hoàn thành nằm ngoài phạm vi ${vm.horizonWeeks} tuần đang xem.`
      : `Tất cả bài chưa hoàn thành đều nằm trong phạm vi ${vm.horizonWeeks} tuần đang xem.`;

  return (
    <section className="min-w-0 space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-4.5">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-slate-900 sm:text-xl">
            <span>Dự báo hoàn thành theo kế hoạch</span>
          </h2>
          <p className="text-[11px] text-slate-500 sm:text-xs">
            Tính toán theo vận tốc học đều {hours} giờ/ngày (6 ngày/tuần, nghỉ CN).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:justify-end sm:self-auto">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-700">
            <span>Phạm vi đang xem</span>
            <select
              aria-label="Phạm vi dự báo"
              value={horizonWeeks}
              onChange={(event) =>
                setHorizonWeeks(Number(event.target.value) as ForecastHorizonWeeks)
              }
              className="h-7 rounded-lg border border-slate-300 bg-white px-2 text-xs font-bold text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <option value={2}>2 tuần</option>
              <option value={4}>4 tuần</option>
              <option value={8}>8 tuần</option>
              <option value={12}>12 tuần</option>
            </select>
          </label>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-1.5">
            <span className="text-xs font-semibold text-slate-700">Học đều</span>
            <Slider
              className="w-24 sm:w-32"
              value={[hours]}
              min={MIN_DAILY_STUDY_HOURS}
              max={MAX_DAILY_STUDY_HOURS}
              step={DAILY_STUDY_HOURS_STEP}
              onValueChange={(value) => handleHoursChange(value[0])}
            />
            <Input
              type="number"
              min={MIN_DAILY_STUDY_HOURS}
              max={MAX_DAILY_STUDY_HOURS}
              step={DAILY_STUDY_HOURS_STEP}
              value={hours}
              onChange={(event) => {
                const nextHours = Number(event.target.value);
                if (Number.isFinite(nextHours)) {
                  handleHoursChange(normalizeDailyStudyHours(nextHours));
                }
              }}
              className="h-7 w-20 min-w-[80px] rounded-lg border-slate-300 bg-white px-3 text-center text-xs font-bold"
            />
            <span className="text-xs font-medium text-slate-500">h/ngày</span>
          </div>
        </div>
      </div>

      <HighStudyHoursNote hours={hours} />

      <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200/60 bg-slate-50/60 p-2.5 lg:grid-cols-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-base">🎯</span>
          <div className="min-w-0">
            <div className="text-[10px] font-medium text-slate-500 sm:text-[11px]">
              Dự kiến hoàn thành
            </div>
            <div className="truncate text-xs font-bold text-emerald-700 sm:text-sm">
              {planCompletionText}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-base">📚</span>
          <div className="min-w-0">
            <div className="text-[10px] font-medium text-slate-500 sm:text-[11px]">Bài còn lại</div>
            <div className="truncate text-xs font-bold text-slate-800 sm:text-sm">
              {vm.remainingLessons} bài
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-base">📖</span>
          <div className="min-w-0">
            <div className="text-[10px] font-medium text-slate-500 sm:text-[11px]">Bài mới</div>
            <div className="truncate text-xs font-bold text-slate-800 sm:text-sm">
              {formatHours(vm.totalNewHours)} giờ
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-base">🔁</span>
          <div className="min-w-0">
            <div className="text-[10px] font-medium text-slate-500 sm:text-[11px]">Ôn tập</div>
            <div className="truncate text-xs font-bold text-slate-800 sm:text-sm">
              {formatHours(vm.totalReviewHours)} giờ
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-base">⏱️</span>
          <div className="min-w-0">
            <div className="text-[10px] font-medium text-slate-500 sm:text-[11px]">
              Tổng khối lượng
            </div>
            <div className="truncate text-xs font-bold text-slate-800 sm:text-sm">
              {formatHours(vm.totalWorkloadHours)} giờ
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-base">⏳</span>
          <div className="min-w-0">
            <div className="text-[10px] font-medium text-slate-500 sm:text-[11px]">
              Quỹ giờ giả định
            </div>
            <div className="truncate text-xs font-bold text-slate-800 sm:text-sm">
              {formatHours(hours)} giờ/ngày
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-base">🗓️</span>
          <div className="min-w-0">
            <div className="text-[10px] font-medium text-slate-500 sm:text-[11px]">
              Phạm vi đang xem
            </div>
            <div className="truncate text-xs font-bold text-slate-800 sm:text-sm">
              {vm.horizonWeeks} tuần
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-base">🟢</span>
          <div className="min-w-0">
            <div className="text-[10px] font-medium text-slate-500 sm:text-[11px]">Mức tin cậy</div>
            <div className="truncate text-xs font-bold text-slate-800 sm:text-sm">
              {confidenceLabel}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`rounded-xl border p-3 text-xs ${
          vm.outsideHorizonLessons > 0
            ? "border-amber-200/80 bg-amber-50/70 text-amber-900"
            : "border-emerald-200/80 bg-emerald-50/70 text-emerald-900"
        }`}
      >
        <div className="font-semibold">
          {vm.outsideHorizonLessons > 0 ? "Ngoài phạm vi" : "Trong phạm vi"}
        </div>
        <div className="mt-0.5 leading-relaxed">{outsideHorizonText}</div>
      </div>

      <div className="space-y-2 pt-1">
        <div className="text-[11px] font-medium text-slate-500">Tiến độ theo môn</div>
        <div className="grid w-full gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {remainingBySubject.map((item) => {
            const percent = item.total > 0 ? Math.round((item.done / item.total) * 100) : 0;
            return (
              <div
                key={item.subject.id}
                className="min-w-0 rounded-xl border border-slate-200/70 bg-slate-50/60 p-2.5"
              >
                <div className="flex min-w-0 items-center justify-between gap-2 text-[11px]">
                  <span className="flex min-w-0 items-center gap-1.5 font-semibold text-slate-700">
                    <span className="shrink-0">{item.subject.emoji}</span>
                    <span className="truncate">{item.subject.name}</span>
                  </span>
                  <span className="shrink-0 font-bold text-sky-700">{percent}%</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-slate-500">
                  <span>
                    {item.done}/{item.total} bài đã xong
                  </span>
                  <span className="shrink-0">Còn {item.remaining}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-0.5 text-right text-[10px] italic text-slate-400">
        Ước tính dựa trên {basisLabel} (~{vm.meanMinutes}p/bài).
      </div>
    </section>
  );
}
