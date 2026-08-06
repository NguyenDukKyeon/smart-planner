import { useEffect, useState, type DragEvent } from "react";

export type DragLocation = {
  subjectId: string;
  topicId: string;
  beforeLessonId: string | null;
};

type UseLessonReorderParams = {
  enabled: boolean;
  onDrop: (lessonId: string, location: DragLocation) => void;
};

export type UseLessonReorderResult = {
  draggedLessonId: string | null;
  dragArmedLessonId: string | null;
  dragOverLocation: DragLocation | null;
  armDrag: (lessonId: string) => void;
  startDrag: (lessonId: string) => void;
  setDragImage: (event: DragEvent<HTMLElement>, title: string) => void;
  enterDropTarget: (location: DragLocation) => void;
  leaveDropTarget: () => void;
  finishDrop: (location?: DragLocation) => void;
  resetDrag: () => void;
};

function findScrollableCourseContainer(target: HTMLElement): HTMLElement | null {
  let container = target.closest<HTMLElement>("[data-course-scroll-container]");
  while (container && container.scrollHeight <= container.clientHeight + 1) {
    container =
      container.parentElement?.closest<HTMLElement>("[data-course-scroll-container]") ?? null;
  }
  return container;
}

export function autoScrollDuringLessonDrag(event: DragEvent<HTMLElement>) {
  const container = findScrollableCourseContainer(event.currentTarget);
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

export function useLessonReorder({
  enabled,
  onDrop,
}: UseLessonReorderParams): UseLessonReorderResult {
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
  const [dragArmedLessonId, setDragArmedLessonId] = useState<string | null>(null);
  const [dragOverLocation, setDragOverLocation] = useState<DragLocation | null>(null);

  useEffect(() => {
    if (!dragArmedLessonId || draggedLessonId) return;
    const timeout = window.setTimeout(() => setDragArmedLessonId(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [dragArmedLessonId, draggedLessonId]);

  const resetDrag = () => {
    setDraggedLessonId(null);
    setDragArmedLessonId(null);
    setDragOverLocation(null);
  };

  const armDrag = (lessonId: string) => {
    if (!enabled) return;
    setDragArmedLessonId(lessonId);
  };

  const startDrag = (lessonId: string) => {
    if (!enabled) return;
    setDraggedLessonId(lessonId);
    setDragArmedLessonId(lessonId);
  };

  const setDragImage = (event: DragEvent<HTMLElement>, title: string) => {
    const preview = document.createElement("div");
    preview.textContent = title;
    preview.style.position = "fixed";
    preview.style.left = "-9999px";
    preview.style.top = "-9999px";
    preview.style.maxWidth = "320px";
    preview.style.padding = "10px 14px";
    preview.style.background = "white";
    preview.style.color = "rgb(30 41 59)";
    preview.style.fontSize = "14px";
    preview.style.fontWeight = "600";
    preview.style.border = "1px solid rgb(129 140 248)";
    preview.style.borderRadius = "12px";
    preview.style.boxShadow = "0 16px 36px rgba(15, 23, 42, 0.18)";
    preview.style.opacity = "0.96";
    document.body.appendChild(preview);
    event.dataTransfer.setDragImage(preview, 24, 20);
    window.setTimeout(() => preview.remove(), 0);
  };

  const enterDropTarget = (location: DragLocation) => {
    if (!enabled || !draggedLessonId) return;
    setDragOverLocation(location);
  };

  const leaveDropTarget = () => setDragOverLocation(null);

  const finishDrop = (location = dragOverLocation ?? undefined) => {
    if (enabled && draggedLessonId && location) onDrop(draggedLessonId, location);
    resetDrag();
  };

  return {
    draggedLessonId,
    dragArmedLessonId,
    dragOverLocation,
    armDrag,
    startDrag,
    setDragImage,
    enterDropTarget,
    leaveDropTarget,
    finishDrop,
    resetDrag,
  };
}
