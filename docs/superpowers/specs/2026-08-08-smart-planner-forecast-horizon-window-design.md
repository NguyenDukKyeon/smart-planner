# Smart Planner Forecast Horizon Window — Design

**Status:** Approved direction; written spec awaiting user review  
**Date:** 2026-08-08  
**Repository:** `NguyenDukKyeon/smart-planner`  
**Exact predecessor:** `main@3444c5d54207ec16de90988958755da62507af11`  
**Branch:** `fix/forecast-horizon-window`

---

## 1. Problem

The current Forecast horizon selector (`2 / 4 / 8 / 12 weeks`) changes only visibility accounting. The large metrics still show whole-roadmap values:

- remaining lessons;
- new-learning hours;
- review hours;
- total workload;
- whole-roadmap completion date.

As a result, selecting `2 weeks` can still show values such as `341 lessons`, `682 hours new`, and `920.7 hours total`. The only obvious horizon-dependent output is the outside-horizon message, so the control appears ineffective.

This behavior follows the previous P1E contract, which defined horizon as a visibility-only period, but that contract is not useful enough in the current Forecast UI.

---

## 2. Approved product decision

The user approved **Approach A**:

> The selected horizon becomes the actual Forecast viewing window for the workload metrics. Lesson count, new-learning work, review work, and displayed workload are derived from what the canonical scheduler places inside that window. The whole-roadmap completion milestone remains global and must not change merely because the UI horizon changes.

Therefore:

- `2 weeks` means “show me the work currently scheduled in the next 14 calendar days”;
- `4 weeks` means 28 days;
- `8 weeks` means 56 days;
- `12 weeks` means 84 days;
- changing horizon changes the scoped workload metrics immediately;
- changing horizon does **not** mutate planner settings, lesson dates, persistence, or Roadmap;
- changing horizon does **not** alter the canonical whole-roadmap completion milestone.

---

## 3. Root cause

`selectForecastViewModel()` currently computes whole-roadmap workload through `selectForecastCompletion()` before horizon is applied. Only afterward does it call `buildFlexiblePlan(... horizonDays)` and `summarizeUnscheduledWork()` to derive `visibleScheduledLessons` and `outsideHorizonLessons`.

`ForecastCard` then renders the whole-roadmap fields (`remainingLessons`, `totalNewHours`, `totalReviewHours`, `totalWorkloadHours`) next to a horizon selector. The data has different scopes but the UI presents it as one summary.

The fix is a read-model scope correction, not a scheduler correction.

---

## 4. Architecture

### 4.1 Keep one canonical scheduler

`buildFlexiblePlan()` remains the authority for the selected Forecast window.

Do not create a second horizon scheduler and do not infer scoped work from raw lesson dates alone.

For the selected `horizonDays`, the Forecast read model builds exactly one `visiblePlan` from:

- current subjects;
- current lesson completions;
- current review completions;
- current study metadata;
- current planner settings;
- the current Forecast start date;
- the selected horizon.

### 4.2 Separate global Forecast facts from horizon-scoped facts

The read model must make scope explicit.

Global facts:

```ts
totalRemainingLessons: number;
completion: ForecastCompletion;
defaultDailyHours: number;
confidence: ForecastEvidenceConfidence;
basis: ForecastEvidenceBasis;
```

Horizon-scoped facts:

```ts
horizonScheduledLessons: number;
horizonNewHours: number;
horizonReviewHours: number;
horizonWorkloadHours: number;
outsideHorizonLessons: number;
horizonUnplacedFixedLessons: number;
```

Existing compatibility fields may remain temporarily if required by other tests/callers, but `ForecastCard` must not use whole-roadmap workload fields as the selected-horizon metrics.

### 4.3 Horizon lesson count

`horizonScheduledLessons` counts unique **unfinished** lessons actually present in `visiblePlan[*].queue.newLessons`.

Rules:

- filter out lessons already present in `completedLessons`;
- deduplicate by lesson ID;
- do not count completed lessons pinned into a day queue for historical visibility;
- do not count an unplaced fixed lesson as scheduled.

`horizonUnplacedFixedLessons` separately counts unique unfinished lessons present in `visiblePlan[*].queue.unplacedFixedLessons`.

`outsideHorizonLessons` continues to mean unfinished lessons that are not represented inside the visible horizon according to the canonical visibility model.

### 4.4 Horizon new-learning workload

`horizonNewHours` is derived from the unique unfinished lessons actually scheduled in the selected `visiblePlan`.

For each scheduled lesson, use its canonical `plannedDurationMinutes`.

Do **not**:

- multiply a global mean by lesson count;
- reuse whole-roadmap `totalNewHours`;
- use study-session duration as future lesson duration;
- count completed pinned lessons;
- include unplaced fixed lessons as scheduled work.

### 4.5 Horizon review workload

`horizonReviewHours` is the review work the canonical scheduler actually places in the selected `visiblePlan`.

Derive it from unique review tasks in `visiblePlan[*].queue.reviewLessons`:

- exclude review tasks already marked completed;
- deduplicate by `taskId` defensively;
- sum each task's scheduler-provided `minutes` value.

Do not use the whole-roadmap `35%` review estimate for the horizon metric. That estimate represents a different concept and would make a “2-week workload” include review work that may occur after the selected window.

### 4.6 Horizon total workload

```text
horizonWorkloadHours = horizonNewHours + horizonReviewHours
```

This is the workload currently scheduled inside the selected window.

It is not a replacement for the whole-roadmap completion projection.

### 4.7 Completion milestone remains global

The completion tile remains based on the full canonical schedule projection, independent of `horizonWeeks`.

Changing `2 → 4 → 8 → 12 weeks` must not change `completion` when subjects, progress, planner settings, and start date are otherwise identical.

The label must make this scope explicit, for example:

```text
Mốc học hết toàn bộ bài mới
```

This avoids implying that the completion milestone itself belongs only to the selected window.

---

## 5. Forecast UI contract

Keep the current Forecast card and horizon control; this package is not a visual redesign.

The main metric grid changes semantics as follows.

### Completion

Label:

```text
Mốc học hết toàn bộ bài mới
```

Value remains the full-roadmap canonical completion milestone.

### Lesson count

Label:

```text
Bài trong phạm vi
```

Preferred value format:

```text
<horizonScheduledLessons> / <totalRemainingLessons> bài
```

This gives immediate evidence that the horizon selector changed the visible work while retaining whole-roadmap context.

### New-learning workload

Label:

```text
Bài mới trong phạm vi
```

Value:

```text
<horizonNewHours> giờ
```

### Review workload

Label:

```text
Ôn tập trong phạm vi
```

Value:

```text
<horizonReviewHours> giờ
```

### Total workload

Label:

```text
Khối lượng trong phạm vi
```

Value:

```text
<horizonWorkloadHours> giờ
```

### Outside-horizon feedback

When work remains outside the selected window, show neutral explanatory copy such as:

```text
Trong 2 tuần: 107/341 bài được xếp. Có 234 bài chưa hoàn thành nằm ngoài phạm vi đang xem.
```

Do not hard-code those example numbers; they come from the read model.

When all unfinished work fits, state that all remaining work is represented in the selected horizon.

If `horizonUnplacedFixedLessons > 0`, add a distinct message that those fixed lessons are inside the selected date window but could not be placed under current capacity. Do not silently classify them as scheduled work.

### Subject progress

The existing per-subject completion progress remains global progress (`done / total`). Horizon selection does not redefine historical completion percentage.

---

## 6. Invariants

The implementation must preserve all of these:

