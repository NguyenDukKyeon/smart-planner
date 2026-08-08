import { addDaysISO, todayISO } from "./date-utils";
import type { Subject } from "./mock-data";
import { buildFlexiblePlan } from "./planner";
import type { ProgressState } from "./progress-store";
import { buildScheduleProjection } from "./schedule-projection";
import { summarizeUnscheduledWork } from "./schedule-visibility";
import {
  selectStudyDurationEvidence,
  type ForecastEvidenceConfidence,
} from "./study-duration-evidence";
import { normalizeDailyStudyHours } from "./study-hours";

export type ForecastCompletion =
  | { kind: "complete" }
  | { kind: "date"; dateISO: string }
  | {
      kind: "unresolved";
      reason: "no-capacity" | "unscheduled" | "unplaced-fixed" | "projection-bound";
      unscheduledLessons: number;
      unplacedFixedLessons: number;
      unprojectedLessons: number;
    };

export type ForecastEvidenceBasis = "planned-only" | "planned-with-study-evidence";
export type ForecastHorizonWeeks = 2 | 4 | 8 | 12;

export type ForecastViewModel = {
  defaultDailyHours: number;
  hoursPerDay: number;
  explicitCapacityOverrideCount: number;
  sundayRestByDefault: false;
  horizonWeeks: ForecastHorizonWeeks;
  horizonDays: 14 | 28 | 56 | 84;
  horizonEndISO: string;
  remainingLessons: number;
  totalRemainingLessons: number;
  visibleScheduledLessons: number;
  horizonScheduledLessons: number;
  outsideHorizonLessons: number;
  horizonUnplacedFixedLessons: number;
  totalNewHours: number;
  totalReviewHours: number;
  totalWorkloadHours: number;
  horizonNewHours: number;
  horizonReviewHours: number;
  horizonWorkloadHours: number;
  meanMinutes: number;
  evidenceLessonCount: number;
  evidenceSessionCount: number;
  confidence: ForecastEvidenceConfidence;
  basis: ForecastEvidenceBasis;
  completion: ForecastCompletion;
};

const HORIZON_DAYS: Record<ForecastHorizonWeeks, 14 | 28 | 56 | 84> = {
  2: 14,
  4: 28,
  8: 56,
  12: 84,
};

function roundHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10;
}

function unfinishedLessons(subjects: Subject[], completedLessons: Record<string, string>) {
  return subjects.flatMap((subject) =>
    subject.milestones.flatMap((milestone) =>
      milestone.lessons.filter((lesson) => !completedLessons[lesson.id]),
    ),
  );
}

function summarizeForecastHorizon(params: {
  visiblePlan: ReturnType<typeof buildFlexiblePlan>;
  completedLessons: Record<string, string>;
}) {
  const scheduled = new Map<string, number>();
  const unplacedFixed = new Set<string>();
  const reviews = new Map<string, number>();

  for (const day of params.visiblePlan) {
    for (const lesson of day.queue.newLessons) {
      if (params.completedLessons[lesson.id]) continue;
      if (!scheduled.has(lesson.id)) {
        scheduled.set(lesson.id, lesson.plannedDurationMinutes);
      }
    }

    for (const lesson of day.queue.unplacedFixedLessons) {
      if (!params.completedLessons[lesson.id]) {
        unplacedFixed.add(lesson.id);
      }
    }

    for (const review of day.queue.reviewLessons) {
      if (review.completed || reviews.has(review.taskId)) continue;
      reviews.set(review.taskId, review.minutes);
    }
  }

  return {
    scheduledLessons: scheduled.size,
    newMinutes: [...scheduled.values()].reduce((sum, value) => sum + value, 0),
    reviewMinutes: [...reviews.values()].reduce((sum, value) => sum + value, 0),
    unplacedFixedLessons: unplacedFixed.size,
  };
}

function resolveCompletion(params: {
  remainingLessons: number;
  schedulableRemainingLessons: number;
  projection: ReturnType<typeof buildScheduleProjection>;
}): ForecastCompletion {
  const { projection } = params;
  if (params.remainingLessons === 0) return { kind: "complete" };
  if (projection.projectionComplete && projection.lastScheduledLessonDate) {
    return { kind: "date", dateISO: projection.lastScheduledLessonDate };
  }

  const blockers = {
    unscheduledLessons: projection.unscheduledLessonIds.length,
    unplacedFixedLessons: projection.unplacedFixedLessonIds.length,
    unprojectedLessons: projection.unprojectedLessonIds.length,
  };

  if (params.schedulableRemainingLessons > 0 && projection.positiveCapacityDays === 0) {
    return { kind: "unresolved", reason: "no-capacity", ...blockers };
  }
  if (blockers.unscheduledLessons > 0) {
    return { kind: "unresolved", reason: "unscheduled", ...blockers };
  }
  if (blockers.unplacedFixedLessons > 0) {
    return { kind: "unresolved", reason: "unplaced-fixed", ...blockers };
  }
  return { kind: "unresolved", reason: "projection-bound", ...blockers };
}

