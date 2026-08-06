import { daysBetweenISO, getSundayISO } from "./date-utils";
import type { Lesson } from "./mock-data";
import type { DayQueue } from "./planner";

export type FlexibleScheduleStatusFilter = "all" | "fixed" | "flexible" | "attention";

export type FlexibleScheduleWorkspaceItem = {
  kind: "lesson" | "review";
  subjectId: string;
  lesson: Pick<Lesson, "scheduleMode">;
  unplacedFixed?: boolean;
};

export type FlexibleScheduleDayMetrics = {
  quotaMinutes: number;
  scheduledMinutes: number;
  newMinutes: number;
  reviewMinutes: number;
  unallocatedMinutes: number;
  overloadMinutes: number;
  unplacedFixedMinutes: number;
  attentionRequired: boolean;
};

export type HorizonExpansionResult = {
  weeks: number;
  includesTarget: boolean;
  reason: "included" | "before-start" | "beyond-max";
};

function effectiveMode(item: FlexibleScheduleWorkspaceItem): "fixed" | "flexible" {
  return item.lesson.scheduleMode ?? "flexible";
}

export function filterFlexibleScheduleItems<T extends FlexibleScheduleWorkspaceItem>(
  items: readonly T[],
  params: { subjectId: string; statusFilter: FlexibleScheduleStatusFilter },
): T[] {
  const subjectScoped =
    params.subjectId === "all"
      ? items
      : items.filter((entry) => entry.subjectId === params.subjectId);

  if (params.statusFilter === "all" || params.statusFilter === "attention") {
    return [...subjectScoped];
  }

  return subjectScoped.filter(
    (entry) => entry.kind === "lesson" && effectiveMode(entry) === params.statusFilter,
  );
}

export function isFlexibleScheduleAttentionDay(
  queue: Pick<DayQueue, "overloadMinutes" | "unplacedFixedMinutes">,
): boolean {
  return queue.overloadMinutes > 0 || queue.unplacedFixedMinutes > 0;
}

export function deriveFlexibleScheduleDayMetrics(
  queue: Pick<
    DayQueue,
    | "quotaMinutes"
    | "newMinutes"
    | "reviewMinutes"
    | "unallocatedMinutes"
    | "overloadMinutes"
    | "unplacedFixedMinutes"
  >,
): FlexibleScheduleDayMetrics {
  return {
    quotaMinutes: queue.quotaMinutes,
    scheduledMinutes: queue.newMinutes + queue.reviewMinutes,
    newMinutes: queue.newMinutes,
    reviewMinutes: queue.reviewMinutes,
    unallocatedMinutes: queue.unallocatedMinutes,
    overloadMinutes: queue.overloadMinutes,
    unplacedFixedMinutes: queue.unplacedFixedMinutes,
    attentionRequired: isFlexibleScheduleAttentionDay(queue),
  };
}

export function calculateMinimumHorizonWeeks(params: {
  todayDateISO: string;
  targetDateISO: string;
  maxWeeks?: number;
}): HorizonExpansionResult {
  const maxWeeks = Math.max(1, Math.floor(params.maxWeeks ?? 52));
  if (params.targetDateISO < params.todayDateISO) {
    return { weeks: 1, includesTarget: false, reason: "before-start" };
  }

  const firstWeekEndISO = getSundayISO(params.todayDateISO);
  if (params.targetDateISO <= firstWeekEndISO) {
    return { weeks: 1, includesTarget: true, reason: "included" };
  }

  const requiredWeeks =
    1 + Math.ceil(daysBetweenISO(firstWeekEndISO, params.targetDateISO) / 7);
  if (requiredWeeks > maxWeeks) {
    return { weeks: maxWeeks, includesTarget: false, reason: "beyond-max" };
  }

  return { weeks: requiredWeeks, includesTarget: true, reason: "included" };
}
