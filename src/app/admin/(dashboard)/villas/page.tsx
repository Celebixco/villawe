import Link from "next/link";

import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminModuleState, getAdminVillaList } from "@/features/admin/queries";

export default async function AdminVillasPage() {
  const [moduleState, villas] = await Promise.all([
    getAdminModuleState(),
    getAdminVillaList(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-kicker">Villa Yönetimi</p>
          <h2 className="text-4xl font-semibold tracking-tight">Villa yönetimi</h2>
        </div>
        <Link
          href="/admin/villas/new"
          className={buttonVariants({
            className: "rounded-full",
          })}
        >
          Yeni Villa
        </Link>
      </div>

      {moduleState.mode !== "database" ? (
        <DataSourceNotice
          tone={moduleState.mode === "demo" ? "warning" : "error"}
          title={moduleState.mode === "demo" ? "Demo villa yönetimi" : "Villa yönetimi yapılandırma bekliyor"}
          body={moduleState.message}
        />
      ) : null}

      <div className="space-y-4">
        {villas.length ? (
          villas.map((villa) => (
            <Card key={villa.id} className="villawe-panel">
              <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-semibold tracking-tight">{villa.title}</h3>
                    <Badge variant="info">
                      {villa.status}
                    </Badge>
                    <Badge variant="secondary">
                      {villa.verificationStatus}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{villa.location}</p>
                  {villa.publishWarnings.length ? (
                    <p className="text-sm font-medium text-warning">
                      {villa.publishWarnings.length} yayın uyarısı mevcut.
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-success">Yayın için temel kontrol tamam.</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span>₺{villa.nightlyPrice.toLocaleString("tr-TR")}</span>
                  <Link
                    href={`/admin/villas/${villa.id}`}
                    className={buttonVariants({
                      variant: "outline",
                      className: "rounded-full",
                    })}
                  >
                    Düzenle
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="villawe-soft-panel border-dashed">
            <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
              Henüz villa kaydı bulunmuyor.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
