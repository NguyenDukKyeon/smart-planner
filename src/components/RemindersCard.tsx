import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  BellOff,
  ChevronDown,
  Clock3,
  ExternalLink,
  Moon,
  ShieldCheck,
  Sparkles,
  SunMedium,
} from "lucide-react";
import { type HabitDef, type Subject } from "@/lib/mock-data";
import { loadProgressStorage, type HabitEntry, type Reminder } from "@/lib/progress-store";
import { todayISO } from "@/lib/date-utils";
import { toast } from "sonner";
import type { PushNotificationPayload } from "@/lib/push-notification-store";
import {
  getPushPreferences,
  savePushPreferences,
  type PushPreferences,
} from "@/lib/push-notification-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type Props = {
  reminders: Record<string, Reminder>;
  today: HabitEntry;
  completedLessons?: Record<string, string>;
  shiftedDates?: Record<string, string>;
  subjects?: Subject[];
  onSet: (habitId: string, patch: Partial<Reminder>) => void;
  definitions: HabitDef[];
  onOpenPushCenter?: () => void;
  onTriggerPush?: (payload: PushNotificationPayload) => void;
  onboardingComplete?: boolean;
};

function isDone(habit: HabitDef, entry: HabitEntry, dateISO = todayISO()): boolean {
  const value = entry[habit.id];
  const day = new Date(`${dateISO}T12:00:00`).getDay();
  const target = habit.dailyTargets[(day + 6) % 7] ?? habit.target;
  if (target <= 0) return true;
  if (habit.kind === "counter") return typeof value === "number" && value >= target;
  return value === true;
}

