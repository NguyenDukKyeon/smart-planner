# Smart Planner P1B Flexible Schedule Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Flexible Schedule into a capacity-first workspace with independent subject/status filters, explicit day metrics, direct date selection, and truthful outside-horizon feedback while preserving the P0B transaction boundary.

**Architecture:** Add one pure selector/metrics module and extend the existing visibility helper, then compose both from `FlexiblePlanner`. Add a focused Radix dialog that owns only direct-date input state and delegates every mutation to the existing `moveLessonToDate()` callback. Post-move visibility is resolved only after the parent-published catalog reflects the committed target date, preventing stale-render false positives.

**Tech Stack:** React 19, TypeScript 5.8, Vitest 4, Radix Dialog, Tailwind CSS, TanStack Start, existing browser-local schedule transactions.

## Global Constraints

- Work on `improve/p1b-flexible-schedule-workspace` from exact predecessor `main@8a23a4e88890ba1deb4619527ae8d1094c423105`.
- Preserve `P0B ACCEPTED / INTEGRATED` and `P1A ACCEPTED / INTEGRATED` behavior.
- Do not change scheduler semantics, review intervals, review budgets, persistence ownership, or transaction-controller behavior.
- Every drag, arrow, and direct-date move must call the single `moveLessonToDate()` boundary in `FlexiblePlanner`.
- A failed mutation must publish no candidate, append no undo history, close no move dialog, and create no outside-horizon success notice.
- A same-date move remains a canonical no-op with no persistence, clock call, or undo entry.
- Do not add a dependency, schema migration, workflow change, touch-drag implementation, Roadmap change, Course Manager refactor, Forecast change, or broad visual redesign.
- Filters and outside-horizon notices are transient UI state and are not persisted.
- `unplacedFixedMinutes` must never be counted as scheduled minutes.
- Use exact Vietnamese copy from this plan unless a test requires a smaller accessibility label.
- Preserve published Lovable history: no squash, rebase, amend, force-push, or branch-history rewriting.
- P1B remains `NOT_ACCEPTED` until independent review records an acceptance decision.

---

## File Structure

### Create

- `src/lib/flexible-schedule-workspace.ts` — pure item filtering, attention detection, day metrics, and bounded horizon calculations.
- `src/lib/flexible-schedule-workspace.test.ts` — unit tests for the pure workspace module.
- `src/components/flexible-planner/MoveLessonDateDialog.tsx` — accessible direct-date trigger and dialog that delegates to `moveLessonToDate()`.

### Modify

- `src/lib/schedule-visibility.ts` — add optional subject-scoped unfinished/visible/outside-horizon accounting.
- `src/lib/schedule-visibility.test.ts` — preserve all-subject behavior and cover valid/unknown subject scopes.
- `src/components/FlexiblePlanner.tsx` — compose filters, metrics, dialog, visibility summary, post-move notice, and bounded horizon expansion.
- `src/lib/flexible-planner-ux-regression.test.ts` — protect user-visible controls, copy, accessibility, and absence of custom touch drag.
- `src/lib/flexible-planner-transactions-regression.test.ts` — protect the single mutation boundary and prohibit persistence ownership in the dialog.

### Explicitly unchanged

- `src/lib/planner.ts`
- `src/lib/schedule-candidates.ts`
- `src/lib/schedule-transactions.ts`
- `src/lib/schedule-mutation-controller.ts`
- `src/lib/schedule-persistence.ts`
- `src/lib/progress-store.ts`
- `package.json`
- lockfiles
- `.github/workflows/**`

---

### Task 1: Add pure workspace filtering, metrics, and horizon calculations

**Files:**
- Create: `src/lib/flexible-schedule-workspace.ts`
- Create: `src/lib/flexible-schedule-workspace.test.ts`

**Interfaces:**
- Consumes:
  - `Lesson` from `src/lib/mock-data.ts`
  - `DayQueue` from `src/lib/planner.ts`
  - `daysBetweenISO()` and `getSundayISO()` from `src/lib/date-utils.ts`
- Produces:

```ts
export type FlexibleScheduleStatusFilter = "all" | "fixed" | "flexible" | "attention";

export type FlexibleScheduleWorkspaceItem = {
  kind: "lesson" | "review";
  subjectId: string;
  lesson: Pick<Lesson, "scheduleMode">;
  unplacedFixed?: boolean;
};

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

export type HorizonExpansionResult = {
  weeks: number;
  includesTarget: boolean;
  reason: "included" | "before-start" | "beyond-max";
};

export function filterFlexibleScheduleItems<T extends FlexibleScheduleWorkspaceItem>(
  items: readonly T[],
  params: {
    subjectId: string;
    statusFilter: FlexibleScheduleStatusFilter;
  },
): T[];

export function isFlexibleScheduleAttentionDay(
  queue: Pick<DayQueue, "overloadMinutes" | "unplacedFixedMinutes">,
): boolean;

export function deriveFlexibleScheduleDayMetrics(
  queue: Pick<
    DayQueue,
    | "quotaMinutes"
    | "newMinutes"
    | "reviewMinutes"
    | "unallocatedMinutes"
    | "overloadMinutes"
    | "unplacedFixedMinutes"
  >,
): FlexibleScheduleDayMetrics;

export function calculateMinimumHorizonWeeks(params: {
  todayDateISO: string;
  targetDateISO: string;
  maxWeeks?: number;
}): HorizonExpansionResult;
```

- [ ] **Step 1: Write failing filter-classification tests**

Create `src/lib/flexible-schedule-workspace.test.ts` with these fixtures and assertions:

```ts
import { describe, expect, test } from "vitest";
import type { Lesson } from "./mock-data";
import {
  calculateMinimumHorizonWeeks,
  deriveFlexibleScheduleDayMetrics,
  filterFlexibleScheduleItems,
  isFlexibleScheduleAttentionDay,
  type FlexibleScheduleWorkspaceItem,
} from "./flexible-schedule-workspace";

type TestItem = FlexibleScheduleWorkspaceItem & { id: string };

function item(params: {
  id: string;
  subjectId: string;
  kind?: "lesson" | "review";
  mode?: Lesson["scheduleMode"];
  unplacedFixed?: boolean;
}): TestItem {
  return {
    id: params.id,
    subjectId: params.subjectId,
    kind: params.kind ?? "lesson",
    lesson: { scheduleMode: params.mode },
    unplacedFixed: params.unplacedFixed,
  };
}

const items = [
  item({ id: "math-fixed", subjectId: "math", mode: "fixed" }),
  item({ id: "math-flex", subjectId: "math", mode: "flexible" }),
  item({ id: "math-unplaced", subjectId: "math", mode: "fixed", unplacedFixed: true }),
  item({ id: "math-review", subjectId: "math", kind: "review" }),
  item({ id: "english-flex", subjectId: "english", mode: "flexible" }),
];

describe("filterFlexibleScheduleItems", () => {
  test("combines subject and all-status filtering", () => {
    expect(
      filterFlexibleScheduleItems(items, { subjectId: "math", statusFilter: "all" }).map(
        (entry) => entry.id,
      ),
    ).toEqual(["math-fixed", "math-flex", "math-unplaced", "math-review"]);
  });

  test("shows fixed ordinary lessons including unplaced fixed work", () => {
    expect(
      filterFlexibleScheduleItems(items, { subjectId: "all", statusFilter: "fixed" }).map(
        (entry) => entry.id,
      ),
    ).toEqual(["math-fixed", "math-unplaced"]);
  });

  test("shows only flexible ordinary lessons", () => {
    expect(
      filterFlexibleScheduleItems(items, { subjectId: "all", statusFilter: "flexible" }).map(
        (entry) => entry.id,
      ),
    ).toEqual(["math-flex", "english-flex"]);
  });

  test("treats attention as day-level and therefore preserves subject-filtered context", () => {
    expect(
      filterFlexibleScheduleItems(items, { subjectId: "math", statusFilter: "attention" }).map(
        (entry) => entry.id,
      ),
    ).toEqual(["math-fixed", "math-flex", "math-unplaced", "math-review"]);
  });
});
```

