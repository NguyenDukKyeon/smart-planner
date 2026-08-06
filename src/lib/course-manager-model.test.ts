import { beforeAll, describe, expect, test } from "vitest";
import type { Lesson, LessonScheduleMode, Milestone, Subject } from "./mock-data";
import { createInitialProgressState, type ProgressState } from "./progress-store";
import { createStudySession } from "./study-sessions";

type LessonFilter = "all" | "not-started" | "in-progress" | "completed" | "unscheduled";
type LessonSort = "roadmap" | "date" | "progress" | "name" | "remaining";

type LessonEditorDraft = {
  title: string;
  subjectId: string;
  topicId: string;
  minutes: number;
  date: string;
  scheduleMode: LessonScheduleMode;
};

type SubjectStats = {
  lessons: number;
  completed: number;
  remaining: number;
  percent: number;
};

type FilterAndSortParams = {
  subject: Subject;
  search: string;
  filter: LessonFilter;
  sort: LessonSort;
  minutesByLesson: Map<string, number>;
  progress?: ProgressState;
};

type CourseManagerModelApi = {
  buildMinutesByLesson(progress?: ProgressState): Map<string, number>;
  deriveSubjectStats(
    subject: Subject,
    minutesByLesson: Map<string, number>,
    progress?: ProgressState,
  ): SubjectStats;
  filterAndSortMilestones(params: FilterAndSortParams): Milestone[];
  createLessonEditorDraft(params: {
    subjects: Subject[];
    lesson: Lesson;
  }): LessonEditorDraft | null;
  classifyLessonEdit(params: {
    lesson: Lesson;
    ownerSubjectId: string;
    ownerTopicId: string;
    draft: LessonEditorDraft;
  }): "noop" | "catalog-only" | "schedule-affecting";
};

let model: CourseManagerModelApi;

beforeAll(async () => {
  const modelPath = "../components/course-manager/course-manager-model";
  model = (await import(/* @vite-ignore */ modelPath)) as CourseManagerModelApi;
});

function lesson(params: {
  id: string;
  title: string;
  date: string;
  minutes: number;
  topic?: string;
  scheduleMode?: LessonScheduleMode;
}): Lesson {
  return {
    id: params.id,
    title: params.title,
    topic: params.topic,
    xp: 20,
    plannedDurationMinutes: params.minutes,
    scheduledDate: params.date,
    scheduleMode: params.scheduleMode ?? "flexible",
    weekday: "",
    sourceSubject: "Metadata không đáng tin",
    week: 1,
    initialDone: false,
  };
}

function catalogFixture(): {
  subjects: Subject[];
  subject: Subject;
  lessons: Record<string, Lesson>;
} {
  const lessons = {
    zulu: lesson({ id: "zulu", title: "Zulu", date: "2030-01-03", minutes: 60 }),
    alpha: lesson({ id: "alpha", title: "Alpha", date: "", minutes: 20 }),
    beta: lesson({ id: "beta", title: "Beta", date: "2030-01-01", minutes: 120 }),
    gamma: lesson({ id: "gamma", title: "Gamma", date: "2030-01-02", minutes: 100 }),
  };
  const subject: Subject = {
    id: "subject-a",
    name: "Môn A",
    emoji: "📘",
    milestones: [
      {
        id: "topic-a",
        title: "Chủ đề A",
        subtitle: "4 bài",
        lessons: [lessons.zulu, lessons.alpha, lessons.beta, lessons.gamma],
      },
      {
        id: "topic-empty",
        title: "Chủ đề rỗng",
        subtitle: "0 bài",
        lessons: [],
      },
    ],
  };
  const second: Subject = {
    id: "subject-b",
    name: "Môn B",
    emoji: "📗",
    milestones: [
      {
        id: "topic-b",
        title: "Chủ đề B",
        subtitle: "0 bài",
        lessons: [],
      },
    ],
  };
  return { subjects: [subject, second], subject, lessons };
}

function progressFixture(): ProgressState {
  const progress = createInitialProgressState(false);
  progress.completedLessons = { alpha: "2030-01-05" };
  progress.studySessions = [
    createStudySession({
      id: "session-zulu-1",
      lessonId: "zulu",
      durationSeconds: 90,
      source: "manual",
      endedAt: "2030-01-01T00:02:00.000Z",
    }),
    createStudySession({
      id: "session-zulu-2",
      lessonId: "zulu",
      durationSeconds: 150,
      source: "manual",
      endedAt: "2030-01-01T00:05:00.000Z",
    }),
    createStudySession({
      id: "session-beta",
      lessonId: "beta",
      durationSeconds: 7200,
      source: "manual",
      endedAt: "2030-01-01T02:00:00.000Z",
    }),
    createStudySession({
      id: "session-gamma",
      lessonId: "gamma",
      durationSeconds: 1200,
      source: "manual",
      endedAt: "2030-01-01T00:20:00.000Z",
    }),
  ];
  return progress;
}

function lessonOrder(milestones: Milestone[]): string[] {
  return milestones.flatMap((milestone) => milestone.lessons.map((item) => item.id));
}

