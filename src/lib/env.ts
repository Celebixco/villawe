import { z } from "zod";

const booleanEnv = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["1", "true", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["0", "false", "no", "off", ""].includes(normalized)) {
      return false;
    }
  }

  if (value === undefined || value === null) {
    return false;
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1).optional(),
  DIRECT_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().url().optional(),
  DEMO_MODE: booleanEnv.default(false),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  STORAGE_DRIVER: z.enum(["local", "r2"]).optional(),
  LOCAL_UPLOAD_DIR: z.string().min(1).optional(),
  R2_ACCOUNT_ID: z.string().min(1).optional(),
  R2_ENDPOINT: z.string().url().optional(),
  R2_BUCKET_NAME: z.string().min(1).optional(),
  R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  R2_PUBLIC_URL: z.string().url().optional(),
  ADMIN_BOOTSTRAP_EMAIL: z.string().email().optional(),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().min(8).optional(),
});

const inferredR2Endpoint =
  process.env.R2_ENDPOINT ||
  process.env.CLOUDFLARE_R2_ENDPOINT ||
  (process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined);

export const env = envSchema.parse({
  ...process.env,
  DEMO_MODE: process.env.DEMO_MODE ?? "false",
  DIRECT_URL: process.env.DIRECT_URL,
  REDIS_URL: process.env.REDIS_URL,
  STORAGE_DRIVER:
    process.env.STORAGE_DRIVER ||
    (process.env.R2_BUCKET_NAME || process.env.CLOUDFLARE_R2_BUCKET ? "r2" : "local"),
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_ENDPOINT: inferredR2Endpoint,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || process.env.CLOUDFLARE_R2_BUCKET,
  R2_ACCESS_KEY_ID:
    process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY:
    process.env.R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  R2_PUBLIC_URL:
    process.env.R2_PUBLIC_URL || process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL,
  ADMIN_BOOTSTRAP_EMAIL:
    process.env.ADMIN_BOOTSTRAP_EMAIL || process.env.SEED_ADMIN_EMAIL,
  ADMIN_BOOTSTRAP_PASSWORD:
    process.env.ADMIN_BOOTSTRAP_PASSWORD || process.env.SEED_ADMIN_PASSWORD,
});

export function isProduction() {
  return env.NODE_ENV === "production";
}

function isValidPostgresUrl(value: string | undefined) {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "postgresql:" || parsed.protocol === "postgres:";
  } catch {
    return false;
  }
}

export function isDatabaseConfigured() {
  return isValidPostgresUrl(env.DATABASE_URL);
}

export function isRedisConfigured() {
  return Boolean(env.REDIS_URL);
}

export function getDatabaseConfigurationError() {
  if (!env.DATABASE_URL) {
    return "DATABASE_URL tanımlı değil.";
  }

  if (!isValidPostgresUrl(env.DATABASE_URL)) {
    return "DATABASE_URL geçerli bir PostgreSQL bağlantısı değil.";
  }

  return null;
}

export function isDemoModeEnabled() {
  return env.DEMO_MODE;
}

export function canUseDemoData() {
  return !isProduction() && isDemoModeEnabled();
}

export function isR2Configured() {
  return Boolean(
    env.R2_ENDPOINT &&
      env.R2_BUCKET_NAME &&
      env.R2_ACCESS_KEY_ID &&
      env.R2_SECRET_ACCESS_KEY &&
      env.R2_PUBLIC_URL,
  );
}

export function isLocalStorageAllowed() {
  return env.STORAGE_DRIVER === "local" && !isProduction();
}

export function getSessionSecret() {
  if (env.SESSION_SECRET) {
    return env.SESSION_SECRET;
  }

  if (isProduction()) {
    throw new Error("SESSION_SECRET must be configured in production.");
  }

  return "villawe-development-session-secret-change-before-production";
}
