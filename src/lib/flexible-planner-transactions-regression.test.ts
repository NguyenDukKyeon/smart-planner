import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const plannerSource = readFileSync(
  new URL("../components/FlexiblePlanner.tsx", import.meta.url),
  "utf8",
);
const hookSource = readFileSync(
  new URL("../components/flexible-planner/useScheduleTransactions.ts", import.meta.url),
  "utf8",
);
const dashboardSource = readFileSync(new URL("../routes/index.tsx", import.meta.url), "utf8");

describe("Flexible Planner shared schedule transactions", () => {
  test("the hook owns capped history and keyboard undo", () => {
    expect(hookSource).toContain("commitScheduleMutation");
    expect(hookSource).toContain("undoLastScheduleMutation");
    expect(hookSource).toContain("isEditableUndoTarget");
    expect(hookSource).toContain('event.key.toLowerCase() !== "z"');
    expect(hookSource).toContain("historyRef.current");
  });

  test("lesson moves and day capacity use shared candidate builders", () => {
    expect(plannerSource).toContain("useScheduleTransactions");
    expect(plannerSource).toContain("buildMoveLessonDateCandidate");
    expect(plannerSource).toContain("buildChangeDayCapacityCandidate");
    expect(plannerSource).not.toContain("type UndoEntry =");
    expect(plannerSource).not.toContain("setUndoStack");
  });

  test("day capacity commits on an explicit boundary instead of every keystroke", () => {
    expect(plannerSource).toContain("function DayCapacityInput(");
    expect(plannerSource).toContain("onBlur={commitDraft}");
    expect(plannerSource).toContain('event.key === "Enter"');
    expect(plannerSource).not.toContain(
      "onSetDayHours(day.dateISO, normalizeDailyStudyHours(value))",
    );
  });

  test("Escape cancels the draft without letting the following blur commit it", () => {
    expect(plannerSource).toContain("cancelNextBlurCommitRef");
    expect(plannerSource).toContain("cancelNextBlurCommitRef.current = true");
    expect(plannerSource).toContain("cancelNextBlurCommitRef.current = false");
    expect(plannerSource).toContain('event.key === "Escape"');
  });

  test("Dashboard separates persistence from publishing for both stores", () => {
    expect(dashboardSource).toContain("persistPlannerSettings,");
    expect(dashboardSource).toContain("applyPersistedPlannerSettings,");
    expect(dashboardSource).toContain("const persistScheduleSubjects = useCallback(");
    expect(dashboardSource).toContain("const backupScheduleSubjects = useCallback(");
    expect(dashboardSource).toContain("const applyPersistedScheduleSubjects = useCallback(");
    expect(dashboardSource).toContain("const scheduleTransactionAdapters = useMemo(");
    expect(dashboardSource).toContain("transactionAdapters={scheduleTransactionAdapters}");
  });
});
