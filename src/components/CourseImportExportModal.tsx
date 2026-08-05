import { useMemo, useRef, useState } from "react";
import {
  ArchiveRestore,
  BookOpenCheck,
  CheckCircle2,
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  FolderInput,
  RotateCcw,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  SAMPLE_CSV_CONTENT,
  SAMPLE_JSON_CONTENT,
  convertRawToSubjects,
  downloadFile,
  parseCSVInputWithDiagnostics,
  parseJSONInputWithDiagnostics,
  CUSTOM_SUBJECTS_BACKUP_KEY,
  CUSTOM_SUBJECTS_KEY,
  type ImportedRawLesson,
  type ImportIssue,
} from "@/lib/custom-subjects";
import { SUBJECTS, type Subject } from "@/lib/mock-data";
import type { ProgressState } from "@/lib/progress-store";
import { getStoredTimerState } from "@/lib/focus-timer-store";
import { createAppBackup, restoreAppBackup, restoreLastImportRollback } from "@/lib/app-backup";
import { replaceRawValuesSafely, restoreSnapshotFromKey } from "@/lib/app-storage";
import { cn } from "@/lib/utils";

type Props = {
  currentSubjects: Subject[];
  onSubjectsUpdated: (subjects: Subject[]) => void;
  progress: ProgressState;
};

type ImportMode = "merge" | "replace";

type PreviewStats = {
  subjects: number;
  lessons: number;
  duplicates: number;
  invalid: number;
};

function flattenSubjects(subjects: Subject[]): ImportedRawLesson[] {
  return subjects.flatMap((subject) =>
    subject.milestones.flatMap((milestone) =>
      milestone.lessons.map((lesson) => ({
        subjectId: subject.id,
        lessonId: lesson.id,
        subject: subject.name,
        topic:
          lesson.topic || (milestone.title !== "Toàn bộ bài học" ? milestone.title : undefined),
        title: lesson.title,
        estimatedMinutes: lesson.plannedDurationMinutes,
        scheduledDate: lesson.scheduledDate,
        xp: lesson.xp,
      })),
    ),
  );
}

function toPortableRows(items: ImportedRawLesson[]) {
  return items.map((item) => ({
    subject_id: item.subjectId ?? "",
    subject_name: item.subject,
    topic: item.topic ?? "",
    lesson_id: item.lessonId ?? "",
    lesson_name: item.title,
    target_minutes: item.estimatedMinutes ?? 45,
    planned_date: item.scheduledDate,
    xp_reward: item.xp ?? 30,
  }));
}

function toCsv(items: ImportedRawLesson[]): string {
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const rows = toPortableRows(items);
  const headers = [
    "subject_id",
    "subject_name",
    "topic",
    "lesson_id",
    "lesson_name",
    "target_minutes",
    "planned_date",
    "xp_reward",
  ] as const;
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(",")),
  ].join("\n");
}

function lessonIds(subjects: Subject[]): Set<string> {
  return new Set(
    subjects.flatMap((subject) =>
      subject.milestones.flatMap((milestone) => milestone.lessons.map((lesson) => lesson.id)),
    ),
  );
}

function dedupeIncomingSubjects(subjects: Subject[]): {
  subjects: Subject[];
  duplicateIds: number;
} {
  const seen = new Set<string>();
  let duplicateIds = 0;
  const next = subjects.map((subject) => ({
    ...subject,
    milestones: subject.milestones.map((milestone) => {
      const lessons = milestone.lessons.filter((lesson) => {
        if (seen.has(lesson.id)) {
          duplicateIds += 1;
          return false;
        }
        seen.add(lesson.id);
        return true;
      });
      return { ...milestone, lessons, subtitle: `${lessons.length} bài học` };
    }),
  }));
  return {
    subjects: next.filter((subject) =>
      subject.milestones.some((milestone) => milestone.lessons.length > 0),
    ),
    duplicateIds,
  };
}

