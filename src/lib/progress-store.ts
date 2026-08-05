import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ALL_LESSONS,
  HABITS,
  INITIAL_COMPLETED_LESSONS,
  INITIAL_LESSON_XP,
  type HabitColor,
  type HabitDef,
  type HabitIcon,
} from "./mock-data";
import {
  DEFAULT_PLANNER_SETTINGS,
  DEFAULT_STUDY_META,
  type PlannerSettings,
  type StudyMeta,
  reviewTaskId,
} from "./planner";
import { addDaysISO, isDateISO, todayISO } from "./date-utils";
import { normalizeDailyStudyHours } from "./study-hours";
import {
  createStableId,
  isValidStudySession,
  sanitizeStudySessions,
  type StudySession,
} from "./study-sessions";
import {
  loadStorage,
  writeJsonVerified,
  writeRawVerified,
  type StorageAdapter,
  type StorageLoadResult,
  type StorageWriteResult,
} from "./app-storage";
import {
  computeAchievementPoints,
  computeHabitStreak,
  computeStudyStreak,
  computeWeekStats,
  isStudyDay,
  getLevelFromXp,
  getXpProgressInCurrentLevel,
  studyMinutesOnDate,
  getLevelTitle,
  getXpForLevelStep,
  calculateSessionRewards,
  getWeekDates,
  weekStartISO,
} from "./progress-analytics";
import type {
  ClaimedRewardItem,
  CustomRewardItem,
  Goals,
  HabitEntry,
  ProgressState,
  Reminder,
  LessonCompletionReward,
} from "./progress-types";

export {
  computeHabitStreak,
  computeStudyStreak,
  computeWeekStats,
  getLevelTitle,
  getLevelFromXp,
  getXpProgressInCurrentLevel,
  getXpForLevelStep,
  calculateSessionRewards,
  studyMinutesOnDate,
  getWeekDates,
  isStudyDay,
  weekStartISO,
};
export type {
  ClaimedRewardItem,
  CustomRewardItem,
  Goals,
  HabitEntry,
  ProgressState,
  Reminder,
  LessonCompletionReward,
  WeekStats,
} from "./progress-types";

const DEFAULT_GOALS: Goals = {
  weeklyXp: 300,
  habitTargets: {
    water: 7,
    read: 5,
    move: 4,
    sleep: 6,
    meditate: 4,
    study: 5,
  },
};

const DEFAULT_REMINDERS: Record<string, Reminder> = {
  water: { enabled: false, time: "10:00" },
  read: { enabled: false, time: "20:30" },
  move: { enabled: false, time: "17:00" },
  sleep: { enabled: false, time: "22:30" },
  meditate: { enabled: false, time: "07:00" },
  study: { enabled: false, time: "19:00" },
};

export const SCHEMA_VERSION = 7;
export const LESSON_COMPLETION_BONUS_XP = 30;
export const LESSON_COMPLETION_COINS = 12;
export const PROGRESS_STORAGE_KEY = "hocvien-progress-v2";
export const PROGRESS_BACKUP_KEY = "hocvien-progress-v2-backup-before-v5";
export const UNDATED_COMPLETION = "undated";

export function createInitialProgressState(withDemoData = false): ProgressState {
  const completedLessons = withDemoData ? { ...INITIAL_COMPLETED_LESSONS } : {};
  const lessonXp = withDemoData ? { ...INITIAL_LESSON_XP } : {};
  return {
    completedLessons,
    reviewCompletions: {},
    lessonCompletionRewards: Object.fromEntries(
      Object.entries(lessonXp).map(([lessonId, xp]) => [lessonId, { xp, coins: 2 }]),
    ),
    lessonXp,
    habitLog: {},
    xp: Object.values(lessonXp).reduce((s, v) => s + v, 0),
    coins: Object.keys(completedLessons).length * 2,
    streakFreezeCount: 1,
    customRewards: [],
    claimedRewards: [],
    goals: { ...DEFAULT_GOALS, habitTargets: { ...DEFAULT_GOALS.habitTargets } },
    reminders: { ...DEFAULT_REMINDERS },
    plannerSettings: { ...DEFAULT_PLANNER_SETTINGS, dailyHours: {} },
    studyMeta: { ...DEFAULT_STUDY_META, actualMinutes: {} },
    studySessions: [],
    habitDefinitions: HABITS.map(cloneHabitDefinition),
    onboardingComplete: true,
    schemaVersion: SCHEMA_VERSION,
  };
}

