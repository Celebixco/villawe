"use server";

import { createHash } from "crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  formatMutationError,
  getActionRedirect,
  requireAdminMutation,
  writeAuditLog,
} from "@/features/admin/action-helpers";
import { authenticateAdmin } from "@/features/admin/auth";
import {
  getVillaPublishWarnings,
  isVillaFullyVerified,
} from "@/features/admin/villa-publishing";
import {
  createAdminSession,
  destroyAdminSession,
} from "@/lib/auth/session";
import { enforceRateLimit, getRequestRateLimitKey } from "@/lib/rate-limit";
import { getStorageService } from "@/lib/storage/service";
import {
  adminLoginSchema,
  availabilityBlockSchema,
  blogPostFormSchema,
  inquiryStatusFormSchema,
  ownerDocumentVerificationSchema,
  ownerFormSchema,
  redirectFormSchema,
  reviewModerationFormSchema,
  reviewReplyFormSchema,
  seoPageFormSchema,
  settingFormSchema,
  villaBasicsSchema,
  villaCoverSchema,
  villaCreateSchema,
  villaDocumentVerificationSchema,
  villaMediaDeleteSchema,
  villaMediaUpdateSchema,
  villaPricingSchema,
  villaStatusActionSchema,
  villaVerificationSchema,
} from "@/lib/validation/forms";

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]);

const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

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

function getErrorRedirect(path: string, message: string) {
  return getActionRedirect(path, "error", message);
}

function getSuccessRedirect(path: string, key = "saved") {
  return getActionRedirect(path, key, "1");
}

function parseString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

async function toBuffer(file: File) {
  return Buffer.from(await file.arrayBuffer());
}

function getChecksum(buffer: Buffer) {
  return createHash("sha1").update(buffer).digest("hex");
}

function assertDocumentTypeAllowed(value: string) {
  if (!ALLOWED_DOCUMENT_TYPES.has(value)) {
    throw new Error("Geçersiz doküman tipi seçildi.");
  }
}

function assertUploadFileAllowed(file: File, kind: "image" | "document") {
  if (!file.size) {
    throw new Error("Boş dosya yüklenemez.");
  }

  if (kind === "image") {
    if (!IMAGE_MIME_TYPES.has(file.type)) {
      throw new Error("Yalnızca JPG, PNG, WebP, AVIF veya SVG görselleri yüklenebilir.");
    }

    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error("Görsel boyutu 10 MB sınırını aşamaz.");
    }

    return;
  }

  if (!DOCUMENT_MIME_TYPES.has(file.type)) {
    throw new Error("Yalnızca PDF, JPG, PNG veya WebP dokümanları yüklenebilir.");
  }

  if (file.size > MAX_DOCUMENT_BYTES) {
    throw new Error("Doküman boyutu 12 MB sınırını aşamaz.");
  }
}

