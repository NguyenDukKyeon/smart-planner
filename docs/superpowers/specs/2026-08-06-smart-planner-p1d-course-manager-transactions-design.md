# Smart Planner P1D — Course Manager Transactions and Decomposition Design

**Status:** Approved design direction; implementation is not authorized until the written spec is reviewed and an implementation plan is approved  
**Date:** 2026-08-06  
**Repository:** `NguyenDukKyeon/smart-planner`  
**Exact predecessor:** `main@ceeee84682c55c663d09a6b171227a1d92171046`  
**Package:** P1D — Course Manager reliability and decomposition

---

## 1. Purpose

P1D closes the Course Manager ownership gap that remained after P0B and reduces the regression risk created by `CourseManagerModal.tsx` concentrating UI state, validation, catalog mutation, schedule mutation, persistence coordination, backup/undo behavior, and drag-and-drop logic in one component.

The package has two bounded goals:

1. route every Course Manager mutation that changes scheduling inputs or canonical learning order through the existing shared schedule transaction system; and
2. split the Course Manager into focused units without redesigning the product or changing stored catalog identity.

P1D does **not** build a universal undo system for all catalog operations. Pure catalog operations remain on the current catalog persistence and backup path. Schedule-affecting operations share the same bounded history, atomic persistence, rollback, stale-history invalidation, and keyboard undo semantics as Flexible Schedule.

---

## 2. Current-state evidence

At the exact predecessor, `CourseManagerModal.tsx` owns all of the following:

- modal, mobile-detail, subject-selection, filter, sorting, selection, archive, dialog, drag, and delete state;
- subject, topic, lesson, bulk, archive, restore, duplicate, delete, export, and reorder actions;
- subject/topic/lesson statistics and filter/sort projections;
- lesson editor validation for title, duration, destination, schedule mode, and date;
- timer-impact confirmation;
- direct calls to the catalog updater;
- one-step catalog backup restoration and local toast undo;
- drag preview, insertion-edge calculation, auto-scroll, and keyboard button fallback;
- rendering for the subject list, subject header, topic groups, lesson rows, bulk controls, editor dialogs, archive view, and delete confirmation.

The route currently passes `onSubjectsUpdated={updateSubjectsSafely}` to Course Manager. That path persists and publishes the catalog, but it is not the shared P0B schedule transaction controller used by Flexible Schedule.

P0B already provides:

- canonical schedule snapshots;
- pure candidate builders for date moves, schedule-mode changes, and lesson reorder;
- atomic catalog/planner-settings persistence;
- rollback on failed writes;
- bounded 20-entry schedule mutation history;
- stale-history invalidation after unrelated external changes;
- `Ctrl+Z` / `Cmd+Z` protection for editable controls;
- exact no-op handling that does not append history.

Flexible Schedule currently creates `useScheduleTransactions()` inside `FlexiblePlanner`. If Course Manager created a second hook instance, the app would have two independent histories and two keyboard listeners. P1D must instead establish one transaction owner above both surfaces.

---

## 3. Design principles

1. **One schedule mutation owner.** Flexible Schedule and Course Manager must consume one transaction controller and one history.
2. **Catalog and schedule concerns remain distinguishable.** Pure catalog edits do not occupy schedule history.
3. **Atomic editor commits.** One user confirmation produces at most one schedule transaction, even when the edit changes several lesson fields.
4. **No silent identity drift.** Existing subject, topic, and lesson IDs must be preserved unless the operation explicitly creates a new entity.
5. **No automatic reorder.** Existing canonical order remains unchanged except after an explicit reorder or move operation.
6. **Candidate first, persistence second.** All schedule-affecting actions build and validate a complete candidate before any storage or UI publication.
7. **Failure is non-destructive.** Invalid candidates and failed persistence do not change UI state or append undo history.
8. **Refactor only to support reliability.** P1D is not a visual redesign or a broad rewrite of catalog storage.
9. **Maintain mobile and keyboard capability.** Decomposition must preserve existing mobile navigation, native controls, reorder buttons, and drag handle behavior.
10. **No new dependency.** Existing React, Radix, Tailwind, Vitest, and browser-storage patterns remain authoritative.

