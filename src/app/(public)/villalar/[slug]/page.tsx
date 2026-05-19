import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bath,
  BedDouble,
  Compass,
  House,
  MapPin,
  Snowflake,
  Users,
  Waves,
  Wifi,
} from "lucide-react";

import { AmenityGrid } from "@/components/public/amenity-grid";
import { AvailabilityCalendarPreview } from "@/components/public/availability-calendar-preview";
import { ReviewSummaryCard } from "@/components/public/review-summary-card";
import { SafeRentalAlert } from "@/components/public/safe-rental-alert";
import { SimilarVillas } from "@/components/public/similar-villas";
import { TrustBadges } from "@/components/public/trust-badges";
import { VillaGallery } from "@/components/public/villa-gallery";
import { VillaPriceInquiryCard } from "@/components/public/villa-price-inquiry-card";
import { VillaSelectionControls } from "@/components/public/villa-selection-controls";
import { VillaVerificationPanel } from "@/components/public/villa-verification-panel";
import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createInquiryAction } from "@/features/inquiries/actions";
import {
  buildAbsoluteUrl,
  buildBreadcrumbJsonLd,
  buildMetadata,
} from "@/features/seo/metadata";
import { getSimilarVillas, getVillaBySlug } from "@/features/villas/queries";
import { getDatabaseHealth } from "@/lib/db/prisma";
import { parseDemoVillaTitle } from "@/lib/demo-villa";

export const dynamic = "force-dynamic";

type VillaDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: VillaDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [databaseHealth, villa] = await Promise.all([
    getDatabaseHealth(),
    getVillaBySlug(slug),
  ]);

  if (databaseHealth.status === "unavailable" || databaseHealth.status === "error") {
    return buildMetadata({
      title: "Villa kataloğu şu anda kullanılamıyor | Villawe",
      description: "Katalog yapılandırması tamamlanana kadar bu sayfa geçici olarak kapalı.",
      path: `/villalar/${slug}`,
      noIndex: true,
    });
  }

  if (!villa) {
    return buildMetadata({
      title: "Villa bulunamadı | Villawe",
      description: "Aradığınız villa bulunamadı.",
      path: `/villalar/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${villa.title} | Villawe`,
    description: villa.shortDescription,
    path: `/villalar/${villa.slug}`,
    image: villa.coverImage.url,
  });
}

