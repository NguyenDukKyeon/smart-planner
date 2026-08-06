# Smart Planner P1A Placement Explanations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every Today lesson and review show one truthful placement reason, while persisting the most recent manual lesson move across reloads.

**Architecture:** Extend the catalog `Lesson` model with one optional, sanitized manual-move provenance object. Keep reason derivation in a pure `lesson-placement` module, keep all calendar move methods routed through the existing P0 schedule transaction boundary, and render one accessible reason disclosure from `TodayLessonCard`. P1A remains stacked on P0 exact head `3e296b2d2bb1e7f52b482643a30496b4e3757c0a`.

**Tech Stack:** React 19, TypeScript 5.8, Vitest 4, TanStack Start, Tailwind CSS, browser-local catalog persistence, P0 schedule transactions.

## Global Constraints

- Store only the most recent manual move; never store an unbounded move history.
- Every Flexible Schedule Move action must write the same provenance shape through `buildMoveLessonDateCandidate`.
- A same-date Move is a no-op: it must not replace provenance, persist, or append undo history.
- Editing `scheduledDate` or `scheduleMode` through the lesson editor clears provenance only when the value actually changes.
- Editing title, topic, duration, XP, or subject/topic placement keeps provenance.
- Fixed-today current state outranks manual-move history as the primary reason.
- A capacity-carried flexible lesson outranks an earlier manual move when the assigned day is later than the move target.
- Imported CSV/JSON must not be allowed to inject application-generated provenance.
- Invalid provenance is removed without removing the lesson or blocking app startup.
- Failed persistence must publish neither the new date nor the new provenance and must not append undo history.
- No new dependency, broad Today redesign, Flexible Schedule filter redesign, Course Manager ownership refactor, or review-algorithm change.
- The P1A branch and PR remain stacked on P0 until P0 is accepted or deliberately rebased.

## File Structure

**Create**

- `src/lib/lesson-placement.ts` — provenance sanitization and pure lesson/review reason derivation.
- `src/lib/lesson-placement.test.ts` — pure provenance and reason-precedence tests.
- `src/components/today/LessonPlacementReason.tsx` — accessible one-badge disclosure UI.
- `src/lib/today-placement-reason-regression.test.ts` — component contract and Today integration regression coverage.

**Modify**

- `src/lib/mock-data.ts` — add `LessonPlacementProvenance` and optional `Lesson.placementProvenance`.
- `src/lib/custom-subjects.ts` — normalize provenance, protect imports, and clear/preserve provenance during editor updates.
- `src/lib/custom-subjects.test.ts` — catalog round-trip, malformed-data, import, and editor-clearing tests.
- `src/lib/schedule-candidates.ts` — create provenance atomically in manual date-move candidates.
- `src/lib/schedule-candidates.test.ts` — deterministic first/second/no-op move tests.
- `src/lib/schedule-operations-integration.test.ts` — transaction failure and undo restoration coverage.
- `src/components/FlexiblePlanner.tsx` — ensure every move control continues to use the single `moveLessonToDate` path.
- `src/lib/flexible-planner-transactions-regression.test.ts` — protect the single move boundary.
- `src/components/today/TodayLessonCard.tsx` — accept and render a derived placement reason.
- `src/components/TodayPanel.tsx` — derive reasons from the assigned Today date and review age.

---

### Task 1: Add the provenance type and pure sanitizer

**Files:**
- Modify: `src/lib/mock-data.ts`
- Create: `src/lib/lesson-placement.ts`
- Create: `src/lib/lesson-placement.test.ts`

**Interfaces:**
- Produces:

```ts
export type LessonPlacementProvenance = {
  kind: "manual-move";
  movedAt: string;
  fromDateISO: string;
  toDateISO: string;
};

export function sanitizeLessonPlacementProvenance(
  value: unknown,
): LessonPlacementProvenance | undefined;
```

- [ ] **Step 1: Write failing sanitizer tests**

Add `src/lib/lesson-placement.test.ts` with focused cases:

```ts
import { describe, expect, test } from "vitest";
import { sanitizeLessonPlacementProvenance } from "./lesson-placement";

const valid = {
  kind: "manual-move",
  movedAt: "2030-01-03T04:05:06.000Z",
  fromDateISO: "2030-01-01",
  toDateISO: "2030-01-03",
};

describe("sanitizeLessonPlacementProvenance", () => {
  test("returns a detached valid provenance object", () => {
    const result = sanitizeLessonPlacementProvenance(valid);
    expect(result).toEqual(valid);
    expect(result).not.toBe(valid);
  });

  test.each([
    null,
    {},
    { ...valid, kind: "imported" },
    { ...valid, fromDateISO: "2030-02-30" },
    { ...valid, toDateISO: "not-a-date" },
    { ...valid, toDateISO: valid.fromDateISO },
    { ...valid, movedAt: "not-a-time" },
  ])("rejects malformed provenance %#", (value) => {
    expect(sanitizeLessonPlacementProvenance(value)).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
npx vitest run src/lib/lesson-placement.test.ts
```

