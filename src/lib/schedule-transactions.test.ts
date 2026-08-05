import { describe, expect, test } from "vitest";
import { SUBJECTS } from "./mock-data";
import { DEFAULT_PLANNER_SETTINGS } from "./planner";
import {
  appendScheduleUndoEntry,
  createScheduleMutationEntry,
  createScheduleSnapshot,
  isEditableUndoTarget,
  type ScheduleMutationEntry,
} from "./schedule-transactions";

describe("schedule transaction primitives", () => {
  test("creates a detached snapshot of subjects and planner settings", () => {
    const subjects = structuredClone(SUBJECTS.slice(0, 1));
    const plannerSettings = structuredClone(DEFAULT_PLANNER_SETTINGS);

    const snapshot = createScheduleSnapshot(subjects, plannerSettings);

    expect(snapshot.subjects).not.toBe(subjects);
    expect(snapshot.plannerSettings).not.toBe(plannerSettings);
    expect(snapshot.plannerSettings.dailyHours).not.toBe(plannerSettings.dailyHours);

    snapshot.subjects[0].name = "Đã thay đổi trong snapshot";
    snapshot.subjects[0].milestones[0].lessons[0].title = "Bài đã thay đổi";
    snapshot.plannerSettings.dailyHours["2026-08-06"] = 7.5;

    expect(subjects[0].name).not.toBe("Đã thay đổi trong snapshot");
    expect(subjects[0].milestones[0].lessons[0].title).not.toBe("Bài đã thay đổi");
    expect(plannerSettings.dailyHours["2026-08-06"]).toBeUndefined();
  });

  test("creates deterministic mutation metadata and a detached before snapshot", () => {
    const subjects = structuredClone(SUBJECTS.slice(0, 1));
    const plannerSettings = structuredClone(DEFAULT_PLANNER_SETTINGS);

    const entry = createScheduleMutationEntry({
      kind: "move-lesson-date",
      description: "Chuyển bài Toán sang 06/08",
      subjects,
      plannerSettings,
      now: 1_786_000_000_000,
      idFactory: () => "mutation-001",
    });

    expect(entry).toMatchObject({
      id: "mutation-001",
      kind: "move-lesson-date",
      createdAt: 1_786_000_000_000,
      description: "Chuyển bài Toán sang 06/08",
    });
    expect(entry.before.subjects).not.toBe(subjects);
    expect(entry.before.plannerSettings).not.toBe(plannerSettings);
  });

  test("keeps only the latest twenty successful mutation entries", () => {
    let history: ScheduleMutationEntry[] = [];

    for (let index = 1; index <= 22; index += 1) {
      const entry = createScheduleMutationEntry({
        kind: "change-day-capacity",
        description: `Đổi công suất lần ${index}`,
        subjects: [],
        plannerSettings: DEFAULT_PLANNER_SETTINGS,
        now: index,
        idFactory: () => `mutation-${index}`,
      });
      history = appendScheduleUndoEntry(history, entry);
    }

    expect(history).toHaveLength(20);
    expect(history[0].id).toBe("mutation-3");
    expect(history.at(-1)?.id).toBe("mutation-22");
  });

  test("supports a smaller explicit history limit without mutating the input array", () => {
    const first = createScheduleMutationEntry({
      kind: "move-lesson-date",
      description: "Đầu tiên",
      subjects: [],
      plannerSettings: DEFAULT_PLANNER_SETTINGS,
      idFactory: () => "first",
    });
    const second = createScheduleMutationEntry({
      kind: "move-lesson-date",
      description: "Thứ hai",
      subjects: [],
      plannerSettings: DEFAULT_PLANNER_SETTINGS,
      idFactory: () => "second",
    });
    const original = [first];

    const next = appendScheduleUndoEntry(original, second, 1);

    expect(original).toEqual([first]);
    expect(next).toEqual([second]);
  });

  test.each([
    [null, false],
    [{ tagName: "DIV", isContentEditable: true }, true],
    [{ tagName: "INPUT", isContentEditable: false }, true],
    [{ tagName: "textarea", isContentEditable: false }, true],
    [{ tagName: "SELECT", isContentEditable: false }, true],
    [{ tagName: "BUTTON", isContentEditable: false }, false],
    [{ tagName: "SPAN", isContentEditable: false }, false],
  ])("detects whether an undo target is editable", (target, expected) => {
    expect(isEditableUndoTarget(target as EventTarget | null)).toBe(expected);
  });
});
