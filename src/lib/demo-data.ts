import type {
  AuditLogRecord,
  BlogPostRecord,
  ConceptRecord,
  DistrictRecord,
  InquiryRecord,
  OwnerRecord,
  RegionRecord,
  SeoLandingTarget,
  VillaAmenity,
  VillaDetail,
} from "@/features/villas/types";

export const demoRegions: RegionRecord[] = [
  {
    id: "region-kas",
    name: "Kaş",
    slug: "kas",
    shortDescription: "Kaş çevresinde seçilmiş, doğrulama süreçlerinden geçmiş villa seçenekleri.",
    heroTitle: "Kaş'ta güvenle villa keşfedin",
    heroDescription:
      "Sahipliği ve ilan yetkisi doğrulanmış Kaş villalarını şeffaf fiyat, doğru fotoğraf ve kontrollü müsaitlik altyapısıyla inceleyin.",
  },
  {
    id: "region-fethiye",
    name: "Fethiye",
    slug: "fethiye",
    shortDescription: "Doğa ve deniz dengesi arayan misafirler için Fethiye villaları.",
    heroTitle: "Fethiye'de net kurallı villa seçenekleri",
    heroDescription:
      "Saklı ücretleri gizlemeyen, müsaitliği düzenli takip edilen Fethiye villaları Villawe standardıyla sunulur.",
  },
  {
    id: "region-bodrum",
    name: "Bodrum",
    slug: "bodrum",
    shortDescription: "Premium çizgide Bodrum villaları ve güçlü operasyon temeli.",
    heroTitle: "Bodrum'da premium ve doğrulanmış villalar",
    heroDescription:
      "Lüks, net sözleşme politikaları ve kontrollü ilan kalitesiyle öne çıkan Bodrum seçkisini keşfedin.",
  },
  {
    id: "region-sapanca",
    name: "Sapanca",
    slug: "sapanca",
    shortDescription: "Hafta sonu kaçamakları ve doğa odaklı kısa konaklamalar için Sapanca.",
    heroTitle: "Sapanca'da sakin ve güvenli villa deneyimi",
    heroDescription:
      "Aile ve çiftler için seçilmiş Sapanca villalarında havuz, mahremiyet ve giriş kuralları açık şekilde sunulur.",
  },
];

export const demoDistricts: DistrictRecord[] = [
  { id: "district-kalkan", name: "Kalkan", slug: "kalkan", regionSlug: "kas" },
  { id: "district-cukurbag", name: "Çukurbağ", slug: "cukurbag", regionSlug: "kas" },
  { id: "district-oludeniz", name: "Ölüdeniz", slug: "oludeniz", regionSlug: "fethiye" },
  { id: "district-yalikavak", name: "Yalıkavak", slug: "yalikavak", regionSlug: "bodrum" },
  { id: "district-kirkpinar", name: "Kırkpınar", slug: "kirkpinar", regionSlug: "sapanca" },
];

export const demoConcepts: ConceptRecord[] = [
  {
    id: "concept-muhafazakar",
    name: "Muhafazakar Villa",
    slug: "muhafazakar-villa",
    description: "Korunaklı havuz ve mahremiyet odağı yüksek villa seçenekleri.",
    heroTitle: "Mahremiyet odağı güçlü muhafazakar villalar",
  },
  {
    id: "concept-jakuzili",
    name: "Jakuzili Villa",
    slug: "jakuzili-villa",
    description: "Dinlenme deneyimini güçlendiren jakuzili premium villalar.",
    heroTitle: "Jakuzili villa seçkisi",
  },
  {
    id: "concept-balayi",
    name: "Balayı Villaları",
    slug: "balayi-villalari",
    description: "İki kişilik konfor ve mahremiyet için öne çıkan villalar.",
    heroTitle: "Balayı için özenle seçilmiş villalar",
  },
  {
    id: "concept-cocuk-havuzlu",
    name: "Çocuk Havuzlu Villa",
    slug: "cocuk-havuzlu-villa",
    description: "Aile konforunu artıran çocuk havuzu ve güvenli bahçe özellikleri.",
    heroTitle: "Çocuk havuzlu aile villaları",
  },
  {
    id: "concept-deniz-manzarali",
    name: "Deniz Manzaralı Villa",
    slug: "deniz-manzarali-villa",
    description: "Panoramik manzarayı doğru görsel ve açıklamalarla sunan villalar.",
    heroTitle: "Deniz manzaralı villa seçkisi",
  },
  {
    id: "concept-korunakli",
    name: "Korunaklı Havuzlu Villa",
    slug: "korunakli-havuzlu-villa",
    description: "Dış görünürlüğü azaltılmış havuz tasarımına sahip villalar.",
    heroTitle: "Korunaklı havuzlu villa seçkisi",
  },
];

