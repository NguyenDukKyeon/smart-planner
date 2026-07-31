import { createFileRoute } from "@tanstack/react-router";
import {
  cancelQstashMessages,
  isQstashConfigured,
  scheduleQstashPushes,
} from "@/lib/server/qstash-push-scheduler";
import { guardPushMutation } from "@/lib/server/push-request-guard";
import {
  isPushSubscriptionJson,
  sanitizeScheduledJobs,
  type SchedulePushRequest,
  type SchedulePushResponse,
} from "@/lib/web-push-shared";

export const Route = createFileRoute("/api/push/schedule")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const blocked = guardPushMutation(request, { scope: "push-schedule", limit: 12 });
        if (blocked) return blocked;
        try {
          const body = (await request.json()) as Partial<SchedulePushRequest>;
          if (!isPushSubscriptionJson(body.subscription)) {
            return Response.json({ error: "Push subscription không hợp lệ." }, { status: 400 });
          }
          const jobs = sanitizeScheduledJobs(body.jobs);
          const previousMessageIds = Array.isArray(body.previousMessageIds)
            ? body.previousMessageIds
                .filter((id): id is string => typeof id === "string")
                .slice(0, 100)
            : [];
          const cancelled = await cancelQstashMessages(previousMessageIds);
          const scheduled = await scheduleQstashPushes({
            request,
            subscription: body.subscription,
            jobs,
          });
          const response: SchedulePushResponse = {
            scheduled,
            cancelled,
            schedulerConfigured: isQstashConfigured(),
          };
          return Response.json(response);
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : "Không thể lên lịch Web Push." },
            { status: 500 },
          );
        }
      },
      DELETE: async ({ request }) => {
        const blocked = guardPushMutation(request, { scope: "push-cancel", limit: 20 });
        if (blocked) return blocked;
        const body = (await request.json().catch(() => ({}))) as { messageIds?: unknown };
        const messageIds = Array.isArray(body.messageIds)
          ? body.messageIds.filter((id): id is string => typeof id === "string").slice(0, 100)
          : [];
        const cancelled = await cancelQstashMessages(messageIds);
        return Response.json({ cancelled });
      },
    },
  },
});