export function selectForecastCompletion(params: {
  subjects: Subject[];
  state: ProgressState;
  fromISO?: string;
}) {
  const startISO = params.fromISO ?? todayISO();
  const lessons = unfinishedLessons(params.subjects, params.state.completedLessons);
  const totalNewMinutes = lessons.reduce(
    (sum, lesson) =>
      sum +
      (Number.isFinite(lesson.plannedDurationMinutes) && lesson.plannedDurationMinutes > 0
        ? lesson.plannedDurationMinutes
        : 0),
    0,
  );
  const totalReviewMinutes = Math.round(totalNewMinutes * 0.35);
  const evidence = selectStudyDurationEvidence({
    subjects: params.subjects,
    completedLessons: params.state.completedLessons,
    studySessions: params.state.studySessions,
  });
  const projection = buildScheduleProjection({
    subjects: params.subjects,
    completed: params.state.completedLessons,
    reviewCompletions: params.state.reviewCompletions,
    meta: params.state.studyMeta,
    settings: params.state.plannerSettings,
    fromISO: startISO,
    currentDateISO: startISO,
  });
  const defaultDailyHours = Number.isFinite(params.state.plannerSettings.defaultDailyHours)
    ? normalizeDailyStudyHours(params.state.plannerSettings.defaultDailyHours)
    : 2;
  const projectionEndISO = addDaysISO(startISO, Math.max(0, projection.projectionDays - 1));
  const explicitCapacityOverrideCount = Object.keys(params.state.plannerSettings.dailyHours).filter(
    (dateISO) => dateISO > startISO && dateISO <= projectionEndISO,
  ).length;
  const unplacedFixedLessonIds = new Set(projection.unplacedFixedLessonIds);
  const schedulableRemainingLessons = lessons.filter(
    (lesson) => Boolean(lesson.scheduledDate) && !unplacedFixedLessonIds.has(lesson.id),
  ).length;
  const completion = resolveCompletion({
    remainingLessons: lessons.length,
    schedulableRemainingLessons,
    projection,
  });
  const totalNewHours = roundHours(totalNewMinutes);
  const totalReviewHours = roundHours(totalReviewMinutes);

  return {
    completion,
    remainingLessons: lessons.length,
    defaultDailyHours,
    hoursPerDay: defaultDailyHours,
    explicitCapacityOverrideCount,
    sundayRestByDefault: false as const,
    totalNewHours,
    totalReviewHours,
    totalWorkloadHours: Math.round((totalNewHours + totalReviewHours) * 10) / 10,
    meanMinutes: lessons.length > 0 ? Math.round(totalNewMinutes / lessons.length) : 0,
    evidenceLessonCount: evidence.lessonCount,
    evidenceSessionCount: evidence.sessionCount,
    confidence: evidence.confidence,
    basis:
      evidence.lessonCount > 0
        ? ("planned-with-study-evidence" as const)
        : ("planned-only" as const),
  };
}

export function selectForecastViewModel(params: {
  subjects: Subject[];
  state: ProgressState;
  horizonWeeks: ForecastHorizonWeeks;
  fromISO?: string;
}): ForecastViewModel {
  const base = selectForecastCompletion(params);
  const startISO = params.fromISO ?? todayISO();
  const horizonDays = HORIZON_DAYS[params.horizonWeeks];
  const visiblePlan = buildFlexiblePlan({
    subjects: params.subjects,
    completed: params.state.completedLessons,
    reviewCompletions: params.state.reviewCompletions,
    meta: params.state.studyMeta,
    settings: params.state.plannerSettings,
    fromISO: startISO,
    horizonDays,
  });
  const visibility = summarizeUnscheduledWork({
    subjects: params.subjects,
    completed: params.state.completedLessons,
    visiblePlan,
  });
  const horizon = summarizeForecastHorizon({
    visiblePlan,
    completedLessons: params.state.completedLessons,
  });
  const horizonNewHours = roundHours(horizon.newMinutes);
  const horizonReviewHours = roundHours(horizon.reviewMinutes);

  return {
    ...base,
    horizonWeeks: params.horizonWeeks,
    horizonDays,
    horizonEndISO: addDaysISO(startISO, horizonDays - 1),
    totalRemainingLessons: base.remainingLessons,
    visibleScheduledLessons: visibility.visibleScheduledCount,
    horizonScheduledLessons: horizon.scheduledLessons,
    outsideHorizonLessons: visibility.outsideHorizonCount,
    horizonUnplacedFixedLessons: horizon.unplacedFixedLessons,
    horizonNewHours,
    horizonReviewHours,
    horizonWorkloadHours: Math.round((horizonNewHours + horizonReviewHours) * 10) / 10,
  };
}
