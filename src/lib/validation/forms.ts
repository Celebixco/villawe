import { z } from "zod";

const truthy = z.preprocess((value) => value === "on" || value === "1" || value === true, z.boolean());
const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

function isValidDateString(value: string | undefined) {
  if (!value) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

export const adminLoginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin."),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır."),
});

export const inquiryFormSchema = z.object({
  villaSlug: z.string().min(1),
  fullName: z.string().min(2, "Ad soyad zorunludur."),
  email: z.string().email("Geçerli bir e-posta girin."),
  phone: z.string().min(10, "Telefon numarası zorunludur."),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  guestCount: z.coerce.number().int().min(1).max(16),
  message: z.string().max(1200).optional(),
  depositWarningAcknowledged: truthy,
  offPlatformPaymentWarningAcknowledged: truthy,
}).superRefine((value, ctx) => {
  const hasStart = Boolean(value.startDate);
  const hasEnd = Boolean(value.endDate);

  if (hasStart !== hasEnd) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Giriş ve çıkış tarihi birlikte seçilmelidir.",
      path: hasStart ? ["endDate"] : ["startDate"],
    });
    return;
  }

  if (!hasStart || !hasEnd) {
    return;
  }

  if (!isValidDateString(value.startDate) || !isValidDateString(value.endDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Tarih aralığı geçersiz.",
      path: ["startDate"],
    });
    return;
  }

  const start = new Date(value.startDate as string);
  const end = new Date(value.endDate as string);

  if (start >= end) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Çıkış tarihi giriş tarihinden sonra olmalıdır.",
      path: ["endDate"],
    });
  }
});

export const villaCreateSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  ownerId: z.string().min(1),
  regionId: z.string().min(1),
  districtId: z.string().min(1),
  shortDescription: z.string().min(10),
  description: z.string().min(20),
  addressPrivate: z.string().min(5),
  addressPublic: z.string().min(5),
  maxGuests: z.coerce.number().int().min(1).max(20),
  bedroomCount: z.coerce.number().int().min(1).max(20),
  bathroomCount: z.coerce.number().int().min(1).max(20),
  bedCount: z.coerce.number().int().min(1).max(30),
  basePrice: z.coerce.number().min(0),
});

export const villaBasicsSchema = villaCreateSchema.extend({
  villaId: z.string().min(1),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "SUSPENDED", "ARCHIVED"]),
  checkInTime: z.string().min(1),
  checkOutTime: z.string().min(1),
  hasPrivatePool: truthy.optional(),
  hasHeatedPool: truthy.optional(),
  hasJacuzzi: truthy.optional(),
  isShelteredPool: truthy.optional(),
  isConservativeFriendly: truthy.optional(),
  isPetFriendly: truthy.optional(),
  isChildFriendly: truthy.optional(),
  hasSeaView: truthy.optional(),
  hasNatureView: truthy.optional(),
  nearBeach: truthy.optional(),
  nearCenter: truthy.optional(),
  hasBarbecue: truthy.optional(),
  hasFireplace: truthy.optional(),
  hasParking: truthy.optional(),
  hasAirConditioning: truthy.optional(),
  hasInternet: truthy.optional(),
  isWheelchairFriendly: truthy.optional(),
});

export const villaVerificationSchema = z.object({
  villaId: z.string().min(1),
  identityVerified: truthy.optional(),
  ownershipOrAuthorityVerified: truthy.optional(),
  tourismPermitVerified: truthy.optional(),
  locationVerified: truthy.optional(),
  photosVerified: truthy.optional(),
  phoneVerified: truthy.optional(),
  verificationNotes: z.string().max(2000).optional(),
});

export const villaPricingSchema = z.object({
  villaId: z.string().min(1),
  basePrice: z.coerce.number().min(0),
  cleaningFee: z.coerce.number().min(0),
  depositAmount: z.coerce.number().min(0),
  serviceFeeType: z.enum(["NONE", "FIXED", "PERCENTAGE", "INCLUDED"]),
  serviceFeeValue: z.coerce.number().min(0),
  extraGuestFee: z.coerce.number().min(0),
  minNights: z.coerce.number().int().min(1).max(30),
});

