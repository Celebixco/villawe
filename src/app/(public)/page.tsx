import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  BadgePercent,
  Headset,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { BlogGuideCard } from "@/components/public/blog-guide-card";
import { EmptyState } from "@/components/public/empty-state";
import { HeroSearchBox } from "@/components/public/hero-search-box";
import { RegionCard } from "@/components/public/region-card";
import { SafeRentalAlert } from "@/components/public/safe-rental-alert";
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

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Villawe | Güvenilir ve doğrulanmış villaları keşfedin",
  description:
    "Doğrulanmış villa ilanları, şeffaf fiyat kalemleri ve güvenli rezervasyon talep akışıyla Villawe ana sayfası.",
  path: "/",
});

const regionFallbacks: Record<string, string> = {
  kas: "/images/villawe/villa-luna.svg",
  kalkan: "/images/villawe/villa-solea.svg",
  fethiye: "/images/villawe/villa-pool.svg",
  bodrum: "/images/villawe/villa-nova.svg",
  sapanca: "/images/villawe/villa-suite.svg",
};

function getRegionVisual(
  regionSlug: string,
  inventory: Awaited<ReturnType<typeof getHomePageData>>["villas"],
) {
  const matchingVilla = inventory.find((villa) => villa.region.slug === regionSlug);

  return {
    imageUrl:
      matchingVilla?.coverImage.url || regionFallbacks[regionSlug] || "/images/villawe/villa-fallback.svg",
    imageAlt: matchingVilla?.coverImage.alt || `${regionSlug} için Villawe bölge görseli`,
  };
}

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

  const trustItems = [
    {
      label: "%100 Güvenli",
      description: "Doğrulama alanları gerçek kayıtlarla yönetilir.",
      icon: ShieldCheck,
      accentClassName: "text-success",
    },
    {
      label: "Şeffaf Fiyatlandırma",
      description: "Temizlik, hizmet ve depozito kalemleri görünürdür.",
      icon: BadgeDollarSign,
      accentClassName: "text-primary",
    },
    {
      label: "7/24 Destek",
      description: "Talep akışı boyunca operasyonel destek sağlanır.",
      icon: Headset,
      accentClassName: "text-secondary",
    },
    {
      label: "En İyi Fiyat Garantisi",
      description: "Kullanıcıyı yanıltmayan net fiyat dili hedeflenir.",
      icon: BadgePercent,
      accentClassName: "text-accent",
    },
  ];

  const curatedRegions = data.regions.slice(0, 5);
  const featuredVillas = data.featured.length ? data.featured : data.verified;
  const newestVillas = data.newest.length ? data.newest : data.villas.slice(0, 3);

  return (
    <div className="pb-18">
      <section className="container-shell pt-8 pb-10 lg:pt-10">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-5">
              <Badge variant="info" className="rounded-full px-4 py-2">
                Fresh Holiday Premium
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-6xl xl:text-7xl">
                  Hayalinizdeki villayı keşfedin
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                  Güvenilir, doğrulanmış ve size özel villalar sizi bekliyor. Villawe;
                  sahte ilan riskini azaltan, fiyatı şeffaf gösteren ve talep akışını
                  güvenle yöneten premium villa keşif platformudur.
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
                    {spotlightVerified ? (
                      <Badge
                        variant="success"
                        className="border-white/16 bg-white/10 text-white"
                      >
                        Doğrulanmış Villa
                      </Badge>
                    ) : null}
                    <Badge variant="secondary" className="border-white/16 bg-white/10 text-white">
                      Şeffaf Fiyatlandırma
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                      {spotlightVilla?.title || "Akdeniz esintili premium konaklama"}
                    </h2>
                    <p className="max-w-md text-sm leading-7 text-white/80">
                      {spotlightVilla?.shortDescription ||
                        "Yüksek kaliteli villa seçkisi, güçlü doğrulama mantığı ve güven veren bir talep deneyimi."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-medium text-white/86">
                    <span className="rounded-full border border-white/16 bg-white/10 px-3 py-2">
                      Geniş villa galerileri
                    </span>
                    <span className="rounded-full border border-white/16 bg-white/10 px-3 py-2">
                      Belge ve konum kontrolü
                    </span>
                    <span className="rounded-full border border-white/16 bg-white/10 px-3 py-2">
                      Kullanıcıyı koruyan talep akışı
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <SafeRentalAlert />
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
            title="Demo katalog görünümü"
            body={`${databaseHealth.message} Development ortamında görünen villalar örnek içeriktir ve gerçek stok olarak değerlendirilmemelidir.`}
          />
        </section>
      ) : null}

      {inventoryUnavailable ? (
        <section className="container-shell pt-6">
          <DataSourceNotice
            tone="error"
            title="Villa kataloğu şu anda kullanılamıyor"
            body="Villawe production ortamında demo ilan göstermez. Lütfen biraz sonra tekrar deneyin veya ekibimizle iletişime geçin."
          />
        </section>
      ) : null}

      <section id="bolgeler" className="container-shell py-12">
        <div className="villawe-section-band villawe-gradient-band space-y-8">
          <SectionHeading
            kicker="Popüler Bölgeler"
            title="Tatili bulunduğu yer kadar hissettiren destinasyonlar"
            description="Kaş’tan Sapanca’ya, Villawe bölge sayfaları güvenli arama deneyimini lokasyon bağlamıyla birleştirir."
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {curatedRegions.map((region) => {
              const visual = getRegionVisual(region.slug, data.villas);

              return (
                <RegionCard
                  key={region.id}
                  href={`/${region.slug}-villa-kiralama`}
                  name={region.name}
                  description={region.shortDescription}
                  imageUrl={visual.imageUrl}
                  imageAlt={visual.imageAlt}
                  eyebrow="Öne çıkan destinasyon"
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
                  Balayı, jakuzi, muhafazakar ya da deniz manzaralı
                </h2>
                <p className="villawe-rich-copy">
                  Kullanıcılar sadece lokasyona değil, tatil ihtiyacına göre de arama
                  yapar. Villawe konsept sayfaları tam olarak bu davranış için tasarlandı.
                </p>
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
                  <p className="text-sm leading-7 text-muted-foreground">
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
          title="Güven rozetleri ve temiz fiyat diliyle seçilmiş villalar"
          description="Kapsamlı fotoğraf, net bölge bilgisi ve temel ücret kalemlerini görünür tutan kart yapısıyla hızlı karşılaştırma yapın."
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
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {featuredVillas.map((villa) => (
              <VillaCard key={villa.id} villa={villa} />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              title="Öne çıkan villa seçkisi hazırlanıyor"
              description="Yayınlanmış villalar eklendiğinde bu alanda editöryal olarak öne çıkarılan seçenekleri göreceksiniz."
            />
          </div>
        )}
      </section>

      <section className="container-shell py-12">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="villawe-panel overflow-hidden">
            <CardContent className="space-y-5 p-7 sm:p-8">
              <p className="section-kicker">Villawe Güvenli Kiralama Sistemi</p>
              <h2 className="text-4xl font-semibold tracking-tight text-primary-dark">
                Platform dışı ödeme yapmayın!
              </h2>
              <div className="space-y-3 villawe-rich-copy">
                <p>
                  Villawe her ilanı tek bir pazarlama rozetiyle süslemez. Hangi doğrulama
                  kaleminin tamamlandığı, hangisinin beklediği net biçimde ayrılır.
                </p>
                <p>
                  Böylece kullanıcı eksik bir kontrolü tamamlanmış sanmaz; fiyat özetini,
                  depozito politikasını ve güvenlik uyarılarını karar anında açıkça görür.
                </p>
              </div>
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

          <div className="grid gap-5">
            <Card className="villawe-soft-panel">
              <CardContent className="space-y-3 p-6">
                <p className="section-kicker">Şeffaflık</p>
                <h3 className="text-3xl font-semibold tracking-tight">Temizlik, hizmet ve depozito ayrı görünür</h3>
                <p className="text-sm leading-7 text-muted-foreground">
                  Kullanıcıyı sürpriz ücretlerle karşılaştırmayan fiyat yapısı, Villawe
                  marka güveninin merkezindedir.
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden rounded-[2rem] border border-primary/10 bg-linear-to-br from-primary via-primary to-primary-dark text-primary-foreground shadow-[0_24px_60px_-36px_rgba(18,110,130,0.72)]">
              <CardContent className="space-y-4 p-6">
                <p className="section-kicker text-white/72">Listeleme Ortağı Olun</p>
                <h3 className="text-3xl font-semibold tracking-tight">
                  Villanızı Villawe’de güven odaklı biçimde yayınlayın
                </h3>
                <p className="text-sm leading-7 text-primary-foreground/82">
                  Doküman yükleme, doğrulama, fiyat sezonu ve müsaitlik yönetimi tek
                  operasyon akışında buluşur.
                </p>
                <Link
                  href="/iletisim#listeleme"
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
        </div>
      </section>

      <section className="container-shell py-12">
        <SectionHeading
          kicker="Yeni Eklenenler"
          title="Son eklenen ve ilham veren villa seçkisi"
          description="Keşif akışını canlı tutmak için yeni yayınlanan villaları ayrı bir seçki halinde sunuyoruz."
        />

        {!inventoryUnavailable && newestVillas.length ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {newestVillas.map((villa) => (
              <VillaCard key={villa.id} villa={villa} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="container-shell py-12">
        <SectionHeading
          kicker="Gezi Rehberi"
          title="Tatil planını kolaylaştıran içerikler"
          description="Bölge rehberleri, güvenli kiralama notları ve Villawe’nin güven yaklaşımını anlatan içerik merkezi."
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
            <div className="lg:col-span-3">
              <EmptyState
                title="İlk rehber içerikleri hazırlanıyor"
                description="Blog yazıları yayınlandığında burada editöryal rehber kartlarını göreceksiniz."
              />
            </div>
          )}
        </div>
      </section>

      <section className="container-shell py-12">
        <div className="rounded-[2.5rem] border border-border/70 bg-card px-6 py-8 shadow-[0_26px_70px_-40px_rgba(18,110,130,0.2)] sm:px-8 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="space-y-3">
            <p className="section-kicker">Son Çağrı</p>
            <h2 className="text-4xl font-semibold tracking-tight text-primary-dark">
              Tatil planınızı güvenle başlatın
            </h2>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground">
              Villawe ile doğrulama sürecinden geçmiş villaları keşfedin, fiyatı açıkça görün
              ve talebinizi güvenli akışla iletin.
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
