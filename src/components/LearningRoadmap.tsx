import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Clock, Play, Sparkles, Trophy } from "lucide-react";
import { SUBJECTS, type Subject, type Lesson } from "@/lib/mock-data";
import { displayDate, getMondayISO, getSundayISO, weekdayFullVi } from "@/lib/date-utils";
import { sortSubjects, getSubjectPriority } from "@/lib/subject-order";
import { DuotoneIcon } from "./DuotoneIcon";
import { AddLessonModal } from "./AddLessonModal";
import { cn } from "@/lib/utils";

type Props = {
  completed: Record<string, string>;
  onToggleLesson: (lessonId: string, xp: number) => void;
  shiftedDates?: Record<string, string>;
  subjects?: Subject[];
  onSubjectsUpdated?: (subjects: Subject[]) => void;
};

const SUBJECT_TONE: Record<string, "blue" | "green" | "amber" | "coral"> = {
  all: "coral",
  toan: "blue",
  ly: "green",
  hoa: "amber",
};

const SUBJECT_EMOJI: Record<string, string> = {
  toan: "📐",
  ly: "⚛️",
  hoa: "🧪",
};

function resolveSubjectEmoji(subjKey: string, sourceSubject?: string): string {
  if (SUBJECT_EMOJI[subjKey]) return SUBJECT_EMOJI[subjKey];
  const src = (sourceSubject || "").toLowerCase();
  if (src.includes("toán") || src.includes("math")) return "📐";
  if (src.includes("lý") || src.includes("ly") || src.includes("phys")) return "⚛️";
  if (src.includes("hóa") || src.includes("hoa") || src.includes("chem")) return "🧪";
  return "📚";
}

const SUBJECT_LABEL: Record<string, string> = {
  toan: "Toán",
  ly: "Vật lý",
  hoa: "Hóa học",
};

export type DynamicMilestone = {
  id: string;
  title: string;
  subtitle: string;
  mondayISO: string;
  sundayISO: string;
  lessons: (Lesson & { effectiveDate: string })[];
  doneCount: number;
  totalCount: number;
  isComplete: boolean;
};

