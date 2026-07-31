import { createFileRoute } from "@tanstack/react-router";
import { getPublicPushConfiguration } from "@/lib/server/web-push-server";

export const Route = createFileRoute("/api/push/config")({
  server: {
    handlers: {
      GET: async () =>
        Response.json(getPublicPushConfiguration(), {
          headers: { "cache-control": "no-store" },
        }),
    },
  },
});
