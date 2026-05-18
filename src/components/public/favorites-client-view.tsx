"use client";

import { VillaCard } from "@/components/public/villa-card";
import { useFavoriteIds } from "@/components/public/villa-selection-store";
import { Card, CardContent } from "@/components/ui/card";
import type { VillaCard as VillaCardType } from "@/features/villas/types";

type FavoritesClientViewProps = {
  villas: VillaCardType[];
};

export function FavoritesClientView({ villas }: FavoritesClientViewProps) {
  const favoriteIds = useFavoriteIds();
  const items = villas.filter((villa) => favoriteIds.includes(villa.id));

  if (!items.length) {
    return (
      <Card className="villawe-soft-panel border-dashed">
        <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
          Henüz favori villa seçmediniz. Kartlardaki favori butonuyla liste oluşturmaya
          başlayabilirsiniz.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {items.map((villa) => (
        <VillaCard key={villa.id} villa={villa} />
      ))}
    </div>
  );
}
