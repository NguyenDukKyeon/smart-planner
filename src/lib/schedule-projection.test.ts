import { describe, expect, it } from "vitest";
import type { Subject } from "./mock-data";
import {
  DEFAULT_PLANNER_SETTINGS,
  DEFAULT_STUDY_META,
  buildShiftedSchedule,
  type PlannerSettings,
  type StudyMeta,
} from "./planner";

type ScheduleProjection = {
  datesByLesson: Record<string, string>;
  lastScheduledLessonDate?: string;
  placedLessonIds: string[];
  unplacedFixedLessonIds: string[];
  unscheduledLessonIds: string[];
  unprojectedLessonIds: string[];
  projectionDays: number;
  projectionComplete: boolean;
  positiveCapacityDays: number;
};

type ProjectionBuilder = (params: {
  subjects: Subject[];
  completed: Record<string, string>;
  reviewCompletions?: Record<string, string>;
  meta: StudyMeta;
  settings: PlannerSettings;
  fromISO?: string;
  currentDateISO?: string;
  maxDays?: number;
}) => ScheduleProjection;

async function loadProjectionBuilder(): Promise<ProjectionBuilder | undefined> {
  const modulePath = "./schedule-projection";
  try {
    const loaded = (await import(modulePath)) as { buildScheduleProjection?: ProjectionBuilder };
    return loaded.buildScheduleProjection;
  } catch {
    return undefined;
  }
}

function subjectWith(
  lessons: Array<{
    id: string;
    scheduledDate: string;
    minutes?: number;
    scheduleMode?: "fixed" | "flexible";
  }>,
): Subject[] {
  return [
    {
      id: "math",
      name: "Toán",
      emoji: "📐",
      milestones: [
        {
          id: "topic",
          title: "Chủ đề",
          subtitle: "",
          lessons: lessons.map((item) => ({
            id: item.id,
            title: item.id,
            xp: 10,
            plannedDurationMinutes: item.minutes ?? 120,
            scheduledDate: item.scheduledDate,
            scheduleMode: item.scheduleMode ?? "flexible",
            weekday: "",
            sourceSubject: "Toán",
            week: 1,
            initialDone: false,
          })),
        },
      ],
    },
  ];
}

