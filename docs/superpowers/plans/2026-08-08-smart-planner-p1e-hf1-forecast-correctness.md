# Smart Planner P1E-HF1 Forecast Correctness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct Forecast workload, confidence, calendar capacity, and completion-date semantics so Forecast and Roadmap are driven by the same planned-duration schedule projection and cannot report an impossible early completion.

**Architecture:** Introduce three pure boundaries—lesson-level study evidence, canonical daily capacity, and a full bounded schedule projection—then make the Forecast read model compose them. `pickDayQueue()` remains the placement engine. React only renders semantic view-model fields; it never owns schedule arithmetic.

**Tech Stack:** TypeScript, React, Vitest, existing planner/date/progress modules, GitHub Actions.

## Global Constraints

- Exact predecessor: `main@78f042255fe46e9bbc69193e6ef47158442cdf03`.
- Branch: `fix/p1e-hf1-forecast-correctness`.
- No amend, rebase, squash, force-push, dependency change, CI change, or persistence-schema migration.
- Weekly Summary raw-ID work and all P2 work are out of scope.
- Unfinished ordinary lessons consume `lesson.plannedDurationMinutes`.
- Non-review `focus-timer` and `manual` sessions may contribute to evidence only after grouping by completed current-catalog lesson.
- Review sessions carrying `reviewTaskId` never contribute to new-learning evidence.
- Sunday default capacity is `0`; explicit per-date Sunday capacity is honored; current-day `todayHours` has highest precedence.
- Forecast new-learning workload is the sum of planned minutes for unfinished current-catalog lessons.
- Forecast completion is the canonical projection's last scheduled lesson date only when projection is complete.
- An incomplete projection renders a no-date state.
- The uploaded personal CSV is evidence only and is never committed. Synthetic tests preserve its verified counts and duration distribution.
- Natural GitHub Actions on exact PR heads is executable RED/GREEN evidence.
- Final exact-head gate: typecheck + lint + all tests + production build + clean-tree.

---

## File Map

### Create

- `src/lib/study-duration-evidence.ts`
- `src/lib/study-duration-evidence.test.ts`
- `src/lib/daily-capacity.ts`
- `src/lib/daily-capacity.test.ts`
- `src/lib/schedule-projection.ts`
- `src/lib/schedule-projection.test.ts`

### Modify

- `src/lib/planner.ts`
- `src/lib/planner.test.ts`
- `src/lib/forecast-view-model.ts`
- `src/lib/forecast-view-model.test.ts`
- `src/lib/forecast-card-runtime.test.ts`
- `src/lib/forecast-clarity-regression.test.ts`
- `src/components/ForecastCard.tsx`
- `src/routes/index.tsx` only to remove the obsolete Forecast `shiftedDates` prop; Roadmap use remains unchanged.

### Preserve

- `StudyMeta.actualMinutes` persisted shape.
- review interval generation and review-item minute semantics.
- public `forecast()` export unless exact source search proves there is no caller; Forecast UI/read-model must have zero callsites to it after Task 4.

---

## Shared Test Fixtures

Each affected test file may define a local copy of these deterministic helpers instead of introducing a shared test utility.

```ts
function lesson(id: string, overrides: Partial<Lesson> = {}): Lesson {
  return {
    id,
    title: id,
    xp: 10,
    plannedDurationMinutes: 120,
    scheduledDate: "2026-08-08",
    scheduleMode: "flexible",
    weekday: "T7",
    sourceSubject: "Toán",
    week: 1,
    initialDone: false,
    ...overrides,
  };
}

function subjectsWith(lessons: Lesson[]): Subject[] {
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
          lessons,
        },
      ],
    },
  ];
}
```

For study sessions, use the existing `createStudySession()` helper with fixed `endedAt` timestamps so tests are deterministic.

---

### Task 1: Lesson-Level Study-Duration Evidence

**Files:**
- Create: `src/lib/study-duration-evidence.test.ts`
- Create: `src/lib/study-duration-evidence.ts`

**Produces:**

