// Calendar helpers are fixed to the product timezone. Date-only calculations use
// UTC internally so their result does not depend on the browser or server timezone.
export const APP_TIME_ZONE = "Asia/Ho_Chi_Minh";
const APP_TIME_ZONE_OFFSET_MS = 7 * 60 * 60 * 1000;
const DATE_ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

const localDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function dateParts(iso: string): [number, number, number] {
  const [year, month, day] = iso.split("-").map(Number);
  return [year, month, day];
}

function dateOnlyEpoch(iso: string): number {
  const [year, month, day] = dateParts(iso);
  return Date.UTC(year, month - 1, day);
}

function epochToDateISO(epoch: number): string {
  const date = new Date(epoch);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate(),
  ).padStart(2, "0")}`;
}

export function isDateISO(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_ISO_RE.test(value)) return false;
  const [year, month, day] = dateParts(value);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function normalizeDateToISO(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date && !isNaN(value.getTime())) {
    return localDateFormatter.format(value);
  }
  if (typeof value === "number") {
    // Excel serial date number conversion (1900 epoch)
    if (value > 20000 && value < 60000) {
      const date = new Date(Math.round((value - 25569) * 86400 * 1000));
      if (!isNaN(date.getTime())) {
        return localDateFormatter.format(date);
      }
    }
  }
  const str = String(value).trim();
  if (!str) return "";
  if (DATE_ISO_RE.test(str)) return str;

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  // YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Fallback to JS Date parsing
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return localDateFormatter.format(parsed);
  }
  return "";
}

export function todayISO(date: Date = new Date()): string {
  return localDateFormatter.format(date);
}

export const localDateISO = todayISO;

export function parseISO(iso: string): Date {
  return new Date(dateOnlyEpoch(iso));
}

export function addDaysISO(iso: string, days: number): string {
  return epochToDateISO(dateOnlyEpoch(iso) + days * 86400000);
}

export function isSundayISO(iso: string): boolean {
  return new Date(dateOnlyEpoch(iso)).getUTCDay() === 0;
}

export function daysBetweenISO(a: string, b: string): number {
  return Math.round((dateOnlyEpoch(b) - dateOnlyEpoch(a)) / 86400000);
}

export function displayDate(iso: string): string {
  return iso.split("-").reverse().join("/");
}

const WEEKDAY_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
export function weekdayVi(iso: string): string {
  return WEEKDAY_VI[new Date(dateOnlyEpoch(iso)).getUTCDay()];
}

const WEEKDAY_FULL_VI = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
export function weekdayFullVi(iso: string): string {
  return WEEKDAY_FULL_VI[new Date(dateOnlyEpoch(iso)).getUTCDay()];
}

export function getMondayISO(iso: string): string {
  const day = new Date(dateOnlyEpoch(iso)).getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDaysISO(iso, diff);
}

export function getSundayISO(iso: string): string {
  return addDaysISO(getMondayISO(iso), 6);
}

// Deterministic integer index for rotation from an ISO date.
export function dayIndex(iso: string): number {
  return Math.floor(dateOnlyEpoch(iso) / 86400000);
}

export function isSameLocalDay(timestamp: string | number | Date, dateISO: string): boolean {
  const date =
    timestamp instanceof Date
      ? timestamp
      : new Date(typeof timestamp === "number" ? timestamp : Date.parse(timestamp));
  return !Number.isNaN(date.getTime()) && todayISO(date) === dateISO;
}

export function getLocalWeekRange(dateISO: string): { startISO: string; endISO: string } {
  const startISO = getMondayISO(dateISO);
  return { startISO, endISO: addDaysISO(startISO, 6) };
}

export function isTimestampInsideLocalWeek(
  timestamp: string | number | Date,
  weekStartISO: string,
): boolean {
  const date =
    timestamp instanceof Date
      ? timestamp
      : new Date(typeof timestamp === "number" ? timestamp : Date.parse(timestamp));
  if (Number.isNaN(date.getTime())) return false;
  const localISO = todayISO(date);
  return localISO >= weekStartISO && localISO <= addDaysISO(weekStartISO, 6);
}

export function localDayBoundsEpoch(dateISO: string): { start: number; end: number } {
  const start = dateOnlyEpoch(dateISO) - APP_TIME_ZONE_OFFSET_MS;
  return { start, end: start + 86400000 };
}
