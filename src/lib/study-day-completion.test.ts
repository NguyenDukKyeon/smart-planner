import { describe, expect, test } from "vitest";
import type { Lesson, Subject } from "./mock-data";
import {
  DEFAULT_PLANNER_SETTINGS,
  DEFAULT_STUDY_META,
  reviewTaskId,
} from "./planner";
import { isStudyDayQueueComplete } from "./study-day-completion";

const dateISO = "2026-08-05";

function lesson(id: string, scheduledDate: string): Lesson {
  return {
    id,
    title: id,
    xp: 10,
    plannedDurationMinutes: 60,
    scheduledDate,
    weekday: "",
    sourceSubject: "Toán",
    week: 1,
    initialDone: false,
  };
}

const dueLesson = lesson("due-today", dateISO);
const futureLesson = lesson("future-lesson", "2026-08-06");
const subjects: Subject[] = [
  {
    id: "toan",
    name: "Toán",
    emoji: "📐",
    milestones: [
      {
        id: "topic",
        title: "Chủ đề",
        subtitle: "",
        lessons: [dueLesson, futureLesson],
      },
    ],
  },
];

const settings = {
  ...DEFAULT_PLANNER_SETTINGS,
  todayHours: 1,
  defaultDailyHours: 1,
};

describe("strict study-day queue completion", () => {
  test("requires the lesson that belonged to today's queue", () => {
    expect(
      isStudyDayQueueComplete({
        subjects,
        completed: {},
        reviewCompletions: {},
        meta: DEFAULT_STUDY_META,
        settings,
        dateISO,
      }),
    ).toBe(false);

    expect(
      isStudyDayQueueComplete({
        subjects,
        completed: { [dueLesson.id]: dateISO },
        reviewCompletions: {},
        meta: DEFAULT_STUDY_META,
        settings,
        dateISO,
      }),
    ).toBe(true);
  });

  test("does not let an off-queue completion replace the required lesson", () => {
    expect(
      isStudyDayQueueComplete({
        subjects,
        completed: { [futureLesson.id]: dateISO },
        reviewCompletions: {},
        meta: DEFAULT_STUDY_META,
        settings,
        dateISO,
      }),
    ).toBe(false);
  });

  test("requires a due review to be completed on the same day", () => {
    const completedISO = "2026-08-04";
    const taskId = reviewTaskId(dueLesson.id, dateISO);
    const reviewSettings = {
      ...settings,
      todayHours: 1,
      reviewShareMax: 1,
      reviewCapMinutes: 60,
    };

    expect(
      isStudyDayQueueComplete({
        subjects,
        completed: { [dueLesson.id]: completedISO },
        reviewCompletions: {},
        meta: DEFAULT_STUDY_META,
        settings: reviewSettings,
        dateISO,
      }),
    ).toBe(false);

    expect(
      isStudyDayQueueComplete({
        subjects,
        completed: { [dueLesson.id]: completedISO },
        reviewCompletions: { [taskId]: dateISO },
        meta: DEFAULT_STUDY_META,
        settings: reviewSettings,
        dateISO,
      }),
    ).toBe(true);
  });

  test("does not award an empty day", () => {
    expect(
      isStudyDayQueueComplete({
        subjects: [],
        completed: {},
        reviewCompletions: {},
        meta: DEFAULT_STUDY_META,
        settings,
        dateISO,
      }),
    ).toBe(false);
  });
});
