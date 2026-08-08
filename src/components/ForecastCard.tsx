import { useMemo } from "react";
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
import { selectForecastCompletion } from "@/lib/forecast-view-model";

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
  const fc = useMemo(() => selectForecastCompletion({ subjects, state }), [subjects, state]);
  const hours = fc.hoursPerDay;

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
  }[fc.confidence];

  const basisLabel = {
    planned: "thời lượng kế hoạch",
    mixed: "kế hoạch và phiên học thực tế",
    actual: "các phiên học thực tế",
  }[fc.basis];

  const planCompletionText =
    fc.completion.kind === "complete"
      ? "Đã hoàn thành tất cả! 🎉"
      : fc.completion.kind === "no-capacity"
        ? "Chưa có quỹ giờ để dự báo"
        : fc.completion.kind === "date"
          ? displayDate(fc.completion.startISO)
          : `${displayDate(fc.completion.startISO)} – ${displayDate(fc.completion.endISO)}`;

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

        <div className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-1.5 sm:self-auto">
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
              {fc.remainingLessons} bài
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-start gap-2">
          <span className="mt-0.5 shrink-0 text-base">⏱️</span>
          <div className="min-w-0">
            <div className="text-[10px] font-medium text-slate-500 sm:text-[11px]">
              Tổng khối lượng dự kiến
            </div>
            <div className="text-xs font-bold text-slate-800 sm:text-sm">
              {formatHours(fc.totalWorkloadHours)} giờ
            </div>
            <div className="mt-0.5 text-[10px] leading-tight text-slate-500">
              {formatHours(fc.totalNewHours)} giờ bài mới + {formatHours(fc.totalReviewHours)} giờ
              ôn
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
        Ước tính dựa trên {basisLabel} (~{fc.meanMinutes}p/bài).
      </div>
    </section>
  );
}
