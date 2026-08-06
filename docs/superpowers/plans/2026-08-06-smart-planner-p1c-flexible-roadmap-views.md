# Smart Planner P1C Flexible Roadmap Views Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the capacity-aware weekly Roadmap as the default view and add a stable canonical subject → milestone/topic → lesson view without changing scheduler or persistence semantics.

**Architecture:** Move Roadmap grouping and status derivation into a pure `src/lib/roadmap-views.ts` read-model module. Keep `LearningRoadmap.tsx` as the transient UI-state and rendering boundary, with a two-option selector that switches between projection and canonical views while preserving subject selection and existing completion/add-lesson callbacks.

**Tech Stack:** React 19, TypeScript, Vitest, Tailwind CSS, existing Lucide icons and project primitives.

## Global Constraints

- Exact predecessor is `main@4af77aa0bb33d066dc170587f26e95b43db63d0f`.
- `Theo lịch dự kiến` remains the default and remains driven by scheduler-provided `shiftedDates`.
- `Theo thứ tự` never reorders from capacity, projected dates, completion dates, or manual moves.
- No scheduler, review, Forecast, Course Manager, persistence schema, transaction, undo, dependency, workflow, deployment, or history semantics change.
- Fixed lessons without a scheduler placement remain visible as `Chưa xếp được`.
- Undated lessons remain visible as `Kho bài chưa xếp lịch`.
- Selected Roadmap view is transient React state only.
- Preserve Lovable history: no rebase, amend, squash, force-push, or published-history rewrite.

---

### Task 1: Pure Roadmap projection and canonical selectors

**Files:**
- Create: `src/lib/roadmap-views.test.ts`
- Create: `src/lib/roadmap-views.ts`

**Interfaces:**
- Consumes: `Subject`, `Lesson` from `src/lib/mock-data.ts`; `getMondayISO`, `getSundayISO`, `displayDate` from `src/lib/date-utils.ts`; `sortSubjects` from `src/lib/subject-order.ts`.
- Produces:

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
  isComplete: boolean;
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

- [ ] **Step 1: Write the failing selector tests**

Create fixtures with two subjects, ordered milestones, flexible lessons, a fixed lesson, an undated lesson, and completion dates. Add tests that prove:

```ts
import { describe, expect, test } from "vitest";
import type { Lesson, Subject } from "./mock-data";
import { buildCanonicalRoadmap, buildRoadmapProjection } from "./roadmap-views";

function lesson(params: Partial<Lesson> & Pick<Lesson, "id" | "title">): Lesson {
  return {
    id: params.id,
    title: params.title,
    xp: 20,
    plannedDurationMinutes: 60,
    scheduledDate: "2030-01-01",
    scheduleMode: "flexible",
    weekday: "Thứ 2",
    sourceSubject: "Toán",
    week: 1,
    initialDone: false,
    ...params,
  };
}

const subjects: Subject[] = [
  {
    id: "math",
    name: "Toán",
    emoji: "📐",
    milestones: [
      {
        id: "algebra",
        title: "Đại số",
        subtitle: "",
        lessons: [
          lesson({ id: "m1", title: "Bài 1" }),
          lesson({ id: "m2", title: "Bài 2" }),
          lesson({ id: "fixed", title: "Bài cố định", scheduleMode: "fixed" }),
        ],
      },
      {
        id: "geometry",
        title: "Hình học",
        subtitle: "",
        lessons: [lesson({ id: "m3", title: "Bài 3", scheduledDate: "" })],
      },
    ],
  },
  {
    id: "physics",
    name: "Vật lý",
    emoji: "⚛️",
    milestones: [
      {
        id: "mechanics",
        title: "Cơ học",
        subtitle: "",
        lessons: [
          lesson({ id: "p1", title: "Bài Lý", sourceSubject: "Vật lý" }),
        ],
      },
    ],
  },
];

test("moves unfinished flexible lessons between projected weeks when shifted dates change", () => {
  const first = buildRoadmapProjection({
    subjects,
    completed: {},
    shiftedDates: { m1: "2030-01-02", m2: "2030-01-03", p1: "2030-01-04" },
    selectedSubjectId: "all",
  });
  const second = buildRoadmapProjection({
    subjects,
    completed: {},
    shiftedDates: { m1: "2030-01-02", m2: "2030-01-10", p1: "2030-01-11" },
    selectedSubjectId: "all",
  });

  expect(first.filter((group) => group.mondayISO).map((group) => group.items.map((item) => item.lesson.id))).toEqual([
    ["m1", "m2", "p1"],
  ]);
  expect(second.filter((group) => group.mondayISO).map((group) => group.items.map((item) => item.lesson.id))).toEqual([
    ["m1"],
    ["m2", "p1"],
  ]);
});

test("keeps canonical order stable when shifted dates and completion dates change", () => {
  const first = buildCanonicalRoadmap({
    subjects,
    completed: {},
    shiftedDates: { m1: "2030-02-01", m2: "2030-01-01" },
    selectedSubjectId: "math",
  });
  const second = buildCanonicalRoadmap({
    subjects,
    completed: { m1: "2030-03-01" },
    shiftedDates: { m1: "2030-04-01", m2: "2030-05-01" },
    selectedSubjectId: "math",
  });

  const ids = (groups: ReturnType<typeof buildCanonicalRoadmap>) =>
    groups.flatMap((subject) => subject.milestones.flatMap((milestone) => milestone.items.map((item) => item.lesson.id)));

  expect(ids(first)).toEqual(["m1", "m2", "fixed", "m3"]);
  expect(ids(second)).toEqual(["m1", "m2", "fixed", "m3"]);
});
```