function mergeSubjects(current: Subject[], incoming: Subject[]): Subject[] {
  const result = structuredClone(current) as Subject[];
  for (const incomingSubject of incoming) {
    const subjectIndex = result.findIndex(
      (subject) =>
        subject.id === incomingSubject.id ||
        subject.name.localeCompare(incomingSubject.name, "vi", { sensitivity: "base" }) === 0,
    );
    if (subjectIndex === -1) {
      result.push(incomingSubject);
      continue;
    }
    const subject = result[subjectIndex];
    const allExistingIds = new Set(
      subject.milestones.flatMap((milestone) => milestone.lessons.map((lesson) => lesson.id)),
    );
    for (const incomingMilestone of incomingSubject.milestones) {
      const milestoneIndex = subject.milestones.findIndex(
        (milestone) =>
          milestone.id === incomingMilestone.id ||
          milestone.title.localeCompare(incomingMilestone.title, "vi", { sensitivity: "base" }) ===
            0,
      );
      const freshLessons = incomingMilestone.lessons.filter(
        (lesson) => !allExistingIds.has(lesson.id),
      );
      if (freshLessons.length === 0) continue;
      if (milestoneIndex === -1) {
        subject.milestones.push({ ...incomingMilestone, lessons: freshLessons });
      } else {
        subject.milestones[milestoneIndex] = {
          ...subject.milestones[milestoneIndex],
          lessons: [...subject.milestones[milestoneIndex].lessons, ...freshLessons],
          subtitle: `${subject.milestones[milestoneIndex].lessons.length + freshLessons.length} bài học`,
        };
      }
      freshLessons.forEach((lesson) => allExistingIds.add(lesson.id));
    }
    result[subjectIndex] = { ...subject, milestones: [...subject.milestones] };
  }
  return result;
}

