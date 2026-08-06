import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LibraryBig, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Lesson, LessonScheduleMode, Subject } from "@/lib/mock-data";
import type { PlannerSettings } from "@/lib/planner";
import type { ProgressState } from "@/lib/progress-store";
import {
  addSubjectToSubjects,
  addTopicToSubject,
  archiveLesson,
  archiveLessons,
  archiveSubject,
  downloadFile,
  duplicateLessonInSubjects,
  getArchivedCatalog,
  getLastCatalogStorageError,
  removeLessonFromSubjects,
  removeLessonsFromSubjects,
  removeSubjectFromSubjects,
  removeTopicAndMoveLessonsToUncategorized,
  renameTopicInSubjects,
  restoreArchivedLesson,
  restoreArchivedSubject,
  restoreCatalogBackup,
  updateLessonDetails,
  updateSubjectDetails,
  type CatalogUpdateOptions,
  type CatalogUpdateResult,
} from "@/lib/custom-subjects";
import {
  buildBulkLessonUpdateCandidate,
  buildEditLessonCandidate,
  buildMoveLessonsCandidate,
  buildReorderLessonCandidate,
  buildReorderSubjectCandidate,
  buildReorderTopicCandidate,
  type LessonEditorCandidateInput,
  type ScheduleCandidateBuildResult,
} from "@/lib/schedule-candidates";
import { createScheduleSnapshot, type ScheduleMutationKind } from "@/lib/schedule-transactions";
import type { ScheduleTransactionController } from "@/components/schedule/useScheduleTransactions";
import { AddLessonModal } from "@/components/AddLessonModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BulkActionsBar } from "./course-manager/BulkActionsBar";
import { LessonEditorDialog } from "./course-manager/LessonEditorDialog";
import { LessonRow } from "./course-manager/LessonRow";
import { SubjectHeader } from "./course-manager/SubjectHeader";
import { SubjectListPane } from "./course-manager/SubjectListPane";
import { SubjectWorkspace } from "./course-manager/SubjectWorkspace";
import { TopicSection } from "./course-manager/TopicSection";
import {
  buildMinutesByLesson,
  classifyLessonEdit,
  createLessonEditorDraft,
  deriveSubjectStats,
  filterAndSortMilestones,
  type LessonEditorDraft,
  type LessonFilter,
  type LessonSort,
} from "./course-manager/course-manager-model";
import { useLessonReorder, type DragLocation } from "./course-manager/useLessonReorder";

type Props = {
  currentSubjects: Subject[];
  onSubjectsUpdated: (
    subjects: Subject[],
    options?: CatalogUpdateOptions,
  ) => CatalogUpdateResult | boolean | void;
  plannerSettings: PlannerSettings;
  scheduleTransactions: ScheduleTransactionController;
  progress?: ProgressState;
  activeTimerLessonId?: string | null;
  trigger?: ReactNode;
};

type PendingDelete = {
  title: string;
  description: string;
  nextSubjects: Subject[];
  successMessage: string;
};

type TopicEditor = {
  id: string | null;
  title: string;
};

function catalogUpdateSucceeded(result: CatalogUpdateResult | boolean | void): boolean {
  return result == null ? true : typeof result === "boolean" ? result : result.ok;
}

function allLessons(subject: Subject): Lesson[] {
  return subject.milestones.flatMap((topic) => topic.lessons);
}

function findLessonOwner(subjects: Subject[], lessonId: string) {
  for (const subject of subjects) {
    for (const topic of subject.milestones) {
      if (topic.lessons.some((lesson) => lesson.id === lessonId)) {
        return { subjectId: subject.id, topicId: topic.id };
      }
    }
  }
  return null;
}

