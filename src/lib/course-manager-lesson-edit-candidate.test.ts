import { describe, expect, test } from "vitest";
import type { Lesson, LessonScheduleMode, Subject } from "./mock-data";
import { DEFAULT_PLANNER_SETTINGS } from "./planner";
import * as scheduleCandidates from "./schedule-candidates";
import type { ScheduleCandidateBuildResult } from "./schedule-candidates";
import { createScheduleSnapshot, type ScheduleSnapshot } from "./schedule-transactions";

export type LessonEditorCandidateInput = {
  title: string;
  subjectId: string;
  topicId: string;
  plannedDurationMinutes: number;
  scheduledDate: string;
  scheduleMode: LessonScheduleMode;
};

type BuildEditLessonCandidate = (params: {
  current: ScheduleSnapshot;
  lessonId: string;
  input: LessonEditorCandidateInput;
}) => ScheduleCandidateBuildResult;

const buildEditLessonCandidate = (
  scheduleCandidates as unknown as {
    buildEditLessonCandidate: BuildEditLessonCandidate;
  }
).buildEditLessonCandidate;

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

function editSnapshot() {
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
            lessons: [
              lesson("lesson-1", "Bài một", "Môn nguồn", "Chủ đề A", "2030-01-01"),
              lesson("lesson-2", "Bài hai", "Môn nguồn", "Chủ đề A", "2030-01-02"),
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
            id: "target-topic",
            title: "Chủ đề B",
            subtitle: "1 bài học",
            lessons: [lesson("lesson-3", "Bài ba", "Môn đích", "Chủ đề B", "2030-01-03")],
          },
        ],
      },
    ] satisfies Subject[],
    DEFAULT_PLANNER_SETTINGS,
  );
}

function lessonIds(subjects: Subject[]): string[] {
  return subjects.flatMap((subject) =>
    subject.milestones.flatMap((milestone) => milestone.lessons.map((item) => item.id)),
  );
}

function findLesson(subjects: Subject[], lessonId: string): Lesson | undefined {
  return subjects
    .flatMap((subject) => subject.milestones)
    .flatMap((milestone) => milestone.lessons)
    .find((item) => item.id === lessonId);
}

function validInput(
  overrides: Partial<LessonEditorCandidateInput> = {},
): LessonEditorCandidateInput {
  return {
    title: "Bài đã chỉnh",
    subjectId: "target-subject",
    topicId: "target-topic",
    plannedDurationMinutes: 75,
    scheduledDate: "2030-02-03",
    scheduleMode: "fixed",
    ...overrides,
  };
}

describe("buildEditLessonCandidate", () => {
  test("updates title, duration, mode, date and destination in one candidate", () => {
    const current = editSnapshot();
    const result = buildEditLessonCandidate({
      current,
      lessonId: "lesson-1",
      input: validInput(),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    const changed = result.candidate.subjects[1].milestones[0].lessons.find(
      (item) => item.id === "lesson-1",
    );
    expect(changed).toMatchObject({
      id: "lesson-1",
      title: "Bài đã chỉnh",
      plannedDurationMinutes: 75,
      scheduledDate: "2030-02-03",
      scheduleMode: "fixed",
      sourceSubject: "Môn đích",
      topic: "Chủ đề B",
    });
    expect(result.candidate.subjects[0].milestones[0].lessons.map((item) => item.id)).toEqual([
      "lesson-2",
    ]);
    expect(current.subjects[0].milestones[0].lessons.map((item) => item.id)).toEqual([
      "lesson-1",
      "lesson-2",
    ]);
  });

  test("preserves the edited lesson ID and the complete unique lesson-ID set", () => {
    const current = editSnapshot();
    const result = buildEditLessonCandidate({
      current,
      lessonId: "lesson-1",
      input: validInput(),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(lessonIds(result.candidate.subjects).sort()).toEqual(lessonIds(current.subjects).sort());
    expect(new Set(lessonIds(result.candidate.subjects)).size).toBe(3);
    expect(findLesson(result.candidate.subjects, "lesson-1")?.id).toBe("lesson-1");
  });

  test("rejects an empty title", () => {
    expect(
      buildEditLessonCandidate({
        current: editSnapshot(),
        lessonId: "lesson-1",
        input: validInput({ title: "   " }),
      }),
    ).toEqual({ ok: false, error: "Tên bài học không được để trống." });
  });

  test.each([0, 1441])("rejects duration %s outside 1..1440", (plannedDurationMinutes) => {
    expect(
      buildEditLessonCandidate({
        current: editSnapshot(),
        lessonId: "lesson-1",
        input: validInput({ plannedDurationMinutes }),
      }),
    ).toEqual({ ok: false, error: "Thời lượng mục tiêu phải từ 1 đến 1440 phút." });
  });

  test("rejects fixed mode without an ISO date", () => {
    expect(
      buildEditLessonCandidate({
        current: editSnapshot(),
        lessonId: "lesson-1",
        input: validInput({ scheduledDate: "" }),
      }),
    ).toEqual({ ok: false, error: "Bài cố định cần một ngày hợp lệ." });
  });

  test("accepts flexible mode with an empty date", () => {
    const result = buildEditLessonCandidate({
      current: editSnapshot(),
      lessonId: "lesson-1",
      input: validInput({ scheduleMode: "flexible", scheduledDate: "" }),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(findLesson(result.candidate.subjects, "lesson-1")).toMatchObject({
      scheduleMode: "flexible",
      scheduledDate: "",
    });
  });

  test("rejects flexible mode with an invalid non-empty date", () => {
    expect(
      buildEditLessonCandidate({
        current: editSnapshot(),
        lessonId: "lesson-1",
        input: validInput({ scheduleMode: "flexible", scheduledDate: "2030-02-30" }),
      }),
    ).toEqual({ ok: false, error: "Ngày bắt đầu linh hoạt không hợp lệ." });
  });

  test.each([
    ["missing", "target-subject", "target-topic", "Không tìm thấy bài học để chỉnh sửa."],
    ["lesson-1", "missing", "target-topic", "Vui lòng chọn môn học đích hợp lệ."],
    ["lesson-1", "target-subject", "missing", "Vui lòng chọn chủ đề đích hợp lệ."],
  ])(
    "rejects missing lesson, subject or topic (%s / %s / %s)",
    (lessonId, subjectId, topicId, error) => {
      expect(
        buildEditLessonCandidate({
          current: editSnapshot(),
          lessonId,
          input: validInput({ subjectId, topicId }),
        }),
      ).toEqual({ ok: false, error });
    },
  );

  test("returns a detached no-op candidate for an unchanged draft", () => {
    const current = editSnapshot();
    const result = buildEditLessonCandidate({
      current,
      lessonId: "lesson-1",
      input: {
        title: "Bài một",
        subjectId: "source-subject",
        topicId: "source-topic",
        plannedDurationMinutes: 60,
        scheduledDate: "2030-01-01",
        scheduleMode: "flexible",
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.candidate).toEqual(current);
    expect(result.candidate).not.toBe(current);
    expect(result.candidate.subjects).not.toBe(current.subjects);
  });
});
