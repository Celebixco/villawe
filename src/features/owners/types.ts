export type OwnerModuleState = {
  mode: "database" | "demo" | "unavailable" | "error";
  message: string;
  readOnly: boolean;
};

export type OwnerPanelStatus =
  | "PENDING_REVIEW"
  | "ACTIVE"
  | "SUSPENDED"
  | "REJECTED";

export type OwnerDashboardRecord = {
  totalVillas: number;
  draftVillas: number;
  pendingReviewVillas: number;
  publishedVillas: number;
  suspendedOrRejectedVillas: number;
  newInquiries: number;
  upcomingRequests: number;
  incompleteListings: number;
  verifiedDocuments: number;
  totalDocuments: number;
};

export type OwnerOption = {
  id: string;
  label: string;
  meta?: string;
};

export type OwnerChecklistItem = {
  key: string;
  label: string;
  complete: boolean;
  message?: string;
};

export type OwnerVillaMediaRecord = {
  id: string;
  fileId: string;
  url: string;
  altText: string;
  sortOrder: number;
  isCover: boolean;
  originalName: string;
};

export type OwnerDocumentRecord = {
  id: string;
  fileId: string;
  url: string;
  originalName: string;
  mimeType: string;
  documentType: string;
  note?: string;
  isVerified: boolean;
  verifiedAt?: string;
  scope: "owner" | "villa";
};

export type OwnerSeasonPriceRecord = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  nightlyPrice: number;
  minNightsOverride?: number;
  cleaningFeeOverride?: number;
  depositOverride?: number;
  serviceFeeOverride?: number;
  extraGuestFeeOverride?: number;
};

export type OwnerAvailabilityBlockRecord = {
  id: string;
  startDate: string;
  endDate: string;
  type: "BLOCKED" | "HOLD" | "RESERVED" | "MAINTENANCE" | "OWNER_USE";
  reason?: string;
  createdAt: string;
};

export type OwnerVillaSummaryRecord = {
  id: string;
  slug: string;
  title: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "SUSPENDED" | "ARCHIVED";
  regionName: string;
  districtName: string;
  updatedAt: string;
  mediaCount: number;
  isComplete: boolean;
  checklistPendingCount: number;
  reviewRequestedAt?: string;
  coverImageUrl?: string;
};

export type OwnerVillaEditorRecord = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "SUSPENDED" | "ARCHIVED";
  ownerStatus: OwnerPanelStatus;
  verificationStatus: "PENDING" | "PARTIALLY_VERIFIED" | "VERIFIED" | "REJECTED";
  ownerRevisionNotes?: string;
  reviewRequestedAt?: string;
  regionId: string;
  districtId: string;
  neighborhoodId?: string;
  regionName: string;
  districtName: string;
  addressPublic: string;
  addressPrivate: string;
  maxGuests: number;
  bedroomCount: number;
  bathroomCount: number;
  bedCount: number;
  basePrice: number;
  cleaningFee: number;
  depositAmount: number;
  serviceFeeType: "NONE" | "FIXED" | "PERCENTAGE" | "INCLUDED";
  serviceFeeValue: number;
  extraGuestFee: number;
  minNights: number;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicyId?: string;
  depositPolicyId?: string;
  houseRules: string[];
  poolDetails: string[];
  nearbyPlaces: string[];
  features: {
    hasPrivatePool: boolean;
    hasHeatedPool: boolean;
    hasJacuzzi: boolean;
    isShelteredPool: boolean;
    isConservativeFriendly: boolean;
    isPetFriendly: boolean;
    isChildFriendly: boolean;
    isFamilyFriendly: boolean;
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
  amenityIds: string[];
  conceptIds: string[];
  media: OwnerVillaMediaRecord[];
  ownerDocuments: OwnerDocumentRecord[];
  villaDocuments: OwnerDocumentRecord[];
  seasonPrices: OwnerSeasonPriceRecord[];
  availabilityBlocks: OwnerAvailabilityBlockRecord[];
  checklist: OwnerChecklistItem[];
};

export type OwnerInquirySummaryRecord = {
  id: string;
  villaId: string;
  villaTitle: string;
  fullName: string;
  email: string;
  phone: string;
  startDate?: string;
  endDate?: string;
  guestCount: number;
  estimatedTotal?: number;
  status:
    | "NEW"
    | "REVIEWING"
    | "QUOTED"
    | "ACCEPTED"
    | "DECLINED"
    | "EXPIRED"
    | "CONVERTED"
    | "SPAM";
  message?: string;
  ownerNote?: string;
  ownerSeenAt?: string;
  createdAt: string;
};

export type OwnerInquiryDetailRecord = OwnerInquirySummaryRecord & {
  pricingSnapshot?: string;
};
