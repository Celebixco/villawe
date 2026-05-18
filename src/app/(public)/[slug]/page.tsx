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
    data.region?.heroTitle ||
    data.concept?.heroTitle ||
    `${data.district?.name} villa kiralama`;
  const description =
    data.region?.heroDescription ||
    data.concept?.description ||
    `${data.district?.name} için programatik iniş sayfası.`;

  return buildMetadata({
    title: `${title} | Villawe`,
    description,
    path: `/${slug}`,
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
    data.region?.heroTitle ||
    data.concept?.heroTitle ||
    `${data.district?.name} villa kiralama`;
  const description =
    data.region?.heroDescription ||
    data.concept?.description ||
    `${data.district?.name} için doğrulanmış villa seçenekleri.`;

  return (
    <div className="container-shell space-y-8 py-12">
      <SectionHeading
        kicker="Bölge ve Konsept"
        title={title}
        description={description}
      />

      <Card className="villawe-panel">
        <CardContent className="space-y-4 p-7">
          <h2 className="text-3xl font-semibold tracking-tight">Villawe yaklaşımı</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Bu sayfa, bölge ve konsept aramalarını şeffaf fiyat ve doğrulama mantığıyla
            eşleştirmek için üretildi. Kullanıcıyı yanıltan kısa içerik değil, gerçek listeleme
            bağlamı sunar.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {data.villas.map((villa) => (
          <VillaCard key={villa.id} villa={villa} />
        ))}
      </div>
    </div>
  );
}
