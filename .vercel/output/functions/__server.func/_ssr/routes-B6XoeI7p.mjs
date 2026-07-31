import { r as __toESM } from "../_runtime.mjs";
import { a as getMondayISO, d as todayISO, f as weekdayFullVi, i as displayDate, n as dayIndex, o as getSundayISO, p as weekdayVi, r as daysBetweenISO, s as isDateISO, t as addDaysISO } from "./date-utils-CFRHucsE.mjs";
import { l as require_react_dom, u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $ as Ellipsis, A as Pause, At as Archive, B as House, C as Rocket, Ct as Bell, D as Play, Dt as ArrowUp, E as Plus, Et as Award, F as Minimize, G as Footprints, I as Minimize2, L as Maximize, M as Moon, O as Pencil, Ot as ArrowLeft, P as Minus, R as Maximize2, S as RotateCcw, T as RefreshCcw, Tt as BellOff, U as GripVertical, _t as CalendarRange, a as Undo2, bt as Book, c as Trash2, ct as Circle, d as Target, dt as ChevronRight, et as Droplet, ft as ChevronDown, gt as Calendar, ht as ChartColumn, i as Volume2, k as PenLine, kt as ArrowDown, l as Timer, lt as CircleQuestionMark, m as Sparkles, mt as ChartPie, n as X, o as Trophy, ot as Clock, p as SquareCheckBig, pt as Check, q as FolderArchive, s as TriangleAlert, st as Clock3, t as Zap, tt as Download, ut as CircleCheck, vt as CalendarDays, w as RefreshCw, x as Search, xt as BookOpen, y as Settings2, yt as CalendarClock, z as LibraryBig } from "../_libs/lucide-react.mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { a as Label2, c as Root2, d as SubTrigger2, f as Trigger, i as ItemIndicator2, l as Separator2, n as Content2, o as Portal2, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { A as findLessonPosition, C as TabsTrigger, D as cn, E as buildShiftedSchedule, F as pickTodayQueue, M as getPushPreferences, N as getSubjectPriority, O as estimateLessonMinutes, R as sortLessonsBySubjectPriority, S as TabsList, T as buildFlexiblePlan, b as Tabs, c as DialogDescription, d as DialogTrigger, g as Label, h as Input, j as forecast, k as findLessonById, l as DialogHeader, n as Button, o as Dialog, s as DialogContent, u as DialogTitle, v as SUBJECTS, w as allRemainingLessonIds, x as TabsContent, y as Slider, z as sortSubjects } from "./planner-2Pf6y40b.mjs";
import { a as syncScheduledWebPush, n as getWebPushCapability, t as buildScheduledWebPushJobs } from "./web-push-schedule-CcQxeb5P.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as removeLessonFromSubjects, B as restoreArchivedSubject, C as moveLessonToSubject, E as normalizeSubjects, F as reorderLesson, G as updateLessonsDetails, H as restoreSnapshotFromKey, I as reorderSubject, K as updateSubjectDetails, L as reorderTopic, M as removeSubjectFromSubjects, N as removeTopicAndMoveLessonsToUncategorized, P as renameTopicInSubjects, R as replaceRawValuesSafely, S as loadStorage, T as moveLessonsToTopic, U as saveStoredCustomSubjects, V as restoreCatalogBackup, W as updateLessonDetails, _ as duplicateLessonInSubjects, a as RESET_ROLLBACK_KEY, b as getBrowserStorage, d as addTopicToSubject, f as archiveLesson, g as downloadFile, j as removeLessonsFromSubjects, k as readRawSnapshot, l as addCustomLessonToSubjects, m as archiveSubject, n as CUSTOM_SUBJECTS_BACKUP_KEY, p as archiveLessons, r as CUSTOM_SUBJECTS_KEY, t as ARCHIVED_CATALOG_KEY, u as addSubjectToSubjects, w as moveLessonsToSubject, x as getStoredCustomSubjects, y as getArchivedCatalog, z as restoreArchivedLesson } from "./custom-subjects-uE4AACuO.mjs";
import { $ as useProgress, B as playClockTick, C as createStudySession, D as getSmartBreakMinutes, E as getLevelTitle, F as migrateProgressState, G as releaseTimerLock, J as sendDesktopNotification, M as loadProgressStorage, N as loadStoredTimerState, O as getStoredTimerState, P as loadTimerLock, Q as timerExpectedEndTimestamp, R as playAmbientSound, S as createStoredTimerState, T as getLevelFromXp, U as recordFocusSessionAndTimerStateAtomically, V as playCompletionChime, W as refreshTimerLock, X as stopAmbientSound, Y as shouldRecoverExpiredTimer, Z as studySecondsOnDate, _ as calculateSessionRewards, a as DuotoneIcon, b as createStableId, c as FOCUS_PRESETS, d as PROGRESS_STORAGE_KEY, f as TIMER_KEY, g as calculateElapsedSeconds, h as acquireTimerLock, j as loadFocusPreferences, k as getTimerTabId, l as MODE_DEFAULTS, m as UNDATED_COMPLETION, n as CollapsibleContent, o as FOCUS_PREFERENCES_EVENT, p as TIMER_LOCK_KEY, q as saveStoredTimerState, r as CollapsibleTrigger, t as Collapsible, u as PROGRESS_BACKUP_KEY, v as computeStudyStreak, w as getLessonCompletedMinutes, x as createStartedFocusTimerState, y as createInitialProgressState } from "./collapsible-D3R5XvsL.mjs";
import { i as loadLazyModule, n as PLAN_VIEWS, r as Route, t as DASHBOARD_VIEWS } from "./routes-CjcHUfGf.mjs";
import { i as Trigger$1, n as Portal, r as Root2$1, t as Content2$1 } from "../_libs/radix-ui__react-popover.mjs";
import { n as Root, t as Indicator } from "../_libs/radix-ui__react-progress.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B6XoeI7p.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
function isValidOptionalISODate(value) {
	if (!value) return true;
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) return false;
	const [, yearText, monthText, dayText] = match;
	const year = Number(yearText);
	const month = Number(monthText);
	const day = Number(dayText);
	const date = new Date(Date.UTC(year, month - 1, day));
	return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
function isFiniteNonNegative(value) {
	return Number.isFinite(value) && value >= 0;
}
function validateLessonForm(values) {
	const errors = {};
	if (!values.subjectName.trim()) errors.subjectName = "Vui lòng nhập tên môn học.";
	if (!values.title.trim()) errors.title = "Vui lòng nhập tên bài học.";
	if (!isFiniteNonNegative(values.minutes) || values.minutes <= 0) errors.minutes = "Thời lượng phải là một số dương hợp lệ.";
	if (!isFiniteNonNegative(values.xp)) errors.xp = "XP phải là một số không âm hợp lệ.";
	if (!isValidOptionalISODate(values.scheduledDate)) errors.scheduledDate = "Ngày dự kiến không tồn tại.";
	return errors;
}
var _jsxFileName$23 = "/app/applet/src/components/AddLessonModal.tsx";
function AddLessonModal({ currentSubjects, onSubjectsUpdated, trigger, defaultSubjectName = "Tiếng Anh" }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [subjectName, setSubjectName] = (0, import_react.useState)(defaultSubjectName);
	const [topic, setTopic] = (0, import_react.useState)("");
	const [title, setTitle] = (0, import_react.useState)("");
	const [minutes, setMinutes] = (0, import_react.useState)(45);
	const [date, setDate] = (0, import_react.useState)(todayISO());
	const xp = 30;
	const [errors, setErrors] = (0, import_react.useState)({});
	const handleSubmit = (e) => {
		e.preventDefault();
		const nextErrors = validateLessonForm({
			subjectName,
			title,
			minutes,
			xp,
			scheduledDate: date
		});
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length > 0) {
			toast.error("Vui lòng kiểm tra các trường được đánh dấu.");
			return;
		}
		if (!title.trim()) {
			toast.error("Vui lòng nhập tên bài học!");
			return;
		}
		if (!subjectName.trim()) {
			toast.error("Vui lòng chọn hoặc nhập tên môn học!");
			return;
		}
		onSubjectsUpdated(addCustomLessonToSubjects(currentSubjects, {
			subject: subjectName.trim(),
			topic: topic.trim() || void 0,
			title: title.trim(),
			estimatedMinutes: minutes,
			scheduledDate: date,
			xp
		}));
		toast.success(`Đã thêm bài học "${title.trim()}" cho môn ${subjectName.trim()}! 🎉`);
		setTitle("");
		setTopic("");
		setErrors({});
		setOpen(false);
	};
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTrigger, {
			asChild: true,
			children: trigger || /* @__PURE__ */ (void 0)(Button, {
				size: "sm",
				className: "rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-soft",
				children: [/* @__PURE__ */ (void 0)(Plus, { className: "h-4 w-4" }, void 0, false, {
					fileName: _jsxFileName$23,
					lineNumber: 92,
					columnNumber: 13
				}, this), /* @__PURE__ */ (void 0)("span", { children: "Thêm bài học" }, void 0, false, {
					fileName: _jsxFileName$23,
					lineNumber: 93,
					columnNumber: 13
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$23,
				lineNumber: 88,
				columnNumber: 11
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName$23,
			lineNumber: 86,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent, {
			className: "max-w-md rounded-3xl p-6",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle, {
				className: "text-xl font-serif text-slate-800 flex items-center gap-2",
				children: "📖 Thêm bài học mới"
			}, void 0, false, {
				fileName: _jsxFileName$23,
				lineNumber: 99,
				columnNumber: 11
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogDescription, {
				className: "text-sm text-slate-500",
				children: "Thêm bài học cho môn Tiếng Anh, Toán, Lý, Hóa hoặc môn học bất kỳ vào lộ trình cá nhân."
			}, void 0, false, {
				fileName: _jsxFileName$23,
				lineNumber: 102,
				columnNumber: 11
			}, this)] }, void 0, true, {
				fileName: _jsxFileName$23,
				lineNumber: 98,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4 mt-2",
				noValidate: true,
				"aria-describedby": "add-lesson-help add-lesson-errors",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						id: "add-lesson-help",
						className: "text-xs text-muted-foreground",
						children: "Các trường có dấu sao là bắt buộc. XP và Coin được tính theo quy tắc gamification chung."
					}, void 0, false, {
						fileName: _jsxFileName$23,
						lineNumber: 113,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						id: "add-lesson-errors",
						className: "sr-only",
						role: "alert",
						children: Object.values(errors).join(" ")
					}, void 0, false, {
						fileName: _jsxFileName$23,
						lineNumber: 116,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
							className: "text-xs font-semibold text-slate-700 flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BookOpen, { className: "h-3.5 w-3.5 text-emerald-600" }, void 0, false, {
								fileName: _jsxFileName$23,
								lineNumber: 121,
								columnNumber: 15
							}, this), "Môn học:"]
						}, void 0, true, {
							fileName: _jsxFileName$23,
							lineNumber: 120,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex flex-col gap-2 sm:flex-row",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
								type: "text",
								"aria-label": "Tên môn học",
								"aria-invalid": !!errors.subjectName,
								"aria-describedby": "add-lesson-help add-lesson-errors",
								value: subjectName,
								onChange: (e) => setSubjectName(e.target.value),
								placeholder: "VD: Tiếng Anh, Toán, Vật lý...",
								className: "rounded-xl border-slate-200 text-xs flex-1",
								required: true
							}, void 0, false, {
								fileName: _jsxFileName$23,
								lineNumber: 125,
								columnNumber: 15
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex flex-wrap gap-1",
								children: [
									"Tiếng Anh",
									"Toán",
									"Vật lý",
									"Hóa học"
								].map((s) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
									type: "button",
									onClick: () => setSubjectName(s),
									className: `px-2 py-1 text-[11px] rounded-lg transition-all border ${subjectName === s ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}`,
									children: s === "Tiếng Anh" ? "🇬🇧 Eng" : s
								}, s, false, {
									fileName: _jsxFileName$23,
									lineNumber: 138,
									columnNumber: 19
								}, this))
							}, void 0, false, {
								fileName: _jsxFileName$23,
								lineNumber: 136,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$23,
							lineNumber: 124,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$23,
						lineNumber: 119,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
							className: "text-xs font-semibold text-slate-700 flex items-center gap-1",
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "📌 Chủ đề / Chương (không bắt buộc):" }, void 0, false, {
								fileName: _jsxFileName$23,
								lineNumber: 157,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$23,
							lineNumber: 156,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
							type: "text",
							"aria-label": "Chủ đề hoặc chương",
							"aria-describedby": "add-lesson-help",
							value: topic,
							onChange: (e) => setTopic(e.target.value),
							placeholder: "VD: Chương 1: Mệnh đề & Tập hợp",
							className: "rounded-xl border-slate-200 text-xs"
						}, void 0, false, {
							fileName: _jsxFileName$23,
							lineNumber: 159,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$23,
						lineNumber: 155,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
							className: "text-xs font-semibold text-slate-700",
							children: "Tên bài học:"
						}, void 0, false, {
							fileName: _jsxFileName$23,
							lineNumber: 171,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
							type: "text",
							"aria-label": "Tên bài học",
							"aria-invalid": !!errors.title,
							"aria-describedby": "add-lesson-help add-lesson-errors",
							value: title,
							onChange: (e) => setTitle(e.target.value),
							placeholder: "VD: Unit 1: Reading - Life Stories",
							className: "rounded-xl border-slate-200 text-xs",
							required: true
						}, void 0, false, {
							fileName: _jsxFileName$23,
							lineNumber: 172,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$23,
						lineNumber: 170,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
								className: "text-xs font-semibold text-slate-700 flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Clock, { className: "h-3.5 w-3.5 text-sky-600" }, void 0, false, {
									fileName: _jsxFileName$23,
									lineNumber: 187,
									columnNumber: 15
								}, this), "Thời lượng mục tiêu:"]
							}, void 0, true, {
								fileName: _jsxFileName$23,
								lineNumber: 186,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "grid grid-cols-4 gap-2",
								children: [
									30,
									60,
									90,
									120
								].map((preset) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
									type: "button",
									size: "sm",
									variant: minutes === preset ? "default" : "outline",
									className: "rounded-xl",
									onClick: () => setMinutes(preset),
									children: [preset, "p"]
								}, preset, true, {
									fileName: _jsxFileName$23,
									lineNumber: 192,
									columnNumber: 17
								}, this))
							}, void 0, false, {
								fileName: _jsxFileName$23,
								lineNumber: 190,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
								type: "number",
								"aria-label": "Thời lượng mục tiêu theo phút",
								"aria-invalid": !!errors.minutes,
								"aria-describedby": "add-lesson-help add-lesson-errors",
								min: 1,
								max: 1440,
								value: minutes,
								onChange: (e) => setMinutes(Number(e.target.value)),
								className: "rounded-xl border-slate-200 text-xs",
								required: true
							}, void 0, false, {
								fileName: _jsxFileName$23,
								lineNumber: 204,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "text-[11px] text-slate-500",
								children: "Đây là tổng thời lượng mục tiêu của bài, không phải độ dài một phiên Pomodoro."
							}, void 0, false, {
								fileName: _jsxFileName$23,
								lineNumber: 216,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$23,
						lineNumber: 185,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
								className: "text-xs font-semibold text-slate-700 flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Calendar, { className: "h-3.5 w-3.5 text-purple-600" }, void 0, false, {
									fileName: _jsxFileName$23,
									lineNumber: 221,
									columnNumber: 15
								}, this), "Ngày học dự kiến (có thể để trống):"]
							}, void 0, true, {
								fileName: _jsxFileName$23,
								lineNumber: 220,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
								type: "date",
								"aria-label": "Ngày học dự kiến",
								"aria-invalid": !!errors.scheduledDate,
								"aria-describedby": "add-lesson-help add-lesson-errors",
								value: date,
								onChange: (e) => setDate(e.target.value),
								className: "rounded-xl border-slate-200 text-xs"
							}, void 0, false, {
								fileName: _jsxFileName$23,
								lineNumber: 224,
								columnNumber: 13
							}, this),
							date && /* @__PURE__ */ (void 0)("button", {
								type: "button",
								onClick: () => setDate(""),
								className: "text-[11px] text-muted-foreground underline",
								children: "Bỏ ngày cố định"
							}, void 0, false, {
								fileName: _jsxFileName$23,
								lineNumber: 234,
								columnNumber: 15
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$23,
						lineNumber: 219,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "pt-2 flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => setOpen(false),
							className: "rounded-xl text-xs",
							children: "Hủy"
						}, void 0, false, {
							fileName: _jsxFileName$23,
							lineNumber: 245,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
							type: "submit",
							className: "rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5",
							children: "+ Thêm ngay"
						}, void 0, false, {
							fileName: _jsxFileName$23,
							lineNumber: 253,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$23,
						lineNumber: 244,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName$23,
				lineNumber: 107,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$23,
			lineNumber: 97,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$23,
		lineNumber: 85,
		columnNumber: 5
	}, this);
}
var _jsxFileName$22 = "/app/applet/src/components/LearningRoadmap.tsx";
var SUBJECT_TONE = {
	all: "coral",
	toan: "blue",
	ly: "green",
	hoa: "amber"
};
var SUBJECT_EMOJI = {
	toan: "📐",
	ly: "⚛️",
	hoa: "🧪"
};
function resolveSubjectEmoji(subjKey, sourceSubject) {
	if (SUBJECT_EMOJI[subjKey]) return SUBJECT_EMOJI[subjKey];
	const src = (sourceSubject || "").toLowerCase();
	if (src.includes("toán") || src.includes("math")) return "📐";
	if (src.includes("lý") || src.includes("ly") || src.includes("phys")) return "⚛️";
	if (src.includes("hóa") || src.includes("hoa") || src.includes("chem")) return "🧪";
	return "📚";
}
var SUBJECT_LABEL = {
	toan: "Toán",
	ly: "Vật lý",
	hoa: "Hóa học"
};
function LearningRoadmap({ completed, onToggleLesson, shiftedDates = {}, subjects = SUBJECTS, onSubjectsUpdated }) {
	const [subjectId, setSubjectId] = (0, import_react.useState)("all");
	const sortedSubjects = (0, import_react.useMemo)(() => sortSubjects(subjects), [subjects]);
	const tabs = (0, import_react.useMemo)(() => {
		return [{
			id: "all",
			name: "Tất cả môn",
			emoji: "🌟"
		}, ...sortedSubjects.map((s) => ({
			id: s.id,
			name: s.name,
			emoji: s.emoji
		}))];
	}, [sortedSubjects]);
	const allLessonsFromSubjects = (0, import_react.useMemo)(() => {
		return sortedSubjects.flatMap((s) => s.milestones.flatMap((m) => m.lessons));
	}, [sortedSubjects]);
	const activeLessons = (0, import_react.useMemo)(() => {
		if (subjectId === "all") return allLessonsFromSubjects;
		const s = sortedSubjects.find((item) => item.id === subjectId);
		return s ? s.milestones.flatMap((m) => m.lessons) : allLessonsFromSubjects;
	}, [
		subjectId,
		sortedSubjects,
		allLessonsFromSubjects
	]);
	const dynamicMilestones = (0, import_react.useMemo)(() => {
		const lessonsWithDate = activeLessons.map((l) => {
			const effectiveDate = completed[l.id] ? completed[l.id] : shiftedDates[l.id] ?? l.scheduledDate;
			return {
				...l,
				effectiveDate
			};
		});
		const groups = /* @__PURE__ */ new Map();
		for (const l of lessonsWithDate) {
			const mon = l.effectiveDate ? getMondayISO(l.effectiveDate) : "unscheduled";
			if (!groups.has(mon)) groups.set(mon, []);
			groups.get(mon).push(l);
		}
		return [...groups.keys()].sort((a, b) => {
			if (a === "unscheduled") return 1;
			if (b === "unscheduled") return -1;
			return a.localeCompare(b);
		}).map((mon, index) => {
			const sun = mon === "unscheduled" ? "" : getSundayISO(mon);
			const list = groups.get(mon);
			list.sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate) || getSubjectPriority(a.sourceSubject) - getSubjectPriority(b.sourceSubject) || allLessonsFromSubjects.findIndex((x) => x.id === a.id) - allLessonsFromSubjects.findIndex((x) => x.id === b.id));
			const doneCount = list.filter((l) => completed[l.id]).length;
			const totalCount = list.length;
			const isComplete = totalCount > 0 && doneCount === totalCount;
			if (mon === "unscheduled") return {
				id: "week-unscheduled",
				title: "Kho bài chưa xếp lịch",
				subtitle: `${totalCount} bài · chưa tham gia kế hoạch tự động`,
				mondayISO: "",
				sundayISO: "",
				lessons: list,
				doneCount,
				totalCount,
				isComplete
			};
			const startDate = list[0]?.effectiveDate ?? mon;
			const endDate = sun;
			return {
				id: `week-${mon}`,
				title: `Tuần ${index + 1}`,
				subtitle: `${displayDate(startDate)} – ${displayDate(endDate)} · ${totalCount} bài`,
				mondayISO: mon,
				sundayISO: sun,
				lessons: list,
				doneCount,
				totalCount,
				isComplete
			};
		});
	}, [
		activeLessons,
		allLessonsFromSubjects,
		completed,
		shiftedDates
	]);
	const activeMilestoneId = (0, import_react.useMemo)(() => {
		return dynamicMilestones.find((m) => !m.isComplete)?.id ?? dynamicMilestones.at(-1)?.id ?? "";
	}, [dynamicMilestones]);
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const currentOpenId = openId && dynamicMilestones.some((m) => m.id === openId) ? openId : activeMilestoneId;
	const currentMilestone = dynamicMilestones.find((m) => m.id === currentOpenId) ?? dynamicMilestones[0];
	const tone = SUBJECT_TONE[subjectId] ?? "coral";
	const totalCount = activeLessons.length;
	const completedCount = activeLessons.filter((l) => completed[l.id]).length;
	const remainingCount = totalCount - completedCount;
	(0, import_react.useMemo)(() => {
		const datedMilestones = dynamicMilestones.filter((milestone) => milestone.mondayISO);
		if (!datedMilestones.length) return {
			start: "",
			end: "",
			weeks: 0
		};
		return {
			start: datedMilestones[0].lessons[0]?.effectiveDate ?? datedMilestones[0].mondayISO,
			end: datedMilestones.at(-1).sundayISO,
			weeks: datedMilestones.length
		};
	}, [dynamicMilestones]);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
		className: "rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4 shadow-xs",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex items-center justify-between gap-3 flex-wrap",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
					className: "font-serif text-xl sm:text-2xl font-bold text-slate-900",
					children: "Lộ trình"
				}, void 0, false, {
					fileName: _jsxFileName$22,
					lineNumber: 189,
					columnNumber: 11
				}, this) }, void 0, false, {
					fileName: _jsxFileName$22,
					lineNumber: 188,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [onSubjectsUpdated && /* @__PURE__ */ (void 0)(AddLessonModal, {
						currentSubjects: subjects,
						onSubjectsUpdated
					}, void 0, false, {
						fileName: _jsxFileName$22,
						lineNumber: 194,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex gap-1 rounded-xl bg-slate-100 p-1 overflow-x-auto max-w-full",
						children: tabs.map((tab) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							onClick: () => {
								setSubjectId(tab.id);
								setOpenId(null);
							},
							className: cn("whitespace-nowrap rounded-lg px-3 py-1 text-xs font-semibold transition-all", tab.id === subjectId ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"),
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "mr-1",
								children: tab.emoji
							}, void 0, false, {
								fileName: _jsxFileName$22,
								lineNumber: 211,
								columnNumber: 17
							}, this), tab.name]
						}, tab.id, true, {
							fileName: _jsxFileName$22,
							lineNumber: 198,
							columnNumber: 15
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName$22,
						lineNumber: 196,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$22,
					lineNumber: 192,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$22,
				lineNumber: 187,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "grid grid-cols-3 gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "text-base sm:text-lg font-bold text-slate-900",
						children: totalCount
					}, void 0, false, {
						fileName: _jsxFileName$22,
						lineNumber: 221,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "text-[11px] font-medium text-slate-500",
						children: ["Tổng bài ", subjectId === "all" ? `(${sortedSubjects.length} môn)` : ""]
					}, void 0, true, {
						fileName: _jsxFileName$22,
						lineNumber: 222,
						columnNumber: 11
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$22,
						lineNumber: 220,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "text-base sm:text-lg font-bold text-emerald-700",
						children: completedCount
					}, void 0, false, {
						fileName: _jsxFileName$22,
						lineNumber: 227,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "text-[11px] font-medium text-slate-500",
						children: "Đã học"
					}, void 0, false, {
						fileName: _jsxFileName$22,
						lineNumber: 228,
						columnNumber: 11
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$22,
						lineNumber: 226,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "text-base sm:text-lg font-bold text-amber-700",
						children: remainingCount
					}, void 0, false, {
						fileName: _jsxFileName$22,
						lineNumber: 231,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "text-[11px] font-medium text-slate-500",
						children: "Còn lại"
					}, void 0, false, {
						fileName: _jsxFileName$22,
						lineNumber: 232,
						columnNumber: 11
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$22,
						lineNumber: 230,
						columnNumber: 9
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName$22,
				lineNumber: 219,
				columnNumber: 7
			}, this),
			dynamicMilestones.length > 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RoadmapPath, {
				milestones: dynamicMilestones,
				activeId: activeMilestoneId,
				openId: currentOpenId,
				onOpen: setOpenId,
				tone
			}, void 0, false, {
				fileName: _jsxFileName$22,
				lineNumber: 238,
				columnNumber: 11
			}, this), currentMilestone && /* @__PURE__ */ (void 0)(MilestonePanel, {
				milestone: currentMilestone,
				completed,
				onToggleLesson,
				tone,
				isAllSubjects: subjectId === "all"
			}, void 0, false, {
				fileName: _jsxFileName$22,
				lineNumber: 247,
				columnNumber: 13
			}, this)] }, void 0, true, {
				fileName: _jsxFileName$22,
				lineNumber: 237,
				columnNumber: 9
			}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "py-8 text-center text-sm text-slate-500",
				children: "Không có bài học nào."
			}, void 0, false, {
				fileName: _jsxFileName$22,
				lineNumber: 257,
				columnNumber: 9
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$22,
		lineNumber: 186,
		columnNumber: 5
	}, this);
}
function RoadmapPath({ milestones, activeId, openId, onOpen }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "relative min-w-0 overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-50/50 p-2 sm:p-2.5 scrollbar-none",
		role: "region",
		"aria-label": "Các tuần trong lộ trình",
		tabIndex: 0,
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "relative flex items-center gap-1.5 min-w-max",
			children: milestones.map((m, i) => {
				const isOpen = openId === m.id;
				const isActive = activeId === m.id;
				return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: () => onOpen(m.id),
						className: cn("group flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0", isOpen ? "bg-slate-900 text-white shadow-xs" : m.isComplete ? "bg-emerald-50 text-emerald-800 border border-emerald-200/90 hover:bg-emerald-100/80" : isActive ? "bg-emerald-600 text-white font-bold shadow-xs ring-2 ring-emerald-600/20" : "bg-white text-slate-600 border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50"),
						children: [
							m.isComplete ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleCheck, { className: cn("h-3.5 w-3.5 shrink-0", isOpen ? "text-emerald-300" : "text-emerald-600") }, void 0, false, {
								fileName: _jsxFileName$22,
								lineNumber: 302,
								columnNumber: 19
							}, this) : isActive ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Play, { className: "h-3.5 w-3.5 shrink-0 fill-current" }, void 0, false, {
								fileName: _jsxFileName$22,
								lineNumber: 309,
								columnNumber: 19
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "h-2 w-2 rounded-full bg-slate-300 group-hover:bg-slate-400 shrink-0" }, void 0, false, {
								fileName: _jsxFileName$22,
								lineNumber: 311,
								columnNumber: 19
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "truncate",
								children: m.title
							}, void 0, false, {
								fileName: _jsxFileName$22,
								lineNumber: 313,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: cn("text-[10px] font-normal shrink-0", isOpen || isActive ? "text-white/80" : "text-slate-500"),
								children: [
									"(",
									m.doneCount,
									"/",
									m.totalCount,
									")"
								]
							}, void 0, true, {
								fileName: _jsxFileName$22,
								lineNumber: 314,
								columnNumber: 17
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$22,
						lineNumber: 288,
						columnNumber: 15
					}, this), i < milestones.length - 1 && /* @__PURE__ */ (void 0)("div", { className: cn("h-0.5 w-4 sm:w-6 shrink-0 rounded-full transition-colors", m.isComplete ? "bg-emerald-400" : "bg-slate-200") }, void 0, false, {
						fileName: _jsxFileName$22,
						lineNumber: 324,
						columnNumber: 17
					}, this)]
				}, m.id, true, {
					fileName: _jsxFileName$22,
					lineNumber: 287,
					columnNumber: 13
				}, this);
			})
		}, void 0, false, {
			fileName: _jsxFileName$22,
			lineNumber: 282,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$22,
		lineNumber: 276,
		columnNumber: 5
	}, this);
}
function MilestonePanel({ milestone, completed, onToggleLesson, isAllSubjects }) {
	const pct = milestone.totalCount > 0 ? milestone.doneCount / milestone.totalCount * 100 : 0;
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
					className: "font-serif text-lg sm:text-xl font-bold text-slate-900",
					children: milestone.title
				}, void 0, false, {
					fileName: _jsxFileName$22,
					lineNumber: 357,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "text-xs text-slate-500 font-medium mt-0.5",
					children: milestone.subtitle
				}, void 0, false, {
					fileName: _jsxFileName$22,
					lineNumber: 358,
					columnNumber: 11
				}, this)] }, void 0, true, {
					fileName: _jsxFileName$22,
					lineNumber: 356,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-emerald-700 shrink-0",
					children: [
						milestone.doneCount,
						"/",
						milestone.totalCount,
						" bài"
					]
				}, void 0, true, {
					fileName: _jsxFileName$22,
					lineNumber: 360,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$22,
				lineNumber: 355,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "h-2 w-full overflow-hidden rounded-full bg-slate-100",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "h-full rounded-full bg-emerald-500 transition-all duration-300",
					style: { width: `${pct}%` }
				}, void 0, false, {
					fileName: _jsxFileName$22,
					lineNumber: 366,
					columnNumber: 9
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$22,
				lineNumber: 365,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ul", {
				className: "grid gap-2.5 sm:grid-cols-2 pt-1",
				children: milestone.lessons.map((l) => {
					const isDone = !!completed[l.id];
					const subjKey = l.id.split("-")[0];
					const subjEmoji = resolveSubjectEmoji(subjKey, l.sourceSubject);
					const subjName = SUBJECT_LABEL[subjKey] ?? l.sourceSubject;
					return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: () => onToggleLesson(l.id, l.xp),
						className: cn("group flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all hover:border-emerald-400", isDone ? "border-emerald-200/80 bg-emerald-50/30 text-slate-700" : "border-slate-200/80 bg-white text-slate-900"),
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "mt-0.5 shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleCheck, { className: cn("h-4 w-4 transition-transform", isDone ? "text-emerald-600 scale-110" : "text-slate-300 group-hover:text-emerald-400") }, void 0, false, {
								fileName: _jsxFileName$22,
								lineNumber: 392,
								columnNumber: 19
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$22,
							lineNumber: 391,
							columnNumber: 17
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex-1 min-w-0 space-y-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "flex items-center gap-1.5 flex-wrap",
									children: [
										(isAllSubjects || subjKey) && /* @__PURE__ */ (void 0)("span", {
											className: "rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700",
											children: [
												subjEmoji,
												" ",
												subjName
											]
										}, void 0, true, {
											fileName: _jsxFileName$22,
											lineNumber: 402,
											columnNumber: 23
										}, this),
										l.topic && /* @__PURE__ */ (void 0)("span", {
											className: "rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-100",
											children: l.topic
										}, void 0, false, {
											fileName: _jsxFileName$22,
											lineNumber: 407,
											columnNumber: 23
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
											className: "rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600",
											children: [
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Clock, { className: "inline h-2.5 w-2.5 mr-0.5" }, void 0, false, {
													fileName: _jsxFileName$22,
													lineNumber: 412,
													columnNumber: 23
												}, this),
												l.plannedDurationMinutes,
												"p"
											]
										}, void 0, true, {
											fileName: _jsxFileName$22,
											lineNumber: 411,
											columnNumber: 21
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName$22,
									lineNumber: 400,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: cn("text-xs font-semibold leading-snug break-words", isDone && "text-slate-400 line-through"),
									children: l.title
								}, void 0, false, {
									fileName: _jsxFileName$22,
									lineNumber: 417,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "text-[11px] text-slate-500",
									children: [l.effectiveDate ? `${weekdayFullVi(l.effectiveDate)} · ${displayDate(l.effectiveDate)}` : "Chưa xếp ngày", /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "ml-2 font-medium text-slate-400",
										children: [
											"+",
											l.xp,
											" XP"
										]
									}, void 0, true, {
										fileName: _jsxFileName$22,
										lineNumber: 430,
										columnNumber: 21
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$22,
									lineNumber: 426,
									columnNumber: 19
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName$22,
							lineNumber: 399,
							columnNumber: 17
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$22,
						lineNumber: 382,
						columnNumber: 15
					}, this) }, l.id, false, {
						fileName: _jsxFileName$22,
						lineNumber: 381,
						columnNumber: 13
					}, this);
				})
			}, void 0, false, {
				fileName: _jsxFileName$22,
				lineNumber: 372,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$22,
		lineNumber: 354,
		columnNumber: 5
	}, this);
}
var _jsxFileName$21 = "/app/applet/src/components/HabitSidebar.tsx";
var ICONS = {
	water: Droplet,
	book: Book,
	run: Footprints,
	sleep: Moon,
	meditate: Sparkles,
	study: Target
};
var WEEKDAYS = [
	"T2",
	"T3",
	"T4",
	"T5",
	"T6",
	"T7",
	"CN"
];
function HabitSidebar({ entry, streak, weekLog, definitions, onUpdate, onSaveDefinition, onArchiveHabit, onDeleteHabit }) {
	const [managerOpen, setManagerOpen] = (0, import_react.useState)(false);
	const active = definitions.filter((habit) => !habit.archived);
	const today = todayISO();
	const done = active.filter((habit) => isHabitDone(habit, entry, today)).length;
	const weekDates = (0, import_react.useMemo)(() => Array.from({ length: 7 }, (_, index) => addDaysISO(today, index - 6)), [today]);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("aside", {
		className: "flex flex-col gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "rounded-2xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200/80",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "mb-4 flex flex-col gap-3 pb-3.5 border-b border-slate-100",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
								className: "font-serif text-lg sm:text-xl font-bold text-slate-900",
								children: "Thói quen"
							}, void 0, false, {
								fileName: _jsxFileName$21,
								lineNumber: 85,
								columnNumber: 15
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 border border-emerald-200/60",
								children: [
									done,
									"/",
									active.length,
									" hôm nay"
								]
							}, void 0, true, {
								fileName: _jsxFileName$21,
								lineNumber: 86,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$21,
							lineNumber: 84,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
							size: "icon",
							variant: "ghost",
							className: "h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 shrink-0",
							onClick: () => setManagerOpen(true),
							"aria-label": "Quản lý thói quen",
							title: "Quản lý thói quen",
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Settings2, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$21,
								lineNumber: 98,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$21,
							lineNumber: 90,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$21,
						lineNumber: 83,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center gap-1.5 text-xs font-medium text-amber-900 bg-amber-50/90 border border-amber-200/80 px-3 py-1.5 rounded-xl w-fit shadow-2xs",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "🔥 Chuỗi thói quen:" }, void 0, false, {
							fileName: _jsxFileName$21,
							lineNumber: 104,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("strong", {
							className: "font-bold text-orange-600",
							children: [streak, " ngày liên tiếp"]
						}, void 0, true, {
							fileName: _jsxFileName$21,
							lineNumber: 105,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$21,
						lineNumber: 103,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "pt-1",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider",
							children: "7 ngày gần nhất"
						}, void 0, false, {
							fileName: _jsxFileName$21,
							lineNumber: 110,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "grid grid-cols-7 gap-1 sm:gap-1.5 text-center w-full",
							children: weekLog.map((dayEntry, index) => {
								const dateISO = weekDates[index];
								const dayLabel = getDayLabel(dateISO);
								const available = active.filter((habit) => targetOnDate(habit, dateISO) > 0);
								const score = available.filter((habit) => isHabitDone(habit, dayEntry, dateISO)).length;
								const isAllDone = available.length > 0 && score === available.length;
								const isPartial = score > 0 && !isAllDone;
								const isToday = dateISO === today;
								return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "flex flex-col items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: cn("text-[10px] font-semibold leading-none", isToday ? "text-orange-600 font-bold" : "text-slate-400"),
										children: dayLabel
									}, void 0, false, {
										fileName: _jsxFileName$21,
										lineNumber: 127,
										columnNumber: 21
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										title: `${dayLabel} (${dateISO}): ${score}/${available.length} thói quen hoàn thành`,
										className: cn("flex h-8 w-full max-w-[36px] items-center justify-center rounded-xl text-[11px] font-bold transition-all mx-auto", isAllDone && "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-2xs", isPartial && "bg-amber-100 border border-amber-300 text-amber-800", !isAllDone && !isPartial && "bg-slate-100/90 text-slate-400 border border-slate-200/60", isToday && "ring-2 ring-orange-400 ring-offset-1"),
										children: isAllDone ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Check, { className: "h-4 w-4 stroke-[3]" }, void 0, false, {
											fileName: _jsxFileName$21,
											lineNumber: 146,
											columnNumber: 25
										}, this) : score > 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: score }, void 0, false, {
											fileName: _jsxFileName$21,
											lineNumber: 148,
											columnNumber: 25
										}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "h-1.5 w-1.5 rounded-full bg-slate-300" }, void 0, false, {
											fileName: _jsxFileName$21,
											lineNumber: 150,
											columnNumber: 25
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName$21,
										lineNumber: 135,
										columnNumber: 21
									}, this)]
								}, dateISO, true, {
									fileName: _jsxFileName$21,
									lineNumber: 126,
									columnNumber: 19
								}, this);
							})
						}, void 0, false, {
							fileName: _jsxFileName$21,
							lineNumber: 113,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$21,
						lineNumber: 109,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName$21,
				lineNumber: 81,
				columnNumber: 9
			}, this), active.length === 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
				onClick: () => setManagerOpen(true),
				className: "w-full rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground hover:bg-slate-50/50",
				children: "Chưa có thói quen đang hoạt động. Nhấn để thêm."
			}, void 0, false, {
				fileName: _jsxFileName$21,
				lineNumber: 161,
				columnNumber: 11
			}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ul", {
				className: "grid gap-2.5",
				children: active.map((habit) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(HabitRow, {
					definition: habit,
					icon: ICONS[habit.icon],
					entry,
					dateISO: today,
					onUpdate
				}, habit.id, false, {
					fileName: _jsxFileName$21,
					lineNumber: 170,
					columnNumber: 15
				}, this))
			}, void 0, false, {
				fileName: _jsxFileName$21,
				lineNumber: 168,
				columnNumber: 11
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$21,
			lineNumber: 80,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(HabitManager, {
			open: managerOpen,
			onOpenChange: setManagerOpen,
			definitions,
			onSave: onSaveDefinition,
			onArchive: onArchiveHabit,
			onDelete: onDeleteHabit
		}, void 0, false, {
			fileName: _jsxFileName$21,
			lineNumber: 183,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$21,
		lineNumber: 79,
		columnNumber: 5
	}, this);
}
function HabitRow({ definition, icon, entry, dateISO, onUpdate }) {
	const target = targetOnDate(definition, dateISO);
	const disabledToday = target <= 0;
	const rawValue = entry[definition.id];
	const numericValue = typeof rawValue === "number" ? rawValue : 0;
	const checked = rawValue === true;
	const isDone = isHabitDone(definition, entry, dateISO);
	if (definition.kind === "counter") {
		const percentage = target > 0 ? Math.min(1, numericValue / target) : 0;
		return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", {
			className: cn("relative overflow-hidden rounded-2xl border-2 p-3 transition-all", isDone ? "border-emerald-200 bg-white shadow-soft" : "border-transparent bg-white/70", disabledToday && "opacity-50"),
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "absolute inset-y-0 left-0 bg-sky-100/70 transition-all",
				style: { width: `${percentage * 100}%` }
			}, void 0, false, {
				fileName: _jsxFileName$21,
				lineNumber: 225,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "relative flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DuotoneIcon, {
						icon,
						tone: definition.color,
						active: numericValue > 0,
						size: 22
					}, void 0, false, {
						fileName: _jsxFileName$21,
						lineNumber: 230,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "text-sm font-medium",
							children: definition.name
						}, void 0, false, {
							fileName: _jsxFileName$21,
							lineNumber: 232,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "text-[11px] text-muted-foreground",
							children: disabledToday ? "Không đặt mục tiêu hôm nay" : `${numericValue}/${target}`
						}, void 0, false, {
							fileName: _jsxFileName$21,
							lineNumber: 233,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$21,
						lineNumber: 231,
						columnNumber: 11
					}, this),
					!disabledToday && /* @__PURE__ */ (void 0)("div", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (void 0)("button", {
							onClick: () => onUpdate({ [definition.id]: Math.max(0, numericValue - 1) }),
							className: "grid h-8 w-8 place-items-center rounded-xl bg-white text-muted-foreground shadow-soft",
							"aria-label": `Giảm ${definition.name}`,
							children: /* @__PURE__ */ (void 0)(Minus, { size: 14 }, void 0, false, {
								fileName: _jsxFileName$21,
								lineNumber: 244,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$21,
							lineNumber: 239,
							columnNumber: 15
						}, this), /* @__PURE__ */ (void 0)("button", {
							onClick: () => onUpdate({ [definition.id]: numericValue + 1 }),
							className: "grid h-8 w-8 place-items-center rounded-xl bg-sky-500 text-white shadow-soft",
							"aria-label": `Tăng ${definition.name}`,
							children: /* @__PURE__ */ (void 0)(Plus, { size: 14 }, void 0, false, {
								fileName: _jsxFileName$21,
								lineNumber: 251,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$21,
							lineNumber: 246,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$21,
						lineNumber: 238,
						columnNumber: 13
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName$21,
				lineNumber: 229,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$21,
			lineNumber: 218,
			columnNumber: 7
		}, this);
	}
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
		disabled: disabledToday,
		onClick: () => onUpdate({ [definition.id]: !checked }),
		className: cn("flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all hover:-translate-y-0.5", isDone ? "border-emerald-200 bg-white shadow-soft" : "border-transparent bg-white/70", disabledToday && "cursor-not-allowed opacity-50 hover:translate-y-0"),
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DuotoneIcon, {
				icon,
				tone: definition.color,
				active: isDone,
				size: 22
			}, void 0, false, {
				fileName: _jsxFileName$21,
				lineNumber: 271,
				columnNumber: 9
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: cn("text-sm font-medium", isDone && "text-muted-foreground"),
					children: definition.name
				}, void 0, false, {
					fileName: _jsxFileName$21,
					lineNumber: 273,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "text-[11px] text-muted-foreground",
					children: disabledToday ? "Không đặt mục tiêu hôm nay" : isDone ? "Đã hoàn thành" : "Nhấn để đánh dấu"
				}, void 0, false, {
					fileName: _jsxFileName$21,
					lineNumber: 276,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$21,
				lineNumber: 272,
				columnNumber: 9
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
				className: cn("grid h-7 w-7 place-items-center rounded-full border-2 transition-all", isDone ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-transparent text-transparent"),
				"aria-hidden": "true",
				children: isDone ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Check, { className: "h-4 w-4" }, void 0, false, {
					fileName: _jsxFileName$21,
					lineNumber: 293,
					columnNumber: 21
				}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Circle, { className: "h-3 w-3 opacity-0" }, void 0, false, {
					fileName: _jsxFileName$21,
					lineNumber: 293,
					columnNumber: 53
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$21,
				lineNumber: 284,
				columnNumber: 9
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$21,
		lineNumber: 262,
		columnNumber: 7
	}, this) }, void 0, false, {
		fileName: _jsxFileName$21,
		lineNumber: 261,
		columnNumber: 5
	}, this);
}
function HabitManager({ open, onOpenChange, definitions, onSave, onArchive, onDelete }) {
	const emptyForm = () => ({
		name: "",
		icon: "study",
		color: "green",
		kind: "toggle",
		target: 1,
		archived: false,
		dailyTargets: [
			1,
			1,
			1,
			1,
			1,
			1,
			1
		]
	});
	const [form, setForm] = (0, import_react.useState)(emptyForm);
	const [nameError, setNameError] = (0, import_react.useState)("");
	const edit = (habit) => {
		setForm({
			...habit,
			dailyTargets: [...habit.dailyTargets]
		});
	};
	const submit = () => {
		if (!form.name.trim()) {
			setNameError("Vui lòng nhập tên thói quen.");
			return;
		}
		onSave({
			...form,
			name: form.name.trim(),
			target: Math.max(1, form.target),
			dailyTargets: form.dailyTargets.map((value) => Math.max(0, Math.round(value)))
		});
		setForm(emptyForm());
		setNameError("");
	};
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent, {
			className: "max-h-[90vh] max-w-3xl overflow-y-auto rounded-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle, { children: "Quản lý thói quen" }, void 0, false, {
					fileName: _jsxFileName$21,
					lineNumber: 351,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogDescription, { children: "Thêm, sửa, tạm ẩn hoặc xóa định nghĩa. Nhật ký đã ghi theo ID vẫn được giữ nguyên." }, void 0, false, {
					fileName: _jsxFileName$21,
					lineNumber: 352,
					columnNumber: 11
				}, this)] }, void 0, true, {
					fileName: _jsxFileName$21,
					lineNumber: 350,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "grid gap-3 rounded-2xl border bg-slate-50 p-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "space-y-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, { children: "Tên thói quen" }, void 0, false, {
									fileName: _jsxFileName$21,
									lineNumber: 359,
									columnNumber: 13
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
									value: form.name,
									onChange: (event) => setForm((current) => ({
										...current,
										name: event.target.value
									})),
									placeholder: "Ví dụ: Học từ vựng",
									"aria-label": "Tên thói quen",
									"aria-invalid": !!nameError,
									"aria-describedby": "habit-name-error"
								}, void 0, false, {
									fileName: _jsxFileName$21,
									lineNumber: 360,
									columnNumber: 13
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
									id: "habit-name-error",
									className: "text-xs text-destructive",
									role: "alert",
									children: nameError
								}, void 0, false, {
									fileName: _jsxFileName$21,
									lineNumber: 368,
									columnNumber: 13
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName$21,
							lineNumber: 358,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, { children: "Loại" }, void 0, false, {
								fileName: _jsxFileName$21,
								lineNumber: 373,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("select", {
								"aria-label": "Loại thói quen",
								value: form.kind,
								onChange: (event) => {
									const kind = event.target.value;
									setForm((current) => ({
										...current,
										kind,
										target: kind === "toggle" ? 1 : Math.max(1, current.target),
										dailyTargets: kind === "toggle" ? current.dailyTargets.map((value) => value > 0 ? 1 : 0) : current.dailyTargets
									}));
								},
								className: "h-10 w-full rounded-md border bg-white px-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
									value: "toggle",
									children: "Đánh dấu hoàn thành"
								}, void 0, false, {
									fileName: _jsxFileName$21,
									lineNumber: 393,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
									value: "counter",
									children: "Bộ đếm"
								}, void 0, false, {
									fileName: _jsxFileName$21,
									lineNumber: 394,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$21,
								lineNumber: 374,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$21,
							lineNumber: 372,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, { children: "Biểu tượng" }, void 0, false, {
								fileName: _jsxFileName$21,
								lineNumber: 398,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("select", {
								"aria-label": "Biểu tượng thói quen",
								value: form.icon,
								onChange: (event) => setForm((current) => ({
									...current,
									icon: event.target.value
								})),
								className: "h-10 w-full rounded-md border bg-white px-3 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
										value: "study",
										children: "Học tập"
									}, void 0, false, {
										fileName: _jsxFileName$21,
										lineNumber: 407,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
										value: "book",
										children: "Đọc sách"
									}, void 0, false, {
										fileName: _jsxFileName$21,
										lineNumber: 408,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
										value: "water",
										children: "Nước"
									}, void 0, false, {
										fileName: _jsxFileName$21,
										lineNumber: 409,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
										value: "run",
										children: "Vận động"
									}, void 0, false, {
										fileName: _jsxFileName$21,
										lineNumber: 410,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
										value: "sleep",
										children: "Giấc ngủ"
									}, void 0, false, {
										fileName: _jsxFileName$21,
										lineNumber: 411,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
										value: "meditate",
										children: "Thư giãn"
									}, void 0, false, {
										fileName: _jsxFileName$21,
										lineNumber: 412,
										columnNumber: 15
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$21,
								lineNumber: 399,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$21,
							lineNumber: 397,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, { children: "Màu" }, void 0, false, {
								fileName: _jsxFileName$21,
								lineNumber: 416,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("select", {
								"aria-label": "Màu thói quen",
								value: form.color,
								onChange: (event) => setForm((current) => ({
									...current,
									color: event.target.value
								})),
								className: "h-10 w-full rounded-md border bg-white px-3 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
										value: "green",
										children: "Xanh lá"
									}, void 0, false, {
										fileName: _jsxFileName$21,
										lineNumber: 425,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
										value: "blue",
										children: "Xanh dương"
									}, void 0, false, {
										fileName: _jsxFileName$21,
										lineNumber: 426,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
										value: "amber",
										children: "Vàng"
									}, void 0, false, {
										fileName: _jsxFileName$21,
										lineNumber: 427,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
										value: "coral",
										children: "Đỏ san hô"
									}, void 0, false, {
										fileName: _jsxFileName$21,
										lineNumber: 428,
										columnNumber: 15
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$21,
								lineNumber: 417,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$21,
							lineNumber: 415,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "space-y-2 sm:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, { children: "Mục tiêu từng ngày (0 = không áp dụng)" }, void 0, false, {
								fileName: _jsxFileName$21,
								lineNumber: 432,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "grid grid-cols-7 gap-1.5",
								children: WEEKDAYS.map((label, index) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", {
									className: "text-center text-[11px] text-muted-foreground",
									children: [label, form.kind === "toggle" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
										type: "button",
										onClick: () => setForm((current) => {
											const next = [...current.dailyTargets];
											next[index] = next[index] > 0 ? 0 : 1;
											return {
												...current,
												dailyTargets: next
											};
										}),
										className: cn("mt-1 h-9 w-full rounded-lg border font-semibold", form.dailyTargets[index] > 0 ? "border-emerald-300 bg-emerald-100 text-emerald-800" : "bg-white text-slate-400"),
										children: form.dailyTargets[index] > 0 ? "Có" : "—"
									}, void 0, false, {
										fileName: _jsxFileName$21,
										lineNumber: 438,
										columnNumber: 21
									}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
										type: "number",
										"aria-label": `Mục tiêu ${label}`,
										min: 0,
										max: 999,
										className: "mt-1 px-1 text-center",
										value: form.dailyTargets[index],
										onChange: (event) => setForm((current) => {
											const next = [...current.dailyTargets];
											next[index] = Math.max(0, Number(event.target.value) || 0);
											return {
												...current,
												dailyTargets: next,
												target: Math.max(1, next[index])
											};
										})
									}, void 0, false, {
										fileName: _jsxFileName$21,
										lineNumber: 457,
										columnNumber: 21
									}, this)]
								}, label, true, {
									fileName: _jsxFileName$21,
									lineNumber: 435,
									columnNumber: 17
								}, this))
							}, void 0, false, {
								fileName: _jsxFileName$21,
								lineNumber: 433,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$21,
							lineNumber: 431,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex justify-end gap-2 sm:col-span-2",
							children: [form.id && /* @__PURE__ */ (void 0)(Button, {
								variant: "ghost",
								onClick: () => setForm(emptyForm()),
								children: "Hủy sửa"
							}, void 0, false, {
								fileName: _jsxFileName$21,
								lineNumber: 483,
								columnNumber: 15
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
								onClick: submit,
								children: [form.id ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Pencil, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$21,
									lineNumber: 488,
									columnNumber: 26
								}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Plus, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$21,
									lineNumber: 488,
									columnNumber: 59
								}, this), form.id ? "Lưu thay đổi" : "Thêm thói quen"]
							}, void 0, true, {
								fileName: _jsxFileName$21,
								lineNumber: 487,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$21,
							lineNumber: 481,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$21,
					lineNumber: 357,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "space-y-2",
					children: definitions.map((habit) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: cn("flex items-center gap-2 rounded-xl border bg-white p-3", habit.archived && "opacity-60"),
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DuotoneIcon, {
								icon: ICONS[habit.icon],
								tone: habit.color,
								size: 20
							}, void 0, false, {
								fileName: _jsxFileName$21,
								lineNumber: 503,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "truncate text-sm font-medium",
									children: habit.name
								}, void 0, false, {
									fileName: _jsxFileName$21,
									lineNumber: 505,
									columnNumber: 17
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "text-[11px] text-muted-foreground",
									children: [
										habit.kind === "counter" ? "Bộ đếm" : "Đánh dấu",
										" ·",
										" ",
										habit.dailyTargets.filter((target) => target > 0).length,
										"/7 ngày"
									]
								}, void 0, true, {
									fileName: _jsxFileName$21,
									lineNumber: 506,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$21,
								lineNumber: 504,
								columnNumber: 15
							}, this),
							!habit.archived && /* @__PURE__ */ (void 0)(Button, {
								size: "icon",
								variant: "ghost",
								onClick: () => edit(habit),
								title: "Sửa",
								"aria-label": `Sửa thói quen ${habit.name}`,
								children: /* @__PURE__ */ (void 0)(Pencil, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$21,
									lineNumber: 519,
									columnNumber: 19
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$21,
								lineNumber: 512,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
								size: "icon",
								variant: "ghost",
								onClick: () => onArchive(habit.id, !habit.archived),
								title: habit.archived ? "Hiện lại" : "Tạm ẩn",
								"aria-label": habit.archived ? `Hiện lại thói quen ${habit.name}` : `Tạm ẩn thói quen ${habit.name}`,
								children: habit.archived ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Undo2, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$21,
									lineNumber: 533,
									columnNumber: 35
								}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Archive, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$21,
									lineNumber: 533,
									columnNumber: 67
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$21,
								lineNumber: 522,
								columnNumber: 15
							}, this),
							habit.archived && /* @__PURE__ */ (void 0)(Button, {
								size: "icon",
								variant: "ghost",
								className: "text-rose-600",
								onClick: () => {
									if (window.confirm(`Xóa định nghĩa "${habit.name}"? Nhật ký cũ vẫn được giữ.`)) onDelete(habit.id);
								},
								title: "Xóa định nghĩa",
								"aria-label": `Xóa định nghĩa thói quen ${habit.name}`,
								children: /* @__PURE__ */ (void 0)(Trash2, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$21,
									lineNumber: 550,
									columnNumber: 19
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$21,
								lineNumber: 536,
								columnNumber: 17
							}, this)
						]
					}, habit.id, true, {
						fileName: _jsxFileName$21,
						lineNumber: 496,
						columnNumber: 13
					}, this))
				}, void 0, false, {
					fileName: _jsxFileName$21,
					lineNumber: 494,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName$21,
			lineNumber: 349,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$21,
		lineNumber: 348,
		columnNumber: 5
	}, this);
}
function getDayLabel(dateISO) {
	return [
		"CN",
		"T2",
		"T3",
		"T4",
		"T5",
		"T6",
		"T7"
	][(/* @__PURE__ */ new Date(`${dateISO}T12:00:00`)).getDay()];
}
function targetOnDate(habit, dateISO) {
	const day = (/* @__PURE__ */ new Date(`${dateISO}T12:00:00`)).getDay();
	return habit.dailyTargets[(day + 6) % 7] ?? habit.target;
}
function isHabitDone(habit, entry, dateISO) {
	if (!entry) return false;
	const target = targetOnDate(habit, dateISO);
	if (target <= 0) return false;
	const value = entry[habit.id];
	return habit.kind === "counter" ? typeof value === "number" && value >= target : value === true;
}
var _jsxFileName$20 = "/app/applet/src/components/ConfettiBurst.tsx";
var COLORS = [
	"#7EC8FF",
	"#A8E6C9",
	"#FFD98A",
	"#FF9068",
	"#C5B3FF"
];
function ConfettiBurst({ trigger }) {
	const [pieces, setPieces] = (0, import_react.useState)([]);
	const [reduceMotion, setReduceMotion] = (0, import_react.useState)(false);
	const [confettiEnabled, setConfettiEnabled] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const readPreference = () => {
			try {
				const parsed = JSON.parse(localStorage.getItem("hocvien-appearance-preferences-v1") || "{}");
				setConfettiEnabled(parsed.confetti !== false);
			} catch {
				setConfettiEnabled(true);
			}
		};
		readPreference();
		window.addEventListener("storage", readPreference);
		window.addEventListener("hocvien:appearance-updated", readPreference);
		return () => {
			window.removeEventListener("storage", readPreference);
			window.removeEventListener("hocvien:appearance-updated", readPreference);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => setReduceMotion(media.matches);
		update();
		media.addEventListener("change", update);
		return () => media.removeEventListener("change", update);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!trigger || reduceMotion || !confettiEnabled) {
			setPieces([]);
			return;
		}
		const arr = Array.from({ length: 18 }).map((_, i) => ({
			id: trigger * 100 + i,
			x: (Math.random() - .5) * 240,
			y: -Math.random() * 220 - 40,
			c: COLORS[i % COLORS.length],
			r: Math.random() * 360
		}));
		setPieces(arr);
		const t = setTimeout(() => setPieces([]), 900);
		return () => clearTimeout(t);
	}, [
		confettiEnabled,
		reduceMotion,
		trigger
	]);
	if (!pieces.length) return null;
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "pointer-events-none fixed inset-0 z-50 flex items-center justify-center",
		children: pieces.map((p) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
			className: "absolute h-2 w-2 rounded-sm animate-confetti",
			style: {
				background: p.c,
				"--tx": `${p.x}px`,
				"--ty": `${p.y}px`,
				"--rot": `${p.r}deg`
			}
		}, p.id, false, {
			fileName: _jsxFileName$20,
			lineNumber: 59,
			columnNumber: 9
		}, this))
	}, void 0, false, {
		fileName: _jsxFileName$20,
		lineNumber: 57,
		columnNumber: 5
	}, this);
}
var _jsxFileName$19 = "/app/applet/src/components/ui/popover.tsx";
var Popover = Root2$1;
var PopoverTrigger = Trigger$1;
var PopoverContent = import_react.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Portal, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Content2$1, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$19,
	lineNumber: 17,
	columnNumber: 5
}, void 0) }, void 0, false, {
	fileName: _jsxFileName$19,
	lineNumber: 16,
	columnNumber: 3
}, void 0));
PopoverContent.displayName = Content2$1.displayName;
var _jsxFileName$18 = "/app/applet/src/components/ui/dropdown-menu.tsx";
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ChevronRight, { className: "ml-auto" }, void 0, false, {
		fileName: _jsxFileName$18,
		lineNumber: 37,
		columnNumber: 5
	}, void 0)]
}, void 0, true, {
	fileName: _jsxFileName$18,
	lineNumber: 27,
	columnNumber: 3
}, void 0));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$18,
	lineNumber: 46,
	columnNumber: 3
}, void 0));
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$18,
	lineNumber: 62,
	columnNumber: 5
}, void 0) }, void 0, false, {
	fileName: _jsxFileName$18,
	lineNumber: 61,
	columnNumber: 3
}, void 0));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$18,
	lineNumber: 82,
	columnNumber: 3
}, void 0));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	checked,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Check, { className: "h-4 w-4" }, void 0, false, {
			fileName: _jsxFileName$18,
			lineNumber: 109,
			columnNumber: 9
		}, void 0) }, void 0, false, {
			fileName: _jsxFileName$18,
			lineNumber: 108,
			columnNumber: 7
		}, void 0)
	}, void 0, false, {
		fileName: _jsxFileName$18,
		lineNumber: 107,
		columnNumber: 5
	}, void 0), children]
}, void 0, true, {
	fileName: _jsxFileName$18,
	lineNumber: 98,
	columnNumber: 3
}, void 0));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Circle, { className: "h-2 w-2 fill-current" }, void 0, false, {
			fileName: _jsxFileName$18,
			lineNumber: 131,
			columnNumber: 9
		}, void 0) }, void 0, false, {
			fileName: _jsxFileName$18,
			lineNumber: 130,
			columnNumber: 7
		}, void 0)
	}, void 0, false, {
		fileName: _jsxFileName$18,
		lineNumber: 129,
		columnNumber: 5
	}, void 0), children]
}, void 0, true, {
	fileName: _jsxFileName$18,
	lineNumber: 121,
	columnNumber: 3
}, void 0));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$18,
	lineNumber: 145,
	columnNumber: 3
}, void 0));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}, void 0, false, {
	fileName: _jsxFileName$18,
	lineNumber: 157,
	columnNumber: 3
}, void 0));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	}, void 0, false, {
		fileName: _jsxFileName$18,
		lineNumber: 167,
		columnNumber: 5
	}, void 0);
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
var _jsxFileName$17 = "/app/applet/src/components/today/LessonActionMenu.tsx";
var primaryTone = {
	sky: "bg-sky-600 hover:bg-sky-700",
	amber: "bg-amber-500 hover:bg-amber-600",
	emerald: "bg-emerald-600 hover:bg-emerald-700"
};
function LessonActionMenu({ onStart, onManualEntry, disabled, tone = "sky", completedMinutes = 0, remainingMinutes = 120 }) {
	const [preferences, setPreferences] = (0, import_react.useState)(() => loadFocusPreferences());
	(0, import_react.useEffect)(() => {
		const refresh = () => setPreferences(loadFocusPreferences());
		window.addEventListener(FOCUS_PREFERENCES_EVENT, refresh);
		window.addEventListener("storage", refresh);
		return () => {
			window.removeEventListener(FOCUS_PREFERENCES_EVENT, refresh);
			window.removeEventListener("storage", refresh);
		};
	}, []);
	const isStarted = completedMinutes > 0;
	const suggestedMinutes = Math.min(preferences.defaultFocusMinutes, remainingMinutes > 0 ? remainingMinutes : preferences.defaultFocusMinutes);
	const useQuickStart = !isStarted && preferences.quickStartEnabled;
	const primaryMinutes = useQuickStart ? 2 : suggestedMinutes;
	const primaryLabel = useQuickStart ? "Khởi động 2 phút" : isStarted ? `Học tiếp ${suggestedMinutes} phút` : `Bắt đầu ${suggestedMinutes} phút`;
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
			type: "button",
			size: "sm",
			disabled,
			onClick: () => onStart(primaryMinutes),
			className: `min-h-10 flex-1 rounded-xl px-3 font-semibold text-white shadow-xs sm:flex-none ${primaryTone[tone]}`,
			children: [useQuickStart ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Zap, { className: "mr-1.5 h-4 w-4 fill-amber-200 text-amber-200" }, void 0, false, {
				fileName: _jsxFileName$17,
				lineNumber: 75,
				columnNumber: 11
			}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Play, { className: "mr-1.5 h-4 w-4 fill-current" }, void 0, false, {
				fileName: _jsxFileName$17,
				lineNumber: 77,
				columnNumber: 11
			}, this), primaryLabel]
		}, void 0, true, {
			fileName: _jsxFileName$17,
			lineNumber: 67,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
				type: "button",
				size: "sm",
				variant: "outline",
				disabled,
				className: "min-h-10 rounded-xl bg-white px-3 font-semibold text-slate-700",
				"aria-label": "Chọn phiên học",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Clock3, { className: "mr-1.5 h-4 w-4 text-slate-500" }, void 0, false, {
					fileName: _jsxFileName$17,
					lineNumber: 92,
					columnNumber: 13
				}, this), isStarted ? `${preferences.defaultFocusMinutes} phút ▾` : "Chọn phiên ▾"]
			}, void 0, true, {
				fileName: _jsxFileName$17,
				lineNumber: 84,
				columnNumber: 11
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName$17,
			lineNumber: 83,
			columnNumber: 9
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuContent, {
			align: "end",
			className: "w-64 rounded-2xl p-1.5 z-50",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuLabel, { children: "Chọn phiên học" }, void 0, false, {
					fileName: _jsxFileName$17,
					lineNumber: 97,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuItem, {
					onSelect: () => onStart(2),
					className: "rounded-xl py-2.5 font-medium cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Zap, { className: "mr-2 h-4 w-4 text-amber-500" }, void 0, false, {
						fileName: _jsxFileName$17,
						lineNumber: 99,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("strong", { children: "Khởi động" }, void 0, false, {
						fileName: _jsxFileName$17,
						lineNumber: 100,
						columnNumber: 19
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "ml-2 text-xs text-slate-500",
						children: "2 phút"
					}, void 0, false, {
						fileName: _jsxFileName$17,
						lineNumber: 100,
						columnNumber: 45
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$17,
						lineNumber: 100,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$17,
					lineNumber: 98,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuItem, {
					onSelect: () => onStart(25),
					className: "rounded-xl py-2.5 font-medium cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Timer, { className: "mr-2 h-4 w-4 text-rose-600" }, void 0, false, {
						fileName: _jsxFileName$17,
						lineNumber: 103,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("strong", { children: "Pomodoro" }, void 0, false, {
						fileName: _jsxFileName$17,
						lineNumber: 104,
						columnNumber: 19
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "ml-2 text-xs text-slate-500",
						children: "25 phút"
					}, void 0, false, {
						fileName: _jsxFileName$17,
						lineNumber: 104,
						columnNumber: 44
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$17,
						lineNumber: 104,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$17,
					lineNumber: 102,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuItem, {
					onSelect: () => onStart(50),
					className: "rounded-xl py-2.5 font-medium cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Clock3, { className: "mr-2 h-4 w-4 text-emerald-600" }, void 0, false, {
						fileName: _jsxFileName$17,
						lineNumber: 107,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("strong", { children: "Deep Work" }, void 0, false, {
						fileName: _jsxFileName$17,
						lineNumber: 108,
						columnNumber: 19
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "ml-2 text-xs text-slate-500",
						children: "50 phút"
					}, void 0, false, {
						fileName: _jsxFileName$17,
						lineNumber: 108,
						columnNumber: 45
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$17,
						lineNumber: 108,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$17,
					lineNumber: 106,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuItem, {
					onSelect: () => onStart(90),
					className: "rounded-xl py-2.5 font-medium cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Rocket, { className: "mr-2 h-4 w-4 text-indigo-600" }, void 0, false, {
						fileName: _jsxFileName$17,
						lineNumber: 111,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("strong", { children: "Siêu tập trung" }, void 0, false, {
						fileName: _jsxFileName$17,
						lineNumber: 112,
						columnNumber: 19
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "ml-2 text-xs text-slate-500",
						children: "90 phút"
					}, void 0, false, {
						fileName: _jsxFileName$17,
						lineNumber: 112,
						columnNumber: 50
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$17,
						lineNumber: 112,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$17,
					lineNumber: 110,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuSeparator, {}, void 0, false, {
					fileName: _jsxFileName$17,
					lineNumber: 114,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuItem, {
					onSelect: onManualEntry,
					className: "rounded-xl py-2.5 font-medium cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Pencil, { className: "mr-2 h-4 w-4 text-slate-600" }, void 0, false, {
						fileName: _jsxFileName$17,
						lineNumber: 116,
						columnNumber: 13
					}, this), " Thời lượng tùy chỉnh / ghi thủ công"]
				}, void 0, true, {
					fileName: _jsxFileName$17,
					lineNumber: 115,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName$17,
			lineNumber: 96,
			columnNumber: 9
		}, this)] }, void 0, true, {
			fileName: _jsxFileName$17,
			lineNumber: 82,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$17,
		lineNumber: 66,
		columnNumber: 5
	}, this);
}
var _jsxFileName$16 = "/app/applet/src/components/today/ManualStudyDialog.tsx";
function ManualStudyDialog({ request, onClose, onAddStudySession }) {
	const [minutes, setMinutes] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setMinutes(request ? String(request.estimatedMinutes) : "");
		setError("");
	}, [request]);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Dialog, {
		open: Boolean(request),
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent, {
			className: "max-w-md rounded-3xl",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle, { children: "Ghi thời gian học" }, void 0, false, {
				fileName: _jsxFileName$16,
				lineNumber: 35,
				columnNumber: 11
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogDescription, {
				id: "manual-minutes-help",
				children: [
					"Ghi số phút thực tế cho “",
					request?.lessonTitle,
					"”. Giá trị phải từ 5 đến 240 phút."
				]
			}, void 0, true, {
				fileName: _jsxFileName$16,
				lineNumber: 36,
				columnNumber: 11
			}, this)] }, void 0, true, {
				fileName: _jsxFileName$16,
				lineNumber: 34,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("form", {
				className: "space-y-4",
				onSubmit: (event) => {
					event.preventDefault();
					const value = Number(minutes);
					if (!Number.isFinite(value) || value < 5 || value > 240) {
						setError("Nhập số phút từ 5 đến 240.");
						return;
					}
					if (!request) return;
					onAddStudySession(createStudySession({
						lessonId: request.lessonId,
						durationSeconds: value * 60,
						source: "manual"
					}));
					toast.success(`Đã ghi ${value} phút cho bài này`);
					onClose();
				},
				"aria-describedby": "manual-minutes-help manual-minutes-error",
				noValidate: true,
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "space-y-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
							htmlFor: "manual-minutes",
							children: "Số phút thực tế"
						}, void 0, false, {
							fileName: _jsxFileName$16,
							lineNumber: 64,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
							id: "manual-minutes",
							type: "number",
							min: 5,
							max: 240,
							value: minutes,
							onChange: (event) => setMinutes(event.target.value),
							"aria-invalid": Boolean(error),
							"aria-describedby": "manual-minutes-help manual-minutes-error",
							autoFocus: true,
							required: true
						}, void 0, false, {
							fileName: _jsxFileName$16,
							lineNumber: 65,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							id: "manual-minutes-error",
							className: "min-h-4 text-xs text-destructive",
							role: "alert",
							children: error
						}, void 0, false, {
							fileName: _jsxFileName$16,
							lineNumber: 77,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$16,
					lineNumber: 63,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex justify-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
						type: "button",
						variant: "outline",
						onClick: onClose,
						children: "Hủy"
					}, void 0, false, {
						fileName: _jsxFileName$16,
						lineNumber: 82,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
						type: "submit",
						children: "Ghi thời gian"
					}, void 0, false, {
						fileName: _jsxFileName$16,
						lineNumber: 85,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$16,
					lineNumber: 81,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$16,
				lineNumber: 40,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$16,
			lineNumber: 33,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$16,
		lineNumber: 32,
		columnNumber: 5
	}, this);
}
var _jsxFileName$15 = "/app/applet/src/components/today/TodayLessonCard.tsx";
function TodayLessonCard({ lesson, done, estimatedMinutes, completedMinutes = 0, plannedMinutes, subjectLabel, topicLabel, reviewAgeDays, onToggle, onStart, onManualEntry }) {
	const review = typeof reviewAgeDays === "number";
	const totalDuration = plannedMinutes ?? lesson.plannedDurationMinutes ?? 120;
	const completedDuration = completedMinutes;
	const percent = Math.min(100, Math.round(completedDuration / totalDuration * 100));
	const remainingMinutes = Math.max(0, totalDuration - completedDuration);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", {
		className: cn("min-w-0 rounded-2xl border p-3.5 shadow-xs transition", done ? "border-emerald-200 bg-emerald-50/70" : "border-slate-200 bg-white/90", review && !done && "border-amber-200 bg-amber-50/60"),
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-center",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex min-w-0 flex-1 items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
					type: "button",
					"aria-label": done ? "Bỏ đánh dấu hoàn thành" : "Đánh dấu hoàn thành",
					onClick: onToggle,
					className: "mt-0.5 shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500",
					children: done ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleCheck, { className: "h-6 w-6 text-emerald-600" }, void 0, false, {
						fileName: _jsxFileName$15,
						lineNumber: 56,
						columnNumber: 15
					}, this) : review ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RefreshCw, { className: "h-5 w-5 text-amber-600" }, void 0, false, {
						fileName: _jsxFileName$15,
						lineNumber: 58,
						columnNumber: 15
					}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Circle, { className: "h-6 w-6 text-sky-500" }, void 0, false, {
						fileName: _jsxFileName$15,
						lineNumber: 60,
						columnNumber: 15
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName$15,
					lineNumber: 49,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: cn("break-words text-sm font-semibold leading-snug text-slate-900", done && "text-muted-foreground line-through"),
							children: lesson.title
						}, void 0, false, {
							fileName: _jsxFileName$15,
							lineNumber: 64,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700",
									children: subjectLabel
								}, void 0, false, {
									fileName: _jsxFileName$15,
									lineNumber: 73,
									columnNumber: 15
								}, this),
								topicLabel && /* @__PURE__ */ (void 0)("span", {
									className: "rounded-md bg-purple-100 px-1.5 py-0.5 font-medium text-purple-800",
									children: topicLabel
								}, void 0, false, {
									fileName: _jsxFileName$15,
									lineNumber: 77,
									columnNumber: 17
								}, this),
								review && /* @__PURE__ */ (void 0)("span", { children: [
									"ôn sau ",
									reviewAgeDays,
									" ngày"
								] }, void 0, true, {
									fileName: _jsxFileName$15,
									lineNumber: 81,
									columnNumber: 26
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "inline-flex items-center rounded-md bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 font-semibold text-amber-700",
									children: [
										"+",
										lesson.xp,
										" XP"
									]
								}, void 0, true, {
									fileName: _jsxFileName$15,
									lineNumber: 82,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName$15,
							lineNumber: 72,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "mt-2.5 space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex items-center justify-between text-[11px] font-medium text-slate-600",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Tiến độ bài học:" }, void 0, false, {
									fileName: _jsxFileName$15,
									lineNumber: 90,
									columnNumber: 17
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: cn("font-bold", done || percent >= 100 ? "text-emerald-700" : "text-sky-800"),
									children: [
										completedDuration,
										" / ",
										totalDuration,
										" phút (",
										percent,
										"%)"
									]
								}, void 0, true, {
									fileName: _jsxFileName$15,
									lineNumber: 91,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$15,
								lineNumber: 89,
								columnNumber: 15
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "h-1.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/60",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: cn("h-full rounded-full transition-all duration-500", done || percent >= 100 ? "bg-emerald-500" : percent > 0 ? "bg-gradient-to-r from-sky-500 to-teal-500" : "bg-slate-200"),
									style: { width: `${percent}%` }
								}, void 0, false, {
									fileName: _jsxFileName$15,
									lineNumber: 96,
									columnNumber: 17
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$15,
								lineNumber: 95,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$15,
							lineNumber: 88,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$15,
					lineNumber: 63,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$15,
				lineNumber: 48,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LessonActionMenu, {
				onStart,
				onManualEntry,
				disabled: done,
				tone: review ? "amber" : "sky",
				completedMinutes: completedDuration,
				remainingMinutes
			}, void 0, false, {
				fileName: _jsxFileName$15,
				lineNumber: 111,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$15,
			lineNumber: 47,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$15,
		lineNumber: 40,
		columnNumber: 5
	}, this);
}
var _jsxFileName$14 = "/app/applet/src/components/TodayPanel.tsx";
function StudyStreakBadge({ streak }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PopoverTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
			type: "button",
			title: "Học ít nhất 1 bài hoặc hoàn thành 25 phút Pomodoro mỗi ngày để giữ chuỗi!",
			"aria-label": `Chuỗi học: ${streak} ngày liên tiếp`,
			className: "inline-flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-gradient-to-r from-amber-50 to-orange-50 px-3.5 py-2 text-xs sm:text-sm font-medium text-amber-900 shadow-2xs transition hover:border-amber-300 hover:bg-amber-100/90 focus:outline-none focus:ring-2 focus:ring-amber-400/50 cursor-pointer shrink-0 self-start sm:self-auto",
			children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: [
				"🔥 ",
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("strong", {
					className: "font-bold text-orange-600",
					children: streak
				}, void 0, false, {
					fileName: _jsxFileName$14,
					lineNumber: 36,
					columnNumber: 16
				}, this),
				" ngày liên tiếp"
			] }, void 0, true, {
				fileName: _jsxFileName$14,
				lineNumber: 35,
				columnNumber: 11
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName$14,
			lineNumber: 29,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$14,
		lineNumber: 28,
		columnNumber: 7
	}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PopoverContent, {
		side: "bottom",
		align: "start",
		className: "w-72 rounded-2xl border border-amber-200 bg-amber-50/95 p-3.5 text-xs text-amber-950 shadow-lg backdrop-blur z-50",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "flex items-start gap-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "rounded-xl bg-orange-100 p-2 text-lg leading-none shrink-0",
				children: "🔥"
			}, void 0, false, {
				fileName: _jsxFileName$14,
				lineNumber: 46,
				columnNumber: 11
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "font-semibold text-orange-950 text-sm",
					children: "Chuỗi học (Study Streak)"
				}, void 0, false, {
					fileName: _jsxFileName$14,
					lineNumber: 48,
					columnNumber: 13
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "text-slate-700 leading-relaxed",
					children: "Học ít nhất 1 bài hoặc hoàn thành 25 phút Pomodoro mỗi ngày để giữ chuỗi!"
				}, void 0, false, {
					fileName: _jsxFileName$14,
					lineNumber: 49,
					columnNumber: 13
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$14,
				lineNumber: 47,
				columnNumber: 11
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$14,
			lineNumber: 45,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$14,
		lineNumber: 40,
		columnNumber: 7
	}, this)] }, void 0, true, {
		fileName: _jsxFileName$14,
		lineNumber: 27,
		columnNumber: 5
	}, this);
}
function TodayPanel({ state, subjects = SUBJECTS, onToggleLesson, onSetTodayHours, onAddStudySession, onStartFocus, onSubjectsUpdated, onOpenRoadmapImport, habitSidebar }) {
	const today = todayISO();
	const studyStreak = (0, import_react.useMemo)(() => computeStudyStreak(state), [state]);
	const [manualEntry, setManualEntry] = (0, import_react.useState)(null);
	const queue = (0, import_react.useMemo)(() => pickTodayQueue({
		subjects,
		completed: state.completedLessons,
		meta: state.studyMeta,
		settings: state.plannerSettings
	}), [
		subjects,
		state.completedLessons,
		state.studyMeta,
		state.plannerSettings
	]);
	const sortedNewLessons = (0, import_react.useMemo)(() => sortLessonsBySubjectPriority(queue.newLessons), [queue.newLessons]);
	const workspaceLessonCount = (0, import_react.useMemo)(() => subjects.reduce((total, subject) => total + subject.milestones.reduce((sum, milestone) => sum + milestone.lessons.length, 0), 0), [subjects]);
	const remainingIds = (0, import_react.useMemo)(() => allRemainingLessonIds(subjects, state.completedLessons), [subjects, state.completedLessons]);
	const doneToday = (0, import_react.useMemo)(() => Object.values(state.completedLessons).filter((date) => date === today).length, [state.completedLessons, today]);
	const totalTodayQueue = (0, import_react.useMemo)(() => {
		const uncompletedNew = queue.newLessons.filter((lesson) => !state.completedLessons[lesson.id]).length;
		return doneToday + uncompletedNew;
	}, [
		doneToday,
		queue.newLessons,
		state.completedLessons
	]);
	const progressPercent = (0, import_react.useMemo)(() => {
		if (totalTodayQueue === 0) return 0;
		return Math.min(100, Math.round(doneToday / totalTodayQueue * 100));
	}, [doneToday, totalTodayQueue]);
	const prioritizedLesson = (0, import_react.useMemo)(() => {
		const lesson = sortedNewLessons.find((item) => !state.completedLessons[item.id]);
		if (lesson) return {
			lesson,
			minutes: estimateLessonMinutes(lesson.id, state.studyMeta, subjects),
			reason: `Bài mới phù hợp với quỹ ${queue.quotaMinutes} phút hôm nay.`
		};
		const review = queue.reviewLessons[0];
		const reviewLesson = review ? findLessonById(review.lessonId, subjects) : void 0;
		if (!review || !reviewLesson) return null;
		return {
			lesson: reviewLesson,
			minutes: review.minutes,
			reason: `Bài ôn đến hạn sau ${review.ageDays} ngày.`
		};
	}, [
		queue.quotaMinutes,
		queue.reviewLessons,
		sortedNewLessons,
		state.completedLessons,
		state.studyMeta,
		subjects
	]);
	const openTimer = (lesson, minutes) => {
		onStartFocus({
			id: lesson.id,
			title: lesson.title,
			xp: lesson.xp,
			isCompleted: Boolean(state.completedLessons[lesson.id]),
			initialMinutes: minutes
		});
	};
	const openManualEntry = (lesson, estimatedMinutes) => {
		setManualEntry({
			lessonId: lesson.id,
			lessonTitle: lesson.title,
			estimatedMinutes
		});
	};
	if (workspaceLessonCount === 0) return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
		id: "today-panel-root",
		className: "min-w-0 space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
				className: "font-serif text-2xl font-bold text-slate-900",
				children: "Hôm nay"
			}, void 0, false, {
				fileName: _jsxFileName$14,
				lineNumber: 174,
				columnNumber: 13
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
				className: "mt-0.5 text-sm text-slate-500",
				children: displayDate(today)
			}, void 0, false, {
				fileName: _jsxFileName$14,
				lineNumber: 175,
				columnNumber: 13
			}, this)] }, void 0, true, {
				fileName: _jsxFileName$14,
				lineNumber: 173,
				columnNumber: 11
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(StudyStreakBadge, { streak: studyStreak }, void 0, false, {
				fileName: _jsxFileName$14,
				lineNumber: 177,
				columnNumber: 11
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$14,
			lineNumber: 172,
			columnNumber: 9
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
			className: "rounded-2xl border border-dashed border-sky-300 bg-sky-50/70 p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
					className: "font-serif text-xl font-semibold text-slate-900",
					children: "Không gian học tập đang trống"
				}, void 0, false, {
					fileName: _jsxFileName$14,
					lineNumber: 180,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "mt-2 max-w-xl text-sm text-slate-600",
					children: "Thêm bài học đầu tiên hoặc nhập lộ trình để hệ thống tạo kế hoạch theo quỹ giờ của bạn."
				}, void 0, false, {
					fileName: _jsxFileName$14,
					lineNumber: 183,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mt-4 flex flex-wrap gap-3",
					children: [onSubjectsUpdated && /* @__PURE__ */ (void 0)(AddLessonModal, {
						currentSubjects: subjects,
						onSubjectsUpdated,
						trigger: /* @__PURE__ */ (void 0)("button", {
							className: "inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-emerald-700",
							children: [/* @__PURE__ */ (void 0)(Play, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$14,
								lineNumber: 193,
								columnNumber: 21
							}, this), " Thêm bài đầu tiên"]
						}, void 0, true, {
							fileName: _jsxFileName$14,
							lineNumber: 192,
							columnNumber: 19
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName$14,
						lineNumber: 188,
						columnNumber: 15
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						type: "button",
						onClick: onOpenRoadmapImport,
						className: "inline-flex min-h-11 items-center rounded-xl border border-sky-300 bg-white px-4 py-2 text-sm font-semibold text-sky-800 transition hover:bg-sky-50",
						children: "Nhập lộ trình"
					}, void 0, false, {
						fileName: _jsxFileName$14,
						lineNumber: 198,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$14,
					lineNumber: 186,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName$14,
			lineNumber: 179,
			columnNumber: 9
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$14,
		lineNumber: 171,
		columnNumber: 7
	}, this);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
		id: "today-panel-root",
		className: "min-w-0 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between pb-4 border-b border-slate-100",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
							className: "font-serif text-2xl font-bold text-slate-900",
							children: "Hôm nay"
						}, void 0, false, {
							fileName: _jsxFileName$14,
							lineNumber: 218,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: "mt-0.5 text-sm text-slate-500",
							children: displayDate(today)
						}, void 0, false, {
							fileName: _jsxFileName$14,
							lineNumber: 219,
							columnNumber: 13
						}, this)] }, void 0, true, {
							fileName: _jsxFileName$14,
							lineNumber: 217,
							columnNumber: 11
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex flex-col sm:flex-row sm:items-center gap-3 w-full xl:w-auto xl:max-w-3xl",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(StudyStreakBadge, { streak: studyStreak }, void 0, false, {
								fileName: _jsxFileName$14,
								lineNumber: 222,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "grid w-full gap-2 rounded-xl border border-sky-100 bg-sky-50/60 p-2.5 sm:grid-cols-[auto_minmax(150px,1fr)_72px] sm:items-center flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Clock, { className: "h-4 w-4 text-sky-600" }, void 0, false, {
											fileName: _jsxFileName$14,
											lineNumber: 226,
											columnNumber: 17
										}, this), " Quỹ giờ hôm nay"]
									}, void 0, true, {
										fileName: _jsxFileName$14,
										lineNumber: 225,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Slider, {
										value: [state.plannerSettings.todayHours],
										min: 0,
										max: 12,
										step: .5,
										onValueChange: ([value]) => onSetTodayHours(value)
									}, void 0, false, {
										fileName: _jsxFileName$14,
										lineNumber: 228,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
										type: "number",
										"aria-label": "Số giờ học hôm nay",
										min: 0,
										max: 12,
										step: .5,
										value: state.plannerSettings.todayHours,
										onChange: (event) => {
											const value = Number(event.target.value);
											if (Number.isFinite(value)) onSetTodayHours(Math.min(12, Math.max(0, value)));
										},
										className: "h-9 bg-white text-xs sm:text-sm font-bold text-slate-800"
									}, void 0, false, {
										fileName: _jsxFileName$14,
										lineNumber: 235,
										columnNumber: 15
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$14,
								lineNumber: 224,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$14,
							lineNumber: 221,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$14,
						lineNumber: 216,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(KpiCard, {
								icon: CircleCheck,
								iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-200/60",
								label: "Hoàn thành hôm nay",
								value: doneToday
							}, void 0, false, {
								fileName: _jsxFileName$14,
								lineNumber: 254,
								columnNumber: 11
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(KpiCard, {
								icon: BookOpen,
								iconBg: "bg-sky-50 text-sky-600 border border-sky-200/60",
								label: "Bài mới trong quỹ",
								value: queue.newLessons.filter((lesson) => !state.completedLessons[lesson.id]).length
							}, void 0, false, {
								fileName: _jsxFileName$14,
								lineNumber: 260,
								columnNumber: 11
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(KpiCard, {
								icon: Clock,
								iconBg: "bg-amber-50 text-amber-600 border border-amber-200/60",
								label: "Bài ôn đến hạn",
								value: queue.reviewLessons.length
							}, void 0, false, {
								fileName: _jsxFileName$14,
								lineNumber: 266,
								columnNumber: 11
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(KpiCard, {
								icon: Target,
								iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-200/60",
								label: "Còn lại toàn lộ trình",
								value: remainingIds.length
							}, void 0, false, {
								fileName: _jsxFileName$14,
								lineNumber: 272,
								columnNumber: 11
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$14,
						lineNumber: 253,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex items-center justify-between text-xs font-semibold text-slate-700",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleCheck, { className: "h-4 w-4 text-emerald-500" }, void 0, false, {
									fileName: _jsxFileName$14,
									lineNumber: 284,
									columnNumber: 15
								}, this), "Tiến độ bài học hôm nay"]
							}, void 0, true, {
								fileName: _jsxFileName$14,
								lineNumber: 283,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "text-emerald-700 font-bold",
								children: [
									progressPercent,
									"% (",
									doneToday,
									"/",
									totalTodayQueue,
									" bài)"
								]
							}, void 0, true, {
								fileName: _jsxFileName$14,
								lineNumber: 287,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$14,
							lineNumber: 282,
							columnNumber: 11
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "h-2.5 overflow-hidden rounded-full bg-slate-100",
							role: "progressbar",
							"aria-label": "Tiến độ bài học hôm nay",
							"aria-valuemin": 0,
							"aria-valuemax": Math.max(totalTodayQueue, 1),
							"aria-valuenow": doneToday,
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "h-full rounded-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 transition-all duration-500",
								style: { width: `${progressPercent}%` }
							}, void 0, false, {
								fileName: _jsxFileName$14,
								lineNumber: 297,
								columnNumber: 13
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$14,
							lineNumber: 289,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$14,
						lineNumber: 281,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "pt-1",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
							className: "rounded-xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-sky-50/40 p-3.5 sm:p-4",
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "min-w-0 space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Sparkles, { className: "h-3.5 w-3.5 text-emerald-600" }, void 0, false, {
											fileName: _jsxFileName$14,
											lineNumber: 310,
											columnNumber: 19
										}, this), "Ưu tiên tiếp theo"]
									}, void 0, true, {
										fileName: _jsxFileName$14,
										lineNumber: 309,
										columnNumber: 17
									}, this), prioritizedLesson ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
										className: "break-words font-serif text-lg sm:text-xl font-bold text-slate-900",
										children: prioritizedLesson.lesson.title
									}, void 0, false, {
										fileName: _jsxFileName$14,
										lineNumber: 315,
										columnNumber: 21
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
										className: "text-xs sm:text-sm text-slate-700",
										children: [
											prioritizedLesson.reason,
											" Dự kiến ",
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("strong", {
												className: "font-semibold text-emerald-800",
												children: [prioritizedLesson.minutes, " phút"]
											}, void 0, true, {
												fileName: _jsxFileName$14,
												lineNumber: 319,
												columnNumber: 58
											}, this),
											"."
										]
									}, void 0, true, {
										fileName: _jsxFileName$14,
										lineNumber: 318,
										columnNumber: 21
									}, this)] }, void 0, true, {
										fileName: _jsxFileName$14,
										lineNumber: 314,
										columnNumber: 19
									}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
										className: "font-serif text-lg sm:text-xl font-bold text-slate-900",
										children: "Đã xử lý hết hàng đợi hôm nay! 🎉"
									}, void 0, false, {
										fileName: _jsxFileName$14,
										lineNumber: 324,
										columnNumber: 21
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
										className: "text-xs sm:text-sm text-slate-700",
										children: "Điều chỉnh quỹ giờ hoặc mở kế hoạch để xem các bài tiếp theo."
									}, void 0, false, {
										fileName: _jsxFileName$14,
										lineNumber: 327,
										columnNumber: 21
									}, this)] }, void 0, true, {
										fileName: _jsxFileName$14,
										lineNumber: 323,
										columnNumber: 19
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$14,
									lineNumber: 308,
									columnNumber: 15
								}, this), prioritizedLesson && /* @__PURE__ */ (void 0)("div", {
									className: "shrink-0 self-start sm:self-center",
									children: /* @__PURE__ */ (void 0)(LessonActionMenu, {
										tone: "emerald",
										completedMinutes: getLessonCompletedMinutes(prioritizedLesson.lesson.id, state),
										remainingMinutes: Math.max(0, (prioritizedLesson.lesson.plannedDurationMinutes ?? 120) - getLessonCompletedMinutes(prioritizedLesson.lesson.id, state)),
										onStart: (minutes) => openTimer(prioritizedLesson.lesson, minutes),
										onManualEntry: () => openManualEntry(prioritizedLesson.lesson, prioritizedLesson.minutes)
									}, void 0, false, {
										fileName: _jsxFileName$14,
										lineNumber: 335,
										columnNumber: 19
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName$14,
									lineNumber: 334,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$14,
								lineNumber: 307,
								columnNumber: 13
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$14,
							lineNumber: 306,
							columnNumber: 11
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName$14,
						lineNumber: 305,
						columnNumber: 9
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName$14,
				lineNumber: 214,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "lg:col-span-8",
					children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex flex-col gap-3 pb-3 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
										className: "font-serif text-lg sm:text-xl font-bold text-slate-900",
										children: "Danh sách bài học"
									}, void 0, false, {
										fileName: _jsxFileName$14,
										lineNumber: 359,
										columnNumber: 17
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-600 border border-sky-200/60",
										children: [sortedNewLessons.length + queue.reviewLessons.length, " bài"]
									}, void 0, true, {
										fileName: _jsxFileName$14,
										lineNumber: 360,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$14,
									lineNumber: 358,
									columnNumber: 15
								}, this), onSubjectsUpdated && /* @__PURE__ */ (void 0)("div", {
									className: "shrink-0",
									children: /* @__PURE__ */ (void 0)(AddLessonModal, {
										currentSubjects: subjects,
										onSubjectsUpdated
									}, void 0, false, {
										fileName: _jsxFileName$14,
										lineNumber: 366,
										columnNumber: 19
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName$14,
									lineNumber: 365,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$14,
								lineNumber: 357,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LessonSubSection, {
								title: "Bài mới",
								count: sortedNewLessons.length,
								empty: "Quỹ giờ hiện tại chưa phân bổ bài mới.",
								children: sortedNewLessons.map((lesson) => {
									const position = findLessonPosition(subjects, lesson.id);
									const estimated = estimateLessonMinutes(lesson.id, state.studyMeta, subjects);
									const topic = lesson.topic || (position?.milestone !== "Toàn bộ bài học" ? position?.milestone : void 0);
									const completedMins = getLessonCompletedMinutes(lesson.id, state);
									return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TodayLessonCard, {
										lesson,
										done: Boolean(state.completedLessons[lesson.id]),
										estimatedMinutes: estimated,
										completedMinutes: completedMins,
										plannedMinutes: lesson.plannedDurationMinutes ?? 120,
										subjectLabel: `${position?.subject.emoji ?? "📚"} ${position?.subject.name ?? lesson.sourceSubject}`,
										topicLabel: topic,
										onToggle: () => onToggleLesson(lesson.id, lesson.xp),
										onStart: (minutes) => openTimer(lesson, minutes),
										onManualEntry: () => openManualEntry(lesson, estimated)
									}, lesson.id, false, {
										fileName: _jsxFileName$14,
										lineNumber: 385,
										columnNumber: 19
									}, this);
								})
							}, void 0, false, {
								fileName: _jsxFileName$14,
								lineNumber: 372,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("hr", { className: "border-slate-100" }, void 0, false, {
								fileName: _jsxFileName$14,
								lineNumber: 403,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LessonSubSection, {
								title: "Ôn tập đến hạn",
								count: queue.reviewLessons.length,
								empty: "Không có bài ôn đến hạn hôm nay.",
								children: queue.reviewLessons.map((review) => {
									const lesson = findLessonById(review.lessonId, subjects);
									if (!lesson) return null;
									const position = findLessonPosition(subjects, lesson.id);
									const topic = lesson.topic || (position?.milestone !== "Toàn bộ bài học" ? position?.milestone : void 0);
									const completedMins = getLessonCompletedMinutes(lesson.id, state);
									return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TodayLessonCard, {
										lesson,
										done: Boolean(state.completedLessons[lesson.id]),
										estimatedMinutes: review.minutes,
										completedMinutes: completedMins,
										plannedMinutes: lesson.plannedDurationMinutes ?? 120,
										reviewAgeDays: review.ageDays,
										subjectLabel: `${position?.subject.emoji ?? "📚"} ${position?.subject.name ?? lesson.sourceSubject}`,
										topicLabel: topic,
										onToggle: () => onToggleLesson(lesson.id, lesson.xp),
										onStart: (minutes) => openTimer(lesson, minutes),
										onManualEntry: () => openManualEntry(lesson, review.minutes)
									}, lesson.id, false, {
										fileName: _jsxFileName$14,
										lineNumber: 420,
										columnNumber: 19
									}, this);
								})
							}, void 0, false, {
								fileName: _jsxFileName$14,
								lineNumber: 406,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$14,
						lineNumber: 355,
						columnNumber: 11
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName$14,
					lineNumber: 354,
					columnNumber: 9
				}, this), habitSidebar && /* @__PURE__ */ (void 0)("div", {
					className: "lg:col-span-4 lg:sticky lg:top-4 self-start",
					children: habitSidebar
				}, void 0, false, {
					fileName: _jsxFileName$14,
					lineNumber: 442,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$14,
				lineNumber: 352,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ManualStudyDialog, {
				request: manualEntry,
				onClose: () => setManualEntry(null),
				onAddStudySession
			}, void 0, false, {
				fileName: _jsxFileName$14,
				lineNumber: 448,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$14,
		lineNumber: 212,
		columnNumber: 5
	}, this);
}
function LessonSubSection({ title, count, empty, children }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "h-2 w-2 rounded-full bg-sky-500" }, void 0, false, {
					fileName: _jsxFileName$14,
					lineNumber: 472,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
					className: "text-xs font-bold uppercase tracking-wider text-slate-700",
					children: title
				}, void 0, false, {
					fileName: _jsxFileName$14,
					lineNumber: 473,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$14,
				lineNumber: 471,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
				className: "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 border border-slate-200/60",
				children: count
			}, void 0, false, {
				fileName: _jsxFileName$14,
				lineNumber: 475,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$14,
			lineNumber: 470,
			columnNumber: 7
		}, this), count > 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ul", {
			className: "grid gap-2",
			children
		}, void 0, false, {
			fileName: _jsxFileName$14,
			lineNumber: 480,
			columnNumber: 9
		}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "rounded-xl border border-dashed border-slate-200 p-3.5 text-center text-xs text-slate-500",
			children: empty
		}, void 0, false, {
			fileName: _jsxFileName$14,
			lineNumber: 482,
			columnNumber: 9
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$14,
		lineNumber: 469,
		columnNumber: 5
	}, this);
}
function KpiCard({ icon: Icon, iconBg, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "flex items-center gap-3 rounded-xl bg-slate-50/80 p-3 border border-slate-100/80",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", iconBg),
			children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Icon, { className: "h-5 w-5" }, void 0, false, {
				fileName: _jsxFileName$14,
				lineNumber: 504,
				columnNumber: 9
			}, this)
		}, void 0, false, {
			fileName: _jsxFileName$14,
			lineNumber: 503,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
				className: "text-xl font-bold text-slate-900 leading-none",
				children: value
			}, void 0, false, {
				fileName: _jsxFileName$14,
				lineNumber: 507,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
				className: "mt-1 text-[11px] font-medium leading-tight text-slate-500",
				children: label
			}, void 0, false, {
				fileName: _jsxFileName$14,
				lineNumber: 508,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$14,
			lineNumber: 506,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$14,
		lineNumber: 502,
		columnNumber: 5
	}, this);
}
var _jsxFileName$13 = "/app/applet/src/components/FlexiblePlanner.tsx";
function FlexiblePlanner({ state, subjects = SUBJECTS, onSetDayHours }) {
	const [numWeeks, setNumWeeks] = (0, import_react.useState)(2);
	const [userToggledWeeks, setUserToggledWeeks] = (0, import_react.useState)({});
	const today = todayISO();
	const horizonDays = (0, import_react.useMemo)(() => {
		const sunday = getSundayISO(today);
		return daysBetweenISO(today, sunday) + 1 + (numWeeks - 1) * 7;
	}, [today, numWeeks]);
	const days = (0, import_react.useMemo)(() => buildFlexiblePlan({
		subjects,
		completed: state.completedLessons,
		meta: state.studyMeta,
		settings: state.plannerSettings,
		fromISO: today,
		horizonDays
	}), [
		subjects,
		state.completedLessons,
		state.studyMeta,
		state.plannerSettings,
		today,
		horizonDays
	]);
	const weeks = (0, import_react.useMemo)(() => {
		const groups = [];
		for (const day of days) {
			if (groups.length === 0 || weekdayVi(day.dateISO) === "T2") groups.push({
				id: day.dateISO,
				number: groups.length + 1,
				startISO: day.dateISO,
				endISO: getSundayISO(day.dateISO),
				days: []
			});
			groups.at(-1)?.days.push(day);
		}
		return groups;
	}, [days]);
	const displayLessonsForDay = (day) => {
		const items = [];
		for (const lesson of sortLessonsBySubjectPriority(day.queue.newLessons)) {
			const position = findLessonPosition(subjects, lesson.id);
			items.push({
				id: lesson.id,
				lesson,
				subjectId: position?.subject.id ?? "unknown",
				subjectName: position?.subject.name ?? lesson.sourceSubject,
				subjectEmoji: position?.subject.emoji ?? "📚",
				topic: lesson.topic || (position?.milestone && position.milestone !== "Toàn bộ bài học" ? position.milestone : "")
			});
		}
		for (const review of day.queue.reviewLessons) {
			const lesson = findLessonById(review.lessonId, subjects);
			if (!lesson) continue;
			const position = findLessonPosition(subjects, lesson.id);
			items.push({
				id: `review-${lesson.id}`,
				lesson,
				subjectId: position?.subject.id ?? "unknown",
				subjectName: position?.subject.name ?? lesson.sourceSubject,
				subjectEmoji: position?.subject.emoji ?? "📚",
				topic: lesson.topic || (position?.milestone && position.milestone !== "Toàn bộ bài học" ? position.milestone : ""),
				reviewAgeDays: review.ageDays
			});
		}
		return items;
	};
	const toggleWeek = (id, isCurrentlyCollapsed) => {
		setUserToggledWeeks((prev) => ({
			...prev,
			[id]: !isCurrentlyCollapsed
		}));
	};
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
		className: "min-w-0 space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "space-y-3",
			children: weeks.map((week, idx) => {
				const collapsed = userToggledWeeks[week.id] !== void 0 ? userToggledWeeks[week.id] : idx > 0;
				return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
					className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						type: "button",
						onClick: () => toggleWeek(week.id, collapsed),
						"aria-expanded": !collapsed,
						className: "flex min-h-14 w-full items-center gap-3 bg-gradient-to-r from-emerald-50/90 via-sky-50/50 to-white px-4 py-3 text-left transition hover:brightness-[0.98]",
						children: [
							collapsed ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ChevronRight, { className: "h-5 w-5 shrink-0 text-emerald-700" }, void 0, false, {
								fileName: _jsxFileName$13,
								lineNumber: 147,
								columnNumber: 19
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ChevronDown, { className: "h-5 w-5 shrink-0 text-emerald-700" }, void 0, false, {
								fileName: _jsxFileName$13,
								lineNumber: 149,
								columnNumber: 19
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
										className: "font-bold text-slate-900 text-base",
										children: ["Tuần ", week.number]
									}, void 0, true, {
										fileName: _jsxFileName$13,
										lineNumber: 153,
										columnNumber: 21
									}, this), idx === 0 && /* @__PURE__ */ (void 0)("span", {
										className: "rounded-full bg-emerald-600 px-2 py-0.2 text-[10px] font-bold text-white",
										children: "Tuần này"
									}, void 0, false, {
										fileName: _jsxFileName$13,
										lineNumber: 155,
										columnNumber: 23
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$13,
									lineNumber: 152,
									columnNumber: 19
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
									className: "truncate text-xs text-slate-500 font-medium",
									children: [
										weekdayVi(week.startISO),
										" ",
										displayDate(week.startISO),
										" → CN",
										" ",
										displayDate(week.endISO)
									]
								}, void 0, true, {
									fileName: _jsxFileName$13,
									lineNumber: 160,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$13,
								lineNumber: 151,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200/80 shadow-2xs",
								children: [week.days.length, " ngày"]
							}, void 0, true, {
								fileName: _jsxFileName$13,
								lineNumber: 165,
								columnNumber: 17
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$13,
						lineNumber: 140,
						columnNumber: 15
					}, this), !collapsed && /* @__PURE__ */ (void 0)("div", {
						className: "grid gap-3 p-3.5 lg:grid-cols-2",
						children: week.days.map((day) => /* @__PURE__ */ (void 0)(PlanDayCard, {
							day,
							today,
							lessons: displayLessonsForDay(day),
							onSetDayHours
						}, day.dateISO, false, {
							fileName: _jsxFileName$13,
							lineNumber: 173,
							columnNumber: 21
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName$13,
						lineNumber: 171,
						columnNumber: 17
					}, this)]
				}, week.id, true, {
					fileName: _jsxFileName$13,
					lineNumber: 136,
					columnNumber: 13
				}, this);
			})
		}, void 0, false, {
			fileName: _jsxFileName$13,
			lineNumber: 129,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "mt-4 flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between px-1",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: [
				"Hiển thị ",
				numWeeks,
				" tuần · ",
				days.length,
				" ngày · đến",
				" ",
				displayDate(days.at(-1)?.dateISO ?? today)
			] }, void 0, true, {
				fileName: _jsxFileName$13,
				lineNumber: 189,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "grid grid-cols-3 gap-1.5 sm:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						className: "min-h-9 rounded-lg border border-slate-200 bg-white px-2.5 font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs",
						onClick: () => setNumWeeks((value) => Math.max(1, value - 1)),
						children: "− 1 tuần"
					}, void 0, false, {
						fileName: _jsxFileName$13,
						lineNumber: 194,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						className: "min-h-9 rounded-lg border border-slate-200 bg-white px-2.5 font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs",
						onClick: () => setNumWeeks((value) => Math.min(52, value + 1)),
						children: "+ 1 tuần"
					}, void 0, false, {
						fileName: _jsxFileName$13,
						lineNumber: 200,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("select", {
						"aria-label": "Số tuần hiển thị",
						value: numWeeks,
						onChange: (event) => setNumWeeks(Number(event.target.value)),
						className: "min-h-9 rounded-lg border border-slate-200 bg-white px-2 font-semibold text-slate-700 shadow-2xs",
						children: [
							1,
							2,
							4,
							8,
							12,
							16,
							24,
							36,
							52
						].map((weeksCount) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
							value: weeksCount,
							children: [weeksCount, " tuần"]
						}, weeksCount, true, {
							fileName: _jsxFileName$13,
							lineNumber: 213,
							columnNumber: 15
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName$13,
						lineNumber: 206,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName$13,
				lineNumber: 193,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$13,
			lineNumber: 188,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$13,
		lineNumber: 127,
		columnNumber: 5
	}, this);
}
function PlanDayCard({ day, today, lessons, onSetDayHours }) {
	const isToday = day.dateISO === today;
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("article", {
		className: cn("min-w-0 rounded-xl p-3.5 space-y-2.5 border transition-colors", isToday ? "bg-emerald-50/50 border-emerald-200/80" : "bg-slate-50/70 border-slate-200/70"),
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("header", {
			className: "space-y-1",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex items-center gap-2 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h4", {
						className: "font-bold text-slate-900 text-sm truncate",
						children: [
							weekdayVi(day.dateISO),
							" - ",
							displayDate(day.dateISO)
						]
					}, void 0, true, {
						fileName: _jsxFileName$13,
						lineNumber: 247,
						columnNumber: 13
					}, this), isToday && /* @__PURE__ */ (void 0)("span", {
						className: "rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shrink-0",
						children: "Hôm nay"
					}, void 0, false, {
						fileName: _jsxFileName$13,
						lineNumber: 251,
						columnNumber: 15
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$13,
					lineNumber: 246,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", {
					className: "flex items-center gap-1.5 text-xs font-medium text-slate-600 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
						type: "number",
						"aria-label": `Giờ học ngày ${displayDate(day.dateISO)}`,
						min: 0,
						max: 12,
						step: .5,
						value: day.hours,
						onChange: (event) => {
							const value = Number(event.target.value);
							if (Number.isFinite(value)) onSetDayHours(day.dateISO, Math.min(12, Math.max(0, value)));
						},
						className: "h-7 w-16 text-center text-xs font-bold bg-white border-slate-200 px-1 rounded-lg"
					}, void 0, false, {
						fileName: _jsxFileName$13,
						lineNumber: 257,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "giờ" }, void 0, false, {
						fileName: _jsxFileName$13,
						lineNumber: 271,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$13,
					lineNumber: 256,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$13,
				lineNumber: 245,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
				className: "text-[11px] text-slate-500 font-medium",
				children: [
					"⏱️ Công suất: ",
					day.queue.quotaMinutes,
					"p •",
					" ",
					day.queue.overloadMinutes > 0 ? `Quá: ${day.queue.overloadMinutes}p` : `Dự phòng: ${day.queue.unallocatedMinutes}p`
				]
			}, void 0, true, {
				fileName: _jsxFileName$13,
				lineNumber: 276,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$13,
			lineNumber: 243,
			columnNumber: 7
		}, this), lessons.length > 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ul", {
			className: "space-y-2 pt-0.5",
			children: lessons.map((item) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", {
				className: cn("rounded-lg border bg-white p-3 text-xs transition-colors hover:border-emerald-400", item.reviewAgeDays ? "border-amber-200/90 bg-amber-50/40" : "border-slate-200/80 bg-white"),
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "break-words font-medium text-slate-900 leading-snug",
						children: [item.reviewAgeDays ? "↻ " : "", item.lesson.title]
					}, void 0, true, {
						fileName: _jsxFileName$13,
						lineNumber: 298,
						columnNumber: 17
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 shrink-0",
						children: [
							item.subjectEmoji,
							" ",
							item.subjectName
						]
					}, void 0, true, {
						fileName: _jsxFileName$13,
						lineNumber: 302,
						columnNumber: 17
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$13,
					lineNumber: 297,
					columnNumber: 15
				}, this), (item.topic || item.reviewAgeDays) && /* @__PURE__ */ (void 0)("div", {
					className: "mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]",
					children: [item.topic && /* @__PURE__ */ (void 0)("span", {
						className: "rounded bg-slate-100/80 px-1.5 py-0.5 text-slate-600 font-medium",
						children: item.topic
					}, void 0, false, {
						fileName: _jsxFileName$13,
						lineNumber: 309,
						columnNumber: 21
					}, this), item.reviewAgeDays && /* @__PURE__ */ (void 0)("span", {
						className: "text-amber-800 font-medium",
						children: [
							"ôn sau ",
							item.reviewAgeDays,
							" ngày"
						]
					}, void 0, true, {
						fileName: _jsxFileName$13,
						lineNumber: 314,
						columnNumber: 21
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$13,
					lineNumber: 307,
					columnNumber: 17
				}, this)]
			}, item.id, true, {
				fileName: _jsxFileName$13,
				lineNumber: 288,
				columnNumber: 13
			}, this))
		}, void 0, false, {
			fileName: _jsxFileName$13,
			lineNumber: 286,
			columnNumber: 9
		}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "rounded-lg border border-dashed border-slate-300 p-3 text-center text-xs text-slate-500 font-medium",
			children: "Không có bài được phân bổ."
		}, void 0, false, {
			fileName: _jsxFileName$13,
			lineNumber: 324,
			columnNumber: 9
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$13,
		lineNumber: 237,
		columnNumber: 5
	}, this);
}
var _jsxFileName$12 = "/app/applet/src/components/ForecastCard.tsx";
function ForecastCard({ state, subjects = SUBJECTS, onSetDefaultDailyHours, shiftedDates }) {
	const hours = Number.isFinite(state.plannerSettings.defaultDailyHours) ? Math.max(0, state.plannerSettings.defaultDailyHours) : 2;
	const handleHoursChange = (h) => {
		if (onSetDefaultDailyHours) onSetDefaultDailyHours(h);
	};
	const remainingIds = (0, import_react.useMemo)(() => allRemainingLessonIds(subjects, state.completedLessons), [subjects, state.completedLessons]);
	const latestShiftedDate = (0, import_react.useMemo)(() => {
		if (!shiftedDates) return null;
		const dates = Object.values(shiftedDates);
		if (dates.length === 0) return null;
		dates.sort();
		return dates[dates.length - 1];
	}, [shiftedDates]);
	const fc = (0, import_react.useMemo)(() => forecast({
		remainingLessonIds: remainingIds,
		meta: state.studyMeta,
		subjects,
		hoursPerDay: hours
	}), [
		remainingIds,
		state.studyMeta,
		subjects,
		hours
	]);
	const remainingBySubject = (0, import_react.useMemo)(() => {
		return sortSubjects(subjects).map((s) => {
			const lessons = s.milestones.flatMap((m) => m.lessons);
			const total = lessons.length;
			const done = lessons.filter((l) => state.completedLessons[l.id]).length;
			return {
				subject: s,
				total,
				done,
				remaining: total - done
			};
		});
	}, [subjects, state.completedLessons]);
	const confidenceLabel = {
		insufficient: "Chưa đủ dữ liệu thực tế",
		low: "Độ tin cậy thấp",
		medium: "Độ tin cậy vừa",
		high: "Độ tin cậy cao"
	}[fc.confidence];
	const basisLabel = {
		planned: "thời lượng kế hoạch",
		mixed: "kế hoạch và phiên học thực tế",
		actual: "các phiên học thực tế"
	}[fc.basis];
	const planCompletionText = fc.remaining === 0 ? "Đã hoàn thành tất cả! 🎉" : hours <= 0 ? "Chưa có quỹ giờ để dự báo" : latestShiftedDate ? displayDate(latestShiftedDate) : fc.earliestEndDateISO === fc.latestEndDateISO ? displayDate(fc.endDateISO) : `${displayDate(fc.earliestEndDateISO)} – ${displayDate(fc.latestEndDateISO)}`;
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
		className: "min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-4.5 shadow-xs space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
					className: "font-serif text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Dự báo hoàn thành theo kế hoạch" }, void 0, false, {
						fileName: _jsxFileName$12,
						lineNumber: 98,
						columnNumber: 13
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName$12,
					lineNumber: 97,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "text-[11px] sm:text-xs text-slate-500",
					children: [
						"Tính toán theo vận tốc học đều ",
						hours,
						" giờ/ngày (6 ngày/tuần, nghỉ CN)."
					]
				}, void 0, true, {
					fileName: _jsxFileName$12,
					lineNumber: 100,
					columnNumber: 11
				}, this)] }, void 0, true, {
					fileName: _jsxFileName$12,
					lineNumber: 96,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-1.5 shrink-0 self-start sm:self-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "text-xs font-semibold text-slate-700",
							children: "Học đều"
						}, void 0, false, {
							fileName: _jsxFileName$12,
							lineNumber: 106,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Slider, {
							className: "w-24 sm:w-32",
							value: [hours],
							min: 0,
							max: 12,
							step: .5,
							onValueChange: (v) => handleHoursChange(v[0])
						}, void 0, false, {
							fileName: _jsxFileName$12,
							lineNumber: 107,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
							type: "number",
							min: 0,
							max: 12,
							step: .5,
							value: hours,
							onChange: (e) => {
								const n = Number(e.target.value);
								if (Number.isFinite(n)) handleHoursChange(Math.min(12, Math.max(0, n)));
							},
							className: "w-20 min-w-[80px] h-7 px-3 text-center text-xs font-bold rounded-lg border-slate-300 bg-white"
						}, void 0, false, {
							fileName: _jsxFileName$12,
							lineNumber: 115,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "text-xs text-slate-500 font-medium",
							children: "h/ngày"
						}, void 0, false, {
							fileName: _jsxFileName$12,
							lineNumber: 127,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$12,
					lineNumber: 105,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$12,
				lineNumber: 95,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "grid grid-cols-2 lg:grid-cols-4 gap-2 rounded-xl border border-slate-200/60 bg-slate-50/60 p-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center gap-2 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "text-base shrink-0",
							children: "🎯"
						}, void 0, false, {
							fileName: _jsxFileName$12,
							lineNumber: 134,
							columnNumber: 11
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "text-[10px] sm:text-[11px] font-medium text-slate-500",
								children: "Dự kiến hoàn thành"
							}, void 0, false, {
								fileName: _jsxFileName$12,
								lineNumber: 136,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "text-xs sm:text-sm font-bold text-emerald-700 truncate",
								children: planCompletionText
							}, void 0, false, {
								fileName: _jsxFileName$12,
								lineNumber: 137,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$12,
							lineNumber: 135,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$12,
						lineNumber: 133,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center gap-2 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "text-base shrink-0",
							children: "📚"
						}, void 0, false, {
							fileName: _jsxFileName$12,
							lineNumber: 142,
							columnNumber: 11
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "text-[10px] sm:text-[11px] font-medium text-slate-500",
								children: "Bài còn lại"
							}, void 0, false, {
								fileName: _jsxFileName$12,
								lineNumber: 144,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "text-xs sm:text-sm font-bold text-slate-800 truncate",
								children: [fc.remaining, " bài"]
							}, void 0, true, {
								fileName: _jsxFileName$12,
								lineNumber: 145,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$12,
							lineNumber: 143,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$12,
						lineNumber: 141,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center gap-2 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "text-base shrink-0",
							children: "⏱️"
						}, void 0, false, {
							fileName: _jsxFileName$12,
							lineNumber: 150,
							columnNumber: 11
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "text-[10px] sm:text-[11px] font-medium text-slate-500",
								children: "Tổng khối lượng"
							}, void 0, false, {
								fileName: _jsxFileName$12,
								lineNumber: 152,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "text-xs sm:text-sm font-bold text-slate-800 truncate",
								children: [
									fc.totalNewHours + fc.totalReviewHours,
									"h ",
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "text-[10px] font-normal text-slate-500 hidden sm:inline",
										children: [
											"(",
											fc.totalNewHours,
											"h mới + ",
											fc.totalReviewHours,
											"h ôn)"
										]
									}, void 0, true, {
										fileName: _jsxFileName$12,
										lineNumber: 154,
										columnNumber: 57
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$12,
								lineNumber: 153,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$12,
							lineNumber: 151,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$12,
						lineNumber: 149,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center gap-2 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "text-base shrink-0",
							children: "🟢"
						}, void 0, false, {
							fileName: _jsxFileName$12,
							lineNumber: 160,
							columnNumber: 11
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "text-[10px] sm:text-[11px] font-medium text-slate-500",
								children: "Mức tin cậy"
							}, void 0, false, {
								fileName: _jsxFileName$12,
								lineNumber: 162,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "text-xs sm:text-sm font-bold text-slate-800 truncate",
								children: confidenceLabel
							}, void 0, false, {
								fileName: _jsxFileName$12,
								lineNumber: 163,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$12,
							lineNumber: 161,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$12,
						lineNumber: 159,
						columnNumber: 9
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName$12,
				lineNumber: 132,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "pt-1 flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-3 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex items-center gap-1.5 text-slate-500 shrink-0 text-[11px] font-medium",
					children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Tiến độ còn lại:" }, void 0, false, {
						fileName: _jsxFileName$12,
						lineNumber: 171,
						columnNumber: 11
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName$12,
					lineNumber: 170,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "grid grid-cols-3 gap-2.5 sm:gap-3.5 shrink-0 w-full sm:w-auto sm:min-w-[380px] max-w-xl",
					children: remainingBySubject.map((item) => {
						const pct = item.total > 0 ? Math.round(item.done / item.total * 100) : 0;
						return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex items-center justify-between text-[11px]",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "truncate font-semibold text-slate-700 flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: item.subject.emoji }, void 0, false, {
										fileName: _jsxFileName$12,
										lineNumber: 180,
										columnNumber: 21
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "hidden sm:inline",
										children: item.subject.name
									}, void 0, false, {
										fileName: _jsxFileName$12,
										lineNumber: 181,
										columnNumber: 21
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$12,
									lineNumber: 179,
									columnNumber: 19
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "font-bold text-sky-700 text-[10px] sm:text-[11px] shrink-0",
									children: [
										pct,
										"% (",
										item.done,
										"/",
										item.total,
										")"
									]
								}, void 0, true, {
									fileName: _jsxFileName$12,
									lineNumber: 183,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$12,
								lineNumber: 178,
								columnNumber: 17
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "h-1.5 w-full rounded-full bg-slate-100 overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "h-full rounded-full bg-sky-500 transition-all duration-300",
									style: { width: `${pct}%` }
								}, void 0, false, {
									fileName: _jsxFileName$12,
									lineNumber: 186,
									columnNumber: 19
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$12,
								lineNumber: 185,
								columnNumber: 17
							}, this)]
						}, item.subject.id, true, {
							fileName: _jsxFileName$12,
							lineNumber: 177,
							columnNumber: 15
						}, this);
					})
				}, void 0, false, {
					fileName: _jsxFileName$12,
					lineNumber: 173,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$12,
				lineNumber: 169,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "text-[10px] italic text-slate-400 text-right pt-0.5",
				children: [
					"Ước tính dựa trên ",
					basisLabel,
					" (~",
					fc.meanMinutes,
					"p/bài)."
				]
			}, void 0, true, {
				fileName: _jsxFileName$12,
				lineNumber: 197,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$12,
		lineNumber: 93,
		columnNumber: 5
	}, this);
}
function percent(numerator, denominator) {
	if (denominator <= 0) return 0;
	return Math.max(0, Math.min(100, Math.round(numerator / denominator * 100)));
}
function nonNegative(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}
function habitOccurrenceOnDate(habit, state, dateISO) {
	const dailyTarget = habit.dailyTargets[dayIndex(dateISO)] ?? habit.target;
	if (dailyTarget <= 0) return false;
	const value = state.habitLog[dateISO]?.[habit.id];
	return habit.kind === "counter" ? typeof value === "number" && value >= dailyTarget : value === true;
}
/**
* The single weekly source of truth. It deliberately keeps lessons, habits,
* and focus time separate instead of manufacturing a combined progress score.
*/
function selectWeeklyMetrics({ state, subjects, shiftedDates = {}, referenceDateISO = todayISO() }) {
	const weekStartISO = getMondayISO(referenceDateISO);
	const dates = Array.from({ length: 7 }, (_, index) => addDaysISO(weekStartISO, index));
	const weekEndISO = dates[6];
	const weekDates = new Set(dates);
	const sortedSubjects = sortSubjects(subjects);
	const lessonSubject = /* @__PURE__ */ new Map();
	for (const subject of sortedSubjects) for (const milestone of subject.milestones) for (const lesson of milestone.lessons) lessonSubject.set(lesson.id, {
		subjectId: subject.id,
		lesson
	});
	const subjectMetrics = new Map(sortedSubjects.map((subject) => [subject.id, {
		id: subject.id,
		name: subject.name,
		emoji: subject.emoji,
		targetLessons: 0,
		metLessons: 0,
		focusMinutes: 0,
		lessonRate: 0
	}]));
	const targets = [];
	const outOfPlanCompletions = [];
	const archivedByLesson = /* @__PURE__ */ new Map();
	for (const { subjectId, lesson } of lessonSubject.values()) {
		const effectiveDate = shiftedDates[lesson.id] ?? lesson.scheduledDate;
		if (!weekDates.has(effectiveDate)) continue;
		const completionDate = state.completedLessons[lesson.id];
		const isUndated = completionDate === UNDATED_COMPLETION;
		const hasDatedCompletion = isDateISO(completionDate);
		const met = isUndated || hasDatedCompletion && completionDate <= weekEndISO;
		const completionStatus = isUndated ? "completed-undated" : hasDatedCompletion && completionDate > weekEndISO ? "completed-after-week" : hasDatedCompletion && completionDate < effectiveDate ? "completed-early" : hasDatedCompletion ? "completed" : "not-completed";
		targets.push({
			lessonId: lesson.id,
			subjectId,
			scheduledDate: lesson.scheduledDate,
			effectiveDate,
			completionDate,
			completionStatus,
			met
		});
		const subject = subjectMetrics.get(subjectId);
		if (subject) {
			subject.targetLessons += 1;
			if (met) subject.metLessons += 1;
		}
	}
	for (const [lessonId, completedOn] of Object.entries(state.completedLessons)) {
		if (!isDateISO(completedOn) || !weekDates.has(completedOn)) continue;
		const liveLesson = lessonSubject.get(lessonId);
		if (!liveLesson) {
			const archived = archivedByLesson.get(lessonId) ?? {
				lessonId,
				focusMinutes: 0
			};
			archived.completedOn = completedOn;
			archivedByLesson.set(lessonId, archived);
			continue;
		}
		const effectiveDate = shiftedDates[lessonId] ?? liveLesson.lesson.scheduledDate;
		if (!weekDates.has(effectiveDate)) outOfPlanCompletions.push({
			lessonId,
			subjectId: liveLesson.subjectId,
			completedOn
		});
	}
	const DAY_LABELS = [
		"T2",
		"T3",
		"T4",
		"T5",
		"T6",
		"T7",
		"CN"
	];
	const habitDetails = state.habitDefinitions.filter((habit) => !habit.archived).map((habit) => {
		const target = nonNegative(state.goals.habitTargets[habit.id]);
		const occurrences = dates.reduce((total, dateISO) => total + Number(habitOccurrenceOnDate(habit, state, dateISO)), 0);
		const cappedOccurrences = target > 0 ? Math.min(occurrences, target) : 0;
		const dailyLog = dates.map((dateISO, idx) => ({
			dateISO,
			dayLabel: DAY_LABELS[idx] ?? `T${idx + 2}`,
			completed: habitOccurrenceOnDate(habit, state, dateISO)
		}));
		return {
			id: habit.id,
			name: habit.name,
			target,
			occurrences,
			cappedOccurrences,
			rate: percent(cappedOccurrences, target),
			met: target > 0 && occurrences >= target,
			dailyLog
		};
	});
	const habitTargetTotal = habitDetails.reduce((sum, habit) => sum + habit.target, 0);
	const habitCompletedTotal = habitDetails.reduce((sum, habit) => sum + habit.cappedOccurrences, 0);
	const dailyActualMinutes = Object.fromEntries(dates.map((dateISO) => [dateISO, 0]));
	const dailyTargetMinutes = Object.fromEntries(dates.map((dateISO) => {
		const override = state.plannerSettings.dailyHours[dateISO];
		const hours = override === void 0 ? state.plannerSettings.defaultDailyHours : override;
		return [dateISO, Math.round(nonNegative(hours) * 60)];
	}));
	for (const dateISO of dates) for (const session of state.studySessions) {
		const minutes = Math.round(studySecondsOnDate([session], dateISO) / 60);
		if (minutes <= 0) continue;
		dailyActualMinutes[dateISO] += minutes;
		const liveLesson = lessonSubject.get(session.lessonId);
		if (liveLesson) {
			const subject = subjectMetrics.get(liveLesson.subjectId);
			if (subject) subject.focusMinutes += minutes;
		} else {
			const archived = archivedByLesson.get(session.lessonId) ?? {
				lessonId: session.lessonId,
				focusMinutes: 0
			};
			archived.focusMinutes += minutes;
			archivedByLesson.set(session.lessonId, archived);
		}
	}
	const subjectList = [...subjectMetrics.values()].map((subject) => ({
		...subject,
		lessonRate: percent(subject.metLessons, subject.targetLessons)
	}));
	const actualMinutes = Object.values(dailyActualMinutes).reduce((sum, minutes) => sum + minutes, 0);
	const targetMinutes = Object.values(dailyTargetMinutes).reduce((sum, minutes) => sum + minutes, 0);
	return {
		weekStartISO,
		weekEndISO,
		dates,
		lessons: {
			targetTotal: targets.length,
			metTotal: targets.filter((target) => target.met).length,
			rate: percent(targets.filter((target) => target.met).length, targets.length),
			targets,
			outOfPlanCompletions
		},
		habits: {
			targetTotal: habitTargetTotal,
			completedTotal: habitCompletedTotal,
			rate: percent(habitCompletedTotal, habitTargetTotal),
			details: habitDetails
		},
		time: {
			actualMinutes,
			targetMinutes,
			rate: percent(actualMinutes, targetMinutes),
			dailyActualMinutes,
			dailyTargetMinutes
		},
		subjects: subjectList,
		archivedActivity: [...archivedByLesson.values()].sort((a, b) => a.lessonId.localeCompare(b.lessonId))
	};
}
function weeklyLessonCompletionLabel(status) {
	switch (status) {
		case "completed-undated": return "Hoàn thành, không rõ ngày";
		case "completed-early": return "Hoàn thành sớm";
		case "completed-after-week": return "Hoàn thành sau tuần";
		case "completed": return "Đã hoàn thành";
		default: return "Chưa hoàn thành";
	}
}
var _jsxFileName$11 = "/app/applet/src/components/WeeklyStudySummary.tsx";
function minutesLabel(minutes) {
	const hours = Math.floor(minutes / 60);
	const remainder = minutes % 60;
	return hours > 0 ? `${hours} giờ ${remainder} phút` : `${remainder} phút`;
}
function WeeklyStudySummary({ metrics, todayTargetMinutes }) {
	const today = todayISO();
	const todayActualMinutes = metrics.time.dailyActualMinutes[today] ?? 0;
	const todayRate = todayTargetMinutes > 0 ? Math.min(100, Math.round(todayActualMinutes / todayTargetMinutes * 100)) : 0;
	const datedRange = `${metrics.weekStartISO.slice(8, 10)}/${metrics.weekStartISO.slice(5, 7)} – ${metrics.weekEndISO.slice(8, 10)}/${metrics.weekEndISO.slice(5, 7)}`;
	const nonStandardTargets = metrics.lessons.targets.filter((target) => target.completionStatus === "completed-undated" || target.completionStatus === "completed-after-week");
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "grid h-9 w-9 place-items-center rounded-xl bg-sky-100 text-sky-700",
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ChartPie, { size: 20 }, void 0, false, {
								fileName: _jsxFileName$11,
								lineNumber: 38,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 37,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
							className: "font-serif text-xl font-bold text-slate-900",
							children: "Tổng kết tuần"
						}, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 41,
							columnNumber: 15
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: "text-xs text-slate-500 font-medium",
							children: ["Thứ 2 đến Chủ Nhật · ", datedRange]
						}, void 0, true, {
							fileName: _jsxFileName$11,
							lineNumber: 42,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName$11,
							lineNumber: 40,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$11,
						lineNumber: 36,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "text-xs text-slate-500 max-w-sm",
						children: "Bài học, thói quen và phiên tập trung được ghi nhận theo tuần độc lập."
					}, void 0, false, {
						fileName: _jsxFileName$11,
						lineNumber: 47,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$11,
					lineNumber: 35,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "grid gap-3 grid-cols-2 sm:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(MetricCard, {
							icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CalendarClock, { size: 16 }, void 0, false, {
								fileName: _jsxFileName$11,
								lineNumber: 55,
								columnNumber: 19
							}, this),
							label: "Hôm nay",
							value: minutesLabel(todayActualMinutes),
							detail: `Mục tiêu: ${minutesLabel(todayTargetMinutes)} (${todayRate}%)`,
							tone: "emerald"
						}, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 54,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(MetricCard, {
							icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Clock, { size: 16 }, void 0, false, {
								fileName: _jsxFileName$11,
								lineNumber: 62,
								columnNumber: 19
							}, this),
							label: "Cả tuần",
							value: minutesLabel(metrics.time.actualMinutes),
							detail: `Mục tiêu: ${minutesLabel(metrics.time.targetMinutes)} (${metrics.time.rate}%)`,
							tone: "sky"
						}, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 61,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(MetricCard, {
							icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BookOpen, { size: 16 }, void 0, false, {
								fileName: _jsxFileName$11,
								lineNumber: 69,
								columnNumber: 19
							}, this),
							label: "Bài học theo kế hoạch",
							value: `${metrics.lessons.metTotal}/${metrics.lessons.targetTotal} bài`,
							detail: `${metrics.lessons.rate}% mục tiêu bài học`,
							tone: "indigo"
						}, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 68,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(MetricCard, {
							icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Target, { size: 16 }, void 0, false, {
								fileName: _jsxFileName$11,
								lineNumber: 76,
								columnNumber: 19
							}, this),
							label: "Thói quen",
							value: `${metrics.habits.completedTotal}/${metrics.habits.targetTotal} lượt`,
							detail: `${metrics.habits.rate}% mục tiêu thói quen`,
							tone: "amber"
						}, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 75,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$11,
					lineNumber: 53,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$11,
				lineNumber: 34,
				columnNumber: 7
			}, this),
			(nonStandardTargets.length > 0 || metrics.lessons.outOfPlanCompletions.length > 0 || metrics.archivedActivity.length > 0) && /* @__PURE__ */ (void 0)("div", {
				className: "space-y-3",
				children: [
					nonStandardTargets.length > 0 && /* @__PURE__ */ (void 0)("div", {
						className: "rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-700 shadow-xs",
						children: [/* @__PURE__ */ (void 0)("p", {
							className: "font-semibold text-slate-800",
							children: "Trạng thái bài học cần lưu ý"
						}, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 92,
							columnNumber: 15
						}, this), /* @__PURE__ */ (void 0)("ul", {
							className: "mt-1 space-y-1",
							children: nonStandardTargets.map((target) => /* @__PURE__ */ (void 0)("li", {
								className: "text-slate-600",
								children: [
									/* @__PURE__ */ (void 0)("strong", {
										className: "text-slate-800",
										children: [target.lessonId, ":"]
									}, void 0, true, {
										fileName: _jsxFileName$11,
										lineNumber: 96,
										columnNumber: 21
									}, this),
									" ",
									weeklyLessonCompletionLabel(target.completionStatus)
								]
							}, target.lessonId, true, {
								fileName: _jsxFileName$11,
								lineNumber: 95,
								columnNumber: 19
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 93,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$11,
						lineNumber: 91,
						columnNumber: 13
					}, this),
					metrics.lessons.outOfPlanCompletions.length > 0 && /* @__PURE__ */ (void 0)("div", {
						className: "rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-950 shadow-xs",
						children: [/* @__PURE__ */ (void 0)("p", {
							className: "font-semibold",
							children: "Bài hoàn thành trong tuần nhưng ngoài kế hoạch tuần"
						}, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 106,
							columnNumber: 15
						}, this), /* @__PURE__ */ (void 0)("p", {
							className: "mt-1",
							children: metrics.lessons.outOfPlanCompletions.map((item) => item.lessonId).join(", ")
						}, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 107,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$11,
						lineNumber: 105,
						columnNumber: 13
					}, this),
					metrics.archivedActivity.length > 0 && /* @__PURE__ */ (void 0)("div", {
						className: "rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-950 shadow-xs",
						children: [/* @__PURE__ */ (void 0)("p", {
							className: "font-semibold",
							children: "Hoạt động từ bài đã xóa khỏi lộ trình"
						}, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 115,
							columnNumber: 15
						}, this), /* @__PURE__ */ (void 0)("ul", {
							className: "mt-1 space-y-1",
							children: metrics.archivedActivity.map((activity) => /* @__PURE__ */ (void 0)("li", { children: [
								activity.lessonId,
								activity.completedOn ? ` · hoàn thành ${activity.completedOn}` : "",
								activity.focusMinutes > 0 ? ` · ${minutesLabel(activity.focusMinutes)} tập trung` : ""
							] }, activity.lessonId, true, {
								fileName: _jsxFileName$11,
								lineNumber: 118,
								columnNumber: 19
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 116,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$11,
						lineNumber: 114,
						columnNumber: 13
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName$11,
				lineNumber: 89,
				columnNumber: 9
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "space-y-6 lg:col-span-7",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex items-center justify-between pb-3 border-b border-slate-100",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "grid h-8 w-8 place-items-center rounded-lg bg-sky-100 text-sky-700",
									children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Clock, { size: 18 }, void 0, false, {
										fileName: _jsxFileName$11,
										lineNumber: 141,
										columnNumber: 19
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName$11,
									lineNumber: 140,
									columnNumber: 17
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
									className: "text-base font-bold text-slate-900",
									children: "Phiên tập trung theo ngày"
								}, void 0, false, {
									fileName: _jsxFileName$11,
									lineNumber: 144,
									columnNumber: 19
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
									className: "text-xs text-slate-500",
									children: "Thời gian học thực tế so với mục tiêu từng ngày"
								}, void 0, false, {
									fileName: _jsxFileName$11,
									lineNumber: 145,
									columnNumber: 19
								}, this)] }, void 0, true, {
									fileName: _jsxFileName$11,
									lineNumber: 143,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$11,
								lineNumber: 139,
								columnNumber: 15
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700 border border-sky-200/60",
								children: minutesLabel(metrics.time.actualMinutes)
							}, void 0, false, {
								fileName: _jsxFileName$11,
								lineNumber: 150,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$11,
							lineNumber: 138,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(WeeklyFocusBarChart, { metrics }, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 156,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$11,
						lineNumber: 137,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex items-center justify-between pb-3 border-b border-slate-100",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "grid h-8 w-8 place-items-center rounded-lg bg-indigo-100 text-indigo-700",
									children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BookOpen, { size: 18 }, void 0, false, {
										fileName: _jsxFileName$11,
										lineNumber: 164,
										columnNumber: 19
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName$11,
									lineNumber: 163,
									columnNumber: 17
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
									className: "text-base font-bold text-slate-900",
									children: "Tiến độ theo môn học"
								}, void 0, false, {
									fileName: _jsxFileName$11,
									lineNumber: 167,
									columnNumber: 19
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
									className: "text-xs text-slate-500",
									children: "Mức độ hoàn thành các bài học theo môn"
								}, void 0, false, {
									fileName: _jsxFileName$11,
									lineNumber: 168,
									columnNumber: 19
								}, this)] }, void 0, true, {
									fileName: _jsxFileName$11,
									lineNumber: 166,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$11,
								lineNumber: 162,
								columnNumber: 15
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "text-xs text-slate-500 font-semibold",
								children: [metrics.subjects.length, " môn"]
							}, void 0, true, {
								fileName: _jsxFileName$11,
								lineNumber: 171,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$11,
							lineNumber: 161,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: metrics.subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("article", {
								className: "rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h4", {
											className: "min-w-0 truncate text-sm font-bold text-slate-800",
											children: [
												subject.emoji,
												" ",
												subject.name
											]
										}, void 0, true, {
											fileName: _jsxFileName$11,
											lineNumber: 181,
											columnNumber: 21
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
											className: "shrink-0 text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100",
											children: minutesLabel(subject.focusMinutes)
										}, void 0, false, {
											fileName: _jsxFileName$11,
											lineNumber: 184,
											columnNumber: 21
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$11,
										lineNumber: 180,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "flex items-center justify-between text-xs text-slate-600",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: [
											subject.metLessons,
											"/",
											subject.targetLessons,
											" bài kế hoạch"
										] }, void 0, true, {
											fileName: _jsxFileName$11,
											lineNumber: 189,
											columnNumber: 21
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
											className: "font-bold text-slate-800",
											children: [subject.lessonRate, "%"]
										}, void 0, true, {
											fileName: _jsxFileName$11,
											lineNumber: 192,
											columnNumber: 21
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$11,
										lineNumber: 188,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "h-2 w-full overflow-hidden rounded-full bg-slate-200",
										children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "h-full rounded-full bg-indigo-500 transition-all duration-300",
											style: { width: `${Math.min(100, Math.max(0, subject.lessonRate))}%` }
										}, void 0, false, {
											fileName: _jsxFileName$11,
											lineNumber: 195,
											columnNumber: 21
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName$11,
										lineNumber: 194,
										columnNumber: 19
									}, this)
								]
							}, subject.id, true, {
								fileName: _jsxFileName$11,
								lineNumber: 176,
								columnNumber: 17
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 174,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$11,
						lineNumber: 160,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$11,
					lineNumber: 135,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "space-y-6 lg:col-span-5",
					children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex items-center justify-between pb-3 border-b border-slate-100",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "grid h-8 w-8 place-items-center rounded-lg bg-amber-100 text-amber-700",
									children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SquareCheckBig, { size: 18 }, void 0, false, {
										fileName: _jsxFileName$11,
										lineNumber: 212,
										columnNumber: 19
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName$11,
									lineNumber: 211,
									columnNumber: 17
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
									className: "text-base font-bold text-slate-900",
									children: "Chi tiết thói quen"
								}, void 0, false, {
									fileName: _jsxFileName$11,
									lineNumber: 215,
									columnNumber: 19
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
									className: "text-xs text-slate-500",
									children: "Ma trận theo dõi 7 ngày trong tuần"
								}, void 0, false, {
									fileName: _jsxFileName$11,
									lineNumber: 216,
									columnNumber: 19
								}, this)] }, void 0, true, {
									fileName: _jsxFileName$11,
									lineNumber: 214,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$11,
								lineNumber: 210,
								columnNumber: 15
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200/60",
								children: [
									metrics.habits.completedTotal,
									"/",
									metrics.habits.targetTotal,
									" lượt"
								]
							}, void 0, true, {
								fileName: _jsxFileName$11,
								lineNumber: 219,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$11,
							lineNumber: 209,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(WeeklyHabitGrid, { habits: metrics.habits.details }, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 225,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$11,
						lineNumber: 208,
						columnNumber: 11
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName$11,
					lineNumber: 207,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$11,
				lineNumber: 133,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$11,
		lineNumber: 32,
		columnNumber: 5
	}, this);
}
function WeeklyFocusBarChart({ metrics }) {
	const DAY_NAMES = [
		"T2",
		"T3",
		"T4",
		"T5",
		"T6",
		"T7",
		"CN"
	];
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "pt-1",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "grid grid-cols-7 gap-1.5 sm:gap-3 items-end h-44 pt-7 pb-2 px-1.5 bg-slate-50/90 rounded-xl border border-slate-100",
			children: metrics.dates.map((dateISO, idx) => {
				const actual = metrics.time.dailyActualMinutes[dateISO] ?? 0;
				const target = metrics.time.dailyTargetMinutes[dateISO] ?? 360;
				const rate = target > 0 ? Math.min(100, Math.round(actual / target * 100)) : 0;
				const dayName = DAY_NAMES[idx] ?? `T${idx + 2}`;
				const formattedDate = `${dateISO.slice(8, 10)}/${dateISO.slice(5, 7)}`;
				const isMet = actual >= target && target > 0;
				return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex flex-col items-center h-full justify-end group relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 text-[10px] font-bold bg-slate-800 text-white px-2 py-0.5 rounded pointer-events-none z-10 whitespace-nowrap shadow-sm",
							children: [
								actual,
								"p / ",
								target,
								"p (",
								rate,
								"%)"
							]
						}, void 0, true, {
							fileName: _jsxFileName$11,
							lineNumber: 255,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "w-full max-w-[34px] bg-slate-200/70 rounded-t-lg h-full flex items-end overflow-hidden relative",
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: cn("w-full rounded-t-lg transition-all duration-500 ease-out", isMet ? "bg-gradient-to-t from-emerald-600 to-emerald-400" : actual > 0 ? "bg-gradient-to-t from-sky-600 to-sky-400" : "bg-transparent"),
								style: { height: `${Math.max(rate, actual > 0 ? 8 : 0)}%` }
							}, void 0, false, {
								fileName: _jsxFileName$11,
								lineNumber: 262,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 260,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "mt-2 text-center w-full min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "text-xs font-bold text-slate-800",
									children: dayName
								}, void 0, false, {
									fileName: _jsxFileName$11,
									lineNumber: 277,
									columnNumber: 17
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "text-[10px] text-slate-500",
									children: formattedDate
								}, void 0, false, {
									fileName: _jsxFileName$11,
									lineNumber: 278,
									columnNumber: 17
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: cn("text-[10px] font-bold mt-0.5 truncate", isMet ? "text-emerald-600" : actual > 0 ? "text-sky-700" : "text-slate-500"),
									children: [
										actual,
										"p/",
										target,
										"p"
									]
								}, void 0, true, {
									fileName: _jsxFileName$11,
									lineNumber: 279,
									columnNumber: 17
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName$11,
							lineNumber: 276,
							columnNumber: 15
						}, this)
					]
				}, dateISO, true, {
					fileName: _jsxFileName$11,
					lineNumber: 250,
					columnNumber: 13
				}, this);
			})
		}, void 0, false, {
			fileName: _jsxFileName$11,
			lineNumber: 240,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$11,
		lineNumber: 238,
		columnNumber: 5
	}, this);
}
function WeeklyHabitGrid({ habits }) {
	if (habits.length === 0) return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500",
		children: "Chưa có thói quen nào được theo dõi. Hãy tạo thói quen ở tab Hôm nay."
	}, void 0, false, {
		fileName: _jsxFileName$11,
		lineNumber: 304,
		columnNumber: 7
	}, this);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "space-y-3 overflow-x-auto",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "flex items-center justify-between min-w-[300px] pb-2 border-b border-slate-100 px-1 text-xs font-bold text-slate-500 uppercase tracking-wider",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
				className: "min-w-0 flex-1",
				children: "Thói quen"
			}, void 0, false, {
				fileName: _jsxFileName$11,
				lineNumber: 316,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "grid grid-cols-7 gap-1 sm:gap-1.5 text-center w-[190px] sm:w-[210px] shrink-0",
				children: [
					"T2",
					"T3",
					"T4",
					"T5",
					"T6",
					"T7",
					"CN"
				].map((day) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
					className: "text-[11px] text-slate-600 font-bold",
					children: day
				}, day, false, {
					fileName: _jsxFileName$11,
					lineNumber: 319,
					columnNumber: 13
				}, this))
			}, void 0, false, {
				fileName: _jsxFileName$11,
				lineNumber: 317,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$11,
			lineNumber: 315,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "space-y-2 min-w-[300px]",
			children: habits.map((habit) => {
				const occurrences = habit.occurrences;
				const target = habit.target;
				const isTargetMet = target > 0 && occurrences >= target;
				return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-2 sm:p-2.5 hover:bg-slate-50 transition-colors",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "min-w-0 flex-1 space-y-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "font-semibold text-xs sm:text-sm text-slate-800 truncate",
							title: habit.name,
							children: habit.name
						}, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 340,
							columnNumber: 17
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex items-center gap-1",
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: cn("inline-block rounded-md px-1.5 py-0.2 text-[10px] font-bold border", isTargetMet ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"),
								children: target > 0 ? `${occurrences}/${target} lượt` : `${occurrences} lượt`
							}, void 0, false, {
								fileName: _jsxFileName$11,
								lineNumber: 347,
								columnNumber: 19
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$11,
							lineNumber: 346,
							columnNumber: 17
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$11,
						lineNumber: 339,
						columnNumber: 15
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "grid grid-cols-7 gap-1 sm:gap-1.5 w-[190px] sm:w-[210px] shrink-0 place-items-center",
						children: habit.dailyLog.map((day) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex items-center justify-center",
							title: `${day.dayLabel} (${day.dateISO.slice(8, 10)}/${day.dateISO.slice(5, 7)}): ${day.completed ? "Đã hoàn thành" : "Chưa thực hiện"}`,
							children: day.completed ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "h-6 w-6 sm:h-6.5 sm:w-6.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs transition-transform hover:scale-110",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Check, { className: "h-3.5 w-3.5 stroke-[3]" }, void 0, false, {
									fileName: _jsxFileName$11,
									lineNumber: 370,
									columnNumber: 25
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$11,
								lineNumber: 369,
								columnNumber: 23
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "h-6 w-6 sm:h-6.5 sm:w-6.5 rounded-full bg-slate-200/70 border border-slate-300/60 text-slate-300 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "h-1.5 w-1.5 rounded-full bg-slate-300" }, void 0, false, {
									fileName: _jsxFileName$11,
									lineNumber: 374,
									columnNumber: 25
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$11,
								lineNumber: 373,
								columnNumber: 23
							}, this)
						}, day.dateISO, false, {
							fileName: _jsxFileName$11,
							lineNumber: 363,
							columnNumber: 19
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName$11,
						lineNumber: 361,
						columnNumber: 15
					}, this)]
				}, habit.id, true, {
					fileName: _jsxFileName$11,
					lineNumber: 334,
					columnNumber: 13
				}, this);
			})
		}, void 0, false, {
			fileName: _jsxFileName$11,
			lineNumber: 327,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$11,
		lineNumber: 313,
		columnNumber: 5
	}, this);
}
function MetricCard({ icon, label, value, detail, tone }) {
	const tones = {
		sky: "border-sky-200/80 bg-sky-50/60 text-sky-900",
		indigo: "border-indigo-200/80 bg-indigo-50/60 text-indigo-900",
		amber: "border-amber-200/80 bg-amber-50/60 text-amber-900",
		emerald: "border-emerald-200/80 bg-emerald-50/60 text-emerald-900"
	}[tone];
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("article", {
		className: `rounded-xl border p-3.5 ${tones}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex items-center gap-1.5 text-xs font-semibold",
				children: [icon, label]
			}, void 0, true, {
				fileName: _jsxFileName$11,
				lineNumber: 409,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
				className: "mt-1.5 font-serif text-xl font-bold",
				children: value
			}, void 0, false, {
				fileName: _jsxFileName$11,
				lineNumber: 413,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
				className: "mt-1 text-[11px] opacity-80 font-medium",
				children: detail
			}, void 0, false, {
				fileName: _jsxFileName$11,
				lineNumber: 414,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$11,
		lineNumber: 408,
		columnNumber: 5
	}, this);
}
var _jsxFileName$10 = "/app/applet/src/components/OnboardingDialog.tsx";
function OnboardingDialog({ open, onStartEmpty, onUseDemo, onCancel, canRestoreFactoryReset = false, onRestoreFactoryReset, affectedCounts }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Dialog, {
		open,
		onOpenChange: (nextOpen) => !nextOpen && onCancel?.(),
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent, {
			className: `max-w-xl rounded-3xl p-6 ${!onCancel ? "[&>button]:hidden" : ""}`,
			onEscapeKeyDown: (event) => {
				if (!onCancel) event.preventDefault();
			},
			onPointerDownOutside: (event) => {
				if (!onCancel) event.preventDefault();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle, {
					className: "font-serif text-2xl",
					children: "Bắt đầu lộ trình của riêng bạn"
				}, void 0, false, {
					fileName: _jsxFileName$10,
					lineNumber: 42,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogDescription, { children: "Chọn một cách bắt đầu: tự tạo không gian trống hoặc nạp lộ trình mẫu lớp 11. Lộ trình mẫu gồm chương trình Toán, Vật lý và Hóa học lớp 11 KNTT; bạn có thể chỉnh sửa sau." }, void 0, false, {
					fileName: _jsxFileName$10,
					lineNumber: 43,
					columnNumber: 11
				}, this)] }, void 0, true, {
					fileName: _jsxFileName$10,
					lineNumber: 41,
					columnNumber: 9
				}, this),
				affectedCounts && /* @__PURE__ */ (void 0)("p", {
					className: "rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950",
					children: [
						"Thay thế sẽ ảnh hưởng ",
						affectedCounts.lessons,
						" bài, ",
						affectedCounts.sessions,
						" phiên tập trung, ",
						affectedCounts.habits,
						" thói quen và ",
						affectedCounts.completions,
						" lượt hoàn thành. Một bản khôi phục sẽ được tạo trước khi ghi."
					]
				}, void 0, true, {
					fileName: _jsxFileName$10,
					lineNumber: 49,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: onStartEmpty,
						className: "rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-5 text-left transition hover:border-emerald-400 hover:bg-emerald-50",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BookOpen, { className: "mb-3 h-7 w-7 text-emerald-600" }, void 0, false, {
								fileName: _jsxFileName$10,
								lineNumber: 60,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "font-semibold text-emerald-950",
								children: "Tạo không gian trống"
							}, void 0, false, {
								fileName: _jsxFileName$10,
								lineNumber: 61,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "mt-1 text-xs leading-relaxed text-emerald-800",
								children: "Không có môn, bài hay tiến độ mẫu. Bạn tự thêm nội dung phù hợp với mình."
							}, void 0, false, {
								fileName: _jsxFileName$10,
								lineNumber: 62,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$10,
						lineNumber: 56,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: onUseDemo,
						className: "rounded-2xl border-2 border-sky-200 bg-sky-50/70 p-5 text-left transition hover:border-sky-400 hover:bg-sky-50",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Sparkles, { className: "mb-3 h-7 w-7 text-sky-600" }, void 0, false, {
								fileName: _jsxFileName$10,
								lineNumber: 70,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "font-semibold text-sky-950",
								children: "Dùng lộ trình mẫu lớp 11"
							}, void 0, false, {
								fileName: _jsxFileName$10,
								lineNumber: 71,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "mt-1 text-xs leading-relaxed text-sky-800",
								children: "Nạp lộ trình Toán, Vật lý và Hóa học lớp 11 KNTT; bạn vẫn có thể sửa hoặc xóa tùy ý."
							}, void 0, false, {
								fileName: _jsxFileName$10,
								lineNumber: 72,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$10,
						lineNumber: 66,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$10,
					lineNumber: 55,
					columnNumber: 9
				}, this),
				onCancel && /* @__PURE__ */ (void 0)(Button, {
					onClick: onCancel,
					variant: "outline",
					className: "rounded-xl text-xs",
					children: "Hủy, không thay đổi dữ liệu"
				}, void 0, false, {
					fileName: _jsxFileName$10,
					lineNumber: 78,
					columnNumber: 11
				}, this),
				canRestoreFactoryReset && onRestoreFactoryReset && /* @__PURE__ */ (void 0)(Button, {
					onClick: onRestoreFactoryReset,
					variant: "outline",
					className: "rounded-xl text-xs",
					children: "Khôi phục lần xóa gần nhất"
				}, void 0, false, {
					fileName: _jsxFileName$10,
					lineNumber: 83,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName$10,
			lineNumber: 32,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$10,
		lineNumber: 31,
		columnNumber: 5
	}, this);
}
var _jsxFileName$9 = "/app/applet/src/components/focus-timer/AmbientSoundSelector.tsx";
var SOUND_OPTIONS = [
	{
		id: "none",
		label: "🔇 Tắt"
	},
	{
		id: "rain",
		label: "🌧️ Mưa rào"
	},
	{
		id: "binaural",
		label: "🎧 Sóng Alpha"
	},
	{
		id: "cafe",
		label: "☕ Quán Cafe"
	},
	{
		id: "whiteNoise",
		label: "📻 Tiếng ồn trắng"
	}
];
function AmbientSoundSelector({ value, onChange, className, optionClassName }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: cn("rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-left", className),
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "mb-1.5 flex items-center justify-between text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
				className: "flex items-center gap-1 text-[11px] font-semibold text-slate-700",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Volume2, { className: "h-3.5 w-3.5 text-rose-500" }, void 0, false, {
					fileName: _jsxFileName$9,
					lineNumber: 27,
					columnNumber: 11
				}, this), "Âm thanh tập trung nền:"]
			}, void 0, true, {
				fileName: _jsxFileName$9,
				lineNumber: 26,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
				className: "text-[10px] text-slate-400",
				children: "Web Audio HD"
			}, void 0, false, {
				fileName: _jsxFileName$9,
				lineNumber: 30,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$9,
			lineNumber: 25,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "flex flex-wrap gap-1",
			children: SOUND_OPTIONS.map((sound) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
				type: "button",
				onClick: () => onChange(sound.id),
				className: cn("rounded-lg border px-2 py-1 text-center text-[11px] font-medium transition-all", value === sound.id ? "border-rose-300 bg-rose-100 font-bold text-rose-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100", optionClassName),
				children: sound.label
			}, sound.id, false, {
				fileName: _jsxFileName$9,
				lineNumber: 34,
				columnNumber: 11
			}, this))
		}, void 0, false, {
			fileName: _jsxFileName$9,
			lineNumber: 32,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$9,
		lineNumber: 22,
		columnNumber: 5
	}, this);
}
var _jsxFileName$8 = "/app/applet/src/components/focus-timer/DurationSelector.tsx";
var DURATIONS = [
	15,
	25,
	45,
	50,
	60,
	90
];
function DurationSelector({ value, disabled, onChange, onAddExtra, compact }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: cn("flex items-center gap-1", compact ? "mt-2.5 justify-center gap-1.5" : "justify-between rounded-xl border border-slate-100 bg-slate-50 p-2 text-xs"),
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
			className: cn("font-semibold text-slate-600", compact ? "text-[11px]" : "text-[11px]"),
			children: "Tùy chỉnh phút:"
		}, void 0, false, {
			fileName: _jsxFileName$8,
			lineNumber: 23,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "flex flex-wrap items-center justify-end gap-1",
			children: [DURATIONS.map((minutes) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
				type: "button",
				onClick: () => onChange(minutes),
				disabled,
				className: cn("border text-xs font-semibold transition-all", compact ? "rounded-full px-2.5 py-0.5" : "rounded-lg px-2 py-0.5", value === minutes ? "border-slate-800 bg-slate-800 text-white shadow-xs" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40"),
				children: [minutes, "p"]
			}, minutes, true, {
				fileName: _jsxFileName$8,
				lineNumber: 28,
				columnNumber: 11
			}, this)), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
				type: "button",
				onClick: () => onAddExtra(10),
				className: cn("border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 hover:bg-amber-100", compact ? "rounded-full" : "rounded-lg"),
				children: "+10p"
			}, void 0, false, {
				fileName: _jsxFileName$8,
				lineNumber: 44,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$8,
			lineNumber: 26,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$8,
		lineNumber: 15,
		columnNumber: 5
	}, this);
}
var _jsxFileName$7 = "/app/applet/src/components/focus-timer/FocusTimerDialogs.tsx";
function SaveTimeInfoDialog({ open, onClose }) {
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Giải thích lưu thời gian",
		className: "fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex items-center justify-between border-b border-slate-100 pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h4", {
						className: "flex items-center gap-2 text-base font-bold text-rose-600",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleQuestionMark, { className: "h-5 w-5" }, void 0, false, {
							fileName: _jsxFileName$7,
							lineNumber: 24,
							columnNumber: 13
						}, this), " Nút “Lưu thời gian” dùng để làm gì?"]
					}, void 0, true, {
						fileName: _jsxFileName$7,
						lineNumber: 23,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
						size: "icon",
						variant: "ghost",
						className: "h-8 w-8 rounded-full",
						onClick: onClose,
						"aria-label": "Đóng giải thích lưu thời gian",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(X, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$7,
							lineNumber: 33,
							columnNumber: 13
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName$7,
						lineNumber: 26,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$7,
					lineNumber: 22,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "space-y-3 py-4 text-sm leading-relaxed text-slate-600",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: [
							"Nút ",
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("strong", { children: "“Lưu thời gian”" }, void 0, false, {
								fileName: _jsxFileName$7,
								lineNumber: 38,
								columnNumber: 17
							}, this),
							" ghi nhận chính xác số phút thực tế đã trôi qua, kể cả khi bạn dừng trước lúc đồng hồ kết thúc."
						] }, void 0, true, {
							fileName: _jsxFileName$7,
							lineNumber: 37,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "space-y-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs text-rose-900",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "font-semibold text-rose-800",
								children: "Dữ liệu được cập nhật:"
							}, void 0, false, {
								fileName: _jsxFileName$7,
								lineNumber: 42,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ul", {
								className: "list-inside list-disc space-y-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: "Thời gian thực tế của bài học." }, void 0, false, {
										fileName: _jsxFileName$7,
										lineNumber: 44,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: "Biểu đồ và tổng kết thời gian học." }, void 0, false, {
										fileName: _jsxFileName$7,
										lineNumber: 45,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", { children: "Chuỗi ngày học khi phiên có thời lượng hợp lệ." }, void 0, false, {
										fileName: _jsxFileName$7,
										lineNumber: 46,
										columnNumber: 15
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$7,
								lineNumber: 43,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$7,
							lineNumber: 41,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: "text-xs text-slate-500",
							children: "Ví dụ: đặt 50 phút nhưng dừng ở phút 25 thì hệ thống lưu đúng 25 phút."
						}, void 0, false, {
							fileName: _jsxFileName$7,
							lineNumber: 49,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$7,
					lineNumber: 36,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
					className: "w-full rounded-xl bg-rose-600 font-semibold text-white hover:bg-rose-700",
					onClick: onClose,
					children: "Đã hiểu"
				}, void 0, false, {
					fileName: _jsxFileName$7,
					lineNumber: 53,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName$7,
			lineNumber: 21,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$7,
		lineNumber: 15,
		columnNumber: 5
	}, this);
}
function TimerRecoveryDialogs({ expiredPrompt, lessonTitle, durationMinutes, completionSummary, canCompleteLesson, onExpiredDecision, onCompleteLesson, onStartMode, onReturnToday, lastFocusDuration }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [expiredPrompt && /* @__PURE__ */ (void 0)("div", {
		"data-timer-overlay": "true",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Quyết định phiên đã hết hạn",
		className: "fixed inset-0 z-[130] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm",
		children: /* @__PURE__ */ (void 0)("div", {
			className: "w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl",
			children: [
				/* @__PURE__ */ (void 0)("h3", {
					className: "font-serif text-xl font-semibold",
					children: "Phiên đã kết thúc khi app đóng"
				}, void 0, false, {
					fileName: _jsxFileName$7,
					lineNumber: 98,
					columnNumber: 13
				}, this),
				/* @__PURE__ */ (void 0)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: [
						"Phiên “",
						lessonTitle,
						"” đã hết khi ứng dụng không mở. Chọn lưu hoặc bỏ qua; ứng dụng không tự ghi dữ liệu khi chưa có xác nhận."
					]
				}, void 0, true, {
					fileName: _jsxFileName$7,
					lineNumber: 99,
					columnNumber: 13
				}, this),
				/* @__PURE__ */ (void 0)("div", {
					className: "mt-5 flex gap-2",
					children: [/* @__PURE__ */ (void 0)(Button, {
						className: "flex-1",
						onClick: () => onExpiredDecision(true),
						children: [
							"Lưu ",
							durationMinutes,
							" phút"
						]
					}, void 0, true, {
						fileName: _jsxFileName$7,
						lineNumber: 104,
						columnNumber: 15
					}, this), /* @__PURE__ */ (void 0)(Button, {
						className: "flex-1",
						variant: "outline",
						onClick: () => onExpiredDecision(false),
						children: "Bỏ qua"
					}, void 0, false, {
						fileName: _jsxFileName$7,
						lineNumber: 107,
						columnNumber: 15
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$7,
					lineNumber: 103,
					columnNumber: 13
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName$7,
			lineNumber: 97,
			columnNumber: 11
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$7,
		lineNumber: 90,
		columnNumber: 9
	}, this), completionSummary && !expiredPrompt && /* @__PURE__ */ (void 0)("div", {
		"data-timer-overlay": "true",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Tóm tắt phiên tập trung",
		className: "fixed inset-0 z-[125] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm",
		children: /* @__PURE__ */ (void 0)("div", {
			className: "w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl",
			children: [
				/* @__PURE__ */ (void 0)("div", {
					className: "text-3xl",
					children: "🎉"
				}, void 0, false, {
					fileName: _jsxFileName$7,
					lineNumber: 124,
					columnNumber: 13
				}, this),
				/* @__PURE__ */ (void 0)("h3", {
					className: "mt-2 font-serif text-xl font-semibold",
					children: "Đã hoàn thành phiên tập trung"
				}, void 0, false, {
					fileName: _jsxFileName$7,
					lineNumber: 125,
					columnNumber: 13
				}, this),
				/* @__PURE__ */ (void 0)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: [
						completionSummary.minutes,
						" phút · ",
						completionSummary.lessonTitle
					]
				}, void 0, true, {
					fileName: _jsxFileName$7,
					lineNumber: 126,
					columnNumber: 13
				}, this),
				/* @__PURE__ */ (void 0)("div", {
					className: "mt-5 grid gap-2 sm:grid-cols-2",
					children: [
						canCompleteLesson && /* @__PURE__ */ (void 0)(Button, {
							variant: "outline",
							onClick: onCompleteLesson,
							children: [/* @__PURE__ */ (void 0)(Check, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$7,
								lineNumber: 132,
								columnNumber: 19
							}, this), " Hoàn thành bài"]
						}, void 0, true, {
							fileName: _jsxFileName$7,
							lineNumber: 131,
							columnNumber: 17
						}, this),
						/* @__PURE__ */ (void 0)(Button, {
							onClick: () => onStartMode(completionSummary.nextMode, completionSummary.nextMinutes),
							children: "Bắt đầu nghỉ"
						}, void 0, false, {
							fileName: _jsxFileName$7,
							lineNumber: 135,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ (void 0)(Button, {
							variant: "outline",
							onClick: () => onStartMode("pomodoro", lastFocusDuration || 50),
							children: "Học tiếp"
						}, void 0, false, {
							fileName: _jsxFileName$7,
							lineNumber: 142,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ (void 0)(Button, {
							variant: "ghost",
							onClick: onReturnToday,
							children: "Về màn hình Hôm nay"
						}, void 0, false, {
							fileName: _jsxFileName$7,
							lineNumber: 148,
							columnNumber: 15
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$7,
					lineNumber: 129,
					columnNumber: 13
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName$7,
			lineNumber: 123,
			columnNumber: 11
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$7,
		lineNumber: 116,
		columnNumber: 9
	}, this)] }, void 0, true, {
		fileName: _jsxFileName$7,
		lineNumber: 88,
		columnNumber: 5
	}, this);
}
function MicroStartDialog({ open, onContinue, onFinish }) {
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		"data-timer-overlay": "true",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Quyết định tiếp tục phiên tập trung",
		className: "fixed inset-0 z-[135] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "w-full max-w-md space-y-4 rounded-3xl border border-amber-300 bg-white p-6 text-center shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl shadow-lg",
					children: "⚡"
				}, void 0, false, {
					fileName: _jsxFileName$7,
					lineNumber: 178,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800",
						children: "Hoàn thành khởi động"
					}, void 0, false, {
						fileName: _jsxFileName$7,
						lineNumber: 182,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
						className: "mt-2 font-serif text-xl font-bold text-slate-900",
						children: "Bạn đã bắt đầu được rồi"
					}, void 0, false, {
						fileName: _jsxFileName$7,
						lineNumber: 185,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "mt-1 text-xs leading-relaxed text-slate-600",
						children: "Tiếp tục khi động lực đang còn."
					}, void 0, false, {
						fileName: _jsxFileName$7,
						lineNumber: 188,
						columnNumber: 11
					}, this)
				] }, void 0, true, {
					fileName: _jsxFileName$7,
					lineNumber: 181,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "space-y-2 pt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
							onClick: () => onContinue(25),
							className: "w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-700",
							children: "🍅 Học tiếp 25 phút"
						}, void 0, false, {
							fileName: _jsxFileName$7,
							lineNumber: 193,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
							onClick: () => onContinue(50),
							variant: "outline",
							className: "w-full rounded-2xl border-indigo-200 bg-indigo-50 py-3 text-sm font-bold text-indigo-800 hover:bg-indigo-100",
							children: "🧠 Deep Work 50 phút"
						}, void 0, false, {
							fileName: _jsxFileName$7,
							lineNumber: 199,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
							variant: "ghost",
							onClick: onFinish,
							className: "w-full rounded-2xl text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700",
							children: "✋ Dừng tại đây"
						}, void 0, false, {
							fileName: _jsxFileName$7,
							lineNumber: 206,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$7,
					lineNumber: 192,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName$7,
			lineNumber: 177,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$7,
		lineNumber: 170,
		columnNumber: 5
	}, this);
}
function RecommitmentDialog({ open, lessonTitle, onContinueNext, onExtendBreak, onFinishSession }) {
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Tái cam kết phiên học",
		className: "fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "w-full max-w-md space-y-4 rounded-3xl border border-indigo-200 bg-white p-6 text-center shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-600 text-3xl shadow-lg",
					children: "☕"
				}, void 0, false, {
					fileName: _jsxFileName$7,
					lineNumber: 241,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-800",
						children: "Hết giờ nghỉ ngơi"
					}, void 0, false, {
						fileName: _jsxFileName$7,
						lineNumber: 245,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
						className: "mt-2 font-serif text-xl font-bold text-slate-900",
						children: "Sẵn sàng cho phiên học tiếp theo?"
					}, void 0, false, {
						fileName: _jsxFileName$7,
						lineNumber: 248,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "mt-1 text-xs leading-relaxed text-slate-600 break-words",
						children: ["Bài học: ", /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("strong", {
							className: "text-slate-800",
							children: lessonTitle
						}, void 0, false, {
							fileName: _jsxFileName$7,
							lineNumber: 252,
							columnNumber: 22
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$7,
						lineNumber: 251,
						columnNumber: 11
					}, this)
				] }, void 0, true, {
					fileName: _jsxFileName$7,
					lineNumber: 244,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "space-y-2 pt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
							onClick: onContinueNext,
							className: "w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-bold text-white shadow-lg hover:brightness-110",
							children: "▷ Bắt đầu phiên tiếp"
						}, void 0, false, {
							fileName: _jsxFileName$7,
							lineNumber: 256,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
							variant: "outline",
							onClick: onExtendBreak,
							className: "w-full rounded-2xl border-indigo-200 bg-indigo-50/50 text-xs font-bold text-indigo-800 hover:bg-indigo-100",
							children: "☕ Nghỉ thêm 5 phút"
						}, void 0, false, {
							fileName: _jsxFileName$7,
							lineNumber: 262,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
							variant: "ghost",
							onClick: onFinishSession,
							className: "w-full rounded-2xl text-xs font-semibold text-slate-500 hover:bg-slate-100",
							children: "🏁 Hoàn thành buổi học hôm nay"
						}, void 0, false, {
							fileName: _jsxFileName$7,
							lineNumber: 269,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$7,
					lineNumber: 255,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName$7,
			lineNumber: 240,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$7,
		lineNumber: 234,
		columnNumber: 5
	}, this);
}
/**
* Computes the local-only state shown when a non-owner tab observes natural
* expiry. It deliberately does not persist; only the lock owner may commit the
* terminal timer transition.
*/
function createNonOwnerExpiryLocalState(timerState, elapsedSeconds) {
	return {
		...timerState,
		isRunning: false,
		startTimestamp: null,
		accumulatedSeconds: Math.min(timerState.durationMinutes * 60, Math.max(timerState.accumulatedSeconds, elapsedSeconds)),
		status: "paused"
	};
}
var _jsxFileName$6 = "/app/applet/src/components/FocusTimerModal.tsx";
var STORAGE_SYNC_ERROR = "Dữ liệu đã được lưu nhưng giao diện chưa đồng bộ. Hãy tải lại trang.";
function isCommittedFocusSession(result) {
	return result.ok && "rewardsApplied" in result;
}
function FocusTimerModal({ lessonId, lessonTitle, isOpen, onClose, onRecordSession, onRewardsCommitted, onToggleComplete, isCompleted, initialMinutes }) {
	const [timerState, setTimerState] = (0, import_react.useState)(() => {
		const stored = getStoredTimerState();
		if (stored && lessonId && stored.lessonId === lessonId) {
			if (initialMinutes) return {
				...stored,
				durationMinutes: initialMinutes
			};
			return stored;
		}
		if (lessonId) {
			if (stored?.isRunning) return stored;
			const created = createStoredTimerState(lessonId, lessonTitle, isCompleted);
			if (initialMinutes) created.durationMinutes = initialMinutes;
			return created;
		}
		return stored;
	});
	const [preferences, setPreferences] = (0, import_react.useState)(() => loadFocusPreferences());
	const [elapsed, setElapsed] = (0, import_react.useState)(0);
	const [isFullScreen, setIsFullScreen] = (0, import_react.useState)(false);
	const [showSaveInfo, setShowSaveInfo] = (0, import_react.useState)(false);
	const [showAdvanced, setShowAdvanced] = (0, import_react.useState)(false);
	const [expiredPrompt, setExpiredPrompt] = (0, import_react.useState)(false);
	const [recommitmentPrompt, setRecommitmentPrompt] = (0, import_react.useState)(false);
	const [completionSummary, setCompletionSummary] = (0, import_react.useState)(null);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const savingSessionIdsRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const timerTabIdRef = (0, import_react.useRef)("");
	const mountedAtRef = (0, import_react.useRef)(Date.now());
	const explicitStartHandledRef = (0, import_react.useRef)(null);
	const closeButtonRef = (0, import_react.useRef)(null);
	const returnFocusRef = (0, import_react.useRef)(null);
	const persistTimerState = (0, import_react.useCallback)((next) => {
		const saved = saveStoredTimerState(next);
		if (!saved.ok) {
			toast.error(saved.error);
			return false;
		}
		setTimerState(next);
		return true;
	}, []);
	const updateState = (0, import_react.useCallback)((patch) => {
		if (!timerState) return false;
		return persistTimerState({
			...timerState,
			...patch
		});
	}, [persistTimerState, timerState]);
	const startFocusDuration = (0, import_react.useCallback)((baseState, durationMinutes) => {
		const next = createStartedFocusTimerState(baseState, durationMinutes);
		if (!acquireTimerLock(next.activeTimerSessionId, timerTabIdRef.current)) {
			toast.error("Một tab khác đang chạy Pomodoro. Hãy dừng timer ở tab đó trước.");
			return false;
		}
		if (!persistTimerState(next)) {
			releaseTimerLock(timerTabIdRef.current);
			return false;
		}
		setCompletionSummary(null);
		setExpiredPrompt(false);
		setRecommitmentPrompt(false);
		return true;
	}, [persistTimerState]);
	(0, import_react.useEffect)(() => {
		setMounted(true);
		timerTabIdRef.current = getTimerTabId();
	}, []);
	(0, import_react.useEffect)(() => {
		if (isOpen) setPreferences(loadFocusPreferences());
	}, [isOpen]);
	(0, import_react.useEffect)(() => {
		if (!isOpen) return;
		const active = document.activeElement;
		returnFocusRef.current = active instanceof HTMLElement ? active : null;
		const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
		return () => {
			window.clearTimeout(focusTimer);
			returnFocusRef.current?.focus();
		};
	}, [isOpen]);
	(0, import_react.useEffect)(() => {
		const handleBeforeUnload = () => releaseTimerLock(timerTabIdRef.current);
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, []);
	const [notifPermission, setNotifPermission] = (0, import_react.useState)(() => {
		if (typeof window !== "undefined" && "Notification" in window) return Notification.permission;
		return "default";
	});
	(0, import_react.useEffect)(() => {
		if (typeof window !== "undefined" && "Notification" in window) setNotifPermission(Notification.permission);
	}, [isOpen]);
	(0, import_react.useEffect)(() => {
		if (isOpen && timerState?.status === "expired") setExpiredPrompt(true);
	}, [isOpen, timerState?.status]);
	(0, import_react.useEffect)(() => {
		if (isFullScreen) {
			const originalOverflow = document.body.style.overflow;
			document.body.style.overflow = "hidden";
			return () => {
				document.body.style.overflow = originalOverflow;
			};
		}
	}, [isFullScreen]);
	const handleRequestNotif = () => {
		if (typeof window !== "undefined" && "Notification" in window) Notification.requestPermission().then((permission) => {
			setNotifPermission(permission);
			if (permission === "granted") toast.success("🔔 Đã bật thông báo trình duyệt khi hết giờ!");
			else if (permission === "denied") toast.error("Trình duyệt đang chặn thông báo. Vui lòng cho phép trong cài đặt trình duyệt.");
		});
		else toast.error("Trình duyệt của bạn không hỗ trợ thông báo Desktop.");
	};
	(0, import_react.useEffect)(() => {
		if (!lessonId) return;
		const stored = getStoredTimerState();
		if (stored?.isRunning) {
			setTimerState(stored);
			if (stored.lessonId !== lessonId) toast.info(`Một timer khác đang chạy cho bài "${stored.lessonTitle}".`);
			return;
		}
		const base = stored?.lessonId === lessonId ? {
			...stored,
			lessonTitle,
			isCompleted
		} : createStoredTimerState(lessonId, lessonTitle, isCompleted);
		if (initialMinutes != null) {
			const explicitStartKey = `${lessonId}:${initialMinutes}`;
			if (explicitStartHandledRef.current !== explicitStartKey) if (initialMinutes === 2 || preferences.autoStartSelectedDuration) {
				if (startFocusDuration(base, initialMinutes)) explicitStartHandledRef.current = explicitStartKey;
			} else {
				const readyState = {
					...base,
					durationMinutes: initialMinutes,
					lastFocusDuration: initialMinutes,
					accumulatedSeconds: 0,
					startTimestamp: null,
					isRunning: false,
					isMinimized: false,
					activeTimerSessionId: createStableId("timer"),
					status: "idle"
				};
				if (persistTimerState(readyState)) explicitStartHandledRef.current = explicitStartKey;
			}
			return;
		}
		explicitStartHandledRef.current = null;
		const saved = saveStoredTimerState(base);
		if (saved.ok) setTimerState(base);
		else toast.error(saved.error);
	}, [
		initialMinutes,
		isCompleted,
		lessonId,
		lessonTitle,
		persistTimerState,
		preferences.autoStartSelectedDuration,
		startFocusDuration
	]);
	(0, import_react.useEffect)(() => {
		const handleStorage = (event) => {
			if (event.key !== "hocvien-focus-timer-v2") return;
			const external = getStoredTimerState();
			setTimerState((current) => {
				if (external?.activeTimerSessionId === current?.activeTimerSessionId) return current;
				if (external) toast.info(`Timer được đồng bộ từ tab khác: "${external.lessonTitle}".`);
				return external;
			});
		};
		window.addEventListener("storage", handleStorage);
		return () => window.removeEventListener("storage", handleStorage);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!timerState?.isRunning || preferences.keepRunningAcrossTabs) return;
		const pauseWhenHidden = () => {
			if (document.visibilityState !== "hidden") return;
			setTimerState((current) => {
				if (!current?.isRunning) return current;
				const paused = {
					...current,
					accumulatedSeconds: calculateElapsedSeconds(current),
					startTimestamp: null,
					isRunning: false,
					status: "paused"
				};
				const saved = saveStoredTimerState(paused);
				if (!saved.ok) {
					toast.error(saved.error);
					return current;
				}
				releaseTimerLock(timerTabIdRef.current);
				return paused;
			});
		};
		document.addEventListener("visibilitychange", pauseWhenHidden);
		return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
	}, [preferences.keepRunningAcrossTabs, timerState?.isRunning]);
	(0, import_react.useEffect)(() => {
		if (timerState?.isRunning && timerState.ambientSound !== "none") playAmbientSound(timerState.ambientSound, preferences.soundVolume);
		else stopAmbientSound();
		return () => {
			stopAmbientSound();
		};
	}, [
		preferences.soundVolume,
		timerState?.ambientSound,
		timerState?.isRunning
	]);
	(0, import_react.useEffect)(() => {
		if (!timerState?.isRunning) return;
		const heartbeat = window.setInterval(() => {
			if (!refreshTimerLock(timerState.activeTimerSessionId, timerTabIdRef.current)) {
				setTimerState((current) => current ? {
					...current,
					accumulatedSeconds: calculateElapsedSeconds(current),
					startTimestamp: null,
					isRunning: false,
					status: "paused"
				} : current);
				toast.error("Timer đang được điều khiển ở một tab khác.");
			}
		}, 4e3);
		return () => window.clearInterval(heartbeat);
	}, [persistTimerState, timerState]);
	(0, import_react.useEffect)(() => {
		const handleShortcut = (event) => {
			if (document.querySelector("[data-timer-overlay='true']")) return;
			const target = event.target;
			if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT" || target?.isContentEditable) return;
			const key = event.key.toLowerCase();
			const selector = event.code === "Space" ? "[data-timer-action='start-pause']" : key === "s" ? "[data-timer-action='save']" : key === "r" ? "[data-timer-action='reset']" : null;
			if (key === "m") {
				event.preventDefault();
				setTimerState((current) => {
					if (!current) return current;
					const next = {
						...current,
						ambientSound: current.ambientSound === "none" ? "rain" : "none"
					};
					const saved = saveStoredTimerState(next);
					if (!saved.ok) {
						toast.error(saved.error);
						return current;
					}
					return next;
				});
				return;
			}
			if (!selector) return;
			event.preventDefault();
			document.querySelector(selector)?.click();
		};
		window.addEventListener("keydown", handleShortcut);
		return () => window.removeEventListener("keydown", handleShortcut);
	}, []);
	const lastTickSecondRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!timerState) return;
		const update = () => {
			const el = calculateElapsedSeconds(timerState);
			setElapsed(el);
			const totalSec = timerState.durationMinutes * 60;
			const remSec = Math.max(0, Math.ceil(totalSec - el));
			if (timerState.isRunning && remSec > 0 && remSec <= 10) {
				if (lastTickSecondRef.current !== remSec) {
					lastTickSecondRef.current = remSec;
					if (preferences.soundAlertsEnabled) playClockTick(preferences.soundVolume, remSec % 2 === 0);
				}
			} else if (!timerState.isRunning) lastTickSecondRef.current = null;
			if (el >= totalSec && timerState.isRunning) {
				if (!refreshTimerLock(timerState.activeTimerSessionId, timerTabIdRef.current)) {
					setTimerState((current) => current?.activeTimerSessionId === timerState.activeTimerSessionId ? createNonOwnerExpiryLocalState(current, el) : current);
					toast.error("Phiên đã hết giờ ở tab này, nhưng đang được tab khác quản lý. Dữ liệu của tab đó không bị thay đổi.");
					return;
				}
				const expectedEnd = timerExpectedEndTimestamp(timerState) ?? Date.now();
				if (shouldRecoverExpiredTimer(timerState, mountedAtRef.current) && timerState.status !== "expired") {
					const expiredState = {
						...timerState,
						isRunning: false,
						startTimestamp: null,
						accumulatedSeconds: totalSec,
						status: "expired",
						expiredAt: new Date(expectedEnd).toISOString()
					};
					if (!persistTimerState(expiredState)) return;
					setExpiredPrompt(true);
					releaseTimerLock(timerTabIdRef.current);
					return;
				}
				lastTickSecondRef.current = null;
				stopAmbientSound();
				const isFocusMode = timerState.timerMode === "pomodoro";
				if (preferences.soundAlertsEnabled) playCompletionChime(isFocusMode ? "study" : "break", preferences.soundVolume);
				const isWarmupFocus = isFocusMode && timerState.durationMinutes <= 2;
				const newPomodoros = isFocusMode && !isWarmupFocus ? timerState.completedPomodoros + 1 : timerState.completedPomodoros;
				const shouldAutoStart = isFocusMode ? preferences.autoStartBreak : preferences.autoStartFocus;
				if (isFocusMode) {
					const sessionId = timerState.activeTimerSessionId;
					const alreadySaved = timerState.savedSessionIds.includes(sessionId) || savingSessionIdsRef.current.has(sessionId);
					const focusMins = timerState.durationMinutes;
					const rewards = calculateSessionRewards(focusMins);
					const targetCycles = timerState.longBreakTargetCycles || 4;
					const isLongBreak = newPomodoros > 0 && newPomodoros % targetCycles === 0;
					const nextMode = isLongBreak ? "longBreak" : "shortBreak";
					let nextMins = isLongBreak ? timerState.longBreakMinutes || 20 : timerState.shortBreakMinutes || 10;
					const smartBreakMinutes = getSmartBreakMinutes(focusMins);
					if (!isLongBreak && smartBreakMinutes != null) nextMins = smartBreakMinutes;
					const nextSessionId = createStableId("timer");
					const startedNext = !isWarmupFocus && shouldAutoStart && acquireTimerLock(nextSessionId, timerTabIdRef.current);
					const nextState = isWarmupFocus ? {
						...timerState,
						isRunning: false,
						isMinimized: false,
						startTimestamp: null,
						accumulatedSeconds: 0,
						completedPomodoros: newPomodoros,
						activeTimerSessionId: nextSessionId,
						savedSessionIds: alreadySaved ? timerState.savedSessionIds : [...timerState.savedSessionIds, sessionId].slice(-100),
						status: "warmup_completed",
						expiredAt: void 0
					} : {
						...timerState,
						timerMode: nextMode,
						durationMinutes: nextMins,
						lastFocusDuration: focusMins,
						isRunning: startedNext,
						startTimestamp: startedNext ? Date.now() : null,
						accumulatedSeconds: 0,
						completedPomodoros: newPomodoros,
						activeTimerSessionId: nextSessionId,
						savedSessionIds: alreadySaved ? timerState.savedSessionIds : [...timerState.savedSessionIds, sessionId].slice(-100),
						status: startedNext ? "running" : "breaking",
						activePresetId: timerState.pendingPresetId ?? timerState.activePresetId,
						pendingPresetId: void 0
					};
					if (!alreadySaved) savingSessionIdsRef.current.add(sessionId);
					const session = createStudySession({
						id: sessionId,
						lessonId: timerState.lessonId,
						durationSeconds: timerState.durationMinutes * 60,
						source: "focus-timer",
						timerPreset: timerState.activePresetId
					});
					const persisted = alreadySaved ? saveStoredTimerState(nextState) : recordFocusSessionAndTimerStateAtomically(session, nextState, rewards);
					if (!persisted.ok) {
						if (!alreadySaved) savingSessionIdsRef.current.delete(sessionId);
						if (startedNext) releaseTimerLock(timerTabIdRef.current);
						const pausedState = {
							...timerState,
							isRunning: false,
							startTimestamp: null,
							accumulatedSeconds: totalSec,
							status: "paused"
						};
						if (persistTimerState(pausedState)) releaseTimerLock(timerTabIdRef.current);
						toast.error(`${persisted.error} Phiên chưa được đánh dấu là đã lưu.`);
						return;
					}
					if (!alreadySaved) savingSessionIdsRef.current.delete(sessionId);
					setTimerState(nextState);
					if (!startedNext) releaseTimerLock(timerTabIdRef.current);
					if (!alreadySaved && isCommittedFocusSession(persisted) && persisted.rewardsApplied) {
						onRewardsCommitted?.({
							xp: rewards.xp,
							coins: rewards.coins,
							previousXp: persisted.previousXp,
							nextXp: persisted.nextXp
						});
						toast.success(`🎉 Hoàn thành phiên ${focusMins}p! +${rewards.xp} XP · +${rewards.coins} 🪙`);
					}
					if (!alreadySaved && onRecordSession(session) === false) {
						toast.error(STORAGE_SYNC_ERROR);
						return;
					}
					if (onToggleComplete && !isCompleted && timerState?.lessonId) {
						const loadRes = loadProgressStorage();
						if (loadRes.status === "ok" && loadRes.value) {
							if (getLessonCompletedMinutes(timerState.lessonId, loadRes.value) >= 120) {
								onToggleComplete(timerState.lessonId);
								toast.success("🎉 Bạn đã tích lũy đủ 120 phút học! Bài học đã tự động hoàn thành.");
							}
						}
					}
					if (isWarmupFocus) {
						setCompletionSummary(null);
						if (preferences.notifyWhenComplete) sendDesktopNotification("⚡ Hoàn thành 2 phút khởi động!", `Bạn đã bắt đầu bài "${timerState.lessonTitle}". Chọn học tiếp 25 phút, Deep Work 50 phút hoặc dừng tại đây.`);
						toast.success("Đã ghi nhận 2 phút khởi động. Chọn nhịp học tiếp theo.", { duration: 6e3 });
						return;
					}
					setCompletionSummary({
						minutes: focusMins,
						lessonTitle: timerState.lessonTitle,
						nextMode,
						nextMinutes: nextMins
					});
					if (preferences.notifyWhenComplete) sendDesktopNotification("🍅 Hoàn thành phiên tập trung!", `Chúc mừng bạn vừa học xong ${focusMins}p bài "${timerState.lessonTitle}". ${startedNext ? "Tự động bắt đầu ngay" : "Đã chuyển sang"} ${isLongBreak ? "Nghỉ dài 🌴" : "Nghỉ ngắn ☕"} (${nextMins}p).`);
					toast.success(`🎉 Hoàn thành ${focusMins}p tập trung (${newPomodoros}/${targetCycles} phiên)! ${startedNext ? "⚡ Đã tự động BẮT ĐẦU phiên" : "Đã tự động cộng thời gian học & chuyển sang"} ${isLongBreak ? "Nghỉ dài 🌴" : "Nghỉ ngắn ☕"} (${nextMins}p).`, { duration: 8e3 });
				} else {
					const returnFocusMins = timerState.lastFocusDuration || 25;
					const nextSessionId = createStableId("timer");
					const startedNext = shouldAutoStart && acquireTimerLock(nextSessionId, timerTabIdRef.current);
					const nextState = {
						...timerState,
						timerMode: "pomodoro",
						durationMinutes: returnFocusMins,
						isRunning: startedNext,
						startTimestamp: startedNext ? Date.now() : null,
						accumulatedSeconds: 0,
						activeTimerSessionId: nextSessionId,
						status: startedNext ? "running" : "session_waiting",
						activePresetId: timerState.pendingPresetId ?? timerState.activePresetId,
						pendingPresetId: void 0
					};
					if (!persistTimerState(nextState)) {
						if (startedNext) releaseTimerLock(timerTabIdRef.current);
						return;
					}
					if (!startedNext) {
						releaseTimerLock(timerTabIdRef.current);
						setRecommitmentPrompt(true);
					}
					if (preferences.notifyWhenComplete) sendDesktopNotification("☕ Hết giờ nghỉ ngơi!", startedNext ? `Đã hết giờ nghỉ! Tự động BẮT ĐẦU ngay phiên Tập trung mới (${returnFocusMins}p) cho bài "${timerState.lessonTitle}".` : `Đã hết giờ nghỉ! Tự động quay lại Chế độ Tập trung (${returnFocusMins}p) cho bài "${timerState.lessonTitle}". Bấm Bắt đầu khi sẵn sàng!`);
					if (startedNext) toast.success(`⚡ Đã hết giờ nghỉ! Tự động BẮT ĐẦU phiên Tập trung mới (${returnFocusMins}p). Cùng tập trung nhé!`, { duration: 8e3 });
					else toast.info(`🔔 Đã hết giờ nghỉ! Tự động chuyển về Chế độ Tập trung (${returnFocusMins}p). Bấm Bắt đầu khi bạn sẵn sàng!`, { duration: 8e3 });
				}
			}
		};
		update();
		const interval = setInterval(update, 1e3);
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") update();
		};
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			clearInterval(interval);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [
		isCompleted,
		onRecordSession,
		onRewardsCommitted,
		onToggleComplete,
		persistTimerState,
		preferences.autoStartBreak,
		preferences.autoStartFocus,
		preferences.soundAlertsEnabled,
		preferences.soundVolume,
		timerState
	]);
	if (!mounted || !isOpen || !timerState || !timerState.lessonId) return null;
	const totalSecs = timerState.durationMinutes * 60;
	const timeLeft = Math.max(0, totalSecs - elapsed);
	const elapsedMinutes = Math.floor(elapsed / 60);
	const progressPercent = Math.min(100, Math.max(0, elapsed / totalSecs * 100));
	const formatTime = (secs) => {
		const m = Math.floor(secs / 60);
		const s = secs % 60;
		return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	};
	const handleStartPause = () => {
		if (timerState.isRunning) {
			if (!refreshTimerLock(timerState.activeTimerSessionId, timerTabIdRef.current)) {
				toast.error("Một tab khác đang điều khiển Pomodoro. Hãy quay lại tab đó để tạm dừng.");
				return;
			}
			const currentElapsed = calculateElapsedSeconds(timerState);
			if (updateState({
				isRunning: false,
				startTimestamp: null,
				accumulatedSeconds: currentElapsed,
				status: "paused"
			})) {
				const released = releaseTimerLock(timerTabIdRef.current);
				if (!released.ok) toast.error(released.error);
			}
		} else {
			if (!acquireTimerLock(timerState.activeTimerSessionId, timerTabIdRef.current)) {
				toast.error("Một tab khác đang chạy Pomodoro. Hãy dừng timer ở tab đó trước.");
				return;
			}
			if (!updateState({
				isRunning: true,
				startTimestamp: Date.now(),
				status: "running"
			})) releaseTimerLock(timerTabIdRef.current);
		}
	};
	const handleReset = () => {
		if (elapsed > 0 && !window.confirm(`Bạn muốn đặt lại phiên hiện tại? ${Math.max(1, Math.round(elapsed / 60))} phút chưa lưu sẽ bị mất.`)) return;
		updateState({
			isRunning: false,
			startTimestamp: null,
			accumulatedSeconds: 0,
			activeTimerSessionId: createStableId("timer"),
			status: "idle"
		});
		releaseTimerLock(timerTabIdRef.current);
	};
	const handleSwitchMode = (mode) => {
		if (mode === timerState.timerMode) return;
		if (timerState.isRunning) {
			toast.info("Hãy tạm dừng hoặc kết thúc phiên trước khi đổi chế độ.");
			return;
		}
		if (elapsed > 0 && !window.confirm("Đổi chế độ sẽ bỏ phần thời gian chưa lưu của phiên hiện tại. Tiếp tục?")) return;
		stopAmbientSound();
		let mins = MODE_DEFAULTS[mode].minutes;
		if (mode === "pomodoro") mins = timerState.lastFocusDuration || 50;
		else if (mode === "shortBreak") mins = timerState.shortBreakMinutes || 10;
		else if (mode === "longBreak") mins = timerState.longBreakMinutes || 20;
		updateState({
			timerMode: mode,
			durationMinutes: mins,
			isRunning: false,
			startTimestamp: null,
			accumulatedSeconds: 0,
			activeTimerSessionId: createStableId("timer"),
			status: "idle"
		});
	};
	const handleApplyPreset = (presetId) => {
		const p = FOCUS_PRESETS.find((item) => item.id === presetId);
		if (!p) return;
		if (timerState.isRunning || elapsed > 0) {
			if (!updateState({
				shortBreakMinutes: p.shortBreakMins,
				longBreakMinutes: p.longBreakMins,
				lastFocusDuration: p.focusMins,
				pendingPresetId: p.id
			})) return;
			toast.success(`Preset ${p.label} sẽ áp dụng từ phiên tiếp theo.`);
			return;
		}
		const mins = timerState.timerMode === "pomodoro" ? p.focusMins : timerState.timerMode === "shortBreak" ? p.shortBreakMins : p.longBreakMins;
		if (!updateState({
			durationMinutes: mins,
			shortBreakMinutes: p.shortBreakMins,
			longBreakMinutes: p.longBreakMins,
			lastFocusDuration: p.focusMins,
			accumulatedSeconds: 0,
			activeTimerSessionId: createStableId("timer"),
			status: "idle",
			activePresetId: p.id,
			pendingPresetId: void 0
		})) return;
		toast.success(`Đã chọn preset: ${p.label} (${p.description})`);
	};
	const handleFinishEarly = (markDone) => {
		const sessionId = timerState.activeTimerSessionId;
		if (savingSessionIdsRef.current.has(sessionId) || timerState.status === "saving") return;
		stopAmbientSound();
		const elapsedSeconds = calculateElapsedSeconds(timerState);
		if (timerState.timerMode !== "pomodoro") {
			const next = {
				...timerState,
				timerMode: "pomodoro",
				durationMinutes: timerState.lastFocusDuration || 50,
				isRunning: false,
				startTimestamp: null,
				accumulatedSeconds: 0,
				activeTimerSessionId: createStableId("timer"),
				status: "idle"
			};
			if (!persistTimerState(next)) return;
			const released = releaseTimerLock(timerTabIdRef.current);
			if (!released.ok) toast.error(released.error);
			toast.info("Đã kết thúc giờ nghỉ. Phiên tập trung tiếp theo đã sẵn sàng.");
			return;
		}
		if (elapsedSeconds <= 0) {
			toast.error("Timer chưa chạy nên chưa có thời gian để lưu.");
			return;
		}
		const completedState = {
			...timerState,
			isRunning: false,
			startTimestamp: null,
			accumulatedSeconds: 0,
			status: "completed",
			savedSessionIds: timerState.savedSessionIds.includes(sessionId) ? timerState.savedSessionIds : [...timerState.savedSessionIds, sessionId].slice(-100)
		};
		savingSessionIdsRef.current.add(sessionId);
		const session = createStudySession({
			id: sessionId,
			lessonId: timerState.lessonId,
			durationSeconds: elapsedSeconds,
			source: "focus-timer",
			timerPreset: timerState.activePresetId
		});
		const persisted = recordFocusSessionAndTimerStateAtomically(session, completedState);
		if (!persisted.ok) {
			savingSessionIdsRef.current.delete(sessionId);
			toast.error(`${persisted.error} Phiên chưa được đánh dấu là đã lưu.`);
			return;
		}
		if (onRecordSession(session) === false) {
			savingSessionIdsRef.current.delete(sessionId);
			toast.error(STORAGE_SYNC_ERROR);
			return;
		}
		setTimerState(completedState);
		const released = releaseTimerLock(timerTabIdRef.current);
		if (!released.ok) toast.error(released.error);
		const savedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
		toast.success(`Đã lưu ${savedMinutes} phút học thực tế.`);
		setCompletionSummary({
			minutes: savedMinutes,
			lessonTitle: timerState.lessonTitle,
			nextMode: "shortBreak",
			nextMinutes: timerState.shortBreakMinutes
		});
		if (markDone && onToggleComplete && !isCompleted) onToggleComplete(timerState.lessonId);
	};
	const handleDurationChange = (newMins) => {
		updateState({
			durationMinutes: newMins,
			lastFocusDuration: timerState.timerMode === "pomodoro" ? newMins : timerState.lastFocusDuration,
			isRunning: false,
			startTimestamp: null,
			accumulatedSeconds: 0,
			activeTimerSessionId: createStableId("timer"),
			activePresetId: void 0,
			status: "idle"
		});
	};
	const handleAddExtraMinutes = (extraMins) => {
		if (!updateState({
			durationMinutes: timerState.durationMinutes + extraMins,
			activePresetId: void 0
		})) return;
		toast.info(`Đã gia hạn thêm +${extraMins} phút!`);
	};
	const handleToggleFullScreen = () => {
		setIsFullScreen((prev) => !prev);
	};
	const handleCloseModal = () => {
		if (timerState.isRunning) {
			if (preferences.showMiniTimer) {
				if (updateState({ isMinimized: true })) {
					setIsFullScreen(false);
					toast.info("Timer vẫn đang chạy và đã được thu nhỏ.");
				}
				return;
			}
			if (preferences.confirmBeforeStop && !window.confirm("Dừng phiên đang chạy và lưu thời gian đã học?")) return;
			if (calculateElapsedSeconds(timerState) > 0) handleFinishEarly(false);
			else {
				const cleared = saveStoredTimerState(null);
				if (!cleared.ok) {
					toast.error(cleared.error);
					return;
				}
				releaseTimerLock(timerTabIdRef.current);
				setTimerState(null);
			}
			setIsFullScreen(false);
			onClose();
			return;
		}
		setIsFullScreen(false);
		if (timerState.status === "completed") {
			const cleared = saveStoredTimerState(null);
			if (!cleared.ok) {
				toast.error(cleared.error);
				return;
			}
			setTimerState(null);
		}
		onClose();
	};
	const handleTimerDialogKeyDown = (event) => {
		if (event.key === "Escape") {
			event.preventDefault();
			if (timerState.isRunning) {
				updateState({ isMinimized: true });
				setIsFullScreen(false);
				toast.info("Timer đang chạy đã được thu nhỏ; nhấn mở rộng để tiếp tục điều khiển.");
			} else handleCloseModal();
			return;
		}
		if (event.key !== "Tab") return;
		const focusable = Array.from(event.currentTarget.querySelectorAll("button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])")).filter((element) => !element.hasAttribute("aria-hidden"));
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (!first || !last) return;
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	};
	const modeColors = {
		pomodoro: {
			bg: "from-rose-500/10 via-amber-500/5 to-white",
			ring: "stroke-rose-500",
			text: "text-rose-600",
			btn: "bg-rose-600 hover:bg-rose-700 text-white",
			badge: "bg-rose-100 text-rose-800 border-rose-200",
			accentBg: "bg-rose-50 border-rose-200 text-rose-900"
		},
		shortBreak: {
			bg: "from-emerald-500/10 via-teal-500/5 to-white",
			ring: "stroke-emerald-500",
			text: "text-emerald-600",
			btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
			badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
			accentBg: "bg-emerald-50 border-emerald-200 text-emerald-900"
		},
		longBreak: {
			bg: "from-sky-500/10 via-indigo-500/5 to-white",
			ring: "stroke-sky-500",
			text: "text-sky-600",
			btn: "bg-sky-600 hover:bg-sky-700 text-white",
			badge: "bg-sky-100 text-sky-800 border-sky-200",
			accentBg: "bg-sky-50 border-sky-200 text-sky-900"
		}
	}[timerState.timerMode];
	const targetCycles = timerState.longBreakTargetCycles || 4;
	const startModeFromSummary = (mode, minutes) => {
		const sessionId = createStableId("timer");
		if (!acquireTimerLock(sessionId, timerTabIdRef.current)) {
			toast.error("Một tab khác đang chạy Pomodoro.");
			return;
		}
		const next = {
			...timerState,
			timerMode: mode,
			durationMinutes: minutes,
			lastFocusDuration: mode === "pomodoro" ? timerState.lastFocusDuration : timerState.lastFocusDuration,
			activeTimerSessionId: sessionId,
			accumulatedSeconds: 0,
			startTimestamp: Date.now(),
			isRunning: true,
			status: "running"
		};
		if (!persistTimerState(next)) {
			releaseTimerLock(timerTabIdRef.current);
			return;
		}
		setCompletionSummary(null);
	};
	const handleExpiredDecision = (save) => {
		const sessionId = timerState.activeTimerSessionId;
		const totalSeconds = timerState.durationMinutes * 60;
		const isWarmup = timerState.timerMode === "pomodoro" && timerState.durationMinutes <= 2;
		const needsSessionRecord = save && timerState.timerMode === "pomodoro" && !timerState.savedSessionIds.includes(sessionId);
		const next = {
			...timerState,
			isRunning: false,
			isMinimized: save && isWarmup ? false : timerState.isMinimized,
			startTimestamp: null,
			accumulatedSeconds: 0,
			status: save ? isWarmup ? "warmup_completed" : "completed" : "idle",
			activeTimerSessionId: createStableId("timer"),
			expiredAt: void 0,
			savedSessionIds: save && !timerState.savedSessionIds.includes(sessionId) ? [...timerState.savedSessionIds, sessionId].slice(-100) : timerState.savedSessionIds
		};
		const session = createStudySession({
			id: sessionId,
			lessonId: timerState.lessonId,
			durationSeconds: totalSeconds,
			source: "focus-timer",
			timerPreset: timerState.activePresetId,
			endedAt: timerState.expiredAt
		});
		const rewards = calculateSessionRewards(timerState.durationMinutes);
		const persisted = needsSessionRecord ? recordFocusSessionAndTimerStateAtomically(session, next, rewards) : saveStoredTimerState(next);
		if (!persisted.ok) {
			toast.error(`${persisted.error} Phiên chưa được đánh dấu là đã lưu.`);
			return;
		}
		setExpiredPrompt(false);
		setTimerState(next);
		if (needsSessionRecord && isCommittedFocusSession(persisted) && persisted.rewardsApplied) onRewardsCommitted?.({
			xp: rewards.xp,
			coins: rewards.coins,
			previousXp: persisted.previousXp,
			nextXp: persisted.nextXp
		});
		if (needsSessionRecord && onRecordSession(session) === false) {
			toast.error(STORAGE_SYNC_ERROR);
			return;
		}
		if (needsSessionRecord && !isWarmup) setCompletionSummary({
			minutes: timerState.durationMinutes,
			lessonTitle: timerState.lessonTitle,
			nextMode: "shortBreak",
			nextMinutes: timerState.shortBreakMinutes
		});
		else setCompletionSummary(null);
		toast[save ? "success" : "info"](save ? `Đã lưu ${timerState.durationMinutes} phút học.` : "Đã bỏ qua phiên hết hạn.");
	};
	const handleReturnToToday = () => {
		const cleared = saveStoredTimerState(null);
		if (!cleared.ok) {
			toast.error(cleared.error);
			return;
		}
		setCompletionSummary(null);
		setTimerState(null);
		onClose();
	};
	const sharedDialogs = /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SaveTimeInfoDialog, {
			open: showSaveInfo,
			onClose: () => setShowSaveInfo(false)
		}, void 0, false, {
			fileName: _jsxFileName$6,
			lineNumber: 1198,
			columnNumber: 7
		}, this),
		/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TimerRecoveryDialogs, {
			expiredPrompt,
			lessonTitle: timerState.lessonTitle,
			durationMinutes: timerState.durationMinutes,
			completionSummary,
			canCompleteLesson: Boolean(onToggleComplete && !isCompleted),
			onExpiredDecision: handleExpiredDecision,
			onCompleteLesson: () => onToggleComplete?.(timerState.lessonId),
			onStartMode: startModeFromSummary,
			onReturnToday: handleReturnToToday,
			lastFocusDuration: timerState.lastFocusDuration
		}, void 0, false, {
			fileName: _jsxFileName$6,
			lineNumber: 1199,
			columnNumber: 7
		}, this),
		/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RecommitmentDialog, {
			open: recommitmentPrompt && timerState.status === "session_waiting",
			lessonTitle: timerState.lessonTitle,
			onContinueNext: () => {
				if (!startFocusDuration(timerState, timerState.lastFocusDuration || 25)) return;
				setRecommitmentPrompt(false);
			},
			onExtendBreak: () => {
				startModeFromSummary("shortBreak", 5);
				setRecommitmentPrompt(false);
			},
			onFinishSession: handleReturnToToday
		}, void 0, false, {
			fileName: _jsxFileName$6,
			lineNumber: 1211,
			columnNumber: 7
		}, this),
		/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(MicroStartDialog, {
			open: timerState.status === "warmup_completed",
			onContinue: (minutes) => {
				if (!startFocusDuration(timerState, minutes)) return;
				toast.success(`Đã tự động bắt đầu phiên ${minutes} phút.`);
			},
			onFinish: () => {
				toast.info("Đã ghi nhận phiên khởi động 2 phút.");
				handleReturnToToday();
			}
		}, void 0, false, {
			fileName: _jsxFileName$6,
			lineNumber: 1224,
			columnNumber: 7
		}, this)
	] }, void 0, true, {
		fileName: _jsxFileName$6,
		lineNumber: 1197,
		columnNumber: 5
	}, this);
	if (timerState.isMinimized) return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl border border-rose-200 bg-white/95 p-3 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-3",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "relative flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-bold",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
					className: "text-lg",
					children: MODE_DEFAULTS[timerState.timerMode].emoji
				}, void 0, false, {
					fileName: _jsxFileName$6,
					lineNumber: 1245,
					columnNumber: 15
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$6,
				lineNumber: 1244,
				columnNumber: 13
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "text-xs font-semibold max-w-[150px] truncate",
				children: timerState.lessonTitle
			}, void 0, false, {
				fileName: _jsxFileName$6,
				lineNumber: 1248,
				columnNumber: 15
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "text-sm font-bold text-rose-600 font-mono",
				children: formatTime(timeLeft)
			}, void 0, false, {
				fileName: _jsxFileName$6,
				lineNumber: 1251,
				columnNumber: 15
			}, this)] }, void 0, true, {
				fileName: _jsxFileName$6,
				lineNumber: 1247,
				columnNumber: 13
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$6,
			lineNumber: 1243,
			columnNumber: 11
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "flex items-center gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
					size: "icon",
					variant: "ghost",
					className: "h-8 w-8 rounded-full",
					onClick: handleStartPause,
					"data-timer-action": "start-pause",
					"aria-label": timerState.isRunning ? "Tạm dừng phiên tập trung" : "Bắt đầu phiên tập trung",
					children: timerState.isRunning ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Pause, { className: "h-4 w-4" }, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 1268,
						columnNumber: 39
					}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Play, { className: "h-4 w-4" }, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 1268,
						columnNumber: 71
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName$6,
					lineNumber: 1258,
					columnNumber: 13
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
					size: "icon",
					variant: "ghost",
					className: "h-8 w-8 rounded-full",
					onClick: () => updateState({ isMinimized: false }),
					title: "Mở rộng",
					"aria-label": "Mở rộng đồng hồ tập trung",
					children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Maximize2, { className: "h-4 w-4" }, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 1278,
						columnNumber: 15
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName$6,
					lineNumber: 1270,
					columnNumber: 13
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
					size: "icon",
					variant: "ghost",
					className: "h-8 w-8 rounded-full text-muted-foreground hover:text-rose-500",
					onClick: handleCloseModal,
					title: "Đóng",
					"aria-label": "Đóng đồng hồ tập trung",
					children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(X, { className: "h-4 w-4" }, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 1288,
						columnNumber: 15
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName$6,
					lineNumber: 1280,
					columnNumber: 13
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName$6,
			lineNumber: 1257,
			columnNumber: 11
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$6,
		lineNumber: 1242,
		columnNumber: 9
	}, this), sharedDialogs] }, void 0, true, {
		fileName: _jsxFileName$6,
		lineNumber: 1241,
		columnNumber: 7
	}, this), document.body);
	if (isFullScreen) return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Đồng hồ tập trung",
		onKeyDown: handleTimerDialogKeyDown,
		className: "fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-md animate-in fade-in transition-all duration-300 p-0",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "relative h-screen w-screen border-0 bg-gradient-to-br from-white via-slate-50/80 to-slate-100/60 p-4 md:p-6 shadow-2xl overflow-hidden flex flex-col justify-between",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex items-center justify-between pb-2 border-b border-slate-200/80 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 font-extrabold text-base shadow-xs",
							children: "🍅"
						}, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 1312,
							columnNumber: 15
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
								className: "font-bold text-base text-slate-800",
								children: "Phiên tập trung"
							}, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 1317,
								columnNumber: 19
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 flex items-center gap-1 border border-rose-200",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Sparkles, { className: "h-3 w-3" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1319,
									columnNumber: 21
								}, this), " Phóng to Web"]
							}, void 0, true, {
								fileName: _jsxFileName$6,
								lineNumber: 1318,
								columnNumber: 19
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$6,
							lineNumber: 1316,
							columnNumber: 17
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: "text-xs text-muted-foreground",
							children: "Timer học · nghỉ thông minh · chạy nền chính xác"
						}, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 1322,
							columnNumber: 17
						}, this)] }, void 0, true, {
							fileName: _jsxFileName$6,
							lineNumber: 1315,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$6,
						lineNumber: 1311,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
								size: "icon",
								variant: "ghost",
								className: "h-8 w-8 rounded-full bg-slate-200 text-slate-800 hover:bg-slate-300",
								onClick: handleToggleFullScreen,
								title: "Thu nhỏ về dạng Modal",
								"aria-label": "Thu nhỏ đồng hồ tập trung",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Minimize, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1337,
									columnNumber: 17
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 1329,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
								size: "icon",
								variant: "ghost",
								className: "h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100",
								onClick: () => updateState({ isMinimized: true }),
								title: "Thu nhỏ góc màn hình",
								"aria-label": "Thu nhỏ đồng hồ tập trung về góc màn hình",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Minimize2, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1348,
									columnNumber: 17
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 1340,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
								size: "icon",
								variant: "ghost",
								className: "h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100",
								onClick: handleCloseModal,
								"aria-label": "Đóng đồng hồ tập trung",
								ref: closeButtonRef,
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(X, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1359,
									columnNumber: 17
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 1351,
								columnNumber: 15
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$6,
						lineNumber: 1328,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$6,
					lineNumber: 1310,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex-1 min-h-0 py-2 my-auto flex items-center justify-center w-full max-w-6xl mx-auto",
					children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center w-full max-h-full",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "md:col-span-5 flex flex-col items-center justify-center text-center space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "text-[11px] font-semibold text-slate-500 uppercase tracking-wider",
									children: "Bài học hiện tại"
								}, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1370,
									columnNumber: 19
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
									className: "font-serif font-bold text-slate-800 text-lg md:text-xl lg:text-2xl max-w-md mx-auto line-clamp-2",
									children: timerState.lessonTitle
								}, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1373,
									columnNumber: 19
								}, this)] }, void 0, true, {
									fileName: _jsxFileName$6,
									lineNumber: 1369,
									columnNumber: 17
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "flex justify-center items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
											className: "text-[11px] font-medium text-slate-500 mr-1",
											children: "Tiến độ vòng lặp:"
										}, void 0, false, {
											fileName: _jsxFileName$6,
											lineNumber: 1380,
											columnNumber: 19
										}, this),
										Array.from({ length: targetCycles }).map((_, idx) => {
											const sessionInCycle = timerState.completedPomodoros % targetCycles;
											const isFilled = idx < sessionInCycle || sessionInCycle === 0 && timerState.completedPomodoros > 0;
											return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
												className: cn("text-lg transition-transform", isFilled ? "scale-110 opacity-100" : "opacity-30"),
												title: `Phiên ${idx + 1}/${targetCycles}`,
												children: "🍅"
											}, idx, false, {
												fileName: _jsxFileName$6,
												lineNumber: 1389,
												columnNumber: 23
											}, this);
										}),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
											className: "text-xs font-bold text-slate-700 ml-1",
											children: [
												"(",
												timerState.completedPomodoros,
												" phiên)"
											]
										}, void 0, true, {
											fileName: _jsxFileName$6,
											lineNumber: 1401,
											columnNumber: 19
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName$6,
									lineNumber: 1379,
									columnNumber: 17
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: cn("relative mx-auto flex items-center justify-center rounded-full border-4 border-slate-100 bg-gradient-to-b shadow-inner transition-all duration-500 shrink-0", modeColors.bg, "h-48 w-48 lg:h-56 lg:w-56"),
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("svg", {
										className: "absolute inset-0 h-full w-full -rotate-90",
										viewBox: "0 0 192 192",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("circle", {
											cx: "96",
											cy: "96",
											r: "88",
											className: "stroke-slate-100",
											strokeWidth: "8",
											fill: "none"
										}, void 0, false, {
											fileName: _jsxFileName$6,
											lineNumber: 1415,
											columnNumber: 21
										}, this), progressPercent > 0 && /* @__PURE__ */ (void 0)("circle", {
											cx: "96",
											cy: "96",
											r: "88",
											className: cn("transition-all duration-1000", modeColors.ring),
											strokeWidth: "8",
											strokeDasharray: 552.92,
											strokeDashoffset: 552.92 - 552.92 * progressPercent / 100,
											strokeLinecap: "round",
											fill: "none"
										}, void 0, false, {
											fileName: _jsxFileName$6,
											lineNumber: 1424,
											columnNumber: 23
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$6,
										lineNumber: 1414,
										columnNumber: 19
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "relative z-10 flex flex-col items-center",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "font-mono font-extrabold tracking-tight text-slate-800 text-3xl lg:text-4xl",
											children: formatTime(timeLeft)
										}, void 0, false, {
											fileName: _jsxFileName$6,
											lineNumber: 1439,
											columnNumber: 21
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: cn("mt-1 text-xs font-semibold flex items-center gap-1", modeColors.text),
											children: timerState.isRunning ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
												className: "relative flex h-2 w-2",
												children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" }, void 0, false, {
													fileName: _jsxFileName$6,
													lineNumber: 1451,
													columnNumber: 29
												}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-rose-500" }, void 0, false, {
													fileName: _jsxFileName$6,
													lineNumber: 1452,
													columnNumber: 29
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName$6,
												lineNumber: 1450,
												columnNumber: 27
											}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Đang đếm giờ..." }, void 0, false, {
												fileName: _jsxFileName$6,
												lineNumber: 1454,
												columnNumber: 27
											}, this)] }, void 0, true, {
												fileName: _jsxFileName$6,
												lineNumber: 1449,
												columnNumber: 25
											}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Sẵn sàng" }, void 0, false, {
												fileName: _jsxFileName$6,
												lineNumber: 1457,
												columnNumber: 25
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName$6,
											lineNumber: 1442,
											columnNumber: 21
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$6,
										lineNumber: 1438,
										columnNumber: 19
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$6,
									lineNumber: 1407,
									columnNumber: 17
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "w-full space-y-2 pt-1 max-w-sm",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "flex items-center justify-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
											onClick: handleReset,
											"data-timer-action": "reset",
											variant: "outline",
											size: "icon",
											className: "h-11 w-11 rounded-full border-slate-200 shrink-0",
											title: "Đặt lại",
											children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RotateCcw, { className: "h-4 w-4 text-slate-600" }, void 0, false, {
												fileName: _jsxFileName$6,
												lineNumber: 1474,
												columnNumber: 23
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName$6,
											lineNumber: 1466,
											columnNumber: 21
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
											onClick: handleStartPause,
											"data-timer-action": "start-pause",
											className: cn("h-11 px-8 rounded-full font-bold text-sm shadow-md transition-all flex-1 min-w-[140px]", timerState.isRunning ? "bg-amber-500 hover:bg-amber-600 text-white" : modeColors.btn),
											children: timerState.isRunning ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Pause, { className: "mr-2 h-4 w-4" }, void 0, false, {
												fileName: _jsxFileName$6,
												lineNumber: 1489,
												columnNumber: 27
											}, this), " Tạm dừng"] }, void 0, true, {
												fileName: _jsxFileName$6,
												lineNumber: 1488,
												columnNumber: 25
											}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Play, { className: "mr-2 h-4 w-4" }, void 0, false, {
												fileName: _jsxFileName$6,
												lineNumber: 1493,
												columnNumber: 27
											}, this), " Bắt đầu"] }, void 0, true, {
												fileName: _jsxFileName$6,
												lineNumber: 1492,
												columnNumber: 25
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName$6,
											lineNumber: 1477,
											columnNumber: 21
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$6,
										lineNumber: 1465,
										columnNumber: 19
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
											variant: "secondary",
											className: "flex-1 rounded-xl text-xs font-semibold relative h-9",
											onClick: () => handleFinishEarly(false),
											"data-timer-action": "save",
											disabled: timerState.status === "saving" || timerState.timerMode === "pomodoro" && elapsed <= 0,
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: timerState.timerMode === "pomodoro" ? `Kết thúc và lưu ${elapsedMinutes > 0 ? `${elapsedMinutes}p` : "<1p"}` : "Kết thúc giờ nghỉ" }, void 0, false, {
												fileName: _jsxFileName$6,
												lineNumber: 1510,
												columnNumber: 23
											}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
												onClick: (e) => {
													e.stopPropagation();
													setShowSaveInfo(true);
												},
												className: "ml-1 text-slate-400 hover:text-rose-600 p-0.5 rounded-full",
												title: "Giải thích nút Lưu thời gian",
												children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleQuestionMark, { className: "h-3.5 w-3.5 inline" }, void 0, false, {
													fileName: _jsxFileName$6,
													lineNumber: 1523,
													columnNumber: 25
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName$6,
												lineNumber: 1515,
												columnNumber: 23
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName$6,
											lineNumber: 1500,
											columnNumber: 21
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
											variant: "default",
											className: "flex-1 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white h-9",
											onClick: () => handleFinishEarly(true),
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Check, { className: "mr-1 h-3.5 w-3.5" }, void 0, false, {
												fileName: _jsxFileName$6,
												lineNumber: 1531,
												columnNumber: 23
											}, this), " Hoàn thành bài"]
										}, void 0, true, {
											fileName: _jsxFileName$6,
											lineNumber: 1526,
											columnNumber: 21
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$6,
										lineNumber: 1499,
										columnNumber: 19
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$6,
									lineNumber: 1464,
									columnNumber: 17
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName$6,
							lineNumber: 1368,
							columnNumber: 15
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "md:col-span-7 flex flex-col justify-center space-y-3 bg-white/80 p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "flex items-center justify-between rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "text-slate-600 font-medium flex items-center gap-1.5",
										children: [notifPermission === "granted" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Bell, { className: "h-3.5 w-3.5 text-emerald-600" }, void 0, false, {
											fileName: _jsxFileName$6,
											lineNumber: 1543,
											columnNumber: 23
										}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BellOff, { className: "h-3.5 w-3.5 text-amber-600" }, void 0, false, {
											fileName: _jsxFileName$6,
											lineNumber: 1545,
											columnNumber: 23
										}, this), "Thông báo tab/màn hình khác:"]
									}, void 0, true, {
										fileName: _jsxFileName$6,
										lineNumber: 1541,
										columnNumber: 19
									}, this), notifPermission === "granted" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200",
										children: "Đã bật ✓"
									}, void 0, false, {
										fileName: _jsxFileName$6,
										lineNumber: 1550,
										columnNumber: 21
									}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
										onClick: handleRequestNotif,
										"aria-label": "Bật thông báo trình duyệt",
										className: "text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-200 transition-colors",
										children: "Bật thông báo trình duyệt"
									}, void 0, false, {
										fileName: _jsxFileName$6,
										lineNumber: 1554,
										columnNumber: 21
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$6,
									lineNumber: 1540,
									columnNumber: 17
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "flex rounded-xl bg-slate-100 p-1",
									children: [
										"pomodoro",
										"shortBreak",
										"longBreak"
									].map((m) => {
										const def = MODE_DEFAULTS[m];
										const isSelected = timerState.timerMode === m;
										return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
											onClick: () => handleSwitchMode(m),
											className: cn("flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all", isSelected ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"),
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: def.emoji }, void 0, false, {
												fileName: _jsxFileName$6,
												lineNumber: 1580,
												columnNumber: 25
											}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: def.title }, void 0, false, {
												fileName: _jsxFileName$6,
												lineNumber: 1581,
												columnNumber: 25
											}, this)]
										}, m, true, {
											fileName: _jsxFileName$6,
											lineNumber: 1570,
											columnNumber: 23
										}, this);
									})
								}, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1565,
									columnNumber: 17
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
									variant: "ghost",
									size: "sm",
									className: "w-full rounded-xl text-xs",
									onClick: () => setShowAdvanced((value) => !value),
									children: showAdvanced ? "Ẩn tùy chỉnh nâng cao" : "Hiện tùy chỉnh nâng cao"
								}, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1587,
									columnNumber: 17
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: cn("space-y-3", !showAdvanced && "hidden"),
									children: [
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "rounded-xl bg-slate-50 p-2.5 border border-slate-100",
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
												className: "text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center justify-between px-1",
												children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Preset Pomodoro:" }, void 0, false, {
													fileName: _jsxFileName$6,
													lineNumber: 1599,
													columnNumber: 23
												}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
													className: "text-rose-600 font-medium",
													children: "Tập trung / Nghỉ"
												}, void 0, false, {
													fileName: _jsxFileName$6,
													lineNumber: 1600,
													columnNumber: 23
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName$6,
												lineNumber: 1598,
												columnNumber: 21
											}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
												className: "grid grid-cols-4 gap-1.5",
												children: FOCUS_PRESETS.map((p) => {
													const isActive = (timerState.pendingPresetId ?? timerState.activePresetId) === p.id;
													return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
														onClick: () => handleApplyPreset(p.id),
														className: cn("py-1.5 px-1 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center", isActive ? "bg-rose-600 text-white border-rose-600 shadow-xs" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"),
														title: p.description,
														children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: p.label }, void 0, false, {
															fileName: _jsxFileName$6,
															lineNumber: 1618,
															columnNumber: 29
														}, this)
													}, p.id, false, {
														fileName: _jsxFileName$6,
														lineNumber: 1607,
														columnNumber: 27
													}, this);
												})
											}, void 0, false, {
												fileName: _jsxFileName$6,
												lineNumber: 1602,
												columnNumber: 21
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName$6,
											lineNumber: 1597,
											columnNumber: 19
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
											className: "rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2 text-[11px] text-indigo-800",
											children: "Hành vi tự động và âm báo được quản lý trong Pomodoro Studio."
										}, void 0, false, {
											fileName: _jsxFileName$6,
											lineNumber: 1625,
											columnNumber: 19
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "flex items-center justify-between rounded-xl bg-amber-50/70 px-3 py-1.5 border border-amber-200/80 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
												className: "text-amber-900 font-medium flex items-center gap-1",
												children: "🌴 Nghỉ dài sau:"
											}, void 0, false, {
												fileName: _jsxFileName$6,
												lineNumber: 1631,
												columnNumber: 21
											}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
												className: "flex items-center gap-1",
												children: [3, 4].map((cycles) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
													onClick: () => updateState({ longBreakTargetCycles: cycles }),
													className: cn("px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all border", targetCycles === cycles ? "bg-amber-600 text-white border-amber-600 shadow-xs" : "bg-white text-amber-800 border-amber-200 hover:bg-amber-100/50"),
													children: [cycles, " phiên học"]
												}, cycles, true, {
													fileName: _jsxFileName$6,
													lineNumber: 1636,
													columnNumber: 25
												}, this))
											}, void 0, false, {
												fileName: _jsxFileName$6,
												lineNumber: 1634,
												columnNumber: 21
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName$6,
											lineNumber: 1630,
											columnNumber: 19
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DurationSelector, {
											value: timerState.durationMinutes,
											disabled: timerState.isRunning,
											onChange: handleDurationChange,
											onAddExtra: handleAddExtraMinutes
										}, void 0, false, {
											fileName: _jsxFileName$6,
											lineNumber: 1651,
											columnNumber: 19
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(AmbientSoundSelector, {
											value: timerState.ambientSound,
											onChange: (ambientSound) => updateState({ ambientSound }),
											optionClassName: "flex-1"
										}, void 0, false, {
											fileName: _jsxFileName$6,
											lineNumber: 1658,
											columnNumber: 19
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName$6,
									lineNumber: 1595,
									columnNumber: 17
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName$6,
							lineNumber: 1538,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$6,
						lineNumber: 1366,
						columnNumber: 13
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName$6,
					lineNumber: 1365,
					columnNumber: 11
				}, this),
				sharedDialogs
			]
		}, void 0, true, {
			fileName: _jsxFileName$6,
			lineNumber: 1308,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$6,
		lineNumber: 1301,
		columnNumber: 7
	}, this), document.body);
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Đồng hồ tập trung",
		onKeyDown: handleTimerDialogKeyDown,
		className: cn("fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-md animate-in fade-in transition-all duration-300", isFullScreen ? "p-0" : "p-4"),
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: cn("relative w-full border border-white/80 bg-white shadow-2xl transition-all duration-300 overflow-y-auto flex flex-col justify-between", isFullScreen ? "h-full w-full max-w-none rounded-none p-6 md:p-10 bg-gradient-to-br from-white via-slate-50/80 to-slate-100/60" : "max-w-md rounded-3xl max-h-[92vh] p-5 md:p-6"),
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex items-center justify-between pb-3 border-b border-slate-100",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 font-extrabold text-lg shadow-xs",
							children: "🍅"
						}, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 1699,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
								className: "font-bold text-base text-slate-800",
								children: "Phiên tập trung"
							}, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 1704,
								columnNumber: 17
							}, this), isFullScreen && /* @__PURE__ */ (void 0)("span", {
								className: "text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 flex items-center gap-1 border border-rose-200",
								children: [/* @__PURE__ */ (void 0)(Sparkles, { className: "h-3 w-3" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1707,
									columnNumber: 21
								}, this), " Phóng to Web"]
							}, void 0, true, {
								fileName: _jsxFileName$6,
								lineNumber: 1706,
								columnNumber: 19
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$6,
							lineNumber: 1703,
							columnNumber: 15
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: "text-xs text-muted-foreground mt-0.5",
							children: "Timer học · nghỉ thông minh · chạy nền chính xác"
						}, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 1711,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName$6,
							lineNumber: 1702,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$6,
						lineNumber: 1698,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
								size: "icon",
								variant: "ghost",
								className: cn("h-8 w-8 rounded-full transition-colors", isFullScreen ? "bg-slate-200 text-slate-800" : "text-slate-500 hover:bg-slate-100"),
								onClick: handleToggleFullScreen,
								title: isFullScreen ? "Thu nhỏ về dạng Modal" : "Phóng to toàn khung Web",
								"aria-label": isFullScreen ? "Thu nhỏ đồng hồ tập trung" : "Phóng to đồng hồ tập trung",
								children: isFullScreen ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Minimize, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1730,
									columnNumber: 31
								}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Maximize, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1730,
									columnNumber: 66
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 1719,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
								size: "icon",
								variant: "ghost",
								className: "h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100",
								onClick: () => updateState({ isMinimized: true }),
								title: "Thu nhỏ góc màn hình",
								"aria-label": "Thu nhỏ đồng hồ tập trung về góc màn hình",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Minimize2, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1742,
									columnNumber: 15
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 1734,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
								size: "icon",
								variant: "ghost",
								className: "h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100",
								onClick: handleCloseModal,
								"aria-label": "Đóng đồng hồ tập trung",
								ref: closeButtonRef,
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(X, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1754,
									columnNumber: 15
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 1746,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$6,
						lineNumber: 1717,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$6,
					lineNumber: 1697,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mt-2.5 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "text-slate-600 font-medium flex items-center gap-1.5",
						children: [notifPermission === "granted" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Bell, { className: "h-3.5 w-3.5 text-emerald-600" }, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 1763,
							columnNumber: 15
						}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BellOff, { className: "h-3.5 w-3.5 text-amber-600" }, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 1765,
							columnNumber: 15
						}, this), "Thông báo tab khác / màn hình khác:"]
					}, void 0, true, {
						fileName: _jsxFileName$6,
						lineNumber: 1761,
						columnNumber: 11
					}, this), notifPermission === "granted" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200",
						children: "Đã bật ✓"
					}, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 1770,
						columnNumber: 13
					}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: handleRequestNotif,
						"aria-label": "Bật thông báo trình duyệt",
						className: "text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-200 transition-colors",
						children: "Bật thông báo trình duyệt"
					}, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 1774,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$6,
					lineNumber: 1760,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mt-2.5 flex rounded-2xl bg-slate-100 p-1",
					children: [
						"pomodoro",
						"shortBreak",
						"longBreak"
					].map((m) => {
						const def = MODE_DEFAULTS[m];
						const isSelected = timerState.timerMode === m;
						return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							onClick: () => handleSwitchMode(m),
							className: cn("flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all", isSelected ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"),
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: def.emoji }, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 1800,
								columnNumber: 17
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: def.title }, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 1801,
								columnNumber: 17
							}, this)]
						}, m, true, {
							fileName: _jsxFileName$6,
							lineNumber: 1790,
							columnNumber: 15
						}, this);
					})
				}, void 0, false, {
					fileName: _jsxFileName$6,
					lineNumber: 1785,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "py-3 text-center my-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5",
							children: "Bài học hiện tại"
						}, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 1809,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
							className: cn("font-serif font-bold text-slate-800 mx-auto break-words mb-2", isFullScreen ? "text-xl md:text-2xl max-w-xl" : "text-base max-w-xs"),
							children: timerState.lessonTitle
						}, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 1812,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
							variant: "ghost",
							size: "sm",
							className: "mb-2 rounded-xl text-xs",
							onClick: () => setShowAdvanced((value) => !value),
							children: showAdvanced ? "Ẩn tùy chỉnh nâng cao" : "Hiện tùy chỉnh nâng cao"
						}, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 1821,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: cn(!showAdvanced && "hidden"),
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "mb-2.5 rounded-2xl bg-slate-50 p-2 border border-slate-100",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center justify-between px-1",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Preset Pomodoro:" }, void 0, false, {
										fileName: _jsxFileName$6,
										lineNumber: 1833,
										columnNumber: 17
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "text-rose-600 font-medium",
										children: "Tập trung / Nghỉ"
									}, void 0, false, {
										fileName: _jsxFileName$6,
										lineNumber: 1834,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$6,
									lineNumber: 1832,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "grid grid-cols-4 gap-1.5",
									children: FOCUS_PRESETS.map((p) => {
										const isActive = (timerState.pendingPresetId ?? timerState.activePresetId) === p.id;
										return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
											onClick: () => handleApplyPreset(p.id),
											className: cn("py-1.5 px-1 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center", isActive ? "bg-rose-600 text-white border-rose-600 shadow-xs" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"),
											title: p.description,
											children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: p.label }, void 0, false, {
												fileName: _jsxFileName$6,
												lineNumber: 1852,
												columnNumber: 23
											}, this)
										}, p.id, false, {
											fileName: _jsxFileName$6,
											lineNumber: 1841,
											columnNumber: 21
										}, this);
									})
								}, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1836,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$6,
								lineNumber: 1831,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "mb-2.5 flex items-center justify-between rounded-xl bg-amber-50/70 px-3 py-1.5 border border-amber-200/80 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "text-amber-900 font-medium flex items-center gap-1",
									children: "🌴 Nghỉ dài sau:"
								}, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1861,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "flex items-center gap-1",
									children: [3, 4].map((cycles) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
										onClick: () => updateState({ longBreakTargetCycles: cycles }),
										className: cn("px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all border", targetCycles === cycles ? "bg-amber-600 text-white border-amber-600 shadow-xs" : "bg-white text-amber-800 border-amber-200 hover:bg-amber-100/50"),
										children: [cycles, " phiên học"]
									}, cycles, true, {
										fileName: _jsxFileName$6,
										lineNumber: 1866,
										columnNumber: 19
									}, this))
								}, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1864,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$6,
								lineNumber: 1860,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$6,
							lineNumber: 1829,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex justify-center items-center gap-1.5 mb-2.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "text-[11px] font-medium text-slate-500 mr-1",
									children: "Tiến độ vòng lặp:"
								}, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1885,
									columnNumber: 13
								}, this),
								Array.from({ length: targetCycles }).map((_, idx) => {
									const sessionInCycle = timerState.completedPomodoros % targetCycles;
									const isFilled = idx < sessionInCycle || sessionInCycle === 0 && timerState.completedPomodoros > 0;
									return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: cn("text-lg transition-transform", isFilled ? "scale-110 opacity-100" : "opacity-30"),
										title: `Phiên ${idx + 1}/${targetCycles}`,
										children: "🍅"
									}, idx, false, {
										fileName: _jsxFileName$6,
										lineNumber: 1891,
										columnNumber: 17
									}, this);
								}),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "text-xs font-bold text-slate-700 ml-1",
									children: [
										"(",
										timerState.completedPomodoros,
										" phiên)"
									]
								}, void 0, true, {
									fileName: _jsxFileName$6,
									lineNumber: 1903,
									columnNumber: 13
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName$6,
							lineNumber: 1884,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: cn("relative mx-auto flex items-center justify-center rounded-full border-4 border-slate-100 bg-gradient-to-b shadow-inner transition-all duration-500", modeColors.bg, isFullScreen ? "h-56 w-56 md:h-64 md:w-64" : "h-44 w-44"),
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("svg", {
								className: "absolute inset-0 h-full w-full -rotate-90",
								viewBox: "0 0 192 192",
								role: "progressbar",
								"aria-label": "Tiến độ phiên tập trung",
								"aria-valuemin": 0,
								"aria-valuemax": 100,
								"aria-valuenow": Math.round(progressPercent),
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("circle", {
									cx: "96",
									cy: "96",
									r: "88",
									className: "stroke-slate-100",
									strokeWidth: "8",
									fill: "none"
								}, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1925,
									columnNumber: 15
								}, this), progressPercent > 0 && /* @__PURE__ */ (void 0)("circle", {
									cx: "96",
									cy: "96",
									r: "88",
									className: cn("transition-all duration-1000", modeColors.ring),
									strokeWidth: "8",
									strokeDasharray: 552.92,
									strokeDashoffset: 552.92 - 552.92 * progressPercent / 100,
									strokeLinecap: "round",
									fill: "none"
								}, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1934,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$6,
								lineNumber: 1916,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "relative z-10 flex flex-col items-center",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: cn("font-mono font-extrabold tracking-tight text-slate-800", isFullScreen ? "text-4xl md:text-5xl" : "text-3xl"),
									children: formatTime(timeLeft)
								}, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1949,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: cn("mt-1 text-xs font-semibold flex items-center gap-1", modeColors.text),
									children: timerState.isRunning ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "relative flex h-2 w-2",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" }, void 0, false, {
											fileName: _jsxFileName$6,
											lineNumber: 1966,
											columnNumber: 23
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-rose-500" }, void 0, false, {
											fileName: _jsxFileName$6,
											lineNumber: 1967,
											columnNumber: 23
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$6,
										lineNumber: 1965,
										columnNumber: 21
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Đang đếm giờ..." }, void 0, false, {
										fileName: _jsxFileName$6,
										lineNumber: 1969,
										columnNumber: 21
									}, this)] }, void 0, true, {
										fileName: _jsxFileName$6,
										lineNumber: 1964,
										columnNumber: 19
									}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Sẵn sàng" }, void 0, false, {
										fileName: _jsxFileName$6,
										lineNumber: 1972,
										columnNumber: 19
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1957,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$6,
								lineNumber: 1948,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$6,
							lineNumber: 1909,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: cn(!showAdvanced && "hidden"),
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DurationSelector, {
									value: timerState.durationMinutes,
									disabled: timerState.isRunning,
									onChange: handleDurationChange,
									onAddExtra: handleAddExtraMinutes,
									compact: true
								}, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1979,
									columnNumber: 13
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(AmbientSoundSelector, {
									value: timerState.ambientSound,
									onChange: (ambientSound) => updateState({ ambientSound }),
									className: "mx-auto mt-2.5 max-w-md rounded-2xl p-2"
								}, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1987,
									columnNumber: 13
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
									className: "mx-auto mt-2.5 max-w-md rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2 text-center text-[11px] text-indigo-800",
									children: "Hành vi tự động và âm báo được quản lý trong Pomodoro Studio."
								}, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 1993,
									columnNumber: 13
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName$6,
							lineNumber: 1978,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$6,
					lineNumber: 1808,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "space-y-2.5 pt-2 border-t border-slate-100",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center justify-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
							onClick: handleReset,
							"data-timer-action": "reset",
							variant: "outline",
							size: "icon",
							className: "h-12 w-12 rounded-full border-slate-200",
							title: "Đặt lại",
							"aria-label": "Đặt lại đồng hồ tập trung",
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RotateCcw, { className: "h-5 w-5 text-slate-600" }, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 2011,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 2002,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
							onClick: handleStartPause,
							"data-timer-action": "start-pause",
							className: cn("h-13 px-8 rounded-full font-bold text-base shadow-md transition-all min-w-[160px]", timerState.isRunning ? "bg-amber-500 hover:bg-amber-600 text-white" : modeColors.btn),
							children: timerState.isRunning ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Pause, { className: "mr-2 h-5 w-5" }, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 2026,
								columnNumber: 19
							}, this), " Tạm dừng"] }, void 0, true, {
								fileName: _jsxFileName$6,
								lineNumber: 2025,
								columnNumber: 17
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Play, { className: "mr-2 h-5 w-5" }, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 2030,
								columnNumber: 19
							}, this), " Bắt đầu"] }, void 0, true, {
								fileName: _jsxFileName$6,
								lineNumber: 2029,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 2014,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$6,
						lineNumber: 2001,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
								variant: "secondary",
								className: "flex-1 rounded-xl text-xs font-semibold relative",
								onClick: () => handleFinishEarly(false),
								"data-timer-action": "save",
								disabled: timerState.status === "saving" || timerState.timerMode === "pomodoro" && elapsed <= 0,
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: timerState.timerMode === "pomodoro" ? `Kết thúc và lưu ${elapsedMinutes > 0 ? `${elapsedMinutes}p` : "<1p"}` : "Kết thúc giờ nghỉ" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 2047,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "ml-1.5 text-slate-400",
									"aria-hidden": "true",
									children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleQuestionMark, { className: "h-3.5 w-3.5 inline" }, void 0, false, {
										fileName: _jsxFileName$6,
										lineNumber: 2053,
										columnNumber: 17
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 2052,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$6,
								lineNumber: 2037,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
								type: "button",
								variant: "ghost",
								size: "icon",
								className: "rounded-xl",
								onClick: () => setShowSaveInfo(true),
								"aria-label": "Giải thích nút lưu thời gian",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleQuestionMark, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 2064,
									columnNumber: 15
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 2056,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
								variant: "default",
								className: "flex-1 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white",
								onClick: () => {
									if (!onToggleComplete || isCompleted) return;
									onToggleComplete(timerState.lessonId);
									toast.success("Đã đánh dấu bài học hoàn thành. Thời gian chỉ được lưu khi bạn chọn ‘Kết thúc và lưu’. ");
								},
								disabled: !onToggleComplete || isCompleted,
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Check, { className: "mr-1 h-3.5 w-3.5" }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 2078,
									columnNumber: 15
								}, this), " Hoàn thành bài"]
							}, void 0, true, {
								fileName: _jsxFileName$6,
								lineNumber: 2066,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$6,
						lineNumber: 2036,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$6,
					lineNumber: 2e3,
					columnNumber: 9
				}, this),
				sharedDialogs
			]
		}, void 0, true, {
			fileName: _jsxFileName$6,
			lineNumber: 1688,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$6,
		lineNumber: 1678,
		columnNumber: 5
	}, this), document.body);
}
var _jsxFileName$5 = "/app/applet/src/components/ui/progress.tsx";
var Progress = import_react.forwardRef(({ className, value, ...props }, ref) => {
	const boundedValue = Math.min(100, Math.max(0, value ?? 0));
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Root, {
		ref,
		className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
		value: boundedValue,
		max: 100,
		...props,
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Indicator, {
			className: "h-full w-full flex-1 bg-primary transition-all",
			style: { transform: `translateX(-${100 - boundedValue}%)` }
		}, void 0, false, {
			fileName: _jsxFileName$5,
			lineNumber: 21,
			columnNumber: 7
		}, void 0)
	}, void 0, false, {
		fileName: _jsxFileName$5,
		lineNumber: 14,
		columnNumber: 5
	}, void 0);
});
Progress.displayName = Root.displayName;
var _jsxFileName$4 = "/app/applet/src/components/CourseManagerModal.tsx";
function allLessons(subject) {
	return subject.milestones.flatMap((milestone) => milestone.lessons);
}
function CourseManagerModal({ currentSubjects, onSubjectsUpdated, progress, activeTimerLessonId, trigger }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [selectedSubjectId, setSelectedSubjectId] = (0, import_react.useState)(currentSubjects[0]?.id ?? "");
	const [mobileDetail, setMobileDetail] = (0, import_react.useState)(false);
	const [search, setSearch] = (0, import_react.useState)("");
	const [subjectSearch, setSubjectSearch] = (0, import_react.useState)("");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("roadmap");
	const [selectionMode, setSelectionMode] = (0, import_react.useState)(false);
	const [selectedLessonIds, setSelectedLessonIds] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
	const [bulkTargetSubjectId, setBulkTargetSubjectId] = (0, import_react.useState)("");
	const [bulkTargetTopicId, setBulkTargetTopicId] = (0, import_react.useState)("");
	const [bulkDate, setBulkDate] = (0, import_react.useState)("");
	const [bulkMinutes, setBulkMinutes] = (0, import_react.useState)(120);
	const [archiveView, setArchiveView] = (0, import_react.useState)(false);
	const [archiveVersion, setArchiveVersion] = (0, import_react.useState)(0);
	const [newSubjectName, setNewSubjectName] = (0, import_react.useState)("");
	const [newSubjectEmoji, setNewSubjectEmoji] = (0, import_react.useState)("📖");
	const [editingSubject, setEditingSubject] = (0, import_react.useState)(null);
	const [editingLesson, setEditingLesson] = (0, import_react.useState)(null);
	const [topicEditor, setTopicEditor] = (0, import_react.useState)(null);
	const [subjectDraft, setSubjectDraft] = (0, import_react.useState)({
		name: "",
		emoji: "📖"
	});
	const [lessonDraft, setLessonDraft] = (0, import_react.useState)({
		title: "",
		topic: "",
		minutes: 120,
		date: ""
	});
	(0, import_react.useEffect)(() => {
		if (!currentSubjects.some((subject) => subject.id === selectedSubjectId)) setSelectedSubjectId(currentSubjects[0]?.id ?? "");
	}, [currentSubjects, selectedSubjectId]);
	(0, import_react.useEffect)(() => {
		setSelectedLessonIds(/* @__PURE__ */ new Set());
		setSelectionMode(false);
		setBulkTargetSubjectId("");
		setBulkTargetTopicId("");
	}, [selectedSubjectId]);
	const minutesByLesson = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const session of progress?.studySessions ?? []) map.set(session.lessonId, (map.get(session.lessonId) ?? 0) + Math.round(session.durationSeconds / 60));
		return map;
	}, [progress?.studySessions]);
	const selectedSubject = currentSubjects.find((subject) => subject.id === selectedSubjectId) ?? null;
	const visibleSubjects = (0, import_react.useMemo)(() => {
		const keyword = subjectSearch.trim().toLocaleLowerCase("vi");
		return keyword ? currentSubjects.filter((subject) => subject.name.toLocaleLowerCase("vi").includes(keyword)) : currentSubjects;
	}, [currentSubjects, subjectSearch]);
	const archived = (0, import_react.useMemo)(() => getArchivedCatalog(), [archiveVersion, open]);
	const apply = (subjects, message) => {
		onSubjectsUpdated(subjects);
		if (message) toast.success(message);
	};
	const confirmTimerImpact = (lessonIds, action) => {
		if (!activeTimerLessonId || !new Set(lessonIds).has(activeTimerLessonId)) return true;
		return window.confirm(`Bài học này đang có một phiên Timer. Nhấn OK để ${action} nhưng vẫn tiếp tục phiên hiện tại; nhấn Hủy để quay lại và dừng Timer trước.`);
	};
	const createSubject = () => {
		const name = newSubjectName.trim();
		if (!name) return toast.error("Vui lòng nhập tên môn học.");
		if (currentSubjects.some((subject) => subject.name.localeCompare(name, "vi", { sensitivity: "base" }) === 0)) return toast.error("Môn học này đã tồn tại.");
		const next = addSubjectToSubjects(currentSubjects, name, newSubjectEmoji.trim() || "📖");
		apply(next, `Đã tạo môn ${name}.`);
		const created = next.find((subject) => subject.name === name);
		if (created) setSelectedSubjectId(created.id);
		setNewSubjectName("");
		setNewSubjectEmoji("📖");
	};
	const filteredMilestones = (0, import_react.useMemo)(() => {
		if (!selectedSubject) return [];
		const keyword = search.trim().toLocaleLowerCase("vi");
		return selectedSubject.milestones.map((milestone) => ({
			...milestone,
			lessons: milestone.lessons.filter((lesson) => {
				const minutes = minutesByLesson.get(lesson.id) ?? 0;
				const completed = Boolean(progress?.completedLessons[lesson.id]) || minutes >= lesson.plannedDurationMinutes;
				if (!(!keyword || lesson.title.toLocaleLowerCase("vi").includes(keyword) || (lesson.topic ?? milestone.title).toLocaleLowerCase("vi").includes(keyword))) return false;
				if (filter === "completed") return completed;
				if (filter === "not-started") return minutes === 0 && !completed;
				if (filter === "in-progress") return minutes > 0 && !completed;
				if (filter === "unscheduled") return !lesson.scheduledDate;
				return true;
			}).sort((a, b) => {
				if (sort === "date") return (a.scheduledDate || "9999-12-31").localeCompare(b.scheduledDate || "9999-12-31");
				if (sort === "name") return a.title.localeCompare(b.title, "vi");
				const aMinutes = minutesByLesson.get(a.id) ?? 0;
				const bMinutes = minutesByLesson.get(b.id) ?? 0;
				if (sort === "progress") {
					const aPercent = aMinutes / Math.max(1, a.plannedDurationMinutes);
					return bMinutes / Math.max(1, b.plannedDurationMinutes) - aPercent;
				}
				if (sort === "remaining") return Math.max(0, a.plannedDurationMinutes - aMinutes) - Math.max(0, b.plannedDurationMinutes - bMinutes);
				return 0;
			})
		})).filter((milestone) => milestone.lessons.length > 0 || !keyword && filter === "all");
	}, [
		filter,
		minutesByLesson,
		progress?.completedLessons,
		search,
		selectedSubject,
		sort
	]);
	const openSubjectEdit = (subject) => {
		setEditingSubject(subject);
		setSubjectDraft({
			name: subject.name,
			emoji: subject.emoji
		});
	};
	const saveSubject = () => {
		if (!editingSubject) return;
		const name = subjectDraft.name.trim();
		if (!name) return toast.error("Tên môn học không được để trống.");
		apply(updateSubjectDetails(currentSubjects, editingSubject.id, {
			name,
			emoji: subjectDraft.emoji.trim() || editingSubject.emoji
		}), `Đã cập nhật môn ${name}.`);
		setEditingSubject(null);
	};
	const openLessonEdit = (lesson) => {
		setEditingLesson(lesson);
		setLessonDraft({
			title: lesson.title,
			topic: lesson.topic ?? "",
			minutes: lesson.plannedDurationMinutes,
			date: lesson.scheduledDate
		});
	};
	const saveLesson = () => {
		if (!editingLesson) return;
		const title = lessonDraft.title.trim();
		if (!title) return toast.error("Tên bài học không được để trống.");
		if (!Number.isFinite(lessonDraft.minutes) || lessonDraft.minutes <= 0) return toast.error("Thời lượng mục tiêu phải lớn hơn 0.");
		apply(updateLessonDetails(currentSubjects, editingLesson.id, {
			title,
			topic: lessonDraft.topic.trim(),
			plannedDurationMinutes: lessonDraft.minutes,
			scheduledDate: lessonDraft.date
		}), `Đã cập nhật bài “${title}”.`);
		setEditingLesson(null);
	};
	const subjectStats = (subject) => {
		const lessons = allLessons(subject);
		const completed = lessons.filter((lesson) => {
			const minutes = minutesByLesson.get(lesson.id) ?? 0;
			return Boolean(progress?.completedLessons[lesson.id]) || minutes >= lesson.plannedDurationMinutes;
		}).length;
		const remaining = lessons.reduce((sum, lesson) => sum + Math.max(0, lesson.plannedDurationMinutes - (minutesByLesson.get(lesson.id) ?? 0)), 0);
		return {
			lessons: lessons.length,
			completed,
			remaining,
			percent: lessons.length ? Math.round(completed / lessons.length * 100) : 0
		};
	};
	const saveTopic = () => {
		if (!selectedSubject || !topicEditor) return;
		const title = topicEditor.title.trim();
		if (!title) return toast.error("Tên chủ đề không được để trống.");
		if (selectedSubject.milestones.some((milestone) => milestone.id !== topicEditor.id && milestone.title.localeCompare(title, "vi", { sensitivity: "base" }) === 0)) return toast.error("Chủ đề này đã tồn tại trong môn học.");
		const next = topicEditor.id ? renameTopicInSubjects(currentSubjects, selectedSubject.id, topicEditor.id, title) : addTopicToSubject(currentSubjects, selectedSubject.id, title);
		apply(next, topicEditor.id ? `Đã đổi tên chủ đề thành ${title}.` : `Đã thêm chủ đề ${title}.`);
		setTopicEditor(null);
	};
	const toggleLessonSelection = (lessonId) => {
		setSelectedLessonIds((current) => {
			const next = new Set(current);
			if (next.has(lessonId)) next.delete(lessonId);
			else next.add(lessonId);
			return next;
		});
	};
	const clearSelection = () => {
		setSelectedLessonIds(/* @__PURE__ */ new Set());
		setSelectionMode(false);
	};
	const applyBulk = (next, message, archiveChanged = false) => {
		apply(next, message);
		clearSelection();
		if (archiveChanged) setArchiveVersion((version) => version + 1);
	};
	const exportSubject = (subject) => {
		const rows = subject.milestones.flatMap((milestone) => milestone.lessons.map((lesson) => ({
			subject_id: subject.id,
			subject_name: subject.name,
			topic: lesson.topic || milestone.title,
			lesson_id: lesson.id,
			lesson_name: lesson.title,
			target_minutes: lesson.plannedDurationMinutes,
			planned_date: lesson.scheduledDate,
			xp_reward: lesson.xp
		})));
		const safeName = subject.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || subject.id;
		downloadFile(`mon-${safeName}.json`, JSON.stringify(rows, null, 2), "application/json");
		toast.success(`Đã xuất môn ${subject.name}.`);
	};
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTrigger, {
				asChild: true,
				children: trigger ?? /* @__PURE__ */ (void 0)(Button, {
					variant: "outline",
					size: "sm",
					className: "h-9 gap-1.5 rounded-2xl border-indigo-200 bg-indigo-50/70 text-xs font-semibold text-indigo-800",
					children: [/* @__PURE__ */ (void 0)(LibraryBig, { className: "h-4 w-4" }, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 343,
						columnNumber: 13
					}, this), /* @__PURE__ */ (void 0)("span", {
						className: "hidden sm:inline",
						children: "Môn & bài học"
					}, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 344,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$4,
					lineNumber: 342,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 340,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent, {
				className: "h-[94vh] w-[97vw] max-w-6xl overflow-hidden rounded-3xl p-0 grid-rows-[auto_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogHeader, {
					className: "border-b bg-white px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle, {
						className: "flex items-center gap-2 font-serif text-xl",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LibraryBig, { className: "h-5 w-5 text-indigo-700" }, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 351,
							columnNumber: 13
						}, this), " Quản lý môn & bài học"]
					}, void 0, true, {
						fileName: _jsxFileName$4,
						lineNumber: 350,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogDescription, { children: "Tổ chức môn học, chủ đề và các bài trong lộ trình của bạn." }, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 353,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$4,
					lineNumber: 349,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "grid min-h-0 flex-1 md:grid-cols-[280px_1fr]",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("aside", {
						className: cn("min-h-0 overflow-y-auto border-r bg-slate-50/80 p-3", mobileDetail && "hidden md:block"),
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "rounded-2xl border bg-white p-3",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "grid grid-cols-[64px_1fr] gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
										value: newSubjectEmoji,
										maxLength: 4,
										onChange: (event) => setNewSubjectEmoji(event.target.value),
										className: "text-center text-lg",
										"aria-label": "Biểu tượng môn mới"
									}, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 360,
										columnNumber: 17
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
										value: newSubjectName,
										onChange: (event) => setNewSubjectName(event.target.value),
										onKeyDown: (event) => event.key === "Enter" && createSubject(),
										placeholder: "Tên môn học mới"
									}, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 361,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$4,
									lineNumber: 359,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
									type: "button",
									className: "mt-2 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700",
									onClick: createSubject,
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Plus, { className: "h-4 w-4" }, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 364,
										columnNumber: 17
									}, this), " Thêm môn học"]
								}, void 0, true, {
									fileName: _jsxFileName$4,
									lineNumber: 363,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 358,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "relative mt-3",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" }, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 369,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
									value: subjectSearch,
									onChange: (event) => setSubjectSearch(event.target.value),
									placeholder: "Tìm môn học…",
									className: "rounded-xl bg-white pl-9"
								}, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 370,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 368,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Tabs, {
								value: archiveView ? "archived" : "active",
								onValueChange: (value) => setArchiveView(value === "archived"),
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsList, {
									className: "grid w-full grid-cols-2 rounded-xl",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsTrigger, {
										value: "active",
										className: "rounded-lg text-xs",
										children: "Đang học"
									}, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 375,
										columnNumber: 17
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsTrigger, {
										value: "archived",
										className: "rounded-lg text-xs",
										children: "Đã lưu trữ"
									}, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 376,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$4,
									lineNumber: 374,
									columnNumber: 15
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 373,
								columnNumber: 13
							}, this),
							!archiveView ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "mt-3 space-y-2",
								children: [visibleSubjects.map((subject) => {
									const stats = subjectStats(subject);
									return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
										type: "button",
										onClick: () => {
											setSelectedSubjectId(subject.id);
											setMobileDetail(true);
										},
										className: cn("w-full rounded-2xl border p-3 text-left transition", selectedSubjectId === subject.id ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white hover:bg-slate-50"),
										children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "flex items-start gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
												className: "text-xl",
												children: subject.emoji
											}, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 398,
												columnNumber: 25
											}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
												className: "min-w-0 flex-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
														className: "truncate text-sm font-semibold text-slate-900",
														children: subject.name
													}, void 0, false, {
														fileName: _jsxFileName$4,
														lineNumber: 400,
														columnNumber: 27
													}, this),
													/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
														className: "text-[11px] text-slate-500",
														children: [
															stats.completed,
															" / ",
															stats.lessons,
															" bài · ",
															formatMinutes(stats.remaining),
															" còn lại"
														]
													}, void 0, true, {
														fileName: _jsxFileName$4,
														lineNumber: 401,
														columnNumber: 27
													}, this),
													/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Progress, {
														value: stats.percent,
														className: "mt-2 h-1.5"
													}, void 0, false, {
														fileName: _jsxFileName$4,
														lineNumber: 402,
														columnNumber: 27
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName$4,
												lineNumber: 399,
												columnNumber: 25
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName$4,
											lineNumber: 397,
											columnNumber: 23
										}, this)
									}, subject.id, false, {
										fileName: _jsxFileName$4,
										lineNumber: 385,
										columnNumber: 21
									}, this);
								}), currentSubjects.length === 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(EmptyState, {
									title: "Bạn chưa có môn học nào",
									description: "Tạo môn đầu tiên hoặc sử dụng lộ trình mẫu lớp 11."
								}, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 409,
									columnNumber: 19
								}, this) : visibleSubjects.length === 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(EmptyState, {
									title: "Không tìm thấy môn học",
									description: "Hãy thử từ khóa khác."
								}, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 411,
									columnNumber: 19
								}, this) : null]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 381,
								columnNumber: 15
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "mt-3 space-y-2",
								children: [
									archived.subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ArchivedItem, {
										label: `${subject.emoji} ${subject.name}`,
										onRestore: () => {
											apply(restoreArchivedSubject(currentSubjects, subject.id), `Đã khôi phục môn ${subject.name}.`);
											setArchiveVersion((version) => version + 1);
										}
									}, subject.id, false, {
										fileName: _jsxFileName$4,
										lineNumber: 417,
										columnNumber: 19
									}, this)),
									archived.lessons.map((item) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ArchivedItem, {
										label: `${item.lesson.title} · ${item.subjectName}`,
										onRestore: () => {
											apply(restoreArchivedLesson(currentSubjects, item.lesson.id), `Đã khôi phục bài ${item.lesson.title}.`);
											setArchiveVersion((version) => version + 1);
										}
									}, item.lesson.id, false, {
										fileName: _jsxFileName$4,
										lineNumber: 427,
										columnNumber: 19
									}, this)),
									archived.subjects.length === 0 && archived.lessons.length === 0 && /* @__PURE__ */ (void 0)(EmptyState, {
										title: "Kho lưu trữ đang trống",
										description: "Môn và bài được lưu trữ sẽ xuất hiện tại đây."
									}, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 437,
										columnNumber: 19
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 415,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
								type: "button",
								variant: "ghost",
								className: "mt-3 w-full rounded-xl text-xs",
								onClick: () => {
									const restored = restoreCatalogBackup();
									if (restored) apply(restored, "Đã hoàn tác thay đổi danh mục gần nhất.");
									else toast.info("Chưa có thay đổi để hoàn tác.");
								},
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Undo2, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 452,
									columnNumber: 15
								}, this), " Hoàn tác gần nhất"]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 442,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$4,
						lineNumber: 357,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("main", {
						className: cn("min-h-0 overflow-y-auto bg-white p-4 sm:p-5", !mobileDetail && "hidden md:block"),
						children: selectedSubject ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
								type: "button",
								variant: "ghost",
								size: "sm",
								className: "mb-3 rounded-xl md:hidden",
								onClick: () => setMobileDetail(false),
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ArrowLeft, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 460,
									columnNumber: 19
								}, this), " Danh sách môn"]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 459,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SubjectHeader, {
								subject: selectedSubject,
								stats: subjectStats(selectedSubject),
								onEdit: () => openSubjectEdit(selectedSubject),
								canMoveUp: currentSubjects.findIndex((subject) => subject.id === selectedSubject.id) > 0,
								canMoveDown: currentSubjects.findIndex((subject) => subject.id === selectedSubject.id) < currentSubjects.length - 1,
								onMoveUp: () => apply(reorderSubject(currentSubjects, selectedSubject.id, -1), `Đã di chuyển môn ${selectedSubject.name} lên.`),
								onMoveDown: () => apply(reorderSubject(currentSubjects, selectedSubject.id, 1), `Đã di chuyển môn ${selectedSubject.name} xuống.`),
								onArchive: () => {
									if (!window.confirm(`Lưu trữ môn “${selectedSubject.name}”? Lịch sử học vẫn được giữ.`)) return;
									apply(archiveSubject(currentSubjects, selectedSubject.id), `Đã lưu trữ môn ${selectedSubject.name}.`);
									setArchiveVersion((version) => version + 1);
								},
								onDelete: () => {
									const count = allLessons(selectedSubject).length;
									if (!window.confirm(`Xóa môn “${selectedSubject.name}” và ${count} bài? Lịch sử phiên học đã diễn ra vẫn được giữ trong tiến độ.`)) return;
									apply(removeSubjectFromSubjects(currentSubjects, selectedSubject.id), `Đã xóa môn ${selectedSubject.name}.`);
								},
								onAddTopic: () => setTopicEditor({
									id: null,
									title: ""
								}),
								onExport: () => exportSubject(selectedSubject),
								addLesson: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(AddLessonModal, {
									currentSubjects,
									onSubjectsUpdated,
									defaultSubjectName: selectedSubject.name,
									trigger: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
										className: "rounded-xl bg-emerald-600 hover:bg-emerald-700",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Plus, { className: "h-4 w-4" }, void 0, false, {
											fileName: _jsxFileName$4,
											lineNumber: 487,
											columnNumber: 99
										}, this), " Thêm bài học"]
									}, void 0, true, {
										fileName: _jsxFileName$4,
										lineNumber: 487,
										columnNumber: 32
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 483,
									columnNumber: 21
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 462,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "mt-5 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_170px_170px_auto]",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" }, void 0, false, {
											fileName: _jsxFileName$4,
											lineNumber: 494,
											columnNumber: 21
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
											value: search,
											onChange: (event) => setSearch(event.target.value),
											placeholder: "Tìm tên bài hoặc chủ đề…",
											className: "rounded-xl pl-9"
										}, void 0, false, {
											fileName: _jsxFileName$4,
											lineNumber: 495,
											columnNumber: 21
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$4,
										lineNumber: 493,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("select", {
										value: filter,
										onChange: (event) => setFilter(event.target.value),
										className: "h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm",
										children: [
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
												value: "all",
												children: "Tất cả bài"
											}, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 498,
												columnNumber: 21
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
												value: "not-started",
												children: "Chưa bắt đầu"
											}, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 499,
												columnNumber: 21
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
												value: "in-progress",
												children: "Đang học"
											}, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 500,
												columnNumber: 21
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
												value: "completed",
												children: "Đã hoàn thành"
											}, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 501,
												columnNumber: 21
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
												value: "unscheduled",
												children: "Chưa lên lịch"
											}, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 502,
												columnNumber: 21
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName$4,
										lineNumber: 497,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("select", {
										value: sort,
										onChange: (event) => setSort(event.target.value),
										className: "h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm",
										children: [
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
												value: "roadmap",
												children: "Thứ tự lộ trình"
											}, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 505,
												columnNumber: 21
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
												value: "date",
												children: "Ngày dự kiến"
											}, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 506,
												columnNumber: 21
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
												value: "progress",
												children: "Tiến độ"
											}, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 507,
												columnNumber: 21
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
												value: "name",
												children: "Tên bài"
											}, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 508,
												columnNumber: 21
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
												value: "remaining",
												children: "Thời lượng còn lại"
											}, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 509,
												columnNumber: 21
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName$4,
										lineNumber: 504,
										columnNumber: 19
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
										type: "button",
										variant: selectionMode ? "default" : "outline",
										className: "rounded-xl",
										onClick: () => {
											if (selectionMode) clearSelection();
											else setSelectionMode(true);
										},
										children: selectionMode ? "Hủy chọn" : "Chọn nhiều"
									}, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 511,
										columnNumber: 19
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 492,
								columnNumber: 17
							}, this),
							selectionMode && /* @__PURE__ */ (void 0)("section", {
								className: "mt-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-3",
								children: [/* @__PURE__ */ (void 0)("div", {
									className: "flex flex-wrap items-center justify-between gap-2",
									children: [/* @__PURE__ */ (void 0)("p", {
										className: "text-sm font-semibold text-indigo-950",
										children: [
											"Đã chọn ",
											selectedLessonIds.size,
											" bài học"
										]
									}, void 0, true, {
										fileName: _jsxFileName$4,
										lineNumber: 527,
										columnNumber: 23
									}, this), /* @__PURE__ */ (void 0)(Button, {
										type: "button",
										size: "sm",
										variant: "outline",
										className: "rounded-xl",
										onClick: () => {
											const ids = filteredMilestones.flatMap((milestone) => milestone.lessons.map((lesson) => lesson.id));
											setSelectedLessonIds(new Set(ids));
										},
										children: "Chọn tất cả đang hiển thị"
									}, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 528,
										columnNumber: 23
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$4,
									lineNumber: 526,
									columnNumber: 21
								}, this), /* @__PURE__ */ (void 0)("div", {
									className: "mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5",
									children: [
										/* @__PURE__ */ (void 0)("div", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ (void 0)("select", {
												value: bulkTargetSubjectId,
												onChange: (event) => setBulkTargetSubjectId(event.target.value),
												className: "h-9 min-w-0 flex-1 rounded-xl border border-indigo-200 bg-white px-2 text-xs",
												children: [/* @__PURE__ */ (void 0)("option", {
													value: "",
													children: "Chuyển sang môn…"
												}, void 0, false, {
													fileName: _jsxFileName$4,
													lineNumber: 544,
													columnNumber: 27
												}, this), currentSubjects.filter((subject) => subject.id !== selectedSubject.id).map((subject) => /* @__PURE__ */ (void 0)("option", {
													value: subject.id,
													children: subject.name
												}, subject.id, false, {
													fileName: _jsxFileName$4,
													lineNumber: 545,
													columnNumber: 116
												}, this))]
											}, void 0, true, {
												fileName: _jsxFileName$4,
												lineNumber: 543,
												columnNumber: 25
											}, this), /* @__PURE__ */ (void 0)(Button, {
												type: "button",
												size: "sm",
												variant: "outline",
												className: "rounded-xl",
												disabled: !bulkTargetSubjectId || selectedLessonIds.size === 0,
												onClick: () => applyBulk(moveLessonsToSubject(currentSubjects, selectedLessonIds, bulkTargetSubjectId), `Đã chuyển ${selectedLessonIds.size} bài học.`),
												"aria-label": "Chuyển các bài đã chọn",
												children: /* @__PURE__ */ (void 0)(ChevronRight, { className: "h-4 w-4" }, void 0, false, {
													fileName: _jsxFileName$4,
													lineNumber: 547,
													columnNumber: 351
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 547,
												columnNumber: 25
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName$4,
											lineNumber: 542,
											columnNumber: 23
										}, this),
										/* @__PURE__ */ (void 0)("div", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ (void 0)("select", {
												value: bulkTargetTopicId,
												onChange: (event) => setBulkTargetTopicId(event.target.value),
												className: "h-9 min-w-0 flex-1 rounded-xl border border-indigo-200 bg-white px-2 text-xs",
												children: [/* @__PURE__ */ (void 0)("option", {
													value: "",
													children: "Chuyển sang chủ đề…"
												}, void 0, false, {
													fileName: _jsxFileName$4,
													lineNumber: 551,
													columnNumber: 27
												}, this), selectedSubject.milestones.map((milestone) => /* @__PURE__ */ (void 0)("option", {
													value: milestone.id,
													children: milestone.title
												}, milestone.id, false, {
													fileName: _jsxFileName$4,
													lineNumber: 552,
													columnNumber: 74
												}, this))]
											}, void 0, true, {
												fileName: _jsxFileName$4,
												lineNumber: 550,
												columnNumber: 25
											}, this), /* @__PURE__ */ (void 0)(Button, {
												type: "button",
												size: "sm",
												variant: "outline",
												className: "rounded-xl",
												disabled: !bulkTargetTopicId || selectedLessonIds.size === 0,
												onClick: () => applyBulk(moveLessonsToTopic(currentSubjects, selectedLessonIds, selectedSubject.id, bulkTargetTopicId), `Đã chuyển ${selectedLessonIds.size} bài sang chủ đề mới.`),
												"aria-label": "Chuyển các bài sang chủ đề",
												children: /* @__PURE__ */ (void 0)(ChevronRight, { className: "h-4 w-4" }, void 0, false, {
													fileName: _jsxFileName$4,
													lineNumber: 554,
													columnNumber: 381
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 554,
												columnNumber: 25
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName$4,
											lineNumber: 549,
											columnNumber: 23
										}, this),
										/* @__PURE__ */ (void 0)("div", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ (void 0)(Input, {
												type: "date",
												value: bulkDate,
												onChange: (event) => setBulkDate(event.target.value),
												className: "h-9 min-w-0 flex-1 rounded-xl bg-white text-xs"
											}, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 557,
												columnNumber: 25
											}, this), /* @__PURE__ */ (void 0)(Button, {
												type: "button",
												size: "sm",
												variant: "outline",
												className: "rounded-xl",
												disabled: selectedLessonIds.size === 0,
												onClick: () => applyBulk(updateLessonsDetails(currentSubjects, selectedLessonIds, { scheduledDate: bulkDate }), `Đã cập nhật ngày cho ${selectedLessonIds.size} bài.`),
												"aria-label": "Cập nhật ngày dự kiến",
												children: /* @__PURE__ */ (void 0)(CalendarDays, { className: "h-4 w-4" }, void 0, false, {
													fileName: _jsxFileName$4,
													lineNumber: 558,
													columnNumber: 341
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 558,
												columnNumber: 25
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName$4,
											lineNumber: 556,
											columnNumber: 23
										}, this),
										/* @__PURE__ */ (void 0)("div", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ (void 0)("select", {
												value: bulkMinutes,
												onChange: (event) => setBulkMinutes(Number(event.target.value)),
												className: "h-9 min-w-0 flex-1 rounded-xl border border-indigo-200 bg-white px-2 text-xs",
												children: [
													30,
													60,
													90,
													120
												].map((minutes) => /* @__PURE__ */ (void 0)("option", {
													value: minutes,
													children: [minutes, " phút"]
												}, minutes, true, {
													fileName: _jsxFileName$4,
													lineNumber: 562,
													columnNumber: 63
												}, this))
											}, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 561,
												columnNumber: 25
											}, this), /* @__PURE__ */ (void 0)(Button, {
												type: "button",
												size: "sm",
												variant: "outline",
												className: "rounded-xl",
												disabled: selectedLessonIds.size === 0,
												onClick: () => applyBulk(updateLessonsDetails(currentSubjects, selectedLessonIds, { plannedDurationMinutes: bulkMinutes }), `Đã đặt mục tiêu ${bulkMinutes} phút cho ${selectedLessonIds.size} bài.`),
												children: "Áp dụng"
											}, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 564,
												columnNumber: 25
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName$4,
											lineNumber: 560,
											columnNumber: 23
										}, this),
										/* @__PURE__ */ (void 0)("div", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ (void 0)(Button, {
												type: "button",
												size: "sm",
												variant: "outline",
												className: "flex-1 rounded-xl",
												disabled: selectedLessonIds.size === 0,
												onClick: () => {
													if (confirmTimerImpact(selectedLessonIds, `lưu trữ ${selectedLessonIds.size} bài học`) && window.confirm(`Lưu trữ ${selectedLessonIds.size} bài học? Lịch sử phiên học vẫn được giữ.`)) applyBulk(archiveLessons(currentSubjects, selectedLessonIds), `Đã lưu trữ ${selectedLessonIds.size} bài học.`, true);
												},
												children: [/* @__PURE__ */ (void 0)(Archive, { className: "h-4 w-4" }, void 0, false, {
													fileName: _jsxFileName$4,
													lineNumber: 567,
													columnNumber: 467
												}, this), " Lưu trữ"]
											}, void 0, true, {
												fileName: _jsxFileName$4,
												lineNumber: 567,
												columnNumber: 25
											}, this), /* @__PURE__ */ (void 0)(Button, {
												type: "button",
												size: "sm",
												variant: "outline",
												className: "rounded-xl text-red-700",
												disabled: selectedLessonIds.size === 0,
												onClick: () => {
													if (confirmTimerImpact(selectedLessonIds, `xóa ${selectedLessonIds.size} bài học`) && window.confirm(`Xóa ${selectedLessonIds.size} bài học khỏi lộ trình và lịch tương lai? Lịch sử phiên học vẫn được giữ.`)) applyBulk(removeLessonsFromSubjects(currentSubjects, selectedLessonIds), `Đã xóa ${selectedLessonIds.size} bài học.`);
												},
												"aria-label": "Xóa các bài đã chọn",
												children: /* @__PURE__ */ (void 0)(Trash2, { className: "h-4 w-4" }, void 0, false, {
													fileName: _jsxFileName$4,
													lineNumber: 568,
													columnNumber: 531
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 568,
												columnNumber: 25
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName$4,
											lineNumber: 566,
											columnNumber: 23
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName$4,
									lineNumber: 541,
									columnNumber: 21
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 525,
								columnNumber: 19
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "mt-4 space-y-3",
								children: [filteredMilestones.map((milestone) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TopicGroup, {
									title: milestone.title,
									lessons: milestone.lessons,
									subject: selectedSubject,
									subjects: currentSubjects,
									progress,
									minutesByLesson,
									onEdit: openLessonEdit,
									selectionMode,
									selectedLessonIds,
									onToggleSelection: toggleLessonSelection,
									onEditTopic: () => setTopicEditor({
										id: milestone.id,
										title: milestone.title
									}),
									canMoveTopicUp: selectedSubject.milestones.findIndex((item) => item.id === milestone.id) > 0,
									canMoveTopicDown: selectedSubject.milestones.findIndex((item) => item.id === milestone.id) < selectedSubject.milestones.length - 1,
									onMoveTopicUp: () => apply(reorderTopic(currentSubjects, selectedSubject.id, milestone.id, -1), `Đã di chuyển chủ đề ${milestone.title} lên.`),
									onMoveTopicDown: () => apply(reorderTopic(currentSubjects, selectedSubject.id, milestone.id, 1), `Đã di chuyển chủ đề ${milestone.title} xuống.`),
									onDeleteTopic: () => {
										const message = milestone.lessons.length ? `Xóa chủ đề “${milestone.title}”? ${milestone.lessons.length} bài sẽ được chuyển sang “Chưa phân loại”.` : `Xóa chủ đề “${milestone.title}”?`;
										if (!window.confirm(message)) return;
										apply(removeTopicAndMoveLessonsToUncategorized(currentSubjects, selectedSubject.id, milestone.id), `Đã xóa chủ đề ${milestone.title}.`);
									},
									onApply: apply,
									onArchiveChanged: () => setArchiveVersion((version) => version + 1),
									confirmTimerImpact
								}, milestone.id, false, {
									fileName: _jsxFileName$4,
									lineNumber: 576,
									columnNumber: 21
								}, this)), filteredMilestones.length === 0 && /* @__PURE__ */ (void 0)(EmptyState, {
									title: "Không tìm thấy bài học phù hợp",
									description: "Hãy thử từ khóa hoặc bộ lọc khác."
								}, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 609,
									columnNumber: 21
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 574,
								columnNumber: 17
							}, this)
						] }, void 0, true, {
							fileName: _jsxFileName$4,
							lineNumber: 458,
							columnNumber: 15
						}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(EmptyState, {
							title: "Chọn một môn học",
							description: "Chọn môn ở cột bên trái để xem và tổ chức các bài học."
						}, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 614,
							columnNumber: 15
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 456,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$4,
					lineNumber: 356,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$4,
				lineNumber: 348,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Dialog, {
				open: Boolean(topicEditor),
				onOpenChange: (next) => !next && setTopicEditor(null),
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent, {
					className: "max-w-md rounded-3xl",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle, { children: topicEditor?.id ? "Đổi tên chủ đề" : "Thêm chủ đề" }, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 623,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogDescription, { children: "Bài học có thể được thêm vào chủ đề này ngay hoặc sau đó." }, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 624,
						columnNumber: 13
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$4,
						lineNumber: 622,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, { children: "Tên chủ đề hoặc chương" }, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 628,
							columnNumber: 15
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
							value: topicEditor?.title ?? "",
							onChange: (event) => setTopicEditor((current) => current ? {
								...current,
								title: event.target.value
							} : current),
							onKeyDown: (event) => event.key === "Enter" && saveTopic(),
							placeholder: "VD: Chương 2: Dãy số"
						}, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 629,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName$4,
							lineNumber: 627,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
								variant: "outline",
								onClick: () => setTopicEditor(null),
								children: "Hủy"
							}, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 637,
								columnNumber: 15
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
								onClick: saveTopic,
								children: topicEditor?.id ? "Lưu thay đổi" : "Thêm chủ đề"
							}, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 638,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$4,
							lineNumber: 636,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$4,
						lineNumber: 626,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$4,
					lineNumber: 621,
					columnNumber: 9
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 620,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Dialog, {
				open: Boolean(editingSubject),
				onOpenChange: (next) => !next && setEditingSubject(null),
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent, {
					className: "max-w-md rounded-3xl",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle, { children: "Chỉnh sửa môn học" }, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 646,
						columnNumber: 25
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogDescription, { children: "Cập nhật tên và biểu tượng môn." }, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 646,
						columnNumber: 69
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$4,
						lineNumber: 646,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, { children: "Tên môn học" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 648,
								columnNumber: 18
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
								value: subjectDraft.name,
								onChange: (event) => setSubjectDraft((current) => ({
									...current,
									name: event.target.value
								}))
							}, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 648,
								columnNumber: 44
							}, this)] }, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 648,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, { children: "Biểu tượng" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 649,
								columnNumber: 18
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
								value: subjectDraft.emoji,
								maxLength: 4,
								onChange: (event) => setSubjectDraft((current) => ({
									...current,
									emoji: event.target.value
								}))
							}, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 649,
								columnNumber: 43
							}, this)] }, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 649,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex justify-end gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
									variant: "outline",
									onClick: () => setEditingSubject(null),
									children: "Hủy"
								}, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 650,
									columnNumber: 53
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
									onClick: saveSubject,
									children: "Lưu thay đổi"
								}, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 650,
									columnNumber: 131
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 650,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$4,
						lineNumber: 647,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$4,
					lineNumber: 645,
					columnNumber: 9
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 644,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Dialog, {
				open: Boolean(editingLesson),
				onOpenChange: (next) => !next && setEditingLesson(null),
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent, {
					className: "max-w-lg rounded-3xl",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle, { children: "Chỉnh sửa bài học" }, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 657,
						columnNumber: 25
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogDescription, { children: "Thời lượng mục tiêu khác với thời lượng một phiên Pomodoro." }, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 657,
						columnNumber: 69
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$4,
						lineNumber: 657,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, { children: "Tên bài học" }, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 659,
									columnNumber: 44
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
									value: lessonDraft.title,
									onChange: (event) => setLessonDraft((current) => ({
										...current,
										title: event.target.value
									}))
								}, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 659,
									columnNumber: 70
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 659,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, { children: "Chủ đề hoặc chương" }, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 660,
									columnNumber: 44
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
									value: lessonDraft.topic,
									onChange: (event) => setLessonDraft((current) => ({
										...current,
										topic: event.target.value
									}))
								}, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 660,
									columnNumber: 77
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 660,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, { children: "Thời lượng mục tiêu" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 661,
								columnNumber: 18
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
								type: "number",
								min: 1,
								value: lessonDraft.minutes,
								onChange: (event) => setLessonDraft((current) => ({
									...current,
									minutes: Number(event.target.value)
								}))
							}, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 661,
								columnNumber: 52
							}, this)] }, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 661,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, { children: "Ngày dự kiến" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 662,
								columnNumber: 18
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
								type: "date",
								value: lessonDraft.date,
								onChange: (event) => setLessonDraft((current) => ({
									...current,
									date: event.target.value
								}))
							}, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 662,
								columnNumber: 45
							}, this)] }, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 662,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex justify-end gap-2 sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
									variant: "outline",
									onClick: () => setEditingLesson(null),
									children: "Hủy"
								}, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 663,
									columnNumber: 67
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
									onClick: saveLesson,
									children: "Lưu thay đổi"
								}, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 663,
									columnNumber: 144
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 663,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$4,
						lineNumber: 658,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$4,
					lineNumber: 656,
					columnNumber: 9
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 655,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$4,
		lineNumber: 339,
		columnNumber: 5
	}, this);
}
function SubjectHeader({ subject, stats, onEdit, canMoveUp, canMoveDown, onMoveUp, onMoveDown, onArchive, onDelete, onAddTopic, onExport, addLesson }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
		className: "rounded-3xl border bg-gradient-to-br from-white to-indigo-50/60 p-5 shadow-xs",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "flex flex-col gap-4 sm:flex-row sm:items-start",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
					className: "grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-3xl shadow-xs",
					children: subject.emoji
				}, void 0, false, {
					fileName: _jsxFileName$4,
					lineNumber: 701,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
							className: "font-serif text-2xl font-semibold text-slate-900",
							children: subject.name
						}, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 703,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: "mt-1 text-sm text-slate-500",
							children: [
								subject.milestones.length,
								" chủ đề · ",
								stats.lessons,
								" bài · ",
								stats.completed,
								" đã hoàn thành"
							]
						}, void 0, true, {
							fileName: _jsxFileName$4,
							lineNumber: 704,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "mt-3 flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Progress, {
								value: stats.percent,
								className: "h-2 flex-1"
							}, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 705,
								columnNumber: 57
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "text-xs font-bold text-indigo-700",
								children: [stats.percent, "%"]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 705,
								columnNumber: 114
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$4,
							lineNumber: 705,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: "mt-2 text-xs text-slate-500",
							children: [formatMinutes(stats.remaining), " còn lại"]
						}, void 0, true, {
							fileName: _jsxFileName$4,
							lineNumber: 706,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$4,
					lineNumber: 702,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
							type: "button",
							variant: "outline",
							className: "rounded-xl",
							onClick: onAddTopic,
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Plus, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 710,
								columnNumber: 13
							}, this), " Thêm chủ đề"]
						}, void 0, true, {
							fileName: _jsxFileName$4,
							lineNumber: 709,
							columnNumber: 11
						}, this),
						addLesson,
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
								variant: "outline",
								size: "icon",
								className: "rounded-xl",
								"aria-label": "Quản lý môn",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Ellipsis, { className: "h-4 w-4" }, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 714,
									columnNumber: 128
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 714,
								columnNumber: 42
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 714,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuContent, {
							align: "end",
							className: "rounded-xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuItem, {
									onSelect: onEdit,
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PenLine, { className: "mr-2 h-4 w-4" }, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 716,
										columnNumber: 51
									}, this), " Chỉnh sửa môn"]
								}, void 0, true, {
									fileName: _jsxFileName$4,
									lineNumber: 716,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuItem, {
									onSelect: onExport,
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Download, { className: "mr-2 h-4 w-4" }, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 717,
										columnNumber: 53
									}, this), " Xuất riêng môn này"]
								}, void 0, true, {
									fileName: _jsxFileName$4,
									lineNumber: 717,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuItem, {
									disabled: !canMoveUp,
									onSelect: onMoveUp,
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ArrowUp, { className: "mr-2 h-4 w-4" }, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 718,
										columnNumber: 75
									}, this), " Di chuyển lên"]
								}, void 0, true, {
									fileName: _jsxFileName$4,
									lineNumber: 718,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuItem, {
									disabled: !canMoveDown,
									onSelect: onMoveDown,
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ArrowDown, { className: "mr-2 h-4 w-4" }, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 719,
										columnNumber: 79
									}, this), " Di chuyển xuống"]
								}, void 0, true, {
									fileName: _jsxFileName$4,
									lineNumber: 719,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuSeparator, {}, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 720,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuItem, {
									onSelect: onArchive,
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Archive, { className: "mr-2 h-4 w-4" }, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 721,
										columnNumber: 54
									}, this), " Lưu trữ môn"]
								}, void 0, true, {
									fileName: _jsxFileName$4,
									lineNumber: 721,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuSeparator, {}, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 722,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuItem, {
									onSelect: onDelete,
									className: "text-red-700",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Trash2, { className: "mr-2 h-4 w-4" }, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 723,
										columnNumber: 78
									}, this), " Xóa môn và các bài"]
								}, void 0, true, {
									fileName: _jsxFileName$4,
									lineNumber: 723,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName$4,
							lineNumber: 715,
							columnNumber: 13
						}, this)] }, void 0, true, {
							fileName: _jsxFileName$4,
							lineNumber: 713,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$4,
					lineNumber: 708,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName$4,
			lineNumber: 700,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$4,
		lineNumber: 699,
		columnNumber: 5
	}, this);
}
function TopicGroup({ title, lessons, subject, subjects, progress, minutesByLesson, onEdit, selectionMode, selectedLessonIds, onToggleSelection, onEditTopic, canMoveTopicUp, canMoveTopicDown, onMoveTopicUp, onMoveTopicDown, onDeleteTopic, onApply, onArchiveChanged, confirmTimerImpact }) {
	const [open, setOpen] = (0, import_react.useState)(true);
	const completed = lessons.filter((lesson) => Boolean(progress?.completedLessons[lesson.id]) || (minutesByLesson.get(lesson.id) ?? 0) >= lesson.plannedDurationMinutes).length;
	const remaining = lessons.reduce((sum, lesson) => sum + Math.max(0, lesson.plannedDurationMinutes - (minutesByLesson.get(lesson.id) ?? 0)), 0);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Collapsible, {
		open,
		onOpenChange: setOpen,
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
			className: "overflow-hidden rounded-2xl border border-slate-200 bg-white",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex w-full items-center gap-2 bg-slate-50/80 px-3 py-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CollapsibleTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						type: "button",
						className: "flex min-w-0 flex-1 items-center gap-3 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ChevronDown, { className: cn("h-4 w-4 transition", !open && "-rotate-90") }, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 783,
							columnNumber: 15
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
								className: "truncate text-sm font-semibold text-slate-900",
								children: title
							}, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 784,
								columnNumber: 47
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "text-[11px] text-slate-500",
								children: [
									completed,
									" / ",
									lessons.length,
									" bài · ",
									formatMinutes(remaining),
									" còn lại"
								]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 784,
								columnNumber: 121
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$4,
							lineNumber: 784,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$4,
						lineNumber: 782,
						columnNumber: 13
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName$4,
					lineNumber: 781,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
						type: "button",
						variant: "ghost",
						size: "icon",
						className: "h-8 w-8 rounded-lg",
						"aria-label": `Quản lý chủ đề ${title}`,
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Ellipsis, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 790,
							columnNumber: 17
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 789,
						columnNumber: 15
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName$4,
					lineNumber: 788,
					columnNumber: 13
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuContent, {
					align: "end",
					className: "rounded-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuItem, {
							onSelect: onEditTopic,
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PenLine, { className: "mr-2 h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 794,
								columnNumber: 56
							}, this), " Đổi tên chủ đề"]
						}, void 0, true, {
							fileName: _jsxFileName$4,
							lineNumber: 794,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuItem, {
							disabled: !canMoveTopicUp,
							onSelect: onMoveTopicUp,
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ArrowUp, { className: "mr-2 h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 795,
								columnNumber: 85
							}, this), " Di chuyển lên"]
						}, void 0, true, {
							fileName: _jsxFileName$4,
							lineNumber: 795,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuItem, {
							disabled: !canMoveTopicDown,
							onSelect: onMoveTopicDown,
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ArrowDown, { className: "mr-2 h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 796,
								columnNumber: 89
							}, this), " Di chuyển xuống"]
						}, void 0, true, {
							fileName: _jsxFileName$4,
							lineNumber: 796,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuSeparator, {}, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 797,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DropdownMenuItem, {
							onSelect: onDeleteTopic,
							className: "text-red-700",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Trash2, { className: "mr-2 h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 798,
								columnNumber: 83
							}, this), " Xóa chủ đề"]
						}, void 0, true, {
							fileName: _jsxFileName$4,
							lineNumber: 798,
							columnNumber: 15
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$4,
					lineNumber: 793,
					columnNumber: 13
				}, this)] }, void 0, true, {
					fileName: _jsxFileName$4,
					lineNumber: 787,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$4,
				lineNumber: 780,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CollapsibleContent, { children: lessons.length === 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
				className: "px-4 py-5 text-center text-xs text-slate-500",
				children: "Chủ đề này chưa có bài học."
			}, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 804,
				columnNumber: 13
			}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("ul", {
				className: "divide-y divide-slate-100",
				children: lessons.map((lesson, index) => {
					const minutes = minutesByLesson.get(lesson.id) ?? 0;
					const isCompleted = Boolean(progress?.completedLessons[lesson.id]) || minutes >= lesson.plannedDurationMinutes;
					const percent = Math.min(100, Math.round(minutes / Math.max(1, lesson.plannedDurationMinutes) * 100));
					return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("li", {
						className: cn("flex items-start gap-3 p-3 sm:items-center", selectedLessonIds.has(lesson.id) && "bg-indigo-50/70"),
						children: [
							selectionMode && /* @__PURE__ */ (void 0)("input", {
								type: "checkbox",
								checked: selectedLessonIds.has(lesson.id),
								onChange: () => onToggleSelection(lesson.id),
								className: "mt-1 h-5 w-5 shrink-0 rounded border-slate-300 accent-indigo-600 sm:mt-0",
								"aria-label": `Chọn ${lesson.title}`
							}, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 814,
								columnNumber: 21
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(GripVertical, { className: "mt-1 h-4 w-4 shrink-0 text-slate-300 sm:mt-0" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 822,
								columnNumber: 19
							}, this),
							isCompleted ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleCheck, { className: "mt-1 h-5 w-5 shrink-0 text-emerald-600 sm:mt-0" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 823,
								columnNumber: 34
							}, this) : minutes > 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RefreshCcw, { className: "mt-1 h-5 w-5 shrink-0 text-sky-600 sm:mt-0" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 823,
								columnNumber: 126
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Circle, { className: "mt-1 h-5 w-5 shrink-0 text-slate-400 sm:mt-0" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 823,
								columnNumber: 198
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
										className: "break-words text-sm font-semibold text-slate-900",
										children: lesson.title
									}, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 825,
										columnNumber: 21
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: [
											minutes,
											" / ",
											lesson.plannedDurationMinutes,
											" phút · ",
											percent,
											"%"
										] }, void 0, true, {
											fileName: _jsxFileName$4,
											lineNumber: 827,
											columnNumber: 23
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: lesson.scheduledDate ? `Dự kiến ${lesson.scheduledDate}` : "Chưa lên lịch" }, void 0, false, {
											fileName: _jsxFileName$4,
											lineNumber: 828,
											columnNumber: 23
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$4,
										lineNumber: 826,
										columnNumber: 21
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Progress, {
										value: percent,
										className: "mt-2 h-1.5"
									}, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 830,
										columnNumber: 21
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 824,
								columnNumber: 19
							}, this),
							!selectionMode && /* @__PURE__ */ (void 0)(DropdownMenu, { children: [/* @__PURE__ */ (void 0)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (void 0)(Button, {
									variant: "ghost",
									size: "icon",
									className: "rounded-xl",
									"aria-label": `Quản lý ${lesson.title}`,
									children: /* @__PURE__ */ (void 0)(Ellipsis, { className: "h-4 w-4" }, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 833,
										columnNumber: 148
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 833,
									columnNumber: 50
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 833,
								columnNumber: 21
							}, this), /* @__PURE__ */ (void 0)(DropdownMenuContent, {
								align: "end",
								className: "w-56 rounded-xl",
								children: [
									/* @__PURE__ */ (void 0)(DropdownMenuItem, {
										onSelect: () => onEdit(lesson),
										children: [/* @__PURE__ */ (void 0)(PenLine, { className: "mr-2 h-4 w-4" }, void 0, false, {
											fileName: _jsxFileName$4,
											lineNumber: 835,
											columnNumber: 73
										}, this), " Chỉnh sửa bài học"]
									}, void 0, true, {
										fileName: _jsxFileName$4,
										lineNumber: 835,
										columnNumber: 23
									}, this),
									subjects.filter((candidate) => candidate.id !== subject.id).map((candidate) => /* @__PURE__ */ (void 0)(DropdownMenuItem, {
										onSelect: () => onApply(moveLessonToSubject(subjects, lesson.id, candidate.id), `Đã chuyển bài sang ${candidate.name}.`),
										children: [
											/* @__PURE__ */ (void 0)(BookOpen, { className: "mr-2 h-4 w-4" }, void 0, false, {
												fileName: _jsxFileName$4,
												lineNumber: 838,
												columnNumber: 27
											}, this),
											" Chuyển sang ",
											candidate.name
										]
									}, candidate.id, true, {
										fileName: _jsxFileName$4,
										lineNumber: 837,
										columnNumber: 25
									}, this)),
									/* @__PURE__ */ (void 0)(DropdownMenuItem, {
										onSelect: () => onApply(duplicateLessonInSubjects(subjects, lesson.id), `Đã nhân bản bài ${lesson.title}.`),
										children: [/* @__PURE__ */ (void 0)(Plus, { className: "mr-2 h-4 w-4" }, void 0, false, {
											fileName: _jsxFileName$4,
											lineNumber: 841,
											columnNumber: 150
										}, this), " Nhân bản bài học"]
									}, void 0, true, {
										fileName: _jsxFileName$4,
										lineNumber: 841,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ (void 0)(DropdownMenuSeparator, {}, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 842,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ (void 0)(DropdownMenuItem, {
										disabled: index === 0,
										onSelect: () => onApply(reorderLesson(subjects, lesson.id, -1)),
										children: [/* @__PURE__ */ (void 0)(ArrowUp, { className: "mr-2 h-4 w-4" }, void 0, false, {
											fileName: _jsxFileName$4,
											lineNumber: 843,
											columnNumber: 129
										}, this), " Di chuyển lên"]
									}, void 0, true, {
										fileName: _jsxFileName$4,
										lineNumber: 843,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ (void 0)(DropdownMenuItem, {
										disabled: index === lessons.length - 1,
										onSelect: () => onApply(reorderLesson(subjects, lesson.id, 1)),
										children: [/* @__PURE__ */ (void 0)(ArrowDown, { className: "mr-2 h-4 w-4" }, void 0, false, {
											fileName: _jsxFileName$4,
											lineNumber: 844,
											columnNumber: 145
										}, this), " Di chuyển xuống"]
									}, void 0, true, {
										fileName: _jsxFileName$4,
										lineNumber: 844,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ (void 0)(DropdownMenuSeparator, {}, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 845,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ (void 0)(DropdownMenuItem, {
										onSelect: () => {
											if (!confirmTimerImpact([lesson.id], `lưu trữ bài ${lesson.title}`)) return;
											onApply(archiveLesson(subjects, lesson.id), `Đã lưu trữ bài ${lesson.title}.`);
											onArchiveChanged();
										},
										children: [/* @__PURE__ */ (void 0)(Archive, { className: "mr-2 h-4 w-4" }, void 0, false, {
											fileName: _jsxFileName$4,
											lineNumber: 846,
											columnNumber: 239
										}, this), " Lưu trữ"]
									}, void 0, true, {
										fileName: _jsxFileName$4,
										lineNumber: 846,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ (void 0)(DropdownMenuItem, {
										className: "text-red-700",
										onSelect: () => {
											if (confirmTimerImpact([lesson.id], `xóa bài ${lesson.title}`) && window.confirm(`Xóa “${lesson.title}”? Bài bị xóa khỏi lộ trình và lịch tương lai; lịch sử phiên học vẫn được giữ.`)) onApply(removeLessonFromSubjects(subjects, lesson.id), `Đã xóa bài ${lesson.title}.`);
										},
										children: [/* @__PURE__ */ (void 0)(Trash2, { className: "mr-2 h-4 w-4" }, void 0, false, {
											fileName: _jsxFileName$4,
											lineNumber: 847,
											columnNumber: 358
										}, this), " Xóa bài học"]
									}, void 0, true, {
										fileName: _jsxFileName$4,
										lineNumber: 847,
										columnNumber: 23
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 834,
								columnNumber: 21
							}, this)] }, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 832,
								columnNumber: 38
							}, this)
						]
					}, lesson.id, true, {
						fileName: _jsxFileName$4,
						lineNumber: 812,
						columnNumber: 17
					}, this);
				})
			}, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 806,
				columnNumber: 11
			}, this) }, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 802,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$4,
			lineNumber: 779,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$4,
		lineNumber: 778,
		columnNumber: 5
	}, this);
}
function ArchivedItem({ label, onRestore }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "flex items-center gap-2 rounded-xl border bg-white p-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FolderArchive, { className: "h-4 w-4 text-amber-600" }, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 862,
				columnNumber: 82
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
				className: "min-w-0 flex-1 truncate text-xs font-medium",
				children: label
			}, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 862,
				columnNumber: 134
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
				size: "icon",
				variant: "ghost",
				className: "h-8 w-8 rounded-lg",
				onClick: onRestore,
				"aria-label": `Khôi phục ${label}`,
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Undo2, { className: "h-4 w-4" }, void 0, false, {
					fileName: _jsxFileName$4,
					lineNumber: 862,
					columnNumber: 331
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 862,
				columnNumber: 210
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$4,
		lineNumber: 862,
		columnNumber: 10
	}, this);
}
function EmptyState({ title, description }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "rounded-2xl border border-dashed bg-slate-50 p-7 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LibraryBig, { className: "mx-auto h-8 w-8 text-slate-300" }, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 866,
				columnNumber: 88
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
				className: "mt-2 text-sm font-semibold text-slate-800",
				children: title
			}, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 866,
				columnNumber: 145
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
				className: "mt-1 text-xs text-slate-500",
				children: description
			}, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 866,
				columnNumber: 215
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$4,
		lineNumber: 866,
		columnNumber: 10
	}, this);
}
function formatMinutes(minutes) {
	const hours = Math.floor(minutes / 60);
	const remainder = minutes % 60;
	if (!hours) return `${remainder} phút`;
	if (!remainder) return `${hours} giờ`;
	return `${hours} giờ ${remainder} phút`;
}
var _jsxFileName$3 = "/app/applet/src/components/LevelUpDialog.tsx";
function LevelUpDialog({ open, onOpenChange, level }) {
	const titleInfo = getLevelTitle(level);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent, {
			className: "max-w-md rounded-3xl p-6 text-center sm:p-8 bg-gradient-to-b from-amber-50/90 via-white to-sky-50/90 border-amber-200/90 shadow-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogHeader, {
					className: "items-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-600 text-white shadow-lg animate-bounce",
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Trophy, {
								size: 42,
								className: "fill-amber-200 text-amber-100"
							}, void 0, false, {
								fileName: _jsxFileName$3,
								lineNumber: 20,
								columnNumber: 13
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$3,
							lineNumber: 19,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "mt-4 flex items-center gap-1.5 text-xs font-extrabold text-amber-600 uppercase tracking-widest",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Sparkles, {
								size: 16,
								className: "text-amber-500 fill-amber-400 animate-pulse"
							}, void 0, false, {
								fileName: _jsxFileName$3,
								lineNumber: 23,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Thăng Cấp Thành Công!" }, void 0, false, {
								fileName: _jsxFileName$3,
								lineNumber: 24,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$3,
							lineNumber: 22,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle, {
							className: "font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1",
							children: [
								"🎉 CHÚC MỪNG BẠN ĐẠT CẤP ",
								level,
								"!"
							]
						}, void 0, true, {
							fileName: _jsxFileName$3,
							lineNumber: 26,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogDescription, {
							className: "text-slate-600 text-sm mt-1",
							children: "Bạn vừa bứt phá thêm một cột mốc kỷ luật mới trên hành trình học tập!"
						}, void 0, false, {
							fileName: _jsxFileName$3,
							lineNumber: 29,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$3,
					lineNumber: 18,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "my-5 rounded-2xl border border-amber-200/90 bg-white p-4 shadow-soft space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "text-xs font-semibold uppercase text-slate-500 flex items-center justify-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Award, {
								size: 14,
								className: "text-indigo-600"
							}, void 0, false, {
								fileName: _jsxFileName$3,
								lineNumber: 36,
								columnNumber: 13
							}, this), " Danh Hiệu Đạt Được"]
						}, void 0, true, {
							fileName: _jsxFileName$3,
							lineNumber: 35,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "text-xl font-extrabold text-indigo-900 flex items-center justify-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: titleInfo.icon }, void 0, false, {
								fileName: _jsxFileName$3,
								lineNumber: 39,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: titleInfo.title }, void 0, false, {
								fileName: _jsxFileName$3,
								lineNumber: 40,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$3,
							lineNumber: 38,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "inline-block rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-800 border border-amber-200",
							children: ["Hạng: ", titleInfo.badge]
						}, void 0, true, {
							fileName: _jsxFileName$3,
							lineNumber: 42,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$3,
					lineNumber: 34,
					columnNumber: 9
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
					onClick: () => onOpenChange(false),
					className: "w-full rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white font-bold h-12 shadow-md hover:brightness-105 transition",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Zap, {
						size: 18,
						className: "mr-1.5 fill-current"
					}, void 0, false, {
						fileName: _jsxFileName$3,
						lineNumber: 51,
						columnNumber: 11
					}, this), " Tiếp Tục Chinh Phục"]
				}, void 0, true, {
					fileName: _jsxFileName$3,
					lineNumber: 47,
					columnNumber: 9
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName$3,
			lineNumber: 17,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$3,
		lineNumber: 16,
		columnNumber: 5
	}, this);
}
var _jsxFileName$2 = "/app/applet/src/components/StorageRecoveryPanel.tsx";
function downloadRaw(key, raw) {
	const blob = new Blob([raw], { type: "application/json;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = `${key}-raw-recovery.json`;
	anchor.click();
	URL.revokeObjectURL(url);
}
/** A blocking, persistent panel: normal interactions must not imply a saved state. */
function StorageRecoveryPanel({ issues, onRetry, onRestore, onScopedReset }) {
	if (issues.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
		className: "mx-auto mb-4 max-w-7xl rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-sm",
		role: "alert",
		"aria-live": "assertive",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TriangleAlert, {
				className: "mt-0.5 h-5 w-5 shrink-0",
				"aria-hidden": "true"
			}, void 0, false, {
				fileName: _jsxFileName$2,
				lineNumber: 41,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "min-w-0 flex-1 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
						className: "font-semibold",
						children: "Dữ liệu cần được khôi phục trước khi tiếp tục"
					}, void 0, false, {
						fileName: _jsxFileName$2,
						lineNumber: 44,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "mt-1 text-sm",
						children: "Các thay đổi mới đang bị chặn để tránh ghi đè hoặc thông báo thành công sai."
					}, void 0, false, {
						fileName: _jsxFileName$2,
						lineNumber: 45,
						columnNumber: 13
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 43,
						columnNumber: 11
					}, this),
					issues.map((issue) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "rounded-xl border border-amber-200 bg-white/70 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "font-medium",
								children: issue.label
							}, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 51,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "mt-1 text-sm",
								children: issue.error
							}, void 0, false, {
								fileName: _jsxFileName$2,
								lineNumber: 52,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: [
									issue.raw !== void 0 && /* @__PURE__ */ (void 0)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => downloadRaw(issue.key, issue.raw),
										children: [/* @__PURE__ */ (void 0)(Download, { className: "h-4 w-4" }, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 60,
											columnNumber: 21
										}, this), " Xuất bản gốc"]
									}, void 0, true, {
										fileName: _jsxFileName$2,
										lineNumber: 55,
										columnNumber: 19
									}, this),
									issue.canRestore && onRestore && /* @__PURE__ */ (void 0)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => onRestore(issue.key),
										children: [/* @__PURE__ */ (void 0)(RotateCcw, { className: "h-4 w-4" }, void 0, false, {
											fileName: _jsxFileName$2,
											lineNumber: 65,
											columnNumber: 21
										}, this), " Khôi phục bản sao lưu"]
									}, void 0, true, {
										fileName: _jsxFileName$2,
										lineNumber: 64,
										columnNumber: 19
									}, this),
									issue.status === "invalid" && onScopedReset && /* @__PURE__ */ (void 0)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => {
											if (window.confirm(`Xóa riêng dữ liệu lỗi “${issue.label}”? Bản gốc sẽ được lưu để hoàn tác.`)) onScopedReset(issue.key);
										},
										children: "Xóa phạm vi này"
									}, void 0, false, {
										fileName: _jsxFileName$2,
										lineNumber: 69,
										columnNumber: 19
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$2,
								lineNumber: 53,
								columnNumber: 15
							}, this)
						]
					}, issue.key, true, {
						fileName: _jsxFileName$2,
						lineNumber: 50,
						columnNumber: 13
					}, this)),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
						size: "sm",
						variant: "outline",
						onClick: onRetry,
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RefreshCw, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$2,
							lineNumber: 89,
							columnNumber: 13
						}, this), " Thử lại bộ nhớ trình duyệt"]
					}, void 0, true, {
						fileName: _jsxFileName$2,
						lineNumber: 88,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName$2,
				lineNumber: 42,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$2,
			lineNumber: 40,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$2,
		lineNumber: 35,
		columnNumber: 5
	}, this);
}
var _jsxFileName$1 = "/app/applet/src/components/MobileBottomNav.tsx";
var items = [
	{
		value: "today",
		label: "Hôm nay",
		icon: House
	},
	{
		value: "weekly",
		label: "Tổng kết",
		icon: ChartColumn
	},
	{
		value: "plan",
		label: "Kế hoạch",
		icon: CalendarRange
	}
];
function MobileBottomNav({ value, onValueChange, onOpenNotifications }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("nav", {
		"aria-label": "Điều hướng chính trên thiết bị di động",
		className: "fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-white/80 bg-white/95 p-1.5 shadow-xl backdrop-blur md:hidden",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "grid grid-cols-4 gap-1",
			children: [items.map((item) => {
				const Icon = item.icon;
				const active = value === item.value;
				return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
					type: "button",
					"aria-current": active ? "page" : void 0,
					onClick: () => onValueChange(item.value),
					className: cn("flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-semibold transition", active ? "bg-sky-100 text-sky-900 shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"),
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Icon, {
						className: "h-5 w-5",
						"aria-hidden": "true"
					}, void 0, false, {
						fileName: _jsxFileName$1,
						lineNumber: 44,
						columnNumber: 15
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "max-w-full truncate",
						children: item.label
					}, void 0, false, {
						fileName: _jsxFileName$1,
						lineNumber: 45,
						columnNumber: 15
					}, this)]
				}, item.value, true, {
					fileName: _jsxFileName$1,
					lineNumber: 32,
					columnNumber: 13
				}, this);
			}), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
				type: "button",
				onClick: onOpenNotifications,
				className: "flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Bell, {
					className: "h-5 w-5",
					"aria-hidden": "true"
				}, void 0, false, {
					fileName: _jsxFileName$1,
					lineNumber: 54,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
					className: "max-w-full truncate",
					children: "Nhắc học"
				}, void 0, false, {
					fileName: _jsxFileName$1,
					lineNumber: 55,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$1,
				lineNumber: 49,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$1,
			lineNumber: 27,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$1,
		lineNumber: 23,
		columnNumber: 5
	}, this);
}
var _jsxFileName = "/app/applet/src/routes/index.tsx?tsr-split=component";
var LazyModuleBoundary = class extends import_react.Component {
	state = { failed: false };
	static getDerivedStateFromError() {
		return { failed: true };
	}
	render() {
		if (this.state.failed) return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			role: "alert",
			className: "rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive",
			children: [
				"Không thể tải ",
				this.props.label,
				". Hãy tải lại trang rồi thử lại; dữ liệu đã lưu không bị thay đổi."
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 48,
			columnNumber: 14
		}, this);
		return this.props.children;
	}
};
var LazyTopBar = (0, import_react.lazy)(async () => {
	const loaded = await loadLazyModule(() => import("./TopBar-DR2qmuaJ.mjs"));
	if (loaded.status === "error") throw new Error(loaded.error);
	return { default: loaded.value.TopBar };
});
var LazyPushNotificationCenterModal = (0, import_react.lazy)(async () => {
	const loaded = await loadLazyModule(() => import("./PushNotificationCenterModal-DgWMlT7x.mjs"));
	if (loaded.status === "error") throw new Error(loaded.error);
	return { default: loaded.value.PushNotificationCenterModal };
});
function isDashboardView(value) {
	return DASHBOARD_VIEWS.includes(value);
}
function isPlanView(value) {
	return PLAN_VIEWS.includes(value);
}
function getLast7Dates() {
	const today = todayISO();
	return Array.from({ length: 7 }, (_, index) => addDaysISO(today, index - 6));
}
function Dashboard() {
	const dashboardSearch = Route.useSearch();
	const navigate = Route.useNavigate();
	const { state, hydrated, storageError, storageStatus, retryStorage, today, streak, studyStreak, level, xpInLevel, achievementPoints, pointsInLevel, weekStats, toggleLesson, updateHabit, setGoals, setReminder, setTodayHours, setDayHours, setDefaultDailyHours, addStudySession, saveHabitDefinition, archiveHabit, deleteHabit, buyStreakFreeze, claimReward, addCustomReward, addRewards, spendCoins } = useProgress();
	const [burst, setBurst] = (0, import_react.useState)(0);
	const [levelUpState, setLevelUpState] = (0, import_react.useState)({
		open: false,
		level: 1
	});
	const [subjects, setSubjects] = (0, import_react.useState)([]);
	const [workspaceStorageLoaded, setWorkspaceStorageLoaded] = (0, import_react.useState)(false);
	const pushAutoSyncAttemptedRef = (0, import_react.useRef)(false);
	const [subjectStorageStatus, setSubjectStorageStatus] = (0, import_react.useState)({ status: "missing" });
	const [timerStorageStatus, setTimerStorageStatus] = (0, import_react.useState)({ status: "missing" });
	const [timerLockStorageStatus, setTimerLockStorageStatus] = (0, import_react.useState)({ status: "missing" });
	const [workspaceChooserOpen, setWorkspaceChooserOpen] = (0, import_react.useState)(false);
	const [onboardingDismissed, setOnboardingDismissed] = (0, import_react.useState)(false);
	const [isPushCenterOpen, setIsPushCenterOpen] = (0, import_react.useState)(false);
	const [activeTimerLesson, setActiveTimerLesson] = (0, import_react.useState)(null);
	const timerRecoveryAttemptedRef = (0, import_react.useRef)(false);
	const hasFactoryResetRollback = readRawSnapshot(RESET_ROLLBACK_KEY).status === "ok";
	const setDashboardView = (0, import_react.useCallback)((value) => {
		if (!isDashboardView(value)) return;
		navigate({ search: (previous) => ({
			...previous,
			view: value
		}) });
	}, [navigate]);
	const setPlanView = (0, import_react.useCallback)((value) => {
		if (!isPlanView(value)) return;
		navigate({ search: (previous) => ({
			...previous,
			plan: value
		}) });
	}, [navigate]);
	const openRoadmapImport = (0, import_react.useCallback)(() => {
		document.querySelector("#roadmap-import-trigger button")?.click();
	}, []);
	const reloadStorageBoundaries = (0, import_react.useCallback)(() => {
		const loadedSubjects = getStoredCustomSubjects();
		setSubjectStorageStatus(loadedSubjects);
		setSubjects(loadedSubjects.status === "ok" ? loadedSubjects.value : []);
		setTimerStorageStatus(loadStoredTimerState());
		setTimerLockStorageStatus(loadTimerLock());
		setWorkspaceStorageLoaded(true);
	}, []);
	(0, import_react.useEffect)(() => {
		reloadStorageBoundaries();
	}, [reloadStorageBoundaries]);
	(0, import_react.useEffect)(() => {
		if (timerRecoveryAttemptedRef.current || !workspaceStorageLoaded || subjects.length === 0) return;
		timerRecoveryAttemptedRef.current = true;
		if (timerStorageStatus.status !== "ok") return;
		const stored = timerStorageStatus.value;
		if (!(stored.isRunning || stored.isMinimized || [
			"paused",
			"expired",
			"warmup_completed",
			"breaking",
			"session_waiting"
		].includes(stored.status))) return;
		const lesson = findLessonById(stored.lessonId, subjects);
		setActiveTimerLesson({
			id: stored.lessonId,
			title: stored.lessonTitle,
			xp: lesson?.xp ?? 0,
			isCompleted: Boolean(state.completedLessons[stored.lessonId])
		});
	}, [
		state.completedLessons,
		subjects,
		timerStorageStatus,
		workspaceStorageLoaded
	]);
	const storageBlocked = [
		storageStatus,
		subjectStorageStatus,
		timerStorageStatus,
		timerLockStorageStatus
	].some((status) => status.status === "invalid" || status.status === "unavailable");
	const recoveryIssues = [
		[
			PROGRESS_STORAGE_KEY,
			"Tiến độ học",
			storageStatus,
			PROGRESS_BACKUP_KEY
		],
		[
			CUSTOM_SUBJECTS_KEY,
			"Danh mục môn và bài",
			subjectStorageStatus,
			CUSTOM_SUBJECTS_BACKUP_KEY
		],
		[
			TIMER_KEY,
			"Trạng thái hẹn giờ",
			timerStorageStatus,
			void 0
		],
		[
			TIMER_LOCK_KEY,
			"Khóa hẹn giờ giữa các tab",
			timerLockStorageStatus,
			void 0
		]
	].flatMap(([key, label, status, backupKey]) => {
		if (status.status === "ok" || status.status === "missing") return [];
		const hasBackup = Boolean(backupKey) && loadStorage(backupKey, () => ({}), getBrowserStorage()).status === "ok";
		return [{
			key,
			label,
			status: status.status,
			error: status.error,
			raw: status.status === "invalid" ? status.raw : void 0,
			canRestore: hasBackup
		}];
	});
	const restoreRecoveryBackup = (0, import_react.useCallback)((key) => {
		const backupKey = key === "hocvien-progress-v2" ? PROGRESS_BACKUP_KEY : key === "hocvien-custom-subjects-v1" ? CUSTOM_SUBJECTS_BACKUP_KEY : null;
		if (!backupKey) return;
		const restored = loadStorage(backupKey, (raw) => {
			if (key === "hocvien-progress-v2") return migrateProgressState(raw).ok ? raw : null;
			return normalizeSubjects(JSON.parse(raw)) ? raw : null;
		}, getBrowserStorage());
		if (restored.status !== "ok") {
			toast.error(restored.status === "missing" ? "Không có bản sao lưu hợp lệ." : restored.error);
			return;
		}
		const transaction = replaceRawValuesSafely(RESET_ROLLBACK_KEY, [{
			key,
			raw: restored.value
		}]);
		if (!transaction.ok) {
			toast.error(transaction.rollbackError ? `${transaction.error} ${transaction.rollbackError}` : transaction.error);
			return;
		}
		window.location.reload();
	}, []);
	const resetRecoveryKey = (0, import_react.useCallback)((key) => {
		const transaction = replaceRawValuesSafely(RESET_ROLLBACK_KEY, [{
			key,
			raw: null
		}]);
		if (!transaction.ok) {
			toast.error(transaction.rollbackError ? `${transaction.error} ${transaction.rollbackError}` : transaction.error);
			return;
		}
		window.location.reload();
	}, []);
	const shiftedDates = (0, import_react.useMemo)(() => buildShiftedSchedule({
		subjects,
		completed: state.completedLessons,
		meta: state.studyMeta,
		settings: state.plannerSettings
	}), [
		subjects,
		state.completedLessons,
		state.studyMeta,
		state.plannerSettings
	]);
	const realStudyStreak = (0, import_react.useMemo)(() => computeStudyStreak(state), [state]);
	const weeklyMetrics = (0, import_react.useMemo)(() => selectWeeklyMetrics({
		state,
		subjects,
		shiftedDates,
		referenceDateISO: todayISO()
	}), [
		state,
		subjects,
		shiftedDates
	]);
	(0, import_react.useEffect)(() => {
		if (storageError) toast.error(storageError, { duration: 12e3 });
	}, [storageError]);
	(0, import_react.useEffect)(() => {
		if (!hydrated || !workspaceStorageLoaded || storageBlocked || pushAutoSyncAttemptedRef.current) return;
		const preferences = getPushPreferences();
		if (!preferences.enabled) return;
		const refreshKey = "smart-study-web-push-last-auto-sync-v1";
		const todayKey = todayISO();
		try {
			if (localStorage.getItem(refreshKey) === todayKey) return;
		} catch {
			return;
		}
		pushAutoSyncAttemptedRef.current = true;
		(async () => {
			try {
				const capability = await getWebPushCapability();
				if (!capability.subscribed || !capability.schedulerConfigured) return;
				const jobs = buildScheduledWebPushJobs({
					state,
					subjects,
					preferences,
					horizonDays: 7
				});
				await syncScheduledWebPush(jobs);
				localStorage.setItem(refreshKey, todayKey);
			} catch (error) {
				console.warn("Không thể tự đồng bộ lịch Web Push:", error);
			}
		})();
	}, [
		hydrated,
		state,
		storageBlocked,
		subjects,
		workspaceStorageLoaded
	]);
	const updateSubjectsSafely = (0, import_react.useCallback)((nextSubjects) => {
		if (storageBlocked) {
			toast.error("Không thể thay đổi danh mục khi bộ nhớ cần được khôi phục.");
			return;
		}
		const saved = saveStoredCustomSubjects(nextSubjects);
		if (!saved.ok) {
			toast.error(saved.error);
			return;
		}
		setSubjects(nextSubjects);
	}, [storageBlocked]);
	const handleStartFocus = (0, import_react.useCallback)((request) => {
		if (storageBlocked) {
			toast.error("Hẹn giờ đang bị tạm dừng cho đến khi bộ nhớ được khôi phục.");
			return;
		}
		setActiveTimerLesson(request);
	}, [storageBlocked]);
	const handleStartFocusFromPush = (0, import_react.useCallback)((lessonId) => {
		if (!lessonId) {
			toast.error("Thông báo này không có bài học để bắt đầu.");
			return;
		}
		const lesson = findLessonById(lessonId, subjects);
		if (!lesson) {
			toast.error("Bài học trong thông báo không còn trong lộ trình.");
			return;
		}
		handleStartFocus({
			id: lesson.id,
			title: lesson.title,
			xp: lesson.xp,
			isCompleted: Boolean(state.completedLessons[lesson.id]),
			initialMinutes: 25
		});
	}, [
		handleStartFocus,
		subjects,
		state.completedLessons
	]);
	(0, import_react.useEffect)(() => {
		if (!dashboardSearch.focusLesson || subjects.length === 0) return;
		const lesson = findLessonById(dashboardSearch.focusLesson, subjects);
		if (lesson) handleStartFocus({
			id: lesson.id,
			title: lesson.title,
			xp: lesson.xp,
			isCompleted: Boolean(state.completedLessons[lesson.id]),
			initialMinutes: 25
		});
		else toast.error("Bài học từ thông báo không còn trong lộ trình.");
		navigate({
			replace: true,
			search: (previous) => ({
				...previous,
				view: "today",
				focusLesson: void 0
			})
		});
	}, [
		dashboardSearch.focusLesson,
		handleStartFocus,
		navigate,
		state.completedLessons,
		subjects
	]);
	const handleTimerRewardsCommitted = (0, import_react.useCallback)((params) => {
		const oldLevel = getLevelFromXp(params.previousXp);
		const newLevel = getLevelFromXp(params.nextXp);
		if (newLevel > oldLevel) {
			setLevelUpState({
				open: true,
				level: newLevel
			});
			setBurst((b) => b + 1);
		}
	}, []);
	const handleToggleLesson = (0, import_react.useCallback)((id, xp) => {
		const wasDone = !!state.completedLessons[id];
		if (!toggleLesson(id, xp)) {
			toast.error("Không thể lưu thay đổi bài học vào trình duyệt.");
			return false;
		}
		if (!wasDone) {
			setBurst((b) => b + 1);
			const res = addRewards({
				xp: 30,
				coins: 10
			});
			toast.success(`🎉 Hoàn thành bài học! +30 XP · +10 🪙`, { description: "Thưởng cột mốc bài học!" });
			if (res.leveledUp) setLevelUpState({
				open: true,
				level: res.newLevel
			});
		}
		return true;
	}, [
		state.completedLessons,
		toggleLesson,
		addRewards
	]);
	const restoreFactoryResetRollback = (0, import_react.useCallback)(() => {
		const restored = restoreSnapshotFromKey(RESET_ROLLBACK_KEY);
		if (!restored.ok) {
			toast.error(restored.error);
			return;
		}
		window.location.reload();
	}, []);
	const handleUpdateHabit = (0, import_react.useCallback)((patch) => {
		const before = today;
		if (!updateHabit(patch)) {
			toast.error("Không thể lưu thay đổi thói quen vào trình duyệt.");
			return;
		}
		const key = Object.keys(patch)[0];
		const nextVal = patch[key];
		const definition = state.habitDefinitions.find((habit) => habit.id === key);
		if (definition?.kind === "counter") {
			const beforeValue = typeof before[key] === "number" ? before[key] : 0;
			if (typeof nextVal === "number" && nextVal >= definition.target && beforeValue < definition.target) {
				setBurst((b) => b + 1);
				toast.success(`Đã đạt mục tiêu ${definition.name} hôm nay!`);
			}
		} else if (nextVal === true && !before[key]) setBurst((b) => b + 1);
	}, [
		state.habitDefinitions,
		today,
		updateHabit
	]);
	const replaceWorkspace = (0, import_react.useCallback)((useDemoData) => {
		if (storageBlocked) {
			toast.error("Không thể tạo không gian mới khi bộ nhớ cần được khôi phục.");
			return;
		}
		const nextProgress = {
			...createInitialProgressState(useDemoData),
			onboardingComplete: true
		};
		const nextSubjects = useDemoData ? SUBJECTS : [];
		const transaction = replaceRawValuesSafely(RESET_ROLLBACK_KEY, [
			{
				key: PROGRESS_STORAGE_KEY,
				raw: JSON.stringify(nextProgress)
			},
			{
				key: CUSTOM_SUBJECTS_KEY,
				raw: JSON.stringify(nextSubjects)
			},
			{
				key: TIMER_KEY,
				raw: null
			},
			{
				key: TIMER_LOCK_KEY,
				raw: null
			},
			{
				key: ARCHIVED_CATALOG_KEY,
				raw: null
			}
		]);
		if (!transaction.ok) {
			toast.error(transaction.rollbackError ? `${transaction.error} ${transaction.rollbackError}` : transaction.error);
			return;
		}
		window.location.reload();
	}, [storageBlocked]);
	const affectedCounts = {
		lessons: subjects.reduce((total, subject) => total + subject.milestones.reduce((sum, milestone) => sum + milestone.lessons.length, 0), 0),
		sessions: state.studySessions.length,
		habits: state.habitDefinitions.length,
		completions: Object.keys(state.completedLessons).length
	};
	const weekLog = getLast7Dates().map((d) => state.habitLog[d]);
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("main", {
		className: "min-h-screen bg-background px-4 py-6 md:px-8",
		"aria-busy": "true",
		"aria-label": "Đang tải không gian học tập",
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "mx-auto max-w-7xl animate-pulse space-y-5",
			role: "status",
			"aria-live": "polite",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
					className: "sr-only",
					children: "Đang tải không gian học tập"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 457,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "h-24 rounded-3xl bg-muted",
					"aria-hidden": "true"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 458,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "h-10 w-72 rounded-lg bg-muted",
					"aria-hidden": "true"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 459,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "h-64 rounded-3xl bg-muted",
					"aria-hidden": "true"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 460,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 456,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 455,
		columnNumber: 12
	}, this);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "min-h-screen bg-gradient-to-br from-sky-50 via-background to-emerald-50/50",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(StorageRecoveryPanel, {
				issues: recoveryIssues,
				onRetry: () => {
					retryStorage();
					reloadStorageBoundaries();
				},
				onRestore: restoreRecoveryBackup,
				onScopedReset: resetRecoveryKey
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 465,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ConfettiBurst, { trigger: burst }, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 469,
				columnNumber: 7
			}, this),
			isPushCenterOpen && /* @__PURE__ */ (void 0)(LazyModuleBoundary, {
				label: "trung tâm thông báo",
				children: /* @__PURE__ */ (void 0)(import_react.Suspense, {
					fallback: /* @__PURE__ */ (void 0)("p", {
						role: "status",
						"aria-live": "polite",
						className: "rounded-2xl bg-sky-50 p-4 text-sm text-sky-900",
						children: "Đang tải trung tâm thông báo…"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 471,
						columnNumber: 31
					}, this),
					children: /* @__PURE__ */ (void 0)(LazyPushNotificationCenterModal, {
						open: isPushCenterOpen,
						onOpenChange: setIsPushCenterOpen,
						progressState: state,
						subjects,
						completedLessons: state.completedLessons,
						shiftedDates,
						habitDefinitions: state.habitDefinitions,
						habitEntryToday: today,
						reminders: state.reminders,
						onStartFocus: handleStartFocusFromPush,
						onToggleLesson: handleToggleLesson,
						onUpdateHabit: handleUpdateHabit
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 474,
						columnNumber: 13
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 471,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 470,
				columnNumber: 28
			}, this),
			activeTimerLesson && /* @__PURE__ */ (void 0)(FocusTimerModal, {
				lessonId: activeTimerLesson.id,
				lessonTitle: activeTimerLesson.title,
				isOpen: true,
				onClose: () => setActiveTimerLesson(null),
				onRecordSession: addStudySession,
				onRewardsCommitted: handleTimerRewardsCommitted,
				onToggleComplete: (lessonId) => handleToggleLesson(lessonId, activeTimerLesson.xp),
				isCompleted: activeTimerLesson.isCompleted,
				initialMinutes: activeTimerLesson.initialMinutes
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 477,
				columnNumber: 29
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LevelUpDialog, {
				open: levelUpState.open,
				onOpenChange: (open) => setLevelUpState((prev) => ({
					...prev,
					open
				})),
				level: levelUpState.level
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 478,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(OnboardingDialog, {
				open: !state.onboardingComplete && !onboardingDismissed || workspaceChooserOpen,
				onStartEmpty: () => {
					replaceWorkspace(false);
				},
				onUseDemo: () => {
					replaceWorkspace(true);
				},
				onCancel: workspaceChooserOpen ? () => {
					setWorkspaceChooserOpen(false);
					setOnboardingDismissed(true);
				} : void 0,
				canRestoreFactoryReset: hasFactoryResetRollback,
				onRestoreFactoryReset: restoreFactoryResetRollback,
				affectedCounts: workspaceChooserOpen ? affectedCounts : void 0
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 482,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "mx-auto flex w-full max-w-7xl flex-col px-3 pb-24 pt-4 sm:px-4 sm:pt-6 md:px-8 md:pb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Tabs, {
						value: dashboardSearch.view,
						onValueChange: setDashboardView,
						className: "mt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsList, {
								className: "hidden max-w-full overflow-x-auto md:inline-flex",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsTrigger, {
										value: "today",
										children: "Hôm nay"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 503,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsTrigger, {
										value: "weekly",
										children: "Tổng kết tuần"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 504,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsTrigger, {
										value: "plan",
										children: "Kế hoạch"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 505,
										columnNumber: 13
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 502,
								columnNumber: 11
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsContent, {
								value: "today",
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TodayPanel, {
									state,
									subjects,
									onToggleLesson: handleToggleLesson,
									onSetTodayHours: setTodayHours,
									onAddStudySession: addStudySession,
									onStartFocus: handleStartFocus,
									onSubjectsUpdated: updateSubjectsSafely,
									onOpenRoadmapImport: openRoadmapImport,
									habitSidebar: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
										id: "habits",
										"aria-label": "Thói quen hôm nay",
										children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(HabitSidebar, {
											entry: today,
											streak,
											weekLog,
											onUpdate: handleUpdateHabit,
											definitions: state.habitDefinitions,
											onSaveDefinition: saveHabitDefinition,
											onArchiveHabit: archiveHabit,
											onDeleteHabit: deleteHabit
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 510,
											columnNumber: 19
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 509,
										columnNumber: 290
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 509,
									columnNumber: 13
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 508,
								columnNumber: 11
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsContent, {
								value: "weekly",
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(WeeklyStudySummary, {
									metrics: weeklyMetrics,
									todayTargetMinutes: Math.round(state.plannerSettings.todayHours * 60)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 515,
									columnNumber: 13
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 514,
								columnNumber: 11
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsContent, {
								value: "plan",
								className: "mt-4 space-y-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "flex flex-wrap items-center justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
											className: "font-serif text-xl font-semibold text-slate-900",
											children: "Kế hoạch học tập"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 521,
											columnNumber: 17
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
											className: "text-sm text-slate-500",
											children: "Phân bổ thời gian tại đây; nội dung môn và bài được quản lý riêng."
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 522,
											columnNumber: 17
										}, this)] }, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 520,
											columnNumber: 15
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CourseManagerModal, {
											currentSubjects: subjects,
											onSubjectsUpdated: updateSubjectsSafely,
											progress: state,
											activeTimerLessonId: activeTimerLesson?.id ?? null,
											trigger: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
												type: "button",
												className: "inline-flex h-9 items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-3 text-xs font-semibold text-indigo-800 hover:bg-indigo-100",
												children: "Quản lý môn & bài"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 524,
												columnNumber: 181
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 524,
											columnNumber: 15
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 519,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ForecastCard, {
										state,
										subjects,
										onSetDefaultDailyHours: setDefaultDailyHours,
										shiftedDates
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 528,
										columnNumber: 13
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Tabs, {
										value: dashboardSearch.plan,
										onValueChange: setPlanView,
										children: [
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsList, {
												className: "bg-slate-200/60 p-1 rounded-xl inline-flex h-auto gap-1 border-0",
												children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsTrigger, {
													value: "flex",
													className: "rounded-lg px-4 py-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all",
													children: "Lịch điều chỉnh"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 531,
													columnNumber: 17
												}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsTrigger, {
													value: "original",
													className: "rounded-lg px-4 py-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all",
													children: "Lộ trình"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 534,
													columnNumber: 17
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 530,
												columnNumber: 15
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsContent, {
												value: "flex",
												className: "mt-4",
												children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FlexiblePlanner, {
													state,
													subjects,
													onSetDayHours: setDayHours
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 539,
													columnNumber: 17
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 538,
												columnNumber: 15
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsContent, {
												value: "original",
												className: "mt-4 space-y-4",
												children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
													className: "min-w-0",
													children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LearningRoadmap, {
														completed: state.completedLessons,
														onToggleLesson: handleToggleLesson,
														shiftedDates,
														subjects,
														onSubjectsUpdated: updateSubjectsSafely
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 543,
														columnNumber: 19
													}, this)
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 542,
													columnNumber: 17
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 541,
												columnNumber: 15
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 529,
										columnNumber: 13
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 518,
								columnNumber: 11
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 501,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("footer", {
						className: "mt-8 text-center text-xs text-muted-foreground",
						children: ["Lộ trình học tập & thói quen · dữ liệu lưu trên trình duyệt của bạn · ", todayISO()]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 550,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "order-first",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LazyModuleBoundary, {
							label: "thanh công cụ",
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_react.Suspense, {
								fallback: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									role: "status",
									"aria-live": "polite",
									className: "h-24 rounded-3xl bg-muted p-4 text-sm text-muted-foreground",
									children: "Đang tải công cụ không gian học tập…"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 555,
									columnNumber: 33
								}, this),
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LazyTopBar, {
									level,
									xp: state.xp,
									xpInLevel,
									coins: state.coins,
									streak,
									studyStreak: realStudyStreak,
									currentSubjects: subjects,
									onSubjectsUpdated: updateSubjectsSafely,
									reminders: state.reminders,
									today,
									completedLessons: state.completedLessons,
									shiftedDates,
									onSetReminder: setReminder,
									goals: state.goals,
									weekStats,
									achievementPoints,
									pointsInLevel,
									onSetGoals: setGoals,
									progress: state,
									habitDefinitions: state.habitDefinitions,
									onResetOnboarding: () => {
										setOnboardingDismissed(false);
										setWorkspaceChooserOpen(true);
									},
									onOpenPushCenter: () => setIsPushCenterOpen(true),
									onBuyStreakFreeze: buyStreakFreeze,
									onClaimReward: claimReward,
									onAddCustomReward: addCustomReward,
									activeTimerLesson: activeTimerLesson ? {
										id: activeTimerLesson.id,
										title: activeTimerLesson.title
									} : null
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 558,
									columnNumber: 15
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 555,
								columnNumber: 13
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 554,
							columnNumber: 11
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 553,
						columnNumber: 9
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 500,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(MobileBottomNav, {
				value: dashboardSearch.view,
				onValueChange: setDashboardView,
				onOpenNotifications: () => document.querySelector("#reminder-settings-trigger")?.click()
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 569,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 464,
		columnNumber: 10
	}, this);
}
//#endregion
export { Dashboard as component };
