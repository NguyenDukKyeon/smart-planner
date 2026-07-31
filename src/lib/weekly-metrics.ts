import type { HabitDef, Subject } from "./mock-data";
import { addDaysISO, dayIndex, getMondayISO, isDateISO, todayISO } from "./date-utils";
import { UNDATED_COMPLETION, type ProgressState } from "./progress-store";
import { studySecondsOnDate } from "./study-sessions";
import { sortSubjects } from "./subject-order";

export type WeeklyLessonCompletionStatus =
  "not-completed" | "completed" | "completed-early" | "completed-undated" | "completed-after-week";

export type WeeklyMetrics = {
  weekStartISO: string;
  weekEndISO: string;
  dates: string[];
  lessons: {
    targetTotal: number;
    metTotal: number;
    rate: number;
    targets: Array<{
      lessonId: string;
      subjectId: string;
      scheduledDate: string;
      effectiveDate: string;
      completionDate?: string;
      completionStatus: WeeklyLessonCompletionStatus;
      met: boolean;
    }>;
    outOfPlanCompletions: Array<{ lessonId: string; subjectId: string; completedOn: string }>;
  };
  habits: {
    targetTotal: number;
    completedTotal: number;
    rate: number;
    details: Array<{
      id: string;
      name: string;
      target: number;
      occurrences: number;
      cappedOccurrences: number;
      rate: number;
      met: boolean;
      dailyLog: Array<{
        dateISO: string;
        dayLabel: string;
        completed: boolean;
      }>;
    }>;
  };
  time: {
    actualMinutes: number;
    targetMinutes: number;
    rate: number;
    dailyActualMinutes: Record<string, number>;
    dailyTargetMinutes: Record<string, number>;
  };
  subjects: Array<{
    id: string;
    name: string;
    emoji: string;
    targetLessons: number;
    metLessons: number;
    focusMinutes: number;
    lessonRate: number;
  }>;
  archivedActivity: Array<{
    lessonId: string;
    completedOn?: string;
    focusMinutes: number;
  }>;
};

export type WeeklyMetricsArgs = {
  state: ProgressState;
  subjects: Subject[];
  shiftedDates?: Record<string, string>;
  referenceDateISO?: string;
};

function percent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((numerator / denominator) * 100)));
}

