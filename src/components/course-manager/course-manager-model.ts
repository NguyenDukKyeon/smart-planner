import type { Lesson, LessonScheduleMode, Milestone, Subject } from "@/lib/mock-data";
import type { ProgressState } from "@/lib/progress-store";

export type LessonFilter = "all" | "not-started" | "in-progress" | "completed" | "unscheduled";

export type LessonSort = "roadmap" | "date" | "progress" | "name" | "remaining";

export type LessonEditorDraft = {
  title: string;
  subjectId: string;
  topicId: string;
  minutes: number;
  date: string;
  scheduleMode: LessonScheduleMode;
};

export type SubjectStats = {
  lessons: number;
  completed: number;
  remaining: number;
  percent: number;
};

export type FilterAndSortParams = {
  subject: Subject;
  search: string;
  filter: LessonFilter;
  sort: LessonSort;
  minutesByLesson: Map<string, number>;
  progress?: ProgressState;
};

function allLessons(subject: Subject): Lesson[] {
  return subject.milestones.flatMap((milestone) => milestone.lessons);
}

function isLessonCompleted(params: {
  lesson: Lesson;
  minutesByLesson: Map<string, number>;
  progress?: ProgressState;
}): boolean {
  const minutes = params.minutesByLesson.get(params.lesson.id) ?? 0;
  return (
    Boolean(params.progress?.completedLessons[params.lesson.id]) ||
    minutes >= params.lesson.plannedDurationMinutes
  );
}

export function buildMinutesByLesson(progress?: ProgressState): Map<string, number> {
  const minutesByLesson = new Map<string, number>();
  for (const session of progress?.studySessions ?? []) {
    minutesByLesson.set(
      session.lessonId,
      (minutesByLesson.get(session.lessonId) ?? 0) + Math.round(session.durationSeconds / 60),
    );
  }
  return minutesByLesson;
}

export function deriveSubjectStats(
  subject: Subject,
  minutesByLesson: Map<string, number>,
  progress?: ProgressState,
): SubjectStats {
  const lessons = allLessons(subject);
  const completed = lessons.filter((lesson) =>
    isLessonCompleted({ lesson, minutesByLesson, progress }),
  ).length;
  const remaining = lessons.reduce(
    (sum, lesson) =>
      sum + Math.max(0, lesson.plannedDurationMinutes - (minutesByLesson.get(lesson.id) ?? 0)),
    0,
  );

  return {
    lessons: lessons.length,
    completed,
    remaining,
    percent: lessons.length ? Math.round((completed / lessons.length) * 100) : 0,
  };
}

export function filterAndSortMilestones(params: FilterAndSortParams): Milestone[] {
  const keyword = params.search.trim().toLocaleLowerCase("vi");

  return params.subject.milestones
    .map((milestone) => ({
      ...milestone,
      lessons: milestone.lessons
        .filter((lesson) => {
          const minutes = params.minutesByLesson.get(lesson.id) ?? 0;
          const completed = isLessonCompleted({
            lesson,
            minutesByLesson: params.minutesByLesson,
            progress: params.progress,
          });
          const matchesSearch =
            !keyword ||
            lesson.title.toLocaleLowerCase("vi").includes(keyword) ||
            (lesson.topic ?? milestone.title).toLocaleLowerCase("vi").includes(keyword);

          if (!matchesSearch) return false;
          if (params.filter === "completed") return completed;
          if (params.filter === "not-started") return minutes === 0 && !completed;
          if (params.filter === "in-progress") return minutes > 0 && !completed;
          if (params.filter === "unscheduled") return !lesson.scheduledDate;
          return true;
        })
        .sort((left, right) => {
          if (params.sort === "date") {
            return (left.scheduledDate || "9999-12-31").localeCompare(
              right.scheduledDate || "9999-12-31",
            );
          }
          if (params.sort === "name") return left.title.localeCompare(right.title, "vi");

          const leftMinutes = params.minutesByLesson.get(left.id) ?? 0;
          const rightMinutes = params.minutesByLesson.get(right.id) ?? 0;
          if (params.sort === "progress") {
            const leftPercent = leftMinutes / Math.max(1, left.plannedDurationMinutes);
            const rightPercent = rightMinutes / Math.max(1, right.plannedDurationMinutes);
            return rightPercent - leftPercent;
          }
          if (params.sort === "remaining") {
            return (
              Math.max(0, left.plannedDurationMinutes - leftMinutes) -
              Math.max(0, right.plannedDurationMinutes - rightMinutes)
            );
          }
          return 0;
        }),
    }))
    .filter((milestone) => milestone.lessons.length > 0 || (!keyword && params.filter === "all"));
}

export function createLessonEditorDraft(params: {
  subjects: Subject[];
  lesson: Lesson;
}): LessonEditorDraft | null {
  const ownerSubject = params.subjects.find((subject) =>
    subject.milestones.some((milestone) =>
      milestone.lessons.some((candidate) => candidate.id === params.lesson.id),
    ),
  );
  if (!ownerSubject) return null;

  const ownerTopic = ownerSubject.milestones.find((milestone) =>
    milestone.lessons.some((candidate) => candidate.id === params.lesson.id),
  );
  if (!ownerTopic) return null;

  return {
    title: params.lesson.title,
    subjectId: ownerSubject.id,
    topicId: ownerTopic.id,
    minutes: params.lesson.plannedDurationMinutes,
    date: params.lesson.scheduledDate,
    scheduleMode: params.lesson.scheduleMode ?? "flexible",
  };
}

export function classifyLessonEdit(params: {
  lesson: Lesson;
  ownerSubjectId: string;
  ownerTopicId: string;
  draft: LessonEditorDraft;
}): "noop" | "catalog-only" | "schedule-affecting" {
  const titleChanged = params.draft.title.trim() !== params.lesson.title;
  const scheduleChanged =
    params.draft.subjectId !== params.ownerSubjectId ||
    params.draft.topicId !== params.ownerTopicId ||
    Math.round(params.draft.minutes) !== params.lesson.plannedDurationMinutes ||
    params.draft.date !== params.lesson.scheduledDate ||
    params.draft.scheduleMode !== (params.lesson.scheduleMode ?? "flexible");

  return scheduleChanged ? "schedule-affecting" : titleChanged ? "catalog-only" : "noop";
}
