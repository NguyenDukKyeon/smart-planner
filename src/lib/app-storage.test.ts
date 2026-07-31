import { describe, expect, test } from "vitest";
import {
  APP_OWNED_STORAGE_KEYS,
  RESET_ROLLBACK_KEY,
  factoryResetOwnedStorage,
  loadStorage,
  readRawSnapshot,
  replaceRawValuesSafely,
  restoreSnapshotFromKey,
  writeRawVerified,
  type StorageAdapter,
} from "./app-storage";

class FaultingStorage {
  readonly values = new Map<string, string>();
  writes = 0;
  failWriteAt: number | null = null;
  additionalFailedWrites = new Set<number>();
  mismatchAt: number | null = null;
  failReads = false;

  getItem(key: string) {
    if (this.failReads) throw new Error("get blocked");
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.writes++;
    if (this.failWriteAt === this.writes || this.additionalFailedWrites.has(this.writes)) {
      throw new Error(`write ${this.writes} blocked`);
    }
    if (this.mismatchAt === this.writes) {
      this.values.set(key, `${value}-mismatch`);
      return;
    }
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.writes++;
    if (this.failWriteAt === this.writes || this.additionalFailedWrites.has(this.writes)) {
      throw new Error(`remove ${this.writes} blocked`);
    }
    if (this.mismatchAt === this.writes) {
      this.values.set(key, "unexpected");
      return;
    }
    this.values.delete(key);
  }
}

const adapter = (storage: FaultingStorage) => storage as unknown as StorageAdapter;

describe("explicit storage states", () => {
  test("distinguishes missing, invalid raw bytes, and unavailable storage", () => {
    const storage = new FaultingStorage();
    expect(
      loadStorage("progress", (raw) => JSON.parse(raw) as { ok: boolean }, adapter(storage)),
    ).toEqual({
      status: "missing",
    });

    storage.values.set("progress", "{invalid");
    const invalid = loadStorage(
      "progress",
      (raw) => JSON.parse(raw) as { ok: boolean },
      adapter(storage),
    );
    expect(invalid.status).toBe("invalid");
    if (invalid.status === "invalid") expect(invalid.raw).toBe("{invalid");

    storage.failReads = true;
    expect(loadStorage("progress", () => ({ ok: true }), adapter(storage)).status).toBe(
      "unavailable",
    );
  });

  test("treats quota and read-back mismatch as failed writes", () => {
    const quota = new FaultingStorage();
    quota.failWriteAt = 1;
    expect(writeRawVerified("key", "value", adapter(quota)).ok).toBe(false);

    const mismatch = new FaultingStorage();
    mismatch.mismatchAt = 1;
    expect(writeRawVerified("key", "value", adapter(mismatch)).ok).toBe(false);
  });
});

