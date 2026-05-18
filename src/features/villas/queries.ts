import { cache } from "react";

import { calculateVillaEstimate } from "@/features/bookings/pricing";
import type {
  AuditLogRecord,
  BlogPostRecord,
  ConceptRecord,
  DistrictRecord,
  InquiryRecord,
  OwnerRecord,
  RegionRecord,
  SeoPageRuntimeRecord,
  SeoLandingTarget,
  VillaDetail,
} from "@/features/villas/types";
import {
  demoAuditLogs,
  demoBlogPosts,
  demoConcepts,
  demoDistricts,
  demoInquiries,
  demoOwners,
  demoRegions,
  demoSeoTargets,
  demoVillas,
} from "@/lib/demo-data";
import {
  publicCacheKeys,
  searchCacheKeys,
  seoCacheKeys,
} from "@/lib/cache/keys";
import { withRedisJsonCache } from "@/lib/cache/redis-cache";
import { getDatabaseHealth, withDbFallback } from "@/lib/db/prisma";

type PrismaConceptLink = { concept: { slug: string; name: string } };
type PrismaAmenityLink = {
  amenity: { slug: string; name: string; category: string };
};
type PrismaMediaItem = {
  id: string;
  file?: { url?: string | null; altText?: string | null } | null;
  altText?: string | null;
  isCover?: boolean;
  sortOrder?: number;
};
type PrismaSeasonPrice = {
  name: string;
  startDate: Date;
  endDate: Date;
  nightlyPrice: unknown;
  minNightsOverride?: number | null;
};
type PrismaBed = { bedType: string; quantity: number; sleeps: number };
type PrismaRoom = {
  id: string;
  name: string;
  roomType: string;
  description?: string | null;
  beds?: PrismaBed[];
};
type PrismaAvailabilityBlock = {
  startDate: Date;
  endDate: Date;
  type: string;
  reason?: string | null;
};
type PrismaReviewReply = {
  responderType: string;
  body: string;
};
type PrismaReview = {
  id: string;
  authorName: string;
  rating: number;
  title?: string | null;
  body: string;
  stayDate?: Date | null;
  replies?: PrismaReviewReply[];
};
type PrismaVerification = {
  identityVerified?: boolean;
  ownershipOrAuthorityVerified?: boolean;
  tourismPermitVerified?: boolean;
  locationVerified?: boolean;
  photosVerified?: boolean;
  phoneVerified?: boolean;
  lastVerifiedAt?: Date | null;
  verificationNotes?: string | null;
  verifiedByAdmin?: { firstName: string; lastName: string } | null;
};
type PrismaVillaLike = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  region?: { id?: string; name: string; slug: string } | null;
  district?: { id?: string; name: string; slug: string } | null;
  owner?: { displayName: string } | null;
  maxGuests: number;
  bedroomCount: number;
  bathroomCount: number;
  bedCount: number;
  basePrice: unknown;
  cleaningFee: unknown;
  depositAmount: unknown;
  serviceFeeType: string;
  serviceFeeValue: unknown;
  extraGuestFee: unknown;
  minNights: number;
  description: string;
  checkInTime: string;
  checkOutTime: string;
  hasPrivatePool: boolean;
  hasHeatedPool: boolean;
  hasJacuzzi: boolean;
  isShelteredPool: boolean;
  isConservativeFriendly: boolean;
  isPetFriendly: boolean;
  isChildFriendly: boolean;
  hasSeaView: boolean;
  hasNatureView: boolean;
  nearBeach: boolean;
  nearCenter: boolean;
  hasBarbecue: boolean;
  hasFireplace: boolean;
  hasParking: boolean;
  hasAirConditioning: boolean;
  hasInternet: boolean;
  isWheelchairFriendly: boolean;
  addressPublic: string;
  cancellationPolicy?: { summary: string } | null;
  depositPolicy?: { summary: string } | null;
  concepts?: PrismaConceptLink[];
  amenities?: PrismaAmenityLink[];
  media?: PrismaMediaItem[];
  verification?: PrismaVerification | null;
  seasonPrices?: PrismaSeasonPrice[];
  rooms?: PrismaRoom[];
  poolDetails?: unknown;
  houseRules?: unknown;
  nearbyPlaces?: unknown;
  availabilityBlocks?: PrismaAvailabilityBlock[];
  reviews?: PrismaReview[];
};
type PrismaRegionRecord = {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};
type PrismaDistrictRecord = {
  id: string;
  name: string;
  slug: string;
  region: { slug: string };
};
type PrismaConceptRecord = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};
type PrismaBlogPostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt?: Date | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  coverFile?: { url?: string | null } | null;
};
type PrismaOwnerRecord = {
  id: string;
  displayName: string;
  type: "AGENCY" | "INDIVIDUAL";
  email: string;
  phone: string;
};
type PrismaInquiryRecord = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  guestCount: number;
  status: string;
  estimatedTotal?: unknown;
  startDate?: Date | null;
  endDate?: Date | null;
  createdAt: Date;
  villa: { title: string };
};
type PrismaAuditLogRecord = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  message: string;
  createdAt: Date;
  metadata?: unknown;
};
type PrismaSeoPageRecord = {
  id: string;
  slug: string;
  pageType: string;
  title: string;
  description: string;
  h1?: string | null;
  intro?: string | null;
  body?: string | null;
  canonicalPath?: string | null;
  targetEntityId?: string | null;
  noIndex?: boolean;
  ogTitle?: string | null;
  ogDescription?: string | null;
};

