import type { ReactNode } from "react";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  Download,
  Edit3,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import type { Subject } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import type { SubjectStats } from "./course-manager-model";

type Props = {
  subject: Subject;
  stats: SubjectStats;
  addLesson: ReactNode;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onAddTopic: () => void;
  onExport: () => void;
};

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} giờ ${rest} phút` : `${hours} giờ`;
}

export function SubjectHeader({
  subject,
  stats,
  addLesson,
  canMoveUp,
  canMoveDown,
  onEdit,
  onMoveUp,
  onMoveDown,
  onArchive,
  onDelete,
  onAddTopic,
  onExport,
}: Props) {
  return (
    <section className="rounded-3xl border bg-gradient-to-br from-white to-indigo-50/60 p-5 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-3xl shadow-xs">
          {subject.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">{subject.name}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {subject.milestones.length} chủ đề · {stats.lessons} bài · {stats.completed} đã hoàn
            thành
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Progress value={stats.percent} className="h-2 flex-1" />
            <span className="text-xs font-bold text-indigo-700">{stats.percent}%</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">{formatMinutes(stats.remaining)} còn lại</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="rounded-xl" onClick={onAddTopic}>
            <Plus className="h-4 w-4" /> Thêm chủ đề
          </Button>
          <div aria-label="Thêm bài học">{addLesson}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-xl"
                aria-label="Quản lý môn"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onSelect={onEdit}>
                <Edit3 className="mr-2 h-4 w-4" /> Chỉnh sửa môn
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onExport}>
                <Download className="mr-2 h-4 w-4" /> Xuất riêng môn này
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!canMoveUp} onSelect={onMoveUp}>
                <ArrowUp className="mr-2 h-4 w-4" /> Di chuyển lên
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!canMoveDown} onSelect={onMoveDown}>
                <ArrowDown className="mr-2 h-4 w-4" /> Di chuyển xuống
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onArchive}>
                <Archive className="mr-2 h-4 w-4" /> Lưu trữ môn
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onDelete} className="text-red-700">
                <Trash2 className="mr-2 h-4 w-4" /> Xóa môn và các bài
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </section>
  );
}
