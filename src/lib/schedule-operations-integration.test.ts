import { describe, expect, test, vi } from "vitest";
import type { Lesson, Subject } from "./mock-data";
import { DEFAULT_PLANNER_SETTINGS, DEFAULT_STUDY_META, buildFlexiblePlan } from "./planner";
import {
  buildChangeDayCapacityCandidate,
  buildChangeScheduleModeCandidate,
  buildMoveLessonDateCandidate,
  buildReorderLessonCandidate,
} from "./schedule-candidates";
import { commitScheduleMutation, undoLastScheduleMutation } from "./schedule-mutation-controller";
import { createScheduleSnapshot, type ScheduleCandidate } from "./schedule-transactions";

const success = () => ({ ok: true }) as const;

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
    topic: "Chủ đề",
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

function settings(hours = 1) {
  return {
    ...DEFAULT_PLANNER_SETTINGS,
    todayHours: hours,
    defaultDailyHours: hours,
    dailyHours: {},
  };
}

function commitCandidate(params: {
  current: ScheduleCandidate;
  candidate: ScheduleCandidate;
  kind: "move-lesson-date" | "change-schedule-mode" | "reorder-lesson" | "change-day-capacity";
}) {
  return commitScheduleMutation({
    current: params.current,
    candidate: params.candidate,
    history: [],
    kind: params.kind,
    description: "Thay đổi lịch kiểm thử",
    saveSubjects: vi.fn(success),
    savePlannerSettings: vi.fn(success),
    backupSubjects: vi.fn(success),
    applyCandidate: vi.fn(),
    idFactory: () => "mutation-1",
  });
}

