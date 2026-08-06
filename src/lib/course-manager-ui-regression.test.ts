import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

describe("Course Manager UI transaction routing", () => {
  test("extracts a presentation-only lesson editor and routes atomic saves", async () => {
    const editorSource = await readFile(
      new URL("../components/course-manager/LessonEditorDialog.tsx", import.meta.url),
      "utf8",
    );
    const modalSource = await readFile(
      new URL("../components/CourseManagerModal.tsx", import.meta.url),
      "utf8",
    );

    expect(editorSource).toContain("export function LessonEditorDialog");
    expect(editorSource).toContain("Chỉnh sửa bài học");
    expect(editorSource).toContain("Tên bài học");
    expect(editorSource).toContain("Môn học");
    expect(editorSource).toContain("Chủ đề");
    expect(editorSource).toContain("Thời lượng mục tiêu");
    expect(editorSource).toContain("30");
    expect(editorSource).toContain("45");
    expect(editorSource).toContain("60");
    expect(editorSource).toContain("90");
    expect(editorSource).toContain("120");
    expect(editorSource).toContain("min={1}");
    expect(editorSource).toContain("max={1440}");
    expect(editorSource).toContain("Linh hoạt");
    expect(editorSource).toContain("Cố định");
    expect(editorSource).toContain('type="date"');
    expect(editorSource).toContain("Xóa ngày");
    expect(editorSource).toContain("Hủy");
    expect(editorSource).toContain("Lưu thay đổi");
    expect(editorSource).toContain("onSubmit");

    for (const forbidden of [
      "custom-subjects",
      "schedule-candidates",
      "useScheduleTransactions",
      "scheduleTransactions",
      "localStorage",
      "sessionStorage",
      "app-storage",
    ]) {
      expect(editorSource).not.toContain(forbidden);
    }

    expect(modalSource).toContain("classifyLessonEdit");
    expect(modalSource).toContain("createLessonEditorDraft");
    expect(modalSource).toContain("updateLessonDetails");
    expect(modalSource).toContain("buildEditLessonCandidate");
    expect(modalSource).toContain('kind: "edit-lesson"');
    expect(modalSource).toContain("scheduleTransactions.executeMutation");
    expect(modalSource).toContain("Nhấn Ctrl+Z để hoàn tác thay đổi lịch.");
    expect(modalSource).toContain('if (classification === "noop")');
    expect(modalSource).toContain('if (classification === "catalog-only")');
    expect(modalSource).toContain("setEditingLesson(null)");
  });

  test("keeps reorder mechanics presentation-only and commits in the modal", async () => {
    const [modalSource, hookSource, rowSource, topicSource] = await Promise.all([
      readFile(new URL("../components/CourseManagerModal.tsx", import.meta.url), "utf8"),
      readFile(
        new URL("../components/course-manager/useLessonReorder.ts", import.meta.url),
        "utf8",
      ),
      readFile(new URL("../components/course-manager/LessonRow.tsx", import.meta.url), "utf8"),
      readFile(new URL("../components/course-manager/TopicSection.tsx", import.meta.url), "utf8"),
    ]);

    expect(hookSource).toContain("export function useLessonReorder");
    expect(rowSource).toContain("export function LessonRow");
    expect(topicSource).toContain("export function TopicSection");

    for (const source of [hookSource, rowSource, topicSource]) {
      expect(source).not.toContain("buildReorder");
      expect(source).not.toContain("scheduleTransactions");
      expect(source).not.toContain("executeMutation");
      expect(source).not.toContain("toast");
    }

    expect(modalSource).toContain("const reorderEnabled");
    expect(modalSource).toMatch(
      /buildReorderSubjectCandidate\([\s\S]*?commitReorder\(\s*built,\s*"reorder-subject"/,
    );
    expect(modalSource).toMatch(
      /buildReorderTopicCandidate\([\s\S]*?commitReorder\(\s*built,\s*"reorder-topic"/,
    );
    expect(modalSource).toMatch(
      /buildReorderLessonCandidate\([\s\S]*?commitReorder\(\s*built,\s*"reorder-lesson"/,
    );
    expect(modalSource).toContain("scheduleTransactions.executeMutation({");
    expect(modalSource).toContain("kind,");
    expect(modalSource).not.toContain("moveLessonBeforeInTopic");
    expect(modalSource).not.toContain("reorderSubject(");
    expect(modalSource).not.toContain("reorderTopic(");
  });

  test("extracts presentation-only bulk actions and routes schedule changes atomically", async () => {
    const [modalSource, bulkSource] = await Promise.all([
      readFile(new URL("../components/CourseManagerModal.tsx", import.meta.url), "utf8"),
      readFile(new URL("../components/course-manager/BulkActionsBar.tsx", import.meta.url), "utf8"),
    ]);

    expect(bulkSource).toContain("export function BulkActionsBar");
    expect(bulkSource).toContain("Đã chọn");
    expect(bulkSource).toContain("Chọn tất cả đang hiển thị");
    expect(bulkSource).toContain("Chuyển sang môn…");
    expect(bulkSource).toContain("Chuyển sang chủ đề…");
    expect(bulkSource).toContain('type="date"');
    expect(bulkSource).toContain("Linh hoạt");
    expect(bulkSource).toContain("Cố định");
    expect(bulkSource).toContain("30 phút");
    expect(bulkSource).toContain("60 phút");
    expect(bulkSource).toContain("90 phút");
    expect(bulkSource).toContain("120 phút");
    expect(bulkSource).toContain("Lưu trữ");
    expect(bulkSource).toContain("Xóa các bài đã chọn");
    expect(bulkSource).toContain("onMoveToSubject");
    expect(bulkSource).toContain("onMoveToTopic");
    expect(bulkSource).toContain("onUpdateDate");
    expect(bulkSource).toContain("onUpdateMode");
    expect(bulkSource).toContain("onUpdateDuration");
    expect(bulkSource).toContain("onArchive");
    expect(bulkSource).toContain("onDelete");

    for (const forbidden of [
      "custom-subjects",
      "schedule-candidates",
      "useScheduleTransactions",
      "scheduleTransactions",
      "executeMutation",
      "toast",
      "localStorage",
      "sessionStorage",
    ]) {
      expect(bulkSource).not.toContain(forbidden);
    }

    expect(modalSource).toContain("buildMoveLessonsCandidate");
    expect(modalSource).toContain("buildBulkLessonUpdateCandidate");
    expect(modalSource).toMatch(
      /buildMoveLessonsCandidate\([\s\S]*?commitBulkScheduleMutation\(\s*built,\s*"move-lessons"/,
    );
    expect(modalSource).toContain('kind: "bulk-schedule-update"');
    expect(modalSource).toContain("scheduledDate: bulkDate");
    expect(modalSource).toContain("scheduleMode: bulkScheduleMode");
    expect(modalSource).toContain("plannedDurationMinutes: bulkMinutes");
    expect(modalSource).toMatch(
      /if \(!result\.ok\)[\s\S]*?return false;[\s\S]*?clearSelection\(\)/,
    );
    expect(modalSource).toContain("archiveLessons");
    expect(modalSource).toContain("removeLessonsFromSubjects");
    expect(modalSource).toContain("alreadyPersisted: true");
    expect(modalSource).toContain("createBackup: true");
  });
});