const FIRST_RUN_DEFAULT: ProgressState = {
  ...createInitialProgressState(false),
  onboardingComplete: false,
};

export { todayISO } from "./date-utils";

export const emptyEntry = (definitions: HabitDef[] = HABITS): HabitEntry =>
  Object.fromEntries(
    definitions.map((definition) => [definition.id, definition.kind === "counter" ? 0 : false]),
  );

export type ProgressMigrationResult =
  | { ok: true; state: ProgressState; sourceVersion: number; needsBackup: boolean }
  | { ok: false; error: string };

// Pure migration. Corrupt roots are rejected so the caller never overwrites the
// only recoverable copy with first-run defaults.
export function migrateProgressState(raw: string | null): ProgressMigrationResult {
  if (raw == null) {
    return {
      ok: true,
      state: FIRST_RUN_DEFAULT,
      sourceVersion: SCHEMA_VERSION,
      needsBackup: false,
    };
  }
  let parsed: Record<string, unknown> | null = null;
  try {
    const j = JSON.parse(raw);
    if (j && typeof j === "object") parsed = j as Record<string, unknown>;
  } catch {
    return { ok: false, error: "Dữ liệu tiến độ hiện có không phải JSON hợp lệ." };
  }
  if (!parsed) return { ok: false, error: "Dữ liệu tiến độ không có cấu trúc hợp lệ." };
  const sourceVersion =
    typeof parsed.schemaVersion === "number" && Number.isInteger(parsed.schemaVersion)
      ? parsed.schemaVersion
      : 0;
  if (sourceVersion > SCHEMA_VERSION) {
    return {
      ok: false,
      error: `Dữ liệu dùng schema v${sourceVersion}, mới hơn phiên bản ứng dụng hỗ trợ.`,
    };
  }

  // completedLessons: legacy shape was Record<string, true>. Coerce to ISO map.
  const rawCompleted = (parsed.completedLessons as Record<string, unknown>) ?? {};
  const completedLessons: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawCompleted)) {
    if (isDateISO(v)) completedLessons[k] = v;
    else if (v === true || typeof v === "string") completedLessons[k] = UNDATED_COMPLETION;
  }
  const lessonXp: Record<string, number> = {};
  const rawXp = (parsed.lessonXp as Record<string, unknown>) ?? {};
  for (const [k, v] of Object.entries(rawXp)) {
    if (typeof v === "number") lessonXp[k] = v;
  }
  // Ensure xp exists for every completed lesson (fallback to lesson's canonical XP).
  const xpByLesson = new Map(ALL_LESSONS.map((l) => [l.id, l.xp] as const));
  for (const id of Object.keys(completedLessons)) {
    if (lessonXp[id] == null) lessonXp[id] = xpByLesson.get(id) ?? 20;
  }
  const habitLog = sanitizeHabitLog(parsed.habitLog);
  const habitDefinitions = sanitizeHabitDefinitions(parsed.habitDefinitions);
  const xpVal =
    typeof parsed.xp === "number" ? parsed.xp : Object.values(lessonXp).reduce((s, v) => s + v, 0);
  const coinsVal =
    typeof parsed.coins === "number" ? parsed.coins : Object.keys(completedLessons).length * 2;

  const goalsIn = (parsed.goals as Partial<Goals>) ?? {};
  const goals: Goals = {
    weeklyXp: typeof goalsIn.weeklyXp === "number" ? goalsIn.weeklyXp : DEFAULT_GOALS.weeklyXp,
    habitTargets: { ...DEFAULT_GOALS.habitTargets, ...(goalsIn.habitTargets ?? {}) },
  };
  const reminders: Record<string, Reminder> = {
    ...DEFAULT_REMINDERS,
    ...((parsed.reminders as Record<string, Reminder>) ?? {}),
  };

  const psIn = (parsed.plannerSettings as Partial<PlannerSettings>) ?? {};
  const storedDefaultDailyHours = normalizeStoredDailyHours(
    psIn.defaultDailyHours,
    DEFAULT_PLANNER_SETTINGS.defaultDailyHours,
  );
  const plannerSettings: PlannerSettings = {
    todayHours: normalizeStoredDailyHours(psIn.todayHours, storedDefaultDailyHours),
    dailyHours:
      psIn.dailyHours && typeof psIn.dailyHours === "object"
        ? sanitizeDailyHours(psIn.dailyHours)
        : {},
    defaultDailyHours: storedDefaultDailyHours,
    reviewShareMax:
      typeof psIn.reviewShareMax === "number"
        ? clamp(psIn.reviewShareMax, 0, 1)
        : DEFAULT_PLANNER_SETTINGS.reviewShareMax,
    reviewCapMinutes:
      typeof psIn.reviewCapMinutes === "number"
        ? Math.max(0, psIn.reviewCapMinutes)
        : DEFAULT_PLANNER_SETTINGS.reviewCapMinutes,
    subjectRotation: DEFAULT_PLANNER_SETTINGS.subjectRotation,
  };

  const smIn = (parsed.studyMeta as Partial<StudyMeta>) ?? {};
  const actualMinutesRaw = (smIn.actualMinutes as Record<string, unknown>) ?? {};
  const actualMinutes: Record<string, number[]> = {};
  for (const [k, v] of Object.entries(actualMinutesRaw)) {
    if (Array.isArray(v)) {
      actualMinutes[k] = v.filter(
        (n): n is number => typeof n === "number" && Number.isFinite(n) && n > 0,
      );
    }
  }
  const studyMeta: StudyMeta = {
    actualMinutes,
    fallbackMinutes:
      typeof smIn.fallbackMinutes === "number" && smIn.fallbackMinutes !== 75
        ? smIn.fallbackMinutes
        : DEFAULT_STUDY_META.fallbackMinutes,
    minPerLesson:
      typeof smIn.minPerLesson === "number" ? smIn.minPerLesson : DEFAULT_STUDY_META.minPerLesson,
    maxPerLesson:
      typeof smIn.maxPerLesson === "number" ? smIn.maxPerLesson : DEFAULT_STUDY_META.maxPerLesson,
  };

  const rawLessonCompletionRewards =
    parsed.lessonCompletionRewards && typeof parsed.lessonCompletionRewards === "object"
      ? (parsed.lessonCompletionRewards as Record<string, unknown>)
      : {};
  const lessonCompletionRewards: Record<string, LessonCompletionReward> = {};
  for (const [lessonId, rawReward] of Object.entries(rawLessonCompletionRewards)) {
    if (!completedLessons[lessonId] || !rawReward || typeof rawReward !== "object") continue;
    const reward = rawReward as Record<string, unknown>;
    if (
      typeof reward.xp === "number" &&
      Number.isFinite(reward.xp) &&
      reward.xp >= 0 &&
      typeof reward.coins === "number" &&
      Number.isFinite(reward.coins) &&
      reward.coins >= 0
    ) {
      lessonCompletionRewards[lessonId] = {
        xp: Math.round(reward.xp),
        coins: Math.round(reward.coins),
      };
    }
  }
  // Older schemas did not record the exact amount awarded per lesson. Preserve
  // their original accounting (canonical lesson XP + 2 coins) so undoing a
  // legacy completion never removes unrelated XP or coins.
  for (const lessonId of Object.keys(completedLessons)) {
    if (!lessonCompletionRewards[lessonId]) {
      lessonCompletionRewards[lessonId] = {
        xp: Math.max(0, Math.round(lessonXp[lessonId] ?? 0)),
        coins: 2,
      };
    }
  }

  const rawReviewCompletions =
    parsed.reviewCompletions && typeof parsed.reviewCompletions === "object"
      ? (parsed.reviewCompletions as Record<string, unknown>)
      : {};
  const reviewCompletions: Record<string, string> = {};
  for (const [taskId, completedOn] of Object.entries(rawReviewCompletions)) {
    if (taskId.startsWith("review:") && isDateISO(completedOn)) {
      reviewCompletions[taskId] = completedOn;
    }
  }

  const streakFreezeCount =
    typeof parsed.streakFreezeCount === "number" ? parsed.streakFreezeCount : 1;
  const customRewards = Array.isArray(parsed.customRewards) ? parsed.customRewards : [];
  const claimedRewards = Array.isArray(parsed.claimedRewards) ? parsed.claimedRewards : [];

  const state: ProgressState = {
    completedLessons,
    reviewCompletions,
    lessonCompletionRewards,
    lessonXp,
    habitLog,
    xp: xpVal,
    coins: coinsVal,
    streakFreezeCount,
    customRewards,
    claimedRewards,
    goals,
    reminders,
    plannerSettings,
    studyMeta,
    studySessions: sanitizeStudySessions(parsed.studySessions),
    habitDefinitions,
    onboardingComplete:
      typeof parsed.onboardingComplete === "boolean" ? parsed.onboardingComplete : true,
    schemaVersion: SCHEMA_VERSION,
  };
  return {
    ok: true,
    state,
    sourceVersion,
    needsBackup: sourceVersion < SCHEMA_VERSION,
  };
}

