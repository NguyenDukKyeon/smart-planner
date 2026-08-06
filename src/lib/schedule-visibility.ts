import type { Subject } from "./mock-data";
import type { PlanDay } from "./planner";

export type UnscheduledWorkSummary = {
  unfinishedCount: number;
  visibleScheduledCount: number;
  outsideHorizonCount: number;
  outsideHorizonLessonIds: string[];
};

export function summarizeUnscheduledWork(params: {
  subjects: Subject[];
  completed: Record<string, string>;
  visiblePlan: PlanDay[];
}): UnscheduledWorkSummary {
  const unfinishedLessonIds: string[] = [];
  const knownLessonIds = new Set<string>();

  for (const subject of params.subjects) {
    for (const milestone of subject.milestones) {
      for (const lesson of milestone.lessons) {
        if (knownLessonIds.has(lesson.id)) continue;
        knownLessonIds.add(lesson.id);
        if (!params.completed[lesson.id]) unfinishedLessonIds.push(lesson.id);
      }
    }
  }

  const visibleScheduledIds = new Set<string>();
  const visibleUnfinishedIds = new Set<string>();

  for (const day of params.visiblePlan) {
    for (const lesson of day.queue.newLessons) {
      visibleScheduledIds.add(lesson.id);
      visibleUnfinishedIds.add(lesson.id);
    }
    for (const lesson of day.queue.unplacedFixedLessons) {
      visibleUnfinishedIds.add(lesson.id);
    }
  }

  const outsideHorizonLessonIds = unfinishedLessonIds.filter(
    (lessonId) => !visibleUnfinishedIds.has(lessonId),
  );

  return {
    unfinishedCount: unfinishedLessonIds.length,
    visibleScheduledCount: unfinishedLessonIds.filter((lessonId) =>
      visibleScheduledIds.has(lessonId),
    ).length,
    outsideHorizonCount: outsideHorizonLessonIds.length,
    outsideHorizonLessonIds,
  };
}
