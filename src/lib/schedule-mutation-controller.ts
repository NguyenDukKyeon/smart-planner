import type { StorageWriteResult } from "./app-storage";
import type { Subject } from "./mock-data";
import type { PlannerSettings } from "./planner";
import { persistScheduleCandidate } from "./schedule-persistence";
import {
  appendScheduleUndoEntry,
  createScheduleMutationEntry,
  type ScheduleCandidate,
  type ScheduleMutationEntry,
  type ScheduleMutationKind,
  type ScheduleSnapshot,
} from "./schedule-transactions";

type ScheduleWriters = {
  saveSubjects: (subjects: Subject[]) => StorageWriteResult;
  savePlannerSettings: (plannerSettings: PlannerSettings) => StorageWriteResult;
  applyCandidate: (candidate: ScheduleCandidate) => void;
};

export type CommitScheduleMutationResult =
  | {
      ok: true;
      status: "noop";
      history: ScheduleMutationEntry[];
    }
  | {
      ok: true;
      status: "committed";
      history: ScheduleMutationEntry[];
      entry: ScheduleMutationEntry;
    }
  | {
      ok: false;
      error: string;
      rollbackError?: string;
      history: ScheduleMutationEntry[];
    };

export type UndoScheduleMutationResult =
  | {
      ok: true;
      status: "noop";
      history: ScheduleMutationEntry[];
    }
  | {
      ok: true;
      status: "undone";
      history: ScheduleMutationEntry[];
      entry: ScheduleMutationEntry;
    }
  | {
      ok: false;
      error: string;
      rollbackError?: string;
      history: ScheduleMutationEntry[];
    };

export function scheduleSnapshotsEqual(
  left: ScheduleSnapshot | ScheduleCandidate,
  right: ScheduleSnapshot | ScheduleCandidate,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function subjectsChanged(current: ScheduleSnapshot, candidate: ScheduleCandidate): boolean {
  return JSON.stringify(current.subjects) !== JSON.stringify(candidate.subjects);
}

export function commitScheduleMutation(
  params: ScheduleWriters & {
    current: ScheduleSnapshot;
    candidate: ScheduleCandidate;
    history: ScheduleMutationEntry[];
    kind: ScheduleMutationKind;
    description: string;
    backupSubjects?: (subjects: Subject[]) => StorageWriteResult;
    now?: number;
    idFactory?: () => string;
  },
): CommitScheduleMutationResult {
  if (scheduleSnapshotsEqual(params.current, params.candidate)) {
    return { ok: true, status: "noop", history: params.history };
  }

  if (subjectsChanged(params.current, params.candidate) && params.backupSubjects) {
    const backup = params.backupSubjects(params.current.subjects);
    if (!backup.ok) {
      return { ok: false, error: backup.error, history: params.history };
    }
  }

  const persisted = persistScheduleCandidate({
    previous: params.current,
    candidate: params.candidate,
    saveSubjects: params.saveSubjects,
    savePlannerSettings: params.savePlannerSettings,
  });
  if (!persisted.ok) {
    return {
      ok: false,
      error: persisted.error,
      ...(persisted.rollbackError ? { rollbackError: persisted.rollbackError } : {}),
      history: params.history,
    };
  }

  params.applyCandidate(params.candidate);
  const entry = createScheduleMutationEntry({
    kind: params.kind,
    description: params.description,
    subjects: params.current.subjects,
    plannerSettings: params.current.plannerSettings,
    now: params.now,
    idFactory: params.idFactory,
  });
  return {
    ok: true,
    status: "committed",
    history: appendScheduleUndoEntry(params.history, entry),
    entry,
  };
}

export function undoLastScheduleMutation(
  params: ScheduleWriters & {
    current: ScheduleSnapshot;
    history: ScheduleMutationEntry[];
  },
): UndoScheduleMutationResult {
  const entry = params.history.at(-1);
  if (!entry) return { ok: true, status: "noop", history: params.history };

  const candidate: ScheduleCandidate = entry.before;
  const persisted = persistScheduleCandidate({
    previous: params.current,
    candidate,
    saveSubjects: params.saveSubjects,
    savePlannerSettings: params.savePlannerSettings,
  });
  if (!persisted.ok) {
    return {
      ok: false,
      error: persisted.error,
      ...(persisted.rollbackError ? { rollbackError: persisted.rollbackError } : {}),
      history: params.history,
    };
  }

  params.applyCandidate(candidate);
  return {
    ok: true,
    status: "undone",
    history: params.history.slice(0, -1),
    entry,
  };
}
