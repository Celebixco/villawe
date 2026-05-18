import { cache } from "react";

import type {
  AdminAuditLogRecord,
  AdminBlogPostRecord,
  AdminInquiryRecord,
  AdminModuleState,
  AdminOption,
  AdminOwnerDocumentRecord,
  AdminOwnerRecord,
  AdminRedirectRecord,
  AdminReviewRecord,
  AdminSeoPageRecord,
  AdminSettingRecord,
  AdminVillaDocumentRecord,
  AdminVillaEditorRecord,
  AdminVillaMediaRecord,
} from "@/features/admin/types";
import { getVillaPublishWarnings } from "@/features/admin/villa-publishing";
import { getConcepts, getDistricts, getOwners, getRegions } from "@/features/villas/queries";
import {
  demoBlogPosts,
  demoInquiries,
  demoOwners,
  demoPolicies,
  demoRegions,
  demoSeoTargets,
  demoVillas,
  demoDistricts,
} from "@/lib/demo-data";
import { getDatabaseHealth, withDbFallback } from "@/lib/db/prisma";

function formatDate(date?: Date | null) {
  return date ? date.toISOString().slice(0, 10) : undefined;
}

function formatDateTime(date?: Date | null) {
  return date ? date.toISOString() : undefined;
}

function decimalToNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  if (value && typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }

  return 0;
}

function stringifyJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

function mapOwnerDocument(input: {
  id: string;
  documentType: string;
  note?: string | null;
  isVerified: boolean;
  verifiedAt?: Date | null;
  file: {
    id: string;
    url: string;
    originalName: string;
    mimeType: string;
  };
}): AdminOwnerDocumentRecord {
  return {
    id: input.id,
    fileId: input.file.id,
    documentType: input.documentType,
    note: input.note || undefined,
    isVerified: input.isVerified,
    verifiedAt: formatDateTime(input.verifiedAt),
    url: `/api/private-files/${input.file.id}`,
    originalName: input.file.originalName,
    mimeType: input.file.mimeType,
  };
}

function mapVillaDocument(input: {
  id: string;
  documentType: string;
  note?: string | null;
  isVerified: boolean;
  verifiedAt?: Date | null;
  file: {
    id: string;
    url: string;
    originalName: string;
    mimeType: string;
  };
}): AdminVillaDocumentRecord {
  return {
    id: input.id,
    fileId: input.file.id,
    documentType: input.documentType,
    note: input.note || undefined,
    isVerified: input.isVerified,
    verifiedAt: formatDateTime(input.verifiedAt),
    url: `/api/private-files/${input.file.id}`,
    originalName: input.file.originalName,
    mimeType: input.file.mimeType,
  };
}

function mapVillaMedia(input: {
  id: string;
  altText?: string | null;
  sortOrder: number;
  isCover: boolean;
  file: {
    id: string;
    url: string;
    originalName: string;
    altText?: string | null;
  };
}): AdminVillaMediaRecord {
  return {
    id: input.id,
    fileId: input.file.id,
    url: input.file.url,
    altText: input.altText || input.file.altText || input.file.originalName,
    sortOrder: input.sortOrder,
    isCover: input.isCover,
    originalName: input.file.originalName,
  };
}

function mapDemoOwnerRecords(): AdminOwnerRecord[] {
  return demoOwners.map((owner) => ({
    id: owner.id,
    type: owner.type === "agency" ? "AGENCY" : "INDIVIDUAL",
    status: "ACTIVE",
    displayName: owner.displayName,
    email: owner.email,
    phone: owner.phone,
    verificationStatus: "PENDING",
    isActive: true,
    villaCount: demoVillas.filter((villa) => villa.ownerName === owner.displayName).length,
    createdAt: new Date().toISOString(),
    documents: [],
  }));
}

function mapDemoBlogPosts(): AdminBlogPostRecord[] {
  return demoBlogPosts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    status: "PUBLISHED",
    publishedAt: post.publishedAt,
    updatedAt: new Date().toISOString(),
    coverImageUrl: post.coverImage,
  }));
}

