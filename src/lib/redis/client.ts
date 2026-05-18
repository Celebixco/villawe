import { createClient } from "redis";

import { env, isProduction, isRedisConfigured } from "@/lib/env";

type VillaweRedisClient = ReturnType<typeof createClient>;

declare global {
  var __villaweRedisClient: VillaweRedisClient | undefined;
  var __villaweRedisConnectPromise: Promise<VillaweRedisClient | null> | undefined;
}

function isBuildPhase() {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NEXT_PRIVATE_BUILD_WORKER === "1"
  );
}

export function getRedisClient() {
  const redisUrl = env.REDIS_URL;

  if (!isRedisConfigured() || isBuildPhase() || !redisUrl) {
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
        if (!isProduction()) {
          console.warn(`[villawe:redis] ${error.message}`);
        }

        return null;
      })
      .finally(() => {
        globalThis.__villaweRedisConnectPromise = undefined;
      });
  }

  return globalThis.__villaweRedisConnectPromise;
}
