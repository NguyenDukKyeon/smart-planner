# Smart Planner P1B Flexible Schedule Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Flexible Schedule into a capacity-first workspace with independent subject/status filters, explicit day metrics, direct date selection, and truthful outside-horizon feedback while preserving the P0B transaction boundary.

**Architecture:** Add one pure selector/metrics module and extend the existing visibility helper, then compose both from `FlexiblePlanner`. Add a focused Radix dialog that owns only direct-date input state and delegates every mutation to the existing `moveLessonToDate()` callback. Resolve post-move visibility only after the parent-published catalog reflects the committed target date, preventing stale-render false positives.

**Tech Stack:** React 19, TypeScript 5.8, Vitest 4, Radix Dialog, Tailwind CSS, TanStack Start, existing browser-local schedule transactions.

## Global Constraints

- Work on `improve/p1b-flexible-schedule-workspace` from exact predecessor `main@8a23a4e88890ba1deb4619527ae8d1094c423105`.
- Preserve `P0B ACCEPTED / INTEGRATED` and `P1A ACCEPTED / INTEGRATED` behavior.
- Do not change scheduler semantics, review intervals, review budgets, persistence ownership, or transaction-controller behavior.
- Every drag, arrow, and direct-date move must call the single `moveLessonToDate()` boundary in `FlexiblePlanner`.
- Failed mutations publish no candidate, append no undo history, close no move dialog, and create no outside-horizon success notice.
- Same-date moves remain canonical no-ops with no persistence, clock call, or undo entry.
- Filters and outside-horizon notices remain transient UI state and are not persisted.
- `unplacedFixedMinutes` is never counted as scheduled minutes.
- Do not add a dependency, schema migration, workflow change, touch-drag implementation, Roadmap change, Course Manager refactor, Forecast change, or broad visual redesign.
- Preserve published Lovable history: no squash, rebase, amend, force-push, or branch-history rewriting.
- P1B remains `NOT_ACCEPTED` until independent review records an acceptance decision.

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
```

- [ ] **Step 1: Write failing item-filter tests**

Create `src/lib/flexible-schedule-workspace.test.ts`:

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

  test("shows fixed lessons including unplaced fixed work", () => {
    expect(
      filterFlexibleScheduleItems(items, { subjectId: "all", statusFilter: "fixed" }).map(
        (entry) => entry.id,
      ),
    ).toEqual(["math-fixed", "math-unplaced"]);
  });

  test("shows flexible ordinary lessons and excludes reviews", () => {
    expect(
      filterFlexibleScheduleItems(items, { subjectId: "all", statusFilter: "flexible" }).map(
        (entry) => entry.id,
      ),
    ).toEqual(["math-flex", "english-flex"]);
  });

  test("keeps subject context intact in day-level attention mode", () => {
    expect(
      filterFlexibleScheduleItems(items, { subjectId: "math", statusFilter: "attention" }).map(
        (entry) => entry.id,
      ),
    ).toEqual(["math-fixed", "math-flex", "math-unplaced", "math-review"]);
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

```bash
npx vitest run src/lib/flexible-schedule-workspace.test.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement filtering minimally**

Create `src/lib/flexible-schedule-workspace.ts`:

```ts
import { daysBetweenISO, getSundayISO } from "./date-utils";
import type { Lesson } from "./mock-data";
import type { DayQueue } from "./planner";

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

- [ ] **Step 4: Run the test and verify GREEN**

```bash
npx vitest run src/lib/flexible-schedule-workspace.test.ts
```

Expected: the four filter tests pass.

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

  test("does not count unplaced fixed minutes as scheduled", () => {
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

```bash
npx vitest run src/lib/flexible-schedule-workspace.test.ts
```

Expected: FAIL because the diagnostic exports do not exist.

- [ ] **Step 7: Implement attention and metrics**

Append to the module:

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

- [ ] **Step 8: Add failing horizon tests**

Append:

```ts
describe("calculateMinimumHorizonWeeks", () => {
  test("uses one week inside the partial first week", () => {
    expect(
      calculateMinimumHorizonWeeks({
        todayDateISO: "2030-01-02",
        targetDateISO: "2030-01-06",
      }),
    ).toEqual({ weeks: 1, includesTarget: true, reason: "included" });
  });

  test("returns the minimum later whole-week count", () => {
    expect(
      calculateMinimumHorizonWeeks({
        todayDateISO: "2030-01-02",
        targetDateISO: "2030-01-15",
      }),
    ).toEqual({ weeks: 3, includesTarget: true, reason: "included" });
  });

  test("bounds a far-future target", () => {
    expect(
      calculateMinimumHorizonWeeks({
        todayDateISO: "2030-01-02",
        targetDateISO: "2032-01-01",
      }),
    ).toEqual({ weeks: 52, includesTarget: false, reason: "beyond-max" });
  });

  test("reports that forward expansion cannot include a past target", () => {
    expect(
      calculateMinimumHorizonWeeks({
        todayDateISO: "2030-01-02",
        targetDateISO: "2030-01-01",
      }),
    ).toEqual({ weeks: 1, includesTarget: false, reason: "before-start" });
  });
});
```

- [ ] **Step 9: Implement the bounded horizon calculation**

Append:

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

  const requiredWeeks =
    1 + Math.ceil(daysBetweenISO(firstWeekEndISO, params.targetDateISO) / 7);
  if (requiredWeeks > maxWeeks) {
    return { weeks: maxWeeks, includesTarget: false, reason: "beyond-max" };
  }

  return { weeks: requiredWeeks, includesTarget: true, reason: "included" };
}
```

- [ ] **Step 10: Run focused tests and typecheck**

```bash
npx vitest run src/lib/flexible-schedule-workspace.test.ts
npm run typecheck
```

Expected: both pass.

- [ ] **Step 11: Commit Task 1**

```bash
git add src/lib/flexible-schedule-workspace.ts src/lib/flexible-schedule-workspace.test.ts
git commit -m "feat: add flexible schedule workspace selectors"
```

---

### Task 2: Add subject-scoped visibility accounting

**Files:**
- Modify: `src/lib/schedule-visibility.ts`
- Modify: `src/lib/schedule-visibility.test.ts`

**Interface:**

```ts
export function summarizeUnscheduledWork(params: {
  subjects: Subject[];
  completed: Record<string, string>;
  visiblePlan: PlanDay[];
  subjectId?: string;
}): UnscheduledWorkSummary;
```

- [ ] **Step 1: Add a two-subject fixture**

In `src/lib/schedule-visibility.test.ts` add:

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

Keep all existing tests unchanged.

- [ ] **Step 2: Add failing scope tests**

```ts
test("summarizes only the selected subject", () => {
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

test("returns zero counts for an unknown subject", () => {
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

- [ ] **Step 3: Run and verify RED**

```bash
npx vitest run src/lib/schedule-visibility.test.ts
```

Expected: the new assertions fail because `subjectId` is ignored.

- [ ] **Step 4: Implement scope filtering**

At the start of `summarizeUnscheduledWork()` select:

```ts
const scopedSubjects =
  !params.subjectId || params.subjectId === "all"
    ? params.subjects
    : params.subjects.filter((subject) => subject.id === params.subjectId);
```

Build `scopedLessonIds` while traversing `scopedSubjects`, and only add visible scheduled/unplaced lesson IDs when `scopedLessonIds.has(lesson.id)` is true. Preserve the existing de-duplication and return shape.

The resulting visible loops must be:

```ts
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
```

- [ ] **Step 5: Run tests and typecheck**

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

**Interface:**

```ts
export type MoveLessonDateDialogProps = {
  lesson: Lesson;
  onMove: (lessonId: string, targetDateISO: string) => boolean;
};
```

- [ ] **Step 1: Write a failing source-contract test**

Read the new file from `src/lib/flexible-planner-ux-regression.test.ts`:

```ts
const moveDialogSource = await fs.readFile(
  new URL("../components/flexible-planner/MoveLessonDateDialog.tsx", import.meta.url),
  "utf8",
);
```

Add:

```ts
expect(moveDialogSource).toContain("DialogTrigger");
expect(moveDialogSource).toContain("Chọn ngày");
expect(moveDialogSource).toContain('type="date"');
expect(moveDialogSource).toContain("isDateISO");
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

