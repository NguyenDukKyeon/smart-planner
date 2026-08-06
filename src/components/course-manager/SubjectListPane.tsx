import { FolderArchive, Plus, Search, Undo2 } from "lucide-react";
import type { Lesson, Subject } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { SubjectStats } from "./course-manager-model";

export type ArchivedLessonListItem = {
  lesson: Lesson;
  subjectName: string;
};

type Props = {
  subjects: Subject[];
  visibleSubjects: Subject[];
  archivedSubjects: Subject[];
  archivedLessons: ArchivedLessonListItem[];
  selectedSubjectId: string;
  mobileDetail: boolean;
  archiveView: boolean;
  subjectSearch: string;
  newSubjectName: string;
  newSubjectEmoji: string;
  getSubjectStats: (subject: Subject) => SubjectStats;
  onSubjectSearchChange: (value: string) => void;
  onNewSubjectNameChange: (value: string) => void;
  onNewSubjectEmojiChange: (value: string) => void;
  onCreateSubject: () => void;
  onArchiveViewChange: (archived: boolean) => void;
  onSelectSubject: (subjectId: string) => void;
  onRestoreSubject: (subjectId: string) => void;
  onRestoreLesson: (lessonId: string) => void;
  onRestoreCatalogBackup: () => void;
};

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} giờ ${rest} phút` : `${hours} giờ`;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-white p-4 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function ArchivedItem({ label, onRestore }: { label: string; onRestore: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border bg-white p-3">
      <FolderArchive className="h-4 w-4 shrink-0 text-slate-500" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
      <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={onRestore}>
        Khôi phục
      </Button>
    </div>
  );
}

export function SubjectListPane({
  subjects,
  visibleSubjects,
  archivedSubjects,
  archivedLessons,
  selectedSubjectId,
  mobileDetail,
  archiveView,
  subjectSearch,
  newSubjectName,
  newSubjectEmoji,
  getSubjectStats,
  onSubjectSearchChange,
  onNewSubjectNameChange,
  onNewSubjectEmojiChange,
  onCreateSubject,
  onArchiveViewChange,
  onSelectSubject,
  onRestoreSubject,
  onRestoreLesson,
  onRestoreCatalogBackup,
}: Props) {
  return (
    <aside
      className={cn(
        "min-h-0 overflow-y-auto border-r bg-slate-50/80 p-3",
        mobileDetail && "hidden md:block",
      )}
    >
      <div className="rounded-2xl border bg-white p-3">
        <div className="grid grid-cols-[64px_1fr] gap-2">
          <Input
            value={newSubjectEmoji}
            maxLength={4}
            onChange={(event) => onNewSubjectEmojiChange(event.target.value)}
            className="text-center text-lg"
            aria-label="Biểu tượng môn mới"
          />
          <Input
            value={newSubjectName}
            onChange={(event) => onNewSubjectNameChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onCreateSubject();
            }}
            placeholder="Tên môn học mới"
          />
        </div>
        <Button
          type="button"
          className="mt-2 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700"
          onClick={onCreateSubject}
        >
          <Plus className="h-4 w-4" /> Thêm môn học
        </Button>
      </div>

      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={subjectSearch}
          onChange={(event) => onSubjectSearchChange(event.target.value)}
          placeholder="Tìm môn học…"
          className="rounded-xl bg-white pl-9"
        />
      </div>

      <Tabs
        value={archiveView ? "archived" : "active"}
        onValueChange={(value) => onArchiveViewChange(value === "archived")}
        className="mt-3"
      >
        <TabsList className="grid w-full grid-cols-2 rounded-xl">
          <TabsTrigger value="active" className="rounded-lg text-xs">
            Đang học
          </TabsTrigger>
          <TabsTrigger value="archived" className="rounded-lg text-xs">
            Đã lưu trữ
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {!archiveView ? (
        <div className="mt-3 space-y-2">
          {visibleSubjects.map((subject) => {
            const stats = getSubjectStats(subject);
            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => onSelectSubject(subject.id)}
                className={cn(
                  "w-full rounded-2xl border p-3 text-left transition",
                  selectedSubjectId === subject.id
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                )}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl">{subject.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{subject.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {stats.completed} / {stats.lessons} bài · {formatMinutes(stats.remaining)} còn
                      lại
                    </p>
                    <Progress value={stats.percent} className="mt-2 h-1.5" />
                  </div>
                </div>
              </button>
            );
          })}
          {subjects.length === 0 ? (
            <EmptyState
              title="Bạn chưa có môn học nào"
              description="Tạo môn đầu tiên hoặc thêm bài học mới."
            />
          ) : visibleSubjects.length === 0 ? (
            <EmptyState title="Không tìm thấy môn học" description="Hãy thử từ khóa khác." />
          ) : null}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {archivedSubjects.map((subject) => (
            <ArchivedItem
              key={subject.id}
              label={`${subject.emoji} ${subject.name}`}
              onRestore={() => onRestoreSubject(subject.id)}
            />
          ))}
          {archivedLessons.map((item) => (
            <ArchivedItem
              key={item.lesson.id}
              label={`${item.lesson.title} · ${item.subjectName}`}
              onRestore={() => onRestoreLesson(item.lesson.id)}
            />
          ))}
          {archivedSubjects.length === 0 && archivedLessons.length === 0 ? (
            <EmptyState
              title="Kho lưu trữ đang trống"
              description="Môn và bài được lưu trữ sẽ xuất hiện tại đây."
            />
          ) : null}
        </div>
      )}

      <Button
        type="button"
        variant="ghost"
        className="mt-3 w-full rounded-xl text-xs"
        onClick={onRestoreCatalogBackup}
      >
        <Undo2 className="h-4 w-4" /> Hoàn tác thay đổi danh mục gần nhất
      </Button>
    </aside>
  );
}
