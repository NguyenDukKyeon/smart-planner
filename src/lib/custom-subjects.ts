import {
  type Subject,
  type Lesson,
  type LessonScheduleMode,
  SUBJECTS as DEFAULT_SUBJECTS,
} from "./mock-data";
import { weekdayFullVi, normalizeDateToISO } from "./date-utils";
import { sortSubjects } from "./subject-order";
import {
  getBrowserStorage,
  loadStorage,
  replaceRawValuesSafely,
  writeJsonVerified,
  writeRawVerified,
  ARCHIVE_CATALOG_ROLLBACK_KEY,
  type StorageAdapter,
  type StorageLoadResult,
  type StorageWriteResult,
} from "./app-storage";

export const SAMPLE_IMPORT_ROWS = [
  {
    subject_id: "toan",
    subject_name: "Toán",
    topic: "Chương 1: Hàm số lượng giác",
    lesson_id: "toan-ham-so-1",
    lesson_name: "Bài 1: Góc lượng giác",
    target_minutes: 45,
    planned_date: "2026-08-01",
    xp_reward: 30,
  },
  {
    subject_id: "vat-ly",
    subject_name: "Vật lý",
    topic: "Chương 1: Dao động",
    lesson_id: "vat-ly-dao-dong-1",
    lesson_name: "Bài 1: Dao động điều hòa",
    target_minutes: 60,
    planned_date: "2026-08-02",
    xp_reward: 40,
  },
  {
    subject_id: "hoa-hoc",
    subject_name: "Hóa học",
    topic: "Chương 1: Cân bằng hóa học",
    lesson_id: "hoa-can-bang-1",
    lesson_name: "Bài 1: Khái niệm cân bằng",
    target_minutes: 45,
    planned_date: "2026-08-03",
    xp_reward: 30,
  },
  {
    subject_id: "tieng-anh",
    subject_name: "Tiếng Anh",
    topic: "Unit 1: A long and healthy life",
    lesson_id: "anh-unit-1-tu-vung",
    lesson_name: "Từ vựng trọng tâm",
    target_minutes: 30,
    planned_date: "2026-08-04",
    xp_reward: 20,
  },
] as const;

export const SAMPLE_CSV_CONTENT = [
  "subject_id,subject_name,topic,lesson_id,lesson_name,target_minutes,planned_date,xp_reward",
  ...SAMPLE_IMPORT_ROWS.map((row) =>
    [
      row.subject_id,
      row.subject_name,
      row.topic,
      row.lesson_id,
      row.lesson_name,
      row.target_minutes,
      row.planned_date,
      row.xp_reward,
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(","),
  ),
].join("\n");

export const SAMPLE_JSON_CONTENT = JSON.stringify(SAMPLE_IMPORT_ROWS, null, 2);

export type ImportedRawLesson = {
  subjectId?: string;
  lessonId?: string;
  subject: string;
  topic?: string;
  title: string;
  estimatedMinutes?: number;
  scheduledDate: string;
  scheduleMode?: LessonScheduleMode;
  xp?: number;
  habitAnchor?: string;
};

export type ImportIssue = {
  row: number;
  message: string;
};

export type ImportParseResult = {
  items: ImportedRawLesson[];
  issues: ImportIssue[];
  totalRows: number;
};

export function downloadFile(filename: string, content: string, mimeType: string) {
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

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else {
      value += char;
    }
  }
  values.push(value.trim());
  return values;
}

function inferTopicFromTitle(title: string): string | undefined {
  if (!title.includes(" - ")) return undefined;
  const [prefix] = title.split(" - ");
  const normalized = prefix.toLowerCase();
  return normalized.includes("chương") || normalized.includes("unit") || normalized.includes("chủ đề")
    ? prefix.trim()
    : undefined;
}

function parsePositiveNumber(
  raw: unknown,
  fallback: number,
  row: number,
  label: string,
  issues: ImportIssue[],
): number {
  if (raw == null || String(raw).trim() === "") return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    issues.push({ row, message: `${label} phải là số lớn hơn 0.` });
    return fallback;
  }
  return Math.round(value);
}

function normalizeImportedDate(raw: unknown, row: number, issues: ImportIssue[]): string {
  if (raw == null || String(raw).trim() === "") return "";
  const normalized = normalizeDateToISO(raw);
  if (!normalized) issues.push({ row, message: "Ngày dự kiến không hợp lệ." });
  return normalized;
}

export function parseCSVInputWithDiagnostics(csvText: string): ImportParseResult {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line, index) => ({ text: line.trim(), row: index + 1 }))
    .filter((line) => line.text.length > 0);
  if (lines.length < 2) {
    return {
      items: [],
      issues: [{ row: 1, message: "File CSV cần có hàng tiêu đề và ít nhất một dòng dữ liệu." }],
      totalRows: 0,
    };
  }

  const headerCols = parseCsvLine(lines[0].text).map((column) => column.trim().toLowerCase());
  const subjectIdIdx = headerCols.findIndex((header) => header === "subject_id");
  const lessonIdIdx = headerCols.findIndex((header) => header === "lesson_id");
  const subjectIdx = headerCols.findIndex(
    (header) => header.includes("môn") || header === "subject" || header === "subject_name",
  );
  const topicIdx = headerCols.findIndex((header) =>
    ["chủ đề", "topic", "chương", "chuyen de", "phần"].some((term) => header.includes(term)),
  );
  let titleIdx = headerCols.findIndex((header) => header === "lesson_name");
  if (titleIdx === -1) {
    titleIdx = headerCols.findIndex(
      (header) => header.includes("bài") || header.includes("tên bài") || header === "title" || header === "name",
    );
  }
  const minutesIdx = headerCols.findIndex(
    (header) => header === "target_minutes" || header.includes("phút") || header.includes("thời gian") || header === "minutes",
  );
  const dateIdx = headerCols.findIndex(
    (header) => header === "planned_date" || header.includes("ngày") || header === "date",
  );
  const xpIdx = headerCols.findIndex((header) => header === "xp_reward" || header.includes("xp") || header.includes("điểm"));
  const hasHeader = subjectIdx !== -1 || titleIdx !== -1 || topicIdx !== -1 || dateIdx !== -1;
  const sourceLines = hasHeader ? lines.slice(1) : lines;
  const issues: ImportIssue[] = [];
  const items: ImportedRawLesson[] = [];

  for (const source of sourceLines) {
    const columns = parseCsvLine(source.text);
    const subject = String(hasHeader ? columns[subjectIdx] ?? "" : columns[0] ?? "").trim();
    const topic = String(hasHeader && topicIdx !== -1 ? columns[topicIdx] ?? "" : hasHeader ? "" : columns.length >= 6 ? columns[1] ?? "" : "").trim();
    const title = String(hasHeader ? columns[titleIdx] ?? "" : columns.length >= 6 ? columns[2] ?? "" : columns[1] ?? "").trim();
    if (!subject) {
      issues.push({ row: source.row, message: "Thiếu subject_name (tên môn học)." });
      continue;
    }
    if (!title) {
      issues.push({ row: source.row, message: "Thiếu lesson_name (tên bài học)." });
      continue;
    }
    const minutesRaw = hasHeader && minutesIdx !== -1 ? columns[minutesIdx] : columns.length >= 6 ? columns[3] : columns[2];
    const dateRaw = hasHeader && dateIdx !== -1 ? columns[dateIdx] : columns.length >= 6 ? columns[4] : columns[3];
    const xpRaw = hasHeader && xpIdx !== -1 ? columns[xpIdx] : columns.length >= 6 ? columns[5] : columns[4];
    items.push({
      subjectId: hasHeader && subjectIdIdx !== -1 ? columns[subjectIdIdx]?.trim() || undefined : undefined,
      lessonId: hasHeader && lessonIdIdx !== -1 ? columns[lessonIdIdx]?.trim() || undefined : undefined,
      subject,
      topic: topic || inferTopicFromTitle(title),
      title,
      estimatedMinutes: parsePositiveNumber(minutesRaw, 45, source.row, "target_minutes", issues),
      scheduledDate: normalizeImportedDate(dateRaw, source.row, issues),
      xp: parsePositiveNumber(xpRaw, 30, source.row, "xp_reward", issues),
    });
  }
  return { items, issues, totalRows: sourceLines.length };
}

