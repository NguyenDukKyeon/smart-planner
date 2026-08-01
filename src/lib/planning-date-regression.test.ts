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
    id: "hoa",
    name: "Hóa học",
    emoji: "🧪",
    milestones: [
      {
        id: "chemistry-topic",
        title: "Hóa học",
        subtitle: "",
        lessons: [lesson("chemistry-1", "Hóa 1", "Hóa học", date, 120)],
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
  test("caps the adjusted day at capacity while still considering a newly added subject", () => {
    const queue = pickDayQueue({
      subjects,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: DEFAULT_PLANNER_SETTINGS,
      dateISO: date,
      hoursOverride: 3,
    });

    expect(queue.newLessons.map((item) => item.id)).toContain("english-1");
    expect(queue.newLessons.map((item) => item.id)).not.toContain("english-2");
    expect(queue.newMinutes).toBeLessThanOrEqual(queue.quotaMinutes);
    expect(queue.overloadMinutes).toBe(0);
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

    expect(plan[0].queue.newLessons.map((item) => item.id)).not.toContain("english-2");
    expect(plan[1].queue.newLessons.map((item) => item.id)).toContain("english-2");
  });

  test("does not inject a whole same-date backlog into one day", () => {
    const backlog: Subject[] = [
      {
        id: "backlog",
        name: "Backlog",
        emoji: "📚",
        milestones: [
          {
            id: "backlog-topic",
            title: "Backlog",
            subtitle: "",
            lessons: Array.from({ length: 100 }, (_, index) =>
              lesson(`backlog-${index}`, `Bài ${index + 1}`, "Backlog", date, 120),
            ),
          },
        ],
      },
    ];

    const queue = pickDayQueue({
      subjects: backlog,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: DEFAULT_PLANNER_SETTINGS,
      dateISO: date,
      hoursOverride: 3,
    });

    expect(queue.newLessons).toHaveLength(1);
    expect(queue.newMinutes).toBe(120);
    expect(queue.overloadMinutes).toBe(0);
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
