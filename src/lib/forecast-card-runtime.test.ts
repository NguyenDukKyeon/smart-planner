import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ForecastCard } from "@/components/ForecastCard";
import { selectForecastViewModel } from "./forecast-view-model";
import type { Subject } from "./mock-data";
import { createInitialProgressState } from "./progress-store";

function makeSubjects(count: number): Subject[] {
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
            scheduledDate: "",
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
  it("renders workload, capacity, horizon, visibility, confidence, and basis from production UI", () => {
    const subjects = makeSubjects(20);
    const state = createInitialProgressState(false);
    state.plannerSettings.defaultDailyHours = 1;
    state.plannerSettings.todayHours = 1;
    const expected = selectForecastViewModel({ subjects, state, horizonWeeks: 2 });

    expect(expected.outsideHorizonLessons).toBeGreaterThan(0);

    const html = renderToStaticMarkup(createElement(ForecastCard, { state, subjects }));

    expect(html).toContain("Dự kiến hoàn thành");
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
});