---

## 4. Scope classification

### 4.1 Shared schedule transaction mutations

The following Course Manager operations must use the shared P0B transaction boundary because they change scheduler inputs, capacity calculations, or canonical learning order:

- change a lesson planned/earliest date;
- change a lesson between `fixed` and `flexible`;
- change a lesson planned duration;
- move a lesson to another subject;
- move a lesson to another topic;
- reorder subjects;
- reorder topics;
- reorder lessons by drag, insertion target, or up/down buttons;
- bulk change date;
- bulk change schedule mode;
- bulk change planned duration;
- bulk move lessons to another subject;
- bulk move lessons to another topic;
- a lesson-editor save that combines title, duration, date, schedule mode, subject, and topic changes.

A combined lesson edit is committed as one transaction. The snapshot restores the complete prior catalog and planner settings, so undo reverses every schedule-affecting and associated title field changed by that save together.

### 4.2 Existing catalog persistence mutations

The following remain on the current catalog persistence/backup path and do not append schedule history:

- create a subject;
- rename a subject;
- change a subject emoji;
- create a topic;
- rename a topic;
- export a subject;
- archive a subject or lesson;
- restore an archived subject or lesson;
- delete a subject, topic, or lesson;
- restore the latest catalog backup;
- import catalog data;
- Add Lesson flows outside the P1D Course Manager transaction boundary.

These operations may indirectly change what appears in the schedule, but P1D intentionally does not expand the schedule snapshot model to archived-catalog storage, import rollback state, or universal catalog history. Their existing confirmations, backups, timer-impact checks, and persistence behavior remain authoritative.

### 4.3 UI terminology

The two undo concepts must be distinguishable:

- shared schedule history: **Hoàn tác thay đổi lịch**;
- current catalog backup: **Hoàn tác thay đổi danh mục gần nhất**.

The explicit schedule undo action may be rendered in Flexible Schedule, Course Manager, or a shared Plan-level control, but all renderers must call the same controller instance.

---

## 5. Architecture

### 5.1 Shared transaction owner

The transaction owner moves from inside `FlexiblePlanner` to the common Plan/Dashboard boundary that already owns:

- `subjects`;
- `state.plannerSettings`;
- catalog persistence adapters;
- planner-settings persistence adapters;
- publication callbacks.

Target data flow:

```text
Dashboard / Plan transaction owner
├─ one useScheduleTransactions() instance
├─ one 20-entry history
├─ one Ctrl/Cmd+Z listener
├─ FlexiblePlanner consumer
└─ CourseManagerModal consumer
```

The owner exposes a narrow controller interface:

```ts
type ScheduleTransactionController = {
  history: ScheduleMutationEntry[];
  canUndo: boolean;
  executeMutation(params: {
    candidate: ScheduleCandidate;
    kind: ScheduleMutationKind;
    description: string;
  }): CommitScheduleMutationResult;
  undoLastMutation(): UndoScheduleMutationResult;
};
```

`FlexiblePlanner` no longer constructs its own history. It receives the controller and keeps only Flexible-Schedule-specific post-commit UI state such as destination highlight and outside-horizon notices.

`CourseManagerModal` receives the same controller plus current planner settings or a canonical snapshot factory sufficient for pure candidate construction.

The transaction adapters remain owned by the route. Neither child component writes browser storage directly.

### 5.2 Candidate builders

Existing builders in `src/lib/schedule-candidates.ts` remain authoritative where applicable:

- `buildMoveLessonDateCandidate`;
- `buildChangeScheduleModeCandidate`;
- `buildReorderLessonCandidate`.

P1D adds focused pure builders rather than assembling candidates in JSX handlers. Proposed exports:

