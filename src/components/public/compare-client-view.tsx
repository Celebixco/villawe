"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { TrustBadges } from "@/components/public/trust-badges";
import { useCompareIds } from "@/components/public/villa-selection-store";
import { Card, CardContent } from "@/components/ui/card";
import type { VillaCard as VillaCardType } from "@/features/villas/types";

type CompareClientViewProps = {
  villas: VillaCardType[];
};

function yesNo(value: boolean) {
  return value ? "Var" : "Yok";
}

export function CompareClientView({ villas }: CompareClientViewProps) {
  const compareIds = useCompareIds();
  const items = villas.filter((villa) => compareIds.includes(villa.id));

  if (!items.length) {
    return (
      <Card className="villawe-soft-panel border-dashed">
        <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
          Henüz karşılaştırma listesine villa eklemediniz. Kartlardaki karşılaştırma butonunu
          kullanarak seçim yapabilirsiniz.
        </CardContent>
      </Card>
    );
  }

  const rows: Array<[string, (villa: VillaCardType) => ReactNode]> = [
    ["Bölge", (villa) => `${villa.district.name}, ${villa.region.name}`],
    ["Misafir", (villa) => `${villa.maxGuests}`],
    ["Yatak Odası", (villa) => `${villa.bedroomCount}`],
    ["Banyo", (villa) => `${villa.bathroomCount}`],
    ["Özel Havuz", (villa) => yesNo(villa.features.hasPrivatePool)],
    ["Jakuzi", (villa) => yesNo(villa.features.hasJacuzzi)],
    ["Korunaklı Havuz", (villa) => yesNo(villa.features.isShelteredPool)],
    ["Başlangıç Fiyatı", (villa) => `₺${villa.pricing.basePrice.toLocaleString("tr-TR")}`],
    [
      "Doğrulama",
      (villa) => <TrustBadges verification={villa.verification} />,
    ],
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {items.map((villa) => (
          <Card key={villa.id} className="villawe-panel">
            <CardContent className="space-y-3 p-6">
              <p className="text-sm text-muted-foreground">
                {villa.district.name}, {villa.region.name}
              </p>
              <h3 className="text-2xl font-semibold tracking-tight">{villa.title}</h3>
              <p className="text-sm leading-7 text-muted-foreground">{villa.shortDescription}</p>
              <Link href={`/villalar/${villa.slug}`} className="text-sm font-semibold text-primary">
                Villa sayfasını aç
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="overflow-x-auto rounded-[2rem] border border-border/80 bg-card shadow-[0_18px_55px_-34px_rgba(18,110,130,0.16)]">
        <table className="min-w-full">
          <tbody>
            {rows.map(([label, renderValue]) => (
              <tr key={label} className="border-b border-border/60 align-top">
                <th className="w-48 px-5 py-4 text-left text-sm font-semibold">{label}</th>
                {items.map((villa) => (
                  <td key={`${label}-${villa.id}`} className="px-5 py-4 text-sm text-muted-foreground">
                    {renderValue(villa)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
