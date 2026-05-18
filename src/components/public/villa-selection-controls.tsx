"use client";

import { useState } from "react";
import { Heart, Scale } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getCompareLimit,
  toggleCompare,
  toggleFavorite,
  useCompareIds,
  useFavoriteIds,
} from "@/components/public/villa-selection-store";

type VillaSelectionControlsProps = {
  villaId: string;
  compact?: boolean;
};

export function VillaSelectionControls({
  villaId,
  compact = false,
}: VillaSelectionControlsProps) {
  const favoriteIds = useFavoriteIds();
  const compareIds = useCompareIds();
  const [compareHint, setCompareHint] = useState<string | null>(null);
  const isFavorite = favoriteIds.includes(villaId);
  const inCompare = compareIds.includes(villaId);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size={compact ? "icon-sm" : "default"}
          className={compact ? "rounded-full bg-card/94 text-primary-dark backdrop-blur-sm" : "rounded-full"}
          aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          onClick={() => {
            toggleFavorite(villaId);
          }}
        >
          <Heart className={`${compact ? "size-4" : "mr-2 h-4 w-4"} ${isFavorite ? "fill-current" : ""}`} />
          {!compact ? (isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle") : null}
        </Button>
        <Button
          type="button"
          variant="outline"
          size={compact ? "icon-sm" : "default"}
          className={compact ? "rounded-full bg-card/94 text-primary-dark backdrop-blur-sm" : "rounded-full"}
          aria-label={inCompare ? "Karşılaştırmadan çıkar" : "Karşılaştırmaya ekle"}
          onClick={() => {
            const result = toggleCompare(villaId);

            if (result.limitReached) {
              setCompareHint(`Aynı anda en fazla ${getCompareLimit()} villa karşılaştırılabilir.`);
              return;
            }

            setCompareHint(null);
          }}
        >
          <Scale className={compact ? "size-4" : "mr-2 h-4 w-4"} />
          {!compact ? (inCompare ? "Karşılaştırmadan Çıkar" : "Karşılaştırmaya Ekle") : null}
        </Button>
      </div>
      {compareHint && !compact ? <p className="text-xs text-warning">{compareHint}</p> : null}
    </div>
  );
}
