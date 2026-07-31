import { describe, expect, test } from "vitest";
import { isValidOptionalISODate, validateLessonForm } from "./form-validation";

describe("form validation", () => {
  test("rejects impossible ISO calendar dates", () => {
    expect(isValidOptionalISODate("2026-02-31")).toBe(false);
    expect(isValidOptionalISODate("2024-02-29")).toBe(true);
    expect(isValidOptionalISODate("")).toBe(true);
  });

  test("rejects missing names and non-finite or negative values", () => {
    expect(
      validateLessonForm({
        subjectName: " ",
        title: "",
        minutes: Number.NaN,
        xp: -1,
        scheduledDate: "2026-02-31",
      }),
    ).toEqual({
      subjectName: "Vui lòng nhập tên môn học.",
      title: "Vui lòng nhập tên bài học.",
      minutes: "Thời lượng phải là một số dương hợp lệ.",
      xp: "XP phải là một số không âm hợp lệ.",
      scheduledDate: "Ngày dự kiến không tồn tại.",
    });
  });
});
