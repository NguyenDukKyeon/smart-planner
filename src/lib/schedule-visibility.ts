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
  subjectId?: string;
}): UnscheduledWorkSummary {
  const scopedSubjects =
    !params.subjectId || params.subjectId === "all"
      ? params.subjects
      : params.subjects.filter((subject) => subject.id === params.subjectId);
  const unfinishedLessonIds: string[] = [];
  const knownLessonIds = new Set<string>();
  const scopedLessonIds = new Set<string>();

  for (const subject of scopedSubjects) {
    for (const milestone of subject.milestones) {
      for (const lesson of milestone.lessons) {
        scopedLessonIds.add(lesson.id);
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
      if (!scopedLessonIds.has(lesson.id)) continue;
      visibleScheduledIds.add(lesson.id);
      visibleUnfinishedIds.add(lesson.id);
    }
    for (const lesson of day.queue.unplacedFixedLessons) {
      if (scopedLessonIds.has(lesson.id)) visibleUnfinishedIds.add(lesson.id);
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
