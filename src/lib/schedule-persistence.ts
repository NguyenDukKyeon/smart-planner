import type { StorageWriteResult } from "./app-storage";
import type { Subject } from "./mock-data";
import type { PlannerSettings } from "./planner";
import type { ScheduleCandidate, ScheduleSnapshot } from "./schedule-transactions";

export type PersistScheduleCandidateParams = {
  previous: ScheduleSnapshot;
  candidate: ScheduleCandidate;
  saveSubjects: (subjects: Subject[]) => StorageWriteResult;
  savePlannerSettings: (plannerSettings: PlannerSettings) => StorageWriteResult;
};

export type PersistScheduleCandidateResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      rollbackError?: string;
    };

function structurallyEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function callWriter(write: () => StorageWriteResult): StorageWriteResult {
  try {
    return write();
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Không thể lưu thay đổi lịch học.",
    };
  }
}

function failureWithRollbackErrors(
  failure: Extract<StorageWriteResult, { ok: false }>,
  rollbackErrors: string[],
): PersistScheduleCandidateResult {
  return rollbackErrors.length === 0
    ? failure
    : {
        ok: false,
        error: failure.error,
        rollbackError: rollbackErrors.join(" "),
      };
}

export function persistScheduleCandidate(
  params: PersistScheduleCandidateParams,
): PersistScheduleCandidateResult {
  const subjectsChanged = !structurallyEqual(params.previous.subjects, params.candidate.subjects);
  const settingsChanged = !structurallyEqual(
    params.previous.plannerSettings,
    params.candidate.plannerSettings,
  );

  if (!subjectsChanged && !settingsChanged) return { ok: true };

  if (subjectsChanged) {
    const subjectsResult = callWriter(() => params.saveSubjects(params.candidate.subjects));
    if (!subjectsResult.ok) {
      const rollbackResult = callWriter(() => params.saveSubjects(params.previous.subjects));
      return failureWithRollbackErrors(
        subjectsResult,
        rollbackResult.ok ? [] : [rollbackResult.error],
      );
    }
  }

  if (!settingsChanged) return { ok: true };

  const settingsResult = callWriter(() =>
    params.savePlannerSettings(params.candidate.plannerSettings),
  );
  if (settingsResult.ok) return { ok: true };

  const rollbackErrors: string[] = [];
  const settingsRollback = callWriter(() =>
    params.savePlannerSettings(params.previous.plannerSettings),
  );
  if (!settingsRollback.ok) rollbackErrors.push(settingsRollback.error);

  if (subjectsChanged) {
    const subjectsRollback = callWriter(() => params.saveSubjects(params.previous.subjects));
    if (!subjectsRollback.ok) rollbackErrors.push(subjectsRollback.error);
  }

  return failureWithRollbackErrors(settingsResult, rollbackErrors);
}
