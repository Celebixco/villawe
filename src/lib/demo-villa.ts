const DEMO_TITLE_PREFIX = "[Demo]";

const demoVillaEditorialContent = {
  "demo-villa-luna": {
    shortDescription:
      "Geniş terası, özel havuzu ve Kalkan manzarasıyla Villa Luna; sakin ve şık bir tatil deneyimi sunar.",
    summary:
      "Kalkan manzarası, özel havuz ve dingin yaşam alanlarıyla öne çıkan seçkin bir villa deneyimi.",
    description:
      "Villa Luna; geniş terası, özel havuzu ve ferah yaşam alanlarıyla Kalkan’da huzurlu bir konaklama sunar. Deniz manzarasını gün boyu izleyebileceğiniz bu villa, sade lüks ve konforu bir araya getirir.",
  },
  "demo-villa-solea": {
    shortDescription:
      "Korunaklı havuzu ve denize açılan terasıyla Villa Solea, sakin ve seçkin bir Faralya kaçamağı sunar.",
    summary:
      "Faralya’nın dingin atmosferinde mahremiyet, manzara ve konforu bir araya getiren özel bir villa.",
    description:
      "Villa Solea; korunaklı havuzu, aydınlık yaşam alanları ve denize bakan terasıyla Faralya’da dingin bir tatil sunar. Çiftler ve küçük aileler için sade, rahat ve özenli bir konaklama deneyimi sağlar.",
  },
  "demo-villa-tera": {
    shortDescription:
      "Doğa manzarası, ısıtmalı havuzu ve geniş yaşam alanlarıyla Villa Tera aile tatilleri için güçlü bir seçenektir.",
    summary:
      "Sapanca’da doğayla iç içe, geniş aileler ve arkadaş grupları için tasarlanmış konforlu bir kaçış noktası.",
    description:
      "Villa Tera; ısıtmalı havuzu, jakuzi alanı ve geniş ortak yaşam bölümleriyle Sapanca’da rahat bir konaklama sunar. Kalabalık aileler ve arkadaş grupları için hem ferah hem de keyifli bir tatil atmosferi oluşturur.",
  },
  "demo-villa-nova": {
    shortDescription:
      "Yalıkavak manzarası, özel havuzu ve rafine detaylarıyla Villa Nova güçlü bir yaz evi hissi taşır.",
    summary:
      "Bodrum’da deniz manzarası, ferah yaşam alanları ve seçkin çizgisiyle öne çıkan lüks villa deneyimi.",
    description:
      "Villa Nova; Yalıkavak’ın güçlü siluetine bakan özel havuzu, geniş terasları ve rafine iç mekânlarıyla dikkat çeker. Daha büyük gruplar için konfor, manzara ve yaz ritmini bir araya getiren etkileyici bir tatil evi sunar.",
  },
  "demo-villa-mira": {
    shortDescription:
      "Doğaya yakın konumu, özel havuzu ve sahile kolay erişimiyle Villa Mira huzurlu bir Ege kaçamağı sunar.",
    summary:
      "Selimiye’nin sakin atmosferinde doğa, konfor ve yalın tatil keyfini buluşturan sıcak bir villa.",
    description:
      "Villa Mira; Selimiye’nin dingin dokusu içinde özel havuzu, sıcak yaşam alanları ve sahile yakın konumuyla keyifli bir konaklama sunar. Daha yalın ama özenli bir tatil isteyen misafirler için huzurlu bir alternatif oluşturur.",
  },
} as const;

type PublicVillaCopyInput = {
  slug: string;
  title: string;
  shortDescription: string;
  summary?: string | null;
  description?: string | null;
};

export function parseDemoVillaTitle(title: string) {
  const normalizedTitle = title.trim();
  const isDemo = normalizedTitle.startsWith(DEMO_TITLE_PREFIX);
  const displayTitle = isDemo
    ? normalizedTitle.replace(/^\[Demo\]\s*/u, "").trim()
    : normalizedTitle;

  return {
    isDemo,
    displayTitle: displayTitle || normalizedTitle,
    demoBadgeLabel: DEMO_TITLE_PREFIX,
    demoInlineNote: isDemo ? "Demo içeriktir." : null,
  };
}

export function getPublicVillaCopy(villa: PublicVillaCopyInput) {
  const titleMeta = parseDemoVillaTitle(villa.title);
  const editorial = titleMeta.isDemo
    ? demoVillaEditorialContent[
        villa.slug as keyof typeof demoVillaEditorialContent
      ]
    : null;

  return {
    ...titleMeta,
    shortDescription: editorial?.shortDescription || villa.shortDescription,
    summary: editorial?.summary || villa.summary || villa.shortDescription,
    description:
      editorial?.description ||
      villa.description ||
      villa.summary ||
      villa.shortDescription,
    metaDescription: editorial?.shortDescription || villa.shortDescription,
  };
}
