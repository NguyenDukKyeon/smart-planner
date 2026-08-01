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

updateFile("src/lib/planner.ts", (initial) => {
  let source = initial;

  // Fixed lessons must follow the exact catalog order chosen in Course Manager.
  // Sorting by duration/title made UNIT 4 appear before UNIT 13, even after a
  // deliberate manual reorder.
  source = replacePattern(
    source,
    /  return lessons\.sort\(\(left, right\) => \{[\s\S]*?\n  \}\);\n}\n\nexport function reviewTaskId/,
    `  return lessons;
}

export function reviewTaskId`,
    "return lessons;\n}\n\nexport function reviewTaskId",
    "thứ tự bài cố định theo danh mục",
  );

  return source;
});

updateFile("src/components/CourseManagerModal.tsx", (initial) => {
  let source = initial;

  source = replaceOnce(
    source,
    `function allLessons(subject: Subject): Lesson[] {
  return subject.milestones.flatMap((milestone) => milestone.lessons);
}

export function CourseManagerModal`,
    `function allLessons(subject: Subject): Lesson[] {
  return subject.milestones.flatMap((milestone) => milestone.lessons);
}

function autoScrollDuringLessonDrag(event: DragEvent<HTMLElement>) {
  const container = event.currentTarget.closest<HTMLElement>("[data-course-scroll-container]");
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const threshold = Math.min(120, Math.max(64, rect.height * 0.18));
  const maxStep = 30;
  let delta = 0;

  if (event.clientY < rect.top + threshold) {
    const intensity = Math.min(1, (rect.top + threshold - event.clientY) / threshold);
    delta = -Math.max(6, Math.ceil(maxStep * intensity));
  } else if (event.clientY > rect.bottom - threshold) {
    const intensity = Math.min(1, (event.clientY - (rect.bottom - threshold)) / threshold);
    delta = Math.max(6, Math.ceil(maxStep * intensity));
  }

  if (delta !== 0) container.scrollTop += delta;
}

export function CourseManagerModal`,
    "function autoScrollDuringLessonDrag",
    "tự cuộn khi kéo bài",
  );

  source = replaceOnce(
    source,
    `          <main className={cn("min-h-0 overflow-y-auto bg-white p-4 sm:p-5", !mobileDetail && "hidden md:block")}>`,
    `          <main
            data-course-scroll-container
            onDragOver={(event) => {
              if (!draggedLessonId) return;
              event.preventDefault();
              autoScrollDuringLessonDrag(event);
            }}
            className={cn(
              "min-h-0 overflow-y-auto bg-white p-4 sm:p-5",
              !mobileDetail && "hidden md:block",
            )}
          >`,
    "data-course-scroll-container",
    "vùng cuộn khi kéo bài",
  );

  source = replaceOnce(
    source,
    `                <li
                  key={lesson.id}
                  onDragOver={(event) => {`,
    `                <li
                  key={lesson.id}
                  draggable={canReorder && !selectionMode}
                  onDragStart={(event: DragEvent<HTMLLIElement>) => {
                    const target = event.target instanceof HTMLElement ? event.target : null;
                    if (
                      target?.closest(
                        "button, input, select, textarea, a, [data-no-drag]",
                      )
                    ) {
                      event.preventDefault();
                      return;
                    }
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", lesson.id);
                    onDraggedLessonChange(lesson.id);
                  }}
                  onDragOver={(event) => {`,
    "draggable={canReorder && !selectionMode}",
    "kéo toàn bộ thẻ bài",
  );

  source = replaceOnce(
    source,
    `                  className={cn(
                    "flex items-start gap-3 p-3 sm:items-center",
                    selectedLessonIds.has(lesson.id) && "bg-indigo-50/70",
                    draggedLessonId === lesson.id && "opacity-50",
                  )}`,
    `                  className={cn(
                    "flex items-start gap-3 p-3 sm:items-center",
                    canReorder &&
                      !selectionMode &&
                      "cursor-grab select-none active:cursor-grabbing",
                    selectedLessonIds.has(lesson.id) && "bg-indigo-50/70",
                    draggedLessonId === lesson.id && "bg-indigo-50 opacity-60",
                  )}`,
    "cursor-grab select-none active:cursor-grabbing",
    "trạng thái kéo toàn thẻ",
  );

  source = replaceOnce(
    source,
    `                  {canReorder && !selectionMode && (
                    <span
                      draggable
                      onDragStart={(event: DragEvent<HTMLSpanElement>) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", lesson.id);
                        onDraggedLessonChange(lesson.id);
                      }}
                      onDragEnd={() => onDraggedLessonChange(null)}
                      className="mt-1 inline-flex cursor-grab touch-none text-slate-400 active:cursor-grabbing sm:mt-0"
                      title="Kéo để đổi vị trí trong chủ đề"
                      aria-label={\`Kéo để sắp xếp \${lesson.title}\`}
                      role="button"
                      tabIndex={0}
                    >
                      <GripVertical className="h-4 w-4" />
                    </span>
                  )}`,
    `                  {canReorder && !selectionMode && (
                    <span
                      className="pointer-events-none mt-1 inline-flex shrink-0 text-slate-400 sm:mt-0"
                      title="Giữ và kéo bất kỳ vùng trống nào trên thẻ để đổi vị trí"
                      aria-hidden="true"
                    >
                      <GripVertical className="h-4 w-4" />
                    </span>
                  )}`,
    "Giữ và kéo bất kỳ vùng trống nào trên thẻ",
    "biểu tượng gợi ý kéo toàn thẻ",
  );

  source = replaceOnce(
    source,
    `                    <div className="flex shrink-0 items-center gap-1" aria-label={\`Sắp xếp \${lesson.title}\`}>`,
    `                    <div
                      data-no-drag
                      className="flex shrink-0 items-center gap-1"
                      aria-label={\`Sắp xếp \${lesson.title}\`}
                    >`,
    "data-no-drag",
    "không kéo nhầm vùng nút thao tác",
  );

  return source;
});