async function createStoredFileRecord(input: {
  sessionUserId: string;
  file: File;
  kind: "image" | "document";
  target: "villa-media" | "villa-document" | "owner-document";
  altText?: string | undefined;
}) {
  assertUploadFileAllowed(input.file, input.kind);
  const buffer = await toBuffer(input.file);
  const checksum = getChecksum(buffer);
  const storage = getStorageService();
  const stored = await storage.saveFile({
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
  prisma: Awaited<ReturnType<typeof requireAdminMutation>>["prisma"];
  sessionUserId: string;
  file: File;
  kind: "image" | "document";
  target: "villa-media" | "villa-document" | "owner-document";
  altText?: string | undefined;
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

function getVillaPublishError(path: string, warnings: string[]) {
  return redirectTo(getErrorRedirect(path, warnings[0] || "Villa yayına alınamıyor."));
}

async function getVillaReadiness(prisma: Awaited<ReturnType<typeof requireAdminMutation>>["prisma"], villaId: string) {
  const villa = await prisma.villa.findUnique({
    where: { id: villaId },
    include: {
      verification: true,
      media: {
        select: {
          id: true,
          isCover: true,
        },
      },
    },
  });

  if (!villa) {
    throw new Error("Villa kaydı bulunamadı.");
  }

  return {
    villa,
    warnings: getVillaPublishWarnings({
      title: villa.title,
      slug: villa.slug,
      shortDescription: villa.shortDescription,
      description: villa.description,
      ownerId: villa.ownerId,
      regionId: villa.regionId,
      districtId: villa.districtId,
      addressPublic: villa.addressPublic,
      addressPrivate: villa.addressPrivate,
      maxGuests: villa.maxGuests,
      bedroomCount: villa.bedroomCount,
      bathroomCount: villa.bathroomCount,
      bedCount: villa.bedCount,
      basePrice: Number(villa.basePrice),
      minNights: villa.minNights,
      mediaCount: villa.media.length,
      hasCoverImage: villa.media.some((item) => item.isCover),
      verification: {
        identityVerified: Boolean(villa.verification?.identityVerified),
        ownershipOrAuthorityVerified: Boolean(
          villa.verification?.ownershipOrAuthorityVerified,
        ),
        tourismPermitVerified: Boolean(villa.verification?.tourismPermitVerified),
        locationVerified: Boolean(villa.verification?.locationVerified),
        photosVerified: Boolean(villa.verification?.photosVerified),
        phoneVerified: Boolean(villa.verification?.phoneVerified),
      },
    }),
  };
}

export async function loginAdminAction(formData: FormData) {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(
        "/admin/login",
        parsed.error.issues[0]?.message || "Giriş bilgileri geçersiz.",
      ),
    );
  }

  try {
    const rateLimitKey = await getRequestRateLimitKey(
      "admin-login",
      parsed.data.email.toLowerCase(),
    );

    await enforceRateLimit({
      scope: "admin-login",
      key: rateLimitKey,
      limit: 8,
      windowSeconds: 600,
      message: "Çok fazla giriş denemesi yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.",
    });
  } catch (error) {
    redirectTo(
      getErrorRedirect(
        "/admin/login",
        error instanceof Error
          ? error.message
          : "Giriş limiti aşıldı. Lütfen daha sonra tekrar deneyin.",
      ),
    );
  }

  const session = await authenticateAdmin(parsed.data.email, parsed.data.password);

  if (!session) {
    redirectTo(getErrorRedirect("/admin/login", "E-posta ya da şifre doğrulanamadı."));
  }

  await createAdminSession(session);
  redirectTo("/admin");
}

export async function logoutAdminAction() {
  await destroyAdminSession();
  redirectTo("/admin/login");
}

export async function createVillaAction(formData: FormData) {
  const parsed = villaCreateSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(
        "/admin/villas/new",
        parsed.error.issues[0]?.message || "Villa bilgileri eksik.",
      ),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();

    const villa = await prisma.villa.create({
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        shortDescription: parsed.data.shortDescription,
        description: parsed.data.description,
        status: "DRAFT",
        ownerId: parsed.data.ownerId,
        regionId: parsed.data.regionId,
        districtId: parsed.data.districtId,
        addressPrivate: parsed.data.addressPrivate,
        addressPublic: parsed.data.addressPublic,
        maxGuests: parsed.data.maxGuests,
        bedroomCount: parsed.data.bedroomCount,
        bathroomCount: parsed.data.bathroomCount,
        bedCount: parsed.data.bedCount,
        checkInTime: "16:00",
        checkOutTime: "10:00",
        basePrice: parsed.data.basePrice,
        cleaningFee: 0,
        depositAmount: 0,
        serviceFeeType: "FIXED",
        serviceFeeValue: 0,
        extraGuestFee: 0,
        verificationStatus: "PENDING",
        verification: {
          create: {},
        },
        location: {
          create: {},
        },
      },
    });

    await writeAuditLog({
      actorUserId: session.userId,
      action: "villa.created",
      entityType: "villa",
      entityId: villa.id,
      message: `${villa.title} taslak olarak oluşturuldu.`,
      metadata: { entityLabel: villa.title },
    });

    revalidatePath("/admin/villas");
    redirectTo(getSuccessRedirect(`/admin/villas/${villa.id}`, "created"));
  } catch (error) {
    redirectTo(
      getErrorRedirect(
        "/admin/villas/new",
        formatMutationError(error, "Villa oluşturulamadı."),
      ),
    );
  }
}

export async function updateVillaBasicsAction(formData: FormData) {
  const parsed = villaBasicsSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = `/admin/villas/${parseString(formData.get("villaId"))}`;

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(
        sourcePath,
        parsed.error.issues[0]?.message || "Villa güncellenemedi.",
      ),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();

    await prisma.villa.update({
      where: { id: parsed.data.villaId },
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        shortDescription: parsed.data.shortDescription,
        description: parsed.data.description,
        ownerId: parsed.data.ownerId,
        regionId: parsed.data.regionId,
        districtId: parsed.data.districtId,
        addressPrivate: parsed.data.addressPrivate,
        addressPublic: parsed.data.addressPublic,
        maxGuests: parsed.data.maxGuests,
        bedroomCount: parsed.data.bedroomCount,
        bathroomCount: parsed.data.bathroomCount,
        bedCount: parsed.data.bedCount,
        basePrice: parsed.data.basePrice,
        checkInTime: parsed.data.checkInTime,
        checkOutTime: parsed.data.checkOutTime,
        hasPrivatePool: parsed.data.hasPrivatePool || false,
        hasHeatedPool: parsed.data.hasHeatedPool || false,
        hasJacuzzi: parsed.data.hasJacuzzi || false,
        isShelteredPool: parsed.data.isShelteredPool || false,
        isConservativeFriendly: parsed.data.isConservativeFriendly || false,
        isPetFriendly: parsed.data.isPetFriendly || false,
        isChildFriendly: parsed.data.isChildFriendly || false,
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
      },
    });

    await writeAuditLog({
      actorUserId: session.userId,
      action: "villa.updated",
      entityType: "villa",
      entityId: parsed.data.villaId,
      message: "Villa temel bilgileri güncellendi.",
      metadata: { entityLabel: parsed.data.title },
    });

    revalidatePath(`/admin/villas/${parsed.data.villaId}`);
    revalidatePath("/admin/villas");
    revalidatePath("/villa-kiralama");
    redirectTo(getSuccessRedirect(sourcePath));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Villa güncellenemedi.")),
    );
  }
}

