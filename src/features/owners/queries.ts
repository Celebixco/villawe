import { cache } from "react";

import { demoAmenities } from "@/lib/demo-data";
import { getDatabaseHealth, withDbFallback } from "@/lib/db/prisma";
import { getConcepts, getDistricts, getRegions } from "@/features/villas/queries";
import {
  canOwnerSubmitVillaForReview,
  getOwnerVillaChecklist,
} from "@/features/owners/checklist";
import type {
  OwnerAvailabilityBlockRecord,
  OwnerDashboardRecord,
  OwnerDocumentRecord,
  OwnerInquiryDetailRecord,
  OwnerInquirySummaryRecord,
  OwnerModuleState,
  OwnerOption,
  OwnerSeasonPriceRecord,
  OwnerVillaEditorRecord,
  OwnerVillaMediaRecord,
  OwnerVillaSummaryRecord,
} from "@/features/owners/types";

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

function formatDate(date?: Date | null) {
  return date ? date.toISOString().slice(0, 10) : undefined;
}

function formatDateTime(date?: Date | null) {
  return date ? date.toISOString() : undefined;
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function getPrivateFileUrl(fileId: string) {
  return `/api/private-files/${fileId}`;
}

type OwnerChecklistSource = {
  title: string;
  shortDescription: string;
  description: string;
  regionId: string;
  districtId: string;
  addressPublic: string;
  addressPrivate: string;
  maxGuests: number;
  bedroomCount: number;
  bathroomCount: number;
  bedCount: number;
  basePrice: unknown;
  minNights: number;
  cancellationPolicyId?: string | null;
  depositPolicyId?: string | null;
  amenities: Array<{ amenityId: string }>;
  concepts: Array<{ conceptId: string }>;
  media: Array<{ isCover: boolean }>;
  owner: { type: "INDIVIDUAL" | "COMPANY" | "AGENCY"; documents: Array<{ documentType: string }> };
  documents: Array<{ documentType: string }>;
  houseRules?: unknown;
};

function buildChecklist(source: OwnerChecklistSource) {
  return getOwnerVillaChecklist({
    basicInfoComplete:
      Boolean(source.title.trim()) &&
      source.shortDescription.trim().length >= 20 &&
      source.description.trim().length >= 80,
    locationComplete:
      Boolean(source.regionId) &&
      Boolean(source.districtId) &&
      Boolean(source.addressPublic.trim()) &&
      Boolean(source.addressPrivate.trim()),
    capacityComplete:
      source.maxGuests > 0 &&
      source.bedroomCount > 0 &&
      source.bathroomCount > 0 &&
      source.bedCount > 0,
    amenitiesComplete: source.amenities.length > 0 && source.concepts.length > 0,
    pricingComplete: decimalToNumber(source.basePrice) > 0 && source.minNights >= 1,
    mediaCount: source.media.length,
    hasCoverImage: source.media.some((item) => item.isCover),
    rulesComplete:
      toStringArray(source.houseRules).length > 0 &&
      Boolean(source.cancellationPolicyId) &&
      Boolean(source.depositPolicyId),
    ownerType: source.owner.type,
    ownerDocumentTypes: source.owner.documents.map((item) => item.documentType),
    villaDocumentTypes: source.documents.map((item) => item.documentType),
  });
}

function mapMedia(input: {
  id: string;
  sortOrder: number;
  isCover: boolean;
  altText?: string | null;
  file: { id: string; url: string; originalName: string; altText?: string | null };
}): OwnerVillaMediaRecord {
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

function mapDocument(
  input: {
    id: string;
    documentType: string;
    note?: string | null;
    isVerified: boolean;
    verifiedAt?: Date | null;
    file: { id: string; originalName: string; mimeType: string };
  },
  scope: "owner" | "villa",
): OwnerDocumentRecord {
  const result: OwnerDocumentRecord = {
    id: input.id,
    fileId: input.file.id,
    url: getPrivateFileUrl(input.file.id),
    originalName: input.file.originalName,
    mimeType: input.file.mimeType,
    documentType: input.documentType,
    isVerified: input.isVerified,
    scope,
  };

  if (input.note) {
    result.note = input.note;
  }

  const verifiedAt = formatDateTime(input.verifiedAt);
  if (verifiedAt) {
    result.verifiedAt = verifiedAt;
  }

  return result;
}

function mapSeasonPrice(input: {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  nightlyPrice: unknown;
  minNightsOverride?: number | null;
  cleaningFeeOverride?: unknown;
  depositOverride?: unknown;
  serviceFeeOverride?: unknown;
  extraGuestFeeOverride?: unknown;
}): OwnerSeasonPriceRecord {
  const result: OwnerSeasonPriceRecord = {
    id: input.id,
    name: input.name,
    startDate: formatDate(input.startDate) || "",
    endDate: formatDate(input.endDate) || "",
    nightlyPrice: decimalToNumber(input.nightlyPrice),
  };

  if (input.minNightsOverride != null) {
    result.minNightsOverride = input.minNightsOverride;
  }
  if (input.cleaningFeeOverride != null) {
    result.cleaningFeeOverride = decimalToNumber(input.cleaningFeeOverride);
  }
  if (input.depositOverride != null) {
    result.depositOverride = decimalToNumber(input.depositOverride);
  }
  if (input.serviceFeeOverride != null) {
    result.serviceFeeOverride = decimalToNumber(input.serviceFeeOverride);
  }
  if (input.extraGuestFeeOverride != null) {
    result.extraGuestFeeOverride = decimalToNumber(input.extraGuestFeeOverride);
  }

  return result;
}

function mapAvailabilityBlock(input: {
  id: string;
  startDate: Date;
  endDate: Date;
  type: "BLOCKED" | "HOLD" | "RESERVED" | "MAINTENANCE" | "OWNER_USE";
  reason?: string | null;
  createdAt: Date;
}): OwnerAvailabilityBlockRecord {
  const result: OwnerAvailabilityBlockRecord = {
    id: input.id,
    startDate: formatDate(input.startDate) || "",
    endDate: formatDate(input.endDate) || "",
    type: input.type,
    createdAt: input.createdAt.toISOString(),
  };

  if (input.reason) {
    result.reason = input.reason;
  }

  return result;
}

function mapInquiry(input: {
  id: string;
  status:
    | "NEW"
    | "REVIEWING"
    | "QUOTED"
    | "ACCEPTED"
    | "DECLINED"
    | "EXPIRED"
    | "CONVERTED"
    | "SPAM";
  fullName: string;
  email: string;
  phone: string;
  guestCount: number;
  estimatedTotal?: unknown;
  startDate?: Date | null;
  endDate?: Date | null;
  message?: string | null;
  ownerNote?: string | null;
  ownerSeenAt?: Date | null;
  pricingSnapshot?: unknown;
  createdAt: Date;
  villa: { id: string; title: string };
}): OwnerInquiryDetailRecord {
  const result: OwnerInquiryDetailRecord = {
    id: input.id,
    villaId: input.villa.id,
    villaTitle: input.villa.title,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    guestCount: input.guestCount,
    status: input.status,
    createdAt: input.createdAt.toISOString(),
  };

  if (input.estimatedTotal != null) {
    result.estimatedTotal = decimalToNumber(input.estimatedTotal);
  }
  const startDate = formatDate(input.startDate);
  if (startDate) {
    result.startDate = startDate;
  }
  const endDate = formatDate(input.endDate);
  if (endDate) {
    result.endDate = endDate;
  }
  if (input.message) {
    result.message = input.message;
  }
  if (input.ownerNote) {
    result.ownerNote = input.ownerNote;
  }
  const ownerSeenAt = formatDateTime(input.ownerSeenAt);
  if (ownerSeenAt) {
    result.ownerSeenAt = ownerSeenAt;
  }
  if (input.pricingSnapshot) {
    result.pricingSnapshot = JSON.stringify(input.pricingSnapshot, null, 2);
  }

  return result;
}

export const getOwnerModuleState = cache(async (): Promise<OwnerModuleState> => {
  const health = await getDatabaseHealth();

  return {
    mode: health.status,
    message: health.message,
    readOnly: health.status !== "database",
  };
});

export const getOwnerFormOptions = cache(async () => {
  const [regions, districts, concepts, amenities, cancellationPolicies, depositPolicies] =
    await Promise.all([
      getRegions(),
      getDistricts(),
      getConcepts(),
      withDbFallback(
        async (prisma) => {
          const rows = await prisma.amenity.findMany({
            orderBy: [{ category: "asc" }, { name: "asc" }],
          });

          return rows.map<OwnerOption>((item) => ({
            id: item.id,
            label: item.name,
            meta: item.category,
          }));
        },
        demoAmenities.map((item) => ({ id: item.slug, label: item.name, meta: item.category })),
        [],
      ),
      withDbFallback(
        async (prisma) => {
          const rows = await prisma.cancellationPolicy.findMany({ orderBy: { name: "asc" } });
          return rows.map<OwnerOption>((item) => ({ id: item.id, label: item.name }));
        },
        [],
        [],
      ),
      withDbFallback(
        async (prisma) => {
          const rows = await prisma.depositPolicy.findMany({ orderBy: { name: "asc" } });
          return rows.map<OwnerOption>((item) => ({ id: item.id, label: item.name }));
        },
        [],
        [],
      ),
    ]);

  return {
    regions: regions.map((item) => ({ id: item.id, label: item.name })),
    districts: districts.map((item) => ({ id: item.id, label: item.name, meta: item.regionSlug })),
    concepts: concepts.map((item) => ({ id: item.id, label: item.name })),
    amenities,
    cancellationPolicies,
    depositPolicies,
  };
});

export async function getOwnerDashboardData(ownerId: string): Promise<OwnerDashboardRecord> {
  return withDbFallback(
    async (prisma) => {
      const [villas, ownerDocuments, inquiries] = await Promise.all([
        prisma.villa.findMany({
          where: { ownerId },
          include: {
            owner: { include: { documents: true } },
            documents: true,
            amenities: { select: { amenityId: true } },
            concepts: { select: { conceptId: true } },
            media: { select: { isCover: true } },
          },
        }),
        prisma.ownerDocument.findMany({ where: { ownerId } }),
        prisma.inquiry.findMany({
          where: { villa: { ownerId } },
          include: { villa: { select: { id: true, title: true } } },
        }),
      ]);

      const incompleteListings = villas.filter((villa) => {
        const checklist = buildChecklist(villa);
        return !canOwnerSubmitVillaForReview(checklist);
      }).length;

      const now = new Date();
      const upcomingRequests = inquiries.filter(
        (item) => item.startDate && item.startDate >= now,
      ).length;

      return {
        totalVillas: villas.length,
        draftVillas: villas.filter((item) => item.status === "DRAFT").length,
        pendingReviewVillas: villas.filter((item) => item.status === "PENDING_REVIEW").length,
        publishedVillas: villas.filter((item) => item.status === "PUBLISHED").length,
        suspendedOrRejectedVillas: villas.filter((item) => item.status === "SUSPENDED").length,
        newInquiries: inquiries.filter((item) => item.status === "NEW").length,
        upcomingRequests,
        incompleteListings,
        verifiedDocuments: ownerDocuments.filter((item) => item.isVerified).length,
        totalDocuments: ownerDocuments.length,
      };
    },
    {
      totalVillas: 0,
      draftVillas: 0,
      pendingReviewVillas: 0,
      publishedVillas: 0,
      suspendedOrRejectedVillas: 0,
      newInquiries: 0,
      upcomingRequests: 0,
      incompleteListings: 0,
      verifiedDocuments: 0,
      totalDocuments: 0,
    },
    {
      totalVillas: 0,
      draftVillas: 0,
      pendingReviewVillas: 0,
      publishedVillas: 0,
      suspendedOrRejectedVillas: 0,
      newInquiries: 0,
      upcomingRequests: 0,
      incompleteListings: 0,
      verifiedDocuments: 0,
      totalDocuments: 0,
    },
  );
}

export async function getOwnerVillaSummaries(ownerId: string): Promise<OwnerVillaSummaryRecord[]> {
  return withDbFallback(
    async (prisma) => {
      const villas = await prisma.villa.findMany({
        where: { ownerId },
        include: {
          region: true,
          district: true,
          owner: { include: { documents: { select: { documentType: true } } } },
          documents: { select: { documentType: true } },
          amenities: { select: { amenityId: true } },
          concepts: { select: { conceptId: true } },
          media: {
            include: { file: true },
            orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
          },
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      });

      return villas.map((villa) => {
        const checklist = buildChecklist(villa);
        const cover = villa.media.find((item) => item.isCover) || villa.media[0];
        const result: OwnerVillaSummaryRecord = {
          id: villa.id,
          slug: villa.slug,
          title: villa.title,
          status: villa.status,
          regionName: villa.region.name,
          districtName: villa.district.name,
          updatedAt: villa.updatedAt.toISOString(),
          mediaCount: villa.media.length,
          isComplete: canOwnerSubmitVillaForReview(checklist),
          checklistPendingCount: checklist.filter((item) => !item.complete).length,
        };

        const reviewRequestedAt = formatDateTime(villa.reviewRequestedAt);
        if (reviewRequestedAt) {
          result.reviewRequestedAt = reviewRequestedAt;
        }
        if (cover?.file.url) {
          result.coverImageUrl = cover.file.url;
        }

        return result;
      });
    },
    [],
    [],
  );
}

export async function getOwnerVillaEditor(
  ownerId: string,
  villaId: string,
): Promise<OwnerVillaEditorRecord | null> {
  return withDbFallback(
    async (prisma) => {
      const villa = await prisma.villa.findFirst({
        where: { id: villaId, ownerId },
        include: {
          owner: {
            include: {
              documents: {
                include: { file: true },
                orderBy: { createdAt: "desc" },
              },
            },
          },
          region: true,
          district: true,
          amenities: { select: { amenityId: true } },
          concepts: { select: { conceptId: true } },
          media: {
            include: { file: true },
            orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
          },
          documents: {
            include: { file: true },
            orderBy: { createdAt: "desc" },
          },
          seasonPrices: {
            orderBy: { startDate: "asc" },
          },
          availabilityBlocks: {
            orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
          },
        },
      });

      if (!villa) {
        return null;
      }

      const checklist = buildChecklist(villa);

      const result: OwnerVillaEditorRecord = {
        id: villa.id,
        slug: villa.slug,
        title: villa.title,
        shortDescription: villa.shortDescription,
        description: villa.description,
        status: villa.status,
        ownerStatus: villa.owner.status,
        verificationStatus: villa.verificationStatus,
        regionId: villa.regionId,
        districtId: villa.districtId,
        regionName: villa.region.name,
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
        houseRules: toStringArray(villa.houseRules),
        poolDetails: toStringArray(villa.poolDetails),
        nearbyPlaces: toStringArray(villa.nearbyPlaces),
        features: {
          hasPrivatePool: villa.hasPrivatePool,
          hasHeatedPool: villa.hasHeatedPool,
          hasJacuzzi: villa.hasJacuzzi,
          isShelteredPool: villa.isShelteredPool,
          isConservativeFriendly: villa.isConservativeFriendly,
          isPetFriendly: villa.isPetFriendly,
          isChildFriendly: villa.isChildFriendly,
          isFamilyFriendly: villa.isFamilyFriendly,
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
        amenityIds: villa.amenities.map((item) => item.amenityId),
        conceptIds: villa.concepts.map((item) => item.conceptId),
        media: villa.media.map(mapMedia),
        ownerDocuments: villa.owner.documents.map((item) => mapDocument(item, "owner")),
        villaDocuments: villa.documents.map((item) => mapDocument(item, "villa")),
        seasonPrices: villa.seasonPrices.map(mapSeasonPrice),
        availabilityBlocks: villa.availabilityBlocks.map((item) =>
          mapAvailabilityBlock({
            id: item.id,
            startDate: item.startDate,
            endDate: item.endDate,
            type: item.type,
            reason: item.reason,
            createdAt: item.createdAt,
          }),
        ),
        checklist,
      };

      if (villa.ownerRevisionNotes) {
        result.ownerRevisionNotes = villa.ownerRevisionNotes;
      }
      const reviewRequestedAt = formatDateTime(villa.reviewRequestedAt);
      if (reviewRequestedAt) {
        result.reviewRequestedAt = reviewRequestedAt;
      }
      if (villa.neighborhoodId) {
        result.neighborhoodId = villa.neighborhoodId;
      }
      if (villa.cancellationPolicyId) {
        result.cancellationPolicyId = villa.cancellationPolicyId;
      }
      if (villa.depositPolicyId) {
        result.depositPolicyId = villa.depositPolicyId;
      }

      return result;
    },
    null,
    null,
  );
}

export async function getOwnerInquirySummaries(
  ownerId: string,
): Promise<OwnerInquirySummaryRecord[]> {
  const inquiries = await withDbFallback(
    async (prisma) => {
      const rows = await prisma.inquiry.findMany({
        where: { villa: { ownerId } },
        include: {
          villa: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return rows.map((item) => mapInquiry(item));
    },
    [],
    [],
  );

  return inquiries.map((item) => {
    const summary: OwnerInquirySummaryRecord = {
      id: item.id,
      villaId: item.villaId,
      villaTitle: item.villaTitle,
      fullName: item.fullName,
      email: item.email,
      phone: item.phone,
      guestCount: item.guestCount,
      status: item.status,
      createdAt: item.createdAt,
    };

    if (item.estimatedTotal != null) {
      summary.estimatedTotal = item.estimatedTotal;
    }
    if (item.startDate) {
      summary.startDate = item.startDate;
    }
    if (item.endDate) {
      summary.endDate = item.endDate;
    }
    if (item.ownerSeenAt) {
      summary.ownerSeenAt = item.ownerSeenAt;
    }

    return summary;
  });
}

export async function getOwnerInquiryById(ownerId: string, inquiryId: string) {
  return withDbFallback(
    async (prisma) => {
      const inquiry = await prisma.inquiry.findFirst({
        where: {
          id: inquiryId,
          villa: { ownerId },
        },
        include: {
          villa: { select: { id: true, title: true } },
        },
      });

      return inquiry ? mapInquiry(inquiry) : null;
    },
    null,
    null,
  );
}
