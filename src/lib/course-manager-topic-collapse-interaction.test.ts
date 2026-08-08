import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Lesson, Subject } from "./mock-data";

const topicStateHarness = vi.hoisted(() => ({
  open: true,
  interceptNextState: false,
}));

const collapsibleHarness = vi.hoisted(() => ({
  open: true,
  onOpenChange: null as null | ((open: boolean) => void),
  runtimeTriggerToggle: null as null | (() => void),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  const useState = (<T>(initialState: T | (() => T)) => {
    const initialValue =
      typeof initialState === "function" ? (initialState as () => T)() : initialState;

    if (topicStateHarness.interceptNextState) {
      topicStateHarness.interceptNextState = false;
      const setState = (next: T | ((previous: T) => T)) => {
        const current = topicStateHarness.open as T;
        const resolved = typeof next === "function" ? (next as (previous: T) => T)(current) : next;
        topicStateHarness.open = Boolean(resolved);
      };
      return [topicStateHarness.open as T, setState];
    }

    return [initialValue, () => undefined];
  }) as typeof actual.useState;

  return { ...actual, useState };
});

vi.mock("@/components/ui/collapsible", async () => {
  const React = await import("react");

  const Collapsible = ({
    open,
    onOpenChange,
    children,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children?: ReactNode;
  }) => {
    collapsibleHarness.open = open;
    collapsibleHarness.onOpenChange = onOpenChange;
    return React.createElement(
      "div",
      { "data-runtime-collapsible": open ? "open" : "closed" },
      children,
    );
  };

  const CollapsibleTrigger = ({ children }: { children?: ReactNode }) => {
    collapsibleHarness.runtimeTriggerToggle = () => {
      collapsibleHarness.onOpenChange?.(!collapsibleHarness.open);
    };
    return React.createElement(
      "div",
      {
        "data-runtime-trigger": "true",
        "aria-expanded": collapsibleHarness.open,
      },
      children,
    );
  };

  const CollapsibleContent = ({ children }: { children?: ReactNode }) =>
    collapsibleHarness.open
      ? React.createElement("div", { "data-runtime-collapse-content": "visible" }, children)
      : null;

  return { Collapsible, CollapsibleTrigger, CollapsibleContent };
});

vi.mock("@/components/ui/dropdown-menu", async () => {
  const React = await import("react");
  const PassThrough = ({ children }: { children?: ReactNode }) =>
    React.createElement(React.Fragment, null, children);

  return {
    DropdownMenu: PassThrough,
    DropdownMenuTrigger: PassThrough,
    DropdownMenuContent: PassThrough,
    DropdownMenuItem: PassThrough,
    DropdownMenuSeparator: () => React.createElement("hr"),
  };
});

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

function subject(): Subject {
  return {
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
  };
}

beforeEach(() => {
  topicStateHarness.open = true;
  topicStateHarness.interceptNextState = false;
  collapsibleHarness.open = true;
  collapsibleHarness.onOpenChange = null;
  collapsibleHarness.runtimeTriggerToggle = null;
});

describe("TopicSection collapse interaction at runtime", () => {
  test("runtime trigger collapses and reopens the lesson content", () => {
    const currentSubject = subject();
    const topic = currentSubject.milestones[0];
    const renderTopic = () => {
      topicStateHarness.interceptNextState = true;
      return renderToStaticMarkup(
        createElement(TopicSection, {
          subjectId: currentSubject.id,
          topic,
          completedCount: 1,
          remainingMinutes: 90,
          reorderEnabled: true,
          dragOverLocation: null,
          canMoveTopicUp: false,
          canMoveTopicDown: false,
          onMoveTopic: () => undefined,
          onEditTopic: () => undefined,
          onDeleteTopic: () => undefined,
          onEnterDropTarget: () => undefined,
          onLeaveDropTarget: () => undefined,
          onFinishDrop: () => undefined,
          renderLesson: (item: Lesson) =>
            createElement("li", { key: item.id, "data-runtime-lesson": "true" }, item.title),
        }),
      );
    };

    const openHtml = renderTopic();
    expect(openHtml).toContain('aria-expanded="true"');
    expect(openHtml).toContain('data-runtime-collapse-content="visible"');
    expect(openHtml).toContain("1 / 2 bài · 1 giờ 30 phút còn lại");
    expect(openHtml).toContain('data-runtime-lesson="true"');
    expect(collapsibleHarness.runtimeTriggerToggle).toBeTypeOf("function");

    collapsibleHarness.runtimeTriggerToggle?.();
    expect(topicStateHarness.open).toBe(false);

    const closedHtml = renderTopic();
    expect(closedHtml).toContain('aria-expanded="false"');
    expect(closedHtml).not.toContain('data-runtime-collapse-content="visible"');
    expect(closedHtml).not.toContain('data-runtime-lesson="true"');
    expect(collapsibleHarness.runtimeTriggerToggle).toBeTypeOf("function");

    collapsibleHarness.runtimeTriggerToggle?.();
    expect(topicStateHarness.open).toBe(true);

    const reopenedHtml = renderTopic();
    expect(reopenedHtml).toContain('aria-expanded="true"');
    expect(reopenedHtml).toContain('data-runtime-collapse-content="visible"');
    expect(reopenedHtml).toContain('data-runtime-lesson="true"');
  });
});