- [ ] **Step 2: Run the new test file and verify RED**

Run:

```bash
npx vitest run src/lib/flexible-schedule-workspace.test.ts
```

Expected: FAIL because `./flexible-schedule-workspace` does not exist.

- [ ] **Step 3: Implement the filter type and function minimally**

Create `src/lib/flexible-schedule-workspace.ts` with imports, exported types, and this filtering rule:

```ts
import type { Lesson } from "./mock-data";
import type { DayQueue } from "./planner";
import { daysBetweenISO, getSundayISO } from "./date-utils";

export type FlexibleScheduleStatusFilter = "all" | "fixed" | "flexible" | "attention";

export type FlexibleScheduleWorkspaceItem = {
  kind: "lesson" | "review";
  subjectId: string;
  lesson: Pick<Lesson, "scheduleMode">;
  unplacedFixed?: boolean;
};

function effectiveMode(item: FlexibleScheduleWorkspaceItem): "fixed" | "flexible" {
  return item.lesson.scheduleMode ?? "flexible";
}

export function filterFlexibleScheduleItems<T extends FlexibleScheduleWorkspaceItem>(
  items: readonly T[],
  params: { subjectId: string; statusFilter: FlexibleScheduleStatusFilter },
): T[] {
  const subjectScoped =
    params.subjectId === "all"
      ? items
      : items.filter((entry) => entry.subjectId === params.subjectId);

  if (params.statusFilter === "all" || params.statusFilter === "attention") {
    return [...subjectScoped];
  }

  return subjectScoped.filter(
    (entry) => entry.kind === "lesson" && effectiveMode(entry) === params.statusFilter,
  );
}
```

- [ ] **Step 4: Run the filter tests and verify GREEN**

Run:

```bash
npx vitest run src/lib/flexible-schedule-workspace.test.ts
```

Expected: PASS for the four filter cases.

- [ ] **Step 5: Add failing attention and metric tests**

Append:

```ts
describe("day diagnostics", () => {
  test.each([
    [{ overloadMinutes: 1, unplacedFixedMinutes: 0 }, true],
    [{ overloadMinutes: 0, unplacedFixedMinutes: 30 }, true],
    [{ overloadMinutes: 0, unplacedFixedMinutes: 0 }, false],
  ] as const)("detects attention state %#", (queue, expected) => {
    expect(isFlexibleScheduleAttentionDay(queue)).toBe(expected);
  });

  test("derives scheduled minutes without counting unplaced fixed work", () => {
    expect(
      deriveFlexibleScheduleDayMetrics({
        quotaMinutes: 360,
        newMinutes: 240,
        reviewMinutes: 30,
        unallocatedMinutes: 90,
        overloadMinutes: 0,
        unplacedFixedMinutes: 60,
      }),
    ).toEqual({
      quotaMinutes: 360,
      scheduledMinutes: 270,
      newMinutes: 240,
      reviewMinutes: 30,
      unallocatedMinutes: 90,
      overloadMinutes: 0,
      unplacedFixedMinutes: 60,
      attentionRequired: true,
    });
  });
});
```

- [ ] **Step 6: Run the test and verify RED**

Run:

```bash
npx vitest run src/lib/flexible-schedule-workspace.test.ts
```

Expected: FAIL because the attention and metric functions are not exported.

- [ ] **Step 7: Implement attention and metrics minimally**

Add:

```ts
export function isFlexibleScheduleAttentionDay(
  queue: Pick<DayQueue, "overloadMinutes" | "unplacedFixedMinutes">,
): boolean {
  return queue.overloadMinutes > 0 || queue.unplacedFixedMinutes > 0;
}

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

export function deriveFlexibleScheduleDayMetrics(
  queue: Pick<
    DayQueue,
    | "quotaMinutes"
    | "newMinutes"
    | "reviewMinutes"
    | "unallocatedMinutes"
    | "overloadMinutes"
    | "unplacedFixedMinutes"
  >,
): FlexibleScheduleDayMetrics {
  return {
    quotaMinutes: queue.quotaMinutes,
    scheduledMinutes: queue.newMinutes + queue.reviewMinutes,
    newMinutes: queue.newMinutes,
    reviewMinutes: queue.reviewMinutes,
    unallocatedMinutes: queue.unallocatedMinutes,
    overloadMinutes: queue.overloadMinutes,
    unplacedFixedMinutes: queue.unplacedFixedMinutes,
    attentionRequired: isFlexibleScheduleAttentionDay(queue),
  };
}
```

- [ ] **Step 8: Run the test and verify GREEN**

Run:

```bash
npx vitest run src/lib/flexible-schedule-workspace.test.ts
```

Expected: PASS.

- [ ] **Step 9: Add failing bounded-horizon tests**

Append:

```ts
describe("calculateMinimumHorizonWeeks", () => {
  test("uses one week for a target inside the partial first week", () => {
    expect(
      calculateMinimumHorizonWeeks({
        todayDateISO: "2030-01-02",
        targetDateISO: "2030-01-06",
      }),
    ).toEqual({ weeks: 1, includesTarget: true, reason: "included" });
  });

  test("returns the minimum whole-week count for a reachable later target", () => {
    expect(
      calculateMinimumHorizonWeeks({
        todayDateISO: "2030-01-02",
        targetDateISO: "2030-01-15",
      }),
    ).toEqual({ weeks: 3, includesTarget: true, reason: "included" });
  });

  test("bounds a far-future target to 52 weeks", () => {
    expect(
      calculateMinimumHorizonWeeks({
        todayDateISO: "2030-01-02",
        targetDateISO: "2032-01-01",
      }),
    ).toEqual({ weeks: 52, includesTarget: false, reason: "beyond-max" });
  });

  test("reports that forward-only expansion cannot include a past target", () => {
    expect(
      calculateMinimumHorizonWeeks({
        todayDateISO: "2030-01-02",
        targetDateISO: "2030-01-01",
      }),
    ).toEqual({ weeks: 1, includesTarget: false, reason: "before-start" });
  });
});
```

