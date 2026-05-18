import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { updateInquiryStatusAction } from "@/features/admin/actions";
import { getAdminInquiries, getAdminModuleState } from "@/features/admin/queries";

type AdminInquiriesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminInquiriesPage({
  searchParams,
}: AdminInquiriesPageProps) {
  const [moduleState, inquiries, resolved] = await Promise.all([
    getAdminModuleState(),
    getAdminInquiries(),
    searchParams,
  ]);
  const success = resolved.saved === "1";
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="section-kicker">Talep Yönetimi</p>
        <h2 className="text-4xl font-semibold tracking-tight">Rezervasyon talepleri</h2>
      </div>

      {moduleState.mode !== "database" ? (
        <DataSourceNotice
          tone={moduleState.mode === "demo" ? "warning" : "error"}
          title={moduleState.mode === "demo" ? "Demo inquiry modu" : "Talep modülü yapılandırma bekliyor"}
          body={moduleState.message}
        />
      ) : null}
      {success ? <DataSourceNotice tone="info" title="Talep güncellendi" body="Talep durumu kaydedildi." /> : null}
      {error ? <DataSourceNotice tone="error" title="İşlem tamamlanamadı" body={error} /> : null}

      <div className="space-y-4">
        {inquiries.length ? (
          inquiries.map((inquiry) => (
            <Card key={inquiry.id} className="villawe-panel">
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight">{inquiry.villaTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      {inquiry.fullName} · {inquiry.email} · {inquiry.phone}
                    </p>
                  </div>
                  <form action={updateInquiryStatusAction} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="inquiryId" value={inquiry.id} />
                    <select
                      name="status"
                      defaultValue={inquiry.status}
                      className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
                    >
                      {["NEW", "REVIEWING", "QUOTED", "ACCEPTED", "DECLINED", "EXPIRED", "CONVERTED", "SPAM"].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" variant="outline" className="rounded-full">
                      Kaydet
                    </Button>
                  </form>
                </div>

                <p className="text-sm text-muted-foreground">
                  {inquiry.startDate || "Tarih yok"} {inquiry.endDate ? `- ${inquiry.endDate}` : ""} · {inquiry.guestCount} misafir · ₺
                  {inquiry.estimatedTotal?.toLocaleString("tr-TR") || "—"}
                </p>

                {inquiry.message ? (
                  <p className="text-sm leading-7 text-muted-foreground">{inquiry.message}</p>
                ) : null}

                {inquiry.pricingSnapshot ? (
                  <details className="villawe-soft-block">
                    <summary className="cursor-pointer text-sm font-semibold">Fiyat snapshot</summary>
                    <pre className="mt-3 overflow-x-auto text-xs leading-6 text-muted-foreground">
                      {inquiry.pricingSnapshot}
                    </pre>
                  </details>
                ) : null}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="villawe-soft-panel border-dashed">
            <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
              Henüz rezervasyon talebi bulunmuyor.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
