import type { Route } from "next";
import Link from "next/link";

import { OwnerStatCard } from "@/components/owner/owner-stat-card";
import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireOwnerSession } from "@/lib/auth/owner-authorization";
import { getOwnerDashboardData, getOwnerModuleState, getOwnerVillaSummaries } from "@/features/owners/queries";

export default async function OwnerDashboardPage() {
  const session = await requireOwnerSession();
  const [moduleState, stats, villas] = await Promise.all([
    getOwnerModuleState(),
    getOwnerDashboardData(session.ownerId),
    getOwnerVillaSummaries(session.ownerId),
  ]);

  const incompleteVillas = villas.filter((villa) => !villa.isComplete).slice(0, 4);

  return (
    <div className="space-y-6">
      {moduleState.mode === "demo" ? (
        <DataSourceNotice
          tone="warning"
          title="Demo veri modu"
          body={`${moduleState.message} Ev sahibi panelinde yazma işlemleri gerçek veritabanı ile tamamlanmalıdır.`}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-kicker">Genel Bakış</p>
          <h2 className="text-4xl font-semibold tracking-tight">Villawe Ev Sahibi Paneli</h2>
        </div>
        <Link
          href={"/ev-sahibi/panel/villalar/yeni" as Route}
          className={buttonVariants({ className: "rounded-full px-6" })}
        >
          Yeni Villa Ekle
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <OwnerStatCard label="Toplam Villa" value={stats.totalVillas} description="Kayıtlı tüm ilan taslakları ve yayınlı villalar." tone="primary" />
        <OwnerStatCard label="Taslak" value={stats.draftVillas} description="Henüz incelemeye gönderilmemiş ilanlar." tone="secondary" />
        <OwnerStatCard label="İnceleme Bekleyen" value={stats.pendingReviewVillas} description="Villawe ekibi tarafından kontrol edilen ilanlar." tone="warning" />
        <OwnerStatCard label="Yayındaki" value={stats.publishedVillas} description="Public tarafta şu anda görünen ilanlar." tone="success" />
        <OwnerStatCard label="Yeni Talep" value={stats.newInquiries} description="İlk geri dönüş bekleyen talepler." tone="primary" />
        <OwnerStatCard label="Eksik İlan" value={stats.incompleteListings} description="İncelemeye göndermeden önce tamamlanması gereken kayıtlar." tone="error" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Card className="villawe-panel">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-3xl font-semibold tracking-tight">Eksik listing kontrolü</h3>
              <Link
                href={"/ev-sahibi/panel/villalar" as Route}
                className={buttonVariants({ variant: "ghost", className: "rounded-full" })}
              >
                Tümünü Gör
              </Link>
            </div>
            {incompleteVillas.length ? (
              <div className="space-y-3">
                {incompleteVillas.map((villa) => (
                  <div key={villa.id} className="villawe-soft-block flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{villa.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {villa.checklistPendingCount} eksik adım · {villa.regionName}
                      </p>
                    </div>
                    <Link
                      href={`/ev-sahibi/panel/villalar/${villa.id}` as Route}
                      className={buttonVariants({ variant: "outline", className: "rounded-full" })}
                    >
                      Düzenle
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-muted-foreground">
                İncelemeye gönderilmeyi bekleyen eksik ilan görünmüyor.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="villawe-panel">
          <CardContent className="space-y-4 p-6">
            <h3 className="text-3xl font-semibold tracking-tight">Doğrulama durumu</h3>
            <div className="space-y-3">
              <div className="villawe-soft-block">
                <p className="font-semibold">Belgeleriniz inceleniyor</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {stats.verifiedDocuments}/{stats.totalDocuments} belge doğrulandı.
                </p>
              </div>
              <div className="villawe-soft-block">
                <p className="font-semibold">Yayına alınmadan önce doğrulanır</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Villawe ekibi belgeleri, fotoğrafları ve yetki durumunu kontrol ettikten sonra yayın kararı verir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
