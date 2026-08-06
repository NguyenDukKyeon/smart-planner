import { useMemo, useState } from "react";
import { CheckCircle2, Clock, Play } from "lucide-react";
import { displayDate, weekdayFullVi } from "@/lib/date-utils";
import { SUBJECTS, type Subject } from "@/lib/mock-data";
import {
  buildCanonicalRoadmap,
  buildRoadmapProjection,
  type RoadmapLessonItem,
  type RoadmapProjectionGroup,
  type RoadmapViewMode,
} from "@/lib/roadmap-views";
import { sortSubjects } from "@/lib/subject-order";
import { cn } from "@/lib/utils";
import { AddLessonModal } from "./AddLessonModal";

type Props = {
  completed: Record<string, string>;
  onToggleLesson: (lessonId: string, xp: number) => void;
  shiftedDates?: Record<string, string>;
  subjects?: Subject[];
  onSubjectsUpdated?: (subjects: Subject[]) => void;
};

const STATUS_LABEL: Record<RoadmapLessonItem["status"], string> = {
  completed: "Đã hoàn thành",
  projected: "Trong lịch dự kiến",
  "outside-horizon": "Ngoài phạm vi đang xem",
  "unplaced-fixed": "Cố định chưa xếp được",
  unscheduled: "Chưa xếp lịch",
};

