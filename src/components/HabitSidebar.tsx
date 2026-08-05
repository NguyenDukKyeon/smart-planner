import { useMemo, useState } from "react";
import {
  Archive,
  Book,
  Check,
  Circle,
  Droplet,
  Footprints,
  Minus,
  Moon,
  Pencil,
  Plus,
  Settings2,
  Sparkles,
  Target,
  Trash2,
  Undo2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { HabitColor, HabitDef, HabitIcon } from "@/lib/mock-data";
import type { HabitEntry } from "@/lib/progress-store";
import { addDaysISO, todayISO } from "@/lib/date-utils";
import { DuotoneIcon } from "./DuotoneIcon";
import { cn } from "@/lib/utils";
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

const ICONS: Record<HabitIcon, LucideIcon> = {
  water: Droplet,
  book: Book,
  run: Footprints,
  sleep: Moon,
  meditate: Sparkles,
  study: Target,
};
const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

type EditableHabit = Omit<HabitDef, "id"> & { id?: string };

type Props = {
  entry: HabitEntry;
  streak: number;
  weekLog: (HabitEntry | undefined)[];
  definitions: HabitDef[];
  onUpdate: (patch: HabitEntry) => void;
  onSaveDefinition: (definition: EditableHabit) => void;
  onArchiveHabit: (habitId: string, archived: boolean) => void;
  onDeleteHabit: (habitId: string) => void;
};

export function HabitSidebar({
  entry,
  streak,
  weekLog,
  definitions,
  onUpdate,
  onSaveDefinition,
  onArchiveHabit,
  onDeleteHabit,
}: Props) {
  const [managerOpen, setManagerOpen] = useState(false);
  const active = definitions.filter((habit) => !habit.archived);
  const today = todayISO();
  const done = active.filter((habit) => isHabitDone(habit, entry, today)).length;
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDaysISO(today, index - 6)),
    [today],
  );

  return (
    <aside className="flex flex-col gap-4">
      <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm border border-slate-200/80">
        <div className="mb-4 flex flex-col gap-3 pb-3.5 border-b border-slate-100">
          {/* Hàng 1: Tiêu đề + Badge tiến độ + Nút cài đặt */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900">Thói quen</h2>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 border border-emerald-200/60">
                {done}/{active.length} hôm nay
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 shrink-0"
              onClick={() => setManagerOpen(true)}
              aria-label="Quản lý thói quen"
              title="Quản lý thói quen"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Hàng 2: Chuỗi thói quen */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-900 bg-amber-50/90 border border-amber-200/80 px-3 py-1.5 rounded-xl w-fit shadow-2xs">
            <span>🔥 Chuỗi thói quen:</span>
            <strong className="font-bold text-orange-600">{streak} ngày liên tiếp</strong>
          </div>

          {/* Hàng 3: Bảng 7 ô 7 ngày căn đều 1 hàng ngang */}
          <div className="pt-1">
            <div className="mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              7 ngày gần nhất
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center w-full">
              {weekLog.map((dayEntry, index) => {
                const dateISO = weekDates[index];
                const dayLabel = getDayLabel(dateISO);
                const available = active.filter((habit) => targetOnDate(habit, dateISO) > 0);
                const score = available.filter((habit) =>
                  isHabitDone(habit, dayEntry, dateISO),
                ).length;
                const isAllDone = available.length > 0 && score === available.length;
                const isPartial = score > 0 && !isAllDone;
                const isToday = dateISO === today;

                return (
                  <div key={dateISO} className="flex flex-col items-center gap-1">
                    <span
                      className={cn(
                        "text-[10px] font-semibold leading-none",
                        isToday ? "text-orange-600 font-bold" : "text-slate-400",
                      )}
                    >
                      {dayLabel}
                    </span>
                    <div
                      title={`${dayLabel} (${dateISO}): ${score}/${available.length} thói quen hoàn thành`}
                      className={cn(
                        "flex h-8 w-full max-w-[36px] items-center justify-center rounded-xl text-[11px] font-bold transition-all mx-auto",
                        isAllDone &&
                          "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-2xs",
                        isPartial && "bg-amber-100 border border-amber-300 text-amber-800",
                        !isAllDone &&
                          !isPartial &&
                          "bg-slate-100/90 text-slate-400 border border-slate-200/60",
                        isToday && "ring-2 ring-orange-400 ring-offset-1",
                      )}
                    >
                      {isAllDone ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : score > 0 ? (
                        <span>{score}</span>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {active.length === 0 ? (
          <button
            onClick={() => setManagerOpen(true)}
            className="w-full rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground hover:bg-slate-50/50"
          >
            Chưa có thói quen đang hoạt động. Nhấn để thêm.
          </button>
        ) : (
          <ul className="grid gap-2.5">
            {active.map((habit) => (
              <HabitRow
                key={habit.id}
                definition={habit}
                icon={ICONS[habit.icon]}
                entry={entry}
                dateISO={today}
                onUpdate={onUpdate}
              />
            ))}
          </ul>
        )}
      </div>

      <HabitManager
        open={managerOpen}
        onOpenChange={setManagerOpen}
        definitions={definitions}
        onSave={onSaveDefinition}
        onArchive={onArchiveHabit}
        onDelete={onDeleteHabit}
      />
    </aside>
  );
}

function HabitRow({
  definition,
  icon,
  entry,
  dateISO,
  onUpdate,
}: {
  definition: HabitDef;
  icon: LucideIcon;
  entry: HabitEntry;
  dateISO: string;
  onUpdate: (patch: HabitEntry) => void;
}) {
  const target = targetOnDate(definition, dateISO);
  const disabledToday = target <= 0;
  const rawValue = entry[definition.id];
  const numericValue = typeof rawValue === "number" ? rawValue : 0;
  const checked = rawValue === true;
  const isDone = isHabitDone(definition, entry, dateISO);

  if (definition.kind === "counter") {
    const percentage = target > 0 ? Math.min(1, numericValue / target) : 0;
    return (
      <li
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 p-3 transition-all",
          isDone ? "border-emerald-200 bg-white shadow-soft" : "border-transparent bg-white/70",
          disabledToday && "opacity-50",
        )}
      >
        <div
          className="absolute inset-y-0 left-0 bg-sky-100/70 transition-all"
          style={{ width: `${percentage * 100}%` }}
        />
        <div className="relative flex items-center gap-3">
          <DuotoneIcon icon={icon} tone={definition.color} active={numericValue > 0} size={22} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">{definition.name}</div>
            <div className="text-[11px] text-muted-foreground">
              {disabledToday ? "Không đặt mục tiêu hôm nay" : `${numericValue}/${target}`}
            </div>
          </div>
          {!disabledToday && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdate({ [definition.id]: Math.max(0, numericValue - 1) })}
                className="grid h-8 w-8 place-items-center rounded-xl bg-white text-muted-foreground shadow-soft"
                aria-label={`Giảm ${definition.name}`}
              >
                <Minus size={14} />
              </button>
              <button
                onClick={() => onUpdate({ [definition.id]: numericValue + 1 })}
                className="grid h-8 w-8 place-items-center rounded-xl bg-sky-500 text-white shadow-soft"
                aria-label={`Tăng ${definition.name}`}
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </li>
    );
  }

  return (
    <li>
      <button
        disabled={disabledToday}
        onClick={() => onUpdate({ [definition.id]: !checked })}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all hover:-translate-y-0.5",
          isDone ? "border-emerald-200 bg-white shadow-soft" : "border-transparent bg-white/70",
          disabledToday && "cursor-not-allowed opacity-50 hover:translate-y-0",
        )}
      >
        <DuotoneIcon icon={icon} tone={definition.color} active={isDone} size={22} />
        <div className="min-w-0 flex-1">
          <div className={cn("text-sm font-medium", isDone && "text-muted-foreground")}>
            {definition.name}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {disabledToday
              ? "Không đặt mục tiêu hôm nay"
              : isDone
                ? "Đã hoàn thành"
                : "Nhấn để đánh dấu"}
          </div>
        </div>
        <span
          className={cn(
            "grid h-7 w-7 place-items-center rounded-full border-2 transition-all",
            isDone
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-slate-300 bg-transparent text-transparent",
          )}
          aria-hidden="true"
        >
          {isDone ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3 opacity-0" />}
        </span>
      </button>
    </li>
  );
}

function HabitManager({
  open,
  onOpenChange,
  definitions,
  onSave,
  onArchive,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  definitions: HabitDef[];
  onSave: (habit: EditableHabit) => void;
  onArchive: (habitId: string, archived: boolean) => void;
  onDelete: (habitId: string) => void;
}) {
  const emptyForm = (): EditableHabit => ({
    name: "",
    icon: "study",
    color: "green",
    kind: "toggle",
    target: 1,
    archived: false,
    dailyTargets: [1, 1, 1, 1, 1, 1, 1],
  });
  const [form, setForm] = useState<EditableHabit>(emptyForm);
  const [nameError, setNameError] = useState("");

  const edit = (habit: HabitDef) => {
    setForm({ ...habit, dailyTargets: [...habit.dailyTargets] as HabitDef["dailyTargets"] });
  };
  const submit = () => {
    if (!form.name.trim()) {
      setNameError("Vui lòng nhập tên thói quen.");
      return;
    }
    onSave({
      ...form,
      name: form.name.trim(),
      target: Math.max(1, form.target),
      dailyTargets: form.dailyTargets.map((value) =>
        Math.max(0, Math.round(value)),
      ) as HabitDef["dailyTargets"],
    });
    setForm(emptyForm());
    setNameError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>Quản lý thói quen</DialogTitle>
          <DialogDescription>
            Thêm, sửa, tạm ẩn hoặc xóa định nghĩa. Nhật ký đã ghi theo ID vẫn được giữ nguyên.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 rounded-2xl border bg-slate-50 p-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Tên thói quen</Label>
            <Input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Ví dụ: Học từ vựng"
              aria-label="Tên thói quen"
              aria-invalid={!!nameError}
              aria-describedby="habit-name-error"
            />
            <p id="habit-name-error" className="text-xs text-destructive" role="alert">
              {nameError}
            </p>
          </div>
          <div className="space-y-1">
            <Label>Loại</Label>
            <select
              aria-label="Loại thói quen"
              value={form.kind}
              onChange={(event) => {
                const kind = event.target.value as HabitDef["kind"];
                setForm((current) => ({
                  ...current,
                  kind,
                  target: kind === "toggle" ? 1 : Math.max(1, current.target),
                  dailyTargets:
                    kind === "toggle"
                      ? (current.dailyTargets.map((value) =>
                          value > 0 ? 1 : 0,
                        ) as HabitDef["dailyTargets"])
                      : current.dailyTargets,
                }));
              }}
              className="h-10 w-full rounded-md border bg-white px-3 text-sm"
            >
              <option value="toggle">Đánh dấu hoàn thành</option>
              <option value="counter">Bộ đếm</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Biểu tượng</Label>
            <select
              aria-label="Biểu tượng thói quen"
              value={form.icon}
              onChange={(event) =>
                setForm((current) => ({ ...current, icon: event.target.value as HabitIcon }))
              }
              className="h-10 w-full rounded-md border bg-white px-3 text-sm"
            >
              <option value="study">Học tập</option>
              <option value="book">Đọc sách</option>
              <option value="water">Nước</option>
              <option value="run">Vận động</option>
              <option value="sleep">Giấc ngủ</option>
              <option value="meditate">Thư giãn</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Màu</Label>
            <select
              aria-label="Màu thói quen"
              value={form.color}
              onChange={(event) =>
                setForm((current) => ({ ...current, color: event.target.value as HabitColor }))
              }
              className="h-10 w-full rounded-md border bg-white px-3 text-sm"
            >
              <option value="green">Xanh lá</option>
              <option value="blue">Xanh dương</option>
              <option value="amber">Vàng</option>
              <option value="coral">Đỏ san hô</option>
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Mục tiêu từng ngày (0 = không áp dụng)</Label>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEKDAYS.map((label, index) => (
                <label key={label} className="text-center text-[11px] text-muted-foreground">
                  {label}
                  {form.kind === "toggle" ? (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((current) => {
                          const next = [...current.dailyTargets] as HabitDef["dailyTargets"];
                          next[index] = next[index] > 0 ? 0 : 1;
                          return { ...current, dailyTargets: next };
                        })
                      }
                      className={cn(
                        "mt-1 h-9 w-full rounded-lg border font-semibold",
                        form.dailyTargets[index] > 0
                          ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                          : "bg-white text-slate-400",
                      )}
                    >
                      {form.dailyTargets[index] > 0 ? "Có" : "—"}
                    </button>
                  ) : (
                    <Input
                      type="number"
                      aria-label={`Mục tiêu ${label}`}
                      min={0}
                      max={999}
                      className="mt-1 px-1 text-center"
                      value={form.dailyTargets[index]}
                      onChange={(event) =>
                        setForm((current) => {
                          const next = [...current.dailyTargets] as HabitDef["dailyTargets"];
                          next[index] = Math.max(0, Number(event.target.value) || 0);
                          return {
                            ...current,
                            dailyTargets: next,
                            target: Math.max(1, next[index]),
                          };
                        })
                      }
                    />
                  )}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            {form.id && (
              <Button variant="ghost" onClick={() => setForm(emptyForm())}>
                Hủy sửa
              </Button>
            )}
            <Button onClick={submit}>
              {form.id ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {form.id ? "Lưu thay đổi" : "Thêm thói quen"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {definitions.map((habit) => (
            <div
              key={habit.id}
              className={cn(
                "flex items-center gap-2 rounded-xl border bg-white p-3",
                habit.archived && "opacity-60",
              )}
            >
              <DuotoneIcon icon={ICONS[habit.icon]} tone={habit.color} size={20} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{habit.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {habit.kind === "counter" ? "Bộ đếm" : "Đánh dấu"} ·{" "}
                  {habit.dailyTargets.filter((target) => target > 0).length}/7 ngày
                </div>
              </div>
              {!habit.archived && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => edit(habit)}
                  title="Sửa"
                  aria-label={`Sửa thói quen ${habit.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onArchive(habit.id, !habit.archived)}
                title={habit.archived ? "Hiện lại" : "Tạm ẩn"}
                aria-label={
                  habit.archived
                    ? `Hiện lại thói quen ${habit.name}`
                    : `Tạm ẩn thói quen ${habit.name}`
                }
              >
                {habit.archived ? <Undo2 className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              </Button>
              {habit.archived && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-rose-600"
                  onClick={() => {
                    if (
                      window.confirm(`Xóa định nghĩa "${habit.name}"? Nhật ký cũ vẫn được giữ.`)
                    ) {
                      onDelete(habit.id);
                    }
                  }}
                  title="Xóa định nghĩa"
                  aria-label={`Xóa định nghĩa thói quen ${habit.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getDayLabel(dateISO: string): string {
  const day = new Date(`${dateISO}T12:00:00`).getDay();
  const labels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return labels[day];
}

function targetOnDate(habit: HabitDef, dateISO: string): number {
  const day = new Date(`${dateISO}T12:00:00`).getDay();
  return habit.dailyTargets[(day + 6) % 7] ?? habit.target;
}

function isHabitDone(habit: HabitDef, entry: HabitEntry | undefined, dateISO: string): boolean {
  if (!entry) return false;
  const target = targetOnDate(habit, dateISO);
  if (target <= 0) return false;
  const value = entry[habit.id];
  return habit.kind === "counter" ? typeof value === "number" && value >= target : value === true;
}
