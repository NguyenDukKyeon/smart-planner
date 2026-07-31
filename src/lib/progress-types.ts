import type { HabitDef } from "./mock-data";
import type { PlannerSettings, StudyMeta } from "./planner";
import type { StudySession } from "./study-sessions";

export type HabitEntry = Record<string, boolean | number>;

export type Reminder = { enabled: boolean; time: string };

export type Goals = {
  weeklyXp: number;
  habitTargets: Record<string, number>;
};

export type CustomRewardItem = {
  id: string;
  title: string;
  cost: number;
  icon: string;
};

export type ClaimedRewardItem = {
  id: string;
  title: string;
  cost: number;
  dateISO: string;
};

export type LessonCompletionReward = {
  xp: number;
  coins: number;
};

export type ProgressState = {
  completedLessons: Record<string, string>;
  reviewCompletions?: Record<string, string>;
  studyDayCompletions: Record<string, true>;
  lessonCompletionRewards?: Record<string, LessonCompletionReward>;
  lessonXp: Record<string, number>;
  habitLog: Record<string, HabitEntry>;
  xp: number;
  coins: number;
  streakFreezeCount: number;
  customRewards: CustomRewardItem[];
  claimedRewards: ClaimedRewardItem[];
  goals: Goals;
  reminders: Record<string, Reminder>;
  plannerSettings: PlannerSettings;
  studyMeta: StudyMeta;
  studySessions: StudySession[];
  habitDefinitions: HabitDef[];
  onboardingComplete: boolean;
  schemaVersion: number;
};

export type WeekStats = {
  dates: string[];
  xpPerDay: number[];
  habitsPerDay: number[];
  xpThisWeek: number;
  habitCounts: Record<string, number>;
  goalsMet: number;
  goalsTotal: number;
};
