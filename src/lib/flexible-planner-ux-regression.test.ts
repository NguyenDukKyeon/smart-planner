import fs from "node:fs/promises";
import { describe, expect, test } from "vitest";

describe("Flexible schedule UX", () => {
  test("supports subject views, day drop targets, undo and non-drag alternatives", async () => {
    const plannerSource = await fs.readFile(
      new URL("../components/FlexiblePlanner.tsx", import.meta.url),
      "utf8",
    );
    const routeSource = await fs.readFile(new URL("../routes/index.tsx", import.meta.url), "utf8");

    expect(plannerSource).toContain("Lịch linh hoạt");
    expect(plannerSource).toContain("Tất cả môn");
    expect(plannerSource).toContain('aria-label="Xem lịch theo môn"');
    expect(plannerSource).toContain("application/x-smart-lesson-id");
    expect(plannerSource).toContain("Thả để chuyển sang");
    expect(plannerSource).toContain("updateLessonDetails");
    expect(plannerSource).toContain("unplacedFixedLessons");
    expect(plannerSource).toContain("lùi một ngày");
    expect(plannerSource).toContain("tiến một ngày");
    expect(plannerSource).toContain("undoStack");
    expect(plannerSource).toContain("undoLastMove");
    expect(plannerSource).toContain('event.key.toLowerCase() !== "z"');
    expect(plannerSource).toContain('aria-label="Hoàn tác lần chuyển lịch gần nhất"');
    expect(plannerSource).toContain("Nhấn Ctrl+Z để hoàn tác");
    expect(plannerSource).toContain("isTextEditingTarget");
    expect(routeSource).toContain("Lịch linh hoạt");
    expect(routeSource).toContain("onSubjectsUpdated={updateSubjectsSafely}");
  });
});
