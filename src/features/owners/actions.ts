"use server";

import { createHash, randomUUID } from "crypto";
import path from "path";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { authenticateOwner } from "@/features/owners/auth";
import {
  formatOwnerMutationError,
  parseLinesFromFormData,
  parseMultiValue,
  parseOwnerOptionalString,
  redirectOwnerError,
  redirectOwnerSuccess,
  requireOwnerMutation,
  slugifyVillaTitle,
  writeOwnerAuditLog,
} from "@/features/owners/action-helpers";
import {
  canOwnerSubmitVillaForReview,
  getOwnerSubmitWarnings,
  getOwnerVillaChecklist,
} from "@/features/owners/checklist";
import { createOwnerSession, destroyOwnerSession } from "@/lib/auth/owner-session";
import { hashPassword } from "@/lib/auth/password";
import { getPrisma } from "@/lib/db/prisma";
import { getDatabaseConfigurationError, isDatabaseConfigured } from "@/lib/env";
import { enforceRateLimit, getRequestRateLimitKey } from "@/lib/rate-limit";
import { getStorageService } from "@/lib/storage/service";
import {
  ownerAvailabilityBlockSchema,
  ownerInquiryNoteSchema,
  ownerInquirySeenSchema,
  ownerLoginSchema,
  ownerPasswordResetRequestSchema,
  ownerRegistrationSchema,
  ownerSeasonPriceSchema,
  ownerVillaBasicsSchema,
  ownerVillaCreateSchema,
  ownerVillaPricingSchema,
  ownerVillaReviewSubmitSchema,
  villaCoverSchema,
  villaMediaDeleteSchema,
  villaMediaUpdateSchema,
} from "@/lib/validation/forms";

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const DOCUMENT_EXTENSIONS = new Set([".pdf", ".jpg", ".jpeg", ".png", ".webp"]);

const ALLOWED_DOCUMENT_TYPES = new Set([
  "tourism_permit",
  "ownership_or_authority",
  "identity",
  "tax_or_business_document",
  "other",
]);

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 12 * 1024 * 1024;

function redirectTo(path: string): never {
  redirect(path as never);
}

function parseString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return {
      firstName: parts[0] || fullName.trim(),
      lastName: "",
    };
  }

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

async function toBuffer(file: File) {
  return Buffer.from(await file.arrayBuffer());
}

function getChecksum(buffer: Buffer) {
  return createHash("sha1").update(buffer).digest("hex");
}

function assertDocumentTypeAllowed(value: string) {
  if (!ALLOWED_DOCUMENT_TYPES.has(value)) {
    throw new Error("Geçersiz belge tipi seçildi.");
  }
}

function assertUploadFileAllowed(file: File, kind: "image" | "document") {
  const extension = path.extname(file.name).toLowerCase();

  if (!file.size) {
    throw new Error("Boş dosya yüklenemez.");
  }

  if (kind === "image") {
    if (!IMAGE_MIME_TYPES.has(file.type) || !IMAGE_EXTENSIONS.has(extension)) {
      throw new Error("Yalnızca JPG, PNG, WebP veya AVIF görselleri yüklenebilir.");
    }

    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error("Görsel boyutu 10 MB sınırını aşamaz.");
    }

    return;
  }

  if (!DOCUMENT_MIME_TYPES.has(file.type) || !DOCUMENT_EXTENSIONS.has(extension)) {
    throw new Error("Yalnızca PDF, JPG, PNG veya WebP belgeleri yüklenebilir.");
  }

  if (file.size > MAX_DOCUMENT_BYTES) {
    throw new Error("Belge boyutu 12 MB sınırını aşamaz.");
  }
}

function normalizeVillaPayload(formData: FormData) {
  return {
    villaId: parseString(formData.get("villaId")) || undefined,
    title: parseString(formData.get("title")),
    shortDescription: parseString(formData.get("shortDescription")),
    description: parseString(formData.get("description")),
    regionId: parseString(formData.get("regionId")),
    districtId: parseString(formData.get("districtId")),
    neighborhoodId: parseOwnerOptionalString(formData.get("neighborhoodId")),
    addressPublic: parseString(formData.get("addressPublic")),
    addressPrivate: parseString(formData.get("addressPrivate")),
    maxGuests: parseString(formData.get("maxGuests")),
    bedroomCount: parseString(formData.get("bedroomCount")),
    bathroomCount: parseString(formData.get("bathroomCount")),
    bedCount: parseString(formData.get("bedCount")),
    checkInTime: parseString(formData.get("checkInTime")),
    checkOutTime: parseString(formData.get("checkOutTime")),
    minNights: parseString(formData.get("minNights")),
    basePrice: parseString(formData.get("basePrice")),
    cleaningFee: parseString(formData.get("cleaningFee")),
    depositAmount: parseString(formData.get("depositAmount")),
    serviceFeeType: parseString(formData.get("serviceFeeType")),
    serviceFeeValue: parseString(formData.get("serviceFeeValue")),
    extraGuestFee: parseString(formData.get("extraGuestFee")),
    hasPrivatePool: formData.get("hasPrivatePool"),
    hasHeatedPool: formData.get("hasHeatedPool"),
    hasJacuzzi: formData.get("hasJacuzzi"),
    isShelteredPool: formData.get("isShelteredPool"),
    isConservativeFriendly: formData.get("isConservativeFriendly"),
    isPetFriendly: formData.get("isPetFriendly"),
    isChildFriendly: formData.get("isChildFriendly"),
    isFamilyFriendly: formData.get("isFamilyFriendly"),
    hasSeaView: formData.get("hasSeaView"),
    hasNatureView: formData.get("hasNatureView"),
    nearBeach: formData.get("nearBeach"),
    nearCenter: formData.get("nearCenter"),
    hasBarbecue: formData.get("hasBarbecue"),
    hasFireplace: formData.get("hasFireplace"),
    hasParking: formData.get("hasParking"),
    hasAirConditioning: formData.get("hasAirConditioning"),
    hasInternet: formData.get("hasInternet"),
    isWheelchairFriendly: formData.get("isWheelchairFriendly"),
    amenities: parseMultiValue(formData, "amenities"),
    concepts: parseMultiValue(formData, "concepts"),
    houseRules: parseLinesFromFormData(formData, "houseRules"),
    poolDetails: parseLinesFromFormData(formData, "poolDetails"),
    nearbyPlaces: parseLinesFromFormData(formData, "nearbyPlaces"),
    cancellationPolicyId: parseOwnerOptionalString(formData.get("cancellationPolicyId")),
    depositPolicyId: parseOwnerOptionalString(formData.get("depositPolicyId")),
  };
}

