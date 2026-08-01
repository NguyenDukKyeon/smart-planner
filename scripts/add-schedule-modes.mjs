import { readFileSync, writeFileSync } from "node:fs";

function updateFile(relativePath, transform) {
  const url = new URL(`../${relativePath}`, import.meta.url);
  const source = readFileSync(url, "utf8");
  const next = transform(source);
  if (next !== source) writeFileSync(url, next, "utf8");
}

function replaceOnce(source, before, after, marker, label) {
  if (marker && source.includes(marker)) return source;
  if (!source.includes(before)) throw new Error(`Không thể cập nhật ${label}.`);
  return source.replace(before, after);
}

function replacePattern(source, pattern, after, marker, label) {
  if (marker && source.includes(marker)) return source;
  if (!pattern.test(source)) throw new Error(`Không thể cập nhật ${label}.`);
  return source.replace(pattern, after);
}

updateFile("src/lib/mock-data.ts", (initial) => {
  let source = initial;
  source = replaceOnce(
    source,
    "export type Lesson = {",
    'export type LessonScheduleMode = "fixed" | "flexible";\n\nexport type Lesson = {',
    "export type LessonScheduleMode",
    "kiểu chế độ lịch",
  );
  source = replaceOnce(
    source,
    "  scheduledDate: string;\n  weekday: string;",
    "  scheduledDate: string;\n  scheduleMode?: LessonScheduleMode;\n  weekday: string;",
    "scheduleMode?: LessonScheduleMode",
    "thuộc tính chế độ lịch",
  );
  source = replaceOnce(
    source,
    "      scheduledDate: raw.date,\n      weekday: \"Thứ 7\",",
    "      scheduledDate: raw.date,\n      scheduleMode: \"flexible\",\n      weekday: \"Thứ 7\",",
    'scheduleMode: "flexible"',
    "chế độ mặc định cho lộ trình mẫu",
  );
  return source;
});