export function parseCSVInput(csvText: string): ImportedRawLesson[] {
  return parseCSVInputWithDiagnostics(csvText).items;
}

export function parseJSONInputWithDiagnostics(jsonText: string): ImportParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { items: [], issues: [{ row: 1, message: "JSON không hợp lệ." }], totalRows: 0 };
  }
  if (!Array.isArray(parsed)) {
    return { items: [], issues: [{ row: 1, message: "JSON phải là một mảng bài học." }], totalRows: 0 };
  }
  const items: ImportedRawLesson[] = [];
  const issues: ImportIssue[] = [];
  parsed.forEach((unknownItem, index) => {
    const row = index + 1;
    if (!unknownItem || typeof unknownItem !== "object" || Array.isArray(unknownItem)) {
      issues.push({ row, message: "Mỗi phần tử phải là một object bài học." });
      return;
    }
    const item = unknownItem as Record<string, unknown>;
    const subjectId = String(item.subject_id || item.subjectId || "").trim();
    const lessonId = String(item.lesson_id || item.lessonId || "").trim();
    const subject = String(item.subject_name || item.subject || item.mon_hoc || "").trim();
    const title = String(item.lesson_name || item.title || item.ten_bai || item.name || "").trim();
    if (!subject) {
      issues.push({ row, message: "Thiếu subject_name (tên môn học)." });
      return;
    }
    if (!title) {
      issues.push({ row, message: "Thiếu lesson_name (tên bài học)." });
      return;
    }
    let topic = String(item.topic || item.chu_de || item.chuDe || item.chuong || item.milestone || item.category || "").trim();
    if (!topic) topic = inferTopicFromTitle(title) || "";
    items.push({
      subjectId: subjectId || undefined,
      lessonId: lessonId || undefined,
      subject,
      topic: topic || undefined,
      title,
      estimatedMinutes: parsePositiveNumber(item.target_minutes ?? item.estimatedMinutes ?? item.so_phut, 45, row, "target_minutes", issues),
      scheduledDate: normalizeImportedDate(item.planned_date ?? item.scheduledDate ?? item.ngay_bat_dau ?? item.date, row, issues),
      xp: parsePositiveNumber(item.xp_reward ?? item.xp, 30, row, "xp_reward", issues),
    });
  });
  return { items, issues, totalRows: parsed.length };
}

export function parseJSONInput(jsonText: string): ImportedRawLesson[] {
  return parseJSONInputWithDiagnostics(jsonText).items;
}

const EMOJI_MAP: Record<string, string> = {
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
  "Tin học": "💻",
};

export function convertRawToSubjects(items: ImportedRawLesson[]): Subject[] {
  if (!items.length) return [];

  const subjectMap = new Map<string, ImportedRawLesson[]>();

  items.forEach((item) => {
    const subjectName = item.subject || "Môn học khác";
    const list = subjectMap.get(subjectName) || [];
    list.push(item);
    subjectMap.set(subjectName, list);
  });

  const subjects: Subject[] = [];

  subjectMap.forEach((rawLessons, subjectName) => {
    const subId = rawLessons.find((item) => item.subjectId)?.subjectId || slugify(subjectName) || "custom";
    const emoji = EMOJI_MAP[subjectName] || "📖";

    const resolveTopicName = (item: ImportedRawLesson) => {
      let topicName = (item.topic || "").trim();
      if (!topicName && item.title.includes(" - ")) {
        const parts = item.title.split(" - ");
        if (
          parts.length >= 2 &&
          (parts[0].toLowerCase().includes("chương") ||
            parts[0].toLowerCase().includes("unit") ||
            parts[0].toLowerCase().includes("chủ đề"))
        ) {
          topicName = parts[0].trim();
        }
      }
      return topicName || "Toàn bộ bài học";
    };

    // Keep the same deterministic lesson IDs produced by earlier versions.
    // The old importer assigned the index after grouping every identical topic
    // and sorting that topic by date. Reusing those legacy indexes prevents a
    // re-import of the same workbook from disconnecting existing progress.
    const legacyIndexByLesson = new Map<ImportedRawLesson, number>();
    const legacyTopicGroups = new Map<string, ImportedRawLesson[]>();
    for (const item of rawLessons) {
      const topicName = resolveTopicName(item);
      const list = legacyTopicGroups.get(topicName) || [];
      list.push(item);
      legacyTopicGroups.set(topicName, list);
    }
    legacyTopicGroups.forEach((topicLessons) => {
      [...topicLessons]
        .sort((a, b) => (a.scheduledDate || "").localeCompare(b.scheduledDate || ""))
        .forEach((item, index) => legacyIndexByLesson.set(item, index));
    });

    // A topic may appear again later in the source workbook. Group only
    // adjacent rows with the same topic instead of merging all matching topics.
    // This preserves the exact lesson sequence from the imported file.
    const topicBlocks: { title: string; lessons: ImportedRawLesson[] }[] = [];
    for (const item of rawLessons) {
      const topicName = resolveTopicName(item);
      const current = topicBlocks.at(-1);
      if (current?.title === topicName) current.lessons.push(item);
      else topicBlocks.push({ title: topicName, lessons: [item] });
    }

    const milestones = topicBlocks.map((block, blockIndex) => {
      const lessons: Lesson[] = block.lessons.map((item) => {
        const lessonDate = item.scheduledDate || "";
        return {
          id: stableImportedLessonId(item, legacyIndexByLesson.get(item) ?? 0),
          title: item.title,
          topic: block.title === "Toàn bộ bài học" ? item.topic || undefined : block.title,
          xp: item.xp || 30,
          plannedDurationMinutes: clampMinutes(item.estimatedMinutes),
          scheduledDate: lessonDate,
          scheduleMode: item.scheduleMode === "fixed" ? "fixed" : "flexible",
          weekday: lessonDate ? weekdayFullVi(lessonDate) : "",
          sourceSubject: subjectName,
          week: 1,
          initialDone: false,
        };
      });

      return {
        id: `${subId}-topic-${slugify(block.title) || blockIndex + 1}-${blockIndex + 1}`,
        title: block.title,
        subtitle: `${lessons.length} bài học`,
        lessons,
      };
    });

    subjects.push({
      id: subId,
      name: subjectName,
      emoji,
      milestones,
    });
  });

  return subjects;
}

