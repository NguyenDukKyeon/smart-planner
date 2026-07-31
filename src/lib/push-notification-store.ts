import type { Lesson, Subject } from "./mock-data";

export type PushNotificationType =
  "SCHEDULE_REMINDER" | "DEADLINE_ALERT" | "STREAK_GUARD" | "SPACED_REPETITION" | "HABIT_REMINDER";

export interface PushNotificationPayload {
  id: string;
  type: PushNotificationType;
  title: string;
  body: string;
  timestamp: string;
  lessonId?: string;
  lessonTitle?: string;
  subjectName?: string;
  topic?: string;
  plannedMinutes?: number;
  xp?: number;
  urgent?: boolean;
  /** SNOOZED is kept for history written by earlier app versions. */
  actionTaken?: "FOCUS_STARTED" | "SNOOZED" | "COMPLETED" | "DISMISSED";
}

export interface PushPreferences {
  enabled: boolean;
  soundEnabled: boolean;
  volume: number;
  /** Bật riêng lời nhắc xem kế hoạch buổi sáng. */
  morningEnabled: boolean;
  /** Giờ gửi lời nhắc kế hoạch buổi sáng. */
  morningTime: string;
  /** Bật riêng lời nhắc bắt đầu học buổi tối. */
  eveningEnabled: boolean;
  /** Giờ nhắc bắt đầu học buổi tối. */
  eveningTime: string;
  /** Giờ kiểm tra tiến độ cuối ngày. */
  endOfDayTime: string;
  enableStreakGuard: boolean;
  /** Giá trị cũ được giữ để tương thích dữ liệu; giao diện hiện không tạo lịch hoãn. */
  snoozeMinutes: number;
}

export const PUSH_PREFERENCES_KEY = "hocvien_push_preferences_v1";
export const PUSH_HISTORY_KEY = "hocvien_push_history_v1";

export const DEFAULT_PUSH_PREFERENCES: PushPreferences = {
  enabled: false,
  soundEnabled: false,
  volume: 0.6,
  morningEnabled: true,
  morningTime: "07:00",
  eveningEnabled: true,
  eveningTime: "19:30",
  endOfDayTime: "22:00",
  enableStreakGuard: false,
  snoozeMinutes: 10,
};

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) audioCtx = new AudioCtxClass();
  }
  if (audioCtx?.state === "suspended") audioCtx.resume();
  return audioCtx;
}

/** Chỉ phát âm thanh khi người dùng bấm xem trước trong giao diện. */
export function playPushNotificationChime(urgent = false, volume = 0.6) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const boundedVolume = Math.min(1, Math.max(0.1, volume));
    const notes = urgent
      ? [
          { frequency: 880, offset: 0, duration: 0.15, gain: 0.35 },
          { frequency: 1046.5, offset: 0.12, duration: 0.18, gain: 0.4 },
          { frequency: 1318.5, offset: 0.25, duration: 0.35, gain: 0.45 },
        ]
      : [
          { frequency: 659.25, offset: 0, duration: 0.4, gain: 0.3 },
          { frequency: 880, offset: 0.15, duration: 0.8, gain: 0.35 },
        ];

    notes.forEach((note) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = urgent ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(note.frequency, now + note.offset);
      gain.gain.setValueAtTime(0.001, now + note.offset);
      gain.gain.linearRampToValueAtTime(note.gain * boundedVolume, now + note.offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.offset + note.duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now + note.offset);
      oscillator.stop(now + note.offset + note.duration);
    });
  } catch {
    // Browsers may reject audio outside a user gesture.
  }
}

export function normalizePushPreferences(value: unknown): PushPreferences {
  const parsed = value && typeof value === "object" ? (value as Partial<PushPreferences>) : {};
  const isTime = (time: unknown): time is string =>
    typeof time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  const volume = Number(parsed.volume);
  return {
    enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : DEFAULT_PUSH_PREFERENCES.enabled,
    soundEnabled:
      typeof parsed.soundEnabled === "boolean"
        ? parsed.soundEnabled
        : DEFAULT_PUSH_PREFERENCES.soundEnabled,
    volume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : DEFAULT_PUSH_PREFERENCES.volume,
    morningEnabled:
      typeof parsed.morningEnabled === "boolean"
        ? parsed.morningEnabled
        : DEFAULT_PUSH_PREFERENCES.morningEnabled,
    morningTime: isTime(parsed.morningTime) ? parsed.morningTime : DEFAULT_PUSH_PREFERENCES.morningTime,
    eveningEnabled:
      typeof parsed.eveningEnabled === "boolean"
        ? parsed.eveningEnabled
        : DEFAULT_PUSH_PREFERENCES.eveningEnabled,
    eveningTime: isTime(parsed.eveningTime) ? parsed.eveningTime : DEFAULT_PUSH_PREFERENCES.eveningTime,
    endOfDayTime: isTime(parsed.endOfDayTime) ? parsed.endOfDayTime : DEFAULT_PUSH_PREFERENCES.endOfDayTime,
    enableStreakGuard:
      typeof parsed.enableStreakGuard === "boolean"
        ? parsed.enableStreakGuard
        : DEFAULT_PUSH_PREFERENCES.enableStreakGuard,
    snoozeMinutes:
      typeof parsed.snoozeMinutes === "number" && Number.isFinite(parsed.snoozeMinutes)
        ? Math.max(0, Math.round(parsed.snoozeMinutes))
        : DEFAULT_PUSH_PREFERENCES.snoozeMinutes,
  };
}

