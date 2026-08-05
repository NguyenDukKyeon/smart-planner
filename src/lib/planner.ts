// Pure scheduler + forecast helpers. No React, no localStorage.
import { SUBJECTS, type Lesson, type Subject } from "./mock-data";
import { addDaysISO, dayIndex, daysBetweenISO, isSundayISO, todayISO } from "./date-utils";
import { sortSubjects, sortLessonsBySubjectPriority } from "./subject-order";

export type PlannerSettings = {
  todayHours: number;
  dailyHours: Record<string, number>; // ISO -> hours override
  defaultDailyHours: number;
  reviewShareMax: number; // 0..1
  reviewCapMinutes: number;
  subjectRotation: readonly ("toan" | "ly" | "hoa")[];
};

export type StudyMeta = {
  actualMinutes: Record<string, number[]>;
  fallbackMinutes: number;
  minPerLesson: number;
  maxPerLesson: number;
};

export const DEFAULT_PLANNER_SETTINGS: PlannerSettings = {
  todayHours: 2,
  dailyHours: {},
  defaultDailyHours: 2,
  reviewShareMax: 0.2,
  reviewCapMinutes: 60,
  subjectRotation: ["toan", "ly", "hoa"],
};

export const DEFAULT_STUDY_META: StudyMeta = {
  actualMinutes: {},
  fallbackMinutes: 90,
  minPerLesson: 10,
  maxPerLesson: 240,
};

export function estimateLessonMinutes(
  lessonId: string,
  meta: StudyMeta,
  subjects: Subject[] = SUBJECTS,
): number {
  const samples = (meta.actualMinutes[lessonId] ?? []).filter(
    (minutes) => Number.isFinite(minutes) && minutes > 0,
  );
  if (samples.length > 0) {
    const mean = Math.round(samples.reduce((sum, minutes) => sum + minutes, 0) / samples.length);
    return Math.min(meta.maxPerLesson, Math.max(meta.minPerLesson, mean));
  }
  const lesson = subjects
    .flatMap((subject) => subject.milestones)
    .flatMap((milestone) => milestone.lessons)
    .find((candidate) => candidate.id === lessonId);
  return lesson?.plannedDurationMinutes ?? meta?.fallbackMinutes ?? 90;
}

export function meanLessonMinutes(
  remainingIds: string[],
  meta: StudyMeta,
  subjects: Subject[] = SUBJECTS,
): number {
  if (remainingIds.length === 0) return meta.fallbackMinutes;
  const sum = remainingIds.reduce(
    (total, id) => total + estimateLessonMinutes(id, meta, subjects),
    0,
  );
  return Math.round(sum / remainingIds.length);
}

// Lessons per subject in scheduledDate order, filtered by "not completed and not virtually consumed".
export function remainingBySubject(
  subjects: Subject[],
  completed: Record<string, string>,
  consumed: Set<string> = new Set(),
  dateISO?: string,
): Record<string, Lesson[]> {
  const sortedSubjects = sortSubjects(subjects);
  const out: Record<string, Lesson[]> = {};
  for (const subject of sortedSubjects) {
    const list: Lesson[] = [];
    for (const milestone of subject.milestones) {
      for (const lesson of milestone.lessons) {
        if (completed[lesson.id] || consumed.has(lesson.id)) continue;
        if ((lesson.scheduleMode ?? "flexible") !== "flexible") continue;
        if (!lesson.scheduledDate) continue;
        if (dateISO && lesson.scheduledDate > dateISO) continue;
        list.push(lesson);
      }
    }
    list.sort((left, right) => left.scheduledDate.localeCompare(right.scheduledDate));
    out[subject.id] = list;
  }
  return out;
}

function fixedLessonsScheduledOn(
  subjects: Subject[],
  completed: Record<string, string>,
  consumed: Set<string>,
  dateISO: string,
  meta: StudyMeta,
): Lesson[] {
  const lessons = subjects.flatMap((subject) =>
    subject.milestones.flatMap((milestone) =>
      milestone.lessons.filter(
        (lesson) =>
          !completed[lesson.id] &&
          !consumed.has(lesson.id) &&
          (lesson.scheduleMode ?? "flexible") === "fixed" &&
          lesson.scheduledDate === dateISO,
      ),
    ),
  );
  return lessons;
}

export function reviewTaskId(lessonId: string, dateISO: string): string {
  return `review:${lessonId}:${dateISO}`;
}

