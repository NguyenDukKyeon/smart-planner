# Smart Planner P1D Course Manager Transactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task. Every behavioral task follows RED → GREEN → focused verification → commit.

**Goal:** Route every Course Manager schedule-affecting mutation through the existing P0B transaction and undo system, establish one controller shared with Flexible Schedule, and decompose `CourseManagerModal.tsx` without changing scheduler semantics, catalog identity, or persistence schemas.

**Architecture:** `Dashboard` owns one `useScheduleTransactions()` instance and passes one `ScheduleTransactionController` object to `FlexiblePlanner` and `CourseManagerModal`. Pure candidate builders live in `src/lib/schedule-candidates.ts`. Course Manager presentation and local interaction units live under `src/components/course-manager/`. Catalog-only operations continue using `updateSubjectsSafely` and existing archive/delete helpers.

**Tech Stack:** React 19, TypeScript 5.8, TanStack Start/Router, Radix UI, Tailwind CSS 4, Vitest 4, existing browser-storage adapters and P0B schedule transaction primitives.

## Authority and constraints

- Exact predecessor: `main@ceeee84682c55c663d09a6b171227a1d92171046`.
- Approved design: `docs/superpowers/specs/2026-08-06-smart-planner-p1d-course-manager-transactions-design.md` at `448c9ff69944a95229afc9da0fa400539f9185c3`.
- Branch: `improve/p1d-course-manager-transactions`.
- Preserve published Lovable history: no force-push, rebase, amend, squash, or history rewrite.
- One schedule transaction owner, one bounded 20-entry history, and one `Ctrl/Cmd+Z` listener serve both Plan surfaces.
- Schedule-affecting operations: lesson date, schedule mode, duration, subject/topic movement, subject/topic/lesson reorder, and bulk schedule edits.
- Catalog-only operations: subject creation/rename/emoji, topic creation/rename, archive, restore, delete, import, export, duplicate, and Add Lesson.
- A combined lesson editor save creates at most one schedule history entry.
- Bulk schedule operations are all-or-nothing and create at most one history entry.
- Existing IDs are preserved unless an existing creation or duplication flow intentionally creates a new entity.
- Existing canonical order changes only after explicit user reorder or move actions.
- Fixed lessons require a valid date. Flexible lessons allow an empty date and reject invalid non-empty dates.
- Do not change scheduler, review algorithm, progress schema, catalog schema, Forecast, Roadmap semantics, dependencies, lockfile, CI, or deployment configuration.
- Tests remain under `src/lib` because `npm test` executes `vitest run src/lib src/routes/__root.test.tsx`.
- Final gates: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `git diff --exit-code`.
- Keep the PR draft and unmerged until independent acceptance and a separate merge command.

## Locked production file map

```text
src/components/schedule/useScheduleTransactions.ts               create
src/components/flexible-planner/useScheduleTransactions.ts       delete after exact move
src/routes/index.tsx                                              modify
src/components/FlexiblePlanner.tsx                                modify
src/components/CourseManagerModal.tsx                             modify
src/components/course-manager/course-manager-model.ts             create
src/components/course-manager/LessonEditorDialog.tsx              create
src/components/course-manager/BulkActionsBar.tsx                  create
src/components/course-manager/SubjectListPane.tsx                 create
src/components/course-manager/SubjectWorkspace.tsx                create
src/components/course-manager/SubjectHeader.tsx                   create
src/components/course-manager/TopicSection.tsx                    create
src/components/course-manager/LessonRow.tsx                       create
src/components/course-manager/useLessonReorder.ts                 create
src/lib/schedule-transactions.ts                                  modify
src/lib/schedule-candidates.ts                                    modify
```

## Locked test file map

```text
src/lib/course-manager-transaction-owner-regression.test.ts       create
src/lib/course-manager-model.test.ts                              create
src/lib/course-manager-ui-regression.test.ts                      create
src/lib/schedule-candidates.test.ts                               modify
src/lib/schedule-operations-integration.test.ts                   modify
src/lib/flexible-planner-transactions-regression.test.ts          modify
src/lib/catalog-order-drag-regression.test.ts                     modify
src/lib/schedule-catalog-hook-regression.test.ts                  modify only if ownership assertions require it
```

---

### Task 1: Establish one shared transaction owner

