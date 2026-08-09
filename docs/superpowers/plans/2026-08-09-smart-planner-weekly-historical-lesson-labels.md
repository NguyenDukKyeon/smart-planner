# Smart Planner WEEKLY-HF1 Historical Lesson Labels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace raw lesson IDs in Weekly Summary historical/status sections with deterministic human-readable lesson titles resolved from live and archived catalog metadata, falling back exactly to `Bài học không còn trong lộ trình`.

**Architecture:** Keep `selectWeeklyMetrics()` pure by accepting archived catalog metadata explicitly and emitting `lessonTitle` alongside existing IDs. The dashboard route owns archive loading through the existing custom-subjects storage boundary; `WeeklyStudySummary` renders only the resolved title while preserving IDs internally for keys and joins.

**Tech Stack:** React, TypeScript, Vitest, React DOM server rendering for focused runtime coverage, existing `custom-subjects` archive/storage primitives, GitHub Actions Build diagnostics.

## Global Constraints

- Exact predecessor: `main@5ee26bab12944195f6bd785d738887c6af0afd07`.
- Branch: `fix/weekly-historical-lesson-labels`.
- Canonical title precedence: live lesson title → `archivedCatalog.lessons[].lesson.title` → archived-subject lesson title → exact fallback `Bài học không còn trong lộ trình`.
- Blank or whitespace-only titles do not stop fallback resolution.
- `lessonId` remains stable internal identity but must not be rendered as the visible lesson label in the three affected Weekly Summary sections.
- Archive metadata is display enrichment only; missing/invalid/unavailable archive data must not alter weekly arithmetic, mutate storage, or block Weekly Summary computation.
- Do not change weekly completion/date semantics, focus-session aggregation, habits/goals/streaks, scheduler, Forecast/Roadmap/Flexible Schedule, persistence schema, archive schema, lesson IDs, dependencies, workflows, deployment, or Vercel.
- Use test-first RED → GREEN natural GitHub Actions evidence. A RED is valid only when typecheck/lint pass and the intended behavior assertion fails.
- Do not squash, rebase, amend published commits, force-push, or rewrite history.

---

## File Structure

- `src/lib/weekly-metrics.ts` — pure weekly read model and canonical historical lesson-title resolution.
- `src/lib/weekly-metrics.test.ts` — selector-level precedence, fallback, and arithmetic-preservation coverage.
- `src/components/WeeklyStudySummary.tsx` — presentation only; render `lessonTitle` instead of raw IDs in the three affected sections.
- `src/lib/weekly-study-summary-runtime.test.tsx` — focused server-rendered runtime proof that all three sections show resolved/fallback labels and representative raw IDs are absent from visible HTML.
- `src/routes/index.tsx` — load archived catalog at the route/storage boundary and pass an enrichment-only archive value to `selectWeeklyMetrics()`.
- `docs/superpowers/evidence/2026-08-09-smart-planner-weekly-historical-lesson-labels-completion.md` — exact RED/GREEN/evidence topology and final verification.

---

### Task 1: Pure Weekly Metrics historical-label resolution

**Files:**
- Modify: `src/lib/weekly-metrics.ts`
- Modify: `src/lib/weekly-metrics.test.ts`

**Interfaces:**
- Consumes: `Subject[]`, existing `ProgressState`, and `ArchivedCatalog` from `src/lib/custom-subjects.ts` as explicit selector input.
- Produces: `WeeklyMetrics.lessons.targets[].lessonTitle: string`, `WeeklyMetrics.lessons.outOfPlanCompletions[].lessonTitle: string`, and `WeeklyMetrics.archivedActivity[].lessonTitle: string`.
- Existing IDs/counts/dates/focus totals retain current semantics.

- [ ] **Step 1: Extend selector tests first with title-precedence and fallback cases**

Add `ArchivedCatalog` test fixtures and assertions to `src/lib/weekly-metrics.test.ts` before production code changes. Use concrete cases that prove all precedence levels and arithmetic stability:

```ts
import type { ArchivedCatalog } from "./custom-subjects";

const emptyArchive: ArchivedCatalog = { subjects: [], lessons: [] };
```

For the existing `outside-plan` live lesson, change the expected object to require the live title:

```ts
expect(metrics.lessons.outOfPlanCompletions).toEqual([
  {
    lessonId: "outside-plan",
    lessonTitle: "Ngoài kế hoạch",
    subjectId: "math",
    completedOn: "2026-07-21",
  },
]);
```

