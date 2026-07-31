import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  active?: boolean;
  tone?: "blue" | "green" | "amber" | "coral";
  size?: number;
  className?: string;
};

const TONE = {
  blue: { fg: "text-sky-500", bg: "text-sky-500/25", ring: "bg-sky-100" },
  green: { fg: "text-emerald-500", bg: "text-emerald-500/25", ring: "bg-emerald-100" },
  amber: { fg: "text-amber-500", bg: "text-amber-500/25", ring: "bg-amber-100" },
  coral: { fg: "text-rose-500", bg: "text-rose-500/25", ring: "bg-rose-100" },
} as const;

export function DuotoneIcon({
  icon: Icon,
  active = true,
  tone = "blue",
  size = 24,
  className,
}: Props) {
  const t = TONE[tone];
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-2xl transition-all",
        active ? t.ring : "bg-muted",
        className,
      )}
      style={{ width: size * 1.7, height: size * 1.7 }}
    >
      <Icon
        className={cn("absolute", active ? t.bg : "text-muted-foreground/30")}
        size={size}
        fill="currentColor"
        strokeWidth={0}
        style={{ transform: "translate(1.5px, 1.5px)" }}
      />
      <Icon
        className={cn("relative", active ? t.fg : "text-muted-foreground")}
        size={size}
        strokeWidth={2.2}
      />
    </span>
  );
}
