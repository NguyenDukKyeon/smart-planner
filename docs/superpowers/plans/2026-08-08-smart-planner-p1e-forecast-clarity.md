# Smart Planner P1E — Forecast Clarity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Forecast truthfully separate completion prediction, new/review workload, capacity assumption, confidence, and unfinished work outside a bounded user-selected Forecast horizon.

**Architecture:** Add one pure `selectForecastViewModel()` module that composes existing `forecast()`, `buildFlexiblePlan()`, and `summarizeUnscheduledWork()` outputs. Keep Forecast horizon state transient inside `ForecastCard`; do not hoist P1B state or modify persistence/scheduler semantics. Production changes are limited to the Forecast card plus the new selector unless a valid RED test proves `planner.forecast()` itself violates the approved spec.

**Tech Stack:** React 19, TypeScript, Vitest, ReactDOM server rendering, TanStack application shell, existing planner/schedule helpers, Tailwind/Radix primitives.

## Global Constraints

- Exact predecessor: `main@b981b8250adef717c1e9c9f4259a265316327b9a`.
- Working branch: `improve/p1e-forecast-clarity`.
- Design authority: `docs/superpowers/specs/2026-08-08-smart-planner-p1e-forecast-clarity-design.md` at commit `7a0e4d3d34ab00a708245cbce6d0b1f98f6d3708`.
- Forecast horizon options are exactly `2 | 4 | 8 | 12` weeks, represented as rolling `14 | 28 | 56 | 84` days from `fromISO` inclusive of the first day in the `buildFlexiblePlan()` request count.
- Default Forecast horizon is `2` weeks / `14` days.
- Forecast horizon is transient component state; no browser-storage or URL-schema field is added.
- `forecast()` remains authoritative for completion date/range unless a valid focused RED proves a defect against this plan.
- `buildFlexiblePlan()` + `summarizeUnscheduledWork()` remain authoritative for outside-horizon accounting.
- `latestShiftedDate` must not override Forecast completion prediction.
- Existing `normalizeDailyStudyHours()` and `onSetDefaultDailyHours()` remain the only Forecast-hours normalization/mutation path.
- No new dependency, package/lockfile change, workflow change, deployment change, persistence-schema change, transaction change, Roadmap change, Course Manager change, or Flexible Planner state hoist.
- Use forward-only commits. Do not amend, rebase, squash, force-push, or rewrite published history.
- Keep the PR Draft and unmerged through implementation and independent review.

---

## File Structure

### Production

- Create `src/lib/forecast-view-model.ts` — pure Forecast presentation selector; owns horizon-plan composition, workload aggregation, completion-state classification, and visibility summary.
- Modify `src/components/ForecastCard.tsx` — owns transient horizon selection, formatting, existing daily-hours input, and rendering only.

### Tests

- Create `src/lib/forecast-clarity-regression.test.ts` — first RED contract proving shifted schedule data cannot replace Forecast completion semantics.
- Create `src/lib/forecast-view-model.test.ts` — pure selector behavior, horizon, workload, completion-state, and deterministic-date coverage.
- Create `src/lib/forecast-card-runtime.test.ts` — actual production component runtime/static-render coverage for the user-visible Forecast contract.

### Evidence

- Create `docs/superpowers/evidence/2026-08-08-smart-planner-p1e-forecast-clarity-completion.md` only after exact-head GREEN verification.

`src/lib/planner.ts` is excluded unless a focused RED proves a specific approved Forecast calculation defect before any edit to that file.

---

### Task 1: Establish the Forecast-completion RED and introduce the read-model boundary

**Files:**
- Create: `src/lib/forecast-clarity-regression.test.ts`
- Create: `src/lib/forecast-view-model.ts`
- Modify: `src/components/ForecastCard.tsx`

**Interfaces:**
- Consumes: existing `forecast()`, `allRemainingLessonIds()`, `normalizeDailyStudyHours()`, `Subject`, and `ProgressState`.
- Produces initially:

```ts
export type ForecastCompletion =
  | { kind: "complete" }
  | { kind: "no-capacity" }
  | { kind: "date"; startISO: string; endISO: string }
  | { kind: "range"; startISO: string; endISO: string };

export function selectForecastCompletion(params: {
  subjects: Subject[];
  state: ProgressState;
  fromISO?: string;
}): {
  completion: ForecastCompletion;
  remainingLessons: number;
  hoursPerDay: number;
  totalNewHours: number;
  totalReviewHours: number;
  totalWorkloadHours: number;
  meanMinutes: number;
  confidence: "insufficient" | "low" | "medium" | "high";
  basis: "planned" | "mixed" | "actual";
};
```

