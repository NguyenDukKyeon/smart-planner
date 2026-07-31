import rawRoadmap from "@/data/grade11-roadmap.json";

export type Lesson = {
  id: string;
  title: string;
  topic?: string;
  xp: number;
  plannedDurationMinutes: number;
  scheduledDate: string;
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

type ScheduleItem = { subject: string; name: string; done: boolean };
type ScheduleDay = {
  week: number;
  date: string;
  weekday: string;
  items: ScheduleItem[];
};

const schedule = rawRoadmap as ScheduleDay[];
const SUBJECT_DEFS = [
  { id: "toan", name: "Toán", emoji: "📐" },
  { id: "ly", name: "Vật lý", emoji: "⚛️" },
  { id: "hoa", name: "Hóa học", emoji: "🧪" },
] as const;

const subjectGroup = (source: string) => {
  if (source.startsWith("Toán")) return "toan";
  if (source === "Lý") return "ly";
  if (source === "Hóa") return "hoa";
  return null;
};

const toISODate = (date: string) => {
  const [day, month, year] = date.split("/");
  return `${year}-${month}-${day}`;
};

const weekRanges = new Map<number, { start: string; end: string }>();
const lessonsBySubjectWeek: Record<string, Map<number, Lesson[]>> = Object.fromEntries(
  SUBJECT_DEFS.map((subject) => [subject.id, new Map<number, Lesson[]>()]),
);

for (const day of schedule) {
  const currentRange = weekRanges.get(day.week);
  weekRanges.set(day.week, {
    start: currentRange?.start ?? day.date,
    end: day.date,
  });

  day.items.forEach((item, itemIndex) => {
    const group = subjectGroup(item.subject);
    if (!group) return;
    const lessons = lessonsBySubjectWeek[group].get(day.week) ?? [];
    let topic: string | undefined = undefined;
    if (item.name.includes(" - ")) {
      topic = item.name.split(" - ")[0].trim();
    }
    lessons.push({
      id: `${group}-${toISODate(day.date)}-${itemIndex + 1}`,
      title: item.name,
      topic,
      xp: 20,
      plannedDurationMinutes: 90,
      scheduledDate: toISODate(day.date),
      weekday: day.weekday,
      sourceSubject: item.subject,
      week: day.week,
      initialDone: item.done,
    });
    lessonsBySubjectWeek[group].set(day.week, lessons);
  });
}

import { sortSubjects } from "./subject-order";

export const SUBJECTS: Subject[] = sortSubjects(
  SUBJECT_DEFS.map((subject) => ({
    ...subject,
    milestones: [...lessonsBySubjectWeek[subject.id].entries()].map(([week, lessons]) => {
      const range = weekRanges.get(week)!;
      return {
        id: `${subject.id}-week-${week}`,
        title: week === 0 ? "Khởi động" : `Tuần ${week}`,
        subtitle: `${range.start} – ${range.end} · ${lessons.length} bài`,
        lessons,
      };
    }),
  })),
);

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

export const ROADMAP_STATS = {
  totalLessons: ALL_LESSONS.length,
  initialCompleted: Object.keys(INITIAL_COMPLETED_LESSONS).length,
  startDate: toISODate(schedule[0].date),
  endDate: toISODate(schedule.at(-1)!.date),
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