describe("Course Manager pure model", () => {
  test("accumulates rounded study-session minutes by lesson", () => {
    const minutes = model.buildMinutesByLesson(progressFixture());

    expect(minutes.get("zulu")).toBe(5);
    expect(minutes.get("beta")).toBe(120);
    expect(minutes.get("gamma")).toBe(20);
    expect(minutes.has("alpha")).toBe(false);
  });

  test("derives completion from explicit completion or accumulated minutes", () => {
    const { subject } = catalogFixture();
    const progress = progressFixture();
    const minutes = new Map([
      ["zulu", 30],
      ["beta", 120],
      ["gamma", 20],
    ]);

    expect(model.deriveSubjectStats(subject, minutes, progress)).toEqual({
      lessons: 4,
      completed: 2,
      remaining: 130,
      percent: 50,
    });
  });

  test("filters unscheduled lessons and removes empty milestones", () => {
    const { subject } = catalogFixture();
    const result = model.filterAndSortMilestones({
      subject,
      search: "",
      filter: "unscheduled",
      sort: "roadmap",
      minutesByLesson: new Map(),
    });

    expect(result).toHaveLength(1);
    expect(lessonOrder(result)).toEqual(["alpha"]);
  });

  test("explicitly completed lessons appear in the completed filter", () => {
    const { subject } = catalogFixture();
    const result = model.filterAndSortMilestones({
      subject,
      search: "",
      filter: "completed",
      sort: "roadmap",
      minutesByLesson: new Map(),
      progress: progressFixture(),
    });

    expect(lessonOrder(result)).toEqual(["alpha"]);
  });

  test("roadmap sort preserves stable milestone and lesson order without mutating input", () => {
    const { subject } = catalogFixture();
    const before = structuredClone(subject);
    const result = model.filterAndSortMilestones({
      subject,
      search: "",
      filter: "all",
      sort: "roadmap",
      minutesByLesson: new Map(),
    });

    expect(lessonOrder(result)).toEqual(["zulu", "alpha", "beta", "gamma"]);
    expect(result.map((milestone) => milestone.id)).toEqual(["topic-a", "topic-empty"]);
    expect(subject).toEqual(before);
    expect(result).not.toBe(subject.milestones);
    expect(result[0].lessons).not.toBe(subject.milestones[0].lessons);
  });

  test.each([
    ["date", ["beta", "gamma", "zulu", "alpha"]],
    ["progress", ["beta", "zulu", "gamma", "alpha"]],
    ["name", ["alpha", "beta", "gamma", "zulu"]],
    ["remaining", ["beta", "alpha", "zulu", "gamma"]],
  ] as const)("supports the %s sort mode", (sort, expected) => {
    const { subject } = catalogFixture();
    const result = model.filterAndSortMilestones({
      subject,
      search: "",
      filter: "all",
      sort,
      minutesByLesson: new Map([
        ["zulu", 30],
        ["beta", 120],
        ["gamma", 20],
      ]),
    });

    expect(result[0].lessons.map((item) => item.id)).toEqual(expected);
  });

  test("search matches the effective topic label", () => {
    const { subject } = catalogFixture();
    const result = model.filterAndSortMilestones({
      subject,
      search: "chủ đề a",
      filter: "all",
      sort: "roadmap",
      minutesByLesson: new Map(),
    });

    expect(lessonOrder(result)).toEqual(["zulu", "alpha", "beta", "gamma"]);
  });

  test("creates an editor draft from actual catalog ownership", () => {
    const { subjects, lessons } = catalogFixture();
    const draft = model.createLessonEditorDraft({ subjects, lesson: lessons.beta });

    expect(draft).toEqual({
      title: "Beta",
      subjectId: "subject-a",
      topicId: "topic-a",
      minutes: 120,
      date: "2030-01-01",
      scheduleMode: "flexible",
    });
  });

  test("returns null when the lesson is not owned by the supplied catalog", () => {
    const { subjects } = catalogFixture();
    const missing = lesson({ id: "missing", title: "Missing", date: "", minutes: 30 });

    expect(model.createLessonEditorDraft({ subjects, lesson: missing })).toBeNull();
  });

  test("classifies an unchanged or trim-equivalent draft as noop", () => {
    const { lessons } = catalogFixture();
    const draft: LessonEditorDraft = {
      title: "  Beta  ",
      subjectId: "subject-a",
      topicId: "topic-a",
      minutes: 120.4,
      date: "2030-01-01",
      scheduleMode: "flexible",
    };

    expect(
      model.classifyLessonEdit({
        lesson: lessons.beta,
        ownerSubjectId: "subject-a",
        ownerTopicId: "topic-a",
        draft,
      }),
    ).toBe("noop");
  });

  test("classifies a title-only edit as catalog-only", () => {
    const { lessons } = catalogFixture();
    const draft: LessonEditorDraft = {
      title: "Beta mới",
      subjectId: "subject-a",
      topicId: "topic-a",
      minutes: 120,
      date: "2030-01-01",
      scheduleMode: "flexible",
    };

    expect(
      model.classifyLessonEdit({
        lesson: lessons.beta,
        ownerSubjectId: "subject-a",
        ownerTopicId: "topic-a",
        draft,
      }),
    ).toBe("catalog-only");
  });

  test.each([
    ["subject", { subjectId: "subject-b" }],
    ["topic", { topicId: "topic-empty" }],
    ["minutes", { minutes: 121 }],
    ["date", { date: "2030-01-02" }],
    ["schedule mode", { scheduleMode: "fixed" as const }],
  ])("classifies a changed %s as schedule-affecting", (_field, patch) => {
    const { lessons } = catalogFixture();
    const draft: LessonEditorDraft = {
      title: "Beta mới",
      subjectId: "subject-a",
      topicId: "topic-a",
      minutes: 120,
      date: "2030-01-01",
      scheduleMode: "flexible",
      ...patch,
    };

    expect(
      model.classifyLessonEdit({
        lesson: lessons.beta,
        ownerSubjectId: "subject-a",
        ownerTopicId: "topic-a",
        draft,
      }),
    ).toBe("schedule-affecting");
  });
});