export function loadProgressStorage(
  storage?: StorageAdapter | null,
): StorageLoadResult<ProgressState> {
  return loadStorage(
    PROGRESS_STORAGE_KEY,
    (raw) => {
      const migrated = migrateProgressState(raw);
      if (!migrated.ok) throw new Error(migrated.error);
      return migrated.state;
    },
    storage,
  );
}

export function saveProgressStorage(
  state: ProgressState,
  storage?: StorageAdapter | null,
): StorageWriteResult {
  const current = loadProgressStorage(storage);
  if (current.status === "invalid") {
    return { ok: false, error: "Tiến độ hiện có không hợp lệ và chưa được ghi đè." };
  }
  if (current.status === "unavailable") return { ok: false, error: current.error };
  return writeJsonVerified(
    PROGRESS_STORAGE_KEY,
    state,
    (value) => migrateProgressState(JSON.stringify(value)).ok,
    storage,
  );
}

/** Pure candidate builder shared by the timer transaction and React store. */
export function appendStudySessionToProgress(
  current: ProgressState,
  session: StudySession,
): ProgressState {
  if (current.studySessions.some((candidate) => candidate.id === session.id)) return current;
  const minutes = Math.round((session.durationSeconds / 60) * 100) / 100;
  const samples = current.studyMeta.actualMinutes[session.lessonId] ?? [];
  return {
    ...current,
    studySessions: [...current.studySessions, session],
    studyMeta: {
      ...current.studyMeta,
      actualMinutes: {
        ...current.studyMeta.actualMinutes,
        [session.lessonId]: [...samples, minutes],
      },
    },
  };
}