```ts
export type LessonDurationEvidence = {
  lessonId: string;
  plannedMinutes: number;
  observedMinutes: number;
  ratio: number;
  sessionCount: number;
};

export type ForecastEvidenceConfidence = "insufficient" | "low" | "medium" | "high";

export type StudyDurationEvidenceSummary = {
  lessons: LessonDurationEvidence[];
  lessonCount: number;
  sessionCount: number;
  coefficientOfVariation: number | null;
  confidence: ForecastEvidenceConfidence;
};

export function selectStudyDurationEvidence(params: {
  subjects: Subject[];
  completedLessons: Record<string, string>;
  studySessions: StudySession[];
}): StudyDurationEvidenceSummary;
```

Confidence is fixed to:

```text
n < 3                    => insufficient
3 <= n < 7               => low
7 <= n < 20              => medium
n >= 20 and CV <= 0.35   => high
n >= 20 and CV > 0.35    => medium
```

- [ ] **Step 1: Write RED aggregation tests**

Use this exact first regression:

```ts
const subjects = subjectsWith([lesson("lesson-1")]);
const studySessions = [
  createStudySession({
    id: "s1",
    lessonId: "lesson-1",
    endedAt: "2026-08-08T01:20:00.000Z",
    durationSeconds: 20 * 60,
    source: "focus-timer",
  }),
  createStudySession({
    id: "s2",
    lessonId: "lesson-1",
    endedAt: "2026-08-08T02:20:00.000Z",
    durationSeconds: 20 * 60,
    source: "focus-timer",
  }),
  createStudySession({
    id: "s3",
    lessonId: "lesson-1",
    endedAt: "2026-08-08T03:20:00.000Z",
    durationSeconds: 20 * 60,
    source: "focus-timer",
  }),
];

const result = selectStudyDurationEvidence({
  subjects,
  completedLessons: { "lesson-1": "2026-08-08" },
  studySessions,
});

expect(result.lessonCount).toBe(1);
expect(result.sessionCount).toBe(3);
expect(result.lessons).toEqual([
  {
    lessonId: "lesson-1",
    plannedMinutes: 120,
    observedMinutes: 60,
    ratio: 0.5,
    sessionCount: 3,
  },
]);
```

Add a second test with one 20-minute `focus-timer`, one 10-minute `manual`, and one 15-minute session carrying `reviewTaskId: "review:lesson-1:2026-08-08"`. Expected evidence is 30 observed minutes and two qualifying sessions.

Add a third test proving sessions for an incomplete current lesson and a completed deleted-catalog lesson produce zero evidence lessons.

- [ ] **Step 2: Commit test-only RED**

Commit `test: expose lesson-level forecast evidence bug`. Create the Draft PR before waiting for CI. Valid RED requires install/typecheck/lint to pass and only the intended evidence behavior to fail.

- [ ] **Step 3: Implement the pure selector**

Use a live lesson map and a grouped accumulator:

```ts
const liveLessons = new Map(
  params.subjects.flatMap((subject) =>
    subject.milestones.flatMap((milestone) =>
      milestone.lessons.map((item) => [item.id, item] as const),
    ),
  ),
);

const grouped = new Map<string, { seconds: number; sessionCount: number }>();
for (const session of params.studySessions) {
  if (session.reviewTaskId) continue;
  if (!params.completedLessons[session.lessonId]) continue;
  if (!liveLessons.has(session.lessonId)) continue;
  const current = grouped.get(session.lessonId) ?? { seconds: 0, sessionCount: 0 };
  current.seconds += session.durationSeconds;
  current.sessionCount += 1;
  grouped.set(session.lessonId, current);
}
```

Convert seconds to minutes once per lesson. Compute population CV over `observedMinutes / plannedMinutes`; return `null` when fewer than two ratios or mean ratio is zero. Do not read `studyMeta.actualMinutes`.

- [ ] **Step 4: Validate exact-head GREEN**

Natural CI must pass the new tests and the full existing suite/build/clean-tree. Formatting-only corrections use forward commits and do not count as GREEN until a new exact-head run passes.

---

### Task 2: Planned Lesson Cost and Canonical Daily Capacity

**Files:**
- Create: `src/lib/daily-capacity.test.ts`
- Create: `src/lib/daily-capacity.ts`
- Modify: `src/lib/planner.test.ts`
- Modify: `src/lib/planner.ts`

**Produces:**

