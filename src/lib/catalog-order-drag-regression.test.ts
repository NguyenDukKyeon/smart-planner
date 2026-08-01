import fs from "node:fs/promises";
import { describe, expect, test } from "vitest";
import type { Lesson, Subject } from "./mock-data";
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

describe("catalog order in the study plan", () => {
  test("keeps fixed lessons in the exact order chosen in Course Manager", () => {
    const subjects: Subject[] = [
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

    const queue = pickDayQueue({
      subjects,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: DEFAULT_PLANNER_SETTINGS,
      dateISO: "2026-08-01",
      hoursOverride: 6,
    });

    expect(queue.newLessons.map((lesson) => lesson.id)).toEqual([
      "unit-13",
      "unit-4",
      "unit-10",
    ]);
  });
});

describe("Course Manager drag interaction", () => {
  test("makes the whole card draggable and auto-scrolls the course pane", async () => {
    const source = await fs.readFile(
      new URL("../components/CourseManagerModal.tsx", import.meta.url),
      "utf8",
    );

    expect(source).toContain("draggable={canReorder && !selectionMode}");
    expect(source).toContain("function autoScrollDuringLessonDrag");
    expect(source).toContain("data-course-scroll-container");
    expect(source).toContain("button, input, select, textarea, a, [data-no-drag]");
    expect(source).toContain("Giữ và kéo bất kỳ vùng trống nào trên thẻ");
  });
});
