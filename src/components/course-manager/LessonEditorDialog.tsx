import type { FormEvent } from "react";
import type { Subject } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { LessonEditorDraft } from "./course-manager-model";

type Props = {
  open: boolean;
  subjects: Subject[];
  draft: LessonEditorDraft | null;
  onDraftChange: (draft: LessonEditorDraft) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  submitting?: boolean;
};

const DURATION_PRESETS = [30, 45, 60, 90, 120] as const;

export function LessonEditorDialog({
  open,
  subjects,
  draft,
  onDraftChange,
  onOpenChange,
  onSubmit,
  submitting = false,
}: Props) {
  const selectedSubject = subjects.find((subject) => subject.id === draft?.subjectId) ?? null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bài học</DialogTitle>
          <DialogDescription>
            Cập nhật nội dung và cách bài học tham gia lịch học của bạn.
          </DialogDescription>
        </DialogHeader>

        {draft ? (
          <form className="space-y-5" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="course-manager-lesson-title">Tên bài học</Label>
              <Input
                id="course-manager-lesson-title"
                value={draft.title}
                onChange={(event) => onDraftChange({ ...draft, title: event.target.value })}
                autoFocus
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course-manager-lesson-subject">Môn học</Label>
                <select
                  id="course-manager-lesson-subject"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={draft.subjectId}
                  onChange={(event) => {
                    const subject = subjects.find((item) => item.id === event.target.value);
                    onDraftChange({
                      ...draft,
                      subjectId: event.target.value,
                      topicId: subject?.milestones[0]?.id ?? "",
                    });
                  }}
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.emoji} {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-manager-lesson-topic">Chủ đề</Label>
                <select
                  id="course-manager-lesson-topic"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={draft.topicId}
                  onChange={(event) => onDraftChange({ ...draft, topicId: event.target.value })}
                >
                  {(selectedSubject?.milestones ?? []).map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-manager-lesson-minutes">Thời lượng mục tiêu</Label>
              <div className="flex flex-wrap gap-2">
                {DURATION_PRESETS.map((minutes) => (
                  <Button
                    key={minutes}
                    type="button"
                    variant={Math.round(draft.minutes) === minutes ? "default" : "outline"}
                    size="sm"
                    className="rounded-xl"
                    onClick={() => onDraftChange({ ...draft, minutes })}
                  >
                    {minutes} phút
                  </Button>
                ))}
              </div>
              <Input
                id="course-manager-lesson-minutes"
                type="number"
                min={1}
                max={1440}
                value={draft.minutes}
                onChange={(event) =>
                  onDraftChange({ ...draft, minutes: Number(event.target.value) })
                }
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Chế độ lịch</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  className={cn(
                    "rounded-xl border p-3 text-left",
                    draft.scheduleMode === "flexible"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200",
                  )}
                  onClick={() => onDraftChange({ ...draft, scheduleMode: "flexible" })}
                >
                  <span className="block text-sm font-semibold">Linh hoạt</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Ngày đã chọn là ngày sớm nhất; lịch có thể dời bài khi thiếu công suất.
                  </span>
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-xl border p-3 text-left",
                    draft.scheduleMode === "fixed"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200",
                  )}
                  onClick={() => onDraftChange({ ...draft, scheduleMode: "fixed" })}
                >
                  <span className="block text-sm font-semibold">Cố định</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Bài cố định chỉ xuất hiện đúng ngày đã chọn.
                  </span>
                </button>
              </div>
            </fieldset>

            <div className="space-y-2">
              <Label htmlFor="course-manager-lesson-date">
                {draft.scheduleMode === "fixed" ? "Ngày cố định" : "Ngày bắt đầu sớm nhất"}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="course-manager-lesson-date"
                  type="date"
                  value={draft.date}
                  onChange={(event) => onDraftChange({ ...draft, date: event.target.value })}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 rounded-xl"
                  onClick={() => onDraftChange({ ...draft, date: "" })}
                >
                  Xóa ngày
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
