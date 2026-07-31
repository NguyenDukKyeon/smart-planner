import { createFileRoute } from "@tanstack/react-router";
import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { LearningRoadmap } from "@/components/LearningRoadmap";
import { HabitSidebar } from "@/components/HabitSidebar";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { RemindersCard } from "@/components/RemindersCard";
import { TodayPanel } from "@/components/TodayPanel";
import { FlexiblePlanner } from "@/components/FlexiblePlanner";
import { ForecastCard } from "@/components/ForecastCard";
import { WeeklyStudySummary } from "@/components/WeeklyStudySummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createInitialProgressState,
  migrateProgressState,
  PROGRESS_BACKUP_KEY,
  PROGRESS_STORAGE_KEY,
  useProgress,
  todayISO,
  computeStudyStreak,
  getLevelFromXp,
  type HabitEntry,
} from "@/lib/progress-store";
import { SUBJECTS, type Subject } from "@/lib/mock-data";
import { buildShiftedSchedule } from "@/lib/planner";
import {
  ARCHIVED_CATALOG_KEY,
  CUSTOM_SUBJECTS_BACKUP_KEY,
  CUSTOM_SUBJECTS_KEY,
  getStoredCustomSubjects,
  normalizeSubjects,
  saveCatalogBackup,
  saveStoredCustomSubjects,
  type CatalogUpdateOptions,
  type CatalogUpdateResult,
} from "@/lib/custom-subjects";
import { addDaysISO } from "@/lib/date-utils";
import { selectWeeklyMetrics } from "@/lib/weekly-metrics";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { FocusTimerModal } from "@/components/FocusTimerModal";
import { CourseManagerModal } from "@/components/CourseManagerModal";
import { LevelUpDialog } from "@/components/LevelUpDialog";
import { findLessonById } from "@/lib/planner";
import { StorageRecoveryPanel, type StorageRecoveryIssue } from "@/components/StorageRecoveryPanel";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { getPushPreferences } from "@/lib/push-notification-store";
import { getWebPushCapability, syncScheduledWebPush } from "@/lib/web-push-client";
import { buildScheduledWebPushJobs } from "@/lib/web-push-schedule";
import {
  RESET_ROLLBACK_KEY,
  getBrowserStorage,
  loadStorage,
  readRawSnapshot,
  replaceRawValuesSafely,
  restoreSnapshotFromKey,
  type StorageLoadResult,
} from "@/lib/app-storage";
import {
  TIMER_KEY,
  TIMER_LOCK_KEY,
  getStoredTimerState,
  loadStoredTimerState,
  loadTimerLock,
  type StoredTimerState,
} from "@/lib/focus-timer-store";
import {
  DASHBOARD_VIEWS,
  PLAN_VIEWS,
  loadLazyModule,
  validateDashboardSearch,
  type DashboardView,
  type DashboardSearch,
  type PlanView,
} from "@/lib/route-search";
import type { TimerLessonRequest } from "@/components/today/types";

type LazyModuleBoundaryProps = { label: string; children: ReactNode };

class LazyModuleBoundary extends Component<LazyModuleBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          Không thể tải {this.props.label}. Hãy tải lại trang rồi thử lại; dữ liệu đã lưu không bị
          thay đổi.
        </div>
      );
    }
    return this.props.children;
  }
}

const LazyTopBar = lazy(async () => {
  const loaded = await loadLazyModule(() => import("@/components/TopBar"));
  if (loaded.status === "error") throw new Error(loaded.error);
  return { default: loaded.value.TopBar };
});

const LazyPushNotificationCenterModal = lazy(async () => {
  const loaded = await loadLazyModule(() => import("@/components/PushNotificationCenterModal"));
  if (loaded.status === "error") throw new Error(loaded.error);
  return { default: loaded.value.PushNotificationCenterModal };
});

function isDashboardView(value: string): value is DashboardView {
  return DASHBOARD_VIEWS.includes(value as DashboardView);
}

