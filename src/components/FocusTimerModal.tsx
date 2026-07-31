import {
  useEffect,
  useState,
  useCallback,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  X,
  Bell,
  BellOff,
  HelpCircle,
  Maximize,
  Minimize,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type StoredTimerState,
  type TimerMode,
  type FocusDisplayMode,
  type AmbientSoundType,
  type FocusSessionCommitResult,
  FOCUS_PRESETS,
  MODE_DEFAULTS,
  getStoredTimerState,
  recordFocusSessionAndTimerStateAtomically,
  saveStoredTimerState,
  calculateElapsedSeconds,
  playCompletionChime,
  playClockTick,
  playAmbientSound,
  stopAmbientSound,
  sendDesktopNotification,
  createStoredTimerState,
  createStartedFocusTimerState,
  getSmartBreakMinutes,
  TIMER_KEY,
  FOCUS_TIMER_OPEN_EVENT,
  acquireTimerLock,
  acquireOrRefreshTimerLock,
  refreshTimerLock,
  releaseTimerLock,
  getTimerTabId,
  shouldRecoverExpiredTimer,
  timerExpectedEndTimestamp,
} from "@/lib/focus-timer-store";
import {
  createStableId,
  createStudySession,
  reviewSecondsForTask,
  type StudySession,
} from "@/lib/study-sessions";
import {
  loadProgressStorage,
  getLessonCompletedSeconds,
  calculateSessionRewards,
} from "@/lib/progress-store";
import { AmbientSoundSelector } from "@/components/focus-timer/AmbientSoundSelector";
import { DurationSelector } from "@/components/focus-timer/DurationSelector";
import {
  MicroStartDialog,
  RecommitmentDialog,
  SaveTimeInfoDialog,
  TimerRecoveryDialogs,
  type CompletionSummary,
} from "@/components/focus-timer/FocusTimerDialogs";
import { createNonOwnerExpiryLocalState } from "@/lib/focus-timer-transitions";
import { loadFocusPreferences, type FocusPreferences } from "@/lib/focus-preferences";

type FocusTimerProps = {
  lessonId: string | null;
  lessonTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onRecordSession: (session: StudySession) => boolean | void;
  onRewardsCommitted?: (params: {
    xp: number;
    coins: number;
    previousXp: number;
    nextXp: number;
  }) => void;
  onCompleteLesson?: (lessonId: string) => boolean | void;
  isCompleted?: boolean;
  initialMinutes?: number;
  targetMinutes?: number;
  reviewTaskId?: string;
  reviewTargetMinutes?: number;
  onReviewComplete?: (taskId: string) => boolean | void;
};

const STORAGE_SYNC_ERROR = "Dữ liệu đã được lưu nhưng giao diện chưa đồng bộ. Hãy tải lại trang.";

function isCommittedFocusSession(
  result: ReturnType<typeof saveStoredTimerState> | FocusSessionCommitResult,
): result is Extract<FocusSessionCommitResult, { ok: true }> {
  return result.ok && "rewardsApplied" in result;
}

const MIN_SAVABLE_FOCUS_SECONDS = 30;

function hasReachedReviewTarget(taskId: string, targetMinutes: number): boolean {
  const loaded = loadProgressStorage();
  if (loaded.status !== "ok") return false;
  return reviewSecondsForTask(loaded.value.studySessions, taskId) >= targetMinutes * 60;
}

