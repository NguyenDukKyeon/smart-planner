import { useEffect, useMemo, useState, type DragEvent, type ReactNode } from "react";
import {
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Download,
  Edit3,
  FolderArchive,
  GripVertical,
  LibraryBig,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Lesson, LessonScheduleMode, Subject } from "@/lib/mock-data";
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
  moveLessonBeforeInTopic,
  moveLessonToSubject,
  moveLessonsToSubject,
  moveLessonsToTopic,
  removeLessonFromSubjects,
  removeLessonsFromSubjects,
  removeSubjectFromSubjects,
  removeTopicAndMoveLessonsToUncategorized,
  reorderLesson,
  reorderSubject,
  reorderTopic,
  restoreArchivedLesson,
  restoreArchivedSubject,
  renameTopicInSubjects,
  restoreCatalogBackup,
  updateLessonDetails,
  updateLessonsDetails,
  updateSubjectDetails,
  type CatalogUpdateOptions,
  type CatalogUpdateResult,
} from "@/lib/custom-subjects";
import { AddLessonModal } from "./AddLessonModal";
import { cn } from "@/lib/utils";

type Props = {
  currentSubjects: Subject[];
  onSubjectsUpdated: (
    subjects: Subject[],
    options?: CatalogUpdateOptions,
  ) => CatalogUpdateResult | boolean | void;
  progress?: ProgressState;
  activeTimerLessonId?: string | null;
  trigger?: ReactNode;
};

type LessonFilter = "all" | "not-started" | "in-progress" | "completed" | "unscheduled";
type LessonSort = "roadmap" | "date" | "progress" | "name" | "remaining";

type SubjectStats = {
  lessons: number;
  completed: number;
  remaining: number;
  percent: number;
};

type PendingDelete = {
  title: string;
  description: string;
  nextSubjects: Subject[];
  successMessage: string;
};

function allLessons(subject: Subject): Lesson[] {
  return subject.milestones.flatMap((milestone) => milestone.lessons);
}

