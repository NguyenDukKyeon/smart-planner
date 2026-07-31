import { readFile } from "node:fs/promises";
import { afterEach, describe, expect, test } from "vitest";
import * as timerStore from "./focus-timer-store";
import {
  acquireOrRefreshTimerLock,
  acquireTimerLock,
  createStartedFocusTimerState,
  createStoredTimerState,
  getSmartBreakMinutes,
  getStoredTimerState,
  loadStoredTimerState,
  loadTimerLock,
  normalizeStoredTimerState,
  recordFocusSessionAndTimerStateAtomically,
  recordSessionThenPersistTimerState,
  refreshTimerLock,
  releaseTimerLock,
  saveStoredTimerState,
  shouldRecoverExpiredTimer,
  TIMER_KEY,
  TIMER_LOCK_KEY,
} from "./focus-timer-store";
import { createStudySession } from "./study-sessions";
import { createInitialProgressState, PROGRESS_STORAGE_KEY } from "./progress-store";
import { FOCUS_TIMER_SESSION_ROLLBACK_KEY, type StorageAdapter } from "./app-storage";
import { createNonOwnerExpiryLocalState } from "./focus-timer-transitions";

class MemoryStorage {
  private values = new Map<string, string>();
  failSet = false;
  mismatchSet = false;
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    if (this.failSet) throw new Error("quota");
    if (this.mismatchSet) {
      this.values.set(key, "mismatch");
      return;
    }
    this.values.set(key, value);
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
}

class FaultingStorage {
  readonly values = new Map<string, string>();
  writes = 0;
  failAt = new Set<number>();
  mismatchAt = new Set<number>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.writes++;
    if (this.failAt.has(this.writes)) throw new Error(`write ${this.writes} failed`);
    this.values.set(key, this.mismatchAt.has(this.writes) ? `${value}-mismatch` : value);
  }

  removeItem(key: string) {
    this.writes++;
    if (this.failAt.has(this.writes)) throw new Error(`remove ${this.writes} failed`);
    if (this.mismatchAt.has(this.writes)) this.values.set(key, "mismatch");
    else this.values.delete(key);
  }
}

const asAdapter = (storage: FaultingStorage) => storage as unknown as StorageAdapter;
const readSource = (relativeUrl: string) => readFile(new URL(relativeUrl, import.meta.url), "utf8");

afterEach(() => {
  Reflect.deleteProperty(globalThis, "localStorage");
});

