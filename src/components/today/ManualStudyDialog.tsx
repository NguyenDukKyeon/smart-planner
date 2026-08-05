import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStudySession, type StudySession } from "@/lib/study-sessions";
import type { ManualStudyRequest } from "./types";

type Props = {
  request: ManualStudyRequest | null;
  onClose: () => void;
  onAddStudySession: (session: StudySession) => boolean | void;
  onReviewComplete?: (taskId: string) => boolean | void;
};

export function ManualStudyDialog({
  request,
  onClose,
  onAddStudySession,
  onReviewComplete,
}: Props) {
  const [minutes, setMinutes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setMinutes(request ? String(request.estimatedMinutes) : "");
    setError("");
  }, [request]);

  return (
    <Dialog open={Boolean(request)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Ghi thời gian học</DialogTitle>
          <DialogDescription id="manual-minutes-help">
            Ghi số phút thực tế cho “{request?.lessonTitle}”. Giá trị phải từ 5 đến 240 phút.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const value = Number(minutes);
            if (!Number.isFinite(value) || value < 5 || value > 240) {
              setError("Nhập số phút từ 5 đến 240.");
              return;
            }
            if (!request) return;
            const sessionSaved = onAddStudySession(
              createStudySession({
                lessonId: request.lessonId,
                durationSeconds: value * 60,
                source: "manual",
              }),
            );
            if (sessionSaved === false) {
              toast.error("Không thể lưu thời gian học. Dữ liệu hiện tại được giữ nguyên.");
              return;
            }
            if (request.reviewTaskId && onReviewComplete?.(request.reviewTaskId) === false) {
              toast.error(`Đã lưu ${value} phút nhưng chưa thể đánh dấu lượt ôn hoàn thành.`);
              onClose();
              return;
            }
            toast.success(
              request.reviewTaskId
                ? `Đã ghi ${value} phút và hoàn thành lượt ôn`
                : `Đã ghi ${value} phút cho bài này`,
            );
            onClose();
          }}
          aria-describedby="manual-minutes-help manual-minutes-error"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="manual-minutes">Số phút thực tế</Label>
            <Input
              id="manual-minutes"
              type="number"
              min={5}
              max={240}
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby="manual-minutes-help manual-minutes-error"
              autoFocus
              required
            />
            <p id="manual-minutes-error" className="min-h-4 text-xs text-destructive" role="alert">
              {error}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Ghi thời gian</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