Add a table-driven test with these historical IDs:

```ts
const archivedCatalog: ArchivedCatalog = {
  lessons: [
    {
      subjectId: "english",
      subjectName: "Tiếng Anh",
      subjectEmoji: "🇬🇧",
      lesson: {
        id: "archived-standalone",
        title: "Từ vựng Unit 3",
        xp: 20,
        plannedDurationMinutes: 30,
        scheduledDate: "2026-07-01",
        weekday: "Thứ 4",
        sourceSubject: "Tiếng Anh",
        week: 1,
        initialDone: false,
      },
    },
    {
      subjectId: "blank",
      subjectName: "Blank",
      subjectEmoji: "📖",
      lesson: {
        id: "blank-first-source",
        title: "   ",
        xp: 20,
        plannedDurationMinutes: 30,
        scheduledDate: "2026-07-01",
        weekday: "Thứ 4",
        sourceSubject: "Blank",
        week: 1,
        initialDone: false,
      },
    },
  ],
  subjects: [
    {
      id: "archived-subject",
      name: "Vật lý cũ",
      emoji: "⚛️",
      milestones: [
        {
          id: "old-topic",
          title: "Chủ đề cũ",
          subtitle: "",
          lessons: [
            {
              id: "archived-subject-only",
              title: "Dao động cũ",
              xp: 20,
              plannedDurationMinutes: 45,
              scheduledDate: "2026-07-01",
              weekday: "Thứ 4",
              sourceSubject: "Vật lý cũ",
              week: 1,
              initialDone: false,
            },
            {
              id: "blank-first-source",
              title: "Tên hợp lệ từ subject archive",
              xp: 20,
              plannedDurationMinutes: 45,
              scheduledDate: "2026-07-01",
              weekday: "Thứ 4",
              sourceSubject: "Vật lý cũ",
              week: 1,
              initialDone: false,
            },
          ],
        },
      ],
    },
  ],
};
```

Create completed historical entries and one focus session in the selected week, then assert:

```ts
expect(byId.get("archived-standalone")?.lessonTitle).toBe("Từ vựng Unit 3");
expect(byId.get("archived-subject-only")?.lessonTitle).toBe("Dao động cũ");
expect(byId.get("blank-first-source")?.lessonTitle).toBe("Tên hợp lệ từ subject archive");
expect(byId.get("missing-everywhere")?.lessonTitle).toBe("Bài học không còn trong lộ trình");
expect(byId.get("archived-standalone")?.focusMinutes).toBe(/* unchanged expected minutes */);
```

Also assert at least one live weekly target exposes its existing title:

```ts
expect(metrics.lessons.targets.find((item) => item.lessonId === "early")?.lessonTitle).toBe(
  "Hoàn thành sớm",
);
```

- [ ] **Step 2: Commit the test-only RED candidate and verify natural CI fails behaviorally**

Commit only test changes. Expected natural GitHub Actions result:

```text
typecheck: PASS
lint: PASS
tests: FAIL because `lessonTitle` is absent/undefined or expected enriched objects do not match
```

Do not count formatter/type errors as valid RED; correct those with forward-only test commits until the behavioral RED shape is obtained.

- [ ] **Step 3: Implement the minimal pure title resolver in `weekly-metrics.ts`**

Import archive type only:

```ts
import type { ArchivedCatalog } from "./custom-subjects";
```

Extend selector args without adding storage I/O:

```ts
export type WeeklyMetricsArgs = {
  state: ProgressState;
  subjects: Subject[];
  archivedCatalog?: ArchivedCatalog;
  shiftedDates?: Record<string, string>;
  referenceDateISO?: string;
};
```

Add `lessonTitle: string` to the three relevant output entry types.

Build one precedence-preserving lookup. The first non-blank title wins:

```ts
const FALLBACK_LESSON_TITLE = "Bài học không còn trong lộ trình";
const lessonTitles = new Map<string, string>();

const rememberTitle = (lessonId: string, title: unknown) => {
  if (lessonTitles.has(lessonId) || typeof title !== "string") return;
  const normalized = title.trim();
  if (normalized) lessonTitles.set(lessonId, normalized);
};

for (const subject of sortedSubjects) {
  for (const milestone of subject.milestones) {
    for (const lesson of milestone.lessons) rememberTitle(lesson.id, lesson.title);
  }
}
for (const item of archivedCatalog?.lessons ?? []) {
  rememberTitle(item.lesson.id, item.lesson.title);
}
for (const subject of archivedCatalog?.subjects ?? []) {
  for (const milestone of subject.milestones) {
    for (const lesson of milestone.lessons) rememberTitle(lesson.id, lesson.title);
  }
}

const lessonTitle = (lessonId: string) => lessonTitles.get(lessonId) ?? FALLBACK_LESSON_TITLE;
```

