import type { PlannerSettings } from "./planner";

export function resolveDailyCapacityHours(params: {
  dateISO: string;
  currentDateISO: string;
  settings: PlannerSettings;
}): number {
  if (params.dateISO === params.currentDateISO) return params.settings.todayHours;
  if (Object.prototype.hasOwnProperty.call(params.settings.dailyHours, params.dateISO)) {
    return params.settings.dailyHours[params.dateISO];
  }
  return params.settings.defaultDailyHours;
}
