export type VillaVerificationChecklist = {
  identityVerified: boolean;
  ownershipOrAuthorityVerified: boolean;
  tourismPermitVerified: boolean;
  locationVerified: boolean;
  photosVerified: boolean;
  phoneVerified: boolean;
};

export type VillaPublishReadinessInput = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  ownerId: string;
  regionId: string;
  districtId: string;
  addressPublic: string;
  addressPrivate: string;
  maxGuests: number;
  bedroomCount: number;
  bathroomCount: number;
  bedCount: number;
  basePrice: number;
  minNights: number;
  mediaCount: number;
  hasCoverImage: boolean;
  verification: VillaVerificationChecklist;
};

export function isVillaFullyVerified(verification: VillaVerificationChecklist) {
  return (
    verification.identityVerified &&
    verification.ownershipOrAuthorityVerified &&
    verification.tourismPermitVerified &&
    verification.locationVerified &&
    verification.photosVerified &&
    verification.phoneVerified
  );
}

export function getVillaPublishWarnings(input: VillaPublishReadinessInput) {
  const warnings: string[] = [];

  if (!input.title.trim()) warnings.push("Villa başlığı eksik.");
  if (!input.slug.trim()) warnings.push("Villa slug alanı eksik.");
  if (input.shortDescription.trim().length < 10) warnings.push("Kısa açıklama çok kısa.");
  if (input.description.trim().length < 20) warnings.push("Detaylı açıklama eksik.");
  if (!input.ownerId) warnings.push("Sahip veya acente seçilmemiş.");
  if (!input.regionId || !input.districtId) warnings.push("Bölge ve ilçe seçimi tamamlanmamış.");
  if (!input.addressPublic.trim() || !input.addressPrivate.trim()) {
    warnings.push("Genel ve özel adres alanları tamamlanmamış.");
  }
  if (input.maxGuests < 1 || input.bedroomCount < 1 || input.bathroomCount < 1 || input.bedCount < 1) {
    warnings.push("Kapasite, oda, banyo ve yatak bilgileri eksik.");
  }
  if (input.basePrice <= 0) warnings.push("Baz fiyat sıfırdan büyük olmalıdır.");
  if (input.minNights < 1) warnings.push("Minimum gece kuralı geçersiz.");
  if (input.mediaCount < 1) warnings.push("En az bir villa görseli yüklenmelidir.");
  if (!input.hasCoverImage) warnings.push("Kapak görseli seçilmelidir.");
  if (!isVillaFullyVerified(input.verification)) {
    warnings.push("Tüm doğrulama adımları tamamlanmadan ilan yayınlanamaz.");
  }

  return warnings;
}
