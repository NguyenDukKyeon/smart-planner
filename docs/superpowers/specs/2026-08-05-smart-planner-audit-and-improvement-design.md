# Smart Planner Audit and Improvement Design

**Status:** Approved direction; implementation not yet authorized by this document alone  
**Date:** 2026-08-05  
**Repository:** `NguyenDukKyeon/smart-planner`  
**Owner goal:** Make the personal study planner dependable, understandable, easier to operate, and able to schedule up to 16 study hours per day.

---

## 1. Purpose

This document records the agreed product and technical direction for improving Smart Planner in three ordered phases:

1. **P0 — Reliability and correctness**
2. **P1 — Core study-flow usability**
3. **P2 — Interface consistency, accessibility, and secondary features**

The phases are intentionally ordered. P1 and P2 must not be used to hide unresolved P0 defects. Visual polish is not acceptance evidence for scheduler correctness, storage safety, or build reproducibility.

The first functional change will be support for **0–16 study hours per day in 0.5-hour increments**, implemented from one canonical limit rather than repeated literals.

---

## 2. Product context

Smart Planner is a responsive personal study application with:

- a Today queue;
- fixed and flexible lesson scheduling;
- a flexible calendar;
- a roadmap and completion forecast;
- course, topic, and lesson management;
- Pomodoro/focus sessions;
- reviews, habits, goals, streaks, rewards, reminders, PWA, and Web Push;
- browser-local persistence with backup/recovery mechanisms.

The app is primarily a personal tool, not a multi-user SaaS product. The design should optimize for:

- fast daily use;
- transparent scheduling decisions;
- recoverability after mistakes;
- useful operation on desktop and mobile;
- stable local data;
- low maintenance complexity.

---

## 3. Audit evidence and current risks

### 3.1 Build commands mutate source before doing their real job

The current `dev`, `build`, `build:dev`, `typecheck`, `test`, and `lint` commands execute a chain of source-transforming scripts before Vite, TypeScript, Vitest, or ESLint runs.

Current chain:

```text
fix-planning-dates.mjs
prepare-app-build.mjs
add-schedule-modes.mjs
add-schedule-mode-bulk.mjs
improve-lesson-order-drag.mjs
improve-flexible-schedule-ux.mjs
add-flexible-planner-undo.mjs
```

This creates several risks:

- source reviewed on GitHub can differ from source actually built;
- a test may validate generated output rather than committed source;
- a manual edit can be overwritten during build;
- local, GitHub Actions, Lovable, and Vercel can produce different results;
- `lint` and `typecheck` cease to be read-only verification commands;
- diagnosing regressions becomes unnecessarily difficult.

**P0 invariant:** verification commands must not modify tracked source files.

### 3.2 The 12-hour ceiling is duplicated

The current maximum is enforced independently in multiple layers, including:

- progress-data migration;
- persisted daily-hour sanitization;
- `setTodayHours`;
- `setDayHours`;
- `setDefaultDailyHours`;
- Forecast controls;
- Flexible Schedule controls;
- generated templates/scripts that can recreate those controls.

Changing only one UI field would create inconsistent states. A 16-hour value could appear accepted and then be reduced to 12 during persistence or reload.

**P0 invariant:** one canonical module defines the allowed range and normalization behavior.

### 3.3 Scheduling changes can cause apparently missing lessons

For flexible lessons, the stored date is the earliest eligible date, not necessarily the date currently displayed after the scheduler recomputes capacity. Moving one lesson can reveal the next lesson from the same subject while the moved lesson leaves the visible horizon. Without a clear explanation, an overflow section, and dependable undo, this appears to the user as data loss.

**P0/P1 invariant:** no unfinished lesson may disappear without an explicit reason and a recoverable state.

### 3.4 Large components concentrate unrelated responsibilities

Several core files combine rendering, persistence coordination, business rules, drag-and-drop behavior, and modal state. This increases regression risk and makes isolated testing difficult.

Refactoring is justified only where it supports a concrete P0 or P1 change. The project must not be subjected to a broad rewrite.

### 3.5 Persistence is local-first

The app stores progress and catalog data in the browser. This is acceptable for the personal-product scope, but it makes backup, recovery, atomic writes, and error reporting product-critical rather than optional infrastructure.