- [ ] **Step 10: Run the test and verify RED**

Run:

```bash
npx vitest run src/lib/flexible-schedule-workspace.test.ts
```

Expected: FAIL because `calculateMinimumHorizonWeeks()` is not implemented.

- [ ] **Step 11: Implement the bounded calculation**

Add:

```ts
export type HorizonExpansionResult = {
  weeks: number;
  includesTarget: boolean;
  reason: "included" | "before-start" | "beyond-max";
};

export function calculateMinimumHorizonWeeks(params: {
  todayDateISO: string;
  targetDateISO: string;
  maxWeeks?: number;
}): HorizonExpansionResult {
  const maxWeeks = Math.max(1, Math.floor(params.maxWeeks ?? 52));
  if (params.targetDateISO < params.todayDateISO) {
    return { weeks: 1, includesTarget: false, reason: "before-start" };
  }

  const firstWeekEndISO = getSundayISO(params.todayDateISO);
  if (params.targetDateISO <= firstWeekEndISO) {
    return { weeks: 1, includesTarget: true, reason: "included" };
  }

  const laterDays = daysBetweenISO(firstWeekEndISO, params.targetDateISO);
  const requiredWeeks = 1 + Math.ceil(laterDays / 7);
  if (requiredWeeks > maxWeeks) {
    return { weeks: maxWeeks, includesTarget: false, reason: "beyond-max" };
  }

  return { weeks: requiredWeeks, includesTarget: true, reason: "included" };
}
```

- [ ] **Step 12: Run focused tests and typecheck**

Run:

```bash
npx vitest run src/lib/flexible-schedule-workspace.test.ts
npm run typecheck
```

Expected: both pass.

- [ ] **Step 13: Commit Task 1**

```bash
git add src/lib/flexible-schedule-workspace.ts src/lib/flexible-schedule-workspace.test.ts
git commit -m "feat: add flexible schedule workspace selectors"
```

---

### Task 2: Add subject-scoped outside-horizon accounting

**Files:**
- Modify: `src/lib/schedule-visibility.ts`
- Modify: `src/lib/schedule-visibility.test.ts`

**Interfaces:**
- Consumes: existing `Subject[]`, completion map, and `PlanDay[]`.
- Produces:

```ts
export function summarizeUnscheduledWork(params: {
  subjects: Subject[];
  completed: Record<string, string>;
  visiblePlan: PlanDay[];
  subjectId?: string;
}): UnscheduledWorkSummary;
```

- [ ] **Step 1: Refactor the test catalog fixture to support two subjects**

In `src/lib/schedule-visibility.test.ts`, retain the existing `catalog()` helper and add:

```ts
function subject(id: string, lessons: Lesson[]): Subject {
  return {
    id,
    name: id,
    emoji: "🧪",
    milestones: [
      {
        id: `${id}-topic`,
        title: "Chủ đề",
        subtitle: `${lessons.length} bài học`,
        lessons,
      },
    ],
  };
}
```

Do not change the three existing assertions.

- [ ] **Step 2: Add failing selected-subject and unknown-subject tests**

Append:

```ts
test("summarizes only the selected subject while preserving visible unplaced work", () => {
  const mathVisible = lesson("math-visible", "2030-01-01");
  const mathOutside = lesson("math-outside", "2030-01-10");
  const englishVisible = lesson("english-visible", "2030-01-01");
  const mathUnplaced = {
    ...lesson("math-unplaced", "2030-01-01"),
    scheduleMode: "fixed" as const,
  };

  expect(
    summarizeUnscheduledWork({
      subjects: [
        subject("math", [mathVisible, mathOutside, mathUnplaced]),
        subject("english", [englishVisible]),
      ],
      completed: {},
      visiblePlan: [
        planDay({
          dateISO: "2030-01-01",
          newLessons: [mathVisible, englishVisible],
          unplacedFixedLessons: [mathUnplaced],
        }),
      ],
      subjectId: "math",
    }),
  ).toEqual({
    unfinishedCount: 3,
    visibleScheduledCount: 1,
    outsideHorizonCount: 1,
    outsideHorizonLessonIds: ["math-outside"],
  });
});

test("returns zero counts for an unknown subject instead of falling back to all", () => {
  expect(
    summarizeUnscheduledWork({
      subjects: [subject("math", [lesson("math", "2030-01-01")])],
      completed: {},
      visiblePlan: [],
      subjectId: "missing",
    }),
  ).toEqual({
    unfinishedCount: 0,
    visibleScheduledCount: 0,
    outsideHorizonCount: 0,
    outsideHorizonLessonIds: [],
  });
});
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```bash
npx vitest run src/lib/schedule-visibility.test.ts
```

Expected: the selected-subject assertion fails because `subjectId` is ignored; the unknown subject falls back to all work.

- [ ] **Step 4: Implement subject scoping without changing default behavior**

Update `summarizeUnscheduledWork()` as follows:

```ts
export function summarizeUnscheduledWork(params: {
  subjects: Subject[];
  completed: Record<string, string>;
  visiblePlan: PlanDay[];
  subjectId?: string;
}): UnscheduledWorkSummary {
  const scopedSubjects =
    !params.subjectId || params.subjectId === "all"
      ? params.subjects
      : params.subjects.filter((subject) => subject.id === params.subjectId);

  const unfinishedLessonIds: string[] = [];
  const knownLessonIds = new Set<string>();
  const scopedLessonIds = new Set<string>();

  for (const subject of scopedSubjects) {
    for (const milestone of subject.milestones) {
      for (const lesson of milestone.lessons) {
        scopedLessonIds.add(lesson.id);
        if (knownLessonIds.has(lesson.id)) continue;
        knownLessonIds.add(lesson.id);
        if (!params.completed[lesson.id]) unfinishedLessonIds.push(lesson.id);
      }
    }
  }

  const visibleScheduledIds = new Set<string>();
  const visibleUnfinishedIds = new Set<string>();

  for (const day of params.visiblePlan) {
    for (const lesson of day.queue.newLessons) {
      if (!scopedLessonIds.has(lesson.id)) continue;
      visibleScheduledIds.add(lesson.id);
      visibleUnfinishedIds.add(lesson.id);
    }
    for (const lesson of day.queue.unplacedFixedLessons) {
      if (scopedLessonIds.has(lesson.id)) visibleUnfinishedIds.add(lesson.id);
    }
  }

  const outsideHorizonLessonIds = unfinishedLessonIds.filter(
    (lessonId) => !visibleUnfinishedIds.has(lessonId),
  );

  return {
    unfinishedCount: unfinishedLessonIds.length,
    visibleScheduledCount: unfinishedLessonIds.filter((lessonId) =>
      visibleScheduledIds.has(lessonId),
    ).length,
    outsideHorizonCount: outsideHorizonLessonIds.length,
    outsideHorizonLessonIds,
  };
}
```

- [ ] **Step 5: Run visibility tests and typecheck**

Run:

```bash
npx vitest run src/lib/schedule-visibility.test.ts
npm run typecheck
```

Expected: all existing and new tests pass.

- [ ] **Step 6: Commit Task 2**

```bash
git add src/lib/schedule-visibility.ts src/lib/schedule-visibility.test.ts
git commit -m "feat: scope schedule visibility by subject"
```

---

### Task 3: Add the accessible direct-date dialog

**Files:**
- Create: `src/components/flexible-planner/MoveLessonDateDialog.tsx`
- Modify: `src/lib/flexible-planner-ux-regression.test.ts`

**Interfaces:**
- Consumes:

```ts
export type MoveLessonDateDialogProps = {
  lesson: Lesson;
  onMove: (lessonId: string, targetDateISO: string) => boolean;
};
```

- Produces: one visible `Chọn ngày` trigger; a controlled internal Radix dialog; no persistence or candidate ownership.

- [ ] **Step 1: Write a failing source-contract test for the new dialog**

In `src/lib/flexible-planner-ux-regression.test.ts`, read the new file:

```ts
const moveDialogSource = await fs.readFile(
  new URL("../components/flexible-planner/MoveLessonDateDialog.tsx", import.meta.url),
  "utf8",
);
```

Add assertions inside the existing test or a new focused test:

```ts
expect(moveDialogSource).toContain("MoveLessonDateDialog");
expect(moveDialogSource).toContain("DialogTrigger");
expect(moveDialogSource).toContain("Chọn ngày");
expect(moveDialogSource).toContain('type="date"');
expect(moveDialogSource).toContain("isDateISO");
expect(moveDialogSource).toContain("Ngày mới");
expect(moveDialogSource).toContain("Bài cố định sẽ chỉ xuất hiện đúng ngày đã chọn.");
expect(moveDialogSource).toContain(
  "Ngày đã chọn là ngày sớm nhất; lịch có thể xếp bài sang ngày sau nếu thiếu công suất.",
);
expect(moveDialogSource).toContain("const moved = onMove(");
expect(moveDialogSource).toContain("if (moved) setOpen(false)");
expect(moveDialogSource).not.toContain("buildMoveLessonDateCandidate");
expect(moveDialogSource).not.toContain("executeMutation");
expect(moveDialogSource).not.toContain("localStorage");
```

- [ ] **Step 2: Run the regression test and verify RED**

Run:

```bash
npx vitest run src/lib/flexible-planner-ux-regression.test.ts
```

Expected: FAIL with file-not-found for `MoveLessonDateDialog.tsx`.

- [ ] **Step 3: Create the dialog with explicit validation and failure semantics**

Create `src/components/flexible-planner/MoveLessonDateDialog.tsx`:

```tsx
import { useEffect, useId, useState, type FormEvent } from "react";
import { CalendarDays } from "lucide-react";
import type { Lesson } from "@/lib/mock-data";
import { isDateISO } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type MoveLessonDateDialogProps = {
  lesson: Lesson;
  onMove: (lessonId: string, targetDateISO: string) => boolean;
};

