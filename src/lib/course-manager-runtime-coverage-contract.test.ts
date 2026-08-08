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

  test("requires a runtime TopicSection collapse interaction regression", async () => {
    const interactionSuite = await fs
      .readFile(new URL("./course-manager-topic-collapse-interaction.test.ts", import.meta.url), "utf8")
      .catch(() => "");

    expect(interactionSuite).toContain("renderToStaticMarkup");
    expect(interactionSuite).toContain("TopicSection");
    expect(interactionSuite).toContain("runtimeTriggerToggle");
    expect(interactionSuite).toContain('aria-expanded=\\"false\\"');
    expect(interactionSuite).toContain('aria-expanded=\\"true\\"');
    expect(interactionSuite).not.toContain('readFile(new URL("../components/course-manager');
  });
});
