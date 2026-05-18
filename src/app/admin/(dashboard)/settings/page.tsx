import Link from "next/link";

import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteSettingAction, saveSettingAction } from "@/features/admin/actions";
import { getAdminModuleState, getAdminSettings } from "@/features/admin/queries";

type AdminSettingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminSettingsPage({
  searchParams,
}: AdminSettingsPageProps) {
  const [moduleState, settings, resolved] = await Promise.all([
    getAdminModuleState(),
    getAdminSettings(),
    searchParams,
  ]);
  const selectedId = typeof resolved.settingId === "string" ? resolved.settingId : undefined;
  const setting = settings.find((item) => item.id === selectedId) || null;
  const success = resolved.saved === "1";
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-kicker">Site Ayarları</p>
          <h2 className="text-4xl font-semibold tracking-tight">Site ayarları</h2>
        </div>
        <Link href={{ pathname: "/admin/settings", query: { new: "1" } }} className={buttonVariants({ className: "rounded-full" })}>
          Yeni ayar
        </Link>
      </div>

      {moduleState.mode !== "database" ? (
        <DataSourceNotice
          tone={moduleState.mode === "demo" ? "warning" : "error"}
          title={moduleState.mode === "demo" ? "Demo settings modu" : "Ayar modülü yapılandırma bekliyor"}
          body={moduleState.message}
        />
      ) : null}
      {success ? <DataSourceNotice tone="info" title="Ayar kaydedildi" body="Site ayarı güncellendi." /> : null}
      {error ? <DataSourceNotice tone="error" title="İşlem tamamlanamadı" body={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          {settings.length ? (
            settings.map((item) => (
              <Card key={item.id} className="villawe-panel">
                <CardContent className="flex items-center justify-between gap-4 p-6">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight">{item.key}</h3>
                    <p className="text-sm text-muted-foreground">{item.groupName}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={{ pathname: "/admin/settings", query: { settingId: item.id } }}
                      className={buttonVariants({ variant: "outline", className: "rounded-full" })}
                    >
                      Düzenle
                    </Link>
                    <form action={deleteSettingAction}>
                      <input type="hidden" name="settingId" value={item.id} />
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
                Henüz ayar kaydı bulunmuyor.
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="villawe-panel">
          <CardContent className="p-6">
            <form action={saveSettingAction} className="space-y-4">
              {setting ? <input type="hidden" name="settingId" value={setting.id} /> : null}
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="key" defaultValue={setting?.key} placeholder="ayar_anahtari" required />
                <Input name="groupName" defaultValue={setting?.groupName} placeholder="Grup" required />
              </div>
              <Textarea name="description" defaultValue={setting?.description} rows={3} placeholder="Açıklama" />
              <Textarea
                name="valueJson"
                defaultValue={setting?.valueJson || "[]"}
                rows={12}
                placeholder='{"enabled": true}'
                required
              />
              <div className="flex justify-end">
                <Button type="submit" className="rounded-full px-6">
                  {setting ? "Ayarı Kaydet" : "Ayar Oluştur"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
