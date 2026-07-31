import {
  addDaysISO,
  getLocalWeekRange,
  isDateISO,
  localDayBoundsEpoch,
  todayISO,
} from "./date-utils";

export type StudySessionSource = "focus-timer" | "manual";

export type StudySession = {
  id: string;
  lessonId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  source: StudySessionSource;
  cycleMode: "focus";
  timerPreset?: string;
  reviewTaskId?: string;
  createdAt: string;
};

export type NewStudySession = {
  id?: string;
  lessonId: string;
  endedAt?: string;
  durationSeconds: number;
  source: StudySessionSource;
  timerPreset?: string;
  reviewTaskId?: string;
};

export function createStableId(prefix = "session"): string {
  const randomId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${randomId}`;
}

export function createStudySession(input: NewStudySession): StudySession {
  const endedAtDate = input.endedAt ? new Date(input.endedAt) : new Date();
  const durationSeconds = Math.max(1, Math.round(input.durationSeconds));
  const startedAtDate = new Date(endedAtDate.getTime() - durationSeconds * 1000);
  const createdAt = new Date().toISOString();

  return {
    id: input.id ?? createStableId(),
    lessonId: input.lessonId,
    startedAt: startedAtDate.toISOString(),
    endedAt: endedAtDate.toISOString(),
    durationSeconds,
    source: input.source,
    cycleMode: "focus",
    timerPreset: input.timerPreset,
    reviewTaskId: input.reviewTaskId,
    createdAt,
  };
}

export function isValidStudySession(value: unknown): value is StudySession {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<StudySession>;
  if (
    typeof session.id !== "string" ||
    !session.id ||
    typeof session.lessonId !== "string" ||
    !session.lessonId ||
    typeof session.startedAt !== "string" ||
    typeof session.endedAt !== "string" ||
    typeof session.createdAt !== "string" ||
    typeof session.durationSeconds !== "number" ||
    !Number.isFinite(session.durationSeconds) ||
    session.durationSeconds <= 0 ||
    (session.source !== "focus-timer" && session.source !== "manual") ||
    session.cycleMode !== "focus"
  ) {
    return false;
  }

  const startedAt = Date.parse(session.startedAt);
  const endedAt = Date.parse(session.endedAt);
  const createdAt = Date.parse(session.createdAt);
  return (
    Number.isFinite(startedAt) &&
    Number.isFinite(endedAt) &&
    Number.isFinite(createdAt) &&
    endedAt >= startedAt &&
    session.durationSeconds <= Math.ceil((endedAt - startedAt) / 1000) + 1 &&
    (session.reviewTaskId === undefined ||
      (typeof session.reviewTaskId === "string" && session.reviewTaskId.startsWith("review:")))
  );
}

export function sanitizeStudySessions(value: unknown): StudySession[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const sessions: StudySession[] = [];
  for (const candidate of value) {
    if (!isValidStudySession(candidate) || seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    sessions.push(candidate);
  }
  return sessions;
}

// Active duration is placed at the end of the wall-clock interval. This excludes
// pauses while still allowing a session that crosses midnight to be split.
export function studySecondsOnDate(sessions: StudySession[], dateISO: string): number {
  if (!isDateISO(dateISO)) return 0;
  const { start, end } = localDayBoundsEpoch(dateISO);
  let total = 0;

  for (const session of sessions) {
    if (!isValidStudySession(session) || session.cycleMode !== "focus") continue;
    const endedAt = Date.parse(session.endedAt);
    const activeStart = endedAt - session.durationSeconds * 1000;
    const overlap = Math.max(0, Math.min(endedAt, end) - Math.max(activeStart, start));
    total += Math.round(overlap / 1000);
  }
  return total;
}

export function studyMinutesOnDate(sessions: StudySession[], dateISO = todayISO()): number {
  return Math.round(studySecondsOnDate(sessions, dateISO) / 60);
}

export function studyMinutesInWeek(
  sessions: StudySession[],
  referenceDateISO = todayISO(),
): number {
  const { startISO } = getLocalWeekRange(referenceDateISO);
  let seconds = 0;
  for (let offset = 0; offset < 7; offset++) {
    seconds += studySecondsOnDate(sessions, addDaysISO(startISO, offset));
  }
  return Math.round(seconds / 60);
}


export function reviewSecondsForTask(sessions: StudySession[], taskId: string): number {
  if (!taskId.startsWith("review:")) return 0;
  return sessions
    .filter((session) => session.reviewTaskId === taskId)
    .reduce((total, session) => total + session.durationSeconds, 0);
}

export function sessionsByLesson(sessions: StudySession[]): Record<string, StudySession[]> {
  const result: Record<string, StudySession[]> = {};
  for (const session of sessions) {
    (result[session.lessonId] ??= []).push(session);
  }
  return result;
}
