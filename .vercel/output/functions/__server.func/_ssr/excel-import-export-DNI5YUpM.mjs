import { u as normalizeDateToISO } from "./date-utils-CFRHucsE.mjs";
import { s as SAMPLE_IMPORT_ROWS } from "./custom-subjects-uE4AACuO.mjs";
import { n as utils, r as writeFileSync, t as readSync } from "../_libs/xlsx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/excel-import-export-DNI5YUpM.js
function isTopicPrefix(value) {
	const normalized = value.toLowerCase();
	return normalized.includes("chương") || normalized.includes("unit") || normalized.includes("chủ đề");
}
/** Loaded lazily only when users read or create an Excel workbook. */
function parseExcelBufferWithDiagnostics(buffer) {
	try {
		const workbook = readSync(buffer, {
			type: "array",
			cellDates: true
		});
		const sheetName = workbook.SheetNames.find((name) => name.toLowerCase() !== "huong_dan") ?? workbook.SheetNames[0];
		if (!sheetName) return {
			items: [],
			issues: [{
				row: 1,
				message: "Workbook không có sheet dữ liệu."
			}],
			totalRows: 0
		};
		const worksheet = workbook.Sheets[sheetName];
		const rows = utils.sheet_to_json(worksheet, {
			header: 1,
			defval: ""
		});
		if (!rows || rows.length < 2) return {
			items: [],
			issues: [{
				row: 1,
				message: "Sheet cần có hàng tiêu đề và ít nhất một dòng dữ liệu."
			}],
			totalRows: 0
		};
		const headerRow = rows[0].map((cell) => String(cell || "").toLowerCase().trim());
		const subjectIdIndex = headerRow.findIndex((header) => header === "subject_id");
		const lessonIdIndex = headerRow.findIndex((header) => header === "lesson_id");
		let subjectIndex = headerRow.findIndex((header) => header.includes("môn") || header === "subject_name" || header === "subject");
		const topicIndex = headerRow.findIndex((header) => [
			"chủ đề",
			"topic",
			"chương",
			"chuyen de",
			"phần"
		].some((term) => header.includes(term)));
		let titleIndex = headerRow.findIndex((header) => header === "lesson_name");
		if (titleIndex === -1) titleIndex = headerRow.findIndex((header) => [
			"bài",
			"tên bài",
			"title"
		].some((term) => header.includes(term)));
		let minutesIndex = headerRow.findIndex((header) => header === "target_minutes" || [
			"phút",
			"thời gian",
			"minutes"
		].some((term) => header.includes(term)));
		let dateIndex = headerRow.findIndex((header) => header === "planned_date" || ["ngày", "date"].some((term) => header.includes(term)));
		let xpIndex = headerRow.findIndex((header) => header === "xp_reward" || header.includes("xp") || header.includes("điểm"));
		if (subjectIndex === -1) subjectIndex = 0;
		if (titleIndex === -1) titleIndex = topicIndex !== -1 ? 2 : 1;
		if (minutesIndex === -1) minutesIndex = topicIndex !== -1 ? 3 : 2;
		if (dateIndex === -1) dateIndex = topicIndex !== -1 ? 4 : 3;
		if (xpIndex === -1) xpIndex = topicIndex !== -1 ? 5 : 4;
		const items = [];
		const issues = [];
		let totalRows = 0;
		for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
			const row = rows[rowIndex] ?? [];
			if (!row.some((cell) => String(cell ?? "").trim() !== "")) continue;
			totalRows += 1;
			const displayRow = rowIndex + 1;
			const subjectId = subjectIdIndex !== -1 ? String(row[subjectIdIndex] || "").trim() : "";
			const lessonId = lessonIdIndex !== -1 ? String(row[lessonIdIndex] || "").trim() : "";
			const subject = String(row[subjectIndex] || "").trim();
			let topic = topicIndex !== -1 ? String(row[topicIndex] || "").trim() : "";
			const title = String(row[titleIndex] || "").trim();
			if (!subject) {
				issues.push({
					row: displayRow,
					message: "Thiếu subject_name (tên môn học)."
				});
				continue;
			}
			if (!title) {
				issues.push({
					row: displayRow,
					message: "Thiếu lesson_name (tên bài học)."
				});
				continue;
			}
			const rawMinutes = row[minutesIndex];
			const numericMinutes = rawMinutes === "" ? 45 : Number(rawMinutes);
			const estimatedMinutes = Number.isFinite(numericMinutes) && numericMinutes > 0 ? Math.round(numericMinutes) : 45;
			if (rawMinutes !== "" && (!Number.isFinite(numericMinutes) || numericMinutes <= 0)) issues.push({
				row: displayRow,
				message: "target_minutes phải là số lớn hơn 0."
			});
			const rawDate = row[dateIndex];
			const scheduledDate = normalizeDateToISO(rawDate);
			if (rawDate !== "" && !scheduledDate) issues.push({
				row: displayRow,
				message: "Ngày dự kiến không hợp lệ."
			});
			const rawXp = row[xpIndex];
			const numericXp = rawXp === "" ? 30 : Number(rawXp);
			const xp = Number.isFinite(numericXp) && numericXp > 0 ? Math.round(numericXp) : 30;
			if (rawXp !== "" && (!Number.isFinite(numericXp) || numericXp <= 0)) issues.push({
				row: displayRow,
				message: "xp_reward phải là số lớn hơn 0."
			});
			if (!topic && title.includes(" - ")) {
				const [possibleTopic] = title.split(" - ");
				if (possibleTopic && isTopicPrefix(possibleTopic)) topic = possibleTopic.trim();
			}
			items.push({
				subjectId: subjectId || void 0,
				lessonId: lessonId || void 0,
				subject,
				topic: topic || void 0,
				title,
				estimatedMinutes,
				scheduledDate,
				xp
			});
		}
		return {
			items,
			issues,
			totalRows
		};
	} catch {
		return {
			items: [],
			issues: [{
				row: 1,
				message: "Không thể đọc workbook Excel."
			}],
			totalRows: 0
		};
	}
}
var SAMPLE_EXCEL_FILENAME = "mau_import_lo_trinh_don_gian.xlsx";
var FULL_GRADE11_EXCEL_FILENAME = "mau_import_bai_hoc_lop_11_KNTT_120_phut.xlsx";
function downloadSampleExcel() {
	const dataRows = SAMPLE_IMPORT_ROWS.map((item) => ({
		subject_id: item.subject_id,
		subject_name: item.subject_name,
		topic: item.topic,
		lesson_id: item.lesson_id,
		lesson_name: item.lesson_name,
		target_minutes: item.target_minutes,
		planned_date: item.planned_date,
		xp_reward: item.xp_reward
	}));
	const guideRows = [
		[
			"Cột",
			"Bắt buộc",
			"Mô tả"
		],
		[
			"subject_id",
			"Không",
			"ID ổn định của môn; để trống nếu muốn ứng dụng tự tạo"
		],
		[
			"subject_name",
			"Có",
			"Tên môn học, ví dụ Toán"
		],
		[
			"topic",
			"Không",
			"Chương hoặc chủ đề của bài"
		],
		[
			"lesson_id",
			"Không",
			"ID ổn định của bài; giúp import lại không tạo bản sao"
		],
		[
			"lesson_name",
			"Có",
			"Tên bài cần học"
		],
		[
			"target_minutes",
			"Không",
			"Tổng thời lượng mục tiêu, mặc định 45 phút"
		],
		[
			"planned_date",
			"Không",
			"Ngày dự kiến theo YYYY-MM-DD"
		],
		[
			"xp_reward",
			"Không",
			"Giá trị tương thích dữ liệu cũ; app áp dụng quy tắc gamification chung"
		]
	];
	const workbook = utils.book_new();
	utils.book_append_sheet(workbook, utils.json_to_sheet(dataRows), "Du_lieu");
	utils.book_append_sheet(workbook, utils.aoa_to_sheet(guideRows), "Huong_dan");
	writeFileSync(workbook, SAMPLE_EXCEL_FILENAME);
}
function downloadFullGrade11Excel() {
	const link = document.createElement("a");
	link.href = `/${FULL_GRADE11_EXCEL_FILENAME}`;
	link.download = FULL_GRADE11_EXCEL_FILENAME;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
//#endregion
export { downloadFullGrade11Excel, downloadSampleExcel, parseExcelBufferWithDiagnostics };
