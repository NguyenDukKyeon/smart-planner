import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { WeeklyStudySummary } from "@/components/WeeklyStudySummary";
import type { WeeklyMetrics } from "./weekly-metrics";

const dates = [
  "2026-08-03",
  "2026-08-04",
  "2026-08-05",
  "2026-08-06",
  "2026-08-07",
  "2026-08-08",
  "2026-08-09",
];

function makeMetrics(): WeeklyMetrics {
  return {
    weekStartISO: dates[0],
    weekEndISO: dates[6],
    dates,
    lessons: {
      targetTotal: 1,
      metTotal: 1,
      rate: 100,
      targets: [
        {
          lessonId: "lesson-target-raw-123",
          lessonTitle: "Bài trạng thái cần lưu ý",
          subjectId: "math",
          scheduledDate: "2026-08-03",
          effectiveDate: "2026-08-03",
          completionStatus: "completed-undated",
          met: true,
        },
      ],
      outOfPlanCompletions: [
        {
          lessonId: "lesson-outside-raw-456",
          lessonTitle: "Bài hoàn thành ngoài kế hoạch",
          subjectId: "math",
          completedOn: "2026-08-04",
        },
      ],
    },
    habits: {
      targetTotal: 0,
      completedTotal: 0,
      rate: 0,
      details: [],
    },
    time: {
      actualMinutes: 102,
      targetMinutes: 0,
      rate: 0,
      dailyActualMinutes: Object.fromEntries(dates.map((dateISO) => [dateISO, 0])),
      dailyTargetMinutes: Object.fromEntries(dates.map((dateISO) => [dateISO, 0])),
    },
    subjects: [],
    archivedActivity: [
      {
        lessonId: "lesson-archived-raw-789",
        lessonTitle: "Bài học không còn trong lộ trình",
        completedOn: "2026-08-03",
        focusMinutes: 102,
      },
    ],
  };
}

describe("WeeklyStudySummary historical lesson labels", () => {
  test("renders resolved titles in all historical status sections without exposing raw lesson IDs", () => {
    const html = renderToStaticMarkup(
      <WeeklyStudySummary metrics={makeMetrics()} todayTargetMinutes={0} />,
    );

    for (const title of [
      "Bài trạng thái cần lưu ý",
      "Bài hoàn thành ngoài kế hoạch",
      "Bài học không còn trong lộ trình",
    ]) {
      expect(html).toContain(title);
    }
    for (const lessonId of [
      "lesson-target-raw-123",
      "lesson-outside-raw-456",
      "lesson-archived-raw-789",
    ]) {
      expect(html).not.toContain(lessonId);
    }
    expect(html).toContain("Hoàn thành, không rõ ngày");
    expect(html).toContain("hoàn thành 2026-08-03");
    expect(html).toContain("1 giờ 42 phút tập trung");
  });
});
