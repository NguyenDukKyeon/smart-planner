import { displayDate, getMondayISO, getSundayISO } from "./date-utils";
import type { Lesson, Subject } from "./mock-data";
import { sortSubjects } from "./subject-order";

export type RoadmapViewMode = "projection" | "canonical";

export type RoadmapLessonStatus =
  | "completed"
  | "projected"
  | "outside-horizon"
  | "unplaced-fixed"
  | "unscheduled";

export type RoadmapLessonItem = {
  lesson: Lesson;
  subjectId: string;
  subjectName: string;
  subjectEmoji: string;
  milestoneId: string;
  milestoneTitle: string;
  status: RoadmapLessonStatus;
  effectiveDate: string | null;
};

export type RoadmapProjectionGroup = {
  id: string;
  title: string;
  subtitle: string;
  mondayISO: string | null;
  sundayISO: string | null;
  items: RoadmapLessonItem[];
  doneCount: number;
  totalCount: number;
  isComplete: boolean;
};

export type RoadmapCanonicalSubjectGroup = {
  subjectId: string;
  subjectName: string;
  subjectEmoji: string;
  milestones: Array<{
    milestoneId: string;
    milestoneTitle: string;
    items: RoadmapLessonItem[];
  }>;
};

type RoadmapSelectorParams = {
  subjects: Subject[];
  completed: Record<string, string>;
  shiftedDates: Record<string, string>;
  selectedSubjectId: string;
  visibleScheduledLessonIds?: ReadonlySet<string>;
};

function selectedSubjects(subjects: Subject[], selectedSubjectId: string): Subject[] {
  const sorted = sortSubjects(subjects);
  if (selectedSubjectId === "all") return sorted;
  const selected = sorted.find((subject) => subject.id === selectedSubjectId);
  return selected ? [selected] : sorted;
}

function buildItem(params: {
  lesson: Lesson;
  subject: Subject;
  milestoneId: string;
  milestoneTitle: string;
  completed: Record<string, string>;
  shiftedDates: Record<string, string>;
  visibleScheduledLessonIds?: ReadonlySet<string>;
}): RoadmapLessonItem {
  const {
    lesson,
    subject,
    milestoneId,
    milestoneTitle,
    completed,
    shiftedDates,
    visibleScheduledLessonIds,
  } = params;
  const completionDate = completed[lesson.id];
  const shiftedDate = shiftedDates[lesson.id];
  const mode = lesson.scheduleMode ?? "flexible";
  const effectiveDate = completionDate || shiftedDate || (mode === "flexible" ? lesson.scheduledDate : "");

  let status: RoadmapLessonStatus;
  if (completionDate) {
    status = "completed";
  } else if (mode === "fixed" && !shiftedDate) {
    status = "unplaced-fixed";
  } else if (!effectiveDate) {
    status = "unscheduled";
  } else if (!visibleScheduledLessonIds) {
    status = "projected";
  } else {
    status = visibleScheduledLessonIds.has(lesson.id) ? "projected" : "outside-horizon";
  }

  return {
    lesson,
    subjectId: subject.id,
    subjectName: subject.name,
    subjectEmoji: subject.emoji,
    milestoneId,
    milestoneTitle,
    status,
    effectiveDate: effectiveDate || null,
  };
}

function buildItems(params: RoadmapSelectorParams): RoadmapLessonItem[] {
  return selectedSubjects(params.subjects, params.selectedSubjectId).flatMap((subject) =>
    subject.milestones.flatMap((milestone) =>
      milestone.lessons.map((lesson) =>
        buildItem({
          lesson,
          subject,
          milestoneId: milestone.id,
          milestoneTitle: milestone.title,
          completed: params.completed,
          shiftedDates: params.shiftedDates,
          visibleScheduledLessonIds: params.visibleScheduledLessonIds,
        }),
      ),
    ),
  );
}

export function buildRoadmapProjection(params: RoadmapSelectorParams): RoadmapProjectionGroup[] {
  const items = buildItems(params);
  const canonicalPosition = new Map(items.map((item, index) => [item.lesson.id, index]));
  const grouped = new Map<string, RoadmapLessonItem[]>();

  for (const item of items) {
    const key =
      item.status === "unplaced-fixed"
        ? "unplaced-fixed"
        : item.status === "unscheduled"
          ? "unscheduled"
          : getMondayISO(item.effectiveDate as string);
    const group = grouped.get(key) ?? [];
    group.push(item);
    grouped.set(key, group);
  }

  const keys = [...grouped.keys()].sort((left, right) => {
    const rank = (value: string) =>
      value === "unplaced-fixed" ? 1 : value === "unscheduled" ? 2 : 0;
    const rankDifference = rank(left) - rank(right);
    return rankDifference || left.localeCompare(right);
  });
  const datedKeys = keys.filter((key) => key !== "unplaced-fixed" && key !== "unscheduled");

  return keys.map((key) => {
    const groupItems = [...(grouped.get(key) ?? [])].sort((left, right) => {
      const dateDifference = (left.effectiveDate ?? "").localeCompare(right.effectiveDate ?? "");
      if (dateDifference !== 0) return dateDifference;
      return (
        (canonicalPosition.get(left.lesson.id) ?? Number.MAX_SAFE_INTEGER) -
        (canonicalPosition.get(right.lesson.id) ?? Number.MAX_SAFE_INTEGER)
      );
    });
    const doneCount = groupItems.filter((item) => item.status === "completed").length;
    const totalCount = groupItems.length;
    const isComplete = totalCount > 0 && doneCount === totalCount;

    if (key === "unplaced-fixed") {
      return {
        id: "week-unplaced-fixed",
        title: "Chưa xếp được",
        subtitle: `${totalCount} bài cố định vượt quỹ giờ · không tự dời ngày`,
        mondayISO: null,
        sundayISO: null,
        items: groupItems,
        doneCount,
        totalCount,
        isComplete,
      };
    }

    if (key === "unscheduled") {
      return {
        id: "week-unscheduled",
        title: "Kho bài chưa xếp lịch",
        subtitle: `${totalCount} bài · chưa tham gia kế hoạch tự động`,
        mondayISO: null,
        sundayISO: null,
        items: groupItems,
        doneCount,
        totalCount,
        isComplete,
      };
    }

    const sundayISO = getSundayISO(key);
    const firstDate = groupItems[0]?.effectiveDate ?? key;
    return {
      id: `week-${key}`,
      title: `Tuần ${datedKeys.indexOf(key) + 1}`,
      subtitle: `${displayDate(firstDate)} – ${displayDate(sundayISO)} · ${totalCount} bài`,
      mondayISO: key,
      sundayISO,
      items: groupItems,
      doneCount,
      totalCount,
      isComplete,
    };
  });
}

export function buildCanonicalRoadmap(
  params: RoadmapSelectorParams,
): RoadmapCanonicalSubjectGroup[] {
  return selectedSubjects(params.subjects, params.selectedSubjectId).map((subject) => ({
    subjectId: subject.id,
    subjectName: subject.name,
    subjectEmoji: subject.emoji,
    milestones: subject.milestones.map((milestone) => ({
      milestoneId: milestone.id,
      milestoneTitle: milestone.title,
      items: milestone.lessons.map((lesson) =>
        buildItem({
          lesson,
          subject,
          milestoneId: milestone.id,
          milestoneTitle: milestone.title,
          completed: params.completed,
          shiftedDates: params.shiftedDates,
          visibleScheduledLessonIds: params.visibleScheduledLessonIds,
        }),
      ),
    })),
  }));
}
