# Smart Planner P1B Flexible Schedule Workspace Design

**Status:** Approved design; implementation not yet started  
**Date:** 2026-08-06  
**Repository:** `NguyenDukKyeon/smart-planner`  
**Branch:** `improve/p1b-flexible-schedule-workspace`  
**Exact predecessor:** `main@8a23a4e88890ba1deb4619527ae8d1094c423105`  
**Predecessor packages:** `P0B ACCEPTED / INTEGRATED`, `P1A ACCEPTED / INTEGRATED`

---

## 1. Goal

Turn Flexible Schedule into a capacity-first planning workspace without changing scheduler semantics, persistence ownership, review generation, or transaction behavior.

The workspace must let the user:

- inspect one subject or all subjects;
- inspect all work, fixed work, flexible work, or days requiring attention;
- understand each day's capacity allocation without inferring totals from individual cards;
- move a lesson directly to a chosen date on mobile and keyboard-only workflows;
- discover unfinished lessons outside the visible horizon;
- expand the visible horizon or focus the affected subject after a move leaves the current view;
- continue using the single P0B schedule transaction boundary for every mutation.

This package is **P1B**. It follows P1A placement explanations and precedes Roadmap and Course Manager work.

---

## 2. Existing foundation

The integrated predecessor already provides:

- `buildFlexiblePlan()` as the canonical capacity-based scheduler;
- fixed, flexible, review, quota, overload, unallocated, and unplaced-fixed values on each `PlanDay`;
- one `moveLessonToDate()` path in `FlexiblePlanner`;
- `buildMoveLessonDateCandidate()` for atomic date-plus-provenance candidates;
- `buildChangeDayCapacityCandidate()` for capacity changes;
- `useScheduleTransactions()` for persistence, publication, undo history, and keyboard undo;
- drag handles, whole-day drop targets, and previous/next-day buttons;
- `summarizeUnscheduledWork()` for visible-versus-outside-horizon accounting.

P1B must compose these boundaries. It must not replace them.

---

## 3. Scope boundaries

### In scope

1. A second, status-oriented workspace filter independent of the existing subject filter.
2. Pure helpers for filtering display items and identifying attention days.
3. Explicit day-capacity metrics derived from existing `DayQueue` values.
4. A keyboard-accessible date chooser for lesson moves.
5. Outside-horizon summary for the currently selected subject scope.
6. Post-move feedback when the moved lesson is not visible in the current horizon.
7. Actions to expand the horizon and switch to the affected subject.
8. Focused extraction from `FlexiblePlanner.tsx` only where needed to keep behavior testable.
9. Regression, unit, integration, typecheck, lint, build, and clean-tree verification.

### Out of scope

- scheduler algorithm changes;
- review interval or review-budget changes;
- persistence or transaction-controller changes;
- touch-drag implementation;
- Roadmap grouping or status redesign;
- Course Manager decomposition or ownership refactor;
- Forecast changes;
- broad visual redesign or design-system cleanup;
- new dependency;
- schema migration;
- persisted filter state;
- automatic branch merge or package acceptance.

---

## 4. Chosen architecture

P1B uses a **pure workspace-selector layer** plus one focused move dialog.

### New pure module

```text
src/lib/flexible-schedule-workspace.ts
```

Responsibilities:

- define workspace status-filter types;
- classify displayable schedule items;
- select visible items by subject and status;
- determine whether a day requires attention;
- derive presentation-ready day-capacity metrics;
- derive subject-scoped outside-horizon summaries;
- calculate the minimum bounded horizon expansion needed to include a target date.

The module must not import React, access browser APIs, write storage, or produce schedule candidates.

### New UI component

```text
src/components/flexible-planner/MoveLessonDateDialog.tsx
```

Responsibilities:

- show the selected lesson and current date semantics;
- accept a valid ISO date through a labelled date input;
- distinguish fixed-date behavior from flexible earliest-date behavior;
- submit through a callback supplied by `FlexiblePlanner`;
- remain open when submission fails;
- close on successful commit or no-op;
- restore focus to the trigger after closing through the existing dialog primitive.

The dialog must not call persistence or candidate builders directly.

### Existing orchestration

`FlexiblePlanner.tsx` remains the owner of:

- planner construction;
- selected subject and status filter state;
- transaction hook usage;
- move execution;
- horizon length;
- post-move visibility feedback;
- rendering weeks and day cards.

The current `moveLessonToDate()` remains the single move boundary for drag, previous/next controls, and the new date chooser.

---

## 5. Workspace filter model

```ts
export type FlexibleScheduleStatusFilter =
  | "all"
  | "fixed"
  | "flexible"
  | "attention";
```

Subject filtering and status filtering are independent.

### `all`

Show every item allowed by the selected subject scope:

- fixed new lessons;
- flexible new lessons;
- unplaced fixed lessons;
- reviews.

### `fixed`

Show only ordinary lesson items whose effective `scheduleMode` is `fixed`, including fixed lessons that could not fit capacity.

Reviews are not fixed lessons and must not appear in this mode.

### `flexible`

Show only ordinary lesson items whose effective `scheduleMode` is `flexible`.

Reviews are not flexible lessons and must not appear in this mode.

### `attention`

This is a **day-level diagnostic view**, not a card-only filter.

A day requires attention when either condition is true:

- `day.queue.overloadMinutes > 0`; or
- `day.queue.unplacedFixedMinutes > 0`.

For an attention day, render all items allowed by the selected subject scope, not only the problematic card. Keeping the complete day context lets the user see what consumed capacity.

Days without attention are hidden from expanded week contents in this mode. Week headers remain visible and report zero matching days when applicable.

### Empty-state wording

The empty state must identify the active filters. It must not imply that lessons were deleted or completed.

Examples:

- `Không có bài cố định của môn đang xem trong khoảng lịch này.`
- `Không có ngày quá tải hoặc bài cố định chưa xếp trong khoảng lịch này.`

---

## 6. Day-capacity presentation

P1B must not recalculate scheduler values. It presents the existing queue values through a pure derived shape:

```ts
export type FlexibleScheduleDayMetrics = {
  quotaMinutes: number;
  scheduledMinutes: number;
  newMinutes: number;
  reviewMinutes: number;
  unallocatedMinutes: number;
  overloadMinutes: number;
  unplacedFixedMinutes: number;
  attentionRequired: boolean;
};
```

Derived rule:

```text
scheduledMinutes = newMinutes + reviewMinutes
```

The day header presents the following independently:

- **Công suất:** `quotaMinutes`
- **Đã xếp:** `scheduledMinutes`
- **Bài mới:** `newMinutes`
- **Ôn tập:** `reviewMinutes`
- **Còn trống:** `unallocatedMinutes`, when positive
- **Quá công suất:** `overloadMinutes`, when positive
- **Cố định chưa xếp:** `unplacedFixedMinutes`, when positive

`unplacedFixedMinutes` must never be included in `scheduledMinutes`.

A zero-hour day with fixed work therefore reports:

- capacity `0`;
- scheduled work `0` unless reviews or pinned completed work are already represented by the canonical queue;
- fixed unplaced minutes separately.

No P1B display label may claim unplaced fixed work was scheduled successfully.

---

## 7. Direct date chooser

Each movable ordinary lesson card gains a **Chọn ngày** action alongside previous/next-day controls.

### Interaction flow

```text
open date chooser
→ enter or select date
→ submit to FlexiblePlanner
→ FlexiblePlanner calls moveLessonToDate()
→ moveLessonToDate() builds the canonical candidate
→ P0B transaction persists and publishes
→ dialog closes only when result is successful
```

### Fixed lesson copy

The dialog explains that the lesson will appear only on the selected exact date.

### Flexible lesson copy

The dialog explains that the selected date becomes the earliest eligible date and capacity may place the lesson later.

### Validation

- date is required;
- value must satisfy the existing ISO-date validation rules;
- invalid input produces an inline error and does not call `onMove`;
- dates before the current visible plan start are allowed only when the existing candidate builder allows them;
- same-date submission is a canonical no-op and closes without adding history;
- reviews cannot open the move dialog.

### Failure behavior

If `moveLessonToDate()` returns false:

- the dialog remains open;
- the selected date remains available for correction or retry;
- no success announcement is produced by the dialog;
- persistence and rollback errors continue to come from the existing transaction path.

---

## 8. Outside-horizon visibility

### Subject-scoped summary

