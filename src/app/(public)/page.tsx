import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  BadgeDollarSign,
  Headset,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { BlogGuideCard } from "@/components/public/blog-guide-card";
import { EmptyState } from "@/components/public/empty-state";
import { HeroSearchBox } from "@/components/public/hero-search-box";
import { RegionCard } from "@/components/public/region-card";
import { SectionHeading } from "@/components/public/section-heading";
import { TrustFeatureRow } from "@/components/public/trust-feature-row";
import { VillaCard } from "@/components/public/villa-card";
import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/features/seo/metadata";
import { getHomePageData } from "@/features/villas/queries";
import { getDatabaseHealth } from "@/lib/db/prisma";
import { getPublicVillaCopy } from "@/lib/demo-villa";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Villawe | Seçkin villaları güvenle keşfedin",
  description:
    "Doğrulanmış villalar, net fiyat bilgisi ve sade talep akışıyla Villawe ana sayfası.",
  path: "/",
});

const popularRegionOrder = ["bodrum", "fethiye", "kas", "marmaris", "sapanca"] as const;

type PopularRegionSlug = (typeof popularRegionOrder)[number];

const popularRegionContent: Record<
  PopularRegionSlug,
  {
    name: string;
    description: string;
    imageUrl: string;
    imageAlt: string;
  }
> = {
  bodrum: {
    name: "Bodrum",
    description: "Deniz, marina ve seçkin villalar.",
    imageUrl: "/images/regions/bodrum.webp",
    imageAlt: "Bodrum villa kiralama bölgesi",
  },
  fethiye: {
    name: "Fethiye",
    description: "Mavi lagün ve sakin koylar.",
    imageUrl: "/images/regions/fethiye.webp",
    imageAlt: "Fethiye villa kiralama bölgesi",
  },
  kas: {
    name: "Kaş",
    description: "Akdeniz'in en zarif kaçamakları.",
    imageUrl: "/images/regions/kas.webp",
    imageAlt: "Kaş villa kiralama bölgesi",
  },
  marmaris: {
    name: "Marmaris",
    description: "Yeşil dağlar, berrak koylar.",
    imageUrl: "/images/regions/marmaris.webp",
    imageAlt: "Marmaris villa kiralama bölgesi",
  },
  sapanca: {
    name: "Sapanca",
    description: "Göl manzaralı huzurlu kaçışlar.",
    imageUrl: "/images/regions/sapanca.webp",
    imageAlt: "Sapanca villa kiralama bölgesi",
  },
};

