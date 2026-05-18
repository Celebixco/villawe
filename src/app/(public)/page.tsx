import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  BadgePercent,
  Headset,
  ShieldCheck,
} from "lucide-react";

import { PriceEstimator } from "@/components/public/price-estimator";
import { SafeRentalAlert } from "@/components/public/safe-rental-alert";
import { SectionHeading } from "@/components/public/section-heading";
import { VillaCard } from "@/components/public/villa-card";
import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildMetadata } from "@/features/seo/metadata";
import { getHomePageData } from "@/features/villas/queries";
import { getDatabaseHealth } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Villawe | Güvenilir ve doğrulanmış villaları keşfedin",
  description:
    "Doğrulanmış villa ilanları, şeffaf fiyat kalemleri ve güvenli rezervasyon talep akışıyla Villawe ana sayfası.",
  path: "/",
});

export default async function HomePage() {
  const [databaseHealth, data] = await Promise.all([
    getDatabaseHealth(),
    getHomePageData(),
  ]);
  const inventoryUnavailable =
    databaseHealth.status === "unavailable" || databaseHealth.status === "error";
  const spotlightVilla = !inventoryUnavailable ? data.verified[0] : null;
  const heroImage = spotlightVilla?.coverImage.url || "/images/villawe/villa-luna.svg";
  const heroImageAlt = spotlightVilla?.coverImage.alt || "Villawe öne çıkan villa";
  const trustItems = [
    {
      label: "%100 Güvenli",
      icon: ShieldCheck,
      className: "text-success",
    },
    {
      label: "Şeffaf Fiyatlandırma",
      icon: BadgeDollarSign,
      className: "text-secondary",
    },
    {
      label: "7/24 Destek",
      icon: Headset,
      className: "text-primary",
    },
    {
      label: "En İyi Fiyat Garantisi",
      icon: BadgePercent,
      className: "text-accent",
    },
  ];

  return (
    <div className="pb-16">
      <section className="container-shell grid gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-18">
        <div className="space-y-8">
          <div className="space-y-5">
            <Badge variant="info" className="rounded-full px-4 py-2">
              Fresh Holiday Premium by Villawe
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-7xl">
                Hayalinizdeki villayı keşfedin
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Güvenilir, doğrulanmış ve size özel villalar sizi bekliyor. Villawe;
                sahte ilan riskini azaltan, fiyatı şeffaf gösteren ve talep akışını
                güvenle yöneten modern villa keşif platformudur.
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

          <Card className="villawe-hero-surface overflow-hidden">
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <p className="section-kicker">Villa Arama</p>
                <h2 className="text-3xl font-semibold tracking-tight text-primary-dark">
                  Bölge, tarih ve misafire göre arayın
                </h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  Villawe Güvenli Kiralama Sistemi ile filtrelerinizi netleştirin,
                  fiyatı şeffaf görün ve doğru villaya hızla ulaşın.
                </p>
              </div>
              <form action="/villa-kiralama" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Input name="region" placeholder="Bölge" />
                <Input name="startDate" type="date" />
                <Input name="endDate" type="date" />
                <div className="flex gap-3">
                  <Input name="guests" type="number" min={1} placeholder="Misafir" />
                  <Button type="submit" className="rounded-full px-5">
                    Keşfet
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {trustItems.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="villawe-soft-panel flex items-center gap-3 px-4 py-4">
                  <Icon className={`size-5 ${item.className}`} />
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="villawe-hero-surface relative overflow-hidden">
            <div className="relative aspect-[4/5] overflow-hidden lg:aspect-[4/4.5]">
              <Image
                src={heroImage}
                alt={heroImageAlt}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/88 via-primary-dark/18 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 space-y-4 p-6 text-white sm:p-7">
                <Badge variant="success" className="border-white/18 bg-white/12 text-white">
                  Doğrulanmış Villa
                </Badge>
                <div className="space-y-2">
                  <h3 className="text-3xl font-semibold tracking-tight">
                    {spotlightVilla?.title || "Akdeniz esintili premium konaklama"}
                  </h3>
                  <p className="max-w-md text-sm leading-7 text-white/78">
                    {spotlightVilla?.shortDescription ||
                      "Geniş yaşam alanları, ferah yüzeyler ve güven veren villa detaylarıyla Villawe seçkisi."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-white/82">
                  <span className="rounded-full border border-white/16 bg-white/10 px-3 py-1">
                    Şeffaf Fiyatlandırma
                  </span>
                  <span className="rounded-full border border-white/16 bg-white/10 px-3 py-1">
                    Belge Kontrolü Yapıldı
                  </span>
                </div>
              </div>
            </div>
          </div>

          {spotlightVilla ? <PriceEstimator villa={spotlightVilla} /> : null}
          <SafeRentalAlert />
        </div>
      </section>

      <section className="container-shell space-y-8 py-10">
        <SectionHeading
          kicker="Öne Çıkan Bölgeler"
          title="Popüler destinasyonlar ve konseptler"
          description="Programatik SEO altyapısı ile bölge ve konsept iniş sayfaları ilk günden hazır. Kullanıcılar doğru sayfaya, doğru filtre bağlamıyla ulaşır."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.regions.map((region) => (
            <Link
              key={region.slug}
              href={`/${region.slug}-villa-kiralama`}
              className="villawe-panel group block p-6 transition hover:-translate-y-1 hover:border-primary/16 hover:shadow-[0_24px_60px_-36px_rgba(18,110,130,0.24)]"
            >
              <p className="text-sm text-muted-foreground">{region.name}</p>
              <h3 className="mt-2 text-3xl font-semibold tracking-tight">{region.name}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {region.shortDescription}
              </p>
              <p className="mt-5 text-sm font-semibold text-primary">Sayfayı aç</p>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {data.concepts.map((concept) => (
            <Link
              key={concept.slug}
              href={`/${concept.slug}`}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition hover:border-primary/35 hover:text-primary-dark"
            >
              {concept.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-shell space-y-8 py-10">
        {databaseHealth.status === "demo" ? (
          <DataSourceNotice
            tone="warning"
            title="Demo katalog görünümü"
            body={`${databaseHealth.message} Development ortamında görünen villalar örnek içeriktir ve gerçek stok olarak değerlendirilmemelidir.`}
          />
        ) : null}
        {inventoryUnavailable ? (
          <DataSourceNotice
            tone="error"
            title="Villa kataloğu şu anda kullanılamıyor"
            body="Villawe production ortamında demo ilan göstermez. Lütfen biraz sonra tekrar deneyin veya ekibimizle iletişime geçin."
          />
        ) : null}
        <SectionHeading
          kicker="Doğrulanmış Villalar"
          title="Güven rozeti taşıyan seçilmiş ilanlar"
          description="Rozetler dekoratif değil; kimlik, yetki, turizm izni, konum, fotoğraf ve telefon kontrollerinin gerçek sonucunu gösterir."
        />
        {!inventoryUnavailable ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {data.verified.map((villa) => (
              <VillaCard key={villa.id} villa={villa} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="container-shell space-y-8 py-10">
        <SectionHeading
          kicker="Neden Villawe?"
          title="Önce güven, sonra karar"
          description="Dönüşüm baskısından önce kullanıcının güvenini inşa eden bilgi mimarisi: gerçek doğrulama alanları, açık politikalar ve operasyon odaklı müsaitlik yönetimi."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="villawe-panel">
            <CardContent className="space-y-4 p-7">
              <h3 className="text-3xl font-semibold tracking-tight text-primary-dark">
                Villawe Güvenli Kiralama Sistemi
              </h3>
              <p className="text-sm leading-7 text-muted-foreground">
                Villawe her ilanı tek bir &quot;güvenilir&quot; etiketiyle özetlemez. Hangi
                kontrolün yapıldığını, hangisinin eksik olduğunu açıkça ayırır. Böylece kullanıcı
                eksik bir doğrulamayı tamamlanmış gibi yorumlamaz.
              </p>
              <Link
                href="/guvenli-villa-kiralama-rehberi"
                className={buttonVariants({
                  variant: "outline",
                  className: "rounded-full",
                })}
              >
                Güvenli Kiralama Rehberini Oku
              </Link>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[2rem] border border-primary/15 bg-linear-to-br from-primary via-primary to-primary-dark text-primary-foreground shadow-[0_24px_60px_-36px_rgba(18,110,130,0.72)]">
            <CardContent className="space-y-4 p-7">
              <h3 className="text-3xl font-semibold tracking-tight">
                Villanızı Villawe üzerinde listeleyin
              </h3>
              <p className="text-sm leading-7 text-primary-foreground/82">
                Sahipler ve acenteler için yayın öncesi doğrulama, doküman yükleme, sezon fiyatı
                ve müsaitlik blok yönetimi tek panelde toplanır.
              </p>
              <Link
                href="/iletisim"
                className={buttonVariants({
                  variant: "accent",
                  className: "rounded-full",
                })}
              >
                Listeleme Talebi Gönder
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container-shell space-y-8 py-10">
        <SectionHeading
          kicker="Yeni ve Öne Çıkan"
          title="Son eklenen ve kürasyonlu villa seçkisi"
          description="Yeni ilanları ayrı öne çıkartıyor, editöryal seçimleri ise güven ve fiyat okunabilirliği üzerinden yapıyoruz."
        />
        {!inventoryUnavailable ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {data.newest.map((villa) => (
              <VillaCard key={villa.id} villa={villa} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="container-shell space-y-8 py-10">
        <SectionHeading
          kicker="Gezi Rehberi"
          title="Blog ve destinasyon içerik temeli"
          description="Kısa süreli içerik değil; bölge, güvenlik ve villa seçimi odaklı uzun ömürlü rehber yapısı."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {data.blogPosts.map((post) => (
            <Card key={post.slug} className="villawe-panel">
              <CardContent className="space-y-4 p-7">
                <p className="section-kicker">Gezi Rehberi</p>
                <h3 className="text-3xl font-semibold tracking-tight">{post.title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className={buttonVariants({
                    variant: "outline",
                    className: "rounded-full",
                  })}
                >
                  Yazıyı Aç
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
