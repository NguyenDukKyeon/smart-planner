import { describe, expect, it } from "vitest";
import { addDaysISO } from "./date-utils";
import * as forecastViewModelModule from "./forecast-view-model";
import type { Subject } from "./mock-data";
import { buildScheduleProjection, DEFAULT_STUDY_META } from "./planner";
import { createInitialProgressState, type ProgressState } from "./progress-store";
import { createStudySession } from "./study-sessions";

type HorizonWeeks = 2 | 4 | 8 | 12;
type Confidence = "insufficient" | "low" | "medium" | "high";
type EvidenceBasis = "planned-only" | "planned-with-study-evidence";

type Completion =
  | { kind: "complete" }
  | { kind: "date"; dateISO: string }
  | {
      kind: "unresolved";
      reason: "no-capacity" | "unscheduled" | "unplaced-fixed" | "projection-bound";
      unscheduledLessons: number;
      unplacedFixedLessons: number;
      unprojectedLessons: number;
    };

type ViewModel = {
  defaultDailyHours: number;
  explicitCapacityOverrideCount: number;
  sundayRestByDefault: true;
  horizonWeeks: HorizonWeeks;
  horizonDays: 14 | 28 | 56 | 84;
  horizonEndISO: string;
  remainingLessons: number;
  visibleScheduledLessons: number;
  outsideHorizonLessons: number;
  totalNewHours: number;
  totalReviewHours: number;
  totalWorkloadHours: number;
  evidenceLessonCount: number;
  evidenceSessionCount: number;
  confidence: Confidence;
  basis: EvidenceBasis;
  completion: Completion;
};

type Selector = (params: {
  subjects: Subject[];
  state: ProgressState;
  horizonWeeks: HorizonWeeks;
  fromISO?: string;
}) => ViewModel;

const selectForecastViewModel = (
  forecastViewModelModule as unknown as { selectForecastViewModel?: Selector }
).selectForecastViewModel;

function makeSubjects(count: number, minutes = 60): Subject[] {
  return [
    {
      id: "math",
      name: "Toán",
      emoji: "📐",
      milestones: [
        {
          id: "topic-1",
          title: "Chủ đề 1",
          subtitle: "",
          lessons: Array.from({ length: count }, (_, index) => ({
            id: `lesson-${index + 1}`,
            title: `Bài ${index + 1}`,
            xp: 10,
            plannedDurationMinutes: minutes,
            scheduledDate: "2026-08-08",
            scheduleMode: "flexible" as const,
            weekday: "T7",
            sourceSubject: "Toán",
            week: 1,
            initialDone: false,
          })),
        },
      ],
    },
  ];
}

function makeState(hours = 1): ProgressState {
  const state = createInitialProgressState(false);
  state.plannerSettings.defaultDailyHours = hours;
  state.plannerSettings.todayHours = hours;
  return state;
}

function studySession(id: string, lessonId: string, minutes: number) {
  return createStudySession({
    id,
    lessonId,
    endedAt: "2026-08-08T12:00:00.000Z",
    durationSeconds: minutes * 60,
    source: "focus-timer",
  });
}

function makeRealRoadmapFixture(): Subject[] {
  const distributions = [
    { id: "toan", name: "Toán", emoji: "📐", count: 160 },
    { id: "hoa", name: "Hóa học", emoji: "🧪", count: 116 },
    { id: "ly", name: "Vật lý", emoji: "⚛️", count: 69 },
    { id: "english", name: "Tiếng Anh", emoji: "📘", count: 7 },
  ];
  let globalIndex = 0;

  return distributions.map((subject) => ({
    id: subject.id,
    name: subject.name,
    emoji: subject.emoji,
    milestones: [
      {
        id: `${subject.id}-roadmap`,
        title: "Lộ trình thật rút gọn",
        subtitle: "",
        lessons: Array.from({ length: subject.count }, (_, localIndex) => {
          const index = globalIndex++;
          const plannedDurationMinutes = index < 345 ? 120 : index < 351 ? 90 : 30;
          return {
            id: `real-${subject.id}-${localIndex + 1}`,
            title: `Bài ${index + 1}`,
            xp: 10,
            plannedDurationMinutes,
            scheduledDate: "2026-08-08",
            scheduleMode: "flexible" as const,
            weekday: "T7",
            sourceSubject: subject.name,
            week: 1,
            initialDone: false,
          };
        }),
      },
    ],
  }));
}

function allLessons(subjects: Subject[]) {
  return subjects.flatMap((subject) =>
    subject.milestones.flatMap((milestone) => milestone.lessons),
  );
}