export function FocusTimerModal({
  lessonId,
  lessonTitle,
  isOpen,
  onClose,
  onRecordSession,
  onRewardsCommitted,
  onCompleteLesson,
  isCompleted,
  initialMinutes,
  targetMinutes,
  reviewTaskId,
  reviewTargetMinutes,
  onReviewComplete,
}: FocusTimerProps) {
  const [timerState, setTimerState] = useState<StoredTimerState | null>(() => {
    const stored = getStoredTimerState();
    if (stored && lessonId && stored.lessonId === lessonId) {
      const restored = {
        ...stored,
        lessonTitle,
        isCompleted,
        targetMinutes: targetMinutes ?? stored.targetMinutes,
        reviewTaskId: reviewTaskId ?? stored.reviewTaskId,
        reviewTargetMinutes: reviewTargetMinutes ?? stored.reviewTargetMinutes,
      };
      if (initialMinutes) {
        return { ...restored, durationMinutes: initialMinutes };
      }
      return restored;
    }
    if (lessonId) {
      if (stored?.isRunning) return stored;
      const created = {
        ...createStoredTimerState(lessonId, lessonTitle, isCompleted),
        targetMinutes,
        reviewTaskId,
        reviewTargetMinutes,
      };
      if (initialMinutes) {
        created.durationMinutes = initialMinutes;
      }
      return created;
    }
    return stored;
  });
  const [preferences, setPreferences] = useState<FocusPreferences>(() => loadFocusPreferences());

  const [elapsed, setElapsed] = useState<number>(0);
  const isFullScreen = timerState?.displayMode === "studio";
  const [showSaveInfo, setShowSaveInfo] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [expiredPrompt, setExpiredPrompt] = useState<boolean>(false);
  const [recommitmentPrompt, setRecommitmentPrompt] = useState<boolean>(false);
  const [completionSummary, setCompletionSummary] = useState<CompletionSummary | null>(null);
  const [stopDecisionOpen, setStopDecisionOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const savingSessionIdsRef = useRef(new Set<string>());
  const lockWarningShownRef = useRef(false);
  const timerTabIdRef = useRef<string>("");
  const mountedAtRef = useRef(Date.now());
  const explicitStartHandledRef = useRef<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const persistTimerState = useCallback((next: StoredTimerState): boolean => {
    const saved = saveStoredTimerState(next);
    if (!saved.ok) {
      toast.error(saved.error);
      return false;
    }
    setTimerState(next);
    return true;
  }, []);

  const updateState = useCallback(
    (patch: Partial<StoredTimerState>): boolean => {
      if (!timerState) return false;
      const nextDisplayMode = patch.displayMode ?? timerState.displayMode;
      return persistTimerState({
        ...timerState,
        ...patch,
        displayMode: nextDisplayMode,
        isMinimized: nextDisplayMode === "mini",
      });
    },
    [persistTimerState, timerState],
  );

  const setDisplayMode = useCallback(
    (displayMode: FocusDisplayMode): boolean => updateState({ displayMode }),
    [updateState],
  );

  const startFocusDuration = useCallback(
    (baseState: StoredTimerState, durationMinutes: number): boolean => {
      const next = createStartedFocusTimerState(baseState, durationMinutes);
      if (!acquireTimerLock(next.activeTimerSessionId, timerTabIdRef.current)) {
        toast.error("Một tab khác đang chạy Pomodoro. Hãy dừng timer ở tab đó trước.");
        return false;
      }
      if (!persistTimerState(next)) {
        releaseTimerLock(timerTabIdRef.current);
        return false;
      }
      setCompletionSummary(null);
      setExpiredPrompt(false);
      setRecommitmentPrompt(false);
      return true;
    },
    [persistTimerState],
  );

  useEffect(() => {
    setMounted(true);
    timerTabIdRef.current = getTimerTabId();
  }, []);

  useEffect(() => {
    if (isOpen) setPreferences(loadFocusPreferences());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const active = document.activeElement;
    returnFocusRef.current = active instanceof HTMLElement ? active : null;
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(focusTimer);
      returnFocusRef.current?.focus();
    };
  }, [isOpen]);

  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });

  // Check notification permission state
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && timerState?.status === "expired") setExpiredPrompt(true);
  }, [isOpen, timerState?.status]);

  // Lock body scroll when Pomodoro Studio is in FullScreen mode
  useEffect(() => {
    if (isFullScreen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isFullScreen]);

  const handleRequestNotif = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setNotifPermission(permission);
        if (permission === "granted") {
          toast.success("🔔 Đã bật thông báo trình duyệt khi hết giờ!");
        } else if (permission === "denied") {
          toast.error(
            "Trình duyệt đang chặn thông báo. Vui lòng cho phép trong cài đặt trình duyệt.",
          );
        }
      });
    } else {
      toast.error("Trình duyệt của bạn không hỗ trợ thông báo Desktop.");
    }
  };

  // Sync / init when lessonId or an explicit duration changes. Passing
  // initialMinutes represents a deliberate user action and therefore starts
  // immediately; recovery paths omit it and never auto-start a new session.
  useEffect(() => {
    if (!lessonId) return;
    const stored = getStoredTimerState();

    if (stored?.isRunning) {
      setTimerState(stored);
      if (stored.lessonId !== lessonId) {
        toast.info(`Một timer khác đang chạy cho bài "${stored.lessonTitle}".`);
      }
      return;
    }

    const base: StoredTimerState = {
      ...(stored?.lessonId === lessonId
        ? { ...stored, lessonTitle, isCompleted }
        : createStoredTimerState(lessonId, lessonTitle, isCompleted)),
      targetMinutes: targetMinutes ?? (stored?.lessonId === lessonId ? stored.targetMinutes : undefined),
      reviewTaskId: reviewTaskId ?? (stored?.lessonId === lessonId ? stored.reviewTaskId : undefined),
      reviewTargetMinutes:
        reviewTargetMinutes ??
        (stored?.lessonId === lessonId ? stored.reviewTargetMinutes : undefined),
    };

    if (initialMinutes != null) {
      const explicitStartKey = `${lessonId}:${initialMinutes}`;
      if (explicitStartHandledRef.current !== explicitStartKey) {
        const shouldAutoStart = initialMinutes === 2 || preferences.autoStartSelectedDuration;
        if (shouldAutoStart) {
          if (startFocusDuration(base, initialMinutes)) {
            explicitStartHandledRef.current = explicitStartKey;
          }
        } else {
          const readyState: StoredTimerState = {
            ...base,
            durationMinutes: initialMinutes,
            lastFocusDuration: initialMinutes,
            accumulatedSeconds: 0,
            startTimestamp: null,
            isRunning: false,
            displayMode: base.displayMode === "mini" ? "dialog" : base.displayMode,
            isMinimized: false,
            activeTimerSessionId: createStableId("timer"),
            status: "idle",
          };
          if (persistTimerState(readyState)) explicitStartHandledRef.current = explicitStartKey;
        }
      }
      return;
    }
    explicitStartHandledRef.current = null;

    const saved = saveStoredTimerState(base);
    if (saved.ok) setTimerState(base);
    else toast.error(saved.error);
  }, [
    initialMinutes,
    isCompleted,
    lessonId,
    lessonTitle,
    reviewTaskId,
    reviewTargetMinutes,
    targetMinutes,
    persistTimerState,
    preferences.autoStartSelectedDuration,
    startFocusDuration,
  ]);

  // Keep every state mutation in sync across tabs, including pause/resume and
  // duration changes that retain the same session ID.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== TIMER_KEY) return;
      const external = getStoredTimerState();
      setTimerState((current) => {
        if (external && external.activeTimerSessionId !== current?.activeTimerSessionId) {
          toast.info(`Timer được đồng bộ từ tab khác: "${external.lessonTitle}".`);
        }
        return external;
      });
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // A page reload keeps the wall-clock timer alive. Reclaim the lock when the
  // previous page instance no longer owns it; never steal an unexpired lock
  // from another active tab.
  useEffect(() => {
    if (!timerState?.isRunning || !timerTabIdRef.current) return;
    if (acquireOrRefreshTimerLock(timerState.activeTimerSessionId, timerTabIdRef.current)) {
      lockWarningShownRef.current = false;
      return;
    }
    // Keep observing the wall-clock state instead of converting it to a local
    // pause. If the previous page was closed, its short-lived lock will expire
    // and this tab can reclaim the same session on a later heartbeat.
    if (!lockWarningShownRef.current) {
      lockWarningShownRef.current = true;
      toast.info("Timer đang được điều khiển ở tab khác; tab này sẽ tự nhận lại khi khóa cũ hết hạn.");
    }
  }, [timerState?.activeTimerSessionId, timerState?.isRunning]);

  useEffect(() => {
    const handleOpenTimer = () => {
      setTimerState((current) => {
        if (!current) return current;
        const next = { ...current, displayMode: "dialog" as const, isMinimized: false };
        const saved = saveStoredTimerState(next);
        if (!saved.ok) {
          toast.error(saved.error);
          return current;
        }
        return next;
      });
    };
    window.addEventListener(FOCUS_TIMER_OPEN_EVENT, handleOpenTimer);
    return () => window.removeEventListener(FOCUS_TIMER_OPEN_EVENT, handleOpenTimer);
  }, []);

  useEffect(() => {
    if (!timerState?.isRunning || preferences.keepRunningAcrossTabs) return;
    const pauseWhenHidden = () => {
      if (document.visibilityState !== "hidden") return;
      setTimerState((current) => {
        if (!current?.isRunning) return current;
        const paused = {
          ...current,
          accumulatedSeconds: calculateElapsedSeconds(current),
          startTimestamp: null,
          isRunning: false,
          status: "paused" as const,
        };
        const saved = saveStoredTimerState(paused);
        if (!saved.ok) {
          toast.error(saved.error);
          return current;
        }
        releaseTimerLock(timerTabIdRef.current);
        return paused;
      });
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, [preferences.keepRunningAcrossTabs, timerState?.isRunning]);

  // Handle ambient sound playback based on running state & selected ambient sound
  useEffect(() => {
    if (timerState?.isRunning && timerState.ambientSound !== "none") {
      playAmbientSound(timerState.ambientSound, preferences.soundVolume);
    } else {
      stopAmbientSound();
    }
    return () => {
      stopAmbientSound();
    };
  }, [preferences.soundVolume, timerState?.ambientSound, timerState?.isRunning]);

  useEffect(() => {
    if (!timerState?.isRunning) return;
    const heartbeat = window.setInterval(() => {
      if (acquireOrRefreshTimerLock(timerState.activeTimerSessionId, timerTabIdRef.current)) {
        lockWarningShownRef.current = false;
        return;
      }
      // Stay read-only while another live tab owns the session. Repeated
      // heartbeats also let this tab reclaim a stale lock after a closed page.
      if (!lockWarningShownRef.current) {
        lockWarningShownRef.current = true;
        toast.info("Timer đang chạy ở tab khác. Tab này hiện chỉ theo dõi thời gian.");
      }
    }, 4_000);
    return () => window.clearInterval(heartbeat);
  }, [persistTimerState, timerState]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (document.querySelector("[data-timer-overlay='true']")) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }
      const key = event.key.toLowerCase();
      const selector =
        event.code === "Space"
          ? "[data-timer-action='start-pause']"
          : key === "s"
            ? "[data-timer-action='save']"
            : key === "r"
              ? "[data-timer-action='reset']"
              : null;
      if (key === "m") {
        event.preventDefault();
        setTimerState((current) => {
          if (!current) return current;
          const next = {
            ...current,
            ambientSound: current.ambientSound === "none" ? "rain" : ("none" as AmbientSoundType),
          };
          const saved = saveStoredTimerState(next);
          if (!saved.ok) {
            toast.error(saved.error);
            return current;
          }
          return next;
        });
        return;
      }
      if (!selector) return;
      event.preventDefault();
      document.querySelector<HTMLButtonElement>(selector)?.click();
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const lastTickSecondRef = useRef<number | null>(null);

  // Main timer ticker loop with wall-clock time offset calculation & Browser Notifications
  useEffect(() => {
    if (!timerState) return;

    const update = () => {
      const el = calculateElapsedSeconds(timerState);
      setElapsed(el);

      const totalSec = timerState.durationMinutes * 60;
      const remSec = Math.max(0, Math.ceil(totalSec - el));

      // Play 10-second ticking clock alert before session ends ("tíc tắc" 10s)
      if (timerState.isRunning && remSec > 0 && remSec <= 10) {
        if (lastTickSecondRef.current !== remSec) {
          lastTickSecondRef.current = remSec;
          if (preferences.soundAlertsEnabled) {
            playClockTick(preferences.soundVolume, remSec % 2 === 0);
          }
        }
      } else if (!timerState.isRunning) {
        lastTickSecondRef.current = null;
      }

      // Check auto completion at 100% time
      if (el >= totalSec && timerState.isRunning) {
        const ownsCompletion = refreshTimerLock(
          timerState.activeTimerSessionId,
          timerTabIdRef.current,
        );
        if (!ownsCompletion) {
          // The owner may be completing the same session at this instant.
          // Never acquire, persist, release, or record from a non-owner tab.
          setTimerState((current) =>
            current?.activeTimerSessionId === timerState.activeTimerSessionId
              ? createNonOwnerExpiryLocalState(current, el)
              : current,
          );
          toast.error(
            "Phiên đã hết giờ ở tab này, nhưng đang được tab khác quản lý. Dữ liệu của tab đó không bị thay đổi.",
          );
          return;
        }
        const expectedEnd = timerExpectedEndTimestamp(timerState) ?? Date.now();
        const expiredBeforeOpen = shouldRecoverExpiredTimer(timerState, mountedAtRef.current);
        if (expiredBeforeOpen && timerState.status !== "expired") {
          if (timerState.timerMode !== "pomodoro") {
            const readyState: StoredTimerState = {
              ...timerState,
              timerMode: "pomodoro",
              durationMinutes: timerState.lastFocusDuration || 25,
              isRunning: false,
              startTimestamp: null,
              accumulatedSeconds: 0,
              activeTimerSessionId: createStableId("timer"),
              status: "session_waiting",
              expiredAt: undefined,
            };
            if (!persistTimerState(readyState)) return;
            releaseTimerLock(timerTabIdRef.current);
            setRecommitmentPrompt(true);
            toast.info("Giờ nghỉ đã kết thúc. Phiên tập trung tiếp theo đã sẵn sàng.");
            return;
          }
          const expiredState: StoredTimerState = {
            ...timerState,
            isRunning: false,
            startTimestamp: null,
            accumulatedSeconds: totalSec,
            status: "expired",
            expiredAt: new Date(expectedEnd).toISOString(),
          };
          if (!persistTimerState(expiredState)) return;
          setExpiredPrompt(true);
          releaseTimerLock(timerTabIdRef.current);
          return;
        }
        lastTickSecondRef.current = null;
        stopAmbientSound();

        const isFocusMode = timerState.timerMode === "pomodoro";

        // Play automatic sound alert if enabled
        if (preferences.soundAlertsEnabled) {
          playCompletionChime(isFocusMode ? "study" : "break", preferences.soundVolume);
        }

        const isWarmupFocus = isFocusMode && timerState.durationMinutes <= 2;
        const newPomodoros =
          isFocusMode && !isWarmupFocus
            ? timerState.completedPomodoros + 1
            : timerState.completedPomodoros;

        const shouldAutoStart = isFocusMode ? preferences.autoStartBreak : preferences.autoStartFocus;

        if (isFocusMode) {
          const sessionId = timerState.activeTimerSessionId;
          const alreadySaved =
            timerState.savedSessionIds.includes(sessionId) ||
            savingSessionIdsRef.current.has(sessionId);
          const focusMins = timerState.durationMinutes;
          const rewards = calculateSessionRewards(focusMins);
          const targetCycles = timerState.longBreakTargetCycles || 4;
          const isLongBreak = newPomodoros > 0 && newPomodoros % targetCycles === 0;
          const nextMode: TimerMode = isLongBreak ? "longBreak" : "shortBreak";
          let nextMins = isLongBreak
            ? timerState.longBreakMinutes || 20
            : timerState.shortBreakMinutes || 10;

          const smartBreakMinutes = getSmartBreakMinutes(focusMins);
          if (!isLongBreak && smartBreakMinutes != null) {
            nextMins = smartBreakMinutes;
          }

          const nextSessionId = createStableId("timer");
          const startedNext =
            !isWarmupFocus &&
            shouldAutoStart &&
            acquireTimerLock(nextSessionId, timerTabIdRef.current);
          const nextState: StoredTimerState = isWarmupFocus
            ? {
                ...timerState,
                isRunning: false,
                displayMode: timerState.displayMode === "mini" ? "dialog" : timerState.displayMode,
                isMinimized: false,
                startTimestamp: null,
                accumulatedSeconds: 0,
                completedPomodoros: newPomodoros,
                activeTimerSessionId: nextSessionId,
                savedSessionIds: alreadySaved
                  ? timerState.savedSessionIds
                  : [...timerState.savedSessionIds, sessionId].slice(-100),
                status: "warmup_completed",
                expiredAt: undefined,
              }
            : {
                ...timerState,
                timerMode: nextMode,
                durationMinutes: nextMins,
                lastFocusDuration: focusMins,
                isRunning: startedNext,
                startTimestamp: startedNext ? Date.now() : null,
                accumulatedSeconds: 0,
                completedPomodoros: newPomodoros,
                activeTimerSessionId: nextSessionId,
                savedSessionIds: alreadySaved
                  ? timerState.savedSessionIds
                  : [...timerState.savedSessionIds, sessionId].slice(-100),
                status: startedNext ? "running" : "breaking",
                activePresetId: timerState.pendingPresetId ?? timerState.activePresetId,
                pendingPresetId: undefined,
              };

          if (!alreadySaved) savingSessionIdsRef.current.add(sessionId);
          const session = createStudySession({
            id: sessionId,
            lessonId: timerState.lessonId,
            durationSeconds: timerState.durationMinutes * 60,
            source: "focus-timer",
            timerPreset: timerState.activePresetId,
            reviewTaskId: timerState.reviewTaskId,
          });
          const persisted = alreadySaved
            ? saveStoredTimerState(nextState)
            : recordFocusSessionAndTimerStateAtomically(session, nextState, rewards);
          if (!persisted.ok) {
            if (!alreadySaved) savingSessionIdsRef.current.delete(sessionId);
            if (startedNext) releaseTimerLock(timerTabIdRef.current);
            const pausedState: StoredTimerState = {
              ...timerState,
              isRunning: false,
              startTimestamp: null,
              accumulatedSeconds: totalSec,
              status: "paused",
            };
            if (persistTimerState(pausedState)) releaseTimerLock(timerTabIdRef.current);
            toast.error(`${persisted.error} Phiên chưa được đánh dấu là đã lưu.`);
            return;
          }
          if (!alreadySaved) savingSessionIdsRef.current.delete(sessionId);
          setTimerState(nextState);
          if (!startedNext) releaseTimerLock(timerTabIdRef.current);
          if (!alreadySaved && isCommittedFocusSession(persisted) && persisted.rewardsApplied) {
            onRewardsCommitted?.({
              xp: rewards.xp,
              coins: rewards.coins,
              previousXp: persisted.previousXp,
              nextXp: persisted.nextXp,
            });
            toast.success(
              `🎉 Hoàn thành phiên ${focusMins}p! +${rewards.xp} XP · +${rewards.coins} 🪙`,
            );
          }
          if (!alreadySaved && onRecordSession(session) === false) {
            toast.error(STORAGE_SYNC_ERROR);
            return;
          }

          if (!alreadySaved && timerState.reviewTaskId) {
            const targetReviewMinutes =
              timerState.reviewTargetMinutes ?? reviewTargetMinutes ?? timerState.durationMinutes;
            if (
              hasReachedReviewTarget(timerState.reviewTaskId, targetReviewMinutes) &&
              onReviewComplete?.(timerState.reviewTaskId) === false
            ) {
              return;
            }
          }

          const lessonTargetMinutes = timerState.targetMinutes ?? targetMinutes;
          if (
            !timerState.reviewTaskId &&
            lessonTargetMinutes &&
            onCompleteLesson &&
            !isCompleted &&
            timerState.lessonId
          ) {
            const loadRes = loadProgressStorage();
            if (loadRes.status === "ok" && loadRes.value) {
              const doneSeconds = getLessonCompletedSeconds(timerState.lessonId, loadRes.value);
              if (
                doneSeconds >= lessonTargetMinutes * 60 &&
                onCompleteLesson(timerState.lessonId) !== false
              ) {
                toast.success(
                  `🎉 Bạn đã tích lũy đủ ${lessonTargetMinutes} phút học! Bài học đã tự động hoàn thành.`,
                );
              }
            }
          }

          if (isWarmupFocus) {
            setCompletionSummary(null);
            if (preferences.notifyWhenComplete) {
              sendDesktopNotification(
                "⚡ Hoàn thành 2 phút khởi động!",
                `Bạn đã bắt đầu bài "${timerState.lessonTitle}". Chọn học tiếp 25 phút, Deep Work 50 phút hoặc dừng tại đây.`,
              );
            }
            toast.success("Đã ghi nhận 2 phút khởi động. Chọn nhịp học tiếp theo.", {
              duration: 6000,
            });
            return;
          }

          setCompletionSummary(
            startedNext
              ? null
              : {
                  minutes: focusMins,
                  lessonTitle: timerState.lessonTitle,
                  nextMode,
                  nextMinutes: nextMins,
                },
          );

          if (preferences.notifyWhenComplete) {
            sendDesktopNotification(
              "🍅 Hoàn thành phiên tập trung!",
              `Chúc mừng bạn vừa học xong ${focusMins}p bài "${timerState.lessonTitle}". ${
                startedNext ? "Tự động bắt đầu ngay" : "Đã chuyển sang"
              } ${isLongBreak ? "Nghỉ dài 🌴" : "Nghỉ ngắn ☕"} (${nextMins}p).`,
            );
          }

          toast.success(
            `🎉 Hoàn thành ${focusMins}p tập trung (${newPomodoros}/${targetCycles} phiên)! ${
              startedNext
                ? "⚡ Đã tự động BẮT ĐẦU phiên"
                : "Đã tự động cộng thời gian học & chuyển sang"
            } ${isLongBreak ? "Nghỉ dài 🌴" : "Nghỉ ngắn ☕"} (${nextMins}p).`,
            { duration: 8000 },
          );
        } else {
          // Break finished -> auto switch back or prompt recommitment dialog
          const returnFocusMins = timerState.lastFocusDuration || 25;
          const nextSessionId = createStableId("timer");
          const startedNext =
            shouldAutoStart && acquireTimerLock(nextSessionId, timerTabIdRef.current);
          const nextState: StoredTimerState = {
            ...timerState,
            timerMode: "pomodoro",
            durationMinutes: returnFocusMins,
            isRunning: startedNext,
            startTimestamp: startedNext ? Date.now() : null,
            accumulatedSeconds: 0,
            activeTimerSessionId: nextSessionId,
            status: startedNext ? "running" : "session_waiting",
            activePresetId: timerState.pendingPresetId ?? timerState.activePresetId,
            pendingPresetId: undefined,
          };
          if (!persistTimerState(nextState)) {
            if (startedNext) releaseTimerLock(timerTabIdRef.current);
            return;
          }
          if (!startedNext) {
            releaseTimerLock(timerTabIdRef.current);
            setRecommitmentPrompt(true);
          }

          if (preferences.notifyWhenComplete) {
            sendDesktopNotification(
              "☕ Hết giờ nghỉ ngơi!",
              startedNext
                ? `Đã hết giờ nghỉ! Tự động BẮT ĐẦU ngay phiên Tập trung mới (${returnFocusMins}p) cho bài "${timerState.lessonTitle}".`
                : `Đã hết giờ nghỉ! Tự động quay lại Chế độ Tập trung (${returnFocusMins}p) cho bài "${timerState.lessonTitle}". Bấm Bắt đầu khi sẵn sàng!`,
            );
          }

          if (startedNext) {
            toast.success(
              `⚡ Đã hết giờ nghỉ! Tự động BẮT ĐẦU phiên Tập trung mới (${returnFocusMins}p). Cùng tập trung nhé!`,
              { duration: 8000 },
            );
          } else {
            toast.info(
              `🔔 Đã hết giờ nghỉ! Tự động chuyển về Chế độ Tập trung (${returnFocusMins}p). Bấm Bắt đầu khi bạn sẵn sàng!`,
              { duration: 8000 },
            );
          }
        }
      }
    };

    update();
    const interval = setInterval(update, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        update();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    isCompleted,
    onRecordSession,
    onRewardsCommitted,
    onReviewComplete,
    onCompleteLesson,
    persistTimerState,
    targetMinutes,
    reviewTargetMinutes,
    preferences.autoStartBreak,
    preferences.autoStartFocus,
    preferences.soundAlertsEnabled,
    preferences.soundVolume,
    timerState,
  ]);

  if (!mounted || !isOpen || !timerState || !timerState.lessonId) return null;

  const totalSecs = timerState.durationMinutes * 60;
  const timeLeft = Math.max(0, totalSecs - elapsed);
  const elapsedMinutes = Math.floor(elapsed / 60);
  const progressPercent = Math.min(100, Math.max(0, (elapsed / totalSecs) * 100));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStartPause = () => {
    if (timerState.isRunning) {
      if (!refreshTimerLock(timerState.activeTimerSessionId, timerTabIdRef.current)) {
        toast.error("Một tab khác đang điều khiển Pomodoro. Hãy quay lại tab đó để tạm dừng.");
        return;
      }
      const currentElapsed = calculateElapsedSeconds(timerState);
      const paused = updateState({
        isRunning: false,
        startTimestamp: null,
        accumulatedSeconds: currentElapsed,
        status: "paused",
      });
      if (paused) {
        const released = releaseTimerLock(timerTabIdRef.current);
        if (!released.ok) toast.error(released.error);
      }
    } else {
      if (!acquireTimerLock(timerState.activeTimerSessionId, timerTabIdRef.current)) {
        toast.error("Một tab khác đang chạy Pomodoro. Hãy dừng timer ở tab đó trước.");
        return;
      }
      const started = updateState({
        isRunning: true,
        startTimestamp: Date.now(),
        status: "running",
      });
      if (!started) releaseTimerLock(timerTabIdRef.current);
    }
  };

  const handleReset = () => {
    if (
      elapsed > 0 &&
      !window.confirm(
        `Bạn muốn đặt lại phiên hiện tại? ${Math.max(1, Math.round(elapsed / 60))} phút chưa lưu sẽ bị mất.`,
      )
    ) {
      return;
    }
    const reset = updateState({
      isRunning: false,
      startTimestamp: null,
      accumulatedSeconds: 0,
      activeTimerSessionId: createStableId("timer"),
      status: "idle",
    });
    if (!reset) return;
    const released = releaseTimerLock(timerTabIdRef.current);
    if (!released.ok) toast.error(released.error);
  };

  const handleSwitchMode = (mode: TimerMode) => {
    if (mode === timerState.timerMode) return;
    if (timerState.isRunning) {
      toast.info("Hãy tạm dừng hoặc kết thúc phiên trước khi đổi chế độ.");
      return;
    }
    if (
      elapsed > 0 &&
      !window.confirm("Đổi chế độ sẽ bỏ phần thời gian chưa lưu của phiên hiện tại. Tiếp tục?")
    ) {
      return;
    }
    stopAmbientSound();
    let mins = MODE_DEFAULTS[mode].minutes;
    if (mode === "pomodoro") {
      mins = timerState.lastFocusDuration || 50;
    } else if (mode === "shortBreak") {
      mins = timerState.shortBreakMinutes || 10;
    } else if (mode === "longBreak") {
      mins = timerState.longBreakMinutes || 20;
    }

    updateState({
      timerMode: mode,
      durationMinutes: mins,
      isRunning: false,
      startTimestamp: null,
      accumulatedSeconds: 0,
      activeTimerSessionId: createStableId("timer"),
      status: "idle",
    });
  };

  const handleApplyPreset = (presetId: string) => {
    const p = FOCUS_PRESETS.find((item) => item.id === presetId);
    if (!p) return;

    if (timerState.isRunning || elapsed > 0) {
      if (
        !updateState({
          shortBreakMinutes: p.shortBreakMins,
          longBreakMinutes: p.longBreakMins,
          lastFocusDuration: p.focusMins,
          pendingPresetId: p.id,
        })
      ) {
        return;
      }
      toast.success(`Preset ${p.label} sẽ áp dụng từ phiên tiếp theo.`);
      return;
    }

    const mins =
      timerState.timerMode === "pomodoro"
        ? p.focusMins
        : timerState.timerMode === "shortBreak"
          ? p.shortBreakMins
          : p.longBreakMins;

    if (
      !updateState({
        durationMinutes: mins,
        shortBreakMinutes: p.shortBreakMins,
        longBreakMinutes: p.longBreakMins,
        lastFocusDuration: p.focusMins,
        accumulatedSeconds: 0,
        activeTimerSessionId: createStableId("timer"),
        status: "idle",
        activePresetId: p.id,
        pendingPresetId: undefined,
      })
    ) {
      return;
    }

    toast.success(`Đã chọn preset: ${p.label} (${p.description})`);
  };

  const handleFinishEarly = (markDone: boolean, showSummary = true): boolean => {
    const sessionId = timerState.activeTimerSessionId;
    if (savingSessionIdsRef.current.has(sessionId) || timerState.status === "saving") return false;
    if (
      timerState.isRunning &&
      !refreshTimerLock(timerState.activeTimerSessionId, timerTabIdRef.current)
    ) {
      toast.error("Phiên đang được điều khiển ở tab khác nên không thể kết thúc tại đây.");
      return false;
    }
    stopAmbientSound();
    const elapsedSeconds = calculateElapsedSeconds(timerState);
    if (timerState.timerMode !== "pomodoro") {
      const next: StoredTimerState = {
        ...timerState,
        timerMode: "pomodoro",
        durationMinutes: timerState.lastFocusDuration || 50,
        isRunning: false,
        startTimestamp: null,
        accumulatedSeconds: 0,
        activeTimerSessionId: createStableId("timer"),
        status: "session_waiting",
      };
      if (!persistTimerState(next)) return false;
      const released = releaseTimerLock(timerTabIdRef.current);
      if (!released.ok) toast.error(released.error);
      setCompletionSummary(null);
      setRecommitmentPrompt(true);
      toast.info("Đã kết thúc giờ nghỉ. Phiên tập trung tiếp theo đã sẵn sàng.");
      return true;
    }
    if (elapsedSeconds < MIN_SAVABLE_FOCUS_SECONDS) {
      toast.error(`Hãy học ít nhất ${MIN_SAVABLE_FOCUS_SECONDS} giây trước khi lưu phiên.`);
      return false;
    }
    const completedState: StoredTimerState = {
      ...timerState,
      isRunning: false,
      startTimestamp: null,
      accumulatedSeconds: 0,
      status: "completed",
      savedSessionIds: timerState.savedSessionIds.includes(sessionId)
        ? timerState.savedSessionIds
        : [...timerState.savedSessionIds, sessionId].slice(-100),
    };
    savingSessionIdsRef.current.add(sessionId);
    const session = createStudySession({
      id: sessionId,
      lessonId: timerState.lessonId,
      durationSeconds: elapsedSeconds,
      source: "focus-timer",
      timerPreset: timerState.activePresetId,
      reviewTaskId: timerState.reviewTaskId,
    });
    const persisted = recordFocusSessionAndTimerStateAtomically(session, completedState);
    if (!persisted.ok) {
      savingSessionIdsRef.current.delete(sessionId);
      toast.error(`${persisted.error} Phiên chưa được đánh dấu là đã lưu.`);
      return false;
    }
    savingSessionIdsRef.current.delete(sessionId);
    setTimerState(completedState);
    const released = releaseTimerLock(timerTabIdRef.current);
    if (!released.ok) toast.error(released.error);
    if (onRecordSession(session) === false) {
      toast.error(STORAGE_SYNC_ERROR);
      return false;
    }
    const savedMinutes = Math.round((elapsedSeconds / 60) * 10) / 10;
    const savedLabel =
      elapsedSeconds < 60 ? `${elapsedSeconds} giây` : `${savedMinutes} phút`;
    toast.success(`Đã lưu ${savedLabel} học thực tế.`);
    setCompletionSummary(
      showSummary
        ? {
            minutes: savedMinutes,
            lessonTitle: timerState.lessonTitle,
            nextMode: "shortBreak",
            nextMinutes: timerState.shortBreakMinutes,
          }
        : null,
    );

    if (timerState.reviewTaskId) {
      const targetReviewMinutes =
        timerState.reviewTargetMinutes ?? reviewTargetMinutes ?? timerState.durationMinutes;
      const shouldComplete =
        markDone || hasReachedReviewTarget(timerState.reviewTaskId, targetReviewMinutes);
      if (shouldComplete && onReviewComplete?.(timerState.reviewTaskId) === false) return false;
    } else if (markDone && onCompleteLesson && !isCompleted) {
      if (onCompleteLesson(timerState.lessonId) === false) return false;
    }
    return true;
  };

  const handleMarkComplete = (): boolean => {
    if (timerState.reviewTaskId) {
      if (!onReviewComplete || onReviewComplete(timerState.reviewTaskId) === false) return false;
      toast.success("Đã đánh dấu lượt ôn hôm nay hoàn thành.");
      return true;
    }
    if (!onCompleteLesson || isCompleted) return false;
    if (onCompleteLesson(timerState.lessonId) === false) return false;
    toast.success("Đã đánh dấu bài học hoàn thành.");
    return true;
  };

  const handleDurationChange = (newMins: number) => {
    const accumulatedSeconds = calculateElapsedSeconds(timerState);
    const minimumMinutes = Math.max(1, Math.ceil(accumulatedSeconds / 60));
    const nextMinutes = Math.max(newMins, minimumMinutes);
    if (nextMinutes !== newMins) {
      toast.info(
        `Bạn đã học ${formatTime(accumulatedSeconds)}; thời lượng không thể thấp hơn ${minimumMinutes} phút.`,
      );
    }
    updateState({
      durationMinutes: nextMinutes,
      lastFocusDuration:
        timerState.timerMode === "pomodoro" ? nextMinutes : timerState.lastFocusDuration,
      isRunning: false,
      startTimestamp: null,
      accumulatedSeconds,
      activeTimerSessionId:
        accumulatedSeconds > 0 ? timerState.activeTimerSessionId : createStableId("timer"),
      activePresetId: undefined,
      status: accumulatedSeconds > 0 ? "paused" : "idle",
    });
  };

  const handleAddExtraMinutes = (extraMins: number) => {
    if (
      !updateState({
        durationMinutes: timerState.durationMinutes + extraMins,
        activePresetId: undefined,
      })
    ) {
      return;
    }
    toast.info(`Đã gia hạn thêm +${extraMins} phút!`);
  };

  const handleToggleFullScreen = () => {
    setDisplayMode(isFullScreen ? "dialog" : "studio");
  };

  const discardTimerAndClose = (): boolean => {
    const cleared = saveStoredTimerState(null);
    if (!cleared.ok) {
      toast.error(cleared.error);
      return false;
    }
    const released = releaseTimerLock(timerTabIdRef.current);
    if (!released.ok) toast.error(released.error);
    stopAmbientSound();
    setStopDecisionOpen(false);
    setCompletionSummary(null);
    setTimerState(null);
    onClose();
    return true;
  };

  const handleCloseModal = () => {
    const currentElapsed = calculateElapsedSeconds(timerState);
    const hasActiveWork =
      timerState.isRunning || currentElapsed > 0 || timerState.status === "paused";
    if (hasActiveWork) {
      setStopDecisionOpen(true);
      return;
    }
    discardTimerAndClose();
  };

  const handleKeepMini = () => {
    if (!setDisplayMode("mini")) return;
    setStopDecisionOpen(false);
    toast.info(timerState.isRunning ? "Timer vẫn đang chạy ở chế độ thu nhỏ." : "Phiên tạm dừng đã được giữ ở mini timer.");
  };

  const handleSaveAndClose = () => {
    if (timerState.timerMode !== "pomodoro") {
      discardTimerAndClose();
      return;
    }
    if (!handleFinishEarly(false, false)) return;
    setStopDecisionOpen(false);
    onClose();
  };

  const handleTimerDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (timerState.isRunning) {
        setDisplayMode("mini");
        toast.info("Timer đang chạy đã được thu nhỏ; nhấn mở rộng để tiếp tục điều khiển.");
      } else {
        handleCloseModal();
      }
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute("aria-hidden"));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  // Theme color styles depending on mode
  const modeColors = {
    pomodoro: {
      bg: "from-rose-500/10 via-amber-500/5 to-white",
      ring: "stroke-rose-500",
      text: "text-rose-600",
      btn: "bg-rose-600 hover:bg-rose-700 text-white",
      badge: "bg-rose-100 text-rose-800 border-rose-200",
      accentBg: "bg-rose-50 border-rose-200 text-rose-900",
    },
    shortBreak: {
      bg: "from-emerald-500/10 via-teal-500/5 to-white",
      ring: "stroke-emerald-500",
      text: "text-emerald-600",
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      accentBg: "bg-emerald-50 border-emerald-200 text-emerald-900",
    },
    longBreak: {
      bg: "from-sky-500/10 via-indigo-500/5 to-white",
      ring: "stroke-sky-500",
      text: "text-sky-600",
      btn: "bg-sky-600 hover:bg-sky-700 text-white",
      badge: "bg-sky-100 text-sky-800 border-sky-200",
      accentBg: "bg-sky-50 border-sky-200 text-sky-900",
    },
  }[timerState.timerMode];

  const targetCycles = timerState.longBreakTargetCycles || 4;

  const startModeFromSummary = (mode: TimerMode, minutes: number) => {
    const sessionId = createStableId("timer");
    if (!acquireTimerLock(sessionId, timerTabIdRef.current)) {
      toast.error("Một tab khác đang chạy Pomodoro.");
      return;
    }
    const next: StoredTimerState = {
      ...timerState,
      timerMode: mode,
      durationMinutes: minutes,
      lastFocusDuration:
        mode === "pomodoro" ? timerState.lastFocusDuration : timerState.lastFocusDuration,
      activeTimerSessionId: sessionId,
      accumulatedSeconds: 0,
      startTimestamp: Date.now(),
      isRunning: true,
      status: "running",
    };
    if (!persistTimerState(next)) {
      releaseTimerLock(timerTabIdRef.current);
      return;
    }
    setCompletionSummary(null);
  };

  const handleExpiredDecision = (save: boolean) => {
    const sessionId = timerState.activeTimerSessionId;
    const totalSeconds = timerState.durationMinutes * 60;
    const isWarmup = timerState.timerMode === "pomodoro" && timerState.durationMinutes <= 2;
    const needsSessionRecord =
      save &&
      timerState.timerMode === "pomodoro" &&
      !timerState.savedSessionIds.includes(sessionId);
    const next: StoredTimerState = {
      ...timerState,
      isRunning: false,
      displayMode: save && isWarmup && timerState.displayMode === "mini" ? "dialog" : timerState.displayMode,
      isMinimized: save && isWarmup ? false : timerState.displayMode === "mini",
      startTimestamp: null,
      accumulatedSeconds: 0,
      status: save ? (isWarmup ? "warmup_completed" : "completed") : "idle",
      activeTimerSessionId: createStableId("timer"),
      expiredAt: undefined,
      savedSessionIds:
        save && !timerState.savedSessionIds.includes(sessionId)
          ? [...timerState.savedSessionIds, sessionId].slice(-100)
          : timerState.savedSessionIds,
    };
    const session = createStudySession({
      id: sessionId,
      lessonId: timerState.lessonId,
      durationSeconds: totalSeconds,
      source: "focus-timer",
      timerPreset: timerState.activePresetId,
      reviewTaskId: timerState.reviewTaskId,
      endedAt: timerState.expiredAt,
    });
    const rewards = calculateSessionRewards(timerState.durationMinutes);
    const persisted = needsSessionRecord
      ? recordFocusSessionAndTimerStateAtomically(session, next, rewards)
      : saveStoredTimerState(next);
    if (!persisted.ok) {
      toast.error(`${persisted.error} Phiên chưa được đánh dấu là đã lưu.`);
      return;
    }
    setExpiredPrompt(false);
    setTimerState(next);
    if (needsSessionRecord && isCommittedFocusSession(persisted) && persisted.rewardsApplied) {
      onRewardsCommitted?.({
        xp: rewards.xp,
        coins: rewards.coins,
        previousXp: persisted.previousXp,
        nextXp: persisted.nextXp,
      });
    }
    if (needsSessionRecord && onRecordSession(session) === false) {
      toast.error(STORAGE_SYNC_ERROR);
      return;
    }
    if (needsSessionRecord && timerState.reviewTaskId) {
      const targetReviewMinutes =
        timerState.reviewTargetMinutes ?? reviewTargetMinutes ?? timerState.durationMinutes;
      if (
        hasReachedReviewTarget(timerState.reviewTaskId, targetReviewMinutes) &&
        onReviewComplete?.(timerState.reviewTaskId) === false
      ) {
        return;
      }
    }
    if (needsSessionRecord && !timerState.reviewTaskId && !isWarmup) {
      const lessonTargetMinutes = timerState.targetMinutes ?? targetMinutes;
      if (lessonTargetMinutes && onCompleteLesson && !isCompleted) {
        const loaded = loadProgressStorage();
        if (
          loaded.status === "ok" &&
          getLessonCompletedSeconds(timerState.lessonId, loaded.value) >= lessonTargetMinutes * 60 &&
          onCompleteLesson(timerState.lessonId) === false
        ) {
          return;
        }
      }
    }
    if (needsSessionRecord && !isWarmup) {
      setCompletionSummary({
        minutes: timerState.durationMinutes,
        lessonTitle: timerState.lessonTitle,
        nextMode: "shortBreak",
        nextMinutes: timerState.shortBreakMinutes,
      });
    } else {
      setCompletionSummary(null);
    }
    toast[save ? "success" : "info"](
      save ? `Đã lưu ${timerState.durationMinutes} phút học.` : "Đã bỏ qua phiên hết hạn.",
    );
  };

  const handleReturnToToday = () => {
    const cleared = saveStoredTimerState(null);
    if (!cleared.ok) {
      toast.error(cleared.error);
      return;
    }
    const released = releaseTimerLock(timerTabIdRef.current);
    if (!released.ok) toast.error(released.error);
    setCompletionSummary(null);
    setTimerState(null);
    onClose();
  };

  const sharedDialogs = (
    <>
      {stopDecisionOpen && (
        <div
          data-timer-overlay="true"
          role="dialog"
          aria-modal="true"
          aria-label="Xử lý phiên tập trung trước khi đóng"
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-semibold text-slate-900">
              {timerState.timerMode === "pomodoro" ? "Phiên học chưa kết thúc" : "Giờ nghỉ đang mở"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {timerState.timerMode === "pomodoro"
                ? `Bạn đã học ${formatTime(calculateElapsedSeconds(timerState))}. Chọn cách xử lý trước khi đóng.`
                : `Giờ nghỉ đang ở ${formatTime(calculateElapsedSeconds(timerState))}.`}
            </p>
            <div className="mt-5 grid gap-2">
              <Button onClick={handleKeepMini}>Giữ ở mini timer</Button>
              <Button
                variant="outline"
                onClick={handleSaveAndClose}
                disabled={
                  timerState.timerMode === "pomodoro" &&
                  calculateElapsedSeconds(timerState) < MIN_SAVABLE_FOCUS_SECONDS
                }
              >
                {timerState.timerMode === "pomodoro" ? "Kết thúc, lưu và đóng" : "Kết thúc nghỉ và đóng"}
              </Button>
              <Button
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={discardTimerAndClose}
              >
                Bỏ phiên và đóng
              </Button>
              <Button variant="ghost" onClick={() => setStopDecisionOpen(false)}>
                Quay lại timer
              </Button>
            </div>
          </div>
        </div>
      )}
      <SaveTimeInfoDialog open={showSaveInfo} onClose={() => setShowSaveInfo(false)} />
      <TimerRecoveryDialogs
        expiredPrompt={expiredPrompt}
        lessonTitle={timerState.lessonTitle}
        durationMinutes={timerState.durationMinutes}
        completionSummary={completionSummary}
        canCompleteLesson={Boolean(onCompleteLesson && !isCompleted && !timerState.reviewTaskId)}
        onExpiredDecision={handleExpiredDecision}
        onCompleteLesson={handleMarkComplete}
        onStartMode={startModeFromSummary}
        onReturnToday={handleReturnToToday}
        lastFocusDuration={timerState.lastFocusDuration}
      />
      <RecommitmentDialog
        open={recommitmentPrompt && timerState.status === "session_waiting"}
        lessonTitle={timerState.lessonTitle}
        onContinueNext={() => {
          if (!startFocusDuration(timerState, timerState.lastFocusDuration || 25)) return;
          setRecommitmentPrompt(false);
        }}
        onExtendBreak={() => {
          startModeFromSummary("shortBreak", 5);
          setRecommitmentPrompt(false);
        }}
        onFinishSession={handleReturnToToday}
      />
      <MicroStartDialog
        open={timerState.status === "warmup_completed"}
        onContinue={(minutes) => {
          if (!startFocusDuration(timerState, minutes)) return;
          toast.success(`Đã tự động bắt đầu phiên ${minutes} phút.`);
        }}
        onFinish={() => {
          toast.info("Đã ghi nhận phiên khởi động 2 phút.");
          handleReturnToToday();
        }}
      />
    </>
  );

  // Minimized Widget view
  if (timerState.displayMode === "mini") {
    return createPortal(
      <>
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl border border-rose-200 bg-white/95 p-3 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center gap-2">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-bold">
              <span className="text-lg">{MODE_DEFAULTS[timerState.timerMode].emoji}</span>
            </div>
            <div>
              <div className="text-xs font-semibold max-w-[150px] truncate">
                {timerState.lessonTitle}
              </div>
              <div className="text-sm font-bold text-rose-600 font-mono">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full"
              onClick={handleStartPause}
              data-timer-action="start-pause"
              aria-label={
                timerState.isRunning ? "Tạm dừng phiên tập trung" : "Bắt đầu phiên tập trung"
              }
            >
              {timerState.isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full"
              onClick={() => setDisplayMode("dialog")}
              title="Mở rộng"
              aria-label="Mở rộng đồng hồ tập trung"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-rose-500"
              onClick={handleCloseModal}
              title="Đóng"
              aria-label="Đóng đồng hồ tập trung"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {sharedDialogs}
      </>,
      document.body,
    );
  }

  // Render full screen mode as a clean, single-page (100vh non-scrollable) 2-column view
  if (isFullScreen) {
    return createPortal(
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Đồng hồ tập trung"
        onKeyDown={handleTimerDialogKeyDown}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-md animate-in fade-in transition-all duration-300 p-0"
      >
        <div className="relative h-dvh min-h-dvh w-screen overflow-y-auto border-0 bg-gradient-to-br from-white via-slate-50/80 to-slate-100/60 p-4 shadow-2xl md:p-6 flex flex-col">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 font-extrabold text-base shadow-xs">
                🍅
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-800">Phiên tập trung</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 flex items-center gap-1 border border-rose-200">
                    <Sparkles className="h-3 w-3" /> Phóng to Web
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Timer học · nghỉ thông minh · chạy nền chính xác
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full bg-slate-200 text-slate-800 hover:bg-slate-300"
                onClick={handleToggleFullScreen}
                title="Thu nhỏ về dạng Modal"
                aria-label="Thu nhỏ đồng hồ tập trung"
              >
                <Minimize className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100"
                onClick={() => setDisplayMode("mini")}
                title="Thu nhỏ góc màn hình"
                aria-label="Thu nhỏ đồng hồ tập trung về góc màn hình"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100"
                onClick={handleCloseModal}
                aria-label="Đóng đồng hồ tập trung"
                ref={closeButtonRef}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main 2-Column Content Area */}
          <div className="flex w-full max-w-6xl flex-1 items-center justify-center py-2 mx-auto md:min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center w-full max-h-full">
              {/* Left Column: Lesson Title, Ring Timer, Session Counters & Primary Actions */}
              <div className="md:col-span-5 flex flex-col items-center justify-center text-center space-y-3">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Bài học hiện tại
                  </div>
                  <h2 className="font-serif font-bold text-slate-800 text-lg md:text-xl lg:text-2xl max-w-md mx-auto line-clamp-2">
                    {timerState.lessonTitle}
                  </h2>
                </div>

                {/* Pomodoro Session Counters */}
                <div className="flex justify-center items-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-500 mr-1">
                    Tiến độ vòng lặp:
                  </span>
                  {Array.from({ length: targetCycles }).map((_, idx) => {
                    const sessionInCycle = timerState.completedPomodoros % targetCycles;
                    const isFilled =
                      idx < sessionInCycle ||
                      (sessionInCycle === 0 && timerState.completedPomodoros > 0);
                    return (
                      <span
                        key={idx}
                        className={cn(
                          "text-lg transition-transform",
                          isFilled ? "scale-110 opacity-100" : "opacity-30",
                        )}
                        title={`Phiên ${idx + 1}/${targetCycles}`}
                      >
                        🍅
                      </span>
                    );
                  })}
                  <span className="text-xs font-bold text-slate-700 ml-1">
                    ({timerState.completedPomodoros} phiên)
                  </span>
                </div>

                {/* Dynamic Ring Timer */}
                <div
                  className={cn(
                    "relative mx-auto flex items-center justify-center rounded-full border-4 border-slate-100 bg-gradient-to-b shadow-inner transition-all duration-500 shrink-0",
                    modeColors.bg,
                    "h-48 w-48 lg:h-56 lg:w-56",
                  )}
                >
                  <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 192 192">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      className="stroke-slate-100"
                      strokeWidth="8"
                      fill="none"
                    />
                    {progressPercent > 0 && (
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        className={cn("transition-all duration-1000", modeColors.ring)}
                        strokeWidth="8"
                        strokeDasharray={552.92}
                        strokeDashoffset={552.92 - (552.92 * progressPercent) / 100}
                        strokeLinecap="round"
                        fill="none"
                      />
                    )}
                  </svg>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="font-mono font-extrabold tracking-tight text-slate-800 text-3xl lg:text-4xl">
                      {formatTime(timeLeft)}
                    </div>
                    <div
                      className={cn(
                        "mt-1 text-xs font-semibold flex items-center gap-1",
                        modeColors.text,
                      )}
                    >
                      {timerState.isRunning ? (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                          </span>
                          <span>Đang đếm giờ...</span>
                        </>
                      ) : (
                        <span>Sẵn sàng</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="w-full space-y-2 pt-1 max-w-sm">
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      onClick={handleReset}
                      data-timer-action="reset"
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-full border-slate-200 shrink-0"
                      title="Đặt lại"
                    >
                      <RotateCcw className="h-4 w-4 text-slate-600" />
                    </Button>

                    <Button
                      onClick={handleStartPause}
                      data-timer-action="start-pause"
                      className={cn(
                        "h-11 px-8 rounded-full font-bold text-sm shadow-md transition-all flex-1 min-w-[140px]",
                        timerState.isRunning
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : modeColors.btn,
                      )}
                    >
                      {timerState.isRunning ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" /> Tạm dừng
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" /> Bắt đầu
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="flex-1 rounded-xl text-xs font-semibold relative h-9"
                      onClick={() => handleFinishEarly(false)}
                      data-timer-action="save"
                      disabled={
                        timerState.status === "saving" ||
                        (timerState.timerMode === "pomodoro" && elapsed <= 0)
                      }
                    >
                      <span>
                        {timerState.timerMode === "pomodoro"
                          ? `Kết thúc và lưu ${elapsedMinutes > 0 ? `${elapsedMinutes}p` : "<1p"}`
                          : "Kết thúc giờ nghỉ"}
                      </span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSaveInfo(true);
                        }}
                        className="ml-1 text-slate-400 hover:text-rose-600 p-0.5 rounded-full"
                        title="Giải thích nút Lưu thời gian"
                      >
                        <HelpCircle className="h-3.5 w-3.5 inline" />
                      </span>
                    </Button>
                    {timerState.timerMode === "pomodoro" && (
                      <Button
                        variant="default"
                        className="flex-1 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white h-9"
                        onClick={() =>
                          elapsed >= MIN_SAVABLE_FOCUS_SECONDS
                            ? handleFinishEarly(true)
                            : handleMarkComplete()
                        }
                        disabled={
                          timerState.reviewTaskId
                            ? !onReviewComplete
                            : !onCompleteLesson || Boolean(isCompleted)
                        }
                      >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        {elapsed >= MIN_SAVABLE_FOCUS_SECONDS
                          ? timerState.reviewTaskId
                            ? "Lưu & hoàn thành lượt ôn"
                            : "Lưu & hoàn thành bài"
                          : timerState.reviewTaskId
                            ? "Đánh dấu đã ôn"
                            : "Đánh dấu hoàn thành"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Settings, Presets, Audio & Customization */}
              <div className="md:col-span-7 flex flex-col justify-center space-y-3 bg-white/80 p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                {/* Notification Permission Indicator Bar */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100 text-xs">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    {notifPermission === "granted" ? (
                      <Bell className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <BellOff className="h-3.5 w-3.5 text-amber-600" />
                    )}
                    Thông báo tab/màn hình khác:
                  </span>
                  {notifPermission === "granted" ? (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Đã bật ✓
                    </span>
                  ) : (
                    <button
                      onClick={handleRequestNotif}
                      aria-label="Bật thông báo trình duyệt"
                      className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-200 transition-colors"
                    >
                      Bật thông báo trình duyệt
                    </button>
                  )}
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex rounded-xl bg-slate-100 p-1">
                  {(["pomodoro", "shortBreak", "longBreak"] as TimerMode[]).map((m) => {
                    const def = MODE_DEFAULTS[m];
                    const isSelected = timerState.timerMode === m;
                    return (
                      <button
                        key={m}
                        onClick={() => handleSwitchMode(m)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all",
                          isSelected
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-500 hover:text-slate-800",
                        )}
                      >
                        <span>{def.emoji}</span>
                        <span>{def.title}</span>
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full rounded-xl text-xs"
                  onClick={() => setShowAdvanced((value) => !value)}
                >
                  {showAdvanced ? "Ẩn tùy chỉnh nâng cao" : "Hiện tùy chỉnh nâng cao"}
                </Button>
                <div className={cn("space-y-3", !showAdvanced && "hidden")}>
                  {/* Preset Selection Combo Buttons */}
                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                    <div className="text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center justify-between px-1">
                      <span>Preset Pomodoro:</span>
                      <span className="text-rose-600 font-medium">Tập trung / Nghỉ</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {FOCUS_PRESETS.map((p) => {
                        const isActive =
                          (timerState.pendingPresetId ?? timerState.activePresetId) === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => handleApplyPreset(p.id)}
                            className={cn(
                              "py-1.5 px-1 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center",
                              isActive
                                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100",
                            )}
                            title={p.description}
                          >
                            <span>{p.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <p className="rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2 text-[11px] text-indigo-800">
                    Hành vi tự động và âm báo được quản lý trong Pomodoro Studio.
                  </p>

                  {/* Long Break Target Cycle Toggle (3 or 4 sessions) */}
                  <div className="flex items-center justify-between rounded-xl bg-amber-50/70 px-3 py-1.5 border border-amber-200/80 text-xs">
                    <span className="text-amber-900 font-medium flex items-center gap-1">
                      🌴 Nghỉ dài sau:
                    </span>
                    <div className="flex items-center gap-1">
                      {[3, 4].map((cycles) => (
                        <button
                          key={cycles}
                          onClick={() => updateState({ longBreakTargetCycles: cycles })}
                          className={cn(
                            "px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all border",
                            targetCycles === cycles
                              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                              : "bg-white text-amber-800 border-amber-200 hover:bg-amber-100/50",
                          )}
                        >
                          {cycles} phiên học
                        </button>
                      ))}
                    </div>
                  </div>
                  <DurationSelector
                    value={timerState.durationMinutes}
                    disabled={timerState.isRunning}
                    onChange={handleDurationChange}
                    onAddExtra={handleAddExtraMinutes}
                  />

                  <AmbientSoundSelector
                    value={timerState.ambientSound}
                    onChange={(ambientSound) => updateState({ ambientSound })}
                    optionClassName="flex-1"
                  />

                </div>
              </div>
            </div>
          </div>

          {sharedDialogs}
        </div>
      </div>,
      document.body,
    );
  }

  // Unified Light Modal View (Handles standard floating modal)
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Đồng hồ tập trung"
      onKeyDown={handleTimerDialogKeyDown}
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-md animate-in fade-in transition-all duration-300",
        isFullScreen ? "p-0" : "p-4",
      )}
    >
      <div
        className={cn(
          "relative w-full border border-white/80 bg-white shadow-2xl transition-all duration-300 overflow-y-auto flex flex-col justify-between",
          isFullScreen
            ? "h-full w-full max-w-none rounded-none p-6 md:p-10 bg-gradient-to-br from-white via-slate-50/80 to-slate-100/60"
            : "max-w-md rounded-3xl max-h-[92vh] p-5 md:p-6",
        )}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 font-extrabold text-lg shadow-xs">
              🍅
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-800">Phiên tập trung</h3>
                {isFullScreen && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 flex items-center gap-1 border border-rose-200">
                    <Sparkles className="h-3 w-3" /> Phóng to Web
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Timer học · nghỉ thông minh · chạy nền chính xác
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Toggle Full Web View (Preserves color & theme) */}
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-8 w-8 rounded-full transition-colors",
                isFullScreen ? "bg-slate-200 text-slate-800" : "text-slate-500 hover:bg-slate-100",
              )}
              onClick={handleToggleFullScreen}
              title={isFullScreen ? "Thu nhỏ về dạng Modal" : "Phóng to toàn khung Web"}
              aria-label={isFullScreen ? "Thu nhỏ đồng hồ tập trung" : "Phóng to đồng hồ tập trung"}
            >
              {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>

            {/* Minimize Widget */}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100"
              onClick={() => setDisplayMode("mini")}
              title="Thu nhỏ góc màn hình"
              aria-label="Thu nhỏ đồng hồ tập trung về góc màn hình"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>

            {/* Close */}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100"
              onClick={handleCloseModal}
              aria-label="Đóng đồng hồ tập trung"
              ref={closeButtonRef}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notification Permission Indicator Bar */}
        <div className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100 text-xs">
          <span className="text-slate-600 font-medium flex items-center gap-1.5">
            {notifPermission === "granted" ? (
              <Bell className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <BellOff className="h-3.5 w-3.5 text-amber-600" />
            )}
            Thông báo tab khác / màn hình khác:
          </span>
          {notifPermission === "granted" ? (
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Đã bật ✓
            </span>
          ) : (
            <button
              onClick={handleRequestNotif}
              aria-label="Bật thông báo trình duyệt"
              className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-200 transition-colors"
            >
              Bật thông báo trình duyệt
            </button>
          )}
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-2.5 flex rounded-2xl bg-slate-100 p-1">
          {(["pomodoro", "shortBreak", "longBreak"] as TimerMode[]).map((m) => {
            const def = MODE_DEFAULTS[m];
            const isSelected = timerState.timerMode === m;
            return (
              <button
                key={m}
                onClick={() => handleSwitchMode(m)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all",
                  isSelected
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800",
                )}
              >
                <span>{def.emoji}</span>
                <span>{def.title}</span>
              </button>
            );
          })}
        </div>

        {/* Central Content Section */}
        <div className="py-3 text-center my-auto">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
            Bài học hiện tại
          </div>
          <h2
            className={cn(
              "font-serif font-bold text-slate-800 mx-auto break-words mb-2",
              isFullScreen ? "text-xl md:text-2xl max-w-xl" : "text-base max-w-xs",
            )}
          >
            {timerState.lessonTitle}
          </h2>

          <Button
            variant="ghost"
            size="sm"
            className="mb-2 rounded-xl text-xs"
            onClick={() => setShowAdvanced((value) => !value)}
          >
            {showAdvanced ? "Ẩn tùy chỉnh nâng cao" : "Hiện tùy chỉnh nâng cao"}
          </Button>
          <div className={cn(!showAdvanced && "hidden")}>
            {/* Preset Selection Combo Buttons */}
            <div className="mb-2.5 rounded-2xl bg-slate-50 p-2 border border-slate-100">
              <div className="text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center justify-between px-1">
                <span>Preset Pomodoro:</span>
                <span className="text-rose-600 font-medium">Tập trung / Nghỉ</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {FOCUS_PRESETS.map((p) => {
                  const isActive =
                    (timerState.pendingPresetId ?? timerState.activePresetId) === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleApplyPreset(p.id)}
                      className={cn(
                        "py-1.5 px-1 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center",
                        isActive
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100",
                      )}
                      title={p.description}
                    >
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Long Break Target Cycle Toggle (3 or 4 sessions) */}
            <div className="mb-2.5 flex items-center justify-between rounded-xl bg-amber-50/70 px-3 py-1.5 border border-amber-200/80 text-xs">
              <span className="text-amber-900 font-medium flex items-center gap-1">
                🌴 Nghỉ dài sau:
              </span>
              <div className="flex items-center gap-1">
                {[3, 4].map((cycles) => (
                  <button
                    key={cycles}
                    onClick={() => updateState({ longBreakTargetCycles: cycles })}
                    className={cn(
                      "px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all border",
                      targetCycles === cycles
                        ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                        : "bg-white text-amber-800 border-amber-200 hover:bg-amber-100/50",
                    )}
                  >
                    {cycles} phiên học
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pomodoro Session Counters */}
          <div className="flex justify-center items-center gap-1.5 mb-2.5">
            <span className="text-[11px] font-medium text-slate-500 mr-1">Tiến độ vòng lặp:</span>
            {Array.from({ length: targetCycles }).map((_, idx) => {
              const sessionInCycle = timerState.completedPomodoros % targetCycles;
              const isFilled =
                idx < sessionInCycle || (sessionInCycle === 0 && timerState.completedPomodoros > 0);
              return (
                <span
                  key={idx}
                  className={cn(
                    "text-lg transition-transform",
                    isFilled ? "scale-110 opacity-100" : "opacity-30",
                  )}
                  title={`Phiên ${idx + 1}/${targetCycles}`}
                >
                  🍅
                </span>
              );
            })}
            <span className="text-xs font-bold text-slate-700 ml-1">
              ({timerState.completedPomodoros} phiên)
            </span>
          </div>

          {/* Dynamic Ring Timer */}
          <div
            className={cn(
              "relative mx-auto flex items-center justify-center rounded-full border-4 border-slate-100 bg-gradient-to-b shadow-inner transition-all duration-500",
              modeColors.bg,
              isFullScreen ? "h-56 w-56 md:h-64 md:w-64" : "h-44 w-44",
            )}
          >
            <svg
              className="absolute inset-0 h-full w-full -rotate-90"
              viewBox="0 0 192 192"
              role="progressbar"
              aria-label="Tiến độ phiên tập trung"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progressPercent)}
            >
              <circle
                cx="96"
                cy="96"
                r="88"
                className="stroke-slate-100"
                strokeWidth="8"
                fill="none"
              />
              {progressPercent > 0 && (
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  className={cn("transition-all duration-1000", modeColors.ring)}
                  strokeWidth="8"
                  strokeDasharray={552.92}
                  strokeDashoffset={552.92 - (552.92 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </svg>

            <div className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  "font-mono font-extrabold tracking-tight text-slate-800",
                  isFullScreen ? "text-4xl md:text-5xl" : "text-3xl",
                )}
              >
                {formatTime(timeLeft)}
              </div>
              <div
                className={cn(
                  "mt-1 text-xs font-semibold flex items-center gap-1",
                  modeColors.text,
                )}
              >
                {timerState.isRunning ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    <span>Đang đếm giờ...</span>
                  </>
                ) : (
                  <span>Sẵn sàng</span>
                )}
              </div>
            </div>
          </div>

          <div className={cn(!showAdvanced && "hidden")}>
            <DurationSelector
              value={timerState.durationMinutes}
              disabled={timerState.isRunning}
              onChange={handleDurationChange}
              onAddExtra={handleAddExtraMinutes}
              compact
            />

            <AmbientSoundSelector
              value={timerState.ambientSound}
              onChange={(ambientSound) => updateState({ ambientSound })}
              className="mx-auto mt-2.5 max-w-md rounded-2xl p-2"
            />

            <p className="mx-auto mt-2.5 max-w-md rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2 text-center text-[11px] text-indigo-800">
              Hành vi tự động và âm báo được quản lý trong Pomodoro Studio.
            </p>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={handleReset}
              data-timer-action="reset"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-slate-200"
              title="Đặt lại"
              aria-label="Đặt lại đồng hồ tập trung"
            >
              <RotateCcw className="h-5 w-5 text-slate-600" />
            </Button>

            <Button
              onClick={handleStartPause}
              data-timer-action="start-pause"
              className={cn(
                "h-13 px-8 rounded-full font-bold text-base shadow-md transition-all min-w-[160px]",
                timerState.isRunning
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : modeColors.btn,
              )}
            >
              {timerState.isRunning ? (
                <>
                  <Pause className="mr-2 h-5 w-5" /> Tạm dừng
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" /> Bắt đầu
                </>
              )}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1 rounded-xl text-xs font-semibold relative"
              onClick={() => handleFinishEarly(false)}
              data-timer-action="save"
              disabled={
                timerState.status === "saving" ||
                (timerState.timerMode === "pomodoro" && elapsed <= 0)
              }
            >
              <span>
                {timerState.timerMode === "pomodoro"
                  ? `Kết thúc và lưu ${elapsedMinutes > 0 ? `${elapsedMinutes}p` : "<1p"}`
                  : "Kết thúc giờ nghỉ"}
              </span>
              <span className="ml-1.5 text-slate-400" aria-hidden="true">
                <HelpCircle className="h-3.5 w-3.5 inline" />
              </span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => setShowSaveInfo(true)}
              aria-label="Giải thích nút lưu thời gian"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            {timerState.timerMode === "pomodoro" && (
              <Button
                variant="default"
                className="flex-1 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() =>
                  elapsed >= MIN_SAVABLE_FOCUS_SECONDS
                    ? handleFinishEarly(true)
                    : handleMarkComplete()
                }
                disabled={
                  timerState.reviewTaskId
                    ? !onReviewComplete
                    : !onCompleteLesson || Boolean(isCompleted)
                }
              >
                <Check className="mr-1 h-3.5 w-3.5" />
                {elapsed >= MIN_SAVABLE_FOCUS_SECONDS
                  ? timerState.reviewTaskId
                    ? "Lưu & hoàn thành lượt ôn"
                    : "Lưu & hoàn thành bài"
                  : timerState.reviewTaskId
                    ? "Đánh dấu đã ôn"
                    : "Đánh dấu hoàn thành"}
              </Button>
            )}
          </div>
        </div>

        {sharedDialogs}
      </div>
    </div>,
    document.body,
  );
}
