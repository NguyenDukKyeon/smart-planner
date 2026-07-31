import { f as weekdayFullVi, u as normalizeDateToISO } from "./date-utils-CFRHucsE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/custom-subjects-uE4AACuO.js
var RESET_ROLLBACK_KEY = "hocvien-reset-rollback-v1";
var FOCUS_TIMER_SESSION_ROLLBACK_KEY = "hocvien-focus-timer-session-rollback-v1";
var ARCHIVE_CATALOG_ROLLBACK_KEY = "hocvien-archive-catalog-rollback-v1";
var APP_OWNED_STORAGE_KEYS = [
	"hocvien-progress-v2",
	"hocvien-progress-v2-backup-before-v5",
	"hocvien-custom-subjects-v1",
	"hocvien-custom-subjects-backup-before-delete",
	"hocvien-archived-catalog-v1",
	"hocvien-focus-timer-v2",
	"hocvien-focus-preferences-v1",
	"hocvien-focus-timer-lock-v1",
	FOCUS_TIMER_SESSION_ROLLBACK_KEY,
	ARCHIVE_CATALOG_ROLLBACK_KEY,
	"hocvien-full-backup-before-import",
	"hocvien_push_preferences_v1",
	"hocvien_push_history_v1",
	"hocvien-workspace-title-v1",
	"hocvien-identity-title-v1",
	RESET_ROLLBACK_KEY
];
function unavailable(error) {
	return {
		ok: false,
		error: error instanceof Error ? error.message : "Bộ nhớ trình duyệt hiện không khả dụng."
	};
}
function getBrowserStorage() {
	try {
		if (typeof localStorage === "undefined") return null;
		return localStorage;
	} catch {
		return null;
	}
}
function loadStorage(key, decode, storage = getBrowserStorage()) {
	if (!storage) return {
		status: "unavailable",
		error: "Không thể truy cập bộ nhớ trình duyệt."
	};
	let raw;
	try {
		raw = storage.getItem(key);
	} catch (error) {
		const result = unavailable(error);
		return {
			status: "unavailable",
			error: result.ok ? "Không thể đọc bộ nhớ trình duyệt." : result.error
		};
	}
	if (raw == null) return { status: "missing" };
	try {
		const value = decode(raw);
		if (value == null) return {
			status: "invalid",
			raw,
			error: "Dữ liệu đã lưu không đúng cấu trúc."
		};
		return {
			status: "ok",
			value
		};
	} catch (error) {
		return {
			status: "invalid",
			raw,
			error: error instanceof Error ? error.message : "Dữ liệu đã lưu không thể đọc được."
		};
	}
}
/** Write the exact raw value, then prove that the browser retained that value. */
function writeRawVerified(key, raw, storage = getBrowserStorage()) {
	if (!storage) return {
		ok: false,
		error: "Không thể truy cập bộ nhớ trình duyệt."
	};
	try {
		if (raw == null) storage.removeItem(key);
		else storage.setItem(key, raw);
		if (storage.getItem(key) !== raw) return {
			ok: false,
			error: `Không thể xác nhận dữ liệu đã ghi cho ${key}.`
		};
		return { ok: true };
	} catch (error) {
		return unavailable(error);
	}
}
function writeJsonVerified(key, value, validate, storage = getBrowserStorage()) {
	let raw;
	try {
		raw = JSON.stringify(value);
	} catch (error) {
		return unavailable(error);
	}
	const written = writeRawVerified(key, raw, storage);
	if (!written.ok || !storage) return written;
	try {
		const confirmed = storage.getItem(key);
		if (confirmed == null || !validate(JSON.parse(confirmed))) return {
			ok: false,
			error: `Không thể xác nhận dữ liệu hợp lệ đã ghi cho ${key}.`
		};
		return { ok: true };
	} catch (error) {
		return unavailable(error);
	}
}
function captureRawSnapshot(keys, storage = getBrowserStorage()) {
	if (!storage) return {
		ok: false,
		error: "Không thể truy cập bộ nhớ trình duyệt."
	};
	const values = {};
	try {
		for (const key of keys) values[key] = storage.getItem(key);
		return {
			ok: true,
			snapshot: {
				version: 1,
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				values
			}
		};
	} catch (error) {
		const result = unavailable(error);
		return {
			ok: false,
			error: result.ok ? "Không thể đọc bộ nhớ trình duyệt." : result.error
		};
	}
}
function readRawSnapshot(key, storage = getBrowserStorage()) {
	return loadStorage(key, (raw) => {
		const candidate = JSON.parse(raw);
		if (candidate.version !== 1 || typeof candidate.createdAt !== "string" || !candidate.values || typeof candidate.values !== "object" || Array.isArray(candidate.values) || Object.values(candidate.values).some((value) => value !== null && typeof value !== "string")) return null;
		return candidate;
	}, storage);
}
function restoreRawSnapshot(snapshot, storage = getBrowserStorage()) {
	const errors = [];
	for (const key of Object.keys(snapshot.values).sort()) {
		const restored = writeRawVerified(key, snapshot.values[key], storage);
		if (!restored.ok) errors.push(`${key}: ${restored.error}`);
	}
	if (!storage) return {
		ok: false,
		error: "Storage is unavailable for rollback verification."
	};
	try {
		for (const key of Object.keys(snapshot.values).sort()) if (storage.getItem(key) !== snapshot.values[key]) errors.push(`Rollback verification failed for ${key}.`);
	} catch (error) {
		const failed = unavailable(error);
		errors.push(failed.ok ? "Rollback verification failed." : failed.error);
	}
	return errors.length > 0 ? {
		ok: false,
		error: errors.join(" ")
	} : { ok: true };
}
/**
* Commit a group of raw values only after a rollback snapshot was both written
* and read back.  Target order is caller-controlled and therefore auditable.
*/
function replaceRawValuesSafely(snapshotKey, targets, storage = getBrowserStorage()) {
	const duplicate = /* @__PURE__ */ new Set();
	if (targets.some(({ key }) => duplicate.has(key) || !duplicate.add(key))) return {
		ok: false,
		error: "Danh sách khoá ghi có phần tử trùng lặp."
	};
	if (targets.some(({ key }) => key === snapshotKey)) return {
		ok: false,
		error: "Snapshot key cannot also be a transaction target."
	};
	const captured = captureRawSnapshot(targets.map((target) => target.key), storage);
	if (!captured.ok) return captured;
	const storedSnapshot = writeJsonVerified(snapshotKey, captured.snapshot, isRawSnapshot, storage);
	if (!storedSnapshot.ok) return {
		ok: false,
		error: storedSnapshot.error,
		snapshot: captured.snapshot
	};
	for (const target of targets) {
		const written = writeRawVerified(target.key, target.raw, storage);
		if (written.ok) continue;
		const rolledBack = restoreRawSnapshot(captured.snapshot, storage);
		return rolledBack.ok ? {
			ok: false,
			error: written.error,
			snapshot: captured.snapshot
		} : {
			ok: false,
			error: written.error,
			snapshot: captured.snapshot,
			rollbackError: rolledBack.error
		};
	}
	return {
		ok: true,
		snapshot: captured.snapshot
	};
}
function restoreSnapshotFromKey(snapshotKey, storage = getBrowserStorage()) {
	const loaded = readRawSnapshot(snapshotKey, storage);
	if (loaded.status === "missing") return {
		ok: false,
		error: "Không có bản khôi phục."
	};
	if (loaded.status === "invalid") return {
		ok: false,
		error: loaded.error
	};
	if (loaded.status === "unavailable") return {
		ok: false,
		error: loaded.error
	};
	return restoreRawSnapshot(loaded.value, storage);
}
function factoryResetOwnedStorage(storage = getBrowserStorage()) {
	return replaceRawValuesSafely(RESET_ROLLBACK_KEY, APP_OWNED_STORAGE_KEYS.filter((key) => key !== RESET_ROLLBACK_KEY).map((key) => ({
		key,
		raw: null
	})), storage);
}
function isRawSnapshot(value) {
	if (!value || typeof value !== "object") return false;
	const candidate = value;
	return candidate.version === 1 && typeof candidate.createdAt === "string" && Boolean(candidate.values) && typeof candidate.values === "object" && !Array.isArray(candidate.values) && Object.values(candidate.values).every((item) => item === null || typeof item === "string");
}
var SAMPLE_IMPORT_ROWS = [
	{
		subject_id: "toan",
		subject_name: "Toán",
		topic: "Chương 1: Hàm số lượng giác",
		lesson_id: "toan-ham-so-1",
		lesson_name: "Bài 1: Góc lượng giác",
		target_minutes: 45,
		planned_date: "2026-08-01",
		xp_reward: 30
	},
	{
		subject_id: "vat-ly",
		subject_name: "Vật lý",
		topic: "Chương 1: Dao động",
		lesson_id: "vat-ly-dao-dong-1",
		lesson_name: "Bài 1: Dao động điều hòa",
		target_minutes: 60,
		planned_date: "2026-08-02",
		xp_reward: 40
	},
	{
		subject_id: "hoa-hoc",
		subject_name: "Hóa học",
		topic: "Chương 1: Cân bằng hóa học",
		lesson_id: "hoa-can-bang-1",
		lesson_name: "Bài 1: Khái niệm cân bằng",
		target_minutes: 45,
		planned_date: "2026-08-03",
		xp_reward: 30
	},
	{
		subject_id: "tieng-anh",
		subject_name: "Tiếng Anh",
		topic: "Unit 1: A long and healthy life",
		lesson_id: "anh-unit-1-tu-vung",
		lesson_name: "Từ vựng trọng tâm",
		target_minutes: 30,
		planned_date: "2026-08-04",
		xp_reward: 20
	}
];
var SAMPLE_CSV_CONTENT = ["subject_id,subject_name,topic,lesson_id,lesson_name,target_minutes,planned_date,xp_reward", ...SAMPLE_IMPORT_ROWS.map((row) => [
	row.subject_id,
	row.subject_name,
	row.topic,
	row.lesson_id,
	row.lesson_name,
	row.target_minutes,
	row.planned_date,
	row.xp_reward
].map((value) => `"${String(value).replaceAll("\"", "\"\"")}"`).join(","))].join("\n");
var SAMPLE_JSON_CONTENT = JSON.stringify(SAMPLE_IMPORT_ROWS, null, 2);
function downloadFile(filename, content, mimeType) {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
function parseCsvLine(line) {
	const values = [];
	let value = "";
	let quoted = false;
	for (let index = 0; index < line.length; index += 1) {
		const char = line[index];
		if (char === "\"") if (quoted && line[index + 1] === "\"") {
			value += "\"";
			index += 1;
		} else quoted = !quoted;
		else if (char === "," && !quoted) {
			values.push(value.trim());
			value = "";
		} else value += char;
	}
	values.push(value.trim());
	return values;
}
function inferTopicFromTitle(title) {
	if (!title.includes(" - ")) return void 0;
	const [prefix] = title.split(" - ");
	const normalized = prefix.toLowerCase();
	return normalized.includes("chương") || normalized.includes("unit") || normalized.includes("chủ đề") ? prefix.trim() : void 0;
}
function parsePositiveNumber(raw, fallback, row, label, issues) {
	if (raw == null || String(raw).trim() === "") return fallback;
	const value = Number(raw);
	if (!Number.isFinite(value) || value <= 0) {
		issues.push({
			row,
			message: `${label} phải là số lớn hơn 0.`
		});
		return fallback;
	}
	return Math.round(value);
}
function normalizeImportedDate(raw, row, issues) {
	if (raw == null || String(raw).trim() === "") return "";
	const normalized = normalizeDateToISO(raw);
	if (!normalized) issues.push({
		row,
		message: "Ngày dự kiến không hợp lệ."
	});
	return normalized;
}
function parseCSVInputWithDiagnostics(csvText) {
	const lines = csvText.replace(/^\uFEFF/, "").split(/\r?\n/).map((line, index) => ({
		text: line.trim(),
		row: index + 1
	})).filter((line) => line.text.length > 0);
	if (lines.length < 2) return {
		items: [],
		issues: [{
			row: 1,
			message: "File CSV cần có hàng tiêu đề và ít nhất một dòng dữ liệu."
		}],
		totalRows: 0
	};
	const headerCols = parseCsvLine(lines[0].text).map((column) => column.trim().toLowerCase());
	const subjectIdIdx = headerCols.findIndex((header) => header === "subject_id");
	const lessonIdIdx = headerCols.findIndex((header) => header === "lesson_id");
	const subjectIdx = headerCols.findIndex((header) => header.includes("môn") || header === "subject" || header === "subject_name");
	const topicIdx = headerCols.findIndex((header) => [
		"chủ đề",
		"topic",
		"chương",
		"chuyen de",
		"phần"
	].some((term) => header.includes(term)));
	let titleIdx = headerCols.findIndex((header) => header === "lesson_name");
	if (titleIdx === -1) titleIdx = headerCols.findIndex((header) => header.includes("bài") || header.includes("tên bài") || header === "title" || header === "name");
	const minutesIdx = headerCols.findIndex((header) => header === "target_minutes" || header.includes("phút") || header.includes("thời gian") || header === "minutes");
	const dateIdx = headerCols.findIndex((header) => header === "planned_date" || header.includes("ngày") || header === "date");
	const xpIdx = headerCols.findIndex((header) => header === "xp_reward" || header.includes("xp") || header.includes("điểm"));
	const hasHeader = subjectIdx !== -1 || titleIdx !== -1 || topicIdx !== -1 || dateIdx !== -1;
	const sourceLines = hasHeader ? lines.slice(1) : lines;
	const issues = [];
	const items = [];
	for (const source of sourceLines) {
		const columns = parseCsvLine(source.text);
		const subject = String(hasHeader ? columns[subjectIdx] ?? "" : columns[0] ?? "").trim();
		const topic = String(hasHeader && topicIdx !== -1 ? columns[topicIdx] ?? "" : hasHeader ? "" : columns.length >= 6 ? columns[1] ?? "" : "").trim();
		const title = String(hasHeader ? columns[titleIdx] ?? "" : columns.length >= 6 ? columns[2] ?? "" : columns[1] ?? "").trim();
		if (!subject) {
			issues.push({
				row: source.row,
				message: "Thiếu subject_name (tên môn học)."
			});
			continue;
		}
		if (!title) {
			issues.push({
				row: source.row,
				message: "Thiếu lesson_name (tên bài học)."
			});
			continue;
		}
		const minutesRaw = hasHeader && minutesIdx !== -1 ? columns[minutesIdx] : columns.length >= 6 ? columns[3] : columns[2];
		const dateRaw = hasHeader && dateIdx !== -1 ? columns[dateIdx] : columns.length >= 6 ? columns[4] : columns[3];
		const xpRaw = hasHeader && xpIdx !== -1 ? columns[xpIdx] : columns.length >= 6 ? columns[5] : columns[4];
		items.push({
			subjectId: hasHeader && subjectIdIdx !== -1 ? columns[subjectIdIdx]?.trim() || void 0 : void 0,
			lessonId: hasHeader && lessonIdIdx !== -1 ? columns[lessonIdIdx]?.trim() || void 0 : void 0,
			subject,
			topic: topic || inferTopicFromTitle(title),
			title,
			estimatedMinutes: parsePositiveNumber(minutesRaw, 45, source.row, "target_minutes", issues),
			scheduledDate: normalizeImportedDate(dateRaw, source.row, issues),
			xp: parsePositiveNumber(xpRaw, 30, source.row, "xp_reward", issues)
		});
	}
	return {
		items,
		issues,
		totalRows: sourceLines.length
	};
}
function parseJSONInputWithDiagnostics(jsonText) {
	let parsed;
	try {
		parsed = JSON.parse(jsonText);
	} catch {
		return {
			items: [],
			issues: [{
				row: 1,
				message: "JSON không hợp lệ."
			}],
			totalRows: 0
		};
	}
	if (!Array.isArray(parsed)) return {
		items: [],
		issues: [{
			row: 1,
			message: "JSON phải là một mảng bài học."
		}],
		totalRows: 0
	};
	const items = [];
	const issues = [];
	parsed.forEach((unknownItem, index) => {
		const row = index + 1;
		if (!unknownItem || typeof unknownItem !== "object" || Array.isArray(unknownItem)) {
			issues.push({
				row,
				message: "Mỗi phần tử phải là một object bài học."
			});
			return;
		}
		const item = unknownItem;
		const subjectId = String(item.subject_id || item.subjectId || "").trim();
		const lessonId = String(item.lesson_id || item.lessonId || "").trim();
		const subject = String(item.subject_name || item.subject || item.mon_hoc || "").trim();
		const title = String(item.lesson_name || item.title || item.ten_bai || item.name || "").trim();
		if (!subject) {
			issues.push({
				row,
				message: "Thiếu subject_name (tên môn học)."
			});
			return;
		}
		if (!title) {
			issues.push({
				row,
				message: "Thiếu lesson_name (tên bài học)."
			});
			return;
		}
		let topic = String(item.topic || item.chu_de || item.chuDe || item.chuong || item.milestone || item.category || "").trim();
		if (!topic) topic = inferTopicFromTitle(title) || "";
		items.push({
			subjectId: subjectId || void 0,
			lessonId: lessonId || void 0,
			subject,
			topic: topic || void 0,
			title,
			estimatedMinutes: parsePositiveNumber(item.target_minutes ?? item.estimatedMinutes ?? item.so_phut, 45, row, "target_minutes", issues),
			scheduledDate: normalizeImportedDate(item.planned_date ?? item.scheduledDate ?? item.ngay_bat_dau ?? item.date, row, issues),
			xp: parsePositiveNumber(item.xp_reward ?? item.xp, 30, row, "xp_reward", issues)
		});
	});
	return {
		items,
		issues,
		totalRows: parsed.length
	};
}
var EMOJI_MAP = {
	Toán: "📐",
	"Vật lý": "⚛️",
	Lý: "⚛️",
	"Hóa học": "🧪",
	Hóa: "🧪",
	"Sinh học": "🧬",
	"Ngoại ngữ": "🇬🇧",
	"Tiếng Anh": "🇬🇧",
	"Ngữ văn": "📚",
	Văn: "📚",
	"Lịch sử": "🏛️",
	"Địa lý": "🌍",
	"Tin học": "💻"
};
function convertRawToSubjects(items) {
	if (!items.length) return [];
	const subjectMap = /* @__PURE__ */ new Map();
	items.forEach((item) => {
		const subjectName = item.subject || "Môn học khác";
		const list = subjectMap.get(subjectName) || [];
		list.push(item);
		subjectMap.set(subjectName, list);
	});
	const subjects = [];
	subjectMap.forEach((rawLessons, subjectName) => {
		const subId = rawLessons.find((item) => item.subjectId)?.subjectId || slugify(subjectName) || "custom";
		const emoji = EMOJI_MAP[subjectName] || "📖";
		const resolveTopicName = (item) => {
			let topicName = (item.topic || "").trim();
			if (!topicName && item.title.includes(" - ")) {
				const parts = item.title.split(" - ");
				if (parts.length >= 2 && (parts[0].toLowerCase().includes("chương") || parts[0].toLowerCase().includes("unit") || parts[0].toLowerCase().includes("chủ đề"))) topicName = parts[0].trim();
			}
			return topicName || "Toàn bộ bài học";
		};
		const legacyIndexByLesson = /* @__PURE__ */ new Map();
		const legacyTopicGroups = /* @__PURE__ */ new Map();
		for (const item of rawLessons) {
			const topicName = resolveTopicName(item);
			const list = legacyTopicGroups.get(topicName) || [];
			list.push(item);
			legacyTopicGroups.set(topicName, list);
		}
		legacyTopicGroups.forEach((topicLessons) => {
			[...topicLessons].sort((a, b) => (a.scheduledDate || "").localeCompare(b.scheduledDate || "")).forEach((item, index) => legacyIndexByLesson.set(item, index));
		});
		const topicBlocks = [];
		for (const item of rawLessons) {
			const topicName = resolveTopicName(item);
			const current = topicBlocks.at(-1);
			if (current?.title === topicName) current.lessons.push(item);
			else topicBlocks.push({
				title: topicName,
				lessons: [item]
			});
		}
		const milestones = topicBlocks.map((block, blockIndex) => {
			const lessons = block.lessons.map((item) => {
				const lessonDate = item.scheduledDate || "";
				return {
					id: stableImportedLessonId(item, legacyIndexByLesson.get(item) ?? 0),
					title: item.title,
					topic: block.title === "Toàn bộ bài học" ? item.topic || void 0 : block.title,
					xp: item.xp || 30,
					plannedDurationMinutes: clampMinutes(item.estimatedMinutes),
					scheduledDate: lessonDate,
					weekday: lessonDate ? weekdayFullVi(lessonDate) : "",
					sourceSubject: subjectName,
					week: 1,
					initialDone: false
				};
			});
			return {
				id: `${subId}-topic-${slugify(block.title) || blockIndex + 1}-${blockIndex + 1}`,
				title: block.title,
				subtitle: `${lessons.length} bài học`,
				lessons
			};
		});
		subjects.push({
			id: subId,
			name: subjectName,
			emoji,
			milestones
		});
	});
	return subjects;
}
function addCustomLessonToSubjects(existingSubjects, rawLesson) {
	const subjects = [...existingSubjects];
	const subjectName = rawLesson.subject.trim();
	const topicName = (rawLesson.topic || "").trim();
	const subId = slugify(subjectName) || "custom";
	const emoji = EMOJI_MAP[subjectName] || "📖";
	const lessonId = createCatalogId(`lesson-${subId}`);
	const lessonDate = rawLesson.scheduledDate || "";
	const newLesson = {
		id: lessonId,
		title: rawLesson.title.trim(),
		topic: topicName || void 0,
		xp: rawLesson.xp || 30,
		plannedDurationMinutes: clampMinutes(rawLesson.estimatedMinutes),
		scheduledDate: lessonDate,
		weekday: lessonDate ? weekdayFullVi(lessonDate) : "",
		sourceSubject: subjectName,
		week: 1,
		initialDone: false,
		habitAnchor: rawLesson.habitAnchor?.trim() || void 0
	};
	let subjectObj = subjects.find((s) => s.name.toLowerCase() === subjectName.toLowerCase() || s.id === subId);
	if (!subjectObj) {
		const milestoneTitle = topicName || "Toàn bộ bài học";
		subjectObj = {
			id: subId,
			name: subjectName,
			emoji,
			milestones: [{
				id: `${subId}-milestone-1`,
				title: milestoneTitle,
				subtitle: "1 bài học",
				lessons: [newLesson]
			}]
		};
		subjects.push(subjectObj);
	} else {
		const milestones = [...subjectObj.milestones];
		const targetTopicTitle = topicName || "Toàn bộ bài học";
		const mIdx = milestones.findIndex((m) => m.title.toLowerCase() === targetTopicTitle.toLowerCase());
		if (mIdx !== -1) {
			const targetM = { ...milestones[mIdx] };
			targetM.lessons = [...targetM.lessons, newLesson];
			targetM.subtitle = `${targetM.lessons.length} bài học`;
			milestones[mIdx] = targetM;
		} else milestones.push({
			id: createCatalogId(`${subId}-topic`),
			title: targetTopicTitle,
			subtitle: "1 bài học",
			lessons: [newLesson]
		});
		subjectObj = {
			...subjectObj,
			milestones
		};
		const idx = subjects.findIndex((s) => s.id === subjectObj.id);
		if (idx !== -1) subjects[idx] = subjectObj;
	}
	saveStoredCustomSubjects(subjects);
	return subjects;
}
function createCatalogId(prefix) {
	return `${prefix}-${typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`}`;
}
function slugify(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function stableImportedLessonId(item, index) {
	if (item.lessonId?.trim()) return item.lessonId.trim();
	const source = `${item.subject}|${item.title}|${item.scheduledDate}|${index}`;
	let hash = 2166136261;
	for (let i = 0; i < source.length; i++) {
		hash ^= source.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return `lesson-${slugify(item.subject) || "custom"}-${(hash >>> 0).toString(36)}`;
}
function clampMinutes(value) {
	return Math.min(240, Math.max(10, Math.round(value ?? 90)));
}
function normalizeSubjects(value) {
	if (!Array.isArray(value)) return null;
	const result = [];
	for (const rawSubject of value) {
		if (!rawSubject || typeof rawSubject !== "object") continue;
		const subject = rawSubject;
		if (typeof subject.id !== "string" || typeof subject.name !== "string") continue;
		const milestones = Array.isArray(subject.milestones) ? subject.milestones.map((milestone) => ({
			...milestone,
			lessons: Array.isArray(milestone.lessons) ? milestone.lessons.map((lesson) => ({
				...lesson,
				topic: typeof lesson.topic === "string" ? lesson.topic : void 0,
				plannedDurationMinutes: clampMinutes(lesson.plannedDurationMinutes ?? lesson.estimatedMinutes)
			})) : []
		})) : [];
		result.push({
			id: subject.id,
			name: subject.name,
			emoji: typeof subject.emoji === "string" ? subject.emoji : "📖",
			milestones
		});
	}
	return result;
}
function addSubjectToSubjects(existingSubjects, name, emoji = "📖") {
	const normalizedName = name.trim();
	if (!normalizedName) return existingSubjects;
	if (existingSubjects.some((subject) => subject.name.toLowerCase() === normalizedName.toLowerCase())) return existingSubjects;
	const idBase = slugify(normalizedName) || "subject";
	const next = [...existingSubjects, {
		id: createCatalogId(idBase),
		name: normalizedName,
		emoji: emoji.trim() || "📖",
		milestones: [{
			id: createCatalogId(`${idBase}-lessons`),
			title: "Toàn bộ bài học",
			subtitle: "0 bài học",
			lessons: []
		}]
	}];
	saveStoredCustomSubjects(next);
	return next;
}
function removeSubjectFromSubjects(existingSubjects, subjectId) {
	saveCatalogBackup(existingSubjects);
	const next = existingSubjects.filter((subject) => subject.id !== subjectId);
	saveStoredCustomSubjects(next);
	return next;
}
function removeLessonFromSubjects(existingSubjects, lessonId) {
	saveCatalogBackup(existingSubjects);
	const next = existingSubjects.map((subject) => ({
		...subject,
		milestones: subject.milestones.map((milestone) => {
			const lessons = milestone.lessons.filter((lesson) => lesson.id !== lessonId);
			return {
				...milestone,
				lessons,
				subtitle: `${lessons.length} bài học`
			};
		})
	}));
	saveStoredCustomSubjects(next);
	return next;
}
function removeLessonsFromSubjects(existingSubjects, lessonIds) {
	const selected = new Set(lessonIds);
	if (selected.size === 0) return existingSubjects;
	saveCatalogBackup(existingSubjects);
	const next = existingSubjects.map((subject) => ({
		...subject,
		milestones: subject.milestones.map((milestone) => {
			const lessons = milestone.lessons.filter((lesson) => !selected.has(lesson.id));
			return {
				...milestone,
				lessons,
				subtitle: `${lessons.length} bài học`
			};
		})
	}));
	saveStoredCustomSubjects(next);
	return next;
}
var CUSTOM_SUBJECTS_KEY = "hocvien-custom-subjects-v1";
var CUSTOM_SUBJECTS_BACKUP_KEY = "hocvien-custom-subjects-backup-before-delete";
var ARCHIVED_CATALOG_KEY = "hocvien-archived-catalog-v1";
function rememberCatalogStorageResult(result) {
	result.ok || result.error;
	return result;
}
function updateSubjectDetails(existingSubjects, subjectId, patch) {
	const next = existingSubjects.map((subject) => {
		if (subject.id !== subjectId) return subject;
		const name = patch.name?.trim() || subject.name;
		return {
			...subject,
			name,
			emoji: patch.emoji?.trim() || subject.emoji,
			milestones: subject.milestones.map((milestone) => ({
				...milestone,
				lessons: milestone.lessons.map((lesson) => ({
					...lesson,
					sourceSubject: name
				}))
			}))
		};
	});
	saveStoredCustomSubjects(next);
	return next;
}
function updateLessonDetails(existingSubjects, lessonId, patch) {
	const normalizeLesson = (lesson, subjectName) => {
		const scheduledDate = typeof patch.scheduledDate === "string" ? patch.scheduledDate : lesson.scheduledDate;
		const requestedTopic = typeof patch.topic === "string" ? patch.topic.trim() : void 0;
		return {
			...lesson,
			title: patch.title?.trim() || lesson.title,
			topic: typeof patch.topic === "string" ? requestedTopic || "Chưa phân loại" : lesson.topic,
			plannedDurationMinutes: typeof patch.plannedDurationMinutes === "number" ? clampMinutes(patch.plannedDurationMinutes) : lesson.plannedDurationMinutes,
			xp: typeof patch.xp === "number" ? Math.min(1e3, Math.max(0, Math.round(patch.xp))) : lesson.xp,
			scheduledDate,
			weekday: scheduledDate ? weekdayFullVi(scheduledDate) : "",
			sourceSubject: subjectName
		};
	};
	const next = existingSubjects.map((subject) => {
		const sourceMilestone = subject.milestones.find((milestone) => milestone.lessons.some((lesson) => lesson.id === lessonId));
		if (!sourceMilestone) return subject;
		const sourceLesson = sourceMilestone.lessons.find((lesson) => lesson.id === lessonId);
		if (!sourceLesson) return subject;
		const updatedLesson = normalizeLesson(sourceLesson, subject.name);
		if (typeof patch.topic !== "string") return {
			...subject,
			milestones: subject.milestones.map((milestone) => ({
				...milestone,
				lessons: milestone.lessons.map((lesson) => lesson.id === lessonId ? updatedLesson : lesson)
			}))
		};
		const targetTitle = patch.topic.trim() || "Chưa phân loại";
		let targetFound = false;
		const milestones = subject.milestones.map((milestone) => {
			const lessons = milestone.lessons.filter((lesson) => lesson.id !== lessonId);
			if (milestone.title.localeCompare(targetTitle, "vi", { sensitivity: "base" }) === 0) {
				targetFound = true;
				const withUpdated = [...lessons, {
					...updatedLesson,
					topic: targetTitle
				}];
				return {
					...milestone,
					lessons: withUpdated,
					subtitle: `${withUpdated.length} bài học`
				};
			}
			return {
				...milestone,
				lessons,
				subtitle: `${lessons.length} bài học`
			};
		});
		if (!targetFound) milestones.push({
			id: createCatalogId(`${subject.id}-topic-${slugify(targetTitle) || "uncategorized"}`),
			title: targetTitle,
			subtitle: "1 bài học",
			lessons: [{
				...updatedLesson,
				topic: targetTitle
			}]
		});
		return {
			...subject,
			milestones
		};
	});
	saveStoredCustomSubjects(next);
	return next;
}
function moveLessonToSubject(existingSubjects, lessonId, targetSubjectId) {
	let moving = null;
	const without = existingSubjects.map((subject) => ({
		...subject,
		milestones: subject.milestones.map((milestone) => {
			const lessons = milestone.lessons.filter((lesson) => {
				if (lesson.id !== lessonId) return true;
				moving = lesson;
				return false;
			});
			return {
				...milestone,
				lessons,
				subtitle: `${lessons.length} bài học`
			};
		})
	}));
	if (!moving) return existingSubjects;
	const next = without.map((subject) => {
		if (subject.id !== targetSubjectId) return subject;
		const lesson = {
			...moving,
			sourceSubject: subject.name
		};
		const milestones = subject.milestones.length > 0 ? subject.milestones.map((milestone, index) => index === 0 ? {
			...milestone,
			lessons: [...milestone.lessons, lesson],
			subtitle: `${milestone.lessons.length + 1} bài học`
		} : milestone) : [{
			id: createCatalogId(`${subject.id}-lessons`),
			title: "Toàn bộ bài học",
			subtitle: "1 bài học",
			lessons: [lesson]
		}];
		return {
			...subject,
			milestones
		};
	});
	saveStoredCustomSubjects(next);
	return next;
}
function moveLessonsToSubject(existingSubjects, lessonIds, targetSubjectId) {
	const selected = new Set(lessonIds);
	if (selected.size === 0) return existingSubjects;
	const target = existingSubjects.find((subject) => subject.id === targetSubjectId);
	if (!target) return existingSubjects;
	const moving = [];
	const without = existingSubjects.map((subject) => ({
		...subject,
		milestones: subject.milestones.map((milestone) => {
			const lessons = milestone.lessons.filter((lesson) => {
				if (!selected.has(lesson.id)) return true;
				moving.push({
					...lesson,
					sourceSubject: target.name
				});
				return false;
			});
			return {
				...milestone,
				lessons,
				subtitle: `${lessons.length} bài học`
			};
		})
	}));
	if (moving.length === 0) return existingSubjects;
	const next = without.map((subject) => {
		if (subject.id !== targetSubjectId) return subject;
		const milestones = subject.milestones.length ? subject.milestones.map((milestone, index) => index === 0 ? {
			...milestone,
			lessons: [...milestone.lessons, ...moving],
			subtitle: `${milestone.lessons.length + moving.length} bài học`
		} : milestone) : [{
			id: createCatalogId(`${subject.id}-lessons`),
			title: "Toàn bộ bài học",
			subtitle: `${moving.length} bài học`,
			lessons: moving
		}];
		return {
			...subject,
			milestones
		};
	});
	saveCatalogBackup(existingSubjects);
	saveStoredCustomSubjects(next);
	return next;
}
function moveLessonsToTopic(existingSubjects, lessonIds, targetSubjectId, targetTopicId) {
	const selected = new Set(lessonIds);
	if (selected.size === 0) return existingSubjects;
	const targetSubject = existingSubjects.find((subject) => subject.id === targetSubjectId);
	const targetTopic = targetSubject?.milestones.find((milestone) => milestone.id === targetTopicId);
	if (!targetSubject || !targetTopic) return existingSubjects;
	const moving = [];
	const without = existingSubjects.map((subject) => ({
		...subject,
		milestones: subject.milestones.map((milestone) => {
			const lessons = milestone.lessons.filter((lesson) => {
				if (!selected.has(lesson.id)) return true;
				moving.push({
					...lesson,
					sourceSubject: targetSubject.name,
					topic: targetTopic.title
				});
				return false;
			});
			return {
				...milestone,
				lessons,
				subtitle: `${lessons.length} bài học`
			};
		})
	}));
	if (moving.length === 0) return existingSubjects;
	const next = without.map((subject) => {
		if (subject.id !== targetSubjectId) return subject;
		return {
			...subject,
			milestones: subject.milestones.map((milestone) => {
				if (milestone.id !== targetTopicId) return milestone;
				const lessons = [...milestone.lessons, ...moving];
				return {
					...milestone,
					lessons,
					subtitle: `${lessons.length} bài học`
				};
			})
		};
	});
	saveCatalogBackup(existingSubjects);
	saveStoredCustomSubjects(next);
	return next;
}
function updateLessonsDetails(existingSubjects, lessonIds, patch) {
	const selected = new Set(lessonIds);
	if (selected.size === 0) return existingSubjects;
	const next = existingSubjects.map((subject) => ({
		...subject,
		milestones: subject.milestones.map((milestone) => ({
			...milestone,
			lessons: milestone.lessons.map((lesson) => {
				if (!selected.has(lesson.id)) return lesson;
				const scheduledDate = typeof patch.scheduledDate === "string" ? patch.scheduledDate : lesson.scheduledDate;
				return {
					...lesson,
					plannedDurationMinutes: typeof patch.plannedDurationMinutes === "number" ? clampMinutes(patch.plannedDurationMinutes) : lesson.plannedDurationMinutes,
					scheduledDate,
					weekday: scheduledDate ? weekdayFullVi(scheduledDate) : ""
				};
			})
		}))
	}));
	saveCatalogBackup(existingSubjects);
	saveStoredCustomSubjects(next);
	return next;
}
function duplicateLessonInSubjects(existingSubjects, lessonId) {
	const next = existingSubjects.map((subject) => ({
		...subject,
		milestones: subject.milestones.map((milestone) => {
			const index = milestone.lessons.findIndex((lesson) => lesson.id === lessonId);
			if (index < 0) return milestone;
			const source = milestone.lessons[index];
			const duplicate = {
				...source,
				id: createCatalogId(`lesson-${slugify(subject.name) || "custom"}`),
				title: `${source.title} (bản sao)`,
				initialDone: false
			};
			const lessons = [...milestone.lessons];
			lessons.splice(index + 1, 0, duplicate);
			return {
				...milestone,
				lessons,
				subtitle: `${lessons.length} bài học`
			};
		})
	}));
	saveStoredCustomSubjects(next);
	return next;
}
function reorderSubject(existingSubjects, subjectId, direction) {
	const index = existingSubjects.findIndex((subject) => subject.id === subjectId);
	const target = index + direction;
	if (index < 0 || target < 0 || target >= existingSubjects.length) return existingSubjects;
	const next = [...existingSubjects];
	[next[index], next[target]] = [next[target], next[index]];
	saveStoredCustomSubjects(next);
	return next;
}
function reorderLesson(existingSubjects, lessonId, direction) {
	const next = existingSubjects.map((subject) => {
		const milestones = subject.milestones.map((milestone) => ({
			...milestone,
			lessons: [...milestone.lessons]
		}));
		const positions = milestones.flatMap((milestone, milestoneIndex) => milestone.lessons.map((_, lessonIndex) => ({
			milestoneIndex,
			lessonIndex
		})));
		const index = positions.findIndex(({ milestoneIndex, lessonIndex }) => milestones[milestoneIndex].lessons[lessonIndex].id === lessonId);
		const targetIndex = index + direction;
		if (index < 0 || targetIndex < 0 || targetIndex >= positions.length) return subject;
		const from = positions[index];
		const to = positions[targetIndex];
		const sourceLesson = milestones[from.milestoneIndex].lessons[from.lessonIndex];
		const targetLesson = milestones[to.milestoneIndex].lessons[to.lessonIndex];
		milestones[from.milestoneIndex].lessons[from.lessonIndex] = targetLesson;
		milestones[to.milestoneIndex].lessons[to.lessonIndex] = sourceLesson;
		return {
			...subject,
			milestones
		};
	});
	saveStoredCustomSubjects(next);
	return next;
}
/**
* Archive/catalog mutations always write the archive first and the live
* catalog second.  Both raw values are protected by one verified snapshot, so
* a failure never leaves the caller with an optimistic catalog state.
*/
function saveArchiveAndCatalogAtomically(archive, subjects, storage) {
	const liveCatalog = getStoredCustomSubjects(storage);
	if (liveCatalog.status === "invalid" || liveCatalog.status === "unavailable") return rememberCatalogStorageResult({
		ok: false,
		error: liveCatalog.error
	});
	let archiveRaw;
	let subjectsRaw;
	try {
		archiveRaw = JSON.stringify(archive);
		subjectsRaw = JSON.stringify(subjects);
	} catch {
		return rememberCatalogStorageResult({
			ok: false,
			error: "Cannot serialize catalog transaction."
		});
	}
	const transaction = replaceRawValuesSafely(ARCHIVE_CATALOG_ROLLBACK_KEY, [{
		key: ARCHIVED_CATALOG_KEY,
		raw: archiveRaw
	}, {
		key: CUSTOM_SUBJECTS_KEY,
		raw: subjectsRaw
	}], storage);
	return rememberCatalogStorageResult(transaction.ok ? { ok: true } : {
		ok: false,
		error: transaction.rollbackError ? `${transaction.error} Rollback also failed: ${transaction.rollbackError}` : transaction.error
	});
}
function archiveSubject(existingSubjects, subjectId, storage = getBrowserStorage()) {
	const subject = existingSubjects.find((candidate) => candidate.id === subjectId);
	if (!subject) return existingSubjects;
	const loadedArchive = loadArchivedCatalog(storage);
	if (loadedArchive.status === "invalid" || loadedArchive.status === "unavailable") {
		rememberCatalogStorageResult({
			ok: false,
			error: loadedArchive.error
		});
		return existingSubjects;
	}
	const archive = loadedArchive.status === "ok" ? loadedArchive.value : emptyArchivedCatalog();
	const nextArchive = {
		...archive,
		subjects: [...archive.subjects.filter((item) => item.id !== subjectId), subject]
	};
	const nextSubjects = existingSubjects.filter((item) => item.id !== subjectId);
	return saveArchiveAndCatalogAtomically(nextArchive, nextSubjects, storage).ok ? nextSubjects : existingSubjects;
}
function archiveLesson(existingSubjects, lessonId, storage = getBrowserStorage()) {
	for (const subject of existingSubjects) {
		const lesson = subject.milestones.flatMap((milestone) => milestone.lessons).find((candidate) => candidate.id === lessonId);
		if (!lesson) continue;
		const loadedArchive = loadArchivedCatalog(storage);
		if (loadedArchive.status === "invalid" || loadedArchive.status === "unavailable") {
			rememberCatalogStorageResult({
				ok: false,
				error: loadedArchive.error
			});
			return existingSubjects;
		}
		const archive = loadedArchive.status === "ok" ? loadedArchive.value : emptyArchivedCatalog();
		const nextArchive = {
			...archive,
			lessons: [...archive.lessons.filter((item) => item.lesson.id !== lessonId), {
				subjectId: subject.id,
				subjectName: subject.name,
				subjectEmoji: subject.emoji,
				lesson
			}]
		};
		const nextSubjects = existingSubjects.map((candidate) => ({
			...candidate,
			milestones: candidate.milestones.map((milestone) => {
				const lessons = milestone.lessons.filter((candidateLesson) => candidateLesson.id !== lessonId);
				return {
					...milestone,
					lessons,
					subtitle: `${lessons.length} bai hoc`
				};
			})
		}));
		return saveArchiveAndCatalogAtomically(nextArchive, nextSubjects, storage).ok ? nextSubjects : existingSubjects;
	}
	return existingSubjects;
}
function archiveLessons(existingSubjects, lessonIds, storage = getBrowserStorage()) {
	const selected = new Set(lessonIds);
	if (selected.size === 0) return existingSubjects;
	const loadedArchive = loadArchivedCatalog(storage);
	if (loadedArchive.status === "invalid" || loadedArchive.status === "unavailable") {
		rememberCatalogStorageResult({
			ok: false,
			error: loadedArchive.error
		});
		return existingSubjects;
	}
	const archive = loadedArchive.status === "ok" ? loadedArchive.value : emptyArchivedCatalog();
	const archivedById = new Map(archive.lessons.map((item) => [item.lesson.id, item]));
	let found = 0;
	for (const subject of existingSubjects) for (const lesson of subject.milestones.flatMap((milestone) => milestone.lessons)) {
		if (!selected.has(lesson.id)) continue;
		found += 1;
		archivedById.set(lesson.id, {
			subjectId: subject.id,
			subjectName: subject.name,
			subjectEmoji: subject.emoji,
			lesson
		});
	}
	if (found === 0) return existingSubjects;
	const nextArchive = {
		...archive,
		lessons: [...archivedById.values()]
	};
	const nextSubjects = existingSubjects.map((subject) => ({
		...subject,
		milestones: subject.milestones.map((milestone) => {
			const lessons = milestone.lessons.filter((lesson) => !selected.has(lesson.id));
			return {
				...milestone,
				lessons,
				subtitle: `${lessons.length} bài học`
			};
		})
	}));
	return saveArchiveAndCatalogAtomically(nextArchive, nextSubjects, storage).ok ? nextSubjects : existingSubjects;
}
function emptyArchivedCatalog() {
	return {
		subjects: [],
		lessons: []
	};
}
function normalizeArchivedCatalog(value) {
	if (!value || typeof value !== "object") return null;
	const candidate = value;
	if (!Array.isArray(candidate.subjects) || !Array.isArray(candidate.lessons)) return null;
	const subjects = normalizeSubjects(candidate.subjects);
	if (!subjects) return null;
	const lessons = [];
	for (const item of candidate.lessons) {
		if (!item || typeof item !== "object" || typeof item.subjectId !== "string" || typeof item.subjectName !== "string" || typeof item.subjectEmoji !== "string" || !item.lesson || typeof item.lesson !== "object" || typeof item.lesson.id !== "string") return null;
		lessons.push(item);
	}
	return {
		subjects,
		lessons
	};
}
function loadArchivedCatalog(storage = getBrowserStorage()) {
	return loadStorage(ARCHIVED_CATALOG_KEY, (raw) => normalizeArchivedCatalog(JSON.parse(raw)), storage);
}
/**
* Compatibility reader for existing callers.  The detailed result remains
* available to mutation paths, so corrupt archive bytes are never treated as
* permission to overwrite the archive.
*/
function getArchivedCatalog() {
	const loaded = loadArchivedCatalog();
	if (loaded.status === "ok") return loaded.value;
	if (loaded.status === "missing") return emptyArchivedCatalog();
	loaded.error;
	return emptyArchivedCatalog();
}
function restoreArchivedSubject(existingSubjects, subjectId, storage = getBrowserStorage()) {
	const loadedArchive = loadArchivedCatalog(storage);
	if (loadedArchive.status !== "ok") {
		if (loadedArchive.status === "invalid" || loadedArchive.status === "unavailable") rememberCatalogStorageResult({
			ok: false,
			error: loadedArchive.error
		});
		return existingSubjects;
	}
	const archive = loadedArchive.value;
	const subject = archive.subjects.find((item) => item.id === subjectId);
	if (!subject) return existingSubjects;
	const next = existingSubjects.some((item) => item.id === subjectId) ? existingSubjects : [...existingSubjects, subject];
	return saveArchiveAndCatalogAtomically({
		...archive,
		subjects: archive.subjects.filter((item) => item.id !== subjectId)
	}, next, storage).ok ? next : existingSubjects;
}
function restoreArchivedLesson(existingSubjects, lessonId, storage = getBrowserStorage()) {
	const loadedArchive = loadArchivedCatalog(storage);
	if (loadedArchive.status !== "ok") {
		if (loadedArchive.status === "invalid" || loadedArchive.status === "unavailable") rememberCatalogStorageResult({
			ok: false,
			error: loadedArchive.error
		});
		return existingSubjects;
	}
	const archive = loadedArchive.value;
	const item = archive.lessons.find((candidate) => candidate.lesson.id === lessonId);
	if (!item) return existingSubjects;
	let subjects = existingSubjects;
	if (!subjects.some((subject) => subject.id === item.subjectId)) subjects = [...subjects, {
		id: item.subjectId,
		name: item.subjectName,
		emoji: item.subjectEmoji,
		milestones: [{
			id: createCatalogId(`${item.subjectId}-lessons`),
			title: "Toàn bộ bài học",
			subtitle: "0 bài học",
			lessons: []
		}]
	}];
	const next = subjects.map((subject) => subject.id !== item.subjectId ? subject : {
		...subject,
		milestones: subject.milestones.map((milestone, index) => index === 0 ? {
			...milestone,
			lessons: [...milestone.lessons, item.lesson],
			subtitle: `${milestone.lessons.length + 1} bài học`
		} : milestone)
	});
	return saveArchiveAndCatalogAtomically({
		...archive,
		lessons: archive.lessons.filter((candidate) => candidate.lesson.id !== lessonId)
	}, next, storage).ok ? next : existingSubjects;
}
function saveCatalogBackup(subjects) {
	return rememberCatalogStorageResult(writeJsonVerified(CUSTOM_SUBJECTS_BACKUP_KEY, subjects, (value) => normalizeSubjects(value) !== null));
}
function restoreCatalogBackup() {
	const loaded = loadStorage(CUSTOM_SUBJECTS_BACKUP_KEY, (raw) => normalizeSubjects(JSON.parse(raw)));
	if (loaded.status !== "ok") return null;
	return saveStoredCustomSubjects(loaded.value).ok ? loaded.value : null;
}
function getStoredCustomSubjects(storage = getBrowserStorage()) {
	return loadStorage(CUSTOM_SUBJECTS_KEY, (raw) => normalizeSubjects(JSON.parse(raw)), storage);
}
function saveStoredCustomSubjects(subjects) {
	return rememberCatalogStorageResult(writeJsonVerified(CUSTOM_SUBJECTS_KEY, subjects, (value) => normalizeSubjects(value) !== null));
}
function reorderTopic(existingSubjects, subjectId, topicId, direction) {
	const next = existingSubjects.map((subject) => {
		if (subject.id !== subjectId) return subject;
		const index = subject.milestones.findIndex((milestone) => milestone.id === topicId);
		const target = index + direction;
		if (index < 0 || target < 0 || target >= subject.milestones.length) return subject;
		const milestones = [...subject.milestones];
		[milestones[index], milestones[target]] = [milestones[target], milestones[index]];
		return {
			...subject,
			milestones
		};
	});
	saveStoredCustomSubjects(next);
	return next;
}
function addTopicToSubject(existingSubjects, subjectId, title) {
	const normalizedTitle = title.trim();
	if (!normalizedTitle) return existingSubjects;
	const next = existingSubjects.map((subject) => {
		if (subject.id !== subjectId) return subject;
		if (subject.milestones.some((milestone) => milestone.title.localeCompare(normalizedTitle, "vi", { sensitivity: "base" }) === 0)) return subject;
		return {
			...subject,
			milestones: [...subject.milestones, {
				id: createCatalogId(`${subject.id}-topic`),
				title: normalizedTitle,
				subtitle: "0 bài học",
				lessons: []
			}]
		};
	});
	saveStoredCustomSubjects(next);
	return next;
}
function renameTopicInSubjects(existingSubjects, subjectId, milestoneId, title) {
	const normalizedTitle = title.trim();
	if (!normalizedTitle) return existingSubjects;
	const next = existingSubjects.map((subject) => {
		if (subject.id !== subjectId) return subject;
		return {
			...subject,
			milestones: subject.milestones.map((milestone) => milestone.id === milestoneId ? {
				...milestone,
				title: normalizedTitle,
				lessons: milestone.lessons.map((lesson) => ({
					...lesson,
					topic: normalizedTitle === "Toàn bộ bài học" ? void 0 : normalizedTitle
				}))
			} : milestone)
		};
	});
	saveStoredCustomSubjects(next);
	return next;
}
function removeTopicAndMoveLessonsToUncategorized(existingSubjects, subjectId, milestoneId) {
	saveCatalogBackup(existingSubjects);
	const next = existingSubjects.map((subject) => {
		if (subject.id !== subjectId) return subject;
		const removed = subject.milestones.find((milestone) => milestone.id === milestoneId);
		if (!removed) return subject;
		const remaining = subject.milestones.filter((milestone) => milestone.id !== milestoneId);
		if (removed.lessons.length === 0) return {
			...subject,
			milestones: remaining
		};
		const uncategorizedIndex = remaining.findIndex((milestone) => milestone.title === "Chưa phân loại" || milestone.title === "Toàn bộ bài học");
		const movedLessons = removed.lessons.map((lesson) => ({
			...lesson,
			topic: void 0
		}));
		if (uncategorizedIndex >= 0) {
			const target = remaining[uncategorizedIndex];
			remaining[uncategorizedIndex] = {
				...target,
				lessons: [...target.lessons, ...movedLessons],
				subtitle: `${target.lessons.length + movedLessons.length} bài học`
			};
		} else remaining.push({
			id: createCatalogId(`${subject.id}-uncategorized`),
			title: "Chưa phân loại",
			subtitle: `${movedLessons.length} bài học`,
			lessons: movedLessons
		});
		return {
			...subject,
			milestones: remaining
		};
	});
	saveStoredCustomSubjects(next);
	return next;
}
//#endregion
export { removeLessonFromSubjects as A, restoreArchivedSubject as B, moveLessonToSubject as C, parseCSVInputWithDiagnostics as D, normalizeSubjects as E, reorderLesson as F, updateLessonsDetails as G, restoreSnapshotFromKey as H, reorderSubject as I, writeRawVerified as J, updateSubjectDetails as K, reorderTopic as L, removeSubjectFromSubjects as M, removeTopicAndMoveLessonsToUncategorized as N, parseJSONInputWithDiagnostics as O, renameTopicInSubjects as P, replaceRawValuesSafely as R, loadStorage as S, moveLessonsToTopic as T, saveStoredCustomSubjects as U, restoreCatalogBackup as V, updateLessonDetails as W, duplicateLessonInSubjects as _, RESET_ROLLBACK_KEY as a, getBrowserStorage as b, SAMPLE_JSON_CONTENT as c, addTopicToSubject as d, archiveLesson as f, downloadFile as g, convertRawToSubjects as h, FOCUS_TIMER_SESSION_ROLLBACK_KEY as i, removeLessonsFromSubjects as j, readRawSnapshot as k, addCustomLessonToSubjects as l, archiveSubject as m, CUSTOM_SUBJECTS_BACKUP_KEY as n, SAMPLE_CSV_CONTENT as o, archiveLessons as p, writeJsonVerified as q, CUSTOM_SUBJECTS_KEY as r, SAMPLE_IMPORT_ROWS as s, ARCHIVED_CATALOG_KEY as t, addSubjectToSubjects as u, factoryResetOwnedStorage as v, moveLessonsToSubject as w, getStoredCustomSubjects as x, getArchivedCatalog as y, restoreArchivedLesson as z };
