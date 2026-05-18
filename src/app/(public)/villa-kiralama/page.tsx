import type { Metadata } from "next";

import { SectionHeading } from "@/components/public/section-heading";
import { VillaCard } from "@/components/public/villa-card";
import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildMetadata } from "@/features/seo/metadata";
import { getDistricts, getListingResults, getRegions } from "@/features/villas/queries";
import { getDatabaseHealth } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Villa Kiralama | Villawe",
  description:
    "Bölge, misafir ve fiyat filtreleriyle doğrulanmış villa ilanlarını listeleyin.",
  path: "/villa-kiralama",
});

type ListingPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VillaListingPage({
  searchParams,
}: ListingPageProps) {
  const resolvedSearchParams = await searchParams;
  const [databaseHealth, villas, regions, districts] = await Promise.all([
    getDatabaseHealth(),
    getListingResults(resolvedSearchParams),
    getRegions(),
    getDistricts(),
  ]);
  const inventoryUnavailable =
    databaseHealth.status === "unavailable" || databaseHealth.status === "error";

  return (
    <div className="container-shell space-y-8 py-12">
      <SectionHeading
        kicker="Villa Arama"
        title="Doğrulanmış ilanlar arasında filtreleyin"
        description="Bölge, kapasite, fiyat ve öne çıkan özelliklere göre filtreleyin. Villawe tüm ana ücret kalemlerini görünür tutar."
      />

      <Card className="villawe-hero-surface">
        <CardContent className="p-6">
          <form className="grid gap-4 lg:grid-cols-4" action="/villa-kiralama">
            <Input
              name="region"
              placeholder={`Bölge: ${regions.map((item) => item.name).join(", ")}`}
            />
            <Input
              name="district"
              placeholder={`İlçe: ${districts.map((item) => item.name).join(", ")}`}
            />
            <Input name="guests" type="number" min={1} placeholder="Misafir sayısı" />
            <Input name="bedrooms" type="number" min={1} placeholder="Yatak odası" />
            <Input name="minPrice" type="number" min={0} placeholder="Min fiyat" />
            <Input name="maxPrice" type="number" min={0} placeholder="Max fiyat" />
            <label className="villawe-check-tile">
              <input type="checkbox" name="privatePool" value="1" />
              <span className="text-sm">Özel havuz</span>
            </label>
            <label className="villawe-check-tile">
              <input type="checkbox" name="jacuzzi" value="1" />
              <span className="text-sm">Jakuzi</span>
            </label>
            <label className="villawe-check-tile">
              <input type="checkbox" name="seaView" value="1" />
              <span className="text-sm">Deniz manzarası</span>
            </label>
            <label className="villawe-check-tile">
              <input type="checkbox" name="shelteredPool" value="1" />
              <span className="text-sm">Korunaklı havuz</span>
            </label>
            <div className="lg:col-span-4 flex justify-end">
              <Button type="submit" className="rounded-full px-6">
                Filtreleri Uygula
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {databaseHealth.status === "demo" ? (
        <DataSourceNotice
          tone="warning"
          title="Demo katalog filtreleniyor"
          body={`${databaseHealth.message} Bu sonuçlar development amaçlı örnek kayıtlardır.`}
        />
      ) : null}

      {inventoryUnavailable ? (
        <DataSourceNotice
          tone="error"
          title="Katalog geçici olarak kullanılamıyor"
          body="Production ortamında demo ilanlar gösterilmez. Lütfen veritabanı yapılandırmasını doğruladıktan sonra tekrar deneyin."
        />
      ) : villas.length ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {villas.map((villa) => (
            <VillaCard key={villa.id} villa={villa} />
          ))}
        </div>
      ) : (
        <Card className="villawe-soft-panel border-dashed">
          <CardContent className="space-y-3 p-10 text-center">
            <h3 className="text-3xl font-semibold tracking-tight">Sonuç bulunamadı</h3>
            <p className="text-sm leading-7 text-muted-foreground">
              Filtreleri biraz genişletin veya farklı bir bölge deneyin.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
