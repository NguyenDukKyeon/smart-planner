import { describe, expect, test, vi } from "vitest";
import type { Lesson, Subject } from "./mock-data";
import { DEFAULT_PLANNER_SETTINGS } from "./planner";
import { buildEditLessonCandidate } from "./schedule-candidates";
import { commitScheduleMutation, undoLastScheduleMutation } from "./schedule-mutation-controller";
import { createScheduleSnapshot, type ScheduleCandidate } from "./schedule-transactions";

const success = () => ({ ok: true }) as const;

function lesson(
  id: string,
  title: string,
  sourceSubject: string,
  topic: string,
  scheduledDate: string,
): Lesson {
  return {
    id,
    title,
    topic,
    xp: 20,
    plannedDurationMinutes: 60,
    scheduledDate,
    scheduleMode: "flexible",
    weekday: "",
    sourceSubject,
    week: 1,
    initialDone: false,
  };
}

function snapshot() {
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
            subtitle: "1 bài học",
            lessons: [lesson("lesson-1", "Bài một", "Môn nguồn", "Chủ đề A", "2030-01-01")],
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
            lessons: [lesson("lesson-2", "Bài hai", "Môn đích", "Chủ đề B", "2030-01-02")],
          },
        ],
      },
    ] satisfies Subject[],
    {
      ...DEFAULT_PLANNER_SETTINGS,
      todayHours: 2.5,
      defaultDailyHours: 2.5,
      dailyHours: { "2030-01-05": 4 },
    },
  );
}

describe("atomic Course Manager lesson edit transaction", () => {
  test("commits one history entry and undo restores the complete pre-edit snapshot", () => {
    const current = snapshot();
    const built = buildEditLessonCandidate({
      current,
      lessonId: "lesson-1",
      input: {
        title: "Bài đã chỉnh",
        subjectId: "target-subject",
        topicId: "target-topic",
        plannedDurationMinutes: 75,
        scheduledDate: "2030-02-03",
        scheduleMode: "fixed",
      },
    });
    expect(built.ok).toBe(true);
    if (!built.ok) throw new Error(built.error);

    const committed = commitScheduleMutation({
      current,
      candidate: built.candidate,
      history: [],
      kind: "edit-lesson",
      description: "Chỉnh sửa bài học kiểm thử",
      saveSubjects: vi.fn(success),
      savePlannerSettings: vi.fn(success),
      backupSubjects: vi.fn(success),
      applyCandidate: vi.fn(),
      idFactory: () => "edit-mutation-1",
    });

    expect(committed.ok).toBe(true);
    if (!committed.ok || committed.status !== "committed") {
      throw new Error("Expected committed lesson edit");
    }
    expect(committed.history).toHaveLength(1);
    expect(committed.history[0]).toMatchObject({
      id: "edit-mutation-1",
      kind: "edit-lesson",
      before: current,
    });

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
    if (!undone.ok || undone.status !== "undone") {
      throw new Error("Expected undone lesson edit");
    }
    expect(undone.history).toEqual([]);
    expect(restored).toEqual(current);
  });
});
