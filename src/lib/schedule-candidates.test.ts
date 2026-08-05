import { describe, expect, test } from "vitest";
import type { Lesson, Subject } from "./mock-data";
import { DEFAULT_PLANNER_SETTINGS } from "./planner";
import {
  buildChangeDayCapacityCandidate,
  buildMoveLessonDateCandidate,
} from "./schedule-candidates";
import { createScheduleSnapshot } from "./schedule-transactions";

function lesson(id: string, scheduledDate: string): Lesson {
  return {
    id,
    title: id,
    xp: 20,
    plannedDurationMinutes: 60,
    scheduledDate,
    scheduleMode: "flexible",
    weekday: "",
    sourceSubject: "Môn kiểm thử",
    week: 1,
    initialDone: false,
  };
}

function catalog(lessons: Lesson[]): Subject[] {
  return [
    {
      id: "subject",
      name: "Môn kiểm thử",
      emoji: "🧪",
      milestones: [
        {
          id: "topic",
          title: "Chủ đề",
          subtitle: `${lessons.length} bài học`,
          lessons,
        },
      ],
    },
  ];
}

function currentSnapshot() {
  return createScheduleSnapshot(catalog([lesson("lesson-1", "2030-01-01")]), {
    ...DEFAULT_PLANNER_SETTINGS,
    todayHours: 2,
    defaultDailyHours: 2,
    dailyHours: { "2030-01-03": 4 },
  });
}

describe("buildMoveLessonDateCandidate", () => {
  test("changes only the selected lesson date without mutating the snapshot", () => {
    const current = currentSnapshot();
    const result = buildMoveLessonDateCandidate({
      current,
      lessonId: "lesson-1",
      targetDateISO: "2030-01-04",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.candidate.subjects[0].milestones[0].lessons[0].scheduledDate).toBe(
      "2030-01-04",
    );
    expect(result.candidate.plannerSettings).toEqual(current.plannerSettings);
    expect(current.subjects[0].milestones[0].lessons[0].scheduledDate).toBe("2030-01-01");
  });

  test("returns an error when the lesson does not exist", () => {
    expect(
      buildMoveLessonDateCandidate({
        current: currentSnapshot(),
        lessonId: "missing",
        targetDateISO: "2030-01-04",
      }),
    ).toEqual({ ok: false, error: "Không tìm thấy bài học để di chuyển." });
  });

  test("returns an unchanged detached candidate for a same-date no-op", () => {
    const current = currentSnapshot();
    const result = buildMoveLessonDateCandidate({
      current,
      lessonId: "lesson-1",
      targetDateISO: "2030-01-01",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.candidate).toEqual(current);
    expect(result.candidate).not.toBe(current);
  });
});

describe("buildChangeDayCapacityCandidate", () => {
  test("normalizes values through the shared 0–16 hour policy", () => {
    const current = currentSnapshot();
    const result = buildChangeDayCapacityCandidate({
      current,
      dateISO: "2030-01-03",
      hours: 16.5,
      todayDateISO: "2030-01-01",
    });

    expect(result.candidate.plannerSettings.dailyHours["2030-01-03"]).toBe(16);
    expect(result.candidate.plannerSettings.todayHours).toBe(2);
    expect(current.plannerSettings.dailyHours["2030-01-03"]).toBe(4);
  });

  test("removes a future-day override when it equals the inherited default", () => {
    const result = buildChangeDayCapacityCandidate({
      current: currentSnapshot(),
      dateISO: "2030-01-03",
      hours: 2,
      todayDateISO: "2030-01-01",
    });

    expect(result.candidate.plannerSettings.dailyHours).not.toHaveProperty("2030-01-03");
    expect(result.candidate.plannerSettings.todayHours).toBe(2);
  });

  test("restores today's default and removes its override", () => {
    const current = currentSnapshot();
    current.plannerSettings.todayHours = 5;
    current.plannerSettings.dailyHours["2030-01-01"] = 5;

    const result = buildChangeDayCapacityCandidate({
      current,
      dateISO: "2030-01-01",
      hours: 2,
      todayDateISO: "2030-01-01",
    });

    expect(result.candidate.plannerSettings.todayHours).toBe(2);
    expect(result.candidate.plannerSettings.dailyHours).not.toHaveProperty("2030-01-01");
  });

  test("keeps the subject catalog detached and unchanged", () => {
    const current = currentSnapshot();
    const result = buildChangeDayCapacityCandidate({
      current,
      dateISO: "2030-01-02",
      hours: 3.5,
      todayDateISO: "2030-01-01",
    });

    expect(result.candidate.subjects).toEqual(current.subjects);
    expect(result.candidate.subjects).not.toBe(current.subjects);
  });
});
