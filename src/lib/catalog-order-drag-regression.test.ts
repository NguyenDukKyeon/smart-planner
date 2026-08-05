import fs from "node:fs/promises";
import { describe, expect, test } from "vitest";
import type { Lesson, Subject } from "./mock-data";
import { moveLessonBeforeInTopic } from "./custom-subjects";
import { DEFAULT_PLANNER_SETTINGS, DEFAULT_STUDY_META, pickDayQueue } from "./planner";

function fixedLesson(id: string, title: string): Lesson {
  return {
    id,
    title,
    xp: 30,
    plannedDurationMinutes: 90,
    scheduledDate: "2026-08-01",
    scheduleMode: "fixed",
    weekday: "Thứ 7",
    sourceSubject: "Tiếng Anh",
    week: 1,
    initialDone: false,
  };
}

function catalogSubjects(): Subject[] {
  return [
    {
      id: "english",
      name: "Tiếng Anh",
      emoji: "📘",
      milestones: [
        {
          id: "focus-exercises",
          title: "BÀI TẬP TRUNG TÂM",
          subtitle: "3 bài học",
          lessons: [
            fixedLesson("unit-13", "BÀI TẬP UNIT 13"),
            fixedLesson("unit-4", "BÀI TẬP UNIT 4"),
            fixedLesson("unit-10", "BÀI TẬP UNIT 10"),
          ],
        },
      ],
    },
  ];
}

describe("catalog order in the study plan", () => {
  test("keeps fixed lessons in the exact order chosen in Course Manager", () => {
    const subjects = catalogSubjects();
    const queue = pickDayQueue({
      subjects,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: DEFAULT_PLANNER_SETTINGS,
      dateISO: "2026-08-01",
      hoursOverride: 6,
    });

    expect(queue.newLessons.map((lesson) => lesson.id)).toEqual(["unit-13", "unit-4", "unit-10"]);
  });

  test("supports inserting before a lesson and after the final lesson", () => {
    const subjects = catalogSubjects();
    const movedFirst = moveLessonBeforeInTopic(
      subjects,
      "english",
      "focus-exercises",
      "unit-10",
      "unit-13",
    );
    expect(movedFirst[0].milestones[0].lessons.map((lesson) => lesson.id)).toEqual([
      "unit-10",
      "unit-13",
      "unit-4",
    ]);

    const movedLast = moveLessonBeforeInTopic(
      movedFirst,
      "english",
      "focus-exercises",
      "unit-10",
      null,
    );
    expect(movedLast[0].milestones[0].lessons.map((lesson) => lesson.id)).toEqual([
      "unit-13",
      "unit-4",
      "unit-10",
    ]);
  });
});

describe("Course Manager drag interaction", () => {
  test("starts from a dedicated handle and shows an exact drop boundary", async () => {
    const source = await fs.readFile(
      new URL("../components/CourseManagerModal.tsx", import.meta.url),
      "utf8",
    );

    expect(source).toContain("Kéo một lần bằng tay cầm để đổi vị trí");
    expect(source).toContain("application/x-smart-lesson-id");
    expect(source).toContain("setDragImage");
    expect(source).toContain("Chèn phía trên");
    expect(source).toContain("Chèn phía dưới");
    expect(source).toContain("function autoScrollDuringLessonDrag");
    expect(source).toContain("data-course-scroll-container");
    expect(source).not.toContain("Lần 2: giữ và kéo");
  });
});