Expected: FAIL because `lesson-placement.ts` and the sanitizer do not exist.

- [ ] **Step 3: Add the catalog type**

In `src/lib/mock-data.ts`, place the provenance type beside `LessonScheduleMode` and add the optional field to `Lesson`:

```ts
export type LessonPlacementProvenance = {
  kind: "manual-move";
  movedAt: string;
  fromDateISO: string;
  toDateISO: string;
};

export type Lesson = {
  // existing fields
  placementProvenance?: LessonPlacementProvenance;
};
```

Do not add provenance to sample-roadmap construction; existing lessons intentionally begin without move history.

- [ ] **Step 4: Implement the minimal sanitizer**

Create `src/lib/lesson-placement.ts`:

```ts
import { isDateISO } from "./date-utils";
import type { LessonPlacementProvenance } from "./mock-data";

export function sanitizeLessonPlacementProvenance(
  value: unknown,
): LessonPlacementProvenance | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const raw = value as Record<string, unknown>;
  if (raw.kind !== "manual-move") return undefined;
  if (!isDateISO(raw.fromDateISO) || !isDateISO(raw.toDateISO)) return undefined;
  if (raw.fromDateISO === raw.toDateISO) return undefined;
  if (typeof raw.movedAt !== "string" || Number.isNaN(Date.parse(raw.movedAt))) {
    return undefined;
  }
  return {
    kind: "manual-move",
    movedAt: raw.movedAt,
    fromDateISO: raw.fromDateISO,
    toDateISO: raw.toDateISO,
  };
}
```

- [ ] **Step 5: Run the focused test and typecheck**

Run:

```bash
npx vitest run src/lib/lesson-placement.test.ts
npm run typecheck
```

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/mock-data.ts src/lib/lesson-placement.ts src/lib/lesson-placement.test.ts
git commit -m "feat: define lesson move provenance"
```

---

### Task 2: Preserve valid provenance through catalog reload and reject imported provenance

**Files:**
- Modify: `src/lib/custom-subjects.ts`
- Modify: `src/lib/custom-subjects.test.ts`

**Interfaces:**
- Consumes: `sanitizeLessonPlacementProvenance(value)` from Task 1.
- Produces: `normalizeSubjects()` returns valid provenance and strips malformed provenance.

- [ ] **Step 1: Write failing normalization and import tests**

Add cases to `src/lib/custom-subjects.test.ts` using the existing lesson/catalog fixtures:

```ts
test("retains valid placement provenance through catalog normalization", () => {
  const raw = structuredClone(SUBJECTS.slice(0, 1));
  raw[0].milestones[0].lessons[0].placementProvenance = {
    kind: "manual-move",
    movedAt: "2030-01-03T04:05:06.000Z",
    fromDateISO: "2030-01-01",
    toDateISO: "2030-01-03",
  };

  const normalized = normalizeSubjects(JSON.parse(JSON.stringify(raw)));
  expect(normalized?.[0].milestones[0].lessons[0].placementProvenance).toEqual(
    raw[0].milestones[0].lessons[0].placementProvenance,
  );
});

test("strips malformed provenance but retains the lesson", () => {
  const raw = structuredClone(SUBJECTS.slice(0, 1)) as unknown as Array<Record<string, unknown>>;
  const lesson = (raw[0] as any).milestones[0].lessons[0];
  lesson.placementProvenance = {
    kind: "manual-move",
    movedAt: "invalid",
    fromDateISO: "2030-01-01",
    toDateISO: "2030-01-03",
  };

  const normalized = normalizeSubjects(raw);
  expect(normalized?.[0].milestones[0].lessons[0].id).toBe(lesson.id);
  expect(normalized?.[0].milestones[0].lessons[0].placementProvenance).toBeUndefined();
});

test("JSON import cannot inject placement provenance", () => {
  const parsed = parseJSONInput(JSON.stringify([{ 
    subject_name: "Toán",
    lesson_name: "Bài nhập",
    planned_date: "2030-01-03",
    placementProvenance: {
      kind: "manual-move",
      movedAt: "2030-01-03T04:05:06.000Z",
      fromDateISO: "2030-01-01",
      toDateISO: "2030-01-03",
    },
  }]));
  const imported = convertRawToSubjects(parsed);
  expect(imported[0].milestones[0].lessons[0].placementProvenance).toBeUndefined();
});
```

Use the file’s existing fixture helpers instead of introducing a second catalog fixture when equivalent helpers already exist.

- [ ] **Step 2: Verify RED**

Run:

```bash
npx vitest run src/lib/custom-subjects.test.ts
```

Expected: valid provenance is currently dropped or malformed provenance is not explicitly sanitized.

- [ ] **Step 3: Sanitize provenance inside `normalizeSubjects`**

Import the sanitizer:

```ts
import { sanitizeLessonPlacementProvenance } from "./lesson-placement";
```

When building each normalized lesson, compute once:

```ts
const placementProvenance = sanitizeLessonPlacementProvenance(rawLesson.placementProvenance);
```

Then include only valid metadata:

```ts
return {
  // existing normalized lesson fields
  ...(placementProvenance ? { placementProvenance } : {}),
};
```

Do not spread unknown raw lesson properties into the normalized lesson.

- [ ] **Step 4: Keep import DTOs provenance-free**

Confirm `ImportedRawLesson` remains limited to documented import fields and `parseJSONInputWithDiagnostics` does not read `placementProvenance`. Do not add the new field to CSV headers, JSON aliases, or `convertRawToSubjects`.

- [ ] **Step 5: Add a reload-path test**

Use the existing `StorageAdapter` test helper or a minimal in-memory adapter to set `CUSTOM_SUBJECTS_KEY` to `JSON.stringify(catalogWithProvenance)`, then call:

```ts
const loaded = getStoredCustomSubjects(storage);
expect(loaded.status).toBe("ok");
if (loaded.status === "ok") {
  expect(loaded.value[0].milestones[0].lessons[0].placementProvenance).toEqual(validProvenance);
}
```

This is the direct evidence that provenance survives application reload through the normal loader.

- [ ] **Step 6: Run focused tests**

```bash
npx vitest run src/lib/custom-subjects.test.ts src/lib/lesson-placement.test.ts
```

Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/custom-subjects.ts src/lib/custom-subjects.test.ts
git commit -m "feat: persist sanitized move provenance"
```

