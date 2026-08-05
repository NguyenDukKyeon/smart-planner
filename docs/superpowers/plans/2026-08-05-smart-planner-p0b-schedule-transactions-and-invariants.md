# Smart Planner P0B Implementation Plan

**Package:** P0B — Schedule transactions, multi-step undo, and scheduler invariants  
**Date:** 2026-08-05  
**Repository:** `NguyenDukKyeon/smart-planner`  
**Status:** Ready for implementation after P0A is merged and verified on `main`

## 1. Objective

P0B makes schedule-changing operations atomic, recoverable, and governed by one explicit transaction model. It also locks the scheduler rules that must remain true for fixed lessons, flexible lessons, reviews, capacity, and out-of-horizon work.

This package is intentionally bounded. It does not redesign Today, Roadmap, Course Manager, or Forecast. It creates the reliability layer those P1 changes will depend on.

## 2. Preconditions

Implementation must not begin on `main` until all of the following are true:

1. PR #3 (`P0A: 16-hour capacity and build purity`) is merged.
2. GitHub Actions passes on the resulting `main` commit.
3. The merged source remains clean after `typecheck`, `lint`, `test`, and `build`.
4. The implementation branch is created from that exact accepted `main` commit.

Vercel production verification is strongly preferred before beginning P0B. If Vercel is still blocked only by an account build-rate limit, the branch may be created after explicit owner acceptance of the green GitHub Actions evidence, but P0B must not be merged until production deployment is available again.

## 3. Current-state evidence

The existing Flexible Schedule already has a local `UndoEntry[]` stack and supports undo for lesson-date moves only. Each entry stores only the previous subject catalog plus display metadata. Day-capacity changes, schedule-mode changes, lesson reordering, and future bulk operations do not participate in the same undo history.

The current lesson move sequence is:

```text
build next subjects
→ persist catalog through onSubjectsUpdated
→ push local undo entry
→ announce success
```

The current day-capacity sequence bypasses that history and calls `onSetDayHours` directly from the day input.

The scheduler already distinguishes:

- fixed lessons scheduled on an exact date;
- flexible lessons eligible from an earliest date;
- unplaced fixed lessons and unplaced fixed minutes;
- review work;
- daily quota, unallocated minutes, and overload minutes.

P0B must preserve those accepted behaviors while making them explicit and regression-tested.

## 4. Non-goals

P0B does not:

- persist undo history across browser reloads;
- add cloud synchronization;
- introduce a new state-management dependency;
- redesign the Flexible Schedule layout;
- add Today reason labels;
- decompose Course Manager;
- rewrite the scheduler from scratch;
- change lesson IDs, subject IDs, or stored catalog shape;
- change the accepted 0–16 hour policy from P0A;
- permit reviews to be reordered as ordinary lessons.

## 5. Target architecture

### 5.1 Canonical transaction module

Create:

```text
src/lib/schedule-transactions.ts
```

Proposed public types:

```ts
export type ScheduleMutationKind =
  | "move-lesson-date"
  | "change-schedule-mode"
  | "change-day-capacity"
  | "reorder-lesson"
  | "bulk-schedule-update";

export type ScheduleSnapshot = {
  subjects: Subject[];
  plannerSettings: PlannerSettings;
};

export type ScheduleMutationEntry = {
  id: string;
  kind: ScheduleMutationKind;
  createdAt: number;
  description: string;
  before: ScheduleSnapshot;
};

export type ScheduleCandidate = {
  subjects: Subject[];
  plannerSettings: PlannerSettings;
};

export type ScheduleTransactionResult =
  | {
      ok: true;
      candidate: ScheduleCandidate;
      undoEntry: ScheduleMutationEntry;
    }
  | {
      ok: false;
      error: string;
    };
```

Required pure helpers:

```ts
export function createScheduleSnapshot(
  subjects: Subject[],
  plannerSettings: PlannerSettings,
): ScheduleSnapshot;

export function createScheduleMutationEntry(params: {
  kind: ScheduleMutationKind;
  description: string;
  subjects: Subject[];
  plannerSettings: PlannerSettings;
  now?: number;
  idFactory?: () => string;
}): ScheduleMutationEntry;

export function appendScheduleUndoEntry(
  current: ScheduleMutationEntry[],
  entry: ScheduleMutationEntry,
  limit?: number,
): ScheduleMutationEntry[];

export function isEditableUndoTarget(target: EventTarget | null): boolean;
```

