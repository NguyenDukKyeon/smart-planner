import { describe, expect, test } from "vitest";
import { loadLazyModule, validateDashboardSearch } from "./route-search";

describe("dashboard URL search", () => {
  test("keeps every approved view and plan value", () => {
    expect(validateDashboardSearch({ view: "today", plan: "flex" })).toEqual({
      view: "today",
      plan: "flex",
    });
    expect(validateDashboardSearch({ view: "weekly", plan: "original" })).toEqual({
      view: "weekly",
      plan: "original",
    });
    expect(validateDashboardSearch({ view: "plan", plan: "flex" })).toEqual({
      view: "plan",
      plan: "flex",
    });
  });

  test("falls back to the safe dashboard defaults for malformed values", () => {
    expect(validateDashboardSearch({ view: "reward", plan: "later" })).toEqual({
      view: "today",
      plan: "flex",
    });
    expect(validateDashboardSearch({ view: ["weekly"], plan: null })).toEqual({
      view: "today",
      plan: "flex",
    });
  });
});

describe("lazy module boundary", () => {
  test("returns a deterministic error result when the injected importer rejects", async () => {
    const result = await loadLazyModule(async () => {
      throw new Error("mô-đun không khả dụng");
    });
    expect(result).toEqual({ status: "error", error: "mô-đun không khả dụng" });
  });
});
