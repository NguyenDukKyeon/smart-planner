# Smart Planner P0A Hours and Build Purity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make committed source authoritative, make all verification commands read-only, and support a single consistent daily study-capacity range of 0–16 hours in 0.5-hour increments.

**Architecture:** First materialize every accepted legacy patch into committed source and remove the runtime source-rewriting pipeline. Then introduce a focused `study-hours` policy module, route migration and progress mutations through pure helpers, and consume the same policy from Today, Flexible Schedule, and Forecast. GitHub Actions verifies typecheck, lint, tests, build, and a clean tracked tree.

**Tech Stack:** React 19, TypeScript 5.8, TanStack Start/Router, Tailwind CSS 4, Radix UI, Vitest 4, Node.js 22, GitHub Actions, Vercel.

## Global Constraints

- Daily study capacity is allowed from exactly `0` through `16` hours.
- Daily study capacity uses exactly `0.5`-hour increments.
- Values above `12` hours are allowed and show a non-blocking wellbeing note.
- `16` hours must produce exactly `960` quota minutes.
- Fixed lessons remain fixed to their exact selected date; flexible lessons keep their earliest-eligible-date semantics.
- Existing accepted drag, undo, roadmap-date, strict-streak, storage-recovery, PWA, and Web Push behavior must remain intact.
- `dev`, `typecheck`, `lint`, `test`, and `build` must never rewrite tracked source files.
- Do not add dependencies.
- Do not perform a broad component rewrite in this package.
- Do not rewrite published Git history; no force push, rebase of published commits, amend of published commits, or squash of published commits.
- Each task is independently reviewable and committed before the next task begins.

---

## File Structure

### New files

- `src/lib/build-purity-regression.test.ts` — locks command purity and confirms accepted generated behavior exists in committed source.
- `src/lib/study-hours.ts` — canonical daily-hour constants and normalization functions.
- `src/lib/study-hours.test.ts` — unit tests for range, rounding, and high-hour detection.
- `src/components/HighStudyHoursNote.tsx` — shared non-blocking wellbeing note.
- `src/lib/study-hours-ui-regression.test.ts` — verifies all three capacity surfaces consume the canonical policy.

### Modified files

- `package.json` — remove source-patching commands and add a read-only `verify` command.
- `src/lib/progress-store.ts` — use canonical normalization in migration, sanitization, and state mutations.
- `src/lib/progress-store.test.ts` — verify migration and pure state mutations through 16 hours.
- `src/lib/planner.test.ts` — verify the 960-minute quota.
- `src/components/TodayPanel.tsx` — use canonical range and show the shared high-hours note.
- `src/components/FlexiblePlanner.tsx` — use canonical range for each day and show the shared note.
- `src/components/ForecastCard.tsx` — use canonical range and show the shared note.
- `.github/workflows/build.yml` — run all quality gates and fail when tracked files change.
- `README.md` — document the supported capacity range and build-purity guarantee.

### Deleted files after equivalence is verified

- `scripts/fix-planning-dates.mjs`
- `scripts/prepare-app-build.mjs`
- `scripts/add-schedule-modes.mjs`
- `scripts/add-schedule-mode-bulk.mjs`
- `scripts/improve-lesson-order-drag.mjs`
- `scripts/improve-flexible-schedule-ux.mjs`
- `scripts/add-flexible-planner-undo.mjs`
- `scripts/templates/FlexiblePlanner.tsx`

---

### Task 1: Make committed source authoritative

**Files:**
- Create: `src/lib/build-purity-regression.test.ts`
- Modify: `package.json`
- Verify and retain generated output in:
  - `src/lib/planner.ts`
  - `src/lib/mock-data.ts`
  - `src/lib/custom-subjects.ts`
  - `src/routes/index.tsx`
  - `src/components/LearningRoadmap.tsx`
  - `src/components/TodayPanel.tsx`
  - `src/components/StudyStreakCard.tsx`
  - `src/components/AddLessonModal.tsx`
  - `src/components/CourseManagerModal.tsx`
  - `src/components/FlexiblePlanner.tsx`
- Delete:
  - `scripts/fix-planning-dates.mjs`
  - `scripts/prepare-app-build.mjs`
  - `scripts/add-schedule-modes.mjs`
  - `scripts/add-schedule-mode-bulk.mjs`
  - `scripts/improve-lesson-order-drag.mjs`
  - `scripts/improve-flexible-schedule-ux.mjs`
  - `scripts/add-flexible-planner-undo.mjs`
  - `scripts/templates/FlexiblePlanner.tsx`

