import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Check,
  CheckCircle2,
  CloudCog,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  Smartphone,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type PushPreferences,
  getPushPreferences,
  playPushNotificationChime,
  savePushPreferences,
} from "@/lib/push-notification-store";
import { getApproachingDeadlineLessons } from "@/lib/deadline-notifier";
import { SUBJECTS, type Subject, type HabitDef } from "@/lib/mock-data";
import type { HabitEntry, ProgressState, Reminder } from "@/lib/progress-store";
import { todayISO } from "@/lib/date-utils";
import {
  getWebPushCapability,
  sendWebPushTest,
  subscribeToWebPush,
  syncScheduledWebPush,
  unsubscribeFromWebPush,
  type WebPushCapability,
} from "@/lib/web-push-client";
import { buildScheduledWebPushJobs } from "@/lib/web-push-schedule";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progressState: ProgressState;
  subjects?: Subject[];
  completedLessons?: Record<string, string>;
  shiftedDates?: Record<string, string>;
  habitDefinitions?: HabitDef[];
  habitEntryToday?: HabitEntry;
  reminders?: Record<string, Reminder>;
  onStartFocus?: (lessonId?: string, lessonTitle?: string, xp?: number) => void;
  onToggleLesson?: (lessonId: string, xp: number) => void;
  onUpdateHabit?: (patch: HabitEntry) => void;
};

const EMPTY_CAPABILITY: WebPushCapability = {
  supported: false,
  secureContext: false,
  configured: false,
  schedulerConfigured: false,
  publicKey: null,
  permission: "unsupported",
  subscribed: false,
};

