import { BarChart3, Bell, CalendarRange, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardView } from "@/lib/route-search";

type Props = {
  value: DashboardView;
  onValueChange: (value: DashboardView) => void;
  onOpenNotifications: () => void;
};

const items: Array<{
  value: DashboardView;
  label: string;
  icon: typeof Home;
}> = [
  { value: "today", label: "Hôm nay", icon: Home },
  { value: "weekly", label: "Tổng kết", icon: BarChart3 },
  { value: "plan", label: "Kế hoạch", icon: CalendarRange },
];

export function MobileBottomNav({ value, onValueChange, onOpenNotifications }: Props) {
  return (
    <nav
      aria-label="Điều hướng chính trên thiết bị di động"
      className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-white/80 bg-white/95 p-1.5 shadow-xl backdrop-blur md:hidden"
    >
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = value === item.value;
          return (
            <button
              key={item.value}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onValueChange(item.value)}
              className={cn(
                "flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-semibold transition",
                active
                  ? "bg-sky-100 text-sky-900 shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="max-w-full truncate">{item.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="max-w-full truncate">Nhắc học</span>
        </button>
      </div>
    </nav>
  );
}