Populate `lessonTitle(lesson.id)` for targets, `lessonTitle(lessonId)` for out-of-plan completions, and attach `lessonTitle` only when projecting final `archivedActivity`. Do not change the internal focus/completion accumulator arithmetic merely to carry display metadata.

- [ ] **Step 4: Verify Task 1 GREEN on exact source/test head**

Natural GitHub Actions must show typecheck/lint/tests/build/clean-tree all PASS. Confirm the full existing weekly metrics suite remains green and the new precedence/fallback cases pass.

- [ ] **Step 5: Commit/freeze Task 1 source behavior**

Record exact RED run/job/head and exact GREEN run/job/head for the completion evidence. Do not start Task 2 before Task 1 full GREEN.

---

### Task 2: Archive boundary wiring and Weekly Summary presentation

**Files:**
- Modify: `src/routes/index.tsx`
- Modify: `src/components/WeeklyStudySummary.tsx`
- Create: `src/lib/weekly-study-summary-runtime.test.tsx`

**Interfaces:**
- Consumes: Task 1 `selectWeeklyMetrics({ archivedCatalog })` and emitted `lessonTitle` fields.
- Produces: user-facing Weekly Summary HTML containing titles/fallback text instead of raw IDs in all three affected status sections.
- Archive read errors remain enrichment-only and do not enter the existing critical workspace `storageBlocked` decision for this package.

- [ ] **Step 1: Add a runtime test before changing route/component production code**

Create `src/lib/weekly-study-summary-runtime.test.tsx` using actual `WeeklyStudySummary` and `renderToStaticMarkup` from `react-dom/server`. Build a minimal `WeeklyMetrics` fixture that causes all three affected sections to render:

```ts
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { WeeklyStudySummary } from "@/components/WeeklyStudySummary";
import type { WeeklyMetrics } from "./weekly-metrics";
```

Use representative internal IDs such as:

```ts
const rawIds = [
  "lesson-target-raw-123",
  "lesson-outside-raw-456",
  "lesson-archived-raw-789",
];
```

and corresponding titles:

```text
Bài trạng thái cần lưu ý
Bài hoàn thành ngoài kế hoạch
Bài học không còn trong lộ trình
```

Assert rendered HTML contains all three titles, retains existing status/date/focus details, and does not contain any representative raw ID:

```ts
for (const title of expectedTitles) expect(html).toContain(title);
for (const id of rawIds) expect(html).not.toContain(id);
expect(html).toContain("Hoàn thành, không rõ ngày");
expect(html).toContain("hoàn thành 2026-08-03");
expect(html).toContain("1 giờ 42 phút tập trung");
```

Because current production renders IDs, this is the intended UI RED.

- [ ] **Step 2: Commit the Task 2 test-only RED candidate and verify exact behavioral failure**

Expected natural CI:

```text
typecheck: PASS
lint: PASS
Task 1 selector tests: PASS
runtime test: FAIL because `WeeklyStudySummary` still renders `lessonId`
```

If formatting blocks tests, correct formatting only and obtain a fresh behavioral RED before production changes.

- [ ] **Step 3: Wire archived catalog through the route boundary**

In `src/routes/index.tsx`, extend the existing custom-subjects imports with:

```ts
loadArchivedCatalog,
type ArchivedCatalog,
```

Create a stable empty enrichment value outside the component:

```ts
const EMPTY_ARCHIVED_CATALOG: ArchivedCatalog = { subjects: [], lessons: [] };
```

At the dashboard route boundary, load archive metadata as enrichment only. A suitable bounded pattern is:

```ts
const archivedCatalog = useMemo(() => {
  const loaded = loadArchivedCatalog();
  return loaded.status === "ok" ? loaded.value : EMPTY_ARCHIVED_CATALOG;
}, [subjects]);
```

Then pass it into the existing weekly selector call:

```ts
selectWeeklyMetrics({
  state,
  subjects,
  archivedCatalog,
  shiftedDates,
  referenceDateISO: todayISO(),
});
```

Include `archivedCatalog` in that `useMemo` dependency list.

