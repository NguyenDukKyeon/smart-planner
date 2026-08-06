import { describe, expect, test, vi } from "vitest";
import type { Lesson, LessonScheduleMode, Subject } from "./mock-data";
import { DEFAULT_PLANNER_SETTINGS } from "./planner";
import * as scheduleCandidates from "./schedule-candidates";
import type { ScheduleCandidateBuildResult } from "./schedule-candidates";
import { commitScheduleMutation, undoLastScheduleMutation } from "./schedule-mutation-controller";
import {
  createScheduleSnapshot,
  type ScheduleCandidate,
  type ScheduleSnapshot,
} from "./schedule-transactions";

type BulkLessonSchedulePatch = {
  scheduledDate?: string;
  scheduleMode?: LessonScheduleMode;
  plannedDurationMinutes?: number;
};

type Task3CandidateApi = {
  buildReorderSubjectCandidate(params: {
    current: ScheduleSnapshot;
    subjectId: string;
    direction: -1 | 1;
  }): ScheduleCandidateBuildResult;
  buildReorderTopicCandidate(params: {
    current: ScheduleSnapshot;
    subjectId: string;
    topicId: string;
    direction: -1 | 1;
  }): ScheduleCandidateBuildResult;
  buildMoveLessonsCandidate(params: {
    current: ScheduleSnapshot;
    lessonIds: Iterable<string>;
    targetSubjectId: string;
    targetTopicId?: string;
  }): ScheduleCandidateBuildResult;
  buildBulkLessonUpdateCandidate(params: {
    current: ScheduleSnapshot;
    lessonIds: Iterable<string>;
    patch: BulkLessonSchedulePatch;
  }): ScheduleCandidateBuildResult;
};

const {
  buildReorderSubjectCandidate,
  buildReorderTopicCandidate,
  buildMoveLessonsCandidate,
  buildBulkLessonUpdateCandidate,
} = scheduleCandidates as unknown as Task3CandidateApi;

const success = () => ({ ok: true }) as const;

function lesson(params: {
  id: string;
  sourceSubject: string;
  topic: string;
  scheduledDate: string;
  scheduleMode?: LessonScheduleMode;
}): Lesson {
  return {
    id: params.id,
    title: params.id,
    xp: 20,
    plannedDurationMinutes: 60,
    scheduledDate: params.scheduledDate,
    scheduleMode: params.scheduleMode ?? "flexible",
    weekday: "",
    sourceSubject: params.sourceSubject,
    topic: params.topic,
    week: 1,
    initialDone: false,
  };
}

function task3Snapshot(): ScheduleSnapshot {
  return createScheduleSnapshot(
    [
      {
        id: "source-subject",
        name: "Môn nguồn",
        emoji: "📘",
        milestones: [
          {
            id: "source-topic-a",
            title: "Chủ đề A",
            subtitle: "2 bài học",
            lessons: [
              lesson({
                id: "lesson-1",
                sourceSubject: "Môn nguồn",
                topic: "Chủ đề A",
                scheduledDate: "2030-01-01",
              }),
              lesson({
                id: "lesson-2",
                sourceSubject: "Môn nguồn",
                topic: "Chủ đề A",
                scheduledDate: "",
              }),
            ],
          },
          {
            id: "source-topic-b",
            title: "Chủ đề B",
            subtitle: "1 bài học",
            lessons: [
              lesson({
                id: "lesson-3",
                sourceSubject: "Môn nguồn",
                topic: "Chủ đề B",
                scheduledDate: "2030-01-03",
                scheduleMode: "fixed",
              }),
            ],
          },
        ],
      },
      {
        id: "target-subject",
        name: "Môn đích",
        emoji: "📗",
        milestones: [
          {
            id: "target-topic-a",
            title: "Chủ đề C",
            subtitle: "1 bài học",
            lessons: [
              lesson({
                id: "lesson-4",
                sourceSubject: "Môn đích",
                topic: "Chủ đề C",
                scheduledDate: "2030-01-04",
              }),
            ],
          },
          {
            id: "target-topic-b",
            title: "Chủ đề D",
            subtitle: "1 bài học",
            lessons: [
              lesson({
                id: "lesson-5",
                sourceSubject: "Môn đích",
                topic: "Chủ đề D",
                scheduledDate: "2030-01-05",
                scheduleMode: "fixed",
              }),
            ],
          },
        ],
      },
      {
        id: "third-subject",
        name: "Môn thứ ba",
        emoji: "📙",
        milestones: [
          {
            id: "third-topic",
            title: "Chủ đề E",
            subtitle: "1 bài học",
            lessons: [
              lesson({
                id: "lesson-6",
                sourceSubject: "Môn thứ ba",
                topic: "Chủ đề E",
                scheduledDate: "2030-01-06",
              }),
            ],
          },
        ],
      },
    ],
    DEFAULT_PLANNER_SETTINGS,
  );
}