---

## 4. Design principles

1. **Correctness before polish.** Scheduler and persistence behavior must be verified before visual redesign.
2. **One source of truth.** Limits, normalization rules, and transaction semantics must be defined once.
3. **Explain automation.** A lesson should expose why it appears today and what will happen when it is moved.
4. **Never silently lose work.** Overflow, unplaced fixed lessons, storage failure, and filtered results must remain discoverable.
5. **Undo is part of the operation.** High-impact schedule changes require an immediate reversal path.
6. **Builds are reproducible.** Build and verification commands consume committed source; they do not rewrite it.
7. **Progressive disclosure.** Daily learning remains simple; advanced scheduling detail appears when needed.
8. **Mobile parity without forced imitation.** Mobile may use buttons or menus instead of desktop drag-and-drop, but must retain equivalent capability.
9. **No unnecessary rewrite or dependency.** Existing React, TanStack, Tailwind, Radix, Vitest, and browser-storage patterns remain unless a change is explicitly justified.
10. **Small, independently testable packages.** Each implementation package must be reviewable and deployable without requiring the entire roadmap to finish.

---

## 5. Target information architecture

The main product model remains:

```text
Today
Plan
  ├─ Roadmap
  ├─ Flexible Schedule
  └─ Forecast
Weekly Summary
Settings
Course Manager
Focus Timer
```

The core user journey is:

```text
Open app
→ understand today's workload
→ start a lesson or review
→ complete, pause, or stop a focus session
→ see progress and schedule recomputation
→ undo or adjust when the result is not desired
```

The Plan area must distinguish three concepts:

- **Roadmap order:** canonical learning sequence by subject/topic;
- **Flexible Schedule:** actual capacity-based assignment across dates;
- **Forecast:** aggregate completion estimate based on remaining workload and daily capacity.

These screens may share data but must not present themselves as interchangeable views.

---

# 6. P0 — Reliability and correctness

## 6.1 P0.1 Canonical daily study-hour policy

Create a focused module, proposed path:

```text
src/lib/study-hours.ts
```

Required exports:

```ts
export const MIN_DAILY_STUDY_HOURS = 0;
export const MAX_DAILY_STUDY_HOURS = 16;
export const DAILY_STUDY_HOURS_STEP = 0.5;
export const HIGH_DAILY_STUDY_HOURS_THRESHOLD = 12;

export function normalizeDailyStudyHours(value: number): number;
export function isHighDailyStudyHours(value: number): boolean;
```

Normalization rules:

- non-finite values are rejected at form boundaries and replaced by the relevant default during migration;
- values below 0 become 0;
- values above 16 become 16;
- valid values are rounded to the nearest 0.5 hour;
- `16` must persist and reload as `16`;
- existing values from `0` through `12` must remain unchanged;
- a value above 12 is allowed, not blocked.

UI behavior:

- numeric inputs and sliders use `min=0`, `max=16`, `step=0.5`;
- values from 12.5 through 16 show a non-blocking note:

> Quỹ thời gian rất cao. Hãy tính cả thời gian ăn, nghỉ và phục hồi.

- the message must not reduce the value automatically;
- the warning must not be shown as a destructive error;
- capacity is calculated as `hours × 60`, so 16 hours produces exactly 960 minutes.

Surfaces in scope:

- Today daily capacity control, if present;
- Flexible Schedule per-day controls;
- Forecast default-hours control;
- migration and sanitization;
- all progress-store setters;
- tests and generated-template removal/migration.

Acceptance criteria:

- `0`, `0.5`, `12`, `12.5`, `15.5`, and `16` save and reload correctly;
- `16.5` normalizes to `16`;
- flexible-plan quota for 16 hours is 960 minutes;
- Forecast and Flexible Schedule display the same persisted value;
- no literal `12` remains as a daily-hour maximum outside the canonical module or tests that explicitly verify legacy behavior.

## 6.2 P0.2 Build purity and committed-source authority

The generated result of all current source-patching scripts must be reconciled into committed source. Then remove those patch scripts from normal command chains.

Target scripts:

```json
{
  "dev": "vite dev --host 0.0.0.0 --port 3000",
  "build": "vitest run && vite build",
  "build:dev": "vite build --mode development",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "lint": "eslint ."
}
```

Exact test selection may remain optimized, but it must not depend on rewriting application files first.

Required safeguards:

- run every legacy patch script once in a controlled comparison environment;
- compare its resulting source with the intended committed source;
- preserve all behavior that has already been accepted;
- delete or archive obsolete source-patching scripts only after equivalence is demonstrated;
- add a CI verification that fails when `npm run typecheck`, `npm test`, or `npm run build` leaves tracked files modified;
- `prepare-app-build.mjs` may remain only if converted to a read-only validator or build-output generator that never writes tracked source.

Acceptance criteria:

```bash
npm run typecheck
npm run lint
npm test
npm run build
git diff --exit-code
```

All commands succeed, and the final command reports no tracked changes.

## 6.3 P0.3 Schedule transactions and multi-step undo

Define a common schedule mutation model rather than allowing each screen to invent its own undo behavior.

Proposed types:

```ts
type ScheduleMutationKind =
  | "move-lesson-date"
  | "change-schedule-mode"
  | "change-day-capacity"
  | "reorder-lesson"
  | "bulk-schedule-update";

type ScheduleMutationSnapshot = {
  id: string;
  kind: ScheduleMutationKind;
  createdAt: number;
  subjectsBefore: Subject[];
  plannerSettingsBefore: PlannerSettings;
  description: string;
};
```

Transaction sequence:

```text
capture snapshot
→ produce candidate state
→ validate candidate
→ persist all affected stores
→ publish UI state
→ announce success and undo availability
```

Failure sequence:

```text
candidate or persistence failure
→ keep previous UI and storage
→ expose actionable error
→ do not push an undo entry
```

Undo requirements:

- support at least 20 successful schedule mutations per active browser session;
- `Ctrl+Z`/`Cmd+Z` restores the latest successful schedule mutation;
- keyboard undo is ignored while focus is inside editable text, numeric input, textarea, select, or contenteditable elements;
- an explicit **Undo** button remains visible in Flexible Schedule while history exists;
- undo must restore all state changed by the transaction, not merely one lesson date;
- reloading the app may clear session undo history, but must not corrupt persisted schedule state;
- future design may persist undo history, but that is not required in this package.

## 6.4 P0.4 Scheduler invariants

The scheduler must preserve these invariants:

### Fixed lessons

- are eligible only on their exact scheduled date;
- are never moved automatically to another day;
- if capacity is insufficient, remain visible as **Unplaced on fixed date**;
- contribute to the visible unplaced-minute total;
- can be moved explicitly by the user.

### Flexible lessons

- interpret `scheduledDate` as the earliest eligible date;
- never move before that date;
- may move later when capacity is insufficient;
- preserve canonical order within their subject/topic;
- do not disappear when outside the visible horizon; the UI must expose an out-of-range or unplaced summary.

### Reviews

- are generated from the review rule, not manually reordered as ordinary lessons;
- explain their due interval;
- remain distinguishable from new lessons.

### Capacity

- one day may hold at most its configured quota for capacity-controlled new lessons;
- unplaced fixed work is not falsely counted as successfully scheduled;
- overload, remaining capacity, and unplaced minutes use consistent definitions across Today, Flexible Schedule, and Forecast.

---

# 7. P1 — Core study-flow usability

## 7.1 Today: explain why each item appears

Each Today item should expose a compact reason label:

- **Fixed today**
- **Next in roadmap**
- **Moved here because an earlier day was full**
- **Review due after 1/3/7/14/30 days**
- **Manually moved** when that metadata is available

The default card remains compact. Detailed reasoning may appear in an expandable row, tooltip on desktop, or bottom sheet on mobile.

Today must show:

- subject and topic;
- new lesson or review;
- fixed or flexible mode;
- planned/estimated duration;
- completion CTA;
- start-focus CTA;
- reason for placement;
- overflow or unplaced state when relevant.

## 7.2 Flexible Schedule: capacity-first planning workspace

Required views:

- all subjects;
- one selected subject;
- fixed only;
- flexible only;
- overloaded/unplaced only.

