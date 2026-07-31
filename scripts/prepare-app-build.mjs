import { readFileSync, writeFileSync } from "node:fs";

function updateFile(relativePath, transform) {
  const source = readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
  const next = transform(source);
  if (next !== source) writeFileSync(new URL(`../${relativePath}`, import.meta.url), next, "utf8");
}

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`Không thể cập nhật ${label}.`);
  return source.replace(before, after);
}

updateFile("src/routes/index.tsx", (initialSource) => {
  let source = initialSource;
  source = replaceRequired(
    source,
    'import { buildShiftedSchedule } from "@/lib/planner";',
    'import { buildShiftedSchedule, pickTodayQueue } from "@/lib/planner";',
    "import hàng đợi hôm nay",
  );

  const shiftedDatesBlock = `  const shiftedDates = useMemo<Record<string, string>>(\n    () =>\n      buildShiftedSchedule({\n        subjects,\n        completed: state.completedLessons,\n        meta: state.studyMeta,\n        settings: state.plannerSettings,\n      }),\n    [subjects, state.completedLessons, state.studyMeta, state.plannerSettings],\n  );\n`;

  const strictStreakBlock = `${shiftedDatesBlock}\n  const todayStudyDayComplete = useMemo<boolean | null>(() => {\n    if (!hydrated || !workspaceStorageLoaded || subjects.length === 0) return null;\n    const queue = pickTodayQueue({\n      subjects,\n      completed: state.completedLessons,\n      reviewCompletions: state.reviewCompletions,\n      meta: state.studyMeta,\n      settings: state.plannerSettings,\n    });\n    const completedNew = queue.newLessons.filter((lesson) =>\n      Boolean(state.completedLessons[lesson.id]),\n    ).length;\n    const completedReviews = queue.reviewLessons.filter((review) => review.completed).length;\n    const total = queue.newLessons.length + queue.reviewLessons.length;\n    return total > 0 && completedNew + completedReviews === total;\n  }, [\n    hydrated,\n    state.completedLessons,\n    state.plannerSettings,\n    state.reviewCompletions,\n    state.studyMeta,\n    subjects,\n    workspaceStorageLoaded,\n  ]);\n\n  const todayStudyDayRecorded =\n    state.habitLog[todayISO()]?.__study_day_complete__ === true;\n\n  useEffect(() => {\n    if (todayStudyDayComplete == null || todayStudyDayRecorded === todayStudyDayComplete) return;\n    updateHabit({ __study_day_complete__: todayStudyDayComplete });\n  }, [todayStudyDayComplete, todayStudyDayRecorded, updateHabit]);\n`;

  source = replaceRequired(
    source,
    shiftedDatesBlock,
    strictStreakBlock,
    "quy tắc chuỗi học nghiêm ngặt",
  );
  return source;
});

updateFile("src/components/TodayPanel.tsx", (source) =>
  source
    .replace(
      "Học ít nhất 1 bài hoặc hoàn thành 25 phút Pomodoro mỗi ngày để giữ chuỗi!",
      "Hoàn thành toàn bộ bài mới và bài ôn hôm nay để giữ chuỗi!",
    )
    .replace(
      "Một ngày học được ghi nhận khi có bài học hoàn thành trong ngày, thói quen học đã đánh dấu, hoặc phiên tập trung có thời lượng dương.",
      "Một ngày chỉ được ghi nhận khi bạn hoàn thành toàn bộ bài mới và bài ôn trong hàng đợi hôm nay.",
    ),
);

updateFile("src/components/StudyStreakCard.tsx", (source) =>
  source.replace(
    /Một ngày học được ghi nhận khi có bài học hoàn thành trong ngày, thói quen học đã đánh\n\s*Dấu, hoặc phiên tập trung có thời lượng dương\./i,
    "Một ngày chỉ được ghi nhận khi bạn hoàn thành toàn bộ bài mới và bài ôn trong hàng đợi\\n          hôm nay. Học một phần hoặc chỉ chạy Pomodoro chưa làm tăng chuỗi.",
  ),
);