export function NotificationCenterModal({
  open,
  onOpenChange,
  progressState,
  subjects = SUBJECTS,
  completedLessons = {},
  shiftedDates = {},
  habitDefinitions = [],
  habitEntryToday = {},
  reminders = {},
  onStartFocus,
  onToggleLesson,
  onUpdateHabit,
}: Props) {
  const [prefs, setPrefs] = useState<PushPreferences>(getPushPreferences);
  const [capability, setCapability] = useState<WebPushCapability>(EMPTY_CAPABILITY);
  const [activeTab, setActiveTab] = useState("push");
  const [busyAction, setBusyAction] = useState<"enable" | "sync" | "test" | "disable" | null>(null);
  const [lastScheduledCount, setLastScheduledCount] = useState<number | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const todayStr = todayISO();

  const refreshCapability = async () => {
    const current = await getWebPushCapability();
    setCapability(current);
    return current;
  };

  useEffect(() => {
    if (!open) return;
    setPrefs(getPushPreferences());
    void refreshCapability();
  }, [open]);

  const approachingDeadlines = useMemo(
    () => getApproachingDeadlineLessons(subjects, completedLessons, shiftedDates, todayStr),
    [subjects, completedLessons, shiftedDates, todayStr],
  );

  const pendingHabits = useMemo(
    () =>
      habitDefinitions.filter((habit) => {
        if (habit.archived) return false;
        const value = habitEntryToday[habit.id];
        const day = new Date(`${todayStr}T12:00:00`).getDay();
        const target = habit.dailyTargets[(day + 6) % 7] ?? habit.target;
        if (target <= 0) return false;
        return habit.kind === "counter"
          ? typeof value !== "number" || value < target
          : value !== true;
      }),
    [habitDefinitions, habitEntryToday, todayStr],
  );

  const scheduledPreview = useMemo(
    () =>
      buildScheduledWebPushJobs({
        state: progressState,
        subjects,
        preferences: prefs,
        horizonDays: 7,
      }),
    [prefs, progressState, subjects],
  );

  const savePreferences = (patch: Partial<PushPreferences>, announce = false) => {
    const updated = { ...prefs, ...patch };
    setPrefs(updated);
    savePushPreferences(updated);
    if (announce) toast.success("Đã lưu cấu hình nhắc học.");
    return updated;
  };

  const syncSchedule = async (preferences = prefs) => {
    const jobs = buildScheduledWebPushJobs({
      state: progressState,
      subjects,
      preferences,
      horizonDays: 7,
    });
    const result = await syncScheduledWebPush(jobs);
    setLastScheduledCount(result.scheduled.length);
    setLastSyncedAt(new Date().toLocaleString("vi-VN"));
    return result;
  };

  const handleEnable = async () => {
    setBusyAction("enable");
    try {
      await subscribeToWebPush();
      const updated = savePreferences({ enabled: true });
      const result = await syncSchedule(updated);
      await refreshCapability();
      if (!result.schedulerConfigured) {
        toast.warning("Đã bật Web Push. Máy chủ chưa có QStash nên chỉ gửi được thông báo thử.");
      } else {
        toast.success(`Đã bật Web Push và lên lịch ${result.scheduled.length} lời nhắc.`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể bật Web Push.");
      await refreshCapability();
    } finally {
      setBusyAction(null);
    }
  };

  const handleSync = async () => {
    setBusyAction("sync");
    try {
      const result = await syncSchedule();
      toast.success(`Đã đồng bộ ${result.scheduled.length} lời nhắc trong 7 ngày tới.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể đồng bộ lịch Web Push.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleTest = async () => {
    setBusyAction("test");
    try {
      await sendWebPushTest({
        title: "Web Push đang hoạt động",
        body: "Thông báo này được gửi qua máy chủ và service worker, không phải banner mô phỏng.",
        tag: "smart-study-web-push-test",
        url: "/?view=today",
      });
      toast.success("Máy chủ đã gửi thông báo thử tới thiết bị này.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể gửi thông báo thử.");
      await refreshCapability();
    } finally {
      setBusyAction(null);
    }
  };

  const handleDisable = async () => {
    setBusyAction("disable");
    try {
      await unsubscribeFromWebPush();
      savePreferences({ enabled: false });
      setLastScheduledCount(0);
      await refreshCapability();
      toast.success("Đã hủy đăng ký và các lịch Web Push của thiết bị này.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tắt Web Push.");
    } finally {
      setBusyAction(null);
    }
  };

  const setupProblems = [
    !capability.supported &&
      "Trình duyệt không hỗ trợ Service Worker, Push API hoặc Notification API.",
    capability.supported &&
      !capability.secureContext &&
      "Trang phải chạy bằng HTTPS hoặc localhost.",
    capability.supported && !capability.configured && "Máy chủ chưa cấu hình VAPID keys.",
  ].filter(Boolean) as string[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-3xl p-0 sm:max-h-[88vh]">
        <div className="border-b bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-5 sm:p-6">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-soft">
                <Bell className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="font-serif text-2xl">Nhắc học &amp; Web Push</DialogTitle>
                <DialogDescription className="mt-1">
                  Service worker nhận thông báo khi ứng dụng đã đóng; QStash lên lịch gửi từ máy chủ
                  theo giờ bạn chọn.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid h-auto w-full grid-cols-3 rounded-2xl p-1">
              <TabsTrigger value="push" className="min-h-10 rounded-xl text-xs sm:text-sm">
                Web Push
              </TabsTrigger>
              <TabsTrigger value="alerts" className="min-h-10 rounded-xl text-xs sm:text-sm">
                Việc cần chú ý
              </TabsTrigger>
              <TabsTrigger value="settings" className="min-h-10 rounded-xl text-xs sm:text-sm">
                Lịch nhắc
              </TabsTrigger>
            </TabsList>

            <TabsContent value="push" className="mt-5 space-y-4">
              <section className="rounded-2xl border bg-slate-50 p-4" aria-labelledby="push-status">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 id="push-status" className="flex items-center gap-2 font-semibold">
                      <Smartphone className="h-4 w-4 text-sky-600" /> Trạng thái thiết bị
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {capability.subscribed
                        ? "Thiết bị đã đăng ký nhận Web Push."
                        : "Thiết bị chưa đăng ký nhận Web Push."}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      capability.subscribed
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {capability.subscribed ? "Đã bật" : "Chưa bật"}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
                  <StatusItem ok={capability.secureContext} label="HTTPS" />
                  <StatusItem ok={capability.configured} label="VAPID" />
                  <StatusItem ok={capability.schedulerConfigured} label="Lịch nền QStash" />
                </div>

                {setupProblems.length > 0 && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    {setupProblems.map((problem) => (
                      <p key={problem} className="flex gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{problem}</span>
                      </p>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {!capability.subscribed ? (
                    <Button
                      onClick={handleEnable}
                      disabled={busyAction !== null}
                      className="rounded-xl"
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      {busyAction === "enable" ? "Đang đăng ký…" : "Bật Web Push"}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleSync}
                        disabled={busyAction !== null}
                        className="rounded-xl"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {busyAction === "sync" ? "Đang đồng bộ…" : "Đồng bộ lịch 7 ngày"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleTest}
                        disabled={busyAction !== null}
                        className="rounded-xl"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {busyAction === "test" ? "Đang gửi…" : "Gửi thử thật"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleDisable}
                        disabled={busyAction !== null}
                        className="rounded-xl text-destructive hover:text-destructive"
                      >
                        <BellOff className="mr-2 h-4 w-4" />
                        Tắt trên thiết bị này
                      </Button>
                    </>
                  )}
                </div>
              </section>

              <section className="grid gap-3 sm:grid-cols-3" aria-label="Tóm tắt lịch Web Push">
                <Metric label="Lời nhắc dự kiến" value={scheduledPreview.length} />
                <Metric label="Đã lên lịch lần cuối" value={lastScheduledCount ?? "—"} />
                <Metric label="Đồng bộ lần cuối" value={lastSyncedAt ?? "Chưa đồng bộ"} small />
              </section>

              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
                <p className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4" /> Cách hệ thống hoạt động
                </p>
                <p className="mt-1 text-sky-900/80">
                  Subscription được gửi trực tiếp cho API của ứng dụng khi đồng bộ. Dự án hiện không
                  có tài khoản người dùng hoặc cơ sở dữ liệu; mỗi trình duyệt tự giữ subscription và
                  mã lịch của chính nó.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="mt-5 space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="Bài gần hạn" value={approachingDeadlines.length} />
                <Metric label="Thói quen chưa xong" value={pendingHabits.length} />
              </div>

              <AlertSection title="Bài cần chú ý" empty="Không có bài gần hạn trong kế hoạch.">
                {approachingDeadlines.map(({ lesson, subjectName }) => (
                  <div
                    key={lesson.id}
                    className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-amber-950">{lesson.title}</p>
                      <p className="text-xs text-amber-800">{subjectName}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onStartFocus?.(lesson.id, lesson.title, lesson.xp)}
                        className="rounded-lg"
                      >
                        <Play className="mr-1 h-3.5 w-3.5" /> Học
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onToggleLesson?.(lesson.id, lesson.xp)}
                        className="rounded-lg"
                      >
                        <Check className="mr-1 h-3.5 w-3.5" /> Xong
                      </Button>
                    </div>
                  </div>
                ))}
              </AlertSection>

              <AlertSection title="Thói quen hôm nay" empty="Các thói quen hôm nay đã hoàn thành.">
                {pendingHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between gap-3 rounded-xl border bg-white p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{habit.name}</p>
                      {reminders[habit.id]?.enabled && (
                        <p className="text-xs text-muted-foreground">
                          Nhắc lúc {reminders[habit.id].time}
                        </p>
                      )}
                    </div>
                    {habit.kind === "toggle" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateHabit?.({ [habit.id]: true })}
                        className="rounded-lg"
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Xong
                      </Button>
                    )}
                  </div>
                ))}
              </AlertSection>
            </TabsContent>

            <TabsContent value="settings" className="mt-5 space-y-4">
              <section className="space-y-4 rounded-2xl border bg-white p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="push-morning">Nhắc kế hoạch buổi sáng</Label>
                    <Input
                      id="push-morning"
                      type="time"
                      value={prefs.morningTime}
                      onChange={(event) => savePreferences({ morningTime: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="push-evening">Kiểm tra tiến độ buổi tối</Label>
                    <Input
                      id="push-evening"
                      type="time"
                      value={prefs.eveningTime}
                      onChange={(event) => savePreferences({ eveningTime: event.target.value })}
                      disabled={!prefs.enableStreakGuard}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3">
                  <div>
                    <Label htmlFor="streak-guard">Nhắc kiểm tra tiến độ buổi tối</Label>
                    <p className="text-xs text-muted-foreground">
                      Gửi một lời nhắc chung; không tự phán đoán bạn đã mất streak.
                    </p>
                  </div>
                  <Switch
                    id="streak-guard"
                    checked={prefs.enableStreakGuard}
                    onCheckedChange={(value) => savePreferences({ enableStreakGuard: value })}
                  />
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <Label className="flex items-center gap-2">
                      {prefs.soundEnabled ? (
                        <Volume2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <VolumeX className="h-4 w-4 text-slate-400" />
                      )}
                      Âm thanh xem trước trong ứng dụng
                    </Label>
                    <Switch
                      checked={prefs.soundEnabled}
                      onCheckedChange={(value) => savePreferences({ soundEnabled: value })}
                    />
                  </div>
                  {prefs.soundEnabled && (
                    <>
                      <Slider
                        value={[prefs.volume * 100]}
                        min={10}
                        max={100}
                        step={5}
                        onValueChange={([value]) => savePreferences({ volume: value / 100 })}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => playPushNotificationChime(false, prefs.volume)}
                        className="rounded-lg"
                      >
                        <Volume2 className="mr-1.5 h-4 w-4" /> Thử âm thanh
                      </Button>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => savePreferences({}, true)}
                    className="rounded-xl"
                  >
                    Lưu cài đặt
                  </Button>
                  {capability.subscribed && (
                    <Button
                      onClick={handleSync}
                      disabled={busyAction !== null}
                      className="rounded-xl"
                    >
                      <CloudCog className="mr-2 h-4 w-4" /> Lưu và đồng bộ lịch
                    </Button>
                  )}
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-xs">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-amber-600" />
      )}
      <span className="font-medium">{label}</span>
    </div>
  );
}

function Metric({
  label,
  value,
  small = false,
}: {
  label: string;
  value: string | number;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-white p-3 text-center shadow-xs">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={small ? "mt-1 text-xs font-semibold" : "mt-1 text-xl font-bold"}>{value}</p>
    </div>
  );
}

function AlertSection({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  return (
    <section className="space-y-3">
      <h3 className="font-semibold">{title}</h3>
      {items.length > 0 ? (
        <div className="space-y-2">{children}</div>
      ) : (
        <div className="rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground">
          {empty}
        </div>
      )}
    </section>
  );
}
