"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CircleAlert, ShieldCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { calculateVillaEstimate } from "@/features/bookings/pricing";
import type { VillaDetail } from "@/features/villas/types";

type VillaPriceInquiryCardProps = {
  villa: VillaDetail;
  action: (formData: FormData) => void | Promise<void>;
};

export function VillaPriceInquiryCard({
  villa,
  action,
}: VillaPriceInquiryCardProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guestCount, setGuestCount] = useState(String(Math.min(villa.maxGuests, 2)));
  const estimate = useMemo(
    () => calculateVillaEstimate(villa, startDate, endDate, Number(guestCount)),
    [endDate, guestCount, startDate, villa],
  );

  return (
    <div className="villawe-floating-card lg:sticky lg:top-28">
      <div className="space-y-6 p-5 sm:p-6">
        <div className="space-y-3">
          <p className="section-kicker">Fiyat & Talep</p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Başlangıç gecelik fiyat</p>
              <p className="text-4xl font-semibold tracking-tight text-primary">
                ₺{villa.pricing.basePrice.toLocaleString("tr-TR")}
              </p>
            </div>
            <div className="rounded-full border border-success/18 bg-success/10 px-3 py-2 text-xs font-semibold text-success">
              Net fiyat
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full border border-border/70 bg-muted/72 px-3 py-2 text-primary-dark">
              Minimum {villa.pricing.minNights} gece
            </span>
            <span className="rounded-full border border-border/70 bg-muted/72 px-3 py-2 text-primary-dark">
              En fazla {villa.maxGuests} misafir
            </span>
          </div>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="villaSlug" value={villa.slug} />

          <div className="grid gap-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Giriş tarihi</span>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="startDate"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="h-12 w-full rounded-[1.3rem] border border-input bg-card pr-4 pl-11 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
                />
              </div>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Çıkış tarihi</span>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="endDate"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="h-12 w-full rounded-[1.3rem] border border-input bg-card pr-4 pl-11 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
                />
              </div>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Misafir sayısı</span>
              <div className="relative">
                <Users className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="guestCount"
                  type="number"
                  min={1}
                  max={villa.maxGuests}
                  value={guestCount}
                  onChange={(event) => setGuestCount(event.target.value)}
                  className="h-12 w-full rounded-[1.3rem] border border-input bg-card pr-4 pl-11 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
                />
              </div>
            </label>
          </div>

          <div className="rounded-[1.6rem] border border-border/80 bg-muted/70 p-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-3">
                <span className="text-muted-foreground">
                  {estimate.nights > 0
                    ? `${estimate.nights} gece x ₺${villa.pricing.basePrice.toLocaleString("tr-TR")}`
                    : "Başlangıç gecelik fiyat"}
                </span>
                <span className="font-semibold text-foreground">
                  ₺{Math.round(estimate.nightlySubtotal).toLocaleString("tr-TR")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Temizlik ücreti</span>
                <span className="font-medium">₺{villa.pricing.cleaningFee.toLocaleString("tr-TR")}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Hizmet bedeli</span>
                <span className="font-medium">₺{Math.round(estimate.serviceFee).toLocaleString("tr-TR")}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Depozito</span>
                <span className="font-medium">₺{villa.pricing.depositAmount.toLocaleString("tr-TR")}</span>
              </div>
              <div className="mt-4 rounded-[1.25rem] bg-card px-4 py-4 shadow-[0_16px_34px_-28px_rgba(18,110,130,0.2)]">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      Tahmini Toplam
                    </p>
                    <p className="mt-1 text-xs leading-6 text-muted-foreground">
                      {estimate.nights > 0
                        ? "Temizlik ve hizmet bedeli dahil."
                        : "Tarih seçerek toplamı görün."}
                    </p>
                  </div>
                  <p className="text-3xl font-semibold tracking-tight text-primary">
                    ₺{Math.round(estimate.total).toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>
              <p className="pt-1 text-xs leading-6 text-muted-foreground">
                Depozito toplam tahmine dahil değildir.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Ad Soyad</span>
              <input
                name="fullName"
                placeholder="Ad Soyad"
                required
                className="h-12 w-full rounded-[1.3rem] border border-input bg-card px-4 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">E-posta</span>
              <input
                name="email"
                type="email"
                placeholder="ornek@mail.com"
                required
                className="h-12 w-full rounded-[1.3rem] border border-input bg-card px-4 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Telefon</span>
              <input
                name="phone"
                placeholder="+90 5xx xxx xx xx"
                required
                className="h-12 w-full rounded-[1.3rem] border border-input bg-card px-4 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Mesajınız</span>
              <textarea
                name="message"
                rows={4}
                placeholder="Özel bir notunuz veya ek sorunuz varsa paylaşın."
                className="w-full rounded-[1.3rem] border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
              />
            </label>
          </div>

          <div className="space-y-3 rounded-[1.5rem] border border-warning/24 bg-warning/10 px-4 py-4">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
              <p className="text-sm leading-7 text-foreground">
                Platform dışı ödeme yapmayın. Ödeme ve depozito detaylarını Villawe üzerinden teyit edin.
              </p>
            </div>

            <label className="flex items-start gap-3 text-sm leading-6 text-foreground">
              <input
                type="checkbox"
                name="depositWarningAcknowledged"
                value="1"
                required
                className="mt-1 size-4 rounded border border-input accent-[var(--primary)]"
              />
              <span>Depozito ve ek ücretleri gördüm.</span>
            </label>

            <label className="flex items-start gap-3 text-sm leading-6 text-foreground">
              <input
                type="checkbox"
                name="offPlatformPaymentWarningAcknowledged"
                value="1"
                required
                className="mt-1 size-4 rounded border border-input accent-[var(--primary)]"
              />
              <span>Ödemeyi yalnızca teyitli akışta yapacağım.</span>
            </label>
          </div>

          <Button type="submit" variant="accent" size="lg" className="h-13 w-full rounded-[1.4rem]">
            <ShieldCheck className="size-4" />
            Müsaitlik Sor
          </Button>
        </form>
      </div>
    </div>
  );
}