export async function updateVillaStatusAction(formData: FormData) {
  const parsed = villaStatusActionSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = `/admin/villas/${parseString(formData.get("villaId"))}`;

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(
        sourcePath,
        parsed.error.issues[0]?.message || "Durum güncellenemedi.",
      ),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();

    if (parsed.data.status === "PUBLISHED") {
      const { warnings } = await getVillaReadiness(prisma, parsed.data.villaId);

      if (warnings.length) {
        return getVillaPublishError(sourcePath, warnings);
      }
    }

    await prisma.villa.update({
      where: { id: parsed.data.villaId },
      data: {
        status: parsed.data.status,
        publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
      },
    });

    await writeAuditLog({
      actorUserId: session.userId,
      action: `villa.status.${parsed.data.status.toLowerCase()}`,
      entityType: "villa",
      entityId: parsed.data.villaId,
      message: `Villa durumu ${parsed.data.status} olarak güncellendi.`,
    });

    revalidatePath(sourcePath);
    revalidatePath("/admin/villas");
    revalidatePath("/villa-kiralama");
    redirectTo(getSuccessRedirect(sourcePath, "statusSaved"));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Durum güncellenemedi.")),
    );
  }
}

export async function updateVillaVerificationAction(formData: FormData) {
  const parsed = villaVerificationSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = `/admin/villas/${parseString(formData.get("villaId"))}`;

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(
        sourcePath,
        parsed.error.issues[0]?.message || "Doğrulama güncellenemedi.",
      ),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();
    const previous = await prisma.villaVerification.findUnique({
      where: { villaId: parsed.data.villaId },
    });

    const verificationData = {
      identityVerified: parsed.data.identityVerified || false,
      ownershipOrAuthorityVerified: parsed.data.ownershipOrAuthorityVerified || false,
      tourismPermitVerified: parsed.data.tourismPermitVerified || false,
      locationVerified: parsed.data.locationVerified || false,
      photosVerified: parsed.data.photosVerified || false,
      phoneVerified: parsed.data.phoneVerified || false,
      verificationNotes: parsed.data.verificationNotes || null,
      verifiedByAdminId: session.userId,
      lastVerifiedAt: new Date(),
    };

    await prisma.villaVerification.upsert({
      where: { villaId: parsed.data.villaId },
      update: verificationData,
      create: {
        villaId: parsed.data.villaId,
        ...verificationData,
      },
    });

    await prisma.villa.update({
      where: { id: parsed.data.villaId },
      data: {
        verificationStatus: isVillaFullyVerified(verificationData)
          ? "VERIFIED"
          : "PARTIALLY_VERIFIED",
      },
    });

    const changedFields: Array<
      [string, boolean | string | null | undefined, boolean | string | null | undefined]
    > = [];

    const candidates: Array<
      [string, boolean | string | null | undefined, boolean | string | null | undefined]
    > = [
      ["identity_verified", previous?.identityVerified, verificationData.identityVerified],
      [
        "ownership_or_authority_verified",
        previous?.ownershipOrAuthorityVerified,
        verificationData.ownershipOrAuthorityVerified,
      ],
      [
        "tourism_permit_verified",
        previous?.tourismPermitVerified,
        verificationData.tourismPermitVerified,
      ],
      ["location_verified", previous?.locationVerified, verificationData.locationVerified],
      ["photos_verified", previous?.photosVerified, verificationData.photosVerified],
      ["phone_verified", previous?.phoneVerified, verificationData.phoneVerified],
    ];

    for (const candidate of candidates) {
      if (Boolean(candidate[1]) !== Boolean(candidate[2])) {
        changedFields.push(candidate);
      }
    }

    if (!changedFields.length) {
      changedFields.push(["verification_notes", previous?.verificationNotes, verificationData.verificationNotes]);
    }

    for (const [fieldName, before, after] of changedFields) {
      await writeAuditLog({
        actorUserId: session.userId,
        action: "villa.verification.updated",
        entityType: "villa",
        entityId: parsed.data.villaId,
        message: `${fieldName} alanı güncellendi.`,
        metadata: {
          fieldName,
          previousValue: before ?? null,
          nextValue: after ?? null,
        },
      });
    }

    revalidatePath(sourcePath);
    revalidatePath("/admin/villas");
    redirectTo(getSuccessRedirect(sourcePath, "verificationSaved"));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Doğrulama güncellenemedi.")),
    );
  }
}

export async function updateVillaPricingAction(formData: FormData) {
  const parsed = villaPricingSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = `/admin/villas/${parseString(formData.get("villaId"))}`;

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(
        sourcePath,
        parsed.error.issues[0]?.message || "Fiyat bilgileri güncellenemedi.",
      ),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();

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

    await writeAuditLog({
      actorUserId: session.userId,
      action: "villa.pricing.updated",
      entityType: "villa",
      entityId: parsed.data.villaId,
      message: "Villa fiyat alanları güncellendi.",
    });

    revalidatePath(sourcePath);
    revalidatePath("/villa-kiralama");
    redirectTo(getSuccessRedirect(sourcePath, "pricingSaved"));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Fiyat bilgileri güncellenemedi.")),
    );
  }
}

