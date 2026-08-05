import { describe, expect, test } from "vitest";
import { sanitizeLessonPlacementProvenance } from "./lesson-placement";

const valid = {
  kind: "manual-move" as const,
  movedAt: "2030-01-03T04:05:06.000Z",
  fromDateISO: "2030-01-01",
  toDateISO: "2030-01-03",
};

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
