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

function replacePatternRequired(source, pattern, after, marker, label) {
  if (source.includes(marker)) return source;
  if (!pattern.test(source)) throw new Error(`Không thể cập nhật ${label}.`);
  return source.replace(pattern, after);
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

updateFile("src/components/CourseManagerModal.tsx", (initialSource) => {
  let source = initialSource;

  source = replaceRequired(
    source,
    '  const [lessonDraft, setLessonDraft] = useState({ title: "", topic: "", minutes: 120, date: "" });',
    '  const [lessonDraft, setLessonDraft] = useState({ title: "", subjectId: "", topicId: "", minutes: 120, date: "" });',
    "trạng thái chỉnh sửa bài học",
  );

  source = replacePatternRequired(
    source,
    /  const openLessonEdit = \(lesson: Lesson\) => \{[\s\S]*?\n  const subjectStats =/,
    `  const openLessonEdit = (lesson: Lesson) => {\n    const ownerSubject = currentSubjects.find((subject) =>\n      subject.milestones.some((milestone) =>\n        milestone.lessons.some((candidate) => candidate.id === lesson.id),\n      ),\n    );\n    const ownerTopic = ownerSubject?.milestones.find((milestone) =>\n      milestone.lessons.some((candidate) => candidate.id === lesson.id),\n    );\n    setEditingLesson(lesson);\n    setLessonDraft({\n      title: lesson.title,\n      subjectId: ownerSubject?.id ?? selectedSubjectId,\n      topicId: ownerTopic?.id ?? ownerSubject?.milestones[0]?.id ?? "",\n      minutes: lesson.plannedDurationMinutes,\n      date: lesson.scheduledDate,\n    });\n  };\n\n  const editingTargetSubject =\n    currentSubjects.find((subject) => subject.id === lessonDraft.subjectId) ?? null;\n\n  const saveLesson = () => {\n    if (!editingLesson) return;\n    const title = lessonDraft.title.trim();\n    if (!title) return toast.error("Tên bài học không được để trống.");\n    if (!Number.isFinite(lessonDraft.minutes) || lessonDraft.minutes <= 0) {\n      return toast.error("Thời lượng mục tiêu phải lớn hơn 0.");\n    }\n\n    const targetSubject = currentSubjects.find(\n      (subject) => subject.id === lessonDraft.subjectId,\n    );\n    if (!targetSubject) return toast.error("Vui lòng chọn môn học đích.");\n    const targetTopic = targetSubject.milestones.find(\n      (milestone) => milestone.id === lessonDraft.topicId,\n    );\n    if (!targetTopic) return toast.error("Vui lòng chọn chủ đề đích.");\n\n    const currentOwner = currentSubjects.find((subject) =>\n      subject.milestones.some((milestone) =>\n        milestone.lessons.some((candidate) => candidate.id === editingLesson.id),\n      ),\n    );\n\n    let next = updateLessonDetails(currentSubjects, editingLesson.id, {\n      title,\n      plannedDurationMinutes: lessonDraft.minutes,\n      scheduledDate: lessonDraft.date,\n    });\n    if (currentOwner?.id !== targetSubject.id) {\n      next = moveLessonToSubject(next, editingLesson.id, targetSubject.id);\n    }\n    next = moveLessonsToTopic(\n      next,\n      [editingLesson.id],\n      targetSubject.id,\n      targetTopic.id,\n    );\n\n    if (apply(next, \`Đã cập nhật bài “\${title}”.\`)) {\n      setEditingLesson(null);\n    }\n  };\n\n  const subjectStats =`,
    "const editingTargetSubject =",
    "logic chỉnh ngày, thời lượng và chủ đề của bài học",
  );

  const oldLessonDialog = `      <Dialog open={Boolean(editingLesson)} onOpenChange={(next) => !next && setEditingLesson(null)}>\n        <DialogContent className="max-w-lg rounded-3xl">\n          <DialogHeader><DialogTitle>Chỉnh sửa bài học</DialogTitle><DialogDescription>Thời lượng mục tiêu khác với thời lượng một phiên Pomodoro.</DialogDescription></DialogHeader>\n          <div className="grid gap-4 sm:grid-cols-2">\n            <div className="sm:col-span-2"><Label>Tên bài học</Label><Input value={lessonDraft.title} onChange={(event) => setLessonDraft((current) => ({ ...current, title: event.target.value }))} /></div>\n            <div className="sm:col-span-2"><Label>Chủ đề hoặc chương</Label><Input value={lessonDraft.topic} onChange={(event) => setLessonDraft((current) => ({ ...current, topic: event.target.value }))} /></div>\n            <div><Label>Thời lượng mục tiêu</Label><Input type="number" min={1} value={lessonDraft.minutes} onChange={(event) => setLessonDraft((current) => ({ ...current, minutes: Number(event.target.value) }))} /></div>\n            <div><Label>Ngày dự kiến</Label><Input type="date" value={lessonDraft.date} onChange={(event) => setLessonDraft((current) => ({ ...current, date: event.target.value }))} /></div>\n            <div className="flex justify-end gap-2 sm:col-span-2"><Button variant="outline" onClick={() => setEditingLesson(null)}>Hủy</Button><Button onClick={saveLesson}>Lưu thay đổi</Button></div>\n          </div>\n        </DialogContent>\n      </Dialog>`;

  const newLessonDialog = `      <Dialog open={Boolean(editingLesson)} onOpenChange={(next) => !next && setEditingLesson(null)}>\n        <DialogContent className="max-w-xl rounded-3xl">\n          <DialogHeader>\n            <DialogTitle>Chỉnh sửa bài học</DialogTitle>\n            <DialogDescription>Đổi chủ đề, ngày dự kiến và tổng thời lượng mục tiêu của bài.</DialogDescription>\n          </DialogHeader>\n          <div className="grid gap-4 sm:grid-cols-2">\n            <div className="sm:col-span-2">\n              <Label>Tên bài học</Label>\n              <Input\n                value={lessonDraft.title}\n                onChange={(event) =>\n                  setLessonDraft((current) => ({ ...current, title: event.target.value }))\n                }\n              />\n            </div>\n\n            <div>\n              <Label>Môn học</Label>\n              <select\n                aria-label="Chọn môn học đích"\n                value={lessonDraft.subjectId}\n                onChange={(event) => {\n                  const targetSubject = currentSubjects.find(\n                    (subject) => subject.id === event.target.value,\n                  );\n                  setLessonDraft((current) => ({\n                    ...current,\n                    subjectId: event.target.value,\n                    topicId: targetSubject?.milestones[0]?.id ?? "",\n                  }));\n                }}\n                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"\n              >\n                {currentSubjects.map((subject) => (\n                  <option key={subject.id} value={subject.id}>\n                    {subject.emoji} {subject.name}\n                  </option>\n                ))}\n              </select>\n            </div>\n\n            <div>\n              <Label>Chủ đề / chương</Label>\n              <select\n                aria-label="Chọn chủ đề đích"\n                value={lessonDraft.topicId}\n                onChange={(event) =>\n                  setLessonDraft((current) => ({ ...current, topicId: event.target.value }))\n                }\n                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"\n              >\n                {editingTargetSubject?.milestones.map((milestone) => (\n                  <option key={milestone.id} value={milestone.id}>\n                    {milestone.title} ({milestone.lessons.length} bài)\n                  </option>\n                ))}\n              </select>\n            </div>\n\n            <div className="sm:col-span-2">\n              <Label>Thời lượng học mục tiêu</Label>\n              <div className="mt-1 grid grid-cols-5 gap-2">\n                {[30, 45, 60, 90, 120].map((minutes) => (\n                  <Button\n                    key={minutes}\n                    type="button"\n                    size="sm"\n                    variant={lessonDraft.minutes === minutes ? "default" : "outline"}\n                    className="rounded-xl"\n                    onClick={() =>\n                      setLessonDraft((current) => ({ ...current, minutes }))\n                    }\n                  >\n                    {minutes}p\n                  </Button>\n                ))}\n              </div>\n              <Input\n                className="mt-2"\n                type="number"\n                min={1}\n                max={1440}\n                value={lessonDraft.minutes}\n                onChange={(event) =>\n                  setLessonDraft((current) => ({\n                    ...current,\n                    minutes: Number(event.target.value),\n                  }))\n                }\n              />\n              <p className="mt-1 text-[11px] text-slate-500">\n                Đây là tổng thời lượng của bài; các phiên Pomodoro sẽ cộng dồn vào mục tiêu này.\n              </p>\n            </div>\n\n            <div className="sm:col-span-2">\n              <Label>Ngày học dự kiến</Label>\n              <div className="mt-1 flex gap-2">\n                <Input\n                  type="date"\n                  value={lessonDraft.date}\n                  onChange={(event) =>\n                    setLessonDraft((current) => ({ ...current, date: event.target.value }))\n                  }\n                />\n                <Button\n                  type="button"\n                  variant="outline"\n                  className="shrink-0 rounded-xl"\n                  onClick={() =>\n                    setLessonDraft((current) => ({ ...current, date: "" }))\n                  }\n                >\n                  Bỏ ngày\n                </Button>\n              </div>\n            </div>\n\n            <div className="flex justify-end gap-2 sm:col-span-2">\n              <Button variant="outline" onClick={() => setEditingLesson(null)}>Hủy</Button>\n              <Button onClick={saveLesson}>Lưu bài học</Button>\n            </div>\n          </div>\n        </DialogContent>\n      </Dialog>`;

  source = replaceRequired(
    source,
    oldLessonDialog,
    newLessonDialog,
    "form chỉnh sửa bài học đầy đủ",
  );

  source = replaceRequired(
    source,
    '                  {!selectionMode && <DropdownMenu>',
    '                  {!selectionMode && (\n                    <Button\n                      type="button"\n                      variant="ghost"\n                      size="icon"\n                      className="h-8 w-8 shrink-0 rounded-lg"\n                      onClick={() => onEdit(lesson)}\n                      aria-label={`Chỉnh sửa ${lesson.title}`}\n                      title="Chỉnh ngày, thời lượng và chủ đề"\n                    >\n                      <Edit3 className="h-4 w-4" />\n                    </Button>\n                  )}\n                  {!selectionMode && <DropdownMenu>',
    "nút sửa nhanh trên từng bài học",
  );

  return source;
});