**Interfaces:**
- Consumes: the current legacy patch chain and all accepted source-level regression tests.
- Produces: read-only npm commands and committed source that already contains the accepted patch results.

- [ ] **Step 1: Write the failing build-purity regression test**

Create `src/lib/build-purity-regression.test.ts`:

```ts
import { access, readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

const legacyPatchFiles = [
  "fix-planning-dates.mjs",
  "prepare-app-build.mjs",
  "add-schedule-modes.mjs",
  "add-schedule-mode-bulk.mjs",
  "improve-lesson-order-drag.mjs",
  "improve-flexible-schedule-ux.mjs",
  "add-flexible-planner-undo.mjs",
];

describe("build purity", () => {
  test("uses committed source without source-patching npm commands", async () => {
    const packageJson = JSON.parse(
      await readFile(new URL("../../package.json", import.meta.url), "utf8"),
    ) as { scripts: Record<string, string> };

    for (const scriptName of ["dev", "build", "build:dev", "typecheck", "test", "lint"]) {
      expect(packageJson.scripts[scriptName]).not.toMatch(/node scripts\/(fix-planning-dates|prepare-app-build|add-schedule-modes|add-schedule-mode-bulk|improve-lesson-order-drag|improve-flexible-schedule-ux|add-flexible-planner-undo)\.mjs/);
    }

    expect(packageJson.scripts.dev).toBe("vite dev --host 0.0.0.0 --port 3000");
    expect(packageJson.scripts.build).toBe("vitest run && vite build");
    expect(packageJson.scripts.typecheck).toBe("tsc --noEmit");
    expect(packageJson.scripts.test).toBe("vitest run");
    expect(packageJson.scripts.lint).toBe("eslint .");
    expect(packageJson.scripts.verify).toBe(
      "npm run typecheck && npm run lint && npm test && npm run build",
    );
  });

  test("removes obsolete source patch files after materialization", async () => {
    for (const fileName of legacyPatchFiles) {
      await expect(
        access(new URL(`../../scripts/${fileName}`, import.meta.url)),
      ).rejects.toThrow();
    }
    await expect(
      access(new URL("../../scripts/templates/FlexiblePlanner.tsx", import.meta.url)),
    ).rejects.toThrow();
  });

  test("keeps accepted flexible-schedule behavior in committed source", async () => {
    const source = await readFile(
      new URL("../components/FlexiblePlanner.tsx", import.meta.url),
      "utf8",
    );
    expect(source).toContain("Lịch linh hoạt");
    expect(source).toContain("application/x-smart-lesson-id");
    expect(source).toContain("unplacedFixedLessons");
    expect(source).toContain("undoStack");
    expect(source).toContain("undoLastMove");
    expect(source).toContain('aria-label="Hoàn tác lần chuyển lịch gần nhất"');
  });
});
```

- [ ] **Step 2: Run the new test and confirm it fails on the legacy pipeline**

Run:

```bash
npx vitest run src/lib/build-purity-regression.test.ts
```

Expected: FAIL because npm commands still invoke patch scripts and the legacy files still exist.

- [ ] **Step 3: Materialize the current patch chain once from a clean tree**

Run:

```bash
git status --short
node scripts/fix-planning-dates.mjs && \
node scripts/prepare-app-build.mjs && \
node scripts/add-schedule-modes.mjs && \
node scripts/add-schedule-mode-bulk.mjs && \
node scripts/improve-lesson-order-drag.mjs && \
node scripts/improve-flexible-schedule-ux.mjs && \
node scripts/add-flexible-planner-undo.mjs
git diff --name-only
```

Expected before the chain: no tracked changes.

Allowed changed paths after the chain are limited to:

```text
src/lib/planner.ts
src/lib/mock-data.ts
src/lib/custom-subjects.ts
src/routes/index.tsx
src/components/LearningRoadmap.tsx
src/components/TodayPanel.tsx
src/components/StudyStreakCard.tsx
src/components/AddLessonModal.tsx
src/components/CourseManagerModal.tsx
src/components/FlexiblePlanner.tsx
```

Reject and investigate any changed path outside this allowlist. Keep every allowed behavioral change because it is the generated source currently used by builds.

- [ ] **Step 4: Replace npm scripts with read-only commands**

Set the `scripts` section entries in `package.json` to:

```json
{
  "dev": "vite dev --host 0.0.0.0 --port 3000",
  "build": "vitest run && vite build",
  "build:dev": "vite build --mode development",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "lint": "eslint .",
  "verify": "npm run typecheck && npm run lint && npm test && npm run build",
  "format": "prettier --write .",
  "generate:vapid": "node scripts/generate-vapid.mjs"
}
```

Keep dependency declarations unchanged.

- [ ] **Step 5: Delete the obsolete patch scripts and template**

Run:

```bash
rm scripts/fix-planning-dates.mjs \
  scripts/prepare-app-build.mjs \
  scripts/add-schedule-modes.mjs \
  scripts/add-schedule-mode-bulk.mjs \
  scripts/improve-lesson-order-drag.mjs \
  scripts/improve-flexible-schedule-ux.mjs \
  scripts/add-flexible-planner-undo.mjs \
  scripts/templates/FlexiblePlanner.tsx
rmdir scripts/templates
```

`generate-vapid.mjs` remains because it generates credentials on explicit request and does not rewrite tracked application source.

- [ ] **Step 6: Run accepted behavior regressions**

Run:

```bash
npx vitest run \
  src/lib/planning-date-regression.test.ts \
  src/lib/schedule-mode-regression.test.ts \
  src/lib/catalog-order-drag-regression.test.ts \
  src/lib/flexible-planner-ux-regression.test.ts \
  src/lib/build-purity-regression.test.ts
```

Expected: all tests PASS. A failure in accepted drag, undo, fixed/flexible, roadmap-date, or subject-order behavior blocks deletion of the patch pipeline.

- [ ] **Step 7: Verify commands no longer modify source**

Run:

```bash
npm run typecheck
git diff --exit-code
npm test
git diff --exit-code
npm run build
git diff --exit-code
```

Expected: every command exits `0`; every `git diff --exit-code` exits `0` after the intended task changes have been staged or committed in a temporary checkpoint.

- [ ] **Step 8: Commit the authoritative-source transition**

```bash
git add package.json src scripts
git commit -m "refactor: make committed source authoritative"
```

---

### Task 2: Add the canonical daily study-hour policy

**Files:**
- Create: `src/lib/study-hours.ts`
- Create: `src/lib/study-hours.test.ts`

**Interfaces:**
- Consumes: finite numeric values supplied by forms, storage migration, and progress mutations.
- Produces:
  - `MIN_DAILY_STUDY_HOURS: 0`
  - `MAX_DAILY_STUDY_HOURS: 16`
  - `DAILY_STUDY_HOURS_STEP: 0.5`
  - `HIGH_DAILY_STUDY_HOURS_THRESHOLD: 12`
  - `normalizeDailyStudyHours(value: number): number`
  - `isHighDailyStudyHours(value: number): boolean`

- [ ] **Step 1: Write failing policy tests**

Create `src/lib/study-hours.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import {
  DAILY_STUDY_HOURS_STEP,
  HIGH_DAILY_STUDY_HOURS_THRESHOLD,
  MAX_DAILY_STUDY_HOURS,
  MIN_DAILY_STUDY_HOURS,
  isHighDailyStudyHours,
  normalizeDailyStudyHours,
} from "./study-hours";

describe("daily study-hour policy", () => {
  test("exports the approved range and step", () => {
    expect(MIN_DAILY_STUDY_HOURS).toBe(0);
    expect(MAX_DAILY_STUDY_HOURS).toBe(16);
    expect(DAILY_STUDY_HOURS_STEP).toBe(0.5);
    expect(HIGH_DAILY_STUDY_HOURS_THRESHOLD).toBe(12);
  });

  test.each([
    [-1, 0],
    [0, 0],
    [0.24, 0],
    [0.25, 0.5],
    [12, 12],
    [12.24, 12],
    [12.26, 12.5],
    [15.5, 15.5],
    [16, 16],
    [16.5, 16],
  ])("normalizes %s hours to %s", (input, expected) => {
    expect(normalizeDailyStudyHours(input)).toBe(expected);
  });

  test("normalizes non-finite values to the minimum at the pure policy boundary", () => {
    expect(normalizeDailyStudyHours(Number.NaN)).toBe(0);
    expect(normalizeDailyStudyHours(Number.POSITIVE_INFINITY)).toBe(0);
  });

  test("marks only allowed values above twelve hours as high", () => {
    expect(isHighDailyStudyHours(12)).toBe(false);
    expect(isHighDailyStudyHours(12.5)).toBe(true);
    expect(isHighDailyStudyHours(16)).toBe(true);
    expect(isHighDailyStudyHours(Number.NaN)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the policy test and confirm the module is missing**

```bash
npx vitest run src/lib/study-hours.test.ts
```

Expected: FAIL because `./study-hours` does not exist.

- [ ] **Step 3: Implement the focused policy module**

Create `src/lib/study-hours.ts`:

```ts
export const MIN_DAILY_STUDY_HOURS = 0;
export const MAX_DAILY_STUDY_HOURS = 16;
export const DAILY_STUDY_HOURS_STEP = 0.5;
export const HIGH_DAILY_STUDY_HOURS_THRESHOLD = 12;

