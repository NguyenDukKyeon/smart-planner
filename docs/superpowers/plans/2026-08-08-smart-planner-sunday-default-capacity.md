# Sunday Default-Capacity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Sunday consume the normal default daily study capacity unless today-hours or an exact-date override takes precedence, and make Forecast copy state that policy truthfully.

**Architecture:** Keep `resolveDailyCapacityHours()` as the single capacity authority shared by Forecast, Roadmap, and Flexible Schedule. Remove only the implicit Sunday-zero branch; do not add settings or persistence. Update the Forecast runtime copy to describe seven-day default capacity and exact-date overrides.

**Tech Stack:** TypeScript, React, Vitest, ReactDOM server rendering, GitHub Actions.

## Global Constraints

- Exact predecessor: `main@c7d82ec6a07a7fab2b6465456d53a0e1b9919498`.
- Capacity precedence is exactly: current date `todayHours` → exact-date `dailyHours[dateISO]` including `0` → `defaultDailyHours` for every weekday including Sunday.
- No implicit Sunday-rest rule remains.
- No new setting, persistence/schema change, dependency, workflow, deployment, Weekly Summary, or P2 change.
- Use natural GitHub Actions as RED/GREEN evidence; do not treat formatting-only failures as behavioral RED/GREEN.
- Do not amend, rebase, squash, force-push, or rewrite history.

---

### Task 1: Make Sunday use canonical default capacity

**Files:**
- Modify: `src/lib/daily-capacity.test.ts`
- Modify: `src/lib/daily-capacity.ts`

**Interfaces:**
- Consumes: `PlannerSettings`, `DEFAULT_PLANNER_SETTINGS`.
- Produces: existing `resolveDailyCapacityHours(params): number` with unchanged signature and new seven-day default behavior.

- [ ] **Step 1: Write the failing Sunday-default tests**

Change the old Sunday-rest test to require the default capacity and add explicit Sunday-zero/current-Sunday precedence coverage:

```ts
it("uses default hours on Sunday when there is no explicit override", async () => {
  const resolveDailyCapacityHours = await loadResolver();
  expect(resolveDailyCapacityHours).toBeTypeOf("function");
  if (!resolveDailyCapacityHours) return;

  expect(
    resolveDailyCapacityHours({
      dateISO: "2026-08-09",
      currentDateISO: "2026-08-08",
      settings: { ...DEFAULT_PLANNER_SETTINGS, defaultDailyHours: 6, dailyHours: {} },
    }),
  ).toBe(6);
});

it("preserves an explicit zero-hour Sunday override", async () => {
  const resolveDailyCapacityHours = await loadResolver();
  expect(resolveDailyCapacityHours).toBeTypeOf("function");
  if (!resolveDailyCapacityHours) return;

  expect(
    resolveDailyCapacityHours({
      dateISO: "2026-08-09",
      currentDateISO: "2026-08-08",
      settings: {
        ...DEFAULT_PLANNER_SETTINGS,
        defaultDailyHours: 6,
        dailyHours: { "2026-08-09": 0 },
      },
    }),
  ).toBe(0);
});

it("uses todayHours when the current day is Sunday", async () => {
  const resolveDailyCapacityHours = await loadResolver();
  expect(resolveDailyCapacityHours).toBeTypeOf("function");
  if (!resolveDailyCapacityHours) return;

  expect(
    resolveDailyCapacityHours({
      dateISO: "2026-08-09",
      currentDateISO: "2026-08-09",
      settings: {
        ...DEFAULT_PLANNER_SETTINGS,
        todayHours: 3,
        defaultDailyHours: 6,
        dailyHours: { "2026-08-09": 9 },
      },
    }),
  ).toBe(3);
});
```

- [ ] **Step 2: Run exact-head CI and verify behavioral RED**

Natural PR CI must pass typecheck/lint and fail the Sunday-without-override assertion because the current resolver returns `0` instead of `6`. Existing explicit positive override, zero override, current-day, and weekday-default assertions must remain meaningful.

- [ ] **Step 3: Implement the minimal resolver change**

Replace `src/lib/daily-capacity.ts` with the same precedence minus the Sunday branch:

```ts
import type { PlannerSettings } from "./planner";

export function resolveDailyCapacityHours(params: {
  dateISO: string;
  currentDateISO: string;
  settings: PlannerSettings;
}): number {
  if (params.dateISO === params.currentDateISO) return params.settings.todayHours;
  if (Object.prototype.hasOwnProperty.call(params.settings.dailyHours, params.dateISO)) {
    return params.settings.dailyHours[params.dateISO];
  }
  return params.settings.defaultDailyHours;
}
```

- [ ] **Step 4: Run natural exact-head CI and verify GREEN**

Expected: the full repository gate passes, including scheduler/Forecast regression suites. If an old fixture fails only because it implicitly relied on Sunday=0, adjust only that fixture to state its intended capacity explicitly; do not reintroduce a Sunday special case.

- [ ] **Step 5: Commit source/test GREEN**

Use a forward commit such as `fix: use default study capacity on Sunday`.

---

### Task 2: Make Forecast capacity copy match the seven-day policy

**Files:**
- Modify: `src/lib/forecast-card-runtime.test.ts`
- Modify: `src/components/ForecastCard.tsx`

**Interfaces:**
- Consumes: existing `ForecastViewModel.defaultDailyHours` and `explicitCapacityOverrideCount`.
- Produces: user-visible capacity copy that does not claim Sunday rests by default.

- [ ] **Step 1: Write the failing runtime-copy assertion**

Change the canonical runtime test to require truthful seven-day wording and reject the old statement:

```ts
expect(html).toContain("mặc định 1 giờ/ngày cho cả 7 ngày");
expect(html).not.toContain("Chủ nhật nghỉ nếu không đặt riêng");
```

Keep the date-specific override test and its assertion that exact-date overrides are reported.

- [ ] **Step 2: Run natural exact-head CI and verify behavioral RED**

Expected: typecheck/lint pass; runtime test fails because `ForecastCard` still renders `Chủ nhật nghỉ nếu không đặt riêng`.

- [ ] **Step 3: Implement the minimal copy change**

Change the capacity summary in `ForecastCard.tsx` to:

```ts
const capacityText = `Theo lịch công suất hiện tại · mặc định ${formatHours(vm.defaultDailyHours)} giờ/ngày cho cả 7 ngày.`;
```

Leave exact-date override copy unchanged.

- [ ] **Step 4: Run natural exact-head CI and verify GREEN**

Expected: typecheck, lint, all tests, build, and clean-tree verification PASS. Runtime HTML must contain the seven-day wording and contain no Sunday-rest claim.

- [ ] **Step 5: Freeze source/test head and prepare evidence**

Record Task 1 RED/GREEN and Task 2 RED/GREEN run IDs/job IDs/exact heads. Add only docs evidence after the final source/test head, run natural exact-head CI on the evidence head, then perform a fresh independent review before merge authorization.