export async function createAvailabilityBlockAction(formData: FormData) {
  const parsed = availabilityBlockSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = `/admin/villas/${parseString(formData.get("villaId"))}`;

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(
        sourcePath,
        parsed.error.issues[0]?.message || "Müsaitlik blokesi oluşturulamadı.",
      ),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();
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

    await prisma.availabilityBlock.create({
      data: {
        villaId: parsed.data.villaId,
        startDate,
        endDate,
        type: parsed.data.type,
        reason: parsed.data.reason || null,
        createdByAdminId: session.userId,
      },
    });

    await writeAuditLog({
      actorUserId: session.userId,
      action: "villa.availability.created",
      entityType: "villa",
      entityId: parsed.data.villaId,
      message: "Yeni müsaitlik blokesi eklendi.",
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(sourcePath, "availabilitySaved"));
  } catch (error) {
    redirectTo(
      getErrorRedirect(
        sourcePath,
        formatMutationError(error, "Müsaitlik blokesi oluşturulamadı."),
      ),
    );
  }
}

export async function uploadVillaAssetAction(formData: FormData) {
  const villaId = parseString(formData.get("villaId"));
  const assetType = parseString(formData.get("assetType"));
  const documentType = parseString(formData.get("documentType"));
  const altText = parseString(formData.get("altText"));
  const note = parseString(formData.get("note"));
  const file = formData.get("file");
  const sourcePath = `/admin/villas/${villaId}`;

  if (!(file instanceof File)) {
    redirectTo(getErrorRedirect(sourcePath, "Dosya seçilmedi."));
  }

  if (assetType !== "media" && assetType !== "document") {
    redirectTo(getErrorRedirect(sourcePath, "Yükleme tipi geçersiz."));
  }

  if (assetType === "document") {
    assertDocumentTypeAllowed(documentType);
  }

  try {
    const { session, prisma } = await requireAdminMutation();
    const uploadedFile = await createUploadedFileRecord({
      prisma,
      sessionUserId: session.userId,
      file,
      kind: assetType === "media" ? "image" : "document",
      target: assetType === "media" ? "villa-media" : "villa-document",
      altText: altText || undefined,
    });

    if (assetType === "media") {
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

    await writeAuditLog({
      actorUserId: session.userId,
      action: assetType === "media" ? "villa.media.uploaded" : "villa.document.uploaded",
      entityType: "villa",
      entityId: villaId,
      message:
        assetType === "media"
          ? "Villa görseli yüklendi."
          : `${documentType} dokümanı yüklendi.`,
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(sourcePath, "uploadSaved"));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Dosya yüklenemedi.")),
    );
  }
}

export async function updateVillaMediaAction(formData: FormData) {
  const parsed = villaMediaUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = `/admin/villas/${parseString(formData.get("villaId"))}`;

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(sourcePath, parsed.error.issues[0]?.message || "Medya güncellenemedi."),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();

    await prisma.villaMedia.update({
      where: { id: parsed.data.mediaId },
      data: {
        altText: parsed.data.altText,
        sortOrder: parsed.data.sortOrder,
      },
    });

    await prisma.uploadedFile.updateMany({
      where: { villaMedia: { some: { id: parsed.data.mediaId } } },
      data: {
        altText: parsed.data.altText,
      },
    });

    await writeAuditLog({
      actorUserId: session.userId,
      action: "villa.media.updated",
      entityType: "villa",
      entityId: parsed.data.villaId,
      message: "Villa görsel meta alanları güncellendi.",
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(sourcePath, "mediaSaved"));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Medya güncellenemedi.")),
    );
  }
}

export async function setVillaCoverAction(formData: FormData) {
  const parsed = villaCoverSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = `/admin/villas/${parseString(formData.get("villaId"))}`;

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(sourcePath, parsed.error.issues[0]?.message || "Kapak görseli seçilemedi."),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();

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

    await writeAuditLog({
      actorUserId: session.userId,
      action: "villa.media.cover_set",
      entityType: "villa",
      entityId: parsed.data.villaId,
      message: "Kapak görseli güncellendi.",
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(sourcePath, "mediaSaved"));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Kapak görseli seçilemedi.")),
    );
  }
}

export async function deleteVillaMediaAction(formData: FormData) {
  const parsed = villaMediaDeleteSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = `/admin/villas/${parseString(formData.get("villaId"))}`;

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(sourcePath, parsed.error.issues[0]?.message || "Medya silinemedi."),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();
    const media = await prisma.villaMedia.findUnique({
      where: { id: parsed.data.mediaId },
      include: { file: true },
    });

    if (!media) {
      throw new Error("Silinecek medya bulunamadı.");
    }

    await getStorageService().deleteFile(media.file.storageKey);

    await prisma.$transaction([
      prisma.villaMedia.delete({ where: { id: parsed.data.mediaId } }),
      prisma.uploadedFile.delete({ where: { id: media.fileId } }),
    ]);

    await writeAuditLog({
      actorUserId: session.userId,
      action: "villa.media.deleted",
      entityType: "villa",
      entityId: parsed.data.villaId,
      message: "Villa görseli silindi.",
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(sourcePath, "mediaSaved"));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Medya silinemedi.")),
    );
  }
}

