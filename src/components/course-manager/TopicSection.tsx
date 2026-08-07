import { Fragment, useState, type DragEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Edit3, MoreHorizontal, Trash2 } from "lucide-react";
import type { Lesson, Milestone } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { autoScrollDuringLessonDrag, type DragLocation } from "./useLessonReorder";

type Props = {
  subjectId: string;
  topic: Milestone;
  completedCount: number;
  remainingMinutes: number;
  reorderEnabled: boolean;
  dragOverLocation: DragLocation | null;
  canMoveTopicUp: boolean;
  canMoveTopicDown: boolean;
  onMoveTopic: (topicId: string, direction: -1 | 1) => void;
  onEditTopic?: (topicId: string) => void;
  onDeleteTopic?: (topicId: string) => void;
  onEnterDropTarget: (location: DragLocation) => void;
  onLeaveDropTarget: () => void;
  onFinishDrop: (location: DragLocation) => void;
  renderLesson: (lesson: Lesson, index: number) => ReactNode;
};

function locationsEqual(left: DragLocation | null, right: DragLocation): boolean {
  return (
    left?.subjectId === right.subjectId &&
    left.topicId === right.topicId &&
    left.beforeLessonId === right.beforeLessonId
  );
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder} phút`;
  if (!remainder) return `${hours} giờ`;
  return `${hours} giờ ${remainder} phút`;
}

export function TopicSection({
  subjectId,
  topic,
  completedCount,
  remainingMinutes,
  reorderEnabled,
  dragOverLocation,
  canMoveTopicUp,
  canMoveTopicDown,
  onMoveTopic,
  onEditTopic,
  onDeleteTopic,
  onEnterDropTarget,
  onLeaveDropTarget,
  onFinishDrop,
  renderLesson,
}: Props) {
  const [open, setOpen] = useState(true);

  const dropTarget = (beforeLessonId: string | null, label: string) => {
    const location: DragLocation = { subjectId, topicId: topic.id, beforeLessonId };
    const active = locationsEqual(dragOverLocation, location);

    return (
      <div
        role="button"
        tabIndex={-1}
        aria-label={label}
        className={cn(
          "relative h-2 transition-all",
          reorderEnabled && "hover:h-5",
          active && "h-6",
        )}
        onDragEnter={(event: DragEvent<HTMLDivElement>) => {
          if (!reorderEnabled) return;
          event.preventDefault();
          onEnterDropTarget(location);
        }}
        onDragOver={(event: DragEvent<HTMLDivElement>) => {
          if (!reorderEnabled) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          autoScrollDuringLessonDrag(event);
          onEnterDropTarget(location);
        }}
        onDragLeave={onLeaveDropTarget}
        onDrop={(event: DragEvent<HTMLDivElement>) => {
          if (!reorderEnabled) return;
          event.preventDefault();
          onFinishDrop(location);
        }}
      >
        {active ? (
          <span className="pointer-events-none absolute left-3 right-3 top-1/2 z-20 h-0.5 bg-indigo-600 shadow-[0_0_0_1px_white]">
            <span className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-indigo-600 bg-white" />
            <span className="absolute left-4 top-1 rounded-md bg-indigo-700 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              {label}
            </span>
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <section
        data-course-scroll-container
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
      >
        <div className="flex w-full items-center gap-2 bg-slate-50/80 px-3 py-2.5">
          <CollapsibleTrigger asChild>
            <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <ChevronDown className={cn("h-4 w-4 transition", !open && "-rotate-90")} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-slate-900">{topic.title}</h3>
                <p className="text-[11px] text-slate-500">
                  {completedCount} / {topic.lessons.length} bài · {formatMinutes(remainingMinutes)}{" "}
                  còn lại
                </p>
              </div>
            </button>
          </CollapsibleTrigger>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                aria-label={`Quản lý chủ đề ${topic.title}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              {onEditTopic ? (
                <DropdownMenuItem onSelect={() => onEditTopic(topic.id)}>
                  <Edit3 className="mr-2 h-4 w-4" /> Đổi tên chủ đề
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                disabled={!reorderEnabled || !canMoveTopicUp}
                onSelect={() => onMoveTopic(topic.id, -1)}
              >
                <ArrowUp className="mr-2 h-4 w-4" /> Di chuyển lên
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!reorderEnabled || !canMoveTopicDown}
                onSelect={() => onMoveTopic(topic.id, 1)}
              >
                <ArrowDown className="mr-2 h-4 w-4" /> Di chuyển xuống
              </DropdownMenuItem>
              {onDeleteTopic ? <DropdownMenuSeparator /> : null}
              {onDeleteTopic ? (
                <DropdownMenuItem onSelect={() => onDeleteTopic(topic.id)} className="text-red-700">
                  <Trash2 className="mr-2 h-4 w-4" /> Xóa chủ đề
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CollapsibleContent>
          {topic.lessons.length ? (
            <ul className="divide-y divide-slate-100">
              {topic.lessons.map((lesson, index) => (
                <Fragment key={lesson.id}>
                  <li className="list-none">
                    {dropTarget(lesson.id, `Chèn phía trên ${lesson.title}`)}
                  </li>
                  {renderLesson(lesson, index)}
                </Fragment>
              ))}
              <li className="list-none">{dropTarget(null, "Chèn phía dưới")}</li>
            </ul>
          ) : (
            <div className="px-4 py-5 text-center">
              {dropTarget(null, "Chèn phía dưới")}
              <p className="text-xs text-slate-500">Chủ đề này chưa có bài học.</p>
            </div>
          )}
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}
