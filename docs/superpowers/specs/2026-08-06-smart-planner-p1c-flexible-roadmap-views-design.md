# Smart Planner P1C Flexible Roadmap Views Design

**Status:** Proposed for owner review  
**Date:** 2026-08-06  
**Repository:** `NguyenDukKyeon/smart-planner`  
**Exact predecessor:** `main@4af77aa0bb33d066dc170587f26e95b43db63d0f`  
**Package:** `P1C`

---

## 1. Purpose

P1C preserves the original useful property of the Roadmap: changing daily study capacity recomputes the expected weekly distribution of unfinished lessons. It also adds a separate canonical-order view so users can inspect the stable subject → topic → lesson sequence without confusing that sequence with the scheduler's current date assignment.

The package must make both meanings explicit:

1. **Theo lịch dự kiến** — the capacity-aware weekly projection produced from the current scheduler result.
2. **Theo thứ tự** — the stable catalog order stored in subjects, milestones/topics, and lessons.

The weekly projection remains the default view for compatibility with the existing product behavior.

---

## 2. Existing behavior to preserve

At the exact predecessor, `LearningRoadmap` receives `shiftedDates` from `buildShiftedSchedule()` and groups lessons by an effective date. For unfinished flexible lessons, this means that changing daily study hours can move lessons between days and weeks.

P1C must preserve all of the following:

- increasing daily capacity can move unfinished flexible lessons into earlier projected weeks;
- decreasing daily capacity can spread unfinished flexible lessons across more projected weeks;
- fixed lessons remain tied to their exact date and remain visible when unplaced;
- completed lessons remain visible and retain truthful completion state;
- subject filtering continues to work;
- adding a lesson from the Roadmap remains available;
- no lesson, subject, topic, or completion ID changes;
- no scheduler, review, persistence, transaction, undo, Forecast, or Course Manager semantics change.

The package must not redefine scheduler output merely to make the Roadmap easier to render.

---

## 3. Chosen product design

### 3.1 View selector

The Roadmap header gains one keyboard-accessible two-option selector:

- `Theo lịch dự kiến`
- `Theo thứ tự`

`Theo lịch dự kiến` is selected by default on each newly mounted Roadmap. The selector state is transient UI state and is not added to persisted `ProgressState` or catalog data.

The two views share the existing subject filter. Changing the subject preserves the selected Roadmap view. Changing the Roadmap view preserves the selected subject.

### 3.2 Theo lịch dự kiến

This is the compatibility view and remains capacity-aware.

It answers:

> Với quỹ giờ hiện tại, hệ thống dự kiến tôi sẽ học các bài này vào tuần nào?

Rules:

- unfinished flexible lessons use the current scheduler-projected date from `shiftedDates`, falling back to `scheduledDate` only when no projected date exists;
- unfinished fixed lessons use their exact scheduled date when placed;
- unfinished fixed lessons that cannot fit remain in a dedicated `Chưa xếp được` group;
- completed lessons use their completion date for historical placement, matching the predecessor behavior;
- undated lessons remain in `Kho bài chưa xếp lịch`;
- grouping is by calendar week using the effective date;
- changing current capacity recomputes this view from the new `shiftedDates` input;
- no projected or unplaced lesson may disappear because it is outside the currently visible Flexible Schedule horizon.

The view includes a short explanation:

> Lịch dự kiến thay đổi theo quỹ giờ và các bài đã hoàn thành. Xem Lịch linh hoạt để chỉnh từng ngày.

### 3.3 Theo thứ tự

This is the canonical catalog view.

It answers:

> Trong môn hoặc khóa học này, bài nào đứng trước và bài nào đứng sau?

Rules:

- subjects use the existing canonical subject ordering;
- each subject preserves its stored milestone/topic order;
- each milestone/topic preserves its stored lesson order;
- capacity, `shiftedDates`, completion dates, and manual move dates never reorder canonical entries;
- completed lessons remain in their original canonical position;
- the all-subject view groups by subject first, then milestone/topic;
- a selected-subject view omits redundant subject headings but preserves milestone/topic headings;
- an empty milestone/topic is not synthesized;
- an empty Roadmap uses the existing empty-state language unless a more specific scoped message is required.

Each lesson may show schedule context as secondary metadata, but that metadata must not determine order. The allowed statuses are:

- `Đã hoàn thành`
- `Trong lịch dự kiến`
- `Ngoài phạm vi đang xem`
- `Cố định chưa xếp được`
- `Chưa xếp lịch`

These labels are descriptive only. Clicking or viewing a badge must not mutate schedule state.

---

## 4. Semantic boundaries

The three planning surfaces remain distinct:

| Surface | Meaning |
| --- | --- |
| Roadmap — Theo lịch dự kiến | Capacity-aware weekly projection |
| Roadmap — Theo thứ tự | Stable subject/topic/lesson sequence |
| Flexible Schedule | Exact day-level schedule workspace and mutation surface |

P1C must not add move controls, capacity editors, undo controls, drag-and-drop, or date dialogs to Roadmap. Those remain owned by Flexible Schedule and the integrated P0B transaction boundary.

---

## 5. Architecture

### 5.1 Pure selector module

Create a focused pure module, proposed path:

```text
src/lib/roadmap-views.ts
```

It owns transformation only, not React state or persistence.

Proposed public types:

```ts
export type RoadmapViewMode = "projection" | "canonical";

export type RoadmapLessonStatus =
  | "completed"
  | "projected"
  | "outside-horizon"
  | "unplaced-fixed"
  | "unscheduled";

export type RoadmapLessonItem = {
  lesson: Lesson;
  subjectId: string;
  subjectName: string;
  subjectEmoji: string;
  milestoneId: string;
  milestoneTitle: string;
  status: RoadmapLessonStatus;
  effectiveDate: string | null;
};

export type RoadmapProjectionGroup = {
  id: string;
  title: string;
  subtitle: string;
  mondayISO: string | null;
  sundayISO: string | null;
  items: RoadmapLessonItem[];
  doneCount: number;
  totalCount: number;
};

export type RoadmapCanonicalSubjectGroup = {
  subjectId: string;
  subjectName: string;
  subjectEmoji: string;
  milestones: Array<{
    milestoneId: string;
    milestoneTitle: string;
    items: RoadmapLessonItem[];
  }>;
};
```

Proposed selectors:

```ts
export function buildRoadmapProjection(params: {
  subjects: Subject[];
  completed: Record<string, string>;
  shiftedDates: Record<string, string>;
  selectedSubjectId: string;
  visibleScheduledLessonIds?: ReadonlySet<string>;
}): RoadmapProjectionGroup[];

export function buildCanonicalRoadmap(params: {
  subjects: Subject[];
  completed: Record<string, string>;
  shiftedDates: Record<string, string>;
  selectedSubjectId: string;
  visibleScheduledLessonIds?: ReadonlySet<string>;
}): RoadmapCanonicalSubjectGroup[];
```

The exact status derivation may use an equivalent input if a more truthful existing visibility selector is available during implementation. It must not duplicate or contradict the integrated P1B visibility semantics.

### 5.2 React component boundary

`src/components/LearningRoadmap.tsx` remains the orchestration and rendering boundary for this package. It owns:

- transient selected view;
- transient selected subject;
- selector rendering;
- projection rendering;
- canonical rendering;
- the existing add-lesson entry point;
- completion actions through the existing callback.

Pure grouping and status derivation move out of the component so they can be tested without rendering the whole dashboard.

A small child component directory may be introduced only if `LearningRoadmap.tsx` becomes harder to review. The package must not use this as authority for a broad visual rewrite.

### 5.3 Route boundary

`src/routes/index.tsx` continues to compute `shiftedDates` once and pass scheduler-derived data into Roadmap. P1C may add a read-only visibility input if needed, but it must not introduce a second scheduler invocation with different settings.

---

## 6. Status derivation

Status derivation follows this precedence:

1. If `completed[lesson.id]` exists: `completed`.
2. If the lesson is fixed and has no projected/placed date: `unplaced-fixed`.
3. If no scheduled or projected date exists: `unscheduled`.
4. If a supplied visibility set confirms the lesson is visible in the current Flexible Schedule horizon: `projected`.
5. If the lesson has a projected date but is not visible in that bounded horizon: `outside-horizon`.
6. Without a bounded visibility input, a dated unfinished lesson is `projected`; the UI must not claim it is outside the horizon without evidence.

This package must reuse the existing definition of fixed, flexible, and visible schedule items. It must not infer review tasks as ordinary Roadmap lessons.

---

## 7. Interaction and accessibility

- The two-view selector uses native buttons or the existing Tabs primitive.
- Both options have clear accessible names and selected state.
- The selector is reachable and operable by keyboard.
- Focus is not lost when changing views.
- Subject controls remain keyboard operable.
- The horizontal projection path retains a discoverable overflow/scroll behavior on narrow screens.
- The canonical view uses semantic headings and lists so screen-reader users can understand subject, topic, and lesson hierarchy.
- Completion buttons retain the existing callback and must not become nested interactive controls.
- Motion remains non-essential and respects the existing reduced-motion behavior.

---

## 8. Data safety and compatibility

