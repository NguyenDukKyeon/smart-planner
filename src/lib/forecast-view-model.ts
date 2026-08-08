import { addDaysISO, todayISO } from "./date-utils";
import type { Subject } from "./mock-data";
import { allRemainingLessonIds, buildFlexiblePlan, forecast } from "./planner";
import type { ProgressState } from "./progress-store";
import { summarizeUnscheduledWork } from "./schedule-visibility";
import { normalizeDailyStudyHours } from "./study-hours";

export type ForecastCompletion =
  | { kind: "complete" }
  | { kind: "no-capacity" }
  | { kind: "date"; startISO: string; endISO: string }
  | { kind: "range"; startISO: string; endISO: string };

export type ForecastHorizonWeeks = 2 | 4 | 8 | 12;

export type ForecastViewModel = {
  hoursPerDay: number;
  horizonWeeks: ForecastHorizonWeeks;
  horizonDays: 14 | 28 | 56 | 84;
  horizonEndISO: string;
  remainingLessons: number;
  visibleScheduledLessons: number;
  outsideHorizonLessons: number;
  totalNewHours: number;
  totalReviewHours: number;
  totalWorkloadHours: number;
  meanMinutes: number;
  confidence: "insufficient" | "low" | "medium" | "high";
  basis: "planned" | "mixed" | "actual";
  completion: ForecastCompletion;
};

const HORIZON_DAYS: Record<ForecastHorizonWeeks, 14 | 28 | 56 | 84> = {
  2: 14,
  4: 28,
  8: 56,
  12: 84,
};

export function selectForecastCompletion(params: {
  subjects: Subject[];
  state: ProgressState;
  fromISO?: string;
}) {
  const hoursPerDay = Number.isFinite(params.state.plannerSettings.defaultDailyHours)
    ? normalizeDailyStudyHours(params.state.plannerSettings.defaultDailyHours)
    : 2;
  const remainingLessonIds = allRemainingLessonIds(params.subjects, params.state.completedLessons);
  const result = forecast({
    remainingLessonIds,
    meta: params.state.studyMeta,
    subjects: params.subjects,
    hoursPerDay,
    fromISO: params.fromISO,
  });

  let completion: ForecastCompletion;
  if (result.remaining === 0) {
    completion = { kind: "complete" };
  } else if (hoursPerDay <= 0) {
    completion = { kind: "no-capacity" };
  } else if (result.earliestEndDateISO === result.latestEndDateISO) {
    completion = { kind: "date", startISO: result.endDateISO, endISO: result.endDateISO };
  } else {
    completion = {
      kind: "range",
      startISO: result.earliestEndDateISO,
      endISO: result.latestEndDateISO,
    };
  }

  return {
    completion,
    remainingLessons: result.remaining,
    hoursPerDay,
    totalNewHours: result.totalNewHours,
    totalReviewHours: result.totalReviewHours,
    totalWorkloadHours: Math.round((result.totalNewHours + result.totalReviewHours) * 10) / 10,
    meanMinutes: result.meanMinutes,
    confidence: result.confidence,
    basis: result.basis,
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

  return {
    ...base,
    horizonWeeks: params.horizonWeeks,
    horizonDays,
    horizonEndISO: addDaysISO(startISO, horizonDays - 1),
    visibleScheduledLessons: visibility.visibleScheduledCount,
    outsideHorizonLessons: visibility.outsideHorizonCount,
  };
}
