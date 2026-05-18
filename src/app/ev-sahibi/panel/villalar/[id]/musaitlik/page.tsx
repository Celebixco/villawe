import { notFound } from "next/navigation";

import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createOwnerAvailabilityBlockAction,
  deleteOwnerAvailabilityBlockAction,
} from "@/features/owners/actions";
import { getOwnerVillaEditor } from "@/features/owners/queries";
import { requireOwnerSession } from "@/lib/auth/owner-authorization";

type OwnerVillaAvailabilityPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OwnerVillaAvailabilityPage({
  params,
  searchParams,
}: OwnerVillaAvailabilityPageProps) {
  const session = await requireOwnerSession();
  const { id } = await params;
  const [villa, resolved] = await Promise.all([
    getOwnerVillaEditor(session.ownerId, id),
    searchParams,
  ]);

  if (!villa) {
    notFound();
  }

  const success = resolved.availabilitySaved === "1";
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-kicker">Müsaitlik</p>
        <h2 className="text-4xl font-semibold tracking-tight">{villa.title} müsaitlik yönetimi</h2>
      </div>

      {success ? (
        <DataSourceNotice tone="info" title="İşlem kaydedildi" body="Müsaitlik blokesi güncellendi." />
      ) : null}
      {error ? <DataSourceNotice tone="error" title="İşlem tamamlanamadı" body={error} /> : null}

      <Card className="villawe-panel">
        <CardContent className="space-y-5 p-6">
          <h3 className="text-2xl font-semibold tracking-tight">Yeni tarih blokesi</h3>
          <form action={createOwnerAvailabilityBlockAction} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="villaId" value={villa.id} />
            <Input name="startDate" type="date" required />
            <Input name="endDate" type="date" required />
            <select
              name="reasonCode"
              className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
              defaultValue="owner_block"
            >
              <option value="owner_block">owner_block</option>
              <option value="maintenance">maintenance</option>
              <option value="reserved_elsewhere">reserved_elsewhere</option>
              <option value="other">other</option>
            </select>
            <Input name="reason" placeholder="Ek açıklama" />
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" className="rounded-full">
                Bloke Ekle
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            {villa.availabilityBlocks.length ? (
              villa.availabilityBlocks.map((block) => (
                <div key={block.id} className="villawe-soft-block">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{block.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {block.startDate} - {block.endDate}
                      </p>
                      {block.reason ? (
                        <p className="text-sm text-muted-foreground">{block.reason}</p>
                      ) : null}
                    </div>
                    <form action={deleteOwnerAvailabilityBlockAction}>
                      <input type="hidden" name="villaId" value={villa.id} />
                      <input type="hidden" name="blockId" value={block.id} />
                      <Button type="submit" variant="outline" className="rounded-full">
                        Sil
                      </Button>
                    </form>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-muted-foreground">
                Henüz müsaitlik blokesi eklenmedi.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