---

### Task 3: Define editor clearing and preservation semantics

**Files:**
- Modify: `src/lib/custom-subjects.ts`
- Modify: `src/lib/custom-subjects.test.ts`

**Interfaces:**
- Extends the existing `updateLessonDetails()` patch to accept `placementProvenance` explicitly.
- Produces editor semantics used by both `buildMoveLessonDateCandidate` and existing lesson editors.

- [ ] **Step 1: Write failing editor-behavior tests**

Add one fixture lesson with valid provenance and these tests:

```ts
test("changing the lesson date clears old provenance", () => {
  const next = updateLessonDetails(subjectsWithProvenance(), "lesson-1", {
    scheduledDate: "2030-01-04",
  });
  expect(findTestLesson(next).placementProvenance).toBeUndefined();
});

test("changing schedule mode clears old provenance", () => {
  const next = updateLessonDetails(subjectsWithProvenance(), "lesson-1", {
    scheduleMode: "fixed",
  });
  expect(findTestLesson(next).placementProvenance).toBeUndefined();
});

test("same date and same mode preserve provenance", () => {
  const next = updateLessonDetails(subjectsWithProvenance(), "lesson-1", {
    scheduledDate: "2030-01-03",
    scheduleMode: "flexible",
  });
  expect(findTestLesson(next).placementProvenance).toEqual(validProvenance);
});

test("non-schedule edits preserve provenance", () => {
  const next = updateLessonDetails(subjectsWithProvenance(), "lesson-1", {
    title: "Tên mới",
    plannedDurationMinutes: 75,
    xp: 50,
  });
  expect(findTestLesson(next).placementProvenance).toEqual(validProvenance);
});

test("an explicit new provenance replaces the cleared value", () => {
  const replacement = { ...validProvenance, toDateISO: "2030-01-05" };
  const next = updateLessonDetails(subjectsWithProvenance(), "lesson-1", {
    scheduledDate: "2030-01-05",
    placementProvenance: replacement,
  });
  expect(findTestLesson(next).placementProvenance).toEqual(replacement);
});
```

- [ ] **Step 2: Verify RED**

```bash
npx vitest run src/lib/custom-subjects.test.ts
```

Expected: the patch type rejects `placementProvenance` and schedule edits currently preserve old metadata.

- [ ] **Step 3: Extend the patch type**

Change the `Pick<Lesson, ...>` list in `updateLessonDetails` to include `placementProvenance`:

```ts
"title" |
"topic" |
"plannedDurationMinutes" |
"scheduledDate" |
"scheduleMode" |
"xp" |
"placementProvenance"
```

- [ ] **Step 4: Implement exact-change detection**

Inside the lesson normalization callback, calculate:

```ts
const previousMode = lesson.scheduleMode ?? "flexible";
const nextMode =
  patch.scheduleMode === "fixed" || patch.scheduleMode === "flexible"
    ? patch.scheduleMode
    : previousMode;
const dateChanged =
  typeof patch.scheduledDate === "string" && patch.scheduledDate !== lesson.scheduledDate;
const modeChanged = patch.scheduleMode !== undefined && nextMode !== previousMode;
const hasExplicitProvenance = Object.prototype.hasOwnProperty.call(
  patch,
  "placementProvenance",
);
const placementProvenance = hasExplicitProvenance
  ? patch.placementProvenance
  : dateChanged || modeChanged
    ? undefined
    : lesson.placementProvenance;
```

Return the lesson with:

```ts
...(placementProvenance ? { placementProvenance } : { placementProvenance: undefined })
```

This explicit assignment removes a previous field when a schedule edit clears it.

- [ ] **Step 5: Run focused tests**