**Files:**
- Create: `src/components/schedule/useScheduleTransactions.ts`
- Delete: `src/components/flexible-planner/useScheduleTransactions.ts`
- Modify: `src/routes/index.tsx`
- Modify: `src/components/FlexiblePlanner.tsx`
- Modify: `src/components/CourseManagerModal.tsx`
- Create: `src/lib/course-manager-transaction-owner-regression.test.ts`
- Modify: `src/lib/flexible-planner-transactions-regression.test.ts`

- [ ] **1.1 Write the RED ownership regression**

Create `src/lib/course-manager-transaction-owner-regression.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const dashboardSource = readFileSync(new URL("../routes/index.tsx", import.meta.url), "utf8");
const flexibleSource = readFileSync(
  new URL("../components/FlexiblePlanner.tsx", import.meta.url),
  "utf8",
);
const courseManagerSource = readFileSync(
  new URL("../components/CourseManagerModal.tsx", import.meta.url),
  "utf8",
);
const sharedHookSource = readFileSync(
  new URL("../components/schedule/useScheduleTransactions.ts", import.meta.url),
  "utf8",
);

describe("P1D shared schedule transaction owner", () => {
  test("Dashboard creates exactly one controller and passes it twice", () => {
    expect(dashboardSource.match(/useScheduleTransactions\(/g)).toHaveLength(1);
    expect(dashboardSource).toContain("const scheduleTransactions = useScheduleTransactions({");
    expect(dashboardSource.match(/scheduleTransactions=\{scheduleTransactions\}/g)).toHaveLength(2);
  });

  test("both children consume the controller and create no local hook", () => {
    expect(flexibleSource).toContain("scheduleTransactions: ScheduleTransactionController");
    expect(courseManagerSource).toContain("scheduleTransactions: ScheduleTransactionController");
    expect(flexibleSource).not.toContain("useScheduleTransactions({");
    expect(courseManagerSource).not.toContain("useScheduleTransactions({");
  });

  test("the shared hook retains keyboard protection and stale-history handling", () => {
    expect(sharedHookSource).toContain('window.addEventListener("keydown", handleUndoShortcut)');
    expect(sharedHookSource).toContain("isEditableUndoTarget");
    expect(sharedHookSource).toContain("shouldInvalidateScheduleHistory");
    expect(sharedHookSource).toContain("expectedPublishedSnapshotRef");
  });
});
```

- [ ] **1.2 Commit RED and verify the expected failure**

```bash
npm test -- src/lib/course-manager-transaction-owner-regression.test.ts
git add src/lib/course-manager-transaction-owner-regression.test.ts
git commit -m "test: require one P1D schedule transaction owner"
```

Expected RED: the shared hook path does not exist and Dashboard does not own the controller.

- [ ] **1.3 Move the existing hook exactly, then expose its controller type**

Copy `src/components/flexible-planner/useScheduleTransactions.ts` byte-for-byte to `src/components/schedule/useScheduleTransactions.ts`. Keep its existing state, refs, stale-history invalidation, commit logic, undo logic, and keyboard listener unchanged. Export this exact public type:

```ts
export type ScheduleTransactionController = {
  history: ScheduleMutationEntry[];
  canUndo: boolean;
  executeMutation(params: ExecuteScheduleMutationParams): CommitScheduleMutationResult;
  undoLastMutation(): UndoScheduleMutationResult;
};
```

Add the explicit return annotation:

```ts
export function useScheduleTransactions({
  subjects,
  plannerSettings,
  adapters,
  onUndoSuccess,
  onUndoError,
}: UseScheduleTransactionsParams): ScheduleTransactionController {
```

Delete the old hook only after imports compile against the new path.

- [ ] **1.4 Instantiate the hook once in Dashboard**

Import from `@/components/schedule/useScheduleTransactions` and add immediately after `scheduleTransactionAdapters`:

```ts
const scheduleTransactions = useScheduleTransactions({
  subjects,
  plannerSettings: state.plannerSettings,
  adapters: scheduleTransactionAdapters,
  onUndoSuccess: (entry) => {
    toast.success("Đã hoàn tác thay đổi lịch.", { description: entry.description });
  },
  onUndoError: (error, rollbackError) => {
    toast.error(rollbackError ? `${error} ${rollbackError}` : error);
  },
});
```

Pass `scheduleTransactions={scheduleTransactions}` to the existing `CourseManagerModal` call and the existing `FlexiblePlanner` call. Also pass `plannerSettings={state.plannerSettings}` to Course Manager.

- [ ] **1.5 Convert Flexible Planner to a controller consumer**

Use this prop shape:

```ts
type Props = {
  state: ProgressState;
  subjects?: Subject[];
  scheduleTransactions: ScheduleTransactionController;
};
```

Replace the local hook call with:

```ts
const { history, canUndo, executeMutation, undoLastMutation } = scheduleTransactions;
```

Retain existing move/capacity candidate calls and UI-specific notices. Route-level callbacks now own generic undo toast/error feedback.

- [ ] **1.6 Add Course Manager props without routing behavior yet**

```ts
plannerSettings: PlannerSettings;
scheduleTransactions: ScheduleTransactionController;
```

- [ ] **1.7 Update the existing Flexible Planner regression**

Change the hook source path to `../components/schedule/useScheduleTransactions.ts`. Assert one route-owned call, two identical props, and no local hook call in Flexible Planner.

- [ ] **1.8 Run GREEN and commit**

```bash
npm test -- src/lib/course-manager-transaction-owner-regression.test.ts src/lib/flexible-planner-transactions-regression.test.ts src/lib/schedule-transactions.test.ts src/lib/schedule-mutation-controller.test.ts
npm run typecheck
git add src/components/schedule/useScheduleTransactions.ts src/components/flexible-planner/useScheduleTransactions.ts src/routes/index.tsx src/components/FlexiblePlanner.tsx src/components/CourseManagerModal.tsx src/lib/course-manager-transaction-owner-regression.test.ts src/lib/flexible-planner-transactions-regression.test.ts
git commit -m "refactor: share schedule transactions across plan surfaces"
```

---

### Task 2: Add atomic lesson editor candidates

**Files:**
- Modify: `src/lib/schedule-transactions.ts`
- Modify: `src/lib/schedule-candidates.ts`
- Modify: `src/lib/schedule-candidates.test.ts`
- Modify: `src/lib/schedule-operations-integration.test.ts`

- [ ] **2.1 Write RED tests**

Add imports and tests for this public API:

```ts
export type LessonEditorCandidateInput = {
  title: string;
  subjectId: string;
  topicId: string;
  plannedDurationMinutes: number;
  scheduledDate: string;
  scheduleMode: LessonScheduleMode;
};

export function buildEditLessonCandidate(params: {
  current: ScheduleSnapshot;
  lessonId: string;
  input: LessonEditorCandidateInput;
}): ScheduleCandidateBuildResult;
```

Required test cases:

```text
updates title, duration, mode, date and destination in one candidate
preserves the lesson ID and complete lesson-ID set
rejects empty title
rejects duration below 1 or above 1440
rejects fixed mode without an ISO date
accepts flexible mode with an empty date
rejects flexible mode with an invalid non-empty date
rejects missing lesson, subject, or topic
returns a detached no-op candidate for an unchanged draft
```

Use the existing `reorderSnapshot()` and `lessonIds()` fixtures in `schedule-candidates.test.ts`.

- [ ] **2.2 Commit RED**

```bash
npm test -- src/lib/schedule-candidates.test.ts
git add src/lib/schedule-candidates.test.ts
git commit -m "test: define atomic Course Manager lesson edits"
```

Expected RED: `buildEditLessonCandidate` and `LessonEditorCandidateInput` are missing.

- [ ] **2.3 Extend exact mutation kinds**

```ts
export type ScheduleMutationKind =
  | "move-lesson-date"
  | "change-schedule-mode"
  | "change-day-capacity"
  | "edit-lesson"
  | "reorder-subject"
  | "reorder-topic"
  | "reorder-lesson"
  | "move-lessons"
  | "bulk-schedule-update";
```

- [ ] **2.4 Implement the builder**

Implementation order:

```text
clone the current snapshot
trim and validate title
round duration and enforce 1..1440
locate source lesson and destination subject/topic
validate resulting mode/date
update fields with updateLessonDetails
move with moveLessonsToTopic
verify previous and candidate lesson IDs are unique and identical
return a detached candidate
```

Use these exact errors:

```text
Tên bài học không được để trống.
Thời lượng mục tiêu phải từ 1 đến 1440 phút.
Không tìm thấy bài học để chỉnh sửa.
Vui lòng chọn môn học đích hợp lệ.
Vui lòng chọn chủ đề đích hợp lệ.
Bài cố định cần một ngày hợp lệ.
Ngày bắt đầu linh hoạt không hợp lệ.
Không thể bảo toàn danh sách bài học khi chỉnh sửa.
```

- [ ] **2.5 Add one-entry commit and full-undo integration coverage**

