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

function replacePatternRequired(source, pattern, after, marker, label) {
  if (source.includes(marker)) return source;
  if (!pattern.test(source)) throw new Error(`Không thể cập nhật ${label}.`);
  return source.replace(pattern, after);
}

updateFile("src/routes/index.tsx", (initialSource) => {
  let source = initialSource.replace("Lịch điều chỉnh", "Lịch linh hoạt");

  source = replaceRequired(
    source,
    `                <FlexiblePlanner
                  state={state}
                  subjects={subjects}
                  onSetDayHours={setDayHours}
                />`,
    `                <FlexiblePlanner
                  state={state}
                  subjects={subjects}
                  onSetDayHours={setDayHours}
                  onSubjectsUpdated={updateSubjectsSafely}
                />`,
    "kết nối cập nhật môn học từ lịch linh hoạt",
  );

  return source;
});

updateFile("src/components/CourseManagerModal.tsx", (initialSource) => {
  if (initialSource.includes("Kéo một lần bằng tay cầm để đổi vị trí")) {
    return initialSource;
  }

  let source = initialSource;

  // Thẻ là vùng nhận vị trí thả; chỉ tay cầm mới bắt đầu kéo. Điều này tránh
  // kéo nhầm khi người dùng bấm vào nội dung hoặc các nút thao tác trên thẻ.
  source = replacePatternRequired(
    source,
    /                  draggable=\{[\s\S]*?                  onDragOver=\{\(event\) => \{/,
    `                  draggable={false}
                  onDragOver={(event) => {`,
    "draggable={false}\n                  onDragOver",
    "chỉ dùng tay cầm để bắt đầu kéo",
  );

  source = source.replace(
    /                    dragArmedLessonId === lesson\.id &&\n\s*!draggedLessonId &&\n\s*"bg-indigo-50\/70 ring-2 ring-inset ring-indigo-400",\n/,
    "",
  );

  source = replacePatternRequired(
    source,
    /                  \{canReorder && !selectionMode && \(\n                    <span\n                      className="pointer-events-none[\s\S]*?                    <\/span>\n                  \)\}/,
    `                  {canReorder && !selectionMode && (
                    <span
                      draggable
                      onDragStart={(event: DragEvent<HTMLSpanElement>) => {
                        event.stopPropagation();
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData(
                          "application/x-smart-lesson-id",
                          lesson.id,
                        );
                        event.dataTransfer.setData("text/plain", lesson.id);

                        const card = event.currentTarget.closest("li");
                        if (card) {
                          const preview = card.cloneNode(true) as HTMLElement;
                          preview.style.position = "fixed";
                          preview.style.top = "-10000px";
                          preview.style.left = "-10000px";
                          preview.style.width = `${Math.min(card.getBoundingClientRect().width, 420)}px`;
                          preview.style.background = "white";
                          preview.style.border = "1px solid rgb(129 140 248)";
                          preview.style.borderRadius = "12px";
                          preview.style.boxShadow = "0 16px 36px rgba(15, 23, 42, 0.18)";
                          preview.style.opacity = "0.96";
                          document.body.appendChild(preview);
                          event.dataTransfer.setDragImage(preview, 24, 20);
                          window.setTimeout(() => preview.remove(), 0);
                        }

                        onDraggedLessonChange(lesson.id);
                      }}
                      onDragEnd={(event) => {
                        event.stopPropagation();
                        onDraggedLessonChange(null);
                      }}
                      className="mt-1 inline-flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 active:cursor-grabbing sm:mt-0"
                      title="Kéo một lần bằng tay cầm để đổi vị trí"
                      aria-label={`Kéo để sắp xếp ${lesson.title}`}
                      role="button"
                      tabIndex={0}
                    >
                      <GripVertical className="h-4 w-4" />
                    </span>
                  )}`,
    "Kéo một lần bằng tay cầm để đổi vị trí",
    "tay cầm kéo một bước",
  );

  source = source.replace(
    /                    \{dragArmedLessonId === lesson\.id && !draggedLessonId && \([\s\S]*?                    \)\}\n/,
    "",
  );

  return source;
});