export function MoveLessonDateDialog({ lesson, onMove }: MoveLessonDateDialogProps) {
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(lesson.scheduledDate ?? "");
  const [error, setError] = useState("");
  const descriptionId = useId();
  const errorId = useId();
  const mode = lesson.scheduleMode ?? "flexible";

  useEffect(() => {
    if (!open) return;
    setDraftDate(lesson.scheduledDate ?? "");
    setError("");
  }, [lesson.scheduledDate, open]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draftDate) {
      setError("Hãy chọn một ngày.");
      return;
    }
    if (!isDateISO(draftDate)) {
      setError("Ngày đã chọn không hợp lệ.");
      return;
    }

    setError("");
    const moved = onMove(lesson.id, draftDate);
    if (moved) setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Chọn ngày
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Chuyển “{lesson.title}”</DialogTitle>
            <DialogDescription id={descriptionId}>
              {mode === "fixed"
                ? "Bài cố định sẽ chỉ xuất hiện đúng ngày đã chọn."
                : "Ngày đã chọn là ngày sớm nhất; lịch có thể xếp bài sang ngày sau nếu thiếu công suất."}
            </DialogDescription>
          </DialogHeader>

          <label className="mt-4 block space-y-2 text-sm font-semibold text-slate-800">
            <span>Ngày mới</span>
            <Input
              type="date"
              value={draftDate}
              onChange={(event) => {
                setDraftDate(event.target.value);
                if (error) setError("");
              }}
              aria-describedby={error ? `${descriptionId} ${errorId}` : descriptionId}
              aria-invalid={Boolean(error)}
            />
          </label>
          {error && (
            <p id={errorId} role="alert" className="mt-2 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}

          <DialogFooter className="mt-5 gap-2 sm:space-x-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit">Chuyển ngày</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

Use the existing `Button`, `Input`, and Dialog primitives exactly; do not add a form library.

- [ ] **Step 4: Run regression and typecheck**

Run:

```bash
npx vitest run src/lib/flexible-planner-ux-regression.test.ts
npm run typecheck
```

Expected: both pass. If the existing `Button` API uses a different supported variant name, inspect `src/components/ui/button.tsx` and use an existing non-destructive outline-equivalent; do not change the primitive.

- [ ] **Step 5: Commit Task 3**

```bash
git add src/components/flexible-planner/MoveLessonDateDialog.tsx src/lib/flexible-planner-ux-regression.test.ts
git commit -m "feat: add direct lesson date dialog"
```

---

### Task 4: Integrate independent status filters and explicit capacity metrics

**Files:**
- Modify: `src/components/FlexiblePlanner.tsx`
- Modify: `src/lib/flexible-planner-ux-regression.test.ts`

**Interfaces:**
- Consumes from Task 1:
  - `FlexibleScheduleStatusFilter`
  - `filterFlexibleScheduleItems()`
  - `isFlexibleScheduleAttentionDay()`
  - `deriveFlexibleScheduleDayMetrics()`
- Produces: independent subject and status controls, attention-day view, truthful empty states, explicit day metrics.

- [ ] **Step 1: Add failing regression assertions for status controls and metric copy**

Extend `src/lib/flexible-planner-ux-regression.test.ts`:

```ts
expect(plannerSource).toContain("FlexibleScheduleStatusFilter");
expect(plannerSource).toContain('aria-label="Lọc lịch theo trạng thái"');
expect(plannerSource).toContain("Tất cả công việc");
expect(plannerSource).toContain("Cố định");
expect(plannerSource).toContain("Linh hoạt");
expect(plannerSource).toContain("Cần xử lý");
expect(plannerSource).toContain("filterFlexibleScheduleItems");
expect(plannerSource).toContain("isFlexibleScheduleAttentionDay");
expect(plannerSource).toContain("deriveFlexibleScheduleDayMetrics");
expect(plannerSource).toContain("Công suất");
expect(plannerSource).toContain("Đã xếp");
expect(plannerSource).toContain("Bài mới");
expect(plannerSource).toContain("Ôn tập");
expect(plannerSource).toContain("Còn trống");
expect(plannerSource).toContain("Quá công suất");
expect(plannerSource).toContain("Cố định chưa xếp");
expect(plannerSource).toContain(
  "Không có ngày quá tải hoặc bài cố định chưa xếp trong khoảng lịch này.",
);
```

- [ ] **Step 2: Run the regression test and verify RED**

Run:

```bash
npx vitest run src/lib/flexible-planner-ux-regression.test.ts
```

Expected: FAIL because the status filter and metric labels are absent.

- [ ] **Step 3: Import pure workspace interfaces and add status state**

In `FlexiblePlanner.tsx`, import:

```ts
import {
  deriveFlexibleScheduleDayMetrics,
  filterFlexibleScheduleItems,
  isFlexibleScheduleAttentionDay,
  type FlexibleScheduleStatusFilter,
} from "@/lib/flexible-schedule-workspace";
```

Add beside `subjectId`:

```ts
const [statusFilter, setStatusFilter] = useState<FlexibleScheduleStatusFilter>("all");
```

Add the exact options:

```ts
const statusFilters: Array<{ id: FlexibleScheduleStatusFilter; label: string }> = [
  { id: "all", label: "Tất cả công việc" },
  { id: "fixed", label: "Cố định" },
  { id: "flexible", label: "Linh hoạt" },
  { id: "attention", label: "Cần xử lý" },
];
```

- [ ] **Step 4: Stop applying subject filtering while constructing raw day items**

Rename the current memo to `allDisplayLessonsByDate` and always push each constructed `DisplayLesson` into its day list. Remove these three conditional pushes:

```ts
if (subjectId === "all" || item.subjectId === subjectId) items.push(item);
```

Replace each with:

```ts
items.push(item);
```

Remove `subjectId` from that memo's dependency list.

Then derive filtered items:

```ts
const displayLessonsByDate = useMemo(() => {
  const filtered = new Map<string, DisplayLesson[]>();
  for (const [dateISO, items] of allDisplayLessonsByDate) {
    filtered.set(
      dateISO,
      filterFlexibleScheduleItems(items, { subjectId, statusFilter }),
    );
  }
  return filtered;
}, [allDisplayLessonsByDate, statusFilter, subjectId]);
```

This preserves all selected-subject context in `attention` because the pure filter treats it as a day-level mode.

- [ ] **Step 5: Render the status filter independently of subject tabs**

Below the existing subject tablist, add:

```tsx
<div
  className="mt-3 flex max-w-full gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1"
  role="tablist"
  aria-label="Lọc lịch theo trạng thái"
>
  {statusFilters.map((filter) => (
    <button
      key={filter.id}
      type="button"
      role="tab"
      aria-selected={statusFilter === filter.id}
      onClick={() => setStatusFilter(filter.id)}
      className={cn(
        "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
        statusFilter === filter.id
          ? "bg-slate-900 text-white shadow-xs"
          : "text-slate-600 hover:bg-slate-100",
      )}
    >
      {filter.label}
    </button>
  ))}
</div>
```

Do not combine subject and status into one stored value.

- [ ] **Step 6: Filter expanded week days only in attention mode**

Inside each week render, derive:

```ts
const renderedDays =
  statusFilter === "attention"
    ? week.days.filter((day) => isFlexibleScheduleAttentionDay(day.queue))
    : week.days;
```

Use `renderedDays` for:

- the week matching-day count;
- the expanded day-card map.

Keep the week header visible when `renderedDays.length === 0`.

When an expanded attention week has zero matching days, render:

```tsx
<div className="p-4 text-center text-xs font-medium text-slate-500 lg:col-span-2">
  Không có ngày quá tải hoặc bài cố định chưa xếp trong khoảng lịch này.
</div>
```

For non-attention item filters, keep day cards visible and let each card use filter-specific empty wording rather than implying deletion.

- [ ] **Step 7: Derive and render explicit day metrics**

At the top of `PlanDayCard`, add:

```ts
const metrics = deriveFlexibleScheduleDayMetrics(day.queue);
```

Replace the single compact capacity paragraph with a wrapping metrics group that renders:

```tsx
<div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-slate-700">
  <span className="rounded bg-slate-100 px-2 py-1">Công suất: {metrics.quotaMinutes}p</span>
  <span className="rounded bg-slate-100 px-2 py-1">Đã xếp: {metrics.scheduledMinutes}p</span>
  <span className="rounded bg-sky-50 px-2 py-1 text-sky-800">Bài mới: {metrics.newMinutes}p</span>
  <span className="rounded bg-amber-50 px-2 py-1 text-amber-800">Ôn tập: {metrics.reviewMinutes}p</span>
  {metrics.unallocatedMinutes > 0 && (
    <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-800">
      Còn trống: {metrics.unallocatedMinutes}p
    </span>
  )}
  {metrics.overloadMinutes > 0 && (
    <span className="rounded bg-rose-50 px-2 py-1 text-rose-800">
      Quá công suất: {metrics.overloadMinutes}p
    </span>
  )}
  {metrics.unplacedFixedMinutes > 0 && (
    <span className="rounded bg-rose-50 px-2 py-1 text-rose-800">
      Cố định chưa xếp: {metrics.unplacedFixedMinutes}p
    </span>
  )}
</div>
```

Delete the now-unused local `unplacedFixedMinutes` variable only after the JSX no longer references it.

- [ ] **Step 8: Make item empty states filter-aware**

Pass `statusFilter` into `PlanDayCard`. Add a local helper or exact expression that returns:

```ts
const emptyMessage =
  statusFilter === "fixed"
    ? "Không có bài cố định của môn đang xem trong ngày này."
    : statusFilter === "flexible"
      ? "Không có bài linh hoạt của môn đang xem trong ngày này."
      : "Không có bài của môn đang xem.";
```

Keep the drag-target override `Thả bài vào ngày này` unchanged.

- [ ] **Step 9: Run focused unit/regression tests and typecheck**

Run:

```bash
npx vitest run src/lib/flexible-schedule-workspace.test.ts src/lib/flexible-planner-ux-regression.test.ts
npm run typecheck
```

Expected: all pass.

- [ ] **Step 10: Commit Task 4**

```bash
git add src/components/FlexiblePlanner.tsx src/lib/flexible-planner-ux-regression.test.ts
git commit -m "feat: add flexible schedule workspace filters"
```

---

### Task 5: Route the direct-date dialog through the canonical move boundary

**Files:**
- Modify: `src/components/FlexiblePlanner.tsx`
- Modify: `src/lib/flexible-planner-transactions-regression.test.ts`
- Modify: `src/lib/flexible-planner-ux-regression.test.ts`

**Interfaces:**
- Consumes: `MoveLessonDateDialog` from Task 3 and the existing `(lessonId, targetDateISO) => boolean` `moveLessonToDate()` callback.
- Produces: direct date selection for every ordinary lesson; reviews remain non-movable.

- [ ] **Step 1: Add failing regression assertions for canonical delegation**

In `src/lib/flexible-planner-transactions-regression.test.ts`, read the dialog source:

```ts
const moveDialogSource = readFileSync(
  new URL("../components/flexible-planner/MoveLessonDateDialog.tsx", import.meta.url),
  "utf8",
);
```

Extend the canonical move test:

```ts
expect(plannerSource).toContain("MoveLessonDateDialog");
expect(plannerSource).toContain("onMove={onMoveLesson}");
expect(moveDialogSource).toContain("onMove(lesson.id, draftDate)");
expect(moveDialogSource).not.toContain("buildMoveLessonDateCandidate");
expect(moveDialogSource).not.toContain("commitScheduleMutation");
expect(moveDialogSource).not.toContain("persist");
```

In `src/lib/flexible-planner-ux-regression.test.ts`, assert:

```ts
expect(plannerSource).toContain("<MoveLessonDateDialog");
expect(plannerSource).toContain("onMove={onMoveLesson}");
```

- [ ] **Step 2: Run both regression files and verify RED**

Run:

```bash
npx vitest run src/lib/flexible-planner-transactions-regression.test.ts src/lib/flexible-planner-ux-regression.test.ts
```

Expected: FAIL because `FlexiblePlanner` does not render the dialog.

- [ ] **Step 3: Import and render the dialog only for ordinary lessons**

In `FlexiblePlanner.tsx`, import:

```ts
import { MoveLessonDateDialog } from "@/components/flexible-planner/MoveLessonDateDialog";
```

Inside `LessonCard`, in the existing `movable` action row, add between previous and next controls or before both:

```tsx
<MoveLessonDateDialog lesson={item.lesson} onMove={onMoveLesson} />
```

Do not render it outside the `movable` branch. Reviews must still have no drag handle, arrows, or direct-date trigger.

- [ ] **Step 4: Verify all move surfaces share the same callback**

Inspect the final source and confirm:

```text
drag/drop → handleDrop() → moveLessonToDate()
previous arrow → onMoveLesson() → moveLessonToDate()
next arrow → onMoveLesson() → moveLessonToDate()
direct date dialog → onMoveLesson() → moveLessonToDate()
```

Do not add a second candidate builder call or transaction hook instance.

- [ ] **Step 5: Run transaction, UX, candidate, and integration coverage**

Run:

```bash
npx vitest run \
  src/lib/flexible-planner-transactions-regression.test.ts \
  src/lib/flexible-planner-ux-regression.test.ts \
  src/lib/schedule-candidates.test.ts \
  src/lib/schedule-operations-integration.test.ts
npm run typecheck
```

Expected: all pass. Existing candidate/integration tests continue proving same-date no-op, atomic date-plus-provenance persistence, rollback, and undo semantics.

- [ ] **Step 6: Commit Task 5**

```bash
git add \
  src/components/FlexiblePlanner.tsx \
  src/lib/flexible-planner-transactions-regression.test.ts \
  src/lib/flexible-planner-ux-regression.test.ts
git commit -m "feat: connect direct date moves to schedule transactions"
```

---

### Task 6: Add subject-scoped visibility summary and post-move outside-horizon notice

**Files:**
- Modify: `src/components/FlexiblePlanner.tsx`
- Modify: `src/lib/flexible-planner-ux-regression.test.ts`

**Interfaces:**
- Consumes:
  - `summarizeUnscheduledWork()` from Task 2
  - `calculateMinimumHorizonWeeks()` from Task 1
  - existing `findLessonById()` and `moveLessonToDate()` result status
- Produces:

```ts
type PendingMoveVisibilityCheck = {
  lessonId: string;
  lessonTitle: string;
  subjectId: string;
  targetDateISO: string;
  scheduleMode: "fixed" | "flexible";
};

type OutsideHorizonMoveNotice = PendingMoveVisibilityCheck;
```

- [ ] **Step 1: Add failing regression assertions for summary and notice actions**

Extend `src/lib/flexible-planner-ux-regression.test.ts`:

```ts
expect(plannerSource).toContain("summarizeUnscheduledWork");
expect(plannerSource).toContain("Ngoài khoảng đang mở");
expect(plannerSource).toContain("outsideHorizonNotice");
expect(plannerSource).toContain("pendingMoveVisibilityCheck");
expect(plannerSource).toContain("Mở rộng lịch");
expect(plannerSource).toContain("Xem môn này");
expect(plannerSource).toContain("calculateMinimumHorizonWeeks");
expect(plannerSource).toContain('role="status"');
expect(plannerSource).toContain("setOutsideHorizonNotice(null)");
```

- [ ] **Step 2: Run the regression test and verify RED**

Run:

```bash
npx vitest run src/lib/flexible-planner-ux-regression.test.ts
```

Expected: FAIL because visibility summary and notice state are absent.

- [ ] **Step 3: Import visibility helpers and define state types**

In `FlexiblePlanner.tsx`, import:

```ts
import { summarizeUnscheduledWork } from "@/lib/schedule-visibility";
import { calculateMinimumHorizonWeeks } from "@/lib/flexible-schedule-workspace";
```

Add module-local types:

```ts
type PendingMoveVisibilityCheck = {
  lessonId: string;
  lessonTitle: string;
  subjectId: string;
  targetDateISO: string;
  scheduleMode: LessonMode;
};

type OutsideHorizonMoveNotice = PendingMoveVisibilityCheck;
```

Add state:

```ts
const [pendingMoveVisibilityCheck, setPendingMoveVisibilityCheck] =
  useState<PendingMoveVisibilityCheck | null>(null);
const [outsideHorizonNotice, setOutsideHorizonNotice] =
  useState<OutsideHorizonMoveNotice | null>(null);
```

- [ ] **Step 4: Derive the subject-scoped visibility summary**

After `days` is built, add:

```ts
const visibilitySummary = useMemo(
  () =>
    summarizeUnscheduledWork({
      subjects,
      completed: state.completedLessons,
      visiblePlan: days,
      subjectId,
    }),
  [days, state.completedLessons, subjectId, subjects],
);
```

In the toolbar summary row, render:

```tsx
<span>{visibilitySummary.unfinishedCount} bài chưa hoàn thành</span>
<span>{visibilitySummary.visibleScheduledCount} bài đã xếp trong khoảng đang mở</span>
<span className={cn(visibilitySummary.outsideHorizonCount > 0 && "font-semibold text-amber-700")}>
  Ngoài khoảng đang mở: {visibilitySummary.outsideHorizonCount}
</span>
```

Do not treat outside-horizon count as an error or completed count.

- [ ] **Step 5: Record pending checks only for committed non-noop moves**

Inside `moveLessonToDate()`, retain the existing failure and no-op behavior. After a successful `executeMutation()` result:

```ts
if (result.status === "noop") return true;

const position = lessonPositionById.get(lessonId);
setPendingMoveVisibilityCheck({
  lessonId,
  lessonTitle: lesson.title,
  subjectId: position?.subjectId ?? "unknown",
  targetDateISO,
  scheduleMode: getLessonMode(lesson),
});
```

Then continue the existing success toast.

Do not set pending state before `executeMutation()` succeeds. Do not set it for `noop`.

Add `lessonPositionById` to any callback/memo dependency only if `moveLessonToDate` is converted to `useCallback`; otherwise no dependency change is required.

- [ ] **Step 6: Resolve pending checks only after parent-published catalog state catches up**

Add a raw-plan visibility helper inside the component or module scope:

```ts
function planContainsLesson(days: PlanDay[], lessonId: string): boolean {
  return days.some(
    (day) =>
      day.queue.newLessons.some((lesson) => lesson.id === lessonId) ||
      getUnplacedFixedLessons(day).some((lesson) => lesson.id === lessonId),
  );
}
```

Add an effect:

```ts
useEffect(() => {
  if (!pendingMoveVisibilityCheck) return;

  const publishedLesson = findLessonById(pendingMoveVisibilityCheck.lessonId, subjects);
  if (!publishedLesson) {
    setPendingMoveVisibilityCheck(null);
    return;
  }

  if (publishedLesson.scheduledDate !== pendingMoveVisibilityCheck.targetDateISO) {
    return;
  }

  if (planContainsLesson(days, pendingMoveVisibilityCheck.lessonId)) {
    setOutsideHorizonNotice((current) =>
      current?.lessonId === pendingMoveVisibilityCheck.lessonId ? null : current,
    );
  } else {
    setOutsideHorizonNotice(pendingMoveVisibilityCheck);
  }
  setPendingMoveVisibilityCheck(null);
}, [days, pendingMoveVisibilityCheck, subjects]);
```

The `scheduledDate` equality guard is mandatory. Without it, the effect can inspect stale `days` immediately after local pending state changes and incorrectly clear the check before React publishes the committed catalog.

- [ ] **Step 7: Clear a notice automatically after horizon expansion makes the lesson visible**

Add:

```ts
useEffect(() => {
  if (!outsideHorizonNotice) return;
  if (planContainsLesson(days, outsideHorizonNotice.lessonId)) {
    setOutsideHorizonNotice(null);
  }
}, [days, outsideHorizonNotice]);
```

This uses the raw plan, not filtered card visibility. A subject/status filter must never be mistaken for outside-horizon loss.

- [ ] **Step 8: Clear pending/notice state during undo**

In `onUndoSuccess`, add:

```ts
setPendingMoveVisibilityCheck(null);
setOutsideHorizonNotice(null);
```

Keep the existing recently-moved reset and success toast.

- [ ] **Step 9: Render the dismissible notice with exact actions**

Above the week list, render when `outsideHorizonNotice` exists:

```tsx
<div
  role="status"
  className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"
>
  <div className="flex items-start justify-between gap-3">
    <div>
      <p className="font-bold">“{outsideHorizonNotice.lessonTitle}” đang ngoài khoảng lịch mở.</p>
      <p className="mt-1 text-xs text-amber-800">
        {outsideHorizonNotice.scheduleMode === "fixed"
          ? `Bài cố định đã được chuyển đúng sang ${displayDate(outsideHorizonNotice.targetDateISO)}.`
          : `${displayDate(outsideHorizonNotice.targetDateISO)} là ngày sớm nhất; công suất có thể xếp bài muộn hơn.`}
      </p>
    </div>
    <button
      type="button"
      onClick={() => setOutsideHorizonNotice(null)}
      aria-label="Đóng thông báo bài ngoài khoảng lịch"
      className="min-h-8 rounded-lg px-2 text-xs font-semibold hover:bg-amber-100"
    >
      Đóng
    </button>
  </div>
  <div className="mt-3 flex flex-wrap gap-2">
    <button type="button" onClick={expandToNoticeTarget} className="...">
      Mở rộng lịch
    </button>
    <button
      type="button"
      onClick={() => setSubjectId(outsideHorizonNotice.subjectId)}
      className="..."
    >
      Xem môn này
    </button>
  </div>
</div>
```

Replace `className="..."` in implementation with the same concrete border/background/min-height utility pattern used by existing toolbar buttons. Do not leave ellipses in committed code.

- [ ] **Step 10: Implement bounded expansion behavior**

Define before JSX:

```ts
const expandToNoticeTarget = () => {
  if (!outsideHorizonNotice) return;
  const expansion = calculateMinimumHorizonWeeks({
    todayDateISO: today,
    targetDateISO: outsideHorizonNotice.targetDateISO,
    maxWeeks: 52,
  });

  setNumWeeks((current) => Math.max(current, expansion.weeks));

  if (expansion.reason === "before-start") {
    toast.info("Khoảng lịch chỉ mở từ hôm nay; không thể mở rộng ngược về ngày trước.");
  } else if (expansion.reason === "beyond-max") {
    toast.info("Đã mở tối đa 52 tuần; bài vẫn có thể nằm ngoài khoảng hiển thị.");
  }
};
```

For reachable targets, the second effect clears the notice after the expanded `days` contains the lesson. For past or beyond-max targets, keep the notice visible so the limitation remains discoverable.

- [ ] **Step 11: Guard `Xem môn này` against an unknown subject**

Use:

```ts
const focusNoticeSubject = () => {
  if (!outsideHorizonNotice) return;
  if (sortedSubjects.some((subject) => subject.id === outsideHorizonNotice.subjectId)) {
    setSubjectId(outsideHorizonNotice.subjectId);
  }
};
```

Pass `focusNoticeSubject` to the button. Do not create an invalid selected-subject state.

- [ ] **Step 12: Run all focused P1B tests and typecheck**

Run:

```bash
npx vitest run \
  src/lib/flexible-schedule-workspace.test.ts \
  src/lib/schedule-visibility.test.ts \
  src/lib/flexible-planner-ux-regression.test.ts \
  src/lib/flexible-planner-transactions-regression.test.ts \
  src/lib/schedule-candidates.test.ts \
  src/lib/schedule-operations-integration.test.ts
npm run typecheck
```

Expected: all pass.

- [ ] **Step 13: Commit Task 6**

```bash
git add src/components/FlexiblePlanner.tsx src/lib/flexible-planner-ux-regression.test.ts
git commit -m "feat: surface work outside the schedule horizon"
```

---

### Task 7: Harden regression contracts and complete package verification

**Files:**
- Modify: `src/lib/flexible-planner-ux-regression.test.ts`
- Modify: `src/lib/flexible-planner-transactions-regression.test.ts`
- Modify only if a discovered regression requires it: files already authorized above

**Interfaces:**
- Consumes: final P1B source.
- Produces: exact source-contract protection and green package evidence; no acceptance or merge decision.

- [ ] **Step 1: Add final negative regression assertions**

Ensure the regression files contain these prohibitions:

```ts
expect(plannerSource).not.toContain("setStatusFilter(localStorage");
expect(plannerSource).not.toContain("setSubjectId(localStorage");
expect(plannerSource).not.toContain("TouchSensor");
expect(plannerSource).not.toContain("PointerSensor");
expect(moveDialogSource).not.toContain("localStorage");
expect(moveDialogSource).not.toContain("buildMoveLessonDateCandidate");
expect(moveDialogSource).not.toContain("executeMutation");
expect(moveDialogSource).not.toContain("persistPlannerSettings");
expect(moveDialogSource).not.toContain("persistScheduleSubjects");
```

Also assert the status filter and direct-date control are independent:

```ts
expect(plannerSource).toContain("const [subjectId, setSubjectId]");
expect(plannerSource).toContain("const [statusFilter, setStatusFilter]");
expect(plannerSource).toContain("<MoveLessonDateDialog");
```

- [ ] **Step 2: Run focused regression tests**

Run:

```bash
npx vitest run src/lib/flexible-planner-ux-regression.test.ts src/lib/flexible-planner-transactions-regression.test.ts
```

Expected: PASS. If a negative assertion reveals a real ownership violation, fix the violating authorized source rather than weakening the assertion.

- [ ] **Step 3: Run the complete unit and integration suite**

Run:

```bash
npm test
```

Expected: all test files and tests pass. Record the exact file/test counts from output for the PR body; do not predict or hard-code a count in source.

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 5: Run lint**

Run:

```bash
npm run lint
```

Expected: zero lint errors. Existing pre-package warnings may be recorded but must not be represented as newly introduced.

- [ ] **Step 6: Run production build**

Run:

```bash
npm run build
```

Expected: tests rerun successfully and Vite/Nitro produce the production target without modifying tracked source.

- [ ] **Step 7: Verify clean tracked source**

Run:

```bash
git diff --exit-code
```

Expected: exit code 0 after all verification commands.

- [ ] **Step 8: Audit the exact branch diff against the predecessor**

Run:

```bash
git diff --stat 8a23a4e88890ba1deb4619527ae8d1094c423105...HEAD
git diff --name-only 8a23a4e88890ba1deb4619527ae8d1094c423105...HEAD
```

Expected changed implementation paths are limited to:

```text
src/lib/flexible-schedule-workspace.ts
src/lib/flexible-schedule-workspace.test.ts
src/lib/schedule-visibility.ts
src/lib/schedule-visibility.test.ts
src/components/flexible-planner/MoveLessonDateDialog.tsx
src/components/FlexiblePlanner.tsx
src/lib/flexible-planner-ux-regression.test.ts
src/lib/flexible-planner-transactions-regression.test.ts
```

The already-approved design and plan documents are also expected in the branch diff:

```text
docs/superpowers/specs/2026-08-06-smart-planner-p1b-flexible-schedule-workspace-design.md
docs/superpowers/plans/2026-08-06-smart-planner-p1b-flexible-schedule-workspace.md
```

No dependency, lockfile, workflow, scheduler, persistence, or schema file may appear.

- [ ] **Step 9: Commit any final regression-only adjustments**

If Step 1 changed tests after Task 6, commit them:

```bash
git add src/lib/flexible-planner-ux-regression.test.ts src/lib/flexible-planner-transactions-regression.test.ts
git commit -m "test: harden P1B workspace boundaries"
```

If there are no uncommitted changes, do not create an empty commit.

- [ ] **Step 10: Re-run exact-head gates after the final commit**

Run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
git diff --exit-code
```

Expected: all pass on the exact source head that will be proposed for review.

- [ ] **Step 11: Prepare review state without claiming acceptance**

Record in the pull request body:

```text
P1B IMPLEMENTED / SOURCE_HEAD_GREEN / DIFF_REVIEWED / READY_FOR_REVIEW / NOT_MERGED / NOT_ACCEPTED
```

Include:

- exact predecessor SHA;
- exact source-head SHA;
- changed-file list;
- exact test file/test counts;
- typecheck/lint/build/clean-tree results;
- statement that drag, arrows, and direct date use one transaction boundary;
- statement that no dependency, workflow, schema, scheduler, review-algorithm, persistence-owner, Roadmap, Course Manager, or Forecast change exists.

Do not merge, mark accepted, delete the branch, or rewrite history.

---

## Spec Coverage Matrix

| Design requirement | Implementation task |
|---|---|
| Independent subject and status filters | Task 1, Task 4 |
| `all`, `fixed`, `flexible`, `attention` semantics | Task 1, Task 4 |
| Attention days preserve full subject-scoped context | Task 1, Task 4 |
| Reviews excluded from fixed/flexible views | Task 1 |
| Explicit quota/scheduled/new/review/free/overload/unplaced metrics | Task 1, Task 4 |
| Unplaced fixed work excluded from scheduled total | Task 1, Task 4 |
| Keyboard/mobile direct date chooser | Task 3, Task 5 |
| Fixed/flexible date semantics copy | Task 3 |
| Invalid input stays in dialog | Task 3 |
| Failed move keeps dialog open | Task 3, Task 5 |
| One canonical move boundary | Task 5, Task 7 |
| Subject-scoped outside-horizon summary | Task 2, Task 6 |
| Post-commit outside-horizon notice | Task 6 |
| Expand horizon to bounded minimum | Task 1, Task 6 |
| Switch to affected subject | Task 6 |
| Undo clears stale notice | Task 6 |
| No touch drag, dependency, schema, workflow, or ownership expansion | Global Constraints, Task 7 |
| Full exact-head verification and independent acceptance gate | Task 7 |

## Plan Self-Review Result

```text
SPEC COVERAGE: COMPLETE
PLACEHOLDERS: NONE
TYPE/SIGNATURE CONSISTENCY: CHECKED
TASK SCOPE: SEVEN INDEPENDENT TDD DELIVERABLES
UNAUTHORIZED FILES OR DEPENDENCIES: NONE
IMPLEMENTATION SOURCE CHANGED BY THIS PLAN COMMIT: NONE
```