```ts
export function resolveDailyCapacityHours(params: {
  dateISO: string;
  currentDateISO: string;
  settings: PlannerSettings;
}): number;
```

- [ ] **Step 1: Write RED daily-capacity tests**

Given `currentDateISO = "2026-08-08"`, assert all five cases:

```ts
expect(resolveDailyCapacityHours({
  dateISO: "2026-08-08",
  currentDateISO: "2026-08-08",
  settings: { ...DEFAULT_PLANNER_SETTINGS, todayHours: 3, dailyHours: { "2026-08-08": 9 } },
})).toBe(3);

expect(resolveDailyCapacityHours({
  dateISO: "2026-08-09",
  currentDateISO: "2026-08-08",
  settings: { ...DEFAULT_PLANNER_SETTINGS, dailyHours: { "2026-08-09": 4 } },
})).toBe(4);

expect(resolveDailyCapacityHours({
  dateISO: "2026-08-09",
  currentDateISO: "2026-08-08",
  settings: { ...DEFAULT_PLANNER_SETTINGS, defaultDailyHours: 6, dailyHours: {} },
})).toBe(0);

expect(resolveDailyCapacityHours({
  dateISO: "2026-08-10",
  currentDateISO: "2026-08-08",
  settings: { ...DEFAULT_PLANNER_SETTINGS, defaultDailyHours: 6, dailyHours: {} },
})).toBe(6);

expect(resolveDailyCapacityHours({
  dateISO: "2026-08-10",
  currentDateISO: "2026-08-08",
  settings: { ...DEFAULT_PLANNER_SETTINGS, defaultDailyHours: 6, dailyHours: { "2026-08-10": 0 } },
})).toBe(0);
```

- [ ] **Step 2: Write RED planned-duration scheduler test**

Build one 120-minute flexible lesson with `meta.actualMinutes = { "lesson-1": [20, 20, 20] }`. With `hoursOverride: 1`, assert `queue.newLessons` is empty. With `hoursOverride: 2`, assert the lesson is placed and `queue.newMinutes === 120`.

- [ ] **Step 3: Commit test-only RED**

Commit `test: expose scheduler capacity semantics bug`. Valid RED must reach tests; lint/typecheck failures are not behavioral RED.

- [ ] **Step 4: Implement capacity resolver**

```ts
export function resolveDailyCapacityHours({ dateISO, currentDateISO, settings }: Params): number {
  if (dateISO === currentDateISO) return settings.todayHours;
  if (Object.prototype.hasOwnProperty.call(settings.dailyHours, dateISO)) {
    return settings.dailyHours[dateISO];
  }
  if (isSundayISO(dateISO)) return 0;
  return settings.defaultDailyHours;
}
```

- [ ] **Step 5: Replace ordinary placement estimates with planned duration**

Inside `pickDayQueue()`, use `lesson.plannedDurationMinutes` for pinned ordinary lessons, fixed candidates, flexible candidates, and unplaced fixed minute totals. Keep review-item minutes unchanged. `estimateLessonMinutes()` may remain exported, but `pickDayQueue()` must no longer call it.

- [ ] **Step 6: Route bounded planning through the capacity resolver**

`buildFlexiblePlan()` resolves each day with:

```ts
const hours = resolveDailyCapacityHours({
  dateISO,
  currentDateISO: todayISO(),
  settings: args.settings,
});
```

- [ ] **Step 7: Validate exact-head GREEN**

Require all Task 2 tests plus the full suite/build/clean-tree.

---

### Task 3: Canonical Full Schedule Projection

**Files:**
- Create: `src/lib/schedule-projection.test.ts`
- Create: `src/lib/schedule-projection.ts`
- Modify: `src/lib/planner.ts`
- Modify: `src/lib/planner.test.ts`

**Produces:**

```ts
export type ScheduleProjection = {
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

export function buildScheduleProjection(params: {
  subjects: Subject[];
  completed: Record<string, string>;
  reviewCompletions?: Record<string, string>;
  meta: StudyMeta;
  settings: PlannerSettings;
  fromISO?: string;
  currentDateISO?: string;
  maxDays?: number;
}): ScheduleProjection;
```

- [ ] **Step 1: Write RED projection tests**

Use fixed small fixtures to prove:

1. Two schedulable 120-minute flexible lessons under 2 hours/day project completely and `lastScheduledLessonDate` equals the latest value in `datesByLesson`.
2. A lesson with `scheduledDate: ""` is listed in `unscheduledLessonIds` and makes projection incomplete.
3. A 120-minute fixed lesson on a 60-minute day is listed in `unplacedFixedLessonIds` and makes projection incomplete.
4. A flexible lesson with `maxDays: 1` and zero capacity is listed in `unprojectedLessonIds`.
5. A default Sunday contributes no capacity; an explicit Sunday override contributes capacity.

- [ ] **Step 2: Write RED Roadmap compatibility test**

Define one `args` object containing the same subjects/completed/meta/settings/fromISO and assert:

```ts
const projection = buildScheduleProjection(args);
expect(buildShiftedSchedule(args)).toEqual(projection.datesByLesson);
```

- [ ] **Step 3: Commit test-only RED**

Commit `test: require one canonical schedule projection` and validate natural behavioral RED.

- [ ] **Step 4: Implement bounded projection**

Collect unfinished ordinary lessons, classify empty `scheduledDate` values before the day loop, and iterate using one shared `consumed` set. For each day call `resolveDailyCapacityHours()` and then `pickDayQueue()`. Record placed dates and unplaced fixed IDs. Count days where resolved capacity is greater than zero in `positiveCapacityDays`.

The default bound is:

```ts
const daysToLatestEligibility = Math.max(0, daysBetweenISO(fromISO, latestEligibilityISO));
const minimumBound = Math.max(365, daysToLatestEligibility + unfinishedCount * 2);
const bound = Math.min(3660, params.maxDays ?? minimumBound);
```

After the loop, every schedulable unfinished ID not placed is `unprojected`. `projectionComplete` is true only when unscheduled, unplaced-fixed, and unprojected arrays are all empty. Emit `lastScheduledLessonDate` only when complete and at least one unfinished lesson was projected.

- [ ] **Step 5: Convert `buildShiftedSchedule()` into a wrapper**

Its body becomes:

```ts
return buildScheduleProjection({
  subjects: args.subjects,
  completed: args.completed,
  meta: args.meta,
  settings: args.settings,
  fromISO: args.fromISO,
}).datesByLesson;
```

Preserve its public return type.

- [ ] **Step 6: Validate exact-head GREEN**

Require projection/planner tests plus full suite/build/clean-tree.

---

### Task 4: Forecast Read Model — Planned Workload, Projection Date, Confidence

**Files:**
- Modify: `src/lib/forecast-view-model.test.ts`
- Modify: `src/lib/forecast-view-model.ts`
- Modify: `src/lib/forecast-clarity-regression.test.ts`
- Modify: `src/lib/planner.ts` only to deprecate or remove the last old authoritative Forecast call path.

**Produces:**

```ts
export type ForecastCompletion =
  | { kind: "complete" }
  | { kind: "date"; dateISO: string }
  | {
      kind: "unresolved";
      reason: "no-capacity" | "unscheduled" | "unplaced-fixed" | "projection-bound";
      unscheduledLessons: number;
      unplacedFixedLessons: number;
      unprojectedLessons: number;
    };

export type ForecastEvidenceBasis = "planned-only" | "planned-with-study-evidence";

export type ForecastViewModel = {
  defaultDailyHours: number;
  explicitCapacityOverrideCount: number;
  sundayRestByDefault: true;
  horizonWeeks: ForecastHorizonWeeks;
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
  confidence: ForecastEvidenceConfidence;
  basis: ForecastEvidenceBasis;
  completion: ForecastCompletion;
};
```

- [ ] **Step 1: Write RED real-roadmap synthetic workload test**

Generate exactly 352 unique lessons distributed 160/116/69/7 across Toán/Hóa/Lý/Tiếng Anh. Assign 345 lessons 120 minutes, 6 lessons 90 minutes, and 1 lesson 30 minutes. Assert full workload is `699.5` hours.

Mark the first 11 deterministic lessons complete and assert:

```ts
expect(result.remainingLessons).toBe(341);
expect(result.totalNewHours).toBeGreaterThanOrEqual(677.5);
expect(result.totalNewHours).not.toBeCloseTo(210.3, 1);
```

