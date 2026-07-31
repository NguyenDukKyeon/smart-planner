export type WebPushPayload = {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  lessonId?: string;
  urgent?: boolean;
  data?: Record<string, string | number | boolean | null>;
};

export type ScheduledWebPush = {
  id: string;
  sendAt: string;
  payload: WebPushPayload;
};

export type PushSubscriptionJson = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export type SchedulePushRequest = {
  subscription: PushSubscriptionJson;
  jobs: ScheduledWebPush[];
  previousMessageIds?: string[];
};

export type SchedulePushResponse = {
  scheduled: Array<{ jobId: string; messageId: string; sendAt: string }>;
  cancelled: number;
  schedulerConfigured: boolean;
};

export function isPushSubscriptionJson(value: unknown): value is PushSubscriptionJson {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PushSubscriptionJson>;
  return (
    typeof candidate.endpoint === "string" &&
    candidate.endpoint.startsWith("https://") &&
    !!candidate.keys &&
    typeof candidate.keys.p256dh === "string" &&
    typeof candidate.keys.auth === "string"
  );
}

export function isWebPushPayload(value: unknown): value is WebPushPayload {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<WebPushPayload>;
  return (
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    candidate.title.length <= 120 &&
    typeof candidate.body === "string" &&
    candidate.body.length <= 500
  );
}

export function sanitizeScheduledJobs(value: unknown): ScheduledWebPush[] {
  if (!Array.isArray(value)) return [];
  const now = Date.now();
  const max = now + 31 * 24 * 60 * 60 * 1000;
  return value
    .filter((job): job is ScheduledWebPush => {
      if (!job || typeof job !== "object") return false;
      const candidate = job as Partial<ScheduledWebPush>;
      const sendAt = typeof candidate.sendAt === "string" ? Date.parse(candidate.sendAt) : NaN;
      return (
        typeof candidate.id === "string" &&
        candidate.id.length > 0 &&
        candidate.id.length <= 120 &&
        Number.isFinite(sendAt) &&
        sendAt > now + 15_000 &&
        sendAt <= max &&
        isWebPushPayload(candidate.payload)
      );
    })
    .slice(0, 100);
}