Do **not** add archive failure to `storageBlocked`, do not clear/reset corrupt archive bytes, and do not add a new recovery UI in this hotfix. Existing catalog mutations change `subjects`, so `[subjects]` is the bounded invalidation trigger for archive enrichment; reset already reloads the page.

- [ ] **Step 4: Replace visible raw IDs with `lessonTitle` in all three sections**

Change only visible text in `src/components/WeeklyStudySummary.tsx`:

```tsx
<strong className="text-slate-800">{target.lessonTitle}:</strong>
```

```tsx
{metrics.lessons.outOfPlanCompletions.map((item) => item.lessonTitle).join(", ")}
```

```tsx
<li key={activity.lessonId}>
  {activity.lessonTitle}
  {activity.completedOn ? ` · hoàn thành ${activity.completedOn}` : ""}
  {activity.focusMinutes > 0 ? ` · ${minutesLabel(activity.focusMinutes)} tập trung` : ""}
</li>
```

Keep `lessonId` as the React key/internal identity. Do not expose it in tooltip/title/secondary text.

- [ ] **Step 5: Verify Task 2 GREEN and full repository gates**

Natural GitHub Actions on the exact final source/test head must pass:

```text
npm run typecheck
npm run lint
npm test
npm run build
git diff --exit-code
```

Confirm the runtime test proves all three sections and raw-ID absence, and confirm existing weekly metric arithmetic tests remain unchanged apart from the new display fields.

- [ ] **Step 6: Audit exact diff and freeze production/test source head**

Compare exact predecessor `5ee26bab12944195f6bd785d738887c6af0afd07` to the final source/test head. Expected production/test scope is limited to:

```text
src/lib/weekly-metrics.ts
src/lib/weekly-metrics.test.ts
src/components/WeeklyStudySummary.tsx
src/lib/weekly-study-summary-runtime.test.tsx
src/routes/index.tsx
```

plus approved spec/plan docs. Any unrelated scheduler, persistence-schema, dependency, workflow, Forecast, Roadmap, Flexible Schedule, habits, goals, or P2 diff is a rejection condition.

---

### Task 3: Completion evidence and independent review gate

**Files:**
- Create: `docs/superpowers/evidence/2026-08-09-smart-planner-weekly-historical-lesson-labels-completion.md`

**Interfaces:**
- Consumes: frozen final source/test head and all natural GitHub Actions RED/GREEN records.
- Produces: one docs-only evidence head suitable for fresh independent review.

- [ ] **Step 1: Write exact completion evidence without changing source/tests**

Record:

- exact predecessor;
- approved design/spec commit;
- implementation plan commit;
- valid Task 1 RED and GREEN heads/runs/jobs;
- valid Task 2 RED and GREEN heads/runs/jobs;
- literal final source/test head;
- exact changed-file scope;
- selector precedence/fallback proof;
- runtime proof that the three affected sections render titles and representative raw IDs are absent;
- full typecheck/lint/test/build/clean-tree results;
- known pre-existing warnings separately from package findings.

- [ ] **Step 2: Commit evidence as exactly one docs-only successor to the frozen source/test head**

Verify source/test head → evidence head is exactly one commit and changes only the evidence document.

- [ ] **Step 3: Obtain natural exact-evidence-head GREEN CI**

Do not claim completion from an earlier source/test run alone. Exact evidence head must receive its own natural GitHub Actions run with all gates PASS.

- [ ] **Step 4: Perform fresh Independent Review**

Fresh-read the exact evidence head rather than reusing implementer assumptions. Verify:

1. live title precedence;
2. archived standalone precedence;
3. archived-subject precedence;
4. exact fallback text;
5. blank-title fallthrough;
6. all three Weekly Summary sections use `lessonTitle` visibly;
7. representative raw IDs are absent from visible runtime HTML;
8. completion dates/focus minutes are preserved;
9. selector is pure and archive is explicit input;
10. route archive failures are enrichment-only and do not mutate/reset/block the dashboard;
11. no storage/schema/scheduler/dependency/P2 scope expansion;
12. exact-head CI and final diff are clean.

Return only one package disposition:

```text
WEEKLY-HF1 IMPLEMENTED / ACCEPTED / NOT_MERGED
```

or

```text
WEEKLY-HF1 IMPLEMENTED / REJECTED / NOT_MERGED
```

Do not mark ready or merge during independent review. Merge remains a separate explicit authorization.