export const demoAmenities: VillaAmenity[] = [
  { slug: "wifi", name: "Hızlı Wi‑Fi", category: "Genel" },
  { slug: "smart-tv", name: "Akıllı TV", category: "Genel" },
  { slug: "otopark", name: "Özel Otopark", category: "Dış Alan" },
  { slug: "barbeku", name: "Barbekü", category: "Dış Alan" },
  { slug: "cocuk-yatagi", name: "Bebek Yatağı", category: "Aile" },
  { slug: "tam-mutfak", name: "Tam Donanımlı Mutfak", category: "İç Mekan" },
  { slug: "kahve-istasyonu", name: "Kahve İstasyonu", category: "İç Mekan" },
  { slug: "hamak", name: "Hamak", category: "Bahçe" },
  { slug: "isitmali-havuz", name: "Isıtmalı Havuz", category: "Havuz" },
  { slug: "jakuzi", name: "Jakuzi", category: "Spa" },
  { slug: "guneslenme-alani", name: "Güneşlenme Alanı", category: "Havuz" },
];

export const demoOwners: OwnerRecord[] = [
  {
    id: "owner-solea-management",
    displayName: "Solea Villa Management",
    type: "agency",
    email: "operations@villawe.local",
    phone: "+90 532 000 00 01",
  },
  {
    id: "owner-luna-estates",
    displayName: "Luna Estates",
    type: "agency",
    email: "hello@villawe.local",
    phone: "+90 532 000 00 02",
  },
];