Add short historical sessions to completed lessons; the workload assertions remain unchanged.

- [ ] **Step 2: Write RED evidence/confidence integration tests**

Assert these exact outcomes:

```text
22 sessions across only 2 completed lessons => insufficient
20 completed lessons with ratios all between 0.9 and 1.1 => high
20 completed lessons alternating ratios 0.25 and 1.75 => medium
0 evidence lessons => planned-only
1 or more evidence lessons => planned-with-study-evidence
```

- [ ] **Step 3: Write RED completion-state tests**

Assert:

```text
no unfinished lessons => complete
complete projection => date equal to buildScheduleProjection().lastScheduledLessonDate
positiveCapacityDays === 0 with unfinished work => unresolved/no-capacity
unscheduled IDs present => unresolved/unscheduled
unplaced fixed IDs present => unresolved/unplaced-fixed
unprojected IDs present with positiveCapacityDays > 0 => unresolved/projection-bound
```

This ordering removes the former zero-capacity/projection-bound ambiguity.

- [ ] **Step 4: Write RED capacity metadata test**

With `dailyHours: { "2026-08-10": 4 }` and a projection spanning that date, assert `explicitCapacityOverrideCount >= 1`.

- [ ] **Step 5: Commit test-only RED**

Commit `test: expose impossible forecast workload and completion` and validate natural RED.

- [ ] **Step 6: Rewrite selector composition**

Flatten unfinished current-catalog lessons and compute:

```ts
const totalNewMinutes = unfinishedLessons.reduce(
  (sum, item) => sum + item.plannedDurationMinutes,
  0,
);
const totalReviewMinutes = Math.round(totalNewMinutes * 0.35);
const evidence = selectStudyDurationEvidence({
  subjects: params.subjects,
  completedLessons: params.state.completedLessons,
  studySessions: params.state.studySessions,
});
const projection = buildScheduleProjection({
  subjects: params.subjects,
  completed: params.state.completedLessons,
  reviewCompletions: params.state.reviewCompletions,
  meta: params.state.studyMeta,
  settings: params.state.plannerSettings,
  fromISO: startISO,
});
```

Use `buildFlexiblePlan()` plus `summarizeUnscheduledWork()` only for bounded horizon visibility.

- [ ] **Step 7: Resolve completion with fixed priority**

```text
remainingLessons === 0                         => complete
projectionComplete + lastScheduledLessonDate  => date
projection.positiveCapacityDays === 0          => unresolved/no-capacity
unscheduled IDs present                        => unresolved/unscheduled
unplaced fixed IDs present                     => unresolved/unplaced-fixed
unprojected IDs present                        => unresolved/projection-bound
```

Always include all three blocker counts in unresolved output.

- [ ] **Step 8: Remove old Forecast authority**

Search source for calls to `forecast(`. `src/lib/forecast-view-model.ts` and `src/components/ForecastCard.tsx` must contain none. If the function remains exported, add a deprecation comment stating that schedule completion/confidence must use `selectForecastViewModel()`.

- [ ] **Step 9: Validate exact-head GREEN**

Require all Task 4 tests plus full suite/build/clean-tree.

---

### Task 5: Truthful ForecastCard Presentation

**Files:**
- Modify: `src/lib/forecast-card-runtime.test.ts`
- Modify: `src/components/ForecastCard.tsx`
- Modify: `src/routes/index.tsx` to remove only the unused Forecast `shiftedDates` prop.

**Consumes:** Task 4 `ForecastViewModel` only.

- [ ] **Step 1: Write RED runtime workload test**

Render production `ForecastCard` with two unfinished 120-minute lessons and short unrelated study sessions. Assert the `Bài mới` metric renders `4 giờ`.

- [ ] **Step 2: Write RED runtime completion test**

Render a schedulable fixture and independently call `buildScheduleProjection()` with the same inputs. Assert the component contains `displayDate(projection.lastScheduledLessonDate)` and does not render an independent earlier range.

- [ ] **Step 3: Write RED unresolved-state test**

Render one unfinished lesson with `scheduledDate: ""`. Assert `Chưa thể xác định ngày hoàn thành` is visible and no fabricated completion date is present.

- [ ] **Step 4: Write RED confidence-copy test**