describe("canonical full schedule projection", () => {
  it("projects schedulable flexible lessons and reports the last projected date", async () => {
    const buildScheduleProjection = await loadProjectionBuilder();
    expect(buildScheduleProjection).toBeTypeOf("function");
    if (!buildScheduleProjection) return;

    const result = buildScheduleProjection({
      subjects: subjectWith([
        { id: "lesson-1", scheduledDate: "2026-08-08" },
        { id: "lesson-2", scheduledDate: "2026-08-08" },
      ]),
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: { ...DEFAULT_PLANNER_SETTINGS, todayHours: 2, defaultDailyHours: 2 },
      fromISO: "2026-08-08",
      currentDateISO: "2026-08-08",
      maxDays: 3,
    });

    expect(result.projectionComplete).toBe(true);
    expect(result.placedLessonIds).toHaveLength(2);
    expect(result.datesByLesson["lesson-1"]).toBe("2026-08-08");
    expect(result.datesByLesson["lesson-2"]).toBe("2026-08-09");
    expect(result.lastScheduledLessonDate).toBe("2026-08-09");
    expect(result.positiveCapacityDays).toBe(2);
  });

  it("reports ordinary lessons without a schedule date as unresolved", async () => {
    const buildScheduleProjection = await loadProjectionBuilder();
    expect(buildScheduleProjection).toBeTypeOf("function");
    if (!buildScheduleProjection) return;

    const result = buildScheduleProjection({
      subjects: subjectWith([{ id: "unscheduled", scheduledDate: "" }]),
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: DEFAULT_PLANNER_SETTINGS,
      fromISO: "2026-08-08",
      currentDateISO: "2026-08-08",
      maxDays: 3,
    });

    expect(result.projectionComplete).toBe(false);
    expect(result.unscheduledLessonIds).toEqual(["unscheduled"]);
    expect(result.lastScheduledLessonDate).toBeUndefined();
  });

  it("reports a fixed lesson that cannot fit on its exact date", async () => {
    const buildScheduleProjection = await loadProjectionBuilder();
    expect(buildScheduleProjection).toBeTypeOf("function");
    if (!buildScheduleProjection) return;

    const result = buildScheduleProjection({
      subjects: subjectWith([
        { id: "fixed-too-large", scheduledDate: "2026-08-08", scheduleMode: "fixed" },
      ]),
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: { ...DEFAULT_PLANNER_SETTINGS, todayHours: 1, defaultDailyHours: 1 },
      fromISO: "2026-08-08",
      currentDateISO: "2026-08-08",
      maxDays: 2,
    });

    expect(result.projectionComplete).toBe(false);
    expect(result.unplacedFixedLessonIds).toEqual(["fixed-too-large"]);
    expect(result.datesByLesson).toEqual({});
  });

  it("classifies an unfinished fixed lesson whose exact date is already past as unplaced fixed", async () => {
    const buildScheduleProjection = await loadProjectionBuilder();
    expect(buildScheduleProjection).toBeTypeOf("function");
    if (!buildScheduleProjection) return;

    const result = buildScheduleProjection({
      subjects: subjectWith([
        { id: "fixed-in-the-past", scheduledDate: "2026-08-07", scheduleMode: "fixed" },
      ]),
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: { ...DEFAULT_PLANNER_SETTINGS, todayHours: 8, defaultDailyHours: 8 },
      fromISO: "2026-08-08",
      currentDateISO: "2026-08-08",
      maxDays: 2,
    });

    expect(result.projectionComplete).toBe(false);
    expect(result.unplacedFixedLessonIds).toEqual(["fixed-in-the-past"]);
    expect(result.unprojectedLessonIds).toEqual([]);
    expect(result.datesByLesson).toEqual({});
    expect(result.lastScheduledLessonDate).toBeUndefined();
  });

  it("reports work left after the defensive bound", async () => {
    const buildScheduleProjection = await loadProjectionBuilder();
    expect(buildScheduleProjection).toBeTypeOf("function");
    if (!buildScheduleProjection) return;

    const result = buildScheduleProjection({
      subjects: subjectWith([{ id: "bounded", scheduledDate: "2026-08-08" }]),
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: { ...DEFAULT_PLANNER_SETTINGS, todayHours: 0, defaultDailyHours: 0 },
      fromISO: "2026-08-08",
      currentDateISO: "2026-08-08",
      maxDays: 1,
    });

    expect(result.projectionComplete).toBe(false);
    expect(result.unprojectedLessonIds).toEqual(["bounded"]);
    expect(result.positiveCapacityDays).toBe(0);
  });

  it("uses default Sunday capacity and honors an explicit Sunday capacity", async () => {
    const buildScheduleProjection = await loadProjectionBuilder();
    expect(buildScheduleProjection).toBeTypeOf("function");
    if (!buildScheduleProjection) return;

    const catalog = subjectWith([{ id: "sunday-lesson", scheduledDate: "2026-08-09" }]);
    const defaulted = buildScheduleProjection({
      subjects: catalog,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: { ...DEFAULT_PLANNER_SETTINGS, defaultDailyHours: 2, dailyHours: {} },
      fromISO: "2026-08-09",
      currentDateISO: "2026-08-08",
      maxDays: 1,
    });
    const overridden = buildScheduleProjection({
      subjects: catalog,
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: {
        ...DEFAULT_PLANNER_SETTINGS,
        defaultDailyHours: 2,
        dailyHours: { "2026-08-09": 2 },
      },
      fromISO: "2026-08-09",
      currentDateISO: "2026-08-08",
      maxDays: 1,
    });

    expect(defaulted.positiveCapacityDays).toBe(1);
    expect(defaulted.projectionComplete).toBe(true);
    expect(defaulted.datesByLesson["sunday-lesson"]).toBe("2026-08-09");
    expect(overridden.positiveCapacityDays).toBe(1);
    expect(overridden.projectionComplete).toBe(true);
    expect(overridden.datesByLesson["sunday-lesson"]).toBe("2026-08-09");
  });

  it("keeps Roadmap shifted dates identical to the canonical projection", async () => {
    const buildScheduleProjection = await loadProjectionBuilder();
    expect(buildScheduleProjection).toBeTypeOf("function");
    if (!buildScheduleProjection) return;

    const args = {
      subjects: subjectWith([
        { id: "lesson-1", scheduledDate: "2026-08-08" },
        { id: "lesson-2", scheduledDate: "2026-08-08" },
      ]),
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: {
        ...DEFAULT_PLANNER_SETTINGS,
        todayHours: 2,
        defaultDailyHours: 2,
        dailyHours: { "2026-08-09": 2 },
      },
      fromISO: "2026-08-08",
    };

    const projection = buildScheduleProjection({ ...args, currentDateISO: "2026-08-08" });
    expect(buildShiftedSchedule(args)).toEqual(projection.datesByLesson);
  });
});
