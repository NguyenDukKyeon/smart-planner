import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { DEFAULT_PLANNER_SETTINGS, DEFAULT_STUDY_META, pickDayQueue } from "./planner";

const capacitySurfaces = ["TodayPanel.tsx", "FlexiblePlanner.tsx", "ForecastCard.tsx"] as const;

describe("study-hour UI policy", () => {
  test("creates exactly 960 minutes of capacity for sixteen hours", () => {
    const queue = pickDayQueue({
      subjects: [],
      completed: {},
      meta: DEFAULT_STUDY_META,
      settings: DEFAULT_PLANNER_SETTINGS,
      dateISO: "2026-08-05",
      hoursOverride: 16,
    });

    expect(queue.quotaMinutes).toBe(960);
  });

  test("uses the canonical range on every capacity surface", async () => {
    for (const fileName of capacitySurfaces) {
      const source = await readFile(new URL(`../components/${fileName}`, import.meta.url), "utf8");

      expect(source).toContain("MAX_DAILY_STUDY_HOURS");
      expect(source).toContain("MIN_DAILY_STUDY_HOURS");
      expect(source).toContain("DAILY_STUDY_HOURS_STEP");
      expect(source).toContain("normalizeDailyStudyHours");
      expect(source).not.toContain("max={12}");
      expect(source).not.toContain("Math.min(12");
    }
  });

  test("shares one non-blocking high-capacity note", async () => {
    const noteSource = await readFile(
      new URL("../components/HighStudyHoursNote.tsx", import.meta.url),
      "utf8",
    );

    expect(noteSource).toContain("isHighDailyStudyHours");
    expect(noteSource).toContain('role="status"');
    expect(noteSource).toContain(
      "Quỹ thời gian rất cao. Hãy tính cả thời gian ăn, nghỉ và phục hồi.",
    );

    for (const fileName of capacitySurfaces) {
      const source = await readFile(new URL(`../components/${fileName}`, import.meta.url), "utf8");
      expect(source).toContain("HighStudyHoursNote");
    }
  });
});