function nonNegative(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

function habitOccurrenceOnDate(habit: HabitDef, state: ProgressState, dateISO: string): boolean {
  const dailyTarget = habit.dailyTargets[dayIndex(dateISO)] ?? habit.target;
  if (dailyTarget <= 0) return false;
  const value = state.habitLog[dateISO]?.[habit.id];
  return habit.kind === "counter"
    ? typeof value === "number" && value >= dailyTarget
    : value === true;
}

/**
 * The single weekly source of truth. It deliberately keeps lessons, habits,
 * and focus time separate instead of manufacturing a combined progress score.
 */
export function selectWeeklyMetrics({
  state,
  subjects,
  shiftedDates = {},
  referenceDateISO = todayISO(),
}: WeeklyMetricsArgs): WeeklyMetrics {
  const weekStartISO = getMondayISO(referenceDateISO);
  const dates = Array.from({ length: 7 }, (_, index) => addDaysISO(weekStartISO, index));
  const weekEndISO = dates[6];
  const weekDates = new Set(dates);
  const sortedSubjects = sortSubjects(subjects);
  const lessonSubject = new Map<
    string,
    { subjectId: string; lesson: Subject["milestones"][number]["lessons"][number] }
  >();

  for (const subject of sortedSubjects) {
    for (const milestone of subject.milestones) {
      for (const lesson of milestone.lessons) {
        lessonSubject.set(lesson.id, { subjectId: subject.id, lesson });
      }
    }
  }

  const subjectMetrics = new Map(
    sortedSubjects.map((subject) => [
      subject.id,
      {
        id: subject.id,
        name: subject.name,
        emoji: subject.emoji,
        targetLessons: 0,
        metLessons: 0,
        focusMinutes: 0,
        lessonRate: 0,
      },
    ]),
  );

  const targets: WeeklyMetrics["lessons"]["targets"] = [];
  const outOfPlanCompletions: WeeklyMetrics["lessons"]["outOfPlanCompletions"] = [];
  const archivedByLesson = new Map<
    string,
    { lessonId: string; completedOn?: string; focusMinutes: number }
  >();

  for (const { subjectId, lesson } of lessonSubject.values()) {
    const effectiveDate = shiftedDates[lesson.id] ?? lesson.scheduledDate;
    if (!weekDates.has(effectiveDate)) continue;

    const completionDate = state.completedLessons[lesson.id];
    const isUndated = completionDate === UNDATED_COMPLETION;
    const hasDatedCompletion = isDateISO(completionDate);
    const met = isUndated || (hasDatedCompletion && completionDate <= weekEndISO);
    const completionStatus: WeeklyLessonCompletionStatus = isUndated
      ? "completed-undated"
      : hasDatedCompletion && completionDate > weekEndISO
        ? "completed-after-week"
        : hasDatedCompletion && completionDate < effectiveDate
          ? "completed-early"
          : hasDatedCompletion
            ? "completed"
            : "not-completed";

    targets.push({
      lessonId: lesson.id,
      subjectId,
      scheduledDate: lesson.scheduledDate,
      effectiveDate,
      completionDate,
      completionStatus,
      met,
    });
    const subject = subjectMetrics.get(subjectId);
    if (subject) {
      subject.targetLessons += 1;
      if (met) subject.metLessons += 1;
    }
  }

  for (const [lessonId, completedOn] of Object.entries(state.completedLessons)) {
    if (!isDateISO(completedOn) || !weekDates.has(completedOn)) continue;
    const liveLesson = lessonSubject.get(lessonId);
    if (!liveLesson) {
      const archived = archivedByLesson.get(lessonId) ?? { lessonId, focusMinutes: 0 };
      archived.completedOn = completedOn;
      archivedByLesson.set(lessonId, archived);
      continue;
    }
    const effectiveDate = shiftedDates[lessonId] ?? liveLesson.lesson.scheduledDate;
    if (!weekDates.has(effectiveDate)) {
      outOfPlanCompletions.push({
        lessonId,
        subjectId: liveLesson.subjectId,
        completedOn,
      });
    }
  }

  const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const habits = state.habitDefinitions.filter((habit) => !habit.archived);
  const habitDetails = habits.map((habit) => {
    const target = nonNegative(state.goals.habitTargets[habit.id]);
    const occurrences = dates.reduce(
      (total, dateISO) => total + Number(habitOccurrenceOnDate(habit, state, dateISO)),
      0,
    );
    const cappedOccurrences = target > 0 ? Math.min(occurrences, target) : 0;
    const dailyLog = dates.map((dateISO, idx) => ({
      dateISO,
      dayLabel: DAY_LABELS[idx] ?? `T${idx + 2}`,
      completed: habitOccurrenceOnDate(habit, state, dateISO),
    }));
    return {
      id: habit.id,
      name: habit.name,
      target,
      occurrences,
      cappedOccurrences,
      rate: percent(cappedOccurrences, target),
      met: target > 0 && occurrences >= target,
      dailyLog,
    };
  });
  const habitTargetTotal = habitDetails.reduce((sum, habit) => sum + habit.target, 0);
  const habitCompletedTotal = habitDetails.reduce((sum, habit) => sum + habit.cappedOccurrences, 0);

  const dailyActualMinutes = Object.fromEntries(dates.map((dateISO) => [dateISO, 0]));
  const dailyTargetMinutes = Object.fromEntries(
    dates.map((dateISO) => {
      const override = state.plannerSettings.dailyHours[dateISO];
      const hours = override === undefined ? state.plannerSettings.defaultDailyHours : override;
      return [dateISO, Math.round(nonNegative(hours) * 60)];
    }),
  );

  for (const dateISO of dates) {
    for (const session of state.studySessions) {
      const minutes = Math.round(studySecondsOnDate([session], dateISO) / 60);
      if (minutes <= 0) continue;
      dailyActualMinutes[dateISO] += minutes;
      const liveLesson = lessonSubject.get(session.lessonId);
      if (liveLesson) {
        const subject = subjectMetrics.get(liveLesson.subjectId);
        if (subject) subject.focusMinutes += minutes;
      } else {
        const archived = archivedByLesson.get(session.lessonId) ?? {
          lessonId: session.lessonId,
          focusMinutes: 0,
        };
        archived.focusMinutes += minutes;
        archivedByLesson.set(session.lessonId, archived);
      }
    }
  }

  const subjectList = [...subjectMetrics.values()].map((subject) => ({
    ...subject,
    lessonRate: percent(subject.metLessons, subject.targetLessons),
  }));
  const actualMinutes = Object.values(dailyActualMinutes).reduce(
    (sum, minutes) => sum + minutes,
    0,
  );
  const targetMinutes = Object.values(dailyTargetMinutes).reduce(
    (sum, minutes) => sum + minutes,
    0,
  );

  return {
    weekStartISO,
    weekEndISO,
    dates,
    lessons: {
      targetTotal: targets.length,
      metTotal: targets.filter((target) => target.met).length,
      rate: percent(targets.filter((target) => target.met).length, targets.length),
      targets,
      outOfPlanCompletions,
    },
    habits: {
      targetTotal: habitTargetTotal,
      completedTotal: habitCompletedTotal,
      rate: percent(habitCompletedTotal, habitTargetTotal),
      details: habitDetails,
    },
    time: {
      actualMinutes,
      targetMinutes,
      rate: percent(actualMinutes, targetMinutes),
      dailyActualMinutes,
      dailyTargetMinutes,
    },
    subjects: subjectList,
    archivedActivity: [...archivedByLesson.values()].sort((a, b) =>
      a.lessonId.localeCompare(b.lessonId),
    ),
  };
}

export function weeklyLessonCompletionLabel(status: WeeklyLessonCompletionStatus): string {
  switch (status) {
    case "completed-undated":
      return "Hoàn thành, không rõ ngày";
    case "completed-early":
      return "Hoàn thành sớm";
    case "completed-after-week":
      return "Hoàn thành sau tuần";
    case "completed":
      return "Đã hoàn thành";
    default:
      return "Chưa hoàn thành";
  }
}
