import { Check, Clock, Target } from "lucide-react";
import type { WeeklyMetrics } from "@/lib/weekly-metrics";

type Props = {
  metrics: WeeklyMetrics;
};

export function WeeklyChart({ metrics }: Props) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-soft backdrop-blur sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
          <Target size={20} />
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-slate-800">Mục tiêu tuần</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Tỷ lệ bài học và thói quen được hiển thị riêng; không có điểm tổng hợp.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricProgress
          label="Bài học theo kế hoạch"
          completed={metrics.lessons.metTotal}
          target={metrics.lessons.targetTotal}
          rate={metrics.lessons.rate}
          tone="emerald"
        />
        <MetricProgress
          label="Thói quen có mục tiêu tuần"
          completed={metrics.habits.completedTotal}
          target={metrics.habits.targetTotal}
          rate={metrics.habits.rate}
          tone="teal"
        />
      </div>

      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
          Chi tiết thói quen
        </h3>
        <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
          {metrics.habits.details.map((habit) => (
            <article
              key={habit.id}
              className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-xs font-semibold text-slate-800">
                  {habit.name}
                </span>
                {habit.met && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
              </div>
              {habit.target > 0 ? (
                <>
                  <p className="mt-1 text-xs text-slate-600">
                    {habit.cappedOccurrences}/{habit.target} lần ({habit.rate}%)
                  </p>
                  <ProgressBar rate={habit.rate} tone="bg-teal-500" />
                </>
              ) : (
                <p className="mt-1 text-xs text-slate-600">
                  Chưa đặt mục tiêu tuần
                  {habit.occurrences > 0 ? ` · đã ghi ${habit.occurrences} lần` : ""}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-900">
          <Clock className="h-4 w-4" /> Phiên tập trung theo ngày
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {metrics.dates.map((dateISO) => (
            <div
              key={dateISO}
              className="rounded-xl bg-white/80 p-2 text-center text-[10px] text-slate-700"
            >
              <div className="font-semibold">
                {dateISO.slice(8, 10)}/{dateISO.slice(5, 7)}
              </div>
              <div className="mt-1">{metrics.time.dailyActualMinutes[dateISO]}p</div>
              <div className="text-slate-500">/ {metrics.time.dailyTargetMinutes[dateISO]}p</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricProgress({
  label,
  completed,
  target,
  rate,
  tone,
}: {
  label: string;
  completed: number;
  target: number;
  rate: number;
  tone: "emerald" | "teal";
}) {
  const color = tone === "emerald" ? "bg-emerald-500" : "bg-teal-500";
  return (
    <article className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <p className="text-xs font-semibold text-slate-700">{label}</p>
      <p className="mt-1.5 font-serif text-2xl font-bold text-slate-900">
        {completed}/{target}
      </p>
      <p className="text-xs text-slate-600">{rate}%</p>
      <ProgressBar rate={rate} tone={color} />
    </article>
  );
}

function ProgressBar({ rate, tone }: { rate: number; tone: string }) {
  const boundedRate = Math.min(100, Math.max(0, rate));
  return (
    <div
      className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
      role="progressbar"
      aria-label="Tiến độ mục tiêu tuần"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={boundedRate}
    >
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${boundedRate}%` }} />
    </div>
  );
}
