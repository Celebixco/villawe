export type AdminModuleState = {
  mode: "database" | "demo" | "unavailable" | "error";
  message: string;
  readOnly: boolean;
};

export type AdminOwnerDocumentRecord = {
  id: string;
  fileId: string;
  documentType: string;
  note?: string | undefined;
  isVerified: boolean;
  verifiedAt?: string | undefined;
  url: string;
  originalName: string;
  mimeType: string;
};

export type AdminOwnerRecord = {
  id: string;
  type: "INDIVIDUAL" | "COMPANY" | "AGENCY";
  status: "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "REJECTED";
  displayName: string;
  legalName?: string | undefined;
  contactName?: string | undefined;
  email: string;
  phone: string;
  taxNumber?: string | undefined;
  city?: string | undefined;
  districtLabel?: string | undefined;
  address?: string | undefined;
  verificationStatus:
    | "PENDING"
    | "PARTIALLY_VERIFIED"
    | "VERIFIED"
    | "REJECTED";
  adminNotes?: string | undefined;
  reviewedAt?: string | undefined;
  notes?: string | undefined;
  isActive: boolean;
  villaCount: number;
  createdAt: string;
  documents: AdminOwnerDocumentRecord[];
};

export type AdminBlogPostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  seoTitle?: string | undefined;
  seoDescription?: string | undefined;
  publishedAt?: string | undefined;
  updatedAt: string;
  coverImageUrl?: string | undefined;
};

export type AdminSeoPageRecord = {
  id: string;
  slug: string;
  pageType: "REGION" | "CONCEPT" | "LANDING" | "BLOG" | "CUSTOM";
  title: string;
  description: string;
  h1?: string | undefined;
  intro?: string | undefined;
  body?: string | undefined;
  canonicalPath?: string | undefined;
  targetEntityId?: string | undefined;
  noIndex: boolean;
  ogTitle?: string | undefined;
  ogDescription?: string | undefined;
  updatedAt: string;
};

export type AdminRedirectRecord = {
  id: string;
  fromPath: string;
  toPath: string;
  type: "PERMANENT" | "TEMPORARY";
  isActive: boolean;
  updatedAt: string;
};

export type AdminSettingRecord = {
  id: string;
  key: string;
  groupName: string;
  valueJson: string;
  description?: string | undefined;
  updatedAt: string;
};

export type AdminInquiryRecord = {
  id: string;
  villaId: string;
  villaTitle: string;
  status:
    | "NEW"
    | "REVIEWING"
    | "QUOTED"
    | "ACCEPTED"
    | "DECLINED"
    | "EXPIRED"
    | "CONVERTED"
    | "SPAM";
  guestCount: number;
  fullName: string;
  email: string;
  phone: string;
  startDate?: string | undefined;
  endDate?: string | undefined;
  estimatedTotal?: number | undefined;
  createdAt: string;
  message?: string | undefined;
  pricingSnapshot?: string | undefined;
  depositWarningAcknowledged: boolean;
  offPlatformPaymentWarningAcknowledged: boolean;
};

export type AdminReviewRecord = {
  id: string;
  villaId: string;
  villaTitle: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";
  authorName: string;
  rating: number;
  title?: string | undefined;
  body: string;
  stayDate?: string | undefined;
  publishedAt?: string | undefined;
  reply?: {
    id: string;
    responderType: "ADMIN" | "OWNER";
    body: string;
  } | undefined;
};

export type AdminAuditLogRecord = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityLabel: string;
  message: string;
  createdAt: string;
  actorLabel?: string | undefined;
};

export type AdminVillaMediaRecord = {
  id: string;
  fileId: string;
  url: string;
  altText: string;
  sortOrder: number;
  isCover: boolean;
  originalName: string;
};

export type AdminVillaDocumentRecord = {
  id: string;
  fileId: string;
  documentType: string;
  note?: string | undefined;
  isVerified: boolean;
  verifiedAt?: string | undefined;
  url: string;
  originalName: string;
  mimeType: string;
};

export type AdminAvailabilityBlockRecord = {
  id: string;
  startDate: string;
  endDate: string;
  type: "BLOCKED" | "HOLD" | "RESERVED" | "MAINTENANCE" | "OWNER_USE";
  reason?: string | undefined;
};

export type AdminVillaEditorRecord = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "SUSPENDED" | "ARCHIVED";
  verificationStatus: "PENDING" | "PARTIALLY_VERIFIED" | "VERIFIED" | "REJECTED";
  ownerId: string;
  ownerName: string;
  regionId: string;
  regionName: string;
  districtId: string;
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
  publishedAt?: string | undefined;
  reviewRequestedAt?: string | undefined;
  ownerRevisionNotes?: string | undefined;
  verification: {
    identityVerified: boolean;
    ownershipOrAuthorityVerified: boolean;
    tourismPermitVerified: boolean;
    locationVerified: boolean;
    photosVerified: boolean;
    phoneVerified: boolean;
    verificationNotes?: string | undefined;
    lastVerifiedAt?: string | undefined;
  };
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
  media: AdminVillaMediaRecord[];
  documents: AdminVillaDocumentRecord[];
  availabilityBlocks: AdminAvailabilityBlockRecord[];
  publishWarnings: string[];
};

export type AdminOption = {
  id: string;
  label: string;
  slug?: string;
  meta?: string;
};
