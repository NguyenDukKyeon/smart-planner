import { r as __toESM } from "../_runtime.mjs";
import { d as todayISO, t as addDaysISO } from "./date-utils-CFRHucsE.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { Ct as Bell, D as Play, Tt as BellOff, _ as ShieldCheck, at as CloudCog, b as Send, h as Smartphone, i as Volume2, pt as Check, r as VolumeX, s as TriangleAlert, ut as CircleCheck, w as RefreshCw } from "../_libs/lucide-react.mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { C as TabsTrigger, I as playPushNotificationChime, L as savePushPreferences, M as getPushPreferences, S as TabsList, b as Tabs, c as DialogDescription, g as Label, h as Input, l as DialogHeader, n as Button, o as Dialog, s as DialogContent, u as DialogTitle, v as SUBJECTS, x as TabsContent, y as Slider } from "./planner-2Pf6y40b.mjs";
import { t as Switch } from "./switch-BV23iPOL.mjs";
import { a as syncScheduledWebPush, i as subscribeToWebPush, n as getWebPushCapability, o as unsubscribeFromWebPush, r as sendWebPushTest, t as buildScheduledWebPushJobs } from "./web-push-schedule-CcQxeb5P.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PushNotificationCenterModal-DgWMlT7x.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
function getApproachingDeadlineLessons(subjects, completedLessons, shiftedDates = {}, referenceISO = todayISO()) {
	const todayStr = referenceISO;
	const tomorrowStr = addDaysISO(todayStr, 1);
	const results = [];
	for (const subject of subjects) for (const milestone of subject.milestones) for (const lesson of milestone.lessons) {
		if (completedLessons[lesson.id]) continue;
		const effectiveDate = shiftedDates[lesson.id] ?? lesson.scheduledDate;
		if (!effectiveDate) continue;
		const isToday = effectiveDate === todayStr;
		const isTomorrow = effectiveDate === tomorrowStr;
		const isOverdue = effectiveDate < todayStr;
		if (isToday || isTomorrow || isOverdue) results.push({
			lesson,
			subjectName: subject.name,
			effectiveDate,
			isToday,
			isTomorrow,
			isOverdue
		});
	}
	return results.sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
}
var _jsxFileName = "/app/applet/src/components/NotificationCenterModal.tsx";
var EMPTY_CAPABILITY = {
	supported: false,
	secureContext: false,
	configured: false,
	schedulerConfigured: false,
	publicKey: null,
	permission: "unsupported",
	subscribed: false
};
function NotificationCenterModal({ open, onOpenChange, progressState, subjects = SUBJECTS, completedLessons = {}, shiftedDates = {}, habitDefinitions = [], habitEntryToday = {}, reminders = {}, onStartFocus, onToggleLesson, onUpdateHabit }) {
	const [prefs, setPrefs] = (0, import_react.useState)(getPushPreferences);
	const [capability, setCapability] = (0, import_react.useState)(EMPTY_CAPABILITY);
	const [activeTab, setActiveTab] = (0, import_react.useState)("push");
	const [busyAction, setBusyAction] = (0, import_react.useState)(null);
	const [lastScheduledCount, setLastScheduledCount] = (0, import_react.useState)(null);
	const [lastSyncedAt, setLastSyncedAt] = (0, import_react.useState)(null);
	const todayStr = todayISO();
	const refreshCapability = async () => {
		const current = await getWebPushCapability();
		setCapability(current);
		return current;
	};
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setPrefs(getPushPreferences());
		refreshCapability();
	}, [open]);
	const approachingDeadlines = (0, import_react.useMemo)(() => getApproachingDeadlineLessons(subjects, completedLessons, shiftedDates, todayStr), [
		subjects,
		completedLessons,
		shiftedDates,
		todayStr
	]);
	const pendingHabits = (0, import_react.useMemo)(() => habitDefinitions.filter((habit) => {
		if (habit.archived) return false;
		const value = habitEntryToday[habit.id];
		const day = (/* @__PURE__ */ new Date(`${todayStr}T12:00:00`)).getDay();
		const target = habit.dailyTargets[(day + 6) % 7] ?? habit.target;
		if (target <= 0) return false;
		return habit.kind === "counter" ? typeof value !== "number" || value < target : value !== true;
	}), [
		habitDefinitions,
		habitEntryToday,
		todayStr
	]);
	const scheduledPreview = (0, import_react.useMemo)(() => buildScheduledWebPushJobs({
		state: progressState,
		subjects,
		preferences: prefs,
		horizonDays: 7
	}), [
		prefs,
		progressState,
		subjects
	]);
	const savePreferences = (patch, announce = false) => {
		const updated = {
			...prefs,
			...patch
		};
		setPrefs(updated);
		savePushPreferences(updated);
		if (announce) toast.success("Đã lưu cấu hình nhắc học.");
		return updated;
	};
	const syncSchedule = async (preferences = prefs) => {
		const jobs = buildScheduledWebPushJobs({
			state: progressState,
			subjects,
			preferences,
			horizonDays: 7
		});
		const result = await syncScheduledWebPush(jobs);
		setLastScheduledCount(result.scheduled.length);
		setLastSyncedAt((/* @__PURE__ */ new Date()).toLocaleString("vi-VN"));
		return result;
	};
	const handleEnable = async () => {
		setBusyAction("enable");
		try {
			await subscribeToWebPush();
			const updated = savePreferences({ enabled: true });
			const result = await syncSchedule(updated);
			await refreshCapability();
			if (!result.schedulerConfigured) toast.warning("Đã bật Web Push. Máy chủ chưa có QStash nên chỉ gửi được thông báo thử.");
			else toast.success(`Đã bật Web Push và lên lịch ${result.scheduled.length} lời nhắc.`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Không thể bật Web Push.");
			await refreshCapability();
		} finally {
			setBusyAction(null);
		}
	};
	const handleSync = async () => {
		setBusyAction("sync");
		try {
			const result = await syncSchedule();
			toast.success(`Đã đồng bộ ${result.scheduled.length} lời nhắc trong 7 ngày tới.`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Không thể đồng bộ lịch Web Push.");
		} finally {
			setBusyAction(null);
		}
	};
	const handleTest = async () => {
		setBusyAction("test");
		try {
			await sendWebPushTest({
				title: "Web Push đang hoạt động",
				body: "Thông báo này được gửi qua máy chủ và service worker, không phải banner mô phỏng.",
				tag: "smart-study-web-push-test",
				url: "/?view=today"
			});
			toast.success("Máy chủ đã gửi thông báo thử tới thiết bị này.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Không thể gửi thông báo thử.");
			await refreshCapability();
		} finally {
			setBusyAction(null);
		}
	};
	const handleDisable = async () => {
		setBusyAction("disable");
		try {
			await unsubscribeFromWebPush();
			savePreferences({ enabled: false });
			setLastScheduledCount(0);
			await refreshCapability();
			toast.success("Đã hủy đăng ký và các lịch Web Push của thiết bị này.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Không thể tắt Web Push.");
		} finally {
			setBusyAction(null);
		}
	};
	const setupProblems = [
		!capability.supported && "Trình duyệt không hỗ trợ Service Worker, Push API hoặc Notification API.",
		capability.supported && !capability.secureContext && "Trang phải chạy bằng HTTPS hoặc localhost.",
		capability.supported && !capability.configured && "Máy chủ chưa cấu hình VAPID keys."
	].filter(Boolean);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent, {
			className: "max-h-[92vh] max-w-3xl overflow-y-auto rounded-3xl p-0 sm:max-h-[88vh]",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "border-b bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-5 sm:p-6",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-soft",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Bell, { className: "h-5 w-5" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 243,
							columnNumber: 17
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 242,
						columnNumber: 15
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle, {
							className: "font-serif text-2xl",
							children: "Nhắc học & Web Push"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 246,
							columnNumber: 17
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogDescription, {
							className: "mt-1",
							children: "Service worker nhận thông báo khi ứng dụng đã đóng; QStash lên lịch gửi từ máy chủ theo giờ bạn chọn."
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 247,
							columnNumber: 17
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 245,
						columnNumber: 15
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 241,
					columnNumber: 13
				}, this) }, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 240,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 239,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "p-4 sm:p-6",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Tabs, {
					value: activeTab,
					onValueChange: setActiveTab,
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsList, {
							className: "grid h-auto w-full grid-cols-3 rounded-2xl p-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsTrigger, {
									value: "push",
									className: "min-h-10 rounded-xl text-xs sm:text-sm",
									children: "Web Push"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 259,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsTrigger, {
									value: "alerts",
									className: "min-h-10 rounded-xl text-xs sm:text-sm",
									children: "Việc cần chú ý"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 262,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsTrigger, {
									value: "settings",
									className: "min-h-10 rounded-xl text-xs sm:text-sm",
									children: "Lịch nhắc"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 265,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 258,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsContent, {
							value: "push",
							className: "mt-5 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
									className: "rounded-2xl border bg-slate-50 p-4",
									"aria-labelledby": "push-status",
									children: [
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "flex flex-wrap items-start justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
												id: "push-status",
												className: "flex items-center gap-2 font-semibold",
												children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Smartphone, { className: "h-4 w-4 text-sky-600" }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 275,
													columnNumber: 23
												}, this), " Trạng thái thiết bị"]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 274,
												columnNumber: 21
											}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
												className: "mt-1 text-sm text-muted-foreground",
												children: capability.subscribed ? "Thiết bị đã đăng ký nhận Web Push." : "Thiết bị chưa đăng ký nhận Web Push."
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 277,
												columnNumber: 21
											}, this)] }, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 273,
												columnNumber: 19
											}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
												className: `rounded-full px-3 py-1 text-xs font-semibold ${capability.subscribed ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`,
												children: capability.subscribed ? "Đã bật" : "Chưa bật"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 283,
												columnNumber: 19
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 272,
											columnNumber: 17
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "mt-4 grid gap-2 text-xs sm:grid-cols-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(StatusItem, {
													ok: capability.secureContext,
													label: "HTTPS"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 295,
													columnNumber: 19
												}, this),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(StatusItem, {
													ok: capability.configured,
													label: "VAPID"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 296,
													columnNumber: 19
												}, this),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(StatusItem, {
													ok: capability.schedulerConfigured,
													label: "Lịch nền QStash"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 297,
													columnNumber: 19
												}, this)
											]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 294,
											columnNumber: 17
										}, this),
										setupProblems.length > 0 && /* @__PURE__ */ (void 0)("div", {
											className: "mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900",
											children: setupProblems.map((problem) => /* @__PURE__ */ (void 0)("p", {
												className: "flex gap-2",
												children: [/* @__PURE__ */ (void 0)(TriangleAlert, { className: "mt-0.5 h-4 w-4 shrink-0" }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 304,
													columnNumber: 25
												}, this), /* @__PURE__ */ (void 0)("span", { children: problem }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 305,
													columnNumber: 25
												}, this)]
											}, problem, true, {
												fileName: _jsxFileName,
												lineNumber: 303,
												columnNumber: 23
											}, this))
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 301,
											columnNumber: 19
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "mt-4 flex flex-wrap gap-2",
											children: !capability.subscribed ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
												onClick: handleEnable,
												disabled: busyAction !== null,
												className: "rounded-xl",
												children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Bell, { className: "mr-2 h-4 w-4" }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 318,
													columnNumber: 23
												}, this), busyAction === "enable" ? "Đang đăng ký…" : "Bật Web Push"]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 313,
												columnNumber: 21
											}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
													onClick: handleSync,
													disabled: busyAction !== null,
													className: "rounded-xl",
													children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RefreshCw, { className: "mr-2 h-4 w-4" }, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 328,
														columnNumber: 25
													}, this), busyAction === "sync" ? "Đang đồng bộ…" : "Đồng bộ lịch 7 ngày"]
												}, void 0, true, {
													fileName: _jsxFileName,
													lineNumber: 323,
													columnNumber: 23
												}, this),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
													variant: "outline",
													onClick: handleTest,
													disabled: busyAction !== null,
													className: "rounded-xl",
													children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Send, { className: "mr-2 h-4 w-4" }, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 337,
														columnNumber: 25
													}, this), busyAction === "test" ? "Đang gửi…" : "Gửi thử thật"]
												}, void 0, true, {
													fileName: _jsxFileName,
													lineNumber: 331,
													columnNumber: 23
												}, this),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
													variant: "ghost",
													onClick: handleDisable,
													disabled: busyAction !== null,
													className: "rounded-xl text-destructive hover:text-destructive",
													children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BellOff, { className: "mr-2 h-4 w-4" }, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 346,
														columnNumber: 25
													}, this), "Tắt trên thiết bị này"]
												}, void 0, true, {
													fileName: _jsxFileName,
													lineNumber: 340,
													columnNumber: 23
												}, this)
											] }, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 322,
												columnNumber: 21
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 311,
											columnNumber: 17
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 271,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
									className: "grid gap-3 sm:grid-cols-3",
									"aria-label": "Tóm tắt lịch Web Push",
									children: [
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Metric, {
											label: "Lời nhắc dự kiến",
											value: scheduledPreview.length
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 355,
											columnNumber: 17
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Metric, {
											label: "Đã lên lịch lần cuối",
											value: lastScheduledCount ?? "—"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 356,
											columnNumber: 17
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Metric, {
											label: "Đồng bộ lần cuối",
											value: lastSyncedAt ?? "Chưa đồng bộ",
											small: true
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 357,
											columnNumber: 17
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 354,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
										className: "flex items-center gap-2 font-semibold",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ShieldCheck, { className: "h-4 w-4" }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 362,
											columnNumber: 19
										}, this), " Cách hệ thống hoạt động"]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 361,
										columnNumber: 17
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
										className: "mt-1 text-sky-900/80",
										children: "Subscription được gửi trực tiếp cho API của ứng dụng khi đồng bộ. Dự án hiện không có tài khoản người dùng hoặc cơ sở dữ liệu; mỗi trình duyệt tự giữ subscription và mã lịch của chính nó."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 364,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 360,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 270,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsContent, {
							value: "alerts",
							className: "mt-5 space-y-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "grid gap-3 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Metric, {
										label: "Bài gần hạn",
										value: approachingDeadlines.length
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 374,
										columnNumber: 17
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Metric, {
										label: "Thói quen chưa xong",
										value: pendingHabits.length
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 375,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 373,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(AlertSection, {
									title: "Bài cần chú ý",
									empty: "Không có bài gần hạn trong kế hoạch.",
									children: approachingDeadlines.map(({ lesson, subjectName }) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 sm:flex-row sm:items-center",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
												className: "truncate font-medium text-amber-950",
												children: lesson.title
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 385,
												columnNumber: 23
											}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
												className: "text-xs text-amber-800",
												children: subjectName
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 386,
												columnNumber: 23
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 384,
											columnNumber: 21
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
												size: "sm",
												onClick: () => onStartFocus?.(lesson.id, lesson.title, lesson.xp),
												className: "rounded-lg",
												children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Play, { className: "mr-1 h-3.5 w-3.5" }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 394,
													columnNumber: 25
												}, this), " Học"]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 389,
												columnNumber: 23
											}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
												size: "sm",
												variant: "outline",
												onClick: () => onToggleLesson?.(lesson.id, lesson.xp),
												className: "rounded-lg",
												children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Check, { className: "mr-1 h-3.5 w-3.5" }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 402,
													columnNumber: 25
												}, this), " Xong"]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 396,
												columnNumber: 23
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 388,
											columnNumber: 21
										}, this)]
									}, lesson.id, true, {
										fileName: _jsxFileName,
										lineNumber: 380,
										columnNumber: 19
									}, this))
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 378,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(AlertSection, {
									title: "Thói quen hôm nay",
									empty: "Các thói quen hôm nay đã hoàn thành.",
									children: pendingHabits.map((habit) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "flex items-center justify-between gap-3 rounded-xl border bg-white p-3",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
												className: "truncate font-medium",
												children: habit.name
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 416,
												columnNumber: 23
											}, this), reminders[habit.id]?.enabled && /* @__PURE__ */ (void 0)("p", {
												className: "text-xs text-muted-foreground",
												children: ["Nhắc lúc ", reminders[habit.id].time]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 418,
												columnNumber: 25
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 415,
											columnNumber: 21
										}, this), habit.kind === "toggle" && /* @__PURE__ */ (void 0)(Button, {
											size: "sm",
											variant: "outline",
											onClick: () => onUpdateHabit?.({ [habit.id]: true }),
											className: "rounded-lg",
											children: [/* @__PURE__ */ (void 0)(CircleCheck, { className: "mr-1 h-3.5 w-3.5" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 430,
												columnNumber: 25
											}, this), " Xong"]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 424,
											columnNumber: 23
										}, this)]
									}, habit.id, true, {
										fileName: _jsxFileName,
										lineNumber: 411,
										columnNumber: 19
									}, this))
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 409,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 372,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsContent, {
							value: "settings",
							className: "mt-5 space-y-4",
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
								className: "space-y-4 rounded-2xl border bg-white p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "grid gap-4 sm:grid-cols-2",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
												htmlFor: "push-morning",
												children: "Nhắc kế hoạch buổi sáng"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 442,
												columnNumber: 21
											}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
												id: "push-morning",
												type: "time",
												value: prefs.morningTime,
												onChange: (event) => savePreferences({ morningTime: event.target.value })
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 443,
												columnNumber: 21
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 441,
											columnNumber: 19
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
												htmlFor: "push-evening",
												children: "Kiểm tra tiến độ buổi tối"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 451,
												columnNumber: 21
											}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
												id: "push-evening",
												type: "time",
												value: prefs.eveningTime,
												onChange: (event) => savePreferences({ eveningTime: event.target.value }),
												disabled: !prefs.enableStreakGuard
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 452,
												columnNumber: 21
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 450,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 440,
										columnNumber: 17
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
											htmlFor: "streak-guard",
											children: "Nhắc kiểm tra tiến độ buổi tối"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 464,
											columnNumber: 21
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
											className: "text-xs text-muted-foreground",
											children: "Gửi một lời nhắc chung; không tự phán đoán bạn đã mất streak."
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 465,
											columnNumber: 21
										}, this)] }, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 463,
											columnNumber: 19
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Switch, {
											id: "streak-guard",
											checked: prefs.enableStreakGuard,
											onCheckedChange: (value) => savePreferences({ enableStreakGuard: value })
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 469,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 462,
										columnNumber: 17
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "space-y-3 border-t pt-4",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "flex items-center justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
												className: "flex items-center gap-2",
												children: [prefs.soundEnabled ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Volume2, { className: "h-4 w-4 text-emerald-600" }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 480,
													columnNumber: 25
												}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(VolumeX, { className: "h-4 w-4 text-slate-400" }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 482,
													columnNumber: 25
												}, this), "Âm thanh xem trước trong ứng dụng"]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 478,
												columnNumber: 21
											}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Switch, {
												checked: prefs.soundEnabled,
												onCheckedChange: (value) => savePreferences({ soundEnabled: value })
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 486,
												columnNumber: 21
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 477,
											columnNumber: 19
										}, this), prefs.soundEnabled && /* @__PURE__ */ (void 0)(import_jsx_dev_runtime.Fragment, { children: [/* @__PURE__ */ (void 0)(Slider, {
											value: [prefs.volume * 100],
											min: 10,
											max: 100,
											step: 5,
											onValueChange: ([value]) => savePreferences({ volume: value / 100 })
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 493,
											columnNumber: 23
										}, this), /* @__PURE__ */ (void 0)(Button, {
											type: "button",
											variant: "outline",
											size: "sm",
											onClick: () => playPushNotificationChime(false, prefs.volume),
											className: "rounded-lg",
											children: [/* @__PURE__ */ (void 0)(Volume2, { className: "mr-1.5 h-4 w-4" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 507,
												columnNumber: 25
											}, this), " Thử âm thanh"]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 500,
											columnNumber: 23
										}, this)] }, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 492,
											columnNumber: 21
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 476,
										columnNumber: 17
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "flex flex-wrap justify-end gap-2 border-t pt-4",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
											variant: "outline",
											onClick: () => savePreferences({}, true),
											className: "rounded-xl",
											children: "Lưu cài đặt"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 514,
											columnNumber: 19
										}, this), capability.subscribed && /* @__PURE__ */ (void 0)(Button, {
											onClick: handleSync,
											disabled: busyAction !== null,
											className: "rounded-xl",
											children: [/* @__PURE__ */ (void 0)(CloudCog, { className: "mr-2 h-4 w-4" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 527,
												columnNumber: 23
											}, this), " Lưu và đồng bộ lịch"]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 522,
											columnNumber: 21
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 513,
										columnNumber: 17
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 439,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 438,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 257,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 256,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 238,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 237,
		columnNumber: 5
	}, this);
}
function StatusItem({ ok, label }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-xs",
		children: [ok ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleCheck, { className: "h-4 w-4 text-emerald-600" }, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 544,
			columnNumber: 9
		}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TriangleAlert, { className: "h-4 w-4 text-amber-600" }, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 546,
			columnNumber: 9
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
			className: "font-medium",
			children: label
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 548,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 542,
		columnNumber: 5
	}, this);
}
function Metric({ label, value, small = false }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "rounded-2xl border bg-white p-3 text-center shadow-xs",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
			className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
			children: label
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 564,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
			className: small ? "mt-1 text-xs font-semibold" : "mt-1 text-xl font-bold",
			children: value
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 567,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 563,
		columnNumber: 5
	}, this);
}
function AlertSection({ title, empty, children }) {
	const items = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
			className: "font-semibold",
			children: title
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 584,
			columnNumber: 7
		}, this), items.length > 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "space-y-2",
			children
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 586,
			columnNumber: 9
		}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground",
			children: empty
		}, void 0, false, {
			fileName: _jsxFileName,
			lineNumber: 588,
			columnNumber: 9
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 583,
		columnNumber: 5
	}, this);
}
//#endregion
export { NotificationCenterModal, NotificationCenterModal as PushNotificationCenterModal };
