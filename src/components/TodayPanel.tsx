import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Clock, Play, Sparkles, Target } from "lucide-react";
import { SUBJECTS, type Subject } from "@/lib/mock-data";
import {
  allRemainingLessonIds,
  estimateLessonMinutes,
  findLessonById,
  findLessonPosition,
  pickTodayQueue,
} from "@/lib/planner";
import {
  computeStudyStreak,
  getLessonCompletedMinutes,
  type ProgressState,
} from "@/lib/progress-store";
import { displayDate, todayISO } from "@/lib/date-utils";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AddLessonModal } from "@/components/AddLessonModal";
import { sortLessonsBySubjectPriority } from "@/lib/subject-order";
import type { StudySession } from "@/lib/study-sessions";
import { LessonActionMenu } from "@/components/today/LessonActionMenu";
import { ManualStudyDialog } from "@/components/today/ManualStudyDialog";
import { TodayLessonCard } from "@/components/today/TodayLessonCard";
import type { ManualStudyRequest, TimerLessonRequest } from "@/components/today/types";
import { cn } from "@/lib/utils";
import {
  DAILY_STUDY_HOURS_STEP,
  MAX_DAILY_STUDY_HOURS,
  MIN_DAILY_STUDY_HOURS,
  normalizeDailyStudyHours,
} from "@/lib/study-hours";
import { HighStudyHoursNote } from "@/components/HighStudyHoursNote";
import {
  deriveLessonPlacementReason,
  deriveReviewPlacementReason,
} from "@/lib/lesson-placement";