- [ ] **Step 1: Write the first failing regression against current `ForecastCard` behavior**

Create `src/lib/forecast-clarity-regression.test.ts` with an actual production render. Use existing React/ReactDOM only.

```ts
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ForecastCard } from "@/components/ForecastCard";
import { createInitialProgressState } from "./progress-store";
import type { Subject } from "./mock-data";

const SUBJECTS: Subject[] = [
  {
    id: "math",
    name: "Toán",
    emoji: "📐",
    milestones: [
      {
        id: "m1",
        title: "Chủ đề 1",
        subtitle: "",
        lessons: [
          {
            id: "l1",
            title: "Bài 1",
            xp: 10,
            plannedDurationMinutes: 60,
            scheduledDate: "2026-08-08",
            scheduleMode: "flexible",
            weekday: "T7",
            sourceSubject: "Toán",
            week: 1,
            initialDone: false,
          },
        ],
      },
    ],
  },
];

describe("Forecast clarity regression", () => {
  it("does not let shifted schedule dates replace the forecast completion estimate", () => {
    const state = createInitialProgressState(false);
    state.plannerSettings.defaultDailyHours = 2;

    const html = renderToStaticMarkup(
      createElement(ForecastCard, {
        state,
        subjects: SUBJECTS,
        shiftedDates: { l1: "2035-12-31" },
      }),
    );

    expect(html).not.toContain("31/12/2035");
  });
});
```

If `displayDate()` produces a different localized literal in the runtime, use that helper in the test rather than hard-coding formatting; the semantic assertion remains that the far-future shifted date is absent.

- [ ] **Step 2: Create the Draft PR before running RED**

Create a Draft PR from `improve/p1e-forecast-clarity` to `main`. The body must bind:

```text
Exact predecessor: b981b8250adef717c1e9c9f4259a265316327b9a
Design commit: 7a0e4d3d34ab00a708245cbce6d0b1f98f6d3708
Plan commit: <current plan commit>
Status: P1E IMPLEMENTING / NOT_ACCEPTED / NOT_MERGED
```

Keep it Draft throughout implementation.

- [ ] **Step 3: Commit only the RED test**

```bash
git add src/lib/forecast-clarity-regression.test.ts
git commit -m "test: require forecast completion independent of shifted schedule"
```

- [ ] **Step 4: Verify natural RED**

Use the natural `pull_request / synchronize` GitHub Actions run. Valid RED requires:

- install/typecheck/lint reach the test gate successfully;
- the existing suite remains green;
- the new regression fails specifically because the predecessor renders the shifted far-future date as Forecast completion;
- no unrelated failure is accepted as RED.

Record exact RED head, run ID, job ID, checked merge ref, and sole expected failure.

- [ ] **Step 5: Implement the smallest read-model completion boundary**

Create `src/lib/forecast-view-model.ts` with `selectForecastCompletion()`.

Implementation rules:

```ts
const hoursPerDay = Number.isFinite(state.plannerSettings.defaultDailyHours)
  ? normalizeDailyStudyHours(state.plannerSettings.defaultDailyHours)
  : 2;

const remainingLessonIds = allRemainingLessonIds(subjects, state.completedLessons);
const result = forecast({
  remainingLessonIds,
  meta: state.studyMeta,
  subjects,
  hoursPerDay,
  fromISO,
});
```

Classify completion exactly:

```ts
if (result.remaining === 0) completion = { kind: "complete" };
else if (hoursPerDay <= 0) completion = { kind: "no-capacity" };
else if (result.earliestEndDateISO === result.latestEndDateISO) {
  completion = {
    kind: "date",
    startISO: result.endDateISO,
    endISO: result.endDateISO,
  };
} else {
  completion = {
    kind: "range",
    startISO: result.earliestEndDateISO,
    endISO: result.latestEndDateISO,
  };
}
```

Return `totalWorkloadHours` rounded to one decimal from `result.totalNewHours + result.totalReviewHours`.

