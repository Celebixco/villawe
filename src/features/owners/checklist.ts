import type { OwnerChecklistItem } from "@/features/owners/types";

type OwnerChecklistInput = {
  basicInfoComplete: boolean;
  locationComplete: boolean;
  capacityComplete: boolean;
  amenitiesComplete: boolean;
  pricingComplete: boolean;
  mediaCount: number;
  hasCoverImage: boolean;
  rulesComplete: boolean;
  ownerType: "INDIVIDUAL" | "COMPANY" | "AGENCY";
  ownerDocumentTypes: string[];
  villaDocumentTypes: string[];
};

function hasDocument(documentTypes: string[], expected: string) {
  return documentTypes.includes(expected);
}

export function getOwnerVillaChecklist(input: OwnerChecklistInput): OwnerChecklistItem[] {
  const needsBusinessDocument = input.ownerType === "COMPANY" || input.ownerType === "AGENCY";
  const hasRequiredOwnerDocs =
    hasDocument(input.ownerDocumentTypes, "identity") &&
    hasDocument(input.ownerDocumentTypes, "ownership_or_authority") &&
    (!needsBusinessDocument ||
      hasDocument(input.ownerDocumentTypes, "tax_or_business_document"));
  const hasRequiredVillaDocs = hasDocument(input.villaDocumentTypes, "tourism_permit");
  const needsMorePhotos = input.mediaCount < 5;
  const missingCover = !input.hasCoverImage;
  const missingDocuments = !(hasRequiredOwnerDocs && hasRequiredVillaDocs);

  return [
    {
      key: "basic",
      label: "Temel bilgiler tamamlandı",
      complete: input.basicInfoComplete,
    },
    {
      key: "location",
      label: "Konum bilgileri tamamlandı",
      complete: input.locationComplete,
    },
    {
      key: "capacity",
      label: "Kapasite bilgileri tamamlandı",
      complete: input.capacityComplete,
    },
    {
      key: "amenities",
      label: "Özellikler ve konseptler seçildi",
      complete: input.amenitiesComplete,
    },
    {
      key: "pricing",
      label: "Fiyatlandırma tamamlandı",
      complete: input.pricingComplete,
    },
    {
      key: "photos",
      label: "En az 5 fotoğraf yüklendi",
      complete: !needsMorePhotos,
      ...(needsMorePhotos ? { message: "En az 5 fotoğraf yüklemelisiniz." } : {}),
    },
    {
      key: "cover",
      label: "Kapak fotoğrafı seçildi",
      complete: !missingCover,
      ...(missingCover ? { message: "Kapak fotoğrafı seçmelisiniz." } : {}),
    },
    {
      key: "documents",
      label: "Zorunlu belgeler yüklendi",
      complete: !missingDocuments,
      ...(missingDocuments ? { message: "Zorunlu belgeleri yüklemelisiniz." } : {}),
    },
    {
      key: "rules",
      label: "Kurallar ve politikalar tamamlandı",
      complete: input.rulesComplete,
    },
  ];
}

export function getOwnerSubmitWarnings(checklist: OwnerChecklistItem[]) {
  return checklist.filter((item) => !item.complete).map((item) => item.message || item.label);
}

export function canOwnerSubmitVillaForReview(checklist: OwnerChecklistItem[]) {
  return checklist.every((item) => item.complete);
}