export async function toggleVillaDocumentVerificationAction(formData: FormData) {
  const parsed = villaDocumentVerificationSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = `/admin/villas/${parseString(formData.get("villaId"))}`;

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(
        sourcePath,
        parsed.error.issues[0]?.message || "Doküman doğrulaması güncellenemedi.",
      ),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();

    await prisma.villaDocument.update({
      where: { id: parsed.data.documentId },
      data: {
        isVerified: parsed.data.isVerified || false,
        verifiedAt: parsed.data.isVerified ? new Date() : null,
        verifiedByAdminId: parsed.data.isVerified ? session.userId : null,
      },
    });

    await writeAuditLog({
      actorUserId: session.userId,
      action: "villa.document.verification_updated",
      entityType: "villa",
      entityId: parsed.data.villaId,
      message: "Villa doküman doğrulaması güncellendi.",
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(sourcePath, "documentSaved"));
  } catch (error) {
    redirectTo(
      getErrorRedirect(
        sourcePath,
        formatMutationError(error, "Doküman doğrulaması güncellenemedi."),
      ),
    );
  }
}

export async function deleteVillaDocumentAction(formData: FormData) {
  const villaId = parseString(formData.get("villaId"));
  const documentId = parseString(formData.get("documentId"));
  const sourcePath = `/admin/villas/${villaId}`;

  if (!villaId || !documentId) {
    redirectTo(getErrorRedirect(sourcePath, "Silinecek doküman bulunamadı."));
  }

  try {
    const { session, prisma } = await requireAdminMutation();
    const document = await prisma.villaDocument.findUnique({
      where: { id: documentId },
      include: { file: true },
    });

    if (!document) {
      throw new Error("Silinecek doküman bulunamadı.");
    }

    await getStorageService().deleteFile(document.file.storageKey);

    await prisma.$transaction([
      prisma.villaDocument.delete({ where: { id: documentId } }),
      prisma.uploadedFile.delete({ where: { id: document.fileId } }),
    ]);

    await writeAuditLog({
      actorUserId: session.userId,
      action: "villa.document.deleted",
      entityType: "villa",
      entityId: villaId,
      message: "Villa dokümanı silindi.",
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(sourcePath, "documentSaved"));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Doküman silinemedi.")),
    );
  }
}

export async function uploadOwnerDocumentAction(formData: FormData) {
  const ownerId = parseString(formData.get("ownerId"));
  const documentType = parseString(formData.get("documentType"));
  const note = parseString(formData.get("note"));
  const file = formData.get("file");
  const sourcePath = "/admin/owners";

  if (!(file instanceof File)) {
    redirectTo(getErrorRedirect(sourcePath, "Dosya seçilmedi."));
  }

  assertDocumentTypeAllowed(documentType);

  try {
    const { session, prisma } = await requireAdminMutation();
    const uploadedFile = await createUploadedFileRecord({
      prisma,
      sessionUserId: session.userId,
      file,
      kind: "document",
      target: "owner-document",
    });

    await prisma.ownerDocument.create({
      data: {
        ownerId,
        fileId: uploadedFile.id,
        documentType,
        note: note || null,
      },
    });

    await writeAuditLog({
      actorUserId: session.userId,
      action: "owner.document.uploaded",
      entityType: "owner",
      entityId: ownerId,
      message: `${documentType} dokümanı yüklendi.`,
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(`${sourcePath}?ownerId=${ownerId}`, "documentSaved"));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Doküman yüklenemedi.")),
    );
  }
}

export async function toggleOwnerDocumentVerificationAction(formData: FormData) {
  const parsed = ownerDocumentVerificationSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = "/admin/owners";

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(
        sourcePath,
        parsed.error.issues[0]?.message || "Doküman doğrulaması güncellenemedi.",
      ),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();

    await prisma.ownerDocument.update({
      where: { id: parsed.data.documentId },
      data: {
        isVerified: parsed.data.isVerified || false,
        verifiedAt: parsed.data.isVerified ? new Date() : null,
        verifiedByAdminId: parsed.data.isVerified ? session.userId : null,
      },
    });

    await writeAuditLog({
      actorUserId: session.userId,
      action: "owner.document.verification_updated",
      entityType: "owner",
      entityId: parsed.data.ownerId,
      message: "Sahip doküman doğrulaması güncellendi.",
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(`${sourcePath}?ownerId=${parsed.data.ownerId}`, "documentSaved"));
  } catch (error) {
    redirectTo(
      getErrorRedirect(
        sourcePath,
        formatMutationError(error, "Doküman doğrulaması güncellenemedi."),
      ),
    );
  }
}

export async function deleteOwnerDocumentAction(formData: FormData) {
  const ownerId = parseString(formData.get("ownerId"));
  const documentId = parseString(formData.get("documentId"));
  const sourcePath = "/admin/owners";

  if (!ownerId || !documentId) {
    redirectTo(getErrorRedirect(sourcePath, "Silinecek doküman bulunamadı."));
  }

  try {
    const { session, prisma } = await requireAdminMutation();
    const document = await prisma.ownerDocument.findUnique({
      where: { id: documentId },
      include: { file: true },
    });

    if (!document) {
      throw new Error("Silinecek doküman bulunamadı.");
    }

    await getStorageService().deleteFile(document.file.storageKey);

    await prisma.$transaction([
      prisma.ownerDocument.delete({ where: { id: documentId } }),
      prisma.uploadedFile.delete({ where: { id: document.fileId } }),
    ]);

    await writeAuditLog({
      actorUserId: session.userId,
      action: "owner.document.deleted",
      entityType: "owner",
      entityId: ownerId,
      message: "Sahip dokümanı silindi.",
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(`${sourcePath}?ownerId=${ownerId}`, "documentSaved"));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Doküman silinemedi.")),
    );
  }
}

