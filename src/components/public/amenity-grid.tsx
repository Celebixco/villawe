import { Waves, Wifi, Bath, Trees, Flame, CarFront, Snowflake, ShieldCheck, UtensilsCrossed, Sparkles } from "lucide-react";

import type { VillaAmenity } from "@/features/villas/types";

const iconMap: Record<string, typeof Wifi> = {
  wifi: Wifi,
  "smart-tv": Sparkles,
  otopark: CarFront,
  barbeku: Flame,
  "tam-mutfak": UtensilsCrossed,
  "kahve-istasyonu": UtensilsCrossed,
  "isitmali-havuz": Waves,
  jakuzi: Bath,
  "guneslenme-alani": Trees,
  "cocuk-yatagi": ShieldCheck,
};

type AmenityGridProps = {
  amenities: VillaAmenity[];
};

export function AmenityGrid({ amenities }: AmenityGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {amenities.map((amenity) => {
        const Icon = iconMap[amenity.slug] || Snowflake;

        return (
          <div
            key={amenity.slug}
            className="rounded-[1.4rem] border border-border/70 bg-muted/72 px-4 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-card text-secondary shadow-[0_14px_28px_-24px_rgba(18,110,130,0.18)]">
                <Icon className="size-4" />
              </div>
              <p className="text-sm font-semibold text-foreground">{amenity.name}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