Modify `ForecastCard.tsx` so its completion text uses only this selector. Remove all `latestShiftedDate` calculation and do not read `shiftedDates` to form completion text. Preserve the prop temporarily only if needed to avoid a route-scope edit; an unused optional prop may be removed only if the route already compiles without changes.

- [ ] **Step 6: Verify focused GREEN**

Natural GitHub Actions must show the new regression passing and no new failures. Do not call this package-complete yet.

- [ ] **Step 7: Commit the Task 1 production change**

```bash
git add src/lib/forecast-view-model.ts src/components/ForecastCard.tsx
git commit -m "feat: separate forecast completion from schedule projection"
```

---

### Task 2: Add pure horizon visibility and workload semantics

**Files:**
- Create: `src/lib/forecast-view-model.test.ts`
- Modify: `src/lib/forecast-view-model.ts`

**Interfaces:**
- Consumes: Task 1 `selectForecastCompletion()` behavior, `buildFlexiblePlan()`, `summarizeUnscheduledWork()`, `addDaysISO()`.
- Produces final public interface:

```ts
export type ForecastHorizonWeeks = 2 | 4 | 8 | 12;

export type ForecastViewModel = {
  hoursPerDay: number;
  horizonWeeks: ForecastHorizonWeeks;
  horizonDays: 14 | 28 | 56 | 84;
  horizonEndISO: string;
  remainingLessons: number;
  visibleScheduledLessons: number;
  outsideHorizonLessons: number;
  totalNewHours: number;
  totalReviewHours: number;
  totalWorkloadHours: number;
  meanMinutes: number;
  confidence: "insufficient" | "low" | "medium" | "high";
  basis: "planned" | "mixed" | "actual";
  completion: ForecastCompletion;
};

export function selectForecastViewModel(params: {
  subjects: Subject[];
  state: ProgressState;
  horizonWeeks: ForecastHorizonWeeks;
  fromISO?: string;
}): ForecastViewModel;
```

- [ ] **Step 1: Write pure failing tests for horizon semantics**

Use a fixture helper that creates flexible lessons with deterministic IDs and dates. Start from `createInitialProgressState(false)` and set planner values directly inside the test object.

Required tests:

```ts
it("maps 2/4/8/12 weeks to 14/28/56/84 rolling days", ...)
it("counts unfinished lessons outside the selected horizon from the real flexible plan", ...)
it("reports zero outside-horizon work when all unfinished lessons fit", ...)
it("keeps new-learning, review, and total workload internally consistent", ...)
it("distinguishes complete from zero-capacity completion", ...)
it("is deterministic when fromISO is supplied", ...)
```

The outside-horizon fixture must contain enough 60-minute flexible lessons and a deliberately small daily capacity that a 14-day horizon cannot place all lessons, while a longer horizon can place more. Assertions should compare counts rather than source strings.

- [ ] **Step 2: Commit only the Task 2 tests**

```bash
git add src/lib/forecast-view-model.test.ts
git commit -m "test: define forecast horizon visibility semantics"
```

- [ ] **Step 3: Verify valid RED**

The natural PR run must fail only because the current selector lacks the horizon/view-model fields or produces incorrect horizon counts. Existing tests must remain green.

- [ ] **Step 4: Implement the final pure selector**

In `src/lib/forecast-view-model.ts`:

```ts
const HORIZON_DAYS: Record<ForecastHorizonWeeks, 14 | 28 | 56 | 84> = {
  2: 14,
  4: 28,
  8: 56,
  12: 84,
};
```

Build the visible plan with exactly:

```ts
const visiblePlan = buildFlexiblePlan({
  subjects,
  completed: state.completedLessons,
  reviewCompletions: state.reviewCompletions,
  meta: state.studyMeta,
  settings: state.plannerSettings,
  fromISO,
  horizonDays,
});
```

Then derive:

```ts
const visibility = summarizeUnscheduledWork({
  subjects,
  completed: state.completedLessons,
  visiblePlan,
});
```

Set:

```ts
horizonEndISO = addDaysISO(fromISO ?? todayISO(), horizonDays - 1);
visibleScheduledLessons = visibility.visibleScheduledCount;
outsideHorizonLessons = visibility.outsideHorizonCount;
```

Do not duplicate lesson-scanning or capacity rules already owned by these helpers.

- [ ] **Step 5: Verify Task 2 GREEN**

