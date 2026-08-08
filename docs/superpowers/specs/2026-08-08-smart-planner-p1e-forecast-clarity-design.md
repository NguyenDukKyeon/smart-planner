# Smart Planner P1E — Forecast Clarity Design

**Status:** Approved by the user for implementation planning and execution  
**Date:** 2026-08-08  
**Repository:** `NguyenDukKyeon/smart-planner`  
**Exact predecessor:** `main@b981b8250adef717c1e9c9f4259a265316327b9a`  
**Package:** P1E — Forecast clarity

---

## 1. Purpose

P1E completes the remaining P1 Forecast requirement from the approved Smart Planner audit/improvement direction.

The package makes Forecast explicitly distinguish:

1. remaining new-learning work;
2. estimated review work;
3. the current daily-capacity assumption;
4. work that is outside the user-selected Forecast horizon; and
5. forecast confidence and evidence basis.

P1E is intentionally a read-model and presentation package. It does not redesign scheduling, persistence, transactions, Roadmap, Course Manager, or review generation.

---

## 2. Current-state evidence

At the exact predecessor:

- `src/components/ForecastCard.tsx` already shows remaining lessons, total workload, a new/review-hour split, normalized default daily hours, confidence, evidence basis, and per-subject progress.
- The Forecast completion label currently gives `latestShiftedDate` precedence over `forecast()`'s own completion date/range. This conflates two different concepts: the latest scheduler-projected lesson date and the statistical forecast completion estimate.
- `src/lib/planner.ts` already owns the canonical `forecast()` function and exposes confidence, evidence basis, new-learning hours, review hours, and earliest/latest estimated completion dates.
- `src/lib/schedule-visibility.ts` already provides `summarizeUnscheduledWork()`, which derives unfinished, visible-scheduled, and outside-horizon lesson counts from a real `PlanDay[]`.
- `src/components/FlexiblePlanner.tsx` keeps its `numWeeks` selection transient inside the component. P1E must not hoist or persist that P1B UI state merely to make Forecast horizon-aware.
- `buildFlexiblePlan()` already provides the authoritative capacity-based plan for an explicit date horizon.

P1E therefore does not need a second scheduler or a new outside-horizon algorithm.

---

## 3. Approved scope decision

The user approved the following constraint before implementation:

> P1E changes Forecast read-model and UI clarity only. Scheduler, persistence, and transaction semantics remain unchanged unless a RED behavioral test demonstrates that the existing `forecast()` calculation itself violates an approved P1E requirement.

Consequences:

- no persistence-schema change;
- no new dependency;
- no schedule mutation or undo change;
- no Course Manager change;
- no Roadmap change;
- no notification or timer change;
- no CI/deployment configuration change;
- no broad refactor of `planner.ts`.

---

## 4. Design principles

1. **Separate forecast from schedule projection.** A scheduler-projected latest lesson date must never masquerade as the statistical Forecast completion date.
2. **Reuse authoritative planning logic.** Outside-horizon accounting must use `buildFlexiblePlan()` and `summarizeUnscheduledWork()` rather than inventing parallel rules.
3. **One read model for presentation.** Forecast calculation and wording inputs should be assembled in a pure selector, not recomputed ad hoc throughout JSX.
4. **Horizon selection is transient.** Forecast may have its own local horizon control; it does not write browser storage or alter Flexible Schedule's internal horizon state.
5. **Capacity remains canonical.** The default-hours control continues using `normalizeDailyStudyHours()` and the existing `onSetDefaultDailyHours` persistence boundary.
6. **No false precision.** Low/insufficient confidence uses a date range and explicit evidence basis rather than implying a guaranteed date.
7. **No hidden unfinished work.** If unfinished lessons are outside the selected horizon, the UI says so explicitly.
8. **No behavior expansion.** P1E does not add schedule editing, moves, drag-and-drop, or new navigation ownership.

---

## 5. Architecture

### 5.1 Pure Forecast read model

Create:

```text
src/lib/forecast-view-model.ts
```

It owns the pure assembly of Forecast presentation data.

Proposed public interface:

```ts
export type ForecastHorizonWeeks = 2 | 4 | 8 | 12;

export type ForecastViewModel = {
  hoursPerDay: number;
  horizonWeeks: ForecastHorizonWeeks;
  horizonDays: number;
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
  completion: {
    kind: "complete" | "no-capacity" | "date" | "range";
    startISO?: string;
    endISO?: string;
  };
};

export function selectForecastViewModel(params: {
  subjects: Subject[];
  state: ProgressState;
  horizonWeeks: ForecastHorizonWeeks;
  fromISO?: string;
}): ForecastViewModel;
```

