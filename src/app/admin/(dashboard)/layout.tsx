import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button } from "@/components/ui/button";
import { requireAdminSession } from "@/lib/auth/authorization";
import { getDatabaseHealth } from "@/lib/db/prisma";
import { logoutAdminAction } from "@/features/admin/actions";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdminSession();
  const databaseHealth = await getDatabaseHealth();

  return (
    <div className="container-shell grid gap-6 py-8 lg:grid-cols-[280px_1fr]">
      <AdminSidebar fullName={session.fullName} />
      <div className="space-y-6">
        <div className="glass-card flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-muted-foreground">Yönetici</p>
            <h1 className="text-3xl font-semibold tracking-tight">Operasyon paneli</h1>
          </div>
          <form action={logoutAdminAction}>
            <Button type="submit" variant="outline" className="rounded-full">
              Çıkış Yap
            </Button>
          </form>
        </div>
        {databaseHealth.status === "demo" ? (
          <DataSourceNotice
            tone="warning"
            title="Demo veri modu aktif"
            body={`${databaseHealth.message} Admin ekranları okunabilir kalır ancak kayıt işlemleri gerçek veritabanı olmadan sınırlıdır.`}
          />
        ) : null}
        {databaseHealth.status === "unavailable" || databaseHealth.status === "error" ? (
          <DataSourceNotice
            tone="error"
            title="Veritabanı yapılandırması gerekli"
            body={`${databaseHealth.message} Production ortamında demo veri gösterilmez; lütfen DATABASE_URL ve migration kurulumunu doğrulayın.`}
          />
        ) : null}
        {children}
      </div>
    </div>
  );
}
