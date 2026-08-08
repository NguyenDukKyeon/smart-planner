import { describe, expect, it } from "vitest";
import { selectForecastViewModel } from "./forecast-view-model";
import type { Subject } from "./mock-data";
import { DEFAULT_STUDY_META, forecast } from "./planner";
import { createInitialProgressState } from "./progress-store";

const subjects: Subject[] = [
  {
    id: "english",
    name: "Tiếng Anh",
    emoji: "📘",
    milestones: [
      {
        id: "topic",
        title: "Chủ đề",
        subtitle: "",
        lessons: [
          {
            id: "lesson-sunday",
            title: "Bài Chủ nhật",
            xp: 10,
            plannedDurationMinutes: 45,
            scheduledDate: "2026-08-08",
            scheduleMode: "flexible",
            weekday: "T7",
            sourceSubject: "Tiếng Anh",
            week: 1,
            initialDone: false,
          },
        ],
      },
    ],
  },
];

describe("Sunday capacity compatibility surfaces", () => {
  it("legacy forecast counts Sunday as a normal study day", () => {
    const result = forecast({
      remainingLessonIds: ["lesson-sunday"],
      meta: DEFAULT_STUDY_META,
      subjects,
      hoursPerDay: 1,
      fromISO: "2026-08-08",
    });

    expect(result.studyDays).toBe(1);
    expect(result.endDateISO).toBe("2026-08-09");
  });

  it("Forecast view model reports that Sunday does not rest by default", () => {
    const state = createInitialProgressState(false);
    state.plannerSettings.todayHours = 1;
    state.plannerSettings.defaultDailyHours = 1;

    const result = selectForecastViewModel({
      subjects,
      state,
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });

    expect(result.sundayRestByDefault).toBe(false);
  });
});
