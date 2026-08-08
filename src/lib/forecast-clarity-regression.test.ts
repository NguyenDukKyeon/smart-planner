import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ForecastCard } from "@/components/ForecastCard";
import { displayDate } from "./date-utils";
import type { Subject } from "./mock-data";
import { createInitialProgressState } from "./progress-store";

const subjects: Subject[] = [
  {
    id: "math",
    name: "Toán",
    emoji: "📐",
    milestones: [
      {
        id: "topic-1",
        title: "Chủ đề 1",
        subtitle: "",
        lessons: [
          {
            id: "lesson-1",
            title: "Bài 1",
            xp: 10,
            plannedDurationMinutes: 60,
            scheduledDate: "2026-08-08",
            scheduleMode: "flexible",
            weekday: "T7",
            sourceSubject: "Toán",
            week: 1,
            initialDone: false,
          },
        ],
      },
    ],
  },
];

describe("Forecast clarity regression", () => {
  it("does not let a shifted schedule date replace Forecast completion", () => {
    const state = createInitialProgressState(false);
    state.plannerSettings.defaultDailyHours = 2;
    const shiftedDate = "2035-12-31";

    const html = renderToStaticMarkup(
      createElement(ForecastCard, {
        state,
        subjects,
        shiftedDates: { "lesson-1": shiftedDate },
      }),
    );

    expect(html).not.toContain(displayDate(shiftedDate));
  });
});
