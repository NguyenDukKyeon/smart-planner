import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BookOpen, Edit3, Search, Undo2 } from "lucide-react";
import { toast } from "sonner";
import type { Subject, Lesson } from "@/lib/mock-data";
import type { PlannerSettings } from "@/lib/planner";
import type { ProgressState } from "@/lib/progress-store";
import {
  updateLessonDetails,
  type CatalogUpdateOptions,
  type CatalogUpdateResult,
} from "@/lib/custom-subjects";
import {
  buildEditLessonCandidate,
  type LessonEditorCandidateInput,
} from "@/lib/schedule-candidates";
import { createScheduleSnapshot } from "@/lib/schedule-transactions";
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
import { LessonEditorDialog } from "./course-manager/LessonEditorDialog";
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
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [draft, setDraft] = useState<LessonEditorDraft | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentSubjects.some((subject) => subject.id === selectedSubjectId)) {
      setSelectedSubjectId(currentSubjects[0]?.id ?? "");
    }
  }, [currentSubjects, selectedSubjectId]);

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
  const stats = selectedSubject
    ? deriveSubjectStats(selectedSubject, minutesByLesson, progress)
    : null;

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

          <div className="grid min-h-0 flex-1 md:grid-cols-[260px_minmax(0,1fr)]">
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
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      className={cn(
                        "w-full rounded-xl px-3 py-2 text-left transition",
                        selectedSubjectId === subject.id
                          ? "bg-indigo-600 text-white"
                          : "hover:bg-white",
                      )}
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
                  );
                })}
              </div>
            </aside>

            <main className="min-h-0 overflow-y-auto p-4 sm:p-5">
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

                  <section className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px_180px]">
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
                  </section>

                  <div className="space-y-3">
                    {visibleMilestones.map((topic) => (
                      <section
                        key={topic.id}
                        className="overflow-hidden rounded-2xl border bg-white"
                      >
                        <header className="border-b bg-slate-50 px-4 py-3">
                          <h3 className="font-semibold">{topic.title}</h3>
                          <p className="text-xs text-slate-500">{topic.lessons.length} bài học</p>
                        </header>
                        {topic.lessons.length ? (
                          <ul className="divide-y">
                            {topic.lessons.map((lesson) => {
                              const minutes = minutesByLesson.get(lesson.id) ?? 0;
                              const percent = Math.min(
                                100,
                                Math.round(
                                  (minutes / Math.max(1, lesson.plannedDurationMinutes)) * 100,
                                ),
                              );
                              return (
                                <li key={lesson.id} className="flex items-center gap-3 p-3">
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{lesson.title}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {lesson.plannedDurationMinutes} phút ·{" "}
                                      {lesson.scheduledDate || "Chưa xếp lịch"} ·{" "}
                                      {lesson.scheduleMode === "fixed" ? "Cố định" : "Linh hoạt"}
                                    </p>
                                    <Progress value={percent} className="mt-2 h-1.5" />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openLessonEdit(lesson)}
                                  >
                                    <Edit3 className="h-4 w-4" /> Chỉnh sửa
                                  </Button>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="p-4 text-sm text-slate-500">Chủ đề này chưa có bài học.</p>
                        )}
                      </section>
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