function allIds(subjects: Subject[]): {
  subjectIds: string[];
  topicIds: string[];
  lessonIds: string[];
} {
  return {
    subjectIds: subjects.map((subject) => subject.id),
    topicIds: subjects.flatMap((subject) => subject.milestones.map((topic) => topic.id)),
    lessonIds: subjects.flatMap((subject) =>
      subject.milestones.flatMap((topic) => topic.lessons.map((item) => item.id)),
    ),
  };
}

function lessonById(subjects: Subject[], lessonId: string): Lesson | undefined {
  return subjects
    .flatMap((subject) => subject.milestones)
    .flatMap((topic) => topic.lessons)
    .find((item) => item.id === lessonId);
}

describe("Task 3 Course Manager candidates", () => {
  test("subject reorder preserves every nested ID", () => {
    const current = task3Snapshot();
    const before = allIds(current.subjects);
    const result = buildReorderSubjectCandidate({
      current,
      subjectId: "target-subject",
      direction: -1,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.candidate.subjects.map((subject) => subject.id)).toEqual([
      "target-subject",
      "source-subject",
      "third-subject",
    ]);
    expect(allIds(result.candidate.subjects).topicIds.sort()).toEqual(before.topicIds.sort());
    expect(allIds(result.candidate.subjects).lessonIds.sort()).toEqual(before.lessonIds.sort());
    expect(current.subjects.map((subject) => subject.id)).toEqual([
      "source-subject",
      "target-subject",
      "third-subject",
    ]);
  });

  test.each([["source-subject", -1] as const, ["third-subject", 1] as const])(
    "subject boundary %s/%s returns a detached no-op",
    (subjectId, direction) => {
      const current = task3Snapshot();
      const result = buildReorderSubjectCandidate({ current, subjectId, direction });

      expect(result.ok).toBe(true);
      if (!result.ok) throw new Error(result.error);
      expect(result.candidate).toEqual(current);
      expect(result.candidate).not.toBe(current);
    },
  );

  test.each([["source-topic-a", -1] as const, ["source-topic-b", 1] as const])(
    "topic boundary %s/%s returns a detached no-op",
    (topicId, direction) => {
      const current = task3Snapshot();
      const result = buildReorderTopicCandidate({
        current,
        subjectId: "source-subject",
        topicId,
        direction,
      });

      expect(result.ok).toBe(true);
      if (!result.ok) throw new Error(result.error);
      expect(result.candidate).toEqual(current);
      expect(result.candidate).not.toBe(current);
    },
  );

  test("topic reorder rejects a topic owned by another subject", () => {
    const current = task3Snapshot();
    const result = buildReorderTopicCandidate({
      current,
      subjectId: "source-subject",
      topicId: "target-topic-a",
      direction: 1,
    });

    expect(result.ok).toBe(false);
    expect(current).toEqual(task3Snapshot());
  });

  test("moving lessons deduplicates selected IDs", () => {
    const current = task3Snapshot();
    const result = buildMoveLessonsCandidate({
      current,
      lessonIds: ["lesson-1", "lesson-1", "lesson-2"],
      targetSubjectId: "target-subject",
      targetTopicId: "target-topic-b",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    const targetIds = result.candidate.subjects[1].milestones[1].lessons.map((item) => item.id);
    expect(targetIds.filter((id) => id === "lesson-1")).toHaveLength(1);
    expect(targetIds.filter((id) => id === "lesson-2")).toHaveLength(1);
    expect(allIds(result.candidate.subjects).lessonIds.sort()).toEqual(
      allIds(current.subjects).lessonIds.sort(),
    );
  });

  test("moving lessons rejects an empty selection", () => {
    expect(
      buildMoveLessonsCandidate({
        current: task3Snapshot(),
        lessonIds: [],
        targetSubjectId: "target-subject",
      }).ok,
    ).toBe(false);
  });

  test("moving lessons rejects one missing selected lesson without changing the snapshot", () => {
    const current = task3Snapshot();
    const before = structuredClone(current);
    const result = buildMoveLessonsCandidate({
      current,
      lessonIds: ["lesson-1", "missing"],
      targetSubjectId: "target-subject",
      targetTopicId: "target-topic-a",
    });

    expect(result.ok).toBe(false);
    expect(current).toEqual(before);
  });

  test.each([
    ["missing-subject", undefined],
    ["target-subject", "missing-topic"],
    ["source-subject", "target-topic-a"],
  ])("moving lessons validates destination %s/%s", (targetSubjectId, targetTopicId) => {
    const result = buildMoveLessonsCandidate({
      current: task3Snapshot(),
      lessonIds: ["lesson-1"],
      targetSubjectId,
      targetTopicId,
    });

    expect(result.ok).toBe(false);
  });

  test("moving without an explicit topic uses the target subject's first topic", () => {
    const result = buildMoveLessonsCandidate({
      current: task3Snapshot(),
      lessonIds: ["lesson-1"],
      targetSubjectId: "target-subject",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.candidate.subjects[1].milestones[0].lessons.map((item) => item.id)).toContain(
      "lesson-1",
    );
    expect(result.candidate.subjects[1].milestones[1].lessons.map((item) => item.id)).not.toContain(
      "lesson-1",
    );
  });

  test.each([0, 1441])("bulk duration rejects %s outside 1..1440", (plannedDurationMinutes) => {
    const result = buildBulkLessonUpdateCandidate({
      current: task3Snapshot(),
      lessonIds: ["lesson-1"],
      patch: { plannedDurationMinutes },
    });

    expect(result.ok).toBe(false);
  });

  test("bulk fixed mode rejects any resulting lesson without a valid date", () => {
    const result = buildBulkLessonUpdateCandidate({
      current: task3Snapshot(),
      lessonIds: ["lesson-1", "lesson-2"],
      patch: { scheduleMode: "fixed" },
    });

    expect(result.ok).toBe(false);
  });

  test("bulk empty date is allowed when every resulting mode is flexible", () => {
    const result = buildBulkLessonUpdateCandidate({
      current: task3Snapshot(),
      lessonIds: ["lesson-1", "lesson-2"],
      patch: { scheduledDate: "", scheduleMode: "flexible" },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(lessonById(result.candidate.subjects, "lesson-1")?.scheduledDate).toBe("");
    expect(lessonById(result.candidate.subjects, "lesson-2")?.scheduledDate).toBe("");
  });

  test("bulk empty date rejects a resulting fixed lesson", () => {
    const result = buildBulkLessonUpdateCandidate({
      current: task3Snapshot(),
      lessonIds: ["lesson-3"],
      patch: { scheduledDate: "" },
    });

    expect(result.ok).toBe(false);
  });

  test("bulk invalid date rejects the entire operation", () => {
    const current = task3Snapshot();
    const before = structuredClone(current);
    const result = buildBulkLessonUpdateCandidate({
      current,
      lessonIds: ["lesson-1", "lesson-4"],
      patch: { scheduledDate: "2030-02-30" },
    });

    expect(result.ok).toBe(false);
    expect(current).toEqual(before);
  });

  test("bulk no-op returns a detached unchanged candidate", () => {
    const current = task3Snapshot();
    const result = buildBulkLessonUpdateCandidate({
      current,
      lessonIds: ["lesson-1"],
      patch: { plannedDurationMinutes: 60 },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.candidate).toEqual(current);
    expect(result.candidate).not.toBe(current);
  });

  test("one bulk action creates one history entry and undo restores the complete snapshot", () => {
    const current = task3Snapshot();
    const built = buildBulkLessonUpdateCandidate({
      current,
      lessonIds: ["lesson-1", "lesson-2"],
      patch: {
        scheduledDate: "2030-02-01",
        scheduleMode: "fixed",
        plannedDurationMinutes: 90,
      },
    });
    expect(built.ok).toBe(true);
    if (!built.ok) throw new Error(built.error);

    const committed = commitScheduleMutation({
      current,
      candidate: built.candidate,
      history: [],
      kind: "bulk-schedule-update",
      description: "Cập nhật lịch hàng loạt",
      saveSubjects: vi.fn(success),
      savePlannerSettings: vi.fn(success),
      backupSubjects: vi.fn(success),
      applyCandidate: vi.fn(),
      idFactory: () => "bulk-1",
    });
    expect(committed.ok).toBe(true);
    if (!committed.ok || committed.status !== "committed") {
      throw new Error("Expected committed bulk update");
    }
    expect(committed.history).toHaveLength(1);
    expect(committed.history[0].kind).toBe("bulk-schedule-update");

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
});
