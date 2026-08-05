import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  Database,
  MonitorCog,
  Palette,
  RotateCcw,
  Settings,
  Target,
  TimerReset,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { RemindersCard } from "./RemindersCard";
import { GoalsCard } from "./GoalsCard";
import { PomodoroStudioSettings } from "./PomodoroStudioSettings";
import type { HabitEntry, Reminder, Goals, WeekStats } from "@/lib/progress-store";
import type { HabitDef, Subject } from "@/lib/mock-data";
import type { PushNotificationPayload } from "@/lib/push-notification-store";
import {
  factoryResetOwnedStorage,
  readRawSnapshot,
  restoreSnapshotFromKey,
  RESET_ROLLBACK_KEY,
} from "@/lib/app-storage";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  reminders: Record<string, Reminder>;
  today: HabitEntry;
  completedLessons?: Record<string, string>;
  shiftedDates?: Record<string, string>;
  onSetReminder: (habitId: string, patch: Partial<Reminder>) => void;
  goals?: Goals;
  weekStats?: WeekStats;
  level?: number;
  achievementPoints?: number;
  pointsInLevel?: number;
  onSetGoals?: (patch: Partial<Goals>) => void;
  subjects: Subject[];
  habitDefinitions: HabitDef[];
  onResetOnboarding?: () => void;
  onOpenPushCenter?: () => void;
  onOpenRoadmapData?: () => void;
  onTriggerPush?: (payload: PushNotificationPayload) => void;
  initialTab?: "pomodoro" | "reminders" | "goals" | "appearance" | "data";
};

const APPEARANCE_KEY = "hocvien-appearance-preferences-v1";

type AppearancePreferences = {
  animations: boolean;
  confetti: boolean;
};

function loadAppearance(): AppearancePreferences {
  if (typeof window === "undefined") return { animations: true, confetti: true };
  try {
    return {
      animations: true,
      confetti: true,
      ...JSON.parse(localStorage.getItem(APPEARANCE_KEY) || "{}"),
    };
  } catch {
    return { animations: true, confetti: true };
  }
}

