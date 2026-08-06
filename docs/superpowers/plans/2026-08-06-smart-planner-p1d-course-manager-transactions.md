# Smart Planner P1D Course Manager Transactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route every Course Manager schedule-affecting mutation through the existing shared P0B transaction/undo system while decomposing `CourseManagerModal.tsx` into focused, regression-resistant units without changing catalog identity, scheduler semantics, or persistence schema.

**Architecture:** Move the single `useScheduleTransactions()` owner from `FlexiblePlanner` to the stable Dashboard boundary and pass one controller instance to both Flexible Schedule and Course Manager. Add pure Course Manager candidate builders to `schedule-candidates.ts`, keep catalog-only operations on `updateSubjectsSafely`, and split Course Manager rendering/model/reorder responsibilities under `src/components/course-manager/` while preserving the current UI and behavior.

**Tech Stack:** React 19, TypeScript 5.8, TanStack Start/Router, Radix UI, Tailwind CSS 4, Vitest 4, browser local-storage adapters, existing P0B schedule transaction primitives.

## Global Constraints

- Exact predecessor is `main@ceeee84682c55c663d09a6b171227a1d92171046`.
- Approved design is `docs/superpowers/specs/2026-08-06-smart-planner-p1d-course-manager-transactions-design.md` at commit `448c9ff69944a95229afc9da0fa400539f9185c3`.
- Preserve published Lovable history: no force-push, rebase, amend, squash, or history rewrite.
- Keep the branch in a working state after every GREEN commit.
- One schedule transaction owner, one 20-entry history, and one `Ctrl/Cmd+Z` listener must serve both Flexible Schedule and Course Manager.
- Schedule-affecting mutations use the shared transaction boundary; catalog-only mutations remain on the current catalog persistence/backup path.
- No scheduler, review algorithm, progress schema, catalog schema, Forecast, Roadmap semantics, dependency, lockfile, CI, or deployment configuration changes.
- No new dependency.
- Existing subject, topic, and lesson IDs must be preserved unless an existing create/duplicate operation explicitly creates a new entity.
- Existing canonical order changes only after explicit user reorder or move actions.
- Fixed lessons require a valid date; flexible lessons may use an empty date but reject an invalid non-empty date.
- One combined lesson-editor save creates at most one schedule transaction.
- Bulk schedule-affecting operations are all-or-nothing and create at most one schedule history entry.
- Archive, restore, delete, import, Add Lesson, subject creation/rename/emoji, and topic creation/rename stay outside schedule history.
- Tests remain under `src/lib` because `npm test` runs `vitest run src/lib src/routes/__root.test.tsx`.
- Every behavioral slice requires observable RED evidence before production implementation.
- Final exact-head gates: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `git diff --exit-code`.
- The PR remains draft and unmerged until separate independent acceptance and explicit merge authorization.

---

## Locked File Structure

### Shared schedule transaction ownership

- Create: `src/components/schedule/useScheduleTransactions.ts`
  - Own the shared history, stale-history invalidation, expected-publication tracking, keyboard listener, commit, and undo callbacks.
  - Export `ScheduleTransactionAdapters`, `ScheduleTransactionController`, and `useScheduleTransactions`.
- Delete after migration: `src/components/flexible-planner/useScheduleTransactions.ts`
- Modify: `src/routes/index.tsx`
  - Construct exactly one controller after the route creates transaction adapters.
  - Pass the same object to `FlexiblePlanner` and `CourseManagerModal`.
- Modify: `src/components/FlexiblePlanner.tsx`
  - Consume a controller prop; do not call the shared hook.
- Modify: `src/components/CourseManagerModal.tsx`
  - Consume the same controller and current planner settings.

### Pure mutation/model units

- Modify: `src/lib/schedule-transactions.ts`
  - Add exact mutation kinds required by P1D.
- Modify: `src/lib/schedule-candidates.ts`
  - Add pure Course Manager candidate builders.
- Modify: `src/lib/schedule-candidates.test.ts`
  - Add unit tests for edit, reorder, move, bulk, validation, identity, and no-op semantics.
- Modify: `src/lib/schedule-operations-integration.test.ts`
  - Prove one-entry atomic commit, rollback, and complete undo restoration.
- Create: `src/components/course-manager/course-manager-model.ts`
  - Own pure selectors, statistics, filter/sort, editor draft derivation, and edit classification.
- Create: `src/lib/course-manager-model.test.ts`
  - Test the model through public exports.

### Course Manager presentation and interaction units

- Create: `src/components/course-manager/LessonEditorDialog.tsx`
- Create: `src/components/course-manager/BulkActionsBar.tsx`
- Create: `src/components/course-manager/SubjectListPane.tsx`
- Create: `src/components/course-manager/SubjectWorkspace.tsx`
- Create: `src/components/course-manager/SubjectHeader.tsx`
- Create: `src/components/course-manager/TopicSection.tsx`
- Create: `src/components/course-manager/LessonRow.tsx`
- Create: `src/components/course-manager/useLessonReorder.ts`
- Modify: `src/components/CourseManagerModal.tsx`
  - Retain orchestration, catalog-vs-schedule routing, dialog state, selection state, and timer-impact confirmation.

### Regression tests

- Modify: `src/lib/flexible-planner-transactions-regression.test.ts`
- Modify: `src/lib/catalog-order-drag-regression.test.ts`
- Create: `src/lib/course-manager-transaction-owner-regression.test.ts`
- Create: `src/lib/course-manager-ui-regression.test.ts`
- Modify only when required by exact ownership movement: `src/lib/schedule-catalog-hook-regression.test.ts`

---

### Task 1: Lift the Single Schedule Transaction Owner

**Files:**
- Create: `src/components/schedule/useScheduleTransactions.ts`
- Delete: `src/components/flexible-planner/useScheduleTransactions.ts`
- Modify: `src/routes/index.tsx`
- Modify: `src/components/FlexiblePlanner.tsx`
- Modify: `src/components/CourseManagerModal.tsx`
- Modify: `src/lib/flexible-planner-transactions-regression.test.ts`
- Create: `src/lib/course-manager-transaction-owner-regression.test.ts`

**Interfaces:**
- Consumes: existing `commitScheduleMutation`, `undoLastScheduleMutation`, `ScheduleCandidate`, `ScheduleMutationEntry`, `ScheduleMutationKind`, and route-owned persistence adapters.
- Produces:

```ts
export type ScheduleTransactionController = {
  history: ScheduleMutationEntry[];
  canUndo: boolean;
  lastUndoneEntry: ScheduleMutationEntry | null;
  executeMutation(params: {
    candidate: ScheduleCandidate;
    kind: ScheduleMutationKind;
    description: string;
  }): CommitScheduleMutationResult;
  undoLastMutation(): UndoScheduleMutationResult;
};
```

- [ ] **Step 1: Write the shared-owner RED regression**

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

