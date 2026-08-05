import { afterEach, describe, expect, test } from "vitest";
import {
  addSubjectToSubjects,
  convertRawToSubjects,
  removeLessonFromSubjects,
  removeLessonsFromSubjects,
  removeSubjectFromSubjects,
  duplicateLessonInSubjects,
  moveLessonToSubject,
  moveLessonsToSubject,
  moveLessonsToTopic,
  moveLessonBefore,
  moveLessonBeforeInTopic,
  reorderLesson,
  updateLessonDetails,
  updateLessonsDetails,
  updateSubjectDetails,
  getStoredCustomSubjects,
  archiveSubject,
  archiveLesson,
  archiveLessons,
  restoreArchivedSubject,
  restoreArchivedLesson,
  getLastCatalogStorageError,
  loadArchivedCatalog,
  ARCHIVED_CATALOG_KEY,
  CUSTOM_SUBJECTS_KEY,
  SAMPLE_CSV_CONTENT,
  SAMPLE_JSON_CONTENT,
  parseCSVInputWithDiagnostics,
  parseJSONInputWithDiagnostics,
} from "./custom-subjects";
import { ARCHIVE_CATALOG_ROLLBACK_KEY, type StorageAdapter } from "./app-storage";

class MemoryStorage {
  private values = new Map<string, string>();
  failWrites = false;
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new Error("quota");
    this.values.set(key, value);
  }
  removeItem(key: string) {
    if (this.failWrites) throw new Error("quota");
    this.values.delete(key);
  }
}

class FaultingStorage {
  readonly values = new Map<string, string>();
  writes = 0;
  failAt = new Set<number>();
  mismatchAt = new Set<number>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.writes++;
    if (this.failAt.has(this.writes)) throw new Error(`write ${this.writes} failed`);
    this.values.set(key, this.mismatchAt.has(this.writes) ? `${value}-mismatch` : value);
  }

  removeItem(key: string) {
    this.writes++;
    if (this.failAt.has(this.writes)) throw new Error(`remove ${this.writes} failed`);
    if (this.mismatchAt.has(this.writes)) this.values.set(key, "mismatch");
    else this.values.delete(key);
  }
}

const asAdapter = (storage: FaultingStorage) => storage as unknown as StorageAdapter;

afterEach(() => {
  Reflect.deleteProperty(globalThis, "localStorage");
});

