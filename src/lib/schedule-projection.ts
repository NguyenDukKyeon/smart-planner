import { todayISO } from "./date-utils";
import {
  buildScheduleProjection as buildPlannerScheduleProjection,
  type ScheduleProjection,
} from "./planner";

export type { ScheduleProjection };

export function buildScheduleProjection(
  params: Parameters<typeof buildPlannerScheduleProjection>[0],
): ScheduleProjection {
  const fromISO = params.fromISO ?? todayISO();
  const pastFixedLessonIds = new Set(
    params.subjects.flatMap((subject) =>
      subject.milestones.flatMap((milestone) =>
        milestone.lessons
          .filter(
            (lesson) =>
              !params.completed[lesson.id] &&
              Boolean(lesson.scheduledDate) &&
              (lesson.scheduleMode ?? "flexible") === "fixed" &&
              lesson.scheduledDate < fromISO,
          )
          .map((lesson) => lesson.id),
      ),
    ),
  );

  if (pastFixedLessonIds.size === 0) {
    return buildPlannerScheduleProjection(params);
  }

  const projectedSubjects = params.subjects.map((subject) => ({
    ...subject,
    milestones: subject.milestones.map((milestone) => ({
      ...milestone,
      lessons: milestone.lessons.filter((lesson) => !pastFixedLessonIds.has(lesson.id)),
    })),
  }));
  const projection = buildPlannerScheduleProjection({ ...params, subjects: projectedSubjects });

  return {
    ...projection,
    unplacedFixedLessonIds: [
      ...new Set([...projection.unplacedFixedLessonIds, ...pastFixedLessonIds]),
    ].sort(),
    projectionComplete: false,
    lastScheduledLessonDate: undefined,
  };
}