export function LearningRoadmap({
  completed,
  onToggleLesson,
  shiftedDates = {},
  subjects = SUBJECTS,
  onSubjectsUpdated,
}: Props) {
  const [subjectId, setSubjectId] = useState<string>("all");

  const sortedSubjects = useMemo(() => sortSubjects(subjects), [subjects]);

  const tabs = useMemo(() => {
    return [
      { id: "all", name: "Tất cả môn", emoji: "🌟" },
      ...sortedSubjects.map((s) => ({ id: s.id, name: s.name, emoji: s.emoji })),
    ];
  }, [sortedSubjects]);

  const allLessonsFromSubjects = useMemo(() => {
    return sortedSubjects.flatMap((s) => s.milestones.flatMap((m) => m.lessons));
  }, [sortedSubjects]);

  const activeLessons = useMemo(() => {
    if (subjectId === "all") return allLessonsFromSubjects;
    const s = sortedSubjects.find((item) => item.id === subjectId);
    return s ? s.milestones.flatMap((m) => m.lessons) : allLessonsFromSubjects;
  }, [subjectId, sortedSubjects, allLessonsFromSubjects]);

  const dynamicMilestones = useMemo<DynamicMilestone[]>(() => {
    // “Lộ trình” phản ánh ngày người dùng đã đặt. Việc tự dời bài theo
    // công suất chỉ thuộc tab “Lịch điều chỉnh”, không được thay đổi tuần gốc.
    const lessonsWithDate = activeLessons.map((lesson) => {
      const mode = lesson.scheduleMode ?? "flexible";
      const effectiveDate = completed[lesson.id]
        ? completed[lesson.id]
        : mode === "fixed"
          ? (shiftedDates[lesson.id] ?? "unplaced-fixed")
          : (shiftedDates[lesson.id] ?? lesson.scheduledDate);
      return { ...lesson, effectiveDate };
    });

    const groups = new Map<string, (Lesson & { effectiveDate: string })[]>();
    for (const l of lessonsWithDate) {
      const mon =
        l.effectiveDate === "unplaced-fixed"
          ? "unplaced-fixed"
          : l.effectiveDate
            ? getMondayISO(l.effectiveDate)
            : "unscheduled";
      if (!groups.has(mon)) groups.set(mon, []);
      groups.get(mon)!.push(l);
    }

    const sortedMondays = [...groups.keys()].sort((a, b) => {
      const specialRank = (value: string) =>
        value === "unplaced-fixed" ? 1 : value === "unscheduled" ? 2 : 0;
      const rankDifference = specialRank(a) - specialRank(b);
      if (rankDifference !== 0) return rankDifference;
      return a.localeCompare(b);
    });

    return sortedMondays.map((mon, index) => {
      const sun = mon === "unscheduled" ? "" : getSundayISO(mon);
      const list = groups.get(mon)!;
      list.sort(
        (a, b) =>
          a.effectiveDate.localeCompare(b.effectiveDate) ||
          getSubjectPriority(a.sourceSubject) - getSubjectPriority(b.sourceSubject) ||
          allLessonsFromSubjects.findIndex((x) => x.id === a.id) -
            allLessonsFromSubjects.findIndex((x) => x.id === b.id),
      );
      const doneCount = list.filter((l) => completed[l.id]).length;
      const totalCount = list.length;
      const isComplete = totalCount > 0 && doneCount === totalCount;

      if (mon === "unplaced-fixed") {
        return {
          id: "week-unplaced-fixed",
          title: "Chưa xếp được",
          subtitle: `${totalCount} bài cố định vượt quỹ giờ · không tự dời ngày`,
          mondayISO: "",
          sundayISO: "",
          lessons: list,
          doneCount,
          totalCount,
          isComplete,
        };
      }

      if (mon === "unscheduled") {
        return {
          id: "week-unscheduled",
          title: "Kho bài chưa xếp lịch",
          subtitle: `${totalCount} bài · chưa tham gia kế hoạch tự động`,
          mondayISO: "",
          sundayISO: "",
          lessons: list,
          doneCount,
          totalCount,
          isComplete,
        };
      }

      const minDate = list[0]?.effectiveDate ?? mon;
      const startDate = minDate;
      const endDate = sun;

      return {
        id: `week-${mon}`,
        title: `Tuần ${index + 1}`,
        subtitle: `${displayDate(startDate)} – ${displayDate(endDate)} · ${totalCount} bài`,
        mondayISO: mon,
        sundayISO: sun,
        lessons: list,
        doneCount,
        totalCount,
        isComplete,
      };
    });
  }, [activeLessons, allLessonsFromSubjects, completed, shiftedDates]);

  const activeMilestoneId = useMemo(() => {
    const uncompleted = dynamicMilestones.find((m) => !m.isComplete);
    return uncompleted?.id ?? dynamicMilestones.at(-1)?.id ?? "";
  }, [dynamicMilestones]);

  const [openId, setOpenId] = useState<string | null>(null);

  const currentOpenId =
    openId && dynamicMilestones.some((m) => m.id === openId) ? openId : activeMilestoneId;

  const currentMilestone =
    dynamicMilestones.find((m) => m.id === currentOpenId) ?? dynamicMilestones[0];

  const tone = SUBJECT_TONE[subjectId] ?? "coral";
  const totalCount = activeLessons.length;
  const completedCount = activeLessons.filter((l) => completed[l.id]).length;
  const remainingCount = totalCount - completedCount;

  const overallRange = useMemo(() => {
    const datedMilestones = dynamicMilestones.filter((milestone) => milestone.mondayISO);
    if (!datedMilestones.length) return { start: "", end: "", weeks: 0 };
    const firstLessonDate = datedMilestones[0].lessons[0]?.effectiveDate;
    return {
      start: firstLessonDate ?? datedMilestones[0].mondayISO,
      end: datedMilestones.at(-1)!.sundayISO,
      weeks: datedMilestones.length,
    };
  }, [dynamicMilestones]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">Lộ trình</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onSubjectsUpdated && (
            <AddLessonModal currentSubjects={subjects} onSubjectsUpdated={onSubjectsUpdated} />
          )}
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1 overflow-x-auto max-w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
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
                <span className="mr-1">{tab.emoji}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-center">
        <div>
          <div className="text-base sm:text-lg font-bold text-slate-900">{totalCount}</div>
          <div className="text-[11px] font-medium text-slate-500">
            Tổng bài {subjectId === "all" ? `(${sortedSubjects.length} môn)` : ""}
          </div>
        </div>
        <div>
          <div className="text-base sm:text-lg font-bold text-emerald-700">{completedCount}</div>
          <div className="text-[11px] font-medium text-slate-500">Đã học</div>
        </div>
        <div>
          <div className="text-base sm:text-lg font-bold text-amber-700">{remainingCount}</div>
          <div className="text-[11px] font-medium text-slate-500">Còn lại</div>
        </div>
      </div>

      {dynamicMilestones.length > 0 ? (
        <>
          <RoadmapPath
            milestones={dynamicMilestones}
            activeId={activeMilestoneId}
            openId={currentOpenId}
            onOpen={setOpenId}
            tone={tone}
          />

          {currentMilestone && (
            <MilestonePanel
              milestone={currentMilestone}
              completed={completed}
              onToggleLesson={onToggleLesson}
              tone={tone}
              isAllSubjects={subjectId === "all"}
            />
          )}
        </>
      ) : (
        <div className="py-8 text-center text-sm text-slate-500">Không có bài học nào.</div>
      )}
    </section>
  );
}