- [ ] **Step 2: Run and verify RED**

```bash
npx vitest run src/lib/flexible-planner-ux-regression.test.ts
```

Expected: FAIL because the dialog file is absent.

- [ ] **Step 3: Create the dialog**

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

- [ ] **Step 4: Run regression and typecheck**

```bash
npx vitest run src/lib/flexible-planner-ux-regression.test.ts
npm run typecheck
```

Expected: both pass.

- [ ] **Step 5: Commit Task 3**

```bash
git add src/components/flexible-planner/MoveLessonDateDialog.tsx src/lib/flexible-planner-ux-regression.test.ts
git commit -m "feat: add direct lesson date dialog"
```

---

### Task 4: Integrate status filters and explicit capacity metrics

**Files:**
- Modify: `src/components/FlexiblePlanner.tsx`
- Modify: `src/lib/flexible-planner-ux-regression.test.ts`

- [ ] **Step 1: Add failing regression assertions**

```ts
expect(plannerSource).toContain("FlexibleScheduleStatusFilter");
expect(plannerSource).toContain('aria-label="Lọc lịch theo trạng thái"');
expect(plannerSource).toContain("Tất cả công việc");
expect(plannerSource).toContain("Cần xử lý");
expect(plannerSource).toContain("filterFlexibleScheduleItems");
expect(plannerSource).toContain("isFlexibleScheduleAttentionDay");
expect(plannerSource).toContain("deriveFlexibleScheduleDayMetrics");
expect(plannerSource).toContain("Đã xếp");
expect(plannerSource).toContain("Quá công suất");
expect(plannerSource).toContain("Cố định chưa xếp");
expect(plannerSource).toContain(
  "Không có ngày quá tải hoặc bài cố định chưa xếp trong khoảng lịch này.",
);
```

- [ ] **Step 2: Run and verify RED**

```bash
npx vitest run src/lib/flexible-planner-ux-regression.test.ts
```

Expected: FAIL because the controls and metric labels are absent.

- [ ] **Step 3: Import helpers and add independent filter state**

```ts
import {
  deriveFlexibleScheduleDayMetrics,
  filterFlexibleScheduleItems,
  isFlexibleScheduleAttentionDay,
  type FlexibleScheduleStatusFilter,
} from "@/lib/flexible-schedule-workspace";
```

Add:

```ts
const [statusFilter, setStatusFilter] = useState<FlexibleScheduleStatusFilter>("all");

const statusFilters: Array<{ id: FlexibleScheduleStatusFilter; label: string }> = [
  { id: "all", label: "Tất cả công việc" },
  { id: "fixed", label: "Cố định" },
  { id: "flexible", label: "Linh hoạt" },
  { id: "attention", label: "Cần xử lý" },
];
```

- [ ] **Step 4: Separate raw item construction from filtering**

Rename the current map memo to `allDisplayLessonsByDate`. Replace every conditional item push with unconditional `items.push(item)` and remove `subjectId` from that memo dependency list.

Add:

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

- [ ] **Step 5: Render the status tablist**

Place below subject tabs:

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

- [ ] **Step 6: Apply attention as a day-level view**

Inside each week render:

```ts
const renderedDays =
  statusFilter === "attention"
    ? week.days.filter((day) => isFlexibleScheduleAttentionDay(day.queue))
    : week.days;
```

Use `renderedDays` for week counts and day-card rendering. Keep week headers visible. For an expanded attention week with zero days render:

```tsx
<div className="p-4 text-center text-xs font-medium text-slate-500 lg:col-span-2">
  Không có ngày quá tải hoặc bài cố định chưa xếp trong khoảng lịch này.
</div>
```

- [ ] **Step 7: Render explicit day metrics**

In `PlanDayCard`:

```ts
const metrics = deriveFlexibleScheduleDayMetrics(day.queue);
```

Replace the old compact capacity sentence with:

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

Pass `statusFilter` into `PlanDayCard` and use these exact empty messages:

```ts
const emptyMessage =
  statusFilter === "fixed"
    ? "Không có bài cố định của môn đang xem trong ngày này."
    : statusFilter === "flexible"
      ? "Không có bài linh hoạt của môn đang xem trong ngày này."
      : "Không có bài của môn đang xem.";
```

- [ ] **Step 8: Run focused tests and typecheck**

```bash
npx vitest run src/lib/flexible-schedule-workspace.test.ts src/lib/flexible-planner-ux-regression.test.ts
npm run typecheck
```

Expected: all pass.

- [ ] **Step 9: Commit Task 4**

```bash
git add src/components/FlexiblePlanner.tsx src/lib/flexible-planner-ux-regression.test.ts
git commit -m "feat: add flexible schedule workspace filters"
```

---

### Task 5: Connect direct moves and outside-horizon feedback

**Files:**
- Modify: `src/components/FlexiblePlanner.tsx`
- Modify: `src/lib/flexible-planner-ux-regression.test.ts`
- Modify: `src/lib/flexible-planner-transactions-regression.test.ts`

- [ ] **Step 1: Add failing canonical-boundary assertions**

Read the dialog source in both regression files where needed, then add:

```ts
expect(plannerSource).toContain("MoveLessonDateDialog");
expect(plannerSource).toContain("onMove={onMoveLesson}");
expect(moveDialogSource).toContain("onMove(lesson.id, draftDate)");
expect(moveDialogSource).not.toContain("buildMoveLessonDateCandidate");
expect(moveDialogSource).not.toContain("commitScheduleMutation");
expect(moveDialogSource).not.toContain("persistPlannerSettings");
expect(moveDialogSource).not.toContain("persistScheduleSubjects");
```

Add outside-horizon assertions:

```ts
expect(plannerSource).toContain("summarizeUnscheduledWork");
expect(plannerSource).toContain("pendingMoveVisibilityCheck");
expect(plannerSource).toContain("outsideHorizonNotice");
expect(plannerSource).toContain("calculateMinimumHorizonWeeks");
expect(plannerSource).toContain("Ngoài khoảng đang mở");
expect(plannerSource).toContain("Mở rộng lịch");
expect(plannerSource).toContain("Xem môn này");
expect(plannerSource).toContain('role="status"');
```

- [ ] **Step 2: Run and verify RED**

```bash
npx vitest run src/lib/flexible-planner-ux-regression.test.ts src/lib/flexible-planner-transactions-regression.test.ts
```

Expected: FAIL because the dialog and notice are not integrated.

- [ ] **Step 3: Render the dialog for ordinary lessons only**

Import:

```ts
import { MoveLessonDateDialog } from "@/components/flexible-planner/MoveLessonDateDialog";
```

Inside the existing `movable` action row in `LessonCard` render:

```tsx
<MoveLessonDateDialog lesson={item.lesson} onMove={onMoveLesson} />
```

Reviews remain outside the `movable` branch.

- [ ] **Step 4: Add subject-scoped visibility summary**

Import:

```ts
import { summarizeUnscheduledWork } from "@/lib/schedule-visibility";
```

Derive:

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

Render in the toolbar:

```tsx
<span>{visibilitySummary.unfinishedCount} bài chưa hoàn thành</span>
<span>{visibilitySummary.visibleScheduledCount} bài đã xếp trong khoảng đang mở</span>
<span className={cn(visibilitySummary.outsideHorizonCount > 0 && "font-semibold text-amber-700")}>
  Ngoài khoảng đang mở: {visibilitySummary.outsideHorizonCount}
</span>
```