export async function saveOwnerAction(formData: FormData) {
  const parsed = ownerFormSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = "/admin/owners";

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(sourcePath, parsed.error.issues[0]?.message || "Sahip kaydedilemedi."),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();
    const owner = parsed.data.ownerId
      ? await prisma.owner.update({
          where: { id: parsed.data.ownerId },
          data: {
            type: parsed.data.type,
            displayName: parsed.data.displayName,
            legalName: parsed.data.legalName || null,
            contactName: parsed.data.contactName || null,
            email: parsed.data.email,
            phone: parsed.data.phone,
            taxNumber: parsed.data.taxNumber || null,
            notes: parsed.data.notes || null,
            isActive: parsed.data.isActive ?? false,
          },
        })
      : await prisma.owner.create({
          data: {
            type: parsed.data.type,
            displayName: parsed.data.displayName,
            legalName: parsed.data.legalName || null,
            contactName: parsed.data.contactName || null,
            email: parsed.data.email,
            phone: parsed.data.phone,
            taxNumber: parsed.data.taxNumber || null,
            notes: parsed.data.notes || null,
            isActive: parsed.data.isActive ?? true,
          },
        });

    await writeAuditLog({
      actorUserId: session.userId,
      action: parsed.data.ownerId ? "owner.updated" : "owner.created",
      entityType: "owner",
      entityId: owner.id,
      message: parsed.data.ownerId
        ? "Sahip kaydı güncellendi."
        : "Yeni sahip kaydı oluşturuldu.",
      metadata: { entityLabel: owner.displayName },
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(`${sourcePath}?ownerId=${owner.id}`));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Sahip kaydedilemedi.")),
    );
  }
}

export async function archiveOwnerAction(formData: FormData) {
  const ownerId = parseString(formData.get("ownerId"));
  const sourcePath = "/admin/owners";

  if (!ownerId) {
    redirectTo(getErrorRedirect(sourcePath, "Sahip kaydı bulunamadı."));
  }

  try {
    const { session, prisma } = await requireAdminMutation(["super_admin"]);
    const owner = await prisma.owner.update({
      where: { id: ownerId },
      data: { isActive: false },
    });

    await writeAuditLog({
      actorUserId: session.userId,
      action: "owner.archived",
      entityType: "owner",
      entityId: ownerId,
      message: "Sahip kaydı pasife alındı.",
      metadata: { entityLabel: owner.displayName },
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(sourcePath));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Sahip kaydı pasife alınamadı.")),
    );
  }
}

export async function saveBlogPostAction(formData: FormData) {
  const parsed = blogPostFormSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = "/admin/blog";

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(sourcePath, parsed.error.issues[0]?.message || "Yazı kaydedilemedi."),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();
    const post = parsed.data.postId
      ? await prisma.blogPost.update({
          where: { id: parsed.data.postId },
          data: {
            title: parsed.data.title,
            slug: parsed.data.slug,
            excerpt: parsed.data.excerpt,
            content: parsed.data.content,
            status: parsed.data.status,
            seoTitle: parsed.data.seoTitle || null,
            seoDescription: parsed.data.seoDescription || null,
            publishedAt:
              parsed.data.status === "PUBLISHED" ? new Date() : null,
          },
        })
      : await prisma.blogPost.create({
          data: {
            authorId: session.userId,
            title: parsed.data.title,
            slug: parsed.data.slug,
            excerpt: parsed.data.excerpt,
            content: parsed.data.content,
            status: parsed.data.status,
            seoTitle: parsed.data.seoTitle || null,
            seoDescription: parsed.data.seoDescription || null,
            publishedAt:
              parsed.data.status === "PUBLISHED" ? new Date() : null,
          },
        });

    await writeAuditLog({
      actorUserId: session.userId,
      action: parsed.data.postId ? "blog.updated" : "blog.created",
      entityType: "blog_post",
      entityId: post.id,
      message: parsed.data.postId
        ? "Blog yazısı güncellendi."
        : "Yeni blog yazısı oluşturuldu.",
      metadata: { entityLabel: post.title },
    });

    revalidatePath(sourcePath);
    revalidatePath("/blog");
    redirectTo(getSuccessRedirect(`${sourcePath}?postId=${post.id}`));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Yazı kaydedilemedi.")),
    );
  }
}

export async function deleteBlogPostAction(formData: FormData) {
  const postId = parseString(formData.get("postId"));
  const sourcePath = "/admin/blog";

  if (!postId) {
    redirectTo(getErrorRedirect(sourcePath, "Silinecek yazı bulunamadı."));
  }

  try {
    const { session, prisma } = await requireAdminMutation(["super_admin"]);
    const post = await prisma.blogPost.delete({ where: { id: postId } });

    await writeAuditLog({
      actorUserId: session.userId,
      action: "blog.deleted",
      entityType: "blog_post",
      entityId: postId,
      message: "Blog yazısı silindi.",
      metadata: { entityLabel: post.title },
    });

    revalidatePath(sourcePath);
    revalidatePath("/blog");
    redirectTo(getSuccessRedirect(sourcePath));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Yazı silinemedi.")),
    );
  }
}

