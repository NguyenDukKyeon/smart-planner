import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, BookOpen, Search, Undo2 } from "lucide-react";
import { toast } from "sonner";
import type { Lesson, LessonScheduleMode, Subject } from "@/lib/mock-data";
import type { PlannerSettings } from "@/lib/planner";
import type { ProgressState } from "@/lib/progress-store";
import {
  archiveLessons,
  getLastCatalogStorageError,
  removeLessonsFromSubjects,
  updateLessonDetails,
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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { BulkActionsBar } from "./course-manager/BulkActionsBar";
import { LessonEditorDialog } from "./course-manager/LessonEditorDialog";
import { LessonRow } from "./course-manager/LessonRow";
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

function catalogUpdateSucceeded(result: CatalogUpdateResult | boolean | void): boolean {
  return result == null ? true : typeof result === "boolean" ? result : result.ok;
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
  const reorderEnabled =
    !subjectSearch.trim() && !lessonSearch.trim() && filter === "all" && sort === "roadmap";

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
      !confirmTimerImpact(selectedLessonIds, `chuyển ${selectedLessonIds.size} bài học sang môn khác`)
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
      !confirmTimerImpact(selectedLessonIds, `chuyển ${selectedLessonIds.size} bài học sang chủ đề khác`)
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
    if (next === currentSubjects) {
      const error = getLastCatalogStorageError();
      if (error) toast.error(error);
      return;
    }
    const result = onSubjectsUpdated(next, { alreadyPersisted: true });
    if (!catalogUpdateSucceeded(result)) return;
    toast.success(`Đã lưu trữ ${selectedLessonIds.size} bài học.`);
    clearSelection();
  };

  const deleteSelected = () => {
    if (!confirmTimerImpact(selectedLessonIds, `xóa ${selectedLessonIds.size} bài học`)) return;
    if (
      !window.confirm(
        `Xóa ${selectedLessonIds.size} bài học? Các bài sẽ bị xóa khỏi lộ trình và lịch tương lai. Lịch sử phiên học vẫn được giữ.`,
      )
    ) {
      return;
    }

    const next = removeLessonsFromSubjects(currentSubjects, selectedLessonIds);
    const result = onSubjectsUpdated(next, { createBackup: true });
    if (!catalogUpdateSucceeded(result)) return;
    toast.success(`Đã xóa ${selectedLessonIds.size} bài học.`);
    clearSelection();
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
      const result = onSubjectsUpdated(subjects, { createBackup: true });
      if (!catalogUpdateSucceeded(result)) return;
      toast.success("Đã cập nhật tên bài học.");
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

    if (result.status === "committed") toast.success("Đã cập nhật bài học và lịch học.");
    setEditingLesson(null);
    setDraft(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger ?? (
            <Button type="button" variant="outline" className="rounded-xl">
              <BookOpen className="h-4 w-4" /> Quản lý khóa học
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="flex h-[88vh] max-h-[920px] max-w-6xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b px-5 py-4">
            <DialogTitle>Quản lý khóa học</DialogTitle>
            <DialogDescription>
              Quản lý môn, chủ đề và bài học. Nhấn Ctrl+Z để hoàn tác thay đổi lịch.
            </DialogDescription>
          </DialogHeader>

          <div className="grid min-h-0 flex-1 md:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="flex min-h-0 flex-col border-b bg-slate-50/70 p-3 md:border-b-0 md:border-r">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={subjectSearch}
                  onChange={(event) => setSubjectSearch(event.target.value)}
                  placeholder="Tìm môn học"
                  className="pl-9"
                />
              </div>
              <div className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto">
                {visibleSubjects.map((subject) => {
                  const subjectStats = deriveSubjectStats(subject, minutesByLesson, progress);
                  const subjectIndex = currentSubjects.findIndex(
                    (candidate) => candidate.id === subject.id,
                  );
                  return (
                    <div
                      key={subject.id}
                      className={cn(
                        "flex items-center gap-1 rounded-xl p-1 transition",
                        selectedSubjectId === subject.id
                          ? "bg-indigo-600 text-white"
                          : "hover:bg-white",
                      )}
                    >
                      <button
                        type="button"
                        className="min-w-0 flex-1 px-2 py-1 text-left"
                        onClick={() => setSelectedSubjectId(subject.id)}
                      >
                        <span className="block truncate text-sm font-semibold">
                          {subject.emoji} {subject.name}
                        </span>
                        <span
                          className={cn(
                            "mt-1 block text-xs",
                            selectedSubjectId === subject.id ? "text-indigo-100" : "text-slate-500",
                          )}
                        >
                          {subjectStats.completed}/{subjectStats.lessons} bài
                        </span>
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={!reorderEnabled || subjectIndex <= 0}
                        aria-label={`Di chuyển môn lên: ${subject.name}`}
                        onClick={() => moveSubject(subject.id, -1)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={!reorderEnabled || subjectIndex >= currentSubjects.length - 1}
                        aria-label={`Di chuyển môn xuống: ${subject.name}`}
                        onClick={() => moveSubject(subject.id, 1)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </aside>

            <main data-course-scroll-container className="min-h-0 overflow-y-auto p-4 sm:p-5">
              {selectedSubject && stats ? (
                <div className="space-y-5">
                  <section className="rounded-2xl border bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-serif text-2xl font-semibold">
                          {selectedSubject.emoji} {selectedSubject.name}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {selectedSubject.milestones.length} chủ đề · {stats.lessons} bài ·{" "}
                          {stats.completed} đã hoàn thành
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Undo2 className="h-4 w-4" />
                        {scheduleTransactions.canUndo
                          ? "Ctrl+Z sẵn sàng"
                          : "Chưa có thay đổi lịch để hoàn tác"}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <Progress value={stats.percent} className="h-2 flex-1" />
                      <span className="text-xs font-bold text-indigo-700">{stats.percent}%</span>
                    </div>
                  </section>

                  <section className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
                    <Input
                      value={lessonSearch}
                      onChange={(event) => setLessonSearch(event.target.value)}
                      placeholder="Tìm bài học hoặc chủ đề"
                    />
                    <select
                      aria-label="Lọc bài học"
                      value={filter}
                      onChange={(event) => setFilter(event.target.value as LessonFilter)}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">Tất cả</option>
                      <option value="not-started">Chưa bắt đầu</option>
                      <option value="in-progress">Đang học</option>
                      <option value="completed">Đã hoàn thành</option>
                      <option value="unscheduled">Chưa xếp lịch</option>
                    </select>
                    <select
                      aria-label="Sắp xếp bài học"
                      value={sort}
                      onChange={(event) => setSort(event.target.value as LessonSort)}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="roadmap">Theo lộ trình</option>
                      <option value="date">Theo ngày</option>
                      <option value="progress">Theo tiến độ</option>
                      <option value="name">Theo tên</option>
                      <option value="remaining">Theo thời gian còn lại</option>
                    </select>
                    <Button
                      type="button"
                      variant={selectionMode ? "default" : "outline"}
                      className="rounded-xl"
                      onClick={() => {
                        if (selectionMode) clearSelection();
                        else setSelectionMode(true);
                      }}
                    >
                      {selectionMode ? "Hủy chọn" : "Chọn nhiều"}
                    </Button>
                  </section>

                  {selectionMode ? (
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
                  ) : null}

                  {!reorderEnabled ? (
                    <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      Xóa tìm kiếm và chọn “Tất cả / Theo lộ trình” để sắp xếp môn, chủ đề hoặc bài
                      học.
                    </p>
                  ) : null}

                  <div className="space-y-3">
                    {visibleMilestones.map((topic, topicIndex) => (
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
                            onMove={moveLessonByButton}
                            onArmDrag={lessonReorder.armDrag}
                            onStartDrag={lessonReorder.startDrag}
                            onSetDragImage={lessonReorder.setDragImage}
                            onDragEnd={lessonReorder.resetDrag}
                          />
                        )}
                      />
                    ))}
                    {visibleMilestones.length === 0 ? (
                      <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">
                        Không tìm thấy bài học phù hợp.
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="grid h-full place-items-center text-center text-sm text-slate-500">
                  Chưa có môn học để quản lý.
                </div>
              )}
            </main>
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
    </>
  );
}