export function reviewDueLessons(
  completed: Record<string, string>,
  refISO: string,
  subjects?: Subject[],
  reviewCompletions: Record<string, string> = {},
): { lessonId: string; completedISO: string; ageDays: number; taskId: string; completed: boolean }[] {
  const out: { lessonId: string; completedISO: string; ageDays: number; taskId: string; completed: boolean }[] = [];
  const activeLessonIds = subjects
    ? new Set(subjects.flatMap((s) => s.milestones.flatMap((m) => m.lessons.map((l) => l.id))))
    : null;

  for (const [id, iso] of Object.entries(completed)) {
    if (!iso) continue;
    if (activeLessonIds && !activeLessonIds.has(id)) continue;
    const age = daysBetweenISO(iso, refISO);
    if (age === 1 || age === 3 || age === 7 || age === 14 || age === 30) {
      const taskId = reviewTaskId(id, refISO);
      out.push({
        lessonId: id,
        completedISO: iso,
        ageDays: age,
        taskId,
        completed: Boolean(reviewCompletions[taskId]),
      });
    }
  }
  out.sort((a, b) => a.ageDays - b.ageDays);
  return out;
}

export type DayQueue = {
  newLessons: Lesson[];
  unplacedFixedLessons: Lesson[];
  reviewLessons: {
    lessonId: string;
    ageDays: number;
    minutes: number;
    taskId: string;
    completed: boolean;
  }[];
  quotaMinutes: number;
  newMinutes: number;
  reviewMinutes: number;
  unplacedFixedMinutes: number;
  unallocatedMinutes: number;
  overloadMinutes: number;
};

const REVIEW_MIN_PER_ITEM = 15;

