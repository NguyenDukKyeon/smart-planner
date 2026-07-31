import { createStableId, isValidStudySession, type StudySession } from "./study-sessions";
import { loadFocusPreferences } from "./focus-preferences";
import {
  appendStudySessionToProgress,
  createInitialProgressState,
  loadProgressStorage,
  PROGRESS_STORAGE_KEY,
} from "./progress-store";
import {
  FOCUS_TIMER_SESSION_ROLLBACK_KEY,
  getBrowserStorage,
  loadStorage,
  replaceRawValuesSafely,
  writeJsonVerified,
  writeRawVerified,
  type StorageAdapter,
  type StorageLoadResult,
  type StorageTransactionResult,
  type StorageWriteResult,
} from "./app-storage";

export const TIMER_KEY = "hocvien-focus-timer-v2";
export const FOCUS_TIMER_OPEN_EVENT = "hocvien-focus-timer-open";
export const TIMER_LOCK_KEY = "hocvien-focus-timer-lock-v1";
const TIMER_LOCK_TTL_MS = 12_000;

export type TimerMode = "pomodoro" | "shortBreak" | "longBreak";
export type FocusDisplayMode = "mini" | "dialog" | "studio";
export type AmbientSoundType = "none" | "rain" | "whiteNoise" | "cafe" | "binaural";

export type FocusPreset = {
  id: string;
  label: string;
  focusMins: number;
  shortBreakMins: number;
  longBreakMins: number;
  description: string;
};

export const FOCUS_PRESETS: FocusPreset[] = [
  {
    id: "2-0",
    label: "⚡ Khởi động · 2 phút",
    focusMins: 2,
    shortBreakMins: 0,
    longBreakMins: 0,
    description: "Bắt đầu thật nhẹ, không tạo giờ nghỉ tự động.",
  },
  {
    id: "25-5",
    label: "🍅 Pomodoro · 25 / 5",
    focusMins: 25,
    shortBreakMins: 5,
    longBreakMins: 15,
    description: "25 phút học · 5 phút nghỉ ngắn · 15 phút nghỉ dài.",
  },
  {
    id: "50-10",
    label: "🧠 Deep Work · 50 / 10",
    focusMins: 50,
    shortBreakMins: 10,
    longBreakMins: 20,
    description: "50 phút tập trung sâu · 10 phút nghỉ ngắn · 20 phút nghỉ dài.",
  },
  {
    id: "90-15",
    label: "🚀 Siêu tập trung · 90 / 15",
    focusMins: 90,
    shortBreakMins: 15,
    longBreakMins: 30,
    description: "90 phút tập trung · 15 phút nghỉ ngắn · 30 phút nghỉ dài.",
  },
];

export type StoredTimerState = {
  lessonId: string;
  lessonTitle: string;
  timerMode: TimerMode;
  durationMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakTargetCycles: number;
  lastFocusDuration: number;
  isRunning: boolean;
  displayMode: FocusDisplayMode;
  /** @deprecated Kept for backward compatibility with older saved states. */
  isMinimized: boolean;
  startTimestamp: number | null;
  accumulatedSeconds: number;
  completedPomodoros: number;
  ambientSound: AmbientSoundType;
  isCompleted?: boolean;
  targetMinutes?: number;
  reviewTaskId?: string;
  reviewTargetMinutes?: number;
  activeTimerSessionId: string;
  savedSessionIds: string[];
  status:
    | "idle"
    | "running"
    | "paused"
    | "saving"
    | "completed"
    | "expired"
    | "warmup_completed"
    | "breaking"
    | "session_waiting";
  activePresetId?: string;
  pendingPresetId?: string;
  expiredAt?: string;
};

export type FocusSessionRewards = {
  xp: number;
  coins: number;
};

export type FocusSessionCommitResult =
  | (Extract<StorageTransactionResult, { ok: true }> & {
      sessionAdded: boolean;
      rewardsApplied: boolean;
      previousXp: number;
      nextXp: number;
    })
  | Extract<StorageTransactionResult, { ok: false }>;

export const MODE_DEFAULTS: Record<TimerMode, { title: string; minutes: number; emoji: string }> = {
  pomodoro: { title: "Tập trung", minutes: 50, emoji: "🍅" },
  shortBreak: { title: "Nghỉ ngắn", minutes: 10, emoji: "☕" },
  longBreak: { title: "Nghỉ dài", minutes: 15, emoji: "🌴" },
};

