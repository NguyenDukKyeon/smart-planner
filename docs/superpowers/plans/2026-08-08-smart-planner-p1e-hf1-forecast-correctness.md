# Smart Planner P1E-HF1 Forecast Correctness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct Forecast workload, confidence, calendar capacity, and completion-date semantics so Forecast and Roadmap are driven by the same planned-duration schedule projection and cannot report an impossible early completion.

**Architecture:** Separate the hotfix into four pure boundaries: lesson-level study-duration evidence, canonical daily-capacity resolution, a shared full schedule projection, and a Forecast read model that composes those boundaries. The existing day scheduler remains the placement engine; Forecast stops owning an independent arithmetic completion clock. React only renders semantic read-model fields.

**Tech Stack:** TypeScript, React, Vitest, existing planner/date/progress modules, GitHub Actions.

## Global Constraints

- Exact predecessor: `main@78f042255fe46e9bbc69193e6ef47158442cdf03`.
- Branch: `fix/p1e-hf1-forecast-correctness`.
- No history rewriting: no amend, rebase, squash, or force-push.
- No persistence-schema migration and no deletion of historical `studyMeta.actualMinutes` data.
- No new dependency.
- Weekly Summary raw-ID work is out of scope.
- P2 work is out of scope.
- Unfinished ordinary lessons consume `lesson.plannedDurationMinutes`; study-session history must not silently change scheduler capacity cost.
- Study-duration evidence accepts non-review `focus-timer` and `manual` sessions, groups by completed current-catalog lesson, and sums sessions per lesson.
- Review sessions (`reviewTaskId`) never contribute to new-learning evidence.
- Sunday default capacity is `0`; an explicit per-date Sunday override is honored; current-day `todayHours` has highest precedence.
- Forecast new-learning workload is the sum of planned minutes for unfinished current-catalog lessons.
- Forecast completion is the last lesson date from the canonical full schedule projection only when that projection is complete.
- An incomplete projection must render a truthful no-date state.
- The uploaded personal CSV is evidence only and must not be committed; tests use deterministic synthetic fixtures preserving its verified workload invariants.
- Natural GitHub Actions on exact PR heads is executable RED/GREEN evidence.
- Final gate: typecheck + lint + full tests + production build + clean-tree on the exact source/test head and again on the docs-only evidence head.

---

## File map

### Create

- `src/lib/study-duration-evidence.ts` — aggregate non-review study sessions into one evidence record per completed lesson and derive confidence.
- `src/lib/study-duration-evidence.test.ts` — unit coverage for aggregation, review exclusion, source handling, and confidence.
- `src/lib/daily-capacity.ts` — one canonical daily-capacity resolver.
- `src/lib/daily-capacity.test.ts` — precedence and Sunday-policy coverage.
- `src/lib/schedule-projection.ts` — full bounded projection composed from `pickDayQueue()`.
- `src/lib/schedule-projection.test.ts` — projection completion, unresolved work, date equality, and bound coverage.

### Modify

- `src/lib/planner.ts` — ordinary placement uses planned lesson duration; `buildFlexiblePlan()` and `buildShiftedSchedule()` consume canonical capacity/projection boundaries; legacy `forecast()` is removed from authoritative Forecast call paths and narrowed or deprecated without leaving a live wrong authority.
- `src/lib/planner.test.ts` — planned-duration scheduler regression and Sunday consistency integration.
- `src/lib/forecast-view-model.ts` — compose planned workload, evidence, projection, and horizon visibility.
- `src/lib/forecast-view-model.test.ts` — real-roadmap synthetic workload, completion, unresolved state, override metadata, confidence.
- `src/components/ForecastCard.tsx` — truthful schedule-projection copy, workload labels, confidence basis, and unresolved completion state.
- `src/lib/forecast-card-runtime.test.ts` — render production component and verify user-visible corrected semantics.
- `src/lib/forecast-clarity-regression.test.ts` — protect against reintroducing the old independent arithmetic date or `shiftedDates` override.
- `src/routes/index.tsx` — only remove the obsolete `shiftedDates` Forecast prop if it remains unused; no other route behavior change.

### Preserve unless exact callsite inspection proves removal safe

- `StudyMeta.actualMinutes` persisted shape.
- `forecast()` export compatibility for any unrelated caller; if retained, annotate it as non-authoritative and ensure Forecast UI/read-model has zero callsites to it.
- existing review task generation and 15-minute review-item scheduling semantics.

---

### Task 1: Lesson-level study-duration evidence