```bash
npx vitest run src/lib/custom-subjects.test.ts
npm run typecheck
```

Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/custom-subjects.ts src/lib/custom-subjects.test.ts
git commit -m "feat: clear move provenance on editor schedule changes"
```

---

### Task 4: Create provenance atomically for every manual date move

**Files:**
- Modify: `src/lib/schedule-candidates.ts`
- Modify: `src/lib/schedule-candidates.test.ts`

**Interfaces:**
- Consumes: editor semantics from Task 3.
- Produces:

```ts
export function buildMoveLessonDateCandidate(params: {
  current: ScheduleSnapshot;
  lessonId: string;
  targetDateISO: string;
  now?: () => Date;
}): MoveLessonDateCandidateResult;
```

- [ ] **Step 1: Add deterministic failing tests**

Extend `describe("buildMoveLessonDateCandidate")`:

```ts
test("creates provenance for the first manual move", () => {
  const result = buildMoveLessonDateCandidate({
    current: currentSnapshot(),
    lessonId: "lesson-1",
    targetDateISO: "2030-01-04",
    now: () => new Date("2030-01-02T03:04:05.000Z"),
  });
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  expect(result.candidate.subjects[0].milestones[0].lessons[0]).toMatchObject({
    scheduledDate: "2030-01-04",
    placementProvenance: {
      kind: "manual-move",
      movedAt: "2030-01-02T03:04:05.000Z",
      fromDateISO: "2030-01-01",
      toDateISO: "2030-01-04",
    },
  });
});

test("a second move replaces the previous provenance", () => {
  const current = currentSnapshot();
  current.subjects[0].milestones[0].lessons[0].placementProvenance = {
    kind: "manual-move",
    movedAt: "2030-01-01T00:00:00.000Z",
    fromDateISO: "2029-12-31",
    toDateISO: "2030-01-01",
  };
  const result = buildMoveLessonDateCandidate({
    current,
    lessonId: "lesson-1",
    targetDateISO: "2030-01-05",
    now: () => new Date("2030-01-03T00:00:00.000Z"),
  });
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  expect(result.candidate.subjects[0].milestones[0].lessons[0].placementProvenance).toEqual({
    kind: "manual-move",
    movedAt: "2030-01-03T00:00:00.000Z",
    fromDateISO: "2030-01-01",
    toDateISO: "2030-01-05",
  });
});

test("a same-date no-op preserves the existing provenance", () => {
  const current = currentSnapshot();
  const previous = {
    kind: "manual-move" as const,
    movedAt: "2030-01-01T00:00:00.000Z",
    fromDateISO: "2029-12-31",
    toDateISO: "2030-01-01",
  };
  current.subjects[0].milestones[0].lessons[0].placementProvenance = previous;
  const now = vi.fn(() => new Date("2030-01-03T00:00:00.000Z"));
  const result = buildMoveLessonDateCandidate({
    current,
    lessonId: "lesson-1",
    targetDateISO: "2030-01-01",
    now,
  });
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error);
  expect(result.candidate.subjects[0].milestones[0].lessons[0].placementProvenance).toEqual(previous);
  expect(now).not.toHaveBeenCalled();
});
```

Add `vi` to the Vitest import.

- [ ] **Step 2: Verify RED**

```bash
npx vitest run src/lib/schedule-candidates.test.ts
```

Expected: the builder does not accept `now` and does not create provenance.

- [ ] **Step 3: Implement atomic date plus provenance update**

In `buildMoveLessonDateCandidate`, keep the existing lesson lookup and no-op return. After the no-op check, create:

```ts
const placementProvenance = {
  kind: "manual-move" as const,
  movedAt: (params.now ?? (() => new Date()))().toISOString(),
  fromDateISO: lesson.scheduledDate,
  toDateISO: params.targetDateISO,
};
```

Pass both fields in one `updateLessonDetails` call:

```ts
const subjects = updateLessonDetails(current.subjects, params.lessonId, {
  scheduledDate: params.targetDateISO,
  placementProvenance,
});
```

Do not create a second mutation or second persistence call.

- [ ] **Step 4: Run focused tests**

```bash
npx vitest run src/lib/schedule-candidates.test.ts src/lib/custom-subjects.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/schedule-candidates.ts src/lib/schedule-candidates.test.ts
git commit -m "feat: record manual lesson moves"
```

---

### Task 5: Derive one truthful primary reason with secondary manual-move detail

**Files:**
- Modify: `src/lib/lesson-placement.ts`
- Modify: `src/lib/lesson-placement.test.ts`

**Interfaces:**
- Produces:

```ts
export type LessonPlacementReasonKind =
  | "fixed-today"
  | "manual-move"
  | "carried-from-earlier-date"
  | "next-in-roadmap"
  | "review-due";

export type ManualMoveDetail = LessonPlacementProvenance;

export type LessonPlacementReason = {
  kind: LessonPlacementReasonKind;
  label: string;
  description: string;
  manualMove?: ManualMoveDetail;
  reviewAgeDays?: number;
};

export function deriveLessonPlacementReason(params: {
  lesson: Lesson;
  assignedDateISO: string;
}): LessonPlacementReason;

