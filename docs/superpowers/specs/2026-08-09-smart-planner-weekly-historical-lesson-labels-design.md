# Smart Planner WEEKLY-HF1 — Historical Lesson Labels Design

**Status:** Approved design candidate; implementation not yet authorized by this document alone  
**Date:** 2026-08-09  
**Repository:** `NguyenDukKyeon/smart-planner`  
**Exact predecessor:** `main@5ee26bab12944195f6bd785d738887c6af0afd07`  
**Branch:** `fix/weekly-historical-lesson-labels`

## 1. Purpose

Fix Weekly Summary user-facing historical lesson labels so raw internal lesson IDs such as `lesson-toan-...` are never used as display names in the warning/status sections.

This is a bounded read-model/presentation hotfix. It does not change weekly completion arithmetic, scheduler behavior, focus-time accounting, persistence schema, archive schema, restore/delete behavior, or the broader P2 program.

## 2. Root cause

At the exact predecessor:

- `src/lib/weekly-metrics.ts` builds live lesson identity from the current `subjects` catalog but emits only `lessonId`/`subjectId` for lesson targets and out-of-plan completions;
- deleted historical activity is accumulated by `lessonId` only;
- `src/components/WeeklyStudySummary.tsx` renders those IDs directly in three user-facing areas:
  - non-standard target status;
  - out-of-plan completions;
  - archived/deleted activity;
- the existing archived catalog already retains historical lesson metadata through both `ArchivedCatalog.lessons` and archived full subjects, but Weekly Metrics does not receive or use that metadata.

Therefore the bug is not an ID-formatting problem. The display read model is missing historical lesson labels.

## 3. Chosen architecture

Resolve lesson display metadata in the pure Weekly Metrics read-model, not inside the React component and not by parsing IDs.

`selectWeeklyMetrics()` receives archived catalog data as an explicit input. The route/storage boundary owns loading archived metadata. The selector remains deterministic and performs no browser-storage I/O.

The UI receives resolved `lessonTitle` values and renders those values. `lessonId` remains present as stable identity for keys, joins, audit/debug data, and tests, but is not rendered as the user-facing label in the affected Weekly Summary sections.

## 4. Canonical label precedence

For any lesson ID that needs a Weekly Summary label, resolve in this exact order:

1. **Live catalog lesson title** from current `subjects`.
2. **Archived standalone lesson title** from `archivedCatalog.lessons[].lesson`.
3. **Archived subject lesson title** by traversing `archivedCatalog.subjects[].milestones[].lessons`.
4. Exact fallback text:

   `Bài học không còn trong lộ trình`

A candidate title must contain non-whitespace text. Blank/whitespace-only titles do not stop fallback resolution.

No raw lesson ID may be substituted as the fallback display label.

## 5. Read-model contract

Extend the relevant Weekly Metrics entries with a resolved `lessonTitle: string` while preserving existing identity and arithmetic fields.

At minimum this applies to:

- `lessons.targets[]`;
- `lessons.outOfPlanCompletions[]`;
- `archivedActivity[]`.

The existing fields such as `lessonId`, `subjectId`, `completedOn`, `focusMinutes`, completion status, target totals, met totals, and rates keep their current semantics.

The selector may build one internal lookup map for efficient resolution, but it must not mutate live subjects or archived catalog input.

## 6. Archived-catalog boundary and failure behavior

The dashboard route/storage layer loads archived catalog metadata through the existing `custom-subjects` archive reader boundary and supplies the successful value to Weekly Metrics.

Archive metadata is **display enrichment only** for this package:

- archive `ok` → use archived metadata;
- archive `missing` → use an empty archive;
- archive `invalid` or `unavailable` → do not mutate/reset archive bytes and do not block weekly metric computation solely for this label feature; use an empty archive for label resolution, which produces live titles where possible and the exact fallback where not.

This hotfix does not add a new archive recovery workflow, persistence migration, or storage mutation.

## 7. Presentation contract

`WeeklyStudySummary` must render `lessonTitle` rather than `lessonId` in all three affected user-facing sections:

1. `Trạng thái bài học cần lưu ý`
2. `Bài hoàn thành trong tuần nhưng ngoài kế hoạch tuần`
3. `Hoạt động từ bài đã xóa khỏi lộ trình`