Each day should show:

- date and Today marker;
- configured hours;
- quota minutes;
- scheduled minutes;
- remaining or exceeded minutes;
- unplaced fixed minutes;
- lesson cards grouped or visually distinguishable by subject.

Move interaction:

- desktop: dedicated drag handle and clear whole-day drop target;
- mobile/touch: Move action opens a date chooser or supports reliable touch drag only if accessibility and scrolling are verified;
- keyboard: previous-day/next-day actions remain available;
- successful movement highlights the lesson's destination;
- every movement creates an undoable transaction.

When a moved flexible lesson leaves the visible horizon, the UI must show a confirmation that includes its new earliest date and a direct way to expand the horizon or return to the affected subject.

## 7.3 Roadmap: canonical order, not capacity assignment

Roadmap must represent canonical learning sequence by subject and topic. It must not place an entire roadmap inside Week 1 merely because many lessons share an earliest date.

Roadmap week grouping should be derived from the capacity-based plan or clearly labelled as target grouping. The UI must never imply that hidden overflow has been completed or scheduled.

Required states:

- upcoming in canonical order;
- scheduled in current visible horizon;
- fixed but unplaced;
- outside current horizon;
- complete.

## 7.4 Course Manager decomposition

Refactor only as needed to support reliable editing and ordering. Proposed boundaries:

```text
src/components/course-manager/CourseManagerModal.tsx
src/components/course-manager/SubjectList.tsx
src/components/course-manager/TopicList.tsx
src/components/course-manager/LessonList.tsx
src/components/course-manager/LessonRow.tsx
src/components/course-manager/LessonEditorDialog.tsx
src/components/course-manager/useLessonReorder.ts
```

Responsibilities:

- modal: orchestration and selected IDs;
- subject/topic lists: navigation and counts;
- lesson list: filters and empty states;
- lesson row: display and action controls;
- editor dialog: validation for date, duration, mode, topic, and subject;
- reorder hook: pointer/keyboard operations, drop indicator, edge auto-scroll, and persistence handoff.

The refactor must not change stored IDs or silently reorder existing lessons.

## 7.5 Forecast clarity

Forecast must distinguish:

- total new-learning hours;
- total review hours;
- current daily capacity assumption;
- work outside the selected horizon;
- confidence based on planned versus actual session data.

Changing daily hours must update the forecast immediately and use the same normalized value saved by the progress store.

---

# 8. P2 — Interface, accessibility, and secondary systems

P2 begins only after P0 acceptance and P1 core-flow acceptance.

## 8.1 Design-system cleanup

Standardize rather than redesign from scratch:

- spacing scale;
- card padding;
- corner radius hierarchy;
- primary, secondary, ghost, and destructive actions;
- status colors for fixed, flexible, review, overload, success, and warning;
- typography hierarchy;
- icon size and alignment;
- loading, empty, success, and failure feedback.

## 8.2 Accessibility

Audit and correct:

- visible focus states;
- logical tab order;
- keyboard access to all schedule mutations;
- labelled inputs and buttons;
- contrast for text and status badges;
- reduced-motion preference;
- screen-reader announcements after move, save, undo, and failure;
- minimum touch-target size;
- dialog focus trapping and restoration.

## 8.3 Mobile/PWA

Verify:

- navigation and modals at narrow widths;
- touch-safe schedule movement;
- install/update flow;
- icon and theme appearance;
- offline/error behavior;
- no critical action requires hover;
- no horizontal tab group hides essential subjects without a discoverable scroll affordance.

## 8.4 Secondary product systems

Review after the core planner is stable:

- Pomodoro Studio;
- habits;
- goals;
- streaks and rewards;
- reminders and Web Push;
- weekly summary;
- onboarding and data management.

Each system must justify its place in the daily learning flow. Duplicate information should be removed rather than restyled.

---

## 9. Data and compatibility requirements

- No existing subject, topic, lesson, completion, study session, or reminder ID may change as a side effect of this program.
- Schema migration must preserve all valid historical daily-hour values.
- Raising the maximum from 12 to 16 does not require rewriting values already within range.
- Invalid values above 16 may be normalized during migration without increasing schema complexity unless a schema-version change is otherwise required.
- Storage writes must remain verified and fail closed when the current stored root is invalid or unavailable.
- Import, restore, reset, and bulk scheduling continue to create rollback snapshots where already supported.
- No new server database or account system is included in this program.

