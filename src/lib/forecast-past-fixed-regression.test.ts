import { describe, expect, it } from "vitest";
import type { Subject } from "./mock-data";
import { createInitialProgressState } from "./progress-store";
import { selectForecastViewModel } from "./forecast-view-model";

function pastFixedOnlySubjects(): Subject[] {
  return [
    {
      id: "math",
      name: "Toán",
      emoji: "📐",
      milestones: [
        {
          id: "topic",
          title: "Chủ đề",
          subtitle: "",
          lessons: [
            {
              id: "past-fixed-only",
              title: "Bài cố định đã lỡ ngày",
              xp: 10,
              plannedDurationMinutes: 120,
              scheduledDate: "2026-08-07",
              scheduleMode: "fixed",
              weekday: "T6",
              sourceSubject: "Toán",
              week: 1,
              initialDone: false,
            },
          ],
        },
      ],
    },
  ];
}

describe("Forecast blocker classification for missed fixed work", () => {
  it("reports unplaced-fixed instead of no-capacity when positive capacity exists but the exact date is already past", () => {
    const state = createInitialProgressState(false);
    state.plannerSettings.todayHours = 8;
    state.plannerSettings.defaultDailyHours = 8;

    const result = selectForecastViewModel({
      subjects: pastFixedOnlySubjects(),
      state,
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });

    expect(result.completion).toEqual({
      kind: "unresolved",
      reason: "unplaced-fixed",
      unscheduledLessons: 0,
      unplacedFixedLessons: 1,
      unprojectedLessons: 0,
    });
  });
});