export function getLessonCompletedSeconds(lessonId: string, state: ProgressState): number {
  if (state.studySessions && state.studySessions.length > 0) {
    const totalSeconds = state.studySessions
      .filter((session) => session.lessonId === lessonId)
      .reduce((sum, session) => sum + (session.durationSeconds || 0), 0);
    if (totalSeconds > 0) return totalSeconds;
  }
  const samples = state.studyMeta?.actualMinutes?.[lessonId];
  if (samples && samples.length > 0) {
    return Math.round(samples.reduce((acc, minutes) => acc + minutes, 0) * 60);
  }
  return 0;
}

export function getLessonCompletedMinutes(lessonId: string, state: ProgressState): number {
  return Math.round(getLessonCompletedSeconds(lessonId, state) / 60);
}

function cloneHabitDefinition(habit: HabitDef): HabitDef {
  return { ...habit, dailyTargets: [...habit.dailyTargets] as HabitDef["dailyTargets"] };
}

function sanitizeHabitDefinitions(value: unknown): HabitDef[] {
  if (!Array.isArray(value)) return HABITS.map(cloneHabitDefinition);
  if (value.length === 0) return [];
  const icons: HabitIcon[] = ["water", "book", "run", "sleep", "meditate", "study"];
  const colors: HabitColor[] = ["blue", "green", "amber", "coral"];
  const seen = new Set<string>();
  const definitions: HabitDef[] = [];
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") continue;
    const raw = candidate as Partial<HabitDef>;
    if (typeof raw.id !== "string" || !raw.id.trim() || seen.has(raw.id)) continue;
    if (typeof raw.name !== "string" || !raw.name.trim()) continue;
    const kind = raw.kind === "counter" ? "counter" : "toggle";
    const fallbackTarget = kind === "counter" ? 1 : 1;
    const target =
      typeof raw.target === "number" && Number.isFinite(raw.target)
        ? clamp(Math.round(raw.target), 1, 999)
        : fallbackTarget;
    const dailySource = Array.isArray(raw.dailyTargets) ? raw.dailyTargets : [];
    const dailyTargets = Array.from({ length: 7 }, (_, index) => {
      const item = dailySource[index];
      if (typeof item !== "number" || !Number.isFinite(item)) return target;
      return clamp(Math.round(item), 0, 999);
    }) as HabitDef["dailyTargets"];
    definitions.push({
      id: raw.id,
      name: raw.name.trim(),
      kind,
      target,
      icon: icons.includes(raw.icon as HabitIcon) ? (raw.icon as HabitIcon) : "study",
      color: colors.includes(raw.color as HabitColor) ? (raw.color as HabitColor) : "green",
      archived: raw.archived === true,
      dailyTargets,
    });
    seen.add(raw.id);
  }
  return definitions.length > 0 ? definitions : HABITS.map(cloneHabitDefinition);
}