function autoScrollDuringLessonDrag(event: DragEvent<HTMLElement>) {
  const container = event.currentTarget.closest<HTMLElement>("[data-course-scroll-container]");
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

export function CourseManagerModal({
  currentSubjects,
  onSubjectsUpdated,
  progress,
  activeTimerLessonId,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(currentSubjects[0]?.id ?? "");
  const [mobileDetail, setMobileDetail] = useState(false);
  const [search, setSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [filter, setFilter] = useState<LessonFilter>("all");
  const [sort, setSort] = useState<LessonSort>("roadmap");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedLessonIds, setSelectedLessonIds] = useState<Set<string>>(() => new Set());
  const [bulkTargetSubjectId, setBulkTargetSubjectId] = useState("");
  const [bulkTargetTopicId, setBulkTargetTopicId] = useState("");
  const [bulkDate, setBulkDate] = useState("");
  const [bulkScheduleMode, setBulkScheduleMode] = useState<LessonScheduleMode>("flexible");
  const [bulkMinutes, setBulkMinutes] = useState(120);
  const [archiveView, setArchiveView] = useState(false);
  const [archiveVersion, setArchiveVersion] = useState(0);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectEmoji, setNewSubjectEmoji] = useState("📖");
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [topicEditor, setTopicEditor] = useState<{ id: string | null; title: string } | null>(null);
  const [subjectDraft, setSubjectDraft] = useState({ name: "", emoji: "📖" });
  const [lessonDraft, setLessonDraft] = useState({
    title: "",
    subjectId: "",
    topicId: "",
    minutes: 120,
    date: "",
    scheduleMode: "flexible" as LessonScheduleMode,
  });
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
  const [dragArmedLessonId, setDragArmedLessonId] = useState<string | null>(null);

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
    setDragArmedLessonId(null);
  }, [selectedSubjectId]);

  useEffect(() => {
    if (!dragArmedLessonId || draggedLessonId) return;
    const timeout = window.setTimeout(() => setDragArmedLessonId(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [dragArmedLessonId, draggedLessonId]);

  const minutesByLesson = useMemo(() => {
    const map = new Map<string, number>();
    for (const session of progress?.studySessions ?? []) {
      map.set(
        session.lessonId,
        (map.get(session.lessonId) ?? 0) + Math.round(session.durationSeconds / 60),
      );
    }
    return map;
  }, [progress?.studySessions]);

  const selectedSubject =
    currentSubjects.find((subject) => subject.id === selectedSubjectId) ?? null;
  const visibleSubjects = useMemo(() => {
    const keyword = subjectSearch.trim().toLocaleLowerCase("vi");
    return keyword
      ? currentSubjects.filter((subject) => subject.name.toLocaleLowerCase("vi").includes(keyword))
      : currentSubjects;
  }, [currentSubjects, subjectSearch]);
  const archived = useMemo(() => getArchivedCatalog(), [archiveVersion, open]);

  const apply = (
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
    const ok = result == null ? true : typeof result === "boolean" ? result : result.ok;
    if (!ok) return false;
    if (message) toast.success(message);
    return true;
  };

  const applyWithUndo = (subjects: Subject[], message: string): boolean => {
    const previous = currentSubjects;
    if (!apply(subjects, undefined, { createBackup: true })) return false;
    toast.success(message, {
      action: {
        label: "Hoàn tác",
        onClick: () => {
          apply(previous, "Đã hoàn tác thay đổi danh mục.");
        },
      },
    });
    return true;
  };

  const confirmTimerImpact = (lessonIds: Iterable<string>, action: string) => {
    if (!activeTimerLessonId || !new Set(lessonIds).has(activeTimerLessonId)) return true;
    return window.confirm(
      `Bài học này đang có một phiên Timer. Nhấn OK để ${action} nhưng vẫn tiếp tục phiên hiện tại; nhấn Hủy để quay lại và dừng Timer trước.`,
    );
  };

  const createSubject = () => {
    const name = newSubjectName.trim();
    if (!name) return toast.error("Vui lòng nhập tên môn học.");
    if (
      currentSubjects.some(
        (subject) => subject.name.localeCompare(name, "vi", { sensitivity: "base" }) === 0,
      )
    ) {
      return toast.error("Môn học này đã tồn tại.");
    }
    const next = addSubjectToSubjects(currentSubjects, name, newSubjectEmoji.trim() || "📖");
    if (!apply(next, `Đã tạo môn ${name}.`)) return;
    const created = next.find((subject) => subject.name === name);
    if (created) setSelectedSubjectId(created.id);
    setNewSubjectName("");
    setNewSubjectEmoji("📖");
  };

  const filteredMilestones = useMemo(() => {
    if (!selectedSubject) return [];
    const keyword = search.trim().toLocaleLowerCase("vi");
    return selectedSubject.milestones
      .map((milestone) => ({
        ...milestone,
        lessons: milestone.lessons
          .filter((lesson) => {
            const minutes = minutesByLesson.get(lesson.id) ?? 0;
            const completed =
              Boolean(progress?.completedLessons[lesson.id]) ||
              minutes >= lesson.plannedDurationMinutes;
            const matchesSearch =
              !keyword ||
              lesson.title.toLocaleLowerCase("vi").includes(keyword) ||
              (lesson.topic ?? milestone.title).toLocaleLowerCase("vi").includes(keyword);
            if (!matchesSearch) return false;
            if (filter === "completed") return completed;
            if (filter === "not-started") return minutes === 0 && !completed;
            if (filter === "in-progress") return minutes > 0 && !completed;
            if (filter === "unscheduled") return !lesson.scheduledDate;
            return true;
          })
          .sort((a, b) => {
            if (sort === "date")
              return (a.scheduledDate || "9999-12-31").localeCompare(
                b.scheduledDate || "9999-12-31",
              );
            if (sort === "name") return a.title.localeCompare(b.title, "vi");
            const aMinutes = minutesByLesson.get(a.id) ?? 0;
            const bMinutes = minutesByLesson.get(b.id) ?? 0;
            if (sort === "progress") {
              const aPercent = aMinutes / Math.max(1, a.plannedDurationMinutes);
              const bPercent = bMinutes / Math.max(1, b.plannedDurationMinutes);
              return bPercent - aPercent;
            }
            if (sort === "remaining") {
              return (
                Math.max(0, a.plannedDurationMinutes - aMinutes) -
                Math.max(0, b.plannedDurationMinutes - bMinutes)
              );
            }
            return 0;
          }),
      }))
      .filter((milestone) => milestone.lessons.length > 0 || (!keyword && filter === "all"));
  }, [filter, minutesByLesson, progress?.completedLessons, search, selectedSubject, sort]);

  const openSubjectEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectDraft({ name: subject.name, emoji: subject.emoji });
  };

  const saveSubject = () => {
    if (!editingSubject) return;
    const name = subjectDraft.name.trim();
    if (!name) return toast.error("Tên môn học không được để trống.");
    if (
      apply(
        updateSubjectDetails(currentSubjects, editingSubject.id, {
          name,
          emoji: subjectDraft.emoji.trim() || editingSubject.emoji,
        }),
        `Đã cập nhật môn ${name}.`,
      )
    ) {
      setEditingSubject(null);
    }
  };

  const openLessonEdit = (lesson: Lesson) => {
    const ownerSubject = currentSubjects.find((subject) =>
      subject.milestones.some((milestone) =>
        milestone.lessons.some((candidate) => candidate.id === lesson.id),
      ),
    );
    const ownerTopic = ownerSubject?.milestones.find((milestone) =>
      milestone.lessons.some((candidate) => candidate.id === lesson.id),
    );
    setEditingLesson(lesson);
    setLessonDraft({
      title: lesson.title,
      subjectId: ownerSubject?.id ?? selectedSubjectId,
      topicId: ownerTopic?.id ?? ownerSubject?.milestones[0]?.id ?? "",
      minutes: lesson.plannedDurationMinutes,
      date: lesson.scheduledDate,
      scheduleMode: lesson.scheduleMode ?? "flexible",
    });
  };

  const editingTargetSubject =
    currentSubjects.find((subject) => subject.id === lessonDraft.subjectId) ?? null;

  const saveLesson = () => {
    if (!editingLesson) return;
    const title = lessonDraft.title.trim();
    if (!title) return toast.error("Tên bài học không được để trống.");
    if (!Number.isFinite(lessonDraft.minutes) || lessonDraft.minutes <= 0) {
      return toast.error("Thời lượng mục tiêu phải lớn hơn 0.");
    }
    if (lessonDraft.scheduleMode === "fixed" && !lessonDraft.date) {
      return toast.error("Bài cố định cần có ngày học cụ thể.");
    }

    const targetSubject = currentSubjects.find((subject) => subject.id === lessonDraft.subjectId);
    if (!targetSubject) return toast.error("Vui lòng chọn môn học đích.");
    const targetTopic = targetSubject.milestones.find(
      (milestone) => milestone.id === lessonDraft.topicId,
    );
    if (!targetTopic) return toast.error("Vui lòng chọn chủ đề đích.");

    const currentOwner = currentSubjects.find((subject) =>
      subject.milestones.some((milestone) =>
        milestone.lessons.some((candidate) => candidate.id === editingLesson.id),
      ),
    );

    let next = updateLessonDetails(currentSubjects, editingLesson.id, {
      title,
      plannedDurationMinutes: lessonDraft.minutes,
      scheduledDate: lessonDraft.date,
      scheduleMode: lessonDraft.scheduleMode,
    });
    if (currentOwner?.id !== targetSubject.id) {
      next = moveLessonToSubject(next, editingLesson.id, targetSubject.id);
    }
    next = moveLessonsToTopic(next, [editingLesson.id], targetSubject.id, targetTopic.id);

    if (apply(next, `Đã cập nhật bài “${title}”.`)) {
      setEditingLesson(null);
    }
  };

  const subjectStats = (subject: Subject) => {
    const lessons = allLessons(subject);
    const completed = lessons.filter((lesson) => {
      const minutes = minutesByLesson.get(lesson.id) ?? 0;
      return (
        Boolean(progress?.completedLessons[lesson.id]) || minutes >= lesson.plannedDurationMinutes
      );
    }).length;
    const remaining = lessons.reduce(
      (sum, lesson) =>
        sum + Math.max(0, lesson.plannedDurationMinutes - (minutesByLesson.get(lesson.id) ?? 0)),
      0,
    );
    return {
      lessons: lessons.length,
      completed,
      remaining,
      percent: lessons.length ? Math.round((completed / lessons.length) * 100) : 0,
    };
  };

  const saveTopic = () => {
    if (!selectedSubject || !topicEditor) return;
    const title = topicEditor.title.trim();
    if (!title) return toast.error("Tên chủ đề không được để trống.");
    const hasDuplicate = selectedSubject.milestones.some(
      (milestone) =>
        milestone.id !== topicEditor.id &&
        milestone.title.localeCompare(title, "vi", { sensitivity: "base" }) === 0,
    );
    if (hasDuplicate) return toast.error("Chủ đề này đã tồn tại trong môn học.");
    const next = topicEditor.id
      ? renameTopicInSubjects(currentSubjects, selectedSubject.id, topicEditor.id, title)
      : addTopicToSubject(currentSubjects, selectedSubject.id, title);
    if (
      apply(next, topicEditor.id ? `Đã đổi tên chủ đề thành ${title}.` : `Đã thêm chủ đề ${title}.`)
    ) {
      setTopicEditor(null);
    }
  };

  const toggleLessonSelection = (lessonId: string) => {
    setSelectedLessonIds((current) => {
      const next = new Set(current);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedLessonIds(new Set());
    setSelectionMode(false);
  };

  const applyBulk = (next: Subject[], message: string, archiveChanged = false) => {
    const succeeded = archiveChanged
      ? apply(next, message, { alreadyPersisted: true })
      : apply(next, message);
    if (!succeeded) return;
    clearSelection();
    if (archiveChanged) setArchiveVersion((version) => version + 1);
  };

  const exportSubject = (subject: Subject) => {
    const rows = subject.milestones.flatMap((milestone) =>
      milestone.lessons.map((lesson) => ({
        subject_id: subject.id,
        subject_name: subject.name,
        topic: lesson.topic || milestone.title,
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

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger ?? (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-2xl border-indigo-200 bg-indigo-50/70 text-xs font-semibold text-indigo-800"
            >
              <LibraryBig className="h-4 w-4" />
              <span className="hidden sm:inline">Môn & bài học</span>
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="h-[94vh] w-[97vw] max-w-6xl overflow-hidden rounded-3xl p-0 grid-rows-[auto_minmax(0,1fr)]">
          <DialogHeader className="border-b bg-white px-5 py-4">
            <DialogTitle className="flex items-center gap-2 font-serif text-xl">
              <LibraryBig className="h-5 w-5 text-indigo-700" /> Quản lý môn & bài học
            </DialogTitle>
            <DialogDescription>
              Tổ chức môn học, chủ đề và các bài trong lộ trình của bạn.
            </DialogDescription>
          </DialogHeader>

          <div className="grid min-h-0 flex-1 md:grid-cols-[280px_1fr]">
            <aside
              className={cn(
                "min-h-0 overflow-y-auto border-r bg-slate-50/80 p-3",
                mobileDetail && "hidden md:block",
              )}
            >
              <div className="rounded-2xl border bg-white p-3">
                <div className="grid grid-cols-[64px_1fr] gap-2">
                  <Input
                    value={newSubjectEmoji}
                    maxLength={4}
                    onChange={(event) => setNewSubjectEmoji(event.target.value)}
                    className="text-center text-lg"
                    aria-label="Biểu tượng môn mới"
                  />
                  <Input
                    value={newSubjectName}
                    onChange={(event) => setNewSubjectName(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && createSubject()}
                    placeholder="Tên môn học mới"
                  />
                </div>
                <Button
                  type="button"
                  className="mt-2 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700"
                  onClick={createSubject}
                >
                  <Plus className="h-4 w-4" /> Thêm môn học
                </Button>
              </div>

              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={subjectSearch}
                  onChange={(event) => setSubjectSearch(event.target.value)}
                  placeholder="Tìm môn học…"
                  className="rounded-xl bg-white pl-9"
                />
              </div>

              <Tabs
                value={archiveView ? "archived" : "active"}
                onValueChange={(value) => setArchiveView(value === "archived")}
                className="mt-3"
              >
                <TabsList className="grid w-full grid-cols-2 rounded-xl">
                  <TabsTrigger value="active" className="rounded-lg text-xs">
                    Đang học
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="rounded-lg text-xs">
                    Đã lưu trữ
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {!archiveView ? (
                <div className="mt-3 space-y-2">
                  {visibleSubjects.map((subject) => {
                    const stats = subjectStats(subject);
                    return (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubjectId(subject.id);
                          setMobileDetail(true);
                        }}
                        className={cn(
                          "w-full rounded-2xl border p-3 text-left transition",
                          selectedSubjectId === subject.id
                            ? "border-indigo-300 bg-indigo-50"
                            : "border-slate-200 bg-white hover:bg-slate-50",
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xl">{subject.emoji}</span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {subject.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {stats.completed} / {stats.lessons} bài ·{" "}
                              {formatMinutes(stats.remaining)} còn lại
                            </p>
                            <Progress value={stats.percent} className="mt-2 h-1.5" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {currentSubjects.length === 0 ? (
                    <EmptyState
                      title="Bạn chưa có môn học nào"
                      description="Tạo môn đầu tiên hoặc sử dụng lộ trình mẫu lớp 11."
                    />
                  ) : visibleSubjects.length === 0 ? (
                    <EmptyState
                      title="Không tìm thấy môn học"
                      description="Hãy thử từ khóa khác."
                    />
                  ) : null}
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  {archived.subjects.map((subject) => (
                    <ArchivedItem
                      key={subject.id}
                      label={`${subject.emoji} ${subject.name}`}
                      onRestore={() => {
                        if (
                          apply(
                            restoreArchivedSubject(currentSubjects, subject.id),
                            `Đã khôi phục môn ${subject.name}.`,
                            { alreadyPersisted: true },
                          )
                        ) {
                          setArchiveVersion((version) => version + 1);
                        }
                      }}
                    />
                  ))}
                  {archived.lessons.map((item) => (
                    <ArchivedItem
                      key={item.lesson.id}
                      label={`${item.lesson.title} · ${item.subjectName}`}
                      onRestore={() => {
                        if (
                          apply(
                            restoreArchivedLesson(currentSubjects, item.lesson.id),
                            `Đã khôi phục bài ${item.lesson.title}.`,
                            { alreadyPersisted: true },
                          )
                        ) {
                          setArchiveVersion((version) => version + 1);
                        }
                      }}
                    />
                  ))}
                  {archived.subjects.length === 0 && archived.lessons.length === 0 && (
                    <EmptyState
                      title="Kho lưu trữ đang trống"
                      description="Môn và bài được lưu trữ sẽ xuất hiện tại đây."
                    />
                  )}
                </div>
              )}

              <Button
                type="button"
                variant="ghost"
                className="mt-3 w-full rounded-xl text-xs"
                onClick={() => {
                  const restored = restoreCatalogBackup();
                  if (restored)
                    apply(restored, "Đã hoàn tác thay đổi danh mục gần nhất.", {
                      alreadyPersisted: true,
                    });
                  else toast.info("Chưa có thay đổi để hoàn tác.");
                }}
              >
                <Undo2 className="h-4 w-4" /> Hoàn tác gần nhất
              </Button>
            </aside>

            <main
              className={cn(
                "min-h-0 overflow-y-auto bg-white p-4 sm:p-5",
                !mobileDetail && "hidden md:block",
              )}
            >
              {selectedSubject ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mb-3 rounded-xl md:hidden"
                    onClick={() => setMobileDetail(false)}
                  >
                    <ArrowLeft className="h-4 w-4" /> Danh sách môn
                  </Button>
                  <SubjectHeader
                    subject={selectedSubject}
                    stats={subjectStats(selectedSubject)}
                    onEdit={() => openSubjectEdit(selectedSubject)}
                    canMoveUp={
                      currentSubjects.findIndex((subject) => subject.id === selectedSubject.id) > 0
                    }
                    canMoveDown={
                      currentSubjects.findIndex((subject) => subject.id === selectedSubject.id) <
                      currentSubjects.length - 1
                    }
                    onMoveUp={() =>
                      apply(
                        reorderSubject(currentSubjects, selectedSubject.id, -1),
                        `Đã di chuyển môn ${selectedSubject.name} lên.`,
                      )
                    }
                    onMoveDown={() =>
                      apply(
                        reorderSubject(currentSubjects, selectedSubject.id, 1),
                        `Đã di chuyển môn ${selectedSubject.name} xuống.`,
                      )
                    }
                    onArchive={() => {
                      if (
                        !window.confirm(
                          `Lưu trữ môn “${selectedSubject.name}”? Lịch sử học vẫn được giữ.`,
                        )
                      )
                        return;
                      if (
                        apply(
                          archiveSubject(currentSubjects, selectedSubject.id),
                          `Đã lưu trữ môn ${selectedSubject.name}.`,
                          { alreadyPersisted: true },
                        )
                      ) {
                        setArchiveVersion((version) => version + 1);
                      }
                    }}
                    onDelete={() => {
                      const lessons = allLessons(selectedSubject);
                      if (
                        !confirmTimerImpact(
                          lessons.map((lesson) => lesson.id),
                          `xóa môn ${selectedSubject.name}`,
                        )
                      )
                        return;
                      setPendingDelete({
                        title: `Xóa môn “${selectedSubject.name}”?`,
                        description: `${lessons.length} bài sẽ bị xóa khỏi lộ trình và lịch tương lai. Lịch sử các phiên học đã diễn ra vẫn được giữ.`,
                        nextSubjects: removeSubjectFromSubjects(
                          currentSubjects,
                          selectedSubject.id,
                        ),
                        successMessage: `Đã xóa môn ${selectedSubject.name}.`,
                      });
                    }}
                    onAddTopic={() => setTopicEditor({ id: null, title: "" })}
                    onExport={() => exportSubject(selectedSubject)}
                    addLesson={
                      <AddLessonModal
                        currentSubjects={currentSubjects}
                        onSubjectsUpdated={onSubjectsUpdated}
                        defaultSubjectName={selectedSubject.name}
                        trigger={
                          <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="h-4 w-4" /> Thêm bài học
                          </Button>
                        }
                      />
                    }
                  />

                  <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_170px_170px_auto]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Tìm tên bài hoặc chủ đề…"
                        className="rounded-xl pl-9"
                      />
                    </div>
                    <select
                      value={filter}
                      onChange={(event) => setFilter(event.target.value as LessonFilter)}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    >
                      <option value="all">Tất cả bài</option>
                      <option value="not-started">Chưa bắt đầu</option>
                      <option value="in-progress">Đang học</option>
                      <option value="completed">Đã hoàn thành</option>
                      <option value="unscheduled">Chưa lên lịch</option>
                    </select>
                    <select
                      value={sort}
                      onChange={(event) => setSort(event.target.value as LessonSort)}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    >
                      <option value="roadmap">Thứ tự lộ trình</option>
                      <option value="date">Ngày dự kiến</option>
                      <option value="progress">Tiến độ</option>
                      <option value="name">Tên bài</option>
                      <option value="remaining">Thời lượng còn lại</option>
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
                  </div>

                  {(sort !== "roadmap" || filter !== "all" || search.trim()) && (
                    <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      Đổi về “Thứ tự lộ trình”, bỏ bộ lọc và tìm kiếm để kéo-thả hoặc di chuyển bài.
                    </p>
                  )}

                  {selectionMode && (
                    <section className="mt-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-indigo-950">
                          Đã chọn {selectedLessonIds.size} bài học
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => {
                            const ids = filteredMilestones.flatMap((milestone) =>
                              milestone.lessons.map((lesson) => lesson.id),
                            );
                            setSelectedLessonIds(new Set(ids));
                          }}
                        >
                          Chọn tất cả đang hiển thị
                        </Button>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                        <div className="flex gap-2">
                          <select
                            value={bulkTargetSubjectId}
                            onChange={(event) => setBulkTargetSubjectId(event.target.value)}
                            className="h-9 min-w-0 flex-1 rounded-xl border border-indigo-200 bg-white px-2 text-xs"
                          >
                            <option value="">Chuyển sang môn…</option>
                            {currentSubjects
                              .filter((subject) => subject.id !== selectedSubject.id)
                              .map((subject) => (
                                <option key={subject.id} value={subject.id}>
                                  {subject.name}
                                </option>
                              ))}
                          </select>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            disabled={!bulkTargetSubjectId || selectedLessonIds.size === 0}
                            onClick={() =>
                              applyBulk(
                                moveLessonsToSubject(
                                  currentSubjects,
                                  selectedLessonIds,
                                  bulkTargetSubjectId,
                                ),
                                `Đã chuyển ${selectedLessonIds.size} bài học.`,
                              )
                            }
                            aria-label="Chuyển các bài đã chọn"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={bulkTargetTopicId}
                            onChange={(event) => setBulkTargetTopicId(event.target.value)}
                            className="h-9 min-w-0 flex-1 rounded-xl border border-indigo-200 bg-white px-2 text-xs"
                          >
                            <option value="">Chuyển sang chủ đề…</option>
                            {selectedSubject.milestones.map((milestone) => (
                              <option key={milestone.id} value={milestone.id}>
                                {milestone.title}
                              </option>
                            ))}
                          </select>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            disabled={!bulkTargetTopicId || selectedLessonIds.size === 0}
                            onClick={() =>
                              applyBulk(
                                moveLessonsToTopic(
                                  currentSubjects,
                                  selectedLessonIds,
                                  selectedSubject.id,
                                  bulkTargetTopicId,
                                ),
                                `Đã chuyển ${selectedLessonIds.size} bài sang chủ đề mới.`,
                              )
                            }
                            aria-label="Chuyển các bài sang chủ đề"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="date"
                            value={bulkDate}
                            onChange={(event) => setBulkDate(event.target.value)}
                            className="h-9 min-w-0 flex-1 rounded-xl bg-white text-xs"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            disabled={selectedLessonIds.size === 0}
                            onClick={() =>
                              applyBulk(
                                updateLessonsDetails(currentSubjects, selectedLessonIds, {
                                  scheduledDate: bulkDate,
                                }),
                                `Đã cập nhật ngày cho ${selectedLessonIds.size} bài.`,
                              )
                            }
                            aria-label="Cập nhật ngày dự kiến"
                          >
                            <CalendarDays className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={bulkScheduleMode}
                            onChange={(event) =>
                              setBulkScheduleMode(event.target.value as LessonScheduleMode)
                            }
                            className="h-9 min-w-0 flex-1 rounded-xl border border-indigo-200 bg-white px-2 text-xs"
                          >
                            <option value="flexible">Linh hoạt</option>
                            <option value="fixed">Cố định</option>
                          </select>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            disabled={selectedLessonIds.size === 0}
                            onClick={() =>
                              applyBulk(
                                updateLessonsDetails(currentSubjects, selectedLessonIds, {
                                  scheduleMode: bulkScheduleMode,
                                }),
                                `Đã đổi cách xếp lịch cho ${selectedLessonIds.size} bài.`,
                              )
                            }
                            aria-label="Cập nhật cách xếp lịch"
                          >
                            <CalendarDays className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={bulkMinutes}
                            onChange={(event) => setBulkMinutes(Number(event.target.value))}
                            className="h-9 min-w-0 flex-1 rounded-xl border border-indigo-200 bg-white px-2 text-xs"
                          >
                            {[30, 60, 90, 120].map((minutes) => (
                              <option key={minutes} value={minutes}>
                                {minutes} phút
                              </option>
                            ))}
                          </select>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            disabled={selectedLessonIds.size === 0}
                            onClick={() =>
                              applyBulk(
                                updateLessonsDetails(currentSubjects, selectedLessonIds, {
                                  plannedDurationMinutes: bulkMinutes,
                                }),
                                `Đã đặt mục tiêu ${bulkMinutes} phút cho ${selectedLessonIds.size} bài.`,
                              )
                            }
                          >
                            Áp dụng
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-xl"
                            disabled={selectedLessonIds.size === 0}
                            onClick={() => {
                              if (
                                confirmTimerImpact(
                                  selectedLessonIds,
                                  `lưu trữ ${selectedLessonIds.size} bài học`,
                                ) &&
                                window.confirm(
                                  `Lưu trữ ${selectedLessonIds.size} bài học? Lịch sử phiên học vẫn được giữ.`,
                                )
                              )
                                applyBulk(
                                  archiveLessons(currentSubjects, selectedLessonIds),
                                  `Đã lưu trữ ${selectedLessonIds.size} bài học.`,
                                  true,
                                );
                            }}
                          >
                            <Archive className="h-4 w-4" /> Lưu trữ
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-xl text-red-700"
                            disabled={selectedLessonIds.size === 0}
                            onClick={() => {
                              if (
                                !confirmTimerImpact(
                                  selectedLessonIds,
                                  `xóa ${selectedLessonIds.size} bài học`,
                                )
                              )
                                return;
                              setPendingDelete({
                                title: `Xóa ${selectedLessonIds.size} bài học?`,
                                description:
                                  "Các bài sẽ bị xóa khỏi lộ trình và lịch tương lai. Lịch sử phiên học vẫn được giữ.",
                                nextSubjects: removeLessonsFromSubjects(
                                  currentSubjects,
                                  selectedLessonIds,
                                ),
                                successMessage: `Đã xóa ${selectedLessonIds.size} bài học.`,
                              });
                            }}
                            aria-label="Xóa các bài đã chọn"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </section>
                  )}

                  <div className="mt-4 space-y-3">
                    {filteredMilestones.map((milestone) => (
                      <TopicGroup
                        key={milestone.id}
                        topicId={milestone.id}
                        title={milestone.title}
                        lessons={milestone.lessons}
                        subject={selectedSubject}
                        subjects={currentSubjects}
                        progress={progress}
                        minutesByLesson={minutesByLesson}
                        onEdit={openLessonEdit}
                        selectionMode={selectionMode}
                        selectedLessonIds={selectedLessonIds}
                        onToggleSelection={toggleLessonSelection}
                        onEditTopic={() =>
                          setTopicEditor({ id: milestone.id, title: milestone.title })
                        }
                        canMoveTopicUp={
                          selectedSubject.milestones.findIndex((item) => item.id === milestone.id) >
                          0
                        }
                        canMoveTopicDown={
                          selectedSubject.milestones.findIndex((item) => item.id === milestone.id) <
                          selectedSubject.milestones.length - 1
                        }
                        onMoveTopicUp={() =>
                          apply(
                            reorderTopic(currentSubjects, selectedSubject.id, milestone.id, -1),
                            `Đã di chuyển chủ đề ${milestone.title} lên.`,
                          )
                        }
                        onMoveTopicDown={() =>
                          apply(
                            reorderTopic(currentSubjects, selectedSubject.id, milestone.id, 1),
                            `Đã di chuyển chủ đề ${milestone.title} xuống.`,
                          )
                        }
                        onDeleteTopic={() => {
                          setPendingDelete({
                            title: `Xóa chủ đề “${milestone.title}”?`,
                            description: milestone.lessons.length
                              ? `${milestone.lessons.length} bài sẽ được chuyển sang “Chưa phân loại”; không có lịch sử học nào bị xóa.`
                              : "Chủ đề trống sẽ bị xóa khỏi môn học.",
                            nextSubjects: removeTopicAndMoveLessonsToUncategorized(
                              currentSubjects,
                              selectedSubject.id,
                              milestone.id,
                            ),
                            successMessage: `Đã xóa chủ đề ${milestone.title}.`,
                          });
                        }}
                        onApply={apply}
                        onArchiveChanged={() => setArchiveVersion((version) => version + 1)}
                        confirmTimerImpact={confirmTimerImpact}
                        canReorder={
                          sort === "roadmap" && filter === "all" && search.trim().length === 0
                        }
                        draggedLessonId={draggedLessonId}
                        onDraggedLessonChange={setDraggedLessonId}
                        dragArmedLessonId={dragArmedLessonId}
                        onDragArmedLessonChange={setDragArmedLessonId}
                        onRequestDelete={(lesson) => {
                          if (!confirmTimerImpact([lesson.id], `xóa bài ${lesson.title}`)) return;
                          setPendingDelete({
                            title: `Xóa “${lesson.title}”?`,
                            description:
                              "Bài sẽ bị xóa khỏi lộ trình và lịch tương lai. Lịch sử phiên học đã diễn ra vẫn được giữ.",
                            nextSubjects: removeLessonFromSubjects(currentSubjects, lesson.id),
                            successMessage: `Đã xóa bài ${lesson.title}.`,
                          });
                        }}
                      />
                    ))}
                    {filteredMilestones.length === 0 && (
                      <EmptyState
                        title="Không tìm thấy bài học phù hợp"
                        description="Hãy thử từ khóa hoặc bộ lọc khác."
                      />
                    )}
                  </div>
                </>
              ) : (
                <EmptyState
                  title="Chọn một môn học"
                  description="Chọn môn ở cột bên trái để xem và tổ chức các bài học."
                />
              )}
            </main>
          </div>
        </DialogContent>

        <Dialog open={Boolean(topicEditor)} onOpenChange={(next) => !next && setTopicEditor(null)}>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle>{topicEditor?.id ? "Đổi tên chủ đề" : "Thêm chủ đề"}</DialogTitle>
              <DialogDescription>
                Bài học có thể được thêm vào chủ đề này ngay hoặc sau đó.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tên chủ đề hoặc chương</Label>
                <Input
                  value={topicEditor?.title ?? ""}
                  onChange={(event) =>
                    setTopicEditor((current) =>
                      current ? { ...current, title: event.target.value } : current,
                    )
                  }
                  onKeyDown={(event) => event.key === "Enter" && saveTopic()}
                  placeholder="VD: Chương 2: Dãy số"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setTopicEditor(null)}>
                  Hủy
                </Button>
                <Button onClick={saveTopic}>
                  {topicEditor?.id ? "Lưu thay đổi" : "Thêm chủ đề"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(editingSubject)}
          onOpenChange={(next) => !next && setEditingSubject(null)}
        >
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa môn học</DialogTitle>
              <DialogDescription>Cập nhật tên và biểu tượng môn.</DialogDescription>
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
                <Button variant="outline" onClick={() => setEditingSubject(null)}>
                  Hủy
                </Button>
                <Button onClick={saveSubject}>Lưu thay đổi</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(editingLesson)}
          onOpenChange={(next) => !next && setEditingLesson(null)}
        >
          <DialogContent className="max-w-xl rounded-3xl">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa bài học</DialogTitle>
              <DialogDescription>
                Đổi chủ đề, ngày dự kiến và tổng thời lượng mục tiêu của bài.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Tên bài học</Label>
                <Input
                  value={lessonDraft.title}
                  onChange={(event) =>
                    setLessonDraft((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </div>

              <div>
                <Label>Môn học</Label>
                <select
                  aria-label="Chọn môn học đích"
                  value={lessonDraft.subjectId}
                  onChange={(event) => {
                    const targetSubject = currentSubjects.find(
                      (subject) => subject.id === event.target.value,
                    );
                    setLessonDraft((current) => ({
                      ...current,
                      subjectId: event.target.value,
                      topicId: targetSubject?.milestones[0]?.id ?? "",
                    }));
                  }}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                >
                  {currentSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.emoji} {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Chủ đề / chương</Label>
                <select
                  aria-label="Chọn chủ đề đích"
                  value={lessonDraft.topicId}
                  onChange={(event) =>
                    setLessonDraft((current) => ({ ...current, topicId: event.target.value }))
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                >
                  {editingTargetSubject?.milestones.map((milestone) => (
                    <option key={milestone.id} value={milestone.id}>
                      {milestone.title} ({milestone.lessons.length} bài)
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <Label>Thời lượng học mục tiêu</Label>
                <div className="mt-1 grid grid-cols-5 gap-2">
                  {[30, 45, 60, 90, 120].map((minutes) => (
                    <Button
                      key={minutes}
                      type="button"
                      size="sm"
                      variant={lessonDraft.minutes === minutes ? "default" : "outline"}
                      className="rounded-xl"
                      onClick={() => setLessonDraft((current) => ({ ...current, minutes }))}
                    >
                      {minutes}p
                    </Button>
                  ))}
                </div>
                <Input
                  className="mt-2"
                  type="number"
                  min={1}
                  max={1440}
                  value={lessonDraft.minutes}
                  onChange={(event) =>
                    setLessonDraft((current) => ({
                      ...current,
                      minutes: Number(event.target.value),
                    }))
                  }
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Đây là tổng thời lượng của bài; các phiên Pomodoro sẽ cộng dồn vào mục tiêu này.
                </p>
              </div>

              <div className="sm:col-span-2">
                <Label>Cách xếp lịch</Label>
                <select
                  aria-label="Chọn cách xếp lịch"
                  value={lessonDraft.scheduleMode}
                  onChange={(event) =>
                    setLessonDraft((current) => ({
                      ...current,
                      scheduleMode: event.target.value as LessonScheduleMode,
                    }))
                  }
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="flexible">Linh hoạt — có thể dời sang ngày sau</option>
                  <option value="fixed">Cố định — chỉ học đúng ngày đã chọn</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <Label>
                  {lessonDraft.scheduleMode === "fixed" ? "Ngày học cố định" : "Có thể học từ ngày"}
                </Label>
                <div className="mt-1 flex gap-2">
                  <Input
                    type="date"
                    value={lessonDraft.date}
                    onChange={(event) =>
                      setLessonDraft((current) => ({ ...current, date: event.target.value }))
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 rounded-xl"
                    onClick={() => setLessonDraft((current) => ({ ...current, date: "" }))}
                  >
                    Bỏ ngày
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button variant="outline" onClick={() => setEditingLesson(null)}>
                  Hủy
                </Button>
                <Button onClick={saveLesson}>Lưu bài học</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Dialog>

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(next) => !next && setPendingDelete(null)}
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
                if (applyWithUndo(pendingDelete.nextSubjects, pendingDelete.successMessage)) {
                  clearSelection();
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

function SubjectHeader({
  subject,
  stats,
  onEdit,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onArchive,
  onDelete,
  onAddTopic,
  onExport,
  addLesson,
}: {
  subject: Subject;
  stats: SubjectStats;
  onEdit: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onAddTopic: () => void;
  onExport: () => void;
  addLesson: ReactNode;
}) {
  return (
    <section className="rounded-3xl border bg-gradient-to-br from-white to-indigo-50/60 p-5 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-3xl shadow-xs">
          {subject.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">{subject.name}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {subject.milestones.length} chủ đề · {stats.lessons} bài · {stats.completed} đã hoàn
            thành
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Progress value={stats.percent} className="h-2 flex-1" />
            <span className="text-xs font-bold text-indigo-700">{stats.percent}%</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">{formatMinutes(stats.remaining)} còn lại</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="rounded-xl" onClick={onAddTopic}>
            <Plus className="h-4 w-4" /> Thêm chủ đề
          </Button>
          {addLesson}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl" aria-label="Quản lý môn">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onSelect={onEdit}>
                <Edit3 className="mr-2 h-4 w-4" /> Chỉnh sửa môn
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onExport}>
                <Download className="mr-2 h-4 w-4" /> Xuất riêng môn này
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!canMoveUp} onSelect={onMoveUp}>
                <ArrowUp className="mr-2 h-4 w-4" /> Di chuyển lên
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!canMoveDown} onSelect={onMoveDown}>
                <ArrowDown className="mr-2 h-4 w-4" /> Di chuyển xuống
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onArchive}>
                <Archive className="mr-2 h-4 w-4" /> Lưu trữ môn
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onDelete} className="text-red-700">
                <Trash2 className="mr-2 h-4 w-4" /> Xóa môn và các bài
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </section>
  );
}

function TopicGroup({
  topicId,
  title,
  lessons,
  subject,
  subjects,
  progress,
  minutesByLesson,
  onEdit,
  selectionMode,
  selectedLessonIds,
  onToggleSelection,
  onEditTopic,
  canMoveTopicUp,
  canMoveTopicDown,
  onMoveTopicUp,
  onMoveTopicDown,
  onDeleteTopic,
  onApply,
  onArchiveChanged,
  confirmTimerImpact,
  canReorder,
  draggedLessonId,
  onDraggedLessonChange,
  dragArmedLessonId,
  onDragArmedLessonChange,
  onRequestDelete,
}: {
  topicId: string;
  title: string;
  lessons: Lesson[];
  subject: Subject;
  subjects: Subject[];
  progress?: ProgressState;
  minutesByLesson: Map<string, number>;
  onEdit: (lesson: Lesson) => void;
  selectionMode: boolean;
  selectedLessonIds: Set<string>;
  onToggleSelection: (lessonId: string) => void;
  onEditTopic: () => void;
  canMoveTopicUp: boolean;
  canMoveTopicDown: boolean;
  onMoveTopicUp: () => void;
  onMoveTopicDown: () => void;
  onDeleteTopic: () => void;
  onApply: (subjects: Subject[], message?: string, options?: CatalogUpdateOptions) => boolean;
  onArchiveChanged: () => void;
  confirmTimerImpact: (lessonIds: Iterable<string>, action: string) => boolean;
  canReorder: boolean;
  draggedLessonId: string | null;
  onDraggedLessonChange: (lessonId: string | null) => void;
  dragArmedLessonId: string | null;
  onDragArmedLessonChange: (lessonId: string | null) => void;
  onRequestDelete: (lesson: Lesson) => void;
}) {
  const [open, setOpen] = useState(true);
  const [dropIndicator, setDropIndicator] = useState<{
    lessonId: string;
    edge: "before" | "after";
  } | null>(null);
  const completed = lessons.filter(
    (lesson) =>
      Boolean(progress?.completedLessons[lesson.id]) ||
      (minutesByLesson.get(lesson.id) ?? 0) >= lesson.plannedDurationMinutes,
  ).length;
  const remaining = lessons.reduce(
    (sum, lesson) =>
      sum + Math.max(0, lesson.plannedDurationMinutes - (minutesByLesson.get(lesson.id) ?? 0)),
    0,
  );
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex w-full items-center gap-2 bg-slate-50/80 px-3 py-2.5">
          <CollapsibleTrigger asChild>
            <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <ChevronDown className={cn("h-4 w-4 transition", !open && "-rotate-90")} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-slate-900">{title}</h3>
                <p className="text-[11px] text-slate-500">
                  {completed} / {lessons.length} bài · {formatMinutes(remaining)} còn lại
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
                aria-label={`Quản lý chủ đề ${title}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onSelect={onEditTopic}>
                <Edit3 className="mr-2 h-4 w-4" /> Đổi tên chủ đề
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!canMoveTopicUp} onSelect={onMoveTopicUp}>
                <ArrowUp className="mr-2 h-4 w-4" /> Di chuyển lên
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!canMoveTopicDown} onSelect={onMoveTopicDown}>
                <ArrowDown className="mr-2 h-4 w-4" /> Di chuyển xuống
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onDeleteTopic} className="text-red-700">
                <Trash2 className="mr-2 h-4 w-4" /> Xóa chủ đề
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CollapsibleContent>
          {lessons.length === 0 ? (
            <p className="px-4 py-5 text-center text-xs text-slate-500">
              Chủ đề này chưa có bài học.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {lessons.map((lesson, index) => {
                const minutes = minutesByLesson.get(lesson.id) ?? 0;
                const isCompleted =
                  Boolean(progress?.completedLessons[lesson.id]) ||
                  minutes >= lesson.plannedDurationMinutes;
                const percent = Math.min(
                  100,
                  Math.round((minutes / Math.max(1, lesson.plannedDurationMinutes)) * 100),
                );
                return (
                  <li
                    key={lesson.id}
                    draggable={false}
                    onDragOver={(event) => {
                      if (canReorder && draggedLessonId && draggedLessonId !== lesson.id) {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                        const rect = event.currentTarget.getBoundingClientRect();
                        setDropIndicator({
                          lessonId: lesson.id,
                          edge: event.clientY < rect.top + rect.height / 2 ? "before" : "after",
                        });
                      }
                    }}
                    onDragLeave={(event) => {
                      const nextTarget = event.relatedTarget;
                      if (
                        !(nextTarget instanceof Node) ||
                        !event.currentTarget.contains(nextTarget)
                      ) {
                        setDropIndicator(null);
                      }
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const sourceId = event.dataTransfer.getData("text/plain") || draggedLessonId;
                      if (!canReorder || !sourceId || sourceId === lesson.id) {
                        setDropIndicator(null);
                        return;
                      }
                      const rect = event.currentTarget.getBoundingClientRect();
                      const edge =
                        dropIndicator?.lessonId === lesson.id
                          ? dropIndicator.edge
                          : event.clientY < rect.top + rect.height / 2
                            ? "before"
                            : "after";
                      const beforeLessonId =
                        edge === "before" ? lesson.id : (lessons[index + 1]?.id ?? null);
                      onApply(
                        moveLessonBeforeInTopic(
                          subjects,
                          subject.id,
                          topicId,
                          sourceId,
                          beforeLessonId,
                        ),
                        "Đã sắp xếp lại bài học.",
                      );
                      setDropIndicator(null);
                      onDraggedLessonChange(null);
                      onDragArmedLessonChange(null);
                    }}
                    onDragEnd={() => {
                      setDropIndicator(null);
                      onDraggedLessonChange(null);
                      onDragArmedLessonChange(null);
                    }}
                    className={cn(
                      "relative flex items-start gap-3 p-3 sm:items-center",
                      canReorder && !selectionMode && "select-none",
                      selectedLessonIds.has(lesson.id) && "bg-indigo-50/70",
                      draggedLessonId === lesson.id && "bg-indigo-50 opacity-60",
                    )}
                  >
                    {dropIndicator?.lessonId === lesson.id && draggedLessonId && (
                      <span
                        className={cn(
                          "pointer-events-none absolute left-3 right-3 z-20 h-0.5 bg-indigo-600 shadow-[0_0_0_1px_white]",
                          dropIndicator.edge === "before" ? "-top-px" : "-bottom-px",
                        )}
                        aria-hidden="true"
                      >
                        <span className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-indigo-600 bg-white" />
                        <span
                          className={cn(
                            "absolute left-4 rounded-md bg-indigo-700 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm",
                            dropIndicator.edge === "before" ? "bottom-1" : "top-1",
                          )}
                        >
                          {dropIndicator.edge === "before" ? "Chèn phía trên" : "Chèn phía dưới"}
                        </span>
                      </span>
                    )}
                    {selectionMode && (
                      <input
                        type="checkbox"
                        checked={selectedLessonIds.has(lesson.id)}
                        onChange={() => onToggleSelection(lesson.id)}
                        className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 accent-indigo-600 sm:mt-0"
                        aria-label={`Chọn ${lesson.title}`}
                      />
                    )}
                    {canReorder && !selectionMode && (
                      <span
                        draggable
                        onDragStart={(event: DragEvent<HTMLSpanElement>) => {
                          event.stopPropagation();
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("application/x-smart-lesson-id", lesson.id);
                          event.dataTransfer.setData("text/plain", lesson.id);

                          const card = event.currentTarget.closest("li");
                          if (card) {
                            const preview = card.cloneNode(true) as HTMLElement;
                            preview.style.position = "fixed";
                            preview.style.top = "-10000px";
                            preview.style.left = "-10000px";
                            preview.style.width = "360px";
                            preview.style.maxWidth = "90vw";
                            preview.style.background = "white";
                            preview.style.border = "1px solid rgb(129 140 248)";
                            preview.style.borderRadius = "12px";
                            preview.style.boxShadow = "0 16px 36px rgba(15, 23, 42, 0.18)";
                            preview.style.opacity = "0.96";
                            document.body.appendChild(preview);
                            event.dataTransfer.setDragImage(preview, 24, 20);
                            window.setTimeout(() => preview.remove(), 0);
                          }

                          onDraggedLessonChange(lesson.id);
                        }}
                        onDragEnd={(event) => {
                          event.stopPropagation();
                          onDraggedLessonChange(null);
                        }}
                        className="mt-1 inline-flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 active:cursor-grabbing sm:mt-0"
                        title="Kéo một lần bằng tay cầm để đổi vị trí"
                        aria-label="Kéo để sắp xếp bài học"
                        role="button"
                        tabIndex={0}
                      >
                        <GripVertical className="h-4 w-4" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "mb-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          isCompleted
                            ? "bg-emerald-100 text-emerald-700"
                            : minutes > 0
                              ? "bg-sky-100 text-sky-700"
                              : "bg-slate-100 text-slate-600",
                        )}
                      >
                        {isCompleted ? "Hoàn thành" : minutes > 0 ? "Đang học" : "Chưa bắt đầu"}
                      </span>
                      <p className="break-words text-sm font-semibold text-slate-900">
                        {lesson.title}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span>
                          {minutes} / {lesson.plannedDurationMinutes} phút · {percent}%
                        </span>
                        <span>
                          {lesson.scheduledDate
                            ? `${lesson.scheduleMode === "fixed" ? "Cố định" : "Từ"} ${lesson.scheduledDate}`
                            : "Chưa lên lịch"}
                        </span>
                      </div>
                      <Progress value={percent} className="mt-2 h-1.5" />
                    </div>
                    {canReorder && !selectionMode && (
                      <div
                        className="flex shrink-0 items-center gap-1"
                        aria-label={`Sắp xếp ${lesson.title}`}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          disabled={index === 0}
                          onClick={() =>
                            onApply(
                              reorderLesson(subjects, lesson.id, -1),
                              "Đã di chuyển bài học lên.",
                            )
                          }
                          aria-label={`Di chuyển ${lesson.title} lên`}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          disabled={index === lessons.length - 1}
                          onClick={() =>
                            onApply(
                              reorderLesson(subjects, lesson.id, 1),
                              "Đã di chuyển bài học xuống.",
                            )
                          }
                          aria-label={`Di chuyển ${lesson.title} xuống`}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {!selectionMode && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-lg"
                        onClick={() => onEdit(lesson)}
                        aria-label={`Chỉnh sửa ${lesson.title}`}
                        title="Chỉnh ngày, thời lượng và chủ đề"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    )}
                    {!selectionMode && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl"
                            aria-label={`Quản lý ${lesson.title}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl">
                          <DropdownMenuItem onSelect={() => onEdit(lesson)}>
                            <Edit3 className="mr-2 h-4 w-4" /> Chỉnh sửa bài học
                          </DropdownMenuItem>
                          {subjects
                            .filter((candidate) => candidate.id !== subject.id)
                            .map((candidate) => (
                              <DropdownMenuItem
                                key={candidate.id}
                                onSelect={() =>
                                  onApply(
                                    moveLessonToSubject(subjects, lesson.id, candidate.id),
                                    `Đã chuyển bài sang ${candidate.name}.`,
                                  )
                                }
                              >
                                <BookOpen className="mr-2 h-4 w-4" /> Chuyển sang {candidate.name}
                              </DropdownMenuItem>
                            ))}
                          <DropdownMenuItem
                            onSelect={() =>
                              onApply(
                                duplicateLessonInSubjects(subjects, lesson.id),
                                `Đã nhân bản bài ${lesson.title}.`,
                              )
                            }
                          >
                            <Plus className="mr-2 h-4 w-4" /> Nhân bản bài học
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => {
                              if (!confirmTimerImpact([lesson.id], `lưu trữ bài ${lesson.title}`))
                                return;
                              if (
                                onApply(
                                  archiveLesson(subjects, lesson.id),
                                  `Đã lưu trữ bài ${lesson.title}.`,
                                  { alreadyPersisted: true },
                                )
                              ) {
                                onArchiveChanged();
                              }
                            }}
                          >
                            <Archive className="mr-2 h-4 w-4" /> Lưu trữ
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-700"
                            onSelect={() => onRequestDelete(lesson)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa bài học
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

function ArchivedItem({ label, onRestore }: { label: string; onRestore: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-white p-2">
      <FolderArchive className="h-4 w-4 text-amber-600" />
      <span className="min-w-0 flex-1 truncate text-xs font-medium">{label}</span>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 rounded-lg"
        onClick={onRestore}
        aria-label={`Khôi phục ${label}`}
      >
        <Undo2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-slate-50 p-7 text-center">
      <LibraryBig className="mx-auto h-8 w-8 text-slate-300" />
      <h3 className="mt-2 text-sm font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder} phút`;
  if (!remainder) return `${hours} giờ`;
  return `${hours} giờ ${remainder} phút`;
}
