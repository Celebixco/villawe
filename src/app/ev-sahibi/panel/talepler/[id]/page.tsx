import { notFound } from "next/navigation";

import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  markOwnerInquirySeenAction,
  saveOwnerInquiryNoteAction,
} from "@/features/owners/actions";
import { getOwnerInquiryById } from "@/features/owners/queries";
import { requireOwnerSession } from "@/lib/auth/owner-authorization";

type OwnerInquiryDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OwnerInquiryDetailPage({
  params,
  searchParams,
}: OwnerInquiryDetailPageProps) {
  const session = await requireOwnerSession();
  const { id } = await params;
  const [inquiry, resolved] = await Promise.all([
    getOwnerInquiryById(session.ownerId, id),
    searchParams,
  ]);

  if (!inquiry) {
    notFound();
  }

  const success = ["seenSaved", "noteSaved"].some((key) => resolved[key] === "1");
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-kicker">Talep Detayı</p>
        <h2 className="text-4xl font-semibold tracking-tight">{inquiry.villaTitle}</h2>
      </div>

      {success ? (
        <DataSourceNotice tone="info" title="İşlem kaydedildi" body="Talep durumu güncellendi." />
      ) : null}
      {error ? <DataSourceNotice tone="error" title="İşlem tamamlanamadı" body={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="villawe-panel">
          <CardContent className="space-y-4 p-6">
            <h3 className="text-2xl font-semibold tracking-tight">Talep özeti</h3>
            <div className="space-y-2 text-sm leading-7 text-muted-foreground">
              <p><span className="font-semibold text-foreground">Misafir:</span> {inquiry.fullName}</p>
              <p><span className="font-semibold text-foreground">E-posta:</span> {inquiry.email}</p>
              <p><span className="font-semibold text-foreground">Telefon:</span> {inquiry.phone}</p>
              <p><span className="font-semibold text-foreground">Durum:</span> {inquiry.status}</p>
              <p><span className="font-semibold text-foreground">Tarih:</span> {inquiry.startDate || "—"} - {inquiry.endDate || "—"}</p>
              <p><span className="font-semibold text-foreground">Misafir sayısı:</span> {inquiry.guestCount}</p>
              <p><span className="font-semibold text-foreground">Tahmini fiyat:</span> {inquiry.estimatedTotal ? `₺${inquiry.estimatedTotal.toLocaleString("tr-TR")}` : "—"}</p>
            </div>
            {inquiry.message ? (
              <div className="villawe-soft-block">
                <p className="font-semibold">Misafir mesajı</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{inquiry.message}</p>
              </div>
            ) : null}
            <form action={markOwnerInquirySeenAction}>
              <input type="hidden" name="inquiryId" value={inquiry.id} />
              <Button type="submit" variant="outline" className="rounded-full">
                Görüldü Olarak İşaretle
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="villawe-panel">
          <CardContent className="space-y-4 p-6">
            <h3 className="text-2xl font-semibold tracking-tight">İç not</h3>
            <form action={saveOwnerInquiryNoteAction} className="space-y-4">
              <input type="hidden" name="inquiryId" value={inquiry.id} />
              <Textarea
                name="ownerNote"
                rows={8}
                defaultValue={inquiry.ownerNote}
                placeholder="Talep hakkında iç notunuzu ekleyin"
              />
              <Button type="submit" className="rounded-full">
                Notu Kaydet
              </Button>
            </form>

            {inquiry.pricingSnapshot ? (
              <div className="villawe-soft-block">
                <p className="font-semibold">Fiyat özeti kaydı</p>
                <pre className="mt-2 overflow-x-auto text-xs leading-6 text-muted-foreground">
                  {inquiry.pricingSnapshot}
                </pre>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
