import fs from "node:fs/promises";
import { describe, expect, test } from "vitest";

describe("Flexible schedule UX", () => {
  test("supports subject views, day drop targets, shared undo and non-drag alternatives", async () => {
    const plannerSource = await fs.readFile(
      new URL("../components/FlexiblePlanner.tsx", import.meta.url),
      "utf8",
    );
    const hookSource = await fs.readFile(
      new URL("../components/flexible-planner/useScheduleTransactions.ts", import.meta.url),
      "utf8",
    );
    const routeSource = await fs.readFile(new URL("../routes/index.tsx", import.meta.url), "utf8");

    expect(plannerSource).toContain("Lịch linh hoạt");
    expect(plannerSource).toContain("Tất cả môn");
    expect(plannerSource).toContain('aria-label="Xem lịch theo môn"');
    expect(plannerSource).toContain("application/x-smart-lesson-id");
    expect(plannerSource).toContain("Thả để chuyển sang");
    expect(plannerSource).toContain("buildMoveLessonDateCandidate");
    expect(plannerSource).toContain("buildChangeDayCapacityCandidate");
    expect(plannerSource).toContain("unplacedFixedLessons");
    expect(plannerSource).toContain("lùi một ngày");
    expect(plannerSource).toContain("tiến một ngày");
    expect(plannerSource).toContain("useScheduleTransactions");
    expect(plannerSource).toContain("undoLastMutation");
    expect(plannerSource).toContain('aria-label="Hoàn tác lần chuyển lịch gần nhất"');
    expect(plannerSource).toContain("Nhấn Ctrl+Z để hoàn tác");
    expect(plannerSource).not.toContain("type UndoEntry =");
    expect(plannerSource).not.toContain("setUndoStack");
    expect(hookSource).toContain('event.key.toLowerCase() !== "z"');
    expect(hookSource).toContain("isEditableUndoTarget");
    expect(routeSource).toContain("Lịch linh hoạt");
    expect(routeSource).toContain("transactionAdapters={scheduleTransactionAdapters}");
  });
});