- [ ] **Step 5: Add pending and notice state**

Define:

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

Add:

```ts
const [pendingMoveVisibilityCheck, setPendingMoveVisibilityCheck] =
  useState<PendingMoveVisibilityCheck | null>(null);
const [outsideHorizonNotice, setOutsideHorizonNotice] =
  useState<OutsideHorizonMoveNotice | null>(null);
```

Inside `moveLessonToDate()`, after successful execution and after the no-op return, set:

```ts
const position = lessonPositionById.get(lessonId);
setPendingMoveVisibilityCheck({
  lessonId,
  lessonTitle: lesson.title,
  subjectId: position?.subjectId ?? "unknown",
  targetDateISO,
  scheduleMode: getLessonMode(lesson),
});
```

Do not set pending state for failure or no-op.

- [ ] **Step 6: Resolve visibility after published state catches up**

Add:

```ts
function planContainsLesson(days: PlanDay[], lessonId: string): boolean {
  return days.some(
    (day) =>
      day.queue.newLessons.some((lesson) => lesson.id === lessonId) ||
      getUnplacedFixedLessons(day).some((lesson) => lesson.id === lessonId),
  );
}
```

Add the guarded effect:

```ts
useEffect(() => {
  if (!pendingMoveVisibilityCheck) return;

  const publishedLesson = findLessonById(pendingMoveVisibilityCheck.lessonId, subjects);
  if (!publishedLesson) {
    setPendingMoveVisibilityCheck(null);
    return;
  }
  if (publishedLesson.scheduledDate !== pendingMoveVisibilityCheck.targetDateISO) return;

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

The `scheduledDate` equality guard is mandatory.

Add automatic clearing after a reachable expansion:

```ts
useEffect(() => {
  if (!outsideHorizonNotice) return;
  if (planContainsLesson(days, outsideHorizonNotice.lessonId)) {
    setOutsideHorizonNotice(null);
  }
}, [days, outsideHorizonNotice]);
```

In `onUndoSuccess`, clear both pending and notice state.

- [ ] **Step 7: Implement bounded expansion and subject focus**

Import `calculateMinimumHorizonWeeks` and add:

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

const focusNoticeSubject = () => {
  if (!outsideHorizonNotice) return;
  if (sortedSubjects.some((subject) => subject.id === outsideHorizonNotice.subjectId)) {
    setSubjectId(outsideHorizonNotice.subjectId);
  }
};
```

- [ ] **Step 8: Render the notice with concrete controls**

Above the week list:

```tsx
{outsideHorizonNotice && (
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
      <button
        type="button"
        onClick={expandToNoticeTarget}
        className="min-h-9 rounded-lg border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-100"
      >
        Mở rộng lịch
      </button>
      <button
        type="button"
        onClick={focusNoticeSubject}
        className="min-h-9 rounded-lg border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-100"
      >
        Xem môn này
      </button>
    </div>
  </div>
)}
```

- [ ] **Step 9: Run focused transaction and UX coverage**

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

Expected: all pass. Existing candidate/integration tests continue proving no-op, atomic provenance, rollback, and undo semantics.

- [ ] **Step 10: Commit Task 5**

```bash
git add \
  src/components/FlexiblePlanner.tsx \
  src/lib/flexible-planner-ux-regression.test.ts \
  src/lib/flexible-planner-transactions-regression.test.ts
git commit -m "feat: surface work outside the schedule horizon"
```

---

### Task 6: Complete exact-head verification and review handoff

**Files:**
- Modify only authorized regression files when a real contract gap is found.
- Do not create an acceptance record or merge commit.

- [ ] **Step 1: Add final negative regression assertions**