Build one combined edit, commit with `kind: "edit-lesson"`, assert one history entry, call `undoLastScheduleMutation`, and assert the restored snapshot deeply equals the complete pre-edit snapshot.

- [ ] **2.6 Run GREEN and commit**

```bash
npm test -- src/lib/schedule-candidates.test.ts src/lib/schedule-operations-integration.test.ts src/lib/schedule-transactions.test.ts
npm run typecheck
git add src/lib/schedule-transactions.ts src/lib/schedule-candidates.ts src/lib/schedule-candidates.test.ts src/lib/schedule-operations-integration.test.ts
git commit -m "feat: build atomic Course Manager lesson candidates"
```

---

### Task 3: Add reorder, move, and bulk candidates

**Files:**
- Modify: `src/lib/schedule-candidates.ts`
- Modify: `src/lib/schedule-candidates.test.ts`
- Modify: `src/lib/schedule-operations-integration.test.ts`

- [ ] **3.1 Write RED tests for these exact APIs**

```ts
export function buildReorderSubjectCandidate(params: {
  current: ScheduleSnapshot;
  subjectId: string;
  direction: -1 | 1;
}): ScheduleCandidateBuildResult;

export function buildReorderTopicCandidate(params: {
  current: ScheduleSnapshot;
  subjectId: string;
  topicId: string;
  direction: -1 | 1;
}): ScheduleCandidateBuildResult;

export function buildMoveLessonsCandidate(params: {
  current: ScheduleSnapshot;
  lessonIds: Iterable<string>;
  targetSubjectId: string;
  targetTopicId?: string;
}): ScheduleCandidateBuildResult;

export type BulkLessonSchedulePatch = {
  scheduledDate?: string;
  scheduleMode?: LessonScheduleMode;
  plannedDurationMinutes?: number;
};

export function buildBulkLessonUpdateCandidate(params: {
  current: ScheduleSnapshot;
  lessonIds: Iterable<string>;
  patch: BulkLessonSchedulePatch;
}): ScheduleCandidateBuildResult;
```

Required tests:

```text
subject reorder preserves every nested ID
subject/topic first and last boundaries return detached no-op candidates
topic reorder rejects mismatched subject/topic IDs
move deduplicates selected IDs
move rejects an empty selection
move rejects one missing selected lesson and changes nothing
move validates destination subject/topic
move without topic preserves current first-topic behavior
bulk duration enforces 1..1440
bulk fixed mode rejects any resulting lesson without a valid date
bulk empty date is allowed only when every resulting mode is flexible
bulk invalid date rejects the entire operation
bulk no-op returns a detached unchanged candidate
one bulk action commits one history entry and undo restores the complete snapshot
```

- [ ] **3.2 Commit RED**

```bash
npm test -- src/lib/schedule-candidates.test.ts src/lib/schedule-operations-integration.test.ts
git add src/lib/schedule-candidates.test.ts src/lib/schedule-operations-integration.test.ts
git commit -m "test: define Course Manager reorder and bulk transactions"
```

- [ ] **3.3 Implement selection and identity validation**

Create private helpers that:

```text
deduplicate selected IDs
reject zero selected IDs
reject any missing selected ID
reject duplicate IDs in the existing catalog
compare the sorted complete lesson-ID lists before and after
```

Use existing `reorderSubject`, `reorderTopic`, `moveLessonsToSubject`, `moveLessonsToTopic`, and `updateLessonDetails` helpers only after validation.

Do not use the current `updateLessonsDetails` for schedule mode; its implementation does not assign the supplied `scheduleMode` field.

- [ ] **3.4 Run GREEN and commit**

```bash
npm test -- src/lib/schedule-candidates.test.ts src/lib/schedule-operations-integration.test.ts src/lib/schedule-mutation-controller.test.ts
npm run typecheck
git add src/lib/schedule-candidates.ts src/lib/schedule-candidates.test.ts src/lib/schedule-operations-integration.test.ts
git commit -m "feat: add Course Manager reorder and bulk candidates"
```

---

### Task 4: Extract the pure Course Manager model

**Files:**
- Create: `src/components/course-manager/course-manager-model.ts`
- Create: `src/lib/course-manager-model.test.ts`
- Modify: `src/components/CourseManagerModal.tsx`

- [ ] **4.1 Write RED model tests**

The model exports:

