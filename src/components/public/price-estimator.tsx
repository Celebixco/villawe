"use client";

import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateVillaEstimate } from "@/features/bookings/pricing";
import type { VillaDetail } from "@/features/villas/types";

type PriceEstimatorProps = {
  villa: VillaDetail;
};

export function PriceEstimator({ villa }: PriceEstimatorProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guestCount, setGuestCount] = useState(String(Math.min(villa.maxGuests, 2)));

  const estimate = calculateVillaEstimate(villa, startDate, endDate, Number(guestCount));

  return (
    <Card className="villawe-panel">
      <CardContent className="space-y-6 p-6">
        <div className="space-y-1">
          <p className="section-kicker">
            Şeffaf Fiyat
          </p>
          <h3 className="text-3xl font-semibold tracking-tight text-primary-dark">
            Toplam fiyatı şeffaf görün
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="startDate">Giriş</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Çıkış</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guestCount">Misafir</Label>
            <Input
              id="guestCount"
              type="number"
              min={1}
              max={16}
              value={guestCount}
              onChange={(event) => setGuestCount(event.target.value)}
            />
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-border/70 bg-muted/85 p-5">
          <div className="flex items-center justify-between border-b border-border/70 py-2">
            <span className="text-sm text-muted-foreground">
              {estimate.nights > 0 ? `${estimate.nights} gece konaklama` : "Başlangıç gecelik fiyat"}
            </span>
            <span className="font-semibold">₺{estimate.nightlySubtotal.toLocaleString("tr-TR")}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/70 py-2">
            <span className="text-sm text-muted-foreground">Temizlik ücreti</span>
            <span className="font-semibold">₺{villa.pricing.cleaningFee.toLocaleString("tr-TR")}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/70 py-2">
            <span className="text-sm text-muted-foreground">Hizmet bedeli</span>
            <span className="font-semibold">₺{Math.round(estimate.serviceFee).toLocaleString("tr-TR")}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/70 py-2">
            <span className="text-sm text-muted-foreground">Hasar depozitosu</span>
            <span className="font-semibold">₺{villa.pricing.depositAmount.toLocaleString("tr-TR")}</span>
          </div>
          <div className="flex items-center justify-between pt-3">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Tahmini Toplam
            </span>
            <span className="text-3xl font-semibold tracking-tight text-primary">
              ₺{Math.round(estimate.total).toLocaleString("tr-TR")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