export function addCustomLessonToSubjects(
  existingSubjects: Subject[],
  rawLesson: ImportedRawLesson,
): Subject[] {
  const subjects = [...existingSubjects];
  const subjectName = rawLesson.subject.trim();
  const topicName = (rawLesson.topic || "").trim();
  const subId = slugify(subjectName) || "custom";
  const emoji = EMOJI_MAP[subjectName] || "📖";

  const lessonId = createCatalogId(`lesson-${subId}`);
  const lessonDate = rawLesson.scheduledDate || "";

  const newLesson: Lesson = {
    id: lessonId,
    title: rawLesson.title.trim(),
    topic: topicName || undefined,
    xp: rawLesson.xp || 30,
    plannedDurationMinutes: clampMinutes(rawLesson.estimatedMinutes),
    scheduledDate: lessonDate,
    scheduleMode: rawLesson.scheduleMode === "fixed" ? "fixed" : "flexible",
    weekday: lessonDate ? weekdayFullVi(lessonDate) : "",
    sourceSubject: subjectName,
    week: 1,
    initialDone: false,
    habitAnchor: rawLesson.habitAnchor?.trim() || undefined,
  };

  let subjectObj = subjects.find(
    (s) => s.name.toLowerCase() === subjectName.toLowerCase() || s.id === subId,
  );

  if (!subjectObj) {
    const milestoneTitle = topicName || "Toàn bộ bài học";
    subjectObj = {
      id: subId,
      name: subjectName,
      emoji,
      milestones: [
        {
          id: `${subId}-milestone-1`,
          title: milestoneTitle,
          subtitle: "1 bài học",
          lessons: [newLesson],
        },
      ],
    };
    subjects.push(subjectObj);
  } else {
    const milestones = [...subjectObj.milestones];
    const targetTopicTitle = topicName || "Toàn bộ bài học";

    const mIdx = milestones.findIndex(
      (m) => m.title.toLowerCase() === targetTopicTitle.toLowerCase(),
    );

    if (mIdx !== -1) {
      const targetM = { ...milestones[mIdx] };
      targetM.lessons = [...targetM.lessons, newLesson];
      targetM.subtitle = `${targetM.lessons.length} bài học`;
      milestones[mIdx] = targetM;
    } else {
      milestones.push({
        id: createCatalogId(`${subId}-topic`),
        title: targetTopicTitle,
        subtitle: "1 bài học",
        lessons: [newLesson],
      });
    }

    subjectObj = { ...subjectObj, milestones };
    const idx = subjects.findIndex((s) => s.id === subjectObj!.id);
    if (idx !== -1) subjects[idx] = subjectObj;
  }

  return subjects;
}

