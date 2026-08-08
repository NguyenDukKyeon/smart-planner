import type { Subject } from "./mock-data";
import { allRemainingLessonIds, forecast } from "./planner";
import type { ProgressState } from "./progress-store";
import { normalizeDailyStudyHours } from "./study-hours";

export type ForecastCompletion =
  | { kind: "complete" }
  | { kind: "no-capacity" }
  | { kind: "date"; startISO: string; endISO: string }
  | { kind: "range"; startISO: string; endISO: string };

export function selectForecastCompletion(params: {
  subjects: Subject[];
  state: ProgressState;
  fromISO?: string;
}) {
  const hoursPerDay = Number.isFinite(params.state.plannerSettings.defaultDailyHours)
    ? normalizeDailyStudyHours(params.state.plannerSettings.defaultDailyHours)
    : 2;
  const remainingLessonIds = allRemainingLessonIds(
    params.subjects,
    params.state.completedLessons,
  );
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
