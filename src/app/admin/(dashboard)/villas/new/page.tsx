import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createVillaAction } from "@/features/admin/actions";
import {
  getAdminDistrictOptions,
  getAdminModuleState,
  getAdminOwnerOptions,
  getAdminRegionOptions,
} from "@/features/admin/queries";

type NewVillaPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewVillaPage({ searchParams }: NewVillaPageProps) {
  const [moduleState, owners, regions, districts, resolved] = await Promise.all([
    getAdminModuleState(),
    getAdminOwnerOptions(),
    getAdminRegionOptions(),
    getAdminDistrictOptions(),
    searchParams,
  ]);
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-kicker">Yeni Villa</p>
        <h2 className="text-4xl font-semibold tracking-tight">Yeni villa oluştur</h2>
      </div>

      {moduleState.mode !== "database" ? (
        <DataSourceNotice
          tone={moduleState.mode === "demo" ? "warning" : "error"}
          title={moduleState.mode === "demo" ? "Demo modunda yazma kapalı" : "Villa oluşturma yapılandırma bekliyor"}
          body={moduleState.message}
        />
      ) : null}
      {error ? <DataSourceNotice tone="error" title="Villa oluşturulamadı" body={error} /> : null}

      <Card className="villawe-panel">
        <CardContent className="p-6">
          <form action={createVillaAction} className="grid gap-4 md:grid-cols-2">
            <Input name="title" placeholder="Villa başlığı" required />
            <Input name="slug" placeholder="villa-benzersiz-slug" required />
            <select name="ownerId" className="h-11 rounded-2xl border border-border bg-card px-4 text-sm" required>
              <option value="">Sahip / Acente seçin</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.label}
                </option>
              ))}
            </select>
            <select name="regionId" className="h-11 rounded-2xl border border-border bg-card px-4 text-sm" required>
              <option value="">Bölge seçin</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.label}
                </option>
              ))}
            </select>
            <select name="districtId" className="h-11 rounded-2xl border border-border bg-card px-4 text-sm" required>
              <option value="">İlçe seçin</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.label}
                </option>
              ))}
            </select>
            <Input name="maxGuests" type="number" min={1} placeholder="Maks misafir" required />
            <Input name="bedroomCount" type="number" min={1} placeholder="Yatak odası" required />
            <Input name="bathroomCount" type="number" min={1} placeholder="Banyo" required />
            <Input name="bedCount" type="number" min={1} placeholder="Yatak adedi" required />
            <Input name="basePrice" type="number" min={0} placeholder="Baz fiyat" required />
            <Input name="addressPublic" placeholder="Public adres özeti" required />
            <Input name="addressPrivate" placeholder="Private adres" required />
            <div className="md:col-span-2">
              <Textarea name="shortDescription" placeholder="Kısa açıklama" required rows={3} />
            </div>
            <div className="md:col-span-2">
              <Textarea name="description" placeholder="Detaylı açıklama" required rows={8} />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" className="rounded-full px-6">
                Taslak Villa Oluştur
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