export function createStoredTimerState(
  lessonId: string,
  lessonTitle: string,
  isCompleted = false,
): StoredTimerState {
  const preferences = loadFocusPreferences();
  const shortBreakMinutes =
    preferences.defaultFocusMinutes === 25 ? 5 : preferences.defaultFocusMinutes === 50 ? 10 : 15;
  const longBreakMinutes =
    preferences.defaultFocusMinutes === 25 ? 15 : preferences.defaultFocusMinutes === 50 ? 20 : 30;
  return {
    lessonId,
    lessonTitle,
    timerMode: "pomodoro",
    durationMinutes: preferences.defaultFocusMinutes,
    shortBreakMinutes,
    longBreakMinutes,
    longBreakTargetCycles: 4,
    lastFocusDuration: preferences.defaultFocusMinutes,
    isRunning: false,
    displayMode: "dialog",
    isMinimized: false,
    startTimestamp: null,
    accumulatedSeconds: 0,
    completedPomodoros: 0,
    ambientSound: "none",
    isCompleted,
    activeTimerSessionId: createStableId("timer"),
    savedSessionIds: [],
    status: "idle",
    activePresetId: `${preferences.defaultFocusMinutes}-${shortBreakMinutes}`,
  };
}

export function createStartedFocusTimerState(
  current: StoredTimerState,
  durationMinutes: number,
  now = Date.now(),
): StoredTimerState {
  const normalizedMinutes = Math.max(1, Math.round(durationMinutes));
  return {
    ...current,
    timerMode: "pomodoro",
    durationMinutes: normalizedMinutes,
    lastFocusDuration: normalizedMinutes,
    isRunning: true,
    displayMode: current.displayMode === "mini" ? "dialog" : current.displayMode,
    isMinimized: false,
    startTimestamp: now,
    accumulatedSeconds: 0,
    activeTimerSessionId: createStableId("timer"),
    status: "running",
    expiredAt: undefined,
  };
}

export function getSmartBreakMinutes(focusMinutes: number): number | null {
  if (focusMinutes <= 2) return null;
  if (focusMinutes <= 25) return 5;
  if (focusMinutes <= 50) return 10;
  return 15;
}

export function sendDesktopNotification(title: string, body: string) {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      try {
        const notif = new Notification(title, {
          body,
          tag: "pomodoro-timer",
          requireInteraction: true,
        });
        notif.onclick = () => {
          window.focus();
        };
      } catch {
        // ignore
      }
    }
  }
}

export function loadStoredTimerState(
  storage: StorageAdapter | null = getBrowserStorage(),
): StorageLoadResult<StoredTimerState> {
  return loadStorage(TIMER_KEY, (raw) => normalizeStoredTimerState(JSON.parse(raw)), storage);
}

export function getStoredTimerState(): StoredTimerState | null {
  const loaded = loadStoredTimerState();
  return loaded.status === "ok" ? loaded.value : null;
}

