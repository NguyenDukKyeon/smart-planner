import { isHighDailyStudyHours } from "@/lib/study-hours";
import { cn } from "@/lib/utils";

type Props = {
  hours: number;
  className?: string;
};

export function HighStudyHoursNote({ hours, className }: Props) {
  if (!isHighDailyStudyHours(hours)) return null;

  return (
    <p
      role="status"
      className={cn(
        "rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] leading-relaxed text-amber-800",
        className,
      )}
    >
      Quỹ thời gian rất cao. Hãy tính cả thời gian ăn, nghỉ và phục hồi.
    </p>
  );
}
