import type { ReactNode } from "react";
import { ArrowLeft, Search, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LessonFilter, LessonSort } from "./course-manager-model";

type Props = {
  mobileDetail: boolean;
  hasSubject: boolean;
  search: string;
  filter: LessonFilter;
  sort: LessonSort;
  selectionMode: boolean;
  reorderEnabled: boolean;
  canUndoSchedule: boolean;
  header: ReactNode;
  bulkActions?: ReactNode;
  children: ReactNode;
  onBack: () => void;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: LessonFilter) => void;
  onSortChange: (value: LessonSort) => void;
  onToggleSelectionMode: () => void;
  onUndoSchedule: () => void;
};

function EmptySubject() {
  return (
    <div className="grid h-full place-items-center rounded-2xl border border-dashed p-8 text-center">
      <div>
        <p className="text-sm font-semibold text-slate-700">Chọn một môn học</p>
        <p className="mt-1 text-xs text-slate-500">
          Chọn môn ở danh sách bên trái hoặc tạo môn học đầu tiên.
        </p>
      </div>
    </div>
  );
}

export function SubjectWorkspace({
  mobileDetail,
  hasSubject,
  search,
  filter,
  sort,
  selectionMode,
  reorderEnabled,
  canUndoSchedule,
  header,
  bulkActions,
  children,
  onBack,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onToggleSelectionMode,
  onUndoSchedule,
}: Props) {
  return (
    <main
      data-course-scroll-container
      className={cn(
        "min-h-0 overflow-y-auto bg-white p-4 sm:p-5",
        !mobileDetail && "hidden md:block",
      )}
    >
      {hasSubject ? (
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mb-3 rounded-xl md:hidden"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" /> Danh sách môn
          </Button>

          {header}

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_170px_170px_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Tìm tên bài hoặc chủ đề…"
                className="rounded-xl pl-9"
              />
            </div>
            <select
              aria-label="Lọc bài học"
              value={filter}
              onChange={(event) => onFilterChange(event.target.value as LessonFilter)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="all">Tất cả bài</option>
              <option value="not-started">Chưa bắt đầu</option>
              <option value="in-progress">Đang học</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="unscheduled">Chưa lên lịch</option>
            </select>
            <select
              aria-label="Sắp xếp bài học"
              value={sort}
              onChange={(event) => onSortChange(event.target.value as LessonSort)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="roadmap">Thứ tự lộ trình</option>
              <option value="date">Ngày dự kiến</option>
              <option value="progress">Tiến độ</option>
              <option value="name">Tên bài</option>
              <option value="remaining">Thời lượng còn lại</option>
            </select>
            <Button
              type="button"
              variant={selectionMode ? "default" : "outline"}
              className="rounded-xl"
              onClick={onToggleSelectionMode}
            >
              {selectionMode ? "Hủy chọn" : "Chọn nhiều"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={!canUndoSchedule}
              onClick={onUndoSchedule}
            >
              <Undo2 className="h-4 w-4" /> Hoàn tác thay đổi lịch
            </Button>
          </div>

          {!reorderEnabled ? (
            <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Đổi về “Thứ tự lộ trình”, bỏ bộ lọc và tìm kiếm để kéo-thả hoặc di chuyển bài.
            </p>
          ) : null}

          {bulkActions ? <div className="mt-3">{bulkActions}</div> : null}
          <div className="mt-4 space-y-3">{children}</div>
        </>
      ) : (
        <EmptySubject />
      )}
    </main>
  );
}