export function normalizeStoredTimerState(value: unknown): StoredTimerState | null {
  if (!value || typeof value !== "object") return null;
  const parsed = value as Record<string, unknown>;
  if (typeof parsed.lessonId !== "string" || typeof parsed.lessonTitle !== "string") return null;

  const timerMode: TimerMode =
    parsed.timerMode === "shortBreak" || parsed.timerMode === "longBreak"
      ? parsed.timerMode
      : "pomodoro";
  const durationMinutes = finitePositiveNumber(parsed.durationMinutes, 50);
  const lastFocusDuration = finitePositiveNumber(parsed.lastFocusDuration, durationMinutes);
  const inferredStatus =
    parsed.isRunning === true
      ? "running"
      : finiteNonNegativeNumber(parsed.accumulatedSeconds, 0) > 0
        ? "paused"
        : "idle";
  const allowedStatuses = new Set<StoredTimerState["status"]>([
    "idle",
    "running",
    "paused",
    "saving",
    "completed",
    "expired",
    "warmup_completed",
    "breaking",
    "session_waiting",
  ]);
  const status =
    typeof parsed.status === "string" && allowedStatuses.has(parsed.status as StoredTimerState["status"])
      ? (parsed.status as StoredTimerState["status"])
      : inferredStatus;
  const ambientSound: AmbientSoundType =
    parsed.ambientSound === "rain" ||
    parsed.ambientSound === "whiteNoise" ||
    parsed.ambientSound === "cafe" ||
    parsed.ambientSound === "binaural"
      ? parsed.ambientSound
      : "none";
  const displayMode: FocusDisplayMode =
    parsed.displayMode === "mini" ||
    parsed.displayMode === "dialog" ||
    parsed.displayMode === "studio"
      ? parsed.displayMode
      : parsed.isMinimized === true
        ? "mini"
        : "dialog";

  return {
    lessonId: parsed.lessonId,
    lessonTitle: parsed.lessonTitle,
    timerMode,
    durationMinutes,
    shortBreakMinutes: finiteNonNegativeNumber(parsed.shortBreakMinutes, 10),
    longBreakMinutes: finiteNonNegativeNumber(parsed.longBreakMinutes, 15),
    longBreakTargetCycles: Math.max(1, Math.round(finitePositiveNumber(parsed.longBreakTargetCycles, 4))),
    lastFocusDuration,
    isRunning: parsed.isRunning === true,
    displayMode,
    isMinimized: displayMode === "mini",
    startTimestamp:
      typeof parsed.startTimestamp === "number" && Number.isFinite(parsed.startTimestamp)
        ? parsed.startTimestamp
        : null,
    accumulatedSeconds: finiteNonNegativeNumber(parsed.accumulatedSeconds, 0),
    completedPomodoros: Math.max(0, Math.round(finiteNonNegativeNumber(parsed.completedPomodoros, 0))),
    ambientSound,
    isCompleted: typeof parsed.isCompleted === "boolean" ? parsed.isCompleted : undefined,
    targetMinutes:
      typeof parsed.targetMinutes === "number" && Number.isFinite(parsed.targetMinutes) && parsed.targetMinutes > 0
        ? parsed.targetMinutes
        : undefined,
    reviewTaskId:
      typeof parsed.reviewTaskId === "string" && parsed.reviewTaskId.startsWith("review:")
        ? parsed.reviewTaskId
        : undefined,
    reviewTargetMinutes:
      typeof parsed.reviewTargetMinutes === "number" &&
      Number.isFinite(parsed.reviewTargetMinutes) &&
      parsed.reviewTargetMinutes > 0
        ? parsed.reviewTargetMinutes
        : undefined,
    activeTimerSessionId:
      typeof parsed.activeTimerSessionId === "string" && parsed.activeTimerSessionId
        ? parsed.activeTimerSessionId
        : createStableId("timer"),
    savedSessionIds: Array.isArray(parsed.savedSessionIds)
      ? parsed.savedSessionIds.filter((id): id is string => typeof id === "string").slice(-100)
      : [],
    status,
    activePresetId: typeof parsed.activePresetId === "string" ? parsed.activePresetId : undefined,
    pendingPresetId: typeof parsed.pendingPresetId === "string" ? parsed.pendingPresetId : undefined,
    expiredAt: typeof parsed.expiredAt === "string" ? parsed.expiredAt : undefined,
  };
}

function finitePositiveNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

function finiteNonNegativeNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}

export function saveStoredTimerState(
  state: StoredTimerState | null,
  storage: StorageAdapter | null = getBrowserStorage(),
): StorageWriteResult {
  const current = loadStoredTimerState(storage);
  if (current.status === "invalid") {
    return { ok: false, error: "Trạng thái hẹn giờ hiện có không hợp lệ và chưa được ghi đè." };
  }
  if (current.status === "unavailable") return { ok: false, error: current.error };
  if (state == null) return writeRawVerified(TIMER_KEY, null, storage);
  return writeJsonVerified(
    TIMER_KEY,
    state,
    (value) => normalizeStoredTimerState(value) !== null,
    storage,
  );
}

/**
 * A focus session is only terminal after both its progress record and its
 * timer acknowledgement have been confirmed.  The caller must not commit the
 * candidate timer state (including `savedSessionIds`) when this returns false.
 */
