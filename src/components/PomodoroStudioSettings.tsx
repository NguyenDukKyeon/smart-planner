import { useState, type ReactNode } from "react";
import {
  BellRing,
  Clock3,
  Headphones,
  Minimize2,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  loadFocusPreferences,
  saveFocusPreferences,
  type FocusPreferences,
} from "@/lib/focus-preferences";
import { playBreakCompletionChime, playStudyCompletionChime } from "@/lib/focus-timer-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PRESETS = [
  { minutes: 2, icon: "⚡", title: "Khởi động", detail: "2 phút · không nghỉ tự động" },
  { minutes: 25, icon: "🍅", title: "Pomodoro", detail: "25 phút học · 5 phút nghỉ" },
  { minutes: 50, icon: "🧠", title: "Deep Work", detail: "50 phút học · 10 phút nghỉ" },
  { minutes: 90, icon: "🚀", title: "Siêu tập trung", detail: "90 phút học · 15 phút nghỉ" },
] as const;

export function PomodoroStudioSettings() {
  const [preferences, setPreferences] = useState<FocusPreferences>(() => loadFocusPreferences());

  const update = (patch: Partial<FocusPreferences>, message?: string) => {
    const saved = saveFocusPreferences(patch);
    if (!saved.ok) {
      toast.error(saved.error);
      return;
    }
    setPreferences(saved.value);
    if (message) toast.success(message);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/70 p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-100 text-xl">
            🍅
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-slate-900">Pomodoro Studio</h2>
            <p className="mt-1 text-sm text-slate-600">
              Thiết lập thời lượng, giờ nghỉ và cách Timer hoạt động. Đây là nơi cấu hình, không
              phải một Timer thứ hai.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-xs">
        <div className="mb-3 flex items-center gap-2">
          <Clock3 className="h-5 w-5 text-rose-600" />
          <div>
            <h3 className="font-semibold text-slate-900">Các chế độ chuẩn</h3>
            <p className="text-xs text-slate-500">Dùng thống nhất trên toàn ứng dụng.</p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {PRESETS.map((preset) => (
            <div
              key={preset.minutes}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-xl shadow-xs">
                {preset.icon}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{preset.title}</p>
                <p className="text-xs text-slate-500">{preset.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-xs">
        <div className="mb-3 flex items-center gap-2">
          <TimerReset className="h-5 w-5 text-indigo-600" />
          <div>
            <h3 className="font-semibold text-slate-900">Phiên mặc định khi bấm “Học tiếp”</h3>
            <p className="text-xs text-slate-500">Hai phút vẫn là luồng khởi động riêng.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[25, 50, 90].map((minutes) => (
            <Button
              key={minutes}
              type="button"
              variant={preferences.defaultFocusMinutes === minutes ? "default" : "outline"}
              onClick={() =>
                update(
                  { defaultFocusMinutes: minutes as 25 | 50 | 90 },
                  `Đã đặt phiên mặc định ${minutes} phút.`,
                )
              }
              className={cn(
                "rounded-2xl",
                preferences.defaultFocusMinutes === minutes && "bg-indigo-600 hover:bg-indigo-700",
              )}
            >
              {minutes} phút
            </Button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-xs">
        <div className="mb-2 flex items-center gap-2">
          <Play className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold text-slate-900">Bắt đầu và chuyển phiên</h3>
        </div>
        <div className="divide-y divide-slate-100">
          <PreferenceRow
            icon={<Sparkles className="h-4 w-4" />}
            title="Luôn đề xuất phiên 2 phút cho bài chưa bắt đầu"
            description="Nếu tắt, CTA chính dùng thời lượng mặc định. Hai phút vẫn có trong Chọn phiên."
            checked={preferences.quickStartEnabled}
            onCheckedChange={(checked) => update({ quickStartEnabled: checked })}
          />
          <PreferenceRow
            icon={<Play className="h-4 w-4" />}
            title="Tự bắt đầu khi chọn một thời lượng"
            description="Bấm 25, 50 hoặc 90 phút là Timer chạy ngay."
            checked={preferences.autoStartSelectedDuration}
            onCheckedChange={(checked) => update({ autoStartSelectedDuration: checked })}
          />
          <PreferenceRow
            icon={<RotateCcw className="h-4 w-4" />}
            title="Tự bắt đầu giờ nghỉ sau phiên học"
            description="Mặc định tắt; giờ nghỉ vẫn được tính đúng 5, 10 hoặc 15 phút."
            checked={preferences.autoStartBreak}
            onCheckedChange={(checked) => update({ autoStartBreak: checked })}
          />
          <PreferenceRow
            icon={<TimerReset className="h-4 w-4" />}
            title="Tự bắt đầu phiên mới sau giờ nghỉ"
            description="Mặc định tắt để tránh chạy oan khi bạn rời bàn."
            checked={preferences.autoStartFocus}
            onCheckedChange={(checked) => update({ autoStartFocus: checked })}
          />
          <PreferenceRow
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Hiện xác nhận trước khi dừng phiên"
            description="Phân biệt rõ đóng giao diện, thu nhỏ và dừng hẳn."
            checked={preferences.confirmBeforeStop}
            onCheckedChange={(checked) => update({ confirmBeforeStop: checked })}
          />
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-xs">
        <div className="mb-2 flex items-center gap-2">
          <Minimize2 className="h-5 w-5 text-sky-600" />
          <h3 className="font-semibold text-slate-900">Timer chạy nền</h3>
        </div>
        <div className="divide-y divide-slate-100">
          <PreferenceRow
            icon={<Clock3 className="h-4 w-4" />}
            title="Giữ Timer chạy khi chuyển tab"
            description="Timer vẫn tính theo timestamp thực tế khi trình duyệt bị giảm nhịp."
            checked={preferences.keepRunningAcrossTabs}
            onCheckedChange={(checked) => update({ keepRunningAcrossTabs: checked })}
          />
          <PreferenceRow
            icon={<Minimize2 className="h-4 w-4" />}
            title="Hiện mini Timer trên toàn ứng dụng"
            description="Thu nhỏ Timer thay vì tự dừng khi đóng giao diện chính."
            checked={preferences.showMiniTimer}
            onCheckedChange={(checked) => update({ showMiniTimer: checked })}
          />
          <PreferenceRow
            icon={<BellRing className="h-4 w-4" />}
            title="Thông báo khi phiên kết thúc"
            description="Chỉ gửi khi trình duyệt đã được cấp quyền trong mục Nhắc học."
            checked={preferences.notifyWhenComplete}
            onCheckedChange={(checked) => update({ notifyWhenComplete: checked })}
          />
          <PreferenceRow
            icon={<Clock3 className="h-4 w-4" />}
            title="Hiển thị trạng thái đang học trong header"
            description="Cho phép thanh trên cùng hiển thị phiên đang chạy mà không mở thêm Timer."
            checked={preferences.showTimerInHeader}
            onCheckedChange={(checked) => update({ showTimerInHeader: checked })}
          />
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-xs">
        <div className="mb-3 flex items-center gap-2">
          <Headphones className="h-5 w-5 text-amber-600" />
          <div>
            <h3 className="font-semibold text-slate-900">Âm thanh Timer</h3>
            <p className="text-xs text-slate-500">Tách riêng với âm thanh của lời nhắc học.</p>
          </div>
        </div>
        <PreferenceRow
          icon={<BellRing className="h-4 w-4" />}
          title="Âm báo hết giờ học và giờ nghỉ"
          description="Chỉ phát âm cục bộ; không tự xin quyền thông báo trình duyệt."
          checked={preferences.soundAlertsEnabled}
          onCheckedChange={(checked) => update({ soundAlertsEnabled: checked })}
        />
        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Volume2 className="h-4 w-4" /> Âm lượng
            </Label>
            <span className="text-xs font-bold text-slate-600">
              {Math.round(preferences.soundVolume * 100)}%
            </span>
          </div>
          <Slider
            value={[preferences.soundVolume * 100]}
            min={0}
            max={100}
            step={5}
            onValueChange={(values: number[]) => update({ soundVolume: (values[0] ?? 50) / 100 })}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-xl"
              onClick={() => playStudyCompletionChime(preferences.soundVolume)}
            >
              Thử âm học
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-xl"
              onClick={() => playBreakCompletionChime(preferences.soundVolume)}
            >
              Thử âm nghỉ
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PreferenceRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-1 last:pb-1">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs leading-relaxed text-slate-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={title} />
    </div>
  );
}
