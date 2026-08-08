# Forecast Horizon Window Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Forecast 2/4/8/12-week selector scope displayed lesson/workload metrics to the selected window while keeping the canonical whole-roadmap completion milestone invariant.

**Architecture:** `buildFlexiblePlan()` remains the sole selected-window scheduler. `selectForecastCompletion()` remains the whole-roadmap compatibility/completion boundary. `selectForecastViewModel()` will summarize the already-built `visiblePlan` into explicit horizon fields; `ForecastCard` will render those fields.

**Tech Stack:** TypeScript, React, Vitest, ReactDOM server rendering, GitHub Actions.

## Global Constraints

- Exact predecessor: `main@3444c5d54207ec16de90988958755da62507af11`.
- Branch: `fix/forecast-horizon-window`.
- Horizon mapping remains `2|4|8|12` weeks => `14|28|56|84` calendar days.
- Existing global fields (`remainingLessons`, `totalNewHours`, `totalReviewHours`, `totalWorkloadHours`) keep their whole-roadmap semantics.
- Add explicit scoped fields: `totalRemainingLessons`, `horizonScheduledLessons`, `horizonNewHours`, `horizonReviewHours`, `horizonWorkloadHours`, `horizonUnplacedFixedLessons`.
- Completion is whole-roadmap and invariant across horizon changes for identical state.
- Scoped new work comes only from unique unfinished `visiblePlan[*].queue.newLessons`, using `plannedDurationMinutes`.
- Completed pinned lessons do not count as scoped new work.
- Scoped review work comes only from unique uncompleted `visiblePlan[*].queue.reviewLessons`, using scheduler-provided `minutes`; do not use global 35% review estimate.
- Unplaced fixed lessons are counted separately and never as scheduled workload.
- `horizonWorkloadHours = horizonNewHours + horizonReviewHours` under existing one-decimal rounding.
- Horizon state remains transient; no planner-setting mutation or persistence change.
- Sunday remains a normal default-capacity day.
- No scheduler placement, Roadmap, Flexible Schedule, persistence/schema, dependency, CI/deployment, Weekly Summary, or P2 changes.
- Natural GitHub Actions are RED/GREEN evidence.
- No amend/rebase/squash/force-push/history rewrite.

---

### Task 1: Horizon-scoped read model

**Files:**
- Create: `src/lib/forecast-horizon-window-regression.test.ts`
- Modify: `src/lib/forecast-view-model.test.ts`
- Modify: `src/lib/forecast-view-model.ts`

**Interfaces:**

```ts
type HorizonFields = {
  totalRemainingLessons: number;
  horizonScheduledLessons: number;
  horizonNewHours: number;
  horizonReviewHours: number;
  horizonWorkloadHours: number;
  horizonUnplacedFixedLessons: number;
};
```

- [ ] **Step 1: Write a behavioral RED contract that still typechecks before production fields exist**

In `src/lib/forecast-horizon-window-regression.test.ts`, import the module namespace and cast the selector through `unknown`, following the repo's current Forecast test pattern:

```ts
import * as forecastModule from "./forecast-view-model";

type HorizonViewModel = {
  remainingLessons: number;
  totalNewHours: number;
  outsideHorizonLessons: number;
  completion: unknown;
  totalRemainingLessons: number;
  horizonScheduledLessons: number;
  horizonNewHours: number;
  horizonReviewHours: number;
  horizonWorkloadHours: number;
  horizonUnplacedFixedLessons: number;
};

type Selector = (params: {
  subjects: Subject[];
  state: ProgressState;
  horizonWeeks: 2 | 4 | 8 | 12;
  fromISO?: string;
}) => HorizonViewModel;

const selectForecastViewModel = (
  forecastModule as unknown as { selectForecastViewModel: Selector }
).selectForecastViewModel;
```

This is required so RED is runtime behavior, not a TypeScript compile failure.

- [ ] **Step 2: Add core window RED cases**

Use deterministic helpers `makeSubjects()`, `makeState()` and fixed `fromISO = "2026-08-08"`.

```ts
const twoWeeks = selectForecastViewModel({ subjects, state, horizonWeeks: 2, fromISO });
const twelveWeeks = selectForecastViewModel({ subjects, state, horizonWeeks: 12, fromISO });

expect(twoWeeks.totalRemainingLessons).toBe(40);
expect(twoWeeks.horizonScheduledLessons).toBeLessThan(40);
expect(twelveWeeks.horizonScheduledLessons).toBeGreaterThanOrEqual(twoWeeks.horizonScheduledLessons);
expect(twelveWeeks.horizonNewHours).toBeGreaterThanOrEqual(twoWeeks.horizonNewHours);
expect(twelveWeeks.outsideHorizonLessons).toBeLessThanOrEqual(twoWeeks.outsideHorizonLessons);
expect(twelveWeeks.completion).toEqual(twoWeeks.completion);
```

