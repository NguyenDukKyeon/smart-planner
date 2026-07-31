import { describe, expect, test } from "vitest";
import { ALL_LESSONS, SUBJECTS } from "./mock-data";
import { isStudyDay, STUDY_DAY_COMPLETE_KEY } from "./progress-analytics";
import type { ProgressState } from "./progress-types";

describe("sample roadmap synchronization", () => {
  test("matches the 357 lessons in the class-11 workbook", () => {
    const counts = Object.fromEntries(
      SUBJECTS.map((subject) => [
        subject.name,
        subject.milestones.reduce((sum, milestone) => sum + milestone.lessons.length, 0),
      ]),
    );

    expect(counts).toEqual({ Toán: 167, "Vật lý": 72, "Hóa học": 118 });
    expect(ALL_LESSONS).toHaveLength(357);
    expect(new Set(ALL_LESSONS.map((lesson) => lesson.id)).size).toBe(357);
    expect(ALL_LESSONS.every((lesson) => lesson.plannedDurationMinutes === 120)).toBe(true);
    expect(ALL_LESSONS.every((lesson) => lesson.scheduledDate === "2026-08-01")).toBe(true);
  });
});

describe("strict study streak", () => {
  test("does not count a partial study session as a completed study day", () => {
    const state = {
      habitLog: { "2026-08-01": { study: true } },
    } as unknown as ProgressState;

    expect(isStudyDay(state, "2026-08-01")).toBe(false);
  });

  test("counts the day only after the full daily queue marker is recorded", () => {
    const state = {
      habitLog: { "2026-08-01": { [STUDY_DAY_COMPLETE_KEY]: true } },
    } as unknown as ProgressState;

    expect(isStudyDay(state, "2026-08-01")).toBe(true);
  });
});
