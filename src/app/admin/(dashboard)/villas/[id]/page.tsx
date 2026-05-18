import Link from "next/link";
import { notFound } from "next/navigation";

import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createAvailabilityBlockAction,
  deleteVillaDocumentAction,
  deleteVillaMediaAction,
  setVillaCoverAction,
  toggleVillaDocumentVerificationAction,
  updateVillaBasicsAction,
  updateVillaMediaAction,
  updateVillaPricingAction,
  updateVillaStatusAction,
  updateVillaVerificationAction,
  uploadVillaAssetAction,
} from "@/features/admin/actions";
import {
  getAdminDistrictOptions,
  getAdminModuleState,
  getAdminOwnerOptions,
  getAdminRegionOptions,
  getAdminVillaEditor,
} from "@/features/admin/queries";

type AdminVillaDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function checkboxField(name: string, label: string, checked: boolean) {
  return (
    <label
      key={name}
      className="villawe-check-tile"
    >
      <input type="checkbox" name={name} value="1" defaultChecked={checked} />
      <span>{label}</span>
    </label>
  );
}

export default async function AdminVillaDetailPage({
  params,
  searchParams,
}: AdminVillaDetailPageProps) {
  const { id } = await params;
  const [moduleState, villa, owners, regions, districts, resolved] = await Promise.all([
    getAdminModuleState(),
    getAdminVillaEditor(id),
    getAdminOwnerOptions(),
    getAdminRegionOptions(),
    getAdminDistrictOptions(),
    searchParams,
  ]);

  if (!villa) {
    notFound();
  }

  const feedback = [
    "created",
    "saved",
    "statusSaved",
    "verificationSaved",
    "pricingSaved",
    "availabilitySaved",
    "uploadSaved",
    "mediaSaved",
    "documentSaved",
  ].find((key) => resolved[key] === "1");
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <p className="section-kicker">Villa Düzenleme</p>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-4xl font-semibold tracking-tight">{villa.title}</h2>
            <span className="villawe-status-chip">
              {villa.status}
            </span>
            <span className="villawe-status-chip">
              {villa.verificationStatus}
            </span>
          </div>
        </div>
        <Link
          href={`/villalar/${villa.slug}`}
          className={buttonVariants({
            variant: "outline",
            className: "rounded-full",
          })}
        >
          Public Önizleme
        </Link>
      </div>

      {moduleState.mode !== "database" ? (
        <DataSourceNotice
          tone={moduleState.mode === "demo" ? "warning" : "error"}
          title={moduleState.mode === "demo" ? "Demo villa editörü" : "Villa editörü yapılandırma bekliyor"}
          body={moduleState.message}
        />
      ) : null}
      {feedback ? (
        <DataSourceNotice tone="info" title="İşlem kaydedildi" body="Villa yönetim aksiyonu başarıyla uygulandı." />
      ) : null}
      {error ? <DataSourceNotice tone="error" title="İşlem tamamlanamadı" body={error} /> : null}

      {villa.publishWarnings.length ? (
        <DataSourceNotice
          tone="warning"
          title="Yayın öncesi eksikler"
          body={villa.publishWarnings.join(" ")}
        />
      ) : (
        <DataSourceNotice
          tone="info"
          title="Yayın kontrolleri hazır"
          body="Bu villa temel yayın kontrolünden geçti. Son karar yine admin yayın aksiyonuyla verilir."
        />
      )}

      <Card className="villawe-panel">
        <CardContent className="flex flex-wrap gap-3 p-6">
          {[
            ["DRAFT", "Taslak"],
            ["PENDING_REVIEW", "İncelemeye Al"],
            ["PUBLISHED", "Yayına Al"],
            ["SUSPENDED", "Askıya Al"],
            ["ARCHIVED", "Arşivle"],
          ].map(([status, label]) => (
            <form key={status} action={updateVillaStatusAction}>
              <input type="hidden" name="villaId" value={villa.id} />
              <input type="hidden" name="status" value={status} />
              <Button type="submit" variant="outline" className="rounded-full">
                {label}
              </Button>
            </form>
          ))}
          <Link
            href="/admin/audit-logs"
            className={buttonVariants({ variant: "ghost", className: "rounded-full" })}
          >
            Audit Kaydına Git
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="villawe-panel">
          <CardContent className="p-6">
            <form action={updateVillaBasicsAction} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="villaId" value={villa.id} />
              <input type="hidden" name="status" value={villa.status} />
              <Input name="title" defaultValue={villa.title} required />
              <Input name="slug" defaultValue={villa.slug} required />
              <select
                name="ownerId"
                defaultValue={villa.ownerId}
                className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
                required
              >
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.label}
                  </option>
                ))}
              </select>
              <select
                name="regionId"
                defaultValue={villa.regionId}
                className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
                required
              >
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.label}
                  </option>
                ))}
              </select>
              <select
                name="districtId"
                defaultValue={villa.districtId}
                className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
                required
              >
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.label}
                  </option>
                ))}
              </select>
              <Input name="checkInTime" defaultValue={villa.checkInTime} required />
              <Input name="checkOutTime" defaultValue={villa.checkOutTime} required />
              <Input name="maxGuests" type="number" min={1} defaultValue={villa.maxGuests} required />
              <Input name="bedroomCount" type="number" min={1} defaultValue={villa.bedroomCount} required />
              <Input name="bathroomCount" type="number" min={1} defaultValue={villa.bathroomCount} required />
              <Input name="bedCount" type="number" min={1} defaultValue={villa.bedCount} required />
              <Input name="basePrice" type="number" min={0} defaultValue={villa.basePrice} required />
              <Input name="addressPublic" defaultValue={villa.addressPublic} required />
              <Input name="addressPrivate" defaultValue={villa.addressPrivate} required />
              <div className="md:col-span-2">
                <Textarea name="shortDescription" rows={3} defaultValue={villa.shortDescription} required />
              </div>
              <div className="md:col-span-2">
                <Textarea name="description" rows={8} defaultValue={villa.description} required />
              </div>
              <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
                {checkboxField("hasPrivatePool", "Özel havuz", villa.features.hasPrivatePool)}
                {checkboxField("hasHeatedPool", "Isıtmalı havuz", villa.features.hasHeatedPool)}
                {checkboxField("hasJacuzzi", "Jakuzi", villa.features.hasJacuzzi)}
                {checkboxField("isShelteredPool", "Korunaklı havuz", villa.features.isShelteredPool)}
                {checkboxField("isConservativeFriendly", "Muhafazakar uyumlu", villa.features.isConservativeFriendly)}
                {checkboxField("isPetFriendly", "Evcil hayvan dostu", villa.features.isPetFriendly)}
                {checkboxField("isChildFriendly", "Çocuk dostu", villa.features.isChildFriendly)}
                {checkboxField("hasSeaView", "Deniz manzarası", villa.features.hasSeaView)}
                {checkboxField("hasNatureView", "Doğa manzarası", villa.features.hasNatureView)}
                {checkboxField("nearBeach", "Plaja yakın", villa.features.nearBeach)}
                {checkboxField("nearCenter", "Merkeze yakın", villa.features.nearCenter)}
                {checkboxField("hasBarbecue", "Barbekü", villa.features.hasBarbecue)}
                {checkboxField("hasFireplace", "Şömine", villa.features.hasFireplace)}
                {checkboxField("hasParking", "Otopark", villa.features.hasParking)}
                {checkboxField("hasAirConditioning", "Klima", villa.features.hasAirConditioning)}
                {checkboxField("hasInternet", "İnternet", villa.features.hasInternet)}
                {checkboxField("isWheelchairFriendly", "Erişilebilir", villa.features.isWheelchairFriendly)}
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" className="rounded-full px-6">
                  Temel Bilgileri Kaydet
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="villawe-panel">
            <CardContent className="p-6">
              <form action={updateVillaVerificationAction} className="space-y-4">
                <input type="hidden" name="villaId" value={villa.id} />
                <h3 className="text-3xl font-semibold tracking-tight">Doğrulama checklist</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {checkboxField("identityVerified", "Kimlik doğrulandı", villa.verification.identityVerified)}
                  {checkboxField("ownershipOrAuthorityVerified", "Yetki doğrulandı", villa.verification.ownershipOrAuthorityVerified)}
                  {checkboxField("tourismPermitVerified", "Turizm izni doğrulandı", villa.verification.tourismPermitVerified)}
                  {checkboxField("locationVerified", "Konum doğrulandı", villa.verification.locationVerified)}
                  {checkboxField("photosVerified", "Fotoğraflar doğrulandı", villa.verification.photosVerified)}
                  {checkboxField("phoneVerified", "Telefon doğrulandı", villa.verification.phoneVerified)}
                </div>
                <Textarea
                  name="verificationNotes"
                  rows={5}
                  defaultValue={villa.verification.verificationNotes}
                  placeholder="Admin doğrulama notları"
                />
                <Button type="submit" className="rounded-full px-6">
                  Doğrulamayı Kaydet
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="villawe-panel">
            <CardContent className="p-6">
              <form action={updateVillaPricingAction} className="grid gap-4 md:grid-cols-2">
                <input type="hidden" name="villaId" value={villa.id} />
                <h3 className="md:col-span-2 text-3xl font-semibold tracking-tight">Fiyat alanları</h3>
                <Input name="basePrice" type="number" defaultValue={villa.basePrice} />
                <Input name="cleaningFee" type="number" defaultValue={villa.cleaningFee} />
                <Input name="depositAmount" type="number" defaultValue={villa.depositAmount} />
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
                <Input name="serviceFeeValue" type="number" defaultValue={villa.serviceFeeValue} />
                <Input name="extraGuestFee" type="number" defaultValue={villa.extraGuestFee} />
                <Input name="minNights" type="number" defaultValue={villa.minNights} />
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" className="rounded-full px-6">
                    Fiyatı Kaydet
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="villawe-panel">
            <CardContent className="space-y-5 p-6">
              <h3 className="text-3xl font-semibold tracking-tight">Müsaitlik blokeleri</h3>
              <form action={createAvailabilityBlockAction} className="grid gap-4 md:grid-cols-2">
                <input type="hidden" name="villaId" value={villa.id} />
                <Input name="startDate" type="date" required />
                <Input name="endDate" type="date" required />
                <select name="type" className="h-11 rounded-2xl border border-border bg-card px-4 text-sm">
                  {["BLOCKED", "HOLD", "RESERVED", "MAINTENANCE", "OWNER_USE"].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <Input name="reason" placeholder="Neden / açıklama" />
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" className="rounded-full px-6">
                    Bloke Ekle
                  </Button>
                </div>
              </form>

              <div className="space-y-3">
                {villa.availabilityBlocks.length ? (
                  villa.availabilityBlocks.map((block) => (
                    <div key={block.id} className="villawe-soft-block text-sm">
                      <p className="font-semibold">{block.type}</p>
                      <p className="text-muted-foreground">
                        {block.startDate} - {block.endDate}
                      </p>
                      {block.reason ? <p className="text-muted-foreground">{block.reason}</p> : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-7 text-muted-foreground">
                    Henüz blok kaydı bulunmuyor.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="villawe-panel">
          <CardContent className="space-y-5 p-6">
            <div className="space-y-1">
              <h3 className="text-3xl font-semibold tracking-tight">Medya yönetimi</h3>
              <p className="text-sm text-muted-foreground">
                Görsel yükle, kapak seç, sıra düzenle ve sil.
              </p>
            </div>

            <form action={uploadVillaAssetAction} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="villaId" value={villa.id} />
              <input type="hidden" name="assetType" value="media" />
              <Input name="altText" placeholder="Görsel alt metni" />
              <div className="md:col-span-2">
                <input type="file" name="file" className="block w-full text-sm" required />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" variant="outline" className="rounded-full">
                  Görsel Yükle
                </Button>
              </div>
            </form>

            <div className="space-y-4">
              {villa.media.length ? (
                villa.media.map((media) => (
                  <div key={media.id} className="villawe-soft-block">
                    <form action={updateVillaMediaAction} className="grid gap-3 md:grid-cols-[1fr_140px_auto_auto]">
                      <input type="hidden" name="villaId" value={villa.id} />
                      <input type="hidden" name="mediaId" value={media.id} />
                      <Input name="altText" defaultValue={media.altText} required />
                      <Input name="sortOrder" type="number" defaultValue={media.sortOrder} min={0} required />
                      <Button type="submit" variant="outline" className="rounded-full">
                        Kaydet
                      </Button>
                    </form>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={media.url} target="_blank" className="text-sm text-primary underline-offset-4 hover:underline">
                        {media.originalName}
                      </a>
                      {media.isCover ? <span className="villawe-status-chip">Kapak</span> : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {!media.isCover ? (
                        <form action={setVillaCoverAction}>
                          <input type="hidden" name="villaId" value={villa.id} />
                          <input type="hidden" name="mediaId" value={media.id} />
                          <Button type="submit" variant="outline" className="rounded-full">
                            Kapak Yap
                          </Button>
                        </form>
                      ) : null}
                      <form action={deleteVillaMediaAction}>
                        <input type="hidden" name="villaId" value={villa.id} />
                        <input type="hidden" name="mediaId" value={media.id} />
                        <Button type="submit" variant="outline" className="rounded-full">
                          Sil
                        </Button>
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-muted-foreground">
                  Henüz villa görseli yüklenmedi.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="villawe-panel">
          <CardContent className="space-y-5 p-6">
            <div className="space-y-1">
              <h3 className="text-3xl font-semibold tracking-tight">Belge yönetimi</h3>
              <p className="text-sm text-muted-foreground">
                Yetki, turizm izni ve diğer doğrulama belgelerini buradan yönetin.
              </p>
            </div>

            <form action={uploadVillaAssetAction} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="villaId" value={villa.id} />
              <input type="hidden" name="assetType" value="document" />
              <select
                name="documentType"
                className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
                defaultValue="tourism_permit"
              >
                <option value="tourism_permit">tourism_permit</option>
                <option value="ownership_or_authority">ownership_or_authority</option>
                <option value="identity">identity</option>
                <option value="tax_or_business_document">tax_or_business_document</option>
                <option value="other">other</option>
              </select>
              <Input name="note" placeholder="Belge notu" />
              <div className="md:col-span-2">
                <input type="file" name="file" className="block w-full text-sm" required />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" variant="outline" className="rounded-full">
                  Belge Yükle
                </Button>
              </div>
            </form>

            <div className="space-y-4">
              {villa.documents.length ? (
                villa.documents.map((document) => (
                  <div key={document.id} className="villawe-soft-block">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{document.documentType}</p>
                        <a href={document.url} target="_blank" className="text-sm text-primary underline-offset-4 hover:underline">
                          {document.originalName}
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <form action={toggleVillaDocumentVerificationAction}>
                          <input type="hidden" name="villaId" value={villa.id} />
                          <input type="hidden" name="documentId" value={document.id} />
                          {document.isVerified ? null : <input type="hidden" name="isVerified" value="1" />}
                          <Button type="submit" variant="outline" className="rounded-full">
                            {document.isVerified ? "Doğrulanmış" : "Doğrula"}
                          </Button>
                        </form>
                        <form action={deleteVillaDocumentAction}>
                          <input type="hidden" name="villaId" value={villa.id} />
                          <input type="hidden" name="documentId" value={document.id} />
                          <Button type="submit" variant="outline" className="rounded-full">
                            Sil
                          </Button>
                        </form>
                      </div>
                    </div>
                    {document.note ? (
                      <p className="mt-2 text-sm text-muted-foreground">{document.note}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-muted-foreground">
                  Henüz villa dokümanı yüklenmedi.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
