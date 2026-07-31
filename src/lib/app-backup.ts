import {
  ARCHIVED_CATALOG_KEY,
  CUSTOM_SUBJECTS_KEY,
  getArchivedCatalog,
  normalizeSubjects,
  type ArchivedCatalog,
} from "./custom-subjects";
import { PROGRESS_STORAGE_KEY, migrateProgressState, type ProgressState } from "./progress-store";
import {
  TIMER_KEY,
  TIMER_LOCK_KEY,
  normalizeStoredTimerState,
  type StoredTimerState,
} from "./focus-timer-store";
import type { Subject } from "./mock-data";
import {
  DEFAULT_FOCUS_PREFERENCES,
  FOCUS_PREFERENCES_KEY,
  loadFocusPreferences,
  normalizeFocusPreferences,
  type FocusPreferences,
} from "./focus-preferences";
import {
  DEFAULT_PUSH_PREFERENCES,
  PUSH_PREFERENCES_KEY,
  getPushPreferences,
  normalizePushPreferences,
  type PushPreferences,
} from "./push-notification-store";
import {
  replaceRawValuesSafely,
  restoreSnapshotFromKey,
  type StorageWriteResult,
} from "./app-storage";

export const APP_BACKUP_FORMAT = "smart-study-planner-backup";
export const APP_BACKUP_VERSION = 1;
export const APP_ROLLBACK_KEY = "hocvien-full-backup-before-import";

export type AppBackup = {
  format: typeof APP_BACKUP_FORMAT;
  backupVersion: typeof APP_BACKUP_VERSION;
  exportedAt: string;
  progress: ProgressState;
  subjects: Subject[];
  timer: StoredTimerState | null;
  archivedCatalog: ArchivedCatalog;
  focusPreferences: FocusPreferences;
  pushPreferences: PushPreferences;
};

export type ParsedAppBackup = { ok: true; backup: AppBackup } | { ok: false; error: string };

export function createAppBackup(
  progress: ProgressState,
  subjects: Subject[],
  timer: StoredTimerState | null,
): AppBackup {
  return {
    format: APP_BACKUP_FORMAT,
    backupVersion: APP_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    progress,
    subjects,
    timer,
    archivedCatalog: getArchivedCatalog(),
    focusPreferences: loadFocusPreferences(),
    pushPreferences: getPushPreferences(),
  };
}

export function parseAppBackup(raw: string): ParsedAppBackup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "File sao lưu không phải JSON hợp lệ." };
  }
  if (!parsed || typeof parsed !== "object") {
    return { ok: false, error: "File sao lưu không có cấu trúc hợp lệ." };
  }
  const candidate = parsed as Partial<AppBackup>;
  if (candidate.format !== APP_BACKUP_FORMAT) {
    return { ok: false, error: "Đây không phải file sao lưu toàn bộ của ứng dụng." };
  }
  if (candidate.backupVersion !== APP_BACKUP_VERSION) {
    return {
      ok: false,
      error: `Phiên bản file sao lưu ${String(candidate.backupVersion)} chưa được hỗ trợ.`,
    };
  }
  if (typeof candidate.exportedAt !== "string" || Number.isNaN(Date.parse(candidate.exportedAt))) {
    return { ok: false, error: "File sao lưu thiếu thời điểm xuất hợp lệ." };
  }
  if (
    !candidate.progress ||
    typeof candidate.progress !== "object" ||
    typeof candidate.progress.schemaVersion !== "number" ||
    !candidate.progress.completedLessons ||
    typeof candidate.progress.completedLessons !== "object" ||
    !candidate.progress.habitLog ||
    typeof candidate.progress.habitLog !== "object" ||
    !candidate.progress.plannerSettings ||
    typeof candidate.progress.plannerSettings !== "object" ||
    !Array.isArray(candidate.progress.studySessions)
  ) {
    return { ok: false, error: "File sao lưu thiếu các trường tiến độ bắt buộc." };
  }
  const progress = migrateProgressState(JSON.stringify(candidate.progress));
  if (!progress.ok) {
    return { ok: false, error: `Tiến độ trong file không hợp lệ: ${progress.error}` };
  }
  const subjects = normalizeSubjects(candidate.subjects);
  if (!subjects) {
    return { ok: false, error: "Danh sách môn và bài trong file không hợp lệ." };
  }
  const timer = candidate.timer == null ? null : normalizeStoredTimerState(candidate.timer);
  if (candidate.timer != null && !timer) {
    return { ok: false, error: "Trạng thái Pomodoro trong file không hợp lệ." };
  }
  const focusPreferences =
    candidate.focusPreferences == null
      ? { ...DEFAULT_FOCUS_PREFERENCES }
      : normalizeFocusPreferences(candidate.focusPreferences);
  if (!focusPreferences) {
    return { ok: false, error: "Cài đặt Pomodoro trong file không hợp lệ." };
  }
  const pushPreferences =
    candidate.pushPreferences == null
      ? { ...DEFAULT_PUSH_PREFERENCES }
      : normalizePushPreferences(candidate.pushPreferences);
  const rawArchive = candidate.archivedCatalog;
  const archivedCatalog: ArchivedCatalog = {
    subjects: normalizeSubjects(rawArchive?.subjects) ?? [],
    lessons: Array.isArray(rawArchive?.lessons) ? rawArchive.lessons : [],
  };
  return {
    ok: true,
    backup: {
      format: APP_BACKUP_FORMAT,
      backupVersion: APP_BACKUP_VERSION,
      exportedAt: candidate.exportedAt,
      progress: { ...progress.state, onboardingComplete: true },
      subjects,
      timer,
      archivedCatalog,
      focusPreferences,
      pushPreferences,
    },
  };
}

/** Whole-app imports are one deterministic transaction, including Pomodoro preferences. */
export function restoreAppBackup(raw: string): ParsedAppBackup {
  const result = parseAppBackup(raw);
  if (!result.ok) return result;
  const transaction = replaceRawValuesSafely(APP_ROLLBACK_KEY, [
    { key: PROGRESS_STORAGE_KEY, raw: JSON.stringify(result.backup.progress) },
    { key: CUSTOM_SUBJECTS_KEY, raw: JSON.stringify(result.backup.subjects) },
    { key: TIMER_KEY, raw: result.backup.timer ? JSON.stringify(result.backup.timer) : null },
    { key: TIMER_LOCK_KEY, raw: null },
    { key: ARCHIVED_CATALOG_KEY, raw: JSON.stringify(result.backup.archivedCatalog) },
    { key: FOCUS_PREFERENCES_KEY, raw: JSON.stringify(result.backup.focusPreferences) },
    { key: PUSH_PREFERENCES_KEY, raw: JSON.stringify(result.backup.pushPreferences) },
  ]);
  if (transaction.ok) return result;
  return {
    ok: false,
    error: transaction.rollbackError
      ? `${transaction.error} Khôi phục tự động cũng thất bại: ${transaction.rollbackError}`
      : transaction.error,
  };
}

/** The snapshot is retained after success, which makes a failed retry safe. */
export function restoreLastImportRollback(): StorageWriteResult {
  return restoreSnapshotFromKey(APP_ROLLBACK_KEY);
}
