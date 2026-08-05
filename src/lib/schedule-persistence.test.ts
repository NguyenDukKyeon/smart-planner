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

  test("stops immediately when the first catalog write fails", () => {
    const previous = createPrevious();
    const candidate = cloneCandidate(previous);
    changeCatalog(candidate);
    changeSettings(candidate);
    const saveSubjects = vi.fn(() => failure("catalog failed"));
    const savePlannerSettings = vi.fn(success);

    expect(
      persistScheduleCandidate({ previous, candidate, saveSubjects, savePlannerSettings }),
    ).toEqual({ ok: false, error: "catalog failed" });
    expect(saveSubjects).toHaveBeenCalledOnce();
    expect(savePlannerSettings).not.toHaveBeenCalled();
  });

  test("rolls the catalog back when the later planner-settings write fails", () => {
    const previous = createPrevious();
    const candidate = cloneCandidate(previous);
    changeCatalog(candidate);
    changeSettings(candidate);
    const saveSubjects = vi.fn().mockReturnValueOnce(success()).mockReturnValueOnce(success());
    const savePlannerSettings = vi.fn(() => failure("settings failed"));

    expect(
      persistScheduleCandidate({ previous, candidate, saveSubjects, savePlannerSettings }),
    ).toEqual({ ok: false, error: "settings failed" });
    expect(saveSubjects).toHaveBeenNthCalledWith(1, candidate.subjects);
    expect(saveSubjects).toHaveBeenNthCalledWith(2, previous.subjects);
  });

  test("surfaces both the write error and a failed rollback", () => {
    const previous = createPrevious();
    const candidate = cloneCandidate(previous);
    changeCatalog(candidate);
    changeSettings(candidate);
    const saveSubjects = vi
      .fn()
      .mockReturnValueOnce(success())
      .mockReturnValueOnce(failure("rollback failed"));
    const savePlannerSettings = vi.fn(() => failure("settings failed"));

    expect(
      persistScheduleCandidate({ previous, candidate, saveSubjects, savePlannerSettings }),
    ).toEqual({
      ok: false,
      error: "settings failed",
      rollbackError: "rollback failed",
    });
  });
});