export function normalizeDailyStudyHours(value: number): number {
  if (!Number.isFinite(value)) return MIN_DAILY_STUDY_HOURS;
  const clamped = Math.min(
    MAX_DAILY_STUDY_HOURS,
    Math.max(MIN_DAILY_STUDY_HOURS, value),
  );
  const rounded = Math.round(clamped / DAILY_STUDY_HOURS_STEP) * DAILY_STUDY_HOURS_STEP;
  return Number(rounded.toFixed(1));
}

export function isHighDailyStudyHours(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value > HIGH_DAILY_STUDY_HOURS_THRESHOLD &&
    value <= MAX_DAILY_STUDY_HOURS
  );
}
```

- [ ] **Step 4: Run the policy tests**

```bash
npx vitest run src/lib/study-hours.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the canonical policy**

```bash
git add src/lib/study-hours.ts src/lib/study-hours.test.ts
git commit -m "feat: define daily study hour policy"
```

---

### Task 3: Route progress migration and mutations through pure hour helpers

**Files:**
- Modify: `src/lib/progress-store.ts`
- Modify: `src/lib/progress-store.test.ts`

**Interfaces:**
- Consumes: `normalizeDailyStudyHours` and the canonical range constants from Task 2.
- Produces:
  - `setTodayHoursState(state: ProgressState, hours: number, dateISO?: string): ProgressState`
  - `setDayHoursState(state: ProgressState, dateISO: string, hours: number | null): ProgressState`
  - `setDefaultDailyHoursState(state: ProgressState, hours: number): ProgressState`
- The React hook wrappers persist these pure candidates through the existing verified `commit` transaction.

- [ ] **Step 1: Extend progress-store tests with 16-hour migration and mutation cases**

Add these imports from `./progress-store`:

```ts
setDayHoursState,
setDefaultDailyHoursState,
setTodayHoursState,
```

Add tests inside `describe("progress migration", ...)`:

```ts
test("preserves and reloads valid study capacities through sixteen hours", () => {
  const result = migrateProgressState(
    JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      plannerSettings: {
        todayHours: 16,
        defaultDailyHours: 15.5,
        dailyHours: {
          "2026-08-05": 12.5,
          "2026-08-06": 16,
          "2026-08-07": 16.5,
        },
      },
    }),
  );

  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.state.plannerSettings.todayHours).toBe(16);
  expect(result.state.plannerSettings.defaultDailyHours).toBe(15.5);
  expect(result.state.plannerSettings.dailyHours).toEqual({
    "2026-08-05": 12.5,
    "2026-08-06": 16,
    "2026-08-07": 16,
  });
});

test("uses the relevant default when stored hour values are non-finite", () => {
  const result = migrateProgressState(
    JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      plannerSettings: {
        todayHours: null,
        defaultDailyHours: null,
        dailyHours: { "2026-08-05": null },
      },
    }),
  );

  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.state.plannerSettings.todayHours).toBe(
    result.state.plannerSettings.defaultDailyHours,
  );
  expect(result.state.plannerSettings.dailyHours).toEqual({});
});

test("applies the canonical range in pure progress mutations", () => {
  const base = createInitialProgressState(false);
  const today = "2026-08-05";

  const withToday = setTodayHoursState(base, 16.5, today);
  expect(withToday.plannerSettings.todayHours).toBe(16);
  expect(withToday.plannerSettings.dailyHours[today]).toBe(16);

  const withDay = setDayHoursState(withToday, "2026-08-06", 15.5);
  expect(withDay.plannerSettings.dailyHours["2026-08-06"]).toBe(15.5);

  const withDefault = setDefaultDailyHoursState(withDay, 16.5);
  expect(withDefault.plannerSettings.defaultDailyHours).toBe(16);

  const clearedToday = setDayHoursState(withDefault, today, null);
  expect(clearedToday.plannerSettings.dailyHours[today]).toBeUndefined();
  expect(clearedToday.plannerSettings.todayHours).toBe(16);
});
```

