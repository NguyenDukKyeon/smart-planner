import { useState, useEffect, useMemo } from "react";
import {
  Flame,
  Star,
  Coins,
  Sparkles,
  BookOpen,
  Settings,
  Pencil,
  Check,
  X,
  BellRing,
  Clock3,
  Download,
} from "lucide-react";
import { DuotoneIcon } from "./DuotoneIcon";
import { CourseImportExportModal } from "./CourseImportExportModal";
import { SettingsModal } from "./SettingsModal";
import { RewardShopModal } from "./RewardShopModal";
import { type HabitDef, type Subject } from "@/lib/mock-data";
import type { HabitEntry, Reminder, Goals, WeekStats, ProgressState } from "@/lib/progress-store";
import { getLevelTitle, getXpProgressInCurrentLevel } from "@/lib/progress-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { PushNotificationPayload } from "@/lib/push-notification-store";
import { usePwaInstall } from "@/lib/pwa-client";
import {
  calculateElapsedSeconds,
  FOCUS_TIMER_OPEN_EVENT,
  getStoredTimerState,
  type StoredTimerState,
} from "@/lib/focus-timer-store";
import { FOCUS_PREFERENCES_EVENT, loadFocusPreferences } from "@/lib/focus-preferences";

const IDENTITY_TITLE_CHOICES = [
  "Sĩ Tử Kỷ Luật",
  "Kỹ Sư Tư Duy Bền Vững",
  "Người Tự Học Tự Chủ",
  "Chân Nhân Học Thuật",
  "Tân Binh Bứt Phá",
];

type Props = {
  level: number;
  xp: number;
  xpInLevel: number;
  coins: number;
  streak: number;
  studyStreak?: number;
  currentSubjects: Subject[];
  onSubjectsUpdated: (subjects: Subject[]) => void;
  reminders?: Record<string, Reminder>;
  today?: HabitEntry;
  completedLessons?: Record<string, string>;
  shiftedDates?: Record<string, string>;
  onSetReminder?: (habitId: string, patch: Partial<Reminder>) => void;
  goals?: Goals;
  weekStats?: WeekStats;
  achievementPoints?: number;
  pointsInLevel?: number;
  onSetGoals?: (patch: Partial<Goals>) => void;
  progress: ProgressState;
  habitDefinitions: HabitDef[];
  onResetOnboarding?: () => void;
  onOpenPushCenter?: () => void;
  onTriggerPush?: (payload: PushNotificationPayload) => void;
  onBuyStreakFreeze?: () => boolean;
  onClaimReward?: (reward: { id: string; title: string; cost: number }) => boolean;
  onAddCustomReward?: (reward: { title: string; cost: number; icon: string }) => void;
  activeTimerLesson?: { id: string; title: string } | null;
};

