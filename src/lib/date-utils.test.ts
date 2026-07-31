import { describe, expect, test } from "vitest";
import { addDaysISO, getLocalWeekRange, isSameLocalDay, localDateISO } from "./date-utils";

describe("Asia/Ho_Chi_Minh calendar helpers", () => {
  test("uses the product timezone around midnight", () => {
    expect(localDateISO(new Date("2026-07-24T16:59:00.000Z"))).toBe("2026-07-24");
    expect(localDateISO(new Date("2026-07-24T17:05:00.000Z"))).toBe("2026-07-25");
    expect(isSameLocalDay("2026-07-24T17:05:00.000Z", "2026-07-25")).toBe(true);
  });

  test("handles month, year and Monday boundaries deterministically", () => {
    expect(addDaysISO("2026-12-31", 1)).toBe("2027-01-01");
    expect(getLocalWeekRange("2026-07-26")).toEqual({
      startISO: "2026-07-20",
      endISO: "2026-07-26",
    });
    expect(getLocalWeekRange("2026-07-27")).toEqual({
      startISO: "2026-07-27",
      endISO: "2026-08-02",
    });
  });
});