**Files:**
- Create: `src/lib/study-duration-evidence.test.ts`
- Create: `src/lib/study-duration-evidence.ts`

**Interfaces:**

Produces:

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

Confidence rules:

```text
n < 3                    => insufficient
3 <= n < 7               => low
7 <= n < 20              => medium
n >= 20 and CV <= 0.35   => high
n >= 20 and CV > 0.35    => medium
```

- [ ] **Step 1: Add RED aggregation tests**

Test these concrete cases:

```ts
it("aggregates three non-review sessions into one completed-lesson sample", () => {
  // completed lesson-1, planned 120m; sessions 20m + 20m + 20m
  const result = selectStudyDurationEvidence(...);
  expect(result.lessonCount).toBe(1);
  expect(result.sessionCount).toBe(3);
  expect(result.lessons[0]).toMatchObject({
    lessonId: "lesson-1",
    plannedMinutes: 120,
    observedMinutes: 60,
    ratio: 0.5,
    sessionCount: 3,
  });
});

it("excludes review sessions and accepts manual non-review sessions", () => {
  // one focus-timer 20m, one manual 10m, one review 15m on same completed lesson
  expect(result.lessons[0].observedMinutes).toBe(30);
  expect(result.lessons[0].sessionCount).toBe(2);
});

it("ignores incomplete and deleted-catalog lessons as confidence evidence", () => {
  expect(result.lessonCount).toBe(0);
});
```

- [ ] **Step 2: Commit test-only RED**

Commit message:

```text
test: expose lesson-level forecast evidence bug
```

Open a Draft PR if one does not yet exist. Wait for natural `pull_request` GitHub Actions. Valid RED requires install/typecheck/lint to pass and the intended new evidence tests to fail because `selectStudyDurationEvidence` does not exist or does not implement the required semantics.

- [ ] **Step 3: Implement the minimal pure selector**

Implementation rules:

```ts
const liveLessons = new Map(
  subjects.flatMap((subject) =>
    subject.milestones.flatMap((milestone) =>
      milestone.lessons.map((lesson) => [lesson.id, lesson] as const),
    ),
  ),
);

// Include only current-catalog + completed + non-review sessions.
// Group seconds by lessonId, sum seconds, convert once to minutes.
// Keep raw qualifying session count separately.
```

CV calculation for ratios `r1..rn`:

```ts
const mean = ratios.reduce((sum, value) => sum + value, 0) / ratios.length;
const variance = ratios.reduce((sum, value) => sum + (value - mean) ** 2, 0) / ratios.length;
const cv = mean > 0 ? Math.sqrt(variance) / mean : null;
```

Do not read `studyMeta.actualMinutes`.

- [ ] **Step 4: Obtain exact-head GREEN**

Natural CI must show the new evidence tests passing plus the full existing suite/build/clean-tree.

- [ ] **Step 5: Commit semantics if formatting-only corrections are needed**

Use forward-only commits such as:

```text
style: format forecast evidence selector
```

Never count a lint-blocked run as GREEN.

---

### Task 2: Planned ordinary-lesson duration and canonical daily capacity

**Files:**
- Create: `src/lib/daily-capacity.test.ts`
- Create: `src/lib/daily-capacity.ts`
- Modify: `src/lib/planner.test.ts`
- Modify: `src/lib/planner.ts`

**Interfaces:**

Produces:

```ts
export function resolveDailyCapacityHours(params: {
  dateISO: string;
  currentDateISO: string;
  settings: PlannerSettings;
}): number;
```

Required precedence:

```ts
if (dateISO === currentDateISO) return settings.todayHours;
if (Object.prototype.hasOwnProperty.call(settings.dailyHours, dateISO)) {
  return settings.dailyHours[dateISO];
}
if (isSundayISO(dateISO)) return 0;
return settings.defaultDailyHours;
```

- [ ] **Step 1: Add RED daily-capacity tests**

Cover:

```text
current day wins over an explicit dailyHours entry
explicit non-current Sunday override is honored
non-current Sunday without override is 0
ordinary weekday without override uses defaultDailyHours
explicit weekday 0 is preserved
```

- [ ] **Step 2: Add RED scheduler-duration regression**

Use a 120-minute flexible lesson with `studyMeta.actualMinutes[lessonId] = [20, 20, 20]` and only 60 minutes of capacity. Assert it is not placed as a 20-minute/short lesson and remains outside `queue.newLessons`.

Also assert a 120-minute lesson fits when capacity is exactly 120 minutes.

- [ ] **Step 3: Commit test-only RED and validate natural CI**

