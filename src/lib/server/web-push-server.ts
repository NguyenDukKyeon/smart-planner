import {
  isPushSubscriptionJson,
  isWebPushPayload,
  type PushSubscriptionJson,
  type WebPushPayload,
} from "../web-push-shared";

export type WebPushEnvironment = {
  publicKey: string;
  privateKey: string;
  subject: string;
};

type WebPushModule = {
  setVapidDetails: (subject: string, publicKey: string, privateKey: string) => void;
  sendNotification: (
    subscription: PushSubscriptionJson,
    payload: string,
    options: { TTL: number; urgency: "high" | "normal"; topic?: string },
  ) => Promise<unknown>;
};

let webPushModulePromise: Promise<WebPushModule> | null = null;

async function loadWebPush(): Promise<WebPushModule> {
  if (!webPushModulePromise) {
    webPushModulePromise = import("web-push").then((loaded) => {
      const candidate = (loaded.default ?? loaded) as Partial<WebPushModule>;
      if (
        typeof candidate.setVapidDetails !== "function" ||
        typeof candidate.sendNotification !== "function"
      ) {
        throw new Error("Gói web-push không cung cấp API mong đợi.");
      }
      return candidate as WebPushModule;
    });
  }
  return webPushModulePromise;
}

export function getWebPushEnvironment(): WebPushEnvironment | null {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim();
  if (!publicKey || !privateKey || !subject) return null;
  if (!subject.startsWith("mailto:") && !subject.startsWith("https://")) return null;
  return { publicKey, privateKey, subject };
}

export function getPublicPushConfiguration() {
  const environment = getWebPushEnvironment();
  return {
    configured: Boolean(environment),
    publicKey: environment?.publicKey ?? null,
    schedulerConfigured: Boolean(
      process.env.QSTASH_TOKEN?.trim() && process.env.PUSH_DELIVERY_SECRET?.trim(),
    ),
  };
}

export async function sendWebPush(
  subscription: PushSubscriptionJson,
  payload: WebPushPayload,
): Promise<void> {
  if (!isPushSubscriptionJson(subscription)) throw new Error("Push subscription không hợp lệ.");
  if (!isWebPushPayload(payload)) throw new Error("Nội dung thông báo không hợp lệ.");
  const environment = getWebPushEnvironment();
  if (!environment) throw new Error("Máy chủ chưa được cấu hình VAPID keys.");

  const webpush = await loadWebPush();
  webpush.setVapidDetails(environment.subject, environment.publicKey, environment.privateKey);
  await webpush.sendNotification(subscription, JSON.stringify(payload), {
    TTL: payload.urgent ? 60 * 60 : 6 * 60 * 60,
    urgency: payload.urgent ? "high" : "normal",
    topic: payload.tag?.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 32),
  });
}