function createCatalogId(prefix: string): string {
  const suffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${suffix}`;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stableImportedLessonId(item: ImportedRawLesson, index: number): string {
  if (item.lessonId?.trim()) return item.lessonId.trim();
  const source = `${item.subject}|${item.title}|${item.scheduledDate}|${index}`;
  let hash = 2166136261;
  for (let i = 0; i < source.length; i++) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `lesson-${slugify(item.subject) || "custom"}-${(hash >>> 0).toString(36)}`;
}

function clampMinutes(value: number | undefined): number {
  return Math.min(240, Math.max(10, Math.round(value ?? 90)));
}

export function normalizeSubjects(value: unknown): Subject[] | null {
  if (!Array.isArray(value)) return null;
  const result: Subject[] = [];
  for (const rawSubject of value) {
    if (!rawSubject || typeof rawSubject !== "object") continue;
    const subject = rawSubject as Partial<Subject>;
    if (typeof subject.id !== "string" || typeof subject.name !== "string") continue;
    const milestones = Array.isArray(subject.milestones)
      ? subject.milestones.map((milestone) => ({
          ...milestone,
          lessons: Array.isArray(milestone.lessons)
            ? milestone.lessons.map((lesson) => ({
                ...lesson,
                topic: typeof lesson.topic === "string" ? lesson.topic : undefined,
                scheduleMode: lesson.scheduleMode === "fixed" ? "fixed" : "flexible",
                plannedDurationMinutes: clampMinutes(
                  (lesson as Lesson & { estimatedMinutes?: number }).plannedDurationMinutes ??
                    (lesson as Lesson & { estimatedMinutes?: number }).estimatedMinutes,
                ),
              }))
            : [],
        }))
      : [];
    result.push({
      id: subject.id,
      name: subject.name,
      emoji: typeof subject.emoji === "string" ? subject.emoji : "📖",
      milestones,
    });
  }
  return result;
}

export function addSubjectToSubjects(
  existingSubjects: Subject[],
  name: string,
  emoji = "📖",
): Subject[] {
  const normalizedName = name.trim();
  if (!normalizedName) return existingSubjects;
  if (
    existingSubjects.some((subject) => subject.name.toLowerCase() === normalizedName.toLowerCase())
  ) {
    return existingSubjects;
  }
  const idBase = slugify(normalizedName) || "subject";
  const next = [
    ...existingSubjects,
    {
      id: createCatalogId(idBase),
      name: normalizedName,
      emoji: emoji.trim() || "📖",
      milestones: [
        {
          id: createCatalogId(`${idBase}-lessons`),
          title: "Toàn bộ bài học",
          subtitle: "0 bài học",
          lessons: [],
        },
      ],
    },
  ];
  return next;
}

export function removeSubjectFromSubjects(
  existingSubjects: Subject[],
  subjectId: string,
): Subject[] {
  const next = existingSubjects.filter((subject) => subject.id !== subjectId);
  return next;
}

export function removeLessonFromSubjects(existingSubjects: Subject[], lessonId: string): Subject[] {
  const next = existingSubjects.map((subject) => ({
    ...subject,
    milestones: subject.milestones.map((milestone) => {
      const lessons = milestone.lessons.filter((lesson) => lesson.id !== lessonId);
      return {
        ...milestone,
        lessons,
        subtitle: `${lessons.length} bài học`,
      };
    }),
  }));
  return next;
}

export function removeLessonsFromSubjects(
  existingSubjects: Subject[],
  lessonIds: Iterable<string>,
): Subject[] {
  const selected = new Set(lessonIds);
  if (selected.size === 0) return existingSubjects;
  const next = existingSubjects.map((subject) => ({
    ...subject,
    milestones: subject.milestones.map((milestone) => {
      const lessons = milestone.lessons.filter((lesson) => !selected.has(lesson.id));
      return { ...milestone, lessons, subtitle: `${lessons.length} bài học` };
    }),
  }));
  return next;
}

export const CUSTOM_SUBJECTS_KEY = "hocvien-custom-subjects-v1";
export const CUSTOM_SUBJECTS_BACKUP_KEY = "hocvien-custom-subjects-backup-before-delete";
export const ARCHIVED_CATALOG_KEY = "hocvien-archived-catalog-v1";

export type CatalogUpdateOptions = {
  alreadyPersisted?: boolean;
  createBackup?: boolean;
};

export type CatalogUpdateResult =
  | { ok: true }
  | { ok: false; error: string };

let lastCatalogStorageError: string | null = null;

export function getLastCatalogStorageError(): string | null {
  return lastCatalogStorageError;
}

function rememberCatalogStorageResult(result: StorageWriteResult): StorageWriteResult {
  lastCatalogStorageError = result.ok ? null : result.error;
  return result;
}

export type ArchivedLesson = {
  subjectId: string;
  subjectName: string;
  subjectEmoji: string;
  lesson: Lesson;
};

export type ArchivedCatalog = {
  subjects: Subject[];
  lessons: ArchivedLesson[];
};

export function updateSubjectDetails(
  existingSubjects: Subject[],
  subjectId: string,
  patch: { name?: string; emoji?: string },
): Subject[] {
  const next = existingSubjects.map((subject) => {
    if (subject.id !== subjectId) return subject;
    const name = patch.name?.trim() || subject.name;
    return {
      ...subject,
      name,
      emoji: patch.emoji?.trim() || subject.emoji,
      milestones: subject.milestones.map((milestone) => ({
        ...milestone,
        lessons: milestone.lessons.map((lesson) => ({ ...lesson, sourceSubject: name })),
      })),
    };
  });
  return next;
}

export function updateLessonDetails(
  existingSubjects: Subject[],
  lessonId: string,
  patch: Partial<
    Pick<
      Lesson,
      "title" | "topic" | "plannedDurationMinutes" | "scheduledDate" | "scheduleMode" | "xp"
    >
  >,
): Subject[] {
  const normalizeLesson = (lesson: Lesson, subjectName: string): Lesson => {
    const scheduledDate =
      typeof patch.scheduledDate === "string" ? patch.scheduledDate : lesson.scheduledDate;
    const requestedTopic = typeof patch.topic === "string" ? patch.topic.trim() : undefined;
    return {
      ...lesson,
      title: patch.title?.trim() || lesson.title,
      topic:
        typeof patch.topic === "string"
          ? requestedTopic || "Chưa phân loại"
          : lesson.topic,
      plannedDurationMinutes:
        typeof patch.plannedDurationMinutes === "number"
          ? clampMinutes(patch.plannedDurationMinutes)
          : lesson.plannedDurationMinutes,
      xp:
        typeof patch.xp === "number"
          ? Math.min(1000, Math.max(0, Math.round(patch.xp)))
          : lesson.xp,
      scheduledDate,
      scheduleMode:
        patch.scheduleMode === "fixed" || patch.scheduleMode === "flexible"
          ? patch.scheduleMode
          : lesson.scheduleMode ?? "flexible",
      weekday: scheduledDate ? weekdayFullVi(scheduledDate) : "",
      sourceSubject: subjectName,
    };
  };

  const next = existingSubjects.map((subject) => {
    const sourceMilestone = subject.milestones.find((milestone) =>
      milestone.lessons.some((lesson) => lesson.id === lessonId),
    );
    if (!sourceMilestone) return subject;
    const sourceLesson = sourceMilestone.lessons.find((lesson) => lesson.id === lessonId);
    if (!sourceLesson) return subject;
    const updatedLesson = normalizeLesson(sourceLesson, subject.name);

    if (typeof patch.topic !== "string") {
      return {
        ...subject,
        milestones: subject.milestones.map((milestone) => ({
          ...milestone,
          lessons: milestone.lessons.map((lesson) =>
            lesson.id === lessonId ? updatedLesson : lesson,
          ),
        })),
      };
    }

    const targetTitle = patch.topic.trim() || "Chưa phân loại";
    let targetFound = false;
    const milestones = subject.milestones.map((milestone) => {
      const lessons = milestone.lessons.filter((lesson) => lesson.id !== lessonId);
      if (milestone.title.localeCompare(targetTitle, "vi", { sensitivity: "base" }) === 0) {
        targetFound = true;
        const withUpdated = [...lessons, { ...updatedLesson, topic: targetTitle }];
        return { ...milestone, lessons: withUpdated, subtitle: `${withUpdated.length} bài học` };
      }
      return { ...milestone, lessons, subtitle: `${lessons.length} bài học` };
    });
    if (!targetFound) {
      milestones.push({
        id: createCatalogId(`${subject.id}-topic-${slugify(targetTitle) || "uncategorized"}`),
        title: targetTitle,
        subtitle: "1 bài học",
        lessons: [{ ...updatedLesson, topic: targetTitle }],
      });
    }
    return { ...subject, milestones };
  });
  return next;
}

export function moveLessonToSubject(
  existingSubjects: Subject[],
  lessonId: string,
  targetSubjectId: string,
): Subject[] {
  let moving: Lesson | null = null;
  const without = existingSubjects.map((subject) => ({
    ...subject,
    milestones: subject.milestones.map((milestone) => {
      const lessons = milestone.lessons.filter((lesson) => {
        if (lesson.id !== lessonId) return true;
        moving = lesson;
        return false;
      });
      return { ...milestone, lessons, subtitle: `${lessons.length} bài học` };
    }),
  }));
  if (!moving) return existingSubjects;
  const next = without.map((subject) => {
    if (subject.id !== targetSubjectId) return subject;
    const lesson = { ...(moving as Lesson), sourceSubject: subject.name };
    const milestones =
      subject.milestones.length > 0
        ? subject.milestones.map((milestone, index) =>
            index === 0
              ? {
                  ...milestone,
                  lessons: [...milestone.lessons, lesson],
                  subtitle: `${milestone.lessons.length + 1} bài học`,
                }
              : milestone,
          )
        : [
            {
              id: createCatalogId(`${subject.id}-lessons`),
              title: "Toàn bộ bài học",
              subtitle: "1 bài học",
              lessons: [lesson],
            },
          ];
    return { ...subject, milestones };
  });
  return next;
}


export function moveLessonsToSubject(
  existingSubjects: Subject[],
  lessonIds: Iterable<string>,
  targetSubjectId: string,
): Subject[] {
  const selected = new Set(lessonIds);
  if (selected.size === 0) return existingSubjects;
  const target = existingSubjects.find((subject) => subject.id === targetSubjectId);
  if (!target) return existingSubjects;

  const moving: Lesson[] = [];
  const without = existingSubjects.map((subject) => ({
    ...subject,
    milestones: subject.milestones.map((milestone) => {
      const lessons = milestone.lessons.filter((lesson) => {
        if (!selected.has(lesson.id)) return true;
        moving.push({ ...lesson, sourceSubject: target.name });
        return false;
      });
      return { ...milestone, lessons, subtitle: `${lessons.length} bài học` };
    }),
  }));
  if (moving.length === 0) return existingSubjects;

  const next = without.map((subject) => {
    if (subject.id !== targetSubjectId) return subject;
    const milestones = subject.milestones.length
      ? subject.milestones.map((milestone, index) =>
          index === 0
            ? {
                ...milestone,
                lessons: [...milestone.lessons, ...moving],
                subtitle: `${milestone.lessons.length + moving.length} bài học`,
              }
            : milestone,
        )
      : [
          {
            id: createCatalogId(`${subject.id}-lessons`),
            title: "Toàn bộ bài học",
            subtitle: `${moving.length} bài học`,
            lessons: moving,
          },
        ];
    return { ...subject, milestones };
  });
  return next;
}

export function moveLessonsToTopic(
  existingSubjects: Subject[],
  lessonIds: Iterable<string>,
  targetSubjectId: string,
  targetTopicId: string,
): Subject[] {
  const selected = new Set(lessonIds);
  if (selected.size === 0) return existingSubjects;
  const targetSubject = existingSubjects.find((subject) => subject.id === targetSubjectId);
  const targetTopic = targetSubject?.milestones.find((milestone) => milestone.id === targetTopicId);
  if (!targetSubject || !targetTopic) return existingSubjects;

  const moving: Lesson[] = [];
  const without = existingSubjects.map((subject) => ({
    ...subject,
    milestones: subject.milestones.map((milestone) => {
      const lessons = milestone.lessons.filter((lesson) => {
        if (!selected.has(lesson.id)) return true;
        moving.push({ ...lesson, sourceSubject: targetSubject.name, topic: targetTopic.title });
        return false;
      });
      return { ...milestone, lessons, subtitle: `${lessons.length} bài học` };
    }),
  }));
  if (moving.length === 0) return existingSubjects;
  const next = without.map((subject) => {
    if (subject.id !== targetSubjectId) return subject;
    return {
      ...subject,
      milestones: subject.milestones.map((milestone) => {
        if (milestone.id !== targetTopicId) return milestone;
        const lessons = [...milestone.lessons, ...moving];
        return { ...milestone, lessons, subtitle: `${lessons.length} bài học` };
      }),
    };
  });
  return next;
}

export function updateLessonsDetails(
  existingSubjects: Subject[],
  lessonIds: Iterable<string>,
  patch: Partial<Pick<Lesson, "plannedDurationMinutes" | "scheduledDate">>,
): Subject[] {
  const selected = new Set(lessonIds);
  if (selected.size === 0) return existingSubjects;
  const next = existingSubjects.map((subject) => ({
    ...subject,
    milestones: subject.milestones.map((milestone) => ({
      ...milestone,
      lessons: milestone.lessons.map((lesson) => {
        if (!selected.has(lesson.id)) return lesson;
        const scheduledDate =
          typeof patch.scheduledDate === "string" ? patch.scheduledDate : lesson.scheduledDate;
        return {
          ...lesson,
          plannedDurationMinutes:
            typeof patch.plannedDurationMinutes === "number"
              ? clampMinutes(patch.plannedDurationMinutes)
              : lesson.plannedDurationMinutes,
          scheduledDate,
          weekday: scheduledDate ? weekdayFullVi(scheduledDate) : "",
        };
      }),
    })),
  }));
  return next;
}

export function duplicateLessonInSubjects(
  existingSubjects: Subject[],
  lessonId: string,
): Subject[] {
  const next = existingSubjects.map((subject) => ({
    ...subject,
    milestones: subject.milestones.map((milestone) => {
      const index = milestone.lessons.findIndex((lesson) => lesson.id === lessonId);
      if (index < 0) return milestone;
      const source = milestone.lessons[index];
      const duplicate: Lesson = {
        ...source,
        id: createCatalogId(`lesson-${slugify(subject.name) || "custom"}`),
        title: `${source.title} (bản sao)`,
        initialDone: false,
      };
      const lessons = [...milestone.lessons];
      lessons.splice(index + 1, 0, duplicate);
      return { ...milestone, lessons, subtitle: `${lessons.length} bài học` };
    }),
  }));
  return next;
}

export function reorderSubject(
  existingSubjects: Subject[],
  subjectId: string,
  direction: -1 | 1,
): Subject[] {
  const index = existingSubjects.findIndex((subject) => subject.id === subjectId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= existingSubjects.length) return existingSubjects;
  const next = [...existingSubjects];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function moveSubjectBefore(
  existingSubjects: Subject[],
  sourceSubjectId: string,
  targetSubjectId: string,
): Subject[] {
  if (sourceSubjectId === targetSubjectId) return existingSubjects;
  const sourceIndex = existingSubjects.findIndex((subject) => subject.id === sourceSubjectId);
  const targetIndex = existingSubjects.findIndex((subject) => subject.id === targetSubjectId);
  if (sourceIndex < 0 || targetIndex < 0) return existingSubjects;
  const next = [...existingSubjects];
  const [moving] = next.splice(sourceIndex, 1);
  const adjustedTarget = next.findIndex((subject) => subject.id === targetSubjectId);
  next.splice(adjustedTarget, 0, moving);
  return next;
}

export function reorderLesson(
  existingSubjects: Subject[],
  lessonId: string,
  direction: -1 | 1,
): Subject[] {
  let changed = false;
  const next = existingSubjects.map((subject) => ({
    ...subject,
    milestones: subject.milestones.map((milestone) => {
      const index = milestone.lessons.findIndex((lesson) => lesson.id === lessonId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= milestone.lessons.length) return milestone;
      const lessons = [...milestone.lessons];
      [lessons[index], lessons[target]] = [lessons[target], lessons[index]];
      changed = true;
      return { ...milestone, lessons };
    }),
  }));
  return changed ? next : existingSubjects;
}

export function moveLessonBeforeInTopic(
  existingSubjects: Subject[],
  subjectId: string,
  topicId: string,
  sourceLessonId: string,
  targetLessonId: string | null,
): Subject[] {
  if (targetLessonId && sourceLessonId === targetLessonId) return existingSubjects;
  let changed = false;
  const next = existingSubjects.map((subject) => {
    if (subject.id !== subjectId) return subject;
    return {
      ...subject,
      milestones: subject.milestones.map((milestone) => {
        if (milestone.id !== topicId) return milestone;
        const sourceIndex = milestone.lessons.findIndex(
          (lesson) => lesson.id === sourceLessonId,
        );
        if (sourceIndex < 0) return milestone;
        if (
          targetLessonId &&
          !milestone.lessons.some((lesson) => lesson.id === targetLessonId)
        ) {
          return milestone;
        }

        const lessons = [...milestone.lessons];
        const [moving] = lessons.splice(sourceIndex, 1);
        const insertionIndex = targetLessonId
          ? lessons.findIndex((lesson) => lesson.id === targetLessonId)
          : lessons.length;
        lessons.splice(insertionIndex < 0 ? lessons.length : insertionIndex, 0, moving);

        const unchanged = lessons.every(
          (lesson, index) => lesson.id === milestone.lessons[index]?.id,
        );
        if (unchanged) return milestone;
        changed = true;
        return { ...milestone, lessons };
      }),
    };
  });
  return changed ? next : existingSubjects;
}

export function moveLessonBefore(
  existingSubjects: Subject[],
  sourceLessonId: string,
  targetLessonId: string,
): Subject[] {
  if (sourceLessonId === targetLessonId) return existingSubjects;
  let moving: Lesson | null = null;
  const without = existingSubjects.map((subject) => ({
    ...subject,
    milestones: subject.milestones.map((milestone) => {
      const lessons = milestone.lessons.filter((lesson) => {
        if (lesson.id !== sourceLessonId) return true;
        moving = lesson;
        return false;
      });
      return { ...milestone, lessons, subtitle: `${lessons.length} bài học` };
    }),
  }));
  if (!moving) return existingSubjects;
  let inserted = false;
  const next = without.map((subject) => ({
    ...subject,
    milestones: subject.milestones.map((milestone) => {
      const targetIndex = milestone.lessons.findIndex((lesson) => lesson.id === targetLessonId);
      if (targetIndex < 0) return milestone;
      const lessons = [...milestone.lessons];
      lessons.splice(targetIndex, 0, { ...(moving as Lesson), sourceSubject: subject.name });
      inserted = true;
      return { ...milestone, lessons, subtitle: `${lessons.length} bài học` };
    }),
  }));
  if (!inserted) return existingSubjects;
  return next;
}

export function shiftLessonDates(
  existingSubjects: Subject[],
  lessonIds: string[],
  days: number,
): Subject[] {
  const selected = new Set(lessonIds);
  const next = existingSubjects.map((subject) => ({
    ...subject,
    milestones: subject.milestones.map((milestone) => ({
      ...milestone,
      lessons: milestone.lessons.map((lesson) => {
        if (!selected.has(lesson.id) || !lesson.scheduledDate) return lesson;
        const date = new Date(`${lesson.scheduledDate}T12:00:00`);
        date.setDate(date.getDate() + days);
        const scheduledDate = [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, "0"),
          String(date.getDate()).padStart(2, "0"),
        ].join("-");
        return { ...lesson, scheduledDate, weekday: weekdayFullVi(scheduledDate) };
      }),
    })),
  }));
  return next;
}

/**
 * Archive/catalog mutations always write the archive first and the live
 * catalog second.  Both raw values are protected by one verified snapshot, so
 * a failure never leaves the caller with an optimistic catalog state.
 */
function saveArchiveAndCatalogAtomically(
  archive: ArchivedCatalog,
  subjects: Subject[],
  storage: StorageAdapter | null,
): StorageWriteResult {
  const liveCatalog = getStoredCustomSubjects(storage);
  if (liveCatalog.status === "invalid" || liveCatalog.status === "unavailable") {
    return rememberCatalogStorageResult({ ok: false, error: liveCatalog.error });
  }
  let archiveRaw: string;
  let subjectsRaw: string;
  try {
    archiveRaw = JSON.stringify(archive);
    subjectsRaw = JSON.stringify(subjects);
  } catch {
    return rememberCatalogStorageResult({
      ok: false,
      error: "Cannot serialize catalog transaction.",
    });
  }
  const transaction = replaceRawValuesSafely(
    ARCHIVE_CATALOG_ROLLBACK_KEY,
    [
      { key: ARCHIVED_CATALOG_KEY, raw: archiveRaw },
      { key: CUSTOM_SUBJECTS_KEY, raw: subjectsRaw },
    ],
    storage,
  );
  return rememberCatalogStorageResult(
    transaction.ok
      ? { ok: true }
      : {
          ok: false,
          error: transaction.rollbackError
            ? `${transaction.error} Rollback also failed: ${transaction.rollbackError}`
            : transaction.error,
        },
  );
}

export function archiveSubject(
  existingSubjects: Subject[],
  subjectId: string,
  storage: StorageAdapter | null = getBrowserStorage(),
): Subject[] {
  const subject = existingSubjects.find((candidate) => candidate.id === subjectId);
  if (!subject) return existingSubjects;
  const loadedArchive = loadArchivedCatalog(storage);
  if (loadedArchive.status === "invalid" || loadedArchive.status === "unavailable") {
    rememberCatalogStorageResult({ ok: false, error: loadedArchive.error });
    return existingSubjects;
  }
  const archive = loadedArchive.status === "ok" ? loadedArchive.value : emptyArchivedCatalog();
  const nextArchive = {
    ...archive,
    subjects: [...archive.subjects.filter((item) => item.id !== subjectId), subject],
  };
  const nextSubjects = existingSubjects.filter((item) => item.id !== subjectId);
  return saveArchiveAndCatalogAtomically(nextArchive, nextSubjects, storage).ok
    ? nextSubjects
    : existingSubjects;
}

export function archiveLesson(
  existingSubjects: Subject[],
  lessonId: string,
  storage: StorageAdapter | null = getBrowserStorage(),
): Subject[] {
  for (const subject of existingSubjects) {
    const lesson = subject.milestones
      .flatMap((milestone) => milestone.lessons)
      .find((candidate) => candidate.id === lessonId);
    if (!lesson) continue;
    const loadedArchive = loadArchivedCatalog(storage);
    if (loadedArchive.status === "invalid" || loadedArchive.status === "unavailable") {
      rememberCatalogStorageResult({ ok: false, error: loadedArchive.error });
      return existingSubjects;
    }
    const archive = loadedArchive.status === "ok" ? loadedArchive.value : emptyArchivedCatalog();
    const nextArchive = {
      ...archive,
      lessons: [
        ...archive.lessons.filter((item) => item.lesson.id !== lessonId),
        { subjectId: subject.id, subjectName: subject.name, subjectEmoji: subject.emoji, lesson },
      ],
    };
    const nextSubjects = existingSubjects.map((candidate) => ({
      ...candidate,
      milestones: candidate.milestones.map((milestone) => {
        const lessons = milestone.lessons.filter(
          (candidateLesson) => candidateLesson.id !== lessonId,
        );
        return { ...milestone, lessons, subtitle: `${lessons.length} bai hoc` };
      }),
    }));
    return saveArchiveAndCatalogAtomically(nextArchive, nextSubjects, storage).ok
      ? nextSubjects
      : existingSubjects;
  }
  return existingSubjects;
}


export function archiveLessons(
  existingSubjects: Subject[],
  lessonIds: Iterable<string>,
  storage: StorageAdapter | null = getBrowserStorage(),
): Subject[] {
  const selected = new Set(lessonIds);
  if (selected.size === 0) return existingSubjects;
  const loadedArchive = loadArchivedCatalog(storage);
  if (loadedArchive.status === "invalid" || loadedArchive.status === "unavailable") {
    rememberCatalogStorageResult({ ok: false, error: loadedArchive.error });
    return existingSubjects;
  }
  const archive = loadedArchive.status === "ok" ? loadedArchive.value : emptyArchivedCatalog();
  const archivedById = new Map(archive.lessons.map((item) => [item.lesson.id, item]));
  let found = 0;
  for (const subject of existingSubjects) {
    for (const lesson of subject.milestones.flatMap((milestone) => milestone.lessons)) {
      if (!selected.has(lesson.id)) continue;
      found += 1;
      archivedById.set(lesson.id, {
        subjectId: subject.id,
        subjectName: subject.name,
        subjectEmoji: subject.emoji,
        lesson,
      });
    }
  }
  if (found === 0) return existingSubjects;
  const nextArchive = { ...archive, lessons: [...archivedById.values()] };
  const nextSubjects = existingSubjects.map((subject) => ({
    ...subject,
    milestones: subject.milestones.map((milestone) => {
      const lessons = milestone.lessons.filter((lesson) => !selected.has(lesson.id));
      return { ...milestone, lessons, subtitle: `${lessons.length} bài học` };
    }),
  }));
  return saveArchiveAndCatalogAtomically(nextArchive, nextSubjects, storage).ok
    ? nextSubjects
    : existingSubjects;
}

function emptyArchivedCatalog(): ArchivedCatalog {
  return { subjects: [], lessons: [] };
}

function normalizeArchivedCatalog(value: unknown): ArchivedCatalog | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<ArchivedCatalog>;
  if (!Array.isArray(candidate.subjects) || !Array.isArray(candidate.lessons)) return null;
  const subjects = normalizeSubjects(candidate.subjects);
  if (!subjects) return null;
  const lessons: ArchivedLesson[] = [];
  for (const item of candidate.lessons) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof item.subjectId !== "string" ||
      typeof item.subjectName !== "string" ||
      typeof item.subjectEmoji !== "string" ||
      !item.lesson ||
      typeof item.lesson !== "object" ||
      typeof item.lesson.id !== "string"
    ) {
      return null;
    }
    lessons.push(item as ArchivedLesson);
  }
  return { subjects, lessons };
}

export function loadArchivedCatalog(
  storage: StorageAdapter | null = getBrowserStorage(),
): StorageLoadResult<ArchivedCatalog> {
  return loadStorage(
    ARCHIVED_CATALOG_KEY,
    (raw) => normalizeArchivedCatalog(JSON.parse(raw)),
    storage,
  );
}

/**
 * Compatibility reader for existing callers.  The detailed result remains
 * available to mutation paths, so corrupt archive bytes are never treated as
 * permission to overwrite the archive.
 */
export function getArchivedCatalog(): ArchivedCatalog {
  const loaded = loadArchivedCatalog();
  if (loaded.status === "ok") {
    lastCatalogStorageError = null;
    return loaded.value;
  }
  if (loaded.status === "missing") {
    lastCatalogStorageError = null;
    return emptyArchivedCatalog();
  }
  lastCatalogStorageError = loaded.error;
  return emptyArchivedCatalog();
}

export function saveArchivedCatalog(archive: ArchivedCatalog): StorageWriteResult {
  return rememberCatalogStorageResult(
    writeJsonVerified(
      ARCHIVED_CATALOG_KEY,
      archive,
      (value) => normalizeArchivedCatalog(value) !== null,
    ),
  );
}

export function restoreArchivedSubject(
  existingSubjects: Subject[],
  subjectId: string,
  storage: StorageAdapter | null = getBrowserStorage(),
): Subject[] {
  const loadedArchive = loadArchivedCatalog(storage);
  if (loadedArchive.status !== "ok") {
    if (loadedArchive.status === "invalid" || loadedArchive.status === "unavailable") {
      rememberCatalogStorageResult({ ok: false, error: loadedArchive.error });
    }
    return existingSubjects;
  }
  const archive = loadedArchive.value;
  const subject = archive.subjects.find((item) => item.id === subjectId);
  if (!subject) return existingSubjects;
  const next = existingSubjects.some((item) => item.id === subjectId)
    ? existingSubjects
    : [...existingSubjects, subject];
  const nextArchive = {
    ...archive,
    subjects: archive.subjects.filter((item) => item.id !== subjectId),
  };
  return saveArchiveAndCatalogAtomically(nextArchive, next, storage).ok ? next : existingSubjects;
}

export function restoreArchivedLesson(
  existingSubjects: Subject[],
  lessonId: string,
  storage: StorageAdapter | null = getBrowserStorage(),
): Subject[] {
  const loadedArchive = loadArchivedCatalog(storage);
  if (loadedArchive.status !== "ok") {
    if (loadedArchive.status === "invalid" || loadedArchive.status === "unavailable") {
      rememberCatalogStorageResult({ ok: false, error: loadedArchive.error });
    }
    return existingSubjects;
  }
  const archive = loadedArchive.value;
  const item = archive.lessons.find((candidate) => candidate.lesson.id === lessonId);
  if (!item) return existingSubjects;
  let subjects = existingSubjects;
  if (!subjects.some((subject) => subject.id === item.subjectId)) {
    subjects = [
      ...subjects,
      {
        id: item.subjectId,
        name: item.subjectName,
        emoji: item.subjectEmoji,
        milestones: [
          {
            id: createCatalogId(`${item.subjectId}-lessons`),
            title: "Toàn bộ bài học",
            subtitle: "0 bài học",
            lessons: [],
          },
        ],
      },
    ];
  }
  const next = subjects.map((subject) =>
    subject.id !== item.subjectId
      ? subject
      : {
          ...subject,
          milestones: subject.milestones.map((milestone, index) =>
            index === 0
              ? {
                  ...milestone,
                  lessons: [...milestone.lessons, item.lesson],
                  subtitle: `${milestone.lessons.length + 1} bài học`,
                }
              : milestone,
          ),
        },
  );
  const nextArchive = {
    ...archive,
    lessons: archive.lessons.filter((candidate) => candidate.lesson.id !== lessonId),
  };
  return saveArchiveAndCatalogAtomically(nextArchive, next, storage).ok ? next : existingSubjects;
}

export function saveCatalogBackup(subjects: Subject[]): StorageWriteResult {
  return rememberCatalogStorageResult(
    writeJsonVerified(
      CUSTOM_SUBJECTS_BACKUP_KEY,
      subjects,
      (value) => normalizeSubjects(value) !== null,
    ),
  );
}

export function restoreCatalogBackup(): Subject[] | null {
  const loaded = loadStorage(CUSTOM_SUBJECTS_BACKUP_KEY, (raw) =>
    normalizeSubjects(JSON.parse(raw)),
  );
  if (loaded.status !== "ok") return null;
  return saveStoredCustomSubjects(loaded.value).ok ? loaded.value : null;
}

export function getStoredCustomSubjects(
  storage: StorageAdapter | null = getBrowserStorage(),
): StorageLoadResult<Subject[]> {
  return loadStorage(CUSTOM_SUBJECTS_KEY, (raw) => normalizeSubjects(JSON.parse(raw)), storage);
}

export function saveStoredCustomSubjects(subjects: Subject[]): StorageWriteResult {
  return rememberCatalogStorageResult(
    writeJsonVerified(CUSTOM_SUBJECTS_KEY, subjects, (value) => normalizeSubjects(value) !== null),
  );
}

export function clearStoredCustomSubjects(): StorageWriteResult {
  return rememberCatalogStorageResult(
    writeRawVerified(CUSTOM_SUBJECTS_KEY, null, getBrowserStorage()),
  );
}

export function reorderTopic(
  existingSubjects: Subject[],
  subjectId: string,
  topicId: string,
  direction: -1 | 1,
): Subject[] {
  const next = existingSubjects.map((subject) => {
    if (subject.id !== subjectId) return subject;
    const index = subject.milestones.findIndex((milestone) => milestone.id === topicId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= subject.milestones.length) return subject;
    const milestones = [...subject.milestones];
    [milestones[index], milestones[target]] = [milestones[target], milestones[index]];
    return { ...subject, milestones };
  });
  return next;
}

export function addTopicToSubject(
  existingSubjects: Subject[],
  subjectId: string,
  title: string,
): Subject[] {
  const normalizedTitle = title.trim();
  if (!normalizedTitle) return existingSubjects;
  const next = existingSubjects.map((subject) => {
    if (subject.id !== subjectId) return subject;
    if (
      subject.milestones.some(
        (milestone) =>
          milestone.title.localeCompare(normalizedTitle, "vi", { sensitivity: "base" }) === 0,
      )
    ) {
      return subject;
    }
    return {
      ...subject,
      milestones: [
        ...subject.milestones,
        {
          id: createCatalogId(`${subject.id}-topic`),
          title: normalizedTitle,
          subtitle: "0 bài học",
          lessons: [],
        },
      ],
    };
  });
  return next;
}

export function renameTopicInSubjects(
  existingSubjects: Subject[],
  subjectId: string,
  milestoneId: string,
  title: string,
): Subject[] {
  const normalizedTitle = title.trim();
  if (!normalizedTitle) return existingSubjects;
  const next = existingSubjects.map((subject) => {
    if (subject.id !== subjectId) return subject;
    return {
      ...subject,
      milestones: subject.milestones.map((milestone) =>
        milestone.id === milestoneId
          ? {
              ...milestone,
              title: normalizedTitle,
              lessons: milestone.lessons.map((lesson) => ({
                ...lesson,
                topic: normalizedTitle === "Toàn bộ bài học" ? undefined : normalizedTitle,
              })),
            }
          : milestone,
      ),
    };
  });
  return next;
}

export function removeTopicAndMoveLessonsToUncategorized(
  existingSubjects: Subject[],
  subjectId: string,
  milestoneId: string,
): Subject[] {
  const next = existingSubjects.map((subject) => {
    if (subject.id !== subjectId) return subject;
    const removed = subject.milestones.find((milestone) => milestone.id === milestoneId);
    if (!removed) return subject;
    const remaining = subject.milestones.filter((milestone) => milestone.id !== milestoneId);
    if (removed.lessons.length === 0) return { ...subject, milestones: remaining };
    const uncategorizedIndex = remaining.findIndex(
      (milestone) => milestone.title === "Chưa phân loại" || milestone.title === "Toàn bộ bài học",
    );
    const movedLessons = removed.lessons.map((lesson) => ({ ...lesson, topic: undefined }));
    if (uncategorizedIndex >= 0) {
      const target = remaining[uncategorizedIndex];
      remaining[uncategorizedIndex] = {
        ...target,
        lessons: [...target.lessons, ...movedLessons],
        subtitle: `${target.lessons.length + movedLessons.length} bài học`,
      };
    } else {
      remaining.push({
        id: createCatalogId(`${subject.id}-uncategorized`),
        title: "Chưa phân loại",
        subtitle: `${movedLessons.length} bài học`,
        lessons: movedLessons,
      });
    }
    return { ...subject, milestones: remaining };
  });
  return next;
}
