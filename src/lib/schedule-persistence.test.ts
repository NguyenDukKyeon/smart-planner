import { describe, expect, test, vi } from "vitest";
import { SUBJECTS, type Subject } from "./mock-data";
import { DEFAULT_PLANNER_SETTINGS, type PlannerSettings } from "./planner";
import { persistScheduleCandidate } from "./schedule-persistence";
import type { ScheduleCandidate, ScheduleSnapshot } from "./schedule-transactions";

function createPrevious(): ScheduleSnapshot {
  return {
    subjects: structuredClone(SUBJECTS) as Subject[],
    plannerSettings: structuredClone(DEFAULT_PLANNER_SETTINGS),
  };
}

function cloneCandidate(previous: ScheduleSnapshot): ScheduleCandidate {
  return {
    subjects: structuredClone(previous.subjects),
    plannerSettings: structuredClone(previous.plannerSettings),
  };
}

function changeCatalog(candidate: ScheduleCandidate): void {
  candidate.subjects[0].name = `${candidate.subjects[0].name} nâng cao`;
}

function changeSettings(candidate: ScheduleCandidate): void {
  candidate.plannerSettings.defaultDailyHours += 0.5;
}

function success() {
  return { ok: true } as const;
}

function failure(error: string) {
  return { ok: false, error } as const;
}

