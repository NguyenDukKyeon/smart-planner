export const MIN_DAILY_STUDY_HOURS = 0;
export const MAX_DAILY_STUDY_HOURS = 16;
export const DAILY_STUDY_HOURS_STEP = 0.5;
export const HIGH_DAILY_STUDY_HOURS_THRESHOLD = 12;

export function normalizeDailyStudyHours(value: number): number {
  if (!Number.isFinite(value)) return MIN_DAILY_STUDY_HOURS;

  const clamped = Math.min(MAX_DAILY_STUDY_HOURS, Math.max(MIN_DAILY_STUDY_HOURS, value));
  const rounded = Math.round(clamped / DAILY_STUDY_HOURS_STEP) * DAILY_STUDY_HOURS_STEP;

  return Number(rounded.toFixed(1));
}

export function isHighDailyStudyHours(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value > HIGH_DAILY_STUDY_HOURS_THRESHOLD &&
    value <= MAX_DAILY_STUDY_HOURS
  );
}
