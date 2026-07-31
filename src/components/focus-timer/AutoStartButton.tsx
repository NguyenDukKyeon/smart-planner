import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  enabled: boolean;
  onToggle: () => void;
};

export function AutoStartButton({ label, enabled, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-[10px] font-semibold",
        enabled
          ? "border-indigo-300 bg-indigo-600 text-white"
          : "border-slate-200 bg-white text-slate-600",
      )}
      aria-pressed={enabled}
    >
      <span className="flex items-center gap-1">
        <Zap className="h-3 w-3" />
        {label}
      </span>
      <span>{enabled ? "Bật" : "Tắt"}</span>
    </button>
  );
}