export function CourseImportExportModal({ currentSubjects, onSubjectsUpdated, progress }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("available");
  const [preview, setPreview] = useState<ImportedRawLesson[]>([]);
  const [importIssues, setImportIssues] = useState<ImportIssue[]>([]);
  const [sourceName, setSourceName] = useState("");
  const [importMode, setImportMode] = useState<ImportMode>("merge");
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [backupRaw, setBackupRaw] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const incomingCatalog = useMemo(
    () => dedupeIncomingSubjects(convertRawToSubjects(preview)),
    [preview],
  );
  const incomingSubjects = incomingCatalog.subjects;
  const previewStats = useMemo<PreviewStats>(() => {
    const currentIds = lessonIds(currentSubjects);
    const incomingLessons = incomingSubjects.flatMap((subject) =>
      subject.milestones.flatMap((milestone) => milestone.lessons),
    );
    return {
      subjects: incomingSubjects.filter((subject) =>
        subject.milestones.some((milestone) => milestone.lessons.length > 0),
      ).length,
      lessons: incomingLessons.length,
      duplicates:
        incomingCatalog.duplicateIds +
        incomingLessons.filter((lesson) => currentIds.has(lesson.id)).length,
      invalid: importIssues.length,
    };
  }, [currentSubjects, importIssues.length, incomingCatalog.duplicateIds, incomingSubjects]);

  const readRoadmapFile = async (file: File) => {
    setBusy(true);
    try {
      const lower = file.name.toLowerCase();
      const parsed =
        lower.endsWith(".xlsx") || lower.endsWith(".xls")
          ? (await import("@/lib/excel-import-export")).parseExcelBufferWithDiagnostics(
              await file.arrayBuffer(),
            )
          : lower.endsWith(".json")
            ? parseJSONInputWithDiagnostics(await file.text())
            : parseCSVInputWithDiagnostics(await file.text());
      if (parsed.items.length === 0) {
        const firstIssue = parsed.issues[0]?.message;
        toast.error(firstIssue || "Không tìm thấy bài học hợp lệ. Hãy kiểm tra cấu trúc file mẫu.");
        setImportIssues(parsed.issues);
        return;
      }
      setPreview(parsed.items);
      setImportIssues(parsed.issues);
      setSourceName(file.name);
      setTab("import");
      toast.success(
        parsed.issues.length
          ? `Đã đọc ${parsed.items.length} bài hợp lệ; phát hiện ${parsed.issues.length} lỗi cần xem lại.`
          : `Đã đọc ${parsed.items.length} bài học từ ${file.name}.`,
      );
    } catch {
      toast.error("Không thể đọc file. Hãy thử lại bằng Excel, CSV hoặc JSON hợp lệ.");
    } finally {
      setBusy(false);
    }
  };

  const executeImport = () => {
    if (incomingSubjects.length === 0) return;
    const next =
      importMode === "merge" ? mergeSubjects(currentSubjects, incomingSubjects) : incomingSubjects;
    const transaction = replaceRawValuesSafely(CUSTOM_SUBJECTS_BACKUP_KEY, [
      { key: CUSTOM_SUBJECTS_KEY, raw: JSON.stringify(next) },
    ]);
    if (!transaction.ok) {
      toast.error(
        transaction.rollbackError
          ? `${transaction.error} ${transaction.rollbackError}`
          : transaction.error,
      );
      return;
    }
    onSubjectsUpdated(next);
    const added = Math.max(0, lessonIds(next).size - lessonIds(currentSubjects).size);
    toast.success(
      importMode === "merge"
        ? `Đã gộp ${added} bài mới vào lộ trình.`
        : `Đã thay thế lộ trình bằng ${previewStats.lessons} bài.`,
    );
    setConfirmOpen(false);
    setPreview([]);
    setImportIssues([]);
    setSourceName("");
  };

  const applyGrade11 = (mode: ImportMode) => {
    if (currentSubjects.length > 0) {
      const action =
        mode === "merge"
          ? "gộp lộ trình lớp 11 vào dữ liệu hiện tại"
          : "thay thế toàn bộ lộ trình hiện tại bằng lộ trình lớp 11";
      if (!window.confirm(`Bạn có chắc muốn ${action}? Một snapshot hoàn tác sẽ được tạo trước.`))
        return;
    }
    const next = mode === "merge" ? mergeSubjects(currentSubjects, SUBJECTS) : SUBJECTS;
    const transaction = replaceRawValuesSafely(CUSTOM_SUBJECTS_BACKUP_KEY, [
      { key: CUSTOM_SUBJECTS_KEY, raw: JSON.stringify(next) },
    ]);
    if (!transaction.ok) {
      toast.error(transaction.error);
      return;
    }
    onSubjectsUpdated(next);
    toast.success(mode === "merge" ? "Đã gộp lộ trình lớp 11." : "Đã dùng lộ trình mẫu lớp 11.");
  };

  const downloadGrade11 = async (format: "xlsx" | "csv" | "json") => {
    const items = flattenSubjects(SUBJECTS);
    if (format === "xlsx") {
      const { downloadFullGrade11Excel } = await import("@/lib/excel-import-export");
      downloadFullGrade11Excel();
    } else if (format === "csv") {
      downloadFile("lo_trinh_mau_lop_11_KNTT.csv", toCsv(items), "text/csv;charset=utf-8");
    } else {
      downloadFile(
        "lo_trinh_mau_lop_11_KNTT.json",
        JSON.stringify(toPortableRows(items), null, 2),
        "application/json",
      );
    }
  };

  const downloadSimpleTemplate = async (format: "xlsx" | "csv" | "json") => {
    if (format === "xlsx") {
      const { downloadSampleExcel } = await import("@/lib/excel-import-export");
      downloadSampleExcel();
    } else if (format === "csv") {
      downloadFile(
        "mau_import_lo_trinh_don_gian.csv",
        SAMPLE_CSV_CONTENT,
        "text/csv;charset=utf-8",
      );
    } else {
      downloadFile("mau_import_lo_trinh_don_gian.json", SAMPLE_JSON_CONTENT, "application/json");
    }
  };

  const exportCurrent = (format: "csv" | "json") => {
    const items = flattenSubjects(currentSubjects);
    if (format === "csv")
      downloadFile("lo_trinh_hien_tai.csv", toCsv(items), "text/csv;charset=utf-8");
    else
      downloadFile(
        "lo_trinh_hien_tai.json",
        JSON.stringify(toPortableRows(items), null, 2),
        "application/json",
      );
  };

  const exportWholeApp = () => {
    const backup = createAppBackup(progress, currentSubjects, getStoredTimerState());
    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(
      `smart-planner-backup-${stamp}.json`,
      JSON.stringify(backup, null, 2),
      "application/json",
    );
  };

  const restoreWholeApp = () => {
    if (!backupRaw) return;
    const restored = restoreAppBackup(backupRaw);
    if (!restored.ok) {
      toast.error(restored.error);
      return;
    }
    toast.success("Đã khôi phục bản sao lưu. Ứng dụng sẽ tải lại.");
    window.setTimeout(() => window.location.reload(), 350);
  };

  const undoLastChange = () => {
    const result = restoreSnapshotFromKey(CUSTOM_SUBJECTS_BACKUP_KEY);
    if (!result.ok) toast.error(result.error);
    else {
      toast.success("Đã khôi phục lộ trình trước thay đổi gần nhất.");
      window.setTimeout(() => window.location.reload(), 350);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          id="roadmap-data-trigger-button"
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 rounded-2xl border-sky-200 bg-sky-50/70 text-xs font-semibold text-sky-800"
        >
          <Database className="h-4 w-4" />
          <span className="hidden sm:inline">Lộ trình & dữ liệu</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[92vh] w-[96vw] max-w-5xl overflow-hidden rounded-3xl p-0 grid-rows-[auto_minmax(0,1fr)]">
        <DialogHeader className="border-b bg-white px-5 py-4">
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <Database className="h-5 w-5 text-sky-700" /> Lộ trình & dữ liệu
          </DialogTitle>
          <DialogDescription>
            Dùng lộ trình có sẵn, nhập lộ trình riêng hoặc quản lý sao lưu. File mẫu import được
            tách khỏi lộ trình lớp 11.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
          <TabsList className="mx-4 mt-3 grid grid-cols-3 rounded-2xl bg-slate-100 p-1">
            <TabsTrigger value="available" className="rounded-xl text-xs">
              Lộ trình có sẵn
            </TabsTrigger>
            <TabsTrigger value="import" className="rounded-xl text-xs">
              Nhập lộ trình
            </TabsTrigger>
            <TabsTrigger value="backup" className="rounded-xl text-xs">
              Xuất & sao lưu
            </TabsTrigger>
          </TabsList>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            <TabsContent value="available" className="m-0 space-y-4">
              <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/70 p-5 shadow-xs">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-2xl">
                    📚
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-xl font-semibold text-slate-900">
                        Lộ trình mẫu lớp 11 KNTT
                      </h2>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-800">
                        Khuyên dùng
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Toán 11 · Vật lý 11 · Hóa học 11, đầy đủ chương/chủ đề và bài học. Có thể
                      chỉnh sửa sau khi áp dụng.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        className="rounded-2xl bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => applyGrade11(currentSubjects.length ? "merge" : "replace")}
                      >
                        <BookOpenCheck className="h-4 w-4" /> Dùng lộ trình mẫu lớp 11
                      </Button>
                      {currentSubjects.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-2xl"
                          onClick={() => applyGrade11("replace")}
                        >
                          Thay thế lộ trình hiện tại
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-5 border-t border-emerald-100 pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tải toàn bộ lộ trình
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <FormatButton
                      icon={FileSpreadsheet}
                      label="Excel"
                      onClick={() => void downloadGrade11("xlsx")}
                    />
                    <FormatButton
                      icon={FileText}
                      label="CSV"
                      onClick={() => void downloadGrade11("csv")}
                    />
                    <FormatButton
                      icon={FileJson}
                      label="JSON"
                      onClick={() => void downloadGrade11("json")}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border bg-white p-5 shadow-xs">
                <h3 className="font-semibold text-slate-900">Xem trước nội dung</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {SUBJECTS.map((subject) => {
                    const count = subject.milestones.reduce(
                      (sum, milestone) => sum + milestone.lessons.length,
                      0,
                    );
                    return (
                      <div key={subject.id} className="rounded-2xl border bg-slate-50 p-3">
                        <p className="font-semibold text-slate-900">
                          {subject.emoji} {subject.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {subject.milestones.length} chủ đề · {count} bài
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="import" className="m-0 space-y-4">
              <section
                className={cn(
                  "rounded-3xl border-2 border-dashed p-7 text-center transition",
                  busy
                    ? "border-slate-200 bg-slate-50"
                    : "border-sky-200 bg-sky-50/50 hover:border-sky-400",
                )}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const file = event.dataTransfer.files[0];
                  if (file) void readRoadmapFile(file);
                }}
              >
                <UploadCloud className="mx-auto h-10 w-10 text-sky-600" />
                <h2 className="mt-3 font-serif text-xl font-semibold text-slate-900">
                  Nhập lộ trình của bạn
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Kéo file vào đây hoặc chọn file từ máy.
                </p>
                <p className="mt-1 text-xs font-medium text-sky-700">Hỗ trợ .xlsx, .csv và .json</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.json"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void readRoadmapFile(file);
                    event.currentTarget.value = "";
                  }}
                />
                <Button
                  type="button"
                  className="mt-4 rounded-2xl"
                  disabled={busy}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FolderInput className="h-4 w-4" /> {busy ? "Đang đọc file…" : "Chọn file từ máy"}
                </Button>
              </section>

              <section className="rounded-3xl border bg-white p-5 shadow-xs">
                <h3 className="font-semibold text-slate-900">Chưa có file?</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Tải file mẫu import đơn giản. Excel có cùng dữ liệu minh họa như CSV và JSON,
                  không chứa toàn bộ chương trình lớp 11.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <FormatButton
                    icon={FileSpreadsheet}
                    label="Mẫu Excel"
                    onClick={() => void downloadSimpleTemplate("xlsx")}
                  />
                  <FormatButton
                    icon={FileText}
                    label="Mẫu CSV"
                    onClick={() => void downloadSimpleTemplate("csv")}
                  />
                  <FormatButton
                    icon={FileJson}
                    label="Mẫu JSON"
                    onClick={() => void downloadSimpleTemplate("json")}
                  />
                </div>
              </section>

              {preview.length > 0 && (
                <section className="rounded-3xl border border-indigo-200 bg-indigo-50/40 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-indigo-950">Preview: {sourceName}</h3>
                      <p className="text-xs text-indigo-700">Chưa có dữ liệu nào được áp dụng.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Stat label="Môn" value={previewStats.subjects} />
                      <Stat label="Bài hợp lệ" value={previewStats.lessons} />
                      <Stat label="ID trùng" value={previewStats.duplicates} />
                      <Stat label="Dòng lỗi" value={previewStats.invalid} />
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border bg-white">
                    <div className="max-h-64 overflow-auto">
                      {preview.slice(0, 10).map((item, index) => (
                        <div
                          key={`${item.subject}-${item.title}-${index}`}
                          className="grid gap-1 border-b px-3 py-2 text-xs last:border-b-0 sm:grid-cols-[120px_1fr_90px]"
                        >
                          <span className="font-semibold text-slate-700">{item.subject}</span>
                          <span className="min-w-0">
                            <strong>{item.title}</strong>
                            {item.topic ? (
                              <span className="block text-slate-500">{item.topic}</span>
                            ) : null}
                          </span>
                          <span className="text-slate-500">{item.estimatedMinutes ?? 45} phút</span>
                        </div>
                      ))}
                    </div>
                    {preview.length > 10 && (
                      <p className="border-t px-3 py-2 text-xs text-slate-500">
                        Còn {preview.length - 10} bài khác.
                      </p>
                    )}
                  </div>

                  {importIssues.length > 0 && (
                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs font-semibold text-amber-950">Các dòng cần kiểm tra</p>
                      <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto text-xs text-amber-900">
                        {importIssues.slice(0, 20).map((issue, index) => (
                          <li key={`${issue.row}-${index}`}>
                            Dòng {issue.row}: {issue.message}
                          </li>
                        ))}
                      </ul>
                      {importIssues.length > 20 && (
                        <p className="mt-2 text-xs text-amber-800">
                          Còn {importIssues.length - 20} lỗi khác.
                        </p>
                      )}
                    </div>
                  )}

                  <RadioGroup
                    value={importMode}
                    onValueChange={(value) => setImportMode(value as ImportMode)}
                    className="mt-4 grid gap-2 sm:grid-cols-2"
                  >
                    <ImportModeCard
                      value="merge"
                      title="Gộp với lộ trình hiện tại"
                      description="Giữ dữ liệu hiện có, bỏ qua bài trùng ID. Khuyến nghị."
                    />
                    <ImportModeCard
                      value="replace"
                      title="Thay thế lộ trình hiện tại"
                      description="Tạo snapshot rồi thay toàn bộ danh mục môn và bài."
                    />
                  </RadioGroup>

                  <Button
                    type="button"
                    className="mt-4 w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {importMode === "merge"
                      ? `Gộp ${Math.max(0, previewStats.lessons - previewStats.duplicates)} bài vào lộ trình`
                      : `Thay thế bằng ${previewStats.lessons} bài mới`}
                  </Button>
                </section>
              )}
            </TabsContent>

            <TabsContent value="backup" className="m-0 space-y-4">
              <section className="rounded-3xl border bg-white p-5 shadow-xs">
                <div className="flex items-start gap-3">
                  <Download className="mt-1 h-5 w-5 text-sky-700" />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-slate-900">Xuất lộ trình hiện tại</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Chỉ xuất môn, chủ đề và bài học; không gồm tiến độ hoặc Timer.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <FormatButton
                        icon={FileText}
                        label="Xuất CSV"
                        onClick={() => exportCurrent("csv")}
                      />
                      <FormatButton
                        icon={FileJson}
                        label="Xuất JSON"
                        onClick={() => exportCurrent("json")}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border bg-white p-5 shadow-xs">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-5 w-5 text-emerald-700" />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-slate-900">Sao lưu toàn bộ ứng dụng</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Bao gồm tiến độ, lộ trình, lịch sử, kho lưu trữ, trạng thái Timer và cài đặt
                      Pomodoro.
                    </p>
                    <Button
                      type="button"
                      className="mt-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700"
                      onClick={exportWholeApp}
                    >
                      <Download className="h-4 w-4" /> Tải bản sao lưu
                    </Button>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5">
                <div className="flex items-start gap-3">
                  <ArchiveRestore className="mt-1 h-5 w-5 text-amber-700" />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-amber-950">Khôi phục từ bản sao lưu</h2>
                    <p className="mt-1 text-sm text-amber-800">
                      Ứng dụng tạo snapshot trước khi ghi đè dữ liệu.
                    </p>
                    <input
                      type="file"
                      accept="application/json,.json"
                      className="mt-3 block w-full text-sm"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (file) setBackupRaw(await file.text());
                      }}
                    />
                    <Button
                      type="button"
                      className="mt-3 rounded-2xl"
                      disabled={!backupRaw}
                      onClick={restoreWholeApp}
                    >
                      Khôi phục bản sao lưu
                    </Button>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="font-semibold text-slate-900">Hoàn tác an toàn</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Thử khôi phục trạng thái trước lần import hoặc thay lộ trình gần nhất.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={undoLastChange}
                  >
                    <RotateCcw className="h-4 w-4" /> Hoàn tác lộ trình
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      const result = restoreLastImportRollback();
                      if (!result.ok) toast.error(result.error);
                      else window.location.reload();
                    }}
                  >
                    Hoàn tác khôi phục toàn ứng dụng
                  </Button>
                </div>
              </section>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {importMode === "merge" ? "Gộp lộ trình?" : "Thay thế lộ trình?"}
            </DialogTitle>
            <DialogDescription>
              {importMode === "merge"
                ? `${Math.max(0, previewStats.lessons - previewStats.duplicates)} bài mới sẽ được thêm; ${previewStats.duplicates} bài trùng ID được bỏ qua.`
                : `${currentSubjects.length} môn hiện tại sẽ được thay bằng ${previewStats.subjects} môn và ${previewStats.lessons} bài. Snapshot rollback sẽ được tạo trước.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
              Hủy
            </Button>
            <Button type="button" className="rounded-xl" onClick={executeImport}>
              {importMode === "merge" ? "Gộp vào lộ trình" : "Thay thế lộ trình"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

function FormatButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof FileText;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={onClick}>
      <Icon className="h-4 w-4" /> {label}
    </Button>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full border bg-white px-2.5 py-1 font-semibold text-slate-700">
      {label}: {value}
    </span>
  );
}

function ImportModeCard({
  value,
  title,
  description,
}: {
  value: ImportMode;
  title: string;
  description: string;
}) {
  return (
    <Label
      htmlFor={`import-${value}`}
      className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-white p-3"
    >
      <RadioGroupItem id={`import-${value}`} value={value} className="mt-0.5" />
      <span>
        <span className="block text-sm font-semibold text-slate-900">{title}</span>
        <span className="block text-xs leading-relaxed text-slate-500">{description}</span>
      </span>
    </Label>
  );
}