Build the same 14-day `visiblePlan` in the test and compute exact unique unfinished scheduled IDs:

```ts
const scheduled = new Map<string, number>();
for (const day of visiblePlan) {
  for (const lesson of day.queue.newLessons) {
    if (!state.completedLessons[lesson.id]) {
      scheduled.set(lesson.id, lesson.plannedDurationMinutes);
    }
  }
}
const expectedMinutes = [...scheduled.values()].reduce((sum, value) => sum + value, 0);
expect(twoWeeks.horizonScheduledLessons).toBe(scheduled.size);
expect(twoWeeks.horizonNewHours).toBe(Math.round((expectedMinutes / 60) * 10) / 10);
```

- [ ] **Step 3: Add real-roadmap RED**

Reproduce the existing 352-lesson distribution (`345×120`, `6×90`, `1×30`) and complete the first 11 120-minute lessons. Assert:

```ts
expect(twoWeeks.totalRemainingLessons).toBe(341);
expect(twoWeeks.remainingLessons).toBe(341);
expect(twoWeeks.totalNewHours).toBe(677.5);
expect(twoWeeks.horizonScheduledLessons).toBeLessThan(341);
expect(twoWeeks.horizonNewHours).toBeLessThan(677.5);
```

Also compare 2 weeks with 12 weeks and assert completion equality.

- [ ] **Step 4: Add edge RED cases**

Pinned completion: complete one lesson exactly on `fromISO`; verify it may appear in the scheduler plan but does not inflate scoped count/workload.

Review scope: complete one lesson on `2026-08-07`; with `fromISO = 2026-08-08`, the age-1 review is 15 minutes:

```ts
expect(result.horizonReviewHours).toBe(0.3);
```

Then set:

```ts
state.reviewCompletions[`review:${lessonId}:2026-08-08`] = "2026-08-08";
```

and expect `horizonReviewHours === 0`.

Unplaced fixed: one `fixed` 180-minute lesson with 1-hour capacity:

```ts
expect(result.horizonUnplacedFixedLessons).toBe(1);
expect(result.horizonScheduledLessons).toBe(0);
expect(result.horizonNewHours).toBe(0);
expect(result.horizonWorkloadHours).toBe(
  Math.round((result.horizonNewHours + result.horizonReviewHours) * 10) / 10,
);
```

- [ ] **Step 5: Extend the existing test-local Forecast ViewModel contract**

Add the six horizon fields to the local `ViewModel` type in `forecast-view-model.test.ts`. Because that file already casts the module through a local selector contract, this remains behavioral RED. Extend its current horizon monotonicity test with horizon count/new-hours monotonicity and `completion` equality.

Do not alter existing whole-roadmap assertions (`341`, `677.5h`).

- [ ] **Step 6: Commit test-only RED and obtain natural CI**

No production file changes. Valid RED requires typecheck/lint PASS and test failures caused by missing/undefined horizon behavior. Formatting/type-only failures do not count.

- [ ] **Step 7: Implement the minimal pure horizon summarizer**

In `forecast-view-model.ts`, extend `ForecastViewModel` with the six fields and add:

```ts
function summarizeForecastHorizon(params: {
  visiblePlan: ReturnType<typeof buildFlexiblePlan>;
  completedLessons: Record<string, string>;
}) {
  const scheduled = new Map<string, number>();
  const unplacedFixed = new Set<string>();
  const reviews = new Map<string, number>();

  for (const day of params.visiblePlan) {
    for (const lesson of day.queue.newLessons) {
      if (params.completedLessons[lesson.id]) continue;
      if (!scheduled.has(lesson.id)) scheduled.set(lesson.id, lesson.plannedDurationMinutes);
    }
    for (const lesson of day.queue.unplacedFixedLessons) {
      if (!params.completedLessons[lesson.id]) unplacedFixed.add(lesson.id);
    }
    for (const review of day.queue.reviewLessons) {
      if (!review.completed && !reviews.has(review.taskId)) {
        reviews.set(review.taskId, review.minutes);
      }
    }
  }

  return {
    scheduledLessons: scheduled.size,
    newMinutes: [...scheduled.values()].reduce((sum, value) => sum + value, 0),
    reviewMinutes: [...reviews.values()].reduce((sum, value) => sum + value, 0),
    unplacedFixedLessons: unplacedFixed.size,
  };
}
```