P1C is read-model and presentation work only, except for the existing completion and add-lesson callbacks already owned by Roadmap.

It must not:

- add a persistence schema field;
- write selected view state to `ProgressState`;
- modify lesson IDs, subject IDs, milestone IDs, or completion dates;
- change import/export formats;
- change scheduler ordering or quota calculations;
- change manual-move provenance;
- change transaction or undo history;
- add a dependency;
- change workflow or deployment configuration;
- delete the existing capacity-aware weekly Roadmap behavior.

---

## 9. Testing strategy

### 9.1 Pure selector tests

Add focused tests for:

1. projection groups change when `shiftedDates` move unfinished flexible lessons between weeks;
2. canonical groups do not change order when `shiftedDates` change;
3. completed lessons retain canonical position in canonical mode;
4. completed lessons use completion dates in projection mode;
5. fixed unplaced lessons appear in `Chưa xếp được`;
6. undated lessons appear in `Kho bài chưa xếp lịch`;
7. subject filtering works in both selectors;
8. all-subject canonical grouping preserves subject → milestone → lesson order;
9. no review task is synthesized as an ordinary Roadmap lesson;
10. status precedence is truthful for completed, projected, outside-horizon, unplaced-fixed, and unscheduled lessons.

### 9.2 Regression tests

Add a source-level or component-focused regression test proving:

- the default view is `Theo lịch dự kiến`;
- both view labels are present;
- view state is transient and no persistence setter is introduced;
- `LearningRoadmap` still consumes scheduler projection data;
- changing modes does not call `onSubjectsUpdated` or `onToggleLesson`;
- the existing Add Lesson capability remains wired.

### 9.3 Full gates

The package acceptance run must include:

```bash
npm run typecheck
npm run lint
npm test
npm run build
git diff --exit-code
```

No command may modify tracked source.

---

## 10. Acceptance criteria

P1C is implementation-complete only when all criteria pass:

1. Roadmap exposes `Theo lịch dự kiến` and `Theo thứ tự`.
2. `Theo lịch dự kiến` is the default view.
3. Changing daily capacity still changes projected weekly distribution through the scheduler-provided `shiftedDates` input.
4. `Theo thứ tự` remains stable when daily capacity or projected dates change.
5. Canonical mode preserves subject → milestone/topic → lesson order.
6. Projection mode preserves completed-lesson historical grouping from the predecessor.
7. Fixed unplaced lessons remain visible.
8. Undated lessons remain visible.
9. Lessons outside the bounded Flexible Schedule horizon are not silently lost.
10. Subject filtering works in both modes and does not reset the selected mode.
11. Switching modes does not mutate or persist application data.
12. Existing completion and Add Lesson actions remain available.
13. Roadmap gains no schedule mutation ownership.
14. No scheduler, Forecast, Course Manager, review, persistence-schema, dependency, workflow, or deployment behavior changes.
15. Typecheck, lint, full tests, production build, and clean-tree verification pass at the exact implementation head.
16. Independent review finds no unresolved Critical or Important issue.

---

## 11. Proposed changed-file scope

Expected production scope:

```text
src/components/LearningRoadmap.tsx
src/lib/roadmap-views.ts
src/lib/roadmap-views.test.ts
src/lib/roadmap-views-regression.test.ts
```

`src/routes/index.tsx` may change only if a read-only existing visibility set must be passed into Roadmap. Any additional production file requires explicit justification in the implementation plan.

Documentation scope:

```text
docs/superpowers/specs/2026-08-06-smart-planner-p1c-flexible-roadmap-views-design.md
docs/superpowers/plans/2026-08-06-smart-planner-p1c-flexible-roadmap-views.md
```

---

## 12. Non-goals

P1C does not authorize:

- replacing the scheduler;
- changing subject fairness or candidate selection;
- changing fixed/flexible semantics;
- editing dates from Roadmap;
- adding Roadmap drag-and-drop;
- redesigning Flexible Schedule;
- refactoring Course Manager;
- changing Forecast calculations;
- persisting the selected Roadmap view;
- adding target-week schema;
- broad dashboard visual redesign;
- dependency, CI, deployment, or history changes.

---

## 13. Delivery and governance

- Work begins from exact predecessor `4af77aa0bb33d066dc170587f26e95b43db63d0f`.
- Use a dedicated published branch.
- Preserve Lovable history; do not rebase, amend published commits, squash, force-push, or rewrite history.
- Implementation follows TDD with small reviewable commits.
- Green CI is implementation evidence, not independent acceptance.
- Independent acceptance is not merge authorization.
- Any later integration requires separate explicit merge authorization and a regular merge commit.