export function recordFocusSessionAndTimerStateAtomically(
  session: StudySession,
  nextTimerState: StoredTimerState,
  rewardsOrStorage?: FocusSessionRewards | StorageAdapter | null,
  explicitStorage?: StorageAdapter | null,
): FocusSessionCommitResult {
  const rewards =
    rewardsOrStorage && "xp" in rewardsOrStorage && "coins" in rewardsOrStorage
      ? rewardsOrStorage
      : undefined;
  const storage =
    rewardsOrStorage && "getItem" in rewardsOrStorage
      ? rewardsOrStorage
      : (explicitStorage ?? getBrowserStorage());
  if (!isValidStudySession(session)) {
    return { ok: false, error: "Focus session is invalid." };
  }
  const currentProgress = loadProgressStorage(storage);
  if (currentProgress.status === "invalid" || currentProgress.status === "unavailable") {
    return { ok: false, error: currentProgress.error };
  }
  const currentTimer = loadStoredTimerState(storage);
  if (currentTimer.status === "invalid" || currentTimer.status === "unavailable") {
    return { ok: false, error: currentTimer.error };
  }
  const baseProgress =
    currentProgress.status === "ok" ? currentProgress.value : createInitialProgressState(false);
  const sessionAdded = !baseProgress.studySessions.some((candidate) => candidate.id === session.id);
  const rewardsApplied = sessionAdded && Boolean(rewards);
  const withSession = appendStudySessionToProgress(baseProgress, session);
  const nextProgress = rewardsApplied
    ? {
        ...withSession,
        xp: withSession.xp + Math.max(0, rewards?.xp ?? 0),
        coins: withSession.coins + Math.max(0, rewards?.coins ?? 0),
      }
    : withSession;
  let progressRaw: string;
  let timerRaw: string;
  try {
    progressRaw = JSON.stringify(nextProgress);
    timerRaw = JSON.stringify(nextTimerState);
  } catch {
    return { ok: false, error: "Cannot serialize the focus-session transaction." };
  }
  // Progress is written before the timer acknowledgement.  A failed timer
  // write restores both raw preimages from this verified snapshot.
  const transaction = replaceRawValuesSafely(
    FOCUS_TIMER_SESSION_ROLLBACK_KEY,
    [
      { key: PROGRESS_STORAGE_KEY, raw: progressRaw },
      { key: TIMER_KEY, raw: timerRaw },
    ],
    storage,
  );
  if (!transaction.ok) return transaction;
  return {
    ...transaction,
    sessionAdded,
    rewardsApplied,
    previousXp: baseProgress.xp,
    nextXp: nextProgress.xp,
  };
}

export function recordSessionThenPersistTimerState(
  session: StudySession,
  recordSession: (session: StudySession) => boolean,
  nextTimerState: StoredTimerState,
  persistTimerState: (state: StoredTimerState) => StorageWriteResult = saveStoredTimerState,
): StorageWriteResult {
  // Kept only as a fail-closed compatibility boundary.  Production timer
  // paths must use recordFocusSessionAndTimerStateAtomically above.
  void session;
  void recordSession;
  void nextTimerState;
  void persistTimerState;
  return { ok: false, error: "Non-atomic timer persistence is disabled." };
  /*
  try {
    if (!recordSession(session)) {
      return { ok: false, error: "Không thể xác nhận phiên tập trung đã được lưu." };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Không thể lưu phiên tập trung.",
    };
  }
  return persistTimerState(nextTimerState);
  */
}

type TimerLock = {
  ownerId: string;
  sessionId: string;
  expiresAt: number;
};

export function getTimerTabId(): string {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") return "server";
  const key = "hocvien-focus-timer-tab-id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = createStableId("tab");
  sessionStorage.setItem(key, id);
  return id;
}

function normalizeTimerLock(value: unknown): TimerLock | null {
  if (!value || typeof value !== "object") return null;
  const parsed = value as Partial<TimerLock>;
  if (
    typeof parsed.ownerId !== "string" ||
    typeof parsed.sessionId !== "string" ||
    typeof parsed.expiresAt !== "number" ||
    !Number.isFinite(parsed.expiresAt)
  ) {
    return null;
  }
  return parsed as TimerLock;
}

export function loadTimerLock(): StorageLoadResult<TimerLock> {
  return loadStorage(TIMER_LOCK_KEY, (raw) => normalizeTimerLock(JSON.parse(raw)));
}

