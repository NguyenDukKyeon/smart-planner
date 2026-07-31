/**
 * Small, deliberately boring local-storage boundary.  Product modules use this
 * file instead of treating an absent, corrupt, or quota-limited storage area as
 * an empty one.  Keeping raw strings here is important: recovery must never
 * normalise the only copy of a user's data.
 */
export type StorageLoadResult<T> =
  | { status: "ok"; value: T }
  | { status: "missing" }
  | { status: "invalid"; raw: string; error: string }
  | { status: "unavailable"; error: string };

export type StorageWriteResult = { ok: true } | { ok: false; error: string };

export type StorageAdapter = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type RawStorageSnapshot = {
  version: 1;
  createdAt: string;
  values: Record<string, string | null>;
};

export type StorageTransactionResult =
  | { ok: true; snapshot: RawStorageSnapshot }
  | {
      ok: false;
      error: string;
      snapshot?: RawStorageSnapshot;
      rollbackError?: string;
    };

export const RESET_ROLLBACK_KEY = "hocvien-reset-rollback-v1";
export const FOCUS_TIMER_SESSION_ROLLBACK_KEY = "hocvien-focus-timer-session-rollback-v1";
export const ARCHIVE_CATALOG_ROLLBACK_KEY = "hocvien-archive-catalog-rollback-v1";

// This registry is intentionally literal rather than assembled from module
// constants.  It must stay available to recovery code without import cycles.
export const APP_OWNED_STORAGE_KEYS = [
  "hocvien-progress-v2",
  "hocvien-progress-v2-backup-before-v5",
  "hocvien-custom-subjects-v1",
  "hocvien-custom-subjects-backup-before-delete",
  "hocvien-archived-catalog-v1",
  "hocvien-focus-timer-v2",
  "hocvien-focus-preferences-v1",
  "hocvien-focus-timer-lock-v1",
  FOCUS_TIMER_SESSION_ROLLBACK_KEY,
  ARCHIVE_CATALOG_ROLLBACK_KEY,
  "hocvien-full-backup-before-import",
  "hocvien_push_preferences_v1",
  "hocvien_push_history_v1",
  "hocvien-workspace-title-v1",
  "hocvien-identity-title-v1",
  RESET_ROLLBACK_KEY,
] as const;

function unavailable(error: unknown): StorageWriteResult {
  return {
    ok: false,
    error: error instanceof Error ? error.message : "Bộ nhớ trình duyệt hiện không khả dụng.",
  };
}

export function getBrowserStorage(): StorageAdapter | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function loadStorage<T>(
  key: string,
  decode: (raw: string) => T | null,
  storage: StorageAdapter | null = getBrowserStorage(),
): StorageLoadResult<T> {
  if (!storage) return { status: "unavailable", error: "Không thể truy cập bộ nhớ trình duyệt." };
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch (error) {
    const result = unavailable(error);
    return {
      status: "unavailable",
      error: result.ok ? "Không thể đọc bộ nhớ trình duyệt." : result.error,
    };
  }
  if (raw == null) return { status: "missing" };
  try {
    const value = decode(raw);
    if (value == null) {
      return { status: "invalid", raw, error: "Dữ liệu đã lưu không đúng cấu trúc." };
    }
    return { status: "ok", value };
  } catch (error) {
    return {
      status: "invalid",
      raw,
      error: error instanceof Error ? error.message : "Dữ liệu đã lưu không thể đọc được.",
    };
  }
}

/** Write the exact raw value, then prove that the browser retained that value. */
export function writeRawVerified(
  key: string,
  raw: string | null,
  storage: StorageAdapter | null = getBrowserStorage(),
): StorageWriteResult {
  if (!storage) return { ok: false, error: "Không thể truy cập bộ nhớ trình duyệt." };
  try {
    if (raw == null) storage.removeItem(key);
    else storage.setItem(key, raw);
    const confirmed = storage.getItem(key);
    if (confirmed !== raw) {
      return { ok: false, error: `Không thể xác nhận dữ liệu đã ghi cho ${key}.` };
    }
    return { ok: true };
  } catch (error) {
    return unavailable(error);
  }
}

export function writeJsonVerified<T>(
  key: string,
  value: T,
  validate: (value: unknown) => boolean,
  storage: StorageAdapter | null = getBrowserStorage(),
): StorageWriteResult {
  let raw: string;
  try {
    raw = JSON.stringify(value);
  } catch (error) {
    return unavailable(error);
  }
  const written = writeRawVerified(key, raw, storage);
  if (!written.ok || !storage) return written;
  try {
    const confirmed = storage.getItem(key);
    if (confirmed == null || !validate(JSON.parse(confirmed))) {
      return { ok: false, error: `Không thể xác nhận dữ liệu hợp lệ đã ghi cho ${key}.` };
    }
    return { ok: true };
  } catch (error) {
    return unavailable(error);
  }
}

