import { useEffect, useId, useState, type FormEvent } from "react";
import { CalendarDays } from "lucide-react";
import type { Lesson } from "@/lib/mock-data";
import { isDateISO } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type MoveLessonDateDialogProps = {
  lesson: Lesson;
  onMove: (lessonId: string, targetDateISO: string) => boolean;
};

export function MoveLessonDateDialog({ lesson, onMove }: MoveLessonDateDialogProps) {
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(lesson.scheduledDate ?? "");
  const [error, setError] = useState("");
  const descriptionId = useId();
  const errorId = useId();
  const mode = lesson.scheduleMode ?? "flexible";

  useEffect(() => {
    if (!open) return;
    setDraftDate(lesson.scheduledDate ?? "");
    setError("");
  }, [lesson.scheduledDate, open]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draftDate) {
      setError("Hãy chọn một ngày.");
      return;
    }
    if (!isDateISO(draftDate)) {
      setError("Ngày đã chọn không hợp lệ.");
      return;
    }

    setError("");
    const moved = onMove(lesson.id, draftDate);
    if (moved) setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Chọn ngày
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Chuyển “{lesson.title}”</DialogTitle>
            <DialogDescription id={descriptionId}>
              {mode === "fixed"
                ? "Bài cố định sẽ chỉ xuất hiện đúng ngày đã chọn."
                : "Ngày đã chọn là ngày sớm nhất; lịch có thể xếp bài sang ngày sau nếu thiếu công suất."}
            </DialogDescription>
          </DialogHeader>

          <label className="mt-4 block space-y-2 text-sm font-semibold text-slate-800">
            <span>Ngày mới</span>
            <Input
              type="date"
              value={draftDate}
              onChange={(event) => {
                setDraftDate(event.target.value);
                if (error) setError("");
              }}
              aria-describedby={error ? `${descriptionId} ${errorId}` : descriptionId}
              aria-invalid={Boolean(error)}
            />
          </label>
          {error && (
            <p id={errorId} role="alert" className="mt-2 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}

          <DialogFooter className="mt-5 gap-2 sm:space-x-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit">Chuyển ngày</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
