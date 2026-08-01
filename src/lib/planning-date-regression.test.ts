import fs from "node:fs/promises";
import { describe, expect, test } from "vitest";
import type { Lesson, Subject } from "./mock-data";
import {
  DEFAULT_PLANNER_SETTINGS,
  DEFAULT_STUDY_META,
  buildFlexiblePlan,
  pickDayQueue,
} from "./planner";

function lesson(
  id: string,
  title: string,
  sourceSubject: string,
  scheduledDate: string,
  minutes: number,
): Lesson {
  return {
    id,
    title,
    xp: 30,
    plannedDurationMinutes: minutes,
    scheduledDate,
    weekday: "",
    sourceSubject,
    week: 1,
    initialDone: false,
  };
}

const date = "2026-08-01";
const subjects: Subject[] = [
  {
    id: "toan",
    name: "Toán",
    emoji: "📐",
    milestones: [
      {
        id: "math-topic",
        title: "Toán",
        subtitle: "",
        lessons: [lesson("math-1", "Toán 1", "Toán", date, 120)],
      },
    ],
  },
  {
    id: "ly",
    name: "Vật lý",
    emoji: "⚛️",
    milestones: [
      {
        id: "physics-topic",
        title: "Vật lý",
        subtitle: "",
        lessons: [lesson("physics-1", "Lý 1", "Vật lý", date, 120)],
      },
    ],
  },
  {
    id: "english",
    name: "Tiếng Anh",
    emoji: "📘",
    milestones: [
      {
        id: "english-topic",
        title: "Đề GPT",
        subtitle: "",
        lessons: [
          lesson("english-1", "UNIT 1-3", "Tiếng Anh", date, 45),
          lesson("english-2", "UNIT 4-6", "Tiếng Anh", "2026-08-02", 45),
        ],
      },
    ],
  },
];

describe("scheduled lesson dates", () => {
  test("keeps every lesson assigned to the day visible and reports overload", () => {
    const queue = pickDayQueue({
      subjects,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: DEFAULT_PLANNER_SETTINGS,
      dateISO: date,
      hoursOverride: 4,
    });

    expect(queue.newLessons.map((item) => item.id)).toEqual(
      expect.arrayContaining(["math-1", "physics-1", "english-1"]),
    );
    expect(queue.newMinutes).toBe(285);
    expect(queue.overloadMinutes).toBe(45);
  });

  test("does not pull a future English lesson into the previous day", () => {
    const plan = buildFlexiblePlan({
      subjects,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: {
        ...DEFAULT_PLANNER_SETTINGS,
        todayHours: 6,
        defaultDailyHours: 6,
      },
      fromISO: date,
      horizonDays: 2,
    });

    expect(plan[0].queue.newLessons.map((item) => item.id)).toContain("english-1");
    expect(plan[0].queue.newLessons.map((item) => item.id)).not.toContain("english-2");
    expect(plan[1].queue.newLessons.map((item) => item.id)).toContain("english-2");
  });

  test("the original roadmap groups by the date entered by the user", async () => {
    const source = await fs.readFile(
      new URL("../components/LearningRoadmap.tsx", import.meta.url),
      "utf8",
    );

    expect(source).toContain("effectiveDate: lesson.scheduledDate");
    expect(source).not.toContain("shiftedDates[l.id]");
  });
});
