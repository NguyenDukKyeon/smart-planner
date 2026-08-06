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
});
