import type { Subject } from "./mock-data";
import type { PlannerSettings } from "./planner";

export type ScheduleMutationKind =
  | "move-lesson-date"
  | "change-schedule-mode"
  | "change-day-capacity"
  | "edit-lesson"
  | "reorder-subject"
  | "reorder-topic"
  | "reorder-lesson"
  | "move-lessons"
  | "bulk-schedule-update";

export type ScheduleSnapshot = {
  subjects: Subject[];
  plannerSettings: PlannerSettings;
};

export type ScheduleMutationEntry = {
  id: string;
  kind: ScheduleMutationKind;
  createdAt: number;
  description: string;
  before: ScheduleSnapshot;
};

export type ScheduleCandidate = {
  subjects: Subject[];
  plannerSettings: PlannerSettings;
};

export type ScheduleTransactionResult =
  | {
      ok: true;
      candidate: ScheduleCandidate;
      undoEntry: ScheduleMutationEntry;
    }
  | {
      ok: false;
      error: string;
    };

const DEFAULT_UNDO_LIMIT = 20;

function createMutationId(): string {
  const randomId = globalThis.crypto?.randomUUID?.();
  if (randomId) return randomId;
  return `schedule-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createScheduleSnapshot(
  subjects: Subject[],
  plannerSettings: PlannerSettings,
): ScheduleSnapshot {
  return {
    subjects: structuredClone(subjects),
    plannerSettings: structuredClone(plannerSettings),
  };
}

export function scheduleSnapshotsEqual(
  left: ScheduleSnapshot | ScheduleCandidate,
  right: ScheduleSnapshot | ScheduleCandidate,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function shouldInvalidateScheduleHistory(params: {
  observed: ScheduleSnapshot;
  current: ScheduleSnapshot;
  expectedPublished?: ScheduleSnapshot | null;
}): boolean {
  if (scheduleSnapshotsEqual(params.observed, params.current)) return false;
  if (
    params.expectedPublished &&
    scheduleSnapshotsEqual(params.expectedPublished, params.current)
  ) {
    return false;
  }
  return true;
}

export function createScheduleMutationEntry(params: {
  kind: ScheduleMutationKind;
  description: string;
  subjects: Subject[];
  plannerSettings: PlannerSettings;
  now?: number;
  idFactory?: () => string;
}): ScheduleMutationEntry {
  return {
    id: (params.idFactory ?? createMutationId)(),
    kind: params.kind,
    createdAt: params.now ?? Date.now(),
    description: params.description,
    before: createScheduleSnapshot(params.subjects, params.plannerSettings),
  };
}

export function appendScheduleUndoEntry(
  current: ScheduleMutationEntry[],
  entry: ScheduleMutationEntry,
  limit = DEFAULT_UNDO_LIMIT,
): ScheduleMutationEntry[] {
  const safeLimit = Math.max(0, Math.floor(limit));
  if (safeLimit === 0) return [];
  return [...current, entry].slice(-safeLimit);
}

export function isEditableUndoTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== "object") return false;

  const candidate = target as EventTarget & {
    isContentEditable?: boolean;
    tagName?: string;
  };
  if (candidate.isContentEditable === true) return true;

  const tagName = candidate.tagName?.toUpperCase();
  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
}