updateFile("src/lib/custom-subjects.ts", (initial) => {
  let source = initial;
  source = replaceOnce(
    source,
    'import { type Subject, type Lesson, SUBJECTS as DEFAULT_SUBJECTS } from "./mock-data";',
    'import {\n  type Subject,\n  type Lesson,\n  type LessonScheduleMode,\n  SUBJECTS as DEFAULT_SUBJECTS,\n} from "./mock-data";',
    "type LessonScheduleMode",
    "import chế độ lịch",
  );
  source = replaceOnce(
    source,
    "  scheduledDate: string;\n  xp?: number;",
    "  scheduledDate: string;\n  scheduleMode?: LessonScheduleMode;\n  xp?: number;",
    "scheduleMode?: LessonScheduleMode",
    "dữ liệu nhập chế độ lịch",
  );
  source = replaceOnce(
    source,
    "          scheduledDate: lessonDate,\n          weekday: lessonDate ? weekdayFullVi(lessonDate) : \"\",",
    "          scheduledDate: lessonDate,\n          scheduleMode: item.scheduleMode === \"fixed\" ? \"fixed\" : \"flexible\",\n          weekday: lessonDate ? weekdayFullVi(lessonDate) : \"\",",
    "scheduleMode: item.scheduleMode",
    "chế độ lịch khi nhập bài",
  );
  source = replaceOnce(
    source,
    "    scheduledDate: lessonDate,\n    weekday: lessonDate ? weekdayFullVi(lessonDate) : \"\",",
    "    scheduledDate: lessonDate,\n    scheduleMode: rawLesson.scheduleMode === \"fixed\" ? \"fixed\" : \"flexible\",\n    weekday: lessonDate ? weekdayFullVi(lessonDate) : \"\",",
    "scheduleMode: rawLesson.scheduleMode",
    "chế độ lịch bài mới",
  );
  source = replaceOnce(
    source,
    "                topic: typeof lesson.topic === \"string\" ? lesson.topic : undefined,\n                plannedDurationMinutes:",
    "                topic: typeof lesson.topic === \"string\" ? lesson.topic : undefined,\n                scheduleMode: lesson.scheduleMode === \"fixed\" ? \"fixed\" : \"flexible\",\n                plannedDurationMinutes:",
    'scheduleMode: lesson.scheduleMode === "fixed"',
    "chuẩn hóa chế độ lịch cũ",
  );
  source = replaceOnce(
    source,
    'Pick<Lesson, "title" | "topic" | "plannedDurationMinutes" | "scheduledDate" | "xp">',
    'Pick<\n      Lesson,\n      "title" | "topic" | "plannedDurationMinutes" | "scheduledDate" | "scheduleMode" | "xp"\n    >',
    '"scheduleMode" | "xp"',
    "patch chỉnh một bài",
  );
  source = replaceOnce(
    source,
    "      scheduledDate,\n      weekday: scheduledDate ? weekdayFullVi(scheduledDate) : \"\",",
    "      scheduledDate,\n      scheduleMode:\n        patch.scheduleMode === \"fixed\" || patch.scheduleMode === \"flexible\"\n          ? patch.scheduleMode\n          : lesson.scheduleMode ?? \"flexible\",\n      weekday: scheduledDate ? weekdayFullVi(scheduledDate) : \"\",",
    "patch.scheduleMode === \"fixed\"",
    "lưu chế độ lịch khi sửa bài",
  );
  source = replaceOnce(
    source,
    'patch: Partial<Pick<Lesson, "plannedDurationMinutes" | "scheduledDate">>,',
    'patch: Partial<Pick<Lesson, "plannedDurationMinutes" | "scheduledDate" | "scheduleMode">>,',
    '"scheduledDate" | "scheduleMode"',
    "patch chỉnh hàng loạt",
  );
  source = replaceOnce(
    source,
    "          scheduledDate,\n          weekday: scheduledDate ? weekdayFullVi(scheduledDate) : \"\",",
    "          scheduledDate,\n          scheduleMode:\n            patch.scheduleMode === \"fixed\" || patch.scheduleMode === \"flexible\"\n              ? patch.scheduleMode\n              : lesson.scheduleMode ?? \"flexible\",\n          weekday: scheduledDate ? weekdayFullVi(scheduledDate) : \"\",",
    "patch.scheduleMode === \"fixed\" || patch.scheduleMode === \"flexible\"",
    "lưu chế độ lịch hàng loạt",
  );
  return source;
});