function mapOwnerReasonCode(value: "owner_block" | "maintenance" | "reserved_elsewhere" | "other") {
  if (value === "owner_block") {
    return {
      type: "OWNER_USE" as const,
      defaultReason: "Ev sahibi kullanım blokesi",
    };
  }

  if (value === "maintenance") {
    return {
      type: "MAINTENANCE" as const,
      defaultReason: "Bakım çalışması",
    };
  }

  if (value === "reserved_elsewhere") {
    return {
      type: "RESERVED" as const,
      defaultReason: "Farklı kanalda rezerve edildi",
    };
  }

  return {
    type: "BLOCKED" as const,
    defaultReason: "Diğer neden",
  };
}

async function safeDeleteStoredFile(storageKey: string) {
  try {
    await getStorageService().deleteFile(storageKey);
  } catch {
    // Best-effort cleanup.
  }
}

async function applyOwnerRateLimit(scope: string, identity: string, message: string, limit = 10) {
  const rateLimitKey = await getRequestRateLimitKey(scope, identity);

  await enforceRateLimit({
    scope,
    key: rateLimitKey,
    limit,
    windowSeconds: 600,
    message,
  });
}

async function createStoredFileRecord(input: {
  file: File;
  kind: "image" | "document";
  target: "villa-media" | "villa-document" | "owner-document";
  altText?: string;
}) {
  assertUploadFileAllowed(input.file, input.kind);
  const buffer = await toBuffer(input.file);
  const checksum = getChecksum(buffer);
  const stored = await getStorageService().saveFile({
    buffer,
    filename: input.file.name,
    contentType: input.file.type || "application/octet-stream",
    kind: input.kind,
    target: input.target,
    altText: input.altText,
  });

  return {
    stored,
    checksum,
  };
}

async function createUploadedFileRecord(input: {
  prisma: Awaited<ReturnType<typeof requireOwnerMutation>>["prisma"];
  sessionUserId: string;
  file: File;
  kind: "image" | "document";
  target: "villa-media" | "villa-document" | "owner-document";
  altText?: string;
}) {
  const { stored, checksum } = await createStoredFileRecord(input);

  const data: {
    storageKey: string;
    bucket: string;
    url: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    kind: "IMAGE" | "DOCUMENT" | "AVATAR" | "OTHER";
    checksum: string;
    createdByUserId: string;
    altText?: string | null;
  } = {
    storageKey: stored.storageKey,
    bucket: stored.bucket,
    url: stored.url,
    originalName: stored.originalName,
    mimeType: stored.mimeType,
    sizeBytes: stored.sizeBytes,
    kind: stored.kind.toUpperCase() as "IMAGE" | "DOCUMENT" | "AVATAR" | "OTHER",
    checksum,
    createdByUserId: input.sessionUserId,
  };

  if (stored.altText) {
    data.altText = stored.altText;
  }

  return input.prisma.uploadedFile.create({ data });
}

async function getOwnedVilla(
  prisma: Awaited<ReturnType<typeof requireOwnerMutation>>["prisma"],
  ownerId: string,
  villaId: string,
) {
  const villa = await prisma.villa.findFirst({
    where: { id: villaId, ownerId },
    include: {
      owner: {
        include: {
          documents: {
            select: {
              documentType: true,
            },
          },
        },
      },
      amenities: { select: { amenityId: true } },
      concepts: { select: { conceptId: true } },
      media: {
        select: {
          isCover: true,
        },
      },
      documents: {
        select: {
          documentType: true,
        },
      },
    },
  });

  if (!villa) {
    throw new Error("Bu villaya erişim yetkiniz yok.");
  }

  return villa;
}

async function ensureEditableVilla(
  prisma: Awaited<ReturnType<typeof requireOwnerMutation>>["prisma"],
  ownerId: string,
  villaId: string,
) {
  const villa = await getOwnedVilla(prisma, ownerId, villaId);

  if (villa.status === "ARCHIVED") {
    throw new Error("Arşivlenmiş ilan üzerinde düzenleme yapılamaz.");
  }

  return villa;
}

