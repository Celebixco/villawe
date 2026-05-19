import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  submitOwnerVillaForReviewAction,
  updateOwnerVillaBasicsAction,
} from "@/features/owners/actions";
import { getOwnerFormOptions, getOwnerVillaEditor } from "@/features/owners/queries";
import { requireOwnerSession } from "@/lib/auth/owner-authorization";

type OwnerVillaDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function checkboxField(name: string, label: string, checked: boolean) {
  return (
    <label key={name} className="villawe-check-tile">
      <input type="checkbox" name={name} value="1" defaultChecked={checked} />
      <span>{label}</span>
    </label>
  );
}

export default async function OwnerVillaDetailPage({
  params,
  searchParams,
}: OwnerVillaDetailPageProps) {
  const session = await requireOwnerSession();
  const { id } = await params;
  const [villa, options, resolved] = await Promise.all([
    getOwnerVillaEditor(session.ownerId, id),
    getOwnerFormOptions(),
    searchParams,
  ]);

  if (!villa) {
    notFound();
  }

  const feedback = ["created", "saved", "reviewRequested"].find((key) => resolved[key] === "1");
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <p className="section-kicker">İlan Düzenleme</p>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-4xl font-semibold tracking-tight">{villa.title}</h2>
            <span className="villawe-status-chip">{villa.status}</span>
            <span className="villawe-status-chip">{villa.verificationStatus}</span>
          </div>
          {villa.reviewRequestedAt ? (
            <p className="text-sm text-muted-foreground">
              Son inceleme talebi: {new Date(villa.reviewRequestedAt).toLocaleString("tr-TR")}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/ev-sahibi/panel/villalar/${villa.id}/fotograflar` as Route}
            className={buttonVariants({ variant: "outline", className: "rounded-full" })}
          >
            Fotoğraflar
          </Link>
          <Link
            href={`/ev-sahibi/panel/villalar/${villa.id}/belgeler` as Route}
            className={buttonVariants({ variant: "outline", className: "rounded-full" })}
          >
            Belgeler
          </Link>
          <Link
            href={`/ev-sahibi/panel/villalar/${villa.id}/fiyatlandirma` as Route}
            className={buttonVariants({ variant: "outline", className: "rounded-full" })}
          >
            Fiyatlandırma
          </Link>
          <Link
            href={`/ev-sahibi/panel/villalar/${villa.id}/musaitlik` as Route}
            className={buttonVariants({ variant: "outline", className: "rounded-full" })}
          >
            Müsaitlik
          </Link>
        </div>
      </div>

      {feedback ? (
        <DataSourceNotice
          tone="info"
          title="İşlem kaydedildi"
          body="İlan kaydınız güncellendi."
        />
      ) : null}
      {error ? (
        <DataSourceNotice tone="error" title="İşlem tamamlanamadı" body={error} />
      ) : null}
      {villa.ownerRevisionNotes ? (
        <DataSourceNotice
          tone="warning"
          title="Admin revizyon notu"
          body={villa.ownerRevisionNotes}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="villawe-panel">
          <CardContent className="p-6">
            <form action={updateOwnerVillaBasicsAction} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="villaId" value={villa.id} />
              <Input name="title" defaultValue={villa.title} required />
              <Input name="basePrice" type="number" min={0} defaultValue={villa.basePrice} required />
              <select
                name="regionId"
                defaultValue={villa.regionId}
                className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
                required
              >
                {options.regions.map((region) => (
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
                {options.districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.label}
                  </option>
                ))}
              </select>
              <Input name="checkInTime" defaultValue={villa.checkInTime} required />
              <Input name="checkOutTime" defaultValue={villa.checkOutTime} required />
              <Input name="minNights" type="number" min={1} defaultValue={villa.minNights} required />
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
              <Input name="maxGuests" type="number" min={1} defaultValue={villa.maxGuests} required />
              <Input name="bedroomCount" type="number" min={1} defaultValue={villa.bedroomCount} required />
              <Input name="bathroomCount" type="number" min={1} defaultValue={villa.bathroomCount} required />
              <Input name="bedCount" type="number" min={1} defaultValue={villa.bedCount} required />
              <Input name="addressPublic" defaultValue={villa.addressPublic} required />
              <Input name="addressPrivate" defaultValue={villa.addressPrivate} required />
              <div className="md:col-span-2">
                <Textarea
                  name="shortDescription"
                  rows={3}
                  defaultValue={villa.shortDescription}
                  required
                />
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
                {checkboxField("isFamilyFriendly", "Aile dostu", villa.features.isFamilyFriendly)}
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

              <div className="md:col-span-2 grid gap-4 xl:grid-cols-2">
                <div className="space-y-3 rounded-[1.5rem] border border-border/80 bg-muted/45 p-4">
                  <h3 className="text-lg font-semibold">Özellikler</h3>
                  <div className="grid gap-2">
                    {options.amenities.map((amenity) => (
                      <label key={amenity.id} className="villawe-check-tile">
                        <input
                          type="checkbox"
                          name="amenities"
                          value={amenity.id}
                          defaultChecked={villa.amenityIds.includes(amenity.id)}
                        />
                        <span>{amenity.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-[1.5rem] border border-border/80 bg-muted/45 p-4">
                  <h3 className="text-lg font-semibold">Konseptler</h3>
                  <div className="grid gap-2">
                    {options.concepts.map((concept) => (
                      <label key={concept.id} className="villawe-check-tile">
                        <input
                          type="checkbox"
                          name="concepts"
                          value={concept.id}
                          defaultChecked={villa.conceptIds.includes(concept.id)}
                        />
                        <span>{concept.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <select
                name="cancellationPolicyId"
                defaultValue={villa.cancellationPolicyId || ""}
                className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
              >
                <option value="">İptal politikası seçin</option>
                {options.cancellationPolicies.map((policy) => (
                  <option key={policy.id} value={policy.id}>
                    {policy.label}
                  </option>
                ))}
              </select>
              <select
                name="depositPolicyId"
                defaultValue={villa.depositPolicyId || ""}
                className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
              >
                <option value="">Depozito politikası seçin</option>
                {options.depositPolicies.map((policy) => (
                  <option key={policy.id} value={policy.id}>
                    {policy.label}
                  </option>
                ))}
              </select>
              <div className="md:col-span-2">
                <Textarea
                  name="houseRules"
                  rows={5}
                  defaultValue={villa.houseRules.join("\n")}
                  placeholder="Her satıra bir kural"
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  name="poolDetails"
                  rows={4}
                  defaultValue={villa.poolDetails.join("\n")}
                  placeholder="Havuz ve bahçe detayları"
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  name="nearbyPlaces"
                  rows={4}
                  defaultValue={villa.nearbyPlaces.join("\n")}
                  placeholder="Yakın noktalar"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" className="rounded-full px-6">
                  İlan Bilgilerini Kaydet
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="villawe-panel">
            <CardContent className="space-y-4 p-6">
              <h3 className="text-3xl font-semibold tracking-tight">Submission checklist</h3>
              <div className="space-y-3">
                {villa.checklist.map((item) => (
                  <div key={item.key} className="villawe-soft-block">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{item.label}</p>
                      <span className="villawe-status-chip">
                        {item.complete ? "Tamamlandı" : "Eksik"}
                      </span>
                    </div>
                    {item.message ? (
                      <p className="mt-2 text-sm text-muted-foreground">{item.message}</p>
                    ) : null}
                  </div>
                ))}
              </div>
              <form action={submitOwnerVillaForReviewAction}>
                <input type="hidden" name="villaId" value={villa.id} />
                <Button type="submit" className="w-full rounded-full">
                  İlanınızı İncelemeye Gönder
                </Button>
              </form>
              <p className="text-sm leading-7 text-muted-foreground">
                Yayına alınmadan önce Villawe ekibi tarafından doğrulanır.
              </p>
            </CardContent>
          </Card>

          <Card className="villawe-panel">
            <CardContent className="space-y-3 p-6">
              <h3 className="text-2xl font-semibold tracking-tight">Hızlı bağlantılar</h3>
              <div className="grid gap-3">
                <Link href={`/ev-sahibi/panel/villalar/${villa.id}/fotograflar` as Route} className={buttonVariants({ variant: "outline", className: "justify-start rounded-full" })}>
                  Fotoğraf yükle ve kapak seç
                </Link>
                <Link href={`/ev-sahibi/panel/villalar/${villa.id}/belgeler` as Route} className={buttonVariants({ variant: "outline", className: "justify-start rounded-full" })}>
                  Belgeleri yönet
                </Link>
                <Link href={`/ev-sahibi/panel/villalar/${villa.id}/fiyatlandirma` as Route} className={buttonVariants({ variant: "outline", className: "justify-start rounded-full" })}>
                  Fiyat ve sezon yönetimi
                </Link>
                <Link href={`/ev-sahibi/panel/villalar/${villa.id}/musaitlik` as Route} className={buttonVariants({ variant: "outline", className: "justify-start rounded-full" })}>
                  Müsaitlik blokeleri
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
