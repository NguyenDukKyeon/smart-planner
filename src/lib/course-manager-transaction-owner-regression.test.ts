import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const dashboardSource = readFileSync(new URL("../routes/index.tsx", import.meta.url), "utf8");
const flexibleSource = readFileSync(
  new URL("../components/FlexiblePlanner.tsx", import.meta.url),
  "utf8",
);
const courseManagerSource = readFileSync(
  new URL("../components/CourseManagerModal.tsx", import.meta.url),
  "utf8",
);
const sharedHookSource = readFileSync(
  new URL("../components/schedule/useScheduleTransactions.ts", import.meta.url),
  "utf8",
);

describe("P1D shared transaction ownership", () => {
  test("Dashboard creates one controller and passes the same object to both surfaces", () => {
    expect(dashboardSource.match(/useScheduleTransactions\(/g)).toHaveLength(1);
    expect(dashboardSource).toContain("const scheduleTransactions = useScheduleTransactions({");
    expect(dashboardSource.match(/scheduleTransactions=\{scheduleTransactions\}/g)).toHaveLength(2);
  });

  test("children consume the controller instead of creating histories", () => {
    expect(flexibleSource).not.toContain("useScheduleTransactions({");
    expect(courseManagerSource).not.toContain("useScheduleTransactions({");
    expect(flexibleSource).toContain("scheduleTransactions: ScheduleTransactionController");
    expect(courseManagerSource).toContain("scheduleTransactions: ScheduleTransactionController");
  });

  test("the shared owner installs the only keyboard undo listener", () => {
    expect(sharedHookSource).toContain('window.addEventListener("keydown", handleUndoShortcut)');
    expect(sharedHookSource).toContain("isEditableUndoTarget");
    expect(sharedHookSource).toContain("lastUndoneEntry");
  });
});
