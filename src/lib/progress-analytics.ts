import { addDaysISO, getMondayISO, isDateISO, todayISO } from "./date-utils";
import type { HabitDef } from "./mock-data";
import { studySecondsOnDate } from "./study-sessions";
import type { HabitEntry, ProgressState, WeekStats } from "./progress-types";

export function weekStartISO(ref = new Date()): string {
  return getMondayISO(todayISO(ref));
}

export function getWeekDates(ref = new Date()): string[] {
  const start = weekStartISO(ref);
  return Array.from({ length: 7 }, (_, index) => addDaysISO(start, index));
}

function habitTargetOnDate(habit: HabitDef, dateISO: string): number {
  const date = new Date(`${dateISO}T12:00:00`);
  const mondayIndex = (date.getDay() + 6) % 7;
  return habit.dailyTargets[mondayIndex] ?? habit.target;
}

function habitDone(habit: HabitDef, entry?: HabitEntry, dateISO?: string): boolean {
  if (!entry) return false;
  const target = dateISO ? habitTargetOnDate(habit, dateISO) : habit.target;
  if (target <= 0) return false;
  const value = entry[habit.id];
  if (habit.kind === "counter") return typeof value === "number" && value >= target;
  return value === true;
}

/**
 * 1. Progressive XP Curve:
 * Cấp 1 ➔ 5: 100 XP / cấp
 * Cấp 6 ➔ 15: 200 XP / cấp
 * Cấp 16 ➔ 30: 350 XP / cấp
 * Cấp 31 ➔ 50: 500 XP / cấp
 * Cấp 51+: 1000 XP / cấp
 */
export function getXpForLevelStep(level: number): number {
  if (level < 6) return 100;
  if (level < 16) return 200;
  if (level < 31) return 350;
  if (level < 51) return 500;
  return 1000;
}

export function getLevelFromXp(totalXp: number): number {
  let level = 1;
  let remainingXp = Math.max(0, totalXp);
  while (remainingXp >= getXpForLevelStep(level)) {
    remainingXp -= getXpForLevelStep(level);
    level++;
  }
  return level;
}

export function getXpProgressInCurrentLevel(totalXp: number): {
  level: number;
  currentLevelXp: number;
  requiredLevelXp: number;
  percentage: number;
  xpRemaining: number;
} {
  let level = 1;
  let remainingXp = Math.max(0, totalXp);
  while (remainingXp >= getXpForLevelStep(level)) {
    remainingXp -= getXpForLevelStep(level);
    level++;
  }
  const requiredLevelXp = getXpForLevelStep(level);
  const percentage = Math.min(100, Math.max(0, Math.round((remainingXp / requiredLevelXp) * 100)));
  return {
    level,
    currentLevelXp: remainingXp,
    requiredLevelXp,
    percentage,
    xpRemaining: requiredLevelXp - remainingXp,
  };
}

/**
 * 2. Level Titles Matrix:
 * Level 1 – 5: 🐣 Mầm Non Khởi Đầu
 * Level 6 – 10: ☘️ Người Học Bền Bỉ
 * Level 11 – 20: ⚡ Chiến Binh Pomodoro
 * Level 21 – 35: 🧠 Bậc Thầy Tập Trung
 * Level 36 – 50: 🎓 Học Giả Deep Work
 * Level 51+: 👑 Huyền Thoại Trí Tuệ
 */
export function getLevelTitle(level: number): {
  title: string;
  badge: string;
  color: string;
  icon: string;
  full: string;
} {
  if (level >= 51) {
    return {
      title: "Huyền Thoại Trí Tuệ",
      badge: "Huyền Thoại",
      color: "from-amber-500 via-rose-500 to-yellow-300",
      icon: "👑",
      full: "👑 Huyền Thoại Trí Tuệ",
    };
  }
  if (level >= 36) {
    return {
      title: "Học Giả Deep Work",
      badge: "Thượng Thừa",
      color: "from-purple-600 via-indigo-500 to-pink-400",
      icon: "🎓",
      full: "🎓 Học Giả Deep Work",
    };
  }
  if (level >= 21) {
    return {
      title: "Bậc Thầy Tập Trung",
      badge: "Chuyên Gia",
      color: "from-indigo-600 via-sky-500 to-teal-400",
      icon: "🧠",
      full: "🧠 Bậc Thầy Tập Trung",
    };
  }
  if (level >= 11) {
    return {
      title: "Chiến Binh Pomodoro",
      badge: "Bứt Phá",
      color: "from-amber-500 via-orange-500 to-sky-400",
      icon: "⚡",
      full: "⚡ Chiến Binh Pomodoro",
    };
  }
  if (level >= 6) {
    return {
      title: "Người Học Bền Bỉ",
      badge: "Tiến Bộ",
      color: "from-emerald-500 via-teal-400 to-sky-400",
      icon: "☘️",
      full: "☘️ Người Học Bền Bỉ",
    };
  }
  return {
    title: "Mầm Non Khởi Đầu",
    badge: "Tập Sự",
    color: "from-blue-400 via-sky-300 to-indigo-400",
    icon: "🐣",
    full: "🐣 Mầm Non Khởi Đầu",
  };
}

