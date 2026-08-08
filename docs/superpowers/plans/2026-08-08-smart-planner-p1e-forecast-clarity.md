# Smart Planner P1E — Forecast Clarity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Forecast truthfully separate completion prediction, new/review workload, capacity assumption, confidence, and unfinished work outside a bounded user-selected Forecast horizon.

**Architecture:** Add one pure `selectForecastViewModel()` module that composes existing `forecast()`, `buildFlexiblePlan()`, and `summarizeUnscheduledWork()` outputs. Keep Forecast horizon state transient inside `ForecastCard`; do not hoist P1B state or modify persistence/scheduler semantics. Production changes are limited to the Forecast card plus the new selector unless a valid RED test proves `planner.forecast()` itself violates the approved spec.

**Tech Stack:** React 19, TypeScript, Vitest, ReactDOM server rendering, existing planner/schedule helpers, Tailwind/Radix primitives.

## Global Constraints

- Exact predecessor: `main@b981b8250adef717c1e9c9f4259a265316327b9a`.
- Working branch: `improve/p1e-forecast-clarity`.
- Design authority: `docs/superpowers/specs/2026-08-08-smart-planner-p1e-forecast-clarity-design.md` at `7a0e4d3d34ab00a708245cbce6d0b1f98f6d3708`.
- This plan's final self-review correction commit is the implementation-plan authority and must be bound verbatim in the Draft PR body before the first RED commit.
- Forecast horizon options are exactly `2 | 4 | 8 | 12` weeks, represented as rolling `14 | 28 | 56 | 84` days.
- Default Forecast horizon is 2 weeks / 14 days.
- Forecast horizon is transient component state; no storage or URL-schema field is added.
- `forecast()` remains authoritative for completion date/range unless a valid focused RED proves a defect against this plan.
- `buildFlexiblePlan()` plus `summarizeUnscheduledWork()` remain authoritative for outside-horizon accounting.
- `latestShiftedDate` must not override Forecast completion prediction.
- `normalizeDailyStudyHours()` and `onSetDefaultDailyHours()` remain the Forecast-hours normalization/mutation boundary.
- No new dependency, package/lockfile change, workflow change, deployment change, persistence-schema change, transaction change, Roadmap change, Course Manager change, or Flexible Planner state hoist.
- Use forward-only commits; do not amend, rebase, squash, force-push, or rewrite published history.
- Keep the PR Draft and unmerged through implementation and independent review.

---

## File Structure

### Production

- Create `src/lib/forecast-view-model.ts` — pure Forecast selector for completion classification, workload aggregation, horizon plan, and outside-horizon visibility.
- Modify `src/components/ForecastCard.tsx` — transient horizon state, formatting, existing daily-hours input, and rendering.

### Tests

- Create `src/lib/forecast-clarity-regression.test.ts` — first RED proving shifted schedule data cannot replace Forecast completion semantics.
- Create `src/lib/forecast-view-model.test.ts` — pure selector behavior and horizon coverage.
- Create `src/lib/forecast-card-runtime.test.ts` — actual production component runtime/static-render coverage.

### Evidence

- Create `docs/superpowers/evidence/2026-08-08-smart-planner-p1e-forecast-clarity-completion.md` only after exact-head GREEN verification.

`src/lib/planner.ts` is excluded unless a focused RED proves a specific approved calculation defect before any edit to that file.

---

### Task 1: RED — Forecast completion must ignore shifted schedule dates

**Files:**
- Create: `src/lib/forecast-clarity-regression.test.ts`
- Later create: `src/lib/forecast-view-model.ts`
- Later modify: `src/components/ForecastCard.tsx`

**Interfaces:**
- Consumes: existing `forecast()`, `allRemainingLessonIds()`, `normalizeDailyStudyHours()`, `Subject`, `ProgressState`.
- Produces: `ForecastCompletion` plus completion/workload selector data used by Task 2.

