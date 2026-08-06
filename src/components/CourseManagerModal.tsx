import type { ReactNode } from "react";
import type { Subject } from "@/lib/mock-data";
import type { PlannerSettings } from "@/lib/planner";
import type { ProgressState } from "@/lib/progress-store";
import type { CatalogUpdateOptions, CatalogUpdateResult } from "@/lib/custom-subjects";
import type { ScheduleTransactionController } from "@/components/schedule/useScheduleTransactions";
import { CourseManagerModal as CourseManagerModalContent } from "./CourseManagerModalContent";

type Props = {
  currentSubjects: Subject[];
  onSubjectsUpdated: (
    subjects: Subject[],
    options?: CatalogUpdateOptions,
  ) => CatalogUpdateResult | boolean | void;
  plannerSettings: PlannerSettings;
  scheduleTransactions: ScheduleTransactionController;
  progress?: ProgressState;
  activeTimerLessonId?: string | null;
  trigger?: ReactNode;
};

export function CourseManagerModal({
  plannerSettings,
  scheduleTransactions,
  ...contentProps
}: Props) {
  void plannerSettings;
  void scheduleTransactions;
  return <CourseManagerModalContent {...contentProps} />;
}