export const availabilityBlockSchema = z.object({
  villaId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  type: z.enum(["BLOCKED", "HOLD", "RESERVED", "MAINTENANCE", "OWNER_USE"]),
  reason: z.string().max(500).optional(),
}).superRefine((value, ctx) => {
  if (!isValidDateString(value.startDate) || !isValidDateString(value.endDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Müsaitlik tarihleri geçersiz.",
      path: ["startDate"],
    });
    return;
  }

  if (new Date(value.startDate) > new Date(value.endDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Bitiş tarihi başlangıç tarihinden önce olamaz.",
      path: ["endDate"],
    });
  }
});

export const ownerFormSchema = z.object({
  ownerId: z.string().optional(),
  type: z.enum(["INDIVIDUAL", "COMPANY", "AGENCY"]),
  status: z.enum(["PENDING_REVIEW", "ACTIVE", "SUSPENDED", "REJECTED"]).optional(),
  displayName: z.string().min(3, "Görünen ad zorunludur."),
  legalName: optionalString,
  contactName: optionalString,
  email: z.string().email("Geçerli bir e-posta girin."),
  phone: z.string().min(10, "Telefon numarası zorunludur."),
  taxNumber: optionalString,
  city: optionalString,
  districtLabel: optionalString,
  address: optionalString,
  verificationStatus: z
    .enum(["PENDING", "PARTIALLY_VERIFIED", "VERIFIED", "REJECTED"])
    .optional(),
  adminNotes: z.string().max(2000).optional().transform((value) => value || undefined),
  notes: z.string().max(2000).optional().transform((value) => value || undefined),
  isActive: truthy.optional(),
}).superRefine((value, ctx) => {
  if ((value.type === "COMPANY" || value.type === "AGENCY") && !value.legalName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Şirket veya acente için ticari ünvan girin.",
      path: ["legalName"],
    });
  }
});

export const ownerRegistrationSchema = z
  .object({
    fullName: z.string().min(3, "Ad soyad zorunludur."),
    email: z.string().email("Geçerli bir e-posta girin."),
    phone: z.string().min(10, "Telefon numarası zorunludur."),
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır."),
    passwordConfirm: z.string().min(8, "Şifre tekrarı zorunludur."),
    ownerType: z.enum(["INDIVIDUAL", "COMPANY", "AGENCY"]),
    companyName: optionalString,
    taxNumber: optionalString,
    city: z.string().min(2, "Şehir bilgisi zorunludur."),
    district: z.string().min(2, "İlçe bilgisi zorunludur."),
    address: z.string().min(10, "Adres bilgisi zorunludur."),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.passwordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Şifre tekrarı eşleşmiyor.",
        path: ["passwordConfirm"],
      });
    }

    if ((value.ownerType === "COMPANY" || value.ownerType === "AGENCY") && !value.companyName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Şirket/acente adı zorunludur.",
        path: ["companyName"],
      });
    }
  });

export const ownerLoginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin."),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır."),
});

export const ownerPasswordResetRequestSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin."),
});

