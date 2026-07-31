import { cn } from "@/lib/utils";

const DURATIONS = [15, 25, 45, 50, 60, 90] as const;

type Props = {
  value: number;
  disabled?: boolean;
  onChange: (minutes: number) => void;
  onAddExtra: (minutes: number) => void;
  compact?: boolean;
};

export function DurationSelector({ value, disabled, onChange, onAddExtra, compact }: Props) {
  return (
    <div
      className={cn(
        "flex items-center gap-1",
        compact
          ? "mt-2.5 justify-center gap-1.5"
          : "justify-between rounded-xl border border-slate-100 bg-slate-50 p-2 text-xs",
      )}
    >
      <span className={cn("font-semibold text-slate-600", compact ? "text-[11px]" : "text-[11px]")}>
        Tùy chỉnh phút:
      </span>
      <div className="flex flex-wrap items-center justify-end gap-1">
        {DURATIONS.map((minutes) => (
          <button
            type="button"
            key={minutes}
            onClick={() => onChange(minutes)}
            disabled={disabled}
            className={cn(
              "border text-xs font-semibold transition-all",
              compact ? "rounded-full px-2.5 py-0.5" : "rounded-lg px-2 py-0.5",
              value === minutes
                ? "border-slate-800 bg-slate-800 text-white shadow-xs"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40",
            )}
          >
            {minutes}p
          </button>
        ))}
        <button
          type="button"
          onClick={() => onAddExtra(10)}
          className={cn(
            "border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 hover:bg-amber-100",
            compact ? "rounded-full" : "rounded-lg",
          )}
        >
          +10p
        </button>
      </div>
    </div>
  );
}