export function deriveReviewPlacementReason(params: {
  ageDays: number;
}): LessonPlacementReason;
```

- [ ] **Step 1: Add failing precedence tests**

Append tests covering all approved cases:

```ts
describe("deriveLessonPlacementReason", () => {
  test("fixed today wins over manual move but keeps manual detail", () => {
    const reason = deriveLessonPlacementReason({
      lesson: lesson({ scheduleMode: "fixed", scheduledDate: "2030-01-03", placementProvenance: valid }),
      assignedDateISO: "2030-01-03",
    });
    expect(reason.kind).toBe("fixed-today");
    expect(reason.label).toBe("Cố định hôm nay");
    expect(reason.manualMove).toEqual(valid);
  });

  test("manual move is primary when its target is the assigned date", () => {
    const reason = deriveLessonPlacementReason({
      lesson: lesson({ scheduledDate: "2030-01-03", placementProvenance: valid }),
      assignedDateISO: "2030-01-03",
    });
    expect(reason.kind).toBe("manual-move");
  });

  test("capacity carry wins when assignment is later than the move target", () => {
    const reason = deriveLessonPlacementReason({
      lesson: lesson({ scheduledDate: "2030-01-03", placementProvenance: valid }),
      assignedDateISO: "2030-01-05",
    });
    expect(reason.kind).toBe("carried-from-earlier-date");
    expect(reason.manualMove).toEqual(valid);
  });

  test("ordinary flexible work uses roadmap fallback", () => {
    expect(
      deriveLessonPlacementReason({
        lesson: lesson({ scheduledDate: "2030-01-03" }),
        assignedDateISO: "2030-01-03",
      }).kind,
    ).toBe("next-in-roadmap");
  });
});

test("review reason uses the supplied interval", () => {
  expect(deriveReviewPlacementReason({ ageDays: 7 })).toEqual({
    kind: "review-due",
    label: "Ôn sau 7 ngày",
    description: "Bài đến lượt ôn theo mốc nhắc sau 7 ngày.",
    reviewAgeDays: 7,
  });
});
```

The local `lesson()` test helper must return a complete `Lesson`, with overrides merged last.

- [ ] **Step 2: Verify RED**

```bash
npx vitest run src/lib/lesson-placement.test.ts
```

Expected: reason types and functions do not exist.

- [ ] **Step 3: Implement exact precedence**

In `deriveLessonPlacementReason`:

```ts
const manualMove = sanitizeLessonPlacementProvenance(params.lesson.placementProvenance);
const mode = params.lesson.scheduleMode ?? "flexible";

if (mode === "fixed" && params.lesson.scheduledDate === params.assignedDateISO) {
  return {
    kind: "fixed-today",
    label: "Cố định hôm nay",
    description: "Bài cố định đã được đặt vào lịch hôm nay.",
    ...(manualMove ? { manualMove } : {}),
  };
}

if (manualMove?.toDateISO === params.assignedDateISO) {
  return {
    kind: "manual-move",
    label: "Đã chuyển thủ công",
    description: "Bạn đã chuyển bài sang ngày này.",
    manualMove,
  };
}

if (mode === "flexible" && params.assignedDateISO > params.lesson.scheduledDate) {
  return {
    kind: "carried-from-earlier-date",
    label: "Dời vì ngày trước đầy",
    description:
      "Ngày đủ điều kiện trước đó không còn đủ công suất nên bài được chuyển sang hôm nay.",
    ...(manualMove ? { manualMove } : {}),
  };
}

return {
  kind: "next-in-roadmap",
  label: "Tiếp theo trong lộ trình",
  description: "Đây là bài tiếp theo chưa hoàn thành trong thứ tự học hiện tại.",
  ...(manualMove ? { manualMove } : {}),
};
```

Implement review derivation exactly as tested. Do not infer a `manually-added` reason.

- [ ] **Step 4: Run focused tests and typecheck**

```bash
npx vitest run src/lib/lesson-placement.test.ts
npm run typecheck
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/lesson-placement.ts src/lib/lesson-placement.test.ts
git commit -m "feat: derive lesson placement reasons"
```

---

### Task 6: Build the accessible reason disclosure component

**Files:**
- Create: `src/components/today/LessonPlacementReason.tsx`
- Create: `src/lib/today-placement-reason-regression.test.ts`

**Interfaces:**
- Consumes: `LessonPlacementReason` from Task 5.
- Produces:

```ts
export function LessonPlacementReason({
  reason,
}: {
  reason: LessonPlacementReason;
}): JSX.Element;
```

- [ ] **Step 1: Write the failing component contract test**

Create `src/lib/today-placement-reason-regression.test.ts` using `renderToStaticMarkup`:

```ts
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { LessonPlacementReason } from "../components/today/LessonPlacementReason";

const manualMove = {
  kind: "manual-move" as const,
  movedAt: "2030-01-03T04:05:06.000Z",
  fromDateISO: "2030-01-01",
  toDateISO: "2030-01-03",
};