export function pickDayQueue(params: {
  subjects: Subject[];
  completed: Record<string, string>;
  reviewCompletions?: Record<string, string>;
  consumed?: Set<string>;
  meta: StudyMeta;
  settings: PlannerSettings;
  dateISO: string;
  hoursOverride?: number;
  pinnedCompleted?: Lesson[];
}): DayQueue {
  const { subjects, completed, meta, settings, dateISO } = params;
  const consumed = new Set<string>(params.consumed ?? []);
  const hours = params.hoursOverride ?? 0;
  const quotaMinutes = Math.max(0, Math.round(hours * 60));
  const reviewBudget = Math.min(
    settings.reviewCapMinutes,
    Math.round(quotaMinutes * settings.reviewShareMax),
  );

  // Reviews first (they always run if due).
  const due = reviewDueLessons(
    completed,
    dateISO,
    subjects,
    params.reviewCompletions ?? {},
  );
  const reviewLessons: DayQueue["reviewLessons"] = [];
  let reviewMinutes = 0;
  for (const item of due) {
    if (quotaMinutes > 0 && reviewMinutes + REVIEW_MIN_PER_ITEM > reviewBudget) break;
    if (quotaMinutes === 0 && reviewMinutes + REVIEW_MIN_PER_ITEM > settings.reviewCapMinutes)
      break;
    reviewLessons.push({
      lessonId: item.lessonId,
      ageDays: item.ageDays,
      minutes: REVIEW_MIN_PER_ITEM,
      taskId: item.taskId,
      completed: item.completed,
    });
    reviewMinutes += REVIEW_MIN_PER_ITEM;
  }

  const newLessons: Lesson[] = [];
  let newMinutes = 0;

  // Pin lessons already completed on this dateISO so they stay visible and
  // consume budget (no substitute is pulled in to replace them).
  const pinned = params.pinnedCompleted ?? [];
  for (const l of pinned) {
    if (consumed.has(l.id)) continue;
    newLessons.push(l);
    newMinutes += estimateLessonMinutes(l.id, meta, subjects);
    consumed.add(l.id);
  }

  const unplacedFixedLessons: Lesson[] = [];
  let unplacedFixedMinutes = 0;

  if (quotaMinutes > 0) {
    const newBudget = Math.max(0, quotaMinutes - reviewMinutes);

    // Bài cố định chỉ có một cơ hội ở đúng ngày đã chọn. Bài không vừa
    // ngân sách được đưa vào khu vực "Chưa xếp được", không dời sang ngày sau.
    const fixedCandidates = fixedLessonsScheduledOn(
      subjects,
      completed,
      consumed,
      dateISO,
      meta,
    );
    for (const lesson of fixedCandidates) {
      const estimatedMinutes = estimateLessonMinutes(lesson.id, meta, subjects);
      if (newMinutes + estimatedMinutes <= newBudget) {
        newLessons.push(lesson);
        newMinutes += estimatedMinutes;
        consumed.add(lesson.id);
      } else {
        unplacedFixedLessons.push(lesson);
        unplacedFixedMinutes += estimatedMinutes;
      }
    }

    // Bài linh hoạt được mang sang các ngày sau, nhưng không bao giờ bị kéo
    // lên trước ngày bắt đầu mà người dùng đã chọn.
    const sortedSubjects = sortSubjects(subjects);
    const pools = remainingBySubject(sortedSubjects, completed, consumed, dateISO);
    const order = sortedSubjects.map((subject) => subject.id);
    const cursors: Record<string, number> = Object.fromEntries(order.map((id) => [id, 0]));
    const subjectPickCounts: Record<string, number> = Object.fromEntries(
      order.map((id) => [id, 0]),
    );

    let guard = 0;
    while (guard++ < 1000) {
      const remainingBudget = newBudget - newMinutes;
      const candidates = order.flatMap((subjectId, subjectOrder) => {
        const pool = pools[subjectId] || [];
        const lesson = pool[cursors[subjectId]];
        if (!lesson) return [];
        const estimatedMinutes = estimateLessonMinutes(lesson.id, meta, subjects);
        if (estimatedMinutes > remainingBudget) return [];
        return [{ subjectId, subjectOrder, lesson, estimatedMinutes }];
      });
      if (candidates.length === 0) break;

      candidates.sort((left, right) => {
        const pickDifference =
          subjectPickCounts[left.subjectId] - subjectPickCounts[right.subjectId];
        if (pickDifference !== 0) return pickDifference;
        const dateDifference = left.lesson.scheduledDate.localeCompare(
          right.lesson.scheduledDate,
        );
        if (dateDifference !== 0) return dateDifference;
        const durationDifference = left.estimatedMinutes - right.estimatedMinutes;
        if (durationDifference !== 0) return durationDifference;
        return left.subjectOrder - right.subjectOrder;
      });

      const selected = candidates[0];
      newLessons.push(selected.lesson);
      newMinutes += selected.estimatedMinutes;
      consumed.add(selected.lesson.id);
      cursors[selected.subjectId] += 1;
      subjectPickCounts[selected.subjectId] += 1;
    }
  } else {
    const fixedCandidates = fixedLessonsScheduledOn(
      subjects,
      completed,
      consumed,
      dateISO,
      meta,
    );
    unplacedFixedLessons.push(...fixedCandidates);
    unplacedFixedMinutes = fixedCandidates.reduce(
      (sum, lesson) => sum + estimateLessonMinutes(lesson.id, meta, subjects),
      0,
    );
  }

  const sortedNewLessons = sortLessonsBySubjectPriority(newLessons);

  return {
    newLessons: sortedNewLessons,
    unplacedFixedLessons,
    reviewLessons,
    quotaMinutes,
    newMinutes,
    reviewMinutes,
    unplacedFixedMinutes,
    unallocatedMinutes: Math.max(0, quotaMinutes - newMinutes - reviewMinutes),
    overloadMinutes: Math.max(0, newMinutes + reviewMinutes - quotaMinutes),
  };
}

function lessonsCompletedOn(
  subjects: Subject[],
  completed: Record<string, string>,
  dateISO: string,
): Lesson[] {
  const ids = new Set<string>();
  for (const [id, iso] of Object.entries(completed)) {
    if (iso === dateISO) ids.add(id);
  }
  if (ids.size === 0) return [];
  const out: Lesson[] = [];
  for (const s of subjects) {
    for (const m of s.milestones) {
      for (const l of m.lessons) {
        if (ids.has(l.id)) out.push(l);
      }
    }
  }
  return out;
}

export function pickTodayQueue(args: {
  subjects: Subject[];
  completed: Record<string, string>;
  reviewCompletions?: Record<string, string>;
  meta: StudyMeta;
  settings: PlannerSettings;
  dateISO?: string;
}): DayQueue {
  const dateISO = args.dateISO ?? todayISO();
  const pinnedCompleted = lessonsCompletedOn(args.subjects, args.completed, dateISO);
  return pickDayQueue({
    subjects: args.subjects,
    completed: args.completed,
    reviewCompletions: args.reviewCompletions,
    meta: args.meta,
    settings: args.settings,
    dateISO,
    hoursOverride: args.settings.todayHours,
    pinnedCompleted,
  });
}