- [ ] **Step 8: Assemble scoped fields from the already-built visible plan**

After `visiblePlan` and `visibility`:

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
horizonWorkloadHours: Math.round((horizonNewHours + horizonReviewHours) * 10) / 10,
horizonUnplacedFixedLessons: horizon.unplacedFixedLessons,
```

Keep `...base` unchanged; completion is not recomputed from horizon.

- [ ] **Step 9: Obtain full Task 1 GREEN**

Natural exact-head CI must PASS typecheck/lint/tests/build/clean-tree. Record exact head/run/job/test counts/merge ref.

---

### Task 2: Horizon-aware ForecastCard

**Files:**
- Modify: `src/lib/forecast-card-runtime.test.ts`
- Modify: `src/components/ForecastCard.tsx`

- [ ] **Step 1: Write runtime RED before JSX changes**

Require:

```ts
expect(html).toContain("Mốc học hết toàn bộ bài mới");
expect(html).toContain("Bài trong phạm vi");
expect(html).toContain(`${expected.horizonScheduledLessons} / ${expected.totalRemainingLessons} bài`);
expect(html).toContain("Bài mới trong phạm vi");
expect(html).toContain("Ôn tập trong phạm vi");
expect(html).toContain("Khối lượng trong phạm vi");
expect(html).toContain(
  `Trong 2 tuần: ${expected.horizonScheduledLessons}/${expected.totalRemainingLessons} bài được xếp.`,
);
```

Keep capacity/confidence/Sunday assertions. Update the all-fit test to require:

```text
Toàn bộ bài còn lại đã được biểu diễn trong phạm vi đang xem.
```

Add a fixed-over-capacity fixture requiring copy containing:

```text
bài cố định nằm trong phạm vi nhưng chưa xếp được
```

- [ ] **Step 2: Commit runtime test-only RED**

Selector is already GREEN from Task 1; expected failures are old ForecastCard copy/global metric rendering only.

- [ ] **Step 3: Migrate the five summary tiles**

Use exactly:

```tsx
Mốc học hết toàn bộ bài mới
Bài trong phạm vi -> {vm.horizonScheduledLessons} / {vm.totalRemainingLessons} bài
Bài mới trong phạm vi -> formatHours(vm.horizonNewHours)
Ôn tập trong phạm vi -> formatHours(vm.horizonReviewHours)
Khối lượng trong phạm vi -> formatHours(vm.horizonWorkloadHours)
```

Keep capacity, horizon, confidence, subject progress, and `shiftedDates` compatibility behavior unchanged.

- [ ] **Step 4: Replace feedback copy with scoped/total context**

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

Render both messages in the existing feedback card. No visual redesign.

- [ ] **Step 5: Obtain full Task 2 GREEN and freeze source/test head**

Natural CI must PASS the full gate. Record exact evidence values. No production/test changes after this head unless Independent Review rejects it.

---

### Task 3: Evidence and Independent Review

**Files:**
- Create: `docs/superpowers/evidence/2026-08-08-smart-planner-forecast-horizon-window-completion.md`

- [ ] **Step 1: Scope audit**

Predecessor-to-source/test diff may contain only the approved spec/plan and these implementation paths:

```text
src/lib/forecast-view-model.ts
src/lib/forecast-view-model.test.ts
src/lib/forecast-horizon-window-regression.test.ts
src/components/ForecastCard.tsx
src/lib/forecast-card-runtime.test.ts
```

No scheduler placement production file may change.

- [ ] **Step 2: Create one docs-only evidence commit after frozen source/test head**

Record exact predecessor, PR, valid RED/GREEN heads/runs/jobs/merge refs/test counts, real-roadmap scoped-vs-global proof, horizon-invariant completion proof, review/pinned/unplaced proof, and source/test-vs-evidence head distinction.

- [ ] **Step 3: Obtain natural exact evidence-head CI GREEN**

Full gate: typecheck/lint/tests/build/clean-tree.

- [ ] **Step 4: Fresh Independent Review**

Verify `main` still equals predecessor, PR Draft/open/unmerged, no unresolved threads, scoped metrics derive from `visiblePlan`, completion is horizon-invariant, review completion filtering works, pinned completed lessons are excluded, unplaced fixed lessons are separate, ForecastCard no longer presents global workload as selected-window workload, and exact evidence-head CI is GREEN.

If any Important/Critical finding exists: reject and open a new test-only RED correction cycle.

If clean, post:

```text
FORECAST HORIZON WINDOW IMPLEMENTED / ACCEPTED / NOT_MERGED
```

Keep PR Draft/unmerged until separate merge authorization.