- [ ] **Step 1: Create the Draft PR before the RED commit**

Create a Draft PR from `improve/p1e-forecast-clarity` to `main`. Bind exact predecessor, design commit, and the exact commit SHA produced by this no-placeholder plan revision. Set status:

```text
P1E IMPLEMENTING / NOT_ACCEPTED / NOT_MERGED
```

- [ ] **Step 2: Write the first failing runtime regression**

Create `src/lib/forecast-clarity-regression.test.ts`:

```ts
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ForecastCard } from "@/components/ForecastCard";
import { createInitialProgressState } from "./progress-store";
import { displayDate } from "./date-utils";
import type { Subject } from "./mock-data";

const subjects: Subject[] = [
  {
    id: "math",
    name: "Toán",
    emoji: "📐",
    milestones: [
      {
        id: "topic-1",
        title: "Chủ đề 1",
        subtitle: "",
        lessons: [
          {
            id: "lesson-1",
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
  it("does not let a shifted schedule date replace Forecast completion", () => {
    const state = createInitialProgressState(false);
    state.plannerSettings.defaultDailyHours = 2;
    const shiftedDate = "2035-12-31";

    const html = renderToStaticMarkup(
      createElement(ForecastCard, {
        state,
        subjects,
        shiftedDates: { "lesson-1": shiftedDate },
      }),
    );

    expect(html).not.toContain(displayDate(shiftedDate));
  });
});
```

- [ ] **Step 3: Commit only the RED test**

```bash
git add src/lib/forecast-clarity-regression.test.ts
git commit -m "test: require forecast completion independent of shifted schedule"
```

- [ ] **Step 4: Verify natural RED**

Use the natural `pull_request / synchronize` GitHub Actions run. Valid RED requires install, typecheck, and lint to reach the test gate; existing tests remain green; the new regression fails because predecessor Forecast renders the far-future shifted date. Record exact RED head, run ID, job ID, checked merge ref, and failure.

- [ ] **Step 5: Implement the minimal completion read-model boundary**

Create `src/lib/forecast-view-model.ts`:

```ts
import type { Subject } from "./mock-data";
import { allRemainingLessonIds, forecast } from "./planner";
import type { ProgressState } from "./progress-store";
import { normalizeDailyStudyHours } from "./study-hours";

export type ForecastCompletion =
  | { kind: "complete" }
  | { kind: "no-capacity" }
  | { kind: "date"; startISO: string; endISO: string }
  | { kind: "range"; startISO: string; endISO: string };

export function selectForecastCompletion(params: {
  subjects: Subject[];
  state: ProgressState;
  fromISO?: string;
}) {
  const hoursPerDay = Number.isFinite(params.state.plannerSettings.defaultDailyHours)
    ? normalizeDailyStudyHours(params.state.plannerSettings.defaultDailyHours)
    : 2;
  const remainingLessonIds = allRemainingLessonIds(
    params.subjects,
    params.state.completedLessons,
  );
  const result = forecast({
    remainingLessonIds,
    meta: params.state.studyMeta,
    subjects: params.subjects,
    hoursPerDay,
    fromISO: params.fromISO,
  });

  let completion: ForecastCompletion;
  if (result.remaining === 0) completion = { kind: "complete" };
  else if (hoursPerDay <= 0) completion = { kind: "no-capacity" };
  else if (result.earliestEndDateISO === result.latestEndDateISO) {
    completion = { kind: "date", startISO: result.endDateISO, endISO: result.endDateISO };
  } else {
    completion = {
      kind: "range",
      startISO: result.earliestEndDateISO,
      endISO: result.latestEndDateISO,
    };
  }

  return {
    completion,
    remainingLessons: result.remaining,
    hoursPerDay,
    totalNewHours: result.totalNewHours,
    totalReviewHours: result.totalReviewHours,
    totalWorkloadHours: Math.round((result.totalNewHours + result.totalReviewHours) * 10) / 10,
    meanMinutes: result.meanMinutes,
    confidence: result.confidence,
    basis: result.basis,
  };
}
```

