import type { Metadata } from "next";
import Link from "next/link";
import { Compass, SlidersHorizontal } from "lucide-react";

import { EmptyState } from "@/components/public/empty-state";
import { FilterDrawer } from "@/components/public/filter-drawer";
import { SectionHeading } from "@/components/public/section-heading";
import { VillaCard } from "@/components/public/villa-card";
import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/features/seo/metadata";
import { listingBooleanFilters } from "@/features/search/filters";
import {
  getConcepts,
  getDistricts,
  getListingResults,
  getRegions,
} from "@/features/villas/queries";
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

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function VillaListingPage({
  searchParams,
}: ListingPageProps) {
  const resolvedSearchParams = await searchParams;
  const [databaseHealth, villas, regions, districts, concepts] = await Promise.all([
    getDatabaseHealth(),
    getListingResults(resolvedSearchParams),
    getRegions(),
    getDistricts(),
    getConcepts(),
  ]);

  const inventoryUnavailable =
    databaseHealth.status === "unavailable" || databaseHealth.status === "error";

  const formContent = (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Bölge</span>
          <select
            name="region"
            defaultValue={readSearchParam(resolvedSearchParams, "region")}
            className="h-12 w-full rounded-[1.3rem] border border-input bg-card px-4 text-sm outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
          >
            <option value="">Tüm bölgeler</option>
            {regions.map((region) => (
              <option key={region.id} value={region.slug}>
                {region.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">İlçe</span>
          <select
            name="district"
            defaultValue={readSearchParam(resolvedSearchParams, "district")}
            className="h-12 w-full rounded-[1.3rem] border border-input bg-card px-4 text-sm outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
          >
            <option value="">Tüm ilçeler</option>
            {districts.map((district) => (
              <option key={district.id} value={district.slug}>
                {district.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Konsept</span>
          <select
            name="concept"
            defaultValue={readSearchParam(resolvedSearchParams, "concept")}
            className="h-12 w-full rounded-[1.3rem] border border-input bg-card px-4 text-sm outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
          >
            <option value="">Tüm konseptler</option>
            {concepts.map((concept) => (
              <option key={concept.id} value={concept.slug}>
                {concept.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Sıralama</span>
          <select
            name="sort"
            defaultValue={readSearchParam(resolvedSearchParams, "sort")}
            className="h-12 w-full rounded-[1.3rem] border border-input bg-card px-4 text-sm outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
          >
            <option value="">Önerilen sıralama</option>
            <option value="price-asc">Fiyat: düşükten yükseğe</option>
            <option value="price-desc">Fiyat: yüksekten düşüğe</option>
            <option value="guests-desc">Kapasite: yüksekten düşüğe</option>
            <option value="bedrooms-desc">Oda sayısı: yüksekten düşüğe</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Giriş</span>
          <input
            name="startDate"
            type="date"
            defaultValue={readSearchParam(resolvedSearchParams, "startDate")}
            className="h-12 w-full rounded-[1.3rem] border border-input bg-card px-4 text-sm outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Çıkış</span>
          <input
            name="endDate"
            type="date"
            defaultValue={readSearchParam(resolvedSearchParams, "endDate")}
            className="h-12 w-full rounded-[1.3rem] border border-input bg-card px-4 text-sm outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Misafir</span>
          <input
            name="guests"
            type="number"
            min={1}
            defaultValue={readSearchParam(resolvedSearchParams, "guests")}
            placeholder="2"
            className="h-12 w-full rounded-[1.3rem] border border-input bg-card px-4 text-sm outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Min fiyat</span>
          <input
            name="minPrice"
            type="number"
            min={0}
            defaultValue={readSearchParam(resolvedSearchParams, "minPrice")}
            placeholder="5000"
            className="h-12 w-full rounded-[1.3rem] border border-input bg-card px-4 text-sm outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Max fiyat</span>
          <input
            name="maxPrice"
            type="number"
            min={0}
            defaultValue={readSearchParam(resolvedSearchParams, "maxPrice")}
            placeholder="25000"
            className="h-12 w-full rounded-[1.3rem] border border-input bg-card px-4 text-sm outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
          />
        </label>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Öne çıkan özellikler</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {listingBooleanFilters.map((filter) => (
            <label key={filter.key} className="villawe-check-tile">
              <input
                type="checkbox"
                name={filter.key}
                value="1"
                defaultChecked={readSearchParam(resolvedSearchParams, filter.key) === "1"}
              />
              <span className="text-sm">{filter.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Link
          href="/villa-kiralama"
          className={buttonVariants({
            variant: "ghost",
            className: "rounded-full",
          })}
        >
          Filtreleri Sıfırla
        </Link>
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_16px_34px_-24px_rgba(18,110,130,0.82)] transition hover:bg-primary-dark"
        >
          Sonuçları Göster
        </button>
      </div>
    </div>
  );

  return (
    <div className="container-shell space-y-8 py-10 sm:py-12">
      <section className="villawe-section-band villawe-gradient-band space-y-6">
        <SectionHeading
          kicker="Villa Arama"
          title="Doğrulanmış villaları tatil planınıza göre filtreleyin"
          description="Bölge, tarih, kapasite ve öne çıkan özellikleri bir araya getirip size uygun seçkiyi rahatça daraltın."
        />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.7rem] border border-border/70 bg-card/78 px-4 py-4 shadow-[0_18px_48px_-34px_rgba(18,110,130,0.18)]">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {inventoryUnavailable ? "Katalog kullanılamıyor" : `${villas.length} villa bulundu`}
            </p>
            <p className="text-sm leading-7 text-muted-foreground">
              Filtreleriniz her zaman şeffaf fiyat ve gerçek doğrulama mantığıyla eşleşir.
            </p>
          </div>
          <FilterDrawer>
            <form action="/villa-kiralama" className="space-y-5">
              {formContent}
            </form>
          </FilterDrawer>
        </div>

        <div className="hidden rounded-[2rem] border border-border/70 bg-card/82 p-6 shadow-[0_18px_52px_-36px_rgba(18,110,130,0.18)] lg:block">
          <form action="/villa-kiralama">{formContent}</form>
        </div>
      </section>

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
        <section className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {concepts.slice(0, 8).map((concept) => (
              <Link
                key={concept.slug}
                href={`/villa-kiralama?concept=${concept.slug}`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "rounded-full",
                })}
              >
                {concept.name}
              </Link>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {villas.map((villa) => (
              <VillaCard key={villa.id} villa={villa} />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          icon={<Compass className="size-5" />}
          title="Sonuç bulunamadı"
          description="Filtreleri biraz genişletin veya farklı bir bölge deneyin. Villawe yalnızca yayınlanmış ve erişilebilir villaları gösterir."
          action={
            <Link
              href="/villa-kiralama"
              className={buttonVariants({
                variant: "outline",
                className: "rounded-full",
              })}
            >
              Filtreleri Temizle
            </Link>
          }
        />
      )}

      <Card className="villawe-soft-panel">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="section-kicker">Filtre Desteği</p>
            <h2 className="text-3xl font-semibold tracking-tight">
              Bölge, konsept ve özellikleri birlikte kullanın
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Tatil tipi ve villa özelliklerini aynı anda filtreleyerek daha hızlı karar verebilirsiniz.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold text-primary shadow-[0_14px_34px_-28px_rgba(18,110,130,0.2)]">
            <SlidersHorizontal className="size-4" />
            Mobil filtre çekmecesi aktif
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
