import { Volume2 } from "lucide-react";
import type { AmbientSoundType } from "@/lib/focus-timer-store";
import { cn } from "@/lib/utils";

const SOUND_OPTIONS: Array<{ id: AmbientSoundType; label: string }> = [
  { id: "none", label: "🔇 Tắt" },
  { id: "rain", label: "🌧️ Mưa rào" },
  { id: "binaural", label: "🎧 Sóng Alpha" },
  { id: "cafe", label: "☕ Quán Cafe" },
  { id: "whiteNoise", label: "📻 Tiếng ồn trắng" },
];

type Props = {
  value: AmbientSoundType;
  onChange: (value: AmbientSoundType) => void;
  className?: string;
  optionClassName?: string;
};

export function AmbientSoundSelector({ value, onChange, className, optionClassName }: Props) {
  return (
    <div
      className={cn("rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-left", className)}
    >
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
          <Volume2 className="h-3.5 w-3.5 text-rose-500" />
          Âm thanh tập trung nền:
        </span>
        <span className="text-[10px] text-slate-400">Web Audio HD</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {SOUND_OPTIONS.map((sound) => (
          <button
            type="button"
            key={sound.id}
            onClick={() => onChange(sound.id)}
            className={cn(
              "rounded-lg border px-2 py-1 text-center text-[11px] font-medium transition-all",
              value === sound.id
                ? "border-rose-300 bg-rose-100 font-bold text-rose-800"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100",
              optionClassName,
            )}
          >
            {sound.label}
          </button>
        ))}
      </div>
    </div>
  );
}
