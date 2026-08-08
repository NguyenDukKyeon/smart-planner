import { Archive, CalendarDays, ChevronRight, Trash2 } from "lucide-react";
import type { LessonScheduleMode, Subject } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  subjects: Subject[];
  selectedSubject: Subject;
  selectedCount: number;
  targetSubjectId: string;
  targetTopicId: string;
  date: string;
  scheduleMode: LessonScheduleMode;
  durationMinutes: number;
  onTargetSubjectIdChange: (subjectId: string) => void;
  onTargetTopicIdChange: (topicId: string) => void;
  onDateChange: (date: string) => void;
  onScheduleModeChange: (mode: LessonScheduleMode) => void;
  onDurationMinutesChange: (minutes: number) => void;
  onSelectVisible: () => void;
  onMoveToSubject: () => void;
  onMoveToTopic: () => void;
  onUpdateDate: () => void;
  onUpdateMode: () => void;
  onUpdateDuration: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

export function BulkActionsBar({
  subjects,
  selectedSubject,
  selectedCount,
  targetSubjectId,
  targetTopicId,
  date,
  scheduleMode,
  durationMinutes,
  onTargetSubjectIdChange,
  onTargetTopicIdChange,
  onDateChange,
  onScheduleModeChange,
  onDurationMinutesChange,
  onSelectVisible,
  onMoveToSubject,
  onMoveToTopic,
  onUpdateDate,
  onUpdateMode,
  onUpdateDuration,
  onArchive,
  onDelete,
}: Props) {
  const hasSelection = selectedCount > 0;

  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-indigo-950">Đã chọn {selectedCount} bài học</p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-xl"
          onClick={onSelectVisible}
        >
          Chọn tất cả đang hiển thị
        </Button>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <div className="flex gap-2">
          <select
            aria-label="Môn học đích"
            value={targetSubjectId}
            onChange={(event) => onTargetSubjectIdChange(event.target.value)}
            className="h-9 min-w-0 flex-1 rounded-xl border border-indigo-200 bg-white px-2 text-xs"
          >
            <option value="">Chuyển sang môn…</option>
            {subjects
              .filter((subject) => subject.id !== selectedSubject.id)
              .map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
          </select>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl"
            disabled={!targetSubjectId || !hasSelection}
            onClick={onMoveToSubject}
            aria-label="Chuyển các bài đã chọn"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <select
            aria-label="Chủ đề đích"
            value={targetTopicId}
            onChange={(event) => onTargetTopicIdChange(event.target.value)}
            className="h-9 min-w-0 flex-1 rounded-xl border border-indigo-200 bg-white px-2 text-xs"
          >
            <option value="">Chuyển sang chủ đề…</option>
            {selectedSubject.milestones.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl"
            disabled={!targetTopicId || !hasSelection}
            onClick={onMoveToTopic}
            aria-label="Chuyển các bài sang chủ đề"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Input
            type="date"
            aria-label="Ngày dự kiến hàng loạt"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="h-9 min-w-0 flex-1 rounded-xl bg-white text-xs"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl"
            disabled={!hasSelection}
            onClick={onUpdateDate}
            aria-label="Cập nhật ngày dự kiến"
          >
            <CalendarDays className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <select
            aria-label="Cách xếp lịch hàng loạt"
            value={scheduleMode}
            onChange={(event) => onScheduleModeChange(event.target.value as LessonScheduleMode)}
            className="h-9 min-w-0 flex-1 rounded-xl border border-indigo-200 bg-white px-2 text-xs"
          >
            <option value="flexible">Linh hoạt</option>
            <option value="fixed">Cố định</option>
          </select>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl"
            disabled={!hasSelection}
            onClick={onUpdateMode}
            aria-label="Cập nhật cách xếp lịch"
          >
            <CalendarDays className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <select
            aria-label="Thời lượng mục tiêu hàng loạt"
            value={durationMinutes}
            onChange={(event) => onDurationMinutesChange(Number(event.target.value))}
            className="h-9 min-w-0 flex-1 rounded-xl border border-indigo-200 bg-white px-2 text-xs"
          >
            <option value={30}>30 phút</option>
            <option value={60}>60 phút</option>
            <option value={90}>90 phút</option>
            <option value={120}>120 phút</option>
          </select>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl"
            disabled={!hasSelection}
            onClick={onUpdateDuration}
          >
            Áp dụng
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1 rounded-xl"
            disabled={!hasSelection}
            onClick={onArchive}
          >
            <Archive className="h-4 w-4" /> Lưu trữ
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl text-red-700"
            disabled={!hasSelection}
            onClick={onDelete}
            aria-label="Xóa các bài đã chọn"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
