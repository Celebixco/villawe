import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { PUBLIC_CACHE_INVALIDATION_PREFIXES } from "@/lib/cache/keys";
import { invalidateRedisByPrefixes } from "@/lib/cache/redis-cache";
import { requireAdminRole } from "@/lib/auth/authorization";
import { getDatabaseErrorMessage, getPrisma } from "@/lib/db/prisma";
import { getDatabaseConfigurationError, isDatabaseConfigured } from "@/lib/env";

export function getActionRedirect(path: string, key: string, value: string) {
  return `${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(value)}`;
}

export function redirectWithError(path: string, message: string): never {
  redirect(getActionRedirect(path, "error", message) as never);
}

export function redirectWithSuccess(path: string, key = "saved"): never {
  redirect(getActionRedirect(path, key, "1") as never);
}

export function getActionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

export async function requireAdminMutation(
  roleKeys: string[] = ["super_admin", "content_admin"],
) {
  const session = await requireAdminRole(roleKeys);
  const prisma = getPrisma();

  if (!prisma || !isDatabaseConfigured()) {
    throw new Error(
      getDatabaseConfigurationError() ||
        "Veritabanı yapılandırılmadan yönetim işlemi yapılamaz.",
    );
  }

  return {
    session,
    prisma,
  };
}

export async function writeAuditLog(input: {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  const prisma = getPrisma();

  if (!prisma || !isDatabaseConfigured()) {
    return;
  }

  const data: {
    actorUserId: string;
    action: string;
    entityType: string;
    entityId: string;
    message: string;
    metadata?: Prisma.InputJsonValue;
  } = {
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    message: input.message,
  };

  if (input.metadata) {
    data.metadata = input.metadata as Prisma.InputJsonValue;
  }

  await prisma.auditLog.create({ data });
  await invalidateRedisByPrefixes(PUBLIC_CACHE_INVALIDATION_PREFIXES);
}

export function parseOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function parseJsonInput(value: string) {
  return JSON.parse(value);
}

export function formatMutationError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return getDatabaseErrorMessage(error);
  }

  return fallback;
}