Also assert completion-date grouping, fixed-unplaced visibility, undated grouping, subject filtering, all-subject hierarchy, and truthful `outside-horizon` status when a visibility set is supplied.

- [ ] **Step 2: Commit the RED tests and open a draft PR**

```bash
git add src/lib/roadmap-views.test.ts
git commit -m "test: define P1C roadmap view behavior"
```

Open a draft PR from `improve/p1c-flexible-roadmap-views` to `main`. GitHub Actions must fail because `./roadmap-views` does not exist. Confirm the failure is the expected missing-module failure rather than a fixture/type error.

- [ ] **Step 3: Implement the minimum pure selectors**

Implement these private helpers:

```ts
function selectedSubjects(subjects: Subject[], selectedSubjectId: string): Subject[];
function buildItem(params: {
  lesson: Lesson;
  subject: Subject;
  milestoneId: string;
  milestoneTitle: string;
  completed: Record<string, string>;
  shiftedDates: Record<string, string>;
  visibleScheduledLessonIds?: ReadonlySet<string>;
}): RoadmapLessonItem;
```

Status precedence must be exactly:

```ts
if (completionDate) return "completed";
if ((lesson.scheduleMode ?? "flexible") === "fixed" && !shiftedDate) return "unplaced-fixed";
if (!effectiveDate) return "unscheduled";
if (!visibleScheduledLessonIds) return "projected";
return visibleScheduledLessonIds.has(lesson.id) ? "projected" : "outside-horizon";
```

Projection mode must group completed lessons by completion date, unfinished fixed lessons by their scheduler placement or the special unplaced group, unfinished flexible lessons by `shiftedDates[id] ?? scheduledDate`, and undated lessons by the unscheduled group. Canonical mode must iterate stored subject → milestone → lesson arrays without sorting milestones or lessons.

- [ ] **Step 4: Verify selectors GREEN through the draft PR run**

Expected targeted result: all `src/lib/roadmap-views.test.ts` tests pass. Existing tests must remain green.

- [ ] **Step 5: Commit the pure selector implementation**

```bash
git add src/lib/roadmap-views.ts
git commit -m "feat: add P1C roadmap view selectors"
```

---

### Task 2: Integrate the two Roadmap views without mutation ownership

**Files:**
- Modify: `src/components/LearningRoadmap.tsx`
- Create: `src/lib/roadmap-views-regression.test.ts`

**Interfaces:**
- Consumes: `buildRoadmapProjection`, `buildCanonicalRoadmap`, `RoadmapViewMode`, `RoadmapLessonItem`, and `RoadmapProjectionGroup` from Task 1.
- Produces: a transient two-view selector; existing `LearningRoadmap` props remain source-compatible.

- [ ] **Step 1: Write the failing component/source regression test**

