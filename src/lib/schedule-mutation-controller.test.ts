import { describe, expect, test, vi } from "vitest";
import { SUBJECTS, type Subject } from "./mock-data";
import { DEFAULT_PLANNER_SETTINGS, type PlannerSettings } from "./planner";
import { commitScheduleMutation, undoLastScheduleMutation } from "./schedule-mutation-controller";
import { createScheduleSnapshot, type ScheduleCandidate } from "./schedule-transactions";

function snapshot() {
  return createScheduleSnapshot(SUBJECTS, DEFAULT_PLANNER_SETTINGS);
}

function candidateWithCatalogChange(): ScheduleCandidate {
  const current = snapshot();
  current.subjects[0].name = `${current.subjects[0].name} mới`;
  return current;
}

function candidateWithSettingsChange(): ScheduleCandidate {
  const current = snapshot();
  current.plannerSettings.defaultDailyHours = 3;
  return current;
}

const success = () => ({ ok: true }) as const;
const failure = (error: string) => ({ ok: false, error }) as const;

describe("commitScheduleMutation", () => {
  test("treats an unchanged detached candidate as a no-op", () => {
    const current = snapshot();
    const saveSubjects = vi.fn(success);
    const savePlannerSettings = vi.fn(success);
    const applyCandidate = vi.fn();
    const backupSubjects = vi.fn(success);

    const result = commitScheduleMutation({
      current,
      candidate: createScheduleSnapshot(current.subjects, current.plannerSettings),
      history: [],
      kind: "change-day-capacity",
      description: "Không đổi công suất",
      saveSubjects,
      savePlannerSettings,
      applyCandidate,
      backupSubjects,
    });

    expect(result).toEqual({ ok: true, status: "noop", history: [] });
    expect(saveSubjects).not.toHaveBeenCalled();
    expect(savePlannerSettings).not.toHaveBeenCalled();
    expect(applyCandidate).not.toHaveBeenCalled();
    expect(backupSubjects).not.toHaveBeenCalled();
  });

  test("backs up a changed catalog, persists, publishes, and appends one undo entry", () => {
    const current = snapshot();
    const candidate = candidateWithCatalogChange();
    const calls: string[] = [];
    const backupSubjects = vi.fn((_subjects: Subject[]) => {
      calls.push("backup");
      return success();
    });
    const saveSubjects = vi.fn((_subjects: Subject[]) => {
      calls.push("save-subjects");
      return success();
    });
    const savePlannerSettings = vi.fn((_settings: PlannerSettings) => {
      calls.push("save-settings");
      return success();
    });
    const applyCandidate = vi.fn((_candidate: ScheduleCandidate) => calls.push("apply"));

    const result = commitScheduleMutation({
      current,
      candidate,
      history: [],
      kind: "move-lesson-date",
      description: "Chuyển bài kiểm thử",
      saveSubjects,
      savePlannerSettings,
      applyCandidate,
      backupSubjects,
      now: 123,
      idFactory: () => "mutation-1",
    });

    expect(result.ok).toBe(true);
    if (!result.ok || result.status !== "committed") throw new Error("Expected commit");
    expect(calls).toEqual(["backup", "save-subjects", "apply"]);
    expect(result.history).toHaveLength(1);
    expect(result.history[0]).toMatchObject({
      id: "mutation-1",
      kind: "move-lesson-date",
      createdAt: 123,
      description: "Chuyển bài kiểm thử",
      before: current,
    });
    expect(result.history[0].before).not.toBe(current);
  });

  test("does not persist or create history when the catalog backup fails", () => {
    const current = snapshot();
    const saveSubjects = vi.fn(success);
    const savePlannerSettings = vi.fn(success);
    const applyCandidate = vi.fn();

    const result = commitScheduleMutation({
      current,
      candidate: candidateWithCatalogChange(),
      history: [],
      kind: "move-lesson-date",
      description: "Chuyển bài kiểm thử",
      saveSubjects,
      savePlannerSettings,
      applyCandidate,
      backupSubjects: vi.fn(() => failure("backup failed")),
    });

    expect(result).toEqual({ ok: false, error: "backup failed", history: [] });
    expect(saveSubjects).not.toHaveBeenCalled();
    expect(savePlannerSettings).not.toHaveBeenCalled();
    expect(applyCandidate).not.toHaveBeenCalled();
  });

  test("does not publish or create history when persistence fails but rollback succeeds", () => {
    const current = snapshot();
    const applyCandidate = vi.fn();
    const savePlannerSettings = vi
      .fn()
      .mockReturnValueOnce(failure("settings failed"))
      .mockReturnValueOnce(success());

    const result = commitScheduleMutation({
      current,
      candidate: candidateWithSettingsChange(),
      history: [],
      kind: "change-day-capacity",
      description: "Đổi công suất",
      saveSubjects: vi.fn(success),
      savePlannerSettings,
      applyCandidate,
    });

    expect(result).toEqual({ ok: false, error: "settings failed", history: [] });
    expect(savePlannerSettings).toHaveBeenCalledTimes(2);
    expect(applyCandidate).not.toHaveBeenCalled();
  });
});

describe("undoLastScheduleMutation", () => {
  test("persists and publishes the previous snapshot before removing history", () => {
    const before = snapshot();
    const committed = commitScheduleMutation({
      current: before,
      candidate: candidateWithSettingsChange(),
      history: [],
      kind: "change-day-capacity",
      description: "Đổi công suất",
      saveSubjects: vi.fn(success),
      savePlannerSettings: vi.fn(success),
      applyCandidate: vi.fn(),
      idFactory: () => "mutation-1",
    });
    if (!committed.ok || committed.status !== "committed") throw new Error("Expected commit");

    const current = candidateWithSettingsChange();
    const savePlannerSettings = vi.fn(success);
    const applyCandidate = vi.fn();
    const undone = undoLastScheduleMutation({
      current,
      history: committed.history,
      saveSubjects: vi.fn(success),
      savePlannerSettings,
      applyCandidate,
    });

    expect(undone.ok).toBe(true);
    if (!undone.ok || undone.status !== "undone") throw new Error("Expected undo");
    expect(savePlannerSettings).toHaveBeenCalledWith(before.plannerSettings);
    expect(applyCandidate).toHaveBeenCalledWith(before);
    expect(undone.history).toEqual([]);
    expect(undone.entry.id).toBe("mutation-1");
  });

  test("retains history and does not publish when undo persistence fails but rollback succeeds", () => {
    const before = snapshot();
    const committed = commitScheduleMutation({
      current: before,
      candidate: candidateWithSettingsChange(),
      history: [],
      kind: "change-day-capacity",
      description: "Đổi công suất",
      saveSubjects: vi.fn(success),
      savePlannerSettings: vi.fn(success),
      applyCandidate: vi.fn(),
      idFactory: () => "mutation-1",
    });
    if (!committed.ok || committed.status !== "committed") throw new Error("Expected commit");
    const applyCandidate = vi.fn();
    const savePlannerSettings = vi
      .fn()
      .mockReturnValueOnce(failure("undo failed"))
      .mockReturnValueOnce(success());

    const result = undoLastScheduleMutation({
      current: candidateWithSettingsChange(),
      history: committed.history,
      saveSubjects: vi.fn(success),
      savePlannerSettings,
      applyCandidate,
    });

    expect(result).toEqual({
      ok: false,
      error: "undo failed",
      history: committed.history,
    });
    expect(savePlannerSettings).toHaveBeenCalledTimes(2);
    expect(applyCandidate).not.toHaveBeenCalled();
  });
});