updateFile("src/components/AddLessonModal.tsx", (initial) => {
  let source = initial;
  source = replaceOnce(
    source,
    'import type { Subject } from "@/lib/mock-data";',
    'import type { LessonScheduleMode, Subject } from "@/lib/mock-data";',
    "LessonScheduleMode, Subject",
    "import kiểu lịch vào form thêm bài",
  );
  source = replaceOnce(
    source,
    "  const [date, setDate] = useState(todayISO());\n  const xp = 30;",
    '  const [date, setDate] = useState(todayISO());\n  const [scheduleMode, setScheduleMode] = useState<LessonScheduleMode>("flexible");\n  const xp = 30;',
    "setScheduleMode",
    "trạng thái chế độ lịch form thêm",
  );
  source = replaceOnce(
    source,
    "    setDate(todayISO());\n    setErrors({});",
    '    setDate(todayISO());\n    setScheduleMode("flexible");\n    setErrors({});',
    'setScheduleMode("flexible")',
    "reset chế độ lịch",
  );
  source = replaceOnce(
    source,
    "    if (topicChoice === NEW_TOPIC && !topicName) {",
    '    if (scheduleMode === "fixed" && !date) {\n      toast.error("Bài cố định cần có ngày học cụ thể.");\n      return;\n    }\n    if (topicChoice === NEW_TOPIC && !topicName) {',
    'Bài cố định cần có ngày học cụ thể.',
    "xác thực ngày cố định",
  );
  source = replaceOnce(
    source,
    "      scheduledDate: date,\n      xp,",
    "      scheduledDate: date,\n      scheduleMode,\n      xp,",
    "scheduleMode,\n      xp",
    "lưu chế độ lịch bài mới",
  );
  source = replaceOnce(
    source,
    '          <div className="space-y-1.5">\n            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">\n              <Calendar className="h-3.5 w-3.5 text-purple-600" />\n              Ngày học dự kiến\n            </Label>',
    `          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Cách xếp lịch</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={scheduleMode === "flexible" ? "default" : "outline"}
                className="h-auto rounded-xl px-3 py-2 text-left"
                onClick={() => setScheduleMode("flexible")}
              >
                <span>
                  <span className="block text-xs font-bold">Linh hoạt</span>
                  <span className="block text-[10px] font-normal opacity-80">
                    Có thể dời sang ngày sau
                  </span>
                </span>
              </Button>
              <Button
                type="button"
                variant={scheduleMode === "fixed" ? "default" : "outline"}
                className="h-auto rounded-xl px-3 py-2 text-left"
                onClick={() => setScheduleMode("fixed")}
              >
                <span>
                  <span className="block text-xs font-bold">Cố định</span>
                  <span className="block text-[10px] font-normal opacity-80">
                    Chỉ học đúng ngày này
                  </span>
                </span>
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-purple-600" />
              {scheduleMode === "fixed" ? "Ngày học cố định" : "Có thể học từ ngày"}
            </Label>`,
    "Có thể dời sang ngày sau",
    "giao diện chọn chế độ lịch",
  );
  source = replaceOnce(
    source,
    "                Bỏ ngày cố định",
    "                Bỏ ngày",
    null,
    "nhãn bỏ ngày",
  );
  return source;
});

updateFile("src/components/CourseManagerModal.tsx", (initial) => {
  let source = initial;
  source = replaceOnce(
    source,
    'import type { Lesson, Subject } from "@/lib/mock-data";',
    'import type { Lesson, LessonScheduleMode, Subject } from "@/lib/mock-data";',
    "LessonScheduleMode, Subject",
    "import kiểu lịch vào quản lý bài",
  );
  source = replacePattern(
    source,
    /const \[lessonDraft, setLessonDraft\] = useState\(\{[\s\S]*?date: "",?\s*\}\);/,
    'const [lessonDraft, setLessonDraft] = useState({\n    title: "",\n    subjectId: "",\n    topicId: "",\n    minutes: 120,\n    date: "",\n    scheduleMode: "flexible" as LessonScheduleMode,\n  });',
    "scheduleMode: \"flexible\" as LessonScheduleMode",
    "trạng thái sửa chế độ lịch",
  );
  source = replaceOnce(
    source,
    "      date: lesson.scheduledDate,\n    });",
    '      date: lesson.scheduledDate,\n      scheduleMode: lesson.scheduleMode ?? "flexible",\n    });',
    "scheduleMode: lesson.scheduleMode",
    "mở form với chế độ hiện tại",
  );
  source = replaceOnce(
    source,
    '    if (!Number.isFinite(lessonDraft.minutes) || lessonDraft.minutes <= 0) {\n      return toast.error("Thời lượng mục tiêu phải lớn hơn 0.");\n    }',
    '    if (!Number.isFinite(lessonDraft.minutes) || lessonDraft.minutes <= 0) {\n      return toast.error("Thời lượng mục tiêu phải lớn hơn 0.");\n    }\n    if (lessonDraft.scheduleMode === "fixed" && !lessonDraft.date) {\n      return toast.error("Bài cố định cần có ngày học cụ thể.");\n    }',
    "lessonDraft.scheduleMode === \"fixed\"",
    "xác thực bài cố định khi sửa",
  );
  source = replaceOnce(
    source,
    "      scheduledDate: lessonDraft.date,\n    });",
    "      scheduledDate: lessonDraft.date,\n      scheduleMode: lessonDraft.scheduleMode,\n    });",
    "scheduleMode: lessonDraft.scheduleMode",
    "lưu chế độ lịch khi sửa",
  );
  source = replaceOnce(
    source,
    `            <div className="sm:col-span-2">
              <Label>Ngày học dự kiến</Label>`,
    `            <div className="sm:col-span-2">
              <Label>Cách xếp lịch</Label>
              <select
                aria-label="Chọn cách xếp lịch"
                value={lessonDraft.scheduleMode}
                onChange={(event) =>
                  setLessonDraft((current) => ({
                    ...current,
                    scheduleMode: event.target.value as LessonScheduleMode,
                  }))
                }
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="flexible">Linh hoạt — có thể dời sang ngày sau</option>
                <option value="fixed">Cố định — chỉ học đúng ngày đã chọn</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <Label>
                {lessonDraft.scheduleMode === "fixed"
                  ? "Ngày học cố định"
                  : "Có thể học từ ngày"}
              </Label>`,
    "Chọn cách xếp lịch",
    "giao diện sửa chế độ lịch",
  );
  return source;
});