export default async function VillaDetailPage({
  params,
}: VillaDetailPageProps) {
  const { slug } = await params;
  const [databaseHealth, villa] = await Promise.all([
    getDatabaseHealth(),
    getVillaBySlug(slug),
  ]);

  if (databaseHealth.status === "unavailable" || databaseHealth.status === "error") {
    return (
      <div className="container-shell space-y-8 py-12">
        <DataSourceNotice
          tone="error"
          title="Villa sayfası geçici olarak kullanılamıyor"
          body="Production ortamında demo ilan gösterilmez. Veritabanı bağlantısı tekrar sağlandığında bu villa sayfası otomatik olarak açılacaktır."
        />
        <Card className="villawe-panel">
          <CardContent className="space-y-4 p-8">
            <h1 className="text-4xl font-semibold tracking-tight">Katalog bakımı devam ediyor</h1>
            <p className="text-sm leading-7 text-muted-foreground">
              Güncel stok ve doğrulama kayıtları yüklenemediği için bu sayfada örnek villa
              gösterimi yapılmıyor.
            </p>
            <Link href="/villa-kiralama" className="text-sm font-semibold text-primary">
              Listeleme sayfasına dön
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!villa) {
    notFound();
  }

  const similarVillas = await getSimilarVillas(slug);
  const titleMeta = parseDemoVillaTitle(villa.title);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Villawe", path: "/" },
    { name: "Villa Kiralama", path: "/villa-kiralama" },
    { name: villa.region.name, path: `/${villa.region.slug}-villa-kiralama` },
    { name: villa.title, path: `/villalar/${villa.slug}` },
  ]);

  const villaJsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: villa.title,
    description: villa.shortDescription,
    image: villa.media.map((media) => buildAbsoluteUrl(media.url).toString()),
    url: buildAbsoluteUrl(`/villalar/${villa.slug}`).toString(),
    address: {
      "@type": "PostalAddress",
      addressLocality: villa.district.name,
      addressRegion: villa.region.name,
      addressCountry: "TR",
    },
    amenityFeature: villa.amenities.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity.name,
      value: true,
    })),
    maximumAttendeeCapacity: villa.maxGuests,
    checkinTime: villa.checkInTime,
    checkoutTime: villa.checkOutTime,
    offers: {
      "@type": "Offer",
      priceCurrency: "TRY",
      price: villa.pricing.basePrice,
      availability: "https://schema.org/InStock",
      url: buildAbsoluteUrl(`/villalar/${villa.slug}`).toString(),
    },
  };

  const keyFeatures = [
    {
      label: "Misafir",
      value: `${villa.maxGuests} kişi`,
      icon: Users,
    },
    {
      label: "Yatak Odası",
      value: `${villa.bedroomCount} oda`,
      icon: BedDouble,
    },
    {
      label: "Banyo",
      value: `${villa.bathroomCount} banyo`,
      icon: Bath,
    },
    {
      label: "Havuz",
      value: villa.features.hasPrivatePool ? "Özel havuz" : "Ortak havuz",
      icon: Waves,
    },
    {
      label: "Jakuzi",
      value: villa.features.hasJacuzzi ? "Var" : "Yok",
      icon: House,
    },
    {
      label: "Manzara",
      value: villa.features.hasSeaView
        ? "Deniz manzarası"
        : villa.features.hasNatureView
          ? "Doğa manzarası"
          : "Standart görünüm",
      icon: Compass,
    },
    {
      label: "Klima",
      value: villa.features.hasAirConditioning ? "Var" : "Yok",
      icon: Snowflake,
    },
    {
      label: "İnternet",
      value: villa.features.hasInternet ? "Wi-Fi" : "Belirtilmedi",
      icon: Wifi,
    },
  ];

  return (
    <div className="container-shell space-y-10 py-10 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbJsonLd, villaJsonLd]),
        }}
      />

      <div className="space-y-4">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="transition hover:text-primary-dark">
            Villawe
          </Link>
          <span>/</span>
          <Link href="/villa-kiralama" className="transition hover:text-primary-dark">
            Villalar
          </Link>
          <span>/</span>
          <Link
            href={`/${villa.region.slug}-villa-kiralama`}
            className="transition hover:text-primary-dark"
          >
            {villa.region.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">{titleMeta.displayTitle}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <p className="section-kicker">
                {villa.region.name} / {villa.district.name}
              </p>
              {titleMeta.isDemo ? (
                <Badge variant="warning">{titleMeta.demoBadgeLabel}</Badge>
              ) : null}
              {villa.verification.identityVerified &&
              villa.verification.ownershipOrAuthorityVerified &&
              villa.verification.tourismPermitVerified ? (
                <Badge variant="success">Doğrulanmış Villa</Badge>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl xl:text-6xl">
                    {titleMeta.displayTitle}
                  </h1>
                  <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4 text-secondary" />
                    {villa.locationLabel}
                  </p>
                </div>
                <VillaSelectionControls villaId={villa.id} />
              </div>

              <p className="max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                {villa.summary}
              </p>
            </div>

            <TrustBadges verification={villa.verification} />
          </div>

          <Card className="villawe-soft-panel">
            <CardContent className="space-y-4 p-6">
              <p className="section-kicker">Bilgi Özeti</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-border/70 bg-card px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Başlangıç
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-primary">
                    ₺{villa.pricing.basePrice.toLocaleString("tr-TR")}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-border/70 bg-card px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Minimum Konaklama
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                    {villa.pricing.minNights} gece
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-border/70 bg-card px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Temizlik
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    ₺{villa.pricing.cleaningFee.toLocaleString("tr-TR")}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-border/70 bg-card px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Depozito
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    ₺{villa.pricing.depositAmount.toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-7 text-muted-foreground">
                Temizlik, hizmet bedeli ve depozito toplam tahmin içinde ayrıca görünür.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <VillaGallery title={villa.title} items={villa.media} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-8">
          <div className="overflow-x-auto rounded-full border border-border/70 bg-card/90 p-2 shadow-[0_18px_48px_-34px_rgba(18,110,130,0.16)]">
            <div className="flex min-w-max items-center gap-2">
              {[
                ["genel-bakis", "Genel Bakış"],
                ["ozellikler", "Özellikler"],
                ["oda-yatak", "Oda & Yatak Bilgileri"],
                ["havuz-bahce", "Havuz & Bahçe"],
                ["konum", "Konum"],
                ["yorumlar", "Yorumlar"],
                ["kurallar", "Kurallar"],
                ["iptal-depozito", "İptal & Depozito"],
              ].map(([id, label]) => (
                <Link
                  key={id}
                  href={`#${id}`}
                  className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-primary-dark"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <section id="genel-bakis" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {keyFeatures.map((feature) => {
                const Icon = feature.icon;

                return (
                  <Card key={feature.label} className="villawe-panel">
                    <CardContent className="space-y-3 p-5">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-primary">
                        <Icon className="size-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{feature.label}</p>
                        <p className="text-lg font-semibold tracking-tight">{feature.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="villawe-panel">
              <CardContent className="space-y-4 p-7">
                <p className="section-kicker">Genel Bakış</p>
                <h2 className="text-3xl font-semibold tracking-tight">Villa hakkında</h2>
                <p className="text-sm leading-8 text-muted-foreground sm:text-base">
                  {villa.description}
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="ozellikler" className="space-y-6">
            <Card className="villawe-panel">
              <CardContent className="space-y-5 p-7">
                <div className="space-y-2">
                  <p className="section-kicker">Özellikler</p>
                  <h2 className="text-3xl font-semibold tracking-tight">Konfor ve yaşam alanı detayları</h2>
                </div>
                <AmenityGrid amenities={villa.amenities} />
              </CardContent>
            </Card>

            <VillaVerificationPanel verification={villa.verification} />
          </section>

          <section id="oda-yatak" className="space-y-6">
            <Card className="villawe-panel">
              <CardContent className="space-y-5 p-7">
                <div className="space-y-2">
                  <p className="section-kicker">Oda & Yatak Bilgileri</p>
                  <h2 className="text-3xl font-semibold tracking-tight">Konaklama düzeni</h2>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {villa.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="rounded-[1.6rem] border border-border/70 bg-muted/72 px-5 py-5"
                    >
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold tracking-tight">{room.name}</h3>
                        <p className="text-sm text-muted-foreground">{room.roomType}</p>
                        {room.description ? (
                          <p className="text-sm leading-7 text-muted-foreground">{room.description}</p>
                        ) : null}
                        <div className="pt-1 text-sm leading-7 text-foreground">
                          {room.beds.length
                            ? room.beds
                                .map((bed) => `${bed.quantity} x ${bed.type} (${bed.sleeps} kişi)`)
                                .join(", ")
                            : "Yatak bilgisi yakında eklenecek."}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="havuz-bahce" className="space-y-6">
            <Card className="villawe-panel">
              <CardContent className="space-y-5 p-7">
                <div className="space-y-2">
                  <p className="section-kicker">Havuz & Bahçe</p>
                  <h2 className="text-3xl font-semibold tracking-tight">Açık alan kullanımı</h2>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {villa.poolDetails.length ? (
                    villa.poolDetails.map((detail) => (
                      <div
                        key={detail}
                        className="rounded-[1.5rem] border border-border/70 bg-muted/72 px-4 py-4 text-sm leading-7 text-muted-foreground"
                      >
                        {detail}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-border/70 bg-muted/72 px-4 py-4 text-sm leading-7 text-muted-foreground lg:col-span-2">
                      Havuz ve bahçe detayları talep özetinde ayrıca paylaşılacaktır.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="villawe-panel">
              <CardContent className="space-y-5 p-7">
                <div className="space-y-2">
                  <p className="section-kicker">Müsaitlik</p>
                  <h2 className="text-3xl font-semibold tracking-tight">Takvim ve blok özeti</h2>
                </div>
                <AvailabilityCalendarPreview blocks={villa.availabilityBlocks} />
              </CardContent>
            </Card>
          </section>

          <section id="konum" className="space-y-6">
            <Card className="villawe-panel">
              <CardContent className="space-y-5 p-7">
                <div className="space-y-2">
                  <p className="section-kicker">Konum</p>
                  <h2 className="text-3xl font-semibold tracking-tight">Yakın çevre ve genel lokasyon</h2>
                </div>
                <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                  <div className="space-y-4">
                    <div className="rounded-[1.8rem] border border-border/70 bg-linear-to-br from-primary-dark via-primary to-secondary p-6 text-primary-foreground shadow-[0_24px_60px_-34px_rgba(11,77,91,0.5)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/72">
                        Yaklaşık Konum
                      </p>
                      <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                        {villa.locationLabel}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-primary-foreground/82">
                        {villa.addressPublic}
                      </p>
                      <p className="mt-4 text-sm leading-7 text-primary-foreground/82">
                        Harita konumu güvenlik amacıyla yaklaşık gösterilir; kesin yönlendirme
                        talep onayı sonrasında paylaşılır.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.8rem] border border-border/70 bg-muted/72 px-5 py-5">
                    <h3 className="text-xl font-semibold tracking-tight">Yakındaki Yerler</h3>
                    <div className="mt-4 space-y-3">
                      {villa.nearbyPlaces.length ? (
                        villa.nearbyPlaces.map((place) => (
                          <div
                            key={place.name}
                            className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 text-sm"
                          >
                            <div>
                              <p className="font-medium text-foreground">{place.name}</p>
                              <p className="text-muted-foreground">{place.category}</p>
                            </div>
                            <span className="font-medium text-primary">{place.distanceLabel}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm leading-7 text-muted-foreground">
                          Yakındaki yerler bilgisi yakında eklenecek.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="yorumlar" className="space-y-6">
            <ReviewSummaryCard reviews={villa.reviews} />
          </section>

          <section id="kurallar" className="space-y-6">
            <Card className="villawe-panel">
              <CardContent className="space-y-5 p-7">
                <div className="space-y-2">
                  <p className="section-kicker">Kurallar</p>
                  <h2 className="text-3xl font-semibold tracking-tight">Giriş, çıkış ve ev kuralları</h2>
                </div>
                <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-[1.6rem] border border-border/70 bg-muted/72 px-5 py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      Check-in / Check-out
                    </p>
                    <p className="mt-3 text-lg font-semibold tracking-tight">
                      Giriş {villa.checkInTime}
                    </p>
                    <p className="text-lg font-semibold tracking-tight">Çıkış {villa.checkOutTime}</p>
                  </div>
                  <div className="grid gap-3">
                    {villa.houseRules.length ? (
                      villa.houseRules.map((rule) => (
                        <div
                          key={rule}
                          className="rounded-[1.4rem] border border-border/70 bg-card px-4 py-4 text-sm leading-7 text-muted-foreground"
                        >
                          {rule}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[1.4rem] border border-border/70 bg-card px-4 py-4 text-sm leading-7 text-muted-foreground">
                        Ev kuralları, talep özeti onayıyla birlikte net biçimde paylaşılır.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="iptal-depozito" className="space-y-6">
            <Card className="villawe-panel">
              <CardContent className="space-y-5 p-7">
                <div className="space-y-2">
                  <p className="section-kicker">İptal & Depozito</p>
                  <h2 className="text-3xl font-semibold tracking-tight">Şeffaf politika özeti</h2>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-border/70 bg-muted/72 px-5 py-5">
                    <h3 className="text-xl font-semibold tracking-tight">İptal politikası</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {villa.pricing.cancellationPolicy}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-border/70 bg-muted/72 px-5 py-5">
                    <h3 className="text-xl font-semibold tracking-tight">Depozito politikası</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {villa.pricing.depositPolicy}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <SafeRentalAlert />

          <SimilarVillas villas={similarVillas} />
        </div>

        <div className="space-y-6">
          <VillaPriceInquiryCard villa={villa} action={createInquiryAction} />

          <Card className="villawe-soft-panel">
            <CardContent className="space-y-4 p-6">
              <p className="section-kicker">Yetkili İletişim</p>
              <h2 className="text-2xl font-semibold tracking-tight">Villa yetkili özeti</h2>
              <div className="rounded-[1.5rem] border border-border/70 bg-card px-4 py-4">
                <p className="font-semibold text-foreground">{villa.ownerName}</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Talep sonrası müsaitlik ve fiyat teyidi Villawe iş akışı içinde paylaşılır.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