export function getPushPreferences(): PushPreferences {
  if (typeof window === "undefined") return { ...DEFAULT_PUSH_PREFERENCES };
  try {
    const raw = localStorage.getItem(PUSH_PREFERENCES_KEY);
    if (!raw) return { ...DEFAULT_PUSH_PREFERENCES };
    return normalizePushPreferences(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PUSH_PREFERENCES };
  }
}

export function savePushPreferences(prefs: PushPreferences) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PUSH_PREFERENCES_KEY, JSON.stringify(normalizePushPreferences(prefs)));
  } catch {
    // Preferences are optional and must not cause a false success message.
  }
}

export function getPushHistory(): PushNotificationPayload[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PUSH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePushHistory(history: PushNotificationPayload[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PUSH_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  } catch {
    // History is supplementary and must not interrupt the study flow.
  }
}

export function recordPushAction(
  id: string,
  action: "FOCUS_STARTED" | "SNOOZED" | "COMPLETED" | "DISMISSED",
) {
  const history = getPushHistory();
  const index = history.findIndex((item) => item.id === id);
  if (index === -1) return;
  history[index].actionTaken = action;
  savePushHistory(history);
}

type LessonContext = { lesson: Lesson; subjectName: string };

function findFirstIncompleteLesson(
  subjects: Subject[],
  completedLessons: Record<string, string>,
): LessonContext | null {
  for (const subject of subjects) {
    for (const milestone of subject.milestones) {
      for (const lesson of milestone.lessons) {
        if (!completedLessons[lesson.id]) return { lesson, subjectName: subject.name };
      }
    }
  }
  return null;
}

/**
 * Creates a manual in-app simulation only when it can describe a real,
 * incomplete lesson. Empty or completed catalogs intentionally return null.
 */
export function generatePushPayload(
  type: PushNotificationType,
  subjects: Subject[],
  completedLessons: Record<string, string>,
  streak = 0,
): PushNotificationPayload | null {
  const context = findFirstIncompleteLesson(subjects, completedLessons);
  if (!context) return null;

  const { lesson, subjectName } = context;
  const timestamp = new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const id = `push_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const lessonDetails = {
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    subjectName,
    topic: lesson.topic,
    plannedMinutes: lesson.plannedDurationMinutes,
    xp: lesson.xp,
  };

  switch (type) {
    case "SCHEDULE_REMINDER":
      return {
        id,
        type,
        title: "Nhắc học bài đã lên kế hoạch",
        body: `Bài "${lesson.title}" môn ${subjectName} dự kiến ${lesson.plannedDurationMinutes} phút.`,
        timestamp,
        ...lessonDetails,
      };
    case "DEADLINE_ALERT":
      return {
        id,
        type,
        title: "Kiểm tra hạn hoàn thành bài học",
        body: `Bài "${lesson.title}" môn ${subjectName} đang cần bạn xem lại kế hoạch.`,
        timestamp,
        urgent: true,
        ...lessonDetails,
      };
    case "STREAK_GUARD":
      return {
        id,
        type,
        title: `Nhắc lại tiến độ học (${streak} ngày học liên tiếp)`,
        body: `Bạn có thể tiếp tục với bài "${lesson.title}" môn ${subjectName}.`,
        timestamp,
        urgent: true,
        ...lessonDetails,
      };
    case "SPACED_REPETITION":
      return {
        id,
        type,
        title: "Gợi ý ôn lại bài học",
        body: `Bạn có thể ôn lại bài "${lesson.title}" môn ${subjectName}.`,
        timestamp,
        ...lessonDetails,
      };
    case "HABIT_REMINDER":
      return {
        id,
        type,
        title: "Nhắc việc trong kế hoạch học tập",
        body: `Bạn có thể bắt đầu bài "${lesson.title}" môn ${subjectName}.`,
        timestamp,
        ...lessonDetails,
      };
  }
}
