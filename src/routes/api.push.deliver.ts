import { createFileRoute } from "@tanstack/react-router";
import { sendWebPush } from "@/lib/server/web-push-server";
import { isPushSubscriptionJson, isWebPushPayload } from "@/lib/web-push-shared";

function isAuthorized(request: Request): boolean {
  const expected = process.env.PUSH_DELIVERY_SECRET?.trim();
  if (!expected) return false;
  return request.headers.get("authorization") === `Bearer ${expected}`;
}

export const Route = createFileRoute("/api/push/deliver")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorized(request)) return new Response("Unauthorized", { status: 401 });
        try {
          const body = (await request.json()) as { subscription?: unknown; payload?: unknown };
          if (!isPushSubscriptionJson(body.subscription) || !isWebPushPayload(body.payload)) {
            return new Response("Invalid push payload", { status: 400 });
          }
          await sendWebPush(body.subscription, body.payload);
          return Response.json({ ok: true });
        } catch (error) {
          const statusCode =
            typeof error === "object" && error && "statusCode" in error
              ? Number((error as { statusCode?: unknown }).statusCode)
              : 500;
          if (statusCode === 404 || statusCode === 410) {
            return Response.json({ expired: true }, { status: 200 });
          }
          return Response.json(
            { error: error instanceof Error ? error.message : "Push delivery failed" },
            { status: 500 },
          );
        }
      },
    },
  },
});