function isPlanView(value: string): value is PlanView {
  return PLAN_VIEWS.includes(value as PlanView);
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Study Planner — Không gian học tập cá nhân" },
      {
        name: "description",
        content:
          "Không gian học tập cá nhân: lập kế hoạch linh hoạt, theo dõi phiên tập trung và thói quen hằng ngày.",
      },
      { property: "og:title", content: "Smart Study Planner — Không gian học tập cá nhân" },
      {
        property: "og:description",
        content:
          "Lập kế hoạch linh hoạt, tập trung và theo dõi tiến độ trong một ứng dụng cá nhân.",
      },
    ],
  }),
  validateSearch: validateDashboardSearch,
  component: Dashboard,
});

function getLast7Dates() {
  const today = todayISO();
  return Array.from({ length: 7 }, (_, index) => addDaysISO(today, index - 6));
}

function Dashboard() {
  const dashboardSearch = Route.useSearch();
  const navigate = Route.useNavigate();
  const {
    state,
    hydrated,
    storageError,
    storageStatus,
    retryStorage,
    today,
    streak,
    studyStreak,
    level,
    xpInLevel,
    achievementPoints,
    pointsInLevel,
    weekStats,
    toggleLesson,
    completeLesson,
    toggleReview,
    completeReview,
    updateHabit,
    setGoals,
    setReminder,
    setTodayHours,
    setDayHours,
    setDefaultDailyHours,
    addStudySession,
    saveHabitDefinition,
    archiveHabit,
    deleteHabit,
    buyStreakFreeze,
    claimReward,
    addCustomReward,
    spendCoins,
  } = useProgress();
  const [burst, setBurst] = useState(0);
  const [levelUpState, setLevelUpState] = useState<{ open: boolean; level: number }>({
    open: false,
    level: 1,
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [workspaceStorageLoaded, setWorkspaceStorageLoaded] = useState(false);
  const pushAutoSyncAttemptedRef = useRef(false);
  const [subjectStorageStatus, setSubjectStorageStatus] = useState<StorageLoadResult<Subject[]>>({
    status: "missing",
  });
  const [timerStorageStatus, setTimerStorageStatus] = useState<StorageLoadResult<StoredTimerState>>(
    {
      status: "missing",
    },
  );
  const [timerLockStorageStatus, setTimerLockStorageStatus] = useState<
    ReturnType<typeof loadTimerLock>
  >({
    status: "missing",
  });
  const [workspaceChooserOpen, setWorkspaceChooserOpen] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [isPushCenterOpen, setIsPushCenterOpen] = useState(false);
  const [activeTimerLesson, setActiveTimerLesson] = useState<TimerLessonRequest | null>(null);
  const timerRecoveryAttemptedRef = useRef(false);
  const hasFactoryResetRollback = readRawSnapshot(RESET_ROLLBACK_KEY).status === "ok";

  const setDashboardView = useCallback(
    (value: string) => {
      if (!isDashboardView(value)) return;
      void navigate({ search: (previous: DashboardSearch) => ({ ...previous, view: value }) });
    },
    [navigate],
  );

  const setPlanView = useCallback(
    (value: string) => {
      if (!isPlanView(value)) return;
      void navigate({ search: (previous: DashboardSearch) => ({ ...previous, plan: value }) });
    },
    [navigate],
  );

  const openRoadmapImport = useCallback(() => {
    document.querySelector<HTMLButtonElement>("#roadmap-import-trigger button")?.click();
  }, []);

  const reloadStorageBoundaries = useCallback(() => {
    const loadedSubjects = getStoredCustomSubjects();
    setSubjectStorageStatus(loadedSubjects);
    setSubjects(loadedSubjects.status === "ok" ? loadedSubjects.value : []);
    setTimerStorageStatus(loadStoredTimerState());
    setTimerLockStorageStatus(loadTimerLock());
    setWorkspaceStorageLoaded(true);
  }, []);

  useEffect(() => {
    reloadStorageBoundaries();
  }, [reloadStorageBoundaries]);

  useEffect(() => {
    if (
      timerRecoveryAttemptedRef.current ||
      !workspaceStorageLoaded ||
      subjects.length === 0
    ) {
      return;
    }
    timerRecoveryAttemptedRef.current = true;
    if (timerStorageStatus.status !== "ok") return;
    const stored = timerStorageStatus.value;
    const shouldRestore =
      stored.isRunning ||
      stored.isMinimized ||
      ["paused", "expired", "warmup_completed", "breaking", "session_waiting"].includes(
        stored.status,
      );
    if (!shouldRestore) return;
    const lesson = findLessonById(stored.lessonId, subjects);
    setActiveTimerLesson({
      id: stored.lessonId,
      title: stored.lessonTitle,
      xp: lesson?.xp ?? 0,
      isCompleted: stored.reviewTaskId
        ? false
        : Boolean(state.completedLessons[stored.lessonId]),
      targetMinutes: stored.targetMinutes ?? lesson?.plannedDurationMinutes,
      reviewTaskId: stored.reviewTaskId,
      reviewTargetMinutes: stored.reviewTargetMinutes,
    });
  }, [state.completedLessons, subjects, timerStorageStatus, workspaceStorageLoaded]);

  const storageBlocked = [
    storageStatus,
    subjectStorageStatus,
    timerStorageStatus,
    timerLockStorageStatus,
  ].some((status) => status.status === "invalid" || status.status === "unavailable");

  const recoveryEntries: Array<[string, string, StorageLoadResult<unknown>, string | undefined]> = [
    [PROGRESS_STORAGE_KEY, "Tiến độ học", storageStatus, PROGRESS_BACKUP_KEY],
    [CUSTOM_SUBJECTS_KEY, "Danh mục môn và bài", subjectStorageStatus, CUSTOM_SUBJECTS_BACKUP_KEY],
    [TIMER_KEY, "Trạng thái hẹn giờ", timerStorageStatus, undefined],
    [TIMER_LOCK_KEY, "Khóa hẹn giờ giữa các tab", timerLockStorageStatus, undefined],
  ];
  const recoveryIssues: StorageRecoveryIssue[] = recoveryEntries.flatMap(
    ([key, label, status, backupKey]) => {
      if (status.status === "ok" || status.status === "missing") return [];
      const hasBackup =
        Boolean(backupKey) &&
        loadStorage(backupKey as string, () => ({}), getBrowserStorage()).status === "ok";
      return [
        {
          key: key as string,
          label: label as string,
          status: status.status,
          error: status.error,
          raw: status.status === "invalid" ? status.raw : undefined,
          canRestore: hasBackup,
        },
      ];
    },
  );

  const restoreRecoveryBackup = useCallback((key: string) => {
    const backupKey =
      key === PROGRESS_STORAGE_KEY
        ? PROGRESS_BACKUP_KEY
        : key === CUSTOM_SUBJECTS_KEY
          ? CUSTOM_SUBJECTS_BACKUP_KEY
          : null;
    if (!backupKey) return;
    const restored = loadStorage(
      backupKey,
      (raw) => {
        if (key === PROGRESS_STORAGE_KEY) return migrateProgressState(raw).ok ? raw : null;
        return normalizeSubjects(JSON.parse(raw)) ? raw : null;
      },
      getBrowserStorage(),
    );
    if (restored.status !== "ok") {
      toast.error(restored.status === "missing" ? "Không có bản sao lưu hợp lệ." : restored.error);
      return;
    }
    const transaction = replaceRawValuesSafely(RESET_ROLLBACK_KEY, [{ key, raw: restored.value }]);
    if (!transaction.ok) {
      toast.error(
        transaction.rollbackError
          ? `${transaction.error} ${transaction.rollbackError}`
          : transaction.error,
      );
      return;
    }
    window.location.reload();
  }, []);

  const resetRecoveryKey = useCallback((key: string) => {
    const transaction = replaceRawValuesSafely(RESET_ROLLBACK_KEY, [{ key, raw: null }]);
    if (!transaction.ok) {
      toast.error(
        transaction.rollbackError
          ? `${transaction.error} ${transaction.rollbackError}`
          : transaction.error,
      );
      return;
    }
    window.location.reload();
  }, []);

  const shiftedDates = useMemo<Record<string, string>>(
    () =>
      buildShiftedSchedule({
        subjects,
        completed: state.completedLessons,
        meta: state.studyMeta,
        settings: state.plannerSettings,
      }),
    [subjects, state.completedLessons, state.studyMeta, state.plannerSettings],
  );

  const realStudyStreak = useMemo(() => computeStudyStreak(state), [state]);
  const weeklyMetrics = useMemo(
    () =>
      selectWeeklyMetrics({
        state,
        subjects,
        shiftedDates,
        referenceDateISO: todayISO(),
      }),
    [state, subjects, shiftedDates],
  );

  useEffect(() => {
    if (storageError) toast.error(storageError, { duration: 12000 });
  }, [storageError]);

  useEffect(() => {
    if (
      !hydrated ||
      !workspaceStorageLoaded ||
      storageBlocked ||
      pushAutoSyncAttemptedRef.current
    ) {
      return;
    }
    const preferences = getPushPreferences();
    if (!preferences.enabled) return;

    const refreshKey = "smart-study-web-push-last-auto-sync-v1";
    const todayKey = todayISO();
    try {
      if (localStorage.getItem(refreshKey) === todayKey) return;
    } catch {
      return;
    }

    pushAutoSyncAttemptedRef.current = true;
    void (async () => {
      try {
        const capability = await getWebPushCapability();
        if (!capability.subscribed || !capability.schedulerConfigured) return;
        const jobs = buildScheduledWebPushJobs({
          state,
          subjects,
          preferences,
          horizonDays: 7,
        });
        await syncScheduledWebPush(jobs);
        localStorage.setItem(refreshKey, todayKey);
      } catch (error) {
        console.warn("Không thể tự đồng bộ lịch Web Push:", error);
      }
    })();
  }, [hydrated, state, storageBlocked, subjects, workspaceStorageLoaded]);

  const updateSubjectsSafely = useCallback(
    (
      nextSubjects: Subject[],
      options: CatalogUpdateOptions = {},
    ): CatalogUpdateResult => {
      if (storageBlocked) {
        const error = "Không thể thay đổi danh mục khi bộ nhớ cần được khôi phục.";
        toast.error(error);
        return { ok: false, error };
      }

      if (!options.alreadyPersisted) {
        if (options.createBackup) {
          const backedUp = saveCatalogBackup(subjects);
          if (!backedUp.ok) {
            toast.error(backedUp.error);
            return backedUp;
          }
        }
        const saved = saveStoredCustomSubjects(nextSubjects);
        if (!saved.ok) {
          toast.error(saved.error);
          return saved;
        }
      }

      setSubjects(nextSubjects);
      return { ok: true };
    },
    [storageBlocked, subjects],
  );

  const handleStartFocus = useCallback(
    (request: TimerLessonRequest) => {
      if (storageBlocked) {
        toast.error("Hẹn giờ đang bị tạm dừng cho đến khi bộ nhớ được khôi phục.");
        return;
      }
      const stored = getStoredTimerState();
      const hasUnfinishedTimer = Boolean(
        stored &&
          (stored.isRunning ||
            stored.accumulatedSeconds > 0 ||
            ["paused", "expired", "warmup_completed", "breaking", "session_waiting"].includes(
              stored.status,
            )),
      );
      if (stored && hasUnfinishedTimer) {
        const storedLesson = findLessonById(stored.lessonId, subjects);
        if (stored.lessonId !== request.id) {
          toast.info(
            `Bạn còn một phiên chưa kết thúc cho bài “${stored.lessonTitle}”. Hãy lưu hoặc bỏ phiên đó trước khi học bài mới.`,
          );
        }
        setActiveTimerLesson({
          id: stored.lessonId,
          title: stored.lessonTitle,
          xp: storedLesson?.xp ?? 0,
          isCompleted: stored.reviewTaskId
            ? false
            : Boolean(state.completedLessons[stored.lessonId]),
          targetMinutes: stored.targetMinutes ?? storedLesson?.plannedDurationMinutes,
          reviewTaskId: stored.reviewTaskId,
          reviewTargetMinutes: stored.reviewTargetMinutes,
        });
        return;
      }
      setActiveTimerLesson(request);
    },
    [state.completedLessons, storageBlocked, subjects],
  );

  const handleStartFocusFromPush = useCallback(
    (lessonId?: string) => {
      if (!lessonId) {
        toast.error("Thông báo này không có bài học để bắt đầu.");
        return;
      }
      const lesson = findLessonById(lessonId, subjects);
      if (!lesson) {
        toast.error("Bài học trong thông báo không còn trong lộ trình.");
        return;
      }
      handleStartFocus({
        id: lesson.id,
        title: lesson.title,
        xp: lesson.xp,
        isCompleted: Boolean(state.completedLessons[lesson.id]),
        initialMinutes: 25,
        targetMinutes: lesson.plannedDurationMinutes,
      });
    },
    [handleStartFocus, subjects, state.completedLessons],
  );

  useEffect(() => {
    if (!dashboardSearch.focusLesson || subjects.length === 0) return;
    const lesson = findLessonById(dashboardSearch.focusLesson, subjects);
    if (lesson) {
      handleStartFocus({
        id: lesson.id,
        title: lesson.title,
        xp: lesson.xp,
        isCompleted: Boolean(state.completedLessons[lesson.id]),
        initialMinutes: 25,
        targetMinutes: lesson.plannedDurationMinutes,
      });
    } else {
      toast.error("Bài học từ thông báo không còn trong lộ trình.");
    }
    void navigate({
      replace: true,
      search: (previous: DashboardSearch) => ({
        ...previous,
        view: "today",
        focusLesson: undefined,
      }),
    });
  }, [dashboardSearch.focusLesson, handleStartFocus, navigate, state.completedLessons, subjects]);

  const handleTimerRewardsCommitted = useCallback(
    (params: { xp: number; coins: number; previousXp: number; nextXp: number }) => {
      const oldLevel = getLevelFromXp(params.previousXp);
      const newLevel = getLevelFromXp(params.nextXp);
      if (newLevel > oldLevel) {
        setLevelUpState({ open: true, level: newLevel });
        setBurst((b) => b + 1);
      }
    },
    [],
  );

  const handleToggleLesson = useCallback(
    (id: string, xp: number) => {
      const wasDone = Boolean(state.completedLessons[id]);
      const previousLevel = getLevelFromXp(state.xp);
      if (!toggleLesson(id, xp)) {
        toast.error("Không thể lưu thay đổi bài học vào trình duyệt.");
        return false;
      }
      if (!wasDone) {
        const totalXp = Math.max(0, Math.round(xp)) + 30;
        const nextLevel = getLevelFromXp(state.xp + totalXp);
        setBurst((b) => b + 1);
        toast.success(`🎉 Hoàn thành bài học! +${totalXp} XP · +12 🪙`, {
          description: "Phần thưởng được lưu cùng trạng thái hoàn thành.",
        });
        if (nextLevel > previousLevel) {
          setLevelUpState({ open: true, level: nextLevel });
        }
      }
      return true;
    },
    [state.completedLessons, state.xp, toggleLesson],
  );

  const handleCompleteLesson = useCallback(
    (id: string, xp: number) => {
      if (state.completedLessons[id]) return true;
      const previousLevel = getLevelFromXp(state.xp);
      if (!completeLesson(id, xp)) {
        toast.error("Không thể lưu trạng thái hoàn thành bài học.");
        return false;
      }
      const totalXp = Math.max(0, Math.round(xp)) + 30;
      const nextLevel = getLevelFromXp(state.xp + totalXp);
      setBurst((value) => value + 1);
      toast.success(`🎉 Hoàn thành bài học! +${totalXp} XP · +12 🪙`);
      if (nextLevel > previousLevel) setLevelUpState({ open: true, level: nextLevel });
      return true;
    },
    [completeLesson, state.completedLessons, state.xp],
  );

  const handleToggleReview = useCallback(
    (lessonId: string, dateISO?: string) => {
      if (!toggleReview(lessonId, dateISO)) {
        toast.error("Không thể lưu trạng thái ôn tập vào trình duyệt.");
        return false;
      }
      return true;
    },
    [toggleReview],
  );

  const handleCompleteReview = useCallback(
    (taskId: string) => {
      if (!completeReview(taskId)) {
        toast.error("Không thể lưu trạng thái hoàn thành lượt ôn.");
        return false;
      }
      return true;
    },
    [completeReview],
  );

  const restoreFactoryResetRollback = useCallback(() => {
    const restored = restoreSnapshotFromKey(RESET_ROLLBACK_KEY);
    if (!restored.ok) {
      toast.error(restored.error);
      return;
    }
    window.location.reload();
  }, []);

  const handleUpdateHabit = useCallback(
    (patch: HabitEntry) => {
      const before = today;
      if (!updateHabit(patch)) {
        toast.error("Không thể lưu thay đổi thói quen vào trình duyệt.");
        return;
      }
      const key = Object.keys(patch)[0] as keyof HabitEntry;
      const nextVal = patch[key];
      const definition = state.habitDefinitions.find((habit) => habit.id === key);
      if (definition?.kind === "counter") {
        const beforeValue = typeof before[key] === "number" ? before[key] : 0;
        if (
          typeof nextVal === "number" &&
          nextVal >= definition.target &&
          beforeValue < definition.target
        ) {
          setBurst((b) => b + 1);
          toast.success(`Đã đạt mục tiêu ${definition.name} hôm nay!`);
        }
      } else if (nextVal === true && !before[key]) {
        setBurst((b) => b + 1);
      }
    },
    [state.habitDefinitions, today, updateHabit],
  );

  const replaceWorkspace = useCallback(
    (useDemoData: boolean) => {
      if (storageBlocked) {
        toast.error("Không thể tạo không gian mới khi bộ nhớ cần được khôi phục.");
        return;
      }
      const nextProgress = { ...createInitialProgressState(useDemoData), onboardingComplete: true };
      const nextSubjects = useDemoData ? SUBJECTS : [];
      const transaction = replaceRawValuesSafely(RESET_ROLLBACK_KEY, [
        { key: PROGRESS_STORAGE_KEY, raw: JSON.stringify(nextProgress) },
        { key: CUSTOM_SUBJECTS_KEY, raw: JSON.stringify(nextSubjects) },
        { key: TIMER_KEY, raw: null },
        { key: TIMER_LOCK_KEY, raw: null },
        { key: ARCHIVED_CATALOG_KEY, raw: null },
      ]);
      if (!transaction.ok) {
        toast.error(
          transaction.rollbackError
            ? `${transaction.error} ${transaction.rollbackError}`
            : transaction.error,
        );
        return;
      }
      window.location.reload();
    },
    [storageBlocked],
  );

  const affectedCounts = {
    lessons: subjects.reduce(
      (total, subject) =>
        total + subject.milestones.reduce((sum, milestone) => sum + milestone.lessons.length, 0),
      0,
    ),
    sessions: state.studySessions.length,
    habits: state.habitDefinitions.length,
    completions: Object.keys(state.completedLessons).length,
  };

  const weekDates = getLast7Dates();
  const weekLog = weekDates.map((d) => state.habitLog[d]);

  if (!hydrated) {
    return (
      <main
        className="min-h-screen bg-background px-4 py-6 md:px-8"
        aria-busy="true"
        aria-label="Đang tải không gian học tập"
      >
        <div className="mx-auto max-w-7xl animate-pulse space-y-5" role="status" aria-live="polite">
          <span className="sr-only">Đang tải không gian học tập</span>
          <div className="h-24 rounded-3xl bg-muted" aria-hidden="true" />
          <div className="h-10 w-72 rounded-lg bg-muted" aria-hidden="true" />
          <div className="h-64 rounded-3xl bg-muted" aria-hidden="true" />
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-background to-emerald-50/50">
      <StorageRecoveryPanel
        issues={recoveryIssues}
        onRetry={() => {
          retryStorage();
          reloadStorageBoundaries();
        }}
        onRestore={restoreRecoveryBackup}
        onScopedReset={resetRecoveryKey}
      />
      <ConfettiBurst trigger={burst} />
      {isPushCenterOpen && (
        <LazyModuleBoundary label="trung tâm thông báo">
          <Suspense
            fallback={
              <p
                role="status"
                aria-live="polite"
                className="rounded-2xl bg-sky-50 p-4 text-sm text-sky-900"
              >
                Đang tải trung tâm thông báo…
              </p>
            }
          >
            <LazyPushNotificationCenterModal
              open={isPushCenterOpen}
              onOpenChange={setIsPushCenterOpen}
              progressState={state}
              subjects={subjects}
              completedLessons={state.completedLessons}
              shiftedDates={shiftedDates}
              habitDefinitions={state.habitDefinitions}
              habitEntryToday={today}
              reminders={state.reminders}
              onStartFocus={handleStartFocusFromPush}
              onToggleLesson={handleToggleLesson}
              onUpdateHabit={handleUpdateHabit}
            />
          </Suspense>
        </LazyModuleBoundary>
      )}
      {activeTimerLesson && (
        <FocusTimerModal
          lessonId={activeTimerLesson.id}
          lessonTitle={activeTimerLesson.title}
          isOpen={true}
          onClose={() => setActiveTimerLesson(null)}
          onRecordSession={addStudySession}
          onRewardsCommitted={handleTimerRewardsCommitted}
          onCompleteLesson={(lessonId) => handleCompleteLesson(lessonId, activeTimerLesson.xp)}
          onReviewComplete={handleCompleteReview}
          isCompleted={
            activeTimerLesson.reviewTaskId
              ? false
              : Boolean(state.completedLessons[activeTimerLesson.id])
          }
          initialMinutes={activeTimerLesson.initialMinutes}
          targetMinutes={activeTimerLesson.targetMinutes}
          reviewTaskId={activeTimerLesson.reviewTaskId}
          reviewTargetMinutes={activeTimerLesson.reviewTargetMinutes}
        />
      )}
      <LevelUpDialog
        open={levelUpState.open}
        onOpenChange={(open) => setLevelUpState((prev) => ({ ...prev, open }))}
        level={levelUpState.level}
      />
      <OnboardingDialog
        open={(!state.onboardingComplete && !onboardingDismissed) || workspaceChooserOpen}
        onStartEmpty={() => {
          replaceWorkspace(false); /*
          return;
          saveStoredCustomSubjects([]);
          setSubjects([]);
          toast.success("Đã tạo không gian học tập trống.");
        */
        }}
        onUseDemo={() => {
          replaceWorkspace(true); /*
          return;
          saveStoredCustomSubjects(SUBJECTS);
          setSubjects(SUBJECTS);
          toast.success("Đã nạp lộ trình lớp 11 mẫu.");
        */
        }}
        onCancel={
          workspaceChooserOpen
            ? () => {
                setWorkspaceChooserOpen(false);
                setOnboardingDismissed(true);
              }
            : undefined
        }
        canRestoreFactoryReset={hasFactoryResetRollback}
        onRestoreFactoryReset={restoreFactoryResetRollback}
        affectedCounts={workspaceChooserOpen ? affectedCounts : undefined}
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col px-3 pb-24 pt-4 sm:px-4 sm:pt-6 md:px-8 md:pb-6">
        <Tabs value={dashboardSearch.view} onValueChange={setDashboardView} className="mt-4">
          <TabsList className="hidden max-w-full overflow-x-auto md:inline-flex">
            <TabsTrigger value="today">Hôm nay</TabsTrigger>
            <TabsTrigger value="weekly">Tổng kết tuần</TabsTrigger>
            <TabsTrigger value="plan">Kế hoạch</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-4">
            <TodayPanel
              state={state}
              subjects={subjects}
              onToggleLesson={handleToggleLesson}
              onToggleReview={handleToggleReview}
              onCompleteReview={handleCompleteReview}
              onSetTodayHours={setTodayHours}
              onAddStudySession={addStudySession}
              onStartFocus={handleStartFocus}
              onSubjectsUpdated={updateSubjectsSafely}
              onOpenRoadmapImport={openRoadmapImport}
              habitSidebar={
                <section id="habits" aria-label="Thói quen hôm nay">
                  <HabitSidebar
                    entry={today}
                    streak={streak}
                    weekLog={weekLog}
                    onUpdate={handleUpdateHabit}
                    definitions={state.habitDefinitions}
                    onSaveDefinition={saveHabitDefinition}
                    onArchiveHabit={archiveHabit}
                    onDeleteHabit={deleteHabit}
                  />
                </section>
              }
            />
          </TabsContent>

          <TabsContent value="weekly" className="mt-4">
            <WeeklyStudySummary
              metrics={weeklyMetrics}
              todayTargetMinutes={Math.round(state.plannerSettings.todayHours * 60)}
            />
          </TabsContent>

          <TabsContent value="plan" className="mt-4 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl font-semibold text-slate-900">Kế hoạch học tập</h2>
                <p className="text-sm text-slate-500">Phân bổ thời gian tại đây; nội dung môn và bài được quản lý riêng.</p>
              </div>
              <CourseManagerModal
                currentSubjects={subjects}
                onSubjectsUpdated={updateSubjectsSafely}
                progress={state}
                activeTimerLessonId={activeTimerLesson?.id ?? null}
                trigger={
                  <button
                    type="button"
                    className="inline-flex h-9 items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-3 text-xs font-semibold text-indigo-800 hover:bg-indigo-100"
                  >
                    Quản lý môn & bài
                  </button>
                }
              />
            </div>
            <ForecastCard
              state={state}
              subjects={subjects}
              onSetDefaultDailyHours={setDefaultDailyHours}
              shiftedDates={shiftedDates}
            />
            <Tabs value={dashboardSearch.plan} onValueChange={setPlanView}>
              <TabsList className="bg-slate-200/60 p-1 rounded-xl inline-flex h-auto gap-1 border-0">
                <TabsTrigger
                  value="flex"
                  className="rounded-lg px-4 py-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
                >
                  Lịch điều chỉnh
                </TabsTrigger>
                <TabsTrigger
                  value="original"
                  className="rounded-lg px-4 py-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
                >
                  Lộ trình
                </TabsTrigger>
              </TabsList>
              <TabsContent value="flex" className="mt-4">
                <FlexiblePlanner
                  state={state}
                  subjects={subjects}
                  onSetDayHours={setDayHours}
                />
              </TabsContent>
              <TabsContent value="original" className="mt-4 space-y-4">
                <div className="min-w-0">
                  <LearningRoadmap
                    completed={state.completedLessons}
                    onToggleLesson={handleToggleLesson}
                    shiftedDates={shiftedDates}
                    subjects={subjects}
                    onSubjectsUpdated={updateSubjectsSafely}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          Lộ trình học tập & thói quen · dữ liệu lưu trên trình duyệt của bạn · {todayISO()}
        </footer>
        <div className="order-first">
          <LazyModuleBoundary label="thanh công cụ">
            <Suspense
              fallback={
                <div
                  role="status"
                  aria-live="polite"
                  className="h-24 rounded-3xl bg-muted p-4 text-sm text-muted-foreground"
                >
                  Đang tải công cụ không gian học tập…
                </div>
              }
            >
              <LazyTopBar
                level={level}
                xp={state.xp}
                xpInLevel={xpInLevel}
                coins={state.coins}
                streak={streak}
                studyStreak={realStudyStreak}
                currentSubjects={subjects}
                onSubjectsUpdated={updateSubjectsSafely}
                reminders={state.reminders}
                today={today}
                completedLessons={state.completedLessons}
                shiftedDates={shiftedDates}
                onSetReminder={setReminder}
                goals={state.goals}
                weekStats={weekStats}
                achievementPoints={achievementPoints}
                pointsInLevel={pointsInLevel}
                onSetGoals={setGoals}
                progress={state}
                habitDefinitions={state.habitDefinitions}
                onResetOnboarding={() => {
                  setOnboardingDismissed(false);
                  setWorkspaceChooserOpen(true);
                }}
                onOpenPushCenter={() => setIsPushCenterOpen(true)}
                onBuyStreakFreeze={buyStreakFreeze}
                onClaimReward={claimReward}
                onAddCustomReward={addCustomReward}
                activeTimerLesson={activeTimerLesson ? { id: activeTimerLesson.id, title: activeTimerLesson.title } : null}
              />
            </Suspense>
          </LazyModuleBoundary>
        </div>
      </div>
      <MobileBottomNav
        value={dashboardSearch.view}
        onValueChange={setDashboardView}
        onOpenNotifications={() =>
          document.querySelector<HTMLButtonElement>("#reminder-settings-trigger")?.click()
        }
      />
    </div>
  );
}
