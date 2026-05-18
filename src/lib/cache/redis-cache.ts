import { getRedisConnection, reportRedisDegradation } from "@/lib/redis/client";

type CacheEnvelope<T> = {
  value: T;
  cachedAt: string;
};

export async function withRedisJsonCache<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
) {
  const redis = await getRedisConnection();

  if (!redis) {
    return loader();
  }

  let cached: string | null = null;

  try {
    cached = await redis.get(key);
  } catch (error) {
    reportRedisDegradation(error, "cache-read");
    return loader();
  }

  if (cached) {
    try {
      const parsed = JSON.parse(cached) as CacheEnvelope<T>;
      return parsed.value;
    } catch {
      try {
        await redis.del(key);
      } catch (error) {
        reportRedisDegradation(error, "cache-delete-corrupt");
      }
    }
  }

  const value = await loader();
  const envelope: CacheEnvelope<T> = {
    value,
    cachedAt: new Date().toISOString(),
  };

  try {
    await redis.set(key, JSON.stringify(envelope), {
      EX: ttlSeconds,
    });
  } catch (error) {
    reportRedisDegradation(error, "cache-write");
  }

  return value;
}

export async function invalidateRedisByPrefixes(prefixes: string[]) {
  const redis = await getRedisConnection();

  if (!redis || !prefixes.length) {
    return 0;
  }

  let deleted = 0;

  for (const prefix of prefixes) {
    try {
      const keys: string[] = [];

      for await (const key of redis.scanIterator({
        MATCH: `${prefix}*`,
        COUNT: 100,
      })) {
        keys.push(String(key));
      }

      if (!keys.length) {
        continue;
      }

      deleted += await redis.unlink(keys);
    } catch (error) {
      reportRedisDegradation(error, "cache-invalidate");
    }
  }

  return deleted;
}