export const demoVillas: VillaDetail[] = [
  {
    id: "villa-solea-kalkan",
    slug: "villa-solea-kalkan",
    title: "Villa Solea Kalkan",
    shortDescription:
      "Korunaklı havuz, deniz manzarası ve doğrulanmış yetki belgeleriyle öne çıkan premium Kalkan villası.",
    summary:
      "Geniş terası, iki süit odası ve şeffaf ücret yapısıyla aileler ile çiftler için güven veren bir Kalkan deneyimi sunar.",
    region: { name: "Kaş", slug: "kas" },
    district: { name: "Kalkan", slug: "kalkan" },
    maxGuests: 6,
    bedroomCount: 3,
    bathroomCount: 3,
    bedCount: 4,
    isFeatured: true,
    isNewest: true,
    pricing: {
      basePrice: 14500,
      cleaningFee: 3000,
      depositAmount: 10000,
      serviceFeeType: "fixed",
      serviceFeeValue: 1750,
      extraGuestFee: 1200,
      minNights: 4,
      cancellationPolicy:
        "Girişe 30 gün kalana kadar ücretsiz iptal, sonrasında ön ödeme kesintisi uygulanır.",
      depositPolicy:
        "Hasar depozitosu check-in sırasında alınır ve çıkış kontrolünden sonra iade edilir.",
      seasonPrices: [
        {
          name: "Yüksek Sezon",
          startDate: "2026-06-15",
          endDate: "2026-09-15",
          nightlyPrice: 19800,
          minNightsOverride: 5,
        },
      ],
    },
    concepts: [
      { slug: "korunakli-havuzlu-villa", name: "Korunaklı Havuzlu Villa" },
      { slug: "deniz-manzarali-villa", name: "Deniz Manzaralı Villa" },
      { slug: "jakuzili-villa", name: "Jakuzili Villa" },
    ],
    amenities: demoAmenities.slice(0, 8),
    coverImage: {
      id: "media-solea-cover",
      url: "/images/villawe/villa-solea.svg",
      alt: "Villa Solea Kalkan dış görünüm",
      isCover: true,
    },
    verification: {
      identityVerified: true,
      ownershipOrAuthorityVerified: true,
      tourismPermitVerified: true,
      locationVerified: true,
      photosVerified: true,
      phoneVerified: true,
      lastVerifiedAt: "2026-05-10",
      verifiedByLabel: "Villawe Doğrulama Ekibi",
      verificationNotes:
        "Tapu/yetki belgesi, permit ekranı ve saha fotoğrafları 2026 ilkbahar döneminde yeniden kontrol edildi.",
    },
    features: {
      hasPrivatePool: true,
      hasHeatedPool: false,
      hasJacuzzi: true,
      isShelteredPool: true,
      isConservativeFriendly: true,
      isPetFriendly: false,
      isChildFriendly: true,
      hasSeaView: true,
      hasNatureView: true,
      nearBeach: true,
      nearCenter: true,
      hasBarbecue: true,
      hasFireplace: false,
      hasParking: true,
      hasAirConditioning: true,
      hasInternet: true,
      isWheelchairFriendly: false,
    },
    description:
      "Villa Solea, Kalkan yamaçlarında konumlanan ve ilan yetkisi belgeleri doğrulanmış bir premium villadır. İlan görselleri saha kontrolünden geçirilmiş, ücret kalemleri şeffaf biçimde ayrıştırılmış ve müsaitlik yönetimi operasyon ekibi tarafından günlük güncellenmektedir.",
    checkInTime: "16:00",
    checkOutTime: "10:00",
    ownerName: "Solea Villa Management",
    media: [
      {
        id: "media-solea-cover",
        url: "/images/villawe/villa-solea.svg",
        alt: "Villa Solea Kalkan dış görünüm",
        isCover: true,
      },
      {
        id: "media-solea-pool",
        url: "/images/villawe/villa-pool.svg",
        alt: "Villa Solea Kalkan havuz alanı",
      },
      {
        id: "media-solea-suite",
        url: "/images/villawe/villa-suite.svg",
        alt: "Villa Solea Kalkan süit oda",
      },
    ],
    rooms: [
      {
        id: "room-solea-master",
        name: "Master Süit",
        roomType: "Süit Yatak Odası",
        description: "Deniz manzaralı balkon ve ebeveyn banyosu bulunur.",
        beds: [{ type: "King", quantity: 1, sleeps: 2 }],
      },
      {
        id: "room-solea-family",
        name: "Aile Odası",
        roomType: "Yatak Odası",
        beds: [
          { type: "Queen", quantity: 1, sleeps: 2 },
          { type: "Single", quantity: 2, sleeps: 2 },
        ],
      },
    ],
    poolDetails: [
      "Özel havuz ölçüsü yaklaşık 9 x 4 metre",
      "Dış görünürlüğü azaltılmış bahçe yerleşimi",
      "Gün batımı yönüne bakan güneşlenme terası",
    ],
    houseRules: [
      "Platform dışı kapora talebi gelirse onay vermeyin ve bize bildirin.",
      "Sigara yalnızca dış alanlarda kullanılabilir.",
      "Parti ve yüksek sesli etkinlik kabul edilmez.",
    ],
    nearbyPlaces: [
      { name: "Kalkan Merkez", distanceLabel: "1.7 km", category: "Merkez" },
      { name: "Kaputaş Plajı", distanceLabel: "8.4 km", category: "Plaj" },
      { name: "Market", distanceLabel: "650 m", category: "İhtiyaç" },
    ],
    availabilityBlocks: [
      { startDate: "2026-07-10", endDate: "2026-07-14", type: "reserved", label: "Onaylı rezervasyon" },
      { startDate: "2026-08-01", endDate: "2026-08-03", type: "maintenance", label: "Bakım blokesi" },
    ],
    reviews: [
      {
        id: "review-solea-1",
        authorName: "A. Demir",
        rating: 5,
        title: "Fotoğraflarla birebir",
        body: "İlan görselleriyle evin gerçek hali tutarlıydı. Girişte ücret kalemleriyle ilgili sürpriz yaşamadık.",
        stayDate: "2025-09-12",
        reply: {
          responder: "Villawe Destek",
          body: "Şeffaflık geri bildiriminiz için teşekkür ederiz.",
        },
      },
    ],
    addressPublic: "Kalkan, yamaç bölgesi",
    locationLabel: "Kalkan, Kaş",
    similarVillaSlugs: ["villa-luna-kas", "villa-tera-fethiye"],
  },
  {
    id: "villa-luna-kas",
    slug: "villa-luna-kas",
    title: "Villa Luna Kaş",
    shortDescription:
      "Isıtmalı havuzlu, balayı ve kısa sezon kaçamakları için tasarlanmış butik Kaş villası.",
    summary:
      "Çift odaklı yerleşim, ısıtmalı havuz ve jakuzi avantajıyla ilkbahar-sonbahar döneminde öne çıkar.",
    region: { name: "Kaş", slug: "kas" },
    district: { name: "Çukurbağ", slug: "cukurbag" },
    maxGuests: 4,
    bedroomCount: 2,
    bathroomCount: 2,
    bedCount: 2,
    isFeatured: true,
    isNewest: false,
    pricing: {
      basePrice: 11250,
      cleaningFee: 2500,
      depositAmount: 7500,
      serviceFeeType: "fixed",
      serviceFeeValue: 1450,
      extraGuestFee: 900,
      minNights: 3,
      cancellationPolicy:
        "Girişe 21 gün kalana kadar ücretsiz iptal; sonrasında ilk gece bedeli kesilir.",
      depositPolicy:
        "Depozito check-in günü tahsil edilir, 24 saat içinde hasar kontrolü sonrası iade edilir.",
      seasonPrices: [
        {
          name: "Bahar Dönemi",
          startDate: "2026-04-01",
          endDate: "2026-05-31",
          nightlyPrice: 12850,
        },
      ],
    },
    concepts: [
      { slug: "balayi-villalari", name: "Balayı Villaları" },
      { slug: "jakuzili-villa", name: "Jakuzili Villa" },
    ],
    amenities: demoAmenities.filter((amenity) =>
      ["wifi", "smart-tv", "jakuzi", "tam-mutfak", "kahve-istasyonu"].includes(amenity.slug),
    ),
    coverImage: {
      id: "media-luna-cover",
      url: "/images/villawe/villa-luna.svg",
      alt: "Villa Luna Kaş havuz terası",
      isCover: true,
    },
    verification: {
      identityVerified: true,
      ownershipOrAuthorityVerified: true,
      tourismPermitVerified: true,
      locationVerified: true,
      photosVerified: true,
      phoneVerified: true,
      lastVerifiedAt: "2026-05-08",
      verifiedByLabel: "Villawe Operasyon",
    },
    features: {
      hasPrivatePool: true,
      hasHeatedPool: true,
      hasJacuzzi: true,
      isShelteredPool: false,
      isConservativeFriendly: false,
      isPetFriendly: false,
      isChildFriendly: false,
      hasSeaView: true,
      hasNatureView: true,
      nearBeach: false,
      nearCenter: false,
      hasBarbecue: true,
      hasFireplace: false,
      hasParking: true,
      hasAirConditioning: true,
      hasInternet: true,
      isWheelchairFriendly: false,
    },
    description:
      "Villa Luna, özellikle iki kişilik konaklamalarda şeffaf fiyat akışı ve kontrollü sezon fiyatlamasıyla fark yaratır. Havuz ısıtma bedeli gerektiğinde açıkça gösterilir ve rezervasyon talebi oluşturulmadan gizlenmez.",
    checkInTime: "15:00",
    checkOutTime: "10:00",
    ownerName: "Luna Estates",
    media: [
      {
        id: "media-luna-cover",
        url: "/images/villawe/villa-luna.svg",
        alt: "Villa Luna Kaş havuz terası",
        isCover: true,
      },
      {
        id: "media-luna-room",
        url: "/images/villawe/villa-suite.svg",
        alt: "Villa Luna Kaş yatak odası",
      },
    ],
    rooms: [
      {
        id: "room-luna-main",
        name: "Panoramik Süit",
        roomType: "Süit Yatak Odası",
        beds: [{ type: "Queen", quantity: 1, sleeps: 2 }],
      },
      {
        id: "room-luna-guest",
        name: "İkinci Oda",
        roomType: "Yatak Odası",
        beds: [{ type: "Queen", quantity: 1, sleeps: 2 }],
      },
    ],
    poolDetails: ["Isıtmalı havuz opsiyonu", "Jakuzi", "Açık oturma köşesi"],
    houseRules: ["Evcil hayvan kabul edilmez.", "Sessizlik saatleri 23:00 sonrası başlar."],
    nearbyPlaces: [
      { name: "Kaş Marina", distanceLabel: "9 km", category: "Merkez" },
      { name: "Süpermarket", distanceLabel: "1.2 km", category: "İhtiyaç" },
    ],
    availabilityBlocks: [{ startDate: "2026-06-20", endDate: "2026-06-24", type: "hold", label: "Bekleyen talep" }],
    reviews: [],
    addressPublic: "Çukurbağ Yarımadası, Kaş",
    locationLabel: "Çukurbağ, Kaş",
    similarVillaSlugs: ["villa-solea-kalkan"],
  },
  {
    id: "villa-tera-fethiye",
    slug: "villa-tera-fethiye",
    title: "Villa Tera Fethiye",
    shortDescription:
      "Çocuk dostu bahçe kurgusu ve net minimum gece politikasıyla aile odaklı Fethiye villası.",
    summary:
      "Geniş çim alanı, çocuk havuzu ve plaja makul mesafesiyle uzun yaz tatilleri için uygundur.",
    region: { name: "Fethiye", slug: "fethiye" },
    district: { name: "Ölüdeniz", slug: "oludeniz" },
    maxGuests: 8,
    bedroomCount: 4,
    bathroomCount: 4,
    bedCount: 5,
    isFeatured: false,
    isNewest: true,
    pricing: {
      basePrice: 9800,
      cleaningFee: 2200,
      depositAmount: 6000,
      serviceFeeType: "percentage",
      serviceFeeValue: 5,
      extraGuestFee: 1000,
      minNights: 5,
      cancellationPolicy:
        "Girişe 28 gün kalana kadar ücretsiz iptal. Sonrasında toplam tutarın %20’si kesilir.",
      depositPolicy:
        "Depozito teslim günü alınır, çıkış sonrası en geç 48 saat içinde iade edilir.",
      seasonPrices: [
        {
          name: "Aile Yaz Sezonu",
          startDate: "2026-06-10",
          endDate: "2026-09-10",
          nightlyPrice: 13200,
          minNightsOverride: 6,
        },
      ],
    },
    concepts: [
      { slug: "cocuk-havuzlu-villa", name: "Çocuk Havuzlu Villa" },
      { slug: "deniz-manzarali-villa", name: "Deniz Manzaralı Villa" },
    ],
    amenities: demoAmenities.filter((amenity) =>
      ["wifi", "smart-tv", "otopark", "barbeku", "cocuk-yatagi", "tam-mutfak"].includes(amenity.slug),
    ),
    coverImage: {
      id: "media-tera-cover",
      url: "/images/villawe/villa-tera.svg",
      alt: "Villa Tera Fethiye bahçe cephesi",
      isCover: true,
    },
    verification: {
      identityVerified: true,
      ownershipOrAuthorityVerified: true,
      tourismPermitVerified: true,
      locationVerified: true,
      photosVerified: true,
      phoneVerified: true,
      lastVerifiedAt: "2026-05-06",
      verifiedByLabel: "Villawe Doğrulama Ekibi",
    },
    features: {
      hasPrivatePool: true,
      hasHeatedPool: false,
      hasJacuzzi: false,
      isShelteredPool: false,
      isConservativeFriendly: false,
      isPetFriendly: true,
      isChildFriendly: true,
      hasSeaView: true,
      hasNatureView: true,
      nearBeach: true,
      nearCenter: false,
      hasBarbecue: true,
      hasFireplace: false,
      hasParking: true,
      hasAirConditioning: true,
      hasInternet: true,
      isWheelchairFriendly: false,
    },
    description:
      "Villa Tera, kalabalık ailelerde fiyatın nasıl oluştuğunu net şekilde gösteren ve çocuk dostu planlamayı öne çıkaran bir Fethiye villasıdır. Ek misafir bedeli, temizlik ve hizmet ücreti rezervasyon talebinden önce görünür.",
    checkInTime: "16:00",
    checkOutTime: "10:00",
    ownerName: "Solea Villa Management",
    media: [
      {
        id: "media-tera-cover",
        url: "/images/villawe/villa-tera.svg",
        alt: "Villa Tera Fethiye bahçe cephesi",
        isCover: true,
      },
      {
        id: "media-tera-pool",
        url: "/images/villawe/villa-pool.svg",
        alt: "Villa Tera Fethiye havuz alanı",
      },
    ],
    rooms: [
      {
        id: "room-tera-main",
        name: "Ebeveyn Süiti",
        roomType: "Süit Yatak Odası",
        beds: [{ type: "King", quantity: 1, sleeps: 2 }],
      },
      {
        id: "room-tera-twin",
        name: "Çocuk Odası",
        roomType: "Yatak Odası",
        beds: [{ type: "Single", quantity: 2, sleeps: 2 }],
      },
    ],
    poolDetails: ["Çocuk havuzu", "Gölgelikli dinlenme köşesi", "Bahçe duşu"],
    houseRules: ["Aile konaklamaları önceliklidir.", "Girişte kimlik beyanı zorunludur."],
    nearbyPlaces: [
      { name: "Ölüdeniz Plajı", distanceLabel: "4.9 km", category: "Plaj" },
      { name: "Büyük Market", distanceLabel: "900 m", category: "İhtiyaç" },
    ],
    availabilityBlocks: [],
    reviews: [],
    addressPublic: "Ölüdeniz çevresi, Fethiye",
    locationLabel: "Ölüdeniz, Fethiye",
    similarVillaSlugs: ["villa-solea-kalkan"],
  },
  {
    id: "villa-sapanca-nova",
    slug: "villa-sapanca-nova",
    title: "Villa Nova Sapanca",
    shortDescription:
      "Doğa manzaralı, şömineli ve kısa kaçamaklar için uygun Sapanca villası.",
    summary:
      "Şehirden kısa süreli uzaklaşmak isteyen misafirler için depozito ve iptal politikaları açık biçimde sunulur.",
    region: { name: "Sapanca", slug: "sapanca" },
    district: { name: "Kırkpınar", slug: "kirkpinar" },
    maxGuests: 5,
    bedroomCount: 2,
    bathroomCount: 2,
    bedCount: 3,
    isFeatured: false,
    isNewest: false,
    pricing: {
      basePrice: 8900,
      cleaningFee: 1800,
      depositAmount: 5000,
      serviceFeeType: "fixed",
      serviceFeeValue: 950,
      extraGuestFee: 750,
      minNights: 2,
      cancellationPolicy:
        "Girişe 10 gün kalana kadar ücretsiz iptal, sonrasında ilk gece kesintisi uygulanır.",
      depositPolicy:
        "Depozito aynı gün inceleme sonrası karta iade edilir.",
      seasonPrices: [],
    },
    concepts: [{ slug: "balayi-villalari", name: "Balayı Villaları" }],
    amenities: demoAmenities.filter((amenity) =>
      ["wifi", "smart-tv", "otopark", "kahve-istasyonu", "tam-mutfak"].includes(amenity.slug),
    ),
    coverImage: {
      id: "media-nova-cover",
      url: "/images/villawe/villa-nova.svg",
      alt: "Villa Nova Sapanca dış görünüm",
      isCover: true,
    },
    verification: {
      identityVerified: true,
      ownershipOrAuthorityVerified: true,
      tourismPermitVerified: true,
      locationVerified: true,
      photosVerified: true,
      phoneVerified: true,
      lastVerifiedAt: "2026-05-01",
      verifiedByLabel: "Villawe Operasyon",
    },
    features: {
      hasPrivatePool: false,
      hasHeatedPool: false,
      hasJacuzzi: false,
      isShelteredPool: false,
      isConservativeFriendly: false,
      isPetFriendly: true,
      isChildFriendly: true,
      hasSeaView: false,
      hasNatureView: true,
      nearBeach: false,
      nearCenter: true,
      hasBarbecue: false,
      hasFireplace: true,
      hasParking: true,
      hasAirConditioning: true,
      hasInternet: true,
      isWheelchairFriendly: false,
    },
    description:
      "Villa Nova Sapanca, daha kısa konaklama paternleri için düzenlenmiş fiyat ve iptal akışıyla doğa odaklı bir seçenektir.",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    ownerName: "Luna Estates",
    media: [
      {
        id: "media-nova-cover",
        url: "/images/villawe/villa-nova.svg",
        alt: "Villa Nova Sapanca dış görünüm",
        isCover: true,
      },
    ],
    rooms: [
      {
        id: "room-nova-main",
        name: "Ana Yatak Odası",
        roomType: "Yatak Odası",
        beds: [{ type: "Queen", quantity: 1, sleeps: 2 }],
      },
    ],
    poolDetails: ["Şömine önü oturma alanı", "Bahçe salıncağı"],
    houseRules: ["Evcil hayvan talebi önceden bildirilmelidir."],
    nearbyPlaces: [{ name: "Sapanca Gölü", distanceLabel: "2.2 km", category: "Doğa" }],
    availabilityBlocks: [],
    reviews: [],
    addressPublic: "Kırkpınar, Sapanca",
    locationLabel: "Kırkpınar, Sapanca",
    similarVillaSlugs: ["villa-luna-kas"],
  },
];

