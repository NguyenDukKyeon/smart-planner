import { afterEach, describe, expect, test } from "vitest";
import {
  createInitialProgressState,
  LESSON_COMPLETION_BONUS_XP,
  LESSON_COMPLETION_COINS,
  completeLessonCompletionState,
  computeStudyStreak,
  getLessonCompletedSeconds,
  getWeekDates,
  isStudyDay,
  loadProgressStorage,
  migrateProgressState,
  PROGRESS_STORAGE_KEY,
  SCHEMA_VERSION,
  saveProgressStorage,
  toggleLessonCompletionState,
  UNDATED_COMPLETION,
} from "./progress-store";
import { addDaysISO, localDayBoundsEpoch, todayISO } from "./date-utils";
import { createStudySession, type StudySession } from "./study-sessions";

class MemoryStorage {
  private values = new Map<string, string>();
  failWrites = false;
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new Error("quota");
    this.values.set(key, value);
  }
  removeItem(key: string) {
    if (this.failWrites) throw new Error("quota");
    this.values.delete(key);
  }
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "localStorage");
});

describe("progress migration", () => {
  test("builds local weekly ranges from Monday through Sunday", () => {
    expect(getWeekDates(new Date("2026-07-26T12:00:00.000Z"))).toEqual([
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
      "2026-07-24",
      "2026-07-25",
      "2026-07-26",
    ]);
  });

  test("creates a genuinely empty first-run state that still needs onboarding", () => {
    const result = migrateProgressState(null);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(result.state.studySessions).toEqual([]);
    expect(result.state.completedLessons).toEqual({});
    expect(result.state.xp).toBe(0);
    expect(result.state.coins).toBe(0);
    expect(result.state.onboardingComplete).toBe(false);
    expect(result.needsBackup).toBe(false);
  });

  test("awards and removes the exact lesson reward without allowing toggle farming", () => {
    const base = createInitialProgressState(false);
    const completed = toggleLessonCompletionState(base, "lesson-a", 20, "2026-07-25");
    expect(completed.xp).toBe(20 + LESSON_COMPLETION_BONUS_XP);
    expect(completed.coins).toBe(LESSON_COMPLETION_COINS);

    const undone = toggleLessonCompletionState(completed, "lesson-a", 20, "2026-07-25");
    expect(undone.xp).toBe(base.xp);
    expect(undone.coins).toBe(base.coins);

    const completedAgain = toggleLessonCompletionState(undone, "lesson-a", 20, "2026-07-25");
    expect(completedAgain.xp).toBe(completed.xp);
    expect(completedAgain.coins).toBe(completed.coins);
  });

  test("keeps exact seconds for timer completion thresholds", () => {
    const base = createInitialProgressState(false);
    const session = createStudySession({
      id: "exact-threshold",
      lessonId: "lesson-a",
      durationSeconds: 119 * 60 + 30,
      source: "focus-timer",
    });
    expect(getLessonCompletedSeconds("lesson-a", { ...base, studySessions: [session] })).toBe(
      119 * 60 + 30,
    );
  });

  test("completes a lesson idempotently without toggling it back", () => {
    const base = createInitialProgressState(false);
    const completed = completeLessonCompletionState(base, "lesson-a", 20, "2026-07-25");
    const completedAgain = completeLessonCompletionState(completed, "lesson-a", 20, "2026-07-26");
    expect(completedAgain).toBe(completed);
    expect(completedAgain.completedLessons["lesson-a"]).toBe("2026-07-25");
    expect(completedAgain.xp).toBe(completed.xp);
    expect(completedAgain.coins).toBe(completed.coins);
  });

  test("undoes a legacy completion using its migrated legacy reward only", () => {
    const migrated = migrateProgressState(
      JSON.stringify({
        schemaVersion: 5,
        completedLessons: { legacy: "2026-07-20" },
        lessonXp: { legacy: 25 },
        xp: 125,
        coins: 42,
      }),
    );
    expect(migrated.ok).toBe(true);
    if (!migrated.ok) return;

    const undone = toggleLessonCompletionState(migrated.state, "legacy", 25, "2026-07-25");
    expect(undone.xp).toBe(100);
    expect(undone.coins).toBe(40);
  });

  test("preserves undated legacy completion without inventing today's date", () => {
    const result = migrateProgressState(
      JSON.stringify({
        schemaVersion: 2,
        completedLessons: { "lesson-a": true },
        lessonXp: { "lesson-a": 25 },
        xp: 25,
        coins: 2,
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.completedLessons["lesson-a"]).toBe(UNDATED_COMPLETION);
    expect(result.state.lessonXp["lesson-a"]).toBe(25);
    expect(result.state.studySessions).toEqual([]);
    expect(result.state.habitDefinitions.length).toBeGreaterThan(0);
    expect(result.state.onboardingComplete).toBe(true);
    expect(result.needsBackup).toBe(true);
  });

  test("rejects corrupt data instead of replacing it with defaults", () => {
    const result = migrateProgressState("{not-json");
    expect(result.ok).toBe(false);
  });

  test("rejects a schema newer than the app", () => {
    const result = migrateProgressState(JSON.stringify({ schemaVersion: SCHEMA_VERSION + 1 }));
    expect(result.ok).toBe(false);
  });

  test("counts a real focus session as a study day without lesson completion", () => {
    const result = migrateProgressState(null);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const today = todayISO();
    const midday = new Date(localDayBoundsEpoch(today).start + 12 * 60 * 60 * 1000);
    const session = createStudySession({
      id: "today-session",
      lessonId: "lesson-a",
      endedAt: midday.toISOString(),
      durationSeconds: 25 * 60,
      source: "focus-timer",
    });
    const state = {
      ...result.state,
      onboardingComplete: true,
      studySessions: [session],
    };
    expect(computeStudyStreak(state)).toBe(1);
  });

  test("uses the same study-day predicate for today's and past-dated lessons", () => {
    const today = todayISO();
    const yesterday = addDaysISO(today, -1);
    const state = {
      ...createInitialProgressState(false),
      completedLessons: { "lesson-today": today, "lesson-yesterday": yesterday },
    };

    expect(isStudyDay(state, today)).toBe(true);
    expect(isStudyDay(state, yesterday)).toBe(true);
  });

  test("keeps historical study-habit evidence after the definition is archived or deleted", () => {
    const dateISO = "2026-07-24";
    const base = createInitialProgressState(false);
    const archivedStudyDefinition = base.habitDefinitions.find((habit) => habit.id === "study");
    if (!archivedStudyDefinition) throw new Error("Expected the default study habit");

    const archived = {
      ...base,
      habitDefinitions: [{ ...archivedStudyDefinition, archived: true }],
      habitLog: { [dateISO]: { study: true } },
    };
    const deleted = { ...archived, habitDefinitions: [] };

    expect(isStudyDay(archived, dateISO)).toBe(true);
    expect(isStudyDay(deleted, dateISO)).toBe(true);
  });

  test("counts focus-session overlap on both Asia/Ho_Chi_Minh calendar dates", () => {
    const session = createStudySession({
      id: "cross-midnight",
      lessonId: "lesson-a",
      endedAt: "2026-07-24T17:01:00.000Z",
      durationSeconds: 2 * 60,
      source: "focus-timer",
    });
    const state = { ...createInitialProgressState(false), studySessions: [session] };

    expect(isStudyDay(state, "2026-07-24")).toBe(true);
    expect(isStudyDay(state, "2026-07-25")).toBe(true);
  });

  test("rejects undated, empty, non-focus, and zero-duration activity as study evidence", () => {
    const dateISO = "2026-07-24";
    const valid = createStudySession({
      id: "valid-session",
      lessonId: "lesson-a",
      endedAt: "2026-07-24T03:00:00.000Z",
      durationSeconds: 60,
      source: "focus-timer",
    });
    const nonFocus = { ...valid, id: "non-focus", cycleMode: "break" } as unknown as StudySession;
    const zeroDuration = { ...valid, id: "zero-duration", durationSeconds: 0 };
    const base = createInitialProgressState(false);

    expect(isStudyDay(base, dateISO)).toBe(false);
    expect(isStudyDay({ ...base, completedLessons: { legacy: UNDATED_COMPLETION } }, dateISO)).toBe(
      false,
    );
    expect(isStudyDay({ ...base, studySessions: [nonFocus, zeroDuration] }, dateISO)).toBe(false);
  });

  test("preserves an intentionally empty customizable habit catalog", () => {
    const first = migrateProgressState(null);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const result = migrateProgressState(
      JSON.stringify({
        ...first.state,
        onboardingComplete: true,
        habitDefinitions: [],
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.habitDefinitions).toEqual([]);
  });

  test("reports missing, malformed, and structurally invalid progress without replacing raw bytes", () => {
    const storage = new MemoryStorage();
    Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
    expect(loadProgressStorage().status).toBe("missing");

    storage.setItem(PROGRESS_STORAGE_KEY, "{broken");
    const malformed = loadProgressStorage();
    expect(malformed.status).toBe("invalid");
    if (malformed.status === "invalid") expect(malformed.raw).toBe("{broken");

    const newer = JSON.stringify({ schemaVersion: SCHEMA_VERSION + 1 });
    storage.setItem("hocvien-progress-v2", newer);
    const invalidShape = loadProgressStorage();
    expect(invalidShape.status).toBe("invalid");
    expect(storage.getItem(PROGRESS_STORAGE_KEY)).toBe(newer);
  });

  test("refuses invalid or failed progress writes without changing the verified raw value", () => {
    const storage = new MemoryStorage();
    Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
    storage.setItem(PROGRESS_STORAGE_KEY, "{corrupt-progress");

    expect(saveProgressStorage(createInitialProgressState(false)).ok).toBe(false);
    expect(storage.getItem(PROGRESS_STORAGE_KEY)).toBe("{corrupt-progress");

    const previous = JSON.stringify(createInitialProgressState(false));
    storage.setItem(PROGRESS_STORAGE_KEY, previous);
    storage.failWrites = true;
    expect(saveProgressStorage({ ...createInitialProgressState(false), xp: 10 }).ok).toBe(false);
    expect(storage.getItem(PROGRESS_STORAGE_KEY)).toBe(previous);
  });
});
