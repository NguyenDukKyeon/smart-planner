import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const plannerSource = readFileSync(
  new URL("../components/FlexiblePlanner.tsx", import.meta.url),
  "utf8",
);
const hookSource = readFileSync(
  new URL("../components/schedule/useScheduleTransactions.ts", import.meta.url),
  "utf8",
);
const moveDialogSource = readFileSync(
  new URL("../components/flexible-planner/MoveLessonDateDialog.tsx", import.meta.url),
  "utf8",
);
const inputSource = readFileSync(new URL("../components/ui/input.tsx", import.meta.url), "utf8");
const dashboardSource = readFileSync(new URL("../routes/index.tsx", import.meta.url), "utf8");

describe("Flexible Planner shared schedule transactions", () => {
  test("the shared hook owns capped history and keyboard undo", () => {
    expect(hookSource).toContain("commitScheduleMutation");
    expect(hookSource).toContain("undoLastScheduleMutation");
    expect(hookSource).toContain("isEditableUndoTarget");
    expect(hookSource).toContain('event.key.toLowerCase() !== "z"');
    expect(hookSource).toContain("historyRef.current");
    expect(hookSource).toContain("lastUndoneEntry");
  });

  test("the shared hook discards stale history after an unrelated external schedule change", () => {
    expect(hookSource).toContain("shouldInvalidateScheduleHistory");
    expect(hookSource).toContain("observedSnapshotRef");
    expect(hookSource).toContain("expectedPublishedSnapshotRef");
    expect(hookSource).toContain("replaceHistory([])");
  });

  test("lesson moves and day capacity consume the route-owned controller", () => {
    expect(plannerSource).toContain("scheduleTransactions: ScheduleTransactionController");
    expect(plannerSource).not.toContain("useScheduleTransactions({");
    expect(plannerSource).toContain("buildMoveLessonDateCandidate");
    expect(plannerSource).toContain("buildChangeDayCapacityCandidate");
    expect(plannerSource).not.toContain("type UndoEntry =");
    expect(plannerSource).not.toContain("setUndoStack");
  });

  test("every Flexible Planner move method uses the canonical date-move candidate", () => {
    expect(plannerSource).toContain("const moveLessonToDate =");
    expect(plannerSource).toContain("buildMoveLessonDateCandidate({");
    expect(plannerSource).toContain('kind: "move-lesson-date"');
    expect(plannerSource).toContain("moveLessonToDate(lessonId, targetDateISO)");
    expect(plannerSource).not.toContain("updateLessonDetails(subjects");
  });

  test("the direct date dialog delegates to the canonical parent move boundary", () => {
    expect(plannerSource).toContain("<MoveLessonDateDialog");
    expect(plannerSource).toContain("onMove={onMoveLesson}");
    expect(moveDialogSource).toContain("onMove(lesson.id, draftDate)");
    expect(moveDialogSource).not.toContain("buildMoveLessonDateCandidate");
    expect(moveDialogSource).not.toContain("commitScheduleMutation");
    expect(moveDialogSource).not.toContain("persistPlannerSettings");
    expect(moveDialogSource).not.toContain("persistScheduleSubjects");
  });

  test("day capacity commits on an explicit boundary instead of every keystroke", () => {
    expect(plannerSource).toContain("function DayCapacityInput(");
    expect(plannerSource).toContain("onBlur={commitDraft}");
    expect(plannerSource).toContain('event.key === "Enter"');
    expect(plannerSource).not.toContain(
      "onSetDayHours(day.dateISO, normalizeDailyStudyHours(value))",
    );
  });

  test("Escape cancellation stays local to the capacity editor", () => {
    expect(plannerSource).toContain('event.key === "Escape"');
    expect(plannerSource).toContain("cancelNextBlurCommitRef");
    expect(plannerSource).toContain("cancelNextBlurCommitRef.current = true");
    expect(plannerSource).toContain("cancelNextBlurCommitRef.current = false");
    expect(inputSource).not.toContain("cancelNextBlurCommitRef");
  });

  test("Dashboard owns one controller and passes it to both Plan surfaces", () => {
    expect(dashboardSource).toContain("persistPlannerSettings,");
    expect(dashboardSource).toContain("applyPersistedPlannerSettings,");
    expect(dashboardSource).toContain("const persistScheduleSubjects = useCallback(");
    expect(dashboardSource).toContain("const backupScheduleSubjects = useCallback(");
    expect(dashboardSource).toContain("const applyPersistedScheduleSubjects = useCallback(");
    expect(dashboardSource).toContain("const scheduleTransactionAdapters = useMemo(");
    expect(dashboardSource.match(/useScheduleTransactions\(/g)).toHaveLength(1);
    expect(dashboardSource.match(/scheduleTransactions=\{scheduleTransactions\}/g)).toHaveLength(2);
    expect(dashboardSource).not.toContain("transactionAdapters={scheduleTransactionAdapters}");
  });
});
