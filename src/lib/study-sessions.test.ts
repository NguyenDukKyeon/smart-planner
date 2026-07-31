import { describe, expect, test } from "vitest";
import {
  createStudySession,
  reviewSecondsForTask,
  sanitizeStudySessions,
  studyMinutesInWeek,
  studyMinutesOnDate,
  studySecondsOnDate,
} from "./study-sessions";

describe("StudySession selectors", () => {
  test("returns zero when the day has no session", () => {
    expect(studyMinutesOnDate([], "2026-07-25")).toBe(0);
  });

  test("counts manual and timer focus sessions", () => {
    const manual = createStudySession({
      id: "manual-1",
      lessonId: "lesson-a",
      endedAt: "2026-07-25T03:40:00.000Z",
      durationSeconds: 40 * 60,
      source: "manual",
    });
    const timer = createStudySession({
      id: "timer-1",
      lessonId: "lesson-a",
      endedAt: "2026-07-25T04:05:00.000Z",
      durationSeconds: 25 * 60,
      source: "focus-timer",
    });
    expect(studyMinutesOnDate([manual, timer], "2026-07-25")).toBe(65);
  });

  test("tracks review time separately by review task", () => {
    const first = createStudySession({
      id: "review-1",
      lessonId: "lesson-a",
      endedAt: "2026-07-25T04:05:00.000Z",
      durationSeconds: 5 * 60,
      source: "focus-timer",
      reviewTaskId: "review:lesson-a:2026-07-25",
    });
    const second = createStudySession({
      id: "review-2",
      lessonId: "lesson-a",
      endedAt: "2026-07-25T04:15:00.000Z",
      durationSeconds: 10 * 60,
      source: "focus-timer",
      reviewTaskId: "review:lesson-a:2026-07-25",
    });
    const normal = createStudySession({
      id: "normal",
      lessonId: "lesson-a",
      endedAt: "2026-07-25T04:20:00.000Z",
      durationSeconds: 5 * 60,
      source: "focus-timer",
    });
    expect(reviewSecondsForTask([first, second, normal], first.reviewTaskId!)).toBe(15 * 60);
  });

  test("splits active duration when a session crosses local midnight", () => {
    const session = createStudySession({
      id: "midnight",
      lessonId: "lesson-a",
      endedAt: "2026-07-24T17:01:00.000Z",
      durationSeconds: 2 * 60,
      source: "focus-timer",
    });
    expect(studySecondsOnDate([session], "2026-07-24")).toBe(60);
    expect(studySecondsOnDate([session], "2026-07-25")).toBe(60);
    expect(studyMinutesInWeek([session], "2026-07-24")).toBe(2);
  });

  test("drops invalid and duplicate persisted sessions", () => {
    const valid = createStudySession({
      id: "stable-id",
      lessonId: "lesson-a",
      endedAt: "2026-07-25T04:05:00.000Z",
      durationSeconds: 60,
      source: "focus-timer",
    });
    const invalid = { ...valid, id: "invalid", durationSeconds: 0 };
    expect(sanitizeStudySessions([valid, valid, invalid])).toEqual([valid]);
  });
});
