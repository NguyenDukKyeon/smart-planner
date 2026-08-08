import { describe, expect, it } from "vitest";
import type { Subject } from "./mock-data";
import { createStudySession, type StudySession } from "./study-sessions";

type LessonDurationEvidence = {
  lessonId: string;
  plannedMinutes: number;
  observedMinutes: number;
  ratio: number;
  sessionCount: number;
};

type StudyDurationEvidenceSummary = {
  lessons: LessonDurationEvidence[];
  lessonCount: number;
  sessionCount: number;
  coefficientOfVariation: number | null;
  confidence: "insufficient" | "low" | "medium" | "high";
};

type Selector = (params: {
  subjects: Subject[];
  completedLessons: Record<string, string>;
  studySessions: StudySession[];
}) => StudyDurationEvidenceSummary;

async function loadSelector(): Promise<Selector | undefined> {
  const modulePath = "./study-duration-evidence";
  try {
    const loaded = (await import(modulePath)) as { selectStudyDurationEvidence?: Selector };
    return loaded.selectStudyDurationEvidence;
  } catch {
    return undefined;
  }
}

function subjects(): Subject[] {
  return [
    {
      id: "math",
      name: "Toán",
      emoji: "📐",
      milestones: [
        {
          id: "topic",
          title: "Chủ đề",
          subtitle: "",
          lessons: [
            {
              id: "lesson-1",
              title: "Bài 1",
              xp: 10,
              plannedDurationMinutes: 120,
              scheduledDate: "2026-08-08",
              scheduleMode: "flexible",
              weekday: "T7",
              sourceSubject: "Toán",
              week: 1,
              initialDone: false,
            },
            {
              id: "lesson-2",
              title: "Bài 2",
              xp: 10,
              plannedDurationMinutes: 120,
              scheduledDate: "2026-08-08",
              scheduleMode: "flexible",
              weekday: "T7",
              sourceSubject: "Toán",
              week: 1,
              initialDone: false,
            },
          ],
        },
      ],
    },
  ];
}

function session(params: {
  id: string;
  lessonId: string;
  minutes: number;
  source?: "focus-timer" | "manual";
  reviewTaskId?: string;
}) {
  return createStudySession({
    id: params.id,
    lessonId: params.lessonId,
    endedAt: `2026-08-08T0${params.id.slice(-1)}:30:00.000Z`,
    durationSeconds: params.minutes * 60,
    source: params.source ?? "focus-timer",
    reviewTaskId: params.reviewTaskId,
  });
}

describe("lesson-level study duration evidence", () => {
  it("aggregates repeated sessions into one completed-lesson sample", async () => {
    const selectStudyDurationEvidence = await loadSelector();
    expect(selectStudyDurationEvidence).toBeTypeOf("function");
    if (!selectStudyDurationEvidence) return;

    const result = selectStudyDurationEvidence({
      subjects: subjects(),
      completedLessons: { "lesson-1": "2026-08-08" },
      studySessions: [
        session({ id: "s1", lessonId: "lesson-1", minutes: 20 }),
        session({ id: "s2", lessonId: "lesson-1", minutes: 20 }),
        session({ id: "s3", lessonId: "lesson-1", minutes: 20 }),
      ],
    });

    expect(result.lessonCount).toBe(1);
    expect(result.sessionCount).toBe(3);
    expect(result.lessons).toEqual([
      {
        lessonId: "lesson-1",
        plannedMinutes: 120,
        observedMinutes: 60,
        ratio: 0.5,
        sessionCount: 3,
      },
    ]);
    expect(result.confidence).toBe("insufficient");
  });

  it("excludes review sessions while accepting manual non-review study", async () => {
    const selectStudyDurationEvidence = await loadSelector();
    expect(selectStudyDurationEvidence).toBeTypeOf("function");
    if (!selectStudyDurationEvidence) return;

    const result = selectStudyDurationEvidence({
      subjects: subjects(),
      completedLessons: { "lesson-1": "2026-08-08" },
      studySessions: [
        session({ id: "s1", lessonId: "lesson-1", minutes: 20 }),
        session({ id: "s2", lessonId: "lesson-1", minutes: 10, source: "manual" }),
        session({
          id: "s3",
          lessonId: "lesson-1",
          minutes: 15,
          reviewTaskId: "review:lesson-1:2026-08-08",
        }),
      ],
    });

    expect(result.lessonCount).toBe(1);
    expect(result.sessionCount).toBe(2);
    expect(result.lessons[0]).toMatchObject({ observedMinutes: 30, sessionCount: 2, ratio: 0.25 });
  });

  it("ignores incomplete lessons and completed lessons missing from the current catalog", async () => {
    const selectStudyDurationEvidence = await loadSelector();
    expect(selectStudyDurationEvidence).toBeTypeOf("function");
    if (!selectStudyDurationEvidence) return;

    const result = selectStudyDurationEvidence({
      subjects: subjects(),
      completedLessons: { "deleted-lesson": "2026-08-08" },
      studySessions: [
        session({ id: "s1", lessonId: "lesson-1", minutes: 20 }),
        session({ id: "s2", lessonId: "deleted-lesson", minutes: 40 }),
      ],
    });

    expect(result.lessonCount).toBe(0);
    expect(result.sessionCount).toBe(0);
    expect(result.lessons).toEqual([]);
    expect(result.coefficientOfVariation).toBeNull();
    expect(result.confidence).toBe("insufficient");
  });
});
