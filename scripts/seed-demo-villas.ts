import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config as loadDotEnv } from "dotenv";
import { Pool } from "pg";
import { createClient } from "redis";

loadDotEnv({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run the demo villa seed.");
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const PUBLIC_CACHE_PREFIXES = [
  "villawe:public",
  "villawe:search",
  "villawe:seo",
  "villawe:availability",
  "villawe:pricing",
];

type DemoVillaDefinition = {
  slug: string;
  title: string;
  owner: {
    id: string;
    displayName: string;
    email: string;
    phone: string;
  };
  region: { name: string; slug: string; shortDescription: string };
  district: { name: string; slug: string };
  addressPublic: string;
  locationLabel: string;
  lat: string;
  lng: string;
  maxGuests: number;
  bedroomCount: number;
  bathroomCount: number;
  bedCount: number;
  shortDescription: string;
  description: string;
  basePrice: number;
  cleaningFee: number;
  depositAmount: number;
  minNights: number;
  concepts: string[];
  amenities: string[];
  features: {
    hasPrivatePool: boolean;
    hasHeatedPool: boolean;
    hasJacuzzi: boolean;
    isShelteredPool: boolean;
    isConservativeFriendly: boolean;
    isPetFriendly: boolean;
    isChildFriendly: boolean;
    isFamilyFriendly: boolean;
    isLuxuryVilla: boolean;
    isEconomicalVilla: boolean;
    hasSeaView: boolean;
    hasNatureView: boolean;
    nearBeach: boolean;
    nearCenter: boolean;
    hasBarbecue: boolean;
    hasParking: boolean;
    hasAirConditioning: boolean;
    hasInternet: boolean;
  };
  media: Array<{
    id: string;
    url: string;
    alt: string;
    isCover?: boolean;
  }>;
  rooms: Array<{
    id: string;
    name: string;
    roomType: string;
    description?: string;
    beds: Array<{
      type: string;
      quantity: number;
      sleeps: number;
    }>;
  }>;
  houseRules: string[];
  poolDetails: string[];
  nearbyPlaces: Array<{
    name: string;
    distanceLabel: string;
    category: string;
  }>;
  reviews: Array<{
    id: string;
    authorName: string;
    rating: number;
    title: string;
    body: string;
    stayDate: string;
  }>;
};

const demoDescriptionNote =
  "Bu ilan Villawe arayüz ve özellik testleri için oluşturulmuş demo kayıttır.";

const taxonomy = {
  concepts: [
    {
      slug: "balayi-villalari",
      name: "Balayı Villaları",
      description: "Özel anlar için seçilmiş, mahremiyet ve konfor odaklı villalar.",
    },
    {
      slug: "deniz-manzarali-villa",
      name: "Deniz Manzaralı Villa",
      description: "Açık ufuk ve panoramik sahil manzarası sunan villalar.",
    },
    {
      slug: "jakuzili-villa",
      name: "Jakuzili Villa",
      description: "Konaklamaya spa rahatlığı katan jakuzili villa seçkisi.",
    },
    {
      slug: "muhafazakar-villa",
      name: "Muhafazakar Villa",
      description: "Mahremiyet odağı yüksek ve kontrollü alan planına sahip villalar.",
    },
    {
      slug: "korunakli-havuzlu-villa",
      name: "Korunaklı Havuzlu Villa",
      description: "Korunaklı havuz alanı sunan, dış görünürlüğü azaltılmış villalar.",
    },
    {
      slug: "doga-manzarali-villa",
      name: "Doğa Manzaralı Villa",
      description: "Yeşil doku ve sakin manzarayla öne çıkan villa seçenekleri.",
    },
    {
      slug: "kalabalik-aile-villasi",
      name: "Kalabalık Aile Villası",
      description: "Geniş aileler ve arkadaş grupları için yüksek kapasiteli villalar.",
    },
    {
      slug: "luks-villa",
      name: "Lüks Villa",
      description: "Premium servis anlayışı ve yüksek tasarım kalitesine sahip villalar.",
    },
    {
      slug: "ekonomik-villa",
      name: "Ekonomik Villa",
      description: "Fiyat dengesini koruyan, kompakt ama konforlu villa seçenekleri.",
    },
    {
      slug: "denize-yakin-villa",
      name: "Denize Yakın Villa",
      description: "Plaja ve kıyı yaşamına kısa mesafede konumlanan villalar.",
    },
  ],
  amenities: [
    { slug: "ozel-havuz", name: "Özel Havuz", category: "Havuz" },
    { slug: "jakuzi", name: "Jakuzi", category: "Spa" },
    { slug: "deniz-manzarasi", name: "Deniz Manzarası", category: "Manzara" },
    { slug: "doga-manzarasi", name: "Doğa Manzarası", category: "Manzara" },
    { slug: "korunakli-havuz", name: "Korunaklı Havuz", category: "Havuz" },
    { slug: "isitmali-havuz", name: "Isıtmalı Havuz", category: "Havuz" },
    { slug: "klima", name: "Klima", category: "Genel" },
    { slug: "wifi", name: "Wi-Fi", category: "Genel" },
    { slug: "otopark", name: "Otopark", category: "Dış Alan" },
    { slug: "barbeku", name: "Barbekü", category: "Dış Alan" },
    { slug: "evcil-hayvan-uygun", name: "Evcil Hayvan Uygun", category: "Aile" },
    { slug: "aile-dostu", name: "Aile Dostu", category: "Aile" },
  ],
};

const demoVillas: DemoVillaDefinition[] = [
  {
    slug: "demo-villa-luna",
    title: "[Demo] Villa Luna",
    owner: {
      id: "demo-owner-luna",
      displayName: "Luna Collection",
      email: "demo-luna@villawe.local",
      phone: "+90 532 100 00 01",
    },
    region: {
      name: "Kaş",
      slug: "kas",
      shortDescription: "Kaş çevresinde deniz manzaralı ve doğrulama süreçleri tamamlanmış villalar.",
    },
    district: { name: "Kalkan", slug: "kalkan" },
    addressPublic: "Kalkan, Kaş",
    locationLabel: "Kalkan sahil hattına 5 dakika",
    lat: "36.266667",
    lng: "29.416667",
    maxGuests: 6,
    bedroomCount: 3,
    bathroomCount: 3,
    bedCount: 4,
    shortDescription:
      "Deniz manzarası, jakuzi ve özel havuz kombinasyonuyla öne çıkan premium demo villa.",
    description:
      "Kalkan ufkuna açılan geniş terası, sakin gün batımı hattı ve dengeli iç mekan planıyla Villa Luna güçlü bir detay sayfası testi sunar.",
    basePrice: 8500,
    cleaningFee: 1500,
    depositAmount: 5000,
    minNights: 4,
    concepts: ["balayi-villalari", "deniz-manzarali-villa", "jakuzili-villa"],
    amenities: ["ozel-havuz", "jakuzi", "deniz-manzarasi", "klima", "wifi", "otopark", "barbeku", "aile-dostu"],
    features: {
      hasPrivatePool: true,
      hasHeatedPool: false,
      hasJacuzzi: true,
      isShelteredPool: false,
      isConservativeFriendly: false,
      isPetFriendly: false,
      isChildFriendly: true,
      isFamilyFriendly: true,
      isLuxuryVilla: false,
      isEconomicalVilla: false,
      hasSeaView: true,
      hasNatureView: false,
      nearBeach: true,
      nearCenter: true,
      hasBarbecue: true,
      hasParking: true,
      hasAirConditioning: true,
      hasInternet: true,
    },
    media: [
      { id: "demo-media-luna-1", url: "/images/villawe/villa-luna.svg", alt: "Villa Luna dış cephe görünümü", isCover: true },
      { id: "demo-media-luna-2", url: "/images/villawe/villa-suite.svg", alt: "Villa Luna yatak odası" },
      { id: "demo-media-luna-3", url: "/images/villawe/villa-pool.svg", alt: "Villa Luna havuz terası" },
    ],
    rooms: [
      {
        id: "demo-room-luna-master",
        name: "Master Süit",
        roomType: "Yatak Odası",
        description: "Deniz manzaralı ebeveyn süiti ve özel banyo.",
        beds: [{ type: "King", quantity: 1, sleeps: 2 }],
      },
      {
        id: "demo-room-luna-double",
        name: "İkinci Oda",
        roomType: "Yatak Odası",
        beds: [{ type: "Double", quantity: 1, sleeps: 2 }],
      },
      {
        id: "demo-room-luna-twin",
        name: "Üçüncü Oda",
        roomType: "Yatak Odası",
        beds: [{ type: "Twin", quantity: 2, sleeps: 2 }],
      },
    ],
    houseRules: [
      "Platform dışı ödeme yapılmamalıdır.",
      "Müzik ses seviyesi 23:00 sonrası düşürülmelidir.",
      "Evcil hayvan kabul edilmez.",
    ],
    poolDetails: [
      "Özel havuz ölçüsü yaklaşık 8 x 4 metredir.",
      "Jakuzi havuz terasına entegredir.",
      "Güneşlenme alanı gün boyu direkt ışık alır.",
    ],
    nearbyPlaces: [
      { name: "Kalkan Marina", distanceLabel: "2.4 km", category: "Merkez" },
      { name: "Kaputaş Plajı", distanceLabel: "8.1 km", category: "Plaj" },
      { name: "Market", distanceLabel: "950 m", category: "İhtiyaç" },
    ],
    reviews: [
      {
        id: "demo-review-luna",
        authorName: "Ece K.",
        rating: 5,
        title: "Manzara ve alan kullanımı çok iyi",
        body: "Kalkan tarafında görsel kaliteyi iyi temsil eden, düzenli ve ferah bir villa deneyimi sundu.",
        stayDate: "2026-04-18",
      },
    ],
  },
  {
    slug: "demo-villa-solea",
    title: "[Demo] Villa Solea",
    owner: {
      id: "demo-owner-solea",
      displayName: "Solea Retreats",
      email: "demo-solea@villawe.local",
      phone: "+90 532 100 00 02",
    },
    region: {
      name: "Fethiye",
      slug: "fethiye",
      shortDescription: "Fethiye bölgesinde deniz ve mahremiyet dengesini öne çıkaran seçkiler.",
    },
    district: { name: "Faralya", slug: "faralya" },
    addressPublic: "Faralya, Fethiye",
    locationLabel: "Faralya yamaç hattında panoramik konum",
    lat: "36.530000",
    lng: "29.190000",
    maxGuests: 4,
    bedroomCount: 2,
    bathroomCount: 2,
    bedCount: 2,
    shortDescription:
      "Korunaklı havuz planı ve sahil çizgisine bakan terasıyla çiftler için güçlü demo seçenek.",
    description:
      "Solea, muhafazakar aileler ve çiftler için hazırlanmış sade ama ferah bir kurgu sunar; detay sayfasında mahremiyet, manzara ve fiyat bloklarını test etmek için idealdir.",
    basePrice: 7200,
    cleaningFee: 1250,
    depositAmount: 4000,
    minNights: 3,
    concepts: ["muhafazakar-villa", "korunakli-havuzlu-villa", "deniz-manzarali-villa"],
    amenities: ["ozel-havuz", "korunakli-havuz", "deniz-manzarasi", "klima", "wifi", "otopark", "aile-dostu"],
    features: {
      hasPrivatePool: true,
      hasHeatedPool: false,
      hasJacuzzi: false,
      isShelteredPool: true,
      isConservativeFriendly: true,
      isPetFriendly: false,
      isChildFriendly: true,
      isFamilyFriendly: true,
      isLuxuryVilla: false,
      isEconomicalVilla: false,
      hasSeaView: true,
      hasNatureView: false,
      nearBeach: true,
      nearCenter: false,
      hasBarbecue: true,
      hasParking: true,
      hasAirConditioning: true,
      hasInternet: true,
    },
    media: [
      { id: "demo-media-solea-1", url: "/images/villawe/villa-solea.svg", alt: "Villa Solea dış alan görünümü", isCover: true },
      { id: "demo-media-solea-2", url: "/images/villawe/villa-pool.svg", alt: "Villa Solea korunaklı havuz alanı" },
      { id: "demo-media-solea-3", url: "/images/villawe/villa-suite.svg", alt: "Villa Solea yatak odası" },
    ],
    rooms: [
      {
        id: "demo-room-solea-master",
        name: "Ana Süit",
        roomType: "Yatak Odası",
        beds: [{ type: "Queen", quantity: 1, sleeps: 2 }],
      },
      {
        id: "demo-room-solea-second",
        name: "İkinci Oda",
        roomType: "Yatak Odası",
        beds: [{ type: "Queen", quantity: 1, sleeps: 2 }],
      },
    ],
    houseRules: [
      "Havuz alanında cam ürün kullanılmamalıdır.",
      "Dışarıdan ziyaretçi kabulü önceden bildirilmelidir.",
      "Platform dışı ödeme yapılmamalıdır.",
    ],
    poolDetails: [
      "Korunaklı havuz duvarları dış görünürlüğü azaltır.",
      "Güneşlenme alanı iki kişilik şezlong düzenine sahiptir.",
    ],
    nearbyPlaces: [
      { name: "Kabak Koyu", distanceLabel: "6.3 km", category: "Plaj" },
      { name: "Faralya Market", distanceLabel: "1.2 km", category: "İhtiyaç" },
      { name: "Babadağ Teleferik", distanceLabel: "13 km", category: "Aktivite" },
    ],
    reviews: [
      {
        id: "demo-review-solea",
        authorName: "Merve T.",
        rating: 5,
        title: "Mahremiyet ve manzara dengesi başarılı",
        body: "Korunaklı havuz ve açıklamaların netliği sayesinde karar süreci kolaylaştı.",
        stayDate: "2026-03-09",
      },
    ],
  },
  {
    slug: "demo-villa-tera",
    title: "[Demo] Villa Tera",
    owner: {
      id: "demo-owner-tera",
      displayName: "Tera Nature Houses",
      email: "demo-tera@villawe.local",
      phone: "+90 532 100 00 03",
    },
    region: {
      name: "Sapanca",
      slug: "sapanca",
      shortDescription: "Sapanca çevresinde doğa ve kısa kaçamak deneyimi odaklı villa koleksiyonu.",
    },
    district: { name: "Kırkpınar", slug: "kirkpinar" },
    addressPublic: "Kırkpınar, Sapanca",
    locationLabel: "Kırkpınar göl hattına yakın sakin bölge",
    lat: "40.705000",
    lng: "30.258000",
    maxGuests: 8,
    bedroomCount: 4,
    bathroomCount: 3,
    bedCount: 5,
    shortDescription:
      "Doğa manzarası, ısıtmalı havuz ve kalabalık aileye uygun planıyla dört mevsim demo villa.",
    description:
      "Tera, göl çevresi kaçamakları için hazırlanan modern bir aile villasıdır; doğa manzarası, ısıtmalı havuz ve jakuzi bloklarıyla detay sayfasını doldurur.",
    basePrice: 9500,
    cleaningFee: 1750,
    depositAmount: 6000,
    minNights: 2,
    concepts: ["jakuzili-villa", "doga-manzarali-villa", "kalabalik-aile-villasi"],
    amenities: ["ozel-havuz", "isitmali-havuz", "jakuzi", "doga-manzarasi", "klima", "wifi", "otopark", "barbeku", "evcil-hayvan-uygun", "aile-dostu"],
    features: {
      hasPrivatePool: true,
      hasHeatedPool: true,
      hasJacuzzi: true,
      isShelteredPool: false,
      isConservativeFriendly: false,
      isPetFriendly: true,
      isChildFriendly: true,
      isFamilyFriendly: true,
      isLuxuryVilla: false,
      isEconomicalVilla: false,
      hasSeaView: false,
      hasNatureView: true,
      nearBeach: false,
      nearCenter: true,
      hasBarbecue: true,
      hasParking: true,
      hasAirConditioning: true,
      hasInternet: true,
    },
    media: [
      { id: "demo-media-tera-1", url: "/images/villawe/villa-tera.svg", alt: "Villa Tera dış cephe görünümü", isCover: true },
      { id: "demo-media-tera-2", url: "/images/villawe/villa-pool.svg", alt: "Villa Tera ısıtmalı havuz alanı" },
      { id: "demo-media-tera-3", url: "/images/villawe/villa-suite.svg", alt: "Villa Tera salon ve şömine alanı" },
    ],
    rooms: [
      {
        id: "demo-room-tera-master",
        name: "Ana Oda",
        roomType: "Yatak Odası",
        beds: [{ type: "King", quantity: 1, sleeps: 2 }],
      },
      {
        id: "demo-room-tera-double",
        name: "Göl Oda",
        roomType: "Yatak Odası",
        beds: [{ type: "Double", quantity: 1, sleeps: 2 }],
      },
      {
        id: "demo-room-tera-twin",
        name: "Çocuk Odası",
        roomType: "Yatak Odası",
        beds: [{ type: "Twin", quantity: 2, sleeps: 2 }],
      },
      {
        id: "demo-room-tera-guest",
        name: "Misafir Oda",
        roomType: "Yatak Odası",
        beds: [{ type: "Single", quantity: 1, sleeps: 1 }],
      },
    ],
    houseRules: [
      "Evcil hayvan kabulü ön onayla yapılır.",
      "Bahçe ateşi yalnızca belirlenen alanda yakılabilir.",
      "Platform dışı ödeme yapılmamalıdır.",
    ],
    poolDetails: [
      "Isıtmalı havuz ilkbahar ve sonbahar döneminde aktif edilir.",
      "Bahçe hattı göl yönüne açık, çevresi yeşil çitlerle çevrilidir.",
    ],
    nearbyPlaces: [
      { name: "Sapanca Gölü", distanceLabel: "1.8 km", category: "Göl" },
      { name: "Kahvaltı Mekanları", distanceLabel: "900 m", category: "Yeme İçme" },
      { name: "Doğa Yürüyüş Parkuru", distanceLabel: "2.1 km", category: "Aktivite" },
    ],
    reviews: [
      {
        id: "demo-review-tera",
        authorName: "Bora Y.",
        rating: 5,
        title: "Aile ve arkadaş grubu için rahat",
        body: "Odaların dağılımı ve dış alan kullanımı kalabalık konaklamaya çok uygun hissettirdi.",
        stayDate: "2026-02-14",
      },
    ],
  },
  {
    slug: "demo-villa-nova",
    title: "[Demo] Villa Nova",
    owner: {
      id: "demo-owner-nova",
      displayName: "Nova Select Bodrum",
      email: "demo-nova@villawe.local",
      phone: "+90 532 100 00 04",
    },
    region: {
      name: "Bodrum",
      slug: "bodrum",
      shortDescription: "Bodrum çizgisinde üst segment ve geniş kapasiteli villa portföyü.",
    },
    district: { name: "Yalıkavak", slug: "yalikavak" },
    addressPublic: "Yalıkavak, Bodrum",
    locationLabel: "Yalıkavak marina üst kotu",
    lat: "37.108611",
    lng: "27.285556",
    maxGuests: 10,
    bedroomCount: 5,
    bathroomCount: 5,
    bedCount: 6,
    shortDescription:
      "Lüks segmentte geniş kapasite, deniz manzarası ve güçlü teras kullanımı sunan demo villa.",
    description:
      "Nova, yüksek fiyatlı villa kartı ve detay sayfası için tasarlandı; büyük terası, çok odalı planı ve premium hissiyle satış odaklı UI bloklarını besler.",
    basePrice: 14500,
    cleaningFee: 2500,
    depositAmount: 10000,
    minNights: 5,
    concepts: ["luks-villa", "deniz-manzarali-villa", "jakuzili-villa"],
    amenities: ["ozel-havuz", "jakuzi", "deniz-manzarasi", "klima", "wifi", "otopark", "barbeku", "aile-dostu"],
    features: {
      hasPrivatePool: true,
      hasHeatedPool: false,
      hasJacuzzi: true,
      isShelteredPool: false,
      isConservativeFriendly: false,
      isPetFriendly: false,
      isChildFriendly: true,
      isFamilyFriendly: true,
      isLuxuryVilla: true,
      isEconomicalVilla: false,
      hasSeaView: true,
      hasNatureView: false,
      nearBeach: true,
      nearCenter: true,
      hasBarbecue: true,
      hasParking: true,
      hasAirConditioning: true,
      hasInternet: true,
    },
    media: [
      { id: "demo-media-nova-1", url: "/images/villawe/villa-nova.svg", alt: "Villa Nova teras ve havuz görünümü", isCover: true },
      { id: "demo-media-nova-2", url: "/images/villawe/villa-suite.svg", alt: "Villa Nova master süit" },
      { id: "demo-media-nova-3", url: "/images/villawe/villa-pool.svg", alt: "Villa Nova havuz ve oturma alanı" },
    ],
    rooms: [
      {
        id: "demo-room-nova-master",
        name: "Master Süit",
        roomType: "Yatak Odası",
        beds: [{ type: "King", quantity: 1, sleeps: 2 }],
      },
      {
        id: "demo-room-nova-double-1",
        name: "Marina Oda",
        roomType: "Yatak Odası",
        beds: [{ type: "Queen", quantity: 1, sleeps: 2 }],
      },
      {
        id: "demo-room-nova-double-2",
        name: "Teras Oda",
        roomType: "Yatak Odası",
        beds: [{ type: "Queen", quantity: 1, sleeps: 2 }],
      },
      {
        id: "demo-room-nova-twin",
        name: "Misafir Oda",
        roomType: "Yatak Odası",
        beds: [{ type: "Twin", quantity: 2, sleeps: 2 }],
      },
      {
        id: "demo-room-nova-family",
        name: "Aile Odası",
        roomType: "Yatak Odası",
        beds: [{ type: "Single", quantity: 2, sleeps: 2 }],
      },
    ],
    houseRules: [
      "Parti ve yüksek sesli etkinlik yapılamaz.",
      "Çocuklar havuz başında gözetimsiz bırakılmamalıdır.",
      "Platform dışı ödeme yapılmamalıdır.",
    ],
    poolDetails: [
      "Sonsuzluk etkili havuz ve akşam aydınlatması bulunur.",
      "Teras alanı geniş oturma grubu ve gölgelik bölümler içerir.",
    ],
    nearbyPlaces: [
      { name: "Yalıkavak Marina", distanceLabel: "2.2 km", category: "Merkez" },
      { name: "Beach Club", distanceLabel: "3.1 km", category: "Plaj" },
      { name: "Gurme Market", distanceLabel: "1.1 km", category: "İhtiyaç" },
    ],
    reviews: [
      {
        id: "demo-review-nova",
        authorName: "Selin A.",
        rating: 5,
        title: "Premium kart ve detay sayfası için çok güçlü",
        body: "Geniş alan planı ve fiyat seviyesi üst segment kullanıcı akışını net test ettirdi.",
        stayDate: "2026-05-02",
      },
    ],
  },
  {
    slug: "demo-villa-mira",
    title: "[Demo] Villa Mira",
    owner: {
      id: "demo-owner-mira",
      displayName: "Mira Coast Houses",
      email: "demo-mira@villawe.local",
      phone: "+90 532 100 00 05",
    },
    region: {
      name: "Marmaris",
      slug: "marmaris",
      shortDescription: "Marmaris hattında denize yakın ve doğayla dengeli butik villa seçkisi.",
    },
    district: { name: "Selimiye", slug: "selimiye" },
    addressPublic: "Selimiye, Marmaris",
    locationLabel: "Selimiye kıyı şeridine kısa mesafede",
    lat: "36.702500",
    lng: "28.087500",
    maxGuests: 5,
    bedroomCount: 2,
    bathroomCount: 2,
    bedCount: 3,
    shortDescription:
      "Doğa dokusu ve plaja yakınlığıyla ekonomik segmentte öne çıkan butik demo villa.",
    description:
      "Mira, kompakt ama sıcak bir tatil senaryosu sunar; ekonomik fiyat seviyesi, evcil hayvan uyumu ve doğa manzarasıyla farklı kullanıcı segmentlerini test eder.",
    basePrice: 6800,
    cleaningFee: 1200,
    depositAmount: 3500,
    minNights: 3,
    concepts: ["ekonomik-villa", "doga-manzarali-villa", "denize-yakin-villa"],
    amenities: ["ozel-havuz", "doga-manzarasi", "klima", "wifi", "otopark", "barbeku", "evcil-hayvan-uygun", "aile-dostu"],
    features: {
      hasPrivatePool: true,
      hasHeatedPool: false,
      hasJacuzzi: false,
      isShelteredPool: false,
      isConservativeFriendly: false,
      isPetFriendly: true,
      isChildFriendly: true,
      isFamilyFriendly: true,
      isLuxuryVilla: false,
      isEconomicalVilla: true,
      hasSeaView: false,
      hasNatureView: true,
      nearBeach: true,
      nearCenter: false,
      hasBarbecue: true,
      hasParking: true,
      hasAirConditioning: true,
      hasInternet: true,
    },
    media: [
      { id: "demo-media-mira-1", url: "/images/villawe/villa-pool.svg", alt: "Villa Mira havuz görünümü", isCover: true },
      { id: "demo-media-mira-2", url: "/images/villawe/villa-suite.svg", alt: "Villa Mira yatak odası" },
      { id: "demo-media-mira-3", url: "/images/villawe/villa-fallback.svg", alt: "Villa Mira bahçe köşesi" },
    ],
    rooms: [
      {
        id: "demo-room-mira-master",
        name: "Ana Oda",
        roomType: "Yatak Odası",
        beds: [{ type: "Queen", quantity: 1, sleeps: 2 }],
      },
      {
        id: "demo-room-mira-family",
        name: "Aile Odası",
        roomType: "Yatak Odası",
        beds: [
          { type: "Twin", quantity: 1, sleeps: 1 },
          { type: "Single", quantity: 2, sleeps: 2 },
        ],
      },
    ],
    houseRules: [
      "Evcil hayvan için ön bilgi verilmelidir.",
      "Havuz alanında çocuklar gözetim altında tutulmalıdır.",
      "Platform dışı ödeme yapılmamalıdır.",
    ],
    poolDetails: [
      "Butik ölçekte özel havuz ve ahşap deck alanı bulunur.",
      "Bahçe alanı zeytin ağaçlarıyla çevrilidir.",
    ],
    nearbyPlaces: [
      { name: "Selimiye Sahili", distanceLabel: "900 m", category: "Plaj" },
      { name: "Balık Restoranları", distanceLabel: "1.4 km", category: "Yeme İçme" },
      { name: "Yerel Market", distanceLabel: "700 m", category: "İhtiyaç" },
    ],
    reviews: [
      {
        id: "demo-review-mira",
        authorName: "Ayça D.",
        rating: 4,
        title: "Butik ve dengeli",
        body: "Ekonomik fiyat bandına rağmen bahçe ve havuz kullanımı beklediğimizden iyi hissettirdi.",
        stayDate: "2026-04-05",
      },
    ],
  },
];

function getBootstrapAdminEmail() {
  return process.env.ADMIN_BOOTSTRAP_EMAIL || process.env.SEED_ADMIN_EMAIL || "admin@villawe.local";
}

function getBootstrapAdminPassword() {
  return (
    process.env.ADMIN_BOOTSTRAP_PASSWORD ||
    process.env.SEED_ADMIN_PASSWORD ||
    "ChangeMe123!"
  );
}

async function upsertAdminUser() {
  const adminPasswordHash = await bcrypt.hash(getBootstrapAdminPassword(), 12);

  const user = await prisma.user.upsert({
    where: { email: getBootstrapAdminEmail() },
    update: {
      passwordHash: adminPasswordHash,
      firstName: "Villawe",
      lastName: "Admin",
      status: "ACTIVE",
    },
    create: {
      id: "seed-admin-user",
      email: getBootstrapAdminEmail(),
      passwordHash: adminPasswordHash,
      firstName: "Villawe",
      lastName: "Admin",
      status: "ACTIVE",
    },
  });

  await prisma.adminUser.upsert({
    where: { userId: user.id },
    update: {
      isSuperAdmin: true,
    },
    create: {
      id: "seed-admin-profile",
      userId: user.id,
      isSuperAdmin: true,
    },
  });

  return user;
}

async function ensurePolicies() {
  await prisma.cancellationPolicy.upsert({
    where: { slug: "standart-iptal" },
    update: {
      name: "Standart İptal Politikası",
      summary: "İptal koşulları rezervasyon öncesi açıkça paylaşılır.",
      details:
        "Girişe kalan süreye göre uygulanacak iptal koşulları talep aşamasında misafirle net şekilde paylaşılır.",
    },
    create: {
      id: "policy-standard-cancellation",
      slug: "standart-iptal",
      name: "Standart İptal Politikası",
      summary: "İptal koşulları rezervasyon öncesi açıkça paylaşılır.",
      details:
        "Girişe kalan süreye göre uygulanacak iptal koşulları talep aşamasında misafirle net şekilde paylaşılır.",
    },
  });

  await prisma.depositPolicy.upsert({
    where: { slug: "standart-depozito" },
    update: {
      name: "Standart Depozito Politikası",
      summary: "Depozito tutarı giriş öncesi net şekilde gösterilir.",
      details:
        "Depozito iadesi ve hasar kontrol prosedürü her ilanda açık şekilde listelenir.",
    },
    create: {
      id: "policy-standard-deposit",
      slug: "standart-depozito",
      name: "Standart Depozito Politikası",
      summary: "Depozito tutarı giriş öncesi net şekilde gösterilir.",
      details:
        "Depozito iadesi ve hasar kontrol prosedürü her ilanda açık şekilde listelenir.",
    },
  });
}

async function invalidatePublicCaches() {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    return 0;
  }

  const redis = createClient({
    url: redisUrl,
  });

  await redis.connect();

  let deleted = 0;

  try {
    const directCacheKeys = [
      "villawe:public:villas:published",
      "villawe:public:homepage",
      "villawe:public:regions",
      "villawe:public:districts",
      "villawe:public:concepts",
      "villawe:seo:sitemap",
      ...demoVillas.map((villa) => `villawe:public:villa:${villa.slug}`),
    ];

    if (directCacheKeys.length) {
      deleted += await redis.del(directCacheKeys);
    }

    for (const prefix of PUBLIC_CACHE_PREFIXES) {
      const keys: string[] = [];

      for await (const key of redis.scanIterator({
        MATCH: `${prefix}*`,
        COUNT: 100,
      })) {
        keys.push(String(key));
      }

      if (!keys.length) {
        continue;
      }

      deleted += await redis.unlink(keys);
    }
  } finally {
    await redis.quit();
  }

  return deleted;
}

async function main() {
  const adminUser = await upsertAdminUser();
  await ensurePolicies();

  const counts = {
    regionsCreated: 0,
    districtsCreated: 0,
    conceptsCreated: 0,
    amenitiesCreated: 0,
    ownersCreated: 0,
    villasCreated: 0,
    villasUpdated: 0,
    mediaCreated: 0,
    mediaUpdated: 0,
  };

  const regionIds = new Map<string, string>();
  const districtIds = new Map<string, string>();
  const conceptIds = new Map<string, string>();
  const amenityIds = new Map<string, string>();

  for (const villa of demoVillas) {
    const existing = await prisma.region.findUnique({
      where: { slug: villa.region.slug },
      select: { id: true },
    });

    if (!existing) counts.regionsCreated += 1;

    const region = await prisma.region.upsert({
      where: { slug: villa.region.slug },
      update: {
        name: villa.region.name,
        shortDescription: villa.region.shortDescription,
        seoTitle: `${villa.region.name} villa kiralama`,
        seoDescription: villa.region.shortDescription,
        isFeatured: true,
      },
      create: {
        id: `demo-region-${villa.region.slug}`,
        name: villa.region.name,
        slug: villa.region.slug,
        shortDescription: villa.region.shortDescription,
        seoTitle: `${villa.region.name} villa kiralama`,
        seoDescription: villa.region.shortDescription,
        isFeatured: true,
      },
    });

    regionIds.set(villa.region.slug, region.id);

    const existingDistrict = await prisma.district.findUnique({
      where: { slug: villa.district.slug },
      select: { id: true },
    });

    if (!existingDistrict) counts.districtsCreated += 1;

    const district = await prisma.district.upsert({
      where: { slug: villa.district.slug },
      update: {
        name: villa.district.name,
        regionId: region.id,
        seoTitle: `${villa.district.name} villa kiralama`,
        seoDescription: `${villa.district.name} bölgesinde doğrulanmış Villawe demo ilanları.`,
        isFeatured: true,
      },
      create: {
        id: `demo-district-${villa.district.slug}`,
        regionId: region.id,
        name: villa.district.name,
        slug: villa.district.slug,
        seoTitle: `${villa.district.name} villa kiralama`,
        seoDescription: `${villa.district.name} bölgesinde doğrulanmış Villawe demo ilanları.`,
        isFeatured: true,
      },
    });

    districtIds.set(villa.district.slug, district.id);
  }

  for (const concept of taxonomy.concepts) {
    const existing = await prisma.concept.findUnique({
      where: { slug: concept.slug },
      select: { id: true },
    });

    if (!existing) counts.conceptsCreated += 1;

    const savedConcept = await prisma.concept.upsert({
      where: { slug: concept.slug },
      update: {
        name: concept.name,
        description: concept.description,
        isFeatured: true,
      },
      create: {
        id: `demo-concept-${concept.slug}`,
        name: concept.name,
        slug: concept.slug,
        description: concept.description,
        isFeatured: true,
      },
    });

    conceptIds.set(concept.slug, savedConcept.id);
  }

  for (const amenity of taxonomy.amenities) {
    const existing = await prisma.amenity.findUnique({
      where: { slug: amenity.slug },
      select: { id: true },
    });

    if (!existing) counts.amenitiesCreated += 1;

    const savedAmenity = await prisma.amenity.upsert({
      where: { slug: amenity.slug },
      update: {
        name: amenity.name,
        category: amenity.category,
        isFeaturedFilter: true,
      },
      create: {
        id: `demo-amenity-${amenity.slug}`,
        name: amenity.name,
        slug: amenity.slug,
        category: amenity.category,
        isFeaturedFilter: true,
      },
    });

    amenityIds.set(amenity.slug, savedAmenity.id);
  }

  for (const villa of demoVillas) {
    const existingOwner = await prisma.owner.findUnique({
      where: { id: villa.owner.id },
      select: { id: true },
    });

    if (!existingOwner) counts.ownersCreated += 1;

    const owner = await prisma.owner.upsert({
      where: { id: villa.owner.id },
      update: {
        type: "AGENCY",
        displayName: villa.owner.displayName,
        email: villa.owner.email,
        phone: villa.owner.phone,
        isActive: true,
        notes: "Demo portföy sahibi — gerçek ticari kayıt değildir.",
      },
      create: {
        id: villa.owner.id,
        type: "AGENCY",
        displayName: villa.owner.displayName,
        email: villa.owner.email,
        phone: villa.owner.phone,
        isActive: true,
        notes: "Demo portföy sahibi — gerçek ticari kayıt değildir.",
      },
    });

    const existingVilla = await prisma.villa.findUnique({
      where: { slug: villa.slug },
      select: { id: true },
    });

    if (existingVilla) {
      counts.villasUpdated += 1;
    } else {
      counts.villasCreated += 1;
    }

    const savedVilla = await prisma.villa.upsert({
      where: { slug: villa.slug },
      update: {
        title: villa.title,
        shortDescription: villa.shortDescription,
        description: `${demoDescriptionNote}\n\n${villa.description}`,
        status: "PUBLISHED",
        ownerId: owner.id,
        regionId: regionIds.get(villa.region.slug)!,
        districtId: districtIds.get(villa.district.slug)!,
        addressPrivate: `${villa.addressPublic} — yalnızca operasyon amaçlı demo adres`,
        addressPublic: villa.addressPublic,
        latitudeApprox: villa.lat,
        longitudeApprox: villa.lng,
        maxGuests: villa.maxGuests,
        bedroomCount: villa.bedroomCount,
        bathroomCount: villa.bathroomCount,
        bedCount: villa.bedCount,
        hasPrivatePool: villa.features.hasPrivatePool,
        hasHeatedPool: villa.features.hasHeatedPool,
        hasJacuzzi: villa.features.hasJacuzzi,
        isShelteredPool: villa.features.isShelteredPool,
        isConservativeFriendly: villa.features.isConservativeFriendly,
        isPetFriendly: villa.features.isPetFriendly,
        isChildFriendly: villa.features.isChildFriendly,
        isFamilyFriendly: villa.features.isFamilyFriendly,
        isLuxuryVilla: villa.features.isLuxuryVilla,
        isEconomicalVilla: villa.features.isEconomicalVilla,
        hasSeaView: villa.features.hasSeaView,
        hasNatureView: villa.features.hasNatureView,
        nearBeach: villa.features.nearBeach,
        nearCenter: villa.features.nearCenter,
        hasBarbecue: villa.features.hasBarbecue,
        hasParking: villa.features.hasParking,
        hasAirConditioning: villa.features.hasAirConditioning,
        hasInternet: villa.features.hasInternet,
        minNights: villa.minNights,
        checkInTime: "16:00",
        checkOutTime: "10:00",
        basePrice: villa.basePrice,
        cleaningFee: villa.cleaningFee,
        depositAmount: villa.depositAmount,
        serviceFeeType: "FIXED",
        serviceFeeValue: 0,
        extraGuestFee: 0,
        cancellationPolicyId: "policy-standard-cancellation",
        depositPolicyId: "policy-standard-deposit",
        verificationStatus: "VERIFIED",
        summaryFacts: [
          `${villa.maxGuests} misafir kapasitesi`,
          `${villa.bedroomCount} yatak odası`,
          "Demo doğrulama verisi ile yayınlandı",
        ],
        houseRules: villa.houseRules,
        poolDetails: villa.poolDetails,
        nearbyPlaces: villa.nearbyPlaces,
        publishedAt: new Date(),
      },
      create: {
        id: `demo-villa-record-${villa.slug}`,
        slug: villa.slug,
        title: villa.title,
        shortDescription: villa.shortDescription,
        description: `${demoDescriptionNote}\n\n${villa.description}`,
        status: "PUBLISHED",
        ownerId: owner.id,
        regionId: regionIds.get(villa.region.slug)!,
        districtId: districtIds.get(villa.district.slug)!,
        addressPrivate: `${villa.addressPublic} — yalnızca operasyon amaçlı demo adres`,
        addressPublic: villa.addressPublic,
        latitudeApprox: villa.lat,
        longitudeApprox: villa.lng,
        maxGuests: villa.maxGuests,
        bedroomCount: villa.bedroomCount,
        bathroomCount: villa.bathroomCount,
        bedCount: villa.bedCount,
        hasPrivatePool: villa.features.hasPrivatePool,
        hasHeatedPool: villa.features.hasHeatedPool,
        hasJacuzzi: villa.features.hasJacuzzi,
        isShelteredPool: villa.features.isShelteredPool,
        isConservativeFriendly: villa.features.isConservativeFriendly,
        isPetFriendly: villa.features.isPetFriendly,
        isChildFriendly: villa.features.isChildFriendly,
        isFamilyFriendly: villa.features.isFamilyFriendly,
        isLuxuryVilla: villa.features.isLuxuryVilla,
        isEconomicalVilla: villa.features.isEconomicalVilla,
        hasSeaView: villa.features.hasSeaView,
        hasNatureView: villa.features.hasNatureView,
        nearBeach: villa.features.nearBeach,
        nearCenter: villa.features.nearCenter,
        hasBarbecue: villa.features.hasBarbecue,
        hasParking: villa.features.hasParking,
        hasAirConditioning: villa.features.hasAirConditioning,
        hasInternet: villa.features.hasInternet,
        minNights: villa.minNights,
        checkInTime: "16:00",
        checkOutTime: "10:00",
        basePrice: villa.basePrice,
        cleaningFee: villa.cleaningFee,
        depositAmount: villa.depositAmount,
        serviceFeeType: "FIXED",
        serviceFeeValue: 0,
        extraGuestFee: 0,
        cancellationPolicyId: "policy-standard-cancellation",
        depositPolicyId: "policy-standard-deposit",
        verificationStatus: "VERIFIED",
        summaryFacts: [
          `${villa.maxGuests} misafir kapasitesi`,
          `${villa.bedroomCount} yatak odası`,
          "Demo doğrulama verisi ile yayınlandı",
        ],
        houseRules: villa.houseRules,
        poolDetails: villa.poolDetails,
        nearbyPlaces: villa.nearbyPlaces,
        publishedAt: new Date(),
      },
    });

    await prisma.villaLocation.upsert({
      where: { villaId: savedVilla.id },
      update: {
        mapLabel: villa.locationLabel,
        neighborhoodNotes: "Demo lokasyon verisi — gerçek ilan değildir.",
        distanceToBeachKm: villa.features.nearBeach ? 1.2 : null,
        distanceToCenterKm: villa.features.nearCenter ? 1.4 : 4.8,
      },
      create: {
        id: `demo-location-${villa.slug}`,
        villaId: savedVilla.id,
        mapLabel: villa.locationLabel,
        neighborhoodNotes: "Demo lokasyon verisi — gerçek ilan değildir.",
        distanceToBeachKm: villa.features.nearBeach ? 1.2 : null,
        distanceToCenterKm: villa.features.nearCenter ? 1.4 : 4.8,
      },
    });

    await prisma.villaVerification.upsert({
      where: { villaId: savedVilla.id },
      update: {
        identityVerified: true,
        ownershipOrAuthorityVerified: true,
        tourismPermitVerified: true,
        locationVerified: true,
        photosVerified: true,
        phoneVerified: true,
        lastVerifiedAt: new Date(),
        verifiedByAdminId: adminUser.id,
        verificationNotes: "Demo doğrulama verisi — gerçek ilan değildir.",
      },
      create: {
        id: `demo-verification-${villa.slug}`,
        villaId: savedVilla.id,
        identityVerified: true,
        ownershipOrAuthorityVerified: true,
        tourismPermitVerified: true,
        locationVerified: true,
        photosVerified: true,
        phoneVerified: true,
        lastVerifiedAt: new Date(),
        verifiedByAdminId: adminUser.id,
        verificationNotes: "Demo doğrulama verisi — gerçek ilan değildir.",
      },
    });

    await prisma.villaConcept.deleteMany({ where: { villaId: savedVilla.id } });

    for (const conceptSlug of villa.concepts) {
      const conceptId = conceptIds.get(conceptSlug);

      if (!conceptId) continue;

      await prisma.villaConcept.create({
        data: {
          villaId: savedVilla.id,
          conceptId,
        },
      });
    }

    await prisma.villaAmenity.deleteMany({ where: { villaId: savedVilla.id } });

    for (const amenitySlug of villa.amenities) {
      const amenityId = amenityIds.get(amenitySlug);

      if (!amenityId) continue;

      await prisma.villaAmenity.create({
        data: {
          villaId: savedVilla.id,
          amenityId,
        },
      });
    }

    await prisma.villaRoom.deleteMany({ where: { villaId: savedVilla.id } });

    for (const [roomIndex, room] of villa.rooms.entries()) {
      const savedRoom = await prisma.villaRoom.create({
        data: {
          id: room.id,
          villaId: savedVilla.id,
          name: room.name,
          roomType: room.roomType,
          description: room.description || null,
          sortOrder: roomIndex,
        },
      });

      for (const [bedIndex, bed] of room.beds.entries()) {
        await prisma.villaBed.upsert({
          where: { id: `${room.id}-bed-${bedIndex + 1}` },
          update: {
            roomId: savedRoom.id,
            bedType: bed.type,
            quantity: bed.quantity,
            sleeps: bed.sleeps,
          },
          create: {
            id: `${room.id}-bed-${bedIndex + 1}`,
            roomId: savedRoom.id,
            bedType: bed.type,
            quantity: bed.quantity,
            sleeps: bed.sleeps,
          },
        });
      }
    }

    await prisma.seasonPrice.deleteMany({ where: { villaId: savedVilla.id } });

    await prisma.seasonPrice.createMany({
      data: [
        {
          id: `demo-season-low-${villa.slug}`,
          villaId: savedVilla.id,
          name: "Düşük Sezon",
          startDate: new Date("2026-01-01"),
          endDate: new Date("2026-03-31"),
          nightlyPrice: villa.basePrice,
        },
        {
          id: `demo-season-high-${villa.slug}`,
          villaId: savedVilla.id,
          name: "Yüksek Sezon",
          startDate: new Date("2026-06-01"),
          endDate: new Date("2026-09-30"),
          nightlyPrice: villa.basePrice + 1800,
          minNightsOverride: villa.minNights + 1,
        },
      ],
    });

    await prisma.availabilityBlock.deleteMany({
      where: {
        villaId: savedVilla.id,
        reason: { startsWith: "Demo blok" },
      },
    });

    await prisma.availabilityBlock.create({
      data: {
        id: `demo-block-${villa.slug}`,
        villaId: savedVilla.id,
        type: "MAINTENANCE",
        reason: "Demo blok - kısa bakım aralığı",
        startDate: new Date("2026-07-15"),
        endDate: new Date("2026-07-17"),
        createdByAdminId: adminUser.id,
      },
    });

    await prisma.review.deleteMany({ where: { villaId: savedVilla.id } });

    for (const review of villa.reviews) {
      await prisma.review.create({
        data: {
          id: review.id,
          villaId: savedVilla.id,
          authorName: review.authorName,
          rating: review.rating,
          title: review.title,
          body: review.body,
          stayDate: new Date(review.stayDate),
          status: "APPROVED",
          publishedAt: new Date(),
        },
      });
    }

    for (const [index, media] of villa.media.entries()) {
      const fileId = `demo-file-${villa.slug}-${index + 1}`;
      const originalName = media.url.split("/").pop() || `${villa.slug}-${index + 1}.svg`;
      const storageKey = `demo-assets/${villa.slug}/${originalName}`;
      const existingMedia = await prisma.villaMedia.findUnique({
        where: { id: media.id },
        select: { id: true },
      });

      if (existingMedia) {
        counts.mediaUpdated += 1;
      } else {
        counts.mediaCreated += 1;
      }

      await prisma.uploadedFile.upsert({
        where: { id: fileId },
        update: {
          storageKey,
          bucket: "demo-assets",
          url: media.url,
          originalName,
          mimeType: "image/svg+xml",
          sizeBytes: 1024,
          kind: "IMAGE",
          altText: media.alt,
          createdByUserId: adminUser.id,
        },
        create: {
          id: fileId,
          storageKey,
          bucket: "demo-assets",
          url: media.url,
          originalName,
          mimeType: "image/svg+xml",
          sizeBytes: 1024,
          kind: "IMAGE",
          altText: media.alt,
          createdByUserId: adminUser.id,
        },
      });

      await prisma.villaMedia.upsert({
        where: { id: media.id },
        update: {
          villaId: savedVilla.id,
          fileId,
          mediaType: "image",
          altText: media.alt,
          sortOrder: index,
          isCover: media.isCover || false,
        },
        create: {
          id: media.id,
          villaId: savedVilla.id,
          fileId,
          mediaType: "image",
          altText: media.alt,
          sortOrder: index,
          isCover: media.isCover || false,
        },
      });
    }
  }

  const demoVillaCount = await prisma.villa.count({
    where: { slug: { startsWith: "demo-" } },
  });
  const publishedVillaCount = await prisma.villa.count({
    where: { status: "PUBLISHED" },
  });
  const demoMediaCount = await prisma.villaMedia.count({
    where: { villa: { slug: { startsWith: "demo-" } } },
  });
  const regionCount = await prisma.region.count();
  const districtCount = await prisma.district.count();
  const conceptCount = await prisma.concept.count();
  const amenityCount = await prisma.amenity.count();
  const invalidatedCacheKeys = await invalidatePublicCaches();

  console.log(
    JSON.stringify(
      {
        counts,
        totals: {
          demoVillaCount,
          publishedVillaCount,
          demoMediaCount,
          regionCount,
          districtCount,
          conceptCount,
          amenityCount,
        },
        invalidatedCacheKeys,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error("Demo villa seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