updateFile("src/lib/planner.ts", (initial) => {
  let source = initial;
  source = replacePattern(
    source,
    /export function remainingBySubject\([\s\S]*?\n}\n\nexport function reviewTaskId/,
    `export function remainingBySubject(
  subjects: Subject[],
  completed: Record<string, string>,
  consumed: Set<string> = new Set(),
  dateISO?: string,
): Record<string, Lesson[]> {
  const sortedSubjects = sortSubjects(subjects);
  const out: Record<string, Lesson[]> = {};
  for (const subject of sortedSubjects) {
    const list: Lesson[] = [];
    for (const milestone of subject.milestones) {
      for (const lesson of milestone.lessons) {
        if (completed[lesson.id] || consumed.has(lesson.id)) continue;
        if ((lesson.scheduleMode ?? "flexible") !== "flexible") continue;
        if (!lesson.scheduledDate) continue;
        if (dateISO && lesson.scheduledDate > dateISO) continue;
        list.push(lesson);
      }
    }
    list.sort((left, right) => left.scheduledDate.localeCompare(right.scheduledDate));
    out[subject.id] = list;
  }
  return out;
}

function fixedLessonsScheduledOn(
  subjects: Subject[],
  completed: Record<string, string>,
  consumed: Set<string>,
  dateISO: string,
  meta: StudyMeta,
): Lesson[] {
  const lessons = subjects.flatMap((subject) =>
    subject.milestones.flatMap((milestone) =>
      milestone.lessons.filter(
        (lesson) =>
          !completed[lesson.id] &&
          !consumed.has(lesson.id) &&
          (lesson.scheduleMode ?? "flexible") === "fixed" &&
          lesson.scheduledDate === dateISO,
      ),
    ),
  );
  return lessons.sort((left, right) => {
    const durationDifference =
      estimateLessonMinutes(left.id, meta, subjects) -
      estimateLessonMinutes(right.id, meta, subjects);
    if (durationDifference !== 0) return durationDifference;
    return left.title.localeCompare(right.title, "vi");
  });
}

export function reviewTaskId`,
    "function fixedLessonsScheduledOn(",
    "tách bài cố định khỏi hàng linh hoạt",
  );

  source = replaceOnce(
    source,
    "  reviewLessons: {\n    lessonId: string;",
    "  unplacedFixedLessons: Lesson[];\n  reviewLessons: {\n    lessonId: string;",
    "unplacedFixedLessons: Lesson[]",
    "danh sách bài cố định chưa xếp",
  );
  source = replaceOnce(
    source,
    "  reviewMinutes: number;\n  unallocatedMinutes: number;",
    "  reviewMinutes: number;\n  unplacedFixedMinutes: number;\n  unallocatedMinutes: number;",
    "unplacedFixedMinutes: number",
    "tổng phút cố định chưa xếp",
  );

  source = replacePattern(
    source,
    /  if \(quotaMinutes > 0\) \{[\s\S]*?\n  }\n\n  const sortedNewLessons =/,
    `  const unplacedFixedLessons: Lesson[] = [];
  let unplacedFixedMinutes = 0;

  if (quotaMinutes > 0) {
    const newBudget = Math.max(0, quotaMinutes - reviewMinutes);

    // Bài cố định chỉ có một cơ hội ở đúng ngày đã chọn. Bài không vừa
    // ngân sách được đưa vào khu vực "Chưa xếp được", không dời sang ngày sau.
    const fixedCandidates = fixedLessonsScheduledOn(
      subjects,
      completed,
      consumed,
      dateISO,
      meta,
    );
    for (const lesson of fixedCandidates) {
      const estimatedMinutes = estimateLessonMinutes(lesson.id, meta, subjects);
      if (newMinutes + estimatedMinutes <= newBudget) {
        newLessons.push(lesson);
        newMinutes += estimatedMinutes;
        consumed.add(lesson.id);
      } else {
        unplacedFixedLessons.push(lesson);
        unplacedFixedMinutes += estimatedMinutes;
      }
    }

    // Bài linh hoạt được mang sang các ngày sau, nhưng không bao giờ bị kéo
    // lên trước ngày bắt đầu mà người dùng đã chọn.
    const sortedSubjects = sortSubjects(subjects);
    const pools = remainingBySubject(sortedSubjects, completed, consumed, dateISO);
    const order = sortedSubjects.map((subject) => subject.id);
    const cursors: Record<string, number> = Object.fromEntries(order.map((id) => [id, 0]));
    const subjectPickCounts: Record<string, number> = Object.fromEntries(
      order.map((id) => [id, 0]),
    );

    let guard = 0;
    while (guard++ < 1000) {
      const remainingBudget = newBudget - newMinutes;
      const candidates = order.flatMap((subjectId, subjectOrder) => {
        const pool = pools[subjectId] || [];
        const lesson = pool[cursors[subjectId]];
        if (!lesson) return [];
        const estimatedMinutes = estimateLessonMinutes(lesson.id, meta, subjects);
        if (estimatedMinutes > remainingBudget) return [];
        return [{ subjectId, subjectOrder, lesson, estimatedMinutes }];
      });
      if (candidates.length === 0) break;

      candidates.sort((left, right) => {
        const pickDifference =
          subjectPickCounts[left.subjectId] - subjectPickCounts[right.subjectId];
        if (pickDifference !== 0) return pickDifference;
        const dateDifference = left.lesson.scheduledDate.localeCompare(
          right.lesson.scheduledDate,
        );
        if (dateDifference !== 0) return dateDifference;
        const durationDifference = left.estimatedMinutes - right.estimatedMinutes;
        if (durationDifference !== 0) return durationDifference;
        return left.subjectOrder - right.subjectOrder;
      });

      const selected = candidates[0];
      newLessons.push(selected.lesson);
      newMinutes += selected.estimatedMinutes;
      consumed.add(selected.lesson.id);
      cursors[selected.subjectId] += 1;
      subjectPickCounts[selected.subjectId] += 1;
    }
  } else {
    const fixedCandidates = fixedLessonsScheduledOn(
      subjects,
      completed,
      consumed,
      dateISO,
      meta,
    );
    unplacedFixedLessons.push(...fixedCandidates);
    unplacedFixedMinutes = fixedCandidates.reduce(
      (sum, lesson) => sum + estimateLessonMinutes(lesson.id, meta, subjects),
      0,
    );
  }

  const sortedNewLessons =`,
    "const unplacedFixedLessons: Lesson[]",
    "xếp bài cố định và linh hoạt",
  );

  source = replaceOnce(
    source,
    "    newLessons: sortedNewLessons,\n    reviewLessons,",
    "    newLessons: sortedNewLessons,\n    unplacedFixedLessons,\n    reviewLessons,",
    "unplacedFixedLessons,\n    reviewLessons",
    "trả danh sách chưa xếp",
  );
  source = replaceOnce(
    source,
    "    reviewMinutes,\n    unallocatedMinutes:",
    "    reviewMinutes,\n    unplacedFixedMinutes,\n    unallocatedMinutes:",
    "unplacedFixedMinutes,\n    unallocatedMinutes",
    "trả phút chưa xếp",
  );
  return source;
});

