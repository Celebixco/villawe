import { getRedisConnection } from "@/lib/redis/client";

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

  const cached = await redis.get(key);

  if (cached) {
    try {
      const parsed = JSON.parse(cached) as CacheEnvelope<T>;
      return parsed.value;
    } catch {
      await redis.del(key);
    }
  }

  const value = await loader();
  const envelope: CacheEnvelope<T> = {
    value,
    cachedAt: new Date().toISOString(),
  };

  await redis.set(key, JSON.stringify(envelope), {
    EX: ttlSeconds,
  });

  return value;
}

export async function invalidateRedisByPrefixes(prefixes: string[]) {
  const redis = await getRedisConnection();

  if (!redis || !prefixes.length) {
    return 0;
  }

  let deleted = 0;

  for (const prefix of prefixes) {
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
  }

  return deleted;
}
