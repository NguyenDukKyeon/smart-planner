import type { PushSubscriptionJson, ScheduledWebPush } from "../web-push-shared";

const DEFAULT_QSTASH_URL = "https://qstash.upstash.io";

function qstashConfig() {
  const token = process.env.QSTASH_TOKEN?.trim();
  if (!token) return null;
  return {
    token,
    baseUrl: (process.env.QSTASH_URL?.trim() || DEFAULT_QSTASH_URL).replace(/\/$/, ""),
  };
}

function safeDestinationOrigin(request: Request): string {
  const requestUrl = new URL(request.url);
  if (requestUrl.protocol !== "https:" && requestUrl.hostname !== "localhost") {
    throw new Error("Web Push scheduler yêu cầu HTTPS.");
  }
  return requestUrl.origin;
}

export async function cancelQstashMessages(messageIds: string[]): Promise<number> {
  const config = qstashConfig();
  if (!config || messageIds.length === 0) return 0;
  const validIds = messageIds
    .filter((messageId) => /^[A-Za-z0-9_-]+$/.test(messageId))
    .slice(0, 100);
  if (validIds.length === 0) return 0;

  const url = new URL(`${config.baseUrl}/v2/messages`);
  for (const messageId of validIds) url.searchParams.append("messageIds", messageId);
  url.searchParams.set("count", String(validIds.length));

  const response = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${config.token}` },
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`QStash không thể hủy lịch cũ: ${response.status} ${details}`);
  }
  const result = (await response.json()) as { cancelled?: number };
  return typeof result.cancelled === "number" ? result.cancelled : 0;
}

export async function scheduleQstashPushes(args: {
  request: Request;
  subscription: PushSubscriptionJson;
  jobs: ScheduledWebPush[];
}): Promise<Array<{ jobId: string; messageId: string; sendAt: string }>> {
  const config = qstashConfig();
  if (!config || args.jobs.length === 0) return [];
  const deliverySecret = process.env.PUSH_DELIVERY_SECRET?.trim();
  if (!deliverySecret) throw new Error("Thiếu PUSH_DELIVERY_SECRET cho điểm nhận QStash.");

  const destination = `${safeDestinationOrigin(args.request)}/api/push/deliver`;
  const batch = args.jobs.map((job) => ({
    destination,
    body: JSON.stringify({ subscription: args.subscription, payload: job.payload }),
    headers: {
      "Content-Type": "application/json",
      "Upstash-Not-Before": String(Math.floor(Date.parse(job.sendAt) / 1000)),
      "Upstash-Retries": "3",
      "Upstash-Forward-Authorization": `Bearer ${deliverySecret}`,
      "Upstash-Redact-Fields": "body, header[Authorization]",
      "Upstash-Label": `study_push_${job.id.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 40)}`,
    },
  }));

  const response = await fetch(`${config.baseUrl}/v2/batch`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(batch),
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`QStash không thể lên lịch thông báo: ${response.status} ${details}`);
  }

  const data = (await response.json()) as Array<{ messageId?: string }>;
  if (!Array.isArray(data) || data.length !== args.jobs.length) {
    throw new Error("QStash trả về số lượng message không khớp với lịch đã gửi.");
  }

  return data.map((item, index) => {
    if (!item.messageId) throw new Error("QStash không trả về messageId.");
    const job = args.jobs[index];
    return { jobId: job.id, messageId: item.messageId, sendAt: job.sendAt };
  });
}

export function isQstashConfigured() {
  return Boolean(qstashConfig());
}
