import { isDateISO } from "./date-utils";
import type { LessonPlacementProvenance } from "./mock-data";

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