function mapDemoSeoPages(): AdminSeoPageRecord[] {
  return demoSeoTargets.map((target) => ({
    id: `demo-${target.slug}`,
    slug: target.slug,
    pageType:
      target.type === "region"
        ? "REGION"
        : target.type === "concept"
          ? "CONCEPT"
          : "LANDING",
    title: `${target.slug} | Villawe`,
    description: `${target.slug} için demo SEO sayfası.`,
    targetEntityId: target.entitySlug,
    noIndex: false,
    updatedAt: new Date().toISOString(),
  }));
}

function mapDemoSettings(): AdminSettingRecord[] {
  return [
    {
      id: "setting-safe-rental",
      key: "safe_rental_warnings",
      groupName: "trust",
      valueJson: stringifyJson(demoPolicies.safeRentalWarnings),
      description: "Kamuya açık güvenli kiralama uyarıları.",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "setting-faq",
      key: "public_faqs",
      groupName: "content",
      valueJson: stringifyJson(demoPolicies.faqs),
      description: "Sık sorulan sorular içeriği.",
      updatedAt: new Date().toISOString(),
    },
  ];
}

function mapDemoReviewRecords(): AdminReviewRecord[] {
  return demoVillas.flatMap((villa) =>
    villa.reviews.map((review) => ({
      id: review.id,
      villaId: villa.id,
      villaTitle: villa.title,
      status: "APPROVED" as const,
      authorName: review.authorName,
      rating: review.rating,
      title: review.title || undefined,
      body: review.body,
      stayDate: review.stayDate || undefined,
      publishedAt: review.stayDate || undefined,
      reply: review.reply
        ? {
            id: `${review.id}-reply`,
            responderType: "ADMIN",
            body: review.reply.body,
          }
        : undefined,
    })),
  );
}

function mapDemoInquiryRecords(): AdminInquiryRecord[] {
  return demoInquiries.map((inquiry) => ({
    id: inquiry.id,
    villaId: inquiry.id,
    villaTitle: inquiry.villaTitle,
    status: inquiry.status.toUpperCase() as AdminInquiryRecord["status"],
    guestCount: inquiry.guestCount,
    fullName: inquiry.fullName,
    email: inquiry.email,
    phone: inquiry.phone,
    startDate: inquiry.startDate,
    endDate: inquiry.endDate,
    estimatedTotal: inquiry.estimatedTotal,
    createdAt: inquiry.createdAt,
    pricingSnapshot: undefined,
    depositWarningAcknowledged: true,
    offPlatformPaymentWarningAcknowledged: true,
  }));
}

