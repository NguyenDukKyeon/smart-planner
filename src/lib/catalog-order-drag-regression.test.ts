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
  test("extracts visual drag units while the modal owns every reorder transaction", async () => {
    const [modalSource, hookSource, rowSource, topicSource] = await Promise.all([
      fs.readFile(new URL("../components/CourseManagerModal.tsx", import.meta.url), "utf8"),
      fs.readFile(
        new URL("../components/course-manager/useLessonReorder.ts", import.meta.url),
        "utf8",
      ),
      fs.readFile(new URL("../components/course-manager/LessonRow.tsx", import.meta.url), "utf8"),
      fs.readFile(
        new URL("../components/course-manager/TopicSection.tsx", import.meta.url),
        "utf8",
      ),
    ]);

    expect(rowSource).toContain("Kéo một lần bằng tay cầm để đổi vị trí");
    expect(rowSource).toContain("application/x-smart-lesson-id");
    expect(rowSource).toContain("setDragImage");
    expect(rowSource).toContain("draggable={false}");
    expect(rowSource).toContain("Di chuyển lên");
    expect(rowSource).toContain("Di chuyển xuống");
    expect(rowSource).not.toContain("Lần 2: giữ và kéo");

    expect(topicSource).toContain("Chèn phía trên");
    expect(topicSource).toContain("Chèn phía dưới");
    expect(topicSource).toContain("autoScrollDuringLessonDrag");
    expect(topicSource).toContain("data-course-scroll-container");

    for (const source of [hookSource, rowSource, topicSource]) {
      expect(source).not.toContain("schedule-candidates");
      expect(source).not.toContain("executeMutation");
      expect(source).not.toContain("localStorage");
      expect(source).not.toContain("sessionStorage");
    }

    expect(hookSource).toContain("draggedLessonId");
    expect(hookSource).toContain("dragOverLocation");
    expect(hookSource).toContain("beforeLessonId");
    expect(hookSource).toContain("resetDrag");

    expect(modalSource).toContain("useLessonReorder");
    expect(modalSource).toContain("LessonRow");
    expect(modalSource).toContain("TopicSection");
    expect(modalSource).toMatch(
      /buildReorderSubjectCandidate\([\s\S]*?commitReorder\(\s*built,\s*"reorder-subject"/,
    );
    expect(modalSource).toMatch(
      /buildReorderTopicCandidate\([\s\S]*?commitReorder\(\s*built,\s*"reorder-topic"/,
    );
    expect(modalSource).toMatch(
      /buildReorderLessonCandidate\([\s\S]*?commitReorder\(\s*built,\s*"reorder-lesson"/,
    );
    expect(modalSource).toContain("scheduleTransactions.executeMutation({");
    expect(modalSource).toContain("kind,");
    expect(modalSource).toContain('filter === "all"');
    expect(modalSource).toContain('sort === "roadmap"');
    expect(modalSource).toContain("lessonSearch.trim()");
  });

  test("preserves predecessor topic and lesson presentation around transactional reorder", async () => {
    const [modalSource, rowSource, topicSource] = await Promise.all([
      fs.readFile(new URL("../components/CourseManagerModal.tsx", import.meta.url), "utf8"),
      fs.readFile(new URL("../components/course-manager/LessonRow.tsx", import.meta.url), "utf8"),
      fs.readFile(
        new URL("../components/course-manager/TopicSection.tsx", import.meta.url),
        "utf8",
      ),
    ]);

    expect(topicSource).toContain("Collapsible");
    expect(topicSource).toContain("<Collapsible");
    expect(topicSource).toContain("<CollapsibleTrigger");
    expect(topicSource).toContain("<CollapsibleContent");
    expect(topicSource).toContain("ChevronDown");
    expect(topicSource).toContain("completedCount");
    expect(topicSource).toContain("remainingMinutes");
    expect(topicSource).toContain("còn lại");
    expect(topicSource).toContain("h-0.5 bg-indigo-600");
    expect(topicSource).toMatch(/h-0\.5 bg-indigo-600[\s\S]*?\{label\}/);
    expect(topicSource).not.toContain('<span className="sr-only">{label}</span>');

    for (const label of [
      "Hoàn thành",
      "Đang học",
      "Chưa bắt đầu",
      "Nhân bản bài học",
      "Lưu trữ",
      "Xóa bài học",
    ]) {
      expect(rowSource).toContain(label);
    }
    expect(rowSource).toContain("{minutes} / {lesson.plannedDurationMinutes} phút · {percent}%");
    expect(rowSource).toContain("<DropdownMenu>");
    expect(rowSource).toContain("onMoveToSubject");
    expect(rowSource).toContain("Chuyển sang");
    expect(rowSource).toContain("subjects");

    expect(modalSource).toContain("const moveSingleLessonToSubject");
    expect(modalSource).toMatch(
      /buildMoveLessonsCandidate\(\{[\s\S]*?lessonIds: \[lessonId\][\s\S]*?targetSubjectId[\s\S]*?commitReorder\([\s\S]*?"move-lessons"/,
    );
  });
});
