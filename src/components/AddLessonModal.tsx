import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Plus, BookOpen, Clock, Calendar, FolderOpen } from "lucide-react";
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
import type { LessonScheduleMode, Subject } from "@/lib/mock-data";
import { addCustomLessonToSubjects, moveLessonsToTopic } from "@/lib/custom-subjects";
import { todayISO } from "@/lib/date-utils";
import { validateLessonForm, type FormErrors } from "@/lib/form-validation";

const NEW_SUBJECT = "__new_subject__";
const NO_TOPIC = "__no_topic__";
const NEW_TOPIC = "__new_topic__";

type Props = {
  currentSubjects: Subject[];
  onSubjectsUpdated: (subjects: Subject[]) => unknown;
  trigger?: ReactNode;
  defaultSubjectName?: string;
};

function sameText(left: string, right: string) {
  return left.localeCompare(right, "vi", { sensitivity: "base" }) === 0;
}

function lessonIds(subjects: Subject[]) {
  return new Set(
    subjects.flatMap((subject) =>
      subject.milestones.flatMap((milestone) => milestone.lessons.map((lesson) => lesson.id)),
    ),
  );
}

export function AddLessonModal({
  currentSubjects,
  onSubjectsUpdated,
  trigger,
  defaultSubjectName = "Tiếng Anh",
}: Props) {
  const [open, setOpen] = useState(false);
  const [subjectChoice, setSubjectChoice] = useState(NEW_SUBJECT);
  const [customSubjectName, setCustomSubjectName] = useState(defaultSubjectName);
  const [topicChoice, setTopicChoice] = useState(NO_TOPIC);
  const [customTopic, setCustomTopic] = useState("");
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState(45);
  const [date, setDate] = useState(todayISO());
  const [scheduleMode, setScheduleMode] = useState<LessonScheduleMode>("flexible");
  const xp = 30;
  const [errors, setErrors] = useState<FormErrors>({});

  const selectedSubject = useMemo(
    () => currentSubjects.find((subject) => subject.id === subjectChoice) ?? null,
    [currentSubjects, subjectChoice],
  );

  useEffect(() => {
    if (!open) return;
    const preferred =
      currentSubjects.find((subject) => sameText(subject.name, defaultSubjectName)) ??
      currentSubjects[0] ??
      null;
    setSubjectChoice(preferred?.id ?? NEW_SUBJECT);
    setCustomSubjectName(preferred ? "" : defaultSubjectName);
    setTopicChoice(NO_TOPIC);
    setCustomTopic("");
    setTitle("");
    setMinutes(45);
    setDate(todayISO());
    setScheduleMode("flexible");
    setErrors({});
  }, [open, defaultSubjectName, currentSubjects]);

  const subjectName =
    subjectChoice === NEW_SUBJECT ? customSubjectName.trim() : (selectedSubject?.name ?? "");

  const topicName =
    topicChoice === NO_TOPIC
      ? ""
      : topicChoice === NEW_TOPIC
        ? customTopic.trim()
        : (selectedSubject?.milestones.find((milestone) => milestone.id === topicChoice)?.title ??
          "");

  const handleSubjectChange = (value: string) => {
    setSubjectChoice(value);
    setTopicChoice(NO_TOPIC);
    setCustomTopic("");
    setErrors((current) => ({ ...current, subjectName: undefined }));
  };

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
    if (!subjectName) {
      toast.error("Vui lòng chọn hoặc nhập tên môn học!");
      return;
    }
    if (scheduleMode === "fixed" && !date) {
      toast.error("Bài cố định cần có ngày học cụ thể.");
      return;
    }
    if (topicChoice === NEW_TOPIC && !topicName) {
      toast.error("Vui lòng nhập tên chủ đề mới.");
      return;
    }
    if (
      topicChoice === NEW_TOPIC &&
      selectedSubject?.milestones.some((milestone) => sameText(milestone.title, topicName))
    ) {
      toast.error("Chủ đề này đã tồn tại. Hãy chọn nó trong danh sách thay vì tạo lại.");
      return;
    }

    const previousLessonIds = lessonIds(currentSubjects);
    let updatedSubjects = addCustomLessonToSubjects(currentSubjects, {
      subjectId: selectedSubject?.id,
      subject: subjectName,
      topic: topicName || undefined,
      title: title.trim(),
      estimatedMinutes: minutes,
      scheduledDate: date,
      scheduleMode,
      xp,
    });

    // addCustomLessonToSubjects resolves topics by title for backwards compatibility.
    // Move the newly created lesson by topic ID so duplicate topic names still target
    // the exact chapter selected by the user.
    if (selectedSubject && topicChoice !== NO_TOPIC && topicChoice !== NEW_TOPIC) {
      const addedLesson = updatedSubjects
        .flatMap((subject) => subject.milestones.flatMap((milestone) => milestone.lessons))
        .find((lesson) => !previousLessonIds.has(lesson.id));
      if (addedLesson) {
        updatedSubjects = moveLessonsToTopic(
          updatedSubjects,
          [addedLesson.id],
          selectedSubject.id,
          topicChoice,
        );
      }
    }

    const result = onSubjectsUpdated(updatedSubjects);
    const saved =
      result == null ||
      result === true ||
      (typeof result === "object" && result !== null && "ok" in result && result.ok === true);
    if (!saved) {
      toast.error("Không thể lưu bài học mới. Dữ liệu hiện tại được giữ nguyên.");
      return;
    }

    const placement = topicName ? ` trong chủ đề “${topicName}”` : "";
    toast.success(`Đã thêm “${title.trim()}” vào môn ${subjectName}${placement}.`);
    setTitle("");
    setTopicChoice(NO_TOPIC);
    setCustomTopic("");
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
            Chọn đúng môn và chủ đề để bài học xuất hiện ở vị trí mong muốn trong lộ trình.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 mt-2"
          noValidate
          aria-describedby="add-lesson-help add-lesson-errors"
        >
          <p id="add-lesson-help" className="text-xs text-muted-foreground">
            Chọn một chủ đề có sẵn hoặc tạo chủ đề mới ngay trong form này.
          </p>
          <p id="add-lesson-errors" className="sr-only" role="alert">
            {Object.values(errors).filter(Boolean).join(" ")}
          </p>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
              Môn học <span aria-hidden="true">*</span>
            </Label>
            <select
              aria-label="Chọn môn học"
              aria-invalid={!!errors.subjectName}
              aria-describedby="add-lesson-help add-lesson-errors"
              value={subjectChoice}
              onChange={(event) => handleSubjectChange(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {currentSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.emoji} {subject.name}
                </option>
              ))}
              <option value={NEW_SUBJECT}>＋ Tạo môn học mới…</option>
            </select>
            {subjectChoice === NEW_SUBJECT && (
              <Input
                type="text"
                aria-label="Tên môn học mới"
                aria-invalid={!!errors.subjectName}
                aria-describedby="add-lesson-help add-lesson-errors"
                value={customSubjectName}
                onChange={(event) => setCustomSubjectName(event.target.value)}
                placeholder="VD: Tiếng Anh"
                className="rounded-xl border-slate-200 text-xs"
                autoFocus
                required
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <FolderOpen className="h-3.5 w-3.5 text-amber-600" />
              Chủ đề / chương
            </Label>
            <select
              aria-label="Chọn chủ đề"
              value={topicChoice}
              onChange={(event) => {
                setTopicChoice(event.target.value);
                if (event.target.value !== NEW_TOPIC) setCustomTopic("");
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <option value={NO_TOPIC}>Không phân loại</option>
              {selectedSubject?.milestones.map((milestone) => (
                <option key={milestone.id} value={milestone.id}>
                  {milestone.title} ({milestone.lessons.length} bài)
                </option>
              ))}
              <option value={NEW_TOPIC}>＋ Tạo chủ đề mới…</option>
            </select>
            {topicChoice === NEW_TOPIC && (
              <Input
                type="text"
                aria-label="Tên chủ đề mới"
                value={customTopic}
                onChange={(event) => setCustomTopic(event.target.value)}
                placeholder="VD: Unit 1: A long and healthy life"
                className="rounded-xl border-slate-200 text-xs"
                autoFocus
              />
            )}
            {selectedSubject &&
              selectedSubject.milestones.length === 0 &&
              topicChoice !== NEW_TOPIC && (
                <p className="text-[11px] text-amber-700">
                  Môn này chưa có chủ đề. Chọn “Tạo chủ đề mới” để tạo chủ đề đầu tiên.
                </p>
              )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Tên bài học <span aria-hidden="true">*</span>
            </Label>
            <Input
              type="text"
              aria-label="Tên bài học"
              aria-invalid={!!errors.title}
              aria-describedby="add-lesson-help add-lesson-errors"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="VD: Unit 1 - Reading"
              className="rounded-xl border-slate-200 text-xs"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-sky-600" />
              Thời lượng mục tiêu
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
              onChange={(event) => setMinutes(Number(event.target.value))}
              className="rounded-xl border-slate-200 text-xs"
              required
            />
            <p className="text-[11px] text-slate-500">
              Đây là tổng thời lượng mục tiêu của bài, không phải độ dài một phiên Pomodoro.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Cách xếp lịch</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={scheduleMode === "flexible" ? "default" : "outline"}
                className="h-auto rounded-xl px-3 py-2 text-left"
                onClick={() => setScheduleMode("flexible")}
              >
                <span>
                  <span className="block text-xs font-bold">Linh hoạt</span>
                  <span className="block text-[10px] font-normal opacity-80">
                    Có thể dời sang ngày sau
                  </span>
                </span>
              </Button>
              <Button
                type="button"
                variant={scheduleMode === "fixed" ? "default" : "outline"}
                className="h-auto rounded-xl px-3 py-2 text-left"
                onClick={() => setScheduleMode("fixed")}
              >
                <span>
                  <span className="block text-xs font-bold">Cố định</span>
                  <span className="block text-[10px] font-normal opacity-80">
                    Chỉ học đúng ngày này
                  </span>
                </span>
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-purple-600" />
              {scheduleMode === "fixed" ? "Ngày học cố định" : "Có thể học từ ngày"}
            </Label>
            <Input
              type="date"
              aria-label="Ngày học dự kiến"
              aria-invalid={!!errors.scheduledDate}
              aria-describedby="add-lesson-help add-lesson-errors"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-xl border-slate-200 text-xs"
            />
            {date && (
              <button
                type="button"
                onClick={() => setDate("")}
                className="text-[11px] text-muted-foreground underline"
              >
                Bỏ ngày
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
              Thêm vào chủ đề
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
