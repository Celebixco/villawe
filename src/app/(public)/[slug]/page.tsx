import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/public/empty-state";
import { SectionHeading } from "@/components/public/section-heading";
import { VillaCard } from "@/components/public/villa-card";
import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/features/seo/metadata";
import { getLandingPageData } from "@/features/villas/queries";
import { getDatabaseHealth } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type LandingPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: LandingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [databaseHealth, data] = await Promise.all([
    getDatabaseHealth(),
    getLandingPageData(slug),
  ]);

  if (databaseHealth.status === "unavailable" || databaseHealth.status === "error") {
    return buildMetadata({
      title: "Sayfa geçici olarak kullanılamıyor | Villawe",
      description: "İçerik yapılandırması tamamlanana kadar bu SEO sayfası geçici olarak kapalı.",
      path: `/${slug}`,
      noIndex: true,
    });
  }

  if (!data) {
    return buildMetadata({
      title: "Sayfa bulunamadı | Villawe",
      description: "Aradığınız iniş sayfası bulunamadı.",
      path: `/${slug}`,
      noIndex: true,
    });
  }

  const title =
    data.seoPage?.title ||
    data.region?.heroTitle ||
    data.concept?.heroTitle ||
    `${data.district?.name} villa kiralama`;
  const description =
    data.seoPage?.description ||
    data.region?.heroDescription ||
    data.concept?.description ||
    `${data.district?.name} için programatik iniş sayfası.`;

  return buildMetadata({
    title: title.includes("Villawe") ? title : `${title} | Villawe`,
    description,
    path: `/${slug}`,
    canonicalPath: data.seoPage?.canonicalPath || `/${slug}`,
    openGraphTitle: data.seoPage?.ogTitle,
    openGraphDescription: data.seoPage?.ogDescription,
    noIndex: data.seoPage?.noIndex,
  });
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { slug } = await params;
  const [databaseHealth, data] = await Promise.all([
    getDatabaseHealth(),
    getLandingPageData(slug),
  ]);

  if (databaseHealth.status === "unavailable" || databaseHealth.status === "error") {
    return (
      <div className="container-shell space-y-8 py-12">
        <SectionHeading
          kicker="Bölge ve Konsept"
          title="Sayfa geçici olarak kullanılamıyor"
          description="Production ortamında demo iniş sayfası gösterilmez."
        />
        <DataSourceNotice
          tone="error"
          title="İçerik yapılandırması bekleniyor"
          body="Gerçek ilan ve SEO verisi yüklenemediği için bu sayfa güvenli biçimde kapatıldı."
        />
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const title =
    data.seoPage?.h1 ||
    data.region?.heroTitle ||
    data.concept?.heroTitle ||
    `${data.district?.name} villa kiralama`;
  const description =
    data.seoPage?.intro ||
    data.seoPage?.description ||
    data.region?.heroDescription ||
    data.concept?.description ||
    `${data.district?.name} için doğrulanmış villa seçenekleri.`;
  const seoBodyParagraphs = data.seoPage?.body
    ?.split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const isCustomSeoPage = data.seoPage?.pageType === "CUSTOM";
  const showVillaGrid = !isCustomSeoPage && data.villas.length > 0;
  const landingKicker =
    data.target?.type === "concept"
      ? "Konsept"
      : data.target?.type === "district"
        ? "Bölge"
        : data.target?.type === "region"
          ? "Destinasyon"
          : "SEO Sayfası";

  return (
    <div className="container-shell space-y-10 py-10 sm:py-12">
      <section className="villawe-section-band villawe-gradient-band space-y-6">
        <SectionHeading
          kicker={landingKicker}
          title={title}
          description={description}
          action={
            <Link
              href="/villa-kiralama"
              className={buttonVariants({
                className: "rounded-full",
              })}
            >
              Villaları Keşfet
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        <div className="flex flex-wrap gap-3">
          <Link
            href="/villa-kiralama"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "rounded-full",
            })}
          >
            Tüm Villalar
          </Link>
          <Link
            href="/blog"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "rounded-full",
            })}
          >
            Bölge Rehberi
          </Link>
          <Link
            href="/guvenli-villa-kiralama-rehberi"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "rounded-full",
            })}
          >
            Güvenli Kiralama Sistemi
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="villawe-panel">
          <CardContent className="space-y-4 p-7">
            <p className="section-kicker">{data.seoPage?.h1 || "Villawe yaklaşımı"}</p>
            <h2 className="text-3xl font-semibold tracking-tight">
              Premium villa keşfini güven odaklı hale getiriyoruz
            </h2>
            <p className="text-sm leading-8 text-muted-foreground">{description}</p>
          </CardContent>
        </Card>

        <Card className="villawe-soft-panel">
          <CardContent className="space-y-4 p-7">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-card text-primary shadow-[0_18px_38px_-28px_rgba(18,110,130,0.24)]">
              <Sparkles className="size-5" />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight">Bu sayfa neden var?</h2>
            <p className="text-sm leading-8 text-muted-foreground">
              Bu iniş sayfası, kullanıcıyı yüzeysel içerikle oyalamak yerine doğrudan ilgili
              villa seçkisine ve güven rehberlerine ulaştırmak için kurgulandı.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="villawe-panel">
        <CardContent className="space-y-5 p-7">
          <h2 className="text-3xl font-semibold tracking-tight">Sayfa içeriği</h2>
          {seoBodyParagraphs?.length ? (
            <div className="space-y-4 text-sm leading-8 text-muted-foreground">
              {seoBodyParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-8 text-muted-foreground">
              Bu sayfa, bölge ve konsept aramalarını şeffaf fiyat ve doğrulama mantığıyla
              eşleştirmek için üretildi. Kullanıcıyı yanıltan kısa içerik değil, gerçek listeleme
              bağlamı sunar.
            </p>
          )}
        </CardContent>
      </Card>

      {showVillaGrid ? (
        <section className="space-y-6">
          <SectionHeading
            kicker="Villa Seçkisi"
            title="Bu sayfaya uygun yayınlanmış villalar"
            description="Liste yalnızca yayınlanmış ve kamuya açık durumdaki villalardan oluşur."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {data.villas.map((villa) => (
              <VillaCard key={villa.id} villa={villa} />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          title={isCustomSeoPage ? "İçerik sayfası hazır" : "Bu filtre için yayınlanmış villa henüz yok"}
          description={
            isCustomSeoPage
              ? "Bu sayfa admin panelinden yönetilen SEO içeriğini gösterir. İlgili villa seçkisi eklendiğinde burada otomatik olarak listelenir."
              : "Yeni doğrulanmış villalar yayınlandığında bu sayfa otomatik olarak güncellenecektir."
          }
          action={
            <Link
              href="/villa-kiralama"
              className={buttonVariants({
                variant: "outline",
                className: "rounded-full",
              })}
            >
              Genel Listelemeye Dön
            </Link>
          }
        />
      )}
    </div>
  );
}
