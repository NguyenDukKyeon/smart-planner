import { describe, expect, test } from "vitest";
import type { Lesson, Subject } from "./mock-data";
import { buildCanonicalRoadmap, buildRoadmapProjection } from "./roadmap-views";

function lesson(params: Partial<Lesson> & Pick<Lesson, "id" | "title">): Lesson {
  return {
    id: params.id,
    title: params.title,
    xp: 20,
    plannedDurationMinutes: 60,
    scheduledDate: "2030-01-01",
    scheduleMode: "flexible",
    weekday: "Thứ 2",
    sourceSubject: "Toán",
    week: 1,
    initialDone: false,
    ...params,
  };
}

const subjects: Subject[] = [
  {
    id: "math",
    name: "Toán",
    emoji: "📐",
    milestones: [
      {
        id: "algebra",
        title: "Đại số",
        subtitle: "",
        lessons: [
          lesson({ id: "m1", title: "Bài 1" }),
          lesson({ id: "m2", title: "Bài 2" }),
          lesson({ id: "fixed", title: "Bài cố định", scheduleMode: "fixed" }),
        ],
      },
      {
        id: "geometry",
        title: "Hình học",
        subtitle: "",
        lessons: [lesson({ id: "m3", title: "Bài 3", scheduledDate: "" })],
      },
    ],
  },
  {
    id: "physics",
    name: "Vật lý",
    emoji: "⚛️",
    milestones: [
      {
        id: "mechanics",
        title: "Cơ học",
        subtitle: "",
        lessons: [
          lesson({
            id: "p1",
            title: "Bài Lý",
            sourceSubject: "Vật lý",
          }),
        ],
      },
    ],
  },
];

function projectedLessonIds(groups: ReturnType<typeof buildRoadmapProjection>) {
  return groups
    .filter((group) => group.mondayISO)
    .map((group) => group.items.map((item) => item.lesson.id));
}

function canonicalLessonIds(groups: ReturnType<typeof buildCanonicalRoadmap>) {
  return groups.flatMap((subject) =>
    subject.milestones.flatMap((milestone) => milestone.items.map((item) => item.lesson.id)),
  );
}

describe("buildRoadmapProjection", () => {
  test("moves unfinished flexible lessons between projected weeks when shifted dates change", () => {
    const first = buildRoadmapProjection({
      subjects,
      completed: {},
      shiftedDates: {
        m1: "2030-01-02",
        m2: "2030-01-03",
        p1: "2030-01-04",
      },
      selectedSubjectId: "all",
    });
    const second = buildRoadmapProjection({
      subjects,
      completed: {},
      shiftedDates: {
        m1: "2030-01-02",
        m2: "2030-01-10",
        p1: "2030-01-11",
      },
      selectedSubjectId: "all",
    });

    expect(projectedLessonIds(first)).toEqual([["m1", "m2", "p1"]]);
    expect(projectedLessonIds(second)).toEqual([["m1"], ["m2", "p1"]]);
  });

  test("uses completion dates for historical weekly placement", () => {
    const groups = buildRoadmapProjection({
      subjects,
      completed: { m1: "2030-02-14" },
      shiftedDates: { m1: "2030-01-02", m2: "2030-01-03", p1: "2030-01-04" },
      selectedSubjectId: "math",
    });

    const completedItem = groups
      .flatMap((group) => group.items)
      .find((item) => item.lesson.id === "m1");

    expect(completedItem).toMatchObject({
      status: "completed",
      effectiveDate: "2030-02-14",
    });
    expect(
      groups.find((group) => group.items.some((item) => item.lesson.id === "m1"))?.mondayISO,
    ).toBe("2030-02-11");
  });

  test("keeps fixed unplaced and undated lessons visible in dedicated groups", () => {
    const groups = buildRoadmapProjection({
      subjects,
      completed: {},
      shiftedDates: { m1: "2030-01-02", m2: "2030-01-03" },
      selectedSubjectId: "math",
    });

    expect(
      groups
        .find((group) => group.id === "week-unplaced-fixed")
        ?.items.map((item) => item.lesson.id),
    ).toEqual(["fixed"]);
    expect(
      groups.find((group) => group.id === "week-unscheduled")?.items.map((item) => item.lesson.id),
    ).toEqual(["m3"]);
  });

  test("filters projection groups by the selected subject", () => {
    const groups = buildRoadmapProjection({
      subjects,
      completed: {},
      shiftedDates: { m1: "2030-01-02", m2: "2030-01-03", p1: "2030-01-04" },
      selectedSubjectId: "physics",
    });

    expect(groups.flatMap((group) => group.items.map((item) => item.lesson.id))).toEqual(["p1"]);
  });
});

describe("buildCanonicalRoadmap", () => {
  test("keeps canonical order stable when projected and completion dates change", () => {
    const first = buildCanonicalRoadmap({
      subjects,
      completed: {},
      shiftedDates: { m1: "2030-02-01", m2: "2030-01-01" },
      selectedSubjectId: "math",
    });
    const second = buildCanonicalRoadmap({
      subjects,
      completed: { m1: "2030-03-01" },
      shiftedDates: { m1: "2030-04-01", m2: "2030-05-01" },
      selectedSubjectId: "math",
    });

    expect(canonicalLessonIds(first)).toEqual(["m1", "m2", "fixed", "m3"]);
    expect(canonicalLessonIds(second)).toEqual(["m1", "m2", "fixed", "m3"]);
  });

  test("preserves subject then milestone then lesson hierarchy in all-subject mode", () => {
    const groups = buildCanonicalRoadmap({
      subjects,
      completed: {},
      shiftedDates: { m1: "2030-01-02", m2: "2030-01-03", p1: "2030-01-04" },
      selectedSubjectId: "all",
    });

    expect(groups.map((group) => group.subjectId)).toEqual(["math", "physics"]);
    expect(groups[0].milestones.map((milestone) => milestone.milestoneId)).toEqual([
      "algebra",
      "geometry",
    ]);
    expect(canonicalLessonIds(groups)).toEqual(["m1", "m2", "fixed", "m3", "p1"]);
  });

  test("derives truthful status precedence without changing canonical position", () => {
    const visibleIds = new Set(["m1"]);
    const groups = buildCanonicalRoadmap({
      subjects,
      completed: { m2: "2030-01-03" },
      shiftedDates: {
        m1: "2030-01-02",
        m2: "2030-01-03",
        p1: "2030-01-04",
      },
      selectedSubjectId: "all",
      visibleScheduledLessonIds: visibleIds,
    });

    const statusById = Object.fromEntries(
      groups.flatMap((subject) =>
        subject.milestones.flatMap((milestone) =>
          milestone.items.map((item) => [item.lesson.id, item.status]),
        ),
      ),
    );

    expect(statusById).toEqual({
      m1: "projected",
      m2: "completed",
      fixed: "unplaced-fixed",
      m3: "unscheduled",
      p1: "outside-horizon",
    });
  });

  test("filters canonical hierarchy without synthesizing review tasks", () => {
    const groups = buildCanonicalRoadmap({
      subjects,
      completed: { "review:m1:2030-01-08": "2030-01-08" },
      shiftedDates: { p1: "2030-01-04" },
      selectedSubjectId: "physics",
    });

    expect(groups).toHaveLength(1);
    expect(canonicalLessonIds(groups)).toEqual(["p1"]);
    expect(canonicalLessonIds(groups)).not.toContain("review:m1:2030-01-08");
  });
});
