import {
  getBrowserStorage,
  loadStorage,
  writeJsonVerified,
  type StorageAdapter,
} from "./app-storage";

export const FOCUS_PREFERENCES_KEY = "hocvien-focus-preferences-v1";
export const FOCUS_PREFERENCES_EVENT = "hocvien:focus-preferences-updated";
const LEGACY_TIMER_KEY = "hocvien-focus-timer-v2";

export type FocusPreferences = {
  defaultFocusMinutes: 25 | 50 | 90;
  quickStartEnabled: boolean;
  autoStartSelectedDuration: boolean;
  autoStartBreak: boolean;
  autoStartFocus: boolean;
  confirmBeforeStop: boolean;
  keepRunningAcrossTabs: boolean;
  showMiniTimer: boolean;
  notifyWhenComplete: boolean;
  showTimerInHeader: boolean;
  soundAlertsEnabled: boolean;
  soundVolume: number;
};

export const DEFAULT_FOCUS_PREFERENCES: FocusPreferences = {
  defaultFocusMinutes: 25,
  quickStartEnabled: true,
  autoStartSelectedDuration: true,
  autoStartBreak: false,
  autoStartFocus: false,
  confirmBeforeStop: true,
  keepRunningAcrossTabs: true,
  showMiniTimer: true,
  notifyWhenComplete: true,
  showTimerInHeader: true,
  soundAlertsEnabled: true,
  soundVolume: 0.5,
};

export function normalizeFocusPreferences(value: unknown): FocusPreferences | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<FocusPreferences>;
  const defaultFocusMinutes = [25, 50, 90].includes(Number(raw.defaultFocusMinutes))
    ? (Number(raw.defaultFocusMinutes) as 25 | 50 | 90)
    : DEFAULT_FOCUS_PREFERENCES.defaultFocusMinutes;
  const volume = Number(raw.soundVolume);
  return {
    defaultFocusMinutes,
    quickStartEnabled:
      typeof raw.quickStartEnabled === "boolean"
        ? raw.quickStartEnabled
        : DEFAULT_FOCUS_PREFERENCES.quickStartEnabled,
    autoStartSelectedDuration:
      typeof raw.autoStartSelectedDuration === "boolean"
        ? raw.autoStartSelectedDuration
        : DEFAULT_FOCUS_PREFERENCES.autoStartSelectedDuration,
    autoStartBreak:
      typeof raw.autoStartBreak === "boolean"
        ? raw.autoStartBreak
        : DEFAULT_FOCUS_PREFERENCES.autoStartBreak,
    autoStartFocus:
      typeof raw.autoStartFocus === "boolean"
        ? raw.autoStartFocus
        : DEFAULT_FOCUS_PREFERENCES.autoStartFocus,
    confirmBeforeStop:
      typeof raw.confirmBeforeStop === "boolean"
        ? raw.confirmBeforeStop
        : DEFAULT_FOCUS_PREFERENCES.confirmBeforeStop,
    keepRunningAcrossTabs:
      typeof raw.keepRunningAcrossTabs === "boolean"
        ? raw.keepRunningAcrossTabs
        : DEFAULT_FOCUS_PREFERENCES.keepRunningAcrossTabs,
    showMiniTimer:
      typeof raw.showMiniTimer === "boolean"
        ? raw.showMiniTimer
        : DEFAULT_FOCUS_PREFERENCES.showMiniTimer,
    notifyWhenComplete:
      typeof raw.notifyWhenComplete === "boolean"
        ? raw.notifyWhenComplete
        : DEFAULT_FOCUS_PREFERENCES.notifyWhenComplete,
    showTimerInHeader:
      typeof raw.showTimerInHeader === "boolean"
        ? raw.showTimerInHeader
        : DEFAULT_FOCUS_PREFERENCES.showTimerInHeader,
    soundAlertsEnabled:
      typeof raw.soundAlertsEnabled === "boolean"
        ? raw.soundAlertsEnabled
        : DEFAULT_FOCUS_PREFERENCES.soundAlertsEnabled,
    soundVolume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 0.5,
  };
}

function migrateLegacyTimerPreferences(storage: StorageAdapter | null): FocusPreferences | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(LEGACY_TIMER_KEY);
    if (!raw) return null;
    const legacy = JSON.parse(raw) as Record<string, unknown>;
    const legacyAutoStart = legacy.autoStartNextSession === true;
    const duration = Number(legacy.durationMinutes);
    return normalizeFocusPreferences({
      ...DEFAULT_FOCUS_PREFERENCES,
      defaultFocusMinutes: [25, 50, 90].includes(duration) ? duration : 25,
      autoStartBreak:
        typeof legacy.autoStartBreak === "boolean" ? legacy.autoStartBreak : legacyAutoStart,
      autoStartFocus:
        typeof legacy.autoStartFocus === "boolean" ? legacy.autoStartFocus : legacyAutoStart,
      soundAlertsEnabled:
        typeof legacy.soundAlertsEnabled === "boolean"
          ? legacy.soundAlertsEnabled
          : DEFAULT_FOCUS_PREFERENCES.soundAlertsEnabled,
      soundVolume:
        typeof legacy.soundVolume === "number"
          ? legacy.soundVolume
          : DEFAULT_FOCUS_PREFERENCES.soundVolume,
    });
  } catch {
    return null;
  }
}

export function loadFocusPreferences(
  storage: StorageAdapter | null = getBrowserStorage(),
): FocusPreferences {
  const loaded = loadStorage(
    FOCUS_PREFERENCES_KEY,
    (raw) => normalizeFocusPreferences(JSON.parse(raw)),
    storage,
  );
  if (loaded.status === "ok") return loaded.value;
  if (loaded.status !== "missing") return { ...DEFAULT_FOCUS_PREFERENCES };

  const migrated = migrateLegacyTimerPreferences(storage);
  if (migrated && storage) {
    writeJsonVerified(
      FOCUS_PREFERENCES_KEY,
      migrated,
      (value) => normalizeFocusPreferences(value) !== null,
      storage,
    );
    return migrated;
  }
  return { ...DEFAULT_FOCUS_PREFERENCES };
}

export function saveFocusPreferences(
  patch: Partial<FocusPreferences>,
  storage: StorageAdapter | null = getBrowserStorage(),
): { ok: true; value: FocusPreferences } | { ok: false; error: string } {
  const next = normalizeFocusPreferences({ ...loadFocusPreferences(storage), ...patch });
  if (!next) return { ok: false, error: "Cài đặt Pomodoro không hợp lệ." };
  const saved = writeJsonVerified(
    FOCUS_PREFERENCES_KEY,
    next,
    (value) => normalizeFocusPreferences(value) !== null,
    storage,
  );
  if (!saved.ok) return saved;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(FOCUS_PREFERENCES_EVENT, { detail: next }));
  }
  return { ok: true, value: next };
}
