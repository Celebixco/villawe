import { createHash } from "crypto";

import { headers } from "next/headers";

import { buildCacheKey } from "@/lib/cache/keys";
import { getRedisConnection } from "@/lib/redis/client";
import { reportRedisDegradation } from "@/lib/redis/client";

function hashValue(value: string) {
  return createHash("sha1").update(value).digest("hex");
}

export async function getRequestRateLimitKey(scope: string, seed?: string) {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = requestHeaders.get("x-real-ip")?.trim();
  const userAgent = requestHeaders.get("user-agent")?.trim() || "unknown";

  return hashValue(
    [scope, seed || "anonymous", forwardedFor || realIp || "no-ip", userAgent].join("|"),
  );
}

export async function enforceRateLimit(input: {
  scope: string;
  key: string;
  limit: number;
  windowSeconds: number;
  message: string;
}) {
  const redis = await getRedisConnection();

  if (!redis) {
    return {
      allowed: true,
      enforced: false,
    };
  }

  try {
    const rateLimitKey = buildCacheKey("rate-limit", input.scope, input.key);
    const currentCount = await redis.incr(rateLimitKey);

    if (currentCount === 1) {
      await redis.expire(rateLimitKey, input.windowSeconds);
    }

    if (currentCount > input.limit) {
      throw new Error(input.message);
    }
  } catch (error) {
    if (error instanceof Error && error.message === input.message) {
      throw error;
    }

    reportRedisDegradation(error, `rate-limit:${input.scope}`);

    return {
      allowed: true,
      enforced: false,
    };
  }

  return {
    allowed: true,
    enforced: true,
  };
}