Exact implementation details may be tightened by the implementation plan, but the ownership boundary is fixed: the selector returns semantic values; `ForecastCard` formats and renders them.

### 5.2 Horizon semantics

Forecast receives a local, transient horizon selector with these bounded options:

```text
2 weeks
4 weeks
8 weeks
12 weeks
```

Default: `2 weeks`.

The selected horizon means **the period of schedule visibility being summarized by Forecast**, not a new scheduling policy.

For the selected horizon, the selector:

1. derives the exact day span from `fromISO` through the selected number of calendar weeks;
2. calls `buildFlexiblePlan()` with current subjects, completions, review completions, study metadata, planner settings, and that exact horizon;
3. passes the resulting `PlanDay[]` to `summarizeUnscheduledWork()`;
4. exposes `visibleScheduledLessons` and `outsideHorizonLessons` separately.

Changing the Forecast horizon must not change persisted planner settings or the Flexible Schedule horizon.

### 5.3 Forecast completion semantics

`forecast()` remains authoritative for completion prediction.

Presentation rules:

- no remaining lessons → `completion.kind = "complete"`;
- normalized hours per day `<= 0` → `completion.kind = "no-capacity"`;
- equal earliest/latest forecast dates → `completion.kind = "date"`;
- different earliest/latest forecast dates → `completion.kind = "range"`.

The scheduler-derived latest shifted date is not an input to Forecast completion text.

P1E may remove the `shiftedDates` prop from `ForecastCard` if it has no other legitimate Forecast use after this separation.

### 5.4 Workload semantics

The read model exposes three separate numbers:

```text
new-learning hours
review hours
total workload hours
```

`totalWorkloadHours` is the sum of the two displayed estimates. It is a presentation aggregate only and does not become scheduler quota state.

### 5.5 Capacity assumption

The Forecast hours control continues to read:

```ts
state.plannerSettings.defaultDailyHours
```

and normalize through:

```ts
normalizeDailyStudyHours()
```

The existing callback remains the sole mutation boundary:

```ts
onSetDefaultDailyHours(hours)
```

Changing the value updates both the Forecast estimate and the horizon plan derived from the current planner settings after publication.

---

## 6. Forecast UI

Keep the existing compact Forecast card hierarchy. Do not redesign the whole Plan area.

Required visible information:

- **Dự kiến hoàn thành** — date or confidence range from `forecast()` only;
- **Bài còn lại** — unfinished lesson count;
- **Bài mới** — estimated new-learning hours;
- **Ôn tập** — estimated review hours;
- **Tổng khối lượng** — sum of new + review estimate;
- **Quỹ giờ giả định** — current normalized `X giờ/ngày`;
- **Phạm vi đang xem** — selected Forecast horizon;
- **Ngoài phạm vi** — explicit count when unfinished lessons are outside that horizon;
- **Mức tin cậy** — current confidence label;
- evidence basis text using planned/mixed/actual semantics.

When `outsideHorizonLessons === 0`, Forecast should state that all unfinished lessons fit within the selected visible horizon rather than showing an alarming warning.

When `outsideHorizonLessons > 0`, use neutral explanatory copy such as:

```text
Có 18 bài chưa hoàn thành nằm ngoài phạm vi 2 tuần đang xem.
```

This is visibility information, not an error and not evidence of data loss.

---

## 7. Error and edge behavior

- `0` daily hours must not produce a fake completion date; show the no-capacity state.
- No remaining lessons must show completed state and zero remaining workload.
- Invalid/non-finite persisted default hours continue through existing normalization/fallback behavior; P1E does not create a second normalization policy.
- Duplicate lesson IDs, fixed/unplaced behavior, review generation, and capacity overflow remain governed by existing scheduler code.
- Horizon calculations must be deterministic when `fromISO` is supplied in tests.
- Changing horizon must not call `onSetDefaultDailyHours`.
- Changing daily hours must not mutate Forecast horizon selection.
- `latestShiftedDate` must not override or modify the completion estimate.

---

## 8. Testing strategy

P1E uses TDD.

### 8.1 Pure selector tests

Create:

```text
src/lib/forecast-view-model.test.ts
```

Required coverage:

- default-hours normalization flows into the selector;
- new-learning, review, and total workload remain separate and internally consistent;
- 2/4/8/12-week horizon selection changes visibility accounting without changing schedule data;
- unfinished work outside the selected horizon is counted through real `buildFlexiblePlan()` output;
- zero outside-horizon work is represented truthfully;
- completed and zero-capacity completion states are distinct;
- date versus range completion comes exclusively from `forecast()` outputs;
- deterministic `fromISO` behavior.

### 8.2 Regression contract

Add a focused regression test proving that a far-future scheduler-projected or shifted lesson date cannot replace the Forecast date/range.

The test must fail against the predecessor behavior before production implementation is written.

### 8.3 Runtime/presentation coverage

Add a component-runtime Forecast regression using existing React/ReactDOM test dependencies only.

It must render actual production `ForecastCard` and prove that the user can observe:

- new-learning hours;
- review hours;
- total workload;
- capacity assumption;
- selected horizon;
- outside-horizon count/status;
- confidence/basis;
- forecast completion date/range.

No DOM-testing dependency is added.

### 8.4 Full gate

Natural GitHub Actions must pass on the exact candidate head:

```text
npm install
npm run typecheck
npm run lint
npm test
npm run build
git diff --exit-code
```

Green CI is implementation evidence only. It does not grant package acceptance or merge authority.

---

## 9. Closed file scope

Expected production scope:

```text
src/components/ForecastCard.tsx
src/lib/forecast-view-model.ts
```

Expected test scope:

```text
src/lib/forecast-view-model.test.ts
src/lib/forecast-card-runtime.test.ts
src/lib/forecast-clarity-regression.test.ts
```

Documentation scope:

```text
docs/superpowers/specs/2026-08-08-smart-planner-p1e-forecast-clarity-design.md
docs/superpowers/plans/2026-08-08-smart-planner-p1e-forecast-clarity.md
docs/superpowers/evidence/2026-08-08-smart-planner-p1e-forecast-clarity-completion.md
```

`src/lib/planner.ts` is **not** in the normal allowlist. It may be added only if a valid RED behavioral test proves that the existing `forecast()` implementation violates an approved P1E requirement and the exact correction is documented before the production edit.

No route, Flexible Planner, Roadmap, Course Manager, persistence, package/lockfile, workflow, or deployment file is in normal scope.

---

## 10. Acceptance criteria

P1E is implementation-complete only when all of the following are independently verifiable:

1. Forecast completion date/range comes only from canonical `forecast()` output.
2. A scheduler-projected latest lesson date cannot override Forecast completion.
3. New-learning hours are visible separately.
4. Review hours are visible separately.
5. Total workload hours are visible and equal the displayed estimates' aggregate.
6. Current normalized default daily capacity is explicit.
7. Forecast has a bounded transient horizon selector.
8. The Forecast horizon does not persist or alter Flexible Schedule horizon state.
9. Outside-horizon unfinished lessons are derived from `buildFlexiblePlan()` plus `summarizeUnscheduledWork()`.
10. Outside-horizon count is visible when greater than zero.
11. Zero outside-horizon work has truthful non-warning presentation.
12. Confidence remains explicit.
13. Planned/mixed/actual evidence basis remains explicit.
14. Zero daily capacity does not show a fake completion date.
15. No remaining lessons shows a completed state.
16. Changing default hours continues through the existing persistence callback and canonical normalization.
17. No scheduler, persistence-schema, transaction, Roadmap, Course Manager, dependency, workflow, or deployment semantics change.
18. Focused RED evidence exists before production code for the new selector/regression behavior.
19. Exact-head full GitHub Actions verification passes.
20. Independent review finds no unresolved Critical or Important issue before merge authorization.

---

## 11. Governance

Implementation occurs on:

```text
improve/p1e-forecast-clarity
```

The branch starts exactly from:

```text
b981b8250adef717c1e9c9f4259a265316327b9a
```

Rules:

- use forward-only commits;
- do not amend, rebase, squash, force-push, or rewrite published history;
- create a Draft PR and keep it unmerged during implementation and independent review;
- preserve exact RED and GREEN evidence;
- no auto-merge;
- no branch deletion;
- independent acceptance is required before any later merge authorization;
- merge, if separately authorized later, uses a regular merge commit.

Final implementation disposition before independent acceptance must be:

```text
P1E IMPLEMENTED / REVIEW_PENDING / NOT_ACCEPTED / NOT_MERGED
```