describe("focus timer persisted-state migration", () => {
  test("starts every explicitly selected focus duration and skips breaks after the 2-minute warmup", () => {
    const base = createStoredTimerState("lesson-a", "Bài A");
    for (const minutes of [2, 25, 50, 90]) {
      const started = createStartedFocusTimerState(base, minutes, 123_456);
      expect(started).toMatchObject({
        timerMode: "pomodoro",
        durationMinutes: minutes,
        lastFocusDuration: minutes,
        isRunning: true,
        isMinimized: false,
        startTimestamp: 123_456,
        accumulatedSeconds: 0,
        status: "running",
      });
      expect(started.activeTimerSessionId).not.toBe(base.activeTimerSessionId);
    }
    expect(getSmartBreakMinutes(2)).toBeNull();
    expect(getSmartBreakMinutes(25)).toBe(5);
    expect(getSmartBreakMinutes(50)).toBe(10);
    expect(getSmartBreakMinutes(90)).toBe(15);
  });

  test("persists Studio mode and migrates the legacy minimized flag", () => {
    const studio = normalizeStoredTimerState({
      lessonId: "lesson-a",
      lessonTitle: "Bài A",
      displayMode: "studio",
      targetMinutes: 90,
      reviewTaskId: "review:lesson-a:2026-08-01",
      reviewTargetMinutes: 15,
    });
    expect(studio).toMatchObject({
      displayMode: "studio",
      isMinimized: false,
      targetMinutes: 90,
      reviewTaskId: "review:lesson-a:2026-08-01",
      reviewTargetMinutes: 15,
    });

    const legacyMini = normalizeStoredTimerState({
      lessonId: "lesson-a",
      lessonTitle: "Bài A",
      isMinimized: true,
    });
    expect(legacyMini).toMatchObject({ displayMode: "mini", isMinimized: true });
  });

  test("strips legacy preferences from active timer state and sanitizes saved IDs", () => {
    const state = normalizeStoredTimerState({
      lessonId: "lesson-a",
      lessonTitle: "Bài A",
      isRunning: false,
      isMinimized: false,
      startTimestamp: null,
      accumulatedSeconds: 0,
      autoStartNextSession: true,
      autoStartBreak: true,
      autoStartFocus: false,
      soundAlertsEnabled: false,
      soundVolume: 0.3,
      savedSessionIds: ["one", 2, "three"],
    });
    expect(state).not.toHaveProperty("autoStartNextSession");
    expect(state).not.toHaveProperty("autoStartBreak");
    expect(state).not.toHaveProperty("autoStartFocus");
    expect(state).not.toHaveProperty("soundAlertsEnabled");
    expect(state).not.toHaveProperty("soundVolume");
    expect(state?.savedSessionIds).toEqual(["one", "three"]);
  });

  test("allows only one tab owner until the lock is released", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });
    expect(acquireTimerLock("session-a", "tab-a")).toBe(true);
    expect(acquireTimerLock("session-b", "tab-b")).toBe(false);
    expect(refreshTimerLock("session-a", "tab-a")).toBe(true);
    releaseTimerLock("tab-a");
    expect(acquireTimerLock("session-b", "tab-b")).toBe(true);
  });

  test("reclaims a missing or same-owner lock without stealing another tab's lock", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new MemoryStorage(),
      configurable: true,
    });
    expect(acquireOrRefreshTimerLock("session-a", "tab-a")).toBe(true);
    expect(acquireOrRefreshTimerLock("session-a", "tab-a")).toBe(true);
    expect(acquireOrRefreshTimerLock("session-a", "tab-b")).toBe(false);
  });

  test("keeps owner timer and lock bytes unchanged when a non-owner reaches expiry", async () => {
    const storage = new MemoryStorage();
    Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
    const ownerState = {
      ...createStoredTimerState("lesson-a", "Bài A"),
      isRunning: true,
      startTimestamp: Date.now() - 60_000,
      accumulatedSeconds: 0,
      status: "running" as const,
    };
    expect(saveStoredTimerState(ownerState).ok).toBe(true);
    expect(acquireTimerLock(ownerState.activeTimerSessionId, "owner-tab")).toBe(true);
    const ownerTimerRaw = storage.getItem(TIMER_KEY);
    const ownerLockRaw = storage.getItem(TIMER_LOCK_KEY);

    expect(refreshTimerLock(ownerState.activeTimerSessionId, "non-owner-tab")).toBe(false);
    const localExpiredState = createNonOwnerExpiryLocalState(
      ownerState,
      ownerState.durationMinutes * 60 + 5,
    );

    expect(localExpiredState).toMatchObject({
      isRunning: false,
      startTimestamp: null,
      accumulatedSeconds: ownerState.durationMinutes * 60,
      status: "paused",
    });
    expect(storage.getItem(TIMER_KEY)).toBe(ownerTimerRaw);
    expect(storage.getItem(TIMER_LOCK_KEY)).toBe(ownerLockRaw);
    expect(refreshTimerLock(ownerState.activeTimerSessionId, "owner-tab")).toBe(true);

    const timerModalSource = await readSource("../components/FocusTimerModal.tsx");
    const naturalExpirySource = timerModalSource.slice(
      timerModalSource.indexOf("// Check auto completion at 100% time"),
      timerModalSource.indexOf("const expectedEnd"),
    );
    const startPauseSource = timerModalSource.slice(
      timerModalSource.indexOf("const handleStartPause"),
      timerModalSource.indexOf("const handleReset"),
    );

    expect(naturalExpirySource).toContain("createNonOwnerExpiryLocalState(current, el)");
    expect(naturalExpirySource).not.toContain("acquireTimerLock");
    expect(naturalExpirySource).not.toContain("persistTimerState");
    expect(naturalExpirySource).not.toContain("releaseTimerLock");
    expect(naturalExpirySource).not.toContain("recordFocusSessionAndTimerStateAtomically");
    expect(startPauseSource).toContain(
      "if (!refreshTimerLock(timerState.activeTimerSessionId, timerTabIdRef.current))",
    );
  });

  test("requires confirmation for a timer that expired while the app was closed", () => {
    const state = normalizeStoredTimerState({
      lessonId: "lesson-a",
      lessonTitle: "Bài A",
      durationMinutes: 25,
      isRunning: true,
      isMinimized: false,
      startTimestamp: 1_000,
      accumulatedSeconds: 0,
      activeTimerSessionId: "timer-a",
      savedSessionIds: [],
      status: "running",
    });
    expect(state).not.toBeNull();
    if (!state) return;
    expect(shouldRecoverExpiredTimer(state, 25 * 60 * 1000 + 3_000)).toBe(true);
    expect(
      shouldRecoverExpiredTimer(
        { ...state, savedSessionIds: [state.activeTimerSessionId] },
        25 * 60 * 1000 + 3_000,
      ),
    ).toBe(false);
  });

  test("keeps invalid timer bytes unchanged and reports timer and lock persistence failures", () => {
    const storage = new MemoryStorage();
    Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
    storage.setItem(TIMER_KEY, "{broken");
    expect(loadStoredTimerState().status).toBe("invalid");
    expect(getStoredTimerState()).toBeNull();
    expect(saveStoredTimerState(null).ok).toBe(false);
    expect(storage.getItem(TIMER_KEY)).toBe("{broken");

    storage.removeItem(TIMER_KEY);
    storage.failSet = true;
    expect(
      saveStoredTimerState(normalizeStoredTimerState({ lessonId: "a", lessonTitle: "A" })!).ok,
    ).toBe(false);
    expect(acquireTimerLock("session-a", "tab-a")).toBe(false);
    expect(loadTimerLock().status).toBe("missing");

    storage.failSet = false;
    expect(acquireTimerLock("session-a", "tab-a")).toBe(true);
    storage.mismatchSet = true;
    expect(refreshTimerLock("session-a", "tab-a")).toBe(false);
    expect(releaseTimerLock("tab-a").ok).toBe(false);
    expect(storage.getItem(TIMER_LOCK_KEY)).toBe("mismatch");
  });

  test("does not acknowledge a timer session before both persistence boundaries confirm", () => {
    const current = createStoredTimerState("lesson-a", "Bài A");
    const session = createStudySession({
      id: current.activeTimerSessionId,
      lessonId: current.lessonId,
      durationSeconds: 60,
      source: "focus-timer",
    });
    const next = {
      ...current,
      status: "completed" as const,
      savedSessionIds: [session.id],
    };
    let persistCalls = 0;
    expect(
      recordSessionThenPersistTimerState(
        session,
        () => false,
        next,
        () => {
          persistCalls++;
          return { ok: true };
        },
      ).ok,
    ).toBe(false);
    expect(persistCalls).toBe(0);
    expect(current.savedSessionIds).toEqual([]);

    const storage = new MemoryStorage();
    Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
    storage.failSet = true;
    expect(recordSessionThenPersistTimerState(session, () => true, next).ok).toBe(false);
    expect(current.savedSessionIds).toEqual([]);
    expect(storage.getItem(TIMER_KEY)).toBeNull();
  });

  test("records timer sessions with one verified progress-to-timer transaction", () => {
    const createFixture = () => {
      const storage = new FaultingStorage();
      const progress = createInitialProgressState(false);
      const timer = createStoredTimerState("lesson-a", "Bai A");
      const session = createStudySession({
        id: timer.activeTimerSessionId,
        lessonId: timer.lessonId,
        durationSeconds: 60,
        source: "focus-timer",
      });
      const nextTimer = {
        ...timer,
        status: "completed" as const,
        isRunning: false,
        savedSessionIds: [session.id],
      };
      const progressRaw = JSON.stringify(progress);
      const timerRaw = JSON.stringify(timer);
      storage.values.set(PROGRESS_STORAGE_KEY, progressRaw);
      storage.values.set(TIMER_KEY, timerRaw);
      return { storage, session, nextTimer, progressRaw, timerRaw };
    };

    for (const writePosition of [1, 2, 3]) {
      const fixture = createFixture();
      fixture.storage.failAt.add(writePosition);
      const result = recordFocusSessionAndTimerStateAtomically(
        fixture.session,
        fixture.nextTimer,
        asAdapter(fixture.storage),
      );
      expect(result.ok).toBe(false);
      expect(fixture.storage.values.get(PROGRESS_STORAGE_KEY)).toBe(fixture.progressRaw);
      expect(fixture.storage.values.get(TIMER_KEY)).toBe(fixture.timerRaw);
      if (writePosition > 1) {
        expect(fixture.storage.values.get(FOCUS_TIMER_SESSION_ROLLBACK_KEY)).toBeTruthy();
      }
    }

    for (const writePosition of [1, 2, 3]) {
      const fixture = createFixture();
      fixture.storage.mismatchAt.add(writePosition);
      const result = recordFocusSessionAndTimerStateAtomically(
        fixture.session,
        fixture.nextTimer,
        asAdapter(fixture.storage),
      );
      expect(result.ok).toBe(false);
      expect(fixture.storage.values.get(PROGRESS_STORAGE_KEY)).toBe(fixture.progressRaw);
      expect(fixture.storage.values.get(TIMER_KEY)).toBe(fixture.timerRaw);
    }

    const fixture = createFixture();
    const result = recordFocusSessionAndTimerStateAtomically(
      fixture.session,
      fixture.nextTimer,
      asAdapter(fixture.storage),
    );
    expect(result.ok).toBe(true);
    expect(
      JSON.parse(fixture.storage.values.get(PROGRESS_STORAGE_KEY)!).studySessions,
    ).toHaveLength(1);
    expect(JSON.parse(fixture.storage.values.get(TIMER_KEY)!).savedSessionIds).toEqual([
      fixture.session.id,
    ]);

    const rollbackFailure = createFixture();
    rollbackFailure.storage.failAt.add(3); // timer target
    rollbackFailure.storage.failAt.add(4); // progress rollback
    const failed = recordFocusSessionAndTimerStateAtomically(
      rollbackFailure.session,
      rollbackFailure.nextTimer,
      asAdapter(rollbackFailure.storage),
    );
    expect(failed.ok).toBe(false);
    if (!failed.ok) expect(failed.rollbackError).toBeTruthy();
    expect(rollbackFailure.storage.values.get(FOCUS_TIMER_SESSION_ROLLBACK_KEY)).toBeTruthy();
    expect(rollbackFailure.storage.values.get(PROGRESS_STORAGE_KEY)).toBe(
      rollbackFailure.progressRaw,
    );
    expect(rollbackFailure.storage.values.get(TIMER_KEY)).toBe(rollbackFailure.timerRaw);
  });

  test("commits a session and its rewards once even when completion is retried", () => {
    const storage = new FaultingStorage();
    const progress = createInitialProgressState(false);
    const timer = createStoredTimerState("lesson-a", "Bài A");
    const session = createStudySession({
      id: timer.activeTimerSessionId,
      lessonId: timer.lessonId,
      durationSeconds: 2 * 60,
      source: "focus-timer",
    });
    const nextTimer = {
      ...timer,
      status: "warmup_completed" as const,
      isRunning: false,
      savedSessionIds: [session.id],
    };
    storage.values.set(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    storage.values.set(TIMER_KEY, JSON.stringify(timer));

    const first = recordFocusSessionAndTimerStateAtomically(
      session,
      nextTimer,
      { xp: 5, coins: 1 },
      asAdapter(storage),
    );
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.sessionAdded).toBe(true);
    expect(first.rewardsApplied).toBe(true);

    const second = recordFocusSessionAndTimerStateAtomically(
      session,
      nextTimer,
      { xp: 5, coins: 1 },
      asAdapter(storage),
    );
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.sessionAdded).toBe(false);
    expect(second.rewardsApplied).toBe(false);

    const storedProgress = JSON.parse(storage.values.get(PROGRESS_STORAGE_KEY)!);
    expect(storedProgress.studySessions).toHaveLength(1);
    expect(storedProgress.xp).toBe(5);
    expect(storedProgress.coins).toBe(1);
  });

  test("keeps one app-level timer controller and a status-driven 2-minute continuation UI", async () => {
    const [routeSource, todaySource, modalSource, dialogsSource] = await Promise.all([
      readSource("../routes/index.tsx"),
      readSource("../components/TodayPanel.tsx"),
      readSource("../components/FocusTimerModal.tsx"),
      readSource("../components/focus-timer/FocusTimerDialogs.tsx"),
    ]);

    expect(routeSource.match(/<FocusTimerModal/g)).toHaveLength(1);
    expect(todaySource).not.toContain("<FocusTimerModal");
    expect(modalSource).not.toContain("microStartPrompt");
    expect(modalSource).toContain('open={timerState.status === "warmup_completed"}');
    expect(modalSource).toContain("startFocusDuration(timerState, minutes)");
    expect(modalSource).toContain("acquireOrRefreshTimerLock");
    expect(modalSource).not.toContain("handleBeforeUnload");
    expect(modalSource).toContain("onCompleteLesson");
    expect(modalSource).not.toContain("onToggleComplete");
    expect(modalSource).toContain("hasReachedReviewTarget");
    expect(dialogsSource).toContain("🍅 Học tiếp 25 phút");
    expect(dialogsSource).toContain("🧠 Deep Work 50 phút");
    expect(dialogsSource).toContain("✋ Dừng tại đây");
  });

  test("does not keep a timer-start permission lifecycle helper", async () => {
    expect(timerStore).not.toHaveProperty("requestNotificationPermission");

    const timerModalSource = await readSource("../components/FocusTimerModal.tsx");
    const startPauseSource = timerModalSource.slice(
      timerModalSource.indexOf("const handleStartPause"),
      timerModalSource.indexOf("const handleReset"),
    );

    expect(startPauseSource).not.toContain("requestPermission");
    expect(timerModalSource.match(/Notification\.requestPermission\(/g)).toHaveLength(1);
    const permissionButtons = [
      ...timerModalSource.matchAll(
        /<button(?=[^>]*onClick=\{handleRequestNotif\})[^>]*>[\s\S]*?<\/button>/g,
      ),
    ];

    expect(permissionButtons).toHaveLength(2);
    for (const [permissionButton] of permissionButtons) {
      expect(permissionButton).toContain('aria-label="Bật thông báo trình duyệt"');
      expect(permissionButton).toMatch(/>\s*Bật thông báo trình duyệt\s*<\/button>/);
    }
  });
});
