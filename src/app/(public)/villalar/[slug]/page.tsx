import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";

import { AmenityGrid } from "@/components/public/amenity-grid";
import { AvailabilityCalendarPreview } from "@/components/public/availability-calendar-preview";
import { ReviewSummaryCard } from "@/components/public/review-summary-card";
import { SafeRentalAlert } from "@/components/public/safe-rental-alert";
import { SimilarVillas } from "@/components/public/similar-villas";
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
import { getPublicVillaCopy } from "@/lib/demo-villa";

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

  const publicVilla = getPublicVillaCopy(villa);

  return buildMetadata({
    title: `${villa.title} | Villawe`,
    description: publicVilla.metaDescription,
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
          body="Bu villa sayfasına şu anda erişilemiyor. Lütfen biraz sonra tekrar deneyin."
        />
        <Card className="villawe-panel">
          <CardContent className="space-y-4 p-8">
            <h1 className="text-4xl font-semibold tracking-tight">Katalog bakımı devam ediyor</h1>
            <p className="text-sm leading-7 text-muted-foreground">
              Villa bilgileri yeniden yüklendiğinde bu sayfa otomatik olarak açılacaktır.
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
  const titleMeta = getPublicVillaCopy(villa);

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
    description: titleMeta.metaDescription,
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

  const heroFacts = [
    {
      label: "Gecelik",
      value: `₺${villa.pricing.basePrice.toLocaleString("tr-TR")} gecelikten başlayan`,
    },
    {
      label: "Minimum",
      value: `${villa.pricing.minNights} gece`,
    },
    {
      label: "Kapasite",
      value: `${villa.maxGuests} misafir`,
    },
    {
      label: "Depozito",
      value: `₺${villa.pricing.depositAmount.toLocaleString("tr-TR")}`,
    },
  ];

  const roomSummaries = villa.rooms.map((room) => ({
    id: room.id,
    name: room.name,
    details: room.beds.length
      ? room.beds.map((bed) => `${bed.quantity} x ${bed.type} (${bed.sleeps} kişi)`).join(" · ")
      : "Yatak bilgisi talep öncesinde paylaşılır.",
    note: room.description || room.roomType,
  }));

  const outdoorHighlights = [
    villa.features.hasPrivatePool ? "Özel havuz" : "Ortak havuz",
    villa.features.hasHeatedPool ? "Isıtmalı havuz" : null,
    villa.features.hasJacuzzi ? "Jakuzi" : null,
    villa.features.hasSeaView
      ? "Deniz manzarası"
      : villa.features.hasNatureView
        ? "Doğa manzarası"
        : null,
    villa.features.nearBeach ? "Sahile yakın" : null,
    ...villa.poolDetails,
  ].filter((item): item is string => Boolean(item));

  const sectionLinks = [
    ["genel-bakis", "Genel Bakış"],
    ["olanaklar", "Olanaklar"],
    ["konum", "Konum"],
    ["kurallar", "Kurallar"],
    ["yorumlar", "Yorumlar"],
  ] as const;

  const priceCardVilla = {
    slug: villa.slug,
    maxGuests: villa.maxGuests,
    pricing: villa.pricing,
  };

  return (
    <div className="container-shell space-y-10 py-10 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbJsonLd, villaJsonLd]),
        }}
      />

      <div className="space-y-6">
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

        <div className="space-y-6">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                {titleMeta.isDemo ? (
                  <Badge variant="warning">{titleMeta.demoBadgeLabel}</Badge>
                ) : null}
                {villa.verification.identityVerified &&
                villa.verification.ownershipOrAuthorityVerified &&
                villa.verification.tourismPermitVerified ? (
                  <Badge variant="success">Doğrulanmış</Badge>
                ) : null}
                {titleMeta.demoInlineNote ? (
                  <p className="text-xs text-muted-foreground">{titleMeta.demoInlineNote}</p>
                ) : null}
              </div>
              <VillaSelectionControls villaId={villa.id} compact />
            </div>

            <div className="space-y-3">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl xl:text-6xl">
                {titleMeta.displayTitle}
              </h1>
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 text-secondary" />
                {villa.locationLabel}
              </p>
              <p className="max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                {titleMeta.shortDescription}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {heroFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-[1.45rem] border border-border/70 bg-card px-4 py-4 shadow-[0_14px_34px_-28px_rgba(18,110,130,0.18)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {fact.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
                    {fact.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <VillaGallery title={villa.title} items={villa.media} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-8">
          <div className="overflow-x-auto rounded-full border border-border/70 bg-card/90 p-2 shadow-[0_18px_48px_-34px_rgba(18,110,130,0.16)]">
            <div className="flex min-w-max items-center gap-2">
              {sectionLinks.map(([id, label]) => (
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
            <Card className="villawe-panel">
              <CardContent className="space-y-6 p-7">
                <div className="space-y-2">
                  <p className="section-kicker">Genel Bakış</p>
                  <h2 className="text-3xl font-semibold tracking-tight">Villa hakkında</h2>
                </div>
                <p className="max-w-4xl text-sm leading-8 text-muted-foreground sm:text-base">
                  {titleMeta.description}
                </p>

                <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-[1.7rem] border border-border/70 bg-muted/72 px-5 py-5">
                    <h3 className="text-xl font-semibold tracking-tight">Konaklama düzeni</h3>
                    <div className="mt-4 grid gap-3">
                      {roomSummaries.map((room) => (
                        <div
                          key={room.id}
                          className="rounded-[1.35rem] border border-border/70 bg-card px-4 py-4"
                        >
                          <p className="font-semibold text-foreground">{room.name}</p>
                          <p className="mt-2 text-sm leading-7 text-muted-foreground">{room.details}</p>
                          <p className="mt-2 text-xs text-muted-foreground">{room.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.7rem] border border-border/70 bg-muted/72 px-5 py-5">
                    <h3 className="text-xl font-semibold tracking-tight">Dış alan</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {outdoorHighlights.length ? (
                        outdoorHighlights.map((detail) => (
                          <Badge key={detail} variant="outline" className="bg-card text-primary-dark">
                            {detail}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm leading-7 text-muted-foreground">
                          Dış alan detayları talep öncesinde paylaşılır.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="villawe-panel">
              <CardContent className="space-y-4 p-7">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div className="space-y-2">
                    <p className="section-kicker">Takvim</p>
                    <h3 className="text-2xl font-semibold tracking-tight">Müsaitlik</h3>
                  </div>
                  <p className="max-w-md text-sm leading-7 text-muted-foreground">
                    Takvim güncellemeleri talep öncesinde teyit edilir.
                  </p>
                </div>
                <AvailabilityCalendarPreview blocks={villa.availabilityBlocks} />
              </CardContent>
            </Card>
          </section>

          <section id="olanaklar" className="space-y-6">
            <Card className="villawe-panel">
              <CardContent className="space-y-5 p-7">
                <div className="space-y-2">
                  <p className="section-kicker">Olanaklar</p>
                  <h2 className="text-3xl font-semibold tracking-tight">Konfor detayları</h2>
                </div>
                <AmenityGrid amenities={villa.amenities} />
              </CardContent>
            </Card>
          </section>

          <section id="konum" className="space-y-6">
            <Card className="villawe-panel">
              <CardContent className="space-y-5 p-7">
                <div className="space-y-2">
                  <p className="section-kicker">Konum</p>
                  <h2 className="text-3xl font-semibold tracking-tight">Yakın çevre</h2>
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
                        Konum güvenlik nedeniyle yaklaşık gösterilir. Kesin yönlendirme talep onayı sonrası paylaşılır.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.8rem] border border-border/70 bg-muted/72 px-5 py-5">
                    <h3 className="text-xl font-semibold tracking-tight">Yakın noktalar</h3>
                    <div className="mt-4 grid gap-3">
                      {villa.nearbyPlaces.length ? (
                        villa.nearbyPlaces.map((place) => (
                          <div
                            key={place.name}
                            className="rounded-[1.35rem] border border-border/70 bg-card px-4 py-4 text-sm"
                          >
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">{place.name}</p>
                              <p className="text-muted-foreground">{place.category}</p>
                            </div>
                            <span className="mt-3 inline-flex text-sm font-semibold text-primary">
                              {place.distanceLabel}
                            </span>
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
                  <h2 className="text-3xl font-semibold tracking-tight">Konaklama koşulları</h2>
                </div>
                <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-[1.6rem] border border-border/70 bg-muted/72 px-5 py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      Giriş / Çıkış
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

          <SimilarVillas villas={similarVillas} />
        </div>

        <div className="space-y-6">
          <VillaPriceInquiryCard villa={priceCardVilla} action={createInquiryAction} />

          <SafeRentalAlert />

          <VillaVerificationPanel verification={villa.verification} />

          <Card className="villawe-soft-panel">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-2xl font-semibold tracking-tight">Talep sonrası süreç</h2>
              <div className="rounded-[1.5rem] border border-border/70 bg-card px-4 py-4">
                <p className="font-semibold text-foreground">{villa.ownerName}</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Müsaitlik ve fiyat teyidi talep sonrasında Villawe üzerinden paylaşılır.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