Commit:

```text
test: expose scheduler capacity semantics bug
```

Valid RED must reach tests; formatting/type errors do not count.

- [ ] **Step 4: Implement `resolveDailyCapacityHours()`**

Keep it pure and normalize neither storage nor UI values; planner settings are already normalized by the existing study-hours boundary.

- [ ] **Step 5: Make ordinary lesson placement consume planned duration**

In `pickDayQueue()` use `lesson.plannedDurationMinutes` for:

```text
pinned completed ordinary lessons
fixed candidates
flexible candidates
unplaced fixed minute totals
```

Do not change review item minutes.

If `estimateLessonMinutes()` remains exported for compatibility, do not call it from ordinary placement after this step.

- [ ] **Step 6: Make `buildFlexiblePlan()` use canonical daily capacity**

Replace its inline `todayHours / dailyHours / defaultDailyHours` branch with `resolveDailyCapacityHours({ dateISO, currentDateISO: todayISO(), settings })`.

- [ ] **Step 7: Obtain exact-head GREEN**

Require all Task 2 tests and full suite/build/clean-tree PASS.

---

### Task 3: Shared full schedule projection and Roadmap compatibility

**Files:**
- Create: `src/lib/schedule-projection.test.ts`
- Create: `src/lib/schedule-projection.ts`
- Modify: `src/lib/planner.ts`
- Modify: `src/lib/planner.test.ts`

**Interfaces:**

Produces:

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

Default defensive bound:

```ts
const minimumBound = Math.max(
  365,
  daysNeededToReachLatestEligibility + unfinishedCount * 2,
);
const bound = Math.min(3660, params.maxDays ?? minimumBound);
```

- [ ] **Step 1: Add RED projection tests**

Cases:

```text
all schedulable lessons => projectionComplete true and lastScheduledLessonDate equals latest datesByLesson value
unscheduled ordinary lesson => projectionComplete false and ID in unscheduledLessonIds
fixed lesson that cannot fit exact-day capacity => projectionComplete false and ID in unplacedFixedLessonIds
bound reached with remaining flexible work => projectionComplete false and ID in unprojectedLessonIds
Sunday default rest and explicit Sunday override match daily-capacity tests
```

- [ ] **Step 2: Add RED Roadmap compatibility test**

For a deterministic schedulable fixture:

```ts
expect(buildShiftedSchedule(args)).toEqual(buildScheduleProjection(args).datesByLesson);
```

- [ ] **Step 3: Commit test-only RED and validate natural CI**

Commit:

```text
test: require one canonical schedule projection
```

- [ ] **Step 4: Implement bounded projection by composing `pickDayQueue()`**

Algorithm:

```text
collect unfinished ordinary lessons
classify empty scheduledDate as unscheduled before loop
for each day within bound:
  resolve canonical capacity
  call pickDayQueue() with shared consumed set
  collect queue.newLessons dates
  collect unplacedFixedLessons IDs
stop early only when every schedulable unfinished lesson is either placed or definitively unplaceable
remaining schedulable IDs after bound => unprojectedLessonIds
projectionComplete = no unscheduled + no unplacedFixed + no unprojected
lastScheduledLessonDate only when projectionComplete and at least one unfinished lesson was projected
```

Deduplicate all ID arrays.

- [ ] **Step 5: Convert `buildShiftedSchedule()` into a compatibility wrapper**

It must return exactly:

```ts
return buildScheduleProjection(args).datesByLesson;
```

Preserve its current public return type.

- [ ] **Step 6: Obtain exact-head GREEN**

Require projection tests, planner tests, full suite/build/clean-tree PASS.

---

### Task 4: Forecast read model — real planned workload, projection completion, and corrected confidence

**Files:**
- Modify: `src/lib/forecast-view-model.test.ts`
- Modify: `src/lib/forecast-view-model.ts`
- Modify: `src/lib/forecast-clarity-regression.test.ts`
- Modify: `src/lib/planner.ts` only if required to remove/deprecate the last authoritative `forecast()` call path

**Interfaces:**

Replace the old completion range with:

```ts
export type ForecastCompletion =
  | { kind: "complete" }
  | {
      kind: "date";
      dateISO: string;
    }
  | {
      kind: "unresolved";
      reason: "no-capacity" | "unscheduled" | "unplaced-fixed" | "projection-bound";
      unscheduledLessons: number;
      unplacedFixedLessons: number;
      unprojectedLessons: number;
    };
```

Forecast view model must expose:

```ts
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

- [ ] **Step 1: Add RED real-roadmap synthetic fixture**

Fixture generator must create exactly:

```text
352 unique lessons
160 Toán
116 Hóa học
69 Vật lý
7 Tiếng Anh
345 × 120 minutes
6 × 90 minutes
1 × 30 minutes
41,970 total minutes
```

Assertions:

```ts
expect(full.totalNewHours).toBe(699.5);

// Mark deterministic 11 lessons complete.
expect(partial.remainingLessons).toBe(341);
expect(partial.totalNewHours).toBeGreaterThanOrEqual(677.5);
```

Add historical session data averaging roughly 37 minutes and assert it does not reduce planned new-learning workload toward `210.3` hours.

- [ ] **Step 2: Add RED evidence/confidence integration tests**

Assert:

```text
20+ sessions belonging to only 2 completed lessons => confidence insufficient
20 completed lessons with stable ratios CV <= .35 => confidence high
20 completed lessons with unstable ratios CV > .35 => confidence medium
basis planned-only when evidenceLessonCount=0
basis planned-with-study-evidence when evidenceLessonCount>0
```

- [ ] **Step 3: Add RED projection completion tests**

Assert:

```text
complete projection => completion.kind=date and dateISO equals buildScheduleProjection(...).lastScheduledLessonDate
no remaining lessons => complete
zero effective future capacity => unresolved/no-capacity
unscheduled work => unresolved/unscheduled
unplaceable fixed work => unresolved/unplaced-fixed
projection bound => unresolved/projection-bound
```

- [ ] **Step 4: Add RED capacity-metadata test**

Provide explicit `dailyHours` overrides and assert `explicitCapacityOverrideCount` reports the number of explicit future/current-date entries that lie within the projection span and are relevant to the projected schedule. At minimum, a single explicit override in the projected period must yield a non-zero count.

- [ ] **Step 5: Commit test-only RED and validate natural CI**

Commit:

```text
test: expose impossible forecast workload and completion
```

- [ ] **Step 6: Rewrite `selectForecastViewModel()` composition**

Compute unfinished lessons directly from current catalog/completed map, then:

```ts
const totalNewMinutes = unfinishedLessons.reduce(
  (sum, lesson) => sum + lesson.plannedDurationMinutes,
  0,
);
const totalReviewMinutes = Math.round(totalNewMinutes * 0.35);
const evidence = selectStudyDurationEvidence(...);
const projection = buildScheduleProjection(...);
```

Do not call legacy `forecast()` for workload, date, or confidence.

Keep `buildFlexiblePlan()` + `summarizeUnscheduledWork()` only for bounded visible-horizon accounting.

- [ ] **Step 7: Resolve completion deterministically**

Priority:

```text
no unfinished lessons => complete
projectionComplete + lastScheduledLessonDate => date
unscheduled IDs present => unresolved/unscheduled
unplaced fixed IDs present => unresolved/unplaced-fixed
unprojected IDs present => unresolved/projection-bound
otherwise no usable capacity => unresolved/no-capacity
```

If multiple blockers exist, return the first priority reason above but include all blocking counts.

- [ ] **Step 8: Remove the old authoritative forecast call path**

Search changed/current source for `forecast(`. `ForecastCard` and `forecast-view-model` must have no call to the old arithmetic estimator. If `forecast()` is retained for compatibility, add a deprecation comment and tests proving Forecast completion does not depend on it.

- [ ] **Step 9: Obtain exact-head GREEN**

Require all view-model/regression tests and full suite/build/clean-tree PASS.

---

### Task 5: ForecastCard truthful presentation

**Files:**
- Modify: `src/lib/forecast-card-runtime.test.ts`
- Modify: `src/components/ForecastCard.tsx`
- Modify: `src/routes/index.tsx` only if removing the unused `shiftedDates` prop

**Interfaces:**
- Consumes the Task 4 `ForecastViewModel` only.
- Does not call scheduler, projection, persistence, or study-session selectors directly.

- [ ] **Step 1: Add RED runtime workload test**

Render production `ForecastCard` with a deterministic high-duration fixture and assert the displayed `Bài mới` value is derived from planned workload rather than short historical sessions.

- [ ] **Step 2: Add RED runtime completion test**

Render a schedulable fixture and assert the displayed completion date equals the canonical projection date. Assert the old independent range text is absent.

- [ ] **Step 3: Add RED unresolved-state test**

Render a fixture with an unscheduled or unplaceable ordinary lesson and assert:

```text
Chưa thể xác định ngày hoàn thành
```

is visible and no fake completion date/range is shown.

- [ ] **Step 4: Add RED confidence-copy test**

Repeated sessions from too few completed lessons must not render `Độ tin cậy cao`. Basis copy must mention completed lessons with study evidence, not raw session count.

- [ ] **Step 5: Add RED capacity-copy test**

With an explicit per-date override, assert the component does not contain:

```text
Tính toán theo vận tốc học đều X giờ/ngày
```

and does contain truthful copy equivalent to:

```text
Theo lịch công suất hiện tại · mặc định X giờ/ngày · Chủ nhật nghỉ nếu không đặt riêng
```

plus an indication that date-specific capacity overrides are included.

- [ ] **Step 6: Commit test-only RED and validate natural CI**

Commit:

```text
test: require truthful forecast presentation
```

- [ ] **Step 7: Implement minimal presentation changes**

Required visible semantics:

```text
Dự kiến hoàn thành -> Mốc học hết bài mới theo lịch hiện tại
Quỹ giờ giả định -> Công suất mặc định
```

Completion:

```text
complete => Đã hoàn thành tất cả! 🎉
date => displayDate(dateISO)
unresolved => Chưa thể xác định ngày hoàn thành
```

Footer/basis:

```text
planned-only => Khối lượng dựa trên thời lượng kế hoạch. Chưa đủ bài hoàn thành có dữ liệu học để đánh giá độ tin cậy.
planned-with-study-evidence => Khối lượng dựa trên thời lượng kế hoạch. Độ tin cậy dựa trên N bài đã hoàn thành có dữ liệu học thực tế.
```

Do not display the removed global `~meanMinutes/bài` as Forecast authority.

- [ ] **Step 8: Remove obsolete Forecast prop only if unused**

If `shiftedDates` remains declared but unused, remove it from `ForecastCard` props and its route call. Do not change Roadmap's `shiftedDates` usage.

- [ ] **Step 9: Obtain exact-head GREEN**

Require runtime tests plus full suite/build/clean-tree PASS.

---

### Task 6: Final regression audit, evidence, and review handoff

**Files:**
- Create: `docs/superpowers/evidence/2026-08-08-smart-planner-p1e-hf1-forecast-correctness-completion.md`
- Modify tests only if audit reveals a proof gap; production code stays frozen once Task 5 exact-head GREEN is established.

- [ ] **Step 1: Freeze literal source/test head**

Record the exact commit SHA after the last source/test change. No production changes after this point without reopening RED/GREEN.

- [ ] **Step 2: Scope audit predecessor → source/test head**

Expected changed paths are limited to the spec/plan plus the Task 1–5 files listed above. Reject unrelated source, dependency, CI, deployment, Weekly Summary, or P2 changes.

- [ ] **Step 3: Verify real-roadmap invariant in tests**

Evidence must name the passing tests proving:

```text
352 lessons = 699.5 planned hours
341 remaining after 11 completions >= 677.5 planned hours
short study sessions cannot collapse workload to ~210.3h
```

The evidence document may cite the user-provided CSV facts but must not add the CSV to git.

- [ ] **Step 4: Verify scheduler/Forecast convergence**

Evidence must name the test proving `Forecast completion date === canonical schedule projection last date` and the test proving `buildShiftedSchedule() === projection.datesByLesson` for the same fixture.

- [ ] **Step 5: Verify confidence and calendar policy**

Evidence must name passing tests for lesson-level sample count, review exclusion, unstable-CV confidence downgrade, Sunday default rest, explicit Sunday override, and truthful capacity copy.

- [ ] **Step 6: Create docs-only evidence commit**

Evidence document records:

```text
exact predecessor SHA
spec commits
plan commit
valid RED run IDs/jobs/merge refs per task
invalid lint/type runs separately, if any
GREEN source/test run IDs/jobs/merge refs
literal source/test head
changed-file scope
known limitations/out-of-scope
```

Commit:

```text
docs: record P1E-HF1 forecast correctness evidence
```

- [ ] **Step 7: Validate evidence-head CI**

Natural CI on the docs-only evidence head must PASS typecheck, lint, all tests, build, and clean-tree.

- [ ] **Step 8: Independent review handoff**

Keep PR Draft/open/unmerged. Mark disposition for review as:

```text
P1E-HF1 IMPLEMENTED / REVIEW_PENDING / NOT_MERGED
```

Independent review must fresh-read exact evidence head, predecessor, spec, plan, source/tests, CI, changed-file scope, and unresolved review threads before acceptance.