The existing visibility helper must support the current subject scope without changing its default all-subject behavior.

Proposed interface:

```ts
export function summarizeUnscheduledWork(params: {
  subjects: Subject[];
  completed: Record<string, string>;
  visiblePlan: PlanDay[];
  subjectId?: string;
}): UnscheduledWorkSummary;
```

Rules:

- omit `subjectId` or pass `"all"` to summarize all subjects;
- pass a valid subject ID to summarize only that subject;
- unknown subject ID returns a zero-count summary rather than falling back to all subjects;
- visible unplaced fixed lessons count as visible unfinished work;
- reviews do not affect unfinished lesson counts;
- duplicate lesson IDs remain de-duplicated using existing behavior.

The workspace toolbar shows:

- unfinished lesson count in scope;
- visible scheduled lesson count in scope;
- outside-horizon lesson count in scope.

The outside-horizon count is a visibility warning, not an error and not a completion metric.

### Post-move detection

After a committed move, P1B checks the newly rendered visible plan for the moved lesson ID.

If the lesson is absent, store one transient notice:

```ts
export type OutsideHorizonMoveNotice = {
  lessonId: string;
  lessonTitle: string;
  subjectId: string;
  targetDateISO: string;
};
```

The notice explains:

- the lesson title;
- the selected exact date for fixed lessons or earliest date for flexible lessons;
- that the lesson lies outside the current visible horizon.

A no-op move must not create a new outside-horizon notice.

A failed move must not create or replace the notice.

### Notice actions

#### `Mở rộng lịch`

Increase `numWeeks` to the minimum supported whole-week count that includes `targetDateISO`, bounded to `1..52`.

The calculation must use the same `today`, first-week Sunday boundary, and horizon model as `FlexiblePlanner`.

If the target is beyond the maximum 52-week horizon, set `numWeeks` to 52 and keep the notice visible with wording that the target remains beyond the maximum view.

#### `Xem môn này`

Set the subject filter to the notice's subject ID. It does not change the status filter automatically.

#### Dismiss

The user may dismiss the notice. A later successful move outside the horizon may create a new notice.

---

## 9. Accessibility and responsive behavior

- The status filter uses a labelled tablist or an equivalent single-selection control with explicit selected state.
- Subject tabs retain current keyboard and horizontal-scroll behavior.
- Every icon-only control retains an accessible name.
- `Chọn ngày` is a real button with a minimum touch target consistent with existing controls.
- The dialog date field has a visible label, description, and inline error association.
- Submission works with Enter; Escape closes through the dialog primitive without committing.
- Drag-and-drop remains an optional pointer enhancement, not the only move method.
- The outside-horizon notice uses `role="status"` or an appropriate live region for the newly committed move result, but its action buttons remain ordinary focusable controls.
- Reduced-motion behavior must not be worsened; P1B adds no mandatory animation.
- No essential information relies only on hover.

P1B deliberately chooses a date dialog instead of custom touch drag because native scrolling and accessible drag semantics cannot be guaranteed within this package.

---

## 10. Error and state handling

- Invalid filter values are not persisted and cannot enter from storage.
- If a selected subject disappears after catalog editing, existing behavior resets to all subjects; the status filter remains unchanged.
- Changing filters does not mutate schedule data or undo history.
- Changing horizon does not mutate schedule data or undo history.
- Move and capacity failures continue to publish no candidate state and append no undo entry.
- Outside-horizon notices are UI state only and are not persisted.
- Undo clears a stale recently-moved highlight. If an outside-horizon notice references the undone mutation, undo also clears that notice.
- External catalog changes may invalidate transaction history through the existing P0B hook; P1B does not override that behavior.

---

## 11. File plan

### Create

- `docs/superpowers/specs/2026-08-06-smart-planner-p1b-flexible-schedule-workspace-design.md`
- `src/lib/flexible-schedule-workspace.ts`
- `src/lib/flexible-schedule-workspace.test.ts`
- `src/components/flexible-planner/MoveLessonDateDialog.tsx`

### Modify

- `src/components/FlexiblePlanner.tsx`
- `src/lib/schedule-visibility.ts`
- `src/lib/schedule-visibility.test.ts`
- `src/lib/flexible-planner-ux-regression.test.ts`
- `src/lib/flexible-planner-transactions-regression.test.ts` only if needed to prove every new move trigger remains on the canonical boundary