```ts
buildEditLessonCandidate(...)
buildReorderSubjectCandidate(...)
buildReorderTopicCandidate(...)
buildBulkLessonUpdateCandidate(...)
buildMoveLessonsCandidate(...)
```

Exact naming may be refined in the implementation plan, but the following rules are mandatory:

- inputs are a `ScheduleSnapshot` plus explicit operation arguments;
- results are either a validated candidate or a user-actionable error;
- no builder reads or writes storage;
- no builder triggers toast, timer confirmation, or React state;
- identity preservation is checked for operations that are not create/delete/archive;
- duplicate lesson IDs are rejected;
- target subject/topic and insertion targets must exist;
- fixed lessons require a valid date;
- flexible lessons may use an empty date but reject a non-empty invalid date;
- planned duration must be finite, integral after normalization, and greater than zero;
- no-op candidates return the canonical unchanged snapshot;
- bulk updates are all-or-nothing; one invalid target or lesson rejects the entire candidate.

### 5.3 Course Manager component boundaries

`CourseManagerModal.tsx` becomes the orchestration shell. Target boundaries:

```text
src/components/course-manager/
├─ SubjectListPane.tsx
├─ SubjectWorkspace.tsx
├─ SubjectHeader.tsx
├─ TopicSection.tsx
├─ LessonRow.tsx
├─ LessonEditorDialog.tsx
├─ BulkActionsBar.tsx
├─ useLessonReorder.ts
└─ course-manager-model.ts
```

The implementation plan may merge two very small presentation files or split a large one further, but responsibilities must remain bounded as follows.

#### `course-manager-model.ts`

Owns pure projections and validation helpers:

- locate lesson ownership;
- derive minutes-by-lesson and subject statistics;
- filter and sort visible lessons;
- derive editor initial values;
- validate subject/topic/lesson draft fields that do not require persistence;
- classify whether an edit is schedule-affecting;
- build stable view models without changing catalog order.

#### `LessonEditorDialog.tsx`

Owns:

- local draft fields;
- accessible labels and error presentation;
- destination subject/topic selection;
- schedule-mode/date labels;
- submission and cancellation events.

It does not mutate subjects or call persistence directly.

#### `useLessonReorder.ts`

Owns:

- dragged lesson ID;
- armed-handle state if still required;
- insertion edge;
- drag preview;
- scroll-container auto-scroll;
- cleanup after drop/end;
- translation of a drop into an explicit reorder target.

It does not build the schedule candidate or persist state.

#### Presentation components

`SubjectListPane`, `SubjectWorkspace`, `SubjectHeader`, `TopicSection`, `LessonRow`, and `BulkActionsBar` receive data and callbacks. They must not import browser-storage helpers or the schedule mutation controller implementation.

#### `CourseManagerModal.tsx`

Retains:

- modal open state;
- selected subject and mobile-detail navigation;
- top-level search/filter/sort/selection coordination;
- dialog open/close orchestration;
- timer-impact confirmation before destructive or ownership-changing actions;
- calls to either the schedule controller or catalog updater according to the classification table.

---

## 6. Mutation flows

### 6.1 Schedule-affecting action

```text
user action
→ optional timer-impact confirmation
→ pure candidate builder
→ candidate validation
→ shared executeMutation
→ subject backup when subjects changed
→ atomic persistence of affected stores
→ publish subjects/planner settings
→ append one bounded history entry
→ show success and undo affordance
```

The UI must not close an editor or clear bulk selection until the commit succeeds. A successful no-op may close the editor but must not append history or claim a change was saved as a new mutation.

### 6.2 Failed schedule-affecting action

Candidate failure:

```text
invalid input or missing target
→ no persistence
→ no publication
→ no history entry
→ keep dialog/selection state
→ show specific error
```

Persistence failure:

```text
candidate valid
→ persistence reports failure
→ rollback all partially written stores
→ do not publish candidate
→ do not append history
→ keep dialog/selection state
→ show error and rollback error when present
```

### 6.3 Catalog-only action

```text
user action
→ existing validation/confirmation
→ existing catalog helper
→ current catalog persistence or already-persisted archive path
→ current success/error feedback
```

A catalog-only external publication invalidates shared schedule history according to the existing stale-history rule. P1D must not weaken that protection merely to preserve undo entries.

---

## 7. Lesson editor semantics

The editor may change title, subject, topic, duration, date, and schedule mode in one save.

Required behavior:

- empty title is rejected;
- planned duration must be greater than zero and no greater than the existing accepted product maximum;
- selected subject must exist;
- selected topic must belong to the selected subject;
- fixed mode requires a valid date;
- flexible mode permits an empty date and interprets a valid date as earliest eligibility;
- an unchanged draft is a no-op;
- changing only the title is catalog-only and uses current catalog persistence;
- changing any schedule-affecting field causes the complete editor result, including title, to be committed in one shared transaction;
- moving between subjects/topics preserves the lesson ID and all fields not explicitly edited;
- the move must not duplicate or drop the lesson;
- editor closure occurs only after a successful persistence result or accepted no-op.

The editor must not independently call a date-move builder and then a schedule-mode builder. It builds one complete candidate to avoid two writes, two history entries, and an observable intermediate state.

---

## 8. Reorder semantics

### 8.1 Subject and topic reorder

- up/down actions remain available;
- reorder changes only explicit canonical order;
- no subject, topic, or lesson ID changes;
- all nested lesson identity is preserved;
- first/last boundary actions are disabled or resolve to no-op;
- successful reorder creates one shared history entry.

### 8.2 Lesson reorder

- drag begins only from the dedicated handle;
- the exact before/after insertion boundary remains visible;
- keyboard-accessible up/down buttons remain available;
- drag reorder is enabled only when sort is canonical roadmap order, filter is `all`, and search is empty;
- reorder within or across a topic uses an explicit target subject, topic, and `beforeLessonId`;
- the result preserves the complete set of lesson IDs exactly once;
- drop outside a valid target creates no mutation;
- a no-op drop creates no history entry;
- the transaction description identifies the lesson and destination sufficiently for undo feedback.

---

## 9. Bulk semantics

Bulk operations are atomic:

- every selected lesson must still exist when the candidate is built;
- selection IDs are deduplicated;
- moving to a subject requires a valid destination and a deterministic target topic according to existing product behavior;
- moving to a topic requires that the topic belong to the selected target subject;
- changing to fixed mode requires a valid date for every affected lesson, either already present or supplied by the operation;
- bulk date clearing is permitted only when the resulting schedule mode remains valid;
- bulk duration must be valid for all selected lessons;
- one invalid condition rejects the entire bulk action;
- one successful bulk action appends one history entry, not one per lesson;
- selection clears only after successful commit;
- no-op bulk actions append no history.

Archive and delete bulk actions remain catalog-only in P1D and retain their current confirmation, timer-impact, and backup semantics.

---

## 10. Undo behavior

The shared history remains bounded to 20 successful schedule mutations for the active browser session.

Required behavior:

- one `Ctrl+Z` / `Cmd+Z` listener exists for the shared controller;
- undo is ignored inside input, textarea, select, and contenteditable targets;
- undo restores the complete previous schedule snapshot;
- undo from Course Manager can be invoked after closing the modal;
- undo from Flexible Schedule can reverse the latest Course Manager schedule mutation and vice versa;
- UI-specific notices and highlight state may be cleared after undo without changing the restored data;
- a catalog-only change published outside the expected transaction invalidates stale schedule history;
- reload may clear history but must not alter persisted schedule state;
- catalog backup restoration remains separate and clearly labelled;
- P1D does not persist history or merge archived-catalog snapshots into it.