Rules:

- snapshots must be detached copies, not references that later mutate;
- undo history is capped at 20 entries;
- a failed mutation never creates an undo entry;
- an operation that produces no state change never creates an undo entry;
- descriptions are user-readable and specific to the operation;
- the module contains no React and no browser storage access.

### 5.2 Atomic persistence coordinator

Create:

```text
src/lib/schedule-persistence.ts
```

This module coordinates the two browser-local stores involved in schedule mutations:

- progress state / planner settings;
- subject catalog.

Proposed API:

```ts
export type PersistScheduleCandidateParams = {
  previous: ScheduleSnapshot;
  candidate: ScheduleCandidate;
  saveSubjects: (subjects: Subject[]) => StorageWriteResult;
  savePlannerSettings: (plannerSettings: PlannerSettings) => StorageWriteResult;
};

export type PersistScheduleCandidateResult =
  | { ok: true }
  | { ok: false; error: string; rollbackError?: string };

export function persistScheduleCandidate(
  params: PersistScheduleCandidateParams,
): PersistScheduleCandidateResult;
```

Persistence sequence:

```text
validate candidate
→ persist first affected store
→ persist second affected store
→ if second write fails, restore first store from previous snapshot
→ publish React state only after all required writes succeed
```

A mutation that changes only one store must not write the other store unnecessarily.

If existing storage helpers already provide verified multi-key replacement, reuse them rather than creating a parallel rollback implementation.

### 5.3 React orchestration hook

Create:

```text
src/components/flexible-planner/useScheduleTransactions.ts
```

Proposed responsibility:

- own the session undo stack;
- expose transaction functions to Flexible Schedule;
- coordinate persistence callbacks already supplied by Dashboard;
- publish success only after persistence succeeds;
- provide one undo command for all supported operation kinds;
- register `Ctrl+Z` / `Cmd+Z` while ignoring editable targets.

Proposed return shape:

```ts
{
  history,
  canUndo,
  executeMutation,
  undoLastMutation,
}
```

The hook must not contain scheduler algorithms. It coordinates candidates produced by pure functions.

## 6. Required mutations in P0B

### 6.1 Move lesson date

Replace the local move-only `UndoEntry` flow in `FlexiblePlanner.tsx`.

Transaction must snapshot:

- complete subject catalog;
- current planner settings.

Candidate changes only the selected lesson's `scheduledDate`.

Acceptance rules:

- moving to the same date is a no-op and creates no history entry;
- fixed lesson messaging says it will appear only on the selected date;
- flexible lesson messaging says the selected date is its earliest eligible date;
- storage failure leaves the lesson at its previous date and creates no undo entry;
- successful move creates exactly one history entry;
- undo restores the complete catalog and planner settings snapshot.

### 6.2 Change day capacity

Route Flexible Schedule day-hour changes through the transaction layer.

Input behavior remains from P0A:

- range 0–16;
- step 0.5;
- normalized canonical value;
- high-capacity warning above 12.

Acceptance rules:

- one committed input change creates one undo entry;
- transient keystrokes must not flood history;
- use `onBlur`, Enter, or a short explicit commit boundary rather than recording every input event;
- setting a day to the inherited default removes the unnecessary override where current progress semantics support it;
- failed progress persistence restores the visible prior value;
- undo restores both the exact prior override map and the catalog snapshot.

### 6.3 Change schedule mode

P0B provides the transaction capability and tests for fixed ↔ flexible changes, even if the UI entry point currently lives in Course Manager.

Acceptance rules:

- fixed requires a valid exact date;
- flexible interprets the stored date as earliest eligible date;
- invalid candidate is rejected before persistence;
- a successful mode change creates one history entry;
- undo restores mode, date, catalog order, and planner settings.

Wiring every Course Manager mode-control surface may be deferred to a small follow-up within P0B if the current component boundary makes direct reuse unsafe, but the shared transaction API and regression tests are mandatory in this package.

