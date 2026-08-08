import { describe, expect, it } from "vitest";
import { buildFlexiblePlan } from "./planner";
import * as forecastModule from "./forecast-view-model";
import type { Subject } from "./mock-data";
import { createInitialProgressState, type ProgressState } from "./progress-store";

type HorizonWeeks = 2 | 4 | 8 | 12;

type HorizonViewModel = {
  remainingLessons: number;
  totalNewHours: number;
  outsideHorizonLessons: number;
  completion: unknown;
  totalRemainingLessons: number;
  horizonScheduledLessons: number;
  horizonNewHours: number;
  horizonReviewHours: number;
  horizonWorkloadHours: number;
  horizonUnplacedFixedLessons: number;
};

type Selector = (params: {
  subjects: Subject[];
  state: ProgressState;
  horizonWeeks: HorizonWeeks;
  fromISO?: string;
}) => HorizonViewModel;

const selectForecastViewModel = (
  forecastModule as unknown as {
    selectForecastViewModel: Selector;
  }
).selectForecastViewModel;

function makeSubjects(params: {
  count: number;
  minutes?: number;
  scheduledDate?: string;
  mode?: "flexible" | "fixed";
}): Subject[] {
  const minutes = params.minutes ?? 120;
  const scheduledDate = params.scheduledDate ?? "2026-08-08";
  const mode = params.mode ?? "flexible";
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
          lessons: Array.from({ length: params.count }, (_, index) => ({
            id: `lesson-${index + 1}`,
            title: `Bài ${index + 1}`,
            xp: 10,
            plannedDurationMinutes: minutes,
            scheduledDate,
            scheduleMode: mode,
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

function makeState(hours = 4): ProgressState {
  const state = createInitialProgressState(false);
  state.plannerSettings.defaultDailyHours = hours;
  state.plannerSettings.todayHours = hours;
  return state;
}

function allLessons(subjects: Subject[]) {
  return subjects.flatMap((subject) =>
    subject.milestones.flatMap((milestone) => milestone.lessons),
  );
}

function makeRealRoadmapFixture(): Subject[] {
  const distributions = [
    { id: "toan", name: "Toán", emoji: "📐", count: 160 },
    { id: "hoa", name: "Hóa học", emoji: "🧪", count: 116 },
    { id: "ly", name: "Vật lý", emoji: "⚛️", count: 69 },
    { id: "english", name: "Tiếng Anh", emoji: "📘", count: 7 },
  ];
  let globalIndex = 0;

  return distributions.map((subject) => ({
    id: subject.id,
    name: subject.name,
    emoji: subject.emoji,
    milestones: [
      {
        id: `${subject.id}-roadmap`,
        title: "Lộ trình thật rút gọn",
        subtitle: "",
        lessons: Array.from({ length: subject.count }, (_, localIndex) => {
          const index = globalIndex++;
          const plannedDurationMinutes = index < 345 ? 120 : index < 351 ? 90 : 30;
          return {
            id: `real-${subject.id}-${localIndex + 1}`,
            title: `Bài ${index + 1}`,
            xp: 10,
            plannedDurationMinutes,
            scheduledDate: "2026-08-08",
            scheduleMode: "flexible" as const,
            weekday: "T7",
            sourceSubject: subject.name,
            week: 1,
            initialDone: false,
          };
        }),
      },
    ],
  }));
}

describe("Forecast horizon window", () => {
  it("scopes scheduled lessons and planned new work while preserving global completion", () => {
    const subjects = makeSubjects({ count: 40 });
    const state = makeState(4);
    const fromISO = "2026-08-08";

    const twoWeeks = selectForecastViewModel({ subjects, state, horizonWeeks: 2, fromISO });
    const twelveWeeks = selectForecastViewModel({ subjects, state, horizonWeeks: 12, fromISO });

    expect(twoWeeks.totalRemainingLessons).toBe(40);
    expect(twoWeeks.horizonScheduledLessons).toBeLessThan(40);
    expect(twelveWeeks.horizonScheduledLessons).toBeGreaterThanOrEqual(
      twoWeeks.horizonScheduledLessons,
    );
    expect(twelveWeeks.horizonNewHours).toBeGreaterThanOrEqual(twoWeeks.horizonNewHours);
    expect(twelveWeeks.outsideHorizonLessons).toBeLessThanOrEqual(twoWeeks.outsideHorizonLessons);
    expect(twelveWeeks.completion).toEqual(twoWeeks.completion);

    const visiblePlan = buildFlexiblePlan({
      subjects,
      completed: state.completedLessons,
      reviewCompletions: state.reviewCompletions,
      meta: state.studyMeta,
      settings: state.plannerSettings,
      fromISO,
      horizonDays: 14,
    });
    const scheduled = new Map<string, number>();
    for (const day of visiblePlan) {
      for (const lesson of day.queue.newLessons) {
        if (!state.completedLessons[lesson.id]) {
          scheduled.set(lesson.id, lesson.plannedDurationMinutes);
        }
      }
    }
    const expectedMinutes = [...scheduled.values()].reduce((sum, value) => sum + value, 0);

    expect(twoWeeks.horizonScheduledLessons).toBe(scheduled.size);
    expect(twoWeeks.horizonNewHours).toBe(Math.round((expectedMinutes / 60) * 10) / 10);
  });

  it("does not present the real-roadmap whole workload as a 2-week window", () => {
    const subjects = makeRealRoadmapFixture();
    const state = makeState(16);
    const completed = allLessons(subjects).slice(0, 11);
    state.completedLessons = Object.fromEntries(
      completed.map((lesson) => [lesson.id, "2026-08-08"] as const),
    );

    const twoWeeks = selectForecastViewModel({
      subjects,
      state,
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });
    const twelveWeeks = selectForecastViewModel({
      subjects,
      state,
      horizonWeeks: 12,
      fromISO: "2026-08-08",
    });

    expect(twoWeeks.totalRemainingLessons).toBe(341);
    expect(twoWeeks.remainingLessons).toBe(341);
    expect(twoWeeks.totalNewHours).toBe(677.5);
    expect(twoWeeks.horizonScheduledLessons).toBeLessThan(341);
    expect(twoWeeks.horizonNewHours).toBeLessThan(677.5);
    expect(twelveWeeks.horizonScheduledLessons).toBeGreaterThanOrEqual(
      twoWeeks.horizonScheduledLessons,
    );
    expect(twelveWeeks.completion).toEqual(twoWeeks.completion);
  });

  it("excludes completed lessons pinned into the visible plan from scoped new work", () => {
    const subjects = makeSubjects({ count: 2 });
    const state = makeState(4);
    state.completedLessons = { "lesson-1": "2026-08-08" };

    const result = selectForecastViewModel({
      subjects,
      state,
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });

    expect(result.totalRemainingLessons).toBe(1);
    expect(result.horizonScheduledLessons).toBe(1);
    expect(result.horizonNewHours).toBe(2);
  });

  it("counts only uncompleted review tasks actually placed in the window", () => {
    const subjects = makeSubjects({ count: 1, scheduledDate: "2026-08-07" });
    const state = makeState(2);
    state.completedLessons = { "lesson-1": "2026-08-07" };

    const pending = selectForecastViewModel({
      subjects,
      state,
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });
    expect(pending.horizonReviewHours).toBe(1);

    state.reviewCompletions = {
      "review:lesson-1:2026-08-08": "2026-08-08",
      "review:lesson-1:2026-08-10": "2026-08-10",
      "review:lesson-1:2026-08-14": "2026-08-14",
      "review:lesson-1:2026-08-21": "2026-08-21",
    };
    const completed = selectForecastViewModel({
      subjects,
      state,
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });
    expect(completed.horizonReviewHours).toBe(0);
  });

  it("exposes fixed work that is inside the window but cannot fit capacity", () => {
    const subjects = makeSubjects({ count: 1, minutes: 180, mode: "fixed" });
    const state = makeState(1);

    const result = selectForecastViewModel({
      subjects,
      state,
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });

    expect(result.horizonUnplacedFixedLessons).toBe(1);
    expect(result.horizonScheduledLessons).toBe(0);
    expect(result.horizonNewHours).toBe(0);
    expect(result.horizonWorkloadHours).toBe(
      Math.round((result.horizonNewHours + result.horizonReviewHours) * 10) / 10,
    );
  });
});
