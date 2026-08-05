import type { Subject } from "./mock-data";
import { pickTodayQueue, type PlannerSettings, type StudyMeta } from "./planner";

export type StudyDayQueueCompletionInput = {
  subjects: Subject[];
  completed: Record<string, string>;
  reviewCompletions?: Record<string, string>;
  meta: StudyMeta;
  settings: PlannerSettings;
  dateISO: string;
};

function withoutCompletionsOnDate(
  completions: Record<string, string>,
  dateISO: string,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(completions).filter(([, completedOn]) => completedOn !== dateISO),
  );
}

export function isStudyDayQueueComplete({
  subjects,
  completed,
  reviewCompletions = {},
  meta,
  settings,
  dateISO,
}: StudyDayQueueCompletionInput): boolean {
  const baselineQueue = pickTodayQueue({
    subjects,
    completed: withoutCompletionsOnDate(completed, dateISO),
    reviewCompletions: withoutCompletionsOnDate(reviewCompletions, dateISO),
    meta,
    settings,
    dateISO,
  });

  const requiredNewLessons = baselineQueue.newLessons;
  const requiredReviews = baselineQueue.reviewLessons;
  const requiredCount = requiredNewLessons.length + requiredReviews.length;

  if (requiredCount === 0) return false;

  return (
    requiredNewLessons.every((lesson) => completed[lesson.id] === dateISO) &&
    requiredReviews.every((review) => reviewCompletions[review.taskId] === dateISO)
  );
}
