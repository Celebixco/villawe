import type { Route } from "next";
import Link from "next/link";

import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requestOwnerPasswordResetAction } from "@/features/owners/actions";

type OwnerResetPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OwnerResetPage({ searchParams }: OwnerResetPageProps) {
  const resolved = await searchParams;
  const error = typeof resolved.error === "string" ? resolved.error : null;
  const requested = resolved.requested === "1";

  return (
    <div className="container-shell py-12">
      <div className="mx-auto max-w-2xl">
        <Card className="villawe-panel">
          <CardContent className="space-y-6 p-8 md:p-10">
            <div className="space-y-2">
              <p className="section-kicker">Şifre Yenileme</p>
              <h1 className="text-3xl font-semibold tracking-tight">Şifre yenileme isteği gönderin</h1>
              <p className="text-sm leading-7 text-muted-foreground">
                Güvenlik nedeniyle aynı mesaj her zaman gösterilir. Hesabınız doğrulanırsa
                operasyon ekibimiz bir sonraki adım için sizinle iletişime geçer.
              </p>
            </div>

            {requested ? (
              <DataSourceNotice
                tone="info"
                title="Talebiniz alındı"
                body="E-posta adresiniz kayıtlıysa şifre yenileme talebiniz operasyon akışına eklendi."
              />
            ) : null}
            {error ? (
              <DataSourceNotice tone="error" title="Talep alınamadı" body={error} />
            ) : null}

            <form action={requestOwnerPasswordResetAction} className="grid gap-4">
              <Input name="email" type="email" placeholder="E-posta adresiniz" required />
              <Button type="submit" className="rounded-full">
                Talep Gönder
              </Button>
            </form>

            <Link href={"/ev-sahibi/giris" as Route} className="text-sm text-primary hover:underline">
              Giriş sayfasına dön
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
