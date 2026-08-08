import { describe, expect, test } from "vitest";
import type { Subject } from "./mock-data";
import {
  DEFAULT_PLANNER_SETTINGS,
  DEFAULT_STUDY_META,
  buildFlexiblePlan,
  estimateLessonMinutes,
  forecast,
  pickDayQueue,
  reviewTaskId,
} from "./planner";
import { addDaysISO, todayISO } from "./date-utils";

const subjects: Subject[] = [
  {
    id: "english",
    name: "Tiếng Anh",
    emoji: "🇬🇧",
    milestones: [
      {
        id: "english-lessons",
        title: "Bài học",
        subtitle: "1 bài học",
        lessons: [
          {
            id: "english-1",
            title: "Unit 1",
            xp: 20,
            plannedDurationMinutes: 45,
            scheduledDate: "2026-07-25",
            weekday: "Thứ 7",
            sourceSubject: "Tiếng Anh",
            week: 1,
            initialDone: false,
          },
        ],
      },
    ],
  },
];

function longLessonSubjects(): Subject[] {
  return [
    {
      id: "math",
      name: "Toán",
      emoji: "📐",
      milestones: [
        {
          id: "math-topic",
          title: "Chủ đề",
          subtitle: "",
          lessons: [
            {
              id: "math-120",
              title: "Bài 120 phút",
              xp: 20,
              plannedDurationMinutes: 120,
              scheduledDate: "2026-08-08",
              scheduleMode: "flexible",
              weekday: "Thứ 7",
              sourceSubject: "Toán",
              week: 1,
              initialDone: false,
            },
          ],
        },
      ],
    },
  ];
}

describe("flexible planning capacity", () => {
  test("uses each lesson planned duration", () => {
    expect(estimateLessonMinutes("english-1", DEFAULT_STUDY_META, subjects)).toBe(45);
  });

  test("uses valid historical samples for future estimates", () => {
    expect(
      estimateLessonMinutes(
        "english-1",
        { ...DEFAULT_STUDY_META, actualMinutes: { "english-1": [30, 40] } },
        subjects,
      ),
    ).toBe(35);
  });

  test("ordinary placement keeps planned duration despite short historical sessions", () => {
    const catalog = longLessonSubjects();
    const meta = { ...DEFAULT_STUDY_META, actualMinutes: { "math-120": [20, 20, 20] } };
    const oneHour = pickDayQueue({
      subjects: catalog,
      completed: {},
      meta,
      settings: DEFAULT_PLANNER_SETTINGS,
      dateISO: "2026-08-08",
      hoursOverride: 1,
    });
    const twoHours = pickDayQueue({
      subjects: catalog,
      completed: {},
      meta,
      settings: DEFAULT_PLANNER_SETTINGS,
      dateISO: "2026-08-08",
      hoursOverride: 2,
    });

    expect(oneHour.newLessons).toEqual([]);
    expect(oneHour.newMinutes).toBe(0);
    expect(twoHours.newLessons.map((lesson) => lesson.id)).toEqual(["math-120"]);
    expect(twoHours.newMinutes).toBe(120);
  });

  test("shows unallocated capacity instead of hiding it", () => {
    const queue = pickDayQueue({
      subjects,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: DEFAULT_PLANNER_SETTINGS,
      dateISO: "2026-07-25",
      hoursOverride: 2,
    });
    expect(queue.newMinutes).toBe(45);
    expect(queue.unallocatedMinutes).toBe(75);
    expect(queue.overloadMinutes).toBe(0);
  });

  test("reports overload from a pinned completed lesson", () => {
    const queue = pickDayQueue({
      subjects,
      completed: { "english-1": "2026-07-25" },
      meta: DEFAULT_STUDY_META,
      settings: DEFAULT_PLANNER_SETTINGS,
      dateISO: "2026-07-25",
      hoursOverride: 0.5,
      pinnedCompleted: subjects[0].milestones[0].lessons,
    });
    expect(queue.newMinutes).toBe(45);
    expect(queue.overloadMinutes).toBe(15);
    expect(queue.unallocatedMinutes).toBe(0);
  });

  test("keeps an unscheduled lesson in the catalog but out of automatic daily queues", () => {
    const unscheduled: Subject[] = [
      {
        ...subjects[0],
        milestones: [
          {
            ...subjects[0].milestones[0],
            lessons: [{ ...subjects[0].milestones[0].lessons[0], scheduledDate: "", weekday: "" }],
          },
        ],
      },
    ];
    const queue = pickDayQueue({
      subjects: unscheduled,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: DEFAULT_PLANNER_SETTINGS,
      dateISO: "2026-07-25",
      hoursOverride: 2,
    });
    expect(queue.newLessons).toEqual([]);
    expect(queue.unallocatedMinutes).toBe(120);
  });

  test("reports a wide range until enough real duration samples exist", () => {
    const result = forecast({
      remainingLessonIds: ["english-1"],
      meta: DEFAULT_STUDY_META,
      subjects,
      hoursPerDay: 1,
      fromISO: "2026-07-25",
    });
    expect(result.confidence).toBe("insufficient");
    expect(result.basis).toBe("planned");
    expect(result.sampleCount).toBe(0);
    expect(result.earliestEndDateISO <= result.latestEndDateISO).toBe(true);
  });

  test("preserves explicit zero default hours and a per-date zero override", () => {
    const today = todayISO();
    const firstPastDate = addDaysISO(today, -2);
    const secondPastDate = addDaysISO(today, -1);
    const plan = buildFlexiblePlan({
      subjects,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: {
        ...DEFAULT_PLANNER_SETTINGS,
        todayHours: 0,
        defaultDailyHours: 0,
        dailyHours: { [firstPastDate]: 0, [secondPastDate]: 1.5 },
      },
      fromISO: firstPastDate,
      horizonDays: 2,
    });

    expect(plan.map((day) => day.hours)).toEqual([0, 1.5]);
  });
});

describe("review task state", () => {
  test.each([1, 3, 7, 14, 30])(
    "keeps a %i-day review separate from lesson completion",
    (ageDays) => {
      const refISO = "2026-08-01";
      const completedISO = addDaysISO(refISO, -ageDays);
      const taskId = reviewTaskId("english-1", refISO);
      const queue = pickDayQueue({
        subjects,
        completed: { "english-1": completedISO },
        reviewCompletions: { [taskId]: refISO },
        meta: DEFAULT_STUDY_META,
        settings: { ...DEFAULT_PLANNER_SETTINGS, reviewShareMax: 1, reviewCapMinutes: 60 },
        dateISO: refISO,
        hoursOverride: 1,
      });

      expect(queue.reviewLessons).toContainEqual({
        lessonId: "english-1",
        ageDays,
        minutes: 15,
        taskId,
        completed: true,
      });
      expect(queue.newLessons).toEqual([]);
    },
  );
});
