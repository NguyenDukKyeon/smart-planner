declare module "web-push" {
  type PushSubscription = {
    endpoint: string;
    expirationTime?: number | null;
    keys: { p256dh: string; auth: string };
  };

  type SendOptions = {
    TTL?: number;
    urgency?: "very-low" | "low" | "normal" | "high";
    topic?: string;
  };

  type WebPushApi = {
    setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
    sendNotification(
      subscription: PushSubscription,
      payload?: string | Buffer,
      options?: SendOptions,
    ): Promise<unknown>;
    generateVAPIDKeys(): { publicKey: string; privateKey: string };
  };

  const webpush: WebPushApi;
  export default webpush;
  export const setVapidDetails: WebPushApi["setVapidDetails"];
  export const sendNotification: WebPushApi["sendNotification"];
  export const generateVAPIDKeys: WebPushApi["generateVAPIDKeys"];
}