function sanitizeHabitLog(value: unknown): Record<string, HabitEntry> {
  if (!value || typeof value !== "object") return {};
  const result: Record<string, HabitEntry> = {};
  for (const [dateISO, rawEntry] of Object.entries(value)) {
    if (!isDateISO(dateISO) || !rawEntry || typeof rawEntry !== "object") continue;
    const entry: HabitEntry = {};
    for (const [habitId, rawValue] of Object.entries(rawEntry)) {
      if (typeof rawValue === "boolean") entry[habitId] = rawValue;
      if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
        entry[habitId] = Math.max(0, rawValue);
      }
    }
    result[dateISO] = entry;
  }
  return result;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
function normalizeStoredDailyHours(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return normalizeDailyStudyHours(fallback);
  }
  return normalizeDailyStudyHours(value);
}

function sanitizeDailyHours(raw: Record<string, unknown>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [dateISO, value] of Object.entries(raw)) {
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    out[dateISO] = normalizeDailyStudyHours(value);
  }
  return out;
}

export function completeLessonCompletionState(
  state: ProgressState,
  lessonId: string,
  lessonXp: number,
  completedOn = todayISO(),
): ProgressState {
  if (state.completedLessons[lessonId]) return state;
  return toggleLessonCompletionState(state, lessonId, lessonXp, completedOn);
}

export function toggleLessonCompletionState(
  state: ProgressState,
  lessonId: string,
  lessonXp: number,
  completedOn = todayISO(),
): ProgressState {
  const done = Boolean(state.completedLessons[lessonId]);
  const nextLessons = { ...state.completedLessons };
  const nextXpByLesson = { ...state.lessonXp };
  const nextRewards = { ...(state.lessonCompletionRewards ?? {}) };
  const normalizedLessonXp = Math.max(0, Math.round(lessonXp));
  const newReward: LessonCompletionReward = {
    xp: normalizedLessonXp + LESSON_COMPLETION_BONUS_XP,
    coins: LESSON_COMPLETION_COINS,
  };
  const recordedReward = nextRewards[lessonId] ?? {
    xp: Math.max(0, Math.round(nextXpByLesson[lessonId] ?? normalizedLessonXp)),
    coins: 2,
  };

  if (done) {
    delete nextLessons[lessonId];
    delete nextXpByLesson[lessonId];
    delete nextRewards[lessonId];
  } else {
    nextLessons[lessonId] = completedOn;
    nextXpByLesson[lessonId] = normalizedLessonXp;
    nextRewards[lessonId] = newReward;
  }

  const rewardDelta = done ? recordedReward : newReward;
  return {
    ...state,
    completedLessons: nextLessons,
    lessonCompletionRewards: nextRewards,
    lessonXp: nextXpByLesson,
    xp: Math.max(0, state.xp + (done ? -rewardDelta.xp : rewardDelta.xp)),
    coins: Math.max(0, state.coins + (done ? -rewardDelta.coins : rewardDelta.coins)),
  };
}

export function setTodayHoursState(
  state: ProgressState,
  hours: number,
  dateISO = todayISO(),
): ProgressState {
  const normalized = normalizeDailyStudyHours(hours);
  return {
    ...state,
    plannerSettings: {
      ...state.plannerSettings,
      todayHours: normalized,
      dailyHours: { ...state.plannerSettings.dailyHours, [dateISO]: normalized },
    },
  };
}

export function setDayHoursState(
  state: ProgressState,
  dateISO: string,
  hours: number | null,
  todayDateISO = todayISO(),
): ProgressState {
  const dailyHours = { ...state.plannerSettings.dailyHours };
  if (hours == null) delete dailyHours[dateISO];
  else dailyHours[dateISO] = normalizeDailyStudyHours(hours);

  return {
    ...state,
    plannerSettings: {
      ...state.plannerSettings,
      todayHours:
        dateISO === todayDateISO
          ? hours == null
            ? state.plannerSettings.defaultDailyHours
            : normalizeDailyStudyHours(hours)
          : state.plannerSettings.todayHours,
      dailyHours,
    },
  };
}