Because the shared hook currently owns the keyboard listener, its instance must be mounted at a boundary that remains active while the Plan area and Course Manager modal are available. Child renderers must not install competing listeners.

---

## 11. Error handling and user feedback

Errors must identify the failed operation and avoid false success messages.

Examples of actionable errors:

- lesson no longer exists;
- destination subject or topic no longer exists;
- fixed lesson requires a valid date;
- planned duration must be greater than zero;
- reorder target is invalid;
- catalog could not be backed up;
- catalog or planner settings could not be saved;
- rollback also failed.

Rules:

- validation errors keep the relevant dialog open;
- failed bulk operations preserve selection;
- failed drag operations clear transient drag visuals but leave data unchanged;
- success toast appears only after commit or a deliberate accepted no-op response;
- committed schedule mutation feedback includes the undo affordance or explains `Ctrl+Z`;
- catalog-only feedback must not imply the action entered schedule history;
- timer-impact confirmation remains before operations that delete, archive, or move an active timer lesson in a way covered by current behavior.

---

## 12. Compatibility requirements

P1D must preserve:

- the current Course Manager desktop two-pane layout;
- mobile subject-list/detail navigation;
- subject search;
- lesson search, filters, and sorts;
- selection mode and current bulk operations;
- active and archived views;
- Add Lesson integration;
- subject export;
- subject/topic/lesson edit capabilities;
- dedicated lesson drag handle;
- before/after insertion indicator;
- drag auto-scroll;
- up/down reorder buttons;
- completion/progress statistics;
- timer-impact confirmations;
- archive/restore/delete behavior;
- current scheduler rules from P0B;
- P1A placement provenance rules;
- P1B Flexible Schedule behaviors and notices;
- P1C Roadmap projection and canonical-order views.

P1D must not:

- change persistence schema;
- change stored IDs;
- silently reorder existing catalog data;
- change scheduler algorithms;
- change review generation or completion behavior;
- change Forecast behavior;
- redesign the Course Manager information architecture;
- add touch-drag infrastructure or a new drag dependency;
- add a universal catalog history;
- move archive/delete/import storage into schedule snapshots;
- change dependencies, lockfile, workflow, or deployment configuration without a separately approved need.

---

## 13. Expected file scope

Likely production scope:

```text
src/routes/index.tsx
src/components/FlexiblePlanner.tsx
src/components/CourseManagerModal.tsx
src/components/flexible-planner/useScheduleTransactions.ts
src/components/course-manager/*
src/lib/schedule-candidates.ts
```

Likely tests:

```text
src/lib/schedule-candidates.test.ts
src/lib/schedule-mutation-controller.test.ts
src/lib/course-manager-*.test.ts
src/lib/catalog-order-drag-regression.test.ts
src/lib/flexible-planner-transactions-regression.test.ts
```

The implementation plan must justify every changed file. Existing persistence/controller files should change only when a focused API adjustment is required to expose one shared owner; broad rewrites are prohibited.

---

## 14. Test strategy

Implementation uses TDD with observable RED evidence before production code for each behavioral slice.

### 14.1 Shared ownership

Tests must prove:

- Flexible Schedule and Course Manager receive the same controller instance;
- only one hook/listener owner remains;
- a mutation committed from either surface appears in the same history;
- undo from the other surface restores it;
- unrelated external catalog publication invalidates history.

### 14.2 Candidate builders

Tests cover:

- complete lesson-editor candidate construction;
- title-only classification;
- fixed-date validation;
- flexible empty-date acceptance;
- invalid destination rejection;
- duration validation;
- subject/topic/lesson reorder boundaries;
- cross-topic move and insertion;
- identity preservation and duplicate rejection;
- bulk all-or-nothing behavior;
- no-op behavior.

### 14.3 Persistence and rollback

Tests cover:

- one atomic commit for a combined editor save;
- no publication before successful persistence;
- rollback after partial write failure;
- no history append on validation or persistence failure;
- one history entry for a successful bulk action;
- complete snapshot restoration on undo.

