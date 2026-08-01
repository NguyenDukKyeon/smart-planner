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

  // Bài cố định phải giữ đúng thứ tự người dùng đã sắp trong Quản lý môn & bài.
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

updateFile("src/lib/custom-subjects.ts", (initial) => {
  let source = initial;

  // targetLessonId = null nghĩa là chèn xuống cuối chủ đề. Điều này cho phép
  // drop indicator thể hiện chính xác cả vị trí phía trên lẫn phía dưới một bài.
  source = replacePattern(
    source,
    /export function moveLessonBeforeInTopic\([\s\S]*?\n}\n\nexport function moveLessonBefore\(/,
    `export function moveLessonBeforeInTopic(
  existingSubjects: Subject[],
  subjectId: string,
  topicId: string,
  sourceLessonId: string,
  targetLessonId: string | null,
): Subject[] {
  if (targetLessonId && sourceLessonId === targetLessonId) return existingSubjects;
  let changed = false;
  const next = existingSubjects.map((subject) => {
    if (subject.id !== subjectId) return subject;
    return {
      ...subject,
      milestones: subject.milestones.map((milestone) => {
        if (milestone.id !== topicId) return milestone;
        const sourceIndex = milestone.lessons.findIndex(
          (lesson) => lesson.id === sourceLessonId,
        );
        if (sourceIndex < 0) return milestone;
        if (
          targetLessonId &&
          !milestone.lessons.some((lesson) => lesson.id === targetLessonId)
        ) {
          return milestone;
        }

        const lessons = [...milestone.lessons];
        const [moving] = lessons.splice(sourceIndex, 1);
        const insertionIndex = targetLessonId
          ? lessons.findIndex((lesson) => lesson.id === targetLessonId)
          : lessons.length;
        lessons.splice(insertionIndex < 0 ? lessons.length : insertionIndex, 0, moving);

        const unchanged = lessons.every(
          (lesson, index) => lesson.id === milestone.lessons[index]?.id,
        );
        if (unchanged) return milestone;
        changed = true;
        return { ...milestone, lessons };
      }),
    };
  });
  return changed ? next : existingSubjects;
}

export function moveLessonBefore(`,
    "targetLessonId: string | null",
    "thả bài trước hoặc sau vị trí đích",
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
    "  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);",
    `  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
  const [dragArmedLessonId, setDragArmedLessonId] = useState<string | null>(null);`,
    "dragArmedLessonId",
    "trạng thái kích hoạt kéo hai bước",
  );

  source = replaceOnce(
    source,
    `  useEffect(() => {
    setSelectedLessonIds(new Set());
    setSelectionMode(false);
    setBulkTargetSubjectId("");
    setBulkTargetTopicId("");
  }, [selectedSubjectId]);`,
    `  useEffect(() => {
    setSelectedLessonIds(new Set());
    setSelectionMode(false);
    setBulkTargetSubjectId("");
    setBulkTargetTopicId("");
    setDragArmedLessonId(null);
  }, [selectedSubjectId]);

  useEffect(() => {
    if (!dragArmedLessonId || draggedLessonId) return;
    const timeout = window.setTimeout(() => setDragArmedLessonId(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [dragArmedLessonId, draggedLessonId]);`,
    "window.setTimeout(() => setDragArmedLessonId(null), 2600)",
    "tự hủy trạng thái sẵn sàng kéo",
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
    `                      draggedLessonId={draggedLessonId}
                      onDraggedLessonChange={setDraggedLessonId}`,
    `                      draggedLessonId={draggedLessonId}
                      onDraggedLessonChange={setDraggedLessonId}
                      dragArmedLessonId={dragArmedLessonId}
                      onDragArmedLessonChange={setDragArmedLessonId}`,
    "dragArmedLessonId={dragArmedLessonId}",
    "truyền trạng thái kích hoạt kéo",
  );

  source = replaceOnce(
    source,
    `  draggedLessonId,
  onDraggedLessonChange,
  onRequestDelete,`,
    `  draggedLessonId,
  onDraggedLessonChange,
  dragArmedLessonId,
  onDragArmedLessonChange,
  onRequestDelete,`,
    "onDragArmedLessonChange,\n  onRequestDelete",
    "tham số kích hoạt kéo",
  );

  source = replaceOnce(
    source,
    `  draggedLessonId: string | null;
  onDraggedLessonChange: (lessonId: string | null) => void;
  onRequestDelete: (lesson: Lesson) => void;`,
    `  draggedLessonId: string | null;
  onDraggedLessonChange: (lessonId: string | null) => void;
  dragArmedLessonId: string | null;
  onDragArmedLessonChange: (lessonId: string | null) => void;
  onRequestDelete: (lesson: Lesson) => void;`,
    "dragArmedLessonId: string | null",
    "kiểu tham số kích hoạt kéo",
  );

  source = replaceOnce(
    source,
    "  const [open, setOpen] = useState(true);",
    `  const [open, setOpen] = useState(true);
  const [dropIndicator, setDropIndicator] = useState<{
    lessonId: string;
    edge: "before" | "after";
  } | null>(null);`,
    "const [dropIndicator, setDropIndicator]",
    "trạng thái chỉ báo vị trí thả",
  );

  source = replacePattern(
    source,
    /                <li\n                  key=\{lesson\.id\}[\s\S]*?                  \)\}\n                >/,
    `                <li
                  key={lesson.id}
                  draggable={
                    canReorder &&
                    !selectionMode &&
                    dragArmedLessonId === lesson.id
                  }
                  onClick={(event) => {
                    if (!canReorder || selectionMode || draggedLessonId) return;
                    const target = event.target instanceof HTMLElement ? event.target : null;
                    if (
                      target?.closest(
                        "button, input, select, textarea, a, [data-no-drag]",
                      )
                    ) {
                      return;
                    }
                    onDragArmedLessonChange(lesson.id);
                  }}
                  onDragStart={(event: DragEvent<HTMLLIElement>) => {
                    if (dragArmedLessonId !== lesson.id) {
                      event.preventDefault();
                      return;
                    }
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", lesson.id);
                    onDraggedLessonChange(lesson.id);
                  }}
                  onDragOver={(event) => {
                    if (canReorder && draggedLessonId && draggedLessonId !== lesson.id) {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      const rect = event.currentTarget.getBoundingClientRect();
                      setDropIndicator({
                        lessonId: lesson.id,
                        edge: event.clientY < rect.top + rect.height / 2 ? "before" : "after",
                      });
                    }
                  }}
                  onDragLeave={(event) => {
                    const nextTarget = event.relatedTarget;
                    if (
                      !(nextTarget instanceof Node) ||
                      !event.currentTarget.contains(nextTarget)
                    ) {
                      setDropIndicator(null);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const sourceId = event.dataTransfer.getData("text/plain") || draggedLessonId;
                    if (!canReorder || !sourceId || sourceId === lesson.id) {
                      setDropIndicator(null);
                      return;
                    }
                    const rect = event.currentTarget.getBoundingClientRect();
                    const edge =
                      dropIndicator?.lessonId === lesson.id
                        ? dropIndicator.edge
                        : event.clientY < rect.top + rect.height / 2
                          ? "before"
                          : "after";
                    const beforeLessonId =
                      edge === "before" ? lesson.id : lessons[index + 1]?.id ?? null;
                    onApply(
                      moveLessonBeforeInTopic(
                        subjects,
                        subject.id,
                        topicId,
                        sourceId,
                        beforeLessonId,
                      ),
                      "Đã sắp xếp lại bài học.",
                    );
                    setDropIndicator(null);
                    onDraggedLessonChange(null);
                    onDragArmedLessonChange(null);
                  }}
                  onDragEnd={() => {
                    setDropIndicator(null);
                    onDraggedLessonChange(null);
                    onDragArmedLessonChange(null);
                  }}
                  className={cn(
                    "relative flex items-start gap-3 p-3 sm:items-center",
                    canReorder && !selectionMode && "select-none",
                    dragArmedLessonId === lesson.id &&
                      !draggedLessonId &&
                      "bg-indigo-50/70 ring-2 ring-inset ring-indigo-400",
                    selectedLessonIds.has(lesson.id) && "bg-indigo-50/70",
                    draggedLessonId === lesson.id && "bg-indigo-50 opacity-60",
                  )}
                >`,
    "dragArmedLessonId === lesson.id &&",
    "kéo hai bước và chỉ báo vị trí thả",
  );

  source = replaceOnce(
    source,
    `                  {selectionMode && (`,
    `                  {dropIndicator?.lessonId === lesson.id && draggedLessonId && (
                    <span
                      className={cn(
                        "pointer-events-none absolute left-3 right-3 z-20 h-0.5 bg-indigo-600 shadow-[0_0_0_1px_white]",
                        dropIndicator.edge === "before" ? "-top-px" : "-bottom-px",
                      )}
                      aria-hidden="true"
                    >
                      <span className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-indigo-600 bg-white" />
                      <span
                        className={cn(
                          "absolute left-4 rounded-md bg-indigo-700 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm",
                          dropIndicator.edge === "before"
                            ? "bottom-1"
                            : "top-1",
                        )}
                      >
                        {dropIndicator.edge === "before"
                          ? "Chèn phía trên"
                          : "Chèn phía dưới"}
                      </span>
                    </span>
                  )}
                  {selectionMode && (`,
    "Chèn phía trên",
    "đường ranh giới vị trí thả",
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
                      title="Nhấp một lần để kích hoạt; lần hai giữ và kéo"
                      aria-hidden="true"
                    >
                      <GripVertical className="h-4 w-4" />
                    </span>
                  )}`,
    "Nhấp một lần để kích hoạt; lần hai giữ và kéo",
    "biểu tượng hướng dẫn kéo hai bước",
  );

  source = replaceOnce(
    source,
    `                    >
                      {isCompleted ? "Hoàn thành" : minutes > 0 ? "Đang học" : "Chưa bắt đầu"}
                    </span>`,
    `                    >
                      {isCompleted ? "Hoàn thành" : minutes > 0 ? "Đang học" : "Chưa bắt đầu"}
                    </span>
                    {dragArmedLessonId === lesson.id && !draggedLessonId && (
                      <span className="ml-2 inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        Lần 2: giữ và kéo
                      </span>
                    )}`,
    "Lần 2: giữ và kéo",
    "hướng dẫn trạng thái sẵn sàng kéo",
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
