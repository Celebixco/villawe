import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAdminSession } from "@/lib/auth/session";
import { canUseDemoData } from "@/lib/env";
import { loginAdminAction } from "@/features/admin/actions";

type AdminLoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const session = await getAdminSession();
  const demoLoginEnabled = canUseDemoData();

  if (session) {
    redirect("/admin");
  }

  const resolved = await searchParams;
  const error = typeof resolved.error === "string" ? resolved.error : null;

  return (
    <div className="container-shell flex min-h-[calc(100vh-6rem)] items-center justify-center py-12">
      <Card className="villawe-hero-surface w-full max-w-xl shadow-[0_24px_80px_-40px_rgba(16,34,52,0.35)]">
        <CardContent className="space-y-6 p-8">
          <div className="space-y-2">
            <p className="section-kicker">Admin Girişi</p>
            <h1 className="text-4xl font-semibold tracking-tight">Villawe yönetim paneli</h1>
            <p className="text-sm leading-7 text-muted-foreground">
              Güven doğrulama, fiyat yönetimi ve operasyon akışları için yönetici girişi.
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <form action={loginAdminAction} className="space-y-4">
            <Input name="email" type="email" placeholder="admin@villawe.local" required />
            <Input name="password" type="password" placeholder="Şifre" required />
            <Button type="submit" className="w-full rounded-full py-6 text-base">
              Giriş Yap
            </Button>
          </form>

          {demoLoginEnabled ? (
            <div className="villawe-soft-block text-sm leading-7 text-muted-foreground">
              Demo giriş bilgisi: <strong>admin@villawe.local</strong> / <strong>ChangeMe123!</strong>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
