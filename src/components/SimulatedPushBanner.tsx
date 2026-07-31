import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Flame,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  AlertTriangle,
  Zap,
} from "lucide-react";
import {
  type PushNotificationPayload,
  recordPushAction,
  playPushNotificationChime,
  getPushPreferences,
} from "@/lib/push-notification-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  notification: PushNotificationPayload | null;
  onDismiss: () => void;
  onStartFocus?: (lessonId?: string, lessonTitle?: string, xp?: number) => void;
  onCompleteLesson?: (lessonId: string, xp: number) => void;
};

export function SimulatedPushBanner({
  notification,
  onDismiss,
  onStartFocus,
  onCompleteLesson,
}: Props) {
  const [soundMuted, setSoundMuted] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!notification) return;

    setClosing(false);
    const prefs = getPushPreferences();

    if (prefs.soundEnabled && !soundMuted) {
      playPushNotificationChime(notification.urgent, prefs.volume);
    }
  }, [notification, soundMuted]);

  if (!notification) return null;

  const handleClose = (recordDismiss = true) => {
    setClosing(true);
    if (recordDismiss) recordPushAction(notification.id, "DISMISSED");
    setTimeout(() => {
      onDismiss();
    }, 200);
  };

  const handleStartFocus = () => {
    if (!notification.lessonId || !notification.lessonTitle) {
      toast.error("Thông báo này không có bài học để bắt đầu.");
      handleClose(false);
      return;
    }
    recordPushAction(notification.id, "FOCUS_STARTED");
    toast.success("🚀 Đã mở không gian tập trung.", { description: notification.lessonTitle });
    if (onStartFocus) {
      onStartFocus(notification.lessonId, notification.lessonTitle, notification.xp);
    }
    handleClose(false);
  };

  const handleDismissForLater = () => {
    recordPushAction(notification.id, "DISMISSED");
    toast.info("Đã đóng thông báo.");
    handleClose(false);
  };

  const handleComplete = () => {
    if (!notification.lessonId || typeof notification.xp !== "number" || !onCompleteLesson) {
      toast.error("Thông báo này không có bài học hợp lệ để hoàn thành.");
      handleClose(false);
      return;
    }
    recordPushAction(notification.id, "COMPLETED");
    onCompleteLesson(notification.lessonId, notification.xp);
    toast.success("Đã đánh dấu bài học hoàn thành.");
    handleClose(false);
  };

  return (
    <div
      id="simulated-push-banner-overlay"
      className={cn(
        "fixed top-4 right-4 left-4 sm:left-auto sm:w-[420px] z-[9999] transition-all duration-300 ease-out transform",
        closing ? "opacity-0 -translate-y-4 scale-95" : "opacity-100 translate-y-0 scale-100",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border p-4 shadow-2xl backdrop-blur-xl transition-all",
          notification.urgent
            ? "border-amber-300/80 bg-slate-900/95 text-white ring-2 ring-amber-400/40 shadow-amber-900/20"
            : "border-slate-200/80 bg-slate-900/95 text-white ring-1 ring-sky-400/30 shadow-sky-900/20",
        )}
      >
        {/* Glow effect */}
        <div
          className={cn(
            "absolute -top-12 -right-12 h-32 w-32 rounded-full blur-2xl pointer-events-none",
            notification.urgent ? "bg-amber-500/25" : "bg-sky-500/25",
          )}
        />

        {/* Top Header Bar (OS Style) */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-emerald-400 text-slate-950 font-bold text-xs shadow-xs">
              🎓
            </div>
            <span className="font-semibold tracking-wide text-slate-200">
              Mô phỏng thông báo trong ứng dụng
            </span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300 font-mono">
              {notification.timestamp || "Vừa xong"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              title={soundMuted ? "Bật âm thanh" : "Tắt âm thanh"}
              className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              {soundMuted ? (
                <VolumeX className="h-3.5 w-3.5" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() => handleClose()}
              className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Notification Main Body */}
        <div className="mt-3 space-y-2">
          <div className="flex items-start gap-2.5">
            <div
              className={cn(
                "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl font-bold shadow-soft",
                notification.urgent ? "bg-amber-400 text-slate-950" : "bg-sky-400 text-slate-950",
              )}
            >
              {notification.type === "STREAK_GUARD" ? (
                <Flame className="h-4 w-4" />
              ) : notification.type === "DEADLINE_ALERT" ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4
                className={cn(
                  "font-bold text-sm tracking-tight leading-tight",
                  notification.urgent ? "text-amber-300" : "text-sky-300",
                )}
              >
                {notification.title}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-200 font-normal">
                {notification.body}
              </p>
            </div>
          </div>

          {/* Lesson Metadata Pills */}
          {(notification.subjectName || notification.plannedMinutes) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              {notification.subjectName && (
                <span className="rounded-md bg-white/10 px-2 py-0.5 font-medium text-slate-200 border border-white/10">
                  📚 Môn: {notification.subjectName}
                </span>
              )}
              {notification.topic && (
                <span className="rounded-md bg-purple-500/20 px-2 py-0.5 font-medium text-purple-200 border border-purple-400/20">
                  📌 {notification.topic}
                </span>
              )}
              {notification.plannedMinutes && (
                <span className="rounded-md bg-sky-500/20 px-2 py-0.5 font-medium text-sky-200 border border-sky-400/20">
                  ⏱️ {notification.plannedMinutes} phút
                </span>
              )}
              {notification.xp && (
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 font-semibold text-emerald-300 border border-emerald-400/20">
                  ⚡ +{notification.xp} XP
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Bar */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
          <button
            onClick={handleStartFocus}
            className="col-span-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-emerald-400 px-3 py-2 text-xs font-bold text-slate-950 shadow-soft transition hover:brightness-110 active:scale-95"
          >
            <Play className="h-3.5 w-3.5 fill-slate-950" /> Học ngay
          </button>

          <button
            onClick={handleDismissForLater}
            className="flex items-center justify-center gap-1 rounded-xl bg-white/10 border border-white/10 px-2.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/20 active:scale-95"
          >
            Để sau
          </button>

          <button
            onClick={handleComplete}
            className="flex items-center justify-center gap-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/30 active:scale-95"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Đã xong
          </button>
        </div>
      </div>
    </div>
  );
}
