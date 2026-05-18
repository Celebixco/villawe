import Link from "next/link";

import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  deleteRedirectAction,
  saveRedirectAction,
} from "@/features/admin/actions";
import { getAdminModuleState, getAdminRedirects } from "@/features/admin/queries";

type AdminRedirectsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminRedirectsPage({
  searchParams,
}: AdminRedirectsPageProps) {
  const [moduleState, redirects, resolved] = await Promise.all([
    getAdminModuleState(),
    getAdminRedirects(),
    searchParams,
  ]);
  const selectedId =
    typeof resolved.redirectId === "string" ? resolved.redirectId : undefined;
  const redirectRecord = redirects.find((item) => item.id === selectedId) || null;
  const success = resolved.saved === "1";
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-kicker">Yönlendirmeler</p>
          <h2 className="text-4xl font-semibold tracking-tight">Yönlendirme yönetimi</h2>
        </div>
        <Link href={{ pathname: "/admin/redirects", query: { new: "1" } }} className={buttonVariants({ className: "rounded-full" })}>
          Yeni yönlendirme
        </Link>
      </div>

      {moduleState.mode !== "database" ? (
        <DataSourceNotice
          tone={moduleState.mode === "demo" ? "warning" : "error"}
          title={moduleState.mode === "demo" ? "Demo yönlendirme modu" : "Yönlendirme modülü yapılandırma bekliyor"}
          body={moduleState.message}
        />
      ) : null}
      {success ? <DataSourceNotice tone="info" title="Yönlendirme kaydedildi" body="Yönlendirme kaydı güncellendi." /> : null}
      {error ? <DataSourceNotice tone="error" title="İşlem tamamlanamadı" body={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          {redirects.length ? (
            redirects.map((item) => (
              <Card key={item.id} className="villawe-panel">
                <CardContent className="flex items-center justify-between gap-4 p-6">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight">{item.fromPath}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.type} · {item.isActive ? "Aktif" : "Pasif"} · {item.toPath}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={{ pathname: "/admin/redirects", query: { redirectId: item.id } }}
                      className={buttonVariants({ variant: "outline", className: "rounded-full" })}
                    >
                      Düzenle
                    </Link>
                    <form action={deleteRedirectAction}>
                      <input type="hidden" name="redirectId" value={item.id} />
                      <Button type="submit" variant="outline" className="rounded-full">
                        Sil
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
          <Card className="villawe-soft-panel border-dashed">
              <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
                Henüz yönlendirme kaydı bulunmuyor.
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="villawe-panel">
          <CardContent className="p-6">
            <form action={saveRedirectAction} className="space-y-4">
              {redirectRecord ? <input type="hidden" name="redirectId" value={redirectRecord.id} /> : null}
              <Input name="fromPath" defaultValue={redirectRecord?.fromPath} placeholder="/eski-yol" required />
              <Input name="toPath" defaultValue={redirectRecord?.toPath} placeholder="/yeni-yol" required />
              <div className="grid gap-4 md:grid-cols-2">
                <select
                  name="type"
                  defaultValue={redirectRecord?.type || "PERMANENT"}
                  className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
                >
                  <option value="PERMANENT">PERMANENT</option>
                  <option value="TEMPORARY">TEMPORARY</option>
                </select>
                <label className="villawe-check-tile">
                  <input type="checkbox" name="isActive" value="1" defaultChecked={redirectRecord?.isActive ?? true} />
                  <span>Aktif yönlendirme</span>
                </label>
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="rounded-full px-6">
                  {redirectRecord ? "Yönlendirmeyi Kaydet" : "Yönlendirme Oluştur"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
