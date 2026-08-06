import { describe, expect, test } from "vitest";
import type { Lesson, LessonScheduleMode, Subject } from "./mock-data";
import {
  DEFAULT_PLANNER_SETTINGS,
  DEFAULT_STUDY_META,
  buildFlexiblePlan,
  pickDayQueue,
  reviewTaskId,
} from "./planner";

function lesson(
  id: string,
  scheduledDate: string,
  scheduleMode: LessonScheduleMode = "flexible",
  plannedDurationMinutes = 60,
): Lesson {
  return {
    id,
    title: id,
    xp: 20,
    plannedDurationMinutes,
    scheduledDate,
    scheduleMode,
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

function settings(hours = 1) {
  return {
    ...DEFAULT_PLANNER_SETTINGS,
    todayHours: hours,
    defaultDailyHours: hours,
    dailyHours: {},
  };
}

describe("fixed lesson invariants", () => {
  test("a fixed lesson is eligible only on its exact date", () => {
    const fixed = lesson("fixed", "2030-01-02", "fixed");
    const plan = buildFlexiblePlan({
      subjects: catalog([fixed]),
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: settings(2),
      fromISO: "2030-01-01",
      horizonDays: 3,
    });

    expect(plan[0].queue.newLessons).toEqual([]);
    expect(plan[1].queue.newLessons.map((item) => item.id)).toEqual(["fixed"]);
    expect(plan[2].queue.newLessons).toEqual([]);
  });

  test("a fixed lesson that does not fit remains unplaced and is not counted as scheduled", () => {
    const fixed = lesson("fixed", "2030-01-02", "fixed", 90);
    const queue = pickDayQueue({
      subjects: catalog([fixed]),
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: settings(),
      dateISO: "2030-01-02",
      hoursOverride: 1,
    });

    expect(queue.newLessons).toEqual([]);
    expect(queue.newMinutes).toBe(0);
    expect(queue.unplacedFixedLessons.map((item) => item.id)).toEqual(["fixed"]);
    expect(queue.unplacedFixedMinutes).toBe(90);
  });

  test("a zero-capacity fixed date exposes the work as unplaced instead of carrying it", () => {
    const fixed = lesson("fixed", "2030-01-02", "fixed", 60);
    const plan = buildFlexiblePlan({
      subjects: catalog([fixed]),
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: {
        ...settings(8),
        dailyHours: { "2030-01-02": 0, "2030-01-03": 8 },
      },
      fromISO: "2030-01-02",
      horizonDays: 2,
    });

    expect(plan[0].queue.unplacedFixedLessons.map((item) => item.id)).toEqual(["fixed"]);
    expect(plan[1].queue.newLessons).toEqual([]);
    expect(plan[1].queue.unplacedFixedLessons).toEqual([]);
  });
});

describe("flexible lesson invariants", () => {
  test("a flexible lesson never appears before its earliest eligible date", () => {
    const flexible = lesson("flexible", "2030-01-02");
    const plan = buildFlexiblePlan({
      subjects: catalog([flexible]),
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: settings(2),
      fromISO: "2030-01-01",
      horizonDays: 2,
    });

    expect(plan[0].queue.newLessons).toEqual([]);
    expect(plan[1].queue.newLessons.map((item) => item.id)).toEqual(["flexible"]);
  });

  test("flexible lessons carry forward while preserving canonical order", () => {
    const lessons = [
      lesson("first", "2030-01-01"),
      lesson("second", "2030-01-01"),
      lesson("third", "2030-01-01"),
    ];
    const plan = buildFlexiblePlan({
      subjects: catalog(lessons),
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: settings(1),
      fromISO: "2030-01-01",
      horizonDays: 3,
    });

    expect(plan.map((day) => day.queue.newLessons.map((item) => item.id))).toEqual([
      ["first"],
      ["second"],
      ["third"],
    ]);
  });
});

describe("review invariants", () => {
  test("reviews are generated only for accepted intervals and keep their canonical identity", () => {
    const reviewed = lesson("reviewed", "2029-12-01");
    const refISO = "2030-01-10";
    const acceptedTaskId = reviewTaskId(reviewed.id, refISO);
    const accepted = pickDayQueue({
      subjects: catalog([reviewed]),
      completed: { [reviewed.id]: "2030-01-09" },
      meta: DEFAULT_STUDY_META,
      settings: { ...settings(1), reviewShareMax: 1, reviewCapMinutes: 60 },
      dateISO: refISO,
      hoursOverride: 1,
    });
    const rejected = pickDayQueue({
      subjects: catalog([reviewed]),
      completed: { [reviewed.id]: "2030-01-08" },
      meta: DEFAULT_STUDY_META,
      settings: { ...settings(1), reviewShareMax: 1, reviewCapMinutes: 60 },
      dateISO: refISO,
      hoursOverride: 1,
    });

    expect(accepted.reviewLessons[0]?.taskId).toBe(acceptedTaskId);
    expect(accepted.reviewLessons[0]?.lessonId).toBe("reviewed");
    expect(accepted.newLessons).toEqual([]);
    expect(rejected.reviewLessons).toEqual([]);
  });

  test("building review work does not mutate catalog ordering", () => {
    const subjects = catalog([lesson("first", "2029-12-01"), lesson("second", "2030-01-10")]);
    const before = structuredClone(subjects);

    pickDayQueue({
      subjects,
      completed: { first: "2030-01-09" },
      meta: DEFAULT_STUDY_META,
      settings: { ...settings(2), reviewShareMax: 1, reviewCapMinutes: 60 },
      dateISO: "2030-01-10",
      hoursOverride: 2,
    });

    expect(subjects).toEqual(before);
    expect(subjects[0].milestones[0].lessons.map((item) => item.id)).toEqual(["first", "second"]);
  });
});

describe("capacity accounting invariants", () => {
  test("sixteen hours produces exactly 960 quota minutes", () => {
    const queue = pickDayQueue({
      subjects: catalog([]),
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: settings(16),
      dateISO: "2030-01-01",
      hoursOverride: 16,
    });

    expect(queue.quotaMinutes).toBe(960);
    expect(queue.unallocatedMinutes).toBe(960);
  });

  test("unallocated and overload values follow the canonical formulas", () => {
    const newLesson = lesson("new", "2030-01-10", "flexible", 60);
    const reviewed = lesson("reviewed", "2029-12-01", "flexible", 60);
    const queue = pickDayQueue({
      subjects: catalog([reviewed, newLesson]),
      completed: { reviewed: "2030-01-09" },
      meta: DEFAULT_STUDY_META,
      settings: { ...settings(2), reviewShareMax: 1, reviewCapMinutes: 60 },
      dateISO: "2030-01-10",
      hoursOverride: 2,
    });

    expect(queue.unallocatedMinutes).toBe(
      Math.max(0, queue.quotaMinutes - queue.newMinutes - queue.reviewMinutes),
    );
    expect(queue.overloadMinutes).toBe(
      Math.max(0, queue.newMinutes + queue.reviewMinutes - queue.quotaMinutes),
    );
  });
});
