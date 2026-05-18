import type { Route } from "next";
import Link from "next/link";

import { DataSourceNotice } from "@/components/shared/data-source-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { registerOwnerAction } from "@/features/owners/actions";

type OwnerRegisterPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OwnerRegisterPage({
  searchParams,
}: OwnerRegisterPageProps) {
  const resolved = await searchParams;
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="container-shell py-12">
      <div className="mx-auto max-w-5xl">
        <Card className="villawe-panel">
          <CardContent className="space-y-8 p-8 md:p-10">
            <div className="space-y-2">
              <p className="section-kicker">Ev Sahibi Kaydı</p>
              <h1 className="text-4xl font-semibold tracking-tight">
                Villawe’de güvenli ilan sürecini başlatın
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                Kaydınızı tamamladıktan sonra ilan ekleyebilir, fotoğraf ve belgelerinizi
                yükleyebilir, fiyat ve müsaitlik bilgilerinizi yönetebilirsiniz. İlanlarınız
                admin incelemesinden geçmeden yayına alınmaz.
              </p>
            </div>

            {error ? (
              <DataSourceNotice tone="error" title="Kayıt tamamlanamadı" body={error} />
            ) : null}

            <form action={registerOwnerAction} className="grid gap-4 md:grid-cols-2">
              <Input name="fullName" placeholder="Ad soyad" required />
              <Input name="email" type="email" placeholder="E-posta adresi" required />
              <Input name="phone" placeholder="Telefon numarası" required />
              <select
                name="ownerType"
                defaultValue="INDIVIDUAL"
                className="h-11 rounded-2xl border border-border bg-card px-4 text-sm"
              >
                <option value="INDIVIDUAL">Bireysel</option>
                <option value="COMPANY">Şirket</option>
                <option value="AGENCY">Acente</option>
              </select>
              <Input name="companyName" placeholder="Şirket / acente adı (varsa)" />
              <Input name="taxNumber" placeholder="Vergi numarası (varsa)" />
              <Input name="city" placeholder="Şehir" required />
              <Input name="district" placeholder="İlçe" required />
              <div className="md:col-span-2">
                <Textarea name="address" rows={4} placeholder="Adres bilgisi" required />
              </div>
              <Input name="password" type="password" placeholder="Şifre" required />
              <Input name="passwordConfirm" type="password" placeholder="Şifre tekrarı" required />
              <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
                <Link href={"/ev-sahibi/giris" as Route} className="text-sm text-primary hover:underline">
                  Zaten hesabım var
                </Link>
                <Button type="submit" className="rounded-full px-6">
                  Hesap Oluştur
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
