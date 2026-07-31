import { Target, Trophy } from "lucide-react";
import type { HabitDef } from "@/lib/mock-data";
import type { WeekStats, Goals } from "@/lib/progress-store";
import { DuotoneIcon } from "./DuotoneIcon";

type Props = {
  goals: Goals;
  weekStats: WeekStats;
  level: number;
  achievementPoints: number;
  pointsInLevel: number;
  onSetGoals: (patch: Partial<Goals>) => void;
  definitions: HabitDef[];
};

export function GoalsCard({
  goals,
  weekStats,
  level,
  achievementPoints,
  pointsInLevel,
  onSetGoals,
  definitions,
}: Props) {
  const xpPct = Math.min(
    100,
    Math.round((weekStats.xpThisWeek / Math.max(1, goals.weeklyXp)) * 100),
  );

  return (
    <div className="rounded-3xl bg-white/70 p-5 shadow-soft backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DuotoneIcon icon={Trophy} tone="amber" size={28} active />
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Mục tiêu tuần
            </div>
            <h2 className="font-serif text-xl font-semibold">Cấp độ {level}</h2>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Điểm thành tích</div>
          <div className="font-serif text-lg font-bold text-emerald-600">
            {achievementPoints}{" "}
            <span className="text-xs text-muted-foreground">({pointsInLevel}/3)</span>
          </div>
        </div>
      </div>

      {/* XP goal */}
      <div className="mb-4 rounded-2xl bg-sky-50/60 p-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-sky-800">XP mỗi tuần</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={50}
              step={50}
              value={goals.weeklyXp}
              onChange={(e) => onSetGoals({ weeklyXp: Math.max(50, Number(e.target.value) || 0) })}
              className="w-20 rounded-lg border border-sky-200 bg-white px-2 py-1 text-right text-sm font-semibold text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            <span className="text-xs text-muted-foreground">XP</span>
          </div>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all"
            style={{ width: `${xpPct}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>{weekStats.xpThisWeek} XP tuần này</span>
          <span>{xpPct}%</span>
        </div>
      </div>

      {/* per-habit weekly targets */}
      <div className="grid gap-2">
        <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Target className="h-3.5 w-3.5" /> Số lần/tuần cho từng thói quen
        </div>
        {definitions
          .filter((habit) => !habit.archived)
          .map((h) => {
            const target = goals.habitTargets[h.id] ?? 0;
            const done = weekStats.habitCounts[h.id] ?? 0;
            const pct = target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0;
            const met = target > 0 && done >= target;
            return (
              <div key={h.id} className="flex items-center gap-3 rounded-xl bg-white/60 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-medium">{h.name}</span>
                    <span
                      className={`text-xs font-semibold ${met ? "text-emerald-600" : "text-muted-foreground"}`}
                    >
                      {done}/{target}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${met ? "bg-emerald-400" : "bg-sky-300"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <input
                  type="number"
                  min={0}
                  max={7}
                  value={target}
                  onChange={(e) =>
                    onSetGoals({
                      habitTargets: {
                        [h.id]: Math.max(0, Math.min(7, Number(e.target.value) || 0)),
                      },
                    })
                  }
                  className="w-12 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
            );
          })}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Mỗi mục tiêu tuần đạt được cộng 1 điểm thành tích. Đủ 3 điểm → lên cấp.
      </p>
    </div>
  );
}
