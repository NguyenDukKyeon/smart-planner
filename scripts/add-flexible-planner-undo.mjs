import { readFileSync, writeFileSync } from "node:fs";

const fileUrl = new URL("../src/components/FlexiblePlanner.tsx", import.meta.url);
let source = readFileSync(fileUrl, "utf8");

function replaceRequired(before, after, label) {
  if (source.includes(after)) return;
  if (!source.includes(before)) {
    throw new Error(`Không thể cập nhật ${label}.`);
  }
  source = source.replace(before, after);
}

replaceRequired(
  'import { useEffect, useMemo, useState, type DragEvent as ReactDragEvent } from "react";',
  'import { useCallback, useEffect, useMemo, useState, type DragEvent as ReactDragEvent } from "react";',
  "React useCallback",
);

replaceRequired(
  `  GripVertical,
  Move,
} from "lucide-react";`,
  `  GripVertical,
  Move,
  Undo2,
} from "lucide-react";`,
  "biểu tượng hoàn tác",
);

replaceRequired(
  `type LessonMode = "fixed" | "flexible";

function getLessonMode`,
  `type LessonMode = "fixed" | "flexible";

type UndoEntry = {
  subjects: Subject[];
  lessonTitle: string;
  fromDateISO?: string;
  toDateISO: string;
};

function catalogUpdateSucceeded(
  result: CatalogUpdateResult | boolean | void,
): boolean {
  return result == null
    ? true
    : typeof result === "boolean"
      ? result
      : result.ok;
}

function isTextEditingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

function getLessonMode`,
  "kiểu dữ liệu hoàn tác",
);

replaceRequired(
  `  const [recentlyMovedLessonId, setRecentlyMovedLessonId] = useState<string | null>(null);
  const today = todayISO();`,
  `  const [recentlyMovedLessonId, setRecentlyMovedLessonId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([]);
  const today = todayISO();`,
  "ngăn xếp hoàn tác",
);

replaceRequired(
  `  const selectedSubject =
    subjectTabs.find((subject) => subject.id === subjectId) ?? subjectTabs[0];

  const toggleWeek`,
  `  const selectedSubject =
    subjectTabs.find((subject) => subject.id === subjectId) ?? subjectTabs[0];

  const undoLastMove = useCallback(() => {
    const entry = undoStack.at(-1);
    if (!entry) return false;

    const result = onSubjectsUpdated(entry.subjects, { createBackup: false });
    if (!catalogUpdateSucceeded(result)) return false;

    setUndoStack((current) => current.slice(0, -1));
    setRecentlyMovedLessonId(null);
    toast.success(`Đã hoàn tác “${entry.lessonTitle}”.`, {
      description: entry.fromDateISO
        ? `Khôi phục từ ${displayDate(entry.toDateISO)} về ${displayDate(entry.fromDateISO)}.`
        : `Đã trả lại trạng thái trước khi chuyển sang ${displayDate(entry.toDateISO)}.`,
    });
    return true;
  }, [onSubjectsUpdated, undoStack]);

  useEffect(() => {
    const handleUndoShortcut = (event: KeyboardEvent) => {
      if (
        !(event.ctrlKey || event.metaKey) ||
        event.shiftKey ||
        event.key.toLowerCase() !== "z" ||
        isTextEditingTarget(event.target) ||
        undoStack.length === 0
      ) {
        return;
      }

      event.preventDefault();
      undoLastMove();
    };

    window.addEventListener("keydown", handleUndoShortcut);
    return () => window.removeEventListener("keydown", handleUndoShortcut);
  }, [undoLastMove, undoStack.length]);

  const toggleWeek`,
  "hàm và phím tắt hoàn tác",
);

replaceRequired(
  `    const result = onSubjectsUpdated(nextSubjects, { createBackup: true });
    const succeeded =
      result == null
        ? true
        : typeof result === "boolean"
          ? result
          : result.ok;

    if (!succeeded) return false;

    const mode = getLessonMode(lesson);`,
  `    const result = onSubjectsUpdated(nextSubjects, { createBackup: true });
    if (!catalogUpdateSucceeded(result)) return false;

    setUndoStack((current) =>
      [
        ...current,
        {
          subjects,
          lessonTitle: lesson.title,
          fromDateISO: lesson.scheduledDate || undefined,
          toDateISO: targetDateISO,
        },
      ].slice(-20),
    );

    const mode = getLessonMode(lesson);`,
  "ghi lịch sử trước khi chuyển ngày",
);

replaceRequired(
  `            ? "Bài cố định sẽ chỉ xuất hiện đúng ngày này."
            : "Nếu ngày đó quá tải, lịch linh hoạt có thể dời bài sang ngày sau."`,
  `            ? "Bài cố định sẽ chỉ xuất hiện đúng ngày này. Nhấn Ctrl+Z để hoàn tác."
            : "Nếu ngày đó quá tải, lịch linh hoạt có thể dời bài sang ngày sau. Nhấn Ctrl+Z để hoàn tác."`,
  "gợi ý hoàn tác sau khi di chuyển",
);

replaceRequired(
  `        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800">`,
  `        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <button
            type="button"
            disabled={undoStack.length === 0}
            onClick={undoLastMove}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 font-semibold text-slate-700 shadow-2xs transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Hoàn tác lần chuyển lịch gần nhất"
            title="Hoàn tác lần chuyển gần nhất (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Hoàn tác
            {undoStack.length > 0 && (
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                {undoStack.length}
              </span>
            )}
            <span className="hidden text-[10px] font-medium text-slate-400 sm:inline">
              Ctrl+Z
            </span>
          </button>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800">`,
  "nút hoàn tác",
);

writeFileSync(fileUrl, source, "utf8");
