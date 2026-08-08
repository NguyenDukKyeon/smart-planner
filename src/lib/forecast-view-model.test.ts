import { describe, expect, it } from "vitest";
import { addDaysISO } from "./date-utils";
import * as forecastViewModelModule from "./forecast-view-model";
import type { Subject } from "./mock-data";
import type { ProgressState } from "./progress-store";
import { createInitialProgressState } from "./progress-store";

type HorizonWeeks = 2 | 4 | 8 | 12;

type ViewModel = {
  hoursPerDay: number;
  horizonWeeks: HorizonWeeks;
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
  completion:
    | { kind: "complete" }
    | { kind: "no-capacity" }
    | { kind: "date"; startISO: string; endISO: string }
    | { kind: "range"; startISO: string; endISO: string };
};

type Selector = (params: {
  subjects: Subject[];
  state: ProgressState;
  horizonWeeks: HorizonWeeks;
  fromISO?: string;
}) => ViewModel;

const selectForecastViewModel = (
  forecastViewModelModule as unknown as { selectForecastViewModel?: Selector }
).selectForecastViewModel;

function makeSubjects(count: number): Subject[] {
  return [
    {
      id: "math",
      name: "Toán",
      emoji: "📐",
      milestones: [
        {
          id: "topic-1",
          title: "Chủ đề 1",
          subtitle: "",
          lessons: Array.from({ length: count }, (_, index) => ({
            id: `lesson-${index + 1}`,
            title: `Bài ${index + 1}`,
            xp: 10,
            plannedDurationMinutes: 60,
            scheduledDate: "2026-08-08",
            scheduleMode: "flexible" as const,
            weekday: "T7",
            sourceSubject: "Toán",
            week: 1,
            initialDone: false,
          })),
        },
      ],
    },
  ];
}

function makeState(hours = 1): ProgressState {
  const state = createInitialProgressState(false);
  state.plannerSettings.defaultDailyHours = hours;
  state.plannerSettings.todayHours = hours;
  return state;
}

describe("Forecast view model", () => {
  it("exposes the pure horizon-aware selector", () => {
    expect(selectForecastViewModel).toBeTypeOf("function");
  });

  it("maps 2/4/8/12 weeks to 14/28/56/84 rolling days", () => {
    if (!selectForecastViewModel) return;
    const subjects = makeSubjects(1);
    const state = makeState(1);
    const fromISO = "2026-08-08";
    const cases: Array<[HorizonWeeks, 14 | 28 | 56 | 84]> = [
      [2, 14],
      [4, 28],
      [8, 56],
      [12, 84],
    ];

    for (const [horizonWeeks, horizonDays] of cases) {
      const result = selectForecastViewModel({ subjects, state, horizonWeeks, fromISO });
      expect(result.horizonWeeks).toBe(horizonWeeks);
      expect(result.horizonDays).toBe(horizonDays);
      expect(result.horizonEndISO).toBe(addDaysISO(fromISO, horizonDays - 1));
    }
  });

  it("counts unfinished lessons outside the selected horizon from the real flexible plan", () => {
    if (!selectForecastViewModel) return;
    const result = selectForecastViewModel({
      subjects: makeSubjects(20),
      state: makeState(1),
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });

    expect(result.outsideHorizonLessons).toBeGreaterThan(0);
    expect(result.visibleScheduledLessons).toBeGreaterThan(0);
    expect(result.visibleScheduledLessons + result.outsideHorizonLessons).toBe(
      result.remainingLessons,
    );
  });

  it("reports zero outside-horizon work when all unfinished lessons fit", () => {
    if (!selectForecastViewModel) return;
    const result = selectForecastViewModel({
      subjects: makeSubjects(1),
      state: makeState(2),
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });

    expect(result.remainingLessons).toBe(1);
    expect(result.visibleScheduledLessons).toBe(1);
    expect(result.outsideHorizonLessons).toBe(0);
  });

  it("a longer horizon never hides more unfinished work", () => {
    if (!selectForecastViewModel) return;
    const subjects = makeSubjects(20);
    const state = makeState(1);
    const shortView = selectForecastViewModel({
      subjects,
      state,
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });
    const longView = selectForecastViewModel({
      subjects,
      state,
      horizonWeeks: 12,
      fromISO: "2026-08-08",
    });

    expect(longView.outsideHorizonLessons).toBeLessThanOrEqual(shortView.outsideHorizonLessons);
    expect(longView.visibleScheduledLessons).toBeGreaterThanOrEqual(
      shortView.visibleScheduledLessons,
    );
  });

  it("keeps new-learning, review, and total workload internally consistent", () => {
    if (!selectForecastViewModel) return;
    const result = selectForecastViewModel({
      subjects: makeSubjects(5),
      state: makeState(2),
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });
    const expectedTotal = Math.round((result.totalNewHours + result.totalReviewHours) * 10) / 10;

    expect(result.totalNewHours).toBeGreaterThan(0);
    expect(result.totalReviewHours).toBeGreaterThan(0);
    expect(result.totalWorkloadHours).toBe(expectedTotal);
  });

  it("distinguishes completed work from unfinished work with zero capacity", () => {
    if (!selectForecastViewModel) return;
    const subjects = makeSubjects(2);
    const completedState = makeState(1);
    completedState.completedLessons = {
      "lesson-1": "2026-08-01",
      "lesson-2": "2026-08-02",
    };
    const completed = selectForecastViewModel({
      subjects,
      state: completedState,
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });

    const zeroCapacity = selectForecastViewModel({
      subjects,
      state: makeState(0),
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });

    expect(completed.completion.kind).toBe("complete");
    expect(completed.remainingLessons).toBe(0);
    expect(zeroCapacity.completion.kind).toBe("no-capacity");
    expect(zeroCapacity.remainingLessons).toBe(2);
  });

  it("is deterministic when fromISO is supplied", () => {
    if (!selectForecastViewModel) return;
    const params = {
      subjects: makeSubjects(8),
      state: makeState(1.5),
      horizonWeeks: 4 as const,
      fromISO: "2026-08-08",
    };

    expect(selectForecastViewModel(params)).toEqual(selectForecastViewModel(params));
  });
});