export function SettingsModal({
  isOpen,
  onClose,
  reminders,
  today,
  completedLessons = {},
  shiftedDates = {},
  onSetReminder,
  goals,
  weekStats,
  level = 1,
  achievementPoints = 0,
  pointsInLevel = 0,
  onSetGoals,
  subjects,
  habitDefinitions,
  onResetOnboarding,
  onOpenPushCenter,
  onOpenRoadmapData,
  onTriggerPush,
  initialTab = "pomodoro",
}: Props) {
  const [appearance, setAppearance] = useState<AppearancePreferences>(() => loadAppearance());
  const hasFactoryResetRollback = readRawSnapshot(RESET_ROLLBACK_KEY).status === "ok";

  const updateAppearance = (patch: Partial<AppearancePreferences>) => {
    const next = { ...appearance, ...patch };
    setAppearance(next);
    try {
      localStorage.setItem(APPEARANCE_KEY, JSON.stringify(next));
      document.documentElement.dataset.smartAnimations = next.animations ? "on" : "off";
      window.dispatchEvent(new CustomEvent("hocvien:appearance-updated", { detail: next }));
    } catch {
      toast.error("Không thể lưu cài đặt giao diện.");
    }
  };

  const handleFactoryReset = () => {
    if (
      !window.confirm(
        "Đặt lại toàn bộ ứng dụng? Tiến độ, môn học, thói quen và lịch tương lai sẽ bị xóa. Một snapshot hoàn tác sẽ được tạo trước khi thực hiện.",
      )
    ) {
      return;
    }
    const reset = factoryResetOwnedStorage();
    if (!reset.ok) {
      toast.error(reset.rollbackError ? `${reset.error} ${reset.rollbackError}` : reset.error);
      return;
    }
    toast.success("Đã đặt lại ứng dụng. Đang tải lại…");
    window.setTimeout(() => window.location.reload(), 350);
  };

  const handleRestoreFactoryReset = () => {
    const restored = restoreSnapshotFromKey(RESET_ROLLBACK_KEY);
    if (!restored.ok) {
      toast.error(restored.error);
      return;
    }
    toast.success("Đã khôi phục snapshot gần nhất. Đang tải lại…");
    window.setTimeout(() => window.location.reload(), 350);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="h-[92vh] w-[96vw] max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/95 p-0 backdrop-blur grid-rows-[auto_minmax(0,1fr)]">
        <DialogHeader className="border-b bg-white/90 px-5 py-4">
          <DialogTitle className="flex items-center gap-3 font-serif text-xl text-slate-900">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-700">
              <Settings className="h-5 w-5" />
            </span>
            Cài đặt
          </DialogTitle>
        </DialogHeader>

        <Tabs
          key={initialTab}
          defaultValue={initialTab}
          orientation="vertical"
          className="grid min-h-0 flex-1 md:grid-cols-[220px_1fr]"
        >
          <TabsList className="flex h-auto flex-row gap-1 overflow-x-auto rounded-none border-b bg-white p-3 md:flex-col md:items-stretch md:border-b-0 md:border-r">
            <SettingsNav value="pomodoro" icon={TimerReset} label="Pomodoro Studio" />
            <SettingsNav value="reminders" icon={Bell} label="Nhắc học" />
            <SettingsNav value="goals" icon={Target} label="Mục tiêu học tập" />
            <SettingsNav value="appearance" icon={Palette} label="Giao diện" />
            <SettingsNav value="data" icon={Database} label="Lộ trình & dữ liệu" />
          </TabsList>

          <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
            <TabsContent value="pomodoro" className="m-0">
              <PomodoroStudioSettings />
            </TabsContent>

            <TabsContent value="reminders" className="m-0">
              <RemindersCard
                reminders={reminders}
                today={today}
                completedLessons={completedLessons}
                shiftedDates={shiftedDates}
                subjects={subjects}
                onSet={onSetReminder}
                definitions={habitDefinitions}
                onOpenPushCenter={onOpenPushCenter}
                onTriggerPush={onTriggerPush}
              />
            </TabsContent>

            <TabsContent value="goals" className="m-0">
              {goals && weekStats && onSetGoals ? (
                <GoalsCard
                  goals={goals}
                  weekStats={weekStats}
                  level={level}
                  achievementPoints={achievementPoints}
                  pointsInLevel={pointsInLevel}
                  onSetGoals={onSetGoals}
                  definitions={habitDefinitions}
                />
              ) : (
                <div className="rounded-3xl border bg-white p-6 text-center text-sm text-slate-500">
                  Đang tải cấu hình mục tiêu…
                </div>
              )}
            </TabsContent>

            <TabsContent value="appearance" className="m-0 space-y-4">
              <section className="rounded-3xl border bg-white p-5 shadow-xs">
                <div className="mb-4 flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                    <MonitorCog className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-slate-900">Giao diện</h2>
                    <p className="text-sm text-slate-500">
                      Giữ phong cách hiện tại và điều chỉnh mức chuyển động.
                    </p>
                  </div>
                </div>
                <AppearanceRow
                  title="Hiệu ứng chuyển động"
                  description="Giữ animation nhẹ cho modal, progress và trạng thái hoàn thành."
                  checked={appearance.animations}
                  onCheckedChange={(checked) => updateAppearance({ animations: checked })}
                />
                <AppearanceRow
                  title="Pháo hoa khi đạt cột mốc"
                  description="Chỉ hiển thị cho cột mốc thật, không phát lại sau reload."
                  checked={appearance.confetti}
                  onCheckedChange={(checked) => updateAppearance({ confetti: checked })}
                />
              </section>
            </TabsContent>

            <TabsContent value="data" className="m-0 space-y-4">
              <section className="rounded-3xl border bg-white p-5 shadow-xs">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-100 text-sky-700">
                    <Database className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-xl font-semibold text-slate-900">
                      Lộ trình & dữ liệu
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Lộ trình mẫu, nhập file, xuất dữ liệu và sao lưu được quản lý trong một màn
                      hình riêng.
                    </p>
                    <Button
                      type="button"
                      className="mt-4 rounded-2xl bg-sky-600 hover:bg-sky-700"
                      onClick={() => {
                        onClose();
                        window.setTimeout(() => onOpenRoadmapData?.(), 0);
                      }}
                    >
                      Mở Lộ trình & dữ liệu
                    </Button>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5">
                <div className="flex items-start gap-3">
                  <RotateCcw className="mt-0.5 h-5 w-5 text-amber-700" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-amber-950">
                      Bắt đầu lại quy trình thiết lập
                    </h3>
                    <p className="mt-1 text-sm text-amber-800">
                      Mở lại màn hình chọn không gian trống hoặc lộ trình mẫu. Dữ liệu chỉ thay đổi
                      sau khi bạn xác nhận.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-3 rounded-xl"
                      onClick={onResetOnboarding}
                    >
                      Mở lại onboarding
                    </Button>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-red-200 bg-red-50/70 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-red-700" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-red-950">Khu vực nguy hiểm</h3>
                    <p className="mt-1 text-sm text-red-800">
                      Các thao tác sau có thể thay đổi toàn bộ workspace. Ứng dụng luôn tạo snapshot
                      hoàn tác trước khi thực hiện.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {hasFactoryResetRollback && (
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl"
                          onClick={handleRestoreFactoryReset}
                        >
                          Khôi phục lần đặt lại gần nhất
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        className="rounded-xl"
                        onClick={handleFactoryReset}
                      >
                        Đặt lại toàn bộ ứng dụng
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function SettingsNav({
  value,
  icon: Icon,
  label,
}: {
  value: string;
  icon: typeof Settings;
  label: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className="shrink-0 justify-start gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-600 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-950 md:w-full"
    >
      <Icon className="h-4 w-4" />
      {label}
    </TabsTrigger>
  );
}

function AppearanceRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 border-t border-slate-100 py-4 first:border-t-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs leading-relaxed text-slate-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={title} />
    </div>
  );
}
