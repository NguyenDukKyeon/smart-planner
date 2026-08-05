import { useEffect, useState } from "react";
import { Clock3, Pencil, Play, Rocket, Timer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FOCUS_PREFERENCES_EVENT,
  loadFocusPreferences,
  type FocusPreferences,
} from "@/lib/focus-preferences";

type Props = {
  onStart: (minutes?: number) => void;
  onManualEntry: () => void;
  disabled?: boolean;
  tone?: "sky" | "amber" | "emerald";
  completedMinutes?: number;
  remainingMinutes?: number;
};

const primaryTone = {
  sky: "bg-sky-600 hover:bg-sky-700",
  amber: "bg-amber-500 hover:bg-amber-600",
  emerald: "bg-emerald-600 hover:bg-emerald-700",
};

export function LessonActionMenu({
  onStart,
  onManualEntry,
  disabled,
  tone = "sky",
  completedMinutes = 0,
  remainingMinutes = 120,
}: Props) {
  const [preferences, setPreferences] = useState<FocusPreferences>(() => loadFocusPreferences());

  useEffect(() => {
    const refresh = () => setPreferences(loadFocusPreferences());
    window.addEventListener(FOCUS_PREFERENCES_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(FOCUS_PREFERENCES_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  const isStarted = completedMinutes > 0;
  const suggestedMinutes = Math.min(
    preferences.defaultFocusMinutes,
    remainingMinutes > 0 ? remainingMinutes : preferences.defaultFocusMinutes,
  );
  const useQuickStart = !isStarted && preferences.quickStartEnabled;
  const primaryMinutes = useQuickStart ? 2 : suggestedMinutes;
  const primaryLabel = useQuickStart
    ? "Khởi động 2 phút"
    : isStarted
      ? `Học tiếp ${suggestedMinutes} phút`
      : `Bắt đầu ${suggestedMinutes} phút`;

  return (
    <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <Button
        type="button"
        size="sm"
        disabled={disabled}
        onClick={() => onStart(primaryMinutes)}
        className={`min-h-10 flex-1 rounded-xl px-3 font-semibold text-white shadow-xs sm:flex-none ${primaryTone[tone]}`}
      >
        {useQuickStart ? (
          <Zap className="mr-1.5 h-4 w-4 fill-amber-200 text-amber-200" />
        ) : (
          <Play className="mr-1.5 h-4 w-4 fill-current" />
        )}
        {primaryLabel}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            className="min-h-10 rounded-xl bg-white px-3 font-semibold text-slate-700"
            aria-label="Chọn phiên học"
          >
            <Clock3 className="mr-1.5 h-4 w-4 text-slate-500" />
            {isStarted ? `${preferences.defaultFocusMinutes} phút ▾` : "Chọn phiên ▾"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-2xl p-1.5 z-50">
          <DropdownMenuLabel>Chọn phiên học</DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={() => onStart(2)}
            className="rounded-xl py-2.5 font-medium cursor-pointer"
          >
            <Zap className="mr-2 h-4 w-4 text-amber-500" />
            <span>
              <strong>Khởi động</strong>
              <span className="ml-2 text-xs text-slate-500">2 phút</span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => onStart(25)}
            className="rounded-xl py-2.5 font-medium cursor-pointer"
          >
            <Timer className="mr-2 h-4 w-4 text-rose-600" />
            <span>
              <strong>Pomodoro</strong>
              <span className="ml-2 text-xs text-slate-500">25 phút</span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => onStart(50)}
            className="rounded-xl py-2.5 font-medium cursor-pointer"
          >
            <Clock3 className="mr-2 h-4 w-4 text-emerald-600" />
            <span>
              <strong>Deep Work</strong>
              <span className="ml-2 text-xs text-slate-500">50 phút</span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => onStart(90)}
            className="rounded-xl py-2.5 font-medium cursor-pointer"
          >
            <Rocket className="mr-2 h-4 w-4 text-indigo-600" />
            <span>
              <strong>Siêu tập trung</strong>
              <span className="ml-2 text-xs text-slate-500">90 phút</span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={onManualEntry}
            className="rounded-xl py-2.5 font-medium cursor-pointer"
          >
            <Pencil className="mr-2 h-4 w-4 text-slate-600" /> Thời lượng tùy chỉnh / ghi thủ công
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
