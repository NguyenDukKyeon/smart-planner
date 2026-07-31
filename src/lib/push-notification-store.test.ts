import { afterEach, describe, expect, test } from "vitest";
import type { Subject } from "./mock-data";
import {
  DEFAULT_PUSH_PREFERENCES,
  generatePushPayload,
  getPushHistory,
  getPushPreferences,
  recordPushAction,
  savePushHistory,
} from "./push-notification-store";

class MemoryStorage {
  readonly values = new Map<string, string>();

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

function installBrowserStorage() {
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, "window", { value: {}, configurable: true });
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
  return storage;
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
  Reflect.deleteProperty(globalThis, "localStorage");
});

const subjects: Subject[] = [
  {
    id: "math",
    name: "Toán",
    emoji: "📘",
    milestones: [
      {
        id: "m1",
        title: "Chương 1",
        subtitle: "",
        lessons: [
          {
            id: "lesson-1",
            title: "Hàm số bậc hai",
            topic: "Đại số",
            xp: 18,
            plannedDurationMinutes: 35,
            scheduledDate: "2026-07-26",
            weekday: "Saturday",
            sourceSubject: "Toán",
            week: 1,
            initialDone: false,
          },
        ],
      },
    ],
  },
];

describe("push notification opt-in and data boundaries", () => {
  test("uses fully disabled defaults for a fresh user", () => {
    expect(DEFAULT_PUSH_PREFERENCES.enabled).toBe(false);
    expect(DEFAULT_PUSH_PREFERENCES.soundEnabled).toBe(false);
    expect(DEFAULT_PUSH_PREFERENCES.enableStreakGuard).toBe(false);
    expect(getPushPreferences()).toMatchObject({
      enabled: false,
      soundEnabled: false,
      enableStreakGuard: false,
    });
  });

  test("preserves explicit returning-user preferences", () => {
    const storage = installBrowserStorage();
    storage.setItem(
      "hocvien_push_preferences_v1",
      JSON.stringify({ enabled: true, soundEnabled: true, enableStreakGuard: true, volume: 0.25 }),
    );

    expect(getPushPreferences()).toMatchObject({
      enabled: true,
      soundEnabled: true,
      enableStreakGuard: true,
      volume: 0.25,
    });
  });

  test("does not fabricate a notification for an empty or completed catalog", () => {
    expect(generatePushPayload("SCHEDULE_REMINDER", [], {})).toBeNull();
    expect(
      generatePushPayload("DEADLINE_ALERT", subjects, { "lesson-1": "2026-07-26" }),
    ).toBeNull();
  });

  test("manual simulation carries only a real lesson's fields", () => {
    const payload = generatePushPayload("SCHEDULE_REMINDER", subjects, {}, 4);

    expect(payload).not.toBeNull();
    expect(payload).toMatchObject({
      lessonId: "lesson-1",
      lessonTitle: "Hàm số bậc hai",
      subjectName: "Toán",
      plannedMinutes: 35,
      xp: 18,
    });
  });

  test("records a new dismiss without rewriting legacy SNOOZED history", () => {
    installBrowserStorage();
    savePushHistory([
      {
        id: "legacy",
        type: "SCHEDULE_REMINDER",
        title: "Lịch sử cũ",
        body: "",
        timestamp: "08:00",
        actionTaken: "SNOOZED",
      },
      {
        id: "current",
        type: "SCHEDULE_REMINDER",
        title: "Lịch sử mới",
        body: "",
        timestamp: "08:01",
      },
    ]);

    recordPushAction("current", "DISMISSED");
    expect(getPushHistory().map((item) => item.actionTaken)).toEqual(["SNOOZED", "DISMISSED"]);
  });
});
