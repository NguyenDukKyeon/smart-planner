import fs from "node:fs/promises";
import { describe, expect, test } from "vitest";

describe("P1D Course Manager behavior-preservation coverage", () => {
  test("requires a dedicated runtime-rendered presentation regression suite", async () => {
    const runtimeSuite = await fs
      .readFile(new URL("./course-manager-presentation-runtime.test.ts", import.meta.url), "utf8")
      .catch(() => "");

    expect(runtimeSuite).toContain("renderToStaticMarkup");
    expect(runtimeSuite).toContain("TopicSection");
    expect(runtimeSuite).toContain("LessonRow");
    expect(runtimeSuite).not.toContain('readFile(new URL("../components/course-manager');
  });
});
