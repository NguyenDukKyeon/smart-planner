import { useEffect, useMemo, useRef, useState, type DragEvent as ReactDragEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Move,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { SUBJECTS, type Lesson, type Subject } from "@/lib/mock-data";
import { buildFlexiblePlan, findLessonById, type PlanDay } from "@/lib/planner";
import type { ProgressState } from "@/lib/progress-store";
import { daysBetweenISO, displayDate, getSundayISO, todayISO, weekdayVi } from "@/lib/date-utils";
import {
  buildChangeDayCapacityCandidate,
  buildMoveLessonDateCandidate,
} from "@/lib/schedule-candidates";
import { createScheduleSnapshot } from "@/lib/schedule-transactions";
import { summarizeUnscheduledWork } from "@/lib/schedule-visibility";
import {
  calculateMinimumHorizonWeeks,
  deriveFlexibleScheduleDayMetrics,
  filterFlexibleScheduleItems,
  isFlexibleScheduleAttentionDay,
  type FlexibleScheduleStatusFilter,
} from "@/lib/flexible-schedule-workspace";
import { MoveLessonDateDialog } from "@/components/flexible-planner/MoveLessonDateDialog";
import {
  useScheduleTransactions,
  type ScheduleTransactionAdapters,
} from "@/components/flexible-planner/useScheduleTransactions";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sortLessonsBySubjectPriority, sortSubjects } from "@/lib/subject-order";
import {
  DAILY_STUDY_HOURS_STEP,
  MAX_DAILY_STUDY_HOURS,
  MIN_DAILY_STUDY_HOURS,
  normalizeDailyStudyHours,
} from "@/lib/study-hours";
import { HighStudyHoursNote } from "@/components/HighStudyHoursNote";

type Props = {
  state: ProgressState;
  subjects?: Subject[];
  transactionAdapters: ScheduleTransactionAdapters;
};

type DisplayLesson = {
  id: string;
  kind: "lesson" | "review";
  lesson: Lesson;
  subjectId: string;
  subjectName: string;
  subjectEmoji: string;
  topic: string;
  reviewAgeDays?: number;
  unplacedFixed?: boolean;
};

type WeekGroup = {
  id: string;
  number: number;
  startISO: string;
  endISO: string;
  days: PlanDay[];
};

type LessonMode = "fixed" | "flexible";

type OutsideHorizonMoveNotice = {
  lessonId: string;
  lessonTitle: string;
  subjectId: string;
  targetDateISO: string;
  mode: LessonMode;
  horizonLimitReason?: "included" | "before-start" | "beyond-max";
};

const STATUS_FILTERS: Array<{ id: FlexibleScheduleStatusFilter; label: string }> = [
  { id: "all", label: "Tất cả công việc" },
  { id: "fixed", label: "Cố định" },
  { id: "flexible", label: "Linh hoạt" },
  { id: "attention", label: "Cần xử lý" },
];

function getLessonMode(lesson: Lesson): LessonMode {
  return (lesson as Lesson & { scheduleMode?: LessonMode }).scheduleMode ?? "flexible";
}

function getUnplacedFixedLessons(day: PlanDay): Lesson[] {
  return (
    (
      day.queue as typeof day.queue & {
        unplacedFixedLessons?: Lesson[];
      }
    ).unplacedFixedLessons ?? []
  );
}

function planContainsLesson(days: readonly PlanDay[], lessonId: string): boolean {
  return days.some(
    (day) =>
      day.queue.newLessons.some((lesson) => lesson.id === lessonId) ||
      getUnplacedFixedLessons(day).some((lesson) => lesson.id === lessonId),
  );
}

function createLessonDragPreview(event: ReactDragEvent<HTMLElement>, item: DisplayLesson) {
  const preview = document.createElement("div");
  preview.textContent = `${item.subjectEmoji} ${item.lesson.title}`;
  Object.assign(preview.style, {
    position: "fixed",
    top: "-10000px",
    left: "-10000px",
    maxWidth: "360px",
    padding: "10px 14px",
    border: "1px solid rgb(110 231 183)",
    borderRadius: "12px",
    background: "white",
    color: "rgb(15 23 42)",
    boxShadow: "0 16px 36px rgba(15, 23, 42, 0.18)",
    fontSize: "13px",
    fontWeight: "700",
    lineHeight: "1.35",
  });
  document.body.appendChild(preview);
  event.dataTransfer.setDragImage(preview, 24, 20);
  window.setTimeout(() => preview.remove(), 0);
}