export const demoBlogPosts: BlogPostRecord[] = [
  {
    id: "blog-guvenli-kiralama",
    title: "Villa kiralarken sahte ilan riski nasıl azaltılır?",
    slug: "villa-kiralarken-sahte-ilan-riski-nasil-azaltilir",
    excerpt:
      "Yetki belgesi, konum doğrulaması ve fiyat şeffaflığını merkeze alarak güvenli kiralama kontrol listesini paylaşıyoruz.",
    coverImage: "/images/villawe/blog-guide.svg",
    content:
      "Sahte ilanları ayırt etmenin ilk adımı, ilanın gerçekten yetkili kişi tarafından girildiğini ve ödeme akışının platform dışına itilmediğini doğrulamaktır. Villawe, doğrulama rozetlerini yalnızca veri tabanındaki gerçek alanlar tamamlandığında gösterir.",
    publishedAt: "2026-05-08",
  },
  {
    id: "blog-kalkan-bolge-rehberi",
    title: "Kalkan'da villa seçerken hangi bölgeler öne çıkar?",
    slug: "kalkanda-villa-secerken-hangi-bolgeler-one-cikar",
    excerpt:
      "Manzara, merkeze erişim ve mahremiyet dengesi üzerinden Kalkan villa bölgelerini özetledik.",
    coverImage: "/images/villawe/blog-region.svg",
    content:
      "Kalkan'da yamaç konumlu villalar güçlü manzara sunarken, merkez erişiminde araç gereksinimi yaratabilir. Seçim yaparken manzara ile lojistik arasında net öncelik belirlemek önemlidir.",
    publishedAt: "2026-05-02",
  },
];