export async function saveSeoPageAction(formData: FormData) {
  const parsed = seoPageFormSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = "/admin/seo-pages";

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(sourcePath, parsed.error.issues[0]?.message || "SEO sayfası kaydedilemedi."),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();
    const page = parsed.data.seoPageId
      ? await prisma.seoPage.update({
          where: { id: parsed.data.seoPageId },
          data: {
            slug: parsed.data.slug,
            pageType: parsed.data.pageType,
            title: parsed.data.title,
            description: parsed.data.description,
            h1: parsed.data.h1 || null,
            intro: parsed.data.intro || null,
            body: parsed.data.body || null,
            canonicalPath: parsed.data.canonicalPath || null,
            targetEntityId: parsed.data.targetEntityId || null,
            noIndex: parsed.data.noIndex || false,
            ogTitle: parsed.data.ogTitle || null,
            ogDescription: parsed.data.ogDescription || null,
          },
        })
      : await prisma.seoPage.create({
          data: {
            slug: parsed.data.slug,
            pageType: parsed.data.pageType,
            title: parsed.data.title,
            description: parsed.data.description,
            h1: parsed.data.h1 || null,
            intro: parsed.data.intro || null,
            body: parsed.data.body || null,
            canonicalPath: parsed.data.canonicalPath || null,
            targetEntityId: parsed.data.targetEntityId || null,
            noIndex: parsed.data.noIndex || false,
            ogTitle: parsed.data.ogTitle || null,
            ogDescription: parsed.data.ogDescription || null,
          },
        });

    await writeAuditLog({
      actorUserId: session.userId,
      action: parsed.data.seoPageId ? "seo_page.updated" : "seo_page.created",
      entityType: "seo_page",
      entityId: page.id,
      message: parsed.data.seoPageId
        ? "SEO sayfası güncellendi."
        : "Yeni SEO sayfası oluşturuldu.",
      metadata: { entityLabel: page.slug },
    });

    revalidatePath(sourcePath);
    revalidatePath("/sitemap.xml");
    redirectTo(getSuccessRedirect(`${sourcePath}?pageId=${page.id}`));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "SEO sayfası kaydedilemedi.")),
    );
  }
}

export async function deleteSeoPageAction(formData: FormData) {
  const seoPageId = parseString(formData.get("seoPageId"));
  const sourcePath = "/admin/seo-pages";

  if (!seoPageId) {
    redirectTo(getErrorRedirect(sourcePath, "Silinecek SEO sayfası bulunamadı."));
  }

  try {
    const { session, prisma } = await requireAdminMutation(["super_admin"]);
    const page = await prisma.seoPage.delete({ where: { id: seoPageId } });

    await writeAuditLog({
      actorUserId: session.userId,
      action: "seo_page.deleted",
      entityType: "seo_page",
      entityId: seoPageId,
      message: "SEO sayfası silindi.",
      metadata: { entityLabel: page.slug },
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(sourcePath));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "SEO sayfası silinemedi.")),
    );
  }
}

export async function saveRedirectAction(formData: FormData) {
  const parsed = redirectFormSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = "/admin/redirects";

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(sourcePath, parsed.error.issues[0]?.message || "Yönlendirme kaydedilemedi."),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();
    const redirectRecord = parsed.data.redirectId
      ? await prisma.redirect.update({
          where: { id: parsed.data.redirectId },
          data: {
            fromPath: parsed.data.fromPath,
            toPath: parsed.data.toPath,
            type: parsed.data.type,
            isActive: parsed.data.isActive ?? false,
          },
        })
      : await prisma.redirect.create({
          data: {
            fromPath: parsed.data.fromPath,
            toPath: parsed.data.toPath,
            type: parsed.data.type,
            isActive: parsed.data.isActive ?? true,
          },
        });

    await writeAuditLog({
      actorUserId: session.userId,
      action: parsed.data.redirectId ? "redirect.updated" : "redirect.created",
      entityType: "redirect",
      entityId: redirectRecord.id,
      message: parsed.data.redirectId
        ? "Yönlendirme güncellendi."
        : "Yeni yönlendirme oluşturuldu.",
      metadata: { entityLabel: redirectRecord.fromPath },
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(`${sourcePath}?redirectId=${redirectRecord.id}`));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Yönlendirme kaydedilemedi.")),
    );
  }
}

export async function deleteRedirectAction(formData: FormData) {
  const redirectId = parseString(formData.get("redirectId"));
  const sourcePath = "/admin/redirects";

  if (!redirectId) {
    redirectTo(getErrorRedirect(sourcePath, "Silinecek yönlendirme bulunamadı."));
  }

  try {
    const { session, prisma } = await requireAdminMutation(["super_admin"]);
    const redirectRecord = await prisma.redirect.delete({ where: { id: redirectId } });

    await writeAuditLog({
      actorUserId: session.userId,
      action: "redirect.deleted",
      entityType: "redirect",
      entityId: redirectId,
      message: "Yönlendirme silindi.",
      metadata: { entityLabel: redirectRecord.fromPath },
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(sourcePath));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Yönlendirme silinemedi.")),
    );
  }
}