Require the pure selector suite plus the Task 1 regression to pass in the natural GitHub Actions run.

- [ ] **Step 6: Commit Task 2 implementation**

```bash
git add src/lib/forecast-view-model.ts
git commit -m "feat: derive forecast horizon visibility"
```

---

### Task 3: Render the full Forecast clarity contract

**Files:**
- Create: `src/lib/forecast-card-runtime.test.ts`
- Modify: `src/components/ForecastCard.tsx`

**Interfaces:**
- Consumes: `selectForecastViewModel()` and `ForecastHorizonWeeks` from Task 2.
- Produces: user-visible Forecast horizon control and explicit clarity metrics without new persistence.

- [ ] **Step 1: Write the runtime RED test against actual `ForecastCard`**

Use `renderToStaticMarkup(createElement(ForecastCard, ...))` with existing dependencies. The fixture must produce at least one outside-horizon lesson at the 2-week default.

Assert user-visible semantics, not implementation strings:

```ts
expect(html).toContain("Bài mới");
expect(html).toContain("Ôn tập");
expect(html).toContain("Tổng khối lượng");
expect(html).toContain("Quỹ giờ giả định");
expect(html).toContain("Phạm vi đang xem");
expect(html).toContain("2 tuần");
expect(html).toContain("Ngoài phạm vi");
expect(html).toContain("Mức tin cậy");
```

Also assert the exact expected outside-horizon count from `selectForecastViewModel()` appears in the rendered explanation.

- [ ] **Step 2: Commit only the runtime RED test**

```bash
git add src/lib/forecast-card-runtime.test.ts
git commit -m "test: require user-visible forecast clarity metrics"
```

- [ ] **Step 3: Verify valid RED**

The natural PR run must reach tests and fail the new runtime test because the current component lacks the full clarity presentation/horizon control. Do not accept formatting/lint failure as RED.

- [ ] **Step 4: Implement transient Forecast horizon UI**

In `ForecastCard.tsx`:

```ts
const [horizonWeeks, setHorizonWeeks] = useState<ForecastHorizonWeeks>(2);
const vm = useMemo(
  () => selectForecastViewModel({ subjects, state, horizonWeeks }),
  [subjects, state, horizonWeeks],
);
```

Render an accessible bounded control using an existing native/select pattern. Options must be exactly:

```text
2 tuần
4 tuần
8 tuần
12 tuần
```

The horizon change handler only calls `setHorizonWeeks`; it must not call `onSetDefaultDailyHours` or any persistence function.

- [ ] **Step 5: Replace ad-hoc Forecast calculations with read-model fields**

Render the existing completion card from `vm.completion`:

```ts
complete -> "Đã hoàn thành tất cả! 🎉"
no-capacity -> "Chưa có quỹ giờ để dự báo"
date -> displayDate(vm.completion.startISO)
range -> `${displayDate(startISO)} – ${displayDate(endISO)}`
```

Render separate metrics:

```text
Bài mới: <totalNewHours> giờ
Ôn tập: <totalReviewHours> giờ
Tổng khối lượng: <totalWorkloadHours> giờ
Quỹ giờ giả định: <hoursPerDay> giờ/ngày
Phạm vi đang xem: <horizonWeeks> tuần
```

Visibility copy:

```ts
vm.outsideHorizonLessons > 0
  ? `Có ${vm.outsideHorizonLessons} bài chưa hoàn thành nằm ngoài phạm vi ${vm.horizonWeeks} tuần đang xem.`
  : `Tất cả bài chưa hoàn thành đều nằm trong phạm vi ${vm.horizonWeeks} tuần đang xem.`
```

Keep confidence and basis labels explicit. Preserve existing per-subject progress unless layout pressure requires only local rearrangement; do not remove the capability.

- [ ] **Step 6: Verify runtime GREEN**

Natural GitHub Actions must show:

- Task 1 regression PASS;
- pure selector suite PASS;
- Forecast runtime suite PASS;
- no unrelated regressions.

- [ ] **Step 7: Commit Task 3 implementation**

```bash
git add src/components/ForecastCard.tsx
git commit -m "feat: clarify forecast workload and horizon"
```

---

### Task 4: Exact-scope audit, full verification, and completion evidence

**Files:**
- Create: `docs/superpowers/evidence/2026-08-08-smart-planner-p1e-forecast-clarity-completion.md`
- Read/verify all files changed since predecessor.

