import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SUBJECTS, type Lesson, type Subject } from "@/lib/mock-data";
import { buildFlexiblePlan, findLessonById, findLessonPosition, type PlanDay } from "@/lib/planner";
import type { ProgressState } from "@/lib/progress-store";
import { daysBetweenISO, displayDate, getSundayISO, todayISO, weekdayVi } from "@/lib/date-utils";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sortLessonsBySubjectPriority } from "@/lib/subject-order";

type Props = {
  state: ProgressState;
  subjects?: Subject[];
  onSetDayHours: (dateISO: string, hours: number | null) => void;
  onSetDefaultDailyHours?: (hours: number) => void;
};

type DisplayLesson = {
  id: string;
  lesson: Lesson;
  subjectId: string;
  subjectName: string;
  subjectEmoji: string;
  topic: string;
  reviewAgeDays?: number;
};

type WeekGroup = {
  id: string;
  number: number;
  startISO: string;
  endISO: string;
  days: PlanDay[];
};

export function FlexiblePlanner({
  state,
  subjects = SUBJECTS,
  onSetDayHours,
}: Props) {
  const [numWeeks, setNumWeeks] = useState(2);
  const [userToggledWeeks, setUserToggledWeeks] = useState<Record<string, boolean>>({});
  const today = todayISO();

  const horizonDays = useMemo(() => {
    const sunday = getSundayISO(today);
    return daysBetweenISO(today, sunday) + 1 + (numWeeks - 1) * 7;
  }, [today, numWeeks]);

  const days = useMemo(
    () =>
      buildFlexiblePlan({
        subjects,
        completed: state.completedLessons,
        reviewCompletions: state.reviewCompletions,
        meta: state.studyMeta,
        settings: state.plannerSettings,
        fromISO: today,
        horizonDays,
      }),
    [
      subjects,
      state.completedLessons,
      state.reviewCompletions,
      state.studyMeta,
      state.plannerSettings,
      today,
      horizonDays,
    ],
  );

  const weeks = useMemo<WeekGroup[]>(() => {
    const groups: WeekGroup[] = [];
    for (const day of days) {
      const shouldStartWeek = groups.length === 0 || weekdayVi(day.dateISO) === "T2";
      if (shouldStartWeek) {
        groups.push({
          id: day.dateISO,
          number: groups.length + 1,
          startISO: day.dateISO,
          endISO: getSundayISO(day.dateISO),
          days: [],
        });
      }
      groups.at(-1)?.days.push(day);
    }
    return groups;
  }, [days]);

  const displayLessonsForDay = (day: PlanDay): DisplayLesson[] => {
    const items: DisplayLesson[] = [];
    for (const lesson of sortLessonsBySubjectPriority(day.queue.newLessons)) {
      const position = findLessonPosition(subjects, lesson.id);
      items.push({
        id: lesson.id,
        lesson,
        subjectId: position?.subject.id ?? "unknown",
        subjectName: position?.subject.name ?? lesson.sourceSubject,
        subjectEmoji: position?.subject.emoji ?? "📚",
        topic:
          lesson.topic ||
          (position?.milestone && position.milestone !== "Toàn bộ bài học"
            ? position.milestone
            : ""),
      });
    }
    for (const review of day.queue.reviewLessons) {
      const lesson = findLessonById(review.lessonId, subjects);
      if (!lesson) continue;
      const position = findLessonPosition(subjects, lesson.id);
      items.push({
        id: `review-${lesson.id}`,
        lesson,
        subjectId: position?.subject.id ?? "unknown",
        subjectName: position?.subject.name ?? lesson.sourceSubject,
        subjectEmoji: position?.subject.emoji ?? "📚",
        topic:
          lesson.topic ||
          (position?.milestone && position.milestone !== "Toàn bộ bài học"
            ? position.milestone
            : ""),
        reviewAgeDays: review.ageDays,
      });
    }
    return items;
  };

  const toggleWeek = (id: string, isCurrentlyCollapsed: boolean) => {
    setUserToggledWeeks((prev) => ({
      ...prev,
      [id]: !isCurrentlyCollapsed,
    }));
  };

  return (
    <section className="min-w-0 space-y-4">
      {/* Accordion List các tuần */}
      <div className="space-y-3">
        {weeks.map((week, idx) => {
          // Mặc định: Tuần 1 (idx === 0) MỞ (collapsed = false), các tuần sau GẬP (collapsed = true)
          const collapsed =
            userToggledWeeks[week.id] !== undefined ? userToggledWeeks[week.id] : idx > 0;

          return (
            <section
              key={week.id}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggleWeek(week.id, collapsed)}
                aria-expanded={!collapsed}
                className="flex min-h-14 w-full items-center gap-3 bg-gradient-to-r from-emerald-50/90 via-sky-50/50 to-white px-4 py-3 text-left transition hover:brightness-[0.98]"
              >
                {collapsed ? (
                  <ChevronRight className="h-5 w-5 shrink-0 text-emerald-700" />
                ) : (
                  <ChevronDown className="h-5 w-5 shrink-0 text-emerald-700" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-base">Tuần {week.number}</p>
                    {idx === 0 && (
                      <span className="rounded-full bg-emerald-600 px-2 py-0.2 text-[10px] font-bold text-white">
                        Tuần này
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-500 font-medium">
                    {weekdayVi(week.startISO)} {displayDate(week.startISO)} → CN{" "}
                    {displayDate(week.endISO)}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200/80 shadow-2xs">
                  {week.days.length} ngày
                </span>
              </button>

              {!collapsed && (
                <div className="grid gap-3 p-3.5 lg:grid-cols-2">
                  {week.days.map((day) => (
                    <PlanDayCard
                      key={day.dateISO}
                      day={day}
                      today={today}
                      lessons={displayLessonsForDay(day)}
                      onSetDayHours={onSetDayHours}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between px-1">
        <span>
          Hiển thị {numWeeks} tuần · {days.length} ngày · đến{" "}
          {displayDate(days.at(-1)?.dateISO ?? today)}
        </span>
        <div className="grid grid-cols-3 gap-1.5 sm:flex">
          <button
            className="min-h-9 rounded-lg border border-slate-200 bg-white px-2.5 font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs"
            onClick={() => setNumWeeks((value) => Math.max(1, value - 1))}
          >
            − 1 tuần
          </button>
          <button
            className="min-h-9 rounded-lg border border-slate-200 bg-white px-2.5 font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs"
            onClick={() => setNumWeeks((value) => Math.min(52, value + 1))}
          >
            + 1 tuần
          </button>
          <select
            aria-label="Số tuần hiển thị"
            value={numWeeks}
            onChange={(event) => setNumWeeks(Number(event.target.value))}
            className="min-h-9 rounded-lg border border-slate-200 bg-white px-2 font-semibold text-slate-700 shadow-2xs"
          >
            {[1, 2, 4, 8, 12, 16, 24, 36, 52].map((weeksCount) => (
              <option key={weeksCount} value={weeksCount}>
                {weeksCount} tuần
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

function PlanDayCard({
  day,
  today,
  lessons,
  onSetDayHours,
}: {
  day: PlanDay;
  today: string;
  lessons: DisplayLesson[];
  onSetDayHours: (dateISO: string, hours: number | null) => void;
}) {
  const isToday = day.dateISO === today;
  return (
    <article
      className={cn(
        "min-w-0 rounded-xl p-3.5 space-y-2.5 border transition-colors",
        isToday ? "bg-emerald-50/50 border-emerald-200/80" : "bg-slate-50/70 border-slate-200/70",
      )}
    >
      <header className="space-y-1">
        {/* Hàng 1: Thứ & Ngày + Badge Hôm nay + Ô nhập giờ */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="font-bold text-slate-900 text-sm truncate">
              {weekdayVi(day.dateISO)} - {displayDate(day.dateISO)}
            </h4>
            {isToday && (
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shrink-0">
                Hôm nay
              </span>
            )}
          </div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 shrink-0">
            <Input
              type="number"
              aria-label={`Giờ học ngày ${displayDate(day.dateISO)}`}
              min={0}
              max={12}
              step={0.5}
              value={day.hours}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (Number.isFinite(value))
                  onSetDayHours(day.dateISO, Math.min(12, Math.max(0, value)));
              }}
              className="h-7 w-16 text-center text-xs font-bold bg-white border-slate-200 px-1 rounded-lg"
            />
            <span>giờ</span>
          </label>
        </div>

        {/* Hàng 2: Text mờ nhỏ gọn */}
        <p className="text-[11px] text-slate-500 font-medium">
          ⏱️ Công suất: {day.queue.quotaMinutes}p •{" "}
          {day.queue.overloadMinutes > 0
            ? `Quá: ${day.queue.overloadMinutes}p`
            : `Dự phòng: ${day.queue.unallocatedMinutes}p`}
        </p>
      </header>

      {/* Danh sách bài học */}
      {lessons.length > 0 ? (
        <ul className="space-y-2 pt-0.5">
          {lessons.map((item) => (
            <li
              key={item.id}
              className={cn(
                "rounded-lg border bg-white p-3 text-xs transition-colors hover:border-emerald-400",
                item.reviewAgeDays
                  ? "border-amber-200/90 bg-amber-50/40"
                  : "border-slate-200/80 bg-white",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="break-words font-medium text-slate-900 leading-snug">
                  {item.reviewAgeDays ? "↻ " : ""}
                  {item.lesson.title}
                </p>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 shrink-0">
                  {item.subjectEmoji} {item.subjectName}
                </span>
              </div>
              {(item.topic || item.reviewAgeDays) && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                  {item.topic && (
                    <span className="rounded bg-slate-100/80 px-1.5 py-0.5 text-slate-600 font-medium">
                      {item.topic}
                    </span>
                  )}
                  {item.reviewAgeDays && (
                    <span className="text-amber-800 font-medium">
                      ôn sau {item.reviewAgeDays} ngày
                    </span>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 p-3 text-center text-xs text-slate-500 font-medium">
          Không có bài được phân bổ.
        </div>
      )}
    </article>
  );
}