- [ ] **Step 2: Run the focused tests and confirm the old 12-hour behavior fails**

```bash
npx vitest run src/lib/progress-store.test.ts
```

Expected: FAIL because migration clamps at 12 and the pure state helpers do not exist.

- [ ] **Step 3: Import the canonical policy into `progress-store.ts`**

Add:

```ts
import {
  MAX_DAILY_STUDY_HOURS,
  MIN_DAILY_STUDY_HOURS,
  normalizeDailyStudyHours,
} from "./study-hours";
```

Keep the general-purpose local `clamp` function for unrelated values such as `reviewShareMax`.

- [ ] **Step 4: Replace migration and daily-hour sanitization**

Use this storage helper near `sanitizeDailyHours`:

```ts
function normalizeStoredDailyHours(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return normalizeDailyStudyHours(fallback);
  }
  return normalizeDailyStudyHours(value);
}

function sanitizeDailyHours(raw: Record<string, unknown>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [dateISO, value] of Object.entries(raw)) {
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    out[dateISO] = normalizeDailyStudyHours(value);
  }
  return out;
}
```

Construct `plannerSettings` in this order so the default is available to Today fallback:

```ts
const storedDefaultDailyHours = normalizeStoredDailyHours(
  psIn.defaultDailyHours,
  DEFAULT_PLANNER_SETTINGS.defaultDailyHours,
);

const plannerSettings: PlannerSettings = {
  todayHours: normalizeStoredDailyHours(psIn.todayHours, storedDefaultDailyHours),
  dailyHours:
    psIn.dailyHours && typeof psIn.dailyHours === "object"
      ? sanitizeDailyHours(psIn.dailyHours)
      : {},
  defaultDailyHours: storedDefaultDailyHours,
  reviewShareMax:
    typeof psIn.reviewShareMax === "number"
      ? clamp(psIn.reviewShareMax, 0, 1)
      : DEFAULT_PLANNER_SETTINGS.reviewShareMax,
  reviewCapMinutes:
    typeof psIn.reviewCapMinutes === "number"
      ? Math.max(0, psIn.reviewCapMinutes)
      : DEFAULT_PLANNER_SETTINGS.reviewCapMinutes,
  subjectRotation: DEFAULT_PLANNER_SETTINGS.subjectRotation,
};
```

Remove all daily-hour-specific `clamp(..., 0, 12)` calls. Do not bump `SCHEMA_VERSION`; extending a numeric range does not change the persisted shape.

- [ ] **Step 5: Add pure progress-state mutation helpers**

Add before `useProgress()`:

```ts
export function setTodayHoursState(
  state: ProgressState,
  hours: number,
  dateISO = todayISO(),
): ProgressState {
  const normalized = normalizeDailyStudyHours(hours);
  return {
    ...state,
    plannerSettings: {
      ...state.plannerSettings,
      todayHours: normalized,
      dailyHours: { ...state.plannerSettings.dailyHours, [dateISO]: normalized },
    },
  };
}

export function setDayHoursState(
  state: ProgressState,
  dateISO: string,
  hours: number | null,
): ProgressState {
  const currentToday = todayISO();
  const dailyHours = { ...state.plannerSettings.dailyHours };
  if (hours == null) delete dailyHours[dateISO];
  else dailyHours[dateISO] = normalizeDailyStudyHours(hours);

  return {
    ...state,
    plannerSettings: {
      ...state.plannerSettings,
      todayHours:
        dateISO === currentToday
          ? hours == null
            ? state.plannerSettings.defaultDailyHours
            : normalizeDailyStudyHours(hours)
          : state.plannerSettings.todayHours,
      dailyHours,
    },
  };
}

export function setDefaultDailyHoursState(
  state: ProgressState,
  hours: number,
): ProgressState {
  return {
    ...state,
    plannerSettings: {
      ...state.plannerSettings,
      defaultDailyHours: normalizeDailyStudyHours(hours),
    },
  };
}
```

The test uses a fixed date for `setTodayHoursState`. For `setDayHoursState`, add an optional `todayDateISO = todayISO()` fourth parameter if deterministic testing shows the runtime date prevents the Today-reset assertion. Keep the hook call site using the default.

- [ ] **Step 6: Replace hook-local mutation bodies with the pure helpers**

Use:

```ts
const setTodayHours = useCallback(
  (hours: number) => commit((state) => setTodayHoursState(state, hours)),
  [commit],
);

const setDayHours = useCallback(
  (dateISO: string, hours: number | null) =>
    commit((state) => setDayHoursState(state, dateISO, hours)),
  [commit],
);

const setDefaultDailyHours = useCallback(
  (hours: number) => commit((state) => setDefaultDailyHoursState(state, hours)),
  [commit],
);
```

Remove unused imports of `MAX_DAILY_STUDY_HOURS` and `MIN_DAILY_STUDY_HOURS` if only `normalizeDailyStudyHours` is required after implementation.

- [ ] **Step 7: Run progress and storage regressions**

```bash
npx vitest run \
  src/lib/study-hours.test.ts \
  src/lib/progress-store.test.ts \
  src/lib/app-storage.test.ts \
  src/lib/app-backup.test.ts
```

Expected: all tests PASS.

- [ ] **Step 8: Commit progress integration**

```bash
git add src/lib/progress-store.ts src/lib/progress-store.test.ts
git commit -m "feat: persist study capacity through sixteen hours"
```

---

### Task 4: Apply the canonical policy to planner capacity and all three UI surfaces

**Files:**
- Create: `src/components/HighStudyHoursNote.tsx`
- Create: `src/lib/study-hours-ui-regression.test.ts`
- Modify: `src/lib/planner.test.ts`
- Modify: `src/components/TodayPanel.tsx`
- Modify: `src/components/FlexiblePlanner.tsx`
- Modify: `src/components/ForecastCard.tsx`

**Interfaces:**
- Consumes: `MAX_DAILY_STUDY_HOURS`, `MIN_DAILY_STUDY_HOURS`, `DAILY_STUDY_HOURS_STEP`, `normalizeDailyStudyHours`, and `isHighDailyStudyHours`.
- Produces: consistent Today, per-day plan, and Forecast controls; shared status copy for values from 12.5 to 16 hours.

- [ ] **Step 1: Add the failing 960-minute planner test**

Add to `describe("flexible planning capacity", ...)` in `src/lib/planner.test.ts`:

```ts
test("creates exactly 960 minutes of capacity for sixteen hours", () => {
  const queue = pickDayQueue({
    subjects,
    completed: {},
    meta: DEFAULT_STUDY_META,
    settings: DEFAULT_PLANNER_SETTINGS,
    dateISO: "2026-07-25",
    hoursOverride: 16,
  });

  expect(queue.quotaMinutes).toBe(960);
  expect(queue.newMinutes).toBeLessThanOrEqual(960);
});
```

- [ ] **Step 2: Add the failing UI policy regression test**

Create `src/lib/study-hours-ui-regression.test.ts`:

```ts
import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

const capacitySurfaces = [
  "TodayPanel.tsx",
  "FlexiblePlanner.tsx",
  "ForecastCard.tsx",
] as const;

describe("study-hour UI policy", () => {
  test("uses the canonical range on every capacity surface", async () => {
    for (const fileName of capacitySurfaces) {
      const source = await readFile(
        new URL(`../components/${fileName}`, import.meta.url),
        "utf8",
      );
      expect(source).toContain("MAX_DAILY_STUDY_HOURS");
      expect(source).toContain("DAILY_STUDY_HOURS_STEP");
      expect(source).toContain("normalizeDailyStudyHours");
      expect(source).not.toContain("max={12}");
      expect(source).not.toContain("Math.min(12");
    }
  });

  test("shares one non-blocking high-capacity note", async () => {
    const noteSource = await readFile(
      new URL("../components/HighStudyHoursNote.tsx", import.meta.url),
      "utf8",
    );
    expect(noteSource).toContain("isHighDailyStudyHours");
    expect(noteSource).toContain('role="status"');
    expect(noteSource).toContain(
      "Quỹ thời gian rất cao. Hãy tính cả thời gian ăn, nghỉ và phục hồi.",
    );

    for (const fileName of capacitySurfaces) {
      const source = await readFile(
        new URL(`../components/${fileName}`, import.meta.url),
        "utf8",
      );
      expect(source).toContain("HighStudyHoursNote");
    }
  });
});
```

- [ ] **Step 3: Run both tests and confirm the UI still contains 12-hour literals**

```bash
npx vitest run src/lib/planner.test.ts src/lib/study-hours-ui-regression.test.ts
```

Expected: planner quota test PASS with current arithmetic; UI regression FAIL because the canonical imports and shared note do not exist.

