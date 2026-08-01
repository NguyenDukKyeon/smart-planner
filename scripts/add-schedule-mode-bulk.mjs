import { readFileSync, writeFileSync } from "node:fs";

const url = new URL("../src/components/CourseManagerModal.tsx", import.meta.url);
let source = readFileSync(url, "utf8");

function replaceOnce(before, after, marker, label) {
  if (marker && source.includes(marker)) return;
  if (!source.includes(before)) throw new Error(`Không thể cập nhật ${label}.`);
  source = source.replace(before, after);
}

replaceOnce(
  '  const [bulkDate, setBulkDate] = useState("");\n  const [bulkMinutes, setBulkMinutes] = useState(120);',
  '  const [bulkDate, setBulkDate] = useState("");\n  const [bulkScheduleMode, setBulkScheduleMode] = useState<LessonScheduleMode>("flexible");\n  const [bulkMinutes, setBulkMinutes] = useState(120);',
  "bulkScheduleMode",
  "trạng thái đổi chế độ lịch hàng loạt",
);

replaceOnce(
  '        planned_date: lesson.scheduledDate,\n        xp_reward: lesson.xp,',
  '        planned_date: lesson.scheduledDate,\n        schedule_mode: lesson.scheduleMode ?? "flexible",\n        xp_reward: lesson.xp,',
  "schedule_mode: lesson.scheduleMode",
  "xuất chế độ lịch",
);

replaceOnce(
  '                      <span>{lesson.scheduledDate ? `Dự kiến ${lesson.scheduledDate}` : "Chưa lên lịch"}</span>',
  '                      <span>{lesson.scheduledDate ? `${lesson.scheduleMode === "fixed" ? "Cố định" : "Từ"} ${lesson.scheduledDate}` : "Chưa lên lịch"}</span>',
  'lesson.scheduleMode === "fixed" ? "Cố định"',
  "hiển thị chế độ lịch trên từng bài",
);

replaceOnce(
  '                      <div className="flex gap-2">\n                        <select value={bulkMinutes}',
  `                      <div className="flex gap-2">
                        <select
                          value={bulkScheduleMode}
                          onChange={(event) =>
                            setBulkScheduleMode(event.target.value as LessonScheduleMode)
                          }
                          className="h-9 min-w-0 flex-1 rounded-xl border border-indigo-200 bg-white px-2 text-xs"
                        >
                          <option value="flexible">Linh hoạt</option>
                          <option value="fixed">Cố định</option>
                        </select>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                          disabled={selectedLessonIds.size === 0}
                          onClick={() =>
                            applyBulk(
                              updateLessonsDetails(currentSubjects, selectedLessonIds, {
                                scheduleMode: bulkScheduleMode,
                              }),
                              \`Đã đổi cách xếp lịch cho \${selectedLessonIds.size} bài.\`,
                            )
                          }
                          aria-label="Cập nhật cách xếp lịch"
                        >
                          <CalendarDays className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <select value={bulkMinutes}`,
  "Cập nhật cách xếp lịch",
  "đổi chế độ lịch hàng loạt",
);

writeFileSync(url, source, "utf8");

// Run after the schedule-mode patches because it improves the generated
// Course Manager markup and planner behavior.
await import("./improve-lesson-order-drag.mjs");