Modify `ForecastCard.tsx` so completion text comes only from this selector. Remove the `latestShiftedDate` calculation. Keep the optional `shiftedDates` prop only if removing it would force a route edit; it must not influence Forecast output.

- [ ] **Step 6: Commit Task 1 implementation**

```bash
git add src/lib/forecast-view-model.ts src/components/ForecastCard.tsx
git commit -m "feat: separate forecast completion from schedule projection"
```

- [ ] **Step 7: Verify focused GREEN**

Require the Task 1 regression to pass in natural GitHub Actions with no new failures before moving to Task 2.

---

### Task 2: RED/GREEN — Pure horizon visibility and workload semantics

**Files:**
- Create: `src/lib/forecast-view-model.test.ts`
- Modify: `src/lib/forecast-view-model.ts`

**Interfaces:**
- Consumes: Task 1 completion selector, `buildFlexiblePlan()`, `summarizeUnscheduledWork()`, `addDaysISO()`, `todayISO()`.
- Produces:

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
```

- [ ] **Step 1: Write pure failing tests**

Create `src/lib/forecast-view-model.test.ts`. Use a deterministic fixture generator:

```ts
function makeSubjects(count: number): Subject[] {
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
            plannedDurationMinutes: 60,
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
```

Write six concrete tests:

1. `horizonWeeks=2/4/8/12` returns `14/28/56/84` days and `horizonEndISO = addDaysISO(fromISO, horizonDays - 1)`.
2. With 20 one-hour flexible lessons and `defaultDailyHours = 1`, 14 days reports at least one outside-horizon lesson.
3. The same fixture at 84 days reports no more outside-horizon lessons than the 14-day view.
4. `totalWorkloadHours` equals the one-decimal sum of `totalNewHours + totalReviewHours`.
5. All lessons completed produces `completion.kind === "complete"`; unfinished work with zero hours produces `"no-capacity"`.
6. Repeating the selector with the same `fromISO` produces identical horizon/completion output.

- [ ] **Step 2: Commit only Task 2 tests and verify RED**

```bash
git add src/lib/forecast-view-model.test.ts
git commit -m "test: define forecast horizon visibility semantics"
```

Valid RED must reach the test gate and fail because the current selector lacks the final horizon/view-model semantics; unrelated failures are invalid RED.

- [ ] **Step 3: Implement final `selectForecastViewModel()`**

Add imports for `addDaysISO`, `todayISO`, `buildFlexiblePlan`, and `summarizeUnscheduledWork`. Add:

```ts
const HORIZON_DAYS: Record<ForecastHorizonWeeks, 14 | 28 | 56 | 84> = {
  2: 14,
  4: 28,
  8: 56,
  12: 84,
};
```

Build visibility using only authoritative helpers:

```ts
const startISO = params.fromISO ?? todayISO();
const horizonDays = HORIZON_DAYS[params.horizonWeeks];
const visiblePlan = buildFlexiblePlan({
  subjects: params.subjects,
  completed: params.state.completedLessons,
  reviewCompletions: params.state.reviewCompletions,
  meta: params.state.studyMeta,
  settings: params.state.plannerSettings,
  fromISO: startISO,
  horizonDays,
});
const visibility = summarizeUnscheduledWork({
  subjects: params.subjects,
  completed: params.state.completedLessons,
  visiblePlan,
});
```

Return:

```ts
horizonWeeks: params.horizonWeeks,
horizonDays,
horizonEndISO: addDaysISO(startISO, horizonDays - 1),
visibleScheduledLessons: visibility.visibleScheduledCount,
outsideHorizonLessons: visibility.outsideHorizonCount,
```

Preserve Task 1 completion/workload fields. Do not duplicate scheduler rules.

- [ ] **Step 4: Commit Task 2 implementation and verify GREEN**

```bash
git add src/lib/forecast-view-model.ts
git commit -m "feat: derive forecast horizon visibility"
```

Require Task 1 regression plus all pure selector tests to pass in the natural PR run.

---

### Task 3: RED/GREEN — User-visible Forecast clarity contract

**Files:**
- Create: `src/lib/forecast-card-runtime.test.ts`
- Modify: `src/components/ForecastCard.tsx`

**Interfaces:**
- Consumes: `selectForecastViewModel()` and `ForecastHorizonWeeks`.
- Produces: visible horizon control and explicit workload/visibility/capacity/confidence information.

- [ ] **Step 1: Write the runtime failing test**

Create `src/lib/forecast-card-runtime.test.ts` with the same fixture pattern as Task 2 and actual `ForecastCard` rendering. Compute expected visibility with `selectForecastViewModel({ subjects, state, horizonWeeks: 2, fromISO: "2026-08-08" })` in a separate pure assertion test; for the component render, assert these visible labels:

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

Also assert the rendered outside-horizon explanation includes the exact count returned by the selector for the default 2-week horizon.

- [ ] **Step 2: Commit only the runtime test and verify RED**

```bash
git add src/lib/forecast-card-runtime.test.ts
git commit -m "test: require user-visible forecast clarity metrics"
```

Valid RED must fail the new runtime assertions at the test gate; lint/typecheck failure is not accepted as RED.

- [ ] **Step 3: Implement transient Forecast horizon UI**

In `ForecastCard.tsx`, import `useState`, `selectForecastViewModel`, and `ForecastHorizonWeeks`. Add:

```ts
const [horizonWeeks, setHorizonWeeks] = useState<ForecastHorizonWeeks>(2);
const vm = useMemo(
  () => selectForecastViewModel({ subjects, state, horizonWeeks }),
  [subjects, state, horizonWeeks],
);
```

Use an existing accessible native/select pattern with exactly four options:

```text
2 tuần
4 tuần
8 tuần
12 tuần
```

The horizon handler only updates `setHorizonWeeks`; it must not call persistence.

- [ ] **Step 4: Render the full clarity metrics**

Completion copy:

```ts
const completionText =
  vm.completion.kind === "complete"
    ? "Đã hoàn thành tất cả! 🎉"
    : vm.completion.kind === "no-capacity"
      ? "Chưa có quỹ giờ để dự báo"
      : vm.completion.kind === "date"
        ? displayDate(vm.completion.startISO)
        : `${displayDate(vm.completion.startISO)} – ${displayDate(vm.completion.endISO)}`;
```

Show separately:

```text
Bài mới: <hours> giờ
Ôn tập: <hours> giờ
Tổng khối lượng: <hours> giờ
Quỹ giờ giả định: <hours> giờ/ngày
Phạm vi đang xem: <weeks> tuần
```

Visibility copy:

```ts
vm.outsideHorizonLessons > 0
  ? `Có ${vm.outsideHorizonLessons} bài chưa hoàn thành nằm ngoài phạm vi ${vm.horizonWeeks} tuần đang xem.`
  : `Tất cả bài chưa hoàn thành đều nằm trong phạm vi ${vm.horizonWeeks} tuần đang xem.`
```

Keep confidence, evidence basis, high-hours note, existing hours slider/input, and per-subject progress. Do not remove existing user capability.

- [ ] **Step 5: Commit Task 3 implementation and verify GREEN**

```bash
git add src/components/ForecastCard.tsx
git commit -m "feat: clarify forecast workload and horizon"
```

Require the Task 1 regression, selector suite, runtime suite, and all existing tests to pass in natural CI before final scope verification.

---

### Task 4: Exact-scope verification and completion evidence

**Files:**
- Create: `docs/superpowers/evidence/2026-08-08-smart-planner-p1e-forecast-clarity-completion.md`
- Verify: all changed files from predecessor through the exact Task 3 source/test head.

- [ ] **Step 1: Compare predecessor to exact Task 3 source/test head**

Use GitHub compare with base `b981b8250adef717c1e9c9f4259a265316327b9a` and head equal to the exact SHA returned by the Task 3 implementation commit. Expected paths only:

```text
docs/superpowers/specs/2026-08-08-smart-planner-p1e-forecast-clarity-design.md
docs/superpowers/plans/2026-08-08-smart-planner-p1e-forecast-clarity.md
src/components/ForecastCard.tsx
src/lib/forecast-view-model.ts
src/lib/forecast-clarity-regression.test.ts
src/lib/forecast-view-model.test.ts
src/lib/forecast-card-runtime.test.ts
```

If another path appears, classify it before proceeding; do not broaden scope silently.

- [ ] **Step 2: Fresh-read exact-head full CI**

Require one natural PR run on the exact Task 3 source/test head with all gates PASS:

```text
npm install
npm run typecheck
npm run lint
npm test
npm run build
git diff --exit-code
```

Record exact run ID, job ID, checked merge ref, test file/test counts, and known pre-existing warnings.

- [ ] **Step 3: Re-audit all 20 design acceptance criteria**

Bind every criterion to source, focused test evidence, CI evidence, or exact-scope evidence. Do not infer acceptance from a green build alone.

- [ ] **Step 4: Write the evidence document**

It must contain:

```text
P1E IMPLEMENTED / REVIEW_PENDING / NOT_ACCEPTED / NOT_MERGED
exact predecessor
design commit
final plan commit
valid RED head/run/job
Task GREEN checkpoints
literal final source/test head
exact changed-file list
full final CI run/job/merge-ref
acceptance criteria 1–20 evidence matrix
known nonblocking repository observations
independent reviewer instructions
```

Do not state `ACCEPTED`.

- [ ] **Step 5: Commit evidence only**

```bash
git add docs/superpowers/evidence/2026-08-08-smart-planner-p1e-forecast-clarity-completion.md
git commit -m "docs: add P1E forecast clarity completion evidence"
```

- [ ] **Step 6: Verify evidence-head topology and CI**

The evidence head must be exactly one docs-only commit after the literal final source/test head. Its natural PR CI must pass the same full gate.

- [ ] **Step 7: Update the Draft PR for independent review**

Set status:

```text
P1E IMPLEMENTED / REVIEW_PENDING / NOT_ACCEPTED / NOT_MERGED
```

Bind exact predecessor, design, final plan, valid RED, source/test GREEN, evidence head, CI run/job IDs, and changed-file scope. Instruct a fresh Independent Reviewer to return exactly one of:

```text
P1E IMPLEMENTED / ACCEPTED / NOT_MERGED
P1E IMPLEMENTED / REJECTED / NOT_MERGED
```

Do not mark ready and do not merge.

---

## Independent Review Checklist

The reviewer must independently verify:

1. predecessor remains `b981b8250adef717c1e9c9f4259a265316327b9a`;
2. no base drift invalidates the candidate;
3. Forecast completion no longer consumes shifted schedule dates as prediction output;
4. the read model composes existing authoritative helpers rather than duplicating scheduler rules;
5. 2/4/8/12 weeks map exactly to 14/28/56/84 rolling days;
6. outside-horizon count comes from real `buildFlexiblePlan()` plus `summarizeUnscheduledWork()` behavior;
7. horizon selection is transient and does not call persistence;
8. daily-hours changes still use canonical normalization/persistence;
9. zero-capacity and complete states are distinct;
10. new/review/total workload values are truthful;
11. runtime coverage renders actual production `ForecastCard`;
12. no dependency/schema/workflow/deployment or adjacent P2 scope exists;
13. valid RED preceded production implementation;
14. exact-head full CI is GREEN;
15. all 20 design criteria are satisfied with no unresolved Critical or Important finding.

Merge remains a separate authorization after acceptance.
