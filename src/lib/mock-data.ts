import roadmapMeta from "@/data/grade11-roadmap-meta.json";
import roadmapLessons1 from "@/data/grade11-roadmap-lessons-1.json";
import roadmapLessons2 from "@/data/grade11-roadmap-lessons-2.json";
import roadmapLessons3 from "@/data/grade11-roadmap-lessons-3.json";
import roadmapLessons4 from "@/data/grade11-roadmap-lessons-4.json";
import roadmapLessons5 from "@/data/grade11-roadmap-lessons-5.json";
import roadmapLessons6 from "@/data/grade11-roadmap-lessons-6.json";
import { sortSubjects } from "./subject-order";

export type LessonScheduleMode = "fixed" | "flexible";

export type Lesson = {
  id: string;
  title: string;
  topic?: string;
  xp: number;
  plannedDurationMinutes: number;
  scheduledDate: string;
  scheduleMode?: LessonScheduleMode;
  weekday: string;
  sourceSubject: string;
  week: number;
  initialDone: boolean;
  habitAnchor?: string;
};
export type Milestone = {
  id: string;
  title: string;
  subtitle: string;
  lessons: Lesson[];
};
export type Subject = {
  id: string;
  name: string;
  emoji: string;
  milestones: Milestone[];
};

type CompactRoadmap = {
  subjects: string[];
  topics: [subjectIndex: number, title: string][];
  lessons: [topicIndex: number, title: string, xp: number][];
  date: string;
  minutes: number;
};

const SUBJECT_META: Record<string, { id: string; emoji: string }> = {
  Toán: { id: "toan", emoji: "📐" },
  "Vật lý": { id: "ly", emoji: "⚛️" },
  "Hóa học": { id: "hoa", emoji: "🧪" },
};

function roadmapSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function roadmapHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function buildSampleRoadmap(raw: CompactRoadmap): Subject[] {
  const subjects = raw.subjects.map((name) => ({
    id: SUBJECT_META[name]?.id ?? (roadmapSlug(name) || "custom"),
    name,
    emoji: SUBJECT_META[name]?.emoji ?? "📖",
    milestones: [] as Milestone[],
  }));
  const occurrenceByTopic = new Map<number, number>();
  const usedIdsBySubject = new Map<number, Set<string>>();

  for (const [topicIndex, title, xp] of raw.lessons) {
    const [subjectIndex, topicTitle] = raw.topics[topicIndex] ?? [];
    const subject = subjects[subjectIndex];
    if (!subject || typeof topicTitle !== "string") continue;

    const legacyIndex = occurrenceByTopic.get(topicIndex) ?? 0;
    occurrenceByTopic.set(topicIndex, legacyIndex + 1);

    const source = `${subject.name}|${title}|${raw.date}|${legacyIndex}`;
    const baseId = `lesson-${roadmapSlug(subject.name) || "custom"}-${roadmapHash(source)}`;
    const usedIds = usedIdsBySubject.get(subjectIndex) ?? new Set<string>();
    let lessonId = baseId;
    if (usedIds.has(lessonId)) {
      const collisionHash = roadmapHash(
        `${topicTitle}|${subject.name}|${title}|${raw.date}|${legacyIndex}`,
      );
      lessonId = `${baseId}-${collisionHash}`;
      let suffix = 2;
      while (usedIds.has(lessonId)) {
        lessonId = `${baseId}-${collisionHash}-${suffix}`;
        suffix += 1;
      }
    }
    usedIds.add(lessonId);
    usedIdsBySubject.set(subjectIndex, usedIds);

    let milestone = subject.milestones.at(-1);
    if (!milestone || milestone.title !== topicTitle) {
      const blockIndex = subject.milestones.length;
      milestone = {
        id: `${subject.id}-topic-${roadmapSlug(topicTitle) || blockIndex + 1}-${blockIndex + 1}`,
        title: topicTitle,
        subtitle: "0 bài học",
        lessons: [],
      };
      subject.milestones.push(milestone);
    }

    milestone.lessons.push({
      id: lessonId,
      title,
      topic: topicTitle === "Toàn bộ bài học" ? undefined : topicTitle,
      xp,
      plannedDurationMinutes: raw.minutes,
      scheduledDate: raw.date,
      scheduleMode: "flexible",
      weekday: "Thứ 7",
      sourceSubject: subject.name,
      week: 1,
      initialDone: false,
    });
    milestone.subtitle = `${milestone.lessons.length} bài học`;
  }

  return subjects;
}

