import type { DragEvent } from "react";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Edit3,
  GripVertical,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import type { Lesson, Subject } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const LESSON_DRAG_MIME = "application/x-smart-lesson-id";

type Props = {
  lesson: Lesson;
  minutes: number;
  completed: boolean;
  subjects: Subject[];
  currentSubjectId: string;
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
  onMoveToSubject: (lessonId: string, subjectId: string) => void;
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
  completed,
  subjects,
  currentSubjectId,
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
  onMoveToSubject,
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
    event.dataTransfer.setData("text/plain", lesson.id);
    onSetDragImage(event, lesson.title);
  };

  return (
    <li
      draggable={false}
      className={cn(
        "relative flex items-start gap-3 p-3 sm:items-center",
        reorderEnabled && !selectionMode && "select-none",
        selected && "bg-indigo-50/70",
        dragging && "bg-indigo-50 opacity-60",
        dragArmed && !dragging && "bg-indigo-50/40",
      )}
    >
      {selectionMode ? (
        <input
          type="checkbox"
          checked={selected}
          className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 accent-indigo-600 sm:mt-0"
          aria-label={`Chọn ${lesson.title}`}
          onChange={() => onToggleSelected?.(lesson.id)}
        />
      ) : null}

      {reorderEnabled && !selectionMode ? (
        <button
          type="button"
          draggable
          title="Kéo một lần bằng tay cầm để đổi vị trí"
          aria-label={`Kéo ${lesson.title} để đổi vị trí`}
          className="mt-1 inline-flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 active:cursor-grabbing sm:mt-0"
          onPointerDown={() => onArmDrag(lesson.id)}
          onDragStart={(event) => {
            event.stopPropagation();
            setDragImage(event);
            onStartDrag(lesson.id);
          }}
          onDragEnd={(event) => {
            event.stopPropagation();
            onDragEnd();
          }}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold",
              completed
                ? "bg-emerald-100 text-emerald-700"
                : minutes > 0
                  ? "bg-sky-100 text-sky-700"
                  : "bg-slate-100 text-slate-600",
            )}
          >
            {completed ? "Hoàn thành" : minutes > 0 ? "Đang học" : "Chưa bắt đầu"}
          </span>
          {activeTimer ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              Timer đang chạy
            </span>
          ) : null}
        </div>
        <p className="mt-1 break-words text-sm font-semibold text-slate-900">{lesson.title}</p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
          <span>{minutes} / {lesson.plannedDurationMinutes} phút · {percent}%</span>
          <span>
            {lesson.scheduledDate
              ? `${lesson.scheduleMode === "fixed" ? "Cố định" : "Từ"} ${lesson.scheduledDate}`
              : "Chưa lên lịch"}
          </span>
        </div>
        <Progress value={percent} className="mt-2 h-1.5" />
      </div>

      {reorderEnabled && !selectionMode ? (
        <div className="flex shrink-0 items-center gap-1" aria-label={`Sắp xếp ${lesson.title}`}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            disabled={!canMoveUp}
            aria-label={`Di chuyển lên: ${lesson.title}`}
            onClick={() => onMove(lesson.id, "up")}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            disabled={!canMoveDown}
            aria-label={`Di chuyển xuống: ${lesson.title}`}
            onClick={() => onMove(lesson.id, "down")}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {!selectionMode ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-lg"
          onClick={() => onEdit(lesson)}
          aria-label={`Chỉnh sửa ${lesson.title}`}
          title="Chỉnh ngày, thời lượng và chủ đề"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      ) : null}

      {!selectionMode ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-xl"
              aria-label={`Quản lý ${lesson.title}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuItem onSelect={() => onEdit(lesson)}>
              <Edit3 className="mr-2 h-4 w-4" /> Chỉnh sửa bài học
            </DropdownMenuItem>
            {subjects
              .filter((subject) => subject.id !== currentSubjectId)
              .map((subject) => (
                <DropdownMenuItem
                  key={subject.id}
                  onSelect={() => onMoveToSubject(lesson.id, subject.id)}
                >
                  <BookOpen className="mr-2 h-4 w-4" /> Chuyển sang {subject.name}
                </DropdownMenuItem>
              ))}
            {onDuplicate ? (
              <DropdownMenuItem onSelect={() => onDuplicate(lesson)}>
                <Plus className="mr-2 h-4 w-4" /> Nhân bản bài học
              </DropdownMenuItem>
            ) : null}
            {(onArchive || onDelete) && <DropdownMenuSeparator />}
            {onArchive ? (
              <DropdownMenuItem onSelect={() => onArchive(lesson)}>
                <Archive className="mr-2 h-4 w-4" /> Lưu trữ
              </DropdownMenuItem>
            ) : null}
            {onDelete ? (
              <DropdownMenuItem className="text-red-700" onSelect={() => onDelete(lesson)}>
                <Trash2 className="mr-2 h-4 w-4" /> Xóa bài học
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </li>
  );
}