### 6.4 Reorder lesson

Expose a pure candidate builder for moving a lesson within its subject/topic ordering.

Acceptance rules:

- stored IDs remain unchanged;
- no duplicate or missing lesson is produced;
- cross-topic or cross-subject moves require explicit target metadata;
- successful reorder creates one history entry;
- persistence failure leaves the original order untouched;
- undo restores the full original catalog.

## 7. Scheduler invariants to lock

Add or extend tests in:

```text
src/lib/planner.test.ts
src/lib/schedule-mode-regression.test.ts
src/lib/planning-date-regression.test.ts
src/lib/flexible-planner-ux-regression.test.ts
```

Add focused files where isolation is clearer:

```text
src/lib/schedule-transactions.test.ts
src/lib/schedule-persistence.test.ts
src/lib/scheduler-invariants.test.ts
```

### 7.1 Fixed lessons

Tests must prove:

- a fixed lesson is eligible only on its exact date;
- it is never automatically carried to the next day;
- when it does not fit, it appears in `unplacedFixedLessons`;
- `unplacedFixedMinutes` equals its estimated duration;
- it is not included in successfully scheduled `newMinutes`;
- changing later-day capacity cannot silently move it.

### 7.2 Flexible lessons

Tests must prove:

- a flexible lesson never appears before `scheduledDate`;
- it may appear after `scheduledDate` when earlier capacity is insufficient;
- canonical order inside a subject/topic is preserved;
- moving its earliest date later cannot make it appear earlier;
- work beyond the visible horizon remains detectable through a summary helper added in this package.

Add a pure helper, proposed path:

```text
src/lib/schedule-visibility.ts
```

Proposed API:

```ts
export function summarizeUnscheduledWork(params: {
  subjects: Subject[];
  completed: Record<string, string>;
  visiblePlan: PlanDay[];
}): {
  unfinishedCount: number;
  visibleScheduledCount: number;
  outsideHorizonCount: number;
  outsideHorizonLessonIds: string[];
};
```

P0B only exposes the summary data and tests it. P1 will design the final visible UI.

### 7.3 Reviews

Tests must prove:

- review tasks are generated only for accepted intervals;
- review identity remains `review:<lessonId>:<dateISO>`;
- reviews are not included in ordinary lesson reorder candidates;
- review minutes are counted consistently in quota calculations;
- completing a review does not mutate catalog ordering.

### 7.4 Capacity accounting

Tests must prove:

```text
quotaMinutes = normalizedHours × 60
unallocatedMinutes = max(0, quota - new - review)
overloadMinutes = max(0, new + review - quota)
```

Also prove:

- 16 hours produces 960 quota minutes;
- unplaced fixed work is reported separately from successful scheduled work;
- zero-hour days expose fixed work as unplaced rather than silently dropping it;
- changing capacity and undoing restores the exact prior plan.

## 8. File-level implementation sequence

### Task 1 — Pure transaction primitives

Create:

```text
src/lib/schedule-transactions.ts
src/lib/schedule-transactions.test.ts
```

TDD sequence:

1. Test detached snapshot behavior.
2. Test mutation metadata.
3. Test 20-entry cap.
4. Test editable-target detection.
5. Implement minimum code to pass.

Checkpoint:

```bash
npm test -- src/lib/schedule-transactions.test.ts
npm run typecheck
```

### Task 2 — Persistence and rollback

Create:

```text
src/lib/schedule-persistence.ts
src/lib/schedule-persistence.test.ts
```

Test matrix:

- catalog-only success;
- settings-only success;
- both-store success;
- first write failure;
- second write failure with successful rollback;
- second write failure with rollback failure surfaced;
- no writes for unchanged candidate.

Prefer existing verified storage helpers from `app-storage.ts`.

Checkpoint:

```bash
npm test -- src/lib/schedule-persistence.test.ts
npm run typecheck
```

### Task 3 — Scheduler invariant coverage

Create or extend the invariant tests before changing UI orchestration.

Minimum regression cases:

- fixed overflow;
- fixed zero-capacity day;
- flexible earliest-date boundary;
- flexible carry-forward order;
- outside-horizon summary;
- review separation;
- 960-minute day.

