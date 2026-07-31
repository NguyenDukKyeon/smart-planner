import { useState, type FormEvent, type ReactNode } from "react";
import { Plus, BookOpen, Clock, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Subject } from "@/lib/mock-data";
import { addCustomLessonToSubjects } from "@/lib/custom-subjects";
import { todayISO } from "@/lib/date-utils";
import { validateLessonForm, type FormErrors } from "@/lib/form-validation";

type Props = {
  currentSubjects: Subject[];
  onSubjectsUpdated: (subjects: Subject[]) => unknown;
  trigger?: ReactNode;
  defaultSubjectName?: string;
};

export function AddLessonModal({
  currentSubjects,
  onSubjectsUpdated,
  trigger,
  defaultSubjectName = "Tiếng Anh",
}: Props) {
  const [open, setOpen] = useState(false);
  const [subjectName, setSubjectName] = useState(defaultSubjectName);
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState(45);
  const [date, setDate] = useState(todayISO());
  const xp = 30;
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validateLessonForm({
      subjectName,
      title,
      minutes,
      xp,
      scheduledDate: date,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Vui lòng kiểm tra các trường được đánh dấu.");
      return;
    }
    if (!title.trim()) {
      toast.error("Vui lòng nhập tên bài học!");
      return;
    }
    if (!subjectName.trim()) {
      toast.error("Vui lòng chọn hoặc nhập tên môn học!");
      return;
    }

    const updatedSubjects = addCustomLessonToSubjects(currentSubjects, {
      subject: subjectName.trim(),
      topic: topic.trim() || undefined,
      title: title.trim(),
      estimatedMinutes: minutes,
      scheduledDate: date,
      xp,
    });

    const result = onSubjectsUpdated(updatedSubjects);
    const saved =
      result == null ||
      result === true ||
      (typeof result === "object" && result !== null && "ok" in result && result.ok === true);
    if (!saved) {
      toast.error("Không thể lưu bài học mới. Dữ liệu hiện tại được giữ nguyên.");
      return;
    }
    toast.success(`Đã thêm bài học "${title.trim()}" cho môn ${subjectName.trim()}! 🎉`);

    // Reset fields
    setTitle("");
    setTopic("");
    setErrors({});
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="sm"
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-soft"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm bài học</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-slate-800 flex items-center gap-2">
            📖 Thêm bài học mới
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Thêm bài học cho môn Tiếng Anh, Toán, Lý, Hóa hoặc môn học bất kỳ vào lộ trình cá nhân.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 mt-2"
          noValidate
          aria-describedby="add-lesson-help add-lesson-errors"
        >
          <p id="add-lesson-help" className="text-xs text-muted-foreground">
            Các trường có dấu sao là bắt buộc. XP và Coin được tính theo quy tắc gamification chung.
          </p>
          <p id="add-lesson-errors" className="sr-only" role="alert">
            {Object.values(errors).join(" ")}
          </p>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
              Môn học:
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="text"
                aria-label="Tên môn học"
                aria-invalid={!!errors.subjectName}
                aria-describedby="add-lesson-help add-lesson-errors"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="VD: Tiếng Anh, Toán, Vật lý..."
                className="rounded-xl border-slate-200 text-xs flex-1"
                required
              />
              <div className="flex flex-wrap gap-1">
                {["Tiếng Anh", "Toán", "Vật lý", "Hóa học"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubjectName(s)}
                    className={`px-2 py-1 text-[11px] rounded-lg transition-all border ${
                      subjectName === s
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {s === "Tiếng Anh" ? "🇬🇧 Eng" : s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>📌 Chủ đề / Chương (không bắt buộc):</span>
            </Label>
            <Input
              type="text"
              aria-label="Chủ đề hoặc chương"
              aria-describedby="add-lesson-help"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="VD: Chương 1: Mệnh đề & Tập hợp"
              className="rounded-xl border-slate-200 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Tên bài học:</Label>
            <Input
              type="text"
              aria-label="Tên bài học"
              aria-invalid={!!errors.title}
              aria-describedby="add-lesson-help add-lesson-errors"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Unit 1: Reading - Life Stories"
              className="rounded-xl border-slate-200 text-xs"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-sky-600" />
              Thời lượng mục tiêu:
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 60, 90, 120].map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  size="sm"
                  variant={minutes === preset ? "default" : "outline"}
                  className="rounded-xl"
                  onClick={() => setMinutes(preset)}
                >
                  {preset}p
                </Button>
              ))}
            </div>
            <Input
              type="number"
              aria-label="Thời lượng mục tiêu theo phút"
              aria-invalid={!!errors.minutes}
              aria-describedby="add-lesson-help add-lesson-errors"
              min={1}
              max={1440}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="rounded-xl border-slate-200 text-xs"
              required
            />
            <p className="text-[11px] text-slate-500">Đây là tổng thời lượng mục tiêu của bài, không phải độ dài một phiên Pomodoro.</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-purple-600" />
              Ngày học dự kiến (có thể để trống):
            </Label>
            <Input
              type="date"
              aria-label="Ngày học dự kiến"
              aria-invalid={!!errors.scheduledDate}
              aria-describedby="add-lesson-help add-lesson-errors"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border-slate-200 text-xs"
            />
            {date && (
              <button
                type="button"
                onClick={() => setDate("")}
                className="text-[11px] text-muted-foreground underline"
              >
                Bỏ ngày cố định
              </button>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5"
            >
              + Thêm ngay
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