updateFile("src/components/FlexiblePlanner.tsx", (initial) => {
  let source = initial;
  source = replaceOnce(
    source,
    "  const weeks = useMemo<WeekGroup[]>(() => {",
    `  const unplacedFixedLessons = useMemo(() => {
    const scheduledIds = new Set(
      days.flatMap((day) => day.queue.newLessons.map((lesson) => lesson.id)),
    );
    const lastVisibleDate = days.at(-1)?.dateISO ?? today;
    return subjects
      .flatMap((subject) =>
        subject.milestones.flatMap((milestone) =>
          milestone.lessons.map((lesson) => ({
            lesson,
            subject,
            topic: milestone.title,
          })),
        ),
      )
      .filter(
        ({ lesson }) =>
          !state.completedLessons[lesson.id] &&
          (lesson.scheduleMode ?? "flexible") === "fixed" &&
          Boolean(lesson.scheduledDate) &&
          lesson.scheduledDate <= lastVisibleDate &&
          !scheduledIds.has(lesson.id),
      )
      .sort((left, right) =>
        left.lesson.scheduledDate.localeCompare(right.lesson.scheduledDate),
      );
  }, [days, state.completedLessons, subjects, today]);

  const weeks = useMemo<WeekGroup[]>(() => {`,
    "const unplacedFixedLessons = useMemo",
    "tổng hợp bài cố định chưa xếp",
  );
  source = replaceOnce(
    source,
    '      <div className="mt-4 flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between px-1">',
    `      {unplacedFixedLessons.length > 0 && (
        <section className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-amber-950">Chưa xếp được trong ngày cố định</h3>
              <p className="mt-0.5 text-xs text-amber-800">
                {unplacedFixedLessons.length} bài vượt quỹ giờ. Các bài này không bị dời
                sang ngày khác và vẫn được giữ ở đây.
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-800">
              {unplacedFixedLessons.reduce(
                (sum, item) => sum + item.lesson.plannedDurationMinutes,
                0,
              )} phút
            </span>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {unplacedFixedLessons.map(({ lesson, subject, topic }) => (
              <li
                key={lesson.id}
                className="rounded-xl border border-amber-200 bg-white p-3 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-slate-900">{lesson.title}</span>
                  <span className="shrink-0 text-amber-800">
                    {lesson.plannedDurationMinutes}p
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {subject.emoji} {subject.name} · {topic} · {displayDate(lesson.scheduledDate)}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-4 flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between px-1">`,
    "Chưa xếp được trong ngày cố định",
    "khu vực bài cố định chưa xếp",
  );
  source = replaceOnce(
    source,
    `          {day.queue.overloadMinutes > 0
            ? \`Quá: \${day.queue.overloadMinutes}p\`
            : \`Dự phòng: \${day.queue.unallocatedMinutes}p\`}`,
    `          {day.queue.unplacedFixedLessons.length > 0
            ? \`Chưa xếp: \${day.queue.unplacedFixedLessons.length} bài cố định\`
            : day.queue.overloadMinutes > 0
              ? \`Quá: \${day.queue.overloadMinutes}p\`
              : \`Dự phòng: \${day.queue.unallocatedMinutes}p\`}`,
    "day.queue.unplacedFixedLessons.length",
    "trạng thái bài cố định chưa xếp theo ngày",
  );
  return source;
});

