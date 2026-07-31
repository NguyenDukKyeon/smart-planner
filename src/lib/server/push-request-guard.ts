type RateBucket = { count: number; resetAt: number };

const buckets = new Map<string, RateBucket>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwarded ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function requestIsSameOrigin(request: Request): boolean {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  if (origin && origin !== requestOrigin) return false;
  const fetchSite = request.headers.get("sec-fetch-site");
  return (
    !fetchSite || fetchSite === "same-origin" || fetchSite === "same-site" || fetchSite === "none"
  );
}

export function guardPushMutation(
  request: Request,
  options: { scope: string; limit: number; windowMs?: number },
): Response | null {
  if (!requestIsSameOrigin(request)) return new Response("Forbidden", { status: 403 });

  const now = Date.now();
  const windowMs = options.windowMs ?? 60_000;
  const key = `${options.scope}:${clientKey(request)}`;
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
  } else if (current.count >= options.limit) {
    return Response.json(
      { error: "Bạn thao tác quá nhanh. Hãy chờ một phút rồi thử lại." },
      {
        status: 429,
        headers: { "retry-after": String(Math.ceil((current.resetAt - now) / 1000)) },
      },
    );
  } else {
    current.count += 1;
  }

  if (buckets.size > 1_000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }
  return null;
}
