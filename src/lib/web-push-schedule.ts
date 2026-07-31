import { addDaysISO, todayISO } from "./date-utils";
import { buildFlexiblePlan, findLessonById, findLessonPosition } from "./planner";
import type { Subject } from "./mock-data";
import type { ProgressState } from "./progress-store";
import type { PushPreferences } from "./push-notification-store";
import type { ScheduledWebPush, WebPushPayload } from "./web-push-shared";

function localDateTimeISO(dateISO: string, hhmm: string): string | null {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return null;
  const date = new Date(`${dateISO}T${hhmm}:00`);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function addJob(
  jobs: ScheduledWebPush[],
  id: string,
  sendAt: string | null,
  payload: WebPushPayload,
) {
  if (!sendAt || Date.parse(sendAt) <= Date.now() + 60_000) return;
  jobs.push({ id, sendAt, payload });
}

export function buildScheduledWebPushJobs(args: {
  state: ProgressState;
  subjects: Subject[];
  preferences: PushPreferences;
  horizonDays?: number;
}): ScheduledWebPush[] {
  const { state, subjects, preferences } = args;
  if (!preferences.enabled) return [];
  const horizonDays = Math.min(14, Math.max(1, args.horizonDays ?? 7));
  const start = todayISO();
  const days = buildFlexiblePlan({
    subjects,
    completed: state.completedLessons,
    meta: state.studyMeta,
    settings: state.plannerSettings,
    fromISO: start,
    horizonDays,
  });
  const jobs: ScheduledWebPush[] = [];

  for (const day of days) {
    const lesson =
      day.queue.newLessons[0] ??
      (day.queue.reviewLessons[0]
        ? findLessonById(day.queue.reviewLessons[0].lessonId, subjects)
        : undefined);
    if (lesson && preferences.morningEnabled) {
      const position = findLessonPosition(subjects, lesson.id);
      addJob(
        jobs,
        `morning-${day.dateISO}-${lesson.id}`,
        localDateTimeISO(day.dateISO, preferences.morningTime),
        {
          title: "Bài học trong kế hoạch hôm nay",
          body: `${position?.subject.name ?? lesson.sourceSubject}: ${lesson.title} · khoảng ${lesson.plannedDurationMinutes} phút.`,
          tag: `study-${day.dateISO}`,
          lessonId: lesson.id,
          url: `/?view=today&focusLesson=${encodeURIComponent(lesson.id)}`,
        },
      );
    }

    if (lesson && preferences.eveningEnabled) {
      const position = findLessonPosition(subjects, lesson.id);
      addJob(
        jobs,
        `evening-${day.dateISO}-${lesson.id}`,
        localDateTimeISO(day.dateISO, preferences.eveningTime),
        {
          title: "Đến giờ bắt đầu học",
          body: `${position?.subject.name ?? lesson.sourceSubject}: ${lesson.title} · bắt đầu bằng một phiên ngắn nếu cần.`,
          tag: `evening-${day.dateISO}`,
          lessonId: lesson.id,
          url: `/?view=today&focusLesson=${encodeURIComponent(lesson.id)}`,
        },
      );
    }

    if (preferences.enableStreakGuard) {
      addJob(
        jobs,
        `streak-${day.dateISO}`,
        localDateTimeISO(day.dateISO, preferences.endOfDayTime),
        {
          title: "Kiểm tra tiến độ học hôm nay",
          body: "Mở kế hoạch để xem bài còn lại và duy trì nhịp học đều đặn.",
          tag: `streak-${day.dateISO}`,
          url: "/?view=today",
          urgent: true,
        },
      );
    }

    for (const habit of state.habitDefinitions) {
      if (habit.archived) continue;
      const reminder = state.reminders[habit.id];
      if (!reminder?.enabled) continue;
      const date = new Date(`${day.dateISO}T12:00:00`);
      const mondayIndex = (date.getDay() + 6) % 7;
      const target = habit.dailyTargets[mondayIndex] ?? habit.target;
      if (target <= 0) continue;
      addJob(
        jobs,
        `habit-${day.dateISO}-${habit.id}`,
        localDateTimeISO(day.dateISO, reminder.time),
        {
          title: `Nhắc thói quen: ${habit.name}`,
          body:
            habit.kind === "counter"
              ? `Mục tiêu hôm nay: ${target}.`
              : "Đánh dấu khi bạn hoàn thành.",
          tag: `habit-${habit.id}-${day.dateISO}`,
          url: "/?view=today#habits",
        },
      );
    }
  }

  return jobs.sort((a, b) => a.sendAt.localeCompare(b.sendAt)).slice(0, 100);
}

export function nextScheduleRefreshISO(days = 6): string {
  return new Date(`${addDaysISO(todayISO(), days)}T00:05:00`).toISOString();
}