- [ ] **Step 4: Create the shared non-blocking note**

Create `src/components/HighStudyHoursNote.tsx`:

```tsx
import { isHighDailyStudyHours } from "@/lib/study-hours";
import { cn } from "@/lib/utils";

export function HighStudyHoursNote({
  hours,
  className,
}: {
  hours: number;
  className?: string;
}) {
  if (!isHighDailyStudyHours(hours)) return null;

  return (
    <p
      role="status"
      className={cn(
        "text-[11px] leading-relaxed text-amber-700",
        className,
      )}
    >
      Quỹ thời gian rất cao. Hãy tính cả thời gian ăn, nghỉ và phục hồi.
    </p>
  );
}
```

Do not use `role="alert"`, destructive colors, or automatic value reduction.

- [ ] **Step 5: Update Today capacity controls**

In `src/components/TodayPanel.tsx`, import:

```ts
import { HighStudyHoursNote } from "@/components/HighStudyHoursNote";
import {
  DAILY_STUDY_HOURS_STEP,
  MAX_DAILY_STUDY_HOURS,
  MIN_DAILY_STUDY_HOURS,
  normalizeDailyStudyHours,
} from "@/lib/study-hours";
```

Set both Slider and Input to:

```tsx
min={MIN_DAILY_STUDY_HOURS}
max={MAX_DAILY_STUDY_HOURS}
step={DAILY_STUDY_HOURS_STEP}
```

Normalize numeric input values before passing them to `onSetTodayHours`:

```ts
const value = Number(event.target.value);
if (Number.isFinite(value)) {
  onSetTodayHours(normalizeDailyStudyHours(value));
}
```

Render below the Today control:

```tsx
<HighStudyHoursNote
  hours={state.plannerSettings.todayHours}
  className="sm:col-start-2 sm:col-span-2"
/>
```

Keep the current visual hierarchy and queue behavior unchanged.

- [ ] **Step 6: Update Flexible Schedule per-day controls**

Import the same policy values and `HighStudyHoursNote` in `src/components/FlexiblePlanner.tsx`.

Replace each per-day Input range with the canonical constants and normalize before `onSetDayHours`:

```ts
const value = Number(event.target.value);
if (Number.isFinite(value)) {
  onSetDayHours(day.dateISO, normalizeDailyStudyHours(value));
}
```

Render directly below the day capacity row:

```tsx
<HighStudyHoursNote hours={day.hours} />
```

Do not change drag/drop, subject tabs, fixed overflow, undo history, or week collapsing in this task.

- [ ] **Step 7: Update Forecast default-hours controls**

Import the same policy values and `HighStudyHoursNote` in `src/components/ForecastCard.tsx`.

Use canonical Slider/Input props and normalize in `handleHoursChange`:

```ts
const handleHoursChange = (hours: number) => {
  onSetDefaultDailyHours?.(normalizeDailyStudyHours(hours));
};
```

Render near the default-hours control:

```tsx
<HighStudyHoursNote
  hours={hours}
  className="sm:text-right"
/>
```

Do not change forecast formulae, six-days-per-week behavior, or confidence calculation.

- [ ] **Step 8: Run UI, planner, and accepted schedule regressions**

```bash
npx vitest run \
  src/lib/study-hours.test.ts \
  src/lib/study-hours-ui-regression.test.ts \
  src/lib/planner.test.ts \
  src/lib/planning-date-regression.test.ts \
  src/lib/schedule-mode-regression.test.ts \
  src/lib/flexible-planner-ux-regression.test.ts
```

Expected: all tests PASS.

- [ ] **Step 9: Run TypeScript and lint checks**

```bash
npm run typecheck
npm run lint
```

Expected: both commands exit `0` without modifying tracked files.

- [ ] **Step 10: Commit UI and planner integration**

```bash
git add \
  src/components/HighStudyHoursNote.tsx \
  src/components/TodayPanel.tsx \
  src/components/FlexiblePlanner.tsx \
  src/components/ForecastCard.tsx \
  src/lib/planner.test.ts \
  src/lib/study-hours-ui-regression.test.ts
git commit -m "feat: allow sixteen hour study capacity"
```

---

### Task 5: Enforce build purity in GitHub Actions

**Files:**
- Modify: `.github/workflows/build.yml`

**Interfaces:**
- Consumes: the read-only npm commands from Task 1.
- Produces: independent CI evidence for typecheck, lint, tests, production build, and a clean tracked tree.