export function RemindersCard({
  reminders,
  today,
  onSet,
  definitions,
  onOpenPushCenter,
  onboardingComplete,
}: Props) {
  const habits = definitions.filter((habit) => !habit.archived);
  const [storedOnboardingComplete] = useState(() => {
    const stored = loadProgressStorage();
    return stored.status === "ok" && stored.value.onboardingComplete === true;
  });
  const automaticRemindersAllowed = onboardingComplete ?? storedOnboardingComplete;
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported",
  );
  const [pushPreferences, setPushPreferences] = useState<PushPreferences>(() =>
    getPushPreferences(),
  );
  const [habitOpen, setHabitOpen] = useState(false);
  const firedRef = useRef<Set<string>>(new Set());

  const updatePush = (patch: Partial<PushPreferences>) => {
    const next = { ...pushPreferences, ...patch };
    savePushPreferences(next);
    setPushPreferences(next);
  };

  useEffect(() => {
    const check = () => {
      if (!automaticRemindersAllowed) return;
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const dayKey = now.toDateString();

      for (const habit of habits) {
        const reminder = reminders[habit.id];
        if (!reminder?.enabled || reminder.time !== hhmm || isDone(habit, today)) continue;
        const key = `${dayKey}:${habit.id}:${reminder.time}`;
        if (firedRef.current.has(key)) continue;
        firedRef.current.add(key);
        const body = `Đến giờ ${habit.name.toLowerCase()}. Hãy dành một bước nhỏ để hoàn thành hôm nay.`;
        toast(`⏰ ${habit.name}`, { description: body });
        if ("Notification" in window && Notification.permission === "granted") {
          try {
            new Notification(`Nhắc học: ${habit.name}`, { body, tag: `habit-${habit.id}` });
          } catch {
            // Notification is supplementary; in-app toast already fired.
          }
        }
      }
    };
    const interval = window.setInterval(check, 30_000);
    check();
    return () => window.clearInterval(interval);
  }, [automaticRemindersAllowed, habits, reminders, today]);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      updatePush({ enabled: true });
      toast.success("Đã bật thông báo trình duyệt.");
    } else if (result === "denied") {
      toast.info("Thông báo đang bị chặn. Bạn có thể bật lại trong cài đặt trình duyệt.");
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/70 p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700">
            <Bell className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-serif text-xl font-semibold text-slate-900">Nhắc học</h2>
            <p className="mt-1 text-sm text-slate-600">
              Chọn thời điểm ứng dụng nhắc bạn bắt đầu hoặc quay lại học.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span
            className={cn(
              "grid h-11 w-11 shrink-0 place-items-center rounded-2xl",
              permission === "granted"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700",
            )}
          >
            {permission === "granted" ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900">
              {permission === "granted"
                ? "Thiết bị này đang nhận thông báo"
                : permission === "denied"
                  ? "Thông báo đã bị chặn trong trình duyệt"
                  : permission === "unsupported"
                    ? "Trình duyệt không hỗ trợ thông báo"
                    : "Thông báo trình duyệt đang tắt"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {permission === "granted"
                ? "Lời nhắc nền hoạt động theo lịch bạn đã chọn."
                : permission === "denied"
                  ? "Hãy mở quyền của trang trong trình duyệt để bật lại."
                  : "Bật thông báo để nhận lời nhắc khi ứng dụng không mở."}
            </p>
          </div>
          {permission === "default" && (
            <Button
              type="button"
              className="rounded-2xl bg-sky-600 hover:bg-sky-700"
              onClick={requestPermission}
            >
              Bật thông báo trình duyệt
            </Button>
          )}
          {permission === "granted" && (
            <Switch
              checked={pushPreferences.enabled}
              onCheckedChange={(checked) => updatePush({ enabled: checked })}
              aria-label="Bật thông báo nền"
            />
          )}
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-xs">
        <div className="mb-3 flex items-center gap-2">
          <Clock3 className="h-5 w-5 text-indigo-600" />
          <div>
            <h3 className="font-semibold text-slate-900">Lịch nhắc chính</h3>
            <p className="text-xs text-slate-500">Thay đổi được lưu ngay.</p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          <ReminderScheduleRow
            icon={<SunMedium className="h-4 w-4" />}
            title="Kế hoạch buổi sáng"
            description="Nhắc xem kế hoạch học trong ngày"
            time={pushPreferences.morningTime}
            enabled={pushPreferences.morningEnabled}
            onTimeChange={(time) => updatePush({ morningTime: time })}
            onEnabledChange={(enabled) => updatePush({ morningEnabled: enabled })}
          />
          <ReminderScheduleRow
            icon={<Sparkles className="h-4 w-4" />}
            title="Bắt đầu học buổi tối"
            description="Nhắc quay lại nếu hôm nay chưa có phiên học"
            time={pushPreferences.eveningTime}
            enabled={pushPreferences.eveningEnabled}
            onTimeChange={(time) => updatePush({ eveningTime: time })}
            onEnabledChange={(enabled) => updatePush({ eveningEnabled: enabled })}
          />
          <ReminderScheduleRow
            icon={<Moon className="h-4 w-4" />}
            title="Kiểm tra cuối ngày"
            description="Nhắc xem lại tiến độ còn thiếu"
            time={pushPreferences.endOfDayTime}
            enabled={pushPreferences.enableStreakGuard}
            onTimeChange={(time) => updatePush({ endOfDayTime: time })}
            onEnabledChange={(enabled) => updatePush({ enableStreakGuard: enabled })}
          />
        </div>
      </section>

      <Collapsible open={habitOpen} onOpenChange={setHabitOpen}>
        <section className="rounded-3xl border bg-white p-5 shadow-xs">
          <CollapsibleTrigger asChild>
            <button type="button" className="flex w-full items-center gap-3 text-left">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                <Bell className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900">Nhắc theo từng thói quen</h3>
                <p className="text-xs text-slate-500">
                  Đặt giờ riêng cho từng thói quen; không hiển thị trạng thái hoàn thành tại đây.
                </p>
              </div>
              <ChevronDown className={cn("h-4 w-4 transition", habitOpen && "rotate-180")} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <div className="divide-y divide-slate-100">
              {habits.map((habit) => {
                const reminder = reminders[habit.id] ?? { enabled: false, time: "20:00" };
                return (
                  <div key={habit.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{habit.name}</p>
                    </div>
                    <Input
                      type="time"
                      value={reminder.time}
                      onChange={(event) => onSet(habit.id, { time: event.target.value })}
                      disabled={!reminder.enabled}
                      className="h-9 w-28 rounded-xl"
                      aria-label={`Giờ nhắc ${habit.name}`}
                    />
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={(enabled) => onSet(habit.id, { enabled })}
                      aria-label={`Bật nhắc ${habit.name}`}
                    />
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </section>
      </Collapsible>

      {onOpenPushCenter && (
        <section className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-between rounded-xl text-slate-600"
            onClick={onOpenPushCenter}
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" /> Chẩn đoán thông báo
            </span>
            <span className="text-xs font-normal text-slate-400">
              HTTPS · Service worker · Push
            </span>
          </Button>
        </section>
      )}
    </div>
  );
}

function ReminderScheduleRow({
  icon,
  title,
  description,
  time,
  enabled,
  onTimeChange,
  onEnabledChange,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  time: string;
  enabled: boolean;
  onTimeChange: (time: string) => void;
  onEnabledChange: (enabled: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-3 first:pt-1 last:pb-1">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </span>
      <div className="min-w-[180px] flex-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <Input
        type="time"
        value={time}
        onChange={(event) => onTimeChange(event.target.value)}
        disabled={!enabled}
        className="h-9 w-28 rounded-xl"
        aria-label={`Giờ ${title}`}
      />
      <Switch checked={enabled} onCheckedChange={onEnabledChange} aria-label={`Bật ${title}`} />
    </div>
  );
}