```ts
import fs from "node:fs/promises";
import { describe, expect, test } from "vitest";

describe("P1C Roadmap view integration", () => {
  test("keeps capacity projection as default and adds a transient canonical view", async () => {
    const source = await fs.readFile(
      new URL("../components/LearningRoadmap.tsx", import.meta.url),
      "utf8",
    );

    expect(source).toContain('useState<RoadmapViewMode>("projection")');
    expect(source).toContain("Theo lịch dự kiến");
    expect(source).toContain("Theo thứ tự");
    expect(source).toContain("buildRoadmapProjection");
    expect(source).toContain("buildCanonicalRoadmap");
    expect(source).toContain("Lịch dự kiến thay đổi theo quỹ giờ");
    expect(source).toContain("AddLessonModal");
    expect(source).toContain("onToggleLesson(item.lesson.id, item.lesson.xp)");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("sessionStorage");
    expect(source).not.toContain("persistPlannerSettings");
    expect(source).not.toContain("moveLessonToDate");
  });
});
```

- [ ] **Step 2: Commit and verify the regression test is RED**

```bash
git add src/lib/roadmap-views-regression.test.ts
git commit -m "test: require P1C roadmap view integration"
```

The PR run must fail because the selector labels and canonical integration are absent.

- [ ] **Step 3: Refactor `LearningRoadmap.tsx` to consume the selectors**

Required state:

```ts
const [viewMode, setViewMode] = useState<RoadmapViewMode>("projection");
const [subjectId, setSubjectId] = useState("all");
```

Required memoized read models:

```ts
const projectionGroups = useMemo(
  () => buildRoadmapProjection({ subjects, completed, shiftedDates, selectedSubjectId: subjectId }),
  [completed, shiftedDates, subjectId, subjects],
);

const canonicalGroups = useMemo(
  () => buildCanonicalRoadmap({ subjects, completed, shiftedDates, selectedSubjectId: subjectId }),
  [completed, shiftedDates, subjectId, subjects],
);
```

Render one `aria-label="Chế độ xem lộ trình"` selector with two native buttons and `aria-pressed`. Do not reset `viewMode` in the subject button handler. Preserve `AddLessonModal`, summary counts, completion callbacks, the projection path, fixed-unplaced copy, undated copy, and narrow-screen horizontal scrolling.

Extract a local non-nested-interactive `RoadmapLessonButton` helper that accepts `RoadmapLessonItem`, `completed`, `onToggleLesson`, and whether to show the subject badge. Canonical rendering must use semantic subject/milestone headings and lists in stored order.

- [ ] **Step 4: Verify component integration GREEN**

The draft PR run must show:

```text
npm run typecheck: PASS
npm run lint: PASS with no new errors
npm test: PASS
npm run build: PASS
git diff --exit-code: PASS
```

- [ ] **Step 5: Commit the component integration**

```bash
git add src/components/LearningRoadmap.tsx
git commit -m "feat: add flexible and canonical roadmap views"
```

---

### Task 3: Exact-head review and completion evidence

**Files:**
- Create only if needed for completion record: `docs/superpowers/evidence/2026-08-06-smart-planner-p1c-flexible-roadmap-views-completion.md`

**Interfaces:**
- Consumes: exact draft PR head, PR diff, workflow run and job logs.
- Produces: independently reviewable evidence; does not authorize merge.

- [ ] **Step 1: Audit exact changed-file scope**

Expected scope:

```text
docs/superpowers/plans/2026-08-06-smart-planner-p1c-flexible-roadmap-views.md
docs/superpowers/specs/2026-08-06-smart-planner-p1c-flexible-roadmap-views-design.md
src/components/LearningRoadmap.tsx
src/lib/roadmap-views.ts
src/lib/roadmap-views.test.ts
src/lib/roadmap-views-regression.test.ts
```

Any additional production file must be justified against the spec before acceptance.

- [ ] **Step 2: Review all 16 acceptance criteria against the exact diff**

Explicitly verify that capacity-aware projection still consumes `shiftedDates`, canonical order does not sort milestones/lessons, fixed/undated work remains visible, mode switching is transient, and no schedule mutation owner was added.

- [ ] **Step 3: Record final CI evidence**

Capture exact head SHA, PR merge ref if available, workflow run ID, job ID, test counts, build result, lint result, and clean-tree result.

- [ ] **Step 4: Leave the PR unmerged**

Mark implementation status only as:

```text
P1C IMPLEMENTED / REVIEW_PENDING / NOT_ACCEPTED / NOT_MERGED
```

Independent acceptance and merge each require separate decisions.
