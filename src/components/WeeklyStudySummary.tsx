import { BookOpen, CalendarClock, Check, CheckSquare, Clock, PieChart, Target } from "lucide-react";
import { todayISO } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { weeklyLessonCompletionLabel, type WeeklyMetrics } from "@/lib/weekly-metrics";

type Props = {
  metrics: WeeklyMetrics;
  todayTargetMinutes: number;
};

function minutesLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours > 0 ? `${hours} giờ ${remainder} phút` : `${remainder} phút`;
}

export function WeeklyStudySummary({ metrics, todayTargetMinutes }: Props) {
  const today = todayISO();
  const todayActualMinutes = metrics.time.dailyActualMinutes[today] ?? 0;
  const todayRate =
    todayTargetMinutes > 0
      ? Math.min(100, Math.round((todayActualMinutes / todayTargetMinutes) * 100))
      : 0;
  const datedRange = `${metrics.weekStartISO.slice(8, 10)}/${metrics.weekStartISO.slice(5, 7)} – ${metrics.weekEndISO.slice(8, 10)}/${metrics.weekEndISO.slice(5, 7)}`;
  const nonStandardTargets = metrics.lessons.targets.filter(
    (target) =>
      target.completionStatus === "completed-undated" ||
      target.completionStatus === "completed-after-week",
  );

  return (
    <div className="space-y-6">
      {/* Khối 1: Header + 4 Card KPI Top (Unwrapped, Card độc lập trên nền bg-slate-50) */}
      <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-100 text-sky-700">
              <PieChart size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-900">Tổng kết tuần</h2>
              <p className="text-xs text-slate-500 font-medium">
                Thứ 2 đến Chủ Nhật · {datedRange}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Bài học, thói quen và phiên tập trung được ghi nhận theo tuần độc lập.
          </p>
        </div>

        {/* 4 Ô KPIs */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <MetricCard
            icon={<CalendarClock size={16} />}
            label="Hôm nay"
            value={minutesLabel(todayActualMinutes)}
            detail={`Mục tiêu: ${minutesLabel(todayTargetMinutes)} (${todayRate}%)`}
            tone="emerald"
          />
          <MetricCard
            icon={<Clock size={16} />}
            label="Cả tuần"
            value={minutesLabel(metrics.time.actualMinutes)}
            detail={`Mục tiêu: ${minutesLabel(metrics.time.targetMinutes)} (${metrics.time.rate}%)`}
            tone="sky"
          />
          <MetricCard
            icon={<BookOpen size={16} />}
            label="Bài học theo kế hoạch"
            value={`${metrics.lessons.metTotal}/${metrics.lessons.targetTotal} bài`}
            detail={`${metrics.lessons.rate}% mục tiêu bài học`}
            tone="indigo"
          />
          <MetricCard
            icon={<Target size={16} />}
            label="Thói quen"
            value={`${metrics.habits.completedTotal}/${metrics.habits.targetTotal} lượt`}
            detail={`${metrics.habits.rate}% mục tiêu thói quen`}
            tone="amber"
          />
        </div>
      </div>

      {/* Thông tin thông báo phụ nếu có */}
      {(nonStandardTargets.length > 0 ||
        metrics.lessons.outOfPlanCompletions.length > 0 ||
        metrics.archivedActivity.length > 0) && (
        <div className="space-y-3">
          {nonStandardTargets.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-700 shadow-xs">
              <p className="font-semibold text-slate-800">Trạng thái bài học cần lưu ý</p>
              <ul className="mt-1 space-y-1">
                {nonStandardTargets.map((target) => (
                  <li key={target.lessonId} className="text-slate-600">
                    <strong className="text-slate-800">{target.lessonId}:</strong>{" "}
                    {weeklyLessonCompletionLabel(target.completionStatus)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {metrics.lessons.outOfPlanCompletions.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-950 shadow-xs">
              <p className="font-semibold">Bài hoàn thành trong tuần nhưng ngoài kế hoạch tuần</p>
              <p className="mt-1">
                {metrics.lessons.outOfPlanCompletions.map((item) => item.lessonId).join(", ")}
              </p>
            </div>
          )}

          {metrics.archivedActivity.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-950 shadow-xs">
              <p className="font-semibold">Hoạt động từ bài đã xóa khỏi lộ trình</p>
              <ul className="mt-1 space-y-1">
                {metrics.archivedActivity.map((activity) => (
                  <li key={activity.lessonId}>
                    {activity.lessonId}
                    {activity.completedOn ? ` · hoàn thành ${activity.completedOn}` : ""}
                    {activity.focusMinutes > 0
                      ? ` · ${minutesLabel(activity.focusMinutes)} tập trung`
                      : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Bố cục 2 cột Responsive (Desktop: Cột trái ~60% | Cột phải ~40%) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Cột trái (~60% / col-span-7): Biểu đồ tập trung + Tiến độ theo môn */}
        <div className="space-y-6 lg:col-span-7">
          {/* Card 1: Biểu đồ Phiên tập trung theo ngày (Vertical Bar Chart) */}
          <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-sky-100 text-sky-700">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Phiên tập trung theo ngày</h3>
                  <p className="text-xs text-slate-500">
                    Thời gian học thực tế so với mục tiêu từng ngày
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700 border border-sky-200/60">
                {minutesLabel(metrics.time.actualMinutes)}
              </span>
            </div>

            {/* Vertical Bar Chart */}
            <WeeklyFocusBarChart metrics={metrics} />
          </div>

          {/* Card 2: Tiến độ Theo môn học */}
          <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-100 text-indigo-700">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tiến độ theo môn học</h3>
                  <p className="text-xs text-slate-500">Mức độ hoàn thành các bài học theo môn</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                {metrics.subjects.length} môn
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {metrics.subjects.map((subject) => (
                <article
                  key={subject.id}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="min-w-0 truncate text-sm font-bold text-slate-800">
                      {subject.emoji} {subject.name}
                    </h4>
                    <span className="shrink-0 text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                      {minutesLabel(subject.focusMinutes)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>
                      {subject.metLessons}/{subject.targetLessons} bài kế hoạch
                    </span>
                    <span className="font-bold text-slate-800">{subject.lessonRate}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, subject.lessonRate))}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Cột phải (~40% / col-span-5): Ma trận Chi tiết thói quen 7 ngày */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100 text-amber-700">
                  <CheckSquare size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Chi tiết thói quen</h3>
                  <p className="text-xs text-slate-500">Ma trận theo dõi 7 ngày trong tuần</p>
                </div>
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200/60">
                {metrics.habits.completedTotal}/{metrics.habits.targetTotal} lượt
              </span>
            </div>

            {/* Weekly Habit Grid */}
            <WeeklyHabitGrid habits={metrics.habits.details} />
          </div>
        </div>
      </div>
    </div>
  );
}

{
  /* Biểu đồ Cột Đứng: Phiên tập trung theo ngày */
}
function WeeklyFocusBarChart({ metrics }: { metrics: WeeklyMetrics }) {
  const DAY_NAMES = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="pt-1">
      {/* Khung chứa các cột biểu đồ */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-3 items-end h-44 pt-7 pb-2 px-1.5 bg-slate-50/90 rounded-xl border border-slate-100">
        {metrics.dates.map((dateISO, idx) => {
          const actual = metrics.time.dailyActualMinutes[dateISO] ?? 0;
          const target = metrics.time.dailyTargetMinutes[dateISO] ?? 360;
          const rate = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
          const dayName = DAY_NAMES[idx] ?? `T${idx + 2}`;
          const formattedDate = `${dateISO.slice(8, 10)}/${dateISO.slice(5, 7)}`;
          const isMet = actual >= target && target > 0;

          return (
            <div
              key={dateISO}
              className="flex flex-col items-center h-full justify-end group relative"
            >
              {/* Floating Tooltip khi hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 text-[10px] font-bold bg-slate-800 text-white px-2 py-0.5 rounded pointer-events-none z-10 whitespace-nowrap shadow-sm">
                {actual}p / {target}p ({rate}%)
              </div>

              {/* Khung Cột ngoài */}
              <div className="w-full max-w-[34px] bg-slate-200/70 rounded-t-lg h-full flex items-end overflow-hidden relative">
                {/* Thanh phần trăm hoàn thành */}
                <div
                  className={cn(
                    "w-full rounded-t-lg transition-all duration-500 ease-out",
                    isMet
                      ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                      : actual > 0
                        ? "bg-gradient-to-t from-sky-600 to-sky-400"
                        : "bg-transparent",
                  )}
                  style={{ height: `${Math.max(rate, actual > 0 ? 8 : 0)}%` }}
                />
              </div>

              {/* Nhãn Thứ / Ngày & Số phút ở dưới */}
              <div className="mt-2 text-center w-full min-w-0">
                <div className="text-xs font-bold text-slate-800">{dayName}</div>
                <div className="text-[10px] text-slate-500">{formattedDate}</div>
                <div
                  className={cn(
                    "text-[10px] font-bold mt-0.5 truncate",
                    isMet ? "text-emerald-600" : actual > 0 ? "text-sky-700" : "text-slate-500",
                  )}
                >
                  {actual}p/{target}p
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

{
  /* Bảng Ma Trận Chi Tiết Thói Quen 7 Ngày */
}
function WeeklyHabitGrid({ habits }: { habits: WeeklyMetrics["habits"]["details"] }) {
  if (habits.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
        Chưa có thói quen nào được theo dõi. Hãy tạo thói quen ở tab Hôm nay.
      </div>
    );
  }

  const DAY_NAMES = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="space-y-3 overflow-x-auto">
      {/* Header Hàng ngày của ma trận */}
      <div className="flex items-center justify-between min-w-[300px] pb-2 border-b border-slate-100 px-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <span className="min-w-0 flex-1">Thói quen</span>
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center w-[190px] sm:w-[210px] shrink-0">
          {DAY_NAMES.map((day) => (
            <span key={day} className="text-[11px] text-slate-600 font-bold">
              {day}
            </span>
          ))}
        </div>
      </div>

      {/* Danh sách các Hàng thói quen */}
      <div className="space-y-2 min-w-[300px]">
        {habits.map((habit) => {
          const occurrences = habit.occurrences;
          const target = habit.target;
          const isTargetMet = target > 0 && occurrences >= target;

          return (
            <div
              key={habit.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-2 sm:p-2.5 hover:bg-slate-50 transition-colors"
            >
              {/* Tên thói quen + Badge lượt */}
              <div className="min-w-0 flex-1 space-y-0.5">
                <div
                  className="font-semibold text-xs sm:text-sm text-slate-800 truncate"
                  title={habit.name}
                >
                  {habit.name}
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "inline-block rounded-md px-1.5 py-0.2 text-[10px] font-bold border",
                      isTargetMet
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200",
                    )}
                  >
                    {target > 0 ? `${occurrences}/${target} lượt` : `${occurrences} lượt`}
                  </span>
                </div>
              </div>

              {/* Ma trận 7 chấm tròn đại diện T2 - CN */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5 w-[190px] sm:w-[210px] shrink-0 place-items-center">
                {habit.dailyLog.map((day) => (
                  <div
                    key={day.dateISO}
                    className="flex items-center justify-center"
                    title={`${day.dayLabel} (${day.dateISO.slice(8, 10)}/${day.dateISO.slice(5, 7)}): ${day.completed ? "Đã hoàn thành" : "Chưa thực hiện"}`}
                  >
                    {day.completed ? (
                      <div className="h-6 w-6 sm:h-6.5 sm:w-6.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs transition-transform hover:scale-110">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 sm:h-6.5 sm:w-6.5 rounded-full bg-slate-200/70 border border-slate-300/60 text-slate-300 flex items-center justify-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  tone: "sky" | "indigo" | "amber" | "emerald";
}) {
  const tones = {
    sky: "border-sky-200/80 bg-sky-50/60 text-sky-900",
    indigo: "border-indigo-200/80 bg-indigo-50/60 text-indigo-900",
    amber: "border-amber-200/80 bg-amber-50/60 text-amber-900",
    emerald: "border-emerald-200/80 bg-emerald-50/60 text-emerald-900",
  }[tone];
  return (
    <article className={`rounded-xl border p-3.5 ${tones}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold">
        {icon}
        {label}
      </div>
      <p className="mt-1.5 font-serif text-xl font-bold">{value}</p>
      <p className="mt-1 text-[11px] opacity-80 font-medium">{detail}</p>
    </article>
  );
}