describe("LessonPlacementReason", () => {
  test("renders one primary badge and a collapsed accessible detail button", () => {
    const html = renderToStaticMarkup(
      <LessonPlacementReason
        reason={{
          kind: "fixed-today",
          label: "Cố định hôm nay",
          description: "Bài cố định đã được đặt vào lịch hôm nay.",
          manualMove,
        }}
      />,
    );
    expect(html.match(/data-placement-reason-badge/g)).toHaveLength(1);
    expect(html).toContain("Cố định hôm nay");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Chi tiết");
  });

  test("uses a button-driven disclosure instead of hover-only UI", () => {
    const source = readFileSync(
      new URL("../components/today/LessonPlacementReason.tsx", import.meta.url),
      "utf8",
    );
    expect(source).toContain("aria-expanded={open}");
    expect(source).toContain("onClick={() => setOpen");
    expect(source).not.toContain("onMouseEnter");
  });
});
```

Because this is a `.ts` test under `src/lib`, construct the React element with `React.createElement(...)` rather than JSX, or rename it to `.test.tsx` only after confirming the existing Vitest include picks it up. Prefer `React.createElement` to keep the file consistent with the current test command.

- [ ] **Step 2: Verify RED**

```bash
npx vitest run src/lib/today-placement-reason-regression.test.ts
```

Expected: component import fails.

- [ ] **Step 3: Implement the component**

Use `useId` and `useState`:

```tsx
import { useId, useState } from "react";
import type { LessonPlacementReason as PlacementReason } from "@/lib/lesson-placement";
import { cn } from "@/lib/utils";

export function LessonPlacementReason({ reason }: { reason: PlacementReason }) {
  const [open, setOpen] = useState(false);
  const detailId = useId();
  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span
          data-placement-reason-badge
          className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold", tone[reason.kind])}
        >
          {reason.label}
        </span>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailId}
          onClick={() => setOpen((value) => !value)}
          className="min-h-8 rounded-lg px-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          {open ? "Ẩn chi tiết" : "Chi tiết"}
        </button>
      </div>
      {open && (
        <div id={detailId} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">Tại sao bài này xuất hiện?</p>
          <p className="mt-1">{reason.description}</p>
          {reason.manualMove && <ManualMoveDetail provenance={reason.manualMove} />}
        </div>
      )}
    </div>
  );
}
```

Define a complete `tone` record for all five reason kinds. Implement `ManualMoveDetail` in the same file and format `fromDateISO`, `toDateISO`, and `movedAt` with `Intl.DateTimeFormat("vi-VN", ...)`. Invalid time values must not throw; the pure sanitizer should already prevent them, but the formatter should return the original string on failure.

- [ ] **Step 4: Run focused tests**

```bash
npx vitest run src/lib/today-placement-reason-regression.test.ts
npm run typecheck
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/today/LessonPlacementReason.tsx src/lib/today-placement-reason-regression.test.ts
git commit -m "feat: add placement reason disclosure"
```

---

### Task 7: Integrate reasons into Today cards and the priority block

**Files:**
- Modify: `src/components/today/TodayLessonCard.tsx`
- Modify: `src/components/TodayPanel.tsx`
- Modify: `src/lib/today-placement-reason-regression.test.ts`

**Interfaces:**
- `TodayLessonCard` consumes:

```ts
placementReason: LessonPlacementReason;
```

- `TodayPanel` derives lesson reasons with `assignedDateISO: today` and review reasons with `ageDays`.

- [ ] **Step 1: Add failing source-contract assertions**

Append to `src/lib/today-placement-reason-regression.test.ts`:

```ts
test("TodayPanel derives reasons and TodayLessonCard renders them", () => {
  const panel = readFileSync(new URL("../components/TodayPanel.tsx", import.meta.url), "utf8");
  const card = readFileSync(
    new URL("../components/today/TodayLessonCard.tsx", import.meta.url),
    "utf8",
  );

  expect(panel).toContain("deriveLessonPlacementReason");
  expect(panel).toContain("deriveReviewPlacementReason");
  expect(panel).toContain("assignedDateISO: today");
  expect(panel).toContain("placementReason=");
  expect(card).toContain("placementReason: LessonPlacementReason");
  expect(card).toContain("<LessonPlacementReason reason={placementReason}");
});
```

- [ ] **Step 2: Verify RED**

```bash
npx vitest run src/lib/today-placement-reason-regression.test.ts
```

Expected: assertions fail because Today is not wired yet.

- [ ] **Step 3: Extend `TodayLessonCard`**

Import the reason type and component:

```ts
import type { LessonPlacementReason as PlacementReason } from "@/lib/lesson-placement";
import { LessonPlacementReason } from "./LessonPlacementReason";
```

Add to `Props`:

```ts
placementReason: PlacementReason;
```

Destructure it and render exactly once beneath the subject/topic metadata and above progress:

```tsx
<LessonPlacementReason reason={placementReason} />
```

Keep `reviewAgeDays` only where needed for review styling or existing copy; do not render a second competing reason badge.

- [ ] **Step 4: Derive reasons in `TodayPanel`**

Import:

```ts
import {
  deriveLessonPlacementReason,
  deriveReviewPlacementReason,
} from "@/lib/lesson-placement";
```

For each new lesson:

```tsx
const placementReason = deriveLessonPlacementReason({
  lesson,
  assignedDateISO: today,
});
```

Pass `placementReason={placementReason}`.

For each review:

```tsx
const placementReason = deriveReviewPlacementReason({ ageDays: review.ageDays });
```

Pass it to the review card.

- [ ] **Step 5: Remove conflicting ad-hoc priority explanations**

When building `prioritizedLesson`, store the same derived object:

```ts
placementReason: deriveLessonPlacementReason({ lesson, assignedDateISO: today })
```

For reviews use `deriveReviewPlacementReason`. Replace the hard-coded `Bài mới phù hợp với quỹ ...` and `Bài ôn đến hạn ...` strings with `prioritizedLesson.placementReason.description` so the priority block and lesson card cannot contradict each other.

- [ ] **Step 6: Run focused tests and typecheck**

```bash
npx vitest run src/lib/today-placement-reason-regression.test.ts src/lib/lesson-placement.test.ts
npm run typecheck
```

Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/today/TodayLessonCard.tsx src/components/TodayPanel.tsx src/lib/today-placement-reason-regression.test.ts
git commit -m "feat: explain Today lesson placement"
```

