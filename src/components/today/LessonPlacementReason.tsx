import { useId, useState } from "react";
import type {
  LessonPlacementReason as PlacementReason,
  ManualMoveDetail as ManualMoveProvenance,
} from "@/lib/lesson-placement";
import { cn } from "@/lib/utils";

const tone: Record<PlacementReason["kind"], string> = {
  "fixed-today": "border-violet-200 bg-violet-50 text-violet-700",
  "manual-move": "border-amber-200 bg-amber-50 text-amber-700",
  "carried-from-earlier-date": "border-orange-200 bg-orange-50 text-orange-700",
  "next-in-roadmap": "border-sky-200 bg-sky-50 text-sky-700",
  "review-due": "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function formatDateISO(value: string): string {
  try {
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return value;
  }
}

function formatMovedAt(value: string): string {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return value;
  }
}

function ManualMoveDetail({ provenance }: { provenance: ManualMoveProvenance }) {
  return (
    <div className="mt-2 space-y-1 border-t border-slate-200 pt-2 text-[11px] text-slate-600">
      <p>
        Từ {formatDateISO(provenance.fromDateISO)} → {formatDateISO(provenance.toDateISO)}
      </p>
      <p>Chuyển lúc {formatMovedAt(provenance.movedAt)}</p>
    </div>
  );
}

export function LessonPlacementReason({ reason }: { reason: PlacementReason }) {
  const [open, setOpen] = useState(false);
  const detailId = useId();

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span
          data-placement-reason-badge
          className={cn(
            "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
            tone[reason.kind],
          )}
        >
          {reason.label}
        </span>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailId}
          onClick={() => setOpen((value) => !value)}
          className="min-h-8 rounded-lg px-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          {open ? "Ẩn chi tiết" : "Chi tiết"}
        </button>
      </div>
      {open && (
        <div
          id={detailId}
          className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700"
        >
          <p className="font-semibold text-slate-900">Tại sao bài này xuất hiện?</p>
          <p className="mt-1">{reason.description}</p>
          {reason.manualMove && <ManualMoveDetail provenance={reason.manualMove} />}
        </div>
      )}
    </div>
  );
}
