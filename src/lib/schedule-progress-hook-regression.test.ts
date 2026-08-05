import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const source = readFileSync(new URL("./progress-store.ts", import.meta.url), "utf8");

describe("useProgress schedule persistence boundary", () => {
  test("exposes a persist-only planner-settings callback", () => {
    expect(source).toContain("const persistPlannerSettings = useCallback(");
    expect(source).toContain("savePlannerSettingsStorage(stateRef.current, plannerSettings)");
    expect(source).toContain("persistPlannerSettings,");
  });

  test("publishes planner settings that were already persisted without writing again", () => {
    expect(source).toContain("const applyPersistedPlannerSettings = useCallback(");
    expect(source).toContain(
      "applyPlannerSettingsToProgressState(stateRef.current, plannerSettings)",
    );
    expect(source).toContain("applyPersistedPlannerSettings,");
  });

  test("keeps persistence disabled and reports the error after a failed persist-only write", () => {
    const persistBlock = source.slice(
      source.indexOf("const persistPlannerSettings = useCallback("),
      source.indexOf("const applyPersistedPlannerSettings = useCallback("),
    );
    expect(persistBlock).toContain("persistenceEnabled.current = false");
    expect(persistBlock).toContain('setStorageStatus({ status: "unavailable", error: saved.error })');
    expect(persistBlock).toContain("return saved");
  });
});
