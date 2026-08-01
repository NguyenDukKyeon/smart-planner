import fs from "node:fs/promises";
import { describe, expect, test } from "vitest";
import {
  addCustomLessonToSubjects,
  convertRawToSubjects,
  moveLessonsToTopic,
} from "./custom-subjects";

describe("add lesson topic selection", () => {
  test("adds a lesson to an existing topic", () => {
    const subjects = convertRawToSubjects([
      {
        subject: "Tiếng Anh",
        topic: "Unit 1",
        lessonId: "english-reading",
        title: "Reading",
        estimatedMinutes: 30,
        scheduledDate: "2026-08-01",
      },
      {
        subject: "Tiếng Anh",
        topic: "Unit 2",
        lessonId: "english-listening",
        title: "Listening",
        estimatedMinutes: 30,
        scheduledDate: "2026-08-02",
      },
    ]);

    const updated = addCustomLessonToSubjects(subjects, {
      subject: "Tiếng Anh",
      topic: "Unit 2",
      title: "Vocabulary",
      estimatedMinutes: 45,
      scheduledDate: "2026-08-03",
    });

    const unit2 = updated[0].milestones.find((milestone) => milestone.title === "Unit 2");
    expect(unit2?.lessons.map((lesson) => lesson.title)).toEqual(["Listening", "Vocabulary"]);
  });

  test("targets the exact selected topic ID when topic names repeat", () => {
    const subjects = convertRawToSubjects([
      {
        subject: "Tiếng Anh",
        topic: "Ôn tập",
        lessonId: "review-first",
        title: "Review 1",
        estimatedMinutes: 30,
        scheduledDate: "2026-08-01",
      },
      {
        subject: "Tiếng Anh",
        topic: "Unit 1",
        lessonId: "unit-one",
        title: "Reading",
        estimatedMinutes: 30,
        scheduledDate: "2026-08-02",
      },
      {
        subject: "Tiếng Anh",
        topic: "Ôn tập",
        lessonId: "review-second",
        title: "Review 2",
        estimatedMinutes: 30,
        scheduledDate: "2026-08-03",
      },
    ]);
    const subject = subjects[0];
    const targetTopic = subject.milestones[2];
    const previousIds = new Set(
      subject.milestones.flatMap((milestone) => milestone.lessons.map((lesson) => lesson.id)),
    );

    const added = addCustomLessonToSubjects(subjects, {
      subject: subject.name,
      topic: targetTopic.title,
      title: "Review 3",
      estimatedMinutes: 45,
      scheduledDate: "2026-08-04",
    });
    const newLesson = added[0].milestones
      .flatMap((milestone) => milestone.lessons)
      .find((lesson) => !previousIds.has(lesson.id));
    expect(newLesson).toBeDefined();

    const moved = moveLessonsToTopic(
      added,
      [newLesson!.id],
      subject.id,
      targetTopic.id,
    );
    expect(
      moved[0].milestones.find((milestone) => milestone.id === targetTopic.id)?.lessons.map(
        (lesson) => lesson.title,
      ),
    ).toEqual(["Review 2", "Review 3"]);
  });

  test("creates a new topic when a new topic name is entered", () => {
    const subjects = convertRawToSubjects([
      {
        subject: "Tiếng Anh",
        topic: "Unit 1",
        title: "Reading",
        estimatedMinutes: 30,
        scheduledDate: "2026-08-01",
      },
    ]);
    const updated = addCustomLessonToSubjects(subjects, {
      subject: "Tiếng Anh",
      topic: "Unit 2",
      title: "Vocabulary",
      estimatedMinutes: 45,
      scheduledDate: "2026-08-02",
    });

    expect(updated[0].milestones.map((milestone) => milestone.title)).toEqual(["Unit 1", "Unit 2"]);
  });

  test("exposes subject and topic selectors in the add lesson form", async () => {
    const source = await fs.readFile(
      new URL("../components/AddLessonModal.tsx", import.meta.url),
      "utf8",
    );
    expect(source).toContain('aria-label="Chọn môn học"');
    expect(source).toContain('aria-label="Chọn chủ đề"');
    expect(source).toContain("＋ Tạo chủ đề mới…");
    expect(source).toContain("moveLessonsToTopic");
  });
});