---

### Task 8: Verify the single Flexible Planner move boundary, failure atomicity, and undo

**Files:**
- Modify: `src/components/FlexiblePlanner.tsx` only if a move control bypasses `moveLessonToDate`
- Modify: `src/lib/flexible-planner-transactions-regression.test.ts`
- Modify: `src/lib/schedule-operations-integration.test.ts`

**Interfaces:**
- All UI move paths call `moveLessonToDate(lessonId, targetDateISO)`.
- `moveLessonToDate` calls `buildMoveLessonDateCandidate` once and commits one `move-lesson-date` transaction.

- [ ] **Step 1: Protect the single move boundary with a failing regression test**

Extend `src/lib/flexible-planner-transactions-regression.test.ts`:

```ts
test("every Flexible Planner move method uses the canonical date-move candidate", () => {
  expect(plannerSource).toContain("const moveLessonToDate =");
  expect(plannerSource).toContain("buildMoveLessonDateCandidate({");
  expect(plannerSource).toContain('kind: "move-lesson-date"');
  expect(plannerSource).toContain("moveLessonToDate(lessonId, targetDateISO)");
  expect(plannerSource).not.toContain("updateLessonDetails(subjects");
});
```

Inspect drag/drop, previous-day, next-day, and any date chooser callbacks. If any callback directly changes subjects or calls the candidate builder separately, route it through `moveLessonToDate` before making the test pass.

- [ ] **Step 2: Add transaction integration tests**

In `src/lib/schedule-operations-integration.test.ts`, add:

```ts
test("failed move persistence publishes neither the new date nor provenance", () => {
  const current = createScheduleSnapshot(catalog([lesson("first", "2030-01-01")]), settings(2));
  const built = buildMoveLessonDateCandidate({
    current,
    lessonId: "first",
    targetDateISO: "2030-01-03",
    now: () => new Date("2030-01-02T00:00:00.000Z"),
  });
  if (!built.ok) throw new Error(built.error);
  const applyCandidate = vi.fn();
  const result = commitScheduleMutation({
    current,
    candidate: built.candidate,
    history: [],
    kind: "move-lesson-date",
    description: "Di chuyển kiểm thử",
    saveSubjects: vi.fn(() => ({ ok: false, error: "write failed" })),
    savePlannerSettings: vi.fn(success),
    applyCandidate,
  });
  expect(result.ok).toBe(false);
  expect(applyCandidate).not.toHaveBeenCalled();
  expect(result.history).toEqual([]);
  expect(current.subjects[0].milestones[0].lessons[0].placementProvenance).toBeUndefined();
});

test("undo restores the previous date and previous provenance", () => {
  const current = createScheduleSnapshot(catalog([lesson("first", "2030-01-01")]), settings(2));
  current.subjects[0].milestones[0].lessons[0].placementProvenance = {
    kind: "manual-move",
    movedAt: "2030-01-01T00:00:00.000Z",
    fromDateISO: "2029-12-31",
    toDateISO: "2030-01-01",
  };
  const built = buildMoveLessonDateCandidate({
    current,
    lessonId: "first",
    targetDateISO: "2030-01-03",
    now: () => new Date("2030-01-02T00:00:00.000Z"),
  });
  if (!built.ok) throw new Error(built.error);
  const committed = commitCandidate({ current, candidate: built.candidate, kind: "move-lesson-date" });
  if (!committed.ok || committed.status !== "committed") throw new Error("Expected commit");
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

Extend the local `commitCandidate` kind union to include `"move-lesson-date"` if necessary.

- [ ] **Step 3: Verify RED, then make only boundary fixes required by evidence**

Run:

```bash
npx vitest run src/lib/flexible-planner-transactions-regression.test.ts src/lib/schedule-operations-integration.test.ts
```

If the regression test finds a bypass, change that callback to call `moveLessonToDate`. Do not introduce another transaction owner or persistence path.

- [ ] **Step 4: Run the focused P0/P1A transaction suite**

```bash
npx vitest run \
  src/lib/schedule-candidates.test.ts \
  src/lib/schedule-transactions.test.ts \
  src/lib/schedule-mutation-controller.test.ts \
  src/lib/schedule-operations-integration.test.ts \
  src/lib/flexible-planner-transactions-regression.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/FlexiblePlanner.tsx src/lib/flexible-planner-transactions-regression.test.ts src/lib/schedule-operations-integration.test.ts
