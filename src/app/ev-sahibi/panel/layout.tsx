import type { ReactNode } from "react";

import { OwnerSidebar } from "@/components/owner/owner-sidebar";
import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button } from "@/components/ui/button";
import { logoutOwnerAction } from "@/features/owners/actions";
import { requireOwnerSession } from "@/lib/auth/owner-authorization";
import { getDatabaseHealth } from "@/lib/db/prisma";

function getStatusLabel(status: "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "REJECTED") {
  if (status === "ACTIVE") return "Hesap durumu: aktif";
  if (status === "PENDING_REVIEW") return "Hesap durumu: inceleme bekliyor";
  if (status === "SUSPENDED") return "Hesap durumu: askıda";
  return "Hesap durumu: reddedildi";
}

export default async function OwnerPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireOwnerSession();
  const databaseHealth = await getDatabaseHealth();

  return (
    <div className="container-shell grid gap-6 py-8 lg:grid-cols-[280px_1fr]">
      <OwnerSidebar
        fullName={session.fullName}
        statusLabel={getStatusLabel(session.ownerStatus)}
      />
      <div className="space-y-6">
        <div className="glass-card flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm text-muted-foreground">Ev Sahibi</p>
            <h1 className="text-3xl font-semibold tracking-tight">Operasyon paneli</h1>
          </div>
          <form action={logoutOwnerAction}>
            <Button type="submit" variant="outline" className="rounded-full">
              Çıkış Yap
            </Button>
          </form>
        </div>

        {session.ownerStatus === "PENDING_REVIEW" ? (
          <DataSourceNotice
            tone="info"
            title="Hesabınız inceleniyor"
            body="Hesabınız onay beklerken paneli kullanabilir, ilan ve belgelerinizi hazırlayabilirsiniz."
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
