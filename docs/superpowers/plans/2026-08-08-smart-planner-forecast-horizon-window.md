# Forecast Horizon Window Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Forecast 2/4/8/12-week selector scope the displayed scheduled lesson count and workload to the selected window while keeping the canonical whole-roadmap completion milestone invariant.

**Architecture:** Keep `buildFlexiblePlan()` as the sole selected-window scheduler and keep `selectForecastCompletion()` as the whole-roadmap completion/workload compatibility boundary. Extend `selectForecastViewModel()` with explicit horizon-scoped metrics derived from the already-built visible plan, then migrate `ForecastCard` to those scoped fields. Do not change scheduler placement, persistence, Roadmap, or Flexible Schedule behavior.

**Tech Stack:** TypeScript, React, Vitest, ReactDOM server rendering, GitHub Actions.

## Global Constraints

- Exact predecessor: `main@3444c5d54207ec16de90988958755da62507af11`.
- Branch: `fix/forecast-horizon-window`.
- Horizon options remain exactly `2 | 4 | 8 | 12` weeks => `14 | 28 | 56 | 84` calendar days.
- `completion` remains a whole-roadmap canonical projection fact and must be invariant across horizon changes for identical scheduling state.
- Existing global compatibility fields (`remainingLessons`, `totalNewHours`, `totalReviewHours`, `totalWorkloadHours`) retain their current whole-roadmap semantics.
- Add explicit horizon fields; `ForecastCard` must use those fields for lesson/workload tiles.
- `horizonScheduledLessons` counts unique unfinished lessons actually placed in `visiblePlan[*].queue.newLessons`.
- Completed pinned lessons do not count toward horizon scheduled lessons or horizon new workload.
- `horizonUnplacedFixedLessons` counts unique unfinished lessons in `visiblePlan[*].queue.unplacedFixedLessons` and is not scheduled workload.
- `horizonNewHours` sums canonical `plannedDurationMinutes` for unique unfinished scheduled lessons only.
- `horizonReviewHours` sums scheduler-provided `minutes` for unique uncompleted review tasks actually present in the selected visible plan; do not use the global `35%` estimate.
- `horizonWorkloadHours = horizonNewHours + horizonReviewHours` under the existing one-decimal display rounding policy.
- Horizon selection remains transient UI state and does not mutate planner settings or persistence.
- Sunday remains a normal default-capacity day under the already-merged seven-day capacity policy.
- No scheduler placement algorithm change, Roadmap change, Flexible Schedule change, persistence/schema change, dependency change, CI/deployment change, Weekly Summary change, or P2 work.
- Use natural GitHub Actions as executable RED/GREEN evidence.
- Do not amend, rebase, squash, force-push, or rewrite history.

---

### Task 1: Add horizon-scoped Forecast read-model metrics

**Files:**
- Create: `src/lib/forecast-horizon-window-regression.test.ts`
- Modify: `src/lib/forecast-view-model.test.ts`
- Modify: `src/lib/forecast-view-model.ts`

**Interfaces:**
- Consumes: existing `buildFlexiblePlan(): PlanDay[]`, `summarizeUnscheduledWork()`, `selectForecastCompletion()`.
- Produces these new `ForecastViewModel` fields:

```ts
totalRemainingLessons: number;
horizonScheduledLessons: number;
horizonNewHours: number;
horizonReviewHours: number;
horizonWorkloadHours: number;
horizonUnplacedFixedLessons: number;
```

- Keeps existing `remainingLessons`, `totalNewHours`, `totalReviewHours`, `totalWorkloadHours`, `completion`, confidence and evidence fields unchanged in meaning.

- [ ] **Step 1: Add RED type/behavior coverage to the focused horizon regression file**

Create `src/lib/forecast-horizon-window-regression.test.ts` with deterministic fixtures that call `selectForecastViewModel()` at a fixed `fromISO`.

Required first RED cases:

```ts
it("scopes lesson count and new workload to the selected horizon while preserving global completion", () => {
  const subjects = makeSubjects({ count: 40, minutes: 120, scheduledDate: "2026-08-08" });
  const state = makeState({ hours: 4 });

  const twoWeeks = selectForecastViewModel({
    subjects,
    state,
    horizonWeeks: 2,
    fromISO: "2026-08-08",
  });
  const twelveWeeks = selectForecastViewModel({
    subjects,
    state,
    horizonWeeks: 12,
    fromISO: "2026-08-08",
  });

  expect(twoWeeks.totalRemainingLessons).toBe(40);
  expect(twoWeeks.horizonScheduledLessons).toBeLessThan(40);
  expect(twelveWeeks.horizonScheduledLessons).toBeGreaterThanOrEqual(
    twoWeeks.horizonScheduledLessons,
  );
  expect(twelveWeeks.horizonNewHours).toBeGreaterThanOrEqual(twoWeeks.horizonNewHours);
  expect(twelveWeeks.outsideHorizonLessons).toBeLessThanOrEqual(twoWeeks.outsideHorizonLessons);
  expect(twelveWeeks.completion).toEqual(twoWeeks.completion);
});
```

Add a planned-duration assertion that computes the expected two-week scheduled IDs from `buildFlexiblePlan()` and verifies the selector uses those exact unique unfinished lessons rather than global totals:

```ts
const visiblePlan = buildFlexiblePlan({
  subjects,
  completed: state.completedLessons,
  reviewCompletions: state.reviewCompletions,
  meta: state.studyMeta,
  settings: state.plannerSettings,
  fromISO: "2026-08-08",
  horizonDays: 14,
});
const scheduled = new Map<string, number>();
for (const day of visiblePlan) {
  for (const lesson of day.queue.newLessons) {
    if (!state.completedLessons[lesson.id]) {
      scheduled.set(lesson.id, lesson.plannedDurationMinutes);
    }
  }
}
const expectedMinutes = [...scheduled.values()].reduce((sum, minutes) => sum + minutes, 0);
expect(twoWeeks.horizonScheduledLessons).toBe(scheduled.size);
expect(twoWeeks.horizonNewHours).toBe(Math.round((expectedMinutes / 60) * 10) / 10);
expect(twoWeeks.totalNewHours).toBeGreaterThanOrEqual(twoWeeks.horizonNewHours);
```

Add a whole-roadmap real-data-style regression using the existing 352-lesson distribution (`345×120`, `6×90`, `1×30`) with 11 completed lessons. It must prove the 2-week scoped values are not the whole-roadmap values:

```ts
expect(twoWeeks.totalRemainingLessons).toBe(341);
expect(twoWeeks.remainingLessons).toBe(341);
expect(twoWeeks.totalNewHours).toBe(677.5);
expect(twoWeeks.horizonScheduledLessons).toBeLessThan(341);
expect(twoWeeks.horizonNewHours).toBeLessThan(677.5);
```

- [ ] **Step 2: Add RED edge coverage for reviews, pinned completions, and unplaced fixed work**

In the same focused test file add three deterministic tests:

1. Completed pinned lesson exclusion:

```ts
expect(result.horizonScheduledLessons).toBe(result.totalRemainingLessons);
expect(result.horizonNewHours).toBe(/* planned minutes of unfinished scheduled lessons only */);
```

The fixture must include a lesson completed exactly on `fromISO` so `buildFlexiblePlan()` can pin it for visibility; the selector must still exclude it from horizon scheduled count/workload.

2. Review task scope:

Use a lesson completed one day before `fromISO`, so the scheduler produces the age-1 review task (`15` minutes) on `fromISO`. Assert:

```ts
expect(result.horizonReviewHours).toBe(0.3);
```

Then mark `review:<lessonId>:<fromISO>` completed in `state.reviewCompletions` and assert the same view model reports:

```ts
expect(result.horizonReviewHours).toBe(0);
```

3. Unplaced fixed lesson:

Create one unfinished `fixed` lesson of `180` planned minutes on a date with only `1` hour capacity. Assert:

```ts
expect(result.horizonUnplacedFixedLessons).toBe(1);
expect(result.horizonScheduledLessons).toBe(0);
expect(result.horizonNewHours).toBe(0);
```

Also assert:

```ts
expect(result.horizonWorkloadHours).toBe(
  Math.round((result.horizonNewHours + result.horizonReviewHours) * 10) / 10,
);
```

- [ ] **Step 3: Update the existing ForecastViewModel test-local type contract**

In `src/lib/forecast-view-model.test.ts`, extend the test-local `ViewModel` type with exactly:

```ts
totalRemainingLessons: number;
horizonScheduledLessons: number;
horizonNewHours: number;
horizonReviewHours: number;
horizonWorkloadHours: number;
horizonUnplacedFixedLessons: number;
```

Keep the existing global fields in that type. Extend the current horizon monotonicity test so it also checks:

```ts
expect(longView.horizonScheduledLessons).toBeGreaterThanOrEqual(
  shortView.horizonScheduledLessons,
);
expect(longView.horizonNewHours).toBeGreaterThanOrEqual(shortView.horizonNewHours);
expect(longView.completion).toEqual(shortView.completion);
```

Do not change the existing real-roadmap assertions that prove global workload is `341 / 677.5h`; those remain compatibility facts.

- [ ] **Step 4: Commit the test-only RED**

Commit only the test changes. Do not modify `src/lib/forecast-view-model.ts` yet.

Expected natural GitHub Actions result:

```text
typecheck PASS or test-local dynamic contract compilation PASS
lint PASS
tests FAIL only because the new horizon fields/behavior do not exist yet
```

If formatting/type errors prevent tests from running, fix only those errors and obtain a behavioral RED before production changes.

- [ ] **Step 5: Implement the minimal horizon summarizer in `forecast-view-model.ts`**

Extend `ForecastViewModel` with the six new fields.

Add one internal pure helper with this responsibility:

```ts
function summarizeForecastHorizon(params: {
  visiblePlan: ReturnType<typeof buildFlexiblePlan>;
  completedLessons: Record<string, string>;
}): {
  scheduledLessons: number;
  newMinutes: number;
  reviewMinutes: number;
  unplacedFixedLessons: number;
}
```

Implementation rules:

```ts
const scheduledLessons = new Map<string, number>();
const unplacedFixedLessonIds = new Set<string>();
const reviewTasks = new Map<string, number>();

for (const day of params.visiblePlan) {
  for (const lesson of day.queue.newLessons) {
    if (params.completedLessons[lesson.id]) continue;
    if (!scheduledLessons.has(lesson.id)) {
      scheduledLessons.set(lesson.id, lesson.plannedDurationMinutes);
    }
  }

  for (const lesson of day.queue.unplacedFixedLessons) {
    if (params.completedLessons[lesson.id]) continue;
    unplacedFixedLessonIds.add(lesson.id);
  }

  for (const review of day.queue.reviewLessons) {
    if (review.completed) continue;
    if (!reviewTasks.has(review.taskId)) {
      reviewTasks.set(review.taskId, review.minutes);
    }
  }
}
```

Return sums from those maps/sets. Do not derive horizon work from `base.totalNewHours` or the global 35% review estimate.

- [ ] **Step 6: Assemble new horizon fields from the already-built `visiblePlan`**

Inside `selectForecastViewModel()` after `visiblePlan` and `visibility` are available:

```ts
const horizon = summarizeForecastHorizon({
  visiblePlan,
  completedLessons: params.state.completedLessons,
});
const horizonNewHours = roundHours(horizon.newMinutes);
const horizonReviewHours = roundHours(horizon.reviewMinutes);
```

Return:

```ts
totalRemainingLessons: base.remainingLessons,
horizonScheduledLessons: horizon.scheduledLessons,
horizonNewHours,
horizonReviewHours,
horizonWorkloadHours:
  Math.round((horizonNewHours + horizonReviewHours) * 10) / 10,
horizonUnplacedFixedLessons: horizon.unplacedFixedLessons,
```

Keep all spread `...base` global fields unchanged. Keep `completion` from `selectForecastCompletion()`; do not recompute it from the horizon plan.