export async function saveSettingAction(formData: FormData) {
  const parsed = settingFormSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = "/admin/settings";

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(sourcePath, parsed.error.issues[0]?.message || "Ayar kaydedilemedi."),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();
    const parsedValue = JSON.parse(parsed.data.valueJson);
    const setting = parsed.data.settingId
      ? await prisma.setting.update({
          where: { id: parsed.data.settingId },
          data: {
            key: parsed.data.key,
            groupName: parsed.data.groupName,
            valueJson: parsedValue,
            description: parsed.data.description || null,
            updatedByAdminId: session.userId,
          },
        })
      : await prisma.setting.create({
          data: {
            key: parsed.data.key,
            groupName: parsed.data.groupName,
            valueJson: parsedValue,
            description: parsed.data.description || null,
            updatedByAdminId: session.userId,
          },
        });

    await writeAuditLog({
      actorUserId: session.userId,
      action: parsed.data.settingId ? "setting.updated" : "setting.created",
      entityType: "setting",
      entityId: setting.id,
      message: parsed.data.settingId
        ? "Site ayarı güncellendi."
        : "Yeni site ayarı oluşturuldu.",
      metadata: { entityLabel: setting.key },
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(`${sourcePath}?settingId=${setting.id}`));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Ayar kaydedilemedi.")),
    );
  }
}

export async function deleteSettingAction(formData: FormData) {
  const settingId = parseString(formData.get("settingId"));
  const sourcePath = "/admin/settings";

  if (!settingId) {
    redirectTo(getErrorRedirect(sourcePath, "Silinecek ayar bulunamadı."));
  }

  try {
    const { session, prisma } = await requireAdminMutation(["super_admin"]);
    const setting = await prisma.setting.delete({ where: { id: settingId } });

    await writeAuditLog({
      actorUserId: session.userId,
      action: "setting.deleted",
      entityType: "setting",
      entityId: settingId,
      message: "Site ayarı silindi.",
      metadata: { entityLabel: setting.key },
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(sourcePath));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Ayar silinemedi.")),
    );
  }
}

export async function updateInquiryStatusAction(formData: FormData) {
  const parsed = inquiryStatusFormSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = "/admin/inquiries";

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(sourcePath, parsed.error.issues[0]?.message || "Talep güncellenemedi."),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();

    await prisma.inquiry.update({
      where: { id: parsed.data.inquiryId },
      data: { status: parsed.data.status },
    });

    await writeAuditLog({
      actorUserId: session.userId,
      action: "inquiry.status.updated",
      entityType: "inquiry",
      entityId: parsed.data.inquiryId,
      message: `Talep durumu ${parsed.data.status} olarak güncellendi.`,
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(sourcePath));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Talep güncellenemedi.")),
    );
  }
}

export async function updateReviewStatusAction(formData: FormData) {
  const parsed = reviewModerationFormSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = "/admin/reviews";

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(sourcePath, parsed.error.issues[0]?.message || "Yorum durumu güncellenemedi."),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();

    await prisma.review.update({
      where: { id: parsed.data.reviewId },
      data: {
        status: parsed.data.status,
        publishedAt: parsed.data.status === "APPROVED" ? new Date() : null,
      },
    });

    await writeAuditLog({
      actorUserId: session.userId,
      action: "review.status.updated",
      entityType: "review",
      entityId: parsed.data.reviewId,
      message: `Yorum durumu ${parsed.data.status} olarak güncellendi.`,
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(sourcePath));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Yorum durumu güncellenemedi.")),
    );
  }
}

export async function saveReviewReplyAction(formData: FormData) {
  const parsed = reviewReplyFormSchema.safeParse(Object.fromEntries(formData.entries()));
  const sourcePath = "/admin/reviews";

  if (!parsed.success) {
    redirectTo(
      getErrorRedirect(sourcePath, parsed.error.issues[0]?.message || "Yanıt kaydedilemedi."),
    );
  }

  try {
    const { session, prisma } = await requireAdminMutation();
    const reply = parsed.data.replyId
      ? await prisma.reviewReply.update({
          where: { id: parsed.data.replyId },
          data: {
            responderType: parsed.data.responderType,
            body: parsed.data.body,
          },
        })
      : await prisma.reviewReply.create({
          data: {
            reviewId: parsed.data.reviewId,
            responderType: parsed.data.responderType,
            body: parsed.data.body,
          },
        });

    await writeAuditLog({
      actorUserId: session.userId,
      action: parsed.data.replyId ? "review.reply.updated" : "review.reply.created",
      entityType: "review",
      entityId: parsed.data.reviewId,
      message: "Yorum yanıtı kaydedildi.",
      metadata: { replyId: reply.id },
    });

    revalidatePath(sourcePath);
    redirectTo(getSuccessRedirect(sourcePath));
  } catch (error) {
    redirectTo(
      getErrorRedirect(sourcePath, formatMutationError(error, "Yanıt kaydedilemedi.")),
    );
  }
}