export function CourseManagerModal({
  currentSubjects,
  onSubjectsUpdated,
  plannerSettings,
  scheduleTransactions,
  progress,
  activeTimerLessonId,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(currentSubjects[0]?.id ?? "");
  const [mobileDetail, setMobileDetail] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [lessonSearch, setLessonSearch] = useState("");
  const [filter, setFilter] = useState<LessonFilter>("all");
  const [sort, setSort] = useState<LessonSort>("roadmap");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedLessonIds, setSelectedLessonIds] = useState<Set<string>>(() => new Set());
  const [bulkTargetSubjectId, setBulkTargetSubjectId] = useState("");
  const [bulkTargetTopicId, setBulkTargetTopicId] = useState("");
  const [bulkDate, setBulkDate] = useState("");
  const [bulkScheduleMode, setBulkScheduleMode] =
    useState<LessonScheduleMode>("flexible");
  const [bulkMinutes, setBulkMinutes] = useState(120);
  const [archiveView, setArchiveView] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectEmoji, setNewSubjectEmoji] = useState("📖");
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectDraft, setSubjectDraft] = useState({ name: "", emoji: "📖" });
  const [topicEditor, setTopicEditor] = useState<TopicEditor | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [draft, setDraft] = useState<LessonEditorDraft | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentSubjects.some((subject) => subject.id === selectedSubjectId)) {
      setSelectedSubjectId(currentSubjects[0]?.id ?? "");
    }
  }, [currentSubjects, selectedSubjectId]);

  useEffect(() => {
    setSelectedLessonIds(new Set());
    setSelectionMode(false);
    setBulkTargetSubjectId("");
    setBulkTargetTopicId("");
  }, [selectedSubjectId]);

  const minutesByLesson = useMemo(() => buildMinutesByLesson(progress), [progress]);
  const selectedSubject =
    currentSubjects.find((subject) => subject.id === selectedSubjectId) ?? null;
  const visibleSubjects = useMemo(() => {
    const keyword = subjectSearch.trim().toLocaleLowerCase("vi");
    return keyword
      ? currentSubjects.filter((subject) => subject.name.toLocaleLowerCase("vi").includes(keyword))
      : currentSubjects;
  }, [currentSubjects, subjectSearch]);
  const visibleMilestones = useMemo(
    () =>
      selectedSubject
        ? filterAndSortMilestones({
            subject: selectedSubject,
            search: lessonSearch,
            filter,
            sort,
            minutesByLesson,
            progress,
          })
        : [],
    [filter, lessonSearch, minutesByLesson, progress, selectedSubject, sort],
  );
  const visibleLessonIds = useMemo(
    () => visibleMilestones.flatMap((topic) => topic.lessons.map((lesson) => lesson.id)),
    [visibleMilestones],
  );
  const stats = selectedSubject
    ? deriveSubjectStats(selectedSubject, minutesByLesson, progress)
    : null;
  const archived = getArchivedCatalog();
  const reorderEnabled =
    !subjectSearch.trim() && !lessonSearch.trim() && filter === "all" && sort === "roadmap";

  const applyCatalog = (
    subjects: Subject[],
    message?: string,
    options: CatalogUpdateOptions = {},
  ): boolean => {
    if (subjects === currentSubjects) {
      const error = getLastCatalogStorageError();
      if (error) toast.error(error);
      return false;
    }
    const result = onSubjectsUpdated(subjects, options);
    if (!catalogUpdateSucceeded(result)) return false;
    if (message) toast.success(message);
    return true;
  };

  const clearSelection = () => {
    setSelectedLessonIds(new Set());
    setSelectionMode(false);
  };

  const toggleLessonSelection = (lessonId: string) => {
    setSelectedLessonIds((current) => {
      const next = new Set(current);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  const confirmTimerImpact = (lessonIds: Iterable<string>, action: string) => {
    if (!activeTimerLessonId || !new Set(lessonIds).has(activeTimerLessonId)) return true;
    return window.confirm(
      `Bài học này đang có một phiên Timer. Nhấn OK để ${action} nhưng vẫn tiếp tục phiên hiện tại; nhấn Hủy để quay lại và dừng Timer trước.`,
    );
  };

  const createSubject = () => {
    const name = newSubjectName.trim();
    if (!name) {
      toast.error("Vui lòng nhập tên môn học.");
      return;
    }
    if (
      currentSubjects.some(
        (subject) => subject.name.localeCompare(name, "vi", { sensitivity: "base" }) === 0,
      )
    ) {
      toast.error("Môn học này đã tồn tại.");
      return;
    }
    const next = addSubjectToSubjects(currentSubjects, name, newSubjectEmoji.trim() || "📖");
    if (!applyCatalog(next, `Đã tạo môn ${name}.`, { createBackup: true })) return;
    const created = next.find((subject) => subject.name === name);
    if (created) {
      setSelectedSubjectId(created.id);
      setMobileDetail(true);
    }
    setNewSubjectName("");
    setNewSubjectEmoji("📖");
  };

  const openSubjectEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectDraft({ name: subject.name, emoji: subject.emoji });
  };

  const saveSubject = () => {
    if (!editingSubject) return;
    const name = subjectDraft.name.trim();
    if (!name) {
      toast.error("Tên môn học không được để trống.");
      return;
    }
    const duplicate = currentSubjects.some(
      (subject) =>
        subject.id !== editingSubject.id &&
        subject.name.localeCompare(name, "vi", { sensitivity: "base" }) === 0,
    );
    if (duplicate) {
      toast.error("Môn học này đã tồn tại.");
      return;
    }
    const next = updateSubjectDetails(currentSubjects, editingSubject.id, {
      name,
      emoji: subjectDraft.emoji.trim() || editingSubject.emoji,
    });
    if (applyCatalog(next, `Đã cập nhật môn ${name}.`, { createBackup: true })) {
      setEditingSubject(null);
    }
  };

  const saveTopic = () => {
    if (!selectedSubject || !topicEditor) return;
    const title = topicEditor.title.trim();
    if (!title) {
      toast.error("Tên chủ đề không được để trống.");
      return;
    }
    const duplicate = selectedSubject.milestones.some(
      (topic) =>
        topic.id !== topicEditor.id &&
        topic.title.localeCompare(title, "vi", { sensitivity: "base" }) === 0,
    );
    if (duplicate) {
      toast.error("Chủ đề này đã tồn tại trong môn học.");
      return;
    }
    const next = topicEditor.id
      ? renameTopicInSubjects(currentSubjects, selectedSubject.id, topicEditor.id, title)
      : addTopicToSubject(currentSubjects, selectedSubject.id, title);
    const message = topicEditor.id
      ? `Đã đổi tên chủ đề thành ${title}.`
      : `Đã thêm chủ đề ${title}.`;
    if (applyCatalog(next, message, { createBackup: true })) setTopicEditor(null);
  };

  const restoreSubject = (subjectId: string) => {
    const subject = archived.subjects.find((item) => item.id === subjectId);
    const next = restoreArchivedSubject(currentSubjects, subjectId);
    if (
      applyCatalog(next, `Đã khôi phục môn ${subject?.name ?? "học"}.`, {
        alreadyPersisted: true,
      })
    ) {
      setArchiveView(false);
      setSelectedSubjectId(subjectId);
    }
  };

  const restoreLesson = (lessonId: string) => {
    const item = archived.lessons.find((candidate) => candidate.lesson.id === lessonId);
    const next = restoreArchivedLesson(currentSubjects, lessonId);
    applyCatalog(next, `Đã khôi phục bài ${item?.lesson.title ?? "học"}.`, {
      alreadyPersisted: true,
    });
  };

  const restoreCatalog = () => {
    const restored = restoreCatalogBackup();
    if (!restored) {
      const error = getLastCatalogStorageError();
      if (error) toast.error(error);
      else toast.info("Chưa có thay đổi danh mục để hoàn tác.");
      return;
    }
    applyCatalog(restored, "Đã hoàn tác thay đổi danh mục gần nhất.", {
      alreadyPersisted: true,
    });
  };

  const archiveCurrentSubject = () => {
    if (!selectedSubject) return;
    const lessons = allLessons(selectedSubject);
    if (
      !confirmTimerImpact(
        lessons.map((lesson) => lesson.id),
        `lưu trữ môn ${selectedSubject.name}`,
      )
    ) {
      return;
    }
    if (
      !window.confirm(`Lưu trữ môn “${selectedSubject.name}”? Lịch sử học vẫn được giữ.`)
    ) {
      return;
    }
    const next = archiveSubject(currentSubjects, selectedSubject.id);
    if (
      applyCatalog(next, `Đã lưu trữ môn ${selectedSubject.name}.`, {
        alreadyPersisted: true,
      })
    ) {
      setMobileDetail(false);
    }
  };

  const requestDeleteSubject = () => {
    if (!selectedSubject) return;
    const lessons = allLessons(selectedSubject);
    if (
      !confirmTimerImpact(
        lessons.map((lesson) => lesson.id),
        `xóa môn ${selectedSubject.name}`,
      )
    ) {
      return;
    }
    setPendingDelete({
      title: `Xóa môn “${selectedSubject.name}”?`,
      description: `${lessons.length} bài sẽ bị xóa khỏi lộ trình và lịch tương lai. Lịch sử các phiên học đã diễn ra vẫn được giữ.`,
      nextSubjects: removeSubjectFromSubjects(currentSubjects, selectedSubject.id),
      successMessage: `Đã xóa môn ${selectedSubject.name}.`,
    });
  };

  const requestDeleteTopic = (topicId: string) => {
    if (!selectedSubject) return;
    const topic = selectedSubject.milestones.find((candidate) => candidate.id === topicId);
    if (!topic) return;
    setPendingDelete({
      title: `Xóa chủ đề “${topic.title}”?`,
      description: topic.lessons.length
        ? `${topic.lessons.length} bài sẽ được chuyển sang “Chưa phân loại”; không có lịch sử học nào bị xóa.`
        : "Chủ đề trống sẽ bị xóa khỏi môn học.",
      nextSubjects: removeTopicAndMoveLessonsToUncategorized(
        currentSubjects,
        selectedSubject.id,
        topic.id,
      ),
      successMessage: `Đã xóa chủ đề ${topic.title}.`,
    });
  };

  const duplicateLesson = (lesson: Lesson) => {
    applyCatalog(
      duplicateLessonInSubjects(currentSubjects, lesson.id),
      `Đã nhân bản bài ${lesson.title}.`,
      { createBackup: true },
    );
  };

  const archiveSingleLesson = (lesson: Lesson) => {
    if (!confirmTimerImpact([lesson.id], `lưu trữ bài ${lesson.title}`)) return;
    if (!window.confirm(`Lưu trữ bài “${lesson.title}”? Lịch sử học vẫn được giữ.`)) return;
    applyCatalog(archiveLesson(currentSubjects, lesson.id), `Đã lưu trữ bài ${lesson.title}.`, {
      alreadyPersisted: true,
    });
  };

  const requestDeleteLesson = (lesson: Lesson) => {
    if (!confirmTimerImpact([lesson.id], `xóa bài ${lesson.title}`)) return;
    setPendingDelete({
      title: `Xóa “${lesson.title}”?`,
      description:
        "Bài sẽ bị xóa khỏi lộ trình và lịch tương lai. Lịch sử phiên học đã diễn ra vẫn được giữ.",
      nextSubjects: removeLessonFromSubjects(currentSubjects, lesson.id),
      successMessage: `Đã xóa bài ${lesson.title}.`,
    });
  };

  const exportSubject = (subject: Subject) => {
    const rows = subject.milestones.flatMap((topic) =>
      topic.lessons.map((lesson) => ({
        subject_id: subject.id,
        subject_name: subject.name,
        topic: lesson.topic || topic.title,
        lesson_id: lesson.id,
        lesson_name: lesson.title,
        target_minutes: lesson.plannedDurationMinutes,
        planned_date: lesson.scheduledDate,
        schedule_mode: lesson.scheduleMode ?? "flexible",
        xp_reward: lesson.xp,
      })),
    );
    const safeName =
      subject.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase() || subject.id;
    downloadFile(`mon-${safeName}.json`, JSON.stringify(rows, null, 2), "application/json");
    toast.success(`Đã xuất môn ${subject.name}.`);
  };

  const commitReorder = (
    built: ScheduleCandidateBuildResult,
    kind: ScheduleMutationKind,
    description: string,
    successMessage: string,
  ) => {
    if (!built.ok) {
      toast.error(built.error);
      return false;
    }
    const result = scheduleTransactions.executeMutation({
      candidate: built.candidate,
      kind,
      description,
    });
    if (!result.ok) {
      toast.error(result.rollbackError ? `${result.error} ${result.rollbackError}` : result.error);
      return false;
    }
    if (result.status === "committed") toast.success(successMessage);
    return true;
  };

  const commitBulkScheduleMutation = (
    built: ScheduleCandidateBuildResult,
    kind: ScheduleMutationKind,
    description: string,
    successMessage: string,
  ) => {
    if (!built.ok) {
      toast.error(built.error);
      return false;
    }
    const result = scheduleTransactions.executeMutation({
      candidate: built.candidate,
      kind,
      description,
    });
    if (!result.ok) {
      toast.error(result.rollbackError ? `${result.error} ${result.rollbackError}` : result.error);
      return false;
    }
    if (result.status === "committed") {
      toast.success(`${successMessage} Nhấn Ctrl+Z để hoàn tác thay đổi lịch.`);
    }
    clearSelection();
    return true;
  };

  const moveSubject = (subjectId: string, direction: -1 | 1) => {
    const subject = currentSubjects.find((candidate) => candidate.id === subjectId);
    if (!subject) return;
    const built = buildReorderSubjectCandidate({
      current: createScheduleSnapshot(currentSubjects, plannerSettings),
      subjectId,
      direction,
    });
    commitReorder(
      built,
      "reorder-subject",
      `Sắp xếp môn học ${subject.name}`,
      "Đã cập nhật thứ tự môn học.",
    );
  };

  const moveTopic = (subjectId: string, topicId: string, direction: -1 | 1) => {
    const subject = currentSubjects.find((candidate) => candidate.id === subjectId);
    const topic = subject?.milestones.find((candidate) => candidate.id === topicId);
    if (!topic) return;
    const built = buildReorderTopicCandidate({
      current: createScheduleSnapshot(currentSubjects, plannerSettings),
      subjectId,
      topicId,
      direction,
    });
    commitReorder(
      built,
      "reorder-topic",
      `Sắp xếp chủ đề ${topic.title}`,
      "Đã cập nhật thứ tự chủ đề.",
    );
  };

  const moveLessonTo = (lessonId: string, target: DragLocation) => {
    const lesson = currentSubjects
      .flatMap((subject) => subject.milestones)
      .flatMap((topic) => topic.lessons)
      .find((candidate) => candidate.id === lessonId);
    if (!lesson) return;
    const built = buildReorderLessonCandidate({
      current: createScheduleSnapshot(currentSubjects, plannerSettings),
      lessonId,
      target,
    });
    commitReorder(
      built,
      "reorder-lesson",
      `Sắp xếp bài học ${lesson.title}`,
      "Đã cập nhật thứ tự bài học.",
    );
  };

  const moveSelectedToSubject = () => {
    if (!bulkTargetSubjectId) return;
    if (
      !confirmTimerImpact(
        selectedLessonIds,
        `chuyển ${selectedLessonIds.size} bài học sang môn khác`,
      )
    ) {
      return;
    }
    const built = buildMoveLessonsCandidate({
      current: createScheduleSnapshot(currentSubjects, plannerSettings),
      lessonIds: selectedLessonIds,
      targetSubjectId: bulkTargetSubjectId,
    });
    commitBulkScheduleMutation(
      built,
      "move-lessons",
      `Chuyển ${selectedLessonIds.size} bài học sang môn khác`,
      `Đã chuyển ${selectedLessonIds.size} bài học.`,
    );
  };

  const moveSelectedToTopic = () => {
    if (!selectedSubject || !bulkTargetTopicId) return;
    if (
      !confirmTimerImpact(
        selectedLessonIds,
        `chuyển ${selectedLessonIds.size} bài học sang chủ đề khác`,
      )
    ) {
      return;
    }
    const built = buildMoveLessonsCandidate({
      current: createScheduleSnapshot(currentSubjects, plannerSettings),
      lessonIds: selectedLessonIds,
      targetSubjectId: selectedSubject.id,
      targetTopicId: bulkTargetTopicId,
    });
    commitBulkScheduleMutation(
      built,
      "move-lessons",
      `Chuyển ${selectedLessonIds.size} bài học sang chủ đề khác`,
      `Đã chuyển ${selectedLessonIds.size} bài sang chủ đề mới.`,
    );
  };

  const bulkScheduleMutation = {
    kind: "bulk-schedule-update" as const,
  };

  const updateSelectedDate = () => {
    const built = buildBulkLessonUpdateCandidate({
      current: createScheduleSnapshot(currentSubjects, plannerSettings),
      lessonIds: selectedLessonIds,
      patch: { scheduledDate: bulkDate },
    });
    commitBulkScheduleMutation(
      built,
      bulkScheduleMutation.kind,
      `Cập nhật ngày cho ${selectedLessonIds.size} bài học`,
      `Đã cập nhật ngày cho ${selectedLessonIds.size} bài.`,
    );
  };

  const updateSelectedMode = () => {
    const built = buildBulkLessonUpdateCandidate({
      current: createScheduleSnapshot(currentSubjects, plannerSettings),
      lessonIds: selectedLessonIds,
      patch: { scheduleMode: bulkScheduleMode },
    });
    commitBulkScheduleMutation(
      built,
      bulkScheduleMutation.kind,
      `Đổi cách xếp lịch cho ${selectedLessonIds.size} bài học`,
      `Đã đổi cách xếp lịch cho ${selectedLessonIds.size} bài.`,
    );
  };

  const updateSelectedDuration = () => {
    const built = buildBulkLessonUpdateCandidate({
      current: createScheduleSnapshot(currentSubjects, plannerSettings),
      lessonIds: selectedLessonIds,
      patch: { plannedDurationMinutes: bulkMinutes },
    });
    commitBulkScheduleMutation(
      built,
      bulkScheduleMutation.kind,
      `Đổi thời lượng cho ${selectedLessonIds.size} bài học`,
      `Đã đặt mục tiêu ${bulkMinutes} phút cho ${selectedLessonIds.size} bài.`,
    );
  };

  const archiveSelected = () => {
    if (!confirmTimerImpact(selectedLessonIds, `lưu trữ ${selectedLessonIds.size} bài học`)) {
      return;
    }
    if (
      !window.confirm(
        `Lưu trữ ${selectedLessonIds.size} bài học? Lịch sử phiên học vẫn được giữ.`,
      )
    ) {
      return;
    }
    const next = archiveLessons(currentSubjects, selectedLessonIds);
    if (
      applyCatalog(next, `Đã lưu trữ ${selectedLessonIds.size} bài học.`, {
        alreadyPersisted: true,
      })
    ) {
      clearSelection();
    }
  };

  const deleteSelected = () => {
    if (!confirmTimerImpact(selectedLessonIds, `xóa ${selectedLessonIds.size} bài học`)) return;
    setPendingDelete({
      title: `Xóa ${selectedLessonIds.size} bài học?`,
      description:
        "Các bài sẽ bị xóa khỏi lộ trình và lịch tương lai. Lịch sử phiên học vẫn được giữ.",
      nextSubjects: removeLessonsFromSubjects(currentSubjects, selectedLessonIds),
      successMessage: `Đã xóa ${selectedLessonIds.size} bài học.`,
    });
  };

  const lessonReorder = useLessonReorder({
    enabled: reorderEnabled,
    onDrop: moveLessonTo,
  });

  const moveLessonByButton = (lessonId: string, direction: "up" | "down") => {
    const owner = findLessonOwner(currentSubjects, lessonId);
    if (!owner) return;
    const topic = currentSubjects
      .find((subject) => subject.id === owner.subjectId)
      ?.milestones.find((candidate) => candidate.id === owner.topicId);
    if (!topic) return;
    const index = topic.lessons.findIndex((lesson) => lesson.id === lessonId);
    if (index < 0) return;
    const beforeLessonId =
      direction === "up" ? topic.lessons[index - 1]?.id : (topic.lessons[index + 2]?.id ?? null);
    if (direction === "up" && beforeLessonId == null) return;
    if (direction === "down" && index >= topic.lessons.length - 1) return;
    moveLessonTo(lessonId, {
      subjectId: owner.subjectId,
      topicId: owner.topicId,
      beforeLessonId,
    });
  };

  const openLessonEdit = (lesson: Lesson) => {
    const nextDraft = createLessonEditorDraft({ subjects: currentSubjects, lesson });
    if (!nextDraft) {
      toast.error("Không tìm thấy vị trí hiện tại của bài học.");
      return;
    }
    setEditingLesson(lesson);
    setDraft(nextDraft);
  };

  const closeLessonEdit = () => {
    if (saving) return;
    setEditingLesson(null);
    setDraft(null);
  };

  const saveLesson = () => {
    if (!editingLesson || !draft) return;
    const owner = findLessonOwner(currentSubjects, editingLesson.id);
    if (!owner) {
      toast.error("Không tìm thấy vị trí hiện tại của bài học.");
      return;
    }
    const classification = classifyLessonEdit({
      lesson: editingLesson,
      ownerSubjectId: owner.subjectId,
      ownerTopicId: owner.topicId,
      draft,
    });
    if (classification === "noop") {
      setEditingLesson(null);
      setDraft(null);
      return;
    }
    if (classification === "catalog-only") {
      const subjects = updateLessonDetails(currentSubjects, editingLesson.id, {
        title: draft.title.trim(),
      });
      if (!applyCatalog(subjects, "Đã cập nhật tên bài học.", { createBackup: true })) return;
      setEditingLesson(null);
      setDraft(null);
      return;
    }
    if (
      activeTimerLessonId === editingLesson.id &&
      (draft.subjectId !== owner.subjectId || draft.topicId !== owner.topicId) &&
      !window.confirm(
        "Bài học này đang có một phiên Timer. Nhấn OK để chuyển vị trí nhưng vẫn tiếp tục phiên hiện tại.",
      )
    ) {
      return;
    }
    const input: LessonEditorCandidateInput = {
      title: draft.title,
      subjectId: draft.subjectId,
      topicId: draft.topicId,
      plannedDurationMinutes: draft.minutes,
      scheduledDate: draft.date,
      scheduleMode: draft.scheduleMode,
    };
    const built = buildEditLessonCandidate({
      current: createScheduleSnapshot(currentSubjects, plannerSettings),
      lessonId: editingLesson.id,
      input,
    });
    if (!built.ok) {
      toast.error(built.error);
      return;
    }
    setSaving(true);
    const result = scheduleTransactions.executeMutation({
      candidate: built.candidate,
      kind: "edit-lesson",
      description: `Chỉnh sửa bài học ${editingLesson.title}`,
    });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.rollbackError ? `${result.error} ${result.rollbackError}` : result.error);
      return;
    }
    if (result.status === "committed") {
      toast.success("Đã cập nhật bài học và lịch học. Nhấn Ctrl+Z để hoàn tác thay đổi lịch.");
    }
    setEditingLesson(null);
    setDraft(null);
  };

  const undoSchedule = () => {
    scheduleTransactions.undoLastMutation();
  };

  const selectedSubjectIndex = selectedSubject
    ? currentSubjects.findIndex((subject) => subject.id === selectedSubject.id)
    : -1;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setMobileDetail(false);
        }}
      >
        <DialogTrigger asChild>
          {trigger ?? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-2xl border-indigo-200 bg-indigo-50/70 text-xs font-semibold text-indigo-800"
            >
              <LibraryBig className="h-4 w-4" />
              <span className="hidden sm:inline">Môn & bài học</span>
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="grid h-[94vh] w-[97vw] max-w-6xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-3xl p-0">
          <DialogHeader className="border-b bg-white px-5 py-4">
            <DialogTitle className="flex items-center gap-2 font-serif text-xl">
              <LibraryBig className="h-5 w-5 text-indigo-700" /> Quản lý môn & bài học
            </DialogTitle>
            <DialogDescription>
              Tổ chức môn học, chủ đề và các bài trong lộ trình của bạn.
            </DialogDescription>
          </DialogHeader>

          <div className="grid min-h-0 flex-1 md:grid-cols-[280px_1fr]">
            <SubjectListPane
              subjects={currentSubjects}
              visibleSubjects={visibleSubjects}
              archivedSubjects={archived.subjects}
              archivedLessons={archived.lessons}
              selectedSubjectId={selectedSubjectId}
              mobileDetail={mobileDetail}
              archiveView={archiveView}
              subjectSearch={subjectSearch}
              newSubjectName={newSubjectName}
              newSubjectEmoji={newSubjectEmoji}
              getSubjectStats={(subject) => deriveSubjectStats(subject, minutesByLesson, progress)}
              onSubjectSearchChange={setSubjectSearch}
              onNewSubjectNameChange={setNewSubjectName}
              onNewSubjectEmojiChange={setNewSubjectEmoji}
              onCreateSubject={createSubject}
              onArchiveViewChange={setArchiveView}
              onSelectSubject={(subjectId) => {
                setSelectedSubjectId(subjectId);
                setMobileDetail(true);
              }}
              onRestoreSubject={restoreSubject}
              onRestoreLesson={restoreLesson}
              onRestoreCatalogBackup={restoreCatalog}
            />

            <SubjectWorkspace
              mobileDetail={mobileDetail}
              hasSubject={Boolean(selectedSubject)}
              search={lessonSearch}
              filter={filter}
              sort={sort}
              selectionMode={selectionMode}
              reorderEnabled={reorderEnabled}
              canUndoSchedule={scheduleTransactions.canUndo}
              onBack={() => setMobileDetail(false)}
              onSearchChange={setLessonSearch}
              onFilterChange={setFilter}
              onSortChange={setSort}
              onToggleSelectionMode={() => {
                if (selectionMode) clearSelection();
                else setSelectionMode(true);
              }}
              onUndoSchedule={undoSchedule}
              header={
                selectedSubject && stats ? (
                  <SubjectHeader
                    subject={selectedSubject}
                    stats={stats}
                    canMoveUp={reorderEnabled && selectedSubjectIndex > 0}
                    canMoveDown={
                      reorderEnabled &&
                      selectedSubjectIndex >= 0 &&
                      selectedSubjectIndex < currentSubjects.length - 1
                    }
                    onEdit={() => openSubjectEdit(selectedSubject)}
                    onMoveUp={() => moveSubject(selectedSubject.id, -1)}
                    onMoveDown={() => moveSubject(selectedSubject.id, 1)}
                    onArchive={archiveCurrentSubject}
                    onDelete={requestDeleteSubject}
                    onAddTopic={() => setTopicEditor({ id: null, title: "" })}
                    onExport={() => exportSubject(selectedSubject)}
                    addLesson={
                      <AddLessonModal
                        currentSubjects={currentSubjects}
                        onSubjectsUpdated={(subjects) =>
                          onSubjectsUpdated(subjects, { createBackup: true })
                        }
                        defaultSubjectName={selectedSubject.name}
                        trigger={
                          <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="h-4 w-4" /> Thêm bài học
                          </Button>
                        }
                      />
                    }
                  />
                ) : null
              }
              bulkActions={
                selectionMode && selectedSubject ? (
                  <BulkActionsBar
                    subjects={currentSubjects}
                    selectedSubject={selectedSubject}
                    selectedCount={selectedLessonIds.size}
                    targetSubjectId={bulkTargetSubjectId}
                    targetTopicId={bulkTargetTopicId}
                    date={bulkDate}
                    scheduleMode={bulkScheduleMode}
                    durationMinutes={bulkMinutes}
                    onTargetSubjectIdChange={setBulkTargetSubjectId}
                    onTargetTopicIdChange={setBulkTargetTopicId}
                    onDateChange={setBulkDate}
                    onScheduleModeChange={setBulkScheduleMode}
                    onDurationMinutesChange={setBulkMinutes}
                    onSelectVisible={() => setSelectedLessonIds(new Set(visibleLessonIds))}
                    onMoveToSubject={moveSelectedToSubject}
                    onMoveToTopic={moveSelectedToTopic}
                    onUpdateDate={updateSelectedDate}
                    onUpdateMode={updateSelectedMode}
                    onUpdateDuration={updateSelectedDuration}
                    onArchive={archiveSelected}
                    onDelete={deleteSelected}
                  />
                ) : undefined
              }
            >
              {selectedSubject ? (
                visibleMilestones.length ? (
                  visibleMilestones.map((topic, topicIndex) => (
                    <TopicSection
                      key={topic.id}
                      subjectId={selectedSubject.id}
                      topic={topic}
                      reorderEnabled={reorderEnabled}
                      dragOverLocation={lessonReorder.dragOverLocation}
                      canMoveTopicUp={topicIndex > 0}
                      canMoveTopicDown={topicIndex < visibleMilestones.length - 1}
                      onMoveTopic={(topicId, direction) =>
                        moveTopic(selectedSubject.id, topicId, direction)
                      }
                      onEditTopic={(topicId) => {
                        const current = selectedSubject.milestones.find(
                          (candidate) => candidate.id === topicId,
                        );
                        if (current) setTopicEditor({ id: current.id, title: current.title });
                      }}
                      onDeleteTopic={requestDeleteTopic}
                      onEnterDropTarget={lessonReorder.enterDropTarget}
                      onLeaveDropTarget={lessonReorder.leaveDropTarget}
                      onFinishDrop={lessonReorder.finishDrop}
                      renderLesson={(lesson, lessonIndex) => (
                        <LessonRow
                          lesson={lesson}
                          minutes={minutesByLesson.get(lesson.id) ?? 0}
                          selected={selectedLessonIds.has(lesson.id)}
                          selectionMode={selectionMode}
                          activeTimer={activeTimerLessonId === lesson.id}
                          reorderEnabled={reorderEnabled}
                          dragArmed={lessonReorder.dragArmedLessonId === lesson.id}
                          dragging={lessonReorder.draggedLessonId === lesson.id}
                          canMoveUp={lessonIndex > 0}
                          canMoveDown={lessonIndex < topic.lessons.length - 1}
                          onToggleSelected={toggleLessonSelection}
                          onEdit={openLessonEdit}
                          onDuplicate={duplicateLesson}
                          onArchive={archiveSingleLesson}
                          onDelete={requestDeleteLesson}
                          onMove={moveLessonByButton}
                          onArmDrag={lessonReorder.armDrag}
                          onStartDrag={lessonReorder.startDrag}
                          onSetDragImage={lessonReorder.setDragImage}
                          onDragEnd={lessonReorder.resetDrag}
                        />
                      )}
                    />
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">
                    Không tìm thấy bài học phù hợp.
                  </p>
                )
              ) : null}
            </SubjectWorkspace>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingSubject)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setEditingSubject(null);
        }}
      >
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa môn học</DialogTitle>
            <DialogDescription>Đổi tên hoặc biểu tượng của môn học.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên môn học</Label>
              <Input
                value={subjectDraft.name}
                onChange={(event) =>
                  setSubjectDraft((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>
            <div>
              <Label>Biểu tượng</Label>
              <Input
                value={subjectDraft.emoji}
                maxLength={4}
                onChange={(event) =>
                  setSubjectDraft((current) => ({ ...current, emoji: event.target.value }))
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingSubject(null)}>
                Hủy
              </Button>
              <Button type="button" onClick={saveSubject}>
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(topicEditor)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setTopicEditor(null);
        }}
      >
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>{topicEditor?.id ? "Đổi tên chủ đề" : "Thêm chủ đề"}</DialogTitle>
            <DialogDescription>
              Chủ đề giúp nhóm các bài học trong cùng một môn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên chủ đề</Label>
              <Input
                autoFocus
                value={topicEditor?.title ?? ""}
                onChange={(event) =>
                  setTopicEditor((current) =>
                    current ? { ...current, title: event.target.value } : current,
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") saveTopic();
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setTopicEditor(null)}>
                Hủy
              </Button>
              <Button type="button" onClick={saveTopic}>
                Lưu chủ đề
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LessonEditorDialog
        open={Boolean(editingLesson && draft)}
        subjects={currentSubjects}
        draft={draft}
        onDraftChange={setDraft}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeLessonEdit();
        }}
        onSubmit={saveLesson}
        submitting={saving}
      />

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setPendingDelete(null);
        }}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingDelete?.title}</AlertDialogTitle>
            <AlertDialogDescription>{pendingDelete?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                if (!pendingDelete) return;
                if (
                  applyCatalog(pendingDelete.nextSubjects, pendingDelete.successMessage, {
                    createBackup: true,
                  })
                ) {
                  clearSelection();
                  setMobileDetail(false);
                }
                setPendingDelete(null);
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}