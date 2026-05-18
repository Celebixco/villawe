import Image from "next/image";
import { notFound } from "next/navigation";

import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  deleteOwnerVillaMediaAction,
  setOwnerVillaCoverAction,
  updateOwnerVillaMediaAction,
  uploadOwnerVillaMediaAction,
} from "@/features/owners/actions";
import { getOwnerVillaEditor } from "@/features/owners/queries";
import { requireOwnerSession } from "@/lib/auth/owner-authorization";

type OwnerVillaPhotosPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OwnerVillaPhotosPage({
  params,
  searchParams,
}: OwnerVillaPhotosPageProps) {
  const session = await requireOwnerSession();
  const { id } = await params;
  const [villa, resolved] = await Promise.all([
    getOwnerVillaEditor(session.ownerId, id),
    searchParams,
  ]);

  if (!villa) {
    notFound();
  }

  const success = ["uploadSaved", "mediaSaved"].some((key) => resolved[key] === "1");
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-kicker">Fotoğraflar</p>
        <h2 className="text-4xl font-semibold tracking-tight">{villa.title} fotoğraf yönetimi</h2>
      </div>

      {success ? (
        <DataSourceNotice tone="info" title="İşlem kaydedildi" body="Fotoğraf alanı güncellendi." />
      ) : null}
      {error ? <DataSourceNotice tone="error" title="İşlem tamamlanamadı" body={error} /> : null}

      <Card className="villawe-panel">
        <CardContent className="space-y-4 p-6">
          <h3 className="text-2xl font-semibold tracking-tight">Yeni fotoğraf yükle</h3>
          <form action={uploadOwnerVillaMediaAction} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="villaId" value={villa.id} />
            <Input name="altText" placeholder="Fotoğraf alt metni" />
            <div className="md:col-span-2">
              <input type="file" name="file" className="block w-full text-sm" required />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" className="rounded-full">
                Fotoğraf Yükle
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {villa.media.length ? (
          villa.media.map((media) => (
            <Card key={media.id} className="villawe-panel overflow-hidden">
              <div className="relative h-56 w-full">
                <Image
                  src={media.url}
                  alt={media.altText}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap gap-2 text-sm">
                  {media.isCover ? <span className="villawe-status-chip">Kapak fotoğrafı</span> : null}
                  <span className="villawe-status-chip">Sıra: {media.sortOrder}</span>
                </div>

                <form action={updateOwnerVillaMediaAction} className="grid gap-3 md:grid-cols-[1fr_120px]">
                  <input type="hidden" name="villaId" value={villa.id} />
                  <input type="hidden" name="mediaId" value={media.id} />
                  <Input name="altText" defaultValue={media.altText} required />
                  <Input name="sortOrder" type="number" min={0} defaultValue={media.sortOrder} required />
                  <div className="md:col-span-2">
                    <Button type="submit" variant="outline" className="rounded-full">
                      Bilgileri Kaydet
                    </Button>
                  </div>
                </form>
                <div className="flex flex-wrap gap-2">
                  <form action={setOwnerVillaCoverAction}>
                    <input type="hidden" name="villaId" value={villa.id} />
                    <input type="hidden" name="mediaId" value={media.id} />
                    <Button type="submit" variant="outline" className="rounded-full">
                      Kapak Yap
                    </Button>
                  </form>
                  <form action={deleteOwnerVillaMediaAction}>
                    <input type="hidden" name="villaId" value={villa.id} />
                    <input type="hidden" name="mediaId" value={media.id} />
                    <Button type="submit" variant="outline" className="rounded-full">
                      Sil
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="villawe-soft-panel border-dashed xl:col-span-2">
            <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
              Henüz fotoğraf yüklenmedi. İncelemeye göndermeden önce en az 5 fotoğraf yükleyin.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
