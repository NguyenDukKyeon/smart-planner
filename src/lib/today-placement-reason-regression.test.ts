import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { LessonPlacementReason } from "../components/today/LessonPlacementReason";

const manualMove = {
  kind: "manual-move" as const,
  movedAt: "2030-01-03T04:05:06.000Z",
  fromDateISO: "2030-01-01",
  toDateISO: "2030-01-03",
};

describe("LessonPlacementReason", () => {
  test("renders one primary badge and a collapsed accessible detail button", () => {
    const html = renderToStaticMarkup(
      createElement(LessonPlacementReason, {
        reason: {
          kind: "fixed-today",
          label: "Cố định hôm nay",
          description: "Bài cố định đã được đặt vào lịch hôm nay.",
          manualMove,
        },
      }),
    );
    expect(html.match(/data-placement-reason-badge/g)).toHaveLength(1);
    expect(html).toContain("Cố định hôm nay");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Chi tiết");
  });

  test("uses a button-driven disclosure instead of hover-only UI", () => {
    const source = readFileSync(
      new URL("../components/today/LessonPlacementReason.tsx", import.meta.url),
      "utf8",
    );
    expect(source).toContain("aria-expanded={open}");
    expect(source).toContain("onClick={() => setOpen");
    expect(source).not.toContain("onMouseEnter");
  });
});
