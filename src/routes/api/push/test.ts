import { createFileRoute } from "@tanstack/react-router";
import { guardPushMutation } from "@/lib/server/push-request-guard";
import { sendWebPush } from "@/lib/server/web-push-server";
import { isPushSubscriptionJson, isWebPushPayload } from "@/lib/web-push-shared";

export const Route = createFileRoute("/api/push/test")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const blocked = guardPushMutation(request, { scope: "push-test", limit: 5 });
        if (blocked) return blocked;
        try {
          const body = (await request.json()) as { subscription?: unknown; payload?: unknown };
          if (!isPushSubscriptionJson(body.subscription) || !isWebPushPayload(body.payload)) {
            return Response.json({ error: "Dữ liệu Web Push không hợp lệ." }, { status: 400 });
          }
          await sendWebPush(body.subscription, body.payload);
          return Response.json({ ok: true });
        } catch (error) {
          const statusCode =
            typeof error === "object" && error && "statusCode" in error
              ? Number((error as { statusCode?: unknown }).statusCode)
              : 500;
          const expired = statusCode === 404 || statusCode === 410;
          return Response.json(
            {
              error: expired
                ? "Đăng ký thông báo đã hết hạn. Hãy tắt rồi bật lại Web Push."
                : error instanceof Error
                  ? error.message
                  : "Không thể gửi thông báo thử.",
              expired,
            },
            { status: expired ? 410 : 500 },
          );
        }
      },
    },
  },
});