export function captureRawSnapshot(
  keys: readonly string[],
  storage: StorageAdapter | null = getBrowserStorage(),
): { ok: true; snapshot: RawStorageSnapshot } | { ok: false; error: string } {
  if (!storage) return { ok: false, error: "Không thể truy cập bộ nhớ trình duyệt." };
  const values: Record<string, string | null> = {};
  try {
    for (const key of keys) values[key] = storage.getItem(key);
    return { ok: true, snapshot: { version: 1, createdAt: new Date().toISOString(), values } };
  } catch (error) {
    const result = unavailable(error);
    return { ok: false, error: result.ok ? "Không thể đọc bộ nhớ trình duyệt." : result.error };
  }
}

export function readRawSnapshot(
  key: string,
  storage: StorageAdapter | null = getBrowserStorage(),
): StorageLoadResult<RawStorageSnapshot> {
  return loadStorage(
    key,
    (raw) => {
      const candidate = JSON.parse(raw) as Partial<RawStorageSnapshot>;
      if (
        candidate.version !== 1 ||
        typeof candidate.createdAt !== "string" ||
        !candidate.values ||
        typeof candidate.values !== "object" ||
        Array.isArray(candidate.values) ||
        Object.values(candidate.values).some((value) => value !== null && typeof value !== "string")
      ) {
        return null;
      }
      return candidate as RawStorageSnapshot;
    },
    storage,
  );
}

export function restoreRawSnapshot(
  snapshot: RawStorageSnapshot,
  storage: StorageAdapter | null = getBrowserStorage(),
): StorageWriteResult {
  const errors: string[] = [];
  for (const key of Object.keys(snapshot.values).sort()) {
    const restored = writeRawVerified(key, snapshot.values[key], storage);
    if (!restored.ok) errors.push(`${key}: ${restored.error}`);
  }
  if (!storage) return { ok: false, error: "Storage is unavailable for rollback verification." };
  try {
    for (const key of Object.keys(snapshot.values).sort()) {
      if (storage.getItem(key) !== snapshot.values[key]) {
        errors.push(`Rollback verification failed for ${key}.`);
      }
    }
  } catch (error) {
    const failed = unavailable(error);
    errors.push(failed.ok ? "Rollback verification failed." : failed.error);
  }
  return errors.length > 0 ? { ok: false, error: errors.join(" ") } : { ok: true };
}

/**
 * Commit a group of raw values only after a rollback snapshot was both written
 * and read back.  Target order is caller-controlled and therefore auditable.
 */
export function replaceRawValuesSafely(
  snapshotKey: string,
  targets: readonly { key: string; raw: string | null }[],
  storage: StorageAdapter | null = getBrowserStorage(),
): StorageTransactionResult {
  const duplicate = new Set<string>();
  if (targets.some(({ key }) => duplicate.has(key) || !duplicate.add(key))) {
    return { ok: false, error: "Danh sách khoá ghi có phần tử trùng lặp." };
  }
  if (targets.some(({ key }) => key === snapshotKey)) {
    return { ok: false, error: "Snapshot key cannot also be a transaction target." };
  }
  const captured = captureRawSnapshot(
    targets.map((target) => target.key),
    storage,
  );
  if (!captured.ok) return captured;
  const storedSnapshot = writeJsonVerified(snapshotKey, captured.snapshot, isRawSnapshot, storage);
  if (!storedSnapshot.ok) {
    return { ok: false, error: storedSnapshot.error, snapshot: captured.snapshot };
  }

  for (const target of targets) {
    const written = writeRawVerified(target.key, target.raw, storage);
    if (written.ok) continue;
    const rolledBack = restoreRawSnapshot(captured.snapshot, storage);
    return rolledBack.ok
      ? { ok: false, error: written.error, snapshot: captured.snapshot }
      : {
          ok: false,
          error: written.error,
          snapshot: captured.snapshot,
          rollbackError: rolledBack.error,
        };
  }
  return { ok: true, snapshot: captured.snapshot };
}

export function restoreSnapshotFromKey(
  snapshotKey: string,
  storage: StorageAdapter | null = getBrowserStorage(),
): StorageWriteResult {
  const loaded = readRawSnapshot(snapshotKey, storage);
  if (loaded.status === "missing") return { ok: false, error: "Không có bản khôi phục." };
  if (loaded.status === "invalid") return { ok: false, error: loaded.error };
  if (loaded.status === "unavailable") return { ok: false, error: loaded.error };
  // The snapshot deliberately survives a successful restore.  It is only ever
  // removed by a later, verified replacement, so a transient failure is retryable.
  return restoreRawSnapshot(loaded.value, storage);
}

export function factoryResetOwnedStorage(
  storage: StorageAdapter | null = getBrowserStorage(),
): StorageTransactionResult {
  const resetTargets = APP_OWNED_STORAGE_KEYS.filter((key) => key !== RESET_ROLLBACK_KEY).map(
    (key) => ({ key, raw: null }),
  );
  return replaceRawValuesSafely(RESET_ROLLBACK_KEY, resetTargets, storage);
}

function isRawSnapshot(value: unknown): value is RawStorageSnapshot {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<RawStorageSnapshot>;
  return (
    candidate.version === 1 &&
    typeof candidate.createdAt === "string" &&
    Boolean(candidate.values) &&
    typeof candidate.values === "object" &&
    !Array.isArray(candidate.values) &&
    Object.values(candidate.values).every((item) => item === null || typeof item === "string")
  );
}
