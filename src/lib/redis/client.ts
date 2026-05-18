import { createClient } from "redis";

import { env, isProduction, isRedisConfigured } from "@/lib/env";

type VillaweRedisClient = ReturnType<typeof createClient>;

declare global {
  var __villaweRedisClient: VillaweRedisClient | undefined;
  var __villaweRedisConnectPromise: Promise<VillaweRedisClient | null> | undefined;
  var __villaweRedisConfigWarningShown: boolean | undefined;
}

function isBuildPhase() {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NEXT_PRIVATE_BUILD_WORKER === "1"
  );
}

export function getRedisClient() {
  const redisUrl = env.REDIS_URL;

  if (isBuildPhase()) {
    return null;
  }

  if (!isRedisConfigured() || !redisUrl) {
    if (isProduction() && !globalThis.__villaweRedisConfigWarningShown) {
      globalThis.__villaweRedisConfigWarningShown = true;
      console.error(
        "[villawe:redis] REDIS_URL tanımlı değil. Cache ve rate limit güvenli biçimde devre dışı kalacak.",
      );
    }

    return null;
  }

  if (!globalThis.__villaweRedisClient) {
    const client = createClient({
      url: redisUrl,
    });

    client.on("error", (error) => {
      if (!isProduction()) {
        console.warn(`[villawe:redis] ${error.message}`);
      }
    });

    globalThis.__villaweRedisClient = client;
  }

  return globalThis.__villaweRedisClient;
}

export function reportRedisDegradation(error: unknown, scope: string) {
  const message =
    error instanceof Error ? error.message.split("\n")[0] : "unknown redis error";

  if (isProduction()) {
    console.error(`[villawe:redis:${scope}] ${message}`);
    return;
  }

  console.warn(`[villawe:redis:${scope}] ${message}`);
}

export async function getRedisConnection() {
  const client = getRedisClient();

  if (!client) {
    return null;
  }

  if (client.isOpen) {
    return client;
  }

  if (!globalThis.__villaweRedisConnectPromise) {
    globalThis.__villaweRedisConnectPromise = client
      .connect()
      .then(() => client)
      .catch((error) => {
        reportRedisDegradation(error, "connect");

        return null;
      })
      .finally(() => {
        globalThis.__villaweRedisConnectPromise = undefined;
      });
  }

  return globalThis.__villaweRedisConnectPromise;
}