function mapDemoVillaEditor(id: string): AdminVillaEditorRecord | null {
  const villa = demoVillas.find((item) => item.id === id || item.slug === id);

  if (!villa) {
    return null;
  }

  const owner =
    demoOwners.find((item) => item.displayName === villa.ownerName) || demoOwners[0]!;
  const region = demoRegions.find((item) => item.slug === villa.region.slug);
  const district = demoDistricts.find((item) => item.slug === villa.district.slug);
  const media = villa.media.map((item, index) => ({
    id: item.id,
    fileId: `demo-file-${item.id}`,
    url: item.url,
    altText: item.alt,
    sortOrder: index,
    isCover: Boolean(item.isCover),
    originalName: item.alt,
  }));

  return {
    id: villa.id,
    slug: villa.slug,
    title: villa.title,
    shortDescription: villa.shortDescription,
    description: villa.description,
    status: "PUBLISHED",
    verificationStatus: "VERIFIED",
    ownerId: owner.id,
    ownerName: owner.displayName,
    regionId: region?.id || villa.region.slug,
    regionName: villa.region.name,
    districtId: district?.id || villa.district.slug,
    districtName: villa.district.name,
    addressPublic: villa.addressPublic,
    addressPrivate: `${villa.locationLabel} private`,
    maxGuests: villa.maxGuests,
    bedroomCount: villa.bedroomCount,
    bathroomCount: villa.bathroomCount,
    bedCount: villa.bedCount,
    basePrice: villa.pricing.basePrice,
    cleaningFee: villa.pricing.cleaningFee,
    depositAmount: villa.pricing.depositAmount,
    serviceFeeType: villa.pricing.serviceFeeType.toUpperCase() as AdminVillaEditorRecord["serviceFeeType"],
    serviceFeeValue: villa.pricing.serviceFeeValue,
    extraGuestFee: villa.pricing.extraGuestFee,
    minNights: villa.pricing.minNights,
    checkInTime: villa.checkInTime,
    checkOutTime: villa.checkOutTime,
    publishedAt: new Date().toISOString(),
    reviewRequestedAt: undefined,
    ownerRevisionNotes: undefined,
    verification: {
      identityVerified: villa.verification.identityVerified,
      ownershipOrAuthorityVerified: villa.verification.ownershipOrAuthorityVerified,
      tourismPermitVerified: villa.verification.tourismPermitVerified,
      locationVerified: villa.verification.locationVerified,
      photosVerified: villa.verification.photosVerified,
      phoneVerified: villa.verification.phoneVerified,
      verificationNotes: villa.verification.verificationNotes,
      lastVerifiedAt: villa.verification.lastVerifiedAt,
    },
    features: villa.features,
    media,
    documents: [],
    availabilityBlocks: villa.availabilityBlocks.map((block, index) => ({
      id: `demo-block-${index}`,
      startDate: block.startDate,
      endDate: block.endDate,
      type: block.type.toUpperCase() as AdminVillaEditorRecord["availabilityBlocks"][number]["type"],
      reason: block.label,
    })),
    publishWarnings: getVillaPublishWarnings({
      title: villa.title,
      slug: villa.slug,
      shortDescription: villa.shortDescription,
      description: villa.description,
      ownerId: owner.id,
      regionId: region?.id || villa.region.slug,
      districtId: district?.id || villa.district.slug,
      addressPublic: villa.addressPublic,
      addressPrivate: `${villa.locationLabel} private`,
      maxGuests: villa.maxGuests,
      bedroomCount: villa.bedroomCount,
      bathroomCount: villa.bathroomCount,
      bedCount: villa.bedCount,
      basePrice: villa.pricing.basePrice,
      minNights: villa.pricing.minNights,
      mediaCount: media.length,
      hasCoverImage: media.some((item) => item.isCover),
      verification: {
        identityVerified: villa.verification.identityVerified,
        ownershipOrAuthorityVerified: villa.verification.ownershipOrAuthorityVerified,
        tourismPermitVerified: villa.verification.tourismPermitVerified,
        locationVerified: villa.verification.locationVerified,
        photosVerified: villa.verification.photosVerified,
        phoneVerified: villa.verification.phoneVerified,
      },
    }),
  };
}

export const getAdminModuleState = cache(async (): Promise<AdminModuleState> => {
  const health = await getDatabaseHealth();

  return {
    mode: health.status,
    message: health.message,
    readOnly: health.status !== "database",
  };
});

export const getAdminOwners = cache(async (): Promise<AdminOwnerRecord[]> => {
  return withDbFallback(
    async (prisma) => {
      const owners = await prisma.owner.findMany({
        include: {
          documents: {
            include: {
              file: true,
            },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: { villas: true },
          },
        },
        orderBy: [{ isActive: "desc" }, { displayName: "asc" }],
      });

      return owners.map((owner) => ({
        id: owner.id,
        type: owner.type,
        status: owner.status,
        displayName: owner.displayName,
        legalName: owner.legalName || undefined,
        contactName: owner.contactName || undefined,
        email: owner.email,
        phone: owner.phone,
        taxNumber: owner.taxNumber || undefined,
        city: owner.city || undefined,
        districtLabel: owner.districtLabel || undefined,
        address: owner.address || undefined,
        verificationStatus: owner.verificationStatus,
        adminNotes: owner.adminNotes || undefined,
        reviewedAt: formatDateTime(owner.reviewedAt),
        notes: owner.notes || undefined,
        isActive: owner.isActive,
        villaCount: owner._count.villas,
        createdAt: owner.createdAt.toISOString(),
        documents: owner.documents.map(mapOwnerDocument),
      }));
    },
    () => mapDemoOwnerRecords(),
    [],
  );
});

