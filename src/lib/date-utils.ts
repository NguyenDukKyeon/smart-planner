const DATE_ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

const localDateFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function isDateISO(value: unknown): value is string {
  return typeof value === "string" && DATE_ISO_RE.test(value);
}

export function todayISO(): string {
  return localDateFormatter.format(new Date());
}

export function localDayBoundsEpoch(dateISO: string): { start: number; end: number } {
  const start = new Date(`${dateISO}T00:00:00+07:00`).getTime();
  return { start, end: start + 24 * 60 * 60 * 1000 };
}

export function addDaysISO(dateISO: string, days: number): string {
  const [year, month, day] = dateISO.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function daysBetweenISO(fromISO: string, toISO: string): number {
  const from = new Date(`${fromISO}T00:00:00Z`).getTime();
  const to = new Date(`${toISO}T00:00:00Z`).getTime();
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

export function getSundayISO(dateISO: string): string {
  const [year, month, day] = dateISO.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay();
  const daysUntilSunday = weekday === 0 ? 0 : 7 - weekday;
  return addDaysISO(dateISO, daysUntilSunday);
}

export function dayIndex(dateISO: string): number {
  const [year, month, day] = dateISO.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function isSundayISO(dateISO: string): boolean {
  const [year, month, day] = dateISO.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() === 0;
}

export function normalizeDate(value: unknown): string {
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
  const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  // YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
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

export function displayDate(dateISO: string): string {
  if (!DATE_ISO_RE.test(dateISO)) return dateISO;
  const [year, month, day] = dateISO.split("-");
  return `${day}/${month}/${year}`;
}

export function weekdayVi(dateISO: string): string {
  const [year, month, day] = dateISO.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][weekday];
}

export function weekdayFullVi(dateISO: string): string {
  const [year, month, day] = dateISO.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"][weekday];
}