### 14.4 UI regression

Tests or source-level regressions cover:

- subject and lesson filters/sorts remain available;
- drag handle and insertion labels remain;
- auto-scroll remains;
- keyboard buttons remain;
- reorder is disabled while filtered/searched/non-roadmap sorted;
- editor remains open on error;
- bulk selection clears only after success;
- separate catalog and schedule undo labels exist;
- mobile detail navigation remains.

### 14.5 Full verification

Exact-head verification requires:

```bash
npm run typecheck
npm run lint
npm test
npm run build
git diff --exit-code
```

The final PR merge-result workflow must pass on the exact reviewed head. Existing non-blocking warnings must be distinguished from regressions introduced by P1D.

---

## 15. Acceptance criteria

P1D is accepted only when all criteria below are independently verified against the exact implementation head.

1. One shared schedule transaction controller is mounted above Flexible Schedule and Course Manager.
2. Flexible Schedule no longer owns an independent history or keyboard undo listener.
3. Course Manager does not create a second transaction history or listener.
4. Date, schedule mode, duration, subject/topic move, and canonical reorder actions use the shared transaction boundary.
5. One combined lesson-editor save creates at most one schedule history entry.
6. A title-only lesson edit remains catalog-only and does not append schedule history.
7. Pure subject/topic naming and emoji changes remain catalog-only.
8. Archive, restore, delete, import, and Add Lesson remain outside the schedule history scope defined by this package.
9. Fixed lessons cannot be saved without a valid date.
10. Flexible lessons may be saved without a date and reject invalid non-empty dates.
11. Reorder and move operations preserve every pre-existing lesson ID exactly once.
12. Existing catalog order changes only after explicit user reorder/move actions.
13. Bulk schedule-affecting actions are all-or-nothing and create one history entry.
14. Validation failure performs no persistence, publication, history append, or false success feedback.
15. Persistence failure rolls back partial writes, publishes no candidate, and appends no history.
16. Undo restores the complete previous subjects and planner settings snapshot.
17. A Course Manager mutation can be undone after the modal closes and from Flexible Schedule, and the reverse direction also works.
18. Editable controls remain protected from the global undo shortcut.
19. External unexpected catalog changes invalidate stale shared history.
20. Catalog backup restoration remains separate and is labelled distinctly from schedule undo.
21. Existing drag handle, insertion edge, drag preview, auto-scroll, and up/down fallback remain functional.
22. Existing search, filter, sort, bulk, archive, mobile navigation, and progress display remain available.
23. No scheduler, review algorithm, persistence schema, Forecast, Roadmap semantics, dependency, lockfile, workflow, or deployment configuration changes occur outside an explicitly justified implementation need.
24. Typecheck, lint, full tests, production build, and clean-tree verification pass for the exact reviewed head.
25. No unresolved Critical or Important review finding remains.

---

## 16. Delivery and governance

P1D proceeds in the following gates:

1. written design spec committed on the P1D branch;
2. user review and approval of the exact spec commit;
3. detailed implementation plan committed on the same branch;
4. user approval of the implementation plan;
5. TDD implementation with explicit RED and GREEN evidence;
6. exact-diff self-review and independent acceptance;
7. draft PR remains unmerged until separate explicit merge authorization.

The implementation must not squash, rebase, force-push, amend published commits, rewrite history, enable auto-merge, delete the branch, or merge automatically. Integration, when separately authorized, uses a regular merge commit.

---

## 17. Decision summary

P1D adopts **Approach A**:

- schedule-affecting Course Manager edits join the existing shared P0B transaction and undo model;
- pure catalog edits keep their current catalog persistence and backup model;
- one transaction owner is lifted above both Course Manager and Flexible Schedule;
- Course Manager is decomposed into focused model, editor, presentation, and reorder units;
- the package preserves product behavior and data identity rather than redesigning the feature.
