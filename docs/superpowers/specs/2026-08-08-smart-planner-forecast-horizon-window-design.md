# Smart Planner Forecast Horizon Window — Design

**Status:** Approved direction; written spec awaiting user review  
**Date:** 2026-08-08  
**Repository:** `NguyenDukKyeon/smart-planner`  
**Exact predecessor:** `main@3444c5d54207ec16de90988958755da62507af11`  
**Branch:** `fix/forecast-horizon-window`

---

## 1. Problem

The current Forecast horizon selector (`2 / 4 / 8 / 12 weeks`) changes only visibility accounting. The large metrics still show whole-roadmap values for remaining lessons, new-learning hours, review hours, and total workload.

Therefore a `2-week` view can still display values such as `341 lessons`, `682 hours new`, and `920.7 hours total`. The control technically works, but its effect is too weak to match the UI label “Phạm vi đang xem”.

This is a read-model scope problem, not a scheduler-placement bug.

---

## 2. Approved product decision

The user approved **Approach A**:

> The selected horizon is the actual Forecast viewing window for workload metrics. Lesson count, new-learning work, review work, and displayed workload come from what the canonical scheduler places inside that window. The whole-roadmap completion milestone remains global and does not change merely because the UI horizon changes.

Exact horizon mapping remains:

```text
2 weeks  -> 14 calendar days
4 weeks  -> 28 calendar days
8 weeks  -> 56 calendar days
12 weeks -> 84 calendar days
```

Changing horizon is transient UI state only. It must not mutate planner settings, lesson dates, persistence, Roadmap, or Flexible Schedule.

---

## 3. Root cause

`selectForecastViewModel()` currently computes whole-roadmap workload through `selectForecastCompletion()` before horizon is applied. Only afterward does it build a horizon-limited `visiblePlan` and derive visibility counts.

`ForecastCard` then renders the whole-roadmap fields beside the horizon control, so data with different scopes is presented as one summary.

The correction is to expose explicit horizon-scoped metrics from the existing `visiblePlan` while preserving the already-correct global completion projection.

---

## 4. Architecture

### 4.1 One canonical scheduler

`buildFlexiblePlan()` remains the sole authority for the selected Forecast window.

Do not create another scheduler and do not infer window workload from raw lesson dates alone.

The Forecast read model builds one `visiblePlan` using current:

- subjects;
- lesson completions;
- review completions;
- study metadata;
- planner settings;
- Forecast start date;
- selected horizon days.

### 4.2 Preserve existing global fields

The existing whole-roadmap fields remain public compatibility fields with unchanged semantics:

```ts
remainingLessons: number;
totalNewHours: number;
totalReviewHours: number;
totalWorkloadHours: number;
completion: ForecastCompletion;
```

They continue to describe the full remaining roadmap / full completion projection.

`ForecastCard` may use `remainingLessons` as total-roadmap context, but it must no longer render `totalNewHours`, `totalReviewHours`, or `totalWorkloadHours` as though they belonged to the selected horizon.

### 4.3 Add explicit horizon-scoped fields

The read model adds:

```ts
horizonScheduledLessons: number;
horizonNewHours: number;
horizonReviewHours: number;
horizonWorkloadHours: number;
horizonUnplacedFixedLessons: number;
outsideHorizonLessons: number;
```

No alias such as `totalRemainingLessons` is added; `remainingLessons` remains the canonical whole-roadmap denominator.

### 4.4 Horizon scheduled lessons

`horizonScheduledLessons` counts unique **unfinished** lessons present in `visiblePlan[*].queue.newLessons`.

Rules:

- exclude IDs already in `completedLessons`;
- deduplicate by lesson ID;
- exclude completed lessons pinned into a day queue for historical visibility;
- exclude unplaced fixed lessons from the scheduled count.

`horizonUnplacedFixedLessons` separately counts unique unfinished lessons in `visiblePlan[*].queue.unplacedFixedLessons`.

`outsideHorizonLessons` keeps the canonical visibility meaning: unfinished lessons not represented inside the selected horizon according to `summarizeUnscheduledWork()`.

### 4.5 Horizon new-learning workload

`horizonNewHours` is the sum of canonical `plannedDurationMinutes` for the unique unfinished lessons actually scheduled in the selected `visiblePlan`.

Do not:

- multiply a global mean by count;
- reuse whole-roadmap `totalNewHours`;
- use study-session duration as future lesson duration;
- count completed pinned lessons;
- include unplaced fixed lessons as scheduled work.

### 4.6 Horizon review workload

`horizonReviewHours` is the review work the canonical scheduler actually places in the selected window.

Derive it from `visiblePlan[*].queue.reviewLessons`:

- exclude review tasks already marked `completed`;
- deduplicate by `taskId` defensively;
- sum each remaining task's scheduler-provided `minutes`.

Do not use the whole-roadmap `35%` review estimate for this field. That estimate represents future review load for the entire roadmap and can extend beyond the selected window.

### 4.7 Horizon total workload

```text
horizonWorkloadHours = horizonNewHours + horizonReviewHours
```

This is scheduled workload inside the selected window, not a replacement for the whole-roadmap workload estimate or completion projection.

### 4.8 Completion remains global

`completion` remains based on the full canonical schedule projection and is independent of `horizonWeeks`.

For identical subjects, progress, settings, and start date:

```text
completion(2 weeks)
= completion(4 weeks)
= completion(8 weeks)
= completion(12 weeks)
```

The UI label must make that scope explicit:

```text
Mốc học hết toàn bộ bài mới
```

---

## 5. Forecast UI contract

This package keeps the existing card hierarchy. It is not a broad visual redesign.

