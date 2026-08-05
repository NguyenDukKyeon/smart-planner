import { access, readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

const legacyPatchFiles = [
  "fix-planning-dates.mjs",
  "prepare-app-build.mjs",
  "add-schedule-modes.mjs",
  "add-schedule-mode-bulk.mjs",
  "improve-lesson-order-drag.mjs",
  "improve-flexible-schedule-ux.mjs",
  "add-flexible-planner-undo.mjs",
];

describe("build purity", () => {
  test("uses committed source without source-patching npm commands", async () => {
    const packageJson = JSON.parse(
      await readFile(new URL("../../package.json", import.meta.url), "utf8"),
    ) as { scripts: Record<string, string> };

    for (const scriptName of ["dev", "build", "build:dev", "typecheck", "test", "lint"]) {
      expect(packageJson.scripts[scriptName]).not.toMatch(
        /node scripts\/(fix-planning-dates|prepare-app-build|add-schedule-modes|add-schedule-mode-bulk|improve-lesson-order-drag|improve-flexible-schedule-ux|add-flexible-planner-undo)\.mjs/,
      );
    }

    expect(packageJson.scripts.dev).toBe("vite dev --host 0.0.0.0 --port 3000");
    expect(packageJson.scripts.build).toBe("npm test && vite build");
    expect(packageJson.scripts["build:dev"]).toBe("vite build --mode development");
    expect(packageJson.scripts.typecheck).toBe("tsc --noEmit");
    expect(packageJson.scripts.test).toBe("vitest run src/lib src/routes/__root.test.tsx");
    expect(packageJson.scripts.lint).toBe("eslint .");
  });

  test("removes obsolete source-patching files", async () => {
    for (const fileName of legacyPatchFiles) {
      await expect(access(new URL(`../../scripts/${fileName}`, import.meta.url))).rejects.toThrow();
    }

    await expect(
      access(new URL("../../scripts/templates/FlexiblePlanner.tsx", import.meta.url)),
    ).rejects.toThrow();
  });

  test("keeps accepted generated behavior in committed source", async () => {
    const plannerSource = await readFile(
      new URL("../components/FlexiblePlanner.tsx", import.meta.url),
      "utf8",
    );
    const courseManagerSource = await readFile(
      new URL("../components/CourseManagerModal.tsx", import.meta.url),
      "utf8",
    );
    const routeSource = await readFile(new URL("../routes/index.tsx", import.meta.url), "utf8");

    expect(plannerSource).toContain("undoStack");
    expect(plannerSource).toContain("unplacedFixedLessons");
    expect(plannerSource).toContain("application/x-smart-lesson-id");
    expect(courseManagerSource).toContain("Kéo một lần bằng tay cầm để đổi vị trí");
    expect(courseManagerSource).toContain("draggable={false}");
    expect(routeSource).toContain("onSubjectsUpdated={updateSubjectsSafely}");
  });
});