describe("P1D shared transaction ownership", () => {
  test("Dashboard creates one controller and passes the same object to both surfaces", () => {
    expect(dashboardSource.match(/useScheduleTransactions\(/g)).toHaveLength(1);
    expect(dashboardSource).toContain("const scheduleTransactions = useScheduleTransactions({");
    expect(dashboardSource).toContain("scheduleTransactions={scheduleTransactions}");
    expect(dashboardSource.match(/scheduleTransactions=\{scheduleTransactions\}/g)).toHaveLength(2);
  });

  test("children consume the controller instead of creating histories", () => {
    expect(flexibleSource).not.toContain("useScheduleTransactions({");
    expect(courseManagerSource).not.toContain("useScheduleTransactions({");
    expect(flexibleSource).toContain("scheduleTransactions: ScheduleTransactionController");
    expect(courseManagerSource).toContain("scheduleTransactions: ScheduleTransactionController");
  });

  test("the shared owner installs the only keyboard undo listener", () => {
    expect(sharedHookSource).toContain('window.addEventListener("keydown", handleUndoShortcut)');
    expect(sharedHookSource).toContain("isEditableUndoTarget");
    expect(sharedHookSource).toContain("lastUndoneEntry");
  });
});
```

- [ ] **Step 2: Commit and verify RED**

Run locally when a checkout is available:

```bash
npm test -- src/lib/course-manager-transaction-owner-regression.test.ts
```

Expected: FAIL because `src/components/schedule/useScheduleTransactions.ts` does not exist and Dashboard still delegates ownership to `FlexiblePlanner`.

Connector-only execution: commit only this test, open the draft P1D PR, and verify GitHub Actions fails for this exact missing shared-owner reason while the pre-existing suite remains green.

Commit:

```bash
git add src/lib/course-manager-transaction-owner-regression.test.ts
git commit -m "test: require one P1D schedule transaction owner"
```

- [ ] **Step 3: Create the shared hook with a stable controller type**

Move the existing hook implementation to `src/components/schedule/useScheduleTransactions.ts` and add `lastUndoneEntry`:

```ts
export type ScheduleTransactionController = {
  history: ScheduleMutationEntry[];
  canUndo: boolean;
  lastUndoneEntry: ScheduleMutationEntry | null;
  executeMutation(params: ExecuteScheduleMutationParams): CommitScheduleMutationResult;
  undoLastMutation(): UndoScheduleMutationResult;
};

export function useScheduleTransactions(
  params: UseScheduleTransactionsParams,
): ScheduleTransactionController {
  const [lastUndoneEntry, setLastUndoneEntry] = useState<ScheduleMutationEntry | null>(null);
  // Preserve the existing historyRef, observedSnapshotRef,
  // expectedPublishedSnapshotRef, commit, stale invalidation, and listener logic.

  const undoLastMutation = useCallback(() => {
    const result = undoLastScheduleMutation(/* existing exact writers/current/history */);
    if (result.ok && result.status === "undone") {
      setLastUndoneEntry(result.entry);
      params.onUndoSuccess?.(result.entry);
    }
    // Preserve existing failure handling.
    return result;
  }, [/* exact existing dependencies */]);

  return { history, canUndo: history.length > 0, lastUndoneEntry, executeMutation, undoLastMutation };
}
```

Do not add React context or a second provider; the route passes one plain controller object.

- [ ] **Step 4: Instantiate the hook once in Dashboard**

In `src/routes/index.tsx`, import the shared hook and create it immediately after `scheduleTransactionAdapters`:

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

Pass the same object:

```tsx
<CourseManagerModal
  currentSubjects={subjects}
  onSubjectsUpdated={updateSubjectsSafely}
  plannerSettings={state.plannerSettings}
  scheduleTransactions={scheduleTransactions}
  progress={state}
  activeTimerLessonId={activeTimerLesson?.id ?? null}
  trigger={...}
/>

<FlexiblePlanner
  state={state}
  subjects={subjects}
  scheduleTransactions={scheduleTransactions}
/>
```

- [ ] **Step 5: Convert Flexible Planner to a controller consumer**

Change props:

```ts
type Props = {
  state: ProgressState;
  subjects?: Subject[];
  scheduleTransactions: ScheduleTransactionController;
};
```

Replace the local hook call with:

```ts
const { history, canUndo, executeMutation, undoLastMutation, lastUndoneEntry } =
  scheduleTransactions;

useEffect(() => {
  if (!lastUndoneEntry) return;
  setRecentlyMovedLessonId(null);
  setPendingMoveVisibilityCheck(null);
  setOutsideHorizonNotice(null);
}, [lastUndoneEntry]);
```

Preserve existing move/capacity builders and success notices. Remove only the child-owned hook and duplicate undo callbacks.

- [ ] **Step 6: Add Course Manager props without routing mutations yet**

Extend `CourseManagerModal` props:

```ts
plannerSettings: PlannerSettings;
scheduleTransactions: ScheduleTransactionController;
```

Do not call the controller in this step. This isolates ownership movement from Course Manager behavior changes.

- [ ] **Step 7: Update existing Flexible Planner regression**

Replace assertions that expect the hook inside `FlexiblePlanner` with assertions that:

```ts
expect(plannerSource).toContain("scheduleTransactions: ScheduleTransactionController");
expect(plannerSource).not.toContain("useScheduleTransactions({");
expect(dashboardSource.match(/useScheduleTransactions\(/g)).toHaveLength(1);
expect(dashboardSource.match(/scheduleTransactions=\{scheduleTransactions\}/g)).toHaveLength(2);
```

Update the hook file URL to `../components/schedule/useScheduleTransactions.ts`.

- [ ] **Step 8: Run GREEN verification**

```bash
npm test -- src/lib/course-manager-transaction-owner-regression.test.ts src/lib/flexible-planner-transactions-regression.test.ts src/lib/schedule-transactions.test.ts src/lib/schedule-mutation-controller.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 9: Commit the ownership slice**

```bash
git add src/components/schedule/useScheduleTransactions.ts \
  src/components/flexible-planner/useScheduleTransactions.ts \
  src/routes/index.tsx src/components/FlexiblePlanner.tsx \
  src/components/CourseManagerModal.tsx \
  src/lib/course-manager-transaction-owner-regression.test.ts \
  src/lib/flexible-planner-transactions-regression.test.ts
git commit -m "refactor: share schedule transactions across plan surfaces"
```

---

### Task 2: Add Atomic Lesson Editor Candidates

**Files:**
- Modify: `src/lib/schedule-transactions.ts`
- Modify: `src/lib/schedule-candidates.ts`
- Modify: `src/lib/schedule-candidates.test.ts`
- Modify: `src/lib/schedule-operations-integration.test.ts`

**Interfaces:**
- Produces:

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

- Adds mutation kind: `"edit-lesson"`.

- [ ] **Step 1: Write failing editor-candidate tests**

Append to `src/lib/schedule-candidates.test.ts`:

```ts
describe("buildEditLessonCandidate", () => {
  test("commits title, duration, mode, date and destination as one candidate", () => {
    const current = reorderSnapshot();
    const result = buildEditLessonCandidate({
      current,
      lessonId: "lesson-1",
      input: {
        title: "Bài đã chỉnh",
        subjectId: "target-subject",
        topicId: "target-topic",
        plannedDurationMinutes: 75,
        scheduledDate: "2030-02-03",
        scheduleMode: "fixed",
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    const target = result.candidate.subjects[1].milestones[0].lessons[0];
    expect(target).toMatchObject({
      id: "lesson-1",
      title: "Bài đã chỉnh",
      plannedDurationMinutes: 75,
      scheduledDate: "2030-02-03",
      scheduleMode: "fixed",
      sourceSubject: "Môn đích",
      topic: "Chủ đề B",
    });
    expect(lessonIds(result.candidate.subjects).sort()).toEqual([
      "lesson-1",
      "lesson-2",
      "lesson-3",
    ]);
  });

  test.each([
    ["", 60, "flexible", "", "Tên bài học không được để trống."],
    ["Bài", 0, "flexible", "", "Thời lượng mục tiêu phải từ 1 đến 1440 phút."],
    ["Bài", 1441, "flexible", "", "Thời lượng mục tiêu phải từ 1 đến 1440 phút."],
    ["Bài", 60, "fixed", "", "Bài cố định cần một ngày hợp lệ."],
    ["Bài", 60, "flexible", "2030-02-30", "Ngày bắt đầu linh hoạt không hợp lệ."],
  ])("rejects invalid editor input", (title, minutes, mode, date, error) => {
    const result = buildEditLessonCandidate({
      current: reorderSnapshot(),
      lessonId: "lesson-1",
      input: {
        title,
        subjectId: "source-subject",
        topicId: "source-topic",
        plannedDurationMinutes: minutes,
        scheduledDate: date,
        scheduleMode: mode as LessonScheduleMode,
      },
    });
    expect(result).toEqual({ ok: false, error });
  });

  test("rejects a topic outside the selected subject", () => {
    expect(
      buildEditLessonCandidate({
        current: reorderSnapshot(),
        lessonId: "lesson-1",
        input: {
          title: "Bài",
          subjectId: "source-subject",
          topicId: "target-topic",
          plannedDurationMinutes: 60,
          scheduledDate: "",
          scheduleMode: "flexible",
        },
      }),
    ).toEqual({ ok: false, error: "Vui lòng chọn chủ đề đích hợp lệ." });
  });

  test("returns a detached no-op candidate for an unchanged editor draft", () => {
    const current = reorderSnapshot();
    const source = current.subjects[0].milestones[0].lessons[0];
    const result = buildEditLessonCandidate({
      current,
      lessonId: source.id,
      input: {
        title: source.title,
        subjectId: "source-subject",
        topicId: "source-topic",
        plannedDurationMinutes: source.plannedDurationMinutes,
        scheduledDate: source.scheduledDate,
        scheduleMode: source.scheduleMode ?? "flexible",
      },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.candidate).toEqual(current);
    expect(result.candidate).not.toBe(current);
  });
});
```

- [ ] **Step 2: Verify RED**

```bash
npm test -- src/lib/schedule-candidates.test.ts
```

Expected: FAIL because `buildEditLessonCandidate` and `LessonEditorCandidateInput` do not exist.

Commit the RED test:

```bash
git add src/lib/schedule-candidates.test.ts
git commit -m "test: define atomic Course Manager lesson edits"
```

- [ ] **Step 3: Extend mutation kinds**

In `src/lib/schedule-transactions.ts`:

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

- [ ] **Step 4: Implement `buildEditLessonCandidate`**

Use existing helpers only after validation:

```ts
export function buildEditLessonCandidate(params: {
  current: ScheduleSnapshot;
  lessonId: string;
  input: LessonEditorCandidateInput;
}): ScheduleCandidateBuildResult {
  const current = createScheduleSnapshot(params.current.subjects, params.current.plannerSettings);
  const title = params.input.title.trim();
  if (!title) return { ok: false, error: "Tên bài học không được để trống." };

  const minutes = Math.round(params.input.plannedDurationMinutes);
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 1440) {
    return { ok: false, error: "Thời lượng mục tiêu phải từ 1 đến 1440 phút." };
  }

  const lesson = findLessonById(params.lessonId, current.subjects);
  if (!lesson) return { ok: false, error: "Không tìm thấy bài học để chỉnh sửa." };
  const targetSubject = current.subjects.find((item) => item.id === params.input.subjectId);
  if (!targetSubject) return { ok: false, error: "Vui lòng chọn môn học đích hợp lệ." };
  const targetTopic = targetSubject.milestones.find((item) => item.id === params.input.topicId);
  if (!targetTopic) return { ok: false, error: "Vui lòng chọn chủ đề đích hợp lệ." };

  if (params.input.scheduleMode === "fixed" && !isDateISO(params.input.scheduledDate)) {
    return { ok: false, error: "Bài cố định cần một ngày hợp lệ." };
  }
  if (
    params.input.scheduleMode === "flexible" &&
    params.input.scheduledDate !== "" &&
    !isDateISO(params.input.scheduledDate)
  ) {
    return { ok: false, error: "Ngày bắt đầu linh hoạt không hợp lệ." };
  }

  let subjects = updateLessonDetails(current.subjects, params.lessonId, {
    title,
    plannedDurationMinutes: minutes,
    scheduledDate: params.input.scheduledDate,
    scheduleMode: params.input.scheduleMode,
  });
  subjects = moveLessonsToTopic(
    subjects,
    [params.lessonId],
    targetSubject.id,
    targetTopic.id,
  );

  if (!preservesLessonIdentity(current.subjects, subjects)) {
    return { ok: false, error: "Không thể bảo toàn danh sách bài học khi chỉnh sửa." };
  }

  return {
    ok: true,
    candidate: createScheduleSnapshot(subjects, current.plannerSettings),
  };
}
```

Keep `preservesLessonIdentity` private and reusable by all new builders. Detect duplicate IDs in both previous and candidate catalogs; return false if either set is not unique.

- [ ] **Step 5: Add atomic commit integration test**

Append to `src/lib/schedule-operations-integration.test.ts`:

```ts
test("a combined Course Manager edit creates one entry and undo restores the full snapshot", () => {
  const current = reorderSnapshotForIntegration();
  const built = buildEditLessonCandidate({
    current,
    lessonId: "lesson-1",
    input: {
      title: "Bài chỉnh",
      subjectId: "target-subject",
      topicId: "target-topic",
      plannedDurationMinutes: 90,
      scheduledDate: "2030-02-03",
      scheduleMode: "fixed",
    },
  });
  if (!built.ok) throw new Error(built.error);

  const committed = commitScheduleMutation({
    current,
    candidate: built.candidate,
    history: [],
    kind: "edit-lesson",
    description: "Chỉnh sửa bài Bài chỉnh.",
    saveSubjects: vi.fn(success),
    savePlannerSettings: vi.fn(success),
    backupSubjects: vi.fn(success),
    applyCandidate: vi.fn(),
    idFactory: () => "edit-1",
  });
  expect(committed.ok).toBe(true);
  if (!committed.ok || committed.status !== "committed") throw new Error("Expected commit");
  expect(committed.history).toHaveLength(1);

  let restored: ScheduleCandidate | null = null;
  const undone = undoLastScheduleMutation({
    current: built.candidate,
    history: committed.history,
    saveSubjects: vi.fn(success),
    savePlannerSettings: vi.fn(success),
    applyCandidate: (candidate) => {
      restored = candidate;
    },
  });
  expect(undone.ok).toBe(true);
  expect(restored).toEqual(current);
});
```

Use a local integration fixture equivalent to `reorderSnapshot()`; do not import test-only functions across files.

- [ ] **Step 6: Run GREEN verification**

```bash
npm test -- src/lib/schedule-candidates.test.ts src/lib/schedule-operations-integration.test.ts src/lib/schedule-transactions.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/schedule-transactions.ts src/lib/schedule-candidates.ts \
  src/lib/schedule-candidates.test.ts src/lib/schedule-operations-integration.test.ts
git commit -m "feat: build atomic Course Manager lesson candidates"
```

---

### Task 3: Add Subject, Topic, Move, and Bulk Candidate Builders

**Files:**
- Modify: `src/lib/schedule-candidates.ts`
- Modify: `src/lib/schedule-candidates.test.ts`
- Modify: `src/lib/schedule-operations-integration.test.ts`

**Interfaces:**

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

- [ ] **Step 1: Write RED tests for reorder/move/bulk behavior**

Add tests that explicitly assert:

```ts
test("reorders subjects without changing nested identity", () => {
  const current = reorderSnapshot();
  const result = buildReorderSubjectCandidate({
    current,
    subjectId: "target-subject",
    direction: -1,
  });
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  expect(result.candidate.subjects.map((item) => item.id)).toEqual([
    "target-subject",
    "source-subject",
  ]);
  expect(lessonIds(result.candidate.subjects).sort()).toEqual(lessonIds(current.subjects).sort());
});

test("rejects a bulk fixed-mode change when one lesson lacks a valid date", () => {
  const current = reorderSnapshot();
  current.subjects[0].milestones[0].lessons[0].scheduledDate = "";
  expect(
    buildBulkLessonUpdateCandidate({
      current,
      lessonIds: ["lesson-1", "lesson-2"],
      patch: { scheduleMode: "fixed" },
    }),
  ).toEqual({ ok: false, error: "Mọi bài cố định cần một ngày hợp lệ." });
});

test("moves selected lessons atomically and deduplicates selection IDs", () => {
  const result = buildMoveLessonsCandidate({
    current: reorderSnapshot(),
    lessonIds: ["lesson-1", "lesson-1", "lesson-2"],
    targetSubjectId: "target-subject",
    targetTopicId: "target-topic",
  });
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  expect(result.candidate.subjects[1].milestones[0].lessons.map((item) => item.id)).toEqual([
    "lesson-3",
    "lesson-1",
    "lesson-2",
  ]);
  expect(new Set(lessonIds(result.candidate.subjects)).size).toBe(3);
});

test("rejects the entire move when one selected lesson no longer exists", () => {
  expect(
    buildMoveLessonsCandidate({
      current: reorderSnapshot(),
      lessonIds: ["lesson-1", "missing"],
      targetSubjectId: "target-subject",
    }),
  ).toEqual({ ok: false, error: "Một hoặc nhiều bài học đã chọn không còn tồn tại." });
});
```

Also test topic boundary no-op, empty selection rejection, invalid target, invalid duration, invalid date, exact one-entry bulk commit, and full undo restoration.

- [ ] **Step 2: Verify RED and commit tests**

```bash
npm test -- src/lib/schedule-candidates.test.ts src/lib/schedule-operations-integration.test.ts
```

Expected: FAIL because the new builders do not exist.

```bash
git add src/lib/schedule-candidates.test.ts src/lib/schedule-operations-integration.test.ts
git commit -m "test: define Course Manager reorder and bulk transactions"
```

- [ ] **Step 3: Implement explicit candidate builders**

Rules in implementation:

```ts
function selectedLessonIdsOrError(
  subjects: Subject[],
  lessonIds: Iterable<string>,
): { ok: true; ids: string[] } | { ok: false; error: string } {
  const ids = [...new Set(lessonIds)];
  if (ids.length === 0) return { ok: false, error: "Vui lòng chọn ít nhất một bài học." };
  const existing = new Set(allLessonIds(subjects));
  if (ids.some((id) => !existing.has(id))) {
    return { ok: false, error: "Một hoặc nhiều bài học đã chọn không còn tồn tại." };
  }
  return { ok: true, ids };
}
```

`buildMoveLessonsCandidate`:

- Validate the selected set and target subject.
- When `targetTopicId` is present, validate it belongs to `targetSubjectId` and call `moveLessonsToTopic`.
- When absent, preserve existing product behavior by calling `moveLessonsToSubject`, which appends into the first topic or creates `Toàn bộ bài học` when needed.
- Verify identity before returning.

`buildBulkLessonUpdateCandidate`:

- Normalize duration with `Math.round`, enforce `1..1440`.
- Validate a supplied date with `isDateISO`, except empty string is allowed only when every resulting mode is flexible.
- Compute every lesson's resulting mode/date before applying anything.
- Reject the complete operation if any resulting fixed lesson lacks a valid date.
- Apply one immutable pass; preserve unrelated fields and placement provenance semantics through `updateLessonDetails` per selected lesson rather than `updateLessonsDetails`, because the current bulk helper does not reliably assign `scheduleMode`.
- Return detached no-op candidates.

`buildReorderSubjectCandidate` and `buildReorderTopicCandidate`:

- Validate source IDs.
- Treat first/last boundary moves as no-op detached snapshots.
- Use existing `reorderSubject` and `reorderTopic` helpers.
- Verify all subject/topic/lesson IDs remain unique and complete.

- [ ] **Step 4: Run GREEN verification**

```bash
npm test -- src/lib/schedule-candidates.test.ts src/lib/schedule-operations-integration.test.ts src/lib/schedule-mutation-controller.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/schedule-candidates.ts src/lib/schedule-candidates.test.ts \
  src/lib/schedule-operations-integration.test.ts
git commit -m "feat: add Course Manager reorder and bulk candidates"
```

---

### Task 4: Extract and Test the Course Manager Model

**Files:**
- Create: `src/components/course-manager/course-manager-model.ts`
- Create: `src/lib/course-manager-model.test.ts`
- Modify: `src/components/CourseManagerModal.tsx`

**Interfaces:**

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
export function deriveSubjectStats(subject: Subject, minutesByLesson: Map<string, number>, progress?: ProgressState): SubjectStats;
export function filterAndSortMilestones(params: {...}): Milestone[];
export function createLessonEditorDraft(params: { subjects: Subject[]; lesson: Lesson }): LessonEditorDraft | null;
export function classifyLessonEdit(params: {
  lesson: Lesson;
  ownerSubjectId: string;
  ownerTopicId: string;
  draft: LessonEditorDraft;
}): "noop" | "catalog-only" | "schedule-affecting";
```

- [ ] **Step 1: Write model RED tests**

Create `src/lib/course-manager-model.test.ts` with concrete fixtures and assertions:

```ts
import { describe, expect, test } from "vitest";
import {
  buildMinutesByLesson,
  classifyLessonEdit,
  createLessonEditorDraft,
  filterAndSortMilestones,
} from "../components/course-manager/course-manager-model";

describe("Course Manager model", () => {
  test("classifies title-only edits as catalog-only", () => {
    const { lesson, draft } = fixture();
    expect(
      classifyLessonEdit({
        lesson,
        ownerSubjectId: "subject-a",
        ownerTopicId: "topic-a",
        draft: { ...draft, title: "Tên mới" },
      }),
    ).toBe("catalog-only");
  });

  test("classifies destination, duration, date or mode changes as schedule-affecting", () => {
    const { lesson, draft } = fixture();
    expect(
      classifyLessonEdit({
        lesson,
        ownerSubjectId: "subject-a",
        ownerTopicId: "topic-a",
        draft: { ...draft, minutes: draft.minutes + 30 },
      }),
    ).toBe("schedule-affecting");
  });

  test("keeps roadmap order when sort is roadmap", () => {
    const result = filterAndSortMilestones({
      subject: fixtureSubject(),
      search: "",
      filter: "all",
      sort: "roadmap",
      minutesByLesson: new Map(),
      completedLessons: {},
    });
    expect(result.flatMap((topic) => topic.lessons.map((lesson) => lesson.id))).toEqual([
      "lesson-b",
      "lesson-a",
    ]);
  });
});
```

Add tests for completion derived from explicit completion or accumulated minutes, unscheduled filtering, date/name/progress/remaining sorts, and draft ownership resolution.

- [ ] **Step 2: Verify RED and commit**

```bash
npm test -- src/lib/course-manager-model.test.ts
```

Expected: FAIL because the model file does not exist.

```bash
git add src/lib/course-manager-model.test.ts
git commit -m "test: define Course Manager view model semantics"
```

- [ ] **Step 3: Implement the pure model**

Move these exact responsibilities out of `CourseManagerModal.tsx`:

- `allLessons` remains exported or private in the model.
- minutes-by-lesson aggregation.
- subject statistics.
- lesson ownership lookup.
- filter/sort projection.
- draft creation.
- edit classification.

`filterAndSortMilestones` must clone only the milestone/lesson arrays required for the projection and must never mutate or reorder `subject.milestones` or the original lesson arrays.

`classifyLessonEdit` comparison:

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

- [ ] **Step 4: Replace inline model logic in the modal**

Import the model functions/types and delete duplicate inline implementations. Do not change rendering or mutation routing yet.

- [ ] **Step 5: Run GREEN verification**

```bash
npm test -- src/lib/course-manager-model.test.ts src/lib/catalog-order-drag-regression.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/course-manager/course-manager-model.ts \
  src/lib/course-manager-model.test.ts src/components/CourseManagerModal.tsx
git commit -m "refactor: extract Course Manager model"
```

---

### Task 5: Extract the Lesson Editor and Route Atomic Saves

**Files:**
- Create: `src/components/course-manager/LessonEditorDialog.tsx`
- Modify: `src/components/CourseManagerModal.tsx`
- Create: `src/lib/course-manager-ui-regression.test.ts`

**Interfaces:**

```ts
type LessonEditorDialogProps = {
  open: boolean;
  subjects: Subject[];
  draft: LessonEditorDraft;
  onDraftChange(draft: LessonEditorDraft): void;
  onOpenChange(open: boolean): void;
  onSubmit(): boolean;
};
```

- [ ] **Step 1: Write editor-routing RED regression**

Create `src/lib/course-manager-ui-regression.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const modalSource = readFileSync(
  new URL("../components/CourseManagerModal.tsx", import.meta.url),
  "utf8",
);
const editorSource = readFileSync(
  new URL("../components/course-manager/LessonEditorDialog.tsx", import.meta.url),
  "utf8",
);

describe("Course Manager editor ownership", () => {
  test("the dialog owns fields but no catalog persistence", () => {
    expect(editorSource).toContain("export function LessonEditorDialog");
    expect(editorSource).toContain("onSubmit");
    expect(editorSource).not.toContain("updateLessonDetails");
    expect(editorSource).not.toContain("executeMutation");
    expect(editorSource).not.toContain("saveStoredCustomSubjects");
  });

  test("the modal classifies title-only and schedule-affecting edits", () => {
    expect(modalSource).toContain("classifyLessonEdit({");
    expect(modalSource).toContain('classification === "catalog-only"');
    expect(modalSource).toContain('classification === "schedule-affecting"');
    expect(modalSource).toContain("buildEditLessonCandidate({");
    expect(modalSource).toContain('kind: "edit-lesson"');
  });

  test("editor closure follows successful persistence", () => {
    expect(modalSource).toContain("if (!result.ok) return false;");
    expect(modalSource).toContain("setEditingLesson(null)");
  });
});
```

- [ ] **Step 2: Verify RED and commit**

```bash
npm test -- src/lib/course-manager-ui-regression.test.ts
```

Expected: FAIL because `LessonEditorDialog.tsx` does not exist and the modal does not route candidates.

```bash
git add src/lib/course-manager-ui-regression.test.ts
git commit -m "test: require atomic Course Manager editor routing"
```

- [ ] **Step 3: Extract the editor UI verbatim**

Move the existing lesson edit dialog markup into `LessonEditorDialog.tsx`. Preserve:

- all existing Vietnamese labels;
- 30/45/60/90/120 quick buttons;
- numeric `min={1}` and `max={1440}`;
- subject and topic selects;
- fixed/flexible descriptions;
- date clear button;
- cancellation behavior;
- accessible labels.

The submit button calls `onSubmit()` and does not close itself. `onOpenChange(false)` remains available for user cancellation only.

- [ ] **Step 4: Route modal save behavior by classification**

Implement:

```ts
const saveLesson = () => {
  if (!editingLesson || !editingLessonOwner) return false;
  const classification = classifyLessonEdit({
    lesson: editingLesson,
    ownerSubjectId: editingLessonOwner.subjectId,
    ownerTopicId: editingLessonOwner.topicId,
    draft: lessonDraft,
  });

  if (classification === "noop") {
    setEditingLesson(null);
    return true;
  }

  if (classification === "catalog-only") {
    const next = updateLessonDetails(currentSubjects, editingLesson.id, {
      title: lessonDraft.title,
    });
    if (!apply(next, `Đã cập nhật bài “${lessonDraft.title.trim()}”.`)) return false;
    setEditingLesson(null);
    return true;
  }

  const built = buildEditLessonCandidate({
    current: createScheduleSnapshot(currentSubjects, plannerSettings),
    lessonId: editingLesson.id,
    input: {
      title: lessonDraft.title,
      subjectId: lessonDraft.subjectId,
      topicId: lessonDraft.topicId,
      plannedDurationMinutes: lessonDraft.minutes,
      scheduledDate: lessonDraft.date,
      scheduleMode: lessonDraft.scheduleMode,
    },
  });
  if (!built.ok) {
    toast.error(built.error);
    return false;
  }

  const result = scheduleTransactions.executeMutation({
    candidate: built.candidate,
    kind: "edit-lesson",
    description: `Chỉnh sửa bài “${lessonDraft.title.trim()}”.`,
  });
  if (!result.ok) {
    toast.error(result.rollbackError ? `${result.error} ${result.rollbackError}` : result.error);
    return false;
  }
  if (result.status === "committed") {
    toast.success(`Đã cập nhật bài “${lessonDraft.title.trim()}”.`, {
      description: "Nhấn Ctrl+Z để hoàn tác thay đổi lịch.",
    });
  }
  setEditingLesson(null);
  return true;
};
```

Do not clear editor state on validation or persistence failure.

- [ ] **Step 5: Run GREEN verification**

```bash
npm test -- src/lib/course-manager-ui-regression.test.ts src/lib/course-manager-model.test.ts src/lib/schedule-candidates.test.ts src/lib/schedule-operations-integration.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/course-manager/LessonEditorDialog.tsx \
  src/components/CourseManagerModal.tsx src/lib/course-manager-ui-regression.test.ts
git commit -m "feat: route Course Manager lesson edits atomically"
```

---

### Task 6: Route Reorder Actions Through Shared Transactions

**Files:**
- Create: `src/components/course-manager/useLessonReorder.ts`
- Create: `src/components/course-manager/LessonRow.tsx`
- Create: `src/components/course-manager/TopicSection.tsx`
- Modify: `src/components/CourseManagerModal.tsx`
- Modify: `src/lib/catalog-order-drag-regression.test.ts`
- Modify: `src/lib/course-manager-ui-regression.test.ts`

**Interfaces:**

```ts
export type LessonDropTarget = {
  subjectId: string;
  topicId: string;
  beforeLessonId: string | null;
};

export function useLessonReorder(): {
  draggedLessonId: string | null;
  dragArmedLessonId: string | null;
  dropIndicator: { lessonId: string; edge: "before" | "after" } | null;
  beginDrag(event: DragEvent<HTMLElement>, lesson: Lesson): void;
  updateDropIndicator(event: DragEvent<HTMLElement>, lessonId: string): void;
  clearDrag(): void;
  buildDropTarget(params: {...}): LessonDropTarget | null;
};
```

- [ ] **Step 1: Update drag regression to target extracted units and require transaction routing**

Modify `catalog-order-drag-regression.test.ts` to read:

```ts
const rowSource = await fs.readFile(
  new URL("../components/course-manager/LessonRow.tsx", import.meta.url),
  "utf8",
);
const reorderSource = await fs.readFile(
  new URL("../components/course-manager/useLessonReorder.ts", import.meta.url),
  "utf8",
);
const modalSource = await fs.readFile(
  new URL("../components/CourseManagerModal.tsx", import.meta.url),
  "utf8",
);

expect(rowSource).toContain("Kéo một lần bằng tay cầm để đổi vị trí");
expect(rowSource).toContain("application/x-smart-lesson-id");
expect(reorderSource).toContain("setDragImage");
expect(rowSource).toContain("Chèn phía trên");
expect(rowSource).toContain("Chèn phía dưới");
expect(reorderSource).toContain("autoScrollDuringLessonDrag");
expect(rowSource).toContain("data-course-scroll-container");
expect(modalSource).toContain("buildReorderLessonCandidate({");
expect(modalSource).toContain('kind: "reorder-lesson"');
```

Add source assertions for subject/topic reorder candidate builders and mutation kinds.

- [ ] **Step 2: Verify RED and commit**

```bash
npm test -- src/lib/catalog-order-drag-regression.test.ts src/lib/course-manager-ui-regression.test.ts
```

Expected: FAIL because extracted units and transaction routing do not exist.

```bash
git add src/lib/catalog-order-drag-regression.test.ts src/lib/course-manager-ui-regression.test.ts
git commit -m "test: require transactional Course Manager reordering"
```

- [ ] **Step 3: Extract drag mechanics without mutation ownership**

Move these mechanics to `useLessonReorder.ts`:

- `autoScrollDuringLessonDrag`;
- drag preview creation;
- dragged/armed/drop-indicator state;
- before/after edge calculation;
- cleanup.

The hook returns an explicit target only. It must not import `schedule-candidates`, transaction controllers, storage, or toast.

- [ ] **Step 4: Extract `LessonRow` and `TopicSection`**

Preserve all existing UI behavior:

- progress badge and bar;
- checkbox selection mode;
- dedicated drag handle;
- up/down buttons;
- edit button;
- move/duplicate/archive/delete dropdown;
- topic collapse and menu;
- reorder disabled while search/filter/non-roadmap sort is active;
- insertion line labels;
- mobile wrapping and accessible labels.

These components receive callbacks and never build candidates.

- [ ] **Step 5: Route subject/topic/lesson reorder through shared candidates**

Add modal helpers:

```ts
const commitScheduleCandidate = (
  built: ScheduleCandidateBuildResult,
  kind: ScheduleMutationKind,
  description: string,
): boolean => {
  if (!built.ok) {
    toast.error(built.error);
    return false;
  }
  const result = scheduleTransactions.executeMutation({
    candidate: built.candidate,
    kind,
    description,
  });
  if (!result.ok) {
    toast.error(result.rollbackError ? `${result.error} ${result.rollbackError}` : result.error);
    return false;
  }
  if (result.status === "committed") {
    toast.success(description, { description: "Nhấn Ctrl+Z để hoàn tác thay đổi lịch." });
  }
  return true;
};
```

Use:

```ts
buildReorderSubjectCandidate({ current: snapshot, subjectId, direction })
buildReorderTopicCandidate({ current: snapshot, subjectId, topicId, direction })
buildReorderLessonCandidate({ current: snapshot, lessonId, target })
```

Do not call `reorderSubject`, `reorderTopic`, `reorderLesson`, or `moveLessonBeforeInTopic` directly from JSX handlers after this task.

- [ ] **Step 6: Run GREEN verification**

```bash
npm test -- src/lib/catalog-order-drag-regression.test.ts src/lib/course-manager-ui-regression.test.ts src/lib/schedule-candidates.test.ts src/lib/schedule-operations-integration.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/course-manager/useLessonReorder.ts \
  src/components/course-manager/LessonRow.tsx \
  src/components/course-manager/TopicSection.tsx \
  src/components/CourseManagerModal.tsx \
  src/lib/catalog-order-drag-regression.test.ts \
  src/lib/course-manager-ui-regression.test.ts
git commit -m "feat: route Course Manager reorder through shared history"
```

---

### Task 7: Extract Bulk Actions and Route Atomic Bulk Mutations

**Files:**
- Create: `src/components/course-manager/BulkActionsBar.tsx`
- Modify: `src/components/CourseManagerModal.tsx`
- Modify: `src/lib/course-manager-ui-regression.test.ts`
- Modify: `src/lib/schedule-operations-integration.test.ts`

**Interfaces:**

```ts
type BulkActionsBarProps = {
  selectedCount: number;
  subjects: Subject[];
  selectedSubject: Subject;
  targetSubjectId: string;
  targetTopicId: string;
  date: string;
  scheduleMode: LessonScheduleMode;
  minutes: number;
  onTargetSubjectChange(value: string): void;
  onTargetTopicChange(value: string): void;
  onDateChange(value: string): void;
  onScheduleModeChange(value: LessonScheduleMode): void;
  onMinutesChange(value: number): void;
  onMoveToSubject(): void;
  onMoveToTopic(): void;
  onApplyDate(): void;
  onApplyScheduleMode(): void;
  onApplyMinutes(): void;
  onArchive(): void;
  onDelete(): void;
};
```

- [ ] **Step 1: Add RED UI and integration assertions**

Require the modal to contain:

```ts
expect(modalSource).toContain("buildMoveLessonsCandidate({");
expect(modalSource).toContain("buildBulkLessonUpdateCandidate({");
expect(modalSource).toContain('kind: "move-lessons"');
expect(modalSource).toContain('kind: "bulk-schedule-update"');
expect(modalSource).toContain("if (!succeeded) return;");
expect(modalSource).toContain("clearSelection();");
```

In integration tests, assert one bulk candidate commit creates one history entry and a failed writer does not clear/publish history.

- [ ] **Step 2: Verify RED and commit**

```bash
npm test -- src/lib/course-manager-ui-regression.test.ts src/lib/schedule-operations-integration.test.ts
```

Expected: FAIL because bulk handlers still use direct catalog helpers.

```bash
git add src/lib/course-manager-ui-regression.test.ts src/lib/schedule-operations-integration.test.ts
git commit -m "test: require atomic Course Manager bulk schedule edits"
```

- [ ] **Step 3: Extract `BulkActionsBar` verbatim**

Preserve all existing controls, labels, disabled states, and archive/delete actions. The component only emits callbacks.

- [ ] **Step 4: Route schedule-affecting bulk actions**

Implement one helper that clears selection only after successful commit:

```ts
const commitBulkScheduleMutation = (
  built: ScheduleCandidateBuildResult,
  kind: "move-lessons" | "bulk-schedule-update",
  description: string,
): boolean => {
  const succeeded = commitScheduleCandidate(built, kind, description);
  if (!succeeded) return false;
  clearSelection();
  return true;
};
```

Map actions:

- move subject → `buildMoveLessonsCandidate({ targetSubjectId })`;
- move topic → `buildMoveLessonsCandidate({ targetSubjectId: selectedSubject.id, targetTopicId })`;
- date → `buildBulkLessonUpdateCandidate({ patch: { scheduledDate: bulkDate } })`;
- mode → `buildBulkLessonUpdateCandidate({ patch: { scheduleMode: bulkScheduleMode } })`;
- duration → `buildBulkLessonUpdateCandidate({ patch: { plannedDurationMinutes: bulkMinutes } })`.

Keep bulk archive and delete on the current catalog path with timer confirmation and existing archive/delete semantics.

- [ ] **Step 5: Run GREEN verification**

```bash
npm test -- src/lib/course-manager-ui-regression.test.ts src/lib/schedule-candidates.test.ts src/lib/schedule-operations-integration.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/course-manager/BulkActionsBar.tsx \
  src/components/CourseManagerModal.tsx \
  src/lib/course-manager-ui-regression.test.ts \
  src/lib/schedule-operations-integration.test.ts
git commit -m "feat: make Course Manager bulk schedule edits atomic"
```

---

### Task 8: Complete Presentation Decomposition and Preserve Catalog-Only Boundaries

**Files:**
- Create: `src/components/course-manager/SubjectListPane.tsx`
- Create: `src/components/course-manager/SubjectWorkspace.tsx`
- Create: `src/components/course-manager/SubjectHeader.tsx`
- Modify: `src/components/CourseManagerModal.tsx`
- Modify: `src/lib/course-manager-ui-regression.test.ts`
- Modify if required: `src/lib/schedule-catalog-hook-regression.test.ts`

**Interfaces:**
- Presentation components consume data and callbacks only.
- No presentation component imports storage helpers, `schedule-mutation-controller`, or `schedule-candidates`.

- [ ] **Step 1: Add decomposition and boundary RED assertions**

Extend `course-manager-ui-regression.test.ts`:

```ts
const subjectListSource = readFileSync(
  new URL("../components/course-manager/SubjectListPane.tsx", import.meta.url),
  "utf8",
);
const workspaceSource = readFileSync(
  new URL("../components/course-manager/SubjectWorkspace.tsx", import.meta.url),
  "utf8",
);

for (const source of [subjectListSource, workspaceSource, editorSource]) {
  expect(source).not.toContain("saveStoredCustomSubjects");
  expect(source).not.toContain("commitScheduleMutation");
  expect(source).not.toContain("executeMutation");
}

expect(modalSource).toContain("Hoàn tác thay đổi danh mục gần nhất");
expect(modalSource).toContain("Hoàn tác thay đổi lịch");
expect(modalSource).toContain("archiveSubject(");
expect(modalSource).toContain("removeSubjectFromSubjects(");
expect(modalSource).not.toContain('kind: "archive"');
expect(modalSource).not.toContain('kind: "delete"');
```

Also preserve source-level markers for search, filter, sort, selection, archive view, mobile back navigation, Add Lesson, and Focus Timer confirmation.

- [ ] **Step 2: Verify RED and commit**

```bash
npm test -- src/lib/course-manager-ui-regression.test.ts
```

Expected: FAIL because remaining presentation units are not extracted and labels are not distinct.

```bash
git add src/lib/course-manager-ui-regression.test.ts
git commit -m "test: lock Course Manager decomposition boundaries"
```

- [ ] **Step 3: Extract presentation units**

`SubjectListPane` owns:

- create-subject controls;
- subject search;
- active/archive tabs;
- active subject cards;
- archived restore cards;
- catalog backup restore button.

`SubjectHeader` owns the existing subject summary and menu rendering.

`SubjectWorkspace` owns:

- mobile back button;
- header slot;
- search/filter/sort/selection controls;
- bulk bar slot;
- topic list;
- empty states.

All mutation decisions remain in `CourseManagerModal` callbacks.

- [ ] **Step 4: Distinguish undo labels and preserve catalog-only routes**

Rename the existing catalog backup button to:

```text
Hoàn tác thay đổi danh mục gần nhất
```

Add an explicit schedule undo button in Course Manager near the top-level workspace controls:

```tsx
<Button
  type="button"
  variant="ghost"
  className="rounded-xl text-xs"
  disabled={!scheduleTransactions.canUndo}
  onClick={() => scheduleTransactions.undoLastMutation()}
>
  <Undo2 className="h-4 w-4" /> Hoàn tác thay đổi lịch
</Button>
```

Do not add a second undo implementation. The button calls the shared controller.

Keep these actions on `apply`/existing catalog helpers:

- subject create/rename/emoji;
- topic create/rename;
- archive/restore;
- delete subject/topic/lesson;
- duplicate lesson;
- export;
- Add Lesson.

An external catalog-only publication is expected to invalidate schedule history through the shared hook's existing `shouldInvalidateScheduleHistory` behavior. Do not bypass it with an expected-published marker.

- [ ] **Step 5: Run focused GREEN verification**

```bash
npm test -- src/lib/course-manager-ui-regression.test.ts \
  src/lib/course-manager-transaction-owner-regression.test.ts \
  src/lib/schedule-catalog-hook-regression.test.ts \
  src/lib/catalog-order-drag-regression.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/course-manager/SubjectListPane.tsx \
  src/components/course-manager/SubjectWorkspace.tsx \
  src/components/course-manager/SubjectHeader.tsx \
  src/components/CourseManagerModal.tsx \
  src/lib/course-manager-ui-regression.test.ts \
  src/lib/schedule-catalog-hook-regression.test.ts
git commit -m "refactor: decompose Course Manager presentation"
```

---

### Task 9: Exact-Scope Regression Audit and Completion Evidence

**Files:**
- Modify only if a real regression is found: focused files from Tasks 1–8.
- Create: `docs/superpowers/evidence/2026-08-06-smart-planner-p1d-course-manager-transactions-completion.md`

**Interfaces:**
- Produces exact implementation-head evidence for independent acceptance.

- [ ] **Step 1: Run all focused suites**

```bash
npm test -- \
  src/lib/course-manager-transaction-owner-regression.test.ts \
  src/lib/course-manager-model.test.ts \
  src/lib/course-manager-ui-regression.test.ts \
  src/lib/catalog-order-drag-regression.test.ts \
  src/lib/flexible-planner-transactions-regression.test.ts \
  src/lib/schedule-candidates.test.ts \
  src/lib/schedule-transactions.test.ts \
  src/lib/schedule-mutation-controller.test.ts \
  src/lib/schedule-operations-integration.test.ts \
  src/lib/schedule-persistence.test.ts
```

Expected: all PASS.

- [ ] **Step 2: Run full repository gates**

```bash
npm run typecheck
npm run lint
npm test
npm run build
git diff --exit-code
```

Expected:

- typecheck PASS;
- lint 0 new errors; pre-existing warnings reported separately;
- all test files and tests PASS;
- client, SSR, Nitro, and Vercel-target production build PASS;
- clean tree after build PASS.

- [ ] **Step 3: Audit exact changed-file scope**

```bash
git diff --name-status ceeee84682c55c663d09a6b171227a1d92171046...HEAD
git diff --stat ceeee84682c55c663d09a6b171227a1d92171046...HEAD
```

Reject or justify any file outside:

```text
docs/superpowers/plans/2026-08-06-smart-planner-p1d-course-manager-transactions.md
docs/superpowers/specs/2026-08-06-smart-planner-p1d-course-manager-transactions-design.md
docs/superpowers/evidence/2026-08-06-smart-planner-p1d-course-manager-transactions-completion.md
src/components/CourseManagerModal.tsx
src/components/FlexiblePlanner.tsx
src/components/schedule/useScheduleTransactions.ts
src/components/flexible-planner/useScheduleTransactions.ts (deletion)
src/components/course-manager/*.tsx
src/components/course-manager/*.ts
src/routes/index.tsx
src/lib/schedule-transactions.ts
src/lib/schedule-candidates.ts
src/lib/schedule-candidates.test.ts
src/lib/schedule-operations-integration.test.ts
src/lib/flexible-planner-transactions-regression.test.ts
src/lib/catalog-order-drag-regression.test.ts
src/lib/schedule-catalog-hook-regression.test.ts
src/lib/course-manager-transaction-owner-regression.test.ts
src/lib/course-manager-model.test.ts
src/lib/course-manager-ui-regression.test.ts
```

No scheduler, review, Forecast, Roadmap, package, lockfile, workflow, or deployment file is allowed without a separately documented blocking reason and owner approval.

- [ ] **Step 4: Review all 25 acceptance criteria**

The completion evidence must include a table with criteria 1–25 from the approved spec and one of:

- `PASS — <specific file/test/evidence>`;
- `FAIL — <specific unresolved defect>`.

Do not mark the package accepted during self-review. The status before independent acceptance is:

```text
P1D IMPLEMENTED / REVIEW_PENDING / NOT_ACCEPTED / NOT_MERGED
```

- [ ] **Step 5: Write completion evidence**

The evidence document must record:

```markdown
# P1D Course Manager Transactions Completion Evidence

- Exact predecessor: `ceeee84682c55c663d09a6b171227a1d92171046`
- Exact implementation head: `<HEAD SHA captured after the final source commit>`
- Branch: `improve/p1d-course-manager-transactions`
- Status: `IMPLEMENTED / REVIEW_PENDING / NOT_ACCEPTED / NOT_MERGED`

## TDD evidence
- Shared-owner RED run/commit and exact failure reason.
- Editor-candidate RED run/commit and exact failure reason.
- Reorder/bulk RED run/commit and exact failure reason.
- UI-decomposition RED run/commit and exact failure reason.
- Final GREEN workflow run, job ID, checkout ref, test counts, and build result.

## Scope evidence
- Exact changed-file list.
- Confirmation that no scheduler, review, Forecast, Roadmap, schema, dependency, lockfile, workflow, or deployment configuration changed.

## Acceptance mapping
- Criteria 1–25 with concrete evidence.

## Existing non-blocking observations
- Preserve and distinguish pre-existing warnings/advisories from P1D regressions.

## Governance
- Draft PR remains unmerged.
- No squash, rebase, amend, force-push, auto-merge, branch deletion, or automatic merge.
```

Replace the angle-bracket SHA instruction with the actual exact SHA before committing the evidence. It must not remain as a placeholder.

- [ ] **Step 6: Commit evidence**

```bash
git add docs/superpowers/evidence/2026-08-06-smart-planner-p1d-course-manager-transactions-completion.md
git commit -m "docs: record P1D Course Manager completion evidence"
```

- [ ] **Step 7: Request independent review**

Independent review must verify the exact head against:

- the approved design spec;
- this implementation plan;
- exact diff and changed-file scope;
- GitHub Actions logs;
- all 25 acceptance criteria;
- unresolved review threads and Critical/Important findings.

The reviewer may change status only to:

```text
P1D IMPLEMENTED / ACCEPTED / NOT_MERGED
```

or:

```text
P1D IMPLEMENTED / REJECTED / NOT_MERGED
```

A later regular merge commit requires a separate explicit owner command.

---

## Plan Self-Review Record

### Spec coverage

- Shared owner and cross-surface history: Task 1.
- Atomic editor candidate and one-entry undo: Task 2 and Task 5.
- Subject/topic/lesson reorder, moves, and bulk all-or-nothing: Task 3, Task 6, and Task 7.
- Pure model extraction and stable filter/sort/statistics: Task 4.
- Presentation decomposition and no persistence in child components: Task 5–Task 8.
- Separate catalog and schedule undo labels: Task 8.
- Catalog-only archive/delete/import/Add Lesson boundaries: Task 8.
- Failure, rollback, no publication, no history, full snapshot undo: Task 2, Task 3, Task 7, and existing controller/persistence suites.
- Drag handle, drop boundaries, preview, auto-scroll, and keyboard fallback: Task 6.
- Full verification, exact scope, acceptance mapping, independent review, and no merge: Task 9.

No spec criterion is intentionally deferred.

### Placeholder scan

The implementation tasks contain exact paths, signatures, test bodies, commands, expected RED/GREEN outcomes, and commit messages. The completion-evidence template explicitly requires replacing the final implementation SHA before commit; the plan itself contains no implementation placeholder that permits incomplete production code.

### Type consistency

- `ScheduleTransactionController` is defined once in Task 1 and consumed by route, Flexible Planner, and Course Manager.
- `LessonEditorCandidateInput` is defined in Task 2 and used unchanged by Task 5.
- `ScheduleCandidateBuildResult` remains the shared candidate return union.
- Mutation kinds added in Task 2 match Task 5–Task 7 calls.
- `LessonEditorDraft` is defined in Task 4 and consumed by Task 5.
- Bulk and move builder signatures defined in Task 3 match Task 7 calls.

### Scope decision

P1D remains one plan because transaction routing and component decomposition are not independently safe: moving mutation ownership without extracting decision boundaries would leave the same high-risk monolith, while decomposing the UI without shared candidate/transaction ownership would preserve the P0B debt. Every task still produces an independently testable, reviewable slice.