Existing completion-date and focus-time details remain unchanged.

`lessonId` may still be used as React keys and internal identity, but it must not appear as the visible label in those sections.

## 8. Required behavior examples

### 8.1 Live out-of-plan lesson

A live lesson with ID `outside-plan` and title `Ngoài kế hoạch` completed during the week but scheduled outside the weekly plan renders:

`Ngoài kế hoạch`

not `outside-plan`.

### 8.2 Archived standalone lesson

A deleted lesson present in `archivedCatalog.lessons` renders its archived `lesson.title` while retaining its historical completion/focus details.

### 8.3 Lesson only retained inside an archived subject

If a deleted lesson is absent from `archivedCatalog.lessons` but exists inside an archived subject, Weekly Summary still renders that historical lesson title.

### 8.4 Metadata unavailable

If the lesson is absent from the live catalog, archived standalone lessons, and archived subjects, render exactly:

`Bài học không còn trong lộ trình`

No UUID/raw ID is shown as the title.

### 8.5 Non-standard weekly target

A live target with `completed-undated` or `completed-after-week` status renders its live lesson title followed by the existing completion-status label, not its ID.

## 9. TDD and verification requirements

Implementation must begin with failing tests before production changes.

Required regression coverage:

1. live target/out-of-plan entries expose the live lesson title;
2. archived standalone lesson title resolves correctly;
3. archived-subject-only lesson title resolves correctly;
4. unresolved historical lesson uses exact fallback `Bài học không còn trong lộ trình`;
5. blank archived/live title does not suppress the next valid fallback source;
6. archived completion/focus arithmetic remains unchanged;
7. runtime Weekly Summary renders resolved titles in all three affected sections;
8. runtime Weekly Summary does not render representative raw `lesson-...` IDs as visible labels;
9. archive missing/invalid-equivalent input cannot break weekly metric computation;
10. existing weekly target totals, met totals, rates, daily focus time, habit metrics, and subject metrics remain unchanged.

Natural GitHub Actions evidence must show:

- typecheck PASS;
- lint PASS with no new errors;
- targeted/full tests PASS;
- production build PASS;
- clean-tree verification PASS.

## 10. Intended implementation surface

Expected bounded production/test surface:

- `src/lib/weekly-metrics.ts`
- `src/lib/weekly-metrics.test.ts`
- `src/components/WeeklyStudySummary.tsx`
- focused Weekly Summary runtime/regression test file(s)
- `src/routes/index.tsx` only as needed to load/pass archived catalog metadata through the existing storage boundary
- package design/plan/evidence documents

`src/lib/custom-subjects.ts` should not require archive-schema changes. If implementation proves a tiny exported pure helper is necessary, that requires explicit evidence in the implementation plan and must not change storage semantics.

## 11. Explicit non-goals

This package does not authorize:

- changing weekly completion definitions or date boundaries;
- changing focus-session aggregation;
- changing habit/goal/streak behavior;
- changing scheduler or Forecast/Roadmap/Flexible Schedule behavior;
- storing title snapshots into progress sessions/completions;
- changing lesson IDs;
- migrating persistence or archived catalog schema;
- deleting historical activity;
- exposing raw IDs through tooltips or alternate user-facing text;
- broad Weekly Summary redesign;
- P2 design-system/accessibility/mobile work;
- dependency, workflow, deployment, or Vercel changes.

## 12. Acceptance criteria

WEEKLY-HF1 is acceptable only when all are true:

1. all three affected Weekly Summary sections use resolved human-readable lesson labels;
2. live metadata has highest precedence;
3. archived standalone metadata has second precedence;
4. archived-subject metadata has third precedence;
5. unresolved metadata uses exactly `Bài học không còn trong lộ trình`;
6. representative raw `lesson-...` IDs are absent from visible labels in those sections;
7. historical completion dates and focus minutes remain accurate;
8. weekly metric arithmetic is unchanged except for added display metadata;
9. selector remains pure and receives archive data explicitly;
10. archive read failure cannot silently overwrite/reset archive data;
11. no persistence/schema/scheduler/dependency expansion occurs;
12. RED→GREEN and exact-head natural CI evidence pass before independent review.