function mapServiceFeeType(value: string): "none" | "fixed" | "percentage" | "included" {
  const normalized = value.toLowerCase();

  if (
    normalized === "none" ||
    normalized === "fixed" ||
    normalized === "percentage" ||
    normalized === "included"
  ) {
    return normalized;
  }

  return "fixed";
}

function mapAvailabilityType(
  value: string,
): "blocked" | "hold" | "reserved" | "maintenance" | "owner_use" {
  const normalized = value.toLowerCase();

  if (
    normalized === "blocked" ||
    normalized === "hold" ||
    normalized === "reserved" ||
    normalized === "maintenance" ||
    normalized === "owner_use"
  ) {
    return normalized;
  }

  return "blocked";
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

function mapVillaFromPrisma(villa: PrismaVillaLike): VillaDetail {
  const concepts =
    villa.concepts?.map((item) => ({
      slug: item.concept.slug,
      name: item.concept.name,
    })) || [];

  const amenities =
    villa.amenities?.map((item) => ({
      slug: item.amenity.slug,
      name: item.amenity.name,
      category: item.amenity.category,
    })) || [];

  const media =
    villa.media
      ?.sort((left, right) => {
        if (left.isCover && !right.isCover) return -1;
        if (!left.isCover && right.isCover) return 1;
        return (left.sortOrder || 0) - (right.sortOrder || 0);
      })
      .map((item) => ({
        id: item.id,
        url: item.file?.url || "/images/villawe/villa-fallback.svg",
        alt: item.altText || item.file?.altText || villa.title,
        isCover: item.isCover,
      })) || [];

  const coverImage = media.find((item) => item.isCover) || media[0] || {
    id: `${villa.id}-fallback`,
    url: "/images/villawe/villa-fallback.svg",
    alt: villa.title,
    isCover: true,
  };

  const verification = villa.verification || {};
  return {
    id: villa.id,
    slug: villa.slug,
    title: villa.title,
    shortDescription: villa.shortDescription,
    summary: villa.shortDescription,
    region: {
      name: villa.region?.name || "",
      slug: villa.region?.slug || "",
    },
    district: {
      name: villa.district?.name || "",
      slug: villa.district?.slug || "",
    },
    maxGuests: villa.maxGuests,
    bedroomCount: villa.bedroomCount,
    bathroomCount: villa.bathroomCount,
    bedCount: villa.bedCount,
    isFeatured: true,
    isNewest: true,
    pricing: {
      basePrice: decimalToNumber(villa.basePrice),
      cleaningFee: decimalToNumber(villa.cleaningFee),
      depositAmount: decimalToNumber(villa.depositAmount),
      serviceFeeType: mapServiceFeeType(villa.serviceFeeType),
      serviceFeeValue: decimalToNumber(villa.serviceFeeValue),
      extraGuestFee: decimalToNumber(villa.extraGuestFee),
      minNights: villa.minNights,
      cancellationPolicy:
        villa.cancellationPolicy?.summary ||
        "İptal koşulları talep onayı öncesinde netleştirilir.",
      depositPolicy:
        villa.depositPolicy?.summary ||
        "Depozito koşulları talep özeti içinde açıkça belirtilir.",
      seasonPrices:
        villa.seasonPrices?.map((season) => ({
          name: season.name,
          startDate: season.startDate.toISOString().slice(0, 10),
          endDate: season.endDate.toISOString().slice(0, 10),
          nightlyPrice: decimalToNumber(season.nightlyPrice),
          ...(season.minNightsOverride
            ? { minNightsOverride: season.minNightsOverride }
            : {}),
        })) || [],
    },
    concepts,
    amenities,
    coverImage,
    verification: {
      identityVerified: Boolean(verification.identityVerified),
      ownershipOrAuthorityVerified: Boolean(verification.ownershipOrAuthorityVerified),
      tourismPermitVerified: Boolean(verification.tourismPermitVerified),
      locationVerified: Boolean(verification.locationVerified),
      photosVerified: Boolean(verification.photosVerified),
      phoneVerified: Boolean(verification.phoneVerified),
      ...(verification.lastVerifiedAt
        ? { lastVerifiedAt: verification.lastVerifiedAt.toISOString().slice(0, 10) }
        : {}),
      ...(verification.verifiedByAdmin?.firstName
        ? {
            verifiedByLabel: `${verification.verifiedByAdmin.firstName} ${verification.verifiedByAdmin.lastName}`,
          }
        : {}),
      ...(verification.verificationNotes
        ? { verificationNotes: verification.verificationNotes }
        : {}),
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
    description: villa.description,
    checkInTime: villa.checkInTime,
    checkOutTime: villa.checkOutTime,
    ownerName: villa.owner?.displayName || "Villawe",
    media,
    rooms:
      villa.rooms?.map((room) => ({
        id: room.id,
        name: room.name,
        roomType: room.roomType,
        description: room.description || undefined,
        beds:
          room.beds?.map((bed) => ({
            type: bed.bedType,
            quantity: bed.quantity,
            sleeps: bed.sleeps,
          })) || [],
      })) || [],
    poolDetails: (villa.poolDetails as string[]) || [],
    houseRules: (villa.houseRules as string[]) || [],
    nearbyPlaces:
      (villa.nearbyPlaces as Array<{
        name: string;
        distanceLabel: string;
        category: string;
      }>) || [],
    availabilityBlocks:
      villa.availabilityBlocks?.map((block) => ({
        startDate: block.startDate.toISOString().slice(0, 10),
        endDate: block.endDate.toISOString().slice(0, 10),
        type: mapAvailabilityType(block.type),
        label: block.reason || block.type,
      })) || [],
    reviews:
      villa.reviews?.map((review) => ({
        id: review.id,
        authorName: review.authorName,
        rating: review.rating,
        title: review.title || "",
        body: review.body,
        stayDate: review.stayDate?.toISOString().slice(0, 10) || "",
        ...(review.replies?.[0]
          ? {
              reply: {
                responder:
                  review.replies[0].responderType === "OWNER"
                    ? "Villa Sahibi"
                    : "Villawe Ekibi",
                body: review.replies[0].body,
              },
            }
          : {}),
      })) || [],
    addressPublic: villa.addressPublic,
    locationLabel: `${villa.district?.name || ""}, ${villa.region?.name || ""}`,
    similarVillaSlugs: [],
  };
}

function mapRegionFromPrisma(region: PrismaRegionRecord): RegionRecord {
  return {
    id: region.id,
    name: region.name,
    slug: region.slug,
    shortDescription:
      region.shortDescription ||
      `${region.name} için doğrulanmış villa seçkisi ve şeffaf fiyat akışı.`,
    heroTitle:
      region.seoTitle || `${region.name}'ta güvenilir villa kiralama seçenekleri`,
    heroDescription:
      region.seoDescription ||
      region.shortDescription ||
      `${region.name} için doğrulanmış, şeffaf fiyat gösteren Villawe villaları.`,
  };
}

function mapDistrictFromPrisma(district: PrismaDistrictRecord): DistrictRecord {
  return {
    id: district.id,
    name: district.name,
    slug: district.slug,
    regionSlug: district.region.slug,
  };
}

function mapConceptFromPrisma(concept: PrismaConceptRecord): ConceptRecord {
  return {
    id: concept.id,
    name: concept.name,
    slug: concept.slug,
    description:
      concept.description ||
      `${concept.name} arayan misafirler için kürasyonlu Villawe seçkisi.`,
    heroTitle: `${concept.name} seçkisi`,
  };
}

function mapBlogPostFromPrisma(post: PrismaBlogPostRecord): BlogPostRecord {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverFile?.url || "/images/villawe/blog-guide.svg",
    content: post.content,
    publishedAt:
      post.publishedAt?.toISOString().slice(0, 10) ||
      new Date().toISOString().slice(0, 10),
    seoTitle: post.seoTitle || undefined,
    seoDescription: post.seoDescription || undefined,
  };
}

function mapSeoPageFromPrisma(page: PrismaSeoPageRecord): SeoPageRuntimeRecord {
  return {
    id: page.id,
    slug: page.slug,
    pageType: page.pageType as SeoPageRuntimeRecord["pageType"],
    title: page.title,
    description: page.description,
    h1: page.h1 || undefined,
    intro: page.intro || undefined,
    body: page.body || undefined,
    canonicalPath: page.canonicalPath || undefined,
    noIndex: Boolean(page.noIndex),
    ogTitle: page.ogTitle || undefined,
    ogDescription: page.ogDescription || undefined,
    targetEntityId: page.targetEntityId || undefined,
  };
}

function mapOwnerFromPrisma(owner: PrismaOwnerRecord): OwnerRecord {
  return {
    id: owner.id,
    displayName: owner.displayName,
    type: owner.type === "AGENCY" ? "agency" : "individual",
    email: owner.email,
    phone: owner.phone,
  };
}

function mapInquiryFromPrisma(inquiry: PrismaInquiryRecord): InquiryRecord {
  const normalizedStatus =
    inquiry.status.toLowerCase() as InquiryRecord["status"];

  return {
    id: inquiry.id,
    villaTitle: inquiry.villa.title,
    fullName: inquiry.fullName,
    email: inquiry.email,
    phone: inquiry.phone,
    startDate: inquiry.startDate?.toISOString().slice(0, 10),
    endDate: inquiry.endDate?.toISOString().slice(0, 10),
    guestCount: inquiry.guestCount,
    status: normalizedStatus,
    estimatedTotal: inquiry.estimatedTotal
      ? decimalToNumber(inquiry.estimatedTotal)
      : undefined,
    createdAt: inquiry.createdAt.toISOString(),
  };
}

function mapAuditLogFromPrisma(log: PrismaAuditLogRecord): AuditLogRecord {
  const metadata =
    log.metadata && typeof log.metadata === "object"
      ? (log.metadata as Record<string, unknown>)
      : undefined;

  return {
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityLabel:
      typeof metadata?.entityLabel === "string"
        ? metadata.entityLabel
        : log.entityId,
    message: log.message,
    createdAt: log.createdAt.toISOString(),
  };
}

function normalizeSearchParams(
  searchParams:
    | URLSearchParams
    | Record<string, string | string[] | undefined>
    | undefined,
) {
  if (!searchParams) {
    return new URLSearchParams();
  }

  if (searchParams instanceof URLSearchParams) {
    return searchParams;
  }

  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    if (value) {
      params.set(key, value);
    }
  });

  return params;
}

