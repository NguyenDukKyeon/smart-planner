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
        // Ngày dự kiến là ngày sớm nhất bài được tham gia lịch điều chỉnh.
        // Bài tương lai không bị kéo lên trước; bài quá hạn được mang sang ngày sau.
        if (dateISO && lesson.scheduledDate > dateISO) continue;
        list.push(lesson);
      }
    }
    list.sort((left, right) => {
      const leftExact = dateISO && left.scheduledDate === dateISO ? 0 : 1;
      const rightExact = dateISO && right.scheduledDate === dateISO ? 0 : 1;
      return leftExact - rightExact || left.scheduledDate.localeCompare(right.scheduledDate);
    });
    out[subject.id] = list;
  }
  return out;
}

export function reviewTaskId`,
    "if (dateISO && lesson.scheduledDate > dateISO) continue;",
    "lọc bài theo ngày đủ điều kiện",
  );

  source = replaceRequired(
    source,
    "    const pools = remainingBySubject(sortedSubjects, completed, consumed);",
    "    const pools = remainingBySubject(sortedSubjects, completed, consumed, dateISO);",
    "không kéo bài tương lai lên sớm",
  );

  source = replacePatternRequired(
    source,
    /    const pools = remainingBySubject\(sortedSubjects, completed, consumed, dateISO\);[\s\S]*?      if \(!picked\) break;\n    }/,
    `    const pools = remainingBySubject(sortedSubjects, completed, consumed, dateISO);
    const order = sortedSubjects.map((subject) => subject.id);
    const cursors: Record<string, number> = Object.fromEntries(order.map((id) => [id, 0]));
    const subjectPickCounts: Record<string, number> = Object.fromEntries(
      order.map((id) => [id, 0]),
    );

    // Mỗi lần chỉ chọn một ứng viên vừa ngân sách. Ưu tiên bài đúng ngày,
    // sau đó cân bằng số bài giữa các môn và chọn bài ngắn hơn khi hòa.
    // Nhờ vậy một môn không thể chiếm hết quỹ giờ trước khi môn mới được xét.
    let guard = 0;
    while (guard++ < 1000) {
      const remainingBudget = newBudget - newMinutes;
      const candidates = order.flatMap((subjectId, subjectOrder) => {
        const pool = pools[subjectId] || [];
        const lesson = pool[cursors[subjectId]];
        if (!lesson) return [];
        const estimatedMinutes = estimateLessonMinutes(lesson.id, meta, subjects);
        if (estimatedMinutes > remainingBudget) return [];
        return [
          {
            subjectId,
            subjectOrder,
            lesson,
            estimatedMinutes,
            exactDate: lesson.scheduledDate === dateISO,
          },
        ];
      });

      if (candidates.length === 0) break;

      candidates.sort((left, right) => {
        if (left.exactDate !== right.exactDate) return left.exactDate ? -1 : 1;
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
      cursors[selected.subjectId] += 1;
      subjectPickCounts[selected.subjectId] += 1;
    }`,
    "const subjectPickCounts:",
    "phân bổ công bằng trong giới hạn ngày",
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
    "dependency lộ trình gốc",
  );

  return source;
});