export default async function HomePage() {
  const [databaseHealth, data] = await Promise.all([
    getDatabaseHealth(),
    getHomePageData(),
  ]);

  const inventoryUnavailable =
    databaseHealth.status === "unavailable" || databaseHealth.status === "error";
  const spotlightVilla = !inventoryUnavailable
    ? data.verified[0] || data.featured[0] || data.newest[0] || null
    : null;
  const spotlightVerified = Boolean(
    spotlightVilla &&
      spotlightVilla.verification.identityVerified &&
      spotlightVilla.verification.ownershipOrAuthorityVerified &&
      spotlightVilla.verification.tourismPermitVerified,
  );
  const heroImage = spotlightVilla?.coverImage.url || "/images/villawe/villa-luna.svg";
  const heroImageAlt = spotlightVilla?.coverImage.alt || "Villawe öne çıkan villa";
  const spotlightContent = spotlightVilla ? getPublicVillaCopy(spotlightVilla) : null;

  const trustItems = [
    {
      label: "Doğrulanmış Villalar",
      description: "Özenle seçilmiş",
      icon: ShieldCheck,
      accentClassName: "text-success",
    },
    {
      label: "Net Fiyat",
      description: "Sürprizsiz görünüm",
      icon: BadgeDollarSign,
      accentClassName: "text-primary",
    },
    {
      label: "Güvenli Talep",
      description: "Resmi akış",
      icon: Sparkles,
      accentClassName: "text-accent",
    },
    {
      label: "Destek",
      description: "Hızlı geri dönüş",
      icon: Headset,
      accentClassName: "text-secondary",
    },
  ];

  const regionsBySlug = new Map(data.regions.map((region) => [region.slug, region]));
  const curatedRegions = popularRegionOrder.map((slug) => {
    const region = regionsBySlug.get(slug);
    const content = popularRegionContent[slug];

    return {
      id: region?.id || `region-${slug}`,
      slug,
      name: region?.name || content.name,
      description: content.description,
      imageUrl: content.imageUrl,
      imageAlt: content.imageAlt,
    };
  });
  const featuredVillas = (data.featured.length ? data.featured : data.verified.length ? data.verified : data.villas).slice(0, 5);
  const guideFallbackCards: Array<{
    href: Route;
    kicker: string;
    title: string;
    body: string;
  }> = [
    {
      href: "/guvenli-villa-kiralama-rehberi",
      kicker: "Güvenli Kiralama",
      title: "Villa seçerken dikkat etmeniz gerekenler",
      body: "Talep öncesi kontrol etmeniz gereken temel başlıkları bir araya getirdik.",
    },
    {
      href: "/iptal-ve-depozito-politikasi",
      kicker: "Fiyat ve Koşullar",
      title: "Depozito ve iptal bilgilerini net görün",
      body: "Ücret kalemlerini ve iade koşullarını sade biçimde inceleyin.",
    },
    {
      href: "/sss",
      kicker: "SSS",
      title: "Sık sorulan sorulara hızlı bakış",
      body: "Villawe akışına dair en temel soruları kısa yanıtlarla görün.",
    },
  ];

  return (
    <div className="pb-18">
      <section className="container-shell pt-8 pb-10 lg:pt-10">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="space-y-4">
                <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-6xl xl:text-7xl">
                  Seçkin villaları güvenle keşfedin
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                  Doğrulanmış villalar, net fiyat bilgisi ve sade talep akışı Villawe’de.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/villa-kiralama"
                  className={buttonVariants({
                    className: "rounded-full px-6",
                  })}
                >
                  Villaları Keşfet
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href={spotlightVilla ? `/villalar/${spotlightVilla.slug}` : "/villa-kiralama"}
                  className={buttonVariants({
                    variant: "accent",
                    className: "rounded-full px-6",
                  })}
                >
                  Müsaitlik Sor
                </Link>
              </div>
            </div>

            <HeroSearchBox regions={data.regions} />
          </div>

          <div className="space-y-5">
            <div className="villawe-image-shell relative">
              <div className="relative aspect-[4/4.7] overflow-hidden lg:aspect-[4/4.4]">
                <Image
                  src={heroImage}
                  alt={heroImageAlt}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 46vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/88 via-primary-dark/18 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 space-y-4 p-6 text-white sm:p-7">
                  <div className="flex flex-wrap gap-2">
                    {spotlightContent?.isDemo ? (
                      <Badge
                        variant="warning"
                        className="border-white/16 bg-white/10 text-white"
                      >
                        {spotlightContent.demoBadgeLabel}
                      </Badge>
                    ) : null}
                    {spotlightVerified ? (
                      <Badge
                        variant="success"
                        className="border-white/16 bg-white/10 text-white"
                      >
                        Doğrulanmış
                      </Badge>
                    ) : null}
                    <Badge variant="secondary" className="border-white/16 bg-white/10 text-white">
                      Net fiyat
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                      {spotlightContent?.displayTitle || "Akdeniz esintili konaklama"}
                    </h2>
                    <p className="max-w-md text-sm leading-7 text-white/80">
                      {spotlightContent?.shortDescription ||
                        "Özenle seçilmiş villalarla sade ve güvenli bir tatil planı oluşturun."}
                    </p>
                  </div>
                  {spotlightVilla ? (
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-white/88">
                      <span className="rounded-full border border-white/16 bg-white/10 px-3 py-2">
                        Başlangıç ₺{spotlightVilla.pricing.basePrice.toLocaleString("tr-TR")}
                      </span>
                      <span className="rounded-full border border-white/16 bg-white/10 px-3 py-2">
                        {spotlightVilla.maxGuests} kişiye kadar konaklama
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-6">
        <TrustFeatureRow items={trustItems} />
      </section>

      {databaseHealth.status === "demo" ? (
        <section className="container-shell pt-6">
          <DataSourceNotice
            tone="warning"
            title="Örnek katalog görünümü"
            body="Bu görünüm geçici örnek içerikler içerebilir."
          />
        </section>
      ) : null}

      {inventoryUnavailable ? (
        <section className="container-shell pt-6">
          <DataSourceNotice
            tone="error"
            title="Villa kataloğu şu anda kullanılamıyor"
            body="Lütfen biraz sonra tekrar deneyin veya ekibimizle iletişime geçin."
          />
        </section>
      ) : null}

      <section id="bolgeler" className="container-shell py-12">
        <div className="villawe-section-band space-y-8">
          <SectionHeading
            kicker="Popüler Bölgeler"
            title="Popüler bölgeler"
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
            {curatedRegions.map((region) => {
              return (
                <RegionCard
                  key={region.id}
                  href={`/${region.slug}-villa-kiralama`}
                  name={region.name}
                  description={region.description}
                  imageUrl={region.imageUrl}
                  imageAlt={region.imageAlt}
                  className="xl:col-span-2"
                />
              );
            })}
          </div>
        </div>
      </section>

      <section id="konseptler" className="container-shell py-12">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="villawe-panel overflow-hidden">
            <CardContent className="space-y-5 p-7 sm:p-8">
              <div className="space-y-3">
                <p className="section-kicker">Villa Konseptleri</p>
                <h2 className="text-4xl font-semibold tracking-tight text-primary-dark">
                  Tatil tarzınıza göre seçin
                </h2>
              </div>
              <Link
                href="/villa-kiralama"
                className={buttonVariants({
                  variant: "outline",
                  className: "rounded-full",
                })}
              >
                Tüm Konseptleri Keşfet
              </Link>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {data.concepts.slice(0, 6).map((concept) => (
              <Link
                key={concept.slug}
                href={`/${concept.slug}`}
                className="villawe-soft-panel flex min-h-[10rem] flex-col justify-between p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/18 hover:shadow-[0_24px_60px_-36px_rgba(18,110,130,0.24)]"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-card text-primary shadow-[0_18px_38px_-30px_rgba(18,110,130,0.26)]">
                  <Sparkles className="size-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                    {concept.name}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-7 text-muted-foreground">
                    {concept.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell py-12">
        <SectionHeading
          kicker="Öne Çıkan Villalar"
          title="Öne çıkan villalar"
          description="Popüler bölgelerde seçilmiş villa alternatifleri."
          action={
            <Link
              href="/villa-kiralama"
              className={buttonVariants({
                variant: "outline",
                className: "rounded-full",
              })}
            >
              Tüm Villaları Gör
            </Link>
          }
        />

        {!inventoryUnavailable && featuredVillas.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredVillas.map((villa) => (
              <VillaCard key={villa.id} villa={villa} />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              title="Seçki kısa süre içinde güncellenecek"
              description="Yayınlanan villalar arasından öne çıkan alternatifleri burada görebilirsiniz."
            />
          </div>
        )}
      </section>

      <section className="container-shell py-12">
        <Card className="villawe-panel overflow-hidden">
          <CardContent className="space-y-5 p-7 sm:p-8">
            <p className="section-kicker">Villawe Güvenli Talep Sistemi</p>
            <h2 className="text-4xl font-semibold tracking-tight text-primary-dark">
              Net fiyat, güvenli talep
            </h2>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground">
              Ödeme ve depozito detayları talep öncesinde açıkça gösterilir. Platform dışı ödeme taleplerini kabul etmeyin.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/guvenli-villa-kiralama-rehberi"
                className={buttonVariants({
                  variant: "outline",
                  className: "rounded-full",
                })}
              >
                Rehberi Oku
              </Link>
              <Link
                href="/iletisim"
                className={buttonVariants({
                  variant: "accent",
                  className: "rounded-full",
                })}
              >
                Güvenlik Bildirimi Yap
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="container-shell py-12">
        <SectionHeading
          kicker="Gezi Rehberi"
          title="Tatil planını kolaylaştıran rehberler"
          description="Karar anını kolaylaştıran kısa ve net içerikler."
          action={
            <Link
              href="/blog"
              className={buttonVariants({
                variant: "outline",
                className: "rounded-full",
              })}
            >
              Tüm Yazıları Gör
            </Link>
          }
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {data.blogPosts.length ? (
            data.blogPosts.map((post) => <BlogGuideCard key={post.slug} post={post} />)
          ) : (
            guideFallbackCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="villawe-soft-panel block rounded-[2rem] p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/18 hover:shadow-[0_24px_60px_-36px_rgba(18,110,130,0.24)]"
              >
                <div className="space-y-3">
                  <p className="section-kicker">{card.kicker}</p>
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-7 text-muted-foreground">{card.body}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="container-shell py-12">
        <div className="rounded-[2.5rem] border border-border/70 bg-card px-6 py-8 shadow-[0_26px_70px_-40px_rgba(18,110,130,0.2)] sm:px-8 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="space-y-3">
            <h2 className="text-4xl font-semibold tracking-tight text-primary-dark">
              Tatilinizi sade ve güvenle planlayın
            </h2>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground">
              Doğrulanmış villa seçkisini inceleyin ve size uygun evi birkaç adımda bulun.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 lg:mt-0 lg:justify-end">
            <Link
              href="/villa-kiralama"
              className={buttonVariants({
                className: "rounded-full px-6",
              })}
            >
              Villaları Keşfet
            </Link>
            <Link
              href="/iletisim"
              className={buttonVariants({
                variant: "outline",
                className: "rounded-full px-6",
              })}
            >
              İletişime Geç
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
