import {
  moveLessonBeforeInTopic,
  moveLessonsToTopic,
  updateLessonDetails,
} from "./custom-subjects";
import { isDateISO } from "./date-utils";
import type { LessonScheduleMode, Subject } from "./mock-data";
import { findLessonById } from "./planner";
import { normalizeDailyStudyHours } from "./study-hours";
import {
  createScheduleSnapshot,
  type ScheduleCandidate,
  type ScheduleSnapshot,
} from "./schedule-transactions";

export type ScheduleCandidateBuildResult =
  | { ok: true; candidate: ScheduleCandidate }
  | {
      ok: false;
      error: string;
    };

export type MoveLessonDateCandidateResult = ScheduleCandidateBuildResult;

export type ReorderLessonTarget = {
  subjectId: string;
  topicId: string;
  beforeLessonId: string | null;
};

export type LessonEditorCandidateInput = {
  title: string;
  subjectId: string;
  topicId: string;
  plannedDurationMinutes: number;
  scheduledDate: string;
  scheduleMode: LessonScheduleMode;
};

function isReviewTaskId(id: string): boolean {
  return id.startsWith("review:");
}

function allLessonIds(subjects: Subject[]): string[] {
  return subjects.flatMap((subject) =>
    subject.milestones.flatMap((milestone) => milestone.lessons.map((lesson) => lesson.id)),
  );
}

function preservesLessonIdentity(previous: Subject[], candidate: Subject[]): boolean {
  const previousIds = allLessonIds(previous).sort();
  const candidateIds = allLessonIds(candidate).sort();
  return (
    previousIds.length === candidateIds.length &&
    new Set(candidateIds).size === candidateIds.length &&
    previousIds.every((id, index) => id === candidateIds[index])
  );
}

function findLessonPosition(
  subjects: Subject[],
  lessonId: string,
): { subjectId: string; topicId: string } | null {
  for (const subject of subjects) {
    for (const milestone of subject.milestones) {
      if (milestone.lessons.some((lesson) => lesson.id === lessonId)) {
        return { subjectId: subject.id, topicId: milestone.id };
      }
    }
  }
  return null;
}

export function buildEditLessonCandidate(params: {
  current: ScheduleSnapshot;
  lessonId: string;
  input: LessonEditorCandidateInput;
}): ScheduleCandidateBuildResult {
  const current = createScheduleSnapshot(params.current.subjects, params.current.plannerSettings);
  const title = params.input.title.trim();
  if (!title) {
    return { ok: false, error: "Tên bài học không được để trống." };
  }

  const plannedDurationMinutes = Math.round(params.input.plannedDurationMinutes);
  if (
    !Number.isFinite(params.input.plannedDurationMinutes) ||
    plannedDurationMinutes < 1 ||
    plannedDurationMinutes > 1440
  ) {
    return { ok: false, error: "Thời lượng mục tiêu phải từ 1 đến 1440 phút." };
  }

  const lesson = findLessonById(params.lessonId, current.subjects);
  const sourcePosition = findLessonPosition(current.subjects, params.lessonId);
  if (!lesson || !sourcePosition) {
    return { ok: false, error: "Không tìm thấy bài học để chỉnh sửa." };
  }

  const targetSubject = current.subjects.find(
    (subject) => subject.id === params.input.subjectId,
  );
  if (!targetSubject) {
    return { ok: false, error: "Vui lòng chọn môn học đích hợp lệ." };
  }

  const targetTopic = targetSubject.milestones.find(
    (milestone) => milestone.id === params.input.topicId,
  );
  if (!targetTopic) {
    return { ok: false, error: "Vui lòng chọn chủ đề đích hợp lệ." };
  }

  if (params.input.scheduleMode === "fixed" && !isDateISO(params.input.scheduledDate)) {
    return { ok: false, error: "Bài cố định cần một ngày hợp lệ." };
  }
  if (
    params.input.scheduleMode === "flexible" &&
    params.input.scheduledDate !== "" &&
    !isDateISO(params.input.scheduledDate)
  ) {
    return { ok: false, error: "Ngày bắt đầu linh hoạt không hợp lệ." };
  }

  let subjects = updateLessonDetails(current.subjects, params.lessonId, {
    title,
    plannedDurationMinutes,
    scheduledDate: params.input.scheduledDate,
    scheduleMode: params.input.scheduleMode,
  });

  if (
    sourcePosition.subjectId !== params.input.subjectId ||
    sourcePosition.topicId !== params.input.topicId
  ) {
    subjects = moveLessonsToTopic(
      subjects,
      [params.lessonId],
      params.input.subjectId,
      params.input.topicId,
    );
  }

  if (!preservesLessonIdentity(current.subjects, subjects)) {
    return { ok: false, error: "Không thể bảo toàn danh sách bài học khi chỉnh sửa." };
  }

  if (JSON.stringify(subjects) === JSON.stringify(current.subjects)) {
    return { ok: true, candidate: current };
  }

  return {
    ok: true,
    candidate: {
      subjects,
      plannerSettings: current.plannerSettings,
    },
  };
}

export function buildMoveLessonDateCandidate(params: {
  current: ScheduleSnapshot;
  lessonId: string;
  targetDateISO: string;
  now?: () => Date;
}): MoveLessonDateCandidateResult {
  const current = createScheduleSnapshot(params.current.subjects, params.current.plannerSettings);
  const lesson = findLessonById(params.lessonId, current.subjects);
  if (!lesson) {
    return { ok: false, error: "Không tìm thấy bài học để di chuyển." };
  }

  if (lesson.scheduledDate === params.targetDateISO) {
    return { ok: true, candidate: current };
  }

  const placementProvenance = {
    kind: "manual-move" as const,
    movedAt: (params.now ?? (() => new Date()))().toISOString(),
    fromDateISO: lesson.scheduledDate,
    toDateISO: params.targetDateISO,
  };
  const subjects = updateLessonDetails(current.subjects, params.lessonId, {
    scheduledDate: params.targetDateISO,
    placementProvenance,
  });
  if (subjects === current.subjects) {
    return { ok: false, error: "Không thể cập nhật ngày của bài học." };
  }

  return {
    ok: true,
    candidate: {
      subjects,
      plannerSettings: current.plannerSettings,
    },
  };
}