export function LearningRoadmap({
  completed,
  onToggleLesson,
  shiftedDates = {},
  subjects = SUBJECTS,
  onSubjectsUpdated,
}: Props) {
  const [subjectId, setSubjectId] = useState<string>("all");
  const [viewMode, setViewMode] = useState<RoadmapViewMode>("projection");
  const [openId, setOpenId] = useState<string | null>(null);

  const sortedSubjects = useMemo(() => sortSubjects(subjects), [subjects]);
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

  const activeLessons = useMemo(() => {
    const selectedSubject = sortedSubjects.find((subject) => subject.id === subjectId);
    const selectedSubjects =
      subjectId === "all" || !selectedSubject ? sortedSubjects : [selectedSubject];
    return selectedSubjects.flatMap((subject) =>
      subject.milestones.flatMap((milestone) => milestone.lessons),
    );
  }, [sortedSubjects, subjectId]);

  const projectionGroups = useMemo(
    () =>
      buildRoadmapProjection({
        subjects,
        completed,
        shiftedDates,
        selectedSubjectId: subjectId,
      }),
    [completed, shiftedDates, subjectId, subjects],
  );

  const canonicalGroups = useMemo(
    () =>
      buildCanonicalRoadmap({
        subjects,
        completed,
        shiftedDates,
        selectedSubjectId: subjectId,
      }),
    [completed, shiftedDates, subjectId, subjects],
  );

  const activeProjectionId = useMemo(() => {
    const uncompleted = projectionGroups.find((group) => !group.isComplete);
    return uncompleted?.id ?? projectionGroups.at(-1)?.id ?? "";
  }, [projectionGroups]);

  const currentOpenId =
    openId && projectionGroups.some((group) => group.id === openId) ? openId : activeProjectionId;
  const currentProjection =
    projectionGroups.find((group) => group.id === currentOpenId) ?? projectionGroups[0];

  const totalCount = activeLessons.length;
  const completedCount = activeLessons.filter((lesson) => completed[lesson.id]).length;
  const remainingCount = totalCount - completedCount;

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-slate-900 sm:text-2xl">Lộ trình</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
            {viewMode === "projection"
              ? "Lịch dự kiến thay đổi theo quỹ giờ và các bài đã hoàn thành. Xem Lịch linh hoạt để chỉnh từng ngày."
              : "Thứ tự nội dung luôn giữ nguyên theo môn, chủ đề và bài học, không phụ thuộc quỹ giờ."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onSubjectsUpdated && (
            <AddLessonModal currentSubjects={subjects} onSubjectsUpdated={onSubjectsUpdated} />
          )}
          <div
            className="inline-flex rounded-xl bg-slate-100 p-1"
            role="group"
            aria-label="Chế độ xem lộ trình"
          >
            <button
              type="button"
              aria-pressed={viewMode === "projection"}
              onClick={() => setViewMode("projection")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                viewMode === "projection"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              Theo lịch dự kiến
            </button>
            <button
              type="button"
              aria-pressed={viewMode === "canonical"}
              onClick={() => setViewMode("canonical")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                viewMode === "canonical"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              Theo thứ tự
            </button>
          </div>
        </div>
      </div>

      <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
        {subjectTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={tab.id === subjectId}
            onClick={() => {
              setSubjectId(tab.id);
              setOpenId(null);
            }}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-1 text-xs font-semibold transition-all",
              tab.id === subjectId
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800",
            )}
          >
            <span className="mr-1" aria-hidden="true">
              {tab.emoji}
            </span>
            {tab.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-center">
        <div>
          <div className="text-base font-bold text-slate-900 sm:text-lg">{totalCount}</div>
          <div className="text-[11px] font-medium text-slate-500">
            Tổng bài {subjectId === "all" ? `(${sortedSubjects.length} môn)` : ""}
          </div>
        </div>
        <div>
          <div className="text-base font-bold text-emerald-700 sm:text-lg">{completedCount}</div>
          <div className="text-[11px] font-medium text-slate-500">Đã học</div>
        </div>
        <div>
          <div className="text-base font-bold text-amber-700 sm:text-lg">{remainingCount}</div>
          <div className="text-[11px] font-medium text-slate-500">Còn lại</div>
        </div>
      </div>

      {viewMode === "projection" ? (
        projectionGroups.length > 0 ? (
          <>
            <RoadmapPath
              groups={projectionGroups}
              activeId={activeProjectionId}
              openId={currentOpenId}
              onOpen={setOpenId}
            />
            {currentProjection && (
              <ProjectionPanel
                group={currentProjection}
                completed={completed}
                onToggleLesson={onToggleLesson}
                showSubject={subjectId === "all"}
              />
            )}
          </>
        ) : (
          <RoadmapEmptyState />
        )
      ) : canonicalGroups.length > 0 ? (
        <CanonicalRoadmap
          groups={canonicalGroups}
          completed={completed}
          onToggleLesson={onToggleLesson}
          showSubjectHeadings={subjectId === "all"}
        />
      ) : (
        <RoadmapEmptyState />
      )}
    </section>
  );
}

function RoadmapPath({
  groups,
  activeId,
  openId,
  onOpen,
}: {
  groups: RoadmapProjectionGroup[];
  activeId: string;
  openId: string;
  onOpen: (id: string) => void;
}) {
  return (
    <div
      className="scrollbar-none relative min-w-0 overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-50/50 p-2 sm:p-2.5"
      role="region"
      aria-label="Các tuần trong lịch dự kiến"
      tabIndex={0}
    >
      <div className="relative flex min-w-max items-center gap-1.5">
        {groups.map((group, index) => {
          const isOpen = openId === group.id;
          const isActive = activeId === group.id;
          return (
            <div key={group.id} className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOpen(group.id)}
                className={cn(
                  "group flex shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
                  isOpen
                    ? "bg-slate-900 text-white shadow-xs"
                    : group.isComplete
                      ? "border border-emerald-200/90 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80"
                      : isActive
                        ? "bg-emerald-600 font-bold text-white shadow-xs ring-2 ring-emerald-600/20"
                        : "border border-dashed border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50",
                )}
              >
                {group.isComplete ? (
                  <CheckCircle2
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      isOpen ? "text-emerald-300" : "text-emerald-600",
                    )}
                  />
                ) : isActive ? (
                  <Play className="h-3.5 w-3.5 shrink-0 fill-current" />
                ) : (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-slate-300 group-hover:bg-slate-400" />
                )}
                <span className="truncate">{group.title}</span>
                <span
                  className={cn(
                    "shrink-0 text-[10px] font-normal",
                    isOpen || isActive ? "text-white/80" : "text-slate-500",
                  )}
                >
                  ({group.doneCount}/{group.totalCount})
                </span>
              </button>
              {index < groups.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-4 shrink-0 rounded-full transition-colors sm:w-6",
                    group.isComplete ? "bg-emerald-400" : "bg-slate-200",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectionPanel({
  group,
  completed,
  onToggleLesson,
  showSubject,
}: {
  group: RoadmapProjectionGroup;
  completed: Record<string, string>;
  onToggleLesson: (lessonId: string, xp: number) => void;
  showSubject: boolean;
}) {
  const percentage = group.totalCount > 0 ? (group.doneCount / group.totalCount) * 100 : 0;

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg font-bold text-slate-900 sm:text-xl">{group.title}</h3>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{group.subtitle}</p>
        </div>
        <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-emerald-700">
          {group.doneCount}/{group.totalCount} bài
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <ul className="grid gap-2.5 pt-1 sm:grid-cols-2">
        {group.items.map((item) => (
          <li key={item.lesson.id}>
            <RoadmapLessonButton
              item={item}
              completed={completed}
              onToggleLesson={onToggleLesson}
              showSubject={showSubject}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function CanonicalRoadmap({
  groups,
  completed,
  onToggleLesson,
  showSubjectHeadings,
}: {
  groups: ReturnType<typeof buildCanonicalRoadmap>;
  completed: Record<string, string>;
  onToggleLesson: (lessonId: string, xp: number) => void;
  showSubjectHeadings: boolean;
}) {
  return (
    <div className="space-y-4" aria-label="Thứ tự nội dung lộ trình">
      {groups.map((subject) => {
        const headingId = `roadmap-subject-${subject.subjectId}`;
        return (
          <section
            key={subject.subjectId}
            className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/40 p-4"
            aria-labelledby={showSubjectHeadings ? headingId : undefined}
            aria-label={showSubjectHeadings ? undefined : subject.subjectName}
          >
            {showSubjectHeadings && (
              <h3 id={headingId} className="font-serif text-lg font-bold text-slate-900">
                <span aria-hidden="true">{subject.subjectEmoji}</span> {subject.subjectName}
              </h3>
            )}

            {subject.milestones.map((milestone) => (
              <section
                key={milestone.milestoneId}
                className="space-y-2"
                aria-labelledby={`roadmap-milestone-${subject.subjectId}-${milestone.milestoneId}`}
              >
                <h4
                  id={`roadmap-milestone-${subject.subjectId}-${milestone.milestoneId}`}
                  className="text-sm font-bold text-slate-800"
                >
                  {milestone.milestoneTitle}
                </h4>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {milestone.items.map((item) => (
                    <li key={item.lesson.id}>
                      <RoadmapLessonButton
                        item={item}
                        completed={completed}
                        onToggleLesson={onToggleLesson}
                        showSubject={false}
                        showStatus
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </section>
        );
      })}
    </div>
  );
}

function RoadmapLessonButton({
  item,
  completed,
  onToggleLesson,
  showSubject,
  showStatus = false,
}: {
  item: RoadmapLessonItem;
  completed: Record<string, string>;
  onToggleLesson: (lessonId: string, xp: number) => void;
  showSubject: boolean;
  showStatus?: boolean;
}) {
  const isDone = Boolean(completed[item.lesson.id]);
  const scheduleCopy =
    item.status === "unplaced-fixed"
      ? "Không đủ quỹ giờ trong ngày cố định"
      : item.effectiveDate
        ? `${weekdayFullVi(item.effectiveDate)} · ${displayDate(item.effectiveDate)}`
        : "Chưa xếp ngày";

  return (
    <button
      type="button"
      onClick={() => onToggleLesson(item.lesson.id, item.lesson.xp)}
      className={cn(
        "group flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all hover:border-emerald-400",
        isDone
          ? "border-emerald-200/80 bg-emerald-50/30 text-slate-700"
          : "border-slate-200/80 bg-white text-slate-900",
      )}
    >
      <div className="mt-0.5 shrink-0">
        <CheckCircle2
          className={cn(
            "h-4 w-4 transition-transform",
            isDone ? "scale-110 text-emerald-600" : "text-slate-300 group-hover:text-emerald-400",
          )}
        />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {showSubject && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
              {item.subjectEmoji} {item.subjectName}
            </span>
          )}
          {item.lesson.topic && (
            <span className="rounded border border-purple-100 bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700">
              {item.lesson.topic}
            </span>
          )}
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
            <Clock className="mr-0.5 inline h-2.5 w-2.5" />
            {item.lesson.plannedDurationMinutes}p
          </span>
          {showStatus && (
            <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
              {STATUS_LABEL[item.status]}
            </span>
          )}
        </div>

        <div
          className={cn(
            "break-words text-xs font-semibold leading-snug",
            isDone && "text-slate-400 line-through",
          )}
        >
          {item.lesson.title}
        </div>

        <div className="text-[11px] text-slate-500">
          {scheduleCopy}
          <span className="ml-2 font-medium text-slate-400">+{item.lesson.xp} XP</span>
        </div>
      </div>
    </button>
  );
}

function RoadmapEmptyState() {
  return <div className="py-8 text-center text-sm text-slate-500">Không có bài học nào.</div>;
}