const ownerVillaBaseSchema = z.object({
  title: z.string().min(3, "Villa adı zorunludur."),
  shortDescription: z.string().min(20, "Kısa açıklama çok kısa."),
  description: z.string().min(80, "Detaylı açıklama çok kısa."),
  regionId: z.string().min(1, "Bölge seçimi zorunludur."),
  districtId: z.string().min(1, "İlçe seçimi zorunludur."),
  neighborhoodId: optionalString,
  addressPublic: z.string().min(5, "Yaklaşık konum zorunludur."),
  addressPrivate: z.string().min(10, "Açık adres zorunludur."),
  maxGuests: z.coerce.number().int().min(1).max(20),
  bedroomCount: z.coerce.number().int().min(1).max(20),
  bathroomCount: z.coerce.number().int().min(1).max(20),
  bedCount: z.coerce.number().int().min(1).max(30),
  checkInTime: z.string().min(1, "Giriş saati zorunludur."),
  checkOutTime: z.string().min(1, "Çıkış saati zorunludur."),
  minNights: z.coerce.number().int().min(1).max(60),
  basePrice: z.coerce.number().min(0),
  cleaningFee: z.coerce.number().min(0),
  depositAmount: z.coerce.number().min(0),
  serviceFeeType: z.enum(["NONE", "FIXED", "PERCENTAGE", "INCLUDED"]),
  serviceFeeValue: z.coerce.number().min(0),
  extraGuestFee: z.coerce.number().min(0),
  hasPrivatePool: truthy.optional(),
  hasHeatedPool: truthy.optional(),
  hasJacuzzi: truthy.optional(),
  isShelteredPool: truthy.optional(),
  isConservativeFriendly: truthy.optional(),
  isPetFriendly: truthy.optional(),
  isChildFriendly: truthy.optional(),
  isFamilyFriendly: truthy.optional(),
  hasSeaView: truthy.optional(),
  hasNatureView: truthy.optional(),
  nearBeach: truthy.optional(),
  nearCenter: truthy.optional(),
  hasBarbecue: truthy.optional(),
  hasFireplace: truthy.optional(),
  hasParking: truthy.optional(),
  hasAirConditioning: truthy.optional(),
  hasInternet: truthy.optional(),
  isWheelchairFriendly: truthy.optional(),
  amenities: z.array(z.string().min(1)).default([]),
  concepts: z.array(z.string().min(1)).default([]),
  houseRules: z.array(z.string().min(1)).default([]),
  poolDetails: z.array(z.string().min(1)).default([]),
  nearbyPlaces: z.array(z.string().min(1)).default([]),
  cancellationPolicyId: optionalString,
  depositPolicyId: optionalString,
});

export const ownerVillaCreateSchema = ownerVillaBaseSchema;

export const ownerVillaBasicsSchema = ownerVillaBaseSchema.extend({
  villaId: z.string().min(1),
});

export const ownerVillaReviewSubmitSchema = z.object({
  villaId: z.string().min(1),
});

export const ownerVillaPricingSchema = z.object({
  villaId: z.string().min(1),
  basePrice: z.coerce.number().min(0),
  cleaningFee: z.coerce.number().min(0),
  depositAmount: z.coerce.number().min(0),
  serviceFeeType: z.enum(["NONE", "FIXED", "PERCENTAGE", "INCLUDED"]),
  serviceFeeValue: z.coerce.number().min(0),
  extraGuestFee: z.coerce.number().min(0),
  minNights: z.coerce.number().int().min(1).max(60),
});

export const ownerSeasonPriceSchema = z
  .object({
    villaId: z.string().min(1),
    seasonId: z.string().optional(),
    name: z.string().min(2, "Sezon adı zorunludur."),
    startDate: z.string().min(1, "Başlangıç tarihi zorunludur."),
    endDate: z.string().min(1, "Bitiş tarihi zorunludur."),
    nightlyPrice: z.coerce.number().min(0),
    minNightsOverride: z.coerce.number().int().min(1).max(60).optional(),
    cleaningFeeOverride: z.coerce.number().min(0).optional(),
    depositOverride: z.coerce.number().min(0).optional(),
    serviceFeeOverride: z.coerce.number().min(0).optional(),
    extraGuestFeeOverride: z.coerce.number().min(0).optional(),
  })
  .superRefine((value, ctx) => {
    if (!isValidDateString(value.startDate) || !isValidDateString(value.endDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sezon tarihleri geçersiz.",
        path: ["startDate"],
      });
      return;
    }

    if (new Date(value.startDate) > new Date(value.endDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bitiş tarihi başlangıç tarihinden önce olamaz.",
        path: ["endDate"],
      });
    }
  });

export const ownerAvailabilityBlockSchema = z
  .object({
    villaId: z.string().min(1),
    blockId: z.string().optional(),
    startDate: z.string().min(1, "Başlangıç tarihi zorunludur."),
    endDate: z.string().min(1, "Bitiş tarihi zorunludur."),
    reasonCode: z.enum(["owner_block", "maintenance", "reserved_elsewhere", "other"]),
    reason: z.string().max(500).optional(),
  })
  .superRefine((value, ctx) => {
    if (!isValidDateString(value.startDate) || !isValidDateString(value.endDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Müsaitlik tarihleri geçersiz.",
        path: ["startDate"],
      });
      return;
    }

    if (new Date(value.startDate) > new Date(value.endDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bitiş tarihi başlangıç tarihinden önce olamaz.",
        path: ["endDate"],
      });
    }
  });