export function TopBar({
  level,
  xp,
  xpInLevel,
  coins,
  streak,
  studyStreak = 0,
  currentSubjects,
  onSubjectsUpdated,
  reminders = {},
  today = {},
  completedLessons = {},
  shiftedDates = {},
  onSetReminder,
  goals,
  weekStats,
  achievementPoints = 0,
  pointsInLevel = 0,
  onSetGoals,
  progress,
  habitDefinitions,
  onResetOnboarding,
  onOpenPushCenter,
  onTriggerPush,
  onBuyStreakFreeze,
  onClaimReward,
  onAddCustomReward,
  activeTimerLesson = null,
}: Props) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<
    "pomodoro" | "reminders" | "goals" | "appearance" | "data"
  >("pomodoro");
  const pwaInstall = usePwaInstall();
  const [isRewardShopOpen, setIsRewardShopOpen] = useState(false);
  const [workspaceTitle, setWorkspaceTitle] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hocvien-workspace-title-v1");
      if (saved && saved.trim()) return saved.trim();
    }
    return "Học viên lớp 11";
  });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(workspaceTitle);
  const [timerSnapshot, setTimerSnapshot] = useState<StoredTimerState | null>(null);
  const [showTimerInHeader, setShowTimerInHeader] = useState(
    () => loadFocusPreferences().showTimerInHeader,
  );

  const [identityTitle, setIdentityTitle] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hocvien-identity-title-v1");
      if (saved && saved.trim()) return saved.trim();
    }
    return "";
  });
  const [isIdentityDialogOpen, setIsIdentityDialogOpen] = useState(false);
  const [identityDraft, setIdentityDraft] = useState("");

  useEffect(() => {
    const refreshPreferences = () => setShowTimerInHeader(loadFocusPreferences().showTimerInHeader);
    window.addEventListener(FOCUS_PREFERENCES_EVENT, refreshPreferences);
    window.addEventListener("storage", refreshPreferences);
    return () => {
      window.removeEventListener(FOCUS_PREFERENCES_EVENT, refreshPreferences);
      window.removeEventListener("storage", refreshPreferences);
    };
  }, []);

  useEffect(() => {
    const refreshTimer = () => setTimerSnapshot(activeTimerLesson ? getStoredTimerState() : null);
    refreshTimer();
    if (!activeTimerLesson) return;
    const interval = window.setInterval(refreshTimer, 1000);
    return () => window.clearInterval(interval);
  }, [activeTimerLesson]);

  const timerHeaderLabel = useMemo(() => {
    if (!timerSnapshot) return null;
    if (timerSnapshot.status === "warmup_completed") return "Đã xong 2 phút";
    if (timerSnapshot.status === "session_waiting") return "Chờ phiên tiếp theo";
    const total = timerSnapshot.durationMinutes * 60;
    const remaining = Math.max(0, Math.ceil(total - calculateElapsedSeconds(timerSnapshot)));
    const minutes = Math.floor(remaining / 60);
    const seconds = String(remaining % 60).padStart(2, "0");
    const isBreak = timerSnapshot.timerMode !== "pomodoro";
    const status = timerSnapshot.isRunning
      ? isBreak
        ? "Đang nghỉ"
        : "Đang học"
      : isBreak
        ? "Tạm dừng nghỉ"
        : "Tạm dừng học";
    return `${status} · ${minutes}:${seconds}`;
  }, [timerSnapshot]);

  const levelInfo = useMemo(() => getLevelTitle(level), [level]);

  const handleSaveIdentityTitle = () => {
    setIdentityDraft(identityTitle || levelInfo.title);
    setIsIdentityDialogOpen(true);
  };

  const saveIdentityTitle = () => {
    const choices = [
      "Sĩ Tử Kỷ Luật",
      "Kỹ Sư Tư Duy Bền Vững",
      "Người Tự Học Tự Chủ",
      "Chân Nhân Học Thuật",
      "Tân Binh Bứt Phá",
    ];
    const num = parseInt(identityDraft, 10);
    let finalTitle = identityDraft.trim();
    if (num >= 1 && num <= choices.length) {
      finalTitle = choices[num - 1];
    }
    if (finalTitle) {
      setIdentityTitle(finalTitle);
      if (typeof window !== "undefined") {
        localStorage.setItem("hocvien-identity-title-v1", finalTitle);
      }
      toast.success(`Đã cập nhật bản sắc: "${finalTitle}"`);
    }
    setIsIdentityDialogOpen(false);
  };

  const handleSaveTitle = () => {
    const trimmed = tempTitle.trim() || "Học viên lớp 11";
    setWorkspaceTitle(trimmed);
    setIsEditingTitle(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("hocvien-workspace-title-v1", trimmed);
    }
  };

  const xpProgress = useMemo(() => getXpProgressInCurrentLevel(xp), [xp]);
  const pct = xpProgress.percentage;

  return (
    <header className="mb-6 flex flex-wrap items-center gap-4 rounded-3xl bg-white/70 p-4 shadow-soft backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-300 to-emerald-300 text-2xl shadow-soft">
          🦉
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Chào bạn!
          </div>
          {isEditingTitle ? (
            <div className="flex items-center gap-1 mt-0.5">
              <input
                type="text"
                aria-label="Tên không gian học tập"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") setIsEditingTitle(false);
                }}
                className="h-8 rounded-lg border border-sky-300 bg-white px-2 font-serif text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-sky-400"
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                className="p-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                title="Lưu tên"
                aria-label="Lưu tên không gian học tập"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsEditingTitle(false)}
                className="p-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Hủy"
                aria-label="Hủy đổi tên không gian học tập"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="group flex items-center gap-1.5 font-serif text-lg font-semibold text-foreground">
              <span>{workspaceTitle}</span>
              <button
                onClick={() => {
                  setTempTitle(workspaceTitle);
                  setIsEditingTitle(true);
                }}
                className="p-1 text-slate-400 opacity-60 group-hover:opacity-100 hover:text-sky-600 transition-opacity"
                title="Đổi tên không gian học tập"
                aria-label="Đổi tên không gian học tập"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        {showTimerInHeader && activeTimerLesson && timerSnapshot && timerHeaderLabel && (
          <button
            type="button"
            className="flex max-w-[240px] items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-left text-xs text-rose-900 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            onClick={() => window.dispatchEvent(new Event(FOCUS_TIMER_OPEN_EVENT))}
            aria-label={`Mở Pomodoro cho ${activeTimerLesson.title}`}
          >
            <Clock3 className="h-4 w-4 shrink-0 text-rose-600" />
            <span className="min-w-0">
              <span className="block truncate font-semibold">{activeTimerLesson.title}</span>
              <span className="block text-[11px] text-rose-700">{timerHeaderLabel}</span>
            </span>
          </button>
        )}
        <div id="roadmap-import-trigger">
          <CourseImportExportModal
            currentSubjects={currentSubjects}
            onSubjectsUpdated={onSubjectsUpdated}
            progress={progress}
          />
        </div>

        {pwaInstall.canInstall && (
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              const installed = await pwaInstall.install();
              if (installed) toast.success("Đã cài ứng dụng lên thiết bị.");
            }}
            className="h-9 gap-1.5 rounded-2xl border-sky-200 bg-white text-xs font-semibold text-sky-800 hover:bg-sky-50"
            title="Cài Smart Study Planner như một ứng dụng"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Cài ứng dụng</span>
          </Button>
        )}

        <Button
          id="reminder-settings-trigger"
          size="sm"
          onClick={() => {
            setSettingsTab("reminders");
            setIsSettingsOpen(true);
          }}
          className="h-9 gap-1.5 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 text-slate-950 font-bold hover:brightness-105 transition shadow-soft text-xs"
          title="Cấu hình lịch nhắc học"
          aria-label="Mở cài đặt nhắc học"
        >
          <BellRing className="h-4 w-4 text-slate-950" />
          <span className="hidden sm:inline">Nhắc học</span>
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="h-9 w-9 rounded-2xl bg-slate-100/80 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition border border-slate-200/80 shadow-xs ml-1"
          onClick={() => {
            setSettingsTab("pomodoro");
            setIsSettingsOpen(true);
          }}
          title="Cài đặt & Cảnh báo nhắc lịch"
          aria-label="Mở cài đặt"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-full mt-1 border-t border-slate-100/80 pt-3">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-50/90 to-emerald-50/90 p-2.5 border border-sky-100/80 shadow-2xs">
            <button
              onClick={handleSaveIdentityTitle}
              className="flex min-w-[95px] flex-col items-center justify-center rounded-xl border border-sky-100 bg-white px-2.5 py-1 text-center shadow-2xs transition hover:bg-sky-50"
              title="Nhấn để đổi Danh Hiệu Bản Sắc Cá Nhân (Atomic Habits Rule #5)"
              aria-label="Đổi danh hiệu bản sắc cá nhân"
            >
              <div className="flex items-center gap-1 font-serif text-xs font-bold text-sky-800">
                <Sparkles size={13} className="text-amber-500 fill-amber-400" />
                Lv.{level}
              </div>
              <span
                className="max-w-[105px] truncate text-[10px] font-semibold text-indigo-700"
                title={identityTitle || levelInfo.title}
              >
                {identityTitle || levelInfo.title}
              </span>
            </button>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-700">
                <span className="text-sky-800 font-mono">
                  {xpProgress.currentLevelXp} / {xpProgress.requiredLevelXp} XP (
                  {xpProgress.percentage}%)
                </span>
                <span className="text-emerald-700 font-mono font-bold">Tổng {xp} XP</span>
              </div>
              <div
                className="h-2.5 overflow-hidden rounded-full border border-slate-300/40 bg-slate-200/80 p-0.5"
                role="progressbar"
                aria-label="Tiến độ XP cấp độ"
                aria-valuemin={0}
                aria-valuemax={xpProgress.requiredLevelXp}
                aria-valuenow={xpProgress.currentLevelXp}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 transition-all duration-500 shadow-2xs"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex items-center gap-1.5 rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 font-semibold text-indigo-600"
              title="Ngày học liên tiếp"
            >
              <BookOpen size={16} className="text-indigo-500" />
              <span>{studyStreak}</span>
              <span className="text-xs text-indigo-500">ngày học</span>
            </div>
            <div
              className="flex items-center gap-1.5 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-1.5 font-semibold text-rose-600"
              title="Chuỗi ngày duy trì thói quen"
            >
              <DuotoneIcon icon={Flame} tone="coral" size={16} />
              <span>{streak}</span>
              <span className="text-xs text-rose-500">thói quen</span>
            </div>
            <button
              onClick={() => setIsRewardShopOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl border border-amber-200/90 bg-amber-50 px-3 py-1.5 font-semibold text-amber-700 shadow-2xs transition hover:border-amber-300 hover:bg-amber-100"
              title="Mở Cửa Hàng Đổi Xu và Tự Thưởng"
              aria-label="Mở cửa hàng đổi xu và tự thưởng"
            >
              <DuotoneIcon icon={Coins} tone="amber" size={16} />
              <span className="font-mono font-bold">{coins}</span>
              <span className="text-[10px] text-amber-600">Đổi quà</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reward Shop Modal */}
      <RewardShopModal
        open={isRewardShopOpen}
        onOpenChange={setIsRewardShopOpen}
        coins={coins}
        streakFreezeCount={progress.streakFreezeCount ?? 0}
        customRewards={progress.customRewards ?? []}
        claimedRewards={progress.claimedRewards ?? []}
        onBuyStreakFreeze={onBuyStreakFreeze || (() => false)}
        onClaimReward={onClaimReward || (() => false)}
        onAddCustomReward={onAddCustomReward || (() => {})}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        reminders={reminders}
        today={today}
        completedLessons={completedLessons}
        shiftedDates={shiftedDates}
        onSetReminder={onSetReminder || (() => {})}
        goals={goals}
        weekStats={weekStats}
        level={level}
        achievementPoints={achievementPoints}
        pointsInLevel={pointsInLevel}
        onSetGoals={onSetGoals}
        subjects={currentSubjects}
        habitDefinitions={habitDefinitions}
        onResetOnboarding={onResetOnboarding}
        onOpenPushCenter={onOpenPushCenter}
        onTriggerPush={onTriggerPush}
        initialTab={settingsTab}
        onOpenRoadmapData={() =>
          document.querySelector<HTMLButtonElement>("#roadmap-data-trigger-button")?.click()
        }
      />

      <Dialog open={isIdentityDialogOpen} onOpenChange={setIsIdentityDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Danh hiệu bản sắc cá nhân</DialogTitle>
            <DialogDescription id="identity-title-help">
              Nhập một danh hiệu riêng hoặc chọn một gợi ý bên dưới. Bạn có thể đổi lại bất cứ lúc
              nào.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              saveIdentityTitle();
            }}
            aria-describedby="identity-title-help"
          >
            <div className="space-y-1.5">
              <Label htmlFor="identity-title">Danh hiệu</Label>
              <Input
                id="identity-title"
                value={identityDraft}
                onChange={(event) => setIdentityDraft(event.target.value)}
                aria-describedby="identity-title-help"
                autoFocus
              />
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Gợi ý danh hiệu">
              {IDENTITY_TITLE_CHOICES.map((choice) => (
                <Button
                  key={choice}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIdentityDraft(choice)}
                >
                  {choice}
                </Button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsIdentityDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit">Lưu danh hiệu</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}