### Conditional focused extraction

If `FlexiblePlanner.tsx` becomes materially harder to review, these presentation-only components may be extracted without changing ownership:

- `src/components/flexible-planner/FlexibleScheduleFilters.tsx`
- `src/components/flexible-planner/FlexibleScheduleAttentionNotice.tsx`

No other decomposition is authorized by this design.

---

## 12. Test strategy

### Pure unit tests

`flexible-schedule-workspace.test.ts` covers:

- all/fixed/flexible item classification;
- reviews excluded from fixed and flexible filters;
- unplaced fixed lessons included in fixed mode;
- attention-day detection from overload;
- attention-day detection from unplaced fixed minutes;
- attention mode preserving all selected-subject context for matching days;
- derived capacity metrics and exclusion of unplaced minutes from scheduled minutes;
- bounded minimum horizon expansion;
- targets beyond 52 weeks.

`schedule-visibility.test.ts` covers:

- existing all-subject summary remains unchanged;
- selected-subject summary;
- unknown subject ID produces zero counts;
- unplaced fixed work remains visible;
- reviews do not change lesson visibility totals.

### Component-contract regression tests

Regression tests protect:

- independent subject and status controls;
- accessible status-filter label;
- visible capacity labels;
- `Chọn ngày` trigger;
- one `moveLessonToDate()` path for drag, arrows, and dialog;
- no direct persistence call from `MoveLessonDateDialog`;
- attention empty state;
- outside-horizon notice actions;
- no custom touch-drag dependency or implementation.

### Integration tests

Focused integration coverage verifies:

1. Direct-date move produces the same candidate and provenance semantics as drag/arrow moves.
2. Same-date direct move is a no-op and does not append history.
3. Failed persistence keeps the dialog open and publishes neither date nor provenance.
4. Undo restores the previous date/provenance and clears the associated notice.
5. Moving beyond the current horizon creates a notice after a committed mutation.
6. Expanding the horizon makes a reachable target visible.
7. Subject switching does not alter canonical subject or lesson order.

### Full gates

```bash
npm run typecheck
npm run lint
npm test
npm run build
git diff --exit-code
```

All must pass on the exact PR merge result before integration.

---

## 13. Acceptance criteria

P1B is implementation-complete only when all conditions are met:

1. The workspace supports all-subject and one-subject views.
2. The workspace supports `all`, `fixed`, `flexible`, and `attention` status views.
3. Attention mode preserves full selected-subject context for each problematic day.
4. Reviews never appear as fixed or flexible lessons.
5. Each day separately reports quota, scheduled, new, review, remaining/overload, and unplaced-fixed minutes.
6. Unplaced fixed minutes are never counted as scheduled minutes.
7. Every ordinary lesson can open a keyboard-accessible direct date chooser.
8. Drag, arrow controls, and direct date chooser all call the same `moveLessonToDate()` boundary.
9. Failed moves do not close the dialog or produce outside-horizon success state.
10. Same-date moves remain no-ops with no persistence, clock call, or undo entry.
11. Subject-scoped outside-horizon counts are truthful and preserve current all-subject behavior.
12. A committed move outside the current horizon produces a dismissible notice.
13. The notice can switch to the affected subject and expand the horizon to the bounded minimum.
14. No scheduler, review algorithm, dependency, workflow, or schema change is introduced.
15. Typecheck, lint, full tests, production build, and clean-tree checks pass.
16. Independent review finds no unresolved Critical or Important issue.

Passing CI is implementation evidence, not package acceptance. P1B remains `NOT_ACCEPTED` until an independent acceptance decision is recorded.

---

## 14. Delivery and review state

Implementation will use a dedicated plan and small TDD commits on:

```text
improve/p1b-flexible-schedule-workspace
```

Expected pre-acceptance status:

```text
P1B IMPLEMENTED / SOURCE_HEAD_GREEN / DIFF_REVIEWED / READY_FOR_REVIEW / NOT_MERGED / NOT_ACCEPTED
```

Merge strategy, if later authorized after acceptance, is a regular merge commit. Squash, rebase, force-push, and published-history rewriting remain prohibited by `AGENTS.md`.
