import { describe, expect, test } from "vitest";
import type { Lesson, Subject } from "./mock-data";
import type { PlanDay } from "./planner";
import { summarizeUnscheduledWork } from "./schedule-visibility";

function lesson(id: string, scheduledDate: string): Lesson {
  return {
    id,
    title: id,
    xp: 20,
    plannedDurationMinutes: 60,
    scheduledDate,
    scheduleMode: "flexible",
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

function subject(id: string, lessons: Lesson[]): Subject {
  return {
    id,
    name: id,
    emoji: "🧪",
    milestones: [
      {
        id: `${id}-topic`,
        title: "Chủ đề",
        subtitle: `${lessons.length} bài học`,
        lessons,
      },
    ],
  };
}

function planDay(params: {
  dateISO: string;
  newLessons?: Lesson[];
  unplacedFixedLessons?: Lesson[];
}): PlanDay {
  const newLessons = params.newLessons ?? [];
  const unplacedFixedLessons = params.unplacedFixedLessons ?? [];
  return {
    dateISO: params.dateISO,
    hours: 1,
    queue: {
      newLessons,
      unplacedFixedLessons,
      reviewLessons: [],
      quotaMinutes: 60,
      newMinutes: newLessons.length * 60,
      reviewMinutes: 0,
      unplacedFixedMinutes: unplacedFixedLessons.length * 60,
      unallocatedMinutes: Math.max(0, 60 - newLessons.length * 60),
      overloadMinutes: Math.max(0, newLessons.length * 60 - 60),
    },
  };
}

describe("summarizeUnscheduledWork", () => {
  test("separates visible scheduled, visible unplaced, and outside-horizon lessons", () => {
    const visible = lesson("visible", "2030-01-01");
    const unplaced = { ...lesson("unplaced", "2030-01-01"), scheduleMode: "fixed" as const };
    const outside = lesson("outside", "2030-01-10");
    const completed = lesson("completed", "2030-01-01");

    const result = summarizeUnscheduledWork({
      subjects: catalog([visible, unplaced, outside, completed]),
      completed: { completed: "2030-01-01" },
      visiblePlan: [
        planDay({
          dateISO: "2030-01-01",
          newLessons: [visible],
          unplacedFixedLessons: [unplaced],
        }),
      ],
    });

    expect(result).toEqual({
      unfinishedCount: 3,
      visibleScheduledCount: 1,
      outsideHorizonCount: 1,
      outsideHorizonLessonIds: ["outside"],
    });
  });

  test("counts an unfinished lesson without a date as outside the visible horizon", () => {
    const unscheduled = lesson("unscheduled", "");

    expect(
      summarizeUnscheduledWork({
        subjects: catalog([unscheduled]),
        completed: {},
        visiblePlan: [],
      }),
    ).toEqual({
      unfinishedCount: 1,
      visibleScheduledCount: 0,
      outsideHorizonCount: 1,
      outsideHorizonLessonIds: ["unscheduled"],
    });
  });

  test("deduplicates lessons that appear in more than one visible day", () => {
    const repeated = lesson("repeated", "2030-01-01");

    expect(
      summarizeUnscheduledWork({
        subjects: catalog([repeated]),
        completed: {},
        visiblePlan: [
          planDay({ dateISO: "2030-01-01", newLessons: [repeated] }),
          planDay({ dateISO: "2030-01-02", newLessons: [repeated] }),
        ],
      }),
    ).toEqual({
      unfinishedCount: 1,
      visibleScheduledCount: 1,
      outsideHorizonCount: 0,
      outsideHorizonLessonIds: [],
    });
  });

  test("summarizes only the selected subject", () => {
    const mathVisible = lesson("math-visible", "2030-01-01");
    const mathOutside = lesson("math-outside", "2030-01-10");
    const englishVisible = lesson("english-visible", "2030-01-01");
    const mathUnplaced = {
      ...lesson("math-unplaced", "2030-01-01"),
      scheduleMode: "fixed" as const,
    };

    expect(
      summarizeUnscheduledWork({
        subjects: [
          subject("math", [mathVisible, mathOutside, mathUnplaced]),
          subject("english", [englishVisible]),
        ],
        completed: {},
        visiblePlan: [
          planDay({
            dateISO: "2030-01-01",
            newLessons: [mathVisible, englishVisible],
            unplacedFixedLessons: [mathUnplaced],
          }),
        ],
        subjectId: "math",
      }),
    ).toEqual({
      unfinishedCount: 3,
      visibleScheduledCount: 1,
      outsideHorizonCount: 1,
      outsideHorizonLessonIds: ["math-outside"],
    });
  });

  test("returns zero counts for an unknown subject", () => {
    expect(
      summarizeUnscheduledWork({
        subjects: [subject("math", [lesson("math", "2030-01-01")])],
        completed: {},
        visiblePlan: [],
        subjectId: "missing",
      }),
    ).toEqual({
      unfinishedCount: 0,
      visibleScheduledCount: 0,
      outsideHorizonCount: 0,
      outsideHorizonLessonIds: [],
    });
  });
});
