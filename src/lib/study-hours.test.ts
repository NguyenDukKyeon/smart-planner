import { describe, expect, test } from "vitest";
import {
  DAILY_STUDY_HOURS_STEP,
  HIGH_DAILY_STUDY_HOURS_THRESHOLD,
  MAX_DAILY_STUDY_HOURS,
  MIN_DAILY_STUDY_HOURS,
  isHighDailyStudyHours,
  normalizeDailyStudyHours,
} from "./study-hours";

describe("daily study-hour policy", () => {
  test("exports the approved range and step", () => {
    expect(MIN_DAILY_STUDY_HOURS).toBe(0);
    expect(MAX_DAILY_STUDY_HOURS).toBe(16);
    expect(DAILY_STUDY_HOURS_STEP).toBe(0.5);
    expect(HIGH_DAILY_STUDY_HOURS_THRESHOLD).toBe(12);
  });

  test.each([
    [-1, 0],
    [0, 0],
    [0.24, 0],
    [0.25, 0.5],
    [12, 12],
    [12.24, 12],
    [12.26, 12.5],
    [15.5, 15.5],
    [16, 16],
    [16.5, 16],
  ])("normalizes %s hours to %s", (input, expected) => {
    expect(normalizeDailyStudyHours(input)).toBe(expected);
  });

  test("normalizes non-finite values to the minimum at the pure policy boundary", () => {
    expect(normalizeDailyStudyHours(Number.NaN)).toBe(0);
    expect(normalizeDailyStudyHours(Number.POSITIVE_INFINITY)).toBe(0);
  });

  test("marks only allowed values above twelve hours as high", () => {
    expect(isHighDailyStudyHours(12)).toBe(false);
    expect(isHighDailyStudyHours(12.5)).toBe(true);
    expect(isHighDailyStudyHours(16)).toBe(true);
    expect(isHighDailyStudyHours(Number.NaN)).toBe(false);
  });
});