```ts
export type LessonFilter = "all" | "not-started" | "in-progress" | "completed" | "unscheduled";
export type LessonSort = "roadmap" | "date" | "progress" | "name" | "remaining";

export type LessonEditorDraft = {
  title: string;
  subjectId: string;
  topicId: string;
  minutes: number;
  date: string;
  scheduleMode: LessonScheduleMode;
};

export function buildMinutesByLesson(progress?: ProgressState): Map<string, number>;
export function deriveSubjectStats(
  subject: Subject,
  minutesByLesson: Map<string, number>,
  progress?: ProgressState,
): SubjectStats;
export function filterAndSortMilestones(params: FilterAndSortParams): Milestone[];
export function createLessonEditorDraft(params: {
  subjects: Subject[];
  lesson: Lesson;
}): LessonEditorDraft | null;
export function classifyLessonEdit(params: {
  lesson: Lesson;
  ownerSubjectId: string;
  ownerTopicId: string;
  draft: LessonEditorDraft;
}): "noop" | "catalog-only" | "schedule-affecting";
```

Test accumulated minutes, explicit completion, unscheduled filtering, every sort mode, stable roadmap order, ownership resolution, no-op classification, title-only classification, and each schedule-affecting field.

- [ ] **4.2 Commit RED**

```bash
npm test -- src/lib/course-manager-model.test.ts
git add src/lib/course-manager-model.test.ts
git commit -m "test: define Course Manager view model semantics"
```

- [ ] **4.3 Implement the model and remove duplicates from the modal**

Move only pure logic:

```text
lesson flattening and ownership lookup
minutes aggregation
subject statistics
filter/sort projection
editor draft creation
edit classification
```

`filterAndSortMilestones` must not mutate input subject, milestone, or lesson arrays.

Classification is exact:

```ts
const titleChanged = draft.title.trim() !== lesson.title;
const scheduleChanged =
  draft.subjectId !== ownerSubjectId ||
  draft.topicId !== ownerTopicId ||
  Math.round(draft.minutes) !== lesson.plannedDurationMinutes ||
  draft.date !== lesson.scheduledDate ||
  draft.scheduleMode !== (lesson.scheduleMode ?? "flexible");

return scheduleChanged ? "schedule-affecting" : titleChanged ? "catalog-only" : "noop";
```

- [ ] **4.4 Run GREEN and commit**

```bash
npm test -- src/lib/course-manager-model.test.ts src/lib/catalog-order-drag-regression.test.ts
npm run typecheck
git add src/components/course-manager/course-manager-model.ts src/lib/course-manager-model.test.ts src/components/CourseManagerModal.tsx
git commit -m "refactor: extract Course Manager model"
```

---

### Task 5: Extract the lesson editor and route atomic saves

**Files:**
- Create: `src/components/course-manager/LessonEditorDialog.tsx`
- Create: `src/lib/course-manager-ui-regression.test.ts`
- Modify: `src/components/CourseManagerModal.tsx`

- [ ] **5.1 Write RED ownership and routing regression**

Assert:

```text
LessonEditorDialog exports one presentation component
LessonEditorDialog contains current labels and input controls
LessonEditorDialog imports no catalog helper, candidate builder, controller, or storage helper
CourseManagerModal calls classifyLessonEdit
CourseManagerModal keeps title-only edits on updateLessonDetails + apply
CourseManagerModal calls buildEditLessonCandidate for schedule-affecting edits
CourseManagerModal commits kind "edit-lesson"
CourseManagerModal closes only after accepted no-op or successful persistence
```

- [ ] **5.2 Commit RED**

```bash
npm test -- src/lib/course-manager-ui-regression.test.ts
git add src/lib/course-manager-ui-regression.test.ts
git commit -m "test: require atomic Course Manager editor routing"
```

- [ ] **5.3 Extract the existing editor markup verbatim**

Preserve:

```text
subject and topic selects
30/45/60/90/120-minute buttons
numeric min 1 and max 1440
fixed/flexible descriptions
date field and clear-date button
Vietnamese labels and accessible names
cancel behavior
```

The submit button invokes `onSubmit`; the dialog does not persist or close itself.

- [ ] **5.4 Route save by model classification**

```text
noop → close, no persistence, no history
catalog-only → update title through existing apply path, close only on success
schedule-affecting → buildEditLessonCandidate → execute shared mutation kind edit-lesson → close only on success
validation/persistence failure → toast exact error and keep editor open
```

Successful committed schedule edits show `Nhấn Ctrl+Z để hoàn tác thay đổi lịch.` No-op edits do not claim a new mutation.

