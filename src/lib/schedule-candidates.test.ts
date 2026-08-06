import { describe, expect, test, vi } from "vitest";
import type { Lesson, Subject } from "./mock-data";
import { DEFAULT_PLANNER_SETTINGS } from "./planner";
import {
  buildChangeDayCapacityCandidate,
  buildChangeScheduleModeCandidate,
  buildMoveLessonDateCandidate,
  buildReorderLessonCandidate,
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

function reorderSnapshot() {
  const lessonOne = { ...lesson("lesson-1", "2030-01-01"), topic: "Chủ đề A" };
  const lessonTwo = { ...lesson("lesson-2", "2030-01-02"), topic: "Chủ đề A" };
  const lessonThree = {
    ...lesson("lesson-3", "2030-01-03"),
    topic: "Chủ đề B",
    sourceSubject: "Môn đích",
  };

  return createScheduleSnapshot(
    [
      {
        id: "source-subject",
        name: "Môn nguồn",
        emoji: "📘",
        milestones: [
          {
            id: "source-topic",
            title: "Chủ đề A",
            subtitle: "2 bài học",
            lessons: [lessonOne, lessonTwo],
          },
        ],
      },
      {
        id: "target-subject",
        name: "Môn đích",
        emoji: "📗",
        milestones: [
          {
            id: "target-topic",
            title: "Chủ đề B",
            subtitle: "1 bài học",
            lessons: [lessonThree],
          },
        ],
      },
    ],
    DEFAULT_PLANNER_SETTINGS,
  );
}

function lessonIds(subjects: Subject[]): string[] {
  return subjects.flatMap((subject) =>
    subject.milestones.flatMap((milestone) => milestone.lessons.map((item) => item.id)),
  );
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
    expect(result.candidate.subjects[0].milestones[0].lessons[0].scheduledDate).toBe("2030-01-04");
    expect(result.candidate.plannerSettings).toEqual(current.plannerSettings);
    expect(current.subjects[0].milestones[0].lessons[0].scheduledDate).toBe("2030-01-01");
  });

  test("creates provenance for the first manual move", () => {
    const result = buildMoveLessonDateCandidate({
      current: currentSnapshot(),
      lessonId: "lesson-1",
      targetDateISO: "2030-01-04",
      now: () => new Date("2030-01-02T03:04:05.000Z"),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.candidate.subjects[0].milestones[0].lessons[0]).toMatchObject({
      scheduledDate: "2030-01-04",
      placementProvenance: {
        kind: "manual-move",
        movedAt: "2030-01-02T03:04:05.000Z",
        fromDateISO: "2030-01-01",
        toDateISO: "2030-01-04",
      },
    });
  });

  test("a second move replaces the previous provenance", () => {
    const current = currentSnapshot();
    current.subjects[0].milestones[0].lessons[0].placementProvenance = {
      kind: "manual-move",
      movedAt: "2030-01-01T00:00:00.000Z",
      fromDateISO: "2029-12-31",
      toDateISO: "2030-01-01",
    };
    const result = buildMoveLessonDateCandidate({
      current,
      lessonId: "lesson-1",
      targetDateISO: "2030-01-05",
      now: () => new Date("2030-01-03T00:00:00.000Z"),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.candidate.subjects[0].milestones[0].lessons[0].placementProvenance).toEqual({
      kind: "manual-move",
      movedAt: "2030-01-03T00:00:00.000Z",
      fromDateISO: "2030-01-01",
      toDateISO: "2030-01-05",
    });
  });

  test("a same-date no-op preserves the existing provenance", () => {
    const current = currentSnapshot();
    const previous = {
      kind: "manual-move" as const,
      movedAt: "2030-01-01T00:00:00.000Z",
      fromDateISO: "2029-12-31",
      toDateISO: "2030-01-01",
    };
    current.subjects[0].milestones[0].lessons[0].placementProvenance = previous;
    const now = vi.fn(() => new Date("2030-01-03T00:00:00.000Z"));
    const result = buildMoveLessonDateCandidate({
      current,
      lessonId: "lesson-1",
      targetDateISO: "2030-01-01",
      now,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.candidate.subjects[0].milestones[0].lessons[0].placementProvenance).toEqual(
      previous,
    );
    expect(now).not.toHaveBeenCalled();
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

describe("buildChangeScheduleModeCandidate", () => {
  test("changes a lesson to fixed only with a valid exact date", () => {
    const current = currentSnapshot();
    const result = buildChangeScheduleModeCandidate({
      current,
      lessonId: "lesson-1",
      scheduleMode: "fixed",
      scheduledDate: "2030-02-03",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    const changed = result.candidate.subjects[0].milestones[0].lessons[0];
    expect(changed.scheduleMode).toBe("fixed");
    expect(changed.scheduledDate).toBe("2030-02-03");
    expect(current.subjects[0].milestones[0].lessons[0].scheduleMode).toBe("flexible");
  });

  test("rejects fixed mode without a valid exact date", () => {
    expect(
      buildChangeScheduleModeCandidate({
        current: currentSnapshot(),
        lessonId: "lesson-1",
        scheduleMode: "fixed",
        scheduledDate: "2030-02-30",
      }),
    ).toEqual({ ok: false, error: "Bài cố định cần một ngày hợp lệ." });
  });

  test("treats a flexible date as its earliest eligible date", () => {
    const current = currentSnapshot();
    current.subjects[0].milestones[0].lessons[0].scheduleMode = "fixed";
    const result = buildChangeScheduleModeCandidate({
      current,
      lessonId: "lesson-1",
      scheduleMode: "flexible",
      scheduledDate: "2030-03-04",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    const changed = result.candidate.subjects[0].milestones[0].lessons[0];
    expect(changed.scheduleMode).toBe("flexible");
    expect(changed.scheduledDate).toBe("2030-03-04");
  });

  test("does not treat review task IDs as catalog lessons", () => {
    expect(
      buildChangeScheduleModeCandidate({
        current: currentSnapshot(),
        lessonId: "review:lesson-1:2030-01-08",
        scheduleMode: "fixed",
        scheduledDate: "2030-01-08",
      }),
    ).toEqual({ ok: false, error: "Không thể đổi chế độ của nhiệm vụ ôn tập." });
  });
});

describe("buildReorderLessonCandidate", () => {
  test("moves a lesson across subjects with explicit target metadata and preserves IDs", () => {
    const current = reorderSnapshot();
    const result = buildReorderLessonCandidate({
      current,
      lessonId: "lesson-1",
      target: {
        subjectId: "target-subject",
        topicId: "target-topic",
        beforeLessonId: "lesson-3",
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    const sourceLessons = result.candidate.subjects[0].milestones[0].lessons;
    const targetLessons = result.candidate.subjects[1].milestones[0].lessons;
    expect(sourceLessons.map((item) => item.id)).toEqual(["lesson-2"]);
    expect(targetLessons.map((item) => item.id)).toEqual(["lesson-1", "lesson-3"]);
    expect(targetLessons[0]).toMatchObject({
      id: "lesson-1",
      sourceSubject: "Môn đích",
      topic: "Chủ đề B",
    });
    expect(lessonIds(result.candidate.subjects).sort()).toEqual([
      "lesson-1",
      "lesson-2",
      "lesson-3",
    ]);
    expect(new Set(lessonIds(result.candidate.subjects)).size).toBe(3);
    expect(result.candidate.plannerSettings).toEqual(current.plannerSettings);
    expect(lessonIds(current.subjects)).toEqual(["lesson-1", "lesson-2", "lesson-3"]);
  });

  test("supports appending inside an explicitly selected topic", () => {
    const result = buildReorderLessonCandidate({
      current: reorderSnapshot(),
      lessonId: "lesson-1",
      target: {
        subjectId: "source-subject",
        topicId: "source-topic",
        beforeLessonId: null,
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.candidate.subjects[0].milestones[0].lessons.map((item) => item.id)).toEqual([
      "lesson-2",
      "lesson-1",
    ]);
  });

  test("rejects a target lesson outside the explicit target topic", () => {
    expect(
      buildReorderLessonCandidate({
        current: reorderSnapshot(),
        lessonId: "lesson-1",
        target: {
          subjectId: "source-subject",
          topicId: "source-topic",
          beforeLessonId: "lesson-3",
        },
      }),
    ).toEqual({ ok: false, error: "Không tìm thấy vị trí chèn trong chủ đề đích." });
  });

  test("does not reorder review task IDs as ordinary lessons", () => {
    expect(
      buildReorderLessonCandidate({
        current: reorderSnapshot(),
        lessonId: "review:lesson-1:2030-01-08",
        target: {
          subjectId: "source-subject",
          topicId: "source-topic",
          beforeLessonId: null,
        },
      }),
    ).toEqual({ ok: false, error: "Không thể sắp xếp nhiệm vụ ôn tập như bài học." });
  });
});
