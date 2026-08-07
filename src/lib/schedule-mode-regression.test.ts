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
  scheduledDate: string,
  scheduleMode: "fixed" | "flexible" | undefined,
): Lesson {
  return {
    id,
    title: id,
    xp: 30,
    plannedDurationMinutes: 90,
    scheduledDate,
    scheduleMode,
    weekday: "",
    sourceSubject: "Tiếng Anh",
    week: 1,
    initialDone: false,
  };
}

function subject(lessons: Lesson[]): Subject[] {
  return [
    {
      id: "english",
      name: "Tiếng Anh",
      emoji: "📘",
      milestones: [
        {
          id: "exam",
          title: "Ôn thi",
          subtitle: "",
          lessons,
        },
      ],
    },
  ];
}

describe("fixed and flexible lesson scheduling", () => {
  test("fixed overflow stays on its chosen date and is exposed as unplaced", () => {
    const subjects = subject([
      lesson("fixed-1", "2026-08-01", "fixed"),
      lesson("fixed-2", "2026-08-01", "fixed"),
    ]);

    const firstDay = pickDayQueue({
      subjects,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: DEFAULT_PLANNER_SETTINGS,
      dateISO: "2026-08-01",
      hoursOverride: 2,
    });

    expect(firstDay.newLessons).toHaveLength(1);
    expect(firstDay.unplacedFixedLessons).toHaveLength(1);
    expect(firstDay.unplacedFixedMinutes).toBe(90);
    expect(firstDay.newMinutes).toBeLessThanOrEqual(firstDay.quotaMinutes);

    const secondDay = pickDayQueue({
      subjects,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: DEFAULT_PLANNER_SETTINGS,
      dateISO: "2026-08-02",
      hoursOverride: 2,
    });

    expect(secondDay.newLessons).toHaveLength(0);
    expect(secondDay.unplacedFixedLessons).toHaveLength(0);
  });

  test("flexible overflow carries forward from its earliest date", () => {
    const subjects = subject([
      lesson("flex-1", "2026-08-01", "flexible"),
      lesson("flex-2", "2026-08-01", "flexible"),
    ]);

    const plan = buildFlexiblePlan({
      subjects,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: {
        ...DEFAULT_PLANNER_SETTINGS,
        todayHours: 2,
        defaultDailyHours: 2,
      },
      fromISO: "2026-08-01",
      horizonDays: 2,
    });

    expect(plan[0].queue.newLessons).toHaveLength(1);
    expect(plan[1].queue.newLessons).toHaveLength(1);
    expect(plan.flatMap((day) => day.queue.newLessons.map((item) => item.id)).sort()).toEqual([
      "flex-1",
      "flex-2",
    ]);
  });

  test("legacy lessons without a mode remain flexible", () => {
    const subjects = subject([
      lesson("legacy-1", "2026-08-01", undefined),
      lesson("legacy-2", "2026-08-01", undefined),
    ]);

    const plan = buildFlexiblePlan({
      subjects,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: {
        ...DEFAULT_PLANNER_SETTINGS,
        todayHours: 2,
        defaultDailyHours: 2,
      },
      fromISO: "2026-08-01",
      horizonDays: 2,
    });

    expect(plan[0].queue.newLessons).toHaveLength(1);
    expect(plan[1].queue.newLessons).toHaveLength(1);
  });

  test("a future lesson is never pulled into an earlier day", () => {
    const subjects = subject([
      lesson("future-flex", "2026-08-02", "flexible"),
      lesson("future-fixed", "2026-08-02", "fixed"),
    ]);

    const day = pickDayQueue({
      subjects,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: DEFAULT_PLANNER_SETTINGS,
      dateISO: "2026-08-01",
      hoursOverride: 6,
    });

    expect(day.newLessons).toHaveLength(0);
    expect(day.unplacedFixedLessons).toHaveLength(0);
  });

  test("fixed lessons keep the exact order chosen in Course Manager", () => {
    const subjects = subject([
      lesson("unit-13", "2026-08-01", "fixed"),
      lesson("unit-4", "2026-08-01", "fixed"),
      lesson("unit-10", "2026-08-01", "fixed"),
    ]);

    const day = pickDayQueue({
      subjects,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: DEFAULT_PLANNER_SETTINGS,
      dateISO: "2026-08-01",
      hoursOverride: 6,
    });

    expect(day.newLessons.map((item) => item.id)).toEqual(["unit-13", "unit-4", "unit-10"]);
  });
});

describe("Course Manager drag interaction", () => {
  test("uses authoritative extracted drag units for handle, boundaries and auto-scroll", async () => {
    const [rowSource, topicSource, reorderSource] = await Promise.all([
      fs.readFile(new URL("../components/course-manager/LessonRow.tsx", import.meta.url), "utf8"),
      fs.readFile(new URL("../components/course-manager/TopicSection.tsx", import.meta.url), "utf8"),
      fs.readFile(
        new URL("../components/course-manager/useLessonReorder.ts", import.meta.url),
        "utf8",
      ),
    ]);

    expect(rowSource).toContain("Kéo một lần bằng tay cầm để đổi vị trí");
    expect(rowSource).toContain("application/x-smart-lesson-id");
    expect(rowSource).toContain("draggable={false}");
    expect(topicSource).toContain("Chèn phía trên");
    expect(topicSource).toContain("Chèn phía dưới");
    expect(topicSource).toContain("data-course-scroll-container");
    expect(reorderSource).toContain("export function autoScrollDuringLessonDrag");
    expect(rowSource).not.toContain("Lần 2: giữ và kéo");
  });
});