export function buildChangeDayCapacityCandidate(params: {
  current: ScheduleSnapshot;
  dateISO: string;
  hours: number;
  todayDateISO: string;
}): { candidate: ScheduleCandidate } {
  const current = createScheduleSnapshot(params.current.subjects, params.current.plannerSettings);
  const normalized = normalizeDailyStudyHours(params.hours);
  const dailyHours = { ...current.plannerSettings.dailyHours };

  if (normalized === current.plannerSettings.defaultDailyHours) {
    delete dailyHours[params.dateISO];
  } else {
    dailyHours[params.dateISO] = normalized;
  }

  return {
    candidate: {
      subjects: current.subjects,
      plannerSettings: {
        ...current.plannerSettings,
        dailyHours,
        todayHours:
          params.dateISO === params.todayDateISO ? normalized : current.plannerSettings.todayHours,
      },
    },
  };
}

export function buildChangeScheduleModeCandidate(params: {
  current: ScheduleSnapshot;
  lessonId: string;
  scheduleMode: LessonScheduleMode;
  scheduledDate?: string;
}): ScheduleCandidateBuildResult {
  const current = createScheduleSnapshot(params.current.subjects, params.current.plannerSettings);
  if (isReviewTaskId(params.lessonId)) {
    return { ok: false, error: "Không thể đổi chế độ của nhiệm vụ ôn tập." };
  }

  const lesson = findLessonById(params.lessonId, current.subjects);
  if (!lesson) {
    return { ok: false, error: "Không tìm thấy bài học để đổi chế độ." };
  }

  const scheduledDate = params.scheduledDate ?? lesson.scheduledDate;
  if (params.scheduleMode === "fixed" && !isDateISO(scheduledDate)) {
    return { ok: false, error: "Bài cố định cần một ngày hợp lệ." };
  }
  if (params.scheduleMode === "flexible" && scheduledDate !== "" && !isDateISO(scheduledDate)) {
    return { ok: false, error: "Ngày bắt đầu linh hoạt không hợp lệ." };
  }

  if (
    (lesson.scheduleMode ?? "flexible") === params.scheduleMode &&
    lesson.scheduledDate === scheduledDate
  ) {
    return { ok: true, candidate: current };
  }

  const subjects = updateLessonDetails(current.subjects, params.lessonId, {
    scheduleMode: params.scheduleMode,
    scheduledDate,
  });
  return {
    ok: true,
    candidate: {
      subjects,
      plannerSettings: current.plannerSettings,
    },
  };
}

export function buildReorderLessonCandidate(params: {
  current: ScheduleSnapshot;
  lessonId: string;
  target: ReorderLessonTarget;
}): ScheduleCandidateBuildResult {
  const current = createScheduleSnapshot(params.current.subjects, params.current.plannerSettings);
  if (isReviewTaskId(params.lessonId)) {
    return { ok: false, error: "Không thể sắp xếp nhiệm vụ ôn tập như bài học." };
  }

  const lesson = findLessonById(params.lessonId, current.subjects);
  if (!lesson) {
    return { ok: false, error: "Không tìm thấy bài học để sắp xếp." };
  }

  const targetSubject = current.subjects.find((subject) => subject.id === params.target.subjectId);
  const targetTopic = targetSubject?.milestones.find(
    (milestone) => milestone.id === params.target.topicId,
  );
  if (!targetSubject || !targetTopic) {
    return { ok: false, error: "Không tìm thấy vị trí đích để sắp xếp bài học." };
  }

  if (
    params.target.beforeLessonId &&
    !targetTopic.lessons.some((candidate) => candidate.id === params.target.beforeLessonId)
  ) {
    return { ok: false, error: "Không tìm thấy vị trí chèn trong chủ đề đích." };
  }

  const sourceTopic = current.subjects
    .flatMap((subject) =>
      subject.milestones.map((milestone) => ({ subjectId: subject.id, milestone })),
    )
    .find(({ milestone }) =>
      milestone.lessons.some((candidate) => candidate.id === params.lessonId),
    );

  if (params.target.beforeLessonId === params.lessonId) {
    if (
      sourceTopic?.subjectId === params.target.subjectId &&
      sourceTopic.milestone.id === params.target.topicId
    ) {
      return { ok: true, candidate: current };
    }
    return { ok: false, error: "Không tìm thấy vị trí chèn trong chủ đề đích." };
  }

  let subjects = moveLessonsToTopic(
    current.subjects,
    [params.lessonId],
    params.target.subjectId,
    params.target.topicId,
  );
  if (subjects === current.subjects) {
    return { ok: false, error: "Không thể sắp xếp bài học vào vị trí đã chọn." };
  }

  subjects = moveLessonBeforeInTopic(
    subjects,
    params.target.subjectId,
    params.target.topicId,
    params.lessonId,
    params.target.beforeLessonId,
  );

  if (!preservesLessonIdentity(current.subjects, subjects)) {
    return { ok: false, error: "Không thể bảo toàn danh sách bài học khi sắp xếp." };
  }

  if (JSON.stringify(subjects) === JSON.stringify(current.subjects)) {
    return { ok: true, candidate: current };
  }

  return {
    ok: true,
    candidate: {
      subjects,
      plannerSettings: current.plannerSettings,
    },
  };
}