/**
 * Reward Matrix for Timer Sessions:
 * ⚡ Khởi động 2 phút: +5 XP | +1 Coin
 * 🍅 Pomodoro 25 phút: +25 XP | +5 Coins
 * 🧠 Tập trung 50 phút: +55 XP | +12 Coins
 * 🔥 Deep Work 90 phút: +100 XP | +25 Coins
 */
export function calculateSessionRewards(durationMinutes: number): { xp: number; coins: number } {
  if (durationMinutes <= 2) return { xp: 5, coins: 1 };
  if (durationMinutes <= 25) return { xp: 25, coins: 5 };
  if (durationMinutes <= 50) return { xp: 55, coins: 12 };
  if (durationMinutes <= 90) return { xp: 100, coins: 25 };
  return {
    xp: Math.round(durationMinutes * 1.1),
    coins: Math.max(1, Math.round(durationMinutes * 0.28)),
  };
}

export function studyMinutesOnDate(
  sessions: ProgressState["studySessions"],
  dateISO: string,
): number {
  const secs = studySecondsOnDate(sessions, dateISO);
  return Math.round(secs / 60);
}

export const STUDY_DAY_COMPLETE_KEY = "__study_day_complete__";

export function isStudyDay(state: ProgressState, dateISO: string): boolean {
  if (!isDateISO(dateISO)) return false;
  return state.habitLog[dateISO]?.[STUDY_DAY_COMPLETE_KEY] === true;
}

export function computeHabitStreak(state: ProgressState): number {
  let count = 0;
  let cursor = todayISO();

  for (let index = 0; index < 365; index++) {
    const entry = state.habitLog[cursor];
    if (!entry) break;
    const activeHabits = state.habitDefinitions.filter(
      (habit) => !habit.archived && habitTargetOnDate(habit, cursor) > 0,
    );
    const completedCount = activeHabits.reduce(
      (sum, habit) => sum + (habitDone(habit, entry, cursor) ? 1 : 0),
      0,
    );
    if (activeHabits.length === 0 || completedCount < Math.ceil(activeHabits.length / 2)) break;
    count++;
    cursor = addDaysISO(cursor, -1);
  }

  return count;
}

export function computeStudyStreak(state: ProgressState): number {
  let count = 0;
  let cursor = todayISO();

  if (!isStudyDay(state, cursor)) {
    cursor = addDaysISO(cursor, -1);
  }

  for (let index = 0; index < 365 && isStudyDay(state, cursor); index++) {
    count++;
    cursor = addDaysISO(cursor, -1);
  }

  return count;
}

export function computeWeekStats(state: ProgressState, ref = new Date()): WeekStats {
  const dates = getWeekDates(ref);
  const habits = state.habitDefinitions.filter((habit) => !habit.archived);
  const xpPerDay = dates.map((dateISO) =>
    Object.entries(state.completedLessons).reduce(
      (sum, [lessonId, completedOn]) =>
        completedOn === dateISO ? sum + (state.lessonXp[lessonId] ?? 0) : sum,
      0,
    ),
  );
  const habitsPerDay = dates.map((dateISO) => {
    const entry = state.habitLog[dateISO];
    return habits.reduce((count, habit) => count + (habitDone(habit, entry, dateISO) ? 1 : 0), 0);
  });
  const habitCounts: Record<string, number> = {};
  for (const habit of habits) {
    habitCounts[habit.id] = dates.reduce(
      (count, dateISO) => count + (habitDone(habit, state.habitLog[dateISO], dateISO) ? 1 : 0),
      0,
    );
  }
  const xpThisWeek = xpPerDay.reduce((sum, value) => sum + value, 0);
  let goalsMet = xpThisWeek >= state.goals.weeklyXp ? 1 : 0;
  const habitsWithGoal = habits.filter((habit) => (state.goals.habitTargets[habit.id] ?? 0) > 0);
  const goalsTotal = 1 + habitsWithGoal.length;
  for (const habit of habitsWithGoal) {
    const target = state.goals.habitTargets[habit.id] ?? 0;
    if (target > 0 && habitCounts[habit.id] >= target) goalsMet++;
  }
  return { dates, xpPerDay, habitsPerDay, xpThisWeek, habitCounts, goalsMet, goalsTotal };
}

export function computeAchievementPoints(state: ProgressState): number {
  const weeks = new Set<string>();
  for (const dateISO of Object.keys(state.habitLog)) {
    if (isDateISO(dateISO)) weeks.add(getMondayISO(dateISO));
  }
  for (const dateISO of Object.values(state.completedLessons)) {
    if (isDateISO(dateISO)) weeks.add(getMondayISO(dateISO));
  }
  weeks.add(weekStartISO());

  let points = 0;
  for (const weekISO of weeks) {
    const stats = computeWeekStats(state, new Date(`${weekISO}T12:00:00`));
    points += stats.goalsMet;
  }
  return points;
}
