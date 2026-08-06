import type { DragEvent } from "react";
import { Archive, ArrowDown, ArrowUp, Copy, Edit3, GripVertical, Trash2 } from "lucide-react";
import type { Lesson } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const LESSON_DRAG_MIME = "application/x-smart-lesson-id";

type Props = {
  lesson: Lesson;
  minutes: number;
  selected?: boolean;
  selectionMode?: boolean;
  activeTimer?: boolean;
  reorderEnabled: boolean;
  dragArmed: boolean;
  dragging: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onToggleSelected?: (lessonId: string) => void;
  onEdit: (lesson: Lesson) => void;
  onDuplicate?: (lesson: Lesson) => void;
  onArchive?: (lesson: Lesson) => void;
  onDelete?: (lesson: Lesson) => void;
  onMove: (lessonId: string, direction: "up" | "down") => void;
  onArmDrag: (lessonId: string) => void;
  onStartDrag: (lessonId: string) => void;
  onSetDragImage: (event: DragEvent<HTMLElement>, title: string) => void;
  onDragEnd: () => void;
};

export function LessonRow({
  lesson,
  minutes,
  selected = false,
  selectionMode = false,
  activeTimer = false,
  reorderEnabled,
  dragArmed,
  dragging,
  canMoveUp,
  canMoveDown,
  onToggleSelected,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onMove,
  onArmDrag,
  onStartDrag,
  onSetDragImage,
  onDragEnd,
}: Props) {
  const percent = Math.min(
    100,
    Math.round((minutes / Math.max(1, lesson.plannedDurationMinutes)) * 100),
  );

  const setDragImage = (event: DragEvent<HTMLElement>) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(LESSON_DRAG_MIME, lesson.id);
    onSetDragImage(event, lesson.title);
  };

  return (
    <li
      draggable={false}
      className={cn(
        "flex items-center gap-2 border-b p-3 last:border-b-0",
        dragging && "opacity-45",
        dragArmed && "bg-indigo-50",
      )}
    >
      {selectionMode ? (
        <input
          type="checkbox"
          checked={selected}
          aria-label={`Chọn ${lesson.title}`}
          onChange={() => onToggleSelected?.(lesson.id)}
        />
      ) : null}

      <button
        type="button"
        draggable={reorderEnabled}
        disabled={!reorderEnabled}
        title="Kéo một lần bằng tay cầm để đổi vị trí"
        aria-label={`Kéo ${lesson.title} để đổi vị trí`}
        className="cursor-grab rounded-lg p-1 text-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
        onPointerDown={() => onArmDrag(lesson.id)}
        onDragStart={(event) => {
          setDragImage(event);
          onStartDrag(lesson.id);
        }}
        onDragEnd={onDragEnd}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">{lesson.title}</p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            {lesson.scheduleMode === "fixed" ? "Cố định" : "Linh hoạt"}
          </span>
          {activeTimer ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              Timer đang chạy
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {lesson.plannedDurationMinutes} phút · {lesson.scheduledDate || "Chưa xếp lịch"}
        </p>
        <Progress value={percent} className="mt-2 h-1.5" />
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!reorderEnabled || !canMoveUp}
          aria-label={`Di chuyển lên: ${lesson.title}`}
          onClick={() => onMove(lesson.id, "up")}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!reorderEnabled || !canMoveDown}
          aria-label={`Di chuyển xuống: ${lesson.title}`}
          onClick={() => onMove(lesson.id, "down")}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(lesson)}>
          <Edit3 className="h-4 w-4" /> Chỉnh sửa
        </Button>
        {onDuplicate ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Nhân bản ${lesson.title}`}
            onClick={() => onDuplicate(lesson)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        ) : null}
        {onArchive ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Lưu trữ ${lesson.title}`}
            onClick={() => onArchive(lesson)}
          >
            <Archive className="h-4 w-4" />
          </Button>
        ) : null}
        {onDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Xóa ${lesson.title}`}
            onClick={() => onDelete(lesson)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </li>
  );
}