export const getAdminBlogPosts = cache(async (): Promise<AdminBlogPostRecord[]> => {
  return withDbFallback(
    async (prisma) => {
      const posts = await prisma.blogPost.findMany({
        include: { coverFile: true },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      });

      return posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        status: post.status,
        seoTitle: post.seoTitle || undefined,
        seoDescription: post.seoDescription || undefined,
        publishedAt: formatDateTime(post.publishedAt),
        updatedAt: post.updatedAt.toISOString(),
        coverImageUrl: post.coverFile?.url || undefined,
      }));
    },
    () => mapDemoBlogPosts(),
    [],
  );
});

export const getAdminSeoPages = cache(async (): Promise<AdminSeoPageRecord[]> => {
  return withDbFallback(
    async (prisma) => {
      const pages = await prisma.seoPage.findMany({
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      });

      return pages.map((page) => ({
        id: page.id,
        slug: page.slug,
        pageType: page.pageType,
        title: page.title,
        description: page.description,
        h1: page.h1 || undefined,
        intro: page.intro || undefined,
        body: page.body || undefined,
        canonicalPath: page.canonicalPath || undefined,
        targetEntityId: page.targetEntityId || undefined,
        noIndex: page.noIndex,
        ogTitle: page.ogTitle || undefined,
        ogDescription: page.ogDescription || undefined,
        updatedAt: page.updatedAt.toISOString(),
      }));
    },
    () => mapDemoSeoPages(),
    [],
  );
});

export const getAdminRedirects = cache(async (): Promise<AdminRedirectRecord[]> => {
  return withDbFallback(
    async (prisma) => {
      const redirects = await prisma.redirect.findMany({
        orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
      });

      return redirects.map((redirect) => ({
        id: redirect.id,
        fromPath: redirect.fromPath,
        toPath: redirect.toPath,
        type: redirect.type,
        isActive: redirect.isActive,
        updatedAt: redirect.updatedAt.toISOString(),
      }));
    },
    [],
    [],
  );
});

export const getAdminSettings = cache(async (): Promise<AdminSettingRecord[]> => {
  return withDbFallback(
    async (prisma) => {
      const settings = await prisma.setting.findMany({
        orderBy: [{ groupName: "asc" }, { key: "asc" }],
      });

      return settings.map((setting) => ({
        id: setting.id,
        key: setting.key,
        groupName: setting.groupName,
        valueJson: stringifyJson(setting.valueJson),
        description: setting.description || undefined,
        updatedAt: setting.updatedAt.toISOString(),
      }));
    },
    () => mapDemoSettings(),
    [],
  );
});