- [ ] **5.5 Run GREEN and commit**

```bash
npm test -- src/lib/course-manager-ui-regression.test.ts src/lib/course-manager-model.test.ts src/lib/schedule-candidates.test.ts src/lib/schedule-operations-integration.test.ts
npm run typecheck
git add src/components/course-manager/LessonEditorDialog.tsx src/components/CourseManagerModal.tsx src/lib/course-manager-ui-regression.test.ts
git commit -m "feat: route Course Manager lesson edits atomically"
```

---

### Task 6: Extract drag units and route every reorder transactionally

**Files:**
- Create: `src/components/course-manager/useLessonReorder.ts`
- Create: `src/components/course-manager/LessonRow.tsx`
- Create: `src/components/course-manager/TopicSection.tsx`
- Modify: `src/components/CourseManagerModal.tsx`
- Modify: `src/lib/catalog-order-drag-regression.test.ts`
- Modify: `src/lib/course-manager-ui-regression.test.ts`

- [ ] **6.1 Write RED regressions against extracted paths**

Require:

```text
dedicated drag handle label remains
application/x-smart-lesson-id remains
custom drag preview remains
Chèn phía trên and Chèn phía dưới remain
auto-scroll remains
data-course-scroll-container remains
up/down fallback buttons remain
reorder disabled with search, non-all filter, or non-roadmap sort
modal uses buildReorderSubjectCandidate with kind reorder-subject
modal uses buildReorderTopicCandidate with kind reorder-topic
modal uses buildReorderLessonCandidate with kind reorder-lesson
```

- [ ] **6.2 Commit RED**

```bash
npm test -- src/lib/catalog-order-drag-regression.test.ts src/lib/course-manager-ui-regression.test.ts
git add src/lib/catalog-order-drag-regression.test.ts src/lib/course-manager-ui-regression.test.ts
git commit -m "test: require transactional Course Manager reordering"
```

- [ ] **6.3 Extract mechanics without mutation ownership**

`useLessonReorder.ts` owns only:

```text
dragged and armed IDs
drop indicator state
preview creation
edge calculation
auto-scroll
cleanup
generation of explicit subjectId/topicId/beforeLessonId targets
```

It imports no candidate builder, transaction controller, storage helper, or toast.

- [ ] **6.4 Extract LessonRow and TopicSection verbatim**

Preserve progress UI, selection checkbox, drag handle, insertion line, up/down buttons, edit action, dropdown actions, topic collapse/menu, mobile wrapping, and accessible labels. They accept callbacks and never construct candidates.

- [ ] **6.5 Route reorder handlers**

Build `createScheduleSnapshot(currentSubjects, plannerSettings)` immediately before each action. Send validated candidates to `scheduleTransactions.executeMutation`. Remove direct JSX calls to `reorderSubject`, `reorderTopic`, `reorderLesson`, and `moveLessonBeforeInTopic`.

- [ ] **6.6 Run GREEN and commit**

```bash
npm test -- src/lib/catalog-order-drag-regression.test.ts src/lib/course-manager-ui-regression.test.ts src/lib/schedule-candidates.test.ts src/lib/schedule-operations-integration.test.ts
npm run typecheck
git add src/components/course-manager/useLessonReorder.ts src/components/course-manager/LessonRow.tsx src/components/course-manager/TopicSection.tsx src/components/CourseManagerModal.tsx src/lib/catalog-order-drag-regression.test.ts src/lib/course-manager-ui-regression.test.ts
git commit -m "feat: route Course Manager reorder through shared history"
```

---

### Task 7: Extract bulk actions and route atomic bulk mutations

**Files:**
- Create: `src/components/course-manager/BulkActionsBar.tsx`
- Modify: `src/components/CourseManagerModal.tsx`
- Modify: `src/lib/course-manager-ui-regression.test.ts`
- Modify: `src/lib/schedule-operations-integration.test.ts`

- [ ] **7.1 Write RED assertions**

Require:

```text
move-to-subject uses buildMoveLessonsCandidate and kind move-lessons
move-to-topic uses buildMoveLessonsCandidate and kind move-lessons
date uses buildBulkLessonUpdateCandidate and kind bulk-schedule-update
mode uses buildBulkLessonUpdateCandidate and kind bulk-schedule-update
duration uses buildBulkLessonUpdateCandidate and kind bulk-schedule-update
selection clears only after commit success
archive and delete remain on catalog-only paths
one successful bulk commit creates one history entry
failed persistence publishes nothing and preserves history
```

