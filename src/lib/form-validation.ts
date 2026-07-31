export type LessonFormValues = {
  subjectName: string;
  title: string;
  minutes: number;
  xp: number;
  scheduledDate: string;
};

export type FormErrors = Partial<Record<keyof LessonFormValues, string>>;

export function isValidOptionalISODate(value: string): boolean {
  if (!value) return true;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export function isFiniteNonNegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function validateLessonForm(values: LessonFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.subjectName.trim()) errors.subjectName = "Vui lòng nhập tên môn học.";
  if (!values.title.trim()) errors.title = "Vui lòng nhập tên bài học.";
  if (!isFiniteNonNegative(values.minutes) || values.minutes <= 0) {
    errors.minutes = "Thời lượng phải là một số dương hợp lệ.";
  }
  if (!isFiniteNonNegative(values.xp)) errors.xp = "XP phải là một số không âm hợp lệ.";
  if (!isValidOptionalISODate(values.scheduledDate)) {
    errors.scheduledDate = "Ngày dự kiến không tồn tại.";
  }
  return errors;
}
