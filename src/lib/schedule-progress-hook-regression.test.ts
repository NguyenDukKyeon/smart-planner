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

    const applyBlock = source.slice(
      source.indexOf("const applyPersistedPlannerSettings = useCallback("),
      source.indexOf("const toggleLesson = useCallback("),
    );
    expect(applyBlock).not.toContain("saveProgressStorage(");
    expect(applyBlock).toContain("setState(next)");
  });

  test("allows exactly one rollback write after a failed persist-only write", () => {
    expect(source).toContain("const plannerSettingsRollbackPendingRef = useRef(false)");
    const persistBlock = source.slice(
      source.indexOf("const persistPlannerSettings = useCallback("),
      source.indexOf("const applyPersistedPlannerSettings = useCallback("),
    );

    expect(persistBlock).toContain(
      "const isRollbackAttempt = plannerSettingsRollbackPendingRef.current",
    );
    expect(persistBlock).toContain("!persistenceEnabled.current && !isRollbackAttempt");
    expect(persistBlock).toContain(
      "plannerSettingsRollbackPendingRef.current = !isRollbackAttempt",
    );
    expect(persistBlock).toContain("persistenceEnabled.current = false");
    expect(persistBlock).toContain("plannerSettingsRollbackPendingRef.current = false");
    expect(persistBlock).toContain("persistenceEnabled.current = true");
    expect(persistBlock).toContain(
      'setStorageStatus({ status: "unavailable", error: saved.error })',
    );
    expect(persistBlock).toContain('setStorageStatus({ status: "ok", value: stateRef.current })');
    expect(persistBlock).toContain("setStorageError(null)");
    expect(persistBlock).not.toContain("setState(");
  });
});