- [ ] **7.2 Commit RED**

```bash
npm test -- src/lib/course-manager-ui-regression.test.ts src/lib/schedule-operations-integration.test.ts
git add src/lib/course-manager-ui-regression.test.ts src/lib/schedule-operations-integration.test.ts
git commit -m "test: require atomic Course Manager bulk schedule edits"
```

- [ ] **7.3 Extract BulkActionsBar verbatim**

The component owns rendering and emits callbacks only. Preserve all current labels, select options, disabled conditions, archive button, and delete button.

- [ ] **7.4 Route schedule-affecting bulk callbacks**

```text
build candidate
on candidate error: toast and retain selection
execute shared mutation
on persistence error: toast and retain selection
on accepted no-op or committed success: clear selection
on committed success: show schedule undo guidance
```

Bulk archive/delete retain existing timer confirmation, archive atomicity, delete confirmation, and catalog backup behavior.

- [ ] **7.5 Run GREEN and commit**

```bash
npm test -- src/lib/course-manager-ui-regression.test.ts src/lib/schedule-candidates.test.ts src/lib/schedule-operations-integration.test.ts
npm run typecheck
git add src/components/course-manager/BulkActionsBar.tsx src/components/CourseManagerModal.tsx src/lib/course-manager-ui-regression.test.ts src/lib/schedule-operations-integration.test.ts
git commit -m "feat: make Course Manager bulk schedule edits atomic"
```

---

### Task 8: Complete presentation decomposition and preserve catalog-only boundaries

**Files:**
- Create: `src/components/course-manager/SubjectListPane.tsx`
- Create: `src/components/course-manager/SubjectWorkspace.tsx`
- Create: `src/components/course-manager/SubjectHeader.tsx`
- Modify: `src/components/CourseManagerModal.tsx`
- Modify: `src/lib/course-manager-ui-regression.test.ts`
- Modify only if necessary: `src/lib/schedule-catalog-hook-regression.test.ts`

- [ ] **8.1 Write RED boundary regressions**

Assert:

```text
presentation units import no storage helper, candidate builder, or controller implementation
search/filter/sort/selection controls remain
archive view and restore actions remain
mobile back navigation remains
Add Lesson remains
Focus Timer confirmation remains
catalog undo label is Hoàn tác thay đổi danh mục gần nhất
schedule undo label is Hoàn tác thay đổi lịch
archive/delete/import/Add Lesson produce no schedule mutation kind
```

- [ ] **8.2 Commit RED**

```bash
npm test -- src/lib/course-manager-ui-regression.test.ts
git add src/lib/course-manager-ui-regression.test.ts
git commit -m "test: lock Course Manager decomposition boundaries"
```

- [ ] **8.3 Extract presentation units**

```text
SubjectListPane: creation fields, subject search, active/archive tabs, subject cards, archived restore cards, catalog backup button
SubjectHeader: current summary and menu
SubjectWorkspace: mobile back button, header slot, filter/sort/selection controls, schedule undo button, bulk slot, topic list, empty states
CourseManagerModal: modal state, selected subject, editor/topic/delete orchestration, timer confirmation, catalog-vs-schedule routing
```

- [ ] **8.4 Add the shared schedule undo button**

The button calls only `scheduleTransactions.undoLastMutation()` and is disabled when `scheduleTransactions.canUndo` is false. Keep the catalog backup restore button separate and rename it exactly `Hoàn tác thay đổi danh mục gần nhất`.

- [ ] **8.5 Verify catalog-only invalidation behavior**

After any successful catalog-only publication, allow the shared hook's existing `shouldInvalidateScheduleHistory` comparison to clear stale history. Do not mark catalog-only publications as expected schedule publications.

- [ ] **8.6 Run GREEN and commit**

```bash
npm test -- src/lib/course-manager-ui-regression.test.ts src/lib/course-manager-transaction-owner-regression.test.ts src/lib/schedule-catalog-hook-regression.test.ts src/lib/catalog-order-drag-regression.test.ts
npm run typecheck
git add src/components/course-manager/SubjectListPane.tsx src/components/course-manager/SubjectWorkspace.tsx src/components/course-manager/SubjectHeader.tsx src/components/CourseManagerModal.tsx src/lib/course-manager-ui-regression.test.ts src/lib/schedule-catalog-hook-regression.test.ts
git commit -m "refactor: decompose Course Manager presentation"
```

