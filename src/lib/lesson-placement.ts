import { isDateISO } from "./date-utils";
import type { Lesson, LessonPlacementProvenance } from "./mock-data";

export type LessonPlacementReasonKind =
  | "fixed-today"
  | "manual-move"
  | "carried-from-earlier-date"
  | "next-in-roadmap"
  | "review-due";

export type ManualMoveDetail = LessonPlacementProvenance;

export type LessonPlacementReason = {
  kind: LessonPlacementReasonKind;
  label: string;
  description: string;
  manualMove?: ManualMoveDetail;
  reviewAgeDays?: number;
};

export function sanitizeLessonPlacementProvenance(
  value: unknown,
): LessonPlacementProvenance | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const raw = value as Record<string, unknown>;
  if (raw.kind !== "manual-move") return undefined;
  if (!isDateISO(raw.fromDateISO) || !isDateISO(raw.toDateISO)) return undefined;
  if (raw.fromDateISO === raw.toDateISO) return undefined;
  if (typeof raw.movedAt !== "string" || Number.isNaN(Date.parse(raw.movedAt))) {
    return undefined;
  }
  return {
    kind: "manual-move",
    movedAt: raw.movedAt,
    fromDateISO: raw.fromDateISO,
    toDateISO: raw.toDateISO,
  };
}

export function deriveLessonPlacementReason(params: {
  lesson: Lesson;
  assignedDateISO: string;
}): LessonPlacementReason {
  const manualMove = sanitizeLessonPlacementProvenance(params.lesson.placementProvenance);

  if (
    params.lesson.scheduleMode === "fixed" &&
    params.lesson.scheduledDate === params.assignedDateISO
  ) {
    return {
      kind: "fixed-today",
      label: "Cố định hôm nay",
      description: "Bài cố định đã được đặt vào lịch hôm nay.",
      ...(manualMove ? { manualMove } : {}),
    };
  }

  if (manualMove?.toDateISO === params.assignedDateISO) {
    return {
      kind: "manual-move",
      label: "Đã chuyển thủ công",
      description: "Bạn đã chuyển bài sang ngày này.",
      manualMove,
    };
  }

  if (
    (params.lesson.scheduleMode ?? "flexible") === "flexible" &&
    isDateISO(params.lesson.scheduledDate) &&
    isDateISO(params.assignedDateISO) &&
    params.assignedDateISO > params.lesson.scheduledDate
  ) {
    return {
      kind: "carried-from-earlier-date",
      label: "Dời vì ngày trước đầy",
      description:
        "Ngày đủ điều kiện trước đó không còn đủ công suất nên bài được chuyển sang hôm nay.",
      ...(manualMove ? { manualMove } : {}),
    };
  }

  return {
    kind: "next-in-roadmap",
    label: "Tiếp theo trong lộ trình",
    description: "Đây là bài tiếp theo chưa hoàn thành trong thứ tự học hiện tại.",
  };
}

export function deriveReviewPlacementReason(params: {
  ageDays: number;
}): LessonPlacementReason {
  return {
    kind: "review-due",
    label: `Ôn sau ${params.ageDays} ngày`,
    description: `Bài đến lượt ôn theo mốc nhắc sau ${params.ageDays} ngày.`,
    reviewAgeDays: params.ageDays,
  };
}