describe("persistScheduleCandidate", () => {
  test("does not write either store when the detached candidate is unchanged", () => {
    const previous = createPrevious();
    const candidate = cloneCandidate(previous);
    const saveSubjects = vi.fn(success);
    const savePlannerSettings = vi.fn(success);

    expect(
      persistScheduleCandidate({ previous, candidate, saveSubjects, savePlannerSettings }),
    ).toEqual({ ok: true });
    expect(saveSubjects).not.toHaveBeenCalled();
    expect(savePlannerSettings).not.toHaveBeenCalled();
  });

  test("persists only the catalog when planner settings are unchanged", () => {
    const previous = createPrevious();
    const candidate = cloneCandidate(previous);
    changeCatalog(candidate);
    const saveSubjects = vi.fn(success);
    const savePlannerSettings = vi.fn(success);

    expect(
      persistScheduleCandidate({ previous, candidate, saveSubjects, savePlannerSettings }),
    ).toEqual({ ok: true });
    expect(saveSubjects).toHaveBeenCalledOnce();
    expect(saveSubjects).toHaveBeenCalledWith(candidate.subjects);
    expect(savePlannerSettings).not.toHaveBeenCalled();
  });

  test("persists only planner settings when the catalog is unchanged", () => {
    const previous = createPrevious();
    const candidate = cloneCandidate(previous);
    changeSettings(candidate);
    const saveSubjects = vi.fn(success);
    const savePlannerSettings = vi.fn(success);

    expect(
      persistScheduleCandidate({ previous, candidate, saveSubjects, savePlannerSettings }),
    ).toEqual({ ok: true });
    expect(saveSubjects).not.toHaveBeenCalled();
    expect(savePlannerSettings).toHaveBeenCalledOnce();
    expect(savePlannerSettings).toHaveBeenCalledWith(candidate.plannerSettings);
  });

  test("persists the catalog before planner settings when both stores change", () => {
    const previous = createPrevious();
    const candidate = cloneCandidate(previous);
    changeCatalog(candidate);
    changeSettings(candidate);
    const calls: string[] = [];
    const saveSubjects = vi.fn((_subjects: Subject[]) => {
      calls.push("subjects");
      return success();
    });
    const savePlannerSettings = vi.fn((_settings: PlannerSettings) => {
      calls.push("settings");
      return success();
    });

    expect(
      persistScheduleCandidate({ previous, candidate, saveSubjects, savePlannerSettings }),
    ).toEqual({ ok: true });
    expect(calls).toEqual(["subjects", "settings"]);
  });

  test("rolls back a potentially partial first catalog write and never writes settings", () => {
    const previous = createPrevious();
    const candidate = cloneCandidate(previous);
    changeCatalog(candidate);
    changeSettings(candidate);
    const saveSubjects = vi
      .fn()
      .mockReturnValueOnce(failure("catalog verification failed"))
      .mockReturnValueOnce(success());
    const savePlannerSettings = vi.fn(success);

    expect(
      persistScheduleCandidate({ previous, candidate, saveSubjects, savePlannerSettings }),
    ).toEqual({ ok: false, error: "catalog verification failed" });
    expect(saveSubjects).toHaveBeenNthCalledWith(1, candidate.subjects);
    expect(saveSubjects).toHaveBeenNthCalledWith(2, previous.subjects);
    expect(savePlannerSettings).not.toHaveBeenCalled();
  });

  test("rolls back a potentially partial settings-only write", () => {
    const previous = createPrevious();
    const candidate = cloneCandidate(previous);
    changeSettings(candidate);
    const saveSubjects = vi.fn(success);
    const savePlannerSettings = vi
      .fn()
      .mockReturnValueOnce(failure("settings verification failed"))
      .mockReturnValueOnce(success());

    expect(
      persistScheduleCandidate({ previous, candidate, saveSubjects, savePlannerSettings }),
    ).toEqual({ ok: false, error: "settings verification failed" });
    expect(saveSubjects).not.toHaveBeenCalled();
    expect(savePlannerSettings).toHaveBeenNthCalledWith(1, candidate.plannerSettings);
    expect(savePlannerSettings).toHaveBeenNthCalledWith(2, previous.plannerSettings);
  });

  test("rolls both stores back when the later settings write may have partially persisted", () => {
    const previous = createPrevious();
    const candidate = cloneCandidate(previous);
    changeCatalog(candidate);
    changeSettings(candidate);
    let storedSubjects = structuredClone(previous.subjects);
    let storedSettings = structuredClone(previous.plannerSettings);
    const calls: string[] = [];
    const saveSubjects = vi.fn((subjects: Subject[]) => {
      storedSubjects = structuredClone(subjects);
      calls.push(subjects === candidate.subjects ? "subjects:candidate" : "subjects:previous");
      return success();
    });
    const savePlannerSettings = vi.fn((settings: PlannerSettings) => {
      storedSettings = structuredClone(settings);
      calls.push(
        settings === candidate.plannerSettings ? "settings:candidate" : "settings:previous",
      );
      return settings === candidate.plannerSettings
        ? failure("settings verification failed")
        : success();
    });

    expect(
      persistScheduleCandidate({ previous, candidate, saveSubjects, savePlannerSettings }),
    ).toEqual({ ok: false, error: "settings verification failed" });
    expect(calls).toEqual([
      "subjects:candidate",
      "settings:candidate",
      "settings:previous",
      "subjects:previous",
    ]);
    expect(storedSubjects).toEqual(previous.subjects);
    expect(storedSettings).toEqual(previous.plannerSettings);
  });

  test("surfaces rollback failures for every store that could have been partially written", () => {
    const previous = createPrevious();
    const candidate = cloneCandidate(previous);
    changeCatalog(candidate);
    changeSettings(candidate);
    const saveSubjects = vi
      .fn()
      .mockReturnValueOnce(success())
      .mockReturnValueOnce(failure("catalog rollback failed"));
    const savePlannerSettings = vi
      .fn()
      .mockReturnValueOnce(failure("settings failed"))
      .mockReturnValueOnce(failure("settings rollback failed"));

    const result = persistScheduleCandidate({
      previous,
      candidate,
      saveSubjects,
      savePlannerSettings,
    });

    expect(result).toMatchObject({ ok: false, error: "settings failed" });
    if (result.ok) throw new Error("Expected persistence failure");
    expect(result.rollbackError).toContain("settings rollback failed");
    expect(result.rollbackError).toContain("catalog rollback failed");
    expect(savePlannerSettings).toHaveBeenNthCalledWith(2, previous.plannerSettings);
    expect(saveSubjects).toHaveBeenNthCalledWith(2, previous.subjects);
  });
});
