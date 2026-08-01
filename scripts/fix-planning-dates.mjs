import { readFileSync, writeFileSync } from "node:fs";

function updateFile(relativePath, transform) {
  const url = new URL(`../${relativePath}`, import.meta.url);
  const source = readFileSync(url, "utf8");
  const next = transform(source);
  if (next !== source) writeFileSync(url, next, "utf8");
}

function replaceRequired(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`Không thể cập nhật ${label}.`);
  return source.replace(before, after);
}

function replacePatternRequired(source, pattern, after, alreadyApplied, label) {
  if (source.includes(alreadyApplied)) return source;
  if (!pattern.test(source)) throw new Error(`Không thể cập nhật ${label}.`);
  return source.replace(pattern, after);
}

updateFile("src/lib/planner.ts", (initialSource) => {
  let source = initialSource;

  source = replacePatternRequired(
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
        if (completed[lesson.id]) continue;
        if (consumed.has(lesson.id)) continue;
        if (!lesson.scheduledDate) continue;
        // A future lesson must not be pulled into an earlier day. Overdue lessons
        // remain eligible so the adjusted plan can carry them forward.
        if (dateISO && lesson.scheduledDate > dateISO) continue;
        list.push(lesson);
      }
    }
    list.sort((left, right) => left.scheduledDate.localeCompare(right.scheduledDate));
    out[subject.id] = list;
  }
  return out;
}

export function reviewTaskId`,
    "if (dateISO && lesson.scheduledDate > dateISO) continue;",
    "lọc bài theo ngày có hiệu lực",
  );

  source = replaceRequired(
    source,
    `const REVIEW_MIN_PER_ITEM = 15;

export function pickDayQueue`,
    `const REVIEW_MIN_PER_ITEM = 15;

function lessonsScheduledOn(
  subjects: Subject[],
  completed: Record<string, string>,
  consumed: Set<string>,
  dateISO: string,
): Lesson[] {
  const lessons: Lesson[] = [];
  for (const subject of sortSubjects(subjects)) {
    for (const milestone of subject.milestones) {
      for (const lesson of milestone.lessons) {
        if (completed[lesson.id] || consumed.has(lesson.id)) continue;
        if (lesson.scheduledDate === dateISO) lessons.push(lesson);
      }
    }
  }
  return sortLessonsBySubjectPriority(lessons);
}

export function pickDayQueue`,
    "function lessonsScheduledOn(",
    "hàm lấy bài được ấn định đúng ngày",
  );

  source = replaceRequired(
    source,
    `  for (const l of pinned) {
    if (consumed.has(l.id)) continue;
    newLessons.push(l);
    newMinutes += estimateLessonMinutes(l.id, meta, subjects);
    consumed.add(l.id);
  }

  if (quotaMinutes > 0) {`,
    `  for (const l of pinned) {
    if (consumed.has(l.id)) continue;
    newLessons.push(l);
    newMinutes += estimateLessonMinutes(l.id, meta, subjects);
    consumed.add(l.id);
  }

  // A date selected by the user is authoritative. Keep every lesson assigned
  // to this date visible even when it exceeds the configured capacity; the UI
  // will report the excess instead of silently moving the lesson months later.
  const scheduledToday = lessonsScheduledOn(subjects, completed, consumed, dateISO);
  for (const lesson of scheduledToday) {
    newLessons.push(lesson);
    newMinutes += estimateLessonMinutes(lesson.id, meta, subjects);
    consumed.add(lesson.id);
  }

  if (quotaMinutes > 0) {`,
    "const scheduledToday = lessonsScheduledOn",
    "ghim bài đúng ngày vào lịch điều chỉnh",
  );

  source = replaceRequired(
    source,
    "    const pools = remainingBySubject(sortedSubjects, completed, consumed);",
    "    const pools = remainingBySubject(sortedSubjects, completed, consumed, dateISO);",
    "remainingBySubject(sortedSubjects, completed, consumed, dateISO)",
    "không kéo bài tương lai lên sớm",
  );

  return source;
});

updateFile("src/components/LearningRoadmap.tsx", (initialSource) => {
  let source = initialSource;

  source = replaceRequired(
    source,
    `  shiftedDates = {},
  subjects = SUBJECTS,`,
    `  subjects = SUBJECTS,`,
    "subjects = SUBJECTS,\n  onSubjectsUpdated",
    "bỏ lịch điều chỉnh khỏi lộ trình gốc",
  );

  source = replacePatternRequired(
    source,
    /    const lessonsWithDate = activeLessons\.map\(\(l\) => \{[\s\S]*?      return \{ \.\.\.l, effectiveDate \};\n    \}\);/,
    `    // “Lộ trình” phản ánh ngày người dùng đã đặt. Việc tự dời bài theo
    // công suất chỉ thuộc tab “Lịch điều chỉnh”, không được thay đổi tuần gốc.
    const lessonsWithDate = activeLessons.map((lesson) => ({
      ...lesson,
      effectiveDate: lesson.scheduledDate,
    }));`,
    "effectiveDate: lesson.scheduledDate",
    "nhóm lộ trình theo ngày người dùng đặt",
  );

  source = replaceRequired(
    source,
    "  }, [activeLessons, allLessonsFromSubjects, completed, shiftedDates]);",
    "  }, [activeLessons, allLessonsFromSubjects, completed]);",
    "[activeLessons, allLessonsFromSubjects, completed]);",
    "dependency lộ trình gốc",
  );

  return source;
});