---

## 10. Test strategy

### 10.1 Unit tests

Cover:

- daily-hour normalization and warning threshold;
- migration and sanitization;
- 16-hour quota calculation;
- fixed overflow;
- flexible carry-forward;
- canonical lesson order;
- visible out-of-horizon/unplaced summaries;
- transaction snapshot creation;
- undo success and failure;
- storage failure leaves UI state unchanged.

### 10.2 Component tests

Cover:

- Forecast slider/input at 16;
- Flexible Schedule day input at 16;
- high-hour warning at 12.5 and no warning at 12;
- drag/drop destination feedback;
- non-drag move controls;
- subject and status filtering;
- undo button and keyboard shortcut;
- lesson placement-reason labels.

### 10.3 Integration tests

Scenarios:

1. Set daily capacity to 16, reload, and observe 16 with a 960-minute quota.
2. Move a flexible lesson later, observe recomputation, then undo and restore the complete prior schedule.
3. Fill a fixed date beyond capacity and verify every overflow lesson remains visible as unplaced.
4. Filter to English, move one lesson, clear the filter, and verify no unrelated subject order changed.
5. Run build and verification commands and confirm no tracked source changes.
6. Simulate storage failure and verify no false-success message or in-memory-only schedule change.

### 10.4 Manual product audit

Use representative desktop and mobile widths and check:

- first-use comprehension;
- Today-to-focus flow;
- completing and reopening a lesson;
- moving fixed and flexible lessons;
- correcting a mistake with undo;
- changing capacity from 6 to 16 hours;
- finding unplaced work;
- navigating one subject with a long roadmap;
- keyboard-only use;
- PWA reload/update behavior.

---

## 11. Delivery strategy

This design must be implemented as separate, independently testable plans rather than one large change.

Recommended implementation-plan split:

1. **P0A — 16-hour policy and build purity**
2. **P0B — schedule transactions, undo, and scheduler invariants**
3. **P1 — Today, Flexible Schedule, Roadmap, and Course Manager core flow**
4. **P2 — design-system polish, accessibility, mobile, and secondary-system audit**

Each plan must:

- identify exact files;
- begin with failing tests;
- use small reviewable commits;
- run typecheck, targeted tests, full tests, lint, and build as appropriate;
- verify the repository is clean after commands;
- deploy only after its own acceptance criteria pass;
- avoid claiming acceptance solely because Vercel built successfully.

---

## 12. Non-goals

This program does not authorize:

- a full visual rewrite;
- changing the framework;
- adding a backend account system;
- multi-device synchronization;
- replacing the scheduler wholesale without comparative tests;
- adding a large drag-and-drop dependency by default;
- changing review intervals;
- changing XP, coins, streak, or reward economics;
- deleting existing data-recovery behavior;
- merging all phases in one pull request.

---

## 13. Program-level acceptance

The improvement program is accepted only when all of the following are true:

- 16 study hours can be entered, persisted, reloaded, forecast, and scheduled consistently;
- build and verification commands no longer rewrite tracked source;
- fixed overflow never disappears;
- flexible lessons remain explainable when carried forward or outside the visible horizon;
- schedule mutations are atomic and undoable;
- Today explains why each queued item appears;
- Roadmap and Flexible Schedule communicate distinct semantics;
- core course-management actions work with mouse, keyboard, and a viable mobile alternative;
- storage failure never produces false success;
- automated and manual acceptance evidence exists for each package;
- P0 is accepted before P1, and P1 before P2.

---

## 14. Next authorized documentation step

Create the first implementation plan at:

```text
docs/superpowers/plans/2026-08-05-smart-planner-p0a-hours-and-build-purity.md
```

That plan will cover only:

- the canonical 0–16 hour policy;
- all affected persistence and UI surfaces;
- tests for 16-hour behavior;
- reconciliation and removal of source-mutating build scripts;
- clean-tree verification.

It will not implement schedule transactions, P1 UX changes, or P2 polish.