function readTimerLock(): TimerLock | null {
  const loaded = loadTimerLock();
  return loaded.status === "ok" ? loaded.value : null;
}

export function acquireTimerLock(sessionId: string, ownerId = getTimerTabId()): boolean {
  try {
    const now = Date.now();
    const loaded = loadTimerLock();
    if (loaded.status === "invalid" || loaded.status === "unavailable") return false;
    const current = loaded.status === "ok" ? loaded.value : null;
    if (current && current.expiresAt > now && current.ownerId !== ownerId) return false;
    const next: TimerLock = {
      ownerId,
      sessionId,
      expiresAt: now + TIMER_LOCK_TTL_MS,
    };
    const written = writeJsonVerified(
      TIMER_LOCK_KEY,
      next,
      (value) => normalizeTimerLock(value) !== null,
    );
    if (!written.ok) return false;
    const confirmed = readTimerLock();
    return confirmed?.ownerId === ownerId && confirmed.sessionId === sessionId;
  } catch {
    return false;
  }
}

export function acquireOrRefreshTimerLock(
  sessionId: string,
  ownerId = getTimerTabId(),
): boolean {
  return refreshTimerLock(sessionId, ownerId) || acquireTimerLock(sessionId, ownerId);
}

export function refreshTimerLock(sessionId: string, ownerId = getTimerTabId()): boolean {
  try {
    const loaded = loadTimerLock();
    if (loaded.status !== "ok") return false;
    const current = loaded.value;
    if (!current || current.ownerId !== ownerId || current.sessionId !== sessionId) return false;
    const next = { ...current, expiresAt: Date.now() + TIMER_LOCK_TTL_MS };
    const written = writeJsonVerified(
      TIMER_LOCK_KEY,
      next,
      (value) => normalizeTimerLock(value) !== null,
    );
    if (!written.ok) return false;
    const confirmed = readTimerLock();
    return confirmed?.ownerId === ownerId && confirmed.sessionId === sessionId;
  } catch {
    return false;
  }
}

export function releaseTimerLock(ownerId = getTimerTabId()): StorageWriteResult {
  try {
    const loaded = loadTimerLock();
    if (loaded.status === "invalid" || loaded.status === "unavailable") {
      return { ok: false, error: loaded.error };
    }
    const current = loaded.status === "ok" ? loaded.value : null;
    if (current?.ownerId === ownerId) return writeRawVerified(TIMER_LOCK_KEY, null);
    return { ok: true };
  } catch {
    return { ok: false, error: "Không thể xác nhận việc giải phóng khoá hẹn giờ." };
  }
}

export function calculateElapsedSeconds(st: StoredTimerState): number {
  let secs = st.accumulatedSeconds || 0;
  if (st.isRunning && st.startTimestamp) {
    const diff = Math.floor((Date.now() - st.startTimestamp) / 1000);
    secs += Math.max(0, diff);
  }
  return Math.min(st.durationMinutes * 60, Math.max(0, secs));
}

export function timerExpectedEndTimestamp(st: StoredTimerState): number | null {
  if (!st.isRunning || st.startTimestamp == null) return null;
  const remainingSeconds = Math.max(0, st.durationMinutes * 60 - st.accumulatedSeconds);
  return st.startTimestamp + remainingSeconds * 1000;
}

export function shouldRecoverExpiredTimer(st: StoredTimerState, openedAt = Date.now()): boolean {
  const expectedEnd = timerExpectedEndTimestamp(st);
  return (
    st.status !== "expired" &&
    expectedEnd != null &&
    expectedEnd < openedAt - 1_000 &&
    !st.savedSessionIds.includes(st.activeTimerSessionId)
  );
}

// Web Audio API Synthesizer for Chime Notification & Ambient Focus Sounds
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a pleasant 4-note ascending major chord when a Study session completes
 */
export function playStudyCompletionChime(volume = 0.5) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = Math.min(1, Math.max(0.1, volume));

  // Notes: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.50Hz)
  const notes = [
    { freq: 523.25, time: 0, duration: 1.4, gain: 0.25 * vol },
    { freq: 659.25, time: 0.16, duration: 1.4, gain: 0.28 * vol },
    { freq: 783.99, time: 0.32, duration: 1.6, gain: 0.3 * vol },
    { freq: 1046.5, time: 0.48, duration: 2.0, gain: 0.35 * vol },
  ];

  notes.forEach((n) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(n.freq, now + n.time);

    // Soft attack & exponential decay
    gain.gain.setValueAtTime(0.001, now + n.time);
    gain.gain.linearRampToValueAtTime(n.gain, now + n.time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + n.time);
    osc.stop(now + n.time + n.duration);
  });
}

