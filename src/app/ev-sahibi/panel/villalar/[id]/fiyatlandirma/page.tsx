import { notFound } from "next/navigation";

import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  deleteOwnerSeasonPriceAction,
  saveOwnerSeasonPriceAction,
  updateOwnerVillaPricingAction,
} from "@/features/owners/actions";
import { getOwnerVillaEditor } from "@/features/owners/queries";
import { requireOwnerSession } from "@/lib/auth/owner-authorization";

type OwnerVillaPricingPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OwnerVillaPricingPage({
  params,
  searchParams,
}: OwnerVillaPricingPageProps) {
  const session = await requireOwnerSession();
  const { id } = await params;
  const [villa, resolved] = await Promise.all([
    getOwnerVillaEditor(session.ownerId, id),
    searchParams,
  ]);

  if (!villa) {
    notFound();
  }

  const success = ["pricingSaved", "seasonSaved"].some((key) => resolved[key] === "1");
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-kicker">Fiyatlandırma</p>
        <h2 className="text-4xl font-semibold tracking-tight">{villa.title} fiyat yönetimi</h2>
      </div>

      {success ? (
        <DataSourceNotice tone="info" title="İşlem kaydedildi" body="Fiyatlandırma alanı güncellendi." />
      ) : null}
      {error ? <DataSourceNotice tone="error" title="İşlem tamamlanamadı" body={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="villawe-panel">
          <CardContent className="space-y-5 p-6">
            <h3 className="text-2xl font-semibold tracking-tight">Temel fiyat alanları</h3>
            <form action={updateOwnerVillaPricingAction} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="villaId" value={villa.id} />
              <Input name="basePrice" type="number" min={0} defaultValue={villa.basePrice} required />
              <Input name="cleaningFee" type="number" min={0} defaultValue={villa.cleaningFee} required />
              <Input name="depositAmount" type="number" min={0} defaultValue={villa.depositAmount} required />
              <select
                name="serviceFeeType"
                defaultValue={villa.serviceFeeType}
                className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
              >
                {["NONE", "FIXED", "PERCENTAGE", "INCLUDED"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <Input name="serviceFeeValue" type="number" min={0} defaultValue={villa.serviceFeeValue} required />
              <Input name="extraGuestFee" type="number" min={0} defaultValue={villa.extraGuestFee} required />
              <Input name="minNights" type="number" min={1} defaultValue={villa.minNights} required />
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" className="rounded-full">
                  Fiyatları Kaydet
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="villawe-panel">
          <CardContent className="space-y-5 p-6">
            <h3 className="text-2xl font-semibold tracking-tight">Sezon fiyatı ekle</h3>
            <form action={saveOwnerSeasonPriceAction} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="villaId" value={villa.id} />
              <Input name="name" placeholder="Yaz sezonu" required />
              <Input name="nightlyPrice" type="number" min={0} placeholder="Gecelik fiyat" required />
              <Input name="startDate" type="date" required />
              <Input name="endDate" type="date" required />
              <Input name="minNightsOverride" type="number" min={1} placeholder="Min gece (opsiyonel)" />
              <Input name="cleaningFeeOverride" type="number" min={0} placeholder="Temizlik override" />
              <Input name="depositOverride" type="number" min={0} placeholder="Depozito override" />
              <Input name="serviceFeeOverride" type="number" min={0} placeholder="Servis override" />
              <Input name="extraGuestFeeOverride" type="number" min={0} placeholder="Ek misafir override" />
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" variant="outline" className="rounded-full">
                  Sezon Kaydet
                </Button>
              </div>
            </form>

            <div className="space-y-3">
              {villa.seasonPrices.length ? (
                villa.seasonPrices.map((season) => (
                  <div key={season.id} className="villawe-soft-block">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{season.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {season.startDate} - {season.endDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="villawe-status-chip">
                          ₺{season.nightlyPrice.toLocaleString("tr-TR")}
                        </span>
                        <form action={deleteOwnerSeasonPriceAction}>
                          <input type="hidden" name="villaId" value={villa.id} />
                          <input type="hidden" name="seasonId" value={season.id} />
                          <Button type="submit" variant="outline" className="rounded-full">
                            Sil
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-muted-foreground">
                  Henüz sezon fiyatı eklenmedi.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