function RoadmapPath({
  milestones,
  activeId,
  openId,
  onOpen,
}: {
  milestones: DynamicMilestone[];
  activeId: string;
  openId: string;
  onOpen: (id: string) => void;
  tone: "blue" | "green" | "amber" | "coral";
}) {
  return (
    <div
      className="relative min-w-0 overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-50/50 p-2 sm:p-2.5 scrollbar-none"
      role="region"
      aria-label="Các tuần trong lộ trình"
      tabIndex={0}
    >
      <div className="relative flex items-center gap-1.5 min-w-max">
        {milestones.map((m, i) => {
          const isOpen = openId === m.id;
          const isActive = activeId === m.id;
          return (
            <div key={m.id} className="flex items-center gap-1.5">
              <button
                onClick={() => onOpen(m.id)}
                className={cn(
                  "group flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
                  isOpen
                    ? "bg-slate-900 text-white shadow-xs"
                    : m.isComplete
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200/90 hover:bg-emerald-100/80"
                      : isActive
                        ? "bg-emerald-600 text-white font-bold shadow-xs ring-2 ring-emerald-600/20"
                        : "bg-white text-slate-600 border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50",
                )}
              >
                {m.isComplete ? (
                  <CheckCircle2
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      isOpen ? "text-emerald-300" : "text-emerald-600",
                    )}
                  />
                ) : isActive ? (
                  <Play className="h-3.5 w-3.5 shrink-0 fill-current" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-slate-300 group-hover:bg-slate-400 shrink-0" />
                )}
                <span className="truncate">{m.title}</span>
                <span
                  className={cn(
                    "text-[10px] font-normal shrink-0",
                    isOpen || isActive ? "text-white/80" : "text-slate-500",
                  )}
                >
                  ({m.doneCount}/{m.totalCount})
                </span>
              </button>
              {i < milestones.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-4 sm:w-6 shrink-0 rounded-full transition-colors",
                    m.isComplete ? "bg-emerald-400" : "bg-slate-200",
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

function MilestonePanel({
  milestone,
  completed,
  onToggleLesson,
  isAllSubjects,
}: {
  milestone: DynamicMilestone;
  completed: Record<string, string>;
  onToggleLesson: (lessonId: string, xp: number) => void;
  tone: "blue" | "green" | "amber" | "coral";
  isAllSubjects?: boolean;
}) {
  const pct = milestone.totalCount > 0 ? (milestone.doneCount / milestone.totalCount) * 100 : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
            {milestone.title}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{milestone.subtitle}</p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-emerald-700 shrink-0">
          {milestone.doneCount}/{milestone.totalCount} bài
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="grid gap-2.5 sm:grid-cols-2 pt-1">
        {milestone.lessons.map((l) => {
          const isDone = !!completed[l.id];

          const subjKey = l.id.split("-")[0];
          const subjEmoji = resolveSubjectEmoji(subjKey, l.sourceSubject);
          const subjName = SUBJECT_LABEL[subjKey] ?? l.sourceSubject;

          return (
            <li key={l.id}>
              <button
                onClick={() => onToggleLesson(l.id, l.xp)}
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
                      isDone
                        ? "text-emerald-600 scale-110"
                        : "text-slate-300 group-hover:text-emerald-400",
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(isAllSubjects || subjKey) && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                        {subjEmoji} {subjName}
                      </span>
                    )}
                    {l.topic && (
                      <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-100">
                        {l.topic}
                      </span>
                    )}
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                      <Clock className="inline h-2.5 w-2.5 mr-0.5" />
                      {l.plannedDurationMinutes}p
                    </span>
                  </div>

                  <div
                    className={cn(
                      "text-xs font-semibold leading-snug break-words",
                      isDone && "text-slate-400 line-through",
                    )}
                  >
                    {l.title}
                  </div>

                  <div className="text-[11px] text-slate-500">
                    {l.effectiveDate === "unplaced-fixed"
                      ? "Không đủ quỹ giờ trong ngày cố định"
                      : l.effectiveDate
                        ? `${weekdayFullVi(l.effectiveDate)} · ${displayDate(l.effectiveDate)}`
                        : "Chưa xếp ngày"}
                    <span className="ml-2 font-medium text-slate-400">+{l.xp} XP</span>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
