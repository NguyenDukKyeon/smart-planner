import { describe, expect, test } from "vitest";
import { canAutoNotifyDeadlines, getApproachingDeadlineLessons } from "./deadline-notifier";
import type { Subject } from "./mock-data";

const subjects: Subject[] = [
  {
    id: "physics",
    name: "Vật lý",
    emoji: "⚛️",
    milestones: [
      {
        id: "m1",
        title: "Chương 1",
        subtitle: "",
        lessons: [
          {
            id: "lesson-today",
            title: "Dao động điều hòa",
            xp: 20,
            plannedDurationMinutes: 40,
            scheduledDate: "2026-07-26",
            weekday: "Saturday",
            sourceSubject: "Vật lý",
            week: 1,
            initialDone: false,
          },
        ],
      },
    ],
  },
];

describe("deadline notification opt-in gate", () => {
  test("requires both onboarding completion and an explicit enabled preference", () => {
    expect(
      canAutoNotifyDeadlines({ onboardingComplete: false, preferences: { enabled: true } }),
    ).toBe(false);
    expect(
      canAutoNotifyDeadlines({ onboardingComplete: true, preferences: { enabled: false } }),
    ).toBe(false);
    expect(
      canAutoNotifyDeadlines({ onboardingComplete: true, preferences: { enabled: true } }),
    ).toBe(true);
  });

  test("keeps deadline details tied to an actual scheduled lesson", () => {
    const approaching = getApproachingDeadlineLessons(subjects, {}, {}, "2026-07-26");
    expect(approaching).toHaveLength(1);
    expect(approaching[0]).toMatchObject({
      subjectName: "Vật lý",
      effectiveDate: "2026-07-26",
      isToday: true,
      lesson: { id: "lesson-today", title: "Dao động điều hòa" },
    });
  });
});