- [ ] **Step 1: Replace the single build step with explicit quality gates**

Use this workflow body:

```yaml
name: Build diagnostics

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: false
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - name: Verify commands did not modify tracked source
        run: git diff --exit-code
```

Keep `npm install` because the repository currently does not commit an npm lockfile. Do not introduce `npm ci` in this package.

- [ ] **Step 2: Run the exact CI command sequence locally**

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
git diff --exit-code
```

Expected: every command exits `0`; the final command reports no tracked modifications.

- [ ] **Step 3: Commit CI enforcement**

```bash
git add .github/workflows/build.yml
git commit -m "ci: enforce read only verification commands"
```

---

### Task 6: Document, verify, and deploy P0A

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: all Task 1–5 deliverables.
- Produces: user-facing documentation, complete local verification evidence, GitHub Actions evidence, and a Vercel deployment for the exact accepted commit.

- [ ] **Step 1: Document the supported capacity and build guarantee**

Add this section after `## Kiểm tra chất lượng` in `README.md`:

```md
## Quỹ giờ học

Quỹ giờ trong Hôm nay, Lịch linh hoạt và Dự báo dùng chung một chính sách: từ **0 đến 16 giờ/ngày**, tăng giảm theo bước **0,5 giờ**. Mức trên 12 giờ vẫn được phép nhưng ứng dụng hiển thị nhắc nhở nhẹ để người dùng tính cả thời gian ăn, nghỉ và phục hồi.

Các lệnh `typecheck`, `lint`, `test` và `build` chỉ kiểm tra mã nguồn đã commit; chúng không tự sửa file ứng dụng.
```

- [ ] **Step 2: Search for stale daily-hour maximums and obsolete patch references**

Run:

```bash
grep -R "max={12}\|Math.min(12\|clamp(.*0, 12" src --include='*.ts' --include='*.tsx' || true
grep -R "fix-planning-dates\|prepare-app-build\|add-schedule-modes\|add-schedule-mode-bulk\|improve-lesson-order-drag\|improve-flexible-schedule-ux\|add-flexible-planner-undo" package.json .github src || true
```

Expected: the first command returns no daily-hour maximum implementation. A test may mention legacy `12` only when explicitly asserting backwards compatibility. The second command returns only `src/lib/build-purity-regression.test.ts`, where obsolete references are intentionally prohibited.

- [ ] **Step 3: Run complete verification from a clean tracked tree**

```bash
npm run verify
git diff --exit-code
```

Expected:

- TypeScript exits `0`.
- ESLint exits `0`.
- Vitest reports zero failed tests.
- Vite production build exits `0`.
- `git diff --exit-code` exits `0`.

Do not claim P0A acceptance from a partial command or from Vercel alone.

- [ ] **Step 4: Commit documentation**

```bash
git add README.md
git commit -m "docs: document study capacity policy"
```

- [ ] **Step 5: Push and verify the exact commit in GitHub Actions**

```bash
git push origin HEAD
```

Record the exact pushed SHA:

```bash
git rev-parse HEAD
```

GitHub Actions acceptance requires all workflow steps for that SHA to succeed. Inspect failed job logs rather than retrying blindly.

- [ ] **Step 6: Verify Vercel for the same exact commit**

Confirm the Vercel status attached to the exact SHA from Step 5 is `success`. Open the production deployment and manually verify:

1. Today accepts `16` and retains it after refresh.
2. Today shows the high-capacity note at `12.5` and hides it at `12`.
3. Flexible Schedule accepts `15.5` for one day and retains it after refresh.
4. A 16-hour day displays a capacity of `960p`.
5. Forecast accepts `16`, updates immediately, and retains the same value after refresh.
6. Existing fixed overflow remains visible.
7. Existing flexible lesson drag and Undo still work.

A successful deployment without these checks is deployment evidence, not functional acceptance.

---

## Plan Self-Review Result

- **Spec coverage:** P0.1 canonical hours and P0.2 build purity are fully mapped to Tasks 1–6. P0.3 shared schedule transactions and P0.4 broader scheduler invariants remain intentionally outside this P0A plan and require the next plan.
- **Placeholder scan:** no unresolved placeholders, deferred implementation markers, or unspecified test steps remain.
- **Type consistency:** all later tasks consume the exact constants and function signatures defined in Tasks 2 and 3.
- **Scope check:** this plan delivers one independently deployable package. It does not begin P1 or redesign unrelated components.