function completeLessonsWithStudyEvidence(params: {
  subjects: Subject[];
  count: number;
  minutesForIndex: (index: number) => number;
  sessionsPerLesson?: number;
}) {
  const state = makeState(16);
  const lessons = allLessons(params.subjects).slice(0, params.count);
  const sessionsPerLesson = params.sessionsPerLesson ?? 1;
  state.completedLessons = Object.fromEntries(
    lessons.map((lesson) => [lesson.id, "2026-08-08"] as const),
  );
  state.studySessions = lessons.flatMap((lesson, lessonIndex) =>
    Array.from({ length: sessionsPerLesson }, (_, sessionIndex) => {
      const totalMinutes = params.minutesForIndex(lessonIndex);
      return studySession(
        `session-${lessonIndex}-${sessionIndex}`,
        lesson.id,
        totalMinutes / sessionsPerLesson,
      );
    }),
  );
  state.studyMeta.actualMinutes = Object.fromEntries(
    lessons.map((lesson, lessonIndex) => [
      lesson.id,
      Array.from({ length: sessionsPerLesson }, () =>
        params.minutesForIndex(lessonIndex) / sessionsPerLesson,
      ),
    ]),
  );
  return state;
}

describe("Forecast view model", () => {
  it("exposes the pure horizon-aware selector", () => {
    expect(selectForecastViewModel).toBeTypeOf("function");
  });

  it("maps 2/4/8/12 weeks to 14/28/56/84 rolling days", () => {
    if (!selectForecastViewModel) return;
    const subjects = makeSubjects(1);
    const state = makeState(1);
    const fromISO = "2026-08-08";
    const cases: Array<[HorizonWeeks, 14 | 28 | 56 | 84]> = [
      [2, 14],
      [4, 28],
      [8, 56],
      [12, 84],
    ];

    for (const [horizonWeeks, horizonDays] of cases) {
      const result = selectForecastViewModel({ subjects, state, horizonWeeks, fromISO });
      expect(result.horizonWeeks).toBe(horizonWeeks);
      expect(result.horizonDays).toBe(horizonDays);
      expect(result.horizonEndISO).toBe(addDaysISO(fromISO, horizonDays - 1));
    }
  });

  it("counts unfinished lessons outside the selected horizon from the real flexible plan", () => {
    if (!selectForecastViewModel) return;
    const result = selectForecastViewModel({
      subjects: makeSubjects(20),
      state: makeState(1),
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });

    expect(result.outsideHorizonLessons).toBeGreaterThan(0);
    expect(result.visibleScheduledLessons).toBeGreaterThan(0);
    expect(result.visibleScheduledLessons + result.outsideHorizonLessons).toBe(
      result.remainingLessons,
    );
  });

  it("reports zero outside-horizon work when all unfinished lessons fit", () => {
    if (!selectForecastViewModel) return;
    const result = selectForecastViewModel({
      subjects: makeSubjects(1),
      state: makeState(2),
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });

    expect(result.remainingLessons).toBe(1);
    expect(result.visibleScheduledLessons).toBe(1);
    expect(result.outsideHorizonLessons).toBe(0);
  });

  it("a longer horizon never hides more unfinished work", () => {
    if (!selectForecastViewModel) return;
    const subjects = makeSubjects(20);
    const state = makeState(1);
    const shortView = selectForecastViewModel({
      subjects,
      state,
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });
    const longView = selectForecastViewModel({
      subjects,
      state,
      horizonWeeks: 12,
      fromISO: "2026-08-08",
    });

    expect(longView.outsideHorizonLessons).toBeLessThanOrEqual(shortView.outsideHorizonLessons);
    expect(longView.visibleScheduledLessons).toBeGreaterThanOrEqual(
      shortView.visibleScheduledLessons,
    );
  });

  it("uses the real-roadmap planned workload instead of a global session average", () => {
    if (!selectForecastViewModel) return;
    const subjects = makeRealRoadmapFixture();
    const full = selectForecastViewModel({
      subjects,
      state: makeState(16),
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });
    expect(full.remainingLessons).toBe(352);
    expect(full.totalNewHours).toBe(699.5);

    const state = makeState(16);
    const completed = allLessons(subjects).slice(0, 11);
    state.completedLessons = Object.fromEntries(
      completed.map((lesson) => [lesson.id, "2026-08-08"] as const),
    );
    state.studyMeta.actualMinutes = Object.fromEntries(
      completed.map((lesson) => [lesson.id, [37]]),
    );
    state.studySessions = completed.map((lesson, index) =>
      studySession(`real-session-${index}`, lesson.id, 37),
    );

    const partial = selectForecastViewModel({
      subjects,
      state,
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });

    expect(partial.remainingLessons).toBe(341);
    expect(partial.totalNewHours).toBe(677.5);
    expect(partial.totalNewHours).not.toBeCloseTo(210.3, 1);
  });

  it("keeps review and total workload consistent with planned new-learning work", () => {
    if (!selectForecastViewModel) return;
    const result = selectForecastViewModel({
      subjects: makeSubjects(5, 120),
      state: makeState(2),
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });

    expect(result.totalNewHours).toBe(10);
    expect(result.totalReviewHours).toBe(3.5);
    expect(result.totalWorkloadHours).toBe(13.5);
  });

  it("counts completed lessons rather than raw sessions for confidence", () => {
    if (!selectForecastViewModel) return;
    const subjects = makeSubjects(4, 120);
    const state = completeLessonsWithStudyEvidence({
      subjects,
      count: 2,
      minutesForIndex: () => 120,
      sessionsPerLesson: 11,
    });

    const result = selectForecastViewModel({
      subjects,
      state,
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });

    expect(result.evidenceLessonCount).toBe(2);
    expect(result.evidenceSessionCount).toBe(22);
    expect(result.confidence).toBe("insufficient");
    expect(result.basis).toBe("planned-with-study-evidence");
  });

  it("allows high confidence only for enough stable completed-lesson evidence", () => {
    if (!selectForecastViewModel) return;
    const subjects = makeSubjects(21, 120);
    const stableState = completeLessonsWithStudyEvidence({
      subjects,
      count: 20,
      minutesForIndex: (index) => (index % 2 === 0 ? 108 : 132),
    });
    const unstableState = completeLessonsWithStudyEvidence({
      subjects,
      count: 20,
      minutesForIndex: (index) => (index % 2 === 0 ? 30 : 210),
    });

    const stable = selectForecastViewModel({
      subjects,
      state: stableState,
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });
    const unstable = selectForecastViewModel({
      subjects,
      state: unstableState,
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });

    expect(stable.evidenceLessonCount).toBe(20);
    expect(stable.confidence).toBe("high");
    expect(unstable.evidenceLessonCount).toBe(20);
    expect(unstable.confidence).toBe("medium");
  });

  it("uses planned-only basis when there is no usable lesson evidence", () => {
    if (!selectForecastViewModel) return;
    const result = selectForecastViewModel({
      subjects: makeSubjects(2, 120),
      state: makeState(2),
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });

    expect(result.evidenceLessonCount).toBe(0);
    expect(result.evidenceSessionCount).toBe(0);
    expect(result.basis).toBe("planned-only");
    expect(result.confidence).toBe("insufficient");
  });

  it("uses the canonical projected last lesson date for completion", () => {
    if (!selectForecastViewModel) return;
    const subjects = makeSubjects(2, 120);
    const state = makeState(2);
    const projection = buildScheduleProjection({
      subjects,
      completed: state.completedLessons,
      reviewCompletions: state.reviewCompletions,
      meta: state.studyMeta,
      settings: state.plannerSettings,
      fromISO: "2026-08-08",
      currentDateISO: "2026-08-08",
    });
    const result = selectForecastViewModel({
      subjects,
      state,
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });

    expect(projection.projectionComplete).toBe(true);
    expect(result.completion).toEqual({
      kind: "date",
      dateISO: projection.lastScheduledLessonDate,
    });
  });

  it("distinguishes complete, no-capacity, unscheduled, fixed, and bound-blocked projections", () => {
    if (!selectForecastViewModel) return;
    const ordinary = makeSubjects(2, 120);
    const completedState = makeState(2);
    completedState.completedLessons = {
      "lesson-1": "2026-08-01",
      "lesson-2": "2026-08-02",
    };
    const completed = selectForecastViewModel({
      subjects: ordinary,
      state: completedState,
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });
    expect(completed.completion).toEqual({ kind: "complete" });

    const noCapacity = selectForecastViewModel({
      subjects: ordinary,
      state: makeState(0),
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });
    expect(noCapacity.completion).toMatchObject({ kind: "unresolved", reason: "no-capacity" });

    const unscheduledSubjects = makeSubjects(1, 120);
    unscheduledSubjects[0].milestones[0].lessons[0].scheduledDate = "";
    const unscheduled = selectForecastViewModel({
      subjects: unscheduledSubjects,
      state: makeState(2),
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });
    expect(unscheduled.completion).toMatchObject({
      kind: "unresolved",
      reason: "unscheduled",
      unscheduledLessons: 1,
    });

    const fixedSubjects = makeSubjects(1, 120);
    fixedSubjects[0].milestones[0].lessons[0].scheduleMode = "fixed";
    const fixed = selectForecastViewModel({
      subjects: fixedSubjects,
      state: makeState(1),
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });
    expect(fixed.completion).toMatchObject({
      kind: "unresolved",
      reason: "unplaced-fixed",
      unplacedFixedLessons: 1,
    });

    const tooLarge = makeSubjects(1, 2000);
    const bounded = selectForecastViewModel({
      subjects: tooLarge,
      state: makeState(16),
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });
    expect(bounded.completion).toMatchObject({
      kind: "unresolved",
      reason: "projection-bound",
      unprojectedLessons: 1,
    });
  });

  it("reports explicit capacity overrides that participate in projection", () => {
    if (!selectForecastViewModel) return;
    const state = makeState(2);
    state.plannerSettings.dailyHours = { "2026-08-10": 4 };
    const result = selectForecastViewModel({
      subjects: makeSubjects(3, 120),
      state,
      horizonWeeks: 2,
      fromISO: "2026-08-08",
    });

    expect(result.defaultDailyHours).toBe(2);
    expect(result.sundayRestByDefault).toBe(true);
    expect(result.explicitCapacityOverrideCount).toBeGreaterThanOrEqual(1);
  });

  it("is deterministic when fromISO is supplied", () => {
    if (!selectForecastViewModel) return;
    const params = {
      subjects: makeSubjects(8),
      state: makeState(1.5),
      horizonWeeks: 4 as const,
      fromISO: "2026-08-08",
    };

    expect(selectForecastViewModel(params)).toEqual(selectForecastViewModel(params));
  });
});
