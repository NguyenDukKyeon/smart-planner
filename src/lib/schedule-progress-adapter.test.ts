import { describe, expect, test } from "vitest";
import type { StorageAdapter } from "./app-storage";
import { DEFAULT_PLANNER_SETTINGS } from "./planner";
import {
  applyPlannerSettingsToProgressState,
  createInitialProgressState,
  loadProgressStorage,
  savePlannerSettingsStorage,
} from "./progress-store";

class MemoryStorage implements StorageAdapter {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe("schedule progress adapter", () => {
  test("creates a detached progress state with replacement planner settings", () => {
    const state = createInitialProgressState(false);
    const plannerSettings = {
      ...DEFAULT_PLANNER_SETTINGS,
      todayHours: 4,
      defaultDailyHours: 3,
      dailyHours: { "2030-01-02": 5 },
    };

    const next = applyPlannerSettingsToProgressState(state, plannerSettings);

    expect(next).not.toBe(state);
    expect(next.plannerSettings).toEqual(plannerSettings);
    expect(next.plannerSettings).not.toBe(plannerSettings);
    expect(next.plannerSettings.dailyHours).not.toBe(plannerSettings.dailyHours);
    expect(state.plannerSettings).not.toEqual(plannerSettings);
    expect(next.completedLessons).toBe(state.completedLessons);
  });

  test("persists replacement planner settings without mutating the current state", () => {
    const storage = new MemoryStorage();
    const state = createInitialProgressState(false);
    const plannerSettings = {
      ...state.plannerSettings,
      todayHours: 6,
      defaultDailyHours: 4,
      dailyHours: { "2030-01-03": 8 },
    };

    expect(savePlannerSettingsStorage(state, plannerSettings, storage)).toEqual({ ok: true });
    expect(state.plannerSettings.todayHours).not.toBe(6);

    const loaded = loadProgressStorage(storage);
    expect(loaded.status).toBe("ok");
    if (loaded.status !== "ok") throw new Error("Expected persisted progress");
    expect(loaded.value.plannerSettings).toEqual(plannerSettings);
  });

  test("refuses to overwrite invalid existing progress bytes", () => {
    const storage = new MemoryStorage();
    storage.setItem("hocvien-progress-v2", "not-json");
    const state = createInitialProgressState(false);

    const result = savePlannerSettingsStorage(
      state,
      { ...state.plannerSettings, todayHours: 7 },
      storage,
    );

    expect(result.ok).toBe(false);
    expect(storage.getItem("hocvien-progress-v2")).toBe("not-json");
  });
});
