import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/public/section-heading";
import { VillaCard } from "@/components/public/villa-card";
import { DataSourceNotice } from "@/components/shared/data-source-notice";
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
    <div className="container-shell space-y-8 py-12">
      <SectionHeading
        kicker={landingKicker}
        title={title}
        description={description}
      />

      <Card className="villawe-panel">
        <CardContent className="space-y-4 p-7">
          <h2 className="text-3xl font-semibold tracking-tight">
            {data.seoPage?.h1 || "Villawe yaklaşımı"}
          </h2>
          <p className="text-sm leading-7 text-muted-foreground">{description}</p>
          {seoBodyParagraphs?.length ? (
            <div className="space-y-4 text-sm leading-7 text-muted-foreground">
              {seoBodyParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-7 text-muted-foreground">
              Bu sayfa, bölge ve konsept aramalarını şeffaf fiyat ve doğrulama mantığıyla
              eşleştirmek için üretildi. Kullanıcıyı yanıltan kısa içerik değil, gerçek listeleme
              bağlamı sunar.
            </p>
          )}
        </CardContent>
      </Card>

      {showVillaGrid ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {data.villas.map((villa) => (
            <VillaCard key={villa.id} villa={villa} />
          ))}
        </div>
      ) : (
        <Card className="villawe-soft-panel">
          <CardContent className="space-y-3 p-7">
            <h3 className="text-2xl font-semibold tracking-tight">
              {isCustomSeoPage
                ? "İçerik sayfası hazır"
                : "Bu filtre için yayınlanmış villa henüz yok"}
            </h3>
            <p className="text-sm leading-7 text-muted-foreground">
              {isCustomSeoPage
                ? "Bu sayfa admin panelinden yönetilen SEO içeriğini gösterir. İlgili villa seçkisi eklendiğinde burada otomatik olarak listelenir."
                : "Yeni doğrulanmış villalar yayınlandığında bu sayfa otomatik olarak güncellenecektir."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
