import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createOwnerVillaAction } from "@/features/owners/actions";
import { getOwnerFormOptions, getOwnerModuleState } from "@/features/owners/queries";

type OwnerNewVillaPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OwnerNewVillaPage({
  searchParams,
}: OwnerNewVillaPageProps) {
  const [moduleState, options, resolved] = await Promise.all([
    getOwnerModuleState(),
    getOwnerFormOptions(),
    searchParams,
  ]);
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-kicker">Yeni Villa</p>
        <h2 className="text-4xl font-semibold tracking-tight">Yeni villa taslağı oluşturun</h2>
      </div>

      {moduleState.mode !== "database" ? (
        <DataSourceNotice
          tone={moduleState.mode === "demo" ? "warning" : "error"}
          title="Veri kaynağı uyarısı"
          body={moduleState.message}
        />
      ) : null}
      {error ? (
        <DataSourceNotice tone="error" title="Villa oluşturulamadı" body={error} />
      ) : null}

      <Card className="villawe-panel">
        <CardContent className="p-6">
          <form action={createOwnerVillaAction} className="grid gap-4 md:grid-cols-2">
            <Input name="title" placeholder="Villa adı" required />
            <Input name="basePrice" type="number" min={0} placeholder="Başlangıç gece fiyatı" required />
            <select
              name="regionId"
              className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
              required
              defaultValue=""
            >
              <option value="" disabled>Bölge seçin</option>
              {options.regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.label}
                </option>
              ))}
            </select>
            <select
              name="districtId"
              className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
              required
              defaultValue=""
            >
              <option value="" disabled>İlçe seçin</option>
              {options.districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.label}
                </option>
              ))}
            </select>
            <Input name="maxGuests" type="number" min={1} placeholder="Maksimum misafir" required />
            <Input name="bedroomCount" type="number" min={1} placeholder="Yatak odası sayısı" required />
            <Input name="bathroomCount" type="number" min={1} placeholder="Banyo sayısı" required />
            <Input name="bedCount" type="number" min={1} placeholder="Toplam yatak sayısı" required />
            <Input name="addressPublic" placeholder="Yaklaşık konum" required />
            <Input name="addressPrivate" placeholder="Açık adres (admin-only)" required />
            <div className="md:col-span-2">
              <Textarea name="shortDescription" rows={3} placeholder="Kısa açıklama" required />
            </div>
            <div className="md:col-span-2">
              <Textarea name="description" rows={7} placeholder="Detaylı açıklama" required />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" className="rounded-full px-6">
                Taslağı Oluştur
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