export type PlanDay = {
  dateISO: string;
  hours: number;
  queue: DayQueue;
};

export function buildFlexiblePlan(args: {
  subjects: Subject[];
  completed: Record<string, string>;
  reviewCompletions?: Record<string, string>;
  meta: StudyMeta;
  settings: PlannerSettings;
  fromISO?: string;
  horizonDays?: number;
}): PlanDay[] {
  const from = args.fromISO ?? todayISO();
  const horizon = args.horizonDays ?? 14;
  const consumed = new Set<string>();
  const days: PlanDay[] = [];
  for (let i = 0; i < horizon; i++) {
    const dateISO = addDaysISO(from, i);
    const isToday = dateISO === todayISO();
    let hours: number;
    if (isToday) {
      hours = args.settings.todayHours;
    } else if (args.settings.dailyHours[dateISO] !== undefined) {
      hours = args.settings.dailyHours[dateISO];
    } else {
      hours = args.settings.defaultDailyHours;
    }
    const pinned = lessonsCompletedOn(args.subjects, args.completed, dateISO);
    const queue = pickDayQueue({
      subjects: args.subjects,
      completed: args.completed,
      reviewCompletions: args.reviewCompletions,
      consumed,
      meta: args.meta,
      settings: args.settings,
      dateISO,
      hoursOverride: hours,
      pinnedCompleted: pinned.length > 0 ? pinned : undefined,
    });
    for (const l of queue.newLessons) consumed.add(l.id);
    days.push({ dateISO, hours, queue });
  }
  return days;
}

export type Forecast = {
  remaining: number;
  meanMinutes: number;
  totalNewHours: number;
  totalReviewHours: number;
  endDateISO: string;
  reviewEndDateISO: string;
  studyDays: number;
  sampleCount: number;
  confidence: "insufficient" | "low" | "medium" | "high";
  earliestEndDateISO: string;
  latestEndDateISO: string;
  basis: "planned" | "mixed" | "actual";
};

export function forecast(args: {
  remainingLessonIds: string[];
  meta: StudyMeta;
  subjects?: Subject[];
  hoursPerDay: number;
  fromISO?: string;
}): Forecast {
  const from = args.fromISO ?? todayISO();
  const remaining = args.remainingLessonIds.length;
  const plannedMean = meanLessonMinutes(
    args.remainingLessonIds,
    { ...args.meta, actualMinutes: {} },
    args.subjects ?? SUBJECTS,
  );
  const actualSamples = Object.values(args.meta.actualMinutes)
    .flat()
    .filter((minutes) => Number.isFinite(minutes) && minutes > 0);
  const sampleCount = actualSamples.length;
  const actualMean =
    sampleCount > 0
      ? Math.round(actualSamples.reduce((sum, minutes) => sum + minutes, 0) / sampleCount)
      : plannedMean;
  const mean =
    sampleCount === 0
      ? plannedMean
      : sampleCount < 7
        ? Math.round((plannedMean + actualMean) / 2)
        : actualMean;
  const confidence: Forecast["confidence"] =
    sampleCount < 3
      ? "insufficient"
      : sampleCount < 7
        ? "low"
        : sampleCount < 20
          ? "medium"
          : "high";
  const basis: Forecast["basis"] =
    sampleCount === 0 ? "planned" : sampleCount >= Math.max(7, remaining) ? "actual" : "mixed";
  if (remaining === 0 || args.hoursPerDay <= 0) {
    return {
      remaining,
      meanMinutes: mean,
      totalNewHours: 0,
      totalReviewHours: 0,
      endDateISO: from,
      reviewEndDateISO: from,
      studyDays: 0,
      sampleCount,
      confidence,
      earliestEndDateISO: from,
      latestEndDateISO: from,
      basis,
    };
  }
  const minutesPerDayForNew = args.hoursPerDay * 60 * (1 - 0.2);
  const totalNewMinutes = remaining * mean;
  const studyDays = Math.max(1, Math.ceil(totalNewMinutes / minutesPerDayForNew));
  const endDateISO = advanceStudyDays(from, studyDays);
  const uncertainty =
    confidence === "high"
      ? [0.9, 1.1]
      : confidence === "medium"
        ? [0.8, 1.2]
        : confidence === "low"
          ? [0.7, 1.35]
          : [0.6, 1.5];
  const earliestEndDateISO = advanceStudyDays(
    from,
    Math.max(1, Math.ceil(studyDays * uncertainty[0])),
  );
  const latestEndDateISO = advanceStudyDays(
    from,
    Math.max(1, Math.ceil(studyDays * uncertainty[1])),
  );
  // Review chain 1/3/7/14/30 finishes 30 days after last new lesson.
  const reviewEndDateISO = addDaysISO(endDateISO, 30);
  const totalReviewMinutes = Math.round(totalNewMinutes * 0.35); // ~35% of new time across 1/3/7/14/30
  return {
    remaining,
    meanMinutes: mean,
    totalNewHours: Math.round((totalNewMinutes / 60) * 10) / 10,
    totalReviewHours: Math.round((totalReviewMinutes / 60) * 10) / 10,
    endDateISO,
    reviewEndDateISO,
    studyDays,
    sampleCount,
    confidence,
    earliestEndDateISO,
    latestEndDateISO,
    basis,
  };
}

