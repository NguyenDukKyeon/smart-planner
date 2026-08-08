import fs from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ForecastCard } from "@/components/ForecastCard";
import { displayDate } from "./date-utils";
import { selectForecastViewModel } from "./forecast-view-model";
import type { Subject } from "./mock-data";
import { createInitialProgressState, todayISO } from "./progress-store";
import { createStudySession } from "./study-sessions";

function makeSubjects(count: number, scheduledDate = todayISO(), minutes = 60): Subject[] {
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
            plannedDurationMinutes: minutes,
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

function session(id: string, lessonId: string, minutes: number) {
  return createStudySession({
    id,
    lessonId,
    endedAt: "2026-08-08T12:00:00.000Z",
    durationSeconds: minutes * 60,
    source: "focus-timer",
  });
}

describe("ForecastCard runtime clarity", () => {
  it("renders the canonical projected completion and truthful schedule-capacity labels", () => {
    const subjects = makeSubjects(20);
    const state = createInitialProgressState(false);
    state.plannerSettings.defaultDailyHours = 1;
    state.plannerSettings.todayHours = 1;
    const expected = selectForecastViewModel({ subjects, state, horizonWeeks: 2 });

    expect(expected.outsideHorizonLessons).toBeGreaterThan(0);
    expect(expected.completion.kind).toBe("date");

    const html = renderToStaticMarkup(createElement(ForecastCard, { state, subjects }));

    expect(html).toContain("Mốc học hết bài mới theo lịch hiện tại");
    if (expected.completion.kind === "date") {
      expect(html).toContain(displayDate(expected.completion.dateISO));
    }
    expect(html).toContain("Bài mới");
    expect(html).toContain("Ôn tập");
    expect(html).toContain("Tổng khối lượng");
    expect(html).toContain("Công suất mặc định");
    expect(html).toContain("Phạm vi đang xem");
    expect(html).toContain("2 tuần");
    expect(html).toContain("Ngoài phạm vi");
    expect(html).toContain(`${expected.outsideHorizonLessons} bài chưa hoàn thành`);
    expect(html).toContain("Mức tin cậy");
    expect(html).toContain("Theo lịch công suất hiện tại");
    expect(html).toContain("Chủ nhật nghỉ nếu không đặt riêng");
    expect(html).not.toContain("Tính toán theo vận tốc học đều");
  });

  it("renders planned new-learning workload instead of short historical-session averages", () => {
    const subjects = makeSubjects(3, todayISO(), 120);
    const state = createInitialProgressState(false);
    state.plannerSettings.defaultDailyHours = 4;
    state.plannerSettings.todayHours = 4;
    state.completedLessons = { "runtime-lesson-3": todayISO() };
    state.studySessions = [
      session("short-1", "runtime-lesson-3", 20),
      session("short-2", "runtime-lesson-3", 20),
      session("short-3", "runtime-lesson-3", 20),
    ];
    state.studyMeta.actualMinutes = { "runtime-lesson-3": [20, 20, 20] };

    const html = renderToStaticMarkup(createElement(ForecastCard, { state, subjects }));

    expect(html).toContain("Bài mới");
    expect(html).toContain("4 giờ");
  });

  it("renders a truthful no-date state when ordinary work has no schedule date", () => {
    const subjects = makeSubjects(1, "", 120);
    const state = createInitialProgressState(false);
    state.plannerSettings.defaultDailyHours = 2;
    state.plannerSettings.todayHours = 2;

    const html = renderToStaticMarkup(createElement(ForecastCard, { state, subjects }));

    expect(html).toContain("Chưa thể xác định ngày hoàn thành");
    expect(html).not.toMatch(/\d{2}\/\d{2}\/\d{4}\s*[–-]\s*\d{2}\/\d{2}\/\d{4}/);
  });

  it("does not claim high confidence from many sessions on too few completed lessons", () => {
    const subjects = makeSubjects(4, todayISO(), 120);
    const state = createInitialProgressState(false);
    state.plannerSettings.defaultDailyHours = 4;
    state.plannerSettings.todayHours = 4;
    state.completedLessons = {
      "runtime-lesson-1": todayISO(),
      "runtime-lesson-2": todayISO(),
    };
    state.studySessions = Array.from({ length: 22 }, (_, index) =>
      session(`confidence-${index}`, `runtime-lesson-${(index % 2) + 1}`, 10),
    );

    const html = renderToStaticMarkup(createElement(ForecastCard, { state, subjects }));

    expect(html).toContain("Chưa đủ dữ liệu thực tế");
    expect(html).not.toContain("Độ tin cậy cao");
    expect(html).toContain("Độ tin cậy dựa trên 2 bài đã hoàn thành có dữ liệu học thực tế");
    expect(html).not.toMatch(/~\d+p\/bài/);
  });

  it("reports date-specific capacity overrides without pretending every day uses one speed", () => {
    const subjects = makeSubjects(3, todayISO(), 120);
    const state = createInitialProgressState(false);
    state.plannerSettings.defaultDailyHours = 2;
    state.plannerSettings.todayHours = 2;
    state.plannerSettings.dailyHours = { "2026-08-10": 4 };

    const html = renderToStaticMarkup(createElement(ForecastCard, { state, subjects }));

    expect(html).toContain("Theo lịch công suất hiện tại");
    expect(html).toContain("mặc định 2 giờ/ngày");
    expect(html).toContain("Có 1 ngày đặt công suất riêng được tính vào dự báo");
    expect(html).not.toContain("Tính toán theo vận tốc học đều 2 giờ/ngày");
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

  it("keeps shifted dates as a compatibility-only Forecast prop while Roadmap remains their owner", async () => {
    const [cardSource, routeSource] = await Promise.all([
      fs.readFile(new URL("../components/ForecastCard.tsx", import.meta.url), "utf8"),
      fs.readFile(new URL("../routes/index.tsx", import.meta.url), "utf8"),
    ]);

    expect(cardSource).toContain("Compatibility-only");
    expect(cardSource).toContain("shiftedDates?: Record<string, string>");
    const forecastSignature =
      cardSource.match(/export function ForecastCard\(([^)]*)\)/)?.[1] ?? "";
    expect(forecastSignature).not.toContain("shiftedDates");
    expect(routeSource).toContain("<LearningRoadmap");
    expect(routeSource).toContain("shiftedDates={shiftedDates}");
  });
});