async function buildUniqueVillaSlug(
  prisma: Awaited<ReturnType<typeof requireOwnerMutation>>["prisma"],
  title: string,
  currentVillaId?: string,
) {
  const base = slugifyVillaTitle(title) || `villa-${randomUUID().slice(0, 8)}`;
  let candidate = base;
  let index = 2;

  while (true) {
    const existing = await prisma.villa.findFirst({
      where: {
        slug: candidate,
        ...(currentVillaId
          ? {
              NOT: {
                id: currentVillaId,
              },
            }
          : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${base}-${index}`;
    index += 1;
  }
}

function getSubmissionChecklist(villa: Awaited<ReturnType<typeof getOwnedVilla>>) {
  return getOwnerVillaChecklist({
    basicInfoComplete:
      Boolean(villa.title.trim()) &&
      villa.shortDescription.trim().length >= 20 &&
      villa.description.trim().length >= 80,
    locationComplete:
      Boolean(villa.regionId) &&
      Boolean(villa.districtId) &&
      Boolean(villa.addressPublic.trim()) &&
      Boolean(villa.addressPrivate.trim()),
    capacityComplete:
      villa.maxGuests > 0 &&
      villa.bedroomCount > 0 &&
      villa.bathroomCount > 0 &&
      villa.bedCount > 0,
    amenitiesComplete: villa.amenities.length > 0 && villa.concepts.length > 0,
    pricingComplete: Number(villa.basePrice) > 0 && villa.minNights >= 1,
    mediaCount: villa.media.length,
    hasCoverImage: villa.media.some((item) => item.isCover),
    rulesComplete:
      Array.isArray(villa.houseRules) &&
      villa.houseRules.length > 0 &&
      Boolean(villa.cancellationPolicyId) &&
      Boolean(villa.depositPolicyId),
    ownerType: villa.owner.type,
    ownerDocumentTypes: villa.owner.documents.map((item) => item.documentType),
    villaDocumentTypes: villa.documents.map((item) => item.documentType),
  });
}

export async function registerOwnerAction(formData: FormData) {
  const parsed = ownerRegistrationSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
    ownerType: formData.get("ownerType"),
    companyName: formData.get("companyName"),
    taxNumber: formData.get("taxNumber"),
    city: formData.get("city"),
    district: formData.get("district"),
    address: formData.get("address"),
  });

  const sourcePath = "/ev-sahibi/kayit";

  if (!parsed.success) {
    redirectOwnerError(
      sourcePath,
      parsed.error.issues[0]?.message || "Kayıt bilgileri doğrulanamadı.",
    );
  }

  try {
    await applyOwnerRateLimit(
      "owner-register",
      parsed.data.email.toLowerCase(),
      "Çok fazla kayıt denemesi yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.",
      5,
    );

    const prisma = getPrisma();

    if (!prisma || !isDatabaseConfigured()) {
      throw new Error(
        getDatabaseConfigurationError() ||
          "Veritabanı bağlantısı olmadan kayıt oluşturulamıyor.",
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
      include: { ownerProfile: true },
    });

    if (existingUser?.ownerProfile) {
      throw new Error("Bu e-posta ile kayıtlı bir ev sahibi hesabı zaten bulunuyor.");
    }

    if (existingUser) {
      throw new Error("Bu e-posta başka bir kullanıcı hesabı tarafından kullanılıyor.");
    }

    const existingOwnerOnly = await prisma.owner.findFirst({
      where: {
        email: parsed.data.email.toLowerCase(),
        userId: null,
      },
    });

    if (existingOwnerOnly) {
      throw new Error(
        "Bu e-posta operasyon tarafından oluşturulmuş bir kayıtla eşleşiyor. Lütfen Villawe ekibiyle iletişime geçin.",
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const { firstName, lastName } = splitFullName(parsed.data.fullName);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: parsed.data.email.toLowerCase(),
          passwordHash,
          firstName,
          lastName,
          phone: parsed.data.phone,
          status: "ACTIVE",
        },
      });

      const owner = await tx.owner.create({
        data: {
          userId: user.id,
          type: parsed.data.ownerType as never,
          status: "PENDING_REVIEW",
          displayName:
            parsed.data.ownerType === "INDIVIDUAL"
              ? parsed.data.fullName
              : parsed.data.companyName || parsed.data.fullName,
          legalName:
            parsed.data.ownerType === "INDIVIDUAL"
              ? null
              : parsed.data.companyName || null,
          contactName: parsed.data.fullName,
          email: parsed.data.email.toLowerCase(),
          phone: parsed.data.phone,
          taxNumber: parsed.data.taxNumber || null,
          city: parsed.data.city,
          districtLabel: parsed.data.district,
          address: parsed.data.address,
          verificationStatus: "PENDING",
          isActive: true,
          adminNotes: "Yeni ev sahibi kaydı admin incelemesi bekliyor.",
        },
      });

      return {
        user,
        owner,
      };
    });

    await writeOwnerAuditLog({
      actorUserId: result.user.id,
      action: "owner.registered",
      entityType: "owner",
      entityId: result.owner.id,
      message: "Yeni ev sahibi kaydı oluşturuldu.",
      metadata: {
        entityLabel: result.owner.displayName,
        status: result.owner.status,
      },
    });

    await createOwnerSession({
      userId: result.user.id,
      ownerId: result.owner.id,
      email: result.user.email,
      fullName: `${result.user.firstName} ${result.user.lastName}`.trim(),
      ownerStatus: result.owner.status,
      ownerType: result.owner.type,
      isOwner: true,
    });

    redirectOwnerSuccess("/ev-sahibi/panel", "welcome");
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "Kayıt işlemi tamamlanamadı."),
    );
  }
}

export async function loginOwnerAction(formData: FormData) {
  const parsed = ownerLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  const sourcePath = "/ev-sahibi/giris";

  if (!parsed.success) {
    redirectOwnerError(
      sourcePath,
      parsed.error.issues[0]?.message || "Giriş bilgileri doğrulanamadı.",
    );
  }

  try {
    await applyOwnerRateLimit(
      "owner-login",
      parsed.data.email.toLowerCase(),
      "Çok fazla giriş denemesi yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.",
      8,
    );

    const session = await authenticateOwner(parsed.data.email.toLowerCase(), parsed.data.password);

    if (!session) {
      throw new Error("E-posta ya da şifre doğrulanamadı.");
    }

    const prisma = getPrisma();

    if (prisma) {
      await prisma.user.update({
        where: { id: session.userId },
        data: {
          lastLoginAt: new Date(),
        },
      });
    }

    await createOwnerSession(session);
    redirectTo("/ev-sahibi/panel");
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "Giriş işlemi tamamlanamadı."),
    );
  }
}

export async function logoutOwnerAction() {
  await destroyOwnerSession();
  redirectTo("/ev-sahibi/giris");
}

export async function requestOwnerPasswordResetAction(formData: FormData) {
  const parsed = ownerPasswordResetRequestSchema.safeParse({
    email: formData.get("email"),
  });

  const sourcePath = "/ev-sahibi/sifre-yenile";

  if (!parsed.success) {
    redirectOwnerError(
      sourcePath,
      parsed.error.issues[0]?.message || "Şifre yenileme isteği doğrulanamadı.",
    );
  }

  try {
    await applyOwnerRateLimit(
      "owner-password-reset",
      parsed.data.email.toLowerCase(),
      "Çok fazla şifre yenileme isteği gönderildi. Lütfen daha sonra tekrar deneyin.",
      4,
    );

    const prisma = getPrisma();

    if (prisma) {
      const owner = await prisma.owner.findFirst({
        where: { email: parsed.data.email.toLowerCase() },
        select: { id: true, userId: true },
      });

      if (owner?.userId) {
        await writeOwnerAuditLog({
          actorUserId: owner.userId,
          action: "owner.password_reset.requested",
          entityType: "owner",
          entityId: owner.id,
          message: "Ev sahibi şifre yenileme isteği oluşturdu.",
        });
      }
    }

    redirectOwnerSuccess(sourcePath, "requested");
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "Şifre yenileme isteği alınamadı."),
    );
  }
}

export async function createOwnerVillaAction(formData: FormData) {
  const parsed = ownerVillaCreateSchema.safeParse({
    ...normalizeVillaPayload(formData),
    checkInTime: parseString(formData.get("checkInTime")) || "16:00",
    checkOutTime: parseString(formData.get("checkOutTime")) || "10:00",
    minNights: parseString(formData.get("minNights")) || "2",
    cleaningFee: parseString(formData.get("cleaningFee")) || "0",
    depositAmount: parseString(formData.get("depositAmount")) || "0",
    serviceFeeType: parseString(formData.get("serviceFeeType")) || "FIXED",
    serviceFeeValue: parseString(formData.get("serviceFeeValue")) || "0",
    extraGuestFee: parseString(formData.get("extraGuestFee")) || "0",
    isFamilyFriendly: true,
  });

  const sourcePath = "/ev-sahibi/panel/villalar/yeni";

  if (!parsed.success) {
    redirectOwnerError(
      sourcePath,
      parsed.error.issues[0]?.message || "Villa taslağı oluşturulamadı.",
    );
  }

  try {
    const { session, prisma, owner } = await requireOwnerMutation();
    const slug = await buildUniqueVillaSlug(prisma, parsed.data.title);
    const villaData: Record<string, unknown> = {
        slug,
        title: parsed.data.title,
        shortDescription: parsed.data.shortDescription,
        description: parsed.data.description,
        status: "DRAFT",
        ownerId: owner.id,
        regionId: parsed.data.regionId,
        districtId: parsed.data.districtId,
        neighborhoodId: parsed.data.neighborhoodId || null,
        addressPublic: parsed.data.addressPublic,
        addressPrivate: parsed.data.addressPrivate,
        maxGuests: parsed.data.maxGuests,
        bedroomCount: parsed.data.bedroomCount,
        bathroomCount: parsed.data.bathroomCount,
        bedCount: parsed.data.bedCount,
        checkInTime: parsed.data.checkInTime,
        checkOutTime: parsed.data.checkOutTime,
        minNights: parsed.data.minNights,
        basePrice: parsed.data.basePrice,
        cleaningFee: parsed.data.cleaningFee,
        depositAmount: parsed.data.depositAmount,
        serviceFeeType: parsed.data.serviceFeeType,
        serviceFeeValue: parsed.data.serviceFeeValue,
        extraGuestFee: parsed.data.extraGuestFee,
        hasPrivatePool: parsed.data.hasPrivatePool || false,
        hasHeatedPool: parsed.data.hasHeatedPool || false,
        hasJacuzzi: parsed.data.hasJacuzzi || false,
        isShelteredPool: parsed.data.isShelteredPool || false,
        isConservativeFriendly: parsed.data.isConservativeFriendly || false,
        isPetFriendly: parsed.data.isPetFriendly || false,
        isChildFriendly: parsed.data.isChildFriendly || false,
        isFamilyFriendly: parsed.data.isFamilyFriendly || false,
        hasSeaView: parsed.data.hasSeaView || false,
        hasNatureView: parsed.data.hasNatureView || false,
        nearBeach: parsed.data.nearBeach || false,
        nearCenter: parsed.data.nearCenter || false,
        hasBarbecue: parsed.data.hasBarbecue || false,
        hasFireplace: parsed.data.hasFireplace || false,
        hasParking: parsed.data.hasParking || false,
        hasAirConditioning: parsed.data.hasAirConditioning || false,
        hasInternet: parsed.data.hasInternet || false,
        isWheelchairFriendly: parsed.data.isWheelchairFriendly || false,
        houseRules: parsed.data.houseRules,
        poolDetails: parsed.data.poolDetails,
        nearbyPlaces: parsed.data.nearbyPlaces,
        cancellationPolicyId: parsed.data.cancellationPolicyId || null,
        depositPolicyId: parsed.data.depositPolicyId || null,
        verificationStatus: "PENDING",
        verification: {
          create: {},
        },
        location: {
          create: {},
        },
    };

    if (parsed.data.amenities.length) {
      villaData.amenities = {
        createMany: {
          data: parsed.data.amenities.map((amenityId) => ({
            amenityId,
          })),
          skipDuplicates: true,
        },
      };
    }

    if (parsed.data.concepts.length) {
      villaData.concepts = {
        createMany: {
          data: parsed.data.concepts.map((conceptId) => ({
            conceptId,
          })),
          skipDuplicates: true,
        },
      };
    }

    const villa = await prisma.villa.create({
      data: villaData as never,
    });

    await writeOwnerAuditLog({
      actorUserId: session.userId,
      action: "owner.villa.created",
      entityType: "villa",
      entityId: villa.id,
      message: "Ev sahibi yeni villa taslağı oluşturdu.",
      metadata: {
        entityLabel: villa.title,
      },
    });

    revalidatePath("/ev-sahibi/panel");
    revalidatePath("/ev-sahibi/panel/villalar");
    redirectOwnerSuccess(`/ev-sahibi/panel/villalar/${villa.id}`, "created");
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "Villa taslağı oluşturulamadı."),
    );
  }
}

export async function updateOwnerVillaBasicsAction(formData: FormData) {
  const normalized = normalizeVillaPayload(formData);
  const villaId = parseString(formData.get("villaId"));
  const sourcePath = `/ev-sahibi/panel/villalar/${villaId}`;
  const parsed = ownerVillaBasicsSchema.safeParse({
    ...normalized,
    villaId,
  });

  if (!parsed.success) {
    redirectOwnerError(
      sourcePath,
      parsed.error.issues[0]?.message || "İlan bilgileri güncellenemedi.",
    );
  }

  try {
    const { session, prisma, owner } = await requireOwnerMutation();
    const currentVilla = await ensureEditableVilla(prisma, owner.id, parsed.data.villaId);
    const slug = await buildUniqueVillaSlug(prisma, parsed.data.title, parsed.data.villaId);
    const shouldReturnToReview = currentVilla.status === "PUBLISHED";

    await prisma.$transaction(async (tx) => {
      await tx.villa.update({
        where: { id: parsed.data.villaId },
        data: {
          slug,
          title: parsed.data.title,
          shortDescription: parsed.data.shortDescription,
          description: parsed.data.description,
          regionId: parsed.data.regionId,
          districtId: parsed.data.districtId,
          neighborhoodId: parsed.data.neighborhoodId || null,
          addressPublic: parsed.data.addressPublic,
          addressPrivate: parsed.data.addressPrivate,
          maxGuests: parsed.data.maxGuests,
          bedroomCount: parsed.data.bedroomCount,
          bathroomCount: parsed.data.bathroomCount,
          bedCount: parsed.data.bedCount,
          checkInTime: parsed.data.checkInTime,
          checkOutTime: parsed.data.checkOutTime,
          minNights: parsed.data.minNights,
          basePrice: parsed.data.basePrice,
          cleaningFee: parsed.data.cleaningFee,
          depositAmount: parsed.data.depositAmount,
          serviceFeeType: parsed.data.serviceFeeType,
          serviceFeeValue: parsed.data.serviceFeeValue,
          extraGuestFee: parsed.data.extraGuestFee,
          hasPrivatePool: parsed.data.hasPrivatePool || false,
          hasHeatedPool: parsed.data.hasHeatedPool || false,
          hasJacuzzi: parsed.data.hasJacuzzi || false,
          isShelteredPool: parsed.data.isShelteredPool || false,
          isConservativeFriendly: parsed.data.isConservativeFriendly || false,
          isPetFriendly: parsed.data.isPetFriendly || false,
          isChildFriendly: parsed.data.isChildFriendly || false,
          isFamilyFriendly: parsed.data.isFamilyFriendly || false,
          hasSeaView: parsed.data.hasSeaView || false,
          hasNatureView: parsed.data.hasNatureView || false,
          nearBeach: parsed.data.nearBeach || false,
          nearCenter: parsed.data.nearCenter || false,
          hasBarbecue: parsed.data.hasBarbecue || false,
          hasFireplace: parsed.data.hasFireplace || false,
          hasParking: parsed.data.hasParking || false,
          hasAirConditioning: parsed.data.hasAirConditioning || false,
          hasInternet: parsed.data.hasInternet || false,
          isWheelchairFriendly: parsed.data.isWheelchairFriendly || false,
          houseRules: parsed.data.houseRules,
          poolDetails: parsed.data.poolDetails,
          nearbyPlaces: parsed.data.nearbyPlaces,
          cancellationPolicyId: parsed.data.cancellationPolicyId || null,
          depositPolicyId: parsed.data.depositPolicyId || null,
          status: shouldReturnToReview ? "PENDING_REVIEW" : currentVilla.status,
          reviewRequestedAt: shouldReturnToReview ? new Date() : currentVilla.reviewRequestedAt,
          publishedAt: shouldReturnToReview ? null : currentVilla.publishedAt,
          ownerRevisionNotes: shouldReturnToReview
            ? "Villa sahibi ilanı güncelledi. Yeniden inceleme gerekiyor."
            : currentVilla.ownerRevisionNotes,
        },
      });

      await tx.villaAmenity.deleteMany({
        where: { villaId: parsed.data.villaId },
      });
      await tx.villaConcept.deleteMany({
        where: { villaId: parsed.data.villaId },
      });

      if (parsed.data.amenities.length) {
        await tx.villaAmenity.createMany({
          data: parsed.data.amenities.map((amenityId) => ({
            villaId: parsed.data.villaId,
            amenityId,
          })),
          skipDuplicates: true,
        });
      }

      if (parsed.data.concepts.length) {
        await tx.villaConcept.createMany({
          data: parsed.data.concepts.map((conceptId) => ({
            villaId: parsed.data.villaId,
            conceptId,
          })),
          skipDuplicates: true,
        });
      }
    });

    await writeOwnerAuditLog({
      actorUserId: session.userId,
      action: "owner.villa.updated",
      entityType: "villa",
      entityId: parsed.data.villaId,
      message: shouldReturnToReview
        ? "Ev sahibi ilanı güncelledi ve ilan yeniden incelemeye alındı."
        : "Ev sahibi ilan detaylarını güncelledi.",
      metadata: {
        entityLabel: parsed.data.title,
        statusChangedTo: shouldReturnToReview ? "PENDING_REVIEW" : currentVilla.status,
      },
    });

    revalidatePath("/ev-sahibi/panel");
    revalidatePath("/ev-sahibi/panel/villalar");
    revalidatePath(sourcePath);
    revalidatePath(`/villalar/${currentVilla.slug}`);
    revalidatePath("/villa-kiralama");
    redirectOwnerSuccess(sourcePath);
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "İlan bilgileri güncellenemedi."),
    );
  }
}

export async function submitOwnerVillaForReviewAction(formData: FormData) {
  const parsed = ownerVillaReviewSubmitSchema.safeParse({
    villaId: formData.get("villaId"),
  });
  const villaId = parseString(formData.get("villaId"));
  const sourcePath = `/ev-sahibi/panel/villalar/${villaId}`;

  if (!parsed.success) {
    redirectOwnerError(
      sourcePath,
      parsed.error.issues[0]?.message || "İlan incelemeye gönderilemedi.",
    );
  }

  try {
    const { session, prisma, owner } = await requireOwnerMutation();
    const villa = await ensureEditableVilla(prisma, owner.id, parsed.data.villaId);

    if (villa.status === "SUSPENDED") {
      throw new Error("Askıya alınmış ilanlar doğrudan yeniden incelemeye gönderilemez.");
    }

    const checklist = getSubmissionChecklist(villa);
    const warnings = getOwnerSubmitWarnings(checklist);

    if (!canOwnerSubmitVillaForReview(checklist)) {
      throw new Error(
        warnings[0] || "İlanınızı incelemeye göndermek için eksik alanları tamamlayın.",
      );
    }

    await prisma.villa.update({
      where: { id: parsed.data.villaId },
      data: {
        status: "PENDING_REVIEW",
        reviewRequestedAt: new Date(),
      },
    });

    await writeOwnerAuditLog({
      actorUserId: session.userId,
      action: "owner.villa.submitted_for_review",
      entityType: "villa",
      entityId: parsed.data.villaId,
      message: "Ev sahibi ilanı admin incelemesine gönderdi.",
      metadata: {
        entityLabel: villa.title,
      },
    });

    revalidatePath("/ev-sahibi/panel");
    revalidatePath("/ev-sahibi/panel/villalar");
    revalidatePath(sourcePath);
    revalidatePath("/admin/villas");
    redirectOwnerSuccess(sourcePath, "reviewRequested");
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "İlan incelemeye gönderilemedi."),
    );
  }
}

export async function uploadOwnerVillaMediaAction(formData: FormData) {
  const villaId = parseString(formData.get("villaId"));
  const sourcePath = `/ev-sahibi/panel/villalar/${villaId}/fotograflar`;
  const altText = parseString(formData.get("altText"));
  const file = formData.get("file");

  if (!(file instanceof File)) {
    redirectOwnerError(sourcePath, "Lütfen bir fotoğraf seçin.");
  }

  try {
    const { session, prisma, owner } = await requireOwnerMutation();
    await ensureEditableVilla(prisma, owner.id, villaId);

    await applyOwnerRateLimit(
      "owner-upload",
      `${session.userId}:${villaId}:media:${file.name}`,
      "Kısa sürede çok fazla görsel yüklediniz. Lütfen biraz sonra tekrar deneyin.",
      20,
    );

    const uploadedFile = await createUploadedFileRecord({
      prisma,
      sessionUserId: session.userId,
      file,
      kind: "image",
      target: "villa-media",
      altText,
    });

    try {
      const currentMediaCount = await prisma.villaMedia.count({
        where: { villaId },
      });

      await prisma.villaMedia.create({
        data: {
          villaId,
          fileId: uploadedFile.id,
          mediaType: "image",
          altText: altText || uploadedFile.originalName,
          sortOrder: currentMediaCount,
          isCover: currentMediaCount === 0,
        },
      });
    } catch (error) {
      await prisma.uploadedFile.deleteMany({ where: { id: uploadedFile.id } });
      await safeDeleteStoredFile(uploadedFile.storageKey);
      throw error;
    }

    await writeOwnerAuditLog({
      actorUserId: session.userId,
      action: "owner.villa.media.uploaded",
      entityType: "villa",
      entityId: villaId,
      message: "Ev sahibi villa fotoğrafı yükledi.",
    });

    revalidatePath(sourcePath);
    revalidatePath(`/ev-sahibi/panel/villalar/${villaId}`);
    redirectOwnerSuccess(sourcePath, "uploadSaved");
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "Fotoğraf yüklenemedi."),
    );
  }
}

export async function updateOwnerVillaMediaAction(formData: FormData) {
  const parsed = villaMediaUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = `/ev-sahibi/panel/villalar/${parseString(formData.get("villaId"))}/fotograflar`;

  if (!parsed.success) {
    redirectOwnerError(
      sourcePath,
      parsed.error.issues[0]?.message || "Fotoğraf bilgileri güncellenemedi.",
    );
  }

  try {
    const { session, prisma, owner } = await requireOwnerMutation();
    const media = await prisma.villaMedia.findFirst({
      where: {
        id: parsed.data.mediaId,
        villa: {
          id: parsed.data.villaId,
          ownerId: owner.id,
        },
      },
    });

    if (!media) {
      throw new Error("Bu fotoğraf üzerinde işlem yetkiniz yok.");
    }

    await prisma.villaMedia.update({
      where: { id: parsed.data.mediaId },
      data: {
        altText: parsed.data.altText,
        sortOrder: parsed.data.sortOrder,
      },
    });

    await prisma.uploadedFile.updateMany({
      where: {
        villaMedia: {
          some: {
            id: parsed.data.mediaId,
            villa: { ownerId: owner.id },
          },
        },
      },
      data: {
        altText: parsed.data.altText,
      },
    });

    await writeOwnerAuditLog({
      actorUserId: session.userId,
      action: "owner.villa.media.updated",
      entityType: "villa",
      entityId: parsed.data.villaId,
      message: "Ev sahibi villa fotoğrafı bilgilerini güncelledi.",
    });

    revalidatePath(sourcePath);
    redirectOwnerSuccess(sourcePath, "mediaSaved");
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "Fotoğraf bilgileri güncellenemedi."),
    );
  }
}

export async function setOwnerVillaCoverAction(formData: FormData) {
  const parsed = villaCoverSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = `/ev-sahibi/panel/villalar/${parseString(formData.get("villaId"))}/fotograflar`;

  if (!parsed.success) {
    redirectOwnerError(
      sourcePath,
      parsed.error.issues[0]?.message || "Kapak fotoğrafı seçilemedi.",
    );
  }

  try {
    const { session, prisma, owner } = await requireOwnerMutation();
    const media = await prisma.villaMedia.findFirst({
      where: {
        id: parsed.data.mediaId,
        villa: {
          id: parsed.data.villaId,
          ownerId: owner.id,
        },
      },
    });

    if (!media) {
      throw new Error("Bu fotoğraf üzerinde işlem yetkiniz yok.");
    }

    await prisma.$transaction([
      prisma.villaMedia.updateMany({
        where: { villaId: parsed.data.villaId },
        data: { isCover: false },
      }),
      prisma.villaMedia.update({
        where: { id: parsed.data.mediaId },
        data: { isCover: true },
      }),
    ]);

    await writeOwnerAuditLog({
      actorUserId: session.userId,
      action: "owner.villa.media.cover_set",
      entityType: "villa",
      entityId: parsed.data.villaId,
      message: "Ev sahibi kapak fotoğrafını güncelledi.",
    });

    revalidatePath(sourcePath);
    revalidatePath(`/ev-sahibi/panel/villalar/${parsed.data.villaId}`);
    redirectOwnerSuccess(sourcePath, "mediaSaved");
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "Kapak fotoğrafı seçilemedi."),
    );
  }
}

export async function deleteOwnerVillaMediaAction(formData: FormData) {
  const parsed = villaMediaDeleteSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = `/ev-sahibi/panel/villalar/${parseString(formData.get("villaId"))}/fotograflar`;

  if (!parsed.success) {
    redirectOwnerError(
      sourcePath,
      parsed.error.issues[0]?.message || "Fotoğraf silinemedi.",
    );
  }

  try {
    const { session, prisma, owner } = await requireOwnerMutation();
    const media = await prisma.villaMedia.findFirst({
      where: {
        id: parsed.data.mediaId,
        villa: {
          id: parsed.data.villaId,
          ownerId: owner.id,
        },
      },
      include: { file: true },
    });

    if (!media) {
      throw new Error("Bu fotoğraf üzerinde işlem yetkiniz yok.");
    }

    await prisma.$transaction([
      prisma.villaMedia.delete({ where: { id: media.id } }),
      prisma.uploadedFile.delete({ where: { id: media.fileId } }),
    ]);

    await safeDeleteStoredFile(media.file.storageKey);

    await writeOwnerAuditLog({
      actorUserId: session.userId,
      action: "owner.villa.media.deleted",
      entityType: "villa",
      entityId: parsed.data.villaId,
      message: "Ev sahibi villa fotoğrafını sildi.",
    });

    revalidatePath(sourcePath);
    revalidatePath(`/ev-sahibi/panel/villalar/${parsed.data.villaId}`);
    redirectOwnerSuccess(sourcePath, "mediaSaved");
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "Fotoğraf silinemedi."),
    );
  }
}

export async function uploadOwnerPrivateDocumentAction(formData: FormData) {
  const documentScope = parseString(formData.get("documentScope"));
  const documentType = parseString(formData.get("documentType"));
  const note = parseString(formData.get("note"));
  const villaId = parseString(formData.get("villaId"));
  const sourcePath = `/ev-sahibi/panel/villalar/${villaId}/belgeler`;
  const file = formData.get("file");

  if (!(file instanceof File)) {
    redirectOwnerError(sourcePath, "Lütfen bir belge seçin.");
  }

  if (documentScope !== "owner" && documentScope !== "villa") {
    redirectOwnerError(sourcePath, "Belge hedefi geçersiz.");
  }

  assertDocumentTypeAllowed(documentType);

  try {
    const { session, prisma, owner } = await requireOwnerMutation();

    if (documentScope === "villa") {
      await ensureEditableVilla(prisma, owner.id, villaId);
    }

    await applyOwnerRateLimit(
      "owner-upload",
      `${session.userId}:${documentScope}:${villaId}:${file.name}`,
      "Kısa sürede çok fazla belge yüklediniz. Lütfen biraz sonra tekrar deneyin.",
      20,
    );

    const uploadedFile = await createUploadedFileRecord({
      prisma,
      sessionUserId: session.userId,
      file,
      kind: "document",
      target: documentScope === "owner" ? "owner-document" : "villa-document",
    });

    try {
      if (documentScope === "owner") {
        await prisma.ownerDocument.create({
          data: {
            ownerId: owner.id,
            fileId: uploadedFile.id,
            documentType,
            note: note || null,
          },
        });
      } else {
        await prisma.villaDocument.create({
          data: {
            villaId,
            fileId: uploadedFile.id,
            documentType,
            note: note || null,
          },
        });
      }
    } catch (error) {
      await prisma.uploadedFile.deleteMany({ where: { id: uploadedFile.id } });
      await safeDeleteStoredFile(uploadedFile.storageKey);
      throw error;
    }

    await writeOwnerAuditLog({
      actorUserId: session.userId,
      action: documentScope === "owner" ? "owner.document.uploaded" : "owner.villa.document.uploaded",
      entityType: documentScope === "owner" ? "owner" : "villa",
      entityId: documentScope === "owner" ? owner.id : villaId,
      message:
        documentScope === "owner"
          ? "Ev sahibi doğrulama belgesi yükledi."
          : "Ev sahibi villa belgesi yükledi.",
      metadata: {
        documentType,
      },
    });

    revalidatePath(sourcePath);
    redirectOwnerSuccess(sourcePath, "documentSaved");
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "Belge yüklenemedi."),
    );
  }
}

export async function deleteOwnerPrivateDocumentAction(formData: FormData) {
  const documentScope = parseString(formData.get("documentScope"));
  const documentId = parseString(formData.get("documentId"));
  const villaId = parseString(formData.get("villaId"));
  const sourcePath = `/ev-sahibi/panel/villalar/${villaId}/belgeler`;

  if (!documentId || (documentScope !== "owner" && documentScope !== "villa")) {
    redirectOwnerError(sourcePath, "Silinecek belge bulunamadı.");
  }

  try {
    const { session, prisma, owner } = await requireOwnerMutation();

    if (documentScope === "owner") {
      const document = await prisma.ownerDocument.findFirst({
        where: {
          id: documentId,
          ownerId: owner.id,
        },
        include: { file: true },
      });

      if (!document) {
        throw new Error("Bu belge üzerinde işlem yetkiniz yok.");
      }

      await prisma.$transaction([
        prisma.ownerDocument.delete({ where: { id: document.id } }),
        prisma.uploadedFile.delete({ where: { id: document.fileId } }),
      ]);

      await safeDeleteStoredFile(document.file.storageKey);
    } else {
      const document = await prisma.villaDocument.findFirst({
        where: {
          id: documentId,
          villa: {
            id: villaId,
            ownerId: owner.id,
          },
        },
        include: { file: true },
      });

      if (!document) {
        throw new Error("Bu belge üzerinde işlem yetkiniz yok.");
      }

      await prisma.$transaction([
        prisma.villaDocument.delete({ where: { id: document.id } }),
        prisma.uploadedFile.delete({ where: { id: document.fileId } }),
      ]);

      await safeDeleteStoredFile(document.file.storageKey);
    }

    await writeOwnerAuditLog({
      actorUserId: session.userId,
      action: documentScope === "owner" ? "owner.document.deleted" : "owner.villa.document.deleted",
      entityType: documentScope === "owner" ? "owner" : "villa",
      entityId: documentScope === "owner" ? owner.id : villaId,
      message: "Ev sahibi bir belge sildi.",
    });

    revalidatePath(sourcePath);
    redirectOwnerSuccess(sourcePath, "documentSaved");
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "Belge silinemedi."),
    );
  }
}

export async function updateOwnerVillaPricingAction(formData: FormData) {
  const parsed = ownerVillaPricingSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = `/ev-sahibi/panel/villalar/${parseString(formData.get("villaId"))}/fiyatlandirma`;

  if (!parsed.success) {
    redirectOwnerError(
      sourcePath,
      parsed.error.issues[0]?.message || "Fiyat bilgileri güncellenemedi.",
    );
  }

  try {
    const { session, prisma, owner } = await requireOwnerMutation();
    await ensureEditableVilla(prisma, owner.id, parsed.data.villaId);

    await prisma.villa.update({
      where: { id: parsed.data.villaId },
      data: {
        basePrice: parsed.data.basePrice,
        cleaningFee: parsed.data.cleaningFee,
        depositAmount: parsed.data.depositAmount,
        serviceFeeType: parsed.data.serviceFeeType,
        serviceFeeValue: parsed.data.serviceFeeValue,
        extraGuestFee: parsed.data.extraGuestFee,
        minNights: parsed.data.minNights,
      },
    });

    await writeOwnerAuditLog({
      actorUserId: session.userId,
      action: "owner.villa.pricing.updated",
      entityType: "villa",
      entityId: parsed.data.villaId,
      message: "Ev sahibi temel fiyat bilgilerini güncelledi.",
    });

    revalidatePath(sourcePath);
    revalidatePath(`/ev-sahibi/panel/villalar/${parsed.data.villaId}`);
    redirectOwnerSuccess(sourcePath, "pricingSaved");
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "Fiyat bilgileri güncellenemedi."),
    );
  }
}

export async function saveOwnerSeasonPriceAction(formData: FormData) {
  const parsed = ownerSeasonPriceSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = `/ev-sahibi/panel/villalar/${parseString(formData.get("villaId"))}/fiyatlandirma`;

  if (!parsed.success) {
    redirectOwnerError(
      sourcePath,
      parsed.error.issues[0]?.message || "Sezon fiyatı kaydedilemedi.",
    );
  }

  try {
    const { session, prisma, owner } = await requireOwnerMutation();
    await ensureEditableVilla(prisma, owner.id, parsed.data.villaId);

    const seasonId = parsed.data.seasonId || randomUUID();

    await prisma.seasonPrice.upsert({
      where: { id: seasonId },
      update: {
        villaId: parsed.data.villaId,
        name: parsed.data.name,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        nightlyPrice: parsed.data.nightlyPrice,
        minNightsOverride: parsed.data.minNightsOverride ?? null,
        cleaningFeeOverride: parsed.data.cleaningFeeOverride ?? null,
        depositOverride: parsed.data.depositOverride ?? null,
        serviceFeeOverride: parsed.data.serviceFeeOverride ?? null,
        extraGuestFeeOverride: parsed.data.extraGuestFeeOverride ?? null,
      },
      create: {
        id: seasonId,
        villaId: parsed.data.villaId,
        name: parsed.data.name,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        nightlyPrice: parsed.data.nightlyPrice,
        minNightsOverride: parsed.data.minNightsOverride ?? null,
        cleaningFeeOverride: parsed.data.cleaningFeeOverride ?? null,
        depositOverride: parsed.data.depositOverride ?? null,
        serviceFeeOverride: parsed.data.serviceFeeOverride ?? null,
        extraGuestFeeOverride: parsed.data.extraGuestFeeOverride ?? null,
      },
    });

    await writeOwnerAuditLog({
      actorUserId: session.userId,
      action: parsed.data.seasonId ? "owner.villa.season.updated" : "owner.villa.season.created",
      entityType: "villa",
      entityId: parsed.data.villaId,
      message: "Ev sahibi sezon fiyatı kaydetti.",
      metadata: {
        seasonName: parsed.data.name,
      },
    });

    revalidatePath(sourcePath);
    redirectOwnerSuccess(sourcePath, "seasonSaved");
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "Sezon fiyatı kaydedilemedi."),
    );
  }
}

export async function deleteOwnerSeasonPriceAction(formData: FormData) {
  const villaId = parseString(formData.get("villaId"));
  const seasonId = parseString(formData.get("seasonId"));
  const sourcePath = `/ev-sahibi/panel/villalar/${villaId}/fiyatlandirma`;

  if (!villaId || !seasonId) {
    redirectOwnerError(sourcePath, "Silinecek sezon kaydı bulunamadı.");
  }

  try {
    const { session, prisma, owner } = await requireOwnerMutation();
    await ensureEditableVilla(prisma, owner.id, villaId);

    const season = await prisma.seasonPrice.findFirst({
      where: {
        id: seasonId,
        villa: {
          id: villaId,
          ownerId: owner.id,
        },
      },
    });

    if (!season) {
      throw new Error("Bu sezon kaydı üzerinde işlem yetkiniz yok.");
    }

    await prisma.seasonPrice.delete({ where: { id: seasonId } });

    await writeOwnerAuditLog({
      actorUserId: session.userId,
      action: "owner.villa.season.deleted",
      entityType: "villa",
      entityId: villaId,
      message: "Ev sahibi sezon fiyatı kaydını sildi.",
      metadata: {
        seasonId,
      },
    });

    revalidatePath(sourcePath);
    redirectOwnerSuccess(sourcePath, "seasonSaved");
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "Sezon kaydı silinemedi."),
    );
  }
}

export async function createOwnerAvailabilityBlockAction(formData: FormData) {
  const parsed = ownerAvailabilityBlockSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = `/ev-sahibi/panel/villalar/${parseString(formData.get("villaId"))}/musaitlik`;

  if (!parsed.success) {
    redirectOwnerError(
      sourcePath,
      parsed.error.issues[0]?.message || "Müsaitlik blokesi oluşturulamadı.",
    );
  }

  try {
    const { session, prisma, owner } = await requireOwnerMutation();
    await ensureEditableVilla(prisma, owner.id, parsed.data.villaId);

    const startDate = new Date(parsed.data.startDate);
    const endDate = new Date(parsed.data.endDate);

    const conflictingBlock = await prisma.availabilityBlock.findFirst({
      where: {
        villaId: parsed.data.villaId,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    if (conflictingBlock) {
      throw new Error("Seçilen tarih aralığı mevcut bir bloke ile çakışıyor.");
    }

    const mappedReason = mapOwnerReasonCode(parsed.data.reasonCode);

    await prisma.availabilityBlock.create({
      data: {
        villaId: parsed.data.villaId,
        startDate,
        endDate,
        type: mappedReason.type,
        reason: parsed.data.reason || mappedReason.defaultReason,
      },
    });

    await writeOwnerAuditLog({
      actorUserId: session.userId,
      action: "owner.villa.availability.created",
      entityType: "villa",
      entityId: parsed.data.villaId,
      message: "Ev sahibi müsaitlik blokesi ekledi.",
      metadata: {
        reasonCode: parsed.data.reasonCode,
      },
    });

    revalidatePath(sourcePath);
    redirectOwnerSuccess(sourcePath, "availabilitySaved");
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "Müsaitlik blokesi oluşturulamadı."),
    );
  }
}

export async function deleteOwnerAvailabilityBlockAction(formData: FormData) {
  const villaId = parseString(formData.get("villaId"));
  const blockId = parseString(formData.get("blockId"));
  const sourcePath = `/ev-sahibi/panel/villalar/${villaId}/musaitlik`;

  if (!villaId || !blockId) {
    redirectOwnerError(sourcePath, "Silinecek bloke kaydı bulunamadı.");
  }

  try {
    const { session, prisma, owner } = await requireOwnerMutation();
    await ensureEditableVilla(prisma, owner.id, villaId);

    const block = await prisma.availabilityBlock.findFirst({
      where: {
        id: blockId,
        villa: {
          id: villaId,
          ownerId: owner.id,
        },
      },
    });

    if (!block) {
      throw new Error("Bu bloke kaydı üzerinde işlem yetkiniz yok.");
    }

    await prisma.availabilityBlock.delete({ where: { id: blockId } });

    await writeOwnerAuditLog({
      actorUserId: session.userId,
      action: "owner.villa.availability.deleted",
      entityType: "villa",
      entityId: villaId,
      message: "Ev sahibi müsaitlik blokesi kaldırdı.",
    });

    revalidatePath(sourcePath);
    redirectOwnerSuccess(sourcePath, "availabilitySaved");
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "Bloke kaydı silinemedi."),
    );
  }
}

export async function markOwnerInquirySeenAction(formData: FormData) {
  const parsed = ownerInquirySeenSchema.safeParse({
    inquiryId: formData.get("inquiryId"),
  });
  const inquiryId = parseString(formData.get("inquiryId"));
  const sourcePath = `/ev-sahibi/panel/talepler/${inquiryId}`;

  if (!parsed.success) {
    redirectOwnerError(
      sourcePath,
      parsed.error.issues[0]?.message || "Talep durumu güncellenemedi.",
    );
  }

  try {
    const { session, prisma, owner } = await requireOwnerMutation();
    const inquiry = await prisma.inquiry.findFirst({
      where: {
        id: parsed.data.inquiryId,
        villa: {
          ownerId: owner.id,
        },
      },
      include: {
        villa: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!inquiry) {
      throw new Error("Bu talep üzerinde işlem yetkiniz yok.");
    }

    await prisma.inquiry.update({
      where: { id: inquiry.id },
      data: {
        ownerSeenAt: inquiry.ownerSeenAt || new Date(),
      },
    });

    await writeOwnerAuditLog({
      actorUserId: session.userId,
      action: "owner.inquiry.seen",
      entityType: "inquiry",
      entityId: inquiry.id,
      message: "Ev sahibi talebi görüntülendi olarak işaretledi.",
      metadata: {
        villaId: inquiry.villa.id,
      },
    });

    revalidatePath("/ev-sahibi/panel/talepler");
    revalidatePath(sourcePath);
    redirectOwnerSuccess(sourcePath, "seenSaved");
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "Talep durumu güncellenemedi."),
    );
  }
}

export async function saveOwnerInquiryNoteAction(formData: FormData) {
  const parsed = ownerInquiryNoteSchema.safeParse({
    inquiryId: formData.get("inquiryId"),
    ownerNote: formData.get("ownerNote"),
  });
  const inquiryId = parseString(formData.get("inquiryId"));
  const sourcePath = `/ev-sahibi/panel/talepler/${inquiryId}`;

  if (!parsed.success) {
    redirectOwnerError(
      sourcePath,
      parsed.error.issues[0]?.message || "Talep notu kaydedilemedi.",
    );
  }

  try {
    const { session, prisma, owner } = await requireOwnerMutation();
    const inquiry = await prisma.inquiry.findFirst({
      where: {
        id: parsed.data.inquiryId,
        villa: {
          ownerId: owner.id,
        },
      },
      include: {
        villa: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!inquiry) {
      throw new Error("Bu talep üzerinde işlem yetkiniz yok.");
    }

    await prisma.inquiry.update({
      where: { id: inquiry.id },
      data: {
        ownerSeenAt: inquiry.ownerSeenAt || new Date(),
        ownerNote: parsed.data.ownerNote,
      },
    });

    await writeOwnerAuditLog({
      actorUserId: session.userId,
      action: "owner.inquiry.note_saved",
      entityType: "inquiry",
      entityId: inquiry.id,
      message: "Ev sahibi talep notu kaydetti.",
      metadata: {
        villaId: inquiry.villa.id,
      },
    });

    revalidatePath("/ev-sahibi/panel/talepler");
    revalidatePath(sourcePath);
    redirectOwnerSuccess(sourcePath, "noteSaved");
  } catch (error) {
    redirectOwnerError(
      sourcePath,
      formatOwnerMutationError(error, "Talep notu kaydedilemedi."),
    );
  }
}
