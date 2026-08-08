import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Lesson, Subject } from "./mock-data";

const menuCapture = vi.hoisted(() => ({
  onSelect: [] as Array<(() => void) | undefined>,
}));

vi.mock("@/components/ui/dropdown-menu", async () => {
  const React = await import("react");

  const PassThrough = ({ children }: { children?: ReactNode }) =>
    React.createElement(React.Fragment, null, children);
  const DropdownMenuItem = ({
    children,
    onSelect,
  }: {
    children?: ReactNode;
    onSelect?: () => void;
  }) => {
    menuCapture.onSelect.push(onSelect);
    return React.createElement(
      "div",
      { "data-runtime-menu-item": onSelect ? "selectable" : "passive" },
      children,
    );
  };

  return {
    DropdownMenu: PassThrough,
    DropdownMenuTrigger: PassThrough,
    DropdownMenuContent: PassThrough,
    DropdownMenuItem,
    DropdownMenuSeparator: () => React.createElement("hr"),
  };
});

import { LessonRow } from "@/components/course-manager/LessonRow";
import { TopicSection } from "@/components/course-manager/TopicSection";

function lesson(id: string, title: string): Lesson {
  return {
    id,
    title,
    xp: 30,
    plannedDurationMinutes: 60,
    scheduledDate: "2026-08-10",
    scheduleMode: "fixed",
    weekday: "Thứ 2",
    sourceSubject: "Tiếng Anh",
    week: 1,
    initialDone: false,
  };
}

function subjects(): Subject[] {
  return [
    {
      id: "english",
      name: "Tiếng Anh",
      emoji: "📘",
      milestones: [
        {
          id: "focus",
          title: "Chủ đề trọng tâm",
          subtitle: "2 bài học",
          lessons: [lesson("lesson-1", "Bài 1"), lesson("lesson-2", "Bài 2")],
        },
      ],
    },
    {
      id: "physics",
      name: "Vật lý",
      emoji: "⚛️",
      milestones: [],
    },
  ];
}

beforeEach(() => {
  menuCapture.onSelect.length = 0;
});

describe("Course Manager predecessor presentation at runtime", () => {
  test("TopicSection renders an open collapsible summary and active visible insertion edge", () => {
    const catalog = subjects();
    const topic = catalog[0].milestones[0];
    const commonProps = {
      subjectId: catalog[0].id,
      topic,
      completedCount: 1,
      remainingMinutes: 90,
      reorderEnabled: true,
      canMoveTopicUp: true,
      canMoveTopicDown: true,
      onMoveTopic: () => undefined,
      onEditTopic: () => undefined,
      onDeleteTopic: () => undefined,
      onEnterDropTarget: () => undefined,
      onLeaveDropTarget: () => undefined,
      onFinishDrop: () => undefined,
      renderLesson: (item: Lesson) =>
        createElement("li", { key: item.id, "data-runtime-lesson": "true" }, item.title),
    };

    const activeHtml = renderToStaticMarkup(
      createElement(TopicSection, {
        ...commonProps,
        dragOverLocation: {
          subjectId: catalog[0].id,
          topicId: topic.id,
          beforeLessonId: topic.lessons[0].id,
        },
      }),
    );
    const inactiveHtml = renderToStaticMarkup(
      createElement(TopicSection, { ...commonProps, dragOverLocation: null }),
    );

    expect(activeHtml).toContain("1 / 2 bài · 1 giờ 30 phút còn lại");
    expect(activeHtml).toContain('aria-expanded="true"');
    expect(activeHtml).toContain("Quản lý chủ đề Chủ đề trọng tâm");
    expect(activeHtml).toContain("Chèn phía trên Bài 1");
    expect(activeHtml).toContain("h-0.5 bg-indigo-600");
    expect(activeHtml).toContain('data-runtime-lesson="true"');
    expect(activeHtml).toContain("Bài 1");
    expect(activeHtml).toContain("Bài 2");
    expect(inactiveHtml).not.toContain("h-0.5 bg-indigo-600");
  });

  test("LessonRow renders status/progress/details and complete management actions", () => {
    const catalog = subjects();
    const moves: Array<[string, string]> = [];
    const rowHtml = renderToStaticMarkup(
      createElement(LessonRow, {
        lesson: catalog[0].milestones[0].lessons[0],
        minutes: 30,
        completed: false,
        subjects: catalog,
        currentSubjectId: catalog[0].id,
        reorderEnabled: true,
        dragArmed: false,
        dragging: false,
        canMoveUp: true,
        canMoveDown: true,
        onEdit: () => undefined,
        onMoveToSubject: (lessonId: string, subjectId: string) => moves.push([lessonId, subjectId]),
        onDuplicate: () => undefined,
        onArchive: () => undefined,
        onDelete: () => undefined,
        onMove: () => undefined,
        onArmDrag: () => undefined,
        onStartDrag: () => undefined,
        onSetDragImage: () => undefined,
        onDragEnd: () => undefined,
      }),
    );

    expect(rowHtml).toContain("Đang học");
    expect(rowHtml).toContain("30 / 60 phút · 50%");
    expect(rowHtml).toContain("Cố định 2026-08-10");
    expect(rowHtml).toContain("Kéo Bài 1 để đổi vị trí");
    expect(rowHtml).toContain("Di chuyển lên: Bài 1");
    expect(rowHtml).toContain("Di chuyển xuống: Bài 1");
    expect(rowHtml).toContain("Chỉnh sửa bài học");
    expect(rowHtml).toContain("Chuyển sang Vật lý");
    expect(rowHtml).toContain("Nhân bản bài học");
    expect(rowHtml).toContain("Lưu trữ");
    expect(rowHtml).toContain("Xóa bài học");
    expect(rowHtml).toContain('data-runtime-menu-item="selectable"');

    expect(menuCapture.onSelect).toHaveLength(5);
    menuCapture.onSelect[1]?.();
    expect(moves).toEqual([["lesson-1", "physics"]]);
  });

  test("LessonRow renders all predecessor progress-state labels from runtime props", () => {
    const catalog = subjects();
    const item = catalog[0].milestones[0].lessons[0];
    const renderState = (completed: boolean, minutes: number) =>
      renderToStaticMarkup(
        createElement(LessonRow, {
          lesson: item,
          minutes,
          completed,
          subjects: catalog,
          currentSubjectId: catalog[0].id,
          selectionMode: true,
          reorderEnabled: false,
          dragArmed: false,
          dragging: false,
          canMoveUp: false,
          canMoveDown: false,
          onEdit: () => undefined,
          onMoveToSubject: () => undefined,
          onMove: () => undefined,
          onArmDrag: () => undefined,
          onStartDrag: () => undefined,
          onSetDragImage: () => undefined,
          onDragEnd: () => undefined,
        }),
      );

    expect(renderState(true, 60)).toContain("Hoàn thành");
    expect(renderState(false, 30)).toContain("Đang học");
    expect(renderState(false, 0)).toContain("Chưa bắt đầu");
  });
});
