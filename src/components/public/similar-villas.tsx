import { VillaCard } from "@/components/public/villa-card";
import type { VillaCard as VillaCardRecord } from "@/features/villas/types";

type SimilarVillasProps = {
  villas: VillaCardRecord[];
};

export function SimilarVillas({ villas }: SimilarVillasProps) {
  if (!villas.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="section-kicker">Benzer Seçenekler</p>
        <h2 className="text-4xl font-semibold tracking-tight">Bunlar da ilginizi çekebilir</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {villas.map((villa) => (
          <VillaCard key={villa.id} villa={villa} />
        ))}
      </div>
    </div>
  );
}