export const demoSeoTargets: SeoLandingTarget[] = [
  { type: "region", slug: "kas-villa-kiralama", entitySlug: "kas" },
  { type: "district", slug: "kalkan-villa-kiralama", entitySlug: "kalkan" },
  { type: "region", slug: "fethiye-villa-kiralama", entitySlug: "fethiye" },
  { type: "region", slug: "bodrum-villa-kiralama", entitySlug: "bodrum" },
  { type: "region", slug: "sapanca-villa-kiralama", entitySlug: "sapanca" },
  { type: "concept", slug: "muhafazakar-villa", entitySlug: "muhafazakar-villa" },
  { type: "concept", slug: "jakuzili-villa", entitySlug: "jakuzili-villa" },
  { type: "concept", slug: "balayi-villalari", entitySlug: "balayi-villalari" },
  { type: "concept", slug: "cocuk-havuzlu-villa", entitySlug: "cocuk-havuzlu-villa" },
  { type: "concept", slug: "deniz-manzarali-villa", entitySlug: "deniz-manzarali-villa" },
  { type: "concept", slug: "korunakli-havuzlu-villa", entitySlug: "korunakli-havuzlu-villa" },
];

export const demoInquiries: InquiryRecord[] = [
  {
    id: "inq-1",
    villaTitle: "Villa Solea Kalkan",
    fullName: "Selin Kaya",
    email: "selin@example.com",
    phone: "+90 533 444 11 22",
    startDate: "2026-07-18",
    endDate: "2026-07-24",
    guestCount: 4,
    status: "new",
    estimatedTotal: 129550,
    createdAt: "2026-05-17T10:15:00.000Z",
  },
  {
    id: "inq-2",
    villaTitle: "Villa Tera Fethiye",
    fullName: "Mert Arslan",
    email: "mert@example.com",
    phone: "+90 532 555 66 77",
    startDate: "2026-08-05",
    endDate: "2026-08-12",
    guestCount: 6,
    status: "reviewing",
    estimatedTotal: 101940,
    createdAt: "2026-05-16T09:00:00.000Z",
  },
];

