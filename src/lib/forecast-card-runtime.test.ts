import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ForecastCard } from "@/components/ForecastCard";
import { displayDate } from "./date-utils";
import { selectForecastViewModel } from "./forecast-view-model";
import type { Subject } from "./mock-data";
import { createInitialProgressState, todayISO } from "./progress-store";

function makeSubjects(count: number, scheduledDate = todayISO()): Subject[] {
  return [
    {
      id: "math",
      name: "Toán",
      emoji: "📐",
      milestones: [
        {
          id: "topic-1",
          title: "Chủ đề 1",
          subtitle: "",
          lessons: Array.from({ length: count }, (_, index) => ({
            id: `runtime-lesson-${index + 1}`,
            title: `Bài ${index + 1}`,
            xp: 10,
            plannedDurationMinutes: 60,
            scheduledDate,
            scheduleMode: "flexible" as const,
            weekday: "T2",
            sourceSubject: "Toán",
            week: 1,
            initialDone: false,
          })),
        },
      ],
    },
  ];
}

describe("ForecastCard runtime clarity", () => {
  it("renders workload, capacity, horizon, visibility, confidence, basis, and completion value", () => {
    const subjects = makeSubjects(20);
    const state = createInitialProgressState(false);
    state.plannerSettings.defaultDailyHours = 1;
    state.plannerSettings.todayHours = 1;
    const expected = selectForecastViewModel({ subjects, state, horizonWeeks: 2 });

    expect(expected.outsideHorizonLessons).toBeGreaterThan(0);

    const html = renderToStaticMarkup(createElement(ForecastCard, { state, subjects }));

    expect(html).toContain("Dự kiến hoàn thành");
    if (expected.completion.kind === "date") {
      expect(html).toContain(displayDate(expected.completion.dateISO));
    } else {
      throw new Error(`Expected a dated Forecast completion, got ${expected.completion.kind}`);
    }
    expect(html).toContain("Bài mới");
    expect(html).toContain("Ôn tập");
    expect(html).toContain("Tổng khối lượng");
    expect(html).toContain("Quỹ giờ giả định");
    expect(html).toContain("Phạm vi đang xem");
    expect(html).toContain("2 tuần");
    expect(html).toContain("Ngoài phạm vi");
    expect(html).toContain(`${expected.outsideHorizonLessons} bài chưa hoàn thành`);
    expect(html).toContain("Mức tin cậy");
    expect(html).toContain("Ước tính dựa trên");
  });

  it("renders truthful non-warning copy when all unfinished work fits the horizon", () => {
    const subjects = makeSubjects(1, todayISO());
    const state = createInitialProgressState(false);
    state.plannerSettings.defaultDailyHours = 2;
    state.plannerSettings.todayHours = 2;
    const expected = selectForecastViewModel({ subjects, state, horizonWeeks: 2 });

    expect(expected.outsideHorizonLessons).toBe(0);

    const html = renderToStaticMarkup(createElement(ForecastCard, { state, subjects }));

    expect(html).toContain("Trong phạm vi");
    expect(html).toContain("Tất cả bài chưa hoàn thành đều nằm trong phạm vi 2 tuần đang xem.");
  });
});