function advanceStudyDays(fromISO: string, studyDays: number): string {
  let iso = fromISO;
  let count = 0;
  while (count < studyDays) {
    iso = addDaysISO(iso, 1);
    if (!isSundayISO(iso)) count++;
  }
  return iso;
}

export function allRemainingLessonIds(
  subjects: Subject[],
  completed: Record<string, string>,
): string[] {
  const out: string[] = [];
  for (const s of subjects) {
    for (const m of s.milestones) {
      for (const l of m.lessons) {
        if (!completed[l.id]) out.push(l.id);
      }
    }
  }
  return out;
}

export function subjectOfLesson(lessonId: string): "toan" | "ly" | "hoa" | null {
  if (lessonId.startsWith("toan-")) return "toan";
  if (lessonId.startsWith("ly-")) return "ly";
  if (lessonId.startsWith("hoa-")) return "hoa";
  return null;
}

export function findLessonPosition(
  subjects: Subject[],
  lessonId: string,
): {
  subject: Subject;
  milestone: string;
  indexInMilestone: number;
  totalInMilestone: number;
} | null {
  for (const s of subjects) {
    for (const m of s.milestones) {
      const idx = m.lessons.findIndex((l) => l.id === lessonId);
      if (idx >= 0)
        return {
          subject: s,
          milestone: m.title,
          indexInMilestone: idx + 1,
          totalInMilestone: m.lessons.length,
        };
    }
  }
  return null;
}

export function findLessonById(id: string, subjects: Subject[] = SUBJECTS): Lesson | null {
  for (const s of subjects) {
    for (const m of s.milestones) {
      const l = m.lessons.find((x) => x.id === id);
      if (l) return l;
    }
  }
  return null;
}

// For "Lịch gốc": returns lessonId -> shifted ISO date. Uncompleted lessons across
// all weeks are scheduled continuously starting from today, respecting the daily hours budget
// (skipping Sundays) and automatically adapting when daily target hours change.
export function buildShiftedSchedule(args: {
  subjects: Subject[];
  completed: Record<string, string>;
  meta: StudyMeta;
  settings: PlannerSettings;
  fromISO?: string;
}): Record<string, string> {
  const from = args.fromISO ?? todayISO();
  const out: Record<string, string> = {};

  const uncompletedIds = allRemainingLessonIds(args.subjects, args.completed);
  if (uncompletedIds.length === 0) return out;

  const totalUncompleted = uncompletedIds.length;
  const consumed = new Set<string>();
  let dayOffset = 0;

  while (consumed.size < totalUncompleted && dayOffset < 365) {
    const dateISO = addDaysISO(from, dayOffset);

    let hours: number;
    if (dayOffset === 0) {
      hours = args.settings.todayHours;
    } else if (args.settings.dailyHours[dateISO] !== undefined) {
      hours = args.settings.dailyHours[dateISO];
    } else {
      hours = args.settings.defaultDailyHours;
    }

    const queue = pickDayQueue({
      subjects: args.subjects,
      completed: args.completed,
      consumed,
      meta: args.meta,
      settings: args.settings,
      dateISO,
      hoursOverride: hours,
      pinnedCompleted:
        dayOffset === 0 ? lessonsCompletedOn(args.subjects, args.completed, dateISO) : undefined,
    });

    for (const l of queue.newLessons) {
      if (!consumed.has(l.id)) {
        consumed.add(l.id);
        out[l.id] = dateISO;
      }
    }

    dayOffset++;
  }

  return out;
}
