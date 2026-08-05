import { describe, expect, test } from "vitest";
import {
  SCHEMA_VERSION,
  createInitialProgressState,
  migrateProgressState,
  setDayHoursState,
  setDefaultDailyHoursState,
  setTodayHoursState,
} from "./progress-store";

describe("study capacity persistence", () => {
  test("preserves and reloads valid capacities through sixteen hours", () => {
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

  test("uses defaults for invalid stored capacity values", () => {
    const result = migrateProgressState(
      JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        plannerSettings: {
          todayHours: null,
          defaultDailyHours: null,
          dailyHours: {
            "2026-08-05": null,
            "2026-08-06": "16",
          },
        },
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.plannerSettings.todayHours).toBe(2);
    expect(result.state.plannerSettings.defaultDailyHours).toBe(2);
    expect(result.state.plannerSettings.dailyHours).toEqual({});
  });

  test("applies the canonical range in pure state mutations", () => {
    const base = createInitialProgressState(false);
    const today = "2026-08-05";

    const withToday = setTodayHoursState(base, 16.5, today);
    expect(withToday.plannerSettings.todayHours).toBe(16);
    expect(withToday.plannerSettings.dailyHours[today]).toBe(16);

    const withDay = setDayHoursState(withToday, "2026-08-06", 15.5, today);
    expect(withDay.plannerSettings.dailyHours["2026-08-06"]).toBe(15.5);
    expect(withDay.plannerSettings.todayHours).toBe(16);

    const withDefault = setDefaultDailyHoursState(withDay, 16.5);
    expect(withDefault.plannerSettings.defaultDailyHours).toBe(16);

    const clearedToday = setDayHoursState(withDefault, today, null, today);
    expect(clearedToday.plannerSettings.dailyHours[today]).toBeUndefined();
    expect(clearedToday.plannerSettings.todayHours).toBe(16);
  });

  test("rounds stored and mutated values to half-hour increments", () => {
    const base = createInitialProgressState(false);
    const result = setDefaultDailyHoursState(base, 12.26);
    expect(result.plannerSettings.defaultDailyHours).toBe(12.5);
  });
});