git commit -m "test: verify atomic provenance moves and undo"
```

If `FlexiblePlanner.tsx` required no change, omit it from `git add`.

---

### Task 9: Run full verification and prepare the stacked P1A PR

**Files:**
- Modify: `docs/superpowers/plans/2026-08-06-smart-planner-p1a-placement-explanations.md` only to append exact completion evidence after implementation.
- Create through GitHub: stacked draft PR from `improve/p1a-placement-explanations` to `improve/p0b-schedule-transactions`.

**Interfaces:**
- Produces an exact-head evidence record and reviewable stacked PR.

- [ ] **Step 1: Run formatting check on touched files**

Use Prettier without rewriting unrelated files:

```bash
npx prettier --check \
  src/lib/mock-data.ts \
  src/lib/lesson-placement.ts \
  src/lib/lesson-placement.test.ts \
  src/lib/custom-subjects.ts \
  src/lib/custom-subjects.test.ts \
  src/lib/schedule-candidates.ts \
  src/lib/schedule-candidates.test.ts \
  src/lib/schedule-operations-integration.test.ts \
  src/lib/flexible-planner-transactions-regression.test.ts \
  src/components/FlexiblePlanner.tsx \
  src/components/today/LessonPlacementReason.tsx \
  src/components/today/TodayLessonCard.tsx \
  src/components/TodayPanel.tsx \
  src/lib/today-placement-reason-regression.test.ts
```

If needed, run `npx prettier --write` only on files reported by this command.

- [ ] **Step 2: Run all required gates**

```bash
npm run typecheck
npm run lint
npm test
npm run build
git diff --exit-code
```

Expected:

- typecheck passes;
- lint has zero errors; report unchanged existing warnings separately;
- all tests pass;
- client, SSR, Nitro, and Vercel-target build pass;
- build and verification leave no tracked changes.

- [ ] **Step 3: Audit scope and workflow safety**

```bash
git diff --name-only 3e296b2d2bb1e7f52b482643a30496b4e3757c0a...HEAD
git status --short
git ls-tree -r --name-only HEAD .github/workflows
```

Expected:

- changed files are limited to the approved P1A spec, plan, provenance, schedule move, Today reason UI, and focused tests;
- working tree is clean;
- only the canonical read-only workflow remains.

- [ ] **Step 4: Append exact completion evidence to this plan**

Add a `## Completion Record` section containing:

- exact head SHA;
- exact test file and test counts;
- lint warning/error counts;
- build result;
- clean-tree result;
- Vercel deployment state for the exact head;
- any non-blocking pre-existing warning;
- explicit statement that P1A is stacked on P0 and not merged automatically.

Do not mark deployment successful until the exact-head Vercel status is `success`/`READY`.

- [ ] **Step 5: Commit the evidence update**

```bash
git add docs/superpowers/plans/2026-08-06-smart-planner-p1a-placement-explanations.md
git commit -m "docs: record P1A verification evidence"
```

- [ ] **Step 6: Open a stacked draft PR**

Use:

```text
base: improve/p0b-schedule-transactions
head: improve/p1a-placement-explanations
title: P1A: explain Today lesson placement
```

The PR body must summarize:

- persisted latest-move provenance;
- editor clear/preserve rules;
- reason precedence;
- accessible Today disclosure;
- atomic failure and undo evidence;
- exact-head verification;
- stacked dependency on P0;
- no automatic merge.

- [ ] **Step 7: Independent review before Ready for review**

Review the exact PR diff for:

- fabricated manual-move explanations;
- malformed provenance surviving normalization;
- schedule edits failing to clear provenance;
- no-op moves replacing provenance;
- a Move path bypassing the shared transaction boundary;
- multiple competing badges per card;
- hover-only or keyboard-inaccessible details;
- failed writes publishing partial state;
- unrelated P1 or P2 refactors.

Fix all Critical and Important findings, rerun the full gates at the new exact head, then mark the PR Ready for review. Do not merge it.

## Plan Self-Review Result

- Every approved P1A spec requirement maps to a task.
- Provenance persistence, import protection, editor clearing, move replacement, no-op behavior, reason precedence, UI accessibility, transaction atomicity, undo, reload, and exact-head verification all have explicit tests.
- Function and property names are consistent across tasks: `placementProvenance`, `sanitizeLessonPlacementProvenance`, `deriveLessonPlacementReason`, `deriveReviewPlacementReason`, and `buildMoveLessonDateCandidate({ now })`.
- The plan contains no unresolved placeholders and does not absorb the broader P1 roadmap.