export const getAdminInquiries = cache(async (): Promise<AdminInquiryRecord[]> => {
  return withDbFallback(
    async (prisma) => {
      const inquiries = await prisma.inquiry.findMany({
        include: {
          villa: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return inquiries.map((inquiry) => ({
        id: inquiry.id,
        villaId: inquiry.villa.id,
        villaTitle: inquiry.villa.title,
        status: inquiry.status,
        guestCount: inquiry.guestCount,
        fullName: inquiry.fullName,
        email: inquiry.email,
        phone: inquiry.phone,
        startDate: formatDate(inquiry.startDate),
        endDate: formatDate(inquiry.endDate),
        estimatedTotal: inquiry.estimatedTotal
          ? decimalToNumber(inquiry.estimatedTotal)
          : undefined,
        createdAt: inquiry.createdAt.toISOString(),
        message: inquiry.message || undefined,
        pricingSnapshot: inquiry.pricingSnapshot
          ? stringifyJson(inquiry.pricingSnapshot)
          : undefined,
        depositWarningAcknowledged: inquiry.depositWarningAcknowledged,
        offPlatformPaymentWarningAcknowledged:
          inquiry.offPlatformPaymentWarningAcknowledged,
      }));
    },
    () => mapDemoInquiryRecords(),
    [],
  );
});

export const getAdminReviews = cache(async (): Promise<AdminReviewRecord[]> => {
  return withDbFallback(
    async (prisma) => {
      const reviews = await prisma.review.findMany({
        include: {
          villa: { select: { id: true, title: true } },
          replies: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return reviews.map((review) => ({
        id: review.id,
        villaId: review.villa.id,
        villaTitle: review.villa.title,
        status: review.status,
        authorName: review.authorName,
        rating: review.rating,
        title: review.title || undefined,
        body: review.body,
        stayDate: formatDate(review.stayDate),
        publishedAt: formatDateTime(review.publishedAt),
        reply: review.replies[0]
          ? {
              id: review.replies[0].id,
              responderType: review.replies[0].responderType,
              body: review.replies[0].body,
            }
          : undefined,
      }));
    },
    () => mapDemoReviewRecords(),
    [],
  );
});

export const getAdminAuditTrail = cache(async (): Promise<AdminAuditLogRecord[]> => {
  return withDbFallback(
    async (prisma) => {
      const logs = await prisma.auditLog.findMany({
        include: {
          actorUser: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      return logs.map((log) => {
        const metadata =
          log.metadata && typeof log.metadata === "object"
            ? (log.metadata as Record<string, unknown>)
            : undefined;

        return {
          id: log.id,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          entityLabel:
            typeof metadata?.entityLabel === "string"
              ? metadata.entityLabel
              : log.entityId,
          message: log.message,
          createdAt: log.createdAt.toISOString(),
          actorLabel: log.actorUser
            ? `${log.actorUser.firstName} ${log.actorUser.lastName}`
            : undefined,
        };
      });
    },
    [],
    [],
  );
});

export const getAdminVillaList = cache(async () => {
  return withDbFallback(
    async (prisma) => {
      const villas = await prisma.villa.findMany({
        include: {
          region: { select: { name: true } },
          district: { select: { name: true } },
          verification: true,
          media: { select: { id: true, isCover: true } },
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      });

      return villas.map((villa) => {
        const warnings = getVillaPublishWarnings({
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
          basePrice: decimalToNumber(villa.basePrice),
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
        });

        return {
          id: villa.id,
          slug: villa.slug,
          title: villa.title,
          location: `${villa.district.name}, ${villa.region.name}`,
          nightlyPrice: decimalToNumber(villa.basePrice),
          status: villa.status,
          verificationStatus: villa.verificationStatus,
          publishWarnings: warnings,
          verificationCompleted: warnings.every(
            (warning) => !warning.includes("doğrulama"),
          ),
        };
      });
    },
    () =>
      demoVillas.map((villa) => ({
        id: villa.id,
        slug: villa.slug,
        title: villa.title,
        location: `${villa.district.name}, ${villa.region.name}`,
        nightlyPrice: villa.pricing.basePrice,
        status: "PUBLISHED" as const,
        verificationStatus: "VERIFIED" as const,
        publishWarnings: [],
        verificationCompleted: true,
      })),
    [],
  );
});

export async function getAdminVillaEditor(id: string): Promise<AdminVillaEditorRecord | null> {
  return withDbFallback(
    async (prisma) => {
      const villa = await prisma.villa.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
        },
        include: {
          owner: true,
          region: true,
          district: true,
          verification: true,
          media: {
            include: { file: true },
            orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
          },
          documents: {
            include: { file: true },
            orderBy: { createdAt: "desc" },
          },
          availabilityBlocks: {
            orderBy: { startDate: "asc" },
          },
        },
      });

      if (!villa) {
        return null;
      }

      const media = villa.media.map(mapVillaMedia);
      const verification = {
        identityVerified: Boolean(villa.verification?.identityVerified),
        ownershipOrAuthorityVerified: Boolean(
          villa.verification?.ownershipOrAuthorityVerified,
        ),
        tourismPermitVerified: Boolean(villa.verification?.tourismPermitVerified),
        locationVerified: Boolean(villa.verification?.locationVerified),
        photosVerified: Boolean(villa.verification?.photosVerified),
        phoneVerified: Boolean(villa.verification?.phoneVerified),
      };

      return {
        id: villa.id,
        slug: villa.slug,
        title: villa.title,
        shortDescription: villa.shortDescription,
        description: villa.description,
        status: villa.status,
        verificationStatus: villa.verificationStatus,
        ownerId: villa.ownerId,
        ownerName: villa.owner.displayName,
        regionId: villa.regionId,
        regionName: villa.region.name,
        districtId: villa.districtId,
        districtName: villa.district.name,
        addressPublic: villa.addressPublic,
        addressPrivate: villa.addressPrivate,
        maxGuests: villa.maxGuests,
        bedroomCount: villa.bedroomCount,
        bathroomCount: villa.bathroomCount,
        bedCount: villa.bedCount,
        basePrice: decimalToNumber(villa.basePrice),
        cleaningFee: decimalToNumber(villa.cleaningFee),
        depositAmount: decimalToNumber(villa.depositAmount),
        serviceFeeType: villa.serviceFeeType,
        serviceFeeValue: decimalToNumber(villa.serviceFeeValue),
        extraGuestFee: decimalToNumber(villa.extraGuestFee),
        minNights: villa.minNights,
        checkInTime: villa.checkInTime,
        checkOutTime: villa.checkOutTime,
        publishedAt: formatDateTime(villa.publishedAt),
        reviewRequestedAt: formatDateTime(villa.reviewRequestedAt),
        ownerRevisionNotes: villa.ownerRevisionNotes || undefined,
        verification: {
          ...verification,
          verificationNotes: villa.verification?.verificationNotes || undefined,
          lastVerifiedAt: formatDateTime(villa.verification?.lastVerifiedAt),
        },
        features: {
          hasPrivatePool: villa.hasPrivatePool,
          hasHeatedPool: villa.hasHeatedPool,
          hasJacuzzi: villa.hasJacuzzi,
          isShelteredPool: villa.isShelteredPool,
          isConservativeFriendly: villa.isConservativeFriendly,
          isPetFriendly: villa.isPetFriendly,
          isChildFriendly: villa.isChildFriendly,
          hasSeaView: villa.hasSeaView,
          hasNatureView: villa.hasNatureView,
          nearBeach: villa.nearBeach,
          nearCenter: villa.nearCenter,
          hasBarbecue: villa.hasBarbecue,
          hasFireplace: villa.hasFireplace,
          hasParking: villa.hasParking,
          hasAirConditioning: villa.hasAirConditioning,
          hasInternet: villa.hasInternet,
          isWheelchairFriendly: villa.isWheelchairFriendly,
        },
        media,
        documents: villa.documents.map(mapVillaDocument),
        availabilityBlocks: villa.availabilityBlocks.map((block) => ({
          id: block.id,
          startDate: formatDate(block.startDate) || "",
          endDate: formatDate(block.endDate) || "",
          type: block.type,
          reason: block.reason || undefined,
        })),
        publishWarnings: getVillaPublishWarnings({
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
          basePrice: decimalToNumber(villa.basePrice),
          minNights: villa.minNights,
          mediaCount: media.length,
          hasCoverImage: media.some((item) => item.isCover),
          verification,
        }),
      };
    },
    () => mapDemoVillaEditor(id),
    null,
  );
}

export const getAdminOwnerOptions = cache(async (): Promise<AdminOption[]> => {
  const owners = await getOwners();
  return owners.map((owner) => ({
    id: owner.id,
    label: owner.displayName,
    meta: owner.type,
  }));
});

export const getAdminRegionOptions = cache(async (): Promise<AdminOption[]> => {
  const regions = await getRegions();
  return regions.map((region) => ({
    id: region.id,
    label: region.name,
    slug: region.slug,
  }));
});

export const getAdminDistrictOptions = cache(async (): Promise<AdminOption[]> => {
  const districts = await getDistricts();
  return districts.map((district) => ({
    id: district.id,
    label: district.name,
    slug: district.slug,
    meta: district.regionSlug,
  }));
});

export const getAdminSeoTargetOptions = cache(async (): Promise<AdminOption[]> => {
  const [regions, districts, concepts] = await Promise.all([
    getRegions(),
    getDistricts(),
    getConcepts(),
  ]);

  return [
    ...regions.map((region) => ({
      id: region.id,
      label: `Bölge: ${region.name}`,
      slug: region.slug,
      meta: "REGION",
    })),
    ...districts.map((district) => ({
      id: district.id,
      label: `İlçe: ${district.name}`,
      slug: district.slug,
      meta: "LANDING",
    })),
    ...concepts.map((concept) => ({
      id: concept.id,
      label: `Konsept: ${concept.name}`,
      slug: concept.slug,
      meta: "CONCEPT",
    })),
  ];
});
