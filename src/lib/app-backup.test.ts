import { afterEach, describe, expect, test } from "vitest";
import {
  APP_BACKUP_FORMAT,
  APP_BACKUP_VERSION,
  parseAppBackup,
  restoreAppBackup,
  restoreLastImportRollback,
} from "./app-backup";
import { migrateProgressState, PROGRESS_STORAGE_KEY } from "./progress-store";
import { ARCHIVED_CATALOG_KEY, CUSTOM_SUBJECTS_KEY } from "./custom-subjects";
import { TIMER_KEY, TIMER_LOCK_KEY } from "./focus-timer-store";
import { DEFAULT_FOCUS_PREFERENCES, FOCUS_PREFERENCES_KEY } from "./focus-preferences";
import { DEFAULT_PUSH_PREFERENCES, PUSH_PREFERENCES_KEY } from "./push-notification-store";

class MemoryStorage {
  private values = new Map<string, string>();
  writes = 0;
  failWriteAt: number | null = null;
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.writes++;
    if (this.failWriteAt === this.writes) throw new Error("quota");
    this.values.set(key, value);
  }
  removeItem(key: string) {
    this.writes++;
    if (this.failWriteAt === this.writes) throw new Error("quota");
    this.values.delete(key);
  }
}

function validBackupRaw() {
  const progress = migrateProgressState(null);
  if (!progress.ok) throw new Error("Expected initial progress");
  return JSON.stringify({
    format: APP_BACKUP_FORMAT,
    backupVersion: APP_BACKUP_VERSION,
    exportedAt: "2026-07-25T00:00:00.000Z",
    progress: { ...progress.state, onboardingComplete: true },
    subjects: [],
    timer: null,
    archivedCatalog: { subjects: [], lessons: [] },
    focusPreferences: DEFAULT_FOCUS_PREFERENCES,
    pushPreferences: DEFAULT_PUSH_PREFERENCES,
  });
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "localStorage");
});

describe("whole-app backup validation", () => {
  test("accepts a complete snapshot and migrates its progress atomically before restore", () => {
    const progress = migrateProgressState(null);
    expect(progress.ok).toBe(true);
    if (!progress.ok) return;
    const result = parseAppBackup(
      JSON.stringify({
        format: APP_BACKUP_FORMAT,
        backupVersion: APP_BACKUP_VERSION,
        exportedAt: "2026-07-25T00:00:00.000Z",
        progress: {
          ...progress.state,
          onboardingComplete: true,
          studySessions: [{ id: "broken", durationSeconds: 0 }],
        },
        subjects: [],
        timer: null,
        archivedCatalog: { subjects: [], lessons: [] },
        focusPreferences: DEFAULT_FOCUS_PREFERENCES,
        pushPreferences: DEFAULT_PUSH_PREFERENCES,
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.backup.progress.studySessions).toEqual([]);
    expect(result.backup.progress.onboardingComplete).toBe(true);
  });

  test("rejects curriculum-only JSON and malformed progress", () => {
    expect(parseAppBackup("[]").ok).toBe(false);
    expect(
      parseAppBackup(
        JSON.stringify({
          format: APP_BACKUP_FORMAT,
          backupVersion: APP_BACKUP_VERSION,
          exportedAt: "2026-07-25T00:00:00.000Z",
          progress: { schemaVersion: 999 },
          subjects: [],
          timer: null,
        }),
      ).ok,
    ).toBe(false);
  });

  test("writes all validated state and can roll back to the exact previous snapshot", () => {
    const storage = new MemoryStorage();
    Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
    storage.setItem(PROGRESS_STORAGE_KEY, "previous-progress");
    expect(restoreAppBackup(validBackupRaw()).ok).toBe(true);
    expect(JSON.parse(storage.getItem(PROGRESS_STORAGE_KEY) ?? "{}").onboardingComplete).toBe(true);
    expect(restoreLastImportRollback().ok).toBe(true);
    expect(storage.getItem(PROGRESS_STORAGE_KEY)).toBe("previous-progress");
  });

  test("rolls back every whole-app target write and retains the rollback for retry", () => {
    const raw = validBackupRaw();
    for (const targetWritePosition of [1, 2, 3, 4, 5, 6, 7]) {
      const storage = new MemoryStorage();
      Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
      storage.setItem(PROGRESS_STORAGE_KEY, "old-progress");
      storage.setItem(CUSTOM_SUBJECTS_KEY, "old-subjects");
      storage.setItem(TIMER_KEY, "old-timer");
      storage.setItem(TIMER_LOCK_KEY, "old-lock");
      storage.setItem(ARCHIVED_CATALOG_KEY, "old-archive");
      storage.setItem(FOCUS_PREFERENCES_KEY, "old-focus-preferences");
      storage.setItem(PUSH_PREFERENCES_KEY, "old-push-preferences");
      storage.failWriteAt = storage.writes + 1 + targetWritePosition;
      expect(restoreAppBackup(raw).ok).toBe(false);
      expect(storage.getItem(PROGRESS_STORAGE_KEY)).toBe("old-progress");
      expect(storage.getItem(CUSTOM_SUBJECTS_KEY)).toBe("old-subjects");
      expect(storage.getItem(TIMER_KEY)).toBe("old-timer");
      expect(storage.getItem(TIMER_LOCK_KEY)).toBe("old-lock");
      expect(storage.getItem(ARCHIVED_CATALOG_KEY)).toBe("old-archive");
      expect(storage.getItem(FOCUS_PREFERENCES_KEY)).toBe("old-focus-preferences");
      expect(storage.getItem(PUSH_PREFERENCES_KEY)).toBe("old-push-preferences");
      expect(storage.getItem("hocvien-full-backup-before-import")).not.toBeNull();
    }

    const storage = new MemoryStorage();
    Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
    storage.setItem(PROGRESS_STORAGE_KEY, "old-progress");
    expect(restoreAppBackup(raw).ok).toBe(true);
    storage.failWriteAt = storage.writes + 1;
    expect(restoreLastImportRollback().ok).toBe(false);
    expect(storage.getItem("hocvien-full-backup-before-import")).not.toBeNull();
    storage.failWriteAt = null;
    expect(restoreLastImportRollback().ok).toBe(true);
    expect(storage.getItem(PROGRESS_STORAGE_KEY)).toBe("old-progress");
  });
});
