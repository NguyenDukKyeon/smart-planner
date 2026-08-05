import { describe, expect, test } from "vitest";
import type { Lesson } from "./mock-data";
import {
  deriveLessonPlacementReason,
  deriveReviewPlacementReason,
  sanitizeLessonPlacementProvenance,
} from "./lesson-placement";

const valid = {
  kind: "manual-move" as const,
  movedAt: "2030-01-03T04:05:06.000Z",
  fromDateISO: "2030-01-01",
  toDateISO: "2030-01-03",
};

function lesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: "lesson-1",
    title: "Bài kiểm thử",
    xp: 20,
    plannedDurationMinutes: 60,
    scheduledDate: "2030-01-03",
    scheduleMode: "flexible",
    weekday: "T5",
    sourceSubject: "Toán",
    week: 1,
    initialDone: false,
    ...overrides,
  };
}

describe("sanitizeLessonPlacementProvenance", () => {
  test("returns a detached valid provenance object", () => {
    const result = sanitizeLessonPlacementProvenance(valid);
    expect(result).toEqual(valid);
    expect(result).not.toBe(valid);
  });

  test.each([
    null,
    {},
    { ...valid, kind: "imported" },
    { ...valid, fromDateISO: "2030-02-30" },
    { ...valid, toDateISO: "not-a-date" },
    { ...valid, toDateISO: valid.fromDateISO },
    { ...valid, movedAt: "not-a-time" },
  ])("rejects malformed provenance %#", (value) => {
    expect(sanitizeLessonPlacementProvenance(value)).toBeUndefined();
  });
});

describe("deriveLessonPlacementReason", () => {
  test("fixed today wins over manual move but keeps manual detail", () => {
    const reason = deriveLessonPlacementReason({
      lesson: lesson({
        scheduleMode: "fixed",
        scheduledDate: "2030-01-03",
        placementProvenance: valid,
      }),
      assignedDateISO: "2030-01-03",
    });

    expect(reason.kind).toBe("fixed-today");
    expect(reason.label).toBe("Cố định hôm nay");
    expect(reason.manualMove).toEqual(valid);
  });

  test("manual move is primary when its target is the assigned date", () => {
    const reason = deriveLessonPlacementReason({
      lesson: lesson({ scheduledDate: "2030-01-03", placementProvenance: valid }),
      assignedDateISO: "2030-01-03",
    });

    expect(reason.kind).toBe("manual-move");
  });

  test("capacity carry wins when assignment is later than the move target", () => {
    const reason = deriveLessonPlacementReason({
      lesson: lesson({ scheduledDate: "2030-01-03", placementProvenance: valid }),
      assignedDateISO: "2030-01-05",
    });

    expect(reason.kind).toBe("carried-from-earlier-date");
    expect(reason.manualMove).toEqual(valid);
  });

  test("ordinary flexible work uses roadmap fallback", () => {
    expect(
      deriveLessonPlacementReason({
        lesson: lesson({ scheduledDate: "2030-01-03" }),
        assignedDateISO: "2030-01-03",
      }).kind,
    ).toBe("next-in-roadmap");
  });
});

test("review reason uses the supplied interval", () => {
  expect(deriveReviewPlacementReason({ ageDays: 7 })).toEqual({
    kind: "review-due",
    label: "Ôn sau 7 ngày",
    description: "Bài đến lượt ôn theo mốc nhắc sau 7 ngày.",
    reviewAgeDays: 7,
  });
});