---

### Task 9: Full verification, evidence, and review handoff

**Files:**
- Create: `docs/superpowers/evidence/2026-08-06-smart-planner-p1d-course-manager-transactions-completion.md`
- Modify production/test files only when a demonstrated regression requires a focused fix.

- [ ] **9.1 Run focused tests**

```bash
npm test -- src/lib/course-manager-transaction-owner-regression.test.ts src/lib/course-manager-model.test.ts src/lib/course-manager-ui-regression.test.ts src/lib/catalog-order-drag-regression.test.ts src/lib/flexible-planner-transactions-regression.test.ts src/lib/schedule-candidates.test.ts src/lib/schedule-transactions.test.ts src/lib/schedule-mutation-controller.test.ts src/lib/schedule-operations-integration.test.ts src/lib/schedule-persistence.test.ts
```

Expected: all PASS.

- [ ] **9.2 Run exact-head repository gates**

```bash
npm run typecheck
npm run lint
npm test
npm run build
git diff --exit-code
```

Record exact test-file count, test count, workflow run ID, job ID, checked-out ref, build outputs, and any pre-existing warnings.

- [ ] **9.3 Audit scope**

```bash
git diff --name-status ceeee84682c55c663d09a6b171227a1d92171046...HEAD
git diff --stat ceeee84682c55c663d09a6b171227a1d92171046...HEAD
git log --oneline --decorate ceeee84682c55c663d09a6b171227a1d92171046..HEAD
```

Reject or separately justify any file outside the locked maps and the spec/plan/evidence documents.

- [ ] **9.4 Write completion evidence**

The evidence document records:

```text
exact predecessor
literal output of git rev-parse HEAD after the final source commit
branch name
status IMPLEMENTED / REVIEW_PENDING / NOT_ACCEPTED / NOT_MERGED
all RED commits/runs and exact expected failure reasons
final GREEN run and test/build counts
exact changed-file list
criteria 1–25 with concrete PASS or FAIL evidence
pre-existing non-blocking observations
governance confirmation
```

Do not write an angle-bracket SHA marker. Run `git rev-parse HEAD` and paste its literal 40-character output before committing the evidence.

- [ ] **9.5 Commit evidence**

```bash
git add docs/superpowers/evidence/2026-08-06-smart-planner-p1d-course-manager-transactions-completion.md
git commit -m "docs: record P1D Course Manager completion evidence"
```

- [ ] **9.6 Request independent acceptance**

The reviewer verifies exact head, diff, CI logs, review threads, and all 25 criteria. Allowed conclusions:

```text
P1D IMPLEMENTED / ACCEPTED / NOT_MERGED
P1D IMPLEMENTED / REJECTED / NOT_MERGED
```

No merge occurs in Task 9.

## Plan self-review

### Spec coverage

- One owner, one history, one listener, cross-surface undo: Task 1.
- Atomic lesson editor and title-only exception: Tasks 2, 4, and 5.
- Subject/topic/lesson reorder, movement, identity preservation: Tasks 3 and 6.
- Atomic bulk schedule edits: Tasks 3 and 7.
- Pure model and component decomposition: Tasks 4–8.
- Separate catalog and schedule undo paths: Task 8.
- Validation, persistence failure, rollback, no false publication/history: Tasks 2, 3, 5, 7 and existing controller suites.
- Drag, insertion boundary, preview, auto-scroll, keyboard fallback: Task 6.
- Full verification, criteria 1–25, independent acceptance, no merge: Task 9.

No approved criterion is deferred.

### Placeholder scan

The plan contains no `TODO`, `TBD`, angle-bracket implementation value, omitted dependency array, omitted function argument, or ellipsis standing in for required production code. Existing code movement is specified as an exact byte-for-byte copy followed by named edits.

### Type consistency

- `ScheduleTransactionController` is defined in Task 1 and consumed unchanged by both surfaces.
- Mutation kinds added in Task 2 exactly match Tasks 5–7.
- `LessonEditorCandidateInput` from Task 2 matches the editor draft fields in Tasks 4–5.
- Reorder/move/bulk signatures in Task 3 match handlers in Tasks 6–7.
- Catalog-only and schedule-affecting paths remain explicitly disjoint.

### Scope decision

P1D remains one package because transaction ownership and decomposition must land together: ownership movement without decision-boundary extraction leaves the monolith risky, while decomposition without shared candidate/transaction routing preserves the P0B ownership debt.