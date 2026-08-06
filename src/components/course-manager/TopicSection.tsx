import { Fragment, type DragEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { Lesson, Milestone } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { autoScrollDuringLessonDrag, type DragLocation } from "./useLessonReorder";

type Props = {
  subjectId: string;
  topic: Milestone;
  reorderEnabled: boolean;
  dragOverLocation: DragLocation | null;
  canMoveTopicUp: boolean;
  canMoveTopicDown: boolean;
  onMoveTopic: (topicId: string, direction: -1 | 1) => void;
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

export function TopicSection({
  subjectId,
  topic,
  reorderEnabled,
  dragOverLocation,
  canMoveTopicUp,
  canMoveTopicDown,
  onMoveTopic,
  onEnterDropTarget,
  onLeaveDropTarget,
  onFinishDrop,
  renderLesson,
}: Props) {
  const dropTarget = (beforeLessonId: string | null, label: string) => {
    const location: DragLocation = { subjectId, topicId: topic.id, beforeLessonId };
    const active = locationsEqual(dragOverLocation, location);

    return (
      <div
        role="button"
        tabIndex={-1}
        aria-label={label}
        className={cn(
          "h-2 transition-all",
          reorderEnabled && "hover:h-5",
          active && "h-6 bg-indigo-100",
        )}
        onDragEnter={(event: DragEvent<HTMLDivElement>) => {
          if (!reorderEnabled) return;
          event.preventDefault();
          onEnterDropTarget(location);
        }}
        onDragOver={(event: DragEvent<HTMLDivElement>) => {
          if (!reorderEnabled) return;
          event.preventDefault();
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
        {active ? <span className="sr-only">{label}</span> : null}
      </div>
    );
  };

  return (
    <section data-course-scroll-container className="overflow-hidden rounded-2xl border bg-white">
      <header className="flex items-center gap-2 border-b bg-slate-50 px-4 py-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{topic.title}</h3>
          <p className="text-xs text-slate-500">{topic.lessons.length} bài học</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!reorderEnabled || !canMoveTopicUp}
          aria-label={`Di chuyển chủ đề lên: ${topic.title}`}
          onClick={() => onMoveTopic(topic.id, -1)}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!reorderEnabled || !canMoveTopicDown}
          aria-label={`Di chuyển chủ đề xuống: ${topic.title}`}
          onClick={() => onMoveTopic(topic.id, 1)}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </header>

      {topic.lessons.length ? (
        <ul>
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
        <div className="p-4">
          {dropTarget(null, "Chèn phía dưới")}
          <p className="text-sm text-slate-500">Chủ đề này chưa có bài học.</p>
        </div>
      )}
    </section>
  );
}
