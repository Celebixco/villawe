import { Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RegionRecord } from "@/features/villas/types";

type HeroSearchBoxProps = {
  regions: RegionRecord[];
};

export function HeroSearchBox({ regions }: HeroSearchBoxProps) {
  return (
    <div className="villawe-floating-card relative overflow-hidden p-5 sm:p-6">
      <div className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-primary/35 to-transparent" />
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="section-kicker">Villa Arama</p>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-primary-dark sm:text-3xl">
              Bölge, tarih ve misafire göre arayın
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              Doğrulanmış villa seçkisini filtreleyin, temel ücret kalemlerini görün ve
              talep sürecine güvenle başlayın.
            </p>
          </div>
        </div>

        <form action="/villa-kiralama" className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_0.85fr_auto]">
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Bölge</span>
            <select
              name="region"
              className="h-13 w-full rounded-[1.4rem] border border-input bg-card px-4 text-sm text-foreground shadow-[0_14px_28px_-24px_rgba(18,110,130,0.28)] outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
              defaultValue=""
            >
              <option value="">Bölge seçin</option>
              {regions.map((region) => (
                <option key={region.slug} value={region.slug}>
                  {region.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Giriş</span>
            <Input
              name="startDate"
              type="date"
              className="h-13 rounded-[1.4rem] bg-card shadow-[0_14px_28px_-24px_rgba(18,110,130,0.28)]"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Çıkış</span>
            <Input
              name="endDate"
              type="date"
              className="h-13 rounded-[1.4rem] bg-card shadow-[0_14px_28px_-24px_rgba(18,110,130,0.28)]"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Misafir</span>
            <div className="relative">
              <Users className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="guests"
                type="number"
                min={1}
                defaultValue={2}
                placeholder="2"
                className="h-13 rounded-[1.4rem] bg-card pl-11 shadow-[0_14px_28px_-24px_rgba(18,110,130,0.28)]"
              />
            </div>
          </label>

          <div className="flex items-end">
            <Button
              type="submit"
              size="lg"
              className="h-13 w-full rounded-[1.4rem] px-6 shadow-[0_24px_36px_-24px_rgba(18,110,130,0.8)]"
            >
              <Search className="size-4" />
              Ara
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
