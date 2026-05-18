import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminAuditTrail, getAdminModuleState } from "@/features/admin/queries";

export default async function AdminAuditLogsPage() {
  const [moduleState, logs] = await Promise.all([
    getAdminModuleState(),
    getAdminAuditTrail(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="section-kicker">Audit Kayıtları</p>
        <h2 className="text-4xl font-semibold tracking-tight">Audit kayıtları</h2>
      </div>

      {moduleState.mode !== "database" ? (
        <DataSourceNotice
          tone={moduleState.mode === "demo" ? "warning" : "error"}
          title={moduleState.mode === "demo" ? "Demo audit görünümü" : "Audit kayıt erişimi yapılandırma bekliyor"}
          body={moduleState.message}
        />
      ) : null}

      <div className="space-y-4">
        {logs.length ? (
          logs.map((log) => (
            <Card key={log.id} className="villawe-panel">
              <CardContent className="space-y-2 p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-semibold tracking-tight">{log.action}</h3>
                  <span className="text-sm text-muted-foreground">{log.createdAt}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {log.entityType} · {log.entityLabel}
                  {log.actorLabel ? ` · ${log.actorLabel}` : ""}
                </p>
                <p className="text-sm leading-7 text-muted-foreground">{log.message}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="villawe-soft-panel border-dashed">
            <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
              Henüz audit log kaydı görünmüyor.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