export const demoAuditLogs: AuditLogRecord[] = [
  {
    id: "audit-1",
    action: "verification.updated",
    entityType: "villa",
    entityLabel: "Villa Solea Kalkan",
    message: "Turizm izin kontrolü ve fotoğraf doğrulaması güncellendi.",
    createdAt: "2026-05-10T08:40:00.000Z",
  },
  {
    id: "audit-2",
    action: "villa.published",
    entityType: "villa",
    entityLabel: "Villa Luna Kaş",
    message: "Tüm doğrulama alanları tamamlandığı için ilan yayına alındı.",
    createdAt: "2026-05-08T13:25:00.000Z",
  },
];

export const demoPolicies = {
  safeRentalWarnings: [
    "Ödemeyi yalnızca teyitli akışta yapın.",
    "Depozito ve ek ücretleri talep öncesinde görün.",
    "Kararsız kaldığınız adımlarda ekibimizden teyit isteyin.",
  ],
  faqs: [
    {
      question: "Villawe tüm villaları nasıl doğrular?",
      answer:
        "İlan yetkisi, konum, iletişim ve görsel tutarlılık kontrolleri tamamlanan villalar doğrulama rozetiyle gösterilir.",
    },
    {
      question: "Ücret kalemleri neden ayrı gösteriliyor?",
      answer:
        "Temizlik, hizmet ve depozito gibi kalemlerin baştan görünür olması karar sürecini netleştirir.",
    },
    {
      question: "Talep gönderdikten sonra ne olur?",
      answer:
        "Talebiniz alındıktan sonra müsaitlik ve fiyat teyidi Villawe üzerinden paylaşılır.",
    },
    {
      question: "Depozito ne zaman netleşir?",
      answer:
        "Depozito tutarı villa bazında gösterilir ve talep öncesinde görünür durumda olur.",
    },
    {
      question: "Platform dışı ödeme istenirse ne yapmalıyım?",
      answer:
        "İşlemi durdurun ve size iletilen talebi Villawe üzerinden yeniden teyit edin.",
    },
  ],
};