const compactRoadmap: CompactRoadmap = {
  ...(roadmapMeta as Omit<CompactRoadmap, "lessons">),
  lessons: [
    ...roadmapLessons1,
    ...roadmapLessons2,
    ...roadmapLessons3,
    ...roadmapLessons4,
    ...roadmapLessons5,
    ...roadmapLessons6,
  ] as CompactRoadmap["lessons"],
};

// This compact dataset is generated from the downloadable workbook in public/.
export const SUBJECTS: Subject[] = sortSubjects(buildSampleRoadmap(compactRoadmap));

export const ALL_LESSONS = SUBJECTS.flatMap((subject) =>
  subject.milestones.flatMap((milestone) => milestone.lessons),
);

export const INITIAL_COMPLETED_LESSONS: Record<string, string> = Object.fromEntries(
  ALL_LESSONS.filter((lesson) => lesson.initialDone).map((lesson) => [
    lesson.id,
    lesson.scheduledDate,
  ]),
);

export const INITIAL_LESSON_XP: Record<string, number> = Object.fromEntries(
  ALL_LESSONS.filter((lesson) => lesson.initialDone).map((lesson) => [lesson.id, lesson.xp]),
);

const roadmapDates = ALL_LESSONS.map((lesson) => lesson.scheduledDate)
  .filter(Boolean)
  .sort();

export const ROADMAP_STATS = {
  totalLessons: ALL_LESSONS.length,
  initialCompleted: Object.keys(INITIAL_COMPLETED_LESSONS).length,
  startDate: roadmapDates.at(0) ?? "",
  endDate: roadmapDates.at(-1) ?? "",
};

export type HabitIcon = "water" | "book" | "run" | "sleep" | "meditate" | "study";
export type HabitColor = "blue" | "green" | "amber" | "coral";
export type HabitDef = {
  id: string;
  name: string;
  icon: HabitIcon;
  color: HabitColor;
  kind: "toggle" | "counter";
  target: number;
  archived: boolean;
  /**
   * Monday -> Sunday. A value of 0 disables the habit for that day.
   * Toggle habits use 1 for an active day; counter habits may use a
   * different target on each day.
   */
  dailyTargets: [number, number, number, number, number, number, number];
};

export const HABITS: HabitDef[] = [
  {
    id: "water",
    name: "Uống nước",
    icon: "water",
    kind: "counter",
    target: 8,
    color: "blue",
    archived: false,
    dailyTargets: [8, 8, 8, 8, 8, 8, 8],
  },
  {
    id: "read",
    name: "Đọc sách 30 phút",
    icon: "book",
    kind: "toggle",
    target: 1,
    color: "green",
    archived: false,
    dailyTargets: [1, 1, 1, 1, 1, 1, 1],
  },
  {
    id: "move",
    name: "Vận động",
    icon: "run",
    kind: "toggle",
    target: 1,
    color: "coral",
    archived: false,
    dailyTargets: [1, 1, 1, 1, 1, 1, 1],
  },
  {
    id: "sleep",
    name: "Ngủ đủ 7h",
    icon: "sleep",
    kind: "toggle",
    target: 1,
    color: "blue",
    archived: false,
    dailyTargets: [1, 1, 1, 1, 1, 1, 1],
  },
  {
    id: "meditate",
    name: "Thiền / thư giãn",
    icon: "meditate",
    kind: "toggle",
    target: 1,
    color: "green",
    archived: false,
    dailyTargets: [1, 1, 1, 1, 1, 1, 1],
  },
  {
    id: "study",
    name: "Học đúng lịch",
    icon: "study",
    kind: "toggle",
    target: 1,
    color: "amber",
    archived: false,
    dailyTargets: [1, 1, 1, 1, 1, 1, 1],
  },
];
