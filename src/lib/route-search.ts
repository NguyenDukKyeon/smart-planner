export const DASHBOARD_VIEWS = ["today", "weekly", "plan"] as const;
export const PLAN_VIEWS = ["flex", "original"] as const;

export type DashboardView = (typeof DASHBOARD_VIEWS)[number];
export type PlanView = (typeof PLAN_VIEWS)[number];

export type DashboardSearch = {
  view: DashboardView;
  plan: PlanView;
  focusLesson?: string;
};

function includes<Value extends string>(values: readonly Value[], value: unknown): value is Value {
  return typeof value === "string" && values.includes(value as Value);
}

/** Normalizes deep links without letting malformed query values reach the tab controls. */
export function validateDashboardSearch(search: Record<string, unknown>): DashboardSearch {
  const focusLesson =
    typeof search.focusLesson === "string" && search.focusLesson.trim().length > 0
      ? search.focusLesson.trim().slice(0, 200)
      : undefined;
  return {
    view: includes(DASHBOARD_VIEWS, search.view) ? search.view : "today",
    plan: includes(PLAN_VIEWS, search.plan) ? search.plan : "flex",
    ...(focusLesson ? { focusLesson } : {}),
  };
}

export type LazyModuleResult<Value> =
  { status: "ready"; value: Value } | { status: "error"; error: string };

/**
 * Pure, injectable loading boundary shared by dashboard lazy imports. The UI
 * turns its error state into an accessible retry message without a test-only
 * route or debug switch.
 */
export async function loadLazyModule<Value>(
  importer: () => Promise<Value>,
): Promise<LazyModuleResult<Value>> {
  try {
    return { status: "ready", value: await importer() };
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Không thể tải mô-đun này.",
    };
  }
}
