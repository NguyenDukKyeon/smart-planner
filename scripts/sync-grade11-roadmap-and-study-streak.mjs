import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const write = (relative, content) => fs.writeFileSync(path.join(root, relative), content, "utf8");

function replaceOnce(source, before, after, label) {
  if (!source.includes(before)) {
    if (source.includes(after)) return source;
    throw new Error(`Không tìm thấy đoạn cần cập nhật: ${label}`);
  }
  return source.replace(before, after);
}

function slugify(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stableHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function excelDateToISO(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return `${String(parsed.y).padStart(4, "0")}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
    }
  }
  const raw = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const match = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (match) {
    return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  }
  return "";
}

function weekdayFullVi(dateISO) {
  if (!dateISO) return "";
  const labels = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  return labels[new Date(`${dateISO}T12:00:00`).getDay()] ?? "";
}

function normalizeSubjectName(value) {
  const raw = String(value ?? "").trim();
  if (/^lý$/i.test(raw)) return "Vật lý";
  if (/^hóa$/i.test(raw)) return "Hóa học";
  return raw;
}

function subjectId(name) {
  if (name === "Toán") return "toan";
  if (name === "Vật lý") return "ly";
  if (name === "Hóa học") return "hoa";
  return slugify(name) || "custom";
}

function subjectEmoji(name) {
  if (name === "Toán") return "📐";
  if (name === "Vật lý") return "⚛️";
  if (name === "Hóa học") return "🧪";
  return "📖";
}

function buildRoadmapFromWorkbook() {
  const workbookPath = path.join(root, "public", "mau_import_bai_hoc_lop_11_KNTT_120_phut.xlsx");
  const workbook = XLSX.readFile(workbookPath, { cellDates: true });
  const sheet = workbook.Sheets["Lộ trình học"] ?? workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("Không tìm thấy sheet lộ trình trong file Excel mẫu.");

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: true });
  const lessons = rows
    .map((row, sourceIndex) => ({
      sourceIndex,
      subject: normalizeSubjectName(row["Môn học"]),
      topic: String(row["Chủ đề"] ?? "").trim() || "Toàn bộ bài học",
      title: String(row["Tên bài học"] ?? "").trim(),
      estimatedMinutes: Math.min(240, Math.max(10, Math.round(Number(row["Số phút ước tính"]) || 120))),
      scheduledDate: excelDateToISO(row["Ngày bắt đầu"]),
      xp: Math.max(0, Math.round(Number(row.XP) || 30)),
    }))
    .filter((item) => item.subject && item.title);

  const subjectGroups = new Map();
  for (const lesson of lessons) {
    const list = subjectGroups.get(lesson.subject) ?? [];
    list.push(lesson);
    subjectGroups.set(lesson.subject, list);
  }

  const subjects = [];
  for (const [name, rawLessons] of subjectGroups) {
    const id = subjectId(name);
    const legacyIndexByLesson = new Map();
    const legacyTopicGroups = new Map();
    for (const item of rawLessons) {
      const list = legacyTopicGroups.get(item.topic) ?? [];
      list.push(item);
      legacyTopicGroups.set(item.topic, list);
    }
    for (const topicLessons of legacyTopicGroups.values()) {
      [...topicLessons]
        .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate) || a.sourceIndex - b.sourceIndex)
        .forEach((item, index) => legacyIndexByLesson.set(item, index));
    }

    const topicBlocks = [];
    for (const item of rawLessons) {
      const current = topicBlocks.at(-1);
      if (current?.title === item.topic) current.lessons.push(item);
      else topicBlocks.push({ title: item.topic, lessons: [item] });
    }

    const usedLessonIds = new Set();
    const milestones = topicBlocks.map((block, blockIndex) => {
      const blockLessons = block.lessons.map((item) => {
        const legacyIndex = legacyIndexByLesson.get(item) ?? 0;
        const source = `${item.subject}|${item.title}|${item.scheduledDate}|${legacyIndex}`;
        const baseId = `lesson-${slugify(item.subject) || "custom"}-${stableHash(source)}`;
        let lessonId = baseId;
        if (usedLessonIds.has(lessonId)) {
          const collisionHash = stableHash(
            `${item.topic}|${item.subject}|${item.title}|${item.scheduledDate}|${legacyIndex}`,
          );
          lessonId = `${baseId}-${collisionHash}`;
          let suffix = 2;
          while (usedLessonIds.has(lessonId)) {
            lessonId = `${baseId}-${collisionHash}-${suffix}`;
            suffix += 1;
          }
        }
        usedLessonIds.add(lessonId);
        return {
          id: lessonId,
          title: item.title,
          topic: block.title === "Toàn bộ bài học" ? undefined : block.title,
          xp: item.xp,
          plannedDurationMinutes: item.estimatedMinutes,
          scheduledDate: item.scheduledDate,
          weekday: weekdayFullVi(item.scheduledDate),
          sourceSubject: name,
          week: 1,
          initialDone: false,
        };
      });

      return {
        id: `${id}-topic-${slugify(block.title) || blockIndex + 1}-${blockIndex + 1}`,
        title: block.title,
        subtitle: `${blockLessons.length} bài học`,
        lessons: blockLessons,
      };
    });

    subjects.push({ id, name, emoji: subjectEmoji(name), milestones });
  }

  const lessonIds = subjects.flatMap((subject) =>
    subject.milestones.flatMap((milestone) => milestone.lessons.map((lesson) => lesson.id)),
  );
  if (lessons.length !== 357 || lessonIds.length !== 357 || new Set(lessonIds).size !== 357) {
    throw new Error(
      `Lộ trình mẫu không hợp lệ: ${lessons.length} dòng, ${lessonIds.length} bài, ${new Set(lessonIds).size} ID duy nhất.`,
    );
  }

  write("src/data/grade11-roadmap.json", `${JSON.stringify(subjects, null, 2)}\n`);
  return subjects;
}

function updateMockData() {
  const file = "src/lib/mock-data.ts";
  const source = read(file);
  const habitMarker = 'export type HabitIcon = "water" | "book" | "run" | "sleep" | "meditate" | "study";';
  const markerIndex = source.indexOf(habitMarker);
  if (markerIndex < 0) throw new Error("Không tìm thấy phần định nghĩa thói quen trong mock-data.ts");
  const habits = source.slice(markerIndex);
  const top = `import rawRoadmap from "@/data/grade11-roadmap.json";\nimport { sortSubjects } from "./subject-order";\n\nexport type Lesson = {\n  id: string;\n  title: string;\n  topic?: string;\n  xp: number;\n  plannedDurationMinutes: number;\n  scheduledDate: string;\n  weekday: string;\n  sourceSubject: string;\n  week: number;\n  initialDone: boolean;\n  habitAnchor?: string;\n};\nexport type Milestone = {\n  id: string;\n  title: string;\n  subtitle: string;\n  lessons: Lesson[];\n};\nexport type Subject = {\n  id: string;\n  name: string;\n  emoji: string;\n  milestones: Milestone[];\n};\n\n// Generated from public/mau_import_bai_hoc_lop_11_KNTT_120_phut.xlsx.\n// Keep the embedded sample catalog and the downloadable workbook synchronized.\nexport const SUBJECTS: Subject[] = sortSubjects(rawRoadmap as Subject[]);\n\nexport const ALL_LESSONS = SUBJECTS.flatMap((subject) =>\n  subject.milestones.flatMap((milestone) => milestone.lessons),\n);\n\nexport const INITIAL_COMPLETED_LESSONS: Record<string, string> = Object.fromEntries(\n  ALL_LESSONS.filter((lesson) => lesson.initialDone).map((lesson) => [\n    lesson.id,\n    lesson.scheduledDate,\n  ]),\n);\n\nexport const INITIAL_LESSON_XP: Record<string, number> = Object.fromEntries(\n  ALL_LESSONS.filter((lesson) => lesson.initialDone).map((lesson) => [lesson.id, lesson.xp]),\n);\n\nconst roadmapDates = ALL_LESSONS.map((lesson) => lesson.scheduledDate).filter(Boolean).sort();\n\nexport const ROADMAP_STATS = {\n  totalLessons: ALL_LESSONS.length,\n  initialCompleted: Object.keys(INITIAL_COMPLETED_LESSONS).length,\n  startDate: roadmapDates.at(0) ?? "",\n  endDate: roadmapDates.at(-1) ?? "",\n};\n\n`;
  write(file, `${top}${habits}`);
}

function updateImportedLessonIds() {
  const file = "src/lib/custom-subjects.ts";
  let source = read(file);
  source = replaceOnce(
    source,
    "    const milestones = topicBlocks.map((block, blockIndex) => {",
    "    const usedLessonIds = new Set<string>();\n    const milestones = topicBlocks.map((block, blockIndex) => {",
    "khởi tạo tập ID bài nhập",
  );
  source = replaceOnce(
    source,
    "          id: stableImportedLessonId(item, legacyIndexByLesson.get(item) ?? 0),",
    `          id: uniqueImportedLessonId(\n            item,\n            legacyIndexByLesson.get(item) ?? 0,\n            usedLessonIds,\n          ),`,
    "ID bài nhập duy nhất",
  );
  source = replaceOnce(
    source,
    `function stableImportedLessonId(item: ImportedRawLesson, index: number): string {\n  if (item.lessonId?.trim()) return item.lessonId.trim();\n  const source = \`${"${item.subject}|${item.title}|${item.scheduledDate}|${index}"}\`;\n  let hash = 2166136261;\n  for (let i = 0; i < source.length; i++) {\n    hash ^= source.charCodeAt(i);\n    hash = Math.imul(hash, 16777619);\n  }\n  return \`lesson-${"${slugify(item.subject) || \"custom\"}"}-${"${(hash >>> 0).toString(36)}"}\`;\n}`,
    `function stableHash(value: string): string {\n  let hash = 2166136261;\n  for (let i = 0; i < value.length; i++) {\n    hash ^= value.charCodeAt(i);\n    hash = Math.imul(hash, 16777619);\n  }\n  return (hash >>> 0).toString(36);\n}\n\nfunction stableImportedLessonId(item: ImportedRawLesson, index: number): string {\n  if (item.lessonId?.trim()) return item.lessonId.trim();\n  const source = \`${"${item.subject}|${item.title}|${item.scheduledDate}|${index}"}\`;\n  return \`lesson-${"${slugify(item.subject) || \"custom\"}"}-${"${stableHash(source)}"}\`;\n}\n\nfunction uniqueImportedLessonId(\n  item: ImportedRawLesson,\n  index: number,\n  usedLessonIds: Set<string>,\n): string {\n  const baseId = stableImportedLessonId(item, index);\n  if (!usedLessonIds.has(baseId)) {\n    usedLessonIds.add(baseId);\n    return baseId;\n  }\n\n  const collisionHash = stableHash(\n    \`${"${item.topic ?? \"\"}|${item.subject}|${item.title}|${item.scheduledDate}|${index}"}\`,\n  );\n  let candidate = \`${"${baseId}-${collisionHash}"}\`;\n  let suffix = 2;\n  while (usedLessonIds.has(candidate)) {\n    candidate = \`${"${baseId}-${collisionHash}-${suffix}"}\`;\n    suffix += 1;\n  }\n  usedLessonIds.add(candidate);\n  return candidate;\n}`,
    "hàm tạo ID bài nhập",
  );
  write(file, source);
}

function updateStrictStudyStreak() {
  const analyticsFile = "src/lib/progress-analytics.ts";
  let analytics = read(analyticsFile);
  const oldIsStudyDay = `export function isStudyDay(state: ProgressState, dateISO: string): boolean {\n  if (!isDateISO(dateISO)) return false;\n\n  const hasCompletedLesson = Object.values(state.completedLessons).some(\n    (completedOn) => completedOn === dateISO,\n  );\n  const hasRecordedStudyHabit = state.habitLog[dateISO]?.study === true;\n  const mins = studyMinutesOnDate(state.studySessions, dateISO);\n  const hasFocusSession = mins >= 25 || studySecondsOnDate(state.studySessions, dateISO) > 0;\n\n  return hasCompletedLesson || hasRecordedStudyHabit || hasFocusSession;\n}`;
  const newIsStudyDay = `export const STUDY_DAY_COMPLETE_KEY = "__study_day_complete__";\n\nexport function isStudyDay(state: ProgressState, dateISO: string): boolean {\n  if (!isDateISO(dateISO)) return false;\n  return state.habitLog[dateISO]?.[STUDY_DAY_COMPLETE_KEY] === true;\n}`;
  analytics = replaceOnce(analytics, oldIsStudyDay, newIsStudyDay, "quy tắc chuỗi học");
  write(analyticsFile, analytics);

  const routeFile = "src/routes/index.tsx";
  let route = read(routeFile);
  route = replaceOnce(
    route,
    'import { buildShiftedSchedule } from "@/lib/planner";',
    'import { buildShiftedSchedule, pickTodayQueue } from "@/lib/planner";',
    "import bộ lập hàng đợi hôm nay",
  );
  const shiftedBlock = `  const shiftedDates = useMemo<Record<string, string>>(\n    () =>\n      buildShiftedSchedule({\n        subjects,\n        completed: state.completedLessons,\n        meta: state.studyMeta,\n        settings: state.plannerSettings,\n      }),\n    [subjects, state.completedLessons, state.studyMeta, state.plannerSettings],\n  );\n`;
  const queueBlock = `${shiftedBlock}\n  const todayQueueCompletion = useMemo(() => {\n    if (!hydrated || !workspaceStorageLoaded || subjects.length === 0) return null;\n    const queue = pickTodayQueue({\n      subjects,\n      completed: state.completedLessons,\n      reviewCompletions: state.reviewCompletions,\n      meta: state.studyMeta,\n      settings: state.plannerSettings,\n    });\n    const completedNew = queue.newLessons.filter((lesson) =>\n      Boolean(state.completedLessons[lesson.id]),\n    ).length;\n    const completedReviews = queue.reviewLessons.filter((review) => review.completed).length;\n    const total = queue.newLessons.length + queue.reviewLessons.length;\n    return { total, isComplete: total > 0 && completedNew + completedReviews === total };\n  }, [\n    hydrated,\n    state.completedLessons,\n    state.plannerSettings,\n    state.reviewCompletions,\n    state.studyMeta,\n    subjects,\n    workspaceStorageLoaded,\n  ]);\n\n  useEffect(() => {\n    if (!todayQueueCompletion) return;\n    updateHabit({ __study_day_complete__: todayQueueCompletion.isComplete });\n  }, [todayQueueCompletion, updateHabit]);\n`;
  route = replaceOnce(route, shiftedBlock, queueBlock, "ghi nhận hoàn thành toàn bộ lịch hôm nay");
  write(routeFile, route);

  const todayFile = "src/components/TodayPanel.tsx";
  let today = read(todayFile);
  today = today.replace(
    "Học ít nhất 1 bài hoặc hoàn thành 25 phút Pomodoro mỗi ngày để giữ chuỗi!",
    "Hoàn thành toàn bộ bài mới và bài ôn hôm nay để giữ chuỗi!",
  );
  today = today.replace(
    "Học ít nhất 1 bài hoặc hoàn thành 25 phút Pomodoro mỗi ngày để giữ chuỗi!",
    "Hoàn thành toàn bộ bài mới và bài ôn hôm nay để giữ chuỗi!",
  );
  write(todayFile, today);

  const cardFile = "src/components/StudyStreakCard.tsx";
  let card = read(cardFile);
  card = replaceOnce(
    card,
    `          Một ngày học được ghi nhận khi có bài học hoàn thành trong ngày, thói quen học đã đánh\n          dấu, hoặc phiên tập trung có thời lượng dương.`,
    `          Một ngày chỉ được ghi nhận khi bạn hoàn thành toàn bộ bài mới và bài ôn được giao trong\n          ngày. Học một phần hoặc chỉ chạy Pomodoro chưa làm tăng chuỗi.`,
    "mô tả chuỗi học",
  );
  write(cardFile, card);
}

const subjects = buildRoadmapFromWorkbook();
updateMockData();
updateImportedLessonIds();
updateStrictStudyStreak();

const counts = Object.fromEntries(
  subjects.map((subject) => [
    subject.name,
    subject.milestones.reduce((sum, milestone) => sum + milestone.lessons.length, 0),
  ]),
);
console.log("Đã đồng bộ lộ trình mẫu và chuỗi học:", counts);