describe("rollback-protected mutations", () => {
  test("aborts before targets when snapshot write or read-back verification fails", () => {
    const writeFailure = new FaultingStorage();
    writeFailure.values.set("a", "old-a");
    writeFailure.failWriteAt = 1;
    expect(
      replaceRawValuesSafely("snapshot", [{ key: "a", raw: "new-a" }], adapter(writeFailure)).ok,
    ).toBe(false);
    expect(writeFailure.values.get("a")).toBe("old-a");

    const mismatch = new FaultingStorage();
    mismatch.values.set("a", "old-a");
    mismatch.mismatchAt = 1;
    expect(
      replaceRawValuesSafely("snapshot", [{ key: "a", raw: "new-a" }], adapter(mismatch)).ok,
    ).toBe(false);
    expect(mismatch.values.get("a")).toBe("old-a");
  });

  test("rolls back every target for each deterministic target-write failure", () => {
    for (const failWriteAt of [2, 3, 4]) {
      const storage = new FaultingStorage();
      storage.values.set("a", "old-a");
      storage.values.set("b", "old-b");
      storage.values.set("c", "old-c");
      storage.failWriteAt = failWriteAt;
      const result = replaceRawValuesSafely(
        "snapshot",
        [
          { key: "a", raw: "new-a" },
          { key: "b", raw: "new-b" },
          { key: "c", raw: null },
        ],
        adapter(storage),
      );
      expect(result.ok).toBe(false);
      expect(storage.values.get("a")).toBe("old-a");
      expect(storage.values.get("b")).toBe("old-b");
      expect(storage.values.get("c")).toBe("old-c");
      expect(readRawSnapshot("snapshot", adapter(storage)).status).toBe("ok");
    }
  });

  test("keeps a failed restore snapshot for a later retry", () => {
    const storage = new FaultingStorage();
    storage.values.set("a", "old-a");
    expect(
      replaceRawValuesSafely("snapshot", [{ key: "a", raw: "new-a" }], adapter(storage)).ok,
    ).toBe(true);
    storage.failWriteAt = storage.writes + 1;
    expect(restoreSnapshotFromKey("snapshot", adapter(storage)).ok).toBe(false);
    expect(readRawSnapshot("snapshot", adapter(storage)).status).toBe("ok");
    storage.failWriteAt = null;
    expect(restoreSnapshotFromKey("snapshot", adapter(storage)).ok).toBe(true);
    expect(storage.values.get("a")).toBe("old-a");
  });

  test("exposes multi-key rollback and restore failures while retaining the verified snapshot", () => {
    const rollbackFailure = new FaultingStorage();
    rollbackFailure.values.set("a", "old-a");
    rollbackFailure.values.set("b", "old-b");
    // Snapshot is write 1, target a is write 2, target b fails at 3, then
    // rollback of a also fails at 4.  The route can therefore enter recovery
    // rather than claiming that its replacement was undone.
    rollbackFailure.failWriteAt = 3;
    rollbackFailure.additionalFailedWrites.add(4);
    const failedTransaction = replaceRawValuesSafely(
      "snapshot",
      [
        { key: "a", raw: "new-a" },
        { key: "b", raw: "new-b" },
      ],
      adapter(rollbackFailure),
    );
    expect(failedTransaction.ok).toBe(false);
    if (!failedTransaction.ok) expect(failedTransaction.rollbackError).toBeTruthy();
    expect(readRawSnapshot("snapshot", adapter(rollbackFailure)).status).toBe("ok");

    for (const restoreWriteOffset of [1, 2]) {
      const storage = new FaultingStorage();
      storage.values.set("a", "old-a");
      storage.values.set("b", "old-b");
      expect(
        replaceRawValuesSafely(
          "snapshot",
          [
            { key: "a", raw: "new-a" },
            { key: "b", raw: "new-b" },
          ],
          adapter(storage),
        ).ok,
      ).toBe(true);
      storage.failWriteAt = storage.writes + restoreWriteOffset;
      expect(restoreSnapshotFromKey("snapshot", adapter(storage)).ok).toBe(false);
      expect(readRawSnapshot("snapshot", adapter(storage)).status).toBe("ok");
    }
  });

  test("factory reset leaves an unrelated origin key intact and retains its rollback", () => {
    const storage = new FaultingStorage();
    storage.values.set("unrelated-sentinel", "keep");
    for (const key of APP_OWNED_STORAGE_KEYS) {
      if (key !== RESET_ROLLBACK_KEY) storage.values.set(key, `value-${key}`);
    }
    expect(factoryResetOwnedStorage(adapter(storage)).ok).toBe(true);
    expect(storage.values.get("unrelated-sentinel")).toBe("keep");
    expect(readRawSnapshot(RESET_ROLLBACK_KEY, adapter(storage)).status).toBe("ok");
    expect(
      APP_OWNED_STORAGE_KEYS.filter((key) => key !== RESET_ROLLBACK_KEY).every(
        (key) => !storage.values.has(key),
      ),
    ).toBe(true);
  });
});