**Interfaces:**
- Consumes: Tasks 1–3 exact commits and GitHub Actions evidence.
- Produces: one independently auditable completion record; no production behavior.

- [ ] **Step 1: Compare exact predecessor to candidate source/test head**

Use GitHub compare:

```text
base = b981b8250adef717c1e9c9f4259a265316327b9a
head = <candidate source/test head>
```

Expected changed paths are limited to:

```text
docs/superpowers/specs/2026-08-08-smart-planner-p1e-forecast-clarity-design.md
docs/superpowers/plans/2026-08-08-smart-planner-p1e-forecast-clarity.md
src/components/ForecastCard.tsx
src/lib/forecast-view-model.ts
src/lib/forecast-clarity-regression.test.ts
src/lib/forecast-view-model.test.ts
src/lib/forecast-card-runtime.test.ts
```

If any other path changed, classify it before proceeding; do not silently broaden scope.

- [ ] **Step 2: Verify exact-head full natural CI**

Fresh-read the exact workflow job logs/steps. Require:

```text
npm install: PASS
npm run typecheck: PASS
npm run lint: PASS
npm test: PASS
npm run build: PASS
git diff --exit-code: PASS
job conclusion: SUCCESS
```

Record exact run ID, job ID, checked PR merge ref, test file/test counts, and known pre-existing warnings separately.

- [ ] **Step 3: Re-read all 20 design acceptance criteria**

For each criterion, bind it to one of:

- exact source location;
- focused test evidence;
- natural CI evidence;
- exact changed-file scope evidence.

Do not mark criteria PASS from implementer assertion alone.

- [ ] **Step 4: Write completion evidence**

The evidence document must contain:

```text
Status: P1E IMPLEMENTED / REVIEW_PENDING / NOT_ACCEPTED / NOT_MERGED
Exact predecessor
Design commit
Plan commit
Valid RED head/run/job
Task GREEN checkpoints
Literal final source/test head
Exact changed-file list
Full final CI run/job/merge-ref
Acceptance-criteria matrix 1–20
Known nonblocking repository observations
Independent reviewer instructions
```

Do not state `ACCEPTED`.

- [ ] **Step 5: Commit evidence only**

```bash
git add docs/superpowers/evidence/2026-08-08-smart-planner-p1e-forecast-clarity-completion.md
git commit -m "docs: add P1E forecast clarity completion evidence"
```

- [ ] **Step 6: Verify evidence-head CI and topology**

Require the evidence head to be exactly one docs-only commit after the literal final source/test head, and require its natural PR CI to pass the same full gate.

- [ ] **Step 7: Update Draft PR body for independent review**

Set status to:

```text
P1E IMPLEMENTED / REVIEW_PENDING / NOT_ACCEPTED / NOT_MERGED
```

Bind exact predecessor, design, plan, RED, source/test GREEN, evidence head, CI runs/jobs, and changed-file scope. Explicitly instruct the Independent Reviewer to return exactly one of:

```text
P1E IMPLEMENTED / ACCEPTED / NOT_MERGED
P1E IMPLEMENTED / REJECTED / NOT_MERGED
```

Do not mark the PR ready and do not merge.

---

## Independent Review Checklist

The reviewer must fresh-read the exact PR head and independently verify:

1. exact predecessor is still `b981b8250adef717c1e9c9f4259a265316327b9a`;
2. no base drift invalidated the candidate;
3. Forecast completion no longer consumes `latestShiftedDate` as prediction output;
4. `selectForecastViewModel()` composes existing authoritative helpers instead of duplicating scheduler rules;
5. 2/4/8/12 weeks map exactly to 14/28/56/84 rolling days;
6. outside-horizon count comes from real `buildFlexiblePlan()` + `summarizeUnscheduledWork()` behavior;
7. horizon selection is transient and does not call persistence;
8. daily-hours changes still use the existing normalization/persistence callback;
9. zero-capacity and complete states are distinct;
10. workload categories and total are truthful;
11. runtime test renders actual production `ForecastCard`;
12. no new dependency/schema/workflow/deployment or adjacent P2 work exists;
13. valid RED was observed before production implementation;
14. exact-head full CI is GREEN;
15. all 20 design criteria are satisfied with no unresolved Critical/Important finding.

Merge remains a separate authorization after acceptance.
