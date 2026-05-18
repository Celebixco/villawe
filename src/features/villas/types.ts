export type VerificationFlags = {
  identityVerified: boolean;
  ownershipOrAuthorityVerified: boolean;
  tourismPermitVerified: boolean;
  locationVerified: boolean;
  photosVerified: boolean;
  phoneVerified: boolean;
  lastVerifiedAt?: string | undefined;
  verifiedByLabel?: string | undefined;
  verificationNotes?: string | undefined;
};

export type VillaPricing = {
  basePrice: number;
  cleaningFee: number;
  depositAmount: number;
  serviceFeeType: "none" | "fixed" | "percentage" | "included";
  serviceFeeValue: number;
  extraGuestFee: number;
  minNights: number;
  cancellationPolicy: string;
  depositPolicy: string;
  seasonPrices: Array<{
    name: string;
    startDate: string;
    endDate: string;
    nightlyPrice: number;
    minNightsOverride?: number | undefined;
  }>;
};

export type VillaAmenity = {
  slug: string;
  name: string;
  category: string;
};

export type VillaConcept = {
  slug: string;
  name: string;
};

export type VillaMediaItem = {
  id: string;
  url: string;
  alt: string;
  isCover?: boolean | undefined;
};

export type VillaRoom = {
  id: string;
  name: string;
  roomType: string;
  description?: string | undefined;
  beds: Array<{
    type: string;
    quantity: number;
    sleeps: number;
  }>;
};

export type AvailabilityBlockItem = {
  startDate: string;
  endDate: string;
  type: "blocked" | "hold" | "reserved" | "maintenance" | "owner_use";
  label: string;
};

export type NearbyPlace = {
  name: string;
  distanceLabel: string;
  category: string;
};

export type ReviewRecord = {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  stayDate: string;
  reply?: {
    responder: string;
    body: string;
  } | undefined;
};

export type VillaCard = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  summary: string;
  region: { name: string; slug: string };
  district: { name: string; slug: string };
  maxGuests: number;
  bedroomCount: number;
  bathroomCount: number;
  bedCount: number;
  isFeatured: boolean;
  isNewest: boolean;
  pricing: VillaPricing;
  concepts: VillaConcept[];
  amenities: VillaAmenity[];
  coverImage: VillaMediaItem;
  verification: VerificationFlags;
  features: {
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
  };
};

export type VillaDetail = VillaCard & {
  description: string;
  checkInTime: string;
  checkOutTime: string;
  ownerName: string;
  media: VillaMediaItem[];
  rooms: VillaRoom[];
  poolDetails: string[];
  houseRules: string[];
  nearbyPlaces: NearbyPlace[];
  availabilityBlocks: AvailabilityBlockItem[];
  reviews: ReviewRecord[];
  addressPublic: string;
  locationLabel: string;
  similarVillaSlugs: string[];
};

export type RegionRecord = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  heroTitle: string;
  heroDescription: string;
};

export type DistrictRecord = {
  id: string;
  name: string;
  slug: string;
  regionSlug: string;
};

export type ConceptRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  heroTitle: string;
};

export type BlogPostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  content: string;
  publishedAt: string;
};

export type OwnerRecord = {
  id: string;
  displayName: string;
  type: "individual" | "agency";
  email: string;
  phone: string;
};

export type InquiryRecord = {
  id: string;
  villaTitle: string;
  fullName: string;
  email: string;
  phone: string;
  startDate?: string | undefined;
  endDate?: string | undefined;
  guestCount: number;
  status: "new" | "reviewing" | "quoted" | "accepted";
  estimatedTotal?: number | undefined;
  createdAt: string;
};

export type AuditLogRecord = {
  id: string;
  action: string;
  entityType: string;
  entityLabel: string;
  message: string;
  createdAt: string;
};

export type SeoLandingTarget =
  | { type: "region"; slug: string; entitySlug: string }
  | { type: "district"; slug: string; entitySlug: string }
  | { type: "concept"; slug: string; entitySlug: string };