1. `completion` is invariant across horizon choices for the same scheduling state.
2. `horizonScheduledLessons` is non-decreasing as the horizon grows, assuming identical state and start date.
3. `outsideHorizonLessons` is non-increasing as the horizon grows.
4. `horizonNewHours` is derived only from unique unfinished lessons scheduled in the selected window.
5. `horizonReviewHours` is derived only from uncompleted review tasks actually placed in that window.
6. `horizonWorkloadHours = horizonNewHours + horizonReviewHours` after display rounding policy is applied consistently.
7. A completed lesson pinned into a plan day does not inflate horizon lesson count or workload.
8. A completed review task does not inflate horizon review workload.
9. An unplaced fixed lesson is not counted as scheduled workload.
10. Horizon changes are transient UI state only and do not call planner mutation callbacks.
11. Sunday remains a normal default-capacity day under the already-merged seven-day capacity policy.
12. The Forecast hours control and exact-date capacity overrides continue to affect the scheduler-derived horizon plan normally.

---

## 7. Real-world regression target

The existing real-roadmap regression represents 352 lessons totaling 699.5 planned new-learning hours, with 341 remaining after 11 completions.

For that style of dataset, a `2-week` Forecast must no longer display all `341` remaining lessons and all remaining planned hours as though they belong to the 2-week window when the canonical scheduler can place only a subset inside 14 days.

The exact scoped count/hours must be derived from `buildFlexiblePlan()` under the fixture's capacity settings, not hard-coded from the user's screenshot.

The regression must prove both:

- the selected window materially changes the scoped metrics;
- the full-roadmap completion milestone remains unchanged across horizon choices.

---

## 8. TDD requirements

### Pure read-model RED coverage

Add failing tests before production changes for:

- `2 weeks` produces a smaller scoped lesson count/workload than `12 weeks` when the route cannot fit in 14 days;
- longer horizons never reduce scheduled lesson count/new-work hours;
- longer horizons never increase outside-horizon lesson count;
- global completion is identical for `2/4/8/12 weeks` on the same state;
- scoped new hours equal the sum of planned durations of unique unfinished scheduled lessons;
- completed pinned lessons are excluded;
- scoped review hours equal uncompleted scheduler review tasks inside the visible plan;
- completed review tasks are excluded;
- unplaced fixed lessons are exposed separately and excluded from scheduled workload;
- scoped total equals scoped new + scoped review;
- the real-roadmap fixture no longer exposes whole-roadmap `341 / 677.5h` as the 2-week scoped metrics.

### Runtime/presentation RED coverage

The rendered Forecast card must prove:

- it labels the lesson metric `Bài trong phạm vi`;
- it labels workload values as `trong phạm vi`;
- it renders scoped values from the horizon read model rather than global workload fields;
- completion wording explicitly refers to the whole set of new lessons;
- outside-horizon feedback includes both scoped and total lesson context;
- no copy implies the global workload belongs to the selected horizon.

### Full gate

Natural GitHub Actions must pass on the final exact source/test head and again on the docs-only evidence head:

```text
typecheck
lint
tests
build
clean-tree
```

Formatting-only failures are not behavioral RED/GREEN evidence.

---

## 9. Scope

Expected production/read-model scope:

```text
src/lib/forecast-view-model.ts
src/components/ForecastCard.tsx
```

Expected focused tests:

```text
src/lib/forecast-view-model.test.ts
src/lib/forecast-card-runtime.test.ts
```

A small dedicated regression test may be added if that produces a clearer TDD boundary.

Out of scope:

- scheduler placement algorithm changes;
- Roadmap behavior changes;
- Flexible Schedule behavior changes;
- planner persistence/schema;
- new settings;
- review-generation algorithm redesign;
- Course Manager;
- Weekly Summary historical-label fix;
- P2 UI redesign;
- dependency changes;
- CI/deployment/Vercel changes.

---

## 10. Acceptance

The package is acceptable only when a user can change the Forecast horizon and immediately see the scheduled lesson count and scheduled workload change to match that window, while the full-roadmap completion milestone remains stable.

Target disposition after implementation, exact-head CI, evidence, and fresh Independent Review:

```text
FORECAST HORIZON WINDOW IMPLEMENTED / ACCEPTED / NOT_MERGED
```
