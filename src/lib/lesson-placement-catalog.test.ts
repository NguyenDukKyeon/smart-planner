import { describe, expect, test } from "vitest";
import type { StorageAdapter } from "./app-storage";
import {
  CUSTOM_SUBJECTS_KEY,
  convertRawToSubjects,
  getStoredCustomSubjects,
  normalizeSubjects,
  parseJSONInput,
  updateLessonDetails,
} from "./custom-subjects";
import type { LessonPlacementProvenance, Subject } from "./mock-data";

const validProvenance: LessonPlacementProvenance = {
  kind: "manual-move",
  movedAt: "2030-01-03T04:05:06.000Z",
  fromDateISO: "2030-01-01",
  toDateISO: "2030-01-03",
};

function subjectsWithProvenance(): Subject[] {
  return [
    {
      id: "subject-1",
      name: "Toán",
      emoji: "📐",
      milestones: [
        {
          id: "topic-1",
          title: "Chủ đề",
          subtitle: "1 bài học",
          lessons: [
            {
              id: "lesson-1",
              title: "Bài kiểm thử",
              topic: "Chủ đề",
              xp: 20,
              plannedDurationMinutes: 60,
              scheduledDate: "2030-01-03",
              scheduleMode: "flexible",
              weekday: "T5",
              sourceSubject: "Toán",
              week: 1,
              initialDone: false,
              placementProvenance: structuredClone(validProvenance),
            },
          ],
        },
      ],
    },
  ];
}

function firstLesson(subjects: Subject[]) {
  return subjects[0].milestones[0].lessons[0];
}

class MemoryStorage implements StorageAdapter {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

describe("placement provenance catalog persistence", () => {
  test("retains valid provenance through normalization", () => {
    const raw = JSON.parse(JSON.stringify(subjectsWithProvenance()));
    const normalized = normalizeSubjects(raw);
    expect(normalized).not.toBeNull();
    expect(firstLesson(normalized!).placementProvenance).toEqual(validProvenance);
    expect(firstLesson(normalized!).placementProvenance).not.toBe(
      raw[0].milestones[0].lessons[0].placementProvenance,
    );
  });

  test("strips malformed provenance but retains the lesson", () => {
    const raw = JSON.parse(JSON.stringify(subjectsWithProvenance()));
    raw[0].milestones[0].lessons[0].placementProvenance.movedAt = "invalid";
    const normalized = normalizeSubjects(raw);
    expect(normalized).not.toBeNull();
    expect(firstLesson(normalized!).id).toBe("lesson-1");
    expect(firstLesson(normalized!).placementProvenance).toBeUndefined();
  });

  test("keeps valid provenance through the normal reload path", () => {
    const storage = new MemoryStorage();
    storage.setItem(CUSTOM_SUBJECTS_KEY, JSON.stringify(subjectsWithProvenance()));
    const loaded = getStoredCustomSubjects(storage);
    expect(loaded.status).toBe("ok");
    if (loaded.status === "ok") {
      expect(firstLesson(loaded.value).placementProvenance).toEqual(validProvenance);
    }
  });

  test("JSON import cannot inject application provenance", () => {
    const parsed = parseJSONInput(
      JSON.stringify([
        {
          subject_name: "Toán",
          lesson_name: "Bài nhập",
          planned_date: "2030-01-03",
          placementProvenance: validProvenance,
        },
      ]),
    );
    const imported = convertRawToSubjects(parsed);
    expect(firstLesson(imported).placementProvenance).toBeUndefined();
  });
});

describe("lesson editor provenance semantics", () => {
  test("changing the lesson date clears old provenance", () => {
    const next = updateLessonDetails(subjectsWithProvenance(), "lesson-1", {
      scheduledDate: "2030-01-04",
    });
    expect(firstLesson(next).placementProvenance).toBeUndefined();
  });

  test("changing schedule mode clears old provenance", () => {
    const next = updateLessonDetails(subjectsWithProvenance(), "lesson-1", {
      scheduleMode: "fixed",
    });
    expect(firstLesson(next).placementProvenance).toBeUndefined();
  });

  test("same date and same mode preserve provenance", () => {
    const next = updateLessonDetails(subjectsWithProvenance(), "lesson-1", {
      scheduledDate: "2030-01-03",
      scheduleMode: "flexible",
    });
    expect(firstLesson(next).placementProvenance).toEqual(validProvenance);
  });

  test("non-schedule edits preserve provenance", () => {
    const next = updateLessonDetails(subjectsWithProvenance(), "lesson-1", {
      title: "Tên mới",
      plannedDurationMinutes: 75,
      xp: 50,
    });
    expect(firstLesson(next).placementProvenance).toEqual(validProvenance);
  });

  test("an explicit replacement provenance wins over schedule clearing", () => {
    const replacement: LessonPlacementProvenance = {
      kind: "manual-move",
      movedAt: "2030-01-04T00:00:00.000Z",
      fromDateISO: "2030-01-03",
      toDateISO: "2030-01-05",
    };
    const next = updateLessonDetails(subjectsWithProvenance(), "lesson-1", {
      scheduledDate: "2030-01-05",
      placementProvenance: replacement,
    });
    expect(firstLesson(next).placementProvenance).toEqual(replacement);
  });
});
