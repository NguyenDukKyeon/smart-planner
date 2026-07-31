import type {
  PushSubscriptionJson,
  ScheduledWebPush,
  SchedulePushResponse,
  WebPushPayload,
} from "./web-push-shared";
import { registerPwaServiceWorker } from "./pwa-client";

const SCHEDULE_IDS_KEY = "smart-study-web-push-qstash-message-ids-v1";

export type WebPushCapability = {
  supported: boolean;
  secureContext: boolean;
  configured: boolean;
  schedulerConfigured: boolean;
  publicKey: string | null;
  permission: NotificationPermission | "unsupported";
  subscribed: boolean;
};

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let index = 0; index < rawData.length; index += 1) output[index] = rawData.charCodeAt(index);
  return output;
}

function toSubscriptionJson(subscription: PushSubscription): PushSubscriptionJson {
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error("Trình duyệt không trả về đầy đủ khóa Web Push.");
  }
  return {
    endpoint: json.endpoint,
    expirationTime: json.expirationTime,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  };
}

function getStoredMessageIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(SCHEDULE_IDS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function saveMessageIds(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SCHEDULE_IDS_KEY, JSON.stringify(ids.slice(0, 100)));
}

async function fetchConfig() {
  const response = await fetch("/api/push/config", { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error("Không thể đọc cấu hình Web Push từ máy chủ.");
  return (await response.json()) as {
    configured: boolean;
    schedulerConfigured: boolean;
    publicKey: string | null;
  };
}

export async function getWebPushCapability(): Promise<WebPushCapability> {
  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;
  const config = await fetchConfig().catch(() => ({
    configured: false,
    schedulerConfigured: false,
    publicKey: null,
  }));
  if (!supported) {
    return {
      supported: false,
      secureContext: typeof window !== "undefined" && window.isSecureContext,
      configured: config.configured,
      schedulerConfigured: config.schedulerConfigured,
      publicKey: config.publicKey,
      permission: "unsupported",
      subscribed: false,
    };
  }
  const registration = await registerPwaServiceWorker();
  const subscription = await registration?.pushManager.getSubscription();
  return {
    supported: true,
    secureContext: window.isSecureContext,
    configured: config.configured,
    schedulerConfigured: config.schedulerConfigured,
    publicKey: config.publicKey,
    permission: Notification.permission,
    subscribed: Boolean(subscription),
  };
}

export async function subscribeToWebPush(): Promise<PushSubscription> {
  const config = await fetchConfig();
  if (!config.configured || !config.publicKey) {
    throw new Error("Máy chủ chưa có VAPID keys. Hãy cấu hình biến môi trường trước.");
  }
  if (!window.isSecureContext) throw new Error("Web Push chỉ hoạt động trên HTTPS hoặc localhost.");
  const registration = await registerPwaServiceWorker();
  if (!registration) throw new Error("Không thể đăng ký service worker.");
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(
      permission === "denied"
        ? "Trình duyệt đang chặn thông báo. Hãy cho phép trong cài đặt trang web."
        : "Bạn chưa cấp quyền thông báo.",
    );
  }
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(config.publicKey),
  });
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  const registration = await registerPwaServiceWorker();
  return registration?.pushManager.getSubscription() ?? null;
}

export async function sendWebPushTest(payload: WebPushPayload): Promise<void> {
  const subscription = await getCurrentPushSubscription();
  if (!subscription) throw new Error("Thiết bị này chưa đăng ký Web Push.");
  const response = await fetch("/api/push/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ subscription: toSubscriptionJson(subscription), payload }),
  });
  const result = (await response.json().catch(() => ({}))) as { error?: string; expired?: boolean };
  if (!response.ok) {
    if (result.expired) await subscription.unsubscribe().catch(() => false);
    throw new Error(result.error || "Không thể gửi thông báo thử.");
  }
}

export async function syncScheduledWebPush(
  jobs: ScheduledWebPush[],
): Promise<SchedulePushResponse> {
  const subscription = await getCurrentPushSubscription();
  if (!subscription) throw new Error("Thiết bị này chưa đăng ký Web Push.");
  const response = await fetch("/api/push/schedule", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      subscription: toSubscriptionJson(subscription),
      jobs,
      previousMessageIds: getStoredMessageIds(),
    }),
  });
  const result = (await response.json().catch(() => ({}))) as SchedulePushResponse & {
    error?: string;
  };
  if (!response.ok) throw new Error(result.error || "Không thể đồng bộ lịch Web Push.");
  saveMessageIds(result.scheduled.map((item) => item.messageId));
  return result;
}

export async function unsubscribeFromWebPush(): Promise<void> {
  const messageIds = getStoredMessageIds();
  if (messageIds.length > 0) {
    await fetch("/api/push/schedule", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messageIds }),
    }).catch(() => undefined);
  }
  saveMessageIds([]);
  const subscription = await getCurrentPushSubscription();
  if (subscription) await subscription.unsubscribe();
}