- [ ] **Step 7: Obtain full Task 1 GREEN**

Natural GitHub Actions must pass the full repository gate on the exact Task 1 source/test head:

```text
typecheck
lint
tests
build
clean-tree
```

Record exact head SHA, workflow run ID, job ID, test file count, test count, and PR merge ref for evidence.

---

### Task 2: Make ForecastCard visibly use the selected window

**Files:**
- Modify: `src/lib/forecast-card-runtime.test.ts`
- Modify: `src/components/ForecastCard.tsx`

**Interfaces:**
- Consumes Task 1 fields: `totalRemainingLessons`, `horizonScheduledLessons`, `horizonNewHours`, `horizonReviewHours`, `horizonWorkloadHours`, `horizonUnplacedFixedLessons`.
- Keeps `completion`, confidence, subject completion progress, capacity controls, and horizon-local state ownership unchanged.

- [ ] **Step 1: Write runtime RED assertions before changing JSX**

Update the first runtime test to require the new copy and exact scoped values from the selector:

```ts
expect(html).toContain("Mốc học hết toàn bộ bài mới");
expect(html).toContain("Bài trong phạm vi");
expect(html).toContain(
  `${expected.horizonScheduledLessons} / ${expected.totalRemainingLessons} bài`,
);
expect(html).toContain("Bài mới trong phạm vi");
expect(html).toContain("Ôn tập trong phạm vi");
expect(html).toContain("Khối lượng trong phạm vi");
expect(html).toContain(
  `Trong 2 tuần: ${expected.horizonScheduledLessons}/${expected.totalRemainingLessons} bài được xếp.`,
);
```

Remove assertions that require the old unscoped tile labels:

```text
Bài còn lại
Bài mới
Ôn tập
Tổng khối lượng
Mốc học hết bài mới theo lịch hiện tại
```

Do not remove the capacity, confidence, selected-horizon, or Sunday-seven-day assertions.

Extend the planned-workload runtime test so it compares rendered scoped values with `selectForecastViewModel({ horizonWeeks: 2 })` instead of assuming the global workload tile is the user-facing value.

Add/adjust the all-fit test to require neutral contextual copy:

```text
Trong 2 tuần: X/Y bài được xếp.
Toàn bộ bài còn lại đã được biểu diễn trong phạm vi đang xem.
```

Add one runtime test for a fixed lesson that cannot fit capacity and require distinct copy containing:

```text
bài cố định nằm trong phạm vi nhưng chưa xếp được
```

- [ ] **Step 2: Commit the Task 2 test-only RED**

Commit only `src/lib/forecast-card-runtime.test.ts` changes. Expected behavioral RED: selector fields exist from Task 1, but rendered HTML still contains the old labels/global workload fields.

- [ ] **Step 3: Change ForecastCard metrics to the horizon fields**

In `ForecastCard.tsx` change only the Forecast summary semantics/copy.

Completion tile:

```tsx
<div> Mốc học hết toàn bộ bài mới </div>
```

Lesson tile:

```tsx
<div>Bài trong phạm vi</div>
<div>{vm.horizonScheduledLessons} / {vm.totalRemainingLessons} bài</div>
```

New workload tile:

```tsx
<div>Bài mới trong phạm vi</div>
<div>{formatHours(vm.horizonNewHours)} giờ</div>
```

Review tile:

```tsx
<div>Ôn tập trong phạm vi</div>
<div>{formatHours(vm.horizonReviewHours)} giờ</div>
```

Total tile:

```tsx
<div>Khối lượng trong phạm vi</div>
<div>{formatHours(vm.horizonWorkloadHours)} giờ</div>
```

Do not change the capacity, horizon, confidence, or per-subject progress tiles.

- [ ] **Step 4: Make outside-horizon feedback explain what the selector changed**

Replace the current `outsideHorizonText` with deterministic scoped/total context:

```ts
const horizonPlacementText = `Trong ${vm.horizonWeeks} tuần: ${vm.horizonScheduledLessons}/${vm.totalRemainingLessons} bài được xếp.`;
const outsideHorizonText =
  vm.outsideHorizonLessons > 0
    ? `${horizonPlacementText} Có ${vm.outsideHorizonLessons} bài chưa hoàn thành nằm ngoài phạm vi đang xem.`
    : `${horizonPlacementText} Toàn bộ bài còn lại đã được biểu diễn trong phạm vi đang xem.`;
const unplacedFixedText =
  vm.horizonUnplacedFixedLessons > 0
    ? ` Có ${vm.horizonUnplacedFixedLessons} bài cố định nằm trong phạm vi nhưng chưa xếp được theo công suất hiện tại.`
    : "";
```

Render `outsideHorizonText` followed by `unplacedFixedText` in the existing feedback card. Keep the visual treatment neutral/amber according to existing `outsideHorizonLessons` behavior; do not redesign the component.

- [ ] **Step 5: Obtain full Task 2 GREEN**

Natural GitHub Actions must pass the full repository gate on the exact Task 2 source/test head. Record exact head, run/job IDs, test counts, and merge ref. Freeze production/test code after this GREEN.

---

### Task 3: Evidence and independent acceptance

**Files:**
- Create: `docs/superpowers/evidence/2026-08-08-smart-planner-forecast-horizon-window-completion.md`

**Interfaces:**
- Consumes the final source/test head and natural GitHub Actions evidence from Tasks 1–2.
- Produces a docs-only audit capsule; no production/test edits are allowed after the source/test head is frozen unless Independent Review rejects it and a new RED→GREEN correction cycle is opened.

- [ ] **Step 1: Audit predecessor-to-source/test scope**

Compare exact predecessor:

```text
3444c5d54207ec16de90988958755da62507af11
```

to the final source/test head. Expected package paths only:

```text
docs/superpowers/specs/2026-08-08-smart-planner-forecast-horizon-window-design.md
docs/superpowers/plans/2026-08-08-smart-planner-forecast-horizon-window.md
src/lib/forecast-view-model.ts
src/lib/forecast-view-model.test.ts
src/lib/forecast-horizon-window-regression.test.ts
src/components/ForecastCard.tsx
src/lib/forecast-card-runtime.test.ts
```

No scheduler placement production file should change.

- [ ] **Step 2: Create the evidence capsule as exactly one docs-only commit after frozen source/test head**

Evidence must record:

- exact predecessor;
- branch and PR number;
- approved spec and plan paths;
- each valid behavioral RED and GREEN with exact head/run/job/merge-ref;
- discarded formatting/type-only runs separately if any;
- final test counts;
- proof that 2-week scoped metrics are smaller than whole-roadmap metrics on the 352/341 real-data-style fixture;
- proof that completion is invariant across 2/4/8/12 weeks;
- proof that review workload uses scheduled uncompleted review tasks;
- proof that completed pinned lessons and unplaced fixed lessons are excluded from scheduled horizon workload;
- predecessor-to-final source/test diff scope;
- final source/test head and evidence head distinction.

- [ ] **Step 3: Obtain exact evidence-head natural CI GREEN**

The evidence commit must be followed by natural PR CI on the exact evidence head. Full gate must pass.

- [ ] **Step 4: Fresh Independent Review**

Fresh-read the exact evidence head and verify at minimum:

```text
main still equals the exact predecessor
PR remains Draft/open/unmerged
no unresolved review threads
completion invariant across horizon choices
horizon lesson/workload values derive from visiblePlan
review scope excludes completed tasks
pinned completed lessons are excluded
unplaced fixed lessons are separate
ForecastCard uses horizon fields, not global workload fields
outside-horizon copy contains scoped/total context
CI is GREEN on exact evidence head
```

If any Important/Critical finding exists, post rejection and return to a new test-only RED cycle. Do not patch without RED.

If clean, post acceptance:

```text
FORECAST HORIZON WINDOW IMPLEMENTED / ACCEPTED / NOT_MERGED
```

Keep the PR Draft and unmerged until separate merge authorization.
