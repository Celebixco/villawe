import Link from "next/link";
import { CheckCircle2, Clock3, ShieldCheck } from "lucide-react";

import { SafeRentalAlert } from "@/components/public/safe-rental-alert";
import { SectionHeading } from "@/components/public/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/features/seo/metadata";

export const metadata = buildMetadata({
  title: "Rezervasyon Talebi | Villawe",
  description: "Rezervasyon talebi sonrası güvenli yönlendirme ve bilgilendirme akışı.",
  path: "/rezervasyon-talebi",
});

type ReservationRequestPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReservationRequestPage({
  searchParams,
}: ReservationRequestPageProps) {
  const resolved = await searchParams;
  const success = typeof resolved.success === "string" ? resolved.success : undefined;
  const villaSlug = typeof resolved.villa === "string" ? resolved.villa : undefined;

  return (
    <div className="container-shell space-y-8 py-10 sm:py-12">
      <section className="villawe-section-band villawe-gradient-band space-y-6">
        <SectionHeading
          kicker="Talep Akışı"
          title={
            success === "1"
              ? "Talebiniz güvenle alındı"
              : success === "demo"
                ? "Talep önizlemesi"
                : "Rezervasyon talep akışı"
          }
          description={
            success === "1"
              ? "Ekibimiz fiyat özeti ve müsaitlik durumunu çakışma kontrolüyle inceleyip size dönüş yapacak."
              : success === "demo"
                ? "Talep akışının önizlemesini görüntülüyorsunuz."
                : "Talep sürecinde fiyat, müsaitlik ve güvenlik adımları net biçimde ele alınır."
          }
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card className="villawe-panel">
          <CardContent className="space-y-5 p-7">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-success/12 text-success shadow-[0_18px_38px_-28px_rgba(46,157,105,0.34)]">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight">Sıradaki adımlar</h2>
              {villaSlug ? (
                <p className="text-sm text-muted-foreground">
                  Seçilen villa: <strong>{villaSlug}</strong>
                </p>
              ) : null}
            </div>
            <div className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p>1. Müsaitlik takvimi ve mevcut talepler karşılaştırılır.</p>
              <p>2. Fiyat özeti, temizlik bedeli ve depozito bilgileri tekrar doğrulanır.</p>
              <p>3. Onay öncesi yönlendirme yalnızca resmi Villawe süreci üzerinden paylaşılır.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/villa-kiralama"
                className={buttonVariants({
                  className: "rounded-full",
                })}
              >
                Tekrar villa ara
              </Link>
              <Link
                href="/iletisim"
                className={buttonVariants({
                  variant: "outline",
                  className: "rounded-full",
                })}
              >
                Destek ekibine ulaş
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card className="villawe-soft-panel">
            <CardContent className="space-y-4 p-6">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-card text-primary shadow-[0_18px_38px_-28px_rgba(18,110,130,0.24)]">
                <Clock3 className="size-5" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">Ortalama dönüş süresi</h2>
              <p className="text-sm leading-7 text-muted-foreground">
                Yoğunluk ve villa takvimine göre ekibimiz size en kısa sürede geri dönüş yapar.
              </p>
            </CardContent>
          </Card>

          <Card className="villawe-soft-panel">
            <CardContent className="space-y-4 p-6">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-card text-secondary shadow-[0_18px_38px_-28px_rgba(53,182,180,0.28)]">
                <ShieldCheck className="size-5" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">Güvenli teyit akışı</h2>
              <p className="text-sm leading-7 text-muted-foreground">
                Talep boyunca fiyat özeti ve güvenlik uyarıları görünür kalır.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <SafeRentalAlert />
    </div>
  );
}
