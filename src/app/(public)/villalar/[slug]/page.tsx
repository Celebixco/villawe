import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PriceEstimator } from "@/components/public/price-estimator";
import { SafeRentalAlert } from "@/components/public/safe-rental-alert";
import { VillaSelectionControls } from "@/components/public/villa-selection-controls";
import { TrustBadges } from "@/components/public/trust-badges";
import { VillaCard } from "@/components/public/villa-card";
import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createInquiryAction } from "@/features/inquiries/actions";
import {
  buildAbsoluteUrl,
  buildBreadcrumbJsonLd,
  buildMetadata,
} from "@/features/seo/metadata";
import { getSimilarVillas, getVillaBySlug } from "@/features/villas/queries";
import { getDatabaseHealth } from "@/lib/db/prisma";

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

  return (
    <div className="container-shell space-y-10 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbJsonLd, villaJsonLd]),
        }}
      />

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="section-kicker">
              {villa.region.name} / {villa.district.name}
            </p>
            <div className="space-y-3">
              <h1 className="text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
                {villa.title}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                {villa.summary}
              </p>
              <VillaSelectionControls villaId={villa.id} />
            </div>
            <TrustBadges verification={villa.verification} />
          </div>

          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
              <Image
                src={villa.coverImage.url}
                alt={villa.coverImage.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </div>
            <div className="grid gap-4">
              {villa.media.slice(1, 3).map((media) => (
                <div key={media.id} className="relative aspect-square overflow-hidden rounded-[2rem]">
                  <Image
                    src={media.url}
                    alt={media.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 20vw"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Kapasite", `${villa.maxGuests} misafir`],
              ["Yatak Odası", `${villa.bedroomCount}`],
              ["Banyo", `${villa.bathroomCount}`],
              ["Yatak", `${villa.bedCount}`],
            ].map(([label, value]) => (
              <Card key={label} className="villawe-panel">
                <CardContent className="space-y-2 p-5">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-semibold tracking-tight">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="villawe-panel">
            <CardContent className="space-y-5 p-7">
              <h2 className="text-3xl font-semibold tracking-tight">Villa Hakkında</h2>
              <p className="text-sm leading-7 text-muted-foreground">{villa.description}</p>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold tracking-tight">Oda ve yatak detayları</h3>
                  <div className="space-y-3">
                    {villa.rooms.map((room) => (
                      <div key={room.id} className="villawe-soft-block">
                        <p className="font-semibold">{room.name}</p>
                        <p className="text-sm text-muted-foreground">{room.roomType}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {room.beds.map((bed) => `${bed.quantity}x ${bed.type}`).join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold tracking-tight">Havuz ve kurallar</h3>
                  <div className="space-y-2 text-sm leading-7 text-muted-foreground">
                    {villa.poolDetails.map((item) => (
                      <p key={item}>• {item}</p>
                    ))}
                    <p className="pt-2 font-semibold text-foreground">
                      Giriş: {villa.checkInTime} · Çıkış: {villa.checkOutTime}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <PriceEstimator villa={villa} />

          <Card className="villawe-hero-surface">
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <p className="section-kicker">Rezervasyon Talebi</p>
                <h2 className="text-3xl font-semibold tracking-tight">Rezervasyon Talebi Gönder</h2>
              </div>
              <form action={createInquiryAction} className="space-y-4">
                <input type="hidden" name="villaSlug" value={villa.slug} />
                <Input name="fullName" placeholder="Ad Soyad" required />
                <Input name="email" type="email" placeholder="E-posta" required />
                <Input name="phone" placeholder="Telefon" required />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input name="startDate" type="date" />
                  <Input name="endDate" type="date" />
                  <Input name="guestCount" type="number" min={1} max={16} defaultValue={2} />
                </div>
                <Textarea
                  name="message"
                  placeholder="Sorunuz, uçuş saatiniz veya özel notunuz varsa paylaşın."
                  rows={5}
                />
                <label className="villawe-check-tile-leading">
                  <input type="checkbox" name="depositWarningAcknowledged" value="1" required />
                  <span>Depozito, kapora ve toplam ücret kalemlerini şeffaf biçimde gördüm.</span>
                </label>
                <label className="villawe-check-tile-leading">
                  <input
                    type="checkbox"
                    name="offPlatformPaymentWarningAcknowledged"
                    value="1"
                    required
                  />
                  <span>Platform dışı ödeme yapmamam gerektiğini biliyorum.</span>
                </label>
                <Button type="submit" variant="accent" className="w-full rounded-full py-6 text-base">
                  Müsaitlik Sor
                </Button>
              </form>
            </CardContent>
          </Card>

          <SafeRentalAlert />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="villawe-panel lg:col-span-2">
          <CardContent className="space-y-5 p-7">
            <h2 className="text-3xl font-semibold tracking-tight">İptal ve depozito politikası</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              {villa.pricing.cancellationPolicy}
            </p>
            <p className="text-sm leading-7 text-muted-foreground">
              {villa.pricing.depositPolicy}
            </p>
          </CardContent>
        </Card>

        <Card className="villawe-panel">
          <CardContent className="space-y-4 p-7">
            <h2 className="text-3xl font-semibold tracking-tight">Yakındaki yerler</h2>
            {villa.nearbyPlaces.map((place) => (
              <div key={place.name} className="flex items-center justify-between border-b border-border/70 py-2">
                <span className="text-sm">{place.name}</span>
                <span className="text-sm text-muted-foreground">{place.distanceLabel}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="villawe-panel">
        <CardContent className="space-y-5 p-7">
          <h2 className="text-3xl font-semibold tracking-tight">Müsaitlik ve blok takvimi özeti</h2>
          {villa.availabilityBlocks.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {villa.availabilityBlocks.map((block) => (
                <div key={`${block.startDate}-${block.endDate}`} className="villawe-soft-block">
                  <p className="font-semibold">{block.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {block.startDate} - {block.endDate}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-7 text-muted-foreground">
              Bu villa için aktif blok görünmüyor. Kesin onay için rezervasyon talebi gönderin.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-4xl font-semibold tracking-tight">Benzer villalar</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {similarVillas.map((similarVilla) => (
            <VillaCard key={similarVilla.id} villa={similarVilla} />
          ))}
        </div>
      </div>
    </div>
  );
}