describe("flexible subject catalog", () => {
  test("keeps simple CSV and JSON templates equivalent and reports row diagnostics", () => {
    const csv = parseCSVInputWithDiagnostics(SAMPLE_CSV_CONTENT);
    const json = parseJSONInputWithDiagnostics(SAMPLE_JSON_CONTENT);
    expect(csv.issues).toEqual([]);
    expect(json.issues).toEqual([]);
    expect(csv.items).toEqual(json.items);

    const malformed = parseCSVInputWithDiagnostics(
      "subject_id,subject_name,topic,lesson_id,lesson_name,target_minutes,planned_date,xp_reward\n,Toán,Hàm số,bai-1,,0,not-a-date,-2",
    );
    expect(malformed.items).toHaveLength(0);
    expect(malformed.issues).toEqual(expect.arrayContaining([expect.objectContaining({ row: 2 })]));
  });

  test("keeps imported planned duration", () => {
    const input = [
      {
        subject: "Tiếng Anh",
        title: "Unit 1",
        estimatedMinutes: 45,
        scheduledDate: "2026-07-25",
      },
    ];
    const subjects = convertRawToSubjects(input);
    expect(subjects[0].milestones[0].lessons[0].plannedDurationMinutes).toBe(45);
    expect(convertRawToSubjects(input)[0].milestones[0].lessons[0].id).toBe(
      subjects[0].milestones[0].lessons[0].id,
    );
  });

  test("preserves the exact imported lesson order when topics repeat", () => {
    const input = [
      {
        subject: "Toán",
        topic: "Chủ đề A",
        title: "A1",
        estimatedMinutes: 30,
        scheduledDate: "2026-08-03",
      },
      {
        subject: "Toán",
        topic: "Chủ đề B",
        title: "B1",
        estimatedMinutes: 30,
        scheduledDate: "2026-08-01",
      },
      {
        subject: "Toán",
        topic: "Chủ đề A",
        title: "A2",
        estimatedMinutes: 30,
        scheduledDate: "2026-08-01",
      },
      {
        subject: "Toán",
        topic: "Chủ đề B",
        title: "B2",
        estimatedMinutes: 30,
        scheduledDate: "2026-08-02",
      },
    ];

    const subjects = convertRawToSubjects(input);
    expect(subjects[0].milestones.map((milestone) => milestone.title)).toEqual([
      "Chủ đề A",
      "Chủ đề B",
      "Chủ đề A",
      "Chủ đề B",
    ]);
    expect(
      subjects[0].milestones.flatMap((milestone) =>
        milestone.lessons.map((lesson) => lesson.title),
      ),
    ).toEqual(input.map((lesson) => lesson.title));
  });

  test("adds and removes subjects without touching an external progress state", () => {
    const added = addSubjectToSubjects([], "Sinh học", "🧬");
    expect(added).toHaveLength(1);
    expect(added[0].name).toBe("Sinh học");
    expect(removeSubjectFromSubjects(added, added[0].id)).toEqual([]);
  });

  test("removes only the selected lesson", () => {
    const subjects = convertRawToSubjects([
      {
        subject: "Toán",
        title: "Bài 1",
        estimatedMinutes: 30,
        scheduledDate: "2026-07-25",
      },
      {
        subject: "Toán",
        title: "Bài 2",
        estimatedMinutes: 60,
        scheduledDate: "2026-07-26",
      },
    ]);
    const lessonId = subjects[0].milestones[0].lessons[0].id;
    const next = removeLessonFromSubjects(subjects, lessonId);
    expect(next[0].milestones[0].lessons).toHaveLength(1);
    expect(next[0].milestones[0].lessons[0].title).toBe("Bài 2");
  });

  test("edits a lesson without changing its stable history ID", () => {
    const subjects = convertRawToSubjects([
      {
        subject: "Toán",
        title: "Bài cũ",
        estimatedMinutes: 30,
        scheduledDate: "2026-07-25",
      },
    ]);
    const id = subjects[0].milestones[0].lessons[0].id;
    const updated = updateLessonDetails(subjects, id, {
      title: "Bài mới",
      plannedDurationMinutes: 55,
      scheduledDate: "",
    });
    expect(updated[0].milestones[0].lessons[0].id).toBe(id);
    expect(updated[0].milestones[0].lessons[0].title).toBe("Bài mới");
    expect(updated[0].milestones[0].lessons[0].scheduledDate).toBe("");
  });

  test("applies bulk lesson updates without creating duplicate IDs", () => {
    const subjects = convertRawToSubjects([
      {
        subject: "Môn A",
        lessonId: "a-1",
        title: "Bài A1",
        estimatedMinutes: 30,
        scheduledDate: "2026-07-25",
      },
      {
        subject: "Môn A",
        lessonId: "a-2",
        title: "Bài A2",
        estimatedMinutes: 45,
        scheduledDate: "2026-07-26",
      },
      {
        subject: "Môn B",
        lessonId: "b-1",
        title: "Bài B1",
        estimatedMinutes: 60,
        scheduledDate: "2026-07-27",
      },
    ]);
    const selected = new Set(["a-1", "a-2"]);
    const updated = updateLessonsDetails(subjects, selected, {
      plannedDurationMinutes: 90,
      scheduledDate: "2026-08-01",
    });
    expect(
      updated[0].milestones
        .flatMap((milestone) => milestone.lessons)
        .every((lesson) => lesson.plannedDurationMinutes === 90),
    ).toBe(true);
    const moved = moveLessonsToSubject(updated, selected, updated[1].id);
    const movedIds = moved[1].milestones
      .flatMap((milestone) => milestone.lessons)
      .map((lesson) => lesson.id);
    expect(movedIds).toEqual(expect.arrayContaining(["a-1", "a-2", "b-1"]));
    expect(new Set(movedIds).size).toBe(movedIds.length);
    const topicMoved = moveLessonsToTopic(moved, selected, moved[1].id, moved[1].milestones[0].id);
    expect(
      topicMoved[1].milestones[0].lessons.filter((lesson) => selected.has(lesson.id)),
    ).toHaveLength(2);
    const removed = removeLessonsFromSubjects(topicMoved, selected);
    expect(
      removed
        .flatMap((subject) => subject.milestones.flatMap((milestone) => milestone.lessons))
        .map((lesson) => lesson.id),
    ).toEqual(["b-1"]);
  });

  test("archives multiple lessons atomically", () => {
    const subjects = convertRawToSubjects([
      {
        subject: "Toán",
        lessonId: "math-1",
        title: "Bài 1",
        estimatedMinutes: 30,
        scheduledDate: "2026-07-25",
      },
      {
        subject: "Toán",
        lessonId: "math-2",
        title: "Bài 2",
        estimatedMinutes: 30,
        scheduledDate: "2026-07-26",
      },
    ]);
    const storage = new FaultingStorage();
    storage.values.set(CUSTOM_SUBJECTS_KEY, JSON.stringify(subjects));
    storage.values.set(ARCHIVED_CATALOG_KEY, JSON.stringify({ subjects: [], lessons: [] }));
    const next = archiveLessons(subjects, ["math-1", "math-2"], asAdapter(storage));
    expect(next[0].milestones.flatMap((milestone) => milestone.lessons)).toHaveLength(0);
    expect(JSON.parse(storage.values.get(ARCHIVED_CATALOG_KEY)!).lessons).toHaveLength(2);
  });

  test("moves a lesson into the edited topic group instead of changing only its label", () => {
    const subjects = convertRawToSubjects([
      {
        subject: "Toán",
        topic: "Chủ đề A",
        lessonId: "math-a",
        title: "Bài A",
        estimatedMinutes: 30,
        scheduledDate: "2026-07-25",
      },
      {
        subject: "Toán",
        topic: "Chủ đề B",
        lessonId: "math-b",
        title: "Bài B",
        estimatedMinutes: 30,
        scheduledDate: "2026-07-26",
      },
    ]);
    const updated = updateLessonDetails(subjects, "math-a", { topic: "Chủ đề B" });
    const target = updated[0].milestones.find((milestone) => milestone.title === "Chủ đề B");
    expect(target?.lessons.map((lesson) => lesson.id)).toEqual(
      expect.arrayContaining(["math-a", "math-b"]),
    );
    expect(
      updated[0].milestones.find((milestone) => milestone.title === "Chủ đề A")?.lessons,
    ).toHaveLength(0);
  });

  test("keeps lesson reordering inside the current topic and performs no storage write", () => {
    const source = convertRawToSubjects([
      {
        subject: "Toán",
        topic: "Chủ đề A",
        lessonId: "a-1",
        title: "A1",
        estimatedMinutes: 30,
        scheduledDate: "2026-07-25",
      },
      {
        subject: "Toán",
        topic: "Chủ đề A",
        lessonId: "a-2",
        title: "A2",
        estimatedMinutes: 30,
        scheduledDate: "2026-07-26",
      },
      {
        subject: "Toán",
        topic: "Chủ đề B",
        lessonId: "b-1",
        title: "B1",
        estimatedMinutes: 30,
        scheduledDate: "2026-07-27",
      },
    ]);
    const storage = new FaultingStorage();
    Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
    const subject = source[0];
    const topicA = subject.milestones.find((milestone) => milestone.title === "Chủ đề A")!;
    const topicB = subject.milestones.find((milestone) => milestone.title === "Chủ đề B")!;

    const moved = moveLessonBeforeInTopic(source, subject.id, topicA.id, "a-2", "a-1");
    expect(
      moved[0].milestones
        .find((milestone) => milestone.id === topicA.id)
        ?.lessons.map((lesson) => lesson.id),
    ).toEqual(["a-2", "a-1"]);
    expect(
      moved[0].milestones
        .find((milestone) => milestone.id === topicB.id)
        ?.lessons.map((lesson) => lesson.id),
    ).toEqual(["b-1"]);
    expect(storage.writes).toBe(0);
  });

  test("supports subject rename, move, duplicate and manual lesson order", () => {
    const source = convertRawToSubjects([
      {
        subject: "Môn A",
        title: "Bài 1",
        estimatedMinutes: 30,
        scheduledDate: "2026-07-25",
      },
      {
        subject: "Môn A",
        title: "Bài 2",
        estimatedMinutes: 30,
        scheduledDate: "2026-07-26",
      },
      {
        subject: "Môn B",
        title: "Bài B",
        estimatedMinutes: 30,
        scheduledDate: "2026-07-27",
      },
    ]);
    const renamed = updateSubjectDetails(source, source[0].id, { name: "Môn A mới" });
    expect(renamed[0].milestones[0].lessons[0].sourceSubject).toBe("Môn A mới");
    const firstId = renamed[0].milestones[0].lessons[0].id;
    const reordered = reorderLesson(renamed, firstId, 1);
    expect(reordered[0].milestones[0].lessons[1].id).toBe(firstId);
    const duplicated = duplicateLessonInSubjects(reordered, firstId);
    expect(duplicated[0].milestones[0].lessons).toHaveLength(3);
    const moved = moveLessonToSubject(duplicated, firstId, duplicated[1].id);
    expect(moved[1].milestones[0].lessons.some((lesson) => lesson.id === firstId)).toBe(true);
    const targetId = moved[1].milestones[0].lessons[0].id;
    const dragged = moveLessonBefore(moved, firstId, targetId);
    expect(dragged[1].milestones[0].lessons[0].id).toBe(firstId);
  });

  test("does not substitute sample data for malformed stored subject JSON", () => {
    const storage = new MemoryStorage();
    Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
    expect(getStoredCustomSubjects().status).toBe("missing");
    storage.setItem(CUSTOM_SUBJECTS_KEY, "{invalid");
    const loaded = getStoredCustomSubjects();
    expect(loaded.status).toBe("invalid");
    if (loaded.status === "invalid") expect(loaded.raw).toBe("{invalid");
  });

  test("contains archive read and write failures without overwriting invalid archive bytes", () => {
    const storage = new MemoryStorage();
    Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
    const subjects = convertRawToSubjects([
      {
        subject: "Toán",
        title: "Bài cần lưu trữ",
        estimatedMinutes: 30,
        scheduledDate: "2026-07-25",
      },
    ]);
    storage.setItem(ARCHIVED_CATALOG_KEY, "{broken-archive");

    expect(loadArchivedCatalog().status).toBe("invalid");
    expect(archiveSubject(subjects, subjects[0].id)).toBe(subjects);
    expect(storage.getItem(ARCHIVED_CATALOG_KEY)).toBe("{broken-archive");
    expect(getLastCatalogStorageError()).toBeTruthy();

    storage.removeItem(ARCHIVED_CATALOG_KEY);
    storage.failWrites = true;
    expect(archiveSubject(subjects, subjects[0].id)).toBe(subjects);
    expect(storage.getItem(ARCHIVED_CATALOG_KEY)).toBeNull();
    expect(getLastCatalogStorageError()).toBeTruthy();
  });

  test("archives and restores catalog data with verified rollback at every write position", () => {
    const subjects = convertRawToSubjects([
      {
        subject: "Toan",
        title: "Bai 1",
        estimatedMinutes: 30,
        scheduledDate: "2026-07-25",
      },
    ]);
    const lesson = subjects[0].milestones[0].lessons[0];
    const emptyArchive = JSON.stringify({ subjects: [], lessons: [] });

    type Fixture = {
      storage: FaultingStorage;
      existing: typeof subjects;
      catalogRaw: string;
      archiveRaw: string;
    };
    type Mutation = (existing: typeof subjects, storage: StorageAdapter) => typeof subjects;

    const archiveSubjectFixture = (): Fixture => {
      const storage = new FaultingStorage();
      const catalogRaw = JSON.stringify(subjects);
      storage.values.set(CUSTOM_SUBJECTS_KEY, catalogRaw);
      storage.values.set(ARCHIVED_CATALOG_KEY, emptyArchive);
      return { storage, existing: subjects, catalogRaw, archiveRaw: emptyArchive };
    };
    const restoreSubjectFixture = (): Fixture => {
      const storage = new FaultingStorage();
      const catalogRaw = JSON.stringify([]);
      const archiveRaw = JSON.stringify({ subjects, lessons: [] });
      storage.values.set(CUSTOM_SUBJECTS_KEY, catalogRaw);
      storage.values.set(ARCHIVED_CATALOG_KEY, archiveRaw);
      return { storage, existing: [], catalogRaw, archiveRaw };
    };
    const archiveLessonFixture = archiveSubjectFixture;
    const restoreLessonFixture = (): Fixture => {
      const storage = new FaultingStorage();
      const catalogRaw = JSON.stringify([]);
      const archiveRaw = JSON.stringify({
        subjects: [],
        lessons: [
          {
            subjectId: subjects[0].id,
            subjectName: subjects[0].name,
            subjectEmoji: subjects[0].emoji,
            lesson,
          },
        ],
      });
      storage.values.set(CUSTOM_SUBJECTS_KEY, catalogRaw);
      storage.values.set(ARCHIVED_CATALOG_KEY, archiveRaw);
      return { storage, existing: [], catalogRaw, archiveRaw };
    };

    const assertFaultMatrix = (createFixture: () => Fixture, mutate: Mutation) => {
      for (const writePosition of [1, 2, 3]) {
        const fixture = createFixture();
        fixture.storage.failAt.add(writePosition);
        expect(mutate(fixture.existing, asAdapter(fixture.storage))).toBe(fixture.existing);
        expect(fixture.storage.values.get(CUSTOM_SUBJECTS_KEY)).toBe(fixture.catalogRaw);
        expect(fixture.storage.values.get(ARCHIVED_CATALOG_KEY)).toBe(fixture.archiveRaw);
      }
      for (const writePosition of [1, 2, 3]) {
        const fixture = createFixture();
        fixture.storage.mismatchAt.add(writePosition);
        expect(mutate(fixture.existing, asAdapter(fixture.storage))).toBe(fixture.existing);
        expect(fixture.storage.values.get(CUSTOM_SUBJECTS_KEY)).toBe(fixture.catalogRaw);
        expect(fixture.storage.values.get(ARCHIVED_CATALOG_KEY)).toBe(fixture.archiveRaw);
      }
      const fixture = createFixture();
      fixture.storage.failAt.add(3); // catalog target
      fixture.storage.failAt.add(4); // archive rollback
      expect(mutate(fixture.existing, asAdapter(fixture.storage))).toBe(fixture.existing);
      expect(fixture.storage.values.get(ARCHIVE_CATALOG_ROLLBACK_KEY)).toBeTruthy();
      expect(fixture.storage.values.get(CUSTOM_SUBJECTS_KEY)).toBe(fixture.catalogRaw);
      expect(fixture.storage.values.get(ARCHIVED_CATALOG_KEY)).not.toBe(fixture.archiveRaw);
    };

    assertFaultMatrix(archiveSubjectFixture, (existing, storage) =>
      archiveSubject(existing, subjects[0].id, storage),
    );
    assertFaultMatrix(restoreSubjectFixture, (existing, storage) =>
      restoreArchivedSubject(existing, subjects[0].id, storage),
    );
    assertFaultMatrix(archiveLessonFixture, (existing, storage) =>
      archiveLesson(existing, lesson.id, storage),
    );
    assertFaultMatrix(restoreLessonFixture, (existing, storage) =>
      restoreArchivedLesson(existing, lesson.id, storage),
    );

    const archived = archiveSubjectFixture();
    const archivedResult = archiveSubject(
      archived.existing,
      subjects[0].id,
      asAdapter(archived.storage),
    );
    expect(archivedResult).toHaveLength(0);
    expect(JSON.parse(archived.storage.values.get(ARCHIVED_CATALOG_KEY)!).subjects).toHaveLength(1);

    const restored = restoreSubjectFixture();
    const restoredResult = restoreArchivedSubject(
      restored.existing,
      subjects[0].id,
      asAdapter(restored.storage),
    );
    expect(restoredResult).toHaveLength(1);
    expect(JSON.parse(restored.storage.values.get(ARCHIVED_CATALOG_KEY)!).subjects).toHaveLength(0);
  });
});
