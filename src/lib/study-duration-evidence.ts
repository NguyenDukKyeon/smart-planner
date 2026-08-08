import type { Subject } from "./mock-data";
import type { StudySession } from "./study-sessions";

export type LessonDurationEvidence = {
  lessonId: string;
  plannedMinutes: number;
  observedMinutes: number;
  ratio: number;
  sessionCount: number;
};

export type ForecastEvidenceConfidence = "insufficient" | "low" | "medium" | "high";

export type StudyDurationEvidenceSummary = {
  lessons: LessonDurationEvidence[];
  lessonCount: number;
  sessionCount: number;
  coefficientOfVariation: number | null;
  confidence: ForecastEvidenceConfidence;
};

function confidenceFor(lessonCount: number, coefficientOfVariation: number | null) {
  if (lessonCount < 3) return "insufficient" as const;
  if (lessonCount < 7) return "low" as const;
  if (lessonCount < 20) return "medium" as const;
  if (coefficientOfVariation !== null && coefficientOfVariation <= 0.35) {
    return "high" as const;
  }
  return "medium" as const;
}

export function selectStudyDurationEvidence(params: {
  subjects: Subject[];
  completedLessons: Record<string, string>;
  studySessions: StudySession[];
}): StudyDurationEvidenceSummary {
  const liveLessons = new Map(
    params.subjects.flatMap((subject) =>
      subject.milestones.flatMap((milestone) =>
        milestone.lessons.map((lesson) => [lesson.id, lesson] as const),
      ),
    ),
  );
  const grouped = new Map<string, { seconds: number; sessionCount: number }>();

  for (const session of params.studySessions) {
    if (session.reviewTaskId) continue;
    if (!params.completedLessons[session.lessonId]) continue;
    if (!liveLessons.has(session.lessonId)) continue;
    if (session.source !== "focus-timer" && session.source !== "manual") continue;

    const current = grouped.get(session.lessonId) ?? { seconds: 0, sessionCount: 0 };
    current.seconds += session.durationSeconds;
    current.sessionCount += 1;
    grouped.set(session.lessonId, current);
  }

  const lessons: LessonDurationEvidence[] = [];
  for (const [lessonId, aggregate] of grouped) {
    const lesson = liveLessons.get(lessonId);
    if (!lesson) continue;
    const plannedMinutes = lesson.plannedDurationMinutes;
    if (!Number.isFinite(plannedMinutes) || plannedMinutes <= 0) continue;

    const observedMinutes = Math.round((aggregate.seconds / 60) * 100) / 100;
    lessons.push({
      lessonId,
      plannedMinutes,
      observedMinutes,
      ratio: observedMinutes / plannedMinutes,
      sessionCount: aggregate.sessionCount,
    });
  }

  lessons.sort((left, right) => left.lessonId.localeCompare(right.lessonId));
  const ratios = lessons.map((lesson) => lesson.ratio);
  let coefficientOfVariation: number | null = null;
  if (ratios.length >= 2) {
    const mean = ratios.reduce((sum, value) => sum + value, 0) / ratios.length;
    if (mean > 0) {
      const variance = ratios.reduce((sum, value) => sum + (value - mean) ** 2, 0) / ratios.length;
      coefficientOfVariation = Math.sqrt(variance) / mean;
    }
  }

  return {
    lessons,
    lessonCount: lessons.length,
    sessionCount: lessons.reduce((sum, lesson) => sum + lesson.sessionCount, 0),
    coefficientOfVariation,
    confidence: confidenceFor(lessons.length, coefficientOfVariation),
  };
}
