import type { Route } from "next";
import Link from "next/link";

import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireOwnerSession } from "@/lib/auth/owner-authorization";
import { getOwnerModuleState, getOwnerVillaSummaries } from "@/features/owners/queries";

export default async function OwnerVillasPage() {
  const session = await requireOwnerSession();
  const [moduleState, villas] = await Promise.all([
    getOwnerModuleState(),
    getOwnerVillaSummaries(session.ownerId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-kicker">Villa Yönetimi</p>
          <h2 className="text-4xl font-semibold tracking-tight">Villalarım</h2>
        </div>
        <Link
          href={"/ev-sahibi/panel/villalar/yeni" as Route}
          className={buttonVariants({ className: "rounded-full px-6" })}
        >
          Yeni Villa Ekle
        </Link>
      </div>

      {moduleState.mode !== "database" ? (
        <DataSourceNotice
          tone={moduleState.mode === "demo" ? "warning" : "error"}
          title="Veri kaynağı uyarısı"
          body={moduleState.message}
        />
      ) : null}

      {villas.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {villas.map((villa) => (
            <Card key={villa.id} className="villawe-panel">
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight">{villa.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {villa.regionName} · {villa.districtName}
                    </p>
                  </div>
                  <span className="villawe-status-chip">{villa.status}</span>
                </div>

                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="villawe-status-chip">{villa.mediaCount} fotoğraf</span>
                  <span className="villawe-status-chip">
                    {villa.isComplete
                      ? "İncelemeye hazır"
                      : `${villa.checklistPendingCount} eksik adım`}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/ev-sahibi/panel/villalar/${villa.id}` as Route}
                    className={buttonVariants({ variant: "outline", className: "rounded-full" })}
                  >
                    İlanı Düzenle
                  </Link>
                  <Link
                    href={`/ev-sahibi/panel/villalar/${villa.id}/fotograflar` as Route}
                    className={buttonVariants({ variant: "ghost", className: "rounded-full" })}
                  >
                    Fotoğraflar
                  </Link>
                  <Link
                    href={`/ev-sahibi/panel/villalar/${villa.id}/belgeler` as Route}
                    className={buttonVariants({ variant: "ghost", className: "rounded-full" })}
                  >
                    Belgeler
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="villawe-soft-panel border-dashed">
          <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
            Henüz villa kaydınız bulunmuyor. İlk ilan taslağınızı oluşturarak başlayabilirsiniz.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
