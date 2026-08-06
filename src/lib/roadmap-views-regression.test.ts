import fs from "node:fs/promises";
import { describe, expect, test } from "vitest";

describe("P1C Roadmap view integration", () => {
  test("keeps capacity projection as default and adds a transient canonical view", async () => {
    const source = await fs.readFile(
      new URL("../components/LearningRoadmap.tsx", import.meta.url),
      "utf8",
    );

    expect(source).toContain('useState<RoadmapViewMode>("projection")');
    expect(source).toContain("Theo lịch dự kiến");
    expect(source).toContain("Theo thứ tự");
    expect(source).toContain("buildRoadmapProjection");
    expect(source).toContain("buildCanonicalRoadmap");
    expect(source).toContain("Lịch dự kiến thay đổi theo quỹ giờ");
    expect(source).toContain("AddLessonModal");
    expect(source).toContain("onToggleLesson(item.lesson.id, item.lesson.xp)");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("sessionStorage");
    expect(source).not.toContain("persistPlannerSettings");
    expect(source).not.toContain("moveLessonToDate");
  });
});