describe("schedule operation transactions", () => {
  test("a schedule-mode change creates one entry and undo restores mode, date, order and settings", () => {
    const current = createScheduleSnapshot(catalog([lesson("first", "2030-01-01")]), {
      ...settings(2),
      dailyHours: { "2030-01-04": 3.5 },
    });
    const built = buildChangeScheduleModeCandidate({
      current,
      lessonId: "first",
      scheduleMode: "fixed",
      scheduledDate: "2030-01-05",
    });
    expect(built.ok).toBe(true);
    if (!built.ok) throw new Error(built.error);

    const committed = commitCandidate({
      current,
      candidate: built.candidate,
      kind: "change-schedule-mode",
    });
    expect(committed.ok).toBe(true);
    if (!committed.ok || committed.status !== "committed") throw new Error("Expected commit");
    expect(committed.history).toHaveLength(1);
    expect(committed.history[0].kind).toBe("change-schedule-mode");

    let restored: ScheduleCandidate | null = null;
    const undone = undoLastScheduleMutation({
      current: built.candidate,
      history: committed.history,
      saveSubjects: vi.fn(success),
      savePlannerSettings: vi.fn(success),
      applyCandidate: (candidate) => {
        restored = candidate;
      },
    });

    expect(undone.ok).toBe(true);
    expect(restored).toEqual(current);
  });

  test("a reorder creates one entry and undo restores the full original catalog", () => {
    const current = createScheduleSnapshot(
      catalog([lesson("first", "2030-01-01"), lesson("second", "2030-01-01")]),
      settings(2),
    );
    const built = buildReorderLessonCandidate({
      current,
      lessonId: "second",
      target: { subjectId: "subject", topicId: "topic", beforeLessonId: "first" },
    });
    expect(built.ok).toBe(true);
    if (!built.ok) throw new Error(built.error);
    expect(built.candidate.subjects[0].milestones[0].lessons.map((item) => item.id)).toEqual([
      "second",
      "first",
    ]);

    const committed = commitCandidate({
      current,
      candidate: built.candidate,
      kind: "reorder-lesson",
    });
    expect(committed.ok).toBe(true);
    if (!committed.ok || committed.status !== "committed") throw new Error("Expected commit");
    expect(committed.history).toHaveLength(1);

    let restored: ScheduleCandidate | null = null;
    const undone = undoLastScheduleMutation({
      current: built.candidate,
      history: committed.history,
      saveSubjects: vi.fn(success),
      savePlannerSettings: vi.fn(success),
      applyCandidate: (candidate) => {
        restored = candidate;
      },
    });

    expect(undone.ok).toBe(true);
    expect(restored).toEqual(current);
  });

  test("changing capacity and undoing restores the exact prior plan", () => {
    const current = createScheduleSnapshot(
      catalog([lesson("first", "2030-01-01"), lesson("second", "2030-01-01")]),
      settings(1),
    );
    const beforePlan = buildFlexiblePlan({
      subjects: current.subjects,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: current.plannerSettings,
      fromISO: "2030-01-01",
      horizonDays: 2,
    });
    const built = buildChangeDayCapacityCandidate({
      current,
      dateISO: "2030-01-01",
      hours: 2,
      todayDateISO: "2030-01-01",
    });
    const changedPlan = buildFlexiblePlan({
      subjects: built.candidate.subjects,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: built.candidate.plannerSettings,
      fromISO: "2030-01-01",
      horizonDays: 2,
    });
    expect(changedPlan[0].queue.newLessons.map((item) => item.id)).toEqual(["first", "second"]);

    const committed = commitCandidate({
      current,
      candidate: built.candidate,
      kind: "change-day-capacity",
    });
    if (!committed.ok || committed.status !== "committed") throw new Error("Expected commit");

    let restored: ScheduleCandidate | null = null;
    const undone = undoLastScheduleMutation({
      current: built.candidate,
      history: committed.history,
      saveSubjects: vi.fn(success),
      savePlannerSettings: vi.fn(success),
      applyCandidate: (candidate) => {
        restored = candidate;
      },
    });
    if (!undone.ok || !restored) throw new Error("Expected undo");

    const restoredPlan = buildFlexiblePlan({
      subjects: restored.subjects,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: restored.plannerSettings,
      fromISO: "2030-01-01",
      horizonDays: 2,
    });
    expect(restoredPlan).toEqual(beforePlan);
  });

  test("failed move persistence publishes neither the new date nor provenance", () => {
    const current = createScheduleSnapshot(catalog([lesson("first", "2030-01-01")]), settings(2));
    const built = buildMoveLessonDateCandidate({
      current,
      lessonId: "first",
      targetDateISO: "2030-01-03",
      now: () => new Date("2030-01-02T00:00:00.000Z"),
    });
    if (!built.ok) throw new Error(built.error);
    const applyCandidate = vi.fn();
    const result = commitScheduleMutation({
      current,
      candidate: built.candidate,
      history: [],
      kind: "move-lesson-date",
      description: "Di chuyển kiểm thử",
      saveSubjects: vi.fn(() => ({ ok: false, error: "write failed" })),
      savePlannerSettings: vi.fn(success),
      applyCandidate,
    });

    expect(result.ok).toBe(false);
    expect(applyCandidate).not.toHaveBeenCalled();
    expect(result.history).toEqual([]);
    expect(current.subjects[0].milestones[0].lessons[0].placementProvenance).toBeUndefined();
  });

  test("undo restores the previous date and previous provenance", () => {
    const current = createScheduleSnapshot(catalog([lesson("first", "2030-01-01")]), settings(2));
    current.subjects[0].milestones[0].lessons[0].placementProvenance = {
      kind: "manual-move",
      movedAt: "2030-01-01T00:00:00.000Z",
      fromDateISO: "2029-12-31",
      toDateISO: "2030-01-01",
    };
    const built = buildMoveLessonDateCandidate({
      current,
      lessonId: "first",
      targetDateISO: "2030-01-03",
      now: () => new Date("2030-01-02T00:00:00.000Z"),
    });
    if (!built.ok) throw new Error(built.error);
    const committed = commitCandidate({
      current,
      candidate: built.candidate,
      kind: "move-lesson-date",
    });
    if (!committed.ok || committed.status !== "committed") throw new Error("Expected commit");

    let restored: ScheduleCandidate | null = null;
    const undone = undoLastScheduleMutation({
      current: built.candidate,
      history: committed.history,
      saveSubjects: vi.fn(success),
      savePlannerSettings: vi.fn(success),
      applyCandidate: (candidate) => {
        restored = candidate;
      },
    });

    expect(undone.ok).toBe(true);
    expect(restored).toEqual(current);
  });

  test("moving a flexible earliest date later cannot make the lesson appear earlier", () => {
    const current = createScheduleSnapshot(catalog([lesson("later", "2030-01-01")]), settings(2));
    const built = buildMoveLessonDateCandidate({
      current,
      lessonId: "later",
      targetDateISO: "2030-01-03",
    });
    expect(built.ok).toBe(true);
    if (!built.ok) throw new Error(built.error);

    const plan = buildFlexiblePlan({
      subjects: built.candidate.subjects,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: built.candidate.plannerSettings,
      fromISO: "2030-01-01",
      horizonDays: 3,
    });

    expect(plan.map((day) => day.queue.newLessons.map((item) => item.id))).toEqual([
      [],
      [],
      ["later"],
    ]);
  });
});
