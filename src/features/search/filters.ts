export const listingBooleanFilters = [
  { key: "privatePool", label: "Özel havuz" },
  { key: "heatedPool", label: "Isıtmalı havuz" },
  { key: "shelteredPool", label: "Korunaklı havuz" },
  { key: "jacuzzi", label: "Jakuzi" },
  { key: "honeymoon", label: "Balayı villası" },
  { key: "childPool", label: "Çocuk dostu" },
  { key: "seaView", label: "Deniz manzarası" },
  { key: "natureView", label: "Doğa manzarası" },
  { key: "petFriendly", label: "Evcil hayvan dostu" },
  { key: "familyFriendly", label: "Aile dostu" },
  { key: "luxuryVilla", label: "Lüks villa" },
  { key: "economicalVilla", label: "Ekonomik villa" },
  { key: "bungalowVilla", label: "Bungalov" },
  { key: "nearBeach", label: "Plaja yakın" },
  { key: "nearCenter", label: "Merkeze yakın" },
  { key: "barbecue", label: "Barbekü" },
  { key: "fireplace", label: "Şömine" },
  { key: "parking", label: "Otopark" },
  { key: "airConditioning", label: "Klima" },
  { key: "internet", label: "İnternet" },
  { key: "wheelchairFriendly", label: "Erişilebilir" },
] as const;

export type ListingBooleanFilterKey =
  (typeof listingBooleanFilters)[number]["key"];
