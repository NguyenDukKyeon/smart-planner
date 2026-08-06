import { describe, expect, test } from "vitest";
import type { Lesson } from "./mock-data";
import {
  calculateMinimumHorizonWeeks,
  deriveFlexibleScheduleDayMetrics,
  filterFlexibleScheduleItems,
  isFlexibleScheduleAttentionDay,
  type FlexibleScheduleWorkspaceItem,
} from "./flexible-schedule-workspace";

type TestItem = FlexibleScheduleWorkspaceItem & { id: string };

function item(params: {
  id: string;
  subjectId: string;
  kind?: "lesson" | "review";
  mode?: Lesson["scheduleMode"];
  unplacedFixed?: boolean;
}): TestItem {
  return {
    id: params.id,
    subjectId: params.subjectId,
    kind: params.kind ?? "lesson",
    lesson: { scheduleMode: params.mode },
    unplacedFixed: params.unplacedFixed,
  };
}

const items = [
  item({ id: "math-fixed", subjectId: "math", mode: "fixed" }),
  item({ id: "math-flex", subjectId: "math", mode: "flexible" }),
  item({ id: "math-unplaced", subjectId: "math", mode: "fixed", unplacedFixed: true }),
  item({ id: "math-review", subjectId: "math", kind: "review" }),
  item({ id: "english-flex", subjectId: "english", mode: "flexible" }),
];

describe("filterFlexibleScheduleItems", () => {
  test("combines subject and all-status filtering", () => {
    expect(
      filterFlexibleScheduleItems(items, { subjectId: "math", statusFilter: "all" }).map(
        (entry) => entry.id,
      ),
    ).toEqual(["math-fixed", "math-flex", "math-unplaced", "math-review"]);
  });

  test("shows fixed lessons including unplaced fixed work", () => {
    expect(
      filterFlexibleScheduleItems(items, { subjectId: "all", statusFilter: "fixed" }).map(
        (entry) => entry.id,
      ),
    ).toEqual(["math-fixed", "math-unplaced"]);
  });

  test("shows flexible ordinary lessons and excludes reviews", () => {
    expect(
      filterFlexibleScheduleItems(items, { subjectId: "all", statusFilter: "flexible" }).map(
        (entry) => entry.id,
      ),
    ).toEqual(["math-flex", "english-flex"]);
  });

  test("keeps subject context intact in day-level attention mode", () => {
    expect(
      filterFlexibleScheduleItems(items, { subjectId: "math", statusFilter: "attention" }).map(
        (entry) => entry.id,
      ),
    ).toEqual(["math-fixed", "math-flex", "math-unplaced", "math-review"]);
  });
});

describe("day diagnostics", () => {
  test.each([
    [{ overloadMinutes: 1, unplacedFixedMinutes: 0 }, true],
    [{ overloadMinutes: 0, unplacedFixedMinutes: 30 }, true],
    [{ overloadMinutes: 0, unplacedFixedMinutes: 0 }, false],
  ] as const)("detects attention state %#", (queue, expected) => {
    expect(isFlexibleScheduleAttentionDay(queue)).toBe(expected);
  });

  test("does not count unplaced fixed minutes as scheduled", () => {
    expect(
      deriveFlexibleScheduleDayMetrics({
        quotaMinutes: 360,
        newMinutes: 240,
        reviewMinutes: 30,
        unallocatedMinutes: 90,
        overloadMinutes: 0,
        unplacedFixedMinutes: 60,
      }),
    ).toEqual({
      quotaMinutes: 360,
      scheduledMinutes: 270,
      newMinutes: 240,
      reviewMinutes: 30,
      unallocatedMinutes: 90,
      overloadMinutes: 0,
      unplacedFixedMinutes: 60,
      attentionRequired: true,
    });
  });
});

describe("calculateMinimumHorizonWeeks", () => {
  test("uses one week inside the partial first week", () => {
    expect(
      calculateMinimumHorizonWeeks({
        todayDateISO: "2030-01-02",
        targetDateISO: "2030-01-06",
      }),
    ).toEqual({ weeks: 1, includesTarget: true, reason: "included" });
  });

  test("returns the minimum later whole-week count", () => {
    expect(
      calculateMinimumHorizonWeeks({
        todayDateISO: "2030-01-02",
        targetDateISO: "2030-01-15",
      }),
    ).toEqual({ weeks: 3, includesTarget: true, reason: "included" });
  });

  test("bounds a far-future target", () => {
    expect(
      calculateMinimumHorizonWeeks({
        todayDateISO: "2030-01-02",
        targetDateISO: "2032-01-01",
      }),
    ).toEqual({ weeks: 52, includesTarget: false, reason: "beyond-max" });
  });

  test("reports that forward expansion cannot include a past target", () => {
    expect(
      calculateMinimumHorizonWeeks({
        todayDateISO: "2030-01-02",
        targetDateISO: "2030-01-01",
      }),
    ).toEqual({ weeks: 1, includesTarget: false, reason: "before-start" });
  });
});
