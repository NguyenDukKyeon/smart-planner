import { afterEach, describe, expect, test } from "vitest";
import {
  DEFAULT_FOCUS_PREFERENCES,
  FOCUS_PREFERENCES_KEY,
  loadFocusPreferences,
  saveFocusPreferences,
} from "./focus-preferences";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "localStorage");
});

describe("Pomodoro preferences", () => {
  test("saves preferences independently from active timer state", () => {
    const storage = new MemoryStorage();
    const saved = saveFocusPreferences(
      { defaultFocusMinutes: 50, autoStartBreak: true, soundVolume: 0.8 },
      storage,
    );
    expect(saved.ok).toBe(true);
    expect(storage.getItem(FOCUS_PREFERENCES_KEY)).not.toBeNull();
    expect(storage.getItem("hocvien-focus-timer-v2")).toBeNull();
    expect(loadFocusPreferences(storage)).toMatchObject({
      defaultFocusMinutes: 50,
      autoStartBreak: true,
      soundVolume: 0.8,
    });
  });

  test("migrates legacy timer preferences once", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      "hocvien-focus-timer-v2",
      JSON.stringify({
        lessonId: "lesson-a",
        lessonTitle: "Bài A",
        durationMinutes: 90,
        autoStartBreak: true,
        autoStartFocus: false,
        soundAlertsEnabled: false,
        soundVolume: 0.3,
      }),
    );
    expect(loadFocusPreferences(storage)).toMatchObject({
      defaultFocusMinutes: 90,
      autoStartBreak: true,
      autoStartFocus: false,
      soundAlertsEnabled: false,
      soundVolume: 0.3,
    });
    expect(storage.getItem(FOCUS_PREFERENCES_KEY)).not.toBeNull();
  });

  test("falls back safely when storage is unavailable", () => {
    expect(loadFocusPreferences(null)).toEqual(DEFAULT_FOCUS_PREFERENCES);
  });
});
