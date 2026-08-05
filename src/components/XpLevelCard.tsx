import { useMemo } from "react";
import { Sparkles, Trophy, Zap, TrendingUp, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLevelTitle, getXpProgressInCurrentLevel } from "@/lib/progress-store";

type Props = {
  xp: number;
  level: number;
  xpInLevel?: number;
  completedLessonsCount?: number;
};

export function XpLevelCard({ xp, completedLessonsCount = 0 }: Props) {
  const xpProgress = useMemo(() => getXpProgressInCurrentLevel(xp), [xp]);
  const level = xpProgress.level;
  const currentLevelXp = xpProgress.currentLevelXp;
  const requiredLevelXp = xpProgress.requiredLevelXp;
  const progressPct = xpProgress.percentage;
  const xpRemaining = xpProgress.xpRemaining;
  const levelInfo = useMemo(() => getLevelTitle(level), [level]);

  return (
    <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/50 to-emerald-50/40 p-4 sm:p-5 shadow-soft relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-soft text-xl font-bold",
              levelInfo.color,
            )}
          >
            <span className="text-2xl">{levelInfo.icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-400" /> Cấp Độ Học Viên
              </span>
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-200">
                {levelInfo.badge}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-serif text-2xl font-bold text-slate-900">Level {level}</span>
              <span className="text-xs font-semibold text-indigo-700 truncate">
                {levelInfo.title}
              </span>
            </div>
          </div>
        </div>

        {/* Total XP Badge */}
        <div className="flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2 shadow-xs border border-sky-100">
          <Zap className="h-5 w-5 text-amber-500 fill-amber-400" />
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase">
              Tổng XP Tích Lũy
            </div>
            <div className="text-sm font-bold text-slate-900">{xp} XP</div>
          </div>
        </div>
      </div>

      {/* Progress Bar & Threshold */}
      <div className="space-y-1.5 bg-white/80 rounded-2xl p-3 border border-sky-100/80 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-sky-600" /> Tiến độ lên Level {level + 1}
          </span>
          <span className="text-sky-700 font-mono font-bold">
            {currentLevelXp} / {requiredLevelXp} XP ({progressPct}%)
          </span>
        </div>

        <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/60 relative">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-emerald-400 transition-all duration-700 shadow-xs"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
          <span>
            {xpRemaining > 0
              ? `Cần thêm +${xpRemaining} XP nữa để thăng cấp Level ${level + 1}!`
              : "🎉 Sẵn sàng thăng cấp!"}
          </span>
          <span className="font-medium text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Đã xong {completedLessonsCount} bài học
          </span>
        </div>
      </div>

      {/* XP Earning Tips */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-200/60">
        <div className="flex items-center gap-3 flex-wrap font-medium">
          <span className="text-sky-700">💡 Thưởng XP & Coin:</span>
          <span>+25 XP / 5 Xu (25p)</span>
          <span>+55 XP / 12 Xu (50p)</span>
          <span>+100 XP / 25 Xu (90p)</span>
        </div>
      </div>
    </div>
  );
}
