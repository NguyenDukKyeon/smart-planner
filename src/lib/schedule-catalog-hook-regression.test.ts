import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const source = readFileSync(new URL("../routes/index.tsx", import.meta.url), "utf8");

describe("Dashboard schedule catalog persistence boundary", () => {
  test("fails closed on a catalog write error and reopens after a verified rollback", () => {
    const persistBlock = source.slice(
      source.indexOf("const persistScheduleSubjects = useCallback("),
      source.indexOf("const backupScheduleSubjects = useCallback("),
    );

    expect(persistBlock).toContain("const saved = saveStoredCustomSubjects(nextSubjects)");
    expect(persistBlock).toContain("if (!saved.ok)");
    expect(persistBlock).toContain(
      'setSubjectStorageStatus({ status: "unavailable", error: saved.error })',
    );
    expect(persistBlock).toContain('setSubjectStorageStatus({ status: "ok", value: nextSubjects })');
    expect(persistBlock).toContain("return saved");
    expect(persistBlock).not.toContain("setSubjects(");
  });

  test("keeps publishing separate from persistence", () => {
    const applyBlock = source.slice(
      source.indexOf("const applyPersistedScheduleSubjects = useCallback("),
      source.indexOf("const updateSubjectsSafely = useCallback("),
    );

    expect(applyBlock).toContain("setSubjects(nextSubjects)");
    expect(applyBlock).toContain('setSubjectStorageStatus({ status: "ok", value: nextSubjects })');
    expect(applyBlock).not.toContain("saveStoredCustomSubjects(");
  });
});
