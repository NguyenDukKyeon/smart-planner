//#region node_modules/.nitro/vite/services/ssr/assets/date-utils-CFRHucsE.js
var APP_TIME_ZONE = "Asia/Ho_Chi_Minh";
var APP_TIME_ZONE_OFFSET_MS = 252e5;
var DATE_ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
var localDateFormatter = new Intl.DateTimeFormat("en-CA", {
	timeZone: APP_TIME_ZONE,
	year: "numeric",
	month: "2-digit",
	day: "2-digit"
});
function dateParts(iso) {
	const [year, month, day] = iso.split("-").map(Number);
	return [
		year,
		month,
		day
	];
}
function dateOnlyEpoch(iso) {
	const [year, month, day] = dateParts(iso);
	return Date.UTC(year, month - 1, day);
}
function epochToDateISO(epoch) {
	const date = new Date(epoch);
	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}
function isDateISO(value) {
	if (typeof value !== "string" || !DATE_ISO_RE.test(value)) return false;
	const [year, month, day] = dateParts(value);
	const parsed = new Date(Date.UTC(year, month - 1, day));
	return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}
function normalizeDateToISO(value) {
	if (!value) return "";
	if (value instanceof Date && !isNaN(value.getTime())) return localDateFormatter.format(value);
	if (typeof value === "number") {
		if (value > 2e4 && value < 6e4) {
			const date = new Date(Math.round((value - 25569) * 86400 * 1e3));
			if (!isNaN(date.getTime())) return localDateFormatter.format(date);
		}
	}
	const str = String(value).trim();
	if (!str) return "";
	if (DATE_ISO_RE.test(str)) return str;
	const dmyMatch = str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
	if (dmyMatch) {
		const [, day, month, year] = dmyMatch;
		return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
	}
	const ymdMatch = str.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
	if (ymdMatch) {
		const [, year, month, day] = ymdMatch;
		return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
	}
	const parsed = new Date(str);
	if (!isNaN(parsed.getTime())) return localDateFormatter.format(parsed);
	return "";
}
function todayISO(date = /* @__PURE__ */ new Date()) {
	return localDateFormatter.format(date);
}
function addDaysISO(iso, days) {
	return epochToDateISO(dateOnlyEpoch(iso) + days * 864e5);
}
function isSundayISO(iso) {
	return new Date(dateOnlyEpoch(iso)).getUTCDay() === 0;
}
function daysBetweenISO(a, b) {
	return Math.round((dateOnlyEpoch(b) - dateOnlyEpoch(a)) / 864e5);
}
function displayDate(iso) {
	return iso.split("-").reverse().join("/");
}
var WEEKDAY_VI = [
	"CN",
	"T2",
	"T3",
	"T4",
	"T5",
	"T6",
	"T7"
];
function weekdayVi(iso) {
	return WEEKDAY_VI[new Date(dateOnlyEpoch(iso)).getUTCDay()];
}
var WEEKDAY_FULL_VI = [
	"Chủ Nhật",
	"Thứ 2",
	"Thứ 3",
	"Thứ 4",
	"Thứ 5",
	"Thứ 6",
	"Thứ 7"
];
function weekdayFullVi(iso) {
	return WEEKDAY_FULL_VI[new Date(dateOnlyEpoch(iso)).getUTCDay()];
}
function getMondayISO(iso) {
	const day = new Date(dateOnlyEpoch(iso)).getUTCDay();
	return addDaysISO(iso, day === 0 ? -6 : 1 - day);
}
function getSundayISO(iso) {
	return addDaysISO(getMondayISO(iso), 6);
}
function dayIndex(iso) {
	return Math.floor(dateOnlyEpoch(iso) / 864e5);
}
function localDayBoundsEpoch(dateISO) {
	const start = dateOnlyEpoch(dateISO) - APP_TIME_ZONE_OFFSET_MS;
	return {
		start,
		end: start + 864e5
	};
}
//#endregion
export { getMondayISO as a, isSundayISO as c, todayISO as d, weekdayFullVi as f, displayDate as i, localDayBoundsEpoch as l, dayIndex as n, getSundayISO as o, weekdayVi as p, daysBetweenISO as r, isDateISO as s, addDaysISO as t, normalizeDateToISO as u };
