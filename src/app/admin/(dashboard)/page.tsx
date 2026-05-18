import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminDashboardData } from "@/features/villas/queries";
import { getAdminInquiries, getAdminModuleState } from "@/features/admin/queries";

export default async function AdminDashboardPage() {
  const [moduleState, stats, inquiries] = await Promise.all([
    getAdminModuleState(),
    getAdminDashboardData(),
    getAdminInquiries(),
  ]);

  return (
    <div className="space-y-6">
      {moduleState.mode === "demo" ? (
        <DataSourceNotice
          tone="warning"
          title="Demo veri modu"
          body={`${moduleState.message} Panel kartları örnek kayıtlar üzerinden hesaplanıyor.`}
        />
      ) : null}
      {moduleState.mode === "unavailable" || moduleState.mode === "error" ? (
        <DataSourceNotice
          tone="error"
          title="Veritabanı erişimi gerekli"
          body={`${moduleState.message} Bu durumda panel yazma işlemleri ve canlı liste ölçümleri durdurulur.`}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard label="Toplam Villa" value={stats.totalVillas} description="Tüm kayıtlı villa sayısı." tone="primary" />
        <AdminStatCard label="Bekleyen Doğrulama" value={stats.pendingVerificationVillas} description="Tüm güven alanları tamamlanmamış ilanlar." tone="warning" />
        <AdminStatCard label="Yeni Talep" value={stats.newInquiries} description="İlk geri dönüş bekleyen rezervasyon talepleri." tone="secondary" />
        <AdminStatCard label="Yayındaki Villa" value={stats.publishedVillas} description="Public tarafta görünen villalar." tone="success" />
        <AdminStatCard label="Eksik İlan" value={stats.incompleteListings} description="Medya veya temel alanları eksik villalar." tone="warning" />
        <AdminStatCard label="Şüpheli Uyarı" value={stats.suspiciousWarnings} description="Yetki/doğrulama tarafında takip gerektiren kayıtlar." tone="error" />
      </div>

      <Card className="villawe-panel">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-3xl font-semibold tracking-tight">Son talepler</h2>
          {inquiries.length ? (
            <div className="space-y-3">
              {inquiries.slice(0, 5).map((inquiry) => (
                <div key={inquiry.id} className="villawe-soft-block flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">{inquiry.villaTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {inquiry.fullName}
                      {inquiry.startDate ? ` · ${inquiry.startDate}` : ""}
                      {inquiry.endDate ? ` - ${inquiry.endDate}` : ""}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {inquiry.status} · ₺{inquiry.estimatedTotal?.toLocaleString("tr-TR") || "—"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-7 text-muted-foreground">
              Henüz kayıtlı talep bulunmuyor.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