function emptyStateFor(statusFilter: FlexibleScheduleStatusFilter): string {
  if (statusFilter === "fixed") {
    return "Không có bài cố định của môn đang xem trong khoảng lịch này.";
  }
  if (statusFilter === "flexible") {
    return "Không có bài linh hoạt của môn đang xem trong khoảng lịch này.";
  }
  if (statusFilter === "attention") {
    return "Không có ngày quá tải hoặc bài cố định chưa xếp trong khoảng lịch này.";
  }
  return "Không có bài của môn đang xem trong khoảng lịch này.";
}

export function FlexiblePlanner({ state, subjects = SUBJECTS, transactionAdapters }: Props) {
  const [numWeeks, setNumWeeks] = useState(2);
  const [subjectId, setSubjectId] = useState("all");
  const [statusFilter, setStatusFilter] = useState<FlexibleScheduleStatusFilter>("all");
  const [userToggledWeeks, setUserToggledWeeks] = useState<Record<string, boolean>>({});
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [recentlyMovedLessonId, setRecentlyMovedLessonId] = useState<string | null>(null);
  const [pendingMoveVisibilityCheck, setPendingMoveVisibilityCheck] =
    useState<OutsideHorizonMoveNotice | null>(null);
  const [outsideHorizonNotice, setOutsideHorizonNotice] = useState<OutsideHorizonMoveNotice | null>(
    null,
  );
  const today = todayISO();

  const sortedSubjects = useMemo(() => sortSubjects(subjects), [subjects]);

  useEffect(() => {
    if (subjectId !== "all" && !sortedSubjects.some((subject) => subject.id === subjectId)) {
      setSubjectId("all");
    }
  }, [sortedSubjects, subjectId]);

  const subjectTabs = useMemo(
    () => [
      { id: "all", name: "Tất cả môn", emoji: "🌟" },
      ...sortedSubjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
        emoji: subject.emoji,
      })),
    ],
    [sortedSubjects],
  );

  const horizonDays = useMemo(() => {
    const sunday = getSundayISO(today);
    return daysBetweenISO(today, sunday) + 1 + (numWeeks - 1) * 7;
  }, [today, numWeeks]);

  const days = useMemo(
    () =>
      buildFlexiblePlan({
        subjects,
        completed: state.completedLessons,
        reviewCompletions: state.reviewCompletions,
        meta: state.studyMeta,
        settings: state.plannerSettings,
        fromISO: today,
        horizonDays,
      }),
    [
      subjects,
      state.completedLessons,
      state.reviewCompletions,
      state.studyMeta,
      state.plannerSettings,
      today,
      horizonDays,
    ],
  );

  const visibilitySummary = useMemo(
    () =>
      summarizeUnscheduledWork({
        subjects,
        completed: state.completedLessons,
        visiblePlan: days,
        subjectId,
      }),
    [days, state.completedLessons, subjectId, subjects],
  );

  const lessonPositionById = useMemo(() => {
    const map = new Map<
      string,
      {
        subjectId: string;
        subjectName: string;
        subjectEmoji: string;
        topic: string;
      }
    >();

    for (const subject of subjects) {
      for (const milestone of subject.milestones) {
        for (const lesson of milestone.lessons) {
          map.set(lesson.id, {
            subjectId: subject.id,
            subjectName: subject.name,
            subjectEmoji: subject.emoji,
            topic: lesson.topic || (milestone.title !== "Toàn bộ bài học" ? milestone.title : ""),
          });
        }
      }
    }
    return map;
  }, [subjects]);

  useEffect(() => {
    if (!pendingMoveVisibilityCheck) return;
    const publishedLesson = findLessonById(pendingMoveVisibilityCheck.lessonId, subjects);
    if (
      !publishedLesson ||
      publishedLesson.scheduledDate !== pendingMoveVisibilityCheck.targetDateISO
    ) {
      return;
    }

    if (planContainsLesson(days, pendingMoveVisibilityCheck.lessonId)) {
      setOutsideHorizonNotice((current) =>
        current?.lessonId === pendingMoveVisibilityCheck.lessonId ? null : current,
      );
    } else {
      setOutsideHorizonNotice(pendingMoveVisibilityCheck);
    }
    setPendingMoveVisibilityCheck(null);
  }, [days, pendingMoveVisibilityCheck, subjects]);

  useEffect(() => {
    if (!outsideHorizonNotice || !planContainsLesson(days, outsideHorizonNotice.lessonId)) return;
    setOutsideHorizonNotice(null);
  }, [days, outsideHorizonNotice]);

  const allDisplayLessonsByDate = useMemo(() => {
    const map = new Map<string, DisplayLesson[]>();

    for (const day of days) {
      const items: DisplayLesson[] = [];
      const queuedIds = new Set<string>();

      for (const lesson of sortLessonsBySubjectPriority(day.queue.newLessons)) {
        queuedIds.add(lesson.id);
        const position = lessonPositionById.get(lesson.id);
        items.push({
          id: lesson.id,
          kind: "lesson",
          lesson,
          subjectId: position?.subjectId ?? "unknown",
          subjectName: position?.subjectName ?? lesson.sourceSubject,
          subjectEmoji: position?.subjectEmoji ?? "📚",
          topic: position?.topic ?? lesson.topic ?? "",
        });
      }

      for (const lesson of getUnplacedFixedLessons(day)) {
        if (queuedIds.has(lesson.id)) continue;
        const position = lessonPositionById.get(lesson.id);
        items.push({
          id: lesson.id,
          kind: "lesson",
          lesson,
          subjectId: position?.subjectId ?? "unknown",
          subjectName: position?.subjectName ?? lesson.sourceSubject,
          subjectEmoji: position?.subjectEmoji ?? "📚",
          topic: position?.topic ?? lesson.topic ?? "",
          unplacedFixed: true,
        });
      }

      for (const review of day.queue.reviewLessons) {
        const lesson = findLessonById(review.lessonId, subjects);
        if (!lesson) continue;
        const position = lessonPositionById.get(lesson.id);
        items.push({
          id: `review-${lesson.id}-${day.dateISO}`,
          kind: "review",
          lesson,
          subjectId: position?.subjectId ?? "unknown",
          subjectName: position?.subjectName ?? lesson.sourceSubject,
          subjectEmoji: position?.subjectEmoji ?? "📚",
          topic: position?.topic ?? lesson.topic ?? "",
          reviewAgeDays: review.ageDays,
        });
      }

      map.set(day.dateISO, items);
    }

    return map;
  }, [days, lessonPositionById, subjects]);

  const displayLessonsByDate = useMemo(() => {
    const map = new Map<string, DisplayLesson[]>();
    for (const [dateISO, items] of allDisplayLessonsByDate) {
      map.set(
        dateISO,
        filterFlexibleScheduleItems(items, {
          subjectId,
          statusFilter,
        }),
      );
    }
    return map;
  }, [allDisplayLessonsByDate, statusFilter, subjectId]);

  const weeks = useMemo<WeekGroup[]>(() => {
    const groups: WeekGroup[] = [];
    for (const day of days) {
      const shouldStartWeek = groups.length === 0 || weekdayVi(day.dateISO) === "T2";
      if (shouldStartWeek) {
        groups.push({
          id: day.dateISO,
          number: groups.length + 1,
          startISO: day.dateISO,
          endISO: getSundayISO(day.dateISO),
          days: [],
        });
      }
      groups.at(-1)?.days.push(day);
    }
    return groups;
  }, [days]);

  const visibleLessonCount = useMemo(
    () =>
      days.reduce((total, day) => {
        if (statusFilter === "attention" && !isFlexibleScheduleAttentionDay(day.queue)) {
          return total;
        }
        return total + (displayLessonsByDate.get(day.dateISO)?.length ?? 0);
      }, 0),
    [days, displayLessonsByDate, statusFilter],
  );

  const selectedSubject = subjectTabs.find((subject) => subject.id === subjectId) ?? subjectTabs[0];

  const { history, canUndo, executeMutation, undoLastMutation } = useScheduleTransactions({
    subjects,
    plannerSettings: state.plannerSettings,
    adapters: transactionAdapters,
    onUndoSuccess: (entry) => {
      setRecentlyMovedLessonId(null);
      setPendingMoveVisibilityCheck(null);
      setOutsideHorizonNotice(null);
      toast.success("Đã hoàn tác thay đổi lịch.", { description: entry.description });
    },
    onUndoError: (error, rollbackError) => {
      toast.error(rollbackError ? `${error} ${rollbackError}` : error);
    },
  });

  const toggleWeek = (id: string, isCurrentlyCollapsed: boolean) => {
    setUserToggledWeeks((previous) => ({
      ...previous,
      [id]: !isCurrentlyCollapsed,
    }));
  };

  const moveLessonToDate = (lessonId: string, targetDateISO: string) => {
    const lesson = findLessonById(lessonId, subjects);
    const built = buildMoveLessonDateCandidate({
      current: createScheduleSnapshot(subjects, state.plannerSettings),
      lessonId,
      targetDateISO,
    });
    if (!built.ok || !lesson) {
      toast.error(built.ok ? "Không tìm thấy bài học để di chuyển." : built.error);
      return false;
    }

    const fromLabel = lesson.scheduledDate ? displayDate(lesson.scheduledDate) : "chưa đặt ngày";
    const result = executeMutation({
      candidate: built.candidate,
      kind: "move-lesson-date",
      description: `Chuyển “${lesson.title}” từ ${fromLabel} sang ${displayDate(targetDateISO)}.`,
    });
    if (!result.ok) {
      toast.error(result.rollbackError ? `${result.error} ${result.rollbackError}` : result.error);
      return false;
    }

    setRecentlyMovedLessonId(lessonId);
    window.setTimeout(() => setRecentlyMovedLessonId(null), result.status === "noop" ? 700 : 850);
    if (result.status === "noop") return true;

    const mode = getLessonMode(lesson);
    setOutsideHorizonNotice(null);
    setPendingMoveVisibilityCheck({
      lessonId,
      lessonTitle: lesson.title,
      subjectId: lessonPositionById.get(lessonId)?.subjectId ?? "unknown",
      targetDateISO,
      mode,
    });
    toast.success(
      mode === "fixed"
        ? `Đã chuyển “${lesson.title}” sang ${displayDate(targetDateISO)}.`
        : `Đã đặt “${lesson.title}” có thể học từ ${displayDate(targetDateISO)}.`,
      {
        description:
          mode === "fixed"
            ? "Bài cố định sẽ chỉ xuất hiện đúng ngày này. Nhấn Ctrl+Z để hoàn tác."
            : "Nếu ngày đó quá tải, lịch linh hoạt có thể dời bài sang ngày sau. Nhấn Ctrl+Z để hoàn tác.",
      },
    );
    return true;
  };

  const commitDayCapacity = (dateISO: string, hours: number) => {
    const { candidate } = buildChangeDayCapacityCandidate({
      current: createScheduleSnapshot(subjects, state.plannerSettings),
      dateISO,
      hours,
      todayDateISO: today,
    });
    const result = executeMutation({
      candidate,
      kind: "change-day-capacity",
      description: `Đổi công suất ngày ${displayDate(dateISO)} thành ${hours} giờ.`,
    });
    if (!result.ok) {
      toast.error(result.rollbackError ? `${result.error} ${result.rollbackError}` : result.error);
      return false;
    }
    if (result.status === "committed") {
      toast.success(`Đã đặt ${hours} giờ cho ${displayDate(dateISO)}.`, {
        description: "Nhấn Ctrl+Z để hoàn tác.",
      });
    }
    return true;
  };

  const handleDrop = (lessonId: string, targetDateISO: string) => {
    moveLessonToDate(lessonId, targetDateISO);
    setDraggedLessonId(null);
    setDragOverDate(null);
  };

  const expandHorizonToNotice = () => {
    if (!outsideHorizonNotice) return;
    const expansion = calculateMinimumHorizonWeeks({
      todayDateISO: today,
      targetDateISO: outsideHorizonNotice.targetDateISO,
    });
    setNumWeeks((current) => Math.max(current, expansion.weeks));
    if (!expansion.includesTarget) {
      setOutsideHorizonNotice((current) =>
        current
          ? {
              ...current,
              horizonLimitReason: expansion.reason,
            }
          : current,
      );
    }
  };

  return (
    <section className="min-w-0 space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-slate-900 sm:text-xl">
              Lịch linh hoạt
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Kéo bằng tay cầm sang ngày khác. Bài linh hoạt lấy ngày thả làm ngày sớm nhất; bài cố
              định chuyển đúng sang ngày đó.
            </p>
          </div>

          <div className="min-w-0 space-y-2">
            <div
              className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1"
              role="tablist"
              aria-label="Xem lịch theo môn"
            >
              {subjectTabs.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  role="tab"
                  aria-selected={subject.id === subjectId}
                  onClick={() => setSubjectId(subject.id)}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                    subject.id === subjectId
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800",
                  )}
                >
                  <span className="mr-1">{subject.emoji}</span>
                  {subject.name}
                </button>
              ))}
            </div>

            <div
              className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1"
              role="tablist"
              aria-label="Lọc lịch theo trạng thái"
            >
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  role="tab"
                  aria-selected={filter.id === statusFilter}
                  onClick={() => setStatusFilter(filter.id)}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                    filter.id === statusFilter
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <button
            type="button"
            disabled={!canUndo}
            onClick={undoLastMutation}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 font-semibold text-slate-700 shadow-2xs transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Hoàn tác lần chuyển lịch gần nhất"
            title="Hoàn tác lần chuyển gần nhất (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Hoàn tác
            {history.length > 0 && (
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                {history.length}
              </span>
            )}
            <span className="hidden text-[10px] font-medium text-slate-400 sm:inline">Ctrl+Z</span>
          </button>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800">
            Đang xem: {selectedSubject?.emoji} {selectedSubject?.name}
          </span>
          <span>
            {visibleLessonCount} mục trong {days.length} ngày
          </span>
          <span>Chưa xong: {visibilitySummary.unfinishedCount}</span>
          <span>Đã xếp trong khoảng: {visibilitySummary.visibleScheduledCount}</span>
          <span>Ngoài khoảng: {visibilitySummary.outsideHorizonCount}</span>
          <span className="inline-flex items-center gap-1">
            <Move className="h-3.5 w-3.5" />
            Trên điện thoại hoặc bàn phím, dùng nút lùi/tiến hoặc Chọn ngày.
          </span>
        </div>
      </div>

      {outsideHorizonNotice && (
        <div
          role="status"
          className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 shadow-xs"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-bold">Ngoài khoảng đang mở</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-900">
                “{outsideHorizonNotice.lessonTitle}” có{" "}
                {outsideHorizonNotice.mode === "fixed" ? "ngày cố định" : "ngày sớm nhất"}{" "}
                {displayDate(outsideHorizonNotice.targetDateISO)} nhưng chưa xuất hiện trong khoảng
                lịch hiện tại.
              </p>
              {outsideHorizonNotice.horizonLimitReason === "beyond-max" && (
                <p className="mt-1 text-xs font-semibold text-amber-900">
                  Ngày này vẫn nằm ngoài giới hạn hiển thị tối đa 52 tuần.
                </p>
              )}
              {outsideHorizonNotice.horizonLimitReason === "before-start" && (
                <p className="mt-1 text-xs font-semibold text-amber-900">
                  Ngày này nằm trước ngày bắt đầu của lịch đang mở.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={expandHorizonToNotice}
                className="min-h-9 rounded-lg border border-amber-400 bg-white px-3 text-xs font-bold text-amber-950 hover:bg-amber-100"
              >
                Mở rộng lịch
              </button>
              <button
                type="button"
                onClick={() => setSubjectId(outsideHorizonNotice.subjectId)}
                className="min-h-9 rounded-lg border border-amber-400 bg-white px-3 text-xs font-bold text-amber-950 hover:bg-amber-100"
              >
                Xem môn này
              </button>
              <button
                type="button"
                onClick={() => setOutsideHorizonNotice(null)}
                className="min-h-9 rounded-lg px-3 text-xs font-semibold text-amber-900 hover:bg-amber-100"
              >
                Bỏ qua
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {draggedLessonId && dragOverDate
          ? `Sẵn sàng chuyển bài sang ${displayDate(dragOverDate)}`
          : draggedLessonId
            ? "Đang kéo bài học"
            : ""}
      </p>

      <div className="space-y-3">
        {weeks.map((week, weekIndex) => {
          const collapsed =
            userToggledWeeks[week.id] !== undefined ? userToggledWeeks[week.id] : weekIndex > 0;
          const renderedDays =
            statusFilter === "attention"
              ? week.days.filter((day) => isFlexibleScheduleAttentionDay(day.queue))
              : week.days;
          const weekVisibleCount = renderedDays.reduce(
            (total, day) => total + (displayLessonsByDate.get(day.dateISO)?.length ?? 0),
            0,
          );

          return (
            <section
              key={week.id}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggleWeek(week.id, collapsed)}
                aria-expanded={!collapsed}
                className="flex min-h-14 w-full items-center gap-3 bg-gradient-to-r from-emerald-50/90 via-sky-50/50 to-white px-4 py-3 text-left transition hover:brightness-[0.98]"
              >
                {collapsed ? (
                  <ChevronRight className="h-5 w-5 shrink-0 text-emerald-700" />
                ) : (
                  <ChevronDown className="h-5 w-5 shrink-0 text-emerald-700" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-slate-900">Tuần {week.number}</p>
                    {weekIndex === 0 && (
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        Tuần này
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs font-medium text-slate-500">
                    {weekdayVi(week.startISO)} {displayDate(week.startISO)} → CN{" "}
                    {displayDate(week.endISO)}
                  </p>
                </div>
                <span className="rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs">
                  {weekVisibleCount} mục
                </span>
              </button>

              {!collapsed &&
                (renderedDays.length > 0 ? (
                  <div className="grid gap-3 p-3.5 lg:grid-cols-2">
                    {renderedDays.map((day) => {
                      const globalDayIndex = days.findIndex(
                        (candidate) => candidate.dateISO === day.dateISO,
                      );
                      return (
                        <PlanDayCard
                          key={day.dateISO}
                          day={day}
                          today={today}
                          lessons={displayLessonsByDate.get(day.dateISO) ?? []}
                          statusFilter={statusFilter}
                          previousDate={
                            globalDayIndex > 0 ? days[globalDayIndex - 1]?.dateISO : undefined
                          }
                          nextDate={days[globalDayIndex + 1]?.dateISO}
                          draggedLessonId={draggedLessonId}
                          dragOverDate={dragOverDate}
                          recentlyMovedLessonId={recentlyMovedLessonId}
                          onCommitDayHours={commitDayCapacity}
                          onDragStart={(event, item) => {
                            event.dataTransfer.effectAllowed = "move";
                            event.dataTransfer.setData(
                              "application/x-smart-lesson-id",
                              item.lesson.id,
                            );
                            event.dataTransfer.setData("text/plain", item.lesson.id);
                            createLessonDragPreview(event, item);
                            setDraggedLessonId(item.lesson.id);
                          }}
                          onDragEnd={() => {
                            setDraggedLessonId(null);
                            setDragOverDate(null);
                          }}
                          onDragOverDate={setDragOverDate}
                          onDropLesson={handleDrop}
                          onMoveLesson={moveLessonToDate}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="m-3.5 rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs font-medium text-slate-500">
                    {emptyStateFor(statusFilter)}
                  </p>
                ))}
            </section>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 px-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Hiển thị {numWeeks} tuần · {days.length} ngày · đến{" "}
          {displayDate(days.at(-1)?.dateISO ?? today)}
        </span>
        <div className="grid grid-cols-3 gap-1.5 sm:flex">
          <button
            type="button"
            className="min-h-9 rounded-lg border border-slate-200 bg-white px-2.5 font-semibold text-slate-700 shadow-2xs hover:bg-slate-100"
            onClick={() => setNumWeeks((value) => Math.max(1, value - 1))}
          >
            − 1 tuần
          </button>
          <button
            type="button"
            className="min-h-9 rounded-lg border border-slate-200 bg-white px-2.5 font-semibold text-slate-700 shadow-2xs hover:bg-slate-100"
            onClick={() => setNumWeeks((value) => Math.min(52, value + 1))}
          >
            + 1 tuần
          </button>
          <select
            aria-label="Số tuần hiển thị"
            value={numWeeks}
            onChange={(event) => setNumWeeks(Number(event.target.value))}
            className="min-h-9 rounded-lg border border-slate-200 bg-white px-2 font-semibold text-slate-700 shadow-2xs"
          >
            {[1, 2, 4, 8, 12, 16, 24, 36, 52].map((weeksCount) => (
              <option key={weeksCount} value={weeksCount}>
                {weeksCount} tuần
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

function DayCapacityInput({
  day,
  onCommit,
}: {
  day: PlanDay;
  onCommit: (dateISO: string, hours: number) => boolean;
}) {
  const [draft, setDraft] = useState(String(day.hours));
  const cancelNextBlurCommitRef = useRef(false);

  useEffect(() => {
    setDraft(String(day.hours));
  }, [day.hours]);

  const commitDraft = () => {
    if (cancelNextBlurCommitRef.current) {
      cancelNextBlurCommitRef.current = false;
      return;
    }
    if (draft.trim() === "") {
      setDraft(String(day.hours));
      return;
    }
    const value = Number(draft);
    if (!Number.isFinite(value)) {
      setDraft(String(day.hours));
      return;
    }
    const normalized = normalizeDailyStudyHours(value);
    const committed = onCommit(day.dateISO, normalized);
    setDraft(String(committed ? normalized : day.hours));
  };

  return (
    <label className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-600">
      <Input
        type="number"
        aria-label={`Giờ học ngày ${displayDate(day.dateISO)}`}
        min={MIN_DAILY_STUDY_HOURS}
        max={MAX_DAILY_STUDY_HOURS}
        step={DAILY_STUDY_HOURS_STEP}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commitDraft}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") {
            cancelNextBlurCommitRef.current = true;
            setDraft(String(day.hours));
            event.currentTarget.blur();
          }
        }}
        className="h-7 w-16 rounded-lg border-slate-200 bg-white px-1 text-center text-xs font-bold"
      />
      <span>giờ</span>
    </label>
  );
}

function PlanDayCard({
  day,
  today,
  lessons,
  statusFilter,
  previousDate,
  nextDate,
  draggedLessonId,
  dragOverDate,
  recentlyMovedLessonId,
  onCommitDayHours,
  onDragStart,
  onDragEnd,
  onDragOverDate,
  onDropLesson,
  onMoveLesson,
}: {
  day: PlanDay;
  today: string;
  lessons: DisplayLesson[];
  statusFilter: FlexibleScheduleStatusFilter;
  previousDate?: string;
  nextDate?: string;
  draggedLessonId: string | null;
  dragOverDate: string | null;
  recentlyMovedLessonId: string | null;
  onCommitDayHours: (dateISO: string, hours: number) => boolean;
  onDragStart: (event: ReactDragEvent<HTMLElement>, item: DisplayLesson) => void;
  onDragEnd: () => void;
  onDragOverDate: (dateISO: string | null) => void;
  onDropLesson: (lessonId: string, targetDateISO: string) => void;
  onMoveLesson: (lessonId: string, targetDateISO: string) => boolean;
}) {
  const isToday = day.dateISO === today;
  const isDropTarget = Boolean(draggedLessonId && dragOverDate === day.dateISO);
  const metrics = deriveFlexibleScheduleDayMetrics(day.queue);

  return (
    <article
      onDragOver={(event) => {
        if (!draggedLessonId) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onDragOverDate(day.dateISO);
      }}
      onDragLeave={(event) => {
        const relatedTarget = event.relatedTarget;
        if (!(relatedTarget instanceof Node) || !event.currentTarget.contains(relatedTarget)) {
          onDragOverDate(null);
        }
      }}
      onDrop={(event) => {
        if (!draggedLessonId) return;
        event.preventDefault();
        const lessonId =
          event.dataTransfer.getData("application/x-smart-lesson-id") ||
          event.dataTransfer.getData("text/plain") ||
          draggedLessonId;
        if (lessonId) onDropLesson(lessonId, day.dateISO);
      }}
      className={cn(
        "relative min-w-0 space-y-2.5 rounded-xl border p-3.5 transition-all",
        isToday ? "border-emerald-200/80 bg-emerald-50/50" : "border-slate-200/70 bg-slate-50/70",
        metrics.attentionRequired && "border-amber-300",
        isDropTarget &&
          "scale-[1.01] border-emerald-500 bg-emerald-50 shadow-[0_0_0_3px_rgba(16,185,129,0.14)]",
      )}
    >
      {isDropTarget && (
        <div className="pointer-events-none absolute inset-x-3 top-2 z-10 rounded-lg border border-emerald-300 bg-emerald-600 px-3 py-1.5 text-center text-[11px] font-bold text-white shadow-sm">
          Thả để chuyển sang {weekdayVi(day.dateISO)} {displayDate(day.dateISO)}
        </div>
      )}

      <header className={cn("space-y-2", isDropTarget && "pt-8")}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <h4 className="truncate text-sm font-bold text-slate-900">
              {weekdayVi(day.dateISO)} - {displayDate(day.dateISO)}
            </h4>
            {isToday && (
              <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                Hôm nay
              </span>
            )}
          </div>
          <DayCapacityInput day={day} onCommit={onCommitDayHours} />
        </div>
        <HighStudyHoursNote hours={day.hours} />

        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 rounded-lg bg-white/80 p-2 text-[11px] sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Công suất</dt>
            <dd className="font-bold text-slate-800">{metrics.quotaMinutes}p</dd>
          </div>
          <div>
            <dt className="text-slate-500">Đã xếp</dt>
            <dd className="font-bold text-slate-800">{metrics.scheduledMinutes}p</dd>
          </div>
          <div>
            <dt className="text-slate-500">Bài mới</dt>
            <dd className="font-bold text-slate-800">{metrics.newMinutes}p</dd>
          </div>
          <div>
            <dt className="text-slate-500">Ôn tập</dt>
            <dd className="font-bold text-slate-800">{metrics.reviewMinutes}p</dd>
          </div>
          {metrics.overloadMinutes > 0 ? (
            <div>
              <dt className="text-rose-700">Quá công suất</dt>
              <dd className="font-bold text-rose-800">{metrics.overloadMinutes}p</dd>
            </div>
          ) : (
            <div>
              <dt className="text-slate-500">Còn trống</dt>
              <dd className="font-bold text-slate-800">{metrics.unallocatedMinutes}p</dd>
            </div>
          )}
          {metrics.unplacedFixedMinutes > 0 && (
            <div>
              <dt className="text-rose-700">Cố định chưa xếp</dt>
              <dd className="font-bold text-rose-800">{metrics.unplacedFixedMinutes}p</dd>
            </div>
          )}
        </dl>
      </header>

      {lessons.length > 0 ? (
        <ul className="space-y-2 pt-0.5">
          {lessons.map((item) => (
            <LessonCard
              key={item.id}
              item={item}
              isDragging={draggedLessonId === item.lesson.id}
              recentlyMoved={recentlyMovedLessonId === item.lesson.id}
              previousDate={previousDate}
              nextDate={nextDate}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onMoveLesson={onMoveLesson}
            />
          ))}
        </ul>
      ) : (
        <div
          className={cn(
            "rounded-lg border border-dashed p-3 text-center text-xs font-medium",
            isDropTarget
              ? "border-emerald-400 bg-white text-emerald-800"
              : "border-slate-300 text-slate-500",
          )}
        >
          {isDropTarget ? "Thả bài vào ngày này" : emptyStateFor(statusFilter)}
        </div>
      )}
    </article>
  );
}

function LessonCard({
  item,
  isDragging,
  recentlyMoved,
  previousDate,
  nextDate,
  onDragStart,
  onDragEnd,
  onMoveLesson,
}: {
  item: DisplayLesson;
  isDragging: boolean;
  recentlyMoved: boolean;
  previousDate?: string;
  nextDate?: string;
  onDragStart: (event: ReactDragEvent<HTMLElement>, item: DisplayLesson) => void;
  onDragEnd: () => void;
  onMoveLesson: (lessonId: string, targetDateISO: string) => boolean;
}) {
  const mode = getLessonMode(item.lesson);
  const movable = item.kind === "lesson";

  return (
    <li
      className={cn(
        "relative rounded-lg border p-3 text-xs transition-all",
        item.reviewAgeDays
          ? "border-amber-200/90 bg-amber-50/40"
          : item.unplacedFixed
            ? "border-rose-300 bg-rose-50/60"
            : "border-slate-200/80 bg-white",
        isDragging && "scale-[0.99] opacity-35",
        recentlyMoved &&
          "animate-pulse border-emerald-400 bg-emerald-50 shadow-[0_0_0_2px_rgba(16,185,129,0.12)]",
      )}
    >
      <div className="flex items-start gap-2">
        {movable && (
          <button
            type="button"
            draggable
            onDragStart={(event) => onDragStart(event, item)}
            onDragEnd={onDragEnd}
            className="mt-0.5 inline-flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 shadow-2xs transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:cursor-grabbing"
            aria-label={`Kéo ${item.lesson.title} sang ngày khác`}
            title="Giữ tay cầm rồi kéo sang ngày khác"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="min-w-0 flex-1 break-words font-semibold leading-snug text-slate-900">
              {item.reviewAgeDays ? "↻ " : ""}
              {item.lesson.title}
            </p>
            <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
              {item.subjectEmoji} {item.subjectName}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
            {item.topic && (
              <span className="rounded bg-slate-100/80 px-1.5 py-0.5 font-medium text-slate-600">
                {item.topic}
              </span>
            )}
            {item.kind === "review" ? (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-800">
                Ôn sau {item.reviewAgeDays} ngày
              </span>
            ) : (
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 font-semibold",
                  mode === "fixed" ? "bg-violet-100 text-violet-800" : "bg-sky-100 text-sky-800",
                )}
              >
                {mode === "fixed" ? "Cố định" : "Linh hoạt"}
              </span>
            )}
            {item.unplacedFixed && (
              <span className="rounded bg-rose-100 px-1.5 py-0.5 font-semibold text-rose-800">
                Chưa xếp được trong công suất
              </span>
            )}
          </div>

          {movable && (
            <div className="mt-2 flex flex-wrap items-center justify-end gap-1.5 border-t border-slate-100 pt-2">
              <MoveLessonDateDialog lesson={item.lesson} onMove={onMoveLesson} />
              <button
                type="button"
                disabled={!previousDate}
                onClick={() => previousDate && onMoveLesson(item.lesson.id, previousDate)}
                className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label={`Chuyển ${item.lesson.title} lùi một ngày`}
                title="Lùi một ngày"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">1 ngày</span>
              </button>
              <button
                type="button"
                disabled={!nextDate}
                onClick={() => nextDate && onMoveLesson(item.lesson.id, nextDate)}
                className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label={`Chuyển ${item.lesson.title} tiến một ngày`}
                title="Tiến một ngày"
              >
                <span className="hidden sm:inline">1 ngày</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
