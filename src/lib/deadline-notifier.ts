import { toast } from "sonner";
import { addDaysISO, displayDate, todayISO } from "./date-utils";
import type { Subject, Lesson } from "./mock-data";
import type { PushPreferences } from "./push-notification-store";

export interface ApproachingDeadlineLesson {
  lesson: Lesson;
  subjectName: string;
  effectiveDate: string;
  isToday: boolean;
  isTomorrow: boolean;
  isOverdue: boolean;
}

export type DeadlineNotificationOptions = {
  onboardingComplete: boolean;
  preferences: Pick<PushPreferences, "enabled">;
};

/** Automatic deadline alerts require completed onboarding and a saved opt-in. */
export function canAutoNotifyDeadlines({
  onboardingComplete,
  preferences,
}: DeadlineNotificationOptions): boolean {
  return onboardingComplete && preferences.enabled;
}

export function getApproachingDeadlineLessons(
  subjects: Subject[],
  completedLessons: Record<string, string>,
  shiftedDates: Record<string, string> = {},
  referenceISO = todayISO(),
): ApproachingDeadlineLesson[] {
  const todayStr = referenceISO;
  const tomorrowStr = addDaysISO(todayStr, 1);
  const results: ApproachingDeadlineLesson[] = [];

  for (const subject of subjects) {
    for (const milestone of subject.milestones) {
      for (const lesson of milestone.lessons) {
        if (completedLessons[lesson.id]) continue;
        const effectiveDate = shiftedDates[lesson.id] ?? lesson.scheduledDate;
        if (!effectiveDate) continue;

        const isToday = effectiveDate === todayStr;
        const isTomorrow = effectiveDate === tomorrowStr;
        const isOverdue = effectiveDate < todayStr;

        if (isToday || isTomorrow || isOverdue) {
          results.push({
            lesson,
            subjectName: subject.name,
            effectiveDate,
            isToday,
            isTomorrow,
            isOverdue,
          });
        }
      }
    }
  }

  // Sort by urgency: overdue -> today -> tomorrow
  return results.sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
}

export function notifyApproachingDeadlines(
  approaching: ApproachingDeadlineLesson[],
  forceToast = false,
) {
  if (approaching.length === 0) {
    if (forceToast) {
      toast.success(
        "🎉 Tất cả các bài học đều đúng tiến độ! Không có hạn chót nào cần hoàn thành trong 24 giờ tới.",
      );
    }
    return;
  }

  const overdueList = approaching.filter((item) => item.isOverdue);
  const todayList = approaching.filter((item) => item.isToday);
  const tomorrowList = approaching.filter((item) => item.isTomorrow);

  const urgentCount = overdueList.length + todayList.length;

  let title = "⏰ Cảnh báo hạn chót bài học (< 24 giờ)";
  let description = "";

  if (urgentCount > 0) {
    const sampleTitles = [...overdueList, ...todayList]
      .slice(0, 2)
      .map((i) => `"${i.lesson.title}" (${i.subjectName})`)
      .join(", ");

    description = `Bạn có ${urgentCount} bài học tới hạn trong 24h tới (${sampleTitles}${
      urgentCount > 2 ? "..." : ""
    }). Hãy tranh thủ học ngay!`;
  } else if (tomorrowList.length > 0) {
    title = "⏳ Cảnh báo sắp tới hạn chót (Ngày mai)";
    const sampleTitles = tomorrowList
      .slice(0, 2)
      .map((i) => `"${i.lesson.title}" (${i.subjectName})`)
      .join(", ");

    description = `Có ${tomorrowList.length} bài học có hạn chót ngày mai (${sampleTitles}${
      tomorrowList.length > 2 ? "..." : ""
    }). Chuẩn bị ôn tập nhé!`;
  }

  // 1. In-App Toast Notification via sonner
  toast.warning(title, {
    description,
    duration: 10000,
    action: {
      label: "Xem chi tiết",
      onClick: () => {
        const el =
          document.getElementById("today-panel-root") ||
          document.getElementById("reminders-card-root");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      },
    },
  });

  // 2. Browser Web Notification API
  if (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    try {
      new Notification(title, {
        body: description,
        tag: `deadline-warning-${todayISO()}`,
      });
    } catch {
      // Ignore notification API errors in restricted environments
    }
  }
}

export function autoCheckAndNotifyDeadlines(
  subjects: Subject[],
  completedLessons: Record<string, string>,
  shiftedDates: Record<string, string> = {},
  options: DeadlineNotificationOptions,
) {
  if (typeof window === "undefined") return;
  if (!canAutoNotifyDeadlines(options)) return;

  const todayStr = todayISO();
  const sessionKey = `deadline_notified_${todayStr}`;

  // If already notified in this session, skip auto toast unless user forces it
  if (sessionStorage.getItem(sessionKey)) return;

  const approaching = getApproachingDeadlineLessons(
    subjects,
    completedLessons,
    shiftedDates,
    todayStr,
  );

  if (approaching.length > 0) {
    sessionStorage.setItem(sessionKey, "true");
    // Delay toast slightly on page load so UI initializes smoothly
    setTimeout(() => {
      notifyApproachingDeadlines(approaching, false);
    }, 1200);
  }
}
