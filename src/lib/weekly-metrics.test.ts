import { describe, expect, test } from "vitest";
import type { ArchivedCatalog } from "./custom-subjects";
import type { Subject } from "./mock-data";
import { createInitialProgressState, UNDATED_COMPLETION } from "./progress-store";
import { createStudySession } from "./study-sessions";
import { selectWeeklyMetrics } from "./weekly-metrics";

const week = "2026-07-20";

const subjects: Subject[] = [
  {
    id: "math",
    name: "Toán",
    emoji: "📐",
    milestones: [
      {
        id: "math-week",
        title: "Tuần",
        subtitle: "",
        lessons: [
          {
            id: "early",
            title: "Hoàn thành sớm",
            xp: 20,
            plannedDurationMinutes: 30,
            scheduledDate: "2026-07-22",
            weekday: "Thứ 4",
            sourceSubject: "Toán",
            week: 1,
            initialDone: false,
          },
          {
            id: "on-target",
            title: "Đúng hạn",
            xp: 20,
            plannedDurationMinutes: 30,
            scheduledDate: "2026-07-23",
            weekday: "Thứ 5",
            sourceSubject: "Toán",
            week: 1,
            initialDone: false,
          },
          {
            id: "late",
            title: "Sau tuần",
            xp: 20,
            plannedDurationMinutes: 30,
            scheduledDate: "2026-07-24",
            weekday: "Thứ 6",
            sourceSubject: "Toán",
            week: 1,
            initialDone: false,
          },
          {
            id: "undated",
            title: "Không rõ ngày",
            xp: 20,
            plannedDurationMinutes: 30,
            scheduledDate: "2026-07-25",
            weekday: "Thứ 7",
            sourceSubject: "Toán",
            week: 1,
            initialDone: false,
          },
          {
            id: "outside-plan",
            title: "Ngoài kế hoạch",
            xp: 20,
            plannedDurationMinutes: 30,
            scheduledDate: "2026-07-28",
            weekday: "Thứ 3",
            sourceSubject: "Toán",
            week: 2,
            initialDone: false,
          },
        ],
      },
    ],
  },
];

function stateWith(overrides: Partial<ReturnType<typeof createInitialProgressState>> = {}) {
  const state = createInitialProgressState(false);
  return {
    ...state,
    completedLessons: {},
    habitDefinitions: [
      {
        id: "study-habit",
        name: "Học",
        icon: "study" as const,
        color: "amber" as const,
        kind: "toggle" as const,
        target: 1,
        archived: false,
        dailyTargets: [1, 1, 1, 1, 1, 1, 1],
      },
    ],
    goals: { ...state.goals, habitTargets: { "study-habit": 2 } },
    plannerSettings: { ...state.plannerSettings, defaultDailyHours: 0, dailyHours: {} },
    ...overrides,
  };
}

function lessonTitleOf(value: unknown): string | undefined {
  return (value as { lessonTitle?: string }).lessonTitle;
}

function selectWithArchive(
  args: Parameters<typeof selectWeeklyMetrics>[0],
  archivedCatalog: ArchivedCatalog,
) {
  return selectWeeklyMetrics({ ...args, archivedCatalog } as unknown as Parameters<
    typeof selectWeeklyMetrics
  >[0]);
}