Render 22 sessions belonging to only two completed lessons. Assert `Độ tin cậy cao` is absent and the evidence copy refers to completed lessons rather than raw session count.

- [ ] **Step 5: Write RED capacity-copy test**

With one explicit future `dailyHours` override, assert the old sentence beginning `Tính toán theo vận tốc học đều` is absent. Assert the replacement contains `Theo lịch công suất hiện tại`, the normalized default hours, `Chủ nhật nghỉ nếu không đặt riêng`, and text indicating date-specific capacity is included.

- [ ] **Step 6: Commit test-only RED**

Commit `test: require truthful forecast presentation` and validate natural RED.

- [ ] **Step 7: Implement minimal UI changes**

Use these labels:

```text
Dự kiến hoàn thành       -> Mốc học hết bài mới theo lịch hiện tại
Quỹ giờ giả định         -> Công suất mặc định
```

Completion text:

```text
complete    -> Đã hoàn thành tất cả! 🎉
date        -> displayDate(dateISO)
unresolved  -> Chưa thể xác định ngày hoàn thành
```

Capacity summary:

```text
Theo lịch công suất hiện tại · mặc định X giờ/ngày · Chủ nhật nghỉ nếu không đặt riêng.
```

Append `Có N ngày đặt công suất riêng được tính vào dự báo.` when `explicitCapacityOverrideCount > 0`.

Basis copy:

```text
planned-only -> Khối lượng dựa trên thời lượng kế hoạch. Chưa đủ bài hoàn thành có dữ liệu học để đánh giá độ tin cậy.
planned-with-study-evidence -> Khối lượng dựa trên thời lượng kế hoạch. Độ tin cậy dựa trên N bài đã hoàn thành có dữ liệu học thực tế.
```

Remove the old global `~meanMinutes/bài` authority.

- [ ] **Step 8: Remove obsolete Forecast prop**

Delete `shiftedDates?: Record<string, string>` from `ForecastCard` props and remove only `shiftedDates={shiftedDates}` from the ForecastCard route call. Do not alter the Roadmap prop.

- [ ] **Step 9: Validate exact-head GREEN**

Require runtime tests plus full suite/build/clean-tree.

---

### Task 6: Final Audit, Evidence, and Review Handoff

**Files:**
- Create: `docs/superpowers/evidence/2026-08-08-smart-planner-p1e-hf1-forecast-correctness-completion.md`

- [ ] **Step 1: Freeze literal source/test head**

Record the exact SHA after Task 5 GREEN. Production code stays frozen unless a new behavioral gap requires reopening RED/GREEN.

- [ ] **Step 2: Scope-audit predecessor to source/test head**

Only the spec, plan, Task 1–5 source/test files, and the optional one-line Forecast route prop removal are allowed. Reject Weekly Summary, dependency, CI, deployment, or P2 changes.

- [ ] **Step 3: Record regression evidence**

The evidence document must name passing tests proving all of:

```text
352 lessons = 699.5 planned hours
341 remaining after 11 completions >= 677.5 planned hours
short sessions cannot collapse workload toward 210.3 hours
one completed lesson with three sessions counts as one evidence lesson
review sessions are excluded
Sunday default rest and explicit Sunday override agree across scheduler/projection
Forecast completion equals canonical projection last date
buildShiftedSchedule output equals projection datesByLesson
incomplete projection emits no fake date
many sessions from too few lessons cannot yield high confidence
```

- [ ] **Step 4: Create docs-only evidence commit**

Record exact predecessor SHA, spec commits, final plan commit, valid RED/GREEN run IDs/jobs/merge refs per task, invalid formatting runs separately, literal source/test head, changed-file scope, and out-of-scope limitations. Commit `docs: record P1E-HF1 forecast correctness evidence`.

- [ ] **Step 5: Validate evidence-head CI**

Natural CI on the evidence head must pass typecheck, lint, all tests, build, and clean-tree.

- [ ] **Step 6: Independent review handoff**

Keep the PR Draft/open/unmerged and post:

```text
P1E-HF1 IMPLEMENTED / REVIEW_PENDING / NOT_MERGED
```

Independent review must fresh-read the exact evidence head, predecessor, spec, plan, source/tests, CI, scope, and review threads before acceptance.
