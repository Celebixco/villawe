import { redirect } from "next/navigation";

import { writeAuditLog } from "@/features/admin/action-helpers";
import { requireOwnerSession } from "@/lib/auth/owner-authorization";
import { getDatabaseErrorMessage, getPrisma } from "@/lib/db/prisma";
import { getDatabaseConfigurationError, isDatabaseConfigured } from "@/lib/env";

export function getOwnerActionRedirect(path: string, key: string, value: string) {
  return `${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(value)}`;
}

export function redirectOwnerError(path: string, message: string): never {
  redirect(getOwnerActionRedirect(path, "error", message) as never);
}

export function redirectOwnerSuccess(path: string, key = "saved"): never {
  redirect(getOwnerActionRedirect(path, key, "1") as never);
}

export function parseOwnerOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function parseLinesFromFormData(formData: FormData, key: string) {
  const values = formData.getAll(key);
  return values
    .flatMap((value) =>
      typeof value === "string" ? value.split("\n") : [],
    )
    .map((value) => value.trim())
    .filter(Boolean);
}

export function parseMultiValue(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .flatMap((value) => (typeof value === "string" ? value.split(",") : []))
    .map((value) => value.trim())
    .filter(Boolean);
}

export function slugifyVillaTitle(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

export async function requireOwnerMutation() {
  const session = await requireOwnerSession();
  const prisma = getPrisma();

  if (!prisma || !isDatabaseConfigured()) {
    throw new Error(
      getDatabaseConfigurationError() ||
        "Veritabanı yapılandırılmadan ev sahibi işlemi yapılamaz.",
    );
  }

  const owner = await prisma.owner.findUnique({
    where: { id: session.ownerId },
  });

  if (!owner || owner.userId !== session.userId) {
    throw new Error("Bu işlem için yetkili ev sahibi hesabı bulunamadı.");
  }

  if (owner.status === "SUSPENDED" || owner.status === "REJECTED") {
    throw new Error("Hesabınız bu işlem için yetkili değil.");
  }

  return {
    session,
    prisma,
    owner,
  };
}

export async function writeOwnerAuditLog(input: {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  const payload: Parameters<typeof writeAuditLog>[0] = {
    actorUserId: input.actorUserId,
    actorType: "OWNER",
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    message: input.message,
  };

  if (input.metadata) {
    payload.metadata = input.metadata;
  }

  await writeAuditLog(payload);
}

export function formatOwnerMutationError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return getDatabaseErrorMessage(error);
  }

  return fallback;
}