### Completion tile

Label:

```text
Mốc học hết toàn bộ bài mới
```

Value: unchanged whole-roadmap canonical completion milestone.

### Lesson tile

Label:

```text
Bài trong phạm vi
```

Required value format:

```text
<horizonScheduledLessons> / <remainingLessons> bài
```

### New-learning tile

Label:

```text
Bài mới trong phạm vi
```

Value:

```text
<horizonNewHours> giờ
```

### Review tile

Label:

```text
Ôn tập trong phạm vi
```

Value:

```text
<horizonReviewHours> giờ
```

### Workload tile

Label:

```text
Khối lượng trong phạm vi
```

Value:

```text
<horizonWorkloadHours> giờ
```

### Outside-horizon feedback

When unfinished work remains outside the selected window, use neutral copy containing both scoped and whole-roadmap lesson context, for example:

```text
Trong 2 tuần: 107/341 bài được xếp. Có 234 bài chưa hoàn thành nằm ngoài phạm vi đang xem.
```

The numbers above are illustrative only; production values come from the read model.

When all unfinished work is represented inside the selected horizon, state that explicitly.

If `horizonUnplacedFixedLessons > 0`, render a distinct statement that those fixed lessons fall inside the selected date window but could not be placed under current capacity. Do not silently treat them as scheduled workload or as ordinary outside-horizon work.

### Other existing UI

- `Công suất mặc định` remains the current default-hours value.
- `Phạm vi đang xem` remains the selected horizon.
- confidence/evidence remain whole-Forecast evidence semantics.
- per-subject progress remains historical global completion (`done / total`), not horizon progress.

---

## 6. Invariants

1. `completion` is invariant across horizon choices for identical scheduling state.
2. `horizonScheduledLessons` is non-decreasing as horizon grows.
3. `outsideHorizonLessons` is non-increasing as horizon grows.
4. `horizonNewHours` comes only from unique unfinished lessons scheduled inside the selected window.
5. `horizonReviewHours` comes only from uncompleted review tasks actually placed inside that window.
6. `horizonWorkloadHours = horizonNewHours + horizonReviewHours` under one consistent rounding policy.
7. Completed pinned lessons do not inflate scoped lesson count or new workload.
8. Completed review tasks do not inflate scoped review workload.
9. Unplaced fixed lessons are exposed separately and do not count as scheduled workload.
10. Horizon changes do not call planner mutation callbacks.
11. Sunday remains a normal default-capacity day under the already-merged seven-day capacity policy.
12. Default hours and exact-date capacity overrides continue to affect the scheduler-derived window normally.

---

## 7. Real-world regression target

The existing real-roadmap regression represents 352 lessons totaling 699.5 planned new-learning hours, with 341 remaining after 11 completions.

For that style of dataset, a `2-week` Forecast must not render all `341` remaining lessons and all remaining planned hours as though they belong to the 14-day window when the canonical scheduler can place only a subset.

The exact scoped lesson count and workload are derived from `buildFlexiblePlan()` under the fixture's settings; they are not hard-coded from the screenshot.

The regression must prove both:

- changing horizon materially changes scoped workload metrics;
- the whole-roadmap completion milestone does not change with horizon.

---

## 8. TDD requirements

### Pure read-model RED coverage

Before production changes, tests must fail for the new contract:

- `2 weeks` produces fewer scheduled lessons / less scheduled new workload than `12 weeks` when 14 days cannot fit the route;
- longer horizons never reduce `horizonScheduledLessons` or `horizonNewHours`;
- longer horizons never increase `outsideHorizonLessons`;
- global `completion` is identical for `2/4/8/12 weeks` on identical state;
- `horizonNewHours` equals the planned-duration sum of unique unfinished scheduled lessons;
- completed pinned lessons are excluded;
- `horizonReviewHours` equals unique uncompleted scheduler review tasks in the visible plan;
- completed review tasks are excluded;
- unplaced fixed lessons are exposed separately and excluded from scheduled workload;
- `horizonWorkloadHours` equals scoped new + scoped review;
- the real-roadmap fixture no longer exposes whole-roadmap `341 / 677.5h` as 2-week scoped values.

### Runtime/presentation RED coverage

The real rendered `ForecastCard` must prove:

- `Bài trong phạm vi` is used;
- lesson value uses `horizonScheduledLessons / remainingLessons`;
- new/review/workload labels state `trong phạm vi`;
- those values come from horizon fields, not global workload fields;
- completion wording explicitly refers to all new lessons;
- outside-horizon feedback contains scoped + total lesson context;
- no copy implies whole-roadmap workload belongs to the selected window.

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

Expected production/read-model files:

```text
src/lib/forecast-view-model.ts
src/components/ForecastCard.tsx
```

Expected focused tests:

```text
src/lib/forecast-view-model.test.ts
src/lib/forecast-card-runtime.test.ts
```

A small dedicated regression test may be added if it gives a clearer TDD boundary.

Out of scope:

- scheduler placement algorithm changes;
- Roadmap behavior changes;
- Flexible Schedule behavior changes;
- persistence/schema;
- new settings;
- review-generation algorithm redesign;
- Course Manager;
- Weekly Summary historical-label fix;
- P2 redesign;
- dependencies;
- CI/deployment/Vercel changes.

---

## 10. Acceptance

The package is acceptable only when changing the Forecast horizon immediately changes the scheduled lesson count and scheduled workload to match the selected window, while the full-roadmap completion milestone remains stable.

Target disposition after implementation, exact-head CI, evidence, and fresh Independent Review:

```text
FORECAST HORIZON WINDOW IMPLEMENTED / ACCEPTED / NOT_MERGED
```