function villaHasConcept(villa: VillaDetail, conceptSlug: string) {
  return villa.concepts.some((concept) => concept.slug === conceptSlug);
}

function matchesFilters(villa: VillaDetail, params: URLSearchParams) {
  const region = params.get("region");
  const district = params.get("district");
  const guests = Number(params.get("guests") || 0);
  const bedrooms = Number(params.get("bedrooms") || 0);
  const bathrooms = Number(params.get("bathrooms") || 0);
  const minPrice = Number(params.get("minPrice") || 0);
  const maxPrice = Number(params.get("maxPrice") || 0);

  if (region && villa.region.slug !== region) return false;
  if (district && villa.district.slug !== district) return false;
  if (guests && villa.maxGuests < guests) return false;
  if (bedrooms && villa.bedroomCount < bedrooms) return false;
  if (bathrooms && villa.bathroomCount < bathrooms) return false;
  if (minPrice && villa.pricing.basePrice < minPrice) return false;
  if (maxPrice && villa.pricing.basePrice > maxPrice) return false;
  if (params.get("privatePool") === "1" && !villa.features.hasPrivatePool) return false;
  if (params.get("heatedPool") === "1" && !villa.features.hasHeatedPool) return false;
  if (params.get("shelteredPool") === "1" && !villa.features.isShelteredPool) return false;
  if (params.get("jacuzzi") === "1" && !villa.features.hasJacuzzi) return false;
  if (params.get("petFriendly") === "1" && !villa.features.isPetFriendly) return false;
  if (params.get("familyFriendly") === "1" && !villa.features.isChildFriendly) return false;
  if (params.get("nearBeach") === "1" && !villa.features.nearBeach) return false;
  if (params.get("nearCenter") === "1" && !villa.features.nearCenter) return false;
  if (params.get("seaView") === "1" && !villa.features.hasSeaView) return false;
  if (params.get("natureView") === "1" && !villa.features.hasNatureView) return false;
  if (params.get("wheelchairFriendly") === "1" && !villa.features.isWheelchairFriendly) return false;
  if (params.get("honeymoon") === "1" && !villaHasConcept(villa, "balayi-villalari")) return false;
  if (params.get("childPool") === "1" && !villaHasConcept(villa, "cocuk-havuzlu-villa")) return false;
  if (params.get("luxuryVilla") === "1" && villa.pricing.basePrice < 13000) return false;
  if (params.get("economicalVilla") === "1" && villa.pricing.basePrice > 9500) return false;

  return true;
}

