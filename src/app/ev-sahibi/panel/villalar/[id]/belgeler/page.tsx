import { notFound } from "next/navigation";

import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  deleteOwnerPrivateDocumentAction,
  uploadOwnerPrivateDocumentAction,
} from "@/features/owners/actions";
import { getOwnerVillaEditor } from "@/features/owners/queries";
import { requireOwnerSession } from "@/lib/auth/owner-authorization";

type OwnerVillaDocumentsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function uploadForm(villaId: string, scope: "owner" | "villa") {
  return (
    <form action={uploadOwnerPrivateDocumentAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="villaId" value={villaId} />
      <input type="hidden" name="documentScope" value={scope} />
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
          Belge Yükle
        </Button>
      </div>
    </form>
  );
}

export default async function OwnerVillaDocumentsPage({
  params,
  searchParams,
}: OwnerVillaDocumentsPageProps) {
  const session = await requireOwnerSession();
  const { id } = await params;
  const [villa, resolved] = await Promise.all([
    getOwnerVillaEditor(session.ownerId, id),
    searchParams,
  ]);

  if (!villa) {
    notFound();
  }

  const success = resolved.documentSaved === "1";
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-kicker">Belgeler</p>
        <h2 className="text-4xl font-semibold tracking-tight">{villa.title} belge yönetimi</h2>
      </div>

      {success ? (
        <DataSourceNotice tone="info" title="İşlem kaydedildi" body="Belge akışı güncellendi." />
      ) : null}
      {error ? <DataSourceNotice tone="error" title="İşlem tamamlanamadı" body={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="villawe-panel">
          <CardContent className="space-y-5 p-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold tracking-tight">Ev sahibi belgeleri</h3>
              <p className="text-sm text-muted-foreground">
                Kimlik, yetki ve ticari doğrulama belgeleri.
              </p>
            </div>
            {uploadForm(villa.id, "owner")}
            <div className="space-y-3">
              {villa.ownerDocuments.length ? (
                villa.ownerDocuments.map((document) => (
                  <div key={document.id} className="villawe-soft-block">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{document.documentType}</p>
                        <a
                          href={document.url}
                          target="_blank"
                          className="text-sm text-primary hover:underline"
                        >
                          {document.originalName}
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <span className="villawe-status-chip">
                          {document.isVerified ? "Doğrulandı" : "İnceleniyor"}
                        </span>
                        <form action={deleteOwnerPrivateDocumentAction}>
                          <input type="hidden" name="villaId" value={villa.id} />
                          <input type="hidden" name="documentScope" value="owner" />
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
                  Henüz ev sahibi belgesi yüklenmedi.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="villawe-panel">
          <CardContent className="space-y-5 p-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold tracking-tight">Villa belgeleri</h3>
              <p className="text-sm text-muted-foreground">
                Turizm izni ve villaya ait doğrulama evrakları.
              </p>
            </div>
            {uploadForm(villa.id, "villa")}
            <div className="space-y-3">
              {villa.villaDocuments.length ? (
                villa.villaDocuments.map((document) => (
                  <div key={document.id} className="villawe-soft-block">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{document.documentType}</p>
                        <a
                          href={document.url}
                          target="_blank"
                          className="text-sm text-primary hover:underline"
                        >
                          {document.originalName}
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <span className="villawe-status-chip">
                          {document.isVerified ? "Doğrulandı" : "İnceleniyor"}
                        </span>
                        <form action={deleteOwnerPrivateDocumentAction}>
                          <input type="hidden" name="villaId" value={villa.id} />
                          <input type="hidden" name="documentScope" value="villa" />
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
                  Henüz villa belgesi yüklenmedi.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
