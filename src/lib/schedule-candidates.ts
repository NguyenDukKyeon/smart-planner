import { updateLessonDetails } from "./custom-subjects";
import { findLessonById } from "./planner";
import { normalizeDailyStudyHours } from "./study-hours";
import {
  createScheduleSnapshot,
  type ScheduleCandidate,
  type ScheduleSnapshot,
} from "./schedule-transactions";

export type MoveLessonDateCandidateResult =
  | { ok: true; candidate: ScheduleCandidate }
  | { ok: false; error: string };

export function buildMoveLessonDateCandidate(params: {
  current: ScheduleSnapshot;
  lessonId: string;
  targetDateISO: string;
}): MoveLessonDateCandidateResult {
  const current = createScheduleSnapshot(
    params.current.subjects,
    params.current.plannerSettings,
  );
  const lesson = findLessonById(params.lessonId, current.subjects);
  if (!lesson) {
    return { ok: false, error: "Không tìm thấy bài học để di chuyển." };
  }

  if (lesson.scheduledDate === params.targetDateISO) {
    return { ok: true, candidate: current };
  }

  const subjects = updateLessonDetails(current.subjects, params.lessonId, {
    scheduledDate: params.targetDateISO,
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
  const current = createScheduleSnapshot(
    params.current.subjects,
    params.current.plannerSettings,
  );
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
          params.dateISO === params.todayDateISO
            ? normalized
            : current.plannerSettings.todayHours,
      },
    },
  };
}
