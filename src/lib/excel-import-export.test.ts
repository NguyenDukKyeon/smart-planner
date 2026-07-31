import { readFileSync } from "node:fs";
import * as XLSX from "xlsx";
import { describe, expect, test } from "vitest";
import { parseExcelBuffer } from "./excel-import-export";

function workbookBuffer(rows: unknown[][]): ArrayBuffer {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), "Lộ trình học");
  return XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
}

describe("lazy Excel import/export module", () => {
  test("reads the established Excel columns without changing imported values", () => {
    const lessons = parseExcelBuffer(
      workbookBuffer([
        ["Môn học", "Chủ đề", "Tên bài học", "Số phút ước tính", "Ngày bắt đầu", "XP"],
        ["Toán", "Chương 1", "Mệnh đề", 45, "2026-08-01", 30],
      ]),
    );

    expect(lessons).toEqual([
      {
        subject: "Toán",
        topic: "Chương 1",
        title: "Mệnh đề",
        estimatedMinutes: 45,
        scheduledDate: "2026-08-01",
        xp: 30,
      },
    ]);
  });

  test("keeps the bundled KNTT workbook as a valid full import template", () => {
    const file = readFileSync(
      new URL("../../public/mau_import_bai_hoc_lop_11_KNTT_120_phut.xlsx", import.meta.url),
    );
    const buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
    const lessons = parseExcelBuffer(buffer);

    expect(lessons).toHaveLength(357);
    expect(lessons.filter((lesson) => lesson.subject === "Toán")).toHaveLength(167);
    expect(lessons[0].title).toBe("TDM11X11_Cơ bản về lượng giác — Bg01. Giá trị lượng giác");
  });

  test("returns an empty preview for an unreadable workbook", () => {
    expect(parseExcelBuffer(new Uint8Array([0, 1, 2, 3]).buffer)).toEqual([]);
  });
});
