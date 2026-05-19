import type { Route } from "next";
import Link from "next/link";

import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginOwnerAction } from "@/features/owners/actions";

type OwnerLoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OwnerLoginPage({ searchParams }: OwnerLoginPageProps) {
  const resolved = await searchParams;
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="container-shell py-12">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="villawe-gradient-band border-0">
          <CardContent className="space-y-6 p-8 md:p-10">
            <p className="section-kicker text-primary-foreground/78">Villawe Ev Sahibi Paneli</p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
              İlanlarınızı güvenle yönetin, her adımı admin onayıyla ilerletin.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-white/84">
              Villawe’de yayın süreci daima doğrulama odaklıdır. Fotoğraflarınızı,
              belgelerinizi, fiyat ve müsaitlik bilgilerinizi güvenli şekilde yönetin.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="villawe-floating-card border-white/18 bg-white/14 text-white">
                <p className="text-lg font-semibold">İlanınızı incelemeye gönderin</p>
                <p className="mt-2 text-sm leading-7 text-white/78">
                  Yayına alınmadan önce Villawe ekibi tarafından doğrulanır.
                </p>
              </div>
              <div className="villawe-floating-card border-white/18 bg-white/14 text-white">
                <p className="text-lg font-semibold">Belge ve fotoğraf takibi</p>
                <p className="mt-2 text-sm leading-7 text-white/78">
                  Gerekli yüklemeleri tek panelde tamamlayın ve durumunu izleyin.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="villawe-panel">
          <CardContent className="space-y-6 p-8 md:p-10">
            <div className="space-y-2">
              <p className="section-kicker">Giriş</p>
              <h2 className="text-3xl font-semibold tracking-tight">Hesabınıza giriş yapın</h2>
              <p className="text-sm leading-7 text-muted-foreground">
                İlanlarınızı, belgelerinizi ve taleplerinizi yönetmek için giriş yapın.
              </p>
            </div>

            {error ? (
              <DataSourceNotice tone="error" title="Giriş tamamlanamadı" body={error} />
            ) : null}

            <form action={loginOwnerAction} className="grid gap-4">
              <Input name="email" type="email" placeholder="E-posta adresiniz" required />
              <Input name="password" type="password" placeholder="Şifreniz" required />
              <Button type="submit" className="rounded-full">
                Giriş Yap
              </Button>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <Link href={"/ev-sahibi/sifre-yenile" as Route} className="text-primary hover:underline">
                Şifremi Unuttum
              </Link>
              <Link href={"/ev-sahibi/kayit" as Route} className="text-primary hover:underline">
                Hesap oluştur
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