updateFile("src/components/LearningRoadmap.tsx", (initial) => {
  let source = initial;
  source = replaceOnce(
    source,
    "  subjects = SUBJECTS,\n  onSubjectsUpdated,",
    "  shiftedDates = {},\n  subjects = SUBJECTS,\n  onSubjectsUpdated,",
    "shiftedDates = {}",
    "nhận lịch điều chỉnh trong lộ trình",
  );
  source = replacePattern(
    source,
    /    const lessonsWithDate = activeLessons\.map\([\s\S]*?\n    \}\)\);/,
    `    const lessonsWithDate = activeLessons.map((lesson) => {
      const mode = lesson.scheduleMode ?? "flexible";
      const effectiveDate = completed[lesson.id]
        ? completed[lesson.id]
        : mode === "fixed"
          ? shiftedDates[lesson.id] ?? "unplaced-fixed"
          : shiftedDates[lesson.id] ?? lesson.scheduledDate;
      return { ...lesson, effectiveDate };
    });`,
    '"unplaced-fixed"',
    "ngày hiệu lực theo chế độ lịch",
  );
  source = replaceOnce(
    source,
    '      const mon = l.effectiveDate ? getMondayISO(l.effectiveDate) : "unscheduled";',
    '      const mon =\n        l.effectiveDate === "unplaced-fixed"\n          ? "unplaced-fixed"\n          : l.effectiveDate\n            ? getMondayISO(l.effectiveDate)\n            : "unscheduled";',
    'l.effectiveDate === "unplaced-fixed"',
    "nhóm bài cố định chưa xếp",
  );
  source = replaceOnce(
    source,
    `      if (a === "unscheduled") return 1;
      if (b === "unscheduled") return -1;`,
    `      const specialRank = (value: string) =>
        value === "unplaced-fixed" ? 1 : value === "unscheduled" ? 2 : 0;
      const rankDifference = specialRank(a) - specialRank(b);
      if (rankDifference !== 0) return rankDifference;`,
    "specialRank",
    "thứ tự nhóm đặc biệt",
  );
  source = replaceOnce(
    source,
    '      if (mon === "unscheduled") {',
    `      if (mon === "unplaced-fixed") {
        return {
          id: "week-unplaced-fixed",
          title: "Chưa xếp được",
          subtitle: \`\${totalCount} bài cố định vượt quỹ giờ · không tự dời ngày\`,
          mondayISO: "",
          sundayISO: "",
          lessons: list,
          doneCount,
          totalCount,
          isComplete,
        };
      }

      if (mon === "unscheduled") {`,
    "week-unplaced-fixed",
    "milestone bài cố định chưa xếp",
  );
  source = replacePattern(
    source,
    /\}, \[activeLessons, allLessonsFromSubjects, completed(?:, shiftedDates)?\]\);/,
    "}, [activeLessons, allLessonsFromSubjects, completed, shiftedDates]);",
    "completed, shiftedDates]);",
    "dependency lịch điều chỉnh",
  );

  source = replaceOnce(
    source,
    '                  <div className="text-[11px] text-slate-500">\n                    {l.effectiveDate\n                      ? `${weekdayFullVi(l.effectiveDate)} · ${displayDate(l.effectiveDate)}`\n                      : "Chưa xếp ngày"}',
    '                  <div className="text-[11px] text-slate-500">\n                    {l.effectiveDate === "unplaced-fixed"\n                      ? "Không đủ quỹ giờ trong ngày cố định"\n                      : l.effectiveDate\n                        ? `${weekdayFullVi(l.effectiveDate)} · ${displayDate(l.effectiveDate)}`\n                        : "Chưa xếp ngày"}',
    "Không đủ quỹ giờ trong ngày cố định",
    "nhãn bài cố định chưa xếp",
  );
  return source;
});
