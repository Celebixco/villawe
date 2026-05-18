import { createHash } from "crypto";

const CACHE_PREFIX = "villawe";

function sanitizeKeyPart(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9:_-]/g, "-");
}

function hashKeyPart(value: string) {
  return createHash("sha1").update(value).digest("hex").slice(0, 16);
}

export function buildCacheKey(namespace: string, ...parts: string[]) {
  const normalized = parts.map((part) => sanitizeKeyPart(part));
  return [CACHE_PREFIX, sanitizeKeyPart(namespace), ...normalized].join(":");
}

export function buildHashedCacheKey(namespace: string, label: string, rawValue: string) {
  return buildCacheKey(namespace, label, hashKeyPart(rawValue));
}

export const publicCacheKeys = {
  allPublishedVillas: () => buildCacheKey("public", "villas", "published"),
  homePage: () => buildCacheKey("public", "homepage"),
  regions: () => buildCacheKey("public", "regions"),
  districts: () => buildCacheKey("public", "districts"),
  concepts: () => buildCacheKey("public", "concepts"),
  blogPosts: () => buildCacheKey("public", "blog-posts"),
  blogPost: (slug: string) => buildCacheKey("public", "blog-post", slug),
  villaDetail: (slug: string) => buildCacheKey("public", "villa", slug),
};

export const searchCacheKeys = {
  listingResults: (queryString: string) =>
    buildHashedCacheKey("search", "listing-results", queryString || "all"),
};

export const seoCacheKeys = {
  landingTargets: () => buildCacheKey("seo", "targets"),
  landingPage: (slug: string) => buildCacheKey("seo", "landing-page", slug),
  sitemap: () => buildCacheKey("seo", "sitemap"),
};

export const futureRedisKeys = {
  availability: (villaId: string) => buildCacheKey("availability", villaId),
  pricing: (villaId: string) => buildCacheKey("pricing", villaId),
  queue: (name: string) => buildCacheKey("queue", name),
  session: (subject: string) => buildCacheKey("session", subject),
};

export const PUBLIC_CACHE_INVALIDATION_PREFIXES = [
  buildCacheKey("public"),
  buildCacheKey("search"),
  buildCacheKey("seo"),
  buildCacheKey("availability"),
  buildCacheKey("pricing"),
];
