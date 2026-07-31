import { r as __toESM } from "../_runtime.mjs";
import { a as getMondayISO, d as todayISO, l as localDayBoundsEpoch, s as isDateISO, t as addDaysISO } from "./date-utils-CFRHucsE.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as CollapsibleTrigger$1, r as Root, t as CollapsibleContent$1 } from "../_libs/@radix-ui/react-collapsible+[...].mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { D as cn, a as DEFAULT_STUDY_META, f as HABITS, m as INITIAL_LESSON_XP, p as INITIAL_COMPLETED_LESSONS, r as DEFAULT_PLANNER_SETTINGS, t as ALL_LESSONS } from "./planner-2Pf6y40b.mjs";
import { J as writeRawVerified, R as replaceRawValuesSafely, S as loadStorage, b as getBrowserStorage, i as FOCUS_TIMER_SESSION_ROLLBACK_KEY, q as writeJsonVerified } from "./custom-subjects-uE4AACuO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/collapsible-D3R5XvsL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName = "/app/applet/src/components/DuotoneIcon.tsx";
var TONE = {
	blue: {
		fg: "text-sky-500",
		bg: "text-sky-500/25",
		ring: "bg-sky-100"
	},
	green: {
		fg: "text-emerald-500",
		bg: "text-emerald-500/25",
		ring: "bg-emerald-100"
	},
	amber: {
		fg: "text-amber-500",
		bg: "text-amber-500/25",
		ring: "bg-amber-100"
	},
	coral: {
		fg: "text-rose-500",
		bg: "text-rose-500/25",
		ring: "bg-rose-100"
	}
};
function DuotoneIcon({ icon: Icon, active = true, tone = "blue", size = 24, className }) {
	const t = TONE[tone];
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
		className: cn("relative inline-flex items-center justify-center rounded-2xl transition-all", active ? t.ring : "bg-muted", className),
		style: {
			width: size * 1.7,
			height: size * 1.7
		},
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Icon, {
			className: cn("absolute", active ? t.bg : "text-muted-foreground/30"),
			size,
			fill: "currentColor",
			strokeWidth: 0,
			style: { transform: "translate(1.5px, 1.5px)" }
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 36,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Icon, {
			className: cn("relative", active ? t.fg : "text-muted-foreground"),
			size,
			strokeWidth: 2.2
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 43,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 28,
		columnNumber: 5
	}, this);
}
function createStableId(prefix = "session") {
	return `${prefix}-${typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`}`;
}
function createStudySession(input) {
	const endedAtDate = input.endedAt ? new Date(input.endedAt) : /* @__PURE__ */ new Date();
	const durationSeconds = Math.max(1, Math.round(input.durationSeconds));
	const startedAtDate = /* @__PURE__ */ new Date(endedAtDate.getTime() - durationSeconds * 1e3);
	const createdAt = (/* @__PURE__ */ new Date()).toISOString();
	return {
		id: input.id ?? createStableId(),
		lessonId: input.lessonId,
		startedAt: startedAtDate.toISOString(),
		endedAt: endedAtDate.toISOString(),
		durationSeconds,
		source: input.source,
		cycleMode: "focus",
		timerPreset: input.timerPreset,
		createdAt
	};
}
function isValidStudySession(value) {
	if (!value || typeof value !== "object") return false;
	const session = value;
	if (typeof session.id !== "string" || !session.id || typeof session.lessonId !== "string" || !session.lessonId || typeof session.startedAt !== "string" || typeof session.endedAt !== "string" || typeof session.createdAt !== "string" || typeof session.durationSeconds !== "number" || !Number.isFinite(session.durationSeconds) || session.durationSeconds <= 0 || session.source !== "focus-timer" && session.source !== "manual" || session.cycleMode !== "focus") return false;
	const startedAt = Date.parse(session.startedAt);
	const endedAt = Date.parse(session.endedAt);
	const createdAt = Date.parse(session.createdAt);
	return Number.isFinite(startedAt) && Number.isFinite(endedAt) && Number.isFinite(createdAt) && endedAt >= startedAt && session.durationSeconds <= Math.ceil((endedAt - startedAt) / 1e3) + 1;
}
function sanitizeStudySessions(value) {
	if (!Array.isArray(value)) return [];
	const seen = /* @__PURE__ */ new Set();
	const sessions = [];
	for (const candidate of value) {
		if (!isValidStudySession(candidate) || seen.has(candidate.id)) continue;
		seen.add(candidate.id);
		sessions.push(candidate);
	}
	return sessions;
}
function studySecondsOnDate(sessions, dateISO) {
	if (!isDateISO(dateISO)) return 0;
	const { start, end } = localDayBoundsEpoch(dateISO);
	let total = 0;
	for (const session of sessions) {
		if (!isValidStudySession(session) || session.cycleMode !== "focus") continue;
		const endedAt = Date.parse(session.endedAt);
		const activeStart = endedAt - session.durationSeconds * 1e3;
		const overlap = Math.max(0, Math.min(endedAt, end) - Math.max(activeStart, start));
		total += Math.round(overlap / 1e3);
	}
	return total;
}
var FOCUS_PREFERENCES_KEY = "hocvien-focus-preferences-v1";
var FOCUS_PREFERENCES_EVENT = "hocvien:focus-preferences-updated";
var LEGACY_TIMER_KEY = "hocvien-focus-timer-v2";
var DEFAULT_FOCUS_PREFERENCES = {
	defaultFocusMinutes: 25,
	quickStartEnabled: true,
	autoStartSelectedDuration: true,
	autoStartBreak: false,
	autoStartFocus: false,
	confirmBeforeStop: true,
	keepRunningAcrossTabs: true,
	showMiniTimer: true,
	notifyWhenComplete: true,
	showTimerInHeader: true,
	soundAlertsEnabled: true,
	soundVolume: .5
};
function normalizeFocusPreferences(value) {
	if (!value || typeof value !== "object") return null;
	const raw = value;
	const defaultFocusMinutes = [
		25,
		50,
		90
	].includes(Number(raw.defaultFocusMinutes)) ? Number(raw.defaultFocusMinutes) : DEFAULT_FOCUS_PREFERENCES.defaultFocusMinutes;
	const volume = Number(raw.soundVolume);
	return {
		defaultFocusMinutes,
		quickStartEnabled: typeof raw.quickStartEnabled === "boolean" ? raw.quickStartEnabled : DEFAULT_FOCUS_PREFERENCES.quickStartEnabled,
		autoStartSelectedDuration: typeof raw.autoStartSelectedDuration === "boolean" ? raw.autoStartSelectedDuration : DEFAULT_FOCUS_PREFERENCES.autoStartSelectedDuration,
		autoStartBreak: typeof raw.autoStartBreak === "boolean" ? raw.autoStartBreak : DEFAULT_FOCUS_PREFERENCES.autoStartBreak,
		autoStartFocus: typeof raw.autoStartFocus === "boolean" ? raw.autoStartFocus : DEFAULT_FOCUS_PREFERENCES.autoStartFocus,
		confirmBeforeStop: typeof raw.confirmBeforeStop === "boolean" ? raw.confirmBeforeStop : DEFAULT_FOCUS_PREFERENCES.confirmBeforeStop,
		keepRunningAcrossTabs: typeof raw.keepRunningAcrossTabs === "boolean" ? raw.keepRunningAcrossTabs : DEFAULT_FOCUS_PREFERENCES.keepRunningAcrossTabs,
		showMiniTimer: typeof raw.showMiniTimer === "boolean" ? raw.showMiniTimer : DEFAULT_FOCUS_PREFERENCES.showMiniTimer,
		notifyWhenComplete: typeof raw.notifyWhenComplete === "boolean" ? raw.notifyWhenComplete : DEFAULT_FOCUS_PREFERENCES.notifyWhenComplete,
		showTimerInHeader: typeof raw.showTimerInHeader === "boolean" ? raw.showTimerInHeader : DEFAULT_FOCUS_PREFERENCES.showTimerInHeader,
		soundAlertsEnabled: typeof raw.soundAlertsEnabled === "boolean" ? raw.soundAlertsEnabled : DEFAULT_FOCUS_PREFERENCES.soundAlertsEnabled,
		soundVolume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : .5
	};
}
function migrateLegacyTimerPreferences(storage) {
	if (!storage) return null;
	try {
		const raw = storage.getItem(LEGACY_TIMER_KEY);
		if (!raw) return null;
		const legacy = JSON.parse(raw);
		const legacyAutoStart = legacy.autoStartNextSession === true;
		const duration = Number(legacy.durationMinutes);
		return normalizeFocusPreferences({
			...DEFAULT_FOCUS_PREFERENCES,
			defaultFocusMinutes: [
				25,
				50,
				90
			].includes(duration) ? duration : 25,
			autoStartBreak: typeof legacy.autoStartBreak === "boolean" ? legacy.autoStartBreak : legacyAutoStart,
			autoStartFocus: typeof legacy.autoStartFocus === "boolean" ? legacy.autoStartFocus : legacyAutoStart,
			soundAlertsEnabled: typeof legacy.soundAlertsEnabled === "boolean" ? legacy.soundAlertsEnabled : DEFAULT_FOCUS_PREFERENCES.soundAlertsEnabled,
			soundVolume: typeof legacy.soundVolume === "number" ? legacy.soundVolume : DEFAULT_FOCUS_PREFERENCES.soundVolume
		});
	} catch {
		return null;
	}
}
function loadFocusPreferences(storage = getBrowserStorage()) {
	const loaded = loadStorage(FOCUS_PREFERENCES_KEY, (raw) => normalizeFocusPreferences(JSON.parse(raw)), storage);
	if (loaded.status === "ok") return loaded.value;
	if (loaded.status !== "missing") return { ...DEFAULT_FOCUS_PREFERENCES };
	const migrated = migrateLegacyTimerPreferences(storage);
	if (migrated && storage) {
		writeJsonVerified(FOCUS_PREFERENCES_KEY, migrated, (value) => normalizeFocusPreferences(value) !== null, storage);
		return migrated;
	}
	return { ...DEFAULT_FOCUS_PREFERENCES };
}
function saveFocusPreferences(patch, storage = getBrowserStorage()) {
	const next = normalizeFocusPreferences({
		...loadFocusPreferences(storage),
		...patch
	});
	if (!next) return {
		ok: false,
		error: "Cài đặt Pomodoro không hợp lệ."
	};
	const saved = writeJsonVerified(FOCUS_PREFERENCES_KEY, next, (value) => normalizeFocusPreferences(value) !== null, storage);
	if (!saved.ok) return saved;
	if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(FOCUS_PREFERENCES_EVENT, { detail: next }));
	return {
		ok: true,
		value: next
	};
}
function weekStartISO(ref = /* @__PURE__ */ new Date()) {
	return getMondayISO(todayISO(ref));
}
function getWeekDates(ref = /* @__PURE__ */ new Date()) {
	const start = weekStartISO(ref);
	return Array.from({ length: 7 }, (_, index) => addDaysISO(start, index));
}
function habitTargetOnDate(habit, dateISO) {
	const mondayIndex = ((/* @__PURE__ */ new Date(`${dateISO}T12:00:00`)).getDay() + 6) % 7;
	return habit.dailyTargets[mondayIndex] ?? habit.target;
}
function habitDone(habit, entry, dateISO) {
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
function getXpForLevelStep(level) {
	if (level < 6) return 100;
	if (level < 16) return 200;
	if (level < 31) return 350;
	if (level < 51) return 500;
	return 1e3;
}
function getLevelFromXp(totalXp) {
	let level = 1;
	let remainingXp = Math.max(0, totalXp);
	while (remainingXp >= getXpForLevelStep(level)) {
		remainingXp -= getXpForLevelStep(level);
		level++;
	}
	return level;
}
function getXpProgressInCurrentLevel(totalXp) {
	let level = 1;
	let remainingXp = Math.max(0, totalXp);
	while (remainingXp >= getXpForLevelStep(level)) {
		remainingXp -= getXpForLevelStep(level);
		level++;
	}
	const requiredLevelXp = getXpForLevelStep(level);
	const percentage = Math.min(100, Math.max(0, Math.round(remainingXp / requiredLevelXp * 100)));
	return {
		level,
		currentLevelXp: remainingXp,
		requiredLevelXp,
		percentage,
		xpRemaining: requiredLevelXp - remainingXp
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
function getLevelTitle(level) {
	if (level >= 51) return {
		title: "Huyền Thoại Trí Tuệ",
		badge: "Huyền Thoại",
		color: "from-amber-500 via-rose-500 to-yellow-300",
		icon: "👑",
		full: "👑 Huyền Thoại Trí Tuệ"
	};
	if (level >= 36) return {
		title: "Học Giả Deep Work",
		badge: "Thượng Thừa",
		color: "from-purple-600 via-indigo-500 to-pink-400",
		icon: "🎓",
		full: "🎓 Học Giả Deep Work"
	};
	if (level >= 21) return {
		title: "Bậc Thầy Tập Trung",
		badge: "Chuyên Gia",
		color: "from-indigo-600 via-sky-500 to-teal-400",
		icon: "🧠",
		full: "🧠 Bậc Thầy Tập Trung"
	};
	if (level >= 11) return {
		title: "Chiến Binh Pomodoro",
		badge: "Bứt Phá",
		color: "from-amber-500 via-orange-500 to-sky-400",
		icon: "⚡",
		full: "⚡ Chiến Binh Pomodoro"
	};
	if (level >= 6) return {
		title: "Người Học Bền Bỉ",
		badge: "Tiến Bộ",
		color: "from-emerald-500 via-teal-400 to-sky-400",
		icon: "☘️",
		full: "☘️ Người Học Bền Bỉ"
	};
	return {
		title: "Mầm Non Khởi Đầu",
		badge: "Tập Sự",
		color: "from-blue-400 via-sky-300 to-indigo-400",
		icon: "🐣",
		full: "🐣 Mầm Non Khởi Đầu"
	};
}
/**
* Reward Matrix for Timer Sessions:
* ⚡ Khởi động 2 phút: +5 XP | +1 Coin
* 🍅 Pomodoro 25 phút: +25 XP | +5 Coins
* 🧠 Tập trung 50 phút: +55 XP | +12 Coins
* 🔥 Deep Work 90 phút: +100 XP | +25 Coins
*/
function calculateSessionRewards(durationMinutes) {
	if (durationMinutes <= 2) return {
		xp: 5,
		coins: 1
	};
	if (durationMinutes <= 25) return {
		xp: 25,
		coins: 5
	};
	if (durationMinutes <= 50) return {
		xp: 55,
		coins: 12
	};
	if (durationMinutes <= 90) return {
		xp: 100,
		coins: 25
	};
	return {
		xp: Math.round(durationMinutes * 1.1),
		coins: Math.max(1, Math.round(durationMinutes * .28))
	};
}
function studyMinutesOnDate(sessions, dateISO) {
	const secs = studySecondsOnDate(sessions, dateISO);
	return Math.round(secs / 60);
}
function isStudyDay(state, dateISO) {
	if (!isDateISO(dateISO)) return false;
	const hasCompletedLesson = Object.values(state.completedLessons).some((completedOn) => completedOn === dateISO);
	const hasRecordedStudyHabit = state.habitLog[dateISO]?.study === true;
	const hasFocusSession = studyMinutesOnDate(state.studySessions, dateISO) >= 25 || studySecondsOnDate(state.studySessions, dateISO) > 0;
	return hasCompletedLesson || hasRecordedStudyHabit || hasFocusSession;
}
function computeHabitStreak(state) {
	let count = 0;
	let cursor = todayISO();
	for (let index = 0; index < 365; index++) {
		const entry = state.habitLog[cursor];
		if (!entry) break;
		const activeHabits = state.habitDefinitions.filter((habit) => !habit.archived && habitTargetOnDate(habit, cursor) > 0);
		const completedCount = activeHabits.reduce((sum, habit) => sum + (habitDone(habit, entry, cursor) ? 1 : 0), 0);
		if (activeHabits.length === 0 || completedCount < Math.ceil(activeHabits.length / 2)) break;
		count++;
		cursor = addDaysISO(cursor, -1);
	}
	return count;
}
function computeStudyStreak(state) {
	let count = 0;
	let cursor = todayISO();
	if (!isStudyDay(state, cursor)) cursor = addDaysISO(cursor, -1);
	for (let index = 0; index < 365 && isStudyDay(state, cursor); index++) {
		count++;
		cursor = addDaysISO(cursor, -1);
	}
	return count;
}
function computeWeekStats(state, ref = /* @__PURE__ */ new Date()) {
	const dates = getWeekDates(ref);
	const habits = state.habitDefinitions.filter((habit) => !habit.archived);
	const xpPerDay = dates.map((dateISO) => Object.entries(state.completedLessons).reduce((sum, [lessonId, completedOn]) => completedOn === dateISO ? sum + (state.lessonXp[lessonId] ?? 0) : sum, 0));
	const habitsPerDay = dates.map((dateISO) => {
		const entry = state.habitLog[dateISO];
		return habits.reduce((count, habit) => count + (habitDone(habit, entry, dateISO) ? 1 : 0), 0);
	});
	const habitCounts = {};
	for (const habit of habits) habitCounts[habit.id] = dates.reduce((count, dateISO) => count + (habitDone(habit, state.habitLog[dateISO], dateISO) ? 1 : 0), 0);
	const xpThisWeek = xpPerDay.reduce((sum, value) => sum + value, 0);
	let goalsMet = xpThisWeek >= state.goals.weeklyXp ? 1 : 0;
	const habitsWithGoal = habits.filter((habit) => (state.goals.habitTargets[habit.id] ?? 0) > 0);
	const goalsTotal = 1 + habitsWithGoal.length;
	for (const habit of habitsWithGoal) {
		const target = state.goals.habitTargets[habit.id] ?? 0;
		if (target > 0 && habitCounts[habit.id] >= target) goalsMet++;
	}
	return {
		dates,
		xpPerDay,
		habitsPerDay,
		xpThisWeek,
		habitCounts,
		goalsMet,
		goalsTotal
	};
}
function computeAchievementPoints(state) {
	const weeks = /* @__PURE__ */ new Set();
	for (const dateISO of Object.keys(state.habitLog)) if (isDateISO(dateISO)) weeks.add(getMondayISO(dateISO));
	for (const dateISO of Object.values(state.completedLessons)) if (isDateISO(dateISO)) weeks.add(getMondayISO(dateISO));
	weeks.add(weekStartISO());
	let points = 0;
	for (const weekISO of weeks) {
		const stats = computeWeekStats(state, /* @__PURE__ */ new Date(`${weekISO}T12:00:00`));
		points += stats.goalsMet;
	}
	return points;
}
var DEFAULT_GOALS = {
	weeklyXp: 300,
	habitTargets: {
		water: 7,
		read: 5,
		move: 4,
		sleep: 6,
		meditate: 4,
		study: 5
	}
};
var DEFAULT_REMINDERS = {
	water: {
		enabled: false,
		time: "10:00"
	},
	read: {
		enabled: false,
		time: "20:30"
	},
	move: {
		enabled: false,
		time: "17:00"
	},
	sleep: {
		enabled: false,
		time: "22:30"
	},
	meditate: {
		enabled: false,
		time: "07:00"
	},
	study: {
		enabled: false,
		time: "19:00"
	}
};
var PROGRESS_STORAGE_KEY = "hocvien-progress-v2";
var PROGRESS_BACKUP_KEY = "hocvien-progress-v2-backup-before-v5";
var UNDATED_COMPLETION = "undated";
function createInitialProgressState(withDemoData = false) {
	const completedLessons = withDemoData ? { ...INITIAL_COMPLETED_LESSONS } : {};
	const lessonXp = withDemoData ? { ...INITIAL_LESSON_XP } : {};
	return {
		completedLessons,
		lessonXp,
		habitLog: {},
		xp: Object.values(lessonXp).reduce((s, v) => s + v, 0),
		coins: Object.keys(completedLessons).length * 2,
		streakFreezeCount: 1,
		customRewards: [],
		claimedRewards: [],
		goals: {
			...DEFAULT_GOALS,
			habitTargets: { ...DEFAULT_GOALS.habitTargets }
		},
		reminders: { ...DEFAULT_REMINDERS },
		plannerSettings: {
			...DEFAULT_PLANNER_SETTINGS,
			dailyHours: {}
		},
		studyMeta: {
			...DEFAULT_STUDY_META,
			actualMinutes: {}
		},
		studySessions: [],
		habitDefinitions: HABITS.map(cloneHabitDefinition),
		onboardingComplete: true,
		schemaVersion: 5
	};
}
var FIRST_RUN_DEFAULT = {
	...createInitialProgressState(false),
	onboardingComplete: false
};
var emptyEntry = (definitions = HABITS) => Object.fromEntries(definitions.map((definition) => [definition.id, definition.kind === "counter" ? 0 : false]));
function migrateProgressState(raw) {
	if (raw == null) return {
		ok: true,
		state: FIRST_RUN_DEFAULT,
		sourceVersion: 5,
		needsBackup: false
	};
	let parsed = null;
	try {
		const j = JSON.parse(raw);
		if (j && typeof j === "object") parsed = j;
	} catch {
		return {
			ok: false,
			error: "Dữ liệu tiến độ hiện có không phải JSON hợp lệ."
		};
	}
	if (!parsed) return {
		ok: false,
		error: "Dữ liệu tiến độ không có cấu trúc hợp lệ."
	};
	const sourceVersion = typeof parsed.schemaVersion === "number" && Number.isInteger(parsed.schemaVersion) ? parsed.schemaVersion : 0;
	if (sourceVersion > 5) return {
		ok: false,
		error: `Dữ liệu dùng schema v${sourceVersion}, mới hơn phiên bản ứng dụng hỗ trợ.`
	};
	const rawCompleted = parsed.completedLessons ?? {};
	const completedLessons = {};
	for (const [k, v] of Object.entries(rawCompleted)) if (isDateISO(v)) completedLessons[k] = v;
	else if (v === true || typeof v === "string") completedLessons[k] = UNDATED_COMPLETION;
	const lessonXp = {};
	const rawXp = parsed.lessonXp ?? {};
	for (const [k, v] of Object.entries(rawXp)) if (typeof v === "number") lessonXp[k] = v;
	const xpByLesson = new Map(ALL_LESSONS.map((l) => [l.id, l.xp]));
	for (const id of Object.keys(completedLessons)) if (lessonXp[id] == null) lessonXp[id] = xpByLesson.get(id) ?? 20;
	const habitLog = sanitizeHabitLog(parsed.habitLog);
	const habitDefinitions = sanitizeHabitDefinitions(parsed.habitDefinitions);
	const xpVal = typeof parsed.xp === "number" ? parsed.xp : Object.values(lessonXp).reduce((s, v) => s + v, 0);
	const coinsVal = typeof parsed.coins === "number" ? parsed.coins : Object.keys(completedLessons).length * 2;
	const goalsIn = parsed.goals ?? {};
	const goals = {
		weeklyXp: typeof goalsIn.weeklyXp === "number" ? goalsIn.weeklyXp : DEFAULT_GOALS.weeklyXp,
		habitTargets: {
			...DEFAULT_GOALS.habitTargets,
			...goalsIn.habitTargets ?? {}
		}
	};
	const reminders = {
		...DEFAULT_REMINDERS,
		...parsed.reminders ?? {}
	};
	const psIn = parsed.plannerSettings ?? {};
	const plannerSettings = {
		todayHours: typeof psIn.todayHours === "number" ? clamp(psIn.todayHours, 0, 12) : DEFAULT_PLANNER_SETTINGS.todayHours,
		dailyHours: psIn.dailyHours && typeof psIn.dailyHours === "object" ? sanitizeDailyHours(psIn.dailyHours) : {},
		defaultDailyHours: typeof psIn.defaultDailyHours === "number" ? clamp(psIn.defaultDailyHours, 0, 12) : DEFAULT_PLANNER_SETTINGS.defaultDailyHours,
		reviewShareMax: typeof psIn.reviewShareMax === "number" ? clamp(psIn.reviewShareMax, 0, 1) : DEFAULT_PLANNER_SETTINGS.reviewShareMax,
		reviewCapMinutes: typeof psIn.reviewCapMinutes === "number" ? Math.max(0, psIn.reviewCapMinutes) : DEFAULT_PLANNER_SETTINGS.reviewCapMinutes,
		subjectRotation: DEFAULT_PLANNER_SETTINGS.subjectRotation
	};
	const smIn = parsed.studyMeta ?? {};
	const actualMinutesRaw = smIn.actualMinutes ?? {};
	const actualMinutes = {};
	for (const [k, v] of Object.entries(actualMinutesRaw)) if (Array.isArray(v)) actualMinutes[k] = v.filter((n) => typeof n === "number" && Number.isFinite(n) && n > 0);
	const studyMeta = {
		actualMinutes,
		fallbackMinutes: typeof smIn.fallbackMinutes === "number" && smIn.fallbackMinutes !== 75 ? smIn.fallbackMinutes : DEFAULT_STUDY_META.fallbackMinutes,
		minPerLesson: typeof smIn.minPerLesson === "number" ? smIn.minPerLesson : DEFAULT_STUDY_META.minPerLesson,
		maxPerLesson: typeof smIn.maxPerLesson === "number" ? smIn.maxPerLesson : DEFAULT_STUDY_META.maxPerLesson
	};
	return {
		ok: true,
		state: {
			completedLessons,
			lessonXp,
			habitLog,
			xp: xpVal,
			coins: coinsVal,
			streakFreezeCount: typeof parsed.streakFreezeCount === "number" ? parsed.streakFreezeCount : 1,
			customRewards: Array.isArray(parsed.customRewards) ? parsed.customRewards : [],
			claimedRewards: Array.isArray(parsed.claimedRewards) ? parsed.claimedRewards : [],
			goals,
			reminders,
			plannerSettings,
			studyMeta,
			studySessions: sanitizeStudySessions(parsed.studySessions),
			habitDefinitions,
			onboardingComplete: typeof parsed.onboardingComplete === "boolean" ? parsed.onboardingComplete : true,
			schemaVersion: 5
		},
		sourceVersion,
		needsBackup: sourceVersion < 5
	};
}
function loadProgressStorage(storage) {
	return loadStorage(PROGRESS_STORAGE_KEY, (raw) => {
		const migrated = migrateProgressState(raw);
		if (!migrated.ok) throw new Error(migrated.error);
		return migrated.state;
	}, storage);
}
function saveProgressStorage(state, storage) {
	const current = loadProgressStorage(storage);
	if (current.status === "invalid") return {
		ok: false,
		error: "Tiến độ hiện có không hợp lệ và chưa được ghi đè."
	};
	if (current.status === "unavailable") return {
		ok: false,
		error: current.error
	};
	return writeJsonVerified(PROGRESS_STORAGE_KEY, state, (value) => migrateProgressState(JSON.stringify(value)).ok, storage);
}
/** Pure candidate builder shared by the timer transaction and React store. */
function appendStudySessionToProgress(current, session) {
	if (current.studySessions.some((candidate) => candidate.id === session.id)) return current;
	const minutes = Math.max(1, Math.round(session.durationSeconds / 60));
	const samples = current.studyMeta.actualMinutes[session.lessonId] ?? [];
	return {
		...current,
		studySessions: [...current.studySessions, session],
		studyMeta: {
			...current.studyMeta,
			actualMinutes: {
				...current.studyMeta.actualMinutes,
				[session.lessonId]: [...samples, minutes]
			}
		}
	};
}
function getLessonCompletedMinutes(lessonId, state) {
	if (state.studySessions && state.studySessions.length > 0) {
		const totalSecs = state.studySessions.filter((session) => session.lessonId === lessonId).reduce((sum, session) => sum + (session.durationSeconds || 0), 0);
		if (totalSecs > 0) return Math.round(totalSecs / 60);
	}
	const samples = state.studyMeta?.actualMinutes?.[lessonId];
	if (samples && samples.length > 0) return samples.reduce((acc, m) => acc + m, 0);
	return 0;
}
function cloneHabitDefinition(habit) {
	return {
		...habit,
		dailyTargets: [...habit.dailyTargets]
	};
}
function sanitizeHabitDefinitions(value) {
	if (!Array.isArray(value)) return HABITS.map(cloneHabitDefinition);
	if (value.length === 0) return [];
	const icons = [
		"water",
		"book",
		"run",
		"sleep",
		"meditate",
		"study"
	];
	const colors = [
		"blue",
		"green",
		"amber",
		"coral"
	];
	const seen = /* @__PURE__ */ new Set();
	const definitions = [];
	for (const candidate of value) {
		if (!candidate || typeof candidate !== "object") continue;
		const raw = candidate;
		if (typeof raw.id !== "string" || !raw.id.trim() || seen.has(raw.id)) continue;
		if (typeof raw.name !== "string" || !raw.name.trim()) continue;
		const kind = raw.kind === "counter" ? "counter" : "toggle";
		const fallbackTarget = kind === "counter" ? 1 : 1;
		const target = typeof raw.target === "number" && Number.isFinite(raw.target) ? clamp(Math.round(raw.target), 1, 999) : fallbackTarget;
		const dailySource = Array.isArray(raw.dailyTargets) ? raw.dailyTargets : [];
		const dailyTargets = Array.from({ length: 7 }, (_, index) => {
			const item = dailySource[index];
			if (typeof item !== "number" || !Number.isFinite(item)) return target;
			return clamp(Math.round(item), 0, 999);
		});
		definitions.push({
			id: raw.id,
			name: raw.name.trim(),
			kind,
			target,
			icon: icons.includes(raw.icon) ? raw.icon : "study",
			color: colors.includes(raw.color) ? raw.color : "green",
			archived: raw.archived === true,
			dailyTargets
		});
		seen.add(raw.id);
	}
	return definitions.length > 0 ? definitions : HABITS.map(cloneHabitDefinition);
}
function sanitizeHabitLog(value) {
	if (!value || typeof value !== "object") return {};
	const result = {};
	for (const [dateISO, rawEntry] of Object.entries(value)) {
		if (!isDateISO(dateISO) || !rawEntry || typeof rawEntry !== "object") continue;
		const entry = {};
		for (const [habitId, rawValue] of Object.entries(rawEntry)) {
			if (typeof rawValue === "boolean") entry[habitId] = rawValue;
			if (typeof rawValue === "number" && Number.isFinite(rawValue)) entry[habitId] = Math.max(0, rawValue);
		}
		result[dateISO] = entry;
	}
	return result;
}
function clamp(n, lo, hi) {
	return Math.min(hi, Math.max(lo, n));
}
function sanitizeDailyHours(raw) {
	const out = {};
	for (const [k, v] of Object.entries(raw)) if (typeof v === "number" && v >= 0 && v <= 12) out[k] = v;
	return out;
}
function useProgress() {
	const [state, setState] = (0, import_react.useState)(FIRST_RUN_DEFAULT);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const [storageError, setStorageError] = (0, import_react.useState)(null);
	const [storageStatus, setStorageStatus] = (0, import_react.useState)({ status: "missing" });
	const stateRef = (0, import_react.useRef)(state);
	const persistenceEnabled = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		const rawProgress = loadStorage(PROGRESS_STORAGE_KEY, (raw) => raw);
		if (rawProgress.status === "unavailable") {
			setStorageStatus(rawProgress);
			setStorageError(rawProgress.error);
			setHydrated(true);
			return;
		}
		const raw = rawProgress.status === "ok" ? rawProgress.value : null;
		const migrated = migrateProgressState(raw);
		if (!migrated.ok) {
			const invalid = {
				status: "invalid",
				raw: raw ?? "",
				error: migrated.error
			};
			setStorageStatus(invalid);
			setStorageError(`${migrated.error} Bản gốc vẫn được giữ nguyên; ứng dụng sẽ không tự ghi đè dữ liệu.`);
			setHydrated(true);
			return;
		}
		if (raw != null && migrated.needsBackup) {
			const backup = loadStorage(PROGRESS_BACKUP_KEY, (value) => value);
			if (backup.status === "unavailable") {
				setStorageStatus(backup);
				setStorageError("Không thể xác nhận bản sao an toàn trước migration. Dữ liệu cũ vẫn được giữ nguyên.");
				setHydrated(true);
				return;
			}
			if (backup.status === "missing") {
				const backedUp = writeRawVerified(PROGRESS_BACKUP_KEY, raw);
				if (!backedUp.ok) {
					setStorageStatus({
						status: "unavailable",
						error: backedUp.error
					});
					setStorageError("Không thể tạo bản sao an toàn trước migration. Dữ liệu cũ vẫn được giữ nguyên.");
					setHydrated(true);
					return;
				}
			}
		}
		setStorageStatus(raw == null ? { status: "missing" } : {
			status: "ok",
			value: migrated.state
		});
		setState(migrated.state);
		stateRef.current = migrated.state;
		persistenceEnabled.current = true;
		setHydrated(true);
	}, []);
	const retryStorage = (0, import_react.useCallback)(() => {
		const loaded = loadProgressStorage();
		setStorageStatus(loaded);
		if (loaded.status === "ok") {
			stateRef.current = loaded.value;
			setState(loaded.value);
			persistenceEnabled.current = true;
			setStorageError(null);
			return true;
		}
		if (loaded.status === "missing") {
			stateRef.current = FIRST_RUN_DEFAULT;
			setState(FIRST_RUN_DEFAULT);
			persistenceEnabled.current = true;
			setStorageError(null);
			return true;
		}
		persistenceEnabled.current = false;
		setStorageError(loaded.error);
		return false;
	}, []);
	const commit = (0, import_react.useCallback)((update) => {
		if (!persistenceEnabled.current) {
			setStorageError("Bộ nhớ trình duyệt chưa sẵn sàng; thay đổi chưa được áp dụng.");
			return false;
		}
		const next = update(stateRef.current);
		const saved = saveProgressStorage(next);
		if (!saved.ok) {
			persistenceEnabled.current = false;
			setStorageStatus({
				status: "unavailable",
				error: saved.error
			});
			setStorageError(`${saved.error} Thay đổi chưa được áp dụng.`);
			return false;
		}
		stateRef.current = next;
		setState(next);
		return true;
	}, []);
	const toggleLesson = (0, import_react.useCallback)((lessonId, xp) => {
		return commit((s) => {
			const done = !!s.completedLessons[lessonId];
			const nextLessons = { ...s.completedLessons };
			const nextXp = { ...s.lessonXp };
			if (done) {
				delete nextLessons[lessonId];
				delete nextXp[lessonId];
			} else {
				nextLessons[lessonId] = todayISO();
				nextXp[lessonId] = xp;
			}
			return {
				...s,
				completedLessons: nextLessons,
				lessonXp: nextXp,
				xp: Math.max(0, s.xp + (done ? -xp : xp)),
				coins: Math.max(0, s.coins + (done ? -2 : 2))
			};
		});
	}, [commit]);
	const updateHabit = (0, import_react.useCallback)((patch) => {
		const day = todayISO();
		return commit((s) => {
			const merged = {
				...s.habitLog[day] ?? emptyEntry(s.habitDefinitions),
				...patch
			};
			return {
				...s,
				habitLog: {
					...s.habitLog,
					[day]: merged
				}
			};
		});
	}, [commit]);
	const initializeProgress = (0, import_react.useCallback)((useDemoData) => {
		return commit(() => createInitialProgressState(useDemoData));
	}, [commit]);
	const resetOnboarding = (0, import_react.useCallback)(() => {
		return commit((s) => ({
			...s,
			onboardingComplete: false
		}));
	}, [commit]);
	const saveHabitDefinition = (0, import_react.useCallback)((definition) => {
		return commit((current) => {
			const id = definition.id?.trim() || createStableId("habit");
			const nextDefinition = sanitizeHabitDefinitions([{
				...definition,
				id
			}])[0];
			const exists = current.habitDefinitions.some((habit) => habit.id === id);
			const weeklyTarget = nextDefinition.dailyTargets.filter((target) => target > 0).length;
			return {
				...current,
				goals: exists ? current.goals : {
					...current.goals,
					habitTargets: {
						...current.goals.habitTargets,
						[id]: weeklyTarget
					}
				},
				reminders: exists ? current.reminders : {
					...current.reminders,
					[id]: {
						enabled: false,
						time: "09:00"
					}
				},
				habitDefinitions: exists ? current.habitDefinitions.map((habit) => habit.id === id ? nextDefinition : habit) : [...current.habitDefinitions, nextDefinition]
			};
		});
	}, [commit]);
	const archiveHabit = (0, import_react.useCallback)((habitId, archived) => {
		return commit((current) => ({
			...current,
			habitDefinitions: current.habitDefinitions.map((habit) => habit.id === habitId ? {
				...habit,
				archived
			} : habit)
		}));
	}, [commit]);
	const deleteHabit = (0, import_react.useCallback)((habitId) => {
		return commit((current) => {
			const goals = {
				...current.goals,
				habitTargets: { ...current.goals.habitTargets }
			};
			delete goals.habitTargets[habitId];
			const reminders = { ...current.reminders };
			delete reminders[habitId];
			return {
				...current,
				goals,
				reminders,
				habitDefinitions: current.habitDefinitions.filter((habit) => habit.id !== habitId)
			};
		});
	}, [commit]);
	const setGoals = (0, import_react.useCallback)((patch) => {
		return commit((s) => ({
			...s,
			goals: {
				...s.goals,
				...patch,
				habitTargets: {
					...s.goals.habitTargets,
					...patch.habitTargets ?? {}
				}
			}
		}));
	}, [commit]);
	const setReminder = (0, import_react.useCallback)((habitId, patch) => {
		return commit((s) => ({
			...s,
			reminders: {
				...s.reminders,
				[habitId]: {
					...s.reminders[habitId] ?? {
						enabled: false,
						time: "09:00"
					},
					...patch
				}
			}
		}));
	}, [commit]);
	const setTodayHours = (0, import_react.useCallback)((hours) => {
		const clamped = clamp(hours, 0, 12);
		const today = todayISO();
		return commit((s) => ({
			...s,
			plannerSettings: {
				...s.plannerSettings,
				todayHours: clamped,
				dailyHours: {
					...s.plannerSettings.dailyHours,
					[today]: clamped
				}
			}
		}));
	}, [commit]);
	const setDayHours = (0, import_react.useCallback)((dateISO, hours) => {
		const today = todayISO();
		return commit((s) => {
			const next = { ...s.plannerSettings.dailyHours };
			if (hours == null) delete next[dateISO];
			else next[dateISO] = clamp(hours, 0, 12);
			const newTodayHours = dateISO === today ? hours != null ? clamp(hours, 0, 12) : s.plannerSettings.defaultDailyHours : s.plannerSettings.todayHours;
			return {
				...s,
				plannerSettings: {
					...s.plannerSettings,
					todayHours: newTodayHours,
					dailyHours: next
				}
			};
		});
	}, [commit]);
	const setDefaultDailyHours = (0, import_react.useCallback)((hours) => {
		return commit((s) => ({
			...s,
			plannerSettings: {
				...s.plannerSettings,
				defaultDailyHours: clamp(hours, 0, 12)
			}
		}));
	}, [commit]);
	const addStudySession = (0, import_react.useCallback)((session) => {
		if (!isValidStudySession(session)) return false;
		const persisted = loadProgressStorage();
		if (persisted.status === "ok" && persisted.value.studySessions.some((candidate) => candidate.id === session.id)) {
			stateRef.current = persisted.value;
			setState(persisted.value);
			return true;
		}
		return commit((current) => {
			return appendStudySessionToProgress(current, session);
		});
	}, [commit]);
	const today = state.habitLog[todayISO()] ?? emptyEntry(state.habitDefinitions);
	const streak = (0, import_react.useMemo)(() => computeHabitStreak(state), [state]);
	const studyStreak = (0, import_react.useMemo)(() => computeStudyStreak(state), [state]);
	const weekStats = (0, import_react.useMemo)(() => computeWeekStats(state), [state]);
	const userLevel = (0, import_react.useMemo)(() => getLevelFromXp(state.xp), [state.xp]);
	const xpProgress = (0, import_react.useMemo)(() => getXpProgressInCurrentLevel(state.xp), [state.xp]);
	const xpInLevel = xpProgress.currentLevelXp;
	const achievementPoints = (0, import_react.useMemo)(() => computeAchievementPoints(state), [state]);
	const pointsInLevel = achievementPoints % 3;
	const todayStudyMinutes = (0, import_react.useMemo)(() => studyMinutesOnDate(state.studySessions, todayISO()), [state.studySessions]);
	const spendCoins = (0, import_react.useCallback)((amount) => {
		if (stateRef.current.coins < amount) return false;
		return commit((s) => ({
			...s,
			coins: Math.max(0, s.coins - amount)
		}));
	}, [commit]);
	const addRewards = (0, import_react.useCallback)((params) => {
		let leveledUp = false;
		let newLevel = 1;
		let oldLevel = 1;
		return {
			ok: commit((s) => {
				const oldXp = s.xp;
				oldLevel = getLevelFromXp(oldXp);
				const nextXp = s.xp + Math.max(0, params.xp);
				const nextCoins = s.coins + Math.max(0, params.coins);
				newLevel = getLevelFromXp(nextXp);
				if (newLevel > oldLevel) leveledUp = true;
				return {
					...s,
					xp: nextXp,
					coins: nextCoins
				};
			}),
			leveledUp,
			newLevel,
			oldLevel
		};
	}, [commit]);
	const buyStreakFreeze = (0, import_react.useCallback)(() => {
		if (stateRef.current.coins < 50) return false;
		return commit((s) => {
			return {
				...s,
				coins: s.coins - 50,
				streakFreezeCount: s.streakFreezeCount + 1
			};
		});
	}, [commit]);
	const claimReward = (0, import_react.useCallback)((reward) => {
		if (stateRef.current.coins < reward.cost) return false;
		return commit((s) => {
			const claimedItem = {
				id: createStableId("claim"),
				title: reward.title,
				cost: reward.cost,
				dateISO: todayISO()
			};
			return {
				...s,
				coins: s.coins - reward.cost,
				claimedRewards: [claimedItem, ...s.claimedRewards]
			};
		});
	}, [commit]);
	const addCustomReward = (0, import_react.useCallback)((reward) => {
		return commit((s) => {
			const item = {
				id: createStableId("reward"),
				title: reward.title,
				cost: reward.cost,
				icon: reward.icon
			};
			return {
				...s,
				customRewards: [...s.customRewards, item]
			};
		});
	}, [commit]);
	return {
		state,
		hydrated,
		storageError,
		storageStatus,
		retryStorage,
		today,
		streak,
		studyStreak,
		currentStreak: studyStreak,
		level: userLevel,
		userLevel,
		userXp: state.xp,
		userCoins: state.coins,
		todayStudyMinutes,
		xpProgress,
		achievementPoints,
		pointsInLevel,
		xpInLevel,
		weekStats,
		addRewards,
		spendCoins,
		buyStreakFreeze,
		claimReward,
		addCustomReward,
		toggleLesson,
		updateHabit,
		setGoals,
		setReminder,
		setTodayHours,
		setDayHours,
		setDefaultDailyHours,
		addStudySession,
		initializeProgress,
		resetOnboarding,
		saveHabitDefinition,
		archiveHabit,
		deleteHabit
	};
}
var TIMER_KEY = "hocvien-focus-timer-v2";
var TIMER_LOCK_KEY = "hocvien-focus-timer-lock-v1";
var TIMER_LOCK_TTL_MS = 12e3;
var FOCUS_PRESETS = [
	{
		id: "2-0",
		label: "⚡ Khởi động · 2 phút",
		focusMins: 2,
		shortBreakMins: 0,
		longBreakMins: 0,
		description: "Bắt đầu thật nhẹ, không tạo giờ nghỉ tự động."
	},
	{
		id: "25-5",
		label: "🍅 Pomodoro · 25 / 5",
		focusMins: 25,
		shortBreakMins: 5,
		longBreakMins: 5,
		description: "25 phút học · 5 phút nghỉ."
	},
	{
		id: "50-10",
		label: "🧠 Deep Work · 50 / 10",
		focusMins: 50,
		shortBreakMins: 10,
		longBreakMins: 10,
		description: "50 phút tập trung sâu · 10 phút nghỉ."
	},
	{
		id: "90-15",
		label: "🚀 Siêu tập trung · 90 / 15",
		focusMins: 90,
		shortBreakMins: 15,
		longBreakMins: 15,
		description: "90 phút tập trung · 15 phút hồi phục."
	}
];
var MODE_DEFAULTS = {
	pomodoro: {
		title: "Tập trung",
		minutes: 50,
		emoji: "🍅"
	},
	shortBreak: {
		title: "Nghỉ ngắn",
		minutes: 10,
		emoji: "☕"
	},
	longBreak: {
		title: "Nghỉ dài",
		minutes: 15,
		emoji: "🌴"
	}
};
function createStoredTimerState(lessonId, lessonTitle, isCompleted = false) {
	const preferences = loadFocusPreferences();
	return {
		lessonId,
		lessonTitle,
		timerMode: "pomodoro",
		durationMinutes: preferences.defaultFocusMinutes,
		shortBreakMinutes: preferences.defaultFocusMinutes === 25 ? 5 : preferences.defaultFocusMinutes === 50 ? 10 : 15,
		longBreakMinutes: 15,
		longBreakTargetCycles: 4,
		lastFocusDuration: preferences.defaultFocusMinutes,
		isRunning: false,
		isMinimized: false,
		startTimestamp: null,
		accumulatedSeconds: 0,
		completedPomodoros: 0,
		ambientSound: "none",
		isCompleted,
		activeTimerSessionId: createStableId("timer"),
		savedSessionIds: [],
		status: "idle",
		activePresetId: `${preferences.defaultFocusMinutes}-${preferences.defaultFocusMinutes === 25 ? 5 : preferences.defaultFocusMinutes === 50 ? 10 : 15}`
	};
}
function createStartedFocusTimerState(current, durationMinutes, now = Date.now()) {
	const normalizedMinutes = Math.max(1, Math.round(durationMinutes));
	return {
		...current,
		timerMode: "pomodoro",
		durationMinutes: normalizedMinutes,
		lastFocusDuration: normalizedMinutes,
		isRunning: true,
		isMinimized: false,
		startTimestamp: now,
		accumulatedSeconds: 0,
		activeTimerSessionId: createStableId("timer"),
		status: "running",
		expiredAt: void 0
	};
}
function getSmartBreakMinutes(focusMinutes) {
	if (focusMinutes <= 2) return null;
	if (focusMinutes <= 25) return 5;
	if (focusMinutes <= 50) return 10;
	return 15;
}
function sendDesktopNotification(title, body) {
	if (typeof window !== "undefined" && "Notification" in window) {
		if (Notification.permission === "granted") try {
			const notif = new Notification(title, {
				body,
				tag: "pomodoro-timer",
				requireInteraction: true
			});
			notif.onclick = () => {
				window.focus();
			};
		} catch {}
	}
}
function loadStoredTimerState(storage = getBrowserStorage()) {
	return loadStorage(TIMER_KEY, (raw) => normalizeStoredTimerState(JSON.parse(raw)), storage);
}
function getStoredTimerState() {
	const loaded = loadStoredTimerState();
	return loaded.status === "ok" ? loaded.value : null;
}
function normalizeStoredTimerState(value) {
	if (!value || typeof value !== "object") return null;
	const parsed = value;
	if (typeof parsed.lessonId !== "string" || typeof parsed.lessonTitle !== "string") return null;
	const timerMode = parsed.timerMode === "shortBreak" || parsed.timerMode === "longBreak" ? parsed.timerMode : "pomodoro";
	const durationMinutes = finitePositiveNumber(parsed.durationMinutes, 50);
	const lastFocusDuration = finitePositiveNumber(parsed.lastFocusDuration, durationMinutes);
	const inferredStatus = parsed.isRunning === true ? "running" : finiteNonNegativeNumber(parsed.accumulatedSeconds, 0) > 0 ? "paused" : "idle";
	const allowedStatuses = /* @__PURE__ */ new Set([
		"idle",
		"running",
		"paused",
		"saving",
		"completed",
		"expired",
		"warmup_completed",
		"breaking",
		"session_waiting"
	]);
	const status = typeof parsed.status === "string" && allowedStatuses.has(parsed.status) ? parsed.status : inferredStatus;
	const ambientSound = parsed.ambientSound === "rain" || parsed.ambientSound === "whiteNoise" || parsed.ambientSound === "cafe" || parsed.ambientSound === "binaural" ? parsed.ambientSound : "none";
	return {
		lessonId: parsed.lessonId,
		lessonTitle: parsed.lessonTitle,
		timerMode,
		durationMinutes,
		shortBreakMinutes: finiteNonNegativeNumber(parsed.shortBreakMinutes, 10),
		longBreakMinutes: finiteNonNegativeNumber(parsed.longBreakMinutes, 15),
		longBreakTargetCycles: Math.max(1, Math.round(finitePositiveNumber(parsed.longBreakTargetCycles, 4))),
		lastFocusDuration,
		isRunning: parsed.isRunning === true,
		isMinimized: parsed.isMinimized === true,
		startTimestamp: typeof parsed.startTimestamp === "number" && Number.isFinite(parsed.startTimestamp) ? parsed.startTimestamp : null,
		accumulatedSeconds: finiteNonNegativeNumber(parsed.accumulatedSeconds, 0),
		completedPomodoros: Math.max(0, Math.round(finiteNonNegativeNumber(parsed.completedPomodoros, 0))),
		ambientSound,
		isCompleted: typeof parsed.isCompleted === "boolean" ? parsed.isCompleted : void 0,
		activeTimerSessionId: typeof parsed.activeTimerSessionId === "string" && parsed.activeTimerSessionId ? parsed.activeTimerSessionId : createStableId("timer"),
		savedSessionIds: Array.isArray(parsed.savedSessionIds) ? parsed.savedSessionIds.filter((id) => typeof id === "string").slice(-100) : [],
		status,
		activePresetId: typeof parsed.activePresetId === "string" ? parsed.activePresetId : void 0,
		pendingPresetId: typeof parsed.pendingPresetId === "string" ? parsed.pendingPresetId : void 0,
		expiredAt: typeof parsed.expiredAt === "string" ? parsed.expiredAt : void 0
	};
}
function finitePositiveNumber(value, fallback) {
	return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}
function finiteNonNegativeNumber(value, fallback) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}
function saveStoredTimerState(state, storage = getBrowserStorage()) {
	const current = loadStoredTimerState(storage);
	if (current.status === "invalid") return {
		ok: false,
		error: "Trạng thái hẹn giờ hiện có không hợp lệ và chưa được ghi đè."
	};
	if (current.status === "unavailable") return {
		ok: false,
		error: current.error
	};
	if (state == null) return writeRawVerified(TIMER_KEY, null, storage);
	return writeJsonVerified(TIMER_KEY, state, (value) => normalizeStoredTimerState(value) !== null, storage);
}
/**
* A focus session is only terminal after both its progress record and its
* timer acknowledgement have been confirmed.  The caller must not commit the
* candidate timer state (including `savedSessionIds`) when this returns false.
*/
function recordFocusSessionAndTimerStateAtomically(session, nextTimerState, rewardsOrStorage, explicitStorage) {
	const rewards = rewardsOrStorage && "xp" in rewardsOrStorage && "coins" in rewardsOrStorage ? rewardsOrStorage : void 0;
	const storage = rewardsOrStorage && "getItem" in rewardsOrStorage ? rewardsOrStorage : explicitStorage ?? getBrowserStorage();
	if (!isValidStudySession(session)) return {
		ok: false,
		error: "Focus session is invalid."
	};
	const currentProgress = loadProgressStorage(storage);
	if (currentProgress.status === "invalid" || currentProgress.status === "unavailable") return {
		ok: false,
		error: currentProgress.error
	};
	const currentTimer = loadStoredTimerState(storage);
	if (currentTimer.status === "invalid" || currentTimer.status === "unavailable") return {
		ok: false,
		error: currentTimer.error
	};
	const baseProgress = currentProgress.status === "ok" ? currentProgress.value : createInitialProgressState(false);
	const sessionAdded = !baseProgress.studySessions.some((candidate) => candidate.id === session.id);
	const rewardsApplied = sessionAdded && Boolean(rewards);
	const withSession = appendStudySessionToProgress(baseProgress, session);
	const nextProgress = rewardsApplied ? {
		...withSession,
		xp: withSession.xp + Math.max(0, rewards?.xp ?? 0),
		coins: withSession.coins + Math.max(0, rewards?.coins ?? 0)
	} : withSession;
	let progressRaw;
	let timerRaw;
	try {
		progressRaw = JSON.stringify(nextProgress);
		timerRaw = JSON.stringify(nextTimerState);
	} catch {
		return {
			ok: false,
			error: "Cannot serialize the focus-session transaction."
		};
	}
	const transaction = replaceRawValuesSafely(FOCUS_TIMER_SESSION_ROLLBACK_KEY, [{
		key: PROGRESS_STORAGE_KEY,
		raw: progressRaw
	}, {
		key: TIMER_KEY,
		raw: timerRaw
	}], storage);
	if (!transaction.ok) return transaction;
	return {
		...transaction,
		sessionAdded,
		rewardsApplied,
		previousXp: baseProgress.xp,
		nextXp: nextProgress.xp
	};
}
function getTimerTabId() {
	if (typeof window === "undefined" || typeof sessionStorage === "undefined") return "server";
	const key = "hocvien-focus-timer-tab-id";
	const existing = sessionStorage.getItem(key);
	if (existing) return existing;
	const id = createStableId("tab");
	sessionStorage.setItem(key, id);
	return id;
}
function normalizeTimerLock(value) {
	if (!value || typeof value !== "object") return null;
	const parsed = value;
	if (typeof parsed.ownerId !== "string" || typeof parsed.sessionId !== "string" || typeof parsed.expiresAt !== "number" || !Number.isFinite(parsed.expiresAt)) return null;
	return parsed;
}
function loadTimerLock() {
	return loadStorage(TIMER_LOCK_KEY, (raw) => normalizeTimerLock(JSON.parse(raw)));
}
function readTimerLock() {
	const loaded = loadTimerLock();
	return loaded.status === "ok" ? loaded.value : null;
}
function acquireTimerLock(sessionId, ownerId = getTimerTabId()) {
	try {
		const now = Date.now();
		const loaded = loadTimerLock();
		if (loaded.status === "invalid" || loaded.status === "unavailable") return false;
		const current = loaded.status === "ok" ? loaded.value : null;
		if (current && current.expiresAt > now && current.ownerId !== ownerId) return false;
		const next = {
			ownerId,
			sessionId,
			expiresAt: now + TIMER_LOCK_TTL_MS
		};
		if (!writeJsonVerified("hocvien-focus-timer-lock-v1", next, (value) => normalizeTimerLock(value) !== null).ok) return false;
		const confirmed = readTimerLock();
		return confirmed?.ownerId === ownerId && confirmed.sessionId === sessionId;
	} catch {
		return false;
	}
}
function refreshTimerLock(sessionId, ownerId = getTimerTabId()) {
	try {
		const loaded = loadTimerLock();
		if (loaded.status !== "ok") return false;
		const current = loaded.value;
		if (!current || current.ownerId !== ownerId || current.sessionId !== sessionId) return false;
		const next = {
			...current,
			expiresAt: Date.now() + TIMER_LOCK_TTL_MS
		};
		if (!writeJsonVerified("hocvien-focus-timer-lock-v1", next, (value) => normalizeTimerLock(value) !== null).ok) return false;
		const confirmed = readTimerLock();
		return confirmed?.ownerId === ownerId && confirmed.sessionId === sessionId;
	} catch {
		return false;
	}
}
function releaseTimerLock(ownerId = getTimerTabId()) {
	try {
		const loaded = loadTimerLock();
		if (loaded.status === "invalid" || loaded.status === "unavailable") return {
			ok: false,
			error: loaded.error
		};
		if ((loaded.status === "ok" ? loaded.value : null)?.ownerId === ownerId) return writeRawVerified(TIMER_LOCK_KEY, null);
		return { ok: true };
	} catch {
		return {
			ok: false,
			error: "Không thể xác nhận việc giải phóng khoá hẹn giờ."
		};
	}
}
function calculateElapsedSeconds(st) {
	let secs = st.accumulatedSeconds || 0;
	if (st.isRunning && st.startTimestamp) {
		const diff = Math.floor((Date.now() - st.startTimestamp) / 1e3);
		secs += Math.max(0, diff);
	}
	return Math.min(st.durationMinutes * 60, Math.max(0, secs));
}
function timerExpectedEndTimestamp(st) {
	if (!st.isRunning || st.startTimestamp == null) return null;
	const remainingSeconds = Math.max(0, st.durationMinutes * 60 - st.accumulatedSeconds);
	return st.startTimestamp + remainingSeconds * 1e3;
}
function shouldRecoverExpiredTimer(st, openedAt = Date.now()) {
	const expectedEnd = timerExpectedEndTimestamp(st);
	return st.status !== "expired" && expectedEnd != null && expectedEnd < openedAt - 1e3 && !st.savedSessionIds.includes(st.activeTimerSessionId);
}
var audioCtx = null;
function getAudioContext() {
	if (typeof window === "undefined") return null;
	if (!audioCtx) {
		const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
		if (AudioCtxClass) audioCtx = new AudioCtxClass();
	}
	if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
	return audioCtx;
}
/**
* Plays a pleasant 4-note ascending major chord when a Study session completes
*/
function playStudyCompletionChime(volume = .5) {
	const ctx = getAudioContext();
	if (!ctx) return;
	const now = ctx.currentTime;
	const vol = Math.min(1, Math.max(.1, volume));
	[
		{
			freq: 523.25,
			time: 0,
			duration: 1.4,
			gain: .25 * vol
		},
		{
			freq: 659.25,
			time: .16,
			duration: 1.4,
			gain: .28 * vol
		},
		{
			freq: 783.99,
			time: .32,
			duration: 1.6,
			gain: .3 * vol
		},
		{
			freq: 1046.5,
			time: .48,
			duration: 2,
			gain: .35 * vol
		}
	].forEach((n) => {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sine";
		osc.frequency.setValueAtTime(n.freq, now + n.time);
		gain.gain.setValueAtTime(.001, now + n.time);
		gain.gain.linearRampToValueAtTime(n.gain, now + n.time + .03);
		gain.gain.exponentialRampToValueAtTime(.001, now + n.time + n.duration);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start(now + n.time);
		osc.stop(now + n.time + n.duration);
	});
}
/**
* Plays a gentle 3-note 'wakeup/refresh' chime when a Break session ends
*/
function playBreakCompletionChime(volume = .5) {
	const ctx = getAudioContext();
	if (!ctx) return;
	const now = ctx.currentTime;
	const vol = Math.min(1, Math.max(.1, volume));
	[
		{
			freq: 783.99,
			time: 0,
			duration: 1.2,
			gain: .22 * vol
		},
		{
			freq: 1046.5,
			time: .15,
			duration: 1.3,
			gain: .28 * vol
		},
		{
			freq: 1318.51,
			time: .3,
			duration: 1.8,
			gain: .32 * vol
		}
	].forEach((n) => {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sine";
		osc.frequency.setValueAtTime(n.freq, now + n.time);
		gain.gain.setValueAtTime(.001, now + n.time);
		gain.gain.linearRampToValueAtTime(n.gain, now + n.time + .02);
		gain.gain.exponentialRampToValueAtTime(.001, now + n.time + n.duration);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start(now + n.time);
		osc.stop(now + n.time + n.duration);
	});
}
/**
* Plays a mechanical clock tick-tock sound ("tíc" / "tắc")
*/
function playClockTick(volume = .5, isTock = false) {
	const ctx = getAudioContext();
	if (!ctx) return;
	const now = ctx.currentTime;
	const vol = Math.min(1, Math.max(.05, volume));
	const freq = isTock ? 680 : 1080;
	const duration = isTock ? .038 : .028;
	const gainVal = (isTock ? .32 : .4) * vol;
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.type = "triangle";
	osc.frequency.setValueAtTime(freq, now);
	osc.frequency.exponentialRampToValueAtTime(freq * .45, now + duration);
	gain.gain.setValueAtTime(gainVal, now);
	gain.gain.exponentialRampToValueAtTime(1e-4, now + duration);
	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.start(now);
	osc.stop(now + duration);
}
/**
* Helper to play completion chime based on timer type
*/
function playCompletionChime(type = "study", volume = .5) {
	if (type === "break") playBreakCompletionChime(volume);
	else playStudyCompletionChime(volume);
}
var activeAmbientNodes = null;
function stopAmbientSound() {
	if (activeAmbientNodes) {
		try {
			activeAmbientNodes.stop();
		} catch {}
		activeAmbientNodes = null;
	}
}
function playAmbientSound(type, volume = .5) {
	stopAmbientSound();
	if (type === "none") return;
	const ctx = getAudioContext();
	if (!ctx) return;
	const masterGain = ctx.createGain();
	masterGain.gain.setValueAtTime(Math.min(1, Math.max(0, volume * .25)), ctx.currentTime);
	masterGain.connect(ctx.destination);
	if (type === "binaural") {
		const merger = ctx.createChannelMerger(2);
		const oscL = ctx.createOscillator();
		oscL.frequency.value = 200;
		oscL.connect(merger, 0, 0);
		const oscR = ctx.createOscillator();
		oscR.frequency.value = 210;
		oscR.connect(merger, 0, 1);
		merger.connect(masterGain);
		oscL.start();
		oscR.start();
		activeAmbientNodes = { stop: () => {
			oscL.stop();
			oscR.stop();
			oscL.disconnect();
			oscR.disconnect();
		} };
		return;
	}
	const bufferSize = ctx.sampleRate * 5;
	const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
	const output = buffer.getChannelData(0);
	let lastOut = 0;
	for (let i = 0; i < bufferSize; i++) {
		const white = Math.random() * 2 - 1;
		output[i] = (lastOut + .02 * white) / 1.02;
		lastOut = output[i];
	}
	const noiseSource = ctx.createBufferSource();
	noiseSource.buffer = buffer;
	noiseSource.loop = true;
	const filter = ctx.createBiquadFilter();
	if (type === "rain") {
		filter.type = "bandpass";
		filter.frequency.value = 800;
		filter.Q.value = 1.2;
	} else if (type === "cafe") {
		filter.type = "lowpass";
		filter.frequency.value = 400;
	} else {
		filter.type = "lowpass";
		filter.frequency.value = 650;
	}
	noiseSource.connect(filter);
	filter.connect(masterGain);
	noiseSource.start();
	activeAmbientNodes = { stop: () => {
		try {
			noiseSource.stop();
			noiseSource.disconnect();
		} catch {}
	} };
}
var Collapsible = Root;
var CollapsibleTrigger = CollapsibleTrigger$1;
var CollapsibleContent = CollapsibleContent$1;
//#endregion
export { useProgress as $, getXpProgressInCurrentLevel as A, playClockTick as B, createStudySession as C, getSmartBreakMinutes as D, getLevelTitle as E, migrateProgressState as F, releaseTimerLock as G, playStudyCompletionChime as H, normalizeFocusPreferences as I, sendDesktopNotification as J, saveFocusPreferences as K, normalizeStoredTimerState as L, loadProgressStorage as M, loadStoredTimerState as N, getStoredTimerState as O, loadTimerLock as P, timerExpectedEndTimestamp as Q, playAmbientSound as R, createStoredTimerState as S, getLevelFromXp as T, recordFocusSessionAndTimerStateAtomically as U, playCompletionChime as V, refreshTimerLock as W, stopAmbientSound as X, shouldRecoverExpiredTimer as Y, studySecondsOnDate as Z, calculateSessionRewards as _, DuotoneIcon as a, createStableId as b, FOCUS_PRESETS as c, PROGRESS_STORAGE_KEY as d, TIMER_KEY as f, calculateElapsedSeconds as g, acquireTimerLock as h, DEFAULT_FOCUS_PREFERENCES as i, loadFocusPreferences as j, getTimerTabId as k, MODE_DEFAULTS as l, UNDATED_COMPLETION as m, CollapsibleContent as n, FOCUS_PREFERENCES_EVENT as o, TIMER_LOCK_KEY as p, saveStoredTimerState as q, CollapsibleTrigger as r, FOCUS_PREFERENCES_KEY as s, Collapsible as t, PROGRESS_BACKUP_KEY as u, computeStudyStreak as v, getLessonCompletedMinutes as w, createStartedFocusTimerState as x, createInitialProgressState as y, playBreakCompletionChime as z };