async function withPublicReadCache<T>(key: string, ttlSeconds: number, loader: () => Promise<T>) {
  const health = await getDatabaseHealth();

  if (health.status !== "database") {
    return loader();
  }

  return withRedisJsonCache(key, ttlSeconds, loader);
}

export const getAllPublishedVillas = cache(async () => {
  return withPublicReadCache(publicCacheKeys.allPublishedVillas(), 300, () =>
    withDbFallback(
      async (prisma) => {
        const villas = await prisma.villa.findMany({
          where: { status: "PUBLISHED" },
          include: {
            region: true,
            district: true,
            owner: true,
            cancellationPolicy: true,
            depositPolicy: true,
            verification: {
              include: {
                verifiedByAdmin: true,
              },
            },
            concepts: { include: { concept: true } },
            amenities: { include: { amenity: true } },
            media: {
              include: { file: true },
              orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
            },
            rooms: { include: { beds: true }, orderBy: { sortOrder: "asc" } },
            seasonPrices: { orderBy: { startDate: "asc" } },
            availabilityBlocks: true,
            reviews: {
              where: { status: "APPROVED" },
              include: { replies: true },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        });

        return villas.map(mapVillaFromPrisma);
      },
      () => demoVillas,
      [],
    ),
  );
});

const getAllAdminVillas = cache(async () => {
  return withDbFallback(
    async (prisma) => {
      const villas = await prisma.villa.findMany({
        include: {
          region: true,
          district: true,
          owner: true,
          cancellationPolicy: true,
          depositPolicy: true,
          verification: {
            include: {
              verifiedByAdmin: true,
            },
          },
          concepts: { include: { concept: true } },
          amenities: { include: { amenity: true } },
          media: { include: { file: true }, orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
          rooms: { include: { beds: true }, orderBy: { sortOrder: "asc" } },
          seasonPrices: { orderBy: { startDate: "asc" } },
          availabilityBlocks: true,
          reviews: {
            include: { replies: true },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      });

      return villas.map(mapVillaFromPrisma);
    },
    () => demoVillas,
    [],
  );
});

export async function getHomePageData() {
  return withPublicReadCache(publicCacheKeys.homePage(), 180, async () => {
    const [villas, regions, concepts, blogPosts] = await Promise.all([
      getAllPublishedVillas(),
      getRegions(),
      getConcepts(),
      getBlogPosts(),
    ]);

    return {
      featured: villas.filter((villa) => villa.isFeatured).slice(0, 3),
      newest: villas.filter((villa) => villa.isNewest).slice(0, 3),
      verified: villas
        .filter(
          (villa) =>
            villa.verification.identityVerified &&
            villa.verification.ownershipOrAuthorityVerified &&
            villa.verification.tourismPermitVerified,
        )
        .slice(0, 3),
      villas,
      regions,
      concepts,
      blogPosts: blogPosts.slice(0, 2),
    };
  });
}

export async function getListingResults(
  searchParams?: URLSearchParams | Record<string, string | string[] | undefined>,
) {
  const params = normalizeSearchParams(searchParams);
  const cacheKey = searchCacheKeys.listingResults(params.toString());

  return withPublicReadCache(cacheKey, 180, async () => {
    const villas = await getAllPublishedVillas();
    return villas.filter((villa) => matchesFilters(villa, params));
  });
}

export async function getVillaBySlug(slug: string) {
  return withPublicReadCache(publicCacheKeys.villaDetail(slug), 300, async () => {
    const villas = await getAllPublishedVillas();
    return villas.find((villa) => villa.slug === slug) || null;
  });
}

export async function getPublishedVillaSlugs() {
  const villas = await getAllPublishedVillas();
  return villas.map((villa) => villa.slug);
}

export async function getSimilarVillas(slug: string) {
  const villas = await getAllPublishedVillas();
  const current = villas.find((villa) => villa.slug === slug);

  if (!current) {
    return [];
  }

  return villas
    .filter((villa) => villa.slug !== slug)
    .filter(
      (villa) =>
        villa.region.slug === current.region.slug ||
        villa.concepts.some((concept) =>
          current.concepts.some((currentConcept) => currentConcept.slug === concept.slug),
        ),
    )
    .slice(0, 3);
}

export async function getLandingTargetBySlug(slug: string) {
  const targets = await getSeoTargets();
  return targets.find((target) => target.slug === slug) || null;
}

export async function getLandingPageData(slug: string) {
  return withPublicReadCache(seoCacheKeys.landingPage(slug), 300, async () => {
    const [target, seoPage, villas, regions, concepts, districts] = await Promise.all([
      getLandingTargetBySlug(slug),
      getSeoPageBySlug(slug),
      getAllPublishedVillas(),
      getRegions(),
      getConcepts(),
      getDistricts(),
    ]);

    if (!target && !seoPage) {
      return null;
    }

    if (seoPage?.pageType === "CUSTOM") {
      return {
        target: null,
        seoPage,
        region: null,
        concept: null,
        district: null,
        villas: [],
      };
    }

    if (!target) {
      return null;
    }

    if (target.type === "region") {
      const region = regions.find((item) => item.slug === target.entitySlug);
      return {
        target,
        seoPage,
        region: region || null,
        concept: null,
        district: null,
        villas: villas.filter((villa) => villa.region.slug === target.entitySlug),
      };
    }

    if (target.type === "district") {
      const district = districts.find((item) => item.slug === target.entitySlug);
      return {
        target,
        seoPage,
        region: district
          ? regions.find((region) => region.slug === district.regionSlug) || null
          : null,
        concept: null,
        district: district || null,
        villas: villas.filter((villa) => villa.district.slug === target.entitySlug),
      };
    }

    const concept = concepts.find((item) => item.slug === target.entitySlug);

    return {
      target,
      seoPage,
      region: null,
      concept: concept || null,
      district: null,
      villas: villas.filter((villa) =>
        villa.concepts.some((item) => item.slug === target.entitySlug),
      ),
    };
  });
}

export const getRegions = cache(async (): Promise<RegionRecord[]> => {
  return withPublicReadCache(publicCacheKeys.regions(), 1800, () =>
    withDbFallback(
      async (prisma) => {
        const regions = await prisma.region.findMany({
          orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
        });

        return regions.map(mapRegionFromPrisma);
      },
      () => demoRegions,
      [],
    ),
  );
});

export const getDistricts = cache(async (): Promise<DistrictRecord[]> => {
  return withPublicReadCache(publicCacheKeys.districts(), 1800, () =>
    withDbFallback(
      async (prisma) => {
        const districts = await prisma.district.findMany({
          include: { region: { select: { slug: true } } },
          orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
        });

        return districts.map(mapDistrictFromPrisma);
      },
      () => demoDistricts,
      [],
    ),
  );
});

export const getConcepts = cache(async (): Promise<ConceptRecord[]> => {
  return withPublicReadCache(publicCacheKeys.concepts(), 1800, () =>
    withDbFallback(
      async (prisma) => {
        const concepts = await prisma.concept.findMany({
          orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
        });

        return concepts.map(mapConceptFromPrisma);
      },
      () => demoConcepts,
      [],
    ),
  );
});

export const getBlogPosts = cache(async (): Promise<BlogPostRecord[]> => {
  return withPublicReadCache(publicCacheKeys.blogPosts(), 600, () =>
    withDbFallback(
      async (prisma) => {
        const posts = await prisma.blogPost.findMany({
          where: { status: "PUBLISHED" },
          include: { coverFile: true },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        });

        return posts.map(mapBlogPostFromPrisma);
      },
      () => demoBlogPosts,
      [],
    ),
  );
});

export async function getBlogPostBySlug(slug: string) {
  return withPublicReadCache(publicCacheKeys.blogPost(slug), 600, async () => {
    const posts = await getBlogPosts();
    return posts.find((post) => post.slug === slug) || null;
  });
}

export async function getSeoPageBySlug(slug: string) {
  return withPublicReadCache(seoCacheKeys.page(slug), 600, () =>
    withDbFallback(
      async (prisma) => {
        const page = await prisma.seoPage.findUnique({
          where: { slug },
          select: {
            id: true,
            slug: true,
            pageType: true,
            title: true,
            description: true,
            h1: true,
            intro: true,
            body: true,
            canonicalPath: true,
            targetEntityId: true,
            noIndex: true,
            ogTitle: true,
            ogDescription: true,
          },
        });

        return page ? mapSeoPageFromPrisma(page as PrismaSeoPageRecord) : null;
      },
      null,
      null,
    ),
  );
}

export const getOwners = cache(async (): Promise<OwnerRecord[]> => {
  return withDbFallback(
    async (prisma) => {
      const owners = await prisma.owner.findMany({
        where: { isActive: true },
        orderBy: [{ type: "asc" }, { displayName: "asc" }],
      });

      return owners.map(mapOwnerFromPrisma);
    },
    () => demoOwners,
    [],
  );
});

export const getInquiryRecords = cache(async (): Promise<InquiryRecord[]> => {
  return withDbFallback(
    async (prisma) => {
      const inquiries = await prisma.inquiry.findMany({
        include: { villa: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
      });

      return inquiries.map(mapInquiryFromPrisma);
    },
    () => demoInquiries,
    [],
  );
});

export const getAuditLogs = cache(async (): Promise<AuditLogRecord[]> => {
  return withDbFallback(
    async (prisma) => {
      const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return logs.map(mapAuditLogFromPrisma);
    },
    () => demoAuditLogs,
    [],
  );
});

export async function getAdminDashboardData() {
  return withDbFallback(
    async (prisma) => {
      const [
        totalVillas,
        pendingVerificationVillas,
        publishedVillas,
        newInquiries,
        incompleteListings,
        suspiciousWarnings,
      ] = await Promise.all([
        prisma.villa.count(),
        prisma.villa.count({
          where: {
            OR: [
              { verificationStatus: "PENDING" },
              { verificationStatus: "PARTIALLY_VERIFIED" },
            ],
          },
        }),
        prisma.villa.count({ where: { status: "PUBLISHED" } }),
        prisma.inquiry.count({ where: { status: "NEW" } }),
        prisma.villa.count({
          where: {
            OR: [
              { media: { none: {} } },
              { shortDescription: { equals: "" } },
            ],
          },
        }),
        prisma.villa.count({
          where: {
            verification: {
              is: {
                ownershipOrAuthorityVerified: false,
              },
            },
          },
        }),
      ]);

      return {
        totalVillas,
        pendingVerificationVillas,
        publishedVillas,
        newInquiries,
        incompleteListings,
        suspiciousWarnings,
      };
    },
    async () => {
      const villas = await getAllPublishedVillas();
      const inquiries = await getInquiryRecords();

      return {
        totalVillas: villas.length,
        pendingVerificationVillas: villas.filter(
          (villa) =>
            !villa.verification.tourismPermitVerified ||
            !villa.verification.photosVerified,
        ).length,
        publishedVillas: villas.length,
        newInquiries: inquiries.filter((inquiry) => inquiry.status === "new").length,
        incompleteListings: villas.filter((villa) => villa.media.length < 2).length,
        suspiciousWarnings: villas.filter(
          (villa) => !villa.verification.ownershipOrAuthorityVerified,
        ).length,
      };
    },
    {
      totalVillas: 0,
      pendingVerificationVillas: 0,
      publishedVillas: 0,
      newInquiries: 0,
      incompleteListings: 0,
      suspiciousWarnings: 0,
    },
  );
}

export async function getAdminVillaSummaries() {
  const villas = await getAllAdminVillas();

  return villas.map((villa) => ({
    id: villa.id,
    slug: villa.slug,
    title: villa.title,
    location: `${villa.district.name}, ${villa.region.name}`,
    nightlyPrice: villa.pricing.basePrice,
    verificationCompleted:
      villa.verification.identityVerified &&
      villa.verification.ownershipOrAuthorityVerified &&
      villa.verification.tourismPermitVerified &&
      villa.verification.locationVerified &&
      villa.verification.photosVerified &&
      villa.verification.phoneVerified,
  }));
}

export async function getAdminVillaById(id: string) {
  const villas = await getAllAdminVillas();
  return villas.find((villa) => villa.id === id) || villas.find((villa) => villa.slug === id) || null;
}

export const getSeoTargets = cache(async (): Promise<SeoLandingTarget[]> => {
  return withPublicReadCache(seoCacheKeys.landingTargets(), 900, () =>
    withDbFallback(
      async (prisma) => {
        const [regions, districts, concepts, seoPages] = await Promise.all([
          prisma.region.findMany({ select: { id: true, slug: true } }),
          prisma.district.findMany({ select: { id: true, slug: true } }),
          prisma.concept.findMany({ select: { id: true, slug: true } }),
          prisma.seoPage.findMany({
            where: {
              pageType: {
                in: ["REGION", "CONCEPT", "LANDING", "CUSTOM"],
              },
              noIndex: false,
            },
            select: {
              id: true,
              slug: true,
              pageType: true,
              title: true,
              description: true,
              h1: true,
              intro: true,
              body: true,
              canonicalPath: true,
              targetEntityId: true,
              noIndex: true,
              ogTitle: true,
              ogDescription: true,
            },
          }),
        ]);

        const regionById = new Map(regions.map((item) => [item.id, item.slug]));
        const districtById = new Map(districts.map((item) => [item.id, item.slug]));
        const conceptById = new Map(concepts.map((item) => [item.id, item.slug]));

        const derivedTargets: SeoLandingTarget[] = [
          ...regions.map((region) => ({
            type: "region" as const,
            slug: `${region.slug}-villa-kiralama`,
            entitySlug: region.slug,
          })),
          ...districts.map((district) => ({
            type: "district" as const,
            slug: `${district.slug}-villa-kiralama`,
            entitySlug: district.slug,
          })),
          ...concepts.map((concept) => ({
            type: "concept" as const,
            slug: concept.slug,
            entitySlug: concept.slug,
          })),
        ];

        for (const page of seoPages as PrismaSeoPageRecord[]) {
          if (page.pageType === "CUSTOM") {
            derivedTargets.push({
              type: "custom",
              slug: page.slug,
              entitySlug: page.slug,
            });
          }

          if (page.pageType === "REGION" && page.targetEntityId) {
            const regionSlug = regionById.get(page.targetEntityId);

            if (regionSlug) {
              derivedTargets.push({
                type: "region",
                slug: page.slug,
                entitySlug: regionSlug,
              });
            }
          }

          if (page.pageType === "CONCEPT" && page.targetEntityId) {
            const conceptSlug = conceptById.get(page.targetEntityId);

            if (conceptSlug) {
              derivedTargets.push({
                type: "concept",
                slug: page.slug,
                entitySlug: conceptSlug,
              });
            }
          }

          if (page.pageType === "LANDING" && page.targetEntityId) {
            const districtSlug = districtById.get(page.targetEntityId);

            if (districtSlug) {
              derivedTargets.push({
                type: "district",
                slug: page.slug,
                entitySlug: districtSlug,
              });
            }
          }
        }

        return Array.from(
          new Map(derivedTargets.map((target) => [target.slug, target])).values(),
        );
      },
      () => demoSeoTargets,
      [],
    ),
  );
});

export function getPriceSnapshotPreview(
  villa: VillaDetail,
  startDate?: string,
  endDate?: string,
  guestCount = 2,
) {
  return calculateVillaEstimate(villa, startDate, endDate, guestCount);
}
