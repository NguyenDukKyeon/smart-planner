import { r as __toESM } from "../_runtime.mjs";
import { d as todayISO } from "./date-utils-CFRHucsE.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { Ct as Bell, D as Play, E as Plus, H as Headphones, I as Minimize2, J as Flame, K as FolderInput, M as Moon, N as MonitorCog, O as Pencil, Q as ExternalLink, S as RotateCcw, St as BookOpenCheck, Tt as BellOff, V as History, W as Gift, X as FileSpreadsheet, Y as FileText, Z as FileBraces, _ as ShieldCheck, ct as Circle, d as Target, f as SunMedium, ft as ChevronDown, g as ShoppingBag, i as Volume2, it as CloudUpload, j as Palette, jt as ArchiveRestore, m as Sparkles, n as X, nt as Database, o as Trophy, pt as Check, rt as Coins, s as TriangleAlert, st as Clock3, tt as Download, u as TimerReset, ut as CircleCheck, v as Settings, wt as BellRing, xt as BookOpen } from "../_libs/lucide-react.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as require_jsx_dev_runtime } from "../_libs/react.mjs";
import { C as TabsTrigger, D as cn, L as savePushPreferences, M as getPushPreferences, P as normalizePushPreferences, S as TabsList, _ as PUSH_PREFERENCES_KEY, b as Tabs, c as DialogDescription, d as DialogTrigger, g as Label, h as Input, i as DEFAULT_PUSH_PREFERENCES, l as DialogHeader, n as Button, o as Dialog, s as DialogContent, u as DialogTitle, v as SUBJECTS, x as TabsContent, y as Slider } from "./planner-2Pf6y40b.mjs";
import { t as Switch } from "./switch-BV23iPOL.mjs";
import { r as usePwaInstall } from "./pwa-client-Bx7kHwFb.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { D as parseCSVInputWithDiagnostics, E as normalizeSubjects, H as restoreSnapshotFromKey, O as parseJSONInputWithDiagnostics, R as replaceRawValuesSafely, a as RESET_ROLLBACK_KEY, c as SAMPLE_JSON_CONTENT, g as downloadFile, h as convertRawToSubjects, k as readRawSnapshot, n as CUSTOM_SUBJECTS_BACKUP_KEY, o as SAMPLE_CSV_CONTENT, r as CUSTOM_SUBJECTS_KEY, t as ARCHIVED_CATALOG_KEY, v as factoryResetOwnedStorage, y as getArchivedCatalog } from "./custom-subjects-uE4AACuO.mjs";
import { A as getXpProgressInCurrentLevel, E as getLevelTitle, F as migrateProgressState, H as playStudyCompletionChime, I as normalizeFocusPreferences, K as saveFocusPreferences, L as normalizeStoredTimerState, M as loadProgressStorage, O as getStoredTimerState, a as DuotoneIcon, d as PROGRESS_STORAGE_KEY, f as TIMER_KEY, g as calculateElapsedSeconds, i as DEFAULT_FOCUS_PREFERENCES, j as loadFocusPreferences, n as CollapsibleContent, o as FOCUS_PREFERENCES_EVENT, p as TIMER_LOCK_KEY, r as CollapsibleTrigger, s as FOCUS_PREFERENCES_KEY, t as Collapsible, z as playBreakCompletionChime } from "./collapsible-D3R5XvsL.mjs";
import { n as RadioGroupIndicator, r as RadioGroupItem$1, t as RadioGroup$1 } from "../_libs/radix-ui__react-radio-group.mjs";
import { t as confetti_module_default } from "../_libs/canvas-confetti.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/TopBar-DR2qmuaJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_dev_runtime = require_jsx_dev_runtime();
var _jsxFileName$8 = "/app/applet/src/components/ui/radio-group.tsx";
var RadioGroup = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RadioGroup$1, {
		className: cn("grid gap-2", className),
		...props,
		ref
	}, void 0, false, {
		fileName: _jsxFileName$8,
		lineNumber: 11,
		columnNumber: 10
	}, void 0);
});
RadioGroup.displayName = RadioGroup$1.displayName;
var RadioGroupItem = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RadioGroupItem$1, {
		ref,
		className: cn("aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RadioGroupIndicator, {
			className: "flex items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Circle, { className: "h-3.5 w-3.5 fill-primary" }, void 0, false, {
				fileName: _jsxFileName$8,
				lineNumber: 29,
				columnNumber: 9
			}, void 0)
		}, void 0, false, {
			fileName: _jsxFileName$8,
			lineNumber: 28,
			columnNumber: 7
		}, void 0)
	}, void 0, false, {
		fileName: _jsxFileName$8,
		lineNumber: 20,
		columnNumber: 5
	}, void 0);
});
RadioGroupItem.displayName = RadioGroupItem$1.displayName;
var APP_BACKUP_FORMAT = "smart-study-planner-backup";
var APP_ROLLBACK_KEY = "hocvien-full-backup-before-import";
function createAppBackup(progress, subjects, timer) {
	return {
		format: APP_BACKUP_FORMAT,
		backupVersion: 1,
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		progress,
		subjects,
		timer,
		archivedCatalog: getArchivedCatalog(),
		focusPreferences: loadFocusPreferences(),
		pushPreferences: getPushPreferences()
	};
}
function parseAppBackup(raw) {
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return {
			ok: false,
			error: "File sao lưu không phải JSON hợp lệ."
		};
	}
	if (!parsed || typeof parsed !== "object") return {
		ok: false,
		error: "File sao lưu không có cấu trúc hợp lệ."
	};
	const candidate = parsed;
	if (candidate.format !== "smart-study-planner-backup") return {
		ok: false,
		error: "Đây không phải file sao lưu toàn bộ của ứng dụng."
	};
	if (candidate.backupVersion !== 1) return {
		ok: false,
		error: `Phiên bản file sao lưu ${String(candidate.backupVersion)} chưa được hỗ trợ.`
	};
	if (typeof candidate.exportedAt !== "string" || Number.isNaN(Date.parse(candidate.exportedAt))) return {
		ok: false,
		error: "File sao lưu thiếu thời điểm xuất hợp lệ."
	};
	if (!candidate.progress || typeof candidate.progress !== "object" || typeof candidate.progress.schemaVersion !== "number" || !candidate.progress.completedLessons || typeof candidate.progress.completedLessons !== "object" || !candidate.progress.habitLog || typeof candidate.progress.habitLog !== "object" || !candidate.progress.plannerSettings || typeof candidate.progress.plannerSettings !== "object" || !Array.isArray(candidate.progress.studySessions)) return {
		ok: false,
		error: "File sao lưu thiếu các trường tiến độ bắt buộc."
	};
	const progress = migrateProgressState(JSON.stringify(candidate.progress));
	if (!progress.ok) return {
		ok: false,
		error: `Tiến độ trong file không hợp lệ: ${progress.error}`
	};
	const subjects = normalizeSubjects(candidate.subjects);
	if (!subjects) return {
		ok: false,
		error: "Danh sách môn và bài trong file không hợp lệ."
	};
	const timer = candidate.timer == null ? null : normalizeStoredTimerState(candidate.timer);
	if (candidate.timer != null && !timer) return {
		ok: false,
		error: "Trạng thái Pomodoro trong file không hợp lệ."
	};
	const focusPreferences = candidate.focusPreferences == null ? { ...DEFAULT_FOCUS_PREFERENCES } : normalizeFocusPreferences(candidate.focusPreferences);
	if (!focusPreferences) return {
		ok: false,
		error: "Cài đặt Pomodoro trong file không hợp lệ."
	};
	const pushPreferences = candidate.pushPreferences == null ? { ...DEFAULT_PUSH_PREFERENCES } : normalizePushPreferences(candidate.pushPreferences);
	const rawArchive = candidate.archivedCatalog;
	const archivedCatalog = {
		subjects: normalizeSubjects(rawArchive?.subjects) ?? [],
		lessons: Array.isArray(rawArchive?.lessons) ? rawArchive.lessons : []
	};
	return {
		ok: true,
		backup: {
			format: APP_BACKUP_FORMAT,
			backupVersion: 1,
			exportedAt: candidate.exportedAt,
			progress: {
				...progress.state,
				onboardingComplete: true
			},
			subjects,
			timer,
			archivedCatalog,
			focusPreferences,
			pushPreferences
		}
	};
}
/** Whole-app imports are one deterministic transaction, including Pomodoro preferences. */
function restoreAppBackup(raw) {
	const result = parseAppBackup(raw);
	if (!result.ok) return result;
	const transaction = replaceRawValuesSafely(APP_ROLLBACK_KEY, [
		{
			key: PROGRESS_STORAGE_KEY,
			raw: JSON.stringify(result.backup.progress)
		},
		{
			key: CUSTOM_SUBJECTS_KEY,
			raw: JSON.stringify(result.backup.subjects)
		},
		{
			key: TIMER_KEY,
			raw: result.backup.timer ? JSON.stringify(result.backup.timer) : null
		},
		{
			key: TIMER_LOCK_KEY,
			raw: null
		},
		{
			key: ARCHIVED_CATALOG_KEY,
			raw: JSON.stringify(result.backup.archivedCatalog)
		},
		{
			key: FOCUS_PREFERENCES_KEY,
			raw: JSON.stringify(result.backup.focusPreferences)
		},
		{
			key: PUSH_PREFERENCES_KEY,
			raw: JSON.stringify(result.backup.pushPreferences)
		}
	]);
	if (transaction.ok) return result;
	return {
		ok: false,
		error: transaction.rollbackError ? `${transaction.error} Khôi phục tự động cũng thất bại: ${transaction.rollbackError}` : transaction.error
	};
}
/** The snapshot is retained after success, which makes a failed retry safe. */
function restoreLastImportRollback() {
	return restoreSnapshotFromKey(APP_ROLLBACK_KEY);
}
var _jsxFileName$7 = "/app/applet/src/components/CourseImportExportModal.tsx";
function flattenSubjects(subjects) {
	return subjects.flatMap((subject) => subject.milestones.flatMap((milestone) => milestone.lessons.map((lesson) => ({
		subjectId: subject.id,
		lessonId: lesson.id,
		subject: subject.name,
		topic: lesson.topic || (milestone.title !== "Toàn bộ bài học" ? milestone.title : void 0),
		title: lesson.title,
		estimatedMinutes: lesson.plannedDurationMinutes,
		scheduledDate: lesson.scheduledDate,
		xp: lesson.xp
	}))));
}
function toPortableRows(items) {
	return items.map((item) => ({
		subject_id: item.subjectId ?? "",
		subject_name: item.subject,
		topic: item.topic ?? "",
		lesson_id: item.lessonId ?? "",
		lesson_name: item.title,
		target_minutes: item.estimatedMinutes ?? 45,
		planned_date: item.scheduledDate,
		xp_reward: item.xp ?? 30
	}));
}
function toCsv(items) {
	const escape = (value) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
	const rows = toPortableRows(items);
	const headers = [
		"subject_id",
		"subject_name",
		"topic",
		"lesson_id",
		"lesson_name",
		"target_minutes",
		"planned_date",
		"xp_reward"
	];
	return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
}
function lessonIds(subjects) {
	return new Set(subjects.flatMap((subject) => subject.milestones.flatMap((milestone) => milestone.lessons.map((lesson) => lesson.id))));
}
function dedupeIncomingSubjects(subjects) {
	const seen = /* @__PURE__ */ new Set();
	let duplicateIds = 0;
	return {
		subjects: subjects.map((subject) => ({
			...subject,
			milestones: subject.milestones.map((milestone) => {
				const lessons = milestone.lessons.filter((lesson) => {
					if (seen.has(lesson.id)) {
						duplicateIds += 1;
						return false;
					}
					seen.add(lesson.id);
					return true;
				});
				return {
					...milestone,
					lessons,
					subtitle: `${lessons.length} bài học`
				};
			})
		})).filter((subject) => subject.milestones.some((milestone) => milestone.lessons.length > 0)),
		duplicateIds
	};
}
function mergeSubjects(current, incoming) {
	const result = structuredClone(current);
	for (const incomingSubject of incoming) {
		const subjectIndex = result.findIndex((subject) => subject.id === incomingSubject.id || subject.name.localeCompare(incomingSubject.name, "vi", { sensitivity: "base" }) === 0);
		if (subjectIndex === -1) {
			result.push(incomingSubject);
			continue;
		}
		const subject = result[subjectIndex];
		const allExistingIds = new Set(subject.milestones.flatMap((milestone) => milestone.lessons.map((lesson) => lesson.id)));
		for (const incomingMilestone of incomingSubject.milestones) {
			const milestoneIndex = subject.milestones.findIndex((milestone) => milestone.id === incomingMilestone.id || milestone.title.localeCompare(incomingMilestone.title, "vi", { sensitivity: "base" }) === 0);
			const freshLessons = incomingMilestone.lessons.filter((lesson) => !allExistingIds.has(lesson.id));
			if (freshLessons.length === 0) continue;
			if (milestoneIndex === -1) subject.milestones.push({
				...incomingMilestone,
				lessons: freshLessons
			});
			else subject.milestones[milestoneIndex] = {
				...subject.milestones[milestoneIndex],
				lessons: [...subject.milestones[milestoneIndex].lessons, ...freshLessons],
				subtitle: `${subject.milestones[milestoneIndex].lessons.length + freshLessons.length} bài học`
			};
			freshLessons.forEach((lesson) => allExistingIds.add(lesson.id));
		}
		result[subjectIndex] = {
			...subject,
			milestones: [...subject.milestones]
		};
	}
	return result;
}
function CourseImportExportModal({ currentSubjects, onSubjectsUpdated, progress }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [tab, setTab] = (0, import_react.useState)("available");
	const [preview, setPreview] = (0, import_react.useState)([]);
	const [importIssues, setImportIssues] = (0, import_react.useState)([]);
	const [sourceName, setSourceName] = (0, import_react.useState)("");
	const [importMode, setImportMode] = (0, import_react.useState)("merge");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [confirmOpen, setConfirmOpen] = (0, import_react.useState)(false);
	const [backupRaw, setBackupRaw] = (0, import_react.useState)(null);
	const fileInputRef = (0, import_react.useRef)(null);
	const incomingCatalog = (0, import_react.useMemo)(() => dedupeIncomingSubjects(convertRawToSubjects(preview)), [preview]);
	const incomingSubjects = incomingCatalog.subjects;
	const previewStats = (0, import_react.useMemo)(() => {
		const currentIds = lessonIds(currentSubjects);
		const incomingLessons = incomingSubjects.flatMap((subject) => subject.milestones.flatMap((milestone) => milestone.lessons));
		return {
			subjects: incomingSubjects.filter((subject) => subject.milestones.some((milestone) => milestone.lessons.length > 0)).length,
			lessons: incomingLessons.length,
			duplicates: incomingCatalog.duplicateIds + incomingLessons.filter((lesson) => currentIds.has(lesson.id)).length,
			invalid: importIssues.length
		};
	}, [
		currentSubjects,
		importIssues.length,
		incomingCatalog.duplicateIds,
		incomingSubjects
	]);
	const readRoadmapFile = async (file) => {
		setBusy(true);
		try {
			const lower = file.name.toLowerCase();
			const parsed = lower.endsWith(".xlsx") || lower.endsWith(".xls") ? (await import("./excel-import-export-DNI5YUpM.mjs")).parseExcelBufferWithDiagnostics(await file.arrayBuffer()) : lower.endsWith(".json") ? parseJSONInputWithDiagnostics(await file.text()) : parseCSVInputWithDiagnostics(await file.text());
			if (parsed.items.length === 0) {
				const firstIssue = parsed.issues[0]?.message;
				toast.error(firstIssue || "Không tìm thấy bài học hợp lệ. Hãy kiểm tra cấu trúc file mẫu.");
				setImportIssues(parsed.issues);
				return;
			}
			setPreview(parsed.items);
			setImportIssues(parsed.issues);
			setSourceName(file.name);
			setTab("import");
			toast.success(parsed.issues.length ? `Đã đọc ${parsed.items.length} bài hợp lệ; phát hiện ${parsed.issues.length} lỗi cần xem lại.` : `Đã đọc ${parsed.items.length} bài học từ ${file.name}.`);
		} catch {
			toast.error("Không thể đọc file. Hãy thử lại bằng Excel, CSV hoặc JSON hợp lệ.");
		} finally {
			setBusy(false);
		}
	};
	const executeImport = () => {
		if (incomingSubjects.length === 0) return;
		const next = importMode === "merge" ? mergeSubjects(currentSubjects, incomingSubjects) : incomingSubjects;
		const transaction = replaceRawValuesSafely(CUSTOM_SUBJECTS_BACKUP_KEY, [{
			key: CUSTOM_SUBJECTS_KEY,
			raw: JSON.stringify(next)
		}]);
		if (!transaction.ok) {
			toast.error(transaction.rollbackError ? `${transaction.error} ${transaction.rollbackError}` : transaction.error);
			return;
		}
		onSubjectsUpdated(next);
		const added = Math.max(0, lessonIds(next).size - lessonIds(currentSubjects).size);
		toast.success(importMode === "merge" ? `Đã gộp ${added} bài mới vào lộ trình.` : `Đã thay thế lộ trình bằng ${previewStats.lessons} bài.`);
		setConfirmOpen(false);
		setPreview([]);
		setImportIssues([]);
		setSourceName("");
	};
	const applyGrade11 = (mode) => {
		if (currentSubjects.length > 0) {
			const action = mode === "merge" ? "gộp lộ trình lớp 11 vào dữ liệu hiện tại" : "thay thế toàn bộ lộ trình hiện tại bằng lộ trình lớp 11";
			if (!window.confirm(`Bạn có chắc muốn ${action}? Một snapshot hoàn tác sẽ được tạo trước.`)) return;
		}
		const next = mode === "merge" ? mergeSubjects(currentSubjects, SUBJECTS) : SUBJECTS;
		const transaction = replaceRawValuesSafely(CUSTOM_SUBJECTS_BACKUP_KEY, [{
			key: CUSTOM_SUBJECTS_KEY,
			raw: JSON.stringify(next)
		}]);
		if (!transaction.ok) {
			toast.error(transaction.error);
			return;
		}
		onSubjectsUpdated(next);
		toast.success(mode === "merge" ? "Đã gộp lộ trình lớp 11." : "Đã dùng lộ trình mẫu lớp 11.");
	};
	const downloadGrade11 = async (format) => {
		const items = flattenSubjects(SUBJECTS);
		if (format === "xlsx") {
			const { downloadFullGrade11Excel } = await import("./excel-import-export-DNI5YUpM.mjs");
			downloadFullGrade11Excel();
		} else if (format === "csv") downloadFile("lo_trinh_mau_lop_11_KNTT.csv", toCsv(items), "text/csv;charset=utf-8");
		else downloadFile("lo_trinh_mau_lop_11_KNTT.json", JSON.stringify(toPortableRows(items), null, 2), "application/json");
	};
	const downloadSimpleTemplate = async (format) => {
		if (format === "xlsx") {
			const { downloadSampleExcel } = await import("./excel-import-export-DNI5YUpM.mjs");
			downloadSampleExcel();
		} else if (format === "csv") downloadFile("mau_import_lo_trinh_don_gian.csv", SAMPLE_CSV_CONTENT, "text/csv;charset=utf-8");
		else downloadFile("mau_import_lo_trinh_don_gian.json", SAMPLE_JSON_CONTENT, "application/json");
	};
	const exportCurrent = (format) => {
		const items = flattenSubjects(currentSubjects);
		if (format === "csv") downloadFile("lo_trinh_hien_tai.csv", toCsv(items), "text/csv;charset=utf-8");
		else downloadFile("lo_trinh_hien_tai.json", JSON.stringify(toPortableRows(items), null, 2), "application/json");
	};
	const exportWholeApp = () => {
		const backup = createAppBackup(progress, currentSubjects, getStoredTimerState());
		const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		downloadFile(`smart-planner-backup-${stamp}.json`, JSON.stringify(backup, null, 2), "application/json");
	};
	const restoreWholeApp = () => {
		if (!backupRaw) return;
		const restored = restoreAppBackup(backupRaw);
		if (!restored.ok) {
			toast.error(restored.error);
			return;
		}
		toast.success("Đã khôi phục bản sao lưu. Ứng dụng sẽ tải lại.");
		window.setTimeout(() => window.location.reload(), 350);
	};
	const undoLastChange = () => {
		const result = restoreSnapshotFromKey(CUSTOM_SUBJECTS_BACKUP_KEY);
		if (!result.ok) toast.error(result.error);
		else {
			toast.success("Đã khôi phục lộ trình trước thay đổi gần nhất.");
			window.setTimeout(() => window.location.reload(), 350);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
					id: "roadmap-data-trigger-button",
					variant: "outline",
					size: "sm",
					className: "h-9 gap-1.5 rounded-2xl border-sky-200 bg-sky-50/70 text-xs font-semibold text-sky-800",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Database, { className: "h-4 w-4" }, void 0, false, {
						fileName: _jsxFileName$7,
						lineNumber: 348,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "hidden sm:inline",
						children: "Lộ trình & dữ liệu"
					}, void 0, false, {
						fileName: _jsxFileName$7,
						lineNumber: 349,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$7,
					lineNumber: 342,
					columnNumber: 9
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$7,
				lineNumber: 341,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent, {
				className: "h-[92vh] w-[96vw] max-w-5xl overflow-hidden rounded-3xl p-0 grid-rows-[auto_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogHeader, {
					className: "border-b bg-white px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle, {
						className: "flex items-center gap-2 font-serif text-xl",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Database, { className: "h-5 w-5 text-sky-700" }, void 0, false, {
							fileName: _jsxFileName$7,
							lineNumber: 355,
							columnNumber: 13
						}, this), " Lộ trình & dữ liệu"]
					}, void 0, true, {
						fileName: _jsxFileName$7,
						lineNumber: 354,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogDescription, { children: "Dùng lộ trình có sẵn, nhập lộ trình riêng hoặc quản lý sao lưu. File mẫu import được tách khỏi lộ trình lớp 11." }, void 0, false, {
						fileName: _jsxFileName$7,
						lineNumber: 357,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$7,
					lineNumber: 353,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Tabs, {
					value: tab,
					onValueChange: setTab,
					className: "flex min-h-0 flex-1 flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsList, {
						className: "mx-4 mt-3 grid grid-cols-3 rounded-2xl bg-slate-100 p-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsTrigger, {
								value: "available",
								className: "rounded-xl text-xs",
								children: "Lộ trình có sẵn"
							}, void 0, false, {
								fileName: _jsxFileName$7,
								lineNumber: 364,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsTrigger, {
								value: "import",
								className: "rounded-xl text-xs",
								children: "Nhập lộ trình"
							}, void 0, false, {
								fileName: _jsxFileName$7,
								lineNumber: 365,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsTrigger, {
								value: "backup",
								className: "rounded-xl text-xs",
								children: "Xuất & sao lưu"
							}, void 0, false, {
								fileName: _jsxFileName$7,
								lineNumber: 366,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$7,
						lineNumber: 363,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "min-h-0 flex-1 overflow-y-auto p-4 sm:p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsContent, {
								value: "available",
								className: "m-0 space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
									className: "rounded-3xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/70 p-5 shadow-xs",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "flex flex-col gap-4 sm:flex-row sm:items-start",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
											className: "grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-2xl",
											children: "📚"
										}, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 373,
											columnNumber: 19
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "min-w-0 flex-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
													className: "flex flex-wrap items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
														className: "font-serif text-xl font-semibold text-slate-900",
														children: "Lộ trình mẫu lớp 11 KNTT"
													}, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 376,
														columnNumber: 23
													}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
														className: "rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-800",
														children: "Khuyên dùng"
													}, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 377,
														columnNumber: 23
													}, this)]
												}, void 0, true, {
													fileName: _jsxFileName$7,
													lineNumber: 375,
													columnNumber: 21
												}, this),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
													className: "mt-2 text-sm text-slate-600",
													children: "Toán 11 · Vật lý 11 · Hóa học 11, đầy đủ chương/chủ đề và bài học. Có thể chỉnh sửa sau khi áp dụng."
												}, void 0, false, {
													fileName: _jsxFileName$7,
													lineNumber: 379,
													columnNumber: 21
												}, this),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
													className: "mt-4 flex flex-wrap gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
														type: "button",
														className: "rounded-2xl bg-emerald-600 hover:bg-emerald-700",
														onClick: () => applyGrade11(currentSubjects.length ? "merge" : "replace"),
														children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BookOpenCheck, { className: "h-4 w-4" }, void 0, false, {
															fileName: _jsxFileName$7,
															lineNumber: 384,
															columnNumber: 25
														}, this), " Dùng lộ trình mẫu lớp 11"]
													}, void 0, true, {
														fileName: _jsxFileName$7,
														lineNumber: 383,
														columnNumber: 23
													}, this), currentSubjects.length > 0 && /* @__PURE__ */ (void 0)(Button, {
														type: "button",
														variant: "outline",
														className: "rounded-2xl",
														onClick: () => applyGrade11("replace"),
														children: "Thay thế lộ trình hiện tại"
													}, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 387,
														columnNumber: 25
													}, this)]
												}, void 0, true, {
													fileName: _jsxFileName$7,
													lineNumber: 382,
													columnNumber: 21
												}, this)
											]
										}, void 0, true, {
											fileName: _jsxFileName$7,
											lineNumber: 374,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 372,
										columnNumber: 17
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "mt-5 border-t border-emerald-100 pt-4",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
											className: "mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500",
											children: "Tải toàn bộ lộ trình"
										}, void 0, false, {
											fileName: _jsxFileName$7,
											lineNumber: 395,
											columnNumber: 19
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "flex flex-wrap gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FormatButton, {
													icon: FileSpreadsheet,
													label: "Excel",
													onClick: () => void downloadGrade11("xlsx")
												}, void 0, false, {
													fileName: _jsxFileName$7,
													lineNumber: 397,
													columnNumber: 21
												}, this),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FormatButton, {
													icon: FileText,
													label: "CSV",
													onClick: () => void downloadGrade11("csv")
												}, void 0, false, {
													fileName: _jsxFileName$7,
													lineNumber: 398,
													columnNumber: 21
												}, this),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FormatButton, {
													icon: FileBraces,
													label: "JSON",
													onClick: () => void downloadGrade11("json")
												}, void 0, false, {
													fileName: _jsxFileName$7,
													lineNumber: 399,
													columnNumber: 21
												}, this)
											]
										}, void 0, true, {
											fileName: _jsxFileName$7,
											lineNumber: 396,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 394,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$7,
									lineNumber: 371,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
									className: "rounded-3xl border bg-white p-5 shadow-xs",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
										className: "font-semibold text-slate-900",
										children: "Xem trước nội dung"
									}, void 0, false, {
										fileName: _jsxFileName$7,
										lineNumber: 405,
										columnNumber: 17
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "mt-3 grid gap-2 sm:grid-cols-3",
										children: SUBJECTS.map((subject) => {
											const count = subject.milestones.reduce((sum, milestone) => sum + milestone.lessons.length, 0);
											return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
												className: "rounded-2xl border bg-slate-50 p-3",
												children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
													className: "font-semibold text-slate-900",
													children: [
														subject.emoji,
														" ",
														subject.name
													]
												}, void 0, true, {
													fileName: _jsxFileName$7,
													lineNumber: 411,
													columnNumber: 25
												}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
													className: "text-xs text-slate-500",
													children: [
														subject.milestones.length,
														" chủ đề · ",
														count,
														" bài"
													]
												}, void 0, true, {
													fileName: _jsxFileName$7,
													lineNumber: 412,
													columnNumber: 25
												}, this)]
											}, subject.id, true, {
												fileName: _jsxFileName$7,
												lineNumber: 410,
												columnNumber: 23
											}, this);
										})
									}, void 0, false, {
										fileName: _jsxFileName$7,
										lineNumber: 406,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$7,
									lineNumber: 404,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$7,
								lineNumber: 370,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsContent, {
								value: "import",
								className: "m-0 space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
										className: cn("rounded-3xl border-2 border-dashed p-7 text-center transition", busy ? "border-slate-200 bg-slate-50" : "border-sky-200 bg-sky-50/50 hover:border-sky-400"),
										onDragOver: (event) => event.preventDefault(),
										onDrop: (event) => {
											event.preventDefault();
											const file = event.dataTransfer.files[0];
											if (file) readRoadmapFile(file);
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CloudUpload, { className: "mx-auto h-10 w-10 text-sky-600" }, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 433,
												columnNumber: 17
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
												className: "mt-3 font-serif text-xl font-semibold text-slate-900",
												children: "Nhập lộ trình của bạn"
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 434,
												columnNumber: 17
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
												className: "mt-1 text-sm text-slate-500",
												children: "Kéo file vào đây hoặc chọn file từ máy."
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 435,
												columnNumber: 17
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
												className: "mt-1 text-xs font-medium text-sky-700",
												children: "Hỗ trợ .xlsx, .csv và .json"
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 436,
												columnNumber: 17
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
												ref: fileInputRef,
												type: "file",
												accept: ".xlsx,.xls,.csv,.json",
												className: "sr-only",
												onChange: (event) => {
													const file = event.target.files?.[0];
													if (file) readRoadmapFile(file);
													event.currentTarget.value = "";
												}
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 437,
												columnNumber: 17
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
												type: "button",
												className: "mt-4 rounded-2xl",
												disabled: busy,
												onClick: () => fileInputRef.current?.click(),
												children: [
													/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FolderInput, { className: "h-4 w-4" }, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 449,
														columnNumber: 19
													}, this),
													" ",
													busy ? "Đang đọc file…" : "Chọn file từ máy"
												]
											}, void 0, true, {
												fileName: _jsxFileName$7,
												lineNumber: 448,
												columnNumber: 17
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 421,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
										className: "rounded-3xl border bg-white p-5 shadow-xs",
										children: [
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
												className: "font-semibold text-slate-900",
												children: "Chưa có file?"
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 454,
												columnNumber: 17
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
												className: "mt-1 text-sm text-slate-500",
												children: "Tải file mẫu import đơn giản. Excel có cùng dữ liệu minh họa như CSV và JSON, không chứa toàn bộ chương trình lớp 11."
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 455,
												columnNumber: 17
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
												className: "mt-3 flex flex-wrap gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FormatButton, {
														icon: FileSpreadsheet,
														label: "Mẫu Excel",
														onClick: () => void downloadSimpleTemplate("xlsx")
													}, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 459,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FormatButton, {
														icon: FileText,
														label: "Mẫu CSV",
														onClick: () => void downloadSimpleTemplate("csv")
													}, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 460,
														columnNumber: 19
													}, this),
													/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FormatButton, {
														icon: FileBraces,
														label: "Mẫu JSON",
														onClick: () => void downloadSimpleTemplate("json")
													}, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 461,
														columnNumber: 19
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName$7,
												lineNumber: 458,
												columnNumber: 17
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 453,
										columnNumber: 15
									}, this),
									preview.length > 0 && /* @__PURE__ */ (void 0)("section", {
										className: "rounded-3xl border border-indigo-200 bg-indigo-50/40 p-5",
										children: [
											/* @__PURE__ */ (void 0)("div", {
												className: "flex flex-wrap items-start justify-between gap-3",
												children: [/* @__PURE__ */ (void 0)("div", { children: [/* @__PURE__ */ (void 0)("h3", {
													className: "font-semibold text-indigo-950",
													children: ["Preview: ", sourceName]
												}, void 0, true, {
													fileName: _jsxFileName$7,
													lineNumber: 469,
													columnNumber: 23
												}, this), /* @__PURE__ */ (void 0)("p", {
													className: "text-xs text-indigo-700",
													children: "Chưa có dữ liệu nào được áp dụng."
												}, void 0, false, {
													fileName: _jsxFileName$7,
													lineNumber: 470,
													columnNumber: 23
												}, this)] }, void 0, true, {
													fileName: _jsxFileName$7,
													lineNumber: 468,
													columnNumber: 21
												}, this), /* @__PURE__ */ (void 0)("div", {
													className: "flex flex-wrap gap-2 text-xs",
													children: [
														/* @__PURE__ */ (void 0)(Stat, {
															label: "Môn",
															value: previewStats.subjects
														}, void 0, false, {
															fileName: _jsxFileName$7,
															lineNumber: 473,
															columnNumber: 23
														}, this),
														/* @__PURE__ */ (void 0)(Stat, {
															label: "Bài hợp lệ",
															value: previewStats.lessons
														}, void 0, false, {
															fileName: _jsxFileName$7,
															lineNumber: 474,
															columnNumber: 23
														}, this),
														/* @__PURE__ */ (void 0)(Stat, {
															label: "ID trùng",
															value: previewStats.duplicates
														}, void 0, false, {
															fileName: _jsxFileName$7,
															lineNumber: 475,
															columnNumber: 23
														}, this),
														/* @__PURE__ */ (void 0)(Stat, {
															label: "Dòng lỗi",
															value: previewStats.invalid
														}, void 0, false, {
															fileName: _jsxFileName$7,
															lineNumber: 476,
															columnNumber: 23
														}, this)
													]
												}, void 0, true, {
													fileName: _jsxFileName$7,
													lineNumber: 472,
													columnNumber: 21
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName$7,
												lineNumber: 467,
												columnNumber: 19
											}, this),
											/* @__PURE__ */ (void 0)("div", {
												className: "mt-4 overflow-hidden rounded-2xl border bg-white",
												children: [/* @__PURE__ */ (void 0)("div", {
													className: "max-h-64 overflow-auto",
													children: preview.slice(0, 10).map((item, index) => /* @__PURE__ */ (void 0)("div", {
														className: "grid gap-1 border-b px-3 py-2 text-xs last:border-b-0 sm:grid-cols-[120px_1fr_90px]",
														children: [
															/* @__PURE__ */ (void 0)("span", {
																className: "font-semibold text-slate-700",
																children: item.subject
															}, void 0, false, {
																fileName: _jsxFileName$7,
																lineNumber: 484,
																columnNumber: 27
															}, this),
															/* @__PURE__ */ (void 0)("span", {
																className: "min-w-0",
																children: [/* @__PURE__ */ (void 0)("strong", { children: item.title }, void 0, false, {
																	fileName: _jsxFileName$7,
																	lineNumber: 485,
																	columnNumber: 53
																}, this), item.topic ? /* @__PURE__ */ (void 0)("span", {
																	className: "block text-slate-500",
																	children: item.topic
																}, void 0, false, {
																	fileName: _jsxFileName$7,
																	lineNumber: 485,
																	columnNumber: 96
																}, this) : null]
															}, void 0, true, {
																fileName: _jsxFileName$7,
																lineNumber: 485,
																columnNumber: 27
															}, this),
															/* @__PURE__ */ (void 0)("span", {
																className: "text-slate-500",
																children: [item.estimatedMinutes ?? 45, " phút"]
															}, void 0, true, {
																fileName: _jsxFileName$7,
																lineNumber: 486,
																columnNumber: 27
															}, this)
														]
													}, `${item.subject}-${item.title}-${index}`, true, {
														fileName: _jsxFileName$7,
														lineNumber: 483,
														columnNumber: 25
													}, this))
												}, void 0, false, {
													fileName: _jsxFileName$7,
													lineNumber: 481,
													columnNumber: 21
												}, this), preview.length > 10 && /* @__PURE__ */ (void 0)("p", {
													className: "border-t px-3 py-2 text-xs text-slate-500",
													children: [
														"Còn ",
														preview.length - 10,
														" bài khác."
													]
												}, void 0, true, {
													fileName: _jsxFileName$7,
													lineNumber: 490,
													columnNumber: 45
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName$7,
												lineNumber: 480,
												columnNumber: 19
											}, this),
											importIssues.length > 0 && /* @__PURE__ */ (void 0)("div", {
												className: "mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3",
												children: [
													/* @__PURE__ */ (void 0)("p", {
														className: "text-xs font-semibold text-amber-950",
														children: "Các dòng cần kiểm tra"
													}, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 495,
														columnNumber: 23
													}, this),
													/* @__PURE__ */ (void 0)("ul", {
														className: "mt-2 max-h-36 space-y-1 overflow-y-auto text-xs text-amber-900",
														children: importIssues.slice(0, 20).map((issue, index) => /* @__PURE__ */ (void 0)("li", { children: [
															"Dòng ",
															issue.row,
															": ",
															issue.message
														] }, `${issue.row}-${index}`, true, {
															fileName: _jsxFileName$7,
															lineNumber: 498,
															columnNumber: 27
														}, this))
													}, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 496,
														columnNumber: 23
													}, this),
													importIssues.length > 20 && /* @__PURE__ */ (void 0)("p", {
														className: "mt-2 text-xs text-amber-800",
														children: [
															"Còn ",
															importIssues.length - 20,
															" lỗi khác."
														]
													}, void 0, true, {
														fileName: _jsxFileName$7,
														lineNumber: 501,
														columnNumber: 52
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName$7,
												lineNumber: 494,
												columnNumber: 21
											}, this),
											/* @__PURE__ */ (void 0)(RadioGroup, {
												value: importMode,
												onValueChange: (value) => setImportMode(value),
												className: "mt-4 grid gap-2 sm:grid-cols-2",
												children: [/* @__PURE__ */ (void 0)(ImportModeCard, {
													value: "merge",
													title: "Gộp với lộ trình hiện tại",
													description: "Giữ dữ liệu hiện có, bỏ qua bài trùng ID. Khuyến nghị."
												}, void 0, false, {
													fileName: _jsxFileName$7,
													lineNumber: 506,
													columnNumber: 21
												}, this), /* @__PURE__ */ (void 0)(ImportModeCard, {
													value: "replace",
													title: "Thay thế lộ trình hiện tại",
													description: "Tạo snapshot rồi thay toàn bộ danh mục môn và bài."
												}, void 0, false, {
													fileName: _jsxFileName$7,
													lineNumber: 507,
													columnNumber: 21
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName$7,
												lineNumber: 505,
												columnNumber: 19
											}, this),
											/* @__PURE__ */ (void 0)(Button, {
												type: "button",
												className: "mt-4 w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700",
												onClick: () => setConfirmOpen(true),
												children: [/* @__PURE__ */ (void 0)(CircleCheck, { className: "h-4 w-4" }, void 0, false, {
													fileName: _jsxFileName$7,
													lineNumber: 511,
													columnNumber: 21
												}, this), importMode === "merge" ? `Gộp ${Math.max(0, previewStats.lessons - previewStats.duplicates)} bài vào lộ trình` : `Thay thế bằng ${previewStats.lessons} bài mới`]
											}, void 0, true, {
												fileName: _jsxFileName$7,
												lineNumber: 510,
												columnNumber: 19
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 466,
										columnNumber: 17
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$7,
								lineNumber: 420,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsContent, {
								value: "backup",
								className: "m-0 space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
										className: "rounded-3xl border bg-white p-5 shadow-xs",
										children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "flex items-start gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Download, { className: "mt-1 h-5 w-5 text-sky-700" }, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 523,
												columnNumber: 19
											}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
												className: "min-w-0 flex-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
														className: "font-semibold text-slate-900",
														children: "Xuất lộ trình hiện tại"
													}, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 525,
														columnNumber: 21
													}, this),
													/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
														className: "mt-1 text-sm text-slate-500",
														children: "Chỉ xuất môn, chủ đề và bài học; không gồm tiến độ hoặc Timer."
													}, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 526,
														columnNumber: 21
													}, this),
													/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
														className: "mt-3 flex flex-wrap gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FormatButton, {
															icon: FileText,
															label: "Xuất CSV",
															onClick: () => exportCurrent("csv")
														}, void 0, false, {
															fileName: _jsxFileName$7,
															lineNumber: 528,
															columnNumber: 23
														}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(FormatButton, {
															icon: FileBraces,
															label: "Xuất JSON",
															onClick: () => exportCurrent("json")
														}, void 0, false, {
															fileName: _jsxFileName$7,
															lineNumber: 529,
															columnNumber: 23
														}, this)]
													}, void 0, true, {
														fileName: _jsxFileName$7,
														lineNumber: 527,
														columnNumber: 21
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName$7,
												lineNumber: 524,
												columnNumber: 19
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName$7,
											lineNumber: 522,
											columnNumber: 17
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName$7,
										lineNumber: 521,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
										className: "rounded-3xl border bg-white p-5 shadow-xs",
										children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "flex items-start gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ShieldCheck, { className: "mt-1 h-5 w-5 text-emerald-700" }, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 537,
												columnNumber: 19
											}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
												className: "min-w-0 flex-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
														className: "font-semibold text-slate-900",
														children: "Sao lưu toàn bộ ứng dụng"
													}, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 539,
														columnNumber: 21
													}, this),
													/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
														className: "mt-1 text-sm text-slate-500",
														children: "Bao gồm tiến độ, lộ trình, lịch sử, kho lưu trữ, trạng thái Timer và cài đặt Pomodoro."
													}, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 540,
														columnNumber: 21
													}, this),
													/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
														type: "button",
														className: "mt-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700",
														onClick: exportWholeApp,
														children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Download, { className: "h-4 w-4" }, void 0, false, {
															fileName: _jsxFileName$7,
															lineNumber: 542,
															columnNumber: 23
														}, this), " Tải bản sao lưu"]
													}, void 0, true, {
														fileName: _jsxFileName$7,
														lineNumber: 541,
														columnNumber: 21
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName$7,
												lineNumber: 538,
												columnNumber: 19
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName$7,
											lineNumber: 536,
											columnNumber: 17
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName$7,
										lineNumber: 535,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
										className: "rounded-3xl border border-amber-200 bg-amber-50/60 p-5",
										children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "flex items-start gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ArchiveRestore, { className: "mt-1 h-5 w-5 text-amber-700" }, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 550,
												columnNumber: 19
											}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
												className: "min-w-0 flex-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
														className: "font-semibold text-amber-950",
														children: "Khôi phục từ bản sao lưu"
													}, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 552,
														columnNumber: 21
													}, this),
													/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
														className: "mt-1 text-sm text-amber-800",
														children: "Ứng dụng tạo snapshot trước khi ghi đè dữ liệu."
													}, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 553,
														columnNumber: 21
													}, this),
													/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
														type: "file",
														accept: "application/json,.json",
														className: "mt-3 block w-full text-sm",
														onChange: async (event) => {
															const file = event.target.files?.[0];
															if (file) setBackupRaw(await file.text());
														}
													}, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 554,
														columnNumber: 21
													}, this),
													/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
														type: "button",
														className: "mt-3 rounded-2xl",
														disabled: !backupRaw,
														onClick: restoreWholeApp,
														children: "Khôi phục bản sao lưu"
													}, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 563,
														columnNumber: 21
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName$7,
												lineNumber: 551,
												columnNumber: 19
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName$7,
											lineNumber: 549,
											columnNumber: 17
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName$7,
										lineNumber: 548,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
										className: "rounded-3xl border border-slate-200 bg-slate-50 p-5",
										children: [
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
												className: "font-semibold text-slate-900",
												children: "Hoàn tác an toàn"
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 571,
												columnNumber: 17
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
												className: "mt-1 text-sm text-slate-500",
												children: "Thử khôi phục trạng thái trước lần import hoặc thay lộ trình gần nhất."
											}, void 0, false, {
												fileName: _jsxFileName$7,
												lineNumber: 572,
												columnNumber: 17
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
												className: "mt-3 flex flex-wrap gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
													type: "button",
													variant: "outline",
													className: "rounded-xl",
													onClick: undoLastChange,
													children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RotateCcw, { className: "h-4 w-4" }, void 0, false, {
														fileName: _jsxFileName$7,
														lineNumber: 575,
														columnNumber: 21
													}, this), " Hoàn tác lộ trình"]
												}, void 0, true, {
													fileName: _jsxFileName$7,
													lineNumber: 574,
													columnNumber: 19
												}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
													type: "button",
													variant: "outline",
													className: "rounded-xl",
													onClick: () => {
														const result = restoreLastImportRollback();
														if (!result.ok) toast.error(result.error);
														else window.location.reload();
													},
													children: "Hoàn tác khôi phục toàn ứng dụng"
												}, void 0, false, {
													fileName: _jsxFileName$7,
													lineNumber: 577,
													columnNumber: 19
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName$7,
												lineNumber: 573,
												columnNumber: 17
											}, this)
										]
									}, void 0, true, {
										fileName: _jsxFileName$7,
										lineNumber: 570,
										columnNumber: 15
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$7,
								lineNumber: 520,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$7,
						lineNumber: 369,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$7,
					lineNumber: 362,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$7,
				lineNumber: 352,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Dialog, {
				open: confirmOpen,
				onOpenChange: setConfirmOpen,
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent, {
					className: "max-w-md rounded-3xl",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle, { children: importMode === "merge" ? "Gộp lộ trình?" : "Thay thế lộ trình?" }, void 0, false, {
						fileName: _jsxFileName$7,
						lineNumber: 599,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogDescription, { children: importMode === "merge" ? `${Math.max(0, previewStats.lessons - previewStats.duplicates)} bài mới sẽ được thêm; ${previewStats.duplicates} bài trùng ID được bỏ qua.` : `${currentSubjects.length} môn hiện tại sẽ được thay bằng ${previewStats.subjects} môn và ${previewStats.lessons} bài. Snapshot rollback sẽ được tạo trước.` }, void 0, false, {
						fileName: _jsxFileName$7,
						lineNumber: 600,
						columnNumber: 13
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$7,
						lineNumber: 598,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => setConfirmOpen(false),
							children: "Hủy"
						}, void 0, false, {
							fileName: _jsxFileName$7,
							lineNumber: 607,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
							type: "button",
							className: "rounded-xl",
							onClick: executeImport,
							children: importMode === "merge" ? "Gộp vào lộ trình" : "Thay thế lộ trình"
						}, void 0, false, {
							fileName: _jsxFileName$7,
							lineNumber: 608,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$7,
						lineNumber: 606,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$7,
					lineNumber: 597,
					columnNumber: 9
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$7,
				lineNumber: 596,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$7,
		lineNumber: 340,
		columnNumber: 5
	}, this);
}
function FormatButton({ icon: Icon, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
		type: "button",
		variant: "outline",
		size: "sm",
		className: "rounded-xl",
		onClick,
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Icon, { className: "h-4 w-4" }, void 0, false, {
				fileName: _jsxFileName$7,
				lineNumber: 621,
				columnNumber: 7
			}, this),
			" ",
			label
		]
	}, void 0, true, {
		fileName: _jsxFileName$7,
		lineNumber: 620,
		columnNumber: 5
	}, this);
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
		className: "rounded-full border bg-white px-2.5 py-1 font-semibold text-slate-700",
		children: [
			label,
			": ",
			value
		]
	}, void 0, true, {
		fileName: _jsxFileName$7,
		lineNumber: 627,
		columnNumber: 10
	}, this);
}
function ImportModeCard({ value, title, description }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
		htmlFor: `import-${value}`,
		className: "flex cursor-pointer items-start gap-3 rounded-2xl border bg-white p-3",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RadioGroupItem, {
			id: `import-${value}`,
			value,
			className: "mt-0.5"
		}, void 0, false, {
			fileName: _jsxFileName$7,
			lineNumber: 633,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
			className: "block text-sm font-semibold text-slate-900",
			children: title
		}, void 0, false, {
			fileName: _jsxFileName$7,
			lineNumber: 635,
			columnNumber: 9
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
			className: "block text-xs leading-relaxed text-slate-500",
			children: description
		}, void 0, false, {
			fileName: _jsxFileName$7,
			lineNumber: 636,
			columnNumber: 9
		}, this)] }, void 0, true, {
			fileName: _jsxFileName$7,
			lineNumber: 634,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$7,
		lineNumber: 632,
		columnNumber: 5
	}, this);
}
var _jsxFileName$6 = "/app/applet/src/components/RemindersCard.tsx";
function isDone(habit, entry, dateISO = todayISO()) {
	const value = entry[habit.id];
	const day = (/* @__PURE__ */ new Date(`${dateISO}T12:00:00`)).getDay();
	const target = habit.dailyTargets[(day + 6) % 7] ?? habit.target;
	if (target <= 0) return true;
	if (habit.kind === "counter") return typeof value === "number" && value >= target;
	return value === true;
}
function RemindersCard({ reminders, today, onSet, definitions, onOpenPushCenter, onboardingComplete }) {
	const habits = definitions.filter((habit) => !habit.archived);
	const [storedOnboardingComplete] = (0, import_react.useState)(() => {
		const stored = loadProgressStorage();
		return stored.status === "ok" && stored.value.onboardingComplete === true;
	});
	const automaticRemindersAllowed = onboardingComplete ?? storedOnboardingComplete;
	const [permission, setPermission] = (0, import_react.useState)(typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported");
	const [pushPreferences, setPushPreferences] = (0, import_react.useState)(() => getPushPreferences());
	const [habitOpen, setHabitOpen] = (0, import_react.useState)(false);
	const firedRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const updatePush = (patch) => {
		const next = {
			...pushPreferences,
			...patch
		};
		savePushPreferences(next);
		setPushPreferences(next);
	};
	(0, import_react.useEffect)(() => {
		const check = () => {
			if (!automaticRemindersAllowed) return;
			const now = /* @__PURE__ */ new Date();
			const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
			const dayKey = now.toDateString();
			for (const habit of habits) {
				const reminder = reminders[habit.id];
				if (!reminder?.enabled || reminder.time !== hhmm || isDone(habit, today)) continue;
				const key = `${dayKey}:${habit.id}:${reminder.time}`;
				if (firedRef.current.has(key)) continue;
				firedRef.current.add(key);
				const body = `Đến giờ ${habit.name.toLowerCase()}. Hãy dành một bước nhỏ để hoàn thành hôm nay.`;
				toast(`⏰ ${habit.name}`, { description: body });
				if ("Notification" in window && Notification.permission === "granted") try {
					new Notification(`Nhắc học: ${habit.name}`, {
						body,
						tag: `habit-${habit.id}`
					});
				} catch {}
			}
		};
		const interval = window.setInterval(check, 3e4);
		check();
		return () => window.clearInterval(interval);
	}, [
		automaticRemindersAllowed,
		habits,
		reminders,
		today
	]);
	const requestPermission = async () => {
		if (!("Notification" in window)) return;
		const result = await Notification.requestPermission();
		setPermission(result);
		if (result === "granted") {
			updatePush({ enabled: true });
			toast.success("Đã bật thông báo trình duyệt.");
		} else if (result === "denied") toast.info("Thông báo đang bị chặn. Bạn có thể bật lại trong cài đặt trình duyệt.");
	};
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
				className: "rounded-3xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/70 p-5 shadow-xs",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Bell, { className: "h-5 w-5" }, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 126,
							columnNumber: 13
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 125,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
						className: "font-serif text-xl font-semibold text-slate-900",
						children: "Nhắc học"
					}, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 129,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "mt-1 text-sm text-slate-600",
						children: "Chọn thời điểm ứng dụng nhắc bạn bắt đầu hoặc quay lại học."
					}, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 130,
						columnNumber: 13
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$6,
						lineNumber: 128,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$6,
					lineNumber: 124,
					columnNumber: 9
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$6,
				lineNumber: 123,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
				className: "rounded-3xl border bg-white p-5 shadow-xs",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex flex-col gap-4 sm:flex-row sm:items-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", permission === "granted" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"),
							children: permission === "granted" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ShieldCheck, { className: "h-5 w-5" }, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 147,
								columnNumber: 41
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BellOff, { className: "h-5 w-5" }, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 147,
								columnNumber: 79
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 139,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
								className: "font-semibold text-slate-900",
								children: permission === "granted" ? "Thiết bị này đang nhận thông báo" : permission === "denied" ? "Thông báo đã bị chặn trong trình duyệt" : permission === "unsupported" ? "Trình duyệt không hỗ trợ thông báo" : "Thông báo trình duyệt đang tắt"
							}, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 150,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "mt-1 text-sm text-slate-500",
								children: permission === "granted" ? "Lời nhắc nền hoạt động theo lịch bạn đã chọn." : permission === "denied" ? "Hãy mở quyền của trang trong trình duyệt để bật lại." : "Bật thông báo để nhận lời nhắc khi ứng dụng không mở."
							}, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 159,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$6,
							lineNumber: 149,
							columnNumber: 11
						}, this),
						permission === "default" && /* @__PURE__ */ (void 0)(Button, {
							type: "button",
							className: "rounded-2xl bg-sky-600 hover:bg-sky-700",
							onClick: requestPermission,
							children: "Bật thông báo trình duyệt"
						}, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 168,
							columnNumber: 13
						}, this),
						permission === "granted" && /* @__PURE__ */ (void 0)(Switch, {
							checked: pushPreferences.enabled,
							onCheckedChange: (checked) => updatePush({ enabled: checked }),
							"aria-label": "Bật thông báo nền"
						}, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 173,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$6,
					lineNumber: 138,
					columnNumber: 9
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$6,
				lineNumber: 137,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
				className: "rounded-3xl border bg-white p-5 shadow-xs",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mb-3 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Clock3, { className: "h-5 w-5 text-indigo-600" }, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 184,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
						className: "font-semibold text-slate-900",
						children: "Lịch nhắc chính"
					}, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 186,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "text-xs text-slate-500",
						children: "Thay đổi được lưu ngay."
					}, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 187,
						columnNumber: 13
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$6,
						lineNumber: 185,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$6,
					lineNumber: 183,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "divide-y divide-slate-100",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ReminderScheduleRow, {
							icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SunMedium, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 192,
								columnNumber: 19
							}, this),
							title: "Kế hoạch buổi sáng",
							description: "Nhắc xem kế hoạch học trong ngày",
							time: pushPreferences.morningTime,
							enabled: pushPreferences.morningEnabled,
							onTimeChange: (time) => updatePush({ morningTime: time }),
							onEnabledChange: (enabled) => updatePush({ morningEnabled: enabled })
						}, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 191,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ReminderScheduleRow, {
							icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Sparkles, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 201,
								columnNumber: 19
							}, this),
							title: "Bắt đầu học buổi tối",
							description: "Nhắc quay lại nếu hôm nay chưa có phiên học",
							time: pushPreferences.eveningTime,
							enabled: pushPreferences.eveningEnabled,
							onTimeChange: (time) => updatePush({ eveningTime: time }),
							onEnabledChange: (enabled) => updatePush({ eveningEnabled: enabled })
						}, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 200,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ReminderScheduleRow, {
							icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Moon, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$6,
								lineNumber: 210,
								columnNumber: 19
							}, this),
							title: "Kiểm tra cuối ngày",
							description: "Nhắc xem lại tiến độ còn thiếu",
							time: pushPreferences.endOfDayTime,
							enabled: pushPreferences.enableStreakGuard,
							onTimeChange: (time) => updatePush({ endOfDayTime: time }),
							onEnabledChange: (enabled) => updatePush({ enableStreakGuard: enabled })
						}, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 209,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$6,
					lineNumber: 190,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$6,
				lineNumber: 182,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Collapsible, {
				open: habitOpen,
				onOpenChange: setHabitOpen,
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
					className: "rounded-3xl border bg-white p-5 shadow-xs",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CollapsibleTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							type: "button",
							className: "flex w-full items-center gap-3 text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700",
									children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Bell, { className: "h-4 w-4" }, void 0, false, {
										fileName: _jsxFileName$6,
										lineNumber: 226,
										columnNumber: 17
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 225,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
										className: "font-semibold text-slate-900",
										children: "Nhắc theo từng thói quen"
									}, void 0, false, {
										fileName: _jsxFileName$6,
										lineNumber: 229,
										columnNumber: 17
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
										className: "text-xs text-slate-500",
										children: "Đặt giờ riêng cho từng thói quen; không hiển thị trạng thái hoàn thành tại đây."
									}, void 0, false, {
										fileName: _jsxFileName$6,
										lineNumber: 230,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$6,
									lineNumber: 228,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ChevronDown, { className: cn("h-4 w-4 transition", habitOpen && "rotate-180") }, void 0, false, {
									fileName: _jsxFileName$6,
									lineNumber: 232,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName$6,
							lineNumber: 224,
							columnNumber: 13
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 223,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CollapsibleContent, {
						className: "pt-4",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "divide-y divide-slate-100",
							children: habits.map((habit) => {
								const reminder = reminders[habit.id] ?? {
									enabled: false,
									time: "20:00"
								};
								return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "flex items-center gap-3 py-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "min-w-0 flex-1",
											children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
												className: "truncate text-sm font-semibold text-slate-900",
												children: habit.name
											}, void 0, false, {
												fileName: _jsxFileName$6,
												lineNumber: 242,
												columnNumber: 23
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName$6,
											lineNumber: 241,
											columnNumber: 21
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
											type: "time",
											value: reminder.time,
											onChange: (event) => onSet(habit.id, { time: event.target.value }),
											disabled: !reminder.enabled,
											className: "h-9 w-28 rounded-xl",
											"aria-label": `Giờ nhắc ${habit.name}`
										}, void 0, false, {
											fileName: _jsxFileName$6,
											lineNumber: 244,
											columnNumber: 21
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Switch, {
											checked: reminder.enabled,
											onCheckedChange: (enabled) => onSet(habit.id, { enabled }),
											"aria-label": `Bật nhắc ${habit.name}`
										}, void 0, false, {
											fileName: _jsxFileName$6,
											lineNumber: 252,
											columnNumber: 21
										}, this)
									]
								}, habit.id, true, {
									fileName: _jsxFileName$6,
									lineNumber: 240,
									columnNumber: 19
								}, this);
							})
						}, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 236,
							columnNumber: 13
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 235,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$6,
					lineNumber: 222,
					columnNumber: 9
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$6,
				lineNumber: 221,
				columnNumber: 7
			}, this),
			onOpenPushCenter && /* @__PURE__ */ (void 0)("section", {
				className: "rounded-3xl border border-slate-200 bg-slate-50/80 p-4",
				children: /* @__PURE__ */ (void 0)(Button, {
					type: "button",
					variant: "ghost",
					className: "w-full justify-between rounded-xl text-slate-600",
					onClick: onOpenPushCenter,
					children: [/* @__PURE__ */ (void 0)("span", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (void 0)(ExternalLink, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$6,
							lineNumber: 274,
							columnNumber: 15
						}, this), " Chẩn đoán thông báo"]
					}, void 0, true, {
						fileName: _jsxFileName$6,
						lineNumber: 273,
						columnNumber: 13
					}, this), /* @__PURE__ */ (void 0)("span", {
						className: "text-xs font-normal text-slate-400",
						children: "HTTPS · Service worker · Push"
					}, void 0, false, {
						fileName: _jsxFileName$6,
						lineNumber: 276,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$6,
					lineNumber: 267,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$6,
				lineNumber: 266,
				columnNumber: 9
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$6,
		lineNumber: 122,
		columnNumber: 5
	}, this);
}
function ReminderScheduleRow({ icon, title, description, time, enabled, onTimeChange, onEnabledChange }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "flex flex-wrap items-center gap-3 py-3 first:pt-1 last:pb-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
				className: "grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600",
				children: icon
			}, void 0, false, {
				fileName: _jsxFileName$6,
				lineNumber: 303,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "min-w-[180px] flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "text-sm font-semibold text-slate-900",
					children: title
				}, void 0, false, {
					fileName: _jsxFileName$6,
					lineNumber: 305,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "text-xs text-slate-500",
					children: description
				}, void 0, false, {
					fileName: _jsxFileName$6,
					lineNumber: 306,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$6,
				lineNumber: 304,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
				type: "time",
				value: time,
				onChange: (event) => onTimeChange(event.target.value),
				disabled: !enabled,
				className: "h-9 w-28 rounded-xl",
				"aria-label": `Giờ ${title}`
			}, void 0, false, {
				fileName: _jsxFileName$6,
				lineNumber: 308,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Switch, {
				checked: enabled,
				onCheckedChange: onEnabledChange,
				"aria-label": `Bật ${title}`
			}, void 0, false, {
				fileName: _jsxFileName$6,
				lineNumber: 316,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$6,
		lineNumber: 302,
		columnNumber: 5
	}, this);
}
var _jsxFileName$5 = "/app/applet/src/components/GoalsCard.tsx";
function GoalsCard({ goals, weekStats, level, achievementPoints, pointsInLevel, onSetGoals, definitions }) {
	const xpPct = Math.min(100, Math.round(weekStats.xpThisWeek / Math.max(1, goals.weeklyXp) * 100));
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "rounded-3xl bg-white/70 p-5 shadow-soft backdrop-blur",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "mb-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DuotoneIcon, {
						icon: Trophy,
						tone: "amber",
						size: 28,
						active: true
					}, void 0, false, {
						fileName: _jsxFileName$5,
						lineNumber: 34,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
						children: "Mục tiêu tuần"
					}, void 0, false, {
						fileName: _jsxFileName$5,
						lineNumber: 36,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
						className: "font-serif text-xl font-semibold",
						children: ["Cấp độ ", level]
					}, void 0, true, {
						fileName: _jsxFileName$5,
						lineNumber: 39,
						columnNumber: 13
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$5,
						lineNumber: 35,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$5,
					lineNumber: 33,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "text-right",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "text-xs text-muted-foreground",
						children: "Điểm thành tích"
					}, void 0, false, {
						fileName: _jsxFileName$5,
						lineNumber: 43,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "font-serif text-lg font-bold text-emerald-600",
						children: [
							achievementPoints,
							" ",
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "text-xs text-muted-foreground",
								children: [
									"(",
									pointsInLevel,
									"/3)"
								]
							}, void 0, true, {
								fileName: _jsxFileName$5,
								lineNumber: 46,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$5,
						lineNumber: 44,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$5,
					lineNumber: 42,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$5,
				lineNumber: 32,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "mb-4 rounded-2xl bg-sky-50/60 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "mb-2 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", {
							className: "text-sm font-medium text-sky-800",
							children: "XP mỗi tuần"
						}, void 0, false, {
							fileName: _jsxFileName$5,
							lineNumber: 54,
							columnNumber: 11
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
								type: "number",
								min: 50,
								step: 50,
								value: goals.weeklyXp,
								onChange: (e) => onSetGoals({ weeklyXp: Math.max(50, Number(e.target.value) || 0) }),
								className: "w-20 rounded-lg border border-sky-200 bg-white px-2 py-1 text-right text-sm font-semibold text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
							}, void 0, false, {
								fileName: _jsxFileName$5,
								lineNumber: 56,
								columnNumber: 13
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "text-xs text-muted-foreground",
								children: "XP"
							}, void 0, false, {
								fileName: _jsxFileName$5,
								lineNumber: 64,
								columnNumber: 13
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$5,
							lineNumber: 55,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$5,
						lineNumber: 53,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "h-2.5 overflow-hidden rounded-full bg-white",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all",
							style: { width: `${xpPct}%` }
						}, void 0, false, {
							fileName: _jsxFileName$5,
							lineNumber: 68,
							columnNumber: 11
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName$5,
						lineNumber: 67,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "mt-1 flex justify-between text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: [weekStats.xpThisWeek, " XP tuần này"] }, void 0, true, {
							fileName: _jsxFileName$5,
							lineNumber: 74,
							columnNumber: 11
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: [xpPct, "%"] }, void 0, true, {
							fileName: _jsxFileName$5,
							lineNumber: 75,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$5,
						lineNumber: 73,
						columnNumber: 9
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName$5,
				lineNumber: 52,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Target, { className: "h-3.5 w-3.5" }, void 0, false, {
						fileName: _jsxFileName$5,
						lineNumber: 82,
						columnNumber: 11
					}, this), " Số lần/tuần cho từng thói quen"]
				}, void 0, true, {
					fileName: _jsxFileName$5,
					lineNumber: 81,
					columnNumber: 9
				}, this), definitions.filter((habit) => !habit.archived).map((h) => {
					const target = goals.habitTargets[h.id] ?? 0;
					const done = weekStats.habitCounts[h.id] ?? 0;
					const pct = target > 0 ? Math.min(100, Math.round(done / target * 100)) : 0;
					const met = target > 0 && done >= target;
					return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center gap-3 rounded-xl bg-white/60 px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "truncate text-sm font-medium",
									children: h.name
								}, void 0, false, {
									fileName: _jsxFileName$5,
									lineNumber: 95,
									columnNumber: 21
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: `text-xs font-semibold ${met ? "text-emerald-600" : "text-muted-foreground"}`,
									children: [
										done,
										"/",
										target
									]
								}, void 0, true, {
									fileName: _jsxFileName$5,
									lineNumber: 96,
									columnNumber: 21
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$5,
								lineNumber: 94,
								columnNumber: 19
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: `h-full rounded-full transition-all ${met ? "bg-emerald-400" : "bg-sky-300"}`,
									style: { width: `${pct}%` }
								}, void 0, false, {
									fileName: _jsxFileName$5,
									lineNumber: 103,
									columnNumber: 21
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$5,
								lineNumber: 102,
								columnNumber: 19
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$5,
							lineNumber: 93,
							columnNumber: 17
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
							type: "number",
							min: 0,
							max: 7,
							value: target,
							onChange: (e) => onSetGoals({ habitTargets: { [h.id]: Math.max(0, Math.min(7, Number(e.target.value) || 0)) } }),
							className: "w-12 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
						}, void 0, false, {
							fileName: _jsxFileName$5,
							lineNumber: 109,
							columnNumber: 17
						}, this)]
					}, h.id, true, {
						fileName: _jsxFileName$5,
						lineNumber: 92,
						columnNumber: 15
					}, this);
				})]
			}, void 0, true, {
				fileName: _jsxFileName$5,
				lineNumber: 80,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: "Mỗi mục tiêu tuần đạt được cộng 1 điểm thành tích. Đủ 3 điểm → lên cấp."
			}, void 0, false, {
				fileName: _jsxFileName$5,
				lineNumber: 128,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$5,
		lineNumber: 31,
		columnNumber: 5
	}, this);
}
var _jsxFileName$4 = "/app/applet/src/components/PomodoroStudioSettings.tsx";
var PRESETS = [
	{
		minutes: 2,
		icon: "⚡",
		title: "Khởi động",
		detail: "2 phút · không nghỉ tự động"
	},
	{
		minutes: 25,
		icon: "🍅",
		title: "Pomodoro",
		detail: "25 phút học · 5 phút nghỉ"
	},
	{
		minutes: 50,
		icon: "🧠",
		title: "Deep Work",
		detail: "50 phút học · 10 phút nghỉ"
	},
	{
		minutes: 90,
		icon: "🚀",
		title: "Siêu tập trung",
		detail: "90 phút học · 15 phút nghỉ"
	}
];
function PomodoroStudioSettings() {
	const [preferences, setPreferences] = (0, import_react.useState)(() => loadFocusPreferences());
	const update = (patch, message) => {
		const saved = saveFocusPreferences(patch);
		if (!saved.ok) {
			toast.error(saved.error);
			return;
		}
		setPreferences(saved.value);
		if (message) toast.success(message);
	};
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
				className: "rounded-3xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/70 p-5 shadow-xs",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-100 text-xl",
						children: "🍅"
					}, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 51,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
						className: "font-serif text-xl font-semibold text-slate-900",
						children: "Pomodoro Studio"
					}, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 53,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "mt-1 text-sm text-slate-600",
						children: "Thiết lập thời lượng, giờ nghỉ và cách Timer hoạt động. Đây là nơi cấu hình, không phải một Timer thứ hai."
					}, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 54,
						columnNumber: 13
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$4,
						lineNumber: 52,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$4,
					lineNumber: 50,
					columnNumber: 9
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 49,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
				className: "rounded-3xl border bg-white p-5 shadow-xs",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mb-3 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Clock3, { className: "h-5 w-5 text-rose-600" }, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 63,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
						className: "font-semibold text-slate-900",
						children: "Các chế độ chuẩn"
					}, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 65,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "text-xs text-slate-500",
						children: "Dùng thống nhất trên toàn ứng dụng."
					}, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 66,
						columnNumber: 13
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$4,
						lineNumber: 64,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$4,
					lineNumber: 62,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "grid gap-2 sm:grid-cols-2",
					children: PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "grid h-10 w-10 place-items-center rounded-xl bg-white text-xl shadow-xs",
							children: preset.icon
						}, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 75,
							columnNumber: 15
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "font-semibold text-slate-900",
								children: preset.title
							}, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 79,
								columnNumber: 17
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
								className: "text-xs text-slate-500",
								children: preset.detail
							}, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 80,
								columnNumber: 17
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$4,
							lineNumber: 78,
							columnNumber: 15
						}, this)]
					}, preset.minutes, true, {
						fileName: _jsxFileName$4,
						lineNumber: 71,
						columnNumber: 13
					}, this))
				}, void 0, false, {
					fileName: _jsxFileName$4,
					lineNumber: 69,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$4,
				lineNumber: 61,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
				className: "rounded-3xl border bg-white p-5 shadow-xs",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mb-3 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TimerReset, { className: "h-5 w-5 text-indigo-600" }, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 89,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
						className: "font-semibold text-slate-900",
						children: "Phiên mặc định khi bấm “Học tiếp”"
					}, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 91,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
						className: "text-xs text-slate-500",
						children: "Hai phút vẫn là luồng khởi động riêng."
					}, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 92,
						columnNumber: 13
					}, this)] }, void 0, true, {
						fileName: _jsxFileName$4,
						lineNumber: 90,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$4,
					lineNumber: 88,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "grid grid-cols-3 gap-2",
					children: [
						25,
						50,
						90
					].map((minutes) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
						type: "button",
						variant: preferences.defaultFocusMinutes === minutes ? "default" : "outline",
						onClick: () => update({ defaultFocusMinutes: minutes }, `Đã đặt phiên mặc định ${minutes} phút.`),
						className: cn("rounded-2xl", preferences.defaultFocusMinutes === minutes && "bg-indigo-600 hover:bg-indigo-700"),
						children: [minutes, " phút"]
					}, minutes, true, {
						fileName: _jsxFileName$4,
						lineNumber: 97,
						columnNumber: 13
					}, this))
				}, void 0, false, {
					fileName: _jsxFileName$4,
					lineNumber: 95,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$4,
				lineNumber: 87,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
				className: "rounded-3xl border bg-white p-5 shadow-xs",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mb-2 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Play, { className: "h-5 w-5 text-emerald-600" }, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 120,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
						className: "font-semibold text-slate-900",
						children: "Bắt đầu và chuyển phiên"
					}, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 121,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$4,
					lineNumber: 119,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "divide-y divide-slate-100",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PreferenceRow, {
							icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Sparkles, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 125,
								columnNumber: 19
							}, this),
							title: "Luôn đề xuất phiên 2 phút cho bài chưa bắt đầu",
							description: "Nếu tắt, CTA chính dùng thời lượng mặc định. Hai phút vẫn có trong Chọn phiên.",
							checked: preferences.quickStartEnabled,
							onCheckedChange: (checked) => update({ quickStartEnabled: checked })
						}, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 124,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PreferenceRow, {
							icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Play, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 132,
								columnNumber: 19
							}, this),
							title: "Tự bắt đầu khi chọn một thời lượng",
							description: "Bấm 25, 50 hoặc 90 phút là Timer chạy ngay.",
							checked: preferences.autoStartSelectedDuration,
							onCheckedChange: (checked) => update({ autoStartSelectedDuration: checked })
						}, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 131,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PreferenceRow, {
							icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RotateCcw, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 139,
								columnNumber: 19
							}, this),
							title: "Tự bắt đầu giờ nghỉ sau phiên học",
							description: "Mặc định tắt; giờ nghỉ vẫn được tính đúng 5, 10 hoặc 15 phút.",
							checked: preferences.autoStartBreak,
							onCheckedChange: (checked) => update({ autoStartBreak: checked })
						}, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 138,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PreferenceRow, {
							icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TimerReset, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 146,
								columnNumber: 19
							}, this),
							title: "Tự bắt đầu phiên mới sau giờ nghỉ",
							description: "Mặc định tắt để tránh chạy oan khi bạn rời bàn.",
							checked: preferences.autoStartFocus,
							onCheckedChange: (checked) => update({ autoStartFocus: checked })
						}, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 145,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PreferenceRow, {
							icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ShieldCheck, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 153,
								columnNumber: 19
							}, this),
							title: "Hiện xác nhận trước khi dừng phiên",
							description: "Phân biệt rõ đóng giao diện, thu nhỏ và dừng hẳn.",
							checked: preferences.confirmBeforeStop,
							onCheckedChange: (checked) => update({ confirmBeforeStop: checked })
						}, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 152,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$4,
					lineNumber: 123,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$4,
				lineNumber: 118,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
				className: "rounded-3xl border bg-white p-5 shadow-xs",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "mb-2 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Minimize2, { className: "h-5 w-5 text-sky-600" }, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 164,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
						className: "font-semibold text-slate-900",
						children: "Timer chạy nền"
					}, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 165,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName$4,
					lineNumber: 163,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "divide-y divide-slate-100",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PreferenceRow, {
							icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Clock3, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 169,
								columnNumber: 19
							}, this),
							title: "Giữ Timer chạy khi chuyển tab",
							description: "Timer vẫn tính theo timestamp thực tế khi trình duyệt bị giảm nhịp.",
							checked: preferences.keepRunningAcrossTabs,
							onCheckedChange: (checked) => update({ keepRunningAcrossTabs: checked })
						}, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 168,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PreferenceRow, {
							icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Minimize2, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 176,
								columnNumber: 19
							}, this),
							title: "Hiện mini Timer trên toàn ứng dụng",
							description: "Thu nhỏ Timer thay vì tự dừng khi đóng giao diện chính.",
							checked: preferences.showMiniTimer,
							onCheckedChange: (checked) => update({ showMiniTimer: checked })
						}, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 175,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PreferenceRow, {
							icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BellRing, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 183,
								columnNumber: 19
							}, this),
							title: "Thông báo khi phiên kết thúc",
							description: "Chỉ gửi khi trình duyệt đã được cấp quyền trong mục Nhắc học.",
							checked: preferences.notifyWhenComplete,
							onCheckedChange: (checked) => update({ notifyWhenComplete: checked })
						}, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 182,
							columnNumber: 11
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PreferenceRow, {
							icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Clock3, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 190,
								columnNumber: 19
							}, this),
							title: "Hiển thị trạng thái đang học trong header",
							description: "Cho phép thanh trên cùng hiển thị phiên đang chạy mà không mở thêm Timer.",
							checked: preferences.showTimerInHeader,
							onCheckedChange: (checked) => update({ showTimerInHeader: checked })
						}, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 189,
							columnNumber: 11
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$4,
					lineNumber: 167,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$4,
				lineNumber: 162,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
				className: "rounded-3xl border bg-white p-5 shadow-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "mb-3 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Headphones, { className: "h-5 w-5 text-amber-600" }, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 201,
							columnNumber: 11
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
							className: "font-semibold text-slate-900",
							children: "Âm thanh Timer"
						}, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 203,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
							className: "text-xs text-slate-500",
							children: "Tách riêng với âm thanh của lời nhắc học."
						}, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 204,
							columnNumber: 13
						}, this)] }, void 0, true, {
							fileName: _jsxFileName$4,
							lineNumber: 202,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$4,
						lineNumber: 200,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PreferenceRow, {
						icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BellRing, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName$4,
							lineNumber: 208,
							columnNumber: 17
						}, this),
						title: "Âm báo hết giờ học và giờ nghỉ",
						description: "Chỉ phát âm cục bộ; không tự xin quyền thông báo trình duyệt.",
						checked: preferences.soundAlertsEnabled,
						onCheckedChange: (checked) => update({ soundAlertsEnabled: checked })
					}, void 0, false, {
						fileName: _jsxFileName$4,
						lineNumber: 207,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "mt-4 rounded-2xl bg-slate-50 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "mb-3 flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
									className: "flex items-center gap-2 text-sm font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Volume2, { className: "h-4 w-4" }, void 0, false, {
										fileName: _jsxFileName$4,
										lineNumber: 217,
										columnNumber: 15
									}, this), " Âm lượng"]
								}, void 0, true, {
									fileName: _jsxFileName$4,
									lineNumber: 216,
									columnNumber: 13
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "text-xs font-bold text-slate-600",
									children: [Math.round(preferences.soundVolume * 100), "%"]
								}, void 0, true, {
									fileName: _jsxFileName$4,
									lineNumber: 219,
									columnNumber: 13
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 215,
								columnNumber: 11
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Slider, {
								value: [preferences.soundVolume * 100],
								min: 0,
								max: 100,
								step: 5,
								onValueChange: (values) => update({ soundVolume: (values[0] ?? 50) / 100 })
							}, void 0, false, {
								fileName: _jsxFileName$4,
								lineNumber: 221,
								columnNumber: 11
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
									type: "button",
									size: "sm",
									variant: "outline",
									className: "rounded-xl",
									onClick: () => playStudyCompletionChime(preferences.soundVolume),
									children: "Thử âm học"
								}, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 229,
									columnNumber: 13
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
									type: "button",
									size: "sm",
									variant: "outline",
									className: "rounded-xl",
									onClick: () => playBreakCompletionChime(preferences.soundVolume),
									children: "Thử âm nghỉ"
								}, void 0, false, {
									fileName: _jsxFileName$4,
									lineNumber: 238,
									columnNumber: 13
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$4,
								lineNumber: 228,
								columnNumber: 11
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$4,
						lineNumber: 214,
						columnNumber: 9
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName$4,
				lineNumber: 199,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$4,
		lineNumber: 48,
		columnNumber: 5
	}, this);
}
function PreferenceRow({ icon, title, description, checked, onCheckedChange }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "flex items-center gap-3 py-3 first:pt-1 last:pb-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
				className: "grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600",
				children: icon
			}, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 269,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "text-sm font-semibold text-slate-900",
					children: title
				}, void 0, false, {
					fileName: _jsxFileName$4,
					lineNumber: 273,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
					className: "text-xs leading-relaxed text-slate-500",
					children: description
				}, void 0, false, {
					fileName: _jsxFileName$4,
					lineNumber: 274,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName$4,
				lineNumber: 272,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Switch, {
				checked,
				onCheckedChange,
				"aria-label": title
			}, void 0, false, {
				fileName: _jsxFileName$4,
				lineNumber: 276,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName$4,
		lineNumber: 268,
		columnNumber: 5
	}, this);
}
var _jsxFileName$3 = "/app/applet/src/components/SettingsModal.tsx";
var APPEARANCE_KEY = "hocvien-appearance-preferences-v1";
function loadAppearance() {
	if (typeof window === "undefined") return {
		animations: true,
		confetti: true
	};
	try {
		return {
			animations: true,
			confetti: true,
			...JSON.parse(localStorage.getItem(APPEARANCE_KEY) || "{}")
		};
	} catch {
		return {
			animations: true,
			confetti: true
		};
	}
}
function SettingsModal({ isOpen, onClose, reminders, today, completedLessons = {}, shiftedDates = {}, onSetReminder, goals, weekStats, level = 1, achievementPoints = 0, pointsInLevel = 0, onSetGoals, subjects, habitDefinitions, onResetOnboarding, onOpenPushCenter, onOpenRoadmapData, onTriggerPush, initialTab = "pomodoro" }) {
	const [appearance, setAppearance] = (0, import_react.useState)(() => loadAppearance());
	const hasFactoryResetRollback = readRawSnapshot(RESET_ROLLBACK_KEY).status === "ok";
	const updateAppearance = (patch) => {
		const next = {
			...appearance,
			...patch
		};
		setAppearance(next);
		try {
			localStorage.setItem(APPEARANCE_KEY, JSON.stringify(next));
			document.documentElement.dataset.smartAnimations = next.animations ? "on" : "off";
			window.dispatchEvent(new CustomEvent("hocvien:appearance-updated", { detail: next }));
		} catch {
			toast.error("Không thể lưu cài đặt giao diện.");
		}
	};
	const handleFactoryReset = () => {
		if (!window.confirm("Đặt lại toàn bộ ứng dụng? Tiến độ, môn học, thói quen và lịch tương lai sẽ bị xóa. Một snapshot hoàn tác sẽ được tạo trước khi thực hiện.")) return;
		const reset = factoryResetOwnedStorage();
		if (!reset.ok) {
			toast.error(reset.rollbackError ? `${reset.error} ${reset.rollbackError}` : reset.error);
			return;
		}
		toast.success("Đã đặt lại ứng dụng. Đang tải lại…");
		window.setTimeout(() => window.location.reload(), 350);
	};
	const handleRestoreFactoryReset = () => {
		const restored = restoreSnapshotFromKey(RESET_ROLLBACK_KEY);
		if (!restored.ok) {
			toast.error(restored.error);
			return;
		}
		toast.success("Đã khôi phục snapshot gần nhất. Đang tải lại…");
		window.setTimeout(() => window.location.reload(), 350);
	};
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Dialog, {
		open: isOpen,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent, {
			className: "h-[92vh] w-[96vw] max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/95 p-0 backdrop-blur grid-rows-[auto_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogHeader, {
				className: "border-b bg-white/90 px-5 py-4",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle, {
					className: "flex items-center gap-3 font-serif text-xl text-slate-900",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
						className: "grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-700",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Settings, { className: "h-5 w-5" }, void 0, false, {
							fileName: _jsxFileName$3,
							lineNumber: 144,
							columnNumber: 15
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName$3,
						lineNumber: 143,
						columnNumber: 13
					}, this), "Cài đặt"]
				}, void 0, true, {
					fileName: _jsxFileName$3,
					lineNumber: 142,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName$3,
				lineNumber: 141,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Tabs, {
				defaultValue: initialTab,
				orientation: "vertical",
				className: "grid min-h-0 flex-1 md:grid-cols-[220px_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsList, {
					className: "flex h-auto flex-row gap-1 overflow-x-auto rounded-none border-b bg-white p-3 md:flex-col md:items-stretch md:border-b-0 md:border-r",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SettingsNav, {
							value: "pomodoro",
							icon: TimerReset,
							label: "Pomodoro Studio"
						}, void 0, false, {
							fileName: _jsxFileName$3,
							lineNumber: 152,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SettingsNav, {
							value: "reminders",
							icon: Bell,
							label: "Nhắc học"
						}, void 0, false, {
							fileName: _jsxFileName$3,
							lineNumber: 153,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SettingsNav, {
							value: "goals",
							icon: Target,
							label: "Mục tiêu học tập"
						}, void 0, false, {
							fileName: _jsxFileName$3,
							lineNumber: 154,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SettingsNav, {
							value: "appearance",
							icon: Palette,
							label: "Giao diện"
						}, void 0, false, {
							fileName: _jsxFileName$3,
							lineNumber: 155,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SettingsNav, {
							value: "data",
							icon: Database,
							label: "Lộ trình & dữ liệu"
						}, void 0, false, {
							fileName: _jsxFileName$3,
							lineNumber: 156,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$3,
					lineNumber: 151,
					columnNumber: 11
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "min-h-0 overflow-y-auto p-4 sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsContent, {
							value: "pomodoro",
							className: "m-0",
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PomodoroStudioSettings, {}, void 0, false, {
								fileName: _jsxFileName$3,
								lineNumber: 161,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$3,
							lineNumber: 160,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsContent, {
							value: "reminders",
							className: "m-0",
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RemindersCard, {
								reminders,
								today,
								completedLessons,
								shiftedDates,
								subjects,
								onSet: onSetReminder,
								definitions: habitDefinitions,
								onOpenPushCenter,
								onTriggerPush
							}, void 0, false, {
								fileName: _jsxFileName$3,
								lineNumber: 165,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$3,
							lineNumber: 164,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsContent, {
							value: "goals",
							className: "m-0",
							children: goals && weekStats && onSetGoals ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(GoalsCard, {
								goals,
								weekStats,
								level,
								achievementPoints,
								pointsInLevel,
								onSetGoals,
								definitions: habitDefinitions
							}, void 0, false, {
								fileName: _jsxFileName$3,
								lineNumber: 180,
								columnNumber: 17
							}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "rounded-3xl border bg-white p-6 text-center text-sm text-slate-500",
								children: "Đang tải cấu hình mục tiêu…"
							}, void 0, false, {
								fileName: _jsxFileName$3,
								lineNumber: 190,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$3,
							lineNumber: 178,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsContent, {
							value: "appearance",
							className: "m-0 space-y-4",
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
								className: "rounded-3xl border bg-white p-5 shadow-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "mb-4 flex items-start gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
											className: "grid h-10 w-10 place-items-center rounded-2xl bg-violet-100 text-violet-700",
											children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(MonitorCog, { className: "h-5 w-5" }, void 0, false, {
												fileName: _jsxFileName$3,
												lineNumber: 200,
												columnNumber: 21
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName$3,
											lineNumber: 199,
											columnNumber: 19
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
											className: "font-serif text-xl font-semibold text-slate-900",
											children: "Giao diện"
										}, void 0, false, {
											fileName: _jsxFileName$3,
											lineNumber: 203,
											columnNumber: 21
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
											className: "text-sm text-slate-500",
											children: "Giữ phong cách hiện tại và điều chỉnh mức chuyển động."
										}, void 0, false, {
											fileName: _jsxFileName$3,
											lineNumber: 204,
											columnNumber: 21
										}, this)] }, void 0, true, {
											fileName: _jsxFileName$3,
											lineNumber: 202,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$3,
										lineNumber: 198,
										columnNumber: 17
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(AppearanceRow, {
										title: "Hiệu ứng chuyển động",
										description: "Giữ animation nhẹ cho modal, progress và trạng thái hoàn thành.",
										checked: appearance.animations,
										onCheckedChange: (checked) => updateAppearance({ animations: checked })
									}, void 0, false, {
										fileName: _jsxFileName$3,
										lineNumber: 207,
										columnNumber: 17
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(AppearanceRow, {
										title: "Pháo hoa khi đạt cột mốc",
										description: "Chỉ hiển thị cho cột mốc thật, không phát lại sau reload.",
										checked: appearance.confetti,
										onCheckedChange: (checked) => updateAppearance({ confetti: checked })
									}, void 0, false, {
										fileName: _jsxFileName$3,
										lineNumber: 213,
										columnNumber: 17
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName$3,
								lineNumber: 197,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName$3,
							lineNumber: 196,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsContent, {
							value: "data",
							className: "m-0 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
									className: "rounded-3xl border bg-white p-5 shadow-xs",
									children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "flex items-start gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
											className: "grid h-10 w-10 place-items-center rounded-2xl bg-sky-100 text-sky-700",
											children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Database, { className: "h-5 w-5" }, void 0, false, {
												fileName: _jsxFileName$3,
												lineNumber: 226,
												columnNumber: 21
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName$3,
											lineNumber: 225,
											columnNumber: 19
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "min-w-0 flex-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", {
													className: "font-serif text-xl font-semibold text-slate-900",
													children: "Lộ trình & dữ liệu"
												}, void 0, false, {
													fileName: _jsxFileName$3,
													lineNumber: 229,
													columnNumber: 21
												}, this),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
													className: "mt-1 text-sm text-slate-500",
													children: "Lộ trình mẫu, nhập file, xuất dữ liệu và sao lưu được quản lý trong một màn hình riêng."
												}, void 0, false, {
													fileName: _jsxFileName$3,
													lineNumber: 230,
													columnNumber: 21
												}, this),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
													type: "button",
													className: "mt-4 rounded-2xl bg-sky-600 hover:bg-sky-700",
													onClick: () => {
														onClose();
														window.setTimeout(() => onOpenRoadmapData?.(), 0);
													},
													children: "Mở Lộ trình & dữ liệu"
												}, void 0, false, {
													fileName: _jsxFileName$3,
													lineNumber: 233,
													columnNumber: 21
												}, this)
											]
										}, void 0, true, {
											fileName: _jsxFileName$3,
											lineNumber: 228,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$3,
										lineNumber: 224,
										columnNumber: 17
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName$3,
									lineNumber: 223,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
									className: "rounded-3xl border border-amber-200 bg-amber-50/70 p-5",
									children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "flex items-start gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RotateCcw, { className: "mt-0.5 h-5 w-5 text-amber-700" }, void 0, false, {
											fileName: _jsxFileName$3,
											lineNumber: 249,
											columnNumber: 19
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "min-w-0 flex-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
													className: "font-semibold text-amber-950",
													children: "Bắt đầu lại quy trình thiết lập"
												}, void 0, false, {
													fileName: _jsxFileName$3,
													lineNumber: 251,
													columnNumber: 21
												}, this),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
													className: "mt-1 text-sm text-amber-800",
													children: "Mở lại màn hình chọn không gian trống hoặc lộ trình mẫu. Dữ liệu chỉ thay đổi sau khi bạn xác nhận."
												}, void 0, false, {
													fileName: _jsxFileName$3,
													lineNumber: 252,
													columnNumber: 21
												}, this),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
													type: "button",
													variant: "outline",
													className: "mt-3 rounded-xl",
													onClick: onResetOnboarding,
													children: "Mở lại onboarding"
												}, void 0, false, {
													fileName: _jsxFileName$3,
													lineNumber: 255,
													columnNumber: 21
												}, this)
											]
										}, void 0, true, {
											fileName: _jsxFileName$3,
											lineNumber: 250,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$3,
										lineNumber: 248,
										columnNumber: 17
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName$3,
									lineNumber: 247,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", {
									className: "rounded-3xl border border-red-200 bg-red-50/70 p-5",
									children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "flex items-start gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TriangleAlert, { className: "mt-0.5 h-5 w-5 text-red-700" }, void 0, false, {
											fileName: _jsxFileName$3,
											lineNumber: 264,
											columnNumber: 19
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "min-w-0 flex-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
													className: "font-semibold text-red-950",
													children: "Khu vực nguy hiểm"
												}, void 0, false, {
													fileName: _jsxFileName$3,
													lineNumber: 266,
													columnNumber: 21
												}, this),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
													className: "mt-1 text-sm text-red-800",
													children: "Các thao tác sau có thể thay đổi toàn bộ workspace. Ứng dụng luôn tạo snapshot hoàn tác trước khi thực hiện."
												}, void 0, false, {
													fileName: _jsxFileName$3,
													lineNumber: 267,
													columnNumber: 21
												}, this),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
													className: "mt-4 flex flex-wrap gap-2",
													children: [hasFactoryResetRollback && /* @__PURE__ */ (void 0)(Button, {
														type: "button",
														variant: "outline",
														className: "rounded-xl",
														onClick: handleRestoreFactoryReset,
														children: "Khôi phục lần đặt lại gần nhất"
													}, void 0, false, {
														fileName: _jsxFileName$3,
														lineNumber: 272,
														columnNumber: 25
													}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
														type: "button",
														variant: "destructive",
														className: "rounded-xl",
														onClick: handleFactoryReset,
														children: "Đặt lại toàn bộ ứng dụng"
													}, void 0, false, {
														fileName: _jsxFileName$3,
														lineNumber: 276,
														columnNumber: 23
													}, this)]
												}, void 0, true, {
													fileName: _jsxFileName$3,
													lineNumber: 270,
													columnNumber: 21
												}, this)
											]
										}, void 0, true, {
											fileName: _jsxFileName$3,
											lineNumber: 265,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$3,
										lineNumber: 263,
										columnNumber: 17
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName$3,
									lineNumber: 262,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName$3,
							lineNumber: 222,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName$3,
					lineNumber: 159,
					columnNumber: 11
				}, this)]
			}, initialTab, true, {
				fileName: _jsxFileName$3,
				lineNumber: 150,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$3,
			lineNumber: 140,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$3,
		lineNumber: 139,
		columnNumber: 5
	}, this);
}
function SettingsNav({ value, icon: Icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsTrigger, {
		value,
		className: "shrink-0 justify-start gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-600 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-950 md:w-full",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Icon, { className: "h-4 w-4" }, void 0, false, {
			fileName: _jsxFileName$3,
			lineNumber: 305,
			columnNumber: 7
		}, this), label]
	}, void 0, true, {
		fileName: _jsxFileName$3,
		lineNumber: 301,
		columnNumber: 5
	}, this);
}
function AppearanceRow({ title, description, checked, onCheckedChange }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: "flex items-center gap-4 border-t border-slate-100 py-4 first:border-t-0",
		children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
				className: "text-sm font-semibold text-slate-900",
				children: title
			}, void 0, false, {
				fileName: _jsxFileName$3,
				lineNumber: 325,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
				className: "text-xs leading-relaxed text-slate-500",
				children: description
			}, void 0, false, {
				fileName: _jsxFileName$3,
				lineNumber: 326,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$3,
			lineNumber: 324,
			columnNumber: 7
		}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Switch, {
			checked,
			onCheckedChange,
			"aria-label": title
		}, void 0, false, {
			fileName: _jsxFileName$3,
			lineNumber: 328,
			columnNumber: 7
		}, this)]
	}, void 0, true, {
		fileName: _jsxFileName$3,
		lineNumber: 323,
		columnNumber: 5
	}, this);
}
var _jsxFileName$2 = "/app/applet/src/components/ui/badge.tsx";
var badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
		secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
		outline: "text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	}, void 0, false, {
		fileName: _jsxFileName$2,
		lineNumber: 29,
		columnNumber: 10
	}, this);
}
var _jsxFileName$1 = "/app/applet/src/components/RewardShopModal.tsx";
var DEFAULT_PRESET_REWARDS = [
	{
		id: "r1",
		title: "30p Nghe nhạc & Cà phê thư giãn",
		cost: 20,
		icon: "☕"
	},
	{
		id: "r2",
		title: "45p Chơi Game / Xem Anime / Phim",
		cost: 40,
		icon: "🎮"
	},
	{
		id: "r3",
		title: "1 Chuyến Đi Ăn Kem / Trà Sữa",
		cost: 35,
		icon: "🍦"
	},
	{
		id: "r4",
		title: "Mua 1 Cuốn Sách Yêu Thích Mới",
		cost: 100,
		icon: "📖"
	},
	{
		id: "r5",
		title: "1 Buổi Tối Giải Trí Hoàn Toàn Tự Do",
		cost: 60,
		icon: "🎬"
	}
];
function emitConfetti(options) {
	if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
	confetti_module_default(options);
}
function RewardShopModal({ open, onOpenChange, coins, streakFreezeCount, customRewards = [], claimedRewards = [], onBuyStreakFreeze, onClaimReward, onAddCustomReward }) {
	const [newTitle, setNewTitle] = (0, import_react.useState)("");
	const [newCost, setNewCost] = (0, import_react.useState)("30");
	const [newIcon, setNewIcon] = (0, import_react.useState)("🎁");
	const [customRewardError, setCustomRewardError] = (0, import_react.useState)("");
	const allRewards = [...DEFAULT_PRESET_REWARDS, ...customRewards];
	const handleCreateCustom = (e) => {
		e.preventDefault();
		if (!newTitle.trim()) {
			setCustomRewardError("Vui lòng nhập tên phần thưởng.");
			toast.error("Vui lòng nhập tên phần thưởng!");
			return;
		}
		const costNum = Number(newCost);
		if (!Number.isFinite(costNum) || costNum < 5) {
			setCustomRewardError("Số xu phải là một số hữu hạn từ 5 trở lên.");
			toast.error("Số Xu đổi phải từ 5 Xu trở lên!");
			return;
		}
		onAddCustomReward({
			title: newTitle.trim(),
			cost: costNum,
			icon: newIcon || "🎁"
		});
		setNewTitle("");
		setNewCost("30");
		setCustomRewardError("");
		toast.success("Đã thêm phần thưởng tự chọn vào Cửa Hàng!");
	};
	const handleClaim = (r) => {
		if (coins < r.cost) {
			toast.error(`Bạn cần thêm ${r.cost - coins} Xu nữa để đổi phần thưởng này!`);
			return;
		}
		if (onClaimReward(r)) {
			emitConfetti({
				particleCount: 70,
				spread: 60,
				origin: { y: .6 }
			});
			toast.success(`🎉 Đã đổi thành công: "${r.title}"!`, { description: "Hãy tự thưởng cho bản thân một cách thoải mái không tội lỗi nhé!" });
		}
	};
	const handleBuyFreeze = () => {
		if (coins < 50) {
			toast.error(`Bạn cần 50 Xu để mua Thẻ bảo vệ chuỗi (hiện có: ${coins} Xu).`);
			return;
		}
		if (onBuyStreakFreeze()) {
			emitConfetti({
				particleCount: 50,
				spread: 50,
				origin: { y: .6 }
			});
			toast.success("🛡️ Đã mua 1 Thẻ bảo vệ chuỗi.", { description: "Thẻ giúp bảo vệ chuỗi ngày duy trì thói quen khi bạn có một ngày bận." });
		}
	};
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent, {
			className: "max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8",
			children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogHeader, {
				className: "mb-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex items-center gap-2 text-amber-600 font-semibold text-xs uppercase tracking-wider",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ShoppingBag, {
								size: 18,
								className: "text-amber-500"
							}, void 0, false, {
								fileName: _jsxFileName$1,
								lineNumber: 163,
								columnNumber: 15
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Cửa hàng phần thưởng" }, void 0, false, {
								fileName: _jsxFileName$1,
								lineNumber: 164,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$1,
							lineNumber: 162,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "flex items-center gap-2 rounded-2xl bg-amber-50 px-3.5 py-1.5 border border-amber-200/80 shadow-2xs",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Coins, {
								size: 18,
								className: "text-amber-500 fill-amber-400"
							}, void 0, false, {
								fileName: _jsxFileName$1,
								lineNumber: 167,
								columnNumber: 15
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "font-mono text-base font-bold text-amber-900",
								children: [coins, " Xu"]
							}, void 0, true, {
								fileName: _jsxFileName$1,
								lineNumber: 168,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$1,
							lineNumber: 166,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$1,
						lineNumber: 161,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle, {
						className: "font-serif text-2xl font-bold text-slate-800 flex items-center gap-2 mt-2",
						children: "Cửa Hàng Đổi Xu & Tự Thưởng"
					}, void 0, false, {
						fileName: _jsxFileName$1,
						lineNumber: 172,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogDescription, {
						className: "text-slate-600 text-sm",
						children: "Biến nỗ lực học tập thành phần thưởng thực tế. Biến thói quen thành niềm vui khao khát (Atomic Habits Rule #2 & #4)."
					}, void 0, false, {
						fileName: _jsxFileName$1,
						lineNumber: 175,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName$1,
				lineNumber: 160,
				columnNumber: 9
			}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Tabs, {
				defaultValue: "shop",
				className: "w-full mt-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsList, {
						className: "grid w-full grid-cols-2 rounded-2xl bg-slate-100 p-1",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsTrigger, {
							value: "shop",
							className: "rounded-xl text-xs font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Gift, {
								size: 14,
								className: "mr-1.5 text-amber-500"
							}, void 0, false, {
								fileName: _jsxFileName$1,
								lineNumber: 184,
								columnNumber: 15
							}, this), " Đổi Phần Thưởng"]
						}, void 0, true, {
							fileName: _jsxFileName$1,
							lineNumber: 183,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsTrigger, {
							value: "history",
							className: "rounded-xl text-xs font-semibold",
							children: [
								/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(History, {
									size: 14,
									className: "mr-1.5 text-indigo-500"
								}, void 0, false, {
									fileName: _jsxFileName$1,
									lineNumber: 187,
									columnNumber: 15
								}, this),
								" Lịch Sử Đổi (",
								claimedRewards.length,
								")"
							]
						}, void 0, true, {
							fileName: _jsxFileName$1,
							lineNumber: 186,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName$1,
						lineNumber: 182,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsContent, {
						value: "shop",
						className: "space-y-4 pt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 p-4 shadow-2xs",
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "flex items-start gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-2xs",
											children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ShieldCheck, { size: 22 }, void 0, false, {
												fileName: _jsxFileName$1,
												lineNumber: 198,
												columnNumber: 21
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName$1,
											lineNumber: 197,
											columnNumber: 19
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h3", {
													className: "font-bold text-rose-950 text-base",
													children: "Thẻ bảo vệ chuỗi"
												}, void 0, false, {
													fileName: _jsxFileName$1,
													lineNumber: 202,
													columnNumber: 23
												}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Badge, {
													variant: "outline",
													className: "border-rose-300 text-rose-700 bg-white text-[10px]",
													children: "Bảo vệ chuỗi"
												}, void 0, false, {
													fileName: _jsxFileName$1,
													lineNumber: 203,
													columnNumber: 23
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName$1,
												lineNumber: 201,
												columnNumber: 21
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
												className: "text-slate-600 text-xs mt-0.5",
												children: "Tránh mất chuỗi học tập khi lỡ đột xuất bị ốm hoặc bận việc. Tránh tâm lý nản lòng!"
											}, void 0, false, {
												fileName: _jsxFileName$1,
												lineNumber: 210,
												columnNumber: 21
											}, this),
											/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
												className: "mt-1.5 font-semibold text-xs text-rose-800",
												children: [
													"🛡️ Hiện có:",
													" ",
													/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
														className: "text-rose-900 font-bold",
														children: [streakFreezeCount, " Thẻ"]
													}, void 0, true, {
														fileName: _jsxFileName$1,
														lineNumber: 216,
														columnNumber: 23
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName$1,
												lineNumber: 214,
												columnNumber: 21
											}, this)
										] }, void 0, true, {
											fileName: _jsxFileName$1,
											lineNumber: 200,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName$1,
										lineNumber: 196,
										columnNumber: 17
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
										onClick: handleBuyFreeze,
										disabled: coins < 50,
										className: "shrink-0 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs h-10 px-4 shadow-2xs",
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Coins, {
											size: 14,
											className: "mr-1 text-amber-300 fill-amber-300"
										}, void 0, false, {
											fileName: _jsxFileName$1,
											lineNumber: 226,
											columnNumber: 19
										}, this), " 50 Xu / 1 Thẻ"]
									}, void 0, true, {
										fileName: _jsxFileName$1,
										lineNumber: 221,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$1,
									lineNumber: 195,
									columnNumber: 15
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName$1,
								lineNumber: 194,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h4", {
								className: "text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Sparkles, {
									size: 14,
									className: "text-amber-500"
								}, void 0, false, {
									fileName: _jsxFileName$1,
									lineNumber: 234,
									columnNumber: 17
								}, this), " Danh Sách Phần Thưởng Tự Thưởng"]
							}, void 0, true, {
								fileName: _jsxFileName$1,
								lineNumber: 233,
								columnNumber: 15
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
								children: allRewards.map((reward) => {
									const canAfford = coins >= reward.cost;
									return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: `rounded-2xl border p-3.5 transition-all flex flex-col justify-between gap-3 ${canAfford ? "border-amber-200/90 bg-amber-50/40 hover:bg-amber-50/90 hover:shadow-2xs" : "border-slate-200 bg-slate-50/60 opacity-80"}`,
										children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "flex items-start gap-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
												className: "text-2xl p-1 bg-white rounded-xl shadow-2xs border border-slate-100",
												children: reward.icon
											}, void 0, false, {
												fileName: _jsxFileName$1,
												lineNumber: 250,
												columnNumber: 25
											}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
												className: "flex-1 min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h5", {
													className: "font-bold text-slate-800 text-xs leading-snug break-words",
													children: reward.title
												}, void 0, false, {
													fileName: _jsxFileName$1,
													lineNumber: 254,
													columnNumber: 27
												}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
													className: "flex items-center gap-1 text-amber-700 font-mono text-xs font-bold mt-1",
													children: [
														/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Coins, {
															size: 12,
															className: "fill-amber-400 text-amber-500"
														}, void 0, false, {
															fileName: _jsxFileName$1,
															lineNumber: 258,
															columnNumber: 29
														}, this),
														" ",
														reward.cost,
														" Xu"
													]
												}, void 0, true, {
													fileName: _jsxFileName$1,
													lineNumber: 257,
													columnNumber: 27
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName$1,
												lineNumber: 253,
												columnNumber: 25
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName$1,
											lineNumber: 249,
											columnNumber: 23
										}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
											size: "sm",
											onClick: () => handleClaim(reward),
											disabled: !canAfford,
											className: `w-full rounded-xl text-xs font-semibold h-8 ${canAfford ? "bg-amber-500 hover:bg-amber-600 text-white shadow-2xs" : "bg-slate-200 text-slate-500 hover:bg-slate-200 cursor-not-allowed"}`,
											children: canAfford ? "🎁 Đổi Ngay" : `Thiếu ${reward.cost - coins} Xu`
										}, void 0, false, {
											fileName: _jsxFileName$1,
											lineNumber: 264,
											columnNumber: 23
										}, this)]
									}, reward.id, true, {
										fileName: _jsxFileName$1,
										lineNumber: 241,
										columnNumber: 21
									}, this);
								})
							}, void 0, false, {
								fileName: _jsxFileName$1,
								lineNumber: 237,
								columnNumber: 15
							}, this)] }, void 0, true, {
								fileName: _jsxFileName$1,
								lineNumber: 232,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 mt-4",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h4", {
									className: "text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Plus, {
										size: 14,
										className: "text-indigo-600"
									}, void 0, false, {
										fileName: _jsxFileName$1,
										lineNumber: 285,
										columnNumber: 17
									}, this), " Thêm Phần Thưởng Cá Nhân Mới"]
								}, void 0, true, {
									fileName: _jsxFileName$1,
									lineNumber: 284,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("form", {
									onSubmit: handleCreateCustom,
									className: "space-y-2.5",
									"aria-describedby": "custom-reward-error",
									noValidate: true,
									children: [
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", {
											id: "custom-reward-error",
											className: "text-xs text-destructive",
											role: "alert",
											children: customRewardError
										}, void 0, false, {
											fileName: _jsxFileName$1,
											lineNumber: 293,
											columnNumber: 17
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
											className: "grid grid-cols-1 sm:grid-cols-3 gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
												className: "sm:col-span-2",
												children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
													"aria-label": "Tên phần thưởng cá nhân",
													placeholder: "VD: Xem 1 tập phim anime...",
													value: newTitle,
													onChange: (e) => setNewTitle(e.target.value),
													className: "h-9 text-xs rounded-xl bg-white",
													"aria-invalid": !!customRewardError,
													"aria-describedby": "custom-reward-error"
												}, void 0, false, {
													fileName: _jsxFileName$1,
													lineNumber: 298,
													columnNumber: 21
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName$1,
												lineNumber: 297,
												columnNumber: 19
											}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
												className: "flex gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
													type: "number",
													"aria-label": "Số xu đổi phần thưởng",
													placeholder: "Số xu",
													value: newCost,
													onChange: (e) => setNewCost(e.target.value),
													className: "h-9 text-xs rounded-xl bg-white w-20 font-mono",
													min: 5,
													"aria-invalid": !!customRewardError,
													"aria-describedby": "custom-reward-error"
												}, void 0, false, {
													fileName: _jsxFileName$1,
													lineNumber: 309,
													columnNumber: 21
												}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("select", {
													"aria-label": "Biểu tượng phần thưởng",
													value: newIcon,
													onChange: (e) => setNewIcon(e.target.value),
													className: "min-h-11 text-sm rounded-xl bg-white border border-slate-200 px-2",
													children: [
														/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
															value: "🎁",
															children: "🎁"
														}, void 0, false, {
															fileName: _jsxFileName$1,
															lineNumber: 326,
															columnNumber: 23
														}, this),
														/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
															value: "☕",
															children: "☕"
														}, void 0, false, {
															fileName: _jsxFileName$1,
															lineNumber: 327,
															columnNumber: 23
														}, this),
														/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
															value: "🎮",
															children: "🎮"
														}, void 0, false, {
															fileName: _jsxFileName$1,
															lineNumber: 328,
															columnNumber: 23
														}, this),
														/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
															value: "🎬",
															children: "🎬"
														}, void 0, false, {
															fileName: _jsxFileName$1,
															lineNumber: 329,
															columnNumber: 23
														}, this),
														/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
															value: "🍦",
															children: "🍦"
														}, void 0, false, {
															fileName: _jsxFileName$1,
															lineNumber: 330,
															columnNumber: 23
														}, this),
														/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
															value: "📖",
															children: "📖"
														}, void 0, false, {
															fileName: _jsxFileName$1,
															lineNumber: 331,
															columnNumber: 23
														}, this),
														/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
															value: "🍕",
															children: "🍕"
														}, void 0, false, {
															fileName: _jsxFileName$1,
															lineNumber: 332,
															columnNumber: 23
														}, this),
														/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("option", {
															value: "🎧",
															children: "🎧"
														}, void 0, false, {
															fileName: _jsxFileName$1,
															lineNumber: 333,
															columnNumber: 23
														}, this)
													]
												}, void 0, true, {
													fileName: _jsxFileName$1,
													lineNumber: 320,
													columnNumber: 21
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName$1,
												lineNumber: 308,
												columnNumber: 19
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName$1,
											lineNumber: 296,
											columnNumber: 17
										}, this),
										/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
											type: "submit",
											variant: "outline",
											size: "sm",
											className: "w-full h-8 rounded-xl text-xs font-semibold border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50",
											children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Plus, {
												size: 13,
												className: "mr-1"
											}, void 0, false, {
												fileName: _jsxFileName$1,
												lineNumber: 343,
												columnNumber: 19
											}, this), " Lưu Vào Cửa Hàng"]
										}, void 0, true, {
											fileName: _jsxFileName$1,
											lineNumber: 337,
											columnNumber: 17
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName$1,
									lineNumber: 287,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName$1,
								lineNumber: 283,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName$1,
						lineNumber: 192,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(TabsContent, {
						value: "history",
						className: "pt-3",
						children: claimedRewards.length === 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Gift, { className: "mx-auto h-8 w-8 text-slate-300 mb-2" }, void 0, false, {
								fileName: _jsxFileName$1,
								lineNumber: 352,
								columnNumber: 17
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { children: "Bạn chưa đổi phần thưởng nào. Hãy chăm chỉ tích lũy Xu nhé!" }, void 0, false, {
								fileName: _jsxFileName$1,
								lineNumber: 353,
								columnNumber: 17
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName$1,
							lineNumber: 351,
							columnNumber: 15
						}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "space-y-2",
							children: claimedRewards.map((c) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 text-xs shadow-2xs",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "flex items-center gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CircleCheck, {
										size: 16,
										className: "text-emerald-500 shrink-0"
									}, void 0, false, {
										fileName: _jsxFileName$1,
										lineNumber: 363,
										columnNumber: 23
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "font-bold text-slate-800",
										children: c.title
									}, void 0, false, {
										fileName: _jsxFileName$1,
										lineNumber: 365,
										columnNumber: 25
									}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
										className: "text-[10px] text-slate-400",
										children: c.dateISO
									}, void 0, false, {
										fileName: _jsxFileName$1,
										lineNumber: 366,
										columnNumber: 25
									}, this)] }, void 0, true, {
										fileName: _jsxFileName$1,
										lineNumber: 364,
										columnNumber: 23
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName$1,
									lineNumber: 362,
									columnNumber: 21
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Badge, {
									variant: "outline",
									className: "border-amber-200 bg-amber-50 text-amber-800 font-mono text-[11px]",
									children: [
										"-",
										c.cost,
										" Xu"
									]
								}, void 0, true, {
									fileName: _jsxFileName$1,
									lineNumber: 369,
									columnNumber: 21
								}, this)]
							}, c.id, true, {
								fileName: _jsxFileName$1,
								lineNumber: 358,
								columnNumber: 19
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName$1,
							lineNumber: 356,
							columnNumber: 15
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName$1,
						lineNumber: 349,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName$1,
				lineNumber: 181,
				columnNumber: 9
			}, this)]
		}, void 0, true, {
			fileName: _jsxFileName$1,
			lineNumber: 159,
			columnNumber: 7
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName$1,
		lineNumber: 158,
		columnNumber: 5
	}, this);
}
var _jsxFileName = "/app/applet/src/components/TopBar.tsx";
var IDENTITY_TITLE_CHOICES = [
	"Sĩ Tử Kỷ Luật",
	"Kỹ Sư Tư Duy Bền Vững",
	"Người Tự Học Tự Chủ",
	"Chân Nhân Học Thuật",
	"Tân Binh Bứt Phá"
];
function TopBar({ level, xp, xpInLevel, coins, streak, studyStreak = 0, currentSubjects, onSubjectsUpdated, reminders = {}, today = {}, completedLessons = {}, shiftedDates = {}, onSetReminder, goals, weekStats, achievementPoints = 0, pointsInLevel = 0, onSetGoals, progress, habitDefinitions, onResetOnboarding, onOpenPushCenter, onTriggerPush, onBuyStreakFreeze, onClaimReward, onAddCustomReward, activeTimerLesson = null }) {
	const [isSettingsOpen, setIsSettingsOpen] = (0, import_react.useState)(false);
	const [settingsTab, setSettingsTab] = (0, import_react.useState)("pomodoro");
	const pwaInstall = usePwaInstall();
	const [isRewardShopOpen, setIsRewardShopOpen] = (0, import_react.useState)(false);
	const [workspaceTitle, setWorkspaceTitle] = (0, import_react.useState)(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("hocvien-workspace-title-v1");
			if (saved && saved.trim()) return saved.trim();
		}
		return "Học viên lớp 11";
	});
	const [isEditingTitle, setIsEditingTitle] = (0, import_react.useState)(false);
	const [tempTitle, setTempTitle] = (0, import_react.useState)(workspaceTitle);
	const [timerSnapshot, setTimerSnapshot] = (0, import_react.useState)(null);
	const [showTimerInHeader, setShowTimerInHeader] = (0, import_react.useState)(() => loadFocusPreferences().showTimerInHeader);
	const [identityTitle, setIdentityTitle] = (0, import_react.useState)(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("hocvien-identity-title-v1");
			if (saved && saved.trim()) return saved.trim();
		}
		return "";
	});
	const [isIdentityDialogOpen, setIsIdentityDialogOpen] = (0, import_react.useState)(false);
	const [identityDraft, setIdentityDraft] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const refreshPreferences = () => setShowTimerInHeader(loadFocusPreferences().showTimerInHeader);
		window.addEventListener(FOCUS_PREFERENCES_EVENT, refreshPreferences);
		window.addEventListener("storage", refreshPreferences);
		return () => {
			window.removeEventListener(FOCUS_PREFERENCES_EVENT, refreshPreferences);
			window.removeEventListener("storage", refreshPreferences);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const refreshTimer = () => setTimerSnapshot(activeTimerLesson ? getStoredTimerState() : null);
		refreshTimer();
		if (!activeTimerLesson) return;
		const interval = window.setInterval(refreshTimer, 1e3);
		return () => window.clearInterval(interval);
	}, [activeTimerLesson]);
	const timerHeaderLabel = (0, import_react.useMemo)(() => {
		if (!timerSnapshot) return null;
		if (timerSnapshot.status === "warmup_completed") return "Đã xong 2 phút";
		if (timerSnapshot.status === "session_waiting") return "Chờ phiên tiếp theo";
		if (timerSnapshot.status === "breaking") return "Đang nghỉ";
		const total = timerSnapshot.durationMinutes * 60;
		const remaining = Math.max(0, Math.ceil(total - calculateElapsedSeconds(timerSnapshot)));
		const minutes = Math.floor(remaining / 60);
		const seconds = String(remaining % 60).padStart(2, "0");
		return `${timerSnapshot.isRunning ? "Đang học" : "Tạm dừng"} · ${minutes}:${seconds}`;
	}, [timerSnapshot]);
	const levelInfo = (0, import_react.useMemo)(() => getLevelTitle(level), [level]);
	const handleSaveIdentityTitle = () => {
		setIdentityDraft(identityTitle || levelInfo.title);
		setIsIdentityDialogOpen(true);
	};
	const saveIdentityTitle = () => {
		const choices = [
			"Sĩ Tử Kỷ Luật",
			"Kỹ Sư Tư Duy Bền Vững",
			"Người Tự Học Tự Chủ",
			"Chân Nhân Học Thuật",
			"Tân Binh Bứt Phá"
		];
		const num = parseInt(identityDraft, 10);
		let finalTitle = identityDraft.trim();
		if (num >= 1 && num <= choices.length) finalTitle = choices[num - 1];
		if (finalTitle) {
			setIdentityTitle(finalTitle);
			if (typeof window !== "undefined") localStorage.setItem("hocvien-identity-title-v1", finalTitle);
			toast.success(`Đã cập nhật bản sắc: "${finalTitle}"`);
		}
		setIsIdentityDialogOpen(false);
	};
	const handleSaveTitle = () => {
		const trimmed = tempTitle.trim() || "Học viên lớp 11";
		setWorkspaceTitle(trimmed);
		setIsEditingTitle(false);
		if (typeof window !== "undefined") localStorage.setItem("hocvien-workspace-title-v1", trimmed);
	};
	const xpProgress = (0, import_react.useMemo)(() => getXpProgressInCurrentLevel(xp), [xp]);
	const pct = xpProgress.percentage;
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("header", {
		className: "mb-6 flex flex-wrap items-center gap-4 rounded-3xl bg-white/70 p-4 shadow-soft backdrop-blur",
		children: [
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-300 to-emerald-300 text-2xl shadow-soft",
					children: "🦉"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 207,
					columnNumber: 9
				}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
					children: "Chào bạn!"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 211,
					columnNumber: 11
				}, this), isEditingTitle ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "flex items-center gap-1 mt-0.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", {
							type: "text",
							"aria-label": "Tên không gian học tập",
							value: tempTitle,
							onChange: (e) => setTempTitle(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") handleSaveTitle();
								if (e.key === "Escape") setIsEditingTitle(false);
							},
							className: "h-8 rounded-lg border border-sky-300 bg-white px-2 font-serif text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-sky-400",
							autoFocus: true
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 216,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							onClick: handleSaveTitle,
							className: "p-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
							title: "Lưu tên",
							"aria-label": "Lưu tên không gian học tập",
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Check, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 234,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 228,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							onClick: () => setIsEditingTitle(false),
							className: "p-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200",
							title: "Hủy",
							"aria-label": "Hủy đổi tên không gian học tập",
							children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(X, { className: "h-4 w-4" }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 242,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 236,
							columnNumber: 15
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 215,
					columnNumber: 13
				}, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "group flex items-center gap-1.5 font-serif text-lg font-semibold text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: workspaceTitle }, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 247,
						columnNumber: 15
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
						onClick: () => {
							setTempTitle(workspaceTitle);
							setIsEditingTitle(true);
						},
						className: "p-1 text-slate-400 opacity-60 group-hover:opacity-100 hover:text-sky-600 transition-opacity",
						title: "Đổi tên không gian học tập",
						"aria-label": "Đổi tên không gian học tập",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Pencil, { className: "h-3.5 w-3.5" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 257,
							columnNumber: 17
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 248,
						columnNumber: 15
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 246,
					columnNumber: 13
				}, this)] }, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 210,
					columnNumber: 9
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 206,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "ml-auto flex flex-wrap items-center gap-2",
				children: [
					showTimerInHeader && activeTimerLesson && timerSnapshot && timerHeaderLabel && /* @__PURE__ */ (void 0)("div", {
						className: "flex max-w-[240px] items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900",
						role: "status",
						"aria-live": "polite",
						children: [/* @__PURE__ */ (void 0)(Clock3, { className: "h-4 w-4 shrink-0 text-rose-600" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 267,
							columnNumber: 13
						}, this), /* @__PURE__ */ (void 0)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (void 0)("span", {
								className: "block truncate font-semibold",
								children: activeTimerLesson.title
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 269,
								columnNumber: 15
							}, this), /* @__PURE__ */ (void 0)("span", {
								className: "block text-[11px] text-rose-700",
								children: timerHeaderLabel
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 270,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 268,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 266,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						id: "roadmap-import-trigger",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(CourseImportExportModal, {
							currentSubjects,
							onSubjectsUpdated,
							progress
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 275,
							columnNumber: 11
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 274,
						columnNumber: 9
					}, this),
					pwaInstall.canInstall && /* @__PURE__ */ (void 0)(Button, {
						size: "sm",
						variant: "outline",
						onClick: async () => {
							if (await pwaInstall.install()) toast.success("Đã cài ứng dụng lên thiết bị.");
						},
						className: "h-9 gap-1.5 rounded-2xl border-sky-200 bg-white text-xs font-semibold text-sky-800 hover:bg-sky-50",
						title: "Cài Smart Study Planner như một ứng dụng",
						children: [/* @__PURE__ */ (void 0)(Download, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 293,
							columnNumber: 13
						}, this), /* @__PURE__ */ (void 0)("span", {
							className: "hidden sm:inline",
							children: "Cài ứng dụng"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 294,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 283,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
						id: "reminder-settings-trigger",
						size: "sm",
						onClick: () => {
							setSettingsTab("reminders");
							setIsSettingsOpen(true);
						},
						className: "h-9 gap-1.5 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 text-slate-950 font-bold hover:brightness-105 transition shadow-soft text-xs",
						title: "Cấu hình lịch nhắc học",
						"aria-label": "Mở cài đặt nhắc học",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BellRing, { className: "h-4 w-4 text-slate-950" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 309,
							columnNumber: 11
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
							className: "hidden sm:inline",
							children: "Nhắc học"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 310,
							columnNumber: 11
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 298,
						columnNumber: 9
					}, this),
					/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
						size: "icon",
						variant: "ghost",
						className: "h-9 w-9 rounded-2xl bg-slate-100/80 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition border border-slate-200/80 shadow-xs ml-1",
						onClick: () => {
							setSettingsTab("pomodoro");
							setIsSettingsOpen(true);
						},
						title: "Cài đặt & Cảnh báo nhắc lịch",
						"aria-label": "Mở cài đặt",
						children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Settings, { className: "h-4 w-4" }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 324,
							columnNumber: 11
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 313,
						columnNumber: 9
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 264,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
				className: "w-full mt-1 border-t border-slate-100/80 pt-3",
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
					className: "grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex min-w-0 items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-50/90 to-emerald-50/90 p-2.5 border border-sky-100/80 shadow-2xs",
						children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
							onClick: handleSaveIdentityTitle,
							className: "flex min-w-[95px] flex-col items-center justify-center rounded-xl border border-sky-100 bg-white px-2.5 py-1 text-center shadow-2xs transition hover:bg-sky-50",
							title: "Nhấn để đổi Danh Hiệu Bản Sắc Cá Nhân (Atomic Habits Rule #5)",
							"aria-label": "Đổi danh hiệu bản sắc cá nhân",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex items-center gap-1 font-serif text-xs font-bold text-sky-800",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Sparkles, {
										size: 13,
										className: "text-amber-500 fill-amber-400"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 338,
										columnNumber: 17
									}, this),
									"Lv.",
									level
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 337,
								columnNumber: 15
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
								className: "max-w-[105px] truncate text-[10px] font-semibold text-indigo-700",
								title: identityTitle || levelInfo.title,
								children: identityTitle || levelInfo.title
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 341,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 331,
							columnNumber: 13
						}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "mb-1 flex justify-between text-[11px] font-semibold text-slate-700",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "text-sky-800 font-mono",
									children: [
										xpProgress.currentLevelXp,
										" / ",
										xpProgress.requiredLevelXp,
										" XP (",
										xpProgress.percentage,
										"%)"
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 350,
									columnNumber: 17
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
									className: "text-emerald-700 font-mono font-bold",
									children: [
										"Tổng ",
										xp,
										" XP"
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 353,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 349,
								columnNumber: 15
							}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "h-2.5 overflow-hidden rounded-full border border-slate-300/40 bg-slate-200/80 p-0.5",
								role: "progressbar",
								"aria-label": "Tiến độ XP cấp độ",
								"aria-valuemin": 0,
								"aria-valuemax": xpProgress.requiredLevelXp,
								"aria-valuenow": xpProgress.currentLevelXp,
								children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
									className: "h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 transition-all duration-500 shadow-2xs",
									style: { width: `${pct}%` }
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 363,
									columnNumber: 17
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 355,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 348,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 330,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex items-center gap-1.5 rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 font-semibold text-indigo-600",
								title: "Ngày học liên tiếp",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(BookOpen, {
										size: 16,
										className: "text-indigo-500"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 375,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: studyStreak }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 376,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "text-xs text-indigo-500",
										children: "ngày học"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 377,
										columnNumber: 15
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 371,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex items-center gap-1.5 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-1.5 font-semibold text-rose-600",
								title: "Chuỗi ngày duy trì thói quen",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DuotoneIcon, {
										icon: Flame,
										tone: "coral",
										size: 16
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 383,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: streak }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 384,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "text-xs text-rose-500",
										children: "thói quen"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 385,
										columnNumber: 15
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 379,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", {
								onClick: () => setIsRewardShopOpen(true),
								className: "flex items-center gap-1.5 rounded-2xl border border-amber-200/90 bg-amber-50 px-3 py-1.5 font-semibold text-amber-700 shadow-2xs transition hover:border-amber-300 hover:bg-amber-100",
								title: "Mở Cửa Hàng Đổi Xu và Tự Thưởng",
								"aria-label": "Mở cửa hàng đổi xu và tự thưởng",
								children: [
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DuotoneIcon, {
										icon: Coins,
										tone: "amber",
										size: 16
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 393,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "font-mono font-bold",
										children: coins
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 394,
										columnNumber: 15
									}, this),
									/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", {
										className: "text-[10px] text-amber-600",
										children: "Đổi quà"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 395,
										columnNumber: 15
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 387,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 370,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 329,
					columnNumber: 9
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 328,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RewardShopModal, {
				open: isRewardShopOpen,
				onOpenChange: setIsRewardShopOpen,
				coins,
				streakFreezeCount: progress.streakFreezeCount ?? 0,
				customRewards: progress.customRewards ?? [],
				claimedRewards: progress.claimedRewards ?? [],
				onBuyStreakFreeze: onBuyStreakFreeze || (() => false),
				onClaimReward: onClaimReward || (() => false),
				onAddCustomReward: onAddCustomReward || (() => {})
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 402,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SettingsModal, {
				isOpen: isSettingsOpen,
				onClose: () => setIsSettingsOpen(false),
				reminders,
				today,
				completedLessons,
				shiftedDates,
				onSetReminder: onSetReminder || (() => {}),
				goals,
				weekStats,
				level,
				achievementPoints,
				pointsInLevel,
				onSetGoals,
				subjects: currentSubjects,
				habitDefinitions,
				onResetOnboarding,
				onOpenPushCenter,
				onTriggerPush,
				initialTab: settingsTab,
				onOpenRoadmapData: () => document.querySelector("#roadmap-data-trigger-button")?.click()
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 415,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Dialog, {
				open: isIdentityDialogOpen,
				onOpenChange: setIsIdentityDialogOpen,
				children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent, {
					className: "max-w-md rounded-3xl",
					children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle, { children: "Danh hiệu bản sắc cá nhân" }, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 443,
						columnNumber: 13
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogDescription, {
						id: "identity-title-help",
						children: "Nhập một danh hiệu riêng hoặc chọn một gợi ý bên dưới. Bạn có thể đổi lại bất cứ lúc nào."
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 444,
						columnNumber: 13
					}, this)] }, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 442,
						columnNumber: 11
					}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("form", {
						className: "space-y-4",
						onSubmit: (event) => {
							event.preventDefault();
							saveIdentityTitle();
						},
						"aria-describedby": "identity-title-help",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, {
									htmlFor: "identity-title",
									children: "Danh hiệu"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 458,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, {
									id: "identity-title",
									value: identityDraft,
									onChange: (event) => setIdentityDraft(event.target.value),
									"aria-describedby": "identity-title-help",
									autoFocus: true
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 459,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 457,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex flex-wrap gap-2",
								"aria-label": "Gợi ý danh hiệu",
								children: IDENTITY_TITLE_CHOICES.map((choice) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => setIdentityDraft(choice),
									children: choice
								}, choice, false, {
									fileName: _jsxFileName,
									lineNumber: 469,
									columnNumber: 17
								}, this))
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 467,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", {
								className: "flex justify-end gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
									type: "button",
									variant: "outline",
									onClick: () => setIsIdentityDialogOpen(false),
									children: "Hủy"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 481,
									columnNumber: 15
								}, this), /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, {
									type: "submit",
									children: "Lưu danh hiệu"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 488,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 480,
								columnNumber: 13
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 449,
						columnNumber: 11
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 441,
					columnNumber: 9
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 440,
				columnNumber: 7
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 205,
		columnNumber: 5
	}, this);
}
//#endregion
export { TopBar };