Ensure the regression suite contains:

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
expect(plannerSource).toContain("const [subjectId, setSubjectId]");
expect(plannerSource).toContain("const [statusFilter, setStatusFilter]");
expect(plannerSource).toContain("<MoveLessonDateDialog");
```

- [ ] **Step 2: Run focused regressions**

```bash
npx vitest run src/lib/flexible-planner-ux-regression.test.ts src/lib/flexible-planner-transactions-regression.test.ts
```

Expected: PASS. Fix actual ownership violations rather than weakening assertions.

- [ ] **Step 3: Run full gates**

```bash
npm run typecheck
npm run lint
npm test
npm run build
git diff --exit-code
```

Expected:

- zero TypeScript errors;
- zero lint errors;
- all test files/tests pass;
- production Vite/Nitro build succeeds;
- tracked source remains clean.

Record exact test file/test counts from output. Do not predict them.

- [ ] **Step 4: Audit exact branch scope**

```bash
git diff --stat 8a23a4e88890ba1deb4619527ae8d1094c423105 HEAD
git diff --name-only 8a23a4e88890ba1deb4619527ae8d1094c423105 HEAD
```

Expected implementation paths:

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

Expected documentation paths:

```text
docs/superpowers/specs/2026-08-06-smart-planner-p1b-flexible-schedule-workspace-design.md
docs/superpowers/plans/2026-08-06-smart-planner-p1b-flexible-schedule-workspace.md
```

No dependency, lockfile, workflow, scheduler, persistence, schema, Roadmap, Course Manager, or Forecast file may appear.

- [ ] **Step 5: Commit final regression-only changes when present**

```bash
git add src/lib/flexible-planner-ux-regression.test.ts src/lib/flexible-planner-transactions-regression.test.ts
git commit -m "test: harden P1B workspace boundaries"
```

Do not create an empty commit when the tree is already clean.

- [ ] **Step 6: Re-run exact-head gates after the final commit**

```bash
npm run typecheck
npm run lint
npm test
npm run build
git diff --exit-code
```

Expected: all pass on the exact source head proposed for review.

- [ ] **Step 7: Prepare review state without claiming acceptance**

Record in the pull request body:

```text
P1B IMPLEMENTED / SOURCE_HEAD_GREEN / DIFF_REVIEWED / READY_FOR_REVIEW / NOT_MERGED / NOT_ACCEPTED
```

Include exact predecessor SHA, exact source-head SHA, changed-file list, exact test counts, quality-gate results, single-transaction-boundary evidence, and the absence of unauthorized changes.

Do not merge, mark accepted, delete the branch, or rewrite history.

---

## Spec Coverage Matrix

| Design requirement | Task |
|---|---|
| Independent subject and status filters | 1, 4 |
| `all`, `fixed`, `flexible`, `attention` semantics | 1, 4 |
| Attention days preserve full subject-scoped context | 1, 4 |
| Reviews excluded from fixed/flexible views | 1 |
| Explicit day capacity metrics | 1, 4 |
| Unplaced fixed work excluded from scheduled total | 1, 4 |
| Accessible direct date chooser | 3, 5 |
| Fixed/flexible date semantics copy | 3 |
| Invalid and failed submissions keep dialog open | 3, 5 |
| One canonical move boundary | 5, 6 |
| Subject-scoped outside-horizon summary | 2, 5 |
| Post-commit notice and undo clearing | 5 |
| Bounded horizon expansion | 1, 5 |
| Affected-subject action | 5 |
| No dependency/schema/workflow/ownership expansion | Global Constraints, 6 |
| Exact-head gates and independent acceptance gate | 6 |

## Plan Self-Review Result

```text
SPEC COVERAGE: COMPLETE
PLACEHOLDERS: NONE
TYPE AND SIGNATURE CONSISTENCY: CHECKED
TASK SCOPE: SIX INDEPENDENT TDD DELIVERABLES
UNAUTHORIZED FILES OR DEPENDENCIES: NONE
IMPLEMENTATION SOURCE CHANGED BY PLAN COMMITS: NONE
```
