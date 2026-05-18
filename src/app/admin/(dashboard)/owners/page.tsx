import Link from "next/link";

import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  archiveOwnerAction,
  deleteOwnerDocumentAction,
  saveOwnerAction,
  toggleOwnerDocumentVerificationAction,
  uploadOwnerDocumentAction,
} from "@/features/admin/actions";
import { getAdminModuleState, getAdminOwners } from "@/features/admin/queries";

type AdminOwnersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminOwnersPage({
  searchParams,
}: AdminOwnersPageProps) {
  const [moduleState, owners, resolved] = await Promise.all([
    getAdminModuleState(),
    getAdminOwners(),
    searchParams,
  ]);
  const selectedOwnerId =
    typeof resolved.ownerId === "string" ? resolved.ownerId : undefined;
  const owner = owners.find((item) => item.id === selectedOwnerId) || null;
  const isCreatingNew = resolved.new === "1" || !owner;
  const success = ["saved", "documentSaved"].some((key) => resolved[key] === "1");
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-kicker">Sahip Yönetimi</p>
          <h2 className="text-4xl font-semibold tracking-tight">Sahipler ve acenteler</h2>
        </div>
        <Link href={{ pathname: "/admin/owners", query: { new: "1" } }} className={buttonVariants({ className: "rounded-full" })}>
          Yeni sahip
        </Link>
      </div>

      {moduleState.mode === "demo" ? (
        <DataSourceNotice
          tone="warning"
          title="Demo owner verisi"
          body={`${moduleState.message} Bu modda kartlar örnek içerik gösterir, kayıt işlemleri gerçek DB gerektirir.`}
        />
      ) : null}
      {moduleState.mode === "unavailable" || moduleState.mode === "error" ? (
        <DataSourceNotice
          tone="error"
          title="Sahip modülü yapılandırma bekliyor"
          body={moduleState.message}
        />
      ) : null}
      {success ? (
        <DataSourceNotice tone="info" title="İşlem kaydedildi" body="Sahip kaydı veya doküman akışı güncellendi." />
      ) : null}
      {error ? <DataSourceNotice tone="error" title="İşlem tamamlanamadı" body={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {owners.length ? (
            owners.map((item) => (
              <Card key={item.id} className="villawe-panel">
                <CardContent className="space-y-3 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight">{item.displayName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.type} · {item.villaCount} villa · {item.isActive ? "Aktif" : "Pasif"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={{ pathname: "/admin/owners", query: { ownerId: item.id } }}
                        className={buttonVariants({ variant: "outline", className: "rounded-full" })}
                      >
                        Düzenle
                      </Link>
                      <form action={archiveOwnerAction}>
                        <input type="hidden" name="ownerId" value={item.id} />
                        <Button type="submit" variant="outline" className="rounded-full">
                          Pasife Al
                        </Button>
                      </form>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.email}</p>
                  <p className="text-sm text-muted-foreground">{item.phone}</p>
                  {item.documents.length ? (
                    <div className="flex flex-wrap gap-2 text-sm">
                      {item.documents.map((document) => (
                        <span key={document.id} className="villawe-status-chip">
                          {document.documentType} · {document.isVerified ? "Doğrulandı" : "Bekliyor"}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Henüz doküman yüklenmedi.</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="villawe-soft-panel border-dashed">
              <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
                Henüz owner kaydı bulunmuyor. İlk sahip kaydını bu sayfadan oluşturabilirsiniz.
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="villawe-panel">
            <CardContent className="p-6">
              <form action={saveOwnerAction} className="grid gap-4">
                {owner && !isCreatingNew ? (
                  <input type="hidden" name="ownerId" value={owner.id} />
                ) : null}
                <div className="grid gap-4 md:grid-cols-2">
                  <select
                    name="type"
                    defaultValue={owner?.type || "AGENCY"}
                    className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
                  >
                    <option value="AGENCY">Agency</option>
                    <option value="INDIVIDUAL">Individual</option>
                  </select>
                  <Input name="displayName" defaultValue={owner?.displayName} placeholder="Görünen ad" required />
                  <Input name="legalName" defaultValue={owner?.legalName} placeholder="Yasal ünvan" />
                  <Input name="contactName" defaultValue={owner?.contactName} placeholder="Yetkili kişi" />
                  <Input name="email" type="email" defaultValue={owner?.email} placeholder="E-posta" required />
                  <Input name="phone" defaultValue={owner?.phone} placeholder="Telefon" required />
                  <Input name="taxNumber" defaultValue={owner?.taxNumber} placeholder="Vergi no" />
                  <label className="villawe-check-tile">
                    <input type="checkbox" name="isActive" value="1" defaultChecked={owner?.isActive ?? true} />
                    <span>Aktif owner kaydı</span>
                  </label>
                </div>
                <Textarea name="notes" rows={5} defaultValue={owner?.notes} placeholder="Operasyon notları" />
                <div className="flex justify-end">
                  <Button type="submit" className="rounded-full px-6">
                    {owner && !isCreatingNew ? "Sahibi Kaydet" : "Sahip Oluştur"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {owner ? (
            <Card className="villawe-panel">
              <CardContent className="space-y-5 p-6">
                <div className="space-y-1">
                  <h3 className="text-3xl font-semibold tracking-tight">Sahip dokümanları</h3>
                  <p className="text-sm text-muted-foreground">
                    Kimlik, yetki ve ticari belgeler burada tutulur.
                  </p>
                </div>

                <form action={uploadOwnerDocumentAction} className="grid gap-4 md:grid-cols-2">
                  <input type="hidden" name="ownerId" value={owner.id} />
                  <select
                    name="documentType"
                    className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
                    defaultValue="identity"
                  >
                    <option value="identity">identity</option>
                    <option value="ownership_or_authority">ownership_or_authority</option>
                    <option value="tourism_permit">tourism_permit</option>
                    <option value="tax_or_business_document">tax_or_business_document</option>
                    <option value="other">other</option>
                  </select>
                  <Input name="note" placeholder="Kısa not" />
                  <div className="md:col-span-2">
                    <input type="file" name="file" className="block w-full text-sm" required />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit" variant="outline" className="rounded-full">
                      Doküman Yükle
                    </Button>
                  </div>
                </form>

                <div className="space-y-3">
                  {owner.documents.length ? (
                    owner.documents.map((document) => (
                      <div key={document.id} className="villawe-soft-block">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{document.documentType}</p>
                            <a href={document.url} target="_blank" className="text-sm text-primary underline-offset-4 hover:underline">
                              {document.originalName}
                            </a>
                          </div>
                          <div className="flex gap-2">
                            <form action={toggleOwnerDocumentVerificationAction}>
                              <input type="hidden" name="ownerId" value={owner.id} />
                              <input type="hidden" name="documentId" value={document.id} />
                              {document.isVerified ? null : <input type="hidden" name="isVerified" value="1" />}
                              <Button type="submit" variant="outline" className="rounded-full">
                                {document.isVerified ? "Doğrulanmış" : "Doğrula"}
                              </Button>
                            </form>
                            <form action={deleteOwnerDocumentAction}>
                              <input type="hidden" name="ownerId" value={owner.id} />
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
                      Bu owner için henüz doküman yüklenmedi.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
