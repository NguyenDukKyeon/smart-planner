import { describe, expect, it } from "vitest";
import { DEFAULT_PLANNER_SETTINGS, type PlannerSettings } from "./planner";

type Resolver = (params: {
  dateISO: string;
  currentDateISO: string;
  settings: PlannerSettings;
}) => number;

async function loadResolver(): Promise<Resolver | undefined> {
  const modulePath = "./daily-capacity";
  try {
    const loaded = (await import(modulePath)) as { resolveDailyCapacityHours?: Resolver };
    return loaded.resolveDailyCapacityHours;
  } catch {
    return undefined;
  }
}

describe("canonical daily capacity", () => {
  it("uses current-day hours before a same-date override", async () => {
    const resolveDailyCapacityHours = await loadResolver();
    expect(resolveDailyCapacityHours).toBeTypeOf("function");
    if (!resolveDailyCapacityHours) return;

    expect(
      resolveDailyCapacityHours({
        dateISO: "2026-08-08",
        currentDateISO: "2026-08-08",
        settings: {
          ...DEFAULT_PLANNER_SETTINGS,
          todayHours: 3,
          dailyHours: { "2026-08-08": 9 },
        },
      }),
    ).toBe(3);
  });

  it("honors an explicit Sunday override", async () => {
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
          dailyHours: { "2026-08-09": 4 },
        },
      }),
    ).toBe(4);
  });

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

  it("uses default hours on an ordinary weekday", async () => {
    const resolveDailyCapacityHours = await loadResolver();
    expect(resolveDailyCapacityHours).toBeTypeOf("function");
    if (!resolveDailyCapacityHours) return;

    expect(
      resolveDailyCapacityHours({
        dateISO: "2026-08-10",
        currentDateISO: "2026-08-08",
        settings: { ...DEFAULT_PLANNER_SETTINGS, defaultDailyHours: 6, dailyHours: {} },
      }),
    ).toBe(6);
  });

  it("preserves an explicit zero-hour weekday override", async () => {
    const resolveDailyCapacityHours = await loadResolver();
    expect(resolveDailyCapacityHours).toBeTypeOf("function");
    if (!resolveDailyCapacityHours) return;

    expect(
      resolveDailyCapacityHours({
        dateISO: "2026-08-10",
        currentDateISO: "2026-08-08",
        settings: {
          ...DEFAULT_PLANNER_SETTINGS,
          defaultDailyHours: 6,
          dailyHours: { "2026-08-10": 0 },
        },
      }),
    ).toBe(0);
  });
});
