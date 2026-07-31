import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, Zap, Award } from "lucide-react";
import { getLevelTitle } from "@/lib/progress-analytics";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: number;
};

export function LevelUpDialog({ open, onOpenChange, level }: Props) {
  const titleInfo = getLevelTitle(level);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 text-center sm:p-8 bg-gradient-to-b from-amber-50/90 via-white to-sky-50/90 border-amber-200/90 shadow-xl">
        <DialogHeader className="items-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-600 text-white shadow-lg animate-bounce">
            <Trophy size={42} className="fill-amber-200 text-amber-100" />
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-extrabold text-amber-600 uppercase tracking-widest">
            <Sparkles size={16} className="text-amber-500 fill-amber-400 animate-pulse" />
            <span>Thăng Cấp Thành Công!</span>
          </div>
          <DialogTitle className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            🎉 CHÚC MỪNG BẠN ĐẠT CẤP {level}!
          </DialogTitle>
          <DialogDescription className="text-slate-600 text-sm mt-1">
            Bạn vừa bứt phá thêm một cột mốc kỷ luật mới trên hành trình học tập!
          </DialogDescription>
        </DialogHeader>

        <div className="my-5 rounded-2xl border border-amber-200/90 bg-white p-4 shadow-soft space-y-2">
          <div className="text-xs font-semibold uppercase text-slate-500 flex items-center justify-center gap-1">
            <Award size={14} className="text-indigo-600" /> Danh Hiệu Đạt Được
          </div>
          <div className="text-xl font-extrabold text-indigo-900 flex items-center justify-center gap-2">
            <span>{titleInfo.icon}</span>
            <span>{titleInfo.title}</span>
          </div>
          <div className="inline-block rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
            Hạng: {titleInfo.badge}
          </div>
        </div>

        <Button
          onClick={() => onOpenChange(false)}
          className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white font-bold h-12 shadow-md hover:brightness-105 transition"
        >
          <Zap size={18} className="mr-1.5 fill-current" /> Tiếp Tục Chinh Phục
        </Button>
      </DialogContent>
    </Dialog>
  );
}
