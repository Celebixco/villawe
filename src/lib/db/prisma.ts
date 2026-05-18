import { cache } from "react";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

import {
  canUseDemoData,
  getDatabaseConfigurationError,
  isDatabaseConfigured,
  isProduction,
} from "@/lib/env";

declare global {
  var __villawePrisma: PrismaClient | undefined;
  var __villawePgPool: Pool | undefined;
}

function isBuildPhase() {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NEXT_PRIVATE_BUILD_WORKER === "1"
  );
}

export function getPrisma() {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (!globalThis.__villawePgPool) {
    globalThis.__villawePgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  if (!globalThis.__villawePrisma) {
    const adapter = new PrismaPg(globalThis.__villawePgPool);

    globalThis.__villawePrisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }

  return globalThis.__villawePrisma;
}

function resolveValue<T>(value: T | (() => Promise<T> | T)) {
  if (typeof value === "function") {
    return (value as () => Promise<T> | T)();
  }

  return value;
}

export function getDatabaseErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Veritabanına erişilirken bilinmeyen bir hata oluştu.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("econnrefused")) {
    return "Veritabanı sunucusuna ulaşılamadı. DATABASE_URL ve ağ erişimini kontrol edin.";
  }

  if (message.includes("authentication") || message.includes("password")) {
    return "Veritabanı kimlik doğrulaması başarısız oldu. Kullanıcı adı ve şifreyi kontrol edin.";
  }

  if (message.includes("does not exist")) {
    return "Veritabanı veya hedef şema bulunamadı. Migration çalıştırıldığından emin olun.";
  }

  return error.message.split("\n")[0] || "Veritabanına erişim başarısız oldu.";
}

export type DatabaseHealth =
  | { status: "database"; message: string }
  | { status: "demo"; message: string }
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string };

export const getDatabaseHealth = cache(async (): Promise<DatabaseHealth> => {
  if (!isDatabaseConfigured()) {
    const message =
      getDatabaseConfigurationError() ||
      "Veritabanı bağlantısı yapılandırılmadı.";

    if (canUseDemoData()) {
      return {
        status: "demo",
        message: `Demo veri modu açık. ${message}`,
      };
    }

    return {
      status: "unavailable",
      message,
    };
  }

  if (isBuildPhase()) {
    return {
      status: "unavailable",
      message:
        "Build aşamasında canlı veritabanı sağlık kontrolü atlandı. Runtime ortamında DATABASE_URL ve migration durumunu doğrulayın.",
    };
  }

  const prisma = getPrisma();

  if (!prisma) {
    return {
      status: canUseDemoData() ? "demo" : "unavailable",
      message:
        getDatabaseConfigurationError() ||
        "Prisma istemcisi oluşturulamadı.",
    };
  }

  try {
    await prisma.$queryRawUnsafe("SELECT 1");

    return {
      status: "database",
      message: "Veritabanı bağlantısı sağlıklı.",
    };
  } catch (error) {
    const message = getDatabaseErrorMessage(error);

    if (canUseDemoData()) {
      return {
        status: "demo",
        message: `Veritabanı erişimi başarısız oldu, demo veri modu kullanılıyor. ${message}`,
      };
    }

    return {
      status: "error",
      message,
    };
  }
});

export async function withDbFallback<T>(
  query: (client: PrismaClient) => Promise<T>,
  fallback: T | (() => Promise<T> | T),
  empty: T | (() => Promise<T> | T),
) {
  const health = await getDatabaseHealth();

  if (health.status === "demo") {
    return await resolveValue(fallback);
  }

  if (health.status === "unavailable" || health.status === "error") {
    return await resolveValue(empty);
  }

  const prisma = getPrisma();

  if (!prisma) {
    if (canUseDemoData()) {
      return await resolveValue(fallback);
    }

    return await resolveValue(empty);
  }

  try {
    return await query(prisma);
  } catch (error) {
    const message = getDatabaseErrorMessage(error);

    if (!isProduction()) {
      console.warn(`[villawe:db] ${message}`);
    }

    if (canUseDemoData()) {
      return await resolveValue(fallback);
    }

    return await resolveValue(empty);
  }
}