export const ownerInquirySeenSchema = z.object({
  inquiryId: z.string().min(1),
});

export const ownerInquiryNoteSchema = z.object({
  inquiryId: z.string().min(1),
  ownerNote: z.string().min(2, "Not alanı çok kısa.").max(2000),
});

export const blogPostFormSchema = z.object({
  postId: z.string().optional(),
  title: z.string().min(5, "Başlık en az 5 karakter olmalıdır."),
  slug: z.string().min(3, "Slug zorunludur."),
  excerpt: z.string().min(20, "Özet alanı çok kısa."),
  content: z.string().min(60, "İçerik alanı çok kısa."),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  seoTitle: optionalString,
  seoDescription: optionalString,
});

export const seoPageFormSchema = z.object({
  seoPageId: z.string().optional(),
  slug: z.string().min(2, "Slug zorunludur."),
  pageType: z.enum(["REGION", "CONCEPT", "LANDING", "BLOG", "CUSTOM"]),
  title: z.string().min(5, "SEO başlığı zorunludur."),
  description: z.string().min(20, "SEO açıklaması çok kısa."),
  h1: optionalString,
  intro: optionalString,
  body: optionalString,
  canonicalPath: optionalString,
  targetEntityId: optionalString,
  noIndex: truthy.optional(),
  ogTitle: optionalString,
  ogDescription: optionalString,
});

export const redirectFormSchema = z.object({
  redirectId: z.string().optional(),
  fromPath: z.string().min(2, "Kaynak yol zorunludur."),
  toPath: z.string().min(2, "Hedef yol zorunludur."),
  type: z.enum(["PERMANENT", "TEMPORARY"]),
  isActive: truthy.optional(),
});

export const settingFormSchema = z.object({
  settingId: z.string().optional(),
  key: z.string().min(2, "Ayar anahtarı zorunludur."),
  groupName: z.string().min(2, "Grup adı zorunludur."),
  valueJson: z.string().min(2, "JSON değer alanı zorunludur."),
  description: optionalString,
}).superRefine((value, ctx) => {
  try {
    JSON.parse(value.valueJson);
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Ayar değeri geçerli bir JSON olmalıdır.",
      path: ["valueJson"],
    });
  }
});

export const inquiryStatusFormSchema = z.object({
  inquiryId: z.string().min(1),
  status: z.enum([
    "NEW",
    "REVIEWING",
    "QUOTED",
    "ACCEPTED",
    "DECLINED",
    "EXPIRED",
    "CONVERTED",
    "SPAM",
  ]),
});

export const reviewModerationFormSchema = z.object({
  reviewId: z.string().min(1),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "HIDDEN"]),
});

export const reviewReplyFormSchema = z.object({
  reviewId: z.string().min(1),
  replyId: z.string().optional(),
  responderType: z.enum(["ADMIN", "OWNER"]),
  body: z.string().min(10, "Yanıt alanı çok kısa.").max(2000),
});

export const villaStatusActionSchema = z.object({
  villaId: z.string().min(1),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "SUSPENDED", "ARCHIVED"]),
});

export const villaMediaUpdateSchema = z.object({
  villaId: z.string().min(1),
  mediaId: z.string().min(1),
  altText: z.string().min(2, "Alternatif metin zorunludur.").max(160),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export const villaMediaDeleteSchema = z.object({
  villaId: z.string().min(1),
  mediaId: z.string().min(1),
});

export const villaCoverSchema = z.object({
  villaId: z.string().min(1),
  mediaId: z.string().min(1),
});

export const ownerDocumentVerificationSchema = z.object({
  ownerId: z.string().min(1),
  documentId: z.string().min(1),
  isVerified: truthy.optional(),
});

export const villaDocumentVerificationSchema = z.object({
  villaId: z.string().min(1),
  documentId: z.string().min(1),
  isVerified: truthy.optional(),
});

export const deleteEntitySchema = z.object({
  entityId: z.string().min(1),
});