/**
 * Plays a gentle 3-note 'wakeup/refresh' chime when a Break session ends
 */
export function playBreakCompletionChime(volume = 0.5) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = Math.min(1, Math.max(0.1, volume));

  // Notes: G5 (783.99Hz), C6 (1046.50Hz), E6 (1318.51Hz)
  const notes = [
    { freq: 783.99, time: 0, duration: 1.2, gain: 0.22 * vol },
    { freq: 1046.5, time: 0.15, duration: 1.3, gain: 0.28 * vol },
    { freq: 1318.51, time: 0.3, duration: 1.8, gain: 0.32 * vol },
  ];

  notes.forEach((n) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(n.freq, now + n.time);

    gain.gain.setValueAtTime(0.001, now + n.time);
    gain.gain.linearRampToValueAtTime(n.gain, now + n.time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + n.time);
    osc.stop(now + n.time + n.duration);
  });
}

/**
 * Plays a mechanical clock tick-tock sound ("tíc" / "tắc")
 */
export function playClockTick(volume = 0.5, isTock = false) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = Math.min(1, Math.max(0.05, volume));

  // High pitch tick (1080Hz) vs Low pitch tock (680Hz)
  const freq = isTock ? 680 : 1080;
  const duration = isTock ? 0.038 : 0.028;
  const gainVal = (isTock ? 0.32 : 0.4) * vol;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.45, now + duration);

  gain.gain.setValueAtTime(gainVal, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
}

/**
 * Helper to play completion chime based on timer type
 */
export function playCompletionChime(type: "study" | "break" = "study", volume = 0.5) {
  if (type === "break") {
    playBreakCompletionChime(volume);
  } else {
    playStudyCompletionChime(volume);
  }
}

// Global active noise node reference for ambient sound background loop
let activeAmbientNodes: { stop: () => void } | null = null;

export function stopAmbientSound() {
  if (activeAmbientNodes) {
    try {
      activeAmbientNodes.stop();
    } catch {
      // ignore
    }
    activeAmbientNodes = null;
  }
}

export function playAmbientSound(type: AmbientSoundType, volume = 0.5) {
  stopAmbientSound();
  if (type === "none") return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(Math.min(1, Math.max(0, volume * 0.25)), ctx.currentTime);
  masterGain.connect(ctx.destination);

  if (type === "binaural") {
    // 200Hz Left, 210Hz Right -> 10Hz Alpha focus wave
    const merger = ctx.createChannelMerger(2);

    const oscL = ctx.createOscillator();
    oscL.frequency.value = 200;
    oscL.connect(merger, 0, 0);

    const oscR = ctx.createOscillator();
    oscR.frequency.value = 210;
    oscR.connect(merger, 0, 1);

    merger.connect(masterGain);
    oscL.start();
    oscR.start();

    activeAmbientNodes = {
      stop: () => {
        oscL.stop();
        oscR.stop();
        oscL.disconnect();
        oscR.disconnect();
      },
    };
    return;
  }

  // Generate 5 seconds of pink / brown noise buffer
  const bufferSize = ctx.sampleRate * 5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  let lastOut = 0.0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise formula
    lastOut = output[i];
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;

  const filter = ctx.createBiquadFilter();
  if (type === "rain") {
    filter.type = "bandpass";
    filter.frequency.value = 800;
    filter.Q.value = 1.2;
  } else if (type === "cafe") {
    filter.type = "lowpass";
    filter.frequency.value = 400;
  } else {
    // whiteNoise / focus hum
    filter.type = "lowpass";
    filter.frequency.value = 650;
  }

  noiseSource.connect(filter);
  filter.connect(masterGain);
  noiseSource.start();

  activeAmbientNodes = {
    stop: () => {
      try {
        noiseSource.stop();
        noiseSource.disconnect();
      } catch {
        // ignore
      }
    },
  };
}