Checkpoint:

```bash
npm test -- src/lib/planner.test.ts src/lib/scheduler-invariants.test.ts
```

### Task 4 — Flexible Schedule transaction hook

Create:

```text
src/components/flexible-planner/useScheduleTransactions.ts
```

Refactor:

```text
src/components/FlexiblePlanner.tsx
```

Remove:

- local `UndoEntry` type;
- local move-only stack logic;
- duplicate editable-target helper.

Wire:

- move lesson date;
- committed day-capacity change;
- explicit Undo button;
- keyboard undo;
- operation-specific toast descriptions.

Do not split the entire component in this task.

Checkpoint:

```bash
npm test -- src/lib/schedule-transactions.test.ts src/lib/flexible-planner-ux-regression.test.ts
npm run typecheck
npm run lint
```

### Task 5 — Mode and reorder candidate builders

Add pure candidate helpers either to `schedule-transactions.ts` or focused files if the module becomes too broad:

```ts
buildMoveLessonDateCandidate(...)
buildChangeScheduleModeCandidate(...)
buildReorderLessonCandidate(...)
buildChangeDayCapacityCandidate(...)
```

Use existing catalog helpers where safe. Do not duplicate catalog traversal logic without justification.

Wire currently safe entry points. Leave a documented adapter boundary for any Course Manager operation that cannot yet use the shared hook without a large refactor.

Checkpoint:

```bash
npm test -- src/lib/custom-subjects.test.ts src/lib/schedule-transactions.test.ts
npm run typecheck
```

### Task 6 — Integration and clean-tree verification

Run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
git diff --exit-code
```

Required result:

- all commands pass;
- no tracked source is modified;
- existing accepted scheduling behavior remains covered;
- new transaction and invariant tests pass;
- no temporary write-enabled workflow remains;
- no source-patching script is reintroduced.

## 9. PR strategy

Create one branch after P0A acceptance:

```text
improve/p0b-schedule-transactions
```

Open a draft PR early.

Recommended commit structure:

1. `test: define schedule transaction contracts`
2. `feat: add schedule transaction primitives`
3. `test: lock scheduler invariants`
4. `feat: add atomic schedule persistence`
5. `refactor: route flexible planner mutations through transactions`
6. `test: cover undo for capacity and lesson moves`
7. `docs: record P0B verification evidence`

Do not merge because CI is green alone. Before acceptance, independently inspect:

- exact final commit;
- changed-file scope;
- storage rollback behavior;
- no-op and failure behavior;
- keyboard behavior in editable controls;
- fixed/flexible invariant tests;
- Vercel preview when quota permits.

## 10. Acceptance criteria

P0B is accepted only when all are true:

1. Lesson-date moves and committed day-capacity changes use one shared transaction history.
2. Undo restores the full prior subject catalog and planner-settings snapshot.
3. History contains at most 20 successful mutations.
4. Failed and no-op mutations create no undo entry.
5. `Ctrl+Z` / `Cmd+Z` is ignored in editable controls.
6. Fixed lessons never move automatically and remain visible as unplaced when they do not fit.
7. Flexible lessons never appear before their earliest date and preserve canonical order.
8. Reviews remain separate from ordinary lesson reorder operations.
9. Outside-horizon unfinished work is detectable through a tested pure summary.
10. Capacity accounting is consistent, including 16 hours = 960 minutes.
11. Typecheck, lint, all tests, production build, and clean-tree verification pass.
12. No write-enabled or one-shot mutation workflow remains in `.github/workflows`.
13. Independent review finds no unresolved Critical or Important issue.
14. The accepted commit is deployed successfully to Vercel, or deployment is explicitly deferred only because of a documented external quota condition.

## 11. Deferred to P1

After P0B acceptance, P1 may safely build:

- Today reason labels;
- visible out-of-horizon and overloaded filters;
- richer capacity summaries;
- clearer move confirmations;
- Roadmap state labels;
- mobile date chooser;
- Course Manager decomposition.

Those features must consume P0B transaction and invariant APIs rather than recreating schedule logic in UI components.
