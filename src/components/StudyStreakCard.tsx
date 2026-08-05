import { CheckCircle2, Circle, Flame, Info, Target } from "lucide-react";
import { type Subject } from "@/lib/mock-data";
import { isStudyDay, type ProgressState } from "@/lib/progress-store";
import { addDaysISO, todayISO, weekdayVi } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

type Props = {
  studyStreak: number;
  state: ProgressState;
  // Kept for the existing parent contract; streak evidence never depends on the catalog.
  subjects?: Subject[];
};

export function StudyStreakCard({ studyStreak, state }: Props) {
  const today = todayISO();
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const dateISO = addDaysISO(today, index - 6);
    return {
      dateISO,
      label: weekdayVi(dateISO),
      done: isStudyDay(state, dateISO),
      isToday: dateISO === today,
    };
  });

  const message =
    studyStreak > 0
      ? `Bạn có ${studyStreak} ngày học liên tiếp tính đến hôm nay.`
      : "Chưa có ngày học liên tiếp tính đến hôm nay.";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-sky-50/80 to-purple-50/90 p-4 shadow-soft sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-[200px] items-center gap-3.5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 text-white shadow-soft">
            <Flame size={26} className="fill-white/30 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
              <Target size={14} className="text-amber-500" />
              <span>NGÀY HỌC LIÊN TIẾP</span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-1.5 font-serif text-2xl font-bold text-slate-900">
              <span>{studyStreak}</span>
              <span className="font-sans text-sm font-medium text-slate-600">ngày</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-2xl border border-indigo-100/60 bg-white/80 p-2 shadow-2xs backdrop-blur">
          {weekDays.map((day) => (
            <div
              key={day.dateISO}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-2.5 py-1",
                day.isToday &&
                  (day.done ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"),
              )}
            >
              <span className="text-[10px] font-semibold text-slate-500">{day.label}</span>
              {day.done ? (
                <CheckCircle2 size={16} className="fill-emerald-100 text-emerald-500" />
              ) : (
                <Circle size={16} className="text-slate-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-indigo-100/80 bg-white/80 p-3 text-xs text-slate-700 shadow-2xs">
        <p className="font-medium text-indigo-900">{message}</p>
        <p className="mt-1 flex items-start gap-1.5 text-slate-600">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
          Một ngày chỉ được ghi nhận khi bạn hoàn thành toàn bộ bài mới và bài ôn trong hàng đợi\n          hôm nay. Học một phần hoặc chỉ chạy Pomodoro chưa làm tăng chuỗi.
        </p>
      </div>
    </section>
  );
}