export function setDefaultDailyHoursState(state: ProgressState, hours: number): ProgressState {
  return {
    ...state,
    plannerSettings: {
      ...state.plannerSettings,
      defaultDailyHours: normalizeDailyStudyHours(hours),
    },
  };
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(FIRST_RUN_DEFAULT);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [storageStatus, setStorageStatus] = useState<StorageLoadResult<ProgressState>>({
    status: "missing",
  });
  const stateRef = useRef(state);
  const persistenceEnabled = useRef(false);

  useEffect(() => {
    // Keep all reads and migration backups behind app-storage.  In particular,
    // do not turn a failed backup into a normal writable state.
    const rawProgress = loadStorage(PROGRESS_STORAGE_KEY, (raw) => raw);
    if (rawProgress.status === "unavailable") {
      setStorageStatus(rawProgress);
      setStorageError(rawProgress.error);
      setHydrated(true);
      return;
    }

    const raw = rawProgress.status === "ok" ? rawProgress.value : null;
    const migrated = migrateProgressState(raw);
    if (!migrated.ok) {
      const invalid: StorageLoadResult<ProgressState> = {
        status: "invalid",
        raw: raw ?? "",
        error: migrated.error,
      };
      setStorageStatus(invalid);
      setStorageError(
        `${migrated.error} Bản gốc vẫn được giữ nguyên; ứng dụng sẽ không tự ghi đè dữ liệu.`,
      );
      setHydrated(true);
      return;
    }

    if (raw != null && migrated.needsBackup) {
      const backup = loadStorage(PROGRESS_BACKUP_KEY, (value) => value);
      if (backup.status === "unavailable") {
        setStorageStatus(backup);
        setStorageError(
          "Không thể xác nhận bản sao an toàn trước migration. Dữ liệu cũ vẫn được giữ nguyên.",
        );
        setHydrated(true);
        return;
      }
      if (backup.status === "missing") {
        const backedUp = writeRawVerified(PROGRESS_BACKUP_KEY, raw);
        if (!backedUp.ok) {
          setStorageStatus({ status: "unavailable", error: backedUp.error });
          setStorageError(
            "Không thể tạo bản sao an toàn trước migration. Dữ liệu cũ vẫn được giữ nguyên.",
          );
          setHydrated(true);
          return;
        }
      }
    }

    setStorageStatus(raw == null ? { status: "missing" } : { status: "ok", value: migrated.state });
    setState(migrated.state);
    stateRef.current = migrated.state;
    persistenceEnabled.current = true;
    setHydrated(true);
  }, []);

  const retryStorage = useCallback(() => {
    const loaded = loadProgressStorage();
    setStorageStatus(loaded);
    if (loaded.status === "ok") {
      stateRef.current = loaded.value;
      setState(loaded.value);
      persistenceEnabled.current = true;
      setStorageError(null);
      return true;
    }
    if (loaded.status === "missing") {
      stateRef.current = FIRST_RUN_DEFAULT;
      setState(FIRST_RUN_DEFAULT);
      persistenceEnabled.current = true;
      setStorageError(null);
      return true;
    }
    persistenceEnabled.current = false;
    setStorageError(loaded.error);
    return false;
  }, []);

  const commit = useCallback((update: (current: ProgressState) => ProgressState): boolean => {
    if (!persistenceEnabled.current) {
      setStorageError("Bộ nhớ trình duyệt chưa sẵn sàng; thay đổi chưa được áp dụng.");
      return false;
    }
    const next = update(stateRef.current);
    const saved = saveProgressStorage(next);
    if (!saved.ok) {
      persistenceEnabled.current = false;
      setStorageStatus({ status: "unavailable", error: saved.error });
      setStorageError(`${saved.error} Thay đổi chưa được áp dụng.`);
      return false;
    }
    stateRef.current = next;
    setState(next);
    return true;
  }, []);

  const toggleLesson = useCallback(
    (lessonId: string, xp: number) => {
      return commit((state) => toggleLessonCompletionState(state, lessonId, xp));
    },
    [commit],
  );

  const completeLesson = useCallback(
    (lessonId: string, xp: number) => {
      return commit((state) => completeLessonCompletionState(state, lessonId, xp));
    },
    [commit],
  );

  const toggleReview = useCallback(
    (lessonId: string, dateISO = todayISO()) => {
      const taskId = reviewTaskId(lessonId, dateISO);
      return commit((state) => {
        const next = { ...(state.reviewCompletions ?? {}) };
        if (next[taskId]) delete next[taskId];
        else next[taskId] = dateISO;
        return { ...state, reviewCompletions: next };
      });
    },
    [commit],
  );

  const completeReview = useCallback(
    (taskId: string) => {
      if (!taskId.startsWith("review:")) return false;
      return commit((state) => {
        if (state.reviewCompletions?.[taskId]) return state;
        return {
          ...state,
          reviewCompletions: {
            ...(state.reviewCompletions ?? {}),
            [taskId]: todayISO(),
          },
        };
      });
    },
    [commit],
  );

  const updateHabit = useCallback(
    (patch: HabitEntry) => {
      const day = todayISO();
      return commit((s) => {
        const cur = s.habitLog[day] ?? emptyEntry(s.habitDefinitions);
        const merged = { ...cur, ...patch };
        return { ...s, habitLog: { ...s.habitLog, [day]: merged } };
      });
    },
    [commit],
  );

  const initializeProgress = useCallback(
    (useDemoData: boolean) => {
      return commit(() => createInitialProgressState(useDemoData));
    },
    [commit],
  );

  const resetOnboarding = useCallback(() => {
    return commit((s) => ({ ...s, onboardingComplete: false }));
  }, [commit]);

  const saveHabitDefinition = useCallback(
    (definition: Omit<HabitDef, "id"> & { id?: string }) => {
      return commit((current) => {
        const id = definition.id?.trim() || createStableId("habit");
        const nextDefinition = sanitizeHabitDefinitions([{ ...definition, id }])[0];
        const exists = current.habitDefinitions.some((habit) => habit.id === id);
        const weeklyTarget = nextDefinition.dailyTargets.filter((target) => target > 0).length;
        return {
          ...current,
          goals: exists
            ? current.goals
            : {
                ...current.goals,
                habitTargets: { ...current.goals.habitTargets, [id]: weeklyTarget },
              },
          reminders: exists
            ? current.reminders
            : {
                ...current.reminders,
                [id]: { enabled: false, time: "09:00" },
              },
          habitDefinitions: exists
            ? current.habitDefinitions.map((habit) => (habit.id === id ? nextDefinition : habit))
            : [...current.habitDefinitions, nextDefinition],
        };
      });
    },
    [commit],
  );

  const archiveHabit = useCallback(
    (habitId: string, archived: boolean) => {
      return commit((current) => ({
        ...current,
        habitDefinitions: current.habitDefinitions.map((habit) =>
          habit.id === habitId ? { ...habit, archived } : habit,
        ),
      }));
    },
    [commit],
  );

  const deleteHabit = useCallback(
    (habitId: string) => {
      return commit((current) => {
        const goals = { ...current.goals, habitTargets: { ...current.goals.habitTargets } };
        delete goals.habitTargets[habitId];
        const reminders = { ...current.reminders };
        delete reminders[habitId];
        return {
          ...current,
          goals,
          reminders,
          habitDefinitions: current.habitDefinitions.filter((habit) => habit.id !== habitId),
        };
      });
    },
    [commit],
  );

  const setGoals = useCallback(
    (patch: Partial<Goals>) => {
      return commit((s) => ({
        ...s,
        goals: {
          ...s.goals,
          ...patch,
          habitTargets: { ...s.goals.habitTargets, ...(patch.habitTargets ?? {}) },
        },
      }));
    },
    [commit],
  );

  const setReminder = useCallback(
    (habitId: string, patch: Partial<Reminder>) => {
      return commit((s) => ({
        ...s,
        reminders: {
          ...s.reminders,
          [habitId]: { ...(s.reminders[habitId] ?? { enabled: false, time: "09:00" }), ...patch },
        },
      }));
    },
    [commit],
  );

  const setTodayHours = useCallback(
    (hours: number) => commit((state) => setTodayHoursState(state, hours)),
    [commit],
  );

  const setDayHours = useCallback(
    (dateISO: string, hours: number | null) =>
      commit((state) => setDayHoursState(state, dateISO, hours)),
    [commit],
  );

  const setDefaultDailyHours = useCallback(
    (hours: number) => commit((state) => setDefaultDailyHoursState(state, hours)),
    [commit],
  );

  const addStudySession = useCallback(
    (session: StudySession) => {
      if (!isValidStudySession(session)) return false;
      // The timer's two-key transaction persists progress before notifying this
      // hook.  Reconcile that verified raw state without issuing a second,
      // non-atomic write, then let ordinary callers use commit-after-persist.
      const persisted = loadProgressStorage();
      if (
        persisted.status === "ok" &&
        persisted.value.studySessions.some((candidate) => candidate.id === session.id)
      ) {
        stateRef.current = persisted.value;
        setState(persisted.value);
        return true;
      }
      return commit((current) => {
        return appendStudySessionToProgress(current, session);
      });
    },
    [commit],
  );

  const today = state.habitLog[todayISO()] ?? emptyEntry(state.habitDefinitions);

  const streak = useMemo(() => computeHabitStreak(state), [state]);

  const studyStreak = useMemo(() => computeStudyStreak(state), [state]);

  const weekStats = useMemo(() => computeWeekStats(state), [state]);
  const userLevel = useMemo(() => getLevelFromXp(state.xp), [state.xp]);
  const xpProgress = useMemo(() => getXpProgressInCurrentLevel(state.xp), [state.xp]);
  const level = userLevel;
  const xpInLevel = xpProgress.currentLevelXp;
  const achievementPoints = useMemo(() => computeAchievementPoints(state), [state]);
  const pointsInLevel = achievementPoints % 3;
  const todayStudyMinutes = useMemo(
    () => studyMinutesOnDate(state.studySessions, todayISO()),
    [state.studySessions],
  );

  const spendCoins = useCallback(
    (amount: number): boolean => {
      if (stateRef.current.coins < amount) return false;
      return commit((s) => ({
        ...s,
        coins: Math.max(0, s.coins - amount),
      }));
    },
    [commit],
  );

  const addRewards = useCallback(
    (params: { xp: number; coins: number }) => {
      let leveledUp = false;
      let newLevel = 1;
      let oldLevel = 1;

      const success = commit((s) => {
        const oldXp = s.xp;
        oldLevel = getLevelFromXp(oldXp);
        const nextXp = s.xp + Math.max(0, params.xp);
        const nextCoins = s.coins + Math.max(0, params.coins);
        newLevel = getLevelFromXp(nextXp);

        if (newLevel > oldLevel) {
          leveledUp = true;
        }

        const nextState: ProgressState = {
          ...s,
          xp: nextXp,
          coins: nextCoins,
        };

        return nextState;
      });

      return { ok: success, leveledUp, newLevel, oldLevel };
    },
    [commit],
  );

  const buyStreakFreeze = useCallback(() => {
    if (stateRef.current.coins < 50) return false;
    return commit((s) => {
      return {
        ...s,
        coins: s.coins - 50,
        streakFreezeCount: s.streakFreezeCount + 1,
      };
    });
  }, [commit]);

  const claimReward = useCallback(
    (reward: { id: string; title: string; cost: number }) => {
      if (stateRef.current.coins < reward.cost) return false;
      return commit((s) => {
        const claimedItem: ClaimedRewardItem = {
          id: createStableId("claim"),
          title: reward.title,
          cost: reward.cost,
          dateISO: todayISO(),
        };
        return {
          ...s,
          coins: s.coins - reward.cost,
          claimedRewards: [claimedItem, ...s.claimedRewards],
        };
      });
    },
    [commit],
  );

  const addCustomReward = useCallback(
    (reward: { title: string; cost: number; icon: string }) => {
      return commit((s) => {
        const item: CustomRewardItem = {
          id: createStableId("reward"),
          title: reward.title,
          cost: reward.cost,
          icon: reward.icon,
        };
        return {
          ...s,
          customRewards: [...s.customRewards, item],
        };
      });
    },
    [commit],
  );

  return {
    state,
    hydrated,
    storageError,
    storageStatus,
    retryStorage,
    today,
    streak,
    studyStreak,
    currentStreak: studyStreak,
    level: userLevel,
    userLevel,
    userXp: state.xp,
    userCoins: state.coins,
    todayStudyMinutes,
    xpProgress,
    achievementPoints,
    pointsInLevel,
    xpInLevel,
    weekStats,
    addRewards,
    spendCoins,
    buyStreakFreeze,
    claimReward,
    addCustomReward,
    toggleLesson,
    completeLesson,
    toggleReview,
    completeReview,
    updateHabit,
    setGoals,
    setReminder,
    setTodayHours,
    setDayHours,
    setDefaultDailyHours,
    addStudySession,
    initializeProgress,
    resetOnboarding,
    saveHabitDefinition,
    archiveHabit,
    deleteHabit,
  };
}