function StudyStreakBadge({ streak }: { streak: number }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Hoàn thành toàn bộ bài mới và bài ôn hôm nay để giữ chuỗi!"
          aria-label={`Chuỗi học: ${streak} ngày liên tiếp`}
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-gradient-to-r from-amber-50 to-orange-50 px-3.5 py-2 text-xs sm:text-sm font-medium text-amber-900 shadow-2xs transition hover:border-amber-300 hover:bg-amber-100/90 focus:outline-none focus:ring-2 focus:ring-amber-400/50 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <span>
            🔥 <strong className="font-bold text-orange-600">{streak}</strong> ngày liên tiếp
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="w-72 rounded-2xl border border-amber-200 bg-amber-50/95 p-3.5 text-xs text-amber-950 shadow-lg backdrop-blur z-50"
      >
        <div className="flex items-start gap-2.5">
          <div className="rounded-xl bg-orange-100 p-2 text-lg leading-none shrink-0">🔥</div>
          <div className="space-y-1">
            <p className="font-semibold text-orange-950 text-sm">Chuỗi học (Study Streak)</p>
            <p className="text-slate-700 leading-relaxed">
              Học ít nhất 1 bài hoặc hoàn thành 25 phút Pomodoro mỗi ngày để giữ chuỗi!
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

type Props = {
  state: ProgressState;
  subjects?: Subject[];
  onToggleLesson: (id: string, xp: number) => boolean | void;
  onToggleReview: (lessonId: string, dateISO?: string) => boolean | void;
  onCompleteReview: (taskId: string) => boolean | void;
  onSetTodayHours: (hours: number) => void;
  onAddStudySession: (session: StudySession) => boolean | void;
  onStartFocus: (request: TimerLessonRequest) => void;
  onSubjectsUpdated?: (subjects: Subject[]) => void;
  onOpenRoadmapImport?: () => void;
  habitSidebar?: React.ReactNode;
};

export function TodayPanel({
  state,
  subjects = SUBJECTS,
  onToggleLesson,
  onToggleReview,
  onCompleteReview,
  onSetTodayHours,
  onAddStudySession,
  onStartFocus,
  onSubjectsUpdated,
  onOpenRoadmapImport,
  habitSidebar,
}: Props) {
  const today = todayISO();
  const studyStreak = useMemo(() => computeStudyStreak(state), [state]);
  const [manualEntry, setManualEntry] = useState<ManualStudyRequest | null>(null);

  const queue = useMemo(
    () =>
      pickTodayQueue({
        subjects,
        completed: state.completedLessons,
        reviewCompletions: state.reviewCompletions,
        meta: state.studyMeta,
        settings: state.plannerSettings,
      }),
    [
      subjects,
      state.completedLessons,
      state.reviewCompletions,
      state.studyMeta,
      state.plannerSettings,
    ],
  );

  const sortedNewLessons = useMemo(
    () => sortLessonsBySubjectPriority(queue.newLessons),
    [queue.newLessons],
  );
  const workspaceLessonCount = useMemo(
    () =>
      subjects.reduce(
        (total, subject) =>
          total + subject.milestones.reduce((sum, milestone) => sum + milestone.lessons.length, 0),
        0,
      ),
    [subjects],
  );
  const remainingIds = useMemo(
    () => allRemainingLessonIds(subjects, state.completedLessons),
    [subjects, state.completedLessons],
  );
  const completedTodayTasks = useMemo(() => {
    const completedNew = queue.newLessons.filter((lesson) =>
      Boolean(state.completedLessons[lesson.id]),
    ).length;
    const completedReviews = queue.reviewLessons.filter((review) => review.completed).length;
    return completedNew + completedReviews;
  }, [queue.newLessons, queue.reviewLessons, state.completedLessons]);

  const totalTodayQueue = queue.newLessons.length + queue.reviewLessons.length;

  const progressPercent = useMemo(() => {
    if (totalTodayQueue === 0) return 0;
    return Math.min(100, Math.round((completedTodayTasks / totalTodayQueue) * 100));
  }, [completedTodayTasks, totalTodayQueue]);

  const prioritizedLesson = useMemo(() => {
    const lesson = sortedNewLessons.find((item) => !state.completedLessons[item.id]);
    if (lesson) {
      return {
        lesson,
        minutes: estimateLessonMinutes(lesson.id, state.studyMeta, subjects),
        placementReason: deriveLessonPlacementReason({ lesson, assignedDateISO: today }),
        reviewTaskId: undefined,
      };
    }
    const review = queue.reviewLessons.find((item) => !item.completed);
    const reviewLesson = review ? findLessonById(review.lessonId, subjects) : undefined;
    if (!review || !reviewLesson) return null;
    return {
      lesson: reviewLesson,
      minutes: review.minutes,
      placementReason: deriveReviewPlacementReason({ ageDays: review.ageDays }),
      reviewTaskId: review.taskId,
    };
  }, [
    queue.reviewLessons,
    sortedNewLessons,
    state.completedLessons,
    state.studyMeta,
    subjects,
    today,
  ]);

  const openTimer = (
    lesson: { id: string; title: string; xp: number; plannedDurationMinutes?: number },
    minutes?: number,
    reviewTaskId?: string,
  ) => {
    onStartFocus({
      id: lesson.id,
      title: lesson.title,
      xp: lesson.xp,
      isCompleted: reviewTaskId ? false : Boolean(state.completedLessons[lesson.id]),
      initialMinutes: minutes,
      targetMinutes: lesson.plannedDurationMinutes,
      reviewTaskId,
      reviewTargetMinutes: reviewTaskId ? minutes : undefined,
    });
  };

  const openManualEntry = (
    lesson: { id: string; title: string },
    estimatedMinutes: number,
    reviewTaskId?: string,
  ) => {
    setManualEntry({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      estimatedMinutes,
      reviewTaskId,
    });
  };

  if (workspaceLessonCount === 0) {
    return (
      <section id="today-panel-root" className="min-w-0 space-y-5">
        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-slate-900">Hôm nay</h2>
            <p className="mt-0.5 text-sm text-slate-500">{displayDate(today)}</p>
          </div>
          <StudyStreakBadge streak={studyStreak} />
        </div>
        <section className="rounded-2xl border border-dashed border-sky-300 bg-sky-50/70 p-5">
          <h3 className="font-serif text-xl font-semibold text-slate-900">
            Không gian học tập đang trống
          </h3>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Thêm bài học đầu tiên hoặc nhập lộ trình để hệ thống tạo kế hoạch theo quỹ giờ của bạn.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {onSubjectsUpdated && (
              <AddLessonModal
                currentSubjects={subjects}
                onSubjectsUpdated={onSubjectsUpdated}
                trigger={
                  <button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-emerald-700">
                    <Play className="h-4 w-4" /> Thêm bài đầu tiên
                  </button>
                }
              />
            )}
            <button
              type="button"
              onClick={onOpenRoadmapImport}
              className="inline-flex min-h-11 items-center rounded-xl border border-sky-300 bg-white px-4 py-2 text-sm font-semibold text-sky-800 transition hover:bg-sky-50"
            >
              Nhập lộ trình
            </button>
          </div>
        </section>
      </section>
    );
  }

  return (
    <section id="today-panel-root" className="min-w-0 space-y-6">
      {/* Widget Tổng quan Hôm nay (Ghép Header, Thống kê, Tiến độ & Ưu tiên tiếp theo vào 1 Card duy nhất) */}
      <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-5">
        {/* Hàng 1: Header & Quỹ giờ */}
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-serif text-2xl font-bold text-slate-900">Hôm nay</h2>
            <p className="mt-0.5 text-sm text-slate-500">{displayDate(today)}</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full xl:w-auto xl:max-w-3xl">
            <StudyStreakBadge streak={studyStreak} />

            <div className="grid w-full gap-2 rounded-xl border border-sky-100 bg-sky-50/60 p-2.5 sm:grid-cols-[auto_minmax(150px,1fr)_72px] sm:items-center flex-1">
              <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <Clock className="h-4 w-4 text-sky-600" /> Quỹ giờ hôm nay
              </span>
              <Slider
                value={[state.plannerSettings.todayHours]}
                min={MIN_DAILY_STUDY_HOURS}
                max={MAX_DAILY_STUDY_HOURS}
                step={DAILY_STUDY_HOURS_STEP}
                onValueChange={([value]) => onSetTodayHours(normalizeDailyStudyHours(value))}
              />
              <Input
                type="number"
                aria-label="Số giờ học hôm nay"
                min={MIN_DAILY_STUDY_HOURS}
                max={MAX_DAILY_STUDY_HOURS}
                step={DAILY_STUDY_HOURS_STEP}
                value={state.plannerSettings.todayHours}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (Number.isFinite(value)) onSetTodayHours(normalizeDailyStudyHours(value));
                }}
                className="h-9 bg-white text-xs sm:text-sm font-bold text-slate-800"
              />
              <HighStudyHoursNote
                hours={state.plannerSettings.todayHours}
                className="sm:col-span-3"
              />
            </div>
          </div>
        </div>

        {/* Hàng 2: Thống kê chỉ số (4 KPIs) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard
            icon={CheckCircle2}
            iconBg="bg-emerald-50 text-emerald-600 border border-emerald-200/60"
            label="Hoàn thành hôm nay"
            value={completedTodayTasks}
          />
          <KpiCard
            icon={BookOpen}
            iconBg="bg-sky-50 text-sky-600 border border-sky-200/60"
            label="Bài mới trong quỹ"
            value={queue.newLessons.filter((lesson) => !state.completedLessons[lesson.id]).length}
          />
          <KpiCard
            icon={Clock}
            iconBg="bg-amber-50 text-amber-600 border border-amber-200/60"
            label="Bài ôn đến hạn"
            value={queue.reviewLessons.length}
          />
          <KpiCard
            icon={Target}
            iconBg="bg-indigo-50 text-indigo-600 border border-indigo-200/60"
            label="Còn lại toàn lộ trình"
            value={remainingIds.length}
          />
        </div>

        {/* Hàng 3: Tiến độ bài học hôm nay (Progress Bar) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Tiến độ bài học hôm nay
            </span>
            <span className="text-emerald-700 font-bold">
              {progressPercent}% ({completedTodayTasks}/{totalTodayQueue} bài)
            </span>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Tiến độ bài học hôm nay"
            aria-valuemin={MIN_DAILY_STUDY_HOURS}
            aria-valuemax={Math.max(totalTodayQueue, 1)}
            aria-valuenow={completedTodayTasks}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Hàng 4: Block Ưu tiên tiếp theo (Đặt dưới Tiến độ bài học) */}
        <div className="pt-1">
          <section className="rounded-xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-sky-50/40 p-3.5 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  Ưu tiên tiếp theo
                </div>
                {prioritizedLesson ? (
                  <>
                    <h3 className="break-words font-serif text-lg sm:text-xl font-bold text-slate-900">
                      {prioritizedLesson.lesson.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700">
                      {prioritizedLesson.placementReason.description} Dự kiến{" "}
                      <strong className="font-semibold text-emerald-800">
                        {prioritizedLesson.minutes} phút
                      </strong>
                      .
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                      Đã xử lý hết hàng đợi hôm nay! 🎉
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700">
                      Điều chỉnh quỹ giờ hoặc mở kế hoạch để xem các bài tiếp theo.
                    </p>
                  </>
                )}
              </div>
              {prioritizedLesson && (
                <div className="shrink-0 self-start sm:self-center">
                  <LessonActionMenu
                    tone="emerald"
                    completedMinutes={getLessonCompletedMinutes(prioritizedLesson.lesson.id, state)}
                    remainingMinutes={Math.max(
                      0,
                      (prioritizedLesson.lesson.plannedDurationMinutes ?? 120) -
                        getLessonCompletedMinutes(prioritizedLesson.lesson.id, state),
                    )}
                    onStart={(minutes) =>
                      openTimer(prioritizedLesson.lesson, minutes, prioritizedLesson.reviewTaskId)
                    }
                    onManualEntry={() =>
                      openManualEntry(
                        prioritizedLesson.lesson,
                        prioritizedLesson.minutes,
                        prioritizedLesson.reviewTaskId,
                      )
                    }
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* 2-column layout for Desktop: Left column (Lessons Widget) ~70%, Right column (Habits Widget) ~30% */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Cột trái: Widget Danh sách bài học duy nhất */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-5">
            {/* Header Widget */}
            <div className="flex flex-col gap-3 pb-3 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                  Danh sách bài học
                </h2>
                <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-600 border border-sky-200/60">
                  {sortedNewLessons.length + queue.reviewLessons.length} bài
                </span>
              </div>
              {onSubjectsUpdated && (
                <div className="shrink-0">
                  <AddLessonModal
                    currentSubjects={subjects}
                    onSubjectsUpdated={onSubjectsUpdated}
                  />
                </div>
              )}
            </div>

            {/* Phân đoạn 1: Bài mới */}
            <LessonSubSection
              title="Bài mới"
              count={sortedNewLessons.length}
              empty="Quỹ giờ hiện tại chưa phân bổ bài mới."
            >
              {sortedNewLessons.map((lesson) => {
                const position = findLessonPosition(subjects, lesson.id);
                const estimated = estimateLessonMinutes(lesson.id, state.studyMeta, subjects);
                const topic =
                  lesson.topic ||
                  (position?.milestone !== "Toàn bộ bài học" ? position?.milestone : undefined);
                const completedMins = getLessonCompletedMinutes(lesson.id, state);
                const placementReason = deriveLessonPlacementReason({
                  lesson,
                  assignedDateISO: today,
                });
                return (
                  <TodayLessonCard
                    key={lesson.id}
                    lesson={lesson}
                    done={Boolean(state.completedLessons[lesson.id])}
                    estimatedMinutes={estimated}
                    completedMinutes={completedMins}
                    plannedMinutes={lesson.plannedDurationMinutes ?? 120}
                    subjectLabel={`${position?.subject.emoji ?? "📚"} ${position?.subject.name ?? lesson.sourceSubject}`}
                    topicLabel={topic}
                    placementReason={placementReason}
                    onToggle={() => onToggleLesson(lesson.id, lesson.xp)}
                    onStart={(minutes) => openTimer(lesson, minutes)}
                    onManualEntry={() => openManualEntry(lesson, estimated)}
                  />
                );
              })}
            </LessonSubSection>

            {/* Đường phân cách giữa 2 phân đoạn */}
            <hr className="border-slate-100" />

            {/* Phân đoạn 2: Ôn tập đến hạn */}
            <LessonSubSection
              title="Ôn tập đến hạn"
              count={queue.reviewLessons.length}
              empty="Không có bài ôn đến hạn hôm nay."
            >
              {queue.reviewLessons.map((review) => {
                const lesson = findLessonById(review.lessonId, subjects);
                if (!lesson) return null;
                const position = findLessonPosition(subjects, lesson.id);
                const topic =
                  lesson.topic ||
                  (position?.milestone !== "Toàn bộ bài học" ? position?.milestone : undefined);
                const completedMins = getLessonCompletedMinutes(lesson.id, state);
                const placementReason = deriveReviewPlacementReason({ ageDays: review.ageDays });
                return (
                  <TodayLessonCard
                    key={lesson.id}
                    lesson={lesson}
                    done={review.completed}
                    estimatedMinutes={review.minutes}
                    completedMinutes={completedMins}
                    plannedMinutes={lesson.plannedDurationMinutes ?? 120}
                    reviewAgeDays={review.ageDays}
                    subjectLabel={`${position?.subject.emoji ?? "📚"} ${position?.subject.name ?? lesson.sourceSubject}`}
                    topicLabel={topic}
                    placementReason={placementReason}
                    onToggle={() => onToggleReview(lesson.id, today)}
                    onStart={(minutes) => openTimer(lesson, minutes, review.taskId)}
                    onManualEntry={() => openManualEntry(lesson, review.minutes, review.taskId)}
                  />
                );
              })}
            </LessonSubSection>
          </div>
        </div>

        {/* Cột phải: Widget Thói quen */}
        {habitSidebar && (
          <div className="lg:col-span-4 lg:sticky lg:top-4 self-start">{habitSidebar}</div>
        )}
      </div>

      <ManualStudyDialog
        request={manualEntry}
        onClose={() => setManualEntry(null)}
        onAddStudySession={onAddStudySession}
        onReviewComplete={onCompleteReview}
      />
    </section>
  );
}

function LessonSubSection({
  title,
  count,
  empty,
  children,
}: {
  title: string;
  count: number;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-sky-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">{title}</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 border border-slate-200/60">
          {count}
        </span>
      </div>
      {count > 0 ? (
        <ul className="grid gap-2">{children}</ul>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 p-3.5 text-center text-xs text-slate-500">
          {empty}
        </div>
      )}
    </div>
  );
}

function KpiCard({
  icon: Icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ElementType;
  iconBg: string;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50/80 p-3 border border-slate-100/80">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", iconBg)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-slate-900 leading-none">{value}</p>
        <p className="mt-1 text-[11px] font-medium leading-tight text-slate-500">{label}</p>
      </div>
    </div>
  );
}