describe("selectWeeklyMetrics", () => {
  test("counts early and target-date completion, keeps undated status, and excludes completion after Sunday", () => {
    const metrics = selectWeeklyMetrics({
      state: stateWith({
        completedLessons: {
          early: "2026-07-19",
          "on-target": "2026-07-23",
          late: "2026-07-27",
          undated: UNDATED_COMPLETION,
        },
      }),
      subjects,
      referenceDateISO: week,
    });

    expect(metrics.lessons.targetTotal).toBe(4);
    expect(metrics.lessons.metTotal).toBe(3);
    expect(metrics.lessons.rate).toBe(75);
    expect(
      metrics.lessons.targets.find((target) => target.lessonId === "early")?.completionStatus,
    ).toBe("completed-early");
    expect(
      metrics.lessons.targets.find((target) => target.lessonId === "late")?.completionStatus,
    ).toBe("completed-after-week");
    expect(
      metrics.lessons.targets.find((target) => target.lessonId === "undated")?.completionStatus,
    ).toBe("completed-undated");
    expect(
      lessonTitleOf(metrics.lessons.targets.find((target) => target.lessonId === "early")),
    ).toBe("Hoàn thành sớm");
  });

  test("separates out-of-plan and deleted activity from current subject targets", () => {
    const metrics = selectWeeklyMetrics({
      state: stateWith({
        completedLessons: {
          "outside-plan": "2026-07-21",
          "deleted-lesson": "2026-07-21",
        },
      }),
      subjects,
      referenceDateISO: week,
    });

    expect(metrics.lessons.outOfPlanCompletions).toEqual([
      {
        lessonId: "outside-plan",
        lessonTitle: "Ngoài kế hoạch",
        subjectId: "math",
        completedOn: "2026-07-21",
      },
    ]);
    expect(metrics.archivedActivity).toEqual([
      {
        lessonId: "deleted-lesson",
        lessonTitle: "Bài học không còn trong lộ trình",
        completedOn: "2026-07-21",
        focusMinutes: 0,
      },
    ]);
    expect(metrics.subjects[0].metLessons).toBe(0);
  });

  test("resolves live and archived lesson titles by precedence with exact fallback", () => {
    const session = createStudySession({
      id: "archived-focus",
      lessonId: "archived-standalone",
      endedAt: "2026-07-21T10:00:00.000Z",
      durationSeconds: 30 * 60,
      source: "focus-timer",
    });
    const archivedCatalog: ArchivedCatalog = {
      lessons: [
        {
          subjectId: "math",
          subjectName: "Toán cũ",
          subjectEmoji: "📐",
          lesson: {
            ...subjects[0].milestones[0].lessons[4],
            id: "outside-plan",
            title: "Sai từ archive",
          },
        },
        {
          subjectId: "english",
          subjectName: "Tiếng Anh",
          subjectEmoji: "🇬🇧",
          lesson: {
            ...subjects[0].milestones[0].lessons[0],
            id: "archived-standalone",
            title: "Từ vựng Unit 3",
            sourceSubject: "Tiếng Anh",
          },
        },
        {
          subjectId: "blank",
          subjectName: "Blank",
          subjectEmoji: "📖",
          lesson: {
            ...subjects[0].milestones[0].lessons[0],
            id: "blank-first-source",
            title: "   ",
            sourceSubject: "Blank",
          },
        },
      ],
      subjects: [
        {
          id: "archived-subject",
          name: "Vật lý cũ",
          emoji: "⚛️",
          milestones: [
            {
              id: "old-topic",
              title: "Chủ đề cũ",
              subtitle: "",
              lessons: [
                {
                  ...subjects[0].milestones[0].lessons[0],
                  id: "archived-standalone",
                  title: "Không được dùng",
                  sourceSubject: "Vật lý cũ",
                },
                {
                  ...subjects[0].milestones[0].lessons[0],
                  id: "archived-subject-only",
                  title: "Dao động cũ",
                  sourceSubject: "Vật lý cũ",
                },
                {
                  ...subjects[0].milestones[0].lessons[0],
                  id: "blank-first-source",
                  title: "Tên hợp lệ từ subject archive",
                  sourceSubject: "Vật lý cũ",
                },
              ],
            },
          ],
        },
      ],
    };
    const metrics = selectWithArchive(
      {
        state: stateWith({
          completedLessons: {
            "outside-plan": "2026-07-21",
            "archived-standalone": "2026-07-21",
            "archived-subject-only": "2026-07-21",
            "blank-first-source": "2026-07-21",
            "missing-everywhere": "2026-07-21",
          },
          studySessions: [session],
        }),
        subjects,
        referenceDateISO: week,
      },
      archivedCatalog,
    );

    expect(lessonTitleOf(metrics.lessons.outOfPlanCompletions[0])).toBe("Ngoài kế hoạch");
    const byId = new Map(metrics.archivedActivity.map((activity) => [activity.lessonId, activity]));
    expect(lessonTitleOf(byId.get("archived-standalone"))).toBe("Từ vựng Unit 3");
    expect(lessonTitleOf(byId.get("archived-subject-only"))).toBe("Dao động cũ");
    expect(lessonTitleOf(byId.get("blank-first-source"))).toBe("Tên hợp lệ từ subject archive");
    expect(lessonTitleOf(byId.get("missing-everywhere"))).toBe("Bài học không còn trong lộ trình");
    expect(byId.get("archived-standalone")?.focusMinutes).toBe(30);
  });

  test("excludes zero habit targets, caps occurrences, and never produces a composite rate", () => {
    const active = stateWith({
      habitLog: {
        "2026-07-20": { "study-habit": true },
        "2026-07-21": { "study-habit": true },
        "2026-07-22": { "study-habit": true },
      },
    });
    const metrics = selectWeeklyMetrics({ state: active, subjects, referenceDateISO: week });
    expect(metrics.habits.targetTotal).toBe(2);
    expect(metrics.habits.completedTotal).toBe(2);
    expect(metrics.habits.details[0]).toMatchObject({
      occurrences: 3,
      cappedOccurrences: 2,
      rate: 100,
    });
    expect("overallRate" in metrics).toBe(false);

    const zeroTarget = selectWeeklyMetrics({
      state: { ...active, goals: { ...active.goals, habitTargets: { "study-habit": 0 } } },
      subjects,
      referenceDateISO: week,
    });
    expect(zeroTarget.habits).toMatchObject({ targetTotal: 0, completedTotal: 0, rate: 0 });
  });

  test("keeps explicit zero default and per-date hour overrides, while using focus overlap only for actual time", () => {
    const session = createStudySession({
      id: "cross-midnight",
      lessonId: "early",
      endedAt: "2026-07-20T17:01:00.000Z",
      durationSeconds: 2 * 60,
      source: "focus-timer",
    });
    const metrics = selectWeeklyMetrics({
      state: stateWith({
        plannerSettings: {
          ...createInitialProgressState(false).plannerSettings,
          defaultDailyHours: 0,
          dailyHours: { "2026-07-21": 0, "2026-07-22": 1.5 },
        },
        studySessions: [session],
      }),
      subjects,
      referenceDateISO: week,
    });

    expect(metrics.time.dailyTargetMinutes["2026-07-21"]).toBe(0);
    expect(metrics.time.targetMinutes).toBe(90);
    expect(metrics.time.dailyActualMinutes["2026-07-20"]).toBe(1);
    expect(metrics.time.dailyActualMinutes["2026-07-21"]).toBe(1);
    expect(metrics.time.actualMinutes).toBe(2);
    expect(metrics.time.rate).toBe(2);
  });

  test("uses shifted dates for effective weekly targets without mutating original dates", () => {
    const metrics = selectWeeklyMetrics({
      state: stateWith(),
      subjects,
      shiftedDates: { "outside-plan": "2026-07-24" },
      referenceDateISO: week,
    });
    const shifted = metrics.lessons.targets.find((target) => target.lessonId === "outside-plan");

    expect(shifted).toMatchObject({ scheduledDate: "2026-07-28", effectiveDate: "2026-07-24" });
    expect(metrics.lessons.targetTotal).toBe(5);
  });

  test("reports the actual number of subjects and bounds every percentage", () => {
    const makeSubjects = (count: number): Subject[] =>
      Array.from({ length: count }, (_, index) => ({
        ...subjects[0],
        id: `subject-${index}`,
        name: `Môn ${index + 1}`,
        milestones: [
          {
            ...subjects[0].milestones[0],
            id: `milestone-${index}`,
            lessons: subjects[0].milestones[0].lessons.map((lesson) => ({
              ...lesson,
              id: `${lesson.id}-${index}`,
            })),
          },
        ],
      }));

    for (const count of [0, 1, 3, 4]) {
      const metrics = selectWeeklyMetrics({
        state: stateWith(),
        subjects: makeSubjects(count),
        referenceDateISO: week,
      });
      expect(metrics.subjects).toHaveLength(count);
      expect(metrics.lessons.rate).toBeGreaterThanOrEqual(0);
      expect(metrics.lessons.rate).toBeLessThanOrEqual(100);
      expect(metrics.habits.rate).toBeGreaterThanOrEqual(0);
      expect(metrics.habits.rate).toBeLessThanOrEqual(100);
      expect(metrics.time.rate).toBeGreaterThanOrEqual(0);
      expect(metrics.time.rate).toBeLessThanOrEqual(100);
    }
  });
});
