import { useCallback, useEffect, useRef, useState } from "react";
import type { StorageWriteResult } from "@/lib/app-storage";
import type { Subject } from "@/lib/mock-data";
import type { PlannerSettings } from "@/lib/planner";
import {
  commitScheduleMutation,
  undoLastScheduleMutation,
  type CommitScheduleMutationResult,
  type UndoScheduleMutationResult,
} from "@/lib/schedule-mutation-controller";
import {
  createScheduleSnapshot,
  isEditableUndoTarget,
  shouldInvalidateScheduleHistory,
  type ScheduleCandidate,
  type ScheduleMutationEntry,
  type ScheduleMutationKind,
  type ScheduleSnapshot,
} from "@/lib/schedule-transactions";

export type ScheduleTransactionAdapters = {
  saveSubjects: (subjects: Subject[]) => StorageWriteResult;
  savePlannerSettings: (plannerSettings: PlannerSettings) => StorageWriteResult;
  backupSubjects: (subjects: Subject[]) => StorageWriteResult;
  applySubjects: (subjects: Subject[]) => void;
  applyPlannerSettings: (plannerSettings: PlannerSettings) => void;
};

type UseScheduleTransactionsParams = {
  subjects: Subject[];
  plannerSettings: PlannerSettings;
  adapters: ScheduleTransactionAdapters;
  onUndoSuccess?: (entry: ScheduleMutationEntry) => void;
  onUndoError?: (error: string, rollbackError?: string) => void;
};

export type ExecuteScheduleMutationParams = {
  candidate: ScheduleCandidate;
  kind: ScheduleMutationKind;
  description: string;
};

export type ScheduleTransactionController = {
  history: ScheduleMutationEntry[];
  canUndo: boolean;
  lastUndoneEntry: ScheduleMutationEntry | null;
  executeMutation: (params: ExecuteScheduleMutationParams) => CommitScheduleMutationResult;
  undoLastMutation: () => UndoScheduleMutationResult;
};

export function useScheduleTransactions({
  subjects,
  plannerSettings,
  adapters,
  onUndoSuccess,
  onUndoError,
}: UseScheduleTransactionsParams): ScheduleTransactionController {
  const [history, setHistoryState] = useState<ScheduleMutationEntry[]>([]);
  const [lastUndoneEntry, setLastUndoneEntry] = useState<ScheduleMutationEntry | null>(null);
  const historyRef = useRef<ScheduleMutationEntry[]>([]);
  const observedSnapshotRef = useRef<ScheduleSnapshot>(
    createScheduleSnapshot(subjects, plannerSettings),
  );
  const expectedPublishedSnapshotRef = useRef<ScheduleSnapshot | null>(null);

  const replaceHistory = useCallback((next: ScheduleMutationEntry[]) => {
    historyRef.current = next;
    setHistoryState(next);
  }, []);

  useEffect(() => {
    const current = createScheduleSnapshot(subjects, plannerSettings);
    const invalidate = shouldInvalidateScheduleHistory({
      observed: observedSnapshotRef.current,
      current,
      expectedPublished: expectedPublishedSnapshotRef.current,
    });

    observedSnapshotRef.current = current;
    expectedPublishedSnapshotRef.current = null;
    if (invalidate && historyRef.current.length > 0) replaceHistory([]);
  }, [plannerSettings, replaceHistory, subjects]);

  const applyCandidate = useCallback(
    (candidate: ScheduleCandidate) => {
      expectedPublishedSnapshotRef.current = createScheduleSnapshot(
        candidate.subjects,
        candidate.plannerSettings,
      );
      adapters.applySubjects(candidate.subjects);
      adapters.applyPlannerSettings(candidate.plannerSettings);
    },
    [adapters],
  );

  const executeMutation = useCallback(
    ({
      candidate,
      kind,
      description,
    }: ExecuteScheduleMutationParams): CommitScheduleMutationResult => {
      const result = commitScheduleMutation({
        current: createScheduleSnapshot(subjects, plannerSettings),
        candidate,
        history: historyRef.current,
        kind,
        description,
        saveSubjects: adapters.saveSubjects,
        savePlannerSettings: adapters.savePlannerSettings,
        backupSubjects: adapters.backupSubjects,
        applyCandidate,
      });
      if (result.ok) replaceHistory(result.history);
      return result;
    },
    [adapters, applyCandidate, plannerSettings, replaceHistory, subjects],
  );

  const undoLastMutation = useCallback((): UndoScheduleMutationResult => {
    const result = undoLastScheduleMutation({
      current: createScheduleSnapshot(subjects, plannerSettings),
      history: historyRef.current,
      saveSubjects: adapters.saveSubjects,
      savePlannerSettings: adapters.savePlannerSettings,
      applyCandidate,
    });

    if (result.ok) {
      replaceHistory(result.history);
      if (result.status === "undone") {
        setLastUndoneEntry(result.entry);
        onUndoSuccess?.(result.entry);
      }
    } else {
      onUndoError?.(result.error, result.rollbackError);
    }
    return result;
  }, [
    adapters,
    applyCandidate,
    onUndoError,
    onUndoSuccess,
    plannerSettings,
    replaceHistory,
    subjects,
  ]);

  useEffect(() => {
    const handleUndoShortcut = (event: KeyboardEvent) => {
      if (
        !(event.ctrlKey || event.metaKey) ||
        event.shiftKey ||
        event.altKey ||
        event.key.toLowerCase() !== "z" ||
        isEditableUndoTarget(event.target) ||
        historyRef.current.length === 0
      ) {
        return;
      }

      event.preventDefault();
      undoLastMutation();
    };

    window.addEventListener("keydown", handleUndoShortcut);
    return () => window.removeEventListener("keydown", handleUndoShortcut);
  }, [undoLastMutation]);

  return {
    history,
    canUndo: history.length > 0,
    lastUndoneEntry,
    executeMutation,
    undoLastMutation,
  };
}
